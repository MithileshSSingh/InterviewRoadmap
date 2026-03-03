const reactPhase7 = {
  id: "phase-7",
  title: "Phase 7: Data Fetching & Async",
  emoji: "🌐",
  description: "Master fetching data from APIs. Learn how to handle loading states, errors, race conditions, and how to use Suspense for a better user experience.",
  topics: [
    {
      id: "react-fetching-basics",
      title: "Fetching Data with Effects",
      explanation: `Fetching data is one of the most common side effects in React. While libraries like TanStack Query are preferred for production, understanding how to do it manually with \`useEffect\` is essential.

**The Basic Pattern:**
1. Initialize state for \`data\`, \`isLoading\`, and \`error\`.
2. Use \`useEffect\` to trigger the fetch on mount (or when dependencies change).
3. Update state based on the API response.

**Why State is needed:**
Since fetching data is asynchronous, React needs to know when the data arrives so it can re-render the component. We use \`isLoading\` to show a spinner and \`error\` to show a message if things go wrong.`,
      codeExample: `import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Define async function inside effect
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty deps = fetch on mount

  // 2. Conditional rendering based on state
  if (loading) return <div className="p-4 animate-pulse">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <ul className="divide-y border rounded">
      {users.map(user => (
        <li key={user.id} className="p-3 hover:bg-gray-50">
          <p className="font-bold">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </li>
      ))}
    </ul>
  );
}`,
      exercise: `1. Build a 'Product Search' component that fetches results from an API as the user types.
2. Implement 'Pagination' for your user list. Fetch new data when the 'Next' page button is clicked.
3. Use 'Axios' instead of 'fetch' and notice the differences (e.g., automatic JSON parsing, easier error handling).
4. Create a component that fetches data from two different APIs and waits for both to finish before rendering.`,
      commonMistakes: [
        "Not handling the loading state, leading to 'undefined' errors when trying to access data before it arrives.",
        "Not handling errors, leaving the user with a broken UI if the API is down.",
        "Forgetting to include the 'signal' or a 'cancel' flag to prevent setting state on unmounted components.",
        "Triggering infinite fetch loops by not providing a dependency array."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why should you fetch data inside useEffect instead of the component body?",
          a: "The component body is executed on every render. If you fetch data there, you would trigger a network request every time the component updates, likely leading to an infinite loop (since setting the data state triggers a re-render). \`useEffect\` allows you to control exactly when the fetch happens."
        }
      ]
    },
    {
      id: "react-race-conditions",
      title: "Race Conditions & Cleanup",
      explanation: `A **Race Condition** in React happens when multiple async requests are made, and they resolve in a different order than they were sent.

**The Problem:**
User clicks "Category A", then quickly clicks "Category B". If the request for A takes 5 seconds but B takes 1 second, the results for B will show first, then be overwritten by the "older" results for A. The UI is now showing the wrong data!

**The Solutions:**
1. **Boolean Flag:** Use a variable to track if the current effect is still valid.
2. **AbortController:** Built-in browser API to actually cancel the network request. This is the preferred modern way.`,
      codeExample: `import React, { useState, useEffect } from 'react';

function ProductDetails({ productId }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // 1. Create the controller
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProduct = async () => {
      try {
        const res = await fetch(\`https://api.example.com/products/\${productId}\`, { signal });
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted: The component updated before I finished.');
        } else {
          console.error('Real error:', err);
        }
      }
    };

    fetchProduct();

    // 2. CLEANUP: Abort the fetch if productId changes or component unmounts
    return () => {
      controller.abort();
    };
  }, [productId]);

  if (!product) return <div>Loading...</div>;
  return <h1>{product.name}</h1>;
}`,
      exercise: `1. Simulate a slow network in Chrome DevTools and build a component that switches between different data tabs. Observe race conditions without cleanup.
2. Implement the 'Boolean Flag' approach to solving race conditions.
3. Build a 'Typeahead' search and use AbortController to cancel old requests as the user types new characters.
4. Explain the difference between 'Canceling a request' (AbortController) and 'Ignoring a response' (Boolean Flag).`,
      commonMistakes: [
        "Thinking that because the component unmounted, the network request stopped (it hasn't!).",
        "Setting state on an unmounted component (React will sometimes warn about this, though it's less common in newer versions).",
        "Not testing your data fetching on slow or unstable networks."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is a race condition in the context of React data fetching?",
          a: "A race condition occurs when an older asynchronous request finishes **after** a newer request, potentially overwriting the most recent data in the component state with outdated information."
        },
        {
          type: "coding",
          q: "How do you use AbortController to prevent race conditions?",
          a: "You create an \`AbortController\` instance inside \`useEffect\`, pass its \`signal\` to the \`fetch\` call, and call \`controller.abort()\` in the cleanup function. This ensures that if the effect re-runs or the component unmounts, the ongoing fetch is cancelled."
        }
      ]
    },
    {
      id: "react-error-boundaries",
      title: "Error Boundaries",
      explanation: `React components that crash shouldn't take down the entire application. **Error Boundaries** are special components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.

**Important Notes:**
- Error Boundaries are currently the only thing that **must** be written as a **Class Component** (or use a library like \`react-error-boundary\`).
- They catch errors during rendering, in lifecycle methods, and in constructors.
- They **do not** catch errors in event handlers, asynchronous code, or server-side rendering.`,
      codeExample: `// 1. The Class-based Error Boundary
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Update state so the next render will show the fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to a service like Sentry or LogRocket
    console.error("Caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-bold">Something went wrong.</h2>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline"
          >
            Try reloading the page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

// 2. Usage: Wrap risky components
function App() {
  return (
    <div className="p-10">
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
      
      <main>
        <ErrorBoundary>
          <UserProfile />
        </ErrorBoundary>
      </main>
    </div>
  );
}`,
      exercise: `1. Create a 'BuggyComponent' that throws an error when a button is clicked. Observe the white screen of death.
2. Implement an Error Boundary and wrap the 'BuggyComponent'. See the fallback UI.
3. Use the popular \`react-error-boundary\` library to see how it simplifies error handling for functional components.
4. Design a 'Global' error boundary and a 'Local' one for small UI widgets.`,
      commonMistakes: [
        "Wrapping the entire app in a single Error Boundary (users will see a blank page if one small thing fails).",
        "Thinking Error Boundaries catch async errors (they don't; you must handle those with try/catch in your effects).",
        "Not logging errors caught by the boundary to a monitoring service."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is an Error Boundary in React?",
          a: "It's a component that catches JavaScript errors in its child component tree and displays a fallback UI instead of crashing the whole app. It prevents a single component's failure from breaking the entire user interface."
        }
      ]
    }
  ]
};

export default reactPhase7;
