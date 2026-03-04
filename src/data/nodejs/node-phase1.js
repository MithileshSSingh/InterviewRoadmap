const nodePhase1 = {
  id: "phase-1",
  title: "Phase 1: Node.js Fundamentals & Runtime",
  emoji: "🚀",
  description:
    "Understand what Node.js is, how the V8 engine works, the event loop architecture, global objects, and the REPL — the foundation for everything that follows.",
  topics: [
    {
      id: "what-is-nodejs",
      title: "What is Node.js & The V8 Engine",
      explanation: `**Node.js** is a **JavaScript runtime** built on Chrome's **V8 engine** that allows you to run JavaScript outside the browser — on servers, CLIs, IoT devices, and more.

**Why Node.js matters:**
- **Single language** for frontend and backend — reduces context-switching
- **Non-blocking I/O** — handles thousands of concurrent connections efficiently
- **npm ecosystem** — the largest package registry in the world (2M+ packages)
- **Enterprise adoption** — Netflix, PayPal, LinkedIn, Uber, NASA all run Node.js in production

**How V8 works under the hood:**

1. **Parsing** — V8 parses your JavaScript into an Abstract Syntax Tree (AST)
2. **Ignition (Interpreter)** — Converts AST to bytecode for fast startup
3. **TurboFan (Compiler)** — Hot code paths are compiled to optimized machine code (JIT)
4. **Garbage Collection** — V8 uses a generational GC (Scavenger for young gen, Mark-Sweep-Compact for old gen)

\`\`\`
Source Code → Parser → AST → Ignition (Bytecode) → TurboFan (Optimized Machine Code)
                                    ↑                        ↓
                                    ← Deoptimization ←------←
\`\`\`

**Node.js ≠ V8 alone.** Node.js adds:
- **libuv** — Cross-platform async I/O library (event loop, thread pool, file system, DNS, networking)
- **C++ bindings** — Bridge between JavaScript and native system APIs
- **Core modules** — \`fs\`, \`http\`, \`path\`, \`crypto\`, \`stream\`, etc.

**Node.js architecture layers:**
| Layer | Purpose |
|-------|---------|
| **Your Code** | Application logic in JavaScript |
| **Node.js APIs** | Core modules (\`fs\`, \`http\`, \`crypto\`) |
| **Node.js Bindings** | C++ glue connecting JS to native code |
| **V8** | JavaScript engine (parsing, compilation, execution) |
| **libuv** | Event loop, thread pool, async I/O |
| **OS** | System calls, network sockets, file descriptors |

🏠 **Real-world analogy:** Think of V8 as the engine in a car — it's powerful, but the car (Node.js) adds the wheels (libuv), steering (core modules), and dashboard (APIs) to make it useful on the road.

**Single-threaded but not single-process:**
Node.js runs your JavaScript on a **single thread**, but libuv maintains a **thread pool** (default 4 threads) for heavy operations like file I/O, DNS lookups, and crypto. This is why Node.js is "non-blocking" — I/O doesn't block the main thread.`,
      codeExample: `// Understanding Node.js runtime capabilities

// 1. Check your Node.js version and V8 version
console.log("Node.js version:", process.version);     // e.g., v20.11.0
console.log("V8 version:", process.versions.v8);       // e.g., 11.3.244.8
console.log("Platform:", process.platform);             // e.g., darwin, linux, win32
console.log("Architecture:", process.arch);             // e.g., x64, arm64

// 2. V8 memory information
const v8 = require("v8");
const heapStats = v8.getHeapStatistics();
console.log("\\n--- V8 Heap Statistics ---");
console.log("Total heap size:", (heapStats.total_heap_size / 1024 / 1024).toFixed(2), "MB");
console.log("Used heap size:", (heapStats.used_heap_size / 1024 / 1024).toFixed(2), "MB");
console.log("Heap size limit:", (heapStats.heap_size_limit / 1024 / 1024).toFixed(2), "MB");

// 3. Demonstrate that Node.js is NOT just a browser
// ❌ Browser-only APIs (these DON'T exist in Node.js)
// document.getElementById("app")  → ReferenceError
// window.location                 → ReferenceError
// localStorage.setItem()          → ReferenceError

// ✅ Node.js-only APIs (these DON'T exist in browsers)
const os = require("os");
console.log("\\n--- System Information (Node.js only) ---");
console.log("CPU cores:", os.cpus().length);
console.log("Total memory:", (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), "GB");
console.log("Free memory:", (os.freemem() / 1024 / 1024 / 1024).toFixed(2), "GB");
console.log("Home directory:", os.homedir());
console.log("Hostname:", os.hostname());

// 4. Process information — unique to Node.js
console.log("\\n--- Process Information ---");
console.log("PID:", process.pid);
console.log("Working directory:", process.cwd());
console.log("Uptime:", process.uptime().toFixed(2), "seconds");
console.log("Memory usage:", JSON.stringify(process.memoryUsage(), null, 2));

// 5. Environment variables — critical for production
// Set: NODE_ENV=production node app.js
console.log("\\nEnvironment:", process.env.NODE_ENV || "development");

// 6. Command-line arguments
// Run: node app.js --port 3000 --verbose
console.log("Arguments:", process.argv);
// process.argv[0] = path to node
// process.argv[1] = path to script
// process.argv[2+] = your arguments

// 7. V8 JIT optimization demonstration
// Functions called many times get optimized by TurboFan
function hotFunction(a, b) {
  return a + b; // Called with consistent types → optimized
}

// Warm up the function (V8 will optimize after ~100-1000 calls)
for (let i = 0; i < 10000; i++) {
  hotFunction(i, i + 1); // Always numbers → TurboFan optimizes
}

// ❌ BAD: Passing different types causes "deoptimization"
// hotFunction("hello", "world"); // String + String after Number training
// V8 has to throw away the optimized code and recompile`,
      exercise: `**Exercises:**
1. Run \`node -e "console.log(process.versions)"\` and list all the components Node.js bundles
2. Write a script that prints all environment variables sorted alphabetically
3. Create a CLI tool that accepts \`--name\` and \`--greeting\` flags and prints a custom message
4. Use \`v8.getHeapStatistics()\` to monitor memory before and after creating a large array of 1M objects
5. Write a script that detects whether it's running on macOS, Linux, or Windows and prints OS-specific info
6. Benchmark a function by running it 1M times — compare results with \`console.time()\` and \`process.hrtime.bigint()\``,
      commonMistakes: [
        "Thinking Node.js is a programming language — it's a runtime environment for JavaScript, not a language itself",
        "Assuming Node.js is single-threaded means it can only do one thing at a time — libuv's thread pool handles I/O in parallel behind the scenes",
        "Using browser APIs like `document`, `window`, or `alert()` in Node.js — these don't exist on the server",
        "Not understanding the difference between Node.js and npm — Node.js is the runtime, npm is the package manager that ships with it",
        "Ignoring V8's JIT optimization by writing polymorphic code (mixing types) in hot paths — this causes deoptimization and performance degradation",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is Node.js and why was it created?",
          a: "Node.js is a **JavaScript runtime** built on Chrome's V8 engine, created by **Ryan Dahl in 2009** to solve the problem of building scalable network applications. Traditional web servers (like Apache) used a **thread-per-connection** model — each connection spawned a new thread, consuming memory. With 10K concurrent connections, you'd need 10K threads (~10GB RAM). Node.js uses an **event-driven, non-blocking I/O** model powered by **libuv**, handling thousands of connections on a single thread with an event loop. This makes it ideal for I/O-heavy applications (APIs, real-time apps, microservices) but less suited for CPU-intensive tasks (video encoding, ML inference) without worker threads.",
        },
        {
          type: "tricky",
          q: "Is Node.js single-threaded? Explain the nuance.",
          a: "**Partially true.** Your JavaScript code runs on a **single main thread** (the event loop). However, Node.js is NOT purely single-threaded. **libuv** maintains a **thread pool** (default 4 threads, configurable via `UV_THREADPOOL_SIZE` up to 1024) for operations that can't be done asynchronously at the OS level: file system operations, DNS lookups, `crypto.pbkdf2()`, and zlib compression. Additionally, `Worker Threads` (Node.js 10.5+) allow you to explicitly spawn JavaScript threads for CPU-intensive work. So the accurate answer is: **JavaScript execution is single-threaded; I/O and certain crypto operations use a thread pool.**",
        },
        {
          type: "conceptual",
          q: "Explain the difference between V8 and libuv in Node.js.",
          a: "**V8** is Google's JavaScript engine — it parses, compiles (JIT via Ignition + TurboFan), and executes JavaScript code. It handles memory management (garbage collection) and provides the JavaScript runtime. **libuv** is a C library that provides the **event loop**, **thread pool**, and cross-platform **async I/O** (file system, networking, DNS, child processes). V8 knows nothing about I/O — it just runs JavaScript. libuv knows nothing about JavaScript — it just manages async operations. **Node.js is the glue** that connects them via C++ bindings, allowing your JavaScript to trigger async I/O operations that libuv handles efficiently.",
        },
      ],
    },
    {
      id: "event-loop-deep-dive",
      title: "The Event Loop — Deep Dive",
      explanation: `The **event loop** is the heart of Node.js. It's what makes non-blocking I/O possible and understanding it is the single most important concept for writing performant Node.js applications.

**The event loop phases (in order):**

\`\`\`
   ┌───────────────────────────┐
┌─>│        timers              │  ← setTimeout, setInterval callbacks
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │     pending callbacks      │  ← I/O callbacks deferred from previous cycle
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │       idle, prepare        │  ← Internal use only
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │          poll              │  ← Retrieve new I/O events; execute I/O callbacks
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │          check             │  ← setImmediate callbacks
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │     close callbacks        │  ← socket.on('close', ...) etc.
│  └──────────┘────────────────┘
\`\`\`

**Key phases explained:**

1. **Timers** — Executes callbacks scheduled by \`setTimeout()\` and \`setInterval()\`. Note: timers specify a *minimum* delay, not an exact delay. If the event loop is busy, the callback fires later.

2. **Pending Callbacks** — Executes I/O callbacks deferred to this iteration (e.g., TCP errors).

3. **Poll** — The most important phase. It retrieves new I/O events and executes their callbacks. If no timers are scheduled and no I/O is pending, the event loop **blocks here**, waiting for new events.

4. **Check** — Executes \`setImmediate()\` callbacks. These always run after the poll phase completes, making them useful for running code after I/O.

5. **Close Callbacks** — Executes close event callbacks (e.g., \`socket.on('close')\`).

**Microtask queues (between every phase):**
Between each phase, Node.js processes two microtask queues:
1. **\`process.nextTick()\`** queue — Always runs first (highest priority)
2. **Promise** microtask queue — \`.then()\`, \`.catch()\`, \`.finally()\` callbacks

\`\`\`
Phase → nextTick queue → Promise queue → Next Phase → nextTick queue → Promise queue → ...
\`\`\`

> ⚠️ **Critical:** \`process.nextTick()\` can **starve** the event loop if called recursively — it runs before ANY I/O, so infinite nextTick calls prevent the event loop from advancing.

**\`setTimeout(fn, 0)\` vs \`setImmediate(fn)\`:**
- In the **main module**, the order is **non-deterministic** (depends on process performance)
- Inside an **I/O callback**, \`setImmediate()\` **always fires first** (check phase comes right after poll)

🏠 **Real-world analogy:** The event loop is like a **restaurant waiter** serving tables. They don't stand at one table waiting for food — they take orders (register callbacks), check the kitchen (poll for I/O), deliver food when ready (execute callbacks), and handle bills (timers). One waiter can efficiently serve many tables because most time is spent waiting for the kitchen.`,
      codeExample: `// Deep dive into event loop execution order

// 1. Classic event loop ordering puzzle
console.log("1. Script start (synchronous)");

setTimeout(() => {
  console.log("2. setTimeout (timers phase)");
}, 0);

setImmediate(() => {
  console.log("3. setImmediate (check phase)");
});

Promise.resolve().then(() => {
  console.log("4. Promise.then (microtask)");
});

process.nextTick(() => {
  console.log("5. process.nextTick (microtask - highest priority)");
});

console.log("6. Script end (synchronous)");

// Output ORDER:
// 1. Script start (synchronous)
// 6. Script end (synchronous)
// 5. process.nextTick (microtask - highest priority)
// 4. Promise.then (microtask)
// 2. setTimeout (timers phase)       ← order of 2 & 3 is
// 3. setImmediate (check phase)      ← non-deterministic here!

// ---

// 2. Inside I/O callback — setImmediate ALWAYS fires before setTimeout
const fs = require("fs");

fs.readFile(__filename, () => {
  console.log("\\n--- Inside I/O callback ---");

  setTimeout(() => {
    console.log("setTimeout inside I/O");
  }, 0);

  setImmediate(() => {
    console.log("setImmediate inside I/O"); // ← ALWAYS first inside I/O
  });

  process.nextTick(() => {
    console.log("nextTick inside I/O");     // ← ALWAYS before both
  });
});

// Output:
// nextTick inside I/O
// setImmediate inside I/O      ← guaranteed before setTimeout in I/O context
// setTimeout inside I/O

// ---

// 3. Dangerous: process.nextTick starvation
// ❌ BAD — This starves the event loop!
// function recursiveNextTick() {
//   process.nextTick(recursiveNextTick);
//   // Event loop NEVER advances to I/O — everything hangs
// }
// recursiveNextTick();

// ✅ GOOD — Use setImmediate for recursive patterns
function recursiveImmediate(count) {
  if (count > 5) return;
  setImmediate(() => {
    console.log(\`setImmediate iteration \${count}\`);
    recursiveImmediate(count + 1);
    // Event loop CAN process I/O between iterations
  });
}
recursiveImmediate(1);

// ---

// 4. Nested microtasks — understanding queue draining
process.nextTick(() => {
  console.log("\\nnextTick 1");
  process.nextTick(() => {
    console.log("nextTick 2 (nested)");
    // Nested nextTick runs BEFORE promises!
  });
});

Promise.resolve().then(() => {
  console.log("Promise 1");
  return Promise.resolve();
}).then(() => {
  console.log("Promise 2 (chained)");
});

// Output:
// nextTick 1
// nextTick 2 (nested)     ← entire nextTick queue drains first
// Promise 1
// Promise 2 (chained)`,
      exercise: `**Exercises:**
1. Predict the output of a script with \`setTimeout\`, \`setImmediate\`, \`Promise.then\`, and \`process.nextTick\` — then run it to verify
2. Write a script that demonstrates \`setImmediate\` always fires before \`setTimeout(fn, 0)\` inside an I/O callback
3. Create a \`process.nextTick\` starvation scenario and fix it using \`setImmediate\`
4. Build a simple task scheduler that uses \`setImmediate\` to yield to the event loop between CPU-heavy chunks
5. Use \`perf_hooks\` to measure the time between scheduling a \`setTimeout(fn, 0)\` and its actual execution
6. Write a script that logs which event loop phase each callback runs in by interleaving timers, I/O, and immediates`,
      commonMistakes: [
        "Assuming `setTimeout(fn, 0)` fires instantly — it schedules for the NEXT iteration's timers phase, with a minimum delay of ~1ms",
        "Using `process.nextTick()` recursively — this starves the event loop and prevents I/O from being processed, freezing the application",
        "Confusing the event loop with JavaScript's call stack — the event loop manages WHEN callbacks run; the call stack manages HOW functions execute",
        "Blocking the event loop with synchronous operations (e.g., `fs.readFileSync` in a server) — this freezes ALL concurrent connections",
        "Not understanding that Promise microtasks run before I/O callbacks — a chain of 1000 `.then()` calls blocks I/O processing",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the Node.js event loop and its phases.",
          a: "The event loop has 6 phases that execute in order: (1) **Timers** — runs `setTimeout`/`setInterval` callbacks. (2) **Pending Callbacks** — deferred I/O callbacks (e.g., TCP errors). (3) **Idle/Prepare** — internal use. (4) **Poll** — retrieves and executes new I/O events; this is where the loop spends most time. (5) **Check** — runs `setImmediate()` callbacks. (6) **Close Callbacks** — cleanup handlers like `socket.on('close')`. Between EVERY phase, Node.js drains two microtask queues: `process.nextTick()` first (highest priority), then Promise callbacks. The poll phase is special — if no timers are pending and no I/O is ready, the loop blocks here waiting for events.",
        },
        {
          type: "tricky",
          q: "What is the difference between `setImmediate()` and `setTimeout(fn, 0)`?",
          a: "Both schedule callbacks for the next event loop iteration, but they run in **different phases**: `setTimeout(fn, 0)` runs in the **Timers** phase; `setImmediate()` runs in the **Check** phase. In the **main module**, their order is non-deterministic (depends on system clock resolution and process startup time). Inside an **I/O callback** (e.g., `fs.readFile`), `setImmediate()` **always fires first** because the Check phase immediately follows the Poll phase where I/O callbacks execute. Best practice: prefer `setImmediate()` when you want to run code after I/O events are processed.",
        },
        {
          type: "coding",
          q: "What will be the output of this code and why?\n```js\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nprocess.nextTick(() => console.log('D'));\nconsole.log('E');\n```",
          a: "Output: **A, E, D, C, B**. Explanation: (1) `A` and `E` are synchronous — they run immediately on the call stack. (2) After the synchronous code completes, Node.js drains the **microtask queues** before entering the event loop. (3) `process.nextTick` queue drains first → `D`. (4) Promise microtask queue drains next → `C`. (5) Finally, the event loop enters the **Timers** phase → `B`. Key insight: microtasks (nextTick + Promises) ALWAYS execute before macrotasks (setTimeout, setImmediate, I/O callbacks).",
        },
      ],
    },
    {
      id: "node-global-objects",
      title: "Global Objects & Built-in Utilities",
      explanation: `Node.js provides several **global objects** that are available everywhere without requiring an import. Understanding these is essential for writing idiomatic Node.js code.

**Key globals in Node.js:**

| Global | Purpose | Browser Equivalent |
|--------|---------|--------------------|
| \`global\` | The global namespace object | \`window\` |
| \`globalThis\` | Universal global (works in Node + browser) | \`globalThis\` |
| \`process\` | Current process info, env vars, stdin/stdout | _(none)_ |
| \`console\` | Logging and debugging | \`console\` |
| \`Buffer\` | Binary data handling | \`ArrayBuffer\` |
| \`__filename\` | Current file's absolute path (CJS only) | _(none)_ |
| \`__dirname\` | Current directory's absolute path (CJS only) | _(none)_ |
| \`setTimeout\` / \`setInterval\` | Timer scheduling | Same API |
| \`setImmediate\` | Run after current I/O | _(none)_ |
| \`URL\` / \`URLSearchParams\` | URL parsing | Same API |
| \`TextEncoder\` / \`TextDecoder\` | String ↔ binary encoding | Same API |
| \`structuredClone\` | Deep clone objects | Same API |
| \`fetch\` | HTTP requests (Node 18+) | Same API |
| \`AbortController\` | Cancel async operations | Same API |
| \`crypto\` | Web Crypto API (Node 19+) | Same API |

**\`__filename\` and \`__dirname\` in ESM:**
In ES Modules, \`__filename\` and \`__dirname\` don't exist. Use:
\`\`\`javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
\`\`\`

**The \`process\` object — your Swiss Army knife:**
\`process\` is the most important global in Node.js. It provides:
- **\`process.env\`** — Environment variables (config, secrets)
- **\`process.argv\`** — Command-line arguments
- **\`process.exit(code)\`** — Exit with status code (0 = success, 1 = error)
- **\`process.cwd()\`** — Current working directory
- **\`process.stdin\` / \`process.stdout\`** — Standard I/O streams
- **\`process.memoryUsage()\`** — Heap and RSS memory stats
- **\`process.hrtime.bigint()\`** — High-resolution timing (nanosecond precision)
- **\`process.on('uncaughtException')\`** — Last resort error handler

**The \`Buffer\` class:**
Buffers are Node.js's way of handling **raw binary data** — essential for file I/O, network protocols, and cryptography. Unlike strings, Buffers have a fixed size and store raw bytes.

🏠 **Real-world analogy:** Globals are like the utilities in your apartment — electricity, water, and gas are always available without ordering them. But just because they're available doesn't mean you should leave all the taps running (\`global\` variable pollution).`,
      codeExample: `// Node.js Global Objects — practical usage

// 1. process.env — Configuration management
// ✅ GOOD: Use environment variables for config
const config = {
  port: parseInt(process.env.PORT || "3000"),
  dbUrl: process.env.DATABASE_URL || "mongodb://localhost:27017/myapp",
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  logLevel: process.env.LOG_LEVEL || "info",
};
console.log("Config:", config);

// 2. process.argv — CLI argument parsing
// Run: node script.js --name "John" --verbose
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--")
        ? argv[++i]
        : true;
      args[key] = value;
    }
  }
  return args;
}
console.log("Parsed args:", parseArgs(process.argv));

// 3. Buffer — Binary data handling
// Create buffers
const buf1 = Buffer.from("Hello, Node.js!", "utf-8");
const buf2 = Buffer.alloc(16); // 16 zero-filled bytes
const buf3 = Buffer.allocUnsafe(16); // 16 uninitialized bytes (faster)

console.log("\\n--- Buffer ---");
console.log("String to Buffer:", buf1);
console.log("Buffer to String:", buf1.toString("utf-8"));
console.log("Buffer to Hex:", buf1.toString("hex"));
console.log("Buffer to Base64:", buf1.toString("base64"));
console.log("Buffer length:", buf1.length, "bytes");

// Compare buffers
const a = Buffer.from("abc");
const b = Buffer.from("abc");
const c = Buffer.from("abd");
console.log("a === b:", a === b);         // false (different references)
console.log("a.equals(b):", a.equals(b)); // true (same content)
console.log("a.compare(c):", a.compare(c)); // -1 (a < c)

// 4. High-resolution timing
const start = process.hrtime.bigint();
// Simulate work
let sum = 0;
for (let i = 0; i < 1_000_000; i++) sum += i;
const end = process.hrtime.bigint();
console.log(\`\\nLoop took \${(end - start) / 1_000_000n}ms\`);

// 5. console methods beyond console.log
console.log("\\n--- Console methods ---");
console.table([
  { method: "log", use: "General output" },
  { method: "error", use: "Error output (stderr)" },
  { method: "warn", use: "Warning output (stderr)" },
  { method: "time/timeEnd", use: "Measure execution time" },
  { method: "table", use: "Display tabular data" },
  { method: "dir", use: "Object inspection with depth" },
]);

console.time("array-creation");
const bigArray = Array.from({ length: 100000 }, (_, i) => i);
console.timeEnd("array-creation");

// 6. structuredClone — Deep cloning (Node 17+)
const original = {
  name: "Alice",
  nested: { scores: [1, 2, 3] },
  date: new Date(),
};
const cloned = structuredClone(original);
cloned.nested.scores.push(4);
console.log("\\nOriginal scores:", original.nested.scores); // [1, 2, 3]
console.log("Cloned scores:", cloned.nested.scores);       // [1, 2, 3, 4]

// 7. AbortController — Cancel async operations
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Request timed out!");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}`,
      exercise: `**Exercises:**
1. Write a CLI tool that reads \`process.env\` and prints all variables matching a given prefix (e.g., \`AWS_\`)
2. Implement a simple argument parser that supports \`--flag value\`, \`-f\`, and \`--boolean-flag\` patterns
3. Convert a string to Buffer, then to Base64, then back to string — verify it round-trips correctly
4. Use \`process.hrtime.bigint()\` to write a benchmarking utility that runs a function N times and reports min/max/avg
5. Create a script that monitors \`process.memoryUsage()\` every second and logs when heap usage exceeds 80%
6. Write a \`structuredClone\` vs JSON.parse(JSON.stringify()) benchmark — which is faster for deep objects?`,
      commonMistakes: [
        "Polluting the `global` object by attaching properties to it — this creates hard-to-debug shared state and naming conflicts across modules",
        "Using `__dirname` and `__filename` in ES modules — they only exist in CommonJS; use `import.meta.url` with `fileURLToPath` instead",
        "Calling `process.exit()` in a server without graceful shutdown — this kills active connections; use signals (SIGTERM/SIGINT) instead",
        "Using `Buffer.allocUnsafe()` without filling it — the buffer contains old memory data which could leak sensitive information",
        "Not using `process.env` for configuration — hardcoding secrets, ports, or database URLs makes deployment impossible",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the key differences between Node.js globals and browser globals?",
          a: "**Node.js has:** `global` (instead of `window`), `process` (env, argv, exit, streams), `Buffer` (binary data), `__filename`/`__dirname` (CJS only), `require()` (CJS), `setImmediate()`. **Browsers have:** `window`/`document`/`navigator`, DOM APIs, `localStorage`/`sessionStorage`, `alert()`/`confirm()`, Web Workers. **Shared (unified by web standards):** `console`, `setTimeout`/`setInterval`, `fetch` (Node 18+), `URL`, `TextEncoder`/`TextDecoder`, `AbortController`, `crypto.subtle` (Node 19+), `structuredClone`. The trend is **convergence** — Node.js is adopting more Web Platform APIs to reduce the gap.",
        },
        {
          type: "coding",
          q: "How do you get `__dirname` equivalent in ES Modules?",
          a: "In ESM, `__dirname` and `__filename` don't exist. Use this pattern:\n```js\nimport { fileURLToPath } from 'url';\nimport { dirname } from 'path';\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = dirname(__filename);\n```\n`import.meta.url` returns the file URL (e.g., `file:///home/user/app.mjs`), and `fileURLToPath()` converts it to an OS path. This is the official recommended approach from the Node.js docs.",
        },
        {
          type: "tricky",
          q: "What is the difference between `Buffer.alloc()` and `Buffer.allocUnsafe()`?",
          a: "**`Buffer.alloc(size)`** creates a buffer initialized with **zeros** — safe but slightly slower because it writes zeros to every byte. **`Buffer.allocUnsafe(size)`** creates a buffer from **uninitialized memory** — faster but dangerous because it may contain old data (passwords, keys, other process data). Use `allocUnsafe` only when you will **immediately overwrite** all bytes (e.g., reading from a file into it). In production, prefer `Buffer.alloc()` or `Buffer.from()` to prevent information leakage.",
        },
      ],
    },
    {
      id: "node-repl-debugging",
      title: "REPL & Basic Debugging",
      explanation: `The **REPL** (Read-Eval-Print-Loop) is Node.js's interactive shell — a powerful tool for experimenting, debugging, and exploring APIs in real time.

**Starting the REPL:**
\`\`\`bash
$ node          # Start REPL
> 2 + 3
5
> .help         # Show REPL commands
> .exit         # Exit REPL
\`\`\`

**REPL special features:**
- **\`_\`** — Contains the result of the last expression
- **Tab completion** — Press Tab to see available properties/methods
- **Multi-line input** — Automatically detects incomplete expressions
- **\`.load filename\`** — Load and execute a file in the REPL
- **\`.save filename\`** — Save the REPL session to a file
- **\`.editor\`** — Enter multi-line editor mode (Ctrl+D to execute)

**Debugging Node.js applications:**

**Method 1: \`console\` debugging (quick & dirty)**
\`console.log\`, \`console.error\`, \`console.table\`, \`console.dir\`, \`console.trace\`.

**Method 2: Node.js Inspector (built-in debugger)**
\`\`\`bash
node --inspect app.js          # Start with inspector on port 9229
node --inspect-brk app.js      # Break on first line
\`\`\`
Then open \`chrome://inspect\` in Chrome or use VS Code's debugger.

**Method 3: VS Code debugger (recommended)**
Create \`.vscode/launch.json\` with a Node.js configuration. Set breakpoints in the editor and press F5.

**Method 4: \`debugger\` statement**
Place \`debugger;\` in your code — it acts as a breakpoint when running with \`--inspect\`.

**The \`util.inspect()\` function:**
Deeply inspect objects with control over depth, colors, and hidden properties. Unlike \`JSON.stringify\`, it handles circular references, Symbols, getters, and class instances.

**Error handling basics:**
Node.js has two categories of errors:
1. **Operational errors** — Expected failures (network timeout, file not found, invalid user input). Handle with try/catch, error callbacks, or rejected promises.
2. **Programmer errors** — Bugs in code (TypeError, ReferenceError, assertion failures). Fix by correcting the code.

🏠 **Real-world analogy:** The REPL is like a **chemistry lab** — you can mix reagents (code) and immediately see the reaction (result). You wouldn't build a factory (production app) in the lab, but it's perfect for quick experiments and learning.`,
      codeExample: `// Node.js REPL and Debugging Techniques

// 1. Creating a custom REPL with pre-loaded context
const repl = require("repl");
const util = require("util");

function startCustomRepl() {
  const r = repl.start({
    prompt: "myapp > ",
    useColors: true,
  });

  // Pre-load commonly used modules
  r.context.db = { find: (q) => \`Querying: \${JSON.stringify(q)}\` };
  r.context.config = { port: 3000, env: "development" };
  r.context._ = require("lodash"); // If installed

  console.log("Custom REPL started. Pre-loaded: db, config");
}

// Uncomment to use: startCustomRepl();

// 2. util.inspect — Deep object inspection
const complexObj = {
  name: "Server",
  nested: {
    deep: {
      deeper: {
        value: "found it!",
      },
    },
  },
  date: new Date(),
  regex: /^hello$/gi,
  fn: function myFunc() {},
  sym: Symbol("id"),
  arr: [1, [2, [3, [4]]]],
};

// Default depth is 2 — you miss deep values
console.log("Default inspect:", util.inspect(complexObj));

// Full depth with colors
console.log("\\nFull inspect:", util.inspect(complexObj, {
  depth: null,       // Show ALL levels
  colors: true,      // Syntax highlighting
  showHidden: false, // Show non-enumerable properties
  compact: false,    // Pretty-print
  sorted: true,      // Sort object keys
}));

// 3. console.dir with depth control
console.dir(complexObj, { depth: null, colors: true });

// 4. console.table for structured data
const users = [
  { name: "Alice", role: "admin", age: 30 },
  { name: "Bob", role: "user", age: 25 },
  { name: "Charlie", role: "moderator", age: 35 },
];
console.table(users);
console.table(users, ["name", "role"]); // Select columns

// 5. console.trace — Stack trace for debugging
function a() { b(); }
function b() { c(); }
function c() {
  console.trace("How did we get here?");
}
// a(); // Uncomment to see the full call stack

// 6. Error handling patterns
// ❌ BAD: Swallowing errors
function badErrorHandling() {
  try {
    JSON.parse("invalid json");
  } catch (e) {
    // Silent failure — impossible to debug
  }
}

// ✅ GOOD: Handle errors meaningfully
function goodErrorHandling(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", {
      input: jsonString.substring(0, 100),
      error: error.message,
      stack: error.stack,
    });
    throw new Error(\`Invalid JSON input: \${error.message}\`);
  }
}

// 7. Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(\`\${resource} not found\`, 404);
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super(\`Validation failed: \${field} - \${message}\`, 400);
    this.field = field;
  }
}

// Usage
try {
  throw new NotFoundError("User");
} catch (err) {
  console.log("\\n--- Custom Error ---");
  console.log("Name:", err.name);         // NotFoundError
  console.log("Message:", err.message);   // User not found
  console.log("Status:", err.statusCode); // 404
  console.log("Is operational:", err.isOperational); // true
}

// 8. Unhandled errors — last resort handlers
process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
  // Log the error, then exit (don't try to recover)
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
  // In production: log and exit
});`,
      exercise: `**Exercises:**
1. Start the Node.js REPL and explore \`os\`, \`path\`, and \`crypto\` modules using Tab completion
2. Create a custom REPL that pre-loads your project's database models and utility functions
3. Use \`node --inspect-brk\` to debug a simple script in Chrome DevTools — set breakpoints and step through
4. Write a custom error class hierarchy: \`AppError\` → \`HttpError\` → \`NotFoundError\` / \`ForbiddenError\`
5. Create a debugging utility that wraps \`console.log\` with timestamps, colors, and log levels
6. Write a script with a deliberate bug, use \`console.trace()\` and the debugger to find and fix it`,
      commonMistakes: [
        "Using `console.log(JSON.stringify(obj))` instead of `util.inspect()` — JSON.stringify crashes on circular references and hides Symbols, functions, and class info",
        "Catching errors without doing anything (`catch (e) {}`) — silent failures are the #1 source of mysterious production bugs",
        "Using `process.on('uncaughtException')` to keep the server running — after an uncaught exception, the app state is unknown; always exit and restart",
        "Not using custom error classes — throwing plain `Error('something failed')` doesn't carry status codes, error types, or context needed for proper handling",
        "Relying only on `console.log` debugging — learn the Node.js inspector for complex bugs; it shows call stacks, variables, and memory in real time",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between operational errors and programmer errors in Node.js?",
          a: "**Operational errors** are expected runtime problems: network timeout, file not found, invalid user input, database connection failure. These should be **anticipated and handled** with try/catch, error callbacks, or `.catch()`. **Programmer errors** are bugs: TypeError, null reference, assertion failure, calling a function with wrong arguments. These should be **fixed in code**, not handled at runtime. The distinction matters because: operational errors → handle gracefully; programmer errors → crash, log, and fix. Libraries like `express` handle operational errors as HTTP responses; programmer errors should crash the process and be caught by a process manager (PM2, Docker).",
        },
        {
          type: "scenario",
          q: "How would you debug a Node.js application that's running slowly in production?",
          a: "Systematic approach: (1) **Check event loop lag** — use `process.hrtime()` or the `blocked-at` package to find if the event loop is blocked. (2) **CPU profiling** — run `node --prof app.js`, then `node --prof-process isolate-*.log` to find hot functions. (3) **Heap snapshots** — use `--inspect` and Chrome DevTools to compare heap snapshots and find memory leaks. (4) **Async hooks** — use `async_hooks` to track long-running async operations. (5) **Logging** — add timing logs around I/O operations (database queries, HTTP calls). (6) **APM tools** — New Relic, Datadog, or Clinic.js for production-grade profiling. (7) **Load testing** — use `artillery` or `k6` to reproduce the issue locally.",
        },
      ],
    },
  ],
};

export default nodePhase1;
