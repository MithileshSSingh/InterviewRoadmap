# MockInterviewBot Architecture & Implementation Guide

Welcome to the `MockInterviewBot` documentation! This guide provides an end-to-end breakdown of the mock interview feature's architecture, state management, and orchestration logic. If you are a new developer joining the team, this document will help you understand how the bot works under the hood.

## 1. High-Level Architecture

The mock interview feature was recently refactored to move away from a monolithic "fat component" approach into a clean **Model-View-Controller (MVC)** and **Container-Presentational** architecture. It utilizes **Legend State** for highly optimized, fine-grained reactivity.

The system is split into five core files located in `src/components/mock-interview/` (with the entry point in `src/components/`):

1. **`MockInterviewBot.js` (The Container / Thin Wrapper)**
2. **`mockInterviewStore.js` (The Model / State Management)**
3. **`useMockInterviewController.js` (The Controller / Business Logic)**
4. **`MockInterviewBotView.js` (The View / UI)**
5. **`mockInterviewUtils.js` (Pure Utilities)**

---

## 2. Component Breakdown

### A. The Entry Point (`MockInterviewBot.js`)
This is a thin wrapper that orchestrates the initialization. 
- It detects browser capabilities (`hasSpeechRecognition`, `hasSpeechSynthesis`, `isIOSWebKit`).
- It lazily initializes a **scoped Legend State store** via a `useState` lazy-initializer. Creating a new store instance per component mount prevents state leakage if multiple instances of the bot exist.
- It initializes the controller hook and passes the state, actions, and props down to the `MockInterviewBotView`.

### B. State Management (`mockInterviewStore.js`)
We use `@legendapp/state` instead of native React `useState` to avoid cascading re-renders in a highly complex component.
- **Factory Pattern**: The `createMockInterviewStore` function returns a fresh Legend State `observable`.
- **State Domains**: The store is organized into logical domains:
  - `ui`: Manages drawer open state, interview phase (`mode-select`, `guided`, `freeform`, `complete`), and save status.
  - `guided`: Manages the state for the guided Q&A portion (current question, evaluation text, parsed scores, etc.).
  - `freeform`: Manages the live chat transcript `chatMessages`, user input, and AI summary.
  - `voice`: Tracks the microphone's `recognitionStatus`, the interviewer's speech state, and any hardware/permission errors.

### C. The Controller (`useMockInterviewController.js`)
This massive hook encapsulates **all imperative logic and side-effects**. It never returns JSX. It returns `actions` (functions the UI can trigger) and mutates the `store$` directly.
- **Hooks & Refs**: It holds React `useRef`s for non-serializable browser APIs (e.g., `AbortController`, timers, native `SpeechRecognition` instances, `speechSynthesis` queues). 
- **Streaming Orchestration (`streamAssistantTurn`)**: When the user submits an answer, this talks to `@/lib/chatClient.ts`. It reads the token stream and directly mutates the `content` of the specific chat message deep within the Legend State array proxy.
- **Microphone & Speech-To-Text (STT)**: Uses native `webkitSpeechRecognition` to capture user audio, apply a debounce (to wait for the user to pause), and automatically submit the chunk to the AI.
- **Text-To-Speech (TTS)**: Enqueues text chunks from the AI stream and uses `SpeechSynthesisUtterance` to speak them out loud sequentially.
- **Persistence (`saveSession`)**: Pushes completed interview metadata and transcripts to the database via `/api/interview/sessions`.

### D. The View (`MockInterviewBotView.js`)
A purely presentational file wrapped in Legend State's `observer` HOCs.
- It splits the complex UI into semantic sub-components: `ModeSelectView`, `GuidedInterviewView`, `FreeformInterviewView`, and `InterviewCompleteView`.
- **Optimized Array Rendering**: In the `FreeformInterviewView`, it uses Legend State's `<For optimized>` component to render the `chatMessages` array. This ensures that as the AI streams tokens, *only the specific `<ChatBubble>` updates*, rather than re-rendering the entire chat history frame-by-frame. 
- The views read from the store using `.get()` and trigger business logic by calling `actions.*`.

