const tsPhase2 = {
  id: "phase-2",
  title: "Phase 2: Intermediate TypeScript",
  emoji: "🟡",
  description: "Level up with type narrowing, generics, classes, modules, utility types, and the tsconfig deep dive.",
  topics: [
    {
      id: "type-narrowing-guards",
      title: "Type Narrowing & Type Guards",
      explanation: `**Type narrowing** is the process by which TypeScript refines a broad type to a more specific one inside a code block. It's one of TypeScript's most powerful features — the compiler tracks your control flow and automatically narrows types.

**Built-in narrowing:**
- \`typeof\` — checks primitive types (\`"string"\`, \`"number"\`, \`"boolean"\`, etc.)
- \`instanceof\` — checks class instances
- \`in\` — checks for property existence
- Truthiness checks — \`if (value)\` eliminates \`null\`, \`undefined\`, \`0\`, \`""\`
- Equality checks — \`===\`, \`!==\`, \`==\`, \`!=\`

**Custom type guards** use **type predicates** (\`param is Type\`) to tell TypeScript: "if this function returns true, the parameter is this type."

**Assertion functions** (\`asserts param is Type\`) throw if the condition fails, and TypeScript narrows the type after the call.

**Discriminated unions** narrow automatically when you check the discriminant property — this is the most common and powerful narrowing pattern in production TypeScript.

🏠 **Real-world analogy:** Type narrowing is like airport security checkpoints. At the entrance, anyone could be anything. After you show your passport (typeof check), they know you're a citizen. After the metal detector (property check), they know you aren't carrying weapons. Each checkpoint narrows who you could be.`,
      codeExample: `// typeof narrowing
function padLeft(value: string | number, padding: string | number): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + value; // padding is number
  }
  return padding + value; // padding is string
}

// instanceof narrowing
function formatDate(input: Date | string): string {
  if (input instanceof Date) {
    return input.toISOString(); // input is Date
  }
  return new Date(input).toISOString(); // input is string
}

// 'in' narrowing
interface Bird { fly(): void; layEggs(): void; }
interface Fish { swim(): void; layEggs(): void; }

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    animal.fly();   // animal is Bird
  } else {
    animal.swim();  // animal is Fish
  }
}

// Truthiness narrowing
function printName(name: string | null | undefined) {
  if (name) {
    console.log(name.toUpperCase()); // name is string
  }
}

// ⭐ Custom type guard with type predicate
interface Cat { meow(): void; purr(): void; }
interface Dog { bark(): void; fetch(): void; }

function isCat(pet: Cat | Dog): pet is Cat {
  return "meow" in pet;
}

function handlePet(pet: Cat | Dog) {
  if (isCat(pet)) {
    pet.purr();   // TS knows pet is Cat
  } else {
    pet.fetch();  // TS knows pet is Dog
  }
}

// Type predicate for filtering
interface User { id: number; name: string; }
function isValidUser(user: unknown): user is User {
  return (
    typeof user === "object" &&
    user !== null &&
    "id" in user &&
    "name" in user &&
    typeof (user as User).id === "number" &&
    typeof (user as User).name === "string"
  );
}

const mixedData: unknown[] = [
  { id: 1, name: "Alice" },
  null,
  { id: 2 },  // missing name
  { id: 3, name: "Charlie" }
];
const validUsers: User[] = mixedData.filter(isValidUser);
// Type-safe: [{ id: 1, name: "Alice" }, { id: 3, name: "Charlie" }]

// Assertion function
function assertDefined<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(msg ?? "Value is null or undefined");
  }
}
function processOrder(orderId: string | null) {
  assertDefined(orderId, "Order ID is required");
  console.log(orderId.toUpperCase()); // TS knows orderId is string
}

// Discriminated union narrowing (automatic!)
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error };

function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.value; // TS narrows: { ok: true; value: T }
  }
  throw result.error;   // TS narrows: { ok: false; error: Error }
}`,
      exercise: `**Mini Exercise:**
1. Write type guards for \`typeof\`, \`instanceof\`, and \`in\` operators
2. Create a custom type predicate \`isString(value: unknown): value is string\`
3. Use a type predicate with \`.filter()\` to filter an array of mixed types
4. Write an assertion function that asserts a value is a non-empty array
5. Create a discriminated union for API responses and handle each case with automatic narrowing`,
      commonMistakes: [
        "Relying only on `typeof` — it cannot distinguish objects (typeof {} === typeof [] === typeof null === 'object')",
        "Forgetting that type predicates lie if implemented wrong — TypeScript trusts your `is` predicate unconditionally; if it returns true incorrectly, you'll have runtime bugs",
        "Using `as` type assertions instead of type guards — assertions bypass safety; guards prove safety",
        "Not handling the `else` branch in narrowing — always consider what type remains after the check",
        "Truthiness narrowing eliminates `0` and `\"\"` along with `null`/`undefined` — use explicit null checks if `0` or `\"\"` are valid values"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is a type predicate and how does it work?",
          a: "A type predicate is a special return type `param is Type` for a function. When the function returns `true`, TypeScript narrows the parameter to the specified type in the calling scope. Example: `function isString(x: unknown): x is string { return typeof x === 'string'; }`. After `if (isString(x))`, TS knows `x` is `string`. The predicate is trusted — incorrect implementations cause unsafe narrowing."
        },
        {
          type: "tricky",
          q: "What's the difference between a type assertion (`as`) and a type guard?",
          a: "A **type assertion** (`value as Type`) is a developer override — it tells TS 'trust me' without any runtime check. If wrong, you get runtime errors. A **type guard** (`if (typeof x === 'string')`) is a runtime check that TypeScript understands — it proves the type is correct. Always prefer guards over assertions. Assertions should only be used when you know more than TS can infer."
        },
        {
          type: "coding",
          q: "Write a type guard that validates an API response has the expected shape.",
          a: "```ts\\ninterface ApiUser {\\n  id: number;\\n  name: string;\\n  email: string;\\n}\\n\\nfunction isApiUser(data: unknown): data is ApiUser {\\n  return (\\n    typeof data === 'object' &&\\n    data !== null &&\\n    typeof (data as any).id === 'number' &&\\n    typeof (data as any).name === 'string' &&\\n    typeof (data as any).email === 'string'\\n  );\\n}\\n\\n// Usage with fetch:\\nconst response = await fetch('/api/user');\\nconst data: unknown = await response.json();\\nif (isApiUser(data)) {\\n  console.log(data.email); // Type-safe!\\n}\\n```"
        },
        {
          type: "conceptual",
          q: "What is the difference between `asserts value is Type` and `value is Type`?",
          a: "`value is Type` (type predicate) returns a boolean — narrowing only happens in the `if (true)` branch. `asserts value is Type` (assertion function) narrows from the point of call onward — if it doesn't throw, the rest of the function has the narrowed type. Assertion functions are used for validation at the start of functions."
        },
        {
          type: "scenario",
          q: "You receive untrusted JSON from an API. How do you safely narrow it to your expected type?",
          a: "1) Parse as `unknown` (not `any`): `const data: unknown = await res.json()`. 2) Write a type predicate that checks every property. 3) Or use a validation library: Zod (`z.object({}).parse(data)`), io-ts, or Valibot. 4) The validation library approach is preferred for production — hand-written guards are error-prone for complex shapes."
        }
      ]
    },
    {
      id: "generics-mastery",
      title: "Generics Mastery",
      explanation: `**Generics** are type-level variables — they let you write reusable code that works with different types while maintaining type safety. Think of them as function parameters, but for types.

**Syntax:** \`<T>\` is a type parameter. Convention: \`T\` (Type), \`K\` (Key), \`V\` (Value), \`E\` (Element), \`R\` (Return).

**Generic constraints** (\`<T extends Something>\`) limit what types can be used — ensuring the generic has certain properties.

**Default generics** (\`<T = DefaultType>\`) provide a fallback type when none is specified.

**Key patterns:**
- **Generic functions:** \`function identity<T>(value: T): T\`
- **Generic interfaces:** \`interface Box<T> { value: T }\`
- **Generic classes:** \`class Stack<T> { ... }\`
- **Generic constraints:** \`<T extends { length: number }>\`
- **Multiple type params:** \`<K extends keyof T, V extends T[K]>\`

Generics are the foundation of TypeScript's utility types (\`Partial<T>\`, \`Pick<T, K>\`, etc.) and are essential for building reusable libraries.

🏠 **Real-world analogy:** Generics are like a shipping box with a label slot. The box works the same regardless of what's inside — books, electronics, clothes. The label (type parameter) tells you what's in this particular box. The constraint (\`extends\`) is like a weight limit: "Box for items under 50 lbs."`,
      codeExample: `// Basic generic function
function identity<T>(value: T): T {
  return value;
}
const str = identity("hello");  // T inferred as string
const num = identity(42);       // T inferred as number

// Generic with constraint
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
getLength("hello");    // ✅ strings have .length
getLength([1, 2, 3]);  // ✅ arrays have .length
// getLength(42);       // ❌ number doesn't have .length

// Multiple type parameters
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}
const lengths = map(["hello", "world"], s => s.length);
// Type: number[] (T = string, U = number — both inferred!)

// keyof constraint — type-safe property access
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Alice", age: 30, email: "alice@test.com" };
const name = getProperty(user, "name");  // Type: string
const age = getProperty(user, "age");    // Type: number
// getProperty(user, "phone");            // ❌ Error: "phone" not in keyof User

// Generic interfaces
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "Alice", email: "", createdAt: new Date() },
  status: 200,
  message: "Success",
  timestamp: new Date()
};

// Generic class
class Stack<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items.at(-1); }
  get size(): number { return this.items.length; }
}
const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
numStack.pop(); // Type: number | undefined

// Default type parameter
interface PaginatedResult<T, M = Record<string, unknown>> {
  items: T[];
  total: number;
  page: number;
  meta: M;
}
// M defaults to Record<string, unknown>
const result: PaginatedResult<User> = {
  items: [],
  total: 0,
  page: 1,
  meta: {}
};

// Generic factory function
function createInstance<T>(Ctor: { new(): T }): T {
  return new Ctor();
}

// Conditional return type with generics
function wrapInArray<T>(value: T): T extends any[] ? T : T[] {
  return (Array.isArray(value) ? value : [value]) as any;
}`,
      exercise: `**Mini Exercise:**
1. Write a generic \`first<T>(arr: T[]): T | undefined\` function
2. Create a generic \`Pair<A, B>\` interface and use it
3. Write a type-safe \`pluck<T, K extends keyof T>(items: T[], key: K): T[K][]\`
4. Build a generic \`EventEmitter<Events>\` where event names and payloads are typed
5. Create a generic \`Result<T, E = Error>\` type with a default error type`,
      commonMistakes: [
        "Using `any` instead of generics — `function first(arr: any[]): any` loses all type information; use `<T>(arr: T[]): T` instead",
        "Over-constraining generics — `<T extends string | number>` when just `<T>` would work; only constrain when you need specific operations",
        "Not letting TypeScript infer type arguments — `identity<string>('hello')` is redundant; `identity('hello')` infers `string` automatically",
        "Forgetting that generic type parameters are erased at runtime — you can't do `if (T === string)` or `new T()` at runtime",
        "Creating too many type parameters — if your function has `<A, B, C, D, E>`, it's too complex; simplify the design"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are generics in TypeScript and why are they useful?",
          a: "Generics are type-level variables that let you write functions, classes, and interfaces that work with multiple types while maintaining type safety. Without generics, you'd need either `any` (unsafe) or duplicated code for each type. Example: `Array<T>` is generic — `Array<string>` and `Array<number>` share the same implementation but are type-safe."
        },
        {
          type: "coding",
          q: "Write a generic `merge` function that type-safely combines two objects.",
          a: "```ts\\nfunction merge<T extends object, U extends object>(a: T, b: U): T & U {\\n  return { ...a, ...b };\\n}\\n\\nconst result = merge(\\n  { name: 'Alice' },\\n  { age: 30 }\\n);\\n// Type: { name: string } & { age: number }\\nconsole.log(result.name); // ✅\\nconsole.log(result.age);  // ✅\\n```"
        },
        {
          type: "tricky",
          q: "Why can't you use `new T()` in a generic function?",
          a: "Generic type parameters are erased at runtime — `T` doesn't exist as a value. To create instances, pass the constructor: `function create<T>(Ctor: { new(): T }): T { return new Ctor(); }`. The `{ new(): T }` type represents a constructable class. This separates the type space (generic) from the value space (constructor)."
        },
        {
          type: "conceptual",
          q: "What does `K extends keyof T` mean?",
          a: "`keyof T` produces a union of T's property names as string literal types. `K extends keyof T` constrains K to be one of those keys. This enables type-safe property access: `function get<T, K extends keyof T>(obj: T, key: K): T[K]` — the return type `T[K]` is automatically the type of that specific property."
        },
        {
          type: "scenario",
          q: "How would you design a type-safe API for a form builder using generics?",
          a: "Use a generic that captures the form shape: ```ts\\ninterface FormBuilder<T extends Record<string, any>> {\\n  field<K extends keyof T>(name: K, config: FieldConfig<T[K]>): this;\\n  validate(): Promise<T>;\\n  getValues(): Partial<T>;\\n}\\nconst form = createForm<{ name: string; age: number }>();\\nform.field('name', { required: true }); // ✅ name must be keyof form\\nform.field('phone', {}); // ❌ 'phone' doesn't exist\\n```"
        }
      ]
    },
    {
      id: "classes-and-access-modifiers",
      title: "Classes, Access Modifiers & Abstract Classes",
      explanation: `TypeScript enhances JavaScript classes with **access modifiers**, **abstract classes**, **parameter properties**, and **interface implementation**.

**Access modifiers:**
- \`public\` — Accessible anywhere (default)
- \`private\` — Only within the class itself (TS-only enforcement)
- \`protected\` — Within the class and its subclasses
- \`#field\` — True JavaScript private (runtime enforcement, ES2022)

**Parameter properties** are a shorthand: \`constructor(public name: string)\` automatically creates and assigns \`this.name\`.

**Abstract classes** define blueprints that can't be instantiated directly — subclasses MUST implement abstract methods.

**Interface implementation** (\`class Foo implements Bar\`) ensures a class satisfies a contract. Unlike structural typing, \`implements\` provides an explicit check.

**\`override\` keyword** (TS 4.3) explicitly marks methods overriding parent methods — catches typos in method names.

🏠 **Real-world analogy:** Access modifiers are like building security levels. \`public\` is the lobby — anyone can enter. \`protected\` is the office floor — only employees and their teams. \`private\` is the server room — only specific personnel. Abstract classes are like blueprints — you can't live in a blueprint, but you build real houses from them.`,
      codeExample: `// Access modifiers + parameter properties
class User {
  // Parameter properties — shorthand for declare + assign
  constructor(
    public readonly id: number,
    public name: string,
    private email: string,
    protected role: string = "user"
  ) {}

  getEmail(): string {
    return this.email; // ✅ private accessible inside class
  }
}

const user = new User(1, "Alice", "alice@test.com");
user.name;       // ✅ public
// user.email;   // ❌ Error: 'email' is private
// user.role;    // ❌ Error: 'role' is protected
// user.id = 2;  // ❌ Error: readonly

// Protected access in subclass
class Admin extends User {
  constructor(id: number, name: string, email: string) {
    super(id, name, email, "admin");
  }

  getRole(): string {
    return this.role; // ✅ protected accessible in subclass
  }
}

// Abstract class — can't instantiate directly
abstract class Shape {
  abstract area(): number;        // Must be implemented
  abstract perimeter(): number;   // Must be implemented

  // Concrete method — shared by all subclasses
  describe(): string {
    return \`Shape with area \${this.area().toFixed(2)}\`;
  }
}

// const s = new Shape(); // ❌ Error: Cannot create instance of abstract class

class Circle extends Shape {
  constructor(public radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// Implements — class satisfies an interface
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

interface Loggable {
  log(): void;
}

class Config implements Serializable, Loggable {
  constructor(private data: Record<string, unknown> = {}) {}

  serialize(): string {
    return JSON.stringify(this.data);
  }

  deserialize(data: string): void {
    this.data = JSON.parse(data);
  }

  log(): void {
    console.log(this.data);
  }
}

// Override keyword (TS 4.3+, enable noImplicitOverride)
class Animal {
  speak(): string {
    return "...";
  }
}

class Dog extends Animal {
  override speak(): string {  // Explicit override
    return "Woof!";
  }

  // override spek(): string {  // ❌ Error: no method named 'spek' to override
  //   return "typo caught!";
  // }
}

// Generic class
class Repository<T extends { id: number }> {
  private items = new Map<number, T>();

  add(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: number): T | undefined {
    return this.items.get(id);
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }
}
const userRepo = new Repository<User>();`,
      exercise: `**Mini Exercise:**
1. Create a class with \`public\`, \`private\`, \`protected\`, and \`readonly\` properties — test each from outside
2. Use parameter properties to simplify a constructor
3. Create an abstract \`Vehicle\` class with concrete and abstract methods, then implement \`Car\` and \`Truck\`
4. Implement multiple interfaces on a single class
5. Use the \`override\` keyword and see what happens with a typo in the method name`,
      commonMistakes: [
        "Using TS `private` for security — it's compile-time only; at runtime, the property is still accessible. Use `#field` for true runtime privacy",
        "Forgetting to call `super()` in the subclass constructor before using `this` — TypeScript enforces this and throws a compile error",
        "Not knowing that `implements` doesn't add anything at runtime — it's a compile-time check only. The class must still provide all properties",
        "Over-using abstract classes when an interface would suffice — abstract classes add a runtime prototype chain; interfaces are zero-cost",
        "Forgetting that parameter properties only work in constructors — `public` on a regular method parameter doesn't create a property"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the difference between `private`, `#private`, and `protected` in TypeScript?",
          a: "`private` (TS keyword): compile-time only enforcement, erased at runtime, accessible via bracket notation or DevTools. `#private` (ES2022): true runtime privacy, enforced by the JavaScript engine, cannot be accessed from outside at all. `protected`: accessible within the class AND its subclasses, but not from outside. Use `#private` for real security, `private` for API design."
        },
        {
          type: "coding",
          q: "Create an abstract `Logger` class with subclasses for console and file logging.",
          a: "```ts\\nabstract class Logger {\\n  abstract log(message: string): void;\\n  \\n  info(msg: string) { this.log(`[INFO] ${msg}`); }\\n  warn(msg: string) { this.log(`[WARN] ${msg}`); }\\n  error(msg: string) { this.log(`[ERROR] ${msg}`); }\\n}\\n\\nclass ConsoleLogger extends Logger {\\n  log(message: string) { console.log(message); }\\n}\\n\\nclass FileLogger extends Logger {\\n  constructor(private filepath: string) { super(); }\\n  log(message: string) {\\n    // fs.appendFileSync(this.filepath, message + '\\\\n');\\n  }\\n}\\n```"
        },
        {
          type: "conceptual",
          q: "What are parameter properties in TypeScript?",
          a: "Parameter properties are a shorthand: adding `public`, `private`, `protected`, or `readonly` to a constructor parameter automatically creates and assigns the corresponding class property. `constructor(public name: string)` is equivalent to: `name: string; constructor(name: string) { this.name = name; }`. Saves boilerplate but can be less readable."
        },
        {
          type: "tricky",
          q: "What does `implements` actually do at runtime?",
          a: "Nothing. `implements` is a compile-time-only check that ensures a class has all the properties and methods required by an interface. It generates no JavaScript code. The class must independently provide all members — `implements` doesn't inherit anything. It's purely a contract verification tool."
        },
        {
          type: "scenario",
          q: "When would you use an abstract class vs an interface in TypeScript?",
          a: "Use **abstract class** when: you want to share implementation (concrete methods), need constructor logic, or want to enforce a prototype chain. Use **interface** when: you only need a shape contract, want zero runtime overhead, need multiple inheritance (a class can implement multiple interfaces but extend only one class), or want declaration merging."
        }
      ]
    },
    {
      id: "modules-tsconfig",
      title: "Modules, Declaration Files & tsconfig Deep Dive",
      explanation: `**Modules** in TypeScript follow the ES Module standard (\`import\`/\`export\`). Understanding module resolution, declaration files, and tsconfig options is essential for production TypeScript.

**Declaration files** (\`.d.ts\`) describe the types for JavaScript code that doesn't have TypeScript types. They're how TypeScript understands \`npm\` packages written in JavaScript.

**\`@types/\` packages** — The DefinitelyTyped repository provides community-maintained type declarations for thousands of JavaScript packages. Install with \`npm i -D @types/lodash\`.

**Module augmentation** lets you add types to existing modules — extending library types without modifying their source.

**tsconfig.json** is the central configuration for the TypeScript compiler. Key sections:
- **\`compilerOptions\`** — How TS compiles your code
- **\`include\`/\`exclude\`** — Which files to process
- **\`references\`** — Project references for monorepos

**Critical tsconfig options:**
- \`strict: true\` — Enables all strict checks (ALWAYS use this)
- \`target\` — Which JS version to output (ES2022 is a safe modern default)
- \`module\` / \`moduleResolution\` — How imports are resolved
- \`paths\` — Custom import aliases (\`@/components\`)
- \`noUncheckedIndexedAccess\` — Arrays/objects may return undefined

🏠 **Real-world analogy:** Declaration files are like user manuals for tools you didn't build. You don't have the blueprints (source code), but the manual (d.ts) tells you what buttons to press (API types). tsconfig.json is like the settings panel for your car — target speed, safety features, navigation mode.`,
      codeExample: `// ES Module syntax (TypeScript follows this standard)
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}
export const PI = 3.14159;
export default class Calculator { /* ... */ }

// app.ts
// import Calculator, { add, PI } from "./math";

// Type-only imports (erased at compile time)
// import type { User } from "./types";
// import { type User, createUser } from "./users";

// Declaration files (.d.ts) — type definitions for JS code
// utils.d.ts
// declare function formatCurrency(amount: number, currency: string): string;
// declare const API_URL: string;
// declare module "untyped-lib" {
//   export function doSomething(input: string): number;
// }

// Module augmentation — extend existing types
// Extending Express Request (common pattern)
// declare module "express" {
//   interface Request {
//     user?: { id: string; role: string };
//   }
// }

// Global augmentation
// declare global {
//   interface Window {
//     analytics: { track(event: string): void };
//   }
// }

// Path aliases (in tsconfig: "paths": { "@/*": ["./src/*"] })
// import { UserService } from "@/services/user";
// import { Button } from "@/components/Button";

// Ambient modules — declare types for non-TS files
// declare module "*.css" {
//   const classes: Record<string, string>;
//   export default classes;
// }
// declare module "*.svg" {
//   import { FC, SVGProps } from "react";
//   const SVG: FC<SVGProps<SVGSVGElement>>;
//   export default SVG;
// }

// Namespace (legacy — prefer ES modules)
// namespace Utils {
//   export function log(msg: string) { console.log(msg); }
//   export function warn(msg: string) { console.warn(msg); }
// }
// Utils.log("hello");

// tsconfig.json — production-grade configuration:
// {
//   "compilerOptions": {
//     "target": "ES2022",
//     "module": "ESNext",
//     "moduleResolution": "bundler",
//     "strict": true,
//     "noUncheckedIndexedAccess": true,
//     "noUnusedLocals": true,
//     "noUnusedParameters": true,
//     "noFallthroughCasesInSwitch": true,
//     "forceConsistentCasingInFileNames": true,
//     "esModuleInterop": true,
//     "skipLibCheck": true,
//     "declaration": true,
//     "declarationMap": true,
//     "sourceMap": true,
//     "outDir": "./dist",
//     "rootDir": "./src",
//     "paths": { "@/*": ["./src/*"] }
//   },
//   "include": ["src/**/*"],
//   "exclude": ["node_modules", "dist"]
// }

// Example: tsconfig for a Next.js project:
// "compilerOptions": {
//   "lib": ["dom", "dom.iterable", "esnext"],
//   "jsx": "preserve",
//   "incremental": true,
//   "plugins": [{ "name": "next" }]
// }
console.log("Modules and tsconfig are the backbone of any TS project.");`,
      exercise: `**Mini Exercise:**
1. Create a \`.d.ts\` declaration file for an imaginary JavaScript utility library
2. Set up path aliases in tsconfig and use them in imports
3. Use module augmentation to add a custom property to Express \`Request\`
4. Create a tsconfig with \`strict: true\` and all recommended options
5. Write ambient module declarations for \`.css\` and \`.svg\` imports`,
      commonMistakes: [
        "Not installing `@types/` packages for JavaScript libraries — TypeScript won't know the types; install `@types/express`, `@types/node`, etc.",
        "Confusing `module` and `moduleResolution` in tsconfig — `module` is the output format; `moduleResolution` is how TS finds imported files",
        "Using `namespace` in new code — namespaces are legacy; ES modules (`import`/`export`) are the standard way to organize code",
        "Not enabling `skipLibCheck: true` — checking ALL declaration files in node_modules is slow and finds irrelevant errors",
        "Forgetting that `.d.ts` files are type-only — they cannot contain any implementation, only type declarations"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are declaration files (.d.ts) and when are they needed?",
          a: "Declaration files provide type information for JavaScript code without TypeScript types. They contain ONLY type declarations (no implementation). Needed when: 1) Using a JS library without built-in types. 2) Publishing a library — ship `.d.ts` so consumers get types. 3) Defining types for non-TS assets (CSS modules, SVGs). DefinitelyTyped (`@types/*`) provides community declarations."
        },
        {
          type: "coding",
          q: "Write a declaration file for a simple JavaScript utility library.",
          a: "```ts\\n// utils.d.ts\\ndeclare module 'my-utils' {\\n  export function debounce<T extends (...args: any[]) => any>(\\n    fn: T,\\n    ms: number\\n  ): (...args: Parameters<T>) => void;\\n\\n  export function deepClone<T>(obj: T): T;\\n\\n  export interface Config {\\n    apiUrl: string;\\n    timeout?: number;\\n  }\\n}\\n```"
        },
        {
          type: "conceptual",
          q: "What does `moduleResolution: 'bundler'` do in tsconfig?",
          a: "`moduleResolution: 'bundler'` (TS 5.0+) tells TypeScript to resolve modules the way modern bundlers (Vite, webpack, esbuild) do: supports `package.json` `exports` field, allows extensionless imports, and handles `index.ts` files. It's the recommended setting for applications bundled by tools like Vite, webpack, or Next.js."
        },
        {
          type: "tricky",
          q: "What is module augmentation and why is it useful?",
          a: "Module augmentation lets you add new declarations to an existing module without modifying its source. Use `declare module 'module-name' { ... }` to add properties. Common use cases: adding `user` to Express `Request`, extending `Window` with custom globals, adding custom fields to library types. It's how you customize third-party types for your codebase."
        },
        {
          type: "scenario",
          q: "You're setting up a new TypeScript project. What tsconfig options do you consider essential?",
          a: "Must-have: `strict: true` (all strict checks), `noUncheckedIndexedAccess` (array safety), `forceConsistentCasingInFileNames` (prevent case-sensitivity bugs), `skipLibCheck` (performance). Recommended: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `sourceMap`, `declaration`. For target: `ES2022` for modern runtimes, `ES2018` for broader compat."
        }
      ]
    },
    {
      id: "utility-types",
      title: "Built-in Utility Types",
      explanation: `TypeScript ships with **built-in utility types** that transform existing types — making properties optional, required, readonly, or extracting/excluding parts.

**Object transformers:**
- \`Partial<T>\` — All properties optional
- \`Required<T>\` — All properties required
- \`Readonly<T>\` — All properties readonly
- \`Pick<T, K>\` — Select specific properties
- \`Omit<T, K>\` — Remove specific properties
- \`Record<K, V>\` — Object with keys K and values V

**Union transformers:**
- \`Exclude<T, U>\` — Remove types from union
- \`Extract<T, U>\` — Keep only matching types
- \`NonNullable<T>\` — Remove null and undefined

**Function transformers:**
- \`ReturnType<T>\` — Extract return type
- \`Parameters<T>\` — Extract parameter types as tuple
- \`ConstructorParameters<T>\` — Parameters of a constructor

**String transformers:**
- \`Uppercase<T>\`, \`Lowercase<T>\`, \`Capitalize<T>\`, \`Uncapitalize<T>\`

Understanding how these work internally (using mapped types, conditional types, and \`infer\`) is key to building your own utility types in Phase 3.

🏠 **Real-world analogy:** Utility types are like photo filters. You take an existing photo (type) and apply transformations — make it grayscale (Readonly), crop it (Pick), blur parts (Omit). The original photo remains unchanged; you get a new version.`,
      codeExample: `interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: "admin" | "user";
}

// Partial — all properties become optional
type UpdateUser = Partial<User>;
// { id?: number; name?: string; email?: string; ... }
function updateUser(id: number, updates: Partial<User>): void {
  // Can pass any subset of User properties
}
updateUser(1, { name: "Bob" });         // ✅
updateUser(1, { name: "Bob", age: 31 }); // ✅

// Required — opposite of Partial
interface Config {
  apiUrl?: string;
  timeout?: number;
}
type StrictConfig = Required<Config>;
// { apiUrl: string; timeout: number; } — no more optional!

// Readonly — prevent mutation
type ImmutableUser = Readonly<User>;
// const u: ImmutableUser = { ... };
// u.name = "Bob"; // ❌ Error: readonly

// Pick — select properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string; }

// Omit — remove properties
type UserWithoutEmail = Omit<User, "email">;
// { id: number; name: string; age: number; role: ... }

// Record — typed key-value map
type UserRoles = Record<string, "admin" | "user" | "guest">;
const roles: UserRoles = {
  alice: "admin",
  bob: "user"
};

type StatusMessages = Record<"loading" | "success" | "error", string>;
const messages: StatusMessages = {
  loading: "Please wait...",
  success: "Done!",
  error: "Something went wrong"
};

// Exclude and Extract (on unions)
type AllTypes = string | number | boolean | null | undefined;
type NotNull = Exclude<AllTypes, null | undefined>;
// string | number | boolean
type OnlyStringOrNumber = Extract<AllTypes, string | number>;
// string | number

// NonNullable
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// ReturnType — extract function return type
function fetchUsers() {
  return [{ id: 1, name: "Alice" }];
}
type Users = ReturnType<typeof fetchUsers>;
// { id: number; name: string; }[]

// Parameters — extract function params as tuple
function createUser(name: string, age: number, role?: string) { }
type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number, role?: string]

// Combining utility types
type CreateUserDTO = Omit<User, "id">; // Everything except id
type UserPatch = Partial<Omit<User, "id" | "role">>; // Optional fields, no id/role

// Awaited — extract the resolved type of a Promise
type PromiseResult = Awaited<Promise<Promise<string>>>;
// string (deeply unwraps)`,
      exercise: `**Mini Exercise:**
1. Create an \`UpdateDTO\` type that makes all fields of \`User\` optional EXCEPT \`id\` (required)
2. Use \`Record\` to create a typed dictionary mapping HTTP status codes to messages
3. Extract the return type of an async function using \`Awaited<ReturnType<typeof fn>>\`
4. Create a \`PublicUser\` type that omits sensitive fields like \`password\` and \`email\`
5. Combine \`Pick\`, \`Partial\`, and \`Required\` to create a complex DTO type`,
      commonMistakes: [
        "Confusing `Omit` and `Exclude` — `Omit` works on object types (removes properties); `Exclude` works on union types (removes union members)",
        "Using `Partial` when only some fields should be optional — use `Pick` + `Partial` combination or intersection for precise control",
        "Forgetting that `Readonly` is shallow — nested objects inside a `Readonly<T>` can still be mutated",
        "Not knowing that `Record<string, T>` allows ANY string key — for specific keys, use `Record<'a' | 'b', T>`",
        "Using `ReturnType` with a function value instead of a type — use `ReturnType<typeof myFunction>`, not `ReturnType<myFunction>`"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between `Omit` and `Exclude` in TypeScript?",
          a: "`Omit<T, K>` works on **object types** — it creates a new object type with specific properties removed. `Exclude<T, U>` works on **union types** — it removes members from a union that match `U`. Example: `Omit<User, 'id'>` removes the `id` property. `Exclude<'a' | 'b' | 'c', 'a'>` removes `'a'` from the union."
        },
        {
          type: "coding",
          q: "Create a type `RequiredPick<T, K>` that makes only specified fields required and the rest optional.",
          a: "```ts\\ntype RequiredPick<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>;\\n\\n// Usage:\\ninterface Form {\\n  name?: string;\\n  email?: string;\\n  age?: number;\\n}\\ntype SubmitForm = RequiredPick<Form, 'name' | 'email'>;\\n// { name: string; email: string; age?: number }\\n```"
        },
        {
          type: "tricky",
          q: "What does `Awaited<Promise<Promise<string>>>` resolve to?",
          a: "`string`. `Awaited` recursively unwraps nested Promises until it reaches a non-Promise type. `Awaited<Promise<Promise<string>>>` → `Awaited<Promise<string>>` → `Awaited<string>` → `string`. This is how TypeScript correctly types `await` on deeply nested Promises."
        },
        {
          type: "conceptual",
          q: "How does `Partial<T>` work internally?",
          a: "`Partial<T>` is a mapped type: `type Partial<T> = { [P in keyof T]?: T[P] }`. It iterates over each key `P` in `T` using `keyof T`, makes it optional with `?`, and preserves the original value type `T[P]`. This pattern (mapped types) is the foundation for all utility types and lets you build your own."
        },
        {
          type: "scenario",
          q: "You're designing a REST API. How would you use utility types for your DTOs?",
          a: "```ts\\n// Base entity\\ninterface User { id: number; name: string; email: string; password: string; createdAt: Date; }\\n\\n// Create: no id, no createdAt (server generates)\\ntype CreateUserDTO = Omit<User, 'id' | 'createdAt'>;\\n\\n// Update: all fields optional except id\\ntype UpdateUserDTO = Partial<Omit<User, 'id'>> & Pick<User, 'id'>;\\n\\n// Response: no password (never expose)\\ntype UserResponse = Omit<User, 'password'>;\\n\\n// List: minimal fields\\ntype UserListItem = Pick<User, 'id' | 'name'>;\\n```"
        }
      ]
    }
  ]
};

export default tsPhase2;
