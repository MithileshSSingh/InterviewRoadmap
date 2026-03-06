# Mock Interview Feature

This document explains the mock interview feature end to end, with emphasis on how [`src/components/MockInterviewBot.js`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/components/MockInterviewBot.js) works and how it interacts with the backend.

The goal is that a new developer can read this file and understand:

- where the feature is mounted
- how the UI state machine works
- how guided mode differs from freeform voice mode
- how browser-native STT/TTS is used
- how LLM streaming is wired
- how interview sessions are persisted
- what Safari/iOS special handling exists
- where to modify behavior safely

## Files Involved

Primary frontend files:

- [`src/components/MockInterviewBot.js`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/components/MockInterviewBot.js)
- [`src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js)
- [`src/app/globals.css`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/app/globals.css)

Primary backend files:

- [`src/lib/chatClient.ts`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/lib/chatClient.ts)
- [`src/app/api/chat/route.ts`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/app/api/chat/route.ts)
- [`src/app/api/interview/sessions/route.ts`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/app/api/interview/sessions/route.ts)
- [`src/lib/db.ts`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/lib/db.ts)
- [`prisma/schema.prisma`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/prisma/schema.prisma)

## Feature Overview

The mock interview feature gives topic-level interview practice in two modes:

- `guided`
  The user answers one predefined interview question at a time. Each answer is sent to the LLM for evaluation and scored.
- `freeform`
  The user participates in a conversational voice interview. The browser captures speech, converts it to text, sends that transcript to the LLM, and speaks the assistant response back using browser speech synthesis.

Both modes live in the same floating drawer component.

## Where It Is Mounted

The feature is mounted at the topic page level in [`src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js).

It receives four props:

- `topicContent`
- `topicId`
- `roadmapSlug`
- `phaseId`

`topicContent` is critical because it contains:

- `title`
- `explanation`
- `interviewQuestions`

Those fields are reused for:

- guided question rendering
- guided answer evaluation prompts
- freeform interviewer system prompts

## High-Level Architecture

The feature is intentionally split into two layers:

1. Browser/UI orchestration in `MockInterviewBot.js`
2. LLM text streaming and persistence through server routes

The component does not directly talk to an audio provider or a realtime voice backend. Instead:

- Speech-to-text is browser-native
- Text-to-speech is browser-native
- LLM generation still uses the existing `/api/chat` streaming text endpoint
- Session saving uses `/api/interview/sessions`

This means the "voice interview" is implemented as:

`speech -> transcript -> text chat request -> streamed text response -> speech synthesis`

Not as:

`raw audio stream -> realtime multimodal model`

That design choice keeps the implementation simple and reuses the existing chat stack.

## Component Responsibilities

`MockInterviewBot.js` is responsible for:

- opening and closing the floating interview drawer
- selecting guided vs freeform mode
- building prompts for the LLM
- maintaining interview UI state
- managing browser speech recognition lifecycle
- managing browser speech synthesis lifecycle
- handling interruption behavior
- handling Safari/iOS compatibility workarounds
- collecting transcript/message history
- saving the completed interview to the database

It is not responsible for:

- direct model invocation
- session querying across the app
- realtime provider orchestration
- auth logic
- Prisma client lifecycle

## Internal State Model

The component uses a mix of React state and refs.

### React State

These states drive rendering:

- `phase`
  Values: `idle | mode-select | guided | freeform | complete`
- `isOpen`
  Controls drawer visibility
- `mode`
  Values: `guided | freeform | null`

Guided mode state:

- `currentQuestionIndex`
- `userAnswer`
- `isEvaluating`
- `evaluationText`
- `parsedScore`
- `answeredQuestions`

Freeform voice mode state:

- `chatMessages`
- `isStreaming`
- `recognitionStatus`
  Usually `idle | starting | listening | processing | error | unsupported`
- `interimTranscript`
- `voiceError`
- `isAssistantSpeaking`

Completion state:

- `summary`
- `freeformFinalScore`
- `saveStatus`

### Refs

