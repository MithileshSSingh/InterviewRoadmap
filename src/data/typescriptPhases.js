const typescriptPhases = [
  {
    id: "phase-1",
    title: "Phase 1: Beginner Foundations",
    emoji: "🟢",
    description: "Build strong TypeScript fundamentals: type system basics, inference, narrowing, functions, modules, and compiler setup.",
    topics: [
      {
        id: "ts-why-and-setup",
        title: "Why TypeScript + Setup for Serious Learning",
        explanation: `Simple view: TypeScript is JavaScript with a static type system. It catches many bugs before runtime and improves editor tooling.

Deep view: TypeScript runs as a separate compilation step. The compiler builds an abstract syntax tree, resolves symbols, checks assignability rules, and then emits JavaScript. Types are erased at runtime, so runtime safety still needs validation for external data. In production, TypeScript primarily gives design-time guarantees, safer refactoring, and stronger contracts between teams.

JavaScript comparison: JavaScript errors often appear at runtime in low-traffic edge paths. TypeScript shifts many of those failures to development time.

Why it matters in real projects: large React and Node codebases benefit from safer APIs, predictable data contracts, and faster onboarding.

Production use case: migrating a medium Express app to TypeScript can cut category-level bugs around undefined fields and wrong function arguments.`,
        codeExample: `// package.json scripts for a real project
// "build": "tsc -p tsconfig.json"
// "typecheck": "tsc -p tsconfig.json --noEmit"

// tsconfig.json essentials (starter)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": false,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}

// JavaScript lets this pass until runtime
function add(a, b) {
  return a + b;
}

// TypeScript catches wrong input at compile time
function addSafe(a: number, b: number): number {
  return a + b;
}

addSafe(2, 3); // ok
// addSafe("2", 3); // compile error`,
        exercise: `1. Initialize a new TypeScript project with strict mode and typecheck script.
2. Create one file with common JavaScript bugs (wrong argument types, missing fields).
3. Convert it to TypeScript and list every compiler error.
4. Fix errors without using any.
5. Write a short note: which bug classes moved from runtime to compile time?`,
        commonMistakes: [
          "Treating TypeScript as runtime validation; TypeScript types disappear after compilation",
          "Starting with non-strict config and accumulating hidden type debt",
          "Using any as a shortcut during setup and never removing it",
          "Assuming generated JavaScript behavior changes because of TypeScript types",
          "Skipping a dedicated typecheck CI step"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "What does TypeScript add to JavaScript, and what does it not add?",
            a: "It adds static type checking, richer tooling, and safer refactors. It does not add runtime type enforcement by default because types are erased in emitted JavaScript."
          },
          {
            type: "scenario",
            q: "Your team says TypeScript slowed development. How do you respond as a senior engineer?",
            a: "Measure defect rate, rollback frequency, and refactor confidence. Optimize strictness rollout, lint rules, and shared utility types. The goal is net delivery speed over project lifetime, not day-1 typing speed."
          },
          {
            type: "tricky",
            q: "Will TypeScript prevent invalid JSON payloads from external APIs at runtime?",
            a: "No. External input must be validated at runtime using schemas or validators, then narrowed into trusted TypeScript types."
          }
        ]
      },
      {
        id: "core-type-system",
        title: "Core Type System: Primitives, Inference, Unions, Intersections",
        explanation: `Simple view: annotate values so code communicates intent and mistakes are caught early.

Deep view: inference is context-sensitive and flow-aware. TypeScript infers literal or widened types depending on declaration style and assignment context. Union types represent alternatives, intersection types combine constraints. Structural typing means compatibility is based on shape, not nominal identity. This is powerful but can produce surprising assignability behavior if contracts are not explicit.

Real-world relevance: API layers often model response states as unions and domain contracts as interfaces or type aliases.

Edge case: over-widened inference (for example from mutable let declarations) can remove useful precision`,
        codeExample: `type Loading = { state: "loading" };
type Success = { state: "success"; data: string[] };
type Failure = { state: "failure"; error: Error };

type RequestState = Loading | Success | Failure;

type WithMeta = { requestId: string; createdAt: Date };
type SuccessfulRequest = Success & WithMeta;

const mode = "strict"; // inferred literal "strict"
let mutableMode = "strict"; // inferred string (widened)

interface User {
  id: string;
  email: string;
  readonly role: "admin" | "member";
}

type Admin = User & { role: "admin" };

function render(state: RequestState): string {
  if (state.state === "loading") return "Loading...";
  if (state.state === "failure") return state.error.message;
  return state.data.join(", ");
}`,
        exercise: `Easy: model a form state with union types: idle, submitting, success, error.
Medium: create an intersection type that merges audit fields into domain entities.
Hard: design a typed state machine for payment flow and implement exhaustive handling.`,
        commonMistakes: [
          "Overusing intersection types that produce impossible object requirements",
          "Using string instead of string literal unions for finite domains",
          "Assuming TypeScript uses nominal typing like Java or C#",
          "Missing exhaustive checks on discriminated unions",
          "Letting inferred types widen when const precision is needed"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "Explain structural typing with a practical example.",
            a: "If two objects have compatible property shapes, they are assignable even if declared with different type names. This supports flexible APIs but requires careful contract design."
          },
          {
            type: "coding",
            q: "How do you enforce exhaustive handling of a discriminated union?",
            a: "Use a final branch assigning to never. If a new variant is added and not handled, compilation fails."
          },
          {
            type: "tricky",
            q: "Union vs intersection: when does each increase strictness?",
            a: "Union loosens to one-of-many shapes. Intersection tightens to all constraints simultaneously."
          }
        ]
      },
      {
        id: "interfaces-functions-modules",
        title: "Interfaces, Type Aliases, Functions, Overloads, this, Modules",
        explanation: `Simple view: use interfaces and type aliases to describe contracts; use function typing to make APIs predictable.

Deep view: interfaces support declaration merging and are ideal for extensible object contracts. Type aliases are stronger for unions, mapped types, and computed types. Function overloads model multiple call signatures while keeping one implementation. Explicit this parameter typing prevents wrong method context in callbacks. ES modules are the modern standard; namespaces are legacy for global-script organization and usually avoided in module-based apps.

Production use case: SDKs often expose overloads for developer ergonomics while internally normalizing inputs`,
        codeExample: `interface Logger {
  log(message: string): void;
}

type ID = string | number;

type Fetcher = (id: ID) => Promise<{ id: ID; name: string }>;

function parse(input: string): number;
function parse(input: number): number;
function parse(input: string | number): number {
  return typeof input === "string" ? Number(input) : input;
}

class Counter {
  value = 0;
  increment(this: Counter, step: number) {
    this.value += step;
  }
}

export interface Product {
  id: string;
  price: number;
}

export const toUSD = (price: number) => "$" + price.toFixed(2);

// Namespace example (rare in modern apps)
namespace LegacyMath {
  export const sum = (a: number, b: number) => a + b;
}`,
        exercise: `1. Create a mini SDK with overloaded fetch function signatures.
2. Add explicit this typing to a class method and break it intentionally by losing context.
3. Refactor object contracts from type alias to interface and note where declaration merging helps.
4. Convert a namespace utility file to ES modules.`,
        commonMistakes: [
          "Using overloads where a discriminated union parameter would be simpler",
          "Forgetting explicit this typing in callback-heavy APIs",
          "Choosing interface when union-heavy modeling requires type aliases",
          "Keeping namespace patterns in modern ESM applications",
          "Exporting inconsistent module shapes across files"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "When do you choose interface over type alias?",
            a: "Use interface for object contracts intended for extension or declaration merging. Use type alias for unions, intersections, and computed/mapped types."
          },
          {
            type: "scenario",
            q: "How can wrong this binding create runtime bugs in TypeScript code?",
            a: "TypeScript cannot fix runtime this behavior automatically. Explicit this parameter typing and arrow functions for lexical binding prevent context loss in callbacks."
          },
          {
            type: "coding",
            q: "Why might overload signatures improve API ergonomics?",
            a: "They preserve precise return types for each call form, improving autocomplete and reducing downstream type assertions."
          }
        ]
      },
      {
        id: "narrowing-compatibility-tsconfig",
        title: "Narrowing, Compatibility, Compiler Internals, tsconfig Deep Dive",
        explanation: `Simple view: narrowing means reducing a broad type into a specific safe type before using it.

Deep view: TypeScript performs control-flow analysis across branches, guards, and assignments. Assignability depends on structural compatibility and variance rules (which you will go deeper into later). Compiler pipeline high level: parse -> bind symbols -> type check -> transform -> emit. tsconfig controls strictness, module strategy, source maps, and interop behavior. Strong tsconfig is architecture, not just tooling.

Debugging scenario: unexpected type widening often traces back to config flags or inferred any from untyped boundaries.

Real-world use case: strict project references in monorepos prevent accidental circular dependencies and unstable shared contracts`,
        codeExample: `type ApiResult =
  | { ok: true; value: { id: string; amount: number } }
  | { ok: false; error: string };

function handleResult(result: ApiResult) {
  if (!result.ok) {
    return result.error.toUpperCase();
  }
  return result.value.amount.toFixed(2);
}

function assertNever(x: never): never {
  throw new Error("Unhandled variant: " + String(x));
}

// tsconfig flags that materially affect correctness
// "strict": true
// "noImplicitOverride": true
// "noFallthroughCasesInSwitch": true
// "noUnusedLocals": true
// "exactOptionalPropertyTypes": true
// "noUncheckedIndexedAccess": true
`,
        exercise: `Easy: write custom type guards for unknown API responses.
Medium: use a switch on discriminant and enforce exhaustive handling with never.
Hard: design a strict tsconfig for a monorepo package and justify each flag.`,
        commonMistakes: [
          "Using type assertions instead of type guards to silence errors",
          "Leaving strictNullChecks off and introducing latent null crashes",
          "Ignoring noUncheckedIndexedAccess in data-heavy code",
          "Assuming TypeScript control-flow narrowing works through all dynamic abstractions",
          "Skipping project references in multi-package repositories"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "How does control-flow analysis help TypeScript narrowing?",
            a: "The checker tracks possible types through branches and guards, refining unions where conditions prove type facts."
          },
          {
            type: "scenario",
            q: "You inherited a lax tsconfig. Which 3 flags would you enable first and why?",
            a: "strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes. They remove major classes of undefined access and optional-property ambiguity."
          },
          {
            type: "tricky",
            q: "Does TypeScript compilation always mean transpiling modern syntax down to older JS?",
            a: "Not always. tsc can type-check only with noEmit, or emit nearly unchanged JS depending on target and transform needs."
          }
        ]
      },
      {
        id: "phase1-practical-lab",
        title: "Phase 1 Practical Lab (Mini Project + Debugging + Refactor)",
        explanation: `Mini project: build a typed CLI expense tracker with local JSON persistence.

Complexity ladder:
- Easy: typed expense model and CRUD operations.
- Medium: typed filtering, sorting, and summary reports.
- Hard: import/export with runtime validation and safe parsing.

Debugging focus: wrong union handling, optional fields, and failed JSON parse boundaries.

Refactor challenge: remove duplicated type aliases, introduce shared domain interfaces, and enforce stricter return types.

Interview insight: discuss why static typing reduced bug classes and where runtime validation remained required`,
        codeExample: `type ExpenseCategory = "food" | "travel" | "tools";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  createdAt: string;
}

function totalByCategory(expenses: Expense[], category: ExpenseCategory): number {
  return expenses
    .filter((e) => e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);
}
`,
        exercise: `Deliverables:
1. Implement the CLI mini project end to end.
2. Add at least 5 failing test cases before fixes.
3. Refactor one module to remove all type assertions.
4. Write a short architecture note: where to place runtime validation.
5. Mentor checkpoint: explain one bug that TypeScript caught and one it could not catch.`,
        commonMistakes: [
          "Modeling persisted JSON as trusted typed objects without validation",
          "Using broad string types instead of category unions",
          "Skipping edge cases for empty arrays and invalid totals",
          "Returning null in some branches and numbers in others",
          "Leaving tests untyped with implicit any"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "How would you defend your type model choices for this mini project?",
            a: "Explain domain invariants, where unions encode finite states, and where runtime guards protect untrusted input."
          },
          {
            type: "coding",
            q: "How do you keep report generation strongly typed when categories grow?",
            a: "Use category unions plus Record<ExpenseCategory, number> derived from source arrays to preserve exhaustive keys."
          }
        ]
      }
    ]
  },
  {
    id: "phase-2",
    title: "Phase 2: Intermediate Engineering",
    emoji: "🟡",
    description: "Master generics, utility patterns, mapped and conditional types, declaration files, and applied TypeScript in product code.",
    topics: [
      {
        id: "generics-mastery",
        title: "Generics Mastery: Constraints, Defaults, Reusable APIs",
        explanation: `Simple view: generics let one function or type work across many value types safely.

Deep view: generic parameters describe relationships between inputs and outputs. Constraints enforce required shape. Default generics reduce API noise for common cases. In production design, good generic APIs hide complexity while preserving precision and composability.

Real-world company pattern: shared platform libraries expose strongly typed repository, API client, and cache abstractions parameterized by domain models.

Debugging scenario: generic type leaks often occur when constraints are too weak, causing unknown or any propagation`,
        codeExample: `interface Entity {
  id: string;
}

interface Repository<T extends Entity = Entity> {
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
}

async function pluck<T, K extends keyof T>(items: T[], key: K): Promise<T[K][]> {
  return items.map((item) => item[key]);
}

type ApiResponse<TData, TError = { message: string }> = {
  data?: TData;
  error?: TError;
};
`,
        exercise: `Easy: create a generic Result<T, E> type.
Medium: implement a generic repository interface with constraints.
Hard: design a generic paginated API helper that preserves item and cursor types end to end.`,
        commonMistakes: [
          "Using unconstrained generics where key access requires extends keyof",
          "Over-abstracting with generics before stable domain patterns exist",
          "Returning any from generic helpers and losing type relationships",
          "Ignoring default generic parameters for ergonomics",
          "Using T everywhere instead of descriptive parameter names"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "Why are generic constraints important in production APIs?",
            a: "They encode minimum contracts and prevent invalid operations while keeping reusable implementations."
          },
          {
            type: "coding",
            q: "How do you write a type-safe pick function with generics?",
            a: "Use K extends keyof T and return Pick<T, K> or T[K] collections, preserving exact key relations."
          },
          {
            type: "scenario",
            q: "How would you review a PR with 8 nested generics in one type?",
            a: "Check clarity, extraction opportunities, test coverage, inferred output readability, and whether complexity delivers real API value."
          }
        ]
      },
      {
        id: "conditional-mapped-utility-types",
        title: "Conditional Types, Mapped Types, Utility Types, infer",
        explanation: `Simple view: these tools let you transform existing types into new types automatically.

Deep view: conditional types distribute over unions by default. mapped types iterate through keys and can remap with as clauses. infer captures parts of a type inside conditionals, enabling advanced extraction utilities. Built-in utilities (Partial, Required, Pick, Omit, ReturnType, Parameters, Awaited) are baseline; senior engineers also craft domain-specific utilities for DTO shaping and API compatibility.

Edge case: unintended distributive behavior can explode complexity or produce surprising unions`,
        codeExample: `type Nullable<T> = { [K in keyof T]: T[K] | null };

type ApiEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type DTO<T> = Omit<T, "createdAt" | "updatedAt">;

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type ValueOf<T> = T[keyof T];

type NonNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};
`,
        exercise: `1. Create your own DeepReadonly utility.
2. Create a utility that removes fields starting with underscore.
3. Build a conditional type that extracts successful payload from an API union.
4. Debug one distributive conditional bug by wrapping generic in tuple brackets.`,
        commonMistakes: [
          "Not understanding distributive conditional behavior over unions",
          "Building unreadable mega-utilities without tests",
          "Using deep mapped types in performance-sensitive hot compile paths",
          "Forgetting key remapping can drop required fields accidentally",
          "Reimplementing built-ins when standard utilities are enough"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "What does infer do in conditional types?",
            a: "It captures a part of a matched type into a type variable, enabling extracted return types, tuple items, or promise payloads."
          },
          {
            type: "tricky",
            q: "Why might a conditional type unexpectedly distribute over a union?",
            a: "Because naked type parameters in conditionals distribute by design. Wrap both sides in tuples to opt out."
          },
          {
            type: "coding",
            q: "How would you remove nullable fields from an object type?",
            a: "Use mapped types with conditional key remapping and NonNullable on value positions."
          }
        ]
      },
      {
        id: "narrowing-guards-predicates",
        title: "Discriminated Unions, Type Guards, Type Predicates, Template Literal Types",
        explanation: `Simple view: type guards are runtime checks that inform the compiler about specific types.

Deep view: custom predicates in the form value is X connect runtime control flow and compile-time narrowing. Discriminated unions with literal tags provide robust state modeling. Template literal types model string conventions (for example event names or route keys) and improve API safety in UI and backend event systems.

Production use case: strongly typed analytics events or domain commands reduce typo-driven bugs and simplify governance`,
        codeExample: `type EventName =
  | "auth:created"
  | "auth:failed"
  | "billing:created"
  | "billing:failed";

type User = { kind: "user"; id: string; email: string };
type Service = { kind: "service"; id: string; token: string };
type Principal = User | Service;

function isUser(principal: Principal): principal is User {
  return principal.kind === "user";
}

function describe(principal: Principal): string {
  if (isUser(principal)) return principal.email;
  return principal.token;
}

function publish(event: EventName) {
  return event;
}

publish("auth:created"); // ok
// publish("auth:deleted"); // compile error`,
        exercise: `Easy: define a discriminated union for payment states.
Medium: write custom predicates for external payload narrowing.
Hard: create a template-literal type system for app event names and enforce usage across modules.`,
        commonMistakes: [
          "Writing type guards that are not logically sound at runtime",
          "Using optional flags instead of discriminant tags for state machines",
          "Overusing string types where template literals provide safer patterns",
          "Mixing runtime validation assumptions with compile-time checks",
          "Skipping exhaustive checks after narrowing"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "What is the difference between a boolean-returning function and a type predicate?",
            a: "A predicate returns runtime boolean plus compile-time narrowing information using value is Type syntax."
          },
          {
            type: "scenario",
            q: "When would you choose discriminated unions over class hierarchies?",
            a: "When modeling finite state transitions or transport-friendly domain messages where exhaustive checks are valuable."
          },
          {
            type: "tricky",
            q: "Can an incorrect predicate make TypeScript trust invalid data?",
            a: "Yes. Predicates are trusted by the checker, so buggy runtime checks can reintroduce runtime failures."
          }
        ]
      },
      {
        id: "declarations-and-augmentation",
        title: "Declaration Files (.d.ts), Module Augmentation, Library Typing",
        explanation: `Simple view: declaration files describe types for JavaScript modules or global APIs.

Deep view: .d.ts files are contract surfaces consumed by the compiler without runtime implementation. Module augmentation extends existing declarations safely when a third-party package lacks specific types. Library authors should design stable public types, minimize breaking generic changes, and test declarations with dts tests.

Production scenario: patching incomplete third-party types in a monorepo while waiting for upstream fix`,
        codeExample: `// global.d.ts

declare global {
  interface Window {
    analytics?: {
      track(event: string, payload: Record<string, unknown>): void;
    };
  }
}

export {};

// module augmentation example
// declarations/express.d.ts

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    user?: {
      id: string;
      role: "admin" | "member";
    };
  }
}
`,
        exercise: `1. Write declarations for a tiny JavaScript utility package.
2. Add module augmentation for an Express Request user context.
3. Build one failing type test for wrong public API usage.
4. Create a migration plan to upstream your declaration patch.`,
        commonMistakes: [
          "Putting implementation code inside declaration files",
          "Augmenting wrong module name so declarations never apply",
          "Using any in public declaration surfaces",
          "Forgetting export {} in global declaration files when needed",
          "Introducing breaking declaration changes without semver discipline"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "What is the role of .d.ts files in the TypeScript ecosystem?",
            a: "They provide type contracts for JavaScript runtime code so editors and compilers can reason about usage safely."
          },
          {
            type: "scenario",
            q: "How do you handle broken third-party typings in a production app?",
            a: "Patch locally via module augmentation or local declarations, add type tests, and contribute upstream fix."
          },
          {
            type: "coding",
            q: "Where should Request augmentation for Express live in a project?",
            a: "In a declarations file included by tsconfig, typically under src/types or declarations with proper module target."
          }
        ]
      },
      {
        id: "phase2-practical-lab",
        title: "Phase 2 Practical Lab (Reusable Type Utilities Toolkit)",
        explanation: `Mini project: create an internal package named typed-toolkit used by frontend and backend.

Complexity ladder:
- Easy: generic Result and Paginated types.
- Medium: conditional extraction helpers and typed HTTP response modeling.
- Hard: declaration tests and no-any policy with strict CI.

Debugging challenges: distributive conditional surprises, module augmentation not applied, over-broad generic constraints.

Refactor task: split complex utility types into composable units with naming that supports onboarding`,
        codeExample: `export type Result<T, E = { message: string }> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type Paginated<T> = {
  items: T[];
  cursor?: string;
  hasMore: boolean;
};

export type SuccessData<T> = Extract<T, { ok: true }> extends { data: infer D }
  ? D
  : never;
`,
        exercise: `1. Publish the toolkit package in your workspace.
2. Integrate it into one Node module and one React module.
3. Add 6 coding exercises: easy 2, medium 2, hard 2.
4. Add 3 debugging drills where inferred types are wrong and must be corrected.
5. Mentor question: which utility should remain private and why?`,
        commonMistakes: [
          "Designing utilities before identifying repeated usage patterns",
          "Allowing utility names that hide domain intent",
          "Overly deep conditional stacks harming readability",
          "Skipping compatibility tests for package consumers",
          "Treating shared types as shared business logic"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "What governance rules would you enforce for shared utility types?",
            a: "Semver discipline, deprecation path, usage docs, example-first tests, and owner review for public API changes."
          },
          {
            type: "conceptual",
            q: "How do you decide if a utility belongs in a shared package?",
            a: "At least two stable consumers, clear domain value, and low likelihood of rapid API churn."
          }
        ]
      }
    ]
  },
  {
    id: "phase-3",
    title: "Phase 3: Advanced Production Patterns",
    emoji: "🟠",
    description: "Apply advanced type-system features to real Node.js, React, and React Native projects with production debugging and performance focus.",
    topics: [
      {
        id: "variance-recursive-typelevel",
        title: "Variance, Recursive Types, Type-Level Programming",
        explanation: `Simple view: variance explains when one generic type can substitute for another.

Deep view: function parameter positions are generally contravariant under strictFunctionTypes, return positions covariant. Misunderstanding this causes unsafe callback contracts. Recursive types model nested structures (trees, JSON-like values) and power advanced compile-time transformations, but they can increase checker workload.

Production relevance: event buses, plugin systems, and form builders frequently depend on safe generic callback variance`,
        codeExample: `type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JSONValue }
  | JSONValue[];

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type Handler<T> = (value: T) => void;

interface Animal { name: string }
interface Dog extends Animal { breed: string }

const handleAnimal: Handler<Animal> = (a) => {
  console.log(a.name);
};

const handleDog: Handler<Dog> = (d) => {
  console.log(d.breed);
};
`,
        exercise: `Easy: model recursive comment threads.
Medium: implement DeepPartial and DeepRequired safely.
Hard: explain variance outcomes for three callback assignment scenarios and prove with code.`,
        commonMistakes: [
          "Assuming variance behavior from other languages without checking TS rules",
          "Writing recursive types without base cases",
          "Ignoring checker performance for deeply recursive mapped types",
          "Using broad object constraints where unknown is safer",
          "Allowing unsafe function assignments in callback APIs"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "What is contravariance in function parameters and why does it matter?",
            a: "A function accepting broader input can substitute where narrower input is expected, protecting call sites from unsafe assumptions."
          },
          {
            type: "tricky",
            q: "Why can deep recursive utilities slow type checking?",
            a: "The checker repeatedly expands and compares nested conditional/mapped structures, increasing computation across large unions and objects."
          }
        ]
      },
      {
        id: "nodejs-backend-typescript",
        title: "TypeScript in Node.js Backend: APIs, DTOs, Validation, Data Layer",
        explanation: `Simple view: backend TypeScript improves API correctness, request/response contracts, and service boundaries.

Deep view: enforce DTO boundaries at controllers, validate untrusted payloads at edges, and keep domain models separate from transport models. Database layers should expose typed repositories, query result contracts, and transaction-safe units. Use runtime schema validation before casting unknown input into trusted types.

Production scenario: typed API contracts reduce integration bugs between backend and frontend teams`,
        codeExample: `import { Request, Response } from "express";

type CreateUserDTO = {
  email: string;
  name: string;
};

type UserResponseDTO = {
  id: string;
  email: string;
  name: string;
};

function isCreateUserDTO(input: unknown): input is CreateUserDTO {
  if (typeof input !== "object" || input === null) return false;
  const data = input as Record<string, unknown>;
  return typeof data.email === "string" && typeof data.name === "string";
}

export async function createUser(req: Request, res: Response) {
  if (!isCreateUserDTO(req.body)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const created: UserResponseDTO = {
    id: crypto.randomUUID(),
    email: req.body.email,
    name: req.body.name,
  };

  return res.status(201).json(created);
}
`,
        exercise: `1. Build a typed Express module with DTO validation.
2. Add typed service and repository layers with clear contracts.
3. Model API errors as discriminated unions.
4. Add one debugging drill: mismatch between DB nullable column and non-null API type.
5. Refactor exercise: remove shared any in middleware chain.`,
        commonMistakes: [
          "Treating request body as trusted typed data without validation",
          "Leaking ORM entity types directly to API response contracts",
          "Mixing transport DTOs with domain entities",
          "Skipping explicit nullability in database mappings",
          "Using type assertions instead of proper schema guards"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "How do DTO patterns improve long-term backend maintainability?",
            a: "They isolate transport contracts from internal models, enabling safer refactors and versioned API evolution."
          },
          {
            type: "conceptual",
            q: "Why is unknown better than any at API boundaries?",
            a: "unknown forces explicit validation and narrowing before usage, preventing unsafe property access."
          },
          {
            type: "coding",
            q: "How do you represent typed API errors consistently?",
            a: "Use a discriminated union with stable error codes and payload shapes for each failure category."
          }
        ]
      },
      {
        id: "react-typescript",
        title: "TypeScript in React: Props, Hooks, Reducers, Context, ForwardRef, Generic Components",
        explanation: `Simple view: React + TypeScript catches invalid props, state updates, and event handler mismatches early.

Deep view: type component contracts with explicit prop interfaces, infer state carefully, and design generic components for reusable UI primitives. useReducer with discriminated action unions improves predictability. Context typing should avoid nullable pitfalls by using strict providers and custom hooks. ForwardRef requires explicit generic typing to preserve ref and prop inference.

Production use case: design systems rely on generic components with constrained polymorphism`,
        codeExample: `import React, { createContext, useContext, useReducer, forwardRef } from "react";

type Action =
  | { type: "increment"; by: number }
  | { type: "reset" };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "increment":
      return state + action.by;
    case "reset":
      return 0;
    default:
      return state;
  }
}

const CountContext = createContext<{ count: number } | null>(null);

function useCount() {
  const ctx = useContext(CountContext);
  if (!ctx) throw new Error("useCount must be used inside provider");
  return ctx;
}

type BoxProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

const Input = forwardRef<HTMLInputElement, { label: string }>(function Input({ label }, ref) {
  return (
    <label>
      {label}
      <input ref={ref} />
    </label>
  );
});
`,
        exercise: `Easy: type a controlled form component.
Medium: implement a useReducer store with exhaustive action handling.
Hard: build a generic polymorphic button component with strict prop inference and ref support.`,
        commonMistakes: [
          "Using React.FC everywhere and hiding children/props intent",
          "Leaving context type nullable without guarded custom hook",
          "Typing event handlers as any in form-heavy components",
          "Breaking inference in generic components with overly broad extends",
          "Ignoring reducer exhaustive checks"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "How do discriminated unions improve reducer reliability?",
            a: "They guarantee each action variant is handled explicitly and compile errors appear when new actions are added but not implemented."
          },
          {
            type: "coding",
            q: "How do you type forwardRef for an input component?",
            a: "Use forwardRef<HTMLInputElement, Props> and keep the inner function named for debugging clarity."
          },
          {
            type: "scenario",
            q: "How would you prevent any leakage in a large React codebase?",
            a: "Enforce lint rules, noImplicitAny, shared typed hooks, and CI checks blocking explicit any unless justified."
          }
        ]
      },
      {
        id: "react-native-typescript",
        title: "TypeScript in React Native: Navigation, Redux/RTK, Async APIs, Crash Prevention",
        explanation: `Simple view: strict typing in React Native prevents many runtime crashes from route params, async responses, and state shape drift.

Deep view: navigation param lists should be single source of truth. Redux Toolkit selectors and slices should derive types from store setup. Async API boundaries require runtime validation and typed error unions. Folder architecture should separate screens, domain, data, and shared typed utilities for scale.

Production scenario: typed navigation removes entire classes of deep-link and param mismatch crashes`,
        codeExample: `type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: { section?: "account" | "security" };
};

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function fetchProfile(userId: string): Promise<ApiResult<{ id: string; name: string }>> {
  try {
    const res = await fetch("/api/profile/" + userId);
    const json = await res.json();
    if (!json || typeof json.name !== "string") {
      return { ok: false, message: "Invalid payload" };
    }
    return { ok: true, data: { id: String(json.id), name: json.name } };
  } catch {
    return { ok: false, message: "Network failure" };
  }
}
`,
        exercise: `1. Define a typed navigation map for 6 screens.
2. Add typed Redux slice and selectors.
3. Build async data flow with Result union and UI-safe error rendering.
4. Create a crash-prevention checklist tied to strict typing rules.
5. Refactor task: remove all any from a sample screen module.`,
        commonMistakes: [
          "Not centralizing route param types",
          "Casting API responses directly instead of validating",
          "Untyped Redux selectors returning broad unknown",
          "Mixing UI and domain types in one folder",
          "Suppressing strict errors that indicate crash risks"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "How does typing navigation reduce crash rates in React Native apps?",
            a: "It validates route names and params at compile time, preventing invalid navigation calls that would fail on device."
          },
          {
            type: "conceptual",
            q: "Why should mobile apps use typed Result unions for async operations?",
            a: "They force explicit success/error handling and avoid undefined access in unstable network conditions."
          }
        ]
      },
      {
        id: "phase3-practical-lab",
        title: "Phase 3 Practical Lab (Cross-Platform Domain Module)",
        explanation: `Mini project: implement a shared domain package used by Node API, React web app, and React Native app.

Complexity ladder:
- Easy: shared entity and validation contracts.
- Medium: typed API client and reducer integration.
- Hard: declaration-safe package exports with versioned DTO compatibility.

Debugging drills: variance issue in callbacks, incorrect mapped utility output, navigation param mismatch, and backend DTO drift.

Refactor assignment: split domain, transport, and view-model types; eliminate circular dependencies`,
        codeExample: `export interface Order {
  id: string;
  total: number;
  status: "new" | "paid" | "cancelled";
}

export type OrderEvent =
  | { type: "order.created"; order: Order }
  | { type: "order.paid"; orderId: string; paidAt: string };

export function isTerminalStatus(status: Order["status"]): boolean {
  return status === "paid" || status === "cancelled";
}
`,
        exercise: `1. Build and integrate the shared module in three apps.
2. Add 8 exercises: 3 easy, 3 medium, 2 hard.
3. Add 4 debugging scenarios and document root-cause analysis.
4. Add one guided refactor from broad types to discriminated contracts.
5. Mentor question: where should runtime validation live across this architecture?`,
        commonMistakes: [
          "Sharing frontend-only view model types with backend services",
          "Allowing breaking changes in shared contracts without versioning",
          "Coupling domain package to framework-specific dependencies",
          "Skipping compatibility tests across consumers",
          "Failing to enforce stable public exports"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "How do you keep shared types from becoming a monolith?",
            a: "Enforce domain boundaries, package ownership, minimal exports, and versioned contracts with explicit consumer tests."
          },
          {
            type: "conceptual",
            q: "What is the tradeoff of shared types in multi-platform apps?",
            a: "Faster consistency and fewer integration bugs versus tighter coupling if boundaries and version strategy are weak."
          }
        ]
      }
    ]
  },
  {
    id: "phase-4",
    title: "Phase 4: Expert / Architect",
    emoji: "🔴",
    description: "Architect large TypeScript systems: domain-driven typing, clean architecture, monorepo governance, performance tuning, and senior career preparation.",
    topics: [
      {
        id: "architecture-scalability",
        title: "Architecture & Scalability: Domain-Driven Typing + Clean Architecture",
        explanation: `Simple view: architecture defines how code is organized so teams can scale safely.

Deep view: model core domain types independent of frameworks. Use ports/adapters boundaries so infrastructure details do not leak into domain contracts. Separate command/query DTOs, domain entities, and view models. Design reusable generic utilities only where business invariants repeat. Favor explicit contracts over magical inference in cross-team APIs.

Production use case: multi-team monorepo with shared domain modules, independent deploy pipelines, and strict API contract versioning`,
        codeExample: `// Domain layer
export interface Invoice {
  id: string;
  amountCents: number;
  status: "draft" | "issued" | "paid";
}

export interface InvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  save(invoice: Invoice): Promise<void>;
}

// Application layer
export class IssueInvoice {
  constructor(private readonly repo: InvoiceRepository) {}

  async execute(id: string): Promise<Invoice> {
    const invoice = await this.repo.findById(id);
    if (!invoice) throw new Error("Not found");
    if (invoice.status !== "draft") throw new Error("Invalid state");
    const updated: Invoice = { ...invoice, status: "issued" };
    await this.repo.save(updated);
    return updated;
  }
}
`,
        exercise: `1. Design folder structure for domain, application, infrastructure, interface layers.
2. Define bounded contexts and type ownership rules.
3. Implement one use case with ports/adapters and strict types.
4. Add architectural decision record for contract versioning.
5. Refactor one feature to remove framework leakage from domain types.`,
        commonMistakes: [
          "Mixing framework DTOs directly into domain types",
          "Creating shared generic abstractions before domain stabilizes",
          "Skipping ownership rules for shared contracts",
          "Overusing global types folder as dumping ground",
          "Ignoring backward compatibility in API contracts"
        ],
        interviewQuestions: [
          {
            type: "conceptual",
            q: "What is domain-driven typing and why is it useful?",
            a: "It models business language and invariants directly in types, improving correctness and communication across teams."
          },
          {
            type: "scenario",
            q: "How do you prevent type coupling across bounded contexts?",
            a: "Use translation layers and public contracts; avoid importing internal domain types across context boundaries."
          }
        ]
      },
      {
        id: "monorepo-contracts-and-third-party",
        title: "Monorepo Type Sharing, API Contracts, Third-Party Typing Issues",
        explanation: `Simple view: shared types accelerate development when contracts are stable and governed.

Deep view: use project references and package boundaries for incremental builds. Keep shared contracts minimal and versioned. For third-party type gaps, use module augmentation or wrapper adapters rather than widespread assertions. Track unsafe casts and strictness debt as engineering metrics.

Performance and memory angle: large union-heavy contract packages can slow type checking; split by domain and avoid unnecessary deep recursive utilities in public surfaces`,
        codeExample: `// package: @contracts/orders
export interface OrderDTO {
  id: string;
  total: number;
  currency: "USD" | "EUR";
}

// third-party wrapper
interface SafeCache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
}

class CacheAdapter implements SafeCache {
  constructor(private readonly raw: { get(key: string): unknown; set(key: string, value: unknown): void }) {}

  get<T>(key: string): T | null {
    const value = rawGuard(this.raw.get(key));
    return (value as T) ?? null;
  }

  set<T>(key: string, value: T): void {
    this.raw.set(key, value);
  }
}

function rawGuard(input: unknown): unknown {
  return input;
}
`,
        exercise: `1. Create shared contracts packages with project references.
2. Implement consumer contract tests for 2 services.
3. Patch a third-party typing issue with module augmentation.
4. Track unsafe cast count and reduce by 50 percent.
5. Debug drill: contract mismatch after package minor release.`,
        commonMistakes: [
          "Publishing huge shared packages that couple unrelated domains",
          "Using type assertions as permanent workaround for vendor typings",
          "Skipping compatibility tests across consuming packages",
          "Ignoring compile-time performance impact of type-heavy APIs",
          "Breaking contracts in minor versions"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "How would you share types across a monorepo without creating tight coupling?",
            a: "Use small domain-focused packages, clear ownership, semver governance, and translation layers at context boundaries."
          },
          {
            type: "conceptual",
            q: "What is your strategy for third-party typing defects?",
            a: "Local adapter plus augmentation, automated type tests, then upstream contribution to reduce long-term maintenance cost."
          }
        ]
      },
      {
        id: "career-preparation",
        title: "Career Preparation: 30-Day Plan, 90-Day Mastery, Milestones, Interviews",
        explanation: `30-day plan (job-ready baseline): Week 1 fundamentals and strict tsconfig; Week 2 generics and utility types; Week 3 React/Node typed modules; Week 4 architecture patterns and interview prep.

90-day mastery roadmap: Month 1 foundational depth and mini projects, Month 2 advanced type system and cross-platform implementation, Month 3 architecture leadership, performance, and mentoring.

Weekly milestone checklist: concept mastery, project deliverable, debugging postmortem, refactoring task, and interview rehearsal.

Senior mindset: defend tradeoffs, discuss failure modes, show migration strategy, and justify type design with business impact`,
        codeExample: `// Weekly progress model you can track in code
export interface WeeklyCheckpoint {
  week: number;
  goals: string[];
  deliverable: string;
  bugsPrevented: number;
  interviewsPracticed: number;
}

export const plan: WeeklyCheckpoint[] = [
  {
    week: 1,
    goals: ["strict config", "core types", "narrowing"],
    deliverable: "typed module with tests",
    bugsPrevented: 0,
    interviewsPracticed: 0,
  },
];
`,
        exercise: `50 interview questions (basic to expert):
1. Difference between any and unknown?
2. How does control-flow narrowing work?
3. Interface vs type alias tradeoffs?
4. Why use discriminated unions?
5. What does keyof produce?
6. Explain conditional type distribution.
7. How does infer extract a type?
8. Utility types you use most in production?
9. strictNullChecks impact?
10. noUncheckedIndexedAccess impact?
11. exactOptionalPropertyTypes impact?
12. Why avoid broad type assertions?
13. Model exhaustive switch with never.
14. Generic constraints real example.
15. Default generics when useful?
16. Covariance vs contravariance in TS callbacks?
17. Why use DTO boundaries?
18. Runtime validation vs compile-time types?
19. Declaration merging use case?
20. Module augmentation risk?
21. How to type Express middleware chain?
22. How to type async API errors?
23. How to type useReducer actions?
24. How to type Context safely?
25. forwardRef typing pitfalls?
26. Polymorphic component typing strategy?
27. Navigation typing in React Native?
28. Redux selector typing approach?
29. Type-safe API client design?
30. Shared contracts in monorepo?
31. Project references benefits?
32. Preventing any leakage in CI?
33. Handling third-party broken typings?
34. When to use branded types?
35. How to model money/currency safely?
36. How to model finite state machines?
37. Recursive types use cases?
38. Template literal types in production?
39. Type-level performance bottlenecks?
40. Diagnose slow tsc build strategy?
41. How to design public library types?
42. Backward compatibility for type APIs?
43. Migration strategy from JavaScript to strict TS?
44. Handling optional vs nullable fields?
45. Guarding external JSON boundaries?
46. Anti-patterns in shared types?
47. When to accept targeted any escape hatch?
48. Senior code review checklist for TS?
49. How to teach TS to junior engineers?
50. How do types improve business reliability metrics?

20 coding challenges with solution direction:
1. Typed deep merge utility (solution: recursive mapped type + runtime merge).
2. Discriminated payment reducer (solution: exhaustive switch with never).
3. Safe API parser from unknown (solution: type guards).
4. Generic event bus (solution: mapped handler signatures).
5. Typed repository pattern (solution: constrained generic interface).
6. Template-literal route keys (solution: union composition).
7. Deep readonly utility (solution: recursive conditional mapped type).
8. Optional-to-required transformer (solution: mapped modifiers).
9. Promise result unwrapping (solution: infer in conditional).
10. Dynamic form schema typing (solution: keyed generic model).
11. Typed cache wrapper (solution: generic get/set contracts).
12. Function overload API wrapper (solution: signatures + single impl).
13. Strongly typed React table (solution: T + keyof columns).
14. useReducer action map builder (solution: union helpers).
15. Route-param safe navigator (solution: param list map).
16. Monorepo shared contract package (solution: project references).
17. DTO mapper with null handling (solution: explicit nullable strategy).
18. Type-safe feature flags (solution: literal unions + records).
19. Compile-time permission matrix (solution: mapped intersections).
20. Generic command handler registry (solution: discriminated command union).

10 debugging scenarios:
1. Runtime crash from unchecked API payload.
2. Narrowing fails after refactor due to broad assertion.
3. React context null bug in test environment.
4. Navigation param mismatch in React Native deep link.
5. DTO drift between backend and frontend packages.
6. Recursive type causes IDE slowdown.
7. Third-party type mismatch after dependency upgrade.
8. Excess property check catches wrong object literal.
9. Optional field semantics changed by exactOptionalPropertyTypes.
10. Unexpected any from implicit generic inference.

Senior conceptual prompts:
- Which invariants belong in types vs runtime checks?
- How do you measure ROI of strict typing?
- How do you evolve shared contracts without blocking delivery?`,
        commonMistakes: [
          "Studying theory without shipping phase projects",
          "Ignoring debugging and refactoring practice",
          "Memorizing interview answers without architecture reasoning",
          "Skipping progress tracking and milestone retrospectives",
          "Not practicing system-level tradeoff explanations"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "How would you present your 90-day TypeScript mastery plan to a hiring manager?",
            a: "Show progressive deliverables, architecture complexity growth, measurable quality outcomes, and documented debugging/refactoring evidence."
          },
          {
            type: "conceptual",
            q: "What differentiates a senior TypeScript engineer from a mid-level one?",
            a: "Senior engineers design stable contracts, manage tradeoffs across teams, prevent systemic bugs, and optimize developer velocity with pragmatic strictness."
          }
        ]
      },
      {
        id: "capstone-production-project",
        title: "Capstone: Production-Grade Full-Stack App with Shared Types",
        explanation: `Build one large project: a scalable workspace platform with Node API, React web dashboard, and React Native companion app.

Mandatory architecture goals:
- Shared contracts package with versioned DTOs.
- Runtime validation at every external boundary.
- Strict TypeScript config across all apps.
- Domain-driven modules and clean architecture layering.
- Typed observability events and error contracts.

Delivery expectations: CI typecheck gates, integration tests across packages, and an architecture document explaining tradeoffs`,
        codeExample: `// shared/contracts/src/task.ts
export interface TaskDTO {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  ownerId: string;
}

// backend service returns TaskDTO[]
// web and mobile consume same type contract

export type ApiError =
  | { code: "VALIDATION_ERROR"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "UNAUTHORIZED"; message: string };
`,
        exercise: `Capstone checklist:
1. Implement 3 bounded contexts with explicit contracts.
2. Add 12 end-to-end scenarios, including failure paths.
3. Add 5 refactoring commits proving type-safe evolution.
4. Add postmortem for at least 3 bugs prevented by TypeScript.
5. Prepare architecture defense: scaling, reliability, and maintainability.

Difficulty progression:
- Easy: base CRUD + shared models.
- Medium: auth, role-based access, offline queue.
- Hard: event-driven updates, contract versioning, and backward compatibility.`,
        commonMistakes: [
          "Using shared types without version strategy",
          "Skipping runtime validation in one service and creating trust gaps",
          "No ownership model for cross-package contracts",
          "Treating type errors as blockers instead of design signals",
          "Ignoring performance diagnostics in large type-heavy workspaces"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "How do you defend this capstone as senior-level work?",
            a: "Demonstrate contract governance, boundary validation, architecture decisions, and measurable reliability gains from typed design."
          },
          {
            type: "coding",
            q: "What evidence shows your app is type-safe and production-focused?",
            a: "Strict CI gates, no-any policy exceptions with rationale, cross-package integration tests, and documented runtime validation strategy."
          }
        ]
      },
      {
        id: "mentor-mode",
        title: "Mentor Mode: Senior Thinking Drills",
        explanation: `After each major section, challenge yourself with conceptual, debugging, and production simulation prompts.

Conceptual drill examples:
- Why is this type abstraction necessary?
- What failure mode is still possible at runtime?
- How would this contract evolve without breaking consumers?

Debugging drill examples:
- Find the unsafe cast causing silent runtime data corruption.
- Resolve a narrowing bug introduced by a helper abstraction.
- Diagnose type-check slowdown from recursive mapped types.

Production simulation:
- Incident: mobile crash due to invalid route params.
- Incident: backend accepts wrong payload shape after dependency update.
- Incident: monorepo package release breaks 3 consumers.

Goal: think like a senior architect, not only a syntax expert`,
        codeExample: `type Incident = {
  id: string;
  severity: "low" | "medium" | "high";
  rootCause: "typing-gap" | "runtime-validation-gap" | "contract-drift";
};

function triage(incident: Incident): string {
  if (incident.severity === "high" && incident.rootCause === "contract-drift") {
    return "rollback + contract patch + consumer test";
  }
  return "stabilize and add regression checks";
}
`,
        exercise: `Mentor challenges:
1. Conceptual: Explain when unknown should become branded domain type.
2. Debugging: Fix 3 intentionally broken type guards.
3. Simulation: Design rollback and forward-fix plan for a broken shared contract.
4. Refactor: simplify one over-engineered generic API.
5. Interview simulation: answer 5 senior architecture questions with tradeoff analysis.`,
        commonMistakes: [
          "Optimizing for clever type tricks over team readability",
          "Ignoring incident feedback loops in architecture decisions",
          "Avoiding refactors due to fear of broad type impact",
          "Treating mentoring as optional instead of leadership responsibility",
          "Not documenting tradeoffs behind type system decisions"
        ],
        interviewQuestions: [
          {
            type: "scenario",
            q: "A critical incident escaped compile-time checks. What is your remediation plan?",
            a: "Patch runtime guard, add regression tests, improve boundary typing, and update architecture playbook with prevention controls."
          },
          {
            type: "conceptual",
            q: "How do you balance type strictness and delivery speed as a tech lead?",
            a: "Set strict defaults, allow controlled escape hatches with review, and track debt burn-down while preserving release cadence."
          }
        ]
      }
    ]
  }
];

export default typescriptPhases;
