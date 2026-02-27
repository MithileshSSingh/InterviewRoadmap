const dsaPhase4b = [
  {
    id: "segment-trees",
    title: "Segment Trees — Range Queries & Updates",
    explanation: `A **segment tree** is a binary tree that stores information about array segments, enabling **O(log n)** range queries AND updates. Unlike prefix sum (O(1) query, O(n) update), segment trees balance both.

**Use when you need BOTH:**
- Range queries (sum, min, max over [l, r])
- Point or range updates

**Structure:**
- Leaf nodes: individual array elements
- Internal nodes: aggregate (sum/min/max) of their children's range
- Total nodes: ~4n (use array of size 4n)

**Operations:**
| Operation | Prefix Sum | Segment Tree |
|-----------|-----------|-------------|
| Range query | O(1) | O(log n) |
| Point update | O(n) | O(log n) |
| Range update | O(n) | O(log n) with lazy propagation |
| Build | O(n) | O(n) |

**Lazy Propagation:** For range updates, instead of updating all affected nodes immediately, "lazily" store the pending update and apply it only when that range is queried.

🏠 **Real-world analogy:** A company hierarchy. The CEO (root) knows total revenue. VPs know their division's revenue. Managers know their team's revenue. To find revenue for floors 3-7, you don't ask every employee — you ask the right managers and aggregate.`,
    codeExample: `// SEGMENT TREE — Sum range queries + point updates
class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.build(arr, 1, 0, this.n - 1);
  }

  build(arr, node, start, end) {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this.build(arr, 2 * node, start, mid);
    this.build(arr, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  // Point update: set arr[idx] = val
  update(idx, val, node = 1, start = 0, end = this.n - 1) {
    if (start === end) {
      this.tree[node] = val;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) this.update(idx, val, 2 * node, start, mid);
    else this.update(idx, val, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  // Range query: sum of arr[l..r]
  query(l, r, node = 1, start = 0, end = this.n - 1) {
    if (r < start || end < l) return 0;  // Out of range
    if (l <= start && end <= r) return this.tree[node]; // Fully in range
    const mid = Math.floor((start + end) / 2);
    return this.query(l, r, 2 * node, start, mid) +
           this.query(l, r, 2 * node + 1, mid + 1, end);
  }
}

// USAGE
const arr = [1, 3, 5, 7, 9, 11];
const st = new SegmentTree(arr);
console.log(st.query(1, 3)); // 15 (3 + 5 + 7)
st.update(2, 10);            // arr[2] = 10
console.log(st.query(1, 3)); // 20 (3 + 10 + 7)

// MIN SEGMENT TREE
class MinSegTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(Infinity);
    this.build(arr, 1, 0, this.n - 1);
  }
  build(arr, node, s, e) {
    if (s === e) { this.tree[node] = arr[s]; return; }
    const mid = (s + e) >> 1;
    this.build(arr, 2*node, s, mid);
    this.build(arr, 2*node+1, mid+1, e);
    this.tree[node] = Math.min(this.tree[2*node], this.tree[2*node+1]);
  }
  query(l, r, node = 1, s = 0, e = this.n - 1) {
    if (r < s || e < l) return Infinity;
    if (l <= s && e <= r) return this.tree[node];
    const mid = (s + e) >> 1;
    return Math.min(this.query(l,r,2*node,s,mid), this.query(l,r,2*node+1,mid+1,e));
  }
}`,
    exercise: `**Practice Problems:**
1. Implement a segment tree for range sum queries
2. Implement point updates with the segment tree
3. Implement a min/max segment tree
4. Range sum query with both range update and range query (lazy propagation)
5. Count inversions using a segment tree
6. Find the minimum in a range and update a value
7. Range XOR queries using segment tree
8. Count of elements less than k in a range
9. Merge sort tree (segment tree with sorted lists at each node)
10. Persistent segment tree (conceptual)`,
    commonMistakes: [
      "Using segment tree when prefix sum suffices — if no updates are needed, prefix sum is simpler and faster",
      "Incorrect tree size — always allocate 4*n, not 2*n (the tree can be deeper than expected)",
      "Off-by-one in range endpoints — be consistent with inclusive [l, r] boundaries",
      "Not implementing lazy propagation for range updates — without it, range updates are O(n)",
      "Confusing 0-indexed array with 1-indexed tree — the tree typically starts at index 1"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "When would you use a segment tree over a prefix sum array?",
        a: "Prefix sum: O(1) query, O(n) update — best when data is static. Segment tree: O(log n) for both query AND update — best when data changes frequently. Use segment tree when you need: 1) Both range queries AND point/range updates. 2) Dynamic data that changes between queries. 3) More complex queries (min, max, GCD over a range)."
      },
      {
        type: "coding",
        q: "Implement a range sum segment tree with point update.",
        a: "See the SegmentTree class above. Key: build O(n), query O(log n), update O(log n). Each internal node stores the sum of its range. Query splits into at most O(log n) segments. Update propagates up O(log n) levels to update ancestor sums."
      }
    ]
  },
  {
    id: "binary-indexed-tree",
    title: "Binary Indexed Tree (Fenwick Tree)",
    explanation: `A **Binary Indexed Tree (BIT)** / **Fenwick Tree** provides **O(log n)** prefix sum queries and point updates, like a simpler alternative to segment trees for sum-based problems.

**Key operations:**
- prefix_sum(i): sum of arr[0..i] → O(log n)
- update(i, delta): add delta to arr[i] → O(log n)
- range_sum(l, r): prefix_sum(r) - prefix_sum(l-1) → O(log n)

**How it works (the magic of lowbit):**
- \`lowbit(x) = x & (-x)\` gives the lowest set bit
- Each index i is responsible for a range determined by lowbit(i)
- Index i stores the sum of lowbit(i) elements ending at i
- Query: walk "up" by removing lowbit
- Update: walk "up" by adding lowbit

**BIT vs Segment Tree:**
| Feature | BIT | Segment Tree |
|---------|-----|-------------|
| Code complexity | Simple | Complex |
| Space | O(n) | O(4n) |
| Range query | Sum only | Sum, min, max, etc. |
| Range update | With trick | Lazy propagation |
| Constant factor | Very fast | Somewhat slower |

🏠 **Real-world analogy:** Think of BIT like a cascading summary system. Each node covers a range of elements, but the ranges are cleverly sized so that any prefix sum can be computed by adding at most O(log n) nodes.`,
    codeExample: `// BINARY INDEXED TREE (Fenwick Tree)
class BIT {
  constructor(n) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0); // 1-indexed
  }

  // Add delta to index i (1-indexed)
  update(i, delta) {
    while (i <= this.n) {
      this.tree[i] += delta;
      i += i & (-i); // Add lowbit
    }
  }

  // Prefix sum [1..i]
  query(i) {
    let sum = 0;
    while (i > 0) {
      sum += this.tree[i];
      i -= i & (-i); // Remove lowbit
    }
    return sum;
  }

  // Range sum [l..r] (1-indexed)
  rangeQuery(l, r) {
    return this.query(r) - this.query(l - 1);
  }

  // Build from array
  static fromArray(arr) {
    const bit = new BIT(arr.length);
    for (let i = 0; i < arr.length; i++) {
      bit.update(i + 1, arr[i]); // 1-indexed
    }
    return bit;
  }
}

// USAGE
const bit = BIT.fromArray([1, 3, 5, 7, 9, 11]);
console.log(bit.query(3));       // 9 (1 + 3 + 5)
console.log(bit.rangeQuery(2, 4)); // 15 (3 + 5 + 7)
bit.update(3, 5);                // arr[3] += 5 → [1, 3, 10, 7, 9, 11]
console.log(bit.rangeQuery(2, 4)); // 20 (3 + 10 + 7)

// COUNT INVERSIONS using BIT — O(n log n)
function countInversions(arr) {
  const sorted = [...new Set(arr)].sort((a, b) => a - b);
  const rank = new Map();
  sorted.forEach((v, i) => rank.set(v, i + 1));

  const bit = new BIT(sorted.length);
  let inversions = 0;

  for (let i = arr.length - 1; i >= 0; i--) {
    inversions += bit.query(rank.get(arr[i]) - 1);
    bit.update(rank.get(arr[i]), 1);
  }
  return inversions;
}

// 2D BIT — for matrix range sum queries
class BIT2D {
  constructor(m, n) {
    this.m = m; this.n = n;
    this.tree = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  }
  update(r, c, delta) {
    for (let i = r; i <= this.m; i += i & (-i))
      for (let j = c; j <= this.n; j += j & (-j))
        this.tree[i][j] += delta;
  }
  query(r, c) {
    let sum = 0;
    for (let i = r; i > 0; i -= i & (-i))
      for (let j = c; j > 0; j -= j & (-j))
        sum += this.tree[i][j];
    return sum;
  }
}`,
    exercise: `**Practice Problems:**
1. Implement a BIT with update and prefix sum query
2. Range sum query using BIT
3. Count inversions in an array using BIT
4. Find the number of elements less than k in a subarray
5. Count smaller elements after self
6. Range update, point query using BIT
7. 2D BIT for matrix prefix sums
8. Find kth smallest element using BIT + binary search
9. Count of range sum (how many subarrays have sum in [lo, hi])
10. Reverse pairs using BIT`,
    commonMistakes: [
      "BIT is 1-indexed — index 0 is unused; common source of off-by-one errors",
      "BIT only supports prefix operations efficiently — range operations need subtraction trick",
      "BIT cannot do range min/max — only additive operations (sum, count); use segment tree for min/max",
      "Forgetting to coordinate-compress before using BIT for inversion counting — values may be too large",
      "Not understanding lowbit(x) = x & (-x) — this is the fundamental building block"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "When would you use a BIT over a segment tree?",
        a: "Use BIT when: 1) You only need **prefix queries** (sum, count) — not min/max. 2) You want **simpler code** — BIT is ~10 lines vs 50+ for segment tree. 3) You want better **constant factor** (BIT is faster in practice). Use segment tree when: you need range min/max, lazy propagation for range updates, or more complex queries."
      },
      {
        type: "coding",
        q: "Count the number of inversions in an array efficiently.",
        a: "Use BIT: iterate right-to-left, for each element query how many smaller elements are to its right (already processed). Time: O(n log n). Requires coordinate compression if values are large."
      }
    ]
  },
  {
    id: "balanced-bst",
    title: "Balanced BSTs (AVL, Red-Black — Conceptual)",
    explanation: `Self-balancing BSTs guarantee **O(log n)** operations by maintaining tree height ≈ log n. You likely won't implement them from scratch in interviews, but understanding them is crucial.

**AVL Tree:**
- **Balance factor** = height(left) - height(right), must be {-1, 0, 1}
- After insert/delete, if unbalanced: perform **rotations**
- Rotations: Left, Right, Left-Right, Right-Left
- Strictly balanced → faster lookups than Red-Black
- More rotations per operation → slower insertions

**Red-Black Tree:**
- Each node is Red or Black with rules:
  1. Root is black
  2. No two adjacent red nodes
  3. Every path from root to leaf has same number of black nodes
- Less strictly balanced than AVL → fewer rotations
- Used in: Java TreeMap, C++ std::map, Linux kernel

**AVL vs Red-Black vs Skip List:**
| Feature | AVL | Red-Black | Skip List |
|---------|-----|----------|-----------|
| Height | 1.44 log n | 2 log n | ~log n |
| Lookup | Faster | Slightly slower | Same |
| Insert/Delete | More rotations | Fewer rotations | Simpler |
| Implementation | Complex | Very complex | Moderate |
| Used in | Databases | Language STL | Redis, LevelDB |

**In interviews:** Know WHAT they do, WHY they exist, and WHEN to mention them. You'll almost never implement one from scratch.

🏠 **Real-world analogy:** An AVL tree is like a very strict manager who rebalances the team immediately when one side gets too heavy. A Red-Black tree is a more relaxed manager who allows a bit of imbalance but keeps things within bounds.`,
    codeExample: `// AVL TREE — Conceptual implementation (simplified)
class AVLNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() { this.root = null; }

  height(node) { return node ? node.height : 0; }
  balanceFactor(node) { return this.height(node.left) - this.height(node.right); }
  updateHeight(node) { node.height = 1 + Math.max(this.height(node.left), this.height(node.right)); }

  // RIGHT ROTATION
  rotateRight(y) {
    const x = y.left;
    y.left = x.right;
    x.right = y;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  // LEFT ROTATION
  rotateLeft(x) {
    const y = x.right;
    x.right = y.left;
    y.left = x;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  insert(val) { this.root = this._insert(this.root, val); }

  _insert(node, val) {
    if (!node) return new AVLNode(val);
    if (val < node.val) node.left = this._insert(node.left, val);
    else if (val > node.val) node.right = this._insert(node.right, val);
    else return node; // No duplicates

    this.updateHeight(node);
    const bf = this.balanceFactor(node);

    // Left-Left → Right rotate
    if (bf > 1 && val < node.left.val) return this.rotateRight(node);
    // Right-Right → Left rotate
    if (bf < -1 && val > node.right.val) return this.rotateLeft(node);
    // Left-Right → Left rotate left child, then right rotate
    if (bf > 1 && val > node.left.val) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    // Right-Left → Right rotate right child, then left rotate
    if (bf < -1 && val < node.right.val) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }
    return node;
  }
}

// When you'd mention balanced BSTs in interviews:
// "I'd use a balanced BST here for O(log n) insert + ordered iteration"
// "JavaScript doesn't have a built-in TreeMap, but we could use a sorted array
//  with binary search, or implement a skip list"
// "In production, I'd use a library like 'bintrees' for a Red-Black Tree"`,
    exercise: `**Practice Problems:**
1. Understand and draw all 4 AVL rotation cases (LL, RR, LR, RL)
2. Insert elements 1-7 into an AVL tree and show each rotation
3. Explain why Red-Black trees are preferred in language STLs
4. Implement basic AVL insert with rotations
5. Given a sequence of operations, what does the AVL tree look like after each?
6. Compare the height guarantees of AVL vs Red-Black trees
7. When would you use a balanced BST vs a hash map? (ordering matters!)
8. Implement an order-statistics tree (find kth element in O(log n))
9. Design a data structure that supports insert, delete, and getMedian all in O(log n)
10. Explain the trade-offs between AVL, Red-Black, B-Tree, and Skip List`,
    commonMistakes: [
      "Trying to implement AVL/Red-Black in an interview from scratch — just explain when you'd use them",
      "Not knowing that JavaScript has no built-in ordered set/map — this affects DS selection in interviews",
      "Confusing BST balance with heap property — they're completely different invariants",
      "Using a balanced BST when a hash map suffices — only use BST when you need ordering",
      "Not mentioning balanced BSTs when appropriate — 'I'd use a sorted structure for O(log n) operations'"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "Why do we need self-balancing BSTs? When would you use one?",
        a: "Regular BST degrades to O(n) with sorted input (becomes a linked list). Self-balancing BSTs guarantee O(log n) by rebalancing after operations. Use when you need: 1) **Ordered** data with fast insert/delete/search. 2) **Range queries** (elements between X and Y). 3) **Kth smallest/largest** in dynamic data. Hash maps are faster (O(1)) but don't support ordering."
      },
      {
        type: "conceptual",
        q: "What are the 4 rotation cases in AVL trees?",
        a: "1) **Left-Left (LL)**: left-heavy, left child is left-heavy → right rotate. 2) **Right-Right (RR)**: right-heavy, right child is right-heavy → left rotate. 3) **Left-Right (LR)**: left-heavy, left child is right-heavy → left rotate child, then right rotate. 4) **Right-Left (RL)**: right-heavy, right child is left-heavy → right rotate child, then left rotate."
      }
    ]
  },
  {
    id: "bloom-filters",
    title: "Bloom Filters & Probabilistic Data Structures",
    explanation: `A **Bloom filter** is a space-efficient probabilistic data structure that tests whether an element is **possibly in a set** or **definitely not in a set**.

**Properties:**
- No false negatives — if it says "not present", it's 100% certain
- Possible false positives — if it says "present", it MIGHT be wrong
- Cannot delete elements (standard version)
- Extremely space-efficient — uses a fraction of the memory vs hash set

**How it works:**
1. A bit array of size m, initialized to all 0s
2. k independent hash functions
3. **Insert**: compute k hashes, set those k bit positions to 1
4. **Query**: compute k hashes, check if ALL k positions are 1
   - All 1 → "probably yes" (may be false positive)
   - Any 0 → "definitely no"

**Trade-offs:**
- More bits (m) → lower false positive rate
- More hash functions (k) → sweet spot exists (too many = too many bits set)
- Optimal k = (m/n) × ln(2) where n = expected elements

**Real-world uses:**
- **Chrome**: checks URLs against malware database (millions of URLs, tiny memory)
- **Medium**: recommends articles you haven't read
- **Cassandra/HBase**: avoids disk reads for non-existent rows
- **CDN caching**: quickly check if content is cached
- **Spell checkers**: quick "might be misspelled" check

🏠 **Real-world analogy:** A bouncer with a fuzzy memory. If they say "you're NOT on the list," you're definitely not on the list. If they say "you might be on the list," you could be, but they might be confused with someone else.`,
    codeExample: `// BLOOM FILTER — Implementation
class BloomFilter {
  constructor(size = 1000, numHashes = 3) {
    this.size = size;
    this.numHashes = numHashes;
    this.bits = new Array(size).fill(false);
  }

  // Simple hash functions using different seeds
  _hash(value, seed) {
    let hash = 0;
    const str = String(value);
    for (let i = 0; i < str.length; i++) {
      hash = (hash * seed + str.charCodeAt(i)) % this.size;
    }
    return Math.abs(hash);
  }

  _getPositions(value) {
    const positions = [];
    const seeds = [31, 37, 41, 43, 47, 53, 59];
    for (let i = 0; i < this.numHashes; i++) {
      positions.push(this._hash(value, seeds[i]));
    }
    return positions;
  }

  // Add element
  add(value) {
    for (const pos of this._getPositions(value)) {
      this.bits[pos] = true;
    }
  }

  // Check if element might exist
  mightContain(value) {
    return this._getPositions(value).every(pos => this.bits[pos]);
  }

  // False positive rate ≈ (1 - e^(-kn/m))^k
  estimateFPRate(numElements) {
    const k = this.numHashes;
    const m = this.size;
    return Math.pow(1 - Math.exp(-k * numElements / m), k);
  }
}

// USAGE
const bloom = new BloomFilter(10000, 5);
bloom.add("apple");
bloom.add("banana");
bloom.add("cherry");

console.log(bloom.mightContain("apple"));   // true (definitely added)
console.log(bloom.mightContain("banana"));  // true
console.log(bloom.mightContain("grape"));   // false (definitely NOT added)
console.log(bloom.mightContain("mango"));   // false OR true (false positive possible)

// COUNTING BLOOM FILTER — Supports deletion
class CountingBloomFilter {
  constructor(size = 1000, numHashes = 3) {
    this.size = size;
    this.numHashes = numHashes;
    this.counters = new Array(size).fill(0); // Counters instead of bits
  }

  _getPositions(value) {
    const positions = [];
    const seeds = [31, 37, 41];
    for (let i = 0; i < this.numHashes; i++) {
      let hash = 0;
      const str = String(value);
      for (let j = 0; j < str.length; j++)
        hash = (hash * seeds[i] + str.charCodeAt(j)) % this.size;
      positions.push(Math.abs(hash));
    }
    return positions;
  }

  add(value) { for (const p of this._getPositions(value)) this.counters[p]++; }
  remove(value) { for (const p of this._getPositions(value)) this.counters[p]--; }
  mightContain(value) { return this._getPositions(value).every(p => this.counters[p] > 0); }
}`,
    exercise: `**Practice Problems:**
1. Implement a basic Bloom filter with add and mightContain
2. Calculate the optimal number of hash functions for given m and n
3. Implement a counting Bloom filter that supports deletion
4. Estimate the false positive rate for a given configuration
5. Design a URL shortener that uses a Bloom filter to avoid collisions
6. Use a Bloom filter to find elements in one set but not another
7. Compare memory usage: Bloom filter vs HashSet for 1 million URLs
8. Implement HyperLogLog for approximate distinct count (conceptual)
9. Design a cache system that uses a Bloom filter to avoid cache misses
10. Explain when a Bloom filter is NOT appropriate`,
    commonMistakes: [
      "Assuming Bloom filters have no errors — they DO have false positives (just no false negatives)",
      "Using too few hash functions — increases false positive rate",
      "Using too many hash functions — fills the bit array too quickly, also increases false positives",
      "Trying to delete from a standard Bloom filter — use counting Bloom filter for deletion",
      "Using Bloom filters when exact results are needed — they're probabilistic by design"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "How does a Bloom filter work and what are its trade-offs?",
        a: "A bit array with k hash functions. Insert: set k bit positions. Query: check k positions — all 1 = 'maybe yes', any 0 = 'definitely no'. Trade-offs: **Space-efficient** (bits vs objects), **fast** (O(k) operations), but has **false positives** (can say 'yes' when answer is 'no'). No false negatives. Cannot delete (standard version). False positive rate decreases with more bits, increases with more elements."
      },
      {
        type: "scenario",
        q: "When would you use a Bloom filter in a real system?",
        a: "1) **Database queries**: check if a row exists before expensive disk read. 2) **Web crawlers**: avoid re-crawling URLs. 3) **CDN**: quickly check if content is cached. 4) **Recommendation systems**: filter out already-seen items. 5) **Security**: check if password is in breach list without storing passwords. Best when: set is large, memory is limited, false positives are acceptable."
      }
    ]
  },
  {
    id: "skip-lists",
    title: "Skip Lists — Probabilistic Balanced Structure",
    explanation: `A **skip list** is a probabilistic data structure that provides **O(log n)** search, insert, and delete — like a balanced BST but simpler to implement.

**How it works:**
- Multiple layers of sorted linked lists
- Bottom layer: all elements
- Each higher layer: a random subset (~50%) of the layer below
- Search: start from top layer, move right, drop down when you overshoot

**Visualization:**
\`\`\`
Level 3: HEAD ---------> 25 -------------------> NIL
Level 2: HEAD ------> 10 -> 25 ---------> 50 -> NIL
Level 1: HEAD -> 5 -> 10 -> 25 -> 30 -> 50 -> NIL
Level 0: HEAD -> 3 -> 5 -> 10 -> 15 -> 25 -> 30 -> 42 -> 50 -> NIL
\`\`\`

**Operations — all O(log n) expected:**
- **Search**: Start top-left, go right until overshooting, go down
- **Insert**: Find position, flip coin for height, insert at each level
- **Delete**: Find all references, remove from each level

**Skip List vs Balanced BST:**
| Feature | Skip List | AVL/Red-Black |
|---------|-----------|---------------|
| Complexity | O(log n) expected | O(log n) guaranteed |
| Code complexity | Simple | Very complex |
| Space | O(n) extra pointers | O(n) |
| Range queries | Easy (follow links) | Need inorder traversal |
| Concurrency | Easy to lock-free | Very hard |
| Used in | Redis, LevelDB | Java TreeMap, C++ std::map |

🏠 **Real-world analogy:** Express vs local subway lines. The express line (top layer) has fewer stops and gets you close fast. Then you switch to the local line (bottom layer) for the exact stop. Multiple express lines with different densities speed things up.`,
    codeExample: `// SKIP LIST — Implementation
class SkipNode {
  constructor(val = -Infinity, level = 0) {
    this.val = val;
    this.forward = new Array(level + 1).fill(null); // Pointers at each level
  }
}

class SkipList {
  constructor(maxLevel = 16, p = 0.5) {
    this.maxLevel = maxLevel;
    this.p = p; // Probability of promoting to next level
    this.level = 0; // Current max level in use
    this.head = new SkipNode(-Infinity, maxLevel);
  }

  randomLevel() {
    let lvl = 0;
    while (Math.random() < this.p && lvl < this.maxLevel) lvl++;
    return lvl;
  }

  search(target) {
    let curr = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].val < target) {
        curr = curr.forward[i]; // Move right at current level
      }
      // Drop down to next level
    }
    curr = curr.forward[0]; // At level 0, check exact match
    return curr && curr.val === target ? curr : null;
  }

  insert(val) {
    const update = new Array(this.maxLevel + 1).fill(null);
    let curr = this.head;

    // Find position at each level
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].val < val) {
        curr = curr.forward[i];
      }
      update[i] = curr; // Track rightmost node at each level before insertion point
    }

    const newLevel = this.randomLevel();
    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) {
        update[i] = this.head;
      }
      this.level = newLevel;
    }

    const newNode = new SkipNode(val, newLevel);
    for (let i = 0; i <= newLevel; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }
  }

  delete(val) {
    const update = new Array(this.maxLevel + 1).fill(null);
    let curr = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].val < val) {
        curr = curr.forward[i];
      }
      update[i] = curr;
    }

    curr = curr.forward[0];
    if (!curr || curr.val !== val) return false;

    for (let i = 0; i <= this.level; i++) {
      if (update[i].forward[i] !== curr) break;
      update[i].forward[i] = curr.forward[i];
    }

    while (this.level > 0 && !this.head.forward[this.level]) {
      this.level--;
    }
    return true;
  }
}

// USAGE
const sl = new SkipList();
[3, 6, 7, 9, 12, 19, 17, 26, 21, 25].forEach(v => sl.insert(v));
console.log(sl.search(19)); // Found: SkipNode(19)
console.log(sl.search(15)); // null
sl.delete(19);
console.log(sl.search(19)); // null`,
    exercise: `**Practice Problems:**
1. Implement a basic skip list with search, insert, and delete
2. Visualize skip list construction with random levels
3. Analyze the expected space complexity of a skip list
4. Implement range query in a skip list (find all elements between lo and hi)
5. Compare skip list performance vs balanced BST empirically
6. Implement a concurrent skip list (conceptual — explain lock-free approach)
7. Design an LRU cache using a skip list for O(log n) eviction by time
8. Why does Redis use skip lists instead of Red-Black trees?
9. Implement a skip list with a custom comparator for string elements
10. Compare skip list vs B-tree for disk-based storage`,
    commonMistakes: [
      "Not understanding probabilistic guarantees — O(log n) is expected, not worst-case guaranteed",
      "Using too many levels — maxLevel = log₂(n) is sufficient; more wastes space",
      "Not handling the update array correctly during insertion — must track predecessors at all levels",
      "Comparing skip lists only to arrays — compare to balanced BSTs for a fair assessment",
      "Forgetting that skip lists excel at concurrent access — this is a major real-world advantage"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is a skip list and why would you use it over a balanced BST?",
        a: "A skip list is a multi-level sorted linked list where higher levels act as 'express lanes'. Advantages over balanced BSTs: 1) **Simpler implementation** — no rotations. 2) **Easier concurrency** — lock-free versions are practical. 3) **Range queries** — follow forward pointers. 4) **Memory locality** — linked list nodes can be adjacent. Used in Redis (sorted sets) and LevelDB (memtable)."
      },
      {
        type: "conceptual",
        q: "How does a skip list achieve O(log n) expected time?",
        a: "Each element is promoted to the next level with probability p (usually 0.5). This creates log(n) levels on average. Search starts from the top: each level roughly halves the remaining elements to scan, similar to binary search. Expected comparisons: O(log n). The key insight: randomization replaces the complex rebalancing of AVL/Red-Black trees."
      }
    ]
  },
  {
    id: "monotonic-stack-queue",
    title: "Monotonic Stack & Monotonic Queue",
    explanation: `**Monotonic structures** maintain elements in sorted order (increasing or decreasing). Elements that violate the order are removed. This pattern solves many "next greater/smaller" and "sliding window extremum" problems in O(n).

**Monotonic Stack:**
- Maintain elements in monotonically increasing (or decreasing) order
- When a new element arrives, pop all elements that violate the ordering
- Each element is pushed and popped at most once → O(n) total

**Use cases:**
- **Next Greater Element**: For each element, find the first larger element to its right
- **Daily Temperatures**: How many days until a warmer day?
- **Largest Rectangle in Histogram**: Find the largest rectangle
- **Stock Span**: How many consecutive days the stock was ≤ today?

**Monotonic Queue (Deque):**
- Maintain elements in monotonically decreasing order (for max)
- Front of deque is always the maximum in the current window
- Used for **sliding window maximum/minimum** in O(n)

🏠 **Real-world analogy:** Monotonic stack is like a line of people where shorter people behind a tall person leave — only the "stepping stone" heights remain. Monotonic queue is like keeping track of the tallest person visible in a moving window.`,
    codeExample: `// NEXT GREATER ELEMENT — Monotonic decreasing stack
function nextGreaterElement(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = []; // Stores indices

  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop();
      result[idx] = nums[i]; // nums[i] is the next greater for nums[idx]
    }
    stack.push(i);
  }
  return result;
}
// [4,5,2,10,8] → [5,10,10,-1,-1]

// DAILY TEMPERATURES
function dailyTemperatures(temps) {
  const result = new Array(temps.length).fill(0);
  const stack = []; // Mono decreasing stack of indices

  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const idx = stack.pop();
      result[idx] = i - idx; // Days until warmer
    }
    stack.push(i);
  }
  return result;
}

// LARGEST RECTANGLE IN HISTOGRAM — Classic monotonic stack
function largestRectangleInHistogram(heights) {
  const stack = []; // Mono increasing stack of indices
  let maxArea = 0;
  heights.push(0); // Sentinel to flush remaining

  for (let i = 0; i < heights.length; i++) {
    while (stack.length && heights[i] < heights[stack[stack.length - 1]]) {
      const h = heights[stack.pop()];
      const w = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, h * w);
    }
    stack.push(i);
  }
  heights.pop(); // Remove sentinel
  return maxArea;
}

// SLIDING WINDOW MAXIMUM — Monotonic deque O(n)
function maxSlidingWindow(nums, k) {
  const deque = []; // Stores indices, maintains decreasing order of values
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    // Remove elements outside window
    while (deque.length && deque[0] <= i - k) deque.shift();
    // Remove elements smaller than current (they'll never be max)
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]); // Front is always max
  }
  return result;
}
// [1,3,-1,-3,5,3,6,7] k=3 → [3,3,5,5,6,7]`,
    exercise: `**Practice Problems (Easy → Hard):**
1. Next greater element (single array)
2. Next greater element (circular array)
3. Daily temperatures
4. Stock span — how many consecutive days stock ≤ today?
5. Largest rectangle in histogram
6. Maximal rectangle in binary matrix
7. Sliding window maximum
8. Shortest subarray with sum ≥ k (deque + prefix sum)
9. Sum of subarray minimums (contribution technique)
10. Trapping rain water using monotonic stack`,
    commonMistakes: [
      "Not recognizing the monotonic pattern — keywords: 'next greater', 'next smaller', 'sliding max/min'",
      "Storing values in stack instead of indices — indices are needed to compute distances and window bounds",
      "Forgetting sentinel values — adding 0 at the end of histogram heights ensures all bars are processed",
      "Confusing increasing vs decreasing stack — for 'next greater', use decreasing (pop when element is greater)",
      "Not understanding amortized O(n) — each element enters/exits the stack at most once → total O(n)"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Find the largest rectangle in a histogram.",
        a: "```js\nfunction largestRect(h) {\n  const s = [];\n  let max = 0;\n  h.push(0);\n  for (let i = 0; i < h.length; i++) {\n    while (s.length && h[i] < h[s[s.length-1]]) {\n      const height = h[s.pop()];\n      const width = s.length ? i - s[s.length-1] - 1 : i;\n      max = Math.max(max, height * width);\n    }\n    s.push(i);\n  }\n  h.pop();\n  return max;\n}\n// O(n) — each bar pushed/popped once\n```"
        },
      {
        type: "conceptual",
        q: "How does a monotonic deque solve sliding window maximum in O(n)?",
        a: "The deque stores indices in decreasing order of values. For each new element: 1) Remove indices outside the window from the front. 2) Remove indices of smaller elements from the back (they'll never be the max). 3) Push current index. The front of the deque is always the maximum of the current window. Each element enters and leaves the deque at most once → O(n) total."
      }
    ]
  }
];

export default dsaPhase4b;
