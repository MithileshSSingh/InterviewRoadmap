# MockInterviewBot End-to-End Implementation Guide

This document explains the current `MockInterviewBot` implementation end to end. It is written for a new developer joining the project who needs to understand how the feature is assembled, how data and control move through the system, where persistence happens, and which parts are safe or risky to change.

This guide describes the refactored architecture now present in the codebase:

- `src/components/MockInterviewBot.js`
- `src/components/mock-interview/mockInterviewStore.js`
- `src/components/mock-interview/useMockInterviewController.js`
- `src/components/mock-interview/MockInterviewBotView.js`
- `src/components/mock-interview/mockInterviewUtils.js`
- `src/lib/chatClient.ts`
- `src/app/api/interview/sessions/route.ts`

## 1. What the Feature Does

`MockInterviewBot` gives the user two ways to practice interview questions for a topic page:

1. Guided Q&A
   The bot shows one predefined interview question at a time from `topicContent.interviewQuestions`. The user answers in text, the answer is evaluated by the LLM, and the bot gives a score and feedback.

2. Freeform interview
   The bot runs a live interviewer-style conversation. The user can type responses, or if the browser supports native speech APIs, the user can talk and the interviewer can speak back.

At the end of either mode, the session can be saved to the `InterviewSession` table through `/api/interview/sessions`.

## 2. Where It Lives in the Product

The feature is mounted on the roadmap topic page:

- `src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js`

That page renders:

- `TopicChatBot`
- `MockInterviewBot`

The interview bot receives:

- `topicContent`
- `topicId`
- `roadmapSlug`
- `phaseId`
- `onOpenChange`

`topicContent` is the core payload. It provides:

- `title`
- `explanation`
- `interviewQuestions`

The component does not fetch topic data itself. It assumes the parent has already resolved the correct topic object.

## 3. High-Level Architecture

The current design intentionally splits responsibilities into four layers.

### 3.1 Wrapper: `MockInterviewBot.js`

This file is the thin composition layer.

Responsibilities:

- detects browser capabilities
- creates one scoped store instance per component instance
- wires props into the controller
- renders the view

Important behavior:

- The store is created with `useState(() => createMockInterviewStore(...))`, not inline.
- That prevents recreating the store on every render.
- Recreating the store would reset the entire interview session and break all observer subscriptions.

### 3.2 Store: `mockInterviewStore.js`

This file defines the state shape using `@legendapp/state`.

The store has four groups:

- `ui`
- `guided`
- `freeform`
- `voice`

This separation is deliberate. It keeps mode-specific state isolated and makes it easier to reason about which parts of the UI should react to which state transitions.

### 3.3 Controller: `useMockInterviewController.js`

This is the brain of the feature.

Responsibilities:

- all async work
- all speech recognition lifecycle handling
- all speech synthesis lifecycle handling
- all LLM streaming
- all mode transitions
- all persistence
- cleanup on close and unmount

The controller returns an `actions` object consumed by the view.

### 3.4 View: `MockInterviewBotView.js`

This is the presentational layer.

Responsibilities:

- renders the drawer UI
- renders mode select, guided, freeform, and complete screens
- binds UI events to controller actions
- reads observable state reactively

Important rule:

- Any component that reads Legend state with `.get()` must be wrapped in `observer(...)`.
- This matters because a recent refactor regression happened when subviews were plain React components. State changed in the store, but the UI did not re-render correctly.

### 3.5 Shared Utilities: `mockInterviewUtils.js`

This file contains stateless helpers:

- markdown rendering
- score parsing
- prompt builders
- browser capability detection
- speech text cleanup
- speech chunking
- speech synthesis retention helpers
- human-readable voice error normalization

## 4. State Model

The store is intentionally explicit. A new developer should understand this shape before changing behavior.

### 4.1 `ui`

`ui.phase`

- `"idle"`
- `"mode-select"`
- `"guided"`
- `"freeform"`
- `"complete"`

