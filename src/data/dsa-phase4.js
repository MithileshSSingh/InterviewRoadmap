const dsaPhase4 = {
  id: "phase-4",
  title: "Phase 4: Advanced Data Structures",
  emoji: "🟠",
  description: "Master trees, BSTs, heaps, graphs, tries, union-find, segment trees, and advanced graph algorithms for top-tier interviews.",
  topics: [
    {
      id: "binary-trees",
      title: "Binary Trees — Traversals & Core Operations",
      explanation: `A **binary tree** is a hierarchical structure where each node has at most **two children** (left and right). Trees are the foundation for BSTs, heaps, tries, and many advanced structures.

**Terminology:**
- **Root**: Top node (no parent)
- **Leaf**: Bottom node (no children)
- **Height**: Longest path from root to leaf
- **Depth**: Distance from root to a node
- **Balanced**: Height difference between left and right subtrees ≤ 1

**Traversals (DFS):**
1. **Inorder** (Left, Root, Right) — gives sorted order for BST
2. **Preorder** (Root, Left, Right) — used for serialization
3. **Postorder** (Left, Right, Root) — used for deletion

**Traversals (BFS):**
- **Level-order** — visit all nodes at depth d before depth d+1

**Key properties:**
- Max nodes at level i: 2ⁱ
- Max total nodes of height h: 2^(h+1) - 1
- Height of balanced tree with n nodes: O(log n)
- Height of skewed tree: O(n)

🏠 **Real-world analogy:** Family tree. You (root) have two children. Each child has two children. To find someone: inorder is alphabetical, preorder answers "who's the boss?", postorder answers "who finishes last?"`,
      codeExample: `// TREE NODE
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// THREE DFS TRAVERSALS — Recursive
function inorder(root, result = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);     // Left → ROOT → Right
  inorder(root.right, result);
  return result;
}

function preorder(root, result = []) {
  if (!root) return result;
  result.push(root.val);     // ROOT → Left → Right
  preorder(root.left, result);
  preorder(root.right, result);
  return result;
}

function postorder(root, result = []) {
  if (!root) return result;
  postorder(root.left, result);
  postorder(root.right, result);
  result.push(root.val);     // Left → Right → ROOT
  return result;
}

// LEVEL ORDER (BFS)
function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const level = [], size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

// MAX DEPTH
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// IS BALANCED
function isBalanced(root) {
  function height(node) {
    if (!node) return 0;
    const left = height(node.left);
    if (left === -1) return -1;
    const right = height(node.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  }
  return height(root) !== -1;
}

// IS SYMMETRIC
function isSymmetric(root) {
  function mirror(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
  }
  return mirror(root?.left, root?.right);
}

// DIAMETER OF BINARY TREE
function diameterOfBinaryTree(root) {
  let diameter = 0;
  function depth(node) {
    if (!node) return 0;
    const left = depth(node.left);
    const right = depth(node.right);
    diameter = Math.max(diameter, left + right);
    return 1 + Math.max(left, right);
  }
  depth(root);
  return diameter;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Implement all three DFS traversals (recursive and iterative)
2. Level-order traversal
3. Maximum depth of a binary tree
4. Check if a binary tree is balanced
5. Check if a binary tree is symmetric
6. Invert a binary tree (mirror)
7. Find the diameter of a binary tree
8. Path sum — does a root-to-leaf path sum to target?
9. Lowest common ancestor of two nodes
10. Serialize and deserialize a binary tree`,
      commonMistakes: [
        "Confusing height (root to leaf) with depth (root to node) — they go in opposite directions",
        "Not handling the null case — every tree recursion must check if root is null",
        "Using BFS when DFS is more natural (or vice versa) — depth questions → DFS, level questions → BFS",
        "Forgetting that inorder of BST gives sorted order — many BST problems reduce to inorder traversal",
        "Modifying tree during traversal without intention — clone first if the original must be preserved"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Find the lowest common ancestor of two nodes in a binary tree.",
          a: "```js\nfunction lca(root, p, q) {\n  if (!root || root === p || root === q) return root;\n  const left = lca(root.left, p, q);\n  const right = lca(root.right, p, q);\n  if (left && right) return root; // p and q in different subtrees\n  return left || right;\n}\n// O(n) time, O(h) space\n```"
        },
        {
          type: "conceptual",
          q: "What are the differences between preorder, inorder, and postorder traversal?",
          a: "**Preorder** (Root→L→R): process root first, good for copying/serializing. **Inorder** (L→Root→R): gives sorted order in BST, good for validation. **Postorder** (L→R→Root): process children first, good for deletion and bottom-up calculations. All are DFS with O(n) time and O(h) space."
        }
      ]
    },
    {
      id: "binary-search-trees",
      title: "Binary Search Trees (BST) — Build, Search, Balance",
      explanation: `A **BST** is a binary tree where for every node: all values in the left subtree are **less than** the node, and all values in the right subtree are **greater than** the node.

**Key operations:**
| Operation | Average | Worst (Skewed) |
|-----------|---------|---------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
| Min/Max | O(log n) | O(n) |

**BST property in interviews:**
- **Inorder traversal gives sorted order** — validate BST, find kth smallest
- **Search is binary search on a tree** — go left if target < node, right if >

**Deletion cases:**
1. **Leaf node** — just remove it
2. **One child** — replace with child
3. **Two children** — replace with inorder successor (or predecessor)

**Balanced BSTs:** AVL trees and Red-Black trees maintain O(log n) height. In interviews, you usually don't implement them but should know they exist.

🏠 **Real-world analogy:** A BST is like a decision tree for finding a word in a dictionary. At each page, decide: go earlier in the alphabet (left) or later (right).`,
      codeExample: `// BST — Full Implementation
class BSTNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}

class BST {
  constructor() { this.root = null; }

  insert(val) {
    const node = new BSTNode(val);
    if (!this.root) { this.root = node; return; }
    let curr = this.root;
    while (true) {
      if (val < curr.val) {
        if (!curr.left) { curr.left = node; return; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = node; return; }
        curr = curr.right;
      }
    }
  }

  search(val) {
    let curr = this.root;
    while (curr) {
      if (val === curr.val) return curr;
      curr = val < curr.val ? curr.left : curr.right;
    }
    return null;
  }

  delete(val) { this.root = this._deleteNode(this.root, val); }

  _deleteNode(root, val) {
    if (!root) return null;
    if (val < root.val) root.left = this._deleteNode(root.left, val);
    else if (val > root.val) root.right = this._deleteNode(root.right, val);
    else {
      if (!root.left) return root.right;   // Case 1 & 2
      if (!root.right) return root.left;    // Case 2
      // Case 3: Two children → replace with inorder successor
      let successor = root.right;
      while (successor.left) successor = successor.left;
      root.val = successor.val;
      root.right = this._deleteNode(root.right, successor.val);
    }
    return root;
  }
}

// VALIDATE BST — Use range checking
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}

// KTH SMALLEST — Inorder traversal (sorted order)
function kthSmallest(root, k) {
  const stack = [];
  let curr = root;
  while (curr || stack.length) {
    while (curr) { stack.push(curr); curr = curr.left; }
    curr = stack.pop();
    k--;
    if (k === 0) return curr.val;
    curr = curr.right;
  }
}

// CONVERT SORTED ARRAY TO BALANCED BST
function sortedArrayToBST(nums) {
  function build(lo, hi) {
    if (lo > hi) return null;
    const mid = (lo + hi) >>> 1;
    const node = new BSTNode(nums[mid]);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  }
  return build(0, nums.length - 1);
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Implement BST with insert, search, and delete
2. Validate if a binary tree is a valid BST
3. Find the minimum and maximum values in a BST
4. Find the kth smallest element in a BST
5. Convert a sorted array to a balanced BST
6. Find the lowest common ancestor in a BST (O(log n))
7. Delete a node from a BST (handle all 3 cases)
8. Find the inorder successor of a node in a BST
9. Find the closest value in a BST to a given target
10. Construct BST from preorder traversal`,
      commonMistakes: [
        "Validating BST by only checking parent-child relationship — must use range (min, max) for the entire subtree",
        "Not handling deletion of nodes with two children — must find inorder successor/predecessor",
        "Inserting duplicates without a clear policy — decide: left, right, or don't allow",
        "Not recognizing that a skewed BST is essentially a linked list — all operations become O(n)",
        "Confusing BST with heap — BST: left < root < right, Heap: parent >= children (max) or parent <= children (min)"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Validate if a binary tree is a valid BST.",
          a: "```js\nfunction isValidBST(root, min = -Infinity, max = Infinity) {\n  if (!root) return true;\n  if (root.val <= min || root.val >= max) return false;\n  return isValidBST(root.left, min, root.val) &&\n         isValidBST(root.right, root.val, max);\n}\n// Pass range [min, max] down — each node must be within range\n// O(n) time, O(h) space\n```"
        },
        {
          type: "conceptual",
          q: "What is the time complexity of BST operations and when do they degrade?",
          a: "Average: O(log n) for search, insert, delete. Worst: O(n) when the tree is **skewed** (all nodes go left or right, like a linked list). This happens when inserting sorted data. Solution: use **self-balancing BSTs** (AVL, Red-Black) which guarantee O(log n) by rebalancing after each operation."
        }
      ]
    },
    {
      id: "heaps-priority-queues",
      title: "Heaps & Priority Queues",
      explanation: `A **heap** is a complete binary tree that satisfies the **heap property**:
- **Max-Heap**: Every parent ≥ its children (root is maximum)
- **Min-Heap**: Every parent ≤ its children (root is minimum)

**Stored as an array** (not a tree with nodes/pointers):
- Parent of i: Math.floor((i - 1) / 2)
- Left child of i: 2 * i + 1
- Right child of i: 2 * i + 2

**Operations:**
| Operation | Complexity |
|-----------|-----------|
| Insert (push) | O(log n) — add at end, bubble up |
| Extract max/min (pop) | O(log n) — swap root with last, bubble down |
| Peek (get max/min) | O(1) |
| Build heap from array | O(n) — NOT O(n log n) |

**Priority Queue** is the abstract concept; Heap is the implementation.

**Key interview patterns:**
1. **Top K elements** — Use min-heap of size k
2. **Kth largest** — Min-heap of size k, root is answer
3. **Merge K sorted lists** — Min-heap of k current elements
4. **Median from stream** — Two heaps: max-heap for lower half, min-heap for upper half
5. **Task scheduler** — Max-heap for frequency counting

🏠 **Real-world analogy:** A hospital ER. The min-heap is the triage list — the most critical patient (smallest severity number) is always treated first, regardless of arrival order.`,
      codeExample: `// MIN-HEAP — Full Implementation
class MinHeap {
  constructor() { this.heap = []; }

  push(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }
    return top;
  }

  peek() { return this.heap[0]; }
  size() { return this.heap.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] <= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _bubbleDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

// TOP K FREQUENT ELEMENTS
function topKFrequent(nums, k) {
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);

  // Bucket sort approach — O(n)
  const buckets = new Array(nums.length + 1).fill(null).map(() => []);
  for (const [num, count] of freq) buckets[count].push(num);

  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    result.push(...buckets[i]);
  }
  return result.slice(0, k);
}

// KTH LARGEST — Min-heap of size k
function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) heap.pop(); // Remove smallest
  }
  return heap.peek(); // Kth largest!
}

// MERGE K SORTED LISTS — Min-heap
function mergeKLists(lists) {
  const heap = new MinHeap(); // Would need custom comparator
  for (let i = 0; i < lists.length; i++) {
    if (lists[i]) heap.push({ val: lists[i].val, node: lists[i], listIdx: i });
  }
  const dummy = { next: null };
  let curr = dummy;
  while (heap.size() > 0) {
    const { node } = heap.pop();
    curr.next = node;
    curr = curr.next;
    if (node.next) heap.push({ val: node.next.val, node: node.next });
  }
  return dummy.next;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Implement a min-heap from scratch with push, pop, peek
2. Find the kth largest element in an array
3. Top K frequent elements
4. Merge K sorted linked lists
5. Sort a nearly sorted array (k-sorted)
6. Find median from data stream (two heaps)
7. Reorganize string so no two adjacent characters are the same
8. Task scheduler — minimum time to complete tasks with cooldown
9. Kth smallest element in a sorted matrix
10. Sliding window median`,
      commonMistakes: [
        "Confusing min-heap and max-heap — for top-K largest use min-heap (counterintuitive!)",
        "Not using the array formula correctly — parent = (i-1)/2, children = 2i+1, 2i+2",
        "Building heap by inserting one-by-one O(n log n) vs heapify O(n) — heapify is faster",
        "JavaScript has no built-in heap — you must implement one or use a library",
        "Confusing heap with BST — heap is NOT sorted, only parent-child ordering is guaranteed"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Find the median from a data stream.",
          a: "```js\nclass MedianFinder {\n  constructor() { this.lo = new MaxHeap(); this.hi = new MinHeap(); }\n  addNum(num) {\n    this.lo.push(num);\n    this.hi.push(this.lo.pop());\n    if (this.hi.size() > this.lo.size()) this.lo.push(this.hi.pop());\n  }\n  findMedian() {\n    return this.lo.size() > this.hi.size()\n      ? this.lo.peek()\n      : (this.lo.peek() + this.hi.peek()) / 2;\n  }\n}\n// lo (max-heap): lower half, hi (min-heap): upper half\n// O(log n) add, O(1) median\n```"
        },
        {
          type: "conceptual",
          q: "Why use a min-heap of size k to find the kth largest element?",
          a: "The min-heap of size k acts as a **filter**: it keeps the k largest elements seen so far. The root (minimum of these k elements) is the kth largest overall. When a new element > root: pop root, push new element → maintains k largest. Final peek = kth largest. Time: O(n log k), Space: O(k)."
        }
      ]
    },
    {
      id: "graphs-fundamentals",
      title: "Graphs — Representations & Fundamentals",
      explanation: `A **graph** is a collection of **nodes (vertices)** connected by **edges**. Graphs model relationships: social networks, maps, dependencies, state machines.

**Graph types:**
- **Directed** vs **Undirected**: One-way or two-way edges
- **Weighted** vs **Unweighted**: Edges have costs or all equal
- **Cyclic** vs **Acyclic**: Contains cycles or not (DAG = Directed Acyclic Graph)
- **Dense** vs **Sparse**: Many edges (|E| ≈ |V|²) or few (|E| ≈ |V|)

**Representations:**
1. **Adjacency List**: Array/Map of lists — O(V + E) space. Best for sparse graphs.
2. **Adjacency Matrix**: 2D array — O(V²) space. Best for dense graphs, quick edge lookup.
3. **Edge List**: Array of [from, to, weight] — simple but slow lookup.

**Key algorithms:**
- **BFS**: Level-by-level, shortest path in unweighted, O(V + E)
- **DFS**: Go deep, detect cycles, topological sort, O(V + E)
- **Dijkstra**: Shortest path, weighted (no negative), O((V+E) log V)
- **Topological Sort**: Order tasks with dependencies (DAG only)
- **Union-Find**: Connected components, cycle detection

🏠 **Real-world analogy:** A city map. Intersections are vertices, roads are edges. One-way streets = directed. Road lengths = weights. Finding shortest route = Dijkstra. Finding if two cities are connected = BFS/DFS.`,
      codeExample: `// GRAPH REPRESENTATIONS

// ADJACENCY LIST (most common)
function buildAdjList(n, edges) {
  const graph = new Map();
  for (let i = 0; i < n; i++) graph.set(i, []);
  for (const [from, to] of edges) {
    graph.get(from).push(to);
    graph.get(to).push(from); // Undirected
  }
  return graph;
}

// ADJACENCY MATRIX
function buildAdjMatrix(n, edges) {
  const matrix = Array.from({length: n}, () => new Array(n).fill(0));
  for (const [from, to, weight = 1] of edges) {
    matrix[from][to] = weight;
    matrix[to][from] = weight; // Undirected
  }
  return matrix;
}

// BFS — O(V + E)
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

// DFS — O(V + E)
function dfs(graph, start) {
  const visited = new Set();
  const order = [];
  function explore(node) {
    visited.add(node);
    order.push(node);
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) explore(neighbor);
    }
  }
  explore(start);
  return order;
}

// SHORTEST PATH — BFS (unweighted)
function shortestPath(graph, start, end) {
  const visited = new Set([start]);
  const queue = [[start, 0]];
  while (queue.length) {
    const [node, dist] = queue.shift();
    if (node === end) return dist;
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return -1; // Not reachable
}

// COUNT CONNECTED COMPONENTS
function countComponents(n, edges) {
  const graph = buildAdjList(n, edges);
  const visited = new Set();
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      bfsVisit(graph, i, visited);
      count++;
    }
  }
  return count;
}

function bfsVisit(graph, start, visited) {
  const queue = [start];
  visited.add(start);
  while (queue.length) {
    const node = queue.shift();
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Build a graph from edge list using adjacency list
2. BFS traversal — print all nodes level by level
3. DFS traversal — recursive and iterative
4. Find if a path exists between two nodes
5. Count connected components in an undirected graph
6. Detect a cycle in an undirected graph
7. Detect a cycle in a directed graph
8. Clone a graph (deep copy)
9. Find all paths from source to target (DAG)
10. Check if a graph is bipartite`,
      commonMistakes: [
        "Forgetting the visited set — leads to infinite loops in cyclic graphs",
        "Using BFS for weighted shortest path — BFS only works for unweighted; use Dijkstra for weighted",
        "Not handling disconnected graphs — BFS/DFS from one node may not reach all nodes",
        "Confusing directed and undirected edge addition — undirected adds both directions",
        "Using adjacency matrix for sparse graphs — wastes O(V²) space when O(V+E) suffices"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When do you use BFS vs DFS in graphs?",
          a: "**BFS**: shortest path (unweighted), level-order, closest node. Uses queue, visits by distance. **DFS**: cycle detection, topological sort, finding all paths, connected components. Uses stack/recursion, goes deep first. Both are O(V+E). BFS uses more memory (stores entire level), DFS uses less but can stack overflow on deep graphs."
        },
        {
          type: "coding",
          q: "Check if an undirected graph contains a cycle.",
          a: "```js\nfunction hasCycle(n, edges) {\n  const g = buildAdjList(n, edges);\n  const visited = new Set();\n  function dfs(node, parent) {\n    visited.add(node);\n    for (const nb of g.get(node)) {\n      if (!visited.has(nb)) { if (dfs(nb, node)) return true; }\n      else if (nb !== parent) return true; // Cycle!\n    }\n    return false;\n  }\n  for (let i = 0; i < n; i++)\n    if (!visited.has(i) && dfs(i, -1)) return true;\n  return false;\n}\n```"
        }
      ]
    },
    {
      id: "graph-algorithms-advanced",
      title: "Advanced Graph Algorithms (Dijkstra, Topological Sort, Union-Find)",
      explanation: `Advanced graph algorithms solve complex real-world problems: navigation, task scheduling, network design, and more.

**Dijkstra's Algorithm — Shortest path (weighted, non-negative):**
- Uses a **priority queue (min-heap)**
- Greedily explore the closest unvisited node
- Time: O((V + E) log V) with binary heap

**Topological Sort — Order tasks with dependencies:**
- Only works on **DAGs** (Directed Acyclic Graphs)
- Two approaches: **DFS-based** (reverse postorder) or **BFS-based** (Kahn's algorithm with in-degrees)
- Used for: build systems, course scheduling, dependency resolution

**Union-Find (Disjoint Set):**
- Track **connected components** dynamically
- Operations: **find(x)** — which component is x in?, **union(x, y)** — merge components
- With **path compression** + **union by rank**: nearly O(1) per operation (amortized)
- Used for: Kruskal's MST, cycle detection, connected components

**Minimum Spanning Tree (MST):**
- Kruskal's: Sort edges, add cheapest that doesn't create cycle (uses Union-Find)
- Prim's: Grow tree from one vertex, always add cheapest edge (uses min-heap)

🏠 **Real-world analogy:** Dijkstra = GPS finding shortest route considering road lengths. Topological sort = course prerequisites — take CS101 before CS201. Union-Find = social network groups merging.`,
      codeExample: `// DIJKSTRA — Shortest path with weights
function dijkstra(graph, start) {
  const dist = new Map();
  const heap = new MinHeap(); // [distance, node]

  dist.set(start, 0);
  heap.push([0, start]);

  while (heap.size()) {
    const [d, u] = heap.pop();
    if (d > (dist.get(u) ?? Infinity)) continue; // Skip outdated

    for (const [v, w] of graph.get(u) || []) {
      const newDist = d + w;
      if (newDist < (dist.get(v) ?? Infinity)) {
        dist.set(v, newDist);
        heap.push([newDist, v]);
      }
    }
  }
  return dist;
}

// TOPOLOGICAL SORT — Kahn's (BFS with in-degrees)
function topologicalSort(n, edges) {
  const graph = new Map();
  const inDegree = new Array(n).fill(0);
  for (let i = 0; i < n; i++) graph.set(i, []);
  for (const [u, v] of edges) {
    graph.get(u).push(v);
    inDegree[v]++;
  }

  const queue = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph.get(node)) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return order.length === n ? order : []; // Empty if cycle exists
}

// UNION-FIND with path compression + union by rank
class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.components = n;
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false; // Already connected
    // Union by rank
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
    this.components--;
    return true;
  }

  connected(x, y) { return this.find(x) === this.find(y); }
}

// COURSE SCHEDULE — Can you finish all courses? (Cycle detection in DAG)
function canFinish(numCourses, prerequisites) {
  return topologicalSort(numCourses, prerequisites).length === numCourses;
}

// NETWORK DELAY TIME — Dijkstra on directed weighted graph
function networkDelayTime(times, n, k) {
  const graph = new Map();
  for (let i = 1; i <= n; i++) graph.set(i, []);
  for (const [u, v, w] of times) graph.get(u).push([v, w]);

  const dist = dijkstra(graph, k);
  if (dist.size < n) return -1; // Not all reachable
  return Math.max(...dist.values());
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Implement Union-Find with path compression and union by rank
2. Course schedule — can you finish all courses? (cycle detection)
3. Course schedule II — find a valid order (topological sort)
4. Network delay time — Dijkstra's shortest path
5. Number of provinces — count connected components
6. Redundant connection — find the edge that creates a cycle
7. Accounts merge — union-find for grouping
8. Cheapest flights within k stops — modified Dijkstra/BFS
9. Swim in rising water — binary search + BFS/Union-Find
10. Minimum spanning tree (Kruskal's algorithm)`,
      commonMistakes: [
        "Using Dijkstra with negative weights — it doesn't work! Use Bellman-Ford instead",
        "Not using path compression in Union-Find — without it, find is O(n) worst case",
        "Topological sort on a cyclic graph — result is incomplete; check if order.length === n",
        "BFS for weighted shortest path — BFS assumes all edges have weight 1; use Dijkstra for weights",
        "Not using a priority queue for Dijkstra — using simple array makes it O(V²) instead of O((V+E)logV)"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Can you finish all courses given prerequisites? [0,1] means course 0 requires course 1.",
          a: "```js\nfunction canFinish(n, prereqs) {\n  const g = new Map();\n  const deg = new Array(n).fill(0);\n  for (let i = 0; i < n; i++) g.set(i, []);\n  for (const [a, b] of prereqs) { g.get(b).push(a); deg[a]++; }\n  const q = [];\n  for (let i = 0; i < n; i++) if (deg[i] === 0) q.push(i);\n  let count = 0;\n  while (q.length) {\n    const node = q.shift(); count++;\n    for (const nb of g.get(node)) { deg[nb]--; if (deg[nb]===0) q.push(nb); }\n  }\n  return count === n;\n}\n// Topological sort — if all nodes processed, no cycle\n```"
        },
        {
          type: "conceptual",
          q: "Explain Union-Find and its optimizations.",
          a: "Union-Find tracks elements in disjoint sets. Two ops: **find(x)** returns the root of x's set, **union(x,y)** merges two sets. Optimizations: 1) **Path compression**: during find, make every node point directly to root → flattens tree. 2) **Union by rank**: attach shorter tree under taller → keeps tree balanced. Together: nearly O(1) per operation (inverse Ackermann)."
        }
      ]
    },
    {
      id: "tries",
      title: "Tries (Prefix Trees)",
      explanation: `A **trie** (pronounced "try") is a tree structure for storing strings where each node represents a character. It enables **O(L)** prefix search (L = length of string), independent of how many strings are stored.

**Structure:**
\`\`\`
        root
       / | \\
      a   b   c
     / \\   \\
    p   n   a
   / \\   \\   \\
  p   e   d   t
  |       |
  l       y
  |
  e
\`\`\`
Words: apple, ape, and, andy, bat, cat

**Operations:**
| Operation | Complexity |
|-----------|-----------|
| Insert | O(L) — L = word length |
| Search | O(L) |
| Prefix search | O(L) |
| Delete | O(L) |

**When to use tries:**
- **Autocomplete** — find all words with a prefix
- **Spell checking** — is this word in the dictionary?
- **Word games** — Scrabble, Boggle, word search
- **IP routing** — longest prefix matching
- **DNA/RNA sequence matching**

🏠 **Real-world analogy:** A trie is like a dictionary organized by letter positions. To find "apple", go to 'a' section, then 'ap', then 'app', then 'appl', then 'apple'. Each level narrows the search by one character.`,
      codeExample: `// TRIE NODE
class TrieNode {
  constructor() {
    this.children = {};   // or new Map()
    this.isEnd = false;   // Marks end of a complete word
  }
}

// TRIE — Full Implementation
class Trie {
  constructor() { this.root = new TrieNode(); }

  // O(L) — Insert word
  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }

  // O(L) — Search exact word
  search(word) {
    const node = this._traverse(word);
    return node !== null && node.isEnd;
  }

  // O(L) — Check if any word starts with prefix
  startsWith(prefix) {
    return this._traverse(prefix) !== null;
  }

  _traverse(s) {
    let node = this.root;
    for (const char of s) {
      if (!node.children[char]) return null;
      node = node.children[char];
    }
    return node;
  }

  // Get all words with given prefix
  autocomplete(prefix) {
    const node = this._traverse(prefix);
    if (!node) return [];
    const results = [];
    function dfs(node, path) {
      if (node.isEnd) results.push(path);
      for (const [char, child] of Object.entries(node.children)) {
        dfs(child, path + char);
      }
    }
    dfs(node, prefix);
    return results;
  }
}

// TypeScript version
class TrieNodeTS {
  children: Map<string, TrieNodeTS> = new Map();
  isEnd: boolean = false;
}

class TrieTS {
  root = new TrieNodeTS();

  insert(word: string): void {
    let node = this.root;
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new TrieNodeTS());
      node = node.children.get(c)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    let node = this.root;
    for (const c of word) {
      if (!node.children.has(c)) return false;
      node = node.children.get(c)!;
    }
    return node.isEnd;
  }
}

// WORD SEARCH II — Trie + Backtracking
function findWords(board, words) {
  const trie = new Trie();
  for (const w of words) trie.insert(w);

  const result = new Set();
  const rows = board.length, cols = board[0].length;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  function dfs(r, c, node, path) {
    if (node.isEnd) { result.add(path); node.isEnd = false; }
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const char = board[r][c];
    if (!node.children[char]) return;
    board[r][c] = '#';
    for (const [dr, dc] of dirs) {
      dfs(r + dr, c + dc, node.children[char], path + char);
    }
    board[r][c] = char;
  }

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      dfs(r, c, trie.root, '');

  return [...result];
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Implement a trie with insert, search, and startsWith
2. Autocomplete — find all words with a given prefix
3. Word dictionary with wildcard search (. matches any character)
4. Replace words — replace words in sentence with shortest dictionary root
5. Longest common prefix using a trie
6. Word search II — find all dictionary words in a grid
7. Maximum XOR of two numbers (using binary trie)
8. Stream of characters — check if suffix forms a word
9. Palindrome pairs — find pairs whose concatenation is palindrome
10. Design a search autocomplete system`,
      commonMistakes: [
        "Not marking word endings — without isEnd flag, 'app' would match when only 'apple' was inserted",
        "Using array[26] when characters aren't just lowercase letters — use Map for general character sets",
        "Confusing search (exact match) with startsWith (prefix match) — different return conditions",
        "Not implementing delete properly — must check if node has other children before removing",
        "High memory usage with sparse tries — consider compressed tries (radix trees) for memory optimization"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Implement a trie with insert, search, and startsWith methods.",
          a: "```js\nclass Trie {\n  constructor() { this.root = {}; }\n  insert(word) {\n    let node = this.root;\n    for (const c of word) { node[c] = node[c] || {}; node = node[c]; }\n    node.isEnd = true;\n  }\n  search(word) {\n    let node = this.root;\n    for (const c of word) { if (!node[c]) return false; node = node[c]; }\n    return !!node.isEnd;\n  }\n  startsWith(prefix) {\n    let node = this.root;\n    for (const c of prefix) { if (!node[c]) return false; node = node[c]; }\n    return true;\n  }\n}\n```"
        },
        {
          type: "conceptual",
          q: "How does a trie achieve O(L) search time regardless of dictionary size?",
          a: "A trie follows the word character by character through the tree, taking O(1) per character (hash map lookup at each node). Total: O(L) where L is the word length. This is independent of how many words are stored (could be millions). In contrast, a hash set gives O(L) average for hashing but O(L × n) worst case for collision resolution. Tries also support prefix matching, which hash sets cannot."
        }
      ]
    }
  ]
};

export default dsaPhase4;
