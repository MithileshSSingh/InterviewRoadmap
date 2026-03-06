# Code Playground System — Developer Documentation

A complete implementation guide for the embedded code playground added to topic pages. This is intended to help a new developer understand exactly how it works, why it is structured this way, and how to extend it safely.

---

## Table of Contents

1. [Overview](#overview)
2. [What Was Built](#what-was-built)
3. [Architecture](#architecture)
4. [File Map](#file-map)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [Execution Pipeline (Run Button)](#execution-pipeline-run-button)
7. [Language and Runtime Rules](#language-and-runtime-rules)
8. [Theme Integration](#theme-integration)
9. [UI/UX Behavior](#uiux-behavior)
10. [Styling Reference](#styling-reference)
11. [Performance Strategy](#performance-strategy)
12. [Safety Model and Limitations](#safety-model-and-limitations)
13. [How to Extend](#how-to-extend)
14. [Troubleshooting](#troubleshooting)

---

## Overview

The code playground enables users to:

- Switch between static code view and interactive playground on topic pages
- Edit code in Monaco (VS Code editor in-browser)
- Run JavaScript snippets in a sandboxed iframe
- See runtime logs/errors in a built-in console panel
- Reset and copy code quickly
- Launch a prefilled editor from the Practice Exercise section

This system is client-side only and intentionally lazy-loaded to avoid hurting initial page performance.
On phone view (`<= 768px`), playground UI is intentionally hidden and topic pages fall back to static code view.

---

## What Was Built

### 1) Monaco integration

Installed:

- `@monaco-editor/react`

Monaco only loads when the user opens playground mode.

### 2) New `CodePlayground` component

Created:

- `src/components/CodePlayground.js`

Core features:

- Client component (`"use client"`)
- Props: `code`, `language`, `height`
- Split layout: editor + output console
- Resizable split on desktop
- Stacked layout if rendered on small screens
- Run/Reset/Copy controls
- JavaScript sandbox execution with iframe + postMessage
- 5-second timeout handling
- Theme-aware editor appearance (`vs-dark` / `vs-light`)
- Non-JS run disabled with tooltip (`JavaScript execution only`)

### 3) Topic page integration

Updated:

- `src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js`

Added:

- `View | Playground` toggle in Code Example section
- Default mode = `View`
- Lazy loading using Next dynamic import (`ssr: false`) and `Suspense`
- Exercise `Try it` button that opens another playground with a starter template
- Phone guard (`<= 768px`) that hides toggle/playground and forces static code view

### 4) Styling

Updated:

- `src/app/globals.css`

Added classes for:

- Playground container, toolbar, split grid, splitter, console
- Output line styles (green logs, red errors)
- View/Playground toggle buttons
- Exercise playground wrapper and instructions panel
- Responsive behavior for mobile

---

## Architecture

```text
Topic Page (client)
  |
  |-- Code Example section
  |     |-- phone view -> CodeBlock only (playground hidden)
  |     |-- non-phone view:
  |           |-- View tab -> CodeBlock (existing static renderer)
  |           |-- Playground tab -> dynamic import(CodePlayground)
  |
  |-- Practice Exercise section
        |-- phone view -> markdown only
        |-- non-phone view:
              |-- markdown instructions
              |-- Try it button
                    |-- opens CodePlayground with generated starter template

CodePlayground (client)
  |
  |-- React.lazy(MonacoEditor)
  |-- editor state + output state
  |-- Run -> hidden sandboxed iframe
  |      |-- inject user code
  |      |-- patch console.log/error
  |      |-- postMessage output to parent
  |-- parent listens for output and renders console lines
```

---

## File Map

```text
src/
├── components/
│   └── CodePlayground.js                         # New Monaco + runtime component
│
├── app/
│   ├── globals.css                               # Added playground/toggle/responsive styles
│   └── roadmap/[slug]/[phaseId]/[topicId]/
│       └── page.js                               # Added View/Playground toggle + Try it flow
│
└── components/
    └── ThemeProvider.js                          # Existing mode source used by playground
```

---

## Step-by-Step Implementation

## Step 1: Install Monaco editor

Dependency was added to `package.json`:

```json
"@monaco-editor/react": "^4.7.0"
```

---

## Step 2: Create `CodePlayground` as a client component

`CodePlayground` uses local state for:

- `editorCode`: current editable code
- `output`: console lines (`log` or `error`)
- `isRunning`: run state for button UX
- `copied`: copy feedback
- `splitPercent`: desktop split ratio
- `isMobile`: layout mode

It accepts:

- `code`: initial code content
- `language`: incoming code language
- `height`: container height (defaults to `420px`)

---

## Step 3: Normalize language and runtime behavior

Language aliases are normalized (e.g. `js` -> `javascript`, `ts` -> `typescript`, `py` -> `python`).

Runtime rule:

- Only `javascript` is runnable
- Other languages are editable/copyable but Run is disabled with tooltip

---

## Step 4: Implement split view and desktop resizing

The editor/console area is a grid:

- Desktop: horizontal split (`editor | splitter | console`)
- Mobile: vertical stack (`editor / splitter / console`)

Resizable behavior uses pointer events:

- Drag splitter -> update `splitPercent`
- Clamp range to avoid extreme collapse

---

## Step 5: Implement sandboxed JavaScript execution

When user clicks Run:

1. Previous run is cleaned up
2. Output is cleared
3. Hidden iframe is created with `sandbox="allow-scripts"`
4. User code is injected into `srcdoc`
5. iframe patches `console.log` and `console.error`
6. iframe sends messages back using `parent.postMessage`
7. parent listens and appends output lines to console panel
8. run auto-stops on done/error/timeout

---

## Step 6: Add timeout protection

A 5-second timeout is started for each run:

- If no completion signal arrives in time, run is stopped
- Console shows timeout error message

This is a best-effort guard against long-running code.

---

## Step 7: Theme integration

`CodePlayground` reads `mode` from `useTheme()` and maps to Monaco theme:

- light mode -> `vs-light`
- dark mode -> `vs-dark`

This keeps editor visuals aligned with app theme switching.

---

## Step 8: Integrate into topic page with lazy loading

In `topic/page.js`:

- Added `View | Playground` toggle
- Default selected tab = `View`
- Playground component is lazy-loaded only when tab is selected

Dynamic import used:

```js
const CodePlayground = dynamic(() => import("@/components/CodePlayground"), {
  ssr: false,
});
```

`Suspense` fallback is shown while loading.

Phone-view behavior:

- Detect viewport with `window.innerWidth <= 768`
- Hide `View | Playground` toggle
- Force `CodeBlock` rendering
- Close/hide exercise playground state

---

## Step 9: Add exercise mode (`Try it`)

In Practice Exercise section:

- Added `Try it` button
- Expands a dedicated exercise playground
- Shows exercise instructions above editor
- Prefills starter code template based on:
  - topic title
  - exercise text
  - inferred language
- This mode is hidden on phone view (`<= 768px`)

Starter templates exist for JavaScript, TypeScript, and Python.

---

## Step 10: Add global CSS styles

Added class groups in `globals.css` for:

- Toggle controls: `.code-view-toggle*`
- Playground shell: `.code-playground*`
- Console styling: `.console-*`
- Exercise controls: `.exercise-try-btn`, `.exercise-playground-*`
- Mobile behavior under `@media (max-width: 768px)`

---

## Execution Pipeline (Run Button)

```text
User clicks Run
   |
   V
Create sandbox iframe (hidden)
   |
   V
Inject wrapper script + user code
   |
   V
iframe executes eval(userCode)
   |
   |-- console.log(...)   -> postMessage({ kind: 'log' })
   |-- console.error(...) -> postMessage({ kind: 'error' })
   |-- completion         -> postMessage({ kind: 'done' })
   |
   V
Parent receives messages
   |
   V
Append entries in output panel
```

Each run has a unique `runId` so messages are associated with the correct execution session.

---

## Language and Runtime Rules

- JavaScript: run enabled
- TypeScript: run disabled
- Python: run disabled
- Other languages: treated as non-runnable

Reason:

- Browser cannot directly execute TS/Python safely without transpiler/interpreter overhead
- Current system keeps execution predictable and simple

---

## Theme Integration

Source of truth: `ThemeProvider` (`mode` = `light` or `dark`).

Mapping:

- `mode === "light"` -> Monaco `vs-light`
- otherwise -> Monaco `vs-dark`

No separate playground theme state is introduced.

---

## UI/UX Behavior

### Code Example section

- Phone view (`<= 768px`)
  - Always uses existing `CodeBlock`
  - Playground tab is not shown
- Non-phone view
  - `View` tab uses existing `CodeBlock`
  - `Playground` tab loads interactive editor lazily

### Practice Exercise section

- Phone view: exercise markdown only
- Non-phone view:
  - Exercise markdown remains visible
  - `Try it` toggles exercise playground
  - Instructions repeated above editor for context while coding

### Toolbar buttons

- `▶ Run`
- `Reset`
- `Copy`

---

## Styling Reference

Primary classes:

- `.code-playground`
- `.code-playground-toolbar`
- `.code-playground-grid`
- `.code-playground-editor`
- `.code-playground-splitter`
- `.code-playground-console`
- `.console-line.log`
- `.console-line.error`
- `.code-view-toggle`
- `.exercise-try-btn`
- `.exercise-playground-wrap`

Visual rules implemented:

- Border uses `--border`
- Console uses dark background
- Logs are green
- Errors are red
- Console font is monospace (`JetBrains Mono`)
- Phone view hides playground UI from topic page

---

## Performance Strategy

This system applies lazy loading in two layers:

1. Topic page lazy-loads `CodePlayground` with `next/dynamic` and `ssr: false`
2. `CodePlayground` lazy-loads Monaco via `React.lazy`

Result:

- Default topic page load remains lightweight in `View` mode
- Monaco bundle is only fetched when interactive mode is actually used
- On phone view, Monaco is never loaded from topic pages because playground is hidden

---

## Safety Model and Limitations

### What is protected

- User code runs in sandboxed iframe (`allow-scripts` only)
- Output channel is explicit (`postMessage` + runId filtering)

### Limitations to understand

- Execution uses `eval` inside sandbox wrapper
- Timeout is best-effort and not a formal VM kill-switch
- Non-JS execution is intentionally unsupported
- No package imports or external module resolution

If stronger isolation or deterministic cancellation is needed later, consider worker-based execution for pure JS computation workloads.

---

## How to Extend

### Enable TypeScript execution

Potential approach:

- Add in-browser TS transpilation (e.g. using TypeScript compiler or esbuild-wasm)
- Transpile in parent context, execute transpiled JS in sandbox iframe

### Add test cases panel

- Add an input/output test runner section in `CodePlayground`
- Compare actual vs expected
- Render pass/fail summary below console

### Persist user code

- Add localStorage key by topic ID
- Restore last edited state on mount
- Keep reset button to return to starter code

### Support multiple files

- Add tabbed file model in editor state
- Combine files into execution wrapper before sandbox run

---

## Troubleshooting

### Playground not loading

Check:

- `@monaco-editor/react` is installed
- Browser console for dynamic import/network errors
- Topic page is in `Playground` tab (default is `View`)
- You are not on phone view (`<= 768px`), where playground is hidden by design

### Run button disabled unexpectedly

Check inferred language in topic code fence:

- Runnable only if normalized to `javascript`
- `typescript` and `python` are intentionally disabled

### No output shown

Check:

- Code actually calls `console.log`
- Runtime errors appear in red lines
- Timeout message appears for long-running code

### Theme mismatch

Check:

- `ThemeProvider` mode updates on `data-mode`
- `CodePlayground` receives mode via `useTheme()`

---

## Quick Developer Checklist

When modifying this system:

1. Keep default topic rendering in `View` mode
2. Preserve lazy loading boundaries
3. Do not remove sandbox attributes
4. Keep run disabled for unsupported languages unless runtime is added
5. Validate mobile layout after style changes
6. Run targeted lint on modified files
