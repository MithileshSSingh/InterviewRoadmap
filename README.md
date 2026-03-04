# Interview Roadmap

A Next.js platform for interview preparation — curated learning roadmaps across major technologies, plus **CareerForge**: an AI-powered multi-agent pipeline that generates personalized career roadmaps based on your target role and experience.

<!-- TODO: Add screenshots -->

## Features

- **6 curated static roadmaps** — structured, topic-level guides from beginner to advanced for JavaScript, TypeScript, DSA, Sr. Android, Sr. React Native, and Salesforce Developer
- **CareerForge / Roadmap AI** — multi-agent LangGraph pipeline (orchestrator + 4 parallel intel agents + resource finder + roadmap builder + formatter) that produces a personalized, research-backed interview prep plan
- **Topic-level AI chatbot** — chat about any topic or select text to trigger "Ask AI" inline
- **6 themes + dark/light mode** — midnight indigo, emerald forest, sunset amber, rose quartz, arctic blue, monochrome
- **Export** — download AI-generated roadmaps as JSON, Markdown, PDF, or Word
- **Topic progress tracking** — check off topics as you complete them in AI-generated roadmaps

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router), React 19.2.3 |
| Styling | Tailwind CSS v4, CSS custom properties |
| Database | Prisma 7 + SQLite (dev) / Turso via `@prisma/adapter-libsql` (prod) |
| AI / Agents | LangChain + LangGraph, OpenRouter (`ChatOpenAI` wrapper) |
| Web Search | Tavily Search API |
| Markdown | `marked` + `prism-react-renderer` |
| Analytics | Vercel Analytics + Speed Insights |
| Package Manager | Bun (primary), npm (fallback) |

## Getting Started

### Prerequisites

- Node.js 22+
- [Bun](https://bun.sh)

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd javascript-roadmap

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see table below)

# 4. Generate Prisma client
bunx prisma generate

# 5. Run database migrations
bunx prisma migrate dev

# 6. Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path (`file:./dev.db`) or Turso URL |
| `TURSO_AUTH_TOKEN` | Prod only | Auth token for remote Turso database |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM access |
| `FREE_MODEL` | No | Model for topic chatbot (e.g., `arcee-ai/trinity-large-preview:free`) |
| `CAREER_MODEL` | No | Model for CareerForge pipeline (e.g., `google/gemini-2.0-flash-001`) |
| `TAVILY_API_KEY` | Yes | Tavily web search API key (used by CareerForge agents) |
| `LINKEDIN_SCRAPING_ENABLED` | No | Feature flag for LinkedIn intel agent (`true`/`false`) |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── roadmap/[slug]/     # Static roadmap pages
│   ├── careerforge/        # CareerForge UI + generated roadmap view
│   ├── settings/           # Theme/settings page
│   └── api/
│       ├── careerforge/    # generate, history, stream, progress endpoints
│       └── chat/           # Topic chatbot endpoint
├── components/             # Reusable UI components (PascalCase .js)
│   └── careerforge/        # RoadmapView, StreamingProgress, TopicCard, etc.
├── data/                   # Static roadmap content (phase JSON files)
│   ├── javascript/         # phase1.js … phase5.js
│   ├── typescript/         # ts-phase1.js … ts-phase4.js
│   ├── dsa/                # dsa-phase1.js … dsa-phase5.js
│   ├── android/            # android-phase1.js … android-phase12.js
│   ├── react-native/       # rn-phase1.js … rn-phase15.js
│   ├── salesforce/         # sf-phase1.js … sf-phase14.js
│   ├── index.js            # getRoadmapPhases(), getPhaseById(), getTopicById()
│   └── roadmaps.js         # Registry: getAllRoadmaps(), getRoadmapMeta(slug)
├── lib/
│   ├── db.ts               # Prisma singleton (LibSQL adapter)
│   ├── chatClient.ts       # OpenRouter chat client
│   └── careerforge/
│       ├── pipeline.ts     # LangGraph 8-agent DAG
│       ├── schema.ts       # Zod validation schemas
│       └── types.ts        # TypeScript types
└── globals.css             # CSS custom properties + all global styles
```

## Available Roadmaps

| Roadmap | Slug | Phases | Status |
|---|---|---|---|
| JavaScript | `javascript` | 5 | Available |
| TypeScript | `typescript` | 4 | Available |
| Data Structures & Algorithms | `dsa` | 5 | Available |
| Sr. Android Developer | `android` | 12 | Available |
| Sr. React Native Engineer | `react-native` | 15 | Available |
| Salesforce Developer | `salesforce` | 14 | Available |
| React | `react` | — | Coming soon |
| Node.js | `nodejs` | — | Coming soon |
| Python | `python` | — | Coming soon |
| CSS | `css` | — | Coming soon |

## Database Commands

```bash
bunx prisma studio              # visual DB browser
bunx prisma migrate dev --name <name>   # create a new migration
```

```bash
turso db shell interview-roadmaps < prisma/migrations/<new-migration-folder>/migration.sql
```

## License

MIT
