const reactPhase15 = {
  id: "phase-15",
  title: "Phase 15: Interview Prep & Senior Patterns",
  emoji: "🎓",
  description:
    "Prepare for senior-level React interviews. Master system design, accessibility, security, and advanced architectural patterns.",
  topics: [
    {
      id: "react-senior-architecture",
      title: "System Design & Architecture",
      explanation: `As a senior developer, you're not just writing components; you're designing systems.

**Key Architectural Decisions:**
1. **State Management Strategy:** When to use local vs. global vs. server state.
2. **Component Library vs. Custom UI:** Deciding based on project requirements and team size.
3. **Monorepo vs. Multi-repo:** Organizing large codebases with multiple apps and shared packages.
4. **Data Fetching Layer:** Standardizing how the app communicates with the backend (interceptors, error handling).

**The 'Clean Architecture' in React:**
Keep your UI layer as "dumb" as possible. Extract business logic into hooks or services. This makes your app easier to test, refactor, and migrate to new frameworks in the future.

**Design Systems:**
A senior developer should understand how to translate a Figma design into a token-based system (colors, spacing, typography) that is consistent across the entire application.`,
      codeExample: `/* 
Example of a decoupled "Feature" architecture:

/features/auth
  /api              # API calls (services)
    login.ts
  /components       # UI components
    LoginForm.tsx
  /hooks            # State and business logic
    useLogin.ts
  /types            # TypeScript interfaces
    auth.types.ts
  /utils            # Feature-specific helpers
    token-handler.ts
  index.ts          # The public API for this feature
*/

// --- index.ts (Public API) ---
// Only export what is absolutely necessary
export { useAuth } from './hooks/useAuth';
export { LoginForm } from './components/LoginForm';
export type { User } from './types/auth.types';

// --- useLogin.ts (Decoupled Logic) ---
import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../api/login';

export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // Handle success (save token, redirect)
    },
    onError: (err) => {
      // Handle error (notify user)
    }
  });
};`,
      exercise: `1. Design the architecture for a 'Global E-commerce Dashboard' from scratch. Explain your choice of state management and routing.
2. Create a 'Theming System' using CSS Variables that can be changed at runtime.
3. Review an old project and refactor a giant component into a decoupled structure (API, Hooks, UI).
4. Lead a mock 'Architecture Review' with a colleague, defending your choice of technical stack.`,
      commonMistakes: [
        "Prematurely choosing a complex tool (like Redux) when simpler tools would suffice.",
        "Not standardizing the 'Data Flow' of the application.",
        "Mixing business logic directly into the JSX.",
        "Not considering 'Cross-Cutting Concerns' like logging, error tracking, and analytics.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How would you handle a performance bottleneck in a large React list with complex items?",
          a: "I would first use the **React Profiler** to identify exactly what is re-rendering. Then I'd apply **React.memo** to the items, use **useCallback/useMemo** for props, and if the list is still slow, I would implement **Windowing** (using a library like react-window) so only the visible items are rendered.",
        },
        {
          type: "scenario",
          q: "How do you decide between building a custom UI or using a library like MUI/Radix?",
          a: "It depends on the project's 'Uniqueness' and 'Speed' requirements. For a standard admin panel, a library like MUI saves time. For a consumer-facing brand that needs a highly unique look, I'd use **Radix UI** (headless) for the accessibility logic and **Tailwind** for the custom styling.",
        },
      ],
    },
    {
      id: "react-accessibility-security",
      title: "Accessibility (A11y) & Security",
      explanation: `**Accessibility (A11y):**
Web applications must be usable by everyone, including people using screen readers or keyboard-only navigation.
- **Semantic HTML:** Use \`<button>\` for actions, \`<a>\` for links, \`<nav>\` for navigation.
- **ARIA Roles:** Use \`aria-label\`, \`aria-hidden\`, and \`role=\"dialog\"\` when standard HTML isn't enough.
- **Keyboard Navigation:** Ensure all interactive elements can be reached with the Tab key and activated with Enter/Space.

**Security:**
- **XSS (Cross-Site Scripting):** React escapes most data by default, but you must be careful with \`dangerouslySetInnerHTML\`.
- **Environment Variables:** Never commit secrets (API keys, database URLs) to GitHub. Use \`.env\` files and secure CI/CD secrets.
- **Sanitization:** Always sanitize user-provided HTML before rendering it.
- **Third-party Packages:** Regularly audit your dependencies for vulnerabilities using \`npm audit\`.`,
      codeExample: `// 1. GOOD Accessibility
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div className="bg-white p-6 rounded max-w-md w-full">
        <h2 id="modal-title" className="text-xl font-bold">{title}</h2>
        <div className="mt-4">{children}</div>
        <button 
          onClick={onClose} 
          aria-label="Close modal"
          className="absolute top-2 right-2 p-2"
        >
          X
        </button>
      </div>
    </div>
  );
};

// 2. Security (Avoid this unless absolutely necessary!)
const DangerousHtml = ({ html }) => {
  // ❌ Vulnerable to XSS
  // return <div dangerouslySetInnerHTML={{ __html: html }} />;
  
  // ✅ Better: Sanitize first (using DOMPurify)
  // import DOMPurify from 'dompurify';
  // const clean = DOMPurify.sanitize(html);
  // return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};`,
      exercise: `1. Use the 'Lighthouse' tool in Chrome to audit a project's accessibility.
2. Navigate your entire React app using only your keyboard. Note where you get "stuck".
3. Implement a 'Screen Reader' test using MacOS VoiceOver or NVDA.
4. Run \`npm audit\` on a project and fix any reported security vulnerabilities.`,
      commonMistakes: [
        "Using \`<div>\` or \`<span>\` for buttons (which breaks keyboard navigation and screen readers).",
        "Forgetting to add \`alt\` text to images.",
        "Hardcoding secrets in the frontend code instead of using environment variables.",
        "Not handling 'Sensitive Data' (like passwords) correctly in state or local storage.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What does 'dangerouslySetInnerHTML' do and why is it named that way?",
          a: "It allows you to render raw HTML strings directly into a component. It is named that way as a warning that it exposes your application to **XSS (Cross-Site Scripting)** attacks if the HTML content is not properly sanitized.",
        },
      ],
    },
  ],
};

export default reactPhase15;
