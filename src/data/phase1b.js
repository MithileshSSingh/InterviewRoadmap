const phase1b = [
  {
    id: "functions",
    title: "Functions",
    explanation: `Functions are reusable blocks of code that perform a specific task. They are the backbone of JavaScript.

**Function Declaration** — Hoisted, can be called before definition. Uses the \`function\` keyword.
**Function Expression** — Stored in a variable. NOT hoisted.
**Arrow Functions** — Concise syntax (\`=>\`). No own \`this\`, \`arguments\`, or \`super\`. Cannot be used as constructors.

Functions are **first-class citizens** in JS — they can be assigned to variables, passed as arguments, and returned from other functions.

**Parameters vs Arguments:** Parameters are in the definition, arguments are what you pass in.

🏠 **Real-world analogy:** A function is like a vending machine — you put in inputs (coins), it does its job internally, and gives you an output (snack). You don't need to know the internal mechanics.`,
    codeExample: `// Function Declaration (hoisted)
console.log(greet("Alice")); // Works! Declarations are hoisted
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Function Expression (NOT hoisted)
// console.log(add(2, 3)); // ❌ ReferenceError
const add = function(a, b) {
  return a + b;
};

// Arrow Functions
const multiply = (a, b) => a * b;          // Implicit return
const square = x => x * x;                  // Single param, no parens needed
const getUser = () => ({ name: "Alice" });  // Return object: wrap in ()

// Default parameters
function createUser(name, role = "user", active = true) {
  return { name, role, active };
}
console.log(createUser("Bob")); // { name: "Bob", role: "user", active: true }

// Rest parameters
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// Functions as first-class citizens
const operations = { add, multiply, square };
const apply = (fn, ...args) => fn(...args);
console.log(apply(add, 5, 3)); // 8

// IIFE (Immediately Invoked Function Expression)
(function() {
  const secret = "hidden";
  console.log(secret); // "hidden"
})();
// console.log(secret); // ❌ ReferenceError`,
    exercise: `**Mini Exercise:**
1. Write a function that takes any number of arguments and returns the largest
2. Convert a regular function to an arrow function and vice versa
3. Write a function \`compose\` that takes two functions and returns their composition
4. Write a function that returns a function (closure preview!)`,
    commonMistakes: [
      "Forgetting that arrow functions don't have their own `this` — they inherit from the enclosing scope",
      "Trying to return an object from an arrow function without wrapping in parentheses: `() => { name: 'a' }` returns `undefined`!",
      "Using `arguments` object in arrow functions — it doesn't exist; use rest parameters instead",
      "Not understanding that function expressions are NOT hoisted, while declarations ARE",
      "Overusing arrow functions — don't use them for object methods or when you need `this`"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is the difference between function declarations and function expressions?",
        a: "Declarations are hoisted (can be called before they appear in code) and are named. Expressions are NOT hoisted and can be anonymous or named. Arrow functions are a type of expression. Declarations use the `function` keyword as the first word; expressions are assigned to variables."
      },
      {
        type: "tricky",
        q: "What will this output?\n```js\nvar a = 1;\nfunction b() {\n  a = 10;\n  return;\n  function a() {}\n}\nb();\nconsole.log(a);\n```",
        a: "`1`. Inside `b()`, `function a()` is hoisted, creating a LOCAL `a`. The `a = 10` modifies the local `a`, not the global one. The global `a` remains `1`."
      },
      {
        type: "conceptual",
        q: "Why can't arrow functions be used as constructors?",
        a: "Arrow functions don't have a `[[Construct]]` internal method or a `prototype` property. They can't create new objects with `new`. They also don't have their own `this` — they inherit it lexically, which conflicts with how constructors need `this` to refer to the new instance."
      },
      {
        type: "coding",
        q: "Write a function `once(fn)` that ensures `fn` can only be called once. Subsequent calls return the first result.",
        a: "```js\nfunction once(fn) {\n  let called = false;\n  let result;\n  return function(...args) {\n    if (!called) {\n      called = true;\n      result = fn(...args);\n    }\n    return result;\n  };\n}\n```"
      },
      {
        type: "scenario",
        q: "When would you use a function declaration vs an arrow function vs a function expression?",
        a: "**Declaration:** Top-level functions, hoisting needed, recursive functions. **Arrow function:** Callbacks, array methods (`.map`, `.filter`), when you want lexical `this`. **Expression:** When you need a named function for stack traces but don't want hoisting, or for conditional function definitions."
      }
    ]
  },
  {
    id: "arrays-array-methods",
    title: "Arrays & Array Methods",
    explanation: `Arrays are ordered collections of values. They can hold any type — numbers, strings, objects, even other arrays.

**Mutating methods** (change the original): \`push\`, \`pop\`, \`shift\`, \`unshift\`, \`splice\`, \`sort\`, \`reverse\`, \`fill\`
**Non-mutating methods** (return new): \`map\`, \`filter\`, \`reduce\`, \`slice\`, \`concat\`, \`flat\`, \`flatMap\`, \`find\`, \`some\`, \`every\`, \`includes\`

The "Big 3" higher-order array methods:
- **map** — Transform each element → new array of same length
- **filter** — Keep elements that pass a test → new array (possibly shorter)
- **reduce** — Accumulate all elements into a single value

🏠 **Real-world analogy:** \`map\` is like a factory assembly line — every item gets processed. \`filter\` is quality control — only good items pass. \`reduce\` is melting everything into one bar of gold.`,
    codeExample: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map — transform every element
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// filter — keep elements matching a condition
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4, 6, 8, 10]

