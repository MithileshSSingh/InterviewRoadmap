const reactPhase2 = {
  id: "phase-2",
  title: "Phase 2: Modern Tooling & Setup",
  emoji: "🛠️",
  description:
    "Set up a professional development environment. Learn about Vite, Next.js, and how to structure a React project for scalability.",
  topics: [
    {
      id: "react-tooling-vite-nextjs",
      title: "Vite, Next.js & The Ecosystem",
      explanation: `Gone are the days of manual Webpack configuration for every project. The React ecosystem has evolved towards higher-level tools that provide better developer experience (DX) and performance.

**Vite:**
Vite (French for "quick") is the modern standard for Single Page Applications (SPAs). It uses native ES modules in the browser during development, making start-up and Hot Module Replacement (HMR) incredibly fast, regardless of project size.
- **Why Vite over CRA?** Create React App (CRA) is deprecated. Vite is faster, more configurable, and supports modern features out of the box.

**Next.js:**
Next.js is the most popular React framework. It goes beyond the view layer to provide routing, data fetching, and optimization. It supports:
- **Server-Side Rendering (SSR):** Better SEO and initial load.
- **Static Site Generation (SSG):** Blazing fast performance for static content.
- **Incremental Static Regeneration (ISR):** Update static content without a full rebuild.
- **App Router:** The modern way to build React apps with Server Components.

**Choosing Your Stack:**
- **Vite:** Best for dashboards, authenticated apps (admin panels), or when you don't need SSR.
- **Next.js:** Best for public-facing sites, e-commerce, blogs, or complex enterprise apps needing SEO and performance.`,
      codeExample: `// 1. Creating a Vite Project
// terminal: npm create vite@latest my-react-app -- --template react-ts

// 2. A typical Vite Configuration (vite.config.ts)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Setup aliases for cleaner imports
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
  server: {
    port: 3000,
    open: true, // Auto-open browser
  }
})

// 3. Creating a Next.js Project
// terminal: npx create-next-app@latest my-next-app`,
      exercise: `1. Create a new React project using Vite and explore the generated files.
2. Compare the 'dist' output of a Vite build with a simple HTML/JS file. Notice the minification and bundling.
3. Install 'next' and try to convert a basic Vite app into a Next.js app.
4. Set up an ESLint and Prettier configuration that automatically fixes linting errors on save.`,
      commonMistakes: [
        "Continuing to use 'Create React App' for new projects (it is no longer recommended).",
        "Not using environment variables (.env) for sensitive information like API keys.",
        "Overcomplicating the setup before you actually need complex features.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is Vite faster than Webpack-based tools like Create React App?",
          a: "Vite uses native ES modules in the browser during development. Instead of bundling the entire app before serving (like Webpack), it only transforms and serves code as requested by the browser. It also uses 'esbuild' (written in Go) for dependency pre-bundling, which is significantly faster than JS-based bundlers.",
        },
        {
          type: "scenario",
          q: "When would you choose Next.js over a standard Vite SPA?",
          a: "I would choose Next.js if the project requires **SEO** (since SPAs are harder for some crawlers), faster **First Contentful Paint** (via SSR/SSG), or if I want a more opinionated framework that includes routing and API routes built-in.",
        },
      ],
    },
    {
      id: "react-project-structure",
      title: "Scalable Project Structure",
      explanation: `React doesn't have an opinion on how you put files into folders. However, as an app grows, a "flat" structure becomes unmanageable.

**Common Patterns:**
1. **Feature-Based (Recommended):** Group files by domain (e.g., 'auth', 'profile', 'billing'). Each folder contains its own components, hooks, and tests.
2. **Type-Based:** Group files by their function (e.g., 'components', 'hooks', 'pages', 'utils'). This works well for smaller apps.

**The 'src' Folder Best Practices:**
- \`components/\`: Global, reusable UI components (Buttons, Inputs, Modals).
- \`features/\`: Domain-specific logic.
- \`hooks/\`: Global custom hooks.
- \`context/\`: Global state providers.
- \`services/\`: API call logic (Axios/Fetch instances).
- \`utils/\`: Pure helper functions.
- \`assets/\`: Images, fonts, and global CSS.

**Naming Conventions:**
- Components: PascalCase (\`UserCard.tsx\`).
- Hooks: camelCase starting with 'use' (\`useAuth.ts\`).
- Utils/Services: camelCase (\`formatDate.ts\`).`,
      codeExample: `// Example of a Feature-Based Structure:
/*
src/
  components/           # Atomic UI elements
    Button/
      Button.tsx
      Button.test.tsx
      index.ts
  features/             # Grouped by domain
    auth/
      components/
        LoginForm.tsx
      hooks/
        useLogin.ts
      types/
        auth.types.ts
      api/
        auth.service.ts
  hooks/                # Global hooks
    useLocalStorage.ts
  layouts/              # Page wrappers
    MainLayout.tsx
  pages/                # Route components
    Dashboard.tsx
  utils/                # Helper functions
    api-client.ts
*/

// Example index.ts pattern for cleaner imports
// src/components/Button/index.ts
export * from './Button';
export { default } from './Button';

// Usage: import Button from '@/components/Button';`,
      exercise: `1. Reorganize a 'spaghetti' project into a feature-based structure.
2. Implement 'Barrel Files' (index.ts) for a few components and see how it affects your import statements.
3. Set up 'Absolute Imports' (using @/ prefix) in a Vite or Next.js project.
4. Create a 'components' folder that follows the Atomic Design principle (Atoms, Molecules, Organisms).`,
      commonMistakes: [
        "Creating a separate folder for every single component, even if it's only used once.",
        "Deeply nesting folders (more than 3-4 levels) making navigation difficult.",
        "Not being consistent with naming (mixing PascalCase and kebab-case for files).",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "How would you structure a large-scale React application with multiple teams?",
          a: "I would recommend a **feature-based** or **monorepo** structure. Feature-based grouping allows teams to work on their specific domains (e.g., 'Checkout', 'Inventory') with minimal friction. Using 'Barrel files' and 'Absolute imports' also helps maintain clean boundaries and easier refactoring.",
        },
      ],
    },
  ],
};

export default reactPhase2;
