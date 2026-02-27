const phase1 = {
  id: "phase-1",
  title: "Phase 1: Foundations",
  emoji: "🟢",
  description: "Master the building blocks of JavaScript — variables, operators, control flow, functions, arrays, and objects.",
  topics: [
    {
      id: "variables-data-types",
      title: "Variables & Data Types",
      explanation: `In JavaScript, variables are containers that store data values. Think of them like labeled boxes — you put a value inside and refer to it by the label.

**var** — The original way to declare variables. Function-scoped and hoisted. Avoid in modern code.
**let** — Block-scoped, can be reassigned. Use when the value will change.
**const** — Block-scoped, cannot be reassigned. Use by default.

JavaScript has 7 primitive data types: **string**, **number**, **bigint**, **boolean**, **undefined**, **null**, **symbol**, and one non-primitive: **object**.

🏠 **Real-world analogy:** Think of \`const\` like a permanent marker label on a box — you can change what's *inside* the box (for objects), but you can't relabel the box. \`let\` is like a sticky note — you can peel it off and put a new label.`,
      codeExample: `// Variable declarations
var oldWay = "I'm function-scoped"; // Avoid in modern JS
let age = 25;                       // Can be reassigned
const name = "Alice";               // Cannot be reassigned

// Data types
const str = "Hello";          // string
const num = 42;                // number
const big = 9007199254740991n; // bigint
const bool = true;             // boolean
const nothing = null;          // null (intentional absence)
let notDefined;                // undefined (not yet assigned)
const sym = Symbol("id");      // symbol

// typeof operator
console.log(typeof str);       // "string"
console.log(typeof num);       // "number"
console.log(typeof bool);      // "boolean"
console.log(typeof nothing);   // "object" ⚠️ This is a famous JS bug!
console.log(typeof notDefined);// "undefined"

// const with objects — the reference is fixed, not the content
const user = { name: "Alice" };
user.name = "Bob";  // ✅ This works! We changed the content, not the box
// user = {};       // ❌ TypeError: Assignment to constant variable`,
      exercise: `**Mini Exercise:** Create variables to store your personal info:
1. Use \`const\` for your name and birth year
2. Use \`let\` for your current city (you might move!)
3. Calculate your age from the birth year
4. Log the type of each variable using \`typeof\`
5. Try reassigning the \`const\` name — what happens?`,
      commonMistakes: [
        "Using `var` instead of `let`/`const` — `var` is function-scoped and hoisted, leading to bugs",
        "Thinking `const` makes objects immutable — it only prevents reassignment of the variable, not mutation of the object",
        "Not knowing `typeof null` returns `\"object\"` — this is a legacy JavaScript bug",
        "Forgetting that `let` and `const` have a Temporal Dead Zone (TDZ) — accessing them before declaration throws a ReferenceError",
        "Confusing `undefined` (not yet assigned) with `null` (intentionally empty)"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between `var`, `let`, and `const`?",
          a: "`var` is function-scoped and hoisted (initialized as `undefined`). `let` and `const` are block-scoped and hoisted but NOT initialized (Temporal Dead Zone). `let` allows reassignment; `const` does not allow reassignment but allows mutation of objects/arrays."
        },
        {
          type: "tricky",
          q: "What will this code output?\n```js\nconsole.log(typeof null);\nconsole.log(typeof undefined);\nconsole.log(null == undefined);\nconsole.log(null === undefined);\n```",
          a: "`\"object\"`, `\"undefined\"`, `true`, `false`. `typeof null` returning `\"object\"` is a well-known JavaScript bug from its first implementation. `null == undefined` is `true` because of type coercion, but `null === undefined` is `false` because they are different types."
        },
        {
          type: "conceptual",
          q: "What is the Temporal Dead Zone (TDZ)?",
          a: "The TDZ is the period between entering a scope and the variable's declaration being processed. During TDZ, accessing a `let` or `const` variable throws a `ReferenceError`. This prevents using variables before they are declared, unlike `var` which returns `undefined`."
        },
        {
          type: "coding",
          q: "Write a function that checks if a value is `null` or `undefined` without using `==` (loose equality).",
          a: "```js\nfunction isNullOrUndefined(val) {\n  return val === null || val === undefined;\n}\n```"
        },
        {
          type: "scenario",
          q: "In a real-world app, when would you use `let` instead of `const`?",
          a: "Use `let` for loop counters (`for (let i = 0; ...)`), accumulators that change value, status flags that toggle, or any variable whose value needs to be reassigned. Default to `const` for everything else — function references, config values, imported modules, and destructured values."
        }
      ]
    },
    {
      id: "operators",
      title: "Operators",
      explanation: `Operators are symbols that perform operations on values. JavaScript has several types:

**Arithmetic:** \`+\`, \`-\`, \`*\`, \`/\`, \`%\` (modulo), \`**\` (exponent)
**Comparison:** \`==\` (loose), \`===\` (strict), \`!=\`, \`!==\`, \`>\`, \`<\`, \`>=\`, \`<=\`
**Logical:** \`&&\` (AND), \`||\` (OR), \`!\` (NOT)
**Ternary:** \`condition ? valueIfTrue : valueIfFalse\`
**Nullish Coalescing:** \`??\` — returns right side only if left is \`null\`/\`undefined\`
**Optional Chaining:** \`?.\` — safely access nested properties

🏠 **Real-world analogy:** \`===\` is like checking if two people are the EXACT same person (same type AND value). \`==\` is like checking if they look alike (allows type conversion).`,
      codeExample: `// Arithmetic
console.log(10 % 3);   // 1 (remainder)
console.log(2 ** 3);   // 8 (exponent)

// Comparison: == vs ===
console.log(5 == "5");   // true  (type coercion)
console.log(5 === "5");  // false (strict, no coercion)
console.log(0 == false); // true
console.log(0 === false);// false

// Logical operators with short-circuit evaluation
const user = { name: "Alice" };
const displayName = user.name || "Anonymous";  // "Alice"
const greeting = user.name && "Hello " + user.name; // "Hello Alice"

// ⚠️ || vs ?? — critical difference
const count = 0;
console.log(count || 10);  // 10 (0 is falsy!)
console.log(count ?? 10);  // 0  (?? only checks null/undefined)

// Ternary operator
const age = 20;
const status = age >= 18 ? "Adult" : "Minor"; // "Adult"

// Optional chaining
const obj = { a: { b: { c: 42 } } };
console.log(obj?.a?.b?.c);    // 42
console.log(obj?.x?.y?.z);    // undefined (no error!)`,
      exercise: `**Mini Exercise:**
1. Write an expression using the ternary operator that assigns "Even" or "Odd" based on a number
2. Use \`??\` to provide a default value for a potentially null variable
3. Compare the results of \`"" || "default"\` vs \`"" ?? "default"\`
4. Use optional chaining to safely access a deeply nested property`,
      commonMistakes: [
        "Using `==` instead of `===` — loose equality causes unexpected type coercion bugs",
        "Confusing `||` with `??` — `||` treats `0`, `\"\"`, and `false` as falsy; `??` only checks for `null`/`undefined`",
        "Forgetting that `&&` returns the first falsy value (or last value if all truthy), not always `true`/`false`",
        "Not knowing operator precedence — use parentheses to make intent clear",
        "Using `typeof` to check for `null` — it returns `\"object\"`, not `\"null\"`"
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What will this output?\n```js\nconsole.log(1 + '2' + 3);\nconsole.log(1 + 2 + '3');\n```",
          a: "`\"123\"` and `\"33\"`. In the first: `1 + '2'` = `'12'` (number coerced to string), then `'12' + 3` = `'123'`. In the second: `1 + 2` = `3` (both numbers), then `3 + '3'` = `'33'`."
        },
        {
          type: "conceptual",
          q: "Explain the difference between `||` and `??` operators.",
          a: "`||` returns the right operand if the left is ANY falsy value (`false`, `0`, `\"\"`, `null`, `undefined`, `NaN`). `??` (nullish coalescing) returns the right operand ONLY if the left is `null` or `undefined`. Use `??` when `0` or `\"\"` are valid values."
        },
        {
          type: "tricky",
          q: "What will this output?\n```js\nconsole.log([] == false);\nconsole.log([] == ![]);\n```",
          a: "Both are `true`. `[] == false`: `[]` converts to `\"\"` → `0`, `false` → `0`, so `0 == 0`. `[] == ![]`: `![]` is `false` (arrays are truthy), then `[] == false` same as above."
        },
        {
          type: "coding",
          q: "Write a one-liner using `??` and `?.` to safely get a user's city, defaulting to 'Unknown'.",
          a: "```js\nconst city = user?.address?.city ?? 'Unknown';\n```"
        },
        {
          type: "conceptual",
          q: "What is short-circuit evaluation? Give an example.",
          a: "Short-circuit evaluation means the second operand is only evaluated if necessary. `&&` stops at the first falsy value; `||` stops at the first truthy value. Example: `user && user.name` — if `user` is falsy, `user.name` is never accessed, preventing errors."
        }
      ]
    },
    {
      id: "strings-string-methods",
      title: "Strings & String Methods",
      explanation: `Strings are sequences of characters used to represent text. They are **immutable** — string methods return NEW strings without modifying the original.

Strings can be created with single quotes (\`''\`), double quotes (\`""\`), or backticks (\`\\\`\\\`\`) for template literals.

Key methods: \`.length\`, \`.toUpperCase()\`, \`.toLowerCase()\`, \`.trim()\`, \`.slice()\`, \`.split()\`, \`.includes()\`, \`.indexOf()\`, \`.replace()\`, \`.replaceAll()\`, \`.startsWith()\`, \`.endsWith()\`, \`.padStart()\`, \`.repeat()\`, \`.at()\`

🏠 **Real-world analogy:** Strings are like printed text on paper — you can't erase a letter, but you can photocopy the page with changes.`,
      codeExample: `const str = "  Hello, JavaScript World!  ";

// Basics
console.log(str.length);          // 29
console.log(str.trim());          // "Hello, JavaScript World!"
console.log(str.toUpperCase());   // "  HELLO, JAVASCRIPT WORLD!  "

// Searching
console.log(str.includes("Java"));    // true
console.log(str.indexOf("World"));    // 22
console.log(str.startsWith("  He")); // true

// Extracting
console.log(str.slice(8, 18));       // "JavaScript"
console.log(str.at(-3));             // "!  " → "d" (after trim)

// Modifying (returns new string)
console.log(str.replace("World", "Universe"));
console.log("ha".repeat(3));         // "hahaha"

// Splitting
const csv = "apple,banana,cherry";
const fruits = csv.split(",");       // ["apple", "banana", "cherry"]

// Padding (useful for formatting)
const num = "5";
console.log(num.padStart(3, "0"));   // "005"

// Template literals
const name = "Alice";
const greeting = \`Hello, \${name}! You have \${2 + 3} messages.\`;`,
      exercise: `**Mini Exercise:**
1. Write a function that takes a full name and returns initials (e.g., "John Doe" → "J.D.")
2. Write a function that censors a word in a sentence (replaces with ****)
3. Write a function to convert "hello-world-foo" to camelCase "helloWorldFoo"
4. Reverse a string without using \`.reverse()\``,
      commonMistakes: [
        "Forgetting strings are immutable — `str.toUpperCase()` returns a new string, doesn't modify `str`",
        "Confusing `slice()` with `splice()` — `slice` is for strings/arrays (non-destructive), `splice` is array-only (destructive)",
        "Using `indexOf` and checking `if(str.indexOf('x'))` — returns 0 for index 0, which is falsy! Use `!== -1` or `includes()`",
        "Not knowing that `+` operator with strings causes concatenation instead of addition",
        "Forgetting that `split('')` splits into individual characters, while `split()` returns array with entire string"
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Write a function to reverse a string without using built-in reverse methods.",
          a: "```js\nfunction reverseString(str) {\n  let result = '';\n  for (let i = str.length - 1; i >= 0; i--) {\n    result += str[i];\n  }\n  return result;\n}\n// Or: str.split('').reverse().join('')\n```"
        },
        {
          type: "tricky",
          q: "What will this output?\n```js\nconsole.log('b' + 'a' + + 'a' + 'a');\n```",
          a: "`\"baNaNa\"`. The `+ 'a'` is a unary plus trying to convert `'a'` to a number, which gives `NaN`. Then string concatenation: `'b' + 'a'` = `'ba'`, `'ba' + NaN` = `'baNaN'`, `'baNaN' + 'a'` = `'baNaNa'`."
        },
        {
          type: "conceptual",
          q: "Are strings mutable or immutable in JavaScript? What does that mean?",
          a: "Strings are **immutable**. Once created, a string's content cannot be changed. All string methods return new strings. `str[0] = 'X'` silently fails (or throws in strict mode). You must create a new string: `str = 'X' + str.slice(1)`."
        },
        {
          type: "coding",
          q: "Write a function to count the occurrences of a character in a string.",
          a: "```js\nfunction countChar(str, char) {\n  return str.split(char).length - 1;\n  // Or: [...str].filter(c => c === char).length\n}\n```"
        },
        {
          type: "scenario",
          q: "How would you truncate a long text to 100 characters and add '...' for a UI preview?",
          a: "```js\nfunction truncate(text, maxLen = 100) {\n  return text.length > maxLen\n    ? text.slice(0, maxLen).trimEnd() + '...'\n    : text;\n}\n```"
        }
      ]
    },
    {
      id: "numbers-math",
      title: "Numbers & Math Object",
      explanation: `JavaScript has only one number type — **IEEE 754 double-precision floating-point**. This means all numbers (integers and decimals) are stored as 64-bit floats, which can cause precision issues.

The **Math** object provides mathematical constants and functions: \`Math.round()\`, \`Math.floor()\`, \`Math.ceil()\`, \`Math.random()\`, \`Math.max()\`, \`Math.min()\`, \`Math.abs()\`, \`Math.pow()\`, \`Math.sqrt()\`, \`Math.trunc()\`.

Special numeric values: \`Infinity\`, \`-Infinity\`, \`NaN\` (Not a Number).

🏠 **Real-world analogy:** Floating-point precision is like trying to write 1/3 in decimal — you can get close (0.333...) but never exact. Similarly, 0.1 + 0.2 can't be stored exactly in binary.`,
      codeExample: `// Floating-point precision
console.log(0.1 + 0.2);           // 0.30000000000000004 😱
console.log(0.1 + 0.2 === 0.3);   // false!
// Fix: use toFixed or multiply
console.log((0.1 + 0.2).toFixed(1)); // "0.3" (returns string!)
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true

// Special values
console.log(1 / 0);         // Infinity
console.log(typeof NaN);    // "number" (ironic!)
console.log(NaN === NaN);   // false (NaN is not equal to itself!)
console.log(Number.isNaN(NaN)); // true (use this instead!)

// Useful Number methods
console.log(Number.isInteger(5.0));  // true
console.log(Number.isFinite(1/0));   // false
console.log(Number.parseInt("42px"));  // 42
console.log(Number.parseFloat("3.14em")); // 3.14

// Math object
console.log(Math.floor(4.9));    // 4
console.log(Math.ceil(4.1));     // 5
console.log(Math.round(4.5));    // 5
console.log(Math.trunc(-4.9));   // -4
console.log(Math.max(1, 5, 3));  // 5

// Random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log(randomInt(1, 10)); // e.g., 7`,
      exercise: `**Mini Exercise:**
1. Write a function that rounds a number to N decimal places
2. Generate a random hex color code (e.g., "#A3F2B1")
3. Write a function that converts Celsius to Fahrenheit
4. Check if a number is a perfect square using Math methods`,
      commonMistakes: [
        "Trusting `0.1 + 0.2 === 0.3` — floating-point arithmetic is imprecise; use `Number.EPSILON` for comparisons",
        "Using `isNaN()` instead of `Number.isNaN()` — global `isNaN('hello')` returns `true` because it coerces first",
        "Forgetting that `parseInt('08')` works in base 10 now, but always pass the radix: `parseInt('08', 10)`",
        "Using `Math.round()` for currency — it rounds 2.5 to 3 but -2.5 to -2; use specific rounding logic for money",
        "Not knowing `NaN === NaN` is `false` — use `Number.isNaN()` to check for NaN"
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What will this output?\n```js\nconsole.log(typeof NaN);\nconsole.log(NaN === NaN);\nconsole.log(Number.isNaN('hello'));\nconsole.log(isNaN('hello'));\n```",
          a: "`\"number\"`, `false`, `false`, `true`. `NaN` is of type `\"number\"`. `NaN` is not equal to itself. `Number.isNaN()` checks if the value IS `NaN` without coercion. Global `isNaN()` coerces `'hello'` to `NaN` first, then returns `true`."
        },
        {
          type: "conceptual",
          q: "Why does `0.1 + 0.2 !== 0.3` in JavaScript?",
          a: "JavaScript uses IEEE 754 double-precision floating-point representation. `0.1` and `0.2` cannot be represented exactly in binary, so their sum has a tiny rounding error (~`0.30000000000000004`). Use `Math.abs(a - b) < Number.EPSILON` for safe comparison."
        },
        {
          type: "coding",
          q: "Write a function to generate a random integer between two numbers (inclusive).",
          a: "```js\nfunction randomInt(min, max) {\n  return Math.floor(Math.random() * (max - min + 1)) + min;\n}\n```"
        },
        {
          type: "tricky",
          q: "What does `parseInt('0xF')` return? What about `parseInt('111', 2)`?",
          a: "`15` and `7`. `parseInt` detects the `0x` prefix for hexadecimal. With radix `2`, it parses `'111'` as binary (1×4 + 1×2 + 1×1 = 7)."
        },
        {
          type: "scenario",
          q: "How would you safely handle currency calculations in JavaScript?",
          a: "Work in the smallest unit (cents instead of dollars). Store `$9.99` as `999` cents, do all math with integers, and only convert to dollars for display: `(999 / 100).toFixed(2)`. Alternatively, use a library like `decimal.js` for precision."
        }
      ]
    },
    {
      id: "type-conversion-coercion",
      title: "Type Conversion & Coercion",
      explanation: `**Type Conversion** (explicit) is when YOU intentionally convert a value: \`Number("42")\`, \`String(42)\`, \`Boolean(0)\`.

**Type Coercion** (implicit) is when JAVASCRIPT automatically converts types during operations: \`"5" + 3\` → \`"53"\`, \`"5" - 3\` → \`2\`.

Understanding coercion rules is crucial for debugging and interviews:
- **To String:** \`+\` with a string converts the other operand to string
- **To Number:** \`-\`, \`*\`, \`/\`, \`%\` convert strings to numbers; \`+\` before a value is unary plus
- **To Boolean:** Values are either **truthy** or **falsy**

**Falsy values (only 8):** \`false\`, \`0\`, \`-0\`, \`0n\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`
**Everything else is truthy** — including \`[]\`, \`{}\`, \`"0"\`, \`"false"\`!

🏠 **Real-world analogy:** Coercion is like auto-translate — sometimes it gets the meaning right, sometimes hilariously wrong. Explicit conversion is using a professional translator.`,
      codeExample: `// Explicit conversion
console.log(Number("42"));      // 42
console.log(Number(""));        // 0
console.log(Number("hello"));   // NaN
console.log(Number(true));      // 1
console.log(Number(null));      // 0
console.log(Number(undefined)); // NaN

console.log(String(42));        // "42"
console.log(String(null));      // "null"
console.log(String(undefined)); // "undefined"

console.log(Boolean(0));        // false
console.log(Boolean(""));       // false
console.log(Boolean("0"));      // true  ⚠️
console.log(Boolean([]));       // true  ⚠️
console.log(Boolean({}));       // true  ⚠️

// Implicit coercion
console.log("5" + 3);     // "53"  (string wins with +)
console.log("5" - 3);     // 2     (- only works with numbers)
console.log("5" * "2");   // 10
console.log(true + true);  // 2
console.log(true + "1");   // "true1"

// Double NOT for boolean conversion
console.log(!!0);          // false
console.log(!!"hello");    // true
console.log(!!null);       // false
console.log(!!undefined);  // false
console.log(!!{});         // true`,
      exercise: `**Mini Exercise:**
1. Predict the output of each without running: \`"" + 1 + 0\`, \`"" - 1 + 0\`, \`true + false\`, \`"3" > "12"\`
2. Write a function that converts any value to a boolean WITHOUT using \`Boolean()\`
3. List all 8 falsy values in JavaScript from memory
4. Explain why \`[] == false\` is \`true\` but \`!![] === true\``,
      commonMistakes: [
        "Assuming `[]` and `{}` are falsy — they are TRUTHY! Only 8 values are falsy",
        "Using `+` for addition when one operand might be a string — it concatenates instead",
        "Confusing `Number('')` (returns `0`) with `Number(' ')` (also returns `0`) — whitespace is trimmed",
        "Thinking `'3' > '12'` compares numerically — string comparison is lexicographic, so `'3' > '1'` → `true`",
        "Not knowing that `==` triggers complex coercion rules — always use `===` to avoid surprises"
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What will each of these output?\n```js\nconsole.log([] + []);\nconsole.log([] + {});\nconsole.log({} + []);\n```",
          a: "`\"\"`, `\"[object Object]\"`, `\"[object Object]\"` (or `0` in some consoles). `[]` converts to `\"\"`. `[] + []` = `\"\" + \"\"` = `\"\"`. `[] + {}` = `\"\" + \"[object Object]\"`. `{} + []` depends on context — as expression it's `\"[object Object]\"`, as statement `{}` is a block and `+[]` = `0`."
        },
        {
          type: "conceptual",
          q: "What are all the falsy values in JavaScript?",
          a: "There are exactly 8: `false`, `0`, `-0`, `0n` (BigInt zero), `\"\"` (empty string), `null`, `undefined`, `NaN`. Everything else is truthy, including `[]`, `{}`, `\"0\"`, `\"false\"`, and `new Boolean(false)`."
        },
        {
          type: "tricky",
          q: "What does `'3' > '12'` return and why?",
          a: "`true`. When comparing two strings, JavaScript uses lexicographic (dictionary) comparison, comparing character by character using Unicode values. `'3'` (code 51) > `'1'` (code 49), so it returns `true` without ever looking at the `'2'`."
        },
        {
          type: "coding",
          q: "Write a function that safely converts a value to a number, returning 0 for any non-numeric input.",
          a: "```js\nfunction safeNumber(val) {\n  const num = Number(val);\n  return Number.isNaN(num) ? 0 : num;\n}\n```"
        },
        {
          type: "conceptual",
          q: "Explain the difference between explicit and implicit type conversion with examples.",
          a: "**Explicit** (you do it): `Number('42')` → `42`, `String(true)` → `'true'`. **Implicit** (JS does it): `'5' * 2` → `10` (string → number), `5 + '3'` → `'53'` (number → string). Implicit coercion follows rules: `+` prefers strings, arithmetic operators (`-`, `*`, `/`) prefer numbers."
        }
      ]
    },
    {
      id: "conditional-statements",
      title: "Conditional Statements",
      explanation: `Conditional statements control the flow of your program based on conditions.

**if/else** — The most common. Checks a condition and runs code blocks accordingly.
**else if** — Chain multiple conditions.
**switch** — Compares a value against multiple cases. Uses strict equality (\`===\`). Don't forget \`break\`!
**Ternary** — \`condition ? ifTrue : ifFalse\` — great for simple conditionals in assignments.

🏠 **Real-world analogy:** Conditionals are like a GPS giving directions — "If you reach the intersection, turn left. Otherwise, continue straight. If you see a gas station, stop."`,
      codeExample: `// if / else if / else
const score = 85;
let grade;

if (score >= 90) {
  grade = "A";
} else if (score >= 80) {
  grade = "B";
} else if (score >= 70) {
  grade = "C";
} else {
  grade = "F";
}
console.log(grade); // "B"

// Switch statement
const day = "Monday";
switch (day) {
  case "Monday":
  case "Tuesday":
  case "Wednesday":
  case "Thursday":
  case "Friday":
    console.log("Weekday");
    break;
  case "Saturday":
  case "Sunday":
    console.log("Weekend");
    break;
  default:
    console.log("Invalid day");
}

// Ternary for concise conditionals
const age = 20;
const canVote = age >= 18 ? "Yes" : "No";

// Nested ternary (use sparingly!)
const category = age < 13 ? "Child" : age < 20 ? "Teen" : "Adult";

// Guard clause pattern (clean code)
function processUser(user) {
  if (!user) return "No user provided";
  if (!user.email) return "No email found";
  // Main logic here — no deep nesting!
  return \`Processing \${user.email}\`;
}`,
      exercise: `**Mini Exercise:**
1. Write a function that takes a month number (1-12) and returns the season using \`switch\`
2. Write a grading function using if/else that handles edge cases (negative scores, >100)
3. Refactor a deeply nested if/else into guard clauses
4. Write a FizzBuzz function using ternary operators only`,
      commonMistakes: [
        "Forgetting `break` in switch — causes fall-through where subsequent cases execute",
        "Using `=` instead of `===` in conditions — assignment vs comparison",
        "Deeply nesting if/else instead of using guard clauses (early returns)",
        "Overusing nested ternaries — makes code unreadable; use if/else for complex logic",
        "Not considering all edge cases — e.g., what if the input is `null`, `undefined`, or wrong type?"
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What will this output?\n```js\nconst a = 0;\nif (a) {\n  console.log('truthy');\n} else {\n  console.log('falsy');\n}\n```",
          a: "`'falsy'`. `0` is a falsy value in JavaScript. The `if` condition coerces `0` to `false`."
        },
        {
          type: "conceptual",
          q: "What happens if you forget `break` in a switch statement?",
          a: "**Fall-through** occurs — execution continues into the next case regardless of whether it matches. This is sometimes used intentionally (grouping cases), but is usually a bug. Example: matching `'A'` without break will also execute `'B'`'s code."
        },
        {
          type: "coding",
          q: "Write a function that returns 'Fizz' for multiples of 3, 'Buzz' for 5, 'FizzBuzz' for both, or the number itself.",
          a: "```js\nfunction fizzBuzz(n) {\n  if (n % 15 === 0) return 'FizzBuzz';\n  if (n % 3 === 0) return 'Fizz';\n  if (n % 5 === 0) return 'Buzz';\n  return n;\n}\n```"
        },
        {
          type: "conceptual",
          q: "What is the guard clause pattern and why is it preferred?",
          a: "Guard clauses handle edge cases at the top of a function with early returns, avoiding deep nesting. Instead of: `if (valid) { if (hasData) { ... } }`, write: `if (!valid) return; if (!hasData) return; ...`. This improves readability and reduces cognitive complexity."
        },
        {
          type: "scenario",
          q: "When would you use `switch` over `if/else`?",
          a: "Use `switch` when comparing a single variable against many specific values (e.g., action types in a reducer, routes, menu options). Use `if/else` for range comparisons, complex conditions, or when conditions involve different variables. Note: `switch` uses `===` (strict equality)."
        }
      ]
    },
    {
      id: "loops",
      title: "Loops",
      explanation: `Loops execute a block of code repeatedly until a condition is met.

**for** — Classic loop with initializer, condition, and increment. Best when you know the iteration count.
**while** — Runs while a condition is true. Best when the number of iterations is unknown.
**do...while** — Like while, but guarantees at least one execution.
**for...of** — Iterates over iterable values (arrays, strings, Maps, Sets). Best for most array/string loops.
**for...in** — Iterates over enumerable property KEYS of an object. Best for objects (but be careful!).

🏠 **Real-world analogy:** A \`for\` loop is like reading a book page by page — you know there are 300 pages. A \`while\` loop is like searching for your keys — you keep looking until you find them.`,
      codeExample: `// Classic for loop
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}

// while loop
let count = 0;
while (count < 3) {
  console.log(count); // 0, 1, 2
  count++;
}

// do...while (runs at least once)
let input;
do {
  input = "valid"; // simulating input
} while (input !== "valid");

// for...of — iterates VALUES (arrays, strings)
const fruits = ["apple", "banana", "cherry"];
for (const fruit of fruits) {
  console.log(fruit); // "apple", "banana", "cherry"
}

// for...in — iterates KEYS (objects)
const person = { name: "Alice", age: 25, city: "NYC" };
for (const key in person) {
  console.log(\`\${key}: \${person[key]}\`);
}

// ⚠️ for...in on arrays — DON'T DO THIS
const arr = [10, 20, 30];
for (const index in arr) {
  console.log(typeof index); // "string"! Keys are always strings
}

// Loop control: break and continue
for (let i = 0; i < 10; i++) {
  if (i === 3) continue; // Skip 3
  if (i === 7) break;    // Stop at 7
  console.log(i);        // 0, 1, 2, 4, 5, 6
}

// Labeled loops (rare but useful for nested loops)
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
    console.log(i, j);
  }
}`,
      exercise: `**Mini Exercise:**
1. Write a loop that prints a multiplication table for a given number
2. Use \`for...of\` to count vowels in a string
3. Use \`for...in\` to list all properties of a nested object
4. Write a function that finds the first duplicate in an array using a loop
5. Create a pattern printer: for n=5, print a right triangle of stars`,
      commonMistakes: [
        "Using `for...in` on arrays — it iterates string keys, includes inherited properties, and doesn't guarantee order",
        "Infinite loops — forgetting to update the loop variable (`while(true)` without a `break`)",
        "Off-by-one errors — using `<=` vs `<` or starting from 1 instead of 0",
        "Modifying an array while iterating over it — can skip elements or cause infinite loops",
        "Not knowing that `for...of` works on any iterable (strings, Maps, Sets) but NOT plain objects"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between `for...in` and `for...of`?",
          a: "`for...in` iterates over enumerable **property keys** (strings) of an object, including inherited ones. `for...of` iterates over **values** of an iterable (arrays, strings, Maps, Sets, generators). Use `for...of` for arrays, `for...in` for objects (with `hasOwnProperty` guard)."
        },
        {
          type: "tricky",
          q: "What will this output?\n```js\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n```",
          a: "`3, 3, 3`. Because `var` is function-scoped, there's one shared `i`. By the time the timeouts fire, the loop has finished and `i` is `3`. Fix: use `let` (block-scoped) instead of `var`, or use an IIFE."
        },
        {
          type: "coding",
          q: "Write a function to flatten a nested array using loops (no recursion, no `.flat()`).",
          a: "```js\nfunction flatten(arr) {\n  const stack = [...arr];\n  const result = [];\n  while (stack.length) {\n    const item = stack.pop();\n    if (Array.isArray(item)) {\n      stack.push(...item);\n    } else {\n      result.unshift(item);\n    }\n  }\n  return result;\n}\n```"
        },
        {
          type: "conceptual",
          q: "What are `break` and `continue`? Can they be used with labels?",
          a: "`break` exits the loop entirely. `continue` skips to the next iteration. Both work with labels for nested loops: `break outer` exits the outer loop, `continue outer` skips to the next iteration of the outer loop."
        },
        {
          type: "scenario",
          q: "When would you use a `do...while` loop instead of a `while` loop?",
          a: "When you need the code to execute **at least once** before checking the condition. Common use cases: input validation (prompt user until valid), menu systems (show menu before checking choice), game loops (run one frame before checking exit)."
        }
      ]
    }
  ]
};

export default phase1;
