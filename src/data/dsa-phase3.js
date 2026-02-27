const dsaPhase3 = {
  id: "phase-3",
  title: "Phase 3: Algorithmic Patterns",
  emoji: "🟡",
  description: "Master core problem-solving patterns — prefix sum, advanced binary search, divide & conquer, backtracking, greedy, and dynamic programming.",
  topics: [
    {
      id: "prefix-sum",
      title: "Prefix Sum & Range Queries",
      explanation: `**Prefix sum** (cumulative sum) pre-computes running totals so that any range sum can be answered in **O(1)** time after **O(n)** preprocessing.

**Core idea:**
\`\`\`
Array:      [3, 1, 4, 1, 5, 9]
Prefix sum: [3, 4, 8, 9, 14, 23]
Sum(i..j):  prefix[j] - prefix[i-1]
Sum(2..4):  14 - 4 = 10  ←  (4 + 1 + 5)
\`\`\`

**Why it matters:** Without prefix sum, each range query is O(n). With it, O(1) per query. If you have Q queries on an array of size n: O(nQ) → O(n + Q).

**Variations:**
1. **1D prefix sum** — range sum in arrays
2. **2D prefix sum** — submatrix sum in grids
3. **Prefix XOR** — range XOR queries
4. **Difference array** — range update in O(1), final values in O(n)

**Combined with hash map:** Prefix sum + hash map solves "count subarrays with sum = k" in O(n). This is a TOP interview pattern.

🏠 **Real-world analogy:** A running odometer in a car. To find distance traveled between mile 50 and mile 120, you don't re-drive — you subtract: 120 - 50 = 70 miles. That's prefix sum.`,
      codeExample: `// BUILD PREFIX SUM
function buildPrefix(arr: number[]): number[] {
  const prefix: number[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    prefix[i] = prefix[i - 1] + arr[i];
  }
  return prefix;
}

// RANGE SUM QUERY — O(1) per query
function rangeSum(prefix: number[], i: number, j: number): number {
  return i === 0 ? prefix[j] : prefix[j] - prefix[i - 1];
}

// SUBARRAY SUM EQUALS K — Prefix sum + hash map
function subarraySum(nums: number[], k: number): number {
  const prefixCount = new Map<number, number>([[0, 1]]);
  let sum = 0, count = 0;
  for (const num of nums) {
    sum += num;
    if (prefixCount.has(sum - k)) {
      count += prefixCount.get(sum - k)!;
    }
    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);
  }
  return count;
}
// Key insight: if prefix[j] - prefix[i] = k, subarray (i,j] sums to k

// 2D PREFIX SUM — Submatrix sum in O(1)
function build2DPrefix(matrix: number[][]): number[][] {
  const m = matrix.length, n = matrix[0].length;
  const p: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      p[i][j] = matrix[i][j]
        + (i > 0 ? p[i-1][j] : 0)
        + (j > 0 ? p[i][j-1] : 0)
        - (i > 0 && j > 0 ? p[i-1][j-1] : 0);
    }
  }
  return p;
}

// PRODUCT EXCEPT SELF — Prefix and suffix products
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const result = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  return result;
}

// DIFFERENCE ARRAY — Range updates in O(1)
function rangeAdd(diff: number[], l: number, r: number, val: number): void {
  diff[l] += val;
  if (r + 1 < diff.length) diff[r + 1] -= val;
}
function buildFromDiff(diff: number[]): number[] {
  const result = [diff[0]];
  for (let i = 1; i < diff.length; i++) {
    result[i] = result[i - 1] + diff[i];
  }
  return result;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Build a prefix sum array and answer range sum queries
2. Running sum of a 1D array
3. Find pivot index (left sum equals right sum)
4. Count subarrays with sum equal to k (prefix sum + hash map)
5. Product of array except self (without division)
6. Maximum subarray sum using prefix sum
7. Check if subarray with sum 0 exists
8. Range XOR queries using prefix XOR
9. 2D prefix sum — submatrix sum queries
10. Difference array — apply multiple range updates efficiently`,
      commonMistakes: [
        "Off-by-one when computing range sum — rangeSum(i, j) = prefix[j] - prefix[i-1], handle i=0 separately",
        "Not considering negative numbers — prefix sum works with negatives, but some optimizations (like pruning) don't",
        "Forgetting the base case {0: 1} in the hash map for subarray sum = k — counts subarrays starting from index 0",
        "Using prefix sum for single queries — not worth it for one-time range sum (just loop)",
        "Not recognizing prefix sum pattern — keywords: 'range', 'subarray sum', 'cumulative'"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Count the number of subarrays that sum to k.",
          a: "```js\nfunction subarraySum(nums, k) {\n  const map = new Map([[0, 1]]); // BASE CASE\n  let sum = 0, count = 0;\n  for (const n of nums) {\n    sum += n;\n    if (map.has(sum - k)) count += map.get(sum - k);\n    map.set(sum, (map.get(sum) || 0) + 1);\n  }\n  return count;\n}\n// O(n) time, O(n) space\n// Key: prefix[j]-prefix[i]=k means subarray (i,j] sums to k\n```"
        },
        {
          type: "conceptual",
          q: "How does prefix sum turn O(n) range queries into O(1)?",
          a: "By pre-computing cumulative sums. prefix[i] = sum of elements 0..i. Then sum(i..j) = prefix[j] - prefix[i-1]. This subtraction is O(1). The preprocessing is O(n), but each subsequent query is O(1). This is a classic time-space tradeoff: O(n) extra space for O(1) queries."
        }
      ]
    },
    {
      id: "binary-search-advanced",
      title: "Binary Search — Advanced Applications",
      explanation: `Beyond basic search, binary search has powerful advanced applications: **search on answer space**, **finding boundaries**, and **searching in modified arrays**.

**Binary Search on Answer Space:**
When the answer lies in a range [lo, hi] and you can test if a value is feasible:
\`\`\`
while (lo < hi):
    mid = (lo + hi) / 2
    if (condition(mid)): hi = mid    // mid works, try smaller
    else: lo = mid + 1               // mid doesn't work, try larger
return lo
\`\`\`

**Common applications:**
1. **Minimize the maximum** — split array, ship packages (binary search on max value)
2. **Maximize the minimum** — aggressive cows, place elements (binary search on min value)
3. **Find first true** — search for transition point in monotonic boolean function
4. **Koko eating bananas** — binary search on eating speed

**Key insight:** Binary search works whenever there's a **monotonic condition** — once it becomes true, it stays true (or vice versa).

🏠 **Real-world analogy:** Binary search on answer is like guessing a price. "Is $100 enough?" "Yes." "Is $50 enough?" "No." "Is $75 enough?" "Yes." You narrow down to the exact minimum price.`,
      codeExample: `// FIND FIRST TRUE — Generalized binary search
function findFirstTrue(lo: number, hi: number, condition: (mid: number) => boolean): number {
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (condition(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// KOKO EATING BANANAS — Binary search on speed
function minEatingSpeed(piles: number[], h: number): number {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0);
    if (hours <= h) hi = mid;  // Can eat slower
    else lo = mid + 1;         // Need to eat faster
  }
  return lo;
}

// SPLIT ARRAY LARGEST SUM — Minimize the maximum sum
function splitArray(nums: number[], k: number): number {
  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canSplit(nums, k, mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

function canSplit(nums: number[], k: number, maxSum: number): boolean {
  let groups = 1, currentSum = 0;
  for (const n of nums) {
    if (currentSum + n > maxSum) { groups++; currentSum = 0; }
    currentSum += n;
  }
  return groups <= k;
}

// FIND PEAK ELEMENT — O(log n)
function findPeakElement(nums: number[]): number {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] > nums[mid + 1]) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// SEARCH IN 2D SORTED MATRIX
function searchMatrix(matrix: number[][], target: number): boolean {
  const m = matrix.length, n = matrix[0].length;
  let lo = 0, hi = m * n - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const val = matrix[Math.floor(mid / n)][mid % n];
    if (val === target) return true;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Find the square root of a number using binary search (integer part)
2. Find peak element in an array
3. Koko eating bananas — find minimum eating speed
4. Ship packages within D days — find minimum ship capacity
5. Split array largest sum — minimize the maximum subarray sum
6. Aggressive cows — maximize minimum distance between cows
7. Find minimum in rotated sorted array
8. Median of two sorted arrays (O(log(min(m,n))))
9. Magnetic force — maximize minimum distance (binary search on answer)
10. Find kth smallest element in a sorted matrix`,
      commonMistakes: [
        "Using `lo <= hi` when you should use `lo < hi` (or vice versa) — depends on the variant",
        "Not identifying the monotonic condition — binary search on answer ONLY works when the feasibility is monotonic",
        "Wrong initialization of lo/hi bounds — lo should be the minimum possible answer, hi the maximum",
        "Not handling edge cases: single element, all same elements, empty input",
        "Infinite loop when lo = hi - 1 and mid = lo always — ensure the search space shrinks each iteration"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Koko has piles of bananas and h hours. Find minimum eating speed to finish all bananas.",
          a: "```js\nfunction minEatingSpeed(piles, h) {\n  let lo = 1, hi = Math.max(...piles);\n  while (lo < hi) {\n    const mid = (lo + hi) >>> 1;\n    const hours = piles.reduce((s, p) => s + Math.ceil(p / mid), 0);\n    if (hours <= h) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}\n// Binary search on the answer (speed)\n// Monotonic: higher speed → fewer hours (always feasible)\n```"
        },
        {
          type: "conceptual",
          q: "How do you identify when to use 'binary search on the answer space'?",
          a: "Three conditions: 1) The answer lies in a **bounded range** [min, max]. 2) You can write a **feasibility function** `canDo(mid)` that checks if mid is achievable. 3) The feasibility is **monotonic** — once it becomes true, it stays true for all larger (or smaller) values. Common keywords: 'minimize the maximum', 'maximize the minimum', 'find the minimum X such that'."
        }
      ]
    },
    {
      id: "fast-slow-pointers",
      title: "Fast & Slow Pointers (Floyd's Cycle Detection)",
      explanation: `The **fast and slow pointer** technique (also called Floyd's Tortoise and Hare) uses two pointers moving at different speeds. It's the standard approach for cycle detection and finding middle elements.

**Core applications:**
1. **Cycle detection in linked list** — fast moves 2, slow moves 1. If cycle exists, they meet.
2. **Find cycle start** — after meeting, reset one pointer to head. Both move 1 step. They meet at cycle start.
3. **Find middle of linked list** — when fast reaches end, slow is at middle.
4. **Happy number** — detect cycles in the number sequence.
5. **Find duplicate** — Floyd's applied to index-value mapping (LeetCode 287).

**Why it works (cycle detection):**
- If there's a cycle of length C, after slow enters the cycle, fast catches up by 1 step per iteration (fast's relative speed is 1).
- They must meet within C steps after slow enters the cycle.
- Time: O(n), Space: O(1) — no hash set needed!

🏠 **Real-world analogy:** Two runners on a circular track — the faster runner will eventually lap the slower one. If the track is not circular (no cycle), the fast runner reaches the end first.`,
      codeExample: `// DETECT CYCLE — O(n) time, O(1) space
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // Cycle detected!
  }
  return false; // Fast reached end — no cycle
}

// FIND CYCLE START
function detectCycleStart(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      // Reset slow to head, move both at speed 1
      slow = head;
      while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
      }
      return slow; // Meeting point = cycle start
    }
  }
  return null;
}

// FIND MIDDLE OF LINKED LIST
function findMiddle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow; // Slow is at middle when fast reaches end
}

// HAPPY NUMBER — Detect cycle in number sequence
function isHappy(n: number): boolean {
  function sumOfSquares(num: number): number {
    let sum = 0;
    while (num > 0) {
      const digit = num % 10;
      sum += digit * digit;
      num = Math.floor(num / 10);
    }
    return sum;
  }

  let slow = n, fast = n;
  do {
    slow = sumOfSquares(slow);
    fast = sumOfSquares(sumOfSquares(fast));
  } while (slow !== fast);

  return slow === 1; // 1 → 1 is a cycle of length 1
}

// FIND DUPLICATE NUMBER — Floyd's on array index mapping
function findDuplicate(nums: number[]): number {
  // Treat as linked list: index → value → next index
  let slow = nums[0], fast = nums[0];

  // Phase 1: Find meeting point
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);

  // Phase 2: Find entrance (duplicate)
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}`,
      exercise: `**Practice Problems:**
1. Detect if a linked list has a cycle
2. Find the start of the cycle in a linked list
3. Find the middle node of a linked list
4. Check if a number is happy (sum of square of digits → 1)
5. Find the duplicate number in [1..n] array with n+1 elements
6. Check if a linked list is a palindrome using fast/slow pointers
7. Split a linked list into two halves using fast/slow
8. Find the intersection node of two linked lists
9. Remove the nth node from the end of a linked list in one pass
10. Reorder list: L0→Ln→L1→Ln-1→L2→Ln-2...`,
      commonMistakes: [
        "Dereferencing null — always check `fast && fast.next` before moving fast two steps",
        "Forgetting to check for no-cycle case — fast reaches null means no cycle",
        "Not resetting slow to head in phase 2 of cycle detection — both must move at speed 1",
        "Applying Floyd's to problems without cyclic structure — it only works when there's a cycle",
        "Confusing the meeting point with the cycle start — they are NOT the same (phase 1 vs phase 2)"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Floyd's cycle detection algorithm work and why?",
          a: "Two pointers: slow (1 step) and fast (2 steps). If there's a cycle, fast eventually laps slow (they meet inside the cycle). To find cycle START: reset slow to head, move both at speed 1 — they meet at the cycle entrance. Math: if distance to cycle = a, meeting point inside cycle = b, cycle length = c, then a = c - b, which is why the two-phase approach works."
        },
        {
          type: "coding",
          q: "Find the duplicate number in an array of n+1 integers where each is in [1, n]. O(1) space.",
          a: "```js\nfunction findDuplicate(nums) {\n  let slow = nums[0], fast = nums[0];\n  do { slow = nums[slow]; fast = nums[nums[fast]]; }\n  while (slow !== fast);\n  slow = nums[0];\n  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; }\n  return slow;\n}\n// Treat array as linked list: value at index i points to index nums[i]\n// Duplicate means two indices point to same value → cycle!\n```"
        }
      ]
    },
    {
      id: "divide-and-conquer",
      title: "Divide and Conquer",
      explanation: `**Divide and Conquer** breaks a problem into smaller sub-problems, solves each independently, then combines the results. It's the foundation of merge sort, quicksort, binary search, and many efficient algorithms.

**Three steps:**
1. **Divide** — Split the problem into smaller sub-problems
2. **Conquer** — Solve each sub-problem recursively (or directly if small enough)
3. **Combine** — Merge the sub-solutions into the final answer

**Classic D&C algorithms:**
- **Merge Sort** — Divide array in half, sort each, merge → O(n log n)
- **Quick Sort** — Partition around pivot, sort each side → O(n log n) avg
- **Binary Search** — Divide search space in half → O(log n)
- **Karatsuba Multiplication** — Multiply large numbers faster → O(n^1.585)
- **Closest Pair of Points** — Find nearest pair → O(n log n)
- **Strassen's Matrix Multiplication** — Faster matrix multiply → O(n^2.807)

**Master Theorem** for analyzing D&C recurrences:
T(n) = aT(n/b) + O(nᵈ)
- If d < log_b(a): T(n) = O(n^(log_b(a)))
- If d = log_b(a): T(n) = O(nᵈ log n)
- If d > log_b(a): T(n) = O(nᵈ)

🏠 **Real-world analogy:** Organizing a library. Split all books into A-M and N-Z (divide), organize each group (conquer), then put them together on the shelf (combine). Each group can be further split.`,
      codeExample: `// MERGE SORT — Classic D&C
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;     // Base case

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));   // Divide
  const right = mergeSort(arr.slice(mid));      // Divide

  return merge(left, right);                    // Combine
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

// COUNT INVERSIONS — Merge sort modification
function countInversions(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  let count = countInversions(left) + countInversions(right);

  let i = 0, j = 0, k = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) { arr[k++] = left[i++]; }
    else {
      arr[k++] = right[j++];
      count += left.length - i; // All remaining left elements form inversions
    }
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
  return count;
}

// MAXIMUM SUBARRAY — D&C approach (Kadane's is simpler, but this shows D&C)
function maxSubarrayDC(arr: number[], lo: number, hi: number): number {
  if (lo === hi) return arr[lo];

  const mid = Math.floor((lo + hi) / 2);
  const leftMax = maxSubarrayDC(arr, lo, mid);
  const rightMax = maxSubarrayDC(arr, mid + 1, hi);
  const crossMax = maxCrossing(arr, lo, mid, hi);

  return Math.max(leftMax, rightMax, crossMax);
}

function maxCrossing(arr: number[], lo: number, mid: number, hi: number): number {
  let leftSum = -Infinity, sum = 0;
  for (let i = mid; i >= lo; i--) { sum += arr[i]; leftSum = Math.max(leftSum, sum); }
  let rightSum = -Infinity; sum = 0;
  for (let i = mid + 1; i <= hi; i++) { sum += arr[i]; rightSum = Math.max(rightSum, sum); }
  return leftSum + rightSum;
}

// POWER — D&C O(log n)
function power(base: number, exp: number): number {
  if (exp === 0) return 1;
  if (exp < 0) return 1 / power(base, -exp);
  const half = power(base, Math.floor(exp / 2));
  return exp % 2 === 0 ? half * half : half * half * base;
}`,
      exercise: `**Practice Problems:**
1. Implement merge sort and count the number of comparisons
2. Count inversions in an array using modified merge sort
3. Find maximum subarray sum using divide and conquer
4. Implement power(x, n) in O(log n) using D&C
5. Find the closest pair of points in a 2D plane
6. Multiply two large numbers using Karatsuba algorithm (conceptual)
7. Find kth largest element using quickselect (average O(n))
8. Construct a binary tree from preorder and inorder traversal
9. Find the majority element using D&C (Boyer-Moore is better, but practice D&C)
10. Skyline problem — merge skylines from two halves`,
      commonMistakes: [
        "Not identifying the base case — D&C needs a base case for the smallest sub-problem",
        "Inefficient combining step — the combine step can dominate complexity if not optimized",
        "Creating too many new arrays (memory overhead) — in-place D&C is often preferred",
        "Using D&C when a simpler approach exists — Kadane's O(n) beats D&C O(n log n) for max subarray",
        "Not applying the Master Theorem to analyze complexity — essential for understanding D&C performance"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the divide and conquer paradigm? Give three examples.",
          a: "D&C solves problems by: 1) **Dividing** into smaller sub-problems. 2) **Conquering** each recursively. 3) **Combining** results. Examples: **Merge Sort** (divide array, sort halves, merge), **Binary Search** (divide search space, check one half), **Quick Sort** (partition, sort sub-arrays). The key is that sub-problems are independent and the combine step is efficient."
        },
        {
          type: "coding",
          q: "Find kth largest element in an unsorted array in average O(n) time.",
          a: "```js\nfunction findKthLargest(nums, k) {\n  k = nums.length - k; // Convert to kth smallest\n  function quickselect(lo, hi) {\n    const pivot = nums[hi];\n    let i = lo;\n    for (let j = lo; j < hi; j++) {\n      if (nums[j] < pivot) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; }\n    }\n    [nums[i], nums[hi]] = [nums[hi], nums[i]];\n    if (i === k) return nums[i];\n    return i < k ? quickselect(i+1, hi) : quickselect(lo, i-1);\n  }\n  return quickselect(0, nums.length - 1);\n}\n```"
        }
      ]
    },
    {
      id: "backtracking",
      title: "Backtracking — Permutations, Combinations, Subsets",
      explanation: `**Backtracking** is a systematic way to explore ALL possibilities by building solutions incrementally and abandoning paths that can't lead to valid solutions ("pruning").

**Template:**
\`\`\`
function backtrack(state, choices):
    if (goal reached): record solution
    for each choice in choices:
        if (choice is valid):
            make choice
            backtrack(updated state, remaining choices)
            undo choice  ← THE KEY STEP (backtrack!)
\`\`\`

**Classic backtracking problems:**
1. **Subsets** — Generate all 2ⁿ subsets of a set
2. **Permutations** — Generate all n! orderings
3. **Combinations** — Choose k items from n (nCk)
4. **N-Queens** — Place n queens on n×n board with no conflicts
5. **Sudoku solver** — Fill grid satisfying all constraints
6. **Word search** — Find word in grid following adjacent cells

**Key concept — PRUNING:**
Without pruning, backtracking is brute force. Pruning = skipping branches that can't lead to valid solutions. Good pruning dramatically reduces the search space.

**Time complexity:** Usually exponential — O(2ⁿ), O(n!), O(nᵏ). But pruning can make it practical.

🏠 **Real-world analogy:** Solving a maze. At each fork, pick a path. If you hit a dead end, backtrack to the last fork and try the other path. You explore every possibility but avoid revisiting dead ends.`,
      codeExample: `// SUBSETS — Generate all 2ⁿ subsets
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  function backtrack(start: number, current: number[]): void {
    result.push([...current]); // Every state is a valid subset
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);         // Choose
      backtrack(i + 1, current);     // Explore
      current.pop();                  // Undo (backtrack!)
    }
  }
  backtrack(0, []);
  return result;
}

// PERMUTATIONS — Generate all n! orderings
function permutations(nums: number[]): number[][] {
  const result: number[][] = [];
  function backtrack(current: number[], remaining: Set<number>): void {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (const num of remaining) {
      current.push(num);
      remaining.delete(num);
      backtrack(current, remaining);
      remaining.add(num);  // Undo
      current.pop();       // Undo
    }
  }
  backtrack([], new Set(nums));
  return result;
}

// COMBINATIONS — Choose k from n
function combine(n: number, k: number): number[][] {
  const result: number[][] = [];
  function backtrack(start: number, current: number[]): void {
    if (current.length === k) { result.push([...current]); return; }
    // Pruning: stop if not enough elements left
    for (let i = start; i <= n - (k - current.length) + 1; i++) {
      current.push(i);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(1, []);
  return result;
}

// N-QUEENS — Place n queens with no conflicts
function solveNQueens(n: number): string[][] {
  const result: string[][] = [];
  const cols = new Set<number>();
  const diag1 = new Set<number>(); // row - col
  const diag2 = new Set<number>(); // row + col
  const board: string[][] = Array.from({length: n}, () => Array(n).fill('.'));

  function backtrack(row: number): void {
    if (row === n) { result.push(board.map(r => r.join(''))); return; }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row-col) || diag2.has(row+col)) continue;
      // Place queen
      board[row][col] = 'Q';
      cols.add(col); diag1.add(row-col); diag2.add(row+col);
      backtrack(row + 1);
      // Remove queen (backtrack)
      board[row][col] = '.';
      cols.delete(col); diag1.delete(row-col); diag2.delete(row+col);
    }
  }
  backtrack(0);
  return result;
}

// WORD SEARCH — Find word in grid
function exist(board: string[][], word: string): boolean {
  const rows = board.length, cols = board[0].length;
  function dfs(r: number, c: number, idx: number): boolean {
    if (idx === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[idx]) return false;
    const temp = board[r][c];
    board[r][c] = '#'; // Mark visited
    const found = dfs(r+1,c,idx+1) || dfs(r-1,c,idx+1) || dfs(r,c+1,idx+1) || dfs(r,c-1,idx+1);
    board[r][c] = temp; // Restore (backtrack!)
    return found;
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Generate all subsets of a set of unique numbers
2. Generate all permutations of a set of unique numbers
3. Generate all combinations of k numbers from [1..n]
4. Generate all valid parentheses sequences of n pairs
5. Letter combinations of a phone number (2-9 mapping)
6. Solve the N-Queens problem
7. Word search in a 2D grid
8. Combination sum — find all combos that sum to target (reuse allowed)
9. Sudoku solver
10. Partition a string into all possible palindrome partitions`,
      commonMistakes: [
        "Forgetting to UNDO the choice (backtrack) — the most common backtracking bug",
        "Not creating a copy when recording solutions — push([...current]) not push(current)",
        "Not pruning — leads to exploring unnecessary branches; always look for ways to skip",
        "Confusing subsets (2ⁿ), permutations (n!), and combinations (nCk)",
        "Modifying global state instead of passing state through parameters"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is backtracking and how does it differ from brute force?",
          a: "Backtracking builds solutions incrementally as a decision tree and **abandons (prunes) branches** that can't lead to valid solutions. Brute force tries ALL possible solutions without pruning. Backtracking is brute force WITH intelligence — it still explores exponentially but skips provably invalid paths. Example: N-Queens prunes columns and diagonals, avoiding most of the n^n possibilities."
        },
        {
          type: "coding",
          q: "Generate all valid combinations of n pairs of parentheses.",
          a: "```js\nfunction generateParens(n) {\n  const result = [];\n  function bt(s, open, close) {\n    if (s.length === 2 * n) { result.push(s); return; }\n    if (open < n) bt(s + '(', open + 1, close);\n    if (close < open) bt(s + ')', open, close + 1);\n  }\n  bt('', 0, 0);\n  return result;\n}\n// Pruning: only add ')' if close < open\n// This eliminates all invalid sequences\n```"
        }
      ]
    },
    {
      id: "greedy-algorithms",
      title: "Greedy Algorithms",
      explanation: `**Greedy algorithms** make the **locally optimal choice** at each step, hoping to reach the **globally optimal solution**. They don't reconsider past choices — no backtracking.

**When greedy works:**
- The problem has **optimal substructure** (optimal solution contains optimal sub-solutions)
- The problem has the **greedy choice property** (local optimal → global optimal)
- You can PROVE that greedy gives the optimal answer (not just "seems right")

**When greedy DOESN'T work:**
- Coin change with arbitrary denominations (greedy fails: coins [1,3,4], target 6 → greedy gives 4+1+1=3 coins, optimal is 3+3=2 coins)
- Most optimization problems need DP, not greedy

**Classic greedy problems:**
1. **Activity selection** — Pick max non-overlapping intervals
2. **Fractional knapsack** — Take items by value/weight ratio
3. **Huffman coding** — Build optimal prefix code
4. **Jump game** — Can you reach the last index?
5. **Gas station** — Find starting station for circular route

**Proving greedy correctness:**
1. **Exchange argument** — Show that swapping any non-greedy choice with the greedy choice doesn't worsen the solution
2. **Stays ahead** — Show the greedy solution is always at least as good as any other solution at each step

🏠 **Real-world analogy:** Always taking the next exit on a highway that gets you closest to your destination. It works for highway navigation (greedy is optimal) but fails for a maze (need backtracking/DP).`,
      codeExample: `// JUMP GAME — Can you reach the last index?
function canJump(nums: number[]): boolean {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // Can't reach this index
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}

// JUMP GAME II — Minimum jumps to reach end
function jump(nums: number[]): number {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }
  return jumps;
}

// ACTIVITY SELECTION — Max non-overlapping intervals
function maxActivities(activities: [number, number][]): number {
  activities.sort((a, b) => a[1] - b[1]); // Sort by END time
  let count = 1, lastEnd = activities[0][1];
  for (let i = 1; i < activities.length; i++) {
    if (activities[i][0] >= lastEnd) {
      count++;
      lastEnd = activities[i][1];
    }
  }
  return count;
}

// MINIMUM PLATFORMS — Trains at a station
function minPlatforms(arrivals: number[], departures: number[]): number {
  arrivals.sort((a, b) => a - b);
  departures.sort((a, b) => a - b);
  let platforms = 0, maxPlatforms = 0;
  let i = 0, j = 0;
  while (i < arrivals.length) {
    if (arrivals[i] <= departures[j]) {
      platforms++;
      maxPlatforms = Math.max(maxPlatforms, platforms);
      i++;
    } else {
      platforms--;
      j++;
    }
  }
  return maxPlatforms;
}

// FRACTIONAL KNAPSACK — Greedy by value/weight ratio
function fractionalKnapsack(
  items: {weight: number, value: number}[],
  capacity: number
): number {
  items.sort((a, b) => b.value/b.weight - a.value/a.weight);
  let totalValue = 0;
  for (const item of items) {
    if (capacity >= item.weight) {
      totalValue += item.value;
      capacity -= item.weight;
    } else {
      totalValue += (capacity / item.weight) * item.value;
      break;
    }
  }
  return totalValue;
}

// ASSIGN COOKIES — Sort and greedily match
function findContentChildren(greed: number[], cookies: number[]): number {
  greed.sort((a, b) => a - b);
  cookies.sort((a, b) => a - b);
  let child = 0, cookie = 0;
  while (child < greed.length && cookie < cookies.length) {
    if (cookies[cookie] >= greed[child]) child++;
    cookie++;
  }
  return child;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Assign cookies to children (each child has a greed factor)
2. Jump game — can you reach the last index?
3. Jump game II — minimum number of jumps
4. Best time to buy and sell stock II (multiple transactions)
5. Activity selection / non-overlapping intervals (max count)
6. Minimum number of meeting rooms (interval scheduling)
7. Gas station — find starting index for circular trip
8. Partition labels — partition string so each letter appears in one part
9. Minimum number of arrows to burst balloons
10. Task scheduler — schedule tasks with cooldown`,
      commonMistakes: [
        "Assuming greedy always works — it DOESN'T for many optimization problems (knapsack 0/1, coin change with arbitrary coins)",
        "Not sorting first — most greedy algorithms require sorting by some criteria",
        "Not proving correctness — greedy can give wrong answers; always verify with counterexamples",
        "Confusing greedy with DP — if you need to consider future states, it's not greedy",
        "Choosing the wrong greedy criterion — e.g., sorting intervals by start time instead of end time"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When does a greedy algorithm give an optimal solution?",
          a: "When the problem has both: 1) **Optimal substructure** — optimal solution to the problem contains optimal solutions to sub-problems. 2) **Greedy choice property** — a locally optimal choice leads to a globally optimal solution. Examples: fractional knapsack, activity selection, Huffman coding. Counter-example: 0/1 knapsack needs DP because greedy choice is suboptimal."
        },
        {
          type: "coding",
          q: "Find the minimum number of meeting rooms needed for a list of intervals.",
          a: "```js\nfunction minMeetingRooms(intervals) {\n  const starts = intervals.map(i => i[0]).sort((a,b) => a-b);\n  const ends = intervals.map(i => i[1]).sort((a,b) => a-b);\n  let rooms = 0, maxRooms = 0, s = 0, e = 0;\n  while (s < starts.length) {\n    if (starts[s] < ends[e]) { rooms++; s++; }\n    else { rooms--; e++; }\n    maxRooms = Math.max(maxRooms, rooms);\n  }\n  return maxRooms;\n}\n// O(n log n) — sort + sweep line\n```"
        }
      ]
    }
  ]
};

export default dsaPhase3;
