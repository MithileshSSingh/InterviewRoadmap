# Global Search — End-to-End Guide

This document explains how the global search feature works in this application, from the moment a user presses Cmd+K to the moment they land on a topic page. Read top-to-bottom for a complete mental model.

---

## Overview

Search is **entirely client-side**. There is no API route, no database query, and no network request involved. All roadmap content is static data bundled with the app, so a search index is built once in memory when the module is first imported, and every query runs against that in-memory array.

**Trigger:** Click the 🔍 button in the top-right controls, or press `Cmd+K` / `Ctrl+K` anywhere on the page.
**Scope:** All topics across all roadmaps (JavaScript, TypeScript, DSA, Android, React Native, Salesforce, Node.js, Python, React, and any future additions).
**Algorithm:** Case-insensitive word matching with a simple relevance score (title match outweighs body match).

---

## Key Files

| File | Role |
|------|------|
| `src/lib/searchIndex.js` | Builds the in-memory index; exports `searchIndex(query, limit)` |
| `src/components/SearchModal.js` | Search button + modal UI; handles keyboard, debounce, navigation |
| `src/app/layout.js` | Renders `<SearchModal />` inside `.top-controls` at the root layout level |
| `src/app/globals.css` | All search-related CSS classes (`.search-modal`, `.search-result-item`, etc.) |
| `src/data/roadmaps.js` | Source of roadmap metadata — slug, title, emoji, description |
| `src/data/index.js` | Source of phase + topic content — `getRoadmapPhases(slug)` |

---

## Architecture: Why Client-Side?

All roadmap content lives in `src/data/` as static JS files (e.g. `src/data/javascript/phase1.js`). These are imported at build time, so Next.js bundles them into the client JavaScript. Because the data is already on the client, there is no reason to make a server round-trip to search it — doing so would only add latency.

The search index is a plain JavaScript array built by iterating over every roadmap → every phase → every topic at module initialisation time (i.e. the first time `searchIndex.js` is imported). After that, every query is a synchronous `.map()` + `.filter()` + `.sort()` over that array.

---

## Step 1 — Building the Index (`src/lib/searchIndex.js`)

When the module is first loaded by the browser, it runs top-level code that populates a module-scoped `INDEX` array. This happens once per page session.

```
getAllRoadmaps()          ← src/data/roadmaps.js
    │
    ├── for each roadmap → push one "roadmap" entry
    │
    └── getRoadmapPhases(slug)  ← src/data/index.js
            │
            └── for each phase → for each topic → push one "topic" entry
```

### Roadmap entry shape
```js
{
  type: "roadmap",
  slug: "javascript",
  title: "JavaScript",
  emoji: "⚡",
  description: "Master JavaScript from variables to design patterns…",
  url: "/roadmap/javascript",
}
```

### Topic entry shape
```js
{
  type: "topic",
  roadmapSlug: "javascript",
  roadmapTitle: "JavaScript",
  roadmapEmoji: "⚡",
  phaseId: "phase-1",
  phaseName: "Phase 1: Foundations",
  topicId: "variables-data-types",
  topicTitle: "Variables & Data Types",
  snippet: "In JavaScript, variables are containers…",  // first 200 chars of explanation
  url: "/roadmap/javascript/phase-1/variables-data-types",
}
```

The `snippet` field is `topic.explanation.slice(0, 200)`. It is used only for display (the grey summary line under each result). The full explanation is never loaded into the index.

### The `searchIndex(query, limit)` function

```
query → split into words → score each INDEX entry → filter score > 0 → sort desc → slice(0, limit)
```

Scoring rules per word:
- Word found in `topicTitle` or `title` → **+3 points**
- Word found in `snippet` or `description` → **+1 point**

Multi-word queries accumulate points across all words. A topic that matches every word in the title will rank above one that only matches in the body.

The default limit is **20 results**. The caller (`SearchModal.js`) does not override this.

---

## Step 2 — The Search UI (`src/components/SearchModal.js`)

This is a `"use client"` React component. It is responsible for:

