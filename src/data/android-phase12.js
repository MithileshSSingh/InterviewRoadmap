const androidPhase12 = {
  id: "phase-12",
  title: "Phase 12: Interview Simulation Mode",
  emoji: "🎯",
  description:
    "Full interview round simulations — coding, system design, Android deep dive, and behavioral practice with evaluation rubrics.",
  topics: [
    {
      id: "coding-round-simulation",
      title: "Coding Round Simulations",
      explanation: `**Coding round simulation** — practice exactly like the real interview. Use a plain text editor, set a 45-minute timer, and solve 2 problems.

**Google coding interview format:**
- 45 minutes, 2 problems (sometimes 1 hard problem)
- Typically: 1 medium + 1 medium, or 1 medium + 1 hard
- Language: Kotlin preferred for Android candidates
- Environment: Google Docs or simple code editor (no autocomplete!)

**Evaluation rubric (how Google scores):**
\`\`\`
1. Problem Solving (40%):
   - Correctly identifies the approach
   - Handles edge cases
   - Optimizes when prompted
   
2. Coding (30%):
   - Clean, readable code
   - Proper variable names
   - Idiomatic Kotlin/language usage
   
3. Communication (20%):
   - Explains thought process
   - Responds well to hints
   - Discusses trade-offs
   
4. Verification (10%):
   - Tests with examples
   - Identifies edge cases
   - Catches bugs before prompted
\`\`\`

**Simulated practice rounds:**

**Round 1 (Medium + Medium):**
- Problem A: Given a list of transactions with amounts and categories, find the top K categories by total spending
- Problem B: Given a binary tree, find all paths that sum to a target value

**Round 2 (Medium + Hard):**
- Problem A: Implement a class that schedules delayed tasks with cancellation support
- Problem B: Given a grid of characters and a dictionary, find all words that can be formed by adjacent cells`,
      codeExample: `// SIMULATION: Round 1, Problem A
// "Find top K categories by total spending"
// Input: transactions = [("food", 50), ("transport", 30), ("food", 20), 
//        ("entertainment", 100), ("transport", 40)], K = 2
// Output: ["entertainment", "transport"]

// Step 1: Think aloud — "I need to group by category, sum amounts,
// then find top K. I'll use a HashMap + heap."

// Step 2: State complexity — O(n + m log k) where n=transactions, m=categories

// Step 3: Code
fun topKCategories(transactions: List<Pair<String, Int>>, k: Int): List<String> {
    // Group by category and sum
    val categoryTotals = transactions
        .groupBy { it.first }
        .mapValues { (_, txns) -> txns.sumOf { it.second } }
    
    // Use min-heap of size k for top-K
    val minHeap = PriorityQueue<Pair<String, Int>>(compareBy { it.second })
    for ((category, total) in categoryTotals) {
        minHeap.offer(category to total)
        if (minHeap.size > k) minHeap.poll()
    }
    
    // Extract results in descending order
    return minHeap.sortedByDescending { it.second }.map { it.first }
}

// Step 4: Test
// transactions = [("food",50), ("transport",30), ("food",20), 
//                 ("entertainment",100), ("transport",40)]
// categoryTotals = {food:70, transport:70, entertainment:100}
// After heap with k=2: [transport:70, entertainment:100]
// Result: ["entertainment", "transport"] ✓

// Step 5: Edge cases
// - Empty list → return empty
// - K > number of categories → return all categories
// - Tie in amounts → either is acceptable

// SIMULATION: Round 1, Problem B
// "Find all paths in binary tree that sum to target"
fun pathSum(root: TreeNode?, target: Int): List<List<Int>> {
    val result = mutableListOf<List<Int>>()
    
    fun dfs(node: TreeNode?, remaining: Int, path: MutableList<Int>) {
        if (node == null) return
        path.add(node.value)
        if (node.left == null && node.right == null && remaining == node.value) {
            result.add(path.toList())
        }
        dfs(node.left, remaining - node.value, path)
        dfs(node.right, remaining - node.value, path)
        path.removeAt(path.lastIndex) // Backtrack
    }
    
    dfs(root, target, mutableListOf())
    return result
}
// Time: O(n), Space: O(h) where h = tree height`,
      exercise: `**Timed Simulation Rounds (do these with a timer!):**

**Simulation 1 (45 min):**
A. Merge two sorted arrays in-place (the first array has enough space)
B. Find the longest palindromic substring in a string

**Simulation 2 (45 min):**
A. Group anagrams from a list of strings
B. Find the minimum window substring containing all characters of another string

**Simulation 3 (45 min):**
A. Implement a stack that supports push, pop, and getMin in O(1)
B. Serialize and deserialize a binary tree

**Simulation 4 (45 min):**
A. Find all unique combinations that sum to a target (each number used once)
B. Implement LRU Cache with O(1) get and put

**Self-evaluation after each simulation:**
□ Identified the pattern within 3 minutes
□ Discussed approach before coding
□ Code compiles and runs correctly
□ Handled at least 2 edge cases
□ Stayed within 45 minutes
□ Communicated clearly throughout`,
      commonMistakes: [
        "Using an IDE with autocomplete — Google interviews use simple editors without help",
        "Not timing yourself strictly — if you go over 45 min, it's a failed simulation",
        "Skipping the think-aloud step — in real interviews, silence is a negative signal",
        "Not testing your code — always walk through at least one example after coding",
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Given an array of meeting intervals [start, end], merge overlapping intervals.",
          a: "```kotlin\nfun mergeIntervals(intervals: Array<IntArray>): Array<IntArray> {\n    if (intervals.isEmpty()) return emptyArray()\n    val sorted = intervals.sortedBy { it[0] }\n    val result = mutableListOf(sorted[0].clone())\n    for (i in 1 until sorted.size) {\n        val last = result.last()\n        if (sorted[i][0] <= last[1]) {\n            last[1] = maxOf(last[1], sorted[i][1])\n        } else {\n            result.add(sorted[i].clone())\n        }\n    }\n    return result.toTypedArray()\n}\n// Time: O(n log n), Space: O(n)\n// Edge: single interval, no overlaps, all overlapping\n```",
        },
      ],
    },
    {
      id: "system-design-simulation",
      title: "System Design Round Simulations",
      explanation: `**System design simulation** — practice designing complete mobile systems in 45 minutes. Focus on Android-specific considerations.

**What Google evaluates in system design:**
\`\`\`
1. Requirements Gathering (15%):
   - Asks right clarifying questions
   - Defines scope appropriately
   - Identifies key constraints (offline, scale, latency)

2. High-Level Design (25%):
   - Clean architecture diagram
   - Appropriate component choices
   - Clear data flow

3. Detailed Design (30%):
   - Deep dive into key components
   - Data model design
   - API design
   - Algorithm choices

4. Trade-offs & Discussion (20%):
   - Discusses alternatives
   - Explains why choices were made
   - Addresses failure modes

5. Android-Specific (10%):
   - Process death handling
   - Battery/performance considerations
   - Lifecycle awareness
   - Offline support
\`\`\`

**5 practice scenarios:**

**Scenario 1: Design a Photo Gallery App (Google Photos)**
- Cloud sync, offline browsing, sharing
- Large image handling, thumbnails
- Search by person/object (ML)

**Scenario 2: Design a Ride-Sharing App (Uber)**
- Real-time driver tracking
- Ride matching algorithm
- ETA calculation
- Payment processing

**Scenario 3: Design an Offline-First Document Editor**
- Real-time collaboration
- Conflict resolution
- Auto-save and versioning

**Scenario 4: Design a Social Media Feed**
- Infinite scroll pagination
- Real-time updates
- Image/video handling
- Push notifications

**Scenario 5: Design a Chat Application (WhatsApp)**
- End-to-end encryption
- Message delivery states
- Media sharing
- Group chat`,
      codeExample: `// System Design Template: Photo Gallery with Cloud Sync

/*
STEP 1: REQUIREMENTS (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Functional:
  - Browse photos (grid view, full screen)
  - Take photos with camera
  - Auto-sync to cloud
  - Share photos/albums with others
  - Search by date, location, people
  - Offline browsing of previously viewed photos
Non-functional:
  - <100ms for local photo display
  - Auto-sync within 5 min on WiFi
  - Handle 10,000+ photos per user
  - Minimal battery impact from sync

STEP 2: HIGH-LEVEL ARCHITECTURE (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────┐
│  UI Layer (Compose)                   │
│  ├── PhotoGridScreen (LazyGrid)       │
│  ├── PhotoDetailScreen (Zoomable)     │
│  └── AlbumScreen                      │
│         ↕                             │
│  ViewModel + Paging 3                 │
│         ↕                             │
│  PhotoRepository                      │
│     ↕           ↕           ↕         │
│  Room DB     SyncEngine   ImageLoader │
│  (metadata)  (WorkManager) (Coil)     │
│     ↕           ↕                     │
│  File System  Backend API             │
│  (full/thumb)                         │
└────────────────────────────────────────┘

STEP 3: DATA MODEL (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━
Photo entity:
  - id (UUID)
  - localPath (String?)
  - remotePath (String?)
  - thumbnailPath (String?)
  - dateTaken (Long)
  - location (lat/lng?)
  - width, height (Int)
  - syncState (SYNCED | PENDING | UPLOADING | FAILED)
  - fileSize (Long)

STEP 4: KEY COMPONENTS DEEP DIVE (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Image Loading:
  - Coil with 3 layers: memory cache → disk cache → network
  - Generate thumbnails on capture (200x200)
  - Load full resolution only on detail view
  - Recycle bitmap memory when scrolling

Sync Engine:
  - WorkManager with UNMETERED + NOT_LOW_BATTERY constraints
  - Upload queue: new photos added to pending table
  - Upload process: compress → upload → update syncState
  - Delta sync: fetch new photos from server since lastSyncToken
  - Conflict: server version wins (photos are immutable after capture)

Pagination:
  - Room PagingSource for local photos (date descending)
  - RemoteMediator for cloud photos (lazy download)

STEP 5: TRADE-OFFS (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━
- Full vs compressed sync: upload original + generate cloud thumbnails
  vs upload compressed only → chose original for quality
- Sync immediately vs batched: batched saves battery, slight delay ok
- Room metadata vs file-based: Room for fast queries, files for images
*/`,
      exercise: `**System Design Practice (45 min timer for each):**

**Practice 1: Design Google Maps Navigation**
Requirements: Turn-by-turn navigation, real-time traffic,
offline maps, ETA updates, re-routing.
Focus on: Location tracking, map tile caching, real-time updates.

**Practice 2: Design YouTube Mobile**
Requirements: Video feed, autoplay, offline downloads,
picture-in-picture, recommendations.
Focus on: Video streaming, caching, bandwidth adaptation.

**Practice 3: Design a Banking App**
Requirements: Account overview, transfers, bill pay,
biometric auth, transaction history.
Focus on: Security, encryption, offline transactions.

**Self-evaluation rubric:**
□ Gathered requirements in < 5 min
□ Drew a clear architecture diagram
□ Defined data models
□ Discussed at least 2 trade-offs
□ Addressed offline support
□ Considered battery/performance
□ Stayed within 45 min`,
      commonMistakes: [
        "Spending too long on requirements — 5 minutes max, then move to design",
        "Not drawing a diagram — visual architecture is essential for communication",
        "Designing only the backend — Google wants to see your Android architecture expertise",
        "Not discussing trade-offs — the choice is less important than showing you considered alternatives",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design the Android architecture for a streaming music app like Spotify.",
          a: "**Requirements:** Stream music, offline playlists, background playback, queue management. **Architecture:** (1) **Playback:** MediaSessionService (foreground service) with ExoPlayer. Handles audio focus, hardware controls, notification. (2) **Offline:** Download tracks as encrypted files. Room DB for playlist/track metadata. WorkManager for download queue. (3) **Streaming:** ExoPlayer with adaptive bitrate (HLS/DASH). Cache recent tracks in LRU disk cache (200MB). (4) **Queue:** ViewModel manages play queue state. SavedStateHandle for queue persistence across process death. (5) **Sync:** Delta sync for playlists and library changes. FCM for push notifications (new releases). (6) **Background:** MediaSessionService keeps playback alive. Foreground notification with controls. Handle audio focus changes (pause for calls, duck for notifications). (7) **Key trade-off:** Cache size vs storage: 200MB allows ~50 cached songs, configurable by user.",
        },
      ],
    },
    {
      id: "android-deep-dive-simulation",
      title: "Android Deep Dive Round Simulation",
      explanation: `**The Android deep dive round** is unique to Android roles at Google. The interviewer tests your depth of knowledge on Android internals, architecture, and production experience.

**Format:**
- 45 minutes
- Starts with a broad question, then drills deeper
- Tests both theoretical knowledge and practical experience
- Expects you to draw from production experience

**Common deep dive flows:**

**Flow 1: Activity → Lifecycle → Process Death → State Restoration**
"Tell me about Activity lifecycle..."
→ "What happens during configuration change?"
→ "How does the system handle process death?"
→ "What data survives process death?"
→ "How would you handle a multi-step form across process death?"

**Flow 2: Coroutines → Dispatchers → Cancellation → Testing**
"How do coroutines work internally?"
→ "Explain the dispatcher system"
→ "How does structured concurrency handle cancellation?"
→ "How do you test coroutines?"
→ "What are common pitfalls?"

**Flow 3: Compose → Recomposition → Performance → State**
"How does Compose rendering work?"
→ "What triggers recomposition?"
→ "How do you optimize recomposition?"
→ "Explain remember and derivedStateOf"
→ "How do you handle side effects?"

**Flow 4: Architecture → Repository → Offline → Sync**
"Describe your app's architecture..."
→ "How does the data layer work?"
→ "How do you handle offline mode?"
→ "How do you sync data?"
→ "How do you handle conflicts?"

**Preparation tip:** For each topic, prepare to go 3-4 levels deep. If you can explain the WHY behind every design decision, you're ready.`,
      codeExample: `// Deep dive simulation: "Explain how Jetpack Compose rendering works"

/*
LEVEL 1: Basic understanding
━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Compose is a declarative UI framework. You describe WHAT the UI
should look like for a given state, and Compose handles the HOW.
When state changes, Compose re-executes (recomposes) only the 
composable functions that read that state."

LEVEL 2: Recomposition mechanics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"The Compose compiler plugin transforms @Composable functions 
to track which state they read. When state changes, Compose's 
snapshot system detects it and schedules recomposition. The 
Composer maintains a slot table — a flat array of data from the 
previous composition. During recomposition, it compares the new 
data with the slot table to determine what changed."

LEVEL 3: Optimization — skipping recomposition
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Compose can skip recomposition of a composable if ALL its 
parameters are 'stable' and haven't changed (equals() returns true).
The @Stable and @Immutable annotations tell the compiler that a type's
equals() is reliable. Primitive types and String are stable by default.
Unstable types (List, custom classes without @Stable) force recomposition
even if values haven't changed."

LEVEL 4: Performance debugging
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Use the Compose compiler metrics (-Pcompile.metrics=true) to 
see which composables are skippable, restartable, and which 
parameters are stable. Use Layout Inspector's recomposition
counter to see which composables recompose most. Common 
optimizations: (1) Use remember to cache expensive computations.
(2) Use derivedStateOf for computed values. (3) Defer state reads 
to the composition phase using Modifier.drawWithContent or 
snapshotFlow. (4) Use key() in LazyColumn for stable keys."
*/`,
      exercise: `**Deep Dive Practice Questions:**

**Lifecycle:**
1. Trace every callback when user rotates the screen
2. What happens to a Fragment when its hosting Activity is destroyed by the system?
3. How does ViewModel survive configuration change but not process death?

**Coroutines:**
4. Explain CPS transformation with a concrete example
5. What happens when you cancel a viewModelScope?
6. Difference between Dispatchers.IO and Dispatchers.Default — why both?

**Compose:**
7. What is the slot table and how does it work?
8. How does remember work internally?
9. Why does LazyColumn need stable keys?

**Architecture:**
10. Design an offline-first repository — what are 3 cache invalidation strategies?
11. How do you handle process death in a multi-step checkout flow?
12. When would you NOT use Clean Architecture?

**For each question, prepare to go 3-4 levels deep.**
Practice by having someone ask follow-up questions.`,
      commonMistakes: [
        "Giving surface-level answers — the interviewer wants to see DEPTH. Go to implementation details.",
        "Not relating to production experience — always tie knowledge to real scenarios you've handled",
        "Admitting 'I don't know' too quickly — try to reason through it based on what you DO know",
        "Not asking clarifying questions — if a question is broad, narrow it: 'Do you want me to focus on the rendering pipeline or the state management?'",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain everything that happens when a user taps a button in an Android app, from the hardware touch to the UI update.",
          a: "Full stack trace: (1) **Hardware:** Touch sensor detects finger → generates interrupt → Linux kernel processes input event. (2) **Input pipeline:** InputDispatcher (in system_server) receives the event → determines which window should receive it → sends via input channel (socket pair) to the app process. (3) **App process:** Looper on the main thread picks up the InputEvent from the MessageQueue → ViewRootImpl handles the event → dispatches through the View hierarchy (dispatchTouchEvent → onTouchEvent). (4) **View system:** The Button's onTouchEvent detects ACTION_UP → calls performClick → invokes the OnClickListener. (5) **State update:** Listener updates ViewModel state (e.g., StateFlow.value = new state). (6) **Recomposition (Compose):** Snapshot system detects state change → schedules recomposition → Composer re-executes affected composable → generates new layout nodes. (7) **Rendering:** UI thread records display list → RenderThread executes GPU commands → SurfaceFlinger composites → display shows updated frame. Total: ~1-2 frames (16-32ms).",
        },
      ],
    },
  ],
};

export default androidPhase12;