// reduce — accumulate into a single value
const sum = numbers.reduce((acc, n) => acc + n, 0); // 55

// find — first element matching condition
const firstOver5 = numbers.find(n => n > 5); // 6

// some & every — boolean checks
const hasNeg = numbers.some(n => n < 0);    // false
const allPos = numbers.every(n => n > 0);   // true

// forEach — side effects (no return value!)
numbers.forEach((n, i) => {
  console.log(\`Index \${i}: \${n}\`);
});

// Chaining methods
const result = numbers
  .filter(n => n % 2 === 0)   // [2, 4, 6, 8, 10]
  .map(n => n ** 2)            // [4, 16, 36, 64, 100]
  .reduce((sum, n) => sum + n, 0); // 220

// Useful patterns
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 },
  { name: "Charlie", age: 30 }
];

// Group by (using reduce)
const grouped = users.reduce((groups, user) => {
  const key = user.age >= 18 ? "adults" : "minors";
  groups[key] = groups[key] || [];
  groups[key].push(user);
  return groups;
}, {});

// Flat & flatMap
const nested = [[1, 2], [3, [4, 5]]];
console.log(nested.flat());     // [1, 2, 3, [4, 5]]
console.log(nested.flat(Infinity)); // [1, 2, 3, 4, 5]

// Array.from — create arrays from iterables
const chars = Array.from("hello"); // ['h','e','l','l','o']
const range = Array.from({length: 5}, (_, i) => i + 1); // [1,2,3,4,5]`,
    exercise: `**Mini Exercise:**
1. Given an array of objects with name and score, return names of those who scored above 80
2. Use \`reduce\` to count the frequency of each word in an array
3. Write a function to remove duplicates from an array (3 different ways)
4. Implement your own \`map\` function using \`reduce\`
5. Flatten a deeply nested array without using \`.flat()\``,
    commonMistakes: [
      "`forEach` does NOT return a new array — use `map` if you need a transformed array",
      "Forgetting that `sort()` sorts as STRINGS by default — `[10, 2, 1].sort()` → `[1, 10, 2]`! Use `.sort((a,b) => a - b)`",
      "Using `map` when you should use `forEach` (for side effects) or `filter` (for subsetting)",
      "Mutating the original array with `splice`, `sort`, `reverse` when you didn't intend to — use `slice`, `toSorted`, `toReversed`",
      "Forgetting the initial value in `reduce` — without it, the first element becomes the accumulator, which fails on empty arrays"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Implement a `groupBy` function that groups array elements by a given key.",
        a: "```js\nfunction groupBy(arr, key) {\n  return arr.reduce((groups, item) => {\n    const val = item[key];\n    groups[val] = groups[val] || [];\n    groups[val].push(item);\n    return groups;\n  }, {});\n}\n```"
      },
      {
        type: "tricky",
        q: "What will `[1, 2, 3].map(parseInt)` return?",
        a: "`[1, NaN, NaN]`. `map` passes `(value, index, array)` to the callback. `parseInt` accepts `(string, radix)`. So: `parseInt(1, 0)` → `1`, `parseInt(2, 1)` → `NaN` (radix 1 invalid), `parseInt(3, 2)` → `NaN` (3 isn't valid in binary)."
      },
      {
        type: "conceptual",
        q: "What is the difference between `map` and `forEach`?",
        a: "`map` returns a **new array** with transformed elements. `forEach` returns `undefined` — it's for side effects only (logging, DOM manipulation). `map` is chainable; `forEach` is not. Use `map` when you need a result; `forEach` when you don't."
      },
      {
        type: "coding",
        q: "Write a function to find the intersection of two arrays.",
        a: "```js\nfunction intersection(a, b) {\n  const setB = new Set(b);\n  return [...new Set(a)].filter(x => setB.has(x));\n}\n```"
      },
      {
        type: "scenario",
        q: "You have an array of 1 million objects. You need to filter, then map. Should you chain or combine into a single `reduce`? Why?",
        a: "For 1M items, a single `reduce` pass is more efficient (one iteration vs two). However, for readability and maintainability, chaining `filter().map()` is clearer and only ~2x slower. In most cases, readability wins. Use `reduce` if benchmarks show it's a bottleneck."
      }
    ]
  },
  {
    id: "objects",
    title: "Objects",
    explanation: `Objects are collections of key-value pairs. They are the fundamental building block of JavaScript — almost everything is an object (arrays, functions, dates, regex, etc.).

**Creating objects:** Object literals \`{}\`, \`new Object()\`, \`Object.create()\`
**Accessing properties:** Dot notation \`obj.key\` or bracket notation \`obj["key"]\`
**The \`this\` keyword:** Inside a method, \`this\` refers to the object the method belongs to (in most cases).

Key methods: \`Object.keys()\`, \`Object.values()\`, \`Object.entries()\`, \`Object.assign()\`, \`Object.freeze()\`, \`Object.seal()\`, \`Object.hasOwn()\`

🏠 **Real-world analogy:** An object is like a filing cabinet. Each drawer has a label (key) and contains something (value). You can add drawers, remove them, or look inside them.`,
    codeExample: `// Creating objects
const person = {
  name: "Alice",
  age: 25,
  hobbies: ["reading", "coding"],
  address: {
    city: "New York",
    zip: "10001"
  },
  // Method shorthand
  greet() {
    return \`Hi, I'm \${this.name}\`;
  }
};

// Accessing properties
console.log(person.name);          // "Alice"
console.log(person["age"]);        // 25
const key = "hobbies";
console.log(person[key]);          // ["reading", "coding"]

// Dynamic keys
const field = "email";
const userData = {
  [field]: "alice@example.com",     // Computed property name
  [\`get\${field.charAt(0).toUpperCase() + field.slice(1)}\`]() {
    return this[field];
  }
};

// Object methods
console.log(Object.keys(person));    // ["name", "age", "hobbies", "address", "greet"]
console.log(Object.values(person));  // ["Alice", 25, [...], {...}, fn]
console.log(Object.entries(person)); // [["name","Alice"], ["age",25], ...]

// Shallow copy
const copy = { ...person };          // spread
const copy2 = Object.assign({}, person);

// Freeze vs Seal
const config = Object.freeze({ api: "/v1", debug: false });
// config.api = "/v2"; // ❌ Silently fails (or throws in strict mode)

const settings = Object.seal({ theme: "dark" });
settings.theme = "light"; // ✅ Can modify existing
// settings.lang = "en"; // ❌ Can't add new properties

// Check property existence
console.log("name" in person);              // true
console.log(person.hasOwnProperty("name")); // true
console.log(Object.hasOwn(person, "name")); // true (modern)

// Iterating
for (const [key, value] of Object.entries(person)) {
  console.log(\`\${key}: \${value}\`);
}`,
    exercise: `**Mini Exercise:**
1. Create a "bank account" object with deposit and withdraw methods using \`this\`
2. Write a function to deep clone an object (handle nested objects and arrays)
3. Write a function that merges two objects, with the second overriding the first
4. Create an object with a computed property name based on a variable`,
    commonMistakes: [
      "`this` in arrow functions doesn't refer to the object — arrow functions inherit `this` from the enclosing scope",
      "Shallow copy with spread `{...obj}` doesn't deep clone — nested objects are still references",
      "Using `delete obj.prop` is slow — set to `undefined` if performance matters, or use destructuring to exclude",
      "Checking property existence with `if (obj.prop)` fails when the value is falsy — use `in` operator or `Object.hasOwn()`",
      "`Object.freeze()` is shallow — nested objects can still be modified"
    ],
    interviewQuestions: [
      {
        type: "tricky",
        q: "What will this output?\n```js\nconst obj = { a: 1, b: 2, a: 3 };\nconsole.log(obj);\n```",
        a: "`{ a: 3, b: 2 }`. When duplicate keys exist in an object literal, the last one wins. The first `a: 1` is overwritten by `a: 3`."
      },
      {
        type: "conceptual",
        q: "What is the difference between `Object.freeze()` and `Object.seal()`?",
        a: "`Object.freeze()` prevents adding, removing, AND modifying properties (complete immutability at the top level). `Object.seal()` prevents adding and removing properties but ALLOWS modifying existing ones. Both are shallow — nested objects are unaffected."
      },
      {
        type: "coding",
        q: "Write a function to deep clone an object without using `JSON.parse(JSON.stringify())`.",
        a: "```js\nfunction deepClone(obj) {\n  if (obj === null || typeof obj !== 'object') return obj;\n  if (Array.isArray(obj)) return obj.map(deepClone);\n  return Object.fromEntries(\n    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])\n  );\n}\n// Modern: structuredClone(obj)\n```"
      },
      {
        type: "tricky",
        q: "What does `Object.keys()` return for an array `[1, 2, 3]`?",
        a: "`['0', '1', '2']`. Arrays are objects, and their indices are string keys. `Object.keys()` returns all enumerable own property keys as strings."
      },
      {
        type: "scenario",
        q: "How would you make an object truly deeply immutable?",
        a: "Recursively freeze all nested objects: ```js\nfunction deepFreeze(obj) {\n  Object.freeze(obj);\n  Object.values(obj).forEach(val => {\n    if (typeof val === 'object' && val !== null && !Object.isFrozen(val)) {\n      deepFreeze(val);\n    }\n  });\n  return obj;\n}\n``` Or use `structuredClone()` + `Object.freeze()` for copies."
      }
    ]
  },
  {
    id: "scope-hoisting",
    title: "Scope & Hoisting",
    explanation: `**Scope** determines where variables are accessible. JavaScript has 3 types:

1. **Global scope** — Variables declared outside any function/block. Accessible everywhere.
2. **Function scope** — Variables declared with \`var\` inside a function. Accessible only within that function.
3. **Block scope** — Variables declared with \`let\`/\`const\` inside \`{}\`. Accessible only within that block.

**Hoisting** is JavaScript's behavior of moving declarations to the top of their scope during compilation (before execution):
- \`var\` declarations are hoisted and initialized as \`undefined\`
- \`let\`/\`const\` declarations are hoisted but NOT initialized (Temporal Dead Zone)
- Function declarations are hoisted completely (name + body)
- Function expressions and arrow functions are NOT hoisted

🏠 **Real-world analogy:** Scope is like rooms in a house. A variable in the living room (global) can be seen from anywhere. One in the bedroom (function) is only visible there. Hoisting is like the house butler who moves all the furniture labels to the top of each room before you walk in.`,
    codeExample: `// Global scope
const globalVar = "I'm global";

function outer() {
  // Function scope
  var functionVar = "I'm function-scoped";
  
  if (true) {
    // Block scope
    let blockLet = "I'm block-scoped";
    const blockConst = "Me too";
    var notBlock = "I'm NOT block-scoped!"; // var ignores blocks
  }
  
  console.log(notBlock);   // ✅ Works — var is function-scoped
  // console.log(blockLet); // ❌ ReferenceError — let is block-scoped
}

// Hoisting examples
console.log(a); // undefined (var is hoisted, initialized as undefined)
// console.log(b); // ❌ ReferenceError (TDZ — let is hoisted but not initialized)
var a = 1;
let b = 2;

// Function hoisting
sayHello(); // ✅ Works! Function declarations are fully hoisted
function sayHello() {
  console.log("Hello!");
}

// sayBye(); // ❌ TypeError: sayBye is not a function
var sayBye = function() {
  console.log("Bye!");
};

// Scope chain — inner scopes can access outer scopes
function outerFn() {
  const outerVal = "outer";
  function innerFn() {
    const innerVal = "inner";
    console.log(outerVal); // ✅ Can access outer scope
    console.log(innerVal); // ✅ Own scope
  }
  innerFn();
  // console.log(innerVal); // ❌ Can't access inner scope
}

// Closure preview — function remembers its scope
function counter() {
  let count = 0;
  return function() {
    return ++count;
  };
}
const inc = counter();
console.log(inc()); // 1
console.log(inc()); // 2`,
    exercise: `**Mini Exercise:**
1. Predict the output of a script with mixed \`var\`, \`let\`, and function declarations
2. Write code that demonstrates the Temporal Dead Zone
3. Create a function that demonstrates the scope chain (3 levels deep)
4. Explain why the classic \`var\` in a for-loop with setTimeout prints the same number`,
    commonMistakes: [
      "Assuming `let` and `const` are not hoisted — they ARE hoisted, but stay in the Temporal Dead Zone until declared",
      "Not understanding that `var` inside an `if` or `for` block is still function-scoped, not block-scoped",
      "Confusing function declaration hoisting (fully hoisted) with function expression hoisting (only the `var` is hoisted)",
      "Accidentally creating global variables by forgetting `let`/`const`/`var` — in non-strict mode, `x = 5` creates a global",
      "Not knowing that each `let` in a for-loop creates a NEW binding per iteration, while `var` shares one"
    ],
    interviewQuestions: [
      {
        type: "tricky",
        q: "What will this output?\n```js\nvar x = 1;\nfunction foo() {\n  console.log(x);\n  var x = 2;\n  console.log(x);\n}\nfoo();\n```",
        a: "`undefined`, then `2`. The `var x` inside `foo` is hoisted to the top of the function, shadowing the global `x`. So the first `console.log` sees the hoisted-but-uninitialized local `x` (which is `undefined`), then after `x = 2`, it prints `2`."
      },
      {
        type: "conceptual",
        q: "Explain the Temporal Dead Zone (TDZ) with an example.",
        a: "TDZ is the time between entering a scope and the `let`/`const` declaration. Accessing the variable during TDZ throws `ReferenceError`. ```js\n{ console.log(x); // ReferenceError (TDZ)\n  let x = 5; }\n``` This prevents bugs from using variables before initialization, unlike `var` which gives `undefined`."
      },
      {
        type: "tricky",
        q: "What will this output?\n```js\nfunction test() {\n  console.log(a);\n  console.log(foo());\n  var a = 1;\n  function foo() {\n    return 2;\n  }\n}\ntest();\n```",
        a: "`undefined` then `2`. `var a` is hoisted (as `undefined`). `function foo` is fully hoisted (declaration + body). So `foo()` is callable and returns `2`, but `a` is `undefined` at that point."
      },
      {
        type: "coding",
        q: "Fix this code so it prints 0, 1, 2 instead of 3, 3, 3:\n```js\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n```",
        a: "```js\n// Solution 1: Use let\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// Solution 2: IIFE\nfor (var i = 0; i < 3; i++) {\n  (function(j) {\n    setTimeout(() => console.log(j), 100);\n  })(i);\n}\n```"
      },
      {
        type: "conceptual",
        q: "What is the scope chain and how does JavaScript resolve variable lookups?",
        a: "When accessing a variable, JS first looks in the current scope. If not found, it goes up to the parent scope, then grandparent, and so on up to the global scope. This is the **scope chain**. If not found anywhere, it throws `ReferenceError`. Each function creates a new link in the chain. The scope chain is determined at **definition** time (lexical scoping), NOT at call time."
      }
    ]
  },
  {
    id: "template-literals-destructuring",
    title: "Template Literals & Destructuring",
    explanation: `**Template Literals** (backticks \`\\\`\\\`\`) allow embedded expressions, multi-line strings, and tagged templates.

**Destructuring** extracts values from arrays or properties from objects into distinct variables. It's like unpacking a suitcase — you take out exactly what you need.

**Array destructuring** uses position: \`const [a, b] = [1, 2]\`
**Object destructuring** uses property names: \`const { name, age } = person\`

Both support defaults, renaming, nested destructuring, and rest patterns.

🏠 **Real-world analogy:** Destructuring is like opening a gift box and immediately labeling each item. Instead of reaching into the box every time, you lay everything out and name it.`,
    codeExample: `// Template literals
const name = "Alice";
const age = 25;

// String interpolation
const greeting = \`Hello, \${name}! You are \${age} years old.\`;

// Multi-line strings
const html = \`
  <div>
    <h1>\${name}</h1>
    <p>Age: \${age}</p>
  </div>
\`;

// Expressions in templates
console.log(\`Total: $\${(19.99 * 3).toFixed(2)}\`); // "Total: $59.97"
console.log(\`Status: \${age >= 18 ? 'Adult' : 'Minor'}\`);

// Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? \`<mark>\${values[i]}</mark>\` : "");
  }, "");
}
const msg = highlight\`Hello \${name}, you are \${age}\`;

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first, second, rest); // 1, 2, [3, 4, 5]

// Skip elements
const [, , third] = [1, 2, 3]; // third = 3

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a]; // a=2, b=1

// Object destructuring
const user = { name: "Bob", age: 30, city: "NYC", country: "US" };
const { name: userName, age: userAge, role = "user" } = user;
// Renamed + default value

// Nested destructuring
const config = { 
  server: { host: "localhost", port: 3000 },
  db: { name: "mydb" }
};
const { server: { host, port }, db: { name: dbName } } = config;

// Function parameter destructuring
function createUser({ name, age, role = "member" }) {
  return \`\${name} (\${role}), age \${age}\`;
}
createUser({ name: "Charlie", age: 28 });`,
    exercise: `**Mini Exercise:**
1. Use destructuring to swap two variables without a temp variable
2. Write a function that takes an object parameter and destructures it with defaults
3. Use nested destructuring to extract deeply nested API response data
4. Create a tagged template literal that escapes HTML characters`,
    commonMistakes: [
      "Forgetting to wrap object destructuring in an assignment with parentheses: `({ a, b } = obj)` — without `()`, `{` is treated as a block",
      "Destructuring `null` or `undefined` throws — always provide a default: `const { a } = obj || {}`",
      "Order matters for array destructuring but NOT for object destructuring",
      "Forgetting the alias syntax: `{ name: localName }` means 'extract `name` and call it `localName`', NOT 'extract `localName`'",
      "Overusing deep destructuring makes code harder to read — balance convenience with clarity"
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Use destructuring to extract the first and last items from an array, and put the rest in a middle variable.",
        a: "```js\nconst arr = [1, 2, 3, 4, 5];\nconst [first, ...middle] = arr;\nconst last = middle.pop();\n// Or:\nconst [f, ...rest] = arr;\nconst [l] = rest.splice(-1);\n```"
      },
      {
        type: "tricky",
        q: "What will this output?\n```js\nconst { a: { b } = {} } = { a: undefined };\nconsole.log(b);\n```",
        a: "`undefined`. When `a` is `undefined`, the default `{}` kicks in. Destructuring `b` from `{}` gives `undefined` since `b` doesn't exist in the empty object."
      },
      {
        type: "conceptual",
        q: "What are tagged template literals and when are they useful?",
        a: "Tagged templates pass template literal parts to a function: the string parts as an array and interpolated values as additional arguments. Used for: HTML sanitization, i18n/localization, CSS-in-JS (styled-components), SQL query builders (preventing injection), and custom formatting."
      },
      {
        type: "coding",
        q: "Write a function that uses destructuring to merge user settings with defaults.",
        a: "```js\nfunction applySettings({ theme = 'dark', fontSize = 14, lang = 'en', ...rest } = {}) {\n  return { theme, fontSize, lang, ...rest };\n}\napplySettings({ fontSize: 18 });\n// { theme: 'dark', fontSize: 18, lang: 'en' }\n```"
      },
      {
        type: "scenario",
        q: "How does destructuring improve function signatures in real-world code?",
        a: "Instead of `function createUser(name, age, role, active)` (unnamed positional args), use `function createUser({ name, age, role = 'user', active = true })`. Benefits: order doesn't matter, parameters are self-documenting, easy defaults, caller sees what they're passing, and you can add new params without breaking existing calls."
      }
    ]
  },
  {
    id: "spread-rest-operators",
    title: "Spread & Rest Operators",
    explanation: `Both use \`...\` syntax but serve opposite purposes:

**Spread** (\`...\`) EXPANDS an iterable into individual elements. Used in function calls, array literals, and object literals.
**Rest** (\`...\`) COLLECTS multiple elements into a single array. Used in function parameters and destructuring.

**Rule of thumb:** If \`...\` appears on the LEFT side of \`=\` or in function parameters → it's **Rest** (collecting). If on the RIGHT side or in arguments/literals → it's **Spread** (expanding).

🏠 **Real-world analogy:** **Spread** is like unpacking a suitcase and laying everything out. **Rest** is like packing everything that's left into a suitcase.`,
    codeExample: `// SPREAD — expanding
const nums = [1, 2, 3];
const moreNums = [...nums, 4, 5];       // [1, 2, 3, 4, 5]
console.log(Math.max(...nums));           // 3

// Spread for copies (shallow!)
const original = [1, [2, 3]];
const copy = [...original];
copy[1].push(4);
console.log(original[1]); // [2, 3, 4] ⚠️ Shallow copy!

// Object spread
const defaults = { theme: "dark", lang: "en", debug: false };
const userPrefs = { theme: "light", debug: true };
const config = { ...defaults, ...userPrefs };
// { theme: "light", lang: "en", debug: true } — later spreads win

// REST — collecting
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// Rest in destructuring
const [first, second, ...remaining] = [1, 2, 3, 4, 5];
console.log(remaining); // [3, 4, 5]

const { name, ...otherProps } = { name: "Alice", age: 25, city: "NYC" };
console.log(otherProps); // { age: 25, city: "NYC" }

// Real-world: removing a property immutably
const user = { id: 1, name: "Bob", password: "secret" };
const { password, ...safeUser } = user;
console.log(safeUser); // { id: 1, name: "Bob" } — password removed!

// Combining with function params
function log(level, ...messages) {
  console.log(\`[\${level}]\`, ...messages); // spread in function call
}
log("ERROR", "Server down", "Code: 500");`,
    exercise: `**Mini Exercise:**
1. Merge two arrays and remove duplicates using spread + Set
2. Write a function with required first param and optional rest params
3. Use object spread to create an immutable update pattern (update one field)
4. Use rest + destructuring to separate the first item from an array in one line`,
    commonMistakes: [
      "Spread creates a SHALLOW copy — nested objects/arrays are still references",
      "Rest parameter must be the LAST parameter in a function definition",
      "Can't use spread on non-iterables: `...123` throws — only arrays, strings, Maps, Sets, etc.",
      "Order matters with object spread: `{ ...a, ...b }` — `b`'s properties override `a`'s",
      "Confusing the `arguments` object with rest parameters — `arguments` is not a real array and doesn't work in arrow functions"
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is the difference between the spread and rest operators?",
        a: "Both use `...` but are contextual opposites. **Spread** expands an iterable into individual elements (used in function calls, arrays, objects). **Rest** collects multiple elements into a single array/object (used in function params, destructuring). Spread unpacks; rest packs."
      },
      {
        type: "tricky",
        q: "What will this output?\n```js\nconst a = { x: 1, y: 2 };\nconst b = { y: 3, z: 4 };\nconst c = { ...a, ...b };\nconst d = { ...b, ...a };\nconsole.log(c, d);\n```",
        a: "`c = { x: 1, y: 3, z: 4 }`, `d = { x: 1, y: 2, z: 4 }`. With spread, later properties override earlier ones. In `c`, `b`'s `y: 3` overrides `a`'s `y: 2`. In `d`, `a`'s `y: 2` overrides `b`'s `y: 3`."
      },
      {
        type: "coding",
        q: "Write a function that removes specified properties from an object immutably.",
        a: "```js\nfunction omit(obj, ...keys) {\n  return Object.fromEntries(\n    Object.entries(obj).filter(([k]) => !keys.includes(k))\n  );\n}\n// Or using rest:\nfunction omit(obj, ...keys) {\n  const result = { ...obj };\n  keys.forEach(k => delete result[k]);\n  return result;\n}\n```"
      },
      {
        type: "conceptual",
        q: "Why is `...args` preferred over the `arguments` object?",
        a: "`...args` is a real Array (has `map`, `filter`, etc.). `arguments` is array-like but NOT an array. Rest params work in arrow functions; `arguments` does NOT. Rest can capture a subset of args. Rest is clearer and more explicit about what a function accepts."
      },
      {
        type: "scenario",
        q: "How would you use spread to implement an immutable state update in a React-like app?",
        a: "```js\nconst state = { user: { name: 'A', age: 25 }, items: [1,2] };\n// Update nested property immutably:\nconst newState = {\n  ...state,\n  user: { ...state.user, age: 26 },\n  items: [...state.items, 3]\n};\n// Original state is untouched\n```"
      }
    ]
  }
];

export default phase1b;
