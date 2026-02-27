const dsaPhase2 = {
  id: "phase-2",
  title: "Phase 2: Core Data Structures",
  emoji: "🔵",
  description: "Master arrays, strings, linked lists, stacks, queues, hash tables, sets, sorting, searching, and foundational patterns.",
  topics: [
    {
      id: "arrays-deep-dive",
      title: "Arrays — Deep Dive & Internal Implementation",
      explanation: `Arrays are the most fundamental data structure — a **contiguous block of memory** that stores elements at indexed positions. In JavaScript, arrays are actually **objects with integer keys** and special length tracking, but modern engines optimize them to behave like true arrays when possible.

**Internal Implementation:**
- **Dense arrays** (all elements same type, no holes): V8 stores these like C arrays — contiguous memory, O(1) access
- **Sparse arrays** (holes or mixed types): V8 falls back to hash map storage — slower
- **Typed arrays** (Int32Array, Float64Array): True fixed-size contiguous memory, closest to C arrays

**Key operations & complexity:**
| Operation | Complexity | Why |
|-----------|-----------|-----|
| Access by index | O(1) | Direct memory offset calculation |
| Push (end) | O(1) amortized | Append + occasional resize |
| Pop (end) | O(1) | Remove last, no shifting |
| Unshift (front) | O(n) | Must shift ALL elements right |
| Shift (front) | O(n) | Must shift ALL elements left |
| Insert (middle) | O(n) | Shift elements after insertion point |
| Delete (middle) | O(n) | Shift elements to fill gap |
| Search (unsorted) | O(n) | Must scan all elements |
| Search (sorted) | O(log n) | Binary search |

**When to use arrays:**
- Need fast access by index
- Data is ordered/sequential
- Size is known or grows at the end
- Cache-friendly iteration (contiguous memory)

🏠 **Real-world analogy:** An array is like a row of lockers numbered 0, 1, 2, ... You can instantly go to locker #50 (O(1) access). But inserting a new locker in the middle means renumbering everything after it (O(n)).`,
      codeExample: `// ARRAY INTERNALS — Dense vs Sparse
const dense = [1, 2, 3, 4, 5];     // V8 optimizes: contiguous memory
const sparse = [1, , , , 5];        // Sparse! V8 uses hash map (slower)
const mixed = [1, "two", true, {}]; // Mixed types → less optimized

// KEY OPERATIONS WITH COMPLEXITY
const arr = [10, 20, 30, 40, 50];

// O(1) — access, push, pop
console.log(arr[2]);        // 30
arr.push(60);               // [10,20,30,40,50,60]
arr.pop();                  // [10,20,30,40,50]

// O(n) — unshift, shift, splice
arr.unshift(5);             // [5,10,20,30,40,50] — shifts everything!
arr.shift();                // [10,20,30,40,50]
arr.splice(2, 0, 25);       // [10,20,25,30,40,50] — insert at index 2

// BUILDING FROM SCRATCH (TypeScript)
class MyArray<T> {
  private data: Record<number, T> = {};
  private _length: number = 0;

  get length(): number { return this._length; }

  push(item: T): number {
    this.data[this._length] = item;
    this._length++;
    return this._length;
  }

  get(index: number): T | undefined {
    return this.data[index];
  }

  pop(): T | undefined {
    if (this._length === 0) return undefined;
    const last = this.data[this._length - 1];
    delete this.data[this._length - 1];
    this._length--;
    return last;
  }

  delete(index: number): T | undefined {
    const item = this.data[index];
    this.shiftItems(index);
    return item;
  }

  private shiftItems(index: number): void {
    for (let i = index; i < this._length - 1; i++) {
      this.data[i] = this.data[i + 1]; // O(n) shifting
    }
    delete this.data[this._length - 1];
    this._length--;
  }
}

// COMMON ARRAY PATTERNS
// Reverse in-place — O(n) time, O(1) space
function reverseInPlace(arr: number[]): number[] {
  let l = 0, r = arr.length - 1;
  while (l < r) {
    [arr[l], arr[r]] = [arr[r], arr[l]];
    l++; r--;
  }
  return arr;
}

// Rotate array by k positions — O(n) time, O(1) space
function rotate(arr: number[], k: number): void {
  k = k % arr.length;
  reverse(arr, 0, arr.length - 1);
  reverse(arr, 0, k - 1);
  reverse(arr, k, arr.length - 1);
}
function reverse(arr: number[], start: number, end: number): void {
  while (start < end) {
    [arr[start], arr[end]] = [arr[end], arr[start]];
    start++; end--;
  }
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Remove duplicates from a sorted array in-place — O(1) extra space
2. Rotate an array to the right by k steps
3. Find the missing number from 0 to n
4. Move all zeros to the end while maintaining order
5. Find the majority element (appears > n/2 times)
6. Merge two sorted arrays into one sorted array
7. Find the contiguous subarray with the largest sum (Kadane's)
8. Product of array except self — without division
9. Find the first missing positive integer — O(n) time, O(1) space
10. Trapping rain water — compute water trapped between bars`,
      commonMistakes: [
        "Using unshift/shift for frequent front operations — O(n) each time; use a deque or linked list instead",
        "Creating sparse arrays with `new Array(n)` without filling — leads to slower hash map storage",
        "Mutating arrays during iteration — can skip elements or cause infinite loops",
        "Not knowing that `arr.length = 0` truncates the array — this is a valid way to clear it",
        "Using `delete arr[i]` which leaves a hole — use splice instead for proper deletion"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is array access O(1) but insertion in the middle O(n)?",
          a: "Arrays are contiguous memory. Access is O(1) because the engine calculates: address = base + index × elementSize. Insertion at index i requires shifting elements i+1, i+2, ... to the right — each shift is O(1) but there are n-i elements to shift, giving O(n) worst case."
        },
        {
          type: "coding",
          q: "Move all zeros to the end of an array in-place while maintaining relative order of non-zeros.",
          a: "```js\nfunction moveZeros(arr) {\n  let insertPos = 0;\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] !== 0) {\n      [arr[insertPos], arr[i]] = [arr[i], arr[insertPos]];\n      insertPos++;\n    }\n  }\n  return arr;\n}\n// Two pointer technique — O(n) time, O(1) space\n```"
        },
        {
          type: "tricky",
          q: "What's the difference between `Array(5)` and `Array.from({length: 5})`?",
          a: "`Array(5)` creates a sparse array with 5 empty slots — `[,,,,]`. Methods like `map` skip empty slots. `Array.from({length: 5})` creates `[undefined, undefined, ...]` — a dense array where methods work correctly. Always use `Array.from` or `new Array(5).fill(0)` for usable arrays."
        },
        {
          type: "scenario",
          q: "You need to frequently add/remove from both ends. Should you use an array?",
          a: "No — array shift/unshift is O(n). Use a **deque** (double-ended queue) implemented as a doubly linked list for O(1) at both ends. In JavaScript, you can also use a circular buffer or simply use two arrays as stacks. For interview purposes, mention that arrays are not optimal for front operations."
        }
      ]
    },
    {
      id: "strings-manipulation",
      title: "String Manipulation & Pattern Matching",
      explanation: `Strings are **immutable sequences of characters**. In DSA, string problems are extremely common in interviews and often combine with arrays, hash maps, and sliding windows.

**Key facts:**
- Strings are **immutable** in JS/TS — every modification creates a new string
- String concatenation in a loop is O(n²) — use array.join() instead
- Characters are accessed like arrays: \`str[i]\` or \`str.charAt(i)\`
- Strings are compared lexicographically (dictionary order)

**Common string patterns for interviews:**
1. **Two pointers** — palindrome check, reverse
2. **Hash map/frequency count** — anagram check, character counting
3. **Sliding window** — longest substring without repeats
4. **String building** — use array + join, not string concatenation

**Internal representation:**
- JavaScript uses **UTF-16** encoding
- Most characters are 2 bytes, but emojis/rare chars are 4 bytes (surrogate pairs)
- \`str.length\` counts UTF-16 code units, not characters: \`"😀".length === 2\`

🏠 **Real-world analogy:** Strings are like text printed on paper — you can read any character instantly but can't erase or change one. To "modify" it, you photocopy with the change.`,
      codeExample: `// STRING IMMUTABILITY
let str = "Hello";
str[0] = "J";         // Silently fails! Strings are immutable
console.log(str);      // Still "Hello"
str = "J" + str.slice(1); // Create NEW string: "Jello"

// O(n²) BAD — string concatenation in loop
function buildStringBad(n: number): string {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += i.toString(); // Creates new string each time!
  }
  return result; // O(n²) total!
}

// O(n) GOOD — array + join
function buildStringGood(n: number): string {
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    parts.push(i.toString());
  }
  return parts.join(""); // O(n) total
}

// FREQUENCY COUNT — Foundation for many string problems
function charFrequency(str: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const char of str) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  return freq;
}

// IS ANAGRAM — O(n) using frequency count
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count = new Map<string, number>();
  for (const c of s) count.set(c, (count.get(c) || 0) + 1);
  for (const c of t) {
    const val = count.get(c);
    if (!val) return false;
    count.set(c, val - 1);
  }
  return true;
}

// IS PALINDROME — Two pointers O(n) time, O(1) space
function isPalindrome(s: string): boolean {
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return false;
    l++; r--;
  }
  return true;
}

// LONGEST SUBSTRING WITHOUT REPEATING — Sliding window
function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>();
  let maxLen = 0, start = 0;
  for (let end = 0; end < s.length; end++) {
    if (seen.has(s[end]) && seen.get(s[end])! >= start) {
      start = seen.get(s[end])! + 1;
    }
    seen.set(s[end], end);
    maxLen = Math.max(maxLen, end - start + 1);
  }
  return maxLen;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Reverse a string without using built-in reverse
2. Check if two strings are anagrams of each other
3. Find the first non-repeating character in a string
4. Check if a string is a valid palindrome (ignoring non-alphanumeric)
5. Longest common prefix of an array of strings
6. String compression: "aabcccccaaa" → "a2b1c5a3"
7. Longest substring without repeating characters
8. Check if string s can be formed by repeating a pattern
9. Minimum window substring containing all target characters
10. Longest palindromic substring`,
      commonMistakes: [
        "String concatenation in loops — O(n²) due to immutability; use Array.push + join",
        "Forgetting strings are immutable — str[i] = 'x' silently fails",
        "Not handling Unicode properly — '😀'.length is 2, not 1; use Array.from() or for...of",
        "Using == for string comparison when case matters — 'Hello' !== 'hello'",
        "Assuming indexOf returns boolean — it returns -1 for not found; use includes() instead"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Find the first non-repeating character in a string.",
          a: "```js\nfunction firstUnique(s) {\n  const freq = new Map();\n  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);\n  for (const c of s) {\n    if (freq.get(c) === 1) return c;\n  }\n  return null;\n}\n// O(n) time, O(1) space (at most 26 letters)\n```"
        },
        {
          type: "tricky",
          q: "Why is string concatenation in a loop O(n²)?",
          a: "Strings are immutable. Each `result += char` creates a NEW string by: 1) Allocating memory for old + new. 2) Copying the entire old string. 3) Appending the new character. If you do this n times, total copies = 1+2+3+...+n = n(n+1)/2 = O(n²). Fix: push to array, then join()."
        },
        {
          type: "coding",
          q: "Implement string compression: 'aabcccccaaa' → 'a2b1c5a3'. Return original if not shorter.",
          a: "```ts\nfunction compress(s: string): string {\n  const parts: string[] = [];\n  let i = 0;\n  while (i < s.length) {\n    let j = i;\n    while (j < s.length && s[j] === s[i]) j++;\n    parts.push(s[i] + (j - i));\n    i = j;\n  }\n  const compressed = parts.join('');\n  return compressed.length < s.length ? compressed : s;\n}\n```"
        }
      ]
    },
    {
      id: "singly-linked-list",
      title: "Singly Linked Lists — Build from Scratch",
      explanation: `A **singly linked list** is a sequence of nodes where each node contains a **value** and a **pointer to the next node**. The last node points to \`null\`.

**Why linked lists matter:**
- O(1) insertion/deletion at known positions (vs O(n) for arrays)
- No pre-allocated memory — grows/shrinks dynamically
- Foundation for stacks, queues, LRU cache, and many advanced structures

**Structure:**
\`\`\`
Head → [10|→] → [20|→] → [30|→] → [40|null]
\`\`\`

**Key operations & complexity:**
| Operation | Complexity |
|-----------|-----------|
| Access by index | O(n) — must traverse from head |
| Search | O(n) — must check each node |
| Insert at head | O(1) — redirect head pointer |
| Insert at tail | O(n) or O(1) with tail pointer |
| Delete at head | O(1) — redirect head to next |
| Delete by value | O(n) — find the node first |

**Arrays vs Linked Lists:**
- Access: Array O(1) vs LL O(n) — arrays win
- Insert/Delete at start: Array O(n) vs LL O(1) — linked lists win
- Memory: Arrays are contiguous (cache-friendly) vs LL scattered (cache-unfriendly)
- Size: Arrays fixed/resize vs LL dynamic

🏠 **Real-world analogy:** A conga line at a party. Each person (node) holds the shoulders (pointer) of the person in front. To add someone at the front, they just grab the current leader. To find the 5th person, you count from the front.`,
      codeExample: `// NODE CLASS
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// SINGLY LINKED LIST — Full implementation
class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // O(1) — Insert at head
  prepend(val) {
    this.head = new ListNode(val, this.head);
    this.size++;
  }

  // O(n) — Insert at tail
  append(val) {
    const node = new ListNode(val);
    if (!this.head) { this.head = node; }
    else {
      let curr = this.head;
      while (curr.next) curr = curr.next;
      curr.next = node;
    }
    this.size++;
  }

  // O(1) — Delete head
  deleteHead() {
    if (!this.head) return null;
    const val = this.head.val;
    this.head = this.head.next;
    this.size--;
    return val;
  }

  // O(n) — Delete by value
  delete(val) {
    if (!this.head) return false;
    if (this.head.val === val) { this.deleteHead(); return true; }
    let curr = this.head;
    while (curr.next) {
      if (curr.next.val === val) {
        curr.next = curr.next.next;
        this.size--;
        return true;
      }
      curr = curr.next;
    }
    return false;
  }

  // O(n) — Search
  contains(val) {
    let curr = this.head;
    while (curr) {
      if (curr.val === val) return true;
      curr = curr.next;
    }
    return false;
  }

  // O(n) — Print
  print() {
    const vals = [];
    let curr = this.head;
    while (curr) { vals.push(curr.val); curr = curr.next; }
    console.log(vals.join(" → ") + " → null");
  }
}

// COMMON INTERVIEW: Reverse a linked list — O(n) time, O(1) space
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;  // Save next
    curr.next = prev;         // Reverse pointer
    prev = curr;              // Move prev forward
    curr = next;              // Move curr forward
  }
  return prev; // New head
}

// TypeScript version
class ListNodeTS<T> {
  val: T;
  next: ListNodeTS<T> | null;
  constructor(val: T, next: ListNodeTS<T> | null = null) {
    this.val = val;
    this.next = next;
  }
}

// Find middle node — Fast & Slow pointers
function findMiddle<T>(head: ListNodeTS<T> | null): ListNodeTS<T> | null {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}

// Detect cycle — Floyd's algorithm
function hasCycle<T>(head: ListNodeTS<T> | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Insert a node at a given position in a linked list
2. Delete the nth node from the end in one pass
3. Reverse a singly linked list (iterative AND recursive)
4. Detect if a linked list has a cycle
5. Find the middle node of a linked list in one pass
6. Merge two sorted linked lists
7. Check if a linked list is a palindrome
8. Remove duplicates from a sorted linked list
9. Find the intersection point of two linked lists
10. Add two numbers represented as linked lists`,
      commonMistakes: [
        "Losing reference to the head — always save the head before traversing",
        "Not handling edge cases: null head, single node, deleting head node",
        "Forgetting to update size counter after insertions/deletions",
        "Off-by-one errors when traversing — `while (curr.next)` vs `while (curr)`",
        "Not using a dummy/sentinel node for operations that might change the head"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Reverse a singly linked list in-place.",
          a: "```js\nfunction reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}\n// Time: O(n), Space: O(1)\n// Key: three pointers — prev, curr, next\n```"
        },
        {
          type: "tricky",
          q: "How do you find the middle of a linked list in ONE pass?",
          a: "Use **fast and slow pointers**: slow moves 1 step, fast moves 2 steps. When fast reaches the end, slow is at the middle. This avoids O(n) to count length + O(n/2) to reach middle. Total: O(n) in a single pass."
        },
        {
          type: "conceptual",
          q: "When would you use a linked list over an array?",
          a: "Use linked lists when: 1) Frequent insertions/deletions at the front or middle. 2) Unknown or highly variable size. 3) Building other structures (stacks, queues, LRU cache). Use arrays when: 1) Need random access. 2) Data is mostly read, not modified. 3) Cache performance matters. In practice, arrays are preferred 90% of the time due to cache locality."
        }
      ]
    },
    {
      id: "doubly-linked-list",
      title: "Doubly Linked Lists & Circular Lists",
      explanation: `A **doubly linked list** has nodes with pointers to BOTH the **next** and **previous** nodes. This enables O(1) deletion of a given node and bidirectional traversal.

**Structure:**
\`\`\`
null ← [10|←→] ⇄ [20|←→] ⇄ [30|←→] ⇄ [40] → null
         ↑ Head                              ↑ Tail
\`\`\`

**Advantages over singly linked lists:**
- **O(1) deletion** of any node (if you have a reference to it)
- **Bidirectional traversal** — can go forward AND backward
- **O(1) tail operations** with tail pointer
- Used in: **LRU Cache**, browser history, text editors (undo/redo)

**Circular Linked List:**
The last node points back to the first node (and in doubly, the first points back to last). Used in: round-robin scheduling, circular buffers, playlist loops.

**Trade-offs:**
- More memory per node (extra prev pointer)
- More complex insert/delete logic (update both prev and next)
- But O(1) operations at both ends make it ideal for deques and caches

🏠 **Real-world analogy:** A doubly linked list is like a two-way street — you can drive in either direction. A singly linked list is a one-way street. A circular list is a roundabout — keeps going around.`,
      codeExample: `// DOUBLY LINKED LIST NODE
class DLLNode {
  constructor(val) {
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

// DOUBLY LINKED LIST — Full implementation
class DoublyLinkedList {
  constructor() {
    // Sentinel nodes simplify edge cases
    this.head = new DLLNode(null); // Dummy head
    this.tail = new DLLNode(null); // Dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  // O(1) — Add to front
  addFirst(val) {
    const node = new DLLNode(val);
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
    this.size++;
  }

  // O(1) — Add to back
  addLast(val) {
    const node = new DLLNode(val);
    node.prev = this.tail.prev;
    node.next = this.tail;
    this.tail.prev.next = node;
    this.tail.prev = node;
    this.size++;
  }

  // O(1) — Remove specific node (given reference)
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.size--;
    return node.val;
  }

  // O(1) — Remove from front
  removeFirst() {
    if (this.size === 0) return null;
    return this.removeNode(this.head.next);
  }

  // O(1) — Remove from back
  removeLast() {
    if (this.size === 0) return null;
    return this.removeNode(this.tail.prev);
  }
}

// LRU CACHE — Classic interview problem using DLL + Hash Map
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // key → DLLNode
    this.dll = new DoublyLinkedList();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    // Move to front (most recently used)
    this.dll.removeNode(node);
    this.dll.addFirst(node.val.value);
    // Update map reference
    this.map.set(key, this.dll.head.next);
    this.dll.head.next.val = { key, value: node.val.value };
    return node.val.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.dll.removeNode(this.map.get(key));
    }
    this.dll.addFirst({ key, value });
    this.map.set(key, this.dll.head.next);
    if (this.map.size > this.capacity) {
      const last = this.dll.tail.prev;
      this.dll.removeNode(last);
      this.map.delete(last.val.key);
    }
  }
}

// TypeScript DLL Node
class DLLNodeTS<T> {
  val: T;
  prev: DLLNodeTS<T> | null = null;
  next: DLLNodeTS<T> | null = null;
  constructor(val: T) { this.val = val; }
}`,
      exercise: `**Practice Problems:**
1. Implement a doubly linked list with addFirst, addLast, removeFirst, removeLast
2. Build an LRU Cache using a doubly linked list + hash map
3. Implement a circular linked list and traverse it
4. Flatten a multilevel doubly linked list
5. Design a browser history (back/forward) using a doubly linked list
6. Implement a deque (double-ended queue) using a doubly linked list
7. Reverse a doubly linked list
8. Find pairs in a sorted doubly linked list that sum to a target
9. Convert a binary search tree to a sorted doubly linked list
10. Implement an undo/redo system using a doubly linked list`,
      commonMistakes: [
        "Forgetting to update BOTH prev and next pointers during insert/delete — leads to broken links",
        "Not using sentinel/dummy nodes — makes head/tail edge cases much more complex",
        "Memory leaks — not nullifying prev/next when removing nodes in languages with manual memory",
        "Confusing node reference with node value — especially in LRU cache implementations",
        "Not maintaining the size counter — off-by-one errors when checking empty/full"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Design an LRU (Least Recently Used) Cache with O(1) get and put.",
          a: "```js\n// Use: DoublyLinkedList + HashMap\n// get(key): if exists, move to front, return value\n// put(key, val): if exists, update & move to front.\n//   If new: add to front. If over capacity: remove tail.\n// DLL maintains order (front=recent, back=oldest)\n// HashMap gives O(1) access to any node\n// Both get/put are O(1)\n```"
        },
        {
          type: "conceptual",
          q: "Why use sentinel (dummy) nodes in a doubly linked list?",
          a: "Sentinel nodes eliminate ALL edge cases for empty list, single element, head operations, and tail operations. Without sentinels, every method needs `if (head === null)`, `if (node === head)`, `if (node === tail)` checks. With sentinels, the same code handles all cases because there's always a node before and after the target."
        }
      ]
    },
    {
      id: "stacks",
      title: "Stacks — Implementation & Applications",
      explanation: `A **stack** is a **LIFO (Last In, First Out)** data structure. Think of a stack of plates — you add and remove from the top only.

**Operations — ALL O(1):**
- **push(item)** — Add to top
- **pop()** — Remove and return top
- **peek()/top()** — View top without removing
- **isEmpty()** — Check if stack is empty

**Where stacks appear in the real world:**
- **Call stack** — function execution tracking
- **Undo/Redo** — text editors, Ctrl+Z
- **Browser back button** — history of visited pages
- **Expression evaluation** — parentheses matching, postfix notation
- **DFS traversal** — iterative DFS uses an explicit stack

**Classic interview patterns using stacks:**
1. **Valid parentheses** — push opening, pop on closing, check match
2. **Next greater element** — monotonic stack
3. **Min stack** — O(1) getMin using auxiliary stack
4. **Evaluate postfix expression** — push numbers, pop on operators
5. **Daily temperatures** — monotonic decreasing stack

🏠 **Real-world analogy:** A Pringles can — you can only access the chip on top. To get to the bottom chip, you must remove all above it.`,
      codeExample: `// STACK — Array-based implementation
class Stack {
  constructor() {
    this.items = [];
  }
  push(item) { this.items.push(item); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

// VALID PARENTHESES — Classic stack problem
function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if ('({['.includes(char)) {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}

// MIN STACK — O(1) push, pop, getMin
class MinStack {
  private stack: number[] = [];
  private minStack: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    const min = this.minStack.length === 0
      ? val
      : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(min);
  }

  pop(): void {
    this.stack.pop();
    this.minStack.pop();
  }

  top(): number { return this.stack[this.stack.length - 1]; }
  getMin(): number { return this.minStack[this.minStack.length - 1]; }
}

// NEXT GREATER ELEMENT — Monotonic stack
function nextGreater(arr: number[]): number[] {
  const result = new Array(arr.length).fill(-1);
  const stack: number[] = []; // Stack of indices

  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[i] > arr[stack[stack.length - 1]]) {
      result[stack.pop()!] = arr[i];
    }
    stack.push(i);
  }
  return result;
}
// [4,5,2,10,8] → [5,10,10,-1,-1]

// EVALUATE POSTFIX — "3 4 + 2 *" = (3+4)*2 = 14
function evalPostfix(tokens: string[]): number {
  const stack: number[] = [];
  for (const token of tokens) {
    if ('+-*/'.includes(token)) {
      const b = stack.pop()!, a = stack.pop()!;
      if (token === '+') stack.push(a + b);
      if (token === '-') stack.push(a - b);
      if (token === '*') stack.push(a * b);
      if (token === '/') stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack[0];
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Implement a stack using an array (push, pop, peek, isEmpty)
2. Check if parentheses are balanced: "({[]})" → true, "({)}" → false
3. Reverse a string using a stack
4. Implement a Min Stack with O(1) getMin
5. Evaluate a postfix expression
6. Convert infix to postfix expression
7. Next greater element for each element in an array
8. Daily temperatures: for each day, how many days until warmer?
9. Implement a stack using two queues
10. Largest rectangle in histogram (monotonic stack)`,
      commonMistakes: [
        "Using shift/unshift for stack operations — stack should use push/pop (end of array) for O(1)",
        "Not checking isEmpty before pop/peek — causes undefined errors",
        "Forgetting to check stack is empty after processing — leftover elements mean invalid input",
        "Using a stack when a simple variable/counter would suffice (e.g., just counting parentheses depth)",
        "Not recognizing monotonic stack patterns — these are very common in interviews"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Design a Min Stack that supports push, pop, top, and getMin — all in O(1).",
          a: "```js\nclass MinStack {\n  constructor() { this.stack = []; this.mins = []; }\n  push(val) {\n    this.stack.push(val);\n    this.mins.push(this.mins.length === 0 ? val : Math.min(val, this.getMin()));\n  }\n  pop() { this.stack.pop(); this.mins.pop(); }\n  top() { return this.stack[this.stack.length - 1]; }\n  getMin() { return this.mins[this.mins.length - 1]; }\n}\n// Key: parallel min stack tracks minimum at each depth\n```"
        },
        {
          type: "conceptual",
          q: "What is a monotonic stack and when do you use it?",
          a: "A monotonic stack maintains elements in sorted order (either increasing or decreasing). Elements are popped when a new element would break the ordering. Use for: **next greater/smaller element**, **daily temperatures**, **largest rectangle in histogram**, **stock span**. Pattern: iterate array, while stack top violates condition → pop and record answer."
        }
      ]
    },
    {
      id: "queues",
      title: "Queues, Deques & Circular Queues",
      explanation: `A **queue** is a **FIFO (First In, First Out)** data structure. Like a line at a coffee shop — first person in line gets served first.

**Operations — ALL O(1) with proper implementation:**
- **enqueue(item)** — Add to back
- **dequeue()** — Remove from front
- **peek()/front()** — View front element
- **isEmpty()** — Check if empty

**Types of queues:**
1. **Queue** — Standard FIFO
2. **Deque** — Double-ended queue, add/remove from both ends
3. **Circular Queue** — Fixed-size, wraps around to reuse space
4. **Priority Queue** — Elements dequeued by priority (covered in Phase 4 with heaps)

**⚠️ Array-based queue in JavaScript is O(n) for dequeue!**
- \`arr.shift()\` is O(n) — it shifts all elements left
- For O(1) dequeue, use a linked list or circular buffer
- Or use the "pointer offset" trick (track front index)

**Where queues appear:**
- **BFS traversal** — level-order tree/graph traversal
- **Task scheduling** — print queue, process queue
- **Rate limiting** — sliding window of requests
- **Buffering** — data streams, message queues

🏠 **Real-world analogy:** A queue is a line at the bank. A deque is a hospital ER — high-priority patients can go to the front. A circular queue is a round table where everyone takes turns.`,
      codeExample: `// QUEUE — Linked list-based O(1) operations
class QueueNode {
  constructor(val) { this.val = val; this.next = null; }
}

class Queue {
  constructor() { this.front = null; this.back = null; this.size = 0; }

  enqueue(val) {
    const node = new QueueNode(val);
    if (this.back) this.back.next = node;
    this.back = node;
    if (!this.front) this.front = node;
    this.size++;
  }

  dequeue() {
    if (!this.front) return null;
    const val = this.front.val;
    this.front = this.front.next;
    if (!this.front) this.back = null;
    this.size--;
    return val;
  }

  peek() { return this.front?.val ?? null; }
  isEmpty() { return this.size === 0; }
}

// CIRCULAR QUEUE — Fixed size, O(1) all operations
class CircularQueue<T> {
  private data: (T | undefined)[];
  private front: number = 0;
  private rear: number = -1;
  private count: number = 0;
  private capacity: number;

  constructor(k: number) {
    this.capacity = k;
    this.data = new Array(k);
  }

  enqueue(val: T): boolean {
    if (this.isFull()) return false;
    this.rear = (this.rear + 1) % this.capacity;
    this.data[this.rear] = val;
    this.count++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const val = this.data[this.front];
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return val;
  }

  peek(): T | undefined { return this.isEmpty() ? undefined : this.data[this.front]; }
  isEmpty(): boolean { return this.count === 0; }
  isFull(): boolean { return this.count === this.capacity; }
}

// BFS using a queue — Level order traversal
function bfs(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

// DEQUE — Double-ended queue
class Deque {
  constructor() { this.items = []; }
  addFront(val) { this.items.unshift(val); }  // O(n) with array
  addBack(val)  { this.items.push(val); }     // O(1)
  removeFront() { return this.items.shift(); } // O(n) with array
  removeBack()  { return this.items.pop(); }   // O(1)
  peekFront()   { return this.items[0]; }
  peekBack()    { return this.items[this.items.length - 1]; }
  isEmpty()     { return this.items.length === 0; }
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Implement a queue using a linked list (O(1) enqueue/dequeue)
2. Implement a queue using two stacks
3. Implement a circular queue with fixed capacity
4. Generate binary numbers from 1 to n using a queue
5. Implement a recent counter (count requests in last 3000ms)
6. Design a hit counter using a circular buffer
7. Sliding window maximum using a deque (O(n) solution)
8. Implement a task scheduler with cooldown
9. BFS to find shortest path in a grid
10. Design a snake game using a deque`,
      commonMistakes: [
        "Using Array.shift() for queue dequeue — it's O(n) because it shifts all elements",
        "Not handling empty queue for dequeue/peek — always check isEmpty first",
        "Forgetting that circular queue uses modulo to wrap around: (index + 1) % capacity",
        "Confusing stack (LIFO) with queue (FIFO) — stack uses push/pop, queue uses push/shift or enqueue/dequeue",
        "Not realizing that BFS = queue, DFS = stack — this is fundamental"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Implement a queue using two stacks.",
          a: "```js\nclass QueueWithStacks {\n  constructor() { this.inStack = []; this.outStack = []; }\n  enqueue(val) { this.inStack.push(val); }\n  dequeue() {\n    if (!this.outStack.length) {\n      while (this.inStack.length) this.outStack.push(this.inStack.pop());\n    }\n    return this.outStack.pop();\n  }\n}\n// Amortized O(1) per operation!\n```"
        },
        {
          type: "conceptual",
          q: "What is the difference between a queue, deque, and priority queue?",
          a: "**Queue** (FIFO): add rear, remove front. **Deque**: add/remove from both ends. **Priority queue**: remove highest/lowest priority first (not FIFO). Queue uses linked list or circular buffer. Deque uses doubly linked list. Priority queue uses a heap. Use queue for BFS, deque for sliding window max, priority queue for scheduling/top-K."
        }
      ]
    },
    {
      id: "hash-tables",
      title: "Hash Tables & Hash Maps — Internal Working",
      explanation: `A **hash table** (hash map) is the most important data structure for coding interviews. It provides **O(1) average** lookup, insert, and delete by mapping keys to array indices using a **hash function**.

**How it works internally:**
1. **Hash function**: Converts key → integer index (e.g., "alice" → 42)
2. **Array of buckets**: The index maps to a position in an array
3. **Collision handling**: When two keys hash to the same index

**Collision resolution strategies:**
1. **Chaining** (most common): Each bucket holds a linked list. Collisions add to the list.
2. **Open addressing**: Find the next empty slot (linear probing, quadratic probing, double hashing)

**Load factor** = number of elements / number of buckets
- When load factor exceeds threshold (~0.75), the table **resizes** (double buckets, rehash all)
- This keeps chains short → O(1) average

**Complexity:**
| Operation | Average | Worst Case |
|-----------|---------|------------|
| Insert | O(1) | O(n) (all keys collide) |
| Lookup | O(1) | O(n) |
| Delete | O(1) | O(n) |

**JavaScript's Map vs Object:**
- \`Map\`: Any key type, preserves insertion order, has .size, iterable
- \`Object\`: String/Symbol keys only, prototype chain, not iterable by default
- For DSA: always prefer \`Map\` or \`Set\`

🏠 **Real-world analogy:** A library catalog. The hash function is like organizing books by the first letter of the author's last name (A → shelf 1, B → shelf 2). If two books start with "S" (collision), they share a shelf (chaining).`,
      codeExample: `// BUILD HASH TABLE FROM SCRATCH
class HashTable {
  constructor(size = 53) {
    this.buckets = new Array(size);
    this.size = size;
    this.count = 0;
  }

  // Simple hash function
  _hash(key) {
    let hash = 0;
    const PRIME = 31; // Prime reduces collisions
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      hash = (hash * PRIME + key.charCodeAt(i)) % this.size;
    }
    return hash;
  }

  set(key, value) {
    const idx = this._hash(key);
    if (!this.buckets[idx]) this.buckets[idx] = [];
    // Check if key exists (update)
    for (const pair of this.buckets[idx]) {
      if (pair[0] === key) { pair[1] = value; return; }
    }
    this.buckets[idx].push([key, value]);
    this.count++;
  }

  get(key) {
    const idx = this._hash(key);
    if (!this.buckets[idx]) return undefined;
    for (const pair of this.buckets[idx]) {
      if (pair[0] === key) return pair[1];
    }
    return undefined;
  }

  delete(key) {
    const idx = this._hash(key);
    if (!this.buckets[idx]) return false;
    const bucket = this.buckets[idx];
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.count--;
        return true;
      }
    }
    return false;
  }
}

// COMMON INTERVIEW PATTERNS WITH HASH MAPS

// Two Sum — O(n) with hash map
function twoSum(nums: number[], target: number): [number, number] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement)!, i];
    map.set(nums[i], i);
  }
  throw new Error("No solution");
}

// Group Anagrams — O(n * k log k)
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}

// Frequency Counter — Universal pattern
function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>();
  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(e => e[0]);
}

// Subarray Sum Equals K — Prefix sum + hash map
function subarraySum(nums: number[], k: number): number {
  const prefixCount = new Map<number, number>([[0, 1]]);
  let sum = 0, count = 0;
  for (const num of nums) {
    sum += num;
    if (prefixCount.has(sum - k)) count += prefixCount.get(sum - k)!;
    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);
  }
  return count;
}`,
      exercise: `**Practice Problems (Easy → Hard):**
1. Build a hash table from scratch with set, get, delete
2. Two Sum — find indices of two numbers that add to target
3. Check if two strings are anagrams using a hash map
4. Find the first non-repeating character in a string
5. Group anagrams from an array of strings
6. Find the longest consecutive sequence in an unsorted array
7. Count subarrays with sum equal to k (prefix sum + hash map)
8. Top K frequent elements
9. Design a consistent hashing ring (conceptual)
10. Implement an LRU Cache using hash map + doubly linked list`,
      commonMistakes: [
        "Using Object as a hash map — use Map for non-string keys, better performance, and .size property",
        "Not understanding that hash map O(1) is AVERAGE, not guaranteed — worst case with bad hash is O(n)",
        "Forgetting that Map preserves insertion order in JavaScript — this is guaranteed by the spec",
        "Using JSON.stringify as a hash key — it's slow and order-dependent for objects",
        "Not considering hash collisions in custom implementations — always handle them"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does a hash table achieve O(1) average lookup?",
          a: "1) A **hash function** converts the key to an integer index. 2) The element is stored at that index in an internal array. 3) Lookup: hash the key → go directly to that index. No scanning needed. 4) **Collisions** (two keys → same index) are handled by chaining (linked list at each bucket) or open addressing. With a good hash function and low load factor, chains are short → O(1) average."
        },
        {
          type: "coding",
          q: "Find the longest consecutive sequence in an unsorted array in O(n).",
          a: "```js\nfunction longestConsecutive(nums) {\n  const set = new Set(nums);\n  let maxLen = 0;\n  for (const num of set) {\n    if (!set.has(num - 1)) { // Start of a sequence\n      let len = 1;\n      while (set.has(num + len)) len++;\n      maxLen = Math.max(maxLen, len);\n    }\n  }\n  return maxLen;\n}\n// O(n) — each number is visited at most twice\n```"
        }
      ]
    }
  ]
};

export default dsaPhase2;
