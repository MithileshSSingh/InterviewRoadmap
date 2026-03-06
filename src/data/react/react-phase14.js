const reactPhase14 = {
  id: "phase-14",
  title: "Phase 14: Modern React (RSC & Next.js)",
  emoji: "🚀",
  description:
    "Explore the newest era of React. Learn about React Server Components (RSC), Server Actions, and how the Next.js App Router changes everything.",
  topics: [
    {
      id: "react-server-components",
      title: "React Server Components (RSC)",
      explanation: `**Server Components** represent the biggest shift in React's mental model in years. They allow you to render some components entirely on the server, sending only the final HTML (and a special serializable format) to the browser.

**Client vs Server Components:**
- **Server Components (Default in App Router):** Can fetch data directly from a database, use secret keys, and have **zero** impact on your JavaScript bundle size. They cannot use hooks (\`useState\`, \`useEffect\`) or browser APIs.
- **Client Components (\`'use client'\`):** Can use hooks and browser APIs. These are sent to the client as JavaScript and "hydrated".

**The Boundary Rule:**
You can import a Client Component into a Server Component, but you **cannot** import a Server Component into a Client Component. Instead, you should pass Server Components as \`children\` or props to Client Components.

**Why RSC?**
1. **Zero-Bundle-Size:** Complex libraries used on the server don't get sent to the user.
2. **Direct Data Access:** No need for a separate API layer just to fetch data for your UI.
3. **Improved Performance:** Faster initial load and less JavaScript to execute.`,
      codeExample: `// 1. A Server Component (page.tsx)
// Can be async!
async function BlogPage() {
  // Fetch data directly from a database or API
  const posts = await db.post.findMany(); 

  return (
    <div>
      <h1>My Blog</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          {/* 2. Pass data to a Client Component */}
          <LikeButton postId={post.id} />
        </article>
      ))}
    </div>
  );
}

// 3. A Client Component (LikeButton.tsx)
'use client'; // Required to use hooks
import { useState } from 'react';

function LikeButton({ postId }) {
  const [likes, setLikes] = useState(0);

  return (
    <button onClick={() => setLikes(likes + 1)}>
      {likes} Likes
    </button>
  );
}`,
      exercise: `1. Set up a Next.js App Router project and identify which components are Server vs Client.
2. Try to use \`useEffect\` in a Server Component and observe the error message.
3. Fetch data in a Server Component and pass it as props to a Client Component.
4. Research the 'Serialization' rule: why can't you pass a function or a complex class instance from a Server Component to a Client Component?`,
      commonMistakes: [
        "Adding 'use client' to every file (this defeats the purpose of RSC).",
        "Trying to pass non-serializable data (like a function or a Date object) across the server-client boundary.",
        "Forgetting to add 'use server' to functions that are used as Server Actions.",
        "Over-using Client Components for simple things that could be handled on the server.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the primary benefit of React Server Components?",
          a: "The primary benefit is **reduced bundle size** and **faster performance**. Server Components are executed on the server, so their code and dependencies are never sent to the client. They also allow for direct database access during the render process.",
        },
        {
          type: "conceptual",
          q: "When must you use 'use client'?",
          a: "You must use 'use client' whenever a component needs to use **Hooks** (like useState or useEffect), **Event Listeners** (like onClick), or **Browser APIs** (like window or document).",
        },
      ],
    },
    {
      id: "react-server-actions",
      title: "Server Actions",
      explanation: `**Server Actions** are a way to handle form submissions and data mutations without writing a manual API route. They are asynchronous functions that are executed on the server but called from your client-side forms.

**Why they are cool:**
1. **No API Boilerplate:** No more \`fetch('/api/submit', { method: 'POST' })\`.
2. **Type Safety:** If you use TypeScript, your server-side function and client-side form share the same types.
3. **Progressive Enhancement:** Server Actions work even if JavaScript is disabled in the user's browser (if they are used inside a standard form).
4. **Integration with \`useFormStatus\` and \`useFormState\`:** Easy ways to handle loading and error states for your forms.`,
      codeExample: `// 1. Define the action (actions.ts)
'use server';

export async function createTodo(formData: FormData) {
  const title = formData.get('title');
  
  // Save to database
  await db.todo.create({ data: { title } });
  
  // Tell Next.js to refresh the UI
  revalidatePath('/todos');
}

// 2. Use the action in a form (page.tsx)
function TodoPage() {
  return (
    <form action={createTodo}>
      <input name="title" type="text" className="border" />
      <button type="submit">Add Todo</button>
    </form>
  );
}`,
      exercise: `1. Implement a 'Contact Form' using a Server Action.
2. Use \`revalidatePath\` or \`revalidateTag\` to update the UI after a mutation.
3. Use the \`useFormStatus\` hook to show a 'Saving...' state on your submit button.
4. Add 'Server-side Validation' to your action (using a library like Zod) and return errors to the UI.`,
      commonMistakes: [
        "Forgetting to add 'use server' at the top of the file or function.",
        "Performing sensitive actions without checking the user's session (Authentication!).",
        "Not handling server-side errors gracefully, leading to crashes.",
        "Thinking Server Actions are only for forms (they can also be called like regular async functions).",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do Server Actions improve the developer experience compared to traditional API routes?",
          a: "They eliminate the need to manually define and maintain API endpoints, handle JSON serialization, and manage fetch logic on the client. It allows for a more seamless, end-to-end development flow where the server logic feels like a regular function call.",
        },
      ],
    },
  ],
};

export default reactPhase14;
