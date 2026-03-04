const nodePhase2 = {
  id: "phase-2",
  title: "Phase 2: Modules, npm & Project Setup",
  emoji: "📦",
  description:
    "Master Node.js module systems (CommonJS vs ESM), npm package management, package.json configuration, and professional project structure.",
  topics: [
    {
      id: "commonjs-modules",
      title: "CommonJS Modules (require/module.exports)",
      explanation: `**CommonJS (CJS)** is Node.js's original module system and still the default in most Node.js projects. Every file in Node.js is treated as a separate module with its own scope.

**How CommonJS works:**
1. Each file is wrapped in a **module wrapper function**:
\`\`\`javascript
(function(exports, require, module, __filename, __dirname) {
  // Your code here
});
\`\`\`
This is why \`__filename\`, \`__dirname\`, \`require\`, \`module\`, and \`exports\` are available in every file — they're function parameters, not true globals.

2. **\`require()\` resolution algorithm:**
\`\`\`
require('X')
  1. If X is a core module (fs, http, path) → return core module
  2. If X starts with './' or '/' → load as file or directory
     a. Try X, X.js, X.json, X.node
     b. Try X/index.js, X/index.json, X/index.node
  3. Load from node_modules/ → walk up directory tree
     a. ./node_modules/X
     b. ../node_modules/X
     c. ../../node_modules/X (continues to root)
\`\`\`

3. **Module caching:** \`require()\` caches modules after the first load. Subsequent calls return the **same object reference** — this is both a feature (singletons) and a gotcha (shared state).

**\`module.exports\` vs \`exports\`:**
- \`module.exports\` is the **actual object** that gets returned by \`require()\`
- \`exports\` is a **shorthand reference** to \`module.exports\`
- If you reassign \`exports = something\`, it breaks the reference — always use \`module.exports\` for non-object exports

**When to use CommonJS:**
- Node.js scripts and CLIs
- Existing projects that already use CJS
- When you need \`require()\` dynamically (conditional imports)
- When using older packages that only support CJS

🏠 **Real-world analogy:** CommonJS modules are like **shipping containers** — each one is sealed (scoped), has a manifest (exports), and gets loaded synchronously on the dock (require). Once unloaded, the container is cached in the warehouse.`,
      codeExample: `// CommonJS Module System — Complete Guide

// === math.js — Exporting a module ===
// Method 1: Named exports using exports shorthand
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
exports.PI = 3.14159;

// Method 2: module.exports for a single export
// module.exports = class Calculator { ... };

// Method 3: module.exports with an object
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  },
  PI: 3.14159,
};

// === app.js — Importing modules ===
// 1. Import entire module
const math = require("./math");
console.log(math.add(2, 3)); // 5

// 2. Destructured import
const { add, subtract, PI } = require("./math");
console.log(add(10, 5)); // 15
console.log(PI);          // 3.14159

// 3. Core modules (no path needed)
const fs = require("fs");
const path = require("path");
const os = require("os");

// 4. npm packages (resolved from node_modules/)
// const express = require("express");
// const lodash = require("lodash");

// 5. Dynamic require (CJS-only feature)
function loadPlugin(name) {
  try {
    const plugin = require(\`./plugins/\${name}\`);
    return plugin;
  } catch (err) {
    console.error(\`Plugin \${name} not found\`);
    return null;
  }
}

// 6. Module caching demonstration
// ❌ Common confusion: modules are cached!
// === counter.js ===
// let count = 0;
// module.exports = {
//   increment: () => ++count,
//   getCount: () => count,
// };

// === app.js ===
// const counter1 = require("./counter");
// const counter2 = require("./counter");
// counter1.increment();
// counter1.increment();
// console.log(counter2.getCount()); // 2 ← Same instance!
// console.log(counter1 === counter2); // true ← Same reference!

// 7. Check the module cache
console.log("\\n--- Module Cache ---");
console.log(Object.keys(require.cache).slice(0, 5));

// Clear a module from cache (forces reload)
// delete require.cache[require.resolve("./math")];

// 8. Circular dependencies (CJS handles them gracefully)
// === a.js ===
// console.log("a: loading b...");
// const b = require("./b");
// module.exports = { fromA: "hello from A" };

// === b.js ===
// console.log("b: loading a...");
// const a = require("./a"); // Gets PARTIAL export (whatever was set so far)
// module.exports = { fromB: "hello from B" };

// 9. module.exports vs exports gotcha
// ❌ BAD — This doesn't work!
// exports = function() { return "broken"; };
// Because you're reassigning the reference, not the object

// ✅ GOOD — This works
// module.exports = function() { return "works"; };

// ✅ ALSO GOOD — Adding to existing exports
// exports.myFunc = function() { return "also works"; };`,
      exercise: `**Exercises:**
1. Create a \`utils\` module with 5+ utility functions and import them with destructuring in another file
2. Demonstrate module caching by creating a counter module — show that two \`require()\` calls return the same instance
3. Create a circular dependency between two modules and observe the partial export behavior
4. Build a simple plugin loader that dynamically \`require()\`s modules from a \`plugins/\` directory
5. Write a module that exports a class using \`module.exports\` and use it to create instances in another file
6. Explore \`require.cache\` — write a function that clears and reloads a specific module`,
      commonMistakes: [
        "Assigning `exports = something` instead of `module.exports = something` — `exports` is just a reference; reassigning it breaks the link to the actual export object",
        "Not understanding module caching — `require()` returns the SAME object on subsequent calls, so mutations in one file affect all importers",
        "Using relative paths without `./` prefix — `require('math')` looks in node_modules, not the local directory; use `require('./math')` for local files",
        "Creating circular dependencies without understanding partial exports — module A importing B which imports A gets an incomplete A object",
        "Putting side effects at the top level of modules (API calls, database connections) — they execute on first `require()`, which may happen at unexpected times",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Node.js `require()` resolve module paths?",
          a: "The resolution algorithm: (1) **Core modules** — if the name matches a built-in (`fs`, `http`), return it immediately. (2) **Relative/absolute paths** (starts with `./`, `../`, or `/`) — try the exact path, then append `.js`, `.json`, `.node`; if it's a directory, look for `index.js`. (3) **node_modules lookup** — search `node_modules/` in the current directory, then parent, then grandparent, up to the root. Each `node_modules` folder is checked for the package name, reading its `package.json` `main` field or defaulting to `index.js`. (4) **Caching** — results are cached in `require.cache` so the same module is loaded only once.",
        },
        {
          type: "tricky",
          q: "What is the difference between `module.exports` and `exports` in Node.js?",
          a: "`exports` is initially a **reference** to `module.exports` — they point to the same object. You can add properties to `exports` (e.g., `exports.foo = 'bar'`) and they appear on `module.exports`. **However**, if you reassign `exports` entirely (e.g., `exports = myFunction`), you break the reference — `module.exports` is unchanged and that's what `require()` actually returns. Rule of thumb: always use `module.exports` when exporting a single value (function, class, or overriding the entire export). Use `exports.x` only when adding named properties to the default object.",
        },
        {
          type: "coding",
          q: "How would you handle circular dependencies in CommonJS?",
          a: "CommonJS handles circular deps by returning a **partial export** — whatever was assigned to `module.exports` before the circular `require()` call. Example: If A requires B, and B requires A, B gets whatever A exported up to the point where it called `require('./b')`. **Best practices:** (1) Restructure to avoid circles — extract shared logic to a third module. (2) Use lazy loading — `require()` inside a function instead of at the top level. (3) Use dependency injection — pass dependencies as function parameters rather than importing them.",
        },
      ],
    },
    {
      id: "esm-modules",
      title: "ES Modules (import/export)",
      explanation: `**ES Modules (ESM)** is the official JavaScript module standard, supported natively in Node.js since v12. It's the future of JavaScript modules, offering static analysis, tree-shaking, and top-level await.

**Enabling ESM in Node.js:**
1. Use \`.mjs\` file extension, OR
2. Set \`"type": "module"\` in \`package.json\` (then all \`.js\` files are ESM)

**Key differences from CommonJS:**

| Feature | CommonJS | ES Modules |
|---------|----------|------------|
| Syntax | \`require()\` / \`module.exports\` | \`import\` / \`export\` |
| Loading | **Synchronous** | **Asynchronous** |
| Parsing | **Dynamic** (runtime) | **Static** (parse time) |
| Top-level await | ❌ Not supported | ✅ Supported |
| Tree-shaking | ❌ Not possible | ✅ Bundlers can eliminate dead code |
| \`__filename\` / \`__dirname\` | ✅ Available | ❌ Use \`import.meta.url\` |
| Conditional imports | ✅ \`require()\` anywhere | ❌ \`import\` must be at top level |
| Dynamic imports | \`require()\` | \`import()\` (returns Promise) |
| Default + Named | Awkward pattern | First-class support |
| File extensions | Optional | **Required** for relative imports |

**Static analysis advantage:**
Because ESM \`import\` statements are analyzed at **parse time** (before execution), bundlers like webpack, Rollup, and esbuild can:
- Determine the entire dependency graph without running code
- **Tree-shake** unused exports (dead code elimination)
- Detect import errors at build time, not runtime

**Interop between CJS and ESM:**
- ESM can \`import\` CJS modules (default import only)
- CJS can use \`await import()\` to load ESM modules (dynamic import)
- CJS cannot use static \`import\` syntax

🏠 **Real-world analogy:** If CommonJS is like ordering from a catalog over the phone (you ask for items one by one, synchronously), ESM is like online shopping with a cart (you add everything you need, and the system optimizes the delivery).`,
      codeExample: `// ES Modules — Complete Guide

// === math.mjs (or .js with "type": "module" in package.json) ===

// Named exports
export const PI = 3.14159;
export const E = 2.71828;

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// Default export (one per module)
export default class Calculator {
  constructor() {
    this.history = [];
  }

  calculate(op, a, b) {
    let result;
    switch (op) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
      case "/": result = b !== 0 ? a / b : NaN; break;
      default: throw new Error(\`Unknown operator: \${op}\`);
    }
    this.history.push({ op, a, b, result });
    return result;
  }

  getHistory() {
    return [...this.history];
  }
}

// === app.mjs — Importing ===

// 1. Import named exports
import { add, subtract, PI } from "./math.mjs";
console.log(add(2, 3));  // 5
console.log(PI);          // 3.14159

// 2. Import default export
import Calculator from "./math.mjs";
const calc = new Calculator();
console.log(calc.calculate("+", 10, 5)); // 15

// 3. Import everything as a namespace
import * as MathUtils from "./math.mjs";
console.log(MathUtils.add(1, 2)); // 3
console.log(MathUtils.PI);        // 3.14159

// 4. Rename imports (aliasing)
import { add as sum, subtract as diff } from "./math.mjs";
console.log(sum(1, 2));  // 3
console.log(diff(5, 3)); // 2

// 5. Re-exporting (barrel exports)
// === index.mjs ===
// export { add, subtract } from "./math.mjs";
// export { default as Calculator } from "./math.mjs";
// export * from "./utils.mjs";

// 6. Dynamic imports (async, works anywhere)
async function loadModule(moduleName) {
  try {
    const module = await import(\`./modules/\${moduleName}.mjs\`);
    return module.default || module;
  } catch (err) {
    console.error(\`Failed to load module: \${moduleName}\`);
    return null;
  }
}

// 7. Top-level await (ESM only!)
// const data = await fs.promises.readFile("config.json", "utf-8");
// const config = JSON.parse(data);
// This blocks the module from finishing loading until the await resolves

// 8. import.meta — Module metadata
console.log("Module URL:", import.meta.url);
// file:///Users/you/project/app.mjs

// Get __dirname equivalent in ESM
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log("Directory:", __dirname);

// 9. Importing CommonJS from ESM
// ✅ This works — CJS default export becomes the ESM default
// import express from "express";  // express is CJS

// ❌ Named imports from CJS may not work
// import { Router } from "express";  // May fail!
// Instead:
// import express from "express";
// const { Router } = express;

// 10. Conditional exports in package.json
// {
//   "exports": {
//     ".": {
//       "import": "./dist/index.mjs",   // ESM entry
//       "require": "./dist/index.cjs"   // CJS entry
//     }
//   }
// }`,
      exercise: `**Exercises:**
1. Convert a CommonJS project to ES Modules — change \`require\` to \`import\`, \`module.exports\` to \`export\`
2. Create a barrel export pattern with an \`index.mjs\` that re-exports from 3+ sub-modules
3. Use dynamic \`import()\` to build a plugin system that loads modules based on configuration
4. Write a module using top-level \`await\` to load configuration from a JSON file
5. Create a dual-format package that works with both CJS (\`require\`) and ESM (\`import\`)
6. Use \`import.meta.url\` to read a file relative to the current module's location`,
      commonMistakes: [
        "Forgetting file extensions in ESM imports — `import { add } from './math'` fails; you MUST use `import { add } from './math.mjs'` or `'./math.js'`",
        "Trying to use `require()` in an ESM file — ESM has `import` syntax and dynamic `import()`; `require` is not available",
        "Expecting named imports from CommonJS modules — CJS exports become a single default export in ESM; destructure after the default import",
        "Not setting `\"type\": \"module\"` in package.json and wondering why `import` syntax throws SyntaxError in `.js` files",
        "Using top-level await without understanding it blocks the entire module graph — dependent modules wait for the await to resolve before they can execute",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the key differences between CommonJS and ES Modules in Node.js?",
          a: "**Loading:** CJS is synchronous (`require()` blocks), ESM is asynchronous. **Parsing:** CJS is dynamic (imports resolved at runtime), ESM is static (imports resolved at parse time, enabling tree-shaking). **Syntax:** CJS uses `require()`/`module.exports`, ESM uses `import`/`export`. **Scoping:** CJS wraps files in a function (giving `__dirname`, `__filename`), ESM uses `import.meta`. **Top-level await:** Only ESM supports it. **Interop:** ESM can import CJS (default export), CJS can only use dynamic `import()` for ESM. **File extensions:** Required in ESM relative imports, optional in CJS.",
        },
        {
          type: "tricky",
          q: "Can you use `require()` inside an ES Module? What about `import` inside CommonJS?",
          a: "**`require()` in ESM:** No, `require` is not available in ESM. You can create it using `createRequire`:\n```js\nimport { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\nconst cjsModule = require('./legacy.cjs');\n```\n**`import` in CJS:** Static `import` syntax is not allowed. However, you can use **dynamic `import()`** which returns a Promise:\n```js\nasync function loadESM() {\n  const module = await import('./esm-module.mjs');\n  return module.default;\n}\n```\nThis is the recommended way to use ESM from CJS.",
        },
      ],
    },
    {
      id: "npm-package-management",
      title: "npm & Package Management",
      explanation: `**npm** (Node Package Manager) is the world's largest software registry with over **2 million packages**. It's both a CLI tool and a registry — essential for managing dependencies, scripts, and project configuration.

**npm vs yarn vs pnpm:**

| Feature | npm | yarn | pnpm |
|---------|-----|------|------|
| Speed | Good (v7+) | Fast | **Fastest** |
| Disk usage | Duplicated | Duplicated | **Shared (content-addressable)** |
| Lock file | \`package-lock.json\` | \`yarn.lock\` | \`pnpm-lock.yaml\` |
| Workspaces | ✅ v7+ | ✅ v1+ | ✅ |
| Zero-install | ❌ | ✅ (PnP) | ❌ |
| Strictness | Loose | Loose | **Strict** (no phantom deps) |

**Essential npm commands:**
\`\`\`bash
npm init -y                    # Create package.json
npm install express            # Install to dependencies
npm install -D jest            # Install to devDependencies
npm install -g nodemon         # Install globally
npm uninstall express          # Remove a package
npm update                     # Update packages to latest allowed
npm outdated                   # Check for outdated packages
npm audit                      # Security vulnerability scan
npm audit fix                  # Auto-fix vulnerabilities
npm ls                         # List installed packages
npm ls --depth=0               # Top-level packages only
npm pack                       # Create a .tgz for distribution
npm publish                    # Publish to npm registry
npm run <script>               # Run a script from package.json
npx <command>                  # Run a package without installing
\`\`\`

**Semantic Versioning (semver):**
\`\`\`
MAJOR.MINOR.PATCH  →  2.4.1
  2 = Breaking changes
  4 = New features (backward compatible)
  1 = Bug fixes (backward compatible)

Version ranges in package.json:
  "^2.4.1"  → >=2.4.1 <3.0.0  (minor + patch updates)
  "~2.4.1"  → >=2.4.1 <2.5.0  (patch updates only)
  "2.4.1"   → Exactly 2.4.1   (locked)
  "*"       → Any version      (dangerous!)
  ">=2.0.0" → 2.0.0 or higher
\`\`\`

**\`package-lock.json\`:**
This file locks the **exact versions** of every dependency (including transitive deps). It ensures that \`npm install\` produces identical \`node_modules/\` on every machine. **Always commit it to version control.**

🏠 **Real-world analogy:** npm is like an **app store** for code. \`package.json\` is your shopping list, \`package-lock.json\` is the receipt with exact product versions, and \`node_modules/\` is your pantry where everything is stored.`,
      codeExample: `// npm & Package Management — Practical Usage

// === package.json — The project manifest ===
const packageJsonExample = {
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "A production-ready Node.js application",
  "main": "src/index.js",          // CJS entry point
  "module": "src/index.mjs",       // ESM entry point
  "type": "module",                // Treat .js as ESM

  // Conditional exports (modern approach)
  "exports": {
    ".": {
      "import": "./src/index.mjs",
      "require": "./src/index.cjs"
    },
    "./utils": "./src/utils/index.js"
  },

  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write 'src/**/*.js'",
    "build": "tsc",
    "precommit": "npm run lint && npm test",
    "prepare": "husky install"
  },

  // Runtime dependencies
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.6.0",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "winston": "^3.11.0"
  },

  // Development-only dependencies
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.1",
    "eslint": "^8.53.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.3"
  },

  // npm config
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },

  // Package metadata
  "keywords": ["node", "api", "express"],
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/you/my-node-app"
  }
};

// === .npmrc — npm configuration ===
// save-exact=true          # Lock exact versions (no ^ or ~)
// engine-strict=true       # Enforce engine requirements
// auto-install-peers=true  # Auto-install peer dependencies

// === npm scripts — Advanced patterns ===

// Pre/post hooks — run automatically
// "pretest": "npm run lint",    ← runs before "test"
// "test": "jest",
// "posttest": "npm run report", ← runs after "test"

// Script composition
// "validate": "npm run lint && npm test && npm run build"
// "dev": "concurrently 'npm run server' 'npm run client'"

// Environment variables in scripts
// "start:prod": "NODE_ENV=production node src/index.js"
// Cross-platform (use cross-env):
// "start:prod": "cross-env NODE_ENV=production node src/index.js"

// === npx — Run without installing ===
// npx create-react-app my-app       # One-time project scaffolding
// npx eslint --init                  # One-time setup
// npx http-server ./public           # Quick static server
// npx tsx script.ts                  # Run TypeScript directly

console.log("Package.json example created");
console.log("Key sections: name, version, scripts, dependencies, devDependencies, engines");`,
      exercise: `**Exercises:**
1. Initialize a new Node.js project with \`npm init\` and configure all fields properly
2. Add scripts for dev, test, lint, build, and start — use \`nodemon\` for dev mode
3. Install 5 packages: 3 as dependencies and 2 as devDependencies — explain why each belongs in its category
4. Use \`npm audit\` on a project — interpret the output and fix any vulnerabilities
5. Create an \`.npmrc\` file with \`save-exact=true\` and \`engine-strict=true\` — explain the benefits
6. Compare install times between \`npm\`, \`yarn\`, and \`pnpm\` for the same project`,
      commonMistakes: [
        "Not committing `package-lock.json` to version control — this causes 'works on my machine' issues because dependency versions may differ",
        "Installing dev tools as dependencies instead of devDependencies — `jest`, `eslint`, `nodemon` should be `-D` to keep production installs lean",
        "Using `npm install` instead of `npm ci` in CI pipelines — `npm ci` uses the lockfile exactly, is faster, and fails if lockfile is outdated",
        "Ignoring `npm audit` warnings — known vulnerabilities in dependencies are a real security risk in production",
        "Using `*` or overly broad version ranges — this can pull in breaking changes on `npm install`; use `^` for libraries and exact versions for apps",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is semantic versioning and how does it affect `npm install`?",
          a: "Semver uses **MAJOR.MINOR.PATCH**: MAJOR = breaking changes, MINOR = new features (backward compatible), PATCH = bug fixes. In `package.json`: `^2.4.1` allows minor+patch updates (<3.0.0), `~2.4.1` allows only patch updates (<2.5.0), `2.4.1` locks an exact version. `npm install` resolves the newest version satisfying the range and writes the exact version to `package-lock.json`. **Best practice for apps:** use `save-exact=true` in `.npmrc` to lock exact versions. **For libraries:** use `^` ranges to allow flexibility for consumers.",
        },
        {
          type: "tricky",
          q: "What is the difference between `npm install` and `npm ci`?",
          a: "**`npm install`**: reads `package.json`, resolves the newest versions matching semver ranges, updates `package-lock.json` if needed, and may change `node_modules`. **`npm ci`**: reads `package-lock.json` **exclusively**, installs exact versions listed, **deletes** `node_modules` first, and **fails** if `package-lock.json` is out of sync with `package.json`. Use `npm ci` in CI/CD pipelines for deterministic, reproducible builds. Use `npm install` in development when you want to add/update packages.",
        },
      ],
    },
    {
      id: "project-structure",
      title: "Professional Project Structure",
      explanation: `A well-organized project structure is the foundation of **maintainable, scalable** Node.js applications. There's no single "correct" structure, but established patterns make it easy for teams to navigate and contribute.

**Recommended project structure for an API server:**
\`\`\`
my-node-app/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.js      # Central config (reads env vars)
│   │   ├── database.js   # Database connection config
│   │   └── logger.js     # Logger setup
│   ├── controllers/      # Request handlers (thin layer)
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/        # Express middleware
│   │   ├── auth.js       # Authentication middleware
│   │   ├── errorHandler.js
│   │   └── validate.js   # Request validation
│   ├── models/           # Data models / schemas
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/           # Route definitions
│   │   ├── index.js      # Route aggregator
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── services/         # Business logic
│   │   ├── authService.js
│   │   └── userService.js
│   ├── utils/            # Shared utilities
│   │   ├── errors.js     # Custom error classes
│   │   └── helpers.js
│   ├── app.js            # Express app setup (no listen)
│   └── server.js         # Entry point (calls app.listen)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── scripts/              # Build, migration, seed scripts
├── docs/                 # API documentation
├── .env.example          # Environment variable template
├── .gitignore
├── .eslintrc.json
├── package.json
└── README.md
\`\`\`

**Key architectural principles:**

1. **Separation of Concerns:** Each directory has a single responsibility
   - \`controllers\` — parse requests, call services, send responses
   - \`services\` — business logic (no HTTP knowledge)
   - \`models\` — data shape and validation
   - \`routes\` — URL-to-controller mapping

2. **Dependency direction:** Routes → Controllers → Services → Models
   - Never import controllers from models
   - Services should be testable without Express

3. **Config from environment:** All configuration comes from environment variables via a central \`config/\` module — never hardcode values

4. **Separate \`app.js\` from \`server.js\`:**
   - \`app.js\` creates and configures the Express app
   - \`server.js\` calls \`app.listen()\`
   - This allows tests to import \`app.js\` without starting a server

🏠 **Real-world analogy:** A project structure is like a **well-organized office building** — reception (routes) directs visitors, managers (controllers) coordinate, specialists (services) do the work, and filing cabinets (models) store the data. Everyone knows where to find things.`,
      codeExample: `// Professional Project Structure — Key Files

// === src/config/index.js — Centralized configuration ===
import dotenv from "dotenv";
dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  
  db: {
    uri: process.env.DATABASE_URL || "mongodb://localhost:27017/myapp",
    options: {
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE || "10", 10),
    },
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
  
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
};

// Validate required config in production
if (config.isProduction) {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(\`Missing required env vars: \${missing.join(", ")}\`);
  }
}

export default config;

// === src/app.js — Express app setup (no server.listen!) ===
import express from "express";
import helmet from "helmet";
import cors from "cors";
import config from "./config/index.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

// Error handling (must be last)
app.use(errorHandler);

export default app;

// === src/server.js — Entry point ===
import app from "./app.js";
import config from "./config/index.js";

const server = app.listen(config.port, () => {
  console.log(\`Server running on port \${config.port} [\${config.env}]\`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(\`\${signal} received. Shutting down gracefully...\`);
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// === src/routes/index.js — Route aggregator ===
import { Router } from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;

// === src/middleware/errorHandler.js ===
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";

  // Log the full error internally
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}`,
      exercise: `**Exercises:**
1. Scaffold a complete Node.js project structure using the pattern above — create all directories and placeholder files
2. Implement the config module that validates required env vars and throws on missing ones in production
3. Create the app.js / server.js separation and write a test that imports app.js without starting a server
4. Build a route aggregator that loads route files dynamically from a \`routes/\` directory
5. Implement a graceful shutdown handler that closes database connections, HTTP server, and background jobs
6. Create an \`.env.example\` file documenting all required and optional environment variables`,
      commonMistakes: [
        "Putting everything in a single file — even a small project benefits from separating routes, controllers, and services",
        "Mixing Express-specific code into service files — services should contain pure business logic with no `req`, `res`, or `next` references",
        "Not separating `app.js` from `server.js` — this makes integration testing impossible because importing the app starts the server",
        "Hardcoding configuration values — ports, database URLs, and secrets must come from environment variables for proper deployment",
        "Not implementing graceful shutdown — abrupt process termination drops active connections and can corrupt in-flight database operations",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How would you structure a large Node.js application and why?",
          a: "**Layered architecture:** (1) **Routes** — URL-to-handler mapping, no logic. (2) **Controllers** — parse requests, call services, format responses. (3) **Services** — business logic, database operations (no HTTP knowledge). (4) **Models** — data schemas and validation. (5) **Middleware** — cross-cutting concerns (auth, logging, error handling). **Why:** Each layer has a single responsibility, making code testable (services can be unit-tested without HTTP), maintainable (changes in one layer don't cascade), and scalable (teams can own different layers). Separate `app.js` (Express setup) from `server.js` (listen call) to enable testing.",
        },
        {
          type: "scenario",
          q: "How do you handle environment-specific configuration in Node.js?",
          a: "**Best practice:** (1) Use **`.env` files** for local development (via `dotenv` package). (2) Create a **central config module** that reads `process.env`, applies defaults, and validates required values. (3) Use **`.env.example`** committed to git as documentation. (4) In production, set env vars via the deployment platform (Docker, AWS, Heroku) — never commit `.env` to git. (5) **Validate at startup** — fail fast if required config is missing rather than crashing at the first database call. (6) Use `NODE_ENV` to toggle behaviors: verbose logging in development, strict security in production.",
        },
      ],
    },
  ],
};

export default nodePhase2;
