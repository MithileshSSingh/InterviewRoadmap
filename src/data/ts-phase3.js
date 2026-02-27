const tsPhase3 = {
  id: "phase-3",
  title: "Phase 3: Advanced Type System",
  emoji: "🟠",
  description: "Go deep into TypeScript's type-level programming — conditional types, mapped types, infer, template literals, variance, and recursive types.",
  topics: [
    {
      id: "conditional-types-infer",
      title: "Conditional Types & the infer Keyword",
      explanation: `**Conditional types** are TypeScript's if/else at the type level: \`T extends U ? TrueType : FalseType\`.

They let you create types that choose different outputs based on input types — the foundation of advanced type manipulation.

**The \`infer\` keyword** declares a type variable INSIDE a conditional type that TypeScript infers for you. It's like a capture group in regex — it extracts a type from a pattern.

**Key patterns with \`infer\`:**
- \`T extends Promise<infer R> ? R : T\` — Unwrap a Promise
- \`T extends (...args: infer P) => infer R ? R : never\` — Extract return type
- \`T extends [infer First, ...infer Rest] ? First : never\` — Extract array first element

**Distributive conditional types:** When a conditional type is applied to a union, it distributes — applying the condition to EACH member of the union separately. \`T extends U ? X : Y\` applied to \`A | B\` becomes \`(A extends U ? X : Y) | (B extends U ? X : Y)\`.

This distribution is what makes \`Exclude<T, U>\` work: \`Exclude<'a' | 'b' | 'c', 'a'>\` distributes and removes \`'a'\`.

🏠 **Real-world analogy:** Conditional types are like a sorting machine. Items go in, and based on their properties, they exit through different chutes. \`infer\` is like an X-ray scanner inside the machine that reads what's inside a package without opening it.`,
      codeExample: `// Basic conditional type
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"

// Practical: unwrap a Promise
type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
type Result1 = UnwrapPromise<Promise<string>>;  // string
type Result2 = UnwrapPromise<number>;           // number (not a Promise)

// Deeply unwrap nested Promises
type DeepUnwrap<T> = T extends Promise<infer R> ? DeepUnwrap<R> : T;
type Deep = DeepUnwrap<Promise<Promise<Promise<number>>>>; // number

// Extract return type (how ReturnType works internally)
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type FnReturn = MyReturnType<(x: number) => string>; // string

// Extract function parameters (how Parameters works internally)
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
type FnParams = MyParameters<(a: string, b: number) => void>;
// [a: string, b: number]

// Extract array element type
type ElementOf<T> = T extends (infer E)[] ? E : never;
type Item = ElementOf<string[]>;    // string
type Items = ElementOf<(string | number)[]>; // string | number

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;
type Distributed = ToArray<string | number>;
// string[] | number[]  (NOT (string | number)[])

// Non-distributive: wrap in tuple to prevent distribution
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type NonDist = ToArrayNonDist<string | number>;
// (string | number)[]

// Practical: extract event handler payload
type ExtractPayload<T> = T extends { type: string; payload: infer P } ? P : never;

type ClickEvent = { type: "click"; payload: { x: number; y: number } };
type LoginEvent = { type: "login"; payload: { userId: string } };

type ClickPayload = ExtractPayload<ClickEvent>; // { x: number; y: number }
type LoginPayload = ExtractPayload<LoginEvent>; // { userId: string }

// infer with constraints (TS 4.7+)
type FirstString<T> = T extends [infer S extends string, ...any[]] ? S : never;
type FS = FirstString<["hello", 42]>; // "hello"
// type FN = FirstString<[42, "hi"]>; // never (first isn't string)`,
      exercise: `**Mini Exercise:**
1. Write \`UnwrapArray<T>\` that extracts the element type from an array type
2. Create \`IsNever<T>\` that returns \`true\` if T is \`never\`, \`false\` otherwise (tricky!)
3. Build \`ExtractPromiseChain<T>\` that deeply unwraps nested Promises
4. Write \`FunctionReturnType<T>\` that works like the built-in \`ReturnType\`
5. Create \`Head<T>\` and \`Tail<T>\` types for tuple types using \`infer\``,
      commonMistakes: [
        "Not understanding distributive behavior — `T extends any ? T[] : never` distributes over unions, which might not be what you want",
        "Forgetting to wrap in tuple `[T]` to prevent distribution — `[T] extends [U]` prevents the union from being split",
        "Using `infer` outside of conditional types — `infer` ONLY works in the `extends` clause of a conditional type",
        "Making conditional types too deeply nested — if you need 5+ levels, consider breaking into smaller named types",
        "Not realizing that `never` distributes to `never` — `Conditional<never>` often returns `never` unexpectedly because `never` is the empty union"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are conditional types and how do they work?",
          a: "Conditional types follow the pattern `T extends U ? X : Y`. If `T` is assignable to `U`, the type resolves to `X`, otherwise `Y`. They're TypeScript's type-level ternary operator. When applied to union types, they distribute — each union member is checked independently. They're the basis for utility types like `Exclude`, `Extract`, and `ReturnType`."
        },
        {
          type: "tricky",
          q: "What is the `infer` keyword and where can it be used?",
          a: "`infer` declares a type variable that TypeScript infers from a pattern. It can ONLY be used inside the `extends` clause of a conditional type. Example: `T extends Promise<infer R> ? R : T` — if T is a Promise, `R` captures what's inside. Think of it as pattern matching: you describe the shape, and `infer` captures the unknown parts."
        },
        {
          type: "coding",
          q: "Implement `Awaited<T>` that recursively unwraps Promises.",
          a: "```ts\\ntype Awaited<T> = T extends Promise<infer R>\\n  ? Awaited<R>  // Recursively unwrap\\n  : T;          // Base case: not a Promise\\n\\ntype A = Awaited<Promise<string>>;                    // string\\ntype B = Awaited<Promise<Promise<number>>>;            // number\\ntype C = Awaited<Promise<Promise<Promise<boolean>>>>;  // boolean\\ntype D = Awaited<string>;                              // string\\n```"
        },
        {
          type: "tricky",
          q: "Why does `Exclude<'a' | 'b' | 'c', 'a'>` work?",
          a: "`Exclude` is defined as `T extends U ? never : T`. With union input, it distributes: `('a' extends 'a' ? never : 'a') | ('b' extends 'a' ? never : 'b') | ('c' extends 'a' ? never : 'c')` = `never | 'b' | 'c'` = `'b' | 'c'`. Distribution + `never` (which disappears from unions) is the mechanism."
        },
        {
          type: "scenario",
          q: "How would you use conditional types to create a type-safe event system?",
          a: "```ts\\ninterface EventMap {\\n  click: { x: number; y: number };\\n  submit: { data: FormData };\\n  error: { message: string };\\n}\\n\\ntype EventPayload<K extends keyof EventMap> = EventMap[K];\\ntype EventHandler<K extends keyof EventMap> = (payload: EventPayload<K>) => void;\\n\\nfunction on<K extends keyof EventMap>(\\n  event: K,\\n  handler: EventHandler<K>\\n): void { /* ... */ }\\n\\non('click', ({ x, y }) => { }); // ✅ Type-safe payload\\n```"
        }
      ]
    },
    {
      id: "mapped-types-template-literals",
      title: "Mapped Types & Template Literal Types",
      explanation: `**Mapped types** iterate over keys of a type and transform each property — they're the \`for...in\` loop of the type system. All utility types like \`Partial\`, \`Readonly\`, and \`Pick\` are built with mapped types.

**Syntax:** \`{ [K in keyof T]: NewType }\`

**Key modifiers:**
- \`?\` / \`-?\` — Add or remove optional
- \`readonly\` / \`-readonly\` — Add or remove readonly
- \`as NewKey\` — Remap keys (TS 4.1+)

**Template literal types** bring string manipulation to the type level: \`\\\`hello-\\\${string}\\\`\`. Combined with unions, they generate all string combinations at compile time.

**Key template literal utilities:** \`Uppercase\`, \`Lowercase\`, \`Capitalize\`, \`Uncapitalize\`

**Mapped types + template literals** together enable extremely powerful patterns:
- Generating getter/setter method names from property names
- Creating event name types from state keys
- Building CSS class name types
- Type-safe i18n keys

🏠 **Real-world analogy:** Mapped types are like a stamping machine on an assembly line. Each item (property) that passes through gets the same modification (transformation). Template literal types are like a label printer — you feed in variables and get formatted labels.`,
      codeExample: `// Basic mapped type (how Partial works internally)
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Remove optional (Required internally)
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// Make all properties readonly
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Remove readonly
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// Transform value types
type Stringify<T> = {
  [K in keyof T]: string;
};
type Nullify<T> = {
  [K in keyof T]: T[K] | null;
};

// ⭐ Key remapping with 'as' (TS 4.1+)
interface User {
  name: string;
  age: number;
  email: string;
}

// Generate getter names
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; getEmail: () => string }

// Generate event handler names
type OnChangeHandlers<T> = {
  [K in keyof T as \`on\${Capitalize<string & K>}Change\`]: (value: T[K]) => void;
};
type UserHandlers = OnChangeHandlers<User>;
// { onNameChange: (value: string) => void; onAgeChange: ... }

// Filter keys by value type
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};
type StringProps = StringKeysOnly<User>;
// { name: string; email: string }  (age removed!)

// Template literal types
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiRoute = \`/api/\${string}\`;
type TypedRoute = \`/api/\${"users" | "posts" | "comments"}\`;
// "/api/users" | "/api/posts" | "/api/comments"

// Cartesian product with template literals
type Color = "red" | "blue" | "green";
type Size = "sm" | "md" | "lg";
type ClassName = \`\${Color}-\${Size}\`;
// "red-sm" | "red-md" | "red-lg" | "blue-sm" | ... (9 combinations)

// Built-in string transformers
type Greeting = "hello world";
type Upper = Uppercase<Greeting>;     // "HELLO WORLD"
type Lower = Lowercase<"HELLO">;      // "hello"
type Cap = Capitalize<"hello">;       // "Hello"
type Uncap = Uncapitalize<"Hello">;   // "hello"

// Practical: derive event names from object keys
type EventNames<T> = {
  [K in keyof T]: \`on\${Capitalize<string & K>}\`;
}[keyof T];
type UserEvents = EventNames<User>;
// "onName" | "onAge" | "onEmail"`,
      exercise: `**Mini Exercise:**
1. Implement \`MyPick<T, K>\` using a mapped type
2. Create \`Nullable<T>\` that makes all properties \`T[K] | null\`
3. Use key remapping to create \`Setters<T>\` — \`setName(value: string): void\`
4. Build a template literal type for CSS utility classes like \`"text-sm"\`, \`"bg-red"\`, etc.
5. Create \`FilterByType<T, U>\` that keeps only properties of type U`,
      commonMistakes: [
        "Forgetting `string & K` when using `Capitalize` in key remapping — `keyof T` can include `symbol`, which can't be capitalized",
        "Not understanding that mapped types create NEW types — they don't modify the original; types are always immutable",
        "Using `as never` in key remapping to filter — this is correct behavior (never keys are removed), but it's confusing at first",
        "Template literal type explosion — combining large unions creates a cartesian product that can slow the compiler",
        "Confusing mapped types with index signatures — `{ [K in keyof T]: T[K] }` iterates known keys; `{ [key: string]: T }` accepts any string key"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are mapped types and how do they work?",
          a: "Mapped types iterate over the keys of a type with `[K in keyof T]` and create a new type with transformed properties. You can change modifiers (`?`, `readonly`), transform value types, and remap keys with `as`. They're TypeScript's type-level `for...in` loop. `Partial<T>` = `{ [K in keyof T]?: T[K] }`. All built-in utility types use mapped types internally."
        },
        {
          type: "coding",
          q: "Create a mapped type `DeepReadonly<T>` that recursively makes all properties readonly.",
          a: "```ts\\ntype DeepReadonly<T> = {\\n  readonly [K in keyof T]: T[K] extends object\\n    ? T[K] extends Function\\n      ? T[K]  // Don't make functions readonly\\n      : DeepReadonly<T[K]>\\n    : T[K];\\n};\\n\\ntype Config = DeepReadonly<{\\n  api: { url: string; timeout: number };\\n  features: { darkMode: boolean };\\n}>;\\n// All nested properties are readonly\\n```"
        },
        {
          type: "tricky",
          q: "What happens when you remap a key to `never` in a mapped type?",
          a: "The property is removed from the resulting type. This is the mechanism for filtering properties: `{ [K in keyof T as T[K] extends string ? K : never]: T[K] }` keeps only string-valued properties. Keys mapped to `never` simply don't appear in the output type."
        },
        {
          type: "conceptual",
          q: "How do template literal types work with unions?",
          a: "Template literals with union type variables create a cartesian product of all combinations. `` `${A}${B}` `` where `A = 'a' | 'b'` and `B = '1' | '2'` produces `'a1' | 'a2' | 'b1' | 'b2'`. This is used for generating CSS class names, event names, API routes, and other string-based patterns at the type level."
        },
        {
          type: "scenario",
          q: "How would you create type-safe CSS-in-JS style props using mapped types and template literals?",
          a: "```ts\\ntype CSSProperty = 'margin' | 'padding' | 'font';\\ntype CSSDirection = 'Top' | 'Right' | 'Bottom' | 'Left';\\n\\ntype SpacingProp = `${CSSProperty}${CSSDirection}` | CSSProperty;\\n// 'marginTop' | 'marginRight' | ... | 'margin' | 'padding' | 'font'\\n\\ntype StyleProps = { [K in SpacingProp]?: string | number };\\n// Type-safe style object with all valid CSS property combinations\\n```"
        }
      ]
    },
    {
      id: "discriminated-unions-exhaustive",
      title: "Discriminated Unions & Exhaustive Checks",
      explanation: `**Discriminated unions** (tagged unions) are a pattern where each member of a union has a common property (the discriminant/tag) with a unique literal type. TypeScript uses this tag to automatically narrow the type.

This is arguably **TypeScript's most important pattern for production code** — it models state machines, API responses, events, and domain logic with complete type safety.

**Exhaustiveness checking** ensures you handle ALL cases. If you add a new variant to the union, TypeScript will error everywhere a case is missing. This prevents bugs when expanding state machines.

**The \`never\` trick:** In the \`default\` case, assign the narrowed value to a \`never\` variable. If all cases aren't handled, the value ISN'T \`never\`, causing a compile error.

**Real-world applications:**
- Redux/useReducer action types
- API response states (loading/success/error)
- Form validation results
- AST node types
- State machines (idle → loading → success/error)

🏠 **Real-world analogy:** A discriminated union is like a labeled package system. Every package has a "type" sticker — "fragile", "heavy", or "perishable". Workers check the sticker and handle each type differently. If a new type "hazardous" is added, the system flags any worker who doesn't handle it.`,
      codeExample: `// Classic discriminated union — state management
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error; retryCount: number };

function renderUI<T>(state: RequestState<T>): string {
  switch (state.status) {
    case "idle":
      return "Press Start";
    case "loading":
      return "Loading...";
    case "success":
      return \`Got data: \${JSON.stringify(state.data)}\`;
    case "error":
      return \`Error: \${state.error.message} (retry \${state.retryCount})\`;
    // If you miss a case, TypeScript warns!
  }
}

// ⭐ Exhaustiveness check with never
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default: {
      // If you add a new shape but forget the case, this errors!
      const _exhaustive: never = shape;
      throw new Error(\`Unhandled shape: \${JSON.stringify(_exhaustive)}\`);
    }
  }
}

// Utility function for exhaustive checks
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? \`Unexpected value: \${JSON.stringify(value)}\`);
}

// Redux-style action types
type Action =
  | { type: "ADD_TODO"; payload: { text: string } }
  | { type: "TOGGLE_TODO"; payload: { id: number } }
  | { type: "REMOVE_TODO"; payload: { id: number } }
  | { type: "SET_FILTER"; payload: { filter: "all" | "active" | "done" } };

interface Todo { id: number; text: string; done: boolean; }

function todoReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { id: Date.now(), text: action.payload.text, done: false }];
    case "TOGGLE_TODO":
      return state.map(t =>
        t.id === action.payload.id ? { ...t, done: !t.done } : t
      );
    case "REMOVE_TODO":
      return state.filter(t => t.id !== action.payload.id);
    case "SET_FILTER":
      return state; // filter applied in selector
    default:
      return assertNever(action); // Catches missing cases!
  }
}

// Result type — functional error handling
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}

const result = divide(10, 3);
if (result.ok) {
  console.log(result.value.toFixed(2)); // TS knows value exists
} else {
  console.error(result.error.toUpperCase()); // TS knows error exists
}

// Tree/AST node types
type Expr =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "binary"; op: "+" | "-" | "*" | "/"; left: Expr; right: Expr }
  | { type: "unary"; op: "-" | "!"; operand: Expr };`,
      exercise: `**Mini Exercise:**
1. Create a discriminated union for payment methods (CreditCard, PayPal, BankTransfer) and write a \`processPayment\` function
2. Implement the \`assertNever\` utility and use it in a switch
3. Model an async state machine: Idle → Loading → Success/Error, with \`retry\` from Error back to Loading
4. Create a \`Result<T, E>\` type and write functions that chain Results
5. Add a new variant to an existing union and observe where TypeScript reports missing cases`,
      commonMistakes: [
        "Forgetting the exhaustive check in the default case — without `assertNever`, adding new variants won't cause compile errors",
        "Using `string` instead of literal types for the discriminant — `status: string` doesn't narrow; must be `status: \"loading\"` (literal)",
        "Having too many variants in a single union — if your union has 20+ variants, consider grouping them into sub-unions",
        "Not using discriminated unions for state management — plain boolean flags (`isLoading && !isError`) create impossible states",
        "Putting shared properties outside the discriminant check — TypeScript can only access properties common to ALL union members before narrowing"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is a discriminated union and why is it TypeScript's most powerful pattern?",
          a: "A discriminated union has a common property (tag/discriminant) with unique literal types per variant. TS automatically narrows based on the tag. It's powerful because: 1) Prevents impossible states. 2) Exhaustiveness checking catches missing cases at compile time. 3) No type assertions needed. 4) Models state machines, events, and API responses naturally."
        },
        {
          type: "coding",
          q: "Write an exhaustiveness helper function and demonstrate it.",
          a: "```ts\\nfunction assertNever(value: never, msg?: string): never {\\n  throw new Error(msg ?? `Unhandled: ${JSON.stringify(value)}`);\\n}\\n\\ntype Status = 'active' | 'inactive' | 'suspended';\\nfunction getMessage(status: Status): string {\\n  switch (status) {\\n    case 'active': return 'Welcome!';\\n    case 'inactive': return 'Account inactive';\\n    case 'suspended': return 'Account suspended';\\n    default: return assertNever(status);\\n  }\\n}\\n// Add 'deleted' to Status → TS errors on assertNever line\\n```"
        },
        {
          type: "tricky",
          q: "How does TypeScript know which properties are available after checking the discriminant?",
          a: "TypeScript uses **control flow analysis**. When you check `if (state.status === 'success')`, TS narrows the union from the full `RequestState` to only the variant where `status` is `'success'`. In that branch, it knows `data` exists. This narrowing works with `if`, `switch`, ternaries, and even `&&` chains."
        },
        {
          type: "conceptual",
          q: "How do discriminated unions prevent impossible states?",
          a: "With boolean flags: `{ isLoading: true, isError: true, data: null }` is representable but impossible. With discriminated unions: `{ status: 'loading' }` and `{ status: 'error'; error: Error }` are separate variants — you CAN'T have both loading and error simultaneously. The type system prevents impossible combinations."
        },
        {
          type: "scenario",
          q: "How would you model a multi-step form wizard using discriminated unions?",
          a: "```ts\\ntype WizardState =\\n  | { step: 'personal'; data: { name: string } }\\n  | { step: 'address'; data: { name: string; street: string } }\\n  | { step: 'payment'; data: { name: string; street: string; card: string } }\\n  | { step: 'complete'; data: FullFormData };\\n```\\nEach step knows exactly what data is available. Transitions from step N to N+1 require the previous data plus new fields. TypeScript prevents skipping steps or accessing data that hasn't been collected yet."
        }
      ]
    },
    {
      id: "variance-covariance",
      title: "Variance: Covariance & Contravariance",
      explanation: `**Variance** describes how type relationships (subtype/supertype) are preserved when types are used inside generic containers like \`Array<T>\`, \`Promise<T>\`, or function parameters.

**Covariance** (\`out T\`) — Preserves the direction: if \`Dog extends Animal\`, then \`Array<Dog>\` is assignable to \`Array<Animal>\`. The subtype relationship is preserved. **Output/return positions are covariant.**

**Contravariance** (\`in T\`) — Reverses the direction: if \`Dog extends Animal\`, then a function \`(animal: Animal) => void\` is assignable to \`(dog: Dog) => void\`. **Input/parameter positions are contravariant.**

**Invariance** — The relationship doesn't hold in either direction. Mutable containers are invariant in strictly-typed languages (but TypeScript is covariant for arrays by design, which is technically unsound but pragmatic).

**Why this matters:**
- Understanding variance prevents subtle bugs with generic types
- It explains why certain assignments fail with strict function types
- Library authors must understand variance for correct generic constraints

**TypeScript 4.7+ \`in\`/\`out\` annotations** let you explicitly declare variance of type parameters, improving type-checking performance and correctness.

🏠 **Real-world analogy:** Covariance is like a "pets allowed" sign — if dogs are pets, a "dogs allowed" area qualifies as "pets allowed." Contravariance is like a veterinarian — a vet that can treat ANY animal can certainly treat dogs (wider input is compatible with narrower requirement). A vet that only treats fish cannot replace a general vet.`,
      codeExample: `// Setup: type hierarchy
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }
interface Cat extends Animal { indoor: boolean; }

// COVARIANCE — return/output position
// Dog extends Animal → (() => Dog) extends (() => Animal)
type AnimalFactory = () => Animal;
type DogFactory = () => Dog;

const makeDog: DogFactory = () => ({ name: "Rex", breed: "Lab" });
const makeAnimal: AnimalFactory = makeDog; // ✅ Covariant!
// A function that returns a Dog can be used where Animal is expected

// CONTRAVARIANCE — parameter/input position (with strictFunctionTypes)
// Dog extends Animal → ((a: Animal) => void) extends ((d: Dog) => void)
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

const handleAnimal: AnimalHandler = (a) => console.log(a.name);
const handleDog: DogHandler = handleAnimal; // ✅ Contravariant!
// A handler for ANY animal can handle a Dog
// const reverseHandleDog: AnimalHandler = handleDog; // ❌ Not safe!

// Why contravariance for parameters is SAFE:
function feedAnimal(handler: (a: Animal) => void) {
  handler({ name: "Mystery Animal" }); // Might not be a Dog!
}
// If we allowed DogHandler here, handler would expect .breed — crash!

// Array covariance (TypeScript is pragmatically unsound here)
const dogs: Dog[] = [{ name: "Rex", breed: "Lab" }];
const animals: Animal[] = dogs; // ✅ TypeScript allows this
// animals.push({ name: "Kitty" }); // 😱 No breed! Runtime bug
// This is a known unsoundness in TypeScript — pragmatism over purity

// TypeScript 4.7+ explicit variance annotations
interface Producer<out T> {   // Covariant — only outputs T
  get(): T;
}
interface Consumer<in T> {    // Contravariant — only inputs T
  accept(value: T): void;
}
interface Processor<in out T> { // Invariant — both inputs and outputs T
  process(value: T): T;
}

// Practical: event handler variance
interface EventMap {
  click: MouseEvent;
  keydown: KeyboardEvent;
}

// Contravariant parameter: handler for Event (base) works for MouseEvent
type BaseHandler = (e: Event) => void;
type ClickHandler = (e: MouseEvent) => void;

const onClick: ClickHandler = (e) => console.log(e.clientX);
const onEvent: BaseHandler = (e) => console.log(e.type);
// const clickFromBase: ClickHandler = onEvent; // ✅ Safe in strict mode`,
      exercise: `**Mini Exercise:**
1. Create a type hierarchy (Animal → Dog → GoldenRetriever) and test covariant/contravariant assignments
2. Write a \`Producer<T>\` interface (covariant) and a \`Consumer<T>\` interface (contravariant)
3. Demonstrate why array covariance can be unsafe by adding a Cat to a \`Dog[]\` aliased as \`Animal[]\`
4. Use \`in\`/\`out\` variance annotations (TS 4.7+) on your generic types
5. Explain why \`(a: Animal) => void\` is assignable to \`(d: Dog) => void\` but not the reverse`,
      commonMistakes: [
        "Thinking covariance is always safe — `Dog[] as Animal[]` allows pushing non-Dogs, which is unsound; TypeScript allows it for pragmatism",
        "Not understanding why function parameters are contravariant — a handler for ANY animal can handle a Dog, but a Dog handler can't handle ANY animal",
        "Confusing variance direction — 'co' means 'same direction' (output), 'contra' means 'opposite direction' (input)",
        "Not enabling `strictFunctionTypes` — without it, function parameters are bivariant (both co- and contra-), which is unsound",
        "Over-thinking variance for everyday code — it mostly matters for library authors and generic containers; application code rarely needs explicit variance"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is covariance and contravariance in TypeScript?",
          a: "**Covariance** (output position): if `Dog extends Animal`, then `Producer<Dog>` assignable to `Producer<Animal>`. The subtype relationship is preserved. **Contravariance** (input position): if `Dog extends Animal`, then `Consumer<Animal>` assignable to `Consumer<Dog>`. The relationship is reversed. Return types are covariant; parameter types are contravariant (with strictFunctionTypes)."
        },
        {
          type: "tricky",
          q: "Why is `(animal: Animal) => void` assignable to `(dog: Dog) => void` and not the other way?",
          a: "A function expecting a Dog might receive any Animal. If the handler handles ALL Animals, it can certainly handle Dogs (contravariant = safe). But a handler that only knows about Dogs (expects `.breed`) can't safely handle all Animals (a Cat has no `.breed`). This 'reversed' assignability is contravariance — wider input is compatible with narrower requirement."
        },
        {
          type: "conceptual",
          q: "Is TypeScript's type system sound?",
          a: "No, TypeScript is intentionally unsound in some cases for pragmatism. Key unsoundnesses: 1) Array covariance (Dog[] assignable to Animal[]). 2) `any` type. 3) Bivariant function parameters (without `strictFunctionTypes`). 4) Type assertions (`as`). The TS team prioritizes developer productivity and gradual typing over theoretical soundness."
        },
        {
          type: "conceptual",
          q: "What do the `in` and `out` variance annotations do (TS 4.7+)?",
          a: "`out T` marks T as covariant — only used in output positions (return types). `in T` marks T as contravariant — only used in input positions (parameters). `in out T` is invariant. Benefits: 1) Catches misuse (using `out T` in a parameter errors). 2) Improves type-checking performance (TS doesn't need to infer variance). 3) Serves as documentation."
        },
        {
          type: "scenario",
          q: "You're designing a generic Event system. How does variance affect your design?",
          a: "Event emitters are **contravariant** in their handler type: you want to accept handlers for the specific event OR any broader event. `on('click', (e: Event) => {})` should work even though `click` emits `MouseEvent`. This means handlers should accept `Mouse extends Event`, and a handler for `Event` is assignable to a handler for `MouseEvent`."
        }
      ]
    },
    {
      id: "type-level-programming",
      title: "Type-Level Programming & Recursive Types",
      explanation: `TypeScript's type system is **Turing complete** — you can perform arbitrary computation at the type level. While you rarely need this for application code, understanding type-level programming lets you build powerful library types and understand complex type definitions.

**Recursive types** reference themselves in their definition — essential for tree structures, linked lists, JSON types, and deep utility types.

**Type-level programming techniques:**
- Recursive conditional types
- Tuple manipulation (Head, Tail, Concat, Reverse)
- String manipulation at type level
- Type-level arithmetic (limited)
- Type-level pattern matching

**Real-world uses:**
- \`DeepPartial<T>\` — Recursively make all properties optional
- \`PathsOf<T>\` — Generate all valid dot-notation paths
- \`DeepReadonly<T>\` — Recursively make immutable
- JSON type definition — Self-referencing type
- Zod/io-ts schema inference

**Important caveat:** TypeScript has a **recursion depth limit** (~50 levels). Deeply recursive types can hit this limit and cause "Type instantiation is excessively deep" errors. Design types to have bounded recursion.

🏠 **Real-world analogy:** Type-level programming is like a Russian nesting doll inspector. You open each doll (recurse), check what's inside, and classify or transform it. Each level follows the same rules until you reach the innermost doll (base case).`,
      codeExample: `// Recursive type: JSON
type JSON =
  | string
  | number
  | boolean
  | null
  | JSON[]
  | { [key: string]: JSON };

// DeepPartial — recursively make all optional
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface Config {
  db: { host: string; port: number; ssl: { enabled: boolean; cert: string } };
  cache: { ttl: number };
}
type PartialConfig = DeepPartial<Config>;
// db?.host? is optional, db?.ssl?.enabled? is optional, etc.

// Tuple manipulation
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
type Length<T extends any[]> = T['length'];

type H = Head<[1, 2, 3]>;   // 1
type T2 = Tail<[1, 2, 3]>;  // [2, 3]
type L = Last<[1, 2, 3]>;   // 3

// Reverse a tuple
type Reverse<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [...Reverse<Rest>, First]
  : [];
type Rev = Reverse<[1, 2, 3, 4]>; // [4, 3, 2, 1]

// Flatten nested arrays at type level
type Flatten<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends any[]
    ? [...Flatten<First>, ...Flatten<Rest>]
    : [First, ...Flatten<Rest>]
  : [];
type Flat = Flatten<[1, [2, 3], [4, [5]]]>; // [1, 2, 3, 4, 5]

// String manipulation at type level
type TrimLeft<S extends string> = S extends \` \${infer R}\` ? TrimLeft<R> : S;
type TrimRight<S extends string> = S extends \`\${infer R} \` ? TrimRight<R> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;
type Trimmed = Trim<"  hello  ">; // "hello"

// Split a string type
type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\`
    ? [Head, ...Split<Tail, D>]
    : [S];
type Parts = Split<"a.b.c", ".">; // ["a", "b", "c"]

// Deep property path type
type Paths<T, D extends string = "."> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? K | \`\${K}\${D}\${Paths<T[K], D>}\`
        : K;
    }[keyof T & string]
  : never;

interface User {
  name: string;
  address: {
    street: string;
    city: string;
    geo: { lat: number; lng: number };
  };
}
type UserPaths = Paths<User>;
// "name" | "address" | "address.street" | "address.city" |
// "address.geo" | "address.geo.lat" | "address.geo.lng"

// Type-safe deep get
type DeepGet<T, P extends string> =
  P extends \`\${infer K}.\${infer Rest}\`
    ? K extends keyof T
      ? DeepGet<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never;

type CityType = DeepGet<User, "address.city">; // string
type LatType = DeepGet<User, "address.geo.lat">; // number`,
      exercise: `**Mini Exercise:**
1. Implement \`DeepReadonly<T>\` that recursively makes all properties readonly
2. Create a \`Concat<A, B>\` type that concatenates two tuple types
3. Build a \`Split<S, Delimiter>\` type for string splitting at the type level
4. Write \`Paths<T>\` that generates all dot-notation paths for an object type
5. Implement a type-safe \`get(obj, "a.b.c")\` function using recursive types`,
      commonMistakes: [
        "Hitting the recursion depth limit (~50 levels) — design types with bounded recursion or use `@ts-expect-error` pragmatically",
        "Recursive types that expand exponentially — each level doubles the work; this crashes the TypeScript compiler",
        "Forgetting the base case in recursive types — always handle the terminal condition (`T extends []` for arrays)",
        "Overusing type-level programming in application code — it's powerful but makes types hard to read and debug; save it for libraries",
        "Not using `& string` when iterating `keyof T` with template literals — `keyof T` includes `symbol`, which can't be used in template literals"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are recursive types and when are they useful?",
          a: "Recursive types reference themselves in their definition. They're essential for: tree structures (AST nodes), deeply nested data (JSON type), recursive utility types (DeepPartial, DeepReadonly), tuple manipulation (Reverse, Flatten), and string parsing at the type level. TypeScript has a ~50 level recursion limit to prevent infinite loops."
        },
        {
          type: "coding",
          q: "Implement `DeepPartial<T>` that makes all nested properties optional.",
          a: "```ts\\ntype DeepPartial<T> = T extends object\\n  ? { [K in keyof T]?: DeepPartial<T[K]> }\\n  : T;\\n\\n// Usage:\\ninterface Config {\\n  db: { host: string; port: number };\\n  cache: { ttl: number };\\n}\\ntype Patch = DeepPartial<Config>;\\n// { db?: { host?: string; port?: number }; cache?: { ttl?: number } }\\n```"
        },
        {
          type: "tricky",
          q: "Is TypeScript's type system Turing complete?",
          a: "Yes, but with caveats. TypeScript's conditional types, mapped types, and recursive types can theoretically perform any computation. People have built type-level parsers, arithmetic, and even games. However, the ~50-level recursion limit and compiler performance make it impractical for complex algorithms. It's useful for library types, not for general computation."
        },
        {
          type: "conceptual",
          q: "How would you create a type-safe dot-notation accessor?",
          a: "Combine template literal types with recursive conditional types: use `Paths<T>` to generate valid paths as a union, then `DeepGet<T, P>` to resolve the type at a path. This is how libraries like `lodash.get` and `react-hook-form` provide type-safe deep access: `get(user, 'address.city')` returns `string`."
        },
        {
          type: "scenario",
          q: "You're building a validation library. How would you infer TypeScript types from runtime schemas?",
          a: "Define schemas as objects and use recursive type inference to derive the TypeScript type: ```ts\\nconst schema = z.object({\\n  name: z.string(),\\n  age: z.number(),\\n  address: z.object({ city: z.string() })\\n});\\ntype User = z.infer<typeof schema>;\\n// { name: string; age: number; address: { city: string } }\\n```\\nThis pattern (used by Zod, Valibot) uses recursive mapped types and `infer` to walk the schema tree and create the corresponding TypeScript type."
        }
      ]
    }
  ]
};

export default tsPhase3;
