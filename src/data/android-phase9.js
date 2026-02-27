const androidPhase9 = {
  id: "phase-9",
  title: "Phase 9: DSA for Google Interviews",
  emoji: "🧮",
  description: "Senior-level DSA preparation for Google — essential patterns, must-practice problems, and optimization strategies.",
  topics: [
    {
      id: "dsa-topics-for-google",
      title: "Senior-Level DSA Topics for Google",
      explanation: `**Google's coding interviews** test DSA at a higher bar for senior candidates. You're expected to identify the optimal approach quickly and implement it cleanly in Kotlin.

**Essential topic areas ranked by Google frequency:**
1. **Arrays & Strings** — Two pointers, sliding window, prefix sums, binary search
2. **Trees & Graphs** — BFS/DFS, shortest path, topological sort, tree traversals
3. **Dynamic Programming** — State definition, transitions, optimization
4. **Hash Maps & Sets** — Frequency counting, grouping, caching
5. **Stacks & Queues** — Monotonic stack, BFS, parentheses matching
6. **Heaps (Priority Queues)** — Top-K, median, merge K sorted lists
7. **Linked Lists** — Reversal, cycle detection, merge
8. **Greedy** — Interval scheduling, minimum operations
9. **Tries** — Autocomplete, word search, longest prefix
10. **Union-Find** — Connected components, cycle detection

**Senior-level expectations:**
- Identify the pattern within 2-3 minutes
- Discuss time/space complexity BEFORE coding
- Write clean, idiomatic Kotlin (not Java translated to Kotlin)
- Handle edge cases without prompting
- Optimize from brute force to optimal proactively

**Problem-solving framework:**
\`\`\`
1. Understand — Restate the problem, ask clarifying questions
2. Plan — Identify pattern, discuss approach, state complexity
3. Code — Write clean solution with good variable names
4. Test — Walk through 2 examples + 1 edge case
5. Optimize — If not optimal, discuss how to improve
\`\`\``,
      codeExample: `// Google-frequency coding patterns in Kotlin

// 1. Sliding Window — Max sum of subarray of size K
fun maxSumSubarray(arr: IntArray, k: Int): Int {
    var windowSum = arr.slice(0 until k).sum()
    var maxSum = windowSum
    for (i in k until arr.size) {
        windowSum += arr[i] - arr[i - k]
        maxSum = maxOf(maxSum, windowSum)
    }
    return maxSum
}

// 2. Two Pointers — Container with most water
fun maxArea(height: IntArray): Int {
    var left = 0
    var right = height.lastIndex
    var maxWater = 0
    while (left < right) {
        val water = minOf(height[left], height[right]) * (right - left)
        maxWater = maxOf(maxWater, water)
        if (height[left] < height[right]) left++ else right--
    }
    return maxWater
}

// 3. BFS — Shortest path in unweighted graph
fun shortestPath(graph: Map<Int, List<Int>>, start: Int, end: Int): Int {
    val queue: Queue<Pair<Int, Int>> = LinkedList()
    val visited = mutableSetOf(start)
    queue.add(start to 0)
    while (queue.isNotEmpty()) {
        val (node, dist) = queue.poll()
        if (node == end) return dist
        for (neighbor in graph[node] ?: emptyList()) {
            if (neighbor !in visited) {
                visited.add(neighbor)
                queue.add(neighbor to dist + 1)
            }
        }
    }
    return -1
}

// 4. Dynamic Programming — Longest Increasing Subsequence
fun lengthOfLIS(nums: IntArray): Int {
    // Patience sorting — O(n log n)
    val tails = mutableListOf<Int>()
    for (num in nums) {
        val pos = tails.binarySearch(num).let { if (it < 0) -(it + 1) else it }
        if (pos == tails.size) tails.add(num) else tails[pos] = num
    }
    return tails.size
}

// 5. Monotonic Stack — Next greater element
fun nextGreaterElements(nums: IntArray): IntArray {
    val result = IntArray(nums.size) { -1 }
    val stack = ArrayDeque<Int>() // indices
    for (i in nums.indices) {
        while (stack.isNotEmpty() && nums[stack.last()] < nums[i]) {
            result[stack.removeLast()] = nums[i]
        }
        stack.addLast(i)
    }
    return result
}`,
      exercise: `**50 Must-Practice Problems for Google:**

**Arrays & Strings (10):**
1. Two Sum (Easy) — HashMap
2. Best Time to Buy/Sell Stock (Easy) — Kadane's
3. Container With Most Water (Medium) — Two pointers
4. 3Sum (Medium) — Sort + two pointers
5. Minimum Window Substring (Hard) — Sliding window
6. Longest Substring Without Repeating (Medium) — Sliding window
7. Product of Array Except Self (Medium) — Prefix/suffix
8. Merge Intervals (Medium) — Sort + greedy
9. Trapping Rain Water (Hard) — Two pointers
10. Longest Consecutive Sequence (Medium) — HashSet

**Trees & Graphs (10):**
11. Binary Tree Level Order Traversal (Medium) — BFS
12. Validate BST (Medium) — Inorder
13. Lowest Common Ancestor (Medium) — Recursion
14. Serialize/Deserialize Binary Tree (Hard) — BFS/preorder
15. Number of Islands (Medium) — BFS/DFS
16. Course Schedule (Medium) — Topological sort
17. Word Ladder (Hard) — BFS
18. Clone Graph (Medium) — BFS + HashMap
19. Alien Dictionary (Hard) — Topological sort
20. Binary Tree Max Path Sum (Hard) — DFS

**Dynamic Programming (10):**
21. Climbing Stairs (Easy) — Fibonacci pattern
22. Coin Change (Medium) — Bottom-up DP
23. Longest Increasing Subsequence (Medium) — Patience sorting
24. Word Break (Medium) — DP + Trie
25. Edit Distance (Medium) — 2D DP
26. Unique Paths (Medium) — 2D DP
27. House Robber (Medium) — Linear DP
28. Decode Ways (Medium) — Linear DP
29. Partition Equal Subset Sum (Medium) — 0/1 Knapsack
30. Regular Expression Matching (Hard) — 2D DP

**Remaining (20):** LRU Cache, Merge K Sorted Lists, Design Hit Counter, Implement Trie, Find Median from Data Stream, Task Scheduler, Min Stack, Valid Parentheses, Daily Temperatures, Top K Frequent Elements, Kth Largest Element, Meeting Rooms II, Number of Connected Components, Redundant Connection, Design Twitter, Max Frequency Stack, Sliding Window Maximum, Palindrome Partitioning, Word Search II, Accounts Merge`,
      commonMistakes: [
        "Jumping into coding without discussing the approach — Google evaluates your thought process, not just the answer",
        "Not considering all edge cases — empty input, single element, all duplicates, overflow",
        "Writing verbose Java-style Kotlin — use Kotlin idioms (let, apply, destructuring, extension functions)",
        "Not optimizing proactively — if you write O(n²), immediately discuss how to reach O(n) or O(n log n)",
        "Forgetting to test your code — walk through at least 2 examples after writing",
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Given a list of intervals representing meeting times, find the minimum number of conference rooms required.",
          a: "```kotlin\nfun minMeetingRooms(intervals: Array<IntArray>): Int {\n    val starts = intervals.map { it[0] }.sorted()\n    val ends = intervals.map { it[1] }.sorted()\n    var rooms = 0\n    var maxRooms = 0\n    var s = 0\n    var e = 0\n    while (s < starts.size) {\n        if (starts[s] < ends[e]) {\n            rooms++\n            maxRooms = maxOf(maxRooms, rooms)\n            s++\n        } else {\n            rooms--\n            e++\n        }\n    }\n    return maxRooms\n}\n// O(n log n) time, O(n) space\n// Alternative: use a min-heap of end times\n```"
        },
        {
          type: "coding",
          q: "Implement an LRU Cache with O(1) get and put operations.",
          a: "```kotlin\nclass LRUCache(private val capacity: Int) {\n    private val map = HashMap<Int, Node>()\n    private val head = Node(0, 0) // dummy\n    private val tail = Node(0, 0) // dummy\n    init { head.next = tail; tail.prev = head }\n    \n    fun get(key: Int): Int {\n        val node = map[key] ?: return -1\n        remove(node)\n        addToHead(node)\n        return node.value\n    }\n    \n    fun put(key: Int, value: Int) {\n        map[key]?.let { remove(it) }\n        val node = Node(key, value)\n        map[key] = node\n        addToHead(node)\n        if (map.size > capacity) {\n            val lru = tail.prev!!\n            remove(lru)\n            map.remove(lru.key)\n        }\n    }\n    \n    private fun addToHead(node: Node) {\n        node.next = head.next\n        node.prev = head\n        head.next!!.prev = node\n        head.next = node\n    }\n    \n    private fun remove(node: Node) {\n        node.prev!!.next = node.next\n        node.next!!.prev = node.prev\n    }\n    \n    data class Node(val key: Int, var value: Int, var prev: Node? = null, var next: Node? = null)\n}\n```"
        },
      ],
    },
    {
      id: "pattern-recognition",
      title: "Pattern Recognition & Problem-Solving Strategy",
      explanation: `**Pattern recognition** is the meta-skill that separates senior engineers from those who just memorize solutions. Instead of solving each problem from scratch, you match it to a known pattern.

**Core patterns and their triggers:**

**1. Sliding Window** — Subarray/substring with condition
- Trigger: "contiguous subarray", "substring", "window of size K"
- Template: Two pointers (left, right) expanding right, shrinking left

**2. Two Pointers** — Sorted array, pair finding
- Trigger: "sorted array", "pair that sums to", "in-place"
- Template: left=0, right=end, move based on comparison

**3. BFS** — Shortest path, level-order
- Trigger: "shortest", "minimum steps", "level by level", "unweighted graph"
- Template: Queue + visited set

**4. DFS / Backtracking** — All combinations, permutations
- Trigger: "all possible", "generate all", "combinations", "subsets"
- Template: Recursive with state, undo state on backtrack

**5. Dynamic Programming** — Optimal substructure + overlapping subproblems
- Trigger: "minimum/maximum", "number of ways", "can you reach"
- Template: Define state, recurrence relation, base case

**6. Binary Search** — Sorted data, search space reduction
- Trigger: "sorted", "minimum that satisfies", "search space"
- Template: lo, hi, mid, adjust based on condition

**7. Monotonic Stack** — Next greater/smaller element
- Trigger: "next greater", "stock span", "histogram"
- Template: Stack of indices, pop when current > top

**8. Union-Find** — Connected components, grouping
- Trigger: "connected", "components", "cycle in undirected graph"
- Template: parent array, find with path compression, union by rank`,
      codeExample: `// Pattern matching examples

// PATTERN: When you see "subarray with sum = K" → Prefix sum + HashMap
fun subarraySum(nums: IntArray, k: Int): Int {
    val prefixCount = mutableMapOf(0 to 1) // prefix_sum → count
    var sum = 0
    var count = 0
    for (num in nums) {
        sum += num
        count += prefixCount.getOrDefault(sum - k, 0)
        prefixCount[sum] = prefixCount.getOrDefault(sum, 0) + 1
    }
    return count
}
// Trigger identified: "subarray" + "sum equals K"
// Pattern: Prefix sum with HashMap

// PATTERN: When you see "generate all subsets" → Backtracking
fun subsets(nums: IntArray): List<List<Int>> {
    val result = mutableListOf<List<Int>>()
    
    fun backtrack(start: Int, current: MutableList<Int>) {
        result.add(current.toList()) // Add current subset
        for (i in start until nums.size) {
            current.add(nums[i])       // Choose
            backtrack(i + 1, current)  // Explore
            current.removeAt(current.lastIndex) // Un-choose
        }
    }
    
    backtrack(0, mutableListOf())
    return result
}

// PATTERN: When you see "K-th largest" → Min-heap of size K
fun findKthLargest(nums: IntArray, k: Int): Int {
    val minHeap = PriorityQueue<Int>() // Min-heap
    for (num in nums) {
        minHeap.offer(num)
        if (minHeap.size > k) minHeap.poll() // Remove smallest
    }
    return minHeap.peek() // K-th largest is at top
}
// O(n log k) time, O(k) space

// PATTERN: When you see "minimum in rotated sorted" → Modified binary search
fun findMin(nums: IntArray): Int {
    var lo = 0
    var hi = nums.lastIndex
    while (lo < hi) {
        val mid = lo + (hi - lo) / 2
        if (nums[mid] > nums[hi]) lo = mid + 1
        else hi = mid
    }
    return nums[lo]
}`,
      exercise: `**Pattern Recognition Drill:**
For each problem, identify the pattern BEFORE solving:
1. "Find all anagrams in a string" → ? (Sliding window + frequency map)
2. "Minimum number of jumps to reach end" → ? (Greedy / BFS)
3. "Clone a graph" → ? (BFS + HashMap)
4. "Coin change — minimum coins" → ? (DP — bottom-up)
5. "Find celebrity in a party" → ? (Two pointers / elimination)
6. "Merge K sorted lists" → ? (Min-heap)
7. "Longest palindromic substring" → ? (Expand around center / DP)
8. "Number of islands" → ? (BFS/DFS grid traversal)
9. "Decode ways" → ? (Linear DP — fibonacci variant)
10. "Task scheduler with cooldown" → ? (Greedy + math / max-heap)`,
      commonMistakes: [
        "Memorizing solutions without understanding the pattern — different inputs will break your memorized approach",
        "Forcing a pattern that doesn't fit — if two pointers doesn't work, consider sliding window or hashmap",
        "Not recognizing DP problems — the triggers are 'optimal' (min/max), 'count ways', and overlapping subproblems",
        "Using DFS when BFS is needed — BFS guarantees shortest path in unweighted graphs, DFS does not",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you approach a problem you've never seen before in an interview?",
          a: "Systematic pattern matching: (1) **Read and restate** — make sure you understand the problem. (2) **Identify constraints** — sorted? contiguous? optimal? all possibilities? These are pattern triggers. (3) **Match to pattern** — sorted + pair → two pointers. Subarray + condition → sliding window. Shortest path → BFS. All combinations → backtracking. Min/max + choices → DP. (4) **Start with brute force** — it's ok to start with O(n²) and optimize. Shows you understand the problem. (5) **Optimize** — apply the pattern to reduce complexity. (6) **If truly stuck** — simplify the problem (smaller input, fewer constraints) and solve that first."
        },
      ],
    },
    {
      id: "mock-coding-simulation",
      title: "Mock Coding Interview Simulation",
      explanation: `**Mock interviews** are the most effective preparation method. Simulating real interview conditions builds comfort, timing, and communication skills.

**How to run an effective mock:**
1. **Set the environment:** Plain text editor (no autocomplete), 45-minute timer, webcam on
2. **Think aloud:** Narrate your entire thought process. Don't go silent.
3. **Follow the framework:** Understand → Plan → Code → Test → Optimize
4. **Get feedback:** After the mock, review: communication clarity, time management, code quality, edge cases

**Timing breakdown for a 45-min round:**
\`\`\`
0-3 min:   Read problem, ask clarifying questions
3-8 min:   Discuss approach, state complexity
8-30 min:  Code the solution
30-38 min: Test with examples and edge cases
38-45 min: Discuss optimizations, follow-up questions
\`\`\`

**Common follow-up questions:**
- "Can you do this in O(1) space?"
- "What if the input doesn't fit in memory?"
- "How would you parallelize this?"
- "What if the input is streaming (online algorithm)?"

**Communication tips for senior candidates:**
- **Lead the conversation** — don't wait for prompts
- **State trade-offs** — "I can do O(n) time with O(n) space, or O(n log n) with O(1) space"
- **Acknowledge complexity** — "This is an NP-hard problem, so I'll use an approximation"
- **Discuss alternatives** — "Another approach would be X, but I chose Y because..."`,
      codeExample: `// Mock interview example: Design an iterator for a 2D matrix
// that traverses in spiral order

// Step 1: Understand — I need to traverse a matrix in spiral order
// and return elements one at a time via next() and hasNext()

// Step 2: Plan — Pre-compute the spiral order in the constructor,
// then iterate through the precomputed list. Alternative: maintain
// boundaries and compute on-the-fly (more complex but O(1) space).

// Step 3: Code
class SpiralIterator(matrix: Array<IntArray>) : Iterator<Int> {
    private val elements = mutableListOf<Int>()
    private var index = 0
    
    init {
        if (matrix.isNotEmpty() && matrix[0].isNotEmpty()) {
            var top = 0
            var bottom = matrix.size - 1
            var left = 0
            var right = matrix[0].size - 1
            
            while (top <= bottom && left <= right) {
                // Right
                for (col in left..right) elements.add(matrix[top][col])
                top++
                // Down
                for (row in top..bottom) elements.add(matrix[row][right])
                right--
                // Left
                if (top <= bottom) {
                    for (col in right downTo left) elements.add(matrix[bottom][col])
                    bottom--
                }
                // Up
                if (left <= right) {
                    for (row in bottom downTo top) elements.add(matrix[row][left])
                    left++
                }
            }
        }
    }
    
    override fun hasNext(): Boolean = index < elements.size
    override fun next(): Int {
        if (!hasNext()) throw NoSuchElementException()
        return elements[index++]
    }
}

// Step 4: Test
// Input: [[1,2,3],[4,5,6],[7,8,9]]
// Expected: 1,2,3,6,9,8,7,4,5
// Edge: empty matrix → hasNext() = false
// Edge: single row → 1,2,3
// Edge: single column → 1,4,7

// Step 5: Discuss
// Time: O(m*n) constructor, O(1) next/hasNext
// Space: O(m*n) for stored elements
// Trade-off: Could compute on-the-fly with O(1) space but more complex`,
      exercise: `**Mock Interview Schedule (Weekly):**
- Monday: Solve 2 medium problems with timer (35 min each)
- Tuesday: Solve 1 hard problem (45 min)
- Wednesday: System design practice (45 min)
- Thursday: Solve 2 medium problems from different categories
- Friday: Full mock interview with a partner
- Weekend: Review all solutions from the week, identify weak patterns

**Self-assessment after each mock:**
1. Did I identify the pattern within 3 minutes?
2. Did I discuss my approach before coding?
3. Was my code clean and idiomatic Kotlin?
4. Did I handle edge cases without prompting?
5. Did I stay within the time limit?
6. Did I communicate clearly throughout?`,
      commonMistakes: [
        "Practicing with autocomplete and syntax highlighting — Google interviews use Google Docs or a simple editor",
        "Not timing yourself — without time pressure, you can't assess if your pace is interview-ready",
        "Practicing solo only — pair mock interviews are 10x more effective because they test communication",
        "Only practicing easy problems — Google asks medium to hard problems, practice at that level",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "You're 20 minutes into a 45-minute coding round and realize your approach is wrong. What do you do?",
          a: "**Don't panic. This happens and is expected.** (1) Stop coding and tell the interviewer: 'I realize this approach has a flaw because [specific reason]. Let me reconsider.' (2) Take 2 minutes to identify the correct pattern. (3) If you have a better approach, explain it and start coding. (4) If stuck, share your thinking with the interviewer. Say: 'I'm considering X and Y approaches. X handles [case] well but [issue]. Can I get a hint on the right direction?' Google evaluates how you handle setbacks. Pivoting gracefully with clear communication is a strong signal."
        },
      ],
    },
  ],
};

export default androidPhase9;
