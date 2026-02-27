const dsaPhase3b = [
  {
    id: "dynamic-programming-intro",
    title: "Dynamic Programming — Introduction & Thinking",
    explanation: `**Dynamic Programming (DP)** solves problems by breaking them into overlapping sub-problems and storing results to avoid recomputation. It's the single most important topic for coding interviews.

**When to use DP:**
1. **Optimal substructure** — optimal solution is built from optimal sub-solutions
2. **Overlapping sub-problems** — same sub-problems are solved multiple times

**DP vs other techniques:**
- **D&C** — sub-problems are INDEPENDENT (no overlap) → merge sort
- **Greedy** — make local optimal choice, no backtracking → activity selection
- **DP** — sub-problems OVERLAP, need to consider ALL options → knapsack

**Two approaches:**
1. **Top-Down (Memoization)** — Start from the big problem, recurse down, cache results
2. **Bottom-Up (Tabulation)** — Start from smallest sub-problems, build up to the answer

**The DP thinking process:**
1. Define the **state** — What does dp[i] represent?
2. Find the **recurrence** — How does dp[i] relate to smaller states?
3. Identify the **base case** — What are the smallest sub-problems?
4. Determine the **order** — Which states must be computed first?
5. Compute the **answer** — Where in the table is the final answer?

**Common DP patterns:**
- Linear DP: dp[i] depends on dp[i-1], dp[i-2], ...
- Grid DP: dp[i][j] depends on dp[i-1][j], dp[i][j-1], ...
- Interval DP: dp[i][j] = optimal over range [i, j]
- Knapsack: dp[i][w] = best using first i items with capacity w

🏠 **Real-world analogy:** DP is like writing an exam booklet. If question 5 asks "what was the answer to question 3?", you don't re-solve question 3 — you look back at your already-written answer.`,
    codeExample: `// FIBONACCI — The gateway to DP

// Naive recursion: O(2ⁿ) time — TERRIBLE
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// Top-Down (Memoization): O(n) time, O(n) space
function fibMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// Bottom-Up (Tabulation): O(n) time, O(n) space
function fibTab(n: number): number {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0; dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

// Space-Optimized: O(n) time, O(1) space
function fibOptimal(n: number): number {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

// CLIMBING STAIRS — Easy DP
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev = 1, curr = 2;
  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}
// dp[i] = dp[i-1] + dp[i-2] — same as fibonacci!

// MINIMUM COST CLIMBING STAIRS
function minCostClimbing(cost: number[]): number {
  const n = cost.length;
  const dp = new Array(n + 1).fill(0);
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]);
  }
  return dp[n];
}`,
    exercise: `**Practice Problems (Easy → Hard):**
1. Fibonacci with memoization and tabulation
2. Climbing stairs — ways to reach step n (1 or 2 steps at a time)
3. Min cost climbing stairs
4. House robber — max money without robbing adjacent houses
5. Maximum subarray (Kadane's algorithm as DP)
6. Decode ways — count decodings of a digit string
7. Longest increasing subsequence
8. Coin change — minimum coins to make amount
9. Word break — can string be segmented into dictionary words?
10. Longest common subsequence of two strings`,
    commonMistakes: [
      "Not identifying overlapping sub-problems — if sub-problems are independent, use D&C instead",
      "Forgetting the base case — every DP needs properly initialized base cases",
      "Wrong state definition — if dp[i] doesn't clearly represent something, the recurrence will be wrong",
      "Not optimizing space — many 1D DP problems only need the last 1-2 values, not the full array",
      "Jumping to DP without trying simpler approaches first — greedy or brute force may be sufficient"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is dynamic programming and when do you use it?",
        a: "DP solves problems with **overlapping sub-problems** and **optimal substructure** by storing sub-problem results to avoid recomputation. Use when: 1) The problem asks for min/max/count of ways. 2) You can break it into smaller versions of itself. 3) Recursion has repeated states. 4) Greedy provably doesn't work. Keywords: 'minimum', 'maximum', 'how many ways', 'is it possible'."
      },
      {
        type: "coding",
        q: "House Robber: Given an array of house values, find max money robbing non-adjacent houses.",
        a: "```js\nfunction rob(nums) {\n  if (nums.length === 1) return nums[0];\n  let prev2 = 0, prev1 = 0;\n  for (const n of nums) {\n    const curr = Math.max(prev1, prev2 + n);\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return prev1;\n}\n// dp[i] = max(dp[i-1], dp[i-2] + nums[i])\n// O(n) time, O(1) space\n```"
      }
    ]
  },
  {
    id: "dp-1d-problems",
    title: "DP — 1D Problems (Fibonacci, Climbing Stairs, House Robber)",
    explanation: `**1D DP** problems have a single dimension: dp[i] depends on previous values dp[i-1], dp[i-2], etc.

**Pattern recognition:**
- dp[i] = f(dp[i-1]) → **linear dependency** (can optimize to O(1) space)
- dp[i] = f(dp[i-1], dp[i-2]) → **two previous values** (Fibonacci-like)
- dp[i] = f(dp[0...i-1]) → **all previous values** (LIS pattern)

**Top 1D DP problems for interviews:**
1. **Fibonacci / Climbing Stairs** — dp[i] = dp[i-1] + dp[i-2]
2. **House Robber** — dp[i] = max(dp[i-1], dp[i-2] + nums[i])
3. **Coin Change** — dp[amount] = min(dp[amount-coin] + 1) for all coins
4. **Longest Increasing Subsequence** — dp[i] = max(dp[j] + 1) for j < i where a[j] < a[i]
5. **Word Break** — dp[i] = any dp[j] where s[j..i] is in dictionary
6. **Decode Ways** — dp[i] = dp[i-1] (valid single) + dp[i-2] (valid double)

**Space optimization:** If dp[i] only depends on the last k values, you only need k variables instead of an array. This reduces O(n) space to O(1).

🏠 **Real-world analogy:** 1D DP is like climbing a staircase where each step's cost depends on which previous steps you took. You record the best cost to reach each step, building up to the top.`,
    codeExample: `// COIN CHANGE — Min coins to make amount
function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// LONGEST INCREASING SUBSEQUENCE — O(n²) DP
function lengthOfLIS(nums: number[]): number {
  const dp = new Array(nums.length).fill(1);
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(...dp);
}

// LIS — O(n log n) with binary search
function lisOptimal(nums: number[]): number {
  const tails: number[] = [];
  for (const num of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (tails[mid] < num) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = num;
  }
  return tails.length;
}

// WORD BREAK
function wordBreak(s: string, wordDict: string[]): boolean {
  const words = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

// DECODE WAYS — "226" → "BZ"(2,26) or "VF"(22,6) or "BBF"(2,2,6)
function numDecodings(s: string): number {
  if (s[0] === '0') return 0;
  let prev2 = 1, prev1 = 1;
  for (let i = 1; i < s.length; i++) {
    let curr = 0;
    if (s[i] !== '0') curr += prev1;
    const twoDigit = parseInt(s.substring(i-1, i+1));
    if (twoDigit >= 10 && twoDigit <= 26) curr += prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

// MAXIMUM PRODUCT SUBARRAY
function maxProduct(nums: number[]): number {
  let maxProd = nums[0], minProd = nums[0], result = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < 0) [maxProd, minProd] = [minProd, maxProd];
    maxProd = Math.max(nums[i], maxProd * nums[i]);
    minProd = Math.min(nums[i], minProd * nums[i]);
    result = Math.max(result, maxProd);
  }
  return result;
}`,
    exercise: `**Practice Problems (Easy → Hard):**
1. Coin change — minimum coins to make amount
2. Coin change II — count ways to make amount
3. Longest increasing subsequence
4. Word break — can string be segmented?
5. Decode ways — count valid decodings
6. Maximum product subarray
7. Perfect squares — min number of squares that sum to n
8. Palindrome partitioning II — min cuts for palindrome substrings
9. Jump game — can you reach the end? (also solvable with greedy)
10. Delete and earn — maximize points from operations`,
    commonMistakes: [
      "Not handling zero in decode ways — '0' is invalid alone, but '10' and '20' are valid",
      "Forgetting that LIS has both O(n²) and O(n log n) solutions — interviewers often expect the faster one",
      "Not tracking both max and min product in max product subarray — negative × negative = positive",
      "Initializing dp array with wrong values — often should be 0, Infinity, or -Infinity depending on min/max",
      "Not considering the coin change 'impossible' case — return -1 if amount can't be made"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Find the length of the longest increasing subsequence in O(n log n).",
        a: "```js\nfunction lengthOfLIS(nums) {\n  const tails = [];\n  for (const num of nums) {\n    let lo = 0, hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >>> 1;\n      if (tails[mid] < num) lo = mid + 1;\n      else hi = mid;\n    }\n    tails[lo] = num; // Replace or extend\n  }\n  return tails.length;\n}\n// tails[i] = smallest tail of all increasing subsequences of length i+1\n// Binary search to find insertion point\n```"
      },
      {
        type: "conceptual",
        q: "How do you optimize 1D DP from O(n) space to O(1)?",
        a: "If dp[i] only depends on a fixed number of previous values (e.g., dp[i-1] and dp[i-2]), replace the array with variables: `prev2`, `prev1`, `curr`. After computing curr, shift: prev2 = prev1, prev1 = curr. This is called **rolling/sliding window optimization**. Works for Fibonacci, house robber, climbing stairs, decode ways."
      }
    ]
  },
  {
    id: "dp-2d-problems",
    title: "DP — 2D Problems (Grid, LCS, Edit Distance)",
    explanation: `**2D DP** problems use a table dp[i][j] where each cell depends on adjacent cells. Common in grid paths, string comparison, and interval problems.

**Common 2D DP patterns:**

**1. Grid paths:**
- dp[i][j] = number of ways / min cost to reach cell (i,j)
- Depends on: dp[i-1][j] (from above) and dp[i][j-1] (from left)

**2. Two-string problems (LCS, Edit Distance):**
- dp[i][j] = answer for first i chars of s1 and first j chars of s2
- Depends on: dp[i-1][j], dp[i][j-1], dp[i-1][j-1]

**3. Interval problems:**
- dp[i][j] = answer for range [i, j]
- Depends on: dp[i][k] and dp[k+1][j] for all k in [i, j)

**Top 2D DP problems:**
1. **Unique Paths** — ways to traverse grid from top-left to bottom-right
2. **Minimum Path Sum** — min cost path in grid
3. **LCS** — longest common subsequence of two strings
4. **Edit Distance** — min operations to transform one string to another
5. **0/1 Knapsack** — max value with weight constraint

🏠 **Real-world analogy:** 2D DP is like filling out a spreadsheet where each cell's formula references cells above and to the left. You fill row by row, and each cell builds on previously computed values.`,
    codeExample: `// UNIQUE PATHS — Grid traversal
function uniquePaths(m: number, n: number): number {
  const dp = Array.from({length: m}, () => new Array(n).fill(1));
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
    }
  }
  return dp[m-1][n-1];
}

// MINIMUM PATH SUM
function minPathSum(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  const dp = Array.from({length: m}, () => new Array(n).fill(0));
  dp[0][0] = grid[0][0];
  for (let i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];
  for (let j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1]) + grid[i][j];
    }
  }
  return dp[m-1][n-1];
}

// LONGEST COMMON SUBSEQUENCE (LCS)
function longestCommonSubsequence(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }
  }
  return dp[m][n];
}

// EDIT DISTANCE (Levenshtein)
function editDistance(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({length: m+1}, (_, i) =>
    Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) {
        dp[i][j] = dp[i-1][j-1]; // No operation needed
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i-1][j],    // Delete
          dp[i][j-1],    // Insert
          dp[i-1][j-1]   // Replace
        );
      }
    }
  }
  return dp[m][n];
}

// 0/1 KNAPSACK
function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  const dp = Array.from({length: n+1}, () => new Array(capacity+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1]);
      } else {
        dp[i][w] = dp[i-1][w];
      }
    }
  }
  return dp[n][capacity];
}`,
    exercise: `**Practice Problems (Easy → Hard):**
1. Unique paths in a grid (with and without obstacles)
2. Minimum path sum in a grid
3. Longest common subsequence
4. Edit distance (Levenshtein distance)
5. 0/1 Knapsack problem
6. Longest palindromic subsequence
7. Regular expression matching
8. Interleaving string
9. Distinct subsequences (count ways s has subsequence t)
10. Maximal square of 1s in a binary matrix`,
    commonMistakes: [
      "Off-by-one when initializing 2D DP for string problems — dp is (m+1)×(n+1), strings are 0-indexed",
      "Not initializing the first row and column for grid DP — they represent base cases",
      "Confusing subsequence (not contiguous) with substring (contiguous) — LCS is subsequence",
      "Not understanding edit distance operations — insert, delete, replace correspond to specific dp directions",
      "Using 2D space when 1D suffices — many 2D problems can be optimized to use only the previous row"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Find the edit distance between two strings.",
        a: "```js\nfunction editDistance(s1, s2) {\n  const m = s1.length, n = s2.length;\n  const dp = Array.from({length:m+1}, (_,i) => \n    Array.from({length:n+1}, (_,j) => i===0?j:j===0?i:0));\n  for (let i=1; i<=m; i++)\n    for (let j=1; j<=n; j++)\n      dp[i][j] = s1[i-1]===s2[j-1] ? dp[i-1][j-1] :\n        1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n  return dp[m][n];\n}\n// O(mn) time, O(mn) space\n```"
      },
      {
        type: "conceptual",
        q: "How does the LCS recurrence work?",
        a: "For strings s1[0..i-1] and s2[0..j-1]: If s1[i-1] === s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1 (both chars match, extend LCS). Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1]) (skip one char from either string, take the better option). Base: dp[0][j] = dp[i][0] = 0 (empty string has LCS 0)."
      }
    ]
  },
  {
    id: "dp-advanced",
    title: "DP — Advanced (Knapsack, Interval, State Machines)",
    explanation: `Advanced DP introduces more complex state representations and techniques that appear in harder interview questions.

**Knapsack variants:**
1. **0/1 Knapsack** — Each item used once: dp[i][w] = max(skip, take)
2. **Unbounded Knapsack** — Items reusable: coin change, rod cutting
3. **Bounded Knapsack** — Each item has a count limit
4. **Multi-dimensional** — Multiple constraints (weight AND volume)

**Interval DP:**
- dp[i][j] = optimal answer for range [i, j]
- Fill diagonally: length 1, then 2, then 3, ...
- Examples: matrix chain multiplication, burst balloons, palindrome partitioning

**State Machine DP:**
- Model problem as states with transitions
- dp[i][state] = best answer at position i in given state
- Examples: stock trading with cooldown, regex matching

**Bitmask DP:**
- Use bitmask to represent subset of items visited/chosen
- dp[mask][i] = best answer having visited items in mask, ending at i
- Examples: traveling salesman, shortest path visiting all nodes
- Works when n ≤ 20 (2²⁰ ≈ 1M states)

🏠 **Real-world analogy:** Advanced DP is like planning a complex trip with multiple constraints (budget, time, must-visit places). You track the best option for each combination of "places visited so far" and "budget remaining."`,
    codeExample: `// STOCK TRADING WITH COOLDOWN — State Machine DP
function maxProfitCooldown(prices: number[]): number {
  let hold = -prices[0], sold = 0, rest = 0;
  for (let i = 1; i < prices.length; i++) {
    const prevHold = hold, prevSold = sold;
    hold = Math.max(hold, rest - prices[i]);    // Buy or keep holding
    sold = hold + prices[i];                     // Wait... this is wrong
    // Correct:
    hold = Math.max(prevHold, rest - prices[i]);
    sold = prevHold + prices[i];                 // Sell what we held
    rest = Math.max(rest, prevSold);             // Rest or was just sold
  }
  return Math.max(sold, rest);
}

// BURST BALLOONS — Interval DP O(n³)
function maxCoins(nums: number[]): number {
  const n = nums.length;
  const balls = [1, ...nums, 1]; // Add boundaries
  const dp = Array.from({length: n+2}, () => new Array(n+2).fill(0));

  for (let len = 1; len <= n; len++) {
    for (let left = 1; left <= n - len + 1; left++) {
      const right = left + len - 1;
      for (let k = left; k <= right; k++) {
        dp[left][right] = Math.max(dp[left][right],
          dp[left][k-1] + balls[left-1]*balls[k]*balls[right+1] + dp[k+1][right]);
      }
    }
  }
  return dp[1][n];
}

// UNBOUNDED KNAPSACK — Rod cutting / coin change
function rodCutting(prices: number[], n: number): number {
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < prices.length; j++) {
      if (j + 1 <= i) {
        dp[i] = Math.max(dp[i], dp[i - (j+1)] + prices[j]);
      }
    }
  }
  return dp[n];
}

// BITMASK DP — Traveling Salesman (n ≤ 20)
function tsp(dist: number[][]): number {
  const n = dist.length;
  const ALL = (1 << n) - 1;
  const dp = Array.from({length: 1 << n}, () => new Array(n).fill(Infinity));
  dp[1][0] = 0; // Start at city 0

  for (let mask = 1; mask <= ALL; mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u)) || dp[mask][u] === Infinity) continue;
      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue; // Already visited
        const newMask = mask | (1 << v);
        dp[newMask][v] = Math.min(dp[newMask][v], dp[mask][u] + dist[u][v]);
      }
    }
  }

  let result = Infinity;
  for (let u = 0; u < n; u++) {
    result = Math.min(result, dp[ALL][u] + dist[u][0]);
  }
  return result;
}

// PARTITION EQUAL SUBSET SUM — 0/1 Knapsack variant
function canPartition(nums: number[]): boolean {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2 !== 0) return false;
  const target = sum / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums) {
    for (let j = target; j >= num; j--) {
      dp[j] = dp[j] || dp[j - num];
    }
  }
  return dp[target];
}`,
    exercise: `**Practice Problems:**
1. Partition equal subset sum (0/1 knapsack)
2. Target sum — assign +/- to elements to reach target
3. Coin change II — number of combinations
4. Burst balloons — maximize coins (interval DP)
5. Matrix chain multiplication — minimize operations
6. Stock trading with cooldown / at most k transactions
7. Longest palindromic subsequence (2D DP)
8. Minimum cost to cut a stick (interval DP)
9. Shortest path visiting all nodes (bitmask DP)
10. Interleaving string — check if s3 is interleaving of s1 and s2`,
    commonMistakes: [
      "Iterating in the wrong direction for 0/1 knapsack — must go right-to-left when using 1D array",
      "Confusing 0/1 knapsack (each item once) with unbounded (items reusable) — different iteration order",
      "Not recognizing state machine DP — keywords: 'state', 'cooldown', 'at most k transactions'",
      "Bitmask DP only works for n ≤ ~20 due to 2ⁿ states — don't try with n = 100",
      "Interval DP: filling in wrong order — must fill by increasing length, not row by row"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What are the different types of knapsack problems?",
        a: "1) **0/1 Knapsack**: each item once, choose to include or not. 2) **Unbounded**: items can be reused (coin change, rod cutting). 3) **Bounded**: each item has a count. Key difference in 1D optimization: 0/1 iterates capacity right-to-left, unbounded iterates left-to-right. This prevents/allows reusing items."
      },
      {
        type: "coding",
        q: "Can you partition an array into two subsets with equal sum?",
        a: "```js\nfunction canPartition(nums) {\n  const sum = nums.reduce((a,b) => a+b, 0);\n  if (sum % 2) return false;\n  const target = sum / 2;\n  const dp = new Array(target+1).fill(false);\n  dp[0] = true;\n  for (const num of nums) {\n    for (let j = target; j >= num; j--) // Right-to-left!\n      dp[j] = dp[j] || dp[j-num];\n  }\n  return dp[target];\n}\n// O(n × sum) time, O(sum) space\n```"
      }
    ]
  },
  {
    id: "memoization-vs-tabulation",
    title: "Memoization vs Tabulation — Deep Comparison",
    explanation: `Both solve DP problems by caching results, but their approaches, tradeoffs, and use cases differ significantly.

**Memoization (Top-Down):**
- Start from the main problem, recurse into sub-problems
- Cache results in a hash map or array
- Only computes sub-problems that are actually needed (lazy)
- Uses the call stack (recursion)
- Easier to write — just add caching to recursive solution

**Tabulation (Bottom-Up):**
- Start from the smallest sub-problems, build up to the answer
- Fill a table iteratively
- Computes ALL sub-problems in order (eager)
- No recursion — iterative loops
- Can be space-optimized (rolling array)

**Comparison:**
| Aspect | Memoization | Tabulation |
|--------|------------|-----------|
| Approach | Top-down | Bottom-up |
| Recursion | Yes (call stack) | No (iterative) |
| Lazy/Eager | Lazy (only needed states) | Eager (all states) |
| Space | O(n) + call stack | O(n) optimizable to O(1) |
| Stack overflow | Possible for deep recursion | Never |
| Ease | Easier to derive | Harder to get iteration order |

**When to use which:**
- **Memoization**: When not all states are needed, when recursion is natural, when you want quick implementation
- **Tabulation**: When you need all states, want to avoid stack overflow, need space optimization, or want best performance

🏠 **Real-world analogy:** Memoization is like a student who only studies what's on the exam (lazy). Tabulation is like a student who studies the entire textbook systematically (eager). Both get the same grade, but the lazy student might save time if the exam is narrow.`,
    codeExample: `// FIBONACCI — Side by side comparison

// MEMOIZATION (Top-Down)
function fibMemo(n: number, cache: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n)!;
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);
  return result;
}

// TABULATION (Bottom-Up)
function fibTab(n: number): number {
  if (n <= 1) return n;
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

// TABULATION with SPACE OPTIMIZATION
function fibOptimal(n: number): number {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// LCS — Both approaches
// Memoization
function lcsMemo(s1: string, s2: string): number {
  const cache = new Map<string, number>();
  function dp(i: number, j: number): number {
    if (i === 0 || j === 0) return 0;
    const key = \`\${i},\${j}\`;
    if (cache.has(key)) return cache.get(key)!;
    let result: number;
    if (s1[i-1] === s2[j-1]) result = dp(i-1, j-1) + 1;
    else result = Math.max(dp(i-1, j), dp(i, j-1));
    cache.set(key, result);
    return result;
  }
  return dp(s1.length, s2.length);
}

// Tabulation
function lcsTab(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s1[i-1] === s2[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}

// GENERIC MEMOIZE DECORATOR
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}`,
    exercise: `**Practice Problems:**
1. Solve climbing stairs with both memoization and tabulation
2. Solve coin change with both approaches — compare
3. Convert a tabulation solution to memoization (and vice versa)
4. Implement a generic memoize decorator in TypeScript
5. Solve unique paths with tabulation and optimize space to O(n)
6. When would memoization be MORE efficient than tabulation?
7. Write a problem where memoization causes stack overflow — convert to tabulation
8. Implement LCS with space-optimized tabulation (O(n) space)
9. Compare runtime of memo vs tab for fibonacci(40)
10. Solve house robber with both approaches`,
    commonMistakes: [
      "Using string keys for memoization cache — slow! Use tuple/array or Map with computed keys",
      "Not recognizing that memoization can stack overflow for deep recursion — switch to tabulation",
      "Assuming tabulation always computes unnecessary states — sometimes the iteration order naturally skips them",
      "Forgetting that tabulation enables space optimization (rolling array) but memoization doesn't",
      "Using memoization in production for non-recursive scenarios — tabulation is usually more efficient"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "When would you prefer memoization over tabulation?",
        a: "1) When the recursive structure is **natural and clear** — easier to derive. 2) When **not all sub-problems** are needed (sparse state space). 3) When the **iteration order** for tabulation is complex. 4) During interviews when you need a **quick correct solution**. Prefer tabulation when: you need space optimization, risk stack overflow, or need max performance."
      },
      {
        type: "tricky",
        q: "Can memoization cause stack overflow? When?",
        a: "Yes! If the recursion depth is O(n) and n is large (>10,000), the call stack overflows. Example: `fibMemo(50000)` crashes even with caching because you recurse 50,000 deep before hitting cached values. Solution: convert to tabulation (iterative), or use iterative deepening, or increase stack size."
      }
    ]
  },
  {
    id: "recursion-advanced",
    title: "Advanced Recursion (Tree Recursion, Tail Call Optimization)",
    explanation: `Advanced recursion patterns go beyond simple linear recursion. Understanding these unlocks trees, graphs, and complex problem decomposition.

**Types of recursion:**
1. **Linear recursion** — One recursive call: factorial(n) = n * factorial(n-1)
2. **Tree recursion** — Multiple recursive calls: fibonacci(n) = fib(n-1) + fib(n-2)
3. **Tail recursion** — Recursive call is the LAST operation (can be optimized to O(1) space)
4. **Mutual recursion** — Function A calls B, B calls A (e.g., even/odd checker)
5. **Nested recursion** — Argument is a recursive call: f(f(n-1))

**Tree recursion patterns:**
- Each call spawns multiple sub-calls → creates a tree of calls
- Classic: fibonacci, power set, tree traversal
- Time is usually exponential without memoization

**Tail Call Optimization (TCO):**
- When the recursive call is in **tail position** (nothing happens after it returns)
- The compiler can reuse the current stack frame → O(1) space
- JavaScript: TCO only in Safari strict mode; Node/Chrome do NOT support it
- **Practical advice:** Convert to iteration for deep recursion

**Converting to tail recursion:**
\`\`\`
// NOT tail recursive — work after the recursive call
function factorial(n) { return n * factorial(n-1); }

// TAIL recursive — accumulator carries the result
function factorial(n, acc = 1) { return n <= 1 ? acc : factorial(n-1, n*acc); }
\`\`\`

🏠 **Real-world analogy:** Tree recursion is like a phone tree where each person calls two more people. Linear recursion is one person calling the next in a chain. Tail recursion is like passing a baton in a relay — the previous runner can leave immediately.`,
    codeExample: `// TREE RECURSION — Binary tree traversal
interface TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; }

function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// TREE RECURSION — Generate all subsets
function subsets(nums: number[]): number[][] {
  if (nums.length === 0) return [[]];
  const first = nums[0];
  const rest = subsets(nums.slice(1)); // Tree: branch where first excluded
  const withFirst = rest.map(s => [first, ...s]); // Branch with first included
  return [...rest, ...withFirst];
}

// TAIL RECURSION — With accumulator
function factorialTail(n: number, acc: number = 1): number {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc); // Tail position — nothing after
}

function sumArrayTail(arr: number[], idx: number = 0, acc: number = 0): number {
  if (idx >= arr.length) return acc;
  return sumArrayTail(arr, idx + 1, acc + arr[idx]); // Tail position
}

function fibTail(n: number, a: number = 0, b: number = 1): number {
  if (n === 0) return a;
  return fibTail(n - 1, b, a + b); // Tail position!
}

// MUTUAL RECURSION
function isEven(n: number): boolean {
  if (n === 0) return true;
  return isOdd(n - 1);
}
function isOdd(n: number): boolean {
  if (n === 0) return false;
  return isEven(n - 1);
}

// CONVERTING TREE RECURSION TO ITERATIVE
// Recursive DFS
function dfsRecursive(root: TreeNode | null, result: number[] = []): number[] {
  if (!root) return result;
  result.push(root.val);
  dfsRecursive(root.left, result);
  dfsRecursive(root.right, result);
  return result;
}

// Iterative DFS with explicit stack
function dfsIterative(root: TreeNode | null): number[] {
  if (!root) return [];
  const stack: TreeNode[] = [root];
  const result: number[] = [];
  while (stack.length) {
    const node = stack.pop()!;
    result.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return result;
}

// TRAMPOLINE — Simulate TCO in JavaScript
function trampoline(fn: Function) {
  return function(...args: any[]) {
    let result = fn(...args);
    while (typeof result === 'function') {
      result = result();
    }
    return result;
  };
}

const factTrampoline = trampoline(function fact(n: number, acc = 1): any {
  if (n <= 1) return acc;
  return () => fact(n - 1, n * acc); // Return thunk instead of recursing
});
console.log(factTrampoline(100000)); // No stack overflow!`,
    exercise: `**Practice Problems:**
1. Convert factorial to tail-recursive form with accumulator
2. Convert fibonacci to tail-recursive form
3. Write tree recursion to generate all permutations
4. Convert recursive tree traversal to iterative with explicit stack
5. Implement a trampoline function to avoid stack overflow
6. Write mutual recursion for an is-even checker
7. Count nodes in a binary tree using tree recursion
8. Implement flatten(nested_list) using both recursive and iterative approaches
9. Write a recursive function to generate Sierpinski triangle pattern
10. Compare stack depth of linear vs tree recursion for the same problem`,
    commonMistakes: [
      "Not adding accumulator parameter for tail recursion — the result must be carried as an argument",
      "Relying on TCO in JavaScript — only Safari supports it; use iteration or trampoline for production",
      "Not recognizing tree recursion's exponential nature — always check if memoization is needed",
      "Writing 'fake' tail recursion where work happens after the call — n * factorial(n-1) is NOT tail recursive",
      "Using recursion for very deep problems without considering stack limits — convert to iterative"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is the difference between linear and tree recursion?",
        a: "**Linear recursion**: one recursive call per invocation, creating a chain. Space is O(n) for the call stack. Example: factorial. **Tree recursion**: multiple recursive calls, creating a tree of calls. Time is often exponential (2ⁿ for binary tree recursion). Example: fibonacci, subsets. Tree recursion often has overlapping sub-problems → use memoization."
      },
      {
        type: "coding",
        q: "Implement the trampoline pattern to prevent stack overflow in recursive functions.",
        a: "```js\nfunction trampoline(fn) {\n  return (...args) => {\n    let result = fn(...args);\n    while (typeof result === 'function') result = result();\n    return result;\n  };\n}\n// Usage: return () => recurse(n-1) instead of recurse(n-1)\n// Each 'bounce' uses constant stack space\n```"
      }
    ]
  }
];

export default dsaPhase3b;
