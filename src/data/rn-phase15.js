const rnPhase15 = {
  id: "phase-15",
  title: "Phase 15: 90-Day Action Plan",
  emoji: "📅",
  description: "A concrete 90-day plan to execute this roadmap — daily study schedule, weekly milestones, mock interview cadence, portfolio deliverables, and tracking system.",
  topics: [
    {
      id: "ninety-day-plan",
      title: "90-Day Execution Plan",
      explanation: `**This is your battle plan.** Knowledge without execution is worthless. This 90-day plan turns the entire roadmap into a structured study and practice program.

**Phase breakdown:**

### Days 1-30: Foundation (Deep Fundamentals)
**Goal:** Master JS/TS internals, React internals, and RN architecture.

| Week | Focus Area | Deliverables |
|------|-----------|-------------|
| Week 1 | JS Engine Internals (Phase 2) | Explain event loop, closures, prototype chain from memory. Write 10 code exercises. |
| Week 2 | React Internals (Phase 3) | Explain Fiber, reconciliation, hooks linked list. Profile a real app. |
| Week 3 | RN Architecture (Phase 4) | Explain Bridge vs JSI, Fabric, Hermes. Create a TurboModule. |
| Week 4 | Performance (Phase 5) | Optimize a real app — before/after metrics for startup, FlatList, re-renders. |

**Daily routine (Days 1-30):**
- 30 min: Read/study one topic from the current phase
- 45 min: Code exercises and experiments
- 15 min: Write notes in your own words (teaching yourself)
- 15 min: Practice 3 interview questions from the topic

---

### Days 31-60: Architecture & Design (Staff-Level Thinking)
**Goal:** Design systems, make architectural decisions, build portfolio.

| Week | Focus Area | Deliverables |
|------|-----------|-------------|
| Week 5 | Architecture (Phase 6) + State Mgmt (Phase 7) | Write ADR for state management choice. Implement feature-based architecture. |
| Week 6 | Native Integration (Phase 8) | Create a native module. Implement push notifications + deep linking. |
| Week 7 | System Design (Phase 9) | Design 2 systems (chat app, e-commerce). Full architecture diagrams. |
| Week 8 | Debugging + Testing (Phase 10, 11) | Set up Sentry. Write test suite (unit + integration + E2E). |

**Daily routine (Days 31-60):**
- 30 min: Study architecture/design patterns
- 60 min: Build portfolio project features
- 15 min: System design practice (draw diagrams, discuss trade-offs)
- 15 min: Mock interview question practice

---

### Days 61-90: Interview Preparation (Peak Readiness)
**Goal:** Interview-ready. Articulate, fast, and comprehensive.

| Week | Focus Area | Deliverables |
|------|-----------|-------------|
| Week 9 | Interview questions bank (Phase 12) | Complete all 50 RN questions with self-assessed scores. |
| Week 10 | Leadership + Communication (Phase 13) | Write an RFC, prepare 3 behavioral stories (STAR format). |
| Week 11 | Portfolio polish (Phase 14) | README, architecture docs, demo video. Deploy to TestFlight. |
| Week 12 | Mock interviews + review | 4 mock interviews (2 technical, 2 system design). Review weak areas. |

**Daily routine (Days 61-90):**
- 30 min: Review weak areas from self-assessment
- 45 min: Mock interview practice (answer out loud)
- 30 min: Polish portfolio project
- 15 min: Behavioral story practice (STAR format)

---

### Weekly milestones checklist:

**Week 1:** ☐ Can explain event loop with code example ☐ Wrote 5 closure exercises
**Week 2:** ☐ Can explain Fiber architecture ☐ Used React Profiler on a real app
**Week 3:** ☐ Created a TurboModule ☐ Can explain Bridge vs JSI with diagrams
**Week 4:** ☐ Before/after performance metrics documented ☐ Optimized a FlatList
**Week 5:** ☐ ADR written ☐ Feature-based architecture implemented
**Week 6:** ☐ Push notifications + deep linking working ☐ Native module created
**Week 7:** ☐ 2 system designs documented with diagrams
**Week 8:** ☐ Sentry integrated ☐ 80%+ test coverage on business logic
**Week 9:** ☐ Completed 50 RN interview questions ☐ Scored >80% full marks
**Week 10:** ☐ RFC written ☐ 3 behavioral stories prepared
**Week 11:** ☐ Portfolio deployed ☐ Demo video recorded
**Week 12:** ☐ 4 mock interviews completed ☐ All weak areas reviewed`,
      codeExample: `// === TRACKING SYSTEM ===

// Create a simple tracking spreadsheet or use this structure:
const studyTracker = {
  daily: {
    date: '2024-03-20',
    phase: 'Phase 2: JS/TS Mastery',
    topic: 'Event Loop & Microtasks',
    timeSpent: '1.5 hours',
    activities: [
      'Read topic explanation',
      'Coded 3 event loop exercises',
      'Practiced 3 interview questions',
      'Wrote summary notes',
    ],
    selfAssessment: {
      understanding: 4, // 1-5
      canExplainToOthers: 3,
      canCodeFromMemory: 4,
    },
    weakAreas: ['Priority of microtask queue vs macrotask queue timing'],
    nextFocus: 'Memory management & garbage collection',
  },
  
  weekly: {
    week: 2,
    focus: 'React Internals',
    milestones: {
      'Explain Fiber architecture': true,
      'Use React Profiler': true,
      'Understand hooks linked list': false, // Need more practice
    },
    mockInterviewScore: null, // Start in week 9
    portfolioProgress: '15%',
    notesLink: 'notion.so/react-internals-notes',
  },
};

// === BEHAVIORAL STORY FORMAT (STAR) ===

const behavioralStories = {
  technicalDecision: {
    situation: 'Our app had 2% crash rate, team was demoralized by constant firefighting',
    task: 'Reduce crash rate to 0.5% and establish processes to prevent regression',
    action: [
      'Categorized all crashes by type (JS vs Native vs OOM)',
      'Prioritized top 5 crashes (covered 80% of occurrences)',
      'Implemented error boundaries on every screen',
      'Added runtime API response validation with Zod',
      'Set up crash rate monitoring in CI — blocked releases above threshold',
      'Created on-call runbook for crash investigations',
    ],
    result: [
      'Reduced crash rate from 2% to 0.3% in 6 weeks',
      'Team velocity increased 30% (less firefighting)',
      'Process adopted by 3 other mobile teams in the company',
    ],
  },
  
  conflictResolution: {
    situation: 'Two senior engineers disagreed on state management approach (Redux vs Zustand)',
    task: 'Make a decision that both engineers could support',
    action: [
      'Organized a design review with both engineers presenting their case',
      'Created an evaluation matrix with weighted criteria (team expertise, performance, migration cost)',
      'Ran a time-boxed proof-of-concept with each approach (2 days each)',
      'Gathered quantitative data: bundle size, re-render counts, boilerplate LOC',
      'Wrote an ADR documenting the decision and rationale',
    ],
    result: [
      'Team chose Zustand for new features, agreed on incremental Redux migration',
      'Both engineers felt heard and supported the decision',
      'ADR became the template for all future technical decisions',
    ],
  },
  
  leadership: {
    situation: 'New architecture migration needed but no one had capacity',
    task: 'Drive the migration while maintaining feature velocity',
    action: [
      'Created an RFC with phased migration plan (3 months)',
      'Mentored 2 mid-level engineers on the new architecture',
      'Each feature team migrated their own module (distributed ownership)',
      'Created a migration guide with step-by-step examples',
      'Set up weekly architecture office hours for questions',
    ],
    result: [
      'Migration completed in 10 weeks (ahead of schedule)',
      'Two mid-level engineers gained architecture skills (promoted to senior within 6 months)',
      'Build times reduced by 40% with new architecture',
    ],
  },
};`,
      exercise: `**Week 1 Action Items (start today):**
1. Set up your study tracking system (spreadsheet, Notion, or plain markdown)
2. Study Phase 2, Topic 1 (Event Loop) — read, code, practice questions
3. Create a new React Native project for your portfolio (use RN 0.76+ with New Architecture)
4. Set up 3 recurring calendar blocks: morning study (30 min), evening coding (45 min), weekend review (2 hours)
5. Find a study partner or mentor for weekly mock interviews (start in Week 9, but schedule NOW)
6. Join the React Native Discord/Community for discussion and motivation`,
      commonMistakes: [
        "Trying to study everything at once — follow the 90-day sequence; each phase builds on the previous",
        "Only reading without coding — understanding comes from DOING; write code for every topic",
        "Skipping the portfolio project — interview answers backed by real work are 10x more convincing",
        "Not practicing verbal explanations — knowing the answer in your head ≠ articulating it clearly in an interview",
        "Studying alone for 90 days without mock interviews — the interview format itself needs practice; start mocks by Week 9",
        "Burning out with 4-hour study sessions — 90-120 minutes daily is sustainable and effective",
      ],
      interviewQuestions: [
        {
          type: "meta",
          q: "How do you stay current with React Native and the mobile ecosystem?",
          a: "**Multi-source approach:** (1) **Official channels**: React Native blog, React RFC discussions, Hermes releases. (2) **Community**: React Native Radio podcast, Expo team updates, Callstack blog. (3) **Conferences**: App.js Conf, React Native EU, React Conf talks. (4) **Practice**: Side projects using new features (New Architecture, Fabric, TurboModules). (5) **Code reading**: Read React Native's source code for internals understanding. (6) **Team knowledge sharing**: Monthly tech talks, post-conference summaries. (7) **Ecosystem monitoring**: Track React Navigation, Reanimated, Expo releases.",
        },
        {
          type: "meta",
          q: "What makes a great Senior/Staff React Native engineer?",
          a: "**Three dimensions:** (1) **Technical depth**: Understands internals (Fiber, JSI, Hermes), can debug any layer (JS, bridge, native), makes informed performance decisions backed by profiling. (2) **Technical breadth**: Designs end-to-end systems (client + server), understands CI/CD, testing strategy, monitoring, release management. Can evaluate and choose technologies with clear trade-off analysis. (3) **Multiplier effect**: Elevates the entire team through mentoring, architectural guidance, documentation (ADRs), code review excellence, and cross-team technical direction. The best staff engineers make everyone around them better.",
        },
      ],
    },
  ],
};

export default rnPhase15;