1. Rendering the 🔍 trigger button inside `.top-controls`
2. Managing the open/closed state of the modal
3. Listening for global keyboard shortcuts
4. Debouncing user input and calling `searchIndex`
5. Rendering the results grouped by roadmap
6. Navigating to the selected topic page

### State

| State | Type | Purpose |
|-------|------|---------|
| `isOpen` | boolean | Whether the modal is visible |
| `query` | string | Current value of the search input |
| `results` | array | Output of the last `searchIndex()` call |
| `mounted` | boolean | Hydration guard — prevents `createPortal` from running on the server |

### Modal rendering: `createPortal`

The modal overlay and dialog are rendered into `document.body` via React's `createPortal`, not inside the `.top-controls` DOM tree. This avoids z-index and `overflow: hidden` issues from ancestor elements.

```
<SearchModal>
  ├── <button class="mode-toggle search-btn">   ← rendered in .top-controls (normal flow)
  └── createPortal(modal, document.body)         ← rendered directly on <body>
        ├── <div class="search-overlay">         ← full-screen dark backdrop
        └── <div class="search-modal">           ← the actual dialog box
              ├── .search-input-container        ← 🔍 icon + input + ESC badge
              └── .search-results                ← scrollable grouped results
```

The `mounted` boolean is set to `true` in a `useEffect` (which only runs on the client). The portal is only created when `mounted === true`, ensuring there is no server/client HTML mismatch during hydration.

### Keyboard handling

A single `keydown` listener is attached to `document` in a `useEffect`:

| Key | Behaviour |
|-----|-----------|
| `Cmd+K` or `Ctrl+K` | Toggles the modal open/closed |
| `Escape` | Closes the modal from anywhere on the page |

The listener is added when the component mounts and removed when it unmounts (via the `useEffect` cleanup function).

### Debouncing

The search does not fire on every keystroke. A `useEffect` watches `query` and sets a 200 ms `setTimeout` before calling `searchIndex`. If the user types again within 200 ms, the previous timeout is cleared and a new one starts. This prevents excessive re-renders while the user is still typing.

```
user types "c" → 200ms timer starts
user types "l" → timer resets
user types "o" → timer resets
user types "s" → timer resets
user types "u" → timer resets
user types "r" → timer resets
user stops     → 200ms elapses → searchIndex("closur") runs → results update
```

### Results grouping

Raw results from `searchIndex` are a flat array of mixed `"roadmap"` and `"topic"` entries, sorted by relevance score. The component separates them before rendering:

```
results
  ├── filter type === "roadmap"  → rendered under a "Roadmaps" heading
  └── filter type === "topic"    → grouped by roadmapSlug using a Map
        ├── "javascript" group   → "⚡ JavaScript" heading + topic items
        ├── "typescript" group   → "💙 TypeScript" heading + topic items
        └── …
```

Grouping preserves the relevance order within each group because results are already sorted before grouping.

### Navigation

Each result is a `<button>` element. On click:
1. `router.push(entry.url)` — navigates to the topic page (Next.js App Router client navigation, no full page reload)
2. `close()` — resets `isOpen`, `query`, and `results` back to their initial state

---

## Step 3 — Layout Integration (`src/app/layout.js`)

`SearchModal` is placed at the root layout level so it is available on every page without remounting:

```jsx
<div className="top-controls">
  <div id="top-chatbot-slot" className="top-control-slot" />
  <SearchModal />       ← search button + portal
  <ThemeDropdown />
  <ModeToggle />
  <AuthButton />
</div>
```

Because the modal content is portalled to `document.body`, its physical position in the JSX tree does not affect its visual rendering — it always appears centred on screen regardless of where in the DOM `SearchModal` lives.

---

## Step 4 — Styling (`src/app/globals.css`)

All search classes are appended at the bottom of `globals.css`, following the project's single-file CSS convention.