`ui.mode`

- `null`
- `"guided"`
- `"freeform"`

`ui.isOpen`

- whether the drawer is visible

`ui.saveStatus`

- `"idle"`
- `"saving"`
- `"saved"`
- `"error"`

### 4.2 `guided`

- `currentQuestionIndex`
- `userAnswer`
- `isEvaluating`
- `evaluationText`
- `parsedScore`
- `answeredQuestions`

`answeredQuestions` stores the complete per-question review data used for summary and persistence.

### 4.3 `freeform`

- `chatMessages`
- `typedInput`
- `summary`
- `freeformFinalScore`
- `isStreaming`

`chatMessages` is the canonical conversation transcript used by the UI and by persistence.

### 4.4 `voice`

- `recognitionStatus`
- `interimTranscript`
- `voiceError`
- `isAssistantSpeaking`
- `hasSpeechRecognition`
- `hasSpeechSynthesis`
- `isVoiceSupported`
- `isIOSWebKit`

`recognitionStatus` is the main UI state for the voice panel.

Possible values in practice:

- `"unsupported"`
- `"idle"`
- `"starting"`
- `"listening"`
- `"processing"`
- `"error"`

## 5. Reactivity Model: `.get()` vs `.peek()`

This is one of the most important implementation details.

Legend State is used in two different ways:

1. View code uses `.get()`
   This subscribes the component to changes.

2. Controller code uses `.peek()`
   This reads current state without creating reactive subscriptions.

That division is intentional.

Why it matters:

- The controller is imperative and event-driven.
- It should not rerender or resubscribe just because state changes.
- The view must rerender when observable state changes.

If a developer accidentally replaces `.peek()` with `.get()` inside the controller, effects and callbacks can become harder to reason about.

If a developer reads store state with `.get()` inside a non-`observer` component, the UI can become stale or flicker because the component is not actually subscribed.

## 6. End-to-End Flow: Component Startup

### Step 1. Parent page renders `MockInterviewBot`

The topic page passes topic metadata and identifiers into the wrapper component.

### Step 2. Wrapper detects capabilities

`MockInterviewBot.js` checks:

- speech recognition availability via `getSpeechRecognitionCtor()`
- speech synthesis availability via `"speechSynthesis" in window`
- iOS WebKit via `isIOSWebKitBrowser()`

### Step 3. Wrapper creates a scoped store

`createMockInterviewStore(...)` receives capability flags and `hasGuidedContent`.

This store is specific to one mounted bot instance.

### Step 4. Wrapper creates controller actions

`useMockInterviewController(...)` receives:

- the store
- topic metadata
- route identifiers
- `onOpenChange`

### Step 5. View renders from store state

`MockInterviewBotView` decides which subview to render based on `store$.ui.phase`.

## 7. UI Structure

The UI is a drawer opened from a floating action button labeled `Practice Interview`.

The drawer contains:

- header
- mode-selection screen
- guided interview screen
- freeform interview screen
- completion screen

The header also conditionally shows an `End` button during freeform mode.

## 8. Guided Mode: Full Lifecycle

Guided mode is the simpler path.

### 8.1 Entry

`actions.startGuidedMode()`:

- sets `ui.mode = "guided"`
- sets `ui.phase = "guided"`

### 8.2 Rendering

`GuidedInterviewView` shows:

- progress bar
- current question text
- question type badge if present
- textarea for answer
- submit button
- evaluation box after scoring

### 8.3 Submission

`submitAnswer()` in the controller:

1. reads `guided.userAnswer`
2. exits if empty or already evaluating
3. builds an evaluation prompt using `buildGuidedEvaluationMessages(...)`
4. calls `streamChatResponse(...)`
5. streams the evaluation text into `guided.evaluationText`
6. parses score with `parseScore(...)`
7. appends a record into `guided.answeredQuestions`

The prompt explicitly asks the model to return:

