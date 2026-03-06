# Quiz System — Developer Documentation

A complete guide to how the quiz/assessment system works, how to extend it, and how all the pieces connect.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [File Map](#file-map)
4. [Layer 1 — Static Quiz Data](#layer-1--static-quiz-data)
5. [Layer 2 — Quiz Generation API](#layer-2--quiz-generation-api)
6. [Layer 3 — Core Quiz Component](#layer-3--core-quiz-component)
7. [Layer 4 — Topic Page Integration](#layer-4--topic-page-integration)
8. [Layer 5 — Phase Assessment](#layer-5--phase-assessment)
9. [Scoring Persistence (localStorage)](#scoring-persistence-localstorage)
10. [Styling Reference](#styling-reference)
11. [How to Add Quiz Data for a New Roadmap](#how-to-add-quiz-data-for-a-new-roadmap)
12. [Data Flow: End-to-End Request Walkthrough](#data-flow-end-to-end-request-walkthrough)
13. [Question Types Reference](#question-types-reference)

---

## Overview

The quiz system has two modes:

| Mode | When used | Source |
|---|---|---|
| **Static quiz** | Topic has pre-written questions | `src/data/quizzes/{roadmap}.js` |
| **AI-generated quiz** | No static data for the topic | `POST /api/quiz/generate` → LLM |

Both modes feed the same `Quiz` component. From the user's perspective the experience is identical — they only see different UI before the quiz starts (a "Test Your Knowledge" button vs. a "Generate Quiz with AI" button).

---

## Architecture Diagram

```
User visits topic page
        │
        ▼
TopicQuizSection            ← wrapper component, handles data sourcing
   │
   ├── [has static data?] ──yes──► load from src/data/quizzes/javascript.js
   │
   ├── [has cached AI data?] ─yes─► load from localStorage (24h TTL)
   │
   └── [none] ─────────────────► show "Generate Quiz with AI" button
                                         │
                                         ▼
                              POST /api/quiz/generate
                              { slug, phaseId, topicId }
                                         │
                                         ▼
                              Server calls getTopicById()
                              (reads from src/data/ in-process)
                                         │
                                         ▼
                              LLM (OpenRouter) generates JSON
                                         │
                                         ▼
                              Returns { questions: [...] }
                                         │
                                         ▼
                              Cache in localStorage
                                         │
                                         ▼
                              Quiz.js renders the questions
```

For phase assessment:

```
User visits phase page
        │
        ▼
PhaseAssessment             ← wrapper component
   │
   ├── [has static data for ANY topic in phase?] ──► pool all static questions
   │
   └── [no static data] ─────► POST /api/quiz/generate for each topic (3 Qs each)
                                         │
                                         ▼
                              Quiz.js with topicGrouping prop
                              (shows per-topic score in results)
```

---

## File Map

```
src/
├── data/
│   └── quizzes/
│       ├── index.js              ← Registry + lookup functions
│       └── javascript.js         ← Static questions for JS Phase 1 (35 questions)
│
├── app/
│   ├── api/
│   │   └── quiz/
│   │       └── generate/
│   │           └── route.ts      ← POST /api/quiz/generate (AI generation)
│   │
│   └── roadmap/
│       └── [slug]/
│           ├── [phaseId]/
│           │   ├── page.js       ← Phase page → renders <PhaseAssessment>
│           │   └── [topicId]/
│           │       └── page.js   ← Topic page → renders <TopicQuizSection>
│
├── components/
│   ├── Quiz.js                   ← Core quiz UI (pure presentational + reducer)
│   ├── TopicQuizSection.js       ← Topic-level wrapper (data sourcing + scores)
│   └── PhaseAssessment.js        ← Phase-level wrapper (collects questions across topics)
│
└── app/globals.css               ← All quiz CSS classes (search: "Quiz Component")
```

---

## Layer 1 — Static Quiz Data

### Purpose
Pre-written questions for topics where quality matters most. Currently covers all 7 topics in JavaScript Phase 1.

### File: `src/data/quizzes/javascript.js`

Exports a plain object keyed by `topicId`:

```js
export default {
  "variables-data-types": {
    topicId: "variables-data-types",
    questions: [
      {
        id: "vdt-1",                          // unique within the roadmap
        type: "code-output",                  // "multiple-choice" | "true-false" | "code-output"
        question: "What will this code output?",
        code: `const obj = { name: "Alice" };\nobj.name = "Bob";\nconsole.log(obj.name);`,
        options: ['"Alice"', '"Bob"', "TypeError", "undefined"],
        correctAnswer: 1,                     // 0-based index into options[]
        explanation: "const prevents reassignment, not mutation..."
      },
      // ...4 more questions
    ]
  },
  "operators": { ... },
  "strings-string-methods": { ... },
  // ...
};
```

**Rules:**
- `topicId` must exactly match the `id` field in the topic data file (e.g., `src/data/javascript/phase1.js`)
- `correctAnswer` is a 0-based index — `0` means the first option is correct
- `code` field is optional — only include for `"code-output"` questions
- For `"true-false"`, options must always be `["True", "False"]`
- For `"multiple-choice"`, provide exactly 4 options

### File: `src/data/quizzes/index.js`

Registry and lookup layer. Three exported functions:

```js
// Get quiz for a single topic. Returns null if not found.
getQuizForTopic(slug, topicId)
// → { topicId, questions: [...] } | null

// Get all questions from all topics in a phase, each tagged with topicId.
// Used by PhaseAssessment. Returns null if no static data for ANY topic in the phase.
getQuizzesForPhase(slug, phaseTopicIds)
// → [{ ...question, topicId }, ...] | null

// Boolean check — used to decide whether to show "Generate" button.
hasStaticQuiz(slug, topicId)
// → true | false
```

**To add a new roadmap:** import the new quiz file and add it to the `quizData` object:

```js
import typescriptQuizzes from "./typescript"; // new file

const quizData = {
  javascript: javascriptQuizzes,
  typescript: typescriptQuizzes,  // ← add here
};
```

---

## Layer 2 — Quiz Generation API

### File: `src/app/api/quiz/generate/route.ts`

**Endpoint:** `POST /api/quiz/generate`

**Key design decision:** The client sends only the topic *path* (`slug`, `phaseId`, `topicId`). The server looks up the full topic content from the in-memory roadmap data — no large payload over the wire.

### Request

```json
{
  "slug": "typescript",
  "phaseId": "phase-1",
  "topicId": "interfaces",
  "difficulty": "intermediate",
  "count": 5
}
```

| Field | Required | Default | Notes |
|---|---|---|---|
| `slug` | yes | — | Roadmap identifier |
| `phaseId` | yes | — | Phase identifier |
| `topicId` | yes | — | Topic identifier |
| `difficulty` | no | `"intermediate"` | `"beginner"` \| `"intermediate"` \| `"advanced"` |
| `count` | no | `5` | Clamped to 3–10 |

### Response (success)

```json
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Which keyword...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 2,
      "explanation": "Because..."
    }
  ]
}
```

### How it works internally

```
1. Parse { slug, phaseId, topicId } from request body
2. Call getTopicById(slug, phaseId, topicId) — reads from src/data/
3. If topic not found → 404
4. Build system prompt with topic title, explanation, codeExample, commonMistakes
5. llm.invoke([SystemMessage, HumanMessage]) — single call, not streaming
6. Strip markdown fences from response if present
7. JSON.parse() → validate structure
8. Return { questions }
```

### LLM configuration

Uses the same `ChatOpenAI` + OpenRouter setup as the chat endpoint:

```ts
const llm = new ChatOpenAI({
  model: process.env.FREE_MODEL ?? "google/gemini-2.0-flash-001",
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: { baseURL: "https://openrouter.ai/api/v1" },
});
```

**Non-streaming** — quiz generation needs the complete JSON structure at once, so `llm.invoke()` is used instead of `.stream()`.

### Error responses

| Status | When |
|---|---|
| 400 | Missing `slug`, `phaseId`, or `topicId` |
| 404 | Topic not found in roadmap data |
| 503 | `OPENROUTER_API_KEY` not set |
| 500 | LLM returned malformed JSON or other error |

---

## Layer 3 — Core Quiz Component

### File: `src/components/Quiz.js`

Pure UI component. Receives `questions[]` as a prop — doesn't know or care whether they came from static data or AI.

### Props

```js
Quiz({
  questions,          // required — array of question objects
  topicGrouping,      // optional — { [topicId]: topicTitle }
                      //   pass this for phase assessments to get per-topic breakdown
  onComplete,         // optional — callback(score, total) when quiz finishes
  onRetake,           // optional — callback() when user clicks "Retake Quiz"
})
```

### State machine (useReducer)

The component uses `useReducer` with three distinct phases:

```
"quiz" ──[user selects + confirms]──► "feedback" ──[user clicks Next]──► "quiz" (next Q)
                                                                     └──► "results" (last Q)
```

**State shape:**

```js
{
  phase: "quiz" | "feedback" | "results",
  currentIndex: 0,          // which question we're on
  selectedAnswer: null,     // index of the currently selected option
  answers: [                // grows as user answers questions
    {
      questionIndex: 0,
      selected: 2,          // index user picked
      correct: true,
      timeSpent: 4200,      // ms spent on this question
    }
  ],
  startTime: 1700000000000,
  questionStartTime: 1700000000000,
}
```

**Reducer actions:**

| Action | Effect |
|---|---|
| `SELECT_ANSWER` | Updates `selectedAnswer` |
| `SHOW_FEEDBACK` | Appends to `answers[]`, sets `phase: "feedback"` |
| `NEXT_QUESTION` | Advances index or transitions to `"results"` |
| `RESET` | Returns to fresh initial state |

### Rendering phases

**Quiz phase** — shows question + options + "Confirm Answer" button (disabled until selection):

```
[Progress bar: ████░░░░░░░░ Question 2 of 5]

What will this code output?

[Code block if type === "code-output"]

  [A] option text
  [B] option text  ← highlighted if selected
  [C] option text
  [D] option text

[Confirm Answer]   ← disabled until an option is clicked
```

**Feedback phase** — options are frozen (disabled), correct answer turns green, wrong answer turns red, explanation appears:

```
  [A] option text
  [B] option text  ← red (user's wrong answer)
  [C] option text  ← green (correct answer)
  [D] option text

✓ Correct!  /  ✗ Incorrect
[Explanation text]
[Next Question]
```

**Results phase:**

```
     8 / 10
      80%
  Completed in 45s

[Per-Topic Breakdown — only if topicGrouping was passed]
  Variables & Data Types    4/5
  Operators                 4/5

[Review Answers]
  Q1: What will... — Your answer: "Bob" ✓
  Q2: Which of... — Your answer: array | Correct: symbol ✗
  ...

[Retake Quiz]
```

---

## Layer 4 — Topic Page Integration

### File: `src/components/TopicQuizSection.js`

Sits at the bottom of each topic page (after Interview Questions, before navigation). Handles all the data sourcing logic so `Quiz.js` stays simple.

### Props

```js
TopicQuizSection({
  slug,        // e.g. "javascript"
  phaseId,     // e.g. "phase-1"
  topicId,     // e.g. "closures"
  topicTitle,  // e.g. "Closures" — used only for display text
})
```

### Decision logic (in useEffect on mount)

```
1. Load best score from localStorage (quiz-scores-{slug})
2. Check static data: getQuizForTopic(slug, topicId)
   → found: set questions, done
3. Check localStorage cache: quiz-cache-{slug}-{topicId}
   → found and < 24h old: set questions, done
4. Neither found: show "Generate Quiz with AI" button
```

### What the user sees

| State | UI |
|---|---|
| Static or cached questions available | Card with "Test Your Knowledge" button |
| No questions yet | Card with "Generate Quiz with AI" button |
| Generating | Animated typing dots + "Generating quiz questions..." |
| Questions ready, quiz not started | Card with "Test Your Knowledge" button |
| Quiz started | `<Quiz>` component inline |

A **best score badge** (`Best: 80% (3 attempts)`) is shown above the card whenever previous scores exist in localStorage.

### How it wires into the topic page

In `src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js`:

```jsx
// After the Interview Questions section:
<TopicQuizSection
  slug={slug}
  phaseId={phaseId}
  topicId={topicId}
  topicTitle={topic.title}
/>
```

The `slug`, `phaseId`, `topicId` come from `useParams()` which is already at the top of the page component.

---

## Layer 5 — Phase Assessment

### File: `src/components/PhaseAssessment.js`

Appears at the bottom of each phase page. Combines questions from all topics in the phase into one assessment.

### Props

```js
PhaseAssessment({
  slug,   // e.g. "javascript"
  phase,  // full phase object from getRoadmapPhases() — has phase.id and phase.topics[]
})
```

### How it works

**On mount:**
- Calls `getQuizzesForPhase(slug, topicIds)` with the IDs of all topics in the phase
- If static questions exist for any topics, they are loaded and pooled
- Each question is tagged with `topicId` so the results can show per-topic breakdown

**If no static data (e.g., TypeScript phase):**
- When user clicks "Take Phase Assessment", it calls `POST /api/quiz/generate` for each topic in sequence
- Uses `count: 3` (fewer per topic than topic-level, to keep the total manageable)
- Pools all generated questions

**Passes to Quiz.js:**
- `topicGrouping` = `{ [topicId]: topicTitle }` — this triggers the per-topic breakdown in the results screen
- `onRetake` = hides the assessment and shows the button again

### How it wires into the phase page

In `src/app/roadmap/[slug]/[phaseId]/page.js` (a server component — the client boundary is at the `PhaseAssessment` component level):

```jsx
<div className="topics-list">
  {/* topic cards... */}
</div>

<PhaseAssessment slug={slug} phase={phase} />
```

---

## Scoring Persistence (localStorage)

Two separate localStorage namespaces:

### Quiz scores — `quiz-scores-{slug}`

Written by `TopicQuizSection.handleQuizComplete()` after every quiz completion.

```js
// Key example: "quiz-scores-javascript"
{
  "variables-data-types": {
    bestScore: 80,        // percentage (0-100)
    attempts: 3,
    lastAttempt: 1709654400000  // Unix timestamp ms
  },
  "closures": {
    bestScore: 100,
    attempts: 1,
    lastAttempt: 1709654500000
  }
}
```

`bestScore` is always the maximum across all attempts — it never goes down.

### AI quiz cache — `quiz-cache-{slug}-{topicId}`

Written by `TopicQuizSection.handleGenerateQuiz()` after a successful AI generation. Avoids re-generating on every page visit.

```js
// Key example: "quiz-cache-typescript-interfaces"
{
  questions: [ /* generated question objects */ ],
  generatedAt: 1709654400000  // Unix timestamp ms
}
```

TTL is 24 hours — checked in `useEffect` on mount. After expiry the cache entry is ignored and the "Generate" button reappears.

---

## Styling Reference

All quiz CSS is in `src/app/globals.css` under the comment `/* ========== Quiz Component ========== */`.

All class names use a `.quiz-*` prefix. They use CSS custom properties for theming so they automatically adapt to all 6 app themes.

| Class | Purpose |
|---|---|
| `.quiz-container` | Outer card wrapper (bg-card, border, border-radius-lg) |
| `.quiz-header` | Progress bar area (top padding) |
| `.quiz-body` | Question + options + buttons (inner padding) |
| `.quiz-progress-bar` | Grey track of the progress bar |
| `.quiz-progress-fill` | Colored fill (width set via inline style, transitions) |
| `.quiz-progress-text` | "Question 2 of 5" text |
| `.quiz-question-text` | Bold question text |
| `.quiz-code-block` | Wrapper around CodeBlock for spacing |
| `.quiz-options` | Flex column container for option buttons |
| `.quiz-option` | Individual option button |
| `.quiz-option-selected` | Blue highlight — user's current selection |
| `.quiz-option-correct` | Green — correct answer revealed in feedback phase |
| `.quiz-option-incorrect` | Red — user's wrong answer in feedback phase |
| `.quiz-option-letter` | Circle with A/B/C/D letter |
| `.quiz-confirm-btn` | Full-width "Confirm Answer" button |
| `.quiz-feedback` | Feedback panel (slides in after confirming) |
| `.quiz-feedback-badge` | "Correct!" / "Incorrect" label |
| `.quiz-feedback-correct` | Green color for correct badge |
| `.quiz-feedback-incorrect` | Red color for incorrect badge |
| `.quiz-feedback-explanation` | Explanation text |
| `.quiz-results` | Results screen container (centered) |
| `.quiz-score-circle` | Score display: `8 / 10` |
| `.quiz-score-number` | Large green number |
| `.quiz-score-total` | `/ 10` in muted color |
| `.quiz-score-percent` | `80%` percentage |
| `.quiz-time` | "Completed in 45s" |
| `.quiz-review` | Review section container |
| `.quiz-review-item` | Individual Q&A row in review |
| `.quiz-review-correct` | Green left border |
| `.quiz-review-incorrect` | Red left border |
| `.quiz-best-score` | Green badge above the card: "Best: 80% (3 attempts)" |
| `.quiz-generate-card` | Dashed-border card shown before quiz starts |
| `.quiz-generate-text` | Description text inside generate card |
| `.quiz-generating` | Loading state (dots + text) |
| `.quiz-error` | Red error message |
| `.quiz-topic-breakdown` | Per-topic score grid (phase assessment results) |
| `.quiz-topic-score` | Single row in topic breakdown |
| `.phase-assessment-trigger` | Container for the "Take Phase Assessment" button |
| `.phase-assessment-container` | Container once assessment is active |
| `.quiz-btn` | Base button style |
| `.quiz-btn-primary` | Primary button (accent-blue bg) |
| `.quiz-btn-large` | Larger padding variant |

**Color system used:**

| Purpose | CSS variable |
|---|---|
| Correct answer | `--accent-green` (#34d399) |
| Incorrect answer | `--accent-red` (#f87171) |
| Selected option / primary buttons | `--accent-blue` (#10b981) |
| Card backgrounds | `--bg-card`, `--bg-secondary`, `--bg-card-hover` |
| Borders | `--border` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted` |

---

## How to Add Quiz Data for a New Roadmap

**Example: adding TypeScript quiz data**

**Step 1** — Create `src/data/quizzes/typescript.js`:

```js
const typescriptQuizzes = {
  "basic-types": {           // must match topic id in src/data/typescript/ts-phase1.js
    topicId: "basic-types",
    questions: [
      {
        id: "bt-1",
        type: "multiple-choice",
        question: "Which TypeScript type represents the absence of a value?",
        options: ["null", "void", "never", "undefined"],
        correctAnswer: 1,
        explanation: "`void` is used as the return type of functions that don't return a value..."
      },
      // add more questions...
    ]
  },
  // add more topics...
};

export default typescriptQuizzes;
```

**Step 2** — Register it in `src/data/quizzes/index.js`:

```js
import javascriptQuizzes from "./javascript";
import typescriptQuizzes from "./typescript";   // ← add import

const quizData = {
  javascript: javascriptQuizzes,
  typescript: typescriptQuizzes,                // ← add to registry
};
```

That's it. The `TopicQuizSection` and `PhaseAssessment` components will automatically pick up the new data for any TypeScript topic that has a matching `topicId`.

---

## Data Flow: End-to-End Request Walkthrough

### Scenario A — Topic with static quiz data (e.g., JS → Variables)

```
1. User visits /roadmap/javascript/phase-1/variables-data-types
2. TopicPage renders, including <TopicQuizSection slug="javascript" phaseId="phase-1" topicId="variables-data-types" topicTitle="Variables & Data Types">
3. TopicQuizSection mounts → useEffect runs:
   a. reads localStorage "quiz-scores-javascript" → finds bestScore = 80%
   b. calls getQuizForTopic("javascript", "variables-data-types")
   c. found → setQuestions(staticQuiz.questions) [5 questions]
4. Renders: best score badge + "Test Your Knowledge" card
5. User clicks "Test Your Knowledge" → setShowQuiz(true)
6. Renders: <Quiz questions={[...5 questions]} onComplete={handleQuizComplete}>
7. User answers all 5 questions
8. Quiz dispatches NEXT_QUESTION on last question → phase = "results"
9. Quiz calls onComplete(4, 5) → handleQuizComplete saves { bestScore: 80, attempts: 2 } to localStorage
```

### Scenario B — Topic without static data (e.g., TypeScript → Interfaces)

```
1. User visits /roadmap/typescript/phase-1/interfaces
2. TopicQuizSection mounts → useEffect runs:
   a. getQuizForTopic("typescript", "interfaces") → null (no static data)
   b. checks localStorage "quiz-cache-typescript-interfaces" → not found
3. Renders: "No quiz available yet for Interfaces" + "Generate Quiz with AI" button
4. User clicks button → handleGenerateQuiz():
   a. setIsGenerating(true) → shows loading dots
   b. POST /api/quiz/generate { slug: "typescript", phaseId: "phase-1", topicId: "interfaces", difficulty: "intermediate", count: 5 }
5. Server (route.ts):
   a. getTopicById("typescript", "phase-1", "interfaces") → gets full topic object
   b. Builds system prompt with topic.explanation, topic.codeExample, topic.commonMistakes
   c. llm.invoke([SystemMessage, HumanMessage]) → waits for full JSON response
   d. Parses and validates JSON
   e. Returns { questions: [...5 questions] }
6. Client receives response:
   a. setQuestions(data.questions)
   b. setShowQuiz(true)
   c. writes to localStorage "quiz-cache-typescript-interfaces"
7. Renders: <Quiz questions={[...5 AI questions]}>
```

### Scenario C — Phase Assessment (e.g., JS Phase 1)

```
1. User visits /roadmap/javascript/phase-1
2. PhaseAssessment mounts → useEffect runs:
   a. getQuizzesForPhase("javascript", ["variables-data-types", "operators", ...7 topic IDs])
   b. found static data for all 7 topics → 35 questions, each tagged with topicId
   c. setQuestions([...35 questions])
3. Renders: "Take Phase Assessment" button
4. User clicks → handleStartAssessment():
   a. questions already set → setShowAssessment(true)
5. Renders: <Quiz questions={[...35 questions]} topicGrouping={{ "variables-data-types": "Variables & Data Types", ... }}>
6. User completes assessment
7. Results screen shows:
   - Overall score: 28/35 (80%)
   - Per-Topic Breakdown:
       Variables & Data Types   4/5
       Operators                5/5
       Strings                  3/5
       ...
   - Full review of all 35 questions
```

---

## Question Types Reference

### `"multiple-choice"`

4 options, one correct. Letters A–D shown.

```js
{
  id: "q1",
  type: "multiple-choice",
  question: "Which method returns a new array?",
  options: ["push()", "pop()", "map()", "sort()"],
  correctAnswer: 2,
  explanation: "map() creates and returns a new array..."
}
```

### `"true-false"`

Exactly 2 options — always `["True", "False"]`.

```js
{
  id: "q2",
  type: "true-false",
  question: "`typeof null` returns `\"null\"` in JavaScript.",
  options: ["True", "False"],
  correctAnswer: 1,
  explanation: "`typeof null` returns `\"object\"` — a legacy JS bug."
}
```

### `"code-output"`

Shows a code snippet above the options. Typically asks "What will this output?".

```js
{
  id: "q3",
  type: "code-output",
  question: "What will this code output?",
  code: `let x = 1;\nconsole.log(x++);`,
  options: ["0", "1", "2", "undefined"],
  correctAnswer: 1,
  explanation: "Postfix ++ returns the current value before incrementing."
}
```

The `code` field is rendered by the existing `CodeBlock` component with syntax highlighting.
