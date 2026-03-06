# Interview Roadmaps (CareerForge)

A Next.js platform with two features: (1) static interview roadmaps for JS, TS, DSA, Android, React Native, and Salesforce, and (2) CareerForge — an AI-powered roadmap generator that builds personalized interview prep plans using a LangGraph multi-agent pipeline with web research.

## Product Positioning

Treat this project as a full-fledged production application, not an MVP or prototype. Recommendations, code changes, architecture decisions, UX, security, reliability, observability, data handling, authentication, and deployment guidance should all assume production-grade quality and maintainability.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router), React 19.2.3
- **Styling:** Tailwind CSS v4, CSS custom properties in `globals.css`
- **Database:** Prisma 7 with SQLite (local `dev.db`) / Turso (remote via `@prisma/adapter-libsql`)
- **Auth:** NextAuth.js v5 (Auth.js) with `@auth/prisma-adapter`, Google OAuth, database sessions
- **AI:** LangChain + LangGraph, OpenRouter (ChatOpenAI wrapper), Tavily Search API
- **Analytics:** Vercel Analytics + Speed Insights
- **Markdown:** `marked` + `prism-react-renderer` for syntax highlighting

## Package Manager

```bash
bun install        # primary (bun.lock)
npm install        # fallback (package-lock.json exists)
```

## Key Commands

```bash
bun dev            # start dev server
bun run build      # production build
bun run lint       # eslint
bun run format     # prettier --write .
bunx prisma generate        # regenerate client to src/generated/prisma/
bunx prisma migrate dev     # run migrations (SQLite)
```

