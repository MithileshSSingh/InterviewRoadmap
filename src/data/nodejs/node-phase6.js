const nodePhase6 = {
  id: "phase-6",
  title: "Phase 6: Express.js & Middleware",
  emoji: "🛤️",
  description:
    "Master Express.js — the most popular Node.js web framework. Learn routing, middleware patterns, error handling, and building production-ready APIs.",
  topics: [
    {
      id: "express-fundamentals",
      title: "Express.js Fundamentals & Routing",
      explanation: `**Express.js** is a minimal, unopinionated web framework for Node.js. It sits on top of the built-in \`http\` module and provides a clean API for routing, middleware, and request/response enhancement.

**Why Express?**
- **30K+ GitHub stars**, most downloaded Node.js framework (~30M weekly npm downloads)
- Minimal core — extend with middleware for exactly what you need
- Huge ecosystem of middleware packages
- Used by Uber, IBM, PayPal, Twitter

**Core concepts:**
1. **Application** — \`const app = express()\` — your Express application
2. **Routes** — Map URL patterns + HTTP methods to handler functions
3. **Middleware** — Functions that process requests before they reach route handlers
4. **Request (req)** — Enhanced IncomingMessage with parsed body, params, query
5. **Response (res)** — Enhanced ServerResponse with \`.json()\`, \`.send()\`, \`.status()\`

**Routing patterns:**
\`\`\`javascript
app.get('/users', handler)         // GET /users
app.post('/users', handler)        // POST /users
app.put('/users/:id', handler)     // PUT /users/123
app.delete('/users/:id', handler)  // DELETE /users/123
app.all('/api/*', handler)         // Any method, any path under /api/
app.use('/admin', adminRouter)     // Mount sub-router
\`\`\`

**Route parameters:**
\`\`\`javascript
// :id captures the value as req.params.id
app.get('/users/:id/posts/:postId', (req, res) => {
  const { id, postId } = req.params;  // { id: '42', postId: '7' }
});
\`\`\`

**Express added features over raw \`http\`:**
| Feature | Raw http | Express |
|---------|----------|---------|
| Routing | Manual if/else | \`app.get()\`, \`app.post()\`, Router |
| Body parsing | Manual stream collection | \`express.json()\` middleware |
| Query params | Manual URL parsing | \`req.query\` (auto-parsed) |
| Static files | Manual MIME + streaming | \`express.static()\` |
| JSON response | Manual \`JSON.stringify\` + headers | \`res.json()\` |

🏠 **Real-world analogy:** If the raw \`http\` module is **building a house from scratch** (foundation, framing, plumbing), Express is like a **pre-fabricated house kit** — the structure is ready, you just customize the rooms (routes) and add furniture (middleware).`,
      codeExample: `// Express.js — Complete API Server

const express = require("express");
const app = express();

// Built-in middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// In-memory data store (use a database in production!)
let users = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "user" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "user" },
];
let nextId = 4;

// === ROUTES ===

// GET /api/users — List all users (with query filters)
app.get("/api/users", (req, res) => {
  let result = [...users];

  // Filter by role
  if (req.query.role) {
    result = result.filter((u) => u.role === req.query.role);
  }

  // Search by name
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter((u) => u.name.toLowerCase().includes(search));
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  res.json({
    data: paginated,
    meta: {
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
    },
  });
});

// GET /api/users/:id — Get a specific user
app.get("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ data: user });
});

// POST /api/users — Create a new user
app.post("/api/users", (req, res) => {
  const { name, email, role } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).json({
      error: "Validation failed",
      details: {
        ...(!name && { name: "Name is required" }),
        ...(!email && { email: "Email is required" }),
      },
    });
  }

  // Check duplicate email
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const newUser = { id: nextId++, name, email, role: role || "user" };
  users.push(newUser);

  res.status(201).json({ data: newUser });
});

// PUT /api/users/:id — Update a user
app.put("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[index] = { ...users[index], ...req.body, id }; // Don't allow ID change
  res.json({ data: users[index] });
});

// DELETE /api/users/:id — Delete a user
app.delete("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);
  res.status(204).end();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

// 404 handler (must come after all routes)
app.use((req, res) => {
  res.status(404).json({ error: \`Route \${req.method} \${req.path} not found\` });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Express server running on http://localhost:\${PORT}\`);
});`,
      exercise: `**Exercises:**
1. Build a complete CRUD REST API for a "todos" resource with Express
2. Add query parameter support: filtering, searching, sorting, and pagination
3. Implement route parameter validation (check that \`:id\` is a valid integer)
4. Create a Router module that separates user routes into their own file
5. Add a catch-all 404 handler and test it with invalid routes
6. Build a simple HTML form that submits data to your Express API using \`express.urlencoded()\``,
      commonMistakes: [
        "Not calling `next()` in middleware — the request hangs forever because Express doesn't know to proceed to the next handler",
        "Defining error-handling middleware before routes — Express middleware runs in order; put error handlers AFTER all routes",
        "Sending multiple responses — calling `res.json()` or `res.send()` more than once throws an error; use `return` after sending",
        "Using `app.listen()` in the same file as `app` creation — this makes testing impossible; export `app` separately from the listen call",
        "Not using `express.json()` middleware — without it, `req.body` is `undefined` for JSON POST/PUT requests",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is Express.js and what problems does it solve over the raw http module?",
          a: "Express.js is a minimal web framework built on Node.js's `http` module. It solves: (1) **Routing** — maps URL patterns and HTTP methods to handlers, instead of manual if/else chains. (2) **Middleware** — pluggable request processing pipeline for auth, logging, body parsing, CORS. (3) **Request enhancement** — `req.body` (from middleware), `req.params`, `req.query` are auto-parsed. (4) **Response helpers** — `res.json()`, `res.status()`, `res.redirect()` vs manual header/body handling. (5) **Static files** — `express.static()` vs custom file serving code. (6) **Ecosystem** — thousands of middleware packages for common needs.",
        },
        {
          type: "tricky",
          q: "What is the order of route matching in Express?",
          a: "Express matches routes **in the order they are defined** — first match wins. This is critical: (1) More specific routes must come before generic ones: `/users/me` before `/users/:id` (otherwise `:id` captures 'me'). (2) Middleware defined with `app.use()` runs for all requests that match the path prefix. (3) `app.all()` matches any HTTP method. (4) 404 handlers must be the LAST route. (5) Error-handling middleware (4 params) must come after all routes. The order of `app.use()`, `app.get()`, etc. calls is the routing table — there's no auto-sorting.",
        },
      ],
    },
    {
      id: "middleware-patterns",
      title: "Middleware — Patterns & Best Practices",
      explanation: `**Middleware** is the core architectural pattern of Express.js. A middleware function has access to the request (\`req\`), response (\`res\`), and the \`next\` function — which passes control to the next middleware in the stack.

**Middleware signature:**
\`\`\`javascript
function middleware(req, res, next) {
  // Do something with req/res
  next(); // Pass to next middleware
}
\`\`\`

**Types of middleware:**
1. **Application-level** — \`app.use(fn)\` — runs for every request
2. **Route-level** — \`app.get('/path', fn, handler)\` — runs for specific routes
3. **Router-level** — \`router.use(fn)\` — runs for routes in that router
4. **Built-in** — \`express.json()\`, \`express.static()\`, \`express.urlencoded()\`
5. **Third-party** — \`cors()\`, \`helmet()\`, \`morgan()\`, \`compression()\`
6. **Error-handling** — \`(err, req, res, next)\` — 4-parameter signature

**Middleware execution order:**
\`\`\`
Request → middleware1 → middleware2 → route handler → Response
                                        ↓ (if error)
                                    error middleware
\`\`\`

**Common middleware stack (production):**
\`\`\`javascript
app.use(helmet())                    // Security headers
app.use(cors())                      // CORS
app.use(compression())               // Gzip compression
app.use(morgan('combined'))          // Request logging
app.use(express.json())              // JSON body parsing
app.use(express.urlencoded(...))     // Form body parsing
app.use(rateLimit(...))              // Rate limiting
app.use('/api', authMiddleware)      // Authentication
app.use('/api', routes)              // Application routes
app.use(notFoundHandler)             // 404 handler
app.use(errorHandler)                // Error handler
\`\`\`

🏠 **Real-world analogy:** Middleware is like an **airport security process**. Each checkpoint (middleware) inspects your luggage (request), adds a stamp (modifies req), and either lets you pass (\`next()\`) or stops you (\`res.status(403)\`). The order matters — you go through identity check (auth), then baggage scan (validation), then boarding (route handler).`,
      codeExample: `// Middleware — Patterns & Best Practices

const express = require("express");
const app = express();

// 1. Request logging middleware
function requestLogger(req, res, next) {
  const start = Date.now();

  // Capture the original res.end to measure response time
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    console.log(
      \`[\${new Date().toISOString()}] \${req.method} \${req.originalUrl} → \${res.statusCode} (\${duration}ms)\`
    );
    originalEnd.apply(this, args);
  };

  next();
}

// 2. Authentication middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // In production: verify JWT token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decoded = { id: 1, role: "admin" }; // Mock
    req.user = decoded; // Attach user to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// 3. Authorization middleware (factory function)
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: \`Requires one of roles: \${roles.join(", ")}\`,
      });
    }
    next();
  };
}

// 4. Request validation middleware (factory)
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === "")) {
        errors.push(\`\${field} is required\`);
      }
      if (rules.type && value !== undefined && typeof value !== rules.type) {
        errors.push(\`\${field} must be a \${rules.type}\`);
      }
      if (rules.minLength && value && value.length < rules.minLength) {
        errors.push(\`\${field} must be at least \${rules.minLength} characters\`);
      }
      if (rules.pattern && value && !rules.pattern.test(value)) {
        errors.push(\`\${field} format is invalid\`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    next();
  };
}

// 5. Rate limiting middleware
function rateLimit({ windowMs = 60000, maxRequests = 100 } = {}) {
  const clients = new Map();

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of clients) {
      if (now - data.startTime > windowMs) {
        clients.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!clients.has(clientIP)) {
      clients.set(clientIP, { count: 1, startTime: now });
      return next();
    }

    const client = clients.get(clientIP);

    if (now - client.startTime > windowMs) {
      clients.set(clientIP, { count: 1, startTime: now });
      return next();
    }

    client.count++;

    if (client.count > maxRequests) {
      res.setHeader("Retry-After", Math.ceil((windowMs - (now - client.startTime)) / 1000));
      return res.status(429).json({ error: "Too many requests" });
    }

    next();
  };
}

// 6. Error handling middleware (MUST have 4 parameters)
function errorHandler(err, req, res, next) {
  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.isOperational ? err.message : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

// === Apply middleware ===
app.use(requestLogger);
app.use(express.json());

// Public routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Protected routes
app.use("/api/admin", authenticate, authorize("admin"));

app.get("/api/admin/dashboard", (req, res) => {
  res.json({ message: "Admin dashboard", user: req.user });
});

// Route with validation
app.post(
  "/api/users",
  authenticate,
  validate({
    name: { required: true, type: "string", minLength: 2 },
    email: { required: true, type: "string", pattern: /^[^@]+@[^@]+\\.[^@]+$/ },
  }),
  (req, res) => {
    res.status(201).json({ data: req.body });
  }
);

// Error handler (must be LAST)
app.use(errorHandler);

app.listen(3000);`,
      exercise: `**Exercises:**
1. Write a request logging middleware that logs method, URL, status code, and response time
2. Build an authentication middleware that verifies JWT tokens and attaches the user to \`req.user\`
3. Create a role-based authorization middleware factory: \`authorize('admin', 'moderator')\`
4. Implement a rate limiter using a Map-based sliding window counter
5. Build a request validation middleware factory that validates \`req.body\` against a schema
6. Chain multiple middleware on a single route: authenticate → authorize → validate → handler`,
      commonMistakes: [
        "Forgetting to call `next()` — the request hangs indefinitely because Express doesn't automatically pass to the next handler",
        "Putting error-handling middleware before routes — Express processes middleware in order; error handlers must come last",
        "Using 3-parameter functions for error handling — error handlers MUST have exactly 4 parameters: `(err, req, res, next)`",
        "Not returning after sending a response in middleware — without `return`, the code continues and may call `next()` or send another response",
        "Adding middleware after `app.listen()` — middleware must be registered before the server starts accepting requests",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the Express.js middleware pattern and execution order.",
          a: "Middleware functions execute in the **order they're registered** with `app.use()`. Each function receives `req`, `res`, and `next`. The function can: (1) modify `req` or `res`, (2) end the request cycle with `res.send()`, or (3) call `next()` to pass to the next middleware/route. If `next(err)` is called with an argument, Express skips to the next **error-handling middleware** (4-parameter function). Order matters: security headers → CORS → body parsing → authentication → routes → 404 handler → error handler.",
        },
        {
          type: "coding",
          q: "How would you implement request validation middleware in Express?",
          a: "```js\nfunction validate(schema) {\n  return (req, res, next) => {\n    const errors = [];\n    for (const [field, rules] of Object.entries(schema)) {\n      const value = req.body[field];\n      if (rules.required && !value) errors.push(`${field} is required`);\n      if (rules.type && value && typeof value !== rules.type) {\n        errors.push(`${field} must be ${rules.type}`);\n      }\n    }\n    if (errors.length) {\n      return res.status(400).json({ errors });\n    }\n    next();\n  };\n}\n// Usage: app.post('/users', validate({ name: { required: true } }), handler)\n```\nThe factory pattern (function returning middleware) allows reusable, configurable validation for different routes.",
        },
      ],
    },
    {
      id: "express-routers",
      title: "Express Router & Project Organization",
      explanation: `**Express Router** is a mini-application that handles routing and middleware for a specific path prefix. It enables modular, scalable project organization by splitting routes into separate files.

**Why use Routers?**
- **Separation of concerns** — each resource gets its own route file
- **Middleware scoping** — apply middleware only to specific route groups
- **Team collaboration** — different developers work on different route modules
- **Testing** — test route modules independently

**Router pattern:**
\`\`\`javascript
// routes/users.js
const router = express.Router();
router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUser);
export default router;

// app.js
app.use('/api/users', userRouter);  // Prefix all routes with /api/users
\`\`\`

**Router-level middleware:**
\`\`\`javascript
// Apply auth to all routes in this router
router.use(authenticate);
// Or to specific routes
router.get('/', publicHandler);
router.post('/', authenticate, protectedHandler);
\`\`\`

**route() chaining:**
\`\`\`javascript
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);
\`\`\`

🏠 **Real-world analogy:** If Express is a **shopping mall**, each Router is a **store**. The mall routes customers (requests) to the right store (router) based on the entrance they use (path prefix). Each store manages its own layout (routes) and security (middleware) independently.`,
      codeExample: `// Express Router — Modular Project Organization

const express = require("express");

// === routes/userRoutes.js ===
function createUserRouter(userService) {
  const router = express.Router();

  // GET /api/users
  router.get("/", async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const users = await userService.findAll({ page, limit, search });
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/users/:id
  router.get("/:id", async (req, res, next) => {
    try {
      const user = await userService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/users
  router.post("/", async (req, res, next) => {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({ data: user });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/users/:id
  router.put("/:id", async (req, res, next) => {
    try {
      const user = await userService.update(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/users/:id
  router.delete("/:id", async (req, res, next) => {
    try {
      await userService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// === routes/authRoutes.js ===
function createAuthRouter(authService) {
  const router = express.Router();

  router.post("/register", async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register({ name, email, password });
      res.status(201).json({ data: user });
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// === routes/index.js — Route aggregator ===
function createRoutes(services) {
  const router = express.Router();

  router.use("/auth", createAuthRouter(services.auth));
  router.use("/users", createUserRouter(services.user));

  return router;
}

// === app.js — Application setup ===
function createApp(services) {
  const app = express();

  // Global middleware
  app.use(express.json());

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // API routes
  app.use("/api/v1", createRoutes(services));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: \`\${req.method} \${req.path} not found\` });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
      error: err.message || "Internal server error",
    });
  });

  return app;
}

// === server.js — Entry point ===
// Mock services
const services = {
  user: {
    findAll: async () => [{ id: 1, name: "Alice" }],
    findById: async (id) => ({ id, name: "Alice" }),
    create: async (data) => ({ id: Date.now(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async (id) => true,
  },
  auth: {
    register: async (data) => ({ id: 1, ...data }),
    login: async () => "mock-jwt-token",
  },
};

const app = createApp(services);
app.listen(3000, () => console.log("Server on http://localhost:3000"));`,
      exercise: `**Exercises:**
1. Split an Express app into separate router modules: \`authRoutes.js\`, \`userRoutes.js\`, \`postRoutes.js\`
2. Create a route aggregator (\`routes/index.js\`) that mounts all routers with proper prefixes
3. Implement API versioning using routers: \`/api/v1/\` and \`/api/v2/\` with different handlers
4. Use \`router.route()\` chaining for a resource with GET, PUT, DELETE on the same path
5. Add router-level middleware that only applies to admin routes (\`/api/admin/*\`)
6. Build a factory function pattern where routers receive dependencies (services, config) as parameters`,
      commonMistakes: [
        "Defining overlapping paths between parent and child routers — this causes confusing double-matching of routes",
        "Not passing errors to `next(err)` in async route handlers — use try/catch in every async handler and call `next(err)` in the catch block",
        "Creating circular dependencies between route files — use dependency injection (factory functions) instead of requiring between route files",
        "Hardcoding API prefixes in route files — let the parent `app.use('/api/v1', router)` handle the prefix; routes should use relative paths",
        "Not testing routers in isolation — factory functions that accept services enable unit testing without a running database",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you organize routes in a large Express application?",
          a: "**Layered structure:** (1) **Route files** — one per resource (`userRoutes.js`, `authRoutes.js`), each creating an `express.Router()`. (2) **Route aggregator** (`routes/index.js`) — imports all routers and mounts them with path prefixes. (3) **App setup** (`app.js`) — creates Express app, applies global middleware, mounts `routes/index.js` at `/api`. (4) **Server entry** (`server.js`) — imports app and calls `listen()`. **Benefits:** Each layer is independently testable. Routes can be versioned (`/api/v1`, `/api/v2`). Middleware can be scoped to specific routers.",
        },
        {
          type: "scenario",
          q: "How do you handle async errors in Express route handlers?",
          a: "Express doesn't catch Promise rejections automatically. **Solutions:** (1) **Try/catch in every handler:** `async (req, res, next) => { try { ... } catch(err) { next(err) } }`. (2) **Async wrapper utility:** `const asyncHandler = fn => (req, res, next) => fn(req, res, next).catch(next)`. Then: `app.get('/users', asyncHandler(async (req, res) => { ... }))`. (3) **Express 5 (beta)** handles async errors natively. The error is passed to the error-handling middleware (4-param function) which formats it as a JSON response.",
        },
      ],
    },
    {
      id: "express-error-handling",
      title: "Error Handling & Production Patterns",
      explanation: `Robust error handling is what separates amateur Express apps from production-ready ones. Express has a specific mechanism for centralizing error handling across all routes.

**Express error-handling flow:**
1. A route handler throws or calls \`next(err)\`
2. Express skips all remaining non-error middleware
3. Express calls the first error-handling middleware (\`(err, req, res, next)\`)

**Error-handling middleware signature:**
\`\`\`javascript
app.use((err, req, res, next) => {
  // Handle the error
  // Must have EXACTLY 4 parameters!
});
\`\`\`

**Production error handling strategy:**
1. **Custom error classes** — carry status codes, operational flags, context
2. **Async wrapper** — automatically catch async errors and pass to \`next()\`
3. **Centralized error handler** — single middleware that formats all errors
4. **Error logging** — structured logging with request context
5. **Graceful shutdown** — close connections cleanly on unhandled errors

**Operational vs. Programmer errors:**
| Type | Example | Action |
|------|---------|--------|
| Operational | Invalid input, not found, timeout | Return appropriate HTTP error |
| Programmer | TypeError, null reference | Log, alert, restart process |

🏠 **Real-world analogy:** Error handling is like a **hospital triage system**. Minor issues (400 errors) are treated and released. Serious issues (500 errors) are logged and escalated. Catastrophic events (unhandled exceptions) trigger emergency protocols (graceful shutdown + restart).`,
      codeExample: `// Production Error Handling in Express

const express = require("express");
const app = express();

// 1. Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(\`\${resource} not found\`, 404);
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super("Validation failed", 400);
    this.errors = errors;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

// 2. Async wrapper — eliminates try/catch boilerplate
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 3. Routes using custom errors and async wrapper
app.use(express.json());

app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new ValidationError([{ field: "id", message: "Must be a number" }]);

    // Simulate database lookup
    const user = id === 1 ? { id: 1, name: "Alice" } : null;
    if (!user) throw new NotFoundError("User");

    res.json({ data: user });
  })
);

app.post(
  "/api/users",
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const errors = [];
    if (!name) errors.push({ field: "name", message: "Required" });
    if (!email) errors.push({ field: "email", message: "Required" });
    if (errors.length) throw new ValidationError(errors);

    const user = { id: Date.now(), name, email };
    res.status(201).json({ data: user });
  })
);

// 4. 404 handler (not an error handler — no err parameter)
app.use((req, res, next) => {
  next(new NotFoundError(\`Route \${req.method} \${req.path}\`));
});

// 5. Centralized error handler (4 parameters!)
app.use((err, req, res, next) => {
  // Default values for non-AppError errors
  err.statusCode = err.statusCode || 500;
  err.message = err.isOperational ? err.message : "Internal server error";

  // Log error (structured for log aggregation)
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: err.statusCode >= 500 ? "error" : "warn",
    message: err.message,
    statusCode: err.statusCode,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    requestId: req.headers["x-request-id"],
    ...(err.statusCode >= 500 && { stack: err.stack }),
  };
  console.error(JSON.stringify(logEntry));

  // Send response
  const response = {
    success: false,
    error: err.message,
    ...(err instanceof ValidationError && { details: err.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(err.statusCode).json(response);
});

// 6. Global error handlers — safety nets
process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
  // Treat like uncaughtException — shut down
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
  // Graceful shutdown (close server, then exit)
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

// 7. Graceful shutdown
function shutdown(signal) {
  console.log(\`\${signal} received. Graceful shutdown...\`);
  server.close(() => {
    console.log("HTTP server closed");
    // Close database connections, etc.
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));`,
      exercise: `**Exercises:**
1. Create a hierarchy of custom error classes: AppError → NotFoundError, ValidationError, UnauthorizedError, ForbiddenError
2. Implement the \`asyncHandler\` wrapper and refactor all routes to use it
3. Build a centralized error handler that logs errors and sends appropriate JSON responses
4. Add request ID tracking — generate an ID per request and include it in all error logs
5. Implement graceful shutdown that waits for in-flight requests to complete before exiting
6. Test error handling by triggering 400, 401, 403, 404, and 500 errors intentionally`,
      commonMistakes: [
        "Not using error-handling middleware (4-parameter) — Express ignores your function for errors if it doesn't have exactly `(err, req, res, next)` parameters",
        "Forgetting to pass errors in async handlers — `async (req, res)` without try/catch causes unhandled Promise rejections that crash Node.js",
        "Exposing stack traces in production — stack traces reveal file paths and code structure; only include in development mode",
        "Not differentiating operational and programmer errors — a 404 should return a helpful message; a null reference should trigger alerts and process restart",
        "Handling errors in every route instead of centralizing — this leads to inconsistent error formats; use a single error-handling middleware",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Express.js error handling work?",
          a: "Express uses a special **error-handling middleware** with 4 parameters: `(err, req, res, next)`. When an error occurs: (1) Synchronous throws in middleware/routes are caught automatically. (2) Async errors must be passed via `next(err)`. (3) Express skips all normal middleware and jumps to the first error handler. (4) Multiple error handlers can be chained. **Best practice:** Create custom error classes with status codes, use an `asyncHandler` wrapper for all async routes, and place a single centralized error handler as the last middleware.",
        },
        {
          type: "tricky",
          q: "Why doesn't Express catch errors thrown in async route handlers?",
          a: "Express wraps synchronous middleware in try/catch, but **async functions return Promises**. When an async function throws, the Promise rejects — Express doesn't `.catch()` it automatically (fixed in Express 5). The rejection becomes an unhandled Promise rejection, crashing Node.js. **Solutions:** (1) Wrap every async handler in try/catch and call `next(err)`. (2) Use an `asyncHandler` wrapper: `const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)`. (3) Upgrade to Express 5 (beta) which natively handles async rejections.",
        },
      ],
    },
    {
      id: "express-templating",
      title: "Template Engines & Server-Side Rendering",
      explanation: `While modern apps often use React/Vue for the frontend, **server-side rendering (SSR)** with template engines is still valuable for:
- Content-heavy sites (blogs, docs) that need good SEO
- Admin panels and internal tools
- Email templates
- Landing pages that need fast initial load

**Popular template engines for Express:**
| Engine | Syntax | Pros |
|--------|--------|------|
| **EJS** | \`<%= variable %>\` | HTML-like, easy to learn |
| **Pug (Jade)** | Indentation-based | Clean, concise |
| **Handlebars** | \`{{ variable }}\` | Logic-less, precompilable |
| **Nunjucks** | \`{{ variable }}\` | Jinja2-like, powerful |

**Setting up a template engine:**
\`\`\`javascript
app.set('view engine', 'ejs');    // Set the engine
app.set('views', './views');       // Set the views directory
app.get('/', (req, res) => {
  res.render('index', { title: 'Home', user: req.user });
});
\`\`\`

**When to use SSR vs. SPA:**
| Factor | SSR (Template Engine) | SPA (React/Vue) |
|--------|----------------------|-----------------|
| SEO | ✅ Excellent | Needs extra setup (Next.js) |
| Initial load | ✅ Fast | Slower (JS bundle download) |
| Interactivity | Limited | ✅ Rich |
| Complexity | Low | Higher |
| Server load | Higher (renders each request) | Lower (serves static files) |

🏠 **Real-world analogy:** SSR is like a **chef plating food in the kitchen** before serving — the customer sees the finished dish immediately. SPA is like a **build-your-own salad bar** — more flexibility but the customer does the work (browser renders the UI).`,
      codeExample: `// Express with EJS Template Engine

const express = require("express");
const path = require("path");
const app = express();

// 1. Configure template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Mock data
const posts = [
  { id: 1, title: "Getting Started with Node.js", author: "Alice", date: "2024-01-15", excerpt: "Learn the fundamentals..." },
  { id: 2, title: "Express.js Best Practices", author: "Bob", date: "2024-02-20", excerpt: "Production patterns..." },
  { id: 3, title: "Database Integration Guide", author: "Charlie", date: "2024-03-10", excerpt: "MongoDB and PostgreSQL..." },
];

// 2. Routes with template rendering
app.get("/", (req, res) => {
  res.render("index", {
    title: "My Blog",
    posts,
    user: req.user || null,
  });
});

app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).render("error", {
      title: "Not Found",
      message: "Post not found",
    });
  }
  res.render("post", { title: post.title, post });
});

// 3. EJS template examples:

// views/layout.ejs (partial — header/footer)
const layoutHeader = \`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %> | My Blog</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <% if (typeof user !== 'undefined' && user) { %>
      <span>Welcome, <%= user.name %></span>
    <% } else { %>
      <a href="/login">Login</a>
    <% } %>
  </nav>
  <main>
\`;

// views/index.ejs
const indexTemplate = \`
<%- include('partials/header', { title, user }) %>

<h1><%= title %></h1>

<% if (posts.length === 0) { %>
  <p>No posts yet.</p>
<% } else { %>
  <% posts.forEach(post => { %>
    <article>
      <h2><a href="/posts/<%= post.id %>"><%= post.title %></a></h2>
      <p class="meta">By <%= post.author %> on <%= post.date %></p>
      <p><%= post.excerpt %></p>
    </article>
  <% }) %>
<% } %>

<%- include('partials/footer') %>
\`;

// 4. API + SSR hybrid pattern
// For search engines: render HTML
// For API clients: return JSON
app.get("/api/posts", (req, res) => {
  const acceptsJSON = req.accepts("json");
  const acceptsHTML = req.accepts("html");

  if (acceptsJSON && !acceptsHTML) {
    // API client
    res.json({ data: posts });
  } else {
    // Browser
    res.render("index", { title: "Posts", posts, user: null });
  }
});

app.listen(3000, () => {
  console.log("Blog server at http://localhost:3000");
});`,
      exercise: `**Exercises:**
1. Set up EJS as the template engine and create a layout with header, footer, and navigation partials
2. Build a blog with index page (list posts) and detail page (single post) using template rendering
3. Create a form that submits data via POST and renders the result on a success page
4. Implement content negotiation — return JSON for API clients and HTML for browsers
5. Add flash messages for success/error notifications across page redirects
6. Build an admin dashboard with a table of data, edit forms, and delete confirmations — all server-rendered`,
      commonMistakes: [
        "Using `<%= %>` for HTML content — this escapes HTML entities; use `<%- %>` for raw HTML (but be careful of XSS!)",
        "Not passing all required variables to `res.render()` — EJS throws ReferenceError if a variable used in the template isn't provided",
        "Mixing business logic into templates — templates should only handle display; keep data fetching and processing in controllers",
        "Not escaping user input in templates — always use `<%= %>` (escaped) for user-provided data to prevent XSS attacks",
        "Using SSR for everything — highly interactive UIs are better served by SPAs; use SSR for content-heavy, SEO-important pages",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you choose server-side rendering over a single-page application?",
          a: "**Choose SSR when:** (1) **SEO is critical** — search engines can crawl server-rendered HTML directly. (2) **Fast initial load** — HTML is ready on first request (no JS bundle to download). (3) **Simple interactivity** — forms, data tables, content display. (4) **Low client resources** — old devices/slow networks benefit from server-doing-the-work. **Choose SPA when:** (1) Rich, complex interactivity (drag-drop, real-time updates). (2) App-like experience with client-side routing. (3) Heavy state management. **Hybrid:** Frameworks like Next.js combine both — SSR for initial load + client hydration for interactivity.",
        },
        {
          type: "tricky",
          q: "What is the difference between `<%= %>` and `<%- %>` in EJS?",
          a: "`<%= %>` **escapes** the output — HTML special characters (`<`, `>`, `&`, `\"`, `'`) are converted to entities. This prevents XSS attacks. `<%- %>` outputs **raw, unescaped** HTML. Use it for including partials (`<%- include('header') %>`) or trusted HTML content. **Never** use `<%- %>` with user input — it enables XSS attacks where users inject `<script>` tags.",
        },
      ],
    },
  ],
};

export default nodePhase6;