- `SCORE: X/10`
- feedback text
- missed key points

The score parser depends on that format.

### 8.4 Advancing

`advanceGuided()`:

- increments `currentQuestionIndex`
- clears answer and evaluation state

If there are no more questions:

- `finishGuided()` sets `ui.phase = "complete"`
- `saveSession({ sessionMode: "guided" })` persists the session

### 8.5 Guided completion

The completion screen shows:

- average score across answered questions
- mini review rows for each question
- save state
- restart button

## 9. Freeform Mode: Full Lifecycle

Freeform mode is a live interviewer loop built on LLM streaming plus optional browser speech APIs.

### 9.1 Entry

`startFreeformMode()` does four things:

1. handles iOS/Safari-specific priming if voice is supported
2. sets `ui.mode = "freeform"`
3. sets `ui.phase = "freeform"`
4. calls `startFreeformInterview()`

### 9.2 iOS/Safari priming

If the browser is iOS WebKit and voice is supported, the controller:

- primes speech synthesis with a muted utterance
- asks for microphone permission using `getUserMedia`
- performs a one-time recognition warm-up via `shouldAbortImmediatelyOnStartRef`

This logic exists because iOS Safari is stricter about speech activation timing and permission state.

### 9.3 Opening prompt

`startFreeformInterview()`:

1. inserts an empty assistant bubble into `freeform.chatMessages`
2. builds the freeform system prompt with `buildFreeformSystemPrompt(...)`
3. sends an opening instruction asking the model to introduce itself and ask the first question
4. calls `streamAssistantTurn(...)`

### 9.4 System prompt design

The freeform prompt includes:

- topic title
- truncated topic explanation
- sample interview questions from roadmap content
- instructions to ask one question at a time
- instructions to conclude with `OVERALL SCORE: X/10`

This is the core contract for the freeform interview behavior.

## 10. `streamAssistantTurn(...)`: The Core Freeform Orchestrator

This method is the most important function in the controller.

Responsibilities:

- stop listening while the assistant is responding
- cancel any existing speech output
- mark the conversation as streaming
- stream tokens from `/api/chat`
- update the current assistant message incrementally
- feed tokens into speech chunking for TTS
- decide whether listening should resume after the turn

Detailed flow:

1. `stopListening("processing")`
2. `cancelAssistantSpeech()`
3. clear speech buffer
4. set `freeform.isStreaming = true`
5. call `streamChatResponse(...)`
6. for each token:
   - update `chatMessages[assistantIndex].content`
   - append token to `speechBufferRef`
   - flush chunkable speech text
7. when stream completes:
   - set `freeform.isStreaming = false`
   - finalize assistant message content
   - flush remaining speech text
   - optionally resume listening

This function is used by:

- `startFreeformInterview()`
- `submitVoiceTurn()`
- `submitTypedMessage()`
- `endInterview()`

## 11. Typed Freeform Flow

When the user types an answer:

1. `submitTypedMessage(text)` validates input
2. appends a user message to `freeform.chatMessages`
3. appends an empty assistant message placeholder
4. builds API messages using:
   - one `system` prompt
   - prior conversation turns
5. calls `streamAssistantTurn(...)`

If voice is supported, listening is resumed after the assistant finishes.

If voice is not supported, the bot still works fully as a typed chat experience.

## 12. Voice Freeform Flow

Voice mode is the most complex part of the feature.

### 12.1 Browser APIs used

- `SpeechRecognition` or `webkitSpeechRecognition`
- `speechSynthesis`
- `SpeechSynthesisUtterance`
- `navigator.mediaDevices.getUserMedia`

### 12.2 Recognition setup

The controller creates one recognition instance inside a `useEffect`.

Configuration:

- `continuous = !isIOSWebKit`
- `interimResults = true`
- `lang = "en-US"`
- `maxAlternatives = 1`

### 12.3 Recognition start

`startListening()` refuses to start if:

