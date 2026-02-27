const rnPhase13 = {
  id: "phase-13",
  title: "Phase 13: Technical Leadership & Communication",
  emoji: "👔",
  description: "Lead as a Staff engineer — technical decision-making frameworks, architecture decision records, mentoring, code review excellence, cross-team influence, and stakeholder communication.",
  topics: [
    {
      id: "tech-leadership-patterns",
      title: "Technical Leadership Patterns & Decision Making",
      explanation: `**Staff engineers are force-multipliers.** Your impact isn't measured by how much code you write, but by how much you enable the entire team to move faster and make better decisions.

**The 4 pillars of Staff engineering:**

1. **Technical Direction** — Setting the architectural vision and ensuring consistent technical decisions across teams.
2. **Execution Excellence** — Unblocking others, reviewing complex PRs, identifying and mitigating technical risks before they become crises.
3. **Knowledge Sharing** — Writing ADRs, giving tech talks, mentoring senior engineers toward staff-level, creating runbooks.
4. **Organizational Influence** — Translating technical tradeoffs into business terms, influencing roadmap prioritization, building consensus across teams.

**Architecture Decision Records (ADRs):**
ADRs document WHY a technical decision was made — the context, options considered, trade-offs, and the final decision. Without ADRs, new engineers ask "why did we choose Redux over Zustand?" and nobody remembers.

**ADR Template:**
\`\`\`
# ADR-001: State Management Strategy

## Status: Accepted
## Date: 2024-03-15

## Context
Our app has grown to 50 screens with 10 engineers. We're experiencing:
- Excessive re-renders due to single Redux store
- 40% of Redux code is boilerplate for API data
- New engineers take 2 weeks to understand the state architecture

## Options Considered
1. Refactor Redux — Better selectors, split stores
2. Migrate to Zustand — Simpler API, selector-based
3. Hybrid — React Query for server state + Zustand for client state

## Decision: Option 3 — Hybrid approach

## Rationale
- 70% of our Redux slices are API data → React Query handles this with less code
- Client state (theme, auth) is simple → Zustand is sufficient
- Incremental migration — new features use new stack, old features migrate over time

## Consequences
- Team needs React Query training (2-day workshop)
- Migration will take ~3 months (incremental, per-feature)
- Dual systems during migration (acceptable, well-documented boundaries)
\`\`\`

**Code Review Excellence:**
At the staff level, your code reviews teach patterns, catch architectural issues, and raise the team's overall quality. Review checklist:
- Does this change align with our architectural patterns?
- Are error cases handled? What happens when the API fails?
- Will this scale? What if the list has 10K items?
- Is this testable? Can we write a unit test without complex mocking?
- Does this introduce a dependency we'll regret? (bundle size, maintenance)`,
      codeExample: `// === TECHNICAL LEADERSHIP IN PRACTICE ===

// 1. RFC (Request for Comments) for significant changes
/*
# RFC: Migrate to React Navigation 7

## Background
We're on React Navigation 5 (2 major versions behind). Benefits of v7:
- Type-safe navigation (reduces runtime crashes by ~15%)
- Static API (better tree-shaking, faster builds)
- Preloading screens (faster navigation transitions)

## Proposed Approach
Phase 1 (Week 1-2): Upgrade to v6 (smaller jump, intermediate step)
Phase 2 (Week 3-4): Upgrade to v7
Phase 3 (Week 5): Enable type-safe navigation for all screens

## Risk Assessment
- Risk: Third-party navigation libraries may be incompatible
  Mitigation: Audit dependencies before starting

- Risk: Custom navigators may break
  Mitigation: Identify and update in Phase 1

## Rollback Plan
If critical issues found: revert commit. Navigation state is ephemeral —
no data migration needed.

## Open Questions
1. Do we adopt the static API for new screens immediately or after full migration?
2. Should we take this opportunity to restructure our navigator hierarchy?
*/

// 2. Mentoring pattern: Pull Request as teaching moment
/*
REVIEW COMMENT on a PR that uses useEffect for derived state:

> Instead of:
> useEffect(() => {
>   setFilteredItems(items.filter(i => i.active));
> }, [items]);
>
> Consider using useMemo:
> const filteredItems = useMemo(
>   () => items.filter(i => i.active),
>   [items]
> );
>
> **Why:** useEffect for derived state is an anti-pattern because:
> 1. It causes an extra render cycle (render → effect → setState → render again)
> 2. There's a brief moment where filteredItems is stale/empty
> 3. useMemo computes during render — no extra cycle, always consistent
>
> Reference: https://react.dev/learn/you-might-not-need-an-effect
*/

// 3. Technical decision framework
function evaluateTechnicalDecision(options) {
  const criteria = {
    // Weight: 1-5 (5 = most important)
    teamExpertise:        { weight: 4, description: 'Team can use it effectively' },
    maintenanceBurden:    { weight: 5, description: 'Long-term maintenance cost' },
    communitySupport:     { weight: 3, description: 'Active community & docs' },
    performanceImpact:    { weight: 4, description: 'Runtime performance' },
    migrationCost:        { weight: 3, description: 'Cost to adopt/migrate' },
    bundleSizeImpact:     { weight: 2, description: 'Impact on app size' },
  };
  
  // Score each option on each criterion (1-5)
  // Calculate weighted score
  // Decision = highest weighted score + team consensus
  
  // Document in ADR with scores visible
}

// 4. On-call runbook template
/*
# Runbook: High Crash Rate Alert

## Trigger
Crash-free rate drops below 99% (normal: 99.7%)

## Immediate Actions (within 15 minutes)
1. Check Sentry for top crash
2. Determine if crash is in JS or Native
3. Check if crash correlates with recent release (within 48h)
4. If yes: consider rollback or CodePush fix
5. If no: investigate root cause

## Escalation
- JS crash: Mobile team lead
- Native crash: Platform engineer on-call
- Backend-caused: Backend team lead
- If > 5% crash rate: VP of Engineering (potential app store removal)

## Communication
- Post in #incidents Slack channel
- Update status page if user-facing
*/`,
      exercise: `**Leadership Exercises:**
1. Write an ADR for a real technical decision you made (or would make) in your project
2. Write an RFC for introducing a new library or pattern to your team
3. Review 3 open-source PRs and write constructive, teaching-oriented review comments
4. Create a runbook for a common production incident (API outage, crash spike)
5. Give a 15-minute tech talk to your team on a topic from this roadmap
6. Identify the top 3 pieces of tech debt in your codebase and write a prioritized remediation plan`,
      commonMistakes: [
        "Making unilateral technical decisions without team buy-in — Staff engineers build consensus, not dictate",
        "Not documenting decisions in ADRs — 6 months later nobody remembers why a choice was made",
        "Writing code reviews that only say 'nit' or 'LGTM' — senior reviews should teach patterns and catch structural issues",
        "Not investing in mentoring — Staff engineers who don't develop others are senior engineers with a fancier title",
        "Over-engineering the architecture — the simplest solution that meets requirements is almost always the best choice",
      ],
      interviewQuestions: [
        {
          type: "behavioral",
          q: "Tell me about a time you made a controversial technical decision. How did you handle disagreement?",
          a: "**Framework for answering:** (1) Context: What was the decision and why was it controversial? (2) Process: How did you gather input? (RFC, ADR, team discussion). (3) Decision: What did you decide and why? Include specific trade-offs. (4) Disagreement: How did you handle engineers who disagreed? (5) Outcome: What happened? Was the decision validated or did you need to adjust? **Key behaviors to demonstrate:** data-driven decision making, willingness to listen and change your mind, clarity in communication, follow-through on decisions.",
        },
        {
          type: "behavioral",
          q: "How do you mentor junior/mid-level engineers to become senior?",
          a: "**Multi-modal mentoring:** (1) **Code reviews**: Detailed, teaching-oriented reviews with links to docs. Not just 'change this' but 'here's why'. (2) **Pairing sessions**: Work through complex problems together. Let them drive, guide with questions. (3) **Stretch assignments**: Assign slightly-beyond-comfort-zone tasks with safety net (your availability). (4) **Architecture exposure**: Include them in design discussions. Ask for their opinion. (5) **Feedback loops**: Regular 1:1s with specific, actionable feedback. Celebrate growth. (6) **Independence calibration**: Start with high touch, gradually reduce as they demonstrate competence.",
        },
        {
          type: "scenario",
          q: "Your CEO wants a feature shipped in 2 weeks that your team estimates at 6 weeks. How do you handle this?",
          a: "**Never say 'no' — say 'yes, and here are the trade-offs'.** (1) Understand the business pressure: Why 2 weeks? Is there a competitor launch, investor demo, contractual deadline? (2) Scope reduction: What's the minimum version that meets the core business need? Often 30% of the feature delivers 80% of the value. (3) Trade-offs: Present options — 'We can ship X in 2 weeks with these limitations, and add Y and Z in the following 4 weeks. OR we ship the full version in 6 weeks.' (4) Risk transparency: 'If we rush the full feature, we'll accumulate tech debt that will slow us down for the next 3 months.' (5) Your recommendation: Always have one. Don't just present options — advocate for the one you believe is best.",
        },
      ],
    },
  ],
};

export default rnPhase13;
