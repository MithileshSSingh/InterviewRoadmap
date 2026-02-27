const phase3 = {
  id: "phase-3",
  title: "Phase 3: Asynchronous JavaScript",
  emoji: "🟠",
  description: "Master the event loop, promises, async/await, and working with APIs — the heart of modern JavaScript.",
  topics: [
    {
      id: "event-loop-call-stack",
      title: "The Event Loop & Call Stack",
      explanation: `The **Event Loop** is the mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded.

**Call Stack** — A LIFO (Last In, First Out) data structure that tracks function execution. JavaScript is single-threaded, meaning only one function runs at a time.

**Web APIs** — Browser-provided APIs (setTimeout, fetch, DOM events) that handle async operations outside the main thread.

**Task Queue (Macrotask)** — Holds callbacks from setTimeout, setInterval, I/O operations.

**Microtask Queue** — Holds callbacks from Promises (.then), queueMicrotask, MutationObserver. **Microtasks have higher priority!**

**Execution order:** Call Stack → Microtasks (ALL) → Macrotask (ONE) → Microtasks → Macrotask → ...

🏠 **Real-world analogy:** The event loop is like a chef (single thread) in a restaurant. They can only cook one dish at a time (call stack), but they put orders in the oven (Web APIs) and check if anything is ready (event loop). Microtasks are like "urgent orders" that cut in line before regular orders (macrotasks).`,
      codeExample: `// Understanding execution order
console.log("1");                           // Synchronous

setTimeout(() => console.log("2"), 0);      // Macrotask

Promise.resolve().then(() => console.log("3")); // Microtask

console.log("4");                           // Synchronous

// Output: 1, 4, 3, 2
// Sync first → Microtasks → Macrotasks

// More complex example
console.log("Start");

setTimeout(() => {
  console.log("Timeout 1");
  Promise.resolve().then(() => console.log("Promise inside timeout"));
}, 0);

Promise.resolve()
  .then(() => {
    console.log("Promise 1");
    return Promise.resolve();
  })
  .then(() => console.log("Promise 2"));

setTimeout(() => console.log("Timeout 2"), 0);

console.log("End");

// Output: Start, End, Promise 1, Promise 2,
//         Timeout 1, Promise inside timeout, Timeout 2

// Visualizing the call stack
function multiply(a, b) { return a * b; }
function square(n) { return multiply(n, n); }
function printSquare(n) {
  const result = square(n); // stack: [printSquare, square, multiply]
  console.log(result);       // stack: [printSquare, console.log]
}
printSquare(5); // stack: [printSquare]

// queueMicrotask
queueMicrotask(() => console.log("Microtask!"));

// Stack overflow example
// function infinite() { infinite(); } // RangeError: Maximum call stack size exceeded`,
      exercise: `**Mini Exercise:**
1. Predict the output of code mixing console.log, setTimeout, and Promise.then
2. Draw the call stack for a series of nested function calls
3. Write code demonstrating that microtasks drain completely before macrotasks
4. Create a visualization of the event loop using console logs`,
      commonMistakes: [
        "`setTimeout(fn, 0)` doesn't execute immediately — it goes to the macrotask queue AFTER all sync code and microtasks",
        "Thinking JavaScript is multi-threaded — it's single-threaded; async operations are handled by the browser/runtime",
        "Not knowing microtasks (Promises) execute before macrotasks (setTimeout) — this is a very common interview question",
        "Long-running synchronous code blocks the event loop — use `requestAnimationFrame` or Web Workers for heavy computation",
        "Forgetting that `async/await` is syntactic sugar over Promises — `await` pauses the function, not the entire thread"
      ],
      interviewQuestions: [
        { type: "tricky", q: "What will this output?\n```js\nconsole.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');\n```", a: "`1, 4, 3, 2`. Sync code (1, 4) runs first. Then microtask queue (Promise → 3). Then macrotask queue (setTimeout → 2). Microtasks always execute before macrotasks." },
        { type: "conceptual", q: "Explain the difference between the microtask queue and the macrotask queue.", a: "**Microtask queue**: Promises (.then), queueMicrotask, MutationObserver. ALL microtasks drain after each task. **Macrotask queue**: setTimeout, setInterval, I/O, UI rendering. ONE macrotask executes per loop iteration. Microtasks have higher priority — they all execute before the next macrotask." },
        { type: "tricky", q: "What will this output?\n```js\nsetTimeout(() => console.log('A'), 0);\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => {\n  console.log('C');\n  setTimeout(() => console.log('D'), 0);\n});\nPromise.resolve().then(() => console.log('E'));\n```", a: "`C, E, A, B, D`. Both Promises (C, E) are microtasks and execute before any setTimeout (macrotask). Then timeouts execute in order: A, B, D (D was added last by the Promise callback)." },
        { type: "conceptual", q: "What is the call stack and what happens when it overflows?", a: "The call stack is a LIFO structure tracking function execution. Each function call pushes a frame; each return pops one. If the stack exceeds its size limit (typically ~10,000-25,000 frames), you get `RangeError: Maximum call stack size exceeded`. This usually happens with infinite recursion." },
        { type: "scenario", q: "Your app freezes when processing a large dataset. How would you fix it using your knowledge of the event loop?", a: "Break the work into chunks using: 1) `setTimeout(processChunk, 0)` to yield to the event loop between chunks, 2) `requestAnimationFrame` for visual updates, 3) Web Workers for truly parallel processing, 4) `requestIdleCallback` for low-priority work, 5) Async generators for lazy processing." }
      ]
    },
    {
      id: "settimeout-setinterval",
      title: "setTimeout & setInterval",
      explanation: `**setTimeout** executes a function ONCE after a specified delay (in milliseconds).
**setInterval** executes a function REPEATEDLY at a specified interval.

Both return an ID that can be used with \`clearTimeout()\`/\`clearInterval()\` to cancel them.

**Important:** The delay is the MINIMUM time, not guaranteed exact time. If the call stack is busy, the callback waits.

🏠 **Real-world analogy:** \`setTimeout\` is like setting an alarm for one time. \`setInterval\` is like setting a recurring alarm (every morning at 7am).`,
      codeExample: `// setTimeout
const timeoutId = setTimeout(() => {
  console.log("This runs after 2 seconds");
}, 2000);
clearTimeout(timeoutId); // Cancel before it fires

// setInterval
let count = 0;
const intervalId = setInterval(() => {
  count++;
  console.log(\`Tick \${count}\`);
  if (count >= 5) clearInterval(intervalId); // Stop after 5 ticks
}, 1000);

// setTimeout with arguments
setTimeout((name, greeting) => {
  console.log(\`\${greeting}, \${name}!\`);
}, 1000, "Alice", "Hello");

// Recursive setTimeout (preferred over setInterval for precise timing)
function poll(fn, interval) {
  async function tick() {
    await fn();
    setTimeout(tick, interval); // Next tick starts AFTER fn completes
  }
  tick();
}
poll(async () => {
  console.log("Polling...", new Date().toLocaleTimeString());
}, 2000);

// Debounce pattern
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Throttle pattern
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}`,
      exercise: `**Mini Exercise:**
1. Build a countdown timer that displays seconds remaining
2. Create a typing effect that reveals text one character at a time
3. Implement a polling function that fetches data every 5 seconds
4. Build a simple stopwatch with start, stop, and reset`,
      commonMistakes: [
        "`setTimeout(fn, 0)` doesn't execute immediately — it's deferred to the next macrotask cycle",
        "`setInterval` can drift — if the callback takes longer than the interval, executions stack up. Use recursive setTimeout instead",
        "Forgetting to clear intervals — memory leak! Always store the ID and clear on cleanup",
        "Passing a string to setTimeout (`setTimeout('alert(1)', 1000)`) — uses eval, security risk and worse performance",
        "The timer ID is just a number — accidentally using it instead of clearing it is a common bug"
      ],
      interviewQuestions: [
        { type: "tricky", q: "What does `setTimeout(fn, 0)` actually do?", a: "It defers `fn` to the macrotask queue. It doesn't execute immediately — it runs after: 1) All remaining synchronous code, 2) All microtasks (Promises). The minimum delay is clamped to ~4ms for nested timeouts (HTML5 spec). It's used to yield to the event loop." },
        { type: "conceptual", q: "Why is recursive setTimeout often preferred over setInterval?", a: "setInterval fires callbacks at fixed intervals regardless of execution time — if the callback takes 3s and interval is 2s, callbacks overlap. Recursive setTimeout starts the NEXT timer only after the current callback completes, ensuring consistent gaps and preventing overlap." },
        { type: "coding", q: "Implement a simple debounce function.", a: "```js\nfunction debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n```" },
        { type: "tricky", q: "What will this output?\n```js\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n```", a: "`3, 3, 3`. `var` is function-scoped — all three closures share the same `i`. By the time timeouts fire, the loop has finished and `i` is `3`. Fix with `let` (block-scoped) or IIFE." },
        { type: "scenario", q: "How would you implement a retry mechanism with exponential backoff?", a: "```js\nasync function retry(fn, maxRetries = 3) {\n  for (let i = 0; i < maxRetries; i++) {\n    try {\n      return await fn();\n    } catch (err) {\n      if (i === maxRetries - 1) throw err;\n      const delay = Math.pow(2, i) * 1000;\n      await new Promise(r => setTimeout(r, delay));\n    }\n  }\n}\n```" }
      ]
    },
    {
      id: "callbacks-callback-hell",
      title: "Callbacks & Callback Hell",
      explanation: `A **callback** is a function passed as an argument to another function, to be called when an operation completes. Before Promises, callbacks were the primary way to handle async operations.

**Callback Hell** (Pyramid of Doom) occurs when callbacks are nested inside callbacks, creating deeply indented, hard-to-read code.

**Error-first callback pattern** (Node.js convention): The first argument of the callback is an error (or null if successful).

🏠 **Real-world analogy:** Callbacks are like leaving a note for your roommate: "When the pizza arrives, put it in the oven." But callback hell is like: "When pizza arrives, put in oven. When oven beeps, cut pizza. When cut, serve on plates. When served, call everyone. When everyone seated..." — a chain of instructions that's hard to follow.`,
      codeExample: `// Basic callback pattern
function fetchUser(id, callback) {
  setTimeout(() => {
    callback(null, { id, name: "Alice" });
  }, 1000);
}

// Error-first callback (Node.js convention)
function readFile(path, callback) {
  setTimeout(() => {
    if (path === "/bad-path") {
      callback(new Error("File not found"));
    } else {
      callback(null, "File contents here");
    }
  }, 1000);
}

readFile("/good-path", (err, data) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(data);
});

// 😱 Callback Hell / Pyramid of Doom
function getUser(id, cb) {
  setTimeout(() => cb(null, { id, name: "Alice" }), 100);
}
function getPosts(userId, cb) {
  setTimeout(() => cb(null, [{ id: 1, title: "Post 1" }]), 100);
}
function getComments(postId, cb) {
  setTimeout(() => cb(null, [{ id: 1, text: "Nice!" }]), 100);
}

// The pyramid of doom
getUser(1, (err, user) => {
  if (err) return console.error(err);
  getPosts(user.id, (err, posts) => {
    if (err) return console.error(err);
    getComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err);
      console.log(user, posts, comments);
      // And deeper it goes...
    });
  });
});

// ✅ Solution: Use Promises
function getUserPromise(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: "Alice" }), 100);
  });
}`,
      exercise: `**Mini Exercise:**
1. Convert a callback-based function to return a Promise
2. Write callback-based code that reads 3 files in sequence, then refactor with Promises
3. Implement a callback-based retry mechanism
4. Create a \`callbackify\` function that converts a Promise-based function to use callbacks`,
      commonMistakes: [
        "Forgetting to handle errors in callbacks — always check the error argument first",
        "Calling the callback more than once — a callback should be called exactly once",
        "Not returning after error callbacks — code continues to execute past the error handler",
        "Mixing sync and async callbacks — if a function sometimes calls back synchronously and sometimes async, it creates confusing behavior",
        "Using callbacks when Promises/async-await is available — callbacks are legacy for most async patterns"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is callback hell and how do you avoid it?", a: "Callback hell is deeply nested callbacks creating a pyramid shape, making code hard to read, debug, and maintain. Solutions: 1) Named functions instead of anonymous, 2) Promises (.then chaining), 3) async/await, 4) Modularize — break into smaller functions, 5) Libraries like async.js." },
        { type: "conceptual", q: "What is the error-first callback pattern?", a: "A Node.js convention where the first argument of a callback is an error (or null if successful), and subsequent arguments are the result. Example: `fs.readFile(path, (err, data) => { if (err) throw err; ... })`. This standardizes error handling across async operations." },
        { type: "coding", q: "Write a function `promisify` that converts a callback-based function to return a Promise.", a: "```js\nfunction promisify(fn) {\n  return function(...args) {\n    return new Promise((resolve, reject) => {\n      fn(...args, (err, result) => {\n        if (err) reject(err);\n        else resolve(result);\n      });\n    });\n  };\n}\n```" },
        { type: "tricky", q: "Is the callback in `[1,2,3].forEach(cb)` synchronous or asynchronous?", a: "**Synchronous**. `forEach` calls the callback immediately for each element, blocking until all iterations complete. Not all callbacks are async — `setTimeout`, `fetch`, and event listeners are async, but `map`, `filter`, `forEach`, `sort` callbacks are sync." },
        { type: "scenario", q: "You inherit a codebase with deep callback nesting. How would you refactor it?", a: "1) Identify the async operations and their dependencies. 2) Wrap each callback-based function with `promisify` or rewrite as Promise-returning. 3) Replace nested callbacks with `.then()` chains or `async/await`. 4) Extract shared logic into helper functions. 5) Add proper error handling with `.catch()` or try/catch." }
      ]
    },
    {
      id: "promises",
      title: "Promises",
      explanation: `A **Promise** represents the eventual completion (or failure) of an asynchronous operation and its resulting value. It's a placeholder for a future value.

**States:** Pending → Fulfilled (resolved) OR Rejected. Once settled, a Promise is immutable.

**Creating:** \`new Promise((resolve, reject) => { ... })\`
**Consuming:** \`.then()\`, \`.catch()\`, \`.finally()\`
**Combinators:**
- \`Promise.all()\` — Wait for ALL to resolve (fails fast on any rejection)
- \`Promise.allSettled()\` — Wait for ALL to settle (never rejects)
- \`Promise.race()\` — First to settle wins
- \`Promise.any()\` — First to RESOLVE wins (ignores rejections)

🏠 **Real-world analogy:** A Promise is like ordering food online. You get an order confirmation (Promise). It's either **delivered** (resolved) or **cancelled** (rejected). You can set up actions for both outcomes. And \`Promise.all\` is like waiting for your entire group order — everyone's food must arrive before you eat.`,
      codeExample: `// Creating a Promise
const fetchUser = (id) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id <= 0) reject(new Error("Invalid ID"));
    else resolve({ id, name: "Alice", age: 25 });
  }, 1000);
});

// Consuming
fetchUser(1)
  .then(user => {
    console.log("User:", user);
    return user.id; // Return value becomes next .then's input
  })
  .then(id => console.log("User ID:", id))
  .catch(err => console.error("Error:", err.message))
  .finally(() => console.log("Done!"));

// Promise chaining — sequential async operations
function getUser(id) {
  return Promise.resolve({ id, name: "Alice" });
}
function getPosts(userId) {
  return Promise.resolve([{ id: 1, title: "Post 1" }]);
}
function getComments(postId) {
  return Promise.resolve([{ text: "Nice!" }]);
}

getUser(1)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(err => console.error(err));

// Promise.all — parallel execution, fail fast
const [users, posts, settings] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
  fetch("/api/settings").then(r => r.json())
]);

// Promise.allSettled — get results of ALL, even failures
const results = await Promise.allSettled([
  fetch("/api/users"),
  fetch("/api/bad-endpoint"),
  fetch("/api/posts")
]);
results.forEach(result => {
  if (result.status === "fulfilled") console.log("✅", result.value);
  else console.log("❌", result.reason);
});

// Promise.race — first to settle wins
const result = await Promise.race([
  fetch("/api/primary"),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000)
  )
]);

// Promise.any — first to RESOLVE wins
const fastest = await Promise.any([
  fetch("https://cdn1.example.com/data"),
  fetch("https://cdn2.example.com/data"),
  fetch("https://cdn3.example.com/data")
]);`,
      exercise: `**Mini Exercise:**
1. Create a \`delay(ms)\` function that returns a Promise
2. Implement a timeout wrapper: if a Promise doesn't resolve in N seconds, reject
3. Write a function that retries a Promise-based operation up to N times
4. Use \`Promise.allSettled\` to fetch from multiple APIs and handle partial failures`,
      commonMistakes: [
        "Not returning Promises in `.then()` chains — the next `.then()` receives `undefined`",
        "Forgetting `.catch()` at the end of a chain — unhandled rejections crash Node.js or show console warnings",
        "Creating a Promise inside a `.then()` without returning it — creates a 'floating' Promise",
        "Using `Promise.all` when one failure shouldn't stop everything — use `Promise.allSettled` instead",
        "Resolving a Promise with a Promise — it actually waits for the inner Promise to settle (auto-unwrapping)"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What are the three states of a Promise?", a: "1) **Pending** — initial state, operation not completed. 2) **Fulfilled** — operation completed successfully, has a value. 3) **Rejected** — operation failed, has a reason (error). Once fulfilled or rejected, a Promise is **settled** and its state cannot change." },
        { type: "tricky", q: "What will this output?\n```js\nPromise.resolve(1)\n  .then(x => x + 1)\n  .then(x => { throw new Error('fail') })\n  .then(x => x + 1)\n  .catch(err => 10)\n  .then(x => console.log(x));\n```", a: "`10`. The error skips the third `.then()` and goes to `.catch()`, which returns `10`. Since `.catch()` returns a resolved Promise, the final `.then()` receives `10`." },
        { type: "conceptual", q: "What is the difference between `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`?", a: "**all**: Resolves when ALL resolve, rejects on FIRST rejection. **allSettled**: Always resolves with status of ALL (never rejects). **race**: Settles with the FIRST to settle (resolve or reject). **any**: Resolves with FIRST to resolve (ignores rejections, rejects only if ALL reject)." },
        { type: "coding", q: "Implement a `timeout` wrapper for Promises.", a: "```js\nfunction withTimeout(promise, ms) {\n  const timeout = new Promise((_, reject) =>\n    setTimeout(() => reject(new Error('Timeout')), ms)\n  );\n  return Promise.race([promise, timeout]);\n}\n```" },
        { type: "scenario", q: "You need to fetch data from 3 APIs. 2 are critical, 1 is optional. How would you handle this?", a: "Use `Promise.allSettled` for all 3, then check results: ```js\nconst [users, orders, recommendations] = await Promise.allSettled([...]);\nif (users.status === 'rejected') throw users.reason;\nif (orders.status === 'rejected') throw orders.reason;\nconst recs = recommendations.status === 'fulfilled' ? recommendations.value : [];\n```" }
      ]
    },
    {
      id: "async-await",
      title: "async/await",
      explanation: `\`async/await\` is syntactic sugar over Promises that makes asynchronous code look and behave like synchronous code. It's the modern, preferred way to handle async operations.

**\`async\` function** — Always returns a Promise. If you return a value, it's wrapped in \`Promise.resolve()\`.
**\`await\`** — Pauses execution of the async function until the Promise resolves. Can only be used inside \`async\` functions (or top-level in modules).

🏠 **Real-world analogy:** \`async/await\` is like reading a recipe step by step. "Mix the flour, AWAIT until it's smooth, then add eggs, AWAIT until blended." Each step finishes before the next starts, but the kitchen (event loop) isn't blocked — the chef can check other things while waiting.`,
      codeExample: `// Basic async/await
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  const user = await response.json();
  return user; // Automatically wrapped in Promise.resolve()
}

// Error handling with try/catch
async function loadData() {
  try {
    const user = await fetchUser(1);
    const posts = await fetch(\`/api/posts?userId=\${user.id}\`);
    const data = await posts.json();
    return { user, posts: data };
  } catch (error) {
    console.error("Failed to load:", error.message);
    throw error; // Re-throw for caller to handle
  } finally {
    console.log("Loading complete");
  }
}

// Parallel async operations (DON'T await sequentially!)
// ❌ BAD — sequential (slow!)
async function fetchSequential() {
  const users = await fetch("/api/users");    // Wait 1s
  const posts = await fetch("/api/posts");    // Wait another 1s
  // Total: 2 seconds
}

// ✅ GOOD — parallel (fast!)
async function fetchParallel() {
  const [users, posts] = await Promise.all([
    fetch("/api/users"),
    fetch("/api/posts")
  ]);
  // Total: ~1 second (parallel)
}

// Async iteration
async function* generatePages(url) {
  let page = 1;
  while (true) {
    const res = await fetch(\`\${url}?page=\${page}\`);
    const data = await res.json();
    if (data.length === 0) break;
    yield data;
    page++;
  }
}

// for await...of
async function getAllPages() {
  for await (const page of generatePages("/api/items")) {
    console.log("Page:", page);
  }
}

// Top-level await (ES Modules only)
// const config = await fetch("/config.json").then(r => r.json());

// Async class methods
class ApiClient {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  }
}`,
      exercise: `**Mini Exercise:**
1. Convert a Promise chain to async/await
2. Implement parallel data fetching with proper error handling
3. Write an async function that retries a fetch up to 3 times
4. Build a simple async queue that processes tasks one at a time`,
      commonMistakes: [
        "Awaiting in a loop (sequential) when operations are independent — use `Promise.all` for parallel execution",
        "Forgetting try/catch — unhandled rejections in async functions go to `.catch()` or crash the process",
        "Using `await` at the top level without modules — only works in ES Modules or Chrome DevTools",
        "Returning `await promise` vs `return promise` — they're almost the same, but `return await` in try/catch catches the error",
        "Forgetting that `async` functions always return a Promise — even if you return a plain value"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "How does `async/await` work under the hood?", a: "`async/await` is syntactic sugar over Promises and generators. An `async` function returns a Promise. When `await` is encountered, the function is paused (like `yield` in a generator), the Promise is registered, and control returns to the event loop. When the Promise resolves, execution resumes from the pause point." },
        { type: "tricky", q: "What's the difference between `return await promise` and `return promise`?", a: "Usually identical, but inside `try/catch`, `return await promise` catches the rejection in the current `catch` block, while `return promise` passes the rejection to the CALLER's error handler. Best practice: use `return await` inside try/catch, otherwise just `return`." },
        { type: "coding", q: "Write an async function that fetches data with retry and exponential backoff.", a: "```js\nasync function fetchWithRetry(url, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try {\n      const res = await fetch(url);\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      return await res.json();\n    } catch (err) {\n      if (i === retries - 1) throw err;\n      await new Promise(r => setTimeout(r, 2 ** i * 1000));\n    }\n  }\n}\n```" },
        { type: "tricky", q: "What will happen?\n```js\nasync function foo() {\n  return 42;\n}\nconsole.log(foo());\n```", a: "`Promise { 42 }`. `async` functions ALWAYS return a Promise. Even though `42` is a plain value, it's wrapped in `Promise.resolve(42)`. To get the value, use `foo().then(v => console.log(v))` or `await foo()`." },
        { type: "scenario", q: "You need to process 1000 API calls but the server only allows 10 concurrent requests. How do you handle this?", a: "Use a concurrency limiter: ```js\nasync function pool(tasks, concurrency) {\n  const results = [];\n  const executing = new Set();\n  for (const task of tasks) {\n    const p = task().then(r => (executing.delete(p), r));\n    executing.add(p);\n    results.push(p);\n    if (executing.size >= concurrency)\n      await Promise.race(executing);\n  }\n  return Promise.all(results);\n}\n```" }
      ]
    },
    {
      id: "fetch-api",
      title: "Fetch API & HTTP Requests",
      explanation: `The **Fetch API** provides a modern, Promise-based way to make HTTP requests. It replaces the older \`XMLHttpRequest\`.

**\`fetch(url, options)\`** returns a Promise that resolves to a \`Response\` object.

Key points:
- \`fetch\` only rejects on **network errors**, NOT on HTTP errors (4xx, 5xx)
- You must check \`response.ok\` or \`response.status\` for HTTP errors
- Response body can be read ONCE: \`.json()\`, \`.text()\`, \`.blob()\`, \`.arrayBuffer()\`

🏠 **Real-world analogy:** \`fetch\` is like sending a letter (request) and waiting for a reply (response). The postal service (network) delivers it. You might get a reply saying "denied" (404/500), but the delivery itself succeeded — that's why fetch doesn't reject on HTTP errors.`,
      codeExample: `// GET request
async function getUsers() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  return response.json();
}

// POST request
async function createUser(userData) {
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer token123"
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return response.json();
}

// PUT, PATCH, DELETE
async function updateUser(id, data) {
  return fetch(\`/api/users/\${id}\`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

async function deleteUser(id) {
  return fetch(\`/api/users/\${id}\`, { method: "DELETE" });
}

// Reusable API client
class ApiClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }
  async request(endpoint, options = {}) {
    const url = \`\${this.baseURL}\${endpoint}\`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${this.token}\`,
        ...options.headers
      }
    });
    if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    return res.json();
  }
  get(endpoint) { return this.request(endpoint); }
  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST", body: JSON.stringify(data)
    });
  }
}

// Abort a request
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000); // Cancel after 5s
try {
  const res = await fetch("/api/data", { signal: controller.signal });
} catch (err) {
  if (err.name === "AbortError") console.log("Request cancelled");
}`,
      exercise: `**Mini Exercise:**
1. Build a function that fetches data with timeout using AbortController
2. Create an API wrapper class with get, post, put, delete methods
3. Implement request caching — don't re-fetch if data was fetched within last 5 minutes
4. Build a simple data fetching hook with loading, error, and data states`,
      commonMistakes: [
        "`fetch` does NOT reject on HTTP errors (404, 500) — it only rejects on network failures. Always check `response.ok`!",
        "Reading the response body twice — `.json()`, `.text()` etc. can only be called ONCE. Clone with `response.clone()` if needed",
        "Forgetting `Content-Type: application/json` header for POST/PUT requests",
        "Not handling the AbortError when using AbortController — it's a normal error that should be caught",
        "Sending credentials (cookies) — `fetch` doesn't send cookies by default for cross-origin. Use `credentials: 'include'`"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "Why doesn't `fetch` reject on 404 or 500 errors?", a: "`fetch` considers the request successful if a response is received from the server, regardless of status code. A 404/500 IS a valid HTTP response. `fetch` only rejects on network failures (DNS error, offline, CORS blocked). You must check `response.ok` (true for 200-299) manually." },
        { type: "coding", q: "Write a `fetchWithTimeout` function that rejects after a specified time.", a: "```js\nasync function fetchWithTimeout(url, options = {}, timeout = 5000) {\n  const controller = new AbortController();\n  const id = setTimeout(() => controller.abort(), timeout);\n  try {\n    const response = await fetch(url, {\n      ...options,\n      signal: controller.signal\n    });\n    clearTimeout(id);\n    return response;\n  } catch (err) {\n    clearTimeout(id);\n    throw err;\n  }\n}\n```" },
        { type: "conceptual", q: "What is the difference between `fetch` and `XMLHttpRequest`?", a: "`fetch`: Promise-based, cleaner API, no callback hell, supports streaming, built-in AbortController, doesn't reject on HTTP errors. `XMLHttpRequest`: Event-based, supports progress events natively, can be synchronous (bad practice), works in older browsers. `fetch` is the modern standard." },
        { type: "tricky", q: "What happens if you call `response.json()` twice?", a: "The second call throws: `TypeError: body stream already read`. Response bodies are streams that can only be consumed once. To read multiple times, clone first: `const clone = response.clone(); await response.json(); await clone.text();`" },
        { type: "scenario", q: "How would you implement request deduplication for the same URL?", a: "```js\nconst pending = new Map();\nasync function dedupedFetch(url) {\n  if (pending.has(url)) return pending.get(url);\n  const promise = fetch(url).then(r => r.json()).finally(() => pending.delete(url));\n  pending.set(url, promise);\n  return promise;\n}\n// Multiple calls to same URL reuse the same request\n```" }
      ]
    },
    {
      id: "error-handling-async",
      title: "Error Handling in Async Code",
      explanation: `Async error handling requires different patterns than synchronous code because errors can occur in callbacks, Promises, or async functions at different points in time.

**Promise errors:** Use \`.catch()\` at the end of chains
**async/await errors:** Use \`try/catch\` blocks
**Global handlers:** \`window.onunhandledrejection\` and \`window.onerror\`

🏠 **Real-world analogy:** Async error handling is like having contingency plans for a project. If Step 3 fails (API down), you need a plan B that doesn't crash the entire project. And you need a global "fire alarm" for any unhandled emergencies.`,
      codeExample: `// try/catch in async functions
async function loadUserData(userId) {
  try {
    const res = await fetch(\`/api/users/\${userId}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const user = await res.json();
    return user;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Network error:", error.message);
    } else {
      console.error("API error:", error.message);
    }
    return null; // Graceful fallback
  }
}

// Handling errors in Promise.all
async function fetchAll() {
  try {
    const results = await Promise.all([
      fetch("/api/1").then(r => r.json()),
      fetch("/api/2").then(r => r.json())
    ]);
    return results;
  } catch (err) {
    // One failure = all fail with Promise.all
    console.error("At least one request failed:", err);
  }
}

// Better: Promise.allSettled for partial failures
async function fetchAllSafe() {
  const results = await Promise.allSettled([
    fetch("/api/1").then(r => r.json()),
    fetch("/api/2").then(r => r.json())
  ]);
  const successes = results.filter(r => r.status === "fulfilled").map(r => r.value);
  const failures = results.filter(r => r.status === "rejected").map(r => r.reason);
  return { successes, failures };
}

// Error boundary pattern
async function withErrorBoundary(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error("Caught:", error);
    return typeof fallback === "function" ? fallback(error) : fallback;
  }
}
const data = await withErrorBoundary(
  () => fetch("/api/data").then(r => r.json()),
  []  // Fallback value
);

// Global error handlers
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
  event.preventDefault(); // Prevent default console error
});`,
      exercise: `**Mini Exercise:**
1. Write an error boundary wrapper for async operations with retry
2. Implement graceful degradation: try primary API, fall back to cache
3. Create a centralized error logging system for async operations
4. Build a circuit breaker pattern that stops calling a failing service`,
      commonMistakes: [
        "Not catching errors in async functions — unhandled rejections crash Node.js and show warnings in browsers",
        "Using try/catch around a function that returns a Promise without await — the catch won't work!",
        "Not distinguishing network errors from HTTP errors — `fetch` only throws on network failures",
        "Catching and silently swallowing errors with an empty catch block — always log or re-throw",
        "Not cleaning up resources (event listeners, intervals) on error — use `finally` for cleanup"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "How do you handle errors differently in Promises vs async/await?", a: "**Promises**: `.catch()` at the end of chains, or second argument of `.then()`. **async/await**: `try/catch` blocks wrapping `await` calls. Both: global `unhandledrejection` event for uncaught errors. `async/await` is generally more readable for complex error handling." },
        { type: "tricky", q: "What's wrong with this code?\n```js\ntry {\n  someAsyncFunction();\n} catch(e) {\n  console.log('caught');\n}\n```", a: "Missing `await`! Without `await`, the Promise rejection won't be caught by `try/catch`. The catch block only catches synchronous errors. Fix: `try { await someAsyncFunction(); } catch(e) { ... }`. Or the function itself needs error handling." },
        { type: "coding", q: "Implement a circuit breaker for API calls.", a: "```js\nclass CircuitBreaker {\n  constructor(fn, threshold = 3, cooldown = 30000) {\n    this.fn = fn;\n    this.failures = 0;\n    this.threshold = threshold;\n    this.cooldown = cooldown;\n    this.state = 'CLOSED';\n  }\n  async call(...args) {\n    if (this.state === 'OPEN') throw new Error('Circuit open');\n    try {\n      const result = await this.fn(...args);\n      this.failures = 0;\n      return result;\n    } catch (err) {\n      this.failures++;\n      if (this.failures >= this.threshold) {\n        this.state = 'OPEN';\n        setTimeout(() => (this.state = 'CLOSED', this.failures = 0), this.cooldown);\n      }\n      throw err;\n    }\n  }\n}\n```" },
        { type: "conceptual", q: "What is an unhandled Promise rejection and how do you handle it?", a: "It occurs when a Promise rejects but has no `.catch()` or `try/catch`. In Node.js, it crashes the process (in newer versions). In browsers, it logs a warning. Handle globally: `window.addEventListener('unhandledrejection', handler)` (browser) or `process.on('unhandledRejection', handler)` (Node.js)." },
        { type: "scenario", q: "How would you implement graceful degradation in a dashboard that loads data from 5 different APIs?", a: "Use `Promise.allSettled` to fetch all 5 independently. For each result: if fulfilled, show the data. If rejected, show cached data from localStorage, or a placeholder UI with a retry button. Log failures to monitoring. Never let one widget's failure crash the whole dashboard." }
      ]
    },
    {
      id: "web-apis",
      title: "Web APIs",
      explanation: `Web APIs are browser-provided APIs that extend JavaScript's capabilities beyond the language itself. They let you interact with device hardware, observe DOM changes, and create rich user experiences.

**Key Web APIs covered:**
- **Geolocation API** — Get user's geographic location
- **Notifications API** — Show system notifications
- **Intersection Observer** — Detect when elements enter/exit the viewport

🏠 **Real-world analogy:** Web APIs are like the utilities in a building (electricity, water, internet). The building (browser) provides them, and your apartment (JavaScript) can use them through standard interfaces (API).`,
      codeExample: `// Geolocation API
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("Lat:", position.coords.latitude);
      console.log("Lng:", position.coords.longitude);
      console.log("Accuracy:", position.coords.accuracy, "meters");
    },
    (error) => {
      switch(error.code) {
        case error.PERMISSION_DENIED: console.log("User denied"); break;
        case error.POSITION_UNAVAILABLE: console.log("Unavailable"); break;
        case error.TIMEOUT: console.log("Timed out"); break;
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// Notifications API
async function showNotification() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("Hello!", {
      body: "This is a notification from your app",
      icon: "/icon.png"
    });
  }
}

// Intersection Observer — lazy loading / infinite scrolling
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // Load actual image
        observer.unobserve(img);   // Stop watching
      }
    });
  },
  { threshold: 0.1, rootMargin: "100px" }
);
// Observe all lazy images
document.querySelectorAll("img[data-src]").forEach(img => {
  observer.observe(img);
});

// Clipboard API
async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
  console.log("Copied!");
}

// Broadcast Channel — cross-tab communication
const channel = new BroadcastChannel("app");
channel.postMessage({ type: "logout" });
channel.onmessage = (e) => {
  if (e.data.type === "logout") window.location.href = "/login";
};`,
      exercise: `**Mini Exercise:**
1. Build a "Get My Location" button that shows coordinates on a map
2. Implement lazy-loading images using Intersection Observer
3. Create a notification-based reminder app
4. Build infinite scroll using Intersection Observer`,
      commonMistakes: [
        "Not checking for API support before using it — always use `if ('geolocation' in navigator)`",
        "Forgetting Notifications require HTTPS and user permission — handle denied permissions gracefully",
        "Not disconnecting/unobserving Intersection Observers — can cause memory leaks",
        "Blocking the UI while waiting for geolocation — always use async patterns",
        "Not handling all error cases for Geolocation (permission denied, unavailable, timeout)"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is the Intersection Observer API and what are its use cases?", a: "Intersection Observer asynchronously observes changes in the intersection of elements with an ancestor or viewport. Use cases: lazy loading images, infinite scrolling, tracking ad viewability, triggering animations on scroll, sticky headers, and performance-optimized scroll handlers." },
        { type: "coding", q: "Write a lazy loading implementation using Intersection Observer.", a: "```js\nconst observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      const img = entry.target;\n      img.src = img.dataset.src;\n      img.classList.add('loaded');\n      observer.unobserve(img);\n    }\n  });\n}, { rootMargin: '200px' });\ndocument.querySelectorAll('img.lazy').forEach(img => observer.observe(img));\n```" },
        { type: "conceptual", q: "How does the Notifications API work and what permissions are needed?", a: "1) Request permission: `Notification.requestPermission()` returns 'granted', 'denied', or 'default'. 2) If granted, create: `new Notification('Title', { body, icon })`. Requirements: HTTPS (except localhost), user interaction to request permission, and user must explicitly grant." },
        { type: "tricky", q: "Why should you use Intersection Observer instead of scroll event listeners?", a: "Scroll events fire on the MAIN THREAD for every scroll pixel — causing jank and poor performance. Intersection Observer runs on a SEPARATE thread, batches callbacks, and only fires when visibility changes. It's much more performant for monitoring element visibility." },
        { type: "scenario", q: "How would you implement an infinite scroll feed efficiently?", a: "1) Use Intersection Observer on a sentinel element at the bottom. 2) When sentinel is visible, fetch next page. 3) Append new items and move sentinel down. 4) Implement virtualization — only render visible items (remove items scrolled far above). 5) Show loading skeleton during fetch. 6) Clean up observer on component unmount." }
      ]
    }
  ]
};

export default phase3;
