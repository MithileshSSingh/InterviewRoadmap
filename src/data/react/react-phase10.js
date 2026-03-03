const reactPhase10 = {
  id: "phase-10",
  title: "Phase 10: Performance Optimization",
  emoji: "⚡",
  description: "Learn how to make your React apps blazingly fast. Master memoization, code-splitting, and the React Profiler to eliminate unnecessary re-renders.",
  topics: [
    {
      id: "react-memoization-basics",
      title: "React.memo, useMemo & useCallback",
      explanation: `By default, when a parent component re-renders, **all** of its children also re-render. In a small app, this is fine. In a large app, it can lead to lag.

**1. React.memo:**
A Higher-Order Component that skips re-rendering a component if its props haven't changed. It uses "shallow comparison".

**2. useMemo:**
Memoizes the **result of a calculation**. Use it when you have an expensive operation (like filtering a large list) that you only want to re-run when specific inputs change.

**3. useCallback:**
Memoizes a **function instance**. In JavaScript, functions are objects, and every time a component re-renders, it creates a "new" version of its functions. Passing these new functions to a memoized child will break \`React.memo\`. \`useCallback\` prevents this by returning the same function instance across renders.

**The Golden Rule:**
Don't optimize prematurely! Memoization adds its own overhead. Use it only when you have a measurable performance problem.`,
      codeExample: `import React, { useState, useMemo, useCallback } from 'react';

// 1. Memoized Child Component
const HeavyChild = React.memo(({ onAction, items }) => {
  console.log('HeavyChild re-rendering');
  return (
    <div className="p-4 border mt-4">
      <p>I only re-render if my props change!</p>
      <button onClick={onAction} className="bg-blue-500 text-white p-2">Click Me</button>
      <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
    </div>
  );
});

function Parent() {
  const [count, setCount] = useState(0);
  const [items] = useState(['Apple', 'Banana', 'Cherry']);

  // 2. useCallback: Prevents creating a new function on every render
  const handleAction = useCallback(() => {
    alert('Action triggered from child!');
  }, []); // Empty deps = always the same function

  // 3. useMemo: Only re-sort the list if 'items' changes
  const sortedItems = useMemo(() => {
    console.log('Sorting items...');
    return [...items].sort();
  }, [items]);

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold">Performance Demo</h2>
      <p>Parent Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="bg-gray-200 p-2"
      >
        Increment Parent (Child won't re-render)
      </button>

      <HeavyChild onAction={handleAction} items={sortedItems} />
    </div>
  );
}`,
      exercise: `1. Build a list of 500 items and a search filter. Use \`useMemo\` to optimize the filtering.
2. Create a child component and observe it re-rendering using \`console.log\`. Wrap it in \`React.memo\` and see what stops it.
3. Pass a function from a parent to a memoized child. Notice the child re-renders even with \`React.memo\`. Fix it using \`useCallback\`.
4. Use the 'Why Did You Render' (wdyr) library to identify components that are re-rendering unnecessarily.`,
      commonMistakes: [
        "Wrapping every single function and calculation in useMemo/useCallback (this is often slower due to overhead).",
        "Forgetting that \`React.memo\` only does a shallow comparison (it won't detect changes inside objects or arrays).",
        "Not including all required dependencies in the dependency array.",
        "Using memoization for simple values that are cheap to calculate."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between useMemo and useCallback?",
          a: "\`useMemo\` memoizes a **value** (the result of a function), while \`useCallback\` memoizes the **function itself**. You use \`useMemo\` for expensive calculations and \`useCallback\` to maintain referential equality of functions passed to memoized children."
        },
        {
          type: "tricky",
          q: "Why doesn't React memoize everything by default?",
          a: "Memoization isn't free. It requires extra memory to store previous results and extra CPU cycles to perform a 'shallow comparison' of props on every render. For most components, re-rendering is faster than the cost of checking if it *should* re-render."
        }
      ]
    },
    {
      id: "react-code-splitting",
      title: "Code Splitting & Lazy Loading",
      explanation: `As your app grows, your JavaScript bundle becomes huge. A user might only visit the Home page, but they are forced to download the code for the Dashboard, Settings, and Profile pages too.

**Code Splitting** allows you to break your app into smaller chunks and only load them when they are needed.

**React.lazy:**
Allows you to define a component that is loaded dynamically. It must be rendered inside a \`<Suspense>\` component.

**Suspense:**
A component that allows you to show a "fallback" (like a loading spinner) while its children are being loaded.

**Common Patterns:**
1. **Route-based splitting:** Load each page/route only when visited.
2. **Component-based splitting:** Load heavy components (like a Chart or a Code Editor) only when they are about to be displayed.`,
      codeExample: `import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Import components lazily
// These will be in separate .js files in the final build
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function App() {
  return (
    <BrowserRouter>
      {/* 2. Suspense provides a fallback while code is fetching */}
      <Suspense fallback={<div className="p-10 text-center">Loading chunk...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
      
      {/* 3. Splitting a single heavy component */}
      <div className="mt-20">
        <Suspense fallback={<p>Loading Chart...</p>}>
          <HeavyChart />
        </Suspense>
      </div>
    </BrowserRouter>
  );
}`,
      exercise: `1. Use \`React.lazy\` to split your routes in a multi-page app.
2. Observe the 'Network' tab in Chrome DevTools to see new \`.js\` files loading as you navigate.
3. Use 'Dynamic Imports' for a library like \`lodash\` or \`moment.js\` only inside the function where it is used.
4. Analyze your bundle size using a tool like \`rollup-plugin-visualizer\` or \`source-map-explorer\`.`,
      commonMistakes: [
        "Not wrapping \`lazy\` components in \`<Suspense>\` (this will cause a crash).",
        "Putting \`<Suspense>\` too high up (causing the entire page to disappear while a small component loads).",
        "Over-splitting (making hundreds of tiny chunks can slow down the app due to too many network requests)."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is code-splitting and how do you achieve it in React?",
          a: "Code-splitting is the process of breaking a large JS bundle into smaller pieces (chunks) that can be loaded on demand. In React, it's primarily achieved using \`React.lazy()\` for dynamic component imports and \`<Suspense />\` for handling the loading state."
        },
        {
          type: "scenario",
          q: "When would you prefer component-based splitting over route-based splitting?",
          a: "I'd use component-based splitting for heavy elements that aren't visible on initial load, such as **Modals**, **Accordions**, or **Complex Visualizations** (like D3 charts) that are 'below the fold' or hidden behind a user action."
        }
      ]
    }
  ]
};

export default reactPhase10;
