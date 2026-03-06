const reactPhase6 = {
  id: "phase-6",
  title: "Phase 6: Advanced Component Patterns",
  emoji: "🧩",
  description:
    "Level up your component architecture. Learn how to build highly flexible, reusable, and developer-friendly components using professional patterns.",
  topics: [
    {
      id: "react-compound-components",
      title: "Compound Components",
      explanation: `**Compound Components** is a pattern where several components work together to maintain a shared implicit state. Think of the HTML \`<select>\` and \`<option>\` elements. You don't pass an array of options to the select; instead, you nest the options inside.

**Benefits:**
- **Reduced Prop Drilling:** You don't need to pass many props to a single "god" component.
- **Flexibility:** The consumer (developer using your component) has control over the order and placement of sub-components.
- **Clean API:** The usage looks more like standard HTML.

**Implementation:**
Typically implemented using the **Context API** to share state between the parent and its children without passing props explicitly.`,
      codeExample: `import React, { useState, useContext, createContext } from 'react';

// 1. Create a Context for the compound component
const AccordionContext = createContext();

// 2. Parent Component (Provider)
function Accordion({ children }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <AccordionContext.Provider value={{ openIndex, toggle }}>
      <div className="border rounded-md divide-y overflow-hidden shadow-sm">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// 3. Child Components (Consumers)
function AccordionItem({ index, children }) {
  return (
    <div className="bg-white">
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { index })
      )}
    </div>
  );
}

function AccordionHeader({ index, children }) {
  const { openIndex, toggle } = useContext(AccordionContext);
  const isOpen = openIndex === index;

  return (
    <button
      className="w-full px-4 py-3 text-left font-medium flex justify-between items-center hover:bg-gray-50 transition"
      onClick={() => toggle(index)}
    >
      {children}
      <span>{isOpen ? '−' : '+'}</span>
    </button>
  );
}

function AccordionPanel({ index, children }) {
  const { openIndex } = useContext(AccordionContext);
  if (openIndex !== index) return null;

  return (
    <div className="px-4 py-3 bg-gray-50 text-gray-700 animate-in fade-in duration-200">
      {children}
    </div>
  );
}

// 4. Attach sub-components to the parent for easier access (optional)
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;

// 5. Usage:
function App() {
  return (
    <Accordion>
      <Accordion.Item index={0}>
        <Accordion.Header>What is React?</Accordion.Header>
        <Accordion.Panel>React is a JavaScript library for building UIs.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item index={1}>
        <Accordion.Header>Why use Compound Components?</Accordion.Header>
        <Accordion.Panel>Because they provide a clean and flexible API!</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

export default App;`,
      exercise: `1. Build a 'Tabs' component using the Compound Components pattern (Tabs, TabList, Tab, TabPanel).
2. Create a 'Modal' component with 'Modal.Trigger', 'Modal.Window', and 'Modal.Close'.
3. Implement a 'MultiStepForm' where the state of the current step is shared implicitly.
4. Try to implement the pattern without using \`React.Children.map\` (use Context instead). Discuss the pros and cons.`,
      commonMistakes: [
        "Not providing a fallback for the Context, leading to errors if children are used outside the parent.",
        "Over-using the pattern for simple components that don't need it.",
        "Breaking the implicit contract by nesting components too deeply (Context solves this!).",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the Compound Components pattern and why is it useful?",
          a: "It's a pattern where a group of components work together to perform a task. It's useful because it avoids prop drilling and gives the developer more flexibility over the component's internal structure and layout.",
        },
        {
          type: "scenario",
          q: "How does the Context API help in implementing Compound Components?",
          a: "Context allows the parent component to share its internal state (like which tab is active) with all its descendants (the individual tabs) regardless of how deep they are nested, without having to pass props through every intermediate level.",
        },
      ],
    },
    {
      id: "react-render-props-pattern",
      title: "Render Props",
      explanation: `**Render Props** refers to a technique for sharing code between React components using a prop whose value is a function.

**The Concept:**
Instead of a component rendering its own UI, it takes a function as a prop and calls that function to know what to render. This allows the parent to decide how the data should be displayed while the child handles the logic.

**Use Case:**
Sharing stateful logic (like mouse position, scroll position, or data fetching) between components that have different UIs.

*Note: While many render prop use cases have been replaced by Custom Hooks (Phase 13), it's still an important pattern used in libraries like Formik and React Router.*`,
      codeExample: `import React, { useState } from 'react';

// 1. Logic Component
const MouseTracker = ({ render }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setPosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  return (
    <div style={{ height: '200px', border: '1px solid black' }} onMouseMove={handleMouseMove}>
      {/* 2. Call the render prop with the internal state */}
      {render(position)}
    </div>
  );
};

// 3. Usage with different UIs
function App() {
  return (
    <div className="space-y-8 p-10">
      <h1 className="text-xl font-bold">Render Props Pattern</h1>

      {/* UI 1: Simple Coordinates */}
      <MouseTracker render={({ x, y }) => (
        <p className="p-4">The mouse position is ({x}, {y})</p>
      )} />

      {/* UI 2: A moving circle */}
      <MouseTracker render={({ x, y }) => (
        <div style={{
          position: 'absolute',
          backgroundColor: 'blue',
          borderRadius: '50%',
          left: x - 10,
          top: y - 10,
          width: '20px',
          height: '20px',
          pointerEvents: 'none'
        }} />
      )} />
    </div>
  );
}

export default App;`,
      exercise: `1. Build a 'DataFetcher' component that takes a 'url' and a 'render' prop. The render prop should receive { data, loading, error }.
2. Refactor a component that uses a Boolean 'isOpen' state to use a render prop (often called a 'Toggle' or 'Disclosure' component).
3. Combine Render Props with Compound Components (e.g., a component that provides data via a render prop to its children).
4. List 3 libraries you use that employ the render props pattern.`,
      commonMistakes: [
        "Naming the prop something other than 'render' (it's a convention, not a rule, but consistency helps).",
        "Not handling the case where the render function returns null.",
        "Using Render Props when a simple Custom Hook would be cleaner (Hooks are generally preferred since 2019).",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is a 'render prop' in React?",
          a: "A render prop is a technique where a component receives a function as a prop and uses that function to determine what to render. This allows for logic sharing and highly flexible UI rendering.",
        },
        {
          type: "scenario",
          q: "How do Hooks compare to the Render Props pattern?",
          a: "Hooks generally lead to flatter component trees and are easier to compose. However, Render Props are still useful when you need to decide what to render dynamically based on internal component state in a way that's visible in the JSX structure.",
        },
      ],
    },
    {
      id: "react-control-props",
      title: "Control Props Pattern",
      explanation: `**Control Props** is a pattern used to create components that can be either **uncontrolled** (managing their own state) or **controlled** (state managed by the parent).

This is exactly how standard HTML inputs work in React. If you pass a \`value\` prop, it becomes controlled. If you don't, it's uncontrolled.

**Why use it?**
It gives users of your component ultimate power. They can let the component handle its own business for 90% of cases, but "take over" the state when they need to sync it with other parts of the app.`,
      codeExample: `import React, { useState } from 'react';

// A Toggle component that can be Controlled or Uncontrolled
function Toggle({ on, onChange, defaultOn = false }) {
  // 1. Internal state (used if uncontrolled)
  const [internalOn, setInternalOn] = useState(defaultOn);

  // 2. Determine if we are controlled
  const isControlled = on !== undefined;
  const stateOn = isControlled ? on : internalOn;

  const handleToggle = () => {
    if (!isControlled) {
      setInternalOn(!stateOn);
    }
    // 3. Always notify the parent
    if (onChange) {
      onChange(!stateOn);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={\`px-4 py-2 rounded \${stateOn ? 'bg-green-500' : 'bg-gray-300'}\`}
    >
      {stateOn ? 'ON' : 'OFF'}
    </button>
  );
}

// Usage
function App() {
  const [bothOn, setBothOn] = useState(false);

  return (
    <div className="space-y-4 p-10">
      <div>
        <p>Uncontrolled (Handles its own state):</p>
        <Toggle onChange={on => console.log('Toggled to:', on)} />
      </div>

      <div>
        <p>Controlled (Parent forces state):</p>
        <div className="space-x-2">
          <Toggle on={bothOn} onChange={setBothOn} />
          <Toggle on={bothOn} onChange={setBothOn} />
          <button onClick={() => setBothOn(false)} className="underline text-sm">
            Turn both off
          </button>
        </div>
      </div>
    </div>
  );
}`,
      exercise: `1. Implement a 'Counter' component that uses the Control Props pattern.
2. Build a 'SearchSelect' component where the parent can optionally control the selected item and the search query.
3. Research the \`useControlled\` hook pattern used in libraries like Material UI or Reach UI.
4. Explain why you might want to avoid making EVERY prop a control prop.`,
      commonMistakes: [
        "Not handling the transition between controlled and uncontrolled correctly (React will warn if a component changes from one to the other).",
        "Forgetting to call the \`onChange\` callback in the uncontrolled case.",
        "Creating complex 'sync' logic when a simple 'key' prop would have sufficed to reset internal state.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between controlled and uncontrolled components?",
          a: "A controlled component's state is driven by props (external), while an uncontrolled component maintains its own internal state. Control Props is a pattern that allows a component to support both modes.",
        },
      ],
    },
  ],
};

export default reactPhase6;
