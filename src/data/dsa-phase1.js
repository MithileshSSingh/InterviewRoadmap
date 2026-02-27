const dsaPhase1 = {
  id: "phase-1",
  title: "Phase 1: Foundations",
  emoji: "🟢",
  description: "Master the fundamentals — Big-O notation, complexity analysis, recursion, memory model, and problem-solving thinking.",
  topics: [
    {
      id: "big-o-notation",
      title: "Big-O Notation & Complexity Analysis",
      explanation: `**Big-O notation** describes how the runtime or space usage of an algorithm grows relative to the input size. It's the universal language for comparing algorithm efficiency.

**Why it matters:** Every technical interview asks about complexity. Every production decision about which algorithm or data structure to use depends on Big-O. Without it, you can't reason about whether your code will handle 1 million users.

**The key idea:** Big-O measures the **worst-case growth rate**, dropping constants and lower-order terms:
- O(1) — **Constant** — Same time regardless of input size (hash map lookup)
- O(log n) — **Logarithmic** — Halving the problem each step (binary search)
- O(n) — **Linear** — Visit each element once (array scan)
- O(n log n) — **Linearithmic** — Efficient sorting (merge sort, quick sort)
- O(n²) — **Quadratic** — Nested loops (bubble sort, brute force pairs)
- O(2ⁿ) — **Exponential** — Doubling at each step (recursive fibonacci)
- O(n!) — **Factorial** — All permutations (traveling salesman brute force)

**Visual intuition:**
\`\`\`
Input size:     10      100       1,000      1,000,000
O(1):           1       1         1          1
O(log n):       3       7         10         20
O(n):           10      100       1,000      1,000,000
O(n log n):     30      700       10,000     20,000,000
O(n²):          100     10,000    1,000,000  1,000,000,000,000 💀
\`\`\`

**How to calculate Big-O:**
1. Count the number of operations as a function of n
2. Drop constants: O(3n) → O(n)
3. Drop lower-order terms: O(n² + n) → O(n²)
4. Focus on the dominant term as n → infinity

🏠 **Real-world analogy:** If you lose your keys in the house, O(1) is knowing they're on the hook. O(n) is checking each room one by one. O(n²) is checking each room AND every drawer in every room for each attempt.`,
      codeExample: `// O(1) — Constant time
function getFirst(arr) {
  return arr[0]; // Always one operation, regardless of array size
}

// O(log n) — Logarithmic (binary search)
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1; // Halves search space each iteration
}

// O(n) — Linear
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) { // Visits each element once
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// O(n²) — Quadratic
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {       // n iterations
    for (let j = i + 1; j < arr.length; j++) {  // n iterations (nested)
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

// O(2ⁿ) — Exponential (naive fibonacci)
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2); // Two recursive calls per level
}

// TypeScript version with types
function binarySearchTS(arr: number[], target: number): number {
  let left: number = 0, right: number = arr.length - 1;
  while (left <= right) {
    const mid: number = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. What is the Big-O of accessing an element in an array by index?
2. Determine Big-O: a loop from 0 to n that increments by 2 each time
3. Determine Big-O: two nested loops, outer 0→n, inner 0→n
4. Determine Big-O: a loop from n down to 1, halving each time
5. Analyze: \`for (i=0; i<n; i++) { for (j=0; j<100; j++) { ... } }\`
6. What's the complexity of: \`for(i=1; i<n; i*=2) { for(j=0; j<n; j++) {} }\`
7. Rank these from fastest to slowest: O(n!), O(2ⁿ), O(n²), O(n log n), O(n), O(log n), O(1)
8. A function calls itself twice with n-1. What's the time complexity?
9. You have O(n) + O(n²) + O(n³). What's the overall Big-O?
10. Prove that O(100n + 50) simplifies to O(n).

**Debugging Exercise:**
This function claims to be O(n) — is it? Find the hidden complexity:
\`\`\`js
function mystery(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.unshift(arr[i]); // ← unshift is O(n)! Total: O(n²)
  }
  return result;
}
\`\`\``,
      commonMistakes: [
        "Forgetting that Big-O drops constants — O(2n) is O(n), not O(2n)",
        "Confusing O(log n) base — in Big-O, all logarithmic bases are equivalent because log_a(n) = log_b(n) / log_b(a), and 1/log_b(a) is a constant",
        "Not recognizing hidden O(n) operations — array.unshift(), array.splice(), string concatenation in loops are all O(n)",
        "Thinking O(n + m) simplifies to O(n) — if m is independent of n, you must keep both",
        "Assuming hash map operations are always O(1) — they're O(1) amortized but O(n) worst case with collisions"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What does Big-O notation actually measure?",
          a: "Big-O measures the **upper bound** of an algorithm's growth rate as input size approaches infinity. It describes how the number of operations (time) or memory usage (space) scales with input size n. It drops constants and lower-order terms because we care about behavior at scale, not exact operation counts."
        },
        {
          type: "tricky",
          q: "What is the time complexity of this code?\n```js\nfor (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j += i + 1) {\n    // O(1) work\n  }\n}\n```",
          a: "O(n log n). The outer loop runs n times. For each i, the inner loop runs n/(i+1) times. Total: n/1 + n/2 + n/3 + ... + n/n = n × (1 + 1/2 + 1/3 + ... + 1/n) = n × H(n) ≈ n × ln(n) = O(n log n). This is the Harmonic Series."
        },
        {
          type: "coding",
          q: "Write an O(n) solution to find if any two numbers in an array sum to a target.",
          a: "```js\nfunction twoSum(arr, target) {\n  const seen = new Set();\n  for (const num of arr) {\n    if (seen.has(target - num)) return true;\n    seen.add(num);\n  }\n  return false;\n}\n// O(n) time, O(n) space — vs O(n²) brute force\n```"
        },
        {
          type: "scenario",
          q: "Your API endpoint takes 5 seconds for 1,000 records. The client wants to handle 1,000,000 records. How do you estimate the new time?",
          a: "Depends on the algorithm's Big-O. If O(n): 5,000 seconds (~83 min). If O(n²): 5,000,000 seconds (impossible). If O(n log n): ~50 seconds. This is exactly why Big-O matters — it predicts how your code behaves at scale and tells you whether to optimize or redesign."
        },
        {
          type: "conceptual",
          q: "Why do we drop constants in Big-O?",
          a: "Because Big-O describes **growth rate** as n→∞, not exact runtime. O(2n) and O(n) grow at the same rate — linearly. At massive scale, the constant doesn't change the category of growth. However, in practice, constants DO matter for performance tuning — Big-O is for algorithm selection, not micro-optimization."
        }
      ]
    },
    {
      id: "time-vs-space-complexity",
      title: "Time Complexity vs Space Complexity",
      explanation: `**Time complexity** measures how many operations an algorithm performs relative to input size. **Space complexity** measures how much additional memory it uses.

**Why it matters:** In real-world systems, you constantly trade time for space and vice versa. Caching (using more memory to save time), compression (using more time to save space), and hash tables (using extra space for O(1) lookups) are all time-space tradeoffs.

**Time Complexity** counts:
- Loop iterations
- Recursive calls
- Function calls
- Comparisons, assignments, arithmetic

**Space Complexity** counts:
- Variables created
- Data structures allocated
- Recursive call stack depth
- Temporary arrays/objects

**The Time-Space Tradeoff:**
- Use a hash set to check duplicates: O(n) time + O(n) space vs O(n²) time + O(1) space
- Memoize recursive results: O(n) time + O(n) space vs O(2ⁿ) time + O(n) space
- Pre-compute prefix sums: O(1) per query + O(n) space vs O(n) per query + O(1) space

**Auxiliary space vs Total space:**
- **Auxiliary space** = extra space used beyond the input (what we usually mean)
- **Total space** = input space + auxiliary space

🏠 **Real-world analogy:** Time complexity is how long a trip takes. Space complexity is how much luggage you bring. A GPS (extra space) saves you time finding the route. A paper map (less space) takes more time but works offline.`,
      codeExample: `// Time: O(n), Space: O(1) — in-place
function findMax(arr) {
  let max = arr[0]; // O(1) extra space
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// Time: O(n), Space: O(n) — extra array
function reverseArray(arr) {
  const result = []; // O(n) extra space
  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]);
  }
  return result;
}

// Time: O(1), Space: O(1) — in-place swap
function reverseInPlace(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}

// Time-Space Tradeoff Example
// Approach 1: O(n²) time, O(1) space
function hasDuplicateBrute(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

// Approach 2: O(n) time, O(n) space
function hasDuplicateSet(arr) {
  const seen = new Set();
  for (const val of arr) {
    if (seen.has(val)) return true;
    seen.add(val);
  }
  return false;
}

// TypeScript — clearly typed tradeoff
function hasDuplicateTS(arr: number[]): boolean {
  const seen: Set<number> = new Set();
  for (const val of arr) {
    if (seen.has(val)) return true;
    seen.add(val);
  }
  return false;
}

// Recursive space — call stack counts!
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
  // Time: O(n), Space: O(n) ← call stack depth!
}

// Iterative version — saves stack space
function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
  // Time: O(n), Space: O(1) ← no call stack
}`,
      exercise: `**Practice Problems:**
1. Analyze time AND space for: creating a copy of an array
2. What's the space complexity of a recursive fibonacci(n)?
3. Rewrite \`arr.filter(x => x > 5)\` to be O(1) space (in-place)
4. Compare: sorting + binary search vs hash set for "contains" queries
5. A function creates a 2D matrix of size n×n. What's its space complexity?
6. What's the space complexity of merge sort vs quick sort?
7. You have 1GB RAM and need to process 10GB of data. Which complexity constraint matters more?
8. Write a function that checks if a string is a palindrome with O(1) extra space
9. Compare space usage: adjacency matrix vs adjacency list for a sparse graph
10. Design a solution where you trade O(n) space for O(1) lookup time`,
      commonMistakes: [
        "Ignoring recursive call stack depth — each recursive call adds a frame to the stack, counting as O(depth) space",
        "Forgetting that creating a new array/object inside a loop multiplies space usage",
        "Thinking in-place always means O(1) space — in-place quicksort still uses O(log n) stack space",
        "Not considering the space of the output — if you return a new array of size n, that's O(n) space",
        "Confusing auxiliary space with total space — interviews usually ask about auxiliary (extra) space"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the time-space tradeoff with a concrete example.",
          a: "Classic example: finding duplicates. **Brute force**: O(n²) time, O(1) space — compare every pair. **Hash set**: O(n) time, O(n) space — store seen values for O(1) lookup. We trade extra memory (hash set) for dramatically less time. This tradeoff appears everywhere: caching, memoization, pre-computation, indexing."
        },
        {
          type: "tricky",
          q: "What's the space complexity of merge sort?",
          a: "O(n). Merge sort needs a temporary array of size n for merging. The recursive call stack adds O(log n) depth, but the dominant term is the O(n) merge buffer. Compare with quicksort: O(log n) average space (just the call stack, in-place partitioning), but O(n) worst case if the recursion is unbalanced."
        },
        {
          type: "coding",
          q: "Reverse a string in-place with O(1) extra space.",
          a: "```js\nfunction reverseString(s) {\n  const arr = s.split('');\n  let l = 0, r = arr.length - 1;\n  while (l < r) {\n    [arr[l], arr[r]] = [arr[r], arr[l]];\n    l++; r--;\n  }\n  return arr.join('');\n}\n```"
        },
        {
          type: "scenario",
          q: "Your server has limited memory but fast CPU. Should you prefer time-optimized or space-optimized algorithms?",
          a: "**Space-optimized**. With limited memory, using O(n²) time with O(1) space may be better than O(n) time with O(n) space if n is large enough to exceed memory. In practice: use streaming algorithms, process data in chunks, avoid caching everything in memory. Example: use in-place sorting (quicksort) instead of merge sort."
        },
        {
          type: "conceptual",
          q: "Does O(1) space mean the algorithm uses no memory at all?",
          a: "No. O(1) space means the **extra** memory used doesn't grow with input size. A few variables, pointers, or fixed-size buffers are O(1). The input itself still takes space. For example, reversing an array in-place uses O(1) extra space — just two pointers — even though the array itself is O(n)."
        }
      ]
    },
    {
      id: "best-worst-average-case",
      title: "Best / Worst / Average Case Analysis",
      explanation: `For the same algorithm, performance can vary depending on the **specific input**. We analyze three cases:

**Best Case (Ω — Omega):** The minimum operations for any input of size n. Example: searching for an element in an array — best case is O(1) if it's the first element.

**Worst Case (O — Big-O):** The maximum operations for any input of size n. This is what we usually report. Example: searching for an element that doesn't exist — O(n).

**Average Case (Θ — Theta):** The expected operations over all possible inputs. Often requires probability analysis. Example: on average, linear search checks n/2 elements — still O(n).

**Why worst case dominates:**
- It gives a **guarantee** — your code will NEVER be slower than this
- It's what interviewers expect
- It protects against adversarial inputs (security, production reliability)

**When average case matters:**
- Quicksort: O(n²) worst case but O(n log n) average — and it's faster in practice than merge sort
- Hash tables: O(n) worst case but O(1) average — still universally used
- Randomized algorithms: expected time is often much better than worst case

🏠 **Real-world analogy:** Commute time — Best case: no traffic (15 min). Worst case: accident on highway (90 min). Average case: typical traffic (35 min). You plan meetings based on worst case, but choose your route based on average case.`,
      codeExample: `// LINEAR SEARCH — All three cases
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}
// Best case:  O(1)   — target is first element
// Worst case: O(n)   — target is last or not present
// Average:    O(n/2) = O(n) — on average, check half the array

// QUICKSORT — Average vs Worst case
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [], right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    arr[i] < pivot ? left.push(arr[i]) : right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}
// Best/Avg:  O(n log n) — balanced partitions
// Worst:     O(n²)      — already sorted + last element as pivot!

// BINARY SEARCH — Best vs Worst
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] === target) return mid;   // Best: O(1) — found at mid
    arr[mid] < target ? lo = mid + 1 : hi = mid - 1;
  }
  return -1;
}
// Best:  O(1)      — target is at middle
// Worst: O(log n)  — target at extremes or absent

// INSERTION SORT — Shows all three cases clearly
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
// Best:  O(n)   — already sorted (inner loop never runs)
// Worst: O(n²)  — reverse sorted (inner loop runs max)
// Avg:   O(n²)  — random order`,
      exercise: `**Practice Problems:**
1. What are the best, worst, and average cases for bubble sort?
2. Why is quicksort preferred over merge sort despite having O(n²) worst case?
3. For a hash table with chaining, describe all three cases for lookup
4. An algorithm is O(n) best case and O(n²) worst case. Is it O(n) overall?
5. Design an input that triggers worst-case quicksort with last-element pivot
6. Why does insertion sort perform well on nearly-sorted data?
7. What randomization technique makes quicksort's worst case unlikely?
8. Compare best/worst/average for: linear search, binary search, hash lookup
9. A function has O(1) best case and O(n) worst case. What would you report in an interview?
10. Explain when you'd choose an O(n log n) worst-case algorithm over an O(n log n) average but O(n²) worst-case one`,
      commonMistakes: [
        "Reporting only best case to make an algorithm sound fast — interviewers want worst case or at least average case",
        "Thinking O(n²) worst case means the algorithm is always slow — quicksort is O(n²) worst case but the fastest sorting algorithm in practice",
        "Not understanding that Big-O IS the worst case by definition — saying 'worst case Big-O' is redundant",
        "Forgetting that best case of O(1) doesn't make an algorithm fast — best case rarely represents realistic inputs",
        "Confusing Theta (Θ) with Big-O — Theta is a tight bound (both upper and lower), Big-O is only upper bound"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why do we typically report worst-case complexity?",
          a: "Worst case provides a **guarantee** — no input can make the algorithm slower than this bound. It protects against adversarial inputs, which matters in security (hash DoS attacks) and production reliability. Average case requires assumptions about input distribution that may not hold. Best case is misleading and almost never useful for decision-making."
        },
        {
          type: "tricky",
          q: "Quicksort has O(n²) worst case. Why is it often preferred over merge sort which has O(n log n) worst case?",
          a: "1) Quicksort's worst case is extremely rare with random pivot selection. 2) Quicksort is **in-place** (O(log n) space vs O(n) for merge sort). 3) Quicksort has better **cache locality** — it accesses contiguous memory. 4) The constant factor in quicksort's O(n log n) average is smaller. 5) In practice, randomized quicksort almost never hits O(n²)."
        },
        {
          type: "conceptual",
          q: "What is the difference between Big-O, Big-Omega, and Big-Theta?",
          a: "**Big-O (O)**: Upper bound — 'at most this fast growth'. **Big-Omega (Ω)**: Lower bound — 'at least this fast growth'. **Big-Theta (Θ)**: Tight bound — 'exactly this growth rate'. Example: Merge sort is Θ(n log n) because it's BOTH O(n log n) and Ω(n log n). Quicksort is O(n²) but Θ(n log n) on average."
        },
        {
          type: "scenario",
          q: "Your sorting algorithm is O(n²) worst case but O(n) on nearly-sorted data. Your data is usually nearly sorted. Which algorithm should you use?",
          a: "**Insertion sort** — which is exactly this: O(n²) worst, O(n) best/nearly-sorted. If you know your data is usually nearly sorted, insertion sort outperforms O(n log n) algorithms. This is why TimSort (Python/Java's default) uses insertion sort for small/nearly-sorted subarrays within merge sort."
        }
      ]
    },
    {
      id: "amortized-analysis",
      title: "Amortized Analysis",
      explanation: `**Amortized analysis** looks at the **average cost per operation over a sequence** of operations, rather than the worst case of any single operation. Some operations are expensive occasionally but cheap most of the time.

**Why it matters:** Without amortized analysis, you'd think \`Array.push()\` is inefficient (because it sometimes needs to resize). In reality, it's O(1) amortized — the occasional O(n) resize is spread across all the cheap O(1) pushes.

**Key examples:**

**1. Dynamic Array (JavaScript Array / ArrayList):**
- Push is usually O(1) — just add to the end
- When full, the array doubles in size — this single push is O(n) (copy all elements)
- But doubling happens rarely: after 1, 2, 4, 8, 16... pushes
- Total cost for n pushes: n + n/2 + n/4 + ... ≈ 2n → O(1) amortized per push

**2. Hash Table Rehashing:**
- Insert is usually O(1)
- When load factor exceeds threshold, rehash all elements — O(n)
- Happens rarely enough that amortized cost is still O(1)

**3. Stack with multipop:**
- pop() is O(1), but multipop(k) removes k elements — O(k)
- Over n operations total, each element is pushed and popped at most once
- Amortized: O(1) per operation

**Methods of amortized analysis:**
1. **Aggregate method:** Total cost / number of operations
2. **Accounting method:** Assign "credits" to cheap operations to pay for expensive ones
3. **Potential method:** Define a potential function that captures saved-up work

🏠 **Real-world analogy:** Car insurance. Most months you pay a small premium (O(1)). One accident costs a lot (O(n)). But spread over years, the average monthly cost is still manageable — that's amortized cost.`,
      codeExample: `// DYNAMIC ARRAY — Why push() is O(1) amortized
class DynamicArray {
  constructor() {
    this.data = new Array(2);  // Start with capacity 2
    this.length = 0;
    this.capacity = 2;
  }

  push(value) {
    if (this.length === this.capacity) {
      this._resize();  // O(n) — but happens rarely!
    }
    this.data[this.length] = value;  // O(1) — happens every time
    this.length++;
  }

  _resize() {
    this.capacity *= 2;  // Double the capacity
    const newData = new Array(this.capacity);
    for (let i = 0; i < this.length; i++) {
      newData[i] = this.data[i];  // Copy all elements — O(n)
    }
    this.data = newData;
    console.log(\`Resized to \${this.capacity}\`);
  }
}

// Demonstration: push 16 elements
const arr = new DynamicArray();
for (let i = 0; i < 16; i++) {
  arr.push(i);
}
// Resizes at: 2→4 (copy 2), 4→8 (copy 4), 8→16 (copy 8)
// Total copies: 2 + 4 + 8 = 14 for 16 pushes
// Amortized: ~1 copy per push → O(1)

// TypeScript version
class DynamicArrayTS<T> {
  private data: (T | undefined)[];
  private _length: number = 0;
  private capacity: number;

  constructor(initialCapacity: number = 2) {
    this.capacity = initialCapacity;
    this.data = new Array(this.capacity);
  }

  push(value: T): void {
    if (this._length === this.capacity) {
      this.resize();
    }
    this.data[this._length] = value;
    this._length++;
  }

  private resize(): void {
    this.capacity *= 2;
    const newData: (T | undefined)[] = new Array(this.capacity);
    for (let i = 0; i < this._length; i++) {
      newData[i] = this.data[i];
    }
    this.data = newData;
  }

  get length(): number { return this._length; }
}

// ACCOUNTING METHOD INTUITION
// Each push "pays" 3 coins:
//   1 coin: for the push itself
//   2 coins: saved for future resize
// When resize happens (copy n elements),
// the n saved coins pay for it exactly.
// Result: each push costs 3 → O(1) amortized`,
      exercise: `**Practice Problems:**
1. If a dynamic array starts at size 1 and doubles, how many total copies after 32 pushes?
2. What if the array triples instead of doubles? Still O(1) amortized?
3. Why is it BAD to grow by a constant (e.g., add 10 slots each time)?
4. Explain why JavaScript's \`Array.push()\` is O(1) amortized
5. A stack supports push, pop, and multipop(k). Prove multipop is O(1) amortized
6. Hash table with load factor 0.75 resizes by 2x. What's amortized insert cost?
7. What would happen to amortized cost if we shrink the array when it's only 1/4 full?
8. Compare: ArrayList.add() in Java vs linked list append — amortized costs
9. Why doesn't pop() on a dynamic array ever need to resize?
10. Design a queue using two stacks — what's the amortized dequeue time?`,
      commonMistakes: [
        "Confusing amortized with average case — amortized is a GUARANTEE over any sequence, not a probabilistic average",
        "Thinking O(1) amortized means every operation is O(1) — some individual operations CAN be O(n), but they're rare enough",
        "Not understanding the doubling strategy — growing by a fixed amount (e.g., +10) gives O(n) amortized, not O(1)",
        "Applying amortized analysis to single operations — it only makes sense over a SEQUENCE of operations",
        "Forgetting that amortized O(1) doesn't help with real-time systems — a single O(n) resize can cause a latency spike"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is amortized time complexity and how is it different from average case?",
          a: "Amortized is the average cost per operation **guaranteed** over ANY sequence of n operations. Average case is the expected cost assuming a particular **probability distribution** of inputs. Amortized makes no assumptions about input — it's a worst-case guarantee for the total. Example: dynamic array push is O(1) amortized (guaranteed), not just O(1) on average."
        },
        {
          type: "tricky",
          q: "Is Array.push() in JavaScript O(1) or O(n)?",
          a: "Both! A single push CAN be O(n) when the internal buffer needs to resize. But over n pushes, the total work is O(n), making each push O(1) **amortized**. The resize uses a doubling strategy: total copies = 1 + 2 + 4 + ... + n/2 < n. So we report O(1) amortized. In interviews, saying 'O(1) amortized' is the correct answer."
        },
        {
          type: "conceptual",
          q: "Why does doubling the array give O(1) amortized but adding a fixed amount doesn't?",
          a: "With doubling: resize costs form a geometric series (1 + 2 + 4 + ... + n ≈ 2n), so total cost for n pushes is O(n) → O(1) each. With fixed increment k: you resize every k pushes, copying i elements on the i-th resize. Total: k + 2k + 3k + ... ≈ n²/2k → O(n) each push. Doubling ensures resizes happen *exponentially* less often."
        },
        {
          type: "scenario",
          q: "You're building a real-time system where every operation must complete within 1ms. Can you use a dynamic array?",
          a: "Not safely. Amortized O(1) means *most* pushes are fast, but a resize can take O(n) time — potentially hundreds of milliseconds for a large array. For real-time systems, use a pre-allocated fixed array, a linked list, or a dynamic array with incremental resizing (copy a few elements per push instead of all at once)."
        }
      ]
    },
    {
      id: "recursion-fundamentals",
      title: "Recursion Fundamentals",
      explanation: `**Recursion** is when a function calls itself to solve a smaller version of the same problem. Every recursive solution has two parts:

1. **Base case** — The simplest case that can be answered directly (stops the recursion)
2. **Recursive case** — Break the problem into a smaller sub-problem and call itself

**Why it matters:** Recursion is the foundation of trees, graphs, dynamic programming, backtracking, divide & conquer — most of DSA. If you don't master recursion, you can't solve 60%+ of interview problems.

**How recursion works internally:**
1. Each function call creates a new **stack frame** on the call stack
2. The frame stores: local variables, parameters, return address
3. When base case is hit, frames start **unwinding** (returning values back up)
4. If no base case is reached → **stack overflow** (infinite recursion)

**The three laws of recursion:**
1. Must have a base case
2. Must move toward the base case (problem gets smaller)
3. Must call itself

**Recursion vs the call stack:**
\`\`\`
factorial(4)
  → 4 * factorial(3)          ← stack frame 1
       → 3 * factorial(2)      ← stack frame 2
            → 2 * factorial(1)  ← stack frame 3
                 → return 1     ← base case hit!
            → return 2 * 1 = 2  ← unwind
       → return 3 * 2 = 6      ← unwind
  → return 4 * 6 = 24          ← unwind
\`\`\`

**Patterns for thinking recursively:**
1. **Leap of faith** — Assume the recursive call works correctly. Focus only on: what do I do with the result?
2. **Identify the sub-problem** — How is this problem a smaller version of itself?
3. **Identify the base case** — What's the simplest input I can answer immediately?

🏠 **Real-world analogy:** Russian nesting dolls (matryoshka). To find the smallest doll, you open each one until you find one that doesn't contain another (base case). Then you close them back up (unwinding).`,
      codeExample: `// FACTORIAL — The classic recursive example
function factorial(n) {
  if (n <= 1) return 1;        // Base case
  return n * factorial(n - 1); // Recursive case
}
// factorial(5) = 5 * 4 * 3 * 2 * 1 = 120

// FIBONACCI — Two recursive calls
function fibonacci(n) {
  if (n <= 0) return 0;        // Base case 1
  if (n === 1) return 1;       // Base case 2
  return fibonacci(n - 1) + fibonacci(n - 2); // Two sub-problems
}
// ⚠️ Time: O(2ⁿ) — very slow! We'll optimize later with DP

// SUM OF ARRAY — Recursion on arrays
function sumArray(arr, index = 0) {
  if (index === arr.length) return 0;           // Base case
  return arr[index] + sumArray(arr, index + 1); // Process one, recurse rest
}

// REVERSE A STRING — Recursion on strings
function reverseStr(str) {
  if (str.length <= 1) return str;  // Base case
  return reverseStr(str.slice(1)) + str[0]; // Last char + reverse rest
}

// POWER — O(log n) using recursion
function power(base, exp) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) {
    const half = power(base, exp / 2);
    return half * half;  // Only recurse once, square the result
  }
  return base * power(base, exp - 1);
}
// power(2, 10) — only ~4 calls instead of 10!

// TypeScript — recursive type for nested arrays
function flatten<T>(arr: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item)); // Recursive call
    } else {
      result.push(item);
    }
  }
  return result;
}

// COUNT DOWN — simplest recursion to build intuition
function countDown(n: number): void {
  if (n <= 0) {
    console.log("Done!");
    return; // Base case
  }
  console.log(n);
  countDown(n - 1); // Recursive case — smaller input
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Write a recursive function to calculate the sum of digits of a number
2. Write a recursive function to check if a string is a palindrome
3. Calculate power(base, exp) recursively in O(log n) time
4. Count the number of occurrences of a character in a string recursively
5. Write a recursive binary search
6. Implement a recursive function to find the GCD of two numbers (Euclidean)
7. Recursively generate all subsets of an array
8. Flatten a deeply nested array recursively
9. Implement Tower of Hanoi (3 pegs, n disks)
10. Write a recursive function to check if an array is sorted

**Debugging Exercise:**
\`\`\`js
// This causes stack overflow — why?
function badRecursion(n) {
  if (n === 0) return 0;
  return badRecursion(n - 2); // Bug: skips 0 when n is odd!
}
badRecursion(5); // 5 → 3 → 1 → -1 → -3 → ... 💥
\`\`\``,
      commonMistakes: [
        "Missing or wrong base case — leads to infinite recursion and stack overflow",
        "Not moving toward the base case — recursive call must make the problem SMALLER",
        "Forgetting that each recursive call uses stack space — O(n) recursion depth = O(n) space",
        "Using recursion when iteration is simpler (factorial, fibonacci) — not everything needs recursion",
        "Not using the 'leap of faith' — trying to trace every recursive call instead of trusting the recursive step"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the essential components of a recursive function?",
          a: "1) **Base case**: a condition that returns a value directly without recursion. 2) **Recursive case**: the function calls itself with a smaller/simpler input. 3) **Progress toward base case**: each recursive call must move closer to the base case. Without all three, you get infinite recursion → stack overflow."
        },
        {
          type: "tricky",
          q: "What is the time and space complexity of naive recursive fibonacci?",
          a: "**Time: O(2ⁿ)** — each call spawns two more calls, creating a binary tree of depth n. **Space: O(n)** — the call stack depth is n (only one branch is active at a time). The time is exponential because we recompute the same values: fib(5) computes fib(3) twice, fib(2) three times, etc. Fix with memoization: O(n) time and space."
        },
        {
          type: "coding",
          q: "Write a recursive function to compute x^n in O(log n) time.",
          a: "```js\nfunction power(x, n) {\n  if (n === 0) return 1;\n  if (n < 0) return 1 / power(x, -n);\n  if (n % 2 === 0) {\n    const half = power(x, n / 2);\n    return half * half;\n  }\n  return x * power(x, n - 1);\n}\n// Key insight: x^10 = (x^5)^2 — square the half instead of multiplying n times\n```"
        },
        {
          type: "conceptual",
          q: "What is the 'leap of faith' technique in recursion?",
          a: "Instead of tracing every recursive call, **assume the recursive call returns the correct answer** for the smaller problem. Then focus only on: (1) What is the base case? (2) How do I combine the result of the recursive call with the current element? Example: In sumArray, assume sumArray(rest) correctly sums the rest — then just add the current element."
        },
        {
          type: "scenario",
          q: "When should you use recursion vs iteration?",
          a: "Use **recursion** for: tree/graph traversal, divide & conquer, backtracking, problems with recursive structure (nested data). Use **iteration** for: simple loops, counting, accumulating, when stack depth is a concern. Most recursive solutions can be converted to iterative with an explicit stack. In production, prefer iteration for deep recursion to avoid stack overflow."
        }
      ]
    },
    {
      id: "call-stack-and-memory",
      title: "Call Stack & Memory Model (Stack vs Heap)",
      explanation: `Understanding how the **call stack** and **memory** work is essential for debugging, writing efficient code, and understanding recursion.

**The Call Stack:**
- A **LIFO (Last In, First Out)** data structure managed by the JavaScript engine
- Every function call pushes a **stack frame** containing: local variables, arguments, return address
- When a function returns, its frame is **popped** off the stack
- JavaScript is **single-threaded** — one call stack, one thing at a time

**Stack vs Heap:**
- **Stack memory**: Fast, automatic, limited size. Stores primitives and function references. LIFO order. Auto-cleaned when function returns.
- **Heap memory**: Larger, slower, manually collected (by GC). Stores objects, arrays, closures. No particular order. Cleaned by garbage collector.

**What goes where?**
\`\`\`
Stack:                    Heap:
├─ number: 42             ├─ { name: "Alice", age: 30 }
├─ boolean: true          ├─ [1, 2, 3, 4, 5]
├─ string ref → ──────────├─ "Hello World"
├─ object ref → ──────────├─ function() { ... }
├─ return address         └─ closure scope
└─ ...
\`\`\`

**Stack Overflow:** When the call stack exceeds its maximum size (usually 10,000-25,000 frames). Common cause: infinite recursion.

**Garbage Collection:** JavaScript uses **mark-and-sweep** — starting from root references, it marks all reachable objects and sweeps (deletes) unreachable ones. Understanding this helps avoid memory leaks.

**Memory Leaks in JavaScript:**
1. Global variables that never get cleaned
2. Forgotten event listeners
3. Closures that hold references to large objects
4. Detached DOM nodes

🏠 **Real-world analogy:** The stack is like a stack of plates — you add and remove from the top (LIFO). The heap is like a warehouse — items are placed wherever there's space, and a cleaner (GC) periodically removes items nobody needs anymore.`,
      codeExample: `// CALL STACK VISUALIZATION
function third() {
  console.log("third");   // Stack: [main, first, second, third]
  // When third() returns, its frame is popped
}
function second() {
  third();                 // Stack: [main, first, second] → pushes third
  console.log("second");
}
function first() {
  second();                // Stack: [main, first] → pushes second
  console.log("first");
}
first();                   // Stack: [main] → pushes first

// STACK OVERFLOW — exceeding call stack limit
function infiniteRecursion() {
  return infiniteRecursion(); // Never stops!
}
// infiniteRecursion(); // RangeError: Maximum call stack size exceeded

// STACK VS HEAP — primitives vs objects
let a = 10;           // Stack: a = 10
let b = a;            // Stack: b = 10 (COPY of value)
b = 20;               // a is still 10! Primitives are copied

let obj1 = { x: 1 };  // Stack: obj1 → ref to Heap object
let obj2 = obj1;       // Stack: obj2 → SAME ref in Heap
obj2.x = 99;           // obj1.x is also 99! Objects share references

// MEMORY LEAK EXAMPLE — closure holding reference
function createLeak() {
  const hugeData = new Array(1000000).fill("data");
  return function() {
    // This closure keeps 'hugeData' alive forever!
    console.log(hugeData.length);
  };
}
const leakyFn = createLeak(); // hugeData can never be GC'd

// PREVENTING MEMORY LEAKS
function noLeak() {
  const hugeData = new Array(1000000).fill("data");
  const length = hugeData.length; // Extract what you need
  return function() {
    console.log(length); // Only keeps the number, not the array
  };
}

// TypeScript — understanding value vs reference types
function demonstrateMemory(): void {
  // Primitives (stack) — passed by value
  let x: number = 5;
  let y: number = x;
  y = 10;
  console.log(x); // 5 — unchanged

  // Objects (heap) — passed by reference
  const arr1: number[] = [1, 2, 3];
  const arr2: number[] = arr1; // Same reference!
  arr2.push(4);
  console.log(arr1); // [1, 2, 3, 4] — both changed!

  // Deep copy to avoid shared references
  const arr3: number[] = [...arr1]; // New array in heap
  arr3.push(5);
  console.log(arr1); // [1, 2, 3, 4] — unchanged
}`,
      exercise: `**Practice Problems:**
1. Draw the call stack for: \`first()\` calling \`second()\` calling \`third()\`
2. What happens in memory when you do \`let a = {x:1}; let b = a; b.x = 2;\`?
3. Write code that causes a stack overflow and catch the error
4. Explain why recursive fibonacci uses O(n) space even though it makes O(2ⁿ) calls
5. Identify the memory leak in a given code snippet with closures
6. What's the maximum call stack depth in your browser? Write code to measure it
7. Explain the difference between shallow copy and deep copy in terms of heap memory
8. Why are strings sometimes said to be "on the stack" even though they're objects?
9. How does JavaScript's garbage collector know when to free memory?
10. Write a function that demonstrates pass-by-value vs pass-by-reference`,
      commonMistakes: [
        "Thinking objects are stored on the stack — objects are ALWAYS on the heap; only the reference (pointer) is on the stack",
        "Not understanding that assigning an object to a new variable copies the REFERENCE, not the object — both point to the same heap memory",
        "Thinking JavaScript has manual memory management — it uses automatic garbage collection (mark-and-sweep)",
        "Forgetting that closures keep outer scope variables alive — this can cause memory leaks if large objects are captured",
        "Confusing the call stack with the event loop — the call stack handles synchronous execution; the event loop handles async callbacks"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the call stack, and what happens when a function is called?",
          a: "The call stack is a LIFO data structure that tracks function execution. When a function is called: 1) A new **stack frame** is created containing local variables, arguments, and return address. 2) The frame is pushed onto the stack. 3) The function executes. 4) When it returns, the frame is popped. JavaScript has one call stack (single-threaded). If it gets too deep → stack overflow."
        },
        {
          type: "tricky",
          q: "What is the output?\n```js\nlet a = { val: 1 };\nlet b = a;\nb.val = 2;\nconsole.log(a.val);\nlet c = 10;\nlet d = c;\nd = 20;\nconsole.log(c);\n```",
          a: "`2` and `10`. `a` and `b` point to the **same object** on the heap — changing `b.val` changes `a.val`. `c` and `d` are **primitives** on the stack — `d = 20` creates a new value; `c` remains `10`. This is the fundamental difference between reference types and value types."
        },
        {
          type: "conceptual",
          q: "What causes a stack overflow and how do you prevent it?",
          a: "Stack overflow occurs when the call stack exceeds its size limit, usually from **infinite or very deep recursion**. Prevention: 1) Always have a valid base case. 2) Ensure progress toward the base case. 3) Convert deep recursion to iteration with an explicit stack. 4) Use tail call optimization (limited support). 5) Increase stack size (Node.js: `--stack-size` flag)."
        },
        {
          type: "scenario",
          q: "How would you debug a memory leak in a JavaScript application?",
          a: "1) Use Chrome DevTools **Memory** tab — take heap snapshots and compare. 2) Look for growing detached DOM nodes, growing arrays, or objects that should have been GC'd. 3) Common culprits: forgotten event listeners, closures capturing large objects, global variables, intervals not cleared. 4) Use `WeakMap`/`WeakRef` for caches to allow GC."
        }
      ]
    },
    {
      id: "iteration-vs-recursion",
      title: "Iteration vs Recursion",
      explanation: `Every recursive solution can be converted to an iterative one and vice versa. Choosing between them involves tradeoffs in readability, performance, and stack safety.

**Iteration:** Uses loops (\`for\`, \`while\`). Runs in O(1) extra space (no stack frames). Best for simple repetitive tasks.

**Recursion:** Function calls itself. Uses O(n) stack space (one frame per call). Best for problems with recursive structure (trees, graphs, divide & conquer).

**When to use each:**

| Criteria | Iteration | Recursion |
|----------|-----------|-----------|
| Stack space | O(1) | O(n) stack frames |
| Readability | Better for simple loops | Better for tree/graph/divide problems |
| Performance | Slight edge (no function call overhead) | Function call overhead per frame |
| Stack overflow risk | None | Yes, for deep recursion |
| Natural fit | Arrays, counting, accumulating | Trees, graphs, backtracking, D&C |

**Converting recursion to iteration:**
The universal technique is using an **explicit stack** (or queue) to simulate the call stack:
1. Replace function calls with pushing to a stack
2. Replace returns with popping from the stack
3. Replace parameters with data in the stack

**Tail recursion:** A special form where the recursive call is the LAST operation. Some engines can optimize this to use O(1) space (tail call optimization / TCO). JavaScript supports TCO in strict mode in Safari only.

🏠 **Real-world analogy:** Iteration is like walking up stairs one step at a time. Recursion is like giving instructions: "Go up one step, then follow these same instructions." Both reach the top, but recursion requires remembering where you are at each step (stack frames).`,
      codeExample: `// FACTORIAL — Both ways
// Recursive: O(n) time, O(n) space
function factorialRecursive(n) {
  if (n <= 1) return 1;
  return n * factorialRecursive(n - 1);
}

// Iterative: O(n) time, O(1) space ✅
function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// FIBONACCI — Both ways
// Recursive: O(2ⁿ) time, O(n) space 💀
function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// Iterative: O(n) time, O(1) space ✅
function fibIterative(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

// TREE TRAVERSAL — Recursion is natural, but can be iterative
// Recursive DFS
function inorderRecursive(node, result = []) {
  if (!node) return result;
  inorderRecursive(node.left, result);
  result.push(node.val);
  inorderRecursive(node.right, result);
  return result;
}

// Iterative DFS with explicit stack
function inorderIterative(root) {
  const result = [];
  const stack = [];
  let current = root;
  while (current || stack.length) {
    while (current) {
      stack.push(current);
      current = current.left;
    }
    current = stack.pop();
    result.push(current.val);
    current = current.right;
  }
  return result;
}

// TAIL RECURSION — O(1) space if engine supports TCO
function factorialTail(n: number, acc: number = 1): number {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc); // Tail position!
}
// The recursive call is the LAST thing — no work after it
// Compiler can reuse the same stack frame (TCO)

// CONVERTING RECURSION TO ITERATION — General pattern
// Recursive:
function sumRecursive(arr, i = 0) {
  if (i >= arr.length) return 0;
  return arr[i] + sumRecursive(arr, i + 1);
}

// Converted to iterative:
function sumIterative(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}`,
      exercise: `**Practice Problems:**
1. Convert recursive fibonacci to iterative — compare speed for fib(40)
2. Convert recursive binary search to iterative
3. Write both recursive and iterative versions of array reversal
4. Convert recursive tree traversal (preorder) to iterative using a stack
5. Write a recursive function to print numbers 1 to n, then convert to iterative
6. Implement GCD using both recursion and iteration
7. Convert a recursive string reversal to iterative
8. Write tail-recursive versions of: sum, factorial, fibonacci
9. When would you PREFER recursion over iteration despite the stack overhead?
10. Measure the maximum n for recursive factorial before stack overflow in your runtime`,
      commonMistakes: [
        "Always using recursion because it 'looks elegant' — for simple problems, iteration is clearer and more efficient",
        "Not realizing iterative tree traversal needs an explicit stack — you replace the implicit call stack with your own",
        "Thinking tail call optimization works everywhere — only Safari supports TCO in JavaScript; Node.js does NOT",
        "Converting recursion to iteration incorrectly — the explicit stack must mirror the call stack's behavior exactly",
        "Assuming recursion is always slower — for tree/graph problems, recursive code often runs at the same speed"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Can every recursive function be converted to iteration?",
          a: "Yes — every recursive function can be converted to iteration using an explicit stack (or queue). The call stack is just a stack managed by the runtime; you can manage your own. However, some problems are MUCH more naturally expressed recursively (tree traversal, backtracking, divide & conquer). The iterative versions can be harder to read."
        },
        {
          type: "tricky",
          q: "What is tail call optimization and does JavaScript support it?",
          a: "TCO reuses the current stack frame for a tail-position recursive call (the recursive call is the LAST operation). This makes tail recursion use O(1) space like iteration. JavaScript **technically** supports it in ES6 strict mode, but ONLY Safari implements it. V8 (Chrome/Node) intentionally doesn't implement TCO. In practice, don't rely on it — convert to iteration for deep recursion."
        },
        {
          type: "coding",
          q: "Convert this recursive function to iterative:\n```js\nfunction sumNested(arr) {\n  let sum = 0;\n  for (const item of arr) {\n    if (Array.isArray(item)) sum += sumNested(item);\n    else sum += item;\n  }\n  return sum;\n}\n```",
          a: "```js\nfunction sumNestedIterative(arr) {\n  const stack = [...arr];\n  let sum = 0;\n  while (stack.length) {\n    const item = stack.pop();\n    if (Array.isArray(item)) {\n      stack.push(...item);\n    } else {\n      sum += item;\n    }\n  }\n  return sum;\n}\n```"
        },
        {
          type: "scenario",
          q: "You need to traverse a tree with 1 million nodes. Should you use recursion or iteration?",
          a: "**Iteration** with an explicit stack. A balanced binary tree of 1M nodes has depth ~20 (log₂(1M) ≈ 20) — recursion would be fine. But if the tree is **skewed** (essentially a linked list), recursion depth = 1M → stack overflow. Iterative traversal handles any tree shape safely. In production, always use iteration for unbounded depth."
        }
      ]
    }
  ]
};

export default dsaPhase1;
