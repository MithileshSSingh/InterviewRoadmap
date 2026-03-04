const nodePhase7 = {
  id: "phase-7",
  title: "Phase 7: Databases & ORMs",
  emoji: "🗄️",
  description:
    "Connect Node.js to databases — MongoDB with Mongoose, PostgreSQL with Prisma, Redis for caching, and database migration strategies.",
  topics: [
    {
      id: "mongodb-mongoose",
      title: "MongoDB & Mongoose",
      explanation: `**MongoDB** is a NoSQL document database that stores data as JSON-like documents (BSON). **Mongoose** is the most popular ODM (Object Document Mapper) for MongoDB in Node.js.

**Why MongoDB for Node.js?**
- Documents are JSON-like — natural fit for JavaScript
- Flexible schema — great for rapid development and evolving data models
- Horizontal scaling with sharding
- Aggregation pipeline for complex queries

**Mongoose key concepts:**
1. **Schema** — Defines document structure, types, validation, defaults
2. **Model** — Compiled schema → constructor for creating/querying documents
3. **Document** — An instance of a Model (a single database record)
4. **Middleware (hooks)** — pre/post hooks for save, validate, remove, find

**Schema types:**
\`String\`, \`Number\`, \`Boolean\`, \`Date\`, \`Buffer\`, \`ObjectId\`, \`Array\`, \`Map\`, \`Mixed\`

**Connection patterns:**
- **Single connection** — \`mongoose.connect(uri)\` — most apps
- **Connection pooling** — Mongoose maintains a pool internally (default 5)
- **Multiple connections** — \`mongoose.createConnection(uri)\` — multi-database

🏠 **Real-world analogy:** MongoDB is a **filing cabinet** where each drawer (collection) holds folders (documents). Unlike SQL's rigid spreadsheets, each folder can have different contents. Mongoose is the **secretary** who enforces filing rules (schema) and retrieves documents for you.`,
      codeExample: `// MongoDB with Mongoose — Complete Setup

const mongoose = require("mongoose");

// 1. Connection with best practices
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/myapp", {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

// Connection events
mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));
mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected"));

// 2. Schema definition with validation
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't include in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    profile: {
      bio: { type: String, maxlength: 500 },
      avatar: String,
      social: {
        twitter: String,
        github: String,
      },
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isActive: { type: Boolean, default: true },
    loginCount: { type: Number, default: 0 },
    lastLogin: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 3. Virtual fields (computed, not stored in DB)
userSchema.virtual("displayName").get(function () {
  return this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

// 4. Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = require("bcryptjs");
  return bcrypt.compare(candidatePassword, this.password);
};

// 5. Static methods (on the Model)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true }).sort("-createdAt");
};

// 6. Middleware (hooks)
userSchema.pre("save", async function (next) {
  // Hash password before saving
  if (this.isModified("password")) {
    const bcrypt = require("bcryptjs");
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// 7. Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: "text", "profile.bio": "text" }); // Text search
userSchema.index({ createdAt: -1 }); // Sort optimization

// 8. Create model
const User = mongoose.model("User", userSchema);

// 9. CRUD Operations
async function userCrudExamples() {
  // CREATE
  const user = await User.create({
    name: "Alice",
    email: "alice@example.com",
    password: "securepass123",
  });

  // READ
  const allUsers = await User.find({ isActive: true })
    .select("name email role")
    .sort("-createdAt")
    .limit(10)
    .lean(); // Returns plain objects (faster)

  const singleUser = await User.findById(user._id);
  const byEmail = await User.findByEmail("alice@example.com");

  // UPDATE
  await User.findByIdAndUpdate(
    user._id,
    { $set: { role: "admin" }, $inc: { loginCount: 1 } },
    { new: true, runValidators: true }
  );

  // DELETE
  await User.findByIdAndDelete(user._id);

  // Aggregation
  const stats = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$role", count: { $sum: 1 }, avgLogins: { $avg: "$loginCount" } } },
    { $sort: { count: -1 } },
  ]);

  // Population (join-like)
  const userWithPosts = await User.findById(user._id).populate("posts");
}

module.exports = { User, connectDB };`,
      exercise: `**Exercises:**
1. Design a Mongoose schema for a blog with Users, Posts, and Comments — include validation and relationships
2. Implement CRUD operations with proper error handling for a "Product" model
3. Add pre-save middleware to hash passwords and post-save middleware to send welcome emails
4. Use the Aggregation Pipeline to generate analytics: posts per user, average comment count, etc.
5. Implement pagination with \`.skip()\` and \`.limit()\` — then compare with cursor-based pagination
6. Add text indexes and implement full-text search across multiple fields`,
      commonMistakes: [
        "Not handling `mongoose.connect()` errors — a failed connection should crash the app at startup, not silently fail",
        "Using `findOne()` without awaiting — Mongoose queries return thenables, not Promises; always `await` or call `.exec()`",
        "Not using `.lean()` for read-only queries — without it, Mongoose wraps results in full document instances, wasting memory",
        "Forgetting `{ new: true }` in `findByIdAndUpdate` — without it, the method returns the OLD document before the update",
        "Not adding indexes for frequently queried fields — unindexed queries do full collection scans, which are extremely slow at scale",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between embedding and referencing in MongoDB?",
          a: "**Embedding** stores related data inside the parent document (denormalized): `{ user: { name, address: { street, city } } }`. **Referencing** stores an ObjectId pointer to another collection (normalized): `{ user: { name, addressId: ObjectId('...') } }`. **Use embedding when:** (1) data is always fetched together, (2) data doesn't change independently, (3) document size < 16MB. **Use referencing when:** (1) data is shared across documents, (2) data grows unbounded (comments, logs), (3) you need to query the sub-data independently. Most real apps use both — embed small, stable data; reference large, shared data.",
        },
        {
          type: "tricky",
          q: "How do you handle transactions in MongoDB with Mongoose?",
          a: "MongoDB supports **multi-document ACID transactions** (since 4.0) using sessions: ```js\nconst session = await mongoose.startSession();\ntry {\n  session.startTransaction();\n  const user = await User.create([{ name: 'Alice' }], { session });\n  await Account.create([{ userId: user[0]._id, balance: 0 }], { session });\n  await session.commitTransaction();\n} catch (err) {\n  await session.abortTransaction();\n  throw err;\n} finally {\n  session.endSession();\n}\n``` Key: pass `{ session }` to every operation. Transactions require a **replica set** (not standalone). For single-document operations, MongoDB is already atomic — transactions are only needed for multi-document consistency.",
        },
      ],
    },
    {
      id: "postgresql-prisma",
      title: "PostgreSQL & Prisma ORM",
      explanation: `**PostgreSQL** is the most advanced open-source relational database, and **Prisma** is a modern, type-safe ORM for Node.js/TypeScript that replaces traditional ORMs like Sequelize.

**Why PostgreSQL?**
- ACID transactions for data integrity
- Complex joins, aggregations, and window functions
- JSON/JSONB columns for flexible data
- Full-text search built-in
- Time-tested reliability at scale

**Why Prisma over Sequelize/TypeORM?**
| Feature | Prisma | Sequelize |
|---------|--------|-----------|
| Schema definition | \`.prisma\` file (declarative) | JavaScript models |
| Type safety | Auto-generated TypeScript types | Manual typing |
| Migrations | Auto-generated, versioned | Manual or auto |
| Query API | Intuitive, chainable | String-based in complex queries |
| Relations | Declarative in schema | Configured in models |
| Learning curve | Low | Medium-high |

**Prisma workflow:**
1. Define schema in \`schema.prisma\`
2. Run \`npx prisma migrate dev\` to create/update database tables
3. Run \`npx prisma generate\` to generate the TypeScript client
4. Use \`PrismaClient\` in your app for type-safe queries

🏠 **Real-world analogy:** If MongoDB is a **filing cabinet** (flexible, documents), PostgreSQL is a **spreadsheet application** (structured, relational). Prisma is the **smart assistant** who writes your SQL queries for you and ensures every formula (type) is correct.`,
      codeExample: `// PostgreSQL with Prisma — Complete Guide

// === schema.prisma ===
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }
//
// generator client {
//   provider = "prisma-client-js"
// }
//
// model User {
//   id        Int       @id @default(autoincrement())
//   email     String    @unique
//   name      String
//   password  String
//   role      Role      @default(USER)
//   posts     Post[]
//   profile   Profile?
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
//
//   @@index([email])
//   @@map("users")
// }
//
// model Post {
//   id        Int       @id @default(autoincrement())
//   title     String
//   content   String?
//   published Boolean   @default(false)
//   author    User      @relation(fields: [authorId], references: [id])
//   authorId  Int
//   tags      Tag[]
//   createdAt DateTime  @default(now())
//
//   @@index([authorId])
//   @@map("posts")
// }
//
// model Profile {
//   id     Int    @id @default(autoincrement())
//   bio    String?
//   avatar String?
//   user   User   @relation(fields: [userId], references: [id])
//   userId Int    @unique
// }
//
// model Tag {
//   id    Int    @id @default(autoincrement())
//   name  String @unique
//   posts Post[]
// }
//
// enum Role {
//   USER
//   ADMIN
//   MODERATOR
// }

// === src/db.js — Prisma Client Singleton ===
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;

// === Usage: CRUD Operations ===
const prisma2 = require("./db");

async function prismaExamples() {
  // CREATE
  const user = await prisma2.user.create({
    data: {
      name: "Alice",
      email: "alice@example.com",
      password: "hashed_password",
      profile: {
        create: { bio: "Node.js developer" },
      },
    },
    include: { profile: true },
  });

  // READ with relations
  const userWithPosts = await prisma2.user.findUnique({
    where: { id: 1 },
    include: {
      posts: { where: { published: true }, orderBy: { createdAt: "desc" } },
      profile: true,
    },
  });

  // Pagination
  const users = await prisma2.user.findMany({
    where: { role: "USER" },
    skip: 0,
    take: 10,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true },
  });

  // UPDATE
  const updated = await prisma2.user.update({
    where: { id: 1 },
    data: { name: "Alice Updated" },
  });

  // DELETE
  await prisma2.user.delete({ where: { id: 1 } });

  // Transaction
  const [newUser, newPost] = await prisma2.$transaction([
    prisma2.user.create({ data: { name: "Bob", email: "bob@example.com", password: "hash" } }),
    prisma2.post.create({ data: { title: "Hello", content: "World", authorId: 1 } }),
  ]);

  // Aggregation
  const stats = await prisma2.user.groupBy({
    by: ["role"],
    _count: { _all: true },
    _avg: { id: true },
  });

  // Raw SQL (escape hatch)
  const result = await prisma2.$queryRaw\`
    SELECT u.name, COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON p."authorId" = u.id
    GROUP BY u.name
    ORDER BY post_count DESC
  \`;
}`,
      exercise: `**Exercises:**
1. Create a Prisma schema for an e-commerce app with Users, Products, Orders, and OrderItems
2. Implement CRUD operations for all models with proper relation handling
3. Write a transaction that creates an order and updates product stock atomically
4. Set up Prisma migrations — create, modify, and roll back schema changes
5. Implement cursor-based pagination for a high-volume posts endpoint
6. Compare query performance: Prisma generated queries vs raw SQL for complex aggregations`,
      commonMistakes: [
        "Not creating a Prisma Client singleton — instantiating `new PrismaClient()` per request exhausts database connections",
        "Forgetting to call `prisma.$disconnect()` on shutdown — open connections prevent the process from exiting cleanly",
        "Using N+1 queries — fetching users then looping to fetch each user's posts; use `include` for eager loading",
        "Not running `prisma generate` after schema changes — the client won't have the updated types until regenerated",
        "Ignoring migration drift — always use `prisma migrate dev` in development and `prisma migrate deploy` in production",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you choose PostgreSQL over MongoDB for a Node.js application?",
          a: "**Choose PostgreSQL when:** (1) Data has **clear relationships** (users → orders → products). (2) You need **ACID transactions** for financial or critical data. (3) Complex **joins and aggregations** are required. (4) Data structure is **well-defined and stable**. (5) You need **strong consistency**. **Choose MongoDB when:** (1) Flexible, evolving schemas (prototyping, content management). (2) Hierarchical/document-shaped data. (3) Horizontal scaling with auto-sharding. (4) Event sourcing or logging (append-heavy). **Trend:** PostgreSQL with JSONB columns can handle both relational and document-style data, making it increasingly versatile.",
        },
        {
          type: "scenario",
          q: "How do you handle database connection pooling in a Node.js application?",
          a: "**Connection pooling** reuses a fixed set of database connections rather than opening/closing per query. In **Prisma**, it's automatic with configurable `connection_limit` in the DATABASE_URL: `postgresql://...?connection_limit=10`. In **Mongoose**, set `maxPoolSize` in connect options. **Best practices:** (1) Pool size = `(CPU cores * 2) + effective_disk_spindles` (~10-20 for most apps). (2) Create a **singleton** client shared across the app. (3) **Close connections** on shutdown. (4) Monitor active/idle connections. (5) In serverless (Lambda), use connection pooling services like PgBouncer or Prisma Data Proxy to prevent connection exhaustion.",
        },
      ],
    },
    {
      id: "redis-caching",
      title: "Redis & Caching Strategies",
      explanation: `**Redis** is an in-memory data structure store used as a cache, message broker, and session store. It's the most popular caching solution for Node.js applications.

**Why Redis?**
- **Sub-millisecond latency** — data is in memory
- **Rich data structures** — strings, hashes, lists, sets, sorted sets, streams
- **Persistence options** — RDB snapshots, AOF (append-only file)
- **Pub/Sub** — real-time messaging between services
- **TTL (Time-To-Live)** — automatic key expiration

**Common caching patterns:**

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Cache-Aside** | App checks cache first, loads from DB on miss | Most common, simple |
| **Write-Through** | Write to cache AND DB simultaneously | Strong consistency |
| **Write-Behind** | Write to cache, async write to DB | High write throughput |
| **Read-Through** | Cache handles DB loading on miss | Transparent to app |

**Cache invalidation strategies:**
- **TTL-based** — keys expire automatically (simplest)
- **Event-based** — invalidate on write/update events
- **Version-based** — include version in cache key, change version to invalidate

🏠 **Real-world analogy:** Redis is like a **whiteboard** next to your desk. When someone asks a question (query), you check the whiteboard first (cache). If the answer is there, instant response (cache hit). If not, you look it up in the filing cabinet (database), answer the question, and write it on the whiteboard for next time (cache set).`,
      codeExample: `// Redis & Caching — Production Patterns

const Redis = require("ioredis");

// 1. Redis connection with retry
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

// 2. Cache-Aside pattern (most common)
async function getUserWithCache(userId) {
  const cacheKey = \`user:\${userId}\`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("Cache HIT");
    return JSON.parse(cached);
  }

  // Cache miss — fetch from database
  console.log("Cache MISS");
  // const user = await db.user.findById(userId);
  const user = { id: userId, name: "Alice", email: "alice@example.com" }; // Mock

  // Store in cache with TTL (5 minutes)
  await redis.set(cacheKey, JSON.stringify(user), "EX", 300);

  return user;
}

// 3. Cache middleware for Express
function cacheMiddleware(ttlSeconds = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    const cacheKey = \`cache:\${req.originalUrl}\`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error("Cache read error:", err.message);
    }

    // Store original res.json to intercept
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Cache the response
      redis.set(cacheKey, JSON.stringify(data), "EX", ttlSeconds).catch(console.error);
      return originalJson(data);
    };

    next();
  };
}

// 4. Cache invalidation on write
async function updateUser(userId, data) {
  // Update database
  // const user = await db.user.update(userId, data);
  const user = { id: userId, ...data };

  // Invalidate cache
  await redis.del(\`user:\${userId}\`);

  // Also invalidate list caches
  const keys = await redis.keys("cache:/api/users*");
  if (keys.length > 0) await redis.del(...keys);

  return user;
}

// 5. Rate limiting with Redis
async function checkRateLimit(clientId, maxRequests = 100, windowSeconds = 60) {
  const key = \`ratelimit:\${clientId}\`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  return {
    allowed: current <= maxRequests,
    remaining: Math.max(0, maxRequests - current),
    resetIn: await redis.ttl(key),
  };
}

// 6. Session storage with Redis
async function sessionExample() {
  const sessionId = "sess_abc123";
  const sessionData = {
    userId: 1,
    role: "admin",
    loginTime: Date.now(),
  };

  // Store session (24 hour TTL)
  await redis.set(\`session:\${sessionId}\`, JSON.stringify(sessionData), "EX", 86400);

  // Retrieve session
  const session = JSON.parse(await redis.get(\`session:\${sessionId}\`));

  // Extend session on activity
  await redis.expire(\`session:\${sessionId}\`, 86400);

  // Destroy session (logout)
  await redis.del(\`session:\${sessionId}\`);
}

// 7. Pub/Sub for real-time events
async function pubSubExample() {
  const subscriber = redis.duplicate();

  subscriber.subscribe("notifications", (err) => {
    if (err) console.error("Subscribe error:", err);
  });

  subscriber.on("message", (channel, message) => {
    console.log(\`[\${channel}] \${message}\`);
  });

  // Publish from another part of the app
  await redis.publish("notifications", JSON.stringify({
    type: "order_placed",
    orderId: 123,
  }));
}

module.exports = { redis, cacheMiddleware, checkRateLimit };`,
      exercise: `**Exercises:**
1. Implement Cache-Aside pattern for a REST API — cache GET responses, invalidate on POST/PUT/DELETE
2. Build Express middleware that caches API responses in Redis with configurable TTL
3. Implement rate limiting with Redis — sliding window counter per IP address
4. Create a session management system using Redis with automatic expiration
5. Build a leaderboard using Redis sorted sets (\`ZADD\`, \`ZRANGE\`, \`ZRANK\`)
6. Implement Pub/Sub for a real-time notification system across multiple server instances`,
      commonMistakes: [
        "Caching everything without a TTL — stale data accumulates and Redis runs out of memory; always set expiration",
        "Not handling Redis connection failures gracefully — the app should work (slower) even if Redis is down; wrap cache operations in try/catch",
        "Using `KEYS` command in production — it blocks Redis and scans all keys; use `SCAN` for production-safe iteration",
        "Storing large objects in Redis — Redis is for fast, small data; store large blobs in the filesystem or object storage",
        "Not using connection pooling — create one Redis client instance and share it across the app; don't create one per request",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the Cache-Aside pattern and when to use it.",
          a: "**Cache-Aside (Lazy Loading):** (1) Application checks cache on read. (2) **Hit** → return cached data. (3) **Miss** → fetch from database, store in cache, return data. (4) On write → update database AND invalidate/delete cache entry. **Pros:** Only caches what's actually requested (no wasted memory), simple to implement. **Cons:** First request is always slow (cold cache), potential for stale data between write and invalidation. **When to use:** Most common pattern; suitable when reads >> writes and eventual consistency is acceptable. **When to avoid:** Real-time financial data or systems requiring strong consistency.",
        },
        {
          type: "scenario",
          q: "How would you handle cache invalidation in a distributed system?",
          a: "**Strategies:** (1) **TTL-based** — simplest; set cache expiry; accept staleness. (2) **Event-driven** — use Redis Pub/Sub or message queues to broadcast invalidation events to all server instances. (3) **Write-through cache** — write to cache AND database simultaneously; cache always has latest data. (4) **Versioned keys** — include a version number in cache keys (`user:42:v3`); increment version on updates. (5) **Cache-busting tags** — associate cached data with \"tags\" and invalidate all entries with a given tag. **The two hardest problems in CS:** naming things, cache invalidation, and off-by-one errors.",
        },
      ],
    },
    {
      id: "database-migrations",
      title: "Database Migrations & Best Practices",
      explanation: `**Database migrations** are version-controlled changes to your database schema. They ensure every environment (development, staging, production) has the same database structure.

**Why migrations matter:**
- Track schema changes in version control (Git)
- Apply changes consistently across environments
- Enable rollbacks when deployments fail
- Document the evolution of your data model

**Migration workflow:**
\`\`\`
1. Modify schema definition (Prisma) or create migration file
2. Generate migration: npx prisma migrate dev --name add_user_bio
3. Review the generated SQL
4. Apply to local database: automatic in dev, manual in production
5. Deploy: npx prisma migrate deploy (production)
\`\`\`

**Prisma migration commands:**
| Command | Purpose | Environment |
|---------|---------|-------------|
| \`prisma migrate dev\` | Create + apply migration | Development |
| \`prisma migrate deploy\` | Apply pending migrations | Production/CI |
| \`prisma migrate reset\` | Reset database + apply all | Development |
| \`prisma migrate status\` | Show migration status | Any |

**Best practices:**
1. **Never edit applied migrations** — create new ones that fix issues
2. **Small, focused migrations** — one concern per migration
3. **Test rollbacks** — can you undo this migration safely?
4. **Data migrations** — separate from schema migrations; run as scripts
5. **Zero-downtime migrations** — add nullable columns, backfill data, then add constraints
6. **Backup before production migrations** — always have a rollback plan

🏠 **Real-world analogy:** Database migrations are like **renovation blueprints** for a building. Each blueprint (migration) documents a specific change. You apply them in order, and if something goes wrong, you have the old blueprints to revert. Never tear down a wall (drop a column) without a new blueprint.`,
      codeExample: `// Database Migrations & Best Practices

// === Prisma Migration Workflow ===

// Step 1: Modify schema.prisma
// model User {
//   id    Int    @id @default(autoincrement())
//   email String @unique
//   name  String
//   bio   String?          // ← NEW: Added bio field
//   role  Role   @default(USER)  // ← NEW: Added role enum
// }

// Step 2: Create migration
// $ npx prisma migrate dev --name add_user_bio_and_role
// Creates: prisma/migrations/20240115120000_add_user_bio_and_role/migration.sql

// === Generated SQL (for reference) ===
// ALTER TABLE "users" ADD COLUMN "bio" TEXT;
// CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');
// ALTER TABLE "users" ADD COLUMN "role" "Role" DEFAULT 'USER';

// === Zero-Downtime Migration Strategy ===
// Phase 1: Add column (nullable, no constraint change)
// Phase 2: Backfill data in batches
// Phase 3: Add constraint / set NOT NULL

// Data migration script (run separately from schema migration)
async function backfillUserRoles(prisma) {
  const BATCH_SIZE = 1000;
  let processed = 0;

  while (true) {
    const users = await prisma.user.findMany({
      where: { role: null },
      take: BATCH_SIZE,
      select: { id: true },
    });

    if (users.length === 0) break;

    await prisma.user.updateMany({
      where: { id: { in: users.map((u) => u.id) } },
      data: { role: "USER" },
    });

    processed += users.length;
    console.log(\`Backfilled \${processed} users\`);
  }

  console.log(\`Backfill complete: \${processed} total\`);
}

// === Knex.js Migration Example (alternative to Prisma) ===

// Migration file: 20240115_create_users.js
const knexMigration = {
  up: async function (knex) {
    // Create table
    await knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable().unique();
      table.string("name").notNullable();
      table.string("password").notNullable();
      table.enum("role", ["user", "admin", "moderator"]).defaultTo("user");
      table.text("bio");
      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true); // created_at, updated_at
    });

    // Add indexes
    await knex.schema.alterTable("users", (table) => {
      table.index(["email"]);
      table.index(["is_active", "created_at"]);
    });
  },

  down: async function (knex) {
    await knex.schema.dropTableIfExists("users");
  },
};

// Seed file: seed_users.js
async function seedUsers(knex) {
  await knex("users").del(); // Clear existing

  await knex("users").insert([
    { name: "Alice Admin", email: "alice@example.com", password: "hashed", role: "admin" },
    { name: "Bob User", email: "bob@example.com", password: "hashed", role: "user" },
  ]);
}

// === Connection String Patterns ===
const connectionPatterns = {
  // Local development
  development: "postgresql://postgres:password@localhost:5432/myapp_dev",

  // Docker Compose
  docker: "postgresql://postgres:password@db:5432/myapp",

  // Production (with SSL + connection pooling)
  production: "postgresql://user:pass@host:5432/myapp?sslmode=require&connection_limit=10",

  // MongoDB
  mongodb: "mongodb://user:pass@host:27017/myapp?retryWrites=true&w=majority",

  // Redis
  redis: "redis://:password@host:6379/0",
};

module.exports = { backfillUserRoles, connectionPatterns };`,
      exercise: `**Exercises:**
1. Create a Prisma migration that adds a new table with relationships to existing tables
2. Write a data migration script that backfills a new column in batches of 1000 records
3. Implement a zero-downtime migration: add a nullable column, backfill, then set NOT NULL
4. Create a seed script that populates the database with realistic test data
5. Simulate a failed migration and practice rolling back safely
6. Set up a migration pipeline: run migrations in CI before deploying the application`,
      commonMistakes: [
        "Running destructive migrations (DROP COLUMN, DROP TABLE) without backup — always have a rollback plan and database backup",
        "Editing already-applied migrations — this causes drift between environments; create new migrations to fix issues",
        "Running large data migrations in a single transaction — this locks the table; batch updates in chunks",
        "Not testing migrations with production-like data volumes — a migration that takes 2 seconds on 100 rows may take 2 hours on 10M rows",
        "Skipping rolling back non-backward-compatible changes — if you rename a column, the old code can't work; deploy new code first, then migrate",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "How do you perform zero-downtime database migrations?",
          a: "**Three-phase approach:** (1) **Expand** — Add new columns/tables as nullable, add new indexes. Old code still works. (2) **Migrate** — Deploy new code that writes to both old and new structures. Backfill existing data in batches. (3) **Contract** — Once all data is migrated and verified, drop old columns/tables, add NOT NULL constraints. **Example (renaming a column):** Phase 1: Add new column. Phase 2: Code writes to both, read from new with fallback to old. Backfill. Phase 3: Drop old column. Each phase is a separate deployment, so rollback is always possible.",
        },
        {
          type: "conceptual",
          q: "What is the difference between schema migrations and data migrations?",
          a: "**Schema migrations** change the database structure: CREATE TABLE, ALTER TABLE, ADD COLUMN, ADD INDEX. They're managed by migration tools (Prisma, Knex, Sequelize). **Data migrations** change the actual data: backfilling a new column, transforming existing values, merging records. They should be **separate scripts**, not mixed with schema migrations. **Why separate?** (1) Data migrations may be slow and need batching. (2) They may need rollback logic independent of schema changes. (3) They can be run multiple times safely (idempotent). (4) They don't need the migration tool's transaction/locking behavior.",
        },
      ],
    },
  ],
};

export default nodePhase7;
