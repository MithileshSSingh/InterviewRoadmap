const reactPhase3 = {
  id: "phase-3",
  title: "Phase 3: JSX & Components",
  emoji: "🧱",
  description: "Master the syntax of JSX and the art of building reusable, composable components.",
  topics: [
    {
      id: "react-jsx-deep-dive",
      title: "JSX Deep Dive",
      explanation: `**JSX** (JavaScript XML) is a syntax extension for JavaScript. It looks like HTML but comes with the full power of JavaScript. 

**How JSX works:**
Browsers cannot read JSX. It must be transformed into regular JavaScript. Modern tools like Vite or Babel use \`react/jsx-runtime\` to transform JSX into \`_jsx()\` function calls.

**Key Rules of JSX:**
1. **Return a Single Root Element:** Every component must return exactly one root element (or a Fragment). This is because a function can only return one value.
2. **Close All Tags:** Unlike HTML, all tags in JSX must be self-closed (e.g., \`<img />\`) or have a closing tag.
3. **camelCase Everything:** Since JSX is JS, attributes are camelCase. \`class\` becomes \`className\`, \`onclick\` becomes \`onClick\`, and \`tabindex\` becomes \`tabIndex\`.
4. **JavaScript in Curly Braces:** You can embed any valid JS expression inside \`{ }\`.

**Wait, why not just use HTML?**
JSX allows you to keep your logic (JS) and your markup (UI) in the same place. This "Locality of Reference" makes components easier to understand and maintain compared to the traditional separation of HTML and JS files.`,
      codeExample: `import React from 'react';

function JsxShowcase() {
  const user = {
    name: 'Jane Doe',
    avatar: 'https://i.pravatar.cc/150?u=jane',
    isOnline: true
  };

  const getStatusColor = (online) => online ? 'bg-green-500' : 'bg-gray-500';

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg p-4 bg-white">
      {/* 1. Attributes are camelCase (className) */}
      <div className="flex items-center space-x-4">
        
        {/* 2. Self-closing tags are required */}
        <img 
          className="w-12 h-12 rounded-full" 
          src={user.avatar} 
          alt={user.name} 
        />

        <div className="flex-1">
          {/* 3. Expressions in curly braces */}
          <h3 className="text-lg font-semibold">{user.name}</h3>
          
          <div className="flex items-center space-x-2">
            {/* 4. Conditional rendering inside JSX */}
            <span className={\`w-3 h-3 rounded-full \${getStatusColor(user.isOnline)}\`}></span>
            <span className="text-sm text-gray-600">
              {user.isOnline ? 'Active Now' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Using logical && for short-circuiting */}
      {user.isOnline && (
        <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Send Message
        </button>
      )}
    </div>
  );
}

export default JsxShowcase;`,
      exercise: `1. Convert a snippet of plain HTML (like a navigation bar) into JSX.
2. Write a component that renders an array of user names into an unordered list using \`.map()\`.
3. Try to return two \`<div>\` elements from a component without a parent or a Fragment and see what error you get.
4. Use the 'Babel REPL' (online) to see what a JSX block looks like after it's compiled to plain JavaScript.`,
      commonMistakes: [
        "Using 'class' instead of 'className'.",
        "Forgetting to wrap multiple elements in a Fragment or a parent div.",
        "Putting a block-level statement (like a 'for' loop or 'if/else') inside curly braces (only expressions are allowed).",
        "Not self-closing tags like <br> or <input>."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is JSX, and is it required for React?",
          a: "JSX is a syntax extension for JavaScript that looks like HTML. It is **not** required for React, but it is highly recommended as it makes code much more readable and easier to write. Without JSX, you would have to write nested \`React.createElement()\` or \`_jsx()\` calls manually."
        },
        {
          type: "tricky",
          q: "Why can't you use a 'for' loop or 'if' statement directly inside JSX curly braces?",
          a: "JSX curly braces can only contain **expressions** (things that resolve to a value, like a variable, a function call, or a ternary operator). 'for' and 'if' are **statements** and do not resolve to a value. Instead, you should use \`.map()\` for loops and ternaries or \`&&\` for conditions."
        }
      ]
    },
    {
      id: "react-components-props",
      title: "Components & Props",
      explanation: `Components are the building blocks of a React app. Think of them as custom HTML elements.

**Function Components:**
Modern React uses **Function Components**. They are just JavaScript functions that take an object called **Props** (short for properties) and return JSX.

**Props (Properties):**
Props are the way you pass data from a parent component to a child component.
- **ReadOnly:** A component must never modify its own props. They should be treated as immutable.
- **Unidirectional:** Data flows down (Parent -> Child).

**Composition over Inheritance:**
React encourages building complex UIs by combining smaller components. Instead of creating a giant \`UserDashboard\`, you create a \`Sidebar\`, a \`Header\`, and a \`ContentArea\`, and then "compose" them together.

**Children Prop:**
The special \`children\` prop allows you to pass JSX directly into a component, making "wrapper" components (like Layouts or Cards) possible.`,
      codeExample: `import React from 'react';

// 1. Child Component with Destructured Props
const Button = ({ label, onClick, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-200 text-gray-800',
    danger: 'bg-red-500 text-white'
  };

  return (
    <button 
      onClick={onClick}
      className={\`px-4 py-2 rounded font-medium \${styles[variant]}\`}
    >
      {label}
    </button>
  );
};

// 2. Wrapper Component using 'children'
const Card = ({ title, children }) => {
  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
      <div className="px-4 py-2 border-b font-bold bg-gray-50">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
};

// 3. Parent Component Composing the others
function App() {
  const handleAction = () => alert('Action triggered!');

  return (
    <div className="p-10 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Component Composition</h1>
      
      <Card title="Account Settings">
        <p className="mb-4 text-gray-600">
          Update your profile information and email preferences here.
        </p>
        <div className="flex space-x-2">
          <Button label="Save Changes" onClick={handleAction} />
          <Button label="Cancel" onClick={() => {}} variant="secondary" />
        </div>
      </Card>

      <Card title="Danger Zone">
        <p className="mb-4 text-red-600 font-medium">
          Once you delete your account, there is no going back.
        </p>
        <Button 
          label="Delete Account" 
          onClick={() => confirm('Are you sure?')} 
          variant="danger" 
        />
      </Card>
    </div>
  );
}

export default App;`,
      exercise: `1. Create a \`Greeting\` component that takes a \`name\` prop and displays it.
2. Build a \`List\` component that takes an array of items and a \`renderItem\` function as props (this is a common pattern called 'Render Props').
3. Create a \`Layout\` component that uses \`children\` to wrap every page of your app with a common Header and Footer.
4. Experiment with 'Prop Drilling': Pass a piece of data through 3 levels of components and notice how tedious it becomes (you'll solve this later with Context).`,
      commonMistakes: [
        "Trying to change a prop value inside a child component (Props are read-only).",
        "Not destructuring props, leading to messy code like 'props.user.name' everywhere.",
        "Using PascalCase for prop names (prop names should be camelCase).",
        "Forgetting to provide a 'key' when rendering a list of components."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are 'props' in React?",
          a: "Props (short for properties) are a way of passing data from a parent component to a child component. They are read-only and help make components reusable by allowing them to render different content based on the data they receive."
        },
        {
          type: "conceptual",
          q: "What is the 'children' prop?",
          a: "The 'children' prop is a special prop that automatically passes whatever is placed between the opening and closing tags of a component. It is primarily used for 'wrapper' or 'layout' components that don't know their content in advance."
        }
      ]
    }
  ]
};

export default reactPhase3;
