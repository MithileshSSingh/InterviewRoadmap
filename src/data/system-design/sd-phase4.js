const sdPhase4 = {
  id: "phase-4",
  title: "Phase 4: Databases & Storage",
  emoji: "🗄️",
  description:
    "Understand SQL vs NoSQL, indexing strategies, data modeling, and how to choose the right database for your system's access patterns and scale requirements.",
  topics: [
    {
      id: "sd-sql-vs-nosql",
      title: "SQL vs NoSQL Databases",
      explanation: `One of the most critical decisions in system design is choosing between **SQL (relational)** and **NoSQL (non-relational)** databases. There's no universally "better" option — the choice depends entirely on your data model, access patterns, and scale requirements.

## SQL (Relational) Databases

SQL databases store data in **tables with rows and columns**, connected through **foreign keys** and queried with **SQL (Structured Query Language)**.

**Examples**: PostgreSQL, MySQL, SQLite, Oracle, SQL Server

**Strengths**:
- **ACID transactions** — Atomicity, Consistency, Isolation, Durability
- **Complex queries** — JOINs, subqueries, aggregations, window functions
- **Data integrity** — Foreign keys, constraints, triggers
- **Mature ecosystem** — 40+ years of optimization, tooling, and expertise

**Weaknesses**:
- **Vertical scaling** is the primary option (bigger server)
- **Rigid schema** — schema changes on large tables can be slow/risky
- **Horizontal scaling** is possible but complex (sharding)

## NoSQL Database Types

| Type | Data Model | Examples | Best For |
|------|-----------|----------|----------|
| **Document** | JSON-like documents | MongoDB, CouchDB | Flexible schemas, content management |
| **Key-Value** | Simple key → value pairs | Redis, DynamoDB | Caching, session storage, high-speed lookups |
| **Wide-Column** | Row key → columns (grouped in families) | Cassandra, HBase | Time series, IoT, write-heavy workloads |
| **Graph** | Nodes and edges | Neo4j, Amazon Neptune | Social networks, recommendations, fraud detection |

## Decision Framework

| Criteria | Choose SQL | Choose NoSQL |
|----------|-----------|-------------|
| **Data relationships** | Complex, many-to-many | Simple, denormalized |
| **Schema** | Well-defined, stable | Evolving, flexible |
| **Transactions** | ACID required | Eventual consistency OK |
| **Scale pattern** | Moderate scale, complex queries | Massive scale, simple queries |
| **Access pattern** | Ad-hoc queries, reports | Known access patterns, key-based lookups |
| **Examples** | Banking, ERP, inventory | Social feeds, IoT, content, real-time analytics |

## The Polyglot Persistence Approach

Modern systems often use **multiple databases**, each optimized for its task:
- **PostgreSQL** for user accounts and transactions (ACID needed)
- **Redis** for caching and sessions (speed needed)
- **Elasticsearch** for full-text search (search functionality)
- **Cassandra** for event logs and time-series data (write-heavy)
- **Neo4j** for social graph queries (relationship traversal)

> **Pro tip**: In interviews, saying "I'd use PostgreSQL for X because we need ACID transactions, and Cassandra for Y because it's write-heavy with 100K events/sec" shows much more maturity than picking one database for everything.`,
      codeExample: `// ============================================
// SQL vs NoSQL — Practical Comparison
// ============================================

// ---------- SQL: Relational Data Model ----------

// Schema definition (PostgreSQL)
const sqlSchema = \`
  -- Users table
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Posts table (related to users)
  CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Tags (many-to-many with posts)
  CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
  );

  CREATE TABLE post_tags (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
  );

  -- Index for common queries
  CREATE INDEX idx_posts_user_id ON posts(user_id);
  CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
\`;

// ✅ SQL excels at complex queries with JOINs
const complexQuery = \`
  -- "Get top 10 most active users with their post count and latest post"
  SELECT
    u.id,
    u.name,
    COUNT(p.id) as post_count,
    MAX(p.created_at) as latest_post_at,
    ARRAY_AGG(DISTINCT t.name) as tags_used
  FROM users u
  JOIN posts p ON p.user_id = u.id
  LEFT JOIN post_tags pt ON pt.post_id = p.id
  LEFT JOIN tags t ON t.id = pt.tag_id
  WHERE p.published = true
  GROUP BY u.id, u.name
  ORDER BY post_count DESC
  LIMIT 10;
\`;

// ---------- NoSQL: Document Model (MongoDB) ----------

// Same data in MongoDB — single document, no JOINs needed
const mongoDocument = {
  _id: "user_123",
  name: "Jane Doe",
  email: "jane@example.com",
  createdAt: new Date("2024-01-15"),
  posts: [
    {
      _id: "post_456",
      title: "My First Post",
      content: "Hello world!",
      published: true,
      tags: ["javascript", "tutorial"],     // Embedded, no separate table
      createdAt: new Date("2024-01-20"),
      stats: {
        views: 1500,
        likes: 42,
        comments: 7,
      },
    },
    // More posts embedded in the user document
  ],
  profile: {
    bio: "Software Engineer",
    avatar: "cdn.com/jane.jpg",
    socialLinks: {
      twitter: "@jane",
      github: "janedoe",
    },
  },
};

// ❌ MongoDB struggles with: "Find all posts tagged 'javascript'
// across ALL users, sorted by likes"
// This requires scanning every user document — very slow!

// ✅ MongoDB excels at: "Get user profile with all their posts"
// Single document read — no JOINs, extremely fast!

// ---------- Key-Value Store (Redis) ----------

// Perfect for caching, sessions, and counters
async function redisPatterns(redis) {
  // Session storage
  await redis.set('session:abc123', JSON.stringify({
    userId: 'user_123',
    role: 'admin',
    loginAt: Date.now(),
  }), 'EX', 3600); // Expires in 1 hour

  // Counters (atomic increment)
  await redis.incr('page:home:views');        // Increment view counter
  await redis.incrby('user:123:score', 10);   // Add 10 points

  // Leaderboard (sorted set)
  await redis.zadd('leaderboard', 1500, 'player_a');
  await redis.zadd('leaderboard', 2300, 'player_b');
  await redis.zadd('leaderboard', 1800, 'player_c');

  // Get top 10 players
  const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
  // Returns: ['player_b', '2300', 'player_c', '1800', 'player_a', '1500']

  // Rate limiting (sliding window)
  const key = 'ratelimit:user_123';
  const now = Date.now();
  await redis.zadd(key, now, \`\\\${now}\`);
  await redis.zremrangebyscore(key, 0, now - 60000); // Remove entries > 1 min old
  const requestCount = await redis.zcard(key);
  console.log(\`Requests in last minute: \\\${requestCount}\`);
}

// ---------- Wide-Column Store (Cassandra) ----------

// Cassandra schema for time-series data
const cassandraSchema = \`
  -- Event logging — optimized for write-heavy workloads
  CREATE TABLE events (
    user_id UUID,
    event_date DATE,
    event_time TIMESTAMP,
    event_type TEXT,
    event_data MAP<TEXT, TEXT>,
    PRIMARY KEY ((user_id, event_date), event_time)
  ) WITH CLUSTERING ORDER BY (event_time DESC);

  -- This schema supports:
  -- ✅ "Get all events for user X on date Y" (partition key lookup)
  -- ✅ "Get latest 100 events for user X today" (range scan within partition)
  -- ❌ "Get all events of type 'login' across ALL users" (full table scan!)
\`;

// ---------- Decision Matrix ----------

const decisionMatrix = {
  'E-commerce orders': {
    database: 'PostgreSQL',
    reason: 'ACID transactions for payments, complex inventory queries',
  },
  'User sessions': {
    database: 'Redis',
    reason: 'Fast read/write, TTL expiration, key-value access pattern',
  },
  'Social media feed': {
    database: 'Cassandra + Redis',
    reason: 'Cassandra for write-heavy feed storage, Redis for feed cache',
  },
  'Full-text search': {
    database: 'Elasticsearch',
    reason: 'Inverted index optimized for text search and filtering',
  },
  'Recommendation engine': {
    database: 'Neo4j + Redis',
    reason: 'Graph traversal for recommendations, Redis for caching results',
  },
  'IoT sensor data': {
    database: 'TimescaleDB or Cassandra',
    reason: 'Massive write throughput, time-range queries',
  },
};

console.log('Database Decision Matrix:', decisionMatrix);`,
      exercise: `1. **Database Selection**: For each scenario, choose SQL or NoSQL (and the specific database), justifying your choice: (a) Banking transaction system, (b) Real-time gaming leaderboard, (c) Content management system for a blog, (d) IoT platform receiving 1M sensor readings per second, (e) Movie recommendation system like Netflix.

2. **Data Model Comparison**: Design the data model for a Twitter-like application in both PostgreSQL (normalized) and MongoDB (denormalized). Compare query complexity for: "Get latest 20 tweets from users I follow."

3. **Polyglot Architecture**: Design the database architecture for Uber, identifying which database to use for: ride matching, trip history, user profiles, driver locations, pricing engine, and analytics. Justify each choice.

4. **Migration Scenario**: Your startup's PostgreSQL database works great at 10K users but is slowing down at 10M users. Evaluate: (a) optimizing PostgreSQL (indexes, connection pooling, read replicas), (b) migrating to Cassandra, (c) adding a caching layer. What's your recommendation and why?

5. **CAP Theorem Application**: For each database (PostgreSQL, MongoDB, Cassandra, DynamoDB, Redis), identify whether it prioritizes CP (Consistency + Partition tolerance) or AP (Availability + Partition tolerance). How does this affect your design choices?`,
      commonMistakes: [
        "Choosing NoSQL because it's 'newer' or 'more scalable' — many applications work perfectly fine with PostgreSQL at massive scale. Choose based on data model and access patterns, not hype.",
        "Storing everything in one database — using PostgreSQL for caching, search, and time-series data. Each workload has an optimal database type. Use polyglot persistence.",
        "Not considering access patterns before choosing a database — Cassandra requires you to know your queries upfront (you design tables around queries, not the other way around). This is the opposite of SQL.",
        "Underestimating SQL databases — PostgreSQL handles millions of rows, complex queries, JSON data, full-text search, and even key-value patterns (JSONB). Many startups never outgrow PostgreSQL.",
        "Ignoring operational complexity — running Cassandra, MongoDB, or Elasticsearch requires significant operational expertise. Managed services (RDS, DynamoDB, Atlas) reduce this burden but cost more.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How would you decide between SQL and NoSQL for a new project?",
          a: "I follow a **decision framework** based on four factors:\n\n**1. Data relationships**:\n- Complex relationships with JOINs → **SQL**\n- Simple, self-contained documents → **NoSQL (Document)**\n- Key-value lookups → **NoSQL (Key-Value)**\n- Graph relationships → **NoSQL (Graph)**\n\n**2. Consistency requirements**:\n- Strong consistency / ACID needed → **SQL** or MongoDB (with transactions)\n- Eventual consistency acceptable → **Cassandra / DynamoDB**\n\n**3. Scale & access patterns**:\n- Read-heavy with complex queries → **SQL** with read replicas\n- Write-heavy (>100K writes/sec) → **Cassandra**\n- Simple lookups at extreme speed → **Redis / DynamoDB**\n\n**4. Schema stability**:\n- Well-defined, stable schema → **SQL**\n- Rapidly changing schema → **MongoDB / DynamoDB**\n\n**Default**: I start with PostgreSQL unless there's a specific reason not to. It handles most use cases well and has the broadest feature set.",
        },
        {
          type: "scenario",
          q: "You're building a social media platform. Which databases would you use for different components?",
          a: "I'd use **polyglot persistence** — different databases for different needs:\n\n| Component | Database | Reasoning |\n|-----------|----------|----------|\n| User profiles | **PostgreSQL** | Structured data, ACID for account operations |\n| Social graph | **Neo4j** or Redis Graph | Efficient friend-of-friend queries |\n| News feed | **Redis** (cache) + **Cassandra** (storage) | Feed is write-heavy (fan-out on write) |\n| Messages | **Cassandra** | Write-heavy, time-ordered, partition by conversation |\n| Search | **Elasticsearch** | Full-text search for users, posts |\n| Media metadata | **MongoDB** | Flexible schema for different media types |\n| Sessions | **Redis** | Fast, TTL-based expiration |\n| Analytics | **ClickHouse** or BigQuery | OLAP for aggregations |\n\n**Key insight**: Not every component needs the same consistency guarantees. User accounts need ACID; a news feed can tolerate eventual consistency.",
        },
      ],
    },
    {
      id: "sd-database-indexing",
      title: "Database Indexing & Query Optimization",
      explanation: `**Database indexing** is one of the most impactful performance optimizations in system design. A well-placed index can turn a 30-second query into a 5-millisecond one. Understanding how indexes work helps you design schemas that perform well at scale.

## How Indexes Work

Without an index, the database performs a **full table scan** — reading every row to find matches. An index is a separate data structure (usually a **B-Tree** or **B+ Tree**) that maintains a sorted reference to rows, enabling fast lookups.

### B-Tree Index (Most Common)

| Operation | Without Index | With B-Tree Index |
|-----------|--------------|-------------------|
| Point lookup (\`WHERE id = 123\`) | O(n) — scan all rows | O(log n) — tree traversal |
| Range query (\`WHERE age > 25\`) | O(n) | O(log n + k) where k = results |
| Insert | O(1) | O(log n) — must update index |
| Update indexed column | O(1) | O(log n) — must update index |

### Index Types

| Type | Description | Use Case |
|------|-------------|----------|
| **B-Tree** | Balanced tree, default for most DBs | General purpose, range queries |
| **Hash** | Direct key → location mapping | Exact-match lookups only |
| **GIN** (Generalized Inverted) | For multi-valued columns | Full-text search, JSONB, arrays |
| **GiST** (Generalized Search Tree) | For spatial/geometric data | Geographic queries, nearest-neighbor |
| **BRIN** (Block Range Index) | For naturally ordered data | Time-series, sequential IDs |
| **Bitmap** | Bit array per distinct value | Low-cardinality columns (status, gender) |

## Index Design Principles

1. **Index columns you WHERE, JOIN, and ORDER BY on** — not every column
2. **Composite indexes**: Put high-cardinality columns first (e.g., \`(user_id, created_at)\` not \`(created_at, user_id)\`)
3. **Covering indexes**: Include all columns a query needs so the DB never touches the main table (index-only scan)
4. **Don't over-index**: Each index slows down writes and consumes storage. 3-5 indexes per table is typical.
5. **Partial indexes**: Index only rows that match a condition (e.g., \`WHERE active = true\`)

## The Write-Read Trade-off

Every index makes **reads faster but writes slower**:
- **Read-heavy** workload (100:1 read:write): More indexes = better performance
- **Write-heavy** workload (1:100 read:write): Fewer indexes = better performance
- **Balanced**: Choose indexes carefully based on your most critical queries

> **Interview tip**: When designing a schema, always mention "I'd add an index on [column] because our primary query pattern is [query]." This shows you think about performance from the start.`,
      codeExample: `// ============================================
// Database Indexing — Practical Examples
// ============================================

// ---------- Index Impact Demonstration ----------

// Table: orders (10 million rows)
// Columns: id, user_id, product_id, amount, status, created_at

// ❌ WITHOUT INDEX: Full table scan
const slowQuery = \`
  -- Find all orders for user 12345 in the last 30 days
  -- Without index: scans ALL 10M rows → ~30 seconds
  SELECT * FROM orders
  WHERE user_id = 12345
  AND created_at > NOW() - INTERVAL '30 days'
  ORDER BY created_at DESC;

  -- EXPLAIN ANALYZE output:
  -- Seq Scan on orders
  --   Filter: (user_id = 12345 AND created_at > '2024-01-01')
  --   Rows Removed by Filter: 9,999,950
  --   Execution Time: 28,543.21 ms  ← 28 SECONDS!
\`;

// ✅ WITH COMPOSITE INDEX: B-Tree traversal
const createIndex = \`
  -- Create a composite index matching the query pattern
  CREATE INDEX idx_orders_user_date
  ON orders (user_id, created_at DESC);

  -- Same query WITH index:
  -- Index Scan using idx_orders_user_date on orders
  --   Index Cond: (user_id = 12345 AND created_at > '2024-01-01')
  --   Execution Time: 2.34 ms  ← 2 MILLISECONDS! (12,000x faster)
\`;

// ---------- Index Types in Practice ----------

const indexExamples = \`
  -- 1. SINGLE COLUMN INDEX
  -- Good for: Simple WHERE clauses
  CREATE INDEX idx_users_email ON users (email);
  -- Speeds up: SELECT * FROM users WHERE email = 'jane@example.com';

  -- 2. COMPOSITE (MULTI-COLUMN) INDEX
  -- Good for: Queries filtering on multiple columns
  CREATE INDEX idx_orders_user_status
  ON orders (user_id, status, created_at DESC);
  -- Speeds up: SELECT * FROM orders
  --            WHERE user_id = 123 AND status = 'active'
  --            ORDER BY created_at DESC;
  -- ⚠️ Column order matters! This index does NOT help with:
  -- WHERE status = 'active' (user_id must come first)

  -- 3. COVERING INDEX (includes all needed columns)
  CREATE INDEX idx_orders_covering
  ON orders (user_id, created_at DESC)
  INCLUDE (amount, status);
  -- The DB never needs to read the main table!
  -- This is called an "index-only scan" — fastest possible

  -- 4. PARTIAL INDEX
  -- Only index rows matching a condition
  CREATE INDEX idx_orders_active
  ON orders (user_id, created_at DESC)
  WHERE status = 'active';
  -- Smaller index, faster lookups, only for active orders
  -- Great when most queries filter by status = 'active'

  -- 5. UNIQUE INDEX
  CREATE UNIQUE INDEX idx_users_email_unique ON users (email);
  -- Enforces uniqueness AND provides fast lookups

  -- 6. GIN INDEX (for JSONB / full-text search)
  CREATE INDEX idx_products_metadata ON products USING GIN (metadata);
  -- Speeds up: SELECT * FROM products
  --            WHERE metadata @> '{"color": "red"}';

  -- 7. BRIN INDEX (Block Range Index — for time-series)
  CREATE INDEX idx_events_time ON events USING BRIN (created_at);
  -- Very small index, perfect for naturally ordered data
  -- 1000x smaller than B-Tree for time-series tables
\`;

// ---------- Query Optimization Patterns ----------

// Pattern 1: Use EXPLAIN ANALYZE to understand query performance
const explainQuery = \`
  EXPLAIN ANALYZE
  SELECT u.name, COUNT(o.id) as order_count, SUM(o.amount) as total
  FROM users u
  JOIN orders o ON o.user_id = u.id
  WHERE o.created_at > NOW() - INTERVAL '90 days'
  GROUP BY u.id, u.name
  HAVING COUNT(o.id) > 5
  ORDER BY total DESC
  LIMIT 20;

  -- Look for:
  -- ❌ Seq Scan (full table scan — needs index)
  -- ❌ Hash Join on large tables (consider index for join column)
  -- ❌ Sort with high cost (consider index with matching ORDER BY)
  -- ✅ Index Scan or Index Only Scan
  -- ✅ Bitmap Index Scan (for multiple conditions)
\`;

// Pattern 2: Connection pooling for performance
// ❌ BAD: New connection per request (200ms overhead per connection)
async function badQueryHandler(req, res) {
  const conn = await createNewConnection(); // 200ms TCP + TLS + auth
  const result = await conn.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  await conn.close();
  res.json(result);
}

// ✅ GOOD: Connection pool (reuse existing connections)
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  max: 20,                // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function goodQueryHandler(req, res) {
  // Gets an existing connection from pool (< 1ms)
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [req.params.id]
  );
  // Connection automatically returned to pool
  res.json(result.rows[0]);
}

// Pattern 3: Avoiding N+1 queries
// ❌ BAD: N+1 query problem
async function getPostsWithAuthorsBad() {
  const posts = await db.query('SELECT * FROM posts LIMIT 20'); // 1 query
  for (const post of posts) {
    // N additional queries!
    post.author = await db.query(
      'SELECT name FROM users WHERE id = $1', [post.user_id]
    );
  }
  return posts; // Total: 21 queries!
}

// ✅ GOOD: JOIN in a single query
async function getPostsWithAuthorsGood() {
  const posts = await db.query(\`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
    LIMIT 20
  \`); // Total: 1 query!
  return posts;
}

console.log("Indexing examples configured.");`,
      exercise: `1. **Index Design Challenge**: Given a table \`orders(id, user_id, product_id, quantity, total, status, created_at)\` and these common queries: (a) Get all orders for a user sorted by date, (b) Get all pending orders, (c) Get total revenue per product this month — design the optimal set of indexes. Explain why each index helps.

2. **EXPLAIN Analysis**: Run \`EXPLAIN ANALYZE\` on a slow query in your database. Identify: (a) what type of scan is used, (b) which step takes the most time, (c) what index would improve it, (d) the expected improvement.

3. **Over-Indexing Penalty**: A table has 15 indexes and is experiencing slow INSERT performance. Calculate the approximate write amplification (how much extra I/O each insert generates). Design a strategy to reduce to the optimal number of indexes.

4. **Composite Index Order**: Explain why \`INDEX (user_id, created_at)\` is different from \`INDEX (created_at, user_id)\`. Which one supports "get all orders for user X in date range" more efficiently? Why?

5. **Full-Text Search**: Design a search system for a product catalog with 10M products. Compare: (a) SQL LIKE queries, (b) PostgreSQL GIN/tsvector, (c) Elasticsearch. Include performance estimates for each.`,
      commonMistakes: [
        "Not indexing foreign key columns — JOINs on un-indexed foreign keys force full table scans on the joined table. Always index columns used in JOIN conditions.",
        "Creating indexes on low-cardinality columns — an index on a boolean 'active' column (only 2 values) is rarely useful because the database will scan half the table anyway. Use partial indexes instead.",
        "Wrong column order in composite indexes — in a composite index (A, B, C), queries filtering on just B or just C can't use the index. The leftmost prefix rule means the index supports queries on A, (A,B), or (A,B,C).",
        "Not using EXPLAIN ANALYZE — guessing which queries are slow instead of measuring. Always profile before optimizing. The database's query planner knows more than you do.",
        "Indexing every column 'just in case' — each index costs storage, slows writes, and needs maintenance. Only index columns used in frequent WHERE, JOIN, and ORDER BY clauses.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does a B-Tree index work, and why is it the default index type for most databases?",
          a: "A **B-Tree (Balanced Tree)** is a self-balancing tree data structure that maintains sorted data:\n\n**Structure**:\n- Each node contains multiple keys in sorted order\n- Non-leaf nodes have pointers to child nodes\n- Leaf nodes contain pointers to actual data rows\n- Tree is balanced — all leaf nodes are at the same depth\n\n**Why it's the default**:\n1. **O(log n) lookups** — finding any value in 1 billion rows takes only ~30 comparisons\n2. **Range queries** — because data is sorted, range scans (WHERE age > 25 AND age < 50) are efficient\n3. **Ordering** — supports ORDER BY without a separate sort step\n4. **Equality** — exact-match lookups are fast\n5. **Disk-friendly** — nodes are sized to match disk pages (4-16KB), minimizing I/O\n\n**Trade-off**: Each index adds O(log n) cost to inserts and updates. For a table with 5 indexes, each write does ~5 extra tree operations.",
        },
        {
          type: "scenario",
          q: "Your database query takes 5 seconds but needs to run in under 50ms. Walk me through your optimization process.",
          a: "My systematic approach:\n\n**Step 1: Measure** — Run `EXPLAIN ANALYZE` to see the query plan\n- Identify: Seq Scans, Sort operations, Hash Joins on large tables\n\n**Step 2: Check for missing indexes** (usually the biggest win)\n- Add indexes on WHERE, JOIN, and ORDER BY columns\n- Use composite indexes matching the query's column order\n\n**Step 3: Query rewrite**\n- Eliminate N+1 queries (use JOINs)\n- Replace subqueries with JOINs where possible\n- Use LIMIT to reduce result set\n\n**Step 4: Schema optimization**\n- Denormalize if JOINs are the bottleneck (pre-compute aggregates)\n- Add covering indexes to enable index-only scans\n\n**Step 5: Caching** (if still slow after DB optimization)\n- Cache query results in Redis with appropriate TTL\n- Use materialized views for expensive aggregations\n\n**Step 6: Architecture** (if caching isn't enough)\n- Read replicas to distribute read load\n- Partition large tables by date/region\n\nExpected improvement: Steps 1-2 typically get you from 5s → 50ms. Steps 3-4 get to < 10ms.",
        },
      ],
    },
    {
      id: "sd-database-sharding",
      title: "Database Sharding & Partitioning",
      explanation: `When a single database server can't handle your data volume or traffic, you need to split the data across multiple servers. This is called **sharding** (horizontal partitioning). It's one of the most important — and most complex — scaling strategies in system design.

## Partitioning vs Sharding

| Term | Scope | Description |
|------|-------|-------------|
| **Partitioning** | Single server | Split one table into multiple partitions on the same server |
| **Sharding** | Multiple servers | Each partition lives on a different server (distributed partitioning) |

## Sharding Strategies

### 1. Range-Based Sharding
Data is split by ranges of a key value:
- Shard 1: users with IDs 1 – 1,000,000
- Shard 2: users with IDs 1,000,001 – 2,000,000
- Shard 3: users with IDs 2,000,001 – 3,000,000

**Pros**: Simple, supports range queries
**Cons**: Hotspots (new users always go to the last shard)

### 2. Hash-Based Sharding
Apply a hash function to the shard key: \`shard = hash(user_id) % num_shards\`

**Pros**: Even distribution, no hotspots
**Cons**: Range queries become scatter-gather (must query all shards), resharding is painful

### 3. Directory-Based Sharding
A lookup service maps each key to its shard:
- user_123 → Shard A
- user_456 → Shard B
- user_789 → Shard A

**Pros**: Maximum flexibility, easy to rebalance
**Cons**: Lookup service becomes a bottleneck and single point of failure

### 4. Geographic Sharding
Data is split by geographic region:
- US users → US datacenter
- EU users → EU datacenter
- Asia users → Asia datacenter

**Pros**: Data locality (low latency), compliance (GDPR)
**Cons**: Cross-region queries are slow, complex for global users

## Choosing a Shard Key

The shard key is the **most important decision** in sharding. A bad shard key creates hotspots, cross-shard queries, and data imbalances.

**Good shard key properties**:
1. **High cardinality** — many distinct values (user_id ✅, boolean ❌)
2. **Even distribution** — no value dominates (user_id ✅, country ❌)
3. **Query alignment** — most queries include the shard key in WHERE clause
4. **Immutable** — the shard key shouldn't change (user_id ✅, email ❌)

## The Resharding Problem

When you need to add more shards (e.g., going from 4 to 8), \`hash(key) % num_shards\` produces different results — data must be redistributed. **Consistent hashing** solves this by minimizing data movement (covered in Phase 10).

> **Interview tip**: Sharding is a tool of last resort. Always try vertical scaling, read replicas, and caching first. Sharding adds enormous operational complexity.`,
      codeExample: `// ============================================
// Database Sharding — Implementation Patterns
// ============================================

// ---------- Hash-Based Sharding ----------

class HashShardRouter {
  constructor(shardCount) {
    this.shardCount = shardCount;
    this.shards = Array.from({ length: shardCount }, (_, i) => ({
      id: i,
      host: \`db-shard-\\\${i}.example.com\`,
      connectionPool: null, // In production: pg.Pool
    }));
  }

  // Simple modulo hashing
  getShard(key) {
    const hash = this.hashFunction(key);
    const shardIndex = hash % this.shardCount;
    return this.shards[shardIndex];
  }

  // FNV-1a hash for even distribution
  hashFunction(key) {
    let hash = 0x811c9dc5; // FNV offset basis
    const keyStr = String(key);
    for (let i = 0; i < keyStr.length; i++) {
      hash ^= keyStr.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0; // FNV prime, unsigned
    }
    return hash;
  }

  // ❌ Problem: Adding a new shard redistributes most keys
  addShard() {
    const newShardCount = this.shardCount + 1;
    console.log(
      \`⚠️ Resharding from \\\${this.shardCount} to \\\${newShardCount} shards\`
    );
    console.log(
      \`   ~\\\${Math.round(100 * (1 - this.shardCount / newShardCount))}% of keys will move!\`
    );
    // Going from 4 → 5 shards: ~20% of keys move
    // Going from 4 → 8 shards: ~50% of keys move!
    this.shardCount = newShardCount;
  }
}

// ---------- Range-Based Sharding ----------

class RangeShardRouter {
  constructor() {
    this.ranges = [
      { min: 0, max: 1_000_000, shard: 'shard-0' },
      { min: 1_000_001, max: 2_000_000, shard: 'shard-1' },
      { min: 2_000_001, max: 3_000_000, shard: 'shard-2' },
      { min: 3_000_001, max: Infinity, shard: 'shard-3' },
    ];
  }

  getShard(userId) {
    const range = this.ranges.find(r => userId >= r.min && userId <= r.max);
    return range ? range.shard : 'shard-default';
  }

  // ❌ Problem: Hotspot on the last shard (new users always go there)
  // Shard-3 might have 10x more writes than Shard-0!
}

// ---------- Sharded Query Router ----------

class ShardedDatabase {
  constructor(shardCount) {
    this.router = new HashShardRouter(shardCount);
  }

  // ✅ Query by shard key — goes to ONE shard
  async getUserById(userId) {
    const shard = this.router.getShard(userId);
    console.log(\`Query user \\\${userId} → \\\${shard.host}\`);
    return await shard.connectionPool.query(
      'SELECT * FROM users WHERE id = $1', [userId]
    );
  }

  // ❌ Query without shard key — must query ALL shards (scatter-gather)
  async getUserByEmail(email) {
    console.log(\`⚠️ Scatter-gather query for email: \\\${email}\`);
    const promises = this.router.shards.map(shard =>
      shard.connectionPool.query('SELECT * FROM users WHERE email = $1', [email])
    );
    const results = await Promise.all(promises);
    // Merge results from all shards
    return results.flat().find(user => user !== null);
  }

  // Cross-shard JOIN — the nightmare scenario
  async getUserWithOrders(userId) {
    // If users and orders are sharded differently, you need:
    // 1. Query user from users shard
    // 2. Query orders from orders shard(s)
    // 3. Join in application code
    // This is why you should co-locate related data!

    const userShard = this.router.getShard(userId);
    const user = await userShard.connectionPool.query(
      'SELECT * FROM users WHERE id = $1', [userId]
    );

    // If orders are sharded by user_id too, this goes to one shard
    // If orders are sharded differently... scatter-gather :(
    const orderShard = this.router.getShard(userId); // Same shard key!
    const orders = await orderShard.connectionPool.query(
      'SELECT * FROM orders WHERE user_id = $1', [userId]
    );

    return { ...user, orders };
  }
}

// ---------- Database Partitioning (Single Server) ----------

const partitioningExamples = \`
  -- Range partitioning by date (great for time-series)
  CREATE TABLE events (
    id SERIAL,
    user_id INTEGER,
    event_type TEXT,
    created_at TIMESTAMP
  ) PARTITION BY RANGE (created_at);

  -- One partition per month
  CREATE TABLE events_2024_01 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
  CREATE TABLE events_2024_02 PARTITION OF events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

  -- Benefits:
  -- ✅ Query "events from January" only scans one partition
  -- ✅ Drop old data by detaching a partition (instant, no DELETE)
  -- ✅ Each partition can have its own indexes

  -- List partitioning by region
  CREATE TABLE users (
    id SERIAL,
    name TEXT,
    region TEXT
  ) PARTITION BY LIST (region);

  CREATE TABLE users_us PARTITION OF users FOR VALUES IN ('us-east', 'us-west');
  CREATE TABLE users_eu PARTITION OF users FOR VALUES IN ('eu-west', 'eu-central');
\`;

// Demo
const router = new HashShardRouter(4);
console.log('User 123 →', router.getShard(123));
console.log('User 456 →', router.getShard(456));
console.log('User 789 →', router.getShard(789));

const rangeRouter = new RangeShardRouter();
console.log('User 500000 →', rangeRouter.getShard(500000));
console.log('User 1500000 →', rangeRouter.getShard(1500000));`,
      exercise: `1. **Shard Key Selection**: For each system, recommend a shard key and sharding strategy, explaining trade-offs: (a) E-commerce orders, (b) Chat messages, (c) Global user accounts, (d) Social media posts/feed.

2. **Hotspot Simulation**: With hash-based sharding (4 shards), simulate what happens when 70% of traffic goes to 5% of users (celebrity effect). How would you handle this hotspot?

3. **Cross-Shard Query Design**: You've sharded users by user_id and orders by user_id. Now the product team wants "top 10 highest spending users this month." Design the query strategy across shards.

4. **Resharding Plan**: You need to go from 8 shards to 16 shards with zero downtime. Design a step-by-step migration plan including: data migration, dual-writing, verification, and cutover.

5. **Partition Strategy**: Design the partitioning strategy for a logging table with 50M new rows per day and a 90-day retention policy. How do you efficiently purge old data?`,
      commonMistakes: [
        "Sharding too early — sharding adds enormous complexity (cross-shard queries, distributed transactions, operational overhead). Start with vertical scaling, read replicas, and caching. Only shard when you've exhausted other options.",
        "Choosing a bad shard key — sharding by a low-cardinality key (like country) creates massive hotspots. Sharding by a key not used in queries forces expensive scatter-gather queries.",
        "Ignoring cross-shard queries — if your most common query requires data from all shards, sharding may actually make performance worse. Your shard key must align with your most frequent query patterns.",
        "Not co-locating related data — if users and their orders are on different shards, every 'get user with orders' query becomes a distributed join. Shard related tables by the same key.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is database sharding, and when should you consider it?",
          a: "**Sharding** is splitting a database across multiple servers (shards), where each shard holds a subset of the data.\n\n**When to consider sharding**:\n1. Single database has reached its **storage limit** (> 1-2 TB per table)\n2. **Write throughput** exceeds what one server can handle (> 10K writes/sec)\n3. **Read replicas can't keep up** — too many writes for replicas to process\n4. **Compliance** requires data residency in specific regions\n\n**First try these alternatives**:\n1. **Vertical scaling** — bigger server (more CPU, RAM, SSD)\n2. **Read replicas** — offload reads to replicas\n3. **Connection pooling** — reduce connection overhead\n4. **Caching** — Redis for hot data\n5. **Query optimization** — indexes, query rewrites\n\n**Only shard when**: You've exhausted all simpler options AND your data/traffic justifies the operational complexity.",
        },
        {
          type: "tricky",
          q: "How do you handle auto-increment IDs across shards? Each shard would generate conflicting IDs.",
          a: "Several approaches:\n\n**1. UUID / ULID**: Generate globally unique IDs without coordination\n- Pros: No central authority, works offline\n- Cons: Random UUIDs have poor index locality (fragmented B-Tree inserts)\n- Solution: Use ULID (time-sorted) instead of UUID v4\n\n**2. Snowflake IDs** (used by Twitter): 64-bit IDs composed of:\n- Timestamp (41 bits) — time-sorted\n- Machine ID (10 bits) — identifies the shard/worker\n- Sequence (12 bits) — counter per machine per millisecond\n- Generates ~4096 unique IDs per millisecond per machine\n\n**3. Central Sequence Service**: A dedicated service (backed by Redis or ZooKeeper) hands out ID ranges\n- Shard A gets IDs 1-10000, Shard B gets 10001-20000\n- Pros: Sequential IDs\n- Cons: Single point of failure, latency\n\n**My recommendation**: **Snowflake IDs** — they're time-sorted (great for indexing), globally unique (no coordination), and contain embedded metadata (machine ID).",
        },
      ],
    },
    {
      id: "sd-database-replication",
      title: "Database Replication",
      explanation: `**Database replication** is the practice of maintaining copies of a database on multiple servers. It serves two purposes: **high availability** (if one server dies, others take over) and **read scalability** (distribute reads across multiple servers).

## Replication Topologies

### 1. Single Leader (Primary-Replica)
One server (primary) handles all writes. Changes are replicated to one or more replicas (read-only).

\`\`\`
Client Writes → [Primary] → replicates → [Replica 1] ← Client Reads
                                        → [Replica 2] ← Client Reads
                                        → [Replica 3] ← Client Reads
\`\`\`

**Pros**: Simple, consistent writes, easy to understand
**Cons**: Write bottleneck (single primary), failover complexity

### 2. Multi-Leader
Multiple servers can accept writes. Changes are replicated between all leaders.

**Pros**: Write scalability, multi-region support
**Cons**: Conflict resolution is HARD (two leaders update the same row differently)

### 3. Leaderless (Dynamo-style)
No leader — any node can accept reads and writes. Uses **quorum** for consistency.

**Pros**: High availability, no single point of failure
**Cons**: Complex conflict resolution, eventual consistency
**Used by**: Cassandra, DynamoDB, Riak

## Replication Methods

| Method | How It Works | Lag | Consistency |
|--------|-------------|-----|-------------|
| **Synchronous** | Primary waits for ALL replicas to confirm | None | Strong |
| **Asynchronous** | Primary doesn't wait for replicas | Milliseconds to seconds | Eventual |
| **Semi-synchronous** | Primary waits for ONE replica, rest are async | Minimal | Near-strong |

## Replication Lag Problem

With asynchronous replication, there's a delay between a write on the primary and the read seeing it on the replica. This causes:

- **Read-your-own-write inconsistency**: User updates profile → reads from replica → sees old data
- **Causal inconsistency**: User B sees User A's comment but not the post it refers to

**Solutions**:
1. **Read-after-write consistency**: Route reads to primary for recently-written data
2. **Monotonic reads**: Route a user to the same replica consistently (sticky routing)
3. **Causal consistency**: Track dependencies and ensure replicas apply changes in order

> **Interview tip**: When you mention read replicas, always acknowledge replication lag and how you'd handle it for your specific use case.`,
      codeExample: `// ============================================
// Database Replication — Patterns & Pitfalls
// ============================================

// ---------- Read-Write Splitting ----------

class ReplicatedDatabase {
  constructor(primary, replicas) {
    this.primary = primary;     // Write + strong-consistency reads
    this.replicas = replicas;   // Read-only, eventually consistent
    this.currentReplicaIndex = 0;
  }

  // ✅ Route writes to primary
  async write(query, params) {
    console.log(\`[WRITE] → Primary: \\\${this.primary.host}\`);
    return await this.primary.pool.query(query, params);
  }

  // ✅ Route reads to replicas (round-robin)
  async read(query, params) {
    const replica = this.getNextReplica();
    console.log(\`[READ] → Replica: \\\${replica.host}\`);
    return await replica.pool.query(query, params);
  }

  // ✅ Strong read — when you MUST read your own write
  async readStrong(query, params) {
    console.log(\`[STRONG READ] → Primary: \\\${this.primary.host}\`);
    return await this.primary.pool.query(query, params);
  }

  getNextReplica() {
    const replica = this.replicas[this.currentReplicaIndex];
    this.currentReplicaIndex = (this.currentReplicaIndex + 1) % this.replicas.length;
    return replica;
  }
}

// ---------- Read-After-Write Consistency ----------

class ConsistentReadRouter {
  constructor(db) {
    this.db = db;
    // Track recent writes per user (in Redis in production)
    this.recentWrites = new Map(); // userId → timestamp
  }

  async handleWrite(userId, query, params) {
    const result = await this.db.write(query, params);
    // Record that this user just wrote data
    this.recentWrites.set(userId, Date.now());
    return result;
  }

  async handleRead(userId, query, params) {
    const lastWrite = this.recentWrites.get(userId);
    const replicationLagMs = 2000; // Assume 2 second max replication lag

    if (lastWrite && Date.now() - lastWrite < replicationLagMs) {
      // User wrote recently — read from primary to see their own write
      console.log(\`[READ] User \\\${userId} wrote recently → routing to PRIMARY\`);
      return await this.db.readStrong(query, params);
    }

    // No recent write — safe to read from replica
    console.log(\`[READ] User \\\${userId} no recent writes → routing to REPLICA\`);
    return await this.db.read(query, params);
  }
}

// ---------- Failover Manager ----------

class FailoverManager {
  constructor(primary, replicas) {
    this.primary = primary;
    this.replicas = replicas;
    this.healthCheckInterval = 5000; // Check every 5 seconds
    this.failoverThreshold = 3;     // 3 missed heartbeats → failover
    this.missedHeartbeats = 0;
  }

  startHealthChecks() {
    setInterval(async () => {
      try {
        await this.primary.pool.query('SELECT 1'); // Heartbeat
        this.missedHeartbeats = 0;
      } catch (error) {
        this.missedHeartbeats++;
        console.warn(
          \`⚠️ Primary heartbeat missed (\\\${this.missedHeartbeats}/\\\${this.failoverThreshold})\`
        );

        if (this.missedHeartbeats >= this.failoverThreshold) {
          await this.performFailover();
        }
      }
    }, this.healthCheckInterval);
  }

  async performFailover() {
    console.log('🚨 PRIMARY DOWN — Initiating failover...');

    // 1. Select the most up-to-date replica
    let bestReplica = null;
    let minLag = Infinity;

    for (const replica of this.replicas) {
      try {
        const lag = await this.getReplicationLag(replica);
        if (lag < minLag) {
          minLag = lag;
          bestReplica = replica;
        }
      } catch (e) {
        console.log(\`Replica \\\${replica.host} is also down\`);
      }
    }

    if (!bestReplica) {
      console.error('🚨 ALL REPLICAS DOWN — FULL OUTAGE');
      return;
    }

    // 2. Promote the best replica to primary
    console.log(\`✅ Promoting \\\${bestReplica.host} to PRIMARY (lag: \\\${minLag}ms)\`);
    await bestReplica.pool.query('SELECT pg_promote()');

    // 3. Update routing
    const oldPrimary = this.primary;
    this.primary = bestReplica;
    this.replicas = this.replicas.filter(r => r !== bestReplica);

    // 4. Notify other replicas to follow new primary
    for (const replica of this.replicas) {
      console.log(\`Reconfiguring \\\${replica.host} to follow new primary\`);
      // In production: update replication settings
    }

    console.log('✅ Failover complete');
  }

  async getReplicationLag(replica) {
    // PostgreSQL: Check replication lag in bytes
    const result = await replica.pool.query(
      "SELECT EXTRACT(EPOCH FROM replay_lag) * 1000 as lag_ms FROM pg_stat_replication"
    );
    return result.rows[0]?.lag_ms || 0;
  }
}

// ---------- Quorum Reads/Writes (Leaderless) ----------

class QuorumDatabase {
  constructor(nodes) {
    this.nodes = nodes;              // All database nodes
    this.n = nodes.length;           // Total nodes
    this.writeQuorum = Math.floor(this.n / 2) + 1; // Write majority
    this.readQuorum = Math.floor(this.n / 2) + 1;  // Read majority
    // w + r > n ensures overlap → at least one node has latest data
  }

  async quorumWrite(key, value) {
    const writePromises = this.nodes.map(node =>
      node.write(key, value).catch(err => ({ error: err }))
    );

    const results = await Promise.all(writePromises);
    const successes = results.filter(r => !r.error);

    if (successes.length >= this.writeQuorum) {
      console.log(\`✅ Write succeeded (\\\${successes.length}/\\\${this.n} nodes)\`);
      return true;
    } else {
      console.log(\`❌ Write failed (only \\\${successes.length}/\\\${this.writeQuorum} required)\`);
      return false;
    }
  }

  async quorumRead(key) {
    const readPromises = this.nodes.map(node =>
      node.read(key).catch(err => ({ error: err }))
    );

    const results = await Promise.all(readPromises);
    const successes = results.filter(r => !r.error);

    if (successes.length >= this.readQuorum) {
      // Return the value with the highest version/timestamp
      const latest = successes.reduce((a, b) =>
        a.version > b.version ? a : b
      );
      return latest.value;
    }
    throw new Error('Read quorum not met');
  }
}

console.log("Replication patterns demonstrated.");`,
      exercise: `1. **Read Replica Design**: Your PostgreSQL primary handles 5K writes/sec and 50K reads/sec. Design a read replica architecture that distributes the read load. How many replicas do you need? How do you handle replication lag?

2. **Failover Scenario**: Your primary database goes down. Walk through the exact steps of a manual failover, then design an automatic failover system. What data could be lost during failover?

3. **Multi-Region Replication**: Design a replication strategy for a global application with users in US, EU, and Asia. How do you handle: (a) read latency, (b) write conflicts, (c) data residency (GDPR)?

4. **Quorum Calculator**: For a 5-node leaderless system, calculate the minimum W (write) and R (read) quorum sizes for: (a) strong consistency, (b) eventual consistency, (c) if one node is permanently down.

5. **Replication Lag Measurement**: Design a monitoring system that detects when replication lag exceeds 5 seconds and automatically routes reads to the primary until lag recovers.`,
      commonMistakes: [
        "Assuming replicas are always consistent with the primary — asynchronous replication has lag. Reading from a replica immediately after writing to the primary may return stale data.",
        "Not planning for failover — when the primary dies, promoting a replica isn't automatic. You need automated failover with proper health checks, or you risk extended downtime.",
        "Using replicas without monitoring replication lag — if lag grows to minutes or hours (due to long-running queries or heavy writes), replicas return severely outdated data. Always monitor and alert on lag.",
        "Forgetting that writes during failover may be lost — asynchronous replicas may not have received the last few writes before the primary crashed. This data is gone. For zero data loss, use synchronous replication (at the cost of write latency).",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the trade-offs between synchronous and asynchronous replication?",
          a: "**Synchronous replication**:\n- Primary waits for replica(s) to confirm write before responding to client\n- ✅ **Zero data loss** — replica is always up-to-date\n- ❌ **Higher latency** — every write waits for network round-trip to replica\n- ❌ **Reduced availability** — if replica is down, writes are blocked\n\n**Asynchronous replication**:\n- Primary responds immediately, replicates in the background\n- ✅ **Lower latency** — writes are fast\n- ✅ **Higher availability** — replica downtime doesn't affect writes\n- ❌ **Possible data loss** — if primary crashes, last few writes may not have reached replicas\n\n**Semi-synchronous** (compromise):\n- Primary waits for ONE replica, others are async\n- Balances durability and performance\n\n**My recommendation**: Semi-synchronous for most systems. Synchronous only for financial/critical data where zero data loss is required.",
        },
        {
          type: "scenario",
          q: "A user updates their profile picture but sees the old one when they refresh the page. What's happening and how do you fix it?",
          a: "This is the classic **read-your-own-write inconsistency** caused by replication lag:\n\n**What's happening**:\n1. User writes profile update → goes to **primary**\n2. User refreshes page → read routed to **replica**\n3. Replica hasn't received the update yet → shows old picture\n\n**Solutions** (in order of preference):\n\n1. **Read-after-write from primary**: If the user just wrote data, route their reads to the primary for a short window (e.g., 5 seconds)\n\n2. **Client-side optimistic update**: Update the UI immediately without waiting for the server response. When the server confirms, the update is already visible.\n\n3. **Sticky sessions**: Route a user to the same replica consistently. Combined with a write marker, ensure they always read from a replica that has their latest write.\n\n4. **Version tracking**: Include a version number in the write response. On read, pass the version — if the replica's version is older, redirect to primary.",
        },
      ],
    },
  ],
};

export default sdPhase4;
