const nodePhase10 = {
  id: "phase-10",
  title: "Phase 10: Testing & Debugging",
  emoji: "🧪",
  description:
    "Write unit, integration, and end-to-end tests with Jest and Supertest. Master debugging techniques, logging, and performance profiling.",
  topics: [
    {
      id: "unit-testing-jest",
      title: "Unit Testing with Jest",
      explanation: `**Jest** is the most popular JavaScript testing framework, created by Facebook. It's zero-config, batteries-included, and works seamlessly with Node.js.

**Why Jest?**
- Built-in assertions, mocking, code coverage
- Snapshot testing
- Parallel test execution
- Watch mode for development
- Rich ecosystem and community

**Testing pyramid:**
\`\`\`
        /  E2E  \\         ← Few (slow, expensive)
       / Integration \\    ← Some (medium speed)
      /  Unit Tests   \\   ← Many (fast, cheap)
\`\`\`

**Jest concepts:**
- **Test suite** — \`describe('module', () => { ... })\`
- **Test case** — \`test('should do X', () => { ... })\` or \`it('should...')\`
- **Assertion** — \`expect(value).toBe(expected)\`
- **Mock** — Replace real functions/modules with controlled versions
- **Spy** — Watch a function without replacing it

**Assertion methods:**
| Method | Use Case |
|--------|----------|
| \`.toBe(value)\` | Strict equality (===) |
| \`.toEqual(object)\` | Deep equality (objects/arrays) |
| \`.toBeTruthy()\` / \`.toBeFalsy()\` | Boolean checks |
| \`.toThrow(error)\` | Expect an error to be thrown |
| \`.toHaveBeenCalled()\` | Check if mock was called |
| \`.toHaveBeenCalledWith(args)\` | Check mock call arguments |
| \`.resolves\` / \`.rejects\` | Async assertions |

🏠 **Real-world analogy:** Unit tests are like **quality control inspections** on an assembly line. Each component (unit) is tested individually before assembly. If a bolt (function) is defective, you catch it before it's part of the finished product (application).`,
      codeExample: `// Unit Testing with Jest — Complete Guide

// === src/services/userService.js ===
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async createUser(data) {
    if (!data.email || !data.name) {
      throw new Error("Name and email are required");
    }

    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error("Email already registered");
    }

    const user = await this.userRepository.create({
      ...data,
      createdAt: new Date(),
    });

    await this.emailService.sendWelcome(user.email, user.name);

    return user;
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }
}

module.exports = UserService;

// === tests/unit/userService.test.js ===
const UserService = require("../../src/services/userService");

describe("UserService", () => {
  let userService;
  let mockUserRepo;
  let mockEmailService;

  // Setup before each test
  beforeEach(() => {
    // Create mocks
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    mockEmailService = {
      sendWelcome: jest.fn().mockResolvedValue(true),
    };

    userService = new UserService(mockUserRepo, mockEmailService);
  });

  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    const validUserData = { name: "Alice", email: "alice@example.com" };

    test("should create a user successfully", async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(null); // No existing user
      mockUserRepo.create.mockResolvedValue({ id: 1, ...validUserData });

      // Act
      const user = await userService.createUser(validUserData);

      // Assert
      expect(user).toEqual(expect.objectContaining({ name: "Alice" }));
      expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendWelcome).toHaveBeenCalledWith(
        "alice@example.com",
        "Alice"
      );
    });

    test("should throw if email is missing", async () => {
      await expect(userService.createUser({ name: "Alice" })).rejects.toThrow(
        "Name and email are required"
      );
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    test("should throw if email already exists", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 1, email: validUserData.email });

      await expect(userService.createUser(validUserData)).rejects.toThrow(
        "Email already registered"
      );
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    test("should still create user if welcome email fails", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({ id: 1, ...validUserData });
      mockEmailService.sendWelcome.mockRejectedValue(new Error("SMTP error"));

      await expect(userService.createUser(validUserData)).rejects.toThrow("SMTP error");
    });
  });

  describe("getUserById", () => {
    test("should return user when found", async () => {
      const mockUser = { id: 1, name: "Alice" };
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const user = await userService.getUserById(1);

      expect(user).toEqual(mockUser);
      expect(mockUserRepo.findById).toHaveBeenCalledWith(1);
    });

    test("should throw when user not found", async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toThrow("User not found");
    });
  });
});

// === jest.config.js ===
module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterSetup: ["./tests/setup.js"],
};`,
      exercise: `**Exercises:**
1. Write unit tests for a Calculator class with \`add\`, \`subtract\`, \`multiply\`, \`divide\` — cover edge cases
2. Test an async service with mocked dependencies — use \`jest.fn()\` for repository and external services
3. Achieve 90%+ code coverage on a service module — use \`jest --coverage\` and fill gaps
4. Write tests using \`beforeEach\`, \`afterEach\`, \`beforeAll\`, \`afterAll\` for setup and cleanup
5. Test error handling — verify that functions throw specific errors with specific messages
6. Use Jest's snapshot testing to test a configuration generator function`,
      commonMistakes: [
        "Testing implementation details instead of behavior — don't test that a specific internal method was called; test the observable output",
        "Not isolating units — unit tests should mock all dependencies; hitting real databases or APIs makes them integration tests",
        "Forgetting to clear mocks between tests — stale mock state from one test affects the next; use `jest.clearAllMocks()` in `afterEach`",
        "Writing tests that depend on execution order — each test should be independent; use `beforeEach` for setup, not shared mutable state",
        "Only testing the happy path — test edge cases, error conditions, boundary values, and empty inputs",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the testing pyramid and how does it apply to Node.js?",
          a: "The testing pyramid has three layers: (1) **Unit tests** (base, most numerous) — test individual functions/classes in isolation with mocked dependencies. Fast (~ms), cheap, catch logic bugs. (2) **Integration tests** (middle) — test multiple components working together. Test API endpoints with a real database, middleware chains, service interactions. (3) **E2E tests** (top, fewest) — test the entire system from a user's perspective. Slow, expensive, brittle, but catch system-wide issues. **Node.js application:** ~70% unit tests (services, utils), ~20% integration tests (API endpoints with database), ~10% E2E tests (full workflows).",
        },
        {
          type: "coding",
          q: "How do you mock a module dependency in Jest?",
          a: "**Three approaches:** (1) **Manual mock injection:** Pass mocks via constructor (dependency injection): `new UserService(mockRepo)`. (2) **jest.mock():** `jest.mock('./database', () => ({ query: jest.fn() }))` — replaces the module globally. (3) **jest.spyOn():** `jest.spyOn(object, 'method').mockReturnValue('mocked')` — wraps an existing method. **Best practice:** Use dependency injection (approach 1) for services — it's explicit and framework-independent. Use `jest.mock()` for external modules (fs, axios). Always use `jest.clearAllMocks()` in `afterEach`.",
        },
      ],
    },
    {
      id: "integration-testing",
      title: "Integration & API Testing",
      explanation: `**Integration tests** verify that multiple components work together correctly. For Node.js APIs, this means testing the full request → middleware → route → controller → service → database flow.

**Supertest** is the standard library for HTTP integration testing in Node.js. It works by importing your Express app and making real HTTP requests against it — without starting a server.

**What to test in integration tests:**
- HTTP status codes for all routes
- Response body structure and content
- Request validation (invalid input returns 400)
- Authentication and authorization
- Database side effects (records created/updated)
- Error handling (404, 500)

**Test database strategies:**
| Strategy | Pros | Cons |
|----------|------|------|
| In-memory DB (SQLite) | Fast, no setup | Different behavior from production |
| Docker container | Same DB as production | Slower, needs Docker |
| Test database | Real database | Needs cleanup between tests |
| Mocked DB layer | Fastest | Doesn't test real queries |

🏠 **Real-world analogy:** If unit tests inspect **individual car parts**, integration tests take the **assembled car for a test drive** — checking that the engine, transmission, and wheels work together. API testing is like sending the car through an **automated inspection course** — it must pass every station (endpoint) to be approved.`,
      codeExample: `// Integration Testing with Supertest

const request = require("supertest");
const app = require("../../src/app"); // Import app WITHOUT server.listen()

describe("POST /api/users", () => {
  test("should create a user with valid data", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "alice@test.com", password: "secure123" })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: "Alice",
      email: "alice@test.com",
    });
    expect(res.body.data.password).toBeUndefined(); // Not exposed
    expect(res.body.data.id).toBeDefined();
  });

  test("should return 400 for missing required fields", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Alice" }) // Missing email
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  test("should return 409 for duplicate email", async () => {
    // First create
    await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "dup@test.com", password: "secure123" });

    // Duplicate
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Bob", email: "dup@test.com", password: "secure123" })
      .expect(409);

    expect(res.body.error.message).toContain("already");
  });
});

describe("GET /api/users", () => {
  test("should return paginated users", async () => {
    const res = await request(app)
      .get("/api/users?page=1&limit=10")
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
    });
  });

  test("should filter by role", async () => {
    const res = await request(app)
      .get("/api/users?role=admin")
      .expect(200);

    res.body.data.forEach((user) => {
      expect(user.role).toBe("admin");
    });
  });
});

describe("Protected routes", () => {
  let authToken;

  beforeAll(async () => {
    // Login to get token
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "admin123" });
    authToken = res.body.accessToken;
  });

  test("should return 401 without token", async () => {
    await request(app).get("/api/profile").expect(401);
  });

  test("should return profile with valid token", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", \`Bearer \${authToken}\`)
      .expect(200);

    expect(res.body.data.email).toBeDefined();
  });

  test("should return 403 for unauthorized role", async () => {
    await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", \`Bearer \${authToken}\`)
      .expect(403);
  });
});

describe("Error handling", () => {
  test("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nonexistent").expect(404);
    expect(res.body.success).toBe(false);
  });

  test("should return 500 for server errors", async () => {
    // Trigger an internal error (e.g., bad query)
    const res = await request(app)
      .get("/api/crash-test")
      .expect(500);

    expect(res.body.error).not.toContain("stack"); // No stack in production
  });
});`,
      exercise: `**Exercises:**
1. Write integration tests for all CRUD endpoints of a user API using Supertest
2. Test authentication — verify login returns a token, protected routes reject without it
3. Test pagination, filtering, and sorting query parameters
4. Set up a test database that is reset before each test suite
5. Test error responses — 400 (validation), 401 (auth), 403 (forbidden), 404, 500
6. Generate a test coverage report and achieve 80%+ coverage across all layers`,
      commonMistakes: [
        "Starting the server in test files — import `app` (Express instance), not `server` (with .listen()); Supertest handles the HTTP internally",
        "Not cleaning up test data between tests — use `beforeEach` to reset the database or seed known state",
        "Testing only the happy path — integration tests must cover error cases, edge cases, and auth failures",
        "Making tests dependent on each other — each test should create its own data; don't rely on data from a previous test",
        "Using the same database for development and testing — use a separate test database or in-memory DB to avoid data conflicts",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you write integration tests for a Node.js REST API?",
          a: "**Setup:** (1) Import the Express `app` (not the server). (2) Use **Supertest** to make HTTP requests: `request(app).get('/api/users').expect(200)`. (3) Use a **test database** (separate from dev). (4) **Seed data** in `beforeAll/beforeEach` and clean up in `afterAll/afterEach`. **What to test:** (1) Correct status codes for all routes and scenarios. (2) Response body structure and content. (3) Validation errors (400). (4) Auth requirements (401/403). (5) Database side effects (record created/updated). (6) Edge cases (empty results, max pagination). Use `jest --runInBand` to prevent parallel database conflicts.",
        },
        {
          type: "scenario",
          q: "How do you handle test database setup and teardown?",
          a: "**Strategies:** (1) **Docker Compose** — spin up a dedicated test database container; teardown after tests. (2) **In-memory SQLite** — configure the ORM to use SQLite in tests; fast but may have behavior differences. (3) **Transaction rollback** — wrap each test in a transaction and rollback after; fast, clean, but complex to set up. (4) **Truncate tables** — in `beforeEach`, truncate all tables; simple but slower. **Best practice:** Use `globalSetup` to create the test database with migrations, `beforeEach` to seed known data, `afterEach` to clean up, and `globalTeardown` to drop the test database.",
        },
      ],
    },
    {
      id: "debugging-logging",
      title: "Debugging & Production Logging",
      explanation: `Effective debugging and structured logging are critical for maintaining Node.js applications. In production, logs are your primary window into application behavior.

**Debugging tools:**
| Tool | Use Case |
|------|----------|
| \`console.log()\` | Quick dev debugging (remove before committing!) |
| \`debugger\` statement | Breakpoints in Node.js inspector |
| \`node --inspect\` | Chrome DevTools debugger |
| VS Code debugger | IDE-integrated debugging |
| \`debug\` package | Conditional debug logging (e.g., Express uses it) |

**Production logging with Winston:**
Winston is the most popular logging library for Node.js. It supports multiple log levels, transports (console, file, database), and structured JSON logging.

**Log levels (severity):**
\`\`\`
error: 0  →  Application errors, crashes
warn:  1  →  Unexpected behavior, deprecations
info:  2  →  Important events (server start, user actions)
http:  3  →  HTTP request/response logs
debug: 4  →  Detailed debugging (disabled in production)
\`\`\`

**Structured logging best practices:**
1. Use **JSON format** — parseable by log aggregation tools (ELK, Datadog)
2. Include **context** — request ID, user ID, timestamp
3. Log at appropriate **levels** — don't log everything at \`info\`
4. **Never log sensitive data** — passwords, tokens, credit cards
5. Use **correlation IDs** — trace a request across microservices

🏠 **Real-world analogy:** Debugging is like being a **detective**. \`console.log\` is asking witnesses (prints). The Node.js debugger is reviewing **security camera footage** (step-by-step execution). Production logging is like a **flight recorder (black box)** — capturing everything needed to reconstruct events after they happen.`,
      codeExample: `// Debugging & Production Logging

// === 1. Winston Logger Setup ===
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "my-api" },
  transports: [
    // Console (colorized for development)
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "development"
          ? winston.format.combine(winston.format.colorize(), winston.format.simple())
          : winston.format.json(),
    }),
    // File transports (production)
    new winston.transports.File({ filename: "logs/error.log", level: "error", maxsize: 5242880, maxFiles: 5 }),
    new winston.transports.File({ filename: "logs/combined.log", maxsize: 5242880, maxFiles: 5 }),
  ],
});

// 2. Request logging middleware
function requestLogger(req, res, next) {
  const requestId = req.headers["x-request-id"] || require("crypto").randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: \`\${duration}ms\`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?.id,
    };

    if (res.statusCode >= 500) {
      logger.error("Request failed", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("Client error", logData);
    } else {
      logger.info("Request completed", logData);
    }
  });

  next();
}

// 3. Usage in application code
logger.info("Server starting", { port: 3000, env: process.env.NODE_ENV });
logger.warn("Cache miss", { key: "user:42", source: "redis" });
logger.error("Database query failed", { query: "SELECT...", error: "Connection refused" });

// ❌ NEVER log sensitive data
// logger.info("User login", { email, password }); // BAD!
// ✅ Log safely
// logger.info("User login", { email, userId: user.id }); // GOOD

// 4. Node.js Debugger
// Start with: node --inspect src/server.js
// Open: chrome://inspect in Chrome
// Or use VS Code's built-in debugger

// .vscode/launch.json
const vscodeLaunchConfig = {
  version: "0.2.0",
  configurations: [
    {
      type: "node",
      request: "launch",
      name: "Debug Server",
      program: "\${workspaceFolder}/src/server.js",
      env: { NODE_ENV: "development" },
      restart: true,
    },
    {
      type: "node",
      request: "launch",
      name: "Debug Tests",
      program: "\${workspaceFolder}/node_modules/.bin/jest",
      args: ["--runInBand", "--no-cache"],
    },
  ],
};

// 5. Conditional debug logging (debug package)
// const debug = require("debug");
// const dbDebug = debug("app:db");
// const httpDebug = debug("app:http");
// dbDebug("Query executed:", query); // Only shows if DEBUG=app:db
// Start with: DEBUG=app:* node server.js

// 6. Performance profiling
function measurePerformance() {
  console.time("operation");
  // ... do work
  console.timeEnd("operation"); // "operation: 123ms"

  // More precise
  const { performance, PerformanceObserver } = require("perf_hooks");
  const start = performance.now();
  // ... do work
  const duration = performance.now() - start;
  logger.debug("Operation completed", { durationMs: duration.toFixed(2) });
}

module.exports = { logger, requestLogger };`,
      exercise: `**Exercises:**
1. Set up Winston with console, file, and error-specific transports
2. Create request logging middleware that includes request ID, method, URL, status, and duration
3. Add correlation IDs — generate a unique ID per request and include it in all logs
4. Configure VS Code debugger for both running the server and running tests
5. Profile a slow endpoint using \`console.time\`, \`perf_hooks\`, and Node.js \`--prof\` flag
6. Set up structured logging that can be parsed by ELK Stack or Datadog`,
      commonMistakes: [
        "Using `console.log` in production — it's synchronous, has no log levels, and can't be routed to files or services; use Winston or Pino",
        "Logging sensitive data — passwords, tokens, credit card numbers must NEVER appear in logs; audit your logs regularly",
        "Not including correlation IDs — without request IDs, you can't trace a request through multiple log entries or services",
        "Logging too much in production — excessive logging impacts performance and storage costs; use `info` level in production, `debug` in development",
        "Not setting up log rotation — without rotation, log files grow indefinitely and fill the disk; use Winston's `maxsize` and `maxFiles` options",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you debug a Node.js application in production?",
          a: "**Layered approach:** (1) **Structured logging** — Winston/Pino with JSON format, log levels, correlation IDs. Query logs in ELK Stack, Datadog, or CloudWatch. (2) **Error tracking** — Sentry or Bugsnag for automatic error capture with stack traces, breadcrumbs, and user context. (3) **APM (Application Performance Monitoring)** — Datadog APM, New Relic, or Elastic APM for request tracing, slow query detection, and bottleneck identification. (4) **Health checks** — `/health` endpoint reporting database, cache, and external service status. (5) **Remote debugging** — `node --inspect` with SSH tunnel (use sparingly, security risk). (6) **Core dumps** — `--abort-on-uncaught-exception` for post-mortem debugging with llnode.",
        },
        {
          type: "scenario",
          q: "How would you trace a request through a microservice architecture?",
          a: "**Distributed tracing:** (1) Generate a **correlation ID** (UUID) at the API gateway or first service. (2) Pass it in the `X-Request-Id` header to all downstream services. (3) Include the correlation ID in every log entry. (4) Use **OpenTelemetry** (standard) with Jaeger or Zipkin for visual trace visualization. (5) Each service logs entry, key processing steps, and exit with timing. (6) When an error occurs, search by correlation ID to see the entire request path across services. **Tools:** OpenTelemetry SDK (instrumentation), Jaeger/Zipkin (trace visualization), ELK/Datadog (log aggregation).",
        },
      ],
    },
  ],
};

export default nodePhase10;
