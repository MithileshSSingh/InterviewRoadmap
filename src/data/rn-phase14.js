const rnPhase14 = {
  id: "phase-14",
  title: "Phase 14: Portfolio & Project Showcase",
  emoji: "🎯",
  description: "Build portfolio projects that demonstrate staff-level skills — full-stack mobile app, open-source contribution, architecture case study, performance optimization report, and system design documentation.",
  topics: [
    {
      id: "portfolio-projects",
      title: "Portfolio Projects for Staff-Level Demonstration",
      explanation: `**Your portfolio proves you can DO what you claim in interviews.** At the staff level, portfolio projects should demonstrate:

1. **Architecture** — Clean architecture, feature modules, scalable patterns
2. **Performance** — Measurable optimizations (before/after benchmarks)
3. **Production readiness** — Error handling, testing, monitoring
4. **Technical depth** — Custom native modules, complex state management
5. **Leading indicators** — Documentation, ADRs, clean git history

**Recommended portfolio:**

### Project 1: Full-Stack Mobile App
Build a complete app (e.g., task manager, fitness tracker, expense tracker) with:
- Feature-based architecture with clean separation of concerns
- React Query for server state + Zustand for client state
- Optimized FlatList/FlashList with virtualization
- Push notifications + deep linking
- Offline support with sync
- CI/CD pipeline (GitHub Actions → TestFlight/Firebase Distribution)
- Comprehensive tests (unit + integration + E2E)
- README with architecture diagram and ADRs

### Project 2: Performance Case Study
Take an existing open-source RN app and:
- Profile startup time, identify bottlenecks
- Optimize and document improvements with numbers
- Write a blog post / README documenting the process
- Include before/after flame charts and metrics

### Project 3: Open-Source Contribution
Contribute to React Native itself or a major ecosystem library:
- Fix a non-trivial bug (not just a typo)
- Add a feature with tests
- Write comprehensive PR description explaining the change
- Shows you can work in a large, unfamiliar codebase

### Project 4: System Design Documentation
Write detailed system design documents for 3 mobile systems:
- Real-time chat app (WebSocket, offline sync, E2E encryption)
- E-commerce app (product catalog, cart, checkout, order tracking)
- Social media feed (infinite scroll, mixed content, real-time updates)

Each design should include: requirement analysis, architecture diagrams, data models, API contracts, trade-off analysis, and scalability discussion.`,
      codeExample: `// === PORTFOLIO APP ARCHITECTURE SHOWCASE ===

// This structure demonstrates staff-level thinking:

/*
portfolio-app/
├── docs/
│   ├── ARCHITECTURE.md          ← Overall system design
│   ├── adr/
│   │   ├── 001-state-management.md
│   │   ├── 002-navigation-strategy.md
│   │   └── 003-testing-approach.md
│   └── performance/
│       ├── startup-optimization.md  ← Before/after metrics
│       └── list-performance.md      ← FlatList → FlashList migration
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── SignupScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── api/
│   │   │   │   └── authApi.ts
│   │   │   ├── __tests__/
│   │   │   │   ├── useAuth.test.ts
│   │   │   │   └── LoginScreen.test.tsx
│   │   │   └── index.ts            ← Public API
│   │   ├── tasks/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── store/
│   │   │   │   └── taskStore.ts     ← Zustand slice
│   │   │   └── __tests__/
│   │   └── settings/
│   ├── shared/
│   │   ├── components/              ← Design system
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   └── useNetworkStatus.ts
│   │   └── utils/
│   ├── platform/
│   │   ├── navigation/
│   │   ├── analytics/
│   │   ├── errorReporting/
│   │   └── storage/
│   └── App.tsx
├── e2e/
│   ├── login.spec.ts
│   └── tasks.spec.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── README.md                    ← Setup, architecture overview, screenshots
└── CONTRIBUTING.md
*/

// Key things interviewers look for:
// 1. Feature isolation — can I understand 'auth' without reading 'tasks'?
// 2. Testability — are hooks and logic testable independently?
// 3. Error handling — what happens when the network is down?
// 4. Documentation — can I understand the app without a walkthrough?
// 5. Git history — clean commits, meaningful messages, PRs to branches`,
      exercise: `**Portfolio Building Plan:**
1. Pick ONE portfolio project and build it over 4 weeks (quality > quantity)
2. Write the ARCHITECTURE.md first — design before coding
3. Create at least 2 ADRs for significant technical decisions
4. Include a performance optimization section with before/after metrics
5. Write unit and integration tests for all business logic
6. Add a CI pipeline that runs tests automatically
7. Create a 5-minute demo video walking through the architecture
8. Get feedback from 2 senior engineers and iterate`,
      commonMistakes: [
        "Building a todo app without depth — interviewers have seen 1000 todo apps; yours needs architectural sophistication",
        "No documentation — a portfolio project without README and architecture docs looks like a learning exercise, not production work",
        "No tests — staff engineers write tests; a project without tests signals 'I don't test in production either'",
        "Using every trendy library — shows you can't make focused technology choices; use what's right for the problem",
        "No git history — a single 'initial commit' with 10K lines suggests the project was generated, not developed iteratively",
      ],
      interviewQuestions: [
        {
          type: "behavioral",
          q: "Walk me through the architecture of a project you've built. What would you change if you did it again?",
          a: "**Framework for answering:** (1) Start with the PROBLEM the project solves. (2) Describe the high-level architecture in 2-3 sentences. (3) Deep dive into ONE interesting technical decision (ADR-worthy). (4) Discuss a specific trade-off you made and why. (5) For 'what would you change': be honest about a real limitation. Maybe 'I'd use React Query instead of Redux for server state — we spent 40% of our Redux code on API boilerplate.' Shows self-awareness and growth.",
        },
        {
          type: "behavioral",
          q: "How do you approach building a new feature from scratch?",
          a: "**My process:** (1) **Requirements clarification** — meet with PM, define scope, acceptance criteria, edge cases. (2) **Design** — architecture sketch, data model, API contract. Write RFC if significant. (3) **Estimate** — break into tasks (2-4 hour chunks), identify risks, add buffer. (4) **Build** — start with data layer (types, API, state), then presentation (screens, components). (5) **Test** — write tests alongside code (not after). Focus on behavior, not implementation. (6) **Review** — self-review before requesting team review. (7) **Ship** — behind feature flag, staged rollout, monitor metrics.",
        },
      ],
    },
  ],
};

export default rnPhase14;
