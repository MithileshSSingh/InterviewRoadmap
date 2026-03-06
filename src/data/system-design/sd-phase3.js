const sdPhase3 = {
  id: "phase-3",
  title: "Phase 3: APIs & Communication Protocols",
  emoji: "🔌",
  description:
    "Master API design paradigms — REST, GraphQL, gRPC — and learn about API gateways, rate limiting, and versioning for production-grade systems.",
  topics: [
    {
      id: "sd-rest-api-design",
      title: "REST API Design",
      explanation: `**REST (Representational State Transfer)** is the most widely used API architecture style. It's not a protocol — it's a set of architectural constraints that, when followed, produce scalable, cacheable, and maintainable APIs.

## REST Constraints

1. **Client-Server**: Separation of concerns between frontend and backend
2. **Stateless**: Each request contains all information needed to process it
3. **Cacheable**: Responses must define whether they're cacheable
4. **Uniform Interface**: Consistent URL patterns, HTTP methods, and response formats
5. **Layered System**: Client doesn't know if it's talking to the actual server or a proxy/cache
6. **Code on Demand** (optional): Server can send executable code to the client

## RESTful URL Design

| Action | Method | URL | Description |
|--------|--------|-----|-------------|
| List users | GET | \`/api/v1/users\` | Get all users |
| Get one user | GET | \`/api/v1/users/123\` | Get user with ID 123 |
| Create user | POST | \`/api/v1/users\` | Create a new user |
| Update user | PUT | \`/api/v1/users/123\` | Replace user 123 entirely |
| Partial update | PATCH | \`/api/v1/users/123\` | Update specific fields |
| Delete user | DELETE | \`/api/v1/users/123\` | Delete user 123 |
| User's posts | GET | \`/api/v1/users/123/posts\` | Nested resource |

## Pagination Patterns

| Pattern | Example | Pros | Cons |
|---------|---------|------|------|
| **Offset** | \`?page=3&limit=20\` | Simple, familiar | Slow for large offsets, inconsistent with inserts |
| **Cursor** | \`?cursor=eyJpZCI6MTIzfQ&limit=20\` | Consistent, fast | Can't jump to arbitrary page |
| **Keyset** | \`?after_id=123&limit=20\` | Very fast (uses index) | Only forward pagination |

## Versioning Strategies

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URL path** | \`/api/v1/users\` | Explicit, easy to route | URL pollution |
| **Header** | \`Accept: application/vnd.api.v1+json\` | Clean URLs | Hidden, harder to test |
| **Query param** | \`/api/users?version=1\` | Easy to use | Easy to forget |

> **Industry standard**: Most companies (Stripe, GitHub, Twitter) use **URL path versioning** because it's the most explicit and developer-friendly.`,
      codeExample: `// ============================================
// REST API Design — Production Patterns
// ============================================

const express = require('express');
const app = express();
app.use(express.json());

// ---------- Resource-Based URL Design ----------

// ❌ BAD: Verb-based URLs (RPC style, not REST)
app.get('/api/getAllUsers', () => {});      // verb in URL
app.post('/api/createUser', () => {});     // verb in URL
app.post('/api/deleteUser', () => {});     // POST for delete?!
app.get('/api/getUserPosts', () => {});    // action-based

// ✅ GOOD: Resource-based URLs with HTTP methods
// Users resource
app.get('/api/v1/users', listUsers);           // List
app.get('/api/v1/users/:id', getUser);         // Read
app.post('/api/v1/users', createUser);         // Create
app.put('/api/v1/users/:id', updateUser);      // Update (full)
app.patch('/api/v1/users/:id', patchUser);     // Update (partial)
app.delete('/api/v1/users/:id', deleteUser);   // Delete

// Nested resources: user's posts
app.get('/api/v1/users/:userId/posts', getUserPosts);
app.post('/api/v1/users/:userId/posts', createUserPost);

// ---------- Pagination (Cursor-based) ----------

async function listUsers(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100
  const cursor = req.query.cursor; // Base64 encoded last-seen ID

  let query = 'SELECT * FROM users';
  const params = [];

  if (cursor) {
    const decodedCursor = JSON.parse(
      Buffer.from(cursor, 'base64').toString('utf-8')
    );
    query += ' WHERE id > ?';
    params.push(decodedCursor.lastId);
  }

  query += ' ORDER BY id ASC LIMIT ?';
  params.push(limit + 1); // Fetch one extra to check if there's a next page

  const users = await db.query(query, params);
  const hasNext = users.length > limit;
  const results = hasNext ? users.slice(0, limit) : users;

  const nextCursor = hasNext
    ? Buffer.from(JSON.stringify({ lastId: results[results.length - 1].id })).toString('base64')
    : null;

  res.json({
    data: results,
    pagination: {
      limit,
      hasNext,
      nextCursor,
      // Usage: GET /api/v1/users?cursor={nextCursor}&limit=20
    },
  });
}

// ---------- Consistent Error Response Format ----------

// ✅ GOOD: Structured error responses
function errorResponse(res, status, code, message, details = null) {
  const response = {
    error: {
      status,
      code,      // Machine-readable error code
      message,   // Human-readable message
      timestamp: new Date().toISOString(),
    },
  };
  if (details) response.error.details = details;
  return res.status(status).json(response);
}

// Usage in handler:
async function getUser(req, res) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return errorResponse(res, 400, 'INVALID_ID', 'User ID must be a positive integer');
  }

  const user = await db.findUser(id);
  if (!user) {
    return errorResponse(res, 404, 'USER_NOT_FOUND', \`User with ID \\\${id} not found\`);
  }

  res.json({
    data: user,
    links: {
      self: \`/api/v1/users/\\\${id}\`,
      posts: \`/api/v1/users/\\\${id}/posts\`,
    },
  });
}

// ---------- HATEOAS (Hypermedia) ----------

async function createUser(req, res) {
  const user = await db.createUser(req.body);

  res.status(201).json({
    data: user,
    links: {
      self: \`/api/v1/users/\\\${user.id}\`,
      posts: \`/api/v1/users/\\\${user.id}/posts\`,
      update: { method: 'PUT', href: \`/api/v1/users/\\\${user.id}\` },
      delete: { method: 'DELETE', href: \`/api/v1/users/\\\${user.id}\` },
    },
  });
}

// ---------- Filtering, Sorting, Field Selection ----------

// GET /api/v1/users?status=active&sort=-created_at&fields=id,name,email
async function listUsersAdvanced(req, res) {
  const { status, sort, fields, q } = req.query;

  let query = 'SELECT ';

  // Field selection (reduce payload)
  query += fields ? fields.split(',').map(f => \`\\\${f}\`).join(', ') : '*';
  query += ' FROM users WHERE 1=1';

  // Filtering
  if (status) query += \` AND status = '\\\${status}'\`;

  // Search
  if (q) query += \` AND (name LIKE '%\\\${q}%' OR email LIKE '%\\\${q}%')\`;

  // Sorting (prefix with - for descending)
  if (sort) {
    const direction = sort.startsWith('-') ? 'DESC' : 'ASC';
    const field = sort.replace('-', '');
    query += \` ORDER BY \\\${field} \\\${direction}\`;
  }

  const users = await db.query(query);
  res.json({ data: users, meta: { total: users.length } });
}

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function updateUser() {}
function patchUser() {}
function deleteUser() {}
function getUserPosts() {}
function createUserPost() {}

app.listen(3000);`,
      exercise: `1. **Design a REST API**: Design the complete REST API for a bookstore application: books, authors, reviews, and user wishlists. Include URL paths, HTTP methods, request/response bodies, and status codes.

2. **Pagination Comparison**: Implement cursor-based pagination for a messages endpoint where new messages are constantly being added. Explain why offset pagination would fail here.

3. **Error Standardization**: Design an error response format that includes: error code, human-readable message, field-level validation errors, request ID for debugging, and documentation link. Show 5 example error responses.

4. **Versioning Migration**: Your API v1 returns user names as a single \`name\` field. V2 splits it into \`firstName\` and \`lastName\`. Design the migration strategy to support both versions simultaneously.

5. **Rate Limiting Design**: Design a rate limiting strategy for your REST API with different tiers: free (100 req/hour), pro (1000 req/hour), enterprise (unlimited). How would you implement this?`,
      commonMistakes: [
        "Using verbs in URLs (/api/getUsers) instead of nouns (/api/users) — REST uses HTTP methods to convey the action, not the URL. URLs should represent resources, not operations.",
        "Returning 200 OK with an empty body for creation — use 201 Created with the created resource in the body and a Location header pointing to the new resource.",
        "Not versioning APIs from the start — adding versioning later is painful. Always start with /api/v1/ even if you think you'll never need v2.",
        "Using offset pagination for large datasets — OFFSET 1000000 requires the database to scan and skip 1M rows. Use cursor-based pagination for performance at scale.",
        "Inconsistent response formats — sometimes returning {users: [...]}, sometimes {data: [...]}, sometimes just [...]. Pick ONE envelope format and use it everywhere.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What makes an API RESTful? What are the key constraints?",
          a: "A RESTful API follows these six constraints defined by Roy Fielding:\n\n1. **Client-Server**: Frontend and backend are independent — either can evolve separately\n2. **Stateless**: Each request contains all info needed (auth tokens, context). Server doesn't store session state.\n3. **Cacheable**: Responses include cache metadata (Cache-Control, ETag). Improves scalability.\n4. **Uniform Interface**: Resources identified by URLs. CRUD via HTTP methods. Consistent response format.\n5. **Layered System**: Client can't tell if it's talking to origin server, CDN, or proxy.\n6. **Code on Demand** (optional): Server can send executable code (JavaScript).\n\n**In practice**, most APIs that claim to be REST are actually 'REST-like' — they follow the URL and method conventions but may not enforce all constraints (especially HATEOAS).",
        },
        {
          type: "scenario",
          q: "You need to design an API endpoint that performs a complex action like 'transfer money from account A to account B.' How do you make this RESTful?",
          a: 'This is a common challenge — not everything maps cleanly to CRUD. Two approaches:\n\n**Approach 1: Create a \'transfer\' resource**\n```\nPOST /api/v1/transfers\n{\n  "fromAccount": "acc_123",\n  "toAccount": "acc_456",\n  "amount": 100.00,\n  "currency": "USD",\n  "idempotencyKey": "txn_abc123"\n}\n```\nResponse: 201 Created with the transfer resource (status, timestamp, etc.)\n\nThis is RESTful because you\'re creating a new \'transfer\' resource.\n\n**Approach 2: Use a sub-resource action**\n```\nPOST /api/v1/accounts/acc_123/transfers\n```\n\nI prefer Approach 1 because transfers are a first-class entity with their own lifecycle (pending → completed → failed).',
        },
      ],
    },
    {
      id: "sd-graphql-and-grpc",
      title: "GraphQL & gRPC",
      explanation: `While REST dominates public APIs, two other paradigms are widely used in modern systems: **GraphQL** (for flexible client-driven queries) and **gRPC** (for high-performance service-to-service communication).

## GraphQL

GraphQL is a **query language for APIs** developed by Facebook. Instead of the server deciding what data to return (REST), the **client specifies exactly what it needs**.

### REST vs GraphQL

| Aspect | REST | GraphQL |
|--------|------|---------|
| **Endpoints** | Multiple (/users, /posts, /comments) | Single (/graphql) |
| **Data fetching** | Server decides response shape | Client specifies exact fields |
| **Over-fetching** | Returns all fields (wasteful) | Returns only requested fields |
| **Under-fetching** | Need multiple requests for related data | Single request gets related data |
| **Versioning** | URL versioning (/v1, /v2) | Schema evolution (deprecate fields) |
| **Caching** | HTTP caching works naturally | Requires specialized caching |

### When to Use GraphQL
- **Mobile apps**: Bandwidth is limited, need minimal payloads
- **Complex UIs**: Dashboard that pulls data from many resources
- **Rapid iteration**: Frontend team can change data requirements without backend changes
- **Multiple clients**: Web, mobile, TV all need different data shapes

## gRPC

gRPC is a **high-performance RPC (Remote Procedure Call)** framework developed by Google. It uses **Protocol Buffers (protobuf)** for serialization — a binary format that's 3-10x smaller and faster than JSON.

### REST vs gRPC

| Aspect | REST | gRPC |
|--------|------|------|
| **Protocol** | HTTP/1.1 or HTTP/2 | HTTP/2 (always) |
| **Data format** | JSON (text) | Protocol Buffers (binary) |
| **Payload size** | Larger (human-readable) | 3-10x smaller |
| **Speed** | Good | Excellent (low latency) |
| **Streaming** | Limited (SSE) | Bidirectional streaming built-in |
| **Browser support** | Native | Requires gRPC-Web proxy |
| **Code generation** | Manual or OpenAPI | Automatic from .proto files |

### When to Use gRPC
- **Microservice-to-microservice** communication (internal APIs)
- **Low latency required**: Real-time systems, gaming backends
- **Streaming**: Bidirectional streaming for live data
- **Polyglot systems**: Auto-generated clients in any language

> **Rule of thumb**: REST for public APIs and web clients → GraphQL when clients need flexible queries → gRPC for internal microservice communication where performance matters.`,
      codeExample: `// ============================================
// GraphQL & gRPC — Comparison with REST
// ============================================

// ---------- The Over-Fetching Problem (REST) ----------

// REST: Fetch user profile page data
// Need: user name, avatar, last 5 posts, and follower count

// Request 1: Get user
// GET /api/v1/users/123
// Returns ALL 20 fields: id, name, email, phone, address, bio, avatar, ...
// You only need: name, avatar ← REST returns everything

// Request 2: Get user's posts
// GET /api/v1/users/123/posts?limit=5
// Returns ALL post fields: id, content, media, tags, likes, comments, ...
// You only need: title, preview ← Over-fetching again

// Request 3: Get follower count
// GET /api/v1/users/123/followers/count
// Separate request just for a number ← Under-fetching problem

// Total: 3 HTTP requests, 90% of data downloaded is unused!

// ---------- GraphQL Solution ----------

// ONE request to /graphql with exactly what you need:
const graphqlQuery = \`
  query UserProfile($userId: ID!) {
    user(id: $userId) {
      name
      avatar
      followerCount
      posts(limit: 5) {
        title
        preview
        createdAt
      }
    }
  }
\`;

// Server implementation (Node.js + Apollo):
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql\`
  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
    followerCount: Int!
    posts(limit: Int = 10): [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    preview: String!
    author: User!
    createdAt: String!
    likes: Int!
  }

  type Query {
    user(id: ID!): User
    users(limit: Int, cursor: String): UserConnection!
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
    updateUser(id: ID!, input: UpdateUserInput!): User!
  }

  input CreatePostInput {
    title: String!
    content: String!
  }

  input UpdateUserInput {
    name: String
    avatar: String
  }

  type UserConnection {
    edges: [User!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }
\`;

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      return await db.findUser(id);
    },
    users: async (_, { limit = 20, cursor }) => {
      return await db.listUsers(limit, cursor);
    },
  },
  User: {
    // Field-level resolver — only runs if client requests this field
    posts: async (user, { limit }) => {
      return await db.getPostsByUser(user.id, limit);
    },
    followerCount: async (user) => {
      return await db.countFollowers(user.id);
    },
  },
  Mutation: {
    createPost: async (_, { input }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await db.createPost(context.user.id, input);
    },
  },
};

// ---------- gRPC Service Definition (.proto) ----------

// user_service.proto
const protoDefinition = \`
syntax = "proto3";

package userservice;

// Service definition
service UserService {
  // Unary RPC (request-response)
  rpc GetUser (GetUserRequest) returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);

  // Server streaming (server sends multiple responses)
  rpc ListUsers (ListUsersRequest) returns (stream User);

  // Client streaming (client sends multiple requests)
  rpc BatchCreateUsers (stream CreateUserRequest) returns (BatchResult);

  // Bidirectional streaming
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);
}

// Message definitions
message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  string avatar = 4;
  int64 created_at = 5;
}

message GetUserRequest {
  int64 id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message ListUsersRequest {
  int32 limit = 1;
  string cursor = 2;
}

message BatchResult {
  int32 created = 1;
  int32 failed = 2;
}

message ChatMessage {
  string user_id = 1;
  string content = 2;
  int64 timestamp = 3;
}
\`;

// gRPC Node.js Client usage (auto-generated from .proto):
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

async function grpcClientExample() {
  // Load proto file (auto-generates typed client)
  const packageDef = protoLoader.loadSync('user_service.proto');
  const userProto = grpc.loadPackageDefinition(packageDef).userservice;

  // Create client
  const client = new userProto.UserService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  // Unary call (like REST GET)
  client.GetUser({ id: 123 }, (err, user) => {
    console.log('gRPC response:', user); // Binary → auto-decoded
  });

  // Server streaming (like SSE)
  const stream = client.ListUsers({ limit: 100 });
  stream.on('data', (user) => console.log('Got user:', user.name));
  stream.on('end', () => console.log('Stream complete'));
}

// ---------- When to Use What — Decision Matrix ----------

const decisionMatrix = {
  'Public API (web/mobile clients)': 'REST or GraphQL',
  'Internal microservices': 'gRPC',
  'Mobile app with complex data needs': 'GraphQL',
  'Simple CRUD API': 'REST',
  'Real-time streaming between services': 'gRPC (bidirectional streaming)',
  'Third-party developer API': 'REST (universally understood)',
  'Browser-to-server real-time': 'WebSocket (not gRPC — browser support limited)',
};

console.log('API Decision Matrix:', decisionMatrix);`,
      exercise: `1. **Migration Scenario**: Your REST API has grown to 50+ endpoints and mobile clients are complaining about over-fetching. Design a migration plan from REST to GraphQL. What do you keep? What changes?

2. **GraphQL Schema Design**: Design a complete GraphQL schema for an e-commerce application: products, categories, cart, orders, reviews. Include queries, mutations, and proper type relationships.

3. **gRPC vs REST Benchmark**: If a REST endpoint returns a 2KB JSON response and the equivalent gRPC returns 600 bytes of protobuf, calculate the bandwidth savings for 1M requests per day.

4. **Choose the Right Protocol**: For each scenario decide REST, GraphQL, or gRPC and justify: (a) Public developer API for a payment platform, (b) Internal communication between 15 microservices, (c) Mobile app dashboard showing data from 6 different services, (d) IoT device sending telemetry data.

5. **GraphQL N+1 Problem**: Explain the N+1 query problem in GraphQL. If a client queries 20 users with their posts, how many database queries will naively execute? Implement a DataLoader-based solution.`,
      commonMistakes: [
        "Using gRPC for browser-facing APIs — browsers don't natively support gRPC. You'd need a gRPC-Web proxy (like Envoy), adding infrastructure complexity. Use REST or GraphQL for web clients.",
        "Not implementing DataLoader for GraphQL — without batching, a query for 20 users with posts triggers 1 + 20 = 21 database queries (N+1 problem). DataLoader batches these into 2 queries.",
        "Choosing GraphQL for simple CRUD APIs — GraphQL adds complexity (schema definition, resolver structure, specialized caching). If your API is simple CRUD, REST is more appropriate.",
        "Ignoring gRPC's streaming capabilities — many teams use gRPC like REST (unary calls only). gRPC's real power is in server streaming, client streaming, and bidirectional streaming for real-time data.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you choose GraphQL over REST, and vice versa?",
          a: "**Choose GraphQL when:**\n1. **Multiple clients** need different data shapes (web vs mobile vs TV)\n2. **Complex, nested data** — dashboard pulling from 5+ services\n3. **Rapid frontend iteration** — frontend team doesn't want to wait for backend API changes\n4. **Bandwidth matters** — mobile apps on slow networks\n\n**Choose REST when:**\n1. **Simple CRUD** — straightforward resource operations\n2. **Public APIs** — REST is universally understood by developers\n3. **HTTP caching is important** — REST works with CDNs out of the box, GraphQL requires specialized caching\n4. **File uploads** — REST handles multipart uploads naturally; GraphQL needs workarounds\n5. **Small team** — REST has lower learning curve and tooling overhead\n\n**Hybrid approach**: Use REST for simple endpoints and GraphQL for complex data aggregation (this is what GitHub and Shopify do).",
        },
        {
          type: "tricky",
          q: "Why is gRPC faster than REST? Is it just because of binary serialization?",
          a: "Binary serialization (protobuf) is ONE factor, but gRPC's speed advantage comes from **multiple sources**:\n\n1. **Protobuf** (binary) is 3-10x smaller than JSON — less data to serialize/deserialize and transmit\n2. **HTTP/2 multiplexing** — gRPC always uses HTTP/2, allowing multiple requests on one connection without head-of-line blocking\n3. **Header compression** (HPACK in HTTP/2) — repeated headers are compressed, not sent in full each time\n4. **Connection reuse** — HTTP/2 persistent connections avoid TCP handshake overhead\n5. **Schema-first** — the .proto file generates optimized serialization code; no reflection or runtime parsing needed\n6. **Streaming** — no need to buffer entire responses; data flows in chunks\n\n**Caveat**: For simple, infrequent requests, the difference is negligible. gRPC's advantage shows at **high volume** (10K+ req/sec) and **large payloads**.",
        },
      ],
    },
    {
      id: "sd-api-gateway-rate-limiting",
      title: "API Gateway & Rate Limiting",
      explanation: `An **API Gateway** is the single entry point for all client requests in a distributed system. It sits between clients and your backend services, handling cross-cutting concerns like authentication, rate limiting, routing, and request transformation.

## What an API Gateway Does

| Function | Description |
|----------|-------------|
| **Routing** | Routes requests to the correct backend service |
| **Authentication** | Validates tokens/API keys before forwarding |
| **Rate Limiting** | Prevents abuse and protects backends |
| **Load Balancing** | Distributes requests across service instances |
| **SSL Termination** | Handles HTTPS, forwards plain HTTP internally |
| **Request Transform** | Modifies headers, body, or URL before forwarding |
| **Response Aggregation** | Combines responses from multiple services |
| **Caching** | Caches responses to reduce backend load |
| **Monitoring** | Logs requests, tracks latency, generates metrics |

## Rate Limiting Algorithms

### 1. Token Bucket
- Bucket holds tokens (max capacity = burst limit)
- Tokens added at a fixed rate (e.g., 10/second)
- Each request consumes 1 token
- If bucket is empty, request is rejected
- **Pros**: Allows bursts up to bucket capacity
- **Used by**: AWS, Stripe

### 2. Sliding Window
- Track request count in a rolling time window
- More precise than fixed window (no boundary burst issue)
- **Pros**: Smooth rate limiting, no boundary spikes
- **Used by**: Kong, Cloudflare

### 3. Fixed Window Counter
- Count requests in fixed time windows (e.g., per minute)
- Reset counter at window boundary
- **Cons**: Double-burst at window boundaries (59th second + 1st second)
- **Pros**: Simple, memory-efficient

### 4. Leaky Bucket
- Requests enter a queue (bucket)
- Processed at a fixed rate (leak rate)
- If bucket is full, new requests are rejected
- **Pros**: Smooth output rate, no bursts
- **Used by**: Network traffic shaping

## Rate Limiting in Distributed Systems

The challenge: with multiple API Gateway instances behind a load balancer, each instance has its own counter. A user could send 100 requests each to 5 instances = 500 total while each instance thinks they only sent 100.

**Solution**: Use a **centralized counter** in Redis/Memcached that all instances share.

> **Trade-off**: Centralized counting adds a Redis call per request (~0.5ms latency) but ensures accurate global rate limits.`,
      codeExample: `// ============================================
// API Gateway & Rate Limiting — Implementation
// ============================================

// ---------- Token Bucket Rate Limiter ----------

class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;       // Max tokens (burst limit)
    this.refillRate = refillRate;    // Tokens added per second
    this.tokens = capacity;         // Start full
    this.lastRefillTime = Date.now();
  }

  tryConsume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return {
        allowed: true,
        remainingTokens: Math.floor(this.tokens),
        retryAfterMs: 0,
      };
    }

    // Calculate when enough tokens will be available
    const deficit = tokens - this.tokens;
    const retryAfterMs = Math.ceil(deficit / this.refillRate * 1000);

    return {
      allowed: false,
      remainingTokens: 0,
      retryAfterMs,
    };
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefillTime) / 1000;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefillTime = now;
  }
}

// ---------- Sliding Window Rate Limiter ----------

class SlidingWindowRateLimiter {
  constructor(windowSizeMs, maxRequests) {
    this.windowSizeMs = windowSizeMs;
    this.maxRequests = maxRequests;
    this.requests = new Map(); // clientId → [timestamps]
  }

  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowSizeMs;

    // Get or create request log for this client
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, []);
    }

    const clientRequests = this.requests.get(clientId);

    // Remove requests outside the window
    const validRequests = clientRequests.filter(t => t > windowStart);
    this.requests.set(clientId, validRequests);

    if (validRequests.length >= this.maxRequests) {
      const oldestInWindow = validRequests[0];
      const retryAfterMs = oldestInWindow + this.windowSizeMs - now;

      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.ceil(retryAfterMs),
      };
    }

    validRequests.push(now);
    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      retryAfterMs: 0,
    };
  }
}

// ---------- Distributed Rate Limiter (Redis) ----------

class RedisRateLimiter {
  constructor(redis, windowSizeSeconds, maxRequests) {
    this.redis = redis;
    this.windowSize = windowSizeSeconds;
    this.maxRequests = maxRequests;
  }

  async isAllowed(clientId) {
    const key = \`ratelimit:\\\${clientId}\`;
    const now = Date.now();

    // Lua script for atomic check-and-increment
    // This runs on the Redis server — no race conditions!
    const luaScript = \`
      local key = KEYS[1]
      local window = tonumber(ARGV[1])
      local maxRequests = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])

      -- Remove old entries outside the window
      redis.call('ZREMRANGEBYSCORE', key, 0, now - window * 1000)

      -- Count current entries
      local count = redis.call('ZCARD', key)

      if count < maxRequests then
        -- Add this request
        redis.call('ZADD', key, now, now .. '-' .. math.random(10000))
        redis.call('EXPIRE', key, window)
        return {1, maxRequests - count - 1}  -- allowed, remaining
      else
        return {0, 0}  -- denied, 0 remaining
      end
    \`;

    const result = await this.redis.eval(
      luaScript, 1, key, this.windowSize, this.maxRequests, now
    );

    return {
      allowed: result[0] === 1,
      remaining: result[1],
    };
  }
}

// ---------- API Gateway Middleware ----------

class APIGateway {
  constructor() {
    this.rateLimiters = {
      free: new TokenBucket(100, 100 / 3600),        // 100 req/hour
      pro: new TokenBucket(1000, 1000 / 3600),       // 1000 req/hour
      enterprise: new TokenBucket(100000, 100000 / 3600), // effectively unlimited
    };
    this.routes = new Map();
  }

  registerRoute(path, service) {
    this.routes.set(path, service);
  }

  async handleRequest(req) {
    // 1. Authentication
    const apiKey = req.headers['x-api-key'];
    const client = await this.authenticateClient(apiKey);
    if (!client) {
      return { status: 401, body: { error: 'Invalid API key' } };
    }

    // 2. Rate Limiting
    const limiter = this.rateLimiters[client.tier];
    const result = limiter.tryConsume(1);
    if (!result.allowed) {
      return {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(result.retryAfterMs / 1000),
          'X-RateLimit-Limit': limiter.capacity,
          'X-RateLimit-Remaining': result.remainingTokens,
        },
        body: { error: 'Rate limit exceeded' },
      };
    }

    // 3. Routing
    const service = this.routes.get(req.path);
    if (!service) {
      return { status: 404, body: { error: 'Route not found' } };
    }

    // 4. Forward to backend service
    const startTime = Date.now();
    const response = await service.handle(req);
    const latency = Date.now() - startTime;

    // 5. Add headers and return
    return {
      ...response,
      headers: {
        ...response.headers,
        'X-RateLimit-Remaining': result.remainingTokens,
        'X-Response-Time': \`\\\${latency}ms\`,
        'X-Request-ID': generateRequestId(),
      },
    };
  }

  async authenticateClient(apiKey) {
    // In production: lookup in Redis/DB
    const clients = {
      'key_free_123': { id: 'client1', tier: 'free' },
      'key_pro_456': { id: 'client2', tier: 'pro' },
    };
    return clients[apiKey] || null;
  }
}

function generateRequestId() {
  return 'req_' + Math.random().toString(36).substring(2, 15);
}

// Demo
const bucket = new TokenBucket(10, 2); // 10 max, 2/sec refill
console.log('Request 1:', bucket.tryConsume());
console.log('Request 2:', bucket.tryConsume());

const slider = new SlidingWindowRateLimiter(60000, 5); // 5 per minute
console.log('Window check:', slider.isAllowed('user123'));`,
      exercise: `1. **Rate Limiter Comparison**: Implement all four rate limiting algorithms (Token Bucket, Sliding Window, Fixed Window, Leaky Bucket) and compare their behavior when a client sends 20 requests in 1 second with a limit of 10/second.

2. **Distributed Rate Limiting**: Design a rate limiting system for an API with 10 gateway instances. How do you ensure the global limit of 1000 req/min per client is accurate across all instances?

3. **Tiered Rate Limiting**: Design a rate limiting system with per-endpoint limits: \`GET /users\` allows 1000/min, \`POST /users\` allows 50/min, \`POST /payments\` allows 10/min. How do you handle per-user AND per-endpoint limits simultaneously?

4. **API Gateway Design**: Design a full API gateway that handles: authentication (API key + JWT), rate limiting, routing to 5 microservices, response caching, and request logging. Draw the architecture diagram.

5. **Graceful Degradation**: Your API gateway detects that one backend service is slow (p99 > 5s). Design a circuit breaker pattern that automatically stops routing to the unhealthy service and returns cached/degraded responses.`,
      commonMistakes: [
        "Implementing rate limiting per gateway instance instead of globally — with 5 gateway instances, per-instance limits of 100/min effectively allow 500/min globally. Always use a shared counter (Redis).",
        "Using fixed window counters without considering boundary bursts — a client can send 100 requests at second 59 and 100 at second 61, getting 200 in 2 seconds while the 'per minute' limit is 100.",
        "Not returning proper rate limit headers — clients need Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining to implement proper backoff. Without these, clients can't adjust their request rate.",
        "Making the API gateway a single point of failure — always deploy multiple gateway instances behind a load balancer. Use health checks and auto-scaling.",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a rate limiting system for a public API like Twitter's. What algorithm would you use and why?",
          a: "I'd use a **Token Bucket** algorithm with the following design:\n\n**Why Token Bucket:**\n1. Allows **controlled bursts** — legitimate users may send several requests quickly (loading a page), then go idle\n2. **Simple to understand** and implement\n3. **Used by AWS and Stripe** in production — proven at massive scale\n\n**Architecture:**\n1. **Redis** stores per-user token buckets: `{tokens: 95, lastRefill: timestamp}`\n2. **Lua script** on Redis for atomic check-and-decrement (prevents race conditions)\n3. **Multiple tiers**: Free (60/min, burst 10), Pro (600/min, burst 50), Enterprise (6000/min, burst 200)\n4. **Per-endpoint limits** on top of global limits (writes are more expensive than reads)\n\n**Headers returned**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` (on 429)\n\n**Scale**: Redis handles 100K+ operations/sec, more than enough for rate limiting checks. For extra safety, use Redis Cluster with hash-based routing.",
        },
        {
          type: "conceptual",
          q: "What's the purpose of an API Gateway in a microservices architecture? Can't each service handle its own authentication and rate limiting?",
          a: "Each service **could** handle cross-cutting concerns, but it's a bad idea:\n\n1. **Code duplication**: Auth logic, rate limiting, logging duplicated across 20+ services\n2. **Inconsistency**: Different services may implement auth differently, creating security gaps\n3. **Coupling**: If you change your auth mechanism (e.g., API keys → JWT), you update every service\n4. **No single view**: Without a gateway, you can't see all traffic in one place for monitoring\n\n**The API Gateway centralizes**: Authentication, rate limiting, request routing, SSL termination, logging, and metrics.\n\n**Trade-offs of a gateway**:\n- **Single point of failure** → deploy multiple instances with load balancer\n- **Added latency** → typically 1-5ms overhead (acceptable for the benefits)\n- **Gateway complexity** → must be carefully designed to not become a bottleneck\n\nPopular options: **Kong**, **AWS API Gateway**, **Envoy**, **NGINX**, **Traefik**",
        },
      ],
    },
    {
      id: "sd-api-design-best-practices",
      title: "API Design Best Practices",
      explanation: `Good API design is the difference between a service developers love and one they dread. This topic covers the principles and practices that make APIs **intuitive, robust, and production-ready**.

## Key Principles

### 1. Design for the Consumer
- APIs should be designed from the **consumer's perspective**, not the database schema
- Think about what the client needs, not what the server stores

### 2. Be Consistent
- Use the same patterns everywhere: naming conventions, error formats, pagination
- If \`/users\` returns \`{ data: [...], pagination: {...} }\`, every list endpoint should too

### 3. Make It Hard to Misuse
- Required fields should be clearly documented
- Invalid requests should return helpful error messages with specific field-level details
- Use enums instead of free-form strings where possible

### 4. Plan for Evolution
- Version from day one
- Use additive changes (adding fields) over breaking changes (removing/renaming)
- Deprecate, don't delete — mark old fields as deprecated, remove after N months

## Idempotency

**Idempotency** means making the same request multiple times produces the same result. This is critical for reliability:

| Method | Naturally Idempotent? | How to Make Idempotent |
|--------|----------------------|------------------------|
| GET | ✅ Yes | N/A |
| PUT | ✅ Yes | N/A |
| DELETE | ✅ Yes | N/A |
| POST | ❌ No | **Idempotency Key** |
| PATCH | ❌ Depends | **Idempotency Key** or conditional update |

## Request ID / Correlation ID

Every request should have a unique identifier that flows through the entire system:
- Client sends \`X-Request-ID\` or server generates one
- ID is logged at every service hop
- Enables end-to-end request tracing in distributed systems

## Contract-First Design

Define the API contract (OpenAPI/Swagger, Protobuf) **before** writing any code:
1. Write the API spec
2. Review with frontend/mobile teams
3. Generate server stubs and client SDKs
4. Implement the server logic

> This prevents the common problem of "backend built an API that doesn't match what the frontend needs."`,
      codeExample: `// ============================================
// API Design Best Practices — Production Patterns
// ============================================

// ---------- Idempotency Key Implementation ----------

const idempotencyStore = new Map(); // In production: Redis with TTL

async function idempotentMiddleware(req, res, next) {
  // Only for non-idempotent methods
  if (['GET', 'PUT', 'DELETE'].includes(req.method)) return next();

  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({
      error: {
        code: 'MISSING_IDEMPOTENCY_KEY',
        message: 'POST requests require an Idempotency-Key header',
      },
    });
  }

  const key = \`\\\${req.path}:\\\${idempotencyKey}\`;

  // Check if this request was already processed
  if (idempotencyStore.has(key)) {
    const cached = idempotencyStore.get(key);
    console.log(\`♻️ Returning cached response for key: \\\${idempotencyKey}\`);
    return res.status(cached.status).json(cached.body);
  }

  // Override res.json to capture the response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Cache the response for 24 hours
    idempotencyStore.set(key, {
      status: res.statusCode,
      body,
      createdAt: Date.now(),
    });
    return originalJson(body);
  };

  next();
}

// ---------- Request/Response Envelope ----------

// ✅ Consistent response format across ALL endpoints
function successResponse(res, data, meta = {}) {
  return res.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId,
      ...meta,
    },
  });
}

function errorResponse(res, status, code, message, details = []) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,  // Field-level errors
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId,
    },
  });
}

// ---------- Input Validation ----------

function validateCreateUser(body) {
  const errors = [];

  if (!body.name || body.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Name is required and must be at least 2 characters',
      code: 'FIELD_TOO_SHORT',
    });
  }

  if (!body.email || !body.email.match(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/)) {
    errors.push({
      field: 'email',
      message: 'A valid email address is required',
      code: 'INVALID_EMAIL',
    });
  }

  if (body.role && !['admin', 'user', 'moderator'].includes(body.role)) {
    errors.push({
      field: 'role',
      message: 'Role must be one of: admin, user, moderator',
      code: 'INVALID_ENUM',
    });
  }

  return errors;
}

// ---------- Deprecation Headers ----------

function deprecatedEndpoint(req, res, next) {
  res.set({
    'Deprecation': 'true',
    'Sunset': 'Sat, 01 Jun 2025 00:00:00 GMT',
    'Link': '</api/v2/users>; rel="successor-version"',
  });
  console.warn(\`⚠️ Deprecated endpoint accessed: \\\${req.path}\`);
  next();
}

// ---------- Health Check Endpoint ----------

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.2.3',
    uptime: process.uptime(),
    checks: {
      database: 'connected',
      cache: 'connected',
      messageQueue: 'connected',
    },
  });
});

// ---------- API Versioning with Backward Compatibility ----------

// V1: { name: "John Doe" }
// V2: { firstName: "John", lastName: "Doe" }

app.get('/api/v1/users/:id', deprecatedEndpoint, async (req, res) => {
  const user = await db.findUser(req.params.id);
  // V1 format: combined name
  successResponse(res, {
    id: user.id,
    name: \`\\\${user.firstName} \\\${user.lastName}\`, // Computed for backward compat
    email: user.email,
  });
});

app.get('/api/v2/users/:id', async (req, res) => {
  const user = await db.findUser(req.params.id);
  // V2 format: split name fields
  successResponse(res, {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,   // New field in V2
  });
});

// ---------- Request ID / Correlation ID ----------

function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || generateUUID();
  res.locals.requestId = requestId;
  res.set('X-Request-ID', requestId);

  // Log every request with its ID
  console.log(\`[\\\${requestId}] \\\${req.method} \\\${req.path}\`);
  next();
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Register middleware
app.use(requestIdMiddleware);
app.use(idempotentMiddleware);`,
      exercise: `1. **API Review**: Review a poorly designed API with these endpoints: POST /getUser, GET /users/delete/123, POST /api/users (returns 200 on creation, no Location header). List all issues and redesign it.

2. **Idempotency Implementation**: Design an idempotency system for a payment API. Handle these edge cases: (a) same key with different request body, (b) concurrent requests with same key, (c) key storage TTL and cleanup.

3. **Error Response Design**: Create an error response specification that handles: validation errors (multiple fields), authentication errors, authorization errors, rate limiting, server errors, and maintenance mode. Show example responses for each.

4. **Breaking Change Management**: Your API needs to change user IDs from integers to UUIDs. Design a migration plan that: (a) doesn't break existing clients, (b) gradually migrates traffic, (c) has a clear sunset timeline.

5. **Contract-First Design**: Write an OpenAPI 3.0 specification for a simple todo list API. Include request/response schemas, error responses, authentication, and at least 5 endpoints.`,
      commonMistakes: [
        "Not implementing idempotency keys for POST endpoints — network retries, client-side bugs, and load balancer timeouts can all cause duplicate requests. Without idempotency keys, you'll get duplicate payments, double orders, etc.",
        "Returning different response formats from different endpoints — inconsistent envelopes make it impossible for clients to write generic error handling or response parsing code.",
        "Making breaking changes without versioning — removing a field, changing a field type, or restructuring responses breaks all existing clients. Always use API versioning.",
        "Not including request IDs — without a correlation ID flowing through the system, debugging production issues becomes almost impossible. You can't trace a user's complaint back to specific server logs.",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "A client reports that they were charged twice for a payment. How would you prevent this in your API design?",
          a: "This is a classic **idempotency** problem. My solution:\n\n1. **Require an Idempotency-Key header** on all payment endpoints (POST /payments)\n2. Client generates a UUID for each payment intent and sends it with every request\n3. Server flow:\n   - Check Redis: `GET idempotency:{key}`\n   - **If exists**: Return the cached response (no re-processing)\n   - **If not**: Process payment, store result in Redis with TTL (24h): `SET idempotency:{key} {response} EX 86400`\n   - **Race condition**: Use `SET NX` (set if not exists) to handle concurrent duplicate requests\n\n4. **Edge cases**:\n   - Same key, different body → Return 422 (Idempotency Key reused)\n   - Key for in-progress request → Return 409 (Request in progress)\n   - Expired key → Process as new request\n\nStripe, PayPal, and Square all use this exact pattern.",
        },
        {
          type: "conceptual",
          q: "What's the difference between API versioning strategies? Which would you recommend?",
          a: "Three main strategies:\n\n**1. URL Path** (`/api/v1/users`)\n- ✅ Most explicit, easy to route, easy to test\n- ❌ URL 'pollution,' harder to share code between versions\n- Used by: Stripe, Twitter, Google\n\n**2. Header** (`Accept: application/vnd.api.v1+json`)\n- ✅ Clean URLs, semantic\n- ❌ Hidden from users, harder to test in browser\n- Used by: GitHub\n\n**3. Query Parameter** (`/api/users?version=1`)\n- ✅ Easy to add, flexible\n- ❌ Easy to forget, can conflict with other params\n- Used by: AWS (some services)\n\n**My recommendation**: **URL path versioning** for these reasons:\n1. Most developer-friendly — visible, explicit, no hidden headers\n2. Easy to route at the load balancer/gateway level\n3. Easy to deprecate — just return 301 from old version to new\n4. Industry standard — most developers expect it",
        },
      ],
    },
  ],
};

export default sdPhase3;