`postinstall` runs `prisma generate` automatically.

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.js           # Root layout (server component, wraps Providers > ThemeProvider)
│   ├── auth/signin/        # Custom sign-in page (Google OAuth)
│   ├── page.js             # Home — roadmap listing
│   ├── roadmap/[slug]/     # Static roadmap pages (phase → topic drill-down)
│   ├── careerforge/        # AI roadmap generator UI
│   │   └── [id]/page.js    # Generated roadmap view
│   ├── settings/           # Theme/settings page
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth.js API route (GET/POST handlers)
│       ├── careerforge/    # generate/, history/, [id]/, [id]/stream/, [id]/progress/, migrate-session/
│       └── chat/           # Topic chatbot endpoint
├── components/             # PascalCase.js — "use client" interactive components
│   └── careerforge/        # RoadmapView, StreamingProgress, TopicCard, etc.
├── data/                   # Static roadmap content (phase JSON exports)
│   ├── javascript/         # phase1.js … phase5.js
│   ├── typescript/         # ts-phase1.js … ts-phase4.js
│   ├── dsa/                # dsa-phase1.js … dsa-phase5.js
│   ├── android/            # android-phase1.js … android-phase12.js
│   ├── react-native/       # rn-phase1.js … rn-phase15.js
│   ├── salesforce/         # sf-phase1.js … sf-phase14.js
│   ├── index.js            # getRoadmapPhases(), getPhaseById(), getTopicById()
│   └── roadmaps.js         # Registry: getAllRoadmaps(), getRoadmapMeta(slug)
├── lib/
│   ├── auth.ts             # NextAuth.js v5 config (exports handlers, auth, signIn, signOut)
│   ├── db.ts               # Prisma singleton (globalThis pattern, LibSQL adapter)
│   ├── chatClient.ts       # OpenRouter chat client
│   └── careerforge/
│       ├── pipeline.ts     # LangGraph DAG — 8 agents: orchestrator → 4 parallel intel agents → resourceFinder → roadmapBuilder → formatter
│       ├── schema.ts       # Zod validation schemas
│       ├── types.ts        # TypeScript types
│       ├── client.ts       # Client-side API helpers
│       └── export.js       # Export utilities
├── generated/prisma/       # Auto-generated Prisma client (do not edit)
└── globals.css             # All styles — CSS vars + BEM-ish class naming
```

## Coding Conventions

- **Components:** PascalCase `.js` files (e.g., `Sidebar.js`, `Accordion.js`); exception: `TopicChatBot.tsx`
- **Lib files:** camelCase `.ts` (e.g., `db.ts`, `pipeline.ts`, `chatClient.ts`)
- **Mixed JS/TS:** Components are `.js`, lib/API routes are `.ts`
- **Client components:** `"use client"` directive for interactive components; server components where possible
- **Imports:** `@/` alias maps to `src/` (configured in `tsconfig.json`)
- **Styling:** CSS custom properties (`--bg-primary`, `--accent-blue`, etc.) defined in `:root`, applied via theme system. BEM-ish class names (`.nav-phase-btn`, `.sidebar-logo`). CareerForge components use inline styles with CSS vars.
- **State:** No global state library — `useState` + `ThemeContext` only. Hydration guard pattern (`mounted` state) for localStorage reads.
- **API streaming:** SSE via `ReadableStream`, events are base64-encoded JSON (`Buffer.from(json).toString("base64")`). Client decodes with `atob()`.
- **Prisma:** `cuid()` for IDs, singleton via `globalThis`, generated output in `src/generated/prisma/`

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite path (`file:./dev.db`) or Turso URL |
| `TURSO_AUTH_TOKEN` | Auth token for remote Turso database |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access |
| `FREE_MODEL` | Model for chat (e.g., `arcee-ai/trinity-large-preview:free`) |
| `CAREER_MODEL` | Model for CareerForge pipeline (e.g., `google/gemini-2.0-flash-001`) |
| `TAVILY_API_KEY` | Tavily web search API key |
| `LINKEDIN_SCRAPING_ENABLED` | Feature flag for LinkedIn intel agent |
| `AUTH_SECRET` | NextAuth.js encryption secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Google OAuth 2.0 Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth 2.0 Client Secret |
| `AUTH_TRUST_HOST` | Set to `true` for non-Vercel deployments |

## Important Patterns

- **Roadmap data:** Each roadmap is a slug (e.g., `dsa`, `javascript`) registered in `src/data/roadmaps.js`. Phase files export arrays of topics with explanations, code examples, and interview questions.
- **CareerForge pipeline:** LangGraph state graph with fan-out/fan-in: orchestrator → 4 parallel agents (jobIntel, salaryIntel, linkedInIntel, skillsMapper) → resourceFinder → roadmapBuilder → formatter. Uses Tavily for web search, Zod for output validation.
- **SSE streaming:** `POST /api/careerforge/generate` creates a pending Roadmap record. `GET /api/careerforge/[id]/stream` runs the pipeline and streams base64-encoded events. `force-dynamic` + `maxDuration = 300`.
- **Theme system:** 6 themes in `src/themes.js` (midnight-indigo, emerald-forest, sunset-amber, rose-quartz, arctic-blue, monochrome). Applied by setting CSS variables on `document.documentElement` via `ThemeProvider`.
- **Authentication:** NextAuth.js v5 with Google OAuth, database sessions via `@auth/prisma-adapter`. Config at `src/lib/auth.ts` exports `{ handlers, auth, signIn, signOut }`. `Providers.js` wraps the app with `SessionProvider`. `AuthButton.js` in `.top-controls` shows sign-in/avatar dropdown. Anonymous users keep using `localStorage` `cf-session-id`; authenticated users get `userId` on Roadmap records. Migration endpoint at `/api/careerforge/migrate-session` transfers anonymous roadmaps to a user on first sign-in.
- **Prisma schema:** 7 models — `User`, `Account`, `Session`, `VerificationToken` (NextAuth), `Roadmap` (AI-generated plans, optional `userId`), `TopicProgress` (completion tracking), `AgentRun` (pipeline execution logs). Schema at `prisma/schema.prisma`, migrations in `prisma/migrations/`.

## Database

```bash
bunx prisma studio     # visual DB browser
bunx prisma migrate dev --name <name>   # create migration
```

Prisma config uses `@prisma/adapter-libsql` for Turso compatibility. The singleton in `db.ts` checks for `TURSO_AUTH_TOKEN` to decide between local SQLite and remote Turso.