Refs are used where mutable values must survive async callbacks without re-rendering.

Important refs:

- `abortRef`
  Tracks the current LLM stream `AbortController`
- `recognitionRef`
  Holds the `SpeechRecognition` instance
- `recognitionActiveRef`
  Tracks whether speech recognition is running
- `shouldListenRef`
  Tracks whether the component should attempt to keep listening after current work finishes
- `speechQueueRef`
  Queue of assistant text chunks waiting to be spoken
- `speechBufferRef`
  Accumulates streamed tokens until they are safe to speak
- `speechActiveRef`
  Tracks whether `speechSynthesis` is currently speaking
- `chatMessagesRef`
  Always points to the latest message list for async code
- `isStreamingRef`
  Always points to the latest LLM stream state
- `phaseRef`, `modeRef`
  Prevent stale closures in speech callbacks
- `submitVoiceTurnRef`
  Lets recognition callbacks invoke the latest turn-submission logic safely

iOS/Safari-specific refs:

- `audioPermissionPrimedRef`
- `speechSynthesisPrimedRef`
- `initialRecognitionPrimedRef`
- `shouldAbortImmediatelyOnStartRef`

These exist because iOS Safari is stricter about starting audio-related APIs outside a direct user gesture.

## UI State Machine

The primary UI flow is:

1. `idle`
2. user clicks floating action button
3. `mode-select`
4. user chooses `guided` or `freeform`
5. interview runs
6. `complete`

Drawer close does not unmount the entire page, so the component must explicitly clean up:

- LLM stream
- microphone
- speech synthesis

This is why close/reset paths call:

- `abortRef.current?.abort()`
- `stopListening(...)`
- `cancelAssistantSpeech()`

## Guided Mode

Guided mode uses predefined interview questions from `topicContent.interviewQuestions`.

### Prompt Construction

When the user submits an answer, `buildGuidedEvaluationMessages()` creates a two-message prompt:

- `system`
  Contains topic, question, expected answer, and a strict response format
- `user`
  Contains the candidate's actual answer

The response format is intentionally strict:

```text
SCORE: X/10

[feedback]

KEY POINTS MISSED:
- ...
```

`parseScore()` then extracts the numeric score from the streamed response.

### Guided Request Flow

1. User types answer
2. `submitAnswer()` sends prompt via `streamChatResponse()`
3. `/api/chat` streams tokens back
4. `evaluationText` updates in real time
5. Score is parsed incrementally
6. Final result is pushed into `answeredQuestions`
7. User clicks next or finish

### Guided Persistence

When the guided interview finishes:

- the average of non-null scores is computed
- each answered question is normalized into a save payload
- `saveSession({ sessionMode: "guided" })` sends data to `/api/interview/sessions`

## Freeform Voice Mode

Freeform mode is the more complex part of the feature.

### Core Idea

The interviewer is still a text LLM, but the user experience is voice-first:

- user speaks
- browser transcribes
- transcript becomes chat input
- LLM streams a text response
- browser speaks the response

### Freeform System Prompt

`buildFreeformSystemPrompt(topicContent)` constructs the interviewer persona.

It includes:

- topic title
- a short topic explanation snippet
- sample interview questions from roadmap content
- behavioral instructions:
  - speak naturally
  - ask one question at a time
  - probe shallow answers
  - end after 5-7 questions or explicit completion
  - produce a final score in strict format

This prompt is reused for:

- first freeform turn
- every follow-up turn
- final summary request

## Browser Speech Recognition

### Support Detection

Speech recognition support is checked with:

- `window.SpeechRecognition`
- `window.webkitSpeechRecognition`

If recognition is unavailable, voice mode is disabled in the UI.

### Recognition Setup

Inside a `useEffect`, the component creates one recognition instance and attaches:

- `onstart`
- `onresult`
- `onerror`
- `onend`

Default configuration:

- `interimResults = true`
- `lang = "en-US"`
- `maxAlternatives = 1`

Special case:

- `continuous = !isIOSWebKit`