- voice is unsupported
- phase is not `freeform`
- interview is complete
- assistant stream is active
- assistant is still speaking
- recognition is already active

If allowed:

- `shouldListenRef.current = true`
- `voiceError` is cleared
- `recognitionStatus = "starting"`
- `recognition.start()` is called

### 12.4 Recognition events

`onstart`

- marks recognition active
- sets `recognitionStatus = "listening"`
- clears `voiceError`

`onresult`

- collects interim and final transcript pieces
- stores interim text in `voice.interimTranscript`
- debounces final transcript flush using `USER_SPEECH_DEBOUNCE_MS`
- when the user pauses long enough:
  - clears interim text
  - calls `stopListening("processing")`
  - submits the voice turn through `submitVoiceTurnRef.current`

`onerror`

- maps native recognition error codes through `normaliseVoiceError(...)`
- sets `recognitionStatus = "error"`
- for terminal failures such as `network`, `audio-capture`, permission denial, or unsupported language, disables auto-relisten by setting `shouldListenRef.current = false`

`onend`

- if the controller still expects listening and the assistant is neither streaming nor speaking, it auto-restarts recognition after `250ms`
- otherwise it falls back to `idle`
- it preserves the `error` state instead of clearing it immediately

### 12.5 Voice turn submission

`submitVoiceTurn(transcript)` works almost the same as typed submission:

1. append user message
2. append empty assistant placeholder
3. build `system + conversation` request payload
4. call `streamAssistantTurn(...)`
5. resume listening after the assistant finishes

## 13. Assistant Speech Pipeline

The interviewer can speak responses via speech synthesis.

### 13.1 Why token chunking exists

The LLM streams one token at a time. Speaking one token at a time would be unusable.

So the controller:

- accumulates raw streamed text in `speechBufferRef`
- splits it into sentence-like chunks via `splitSpeechChunks(...)`
- enqueues those chunks
- speaks them one utterance at a time

### 13.2 Why utterances are kept alive globally

Chrome can garbage-collect `SpeechSynthesisUtterance` objects early if nothing holds a strong reference to them.

The helpers:

- `keepUtteranceAlive`
- `clearUtterance`
- `clearAllUtterances`

exist to prevent silent mid-speech failures and missing `onend` events.

### 13.3 Handoff from TTS back to mic

This area is fragile and recently caused regressions.

Current behavior:

- the controller tracks whether assistant speech is active
- duplicate utterance completion is guarded
- iOS WebKit resumes listening with a slight delay
- the Chrome watchdog that simulates `onend` is skipped on iOS WebKit

Reason:

- iOS Safari is sensitive to speech-synthesis and speech-recognition overlap
- reopening recognition too early can produce false `network`-style recognition failures

### 13.4 Interrupting the interviewer

`interruptAssistantAndListen()` allows a user to barge in:

- aborts the active model stream
- cancels current speech synthesis
- clears streaming state
- flips `shouldListenRef.current = true`
- reopens the mic

This is only relevant in freeform voice mode.

## 14. Finishing the Interview

Freeform completion is separate from guided completion.

`endInterview()`:

1. aborts active stream
2. stops listening
3. cancels assistant speech
4. filters out empty assistant placeholders from the conversation
5. appends a new blank assistant message
6. asks the model for a final assessment using the required `OVERALL SCORE: X/10` format
7. streams that summary through `streamAssistantTurn(...)`
8. parses final score with `parseFreeformScore(...)`
9. sets:
   - `freeform.summary`
   - `freeform.freeformFinalScore`
   - `ui.phase = "complete"`
10. persists the session

The completion screen then shows:

- final summary
- overall score
- save/retry state
- restart button

## 15. Persistence Path

Persistence happens through:

- `saveSession(...)` in the controller
- `/api/interview/sessions` in `src/app/api/interview/sessions/route.ts`

### 15.1 Frontend payload shape

The controller sends:

