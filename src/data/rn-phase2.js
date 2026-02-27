const rnPhase2 = {
  id: "phase-2",
  title: "Phase 2: JavaScript & TypeScript Mastery",
  emoji: "⚡",
  description: "Deep internals of JavaScript execution — closures, event loop, memory management, prototype chain, async patterns — plus advanced TypeScript for architect-level type safety.",
  topics: [
    {
      id: "execution-context-closures",
      title: "Execution Context, Closures & Scope Chain",
      explanation: `**Execution Context** is the environment in which JavaScript code is evaluated and executed. Every time a function is called, a new execution context is created and pushed onto the call stack.

**Three types of execution contexts:**
1. **Global Execution Context** — created when the script first runs. Sets up the global object (\`window\`/\`globalThis\`) and \`this\` binding.
2. **Function Execution Context** — created each time a function is invoked.
3. **Eval Execution Context** — created inside \`eval()\` (avoid in production).

**Each execution context has two phases:**
- **Creation Phase**: JavaScript engine scans for declarations. \`var\` declarations are hoisted and initialized to \`undefined\`. \`let\`/\`const\` declarations are hoisted but NOT initialized (Temporal Dead Zone). Function declarations are hoisted entirely.
- **Execution Phase**: Code runs line by line, assignments happen, functions execute.

**Scope Chain** is the mechanism by which JavaScript resolves variable references. Each execution context has a reference to its **outer environment**. When a variable is referenced, the engine searches:
1. Current scope → 2. Parent scope → 3. ... → n. Global scope → ReferenceError

**Closures** occur when a function retains access to its lexical scope even after the outer function has returned. This is NOT just an academic concept — closures are the foundation of:
- React hooks (useState, useEffect internally use closures)
- Event handlers retaining state
- Module patterns and data privacy
- Debounce/throttle implementations
- Memoization caches

**Production-critical closure behavior in React Native:**
Stale closures are the #1 source of subtle bugs in hooks. When a \`useEffect\` or \`useCallback\` captures a value, it captures the value **at the time of the closure creation**, not a live reference.`,
      codeExample: `// === EXECUTION CONTEXT VISUALIZATION ===
// Call Stack progression:

var x = 10;            // Global EC created

function outer(a) {    // outer EC created when called
  var y = 20;
  
  function inner(b) {  // inner EC created when called
    var z = 30;
    // Scope chain: inner → outer → global
    console.log(a + b + x + y + z); // Can access all
  }
  
  inner(5);            // inner EC pushed, executed, popped
}

outer(1);              // outer EC pushed → inner EC pushed/popped → outer EC popped

// === CLOSURE: REAL PRODUCTION USE CASES ===

// 1. React Native: Stale closure in useEffect
function ChatScreen() {
  const [messages, setMessages] = useState([]);
  
  // ❌ BUG: Stale closure — captures initial empty array
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/chat');
    ws.onmessage = (event) => {
      // 'messages' is ALWAYS [] here — stale closure!
      setMessages([...messages, JSON.parse(event.data)]);
    };
    return () => ws.close();
  }, []); // Empty deps = closure created once
  
  // ✅ FIX: Use functional update to access latest state
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/chat');
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)]);
    };
    return () => ws.close();
  }, []);
}

// 2. Debounce implementation using closures
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  // Returned function closes over timeoutId and fn
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// 3. Module pattern — private state via closure
function createAPIClient(baseURL: string) {
  let authToken: string | null = null;  // Private — only accessible via closure
  let requestCount = 0;                  // Private counter
  
  return {
    setToken(token: string) { authToken = token; },
    getRequestCount() { return requestCount; },
    async fetch(endpoint: string, options?: RequestInit) {
      requestCount++;
      return fetch(\`\${baseURL}\${endpoint}\`, {
        ...options,
        headers: {
          ...options?.headers,
          ...(authToken ? { Authorization: \`Bearer \${authToken}\` } : {}),
        },
      });
    },
  };
}

// authToken is truly private — no way to access it except through setToken
const api = createAPIClient('https://api.example.com');
api.setToken('secret123');`,
      exercise: `**Deep Practice:**
1. Draw the call stack and scope chain for a 3-level nested function call
2. Implement a \`once(fn)\` function using closures that ensures \`fn\` is called at most once
3. Implement a \`memoize(fn)\` function that caches results based on arguments
4. Find and fix the stale closure bug in this React Native code:
   \`\`\`
   const [count, setCount] = useState(0);
   useEffect(() => {
     const interval = setInterval(() => {
       setCount(count + 1); // Bug: always sets to 1
     }, 1000);
     return () => clearInterval(interval);
   }, []);
   \`\`\`
5. Explain why \`let\` fixes the classic \`setTimeout\` in a loop problem but \`var\` doesn't
6. Build a rate limiter using closures that allows at most N calls per T milliseconds`,
      commonMistakes: [
        "Stale closures in React hooks — capturing a value inside useEffect/useCallback without proper dependency tracking",
        "Memory leaks from closures holding references to large objects — the GC can't collect anything the closure references",
        "Confusing block scope (let/const) with function scope (var) when reasoning about closures",
        "Not understanding that closures capture variables by reference, not by value — the value at read time matters, not at closure creation",
        "Creating unnecessary closures in hot paths (render functions, FlatList item renderers) causing GC pressure",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What will this print and why?\n```js\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n```",
          a: "`3, 3, 3`. `var` is function-scoped, so there's ONE `i` shared across all iterations. By the time the timeouts fire, the loop has completed and `i` is `3`. Fix with `let` (block-scoped, creates new `i` per iteration) or IIFE: `(function(j) { setTimeout(() => console.log(j), 100); })(i)`.",
        },
        {
          type: "scenario",
          q: "In a React Native app, your useEffect callback logs an outdated state value after a WebSocket message. Diagnose and fix it.",
          a: "**Diagnosis: Stale closure.** The useEffect callback closes over the state value at the time the effect was created. Since the dependency array is `[]`, the effect runs once and captures the initial state. **Fixes:** (1) Use functional state updates: `setState(prev => ...)`. (2) Use a ref to track the latest value: `const latestRef = useRef(state); latestRef.current = state;` then read `latestRef.current` in the callback. (3) Add the state to the dependency array (but this recreates the WebSocket connection on every state change — usually wrong). Best approach depends on context: functional update for simple cases, ref for complex access patterns.",
        },
        {
          type: "conceptual",
          q: "How do closures relate to memory leaks in React Native?",
          a: "Closures retain references to their entire lexical scope chain. In React Native, if a closure (event handler, timer, subscription callback) captures a reference to a component's state, props, or heavy objects (images, large arrays), those objects cannot be garbage collected until the closure itself is released. Common leak patterns: (1) Unreleased event listeners in useEffect without cleanup. (2) setInterval callbacks that capture component state. (3) Promise chains that reference unmounted component state. (4) Navigation listeners that capture screen-level data. Fix: always return cleanup functions from useEffect, use WeakRef for optional references.",
        },
      ],
    },
    {
      id: "event-loop-async",
      title: "Event Loop, Microtasks & Async Patterns",
      explanation: `**The JavaScript event loop** is the runtime mechanism that enables non-blocking I/O in a single-threaded language. Understanding it deeply is critical for React Native performance because **your JS thread is single-threaded** — any blocking operation freezes the entire UI.

**Event Loop Architecture:**
\`\`\`
┌──────────────────────────────┐
│         Call Stack            │ ← Synchronous code executes here
├──────────────────────────────┤
│        Microtask Queue        │ ← Promises, queueMicrotask, MutationObserver
│  (drains completely before    │
│   moving to macrotask queue)  │
├──────────────────────────────┤
│        Macrotask Queue        │ ← setTimeout, setInterval, I/O, UI rendering
│  (one task per event loop     │
│   iteration)                  │
└──────────────────────────────┘
\`\`\`

**Critical order of execution:**
1. Execute all synchronous code on the call stack
2. Drain the **entire** microtask queue (Promises, queueMicrotask)
3. Execute **ONE** macrotask (setTimeout, setInterval, I/O)
4. Repeat from step 2 (check microtask queue again)

**Why this matters in React Native:**
- The JS thread runs an event loop that processes bridge messages, timers, and React rendering
- Long synchronous operations block the JS thread → UI becomes unresponsive
- Too many microtasks can starve macrotasks (setTimeout callbacks delayed)
- \`InteractionManager.runAfterInteractions()\` schedules work after animations complete
- Hermes engine has its own microtask implementation

**Async patterns hierarchy:**
1. **Callbacks** — Legacy, leads to callback hell
2. **Promises** — Chainable, better error handling
3. **async/await** — Syntactic sugar over Promises, sequential-looking async code
4. **Observables (RxJS)** — Powerful for event streams, but heavy for most RN apps
5. **AsyncGenerators** — Useful for paginated data fetching`,
      codeExample: `// === EVENT LOOP EXECUTION ORDER ===

console.log('1 - sync');                          // 1st: Call stack

setTimeout(() => console.log('2 - macrotask'), 0); // Queued to macrotask

Promise.resolve().then(() => {
  console.log('3 - microtask');                    // 2nd: Microtask queue
  // Microtask inside microtask — still runs before macrotask!
  Promise.resolve().then(() => {
    console.log('4 - nested microtask');            // 3rd: Still microtask
  });
});

queueMicrotask(() => console.log('5 - queueMicrotask')); // 4th: Microtask

console.log('6 - sync');                          // Before any async

// Output order: 1, 6, 3, 5, 4, 2
// All sync → all microtasks (including nested) → one macrotask

// === PRODUCTION ASYNC PATTERNS IN REACT NATIVE ===

// 1. Parallel API calls with error isolation
async function loadDashboard(): Promise<DashboardData> {
  const [userResult, feedResult, notifResult] = await Promise.allSettled([
    fetchUser(),
    fetchFeed(),
    fetchNotifications(),
  ]);

  return {
    user: userResult.status === 'fulfilled' ? userResult.value : null,
    feed: feedResult.status === 'fulfilled' ? feedResult.value : [],
    notifications: notifResult.status === 'fulfilled' ? notifResult.value : [],
    errors: [userResult, feedResult, notifResult]
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason),
  };
}

// 2. Cancellable async operation with AbortController
function useCancellableFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      }
    }

    fetchData();
    return () => controller.abort(); // Cancel on unmount or URL change
  }, [url]);

  return { data, error };
}

// 3. Async generator for paginated data
async function* fetchPaginatedData<T>(
  endpoint: string,
  pageSize: number = 20
): AsyncGenerator<T[]> {
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({ limit: String(pageSize) });
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(\`\${endpoint}?\${params}\`);
    const { data, nextCursor } = await response.json();

    yield data;

    cursor = nextCursor;
    hasMore = !!nextCursor;
  }
}

// Usage with FlatList infinite scroll
async function loadNextPage() {
  const result = await paginatedIterator.next();
  if (!result.done) {
    setItems(prev => [...prev, ...result.value]);
  }
}`,
      exercise: `**Event Loop Deep Dive:**
1. Predict the exact output order of this code:
   \`\`\`
   setTimeout(() => console.log('A'), 0);
   Promise.resolve().then(() => console.log('B'));
   requestAnimationFrame(() => console.log('C'));
   queueMicrotask(() => console.log('D'));
   console.log('E');
   \`\`\`
2. Implement \`Promise.allSettled\` from scratch using \`Promise.all\`
3. Build a retry mechanism with exponential backoff for API calls
4. Create an async task queue that processes max 3 concurrent operations
5. Implement \`InteractionManager.runAfterInteractions\` equivalent using event loop knowledge
6. Write a function that detects if the JS thread is being blocked (using setTimeout timing drift)`,
      commonMistakes: [
        "Flooding the microtask queue with recursive Promise.resolve().then() — this starves the UI thread and prevents rendering",
        "Using await in a loop instead of Promise.all — sequential when parallel is possible, N×latency instead of max(latency)",
        "Not handling Promise rejection — unhandled rejections crash the app in production",
        "Blocking the JS thread with synchronous operations (JSON.parse of large payloads, heavy computation) — freezes the UI",
        "Mixing setTimeout(fn, 0) with Promise.then() and expecting them to execute in order — microtasks always come first",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What's the output?\n```js\nasync function foo() {\n  console.log('A');\n  await Promise.resolve();\n  console.log('B');\n}\nconsole.log('C');\nfoo();\nconsole.log('D');\n```",
          a: "`C, A, D, B`. `console.log('C')` runs first (sync). `foo()` is called: `console.log('A')` runs (sync). `await Promise.resolve()` pauses `foo` — everything after the `await` becomes a microtask. `console.log('D')` runs (sync, back in the global context). Then the microtask runs: `console.log('B')`.",
        },
        {
          type: "scenario",
          q: "Your React Native app's UI freezes for 2 seconds when the user opens a screen with a large dataset. The data comes from AsyncStorage. How do you debug and fix it?",
          a: "**Diagnosis:** AsyncStorage.getItem is async but JSON.parse of the result is synchronous. If the stored data is large (e.g., 5MB JSON), JSON.parse blocks the JS thread. **Debugging:** Use Flipper's Performance plugin or Hermes sampling profiler to confirm the JS thread is blocked during JSON.parse. **Fixes:** (1) Use MMKV instead of AsyncStorage — it's synchronous but runs on native thread via JSI. (2) If sticking with AsyncStorage, paginate the stored data. (3) Move heavy parsing to a worker thread using react-native-workers. (4) Parse incrementally using a streaming JSON parser. (5) Store data in a normalized format so you only load what's needed.",
        },
        {
          type: "conceptual",
          q: "Explain the difference between Promise.all, Promise.allSettled, Promise.race, and Promise.any.",
          a: "**Promise.all**: Resolves when ALL promises resolve. Rejects immediately when ANY promise rejects. Use for parallel operations where you need all results. **Promise.allSettled**: Waits for ALL promises to settle (resolve or reject). Never short-circuits. Returns array of {status, value/reason}. Use when you want results regardless of individual failures. **Promise.race**: Resolves/rejects with the FIRST promise to settle. Use for timeouts or competing strategies. **Promise.any**: Resolves with the FIRST fulfilled promise. Rejects only if ALL reject (AggregateError). Use for fallback strategies (try CDN1, CDN2, CDN3).",
        },
      ],
    },
    {
      id: "memory-management-prototypes",
      title: "Memory Management & Prototype System",
      explanation: `**Memory Management in JavaScript** uses automatic garbage collection (GC). The engine (V8, Hermes, JSC) allocates memory when objects are created and frees it when they're no longer reachable. But "automatic" doesn't mean "worry-free" — memory leaks are one of the top production issues in React Native.

**Memory lifecycle:**
1. **Allocation** — When you declare variables, create objects, or call functions
2. **Usage** — Reading/writing to allocated memory
3. **Deallocation** — GC removes unreachable objects (no references pointing to them)

**GC algorithms used by JS engines:**
- **Mark-and-Sweep** (V8/Hermes primary): Starts from roots (global, stack), marks all reachable objects, sweeps unmarked ones
- **Generational GC** (V8): Young generation (nursery) for short-lived objects, old generation for long-lived. Most objects die young — optimize for that
- **Incremental/Concurrent GC**: GC runs in small slices to avoid long pauses

**React Native Memory Leak Patterns:**
1. **Unmounted component listeners** — Event listeners not cleaned up in useEffect return
2. **Closure references** — Callbacks holding references to unmounted component state
3. **Global caches** — Unbounded caches that grow without eviction
4. **Circular references** — Objects referencing each other preventing collection
5. **Native module leaks** — Native allocations not released when JS objects are GC'd

**The Prototype System:**
Every JavaScript object has an internal \`[[Prototype]]\` link forming a chain. Property lookups traverse this chain. Understanding prototypes is essential because:
- React Native components extend React.Component through the prototype chain
- Performance: prototype method lookup is O(chain length)
- \`class\` syntax is syntactic sugar over prototypes
- Understanding \`this\` binding requires understanding prototype dispatch`,
      codeExample: `// === MEMORY LEAK PATTERNS IN REACT NATIVE ===

// ❌ LEAK: Event listener not cleaned up
function ChatScreen() {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const subscription = EventEmitter.addListener('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    // Missing: return () => subscription.remove();
    // When this screen unmounts, the listener persists,
    // holding a reference to setMessages → component → entire subtree
  }, []);
}

// ✅ FIX: Always return cleanup
useEffect(() => {
  const subscription = EventEmitter.addListener('newMessage', handler);
  return () => subscription.remove();
}, []);

// ❌ LEAK: Unbounded cache
const imageCache = new Map(); // Grows forever!
function cacheImage(url, bitmap) {
  imageCache.set(url, bitmap); // 50MB+ bitmaps accumulate
}

// ✅ FIX: LRU cache with max size
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private maxSize: number) {}
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    this.cache.delete(key); // Remove if exists (for reorder)
    this.cache.set(key, value);
    if (this.cache.size > this.maxSize) {
      // Delete oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// ✅ WeakRef for optional caching (GC can collect if needed)
const weakCache = new Map<string, WeakRef<object>>();
function getCachedOrFetch(key: string): object | null {
  const ref = weakCache.get(key);
  const cached = ref?.deref();
  if (cached) return cached;
  // Fetch fresh data...
  return null;
}

// === PROTOTYPE SYSTEM ===

// How class inheritance actually works:
class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  speak() { return \`\${this.name} barks\`; }
}

const dog = new Dog('Rex');
// Prototype chain: dog → Dog.prototype → Animal.prototype → Object.prototype → null

// Under the hood (what the engine does):
// dog.__proto__ === Dog.prototype
// Dog.prototype.__proto__ === Animal.prototype
// dog.speak() → found on Dog.prototype (no traversal needed)
// dog.toString() → not on dog, not on Dog.prototype, 
//                 found on Object.prototype (2 hops)

// Performance implication: deep prototype chains = slower property lookups
// In React Native, component hierarchies create deep chains:
// MyComponent → React.Component → Object
// Each render cycle traverses this chain for method resolution`,
      exercise: `**Memory & Prototype Exercises:**
1. Use Chrome DevTools (or Hermes profiler) to take heap snapshots before and after navigating to a screen and back — identify retained objects
2. Implement an LRU cache with O(1) get/set using Map
3. Create a memory leak deliberately (timer + closure) and then fix it
4. Explain the prototype chain for: \`const arr = [1,2,3]; arr.map(...)\` — where does \`map\` come from?
5. Implement \`Object.create\` from scratch to demonstrate prototype linkage
6. Profile your React Native app's memory usage over 5 minutes of typical use — identify the growth rate`,
      commonMistakes: [
        "Assuming garbage collection handles everything — closures, event listeners, and native references can prevent collection",
        "Using global Maps/Sets as caches without eviction — they grow unbounded and crash low-memory devices",
        "Not cleaning up useEffect subscriptions — the #1 memory leak cause in React Native apps",
        "Storing large binary data (images, buffers) in JS heap — use native storage or streaming APIs instead",
        "Confusing __proto__ with prototype — __proto__ is the internal link on instances, prototype is the object on constructors used to set __proto__",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your React Native app's memory usage grows by 10MB every time the user navigates to a specific screen and back. How do you investigate?",
          a: "**Systematic approach:** (1) Use Flipper's Hermes profiler to take heap snapshots: before navigating, after navigating, after going back. (2) Compare snapshots — look for 'Detached' DOM nodes or objects that should have been freed. (3) Check the screen's useEffect hooks — ensure all return cleanup functions. (4) Look for global event listeners, timers (setInterval), or WebSocket connections not being closed. (5) Check for closure references holding component state. (6) Inspect native module allocations — native images, video players not being released. (7) Use the FinalizationRegistry to track when specific objects are GC'd vs retained.",
        },
        {
          type: "conceptual",
          q: "What is the difference between a memory leak and high memory usage?",
          a: "**High memory usage** is when your app legitimately needs a lot of memory (large image gallery, complex UI). It's expected and can be optimized. **A memory leak** is when memory that is no longer needed cannot be freed because references still exist. The key difference: high usage stabilizes, leaks grow continuously. In React Native: if memory grows linearly with navigation back-and-forth to the same screen, it's a leak. If it grows when displaying more content, it's usage (optimize with virtualization, lazy loading).",
        },
        {
          type: "tricky",
          q: "What does `Object.create(null)` create and why would you use it?",
          a: "It creates an object with NO prototype — `__proto__` is `null`. The object has no inherited properties (no `toString`, `hasOwnProperty`, `constructor`). Use cases: (1) Pure dictionary/map objects where you don't want prototype pollution. (2) Security: preventing prototype chain attacks. (3) Performance: no prototype chain traversal for property lookups. In React Native, this is useful for large lookup tables where you want guaranteed O(1) property access without worrying about collisions with Object.prototype properties.",
        },
      ],
    },
    {
      id: "advanced-typescript",
      title: "Advanced TypeScript for Architecture",
      explanation: `**TypeScript at the Staff level** goes beyond basic type annotations. You're defining type systems that enforce architectural invariants at compile time — preventing entire categories of bugs before code even runs.

**Key advanced patterns for React Native architecture:**

1. **Generic Constraints** — Ensuring type relationships between function parameters and return types
2. **Conditional Types** — Types that change based on input types (\`T extends U ? X : Y\`)
3. **Mapped Types** — Transforming existing types systematically
4. **Template Literal Types** — String manipulation at the type level
5. **Discriminated Unions** — Type-safe state machines (critical for RN navigation and state)
6. **Type Predicates** — Custom type guards for runtime narrowing
7. **Branded/Nominal Types** — Preventing primitive confusion (UserId vs PostId)
8. **Utility Types Mastery** — \`Partial\`, \`Required\`, \`Pick\`, \`Omit\`, \`Record\`, \`Extract\`, \`Exclude\`, \`ReturnType\`, \`Parameters\`, \`Awaited\`

**Architectural impact of good TypeScript:**
- API contracts are enforced at build time — no runtime type mismatch crashes
- Navigation parameters are type-safe — can't navigate to a screen with wrong params
- Redux actions and state are exhaustively typed — impossible to dispatch a wrong action
- Component props contracts prevent integration bugs between teams
- Refactoring is safe — the compiler catches breaking changes across 200K LOC`,
      codeExample: `// === ADVANCED TYPESCRIPT FOR RN ARCHITECTURE ===

// 1. Branded Types — prevent ID confusion
type Brand<T, B> = T & { __brand: B };
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;
type OrderId = Brand<string, 'OrderId'>;

function createUserId(id: string): UserId { return id as UserId; }
function createPostId(id: string): PostId { return id as PostId; }

function fetchUser(id: UserId): Promise<User> { /* ... */ }
function fetchPost(id: PostId): Promise<Post> { /* ... */ }

const userId = createUserId('u_123');
const postId = createPostId('p_456');

fetchUser(userId);  // ✅
// fetchUser(postId); // ❌ Compile error! Can't pass PostId where UserId expected

// 2. Discriminated Unions for State Machines
type NetworkState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error; retryCount: number };

// Exhaustive handling — compiler ensures every case is handled
function renderState<T>(state: NetworkState<T>) {
  switch (state.status) {
    case 'idle': return <EmptyState />;
    case 'loading': return <Spinner />;
    case 'success': return <DataView data={state.data} />; // data is typed!
    case 'error': return <ErrorView error={state.error} />;
    // If you add a new status, TypeScript errors until you handle it
  }
}

// 3. Type-Safe Navigation (React Navigation)
type RootStackParamList = {
  Home: undefined;
  Profile: { userId: UserId };
  Post: { postId: PostId; showComments?: boolean };
  Settings: undefined;
};

// Enforces correct params at every navigation call
declare const navigation: NavigationProp<RootStackParamList>;
navigation.navigate('Profile', { userId: createUserId('u_1') }); // ✅
// navigation.navigate('Profile', { postId: 'p_1' }); // ❌ Wrong params!
// navigation.navigate('Profle'); // ❌ Typo caught at compile time!

// 4. Generic API Layer
interface APIResponse<T> {
  data: T;
  meta: { page: number; total: number };
}

interface APIEndpoints {
  '/users': { list: User[]; get: User; create: CreateUserDTO };
  '/posts': { list: Post[]; get: Post; create: CreatePostDTO };
  '/orders': { list: Order[]; get: Order; create: CreateOrderDTO };
}

type EndpointMethod = 'list' | 'get' | 'create';

async function apiCall<
  E extends keyof APIEndpoints,
  M extends EndpointMethod
>(
  endpoint: E,
  method: M,
  ...args: M extends 'create' ? [APIEndpoints[E][M]] : []
): Promise<APIResponse<APIEndpoints[E][M]>> {
  // Implementation — fully type-safe API calls
}

// Usage — compiler knows exact return type
const users = await apiCall('/users', 'list');     // APIResponse<User[]>
const post = await apiCall('/posts', 'get');        // APIResponse<Post>
// await apiCall('/users', 'delete');               // ❌ 'delete' not in EndpointMethod

// 5. Conditional Types for Platform-Specific Code
type PlatformSpecific<IOS, Android> = 
  typeof Platform.OS extends 'ios' ? IOS : Android;

type HapticFeedback = PlatformSpecific<IOSHaptic, AndroidVibration>;

// 6. Utility Type Composition
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Use for configuration objects that are partially overridable
type AppConfig = DeepRequired<{
  api: { baseUrl: string; timeout: number; retries: number };
  features: { darkMode: boolean; analytics: boolean };
  cache: { maxSize: number; ttl: number };
}>;

type UserOverrides = DeepPartial<AppConfig>;`,
      exercise: `**TypeScript Architecture Exercises:**
1. Define a type-safe event emitter where event names and payloads are statically typed
2. Create a \`createAction\` / \`createReducer\` pattern where the compiler ensures exhaustive action handling
3. Implement a type-safe \`useQuery\` hook where the return type is inferred from the query function
4. Define branded types for all ID types in your project — enforce them across the codebase
5. Create a type-safe form validation system where field validators are typed to match the form schema
6. Build a pipeline/compose function with correct type inference for each step`,
      commonMistakes: [
        "Using `any` to 'fix' complex type errors — this defeats the entire purpose of TypeScript and hides real bugs",
        "Over-engineering types — if a type definition is harder to understand than the code it protects, simplify it",
        "Not using discriminated unions for state — using boolean flags (isLoading, isError, hasData) creates impossible states",
        "Forgetting that TypeScript types are erased at runtime — you still need runtime validation for external data (API responses, user input)",
        "Not leveraging generics for shared utilities — duplicating similar types instead of creating generic abstractions",
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Implement a type-safe `deepGet` function: `deepGet(obj, 'a.b.c')` should return the correct type based on the path.",
          a: "```typescript\ntype DeepGet<T, K extends string> = \n  K extends `${infer First}.${infer Rest}` \n    ? First extends keyof T \n      ? DeepGet<T[First], Rest> \n      : never \n    : K extends keyof T \n      ? T[K] \n      : never;\n\nfunction deepGet<T, K extends string>(obj: T, path: K): DeepGet<T, K> {\n  return path.split('.').reduce((acc, key) => (acc as any)[key], obj) as any;\n}\n\n// Usage:\nconst config = { api: { base: { url: 'https://...' } } };\nconst url = deepGet(config, 'api.base.url'); // type: string\n```",
        },
        {
          type: "conceptual",
          q: "What are discriminated unions and why are they critical for React Native state management?",
          a: "Discriminated unions use a common literal property (discriminant) to distinguish between variants. They're critical because they make **impossible states impossible**: instead of `{ isLoading: boolean, error: Error | null, data: T | null }` (8 possible combinations, most invalid), you use `{ status: 'loading' } | { status: 'error', error: Error } | { status: 'success', data: T }` (3 valid states only). TypeScript ensures exhaustive handling via `switch`. In React Native, this pattern is essential for network state, navigation state, form state, and authentication state.",
        },
        {
          type: "scenario",
          q: "You're building a component library for 5 React Native teams. How do you use TypeScript to enforce API consistency?",
          a: "**Strategy:** (1) Define a `ComponentContract<Props, Ref>` generic type that all components must implement — enforces accessibility props, testID, style overrides. (2) Use `satisfies` operator so component props must match the contract. (3) Export discriminated union types for component variants instead of boolean props. (4) Use template literal types for event handler naming conventions. (5) Provide a `createComponent` factory that injects common props and wraps with error boundaries — all type-safe. (6) Publish types as a separate package so teams get type checking without importing component code.",
        },
      ],
    },
  ],
};

export default rnPhase2;
