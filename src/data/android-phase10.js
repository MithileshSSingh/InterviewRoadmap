const androidPhase10 = {
  id: "phase-10",
  title: "Phase 10: Behavioral & Leadership",
  emoji: "👔",
  description: "Master Google's behavioral interviews — Googleyness, leadership without authority, conflict resolution, and STAR method.",
  topics: [
    {
      id: "googleyness-leadership",
      title: "Googleyness & Leadership Signals",
      explanation: `**Google's behavioral interviews** (called "Googleyness & Leadership" or G&L) assess your ability to thrive in Google's culture. At the senior level, leadership expectations are significantly higher.

**What Google evaluates at L5 (Senior):**
1. **Googleyness:** Comfort with ambiguity, bias towards action, collaborative, humble
2. **Leadership:** Influence without authority, driving consensus, mentoring
3. **Navigating complexity:** Making decisions with incomplete information
4. **Impact:** Projects you've driven that had organizational impact
5. **Growth mindset:** Learning from failures, seeking feedback

**The STAR Method (required for all behavioral answers):**
\`\`\`
S — Situation: Brief context (1-2 sentences)
T — Task: What was YOUR role/responsibility?
A — Action: What specific actions did YOU take?
R — Result: Quantifiable outcome + what you learned
\`\`\`

**Senior-level STAR expectations:**
- Situations involve ambiguity, trade-offs, and organizational impact
- Actions show leadership, initiative, and influence
- Results are quantifiable and organization-wide
- Lessons are insightful and show growth

**Key behavioral question categories:**
1. **Technical leadership** — Leading architecture decisions, code quality initiatives
2. **Conflict resolution** — Disagreements with peers/managers, navigating org dynamics
3. **Ambiguity** — Making decisions with incomplete information
4. **Mentoring** — Growing team members, code reviews, knowledge sharing
5. **Failure stories** — What went wrong, what you learned, how you changed`,
      codeExample: `// This topic focuses on behavioral skills, not code.
// However, here's a structured template for preparing STAR stories:

/*
STORY BANK TEMPLATE — Prepare 8-10 stories that cover all categories

Story 1: "App Architecture Migration"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S: Our Android app had 500K LOC in a single module, 15-minute build times.
T: As senior engineer, I needed to drive the modularization initiative.
A: (1) Created RFC with cost-benefit analysis
   (2) Built proof-of-concept with 3 modules
   (3) Presented to 20-person team with migration plan
   (4) Led weekly migration sessions, mentored 5 engineers
   (5) Created automated tooling to detect dependency violations
R: Build times reduced from 15 min → 4 min (73% improvement)
   Team velocity increased 40% (measured by sprint points)
   Zero production incidents during 6-month migration
Covers: Technical leadership, influence, mentoring

Story 2: "Disagreement on Architecture"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S: Team lead wanted to use NoSQL for our new feature, I favored SQL.
T: Need to resolve disagreement without damaging relationship.
A: (1) Asked to understand their perspective fully (15 min 1-on-1)
   (2) Created a comparison doc with pros/cons for both approaches
   (3) Proposed a time-boxed prototype to compare both
   (4) Let data from the prototype drive the decision
R: Prototype showed SQL was 3x faster for our query patterns
   Team lead agreed, and we maintained strong relationship
   Process became our standard for technical decisions
Covers: Conflict resolution, data-driven decision making

Story 3: "Production Incident"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S: App crashed for 100K users after a release — OOM on image loading.
T: I was the on-call senior engineer, needed to resolve quickly.
A: (1) Immediately rolled back the release (15 min)
   (2) Root-caused: new image grid loaded full-res images
   (3) Implemented proper image sizing with Glide
   (4) Added memory regression tests to CI pipeline
   (5) Led post-mortem, created release checklist
R: Downtime: 45 minutes. No repeat incidents.
   Memory regression tests caught 3 issues in next quarter.
   Release checklist adopted by all 4 mobile teams.
Covers: Failure story, process improvement, impact
*/`,
      exercise: `**Prepare These Stories:**
1. A time you led a technical initiative (architecture, tooling, process)
2. A time you disagreed with a teammate/manager — how you resolved it
3. A time you failed — what happened and what you changed
4. A time you mentored someone and helped them grow
5. A time you made a decision with incomplete information
6. A time you improved a process or workflow for your team
7. A time you had to push back on a deadline or requirements
8. A time you worked on something outside your comfort zone

**Practice Framework:**
- Write each story in STAR format (max 2 minutes when spoken)
- Practice out loud (recording yourself helps)
- Have a friend interview you with random questions
- Map each story to multiple question categories`,
      commonMistakes: [
        "Giving team-level answers ('we did X') — use 'I' to describe YOUR actions. Google evaluates YOUR contribution, not the team's.",
        "Too much situation, too little action — the action is the most important part. Keep situation brief.",
        "Not quantifying results — 'it went well' is not a result. Use metrics: '40% faster', '3x improvement', 'zero incidents'.",
        "Only positive stories — Google expects you to discuss failures honestly. They evaluate self-awareness and growth.",
        "Preparing only 2-3 stories — you need 8-10 to cover all question categories without reusing.",
      ],
      interviewQuestions: [
        {
          type: "behavioral",
          q: "Tell me about a time you influenced a technical decision at the organizational level.",
          a: "**STAR Framework:** S: 'Our 3 mobile teams each used different networking/caching patterns, causing bugs and duplicate effort.' T: 'I proposed creating a shared networking module.' A: '(1) Documented 15 networking-related bugs across teams in the past quarter. (2) Created an RFC with a design for a shared module. (3) Presented to all 3 tech leads in a cross-team meeting. (4) Volunteered to build the MVP alongside my regular work. (5) Created migration guides for each team. (6) Held office hours to support migration.' R: 'All 3 teams adopted the shared module within 2 months. Networking bugs reduced by 80%. I was recognized in the quarterly engineering all-hands. This became the template for creating shared modules across the org.'"
        },
        {
          type: "behavioral",
          q: "Tell me about a time you had to push back on a product manager or stakeholder.",
          a: "**STAR Framework:** S: 'PM wanted to ship a major feature in 2 weeks, but the codebase needed refactoring first — tech debt was causing 2-3 bugs per sprint.' T: 'Convince PM that investing 1 sprint in refactoring would pay off.' A: '(1) Collected data: bug rate, time spent on workarounds, projected velocity with/without refactoring. (2) Created a visual showing: ship now = 6 sprints total (including bug fixes) vs refactor first = 5 sprints total. (3) Proposed compromise: refactor the most critical components (1 week) then ship MVP (2 weeks). (4) Committed to tracking velocity improvement.' R: 'PM agreed to the compromise. After refactoring, velocity improved 30%. Feature shipped in 3 weeks total with zero P0 bugs (previous similar feature had 4). PM started consulting me on timeline estimates proactively.'"
        },
      ],
    },
    {
      id: "system-design-behavioral",
      title: "System Design Interview Communication",
      explanation: `**System design communication** is as important as the design itself. At senior level, Google expects you to drive the conversation, make trade-officials explicit, and demonstrate architectural thinking.

**System Design Interview Framework (45 minutes):**
\`\`\`
0-5 min:   Requirements gathering & scope definition
5-10 min:  High-level architecture (draw the boxes)
10-30 min: Deep dive into key components
30-40 min: Discuss trade-offs, scalability, failure modes
40-45 min: Wrap up, answer follow-ups
\`\`\`

**Requirements gathering template:**
1. **Functional:** What does the system do? (list features, prioritize)
2. **Non-functional:** Scale (users, QPS), latency, availability, consistency
3. **Constraints:** Offline support? Real-time? Platform (mobile-only, cross-platform)?
4. **Scope:** What's in scope for this interview? (always clarify)

**Android-specific system design topics:**
1. Design a news feed (Instagram/Twitter)
2. Design a messaging app (WhatsApp)
3. Design a ride-sharing app (Uber)
4. Design offline-first notes app (Google Keep)
5. Design a photo gallery with sync (Google Photos)
6. Design a location-tracking app (Google Maps routing)
7. Design an e-commerce checkout flow

**Communication tips:**
- Start with the user-facing flow, then go deeper
- Draw diagrams (even in text — boxes and arrows)
- State constraints explicitly before designing
- Discuss at least 2 approaches and explain your choice
- Proactively address: failure modes, scaling bottlenecks, security`,
      codeExample: `// System Design: Offline-first Notes App (Google Keep style)
// This is a template for how to structure your answer

/*
REQUIREMENTS:
━━━━━━━━━━━━
Functional:
  - Create, edit, delete notes (text + checklist)
  - Sync across devices
  - Work fully offline
  - Real-time collaboration (stretch)
Non-functional:
  - <100ms local operations
  - Sync within 5 seconds when online
  - Eventual consistency ok
  - Support 10M+ notes per user (over time)

HIGH-LEVEL ARCHITECTURE:
━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────┐
│  Compose UI                        │
│  ├── NoteListScreen                │
│  └── NoteEditorScreen              │
│         ↕                          │
│  ViewModel (StateFlow)             │
│         ↕                          │
│  Repository (source of truth)      │
│     ↕              ↕               │
│  Room DB        SyncEngine         │
│  (local)       ↕         ↕         │
│           WorkManager   WebSocket  │
│               ↕              ↕     │
│           REST API      Real-time  │
│               ↕              ↕     │
│           ──── Backend ────        │
└─────────────────────────────────────┘

KEY DESIGN DECISIONS:
━━━━━━━━━━━━━━━━━━━━
1. Room as source of truth
   - All reads from Room (instant, offline-capable)
   - Writes go to Room first, then sync to server
   
2. Delta sync with change tracking
   - Each note has: localVersion, serverVersion, syncState
   - Pending changes queued in separate table
   - WorkManager processes queue when online

3. Conflict resolution: Field-level merge
   - Track which fields changed (title, content, color)
   - If different fields → auto-merge
   - If same field → LWW with server timestamp
   
4. Real-time updates: WebSocket when foregrounded
   - FCM fires WorkManager sync when backgrounded
   - WebSocket provides instant updates in active session

TRADE-OFFS DISCUSSED:
━━━━━━━━━━━━━━━━━━━━
- Full sync vs Delta sync → Delta (bandwidth, battery)
- LWW vs CRDT → LWW (simpler, acceptable for notes)
- WebSocket vs SSE → WebSocket (bidirectional for real-time edit)
- Single DB vs DB-per-note → Single DB (simpler queries, pagination)
*/`,
      exercise: `**Practice these system designs (45 min each, timer on):**
1. Design the Android architecture for Instagram's feed + stories
2. Design a ride-sharing app's driver-rider matching UI
3. Design Google Photos' gallery with cloud sync and sharing
4. Design a payment checkout flow with state recovery
5. Design an offline-first task management app (Todoist/Asana)

**For each, document:**
- Requirements (functional + non-functional)
- High-level architecture diagram
- Data model (Room entities)
- Key API contracts
- Sync strategy
- Error handling strategy
- Trade-offs discussed`,
      commonMistakes: [
        "Diving into implementation details before establishing requirements and high-level architecture",
        "Not discussing trade-offs — Google wants to see your decision-making process, not just the answer",
        "Designing only the happy path — always discuss failure modes, edge cases, and degraded states",
        "Ignoring mobile-specific concerns — battery, offline, network transitions, process death",
        "Not drawing diagrams — visual communication is essential, even in text-based interviews",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Walk me through how you'd design the Android client for a ride-sharing app like Uber.",
          a: "**Requirements:** Real-time driver location, ride booking, ETA, payment. Offline: limited (show last known state). **Architecture:** MVVM + Clean Architecture. **Key screens:** Map (active ride), Ride Request, Driver Status. **Real-time:** WebSocket for driver location updates (every 2s). FCM for ride status changes (accepted, arrived, completed). **Data:** Room for ride history + cached POIs. **Location:** FusedLocationProvider with PRIORITY_HIGH_ACCURACY during active ride, BALANCED_POWER_ACCURACY otherwise. **Map:** Google Maps SDK with custom markers. Driver position smoothly animated between updates. **Payment:** Tokenized payment via server (never store card details locally). **Error handling:** Network loss during ride → show last known state, queue actions (cancel/rate). Reconnect and sync. **Key trade-off:** Location update frequency: 2s gives smooth tracking but higher battery drain. Use adaptive: 2s during active ride, 30s otherwise."
        },
      ],
    },
  ],
};

export default androidPhase10;
