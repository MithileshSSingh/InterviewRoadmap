const reactPhase5 = {
  id: "phase-5",
  title: "Phase 5: Side Effects & Lifecycle",
  emoji: "🔄",
  description: "Handle side effects like data fetching, subscriptions, and DOM updates. Understand the component lifecycle in the world of hooks.",
  topics: [
    {
      id: "react-useeffect-basics",
      title: "useEffect Hook",
      explanation: `\`useEffect\` allows you to perform side effects in functional components. A "side effect" is anything that happens outside the scope of the React render cycle (e.g., fetching data, manual DOM manipulation, timers).

**The Signature:**
\`useEffect(() => { ... }, [dependencies]);\`

**The Three Scenarios:**
1. **No Dependency Array:** Runs on **every** render. (Rarely used)
2. **Empty Dependency Array \`[]\`:** Runs only **once** after the initial mount.
3. **With Dependencies \`[prop, state]\`:** Runs after the initial mount and whenever any dependency changes.

**The Cleanup Function:**
If your effect creates something that needs to be cleaned up (like a timer or a subscription), you return a function from \`useEffect\`. React runs this cleanup function before the component unmounts and before re-running the effect.`,
      codeExample: `import React, { useState, useEffect } from 'react';

function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Setup the effect
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      console.log('Mouse moved');
    };

    window.addEventListener('mousemove', handleMove);

    // 2. Return the CLEANUP function
    // This prevents memory leaks and multiple listeners
    return () => {
      window.removeEventListener('mousemove', handleMove);
      console.log('Cleanup: Listener removed');
    };
  }, []); // 3. Empty array = run only on mount

  return (
    <div className="p-4 bg-gray-100 rounded">
      <p>Move your mouse!</p>
      <pre>X: {position.x}, Y: {position.y}</pre>
    </div>
  );
}

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // 4. Run effect when 'query' changes
    if (!query) return;

    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        const res = await fetch(\`https://api.example.com/search?q=\${query}\`, {
          signal: controller.signal
        });
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    };

    fetchData();

    // 5. Abort fetch if query changes quickly (debounce-like)
    return () => controller.abort();
  }, [query]);

  return (
    <input 
      value={query} 
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
      className="border p-2"
    />
  );
}`,
      exercise: `1. Build a 'Clock' component that updates the time every second using \`setInterval\`. Don't forget the cleanup!
2. Create a component that fetches a random user from an API when it mounts.
3. Implement a 'Window Size' hook that tracks the browser's width and height.
4. Try to trigger an infinite loop by updating a state variable that is also in the dependency array of the effect. Use the browser console to see it happen (and then fix it!).`,
      commonMistakes: [
        "Forgetting the dependency array (causing the effect to run on every render).",
        "Lying to React about dependencies (not including a variable you use inside the effect).",
        "Performing side effects directly in the component body (instead of inside \`useEffect\`).",
        "Not providing a cleanup function for subscriptions or timers."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When does the cleanup function in useEffect run?",
          a: "The cleanup function runs in two cases: 1. Right before the component unmounts. 2. Right before the effect is re-executed (due to a dependency change)."
        },
        {
          type: "tricky",
          q: "What happens if you omit the dependency array in useEffect?",
          a: "If you omit the dependency array, the effect will run after **every single render** of the component. This is usually inefficient and can lead to performance issues or bugs if not intended."
        }
      ]
    },
    {
      id: "react-useeffect-sync",
      title: "Synchronization vs Events",
      explanation: `One of the biggest hurdles in React is learning when **NOT** to use \`useEffect\`.

**Effect vs Event:**
- **Events:** Logic that should happen because a user clicked a button or submitted a form belongs in an **Event Handler**, not an effect.
- **Effects:** Logic that should happen because a component was *displayed* or because its *props/state* changed (synchronizing with an external system) belongs in an **Effect**.

**Avoid Effects for:**
1. **Transforming Data:** If you can compute state B from state A during render, do it directly. Don't use \`useEffect\` to update state B when A changes.
2. **Resetting State:** If you need to reset a component when a prop changes, use a \`key\` on the component instead of an effect.
3. **Handling User Events:** Always prefer event handlers. They are easier to reason about and don't require dependency management.`,
      codeExample: `// ❌ BAD: Using useEffect for data transformation
function ShoppingCart({ items }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));
  }, [items]); // This causes an unnecessary extra render!

  return <div>Total: {total}</div>;
}

// ✅ GOOD: Compute during render
function ShoppingCart({ items }) {
  // If calculation is expensive, use useMemo (covered in Phase 10)
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <div>Total: {total}</div>;
}

// ❌ BAD: Using effect for user action
function Form() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      postData(); // Hard to track 'why' this happened
    }
  }, [submitted]);

  return <button onClick={() => setSubmitted(true)}>Submit</button>;
}

// ✅ GOOD: Use Event Handler
function Form() {
  const handleSubmit = () => {
    postData(); // Direct and easy to follow
  };

  return <button handleSubmit={handleSubmit}>Submit</button>;
}`,
      exercise: `1. Review a previous project and find a \`useEffect\` that could be replaced by a simple calculation during render.
2. Refactor a component that uses \`useEffect\` to reset state by using the \`key\` prop instead.
3. Create a 'Search' feature where the search only happens when the user clicks 'Submit' (Event) vs when the user stops typing (Effect/Debounce).
4. Explain to a colleague why 'useEffect' is called an escape hatch.`,
      commonMistakes: [
        "Using \`useEffect\` to update state based on other state (leading to 'render chains').",
        "Overusing effects for logic that should be in event handlers.",
        "Thinking \`useEffect\` is exactly like class lifecycle methods (it's similar but has a different mental model based on synchronization)."
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "You have a 'fullName' state that updates whenever 'firstName' or 'lastName' state changes. How should you implement this?",
          a: "You should **not** use \`useEffect\` or a separate 'fullName' state. Instead, you should calculate 'fullName' directly in the component body during render: \`const fullName = firstName + ' ' + lastName;\`. This avoids unnecessary re-renders and keeps the code simpler."
        }
      ]
    }
  ]
};

export default reactPhase5;
