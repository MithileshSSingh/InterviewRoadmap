const androidPhase11 = {
  id: "phase-11",
  title: "Phase 11: 90-Day Preparation Plan",
  emoji: "📅",
  description: "A structured 90-day plan to prepare for Google's Senior Android Developer interview — daily schedule, weekly goals, and milestone checkpoints.",
  topics: [
    {
      id: "month-1-foundations",
      title: "Month 1: Foundations (Days 1-30)",
      explanation: `**Month 1 goal:** Build a solid foundation in DSA patterns, review Android fundamentals, and establish daily practice habits.

**Daily schedule (3-4 hours/day):**
\`\`\`
Morning (1.5 hours):
  - 1 LeetCode medium problem (45 min)
  - Review solution + alternative approaches (15 min)
  - Study 1 DSA pattern chapter (30 min)

Evening (1.5-2 hours):
  - Review 1 Android fundamental topic (60 min)
  - Build mini-project applying today's Android topic (30-60 min)
\`\`\`

**Week 1-2: Data Structures Review**
- Day 1-3: Arrays, Strings — Two pointers, sliding window, prefix sums
- Day 4-5: HashMaps — Frequency counting, grouping, two-sum patterns
- Day 6-7: Stacks, Queues — Monotonic stack, BFS fundamentals
- Day 8-10: Trees — BFS, DFS, BST operations, serialization
- Day 11-12: Graphs — Adjacency list, BFS shortest path, DFS
- Day 13-14: Heaps — Top-K, merge K sorted, median

**Week 3-4: Algorithm Patterns**
- Day 15-17: Dynamic Programming — 1D DP, 2D DP, knapsack variants
- Day 18-19: Binary Search — Sorted arrays, search space problems
- Day 20-21: Backtracking — Subsets, permutations, combinations
- Day 22-23: Greedy — Intervals, scheduling, minimum operations
- Day 24-25: Union-Find — Connected components, redundant connection
- Day 26-28: Mixed practice — Random medium/hard problems
- Day 29-30: Assessment — Mock coding interview (2 problems, 45 min)

**Android topics for Month 1:**
- Activity/Fragment lifecycle, process death, config changes
- Jetpack Compose vs Views (deep comparison)
- Coroutines, Flow, StateFlow — build a reactive data pipeline
- Room database — design a schema, write complex queries
- MVVM pattern — implement a complete feature

**Milestone checkpoint (Day 30):**
□ Solved 30+ LeetCode problems (20 medium, 10 easy)
□ Can identify 6 core DSA patterns
□ Built 2 mini Android projects
□ Comfortable with Kotlin coroutines and Flow`,
      codeExample: `// Week 1 sample practice schedule tracker
/*
DAY 1: Arrays & Two Pointers
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Morning:
  ✅ Problem: Container With Most Water (Medium)
  ✅ Pattern identified: Two pointers from both ends
  ✅ Time: O(n) Space: O(1)
  📖 Study: Two pointers chapter in "Patterns for Coding"

Evening:
  📱 Android: Activity lifecycle internals
  🔨 Mini-project: Activity that logs all lifecycle callbacks
  
DAY 2: Arrays & Sliding Window
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Morning:
  ✅ Problem: Minimum Window Substring (Hard)
  ✅ Pattern: Variable-size sliding window + frequency map
  ✅ Time: O(n) Space: O(k)
  📖 Study: Sliding window chapter

Evening:
  📱 Android: Fragment lifecycle + communication
  🔨 Mini-project: Fragment-based navigation with shared ViewModel

DAY 3: Arrays & Prefix Sum
━━━━━━━━━━━━━━━━━━━━━━━━━
Morning:
  ✅ Problem: Product of Array Except Self (Medium)
  ✅ Pattern: Prefix/suffix arrays
  ✅ Time: O(n) Space: O(1) with output array
  📖 Study: Prefix sum patterns

Evening:
  📱 Android: Process death handling
  🔨 Mini-project: Form that survives process death with SavedStateHandle
*/

// Track your progress in a spreadsheet or app
// Columns: Date | Problem | Difficulty | Pattern | Solved? | Time | Notes`,
      exercise: `**Month 1 Problem Set (30 problems):**

**Week 1 — Arrays & Strings:**
1. Two Sum (Easy)
2. Container With Most Water (Medium)
3. 3Sum (Medium)
4. Minimum Window Substring (Hard)
5. Product of Array Except Self (Medium)
6. Merge Intervals (Medium)
7. Longest Substring Without Repeating (Medium)

**Week 2 — Trees & Graphs:**
8. Binary Tree Level Order Traversal (Medium)
9. Validate BST (Medium)
10. Lowest Common Ancestor (Medium)
11. Number of Islands (Medium)
12. Course Schedule (Medium)
13. Kth Smallest Element in BST (Medium)
14. Serialize and Deserialize Binary Tree (Hard)

**Week 3 — DP & Binary Search:**
15. Climbing Stairs (Easy)
16. Coin Change (Medium)
17. Longest Increasing Subsequence (Medium)
18. Word Break (Medium)
19. House Robber (Medium)
20. Unique Paths (Medium)
21. Search in Rotated Sorted Array (Medium)

**Week 4 — Mixed:**
22. Top K Frequent Elements (Medium)
23. Merge K Sorted Lists (Hard)
24. LRU Cache (Medium)
25. Task Scheduler (Medium)
26. Find Median from Data Stream (Hard)
27. Meeting Rooms II (Medium)
28. Trapping Rain Water (Hard)
29. Daily Temperatures (Medium)
30. Accounts Merge (Medium)`,
      commonMistakes: [
        "Trying to solve hard problems without mastering medium ones first — build up gradually",
        "Only solving problems without reviewing patterns — you need to recognize patterns, not memorize solutions",
        "Skipping Android fundamentals — Google asks Android deep-dive questions that require solid fundamentals",
        "Not tracking progress — without data, you can't identify weak areas to focus on",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How should you structure your daily DSA practice for maximum retention?",
          a: "**Spaced repetition + active recall:** (1) Solve new problems daily (push boundaries). (2) Review problems from 3 days ago (short-term recall). (3) Review problems from 7 days ago (medium-term). (4) Review problems from 14 days ago (long-term). (5) After solving, write a 1-line note of the pattern used. (6) When reviewing, try to identify the pattern before looking at your solution. (7) If you can identify the pattern and approach from memory, it's learned. If not, resolve it. This is similar to how Anki/flashcards work but for coding problems."
        },
      ],
    },
    {
      id: "month-2-deep-dive",
      title: "Month 2: Deep Dive (Days 31-60)",
      explanation: `**Month 2 goal:** Deepen Android architecture and system design skills, practice behavioral questions, and increase DSA difficulty.

**Daily schedule (3-4 hours/day):**
\`\`\`
Morning (2 hours):
  - 1 LeetCode medium/hard problem (45 min)
  - 1 previously solved problem review (15 min)
  - Android deep-dive topic study (60 min)

Evening (1.5 hours):
  - System design practice (45 min, 3x/week)
  - Behavioral story preparation (30 min, 2x/week)
  - Build/extend architecture project (45 min)
\`\`\`

**Week 5-6: Android Architecture Deep Dive**
- Clean Architecture — implement a full feature with all layers
- Modularization — split a monolith into modules
- Hilt dependency injection — advanced scoping, qualifiers
- Offline-first with Room — sync engine, conflict resolution
- Performance profiling — memory, CPU, rendering

**Week 7-8: System Design + Behavioral**
- Practice 1 system design problem per session (3x/week)
- Write 8 STAR stories covering all behavioral categories
- Practice speaking answers aloud (record and review)
- Study Android-specific system design patterns
- Review production-grade architecture at scale

**Android topics for Month 2:**
- Jetpack Compose deep dive — recomposition, performance
- WorkManager — complex chains, constraints, retry
- Navigation architecture — multi-module, deep links
- Security — OAuth, encryption, certificate pinning
- Testing — unit tests, UI tests, fakes vs mocks

**Milestone checkpoint (Day 60):**
□ Solved 60+ LeetCode problems total (40 medium, 15 hard)
□ Completed 4 system design practice sessions
□ Written 8 STAR stories
□ Built a multi-module app with MVVM + offline-first + Hilt
□ Can explain Android component lifecycle at framework level`,
      codeExample: `// Month 2 study plan visualization

/*
WEEK 5: Architecture + Hard Problems
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mon: Clean Architecture implementation + LeetCode Hard
Tue: Modularization practice + LeetCode Medium
Wed: System Design: Design Google Keep
Thu: Hilt advanced patterns + LeetCode Medium
Fri: Behavioral prep (2 stories) + LeetCode Medium
Sat: Architecture project work + review week's problems
Sun: Rest / light review

WEEK 6: Performance + Mixed Practice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mon: Memory profiling + LeetCode Hard
Tue: Rendering optimization + LeetCode Medium
Wed: System Design: Design Instagram Feed
Thu: Battery optimization + LeetCode Medium
Fri: Behavioral prep (2 stories) + LeetCode Medium
Sat: Extended project + Perfetto profiling
Sun: Rest / light review

TRACKING TEMPLATE:
━━━━━━━━━━━━━━━━━
System Designs Completed:
  ☐ Google Keep (offline-first notes)
  ☐ Instagram Feed (real-time, pagination)
  ☐ WhatsApp (messaging, E2E encryption)
  ☐ Uber (location, real-time matching)
  
Behavioral Stories Ready:
  ☐ Technical leadership initiative
  ☐ Conflict resolution with peer
  ☐ Failure + learning story
  ☐ Mentoring / growing others
  ☐ Decision with incomplete info
  ☐ Process improvement
  ☐ Pushing back on stakeholder
  ☐ Outside comfort zone
*/`,
      exercise: `**Month 2 Problem Set (30 more problems):**

**Week 5 — Advanced Patterns:**
31. Word Ladder (Hard)
32. Alien Dictionary (Hard)
33. Edit Distance (Medium)
34. Partition Equal Subset Sum (Medium)
35. Decode Ways (Medium)
36. Regular Expression Matching (Hard)
37. Palindrome Partitioning (Medium)

**Week 6 — Graph Algorithms:**
38. Clone Graph (Medium)
39. Pacific Atlantic Water Flow (Medium)
40. Redundant Connection (Medium)
41. Graph Valid Tree (Medium)
42. Cheapest Flights Within K Stops (Medium)
43. Network Delay Time (Medium)
44. Reconstruct Itinerary (Hard)

**Week 7-8 — Interview Simulation:**
45. Word Search II (Hard)
46. Sliding Window Maximum (Hard)
47. Maximum Frequency Stack (Hard)
48. Design Hit Counter (Medium)
49. Design Twitter (Medium)
50. Implement Trie (Medium)
51. Minimum Height Trees (Medium)
52. Shortest Path in Binary Matrix (Medium)
53. Rotting Oranges (Medium)
54. All Paths from Source to Target (Medium)
55-60. Mock interview problems (random selection)`,
      commonMistakes: [
        "Neglecting system design preparation — it's 50% of the senior interview and harder to cram",
        "Not practicing behavioral answers aloud — writing them is different from speaking them fluently",
        "Doing only easy problems to feel productive — growth comes from struggling with medium/hard problems",
        "Not building projects — theory without practice doesn't demonstrate mastery in architecture discussions",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the most effective way to prepare for system design interviews?",
          a: "**Structured approach:** (1) Read: 'Designing Data-Intensive Applications' for fundamentals. (2) Practice framework: For every system design, follow Requirements → High-Level → Deep Dive → Trade-offs. (3) Mobile-specific: Always address offline support, battery, process death — interviewers expect this from Android candidates. (4) Draw it: Practice drawing architecture diagrams quickly. (5) Study real systems: Read engineering blogs from Google, Meta, Uber about their mobile architectures. (6) Time-box: Practice with a 45-minute timer. Many candidates run out of time because they spend too long on requirements."
        },
      ],
    },
    {
      id: "month-3-simulation",
      title: "Month 3: Simulation & Polish (Days 61-90)",
      explanation: `**Month 3 goal:** Full interview simulation, polish weak areas, build confidence. Focus shifts from learning to performing under interview conditions.

**Daily schedule (3-4 hours/day):**
\`\`\`
Morning (2 hours):
  - Mock interview simulation (45 min) OR
  - 2 LeetCode problems timed (45 min)
  - Review and reflect (30 min)
  - Weak area deep dive (45 min)

Evening (1.5 hours):
  - System design mock (3x/week) OR
  - Behavioral mock (2x/week)
  - Polish Android knowledge gaps (remaining time)
\`\`\`

**Week 9-10: Full Mock Interviews**
- Schedule 2 mock interviews per week with peers
- Practice the full Google interview loop:
  - Round 1: Coding (45 min)
  - Round 2: Coding (45 min)  
  - Round 3: Android deep dive (45 min)
  - Round 4: System design (45 min)
  - Round 5: Googleyness & Leadership (45 min)

**Week 11: Targeted Weakness Training**
- Review mock interview feedback
- Identify top 3 weak areas
- Dedicate extra time to those areas
- Re-do previously failed problems

**Week 12: Final Preparation**
- Light practice only — avoid burnout
- Review STAR stories (speak aloud)
- Review core DSA patterns (recognition, not solving)
- Review Android architecture cheat sheet
- Rest well, exercise, eat well

**Pre-interview checklist:**
\`\`\`
□ Can solve most medium problems in 20-25 min
□ Can identify DSA patterns within 3 min
□ Can lead a system design discussion for 45 min
□ Have 8 behavioral stories ready (can tell each in 2 min)
□ Can explain Android internals at framework level
□ Can discuss architecture trade-offs confidently
□ Slept 8 hours the night before
□ Know the interview schedule and format
\`\`\``,
      codeExample: `// Final week: Quick reference cheat sheet

/*
DSA PATTERN QUICK REFERENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Subarray/substring with condition" → Sliding Window
"Sorted array, find pair" → Two Pointers
"Shortest path, minimum steps" → BFS
"All combinations/permutations" → Backtracking
"Optimal (min/max) + choices" → DP
"Sorted, find target" → Binary Search
"Next greater/smaller" → Monotonic Stack
"Connected components" → Union-Find / BFS
"Top-K elements" → Min-heap of size K
"Stream + running median" → Two heaps (max+min)

ANDROID DEEP-DIVE CHEAT SHEET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lifecycle: onCreate→onStart→onResume→onPause→onStop→onDestroy
Process death: Only SavedStateHandle/Bundle/Room survives
Coroutines: CPS transformation, state machine, Continuation
Flow: Cold (per-collector) vs Hot (shared, always active)
MVVM: View ← observes ← ViewModel ← Repository ← DataSource
Hilt: @HiltAndroidApp → @AndroidEntryPoint → @HiltViewModel → @Inject
Compose: Recomposition skipping via @Stable/@Immutable
Performance: 16.6ms frame budget, Baseline Profiles, R8

SYSTEM DESIGN TEMPLATE:
━━━━━━━━━━━━━━━━━━━━━━
1. Requirements (functional + non-functional)
2. High-level architecture (draw boxes)
3. Data model (Room entities)
4. API contracts (REST endpoints)
5. Sync strategy (offline-first, delta sync)
6. Trade-offs (always discuss 2+ options)
7. Failure modes (network, process death, conflicts)

BEHAVIORAL STAR TEMPLATE:
━━━━━━━━━━━━━━━━━━━━━━━
S: 1-2 sentences of context
T: What was YOUR responsibility
A: 3-5 specific actions YOU took
R: Quantifiable result + lesson learned
Keep under 2 minutes when speaking
*/`,
      exercise: `**Final 30-Day Practice Plan:**

**Week 9 (Days 61-67): Full Simulation**
- 2 full mock interviews with peers
- Solve 10 random medium/hard timed problems
- System design: Design Google Maps routing
- Behavioral: Practice 4 stories with timer

**Week 10 (Days 68-74): Intensify**
- 2 more full mock interviews
- Solve 10 more problems (focus on weak patterns)
- System design: Design YouTube video feed
- Behavioral: Practice remaining 4 stories

**Week 11 (Days 75-81): Targeted Training**
- Analyze all mock feedback — what patterns do you miss?
- Spend 60% of time on identified weak areas
- Re-solve 10 previously failed problems
- 1 final full mock interview

**Week 12 (Days 82-90): Taper & Rest**
- Light practice: 1 problem per day (stay sharp, not exhausting)
- Review pattern cheat sheet daily (5 min)
- Review STAR stories (speak aloud, 10 min)
- Focus on sleep, exercise, nutrition
- Day 89: Last light review
- Day 90: Interview day — you're ready!`,
      commonMistakes: [
        "Cramming the night before — this is a marathon, not a sprint. Rest is critical for performance.",
        "Not doing mock interviews — self-practice doesn't replicate the pressure of a real interview",
        "Ignoring behavioral prep in the final month — G&L is 20% of the hiring decision at senior level",
        "Not tracking and targeting weak areas — generic practice in Month 3 is inefficient",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What should your mindset be on the day of the Google interview?",
          a: "**Key mindset shifts:** (1) **It's a collaboration, not a test** — think of the interviewer as a colleague you're solving a problem with. (2) **Think aloud** — silence is your enemy. Share your thought process, even if unsure. (3) **It's okay to be stuck** — ask clarifying questions, discuss what you're considering. Interviewers are trained to help. (4) **Start simple** — brute force is fine as a starting point. Optimize after. (5) **Handle mistakes gracefully** — if you spot an error, say 'I see a bug here, let me fix it.' This is a positive signal. (6) **Ask questions at the end** — shows genuine interest. Ask about team, tech stack, challenges."
        },
      ],
    },
  ],
};

export default androidPhase11;
