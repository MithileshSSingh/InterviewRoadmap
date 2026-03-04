# Implementation Plan — Interview Roadmap Platform

> 24 features organized into 6 phases. Each feature includes a detailed prompt you can paste directly into Claude Code.

---

## Phase 1: Foundation & Quality (Do First)

These are non-negotiable improvements that make everything else easier and safer to build.

---

### 1.1 Create CLAUDE.md Project Instructions

**Priority:** Critical | **Effort:** Small | **Dependencies:** None

**Why:** Every future Claude Code session will understand project conventions automatically.

<details>
<summary><strong>(done) Prompt for Claude Code</strong></summary>

```
Create a CLAUDE.md file at the project root for this Next.js 16 / React 19 interview roadmap platform. Analyze the entire codebase first, then document:

1. **Project overview** — what the app does (static interview roadmaps + CareerForge AI roadmap generator)
2. **Tech stack** — Next.js 16.1.6 (App Router), React 19, Tailwind CSS v4, Prisma 7 (SQLite/Turso via libSQL adapter), LangChain/LangGraph, OpenRouter, Tavily
3. **Package manager** — bun (bun.lock exists), fallback npm
4. **Key commands** — dev, build, lint, prisma generate, prisma migrate
5. **Directory structure** — explain src/app/ (pages + API routes), src/components/, src/data/ (static roadmap content), src/lib/ (utilities + careerforge pipeline), src/generated/ (prisma client), prisma/ (schema + migrations)
6. **Coding conventions:**
   - Components are PascalCase.js, lib files are camelCase.ts
   - Mixed JS/TS codebase (components mostly .js, lib files .ts/.tsx)
   - "use client" for interactive components, server components where possible
   - @ alias for src/
   - Styling: CSS classes in globals.css using BEM-ish naming + CSS custom properties (--bg-primary, --accent-blue, etc.), inline styles with CSS vars for dynamic CareerForge components
   - No global state management — useState + ThemeContext only
   - API routes use SSE streaming with base64-encoded JSON payloads
   - Prisma uses cuid() for IDs, singleton client pattern in src/lib/db.ts
7. **Environment variables** — list all: DATABASE_URL, TURSO_AUTH_TOKEN, OPENROUTER_API_KEY, FREE_MODEL, CAREER_MODEL, TAVILY_API_KEY
8. **Important patterns:**
   - Static roadmap data lives in src/data/ (phase1.js, ts-phase1.js, dsa-phase1.js, etc.)
   - Roadmap registry in src/data/roadmaps.js
   - CareerForge pipeline is a LangGraph multi-agent DAG in src/lib/careerforge/pipeline.ts
   - SSE streaming pattern: base64-encode JSON events, stream via ReadableStream
   - Theme system: 6 themes in src/themes.js, applied via CSS variables on document.documentElement

Keep it concise — under 120 lines. Do not add aspirational content or TODOs.
```

</details>

---

### 1.2 Fix the FREE_MODEL Environment Bug

**Priority:** Critical | **Effort:** Tiny | **Dependencies:** None

**Why:** The chat API crashes if `FREE_MODEL` env var is unset.

<details>
<summary><strong>(done) Prompt for Claude Code</strong></summary>

```
Fix a bug in src/app/api/chat/route.ts. On the line where the model name is resolved:

const selectedModel = modelName.includes("/") ? modelName : `google/${modelName}`;

If the FREE_MODEL environment variable is not set, modelName will be undefined, causing a runtime crash on .includes().

Fix this by:
1. Adding a fallback default model: "google/gemini-2.0-flash-001" (same as CAREER_MODEL default)
2. Ensure modelName is always a valid string before the .includes() check
3. Don't change anything else in the file — minimal fix only
```

</details>

---

### 1.3 Set Up Testing Infrastructure (Vitest + React Testing Library)

**Priority:** Critical | **Effort:** Medium | **Dependencies:** None

**Why:** Zero tests exist. Every future feature should have tests.

<details>
<summary><strong>(done)Prompt for Claude Code</strong></summary>

```
Set up a testing infrastructure for this Next.js 16 project. There are currently ZERO tests.

1. Install and configure Vitest (not Jest — Vitest is faster and works better with Next.js):
   - Install: vitest, @vitejs/plugin-react, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
   - Create vitest.config.ts at the project root:
     - Use @vitejs/plugin-react
     - Set environment to jsdom
     - Set globals: true
     - Configure path alias @ → src/
     - Set test include pattern: src/**/*.test.{ts,tsx,js,jsx}
     - Set setupFiles to src/test/setup.ts
   - Create src/test/setup.ts that imports @testing-library/jest-dom

2. Add test scripts to package.json:
   - "test": "vitest run"
   - "test:watch": "vitest"
   - "test:coverage": "vitest run --coverage"

3. Write foundational tests to validate the setup works:
   a. src/data/__tests__/roadmaps.test.js — test getAllRoadmaps() returns correct count, each has required fields (slug, title, emoji, color, description, tags), getRoadmapMeta() returns correct roadmap by slug
   b. src/lib/careerforge/__tests__/schema.test.ts — test the Zod schema validates a valid CareerRoadmap object and rejects invalid ones (missing required fields, wrong types)
   c. src/components/__tests__/Accordion.test.jsx — test Accordion renders items, clicking a header expands the body, clicking again collapses it

4. Run the tests to confirm everything passes.

Use bun for package installation. Follow existing project conventions (@ alias, etc.).
```

</details>

---

### 1.4 Set Up CI/CD with GitHub Actions

**Priority:** High | **Effort:** Small | **Dependencies:** 1.3 (testing)

**Why:** No CI/CD exists. PRs should be validated automatically.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Create a GitHub Actions CI/CD pipeline for this Next.js 16 project. There is currently NO .github directory.

Create .github/workflows/ci.yml with:

1. **Trigger:** on push to main, and on pull_request to main
2. **Jobs:**
   a. **lint-and-test** (runs on ubuntu-latest):
      - Checkout code
      - Setup Node.js 22 with caching for bun
      - Install bun (latest)
      - Install dependencies: bun install
      - Generate Prisma client: bunx prisma generate
      - Run linter: bun run lint
      - Run tests: bun run test
   b. **build** (runs on ubuntu-latest, needs lint-and-test):
      - Same setup steps
      - Run build: bun run build
      - This validates the project compiles without errors

3. **Environment:** Set DATABASE_URL="file:./dev.db" as env var for the workflow (needed for Prisma)

Keep it simple — no deployment step (the user deploys via Vercel). Just validation.
```

</details>

---

### 1.5 Add Rate Limiting Middleware

**Priority:** High | **Effort:** Medium | **Dependencies:** None

**Why:** API routes have no protection — anyone can spam expensive LLM calls.

<details>
<summary><strong>(next) Prompt for Claude Code</strong></summary>

```
Add rate limiting to protect the API routes in this Next.js 16 App Router project. Currently there is NO middleware.ts and NO rate limiting.