| Class | Purpose |
|-------|---------|
| `.search-btn` | The trigger button; inherits `.mode-toggle` for consistent top-bar styling |
| `.search-overlay` | Fixed full-screen dark backdrop; `z-index: 1300` (above all other overlays) |
| `.search-modal` | The dialog box; glass morphism (`--glass` + `--glass-border` + `backdrop-filter`) |
| `.search-input-container` | Flex row holding the 🔍 icon, input, and ESC badge |
| `.search-input` | Transparent borderless input; inherits theme text colours |
| `.search-kbd` | The `ESC` badge; styled as a keyboard key |
| `.search-results` | Scrollable container for all result groups |
| `.search-result-group` | Wrapper for one roadmap's results |
| `.search-result-group-label` | Uppercase roadmap heading above each group |
| `.search-result-item` | Individual result row; hover/focus state uses `--bg-card-hover` |
| `.search-result-emoji` | Roadmap emoji on the left of each result |
| `.search-result-title` | Topic or roadmap name (bold) |
| `.search-result-meta` | Phase name in muted text below the title |
| `.search-result-snippet` | Truncated explanation preview, single line with ellipsis |
| `.search-empty` | Centred "No results" message |

### Centering fix: animation + transform

The modal uses `left: 50%; transform: translateX(-50%)` to centre horizontally. The entrance animation (`search-fade-in`) must include `translateX(-50%)` in **both** keyframe states — otherwise the animation would temporarily override the centering transform, causing the modal to flash to the right side before snapping to centre:

```css
@keyframes search-fade-in {
  from { transform: translateX(-50%) scale(0.96) translateY(-8px); }
  to   { transform: translateX(-50%) scale(1)    translateY(0); }
}
```

### Z-index hierarchy

| Layer | Z-index |
|-------|---------|
| `.top-controls` (nav bar) | 200 |
| `.chatbot-drawer` | 999 |
| `.chatbot-fab` | 1000 |
| `.code-dialog-backdrop` (code fullscreen) | 1200 |
| `.search-overlay` | 1300 |
| `.search-modal` | 1301 |

Search sits at the top of the stack so it can be triggered from any page state, including when a code dialog is open.

---

## End-to-End Flow Diagram

```
User presses Cmd+K
        │
        ▼
SearchModal keydown listener fires
        │
        ▼
setIsOpen(true)
        │
        ▼
useEffect detects isOpen → focuses <input> after 50ms
        │
        ▼
User types "async await"
        │
        ▼
onChange → setQuery("async await")
        │
        ▼
useEffect [query] starts 200ms debounce timer
        │
        ▼
200ms elapses (user stopped typing)
        │
        ▼
searchIndex("async await") runs synchronously
  ├── splits into words: ["async", "await"]
  ├── scores all INDEX entries
  │     e.g. "Async/Await" topic: title match ×2 words = +6, snippet match = +2 → score 8
  ├── filters score > 0
  ├── sorts descending
  └── returns top 20 entries
        │
        ▼
setResults([...]) → React re-renders modal with grouped results
        │
        ▼
User clicks "⚡ Async/Await — Phase 3: Async JavaScript"
        │
        ▼
router.push("/roadmap/javascript/phase-3/async-await")
close() → setIsOpen(false), setQuery(""), setResults([])
        │
        ▼
Next.js client-side navigation → topic page renders
```

---

## Adding a New Roadmap to Search

Search picks up new roadmaps automatically — no changes needed to `searchIndex.js` or `SearchModal.js`.

The only requirement is that the new roadmap is:

1. Registered in `src/data/roadmaps.js` via `getAllRoadmaps()`
2. Has its phases returned by `getRoadmapPhases(slug)` in `src/data/index.js`

The `INDEX` array is built by iterating over `getAllRoadmaps()`, so any new entry there is included the next time the app loads.

---

## Limitations and Future Considerations

| Limitation | Notes |
|-----------|-------|
| No fuzzy matching | "closre" will not match "closure" — exact substring match only |
| No highlighting | Matched words are not highlighted in results |
| Index rebuilt on every page load | Negligible cost since data is static; acceptable trade-off for simplicity |
| No keyboard navigation in results | Arrow keys do not move focus between results; Tab works via natural focus order |
| Snippet is raw markdown | The 200-char snippet may contain markdown syntax (backticks, `**`) since `topic.explanation` is stored as markdown strings |