This is important because Safari iOS tends to be less reliable with `continuous = true`.

### Turn Detection

Recognition does not immediately submit every token.

Instead:

- final transcripts accumulate in `finalTranscriptBufferRef`
- interim transcripts are shown in the UI using `interimTranscript`
- a debounce timer waits `USER_SPEECH_DEBOUNCE_MS`
- once the user has stopped speaking long enough, the buffered transcript becomes a single conversational turn

This gives an "auto turn detection" experience without a custom VAD pipeline.

### Why Refs Are Used Here

Speech recognition callbacks happen outside normal React render timing. If they used only state closures, they would frequently read stale values for:

- current phase
- current messages
- whether streaming is active
- latest submit function

The refs make those callbacks stable.

## Voice Turn Submission

The function `submitVoiceTurn()` converts a completed transcript into a new assistant turn.

### What It Does

1. trims transcript
2. appends user message and assistant placeholder to `chatMessages`
3. computes `assistantIndex`
4. builds the LLM message history
5. calls `streamAssistantTurn(...)`

The assistant placeholder is important because the chat UI needs a bubble to update while the response is streaming.

### Important Implementation Detail

The component computes the next message array synchronously before streaming. This avoids the bug where the wrong assistant bubble is updated during streaming.

## Assistant Streaming

`streamAssistantTurn()` is the core function for freeform mode.

Responsibilities:

- stop microphone input before assistant response begins
- cancel any ongoing speech synthesis
- start LLM streaming via `streamChatResponse()`
- update the correct assistant bubble as tokens arrive
- buffer tokens for TTS
- chunk and speak those tokens progressively
- restart microphone listening after the assistant finishes, when appropriate

### Why It Stops Listening First

Without stopping recognition, the browser may transcribe the assistant's own spoken output and feed it back into the conversation.

This is especially problematic for browser-native speech APIs.

## Text-to-Speech Flow

The freeform mode uses browser-native `speechSynthesis`.

### Pipeline

1. streamed tokens accumulate in `speechBufferRef`
2. `splitSpeechChunks()` finds natural speaking boundaries
3. chunks are sanitized with `cleanSpeechText()`
4. chunks are queued in `speechQueueRef`
5. `SpeechSynthesisUtterance` instances speak them sequentially

### Why Chunking Exists

If the component waits for the full assistant response before speaking, the conversation feels slow.

Chunking allows the interviewer to start speaking while text is still streaming.

### Speech Sanitization

`cleanSpeechText()` strips markdown-heavy content so spoken output is more natural:

- fenced code blocks
- inline code ticks
- markdown links
- formatting characters

This matters because the assistant bubble is markdown, but spoken audio should sound like natural interview conversation.

## Interruption Behavior

The feature supports user interruption through the "Interrupt & Answer" control.

That action:

- aborts the current LLM stream
- cancels speech synthesis
- marks the assistant as interrupted
- restarts listening immediately

This is not true full-duplex audio. It is a controlled interruption model built on top of browser-native APIs.

### Why This Design Was Chosen

Browser-native speech recognition and speech synthesis are not reliable enough for always-on simultaneous speech and recognition. Explicit interruption gives a better UX without moving to a realtime provider-backed architecture.

## Safari iOS Handling

Safari on iPhone/iPad has extra restrictions.

### Problems Safari Causes

- audio APIs often must start from a direct user gesture
- speech recognition can behave inconsistently with `continuous = true`
- speech synthesis may fail unless primed
- mic permission can be more fragile

### Current Workarounds

When the user enters freeform mode on iOS WebKit:

- `primeSpeechSynthesis()` runs from the initial tap
- `primeAudioPermission()` requests microphone access early
- a warm-up recognition start/abort cycle primes the browser
- recognition runs non-continuously
- the UI shows Safari-specific messaging when relevant

This does not eliminate all Safari limitations, but it makes the feature materially more reliable on iOS.

## Session Persistence

The feature saves completed sessions to the backend.

### Save Entry Point

