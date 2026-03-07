# Implementation Plan — Interview Roadmap Platform

> 24 features organized into 6 phases. Each feature includes a detailed prompt you can paste directly into Claude Code.

---

## Phase 1: Foundation & Quality (Do First)

These are non-negotiable improvements that make everything else easier and safer to build.

---

- [x] **1.1 Create CLAUDE.md Project Instructions**
  **Priority:** Critical | **Effort:** Small | **Dependencies:** None
  **Why:** Every future Claude Code session will understand project conventions automatically.

---

- [x] **1.2 Fix the FREE_MODEL Environment Bug**
  **Priority:** Critical | **Effort:** Tiny | **Dependencies:** None
  **Why:** The chat API crashes if `FREE_MODEL` env var is unset.

---

- [x] **1.3 Set Up Testing Infrastructure (Vitest + React Testing Library)**
  **Priority:** Critical | **Effort:** Medium | **Dependencies:** None
  **Why:** Zero tests exist. Every future feature should have tests.

---

- [ ] **1.4 Set Up CI/CD with GitHub Actions**
  **Priority:** High | **Effort:** Small | **Dependencies:** 1.3 (testing)
  **Why:** No CI/CD exists. PRs should be validated automatically.

---

- [x] **1.5 Add Rate Limiting Middleware**
  **Priority:** High | **Effort:** Medium | **Dependencies:** None
  **Why:** API routes have no protection — anyone can spam expensive LLM calls.

---

- [x] **1.6 Update README**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** None
  **Why:** README is outdated — doesn't mention CareerForge, Salesforce roadmap, themes, or the AI chatbot.

---

## Phase 2: User Experience Improvements

Features that make the existing platform significantly better for end users.

---

- [ ] **2.1 Progress Tracking for Static Roadmaps**
  **Priority:** High | **Effort:** Medium | **Dependencies:** None
  **Why:** CareerForge roadmaps have progress tracking, but the main static roadmaps (JavaScript, DSA, etc.) don't.

---

- [x] **2.2 Global Search**
  **Priority:** High | **Effort:** Medium | **Dependencies:** None
  **Why:** No way to search across roadmaps or topics. Users need to browse manually.

---

- [x] **2.3 Bookmarks / Favorites System**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** None
  **Why:** Users can't save specific topics they want to revisit later.

---

- [x] **2.4 Mobile Responsiveness Audit & Fix**
  **Priority:** Medium | **Effort:** Medium | **Dependencies:** None
  **Why:** The sidebar is collapsible but many components haven't been tested on small screens.

---

- [x] **2.5 In-App Feedback System**
  **Priority:** High | **Effort:** Medium | **Dependencies:** 1.5 (rate limiting), 3.1 (optional for user-linked feedback)
  **Why:** There is no structured way for users to report bugs, request features, or rate roadmap quality from inside the app.

---

- [x] **2.6 Feedback Admin Management**
  **Priority:** Medium | **Effort:** Medium | **Dependencies:** 2.5, 3.1 (admin access pattern)
  **Why:** Product/admin team needs a dedicated workflow to review, triage, and close user feedback.

---

## Phase 3: Authentication & Data Persistence

Moving from anonymous localStorage sessions to proper user accounts.

---

- [x] **3.1 User Authentication with NextAuth.js**
  **Priority:** High | **Effort:** Large | **Dependencies:** None
  **Why:** Currently users are anonymous (localStorage UUID). Auth enables cross-device access, data ownership, and opens the door for social features.

---

- [ ] **3.2 Shareable Roadmap Links**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** 3.1 (nice to have, not required)
  **Why:** Users can't share their AI-generated roadmaps with others.

---

- [ ] **3.3 Data Cleanup / TTL for Anonymous Roadmaps**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** None
  **Why:** Anonymous roadmaps accumulate indefinitely in SQLite with no cleanup mechanism.

---

## Phase 4: New Content & Roadmaps

Expanding the content library.

---

- [x] **4.1 Complete the "Coming Soon" Roadmaps — React**
  **Priority:** High | **Effort:** Large | **Dependencies:** None
  **Why:** React is the #1 most in-demand frontend framework. It's listed as "Coming Soon" and users are waiting.

---

- [x] **4.2 Complete the "Coming Soon" Roadmaps — Node.js**
  **Priority:** High | **Effort:** Large | **Dependencies:** None
  **Why:** Node.js backend interviews are extremely common, and it's currently listed as "Coming Soon."

---

- [x] **4.3 Complete the "Coming Soon" Roadmaps — Python**
  **Priority:** Medium | **Effort:** Large | **Dependencies:** None
  **Why:** Python is heavily used in backend, scripting, and interview prep, and it's currently listed as "Coming Soon."

---

- [ ] **4.4 Complete the "Coming Soon" Roadmaps — CSS**
  **Priority:** Medium | **Effort:** Large | **Dependencies:** None
  **Why:** CSS interviews still surface frequently in frontend hiring, and the roadmap is still marked "Coming Soon."

---

## Phase 5: AI-Powered Features

