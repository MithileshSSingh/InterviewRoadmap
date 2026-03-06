const reactPhase4 = {
  id: "phase-4",
  title: "Phase 4: State Management Basics",
  emoji: "💾",
  description:
    "Learn how to make your components interactive by managing state. Master useState, useReducer, and the art of 'lifting state up'.",
  topics: [
    {
      id: "react-usestate",
      title: "useState Hook",
      explanation: `State is data that changes over time and affects what is rendered on the screen. The \`useState\` hook is the primary way to add state to a functional component.

**The Hook Signature:**
\`const [state, setState] = useState(initialValue);\`
- \`state\`: The current value of the state.
- \`setState\`: A function to update the state.
- \`initialValue\`: The value the state starts with.

**Key Concepts:**
1. **Asynchronous Updates:** Calling \`setState\` doesn't change the state immediately. It schedules a re-render.
2. **Functional Updates:** If your new state depends on the previous state, always use a function: \`setCount(prev => prev + 1)\`.
3. **Batching:** React batches multiple state updates together into a single re-render for performance.
4. **Immutability:** Never modify state directly (e.g., \`state.name = 'Bob'\`). Always provide a new object or value.`,
      codeExample: `import React, { useState } from 'react';

function ProfileForm() {
  // 1. Initializing state with an object
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isSubscribed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // 2. IMPORTANT: Spread the existing state!
    // Never do: user[name] = value;
    setUser(prevUser => ({
      ...prevUser,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    // 3. Resetting to initial state
    setUser({
      firstName: '',
      lastName: '',
      email: '',
      isSubscribed: false
    });
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Update Profile</h2>
      
      <div className="space-y-4">
        <input
          name="firstName"
          value={user.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full p-2 border rounded"
        />
        <input
          name="lastName"
          value={user.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full p-2 border rounded"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isSubscribed"
            checked={user.isSubscribed}
            onChange={handleChange}
          />
          <span>Subscribe to newsletter</span>
        </label>
        
        <div className="pt-4 border-t flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          <button onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">Reset</button>
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-100 rounded text-sm font-mono">
        {JSON.stringify(user, null, 2)}
      </div>
    </div>
  );
}

export default ProfileForm;`,
      exercise: `1. Build a 'Counter' with increment, decrement, and reset buttons.
2. Create a 'Toggle' component that switches between 'Dark' and 'Light' mode.
3. Build a 'To-Do' list where users can add items and mark them as completed.
4. Create a component with two counters and a 'Total' display. Update them and notice when the component re-renders.`,
      commonMistakes: [
        "Directly mutating state (e.g., state.push(newItem)).",
        "Assuming state is updated immediately after calling the setter.",
        "Not using the functional update pattern when the new state depends on the old state.",
        "Initializing state with props and expecting the state to update when props change (use useEffect or a key for that).",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Is useState synchronous or asynchronous?",
          a: "State updates in React are **asynchronous**. When you call the setter function, React schedules an update rather than changing the variable immediately. This allows React to batch multiple updates together for better performance.",
        },
        {
          type: "coding",
          q: "How do you update an object in state without losing other properties?",
          a: "You must use the spread operator (\`...\`) to copy the existing state properties into a new object, and then override the specific property you want to change. Example: \`setPerson(prev => ({ ...prev, name: 'New Name' }))\`.",
        },
      ],
    },
    {
      id: "react-usereducer",
      title: "useReducer Hook",
      explanation: `\`useReducer\` is an alternative to \`useState\` that is better suited for complex state logic involving multiple sub-values or when the next state depends on the previous one.

**The Reducer Pattern:**
1. **State:** The current data.
2. **Action:** An object describing what happened (e.g., \`{ type: 'INCREMENT' }\`).
3. **Reducer:** A pure function that takes the current state and an action, and returns the new state.
4. **Dispatch:** A function used to send actions to the reducer.

**When to use useReducer:**
- You have complex state (objects with many fields).
- One state update depends on another state value.
- You want to separate state logic from the component's UI code.
- You want to make testing state transitions easier.`,
      codeExample: `import React, { useReducer } from 'react';

// 1. Initial State
const initialState = { count: 0, step: 1 };

// 2. Reducer Function (Pure, no side effects!)
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return initialState;
    default:
      throw new Error('Unknown action type');
  }
}

function AdvancedCounter() {
  // 3. Initialize useReducer
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="p-8 max-w-sm mx-auto bg-white shadow-xl rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">Reducer Counter</h1>
      
      <div className="text-5xl font-mono text-center mb-8">{state.count}</div>

      <div className="flex justify-center space-x-4 mb-6">
        <button 
          onClick={() => dispatch({ type: 'decrement' })}
          className="w-12 h-12 rounded-full bg-red-100 text-red-600 text-2xl"
        >
          -
        </button>
        <button 
          onClick={() => dispatch({ type: 'increment' })}
          className="w-12 h-12 rounded-full bg-green-100 text-green-600 text-2xl"
        >
          +
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-500 block">Step Size: {state.step}</label>
        <input 
          type="range" min="1" max="10" 
          value={state.step} 
          onChange={(e) => dispatch({ type: 'setStep', payload: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <button 
        onClick={() => dispatch({ type: 'reset' })}
        className="mt-6 w-full py-2 text-gray-400 hover:text-gray-600 text-sm underline"
      >
        Reset to Defaults
      </button>
    </div>
  );
}

export default AdvancedCounter;`,
      exercise: `1. Rewrite a complex \`useState\` form (like the one in the previous topic) using \`useReducer\`.
2. Build a 'Shopping Cart' reducer that handles 'ADD_ITEM', 'REMOVE_ITEM', and 'UPDATE_QUANTITY'.
3. Create a 'Timer' component where \`useReducer\` handles 'START', 'STOP', 'TICK', and 'RESET'.
4. Practice moving your reducer function outside the component file to see how it can be tested independently.`,
      commonMistakes: [
        "Mutating state inside the reducer (Reducers MUST be pure).",
        "Forgetting to return the state in the 'default' case (this can cause the state to become undefined).",
        "Using \`useReducer\` for very simple state that only needs a single \`useState\`.",
        "Performing side effects (like API calls) inside a reducer.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between useState and useReducer?",
          a: "\`useState\` is simpler and better for independent, basic state values. \`useReducer\` is better for complex state objects where multiple values change together, or when the next state depends on the previous state. It also helps decouple state logic from the component.",
        },
        {
          type: "scenario",
          q: "Why is it important that a reducer function is 'pure'?",
          a: "A pure function always returns the same output for the same input and has no side effects. React relies on this purity to determine if the state has actually changed (via reference comparison). If you mutate state directly, React might not detect the change and fail to re-render the UI.",
        },
      ],
    },
    {
      id: "react-lifting-state",
      title: "Lifting State Up",
      explanation: `In React, data flows down. But what if two sibling components need to share the same data? You "lift" that state up to their closest common ancestor.

**The Pattern:**
1. Move the state from the children to the parent.
2. Pass the state down as props to the children.
3. Pass "callback functions" (setters) down as props so children can request state changes.

**Why do this?**
- **Single Source of Truth:** Ensures all components are in sync.
- **Predictability:** You know exactly where the data lives and how it's changed.
- **Consistency:** Avoids "split" state where two components think the value is different.`,
      codeExample: `import React, { useState } from 'react';

// 1. Child component that accepts data and a callback
const TemperatureInput = ({ scale, temperature, onTemperatureChange }) => {
  return (
    <fieldset className="border p-4 rounded">
      <legend className="font-semibold px-2">Enter temperature in {scale}:</legend>
      <input
        className="border p-2 w-full mt-2"
        value={temperature}
        onChange={(e) => onTemperatureChange(e.target.value)}
      />
    </fieldset>
  );
};

// 2. Parent component that "owns" the state
function Calculator() {
  const [temp, setTemp] = useState('');
  const [scale, setScale] = useState('c');

  const handleCelsiusChange = (value) => {
    setTemp(value);
    setScale('c');
  };

  const handleFahrenheitChange = (value) => {
    setTemp(value);
    setScale('f');
  };

  const celsius = scale === 'f' ? (temp - 32) * 5 / 9 : temp;
  const fahrenheit = scale === 'c' ? (temp * 9 / 5) + 32 : temp;

  return (
    <div className="p-10 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Temperature Converter</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <TemperatureInput 
          scale="Celsius" 
          temperature={celsius} 
          onTemperatureChange={handleCelsiusChange} 
        />
        <TemperatureInput 
          scale="Fahrenheit" 
          temperature={fahrenheit} 
          onTemperatureChange={handleFahrenheitChange} 
        />
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
        {celsius >= 100 ? (
          <p className="text-orange-600 font-bold">The water would boil! 🔥</p>
        ) : (
          <p className="text-blue-600">The water would not boil. 💧</p>
        )}
      </div>
    </div>
  );
}

export default Calculator;`,
      exercise: `1. Create a 'Login' form where the 'Email' and 'Password' components are separate, but the 'Submit' button in the parent knows both values.
2. Build a search interface where one component has the 'Search Input' and another displays the 'Filtered List'.
3. Implement a 'Multi-step Form' where state is lifted to the parent to keep track of progress across steps.
4. Experiment with lifting state "too high" and notice how it causes unnecessary re-renders in unrelated components.`,
      commonMistakes: [
        "Lifting state too high (lifting it to App when only two small components need it).",
        "Duplicating state (keeping a copy in the parent AND the child).",
        "Passing too many props instead of grouping them into an object.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What does 'Lifting State Up' mean in React?",
          a: "It's the process of moving state from a child component to its parent so that the state can be shared with other sibling components. This ensures a 'single source of truth' for the shared data.",
        },
        {
          type: "scenario",
          q: "What are the downsides of lifting state too high in the component tree?",
          a: "Lifting state too high can lead to **'Prop Drilling'**, where you pass props through many components that don't actually use them. It can also cause unnecessary re-renders, as every component below the parent will re-render whenever the state changes, even if they don't consume that specific state.",
        },
      ],
    },
  ],
};

export default reactPhase4;