The frontend uses `saveSession(...)` inside `MockInterviewBot.js`.

This function normalizes different payload shapes for:

- guided sessions
- freeform sessions

### What Gets Saved

Common metadata:

- `topicId`
- `topicTitle`
- `roadmapSlug`
- `phaseId`
- `mode`
- `score`
- `summary`
- `sessionId`

Message payload:

- guided
  stores user answers, question index, score, and feedback
- freeform
  stores transcript messages as `{ role, content, source, turn }`

Anonymous persistence uses a local browser session id from `localStorage`:

- key: `cf-session-id`

Authenticated users additionally attach `userId` server-side through `auth()`.

## Backend: `/api/interview/sessions`

The route at [`src/app/api/interview/sessions/route.ts`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/app/api/interview/sessions/route.ts) handles interview persistence.

### `POST`

Used when a session is completed.

It:

- checks auth
- validates required fields
- validates mode
- validates score range
- stringifies `messages` if needed
- creates an `InterviewSession` record

### `GET`

Used to fetch prior sessions.

Selection logic:

- authenticated user -> query by `userId`
- anonymous user -> query by `x-session-id` header

### Delegate Guard

The route uses `getInterviewSessionDelegate()` instead of directly assuming `prisma.interviewSession` exists.

Reason:

- during development, a stale Prisma singleton can survive hot reload
- if the generated client changed after the dev server started, the delegate may be missing

If that happens, the route returns a clear `503` instead of throwing.

## Backend: Prisma Client Lifecycle

The Prisma singleton lives in [`src/lib/db.ts`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/lib/db.ts).

It uses:

- `@prisma/adapter-libsql`
- generated client from `src/generated/prisma`

Important behavior:

- `hasExpectedDelegates()` checks whether the global cached client still has expected delegates like `bookmark` and `interviewSession`
- if not, a new client is created

This was added because the interview feature introduced a new Prisma model and stale dev-server globals caused missing delegate crashes.

## Backend: `InterviewSession` Model

The persistence model is defined in [`prisma/schema.prisma`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/prisma/schema.prisma).

Important fields:

- `topicId`
- `topicTitle`
- `roadmapSlug`
- `phaseId`
- `mode`
- `score`
- `summary`
- `messages`
- `sessionId`
- `userId`
- `completedAt`
- `createdAt`

Notable design choice:

- `messages` is stored as a single JSON string, not normalized relational rows

That keeps the current implementation simple, but it also means:

- querying inside message content is difficult
- analytics on message-level events would require parsing JSON later

## Backend: `/api/chat`

The freeform and guided LLM flows both rely on the generic chat endpoint in [`src/app/api/chat/route.ts`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/app/api/chat/route.ts).

This route:

- validates the incoming `{ messages }` payload
- converts messages into LangChain message objects
- invokes the configured OpenRouter model via `ChatOpenAI`
- streams token events back over SSE

The stream event format is:

- `token`
- `done`
- `error`

Events are base64-encoded JSON inside SSE `data:` frames.

## Frontend: `streamChatResponse()`

The frontend helper lives in [`src/lib/chatClient.ts`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/lib/chatClient.ts).

It abstracts:

- building request payloads
- production base64 encoding
- SSE parsing
- token accumulation
- error handling
- abort behavior

This abstraction is why `MockInterviewBot.js` never manually parses event-stream bytes.

Instead it just provides:

- `messages`
- `signal`
- `onToken`

## Styling

The interview UI styles live in [`src/app/globals.css`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/src/app/globals.css).

The styles cover:

- floating action button
- drawer shell and backdrop
- guided mode UI
- freeform voice status panel
- transcript preview
- summary state

The voice-specific classes include:

- `.interview-voice-panel`
- `.interview-voice-status-row`
- `.interview-voice-indicator`
- `.interview-voice-action-btn`
- `.interview-voice-transcript`

If the component structure changes, these selectors will likely need to change too because the UI is not isolated in a CSS module.

## End-to-End Flow Summary

### Guided Mode

