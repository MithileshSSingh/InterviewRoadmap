const tsPhase4 = {
  id: "phase-4",
  title: "Phase 4: TypeScript in Real Projects",
  emoji: "🔴",
  description: "Apply TypeScript to production codebases — React, Node.js, state management, library authoring, and architecture patterns.",
  topics: [
    {
      id: "typing-react",
      title: "Typing React: Props, Hooks, Context & Generics",
      explanation: `React and TypeScript are a natural fit — TypeScript catches prop misuse, hook errors, and context issues at compile time. Modern React (function components + hooks) is where TypeScript shines.

**Component typing patterns:**
- \`React.FC<Props>\` — Functional component type (debated — many teams avoid it)
- Direct annotation: \`function MyComponent(props: Props): JSX.Element\`
- \`React.PropsWithChildren<Props>\` — Add \`children\` to your props

**Hook typing:**
- \`useState<T>()\` — Usually inferred, but specify for complex/union state
- \`useRef<T>(null)\` — The generic determines what the ref points to
- \`useReducer\` — Discriminated unions for actions → exhaustive type safety

**Event typing:**
- \`React.ChangeEvent<HTMLInputElement>\` — Input change events
- \`React.FormEvent<HTMLFormElement>\` — Form submission
- \`React.MouseEvent<HTMLButtonElement>\` — Click events

**Generic components** let you build reusable components where the data type flows through — like a \`<List<T>>\` that knows the type of each item.

🏠 **Real-world analogy:** TypeScript in React is like having a building inspector review your blueprints (props) before construction (rendering). Wrong wiring (prop types)? Caught before the walls go up, not after a fire.`,
      codeExample: `// Component with typed props
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function Button({ label, variant = "primary", disabled, onClick }: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Children typing
interface CardProps {
  title: string;
  children: React.ReactNode; // Accepts anything renderable
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// ⭐ useState with unions (discriminated union state)
type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; data: { id: string } }
  | { status: "error"; error: string };

function useFormSubmit() {
  const [state, setState] = React.useState<FormState>({ status: "idle" });

  async function submit(data: FormData) {
    setState({ status: "submitting" });
    try {
      const result = await fetch("/api/submit", { method: "POST", body: data });
      const json = await result.json();
      setState({ status: "success", data: json });
    } catch (e) {
      setState({ status: "error", error: (e as Error).message });
    }
  }
  return { state, submit };
}

// useRef typing
function TextInput() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef.current?.focus(); // Optional chaining — ref might be null
  }

  return <input ref={inputRef} />;
}

// useReducer with discriminated union actions
type CounterAction =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset"; payload: number };

function counterReducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case "increment": return state + 1;
    case "decrement": return state - 1;
    case "reset": return action.payload;
  }
}

// ⭐ Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

// Usage — T is inferred as User!
// <List
//   items={users}
//   renderItem={(user) => <span>{user.name}</span>}
//   keyExtractor={(user) => user.id.toString()}
// />

// Context with TypeScript
interface AuthContext {
  user: { id: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContext | null>(null);

function useAuth(): AuthContext {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}`,
      exercise: `**Mini Exercise:**
1. Create a typed form component with \`onChange\` handlers for different input types
2. Build a generic \`<Select<T>>\` component where options and selected value are typed
3. Use \`useReducer\` with a discriminated union of 5+ action types
4. Create a typed Context + custom hook pattern with proper null-safety
5. Type a \`useDebounce<T>\` hook that preserves the generic type of the debounced value`,
      commonMistakes: [
        "Using `React.FC` and relying on its implicit `children` — React 18 removed implicit children from FC; always declare children explicitly in props",
        "Typing state as the initial value's type only — `useState('')` gives `string`, but if state can be `null`, use `useState<string | null>(null)`",
        "Forgetting that `useRef<T>(null)` starts as null — always use optional chaining `ref.current?.method()` or check for null",
        "Creating context without a null check — `createContext(undefined as any)` is unsafe; use a custom hook that throws if context is null",
        "Over-typing event handlers — `(e: React.ChangeEvent<HTMLInputElement>) => void` on every handler; often the inline type is inferred"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Should you use `React.FC<Props>` or direct prop typing?",
          a: "Direct prop typing is recommended: `function Btn(props: Props)`. `React.FC` had issues: 1) Implicit `children` (removed in React 18). 2) Doesn't support generics well. 3) Adds component return type constraints. Direct typing is simpler, supports generics, and is what the React team recommends."
        },
        {
          type: "coding",
          q: "Create a type-safe `useLocalStorage<T>` hook.",
          a: "```ts\\nfunction useLocalStorage<T>(key: string, initial: T) {\\n  const [value, setValue] = useState<T>(() => {\\n    const stored = localStorage.getItem(key);\\n    return stored ? JSON.parse(stored) : initial;\\n  });\\n\\n  useEffect(() => {\\n    localStorage.setItem(key, JSON.stringify(value));\\n  }, [key, value]);\\n\\n  return [value, setValue] as const;\\n}\\n// const [theme, setTheme] = useLocalStorage('theme', 'dark');\\n// theme: string, setTheme: Dispatch<SetStateAction<string>>\\n```"
        },
        {
          type: "tricky",
          q: "How do you make a generic React component?",
          a: "Use a generic function (not `React.FC`): `function List<T>(props: ListProps<T>) { ... }`. The generic T flows through props — if `items` is `User[]`, the `renderItem` callback receives `User`. For arrow functions: `const List = <T,>(props: ListProps<T>) => ...` (comma after T prevents JSX ambiguity)."
        },
        {
          type: "conceptual",
          q: "How should you type React Context for type safety?",
          a: "1) Define the context type interface. 2) Create context with `createContext<Type | null>(null)`. 3) Create a custom hook: `function useMyContext() { const ctx = useContext(MyContext); if (!ctx) throw new Error('...'); return ctx; }`. This gives non-null types to consumers without casting. Never use `as any` for default values."
        },
        {
          type: "scenario",
          q: "You're building a data table component. How would you type it for maximum reusability?",
          a: "```ts\\ninterface Column<T> {\\n  key: keyof T & string;\\n  header: string;\\n  render?: (value: T[keyof T], row: T) => ReactNode;\\n}\\ninterface TableProps<T> {\\n  data: T[];\\n  columns: Column<T>[];\\n  onRowClick?: (row: T) => void;\\n}\\nfunction Table<T extends Record<string, any>>({\\n  data, columns, onRowClick\\n}: TableProps<T>) { ... }\\n```\\nGeneric T flows through — columns are constrained to valid keys."
        }
      ]
    },
    {
      id: "typing-nodejs-express",
      title: "Typing Node.js & Express APIs",
      explanation: `TypeScript transforms Node.js/Express development — catching request/response bugs, typing middleware, and ensuring API contracts at compile time.

**Key packages:**
- \`@types/node\` — Type definitions for Node.js APIs
- \`@types/express\` — Type definitions for Express

**Request/Response typing:**
Express generics let you type the request body, params, query, and response body: \`Request<Params, ResBody, ReqBody, Query>\`.

**Middleware typing:**
Properly typed middleware passes type information through the chain — each middleware can augment the Request type.

**DTO pattern (Data Transfer Objects):**
Define interfaces for request/response shapes and validate at runtime (with Zod, io-ts, or manual guards). TypeScript types alone don't validate runtime data — you need both.

**Module augmentation** extends Express types — adding \`user\` to \`Request\` for auth middleware.

🏠 **Real-world analogy:** Typing Express APIs is like having a contract for every API endpoint. The contract specifies exactly what must be sent (request body), what will be returned (response), and what can go wrong (error types). Both the client and server agree on the contract before any code runs.`,
      codeExample: `// Setup: npm i express && npm i -D @types/express @types/node typescript
// tsconfig: "types": ["node"]

import express, { Request, Response, NextFunction } from "express";

// Define DTOs
interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

// Typed request handler
// Request<Params, ResBody, ReqBody, Query>
const createUser = async (
  req: Request<{}, UserResponse | ApiError, CreateUserDTO>,
  res: Response<UserResponse | ApiError>
) => {
  const { name, email, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: {
        name: !name ? ["Name is required"] : [],
        email: !email ? ["Email is required"] : []
      }
    });
  }

  const user: UserResponse = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString()
  };

  return res.status(201).json(user);
};

// Typed params
interface GetUserParams {
  id: string;
}
const getUser = async (
  req: Request<GetUserParams>,
  res: Response<UserResponse | ApiError>
) => {
  const { id } = req.params; // Type: string (typed!)
  // ... fetch user
};

// Typed query parameters
interface ListUsersQuery {
  page?: string;
  limit?: string;
  sort?: "name" | "createdAt";
}
const listUsers = async (
  req: Request<{}, UserResponse[], {}, ListUsersQuery>,
  res: Response<UserResponse[]>
) => {
  const page = parseInt(req.query.page ?? "1");
  const limit = parseInt(req.query.limit ?? "10");
  // ...
};

// Module augmentation — add user to Request
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: "admin" | "user" };
    }
  }
}

// Typed middleware
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", code: "AUTH_ERROR" });
  }
  req.user = { id: "user-123", role: "admin" }; // Type-safe!
  next();
};

// Error handling middleware (4 params = error handler)
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR"
  });
};

// App setup
const app = express();
app.use(express.json());
app.post("/users", createUser);
app.get("/users/:id", authMiddleware, getUser);
app.get("/users", listUsers);
app.use(errorHandler);

console.log("Express app with TypeScript types");`,
      exercise: `**Mini Exercise:**
1. Type a full CRUD Express router for a "Post" resource with proper DTOs
2. Create typed middleware for authentication that augments the Request type
3. Use Zod to validate request bodies and infer TypeScript types from schemas
4. Type an error-handling middleware that handles different error subclasses
5. Create a generic typed controller factory: \`createCRUD<TEntity, TCreate, TUpdate>()\``,
      commonMistakes: [
        "Not validating request bodies at runtime — TypeScript types are compile-time only; req.body is `any` at runtime. Use Zod/joi for validation",
        "Using `any` for request/response types — defeats the purpose; always type the generics: `Request<Params, ResBody, ReqBody, Query>`",
        "Forgetting that Express query params are always strings — `req.query.page` is `string | undefined`, not `number`",
        "Not augmenting Request type for middleware-added properties — without declaration merging, `req.user` won't be typed",
        "Typing the response but not enforcing it — `res.json()` doesn't validate the shape; it trusts your types. Bugs can still occur"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you type Express request handlers in TypeScript?",
          a: "Use the `Request<Params, ResBody, ReqBody, Query>` generic: 1st param = URL params, 2nd = response body type, 3rd = request body type, 4th = query params type. The `Response<T>` generic types the `.json()` response. This gives compile-time safety for handler inputs and outputs."
        },
        {
          type: "coding",
          q: "How do you add custom properties to Express Request using module augmentation?",
          a: "```ts\\n// types/express.d.ts\\ndeclare global {\\n  namespace Express {\\n    interface Request {\\n      user?: { id: string; role: string };\\n      requestId: string;\\n    }\\n  }\\n}\\nexport {}; // Makes this a module\\n\\n// Now req.user and req.requestId are typed everywhere\\n```"
        },
        {
          type: "tricky",
          q: "Why should you validate request bodies at runtime even with TypeScript?",
          a: "TypeScript types are erased at compile time — `req.body` is `any` at runtime regardless of your type annotation. A client can send anything. You MUST validate with runtime tools: Zod (`z.object({}).parse(req.body)`), class-validator, joi, etc. TypeScript ensures your code handles the validated data correctly; validation ensures the data is actually correct."
        },
        {
          type: "conceptual",
          q: "How do you type Express middleware that modifies the request?",
          a: "Use module augmentation to add properties to the Express Request interface. Then in middleware, assign the property: `req.user = decoded;`. All subsequent handlers see the typed property. For conditional properties (might not exist if middleware doesn't run), use optional: `user?: UserInfo`. For required, use a typed wrapper: `assertAuthenticated(req)` that narrows."
        },
        {
          type: "scenario",
          q: "You're building a REST API with shared types between frontend and backend. How do you structure this?",
          a: "Create a shared `types` package (or `shared/` folder in a monorepo): ```ts\\n// shared/types/api.ts\\nexport interface CreateUserDTO { name: string; email: string; }\\nexport interface UserResponse { id: string; name: string; email: string; }\\nexport interface ApiError { message: string; code: string; }\\n```\\nBoth frontend (fetch calls) and backend (handlers) import the same types. Use a monorepo tool (Turborepo, Nx) to manage the shared dependency."
        }
      ]
    },
    {
      id: "typed-state-management",
      title: "Type-Safe State Management",
      explanation: `State management libraries like **Redux Toolkit (RTK)**, **Zustand**, and **Jotai** have first-class TypeScript support. Typing state correctly prevents entire categories of bugs — wrong action payloads, accessing non-existent state, and stale selectors.

**Redux Toolkit (RTK):**
- \`createSlice\` infers action types and payload types from reducers
- Typed \`useSelector\` and \`useDispatch\` hooks via a custom \`RootState\` type
- \`createAsyncThunk\` types async action lifecycle (pending/fulfilled/rejected)

**Zustand:** Simpler API, excellent TypeScript inference. Define the store type and Zustand infers everything.

**Key patterns:**
- **Typed root state** — Derive from store: \`type RootState = ReturnType<typeof store.getState>\`
- **Typed dispatch** — \`type AppDispatch = typeof store.dispatch\`
- **Typed selectors** — \`(state: RootState) => state.user.name\`
- **Discriminated union actions** — Each action has a unique \`type\` with typed \`payload\`

🏠 **Real-world analogy:** Typed state management is like a typed spreadsheet. Each column has a defined type (text, number, date), and the spreadsheet rejects invalid entries. Without types, it's like a free-form notebook — anything goes, and errors are discovered when you try to use the data.`,
      codeExample: `// ========== REDUX TOOLKIT ==========
// import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define state shape
interface TodoState {
  items: Todo[];
  filter: "all" | "active" | "completed";
  loading: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const initialState: TodoState = {
  items: [],
  filter: "all",
  loading: false,
};

// createSlice — actions are auto-typed from reducers
// const todoSlice = createSlice({
//   name: "todos",
//   initialState,
//   reducers: {
//     addTodo(state, action: PayloadAction<{ text: string }>) {
//       state.items.push({
//         id: crypto.randomUUID(),
//         text: action.payload.text,
//         completed: false,
//         createdAt: Date.now(),
//       });
//     },
//     toggleTodo(state, action: PayloadAction<{ id: string }>) {
//       const todo = state.items.find((t) => t.id === action.payload.id);
//       if (todo) todo.completed = !todo.completed;
//     },
//     removeTodo(state, action: PayloadAction<{ id: string }>) {
//       state.items = state.items.filter((t) => t.id !== action.payload.id);
//     },
//     setFilter(state, action: PayloadAction<TodoState["filter"]>) {
//       state.filter = action.payload;
//     },
//   },
// });

// Typed hooks (create once, use everywhere)
// type RootState = ReturnType<typeof store.getState>;
// type AppDispatch = typeof store.dispatch;
// const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// const useAppDispatch = () => useDispatch<AppDispatch>();

// Usage in component:
// const todos = useAppSelector((state) => state.todos.items);
// const dispatch = useAppDispatch();
// dispatch(todoSlice.actions.addTodo({ text: "Learn TS" })); // ✅ Type-safe

// ========== ZUSTAND ==========
// import { create } from "zustand";

interface AuthStore {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<{ name: string; email: string }>) => void;
}

// const useAuthStore = create<AuthStore>((set, get) => ({
//   user: null,
//   token: null,
//   isAuthenticated: false,
//
//   login: async (email, password) => {
//     const res = await fetch("/api/login", {
//       method: "POST",
//       body: JSON.stringify({ email, password }),
//     });
//     const { user, token } = await res.json();
//     set({ user, token, isAuthenticated: true });
//   },
//
//   logout: () => {
//     set({ user: null, token: null, isAuthenticated: false });
//   },
//
//   updateProfile: (updates) => {
//     const current = get().user;
//     if (current) {
//       set({ user: { ...current, ...updates } });
//     }
//   },
// }));

// Usage: const { user, login } = useAuthStore();
// Fully typed — login expects (string, string), user is typed or null

// Typed selectors pattern
// const userName = useAuthStore((state) => state.user?.name);
// Type: string | undefined

console.log("State management with full TypeScript support");`,
      exercise: `**Mini Exercise:**
1. Create a Redux Toolkit slice with typed actions and selectors for a shopping cart
2. Build a Zustand store with typed state and actions for a theme manager
3. Type an async thunk that fetches paginated data with typed request/response
4. Create typed selector functions that derive computed state
5. Use \`PayloadAction<T>\` to ensure action payloads match expected types`,
      commonMistakes: [
        "Not creating typed hooks (`useAppSelector`, `useAppDispatch`) — using untyped `useSelector` loses all type safety",
        "Typing Redux state as `any` — always define `RootState = ReturnType<typeof store.getState>` for full inference",
        "Using `useSelector(state => state.user)` without RootState type — the selector parameter needs the typed root state",
        "Not typing async thunk error cases — `createAsyncThunk` has `pending`, `fulfilled`, AND `rejected` states; type all three",
        "In Zustand, not providing the generic type — `create<StoreType>()` is essential for type inference to work correctly"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Redux Toolkit achieve type safety with createSlice?",
          a: "RTK's `createSlice` infers action types and payload types from the reducer definitions. When you write `addTodo(state, action: PayloadAction<{text: string}>)`, RTK generates an action creator `addTodo({text: string})` that's fully typed. Combined with typed `RootState` and `AppDispatch`, the entire flow from dispatch to state selection is type-safe."
        },
        {
          type: "coding",
          q: "Set up typed Redux hooks for a TypeScript project.",
          a: "```ts\\nimport { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';\\nimport type { RootState, AppDispatch } from './store';\\n\\nexport const useAppDispatch = () => useDispatch<AppDispatch>();\\nexport const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;\\n\\n// Usage:\\nconst user = useAppSelector(state => state.auth.user);\\nconst dispatch = useAppDispatch();\\ndispatch(loginAction({ email: '...' })); // ✅ Fully typed\\n```"
        },
        {
          type: "tricky",
          q: "How does Zustand's TypeScript support differ from Redux?",
          a: "Zustand infers types from the store definition. You define events with `create<StoreType>((set, get) => ({...}))` and the store is immediately typed. No action types, no reducers, no separate type declarations. Everything is co-located. For selectors, Zustand's types flow automatically: `useStore(s => s.user)` returns the correct type."
        },
        {
          type: "conceptual",
          q: "What is the `PayloadAction<T>` type in Redux Toolkit?",
          a: "`PayloadAction<T>` types a Redux action with a `payload` property of type `T` and a `type` string. It's used in `createSlice` reducers: `reducer(state, action: PayloadAction<{id: string}>)` ensures `action.payload.id` is typed as `string`. It replaces the manual `{ type: string; payload: T }` pattern."
        },
        {
          type: "scenario",
          q: "You're choosing between Redux Toolkit and Zustand for a new React project. Type safety considerations?",
          a: "Both have excellent TS support. **RTK**: More ceremony but stronger patterns — typed actions prevent dispatch mistakes, `createAsyncThunk` types async lifecycle. Better for large teams needing strict patterns. **Zustand**: Less boilerplate, types flow naturally from store definition. Better for smaller apps or when simplicity matters. Choose RTK for large, complex state; Zustand for simpler, leaner projects."
        }
      ]
    },
    {
      id: "building-typed-libraries",
      title: "Building Type-Safe Libraries & Module Augmentation",
      explanation: `Building TypeScript libraries requires a different mindset than application code — you're designing APIs that OTHER developers consume. The types ARE your API surface.

**Key concerns for library authors:**
- **Exported types** — What types do consumers see? Minimize exposed surface area
- **Declaration files** — Ship \`.d.ts\` files so consumers get types auto-complete
- **\`package.json\` \`exports\`** — The modern way to define entry points and type resolution
- **Generic APIs** — Make types flow through without forcing consumers to specify generics
- **Module augmentation** — Allow consumers to extend your types

**Declaration file generation:**
- \`declaration: true\` in tsconfig generates \`.d.ts\` files
- \`declarationMap: true\` enables "Go to Definition" for your library
- \`emitDeclarationOnly: true\` when using a separate bundler (esbuild, Rollup)

**\`package.json\` setup for typed libraries:**
\`\`\`text
"main": "./dist/index.js",
"types": "./dist/index.d.ts",
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs" }
}
\`\`\`

**Module augmentation** lets consumers add types to YOUR library:
\`\`\`text
declare module "your-lib" {
  interface Config { customField: string; }
}
\`\`\`

🏠 **Real-world analogy:** Building a typed library is like manufacturing a power tool with standardized fittings. The tool (library) must work with any compatible accessory (consumer types). The specification sheet (.d.ts) tells users exactly what's compatible. Module augmentation is like an adapter kit that lets users add new fittings.`,
      codeExample: `// Building a typed event emitter library
// ==========================================

// Consumer defines their event map
interface EventMap {
  [event: string]: any; // Base (consumers extend this)
}

// Type-safe event emitter
class TypedEmitter<Events extends EventMap> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners.get(event)?.forEach((handler) => handler(payload));
  }

  off<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void
  ): void {
    this.listeners.get(event)?.delete(handler);
  }
}

// Consumer usage — fully type-safe!
interface AppEvents {
  login: { userId: string; timestamp: number };
  logout: { reason: string };
  error: { message: string; code: number };
}

const bus = new TypedEmitter<AppEvents>();

bus.on("login", (payload) => {
  console.log(payload.userId);    // ✅ Type: string
  console.log(payload.timestamp); // ✅ Type: number
});

bus.emit("login", { userId: "123", timestamp: Date.now() }); // ✅
// bus.emit("login", { wrong: "field" }); // ❌ Type error!
// bus.emit("typo", {});                   // ❌ "typo" not in AppEvents

// Builder pattern with fluent API
class QueryBuilder<T extends Record<string, any>> {
  private conditions: string[] = [];
  private selectedFields: (keyof T)[] = [];

  select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>> {
    this.selectedFields = fields as any;
    return this as any;
  }

  where<K extends keyof T>(
    field: K,
    op: "=" | "!=" | ">" | "<",
    value: T[K]
  ): this {
    this.conditions.push(\`\${String(field)} \${op} \${JSON.stringify(value)}\`);
    return this;
  }

  build(): string {
    const fields = this.selectedFields.length
      ? this.selectedFields.join(", ")
      : "*";
    const where = this.conditions.length
      ? \` WHERE \${this.conditions.join(" AND ")}\`
      : "";
    return \`SELECT \${fields}\${where}\`;
  }
}

// Type-safe query builder usage
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const query = new QueryBuilder<User>()
  .select("name", "email")  // Only valid User keys
  .where("age", ">", 18)    // Value must match type of 'age' (number)
  .build();

// Module augmentation — allow consumers to extend
// In your library:
export interface PluginRegistry {}

export function registerPlugin<K extends keyof PluginRegistry>(
  name: K,
  plugin: PluginRegistry[K]
): void {
  // ...
}

// Consumer code:
// declare module "your-lib" {
//   interface PluginRegistry {
//     analytics: { track(event: string): void };
//     auth: { login(token: string): void };
//   }
// }
// registerPlugin("analytics", { track: (e) => {} }); // ✅ Type-safe!`,
      exercise: `**Mini Exercise:**
1. Build a type-safe \`EventEmitter<EventMap>\` with \`on\`, \`emit\`, and \`off\`
2. Create a builder pattern with fluent API that preserves types at each step
3. Set up a library's \`package.json\` with proper \`types\` and \`exports\` fields
4. Create a plugin system using module augmentation (consumers add their types)
5. Write a generic \`Validator<Schema>\` that infers the output type from the schema`,
      commonMistakes: [
        "Not generating declaration files — without `.d.ts`, consumers won't get any type information; enable `declaration: true`",
        "Exporting too many types — minimize your public type surface; only export what consumers need",
        "Not testing types — use `tsd` or `expect-type` to verify your library's types work as expected for consumers",
        "Making every generic parameter required — use defaults (`<T = any>`) and inference so consumers rarely need to specify generics",
        "Breaking types in minor versions — type changes are breaking changes! A type change can break consumer builds"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What should a library author consider for TypeScript type safety?",
          a: "1) Generate `.d.ts` with `declaration: true`. 2) Ship source maps with `declarationMap: true`. 3) Use `exports` field in package.json with `types` condition. 4) Design generic APIs that infer types (minimize explicit generics). 5) Test types separately. 6) Support module augmentation for extensibility. 7) Treat type changes as breaking changes in semver."
        },
        {
          type: "coding",
          q: "Design a type-safe plugin system using module augmentation.",
          a: "```ts\\n// Library code:\\nexport interface PluginMap {}\\n\\nexport function use<K extends keyof PluginMap>(\\n  name: K,\\n  config: PluginMap[K]\\n): void { /* ... */ }\\n\\n// Consumer augments:\\ndeclare module 'my-lib' {\\n  interface PluginMap {\\n    logger: { level: 'info' | 'warn' | 'error' };\\n    cache: { ttl: number; maxSize: number };\\n  }\\n}\\n\\nuse('logger', { level: 'info' }); // ✅ Type-safe\\nuse('cache', { ttl: 300, maxSize: 100 }); // ✅\\n```"
        },
        {
          type: "tricky",
          q: "Why are type changes considered breaking changes?",
          a: "Changing a type can break consumer builds even if the runtime behavior is identical. Examples: narrowing a union (consumers handling the removed case), adding required properties, changing generic constraints. If `UserResponse` gains a required `role` field, consumers not providing it will fail to compile. Follow semver: type-breaking changes = major version bump."
        },
        {
          type: "conceptual",
          q: "How do you test that your library's types are correct?",
          a: "Use `tsd` or `expect-type` to write 'type tests' that verify your API types: `expectType<string>(myLib.getName())` asserts the return type. `expectError(myLib.getName(42))` asserts a type error. These tools compile the test file and check that type assertions hold — they don't run any code."
        },
        {
          type: "scenario",
          q: "You're publishing an npm library. How do you set up package.json for TypeScript?",
          a: "```json\\n{\\n  \\\"name\\\": \\\"my-lib\\\",\\n  \\\"main\\\": \\\"./dist/index.js\\\",\\n  \\\"types\\\": \\\"./dist/index.d.ts\\\",\\n  \\\"exports\\\": {\\n    \\\".\\\": {\\n      \\\"types\\\": \\\"./dist/index.d.ts\\\",\\n      \\\"import\\\": \\\"./dist/index.mjs\\\",\\n      \\\"require\\\": \\\"./dist/index.cjs\\\"\\n    }\\n  },\\n  \\\"files\\\": [\\\"dist\\\"],\\n  \\\"scripts\\\": {\\n    \\\"build\\\": \\\"tsc && tsup\\\"\\n  }\\n}\\n```\\n`types` condition in `exports` must come first for TypeScript to resolve correctly."
        }
      ]
    },
    {
      id: "architecture-scalability",
      title: "Architecture, Scalability & Anti-Patterns",
      explanation: `At the architect level, TypeScript is a tool for **encoding business rules, preventing impossible states, and creating self-documenting codebases**. This topic covers patterns and anti-patterns seen in large-scale TypeScript applications.

**Architectural patterns:**
- **Branded types** — Create nominally unique types from structural types (e.g., \`UserId\` vs \`PostId\`, both strings)
- **Opaque types** — Hide implementation details behind type-safe wrappers
- **Result/Either type** — Functional error handling without exceptions
- **Domain-Driven Design (DDD)** — Use types to model business domain rules
- **Dependency injection** — Interface-based DI for testable, modular code

**Anti-patterns to avoid:**
- **\`any\` creep** — One \`any\` infects everything it touches
- **Over-engineering types** — 10-level-deep conditional types no one can read
- **Boolean flags** — \`isLoading && !isError && hasData\` instead of discriminated unions
- **God types** — One massive interface for everything
- **Stringly typed** — Using plain strings instead of literal unions or branded types

**Scaling TypeScript:**
- Project references for monorepos
- Strict tsconfig in CI (\`noEmitOnError\`, \`noUnusedLocals\`)
- Zod/io-ts for runtime validation at system boundaries
- Co-locate types with their domain (no \`types/\` folder with everything)

🏠 **Real-world analogy:** TypeScript architecture is like city zoning laws. Residential areas (UI types), commercial zones (API types), and industrial parks (data processing types) each have rules that prevent chaos. Branded types are like address systems — "123 Main St" in CityA is different from "123 Main St" in CityB, even though they look the same.`,
      codeExample: `// ⭐ Branded types — nominal typing in a structural type system
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
type Email = Brand<string, "Email">;

// Constructor functions (the only way to create branded types)
function createUserId(id: string): UserId {
  // validate format
  return id as UserId;
}
function createPostId(id: string): PostId {
  return id as PostId;
}
function createEmail(raw: string): Email {
  if (!raw.includes("@")) throw new Error("Invalid email");
  return raw as Email;
}

function getUser(id: UserId): void { /* ... */ }
function getPost(id: PostId): void { /* ... */ }

const userId = createUserId("user-123");
const postId = createPostId("post-456");

getUser(userId);   // ✅
// getUser(postId); // ❌ Type error! PostId is not UserId
// getUser("raw");  // ❌ Type error! string is not UserId

// ⭐ Result type — functional error handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}
function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// Chainable Result operations
function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (result.success) return ok(fn(result.data));
  return result;
}

// Usage
function parseJSON(input: string): Result<unknown, string> {
  try {
    return ok(JSON.parse(input));
  } catch {
    return err("Invalid JSON");
  }
}

function validateUser(data: unknown): Result<{ name: string; age: number }, string> {
  if (typeof data !== "object" || data === null) return err("Not an object");
  const obj = data as Record<string, unknown>;
  if (typeof obj.name !== "string") return err("Missing name");
  if (typeof obj.age !== "number") return err("Missing age");
  return ok({ name: obj.name, age: obj.age });
}

// ⭐ Domain-Driven Design with TypeScript
// Make impossible states impossible!

// BAD: boolean flags
interface BadOrder {
  isPaid: boolean;
  isShipped: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  // Can isPaid=false AND isDelivered=true? 😱
}

// GOOD: discriminated union
type Order =
  | { status: "pending"; items: OrderItem[]; total: number }
  | { status: "paid"; items: OrderItem[]; total: number; paymentId: string }
  | { status: "shipped"; items: OrderItem[]; total: number; paymentId: string; trackingNumber: string }
  | { status: "delivered"; items: OrderItem[]; total: number; paymentId: string; deliveredAt: Date }
  | { status: "cancelled"; items: OrderItem[]; total: number; reason: string };

interface OrderItem { productId: string; quantity: number; price: number; }

// Each transition is type-safe
function shipOrder(order: Extract<Order, { status: "paid" }>): Extract<Order, { status: "shipped" }> {
  return {
    ...order,
    status: "shipped",
    trackingNumber: \`TRACK-\${Date.now()}\`
  };
}
// Can only ship a PAID order — calling shipOrder on a "pending" order is a compile error!

// ⭐ Dependency Injection with interfaces
interface Logger {
  info(msg: string): void;
  error(msg: string, err?: Error): void;
}

interface Database {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
}

interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}

// Implementing with injected dependencies
class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly logger: Logger,
    private readonly db: Database
  ) {}

  async getUser(id: UserId): Promise<Result<User, string>> {
    this.logger.info(\`Fetching user \${id}\`);
    const user = await this.repo.findById(id);
    if (!user) return err(\`User \${id} not found\`);
    return ok(user);
  }
}`,
      exercise: `**Mini Exercise:**
1. Create branded types for \`UserId\`, \`Email\`, and \`Money\` with validation constructors
2. Model a state machine for an e-commerce order using discriminated unions where impossible transitions are compile errors
3. Implement a \`Result<T, E>\` type with \`map\`, \`flatMap\`, and \`unwrapOr\` methods
4. Refactor a \`{ isLoading, isError, data, error }\` to a discriminated union
5. Design a dependency injection system using interfaces and a typed container`,
      commonMistakes: [
        "Using plain strings for IDs — `getUser(postId)` compiles fine but is a bug; use branded types to prevent mixing",
        "Boolean flag state — `{ isLoading: true, isError: true }` is possible but meaningless; use discriminated unions",
        "Catching errors and re-throwing as `any` — use Result types or typed error hierarchies to preserve error type information",
        "Giant `types.ts` files — co-locate types with their domain modules, not in a central dump file",
        "Ignoring `any` in library types — `any` is viral; one `any` in a dependency can infect your entire codebase. Wrap with proper types"
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are branded types and when would you use them?",
          a: "Branded types add a phantom property (exists only in the type system) to create nominally unique types from structural types. `type UserId = string & { __brand: 'UserId' }`. This prevents mixing structurally identical but semantically different values — passing a `PostId` where `UserId` is expected becomes a compile error. Use for IDs, validated data (email, URL), and monetary values."
        },
        {
          type: "coding",
          q: "Model a payment processing flow where transitions between states are type-safe.",
          a: "```ts\\ntype Payment =\\n  | { status: 'created'; amount: number }\\n  | { status: 'authorized'; amount: number; authCode: string }\\n  | { status: 'captured'; amount: number; captureId: string }\\n  | { status: 'refunded'; amount: number; refundId: string };\\n\\nfunction authorize(p: Extract<Payment, {status: 'created'}>):\\n  Extract<Payment, {status: 'authorized'}> {\\n  return { ...p, status: 'authorized', authCode: 'AUTH-123' };\\n}\\n// Only 'created' payments can be authorized — type-proven!\\n```"
        },
        {
          type: "tricky",
          q: "How do you handle the 'impossibility' of boolean flag combinations?",
          a: "Boolean flags create 2^n possible states, most of which are invalid. `{ isLoading, isError, hasData }` has 8 combinations but only 4 are valid. Replace with a discriminated union: `type State = {status: 'idle'} | {status: 'loading'} | {status: 'success'; data: T} | {status: 'error'; error: E}`. Now only valid states are representable."
        },
        {
          type: "conceptual",
          q: "What is the Result/Either pattern and why use it instead of exceptions?",
          a: "The Result type (`{ok: true; value: T} | {ok: false; error: E}`) makes error handling explicit in the type system. Unlike exceptions: 1) The return type SHOWS it can fail. 2) The compiler FORCES handling both cases. 3) Errors don't skip stack frames. 4) No try/catch needed. It's standard in Rust, Haskell, and increasingly popular in TypeScript for business logic."
        },
        {
          type: "scenario",
          q: "You're leading a team of 10 developers on a large TypeScript project. What architectural TypeScript patterns would you enforce?",
          a: "1) **Strict tsconfig** with `noUncheckedIndexedAccess`, `noImplicitAny`. 2) **Branded types** for all IDs and validated data. 3) **Discriminated unions** for all state — ban boolean flags. 4) **Result types** for all operations that can fail. 5) **Co-located types** (no central types dump). 6) **Zod/Valibot** at system boundaries (API, user input). 7) **ESLint TS rules** banning `any`, `@ts-ignore`. 8) **Type-only imports** enforced."
        }
      ]
    }
  ]
};

export default tsPhase4;
