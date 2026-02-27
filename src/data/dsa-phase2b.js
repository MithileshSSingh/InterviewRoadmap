const dsaPhase2b = [
  {
    id: "sets-and-maps",
    title: "Sets & Maps — Built-in & Custom",
    explanation: `**Set** stores unique values — no duplicates allowed. **Map** stores key-value pairs with any key type. Both are critical for O(1) lookups in interviews.

**JavaScript Set:**
- \`add(value)\` — O(1)
- \`has(value)\` — O(1) — THE reason to use sets
- \`delete(value)\` — O(1)
- \`size\` — number of unique elements
- Iterable — supports for...of, spread, forEach

**JavaScript Map:**
- \`set(key, value)\` — O(1)
- \`get(key)\` — O(1)
- \`has(key)\` — O(1)
- \`delete(key)\` — O(1)
- Any key type (objects, functions, primitives)
- Preserves insertion order

**Set operations:**
- **Union**: A ∪ B = all elements in either
- **Intersection**: A ∩ B = elements in both
- **Difference**: A − B = elements only in A
- **Symmetric Difference**: elements in one but not both

**When to use:**
- Need to check existence fast → Set
- Need to count occurrences → Map
- Need to remove duplicates → Set
- Need key-value association → Map

🏠 **Real-world analogy:** A Set is like a guest list — each name appears once. A Map is like a phone book — each name maps to a phone number.`,
    codeExample: `// SET — Unique values, O(1) lookup
const set = new Set([1, 2, 3, 2, 1]);
console.log(set);         // Set { 1, 2, 3 }
console.log(set.has(2));  // true — O(1)!
set.add(4);
set.delete(1);
console.log([...set]);    // [2, 3, 4]

// Remove duplicates from array — one-liner!
const unique = [...new Set([1, 2, 2, 3, 3, 3])]; // [1, 2, 3]

// SET OPERATIONS
function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a, ...b]);
}
function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => b.has(x)));
}
function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => !b.has(x)));
}

// MAP — Key-value, any key type
const map = new Map<string, number>();
map.set("alice", 30);
map.set("bob", 25);
console.log(map.get("alice")); // 30
console.log(map.has("charlie")); // false

// Frequency counter with Map
function frequency(arr: number[]): Map<number, number> {
  const freq = new Map<number, number>();
  for (const n of arr) {
    freq.set(n, (freq.get(n) || 0) + 1);
  }
  return freq;
}

// WEAKMAP & WEAKSET — Keys can be garbage collected
const weakMap = new WeakMap<object, string>();
let obj = { id: 1 };
weakMap.set(obj, "data");
obj = null; // Object can now be GC'd — WeakMap won't prevent it

// Check if array has duplicates — O(n) with Set
function hasDuplicates<T>(arr: T[]): boolean {
  return new Set(arr).size !== arr.length;
}

// Find common elements between two arrays
function commonElements(a: number[], b: number[]): number[] {
  const setA = new Set(a);
  return b.filter(x => setA.has(x));
}`,
    exercise: `**Practice Problems:**
1. Remove duplicates from an array using a Set
2. Find the intersection of two arrays
3. Find the union of two arrays (no duplicates)
4. Implement Set operations: union, intersection, difference
5. Check if one array is a subset of another
6. Count unique elements in an array
7. Find the first duplicate in an array using a Set
8. Group elements by frequency using a Map
9. Find all pairs with a given sum using a Set
10. Implement a simple cache using Map with TTL (time-to-live)`,
    commonMistakes: [
      "Using Object instead of Map for non-string keys — Object keys are always strings",
      "Forgetting that Set uses === for comparison — objects are compared by reference, not value",
      "Not knowing WeakMap/WeakSet — use them for caching to avoid memory leaks",
      "Assuming Set preserves insertion order for numbers — it does in JS, but don't rely on this in algorithms",
      "Using Array.includes() for repeated lookups — O(n) per check; convert to Set for O(1)"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Find the intersection of two arrays (each element in result must be unique).",
        a: "```js\nfunction intersection(a, b) {\n  const setA = new Set(a);\n  const result = new Set();\n  for (const x of b) {\n    if (setA.has(x)) result.add(x);\n  }\n  return [...result];\n}\n// O(n + m) time, O(min(n,m)) space\n```"
      },
      {
        type: "conceptual",
        q: "What is the difference between Map and Object in JavaScript?",
        a: "**Map**: any key type, has .size, preserves insertion order, no prototype chain, iterable. **Object**: string/Symbol keys only, no .size, has prototype (can collide with 'toString' etc.), not directly iterable. Use Map for data dictionaries, Object for structured records."
      }
    ]
  },
  {
    id: "recursion-based-structures",
    title: "Recursion-Based Structures (Linked List Ops, Nested Structures)",
    explanation: `Many data structure operations are naturally recursive. Understanding how to think recursively about linked lists, nested arrays, and tree-like structures is essential for interviews.

**Why recursion fits certain structures:**
- **Linked lists** are recursive by definition: a node + a smaller linked list
- **Nested arrays/objects** have unknown depth — recursion handles any depth
- **Trees** are recursive: a node + left subtree + right subtree

**The recursive linked list mental model:**
\`\`\`
[1] → [2] → [3] → null
 ↓
 1 + recurse([2] → [3] → null)
       ↓
       2 + recurse([3] → null)
             ↓
             3 + recurse(null) → base case: 0
\`\`\`

**Key patterns:**
1. **Process current node + recurse on rest** (linked list sum, length, contains)
2. **Recurse first, then process** (reverse linked list, reverse nested)
3. **Recurse on all children** (flatten nested arrays, deep clone objects)
4. **Divide into halves** (merge sort on linked list)

🏠 **Real-world analogy:** Recursion on a linked list is like a relay race — each runner (node) does their part and passes the baton (result) to the next runner. The last runner (base case) sends the result back.`,
    codeExample: `// RECURSIVE LINKED LIST OPERATIONS

class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Sum all values — recursively
function sumList(head) {
  if (!head) return 0;                    // Base case
  return head.val + sumList(head.next);    // Current + rest
}

// Reverse linked list — recursively
function reverseListRecursive(head) {
  if (!head || !head.next) return head;   // Base case
  const newHead = reverseListRecursive(head.next); // Recurse to end
  head.next.next = head;                   // Reverse pointer
  head.next = null;                        // Clean old pointer
  return newHead;
}

// Check if linked list contains value
function contains(head, target) {
  if (!head) return false;
  if (head.val === target) return true;
  return contains(head.next, target);
}

// DEEP FLATTEN NESTED ARRAYS
function deepFlatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...deepFlatten(item));  // Recurse into nested
    } else {
      result.push(item);
    }
  }
  return result;
}
// [1, [2, [3, [4]], 5]] → [1, 2, 3, 4, 5]

// DEEP CLONE OBJECTS — handles nested objects/arrays
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  const clone = {};
  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key]);
  }
  return clone;
}

// TypeScript — Deep nested sum
interface NestedInteger {
  value?: number;
  list?: NestedInteger[];
}

function nestedSum(nested: NestedInteger[]): number {
  let total = 0;
  for (const item of nested) {
    if (item.value !== undefined) {
      total += item.value;
    } else if (item.list) {
      total += nestedSum(item.list);
    }
  }
  return total;
}

// MERGE SORT ON LINKED LIST — Divide & Conquer
function mergeSortList(head) {
  if (!head || !head.next) return head;
  const mid = getMiddle(head);
  const right = mid.next;
  mid.next = null; // Split
  return mergeTwoLists(mergeSortList(head), mergeSortList(right));
}

function getMiddle(head) {
  let slow = head, fast = head.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
    else { curr.next = l2; l2 = l2.next; }
    curr = curr.next;
  }
  curr.next = l1 || l2;
  return dummy.next;
}`,
    exercise: `**Practice Problems:**
1. Find the length of a linked list recursively
2. Print a linked list in reverse order (without reversing it) using recursion
3. Deep flatten a nested array of any depth
4. Deep clone a nested object (handle arrays, objects, primitives)
5. Recursively sum all numbers in a nested structure like NestedInteger
6. Sort a linked list using merge sort (recursive divide & conquer)
7. Remove all occurrences of a value from a linked list recursively
8. Check if two nested structures are deeply equal
9. Recursively find the maximum depth of a nested array
10. Convert a nested list to a flat list preserving order`,
    commonMistakes: [
      "Not identifying the base case for recursive linked list operations — it's usually !head or !head.next",
      "Forgetting to return the new head after recursive reversal — the recursion returns the new head all the way up",
      "Stack overflow on deeply nested structures — convert to iterative with explicit stack for very deep nesting",
      "Modifying the original data structure when a deep clone is needed — always create new nodes/objects",
      "Not handling circular references in deep clone — add a visited set for production code"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Reverse a linked list recursively. Explain how it works.",
        a: "```js\nfunction reverse(head) {\n  if (!head || !head.next) return head;\n  const newHead = reverse(head.next);\n  head.next.next = head; // Make next node point back\n  head.next = null;       // Remove old forward pointer\n  return newHead;          // Return from deepest call\n}\n// Each frame reverses one pointer. newHead propagates \n// back unchanged from the tail.\n```"
      },
      {
        type: "conceptual",
        q: "Why is a linked list a naturally recursive data structure?",
        a: "A linked list is either: 1) empty (null) — base case, or 2) a node followed by a smaller linked list — recursive case. This matches the recursive definition perfectly. Every linked list operation can be expressed as: handle current node + recurse on rest. This is why many interview solutions use recursion on linked lists."
      }
    ]
  },
  {
    id: "matrix-2d-arrays",
    title: "Matrices & 2D Arrays",
    explanation: `A **matrix** (2D array) is an array of arrays — representing grids, tables, images, game boards, and graph adjacency.

**Key concepts:**
- Access: \`matrix[row][col]\` — O(1)
- Dimensions: rows = \`matrix.length\`, cols = \`matrix[0].length\`
- Total elements: rows × cols

**Common matrix patterns in interviews:**
1. **Traversal**: Row-wise, column-wise, diagonal, spiral
2. **Search**: Binary search in sorted matrix
3. **DFS/BFS**: Island counting, flood fill, shortest path in grid
4. **In-place modification**: Rotate 90°, set zeroes
5. **Dynamic programming**: Grid paths, minimum path sum

**Direction arrays (essential for grid problems):**
\`\`\`js
// 4 directions: up, down, left, right
const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
// 8 directions: include diagonals
const dirs8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
\`\`\`

🏠 **Real-world analogy:** A spreadsheet is a 2D array — rows and columns with data at each cell. Image processing works on 2D pixel matrices. Game boards (chess, sudoku) are 2D grids.`,
    codeExample: `// CREATE AND TRAVERSE A MATRIX
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// Row-wise traversal
for (let r = 0; r < matrix.length; r++) {
  for (let c = 0; c < matrix[0].length; c++) {
    console.log(matrix[r][c]);
  }
}

// SPIRAL ORDER TRAVERSAL
function spiralOrder(matrix: number[][]): number[] {
  const result: number[] = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++) result.push(matrix[top][i]);
    top++;
    for (let i = top; i <= bottom; i++) result.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (let i = right; i >= left; i--) result.push(matrix[bottom][i]);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) result.push(matrix[i][left]);
      left++;
    }
  }
  return result;
}

// ROTATE MATRIX 90° CLOCKWISE — In-place O(1) space
function rotate(matrix: number[][]): void {
  const n = matrix.length;
  // Step 1: Transpose (swap rows and columns)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  // Step 2: Reverse each row
  for (const row of matrix) row.reverse();
}

// COUNT ISLANDS — Grid DFS
function numIslands(grid: string[][]): number {
  let count = 0;
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  function dfs(r: number, c: number): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // Mark visited
    for (const [dr, dc] of dirs) dfs(r + dr, c + dc);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') { count++; dfs(r, c); }
    }
  }
  return count;
}

// SEARCH IN SORTED MATRIX — O(m + n)
function searchMatrix(matrix: number[][], target: number): boolean {
  let row = 0, col = matrix[0].length - 1; // Start top-right
  while (row < matrix.length && col >= 0) {
    if (matrix[row][col] === target) return true;
    if (matrix[row][col] > target) col--;
    else row++;
  }
  return false;
}`,
    exercise: `**Practice Problems (Easy → Hard):**
1. Traverse a matrix in spiral order
2. Rotate a matrix 90 degrees clockwise in-place
3. Set entire row and column to 0 if any element is 0
4. Count the number of islands in a grid (connected 1s)
5. Search for a target in a row-wise and column-wise sorted matrix
6. Find the shortest path in a binary maze (BFS)
7. Word search — find if a word exists in a grid (backtracking)
8. Flood fill (paint bucket tool in image editors)
9. Maximum sum rectangle in a 2D matrix
10. Compute the diagonal sum of a matrix`,
    commonMistakes: [
      "Confusing row and column indices — matrix[row][col], not matrix[x][y]",
      "Not checking bounds before accessing neighbors — always verify r >= 0, r < rows, c >= 0, c < cols",
      "Forgetting to mark visited cells in grid DFS/BFS — leads to infinite loops",
      "Modifying the input grid when the problem doesn't allow it — use a visited set instead",
      "Creating a matrix with shared row references — `new Array(3).fill(new Array(3).fill(0))` shares the SAME inner array"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Rotate a matrix 90° clockwise in-place without extra space.",
        a: "```js\nfunction rotate(matrix) {\n  const n = matrix.length;\n  // Transpose\n  for (let i = 0; i < n; i++)\n    for (let j = i + 1; j < n; j++)\n      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];\n  // Reverse each row\n  for (const row of matrix) row.reverse();\n}\n// O(n²) time, O(1) space\n```"
      },
      {
        type: "conceptual",
        q: "How do you search efficiently in a matrix where rows and columns are sorted?",
        a: "Start from the **top-right corner** (or bottom-left). If current > target: move left (smaller). If current < target: move down (larger). This eliminates one row or column per step → O(m + n) time. This works because sorted rows go left→right increasing, columns go top→bottom increasing."
      }
    ]
  },
  {
    id: "sorting-algorithms",
    title: "Sorting Algorithms (Bubble, Selection, Insertion, Merge, Quick)",
    explanation: `Sorting is the most fundamental algorithm category. Understanding sorting teaches you divide & conquer, recursion, time-space tradeoffs, and stability.

**The Big Five:**

| Algorithm | Time (Best) | Time (Avg) | Time (Worst) | Space | Stable? |
|-----------|------------|-----------|-------------|-------|---------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |

**When to use each:**
- **Insertion Sort**: Small arrays, nearly sorted data, online sorting (TimSort uses it!)
- **Merge Sort**: Need guaranteed O(n log n), need stability, linked lists
- **Quick Sort**: General purpose, best cache performance, in-place

**Stability** means equal elements keep their original relative order. Important when sorting by multiple criteria (sort by name, then by age — stable sort preserves name order for same ages).

**Key insight:** No comparison-based sort can do better than O(n log n). This is a proven lower bound. Non-comparison sorts (counting, radix, bucket) can achieve O(n) for special inputs.

🏠 **Real-world analogy:** Bubble sort is like repeatedly walking through a line and swapping people who are out of order. Merge sort is like splitting a deck of cards in half, sorting each half, then merging them back. Quick sort is like picking a pivot person and sending everyone shorter to the left, taller to the right.`,
    codeExample: `// BUBBLE SORT — O(n²), simple but slow
function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Optimization: already sorted
  }
  return arr;
}

// INSERTION SORT — O(n) best case for nearly sorted
function insertionSort(arr: number[]): number[] {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

// MERGE SORT — O(n log n) guaranteed, stable
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

// QUICK SORT — O(n log n) average, in-place
function quickSort(arr: number[], lo = 0, hi = arr.length - 1): number[] {
  if (lo < hi) {
    const pivotIdx = partition(arr, lo, hi);
    quickSort(arr, lo, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, hi);
  }
  return arr;
}

function partition(arr: number[], lo: number, hi: number): number {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}

// SELECTION SORT — O(n²), minimizes swaps
function selectionSort(arr: number[]): number[] {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
    exercise: `**Practice Problems:**
1. Implement bubble sort with early termination optimization
2. Implement insertion sort and test on a nearly-sorted array
3. Implement merge sort and trace the recursive calls
4. Implement quick sort with the Lomuto partition scheme
5. Sort an array of 0s, 1s, and 2s in-place (Dutch National Flag)
6. Find the kth largest element using quick select (partial quick sort)
7. Merge k sorted arrays using merge sort approach
8. Sort a linked list using merge sort
9. Implement counting sort for integers in range [0, k]
10. Sort an array by frequency of elements`,
    commonMistakes: [
      "Using bubble sort in production — it's O(n²); use the language's built-in sort (usually Timsort or Introsort)",
      "Choosing quick sort without randomization — sorted input gives O(n²) with fixed pivot",
      "Forgetting that merge sort needs O(n) extra space — important for space-constrained systems",
      "Not understanding stability — can cause bugs when sorting objects by multiple fields",
      "Implementing quick sort recursively on already-sorted large arrays — can cause stack overflow"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "Compare merge sort and quick sort. When would you choose each?",
        a: "**Merge Sort**: O(n log n) guaranteed, stable, great for linked lists, but O(n) extra space. **Quick Sort**: O(n log n) average, in-place (O(log n) space), better cache locality, but O(n²) worst case. Choose merge sort when you need stability or guaranteed performance. Choose quick sort for general-purpose in-memory sorting."
      },
      {
        type: "coding",
        q: "Sort an array of 0s, 1s, and 2s in-place with O(n) time and O(1) space.",
        a: "```js\nfunction sortColors(nums) {\n  let lo = 0, mid = 0, hi = nums.length - 1;\n  while (mid <= hi) {\n    if (nums[mid] === 0) {\n      [nums[lo], nums[mid]] = [nums[mid], nums[lo]];\n      lo++; mid++;\n    } else if (nums[mid] === 1) {\n      mid++;\n    } else {\n      [nums[mid], nums[hi]] = [nums[hi], nums[mid]];\n      hi--;\n    }\n  }\n}\n// Dutch National Flag algorithm — 3-way partitioning\n```"
      }
    ]
  },
  {
    id: "searching-algorithms",
    title: "Searching Algorithms (Linear & Binary Search)",
    explanation: `Searching is the other fundamental algorithm category. The leap from O(n) linear search to O(log n) binary search is one of the most important optimizations in computing.

**Linear Search — O(n):**
- Check each element one by one
- Works on unsorted data
- Best for small arrays or one-time searches

**Binary Search — O(log n):**
- Requires **sorted** data
- Halves search space each step
- log₂(1,000,000) ≈ 20 — only 20 comparisons for a million elements!

**Binary search template (the bug-free version):**
\`\`\`
lo = 0, hi = n - 1
while (lo <= hi):
    mid = lo + (hi - lo) / 2
    if found: return mid
    if target > mid: lo = mid + 1
    else: hi = mid - 1
\`\`\`

**Binary search variants:**
1. Find exact value
2. Find first occurrence (leftmost)
3. Find last occurrence (rightmost)
4. Find insertion point (lower bound / upper bound)
5. Search on answer (binary search on the answer space)

🏠 **Real-world analogy:** Linear search is reading a phone book one name at a time. Binary search is opening to the middle, deciding if your name is before or after, then doing the same on the half — like how you actually use a dictionary.`,
    codeExample: `// LINEAR SEARCH — O(n)
function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// BINARY SEARCH — O(log n), standard template
function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

// FIND FIRST OCCURRENCE (leftmost)
function findFirst(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      result = mid;    // Found, but keep searching left
      hi = mid - 1;
    } else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

// FIND LAST OCCURRENCE (rightmost)
function findLast(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      result = mid;    // Found, but keep searching right
      lo = mid + 1;
    } else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

// SEARCH IN ROTATED SORTED ARRAY
function searchRotated(nums: number[], target: number): number {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) { // Left half is sorted
      if (target >= nums[lo] && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else { // Right half is sorted
      if (target > nums[mid] && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

// BINARY SEARCH ON ANSWER — "Find minimum X such that condition is true"
// Example: minimum capacity to ship packages in D days
function shipWithinDays(weights: number[], days: number): number {
  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canShip(weights, days, mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

function canShip(weights: number[], days: number, capacity: number): boolean {
  let daysNeeded = 1, currentLoad = 0;
  for (const w of weights) {
    if (currentLoad + w > capacity) {
      daysNeeded++;
      currentLoad = 0;
    }
    currentLoad += w;
  }
  return daysNeeded <= days;
}`,
    exercise: `**Practice Problems (Easy → Hard):**
1. Implement binary search (iterative and recursive)
2. Find the first and last position of a target in a sorted array
3. Search in a rotated sorted array
4. Find the square root of a number using binary search (integer)
5. Find peak element in an array (element greater than neighbors)
6. Find minimum in a rotated sorted array
7. Search a 2D sorted matrix using binary search
8. Koko eating bananas — binary search on answer
9. Split array largest sum — binary search on answer
10. Median of two sorted arrays — O(log(min(m,n)))`,
    commonMistakes: [
      "Off-by-one errors: using `lo < hi` when you need `lo <= hi` (or vice versa)",
      "Integer overflow in `(lo + hi) / 2` — use `lo + (hi - lo) / 2` instead",
      "Applying binary search to unsorted data — it REQUIRES sorted input (or a monotonic condition)",
      "Not handling duplicates properly — standard binary search finds ANY occurrence, not first/last",
      "Forgetting the 'binary search on answer' pattern — many optimization problems use it"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Search in a rotated sorted array. [4,5,6,7,0,1,2], target=0 → 4",
        a: "```js\nfunction search(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >>> 1;\n    if (nums[mid] === target) return mid;\n    if (nums[lo] <= nums[mid]) {\n      if (target >= nums[lo] && target < nums[mid]) hi = mid - 1;\n      else lo = mid + 1;\n    } else {\n      if (target > nums[mid] && target <= nums[hi]) lo = mid + 1;\n      else hi = mid - 1;\n    }\n  }\n  return -1;\n}\n```"
      },
      {
        type: "conceptual",
        q: "What is 'binary search on the answer space' and when do you use it?",
        a: "Instead of searching for an element in an array, you binary search for the **optimal answer** in a range. Pattern: 1) Define lo and hi as the min/max possible answer. 2) Check if mid satisfies the condition. 3) Narrow the range. Used for: 'minimum capacity to ship in D days', 'split array to minimize largest sum', 'Koko eating bananas'. The condition must be **monotonic** (once true, stays true)."
      }
    ]
  },
  {
    id: "two-pointers-pattern",
    title: "Two Pointers Pattern",
    explanation: `The **two pointers** technique uses two references to iterate through a data structure, usually moving toward each other or in the same direction. It often reduces O(n²) to O(n).

**Three types of two pointers:**

1. **Opposite direction** (converging): One at start, one at end, move inward
   - Palindrome check, two sum in sorted array, container with most water

2. **Same direction** (fast-slow): Both start at beginning, one moves faster
   - Remove duplicates, partition, move zeros, linked list cycle detection

3. **Sliding window** (covered in next topic): Left and right define a window
   - Max sum subarray, longest substring, minimum window

**When to recognize two pointers:**
- Array is SORTED and you need to find pairs
- Need to compare elements from both ends
- Need to partition or rearrange in-place
- Need to process elements with O(1) extra space

🏠 **Real-world analogy:** Two pointers is like squeezing toothpaste — one hand at the bottom, one hand moves toward it. Or like two people searching a hallway from opposite ends — they meet somewhere in the middle.`,
    codeExample: `// OPPOSITE DIRECTION — Two Sum in sorted array
function twoSumSorted(arr: number[], target: number): [number, number] | null {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return null;
}
// O(n) time, O(1) space — vs O(n²) brute force!

// OPPOSITE — Container with most water
function maxArea(height: number[]): number {
  let left = 0, right = height.length - 1, maxWater = 0;
  while (left < right) {
    const water = Math.min(height[left], height[right]) * (right - left);
    maxWater = Math.max(maxWater, water);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxWater;
}

// SAME DIRECTION — Remove duplicates from sorted array
function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1; // Length of unique portion
}

// SAME DIRECTION — Move zeros to end
function moveZeros(nums: number[]): void {
  let insertPos = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[insertPos], nums[i]] = [nums[i], nums[insertPos]];
      insertPos++;
    }
  }
}

// THREE SUM — Two pointers inside a loop
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // Skip duplicates
    let lo = i + 1, hi = nums.length - 1;
    while (lo < hi) {
      const sum = nums[i] + nums[lo] + nums[hi];
      if (sum === 0) {
        result.push([nums[i], nums[lo], nums[hi]]);
        while (lo < hi && nums[lo] === nums[lo + 1]) lo++;
        while (lo < hi && nums[hi] === nums[hi - 1]) hi--;
        lo++; hi--;
      } else if (sum < 0) lo++;
      else hi--;
    }
  }
  return result;
}

// IS PALINDROME — Two pointers from both ends
function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = clean.length - 1;
  while (l < r) {
    if (clean[l] !== clean[r]) return false;
    l++; r--;
  }
  return true;
}`,
    exercise: `**Practice Problems (Easy → Hard):**
1. Check if a string is a palindrome using two pointers
2. Two Sum II — find pair in sorted array that sums to target
3. Remove duplicates from sorted array in-place
4. Move all zeros to the end maintaining order
5. Reverse a string in-place using two pointers
6. Valid palindrome II — can you make it palindrome by removing at most one char?
7. Three Sum — find all unique triplets that sum to zero
8. Container with most water — maximize area
9. Trapping rain water — compute total trapped water
10. Sort colors (Dutch National Flag) — three-way partition`,
    commonMistakes: [
      "Applying two pointers to unsorted arrays when the approach requires sorted input",
      "Not handling duplicates in three sum — must skip duplicate values to avoid duplicate triplets",
      "Moving the wrong pointer — in converging two pointers, move the pointer that's 'less optimal'",
      "Not recognizing two pointers pattern — keywords: 'sorted array', 'pair', 'in-place', 'O(1) space'",
      "Off-by-one with same-direction pointers — use `slow` and `fast` naming for clarity"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Find all unique triplets in an array that sum to zero (Three Sum).",
        a: "```js\nfunction threeSum(nums) {\n  nums.sort((a,b) => a-b);\n  const res = [];\n  for (let i = 0; i < nums.length-2; i++) {\n    if (i > 0 && nums[i] === nums[i-1]) continue;\n    let lo = i+1, hi = nums.length-1;\n    while (lo < hi) {\n      const s = nums[i]+nums[lo]+nums[hi];\n      if (s === 0) { res.push([nums[i],nums[lo],nums[hi]]);\n        while (nums[lo]===nums[lo+1]) lo++;\n        while (nums[hi]===nums[hi-1]) hi--;\n        lo++; hi--;\n      } else s < 0 ? lo++ : hi--;\n    }\n  }\n  return res;\n}\n// O(n²) time, O(1) space\n```"
      },
      {
        type: "conceptual",
        q: "When do you use two pointers vs hash map for pair problems?",
        a: "**Two pointers**: when array is sorted or can be sorted. O(n) time, O(1) space. Perfect for: sorted array pair sum, three sum, partitioning. **Hash map**: when array is unsorted and you can't sort it (need original indices). O(n) time, O(n) space. Perfect for: two sum with indices, subarray sum. If you only need existence (not indices), sorting + two pointers is more space-efficient."
      }
    ]
  },
  {
    id: "sliding-window-pattern",
    title: "Sliding Window Pattern",
    explanation: `The **sliding window** pattern maintains a "window" (subarray/substring) that expands and contracts as you iterate. It's one of the most powerful patterns for substring and subarray problems.

**Two types:**

**1. Fixed-size window:**
- Window size is given (e.g., "maximum sum of subarray of size k")
- Slide the window by adding the right element and removing the left element
- O(n) — each element enters and leaves the window once

**2. Variable-size window:**
- Expand right to include more elements
- Shrink left when a condition is violated
- Track the optimal window (min length, max length, etc.)
- O(n) — right pointer moves n times, left pointer moves at most n times total

**Variable window template:**
\`\`\`
let left = 0;
for (let right = 0; right < n; right++) {
  // Add arr[right] to window
  while (window violates condition) {
    // Remove arr[left] from window
    left++;
  }
  // Update answer with current valid window
}
\`\`\`

**When to use sliding window:**
- "Find longest/shortest subarray/substring with property X"
- "Maximum/minimum sum of subarray of size K"
- "Contains all characters of target string"
- Contiguous sequence problems

🏠 **Real-world analogy:** Sliding window is like reading with a magnifying glass that you slide across text. You control the size of the lens — zoom in (shrink) or zoom out (expand) — to find the section you're looking for.`,
    codeExample: `// FIXED WINDOW — Max sum subarray of size k
function maxSumSubarray(arr: number[], k: number): number {
  let windowSum = 0, maxSum = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i];           // Add right element
    if (i >= k) windowSum -= arr[i - k]; // Remove left element
    if (i >= k - 1) maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}

// VARIABLE WINDOW — Longest substring without repeating chars
function longestUnique(s: string): number {
  const seen = new Set<string>();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

// VARIABLE WINDOW — Minimum window substring
function minWindow(s: string, t: string): string {
  const need = new Map<string, number>();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);

  let have = 0, required = need.size;
  let left = 0, minLen = Infinity, minStart = 0;
  const window = new Map<string, number>();

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c) || 0) + 1);
    if (need.has(c) && window.get(c) === need.get(c)) have++;

    while (have === required) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }
      const lc = s[left];
      window.set(lc, window.get(lc)! - 1);
      if (need.has(lc) && window.get(lc)! < need.get(lc)!) have--;
      left++;
    }
  }
  return minLen === Infinity ? "" : s.substring(minStart, minStart + minLen);
}

// FIXED WINDOW — Find all anagrams of pattern in string
function findAnagrams(s: string, p: string): number[] {
  const result: number[] = [];
  const need = new Array(26).fill(0);
  const have = new Array(26).fill(0);
  const a = 'a'.charCodeAt(0);

  for (const c of p) need[c.charCodeAt(0) - a]++;

  for (let i = 0; i < s.length; i++) {
    have[s.charCodeAt(i) - a]++;
    if (i >= p.length) have[s.charCodeAt(i - p.length) - a]--;
    if (have.toString() === need.toString()) result.push(i - p.length + 1);
  }
  return result;
}`,
    exercise: `**Practice Problems (Easy → Hard):**
1. Maximum sum subarray of size k (fixed window)
2. Longest substring without repeating characters
3. Find all anagrams of a pattern in a string
4. Longest substring with at most k distinct characters
5. Minimum size subarray with sum ≥ target
6. Maximum number of vowels in a substring of size k
7. Longest repeating character replacement (with at most k changes)
8. Minimum window substring (contains all chars of target)
9. Sliding window maximum (use deque for O(n))
10. Subarrays with k different integers`,
    commonMistakes: [
      "Not recognizing when sliding window applies — look for 'contiguous subarray/substring' keywords",
      "Forgetting to shrink the window — the left pointer must move to maintain the window condition",
      "Using O(n) comparison in the loop (e.g., comparing full hash maps) — use counters instead for O(1)",
      "Confusing fixed and variable window — fixed: always size k, variable: shrink/expand to optimize",
      "Not updating the answer at the right time — update AFTER ensures condition, not before"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Find the longest substring without repeating characters.",
        a: "```js\nfunction lengthOfLongestSubstring(s) {\n  const seen = new Map();\n  let left = 0, max = 0;\n  for (let right = 0; right < s.length; right++) {\n    if (seen.has(s[right]) && seen.get(s[right]) >= left) {\n      left = seen.get(s[right]) + 1;\n    }\n    seen.set(s[right], right);\n    max = Math.max(max, right - left + 1);\n  }\n  return max;\n}\n// O(n) time, O(min(n, alphabet)) space\n```"
      },
      {
        type: "conceptual",
        q: "How does the sliding window pattern achieve O(n) for problems that seem like O(n²)?",
        a: "Each element is processed at most twice — once when the right pointer includes it, once when the left pointer excludes it. The left pointer only moves forward, never backward. Total pointer movements: right moves n times + left moves at most n times = 2n = O(n). The key insight is that the window 'slides' instead of restarting from scratch for each position."
      }
    ]
  }
];

export default dsaPhase2b;