### E. Utilities (`mockInterviewUtils.js`)
Contains pure functions to keep the controller clean.
- System prompt builders (`buildFreeformSystemPrompt`, `buildGuidedEvaluationMessages`).
- Regex parsers to extract scores out of markdown text (`parseScore`).
- Markdown to HTML renderers (`renderMarkdown`).
- Speech string cleaners to strip markdown syntax before TTS reads it aloud (`cleanSpeechText`, `splitSpeechChunks`).

---

## 3. End-to-End Workflows

### Guided Mode Flow
1. User clicks "Mock Interview" -> Dialog Opens (Phase: `mode-select`).
2. User selects **Guided Q&A** (Phase moves to `guided`).
3. View displays `questions[currentQuestionIndex]`.
4. User types an answer in the `<textarea>` and hits "Submit".
5. Controller triggers `actions.submitAnswer()`, sets `isEvaluating = true`.
6. Controller streams the AI's grading response, mutating `store$.guided.evaluationText`.
7. Once finished, the score is parsed, and the user clicks "Next Question".
8. When all questions are answered, Phase moves to `complete` and `saveSession` fires automatically.

### Freeform Voice Mode Flow
1. User selects **Voice Interview** (Phase moves to `freeform`).
2. Controller requests Mic permissions and "primes" the TTS engine (required for iOS Safari).
3. Controller injects the initial system prompt and asks the AI to start the interview.
4. AI streams the intro. Controller reads tokens, builds a `speechBufferRef`, splits on sentence boundaries, and feeds chunks to TTS (`SpeechSynthesisUtterance`).
5. **Mic Handoff**: When the AI TTS `onend` fires for the final chunk, the controller automatically fires `startListening()`, activating the user's mic.
6. User speaks. `recognition.onresult` updates the `interimTranscript` string. 
7. User pauses. A 1200ms debounce timer triggers, stops the mic, and submits the finalized transcript to the AI.
8. Loop repeats until the user clicks "End" or the AI decides the interview is finished.

---

## 4. Known Browser Quirks & Edge Cases Handled

Speech APIs are notoriously inconsistent across browsers. This controller is battle-tested against several known issues:

1. **Chrome / Chromium TTS Garbage Collection Bug**:
   Native Chrome has a ten-year-old bug where `SpeechSynthesisUtterance` objects are garbage-collected by the V8 engine mid-speech if they aren't bound to the `window` scope. This causes the `onend` event to vanish, freezing the interview.
   - *Fix applied*: `keepUtteranceAlive()` pushes the active utterance to a global `window.__speechUtterances` array, and `clearUtterance()` removes it securely on `onend`.
   - *Secondary Watchdog*: The controller also mounts a `setInterval` watchdog when TTS begins. If Chrome drops the event anyway but `window.speechSynthesis.speaking` is false, it forces the `onend` sequence.

2. **iOS WebKit (Safari) Mic Suspension**:
   Safari on iPhones/iPads requires explicit user gestures for almost all Web Audio/Speech actions. It also kills active microphones aggressively.
   - *Fix applied*: We identify Safari using `isIOSWebKitBrowser()`. 
   - We disable `recognition.continuous = true` (which iOS hates) and fall back to single-burst mode.
   - We utilize a 250ms delayed timeout to re-arm the microphone between API bursts.

3. **React 19 Ref Strictness**:
   React 19's linting strictly prohibits accessing generic `.current` ref values *during the render phase* (e.g., executing `storeRef.current` inside the function body). 
   - *Fix applied*: We use React 19's `const [store$] = useState(() => factoryInit())` lazy initialization pattern in the container instead of `useRef`.

## 5. Summary for New Devs
When fixing bugs or adding features to this module:
- **UI Changes**: Look at `MockInterviewBotView.js`.
- **State/Variables**: Look at `mockInterviewStore.js` (to add a variable) or use `store$.path.to.var.get()` in the View, or `.peek()` in the Controller.
- **Logic & API Calls**: Look at `useMockInterviewController.js`. Keep DOM refs localized to the view, and pass raw data / events up to the actions object!