- `topicId`
- `topicTitle`
- `roadmapSlug`
- `phaseId`
- `mode`
- `score`
- `summary`
- `messages`
- `sessionId`

`sessionId` is always present.

If the user is anonymous:

- `getOrCreateSessionId()` generates and caches a client-side ID in `localStorage` under `cf-session-id`

If the user is authenticated:

- the backend still accepts the body `sessionId`
- but also associates the record with `userId`

### 15.2 Guided session storage

Guided mode stores a synthetic message list derived from `answeredQuestions`.

Each entry contains:

- user answer
- score
- feedback
- question index

### 15.3 Freeform session storage

Freeform mode stores a transcript-like message list derived from `freeform.chatMessages`.

It is capped at `MAX_SAVED_FREEFORM_MESSAGES`.

Each entry contains:

- role
- content
- source
- turn

### 15.4 Backend route behavior

`POST /api/interview/sessions`:

- authenticates the user if possible
- validates required fields
- validates `mode`
- validates score range
- stringifies `messages`
- inserts a row into `InterviewSession`

`GET /api/interview/sessions`:

- fetches sessions by `userId` if authenticated
- otherwise fetches by `x-session-id`

### 15.5 Database model

The Prisma model is `InterviewSession` in `prisma/schema.prisma`.

It stores:

- topic metadata
- route metadata
- mode
- score
- summary
- serialized messages
- anonymous `sessionId`
- optional authenticated `userId`
- timestamps

## 16. Chat Streaming Path

The interview bot does not call the LLM directly.

Instead it uses:

- `streamChatResponse(...)` from `src/lib/chatClient.ts`

That client:

1. `POST`s to `/api/chat`
2. reads an SSE stream from the response body
3. decodes base64 event payloads
4. reconstructs the assistant message token by token
5. invokes the provided `onToken(token, fullContent)` callback

Return statuses:

- `ok`
- `aborted`
- `error`

This abstraction is why the controller only deals with logical streaming events rather than manually parsing raw event-stream bytes.

## 17. Drawer Open/Close Lifecycle

### `handleOpen()`

- opens the drawer
- if phase was `idle` or `complete`, resets state and shows mode selection

### `handleClose()`

- aborts any active LLM request
- stops listening
- cancels assistant speech
- closes the drawer

### `resetState(fullReset)`

Clears all mode-specific state and puts the feature back into a clean session state.

Important:

- `fullReset(true)` also clears `ui.mode`
- `fullReset(false)` keeps the user inside the feature flow and is used during some open transitions

### Escape handling

When the drawer is open, pressing `Escape` triggers the same cleanup path as closing manually.

## 18. Tests That Exist Today

There are targeted tests around the refactored implementation:

- `src/components/__tests__/MockInterviewBotView.test.jsx`
- `src/components/__tests__/useMockInterviewController.test.jsx`

These currently protect against two important regressions:

1. View reactivity regression
   The freeform UI must leave the stale `Interviewer is thinking.` state when streaming ends.

2. Recognition retry-loop regression
   The controller must not auto-restart the mic indefinitely after a terminal recognition error such as `network`.

If you extend the feature, add narrow tests at the controller or view level first. Avoid relying only on manual browser verification.

## 19. Safe Modification Guide

If you need to change behavior, use this map.

### Change UI or layout

Edit:

- `src/components/mock-interview/MockInterviewBotView.js`

Do not move store-reading UI into non-`observer` components.

### Change business logic or flow

Edit:

- `src/components/mock-interview/useMockInterviewController.js`

Examples:

- when the mic should start
- how end-of-interview summary works
- when save happens
- how interruptions work

### Change state shape

Edit:

- `src/components/mock-interview/mockInterviewStore.js`

If you add state, also update:

- controller reads/writes
- view subscriptions
- reset logic

### Change prompts or parsing rules

Edit:

- `src/components/mock-interview/mockInterviewUtils.js`

Be careful:

