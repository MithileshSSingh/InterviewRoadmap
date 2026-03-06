const reactPhase1 = {
  id: "phase-1",
  title: "Phase 1: Foundations & The Virtual DOM",
  emoji: "🧱",
  description:
    "Understand React's history, why it was created, and the core concept that revolutionized UI development: the Virtual DOM.",
  topics: [
    {
      id: "react-history-intro",
      title: "History & Evolution",
      explanation: `React was created by **Jordan Walke**, a software engineer at Facebook, who released an early prototype of React called **FaxJS**. It was first deployed on Facebook's News Feed in 2011 and later on Instagram in 2012. It was open-sourced at JSConf US in May 2013.

At the time, the common way to build web apps involved manual DOM manipulation using libraries like jQuery or MVC frameworks like Backbone.js. These approaches became difficult to maintain as application state grew complex. Facebook faced a "zombie" UI problem where different parts of the UI would get out of sync with the data.

**Key Reasons for React's Success:**
- **Component-Based:** Break down complex UIs into small, reusable pieces.
- **Unidirectional Data Flow:** State flows down, making debugging easier.
- **Virtual DOM:** Efficiently updates the UI without manual manipulation.
- **Learn Once, Write Anywhere:** Use the same principles for web (React), mobile (React Native), and more.

React shifted the industry from "How to update the DOM" (imperative) to "What the UI should look like at any given time" (declarative).`,
      codeExample: `// ❌ THE OLD WAY: Imperative DOM Manipulation (jQuery-style)
// This becomes messy as your app grows.
function updateCounter(count) {
  const counterEl = document.getElementById('counter');
  counterEl.textContent = count;
  
  if (count > 10) {
    counterEl.style.color = 'red';
  } else {
    counterEl.style.color = 'black';
  }
}

// ✅ THE REACT WAY: Declarative Component
// You describe WHAT the UI should look like based on current state.
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold">Counter App</h2>
      <p 
        id="counter"
        style={{ color: count > 10 ? 'red' : 'black' }}
        className="text-2xl my-4"
      >
        Current Count: {count}
      </p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Increment
      </button>
    </div>
  );
}

export default Counter;`,
      exercise: `1. Study the FaxJS repository (if available) or early React documentation to see how much the API has changed.
2. Identify a complex website and try to mentally break it down into a component tree.
3. Compare React with another framework (like Vue or Angular) and note the philosophical differences (e.g., Template-based vs JSX).
4. Build a simple HTML/JS page that updates multiple elements when a single variable changes using only vanilla JS. Notice the complexity of keeping everything in sync manually.`,
      commonMistakes: [
        "Thinking React is a full framework (it's a library focused on the View layer).",
        "Directly manipulating the DOM (e.g., using document.getElementById) inside a React component.",
        "Not understanding that React requires a build step (JSX isn't native browser JS).",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What problem was React originally created to solve at Facebook?",
          a: "React was created to solve the problem of complex state management and inconsistent UIs (the 'zombie' UI problem) in large-scale applications like Facebook's News Feed. It introduced a **declarative** approach and **unidirectional data flow** to make the UI more predictable and easier to debug.",
        },
        {
          type: "conceptual",
          q: "Is React a library or a framework? Why?",
          a: "React is technically a **library** for building user interfaces. Unlike a full framework (like Angular), it doesn't provide built-in solutions for routing, state management, or form validation. This modularity allows developers to choose the best tools for their specific needs, though it requires more setup.",
        },
      ],
    },
    {
      id: "react-declarative-vs-imperative",
      title: "Declarative vs Imperative",
      explanation: `The shift from **Imperative** to **Declarative** programming is perhaps the most important concept in modern UI development.

**Imperative Programming (HOW):**
In imperative programming, you provide step-by-step instructions to the computer on how to achieve a result. You manually manage the state and the DOM.
- *Example:* "Find the button with ID 'btn'. Add a click listener. When clicked, find the div with ID 'msg'. Change its text to 'Hello'. Change its background to red."

**Declarative Programming (WHAT):**
In declarative programming, you describe what the UI should look like for any given state. You don't care how the computer gets there; you just define the mapping between state and UI.
- *Example:* "If the 'clicked' state is true, show the message 'Hello' in a red div. Otherwise, show nothing."

**Why Declarative wins for UIs:**
1. **Predictability:** The UI is a pure function of the state. If the state is X, the UI is always Y.
2. **Reduced Side Effects:** You don't have to worry about the 'previous' state of the DOM when making an update.
3. **Easier Debugging:** You only need to check if the state is correct; React handles the DOM updates.`,
      codeExample: `// ❌ IMPERATIVE (Vanilla JavaScript)
// You have to handle every transition manually.
const root = document.getElementById('root');
const btn = document.createElement('button');
btn.textContent = 'Toggle View';
let isVisible = false;

btn.addEventListener('click', () => {
  isVisible = !isVisible;
  const existingContent = document.getElementById('content');
  
  if (isVisible) {
    if (!existingContent) {
      const content = document.createElement('div');
      content.id = 'content';
      content.textContent = 'Now you see me!';
      root.appendChild(content);
    }
  } else {
    if (existingContent) {
      root.removeChild(existingContent);
    }
  }
});
root.appendChild(btn);

// ✅ DECLARATIVE (React)
// You describe the final state, React handles the 'how'.
import React, { useState } from 'react';

function ToggleView() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>
        Toggle View
      </button>
      
      {isVisible && (
        <div id="content">Now you see me!</div>
      )}
    </div>
  );
}`,
      exercise: `1. Refactor a small vanilla JS 'To-Do' list into a declarative mental model.
2. Write a function that takes an array of strings and returns a list of <li> elements imperatively, then declaratively (using .map()).
3. Explain to a non-technical person the difference between an imperative recipe and a declarative restaurant order.
4. Identify parts of your current projects that are 'imperative' and brainstorm how they could be made 'declarative'.`,
      commonMistakes: [
        "Trying to 'reach into' components to change them from the outside (imperative thinking).",
        "Mixing imperative DOM logic (like jQuery) with React code.",
        "Overcomplicating state because you're thinking about the 'transition' instead of the 'result'.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What does it mean that React is 'declarative'?",
          a: "It means you describe **what** you want the UI to look like based on the current state, rather than giving step-by-step instructions on **how** to change the DOM. React takes care of efficiently updating the DOM to match your description.",
        },
        {
          type: "scenario",
          q: "How does declarative programming make large applications easier to maintain?",
          a: "In large apps, state changes can happen from many sources (user input, API responses, timers). With imperative code, you must manually update every affected DOM element for every possible state transition, which is error-prone. With declarative code, you only define how the UI looks for a given state, and React ensures the UI is always in sync, regardless of how the state changed.",
        },
      ],
    },
    {
      id: "react-virtual-dom-reconciliation",
      title: "The Virtual DOM & Reconciliation",
      explanation: `The **Virtual DOM (VDOM)** is a programming concept where an "ideal", or "virtual", representation of a UI is kept in memory and synced with the "real" DOM by a library such as ReactDOM. This process is called **Reconciliation**.

**Why the Real DOM is slow:**
The Real DOM wasn't built for modern, dynamic web apps. Every time you change a DOM node, the browser might have to recalculate the layout (reflow) and repaint the screen. Doing this hundreds of times per second is extremely expensive.

**How the Virtual DOM works:**
1. **Render:** When a component's state changes, React creates a new Virtual DOM tree representing the updated UI.
2. **Diffing:** React compares this new tree with the previous Virtual DOM tree. It uses a highly optimized algorithm to find the minimum number of changes needed.
3. **Commit:** React applies only those specific changes to the Real DOM.

**The Diffing Algorithm (Heuristics):**
React makes two assumptions to keep the diffing O(n) instead of O(n³):
1. Two elements of different types will produce different trees.
2. The developer can hint at which child elements may be stable across different renders with a \`key\` prop.

**React Fiber:**
Fiber is the reimplementation of React's core algorithm (introduced in React 16). It allows React to pause, resume, or abort work as it processes the Virtual DOM tree, enabling features like **Concurrent Mode** and preventing the UI from freezing during heavy updates.`,
      codeExample: `// How React sees your UI (Simplified VDOM representation)
const vdomNode = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: { children: 'Hello World' }
      },
      {
        type: 'button',
        props: {
          onClick: () => console.log('clicked'),
          children: 'Click Me'
        }
      }
    ]
  }
};

// Example of why 'key' is important for Reconciliation
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        // ✅ The 'key' helps React identify which items changed, 
        // were added, or were removed. Without it, React might
        // re-render the entire list inefficiently.
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}

// Visualizing the update:
// Initial: <div><span>A</span></div>
// Update:  <div><p>A</p></div>
// Result: React sees the 'div' is the same, but the child changed
// from 'span' to 'p'. It will tear down the span and create a p.`,
      exercise: `1. Use the 'Paint Flashing' tool in Chrome DevTools to see the Virtual DOM in action. Watch how only changed elements flash.
2. Build a simple 'diffing' visualizer that compares two JSON objects and highlights the differences.
3. Research 'React Fiber' and explain the 'work loop' and 'priority levels' to a peer.
4. Experiment with rendering a list of 10,000 items with and without \`keys\`. Measure the performance difference using the React Profiler.`,
      commonMistakes: [
        "Using array indices as keys (this can cause bugs if the list order changes).",
        "Thinking the Virtual DOM is always faster than the Real DOM (it adds overhead, but it's more efficient for most updates).",
        "Modifying the Real DOM directly, which makes the Virtual DOM and Real DOM go out of sync.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the Virtual DOM, and how does it work?",
          a: "The Virtual DOM is a lightweight JavaScript representation of the real DOM. When state changes, React creates a new Virtual DOM tree, compares it with the old one (diffing), and then applies the minimum necessary updates to the real DOM (reconciliation).",
        },
        {
          type: "tricky",
          q: "Does React re-render the entire Real DOM on every state change?",
          a: "No! React re-renders the **Virtual DOM** on every state change. It then calculates the difference (diffing) and only updates the specific parts of the **Real DOM** that actually changed.",
        },
        {
          type: "conceptual",
          q: "Why is the 'key' prop important in React?",
          a: "Keys help React identify which items in a list have changed, been added, or been removed. They are essential for the reconciliation algorithm to efficiently update lists without re-rendering every item from scratch.",
        },
      ],
    },
  ],
};

export default reactPhase1;
