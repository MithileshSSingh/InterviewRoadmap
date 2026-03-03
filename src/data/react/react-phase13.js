const reactPhase13 = {
  id: "phase-13",
  title: "Phase 13: Custom Hooks & Logic",
  emoji: "🎣",
  description: "Learn how to extract and reuse complex logic across your application. Master the art of building custom hooks and using advanced built-in hooks.",
  topics: [
    {
      id: "react-custom-hooks-basics",
      title: "Building Custom Hooks",
      explanation: `**Custom Hooks** are the ultimate way to share logic between components. If you find yourself writing the same \`useEffect\` or \`useState\` logic in multiple places, it's time to extract it into a custom hook.

**What is a Custom Hook?**
It's just a regular JavaScript function whose name starts with "use" and that can call other hooks.

**Benefits:**
1. **Reusability:** Write logic once, use it everywhere.
2. **Clean Components:** Keep your UI components focused on rendering, while the hook handles the "how".
3. **Testability:** You can test a custom hook independently of any specific component.
4. **Composability:** You can build complex hooks by combining simpler ones.`,
      codeExample: `import { useState, useEffect } from 'react';

// 1. A Custom Hook for LocalStorage
function useLocalStorage(key, initialValue) {
  // Get initial value from storage or use provided initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 2. Usage in a component
function App() {
  const [name, setName] = useLocalStorage('name', 'Stranger');

  return (
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="border p-2"
    />
  );
}`,
      exercise: `1. Build a \`useFetch\` hook that handles data, loading, and error states for any URL.
2. Create a \`useWindowSize\` hook that returns the current width and height of the browser.
3. Implement a \`useDebounce\` hook to delay the update of a value (useful for search inputs).
4. Build a \`useOnClickOutside\` hook that detects when a user clicks outside a specific element (like a modal).`,
      commonMistakes: [
        "Not starting the function name with 'use' (React's linter won't be able to check for hook rules).",
        "Thinking custom hooks share **state** (they don't; every time you use a hook, it gets its own isolated state).",
        "Putting UI/JSX inside a custom hook (hooks should only handle logic and data).",
        "Over-abstracting: creating a hook for logic that is only used in one place and is very simple."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Do two components using the same custom hook share the same state?",
          a: "No. Custom hooks are a mechanism to reuse **stateful logic**, not the state itself. Every call to a hook has a completely isolated state."
        },
        {
          type: "conceptual",
          q: "What are the two main rules of hooks?",
          a: "1. Only call hooks at the **top level**. Don't call them inside loops, conditions, or nested functions. 2. Only call hooks from **React function components** or from other **custom hooks**."
        }
      ]
    },
    {
      id: "react-hooks-transition-id",
      title: "useId, useTransition & useDeferredValue",
      explanation: `React 18 introduced several hooks to handle concurrency and accessibility.

**1. useId:**
Generates unique IDs that are stable across the server and client. Essential for accessibility (linking labels to inputs) in SSR/Next.js apps.

**2. useTransition:**
Allows you to mark state updates as "non-urgent". This keeps the UI responsive while a heavy update is happening in the background. It provides a \`isPending\` flag to show a loading state.

**3. useDeferredValue:**
Similar to \`useTransition\`, but used when you receive a value from props and want to "defer" re-rendering the heavy parts of the UI that depend on that value.`,
      codeExample: `import { useState, useTransition, useDeferredValue, useId } from 'react';

function SearchResults({ query }) {
  // 1. Defer the heavy list rendering
  const deferredQuery = useDeferredValue(query);
  
  // Imagine this is a heavy calculation based on deferredQuery
  const items = Array.from({ length: 5000 }, (_, i) => \`Result \${i} for \${deferredQuery}\`);

  return (
    <ul className="opacity-50 transition-opacity duration-500" style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}

function App() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const id = useId(); // 2. Stable ID for accessibility

  const handleChange = (e) => {
    // 3. Keep the input feeling snappy!
    const value = e.target.value;
    setQuery(value);
  };

  return (
    <div className="p-10">
      <label htmlFor={id}>Search:</label>
      <input 
        id={id}
        value={query} 
        onChange={handleChange}
        className="border p-2 ml-2"
      />
      
      {isPending && <p>Loading new results...</p>}
      
      <SearchResults query={query} />
    </div>
  );
}`,
      exercise: `1. Implement \`useId\` in a reusable 'Input' component to link the label and input correctly.
2. Build a large list filter and use \`useTransition\` to show a 'pending' state while the list updates.
3. Compare \`useDeferredValue\` with a traditional \`debounce\` function.
4. Research why \`useId\` is better than \`Math.random()\` for generating IDs in React.`,
      commonMistakes: [
        "Using \`useTransition\` for small, fast updates where it just adds unnecessary complexity.",
        "Thinking \`useDeferredValue\` works like a debounce (it's actually more intelligent; it only defers if the CPU is busy).",
        "Using \`useId\` as a 'key' in a list (keys should come from your data, not be generated by hooks)."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the purpose of useTransition?",
          a: "It allows you to mark certain state updates as low-priority 'transitions'. This prevents heavy re-renders from blocking urgent user interactions (like typing in an input), keeping the app feeling responsive."
        }
      ]
    }
  ]
};

export default reactPhase13;
