const nodePhase3 = {
  id: "phase-3",
  title: "Phase 3: Asynchronous Programming",
  emoji: "⚡",
  description:
    "Master callbacks, Promises, async/await, and EventEmitters — the core patterns that make Node.js applications non-blocking and efficient.",
  topics: [
    {
      id: "callbacks-pattern",
      title: "Callbacks & Error-First Pattern",
      explanation: `**Callbacks** are the original async pattern in Node.js. A callback is a function passed as an argument to another function, invoked when the operation completes.

**The error-first callback convention:**
Node.js follows a strict convention: the callback's **first argument is always the error** (or \`null\` if no error). This is called the **error-first** or **Node-style** callback pattern.

\`\`\`javascript
fs.readFile('file.txt', (error, data) => {
  if (error) {
    // Handle error
    return;
  }
  // Use data
});
\`\`\`

**Why error-first?**
- Consistent API across all Node.js core modules
- Forces developers to handle errors before processing data
- Enables tools and libraries to automatically wrap callbacks

**The callback problem — "Callback Hell" (Pyramid of Doom):**
When you chain async operations, callbacks nest deeper and deeper:
\`\`\`javascript
getUser(id, (err, user) => {
  getOrders(user.id, (err, orders) => {
    getOrderDetails(orders[0].id, (err, details) => {
      // 3 levels deep... and growing
    });
  });
});
\`\`\`

**Solutions to callback hell:**
1. **Named functions** — extract each callback into a named function
2. **Promises** — chain with \`.then()\` instead of nesting
3. **async/await** — write async code that looks synchronous
4. **Libraries** — \`async.js\` provides utilities like \`async.waterfall\`, \`async.parallel\`

**When callbacks are still used:**
- Legacy Node.js APIs (before Promises were standard)
- Event handlers (\`EventEmitter\`, \`Stream\`)
- Performance-critical code (callbacks have slightly less overhead than Promises)
- Third-party libraries that haven't migrated to Promises

🏠 **Real-world analogy:** A callback is like leaving your phone number with a restaurant when the table isn't ready — they "call back" when it's your turn. Error-first is like the restaurant saying "Sorry, we're full" before giving you a table number.`,
      codeExample: `// Callbacks — The Foundation of Node.js Async

const fs = require("fs");
const path = require("path");

// 1. Basic error-first callback
fs.readFile(path.join(__dirname, "example.txt"), "utf-8", (err, data) => {
  if (err) {
    if (err.code === "ENOENT") {
      console.log("File not found");
    } else {
      console.error("Read error:", err.message);
    }
    return; // ← Always return after handling errors!
  }
  console.log("File content:", data);
});

// 2. Callback hell — ❌ BAD
function getUserDataBad(userId) {
  getUser(userId, (err, user) => {
    if (err) return console.error(err);
    getOrders(user.id, (err, orders) => {
      if (err) return console.error(err);
      getShippingStatus(orders[0].id, (err, status) => {
        if (err) return console.error(err);
        console.log(\`User: \${user.name}, Status: \${status}\`);
        // More nesting? This becomes unreadable...
      });
    });
  });
}

// 3. Named functions — ✅ Flattened callbacks
function getUserDataGood(userId) {
  getUser(userId, handleUser);
}

function handleUser(err, user) {
  if (err) return console.error(err);
  getOrders(user.id, (err, orders) => handleOrders(err, orders, user));
}

function handleOrders(err, orders, user) {
  if (err) return console.error(err);
  console.log(\`User \${user.name} has \${orders.length} orders\`);
}

// 4. Creating callback-based functions
function readJsonFile(filePath, callback) {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) return callback(err, null);

    try {
      const json = JSON.parse(data);
      callback(null, json); // Success: error is null
    } catch (parseErr) {
      callback(new Error(\`Invalid JSON in \${filePath}: \${parseErr.message}\`), null);
    }
  });
}

// Usage
readJsonFile("config.json", (err, config) => {
  if (err) {
    console.error("Failed:", err.message);
    return;
  }
  console.log("Config loaded:", config);
});

// 5. Parallel execution with callbacks (manual)
function fetchAllData(callback) {
  let completed = 0;
  const results = {};
  const errors = [];

  function checkDone() {
    completed++;
    if (completed === 3) {
      if (errors.length > 0) return callback(errors[0], null);
      callback(null, results);
    }
  }

  fs.readFile("users.json", "utf-8", (err, data) => {
    if (err) errors.push(err);
    else results.users = JSON.parse(data);
    checkDone();
  });

  fs.readFile("posts.json", "utf-8", (err, data) => {
    if (err) errors.push(err);
    else results.posts = JSON.parse(data);
    checkDone();
  });

  fs.readFile("comments.json", "utf-8", (err, data) => {
    if (err) errors.push(err);
    else results.comments = JSON.parse(data);
    checkDone();
  });
}

// 6. Converting callbacks to Promises
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
// Now: const data = await readFileAsync("file.txt", "utf-8");

// Mock functions for examples above
function getUser(id, cb) { cb(null, { id, name: "Alice" }); }
function getOrders(userId, cb) { cb(null, [{ id: 1 }, { id: 2 }]); }
function getShippingStatus(orderId, cb) { cb(null, "shipped"); }`,
      exercise: `**Exercises:**
1. Write a callback-based function that reads a directory and returns only \`.js\` files
2. Create a \`readJsonFile\` function with proper error-first callback handling
3. Chain 3 file operations using callbacks — then refactor to eliminate the nesting
4. Implement a parallel file reader that reads 5 files concurrently and returns results in order
5. Use \`util.promisify()\` to convert 3 callback-based Node.js APIs to Promise-based ones
6. Build a retry function that attempts a callback operation up to 3 times before failing`,
      commonMistakes: [
        "Forgetting to `return` after calling the callback with an error — the function continues executing and may call the callback twice",
        "Not following the error-first convention — putting data as the first argument confuses everyone and breaks `util.promisify()`",
        "Calling a callback synchronously in some code paths and asynchronously in others — this creates unpredictable behavior known as 'Zalgo'",
        "Throwing errors inside callbacks instead of passing them — thrown errors crash the process because there's no try/catch wrapping the async call",
        "Not realizing that callbacks in Node.js core APIs run in the next event loop tick — code after the async call runs BEFORE the callback",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the error-first callback pattern and why does Node.js use it?",
          a: "The error-first pattern requires every callback to accept an **error as the first argument** and data as the second: `callback(err, data)`. If the operation succeeds, `err` is `null`; if it fails, `err` contains the Error object. **Why:** (1) **Consistency** — every Node.js API follows this pattern, making code predictable. (2) **Forces error handling** — you check `err` before accessing data. (3) **Composability** — tools like `util.promisify()` rely on this convention to automatically convert callbacks to Promises. (4) **No ambiguity** — unlike return values, the error argument can't be confused with regular data.",
        },
        {
          type: "scenario",
          q: "How would you avoid callback hell in a Node.js application?",
          a: "**Progressive solutions:** (1) **Named functions** — extract each callback into a named function to flatten nesting. (2) **util.promisify()** — convert callback-based functions to Promise-based: `const readFile = util.promisify(fs.readFile)`. (3) **async/await** — write `const data = await readFile('file.txt')` which looks synchronous but is non-blocking. (4) **Promise.all()** — run independent operations in parallel instead of sequential nesting. (5) **Libraries** — use `async.js` for complex patterns like waterfall, parallel, and queue. The modern best practice is to use the `fs.promises` API and async/await for all new code.",
        },
      ],
    },
    {
      id: "promises-deep-dive",
      title: "Promises — Deep Dive",
      explanation: `**Promises** represent a value that may be available now, later, or never. They solve callback hell by enabling **chaining** and **composition** of async operations.

**Promise states:**
1. **Pending** — Initial state; operation in progress
2. **Fulfilled** — Operation completed successfully (\`.then()\` fires)
3. **Rejected** — Operation failed (\`.catch()\` fires)

Once settled (fulfilled or rejected), a Promise **cannot change state** — it's immutable.

**Promise chaining:**
Each \`.then()\` returns a **new Promise**, enabling flat chains instead of nested callbacks:
\`\`\`javascript
readFile('a.txt')
  .then(data => transform(data))
  .then(result => writeFile('b.txt', result))
  .then(() => console.log('Done!'))
  .catch(err => console.error('Failed:', err));
\`\`\`

**Key combinators:**
| Method | Behavior |
|--------|----------|
| \`Promise.all([p1, p2])\` | Resolves when **ALL** resolve; rejects on **first** rejection |
| \`Promise.allSettled([p1, p2])\` | Waits for ALL to settle; never rejects |
| \`Promise.race([p1, p2])\` | Resolves/rejects with the **first** to settle |
| \`Promise.any([p1, p2])\` | Resolves with the **first** to fulfill; rejects only if ALL reject |

**Common pitfalls:**
- Forgetting \`.catch()\` → unhandled rejection (crashes in Node.js 15+)
- Nesting \`.then()\` inside \`.then()\` → recreating callback hell
- Not returning inside \`.then()\` → next \`.then()\` receives \`undefined\`
- Creating Promises for already-synchronous operations (unnecessary overhead)

🏠 **Real-world analogy:** A Promise is like an **order receipt** at a fast-food restaurant. You get the receipt immediately (Promise), and eventually it's either fulfilled (food ready) or rejected (sold out). You can chain actions: "when food is ready → add ketchup → sit down → eat."`,
      codeExample: `// Promises — Deep Dive

const fs = require("fs").promises;
const path = require("path");

// 1. Creating Promises
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) reject(new Error("Invalid user ID"));
      else resolve({ id, name: \`User_\${id}\`, email: \`user\${id}@example.com\` });
    }, 100);
  });
}

// 2. Promise chaining — flat and readable
fetchUser(1)
  .then((user) => {
    console.log("User:", user.name);
    return fetchOrders(user.id); // Return a Promise for chaining
  })
  .then((orders) => {
    console.log("Orders:", orders.length);
    return orders[0]; // Return a value (auto-wrapped in Promise)
  })
  .then((firstOrder) => {
    console.log("First order:", firstOrder);
  })
  .catch((err) => {
    console.error("Error in chain:", err.message);
  })
  .finally(() => {
    console.log("Chain complete (runs regardless of success/failure)");
  });

// 3. Promise.all — Parallel execution
async function loadDashboardData() {
  const startTime = Date.now();

  // ✅ GOOD: All requests run in parallel
  const [user, orders, notifications] = await Promise.all([
    fetchUser(1),
    fetchOrders(1),
    fetchNotifications(1),
  ]);

  console.log(\`Dashboard loaded in \${Date.now() - startTime}ms\`);
  // ~100ms (parallel) instead of ~300ms (sequential)
  return { user, orders, notifications };
}

// 4. Promise.allSettled — Get all results even if some fail
async function loadDataWithGracefulFailure() {
  const results = await Promise.allSettled([
    fetchUser(1),
    fetchUser(-1), // This will reject
    fetchUser(3),
  ]);

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      console.log(\`Request \${i}: Success —\`, result.value.name);
    } else {
      console.log(\`Request \${i}: Failed —\`, result.reason.message);
    }
  });

  // Extract only successful results
  const successfulUsers = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  console.log("Successful users:", successfulUsers.length);
}

// 5. Promise.race — First to settle wins
async function fetchWithTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

// Usage
fetchWithTimeout(fetchUser(1), 50)
  .then((user) => console.log("Got user before timeout:", user.name))
  .catch((err) => console.log("Timed out:", err.message));

// 6. Promise.any — First to fulfill (ignores rejections)
async function fetchFromFastestMirror() {
  try {
    const data = await Promise.any([
      fetchFromMirror("us-east"),
      fetchFromMirror("eu-west"),
      fetchFromMirror("ap-south"),
    ]);
    console.log("Fastest mirror:", data);
  } catch (err) {
    // AggregateError — ALL mirrors failed
    console.error("All mirrors failed:", err.errors);
  }
}

// 7. Error handling patterns
// ❌ BAD: Missing .catch()
// fetchUser(1).then(user => console.log(user));
// If fetchUser rejects → UnhandledPromiseRejection → process crash (Node 15+)

// ✅ GOOD: Always handle errors
fetchUser(1)
  .then((user) => console.log(user))
  .catch((err) => console.error(err));

// ✅ BEST: Centralized error handling in chains
function processOrder(userId) {
  return fetchUser(userId)
    .then((user) => validateUser(user))
    .then((user) => createOrder(user))
    .then((order) => sendConfirmation(order))
    .catch((err) => {
      // Single catch for the entire chain
      console.error("Order processing failed:", err.message);
      throw err; // Re-throw if caller should handle it too
    });
}

// 8. Creating pre-resolved/rejected Promises
const resolved = Promise.resolve(42);
const rejected = Promise.reject(new Error("boom"));
rejected.catch(() => {}); // Handle to avoid warning

// 9. Promisifying callback APIs
const { promisify } = require("util");
const execAsync = promisify(require("child_process").exec);

// Helper mock functions
function fetchOrders(userId) {
  return new Promise((resolve) =>
    setTimeout(() => resolve([{ id: 1 }, { id: 2 }]), 100)
  );
}
function fetchNotifications(userId) {
  return new Promise((resolve) =>
    setTimeout(() => resolve([{ msg: "Hello" }]), 100)
  );
}
function fetchFromMirror(region) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(region), Math.random() * 200)
  );
}
function validateUser(user) { return Promise.resolve(user); }
function createOrder(user) { return Promise.resolve({ id: 1, user }); }
function sendConfirmation(order) { return Promise.resolve(order); }`,
      exercise: `**Exercises:**
1. Implement a \`retry(fn, maxAttempts)\` function using Promises that retries a failing async operation
2. Use \`Promise.all()\` to fetch data from 5 different sources in parallel and merge the results
3. Use \`Promise.allSettled()\` to build a health-check that tests 5 services and reports which are up/down
4. Implement a \`timeout(promise, ms)\` wrapper using \`Promise.race()\`
5. Build a basic Promise-based task queue that limits concurrency (max 3 simultaneous operations)
6. Convert a callback-based library function to Promise-based using both manual wrapping and \`util.promisify\``,
      commonMistakes: [
        "Forgetting to return inside `.then()` — the next `.then()` receives `undefined` instead of the intended value",
        "Nesting `.then()` inside `.then()` — this recreates callback hell; always return Promises for flat chaining",
        "Not adding `.catch()` at the end of a Promise chain — unhandled rejections crash the Node.js process in v15+",
        "Using `Promise.all()` when partial failures are acceptable — use `Promise.allSettled()` instead to get all results",
        "Creating unnecessary Promises with `new Promise()` around already async code — if a function returns a Promise, just return it directly",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the difference between `Promise.all()`, `Promise.allSettled()`, `Promise.race()`, and `Promise.any()`.",
          a: "**`Promise.all()`** — Resolves when ALL promises resolve; rejects immediately on the FIRST rejection (fail-fast). Use for parallel operations where all must succeed. **`Promise.allSettled()`** — Waits for ALL promises to settle (fulfill or reject); never rejects. Returns an array of `{status, value/reason}` objects. Use when you need all results regardless of failures. **`Promise.race()`** — Settles with the FIRST promise to settle (either fulfill or reject). Use for timeouts and choosing the fastest source. **`Promise.any()`** — Resolves with the FIRST promise to FULFILL; only rejects if ALL promises reject (AggregateError). Use for redundant requests to multiple mirrors/servers.",
        },
        {
          type: "coding",
          q: "Implement a Promise-based retry function with exponential backoff.",
          a: "```js\nasync function retry(fn, maxAttempts = 3, baseDelay = 1000) {\n  for (let attempt = 1; attempt <= maxAttempts; attempt++) {\n    try {\n      return await fn();\n    } catch (err) {\n      if (attempt === maxAttempts) throw err;\n      const delay = baseDelay * Math.pow(2, attempt - 1);\n      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);\n      await new Promise(r => setTimeout(r, delay));\n    }\n  }\n}\n// Usage: await retry(() => fetch('https://api.example.com'), 3, 1000);\n```\nExponential backoff: 1s → 2s → 4s. This prevents overwhelming a failing service with rapid retries.",
        },
      ],
    },
    {
      id: "async-await-patterns",
      title: "async/await — Modern Patterns",
      explanation: `**async/await** is syntactic sugar over Promises that makes asynchronous code look and behave like synchronous code. Introduced in ES2017/Node.js 7.6+, it's now the **standard way** to write async code in Node.js.

**How it works:**
- \`async\` marks a function as returning a Promise
- \`await\` pauses execution until a Promise resolves (or rejects)
- The function "yields" to the event loop while waiting — other code continues to run

**Key rules:**
1. \`await\` can only be used inside an \`async\` function (or at the top level of an ESM module)
2. \`async\` functions always return a Promise
3. If you return a value, it's wrapped in \`Promise.resolve()\`
4. If you throw, it becomes \`Promise.reject()\`

**Error handling with async/await:**
Use \`try/catch\` blocks — they work exactly like synchronous error handling:
\`\`\`javascript
try {
  const data = await fetchData();
} catch (err) {
  console.error('Failed:', err);
}
\`\`\`

**Sequential vs Parallel execution:**
\`\`\`javascript
// Sequential: 2 seconds total (one after another)
const a = await taskA(); // 1 second
const b = await taskB(); // 1 second

// Parallel: 1 second total (both at once)
const [a, b] = await Promise.all([taskA(), taskB()]);
\`\`\`

**Common patterns:**
- **Sequential processing** — \`for...of\` with \`await\` for ordered operations
- **Parallel processing** — \`Promise.all()\` for independent operations
- **Controlled concurrency** — Process N items at a time (batch processing)
- **Error boundaries** — Wrap logical groups in try/catch

🏠 **Real-world analogy:** async/await is like a **personal assistant**. You say "get me coffee, then schedule a meeting." The assistant handles it while you work on other things. You only "pause" when you specifically wait for the result.`,
      codeExample: `// async/await — Modern Patterns

const fs = require("fs").promises;

// 1. Basic async/await
async function loadConfig() {
  try {
    const data = await fs.readFile("config.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("Config not found, using defaults");
      return { port: 3000, env: "development" };
    }
    throw err; // Re-throw unexpected errors
  }
}

// 2. Sequential vs Parallel — Critical performance difference!

// ❌ SLOW: Sequential (total time = sum of all awaits)
async function getDataSequential() {
  console.time("sequential");
  const users = await fetchData("/users");    // 200ms
  const posts = await fetchData("/posts");    // 200ms
  const comments = await fetchData("/comments"); // 200ms
  console.timeEnd("sequential"); // ~600ms
  return { users, posts, comments };
}

// ✅ FAST: Parallel (total time = longest operation)
async function getDataParallel() {
  console.time("parallel");
  const [users, posts, comments] = await Promise.all([
    fetchData("/users"),     // 200ms ─┐
    fetchData("/posts"),     // 200ms ─┼─ All start simultaneously
    fetchData("/comments"),  // 200ms ─┘
  ]);
  console.timeEnd("parallel"); // ~200ms
  return { users, posts, comments };
}

// 3. Sequential processing with for...of
async function processFilesSequentially(filePaths) {
  const results = [];
  for (const filePath of filePaths) {
    // Each file processed one at a time (order preserved)
    const content = await fs.readFile(filePath, "utf-8");
    const processed = await transform(content);
    results.push(processed);
  }
  return results;
}

// 4. Controlled concurrency — Process N items at a time
async function processBatch(items, batchSize, processor) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => processor(item))
    );
    results.push(...batchResults);
    console.log(\`Processed \${Math.min(i + batchSize, items.length)}/\${items.length}\`);
  }
  return results;
}

// Usage: process 100 items, 10 at a time
// await processBatch(items, 10, async (item) => {
//   return await processItem(item);
// });

// 5. Error handling patterns

// Pattern A: try/catch per operation
async function withIndividualErrors() {
  let user;
  try {
    user = await fetchUser(1);
  } catch (err) {
    console.error("User fetch failed:", err.message);
    user = getDefaultUser();
  }

  let orders;
  try {
    orders = await fetchOrders(user.id);
  } catch (err) {
    console.error("Orders fetch failed:", err.message);
    orders = [];
  }

  return { user, orders };
}

// Pattern B: Wrapper function (Go-style error handling)
async function to(promise) {
  try {
    const result = await promise;
    return [null, result];
  } catch (err) {
    return [err, null];
  }
}

// Usage
async function withGoStyleErrors() {
  const [userErr, user] = await to(fetchUser(1));
  if (userErr) return console.error("No user:", userErr.message);

  const [ordersErr, orders] = await to(fetchOrders(user.id));
  if (ordersErr) return console.error("No orders:", ordersErr.message);

  return { user, orders };
}

// 6. IIFE for top-level await (CommonJS)
(async () => {
  try {
    const config = await loadConfig();
    console.log("App started with config:", config);
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();

// 7. Async iterators (for await...of)
async function* generateNumbers(count) {
  for (let i = 0; i < count; i++) {
    await new Promise((r) => setTimeout(r, 100));
    yield i;
  }
}

async function consumeAsyncIterator() {
  for await (const num of generateNumbers(5)) {
    console.log("Got number:", num);
  }
}

// 8. Promise.all with error handling per item
async function fetchAllWithFallbacks(urls) {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return response.json();
    })
  );
  
  return results.map((result, i) => ({
    url: urls[i],
    success: result.status === "fulfilled",
    data: result.status === "fulfilled" ? result.value : null,
    error: result.status === "rejected" ? result.reason.message : null,
  }));
}

// Mock helpers
function fetchData(endpoint) {
  return new Promise((r) => setTimeout(() => r(\`data from \${endpoint}\`), 200));
}
function fetchUser(id) { return Promise.resolve({ id, name: "Alice" }); }
function fetchOrders(userId) { return Promise.resolve([{ id: 1 }]); }
function transform(content) { return Promise.resolve(content.toUpperCase()); }
function getDefaultUser() { return { id: 0, name: "Guest" }; }`,
      exercise: `**Exercises:**
1. Refactor a callback-based function to use async/await — compare readability
2. Write a function that fetches 10 URLs in parallel using \`Promise.all()\` and async/await
3. Implement controlled concurrency: process 100 items with max 5 concurrent operations
4. Create a Go-style \`to()\` error wrapper and use it in a 3-step async flow
5. Build an async generator that reads a file line by line and yields parsed JSON objects
6. Write a function that races a fetch request against a timeout, with proper cleanup of the losing operation`,
      commonMistakes: [
        "Using `await` in series when operations are independent — `const a = await x(); const b = await y();` is sequential; use `Promise.all([x(), y()])` for parallel",
        "Using `forEach` with `await` — `array.forEach(async (item) => { await process(item); })` does NOT wait for each item; use `for...of` for sequential or `Promise.all(array.map(...))` for parallel",
        "Forgetting try/catch around `await` — unhandled Promise rejections crash the process; always wrap async code in error handlers",
        "Making every function `async` even when it doesn't need to be — adding `async` to synchronous functions adds unnecessary Promise wrapping overhead",
        "Not understanding that `await` only pauses the current function — other parts of the application continue running on the event loop",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What happens when you use `await` inside a `forEach` loop?",
          a: "**It doesn't work as expected.** `forEach` calls the callback and immediately moves to the next iteration — it doesn't wait for the `await` to resolve. Each iteration starts without waiting for the previous one, and `forEach` returns `undefined` (not a Promise), so you can't `await` the loop itself. **Solutions:** (1) Use `for...of` for sequential processing: `for (const item of arr) { await process(item); }`. (2) Use `Promise.all` with `map` for parallel: `await Promise.all(arr.map(item => process(item)))`. (3) Use `for await...of` for async iterables.",
        },
        {
          type: "coding",
          q: "How would you process an array of items with limited concurrency?",
          a: "```js\nasync function processWithConcurrency(items, limit, fn) {\n  const results = [];\n  const executing = new Set();\n  \n  for (const [i, item] of items.entries()) {\n    const p = fn(item).then(result => {\n      executing.delete(p);\n      return result;\n    });\n    results[i] = p;\n    executing.add(p);\n    \n    if (executing.size >= limit) {\n      await Promise.race(executing);\n    }\n  }\n  \n  return Promise.all(results);\n}\n```\nThis maintains a pool of up to `limit` concurrent operations. When the pool is full, it waits for the fastest one to complete before starting the next. This pattern is used in production for API rate limiting, batch processing, and parallel file operations.",
        },
      ],
    },
    {
      id: "event-emitters",
      title: "EventEmitter — Event-Driven Architecture",
      explanation: `The **EventEmitter** class is the foundation of Node.js's event-driven architecture. Many core modules (\`http.Server\`, \`Stream\`, \`process\`) extend EventEmitter, and it's the primary pattern for decoupled, reactive communication between components.

**Core API:**
| Method | Description |
|--------|-------------|
| \`emitter.on(event, fn)\` | Register a listener (alias: \`addListener\`) |
| \`emitter.once(event, fn)\` | Register a one-time listener |
| \`emitter.emit(event, ...args)\` | Trigger an event synchronously |
| \`emitter.off(event, fn)\` | Remove a specific listener (alias: \`removeListener\`) |
| \`emitter.removeAllListeners(event)\` | Remove all listeners for an event |
| \`emitter.listenerCount(event)\` | Get number of listeners |
| \`emitter.eventNames()\` | List all event names with listeners |

**Key behaviors:**
1. **Synchronous execution:** \`emit()\` calls listeners synchronously in registration order
2. **Memory leaks:** Default max listeners is 10 — adding more produces a warning. Use \`setMaxListeners(N)\` to adjust.
3. **Error event:** If an \`'error'\` event is emitted with no listener, it **throws** and crashes the process. Always listen for \`'error'\`.
4. **\`this\` binding:** Regular functions get \`this\` bound to the emitter; arrow functions do not.

**When to use EventEmitter:**
- Decoupling components (publisher doesn't know about subscribers)
- Building plugin systems
- Logging and monitoring
- WebSocket / real-time communication
- Custom stream implementations

🏠 **Real-world analogy:** EventEmitter is like a **radio station**. The station broadcasts (emits) on specific frequencies (event names). Any number of radios (listeners) can tune in. The station doesn't know or care how many radios are listening.`,
      codeExample: `// EventEmitter — Complete Guide

const { EventEmitter } = require("events");

// 1. Basic usage
const emitter = new EventEmitter();

emitter.on("greet", (name) => {
  console.log(\`Hello, \${name}!\`);
});

emitter.on("greet", (name) => {
  console.log(\`Welcome, \${name}!\`);
});

emitter.emit("greet", "Alice");
// Hello, Alice!
// Welcome, Alice!

// 2. One-time listener
emitter.once("connect", () => {
  console.log("Connected (fires only once)");
});
emitter.emit("connect"); // "Connected (fires only once)"
emitter.emit("connect"); // (nothing happens)

// 3. Custom EventEmitter class — Application Logger
class AppLogger extends EventEmitter {
  log(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
    this.emit("log", entry);
    this.emit(level, entry); // Also emit level-specific event
  }

  info(message, meta) { this.log("info", message, meta); }
  warn(message, meta) { this.log("warn", message, meta); }
  error(message, meta) { this.log("error", message, meta); }
}

const logger = new AppLogger();

// Console transport
logger.on("log", (entry) => {
  const color = { info: "\\x1b[36m", warn: "\\x1b[33m", error: "\\x1b[31m" };
  console.log(
    \`\${color[entry.level] || ""}[\${entry.level.toUpperCase()}] \${entry.message}\\x1b[0m\`
  );
});

// File transport (only errors)
logger.on("error", (entry) => {
  // In production: append to error log file
  // fs.appendFileSync("errors.log", JSON.stringify(entry) + "\\n");
});

// Alert transport (critical errors)
logger.on("error", (entry) => {
  if (entry.critical) {
    console.log("🚨 ALERT: Critical error detected!");
    // Send to PagerDuty, Slack, etc.
  }
});

logger.info("Server started", { port: 3000 });
logger.warn("High memory usage", { usage: "85%" });
logger.error("Database connection failed", { critical: true });

// 4. Order processing system with events
class OrderProcessor extends EventEmitter {
  async processOrder(order) {
    this.emit("order:received", order);

    try {
      // Validate
      this.emit("order:validating", order);
      await this.validate(order);
      this.emit("order:validated", order);

      // Payment
      this.emit("order:payment:processing", order);
      const payment = await this.processPayment(order);
      this.emit("order:payment:complete", { order, payment });

      // Fulfillment
      this.emit("order:fulfilling", order);
      await this.fulfill(order);
      this.emit("order:complete", order);
    } catch (err) {
      this.emit("order:failed", { order, error: err });
    }
  }

  async validate(order) { /* validation logic */ }
  async processPayment(order) { return { id: "pay_123" }; }
  async fulfill(order) { /* fulfillment logic */ }
}

const processor = new OrderProcessor();

// Attach independent, decoupled handlers
processor.on("order:received", (order) => {
  console.log(\`📦 Order \${order.id} received\`);
});

processor.on("order:complete", (order) => {
  console.log(\`✅ Order \${order.id} completed\`);
  // Send confirmation email
  // Update inventory
  // Update analytics
});

processor.on("order:failed", ({ order, error }) => {
  console.error(\`❌ Order \${order.id} failed: \${error.message}\`);
  // Refund payment
  // Notify customer
});

// 5. Error handling — MUST listen for 'error'
const risky = new EventEmitter();

// ❌ WITHOUT error listener: emitting 'error' crashes the process
// risky.emit("error", new Error("boom")); // THROWS!

// ✅ WITH error listener: error is handled gracefully
risky.on("error", (err) => {
  console.error("Handled error:", err.message);
});
risky.emit("error", new Error("boom")); // "Handled error: boom"

// 6. Memory leak detection
const leaky = new EventEmitter();
// leaky.setMaxListeners(20); // Increase if needed

for (let i = 0; i < 15; i++) {
  leaky.on("data", () => {}); // Warning after 10!
}
// (node:12345) MaxListenersExceededWarning

// 7. Async events with EventEmitter
const { on } = require("events");

async function processEvents() {
  const emitter = new EventEmitter();

  // Start emitting events after a delay
  setTimeout(() => {
    emitter.emit("data", { value: 1 });
    emitter.emit("data", { value: 2 });
    emitter.emit("data", { value: 3 });
    emitter.emit("close");
  }, 100);

  // Async iteration over events (Node.js 12.16+)
  // for await (const [event] of on(emitter, "data")) {
  //   console.log("Async event:", event);
  // }
}`,
      exercise: `**Exercises:**
1. Build a custom EventEmitter-based logger with console, file, and alert transports
2. Create an order processing pipeline using events — emit events for each stage and attach independent handlers
3. Implement a simple pub/sub system using EventEmitter with topic-based subscriptions
4. Build a file watcher that emits \`change\`, \`add\`, and \`delete\` events using \`fs.watch()\`
5. Create an EventEmitter that tracks listener count and warns when it exceeds a threshold
6. Implement a circuit breaker pattern using EventEmitter to track failures and state changes`,
      commonMistakes: [
        "Not listening for the 'error' event — if an error is emitted with no listener, it throws an uncaught exception and crashes the process",
        "Adding too many listeners without cleanup — this causes memory leaks; use `removeListener()` or `once()` for short-lived listeners",
        "Assuming `emit()` is asynchronous — listeners are called synchronously, which means a slow listener blocks all subsequent listeners and the event loop",
        "Using arrow functions when you need `this` to refer to the emitter — arrow functions don't bind `this`, so `this` inside the listener won't be the emitter",
        "Creating tight coupling through events — events should carry data, not control flow; listeners should be independently replaceable",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the EventEmitter pattern and how is it used in Node.js core modules?",
          a: "EventEmitter is a class that implements the **observer/pub-sub pattern**. Objects emit named events, and registered listener functions run when those events fire. **Core usage:** `http.Server` emits `'request'`, `'connection'`, `'close'`; `Stream` emits `'data'`, `'end'`, `'error'`; `process` emits `'exit'`, `'uncaughtException'`. Key behaviors: (1) listeners are called **synchronously** in registration order, (2) the special `'error'` event **throws** if no listener exists, (3) default max listeners is 10 to prevent memory leaks. It's the backbone of Node.js's event-driven, non-blocking architecture.",
        },
        {
          type: "tricky",
          q: "What happens if you emit an 'error' event with no listener attached?",
          a: "If an `'error'` event is emitted and **no listener** is registered for it, Node.js **throws the error** as an unhandled exception, which crashes the process. This is a special behavior unique to the `'error'` event — all other events are silently ignored if no listener exists. **Best practice:** Always add an `'error'` listener to every EventEmitter. For a global safety net, use `process.on('uncaughtException')`, but this should only log the error and exit — don't try to recover from an unknown state.",
        },
      ],
    },
  ],
};

export default nodePhase3;
