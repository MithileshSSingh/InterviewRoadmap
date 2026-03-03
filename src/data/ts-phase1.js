const tsPhase1 = {
  id: "phase-1",
  title: "Phase 1: TypeScript Foundations",
  emoji: "🟢",
  description:
    "Master the building blocks of TypeScript — type annotations, inference, interfaces, unions, functions, enums, and the compiler.",
  topics: [
    {
      id: "ts-why-and-setup",
      title: "Why TypeScript & Setup",
      explanation: `TypeScript is a **statically-typed superset of JavaScript** developed by Microsoft. Every valid JavaScript file is already valid TypeScript — TS adds an optional type layer that is **erased at compile time**, producing plain JavaScript.

**Why TypeScript matters in production:**
- Catches bugs **at compile time** instead of runtime — null reference errors, typos, wrong argument types
- Serves as **living documentation** — function signatures tell you exactly what goes in and comes out
- Enables **powerful IDE tooling** — autocompletion, refactoring, jump-to-definition across large codebases
- Scales to **large teams** — type contracts between modules prevent integration bugs

**How TypeScript works internally:**
1. You write \`.ts\` files with type annotations
2. The TypeScript compiler (\`tsc\`) **type-checks** the code
3. Types are **completely erased** — the output is plain JavaScript
4. No runtime overhead — TypeScript doesn't exist at runtime

**Comparison with JavaScript:** In JS, \`function add(a, b) { return a + b; }\` silently accepts \`add("hello", 5)\` → \`"hello5"\`. In TS, you declare \`function add(a: number, b: number): number\` and the compiler catches misuse before the code ever runs.

🏠 **Real-world analogy:** TypeScript is like spell-check for your code. The red squiggly lines catch mistakes as you type, but the final published document (JavaScript) doesn't contain any spell-check markup.`,
      codeExample: `// Install TypeScript
// npm install -g typescript
// npx tsc --init  (creates tsconfig.json)

// Basic type annotations
let message: string = "Hello, TypeScript!";
let count: number = 42;
let isActive: boolean = true;

// Type inference — TS figures out the type automatically
let inferred = "TypeScript infers this as string"; // type: string
let num = 100;  // type: number

// Function with type annotations
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// greet(42);  // ❌ Compile error: Argument of type 'number'
//             //    is not assignable to parameter of type 'string'
greet("Alice"); // ✅ Works

// The compiled JavaScript output (types are erased):
// function greet(name) {
//   return \`Hello, \${name}!\`;
// }

// tsconfig.json essentials (starter):
// {
//   "compilerOptions": {
//     "target": "ES2022",
//     "module": "ESNext",
//     "strict": true,          // Enable all strict checks
//     "noUncheckedIndexedAccess": true,  // Arrays may be undefined
//     "esModuleInterop": true,
//     "outDir": "./dist",
//     "rootDir": "./src"
//   },
//   "include": ["src/**/*"]
// }`,
      exercise: `**Mini Exercise:**
1. Install TypeScript globally and run \`tsc --init\` to create a tsconfig
2. Create a \`.ts\` file that declares variables of each primitive type
3. Write a function \`calculateArea(width: number, height: number): number\`
4. Try passing wrong types — observe the compile-time errors
5. Compile with \`tsc\` and inspect the generated JavaScript — notice types are gone`,
      commonMistakes: [
        "Thinking TypeScript adds runtime overhead — types are completely erased at compile time; there is zero runtime cost",
        "Using `any` everywhere to 'make it work' — this defeats the entire purpose of TypeScript",
        "Not enabling `strict: true` in tsconfig — without it, many type checks are disabled and you lose most of TS's value",
        "Confusing TypeScript with a different language — it's JavaScript with types, not a replacement. All JS knowledge applies directly",
        "Thinking you need to annotate everything — TypeScript's type inference is powerful; annotate parameters and return types, let inference handle the rest",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is TypeScript and how does it relate to JavaScript?",
          a: "TypeScript is a statically-typed superset of JavaScript. Every valid JS is valid TS. TypeScript adds optional type annotations that are checked at compile time and completely erased in the output. The result is plain JavaScript with zero runtime overhead. It's developed by Microsoft and is the standard for large-scale JS projects.",
        },
        {
          type: "conceptual",
          q: "What happens to TypeScript types at runtime?",
          a: "They don't exist. TypeScript types are erased during compilation — the output is plain JavaScript with no type information. This means you cannot check types at runtime using TypeScript syntax (e.g., `if (x is string)` doesn't exist at runtime). For runtime type checks, you still use `typeof`, `instanceof`, or custom guards.",
        },
        {
          type: "conceptual",
          q: "Why should you enable `strict: true` in tsconfig.json?",
          a: "`strict: true` enables all strict type-checking options: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, and more. Without it, TypeScript allows many unsafe patterns (like implicit `any` and nullable access). It's the difference between TypeScript being helpful vs. being a false sense of security.",
        },
        {
          type: "tricky",
          q: "Is there any runtime performance cost to using TypeScript?",
          a: "No. TypeScript types are completely erased during compilation. The output JavaScript is identical to what you'd write by hand. There's a build-time cost (compilation), but zero runtime cost. In some cases, TypeScript can actually lead to faster code because the developer is forced to think about types, avoiding implicit coercion chains.",
        },
        {
          type: "scenario",
          q: "You're joining a large JavaScript project with 200+ files. How would you migrate it to TypeScript?",
          a: "Incremental migration: 1) Add tsconfig with `allowJs: true` and `strict: false`. 2) Rename files from `.js` to `.ts` one module at a time, starting with leaf modules (no dependents). 3) Fix type errors in each file. 4) Gradually enable strict options one by one. 5) Add ambient declarations (`.d.ts`) for untyped third-party code. Never do a big-bang migration.",
        },
      ],
    },
    {
      id: "core-type-system",
      title: "Core Type System & Inference",
      explanation: `TypeScript's type system is **structural** (also called duck typing) — it cares about the **shape** of data, not its name or origin. If an object has the right properties, it's compatible, regardless of where it came from.

**Primitive types:** \`string\`, \`number\`, \`boolean\`, \`null\`, \`undefined\`, \`bigint\`, \`symbol\`
**Special types:** \`any\` (escape hatch), \`unknown\` (safe any), \`never\` (impossible), \`void\` (no return)
**Object types:** \`object\`, \`{}\`, arrays, tuples, functions

**Type Inference** is TypeScript's ability to automatically determine types without explicit annotations. TS uses **control flow analysis** to narrow types through your code.

**Structural Typing vs Nominal Typing:**
- **Structural** (TypeScript): Two types are compatible if they have the same shape/structure
- **Nominal** (Java/C#): Two types are compatible only if they have the same name/declaration

This means in TypeScript, you never need \`implements\` for a class to satisfy an interface — if it has the right shape, it works.

**Type vs Value space:** TypeScript has two parallel worlds — the **type space** (erased at runtime) and the **value space** (exists at runtime). \`interface\` and \`type\` live only in type space; \`class\` lives in both.

🏠 **Real-world analogy:** Structural typing is like a USB port. It doesn't care what brand the cable is — if the plug fits the shape (has the right pins), it works. Nominal typing would require the cable to be from the same manufacturer.`,
      codeExample: `// Primitive types
let name: string = "Alice";
let age: number = 30;
let active: boolean = true;
let big: bigint = 9007199254740991n;
let id: symbol = Symbol("id");

// Special types
let anything: any = 42;       // ⚠️ Escape hatch — disables type checking
anything = "now a string";    // No error — defeats the purpose of TS!

let safe: unknown = 42;       // ✅ Safe alternative to any
// safe.toFixed();             // ❌ Error! Must narrow first
if (typeof safe === "number") {
  safe.toFixed(2);            // ✅ After narrowing, it's safe
}

function throwError(msg: string): never {
  throw new Error(msg);       // never returns — the return type is 'never'
}

function log(msg: string): void {
  console.log(msg);           // void = no meaningful return value
}

// Type inference in action
let x = 10;                   // inferred as 'number'
let y = [1, 2, 3];           // inferred as 'number[]'
let z = { name: "Alice" };   // inferred as '{ name: string }'

// const narrows to literal types
const pi = 3.14;             // type: 3.14 (literal), not 'number'
const greeting = "hello";    // type: "hello" (literal), not 'string'

// Structural typing — shape matters, not name
interface Point {
  x: number;
  y: number;
}
function distance(p: Point): number {
  return Math.sqrt(p.x ** 2 + p.y ** 2);
}
// No 'implements Point' needed — just match the shape!
const myPoint = { x: 3, y: 4, z: 5 }; // Extra property OK
distance(myPoint); // ✅ Works! Has x and y

// Arrays and tuples
let nums: number[] = [1, 2, 3];
let pair: [string, number] = ["age", 30]; // Fixed length & types
let readonly_arr: readonly number[] = [1, 2, 3];
// readonly_arr.push(4); // ❌ Error: Property 'push' does not exist`,
      exercise: `**Mini Exercise:**
1. Declare variables using each primitive type and each special type
2. Show the difference between \`any\` and \`unknown\` by trying to call methods on both
3. Create an object that satisfies an interface WITHOUT explicitly implementing it (structural typing)
4. Use \`const\` vs \`let\` declarations and observe how TypeScript infers literal types vs wider types
5. Create a tuple type for a coordinate \`[number, number, number]\` and try adding a 4th element`,
      commonMistakes: [
        "Using `any` instead of `unknown` — `any` disables ALL type checking; `unknown` forces you to narrow before use",
        "Confusing `void` with `undefined` — `void` means 'no meaningful return'; a `void` function CAN return `undefined` implicitly",
        "Not understanding structural typing — coming from Java/C#, developers expect nominal typing and add unnecessary `implements` clauses",
        "Thinking `never` is the same as `void` — `void` returns nothing; `never` means the function NEVER returns (throws or infinite loop)",
        "Over-annotating when inference would suffice — `let x: number = 5` is redundant; `let x = 5` is cleaner and equally type-safe",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between `any` and `unknown` in TypeScript?",
          a: "`any` disables ALL type checking — you can do anything with it, access any property, call any method. `unknown` is the type-safe counterpart — it accepts any value but you MUST narrow it (via `typeof`, `instanceof`, etc.) before using it. `unknown` says 'I don't know the type yet'; `any` says 'I don't care about types'. Always prefer `unknown` over `any`.",
        },
        {
          type: "conceptual",
          q: "What is structural typing and how does it differ from nominal typing?",
          a: "TypeScript uses structural typing (duck typing): types are compatible if they have the same shape (properties and methods), regardless of their declared name. Java/C# use nominal typing: types are compatible only if they share the same declaration. In TS, `{ x: number, y: number }` satisfies `interface Point { x: number; y: number }` without any `implements` keyword.",
        },
        {
          type: "tricky",
          q: "What is the type of `const x = 'hello'` vs `let x = 'hello'`?",
          a: "`const x = 'hello'` has type `\"hello\"` (string literal type) because `const` can never be reassigned — TS narrows to the exact value. `let x = 'hello'` has type `string` because `let` can be reassigned to any string. This is called 'literal narrowing' and is important for discriminated unions and type guards.",
        },
        {
          type: "conceptual",
          q: "When does the `never` type occur in TypeScript?",
          a: "`never` represents a value that never occurs: 1) Functions that always throw. 2) Functions with infinite loops. 3) Exhaustiveness checks in switch/if-else (the remaining case after all options handled). 4) Intersection of incompatible types: `string & number` = `never`. It's the bottom type — `never` is assignable to everything, but nothing is assignable to `never`.",
        },
        {
          type: "coding",
          q: "Write a function that accepts `unknown` input and safely extracts a name string from it.",
          a: "```ts\\nfunction getName(input: unknown): string {\\n  if (\\n    typeof input === 'object' &&\\n    input !== null &&\\n    'name' in input &&\\n    typeof (input as { name: unknown }).name === 'string'\\n  ) {\\n    return (input as { name: string }).name;\\n  }\\n  return 'Unknown';\\n}\\n```",
        },
      ],
    },
    {
      id: "interfaces-and-type-aliases",
      title: "Interfaces vs Type Aliases",
      explanation: `TypeScript provides two main ways to define object shapes: **interfaces** and **type aliases**. They overlap significantly but have key differences.

**Interface** — Defines a contract for object shapes. Can be **extended** and **merged** (declaration merging).
**Type Alias** — Creates a name for ANY type — objects, unions, intersections, primitives, tuples. Cannot be merged.

**When to use which (practical rule):**
- Use **interface** for object shapes, class contracts, and public APIs (extendable, mergeable)
- Use **type** for unions, intersections, mapped types, conditional types, and utility types
- In practice, many teams pick one and use it consistently — both work fine for objects

**Declaration merging** is unique to interfaces: if you declare the same interface name twice, TypeScript **merges** them. This is how libraries extend global types (e.g., adding properties to \`Window\`).

**\`extends\` vs \`&\` (intersection):**
- \`interface B extends A\` — creates a subtype with explicit relationship
- \`type B = A & { extra: string }\` — creates an intersection type

Both achieve similar results, but \`extends\` gives better error messages and is checked more eagerly.

🏠 **Real-world analogy:** An interface is like a job description — it lists required skills, and anyone who matches them qualifies. A type alias is like a label — you can label anything: a single item, a combination, or even a condition.`,
      codeExample: `// Interface — object shape contract
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;              // Optional property
  readonly createdAt: Date;  // Cannot be modified after creation
}

// Extending interfaces
interface Admin extends User {
  role: "admin" | "superadmin";
  permissions: string[];
}

// Type alias — can describe ANY type
type ID = string | number;                // Union
type Pair<T> = [T, T];                    // Generic tuple
type Callback = (data: string) => void;   // Function type
type Status = "loading" | "success" | "error"; // String literal union

// Type alias for objects (works like interface)
type Product = {
  id: number;
  name: string;
  price: number;
};

// Intersection types (like extending)
type AdminUser = User & {
  role: string;
  permissions: string[];
};

// Declaration merging — ONLY works with interfaces
interface Window {
  myCustomProperty: string;  // Merges with the global Window interface
}

// interface + declaration merging example
interface Config {
  apiUrl: string;
}
interface Config {
  timeout: number;  // Merged! Config now has BOTH apiUrl and timeout
}
const config: Config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
};

// Readonly and optional modifiers
interface Article {
  readonly id: number;
  title: string;
  content: string;
  tags?: string[];          // Optional
  readonly author: string;
}

const article: Article = {
  id: 1,
  title: "TypeScript Guide",
  content: "...",
  author: "Alice"
};
// article.id = 2;  // ❌ Error: Cannot assign to 'id' because it is read-only

// Index signatures — dynamic keys
interface StringMap {
  [key: string]: string;
}
const headers: StringMap = {
  "Content-Type": "application/json",
  "Authorization": "Bearer token123"
};`,
      exercise: `**Mini Exercise:**
1. Create an \`interface User\` and a \`type User\` — observe that both work for object shapes
2. Extend an interface with \`extends\` and create an equivalent using \`&\` intersection
3. Use declaration merging to add a custom property to the global \`Window\` interface
4. Create a type alias for a union of string literals (e.g., HTTP methods)
5. Create an interface with \`readonly\` and optional (\`?\`) properties — try modifying them`,
      commonMistakes: [
        "Thinking interfaces and type aliases are completely interchangeable — type aliases can represent unions, tuples, and primitives; interfaces cannot",
        "Not knowing about declaration merging — interfaces with the same name in the same scope are automatically merged, which can cause surprising behavior",
        "Using `&` (intersection) when `extends` would give clearer error messages — intersection conflicts produce confusing types",
        "Confusing `readonly` with deep immutability — `readonly` only prevents reassignment of the property itself, not mutation of nested objects",
        "Over-using index signatures `[key: string]: any` — this weakens type safety; use `Record<string, SpecificType>` or a proper interface instead",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the key differences between `interface` and `type` in TypeScript?",
          a: "1) **Declaration merging**: interfaces merge, types don't. 2) **Union/intersection**: only types can create unions (`A | B`). 3) **Extends**: interfaces use `extends`, types use `&`. 4) **Primitives/tuples/functions**: only types can alias these. 5) **Error messages**: interfaces produce clearer errors. In practice, use interfaces for object shapes and public APIs, types for unions and complex type operations.",
        },
        {
          type: "tricky",
          q: "What happens if you declare the same interface name twice?",
          a: "TypeScript **merges** them (declaration merging). Both declarations are combined into a single interface. This is how library type definitions extend built-in types (e.g., adding properties to `Window` or `Express.Request`). Type aliases would produce a duplicate identifier error.",
        },
        {
          type: "coding",
          q: "Create a type-safe configuration object that requires `apiUrl` but optionally accepts `timeout` and `retries`.",
          a: "```ts\\ninterface AppConfig {\\n  apiUrl: string;\\n  timeout?: number;\\n  retries?: number;\\n  headers?: Record<string, string>;\\n}\\n\\nfunction createClient(config: AppConfig) {\\n  const { apiUrl, timeout = 5000, retries = 3 } = config;\\n  // ...\\n}\\n```",
        },
        {
          type: "conceptual",
          q: "What does `readonly` do on an interface property? Is it deep or shallow?",
          a: "`readonly` prevents reassignment of the property itself at compile time. It's **shallow** — you can still mutate nested objects/arrays. `readonly items: string[]` prevents `obj.items = newArray` but allows `obj.items.push('new')`. For deep immutability, use `Readonly<T>` recursively or libraries like Immer.",
        },
        {
          type: "scenario",
          q: "You're designing a public API SDK in TypeScript. Should you use interfaces or type aliases for your exported types?",
          a: "Use **interfaces** for public APIs. Reasons: 1) Consumers can extend them for their needs. 2) Declaration merging allows augmenting without modifying source. 3) Better error messages. 4) Follows TypeScript team's recommendation. Use types internally for unions, mapped types, and computed types that consumers shouldn't extend.",
        },
      ],
    },
    {
      id: "unions-intersections-literals",
      title: "Union, Intersection & Literal Types",
      explanation: `**Union types** (\`A | B\`) represent values that can be ONE OF several types. Think of it as "either/or".
**Intersection types** (\`A & B\`) combine multiple types into one that has ALL properties. Think of it as "both/and".
**Literal types** narrow a type to a specific value — not just \`string\`, but exactly \`"hello"\`.

**Union types** are everywhere in production TypeScript:
- API response states: \`"loading" | "success" | "error"\`
- Function parameters: \`string | number\`
- Nullable values: \`string | null\`

**Intersection types** combine shapes:
- \`User & Admin\` = an object with ALL properties from both
- Used for mixins, extending types, and combining capabilities

**Literal types** give extreme precision:
- \`"GET" | "POST" | "PUT" | "DELETE"\` — only these exact strings are allowed
- \`1 | 2 | 3\` — only these exact numbers
- Combined with unions, they create **discriminated unions** — one of TypeScript's most powerful patterns

**Discriminated Unions:** A union where each member has a common property (the "discriminant") with a unique literal type. TypeScript uses this to narrow the union in switch/if statements.

🏠 **Real-world analogy:** A union type is like a parking space labeled "Cars OR Motorcycles" — it accepts either. An intersection type is like a job requirement "Must have Engineering AND MBA" — need both. Literal types are like a vending machine button for a specific item — only that exact selection works.`,
      codeExample: `// Union types — either/or
type StringOrNumber = string | number;
function format(value: StringOrNumber): string {
  if (typeof value === "string") {
    return value.toUpperCase();  // TS knows it's string here
  }
  return value.toFixed(2);       // TS knows it's number here
}

// Literal types — exact values
type Direction = "north" | "south" | "east" | "west";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

function move(direction: Direction): void {
  console.log(\`Moving \${direction}\`);
}
move("north"); // ✅
// move("up"); // ❌ Argument of type '"up"' is not assignable

// Intersection types — combine all properties
interface HasName { name: string; }
interface HasAge { age: number; }
interface HasEmail { email: string; }

type Person = HasName & HasAge;
type ContactablePerson = Person & HasEmail;

const person: ContactablePerson = {
  name: "Alice",
  age: 30,
  email: "alice@example.com"
};

// ⭐ Discriminated Union — TypeScript's killer pattern
type LoadingState = { status: "loading" };
type SuccessState = { status: "success"; data: string[] };
type ErrorState   = { status: "error"; error: Error };

type RequestState = LoadingState | SuccessState | ErrorState;

function renderUI(state: RequestState): string {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return \`Got \${state.data.length} items\`; // TS knows data exists!
    case "error":
      return \`Error: \${state.error.message}\`;  // TS knows error exists!
  }
}

// Nullable types (with strictNullChecks)
function findUser(id: number): User | null {
  // might return null if not found
  return id > 0 ? { id, name: "Alice", email: "", createdAt: new Date() } : null;
}
const user = findUser(1);
// user.name;  // ❌ Error: 'user' is possibly 'null'
if (user) {
  user.name; // ✅ After null check, TS narrows to User
}

// Template literal types (powerful with unions!)
type Color = "red" | "blue" | "green";
type Size = "sm" | "md" | "lg";
type ClassName = \`\${Color}-\${Size}\`; // "red-sm" | "red-md" | ... (9 combos!)`,
      exercise: `**Mini Exercise:**
1. Create a discriminated union for shapes (Circle, Square, Triangle) and write an area calculator with exhaustive switch
2. Create a type that represents all HTTP methods as string literals
3. Use intersection types to combine \`Serializable\` and \`Validatable\` interfaces
4. Create a template literal type for CSS class names like \`"text-sm"\`, \`"text-md"\`, \`"text-lg"\`
5. Write a function that takes \`string | number | boolean\` and handles each case with type narrowing`,
      commonMistakes: [
        "Confusing `|` (union — either) with `&` (intersection — both) — they are opposite operations on types, not the same as logical OR/AND on values",
        "Not handling all cases in a discriminated union — use `never` in the default case for exhaustiveness checking",
        "Thinking intersection of primitives works like union — `string & number` is `never` because no value can be both",
        "Forgetting that `null` and `undefined` are separate types in strict mode — `string | null` and `string | undefined` are different",
        "Using union types when a discriminated union would be safer — always prefer tagged unions for state management",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is a discriminated union and why is it so powerful in TypeScript?",
          a: "A discriminated union is a union of object types where each member has a common property (discriminant) with a unique literal type value. TypeScript uses the discriminant in `switch`/`if` to automatically narrow the type, giving you access to member-specific properties. It eliminates `as` casts, prevents impossible states, and enables exhaustiveness checking.",
        },
        {
          type: "tricky",
          q: "What is the type of `string & number`?",
          a: "`never`. No value can simultaneously be a string AND a number. When you intersect incompatible types, the result is `never` — the empty type with no values. This is useful for detecting impossible states at compile time.",
        },
        {
          type: "coding",
          q: "Write an exhaustive switch that handles a discriminated union and errors at compile time if a case is missing.",
          a: "```ts\\ntype Shape =\\n  | { kind: 'circle'; radius: number }\\n  | { kind: 'square'; side: number };\\n\\nfunction area(shape: Shape): number {\\n  switch (shape.kind) {\\n    case 'circle': return Math.PI * shape.radius ** 2;\\n    case 'square': return shape.side ** 2;\\n    default: {\\n      const _exhaustive: never = shape;\\n      return _exhaustive; // Compile error if a case is missing\\n    }\\n  }\\n}\\n```",
        },
        {
          type: "conceptual",
          q: "What are template literal types and how are they useful?",
          a: 'Template literal types use backtick syntax at the type level: `` type Route = \\`/api/\\${string}\\` ``. Combined with unions, they create all combinations: `type Event = \\`on\\${\\"Click\\" | \\"Hover\\"}\\`` = `"onClick" | "onHover"`. Used in React event types, CSS-in-JS, API route typing, and any string pattern where you want type-safe templates.',
        },
        {
          type: "scenario",
          q: "You're modeling API responses that can be success or various error types. How would you type this?",
          a: "Use a discriminated union with a `status` discriminant: ```ts\\ntype ApiResponse<T> =\\n  | { status: 'success'; data: T }\\n  | { status: 'error'; code: number; message: string }\\n  | { status: 'unauthorized'; redirectUrl: string };\\n```\\nThis prevents accessing `data` before checking `status`, eliminates impossible states, and makes error handling exhaustive.",
        },
      ],
    },
    {
      id: "functions-and-overloads",
      title: "Functions, Overloads & Typing Patterns",
      explanation: `TypeScript provides rich typing for functions — from basic parameter/return types to generics, overloads, and advanced patterns like \`this\` typing.

**Function type expressions:** \`(param: Type) => ReturnType\`
**Optional and default parameters:** \`param?: Type\` or \`param: Type = defaultValue\`
**Rest parameters:** \`...args: Type[]\`
**Function overloads:** Multiple signatures for different input/output combinations

**Function Overloads** let you define multiple call signatures for a single function. The compiler chooses the right signature based on the arguments. The implementation signature must be compatible with ALL overload signatures.

**\`this\` typing:** TypeScript can type the \`this\` parameter explicitly — useful for callbacks that need a specific context.

**Callback typing patterns:**
- \`(data: T) => void\` — Standard callback
- \`(err: Error | null, data?: T) => void\` — Node.js error-first callback
- \`() => Promise<T>\` — Async factory

🏠 **Real-world analogy:** Function overloads are like a Swiss Army knife — the same tool (function name) provides different tools (behavior) depending on how you open it (what arguments you pass).`,
      codeExample: `// Basic function typing
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function type
const multiply: (a: number, b: number) => number = (a, b) => a * b;

// Optional and default parameters
function greet(name: string, greeting: string = "Hello"): string {
  return \`\${greeting}, \${name}!\`;
}
greet("Alice");           // "Hello, Alice!"
greet("Alice", "Hola");  // "Hola, Alice!"

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

// ⭐ Function Overloads
function createElement(tag: "a"): HTMLAnchorElement;
function createElement(tag: "canvas"): HTMLCanvasElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}
const anchor = createElement("a");    // Type: HTMLAnchorElement
const canvas = createElement("canvas"); // Type: HTMLCanvasElement

// Practical overload: different return based on input
function parseInput(input: string): string;
function parseInput(input: number): number;
function parseInput(input: string | number): string | number {
  if (typeof input === "string") return input.trim();
  return Math.round(input);
}

// Typing 'this'
interface Button {
  label: string;
  onClick(this: Button): void;
}
const button: Button = {
  label: "Submit",
  onClick() {
    console.log(this.label); // 'this' is typed as Button
  }
};

// Generic function (preview — deep dive in Phase 2)
function identity<T>(value: T): T {
  return value;
}
const str = identity("hello"); // Type: string
const num = identity(42);       // Type: number

// Function type with generics
type Mapper<T, U> = (item: T, index: number) => U;
const toLength: Mapper<string, number> = (s) => s.length;

// Void vs undefined return
type VoidFn = () => void;
const fn: VoidFn = () => { return true; }; // ✅ No error! void ignores return
// This is intentional — allows array.forEach() to accept callbacks that return values`,
      exercise: `**Mini Exercise:**
1. Write overloaded function signatures for a \`format\` function that accepts string → string or number → string
2. Create a typed callback pattern: \`function fetchData(url: string, cb: (err: Error | null, data?: string) => void)\`
3. Type a method with explicit \`this\` parameter for a class-like object
4. Write a generic identity function and observe how TypeScript infers \`T\`
5. Explain why \`() => void\` allows returning values but \`() => undefined\` does not`,
      commonMistakes: [
        "Confusing the overload signatures with the implementation — the implementation signature is NOT callable directly; only the overload signatures are visible to callers",
        "Thinking `() => void` means 'returns undefined' — `void` means the return value is IGNORED, not that it must be `undefined`. Callbacks typed as `void` can return anything",
        "Forgetting that optional parameters must come after required ones — `(a?: string, b: number)` is invalid",
        "Not typing `this` in callbacks that depend on context — leads to runtime errors when `this` is the wrong object",
        "Over-using overloads when a union parameter or generic would be simpler — overloads should be a last resort for complex input/output mappings",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are function overloads in TypeScript and when should you use them?",
          a: "Overloads define multiple call signatures for one function, letting TypeScript select the correct return type based on input types. Use when: the return type depends on the input type in ways a generic can't express. Example: `createElement('a')` returns `HTMLAnchorElement`, `createElement('div')` returns `HTMLDivElement`. Don't use for simple unions — generics are usually cleaner.",
        },
        {
          type: "tricky",
          q: "Why does TypeScript allow returning a value from a function typed as `() => void`?",
          a: "By design. `void` in a callback position means 'the return value will be IGNORED', not 'must return nothing'. This allows `Array.forEach(callback)` to accept callbacks like `(item) => array.push(item)` where `.push()` returns a number. If `void` was strict, many common patterns would break.",
        },
        {
          type: "coding",
          q: "Write a type-safe event emitter with typed event names and payloads.",
          a: "```ts\\ninterface EventMap {\\n  login: { userId: string };\\n  logout: void;\\n  error: { message: string; code: number };\\n}\\n\\nfunction on<K extends keyof EventMap>(\\n  event: K,\\n  handler: (payload: EventMap[K]) => void\\n): void {\\n  // ...\\n}\\n\\non('login', (payload) => {\\n  console.log(payload.userId); // ✅ Type-safe!\\n});\\n```",
        },
        {
          type: "conceptual",
          q: "What is the difference between `(a: string) => void` and `(a: string) => undefined`?",
          a: "`() => void` means the return value is ignored — the function CAN return anything, but callers shouldn't use it. `() => undefined` means the function MUST return `undefined` (or return nothing). `void` is used for callbacks where you don't care about the return; `undefined` is used when you explicitly need `undefined`.",
        },
        {
          type: "scenario",
          q: "You're building a utility that wraps `fetch` calls. How would you type it to return different types based on the URL pattern?",
          a: "Use function overloads or generic constraints: ```ts\\nfunction api<T>(url: string): Promise<T>;\\nfunction api(url: '/users'): Promise<User[]>;\\nfunction api(url: '/users/:id'): Promise<User>;\\nasync function api(url: string): Promise<unknown> {\\n  const res = await fetch(url);\\n  return res.json();\\n}\\n``` Or better: use a generic with a URL-to-type map for full type safety.",
        },
      ],
    },
    {
      id: "enums-tuples-special-types",
      title: "Enums, Tuples & Special Types",
      explanation: `**Enums** define a set of named constants. TypeScript has **numeric enums**, **string enums**, and **const enums**.

**Tuples** are fixed-length arrays where each position has a specific type. They're like arrays with a known structure.

**Special types** round out TypeScript's type system — \`as const\`, assertion functions, branded types, and more.

**Enum debate:** Many TypeScript experts (including the TS team) now recommend **union literal types** or **\`as const\` objects** over enums because:
- Enums generate runtime JavaScript code (they're not type-only)
- \`const enum\` is fragile across module boundaries
- Union literals are zero-cost and tree-shakeable

**Tuples** are critical for:
- React hooks: \`useState\` returns \`[T, SetterFn]\`
- Coordinate data: \`[number, number]\`
- Function overloads with variadic args
- Named tuples for readability: \`[name: string, age: number]\`

**\`as const\`** creates the narrowest possible type — all properties become \`readonly\` and values become literal types. This is how you create type-safe constant objects.

🏠 **Real-world analogy:** An enum is like a menu with numbered items — "1. Coffee, 2. Tea, 3. Water". \`as const\` is like a menu printed on a brass plaque — it's fixed, permanent, and everyone sees exactly the same options.`,
      codeExample: `// Numeric Enum (auto-increments from 0)
enum Direction {
  Up,     // 0
  Down,   // 1
  Left,   // 2
  Right   // 3
}
console.log(Direction.Up);    // 0
console.log(Direction[0]);    // "Up" (reverse mapping)

// String Enum (recommended over numeric)
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

// ⚠️ Enums generate runtime code:
// var Status;
// (function (Status) {
//   Status["Active"] = "ACTIVE";
//   ...
// })(Status || (Status = {}));

// ✅ Better alternative: union literal types (zero-cost)
type StatusType = "ACTIVE" | "INACTIVE" | "PENDING";

// ✅ Or: as const object (runtime values + type safety)
const STATUS = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Pending: "PENDING"
} as const;
type StatusValue = typeof STATUS[keyof typeof STATUS];
// "ACTIVE" | "INACTIVE" | "PENDING"

// Tuples — fixed length, typed positions
let point: [number, number] = [10, 20];
let entry: [string, number] = ["age", 30];

// Named tuples (TypeScript 4.0+) — for readability
type UserTuple = [name: string, age: number, active: boolean];
const user: UserTuple = ["Alice", 30, true];

// Rest elements in tuples
type StringAndNumbers = [string, ...number[]];
const data: StringAndNumbers = ["scores", 90, 85, 95];

// React useState pattern
function useState<T>(initial: T): [T, (value: T) => void] {
  let state = initial;
  const setState = (value: T) => { state = value; };
  return [state, setState];
}
const [count, setCount] = useState(0); // Properly typed!

// as const — creates the narrowest type
const CONFIG = {
  api: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  methods: ["GET", "POST"]  // readonly ["GET", "POST"], not string[]
} as const;
// CONFIG.timeout = 10000;  // ❌ Error: readonly
// type: { readonly api: "https://..."; readonly timeout: 5000; ... }

// Const assertions with arrays
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = typeof ROLES[number]; // "admin" | "editor" | "viewer"

// Assertion functions
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(\`Expected string, got \${typeof value}\`);
  }
}
function process(input: unknown) {
  assertIsString(input);
  console.log(input.toUpperCase()); // TS knows input is string!
}`,
      exercise: `**Mini Exercise:**
1. Create both an enum and an \`as const\` object for roles — compare the compiled JavaScript output
2. Declare a tuple type for a database row: \`[id: number, name: string, email: string, active: boolean]\`
3. Use \`as const\` to create a readonly config object and derive a union type from its values
4. Write an assertion function \`assertNonNull<T>(value: T | null): asserts value is T\`
5. Use rest elements in a tuple: \`[first: string, ...rest: number[]]\``,
      commonMistakes: [
        "Using numeric enums with `0` as a value — `0` is falsy, leading to bugs like `if (role)` failing for the first enum member",
        "Not knowing enums generate runtime JavaScript — unlike types/interfaces, enums are NOT erased at compile time",
        "Using `const enum` across module boundaries — it can cause issues with declaration files and some bundlers (e.g., isolatedModules)",
        "Thinking tuples can have any length — tuples have a FIXED length; TypeScript will error if you try to access beyond the declared positions",
        "Forgetting `as const` on object literals — without it, `{ role: 'admin' }` has type `{ role: string }` instead of `{ role: 'admin' }`",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Should you use enums or union literal types in TypeScript? Why?",
          a: "Prefer **union literal types** or **`as const` objects** over enums. Reasons: 1) Enums generate runtime code (not type-erased). 2) `const enum` has bundler compatibility issues. 3) Union literals are zero-cost and tree-shakeable. 4) `as const` gives you both runtime values AND type safety. Enums are fine in existing codebases, but new code should prefer alternatives.",
        },
        {
          type: "tricky",
          q: "What is `as const` and how does it change the inferred type?",
          a: "`as const` applies the narrowest/deepest immutability: 1) All properties become `readonly`. 2) Literal values stay literal (e.g., `42` not `number`, `\"hello\"` not `string`). 3) Arrays become `readonly` tuples. 4) Objects are deeply readonly. It's a const assertion — tells TS 'this value will never change'. Essential for deriving union types from runtime objects.",
        },
        {
          type: "coding",
          q: "Derive a union type from the values of a constant object using `as const`.",
          a: "```ts\\nconst HTTP_METHODS = {\\n  Get: 'GET',\\n  Post: 'POST',\\n  Put: 'PUT',\\n  Delete: 'DELETE'\\n} as const;\\n\\ntype HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];\\n// 'GET' | 'POST' | 'PUT' | 'DELETE'\\n```",
        },
        {
          type: "conceptual",
          q: "What are named tuples and labeled tuple elements?",
          a: "Named tuples (TS 4.0+) add labels to tuple positions for documentation: `type Point = [x: number, y: number, z: number]`. The labels don't affect runtime behavior but appear in IDE hints and error messages, making code much more readable. They're especially useful for function parameter types and destructured returns.",
        },
        {
          type: "scenario",
          q: "How would you create a type-safe constant configuration that's accessible at both runtime and compile time?",
          a: "Use `as const` with derived types: ```ts\\nconst CONFIG = { maxRetries: 3, timeout: 5000, env: 'production' } as const;\\ntype Config = typeof CONFIG;\\ntype ConfigKey = keyof Config;\\ntype ConfigValue = Config[ConfigKey];\\n```\\nYou get: runtime access (`CONFIG.timeout`), type narrowing (literal types), and readonly protection — all without enums or duplicate declarations.",
        },
      ],
    },
  ],
};

export default tsPhase1;