Leveraging the existing AI infrastructure for powerful new capabilities.

---

- [ ] **5.1 Mock Interview Chatbot**
  **Priority:** High | **Effort:** Large | **Dependencies:** None
  **Why:** The existing chatbot explains topics — but practicing interviews is what users actually need.

---

- [ ] **5.1.1 Provider-Backed Realtime Voice Interview**
  **Priority:** Medium | **Effort:** Medium | **Dependencies:** 5.1
  **Why:** Browser-native speech APIs are a good short-term path, but production voice interviews need provider-backed STT/TTS or realtime audio for lower latency, better cross-browser support, and more reliable interruption handling.

---

- [x] **5.2 Code Playground (Embedded Editor)**
  **Priority:** Medium | **Effort:** Large | **Dependencies:** None
  **Why:** Users read code examples but can't practice in the app. They have to copy-paste to an external editor.

- [ ] **5.2.1 Future Extensions (Post-MVP)**
  **Priority:** Low | **Effort:** Medium | **Dependencies:** 5.2
  **Why:** The playground can be expanded later with execution, persistence, accessibility, and telemetry enhancements once the MVP is stable.

---

- [x] **5.3 Quiz / Assessment System**
  **Priority:** Medium | **Effort:** Large | **Dependencies:** None
  **Why:** Users need to validate their understanding. Reading content is passive — quizzes are active learning.

---

- [ ] **5.4 Comparative Role/Company Analysis**
  **Priority:** Low | **Effort:** Medium | **Dependencies:** None
  **Why:** Users often want to compare two roles or companies before deciding where to focus their prep.

---

## Phase 6: Polish & Advanced Features

Final polish and advanced capabilities.

---

- [ ] **6.1 Notification System**
  **Priority:** Low | **Effort:** Small | **Dependencies:** None
  **Why:** CareerForge roadmap generation takes 1-3 minutes. Users navigate away and don't know when it's done.

---

- [ ] **6.2 Spaced Repetition / Review System**
  **Priority:** Low | **Effort:** Medium | **Dependencies:** 2.1 (progress tracking)
  **Why:** Users study topics once but forget. A review system surfaces topics that need refreshing.

---

- [ ] **6.3 Analytics Dashboard (Admin)**
  **Priority:** Low | **Effort:** Medium | **Dependencies:** None
  **Why:** Understanding usage patterns helps prioritize features.

---

- [ ] **6.4 PWA / Offline Support**
  **Priority:** Low | **Effort:** Medium | **Dependencies:** None
  **Why:** Users studying on commutes or in areas with poor connectivity would benefit from offline access.

---

- [ ] **6.5 Community / User-Generated Roadmaps**
  **Priority:** Low | **Effort:** Very Large | **Dependencies:** 3.1 (auth)
  **Why:** Let users create and share custom roadmaps, building a community around the platform.

---

## Phase 7: Infrastructure Improvements

Improvements to existing infrastructure based on known limitations.

---

- [ ] **7.1 Distributed Rate Limiting with Redis / Upstash**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** 1.5 (rate limiting)
  **Why:** The current in-memory `Map` is single-process only. On serverless or multi-replica deployments (e.g., Vercel), each instance has its own independent counter, making the rate limit ineffective.

---

- [ ] **7.2 Sliding Window Rate Limiting Algorithm**
  **Priority:** Low | **Effort:** Small | **Dependencies:** 1.5 (rate limiting)
  **Why:** The current fixed window allows up to 2× the intended limit in a short burst — a burst at the very end of one window plus the start of the next. Sliding window prevents this.

---

- [ ] **7.3 IP Spoofing Protection**
  **Priority:** Low | **Effort:** Tiny | **Dependencies:** 1.5 (rate limiting)
  **Why:** `x-forwarded-for` can be spoofed by clients on bare/self-hosted deployments unless the reverse proxy strips and re-stamps it. On Vercel this is trustworthy, but it should be validated on other hosts.

---

---

## Phase 8: Global Search Enhancements

Improvements to the existing client-side global search (`src/lib/searchIndex.js` + `src/components/SearchModal.js`). The current implementation is functional but has known UX gaps listed below.

---

- [ ] **8.1 Strip Markdown from Snippets**
  **Priority:** High | **Effort:** Tiny | **Dependencies:** None
  **Why:** `topic.explanation` is stored as raw markdown. The 200-char snippet shown in search results currently contains backticks, `**bold**`, and `##` heading syntax, making results hard to read.

---

- [ ] **8.2 Keyboard Navigation in Results (↑ ↓ Enter)**
  **Priority:** High | **Effort:** Small | **Dependencies:** None
  **Why:** Standard expectation in any Cmd+K search palette (Notion, Linear, Vercel all support this). Currently the only way to select a result is mouse click.

---

- [ ] **8.3 Recent Searches**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** None
  **Why:** High perceived value for users who repeatedly look up the same topics. Zero server cost — localStorage only.

---

- [ ] **8.4 Match Highlighting**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** None
  **Why:** Users can see *why* a result matched at a glance. Standard in every search UI.

---

