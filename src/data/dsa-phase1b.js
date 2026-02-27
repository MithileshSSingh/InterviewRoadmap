const dsaPhase1b = [
  {
    id: "mathematical-foundations",
    title: "Math for DSA (Logarithms, Powers, Modular Arithmetic)",
    explanation: `Mathematics is the backbone of algorithm analysis. You don't need a math degree, but you MUST understand these concepts to analyze complexity and solve problems.

**Logarithms (log):**
- log₂(n) = "how many times can you halve n before reaching 1?"
- log₂(8) = 3, log₂(1024) = 10, log₂(1,000,000) ≈ 20
- Every time you see "halving" in an algorithm → O(log n)
- Binary search, balanced BST operations, merge sort recursion depth

**Powers of 2:**
- 2¹⁰ = 1,024 ≈ 1 thousand
- 2²⁰ ≈ 1 million, 2³⁰ ≈ 1 billion
- If input ≤ 2²⁰, O(n²) still works. If input ≤ 2³⁰, you need O(n) or O(n log n)

**Modular Arithmetic:**
- (a + b) % m = ((a % m) + (b % m)) % m
- Used in: hashing, cyclic buffers, round-robin, clock arithmetic
- Preventing integer overflow in competitive programming

**Arithmetic & Geometric Series:**
- 1+2+3+...+n = n(n+1)/2 → O(n²) — this is why nested loops are quadratic
- 1+2+4+...+n = 2n-1 → O(n) — this is why doubling in dynamic arrays gives O(n) total

**Floor, Ceil, and Integer Division:**
- Math.floor(7/2) = 3, Math.ceil(7/2) = 4
- Used everywhere: binary search midpoint, partitioning, pagination

🏠 **Real-world analogy:** Logarithms are like the number of digits in a number — 1000 has 4 digits (log₁₀(1000)=3). Doubling your money is exponential; it takes logarithmic time to reach a goal.`,
    codeExample: `// LOGARITHM INTUITION
// How many times can you divide n by 2?
function log2(n) {
  let count = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    count++;
  }
  return count; // This IS log₂(n)
}
console.log(log2(1024)); // 10
console.log(log2(1000000)); // ~20

// MODULAR ARITHMETIC
// Useful for hashing, cyclic operations
function circularIndex(index, size) {
  return ((index % size) + size) % size; // Handles negative!
}
console.log(circularIndex(-1, 5)); // 4 (wraps around)
console.log(circularIndex(7, 5));  // 2

// Modular exponentiation (prevents overflow)
function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

// ARITHMETIC SERIES — why nested loops are O(n²)
// 1 + 2 + 3 + ... + n = n(n+1)/2
function sumOfSeries(n) {
  return n * (n + 1) / 2;
}
// This proves: for(i=0;i<n;i++) for(j=0;j<i;j++) → n(n-1)/2 ≈ n²/2 = O(n²)

// GCD — Euclidean Algorithm
function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}
// Time: O(log(min(a,b))) — very efficient!

// PRIME CHECK — O(√n)
function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// SIEVE OF ERATOSTHENES — all primes up to n
function sieve(n: number): number[] {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false;
      }
    }
  }
  return isPrime.reduce((primes, val, idx) => {
    if (val) primes.push(idx);
    return primes;
  }, []);
}`,
    exercise: `**Practice Problems:**
1. Calculate log₂(n) without using Math.log — use a while loop
2. Prove that 1+2+4+8+...+n = 2n-1 and explain why dynamic array resize is O(n) total
3. Implement modular exponentiation: (base^exp) % mod efficiently
4. Write a function to find GCD of two numbers using Euclidean algorithm
5. Check if a number is prime in O(√n) time
6. Generate all primes up to n using Sieve of Eratosthenes
7. Explain why Math.floor((low+high)/2) can overflow and how to fix it
8. Implement fast integer square root without Math.sqrt
9. Calculate nCr (combinations) using modular arithmetic
10. Why is log₂(n) = log₁₀(n) / log₁₀(2) and why doesn't the base matter in Big-O?`,
    commonMistakes: [
      "Integer overflow when computing (low + high) / 2 — use low + (high - low) / 2 or (low + high) >>> 1",
      "Forgetting that in Big-O, log base doesn't matter — log₂(n), log₃(n), log₁₀(n) all differ by a constant factor",
      "Not recognizing the arithmetic series pattern — if inner loop runs 1+2+3+...+n times, that's O(n²), not O(n)",
      "Using floating-point math for integer problems — leads to precision errors; use integer arithmetic",
      "Not knowing that √n iterations is O(√n), which is between O(log n) and O(n) — used in prime checks and some optimizations"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "Why does binary search have O(log n) complexity?",
        a: "Binary search halves the search space each iteration: n → n/2 → n/4 → ... → 1. The number of halvings until you reach 1 is log₂(n). Mathematically: n/2^k = 1 → k = log₂(n). This is why 'divide in half' algorithms are logarithmic. log₂(1,000,000) ≈ 20, so binary search checks at most 20 elements in a million-element array."
      },
      {
        type: "coding",
        q: "Write a function to find GCD of two numbers. What's its time complexity?",
        a: "```js\nfunction gcd(a, b) {\n  while (b !== 0) {\n    [a, b] = [b, a % b];\n  }\n  return a;\n}\n// Time: O(log(min(a,b))) — each step reduces the larger number by at least half\n// This is the Euclidean algorithm, one of the oldest algorithms known\n```"
      },
      {
        type: "tricky",
        q: "Why is the safe way to compute the midpoint `low + (high - low) / 2` instead of `(low + high) / 2`?",
        a: "`(low + high)` can overflow if both are large positive integers (in languages with fixed-size integers). In JavaScript, numbers are 64-bit floats so overflow is less common, but `(low + high) >>> 1` is the safest — the unsigned right shift handles large values correctly and automatically floors the result."
      }
    ]
  },
  {
    id: "bit-manipulation-basics",
    title: "Bit Manipulation Basics",
    explanation: `**Bit manipulation** operates directly on binary representations of numbers. It's extremely fast (single CPU instruction) and appears in interviews, systems programming, and optimization.

**Key operators:**
- \`&\` (AND): Both bits must be 1 → 1
- \`|\` (OR): Either bit is 1 → 1
- \`^\` (XOR): Bits must differ → 1 (same → 0)
- \`~\` (NOT): Flip all bits
- \`<<\` (Left shift): Multiply by 2ⁿ
- \`>>\` (Right shift): Divide by 2ⁿ
- \`>>>\` (Unsigned right shift): Like >> but fills with 0

**Essential tricks:**
- Check if even: \`(n & 1) === 0\`
- Check if power of 2: \`n > 0 && (n & (n-1)) === 0\`
- Swap without temp: \`a ^= b; b ^= a; a ^= b;\`
- Get i-th bit: \`(n >> i) & 1\`
- Set i-th bit: \`n | (1 << i)\`
- Clear i-th bit: \`n & ~(1 << i)\`
- Toggle i-th bit: \`n ^ (1 << i)\`

**XOR properties (crucial for interviews):**
- a ^ a = 0 (any number XOR itself is 0)
- a ^ 0 = a (XOR with 0 is identity)
- XOR is commutative and associative
- This means XOR of all elements with one missing → finds the missing one!

🏠 **Real-world analogy:** Bits are like light switches — AND means both must be ON, OR means at least one ON, XOR means exactly one ON. Bit shifting is like moving decimal places in binary.`,
    codeExample: `// BASIC OPERATIONS
console.log(5 & 3);   // 1   (101 & 011 = 001)
console.log(5 | 3);   // 7   (101 | 011 = 111)
console.log(5 ^ 3);   // 6   (101 ^ 011 = 110)
console.log(~5);       // -6  (flips all bits, two's complement)
console.log(5 << 1);   // 10  (101 → 1010, multiply by 2)
console.log(5 >> 1);   // 2   (101 → 10, divide by 2)

// CHECK EVEN/ODD — faster than modulo
function isEven(n) { return (n & 1) === 0; }
function isOdd(n)  { return (n & 1) === 1; }

// CHECK POWER OF 2
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}
// Why? Powers of 2 have exactly one bit set:
// 8 = 1000, 7 = 0111 → 1000 & 0111 = 0000 ✓

// FIND SINGLE NUMBER (all others appear twice)
function singleNumber(nums: number[]): number {
  let result = 0;
  for (const num of nums) {
    result ^= num; // XOR cancels pairs: a^a=0, 0^b=b
  }
  return result;
}
// [2,1,4,5,1,4,2] → 2^1^4^5^1^4^2 = 5

// COUNT SET BITS (Brian Kernighan's algorithm)
function countBits(n: number): number {
  let count = 0;
  while (n) {
    n &= (n - 1); // Removes lowest set bit
    count++;
  }
  return count;
}

// BIT MANIPULATION ON i-th BIT
function getBit(n, i)    { return (n >> i) & 1; }
function setBit(n, i)    { return n | (1 << i); }
function clearBit(n, i)  { return n & ~(1 << i); }
function toggleBit(n, i) { return n ^ (1 << i); }

// SWAP WITHOUT TEMP VARIABLE
function swap(a, b) {
  a ^= b;
  b ^= a;
  a ^= b;
  return [a, b];
}

// FIND MISSING NUMBER (0 to n, one missing)
function missingNumber(nums: number[]): number {
  let xor = nums.length;
  for (let i = 0; i < nums.length; i++) {
    xor ^= i ^ nums[i];
  }
  return xor;
}`,
    exercise: `**Practice Problems:**
1. Check if a number is even using bit manipulation (not modulo)
2. Find the only number that appears once in an array where others appear twice
3. Count the number of 1 bits in a number's binary representation
4. Check if a number is a power of 2 using bit manipulation
5. Find the missing number from 0 to n using XOR
6. Swap two numbers without using a temp variable
7. Find the XOR of all numbers from 1 to n without a loop
8. Given two numbers, find the number of bits you need to flip to convert one to the other
9. Reverse the bits of a 32-bit integer
10. Check if two numbers have opposite signs using XOR`,
    commonMistakes: [
      "Forgetting that JavaScript numbers are 64-bit floats — bitwise operators convert to 32-bit integers first",
      "Using bit shifts for multiplication/division when clarity matters more than micro-optimization",
      "Not understanding two's complement — ~5 is -6, not what you might expect",
      "Forgetting that XOR swap fails when a and b are the same variable (reference)",
      "Using signed right shift (>>) when you need unsigned (>>>) for negative numbers"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Find the single number in an array where every other number appears exactly twice.",
        a: "```js\nfunction singleNumber(nums) {\n  return nums.reduce((xor, num) => xor ^ num, 0);\n}\n// XOR properties: a^a=0, a^0=a\n// All pairs cancel out, leaving the single number\n// Time: O(n), Space: O(1)\n```"
      },
      {
        type: "tricky",
        q: "Why does `n & (n-1)` remove the lowest set bit?",
        a: "Consider n = 12 (1100). n-1 = 11 (1011). n & (n-1) = 1000. When you subtract 1, the lowest set bit becomes 0 and all lower bits become 1. AND-ing with the original clears the lowest set bit and preserves all higher bits. This is Brian Kernighan's trick for counting set bits."
      },
      {
        type: "conceptual",
        q: "When is bit manipulation useful in real-world applications?",
        a: "1) **Permissions/flags**: Unix file permissions (rwx = 7 = 111). 2) **Feature flags**: enable/disable features with a single integer. 3) **Network masks**: IP subnetting uses AND masking. 4) **Graphics**: pixel manipulation, alpha blending. 5) **Compression**: Huffman coding. 6) **Cryptography**: XOR is foundational. 7) **Bloom filters**: use bit arrays for membership testing."
      }
    ]
  },
  {
    id: "problem-solving-approach",
    title: "Problem-Solving Framework & Approach",
    explanation: `Having a systematic approach to solving problems is MORE important than knowing every algorithm. Top engineers and competitive programmers follow a framework — not random guessing.

**The UMPIRE Method (Interview Framework):**
1. **U**nderstand the problem — Read carefully. Ask clarifying questions. What are the inputs? Outputs? Constraints?
2. **M**atch to known patterns — Is this a sliding window? Two pointers? DP? Graph problem?
3. **P**lan your approach — Write pseudocode. Discuss time/space complexity BEFORE coding.
4. **I**mplement — Write clean, modular code. Use helper functions.
5. **R**eview — Walk through with an example. Check edge cases.
6. **E**valuate — Analyze complexity. Can you optimize?

**Pattern Recognition — The Key Skill:**
- "Find subarray with property X" → Sliding window or prefix sum
- "Find pair with property X" → Two pointers (sorted) or hash map
- "Find optimal/count/can you" → Dynamic programming
- "Generate all possibilities" → Backtracking
- "Connected components" → Graph BFS/DFS or Union-Find
- "Sorted data, find target" → Binary search
- "Top K elements" → Heap
- "String prefix matching" → Trie

**Constraint-based complexity selection:**
- n ≤ 10: O(n!) — brute force, permutations OK
- n ≤ 20: O(2ⁿ) — bitmask DP, subsets
- n ≤ 500: O(n³) — 3 nested loops OK
- n ≤ 5,000: O(n²) — 2 nested loops OK
- n ≤ 10⁶: O(n log n) — sorting OK, but not O(n²)
- n ≤ 10⁸: O(n) — single pass required
- n > 10⁸: O(log n) or O(1) — binary search or math

🏠 **Real-world analogy:** A doctor doesn't randomly prescribe medicine. They: 1) Listen to symptoms (understand), 2) Match to known conditions (pattern), 3) Decide treatment (plan), 4) Prescribe/operate (implement), 5) Follow up (review). Same process.`,
    codeExample: `// EXAMPLE: Solve "Two Sum" using the framework

// Step 1: UNDERSTAND
// Given: array of numbers, target sum
// Find: indices of two numbers that add to target
// Constraints: exactly one solution, can't use same element twice

// Step 2: MATCH PATTERN
// "Find pair" → hash map (store complement)

// Step 3: PLAN
// For each number, check if (target - number) exists in map
// If yes → return both indices
// If no → add current number to map

// Step 4: IMPLEMENT
function twoSum(nums: number[], target: number): [number, number] {
  const map = new Map<number, number>(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }

  throw new Error("No solution found");
}

// Step 5: REVIEW — trace with example
// nums = [2, 7, 11, 15], target = 9
// i=0: complement=7, map={}, add 2→0, map={2:0}
// i=1: complement=2, map={2:0} — FOUND! return [0, 1] ✓

// Step 6: EVALUATE
// Time: O(n) — single pass
// Space: O(n) — hash map
// Better than O(n²) brute force!

// CONSTRAINT-BASED APPROACH EXAMPLE
function solveProblem(n: number): string {
  if (n <= 20) return "Can use O(2^n) — bitmask/subset DP";
  if (n <= 500) return "Can use O(n³) — 3 nested loops";
  if (n <= 5000) return "Can use O(n²) — 2 nested loops";
  if (n <= 1e6) return "Need O(n log n) — sorting-based";
  if (n <= 1e8) return "Need O(n) — single pass";
  return "Need O(log n) or O(1) — binary search or math";
}

// PATTERN MATCHING EXAMPLES
// "Maximum subarray sum" → Kadane's algorithm (DP)
function maxSubarraySum(arr: number[]): number {
  let maxSoFar = arr[0];
  let maxEndingHere = arr[0];
  for (let i = 1; i < arr.length; i++) {
    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  return maxSoFar;
}

// "Find if path exists" → BFS/DFS
function hasPath(graph: Map<number, number[]>, start: number, end: number): boolean {
  const visited = new Set<number>();
  const queue = [start];
  while (queue.length) {
    const node = queue.shift()!;
    if (node === end) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const neighbor of graph.get(node) || []) {
      queue.push(neighbor);
    }
  }
  return false;
}`,
    exercise: `**Practice Problems:**
1. Using UMPIRE, solve: "Find the longest substring without repeating characters"
2. Given n = 10,000, what's the maximum acceptable time complexity?
3. Match each problem to a pattern:
   - "Find shortest path in unweighted graph" → ?
   - "Find maximum sum subarray" → ?
   - "Check if string matches pattern" → ?
4. Walk through solving "Valid Parentheses" step-by-step with the framework
5. Given constraint n ≤ 10⁵, would O(n²) solution pass? (assume 10⁸ ops/sec)
6. Practice explaining your approach BEFORE writing code for 3 problems
7. Solve a problem you've never seen — document your thinking process
8. Take a brute force O(n³) solution and optimize it step by step to O(n)
9. For a problem with multiple possible approaches, compare trade-offs
10. Simulate a 45-min interview: 5 min understand, 10 min plan, 20 min code, 10 min review`,
    commonMistakes: [
      "Jumping into coding without understanding the problem — you WILL solve the wrong problem",
      "Not asking clarifying questions in interviews — interviewers EXPECT you to ask about edge cases, constraints, and assumptions",
      "Trying to find the optimal solution immediately — start with brute force, then optimize",
      "Not considering constraints to determine acceptable complexity — n ≤ 1000 means O(n²) is fine",
      "Memorizing solutions instead of understanding patterns — you'll fail on any variation you haven't seen"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "How do you approach a problem you've never seen before in an interview?",
        a: "UMPIRE: 1) **Understand** — restate the problem, ask about edge cases and constraints. 2) **Match** — identify which pattern it fits (sliding window? DP? graph?). 3) **Plan** — describe your approach and complexity before coding. 4) **Implement** — write clean code. 5) **Review** — trace through an example. 6) **Evaluate** — discuss optimization. Starting with brute force is always valid."
      },
      {
        type: "scenario",
        q: "You're stuck on a problem in an interview. What do you do?",
        a: "1) Think out loud — the interviewer can hint. 2) Start with brute force — even O(n³) shows problem-solving. 3) Look at constraints — they tell you the expected complexity. 4) Draw examples — visual patterns emerge. 5) Try a smaller input — solve by hand. 6) Consider common patterns: hash map, two pointers, sorting. 7) Ask for a hint — better than silence."
      },
      {
        type: "conceptual",
        q: "How do constraints help you determine the expected solution?",
        a: "Constraints directly map to complexity: n ≤ 10 → O(n!), n ≤ 20 → O(2ⁿ), n ≤ 500 → O(n³), n ≤ 10⁴ → O(n²), n ≤ 10⁶ → O(n log n), n ≤ 10⁸ → O(n). If n = 10⁵, the interviewer expects O(n log n) or better. This eliminates entire categories of approaches before you start."
      }
    ]
  },
  {
    id: "input-output-patterns",
    title: "Input/Output Patterns & Edge Cases",
    explanation: `The difference between passing and failing a coding interview often comes down to **edge cases**. Handling them shows maturity and production-level thinking.

**Common edge cases by data type:**

**Arrays:**
- Empty array \`[]\`
- Single element \`[5]\`
- All identical elements \`[3,3,3,3]\`
- Already sorted / reverse sorted
- Contains negative numbers
- Contains duplicates
- Very large array (n = 10⁶)

**Strings:**
- Empty string \`""\`
- Single character \`"a"\`
- All same characters \`"aaaa"\`
- Spaces, special characters, unicode
- Palindromes
- Case sensitivity

**Numbers:**
- Zero, negative, very large
- Integer overflow
- Floating point precision
- MIN_SAFE_INTEGER / MAX_SAFE_INTEGER

**Trees/Graphs:**
- Null/empty tree
- Single node
- Skewed tree (like a linked list)
- Disconnected graph
- Cycles in graph
- Self-loops

**General patterns to always check:**
1. What if the input is empty?
2. What if there's only one element?
3. What if all elements are the same?
4. What if the input is already in the desired state (already sorted)?
5. What about negative numbers?
6. What about very large inputs?

🏠 **Real-world analogy:** Edge cases are like testing a door — you don't just check if it opens normally. You check: locked, unlocked, kicked, pulled instead of pushed, opened during an earthquake. The "normal" case is easy; the edges reveal quality.`,
    codeExample: `// EDGE CASE HANDLING — Production-quality code

// BAD: Doesn't handle edge cases
function findMaxBad(arr) {
  let max = arr[0]; // 💥 Crashes on empty array!
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// GOOD: Handles all edge cases
function findMax(arr: number[]): number | null {
  if (!arr || arr.length === 0) return null; // Empty/null check
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// BINARY SEARCH — Edge cases matter
function binarySearch(arr: number[], target: number): number {
  if (arr.length === 0) return -1;  // Edge: empty array

  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // Edge: overflow prevention
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

// PALINDROME — Edge cases
function isPalindrome(s: string): boolean {
  if (s.length <= 1) return true;  // Edge: empty or single char
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, ''); // Edge: case, specials
  let l = 0, r = cleaned.length - 1;
  while (l < r) {
    if (cleaned[l] !== cleaned[r]) return false;
    l++; r--;
  }
  return true;
}

// TEST YOUR EDGE CASES
function testEdgeCases() {
  // Array edge cases
  console.log(findMax([]));           // null
  console.log(findMax([5]));          // 5
  console.log(findMax([3,3,3]));      // 3
  console.log(findMax([-5,-1,-10]));  // -1

  // String edge cases
  console.log(isPalindrome(""));           // true
  console.log(isPalindrome("a"));          // true
  console.log(isPalindrome("A man, a plan, a canal: Panama")); // true

  // Number edge cases
  console.log(Number.MAX_SAFE_INTEGER);     // 9007199254740991
  console.log(0.1 + 0.2 === 0.3);          // false!
  console.log(Number.isNaN(NaN));           // true
}`,
    exercise: `**Practice Problems:**
1. List 5 edge cases for "reverse a linked list"
2. Write a function that handles ALL edge cases for "find two numbers that sum to target"
3. What edge cases would you test for a "valid parentheses" checker?
4. Given a binary search, what happens with: empty array, one element, target not present, duplicates?
5. Write edge case tests for: "find the longest common prefix of an array of strings"
6. What's the edge case that makes naive quicksort O(n²)?
7. List edge cases for a function that checks if a binary tree is balanced
8. Write a function that safely divides two numbers (handle 0, NaN, Infinity)
9. What are the edge cases for "merge two sorted arrays"?
10. Create a testing template that covers: empty, single, duplicates, negative, large input`,
    commonMistakes: [
      "Not checking for empty/null input — the #1 runtime error in interviews",
      "Assuming all numbers are positive — many problems have negative numbers that change the approach",
      "Not testing with the smallest valid input (n=0, n=1) — most bugs appear at boundaries",
      "Forgetting that strings can contain spaces, special characters, or be case-sensitive",
      "Not considering integer overflow — (lo + hi) / 2 can overflow in many languages"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What edge cases would you consider for a function that finds the maximum subarray sum?",
        a: "1) Empty array → return 0 or error. 2) Single element → return that element. 3) All negative numbers → return the least negative. 4) All positive → return the entire sum. 5) Mix of positive/negative. 6) Array with zeros. 7) Very large numbers (overflow). 8) Array of length 1 million (performance)."
      },
      {
        type: "scenario",
        q: "In an interview, how do you demonstrate edge case awareness?",
        a: "Before coding: 'Let me consider edge cases — empty input, single element, duplicates, negative values.' After coding: 'Let me trace through edge cases: empty array returns null, single element returns itself, all duplicates returns the value.' This shows production-level thinking and is a major positive signal."
      },
      {
        type: "coding",
        q: "Write a robust division function that handles all edge cases.",
        a: "```ts\nfunction safeDivide(a: number, b: number): number | null {\n  if (b === 0) return null;                    // Division by zero\n  if (!Number.isFinite(a) || !Number.isFinite(b)) return null; // Infinity/NaN\n  if (Number.isNaN(a) || Number.isNaN(b)) return null;\n  return a / b;\n}\n```"
      }
    ]
  },
  {
    id: "dsa-learning-plan",
    title: "30/90-Day Learning Plans & Practice Strategy",
    explanation: `A structured learning plan is the difference between spending 6 months going in circles and mastering DSA in 90 days. Here's a battle-tested roadmap.

**30-Day Plan (Crash Course — 3-4 hours/day):**
- **Week 1:** Big-O, Arrays, Strings, Hash Maps, Two Pointers
- **Week 2:** Linked Lists, Stacks, Queues, Binary Search, Sliding Window
- **Week 3:** Trees, BST, DFS/BFS, Recursion, Dynamic Programming basics
- **Week 4:** Graphs, Heaps, Greedy, Advanced DP, Mock Interviews

**90-Day Plan (Deep Mastery — 2-3 hours/day):**
- **Month 1:** Foundations + Core Data Structures (Phases 1-2)
- **Month 2:** Algorithmic Patterns + Advanced Structures (Phases 3-4)
- **Month 3:** Interview Practice + System Design + Mock Interviews (Phase 5)

**How to use LeetCode effectively:**
1. **Don't jump to hard problems** — Start with Easy, master patterns
2. **Time-box**: 25 min for Easy, 40 min for Medium, 60 min for Hard
3. **If stuck after time limit**: Read the editorial, understand the pattern, then solve from scratch without looking
4. **Track patterns, not problems** — "I solved a sliding window problem" is better than "I solved problem #3"
5. **Spaced repetition** — Re-solve problems after 3 days, 1 week, 2 weeks
6. **Focus on 150-200 curated problems** (Blind 75, NeetCode 150) not 2000+ random ones

**Mock Interview Strategy:**
- Do at least 2 mock interviews per week in Month 3
- Use: Pramp (free), Interviewing.io, or practice with a friend
- Simulate real conditions: 45 min, webcam on, think out loud
- Get feedback on: communication, approach, code quality, edge cases

**Revision Strategy:**
- Keep a mistake journal — write down every mistake and the correct pattern
- Review mistakes weekly
- Re-solve your weakest pattern every Saturday
- Teach concepts to someone else — best way to solidify understanding

**Weekly Milestone Template:**
\`\`\`
Week N:
- [ ] 10 LeetCode problems (pattern: ___)
- [ ] 1 new data structure learned
- [ ] Review mistake journal
- [ ] 1 mock interview
- [ ] Teach one concept
\`\`\`

🏠 **Real-world analogy:** You wouldn't train for a marathon by running 42km on day one. You build up: walking → jogging → running → race pace. Same with DSA: easy → medium → hard, pattern by pattern.`,
    codeExample: `// PROGRESS TRACKING TEMPLATE
const weeklyPlan = {
  week: 1,
  focus: "Arrays & Hash Maps",
  problems: [
    { name: "Two Sum", difficulty: "easy", pattern: "hash map", solved: false },
    { name: "Best Time to Buy and Sell Stock", difficulty: "easy", pattern: "kadane", solved: false },
    { name: "Contains Duplicate", difficulty: "easy", pattern: "hash set", solved: false },
    { name: "Product of Array Except Self", difficulty: "medium", pattern: "prefix sum", solved: false },
    { name: "Maximum Subarray", difficulty: "medium", pattern: "kadane/DP", solved: false },
  ],
  mockInterview: false,
  conceptsReviewed: [],
  mistakesLogged: [],
};

// SPACED REPETITION TRACKER
interface ProblemLog {
  name: string;
  pattern: string;
  firstSolved: Date;
  nextReview: Date;
  reviewCount: number;
  difficulty: "easy" | "medium" | "hard";
  notes: string;
}

function scheduleReview(log: ProblemLog): Date {
  const intervals = [3, 7, 14, 30]; // days
  const idx = Math.min(log.reviewCount, intervals.length - 1);
  const next = new Date(log.firstSolved);
  next.setDate(next.getDate() + intervals[idx]);
  return next;
}

// PATTERN TRACKER — organize by pattern, not by number
const patternTracker = {
  "Two Pointers": { solved: 0, target: 10, problems: [] },
  "Sliding Window": { solved: 0, target: 8, problems: [] },
  "Binary Search": { solved: 0, target: 8, problems: [] },
  "DFS/BFS": { solved: 0, target: 12, problems: [] },
  "Dynamic Programming": { solved: 0, target: 15, problems: [] },
  "Hash Map": { solved: 0, target: 10, problems: [] },
  "Stack": { solved: 0, target: 6, problems: [] },
  "Heap": { solved: 0, target: 6, problems: [] },
  "Greedy": { solved: 0, target: 8, problems: [] },
  "Backtracking": { solved: 0, target: 6, problems: [] },
};

// INTERVIEW SIMULATION TIMER
function startInterviewTimer(minutes: number = 45): void {
  console.log(\`⏱️ Interview started — \${minutes} min\`);
  console.log("0-5 min: Understand & clarify");
  console.log("5-10 min: Plan approach & discuss complexity");
  console.log("10-35 min: Implement solution");
  console.log("35-40 min: Test with examples & edge cases");
  console.log("40-45 min: Optimize & discuss alternatives");
}`,
    exercise: `**Action Items:**
1. Create your own 30-day study plan based on the template above
2. Sign up for LeetCode and solve the first 10 problems from Blind 75
3. Set up a mistake journal (Notion, Google Doc, or markdown file)
4. Time yourself solving an Easy problem — stay under 25 minutes
5. Find a study partner or join a Discord for accountability
6. Schedule your first mock interview (Pramp is free)
7. Create a pattern tracker spreadsheet
8. Set weekly goals: problems solved, concepts learned, mock interviews
9. Review the constraint → complexity mapping and memorize it
10. Practice explaining your solution out loud to a rubber duck (or friend)`,
    commonMistakes: [
      "Solving 500+ random LeetCode problems without tracking patterns — you'll forget most of them",
      "Spending 3 hours on one hard problem — time-box and learn from editorials",
      "Only solving Easy problems and never progressing to Medium — Medium is the interview standard",
      "Not doing mock interviews — solving problems alone is different from explaining your approach",
      "Cramming the week before interviews instead of consistent daily practice — consistency wins"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "How many LeetCode problems should I solve to be interview-ready?",
        a: "Quality over quantity. **150-200 curated problems** covering all major patterns (Blind 75, NeetCode 150) is far better than 1000 random ones. Focus on: understanding WHY a pattern works, recognizing WHEN to apply it, and being able to IMPLEMENT it clean in 20 minutes. If you can solve most Medium problems in one pattern within 25 minutes, you know that pattern."
      },
      {
        type: "scenario",
        q: "What should a typical study day look like?",
        a: "**2-3 hour block:** 1) 15 min review yesterday's mistakes. 2) 30 min study a concept/pattern. 3) 60 min solve 2-3 problems in that pattern. 4) 15 min analyze solutions and note patterns. 5) 15 min update mistake journal and pattern tracker. On weekends: mock interview + review week's mistakes. This builds both understanding AND speed."
      }
    ]
  }
];

export default dsaPhase1b;
