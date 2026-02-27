const androidPhase1 = {
  id: "phase-1",
  title: "Phase 1: Interview Structure at Google",
  emoji: "🎯",
  description: "Understand the Google Senior Android interview process — rounds, evaluation criteria, and what separates senior from mid-level candidates.",
  topics: [
    {
      id: "google-interview-rounds",
      title: "Google Interview Rounds & Process",
      explanation: `**Google's Senior Android interview** typically consists of 5–6 rounds conducted over a full day (virtual or on-site). Understanding each round's purpose is critical for targeted preparation.

**The typical pipeline:**
1. **Recruiter Screen** — Non-technical, discuss background, team fit, timeline
2. **Technical Phone Screen** (45 min) — Coding problem on Google Docs or a shared editor. Evaluate problem-solving, clean code, communication
3. **On-site / Virtual Loop** (4–5 rounds):
   - **2× Coding Rounds** (45 min each) — Medium-to-hard LeetCode-style problems in Kotlin/Java
   - **1× System Design** (45 min) — Design a large-scale mobile system (e.g., offline-first messaging app)
   - **1× Android Deep Dive** (45 min) — Architecture decisions, lifecycle edge cases, performance optimization
   - **1× Behavioral / Leadership** (45 min) — Googleyness & Leadership (G&L)
4. **Hiring Committee Review** — Your packet is reviewed by a committee that includes engineers who didn't interview you
5. **Team Matching** — After HC approval, you match with a team
6. **Offer Review** — Final compensation review

**Key insight:** Google uses a **hiring committee model** — your interviewers write detailed feedback, but the committee makes the decision. This means you need consistently strong signals across ALL rounds, not just one standout round.

**Senior-level bar:**
- You're expected to **drive the conversation**, not wait for hints
- System design must show **architectural maturity** — trade-offs, scalability, failure modes
- Coding solutions should be **optimal from the start** or you should articulate the path to optimization clearly
- Behavioral answers must demonstrate **leadership without authority**, mentoring, and cross-team impact`,
      codeExample: `// Google interviews use Kotlin or Java for Android roles
// Here's the kind of clean, production-grade code they expect

// Example: Efficient LRU Cache (commonly asked)
class LRUCache<K, V>(private val capacity: Int) {
    // LinkedHashMap with accessOrder = true gives us LRU behavior
    private val cache = object : LinkedHashMap<K, V>(capacity, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<K, V>?): Boolean {
            return size > capacity
        }
    }

    fun get(key: K): V? = cache[key]

    fun put(key: K, value: V) {
        cache[key] = value
    }

    fun snapshot(): Map<K, V> = LinkedHashMap(cache)
}

// Usage
fun main() {
    val cache = LRUCache<String, Int>(3)
    cache.put("a", 1)
    cache.put("b", 2)
    cache.put("c", 3)
    cache.get("a")      // Access "a" → moves to most recent
    cache.put("d", 4)   // Evicts "b" (least recently used)
    println(cache.snapshot()) // {c=3, a=1, d=4}
}

// What Google looks for in your code:
// 1. Clean, readable structure
// 2. Proper use of Kotlin idioms (not Java translated to Kotlin)
// 3. Thread-safety considerations discussed
// 4. Complexity analysis: O(1) get/put with LinkedHashMap`,
      exercise: `**Preparation Exercises:**
1. Research Google's "Googleyness & Leadership" — what specific traits does Google value?
2. List the 4 rating categories Google interviewers use (Strong No Hire → Strong Hire)
3. Write down 3 system design problems specific to mobile/Android
4. Practice explaining your most complex project in exactly 3 minutes
5. Research the difference between L5 (Senior) and L6 (Staff) expectations at Google
6. Identify 3 open-source Google Android projects and study their architecture
7. List 5 Android-specific technical areas Google might deep-dive on
8. Practice writing code on a Google Doc (no autocomplete, no syntax highlighting)
9. Research Google's packet review process — what makes a strong packet?
10. Write your "tell me about yourself" answer targeting a Senior Android role`,
      commonMistakes: [
        "Focusing only on coding and ignoring system design — at senior level, system design carries equal or more weight",
        "Not practicing on Google Docs or plain text editors — the lack of autocomplete and formatting is jarring if unprepared",
        "Treating the behavioral round as easy — Googleyness & Leadership is a full round with veto power",
        "Assuming Android-specific knowledge alone is enough — Google expects strong general CS fundamentals",
        "Not communicating your thought process — Google values HOW you think, not just the final answer",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What makes the Senior (L5) interview different from the mid-level (L4) interview at Google?",
          a: "At L5, Google expects: (1) **Proactive problem decomposition** — you break down the problem before coding, not after hints. (2) **System design mastery** — you drive the design discussion, propose trade-offs, and discuss failure modes. (3) **Leadership signals** — you demonstrate mentoring, cross-team influence, and ownership of ambiguous problems. (4) **Android architectural depth** — you can defend architecture decisions, discuss migration strategies, and reason about scalability. L4 candidates are evaluated on execution; L5 candidates on judgment and influence.",
        },
        {
          type: "scenario",
          q: "Your interviewer asks you to design an offline-first note-taking app. How do you approach the first 5 minutes?",
          a: "**Don't jump to implementation.** First 5 minutes: (1) Clarify requirements — single user or collaborative? Rich text or plain? Maximum note size? Sync frequency? (2) Define scope — what's in v1 vs future? (3) Identify key challenges — conflict resolution, sync strategy, storage limits. (4) Propose high-level architecture — local Room DB, sync engine, server API contract. (5) State your assumptions explicitly. This shows senior-level thinking: requirements before solutions, trade-offs before optimization.",
        },
        {
          type: "conceptual",
          q: "How does the Google Hiring Committee (HC) process work?",
          a: "After on-site interviews, each interviewer writes independent, detailed feedback with a hiring recommendation (Strong No Hire, No Hire, Lean Hire, Hire, Strong Hire). These form your 'packet' which is reviewed by a Hiring Committee of senior engineers who were NOT your interviewers. The HC looks for: (1) Consistent positive signals across all rounds. (2) No unresolved red flags. (3) Evidence of the target level (L5 for Senior). If the HC approves, you move to team matching. If borderline, they may request additional interviews. The key insight: even one strong 'No Hire' with specific concerns can significantly impact the decision.",
        },
        {
          type: "conceptual",
          q: "What is 'Googleyness' and how do you demonstrate it?",
          a: "Googleyness is Google's cultural assessment covering: (1) **Doing the right thing** — ethical reasoning, user-first mindset. (2) **Thriving in ambiguity** — comfortable with unclear requirements, can make progress without perfect information. (3) **Valuing feedback** — give and receive constructive feedback, not defensive. (4) **Collaborative** — 'we' over 'I', credit to the team. (5) **Pushing back respectfully** — disagree with data, not ego. Demonstrate through STAR stories that show these traits organically, not by claiming them directly.",
        },
      ],
    },
    {
      id: "coding-round-expectations",
      title: "Coding Round Expectations (Senior Level)",
      explanation: `**Google's coding rounds** at the senior level test not just your ability to solve problems, but your **engineering maturity**. You're expected to write production-quality code, discuss trade-offs, and optimize proactively.

**What interviewers evaluate:**
1. **Problem Decomposition** — Can you break a complex problem into smaller, manageable parts?
2. **Algorithm Selection** — Do you choose the right data structure/algorithm and explain WHY?
3. **Code Quality** — Clean, readable, idiomatic Kotlin. No spaghetti code.
4. **Edge Cases** — Do you identify and handle them without being prompted?
5. **Complexity Analysis** — Time and space analysis BEFORE and AFTER optimization.
6. **Communication** — Do you think aloud, ask clarifying questions, and explain trade-offs?

**Senior-level expectations vs mid-level:**
- **Mid-level:** Solve the problem correctly with some hints
- **Senior:** Solve optimally, drive the conversation, identify edge cases unprompted, discuss alternative approaches and their trade-offs

**Problem difficulty:** Typically LeetCode Medium to Hard. Common categories:
- Arrays/Strings — Two pointers, sliding window, prefix sums
- Trees/Graphs — BFS/DFS, topological sort, shortest path
- Dynamic Programming — State transitions, optimization
- Hash Maps — Frequency counting, caching patterns
- System-oriented — Design an iterator, implement a data structure

**The coding workflow Google expects:**
\`\`\`
1. Clarify requirements (2 min)
2. Discuss approach & complexity (3 min)
3. Code the solution (20 min)
4. Test with examples (5 min)
5. Optimize if needed (10 min)
6. Discuss edge cases (5 min)
\`\`\`

**Critical tip:** Google interviewers write detailed feedback. They note whether you needed hints, how many, and at what stage. Senior candidates should need zero to one hints maximum.`,
      codeExample: `// Example: Google-style coding problem
// "Find the length of the longest substring without repeating characters"
// This is a classic sliding window problem

// Approach 1: Brute force — O(n³) ❌ Not acceptable at senior level
fun lengthOfLongestSubstringBrute(s: String): Int {
    var maxLen = 0
    for (i in s.indices) {
        for (j in i until s.length) {
            val sub = s.substring(i, j + 1)
            if (sub.toSet().size == sub.length) {
                maxLen = maxOf(maxLen, sub.length)
            }
        }
    }
    return maxLen
}

// Approach 2: Sliding window with HashSet — O(n) ✅ Expected at senior level
fun lengthOfLongestSubstring(s: String): Int {
    val charIndex = mutableMapOf<Char, Int>()
    var maxLen = 0
    var left = 0

    for (right in s.indices) {
        val c = s[right]
        // If char was seen and is within current window, shrink window
        if (c in charIndex && charIndex[c]!! >= left) {
            left = charIndex[c]!! + 1
        }
        charIndex[c] = right
        maxLen = maxOf(maxLen, right - left + 1)
    }
    return maxLen
}

// How a senior candidate walks through this:
// 1. "I'll use a sliding window with a map tracking last seen index of each char"
// 2. "Time: O(n) — single pass. Space: O(min(n, charset)) — map of unique chars"
// 3. "Edge cases: empty string, all same chars, all unique chars"
// 4. Tests:
//    "abcabcbb" → 3 ("abc")
//    "bbbbb" → 1 ("b")
//    "pwwkew" → 3 ("wke")
//    "" → 0

// Google expects Kotlin idioms, not Java-style Kotlin:
// ✅ val, data classes, extension functions, scope functions
// ❌ var everywhere, manual null checks, verbose Java patterns`,
      exercise: `**Practice Problems (Google Frequency):**
1. Two Sum — HashMap approach, O(n)
2. Merge Intervals — Sorting + greedy
3. LRU Cache — LinkedHashMap or manual doubly-linked list + map
4. Word Break — DP with Trie optimization
5. Serialize/Deserialize Binary Tree — BFS or preorder
6. Minimum Window Substring — Sliding window
7. Course Schedule — Topological sort
8. Median of Two Sorted Arrays — Binary search, O(log(m+n))
9. Trapping Rain Water — Two pointer or stack
10. Design Hit Counter — Queue or circular buffer

**Meta Practice:**
- Solve each problem first, then re-solve it while narrating your thought process aloud
- Time yourself: 35 minutes maximum per problem
- Write on a plain text editor, no autocomplete
- After solving, write out the complexity analysis
- Identify at least 3 edge cases per problem`,
      commonMistakes: [
        "Jumping into code without discussing the approach — Google explicitly evaluates your problem decomposition skills",
        "Writing Java-style code in Kotlin — using 'var' everywhere, manual null checks instead of safe calls, not using extension functions",
        "Not testing your code — walk through at least 2 examples and 1 edge case after writing",
        "Over-engineering — using complex patterns when a simple approach works. Start simple, optimize if needed",
        "Staying silent while coding — Google wants to hear your reasoning, even when you're stuck",
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Given an array of integers and a target, find all unique quadruplets that sum to the target. (4Sum)",
          a: "```kotlin\nfun fourSum(nums: IntArray, target: Long): List<List<Int>> {\n    nums.sort()\n    val result = mutableListOf<List<Int>>()\n    for (i in 0 until nums.size - 3) {\n        if (i > 0 && nums[i] == nums[i - 1]) continue\n        for (j in i + 1 until nums.size - 2) {\n            if (j > i + 1 && nums[j] == nums[j - 1]) continue\n            var lo = j + 1\n            var hi = nums.size - 1\n            while (lo < hi) {\n                val sum = nums[i].toLong() + nums[j] + nums[lo] + nums[hi]\n                when {\n                    sum == target -> {\n                        result.add(listOf(nums[i], nums[j], nums[lo], nums[hi]))\n                        while (lo < hi && nums[lo] == nums[lo + 1]) lo++\n                        while (lo < hi && nums[hi] == nums[hi - 1]) hi--\n                        lo++; hi--\n                    }\n                    sum < target -> lo++\n                    else -> hi--\n                }\n            }\n        }\n    }\n    return result\n}\n// O(n³) time, O(1) space (excluding output)\n```",
        },
        {
          type: "coding",
          q: "Design an iterator that flattens a nested list of integers. Each element is either an integer or a list.",
          a: "```kotlin\nclass NestedIterator(nestedList: List<Any>) : Iterator<Int> {\n    private val stack = ArrayDeque<Iterator<Any>>()\n    private var nextVal: Int? = null\n\n    init { stack.addLast(nestedList.iterator()) }\n\n    override fun hasNext(): Boolean {\n        while (nextVal == null && stack.isNotEmpty()) {\n            val current = stack.last()\n            if (!current.hasNext()) {\n                stack.removeLast()\n                continue\n            }\n            when (val element = current.next()) {\n                is Int -> nextVal = element\n                is List<*> -> stack.addLast((element as List<Any>).iterator())\n            }\n        }\n        return nextVal != null\n    }\n\n    override fun next(): Int {\n        if (!hasNext()) throw NoSuchElementException()\n        return nextVal!!.also { nextVal = null }\n    }\n}\n// Lazy evaluation — only processes elements when needed\n// O(1) amortized for next(), O(d) space where d = max nesting depth\n```",
        },
        {
          type: "tricky",
          q: "What's the difference between solving a problem correctly vs solving it at a senior level?",
          a: "At a senior level: (1) You discuss 2-3 approaches BEFORE coding and explain trade-offs. (2) You proactively identify edge cases (empty input, overflow, duplicates). (3) Your code is clean and idiomatic — proper naming, no redundant variables, uses language features well. (4) You state time/space complexity without being asked. (5) You test your code systematically. (6) You can discuss how the solution changes if constraints change (e.g., 'if the array doesn't fit in memory'). A correct brute force with no discussion is an L3/L4 answer.",
        },
      ],
    },
    {
      id: "system-design-expectations",
      title: "System Design Expectations (Senior Level)",
      explanation: `**System design at Google's senior level** is one of the most critical rounds. For Android roles, this focuses on **mobile-first system design** — not just backend architecture.

**What Google evaluates:**
1. **Requirements Gathering** — Do you ask the right clarifying questions?
2. **High-Level Architecture** — Can you diagram the major components and their interactions?
3. **API Design** — RESTful contracts, data models, request/response schemas
4. **Data Layer** — Local storage, caching strategies, sync mechanisms
5. **Scalability** — How does the system handle millions of users?
6. **Offline Support** — A uniquely mobile concern that backend-focused candidates miss
7. **Trade-offs** — Every decision has pros and cons. Can you articulate them?
8. **Failure Handling** — Network errors, partial sync, conflict resolution

**Common mobile system design questions at Google:**
- Design Google Photos for Android
- Design Gmail's offline mode
- Design a real-time chat application
- Design a news feed with infinite scroll
- Design Google Maps navigation for Android
- Design an offline-first document editor

**The framework for mobile system design:**
\`\`\`
1. Requirements & Constraints (5 min)
   - Functional: What does the app DO?
   - Non-functional: Scale, latency, offline, battery
   - Out of scope: What to exclude

2. High-Level Architecture (10 min)
   - UI Layer → ViewModel → Repository → Data Sources
   - Network layer, local database, sync engine
   - Diagram the data flow

3. Deep Dive (20 min)
   - Pick 2-3 critical components to design in detail
   - Data models, API contracts, sync strategies
   - Caching, pagination, error handling

4. Trade-offs & Scalability (10 min)
   - Alternative approaches considered
   - How to handle 10x growth
   - Failure scenarios and recovery
\`\`\`

**Senior-level signal:** You should be able to discuss how the mobile client interacts with the backend, even if you're designing the Android side. Understanding the full stack — not just the Android layer — is what separates L5 from L4.`,
      codeExample: `// System Design: Offline-First Sync Architecture (High-Level Code)
// This is the kind of architectural code Google expects you to sketch

// 1. Data Model with sync metadata
data class Note(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val content: String,
    val updatedAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.PENDING,
    val version: Int = 1
)

enum class SyncStatus { SYNCED, PENDING, CONFLICT }

// 2. Repository Pattern — Single source of truth
class NoteRepository(
    private val localDb: NoteDao,
    private val remoteApi: NoteApi,
    private val syncEngine: SyncEngine
) {
    // Local-first: always read from local DB
    fun getNotes(): Flow<List<Note>> = localDb.getAllNotes()

    // Write locally first, then sync
    suspend fun saveNote(note: Note) {
        val updated = note.copy(
            syncStatus = SyncStatus.PENDING,
            updatedAt = System.currentTimeMillis(),
            version = note.version + 1
        )
        localDb.upsert(updated)
        syncEngine.schedulePush(updated.id)
    }

    // Sync engine handles push/pull
    suspend fun sync() {
        syncEngine.pushPendingChanges(localDb, remoteApi)
        syncEngine.pullRemoteChanges(localDb, remoteApi)
    }
}

// 3. Sync Engine — Conflict resolution strategy
class SyncEngine {
    suspend fun pushPendingChanges(local: NoteDao, remote: NoteApi) {
        val pending = local.getNotesByStatus(SyncStatus.PENDING)
        for (note in pending) {
            try {
                val serverNote = remote.pushNote(note)
                local.upsert(note.copy(
                    syncStatus = SyncStatus.SYNCED,
                    version = serverNote.version
                ))
            } catch (e: ConflictException) {
                // Last-write-wins or manual conflict resolution
                local.upsert(note.copy(syncStatus = SyncStatus.CONFLICT))
            }
        }
    }

    suspend fun pullRemoteChanges(local: NoteDao, remote: NoteApi) {
        val lastSync = local.getLastSyncTimestamp()
        val remoteChanges = remote.getChangesSince(lastSync)
        for (change in remoteChanges) {
            val localNote = local.getById(change.id)
            if (localNote == null || localNote.syncStatus == SyncStatus.SYNCED) {
                local.upsert(change.copy(syncStatus = SyncStatus.SYNCED))
            }
            // If local has pending changes, mark as conflict
        }
    }

    fun schedulePush(noteId: String) {
        // Use WorkManager for reliable background sync
        // Exponential backoff, network constraint
    }
}`,
      exercise: `**System Design Practice:**
1. Design Google Photos for Android — focus on image loading, caching, and sync
2. Design an offline-capable email client — consider draft saving, send queue, search
3. Design a real-time collaborative document editor (like Google Docs)
4. Design a ride-sharing app's driver tracking system
5. Design Instagram's feed — infinite scroll, caching, prefetching
6. Design a notification system for a social media app
7. For each design, create:
   - Component diagram showing data flow
   - API contract for 3 key endpoints
   - Local database schema (Room entities)
   - Sync strategy with conflict resolution
   - Failure handling for 3 common failure modes
8. Practice whiteboarding each design in 35 minutes
9. Prepare to answer: "How would this change if we needed to support 100M users?"
10. Prepare to answer: "What would you change if the user has poor/intermittent connectivity?"`,
      commonMistakes: [
        "Designing only the backend and ignoring the Android client architecture — for Android roles, the mobile side is the focus",
        "Not discussing offline support — this is the #1 differentiator for mobile system design",
        "Jumping into low-level details without establishing high-level architecture first",
        "Ignoring data consistency — what happens when the user edits offline and syncs later?",
        "Not quantifying scale — 'a lot of users' is not a number. State assumptions: '10M DAU, 50 req/sec per user'",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design Google Maps navigation for Android. Walk me through your approach.",
          a: "**Requirements:** Real-time location tracking, turn-by-turn directions, offline maps, ETA updates, rerouting. **Architecture:** (1) LocationManager with fused location provider for GPS. (2) MapRenderer using tiled map loading with LRU cache. (3) RoutingEngine that pre-fetches route segments. (4) NavigationState machine (idle → navigating → rerouting → arrived). (5) Offline: pre-download map tiles and route geometry for saved routes. **Key decisions:** Tile size (256x256 vs vector), location update frequency (GPS drain vs accuracy), route pre-computation depth. **Failure handling:** GPS signal loss → dead reckoning with accelerometer; network loss → cached route with degraded ETA.",
        },
        {
          type: "scenario",
          q: "How would you design the sync mechanism for Google Keep?",
          a: "**Strategy: Operational Transform with local-first writes.** (1) Every change creates an Operation (insert, delete, update) with a timestamp and device ID. (2) Local DB (Room) is the source of truth — UI always reads from local. (3) Operations are queued and pushed to server via WorkManager when online. (4) Server assigns a global ordering and broadcasts to other devices. (5) Conflict resolution: for text, use OT or CRDT. For whole-note conflicts, last-write-wins with optional manual resolution. (6) Delta sync — only send changes since last sync token. (7) Compaction — merge old operations to reduce storage. **Trade-off:** CRDTs are more complex but avoid conflicts entirely; OT is simpler but needs a central server for ordering.",
        },
        {
          type: "conceptual",
          q: "What's the most common mistake engineers make in mobile system design interviews?",
          a: "Treating it like a backend system design interview. Mobile has unique constraints: (1) **Intermittent connectivity** — offline-first is essential. (2) **Battery** — background sync must be efficient (WorkManager, not always-on connections). (3) **Memory** — can't cache everything, need eviction strategies. (4) **App lifecycle** — the OS can kill your app at any time, state must be persisted. (5) **Device diversity** — different screen sizes, OS versions, hardware capabilities. A strong answer addresses these mobile-specific concerns proactively.",
        },
      ],
    },
    {
      id: "behavioral-leadership-expectations",
      title: "Behavioral & Leadership Expectations",
      explanation: `**Googleyness & Leadership (G&L)** is a dedicated interview round at Google. At the Senior (L5) level, this round has **full veto power** — a strong "No Hire" here can override positive coding signals.

**What Google evaluates in G&L:**
1. **Leadership without authority** — Influencing outcomes without being the manager
2. **Navigating ambiguity** — Making progress when requirements are unclear
3. **Collaboration** — Working across teams, resolving conflicts constructively
4. **Mentorship** — Growing other engineers, sharing knowledge
5. **Ownership** — Taking responsibility for outcomes, not just tasks
6. **Humility** — Acknowledging mistakes, learning from failures, giving credit

**The STAR Framework (Google-optimized):**
\`\`\`
S — Situation: Brief context (1-2 sentences)
T — Task: What was YOUR responsibility? (not the team's)
A — Action: What SPECIFICALLY did you do? (the bulk of your answer)
R — Result: Quantified impact (metrics, timelines, outcomes)
\`\`\`

**Senior-level G&L vs mid-level:**
- **Mid-level:** "I fixed the bug and shipped the feature"
- **Senior:** "I identified a systemic issue across 3 teams, proposed an architectural solution, built consensus with skeptical stakeholders, implemented the fix with a phased rollout, and reduced incidents by 60% over 2 quarters"

**Topics to prepare stories for:**
- A time you led a project through technical uncertainty
- A time you disagreed with a senior engineer and how you resolved it
- A time you mentored someone and they grew significantly
- A time you made a mistake and how you recovered
- A time you simplified a complex system
- A time you had to make a decision with incomplete information

**Red flags Google watches for:**
- ❌ Taking sole credit for team accomplishments
- ❌ Blaming others for failures
- ❌ Being unable to give a specific example (vague, hypothetical answers)
- ❌ Not showing growth or learning
- ❌ Demonstrating ego over collaboration`,
      codeExample: `// While behavioral is non-technical, here's how to structure
// your STAR stories — think of it as "code" for your answers

/*
 * EXAMPLE STAR STORY: Leading a Migration
 * 
 * SITUATION (2 sentences max):
 * "Our Android app had accumulated 200K lines of Java code over 5 years.
 *  Build times exceeded 8 minutes, and developer productivity was declining."
 * 
 * TASK (what was YOUR role?):
 * "As the senior Android developer, I took ownership of proposing and
 *  leading a phased migration to Kotlin with modularization."
 * 
 * ACTION (the bulk — specific steps YOU took):
 * "First, I wrote an RFC documenting the migration strategy with 3 phases:
 *  Phase 1: New code in Kotlin only (enforced via lint rules)
 *  Phase 2: Modularize the app into 12 feature modules
 *  Phase 3: Convert critical-path Java files to Kotlin
 * 
 *  I presented the RFC to our architecture review board, addressing
 *  concerns about interop risks and testing overhead.
 * 
 *  I created a Kotlin style guide, ran 4 workshops for the team of 8,
 *  and set up automated Kotlin coverage tracking in CI.
 * 
 *  When we hit an interop issue with our DI framework, I paired with
 *  the platform team to create a migration bridge."
 * 
 * RESULT (quantified impact):
 * "Over 6 months: 45% of code was Kotlin, build times dropped from
 *  8 min to 4.5 min, crash rate decreased 25% (Kotlin null safety),
 *  and developer satisfaction scores improved from 3.2 to 4.1/5.
 *  The approach was adopted by 2 other Android teams in the org."
 */

// Key principles:
// 1. YOUR actions, not the team's (use "I", not "we")
// 2. Specific technical details that show depth
// 3. Quantified results — numbers, percentages, timelines
// 4. Show cross-team influence (senior signal)
// 5. Show learning or growth from the experience`,
      exercise: `**Behavioral Preparation Exercises:**
1. Prepare 8 STAR stories covering different competencies:
   - Technical leadership
   - Conflict resolution
   - Mentoring
   - Failure & recovery
   - Ambiguity navigation
   - Cross-team collaboration
   - Difficult trade-off decision
   - Impact at scale

2. For each story, practice:
   - Telling it in exactly 2 minutes
   - Identifying what Google competency it demonstrates
   - Having a follow-up question ready

3. Practice these "trap" questions:
   - "Tell me about a time you failed" (show learning, not blame)
   - "Tell me about a conflict with your manager" (show maturity)
   - "What's your biggest weakness?" (genuine, with mitigation)

4. Record yourself answering and review — check for:
   - Filler words ("um", "like", "basically")
   - Vague language ("sort of", "kind of", "basically")
   - "We" vs "I" ratio — should be mostly "I" at senior level

5. Get a friend to do a mock behavioral interview and give feedback`,
      commonMistakes: [
        "Using 'we' instead of 'I' — Google is evaluating YOUR contribution, not the team's",
        "Giving hypothetical answers ('I would do X') instead of real examples ('I did X')",
        "Not quantifying results — 'it went well' vs 'crash rate decreased 40%'",
        "Preparing too few stories — you need 6-8 diverse stories covering different competencies",
        "Not showing the failure/challenge — a story where everything went perfectly doesn't demonstrate problem-solving",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Tell me about a time you had to push back on a technical decision made by someone more senior.",
          a: "STAR framework: **Situation:** The principal engineer proposed migrating our REST APIs to GraphQL mid-sprint for a major release. **Task:** As the senior Android dev, I needed to evaluate the impact on the mobile team. **Action:** I analyzed the GraphQL migration impact: 3 weeks of client-side changes, new testing infrastructure, potential performance regression from over-fetching on mobile. I prepared a data-driven comparison document and scheduled a 1:1 with the principal. I proposed a phased approach: GraphQL for new features only, with a compatibility layer for existing endpoints. **Result:** The principal agreed to the phased approach. We shipped the release on time, and eventually migrated 60% of endpoints to GraphQL over 2 quarters with zero regressions.",
        },
        {
          type: "scenario",
          q: "Describe a situation where you mentored a junior developer through a challenging task.",
          a: "**Situation:** A junior developer was assigned to implement our app's offline caching strategy and was struggling with Room database design. **Task:** I volunteered to be their mentor for this project. **Action:** Instead of giving solutions, I: (1) Introduced them to the Repository pattern with a whiteboard session. (2) Paired-programmed the first DAO implementation. (3) Set up daily 15-min check-ins for the first week, then bi-weekly. (4) Reviewed their PRs with teaching comments explaining the 'why'. (5) Let them present the final design to the team. **Result:** They completed the feature in 3 weeks (estimated 4), the implementation was adopted as our standard caching pattern, and they were promoted to mid-level 6 months later.",
        },
        {
          type: "scenario",
          q: "Tell me about a time you made a wrong technical decision. How did you handle it?",
          a: "**Situation:** I chose to use a custom reactive framework instead of the then-emerging Kotlin Coroutines for our data layer. **Task:** After 3 months, we had increasing bugs from our custom implementation and difficulty onboarding new developers. **Action:** I (1) Acknowledged the mistake publicly in our team retro with specific data: 15 bugs from our custom solution, 2x onboarding time. (2) Wrote a migration plan to Kotlin Coroutines + Flow. (3) Took personal ownership of the migration, not delegating the 'cleanup'. (4) Created a decision framework for future architectural choices: must have community support, clear migration path, and at least 2 team members familiar with it. **Result:** Migration completed in 6 weeks, reduced data-layer bugs by 70%, and our architectural decision framework was adopted org-wide.",
        },
      ],
    },
  ],
};

export default androidPhase1;