- [ ] **8.5 Fuzzy Matching with Fuse.js**
  **Priority:** Low | **Effort:** Small | **Dependencies:** 8.1 (clean snippets)
  **Why:** Current exact substring matching fails for typos ("closre" won't match "closure"). Fuse.js is ~10 KB and replaces the manual scoring loop entirely.

---

- [ ] **8.6 Filter by Roadmap**
  **Priority:** Low | **Effort:** Small | **Dependencies:** None
  **Why:** Once 10+ roadmaps exist, users may want to narrow results to a single roadmap (e.g., "only search TypeScript").

---

## Phase 9: Search Architecture Migration (When Data Moves to Database)

These features become necessary if the static roadmap data in `src/data/` is migrated to the Prisma database. The current client-side `searchIndex.js` assumes data is importable as JS modules — that assumption breaks when data is in a DB.

---

- [ ] **9.1 Build-Time Search Index JSON (Recommended Migration Path)**
  **Priority:** High | **Effort:** Medium | **Dependencies:** Database migration of src/data/
  **Why:** Preserves zero-latency client-side search after the data moves to the database. A build script reads from the DB and writes `public/search-index.json` — the browser fetches this file once (CDN-cached) and all queries stay synchronous on the client.

---

- [ ] **9.2 API Route Search**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** Database migration of src/data/
  **Why:** Simplest migration path — no build script needed. Every search query hits the server but the implementation is straightforward. Best for getting search working quickly after the DB migration; can be replaced with 9.1 later for performance.

---

- [ ] **9.3 Server-Side Index Cache**
  **Priority:** Medium | **Effort:** Small | **Dependencies:** 9.2
  **Why:** Eliminates the per-request DB query cost from 9.2. The index is built once per server process and cached in memory with a 5-minute TTL. On cache miss it rebuilds from the DB. On roadmap write it is invalidated immediately.

---

- [ ] **9.4 SQLite / Turso Full-Text Search (FTS5)**
  **Priority:** Low | **Effort:** Medium | **Dependencies:** Database migration of src/data/
  **Why:** SQLite FTS5 provides relevance ranking, prefix matching, and phrase search built into the database engine — no application-level scoring loop needed. Turso (the remote DB used in production) supports FTS5.

---

- [ ] **9.5 Algolia / Typesense Search (For Scale)**
  **Priority:** Low | **Effort:** Large | **Dependencies:** Database migration of src/data/
  **Why:** Once the platform has thousands of user-generated CareerForge roadmaps or community content, a dedicated search service provides sub-20ms results, built-in fuzzy matching, typo tolerance, and analytics — without adding load to the primary database.

---

---
## Phase 10: Error logging and alerting system**

---

## Suggested Implementation Order

```
Phase 1 (Foundation):    1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
Phase 2 (UX):           2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6
Phase 3 (Auth & Data):  3.1 → 3.2 → 3.3
Phase 4 (Content):      4.1 → 4.2 → 4.3 → 4.4  (can be done in parallel)
Phase 5 (AI Features):  5.1 → 5.2 → 5.3 → 5.4
Phase 6 (Polish):       6.1 → 6.2 → 6.3 → 6.4 → 6.5
Phase 7 (Infra):        7.2 → 7.3 → 7.1  (7.1 requires Upstash account; 7.2 + 7.3 are local-only changes)
Phase 8 (Search UX):    8.1 → 8.2 → 8.3 → 8.4 → 8.5 → 8.6  (all independent, do in any order)
Phase 9 (Search Arch):  Only needed if src/data/ is migrated to DB. Path: 9.2 → 9.3 → 9.1 (replace 9.2) → 9.4 or 9.5 (at scale)
```

Phases 1-3 are sequential (each builds on the previous).

Phases 4, 5, and 6 can be worked on in parallel or in any order after Phase 1.

Phase 7 can be done at any time after Phase 1.5; start with 7.2 and 7.3 (no external dependencies), then 7.1 if scaling to multiple replicas.

Phase 8 features are all independent of each other — pick any order based on user impact. Start with 8.1 (tiny effort, immediate improvement) and 8.2 (high UX value).

Phase 9 is conditional — only relevant if the static data in `src/data/` is moved to the database. If that migration happens, start with 9.2 (quickest to ship), then replace it with 9.1 for zero-latency, then consider 9.4 or 9.5 at scale.


- [x] Remove other functionality from mockinterview
- [x] full screen mock interview dialog instead of small dialolg
- [x] Custom View page for mock interview
- [x] Mock interview in topic list page
- [ ] Mock interview in phase list page
- [ ] Mock interview in home page
- [ ] Mock interview - in roadmap ai features
- [x] Mock interview - tell llm not to responde out to context
- [x] Mock interveiw - login based / payment based
- [ ] Mock interview - Bot should not reply with the system context information
- [ ] handle error while generating roadmap properly ... example rate limitting
- [ ] duplications in codes and agent name, list in generations and stream api
- [ ] write proper graph which is hosted and stream from there ... with session id
- [x] full screen Quiz dailog on exit show score 
- [ ] Schadcn UI for all components