- `parseScore()` depends on the guided evaluation response format
- `parseFreeformScore()` depends on the final summary format

### Change persistence or query behavior

Edit:

- `src/app/api/interview/sessions/route.ts`
- `prisma/schema.prisma` if the data model changes

## 20. Important Invariants

These are the rules most likely to be broken by a refactor.

1. The store must be created once per bot instance.

2. Store-reading view components must be `observer(...)` components.

3. Controller logic should use `.peek()` unless it intentionally needs a reactive read.

4. The controller must stop recognition before streaming the assistant response.

5. The controller must not reopen the mic while the assistant is still speaking.

6. The assistant placeholder message must exist before streaming starts, otherwise token updates have nowhere to render.

7. Guided scoring and freeform final scoring depend on strict output formats.

8. Anonymous persistence depends on a stable client-side `sessionId`.

9. iOS WebKit needs special treatment for speech synthesis and speech recognition handoff.

## 21. Common Failure Modes and Debugging Tips

### Symptom: UI stays on `Interviewer is thinking.`

Likely causes:

- the view is not observing store updates
- `freeform.isStreaming` is never cleared

Check:

- `MockInterviewBotView.js`
- `streamAssistantTurn(...)`

### Symptom: mic status flickers between live and error

Likely causes:

- recognition is auto-restarting after a terminal error
- TTS-to-mic handoff is happening too early on iOS/Safari

Check:

- `recognition.onerror`
- `recognition.onend`
- `enqueueSpeechChunk()`

### Symptom: assistant speech stops mid-sentence

Likely causes:

- utterance object lost
- `onend` never fired

Check:

- `keepUtteranceAlive`
- `clearUtterance`
- speech watchdog logic

### Symptom: guided score is always null

Likely causes:

- model response format drifted away from `SCORE: X/10`

Check:

- `buildGuidedEvaluationMessages(...)`
- `parseScore(...)`

### Symptom: final freeform score is null

Likely causes:

- model response format drifted away from `OVERALL SCORE: X/10`

Check:

- `endInterview()`
- `buildFreeformSystemPrompt(...)`
- `parseFreeformScore(...)`

### Symptom: session save fails in development

Likely causes:

- Prisma client not regenerated
- `InterviewSession` delegate unavailable

Check:

- `src/app/api/interview/sessions/route.ts`
- Prisma generation status

## 22. Suggested Mental Model

If you are new to this code, think about the feature like this:

- `MockInterviewBot.js` creates the world
- `mockInterviewStore.js` holds the truth
- `useMockInterviewController.js` moves the truth forward
- `MockInterviewBotView.js` renders the truth
- `mockInterviewUtils.js` keeps low-level logic out of the controller
- `chatClient.ts` is the LLM transport
- `/api/interview/sessions` is the persistence boundary

That mental split is the best way to navigate the code without getting lost.

## 23. File Reference Index

- `src/components/MockInterviewBot.js`
- `src/components/mock-interview/mockInterviewStore.js`
- `src/components/mock-interview/useMockInterviewController.js`
- `src/components/mock-interview/MockInterviewBotView.js`
- `src/components/mock-interview/mockInterviewUtils.js`
- `src/components/__tests__/MockInterviewBotView.test.jsx`
- `src/components/__tests__/useMockInterviewController.test.jsx`
- `src/lib/chatClient.ts`
- `src/app/api/interview/sessions/route.ts`
- `prisma/schema.prisma`

## 24. Summary

`MockInterviewBot` is not a simple chat widget. It is a coordinated system with:

- a scoped state store
- a controller with async orchestration
- a reactive view layer
- browser speech APIs
- streaming LLM responses
- persistence to Prisma

The most important areas to respect are:

- Legend observer boundaries
- speech-recognition and speech-synthesis handoff
- strict prompt/score contracts
- store lifetime and reset behavior

If those contracts remain intact, the feature is straightforward to extend.
