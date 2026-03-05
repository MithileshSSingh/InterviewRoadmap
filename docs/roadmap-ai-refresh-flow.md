# CareerForge Generation + Refresh Recovery Flow

This document explains the end-to-end behavior after the refresh fix:

1. What happens from the moment a user clicks **Generate CareerForge**.
2. How the system behaves when the user refreshes while generation is in progress.
3. Why duplicate agent execution is prevented.

---

## Overview

CareerForge generation now follows a **claim-or-watch** model for streaming:

- One request is allowed to **claim execution** and run the pipeline.
- Any later stream request for the same roadmap (refresh, second tab, reconnect) becomes a **watcher**.
- Watchers read persisted state from DB (`roadmaps` + `agent_runs`) and stream progress without re-running agents.

---

## Key Components

| File | Responsibility |
|---|---|
| `src/app/careerforge/page.js` | Creates roadmap request (`POST /api/careerforge/generate`) |
| `src/app/careerforge/[id]/page.js` | Loads roadmap state and starts SSE stream |
| `src/app/api/careerforge/generate/route.ts` | Creates roadmap row with `status = pending` |
| `src/app/api/careerforge/[id]/route.ts` | Returns roadmap + persisted generation snapshot |
| `src/app/api/careerforge/[id]/stream/route.ts` | SSE claim-or-watch logic |
| `src/lib/careerforge/pipeline.ts` | Runs LangGraph pipeline and persists agent status transitions |

---

## Data Model Used During Generation

### `roadmaps.status`

- `pending`: roadmap created, not yet claimed for execution
- `running`: one stream request has claimed execution
- `complete`: final roadmap JSON saved in `result`
- `error`: generation failed; `errorMessage` set

### `agent_runs`

Each pipeline agent writes runtime status:

- `running`
- `complete`
- `error`

This table is now the source of truth for refresh recovery progress.

---

## First-Time Generate Flow (No Refresh)

## Step 1: User submits form

On `/careerforge`, user submits role/company/experience:

1. `POST /api/careerforge/generate`
2. API inserts new row in `roadmaps`:
   - `status = pending`
   - `result = null`
3. API returns `{ id }`
4. Client navigates to `/careerforge/:id`

## Step 2: Detail page bootstraps state

`/careerforge/[id]/page.js` loads:

1. Calls `GET /api/careerforge/:id`
2. Receives current roadmap state + generation snapshot (`generation.progress`, `generation.agentStatuses`)
3. Since status is not terminal, page starts stream (`GET /api/careerforge/:id/stream`)

## Step 3: Stream claims execution

`/api/careerforge/:id/stream` does:

1. Guard terminal statuses (`complete`, `error`) and return immediately if already done
2. Atomically attempts claim:
   - `updateMany where { id, status: 'pending' } set { status: 'running' }`
3. If `claim.count === 1`, this request owns execution and runs pipeline

## Step 4: Pipeline runs + persists agent progress

Pipeline behavior:

1. Each agent sets its row in `agent_runs` to `running`
2. On success/fallback completion, sets `complete` or `error`
3. SSE emits `status/progress/partial` events live
4. Formatter saves final roadmap JSON and sets `roadmaps.status = complete`
5. SSE emits `complete`

## Step 5: Client finalizes

On `complete` event, page fetches `GET /api/careerforge/:id`, loads `result`, and renders final `RoadmapView`.

---

## Refresh While Running (Fixed Behavior)

When user refreshes `/careerforge/:id` during execution:

## Step 1: Page reload reads persisted state

1. `GET /api/careerforge/:id`
2. API returns:
   - `status = running`
   - persisted `generation.agentStatuses`
   - computed `generation.progress`
3. UI shows already completed/running agent statuses from DB (not empty in-memory state)

## Step 2: Page reconnects stream

Page starts SSE again: `GET /api/careerforge/:id/stream`.

## Step 3: Stream request becomes watcher

In stream route:

1. Claim attempt (`pending -> running`) now fails (`claim.count = 0`) because execution is already claimed.
2. Route enters **watchExistingRun()** mode.
3. It polls DB every ~1.5s:
   - reads latest `agent_runs`
   - emits status deltas
   - emits computed progress
4. When `roadmaps.status` turns terminal:
   - emits `complete` or `error`
   - closes stream

Result: **no second pipeline execution** after refresh.

---

## Why Duplicate Agent Execution Is Prevented

The key guard is the atomic claim in stream route:

- Only `status = pending` can transition to `running`.
- That transition is done with a single DB write condition.
- Only one request can win that transition.
- All later stream requests attach as watchers.

So refresh no longer creates concurrent pipeline runs for the same roadmap ID.

---

## What `/api/careerforge/:id` Now Returns for UI Hydration

Along with normal roadmap fields, API now includes:

- `generation.progress`
- `generation.agentStatuses`
- `generation.agentRuns` (raw rows)

This allows UI to reconstruct progress after reload before new SSE messages arrive.

---

## Rate-Limit Interaction (Important)

`/api/careerforge/[id]/stream` is rate-limited in middleware.

- Current limit: `10 requests/min` per IP
- If user refreshes rapidly (or opens many tabs), stream may still return `429 Too Many Requests`

In that case, generation may continue on server, but the client stream connection is temporarily blocked by rate limit.

If needed, tune either:

1. stream limit in `src/middleware.ts`
2. client reconnect/backoff strategy in `src/lib/careerforge/client.ts`

---

## Terminal Cases

### Refresh after `complete`

- `GET /api/careerforge/:id` returns final `result`
- Page renders `RoadmapView`
- Stream is not required

### Refresh after `error`

- `GET /api/careerforge/:id` returns `status = error` + `errorMessage`
- Page shows error UI and retry path

---

## Summary

The fix has two layers:

1. **Execution safety**: claim-or-watch stream logic prevents duplicate runs.
2. **State recovery**: persisted `agent_runs` + generation snapshot lets refresh restore progress UI.

Together, refresh during generation is now resume-like behavior, not restart behavior.
