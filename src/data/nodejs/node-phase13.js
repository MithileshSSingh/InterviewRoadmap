const nodePhase13 = {
  id: "phase-13",
  title: "Phase 13: System Design & Architecture",
  emoji: "🏗️",
  description:
    "Design scalable Node.js systems — microservices, message queues, event-driven architecture, caching layers, and common design patterns.",
  topics: [
    {
      id: "microservices-architecture",
      title: "Microservices Architecture",
      explanation: `**Microservices** decompose a monolithic application into small, independently deployable services that communicate over APIs. Each service owns its own data and business logic.

**Monolith vs. Microservices:**
| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Deployment | Deploy everything together | Deploy services independently |
| Scaling | Scale entire app | Scale individual services |
| Tech stack | Single language/framework | Any language per service |
| Database | Shared database | Database per service |
| Complexity | Simpler at small scale | Complex infrastructure |
| Team ownership | Shared codebase | Service ownership |
| Failure isolation | One bug can crash everything | Failures are contained |

**Key microservice patterns:**
1. **API Gateway** — single entry point that routes to services
2. **Service Discovery** — services register and find each other dynamically
3. **Circuit Breaker** — prevent cascading failures when a service is down
4. **Saga** — distributed transactions across multiple services
5. **CQRS** — separate read and write models for performance
6. **Event Sourcing** — store events instead of current state

**Communication patterns:**
| Pattern | Use Case | Examples |
|---------|----------|---------|
| **Synchronous (HTTP/gRPC)** | Request-response, real-time | REST API, gRPC calls |
| **Asynchronous (Message Queue)** | Fire-and-forget, eventual consistency | RabbitMQ, Kafka, SQS |
| **Event-driven** | React to state changes | Redis Pub/Sub, EventBridge |

**When to use microservices:**
- ✅ Large teams (10+ developers) needing independent deployment
- ✅ Services with very different scaling requirements
- ✅ Need for technology diversity across components
- ❌ Small teams or early-stage startups (stick with monolith)
- ❌ If you can't invest in DevOps infrastructure

🏠 **Real-world analogy:** A monolith is a **department store** — everything under one roof. Microservices are a **shopping mall** — independent shops (services) connected by hallways (APIs). Each shop can renovate (deploy), hire (scale), and specialize independently. But the mall needs management (infrastructure) to work.`,
      codeExample: `// Microservices Architecture — Patterns

// === API Gateway Pattern ===
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

function createGateway() {
  const app = express();

  // Route to service based on path
  const services = {
    "/api/users": "http://user-service:3001",
    "/api/orders": "http://order-service:3002",
    "/api/products": "http://product-service:3003",
    "/api/payments": "http://payment-service:3004",
  };

  for (const [path, target] of Object.entries(services)) {
    app.use(path, createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [\`^\${path}\`]: "" },
      onError: (err, req, res) => {
        res.status(503).json({ error: \`Service unavailable: \${path}\` });
      },
    }));
  }

  return app;
}

// === Circuit Breaker Pattern ===
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN — service unavailable");
      }
    }

    try {
      const result = await fn();

      if (this.state === "HALF_OPEN") {
        this.successCount++;
        if (this.successCount >= 3) {
          this.reset();
        }
      }

      return result;
    } catch (err) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = "OPEN";
        console.error(\`Circuit OPENED after \${this.failureCount} failures\`);
      }

      throw err;
    }
  }

  reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    console.log("Circuit CLOSED — service recovered");
  }
}

// Usage
const orderServiceBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 10000 });

async function getOrders(userId) {
  return orderServiceBreaker.execute(async () => {
    const response = await fetch(\`http://order-service:3002/orders?userId=\${userId}\`);
    if (!response.ok) throw new Error(\`Order service: \${response.status}\`);
    return response.json();
  });
}

// === Saga Pattern (Orchestration) ===
class OrderSaga {
  async execute(orderData) {
    const steps = [];
    
    try {
      // Step 1: Reserve inventory
      const reservation = await this.reserveInventory(orderData);
      steps.push({ action: "reserve", data: reservation });

      // Step 2: Process payment
      const payment = await this.processPayment(orderData);
      steps.push({ action: "payment", data: payment });

      // Step 3: Create order
      const order = await this.createOrder(orderData, reservation, payment);
      steps.push({ action: "order", data: order });

      // Step 4: Send notification
      await this.sendNotification(order);

      return order;
    } catch (err) {
      // Compensating transactions (rollback in reverse order)
      console.error("Saga failed, rolling back:", err.message);
      
      for (const step of steps.reverse()) {
        try {
          await this.compensate(step);
        } catch (compensateErr) {
          console.error(\`Compensation failed for \${step.action}:\`, compensateErr);
          // In production: send to dead letter queue for manual resolution
        }
      }

      throw err;
    }
  }

  async compensate(step) {
    switch (step.action) {
      case "reserve": return this.releaseInventory(step.data);
      case "payment": return this.refundPayment(step.data);
      case "order": return this.cancelOrder(step.data);
    }
  }

  async reserveInventory(data) { return { reservationId: "res_123" }; }
  async processPayment(data) { return { paymentId: "pay_123" }; }
  async createOrder(data, res, pay) { return { orderId: "ord_123" }; }
  async sendNotification(order) { console.log("Notification sent"); }
  async releaseInventory(data) { console.log("Inventory released"); }
  async refundPayment(data) { console.log("Payment refunded"); }
  async cancelOrder(data) { console.log("Order cancelled"); }
}

module.exports = { createGateway, CircuitBreaker, OrderSaga };`,
      exercise: `**Exercises:**
1. Design a microservice architecture for an e-commerce platform — draw the service boundaries and communication patterns
2. Implement a Circuit Breaker class with CLOSED, OPEN, and HALF_OPEN states
3. Build an API Gateway that routes requests to different backend services
4. Implement the Saga pattern for a multi-step order process with compensating transactions
5. Set up inter-service communication using both REST (synchronous) and a message queue (async)
6. Implement service health checking — the gateway routes traffic only to healthy services`,
      commonMistakes: [
        "Starting with microservices — most applications should start as a monolith and split into services when team size and complexity demand it",
        "Creating too many services — 'nano-services' add overhead without benefit; each service should represent a significant business capability",
        "Sharing databases between services — this creates tight coupling; each service should own its data and expose it via APIs",
        "Not implementing circuit breakers — when a downstream service fails, the calling service also fails; circuit breakers prevent cascading failures",
        "Using synchronous communication for everything — fire-and-forget operations (emails, notifications) should be asynchronous via message queues",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the advantages and disadvantages of microservices architecture?",
          a: "**Advantages:** (1) Independent deployment — ship faster without coordinating. (2) Technology diversity — use the best tool per service. (3) Scalability — scale hot services independently. (4) Fault isolation — one service crash doesn't bring down everything. (5) Team autonomy — teams own services end-to-end. **Disadvantages:** (1) Distributed system complexity — network failures, eventual consistency. (2) Operational overhead — need CI/CD, monitoring, service discovery per service. (3) Data consistency — transactions across services are hard (Sagas). (4) Testing complexity — integration tests across services. (5) Debugging — distributed tracing needed. **Rule:** Start monolith, split when you have 3+ teams and clear domain boundaries.",
        },
        {
          type: "coding",
          q: "Explain and implement the Circuit Breaker pattern.",
          a: "**States:** (1) **CLOSED** — requests pass through normally; failures are counted. (2) **OPEN** — after N failures, all requests fail immediately without calling the service. (3) **HALF_OPEN** — after a timeout, allow one test request; if it succeeds, close the circuit; if it fails, re-open. **Why:** Prevents cascading failures — if service B is down, service A doesn't waste resources and timeout waiting; it fails fast and can return cached/default data. **Implementation:** Track failure count and timestamps. In OPEN state, check if reset timeout has elapsed before allowing a test request.",
        },
      ],
    },
    {
      id: "message-queues",
      title: "Message Queues & Event-Driven Architecture",
      explanation: `**Message queues** decouple services by allowing them to communicate asynchronously through a broker. The sender doesn't wait for the receiver to process the message.

**Popular message brokers:**
| Broker | Strength | Use Case |
|--------|----------|----------|
| **RabbitMQ** | Flexible routing, reliability | Task queues, pub/sub |
| **Apache Kafka** | High throughput, log-based | Event streaming, analytics |
| **Redis (BullMQ)** | Simple, fast, built on Redis | Job queues, delayed tasks |
| **AWS SQS** | Managed, serverless | Cloud-native queues |

**Message queue patterns:**
1. **Point-to-Point (Queue)** — one sender, one consumer (task distribution)
2. **Pub/Sub (Topics)** — one publisher, multiple subscribers (event broadcasting)
3. **Fan-out** — one message goes to multiple queues
4. **Dead Letter Queue** — failed messages collected for manual review

**BullMQ** (Node.js job queue built on Redis):
- Priority queues
- Delayed jobs
- Job retry with backoff
- Rate limiting
- Job progress tracking
- Repeatable jobs (cron-like)
- Scheduled jobs

**When to use message queues:**
- ✅ Email/SMS sending (async, no blocking)
- ✅ Image/video processing (CPU-heavy, offload)
- ✅ Order processing (multi-step workflow)
- ✅ Data pipelines and ETL (high throughput)
- ✅ Event broadcasting to multiple services

🏠 **Real-world analogy:** A message queue is like a **post office**. You drop a letter (message) in the mailbox (queue). The postal service (broker) ensures it reaches the recipient (consumer), even if they're not home (offline). The sender doesn't wait at the door — they go about their business.`,
      codeExample: `// Message Queues with BullMQ

const { Queue, Worker, QueueScheduler } = require("bullmq");
const IORedis = require("ioredis");

// Redis connection (shared)
const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
});

// 1. Create queues
const emailQueue = new Queue("emails", { connection });
const imageQueue = new Queue("image-processing", { connection });
const orderQueue = new Queue("orders", { connection });

// 2. Add jobs to queues
async function sendWelcomeEmail(userId, email) {
  await emailQueue.add(
    "welcome-email",
    { userId, email, template: "welcome" },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 500,
    }
  );
}

async function processImage(imageUrl, options) {
  await imageQueue.add(
    "resize",
    { imageUrl, width: options.width, height: options.height },
    {
      priority: options.priority || 5,
      delay: 0,
    }
  );
}

// Delayed job (send reminder in 24 hours)
async function scheduleReminder(userId) {
  await emailQueue.add(
    "reminder",
    { userId, template: "reminder" },
    { delay: 24 * 60 * 60 * 1000 } // 24 hours
  );
}

// Repeating job (daily report)
async function setupDailyReport() {
  await emailQueue.add(
    "daily-report",
    { template: "daily-report" },
    { repeat: { pattern: "0 9 * * *" } } // Every day at 9 AM (cron)
  );
}

// 3. Process jobs (workers)
const emailWorker = new Worker(
  "emails",
  async (job) => {
    console.log(\`Processing email job \${job.id}: \${job.name}\`);
    const { email, template, userId } = job.data;

    // Update progress
    await job.updateProgress(10);

    // Simulate sending email
    // await sendEmail(email, template);
    console.log(\`Email sent to \${email} (template: \${template})\`);

    await job.updateProgress(100);
    return { sent: true, email };
  },
  {
    connection,
    concurrency: 5, // Process 5 emails simultaneously
    limiter: {
      max: 100,
      duration: 60000, // Max 100 emails per minute
    },
  }
);

const imageWorker = new Worker(
  "image-processing",
  async (job) => {
    console.log(\`Processing image: \${job.data.imageUrl}\`);
    // const result = await sharp(job.data.imageUrl)
    //   .resize(job.data.width, job.data.height)
    //   .toFile(outputPath);
    return { processed: true };
  },
  { connection, concurrency: 2 }
);

// 4. Event handling
emailWorker.on("completed", (job, result) => {
  console.log(\`Job \${job.id} completed:\`, result);
});

emailWorker.on("failed", (job, err) => {
  console.error(\`Job \${job.id} failed after \${job.attemptsMade} attempts:\`, err.message);
  // If all retries exhausted, job goes to "failed" state
  // Implement dead letter queue logic or alerting here
});

emailWorker.on("progress", (job, progress) => {
  console.log(\`Job \${job.id} progress: \${progress}%\`);
});

// 5. Flow (dependent jobs)
async function processOrderFlow(orderData) {
  // Job A: Validate order (must complete before B and C)
  // Job B: Process payment (after A)
  // Job C: Reserve inventory (after A, parallel with B)
  // Job D: Send confirmation (after B and C both complete)

  const flow = await orderQueue.add("process-order", orderData);
  return flow;
}

// 6. Graceful shutdown
async function shutdown() {
  console.log("Shutting down workers...");
  await emailWorker.close();
  await imageWorker.close();
  await connection.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

module.exports = { emailQueue, imageQueue, sendWelcomeEmail, processImage };`,
      exercise: `**Exercises:**
1. Set up BullMQ with Redis and create queues for email, image processing, and reports
2. Implement email sending with retry logic — 3 attempts with exponential backoff
3. Build an image processing pipeline with priority queues (user-uploaded = high, batch = low)
4. Implement delayed jobs — send a reminder email 24 hours after signup
5. Set up repeating jobs for daily reports and hourly health checks using cron patterns
6. Build a dashboard that shows queue health: pending, active, completed, and failed job counts`,
      commonMistakes: [
        "Processing messages without idempotency — messages may be delivered more than once; ensure processing the same message twice has no side effects",
        "Not setting up dead letter queues — failed messages disappear silently; capture them for debugging and manual retry",
        "Not limiting concurrency on workers — processing too many jobs simultaneously can overwhelm the database or external APIs",
        "Storing large payloads in job data — queues should only contain references (IDs, URLs); store the actual data in the database or object storage",
        "Not implementing graceful shutdown for workers — `worker.close()` waits for active jobs to complete; calling `process.exit()` directly loses in-progress work",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you use a message queue in a Node.js application?",
          a: "**Use cases:** (1) **Async processing** — email sending, PDF generation, image resizing; don't block the HTTP response. (2) **Load leveling** — absorb traffic spikes; queue processes at a sustainable rate. (3) **Decoupling services** — service A publishes events; services B, C, D consume independently. (4) **Retry logic** — failed operations are retried automatically with backoff. (5) **Scheduled jobs** — delayed tasks, cron-like repeating jobs. (6) **Data pipelines** — ETL processing, event streaming. **When NOT to use:** Simple synchronous request-response where the caller needs an immediate result.",
        },
        {
          type: "tricky",
          q: "What is idempotency and why is it important for message queue consumers?",
          a: "**Idempotency** means processing a message multiple times produces the same result as processing it once. This is critical because message brokers guarantee **at-least-once delivery** — a message may be delivered twice due to: consumer crash after processing but before acknowledging, network issues, broker failover. **Example:** A payment processor must check if the payment ID was already processed before charging again. **Implementation:** (1) Use unique message/job IDs. (2) Track processed IDs in database. (3) Use database upserts instead of inserts. (4) Check current state before applying changes. Without idempotency, duplicate messages cause duplicate charges, emails, or database records.",
        },
      ],
    },
    {
      id: "design-patterns",
      title: "Node.js Design Patterns",
      explanation: `**Design patterns** are proven solutions to recurring software design problems. In Node.js, certain patterns are especially important due to its asynchronous, event-driven nature.

**Essential Node.js patterns:**

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Singleton** | One instance across the app | Database connection, logger |
| **Factory** | Create objects without exposing logic | Router creation, plugin loading |
| **Observer** | React to state changes | EventEmitter, Redis Pub/Sub |
| **Strategy** | Swap algorithms at runtime | Payment processors, auth strategies |
| **Middleware** | Chain processing steps | Express middleware, validation pipeline |
| **Repository** | Abstract data access | Database queries behind an interface |
| **Dependency Injection** | Pass dependencies, don't import | Testable services, modular code |
| **Proxy** | Control access or add behavior | Caching proxy, logging proxy |

**Module pattern in Node.js:**
Every file is a module — this is the foundation of encapsulation:
\`\`\`javascript
// Only exported functions are public
module.exports = { publicFunction };
// Internal helpers stay private to the module
\`\`\`

**Dependency Injection:**
Instead of importing dependencies directly (tight coupling), pass them as parameters (loose coupling):
\`\`\`javascript
// ❌ Tight coupling
const db = require('./database');
class UserService { findUser(id) { return db.query(...) } }

// ✅ Loose coupling (dependency injection)
class UserService {
  constructor(db) { this.db = db; }
  findUser(id) { return this.db.query(...) }
}
\`\`\`

🏠 **Real-world analogy:** Design patterns are like **cooking techniques** (sautéing, braising, grilling). They're not recipes — they're reusable methods that experienced chefs (developers) apply to solve common cooking (coding) challenges. Knowing the right technique for the ingredient (problem) makes you a better chef.`,
      codeExample: `// Node.js Design Patterns

// 1. Singleton — Database Connection
class Database {
  constructor() {
    if (Database.instance) return Database.instance;
    this.connection = null;
    Database.instance = this;
  }

  async connect(uri) {
    if (!this.connection) {
      // this.connection = await mongoose.connect(uri);
      this.connection = { uri, connected: true };
      console.log("Database connected");
    }
    return this.connection;
  }

  static getInstance() {
    if (!Database.instance) new Database();
    return Database.instance;
  }
}

// 2. Factory — Service Creator
class ServiceFactory {
  static create(type, config) {
    switch (type) {
      case "email":
        return config.provider === "sendgrid"
          ? new SendGridService(config.apiKey)
          : new SMTPService(config.host, config.port);
      case "storage":
        return config.provider === "s3"
          ? new S3Storage(config.bucket)
          : new LocalStorage(config.path);
      default:
        throw new Error(\`Unknown service type: \${type}\`);
    }
  }
}

// 3. Strategy — Payment Processing
class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async processPayment(amount, details) {
    return this.strategy.charge(amount, details);
  }
}

class StripeStrategy {
  async charge(amount, details) {
    console.log(\`Charging \$\${amount} via Stripe\`);
    return { provider: "stripe", transactionId: "txn_123" };
  }
}

class PayPalStrategy {
  async charge(amount, details) {
    console.log(\`Charging \$\${amount} via PayPal\`);
    return { provider: "paypal", transactionId: "pp_456" };
  }
}

// Usage
const processor = new PaymentProcessor(new StripeStrategy());
// processor.processPayment(99.99, { card: "..." });
// Switch strategy at runtime:
// processor.setStrategy(new PayPalStrategy());

// 4. Repository — Data Access Abstraction
class UserRepository {
  constructor(db) { this.db = db; }

  async findById(id) {
    // return this.db.collection("users").findOne({ _id: id });
    return { id, name: "Alice" };
  }

  async findByEmail(email) {
    // return this.db.collection("users").findOne({ email });
    return null;
  }

  async create(userData) {
    // const result = await this.db.collection("users").insertOne(userData);
    return { id: Date.now(), ...userData };
  }

  async update(id, data) {
    // return this.db.collection("users").updateOne({ _id: id }, { $set: data });
    return { id, ...data };
  }

  async delete(id) {
    // return this.db.collection("users").deleteOne({ _id: id });
    return true;
  }
}

// 5. Dependency Injection Container
class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  register(name, factory, singleton = false) {
    this.services.set(name, { factory, singleton });
  }

  resolve(name) {
    const service = this.services.get(name);
    if (!service) throw new Error(\`Service "\${name}" not registered\`);

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this));
      }
      return this.singletons.get(name);
    }

    return service.factory(this);
  }
}

// Usage
const container = new Container();
container.register("db", () => Database.getInstance(), true);
container.register("userRepo", (c) => new UserRepository(c.resolve("db")), true);
container.register("paymentProcessor", () => new PaymentProcessor(new StripeStrategy()));

const userRepo = container.resolve("userRepo");
const payments = container.resolve("paymentProcessor");

// Mock classes for examples
class SendGridService { constructor(key) { this.key = key; } }
class SMTPService { constructor(host, port) { this.host = host; } }
class S3Storage { constructor(bucket) { this.bucket = bucket; } }
class LocalStorage { constructor(path) { this.path = path; } }

module.exports = { Database, ServiceFactory, PaymentProcessor, UserRepository, Container };`,
      exercise: `**Exercises:**
1. Implement the Singleton pattern for a database connection and a logger
2. Build a Factory that creates different notification services (email, SMS, push) based on configuration
3. Implement the Strategy pattern for a payment system with 3+ payment providers
4. Create a Repository layer that abstracts database operations — swap between MongoDB and PostgreSQL
5. Build a simple Dependency Injection container that supports registration, singleton, and resolution
6. Refactor an Express app to use DI — all services receive dependencies via constructors`,
      commonMistakes: [
        "Overusing the Singleton pattern — not everything should be a singleton; it makes testing harder because state is shared",
        "Using design patterns for the sake of using them — patterns solve specific problems; don't add a Factory when a simple function will do",
        "Not using Dependency Injection for services — direct imports create tight coupling and make unit testing impossible without module mocking",
        "Mixing business logic with infrastructure — services should not know about Express, HTTP, or databases directly; use abstractions",
        "Creating god objects/services — one class doing everything violates Single Responsibility; split into focused, composable classes",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What design patterns are commonly used in Node.js applications?",
          a: "**Most common:** (1) **Module pattern** — every file is a module with private scope; exports define the public API. (2) **Middleware** — Express's core pattern; chain functions that process requests sequentially. (3) **Observer/EventEmitter** — built into Node.js core; used for event-driven architecture. (4) **Singleton** — database connections, loggers, config objects. (5) **Repository** — abstract data access behind a consistent interface. (6) **Factory** — create services based on configuration (strategy switching). (7) **Dependency Injection** — pass dependencies via constructors for testability and loose coupling. (8) **Strategy** — swap algorithms at runtime (payment providers, auth strategies).",
        },
        {
          type: "scenario",
          q: "How would you design a plugin system for a Node.js application?",
          a: "**Architecture:** (1) Define a **Plugin interface** — `{ name, version, init(app), destroy() }`. (2) **Plugin registry** — a Map that stores registered plugins. (3) **Dynamic loading** — use `require()` or `import()` to load plugins from a directory. (4) **Hook system** — extend EventEmitter; plugins register hooks for lifecycle events (`beforeRequest`, `afterResponse`). (5) **Dependency resolution** — plugins declare dependencies on other plugins; load in dependency order. (6) **Isolation** — each plugin gets a scoped context, not the full app. **Example:** Express middleware IS a plugin system. Webpack, Babel, and ESLint also use this pattern. Key: define clear contracts and lifecycle hooks.",
        },
      ],
    },
  ],
};

export default nodePhase13;
