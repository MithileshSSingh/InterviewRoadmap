const dsaPhase5 = {
  id: "phase-5",
  title: "Phase 5: Interview & Real-World Applications",
  emoji: "🔴",
  description: "Bridge theory to practice — real-world system design with DSA, interview strategies, coding challenges, system thinking, and capstone projects.",
  topics: [
    {
      id: "real-world-caching",
      title: "Real-World DSA: Caching Systems (LRU, LFU, TTL)",
      explanation: `Caching is everywhere — browsers, databases, CDNs, APIs. Understanding cache data structures is critical for system design AND coding interviews.

**LRU Cache (Least Recently Used):**
- Evicts the least recently accessed item when full
- Implementation: **Hash Map + Doubly Linked List**
- get() and put() both O(1)
- Used in: CPU caches, database query caches, browser caches

**LFU Cache (Least Frequently Used):**
- Evicts the least frequently accessed item
- Implementation: Hash Map + Frequency Map + Doubly Linked Lists
- More complex but better for some access patterns

**Cache with TTL (Time To Live):**
- Each entry expires after a set duration
- Implementation: Hash Map + Min-Heap (keyed by expiration time)
- Used in: DNS caching, session tokens, API rate limiting

**Cache replacement policies:**
| Policy | Evicts | Best For |
|--------|-------|---------|
| LRU | Least recently used | General purpose, temporal locality |
| LFU | Least frequently used | Frequency-based access patterns |
| FIFO | Oldest item | Simple, predictable |
| Random | Random item | Simple, surprisingly effective |

**System Design implications:**
- Cache hit ratio → directly impacts latency
- Cache invalidation is one of the two hardest problems in CS
- Write-through vs write-back strategies
- Distributed caching (Redis, Memcached)

🏠 **Real-world analogy:** LRU is like your browser's "Recent" bookmarks — pages you haven't visited recently fall off. LFU is like a library keeping popular books on the front shelf — rarely borrowed books go to storage.`,
      codeExample: `// LRU CACHE — O(1) get and put
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // Preserves insertion order in JS!
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);  // Remove
    this.map.set(key, val); // Re-insert (moves to end = most recent)
    return val;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      // Delete oldest (first key in Map)
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }
}

// LRU CACHE — Classic DLL + HashMap implementation
class DLLNode {
  constructor(key, val) { this.key = key; this.val = val; this.prev = null; this.next = null; }
}

class LRUCacheClassic {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
    this.head = new DLLNode(0, 0); // Dummy head (most recent)
    this.tail = new DLLNode(0, 0); // Dummy tail (oldest)
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._addToFront(node);
    return node.val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    }
    const node = new DLLNode(key, value);
    this._addToFront(node);
    this.map.set(key, node);
    if (this.map.size > this.cap) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
}

// CACHE WITH TTL
class TTLCache {
  constructor() { this.cache = new Map(); }

  set(key, value, ttlMs) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }
}`,
      exercise: `**Practice Problems & Design Questions:**
1. Implement LRU Cache with O(1) get and put
2. Implement LFU Cache with O(1) get and put
3. Add TTL (time-to-live) to your LRU cache
4. Design a multi-level cache (L1 memory, L2 Redis, L3 database)
5. How would you handle cache invalidation in a distributed system?
6. Implement a write-through cache vs write-back cache
7. Design a CDN caching strategy for static assets
8. Calculate cache hit ratio given access patterns
9. When would you choose LFU over LRU?
10. Design a rate limiter using a sliding window cache`,
      commonMistakes: [
        "Using only a hash map for LRU — need O(1) removal of oldest, which requires a linked list",
        "Not handling put() for existing keys — must update AND move to most recent",
        "Forgetting cache stampede — multiple threads see cache miss and all hit the database",
        "Not considering cache invalidation strategy — stale data can cause serious bugs",
        "Over-caching — caching rarely accessed data wastes memory; monitor hit ratios"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Design an LRU Cache with O(1) get and put operations.",
          a: "Use **HashMap + Doubly Linked List**. Map stores key → DLL node. DLL maintains access order (head = most recent, tail = oldest). On get: move node to head. On put: add to head, if over capacity remove tail. JavaScript shortcut: Map preserves insertion order, so delete + set simulates LRU."
        },
        {
          type: "scenario",
          q: "How would you design a caching layer for a social media feed?",
          a: "1) **L1**: In-memory LRU per server (last 100 posts per user). 2) **L2**: Distributed cache (Redis) with TTL (5 min). 3) **L3**: Database. Strategy: read-through (check cache, miss → DB → cache). Invalidation: write-through on new posts. Cache popular users more aggressively. Monitor hit ratio (~95% target)."
        }
      ]
    },
    {
      id: "real-world-rate-limiting",
      title: "Real-World DSA: Rate Limiting & Scheduling",
      explanation: `Rate limiting controls how many requests a user/IP can make in a time window. It uses queues, sliding windows, and token buckets — all built on DSA concepts.

**Rate Limiting Algorithms:**

**1. Fixed Window Counter:**
- Count requests per fixed time window (e.g., 100 req/minute)
- Simple but has "boundary burst" problem (200 requests at minute boundary)

**2. Sliding Window Log:**
- Store timestamp of each request
- Count requests in last N seconds
- Accurate but memory-heavy

**3. Sliding Window Counter:**
- Combines fixed window + interpolation
- Low memory, good accuracy

**4. Token Bucket:**
- Bucket fills at constant rate (r tokens/sec)
- Each request consumes a token
- Allows bursts up to bucket size
- Used by: AWS, Stripe, most cloud APIs

**5. Leaky Bucket:**
- Requests enter a queue (bucket), processed at constant rate
- Queue overflow → rejected
- Smooth output rate

**Task Scheduling:**
- **Round Robin**: Circular queue of tasks, each gets equal time slice
- **Priority Queue**: Highest priority task runs first (heap-based)
- **Job Scheduler**: Cron-like scheduling using min-heap of next-run times

🏠 **Real-world analogy:** Token bucket is like a vending machine coin slot — coins (tokens) accumulate at a constant rate. You can spend them quickly (burst) but once out, you wait. Leaky bucket is like a funnel — liquid (requests) flows out at a constant rate regardless of how fast you pour in.`,
      codeExample: `// TOKEN BUCKET RATE LIMITER
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  allowRequest() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens--;
      return true; // Allowed
    }
    return false; // Rate limited
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

// SLIDING WINDOW LOG RATE LIMITER
class SlidingWindowRateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // userId → [timestamps]
  }

  allowRequest(userId) {
    const now = Date.now();
    if (!this.requests.has(userId)) this.requests.set(userId, []);
    const timestamps = this.requests.get(userId);

    // Remove expired timestamps
    while (timestamps.length && timestamps[0] <= now - this.windowMs) {
      timestamps.shift();
    }

    if (timestamps.length < this.maxRequests) {
      timestamps.push(now);
      return true;
    }
    return false;
  }
}

// TASK SCHEDULER — Minimum intervals with cooldown
function leastInterval(tasks, n) {
  const freq = new Array(26).fill(0);
  for (const t of tasks) freq[t.charCodeAt(0) - 65]++;
  freq.sort((a, b) => b - a);

  const maxFreq = freq[0];
  let idleSlots = (maxFreq - 1) * n;

  for (let i = 1; i < 26 && freq[i] > 0; i++) {
    idleSlots -= Math.min(freq[i], maxFreq - 1);
  }

  return tasks.length + Math.max(0, idleSlots);
}

// ROUND-ROBIN SCHEDULER
class RoundRobinScheduler {
  constructor(timeSlice) {
    this.queue = [];
    this.timeSlice = timeSlice;
  }

  addTask(task) { this.queue.push(task); }

  run() {
    while (this.queue.length) {
      const task = this.queue.shift();
      const remaining = task.execute(this.timeSlice);
      if (remaining > 0) {
        task.remainingTime = remaining;
        this.queue.push(task); // Back to queue
      }
    }
  }
}`,
      exercise: `**Practice Problems & Design Questions:**
1. Implement a token bucket rate limiter
2. Implement a sliding window rate limiter
3. Design an API rate limiter for a web service
4. Task scheduler with cooldown — minimum total time
5. Implement round-robin scheduling
6. Design a job queue with priority and retry logic
7. Rate limiting with different tiers (free: 10/min, pro: 100/min)
8. Implement a leaky bucket rate limiter
9. Design a distributed rate limiter (multiple servers)
10. Compare fixed window vs sliding window rate limiting`,
      commonMistakes: [
        "Fixed window counter boundary burst — 100 requests at :59 + 100 at :00 = 200 in 2 seconds",
        "Not considering distributed scenarios — rate limiting per server doesn't limit total load",
        "Not handling race conditions — concurrent requests may bypass the limit",
        "Using in-memory rate limiting in load-balanced systems — use Redis for shared state",
        "Not implementing graceful degradation — return 429 Too Many Requests, not 500"
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a rate limiter for an API that allows 100 requests per minute per user.",
          a: "Use **sliding window counter** stored in Redis (shared across servers). Key: `rate:{userId}:{minuteWindow}`. On each request: 1) Check current + interpolated count. 2) If under limit, increment and allow. 3) If over, return 429 with Retry-After header. Add a token bucket for burst handling. Use Redis TTL for auto-cleanup."
        },
        {
          type: "conceptual",
          q: "Compare token bucket and leaky bucket algorithms.",
          a: "**Token bucket**: allows bursts up to capacity, replenishes at constant rate. Good for APIs that can handle short bursts. **Leaky bucket**: outputs at constant rate, excess queued or dropped. Good for smoothing traffic. Token bucket is more flexible (adjustable burst size). Leaky bucket provides more predictable output rate."
        }
      ]
    },
    {
      id: "real-world-search-engines",
      title: "Real-World DSA: Search Engines & Recommendation Systems",
      explanation: `Search engines and recommendation systems are among the most popular system design interview topics. They rely heavily on data structures like inverted indices, tries, graphs, and hash maps.

**Search Engine Core:**

**1. Inverted Index — The backbone of search:**
- Maps each word → list of document IDs containing it
- "apple" → [doc1, doc5, doc42]
- "pie" → [doc5, doc33, doc42]
- Search "apple pie" → intersection of [doc1,doc5,doc42] ∩ [doc5,doc33,doc42] = [doc5, doc42]

**2. TF-IDF (Term Frequency - Inverse Document Frequency):**
- TF = word frequency in document / total words in document
- IDF = log(total documents / documents containing word)
- TF-IDF = TF × IDF — higher score = more relevant

**3. Autocomplete — Trie-based:**
- Trie stores all searchable terms
- Each node may store a frequency/weight
- Prefix search returns top-k suggestions by weight

**Recommendation System Approaches:**
1. **Collaborative Filtering**: Users who liked X also liked Y (graph-based)
2. **Content-Based**: Recommend similar items (feature vectors, cosine similarity)
3. **Hybrid**: Combine both approaches

**Data structures used:**
- Inverted index: Hash Map of word → sorted document list
- Autocomplete: Trie with frequency weights
- Similarity: Min-heap for top-K most similar
- User-item mapping: Sparse matrix / hash map

🏠 **Real-world analogy:** Google's index is like a book's index at the back — you look up a word and find which pages mention it. Autocomplete is like a friend who finishes your sentences based on what's popular.`,
      codeExample: `// INVERTED INDEX — Search engine core
class InvertedIndex {
  constructor() { this.index = new Map(); }

  addDocument(docId, text) {
    const words = text.toLowerCase().split(/\\W+/);
    for (const word of words) {
      if (!this.index.has(word)) this.index.set(word, new Set());
      this.index.get(word).add(docId);
    }
  }

  search(query) {
    const words = query.toLowerCase().split(/\\W+/);
    let result = null;
    for (const word of words) {
      const docs = this.index.get(word) || new Set();
      result = result ? new Set([...result].filter(d => docs.has(d))) : new Set(docs);
    }
    return [...(result || [])];
  }
}

// TF-IDF RANKING
class TFIDFSearch {
  constructor() { this.docs = new Map(); this.wordDocCount = new Map(); }

  addDocument(docId, text) {
    const words = text.toLowerCase().split(/\\W+/);
    const freq = new Map();
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    this.docs.set(docId, { words, freq, totalWords: words.length });
    for (const w of new Set(words)) {
      this.wordDocCount.set(w, (this.wordDocCount.get(w) || 0) + 1);
    }
  }

  search(query) {
    const queryWords = query.toLowerCase().split(/\\W+/);
    const scores = [];
    for (const [docId, doc] of this.docs) {
      let score = 0;
      for (const word of queryWords) {
        const tf = (doc.freq.get(word) || 0) / doc.totalWords;
        const idf = Math.log((this.docs.size + 1) / (1 + (this.wordDocCount.get(word) || 0)));
        score += tf * idf;
      }
      if (score > 0) scores.push({ docId, score });
    }
    return scores.sort((a, b) => b.score - a.score);
  }
}

// AUTOCOMPLETE — Trie with frequency
class AutocompleteTrie {
  constructor() { this.root = {}; }

  insert(word, weight = 1) {
    let node = this.root;
    for (const c of word) { node[c] = node[c] || {}; node = node[c]; }
    node.weight = (node.weight || 0) + weight;
    node.isEnd = true;
  }

  suggest(prefix, limit = 5) {
    let node = this.root;
    for (const c of prefix) { if (!node[c]) return []; node = node[c]; }
    const results = [];
    this._dfs(node, prefix, results);
    return results.sort((a, b) => b.weight - a.weight).slice(0, limit).map(r => r.word);
  }

  _dfs(node, path, results) {
    if (node.isEnd) results.push({ word: path, weight: node.weight });
    for (const [char, child] of Object.entries(node)) {
      if (char !== 'isEnd' && char !== 'weight') this._dfs(child, path + char, results);
    }
  }
}

// COSINE SIMILARITY — For content-based recommendations
function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}`,
      exercise: `**Practice Problems & Design Questions:**
1. Build a simple inverted index from a collection of documents
2. Implement a basic search engine with TF-IDF ranking
3. Design an autocomplete system with frequency-based suggestions
4. Implement cosine similarity for document comparison
5. Design a movie recommendation system using collaborative filtering
6. Build a "Did you mean?" spell checker (edit distance + trie)
7. Design a real-time trending search feature
8. How would you scale an inverted index to billions of documents?
9. Implement a simple PageRank algorithm
10. Design a product search system for an e-commerce site`,
      commonMistakes: [
        "Not tokenizing/normalizing text — 'Apple', 'apple', 'APPLE' should map to same token",
        "Not considering relevance ranking — returning results without TF-IDF or similar scoring",
        "Autocomplete without frequency weighting — popular queries should rank higher",
        "Not handling stop words — 'the', 'a', 'is' add noise to search results",
        "Ignoring scalability — inverted index must be sharded for large-scale systems"
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design an autocomplete system for a search bar.",
          a: "Use a **Trie** with frequency-weighted nodes. On each keystroke: 1) Traverse trie with prefix. 2) DFS to find all completions. 3) Return top-K by frequency. Optimizations: pre-compute top-K at each trie node, use caching for popular prefixes, serve from edge (CDN). For personalized suggestions: blend global frequency with user history."
        },
        {
          type: "conceptual",
          q: "How does an inverted index enable fast full-text search?",
          a: "An inverted index maps each word to the list of documents containing it (like a book's index). To search 'apple pie': lookup 'apple' → [1,5,42], lookup 'pie' → [5,33,42], intersect → [5,42]. This avoids scanning every document. Time: O(sum of posting list lengths). With sorted lists, intersection can use merge or skip pointers."
        }
      ]
    },
    {
      id: "interview-patterns-mastery",
      title: "Interview Pattern Mastery — The Complete Guide",
      explanation: `**The 15 Essential Interview Patterns:**
Every coding interview problem maps to one or more of these patterns. Mastering pattern recognition is MORE valuable than solving 1000 random problems.

**1. Two Pointers** — Sorted array pair problems
**2. Sliding Window** — Substring/subarray with constraint
**3. Fast & Slow Pointers** — Cycle detection, middle finding
**4. Binary Search** — Sorted data, search on answer
**5. BFS/DFS** — Tree/graph traversal, shortest path
**6. Backtracking** — Generate permutations/combinations
**7. Dynamic Programming** — Optimal/count with overlapping sub-problems
**8. Greedy** — Local optimal → global optimal
**9. Hash Map** — Frequency counting, two sum, grouping
**10. Stack/Queue** — Parentheses, next greater, BFS
**11. Heap (Priority Queue)** — Top K, merge K sorted, median
**12. Union-Find** — Connected components, cycle detection
**13. Trie** — Prefix matching, word search
**14. Monotonic Stack** — Next greater/smaller, histogram
**15. Prefix Sum** — Range queries, subarray sums

**Pattern → Problem Mapping Cheat Sheet:**
- "Subarray/Substring with ___" → Sliding Window
- "Top K ___" → Heap
- "How many ways?" → DP
- "Find shortest ___" → BFS
- "Connected?" → Union-Find or DFS
- "Valid arrangement?" → Backtracking
- "Sorted array + pair" → Two Pointers
- "Prefix/starts with" → Trie

🏠 **Real-world analogy:** Patterns are like chess openings — you don't reinvent strategy each game. You recognize the position, apply the pattern, and adapt to the specific scenario.`,
      codeExample: `// PATTERN RECOGNITION EXAMPLES

// 1. "Find pair in sorted array" → TWO POINTERS
function twoSumSorted(arr, target) {
  let l = 0, r = arr.length - 1;
  while (l < r) {
    const sum = arr[l] + arr[r];
    if (sum === target) return [l, r];
    sum < target ? l++ : r--;
  }
  return [-1, -1];
}

// 2. "Longest substring with at most K distinct" → SLIDING WINDOW
function longestKDistinct(s, k) {
  const freq = new Map();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    freq.set(s[right], (freq.get(s[right]) || 0) + 1);
    while (freq.size > k) {
      const c = s[left];
      freq.set(c, freq.get(c) - 1);
      if (freq.get(c) === 0) freq.delete(c);
      left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

// 3. "Minimum cost to ___" → DYNAMIC PROGRAMMING
function minCostPath(grid) {
  const m = grid.length, n = grid[0].length;
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) {
      if (i === 0 && j === 0) continue;
      const up = i > 0 ? grid[i-1][j] : Infinity;
      const left = j > 0 ? grid[i][j-1] : Infinity;
      grid[i][j] += Math.min(up, left);
    }
  return grid[m-1][n-1];
}

// 4. "Find connected components" → UNION-FIND
function countComponents(n, edges) {
  const parent = Array.from({length: n}, (_, i) => i);
  const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const union = (a, b) => { parent[find(a)] = find(b); };
  for (const [a, b] of edges) union(a, b);
  return new Set(Array.from({length: n}, (_, i) => find(i))).size;
}

// 5. "Generate all valid ___" → BACKTRACKING
function generateParentheses(n) {
  const result = [];
  function bt(s, o, c) {
    if (s.length === 2 * n) { result.push(s); return; }
    if (o < n) bt(s + '(', o + 1, c);
    if (c < o) bt(s + ')', o, c + 1);
  }
  bt('', 0, 0);
  return result;
}

// INTERVIEW DECISION TREE
function choosePattern(problem) {
  const keywords = problem.toLowerCase();
  if (keywords.includes('sorted') && keywords.includes('pair')) return 'Two Pointers';
  if (keywords.includes('substring') || keywords.includes('subarray')) return 'Sliding Window';
  if (keywords.includes('top k') || keywords.includes('kth')) return 'Heap';
  if (keywords.includes('shortest path')) return 'BFS';
  if (keywords.includes('how many ways') || keywords.includes('minimum cost')) return 'DP';
  if (keywords.includes('generate all') || keywords.includes('permutation')) return 'Backtracking';
  if (keywords.includes('connected')) return 'Union-Find / DFS';
  if (keywords.includes('prefix') || keywords.includes('starts with')) return 'Trie';
  return 'Hash Map (default fallback)';
}`,
      exercise: `**Practice Challenge: Identify the Pattern:**
1. "Find the longest substring without repeating characters" → ?
2. "Find the minimum window containing all characters of t" → ?
3. "Count the number of islands" → ?
4. "Find if a path exists between two nodes" → ?
5. "Top K frequent elements" → ?
6. "Generate all subsets of a set" → ?
7. "Coin change — minimum coins" → ?
8. "Next greater element" → ?
9. "Validate BST" → ?
10. "Course schedule — can finish all courses?" → ?

**Answers:** 1) Sliding Window 2) Sliding Window 3) DFS/BFS 4) BFS/DFS 5) Heap 6) Backtracking 7) DP 8) Monotonic Stack 9) DFS with range 10) Topological Sort`,
      commonMistakes: [
        "Trying to memorize solutions instead of learning patterns — you'll fail on any variation",
        "Not starting with brute force — always discuss brute force first, then optimize",
        "Jumping to code without discussing approach — interviewers want to see your thinking process",
        "Not considering multiple patterns — some problems can be solved with different approaches",
        "Ignoring time/space complexity trade-offs — always discuss both"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you identify which pattern to use for an unknown problem?",
          a: "1) Read constraints — they tell you expected complexity. 2) Identify keywords: 'sorted' → binary search/two pointers, 'substring' → sliding window, 'shortest' → BFS, 'optimal/count' → DP. 3) Consider the data structure: array → two pointers/sliding window, tree → DFS, graph → BFS/DFS. 4) Start with brute force, identify repeated work, optimize with patterns."
        },
        {
          type: "scenario",
          q: "You have 2 weeks to prepare for coding interviews. What's your plan?",
          a: "**Week 1**: Master the top 8 patterns — solve 5 problems per pattern (40 total). Focus on medium difficulty. Patterns: Two Pointers, Sliding Window, Binary Search, DFS/BFS, Backtracking, DP, Hash Map, Stack. **Week 2**: 2 mock interviews, revisit weak patterns, solve 10 hard problems, practice explaining solutions aloud. Daily: review mistake journal, re-solve 2 past problems."
        }
      ]
    },
    {
      id: "coding-challenges",
      title: "30 Curated Coding Challenges (Beginner → Advanced)",
      explanation: `These 30 carefully selected problems cover ALL major patterns and form a comprehensive practice set. Solve them in order — each builds on previous concepts.

**Beginner (1-10): Foundation Patterns**
1. Two Sum — Hash Map (LeetCode 1)
2. Valid Parentheses — Stack (LeetCode 20)
3. Merge Two Sorted Lists — Linked List (LeetCode 21)
4. Best Time to Buy and Sell Stock — Greedy (LeetCode 121)
5. Valid Palindrome — Two Pointers (LeetCode 125)
6. Maximum Subarray — DP/Kadane's (LeetCode 53)
7. Binary Search — Foundation (LeetCode 704)
8. Invert Binary Tree — Tree DFS (LeetCode 226)
9. Climbing Stairs — DP (LeetCode 70)
10. Contains Duplicate — Hash Set (LeetCode 217)

**Intermediate (11-20): Core Patterns**
11. Product of Array Except Self — Prefix (LeetCode 238)
12. 3Sum — Two Pointers (LeetCode 15)
13. Longest Substring Without Repeating — Sliding Window (LeetCode 3)
14. Group Anagrams — Hash Map (LeetCode 49)
15. Coin Change — DP (LeetCode 322)
16. Number of Islands — Graph DFS (LeetCode 200)
17. Validate BST — Tree DFS (LeetCode 98)
18. Course Schedule — Topological Sort (LeetCode 207)
19. LRU Cache — Design (LeetCode 146)
20. Implement Trie — Data Structure (LeetCode 208)

**Advanced (21-30): Expert Patterns**
21. Merge K Sorted Lists — Heap (LeetCode 23)
22. Longest Increasing Subsequence — DP (LeetCode 300)
23. Word Search II — Trie + Backtracking (LeetCode 212)
24. Sliding Window Maximum — Monotonic Deque (LeetCode 239)
25. Edit Distance — 2D DP (LeetCode 72)
26. Trapping Rain Water — Two Pointers/Stack (LeetCode 42)
27. Largest Rectangle in Histogram — Monotonic Stack (LeetCode 84)
28. Serialize/Deserialize Binary Tree — Design (LeetCode 297)
29. Median from Data Stream — Two Heaps (LeetCode 295)
30. Word Ladder — BFS (LeetCode 127)

**How to use this list:** Solve each problem with a 25/40/60 minute time limit (Easy/Medium/Hard). If stuck, read the editorial, understand the pattern, then re-solve without looking.`,
      codeExample: `// SOLUTIONS TO KEY CHALLENGES

// #1 Two Sum — Hash Map O(n)
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (map.has(target - nums[i])) return [map.get(target - nums[i]), i];
    map.set(nums[i], i);
  }
}

// #6 Maximum Subarray — Kadane's O(n)
function maxSubArray(nums) {
  let max = nums[0], curr = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]);
    max = Math.max(max, curr);
  }
  return max;
}

// #13 Longest Substring Without Repeating — Sliding Window
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let max = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right]) && map.get(s[right]) >= left)
      left = map.get(s[right]) + 1;
    map.set(s[right], right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}

// #15 Coin Change — DP O(amount × coins)
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++)
    for (const c of coins)
      if (c <= i) dp[i] = Math.min(dp[i], dp[i - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// #16 Number of Islands — DFS
function numIslands(grid) {
  let count = 0;
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (grid[r][c] === '1') {
        count++;
        sink(grid, r, c);
      }
  return count;
}
function sink(g, r, c) {
  if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] !== '1') return;
  g[r][c] = '0';
  sink(g,r+1,c); sink(g,r-1,c); sink(g,r,c+1); sink(g,r,c-1);
}

// #26 Trapping Rain Water — Two Pointers O(n)
function trap(height) {
  let l = 0, r = height.length - 1, lMax = 0, rMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      height[l] >= lMax ? lMax = height[l] : water += lMax - height[l];
      l++;
    } else {
      height[r] >= rMax ? rMax = height[r] : water += rMax - height[r];
      r--;
    }
  }
  return water;
}`,
      exercise: `**Your Mission (complete in 30 days):**
Week 1: Solve problems 1-10 (Easy, 25 min each)
Week 2: Solve problems 11-17 (Medium, 40 min each)
Week 3: Solve problems 18-25 (Medium-Hard, 40-60 min each)
Week 4: Solve problems 26-30 (Hard, 60 min each) + review all

**For each problem:**
1. Identify the pattern BEFORE coding
2. Write pseudocode first
3. Code the solution
4. Test with 3 examples including edge cases
5. Analyze time and space complexity
6. If you needed hints, re-solve the next day without looking`,
      commonMistakes: [
        "Solving in random order — this curated order builds concepts progressively",
        "Spending 3+ hours on one problem — time-box and learn from the editorial",
        "Not tracking which patterns are weak — keep a pattern strength log",
        "Only coding solutions without explaining them — practice thinking out loud",
        "Skipping easy problems — they build the foundation for harder patterns"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "If you could only study 5 patterns for interviews, which would you pick?",
          a: "1) **Hash Map** — appears in 40%+ of problems (two sum, frequency count, grouping). 2) **DFS/BFS** — trees, graphs, grids. 3) **Two Pointers/Sliding Window** — array/string optimization. 4) **Dynamic Programming** — optimization/counting. 5) **Binary Search** — sorted data + search on answer. These cover ~80% of interview problems."
        },
        {
          type: "scenario",
          q: "You've solved 200 LeetCode problems but still struggle in interviews. Why?",
          a: "Common reasons: 1) Solved problems but didn't learn patterns. 2) Never practiced explaining approach out loud. 3) Didn't time-box (interview is 45 min, not unlimited). 4) Skipped the 'understand problem' step. 5) Never did mock interviews. Fix: focus on 15 patterns, do 2 mocks/week, practice UMPIRE method, maintain a mistake journal."
        }
      ]
    },
    {
      id: "system-thinking-problems",
      title: "20 System-Thinking DSA Problems",
      explanation: `These problems bridge the gap between coding interviews and system design. They ask: "How would you use DSA to solve a real-world problem at scale?"

**The 20 System-Thinking Problems:**

**Data Processing (1-5):**
1. Design a **hit counter** that counts hits in the past 5 minutes (circular buffer)
2. Design a **log aggregator** that finds the top K most frequent error messages (hash map + heap)
3. Design a **stream processor** that finds the median of incoming numbers (two heaps)
4. Design a **deduplication system** for real-time event processing (bloom filter + hash set)
5. Design a **moving average** calculator from a data stream (queue)

**System Components (6-10):**
6. Design an **autocomplete system** with personalized suggestions (trie + user history)
7. Design a **URL shortener** with analytics (base62 encoding + hash map)
8. Design a **rate limiter** that supports multiple tiers (token bucket per tier)
9. Design a **notification system** that respects user preferences (priority queue + graph)
10. Design a **task scheduler** with dependencies (topological sort + priority queue)

**Real-time Systems (11-15):**
11. Design a **real-time leaderboard** that updates with new scores (balanced BST or skip list)
12. Design a **stock ticker** that shows min/max/avg in a sliding window (monotonic deque)
13. Design a **feed ranking** system for social media (graph + priority queue)
14. Design a **spell checker** with suggestions (trie + edit distance)
15. Design a **location-based search** (find nearest restaurants) (quadtree or geohash)

**Infrastructure (16-20):**
16. Design a **consistent hashing ring** for load balancing (sorted map + binary search)
17. Design a **distributed cache** eviction policy (LRU/LFU + replication)
18. Design a **file system** with path operations (trie of directory names)
19. Design an **undo/redo system** for a text editor (stack of operations)
20. Design a **garbage collector** using reference counting and mark-sweep (graph traversal)

Each problem requires choosing the RIGHT data structure and algorithm for the constraints.`,
      codeExample: `// PROBLEM 1: HIT COUNTER — Count hits in last 5 minutes
class HitCounter {
  constructor() {
    this.hits = new Array(300).fill(0); // 5 min = 300 sec
    this.times = new Array(300).fill(0);
  }

  hit(timestamp) {
    const idx = timestamp % 300;
    if (this.times[idx] !== timestamp) {
      this.times[idx] = timestamp;
      this.hits[idx] = 1;
    } else {
      this.hits[idx]++;
    }
  }

  getHits(timestamp) {
    let total = 0;
    for (let i = 0; i < 300; i++) {
      if (timestamp - this.times[i] < 300) total += this.hits[i];
    }
    return total;
  }
}

// PROBLEM 7: URL SHORTENER
class URLShortener {
  constructor() {
    this.urlToCode = new Map();
    this.codeToUrl = new Map();
    this.counter = 0;
  }

  encode(longUrl) {
    if (this.urlToCode.has(longUrl)) return this.urlToCode.get(longUrl);
    const code = this.toBase62(this.counter++);
    this.urlToCode.set(longUrl, code);
    this.codeToUrl.set(code, longUrl);
    return 'http://tiny.url/' + code;
  }

  decode(shortUrl) {
    const code = shortUrl.split('/').pop();
    return this.codeToUrl.get(code);
  }

  toBase62(num) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (num === 0) return '0';
    let result = '';
    while (num > 0) { result = chars[num % 62] + result; num = Math.floor(num / 62); }
    return result;
  }
}

// PROBLEM 16: CONSISTENT HASHING
class ConsistentHash {
  constructor(numReplicas = 3) {
    this.replicas = numReplicas;
    this.ring = new Map(); // hash → server
    this.sortedKeys = [];
  }

  hash(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0x7fffffff;
    return h;
  }

  addServer(server) {
    for (let i = 0; i < this.replicas; i++) {
      const h = this.hash(server + ':' + i);
      this.ring.set(h, server);
      this.sortedKeys.push(h);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  getServer(key) {
    const h = this.hash(key);
    for (const k of this.sortedKeys) {
      if (k >= h) return this.ring.get(k);
    }
    return this.ring.get(this.sortedKeys[0]); // Wrap around
  }
}

// PROBLEM 19: UNDO/REDO
class UndoRedo {
  constructor() { this.undoStack = []; this.redoStack = []; this.state = ''; }

  execute(operation) {
    this.undoStack.push(this.state);
    this.state = operation(this.state);
    this.redoStack = []; // Clear redo after new action
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this.state);
    this.state = this.undoStack.pop();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this.state);
    this.state = this.redoStack.pop();
  }
}`,
      exercise: `**Challenge: Design each system with:**
1. Choose the right data structure — explain WHY
2. Define the API (methods with params and return types)
3. Analyze time and space complexity for each operation
4. Consider edge cases and failure modes
5. How would you scale it to handle 1 million users?

**Pick 5 problems this week and implement them. For each:**
- Write the code
- Test with example scenarios
- Discuss scaling considerations
- Identify which DSA concepts are being applied`,
      commonMistakes: [
        "Choosing the wrong data structure — always start by listing the operations needed and their frequency",
        "Not considering scalability — solutions that work for 100 users may fail at 1M users",
        "Over-engineering — start simple, then iterate with optimizations",
        "Ignoring space complexity — in system design, memory is a real constraint",
        "Not discussing trade-offs — every design has pros and cons; mention them"
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a real-time leaderboard for an online game with millions of players.",
          a: "Use a **sorted data structure** (Redis sorted set = skip list). Insert/update score: O(log n). Get rank: O(log n). Get top K: O(K). Shard by score range for horizontal scaling. Cache top 100 in memory. Update asynchronously for non-critical ranks. Data structures involved: skip list (Redis ZSET), hash map (user → score), heap (top K cache)."
        },
        {
          type: "scenario",
          q: "How would you design a spell checker with 'did you mean?' suggestions?",
          a: "1) Store dictionary in a **Trie** for prefix matching. 2) For spell checking: search trie — O(L). 3) For suggestions: compute **edit distance** ≤ 2 from the input word. Use BFS on the trie exploring character substitutions/insertions/deletions. 4) Rank suggestions by: edit distance, then word frequency. 5) Cache common misspellings → correct mappings in a hash map."
        }
      ]
    },
    {
      id: "capstone-debugging-projects",
      title: "Capstone Project & Debugging Exercises",
      explanation: `The capstone ties everything together. Implement a real-world system that uses MULTIPLE data structures and algorithms working together.

**CAPSTONE PROJECT: Build a Mini Search Engine**

**Requirements:**
1. Build an inverted index from a set of documents (text files or strings)
2. Support multi-word search with AND/OR operations
3. Rank results by TF-IDF relevance score
4. Provide autocomplete suggestions as user types
5. Cache recent searches with LRU cache
6. Handle edge cases: empty queries, special characters, case insensitivity

**Data structures used:**
- Hash Map: inverted index (word → document list)
- Trie: autocomplete suggestions
- LRU Cache: recent search results
- Min-Heap: top-K results by relevance
- Array: document storage
- Set: deduplication

**Debugging Exercises (test your understanding):**
These exercises contain INTENTIONAL bugs. Find and fix them.

1. **Off-by-one binary search** — infinite loop on certain inputs
2. **Stack overflow in tree traversal** — missing base case
3. **LRU cache memory leak** — not deleting from linked list
4. **Incorrect topological sort** — wrong cycle detection
5. **Hash collision causing wrong answers** — using object as key

🏠 **Real-world analogy:** The capstone is like a final exam where you use EVERYTHING you've learned — not one concept in isolation, but combining data structures and algorithms to build a working system.`,
      codeExample: `// CAPSTONE: MINI SEARCH ENGINE
class MiniSearchEngine {
  constructor() {
    this.documents = new Map();          // docId → text
    this.invertedIndex = new Map();       // word → Set<docId>
    this.autocompleteTrie = { children: {} };
    this.searchCache = new LRUSearchCache(100);
    this.docCount = 0;
  }

  // Add a document to the engine
  addDocument(text) {
    const docId = this.docCount++;
    this.documents.set(docId, text);

    const words = this.tokenize(text);
    const wordSet = new Set(words);

    for (const word of wordSet) {
      if (!this.invertedIndex.has(word)) this.invertedIndex.set(word, new Set());
      this.invertedIndex.get(word).add(docId);
      this.insertTrie(word);
    }
  }

  // Search for documents matching query
  search(query) {
    // Check cache first
    const cached = this.searchCache.get(query);
    if (cached) return cached;

    const words = this.tokenize(query);
    if (words.length === 0) return [];

    // AND search — intersect document sets
    let resultDocs = null;
    for (const word of words) {
      const docs = this.invertedIndex.get(word) || new Set();
      resultDocs = resultDocs
        ? new Set([...resultDocs].filter(d => docs.has(d)))
        : new Set(docs);
    }

    // Rank by TF-IDF
    const ranked = this.rankResults([...resultDocs], words);

    // Cache result
    this.searchCache.put(query, ranked);
    return ranked;
  }

  // Autocomplete suggestions
  suggest(prefix) {
    let node = this.autocompleteTrie;
    for (const c of prefix.toLowerCase()) {
      if (!node.children[c]) return [];
      node = node.children[c];
    }
    const results = [];
    this.dfs(node, prefix.toLowerCase(), results);
    return results.slice(0, 5);
  }

  // Internal helpers
  tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\\s+/).filter(w => w.length > 0);
  }

  insertTrie(word) {
    let node = this.autocompleteTrie;
    for (const c of word) {
      if (!node.children[c]) node.children[c] = { children: {}, count: 0 };
      node = node.children[c];
    }
    node.isEnd = true;
    node.count = (node.count || 0) + 1;
  }

  dfs(node, path, results) {
    if (node.isEnd) results.push(path);
    for (const [c, child] of Object.entries(node.children)) {
      if (c !== 'isEnd' && c !== 'count') this.dfs(child, path + c, results);
    }
  }

  rankResults(docIds, queryWords) {
    return docIds.map(docId => ({
      docId,
      score: this.computeTFIDF(docId, queryWords),
      preview: this.documents.get(docId).substring(0, 100)
    })).sort((a, b) => b.score - a.score);
  }

  computeTFIDF(docId, queryWords) {
    const text = this.documents.get(docId);
    const words = this.tokenize(text);
    let score = 0;
    for (const qw of queryWords) {
      const tf = words.filter(w => w === qw).length / words.length;
      const df = (this.invertedIndex.get(qw)?.size || 0);
      const idf = Math.log((this.docCount + 1) / (df + 1));
      score += tf * idf;
    }
    return score;
  }
}

class LRUSearchCache {
  constructor(cap) { this.cap = cap; this.map = new Map(); }
  get(key) { if (!this.map.has(key)) return null; const v = this.map.get(key); this.map.delete(key); this.map.set(key, v); return v; }
  put(key, val) { if (this.map.has(key)) this.map.delete(key); this.map.set(key, val); if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value); }
}

// DEBUGGING EXERCISE #1: Find the bug
function binarySearchBuggy(arr, target) {
  let lo = 0, hi = arr.length; // BUG: should be arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid; // BUG: should be mid - 1 (causes infinite loop)
  }
  return -1;
}`,
      exercise: `**Capstone Project Steps:**
1. Implement the MiniSearchEngine class
2. Add 10+ documents (paragraphs of text)
3. Test search with single and multi-word queries
4. Test autocomplete with various prefixes
5. Verify LRU cache is working (search twice, second should be cached)
6. Add support for OR search (union of document sets)
7. Add stop word filtering (skip 'the', 'a', 'is', etc.)
8. Measure performance: how fast is search with 1000 documents?
9. Add phrase search: "exact phrase" finds documents with exact sequence
10. Write unit tests for each component

**Debugging Challenges:**
1. Fix the binary search bug above — what are the two issues?
2. This DFS has a bug: \`if (!root) return; visit(root); dfs(root.left);\` — what's missing?
3. This LRU cache doesn't evict properly — why?
4. This topological sort gives wrong order — the graph has a cycle but returns a result
5. This hash map uses objects as keys — why does lookup fail?`,
      commonMistakes: [
        "Building the capstone in one giant function — modularize into separate classes",
        "Not testing each component individually before integration",
        "Skipping the debugging exercises — finding bugs is a crucial interview skill",
        "Not measuring performance — understanding real-world speed is important",
        "Over-engineering the capstone — start simple, add features incrementally"
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Walk me through how you would design a search engine from scratch.",
          a: "1) **Ingest**: tokenize documents, build inverted index (word → doc list). 2) **Search**: tokenize query, look up each word in index, intersect results. 3) **Rank**: compute TF-IDF score, return top-K by relevance. 4) **Autocomplete**: build trie from query logs, return top suggestions. 5) **Cache**: LRU cache for frequent queries. 6) **Scale**: shard inverted index by word, replicate for read throughput."
        },
        {
          type: "conceptual",
          q: "What data structures and algorithms does this search engine use?",
          a: "Hash Map (inverted index), Trie (autocomplete), LRU Cache (HashMap + ordered keys), Array (document storage), Set (deduplication, intersection), TF-IDF (ranking algorithm). This demonstrates how real systems compose multiple DSA together — no single data structure solves everything."
        }
      ]
    }
  ]
};

export default dsaPhase5;
