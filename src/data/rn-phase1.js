const rnPhase1 = {
  id: "phase-1",
  title: "Phase 1: Role Expectations — Senior vs Staff",
  emoji: "🎯",
  description:
    "Understand what top companies expect from Senior and Staff React Native engineers — technical leadership, architecture ownership, decision-making authority, and interview structures.",
  topics: [
    {
      id: "senior-vs-staff-expectations",
      title: "Senior vs Staff: What Companies Expect",
      explanation: `**Senior React Native Engineer (IC3–IC4 / L5–L6)** is expected to independently own large features end-to-end, make sound architectural decisions within a team, mentor junior/mid engineers, and ship production-quality code at scale without handholding.

**Staff React Native Engineer (IC5 / L6–L7)** transcends a single team. You're expected to:
- **Set technical direction** across multiple teams or an entire mobile platform
- **Define architectural standards** that scale across 10+ engineers
- **Influence without authority** — drive alignment between iOS, Android, backend, and design
- **Anticipate problems 6–12 months ahead** and build systems to prevent them
- **Reduce organizational complexity** through platform abstractions, shared libraries, and tooling

**Key differentiators at top companies (Meta, Airbnb, Coinbase, Shopify):**

| Dimension | Senior | Staff |
|-----------|--------|-------|
| Scope | Single team, 1–2 features | Cross-team, platform-level |
| Architecture | Follows/adapts patterns | Defines/evolves patterns |
| Code Review | Reviews PRs for correctness | Reviews for architectural alignment |
| Decision Making | Makes decisions within team | Makes decisions that affect the org |
| Mentoring | Helps individuals | Elevates entire team's bar |
| Tech Debt | Identifies and fixes | Creates strategies to prevent |
| Communication | Team standups, sprint demos | Architecture reviews, RFCs, tech talks |
| Impact | Feature delivery | Platform capability, developer velocity |

**What gets you promoted from Senior to Staff:**
1. You solve problems nobody asked you to solve — but everyone needed
2. Your abstractions and patterns are adopted by teams you've never spoken to
3. Engineers across the org cite your RFCs, code, or documentation
4. You reduce the total complexity of the system, not just your part
5. Leadership trusts you to make irreversible technical decisions`,
      codeExample: `// Senior-level: Owns a well-structured feature module
// Staff-level: Creates the abstraction that makes all feature modules consistent

// ---- SENIOR: Clean, well-architected feature module ----
// features/checkout/CheckoutScreen.tsx
import { useCheckout } from './hooks/useCheckout';
import { CheckoutForm } from './components/CheckoutForm';
import { OrderSummary } from './components/OrderSummary';
import { useAnalytics } from '@/shared/analytics';

export const CheckoutScreen: React.FC = () => {
  const { state, actions } = useCheckout();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackScreen('checkout', { itemCount: state.items.length });
  }, []);

  return (
    <ScreenContainer loading={state.isProcessing} error={state.error}>
      <OrderSummary items={state.items} total={state.total} />
      <CheckoutForm
        onSubmit={actions.processPayment}
        onError={actions.handlePaymentError}
      />
    </ScreenContainer>
  );
};

// ---- STAFF: Creates the platform abstraction used by ALL features ----
// platform/feature-module/createFeatureModule.ts
interface FeatureModuleConfig<TState, TActions> {
  name: string;
  initialState: TState;
  actions: (setState: SetState<TState>, getState: () => TState) => TActions;
  analytics?: AnalyticsConfig;
  errorBoundary?: ErrorBoundaryConfig;
  featureFlag?: string;
  lazyLoad?: boolean;
}

export function createFeatureModule<TState, TActions>(
  config: FeatureModuleConfig<TState, TActions>
) {
  // Automatic analytics integration
  // Automatic error boundary wrapping
  // Automatic feature flag gating
  // Automatic lazy loading with skeleton
  // Automatic performance monitoring
  // Standardized state management pattern
  
  return {
    Screen: withFeatureShell(config),
    useFeature: createFeatureHook(config),
    navigator: createFeatureNavigator(config),
    // Every feature gets these for free — consistent patterns across 50+ features
  };
}

// Usage by any team — they get analytics, error handling, 
// feature flags, and perf monitoring WITHOUT thinking about it
const CheckoutModule = createFeatureModule({
  name: 'checkout',
  initialState: { items: [], total: 0 },
  actions: (set, get) => ({
    processPayment: async () => { /* ... */ },
  }),
  analytics: { screenName: 'checkout' },
  featureFlag: 'new_checkout_flow',
  lazyLoad: true,
});`,
      exercise: `**Self-Assessment Exercises:**
1. List 3 architectural decisions you've made that impacted engineers outside your immediate team
2. Write a 1-page RFC for migrating a shared component library to a monorepo — include trade-offs, rollout plan, and success metrics
3. Identify a recurring pattern in your codebase that could be abstracted into a reusable platform primitive
4. Draft a "technical vision" document for your mobile platform covering the next 12 months
5. Write a post-mortem for a production incident — include root cause, timeline, action items, and systemic prevention
6. Create a decision matrix for choosing between 3 state management approaches for a new project
7. Identify 3 pieces of tech debt in your current project and propose a prioritized remediation plan with business justification`,
      commonMistakes: [
        "Thinking Staff is just 'better coding' — it's about organizational impact, not personal output",
        "Focusing on feature delivery instead of platform capability — Staff engineers build systems that make features easier to ship",
        "Not writing RFCs or documentation — if your decisions aren't documented, they can't scale beyond your immediate influence",
        "Avoiding cross-team alignment conversations — the discomfort of alignment meetings is exactly where Staff-level impact happens",
        "Confusing 'being the smartest person' with leadership — Staff engineers make everyone around them more effective",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the difference between a Senior and Staff engineer's approach to tech debt?",
          a: "A **Senior** identifies and fixes tech debt within their team's scope — refactoring a module, improving test coverage, upgrading a dependency. A **Staff** creates **systemic solutions**: establishing deprecation policies, building automated migration tools (codemods), creating tech debt tracking dashboards, and aligning leadership on dedicated tech debt sprints. The Staff engineer prevents future tech debt by setting architectural standards and reviewing designs before implementation begins.",
        },
        {
          type: "scenario",
          q: "You join a company with 5 React Native teams and each team has their own navigation, state management, and API patterns. What do you do?",
          a: "**Don't force immediate standardization.** (1) Audit current approaches — document what each team uses and why. (2) Identify pain points — fragmentation costs in onboarding, bug surface area, shared component reuse. (3) Write an RFC proposing a North Star architecture with a phased migration path. (4) Build consensus with tech leads from each team — incorporate their concerns. (5) Start with the highest-leverage unification (e.g., shared API layer) that gives immediate ROI. (6) Create migration tooling (codemods) so teams can adopt incrementally. (7) Measure adoption and developer satisfaction quarterly.",
        },
        {
          type: "conceptual",
          q: "How do you influence technical decisions when you have no authority over other teams?",
          a: "**Influence through artifacts, not arguments.** (1) Write clear RFCs with data and trade-off analysis. (2) Build prototypes that demonstrate your approach works. (3) Present at architecture review meetings with benchmarks. (4) Offer to pair with skeptical engineers. (5) Make adoption easy — documentation, migration guides, starter templates. (6) Show business impact — 'This reduces crash rate by X%' or 'This cuts feature development time by Y days'. Engineers adopt what clearly makes their lives better.",
        },
      ],
    },
    {
      id: "interview-round-structure",
      title: "Interview Round Structure at Top Companies",
      explanation: `**Senior/Staff React Native interviews** at top product companies typically span 4–6 rounds over 1–2 days. Understanding each round's evaluation criteria is critical for targeted preparation.

**Typical pipeline at top companies (Meta, Airbnb, Coinbase, Shopify, Stripe):**

**1. Recruiter Screen (30 min)**
- Background, motivations, compensation expectations
- High-level technical discussion (not coding)
- They're evaluating communication and leveling

**2. Technical Phone Screen (45–60 min)**
- Live coding on CoderPad/HackerRank
- 1–2 medium-difficulty problems
- Clean code, communication, edge cases
- For Staff: may include architecture discussion

**3. On-site Loop (4–5 rounds, 45–60 min each):**

| Round | What's Tested | Senior Expectation | Staff Expectation |
|-------|--------------|-------------------|------------------|
| Coding 1 | Algorithms & DS | Optimal solution, clean code | + Trade-off discussion, scalability |
| Coding 2 | Practical/System | React Native specific coding | + Architecture of the solution |
| System Design | Mobile architecture | Drive the design with trade-offs | Define the design, anticipate future needs |
| Deep Dive | RN internals, performance | Explain mechanisms, debug scenarios | + Cross-platform strategy, platform decisions |
| Behavioral | Leadership, conflict | Team-level impact stories | Org-level impact, tech vision |

**4. Hiring Committee / Debrief**
- Interviewers present feedback independently
- Leveling discussion — Senior vs Staff signal
- Any red flags from any round can block

**Company-specific nuances:**
- **Meta**: Heavy focus on coding (Leetcode Medium-Hard) + product sense for mobile
- **Airbnb**: Values cultural fit heavily — dedicated "culture interview" round
- **Coinbase**: Crypto/fintech domain knowledge, security-first architecture
- **Shopify**: Mobile platform thinking, dev tooling, React Native specific depth
- **Stripe**: API design excellence, reliability engineering mindset

**Staff-specific interview additions:**
- Architecture presentation (bring your own design)
- Cross-functional alignment scenarios
- Technical vision and strategy discussions
- Code review exercise (review someone else's code)`,
      codeExample: `// What interviewers look for in your CODING rounds:

// ❌ Junior/Mid approach — works but shows no maturity
function findDuplicates(arr) {
  const dupes = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !dupes.includes(arr[i])) {
        dupes.push(arr[i]);
      }
    }
  }
  return dupes; // O(n³) — includes() is O(n) inside O(n²)
}

// ✅ Senior approach — optimal, clean, explains trade-offs
function findDuplicates(arr: number[]): number[] {
  // Approach: frequency map → filter entries with count > 1
  // Time: O(n), Space: O(n)
  const freq = new Map<number, number>();
  const result: number[] = [];
  
  for (const num of arr) {
    const count = (freq.get(num) ?? 0) + 1;
    freq.set(num, count);
    // Add to result exactly when we see the second occurrence
    if (count === 2) result.push(num);
  }
  
  return result;
}

// ✅ Staff approach — same solution BUT discusses:
// 1. "If the array doesn't fit in memory, I'd use external sort + streaming"
// 2. "If we need this in a hot path, we could use a BitSet for integers in a known range"
// 3. "In production, I'd add input validation and consider the API contract"
// 4. "This pattern is similar to our deduplication logic in the sync engine"

// ----- SYSTEM DESIGN round example prompt -----
// "Design a real-time messaging system for React Native"
// 
// Senior drives: architecture diagram, data models, offline queue
// Staff drives: + multi-device sync, E2E encryption strategy, 
//   message delivery guarantees, platform abstraction for web+mobile`,
      exercise: `**Interview Preparation Exercises:**
1. Practice 2 Leetcode Medium problems daily for 30 days — narrate your thought process aloud
2. Design 3 mobile systems end-to-end: messaging app, e-commerce app, social feed
3. Prepare 8 STAR stories covering: leadership, conflict, failure, mentoring, ambiguity, cross-team impact, technical trade-off, production incident
4. Mock interview with a peer — alternate interviewer/candidate roles
5. Practice writing code in a shared Google Doc or CoderPad (no autocomplete)
6. Record yourself explaining React Native's new architecture in 5 minutes — review for clarity
7. Write a 2-page technical vision document for a hypothetical mobile platform
8. Prepare a 10-minute architecture presentation of your most impactful project`,
      commonMistakes: [
        "Preparing only for coding and ignoring system design — at Senior+, system design carries equal or more weight",
        "Not calibrating to the company's specific interview format — Meta is coding-heavy, Airbnb is culture-heavy",
        "Giving team-level impact stories when interviewing for Staff — the scope must be org-level",
        "Not asking clarifying questions in system design — jumping to solutions signals mid-level thinking",
        "Preparing generic STAR stories — tailor them to show mobile/React Native specific depth",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Walk me through how you'd approach a system design question in your first 5 minutes.",
          a: "**Never jump to solutions.** First 5 minutes: (1) **Clarify functional requirements** — 'What are the core user actions? What's the primary use case?' (2) **Clarify non-functional requirements** — 'What's our scale? Latency expectations? Offline support needed?' (3) **Define scope** — 'For this discussion, I'll focus on X and Y, and leave Z for a follow-up.' (4) **State assumptions** — 'I'm assuming we have 1M DAU with 10% concurrent.' (5) **Outline the approach** — 'I'll start with the high-level architecture, then deep-dive into the data layer and sync mechanism.' This shows structured thinking and senior judgment.",
        },
        {
          type: "conceptual",
          q: "What signals does an interviewer look for to differentiate Senior from Staff?",
          a: "**Senior signals**: Drives the conversation independently, provides optimal solutions, discusses trade-offs when asked, handles edge cases proactively, communicates clearly. **Staff signals**: Thinks about the problem in a broader context ('How does this affect other teams?'), proactively discusses scalability and future evolution, considers organizational constraints ('Who maintains this?'), proposes monitoring and observability, challenges assumptions in the problem statement, and can zoom in/out between low-level implementation and high-level strategy seamlessly.",
        },
        {
          type: "scenario",
          q: "You're in a behavioral round. The interviewer asks: 'Tell me about a time you disagreed with your manager about a technical decision.' How do you structure your answer?",
          a: "Use STAR with emphasis on **respectful disagreement and data-driven resolution**: **S**: 'My manager wanted to adopt GraphQL for our React Native app's API layer mid-release cycle.' **T**: 'I was responsible for the mobile client and was concerned about the impact on our timeline and the team's learning curve.' **A**: 'I prepared a comparison document: REST vs GraphQL for our specific use case, including bundle size impact, caching complexity, and team ramp-up time. I proposed a phased approach: GraphQL for new endpoints only, with a compatibility layer. I scheduled a 1:1 to present my analysis.' **R**: 'My manager agreed to the phased approach. We shipped on time, and eventually migrated 70% of endpoints over 2 quarters. The key was framing it as risk mitigation, not disagreement.'",
        },
      ],
    },
    {
      id: "technical-leadership-expectations",
      title: "Technical Leadership & Architecture Ownership",
      explanation: `**Technical leadership in React Native** goes beyond writing code. At Senior+ level, you're expected to own the mobile platform's technical direction, make decisions that trade off short-term velocity for long-term sustainability, and ensure the architecture supports the team's growth.

**Architecture Ownership means:**
1. **You define the patterns** — folder structure, state management approach, navigation architecture, API integration layer
2. **You enforce consistency** — through code reviews, lint rules, and shared libraries
3. **You anticipate scale** — designing for 10x users, 10x engineers, 10x features
4. **You manage migration paths** — upgrading React Native versions, adopting new architectures, deprecating legacy patterns
5. **You document decisions** — ADRs (Architecture Decision Records), RFCs, design docs

**Cross-team alignment responsibilities (Staff level):**
- Align with iOS/Android native teams on shared feature parity
- Coordinate with backend teams on API contracts and data models
- Work with design systems team on component library standards
- Collaborate with platform/infra on CI/CD, monitoring, and release processes
- Align with product on technical feasibility and timeline implications

**Decision-making authority:**

| Decision Type | Senior | Staff |
|--------------|--------|-------|
| Library choice within team | ✅ Own | ✅ Own |
| Architecture pattern for team | ✅ Own | ✅ Own |
| Cross-team library adoption | 🔶 Propose | ✅ Own & drive |
| RN version upgrade strategy | 🔶 Contribute | ✅ Own & lead |
| Build/CI pipeline architecture | 🔶 Contribute | ✅ Own & define |
| Platform-level abstractions | 🔶 Use | ✅ Design & build |
| Vendor evaluation (Sentry, CodePush) | 🔶 Provide input | ✅ Evaluate & decide |

**The RFC process (how Staff engineers drive decisions):**
1. **Problem Statement** — What's broken/missing and why it matters
2. **Proposed Solution** — Architecture, code examples, migration plan
3. **Alternatives Considered** — Why other approaches were rejected
4. **Trade-offs** — What we gain and what we sacrifice
5. **Rollout Plan** — Phased adoption, feature flags, rollback strategy
6. **Success Metrics** — How we know this worked (perf, DX, incidents)`,
      codeExample: `// Architecture Decision Record (ADR) Example
// This is how Staff engineers document technical decisions

/**
 * ADR-007: Adopt Zustand for Feature-Level State Management
 * 
 * Status: Accepted
 * Date: 2025-01-15
 * Decision Makers: [Staff Eng, Tech Lead, Senior Eng]
 * 
 * Context:
 * - Current Redux store has 45 slices, 12K lines
 * - Bundle impact: redux + toolkit + saga = 42KB gzipped
 * - New engineers take 2 weeks to understand the state architecture
 * - Feature teams frequently cause cross-feature state bugs
 * 
 * Decision:
 * - Use Zustand for NEW feature-level state (isolated per feature)
 * - Keep Redux for cross-cutting global state (auth, config, theme)
 * - Migrate existing features incrementally (priority: most-changed first)
 * 
 * Trade-offs:
 * + Zustand: 1.2KB, zero boilerplate, TypeScript-native
 * + Feature isolation: no cross-feature state leaks
 * + Faster onboarding: Zustand is simpler mental model
 * - Two state management patterns in codebase (temporary)
 * - Need migration tooling / codemods
 * - Middleware patterns differ from Redux
 * 
 * Migration Plan:
 * Phase 1: New features use Zustand (enforce via lint rule)
 * Phase 2: Migrate top 5 most-changed features (Q1)
 * Phase 3: Migrate remaining features (Q2-Q3)
 * Phase 4: Remove Redux dependency (Q4 stretch goal)
 * 
 * Success Metrics:
 * - Feature state bugs reduced by 50% (from 12/quarter to 6)
 * - New feature setup time < 30 minutes (currently 2 hours)
 * - Bundle size reduction: 40KB (after full migration)
 */

// Staff-level: Defining the architectural standard
// platform/state/createFeatureStore.ts
import { create, StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface StoreConfig<T> {
  name: string;
  persist?: boolean;
  enableDevtools?: boolean;
}

export function createFeatureStore<T extends object>(
  config: StoreConfig<T>,
  stateCreator: StateCreator<T, [['zustand/immer', never]], []>
) {
  let store = stateCreator;

  // Apply immer for immutable updates
  const middlewares: any[] = [immer];

  // Optional persistence (for offline-first features)
  if (config.persist) {
    middlewares.push((fn: any) =>
      persist(fn, {
        name: \`feature-\${config.name}\`,
        // Custom storage for React Native (AsyncStorage/MMKV)
        storage: createMMKVStorage(config.name),
      })
    );
  }

  // Devtools in development
  if (__DEV__ || config.enableDevtools) {
    middlewares.push((fn: any) =>
      devtools(fn, { name: config.name })
    );
  }

  return create<T>()(
    middlewares.reduceRight((acc, mw) => mw(acc), stateCreator)
  );
}

// Usage by any feature team — consistent patterns, zero boilerplate:
const useCartStore = createFeatureStore(
  { name: 'cart', persist: true },
  (set, get) => ({
    items: [],
    total: 0,
    addItem: (item) => set((state) => {
      state.items.push(item);
      state.total += item.price;
    }),
    removeItem: (id) => set((state) => {
      const idx = state.items.findIndex(i => i.id === id);
      if (idx !== -1) {
        state.total -= state.items[idx].price;
        state.items.splice(idx, 1);
      }
    }),
  })
);`,
      exercise: `**Leadership Practice Exercises:**
1. Write an ADR for a real decision in your current project — follow the template above
2. Draft an RFC for migrating from React Navigation 5 to 7 — include rollout phases, risk mitigation, and success metrics
3. Create a "Mobile Architecture Principles" document (1 page) that a new engineer could read on day 1
4. Design a code review checklist specific to React Native that enforces architectural standards
5. Prepare a 15-minute architecture review presentation for a feature you recently built
6. Write a tech debt prioritization matrix for your mobile app with business impact scores
7. Create an onboarding guide for a new Senior RN engineer joining your team`,
      commonMistakes: [
        "Making architecture decisions without documenting the trade-offs — when you leave, the 'why' leaves with you",
        "Enforcing standards through verbal communication only — use lint rules, templates, and automated checks",
        "Owning architecture but not owning the migration path — a new pattern without migration tooling creates more debt",
        "Not involving other engineers in decisions — even if you're right, decisions made in isolation create resentment",
        "Optimizing for technical elegance instead of team productivity — the best architecture is one your team can maintain",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "You're the tech lead for a React Native app with 200K LOC. The CEO wants a new feature that requires a fundamentally different navigation pattern. How do you approach this?",
          a: "**Don't let the CEO's urgency override architectural judgment.** (1) Evaluate the proposed navigation change against the existing architecture — can it be adapted or does it require a rewrite? (2) Prototype both approaches: adapting the current navigation and the new pattern. Time-box to 3 days. (3) Present a comparison to stakeholders: development time, regression risk, maintainability. (4) If the new pattern is indeed better, propose a phased rollout: new feature uses the new pattern, existing screens migrate incrementally. (5) Create a compatibility layer so both patterns coexist during migration. (6) Define migration milestones tied to sprint cycles. The key: protect the team from rushed architectural changes while enabling business velocity.",
        },
        {
          type: "conceptual",
          q: "What does 'architecture ownership' mean in practice?",
          a: "It means: (1) You wrote the ADRs explaining WHY the architecture is the way it is. (2) You own the shared libraries and platform code. (3) You review every PR that touches architectural boundaries. (4) You maintain the architecture diagram and keep it current. (5) You run architecture review meetings for new features. (6) You create migration plans when the architecture needs to evolve. (7) You monitor architecture health metrics (build time, bundle size, crash rate). (8) You mentor engineers who violate patterns — teaching, not policing.",
        },
        {
          type: "scenario",
          q: "Two senior engineers on your team disagree about whether to use React Query or custom hooks for data fetching. How do you resolve this?",
          a: "**Framework for technical disagreements:** (1) Ask both engineers to write a 1-page proposal with trade-offs — this forces structured thinking. (2) Define evaluation criteria upfront: bundle size, DX, caching needs, offline support, team familiarity. (3) Build a small prototype with each approach (same feature) and compare. (4) Make a time-boxed decision — 'We'll try React Query for 2 features and re-evaluate.' (5) Document the decision in an ADR regardless of the outcome. The goal is evidence-based decisions, not opinion-based debates.",
        },
      ],
    },
  ],
};

export default rnPhase1;