```text
User types answer
-> submitAnswer()
-> streamChatResponse()
-> POST /api/chat
-> model streams evaluation
-> parseScore()
-> answeredQuestions updated
-> finishGuided()
-> POST /api/interview/sessions
-> Prisma create InterviewSession
```

### Freeform Voice Mode

```text
User starts voice interview
-> startFreeformInterview()
-> stream assistant opening via /api/chat
-> assistant text streams into bubble
-> text chunks are spoken with speechSynthesis
-> microphone starts listening
-> browser produces transcript
-> debounce final transcript
-> submitVoiceTurn()
-> streamAssistantTurn()
-> /api/chat streams next response
-> assistant speaks response
-> repeat
-> endInterview()
-> final summary request to /api/chat
-> saveSession()
-> POST /api/interview/sessions
```

## Extension Points

If a new developer needs to modify behavior, these are the main places.

### Change the interviewer behavior

Edit:

- `buildGuidedEvaluationMessages()`
- `buildFreeformSystemPrompt()`

### Change turn detection sensitivity

Edit:

- `USER_SPEECH_DEBOUNCE_MS`

### Change how assistant audio starts sooner or later

Edit:

- `splitSpeechChunks()`
- `cleanSpeechText()`
- `enqueueSpeechChunk()`

### Change persistence payload

Edit:

- `saveSession(...)`
- `/api/interview/sessions`
- `InterviewSession` model if schema changes are needed

### Replace browser-native audio with provider-backed audio later

The document backlog entry is in:

- [`TODOs.md`](/Users/zinka/AI_Projects/Learning/javascript-roadmap/TODOs.md)

The likely future refactor would replace:

- `SpeechRecognition`
- `speechSynthesis`

with:

- provider-backed STT
- provider-backed TTS
- possibly a dedicated realtime transport

The rest of the feature can remain conceptually similar:

- conversation state
- chat history
- persistence
- completion summary

## Known Limitations

- Browser-native speech APIs are inconsistent across browsers.
- Safari iOS is especially fragile.
- This is not a true low-latency duplex voice architecture.
- Spoken output is derived from streamed text, so audio timing is approximate.
- Message history is stored as JSON text, which is simple but not analytics-friendly.
- Guided and freeform logic are currently combined in one large component, which increases cognitive load.

## Refactor Opportunities

If this feature grows further, the best refactors would be:

1. Extract browser voice logic into a dedicated hook, for example `useVoiceInterviewSession`.
2. Split guided mode and freeform mode into separate child components.
3. Move prompt builders into a separate utility file.
4. Move transcript/message normalization into a shared save helper.
5. Introduce a provider-backed voice layer for production reliability.

## Debugging Checklist

If a developer sees failures, start here.

### Voice mode not available

Check:

- does the browser expose `SpeechRecognition` or `webkitSpeechRecognition`
- is `speechSynthesis` available
- is the page loaded over `https`

### Voice mode works on Chrome but not iPhone Safari

Check:

- microphone permission
- Safari version
- whether Siri/Dictation is enabled on iOS
- whether the initial user gesture actually reached `startFreeformMode()`

### Assistant text appears but no speech

Check:

- `speechSynthesis` availability
- whether `cleanSpeechText()` removed all content
- whether `speechQueueRef` is being populated
- whether the browser voice list is empty

### Session save fails

Check:

- `/api/interview/sessions`
- Prisma client generation
- dev server restart after schema changes
- database migration status

### Wrong assistant bubble updates while streaming

Check:

- `assistantIndex` calculation in `submitVoiceTurn()`
- `assistantIndex` calculation in `endInterview()`

## Final Notes

The feature currently prioritizes product iteration speed and reuse of the existing chat infrastructure over perfect voice architecture. That tradeoff is reasonable for the current project stage, but the code already points toward the next step:

- keep the interview orchestration logic
- eventually replace browser-native voice plumbing with a provider-backed realtime implementation

Until then, `MockInterviewBot.js` is the orchestration center for the entire mock interview experience.
