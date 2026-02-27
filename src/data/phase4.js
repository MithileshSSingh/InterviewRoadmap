const phase4 = {
  id: "phase-4",
  title: "Phase 4: Advanced",
  emoji: "🔴",
  description: "Master advanced patterns, performance optimization, design patterns, security, and TypeScript fundamentals.",
  topics: [
    {
      id: "advanced-closures-currying",
      title: "Advanced Closures & Currying",
      explanation: `**Currying** transforms a function that takes multiple arguments into a sequence of functions each taking a single argument: \`f(a, b, c)\` → \`f(a)(b)(c)\`.

**Partial Application** fixes some arguments of a function, producing a function with fewer arguments.

Both leverage closures to "remember" previously supplied arguments.

🏠 **Real-world analogy:** Currying is like a burger assembly line. Station 1 adds the bun (first arg). Station 2 adds the patty (second arg). Station 3 adds toppings (third arg). Each station remembers what was added before.`,
      codeExample: `// Basic currying
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...args2) {
      return curried.apply(this, args.concat(args2));
    };
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));    // 6
console.log(curriedAdd(1, 2)(3));    // 6
console.log(curriedAdd(1)(2, 3));    // 6

// Practical currying
const multiply = curry((a, b) => a * b);
const double = multiply(2);
const triple = multiply(3);
console.log([1,2,3].map(double)); // [2, 4, 6]

// Partial application
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}
const addTax = partial(multiply, 1.2);
console.log(addTax(100)); // 120

// Advanced closure: function composition with currying
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const processPrice = pipe(
  multiply(1.2),     // Add 20% tax
  (x) => x.toFixed(2), // Format
  (x) => \`$\${x}\`       // Add currency
);
console.log(processPrice(100)); // "$120.00"`,
      exercise: `**Mini Exercise:**
1. Implement a generic \`curry\` function that handles any number of arguments
2. Create a curried \`logger(level)(module)(message)\` function
3. Build a curried API query builder: \`query(table)(fields)(conditions)\`
4. Implement \`partial\` and \`partialRight\` functions`,
      commonMistakes: [
        "Currying only works when function's `.length` is accurate — rest params and defaults break this",
        "Over-currying simple functions makes code harder to read — use it when it provides clear benefits",
        "Confusing currying (one arg at a time) with partial application (fixing some args upfront)",
        "Memory overhead — each curried call creates a new closure in memory",
        "Not understanding that arrow functions with defaults have `.length` of 0 for defaulted params"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is currying and how is it different from partial application?", a: "**Currying** transforms `f(a, b, c)` into `f(a)(b)(c)` — each call takes exactly one argument. **Partial application** fixes some arguments: `partial(f, 1)` returns a function expecting the remaining args. Currying ALWAYS produces unary functions; partial application can fix any number of args." },
        { type: "coding", q: "Implement a `curry` function that works for any function.", a: "```js\nfunction curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn(...args);\n    return (...more) => curried(...args, ...more);\n  };\n}\n```" },
        { type: "tricky", q: "What will `curry(Math.max)(1)(2)(3)` return?", a: "It won't work as expected. `Math.max.length` is `0` (it uses rest params), so `curry` would immediately call `Math.max(1)` = `1`. Currying relies on `fn.length`, which doesn't count rest params. You'd need `curry(Math.max, 3)` with an explicit arity." },
        { type: "scenario", q: "Give a real-world use case where currying improves code quality.", a: "Event handlers with config: `const handleClick = curry((analytics, router, event) => { analytics.track('click'); router.push(event.target.href); })`. Pre-configure: `const onClick = handleClick(analyticsInstance)(routerInstance)`. Now `onClick` is a clean handler that already knows its dependencies." },
        { type: "coding", q: "Write a curried `filter` function usable as: `filterBy('active')(users)`.", a: "```js\nconst filterBy = curry((key, arr) => arr.filter(item => item[key]));\nconst getActive = filterBy('active');\nconst activeUsers = getActive([{name:'A',active:true},{name:'B',active:false}]);\n// [{name:'A',active:true}]\n```" }
      ]
    },
    {
      id: "memoization",
      title: "Memoization & Performance Optimization",
      explanation: `**Memoization** caches the results of expensive function calls and returns the cached result when the same inputs occur again.

It's an optimization technique that trades memory for speed — ideal for:
- Pure functions (same inputs always give same output)
- Expensive computations (recursive algorithms, complex calculations)
- Repeated calls with the same arguments

🏠 **Real-world analogy:** Memoization is like a student who writes answers on a cheat sheet during open-book exams. Instead of looking up the same formula every time, they check their notes first. If they've solved it before, they reuse the answer.`,
      codeExample: `// Basic memoize
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("Cache hit!");
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Fibonacci without memoization: O(2^n) 😱
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Fibonacci with memoization: O(n) 🚀
const memoFib = memoize(function fib(n) {
  if (n <= 1) return n;
  return memoFib(n - 1) + memoFib(n - 2);
});

console.time("no-memo");
fib(35);  // ~100ms
console.timeEnd("no-memo");

console.time("memo");
memoFib(35); // ~0.1ms
console.timeEnd("memo");

// Advanced memoize with LRU cache (limited size)
function memoizeLRU(fn, maxSize = 100) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value); // Move to end (most recent)
      return value;
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey); // Remove least recently used
    }
    return result;
  };
}

// Performance measurement
console.time("operation");
// ... expensive operation
console.timeEnd("operation");

// Performance API
const t0 = performance.now();
// ... operation
const t1 = performance.now();
console.log(\`Took \${(t1 - t0).toFixed(2)}ms\`);`,
      exercise: `**Mini Exercise:**
1. Implement memoization for a factorial function and measure the speedup
2. Build an LRU cache class with get, set, and delete methods
3. Memoize a function that fetches user data by ID (async memoization)
4. Write a benchmark utility that compares performance of two functions`,
      commonMistakes: [
        "Memoizing impure functions — if the function has side effects or depends on external state, cached results may be wrong",
        "Using unbounded caches — memory grows indefinitely! Use LRU or TTL-based eviction",
        "Using `JSON.stringify` as cache key for objects with circular references — it throws",
        "Memoizing functions with many unique inputs — cache rarely hits, just wastes memory",
        "Not considering that memoization adds overhead — for cheap functions, the overhead exceeds savings"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is memoization and when should you use it?", a: "Memoization caches function results for repeated calls with the same inputs. Use when: 1) Function is pure (same inputs → same output), 2) Function is called repeatedly with same args, 3) Computation is expensive, 4) Input domain is limited. Don't use for: impure functions, functions with many unique inputs, or cheap computations." },
        { type: "coding", q: "Implement a `memoize` function with a configurable cache size limit.", a: "```js\nfunction memoize(fn, maxSize = 100) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    if (cache.size >= maxSize) {\n      cache.delete(cache.keys().next().value);\n    }\n    cache.set(key, result);\n    return result;\n  };\n}\n```" },
        { type: "tricky", q: "Can you memoize async functions? What are the caveats?", a: "Yes, but cache the Promise, not the result: ```js\nconst memoAsync = (fn) => {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (!cache.has(key)) cache.set(key, fn(...args).catch(e => { cache.delete(key); throw e; }));\n    return cache.get(key);\n  };\n};\n``` Caveat: if the Promise rejects, delete from cache so it retries." },
        { type: "conceptual", q: "What is the time-space tradeoff in memoization?", a: "Memoization trades memory (storing cached results) for time (avoiding recomputation). It's beneficial when: computation time >> memory cost, and cache hit rate is high. It's wasteful when: inputs are rarely repeated, or the cache grows too large. An LRU cache bounds memory usage." },
        { type: "scenario", q: "How would you optimize a recursive tree traversal that's called millions of times?", a: "1) Memoize with a Map keyed by node identity. 2) Convert recursion to iteration with an explicit stack (avoid stack overflow). 3) Use dynamic programming (bottom-up) instead of top-down recursion. 4) Prune unnecessary branches early. 5) Consider Web Workers for parallel traversal of independent subtrees." }
      ]
    },
    {
      id: "debouncing-throttling",
      title: "Debouncing & Throttling",
      explanation: `**Debouncing** and **Throttling** are rate-limiting techniques that control how often a function is called.

**Debounce** — Waits until the user STOPS triggering for N ms, then calls once. Use for: search input, window resize, form validation.

**Throttle** — Calls at most once every N ms, no matter how often triggered. Use for: scroll events, mouse move, game loops.

🏠 **Real-world analogy:** **Debounce** is like an elevator — it waits until people stop pressing buttons, then moves. **Throttle** is like a turnstile — it lets one person through every few seconds, no matter how many are waiting.`,
      codeExample: `// Debounce implementation
function debounce(fn, delay, { leading = false } = {}) {
  let timer;
  let isLeading = leading;
  return function(...args) {
    if (isLeading && !timer) {
      fn.apply(this, args);
      isLeading = false;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!leading) fn.apply(this, args);
      timer = null;
      isLeading = leading;
    }, delay);
  };
}

// Throttle implementation
function throttle(fn, limit) {
  let inThrottle = false;
  let lastArgs = null;
  let lastThis = null;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }
      }, limit);
    } else {
      lastArgs = args;
      lastThis = this;
    }
  };
}

// Usage examples
const searchInput = document.querySelector("#search");
const handleSearch = debounce((query) => {
  console.log("Searching:", query);
  // fetch(\`/api/search?q=\${query}\`)
}, 300);
searchInput.addEventListener("input", (e) => handleSearch(e.target.value));

const handleScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
}, 200);
window.addEventListener("scroll", handleScroll);

// requestAnimationFrame throttle (60fps)
function rafThrottle(fn) {
  let ticking = false;
  return function(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        fn.apply(this, args);
        ticking = false;
      });
      ticking = true;
    }
  };
}`,
      exercise: `**Mini Exercise:**
1. Implement a search bar with debounced API calls
2. Build a scroll position indicator with throttled updates
3. Create a "Save draft" feature that debounces saving to localStorage
4. Implement a window resize handler with throttling`,
      commonMistakes: [
        "Confusing debounce and throttle — debounce waits for inactivity, throttle limits frequency",
        "Creating new debounced/throttled functions on every render — memoize or define outside the render",
        "Not preserving `this` context — use `.apply(this, args)` inside the wrapper",
        "Forgetting to cancel debounce/throttle on component unmount — leads to memory leaks or errors",
        "Setting delay too long (missed updates) or too short (not effective) — benchmark for your use case"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is the difference between debouncing and throttling?", a: "**Debounce**: Delays execution until N ms after the LAST trigger. If triggered again during the wait, the timer resets. Perfect for 'after user stops typing'. **Throttle**: Executes at most once every N ms, regardless of trigger frequency. Perfect for 'while user is scrolling'." },
        { type: "coding", q: "Implement a debounce function with cancel support.", a: "```js\nfunction debounce(fn, delay) {\n  let timer;\n  function debounced(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  }\n  debounced.cancel = () => clearTimeout(timer);\n  return debounced;\n}\n```" },
        { type: "tricky", q: "What is a 'leading edge' debounce?", a: "Normally (trailing), debounce fires AFTER the delay. A leading-edge debounce fires IMMEDIATELY on the first trigger, then ignores further triggers for the delay period. Useful when you want instant feedback but prevent rapid re-triggers (e.g., submit button)." },
        { type: "coding", q: "Implement a throttle using `requestAnimationFrame`.", a: "```js\nfunction rafThrottle(fn) {\n  let ticking = false;\n  return function(...args) {\n    if (!ticking) {\n      requestAnimationFrame(() => {\n        fn.apply(this, args);\n        ticking = false;\n      });\n      ticking = true;\n    }\n  };\n}\n```" },
        { type: "scenario", q: "You have a search input that calls an API. Users complain about too many requests and results flickering. How do you fix it?", a: "1) Debounce the input handler (300-500ms). 2) Cancel pending requests when a new one starts (AbortController). 3) Only show results from the latest request (race condition prevention). 4) Add a loading state to prevent flicker. 5) Optionally, cache recent results." }
      ]
    },
    {
      id: "proxy-reflect",
      title: "Proxy & Reflect API",
      explanation: `**Proxy** creates a wrapper around an object that intercepts and redefines fundamental operations (get, set, delete, etc.). It's a powerful metaprogramming feature.

**Reflect** provides methods for interceptable JavaScript operations — the same methods available as Proxy traps but as regular functions.

**Traps:** \`get\`, \`set\`, \`has\`, \`deleteProperty\`, \`apply\`, \`construct\`, \`ownKeys\`, \`getPrototypeOf\`, etc.

🏠 **Real-world analogy:** A Proxy is like a smart home assistant. When you say "set temperature to 72" (set trap), the assistant can validate it's between 60-90, log the change, and notify other devices — all transparently.`,
      codeExample: `// Basic Proxy
const user = { name: "Alice", age: 25 };
const proxy = new Proxy(user, {
  get(target, prop, receiver) {
    console.log(\`Getting \${prop}\`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(\`Setting \${prop} = \${value}\`);
    if (prop === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("Age must be a positive number");
    }
    return Reflect.set(target, prop, value, receiver);
  }
});
proxy.name;      // logs "Getting name"
proxy.age = 30;  // logs "Setting age = 30"
// proxy.age = -5; // ❌ TypeError

// Validation Proxy
function createValidated(schema) {
  return new Proxy({}, {
    set(target, prop, value) {
      const validator = schema[prop];
      if (validator && !validator(value)) {
        throw new TypeError(\`Invalid value for \${prop}: \${value}\`);
      }
      target[prop] = value;
      return true;
    }
  });
}
const person = createValidated({
  name: (v) => typeof v === "string" && v.length > 0,
  age: (v) => Number.isInteger(v) && v >= 0 && v <= 150,
  email: (v) => /^[^@]+@[^@]+$/.test(v)
});

// Reactive data (Vue.js-style)
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;
      if (oldValue !== value) onChange(prop, value, oldValue);
      return true;
    }
  });
}
const state = reactive({ count: 0 }, (prop, newVal) => {
  console.log(\`\${prop} changed to \${newVal}\`);
});
state.count++; // "count changed to 1"

// Negative array indices
function negativeArray(arr) {
  return new Proxy(arr, {
    get(target, prop) {
      const index = Number(prop);
      if (Number.isInteger(index) && index < 0) {
        return target[target.length + index];
      }
      return Reflect.get(target, prop);
    }
  });
}
const arr = negativeArray([1, 2, 3, 4, 5]);
console.log(arr[-1]); // 5`,
      exercise: `**Mini Exercise:**
1. Create a Proxy that makes object properties read-only
2. Build a change-tracking Proxy that records all mutations
3. Implement a Proxy that auto-creates nested objects on access
4. Create a type-checked object using Proxy traps`,
      commonMistakes: [
        "Not returning `true` from `set` trap in strict mode — causes a TypeError",
        "Forgetting to use Reflect methods inside traps — they handle edge cases you might miss",
        "Creating Proxies for performance-critical code — Proxies add overhead to every operation",
        "Infinite loops — a `get` trap that reads from the proxy instead of the target",
        "Not knowing that `===` comparison between proxy and target returns `false` — they are different objects"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is a Proxy and what are its common use cases?", a: "A Proxy wraps an object and intercepts fundamental operations. Use cases: validation, logging/debugging, data binding/reactivity (Vue 3), computed properties, access control, auto-population, negative indices, and API request mocking." },
        { type: "coding", q: "Create a Proxy that logs all property accesses.", a: "```js\nfunction createLogger(obj) {\n  return new Proxy(obj, {\n    get(target, prop) {\n      console.log(`Accessed: ${prop}`);\n      return Reflect.get(target, prop);\n    },\n    set(target, prop, value) {\n      console.log(`Modified: ${prop} = ${value}`);\n      return Reflect.set(target, prop, value);\n    }\n  });\n}\n```" },
        { type: "conceptual", q: "What is the Reflect API and why is it used with Proxy?", a: "Reflect provides the default behavior for each Proxy trap as a function. Using `Reflect.get/set/etc.` inside traps ensures correct default behavior, proper prototype chain handling, and correct receiver forwarding. Without Reflect, you might miss edge cases like inherited getters/setters." },
        { type: "tricky", q: "Can you proxy a function? What traps apply?", a: "Yes. Functions are objects. You can trap `apply` (when called) and `construct` (when used with `new`): ```js\nnew Proxy(fn, { apply(target, thisArg, args) { ... }, construct(target, args) { ... } });\n``` This enables function decorating, logging, profiling, and access control." },
        { type: "scenario", q: "How does Vue 3 use Proxy for reactivity?", a: "Vue 3 wraps reactive data in a Proxy. The `get` trap tracks which component properties are accessed (dependency tracking). The `set` trap triggers re-rendering when dependencies change. This replaces Vue 2's `Object.defineProperty` approach, which couldn't detect new property additions or array mutations." }
      ]
    },
    {
      id: "symbols",
      title: "Symbols & Well-Known Symbols",
      explanation: `**Symbol** is a primitive type that creates unique, immutable identifiers. Every \`Symbol()\` call creates a completely unique value.

**Use cases:** Property keys that can't collide, defining protocols/interfaces, implementing well-known behaviors.

**Well-Known Symbols** are built-in Symbols that let you customize object behavior: \`Symbol.iterator\`, \`Symbol.toPrimitive\`, \`Symbol.toStringTag\`, \`Symbol.hasInstance\`, etc.

🏠 **Real-world analogy:** Symbols are like invisible ink labels. Two labels that say "id" in invisible ink are still different labels — even with the same description, each Symbol is unique.`,
      codeExample: `// Basic Symbols
const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(id1 === id2);  // false (every Symbol is unique)
console.log(typeof id1);   // "symbol"

// As property keys (no collisions!)
const SECRET = Symbol("secret");
const user = {
  name: "Alice",
  [SECRET]: "hidden-value"
};
console.log(user[SECRET]);     // "hidden-value"
console.log(Object.keys(user)); // ["name"] — Symbols are hidden!
console.log(JSON.stringify(user)); // '{"name":"Alice"}' — excluded!

// Global Symbol registry
const s1 = Symbol.for("shared");
const s2 = Symbol.for("shared");
console.log(s1 === s2);  // true (shared via registry)
console.log(Symbol.keyFor(s1)); // "shared"

// Well-known Symbols
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }
  // Custom string conversion
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount;
    if (hint === "string") return \`\${this.currency}\${this.amount}\`;
    return this.amount;
  }
  // Custom toString tag
  get [Symbol.toStringTag]() {
    return "Money";
  }
}
const price = new Money(42, "$");
console.log(+price);           // 42
console.log(\`\${price}\`);      // "$42"
console.log(Object.prototype.toString.call(price)); // "[object Money]"

// Symbol.iterator (make custom objects iterable)
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { done: true };
      }
    };
  }
}
console.log([...new Range(1, 5)]); // [1, 2, 3, 4, 5]`,
      exercise: `**Mini Exercise:**
1. Create a Symbol-based private property pattern for a class
2. Implement \`Symbol.iterator\` to make a linked list iterable
3. Use \`Symbol.toPrimitive\` to make a custom class work with arithmetic
4. Create a plugin system where plugins register via Symbol keys`,
      commonMistakes: [
        "Symbols are NOT strings — `Symbol('id')` and `'id'` are completely different",
        "Symbols are invisible to `for...in`, `Object.keys()`, and `JSON.stringify` — use `Object.getOwnPropertySymbols()`",
        "`Symbol()` vs `Symbol.for()` — `Symbol()` always creates a new one; `Symbol.for()` uses a global registry",
        "Can't convert Symbol to a string implicitly — `'' + symbol` throws TypeError; use `symbol.toString()` explicitly",
        "Symbols are not truly private — they're just non-enumerable. `Object.getOwnPropertySymbols()` exposes them"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is a Symbol and what problem does it solve?", a: "Symbol creates guaranteed unique identifiers, solving property name collision. If two libraries both want to add a property called `id` to an object, they'll conflict. With `Symbol('id')`, each library gets a unique key. Also used for metadata, protocols (iteration), and hiding implementation details." },
        { type: "tricky", q: "What does `Symbol('foo') === Symbol('foo')` return?", a: "`false`. Every `Symbol()` call creates a NEW unique symbol. The string argument is just a description for debugging, not an identifier. To share symbols, use `Symbol.for('foo')` which uses a global registry." },
        { type: "coding", q: "Make a custom object iterable using `Symbol.iterator`.", a: "```js\nconst range = {\n  start: 1, end: 5,\n  [Symbol.iterator]() {\n    let i = this.start;\n    return {\n      next: () => i <= this.end\n        ? { value: i++, done: false }\n        : { done: true }\n    };\n  }\n};\nconsole.log([...range]); // [1,2,3,4,5]\n```" },
        { type: "conceptual", q: "What are Well-Known Symbols? Give examples.", a: "`Symbol.iterator` — makes objects iterable. `Symbol.toPrimitive` — custom type conversion. `Symbol.toStringTag` — custom `[object X]` tag. `Symbol.hasInstance` — custom `instanceof`. `Symbol.species` — constructor for derived objects. They let you hook into language-level operations." },
        { type: "scenario", q: "How would you use Symbols to create a plugin system?", a: "Each plugin registers under a unique Symbol key: ```js\nconst PLUGIN_INIT = Symbol.for('plugin.init');\nconst PLUGIN_DESTROY = Symbol.for('plugin.destroy');\nclass App {\n  use(plugin) {\n    if (plugin[PLUGIN_INIT]) plugin[PLUGIN_INIT](this);\n    this.plugins.push(plugin);\n  }\n}\n``` Symbol.for ensures plugins and app agree on keys without importing constants." }
      ]
    },
    {
      id: "weakmap-weakset",
      title: "WeakMap & WeakSet",
      explanation: `**WeakMap** and **WeakSet** are like Map and Set, but with weakly held references — meaning they don't prevent garbage collection of their keys.

| Feature | Map/Set | WeakMap/WeakSet |
|---------|---------|-----------------|
| Key types | Any | Objects only |
| Enumerable | Yes (iterable) | No |
| Size property | Yes | No |
| GC behavior | Prevents GC | Allows GC |

🏠 **Real-world analogy:** A WeakMap is like a sticky note on a file folder. When the folder (object) is thrown away, the sticky note (WeakMap entry) automatically disappears — no cleanup needed.`,
      codeExample: `// WeakMap — keys must be objects, auto-GC'd
const cache = new WeakMap();
function processData(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = { /* expensive computation */ processed: true };
  cache.set(obj, result);
  return result;
}
let data = { name: "Alice" };
processData(data);
data = null; // The WeakMap entry is eligible for GC!

// Private data pattern with WeakMap
const privateData = new WeakMap();
class User {
  constructor(name, password) {
    this.name = name;
    privateData.set(this, { password });
  }
  checkPassword(input) {
    return privateData.get(this).password === input;
  }
}
const user = new User("Alice", "secret");
console.log(user.checkPassword("secret")); // true
console.log(user.password);                // undefined (truly private!)

// WeakSet — track objects without preventing GC
const visited = new WeakSet();
function processNode(node) {
  if (visited.has(node)) return; // Already processed
  visited.add(node);
  // Process node...
}

// DOM element metadata
const elementData = new WeakMap();
function track(element) {
  elementData.set(element, {
    clicks: 0,
    lastClicked: null
  });
  element.addEventListener("click", () => {
    const data = elementData.get(element);
    data.clicks++;
    data.lastClicked = new Date();
  });
}
// When element is removed from DOM, data is auto-cleaned!`,
      exercise: `**Mini Exercise:**
1. Use WeakMap to cache computed values for objects
2. Implement a visited-tracker for graph traversal using WeakSet
3. Create a "mark as read" system for notifications using WeakSet
4. Build a memoizer for object-keyed functions using WeakMap`,
      commonMistakes: [
        "WeakMap/WeakSet keys MUST be objects — primitives like strings or numbers don't work",
        "WeakMaps are NOT iterable — you can't use `forEach`, `keys()`, `values()`, or `entries()`",
        "WeakMap has no `.size` property — you can't know how many entries it has",
        "You can't clear a WeakMap — there's no `.clear()` method (or it's non-standard)",
        "Thinking WeakMap entries are deleted immediately — GC timing is unpredictable"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is the difference between Map and WeakMap?", a: "**Map**: Any key type, prevents GC of keys, iterable, has `.size`. **WeakMap**: Object keys only, allows GC of keys (weak references), NOT iterable, no `.size`. Use WeakMap for object-associated metadata that should be garbage-collected with the object." },
        { type: "scenario", q: "When would you use a WeakMap over a regular Map?", a: "1) Caching data for DOM elements (auto-cleanup on removal). 2) Storing private data for class instances. 3) Metadata about objects you don't own. 4) Memoization keyed by objects. 5) Any time you associate data with objects and don't want to prevent garbage collection." },
        { type: "coding", q: "Use WeakMap to implement truly private class fields (pre-ES2022).", a: "```js\nconst _private = new WeakMap();\nclass BankAccount {\n  constructor(balance) {\n    _private.set(this, { balance });\n  }\n  deposit(amount) {\n    const data = _private.get(this);\n    data.balance += amount;\n  }\n  get balance() {\n    return _private.get(this).balance;\n  }\n}\n```" },
        { type: "tricky", q: "Why can't you iterate over a WeakMap?", a: "WeakMap entries can be garbage-collected at any time (non-deterministic). If you could iterate, the GC would need to track all references to prevent collection during iteration, defeating the purpose of weak references. The entries are 'invisible' to prevent preventing GC." },
        { type: "conceptual", q: "How do WeakRefs differ from WeakMap/WeakSet?", a: "`WeakRef` creates a weak reference to a single object that you can `deref()` to get the original (or `undefined` if GC'd). `FinalizationRegistry` runs a callback when an object is GC'd. WeakMap/WeakSet are higher-level constructs that use weak references internally for key storage." }
      ]
    },
    {
      id: "design-patterns",
      title: "Design Patterns",
      explanation: `Design patterns are proven solutions to common programming problems. They provide templates for writing maintainable, scalable, and reusable code.

**Creational:** Singleton, Factory
**Structural:** Module, Proxy, Decorator
**Behavioral:** Observer, Strategy, Pub/Sub, Command

🏠 **Real-world analogy:** Design patterns are like architectural blueprints. The "Observer" pattern is like a newspaper subscription — when news (data) changes, all subscribers (components) are automatically notified. No need to check manually.`,
      codeExample: `// Module Pattern (encapsulation)
const UserModule = (() => {
  let users = []; // Private
  return {
    add(user) { users.push(user); },
    getAll() { return [...users]; },
    findById(id) { return users.find(u => u.id === id); }
  };
})();

// Singleton Pattern
class Database {
  constructor() {
    if (Database.instance) return Database.instance;
    this.connection = "connected";
    Database.instance = this;
  }
  static getInstance() {
    if (!Database.instance) new Database();
    return Database.instance;
  }
}

// Observer Pattern (Event Emitter)
class EventEmitter {
  constructor() { this.events = {}; }
  on(event, listener) {
    (this.events[event] ||= []).push(listener);
    return () => this.off(event, listener); // Return unsubscribe
  }
  off(event, listener) {
    this.events[event] = this.events[event]?.filter(l => l !== listener);
  }
  emit(event, ...args) {
    this.events[event]?.forEach(listener => listener(...args));
  }
}

// Factory Pattern
class Shape {
  static create(type, ...args) {
    switch (type) {
      case "circle": return new Circle(...args);
      case "square": return new Square(...args);
      case "triangle": return new Triangle(...args);
      default: throw new Error(\`Unknown shape: \${type}\`);
    }
  }
}

// Strategy Pattern
class Sorter {
  constructor(strategy) { this.strategy = strategy; }
  sort(data) { return this.strategy(data); }
  setStrategy(strategy) { this.strategy = strategy; }
}
const bubbleSort = (data) => { /* ... */ return data; };
const quickSort = (data) => { /* ... */ return data; };
const sorter = new Sorter(quickSort);

// Pub/Sub Pattern
class PubSub {
  constructor() { this.topics = {}; }
  subscribe(topic, handler) {
    (this.topics[topic] ||= []).push(handler);
    return { unsubscribe: () => {
      this.topics[topic] = this.topics[topic].filter(h => h !== handler);
    }};
  }
  publish(topic, data) {
    this.topics[topic]?.forEach(handler => handler(data));
  }
}`,
      exercise: `**Mini Exercise:**
1. Implement a Pub/Sub system for a todo app (add, complete, delete events)
2. Create a Factory that produces different notification types (email, SMS, push)
3. Implement the Strategy pattern for different payment methods
4. Build an Observer pattern for a reactive state management system`,
      commonMistakes: [
        "Overusing Singletons — they create hidden global state and make testing harder",
        "Observer pattern without cleanup — forgetting to unsubscribe causes memory leaks",
        "Factory pattern overkill — don't use a factory when a simple constructor suffices",
        "Forcing patterns where they don't fit — patterns solve specific problems; don't use them just because",
        "Not considering JavaScript-specific patterns — many OOP patterns from Java/C++ have simpler JS alternatives"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "Explain the Observer pattern and where it's used in JavaScript.", a: "Observer establishes a one-to-many relationship: when an object (subject) changes state, all dependents (observers) are notified. Used in: DOM event listeners, RxJS, Redux store subscriptions, Node.js EventEmitter, Vue/React reactivity, WebSocket message handling." },
        { type: "coding", q: "Implement a simple EventEmitter class.", a: "```js\nclass EventEmitter {\n  #events = {};\n  on(event, fn) {\n    (this.#events[event] ||= []).push(fn);\n  }\n  off(event, fn) {\n    this.#events[event] = this.#events[event]?.filter(f => f !== fn);\n  }\n  emit(event, ...args) {\n    this.#events[event]?.forEach(fn => fn(...args));\n  }\n  once(event, fn) {\n    const wrapper = (...args) => { fn(...args); this.off(event, wrapper); };\n    this.on(event, wrapper);\n  }\n}\n```" },
        { type: "conceptual", q: "What is the Module pattern and why is it useful?", a: "The Module pattern uses closures (IIFE or ES modules) to create private scope, exposing only a public API. Benefits: encapsulation, namespace pollution prevention, clear public API, and testability. In modern JS, ES modules serve the same purpose with `import`/`export`." },
        { type: "scenario", q: "When would you use the Strategy pattern?", a: "When you have multiple algorithms/approaches for a task and want to swap them easily. Examples: sorting algorithms, payment processing (credit card, PayPal, crypto), authentication methods (OAuth, JWT, session), form validation rules, shipping cost calculators. It facilitates Open/Closed principle." },
        { type: "conceptual", q: "What is the Pub/Sub pattern and how does it differ from Observer?", a: "**Observer**: Direct relationship — subject knows its observers. **Pub/Sub**: Decoupled — publishers and subscribers communicate through a message broker/channel. Pub/Sub allows: multiple topics, cross-component communication, and looser coupling. Events in DOM use Observer; Redux/messaging queues use Pub/Sub." }
      ]
    },
    {
      id: "functional-programming",
      title: "Functional Programming",
      explanation: `Functional Programming (FP) is a paradigm that treats computation as evaluating mathematical functions, avoiding state mutation and side effects.

**Core Principles:**
- **Pure Functions** — Same inputs always produce same outputs; no side effects
- **Immutability** — Data is never modified; new copies are created
- **First-Class Functions** — Functions are values (passed, returned, stored)
- **Composition** — Build complex functions from simple ones
- **Declarative** — Describe WHAT, not HOW

🏠 **Real-world analogy:** FP is like a mathematical equation. \`f(x) = x + 1\` — it always returns the same result for the same input, never changes x itself, and has no hidden side effects. Imperative programming is like a recipe with mutable ingredients.`,
      codeExample: `// Pure function — no side effects, deterministic
const add = (a, b) => a + b;           // Pure ✅
// let total = 0; const addImpure = (x) => total += x; // Impure ❌

// Immutability
const original = [1, 2, 3];
const withFour = [...original, 4];       // New array, original unchanged
const user = { name: "Alice", age: 25 };
const older = { ...user, age: 26 };      // New object

// Function composition
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);

const processUser = pipe(
  (name) => name.trim(),
  (name) => name.toLowerCase(),
  (name) => \`user_\${name}\`
);
console.log(processUser("  ALICE  ")); // "user_alice"

// Functors (mappable containers)
const Maybe = (value) => ({
  map: (fn) => value == null ? Maybe(null) : Maybe(fn(value)),
  getOrElse: (defaultVal) => value ?? defaultVal,
  value
});
const result = Maybe("hello")
  .map(s => s.toUpperCase())
  .map(s => s + "!")
  .getOrElse("default");
console.log(result); // "HELLO!"

// Pipe operator equivalent
const transform = pipe(
  (arr) => arr.filter(x => x > 0),
  (arr) => arr.map(x => x * 2),
  (arr) => arr.reduce((sum, x) => sum + x, 0)
);
console.log(transform([-1, 2, 3, -4, 5])); // 20

// Immutable updates with reduce
const addItem = (list, item) => [...list, item];
const removeItem = (list, index) => list.filter((_, i) => i !== index);
const updateItem = (list, index, fn) =>
  list.map((item, i) => i === index ? fn(item) : item);`,
      exercise: `**Mini Exercise:**
1. Refactor imperative code to use pure functions and immutability
2. Build a \`pipe\` function and use it to transform data step by step
3. Implement a Maybe monad for null-safe chaining
4. Write a point-free style solution for a data transformation pipeline`,
      commonMistakes: [
        "Going 100% pure is impractical — I/O, DOM, network are inherently impure; isolate them at boundaries",
        "Excessive immutability with deep nesting — use `structuredClone` or libraries like Immer for deeply nested updates",
        "Over-composing simple operations — sometimes a loop is more readable than 5 composed functions",
        "Confusing FP concepts from Haskell/ML with JavaScript's pragmatic FP — JS is multi-paradigm",
        "Not understanding that `.map`, `.filter`, `.reduce` ARE functional programming — you're likely already using FP"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is a pure function? Why are they important?", a: "A pure function: 1) Always returns the same output for the same inputs. 2) Has no side effects (no mutation, no I/O, no external state). Important because: predictable, testable, cacheable (memoization), parallelizable, and easier to reason about. Example: `const add = (a, b) => a + b` is pure." },
        { type: "coding", q: "Implement a `pipe` function for left-to-right function composition.", a: "```js\nconst pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);\n// Usage:\nconst process = pipe(\n  x => x * 2,\n  x => x + 1,\n  x => x.toString()\n);\nconsole.log(process(5)); // '11'\n```" },
        { type: "conceptual", q: "What is immutability and how do you achieve it in JavaScript?", a: "Immutability means never modifying data after creation. Achieve with: 1) Spread operator `{...obj, key: newVal}`. 2) Array methods that return new arrays (`map`, `filter`, `concat`). 3) `Object.freeze()`. 4) Libraries like Immer or Immutable.js. 5) `structuredClone()` for deep copies." },
        { type: "tricky", q: "Is `Array.forEach` a pure functional construct?", a: "No. `forEach` returns `undefined` — it's designed for side effects. In FP, use `map` (transform), `filter` (subset), or `reduce` (accumulate) which return new values. `forEach` breaks the FP principle of expressions over statements." },
        { type: "scenario", q: "How would you structure a data processing pipeline functionally?", a: "```js\nconst processOrders = pipe(\n  filterBy('status', 'completed'),\n  mapTo(order => ({ ...order, total: calcTotal(order) })),\n  sortBy('total', 'desc'),\n  take(10),\n  mapTo(formatForDisplay)\n);\nconst result = processOrders(orders);\n``` Each step is a pure function, testable independently, and the pipeline reads like a description." }
      ]
    },
    {
      id: "memory-management",
      title: "Memory Management & Garbage Collection",
      explanation: `JavaScript automatically manages memory through **Garbage Collection (GC)**. However, understanding how it works prevents memory leaks and performance issues.

**Memory lifecycle:**
1. **Allocate** — When you create variables, objects, functions
2. **Use** — Read/write to the allocated memory
3. **Release** — GC reclaims memory no longer reachable

**GC Algorithm:** Modern engines use **Mark-and-Sweep** — starting from "roots" (global object, call stack), it marks all reachable objects and sweeps (frees) unreachable ones.

**Memory Leak** — When memory that's no longer needed is not released because a reference still exists.

🏠 **Real-world analogy:** GC is like a janitor who cleans up meeting rooms. If a room has no one in it and no one is planning to use it (no references), it gets cleaned. But if someone left their notebook (dangling reference), the janitor can't clean that room.`,
      codeExample: `// Common memory leak: forgotten event listeners
function setupHandler() {
  const largeData = new Array(1000000).fill("x");
  document.addEventListener("click", () => {
    console.log(largeData.length); // largeData stuck in memory!
  });
}
// Fix: clean up listeners
function setupHandlerFixed() {
  const largeData = new Array(1000000).fill("x");
  const handler = () => console.log(largeData.length);
  document.addEventListener("click", handler);
  return () => document.removeEventListener("click", handler);
}
const cleanup = setupHandlerFixed();
// Later: cleanup();

// Memory leak: closures retaining large scopes
function processData() {
  const hugeArray = new Array(1000000).fill("data");
  const processed = hugeArray.map(x => x.toUpperCase());
  return function getStats() {
    return processed.length; // Only needs length, but retains entire 'processed'
  };
}
// Fix: capture only what you need
function processDataFixed() {
  const hugeArray = new Array(1000000).fill("data");
  const length = hugeArray.length; // Capture just the length
  return function getStats() {
    return length; // hugeArray can be GC'd
  };
}

// Memory leak: forgotten timers
function startPolling() {
  const data = loadLargeData();
  setInterval(() => {
    console.log(data);
  }, 5000); // Never cleared! data stuck in memory
}

// WeakRef for cache that allows GC
let cache = new WeakRef(createExpensiveObject());
function getCached() {
  let obj = cache.deref();
  if (!obj) {
    obj = createExpensiveObject();
    cache = new WeakRef(obj);
  }
  return obj;
}`,
      exercise: `**Mini Exercise:**
1. Identify and fix memory leaks in a given code snippet
2. Use Chrome DevTools to take a heap snapshot and find retained objects
3. Write a component with proper cleanup of event listeners and timers
4. Implement a cache with WeakRef that allows garbage collection`,
      commonMistakes: [
        "Not removing event listeners when they're no longer needed — especially in SPAs that don't fully reload",
        "Storing large data in closures unnecessarily — capture only what you need",
        "Forgotten setInterval/setTimeout without cleanup — always store and clear IDs",
        "Accumulating data in global arrays/objects without bounds — caches grow indefinitely",
        "Circular references between closures can prevent GC in older engines (IE) — modern engines handle this"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "How does garbage collection work in JavaScript?", a: "Modern JS engines use **Mark-and-Sweep**: 1) Start from 'roots' (global scope, active function scopes). 2) Mark all objects reachable from roots. 3) Sweep (free) all unmarked objects. Most engines also use **generational GC** — new objects (short-lived) are checked more frequently than old ones." },
        { type: "conceptual", q: "What are common causes of memory leaks in JavaScript?", a: "1) Forgotten event listeners. 2) Uncleaned timers (setInterval). 3) Closures retaining large outer scopes. 4) Detached DOM nodes (removed from DOM but referenced in JS). 5) Global variables. 6) Unbounded caches/arrays. 7) Circular references in certain contexts." },
        { type: "coding", q: "Write a component class that properly cleans up all resources.", a: "```js\nclass Widget {\n  constructor(el) {\n    this.el = el;\n    this.data = [];\n    this._onClick = this.handleClick.bind(this);\n    this._interval = setInterval(() => this.update(), 5000);\n    this.el.addEventListener('click', this._onClick);\n  }\n  destroy() {\n    clearInterval(this._interval);\n    this.el.removeEventListener('click', this._onClick);\n    this.data = null;\n    this.el = null;\n  }\n}\n```" },
        { type: "tricky", q: "Can circular references cause memory leaks in modern JavaScript?", a: "In modern engines: No. Mark-and-Sweep handles circular references — if neither object is reachable from a root, both are collected. In older IE (reference counting GC): Yes — circular references between JS objects and DOM elements caused leaks. This is no longer an issue." },
        { type: "scenario", q: "How would you debug a memory leak in a web application?", a: "1) Chrome DevTools → Performance tab → record and look for increasing memory. 2) Memory tab → take Heap Snapshots, compare over time. 3) Look for 'Detached DOM tree' in heap. 4) Use Allocation Timeline to see what's being allocated. 5) Check for common patterns: event listeners, timers, closures, global state." }
      ]
    },
    {
      id: "security",
      title: "Security (XSS, CSRF, CSP)",
      explanation: `Web security is critical for protecting users and data. Key threats:

**XSS (Cross-Site Scripting)** — Attacker injects malicious scripts into your page. Types: Stored, Reflected, DOM-based.
**CSRF (Cross-Site Request Forgery)** — Attacker tricks user's browser into making unwanted requests to a site where they're authenticated.
**CSP (Content Security Policy)** — HTTP header that controls which resources the browser is allowed to load.

🏠 **Real-world analogy:** **XSS** is like someone slipping a fake page into a library book — the next reader follows the fake instructions. **CSRF** is like someone forging your signature on a bank check. **CSP** is like a security guard with a guest list — only approved resources get in.`,
      codeExample: `// XSS Prevention
// ❌ BAD — Vulnerable!
const userInput = '<img src=x onerror=alert("hacked")>';
element.innerHTML = userInput; // Script executes!

// ✅ GOOD — Use textContent (no HTML parsing)
element.textContent = userInput; // Safe — displays as text

// ✅ GOOD — Sanitize HTML
function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML; // Entities are escaped
}

// CSRF Prevention — Include token with requests
async function submitForm(data) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken  // Server validates this
    },
    body: JSON.stringify(data),
    credentials: "same-origin"
  });
}

// CSP — Set via HTTP header or meta tag
// Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com;
// <meta http-equiv="Content-Security-Policy" content="default-src 'self'">

// Input validation
function validateInput(input) {
  const clean = input.replace(/[<>'"]/g, ""); // Strip dangerous chars
  if (clean.length > 1000) throw new Error("Input too long");
  return clean;
}

// Secure cookie settings
// Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict; Path=/

// Subresource Integrity (SRI) for CDN scripts
// <script src="https://cdn.example.com/lib.js"
//   integrity="sha384-..." crossorigin="anonymous"></script>`,
      exercise: `**Mini Exercise:**
1. Identify and fix XSS vulnerabilities in a given HTML/JS snippet
2. Implement CSRF token validation in a form submission
3. Write a Content Security Policy header for a web application
4. Build an input sanitizer that prevents common injection attacks`,
      commonMistakes: [
        "Using `innerHTML` with user input — always use `textContent` or a sanitizer library (DOMPurify)",
        "Storing auth tokens in localStorage — XSS can steal them. Use HttpOnly cookies instead",
        "Not using SameSite on cookies — leaves you vulnerable to CSRF",
        "Trusting client-side validation only — always validate on the server too",
        "Using `eval()`, `new Function()`, or `innerHTML` with untrusted data"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is XSS and how do you prevent it?", a: "XSS injects malicious scripts into web pages. Types: **Stored** (saved in DB), **Reflected** (in URL params), **DOM-based** (client-side manipulation). Prevent with: 1) Escape/sanitize all user input. 2) Use `textContent` instead of `innerHTML`. 3) CSP headers. 4) HttpOnly cookies. 5) DOMPurify library for HTML." },
        { type: "conceptual", q: "What is CSRF and how do you prevent it?", a: "CSRF tricks authenticated users into making unwanted requests. Attacker creates a form/request that auto-submits to your site using the user's cookies. Prevent with: 1) CSRF tokens (unique per session/request). 2) `SameSite` cookie attribute. 3) Check `Origin`/`Referer` headers. 4) Re-authenticate for sensitive actions." },
        { type: "coding", q: "Write a function to escape HTML characters to prevent XSS.", a: "```js\nfunction escapeHTML(str) {\n  const map = {\n    '&': '&amp;', '<': '&lt;', '>': '&gt;',\n    '\"': '&quot;', \"'\": '&#39;'\n  };\n  return str.replace(/[&<>\"']/g, c => map[c]);\n}\n```" },
        { type: "conceptual", q: "What is Content Security Policy (CSP)?", a: "CSP is an HTTP header that tells the browser which resources are allowed to load/execute. Example: `script-src 'self'` only allows scripts from the same origin, blocking injected inline scripts. Directives: `default-src`, `script-src`, `style-src`, `img-src`, `connect-src`, `frame-src`. Effective XSS mitigation." },
        { type: "scenario", q: "An audit reveals your app is vulnerable to XSS. What steps do you take to fix it?", a: "1) Audit all uses of `innerHTML`, `document.write`, `eval()`. 2) Replace with `textContent` or sanitized output (DOMPurify). 3) Add CSP header blocking inline scripts. 4) Move auth tokens to HttpOnly cookies. 5) Add input validation/sanitization on both client and server. 6) Enable Subresource Integrity for CDN scripts. 7) Add automated XSS scanning to CI/CD." }
      ]
    }
  ]
};

export default phase4;
