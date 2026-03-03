const reactPhase12 = {
  id: "phase-12",
  title: "Phase 12: Styling & UI Ecosystem",
  emoji: "🎨",
  description: "Explore the different ways to style React apps. From CSS Modules to Utility-First CSS and animations with Framer Motion.",
  topics: [
    {
      id: "react-styling-tailwind-modules",
      title: "Tailwind CSS & CSS Modules",
      explanation: `Styling in React can be done in many ways, each with its own trade-offs.

**1. CSS Modules:**
This is the "standard" way. It uses regular CSS but locally scopes it by automatically generating unique class names.
- **Pro:** Real CSS (no new syntax), isolated styles, no specificity wars.
- **Con:** You still have to switch between JS and CSS files.

**2. Tailwind CSS (Utility-First):**
Currently the most popular way to style React apps. Instead of writing CSS, you use pre-defined utility classes in your JSX.
- **Pro:** Extremely fast development, no context switching, small final CSS bundle, consistent design system.
- **Con:** JSX can look "cluttered" with many classes.

**3. CSS-in-JS (Styled Components):**
Write CSS directly inside your JS files using tagged template literals.
- **Pro:** Dynamic styles based on props, logic and styling in one file.
- **Con:** Performance overhead (CSS is generated at runtime), larger JS bundle.`,
      codeExample: `// --- CSS MODULES EXAMPLE ---
/* Button.module.css */
.primary {
  background-color: blue;
  color: white;
  padding: 10px;
}

// Button.tsx
import styles from './Button.module.css';
const Button = () => <button className={styles.primary}>Click Me</button>;

// --- TAILWIND CSS EXAMPLE ---
// Button.tsx
const TailwindButton = () => (
  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition shadow-md">
    Click Me
  </button>
);

// --- DYNAMIC TAILWIND (using clsx or tailwind-merge) ---
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DynamicButton = ({ active }) => (
  <button className={cn(
    "px-4 py-2 rounded",
    active ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
  )}>
    Click Me
  </button>
);`,
      exercise: `1. Rebuild a simple 'Card' component twice: once using CSS Modules and once using Tailwind CSS.
2. Set up a 'Tailwind Config' with custom colors and fonts.
3. Use the \`tailwind-merge\` and \`clsx\` libraries to handle complex conditional classes.
4. Experiment with 'Responsive' styling in Tailwind (e.g., \`md:flex-row flex-col\`).`,
      commonMistakes: [
        "Using global CSS for everything (leading to naming conflicts).",
        "Over-relying on inline styles (\`style={{...}}\`), which are hard to maintain and can't use pseudo-selectors (hover, focus).",
        "Creating giant 'utils' files for styles instead of using a proper utility framework.",
        "Not using a linter for Tailwind classes (to keep them in a consistent order)."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is Tailwind CSS preferred over traditional CSS in large React teams?",
          a: "Tailwind enforces a consistent design system (constrained choices for colors/spacing), eliminates naming fatigue (you don't have to name every div), and results in a very small CSS bundle because utility classes are reused throughout the entire app."
        }
      ]
    },
    {
      id: "react-framer-motion",
      title: "Animations with Framer Motion",
      explanation: `Animations bring life to a UI. **Framer Motion** is the most popular animation library for React because it's declarative and powerful.

**The \`motion\` component:**
Replace any standard HTML tag with its motion equivalent (e.g., \`<div />\` becomes \`<motion.div />\`).

**Key Props:**
- \`initial\`: The starting state of the element.
- \`animate\`: The state the element should move to.
- \`transition\`: How the animation should behave (duration, spring, ease).
- \`exit\`: How the element should animate when it's removed from the DOM (used with \`AnimatePresence\`).
- \`whileHover\` / \`whileTap\`: Easy interactive animations.`,
      codeExample: `import { motion, AnimatePresence } from 'framer-motion';

function AnimatedList({ items }) {
  return (
    <ul className="space-y-2">
      <AnimatePresence>
        {items.map(item => (
          <motion.li
            key={item.id}
            // 1. Enter animation
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            // 2. Exit animation
            exit={{ opacity: 0, scale: 0.8 }}
            // 3. Hover effect
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-white shadow rounded flex justify-between"
          >
            {item.text}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

// 4. Simple toggle animation
const SimpleToggle = () => {
  const [isOn, setIsOn] = useState(false);
  
  return (
    <div 
      className={\`w-16 h-8 flex rounded-full p-1 cursor-pointer \${isOn ? 'bg-green-500' : 'bg-gray-300'}\`}
      onClick={() => setIsOn(!isOn)}
      style={{ justifyContent: isOn ? 'flex-end' : 'flex-start' }}
    >
      <motion.div 
        layout // Smoothly animate between two positions
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="w-6 h-6 bg-white rounded-full shadow" 
      />
    </div>
  );
};`,
      exercise: `1. Build a 'Fade-in' component that reveals its children when they mount.
2. Create an 'Animated Modal' that slides in from the bottom.
3. Implement a 'Staggered' list animation where items appear one after another.
4. Experiment with \`layoutId\` to animate elements moving between two different components (e.g., a shared layout transition).`,
      commonMistakes: [
        "Animating non-GPU accelerated properties (like \`height\` or \`margin\`) which causes layout shifts. Prefer \`transform\` (scale, x, y) and \`opacity\`.",
        "Forgetting to wrap \`exit\` animations in \`<AnimatePresence>\`.",
        "Adding too many animations, making the UI feel slow or distracting.",
        "Not considering users who prefer 'Reduced Motion' (use the \`useReducedMotion\` hook)."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is Framer Motion better for React than a library like GSAP?",
          a: "GSAP is powerful but imperative (you target elements by ID/ref). Framer Motion is fully declarative and integrated with React's render cycle, making it much easier to animate elements as they enter/exit the DOM or change state."
        }
      ]
    },
    {
      id: "react-component-libraries",
      title: "UI Libraries: Radix, Shadcn & Headless",
      explanation: `Building a perfect, accessible Modal or Select from scratch is incredibly hard. Modern teams use **Headless UI** libraries.

**What is 'Headless'?**
A headless library provides the **logic** (keyboard navigation, accessibility, state) but **no styles**. You bring your own CSS (usually Tailwind).

**The Modern Ecosystem:**
1. **Radix UI / Headless UI:** The low-level building blocks. Fully accessible, WAI-ARIA compliant.
2. **Shadcn/UI:** Not a library you install, but a collection of components you **copy-paste** into your project. It's built on Radix + Tailwind.
3. **MUI / Mantine / Ant Design:** Full "component libraries" that come with their own styles. Great for internal tools but harder to customize.`,
      codeExample: `// --- SHADCN/UI STYLE (Compound + Tailwind) ---
import * as Dialog from '@radix-ui/react-dialog';

const MyDialog = () => (
  <Dialog.Root>
    <Dialog.Trigger className="bg-blue-500 p-2 text-white">
      Open Modal
    </Dialog.Trigger>
    
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-xl">
        <Dialog.Title className="text-xl font-bold">Are you sure?</Dialog.Title>
        <Dialog.Description className="mt-2 text-gray-500">
          This action cannot be undone.
        </Dialog.Description>
        
        <div className="mt-4 flex justify-end space-x-2">
          <Dialog.Close className="px-4 py-2 bg-gray-100 rounded">Cancel</Dialog.Close>
          <button className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);`,
      exercise: `1. Explore the 'Shadcn/UI' documentation and install a few components in a project.
2. Build an accessible 'Accordion' using Radix UI and style it with Tailwind.
3. Compare the 'Bundle Size' of a project using MUI vs a project using Shadcn/UI (hint: Shadcn only adds the code you actually use).
4. Explain to a team member why we should prefer 'accessible' libraries over building custom UI widgets from scratch.`,
      commonMistakes: [
        "Building complex UI widgets (like Selects or Datepickers) from scratch (they are almost always inaccessible).",
        "Using a library that is too heavy for a simple project.",
        "Fighting against a library's default styles instead of choosing a more flexible library.",
        "Not checking for mobile responsiveness in pre-built components."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What does 'Headless UI' mean and why is it useful?",
          a: "Headless UI means a component library that provides functionality and accessibility (like ARIA roles, keyboard navigation) but no visual styling. This is useful because it allows developers to have complete control over the UI's appearance using their own CSS, while ensuring the component is robust and accessible."
        }
      ]
    }
  ]
};

export default reactPhase12;
