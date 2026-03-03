const reactPhase9 = {
  id: "phase-9",
  title: "Phase 9: Client-Side Routing",
  emoji: "🛣️",
  description: "Learn how to build multi-page applications using React Router and get an introduction to the Next.js App Router.",
  topics: [
    {
      id: "react-router-basics",
      title: "React Router Fundamentals",
      explanation: `React is a Single Page Application (SPA) library, meaning it only has one HTML file. **Routing** is the process of deciding which components to show based on the current URL in the browser.

**React Router (v6+)** is the industry standard for routing in Vite/SPA apps.

**Core Components:**
- **BrowserRouter:** The parent component that stores the current location and navigates using the browser's history API.
- **Routes & Route:** Define the mapping between a path (e.g., \`/about\`) and a component (e.g., \`<About />\`).
- **Link:** Use this instead of \`<a>\` tags to navigate without a full page reload.
- **Outlet:** A placeholder for "nested routes". It's where the child route's component will be rendered.`,
      codeExample: `import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';

// 1. Layout Component with <Outlet />
function Layout() {
  return (
    <div>
      <nav className="p-4 bg-gray-800 text-white flex space-x-4">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        <Link to="/products" className="hover:text-blue-400">Products</Link>
        <Link to="/about" className="hover:text-blue-400">About</Link>
      </nav>
      <main className="p-10">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<h1>Home Page</h1>} />
          <Route path="about" element={<h1>About Us</h1>} />
          <Route path="products" element={<ProductList />} />
          <Route path="*" element={<h1>404: Not Found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}`,
      exercise: `1. Set up a basic React Router project with at least 3 pages.
2. Implement a 'Navbar' that highlights the 'Active' link using \`NavLink\`.
3. Create a nested route structure (e.g., \`/dashboard/settings\` and \`/dashboard/profile\`).
4. Research why using regular \`<a>\` tags in a React app causes the entire app to re-bootstrap.`,
      commonMistakes: [
        "Using \`<a>\` tags instead of \`<Link>\` (causing full page reloads and losing state).",
        "Forgetting the \`<Outlet />\` in a parent route, which prevents child routes from appearing.",
        "Not handling 404 routes using the \`path=\"*\"\` wildcard.",
        "Nesting routes too deeply, making the URL structure confusing."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between Link and NavLink in React Router?",
          a: "\`<Link>\` is used for basic navigation. \`<NavLink>\` is a special version of \`<Link>\` that knows if it is 'active' (matching the current URL). It's useful for styling the active link in a navigation bar."
        }
      ]
    },
    {
      id: "react-router-dynamic",
      title: "Dynamic Routes & Params",
      explanation: `In a real app, you don't define a separate route for every product or user. You use **Dynamic Segments**.

**URL Parameters (Params):**
Segments of the URL that start with a colon (\`:\`).
Example: \`/product/:id\` matches \`/product/123\` and \`/product/abc\`.
You access these using the \`useParams()\` hook.

**Search Parameters (Query Strings):**
The part of the URL after the \`?\`.
Example: \`/search?q=react&sort=newest\`.
You access and update these using the \`useSearchParams()\` hook.`,
      codeExample: `import { useParams, useSearchParams, Link } from 'react-router-dom';

function ProductDetail() {
  // 1. Accessing URL Params (:id)
  const { id } = useParams();
  
  return (
    <div>
      <h1>Product ID: {id}</h1>
      <Link to="/products" className="text-blue-500 underline">Back to List</Link>
    </div>
  );
}

function SearchPage() {
  // 2. Accessing and Updating Search Params (?q=...)
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleSearch = (e) => {
    const value = e.target.value;
    // Update the URL without a reload
    setSearchParams({ q: value });
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={handleSearch} 
        placeholder="Filter results..."
        className="border p-2"
      />
      <p>Searching for: {query}</p>
    </div>
  );
}`,
      exercise: `1. Build a 'User Profile' page that displays a different user based on the ID in the URL.
2. Implement a 'Sort' feature using search parameters (e.g., \`?sort=price_asc\`).
3. Create a 'Breadcrumbs' component that parses the current URL path to show the navigation trail.
4. Try to use \`useNavigate\` to redirect a user programmatically after they submit a form.`,
      commonMistakes: [
        "Forgetting the colon (\`:\`) when defining a dynamic route.",
        "Not handling cases where a param or search param might be missing (undefined).",
        "Thinking search params are part of the \`useParams\` hook (they are separate!)."
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "How do you extract a dynamic ID from a URL in React Router?",
          a: "You define the route with a colon, like \`path=\"/user/:id\"\`, and then use the \`useParams()\` hook inside the component to access it: \`const { id } = useParams();\`."
        }
      ]
    }
  ]
};

export default reactPhase9;
