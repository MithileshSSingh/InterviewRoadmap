const phase2 = {
  id: "phase-2",
  title: "Phase 2: Intermediate",
  emoji: "🟡",
  description: "Level up with DOM manipulation, events, closures, prototypes, classes, error handling, and modern JavaScript patterns.",
  topics: [
    {
      id: "dom-manipulation",
      title: "DOM Manipulation",
      explanation: `The DOM (Document Object Model) is a tree representation of your HTML that JavaScript can interact with. Every HTML element becomes a **node** that you can select, create, modify, or remove.

**Selecting:** \`querySelector\`, \`querySelectorAll\`, \`getElementById\`, \`getElementsByClassName\`
**Creating:** \`createElement\`, \`createTextNode\`, \`cloneNode\`
**Modifying:** \`textContent\`, \`innerHTML\`, \`classList\`, \`setAttribute\`, \`style\`
**Inserting:** \`appendChild\`, \`prepend\`, \`append\`, \`insertBefore\`, \`insertAdjacentHTML\`
**Removing:** \`remove\`, \`removeChild\`

🏠 **Real-world analogy:** The DOM is like a family tree. \`querySelector\` is like searching for a specific family member. \`appendChild\` is like adding a newborn to the family.`,
      codeExample: `// Selecting elements
const heading = document.querySelector("h1");          // First match
const allCards = document.querySelectorAll(".card");    // All matches (NodeList)
const byId = document.getElementById("main");          // By ID

// Creating elements
const div = document.createElement("div");
div.textContent = "Hello, World!";
div.classList.add("card", "active");
div.setAttribute("data-id", "42");
div.style.backgroundColor = "#1a1a2e";

// Inserting into the DOM
document.body.appendChild(div);
heading.insertAdjacentHTML("afterend", "<p>Subtitle here</p>");

// Modifying existing elements
heading.textContent = "New Title";            // Safe (no HTML parsing)
heading.innerHTML = "<em>Styled</em> Title";  // Parses HTML (XSS risk!)
heading.classList.toggle("active");
heading.classList.replace("old-class", "new-class");

// Traversing the DOM
const parent = div.parentElement;
const children = parent.children;          // HTMLCollection (live)
const next = div.nextElementSibling;
const prev = div.previousElementSibling;

// Removing elements
div.remove();  // Modern
// parent.removeChild(div);  // Legacy

// Batch DOM updates with DocumentFragment (performance)
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const li = document.createElement("li");
  li.textContent = \`Item \${i + 1}\`;
  fragment.appendChild(li);
}
document.querySelector("ul").appendChild(fragment); // Single reflow!`,
      exercise: `**Mini Exercise:**
1. Create a function that builds a card component from data (title, description, image URL)
2. Write a function to dynamically create a table from a 2D array
3. Implement a toggle dark/light mode button that switches CSS classes
4. Build a simple todo list with add and delete functionality using DOM manipulation`,
      commonMistakes: [
        "Using `innerHTML` for user-generated content — XSS vulnerability! Use `textContent` instead",
        "Querying the DOM inside a loop — cache the element reference outside the loop for performance",
        "`querySelectorAll` returns a NodeList, not an Array — use `Array.from()` or spread `[...]` to use array methods",
        "Modifying DOM in a loop causes reflow for each operation — use `DocumentFragment` for batch inserts",
        "`getElementsByClassName` returns a live HTMLCollection that updates automatically — this can cause unexpected behavior in loops"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is the difference between `textContent` and `innerHTML`?", a: "`textContent` gets/sets the text content without parsing HTML — it's safe from XSS. `innerHTML` parses and renders HTML tags, making it vulnerable to injection attacks. `textContent` is also faster as it doesn't trigger HTML parsing." },
        { type: "tricky", q: "What is the difference between a NodeList and an HTMLCollection?", a: "**NodeList** (from `querySelectorAll`) is static (snapshot) and has `forEach`. **HTMLCollection** (from `getElementsByClassName`) is live (auto-updates when DOM changes) and doesn't have `forEach`. Neither is a true Array — convert with `Array.from()` for full array methods." },
        { type: "coding", q: "Write a function that creates a nested list from a tree-like data structure.", a: "```js\nfunction createList(data) {\n  const ul = document.createElement('ul');\n  data.forEach(item => {\n    const li = document.createElement('li');\n    li.textContent = item.name;\n    if (item.children) li.appendChild(createList(item.children));\n    ul.appendChild(li);\n  });\n  return ul;\n}\n```" },
        { type: "conceptual", q: "Why is `DocumentFragment` useful for performance?", a: "`DocumentFragment` is a lightweight DOM node that isn't part of the active DOM. You can append many elements to it without triggering reflows. When you append the fragment to the DOM, it's done in a single operation, causing only one reflow instead of one per element." },
        { type: "scenario", q: "How would you efficiently update a list of 10,000 items in the DOM?", a: "Use: 1) `DocumentFragment` for batch inserts, 2) Virtual scrolling (only render visible items), 3) `requestAnimationFrame` for visual updates, 4) Batch DOM reads and writes separately (avoid layout thrashing), 5) Consider a virtual DOM library for complex UIs." }
      ]
    },
    {
      id: "event-handling",
      title: "Event Handling",
      explanation: `Events are actions that happen in the browser — clicks, keypresses, form submissions, scrolling, etc. JavaScript can listen for and respond to these events.

**Adding listeners:** \`element.addEventListener(event, handler)\`
**Removing listeners:** \`element.removeEventListener(event, handler)\` (must use same function reference!)
**Event Object:** Contains info about the event — \`target\`, \`type\`, \`preventDefault()\`, \`stopPropagation()\`

**Event Propagation** has 3 phases:
1. **Capturing** — Event travels from \`window\` down to the target
2. **Target** — Event reaches the target element
3. **Bubbling** — Event bubbles back up from target to \`window\`

**Event Delegation** — Attach ONE listener to a parent to handle events from children. Efficient and works for dynamically added elements!

🏠 **Real-world analogy:** Event bubbling is like yelling in a building — the sound starts in your room (target), then the hallway hears it (parent), then the floor, then the whole building. Event delegation is having ONE security guard at the entrance instead of one per room.`,
      codeExample: `// Basic event listener
const button = document.querySelector("#myBtn");
button.addEventListener("click", function(event) {
  console.log("Clicked!", event.target);
});

// Arrow function listener
button.addEventListener("click", (e) => {
  e.preventDefault();  // Prevent default behavior
  console.log("Button text:", e.target.textContent);
});

// Event delegation — handle all list item clicks from parent
const list = document.querySelector("#todoList");
list.addEventListener("click", (e) => {
  if (e.target.matches("li")) {
    e.target.classList.toggle("done");
  }
  if (e.target.matches(".delete-btn")) {
    e.target.parentElement.remove();
  }
});

// Event propagation
document.querySelector(".outer").addEventListener("click", () => {
  console.log("Outer (bubble)");
});
document.querySelector(".inner").addEventListener("click", (e) => {
  console.log("Inner");
  e.stopPropagation(); // Stop bubbling
});

// Capturing phase (third argument = true)
document.querySelector(".outer").addEventListener("click", () => {
  console.log("Outer (capture)");
}, true);

// Once: automatically removes after first trigger
button.addEventListener("click", () => {
  console.log("This fires only once!");
}, { once: true });

// Keyboard events
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    console.log("Ctrl+Enter pressed!");
  }
});

// Custom events
const customEvent = new CustomEvent("userLoggedIn", {
  detail: { username: "Alice", role: "admin" }
});
document.dispatchEvent(customEvent);
document.addEventListener("userLoggedIn", (e) => {
  console.log("User:", e.detail.username);
});`,
      exercise: `**Mini Exercise:**
1. Build a keyboard shortcut listener (e.g., Ctrl+S to save)
2. Implement event delegation for a dynamic list (add/remove items)
3. Create a drag-and-drop interface using mouse events
4. Build a form with real-time validation using input/blur events`,
      commonMistakes: [
        "Using anonymous functions with `removeEventListener` — you need the SAME function reference to remove it",
        "Forgetting `preventDefault()` on form submit — the page will reload!",
        "Attaching listeners inside loops without delegation — creates many listeners instead of one",
        "Confusing `event.target` (actual clicked element) with `event.currentTarget` (element the listener is on)",
        "Not understanding that `stopPropagation()` stops bubbling but `preventDefault()` stops the default action — they are different!"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "Explain event bubbling and capturing with an example.", a: "**Capturing** (top-down): `window → document → body → div → button`. **Bubbling** (bottom-up): `button → div → body → document → window`. By default, listeners use bubbling. Add `{ capture: true }` for capturing phase. The event always goes through all 3 phases: capture → target → bubble." },
        { type: "conceptual", q: "What is event delegation and why is it useful?", a: "Event delegation attaches a single event listener to a parent element to handle events from its children. Benefits: 1) Works for dynamically added elements, 2) Uses less memory (one listener vs many), 3) Less setup code. Uses `event.target` to identify which child triggered the event." },
        { type: "tricky", q: "What is the difference between `event.target` and `event.currentTarget`?", a: "`event.target` is the element that TRIGGERED the event (the actual click target). `event.currentTarget` is the element the LISTENER is attached to. With delegation, `target` is the child clicked, `currentTarget` is the parent with the listener. In the handler, `this === event.currentTarget` (not for arrow functions)." },
        { type: "coding", q: "Implement a debounce function for a search input.", a: "```js\nfunction debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\nconst search = debounce((query) => {\n  console.log('Searching:', query);\n}, 300);\ninput.addEventListener('input', (e) => search(e.target.value));\n```" },
        { type: "scenario", q: "You have a table with 10,000 rows. Each row has a delete button. What's the best approach for handling clicks?", a: "Event delegation! Attach ONE listener to the `<table>` or `<tbody>`, not 10,000 listeners. Check `event.target.closest('.delete-btn')` to identify which button was clicked, then remove its parent `<tr>`. This uses minimal memory and automatically works for rows added later." }
      ]
    },
    {
      id: "higher-order-functions-callbacks",
      title: "Higher-Order Functions & Callbacks",
      explanation: `A **Higher-Order Function (HOF)** is a function that either:
1. Takes one or more functions as arguments, OR
2. Returns a function as its result

A **Callback** is a function passed as an argument to another function, to be called later.

HOFs are everywhere in JavaScript: \`map\`, \`filter\`, \`reduce\`, \`forEach\`, \`setTimeout\`, \`addEventListener\`, \`Promise.then\`.

🏠 **Real-world analogy:** A HOF is like a delivery service. You give them a package (callback) and instructions. They handle the logistics and deliver the package at the right time. You don't deliver it yourself — you delegate.`,
      codeExample: `// Basic callback
function greet(name, callback) {
  const greeting = \`Hello, \${name}!\`;
  callback(greeting);
}
greet("Alice", (msg) => console.log(msg));

// Higher-order function that returns a function
function multiplier(factor) {
  return function(number) {
    return number * factor;
  };
}
const double = multiplier(2);
const triple = multiplier(3);
console.log(double(5));  // 10
console.log(triple(5));  // 15

// Custom HOFs
function unless(condition, fn) {
  if (!condition) fn();
}
unless(false, () => console.log("This runs!"));

function repeat(n, action) {
  for (let i = 0; i < n; i++) action(i);
}
repeat(3, (i) => console.log(\`Iteration \${i}\`));

// Practical: function composition
function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}
const addOne = (x) => x + 1;
const square = (x) => x * x;
const addOneThenSquare = compose(square, addOne);
console.log(addOneThenSquare(4)); // 25 = (4+1)²

// Callbacks in async operations
function fetchData(url, onSuccess, onError) {
  // Simulating async operation
  setTimeout(() => {
    const success = Math.random() > 0.3;
    if (success) onSuccess({ data: "result" });
    else onError(new Error("Failed to fetch"));
  }, 1000);
}
fetchData("/api",
  (data) => console.log("Success:", data),
  (err) => console.error("Error:", err)
);`,
      exercise: `**Mini Exercise:**
1. Write a HOF \`retry(fn, n)\` that calls \`fn\` up to \`n\` times until it succeeds
2. Implement your own \`map\` and \`filter\` functions using callbacks
3. Create a \`pipe\` function (like compose but left-to-right)
4. Write a \`throttle\` function that limits callback execution to once per interval`,
      commonMistakes: [
        "Passing the result of a function instead of the function itself: `setTimeout(greet(), 1000)` calls greet immediately",
        "Not handling errors in callbacks — always have an error-first callback pattern or error handler",
        "Creating deeply nested callbacks (callback hell) — use Promises or async/await instead",
        "Losing `this` context when passing methods as callbacks — use `.bind()` or arrow functions",
        "Not understanding that callbacks can be synchronous too — `array.map(fn)` calls `fn` synchronously"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is a higher-order function? Give examples from JavaScript.", a: "A function that takes a function as an argument or returns a function. Built-in examples: `Array.map()`, `Array.filter()`, `Array.reduce()`, `setTimeout()`, `addEventListener()`, `Promise.then()`. Custom example: `function withLogging(fn) { return (...args) => { console.log('calling'); return fn(...args); }; }`" },
        { type: "conceptual", q: "What is callback hell and how do you avoid it?", a: "Callback hell is deeply nested callbacks making code hard to read (pyramid of doom). Avoid it with: 1) Named functions instead of anonymous, 2) Promises (`.then` chaining), 3) `async/await`, 4) Breaking code into smaller functions, 5) Libraries like `async.js`." },
        { type: "coding", q: "Implement a `compose` function that takes multiple functions and returns their composition.", a: "```js\nfunction compose(...fns) {\n  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);\n}\n// Usage:\nconst transform = compose(Math.abs, x => x * 2, x => x - 10);\ntransform(3); // Math.abs((3-10)*2) = 14\n```" },
        { type: "tricky", q: "What will this output?\n```js\n[1,2,3].map(parseInt);\n```", a: "`[1, NaN, NaN]`. `map` passes `(value, index, array)` to the callback. `parseInt` takes `(string, radix)`. So: `parseInt(1, 0)` → use default radix → `1`, `parseInt(2, 1)` → radix 1 invalid → `NaN`, `parseInt(3, 2)` → 3 isn't valid binary → `NaN`." },
        { type: "scenario", q: "How would you implement a middleware system using higher-order functions?", a: "```js\nfunction pipeline(...middlewares) {\n  return (input) => {\n    return middlewares.reduce(\n      (result, middleware) => middleware(result),\n      input\n    );\n  };\n}\nconst process = pipeline(\n  (req) => ({ ...req, timestamp: Date.now() }),\n  (req) => ({ ...req, validated: true }),\n  (req) => ({ ...req, logged: true })\n);\n```" }
      ]
    },
    {
      id: "closures-lexical-scope",
      title: "Closures & Lexical Scope",
      explanation: `A **closure** is created when a function "remembers" variables from its outer (enclosing) scope, even after the outer function has finished executing.

**Lexical Scope** means a function's scope is determined by WHERE it's defined in the code, not where it's called.

Every function in JavaScript forms a closure. The inner function has access to:
1. Its own variables
2. Outer function's variables
3. Global variables

Closures are used for: **data privacy**, **factory functions**, **partial application**, **memoization**, and **module patterns**.

🏠 **Real-world analogy:** A closure is like a backpack. When you leave home (outer function), you carry a backpack with items from home (outer variables). Even though you're far from home, you still have access to those items.`,
      codeExample: `// Basic closure
function outer() {
  const message = "Hello from outer!";
  function inner() {
    console.log(message); // Can access outer's variable
  }
  return inner;
}
const fn = outer();  // outer() finishes executing
fn();                // "Hello from outer!" — closure remembers 'message'!

// Practical: Counter with private state
function createCounter(initialValue = 0) {
  let count = initialValue; // Private — can't be accessed directly!
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
    reset: () => (count = initialValue)
  };
}
const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getCount()); // 2
// console.log(count); // ❌ ReferenceError — count is private!

// Factory functions with closures
function createGreeter(greeting) {
  return function(name) {
    return \`\${greeting}, \${name}!\`;
  };
}
const hello = createGreeter("Hello");
const hola = createGreeter("Hola");
console.log(hello("Alice")); // "Hello, Alice!"
console.log(hola("Bob"));    // "Hola, Bob!"

// The classic loop problem
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3  (var is shared)
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100); // 0, 1, 2  (let creates new binding)
}

// Memoization using closures
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) return cache[key];
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}
const factorial = memoize(function f(n) {
  return n <= 1 ? 1 : n * f(n - 1);
});`,
      exercise: `**Mini Exercise:**
1. Create a \`bankAccount\` closure with private balance, deposit, withdraw, and getBalance
2. Write a \`once\` function that ensures a callback runs only once using a closure
3. Implement a rate limiter using closures
4. Create a function that generates unique IDs using a closure`,
      commonMistakes: [
        "Not understanding that closures capture REFERENCES, not values — the value can change after capture",
        "Memory leaks — closures keep references to outer scope alive, preventing garbage collection",
        "The classic `var` in loop problem — use `let` or IIFE to create a new closure per iteration",
        "Thinking closures are a special syntax — they're just a side effect of lexical scoping and functions",
        "Over-using closures when a class or simple object would be clearer"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is a closure and how does it work?", a: "A closure is a function bundled with its lexical environment (the variables available at definition time). When a function is returned from another function, it retains access to the outer function's variables even after the outer function completes. This happens because functions maintain a reference to their scope chain." },
        { type: "tricky", q: "What will this output?\n```js\nfunction createFns() {\n  var fns = [];\n  for (var i = 0; i < 3; i++) {\n    fns.push(function() { return i; });\n  }\n  return fns;\n}\nconst [a, b, c] = createFns();\nconsole.log(a(), b(), c());\n```", a: "`3, 3, 3`. All three functions close over the SAME `var i`. By the time they execute, the loop has finished and `i` is `3`. Fix: use `let` instead of `var`, or wrap in an IIFE: `(function(j) { fns.push(() => j); })(i)`." },
        { type: "coding", q: "Write a `createMultiplier(x)` function that returns a function multiplying its argument by x.", a: "```js\nfunction createMultiplier(x) {\n  return function(y) {\n    return x * y;\n  };\n}\nconst triple = createMultiplier(3);\nconsole.log(triple(10)); // 30\n```" },
        { type: "conceptual", q: "How can closures cause memory leaks?", a: "A closure keeps its entire outer scope alive in memory. If a closure references a large data structure or DOM element that's no longer needed, it prevents garbage collection. Common case: event listeners inside closures that capture large variables. Fix: null out references when done, remove event listeners, or restructure code." },
        { type: "scenario", q: "How would you implement data privacy (encapsulation) in JavaScript without classes?", a: "Use closures (Module Pattern): ```js\nfunction createUser(name) {\n  let _password = ''; // private\n  return {\n    getName: () => name,\n    setPassword: (p) => { _password = p; },\n    checkPassword: (p) => p === _password\n  };\n}\n// _password is completely inaccessible from outside```" }
      ]
    },
    {
      id: "this-keyword",
      title: "The this Keyword In Depth",
      explanation: `\`this\` is a special keyword that refers to the object that is executing the current function. Its value depends on HOW the function is called, not where it's defined (except arrow functions).

**Rules (in order of precedence):**
1. **\`new\` binding** — \`this\` = the new object being created
2. **Explicit binding** — \`call()\`, \`apply()\`, \`bind()\` set \`this\` explicitly
3. **Implicit binding** — When called as a method (\`obj.fn()\`), \`this\` = the object before the dot
4. **Default binding** — In non-strict mode: \`this\` = \`window/globalThis\`. In strict mode: \`this\` = \`undefined\`
5. **Arrow functions** — No own \`this\`; inherits from enclosing lexical scope

🏠 **Real-world analogy:** \`this\` is like the word "I" in language. Who "I" refers to depends on who is speaking. If Alice says "I", it means Alice. If Bob says "I", it means Bob. The context determines the meaning.`,
      codeExample: `// Implicit binding — method call
const user = {
  name: "Alice",
  greet() {
    console.log(\`Hi, I'm \${this.name}\`);
  }
};
user.greet(); // "Hi, I'm Alice" — this = user

// Lost this — common bug!
const greetFn = user.greet;
greetFn(); // "Hi, I'm undefined" — this = window (or undefined in strict)

// Explicit binding
function sayHi() {
  console.log(\`Hi, I'm \${this.name}\`);
}
const bob = { name: "Bob" };
sayHi.call(bob);              // "Hi, I'm Bob"
sayHi.apply(bob);             // "Hi, I'm Bob"
const boundSayHi = sayHi.bind(bob);
boundSayHi();                 // "Hi, I'm Bob"

// call vs apply — arguments differ
function introduce(greeting, punctuation) {
  console.log(\`\${greeting}, I'm \${this.name}\${punctuation}\`);
}
introduce.call(bob, "Hey", "!");    // args individually
introduce.apply(bob, ["Hey", "!"]); // args as array

// Arrow functions — lexical this
const team = {
  name: "Engineering",
  members: ["Alice", "Bob"],
  showMembers() {
    // Arrow function inherits 'this' from showMembers
    this.members.forEach((member) => {
      console.log(\`\${member} is in \${this.name}\`); // ✅ Works!
    });
  }
};
team.showMembers();

// new binding
function Person(name) {
  this.name = name;
  // 'this' refers to the newly created object
}
const alice = new Person("Alice");
console.log(alice.name); // "Alice"

// this in event handlers
// button.addEventListener("click", function() {
//   console.log(this); // The button element (implicit binding)
// });
// button.addEventListener("click", () => {
//   console.log(this); // window/undefined — arrow function!
// });`,
      exercise: `**Mini Exercise:**
1. Create an object method that loses \`this\` when extracted — then fix it with \`bind\`
2. Write examples demonstrating all 4 binding rules
3. Use \`call\` to borrow a method from one object to use on another
4. Explain why \`this\` in a \`setTimeout\` callback isn't the object, and fix it`,
      commonMistakes: [
        "Extracting a method loses `this`: `const fn = obj.method; fn()` — `this` is no longer `obj`",
        "Using regular functions in `forEach`/`map` inside methods — `this` won't refer to the object; use arrow functions",
        "Arrow functions DON'T have their own `this` — don't use them as object methods",
        "Forgetting that `bind` returns a NEW function — it doesn't modify the original",
        "In event handlers, `this` = the element in regular functions, NOT in arrow functions"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "Explain the four rules of `this` binding in JavaScript.", a: "1) **`new`**: `this` = new object. 2) **Explicit** (`call`/`apply`/`bind`): `this` = specified object. 3) **Implicit** (`obj.fn()`): `this` = object before the dot. 4) **Default**: `this` = `globalThis` (or `undefined` in strict mode). Arrow functions have NO `this` — they use lexical `this` from their enclosing scope." },
        { type: "tricky", q: "What will this output?\n```js\nconst obj = {\n  name: 'Alice',\n  getName: () => this.name,\n  getNameRegular() { return this.name; }\n};\nconsole.log(obj.getName());\nconsole.log(obj.getNameRegular());\n```", a: "`undefined` (or globalThis.name), then `'Alice'`. The arrow function `getName` doesn't have its own `this` — it uses the `this` from the enclosing scope (global/module scope), NOT `obj`. The regular function `getNameRegular` uses implicit binding, so `this` = `obj`." },
        { type: "conceptual", q: "What is the difference between `call`, `apply`, and `bind`?", a: "`call(thisArg, arg1, arg2)` — invokes immediately with individual args. `apply(thisArg, [args])` — invokes immediately with args as array. `bind(thisArg, arg1)` — returns a NEW function with `this` permanently bound (doesn't invoke). Mnemonic: **C**all = **C**ommas, **A**pply = **A**rray, **B**ind = **B**ound later." },
        { type: "coding", q: "Implement your own `bind` function.", a: "```js\nFunction.prototype.myBind = function(context, ...boundArgs) {\n  const fn = this;\n  return function(...args) {\n    return fn.apply(context, [...boundArgs, ...args]);\n  };\n};\n```" },
        { type: "scenario", q: "You have a class method that's passed as a callback and loses `this`. How do you fix it?", a: "Three approaches: 1) `bind` in constructor: `this.method = this.method.bind(this)`. 2) Arrow function in class field: `method = () => { ... }`. 3) Arrow wrapper at call site: `onClick={() => this.method()}`. Option 2 is most common in modern code. Note: option 3 creates a new function each render." }
      ]
    },
    {
      id: "prototypes-prototypal-inheritance",
      title: "Prototypes & Prototypal Inheritance",
      explanation: `Every JavaScript object has a hidden internal property called \`[[Prototype]]\` (accessible via \`__proto__\` or \`Object.getPrototypeOf()\`). When you access a property that doesn't exist on an object, JavaScript looks up the **prototype chain**.

**Prototype chain:** \`object → object's prototype → prototype's prototype → ... → Object.prototype → null\`

This is JavaScript's inheritance model — **prototypal inheritance**. Unlike classical inheritance (classes in Java/C++), objects inherit directly from other objects.

Constructor functions + \`.prototype\` = the traditional way to create "classes" before ES6.

🏠 **Real-world analogy:** Prototypes are like family traits. If you don't have blue eyes (own property), check if your parent does (prototype). If they don't, check grandparent. Keep going up the family tree.`,
      codeExample: `// Every object has a prototype
const arr = [1, 2, 3];
// arr → Array.prototype → Object.prototype → null
console.log(arr.__proto__ === Array.prototype);    // true
console.log(arr.__proto__.__proto__ === Object.prototype); // true

// Constructor functions (pre-ES6 classes)
function Animal(name, sound) {
  this.name = name;
  this.sound = sound;
}
// Methods on prototype (shared across all instances — memory efficient!)
Animal.prototype.speak = function() {
  return \`\${this.name} says \${this.sound}\`;
};
const dog = new Animal("Rex", "Woof");
console.log(dog.speak()); // "Rex says Woof"
console.log(dog.hasOwnProperty("name"));  // true  (own property)
console.log(dog.hasOwnProperty("speak")); // false (inherited from prototype)

// Prototypal inheritance
function Dog(name) {
  Animal.call(this, name, "Woof"); // Call parent constructor
}
Dog.prototype = Object.create(Animal.prototype); // Set up prototype chain
Dog.prototype.constructor = Dog;                  // Fix constructor reference
Dog.prototype.fetch = function() {
  return \`\${this.name} fetches the ball!\`;
};
const rex = new Dog("Rex");
console.log(rex.speak());  // "Rex says Woof" (inherited)
console.log(rex.fetch());  // "Rex fetches the ball!" (own)

// Object.create — direct prototypal inheritance
const personProto = {
  greet() { return \`Hi, I'm \${this.name}\`; }
};
const alice = Object.create(personProto);
alice.name = "Alice";
console.log(alice.greet()); // "Hi, I'm Alice"

// Checking the prototype chain
console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true
console.log(rex instanceof Object); // true`,
      exercise: `**Mini Exercise:**
1. Create a constructor function \`Vehicle\` with a \`drive()\` method on its prototype
2. Create \`Car\` that inherits from \`Vehicle\` and adds a \`honk()\` method
3. Verify the prototype chain using \`instanceof\` and \`Object.getPrototypeOf()\`
4. Add a method to \`Array.prototype\` (then understand why this is dangerous)`,
      commonMistakes: [
        "Adding methods directly to instances instead of the prototype — wastes memory for each instance",
        "Modifying `Object.prototype` or `Array.prototype` — affects ALL objects/arrays globally!",
        "Forgetting to set `constructor` after `Dog.prototype = Object.create(Animal.prototype)`",
        "Confusing `__proto__` (instance's link to its prototype) with `.prototype` (constructor's blueprint for instances)",
        "Using `for...in` iterates over inherited properties — always check `hasOwnProperty()` or use `Object.hasOwn()`"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "Explain the prototype chain in JavaScript.", a: "Every object has a `[[Prototype]]` link to another object. When accessing a property, JS first checks the object itself, then its prototype, then the prototype's prototype, and so on until it reaches `Object.prototype` (whose prototype is `null`). This chain of lookups is the prototype chain. It's how JavaScript implements inheritance." },
        { type: "conceptual", q: "What is the difference between `__proto__` and `.prototype`?", a: "`__proto__` is on every INSTANCE — it's the link to the object's prototype (what it inherits from). `.prototype` is on CONSTRUCTOR FUNCTIONS — it's the object that will become the `__proto__` of instances created with `new`. `dog.__proto__ === Dog.prototype` is `true`." },
        { type: "coding", q: "Implement inheritance between `Shape` and `Circle` using prototypes.", a: "```js\nfunction Shape(color) { this.color = color; }\nShape.prototype.describe = function() {\n  return `A ${this.color} shape`;\n};\nfunction Circle(color, radius) {\n  Shape.call(this, color);\n  this.radius = radius;\n}\nCircle.prototype = Object.create(Shape.prototype);\nCircle.prototype.constructor = Circle;\nCircle.prototype.area = function() {\n  return Math.PI * this.radius ** 2;\n};\n```" },
        { type: "tricky", q: "What does `Object.create(null)` return?", a: "An object with NO prototype — `null` prototype. It doesn't inherit ANYTHING from `Object.prototype`, so it has no `toString`, `hasOwnProperty`, etc. Useful for creating pure dictionary/hash-map objects without inherited properties. `Object.create(null).__proto__` is `undefined`." },
        { type: "scenario", q: "Why should you put methods on the prototype instead of inside the constructor?", a: "Methods on the prototype are SHARED across all instances (one copy in memory). Methods inside the constructor are DUPLICATED per instance. For 1000 objects, prototype methods use memory for 1 function; constructor methods use memory for 1000 functions. Prototype methods also allow dynamic updates — changing the prototype method affects all existing instances." }
      ]
    },
    {
      id: "es6-classes",
      title: "ES6 Classes & Inheritance",
      explanation: `ES6 classes are **syntactic sugar** over JavaScript's prototypal inheritance. They provide a cleaner, more familiar syntax but work the same way under the hood.

**Key features:**
- \`constructor()\` — Called when creating new instances with \`new\`
- Instance methods — Defined in the class body
- \`static\` methods — Called on the class itself, not instances
- \`extends\` — Inherit from a parent class
- \`super\` — Call the parent's constructor or methods
- Getters/Setters — Computed properties
- Private fields (\`#field\`) — Truly private properties (ES2022)

🏠 **Real-world analogy:** A class is like a blueprint for a house. You can build many houses (instances) from the same blueprint. \`extends\` is like modifying the blueprint to add a garage — the new blueprint inherits the original rooms.`,
      codeExample: `class Animal {
  // Private field (ES2022)
  #id;
  
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
    this.#id = Math.random().toString(36).slice(2);
  }
  
  // Instance method
  speak() {
    return \`\${this.name} says \${this.sound}\`;
  }
  
  // Getter
  get info() {
    return \`\${this.name} (\${this.sound})\`;
  }
  
  // Setter with validation
  set nickname(value) {
    if (value.length < 2) throw new Error("Too short!");
    this._nickname = value;
  }
  
  // Static method
  static create(name, sound) {
    return new Animal(name, sound);
  }
  
  // Private method
  #generateTag() {
    return \`ANIMAL-\${this.#id}\`;
  }
}

// Inheritance with extends
class Dog extends Animal {
  constructor(name, breed) {
    super(name, "Woof");  // MUST call super before using 'this'
    this.breed = breed;
  }
  
  // Override parent method
  speak() {
    return \`\${super.speak()} (tail wagging)\`;
  }
  
  fetch(item) {
    return \`\${this.name} fetches the \${item}!\`;
  }
}

const rex = new Dog("Rex", "German Shepherd");
console.log(rex.speak());       // "Rex says Woof (tail wagging)"
console.log(rex.info);          // "Rex (Woof)" — inherited getter
console.log(rex instanceof Dog);     // true
console.log(rex instanceof Animal);  // true
console.log(Dog.create);        // undefined — static methods aren't inherited on instances`,
      exercise: `**Mini Exercise:**
1. Create a \`BankAccount\` class with private \`#balance\`, deposit, withdraw, and getBalance
2. Create a \`SavingsAccount\` that extends \`BankAccount\` and adds interest calculation
3. Implement a \`LinkedList\` class with add, remove, and traverse methods
4. Create a \`Validator\` class with static methods for email, phone, and password validation`,
      commonMistakes: [
        "Forgetting to call `super()` in a child class constructor BEFORE using `this` — throws ReferenceError",
        "Thinking classes are hoisted like function declarations — they are NOT (similar to `let`/`const` TDZ)",
        "Confusing static methods with instance methods — `static` methods are on the class, not on instances",
        "Using arrow functions as class methods — they work as class fields but are NOT on the prototype (memory duplication)",
        "Forgetting that `#private` fields are truly private — not accessible via `this['#field']` or outside the class"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "Are JavaScript classes \"real\" classes like Java/C++?", a: "No. JavaScript classes are **syntactic sugar** over prototypal inheritance. Under the hood, `class Dog extends Animal` still creates prototype chains: `Dog.prototype.__proto__ === Animal.prototype`. There's no true class-based instantiation — it's still objects linking to objects via prototypes." },
        { type: "tricky", q: "What will this output?\n```js\nclass Foo {\n  static bar = 'hello';\n  baz = 'world';\n}\nconsole.log(Foo.bar, Foo.baz);\nconst f = new Foo();\nconsole.log(f.bar, f.baz);\n```", a: "`'hello', undefined` and `undefined, 'world'`. `static bar` is on the class `Foo` itself. `baz` is an instance field, only on instances created with `new`. Static ≠ accessible on instances, and instance fields ≠ accessible on the class." },
        { type: "coding", q: "Implement a `Stack` class with `push`, `pop`, `peek`, `isEmpty`, and `size` using private fields.", a: "```js\nclass Stack {\n  #items = [];\n  push(item) { this.#items.push(item); }\n  pop() { return this.#items.pop(); }\n  peek() { return this.#items.at(-1); }\n  isEmpty() { return this.#items.length === 0; }\n  get size() { return this.#items.length; }\n}\n```" },
        { type: "conceptual", q: "What is the difference between public, private (`#`), and static class fields?", a: "**Public fields**: Accessible on instances (`this.name`). **Private fields (`#name`)**: Only accessible inside the class — truly private, throws SyntaxError if accessed outside. **Static fields**: On the class itself, not instances (`ClassName.field`). Static can also be private: `static #count`." },
        { type: "scenario", q: "When would you use composition over inheritance in JavaScript?", a: "When objects need behaviors from multiple sources (JS has no multiple inheritance). Instead of: `class FlyingSwimmingAnimal extends ??`, compose behaviors: `const flyBehavior = { fly() {...} }; Object.assign(duck, flyBehavior, swimBehavior)`. Prefer composition when: relationships are 'has-a' not 'is-a', behaviors are shared across unrelated classes, or the inheritance hierarchy would be deep/complex." }
      ]
    },
    {
      id: "error-handling",
      title: "Error Handling",
      explanation: `Error handling prevents your program from crashing when unexpected things happen. JavaScript uses \`try...catch...finally\` blocks.

**Error types:** \`Error\`, \`TypeError\`, \`ReferenceError\`, \`SyntaxError\`, \`RangeError\`, \`URIError\`, \`EvalError\`

**Custom errors** — Extend the \`Error\` class for domain-specific errors.

🏠 **Real-world analogy:** Error handling is like a safety net for trapeze artists. You hope they never fall, but if they do, the net catches them gracefully instead of a crash.`,
      codeExample: `// try...catch...finally
try {
  const data = JSON.parse("invalid json");
} catch (error) {
  console.error("Parse failed:", error.message);
} finally {
  console.log("This ALWAYS runs");
}

// Error properties
try {
  null.property;
} catch (e) {
  console.log(e.name);    // "TypeError"
  console.log(e.message); // "Cannot read properties of null"
  console.log(e.stack);   // Full stack trace
}

// Throwing custom errors
function divide(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Arguments must be numbers");
  }
  if (b === 0) throw new RangeError("Cannot divide by zero");
  return a / b;
}

// Custom Error class
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}
class NotFoundError extends Error {
  constructor(resource) {
    super(\`\${resource} not found\`);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

// Error handling with specific types
try {
  throw new ValidationError("email", "Invalid email format");
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(\`Validation error on \${e.field}: \${e.message}\`);
  } else if (e instanceof NotFoundError) {
    console.log(\`404: \${e.message}\`);
  } else {
    throw e; // Re-throw unknown errors!
  }
}`,
      exercise: `**Mini Exercise:**
1. Create a \`safeParse(jsonString)\` function that returns parsed JSON or a default value
2. Build a \`CustomError\` hierarchy for an API: \`AuthError\`, \`NotFoundError\`, \`ValidationError\`
3. Write middleware that catches and formats errors into a standard response
4. Implement retry logic that catches specific errors and retries the operation`,
      commonMistakes: [
        "Catching errors and silently ignoring them — at minimum, log the error",
        "Catching ALL errors with a generic catch — only catch errors you can handle; re-throw the rest",
        "Forgetting that `finally` ALWAYS runs, even if there's a `return` in try or catch",
        "Throwing strings instead of Error objects — `throw 'error'` loses the stack trace; use `throw new Error('error')`",
        "Not extending Error properly in custom errors — must call `super(message)` first"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is the purpose of `finally` in try/catch/finally?", a: "`finally` ALWAYS executes, regardless of whether an error was thrown or caught. It runs even if `try` or `catch` has a `return` statement. Use it for cleanup: closing connections, releasing resources, hiding loading spinners." },
        { type: "tricky", q: "What will this return?\n```js\nfunction test() {\n  try {\n    return 1;\n  } catch(e) {\n    return 2;\n  } finally {\n    return 3;\n  }\n}\nconsole.log(test());\n```", a: "`3`. The `finally` block's `return` overrides the `try` block's `return`. This is why you should NEVER put `return` in `finally` — it's a well-known JavaScript gotcha." },
        { type: "coding", q: "Create a custom `HttpError` class with status code and message.", a: "```js\nclass HttpError extends Error {\n  constructor(statusCode, message) {\n    super(message);\n    this.name = 'HttpError';\n    this.statusCode = statusCode;\n  }\n  static badRequest(msg) { return new HttpError(400, msg); }\n  static notFound(msg) { return new HttpError(404, msg); }\n  static serverError(msg) { return new HttpError(500, msg); }\n}\n```" },
        { type: "conceptual", q: "What are the built-in error types in JavaScript?", a: "`Error` (base), `TypeError` (wrong type), `ReferenceError` (undeclared variable), `SyntaxError` (invalid syntax), `RangeError` (value out of range), `URIError` (malformed URI), `EvalError` (eval error). Most common in practice: `TypeError` and `ReferenceError`." },
        { type: "scenario", q: "How would you implement a global error handler for uncaught errors in JavaScript?", a: "Browser: `window.addEventListener('error', handler)` for sync, `window.addEventListener('unhandledrejection', handler)` for async. Node.js: `process.on('uncaughtException', handler)` and `process.on('unhandledRejection', handler)`. Always: log the error, notify monitoring (Sentry, etc.), and in Node, exit gracefully after uncaught exceptions." }
      ]
    }
  ]
};

export default phase2;