Implement a simple, dependency-free rate limiter using an in-memory Map (no Redis needed for this project's scale):

1. Create src/lib/rateLimit.ts:
   - Export a `rateLimit` function that creates a rate limiter instance
   - Use a Map<string, { count: number, resetTime: number }> for tracking
   - Accept config: { interval: number (ms), maxRequests: number }
   - Key by IP address (from x-forwarded-for header or request IP)
   - Return { success: boolean, remaining: number, reset: number }
   - Auto-cleanup expired entries every 60 seconds to prevent memory leaks

2. Create src/middleware.ts (Next.js middleware):
   - Apply rate limiting ONLY to API routes: /api/chat and /api/careerforge/*
   - Rate limits:
     - /api/chat: 30 requests per minute per IP
     - /api/careerforge/generate: 5 requests per minute per IP (most expensive — triggers full pipeline)
     - /api/careerforge/*/stream: 10 requests per minute per IP
     - All other /api/careerforge/* routes: 60 requests per minute per IP
   - On rate limit exceeded: return 429 JSON response with { error: "Too many requests", retryAfter: seconds }
   - Add X-RateLimit-Remaining and X-RateLimit-Reset headers to all API responses
   - Do NOT apply rate limiting to non-API routes (pages, static files)

3. Use the Next.js middleware matcher config to only run on /api/* paths.

Follow existing project conventions. No external dependencies.
```

</details>

---

### 1.6 Update README

**Priority:** Medium | **Effort:** Small | **Dependencies:** None

**Why:** README is outdated — doesn't mention CareerForge, Salesforce roadmap, themes, or the AI chatbot.

<details>
<summary><strong>(done) Prompt for Claude Code</strong></summary>

```
Update the README.md for this project. The current README is outdated and missing major features. Read the existing README first, then rewrite it to include:

1. **Project title and description** — "Interview Roadmap" — a Next.js platform for interview preparation with curated learning roadmaps and an AI-powered personalized career roadmap generator
2. **Key features:**
   - 6 curated static roadmaps (JavaScript, TypeScript, DSA, Sr. Android, Sr. React Native, Salesforce Developer)
   - CareerForge / Roadmap AI: multi-agent AI pipeline that generates personalized career roadmaps
   - Topic-level AI chatbot with text selection "Ask AI" feature
   - 6 themes + dark/light mode
   - Export roadmaps to JSON, Markdown, PDF, Word
   - Topic progress tracking for AI-generated roadmaps
3. **Screenshots section** (placeholder — just add <!-- TODO: Add screenshots --> comments)
4. **Tech stack** section with the full stack
5. **Getting started:**
   - Prerequisites: Node.js 22+, bun
   - Clone, install (bun install), set up env vars (list them with descriptions), generate Prisma (bunx prisma generate), run migrations (bunx prisma migrate dev), start dev server (bun dev)
6. **Environment variables** table
7. **Project structure** — brief directory overview
8. **Available roadmaps** — table with all 6 + 4 coming soon
9. **License** — keep whatever exists or add MIT

Keep it professional but concise. Use the project's actual data and structure.
```

</details>

---

## Phase 2: User Experience Improvements

Features that make the existing platform significantly better for end users.

---

### 2.1 Progress Tracking for Static Roadmaps

**Priority:** High | **Effort:** Medium | **Dependencies:** None

**Why:** CareerForge roadmaps have progress tracking, but the main static roadmaps (JavaScript, DSA, etc.) don't.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add topic completion tracking to the static roadmaps (JavaScript, TypeScript, DSA, Android, React Native, Salesforce). Currently only CareerForge AI-generated roadmaps have progress tracking.

Requirements:

1. **Storage:** Use localStorage (not the database — static roadmaps have no DB record). Key pattern: `roadmap-progress-{slug}` storing a JSON object mapping topicId → { completed: boolean, completedAt: string | null }.

2. **Topic page checkbox** (src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js):
   - Add a "Mark as Complete" / "Completed ✓" toggle button at the top of the topic page, below the topic title
   - Style it similarly to the CareerForge TopicCard checkbox (green when completed, with a subtle animation)
   - On toggle, update localStorage

3. **Phase page progress** (src/app/roadmap/[slug]/[phaseId]/page.js):
   - Show a progress bar at the top of each phase page: "X of Y topics completed"
   - Each topic in the list should show a small checkmark icon if completed
   - Use CSS variables for styling (--accent-green for completed)

4. **Roadmap overview progress** (src/app/roadmap/[slug]/page.js):
   - Each phase card should show completion percentage: "3/8 topics"
   - Add a small progress bar to each phase card
   - Show overall roadmap progress at the top: "Overall: X% complete (N/M topics)"

5. **Home page progress indicators** (src/app/page.js):
   - On each roadmap card, show a subtle progress indicator if the user has started that roadmap (e.g., "5/42 topics completed" or a thin progress bar at the bottom of the card)

6. **Create a custom hook** src/hooks/useRoadmapProgress.js:
   - `useRoadmapProgress(slug)` — returns { getTopicProgress, toggleTopic, getPhaseProgress, getOverallProgress, resetProgress }
   - Handles localStorage read/write with proper SSR safety (check typeof window)

7. **Sidebar progress** (src/components/Sidebar.js):
   - When viewing a roadmap, show phase completion next to each phase name: "Phase 1 (3/8)"

Keep all styling consistent with existing CSS patterns in globals.css. Use CSS custom properties. Add any new CSS classes to globals.css following the existing naming conventions.
```

</details>

---

### 2.2 Global Search

**Priority:** High | **Effort:** Medium | **Dependencies:** None

**Why:** No way to search across roadmaps or topics. Users need to browse manually.

<details>
<summary><strong>(next) Prompt for Claude Code</strong></summary>

```
Add a global search feature to the interview roadmap platform. There is currently no search functionality.

Requirements:

1. **Search index** — Create src/lib/searchIndex.js:
   - At build/init time, create a searchable index from all static roadmap data
   - Index: topic title, topic explanation (first 200 chars), phase title, roadmap title
   - Each entry: { roadmapSlug, roadmapTitle, phaseId, phaseName, topicId, topicTitle, snippet, type: "topic" }
   - Also index roadmap-level entries: { slug, title, description, type: "roadmap" }
   - Export: `searchIndex(query: string, limit?: number)` — simple text matching (case-insensitive, match any word in query). Return results sorted by relevance (title match > explanation match).

2. **Search UI** — Create src/components/SearchModal.js:
   - Triggered by a search icon button in the .top-controls area (next to theme dropdown and mode toggle in layout.js)
   - Also triggered by Cmd+K / Ctrl+K keyboard shortcut
   - Modal overlay with a search input at the top (autofocused)
   - Results appear below as a scrollable list, grouped by roadmap
   - Each result shows: roadmap emoji + topic title + phase name + snippet
   - Click a result → navigate to that topic page → close modal
   - Escape or clicking backdrop closes the modal
   - Show "No results found" for empty searches
   - Debounce input by 200ms

3. **Styling:**
   - Use the glass morphism pattern from existing CSS (--glass, --glass-border)
   - Search input: large, prominent, with a 🔍 icon
   - Results: similar to sidebar nav items styling
   - Animate in with a subtle scale + fade
   - Add CSS classes to globals.css following existing conventions: .search-modal, .search-overlay, .search-input, .search-results, .search-result-item, etc.

4. **Integration:**
   - Add the search button to src/app/layout.js in the .top-controls div
   - The modal should be rendered at the layout level (portal or direct child)

Keep it client-side only — no API route needed since all data is static.
```

</details>

---

### 2.3 Bookmarks / Favorites System

**Priority:** Medium | **Effort:** Small | **Dependencies:** None

**Why:** Users can't save specific topics they want to revisit later.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add a bookmarks/favorites system to the interview roadmap platform so users can save topics they want to revisit.

Requirements:

1. **Storage hook** — Create src/hooks/useBookmarks.js:
   - Store in localStorage key: "roadmap-bookmarks"
   - Shape: array of { roadmapSlug, phaseId, topicId, topicTitle, roadmapTitle, phaseName, bookmarkedAt }
   - Exports: { bookmarks, addBookmark, removeBookmark, isBookmarked, clearBookmarks }
   - SSR-safe (check typeof window)

2. **Bookmark button on topic pages** (src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js):
   - Add a bookmark toggle icon (🔖 outlined when not bookmarked, filled when bookmarked) next to the topic title
   - Subtle animation on toggle (scale bounce)

3. **Bookmarks page** — Create src/app/bookmarks/page.js:
   - List all bookmarked topics, grouped by roadmap
   - Each item shows: roadmap emoji, topic title, phase name, bookmarked date
   - Click navigates to the topic
   - "Remove" button on each item
   - "Clear all bookmarks" button at the top
   - Empty state: "No bookmarks yet. Browse roadmaps and bookmark topics you want to revisit."

4. **Sidebar integration** (src/components/Sidebar.js):
   - Add a "🔖 Bookmarks" link below the Settings link at the bottom of the sidebar
   - Show a badge with bookmark count if > 0

5. **Styling:** Follow existing CSS patterns. Add new classes to globals.css. Use .bookmarks-page, .bookmark-item, .bookmark-btn, etc.
```

</details>

---

### 2.4 Mobile Responsiveness Audit & Fix

**Priority:** Medium | **Effort:** Medium | **Dependencies:** None

**Why:** The sidebar is collapsible but many components haven't been tested on small screens.

<details>
<summary><strong>(done) Prompt for Claude Code</strong></summary>

```
Perform a comprehensive mobile responsiveness audit and fix issues in this Next.js interview roadmap platform.

Review and fix these areas:

1. **Home page** (src/app/page.js + globals.css):
   - .roadmaps-grid: ensure cards stack properly on mobile (single column below 480px)
   - .hero: check text sizing and spacing
   - CareerForge CTA card: should be full-width on mobile

2. **Topic page** (src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js):
   - Code blocks: must be horizontally scrollable, not overflow the viewport
   - .topic-nav (prev/next): stack vertically on small screens
   - Long topic titles: handle text wrapping

3. **CareerForge form page** (src/app/careerforge/page.js):
   - Experience level button group: wrap to 2 rows on mobile instead of overflowing
   - History cards: single column layout
   - Form should be full-width with proper padding

4. **CareerForge roadmap view** (src/components/careerforge/RoadmapView.js and child components):
   - Tab bar: horizontally scrollable if tabs overflow
   - Salary table, interview rounds table: horizontally scrollable on small screens
   - Phase accordion content: proper padding on mobile

5. **Chatbot** (src/components/TopicChatBot.tsx):
   - Drawer should be full-width on mobile (not fixed width)
   - Selection tooltip: position correctly on mobile, don't overflow viewport
   - Input area: proper sizing with mobile keyboard

6. **Top controls** (.top-controls in globals.css):
   - Don't overlap with mobile menu button
   - Stack or use compact layout below 600px

7. **Settings page** (src/app/settings/page.js):
   - Theme grid: 1 column on mobile, 2 on tablet

8. **General:**
   - Ensure no horizontal scroll on any page at 320px width
   - Touch targets: minimum 44px for all interactive elements
   - Add proper viewport meta tag if missing

Only modify globals.css for style changes and component files where structural changes are needed. Add media queries at the appropriate breakpoints (existing: 900px for sidebar, 480px for small). Test mentally at 320px, 375px, 768px widths.
```

</details>

---

## Phase 3: Authentication & Data Persistence

Moving from anonymous localStorage sessions to proper user accounts.

---

### 3.1 User Authentication with NextAuth.js

**Priority:** High | **Effort:** Large | **Dependencies:** None

**Why:** Currently users are anonymous (localStorage UUID). Auth enables cross-device access, data ownership, and opens the door for social features.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add user authentication to this Next.js 16 App Router project using NextAuth.js v5 (Auth.js). Currently there is NO authentication — sessions use a random localStorage UUID.

Requirements:

1. **Install NextAuth.js v5:**
   - Install: next-auth@beta @auth/prisma-adapter
   - This project uses Prisma 7 with SQLite/Turso

2. **Update Prisma schema** (prisma/schema.prisma):
   - Add the standard NextAuth models: User, Account, Session, VerificationToken
   - Add a relation from Roadmap to User (optional — keep sessionId for backward compat during migration)
   - Add relation: User has many Roadmap records
   - Run prisma migrate dev to generate migration

3. **Auth configuration** — Create src/lib/auth.ts:
   - Configure NextAuth with PrismaAdapter
   - Providers (start simple):
     a. GitHub OAuth (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET env vars)
     b. Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET env vars)
     c. Email/Magic Link (using Resend — RESEND_API_KEY env var) — optional, can be added later
   - Session strategy: "database" (for Prisma adapter)
   - Add user.id to the session via callbacks

4. **Auth API route** — Create src/app/api/auth/[...nextauth]/route.ts:
   - Export GET, POST handlers from the auth config

5. **Session Provider** — Update src/app/layout.js:
   - Wrap the app with NextAuth's SessionProvider
   - Keep existing ThemeProvider wrapping

6. **Auth UI components:**
   a. Create src/components/AuthButton.js — shows "Sign In" or user avatar + dropdown (Sign Out, My Roadmaps)
   b. Place it in the .top-controls area in layout.js
   c. Sign-in page: Create src/app/auth/signin/page.js — simple page with provider buttons (GitHub, Google icons), styled consistently with the app's theme

7. **Protect CareerForge API routes:**
   - In src/app/api/careerforge/generate/route.ts: check for authenticated session. If authenticated, associate roadmap with user.id. If not authenticated, fall back to sessionId (keep backward compat).
   - In src/app/api/careerforge/history/route.ts: if authenticated, query by userId; else by sessionId
   - Do NOT protect the chat API (keep it open for anonymous topic browsing)

8. **Migration helper:**
   - When a user signs in for the first time, check localStorage for cf-session-id
   - If found, migrate any existing roadmaps from that sessionId to the new userId
   - Clear the localStorage sessionId after migration

9. **Environment variables to add:**
   - NEXTAUTH_URL, NEXTAUTH_SECRET
   - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
   - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

Update CLAUDE.md (if it exists) with the new auth setup. Keep all existing functionality working for non-authenticated users.
```

</details>

---

### 3.2 Shareable Roadmap Links

**Priority:** Medium | **Effort:** Small | **Dependencies:** 3.1 (nice to have, not required)

**Why:** Users can't share their AI-generated roadmaps with others.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add shareable link functionality for CareerForge AI-generated roadmaps.

Requirements:

1. **Database update** — Add to Roadmap model in prisma/schema.prisma:
   - `isPublic Boolean @default(false)` — whether the roadmap is publicly accessible
   - `shareSlug String? @unique` — short unique slug for public URL (e.g., "abc123xy")
   - Run prisma migrate dev

2. **Share API** — Create src/app/api/careerforge/[id]/share/route.ts:
   - POST: Toggle sharing on/off for a roadmap. Generate a random 8-char alphanumeric shareSlug when enabling. Return { isPublic, shareUrl }.
   - Only the roadmap owner (by sessionId or userId) can toggle sharing.

3. **Public view route** — Create src/app/shared/[shareSlug]/page.js:
   - Server component that fetches the roadmap by shareSlug
   - If not found or not public → show 404
   - Render a read-only version of RoadmapView (no progress tracking, no delete, no edit)
   - Add "Generated with Interview Roadmap" branding at the bottom
   - Add Open Graph meta tags for social sharing (title: "{role} at {company} Career Roadmap", description)

4. **Share button UI** — Update the CareerForge roadmap page (src/app/careerforge/[id]/page.js):
   - Add a "Share" button in the roadmap header area
   - On click: call share API → show a modal/popover with the shareable URL + copy button
   - Toggle: "Make Public" / "Make Private" switch
   - Show link only when public

5. **Copy to clipboard** — use navigator.clipboard.writeText() with a "Copied!" feedback toast

Style consistently with existing components. Use CSS variables.
```

</details>

---

### 3.3 Data Cleanup / TTL for Anonymous Roadmaps

**Priority:** Medium | **Effort:** Small | **Dependencies:** None

**Why:** Anonymous roadmaps accumulate indefinitely in SQLite with no cleanup mechanism.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add a data cleanup mechanism for old anonymous CareerForge roadmaps. Currently roadmaps accumulate indefinitely in the SQLite database.

Requirements:

1. **Cleanup API route** — Create src/app/api/careerforge/cleanup/route.ts:
   - POST with an authorization header (simple shared secret: CLEANUP_SECRET env var)
   - Delete roadmaps where:
     a. status is "error" and createdAt is older than 24 hours
     b. status is "pending" and createdAt is older than 1 hour (stale/abandoned)
     c. No associated userId (anonymous) and createdAt is older than 30 days
     d. Do NOT delete roadmaps that have isPublic = true (if share feature exists) or have a userId
   - Cascade delete related TopicProgress and AgentRun records
   - Return { deleted: number, errors: number }

2. **Cleanup on startup** (optional, lightweight) — In src/lib/db.ts:
   - Add a function `cleanupStaleRoadmaps()` that deletes pending roadmaps older than 1 hour and error roadmaps older than 24 hours
   - Call it once on Prisma client initialization (only in production, not dev)
   - Wrap in try/catch so it never blocks app startup

3. **Vercel Cron** (optional) — Create vercel.json if it doesn't exist:
   - Add a cron job that calls the cleanup API daily:
   ```
   { "crons": [{ "path": "/api/careerforge/cleanup", "schedule": "0 3 * * *" }] }
   ```

4. **Environment variable:** Add CLEANUP_SECRET to the env var documentation.

Keep it simple. No complex scheduling — just an API endpoint that can be called by Vercel Cron or manually.
```

</details>

---

## Phase 4: New Content & Roadmaps

Expanding the content library.

---

### 4.1 Complete the "Coming Soon" Roadmaps — React

**Priority:** High | **Effort:** Large | **Dependencies:** None

**Why:** React is the #1 most in-demand frontend framework. It's listed as "Coming Soon" and users are waiting.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Create a comprehensive React interview roadmap for this platform. React is currently listed as "comingSoon: true" in src/data/roadmaps.js.

First, study the existing roadmap format by reading:
- src/data/roadmaps.js (registry format)
- src/data/index.js (how phases are aggregated)
- src/data/phase1.js (JavaScript phase 1 — to understand the exact data structure)
- src/data/rn-phase1.js (React Native phase 1 — closest to React)

Then create the React roadmap:

1. **Update src/data/roadmaps.js:**
   - Change React entry from comingSoon: true to comingSoon: false (remove or set to false)
   - slug: "react", emoji: "⚛️"

2. **Create data files** following the exact same structure as existing roadmaps. Each topic must have: id, title, explanation (detailed markdown), codeExample, exercise, commonMistakes (array of strings), interviewQuestions (array of {question, answer}).

   Create these phase files in src/data/:
   - react-phase1.js — React Fundamentals (JSX, Components, Props, State, Events, Conditional Rendering, Lists & Keys)
   - react-phase2.js — Hooks Deep Dive (useState, useEffect, useContext, useRef, useMemo, useCallback, useReducer, Custom Hooks)
   - react-phase3.js — Advanced Patterns (Compound Components, Render Props, HOCs, Error Boundaries, Portals, Suspense, React.lazy)
   - react-phase4.js — State Management (Context API patterns, Redux Toolkit, Zustand, Jotai, Server State with TanStack Query)
   - react-phase5.js — Performance Optimization (React.memo, useMemo, useCallback, Code Splitting, Virtualization, Profiler, Reconciliation)
   - react-phase6.js — React 19 & Modern Features (Server Components, Server Actions, use() hook, React Compiler, Concurrent Features, Transitions)
   - react-phase7.js — Testing & Best Practices (React Testing Library, Component Testing, Integration Tests, Accessibility, Project Structure)

3. **Register in src/data/index.js:**
   - Import all react-phase files
   - Add to the phases map with slug "react"

4. Each topic should have:
   - Real, runnable code examples (modern React 18/19 syntax)
   - Practical exercises that test understanding
   - Common mistakes that interviewers look for
   - 3-5 interview questions per topic with detailed answers
   - Explanations that go beyond basics — include "why" and "how it works under the hood"

Make the content interview-focused — this is for people preparing for React interviews at top tech companies, not beginners learning React for the first time.
```

</details>

---

### 4.2 Complete the "Coming Soon" Roadmaps — Node.js

**Priority:** High | **Effort:** Large | **Dependencies:** None

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Create a comprehensive Node.js interview roadmap. Node.js is currently "comingSoon: true" in src/data/roadmaps.js.

Study existing roadmap format by reading src/data/phase1.js and src/data/roadmaps.js and src/data/index.js first.

1. **Update src/data/roadmaps.js:** Set Node.js comingSoon to false. slug: "nodejs", emoji: "🟢"

2. **Create data files** in src/data/:
   - node-phase1.js — Node.js Core (Event Loop, V8 Engine, Modules (CJS vs ESM), Streams, Buffers, File System, Process & Child Processes)
   - node-phase2.js — Async Patterns (Callbacks, Promises, async/await, Event Emitters, Worker Threads, Cluster Module)
   - node-phase3.js — HTTP & Networking (http/https modules, TCP/UDP, WebSockets, HTTP/2, TLS/SSL)
   - node-phase4.js — Express & Frameworks (Express middleware, routing, error handling, Fastify comparison, Nest.js overview, API design patterns)
   - node-phase5.js — Databases (MongoDB + Mongoose, PostgreSQL + Prisma/Knex, Redis, Connection Pooling, Transactions, ORMs vs Query Builders)
   - node-phase6.js — Authentication & Security (JWT, OAuth2, Sessions, bcrypt, CORS, Helmet, Rate Limiting, Input Validation, OWASP Top 10 for Node)
   - node-phase7.js — Testing & DevOps (Vitest/Jest, Supertest, Mocking, Docker, PM2, Logging with Pino/Winston, Health Checks, Graceful Shutdown)
   - node-phase8.js — Performance & Scaling (Profiling, Memory Leaks, Load Balancing, Caching strategies, Message Queues, Microservices patterns)

3. **Register in src/data/index.js**

4. Each topic must match the exact existing data structure: id, title, explanation (markdown), codeExample, exercise, commonMistakes[], interviewQuestions[{question, answer}].

Focus on senior-level interview content — cover "how does Node.js actually work" questions, not just "how to use Express."
```

</details>

---

### 4.3 Complete the "Coming Soon" Roadmaps — Python

**Priority:** Medium | **Effort:** Large | **Dependencies:** None

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Create a comprehensive Python interview roadmap. Python is currently "comingSoon: true" in src/data/roadmaps.js.

Study existing format first: read src/data/phase1.js, src/data/roadmaps.js, src/data/index.js.

1. **Update src/data/roadmaps.js:** Set Python comingSoon to false. slug: "python", emoji: "🐍"

2. **Create data files** in src/data/:
   - py-phase1.js — Python Core (Data Types, Mutability, List/Dict/Set comprehensions, Generators, Iterators, Decorators, Context Managers)
   - py-phase2.js — OOP & Advanced (Classes, Inheritance, MRO, Metaclasses, Descriptors, Abstract Base Classes, Dataclasses, Protocols)
   - py-phase3.js — Concurrency (Threading, Multiprocessing, asyncio, GIL, Coroutines, Futures, Thread Pools, Event Loops)
   - py-phase4.js — Data Structures & Algorithms in Python (Collections module, heapq, bisect, sorting internals (Timsort), Big-O of built-in operations)
   - py-phase5.js — Web Development (Flask, FastAPI, Django overview, WSGI/ASGI, Middleware, SQLAlchemy, Pydantic, REST API patterns)
   - py-phase6.js — Testing & Quality (pytest, unittest, mocking, fixtures, coverage, mypy type checking, linting, virtual environments)
   - py-phase7.js — System Design with Python (Celery, Redis queues, Docker, CI/CD, Logging, Monitoring, Memory Profiling, C extensions)

3. **Register in src/data/index.js**

4. Match the exact data structure. Focus on Python-specific interview topics (GIL, mutability gotchas, metaclasses, asyncio event loop internals, etc.)
```

</details>

---

### 4.4 Complete the "Coming Soon" Roadmaps — CSS

**Priority:** Medium | **Effort:** Large | **Dependencies:** None

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Create a comprehensive CSS interview roadmap. CSS is currently "comingSoon: true" in src/data/roadmaps.js.

Study existing format first: read src/data/phase1.js, src/data/roadmaps.js, src/data/index.js.

1. **Update src/data/roadmaps.js:** Set CSS comingSoon to false. slug: "css", emoji: "🎨"

2. **Create data files** in src/data/:
   - css-phase1.js — CSS Fundamentals (Selectors & Specificity, Box Model, Display property, Positioning, Float & Clear, CSS Units, Cascade & Inheritance)
   - css-phase2.js — Layout Systems (Flexbox deep dive, CSS Grid deep dive, Multi-column layout, Responsive Design, Media Queries, Container Queries)
   - css-phase3.js — Visual & Typography (Colors & Gradients, Backgrounds, Borders & Border-radius, Box Shadow, Text styling, Web Fonts, @font-face, Variable Fonts)
   - css-phase4.js — Animations & Transforms (Transitions, Keyframe Animations, 2D/3D Transforms, Performance (compositing, will-change), Scroll-driven Animations)
   - css-phase5.js — Modern CSS (Custom Properties (CSS Variables), :has() selector, Container Queries, Cascade Layers (@layer), Subgrid, Nesting, @scope, View Transitions)
   - css-phase6.js — Architecture & Methodology (BEM, OOCSS, ITCSS, CSS Modules, CSS-in-JS, Tailwind CSS, Design Tokens, Theming Patterns)
   - css-phase7.js — Debugging & Performance (DevTools CSS debugging, Repaint/Reflow, Critical CSS, Code splitting CSS, Accessibility (prefers-reduced-motion, forced-colors, contrast), Print styles)

3. **Register in src/data/index.js**

4. Match exact data structure. Include visual examples in code (describe what to expect). Focus on interview questions asked at top companies.
```

</details>

---

## Phase 5: AI-Powered Features

Leveraging the existing AI infrastructure for powerful new capabilities.

---

### 5.1 Mock Interview Chatbot

**Priority:** High | **Effort:** Large | **Dependencies:** None

**Why:** The existing chatbot explains topics — but practicing interviews is what users actually need.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add a Mock Interview mode to the existing topic chatbot. Currently the TopicChatBot only answers questions — it should also be able to conduct mock interviews.

Requirements:

1. **New API route** — Create src/app/api/interview/route.ts:
   - Similar structure to src/app/api/chat/route.ts (SSE streaming via LangGraph)
   - System prompt for interview mode:
     - Act as a technical interviewer at a top tech company
     - Ask one question at a time, wait for the user's answer
     - After the user answers: evaluate their answer (what was good, what was missing, what could be improved), give a score (1-5), then ask the next question
     - Support interview types: "technical" (coding/concepts), "behavioral" (STAR framework), "system-design"
     - Context-aware: receives the current topic/roadmap data to ask relevant questions
     - After 5 questions, give an overall assessment with strengths, weaknesses, and tips
   - Accept: { messages, topicContent, interviewType, roadmapSlug }

2. **Update TopicChatBot.tsx** — Add a mode toggle:
   - Two modes: "Chat" (existing) and "Mock Interview" (new)
   - Mode selector: small toggle/tab at the top of the chat drawer
   - In Mock Interview mode:
     - Different empty state: "Start a mock interview on this topic" with buttons for interview type (Technical / Behavioral / System Design)
     - Different styling: slightly different header color to distinguish modes
     - The bot initiates the conversation by asking the first question
     - Show score badges inline after each evaluation (⭐ 4/5)
   - Chat history is separate per mode

3. **Create streaming client** — Create src/lib/interviewClient.ts:
   - Similar to src/lib/chatClient.ts but hits /api/interview
   - Sends topicContent and interviewType in the request

4. **Interview summary** — After the interview ends (5 questions or user says "end"):
   - Show a summary card in the chat:
     - Overall score
     - Strengths (green bullets)
     - Areas to improve (amber bullets)
     - Suggested topics to study
   - Style as a distinct card within the chat, not just plain text

5. **Standalone interview page** (optional but recommended) — Create src/app/interview/page.js:
   - A full-page interview experience (not in the drawer)
   - User selects: roadmap → phase → topic (or "general" for the whole roadmap)
   - Selects interview type
   - Full-screen chat interface
   - Link to this from the home page and sidebar

Keep the existing chat functionality 100% intact. The mock interview is an additional mode.
```

</details>

---

### 5.2 Code Playground (Embedded Editor)

**Priority:** Medium | **Effort:** Large | **Dependencies:** None

**Why:** Users read code examples but can't practice in the app. They have to copy-paste to an external editor.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add an embedded code playground to topic pages so users can run and edit code examples directly in the browser.

Requirements:

1. **Install Monaco Editor:**
   - Install: @monaco-editor/react
   - This is the VS Code editor component for React

2. **Create CodePlayground component** — src/components/CodePlayground.js:
   - "use client" component
   - Props: { code: string, language: string, height?: string }
   - Layout: Editor on left/top, output console on right/bottom (split view, resizable)
   - Editor: Monaco editor with the code pre-filled, syntax highlighting matching the language
   - Theme: detect dark/light mode from ThemeProvider context, use "vs-dark" or "vs-light" accordingly
   - "Run" button (▶️): executes JavaScript code using a sandboxed approach:
     - Create an iframe sandbox with sandbox="allow-scripts"
     - Inject the code into the iframe
     - Capture console.log, console.error output via postMessage
     - Display output in the console panel
     - Set a 5-second timeout to kill infinite loops
   - "Reset" button: restore the original code
   - "Copy" button: copy current code to clipboard
   - For non-JavaScript languages (TypeScript, Python): show "Run" as disabled with tooltip "JavaScript execution only" — still allow editing and copying

3. **Integrate into topic pages** (src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js):
   - Replace or augment the existing CodeBlock component in the "Code Example" section
   - Show a toggle: "View" (static CodeBlock, current behavior) | "Playground" (interactive editor)
   - Default to "View" for performance (Monaco is heavy — lazy load the playground)
   - Use React.lazy() + Suspense for the CodePlayground component

4. **Exercise mode:**
   - In the "Practice Exercise" section, add a "Try it" button that opens the playground
   - Pre-fill with a starter template based on the exercise description
   - Show the exercise instructions above the editor

5. **Styling:**
   - Editor container: .code-playground class, border matching --border variable
   - Console output: dark background, monospace font, green for logs, red for errors
   - Responsive: stack editor and console vertically on mobile
   - Add styles to globals.css

6. **Performance:**
   - Lazy load Monaco (it's ~2MB). Only load when user clicks "Playground" tab
   - Use dynamic import: const CodePlayground = dynamic(() => import('@/components/CodePlayground'), { ssr: false })
```

</details>

---

### 5.3 Quiz / Assessment System

**Priority:** Medium | **Effort:** Large | **Dependencies:** None

**Why:** Users need to validate their understanding. Reading content is passive — quizzes are active learning.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add a quiz/assessment system to the interview roadmap platform so users can test their knowledge after studying topics.

Requirements:

1. **Quiz data structure** — Add to each topic in the data files (src/data/*.js):
   - Don't modify existing data files yet — create a separate quiz data layer
   - Create src/data/quizzes/ directory
   - Create quiz files per roadmap: src/data/quizzes/javascript.js, etc.
   - Structure:
     ```
     {
       topicId: "closures",
       questions: [
         {
           id: "closures-q1",
           type: "multiple-choice", // or "true-false" or "code-output"
           question: "What will this code output?",
           code: "...", // optional code snippet
           options: ["A) undefined", "B) 10", "C) ReferenceError", "D) null"],
           correctAnswer: 1, // index
           explanation: "Because closures capture..."
         }
       ]
     }
     ```

2. **Quiz generation API** (AI-powered) — Create src/app/api/quiz/generate/route.ts:
   - POST: Accept { topicContent, difficulty: "easy"|"medium"|"hard", count: number }
   - Use the same LLM setup as the chat API (OpenRouter)
   - System prompt: Generate quiz questions based on the topic content
   - Return structured JSON matching the quiz data format
   - This is for topics that don't have static quiz data — AI generates questions on the fly
   - Cache generated quizzes in localStorage to avoid re-generating

3. **Quiz component** — Create src/components/Quiz.js:
   - Props: { questions: Question[], topicTitle: string }
   - Step-through interface: one question at a time
   - Question types:
     a. Multiple choice: radio buttons
     b. True/False: two buttons
     c. Code output: show code, ask what it outputs (multiple choice)
   - After answering: immediately show if correct/incorrect + explanation
   - Progress bar at top: "Question 3 of 10"
   - Navigation: "Next" button (no going back to prevent gaming)
   - Results screen at end:
     - Score: 8/10 (80%)
     - Time taken
     - Review: list of questions with your answer vs correct answer
     - "Retake Quiz" button
     - "Continue to next topic" link

4. **Integration into topic pages** (src/app/roadmap/[slug]/[phaseId]/[topicId]/page.js):
   - Add a "Take Quiz" section at the bottom of each topic page (after Interview Questions)
   - Button: "🧪 Test Your Knowledge" — opens the quiz inline (not a separate page)
   - First check for static quiz data, if none exists, offer "Generate Quiz with AI" button
   - Show previous best score if exists (stored in localStorage)

5. **Phase-level assessment** (src/app/roadmap/[slug]/[phaseId]/page.js):
   - Add "Take Phase Assessment" button that combines questions from all topics in the phase
   - Shows overall phase score + per-topic breakdown

6. **Scoring persistence** — Use localStorage:
   - Key: `quiz-scores-{roadmapSlug}`
   - Value: { [topicId]: { bestScore, attempts, lastAttempt } }

7. **Styling:** Follow existing patterns. Quiz card should feel interactive and engaging. Use --accent-green for correct, --accent-red for incorrect, smooth transitions between questions.
```

</details>

---

### 5.4 Comparative Role/Company Analysis

**Priority:** Low | **Effort:** Medium | **Dependencies:** None

**Why:** Users often want to compare two roles or companies before deciding where to focus their prep.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add a comparative analysis feature to CareerForge that lets users compare two roles or companies side-by-side.

Requirements:

1. **Compare page** — Create src/app/careerforge/compare/page.js:
   - "use client" component
   - UI: Two columns, each with role + company + experience level dropdowns/inputs
   - "Compare" button triggers the comparison
   - Uses existing CareerForge roadmap data if available (from history), otherwise generates new

2. **Comparison view** — Create src/components/careerforge/ComparisonView.js:
   - Side-by-side layout (stacked on mobile)
   - Sections to compare:
     a. **Salary Intel**: table showing both roles' salary ranges side by side
     b. **Interview Process**: rounds comparison (how many, what types)
     c. **Required Skills**: Venn diagram-style view — shared skills in the middle, unique skills on each side (use colored tags, not an actual SVG diagram)
     d. **Study Timeline**: which takes longer to prepare for
     e. **Difficulty Assessment**: AI-generated comparison of interview difficulty
   - Highlight key differences with accent colors

3. **Compare API** — Create src/app/api/careerforge/compare/route.ts:
   - POST: Accept { roadmap1Id, roadmap2Id } (both must be completed roadmaps)
   - Fetch both roadmaps from DB
   - Use LLM to generate a structured comparison summary
   - Return comparison data

4. **Integration:**
   - Add "Compare" button on the CareerForge history page (select two roadmaps → compare)
   - Add link to compare page from the CareerForge main page

5. **Styling:** Use existing CSS variable patterns. Two-column responsive layout.
```

</details>

---

## Phase 6: Polish & Advanced Features

Final polish and advanced capabilities.

---

### 6.1 Notification System

**Priority:** Low | **Effort:** Small | **Dependencies:** None

**Why:** CareerForge roadmap generation takes 1-3 minutes. Users navigate away and don't know when it's done.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add browser notifications to alert users when their CareerForge roadmap finishes generating.

Requirements:

1. **Notification hook** — Create src/hooks/useNotifications.js:
   - Request notification permission on first CareerForge use
   - Export: { requestPermission, sendNotification, isSupported, permission }
   - sendNotification({ title, body, onClick }) — uses the Notification API
   - onClick: focus the tab and navigate to the roadmap

2. **Integrate with CareerForge streaming** — Update src/app/careerforge/[id]/page.js:
   - When the SSE stream emits a "complete" event, send a browser notification:
     - Title: "Your roadmap is ready! 🎉"
     - Body: "{role} at {company} career roadmap is complete"
     - onClick: scroll to the roadmap view / focus the tab
   - When "error" event: notify "Roadmap generation failed"
   - Only send notification if the tab is NOT focused (use document.hidden)

3. **Permission prompt** — On the CareerForge form page (src/app/careerforge/page.js):
   - After the user submits the form, if notification permission is "default", show a subtle banner: "Enable notifications to know when your roadmap is ready" with "Enable" / "Maybe later" buttons
   - If already granted, don't show anything
   - If denied, don't show anything (respect the user's choice)

4. **No external dependencies.** Use the native Notification API only.
```

</details>

---

### 6.2 Spaced Repetition / Review System

**Priority:** Low | **Effort:** Medium | **Dependencies:** 2.1 (progress tracking)

**Why:** Users study topics once but forget. A review system surfaces topics that need refreshing.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add a spaced repetition review system that reminds users to revisit topics based on forgetting curves.

Requirements:

1. **Review algorithm** — Create src/lib/spacedRepetition.js:
   - Implement a simplified SM-2 algorithm (SuperMemo 2)
   - Track per topic: { lastReviewed: Date, interval: number (days), easeFactor: number, nextReview: Date }
   - When a user marks a topic as complete (from feature 2.1), initialize it in the review system
   - After reviewing: user rates confidence (1-4: Forgot / Hard / Good / Easy)
   - Calculate next review date based on the rating
   - Export: { getTopicsDueForReview, recordReview, getReviewStats }

2. **Storage:** localStorage key: `review-schedule-{roadmapSlug}`

3. **Review page** — Create src/app/review/page.js:
   - "use client" page
   - Shows topics due for review today, grouped by roadmap
   - Each item: topic title, roadmap name, days since last review, "Review" button
   - Clicking "Review" navigates to the topic page with a review banner at top
   - After reviewing, user rates their confidence → updates the schedule
   - If no topics are due: "All caught up! 🎉 Your next review is in X days."

4. **Review banner on topic pages** — When accessing a topic that's due for review:
   - Show a subtle banner at the top: "This topic is due for review"
   - After reading, show confidence rating buttons: "How well did you remember this?"
   - Buttons: Forgot (1) / Hard (2) / Good (3) / Easy (4)

5. **Dashboard widget** — On the home page (src/app/page.js):
   - If the user has any topics due for review, show a "Review Due" card at the top:
   - "You have X topics to review today" with a "Start Review" link
   - Only show if they have progress tracking data

6. **Sidebar indicator** (src/components/Sidebar.js):
   - Show a small badge on "Review" link if topics are due

7. **Add "📝 Review" link** to the sidebar navigation, between Bookmarks and Settings.

No external dependencies. Pure localStorage + the SM-2 algorithm.
```

</details>

---

### 6.3 Analytics Dashboard (Admin)

**Priority:** Low | **Effort:** Medium | **Dependencies:** None

**Why:** Understanding usage patterns helps prioritize features.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add a simple admin analytics dashboard to see usage stats for the platform.

Requirements:

1. **Analytics API** — Create src/app/api/admin/stats/route.ts:
   - Protected by a simple ADMIN_SECRET env var (checked in Authorization header)
   - Query the database for:
     a. Total roadmaps generated (all time, last 7 days, last 30 days)
     b. Roadmaps by status (pending, running, complete, error) — counts
     c. Most popular roles (top 10 role names + count)
     d. Most popular companies (top 10 company names + count)
     e. Average generation success rate (complete / total)
     f. Experience level distribution
     g. Agent run statistics (average duration per agent, error rates)
   - Return structured JSON

2. **Admin page** — Create src/app/admin/page.js:
   - "use client" page
   - Simple password prompt on first visit (stores ADMIN_SECRET in sessionStorage)
   - Dashboard layout:
     a. **Summary cards** row: Total Roadmaps, Success Rate, This Week, Active Today
     b. **Charts section** (use simple CSS-based charts, no charting library):
        - Bar chart: roadmaps per day (last 30 days) — simple CSS bars
        - Horizontal bar chart: top roles
        - Horizontal bar chart: top companies
        - Pie chart (CSS conic-gradient): experience level distribution
     c. **Recent roadmaps** table: last 20, showing role, company, status, created date

3. **Styling:**
   - Use CSS Grid for dashboard layout
   - Cards styled like the roadmap cards on the home page
   - Charts: pure CSS (no dependencies) — CSS custom properties for colors
   - Responsive: 2 columns on desktop, single column on mobile

4. **No link in sidebar** — this is an admin-only page accessed directly via /admin

5. **Environment variable:** ADMIN_SECRET — document in env vars list

No external charting libraries. Pure CSS visualizations.
```

</details>

---

### 6.4 PWA / Offline Support

**Priority:** Low | **Effort:** Medium | **Dependencies:** None

**Why:** Users studying on commutes or in areas with poor connectivity would benefit from offline access.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add Progressive Web App (PWA) support to this Next.js interview roadmap platform for offline access to static roadmap content.

Requirements:

1. **Install next-pwa:**
   - Install: next-pwa (or @ducanh2912/next-pwa for Next.js 14+ support)
   - Configure in next.config.mjs

2. **Web App Manifest** — Create public/manifest.json:
   - name: "Interview Roadmap"
   - short_name: "Roadmap"
   - description: "Interview preparation platform with curated roadmaps and AI-powered career guidance"
   - theme_color: match emerald-forest theme primary (#0a1a0f)
   - background_color: match emerald-forest background
   - display: "standalone"
   - icons: create placeholder icons (192x192 and 512x512) — can use simple colored squares with "IR" text for now

3. **Service Worker caching strategy:**
   - Cache-first for static roadmap pages (/roadmap/*)
   - Cache-first for static assets (CSS, JS, fonts, images)
   - Network-first for API routes (chat, careerforge) — don't cache these
   - Network-first for the CareerForge pages (they need live data)
   - Precache: home page, all roadmap overview pages, settings page

4. **Offline indicator** — Create src/components/OfflineIndicator.js:
   - Detect online/offline status via navigator.onLine + event listeners
   - When offline: show a subtle banner at the top of the page: "You're offline. Cached content is available."
   - When back online: briefly show "Back online" then hide
   - Add to layout.js

5. **Meta tags** — Update src/app/layout.js:
   - Add manifest link
   - Add theme-color meta tag
   - Add apple-mobile-web-app-capable meta tags

6. **Install prompt** — On the home page, if the PWA install prompt is available (beforeinstallprompt event), show a subtle "Install App" button in the hero section.

Keep the service worker config minimal. The goal is offline access to study content, not full offline support for AI features.
```

</details>

---

### 6.5 Community / User-Generated Roadmaps

**Priority:** Low | **Effort:** Very Large | **Dependencies:** 3.1 (auth)

**Why:** Let users create and share custom roadmaps, building a community around the platform.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Add the ability for authenticated users to create, publish, and browse community-created roadmaps.

Requirements:

1. **Database models** — Update prisma/schema.prisma:
   - Add CommunityRoadmap model:
     - id, authorId (-> User), title, slug (unique), emoji, color, description, tags (JSON)
     - status: draft | published | archived
     - phases: JSON (array of phases with topics)
     - likes: Int @default(0)
     - views: Int @default(0)
     - createdAt, updatedAt
   - Add CommunityRoadmapLike model: userId + roadmapId unique pair
   - Run migration

2. **Roadmap builder page** — Create src/app/community/create/page.js:
   - Multi-step form:
     a. Step 1 — Metadata: title, emoji picker, accent color picker, description, tags
     b. Step 2 — Phases: add/remove/reorder phases. Each phase has: title, description, duration
     c. Step 3 — Topics: within each phase, add topics with: title, explanation (markdown editor), code example, exercise, interview questions
     d. Step 4 — Preview: show the roadmap as it will appear to users
     e. Step 5 — Publish: save as draft or publish immediately
   - Use a rich markdown editor (textarea with markdown preview, not a full WYSIWYG — keep it simple)
   - Auto-save drafts to the database every 30 seconds

3. **Community browse page** — Create src/app/community/page.js:
   - Grid of published community roadmaps (similar to home page layout)
   - Sort by: Newest, Most Liked, Most Viewed
   - Filter by tags
   - Search by title
   - Each card: emoji, title, author name, like count, topic count, tags

4. **Community roadmap view** — Create src/app/community/[slug]/page.js:
   - Same layout as static roadmaps (/roadmap/[slug])
   - But data comes from the database instead of static files
   - Like button (heart icon + count)
   - "Report" button for inappropriate content
   - Author attribution at the top

5. **API routes** — Create src/app/api/community/:
   - POST / — create roadmap
   - GET / — list published roadmaps (with sort, filter, pagination)
   - GET /[slug] — get single roadmap
   - PUT /[slug] — update (author only)
   - DELETE /[slug] — delete (author only)
   - POST /[slug]/like — toggle like
   - GET /my — list current user's roadmaps (drafts + published)

6. **Sidebar integration:**
   - Add "🌐 Community" link in the sidebar under the static roadmaps section
   - When viewing a community roadmap, sidebar behaves like static roadmaps (shows phases/topics)

7. **My Roadmaps** — Create src/app/community/my/page.js:
   - List user's own community roadmaps
   - Show status (draft/published), views, likes
   - Edit and delete actions

Requires authentication (feature 3.1). Unauthenticated users can browse and view but not create or like.
```

</details>

---

## Phase 7: Infrastructure Improvements

Improvements to existing infrastructure based on known limitations.

---

### 7.1 Distributed Rate Limiting with Redis / Upstash

**Priority:** Medium | **Effort:** Small | **Dependencies:** 1.5 (rate limiting)

**Why:** The current in-memory `Map` is single-process only. On serverless or multi-replica deployments (e.g., Vercel), each instance has its own independent counter, making the rate limit ineffective.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Replace the in-memory Map in src/lib/rateLimit.ts with a Redis/Upstash-backed store for distributed rate limiting.

Requirements:

1. Install @upstash/redis and @upstash/ratelimit
2. Update src/lib/rateLimit.ts:
   - If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars are set, use Upstash Ratelimit
   - Otherwise, fall back to the existing in-memory Map (for local dev / single-process)
   - Keep the same return interface: { success, remaining, reset }
3. Update src/middleware.ts to use the updated rateLimit factory — no changes needed if interface is preserved
4. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to the env vars documentation in CLAUDE.md and README.md
5. Use Upstash's sliding window algorithm when using Redis (see next TODO)

No changes to the middleware logic itself — only the storage layer changes.
```

</details>

---

### 7.2 Sliding Window Rate Limiting Algorithm

**Priority:** Low | **Effort:** Small | **Dependencies:** 1.5 (rate limiting)

**Why:** The current fixed window allows up to 2× the intended limit in a short burst — a burst at the very end of one window plus the start of the next. Sliding window prevents this.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Upgrade the rate limiter in src/lib/rateLimit.ts from a fixed window to a sliding window algorithm.

Requirements:

1. Replace the current fixed window logic with a sliding window counter:
   - Store timestamps of recent requests per IP instead of a single count + resetTime
   - On each request: remove timestamps older than `interval` ms, then count remaining
   - If count >= maxRequests → reject
   - Store: Map<string, number[]> (IP → array of request timestamps in ms)

2. Update the cleanup interval accordingly:
   - Instead of deleting entries where resetTime is past, delete entries whose timestamp arrays are fully expired (all timestamps older than interval)

3. Keep the same return interface: { success: boolean, remaining: number, reset: number }
   - reset: timestamp (seconds) of when the oldest request in the window expires

4. Update docs/rate-limiting.md to reflect the new algorithm.

Note: If 7.1 (Upstash) is implemented, use Upstash's built-in sliding window instead.
```

</details>

---

### 7.3 IP Spoofing Protection

**Priority:** Low | **Effort:** Tiny | **Dependencies:** 1.5 (rate limiting)

**Why:** `x-forwarded-for` can be spoofed by clients on bare/self-hosted deployments unless the reverse proxy strips and re-stamps it. On Vercel this is trustworthy, but it should be validated on other hosts.

<details>
<summary><strong>Prompt for Claude Code</strong></summary>

```
Harden the IP detection in src/middleware.ts against x-forwarded-for spoofing.

Requirements:

1. Add a TRUSTED_PROXY env var (optional, boolean flag: "true" / "false", default "true" for Vercel)
2. Update getClientIp() in src/middleware.ts:
   - If TRUSTED_PROXY=true (default): keep current behavior — trust x-forwarded-for first header
   - If TRUSTED_PROXY=false: ignore x-forwarded-for entirely and use x-real-ip only, falling back to "unknown"
3. Add a comment explaining why: x-forwarded-for can be spoofed by clients; only trust it when your proxy strips and re-stamps it
4. Document TRUSTED_PROXY in CLAUDE.md and README.md env vars table
5. Update docs/rate-limiting.md — IP Spoofing limitation — to reflect this mitigation

Minimal change — only getClientIp() and env var documentation.
```

</details>

---

## Suggested Implementation Order

```
Phase 1 (Foundation):    1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
Phase 2 (UX):           2.1 → 2.2 → 2.3 → 2.4
Phase 3 (Auth & Data):  3.1 → 3.2 → 3.3
Phase 4 (Content):      4.1 → 4.2 → 4.3 → 4.4  (can be done in parallel)
Phase 5 (AI Features):  5.1 → 5.2 → 5.3 → 5.4
Phase 6 (Polish):       6.1 → 6.2 → 6.3 → 6.4 → 6.5
Phase 7 (Infra):        7.2 → 7.3 → 7.1  (7.1 requires Upstash account; 7.2 + 7.3 are local-only changes)
```

Phases 1-3 are sequential (each builds on the previous).

Phases 4, 5, and 6 can be worked on in parallel or in any order after Phase 1.

Phase 7 can be done at any time after Phase 1.5; start with 7.2 and 7.3 (no external dependencies), then 7.1 if scaling to multiple replicas.
