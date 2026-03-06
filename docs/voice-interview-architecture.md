# Provider-Backed Voice Interview — Architecture Guide

> End-to-end explanation of how the real-time voice interview system works,
> from microphone capture to spoken AI responses.

---

## Overview

The Mock Interview Bot (`MockInterviewBot.js`) supports two voice engines:

| Engine | When active | STT (Speech→Text) | TTS (Text→Speech) |
|--------|-------------|--------------------|--------------------|
| **Cloud (Deepgram)** | `NEXT_PUBLIC_DEEPGRAM_ENABLED=true` + `DEEPGRAM_API_KEY` set | WebSocket to Deepgram | REST API via server proxy |
| **Browser-native** | Fallback when Deepgram is not configured | `SpeechRecognition` API | `SpeechSynthesisUtterance` API |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
│                                                                 │
│  MockInterviewBot.js                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ startListening│    │enqueueSpeech │    │streamAssistant│      │
│  │   Provider()  │    │   Chunk()    │    │    Turn()    │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐        │
│  │deepgramSTT.ts│    │deepgramTTS.ts│    │chatClient.ts │        │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
└─────────┼───────────────────┼───────────────────┼───────────────┘
          │                   │                   │
          │ WebSocket         │ fetch             │ fetch
          │                   │                   │
┌─────────┼───────────────────┼───────────────────┼───────────────┐
│         ▼         SERVER    ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐        │
│  │/api/voice/  │    │/api/voice/  │    │  /api/chat   │        │
│  │   token     │    │    tts      │    │              │        │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
└─────────┼───────────────────┼───────────────────┼───────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
   Deepgram /v1/auth   Deepgram /v1/speak   OpenRouter LLM
```

---

## Complete Interview Flow (Step by Step)

### 1. User clicks "Voice Interview"

```
MockInterviewBot.js → startFreeformMode()
```

- Sets `mode = "freeform"`, `phase = "freeform"`
- Calls `startFreeformInterview()` which streams the opening question via LLM

### 2. LLM generates the first question

```
startFreeformInterview() → streamAssistantTurn()
```

- Sends system prompt + "ask your first question" to `/api/chat`
- As tokens stream in, they accumulate in `speechBufferRef`
- `flushSpeechBuffer()` splits text into sentence chunks
- Each chunk goes to `enqueueSpeechChunk()`

### 3. Chunks are spoken aloud (TTS)

```
enqueueSpeechChunk() → deepgramTTS.speak(text)
```

**If cloud voice (`useProviderVoice = true`):**

1. `deepgramTTS.ts` sends `POST /api/voice/tts` with `{ text }`
2. Server route proxies to Deepgram `POST https://api.deepgram.com/v1/speak`
3. Audio bytes (`audio/mpeg`) stream back to the browser
4. Browser decodes via `AudioContext.decodeAudioData()` → plays through `AudioBufferSourceNode`
5. Chunks queue sequentially — when one finishes, the next starts

**If browser-native (`useProviderVoice = false`):**

1. Creates `new SpeechSynthesisUtterance(text)` and calls `window.speechSynthesis.speak()`

### 4. After speaking finishes → listening starts

```
TTS onEnd callback → startListening()
```

**If cloud voice:**

1. `startListening()` creates a new `DeepgramSTT` instance
2. `deepgramSTT.ts` calls `POST /api/voice/token` to get a Deepgram auth token
3. Server tries `/v1/auth/grant` for a 30s JWT; falls back to the API key if that returns 403
4. Browser opens WebSocket: `wss://api.deepgram.com/v1/listen?model=nova-3&...`
5. `MediaRecorder` captures mic audio in 250ms chunks, sends them over the WebSocket
6. MIME type is auto-detected for cross-browser support (webm → ogg → mp4 → default)

**If browser-native:**

1. Calls `recognitionRef.current.start()` (browser `SpeechRecognition` API)

### 5. User speaks → transcript builds

```
Deepgram WebSocket → onTranscript(text, isFinal)
```

- **Interim results** (`isFinal = false`): displayed as live transcript in the UI
- **Final results** (`isFinal = true`): accumulated in `finalTranscriptBufferRef`
- After `USER_SPEECH_DEBOUNCE_MS` (1200ms) of silence → transcript is flushed

### 6. Transcript submitted → LLM responds

```
submitVoiceTurn(transcript) → streamAssistantTurn()
```

1. STT is stopped
2. User transcript added to `chatMessages`
3. Full conversation history sent to `/api/chat` (LLM via OpenRouter)
4. Response streams back → spoken via TTS (step 3 repeats)
5. After TTS finishes → listening restarts (step 4 repeats)

### 7. User clicks "End" → summary generated

```
endInterview() → streamAssistantTurn() with summary prompt
```

1. STT + TTS stopped
2. LLM asked to generate `OVERALL SCORE: X/10` + summary
3. Score parsed, session saved to DB via `POST /api/interview/sessions`
4. UI transitions to `phase = "complete"`

---

## File Reference

| File | Role |
|------|------|
| [`MockInterviewBot.js`](../src/components/MockInterviewBot.js) | Main component — orchestrates the interview loop, UI, state |
| [`deepgramSTT.ts`](../src/lib/deepgramSTT.ts) | Client helper — mic → Deepgram WebSocket → transcript callbacks |
| [`deepgramTTS.ts`](../src/lib/deepgramTTS.ts) | Client helper — text → server → audio → Web Audio API playback |
| [`/api/voice/token`](../src/app/api/voice/token/route.ts) | Server — issues Deepgram auth token (JWT or API key fallback) |
| [`/api/voice/tts`](../src/app/api/voice/tts/route.ts) | Server — proxies text to Deepgram `/v1/speak`, returns audio |
| [`/api/chat`](../src/app/api/chat/route.ts) | Server — LLM chat via OpenRouter (LangChain/LangGraph) |
| [`chatClient.ts`](../src/lib/chatClient.ts) | Client — SSE stream parser for `/api/chat` |

---

## Key Design Decisions

### Why server-side proxies?
The `DEEPGRAM_API_KEY` must never appear in client bundles. The `/api/voice/token` route acts as a gatekeeper — the browser only gets a token at runtime when starting a session.

### Why Deepgram?
- **$200 free credits** on sign-up (~2,000 hours of STT)
- **Sub-300ms latency** for real-time streaming STT
- **Nova-3 model** with smart formatting and endpointing
- Simple REST API for TTS (no WebSocket complexity)

### Why keep the browser-native fallback?
- Zero-cost option for users without a Deepgram key
- Works offline for TTS (browser speech synthesis)
- Controlled by `NEXT_PUBLIC_DEEPGRAM_ENABLED` env var

### Why auto-detect MediaRecorder MIME type?
Mobile Safari doesn't support `audio/webm;codecs=opus`. The code tries multiple formats (`webm` → `ogg` → `mp4` → browser default) and tells Deepgram the matching encoding.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPGRAM_API_KEY` | For cloud voice | API key from [console.deepgram.com](https://console.deepgram.com) |
| `NEXT_PUBLIC_DEEPGRAM_ENABLED` | For cloud voice | Set to `"true"` to enable cloud voice in the UI |
| `OPENROUTER_API_KEY` | Yes | Powers the LLM interviewer via `/api/chat` |

---

## Interruption & Barge-In

The user can click **"Interrupt & Answer"** while the interviewer is speaking:

```
interruptAssistantAndListen()
  → abortRef.current.abort()     // stops LLM stream
  → cancelAssistantSpeech()       // stops TTS (both provider + browser)
  → startListening()              // immediately begins STT
```

This enables natural conversational flow where the user doesn't have to wait for the AI to finish.
