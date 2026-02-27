const phase2b = [
  {
    id: "regular-expressions",
    title: "Regular Expressions",
    explanation: `Regular expressions (regex) are patterns used to match character combinations in strings. They can look intimidating but are incredibly powerful for validation, search, and text processing.

**Creating:** \`/pattern/flags\` or \`new RegExp("pattern", "flags")\`
**Flags:** \`g\` (global), \`i\` (case-insensitive), \`m\` (multiline), \`s\` (dotAll), \`u\` (unicode)
**Key methods:** \`test()\`, \`match()\`, \`matchAll()\`, \`replace()\`, \`search()\`, \`split()\`

🏠 **Real-world analogy:** Regex is like a metal detector with adjustable sensitivity — you define the pattern (metal type), and it scans text to find all matches.`,
    codeExample: `// Basic patterns
const emailRegex = /^[\\w.-]+@[\\w.-]+\\.\\w{2,}$/i;
console.log(emailRegex.test("user@example.com")); // true

// Common patterns
const phoneRegex = /^\\+?\\d{1,3}[-.\\s]?\\d{3,4}[-.\\s]?\\d{4}$/;
const urlRegex = /^https?:\\/\\/[\\w.-]+\\.[a-z]{2,}/i;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;

// Methods
const str = "Hello World hello world";
console.log(str.match(/hello/gi));        // ["Hello", "hello"]
console.log(str.replace(/world/gi, "JS")); // "Hello JS hello JS"
console.log(str.search(/world/i));         // 6

// Groups and captures
const date = "2024-01-15";
const [, year, month, day] = date.match(/(\\d{4})-(\\d{2})-(\\d{2})/);
console.log({ year, month, day });

// Named groups
const dateMatch = date.match(/(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/);
console.log(dateMatch.groups); // { year: "2024", month: "01", day: "15" }

// Lookahead and lookbehind
const prices = "Item: $100, Tax: $15, Total: $115";
const amounts = prices.match(/(?<=\\$)\\d+/g); // ["100", "15", "115"]`,
    exercise: `**Mini Exercise:**
1. Write a regex to validate email addresses
2. Write a regex to extract all hashtags from a tweet
3. Create a function that converts camelCase to kebab-case
4. Write a password strength validator using regex`,
    commonMistakes: [
      "Forgetting to escape special characters: `.` matches ANY character, use `\\.` for a literal dot",
      "Using greedy quantifiers (`.*`) when lazy (`.*?`) is needed — greedy matches too much",
      "Not using the `g` flag when you need all matches, not just the first",
      "Forgetting that `^` and `$` match start/end of string, not line (unless `m` flag is used)",
      "Complex regex is hard to maintain — consider splitting into multiple simpler checks or use named groups"
    ],
    interviewQuestions: [
      { type: "coding", q: "Write a regex to validate a strong password (8+ chars, upper, lower, number, special).", a: "```js\nconst strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$/;\n```\nUses positive lookaheads `(?=...)` to check each requirement without consuming characters." },
      { type: "conceptual", q: "What is the difference between `match()` and `matchAll()`?", a: "`match()` with `g` flag returns an array of matches (no groups). Without `g`, returns first match with groups. `matchAll()` returns an iterator of ALL matches, each with full group info. Always requires the `g` flag." },
      { type: "tricky", q: "What does `/^$/.test('')` return?", a: "`true`. `^` matches the start and `$` matches the end. An empty string has a start immediately followed by an end, so the pattern matches." },
      { type: "coding", q: "Write a function to extract all URLs from a text string.", a: "```js\nfunction extractURLs(text) {\n  const regex = /https?:\\/\\/[^\\s]+/gi;\n  return text.match(regex) || [];\n}\n```" },
      { type: "scenario", q: "When should you avoid using regex?", a: "Avoid regex for: 1) Parsing HTML/XML (use a DOM parser), 2) Very complex validations (use a dedicated library), 3) When string methods like `includes`, `startsWith`, `split` suffice, 4) When readability matters more than cleverness. Regex is best for pattern matching, not structural parsing." }
    ]
  },
  {
    id: "local-session-storage-cookies",
    title: "LocalStorage, SessionStorage & Cookies",
    explanation: `The Web Storage API provides mechanisms to store data in the browser. Each has different characteristics:

| Feature | LocalStorage | SessionStorage | Cookies |
|---------|-------------|----------------|---------|
| Capacity | ~5-10 MB | ~5 MB | ~4 KB |
| Expiry | Never (persists) | Tab close | Configurable |
| Sent to server | No | No | Yes (every request!) |
| Scope | Origin-wide | Tab-specific | Path-configurable |

🏠 **Real-world analogy:** **LocalStorage** is like a permanent locker — your stuff stays until you empty it. **SessionStorage** is a day locker — cleared when you leave. **Cookies** are like a visitor badge — shown at every checkpoint.`,
    codeExample: `// LocalStorage — persists across sessions
localStorage.setItem("theme", "dark");
localStorage.setItem("user", JSON.stringify({ name: "Alice", age: 25 }));
const theme = localStorage.getItem("theme");   // "dark"
const user = JSON.parse(localStorage.getItem("user"));
localStorage.removeItem("theme");
localStorage.clear(); // Remove everything

// SessionStorage — same API, cleared on tab close
sessionStorage.setItem("tempData", "hello");

// Cookies — more complex
document.cookie = "username=Alice; max-age=86400; path=/; SameSite=Strict";
document.cookie = "theme=dark; expires=Fri, 31 Dec 2025 23:59:59 GMT";

// Reading cookies (returns all as one string)
console.log(document.cookie); // "username=Alice; theme=dark"

// Helper function to get specific cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Delete cookie (set expired date)
document.cookie = "username=; max-age=0";

// Storage event — listen for changes in OTHER tabs
window.addEventListener("storage", (e) => {
  console.log(\`Key: \${e.key}, Old: \${e.oldValue}, New: \${e.newValue}\`);
});`,
    exercise: `**Mini Exercise:**
1. Build a theme toggle that persists across page reloads using localStorage
2. Create a shopping cart that saves items to localStorage
3. Implement a "Remember me" login using cookies with proper expiry
4. Build a form that auto-saves draft content to sessionStorage`,
    commonMistakes: [
      "Storing sensitive data (passwords, tokens) in localStorage — it's accessible by any script on the page (XSS risk)",
      "Forgetting to `JSON.stringify()` objects before storing and `JSON.parse()` when retrieving",
      "Not handling the case when `getItem()` returns `null` — `JSON.parse(null)` returns `null`, not an error",
      "Setting cookies without `Secure`, `HttpOnly`, and `SameSite` flags — security vulnerability",
      "Exceeding storage limits without error handling — use try/catch around `setItem`"
    ],
    interviewQuestions: [
      { type: "conceptual", q: "What are the differences between localStorage, sessionStorage, and cookies?", a: "**localStorage**: ~5MB, persists forever, not sent to server, same-origin. **sessionStorage**: ~5MB, cleared on tab close, not sent to server, tab-specific. **Cookies**: ~4KB, configurable expiry, sent with EVERY HTTP request, can be path-scoped, accessible from server." },
      { type: "conceptual", q: "Why shouldn't you store sensitive data in localStorage?", a: "localStorage is accessible by ANY JavaScript running on the same origin. If an attacker injects a script (XSS attack), they can read ALL localStorage data. Sensitive data (auth tokens, personal info) should use HttpOnly cookies (inaccessible to JS) or server-side sessions." },
      { type: "coding", q: "Write a utility class for localStorage with expiry support.", a: "```js\nclass StorageWithExpiry {\n  set(key, value, ttlMs) {\n    const item = { value, expiry: Date.now() + ttlMs };\n    localStorage.setItem(key, JSON.stringify(item));\n  }\n  get(key) {\n    const raw = localStorage.getItem(key);\n    if (!raw) return null;\n    const item = JSON.parse(raw);\n    if (Date.now() > item.expiry) {\n      localStorage.removeItem(key);\n      return null;\n    }\n    return item.value;\n  }\n}\n```" },
      { type: "tricky", q: "Does the `storage` event fire in the same tab that modified localStorage?", a: "NO. The `storage` event only fires in OTHER tabs/windows of the same origin. It's designed for cross-tab communication. To detect changes in the same tab, you'd need to create a custom event system or wrapper around `setItem`." },
      { type: "scenario", q: "How would you implement cross-tab communication using localStorage?", a: "Use the `storage` event: Tab A calls `localStorage.setItem('msg', data)`, and Tab B listens with `window.addEventListener('storage', handler)`. The handler fires with the key, old value, and new value. For more robust pub/sub, use `BroadcastChannel` API instead." }
    ]
  },
  {
    id: "json",
    title: "JSON (parse, stringify)",
    explanation: `**JSON** (JavaScript Object Notation) is a lightweight data format for storing and transferring data. It's the lingua franca of web APIs.

**\`JSON.stringify(value, replacer, space)\`** — Converts a JS value to a JSON string
**\`JSON.parse(text, reviver)\`** — Parses a JSON string back to a JS value

JSON supports: strings, numbers, booleans, null, objects, arrays
JSON does NOT support: functions, undefined, Symbol, BigInt, Date (serialized as string), Map, Set, RegExp

🏠 **Real-world analogy:** JSON is like a packing list. You write down your items (stringify) to ship them. The receiver reads the list (parse) and reconstructs the items.`,
    codeExample: `// Basic usage
const user = { name: "Alice", age: 25, hobbies: ["coding", "reading"] };
const json = JSON.stringify(user);
// '{"name":"Alice","age":25,"hobbies":["coding","reading"]}'
const parsed = JSON.parse(json);

// Pretty printing
console.log(JSON.stringify(user, null, 2));

// Replacer function — filter/transform values
const filtered = JSON.stringify(user, (key, value) => {
  if (key === "age") return undefined; // Exclude age
  return value;
});
// '{"name":"Alice","hobbies":["coding","reading"]}'

// Replacer array — whitelist keys
const partial = JSON.stringify(user, ["name", "age"]);
// '{"name":"Alice","age":25}'

// Reviver function — transform during parsing
const jsonWithDate = '{"name":"Alice","joined":"2024-01-15T10:30:00.000Z"}';
const parsed2 = JSON.parse(jsonWithDate, (key, value) => {
  if (key === "joined") return new Date(value);
  return value;
});
console.log(parsed2.joined instanceof Date); // true

// toJSON method — custom serialization
class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
  }
  toJSON() {
    return { name: this.name }; // Exclude password!
  }
}
console.log(JSON.stringify(new User("Alice", "secret")));
// '{"name":"Alice"}'

// Deep clone trick (simple cases only)
const deepCopy = JSON.parse(JSON.stringify(user));`,
    exercise: `**Mini Exercise:**
1. Write a safe JSON parse function with error handling
2. Implement a replacer that redacts sensitive fields (password, ssn, etc.)
3. Write a reviver that converts ISO date strings back to Date objects
4. Compare JSON deep clone vs structuredClone — test edge cases`,
    commonMistakes: [
      "`JSON.stringify` ignores `undefined`, functions, and Symbols — they disappear from the output",
      "`JSON.parse(JSON.stringify(obj))` loses Date objects (become strings), undefined values, and functions",
      "Not wrapping `JSON.parse` in try/catch — invalid JSON throws SyntaxError",
      "`JSON.stringify` can't handle circular references — throws TypeError",
      "JSON keys MUST be double-quoted strings — single quotes or unquoted keys are invalid JSON"
    ],
    interviewQuestions: [
      { type: "tricky", q: "What will `JSON.stringify({ a: undefined, b: function(){}, c: Symbol() })` return?", a: "`'{}'`. All three values (`undefined`, functions, Symbols) are omitted by `JSON.stringify`. If they're in an array, they become `null` instead: `JSON.stringify([undefined])` → `'[null]'`." },
      { type: "conceptual", q: "What are the limitations of using `JSON.parse(JSON.stringify(obj))` for deep cloning?", a: "It loses: `undefined` (omitted), functions, Symbols, Dates (become strings), RegExp (become `{}`), Map/Set (become `{}`), `Infinity`/`NaN` (become `null`), circular references (throws error). Use `structuredClone(obj)` for a proper deep clone." },
      { type: "coding", q: "Write a function that safely parses JSON with a fallback value.", a: "```js\nfunction safeParse(json, fallback = null) {\n  try {\n    return JSON.parse(json);\n  } catch {\n    return fallback;\n  }\n}\n```" },
      { type: "conceptual", q: "What is `toJSON()` and when is it useful?", a: "`toJSON()` is a method you define on an object to customize its JSON serialization. When `JSON.stringify` encounters an object with `toJSON()`, it calls that method and serializes the return value instead. Useful for: excluding sensitive data, formatting dates, simplifying complex objects." },
      { type: "scenario", q: "How would you handle circular references in JSON serialization?", a: "Use a replacer function with a WeakSet: ```js\nfunction safeStringify(obj) {\n  const seen = new WeakSet();\n  return JSON.stringify(obj, (key, value) => {\n    if (typeof value === 'object' && value !== null) {\n      if (seen.has(value)) return '[Circular]';\n      seen.add(value);\n    }\n    return value;\n  });\n}\n```" }
    ]
  },
  {
    id: "date-time",
    title: "Date & Time Handling",
    explanation: `JavaScript's \`Date\` object handles dates and times. While functional, it has many quirks and limitations — which is why libraries like \`date-fns\` and \`Temporal\` (upcoming API) exist.

**Creating dates:**
- \`new Date()\` — current date/time
- \`new Date("2024-01-15")\` — from ISO string
- \`new Date(2024, 0, 15)\` — from parts (months are 0-indexed!)

**Key gotcha:** Months are 0-indexed! January = 0, December = 11.

🏠 **Real-world analogy:** JavaScript's Date is like an old analog watch — it tells time, but setting it is fiddly, time zones are a nightmare, and you often wish you had a modern digital watch (Temporal API).`,
    codeExample: `// Creating dates
const now = new Date();
const specific = new Date("2024-06-15T10:30:00");
const fromParts = new Date(2024, 5, 15); // June 15! (month is 0-indexed)
const fromTimestamp = new Date(1718438400000);

// Getters
console.log(now.getFullYear());  // 2024
console.log(now.getMonth());     // 0-11 ⚠️
console.log(now.getDate());      // 1-31
console.log(now.getDay());       // 0-6 (0 = Sunday)
console.log(now.getHours());
console.log(now.getTime());      // Milliseconds since epoch

// Formatting
console.log(now.toLocaleDateString("en-US")); // "1/15/2024"
console.log(now.toISOString());               // "2024-01-15T..."
console.log(now.toLocaleString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
})); // "Monday, January 15, 2024"

// Intl.DateTimeFormat
const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full", timeStyle: "short"
});
console.log(formatter.format(now));

// Date arithmetic
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);

// Difference between dates
const start = new Date("2024-01-01");
const end = new Date("2024-12-31");
const diffMs = end - start;
const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

// Relative time formatting
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
console.log(rtf.format(-1, "day"));   // "yesterday"
console.log(rtf.format(2, "hour"));   // "in 2 hours"`,
    exercise: `**Mini Exercise:**
1. Write a function that calculates age from a birthdate
2. Create a countdown timer to a future date
3. Write a function that returns "X minutes/hours/days ago" from a timestamp
4. Build a simple calendar for the current month`,
    commonMistakes: [
      "Months are 0-indexed: `new Date(2024, 1, 1)` is February 1st, NOT January!",
      "`new Date('2024-01-15')` may be interpreted as UTC, while `new Date('01/15/2024')` is local time",
      "Date objects are mutable — `setDate()` modifies the original! Clone first: `new Date(original)`",
      "Using string concatenation for formatting instead of `Intl.DateTimeFormat` or `toLocaleString`",
      "Not accounting for daylight saving time when doing date arithmetic"
    ],
    interviewQuestions: [
      { type: "tricky", q: "What does `new Date(2024, 0, 32)` return?", a: "February 1, 2024. JavaScript automatically rolls over overflow values. January has 31 days, so day 32 becomes February 1. Similarly, `new Date(2024, 12, 1)` gives January 1, 2025 (month 12 overflows)." },
      { type: "conceptual", q: "Why are months 0-indexed in JavaScript's Date?", a: "It's inherited from Java's `java.util.Date` (which JavaScript's Date was modeled after). Jan=0, Dec=11. This is widely considered a design mistake and is one reason the Temporal API was created." },
      { type: "coding", q: "Write a function that returns a human-readable 'time ago' string.", a: "```js\nfunction timeAgo(date) {\n  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);\n  const intervals = [\n    [31536000, 'year'], [2592000, 'month'],\n    [86400, 'day'], [3600, 'hour'], [60, 'minute']\n  ];\n  for (const [secs, label] of intervals) {\n    const count = Math.floor(seconds / secs);\n    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;\n  }\n  return 'just now';\n}\n```" },
      { type: "conceptual", q: "What is the Temporal API and why is it being developed?", a: "Temporal is a proposed replacement for Date that fixes its problems: immutable by default, proper time zone support, separate types for dates, times, and date-times, 1-indexed months, no ambiguous parsing, and nanosecond precision. It's at Stage 3 in TC39." },
      { type: "scenario", q: "How would you handle dates across different time zones in a web app?", a: "1) Store all dates as UTC in the database. 2) Send ISO strings in API responses. 3) Convert to user's local time zone ONLY for display. 4) Use `Intl.DateTimeFormat` with `timeZone` option. 5) For complex cases, use a library like `date-fns-tz` or the upcoming Temporal API." }
    ]
  },
  {
    id: "modules",
    title: "Modules (ES Modules & CommonJS)",
    explanation: `Modules let you split code into separate files, each with its own scope. They prevent global namespace pollution and make code reusable, maintainable, and testable.

**ES Modules (ESM)** — The modern standard. Uses \`import\`/\`export\`. Static (analyzed at compile time). Supported in browsers and Node.js.
**CommonJS (CJS)** — Node.js's original module system. Uses \`require()\`/\`module.exports\`. Dynamic (evaluated at runtime).

🏠 **Real-world analogy:** Modules are like departments in a company. Each department (file) has its own resources and can share specific services (exports) with other departments (imports).`,
    codeExample: `// ===== ES Modules (ESM) =====

// math.js — Named exports
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }

// user.js — Default export
export default class User {
  constructor(name) { this.name = name; }
}

// app.js — Importing
import User from "./user.js";                    // Default import
import { add, multiply } from "./math.js";       // Named imports
import { add as sum } from "./math.js";           // Renamed import
import * as MathUtils from "./math.js";           // Namespace import

// Re-exporting
export { add, multiply } from "./math.js";
export { default as User } from "./user.js";

// Dynamic import (code splitting)
async function loadChart() {
  const { Chart } = await import("./chart.js");
  return new Chart();
}

// ===== CommonJS (CJS) =====

// math.js
// module.exports = { add, multiply };
// or
// exports.add = (a, b) => a + b;

// app.js
// const { add, multiply } = require("./math");
// const math = require("./math");`,
    exercise: `**Mini Exercise:**
1. Create a utility module with 5+ exported functions
2. Create a module with both named and default exports
3. Use dynamic \`import()\` to lazy-load a module on button click
4. Convert a CommonJS module to ES Module syntax`,
    commonMistakes: [
      "Mixing ESM and CJS in the same file — they are incompatible syntax",
      "Forgetting to add `type: 'module'` in package.json or use `.mjs` extension for ESM in Node.js",
      "Circular imports causing `undefined` values — restructure code to avoid circular dependencies",
      "Using `require()` in browser without a bundler — browsers only support `import`/`export`",
      "Not knowing that `import` statements are hoisted and run before any code in the file"
    ],
    interviewQuestions: [
      { type: "conceptual", q: "What is the difference between ES Modules and CommonJS?", a: "**ESM**: `import`/`export`, static (analyzed before execution, enables tree-shaking), async loading in browsers, strict mode by default. **CJS**: `require`/`module.exports`, dynamic (evaluated at runtime), synchronous only, works in Node.js. ESM is the modern standard; CJS is legacy Node.js." },
      { type: "conceptual", q: "What is tree-shaking and how do modules enable it?", a: "Tree-shaking removes unused exports from the final bundle. It's possible because ESM imports are STATIC — the bundler knows at build time exactly which exports are used. CJS's dynamic `require()` can't be tree-shaken because imports depend on runtime values." },
      { type: "tricky", q: "What happens if two modules import each other (circular dependency)?", a: "In ESM, the module that's imported second gets the partially-executed version (bindings may be `undefined` at first, but update later since ESM exports are live bindings). In CJS, you get whatever `module.exports` was at the point the cycle was detected — often incomplete. Best practice: avoid circular imports." },
      { type: "coding", q: "Write a module that exports a singleton database connection.", a: "```js\n// db.js\nclass Database {\n  constructor() {\n    if (Database.instance) return Database.instance;\n    this.connection = 'connected';\n    Database.instance = this;\n  }\n}\nexport default new Database();\n// Every import gets the same instance\n```" },
      { type: "scenario", q: "When would you use dynamic `import()` instead of static `import`?", a: "1) Code splitting — load heavy modules only when needed. 2) Conditional imports — load polyfills only for older browsers. 3) Lazy loading routes in SPAs. 4) Loading modules based on user actions (e.g., chart library on 'Show Graph' click). 5) When the module path is computed dynamically." }
    ]
  },
  {
    id: "iterators-generators",
    title: "Iterators & Generators",
    explanation: `**Iterators** are objects that define a sequence of values and a return value upon completion. Any object with a \`next()\` method that returns \`{ value, done }\` is an iterator.

**Generators** are special functions that can pause and resume execution. Declared with \`function*\` and use \`yield\` to produce values lazily.

**The Iteration Protocol:** An object is **iterable** if it has a \`[Symbol.iterator]()\` method that returns an iterator. Arrays, strings, Maps, Sets are all iterable.

🏠 **Real-world analogy:** A generator is like a bookmark in a book. You can read a few pages (yield values), close the book, come back later, and continue exactly where you left off.`,
    codeExample: `// Custom iterator
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true };
      }
    };
  }
};
for (const n of range) console.log(n); // 1, 2, 3, 4, 5

// Generator function
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}
const gen = numberGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Infinite generator
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
// Take first 10 fibonacci numbers
function take(gen, n) {
  const result = [];
  for (const val of gen) {
    result.push(val);
    if (result.length >= n) break;
  }
  return result;
}
console.log(take(fibonacci(), 10));

// Generator with input (two-way communication)
function* conversation() {
  const name = yield "What is your name?";
  const age = yield \`Hello \${name}! How old are you?\`;
  return \`\${name} is \${age} years old.\`;
}
const chat = conversation();
console.log(chat.next());           // { value: "What is your name?", done: false }
console.log(chat.next("Alice"));    // { value: "Hello Alice!...", done: false }
console.log(chat.next(25));         // { value: "Alice is 25...", done: true }

// Delegating generators
function* inner() { yield "a"; yield "b"; }
function* outer() { yield 1; yield* inner(); yield 2; }
console.log([...outer()]); // [1, "a", "b", 2]`,
    exercise: `**Mini Exercise:**
1. Create a generator that yields an infinite sequence of unique IDs
2. Implement a custom iterable \`Range\` class
3. Write a generator-based \`take(n)\` and \`filter(fn)\` for lazy evaluation
4. Use a generator to flatten a deeply nested array`,
    commonMistakes: [
      "Forgetting the `*` in `function*` — without it, `yield` is a syntax error",
      "Calling a generator function returns an iterator, NOT the result — you must call `next()` or use `for...of`",
      "Not understanding that `for...of` ignores the `return` value of a generator (only `yield` values)",
      "Creating infinite generators without a termination condition in the consumer — infinite loop!",
      "Confusing `yield` (pauses and returns) with `return` (ends the generator)"
    ],
    interviewQuestions: [
      { type: "conceptual", q: "What is the difference between an iterator and an iterable?", a: "An **iterable** is an object with a `[Symbol.iterator]()` method (e.g., arrays, strings). An **iterator** is the object returned by that method, with a `next()` method that returns `{ value, done }`. All iterables can produce iterators, but not all iterators are iterable." },
      { type: "conceptual", q: "What are generator functions and how do they differ from regular functions?", a: "Generators (`function*`) can pause execution with `yield` and resume later with `next()`. They return an iterator object. Unlike regular functions that run to completion, generators are lazy — they compute values on demand. They maintain their internal state between calls." },
      { type: "coding", q: "Write a generator that yields chunks of an array of a given size.", a: "```js\nfunction* chunks(arr, size) {\n  for (let i = 0; i < arr.length; i += size) {\n    yield arr.slice(i, i + size);\n  }\n}\nconsole.log([...chunks([1,2,3,4,5], 2)]);\n// [[1,2], [3,4], [5]]\n```" },
      { type: "tricky", q: "What does `yield*` do?", a: "`yield*` delegates to another generator or iterable. Instead of yielding the entire iterable as one value, it yields each value individually. `function* foo() { yield* [1,2,3]; }` is equivalent to yielding 1, then 2, then 3 separately. It also forwards `return` values from delegated generators." },
      { type: "scenario", q: "What are practical use cases for generators?", a: "1) Lazy evaluation of large/infinite sequences (fibonacci, paginated data). 2) Implementing custom iterables. 3) Async flow control (before async/await existed). 4) State machines. 5) Streaming/piping data processing. 6) Unique ID generation. 7) Tree/graph traversal with pausing." }
    ]
  }
];

export default phase2b;
