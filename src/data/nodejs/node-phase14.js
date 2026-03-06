const nodePhase14 = {
  id: "phase-14",
  title: "Phase 14: Real-World Projects & Case Studies",
  emoji: "🎯",
  description:
    "Build complete, production-ready Node.js applications — RESTful APIs, real-time apps, microservices, CLI tools, and full-stack projects.",
  topics: [
    {
      id: "project-rest-api",
      title: "Project: Production REST API",
      explanation: `Build a **complete, production-ready REST API** from scratch, applying everything learned across all previous phases. This project integrates Express.js, databases, authentication, testing, Docker, and CI/CD into a single cohesive application.

**Project: Task Management API (like Trello/Jira)**

**Features:**
- User registration and JWT authentication
- Workspaces with role-based access (owner, admin, member)
- Boards with lists and cards (Kanban style)
- Card assignments, labels, due dates, comments
- File attachments (upload to S3)
- Activity log (who did what when)
- Real-time updates via WebSockets
- Full-text search across cards and comments

**Tech stack:**
\`\`\`
Backend:   Express.js + TypeScript
Database:  PostgreSQL (Prisma ORM)
Cache:     Redis (sessions, cache, rate limiting)
Auth:      JWT + refresh tokens
Files:     AWS S3 / MinIO
Queue:     BullMQ (email notifications, file processing)
Testing:   Jest + Supertest
Deploy:    Docker + GitHub Actions CI/CD
Monitor:   Prometheus + Grafana
\`\`\`

**Architecture:**
\`\`\`
Client → nginx → Express API → PostgreSQL
                      ↕               ↕
                    Redis          BullMQ Workers
                      ↕
                   Socket.IO
\`\`\`

**This project tests your ability to:**
- Design a clean, maintainable project structure
- Implement complex business logic with proper error handling
- Write comprehensive tests (unit + integration)
- Deploy with Docker and CI/CD
- Monitor and debug in production

🏠 **Real-world analogy:** This is the **capstone project** — like building a fully furnished house. You've learned about foundations (Node.js core), framing (Express), plumbing (databases), electrical (auth), and painting (frontend). Now you put it all together into a house someone can actually live in.`,
      codeExample: `// Production REST API — Project Structure & Core Implementation

// === Project structure ===
// src/
// ├── config/         → Environment, database, Redis config
// ├── middleware/      → Auth, validation, error handling, rate limiting
// ├── modules/         → Feature modules (users, boards, cards)
// │   ├── users/
// │   │   ├── user.controller.js
// │   │   ├── user.service.js
// │   │   ├── user.repository.js
// │   │   ├── user.routes.js
// │   │   └── user.validation.js
// │   ├── boards/
// │   └── cards/
// ├── shared/          → Shared utilities, base classes
// ├── jobs/            → BullMQ job processors
// ├── app.js           → Express app setup
// └── server.js        → Entry point (app.listen)
// tests/
// ├── unit/
// ├── integration/
// └── fixtures/
// prisma/
// ├── schema.prisma
// └── migrations/
// docker-compose.yml
// Dockerfile
// .github/workflows/ci.yml

// === src/app.js — Application Setup ===
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

function createApp(dependencies) {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  app.use(express.json({ limit: "10mb" }));

  // Request ID
  app.use((req, res, next) => {
    req.requestId = req.headers["x-request-id"] || require("crypto").randomUUID();
    res.setHeader("X-Request-Id", req.requestId);
    next();
  });

  // Health check
  app.get("/health", async (req, res) => {
    res.json({
      status: "healthy",
      version: process.env.npm_package_version,
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use("/api/v1/auth", dependencies.authRoutes);
  app.use("/api/v1/users", dependencies.userRoutes);
  app.use("/api/v1/boards", dependencies.boardRoutes);
  app.use("/api/v1/cards", dependencies.cardRoutes);

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: \`\${req.method} \${req.path} not found\` });
  });

  // Error handler
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : "Internal server error";

    console.error({
      requestId: req.requestId,
      error: err.message,
      stack: err.stack,
      path: req.path,
    });

    res.status(statusCode).json({
      success: false,
      error: message,
      requestId: req.requestId,
    });
  });

  return app;
}

// === src/modules/cards/card.service.js ===
class CardService {
  constructor(cardRepo, boardService, notificationQueue, cache) {
    this.cardRepo = cardRepo;
    this.boardService = boardService;
    this.notificationQueue = notificationQueue;
    this.cache = cache;
  }

  async createCard(boardId, data, userId) {
    // Verify board access
    const board = await this.boardService.getBoard(boardId, userId);
    if (!board) throw new AppError("Board not found", 404);

    const card = await this.cardRepo.create({
      ...data,
      boardId,
      creatorId: userId,
      position: await this.cardRepo.getNextPosition(boardId, data.listId),
    });

    // Invalidate cache
    await this.cache.del(\`board:\${boardId}:cards\`);

    // Notify assigned users
    if (data.assigneeIds?.length) {
      await this.notificationQueue.add("card-assigned", {
        cardId: card.id,
        assigneeIds: data.assigneeIds,
        assignedBy: userId,
      });
    }

    return card;
  }

  async moveCard(cardId, targetListId, position, userId) {
    const card = await this.cardRepo.findById(cardId);
    if (!card) throw new AppError("Card not found", 404);

    await this.boardService.verifyAccess(card.boardId, userId);

    const updated = await this.cardRepo.transaction(async (tx) => {
      // Reorder cards in source and target lists
      await this.cardRepo.reorderAfterRemove(card.listId, card.position, tx);
      await this.cardRepo.reorderAfterInsert(targetListId, position, tx);

      return this.cardRepo.update(cardId, {
        listId: targetListId,
        position,
      }, tx);
    });

    await this.cache.del(\`board:\${card.boardId}:cards\`);
    return updated;
  }

  async searchCards(query, userId) {
    const boards = await this.boardService.getUserBoards(userId);
    const boardIds = boards.map((b) => b.id);

    return this.cardRepo.fullTextSearch(query, boardIds);
  }
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = { createApp, CardService, AppError };`,
      exercise: `**Exercises:**
1. Build the complete Task Management API with users, boards, lists, and cards
2. Implement role-based access: workspace owners can manage members; members can only view/edit assigned cards
3. Add real-time updates — when a card is moved, all connected users see the change instantly
4. Implement full-text search with PostgreSQL \`tsvector\` or Elasticsearch
5. Write integration tests for the complete API — achieve 80%+ code coverage
6. Dockerize the application and deploy with CI/CD — include database migrations in the pipeline`,
      commonMistakes: [
        "Not designing the project structure upfront — jumping into code without architecture leads to spaghetti code; plan modules and layers first",
        "Mixing concerns in route handlers — controllers should only handle HTTP; business logic belongs in services; data access in repositories",
        "Skipping error handling for edge cases — real users will send unexpected data; test with invalid, missing, and malformed inputs",
        "Not writing tests during development — retrofitting tests is harder and less effective; write tests alongside features",
        "Deploying without monitoring — you can't fix what you can't measure; set up logging, metrics, and error tracking from day one",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "How would you design a task management API like Trello?",
          a: "**Data model:** Users → Workspaces → Boards → Lists → Cards. Cards have assignments, labels, due dates, comments, attachments. Activity log tracks all changes. **Architecture:** Express.js API with layered architecture (routes → controllers → services → repositories). PostgreSQL for relational data. Redis for caching and real-time (Socket.IO adapter). BullMQ for async jobs (notifications, file processing). **Key decisions:** (1) Soft delete for cards (undo). (2) Optimistic concurrency for card ordering. (3) Event sourcing for activity log. (4) Cursor-based pagination for large boards. (5) WebSockets for real-time sync. (6) RBAC with workspace-level permissions.",
        },
        {
          type: "tricky",
          q: "How do you handle real-time collaboration on the same board?",
          a: "**Challenge:** Multiple users moving cards simultaneously can cause conflicts. **Solution:** (1) **WebSockets** (Socket.IO) — push changes to all connected users in real-time. (2) **Optimistic updates** — UI updates immediately; server validates and broadcasts. (3) **Last-write-wins** — simple but may lose changes; acceptable for most task management. (4) **Operational Transform / CRDT** — for true real-time collaboration (overkill for card movements). (5) **Room-based channels** — each board is a Socket.IO room; only relevant clients receive updates. (6) **Conflict detection** — compare `updatedAt` timestamps; reject stale updates with a 409 Conflict response.",
        },
      ],
    },
    {
      id: "project-realtime-app",
      title: "Project: Real-Time Application",
      explanation: `Build a **real-time collaborative application** that showcases WebSockets, pub/sub, and event-driven architecture.

**Project: Real-Time Collaborative Whiteboard**

**Features:**
- Multiple users draw simultaneously on a shared canvas
- Real-time cursor tracking for all connected users
- Room-based sessions (create/join whiteboards)
- Shape tools: freehand, line, rectangle, circle, text
- Color picker, brush size, undo/redo
- Chat sidebar for room communication
- Export whiteboard as PNG/SVG
- Persistent storage (save/load whiteboards)

**Architecture:**
\`\`\`
React Frontend → Socket.IO Client
        ↕
nginx (WebSocket upgrade)
        ↕
Node.js → Socket.IO Server → Redis Adapter (for scaling)
        ↕
MongoDB (whiteboard persistence)
\`\`\`

**Key technical challenges:**
1. **Low latency** — drawing must feel instant; use WebSocket binary data
2. **State synchronization** — new users joining must see current whiteboard state
3. **Conflict resolution** — two users drawing simultaneously
4. **Bandwidth** — throttle cursor/draw events (requestAnimationFrame, not per-pixel)
5. **Scaling** — Redis adapter for multi-server WebSocket chat

This project is excellent for interviews because it demonstrates:
- WebSocket mastery (bidirectional, rooms, binary data)
- Event-driven architecture
- State management across distributed clients
- Performance optimization (throttling, batching)
- Horizontal scaling strategies`,
      codeExample: `// Real-Time Collaborative Whiteboard — Server

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e6, // 1MB for binary drawing data
});

// In-memory room state (production: use Redis + MongoDB)
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      users: new Map(),
      strokes: [],
      createdAt: Date.now(),
    });
  }
  return rooms.get(roomId);
}

// Socket.IO connection
io.on("connection", (socket) => {
  let currentRoom = null;
  let username = null;

  // Join a whiteboard room
  socket.on("room:join", ({ roomId, user }) => {
    currentRoom = roomId;
    username = user;
    socket.join(roomId);

    const room = getRoom(roomId);
    room.users.set(socket.id, { username: user, cursor: null });

    // Send current whiteboard state to the new user
    socket.emit("room:state", {
      strokes: room.strokes,
      users: Array.from(room.users.values()),
    });

    // Notify others
    socket.to(roomId).emit("user:joined", { username: user, socketId: socket.id });

    io.to(roomId).emit("user:list", Array.from(room.users.values()));
  });

  // Drawing events
  socket.on("draw:stroke", (strokeData) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);

    // Store stroke for new joiners
    room.strokes.push(strokeData);

    // Broadcast to everyone else in the room
    socket.to(currentRoom).emit("draw:stroke", strokeData);
  });

  // Cursor movement (throttled on client side)
  socket.on("cursor:move", ({ x, y }) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    const user = room.users.get(socket.id);
    if (user) user.cursor = { x, y };

    socket.to(currentRoom).emit("cursor:move", {
      socketId: socket.id,
      username,
      x, y,
    });
  });

  // Undo
  socket.on("draw:undo", () => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.strokes.pop();
    io.to(currentRoom).emit("draw:undo");
  });

  // Clear board
  socket.on("draw:clear", () => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.strokes = [];
    io.to(currentRoom).emit("draw:clear");
  });

  // Chat
  socket.on("chat:message", (text) => {
    if (!currentRoom) return;
    io.to(currentRoom).emit("chat:message", {
      username,
      text,
      timestamp: Date.now(),
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (currentRoom) {
      const room = getRoom(currentRoom);
      room.users.delete(socket.id);

      socket.to(currentRoom).emit("user:left", { username, socketId: socket.id });
      io.to(currentRoom).emit("user:list", Array.from(room.users.values()));

      // Clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
});

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Whiteboard server running on http://localhost:3000");
});`,
      exercise: `**Exercises:**
1. Build the collaborative whiteboard with rooms, freehand drawing, and real-time sync
2. Add cursor tracking — show other users' cursors with their names
3. Implement undo/redo that works across all connected clients
4. Add a chat sidebar for room-level text communication
5. Persist whiteboards to MongoDB — save automatically every 30 seconds and on room close
6. Scale to multiple servers using the Socket.IO Redis adapter`,
      commonMistakes: [
        "Sending every mouse move event — this generates 60+ events/second per user; throttle to 20-30fps or use requestAnimationFrame",
        "Not syncing state for late joiners — users who join after drawing has started see an empty canvas; send the full stroke history on join",
        "Broadcasting to all sockets including the sender — the sender sees their own drawing immediately; broadcasting back causes double-rendering",
        "Not handling reconnection — when a user's connection drops and reconnects, they should rejoin their room and receive the current state",
        "Storing all drawing data in memory — for production, save strokes to a database periodically and load on demand",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "How would you design a real-time collaborative tool?",
          a: "**Architecture:** (1) **Frontend** — Canvas/SVG rendering, local-first optimistic updates, Socket.IO client. (2) **Server** — Socket.IO server with room-based namespaces, Redis adapter for multi-server scaling. (3) **State management** — rooms store current drawing state; new joiners receive full state snapshot. (4) **Persistence** — MongoDB for saving whiteboard state; auto-save on intervals and room close. (5) **Throttling** — limit cursor/draw events to 30fps to prevent network saturation. (6) **Scaling** — Redis Pub/Sub adapter ensures events reach all servers. (7) **Conflict handling** — for simple drawing, last-write-wins suffices; for structured data (text editing), use CRDTs or Operational Transform.",
        },
      ],
    },
    {
      id: "project-cli-tool",
      title: "Project: CLI Tool & npm Package",
      explanation: `Build a **command-line tool** and publish it as an **npm package**. CLI tools are one of Node.js's strongest use cases — many popular developer tools are built with Node.js.

**Project: Dev Environment Manager CLI**

**Features:**
\`\`\`bash
devenv init                   # Initialize a project with templates
devenv env create staging     # Create an environment
devenv env list               # List all environments
devenv secrets set KEY VALUE  # Set an encrypted secret
devenv secrets list           # List secrets (masked values)
devenv deploy staging         # Deploy to an environment
devenv logs --follow          # Tail production logs
\`\`\`

**Popular CLI frameworks for Node.js:**
| Framework | Pros |
|-----------|------|
| **Commander.js** | Most popular, simple, well-documented |
| **yargs** | Powerful argument parsing, auto-generated help |
| **oclif** | Framework by Heroku, TypeScript-first, plugin system |
| **Inquirer.js** | Interactive prompts (lists, checkboxes, passwords) |
| **chalk** | Terminal string styling (colors, bold, etc.) |
| **ora** | Elegant terminal spinners |

**Publishing to npm:**
\`\`\`bash
# 1. Set up package.json with "bin" field
# 2. Add shebang to entry file: #!/usr/bin/env node
# 3. npm login
# 4. npm publish
# 5. Users install globally: npm install -g your-package
\`\`\`

This project demonstrates skills in:
- CLI argument parsing and validation
- Interactive terminal UIs (prompts, progress bars, tables)
- File system operations (config files, templates)
- Process management (spawning commands)
- npm package publishing and versioning`,
      codeExample: `// CLI Tool with Commander.js

// #!/usr/bin/env node
const { Command } = require("commander");
const chalk = require("chalk");
const ora = require("ora");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

const program = new Command();

program
  .name("devenv")
  .description("Developer environment management CLI")
  .version("1.0.0");

// === init command ===
program
  .command("init")
  .description("Initialize a new project")
  .option("-t, --template <type>", "Template type", "express")
  .action(async (options) => {
    console.log(chalk.bold.blue("\\n🚀 DevEnv Initializer\\n"));

    // Interactive prompts
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Project name:",
        default: path.basename(process.cwd()),
        validate: (input) => (input.length > 0 ? true : "Name is required"),
      },
      {
        type: "list",
        name: "template",
        message: "Select a template:",
        choices: ["express-api", "express-fullstack", "fastify-api", "koa-api"],
        default: options.template,
      },
      {
        type: "checkbox",
        name: "features",
        message: "Select features:",
        choices: [
          { name: "TypeScript", value: "typescript", checked: true },
          { name: "Docker", value: "docker", checked: true },
          { name: "CI/CD (GitHub Actions)", value: "cicd" },
          { name: "Database (PostgreSQL)", value: "database" },
          { name: "Redis", value: "redis" },
          { name: "Testing (Jest)", value: "testing", checked: true },
        ],
      },
      {
        type: "confirm",
        name: "installDeps",
        message: "Install dependencies?",
        default: true,
      },
    ]);

    const spinner = ora("Creating project structure...").start();

    try {
      // Create project files based on template
      await createProjectStructure(answers);
      spinner.succeed("Project structure created");

      if (answers.installDeps) {
        spinner.start("Installing dependencies...");
        // await execAsync("npm install");
        spinner.succeed("Dependencies installed");
      }

      console.log(chalk.green("\\n✅ Project initialized successfully!"));
      console.log(chalk.gray("\\nNext steps:"));
      console.log(chalk.cyan("  npm run dev") + "    Start development server");
      console.log(chalk.cyan("  npm test") + "       Run tests");
      console.log(chalk.cyan("  npm run build") + "  Build for production");
    } catch (err) {
      spinner.fail("Initialization failed");
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

// === env commands ===
const envCmd = program.command("env").description("Manage environments");

envCmd
  .command("list")
  .description("List all environments")
  .action(() => {
    const envs = [
      { name: "development", status: "active", url: "localhost:3000" },
      { name: "staging", status: "active", url: "staging.example.com" },
      { name: "production", status: "active", url: "api.example.com" },
    ];

    console.log(chalk.bold("\\nEnvironments:\\n"));
    console.log(
      chalk.gray("  NAME".padEnd(18) + "STATUS".padEnd(12) + "URL")
    );
    console.log(chalk.gray("  " + "-".repeat(50)));

    for (const env of envs) {
      const statusColor = env.status === "active" ? chalk.green : chalk.red;
      console.log(
        \`  \${chalk.white(env.name.padEnd(18))}\${statusColor(env.status.padEnd(12))}\${chalk.cyan(env.url)}\`
      );
    }
    console.log();
  });

envCmd
  .command("create <name>")
  .description("Create a new environment")
  .option("-c, --clone <source>", "Clone from existing environment")
  .action(async (name, options) => {
    const spinner = ora(\`Creating environment: \${name}\`).start();
    // Simulate creation
    await new Promise((r) => setTimeout(r, 2000));
    spinner.succeed(\`Environment "\${name}" created successfully\`);
  });

// === secrets commands ===
const secretsCmd = program.command("secrets").description("Manage secrets");

secretsCmd
  .command("set <key> <value>")
  .description("Set a secret")
  .option("-e, --env <environment>", "Target environment", "development")
  .action((key, value, options) => {
    console.log(
      chalk.green(\`✅ Secret "\${key}" set for \${options.env}\`)
    );
  });

secretsCmd
  .command("list")
  .description("List all secrets")
  .option("-e, --env <environment>", "Target environment", "development")
  .action((options) => {
    const secrets = [
      { key: "DATABASE_URL", preview: "postgres://...****" },
      { key: "JWT_SECRET", preview: "****" },
      { key: "REDIS_URL", preview: "redis://...****" },
    ];

    console.log(chalk.bold(\`\\nSecrets (\${options.env}):\\n\`));
    for (const s of secrets) {
      console.log(\`  \${chalk.cyan(s.key.padEnd(20))} \${chalk.gray(s.preview)}\`);
    }
    console.log();
  });

// Parse arguments
program.parse();

// Helper
async function createProjectStructure(config) {
  const dirs = ["src", "tests", "config"];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// package.json for publishing:
const packageJson = {
  name: "devenv-cli",
  version: "1.0.0",
  description: "Developer environment management CLI",
  bin: { devenv: "./src/cli.js" },
  files: ["src/", "templates/"],
  keywords: ["cli", "devtools", "environment"],
  engines: { node: ">=18" },
};`,
      exercise: `**Exercises:**
1. Build a CLI with Commander.js or yargs — at least 5 commands with options and arguments
2. Add interactive prompts using Inquirer.js for user configuration
3. Implement colored output with chalk and progress spinners with ora
4. Create a config file manager — read/write JSON/YAML configuration files
5. Publish your CLI to npm — set up the \`bin\` field, add a shebang line, test global installation
6. Add automated tests for your CLI commands using Jest (test argument parsing and output)`,
      commonMistakes: [
        "Forgetting the shebang line (`#!/usr/bin/env node`) — without it, the OS doesn't know to run the file with Node.js when called as a CLI command",
        "Not setting the `bin` field in package.json — this is what creates the global command when users `npm install -g` your package",
        "Not handling errors gracefully — uncaught errors dump stack traces; CLI tools should show friendly error messages with chalk formatting",
        "Not providing --help and --version flags — users expect these; Commander.js adds them automatically",
        "Hardcoding file paths — use `path.resolve()`, `os.homedir()`, and `process.cwd()` for cross-platform compatibility",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you create and publish a CLI tool with Node.js?",
          a: '**Steps:** (1) Create entry file with shebang `#!/usr/bin/env node`. (2) Use Commander.js or yargs for argument parsing. (3) Add `bin` field to `package.json`: `"bin": { "my-cli": "./src/cli.js" }`. (4) Make the file executable: `chmod +x src/cli.js`. (5) Test locally: `npm link` (creates global symlink). (6) Publish: `npm login` then `npm publish`. (7) Users install: `npm install -g my-cli`. **Polish:** Add Inquirer.js for interactive prompts, chalk for colors, ora for spinners, conf for persistent config, and update-notifier to alert users of new versions.',
        },
        {
          type: "scenario",
          q: "What Node.js projects have you built that you're most proud of?",
          a: "**Framework for answering:** (1) **Problem** — what challenge did you solve? (2) **Architecture** — what tech stack and design decisions did you make? (3) **Challenges** — what was technically difficult? How did you solve it? (4) **Scale** — how many users/requests/data? (5) **Impact** — what was the business outcome? **Good projects to discuss:** REST API with auth + testing + deployment, real-time application with WebSockets, CLI tool published to npm, microservice with message queues, background job processing system. Focus on decisions and trade-offs, not just features.",
        },
      ],
    },
  ],
};

export default nodePhase14;
