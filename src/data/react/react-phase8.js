const reactPhase8 = {
  id: "phase-8",
  title: "Phase 8: Global State Management",
  emoji: "🧠",
  description: "Learn how to share state across your entire application without prop drilling. Compare Context API with modern libraries like Zustand and Redux.",
  topics: [
    {
      id: "react-context-api",
      title: "Context API & useReducer",
      explanation: `**Context API** is React's built-in solution for global state. It provides a way to pass data through the component tree without having to pass props down manually at every level.

**The Workflow:**
1. **createContext:** Define the context.
2. **Provider:** Wrap your app (or a part of it) and provide the value.
3. **useContext:** Consume the value in any child component.

**Combining with useReducer:**
For complex global state, the most powerful built-in pattern is to store the \`dispatch\` function from \`useReducer\` in a Context. This creates a "Redux-lite" system without any external dependencies.

**Important Warning:**
Context is **not** a state management tool; it's a **dependency injection** tool. It has one major drawback: whenever the context value changes, **all** components consuming that context will re-render, even if they only use a small piece of the value.`,
      codeExample: `import React, { createContext, useContext, useReducer } from 'react';

// 1. Define Contexts (Split state and dispatch for better performance)
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

// 2. Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null };
    default:
      return state;
  }
};

// 3. Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null
  });

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

// 4. Custom Hooks for easier consumption
export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);

// 5. Usage in a component
function UserProfile() {
  const { user, isAuthenticated } = useAuthState();
  const dispatch = useAuthDispatch();

  if (!isAuthenticated) return <button onClick={() => dispatch({ type: 'LOGIN', payload: { name: 'Dan' } })}>Login</button>;

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={() => dispatch({ type: 'LOGOUT' })}>Logout</button>
    </div>
  );
}`,
      exercise: `1. Implement a 'ThemeContext' that toggles between 'light' and 'dark' modes for the whole app.
2. Build a 'LanguageSelector' using Context to provide translations (i18n).
3. Create a 'Global State' object with nested properties. Use a component to update only one property and observe which other components re-render.
4. Refactor a 'Prop Drilling' scenario (3+ levels) using Context.`,
      commonMistakes: [
        "Putting everything into a single 'GlobalContext' (leading to unnecessary re-renders).",
        "Using Context for highly frequent updates (like a mouse position or a fast timer).",
        "Forgetting to wrap the app in the Provider, causing \`useContext\` to return undefined.",
        "Not splitting state and dispatch contexts, which forces components that only need to dispatch to re-render when state changes."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the main problem with using Context API for all global state?",
          a: "The main problem is **unnecessary re-renders**. Any component that consumes a context will re-render whenever the context value changes. If the context holds a large object and only one property changes, all consumers will re-render, even if they don't use that property."
        },
        {
          type: "conceptual",
          q: "When would you choose Context API over a library like Redux or Zustand?",
          a: "I would choose Context for relatively static data that doesn't change frequently, such as **User Authentication**, **Theme settings**, or **Locale/Language**. For high-frequency updates or complex state logic, external libraries are more efficient."
        }
      ]
    },
    {
      id: "react-state-libraries",
      title: "Zustand & Redux Toolkit",
      explanation: `When Context isn't enough, we turn to external state management libraries.

**Redux Toolkit (RTK):**
The modern way to use Redux. It removes the boilerplate (actions, constants, switch statements) and includes \`immer\` for "mutable" state updates and \`redux-thunk\` for async logic.
- **Best for:** Massive enterprise apps with complex, multi-step workflows.

**Zustand:**
A small, fast, and scalable bear-themed state management library. It uses hooks as its primary API and is much simpler than Redux.
- **Why it's popular:** No Providers needed, zero boilerplate, and it solves the Context re-render problem by using "selectors".

**Key Principle: Selectors**
Libraries like Zustand allow you to "select" only the specific piece of state you need.
\`const name = useStore(state => state.user.name);\`
If \`state.user.age\` changes, this component **will not** re-render. This is the superpower of state libraries.`,
      codeExample: `// --- ZUSTAND EXAMPLE ---
import { create } from 'zustand'

// 1. Create the store (No Provider needed!)
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  clearCart: () => set({ items: [] }),
}))

// 2. Component A: Consuming state
function CartCount() {
  // Component only re-renders if items.length changes
  const count = useCartStore((state) => state.items.length)
  return <div className="badge">{count}</div>
}

// 3. Component B: Triggering actions
function AddToCart({ product }) {
  const addItem = useCartStore((state) => state.addItem)
  return (
    <button onClick={() => addItem(product)}>
      Add to Cart
    </button>
  )
}

// --- REDUX TOOLKIT EXAMPLE (Slice) ---
/*
import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      // RTK uses Immer, so you can "mutate" the state!
      state.value += 1
    }
  }
})
*/`,
      exercise: `1. Install \`zustand\` and build a simple 'Task Board' (Todo) with it.
2. Implement a 'Persist' middleware with Zustand to keep state in LocalStorage automatically.
3. Compare the amount of code needed to build a counter in Redux Toolkit vs Zustand.
4. Research 'Recoil' or 'Jotai' and explain how 'Atomic State' differs from the single-store approach of Redux/Zustand.`,
      commonMistakes: [
        "Over-engineering simple apps by adding Redux/Zustand before they are needed.",
        "Storing 'Server State' (API data) in a global store instead of using TanStack Query.",
        "Not using selectors in Zustand, causing the entire component to re-render on any store change."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the advantages of Zustand over Redux?",
          a: "Zustand is much lighter (barely any boilerplate), doesn't require wrapping the app in a Provider, and uses a much simpler hooks-based API. It's often easier to learn and maintain for most project sizes."
        },
        {
          type: "conceptual",
          q: "What is a 'selector' and why is it important for performance?",
          a: "A selector is a function that extracts a specific part of the state from a store. It's important because it allows the component to subscribe only to the data it actually uses, preventing unnecessary re-renders when other parts of the store change."
        }
      ]
    },
    {
      id: "react-query-swr",
      title: "Server State vs Client State",
      explanation: `One of the biggest shifts in modern React is realizing that **most global state is actually just a cache of your database (Server State).**

**Client State:**
Data needed only by the UI (e.g., is the modal open? which theme is active?). Use **useState**, **Zustand**, or **Context**.

**Server State:**
Data that comes from an API (e.g., list of users, product details). This data is "asynchronous" and "stale" as soon as it arrives. 

**The modern solution: TanStack Query (React Query)**
Instead of fetching data and putting it into Redux, you use React Query to manage it. It handles:
- Caching (so you don't fetch the same data twice).
- Deduping (multiple components can request the same data, but only one request is sent).
- Background re-fetching (keeping data fresh).
- Mutation handling (updating data on the server).`,
      codeExample: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function Products() {
  const queryClient = useQueryClient()

  // 1. Fetching (Server State)
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(res => res.json())
  })

  // 2. Updating (Mutation)
  const mutation = useMutation({
    mutationFn: (newProduct) => {
      return fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct)
      })
    },
    onSuccess: () => {
      // 3. Invalidate cache to trigger a background refresh
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  if (isLoading) return 'Loading...'
  
  return (
    <div>
      {data.map(p => <div key={p.id}>{p.name}</div>)}
      <button onClick={() => mutation.mutate({ name: 'New Phone' })}>
        Add Product
      </button>
    </div>
  )
}`,
      exercise: `1. Refactor an existing \`useEffect\` fetch to use \`useQuery\` from TanStack Query.
2. Implement 'Optimistic Updates' where the UI updates before the server response arrives.
3. Explore the 'React Query Devtools' to see how the cache works in real-time.
4. Set up a 'Stale Time' of 5 minutes and notice how navigating back to a page doesn't trigger a new network request.`,
      commonMistakes: [
        "Mixing Client State (Zustand) and Server State (React Query) unnecessarily.",
        "Not providing a unique \`queryKey\`, leading to data being cached in the wrong place.",
        "Manually managing loading/error states when React Query provides them for free."
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Why should you avoid putting API data in Redux or Context?",
          a: "API data is 'Server State'. Putting it in Redux forces you to manually manage loading states, error handling, caching, and cache invalidation. Libraries like TanStack Query are designed specifically for this, providing these features out of the box and keeping your global store much cleaner."
        }
      ]
    }
  ]
};

export default reactPhase8;
