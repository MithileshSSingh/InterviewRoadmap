const nodePhase9 = {
  id: "phase-9",
  title: "Phase 9: REST API Design & GraphQL",
  emoji: "🔗",
  description:
    "Design production-grade REST APIs following best practices, implement GraphQL APIs, and learn API versioning, documentation, and real-time communication with WebSockets.",
  topics: [
    {
      id: "rest-api-design",
      title: "REST API Design Principles",
      explanation: `**REST (Representational State Transfer)** is an architectural style for designing web APIs. A well-designed REST API is intuitive, consistent, and scalable.

**Core REST principles:**
1. **Resources** — Everything is a resource identified by a URL
2. **HTTP methods** — Use verbs correctly (GET, POST, PUT, PATCH, DELETE)
3. **Stateless** — Each request contains all information needed
4. **Uniform interface** — Consistent URL patterns and response formats
5. **HATEOAS** — Responses include links to related resources

**URL design conventions:**
\`\`\`
GET    /api/v1/users           → List users (collection)
GET    /api/v1/users/42        → Get user 42 (resource)
POST   /api/v1/users           → Create a user
PUT    /api/v1/users/42        → Replace user 42 (full update)
PATCH  /api/v1/users/42        → Partial update user 42
DELETE /api/v1/users/42        → Delete user 42

# Sub-resources (relationships)
GET    /api/v1/users/42/posts        → User 42's posts
POST   /api/v1/users/42/posts        → Create a post for user 42
GET    /api/v1/users/42/posts/7      → User 42's post 7

# Query parameters (filtering, sorting, pagination)
GET    /api/v1/users?role=admin&sort=-createdAt&page=2&limit=20
GET    /api/v1/posts?search=nodejs&tags=tutorial,guide
\`\`\`

**Response format (consistent envelope):**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20 },
  "links": { "next": "/api/v1/users?page=2" }
}
\`\`\`

**Status code usage:**
| Code | When to use |
|------|-------------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Bad request (validation errors) |
| 401 | Unauthorized (no/invalid auth) |
| 403 | Forbidden (auth OK, no permission) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 422 | Unprocessable entity (semantic validation) |
| 429 | Too many requests |
| 500 | Internal server error |

🏠 **Real-world analogy:** A REST API is like a **well-organized library catalog**. Each book (resource) has a unique call number (URL). You can browse (GET), donate (POST), update descriptions (PUT/PATCH), or withdraw (DELETE). The catalog follows a consistent system so anyone can find what they need.`,
      codeExample: `// REST API Design — Production-Grade Patterns

const express = require("express");
const app = express();
app.use(express.json());

// === Response helper ===
class APIResponse {
  static success(res, data, statusCode = 200) {
    res.status(statusCode).json({ success: true, data });
  }

  static created(res, data) {
    res.status(201).json({ success: true, data });
  }

  static noContent(res) {
    res.status(204).end();
  }

  static paginated(res, data, meta) {
    res.json({ success: true, data, meta });
  }

  static error(res, message, statusCode = 500, details = null) {
    const response = { success: false, error: { message, statusCode } };
    if (details) response.error.details = details;
    res.status(statusCode).json(response);
  }
}

// === Query parameter helpers ===
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function parseSort(sortString) {
  if (!sortString) return { createdAt: -1 }; // Default: newest first
  const sort = {};
  sortString.split(",").forEach((field) => {
    if (field.startsWith("-")) {
      sort[field.substring(1)] = -1; // Descending
    } else {
      sort[field] = 1; // Ascending
    }
  });
  return sort;
}

function parseFilters(query, allowedFields) {
  const filters = {};
  for (const field of allowedFields) {
    if (query[field] !== undefined) {
      filters[field] = query[field];
    }
  }
  return filters;
}

// === RESTful routes with best practices ===

// Mock data
let posts = [
  { id: 1, title: "Node.js Basics", content: "Learn Node.js...", authorId: 1, tags: ["nodejs", "tutorial"], published: true, createdAt: new Date("2024-01-15") },
  { id: 2, title: "Express Guide", content: "Master Express...", authorId: 1, tags: ["express"], published: true, createdAt: new Date("2024-02-20") },
  { id: 3, title: "Draft Post", content: "WIP...", authorId: 2, tags: [], published: false, createdAt: new Date("2024-03-01") },
];
let nextId = 4;

// GET /api/v1/posts — List with filtering, sorting, pagination
app.get("/api/v1/posts", (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort);
  const filters = parseFilters(req.query, ["published", "authorId"]);

  let result = [...posts];

  // Apply filters
  if (filters.published !== undefined) {
    result = result.filter((p) => p.published === (filters.published === "true"));
  }
  if (filters.authorId) {
    result = result.filter((p) => p.authorId === parseInt(filters.authorId));
  }

  // Search
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(
      (p) => p.title.toLowerCase().includes(search) || p.content.toLowerCase().includes(search)
    );
  }

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  APIResponse.paginated(res, paginated, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: skip + limit < total,
    hasPrev: page > 1,
  });
});

// GET /api/v1/posts/:id — Get single resource
app.get("/api/v1/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return APIResponse.error(res, "Post not found", 404);
  APIResponse.success(res, post);
});

// POST /api/v1/posts — Create resource
app.post("/api/v1/posts", (req, res) => {
  const { title, content, tags = [], published = false } = req.body;

  // Validation
  const errors = [];
  if (!title || title.length < 3) errors.push({ field: "title", message: "Title required (min 3 chars)" });
  if (!content) errors.push({ field: "content", message: "Content required" });
  if (errors.length) return APIResponse.error(res, "Validation failed", 400, errors);

  const post = { id: nextId++, title, content, tags, published, authorId: 1, createdAt: new Date() };
  posts.push(post);

  APIResponse.created(res, post);
});

// PUT /api/v1/posts/:id — Full update
app.put("/api/v1/posts/:id", (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return APIResponse.error(res, "Post not found", 404);

  const { title, content, tags, published } = req.body;
  if (!title || !content) return APIResponse.error(res, "Title and content required for PUT", 400);

  posts[index] = { ...posts[index], title, content, tags: tags || [], published: published || false };
  APIResponse.success(res, posts[index]);
});

// PATCH /api/v1/posts/:id — Partial update
app.patch("/api/v1/posts/:id", (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return APIResponse.error(res, "Post not found", 404);

  posts[index] = { ...posts[index], ...req.body, id: posts[index].id }; // Don't allow ID change
  APIResponse.success(res, posts[index]);
});

// DELETE /api/v1/posts/:id — Delete resource
app.delete("/api/v1/posts/:id", (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return APIResponse.error(res, "Post not found", 404);
  posts.splice(index, 1);
  APIResponse.noContent(res);
});

app.listen(3000, () => console.log("REST API on http://localhost:3000"));`,
      exercise: `**Exercises:**
1. Build a complete REST API for a blog with posts, comments, and tags — follow all conventions
2. Implement filtering, sorting, searching, and cursor-based pagination
3. Add proper validation with detailed error messages that include field names and reasons
4. Implement API versioning using URL prefix (\`/api/v1/\`, \`/api/v2/\`)
5. Create a consistent response envelope (\`{ success, data, meta, error }\`) used across all endpoints
6. Add HATEOAS links to responses (e.g., \`links: { self, next, prev, author }\`)`,
      commonMistakes: [
        "Using verbs in URLs — `/api/getUsers` is wrong; use nouns: `/api/users` with the HTTP method conveying the action",
        "Not using proper HTTP status codes — returning 200 for everything makes error handling impossible for API consumers",
        "Inconsistent response formats — some endpoints return `{ data }`, others `{ result }`, others raw arrays; use a consistent envelope",
        "Not supporting pagination by default — returning all records in a collection crashes when data grows; always paginate",
        "Using PUT when PATCH is more appropriate — PUT replaces the entire resource; PATCH updates only the provided fields",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the key principles of RESTful API design?",
          a: "**Core principles:** (1) **Resource-based URLs** — nouns, not verbs (`/users`, not `/getUsers`). (2) **HTTP methods** — GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove). (3) **Stateless** — each request is self-contained; no server-side session. (4) **Consistent responses** — standard envelope format with proper status codes. (5) **Pagination** — all collections should be paginated. (6) **Filtering/sorting** — via query parameters. (7) **Versioning** — URL prefix (`/api/v1/`) or header-based. (8) **Error handling** — descriptive error messages with appropriate HTTP status codes. (9) **HATEOAS** — responses include links to related resources.",
        },
        {
          type: "tricky",
          q: "What is the difference between PUT and PATCH in REST APIs?",
          a: "**PUT** replaces the **entire resource**. You must send all fields; missing fields are set to null/default. **PATCH** updates only the **provided fields**; unmentioned fields remain unchanged. **Example:** User has `{name, email, bio}`. `PUT /users/1` with `{name: 'Alice'}` sets email and bio to null. `PATCH /users/1` with `{name: 'Alice'}` only changes name. **Best practice:** Use PATCH for most updates (more flexible, less error-prone). Use PUT when you specifically want to replace the entire resource.",
        },
      ],
    },
    {
      id: "graphql-apis",
      title: "GraphQL with Apollo Server",
      explanation: `**GraphQL** is a query language for APIs that lets clients request **exactly the data they need** — no more, no less. It was created by Facebook in 2015 and is an alternative to REST.

**GraphQL vs REST:**
| Feature | REST | GraphQL |
|---------|------|---------|
| Endpoints | Multiple (\`/users\`, \`/posts\`) | Single (\`/graphql\`) |
| Data fetching | Fixed response shape | Client specifies fields |
| Over-fetching | Common | ❌ Eliminated |
| Under-fetching | Multiple requests needed | ❌ Single query |
| Versioning | URL-based (\`/v1\`, \`/v2\`) | Schema evolution |
| Real-time | WebSockets/SSE | Subscriptions (built-in) |
| Caching | HTTP caching easy | More complex |

**GraphQL building blocks:**
1. **Schema** — defines types, queries, mutations, subscriptions
2. **Resolvers** — functions that fetch data for each field
3. **Queries** — read data
4. **Mutations** — write/modify data
5. **Subscriptions** — real-time updates via WebSockets

**When to use GraphQL:**
- Mobile apps needing bandwidth efficiency
- Complex data relationships with nested queries
- Multiple frontend clients needing different data shapes
- Rapid API iteration without versioning

**When REST is better:**
- Simple CRUD APIs
- File uploads
- Caching-heavy applications
- Small teams / simpler architecture

🏠 **Real-world analogy:** REST is like a **fixed menu** at a restaurant — you order Dish #3 and get everything on the plate (even items you don't want). GraphQL is like a **buffet** — you pick exactly what you want from the available options.`,
      codeExample: `// GraphQL with Apollo Server — Complete Example

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

// 1. Type definitions (schema)
const typeDefs = \`#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    posts: [Post!]!
    postCount: Int!
    createdAt: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String
    published: Boolean!
    author: User!
    tags: [String!]!
    createdAt: String!
  }

  enum Role {
    USER
    ADMIN
    MODERATOR
  }

  type Query {
    users(role: Role, limit: Int, offset: Int): [User!]!
    user(id: ID!): User
    posts(published: Boolean, search: String, limit: Int): [Post!]!
    post(id: ID!): Post
  }

  input CreatePostInput {
    title: String!
    content: String
    tags: [String!]
    published: Boolean
  }

  input UpdatePostInput {
    title: String
    content: String
    tags: [String!]
    published: Boolean
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users(role: Role, limit: Int, offset: Int): [User!]!
    user(id: ID!): User
    posts(published: Boolean, search: String, limit: Int): [Post!]!
    post(id: ID!): Post
    me: User
  }
\`;

// Mock data
const users = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "ADMIN", createdAt: new Date().toISOString() },
  { id: "2", name: "Bob", email: "bob@example.com", role: "USER", createdAt: new Date().toISOString() },
];

const posts = [
  { id: "1", title: "GraphQL Intro", content: "Learn GraphQL...", published: true, authorId: "1", tags: ["graphql"], createdAt: new Date().toISOString() },
  { id: "2", title: "Node.js Tips", content: "Advanced Node...", published: true, authorId: "1", tags: ["nodejs"], createdAt: new Date().toISOString() },
  { id: "3", title: "Draft", content: "WIP...", published: false, authorId: "2", tags: [], createdAt: new Date().toISOString() },
];

// 2. Resolvers
const resolvers = {
  Query: {
    users: (_, { role, limit = 10, offset = 0 }) => {
      let result = [...users];
      if (role) result = result.filter((u) => u.role === role);
      return result.slice(offset, offset + limit);
    },
    user: (_, { id }) => users.find((u) => u.id === id),
    posts: (_, { published, search, limit = 10 }) => {
      let result = [...posts];
      if (published !== undefined) result = result.filter((p) => p.published === published);
      if (search) {
        const s = search.toLowerCase();
        result = result.filter((p) => p.title.toLowerCase().includes(s));
      }
      return result.slice(0, limit);
    },
    post: (_, { id }) => posts.find((p) => p.id === id),
  },

  Mutation: {
    createPost: (_, { input }, context) => {
      const post = {
        id: String(posts.length + 1),
        ...input,
        published: input.published || false,
        tags: input.tags || [],
        authorId: "1", // From auth context
        createdAt: new Date().toISOString(),
      };
      posts.push(post);
      return post;
    },
    updatePost: (_, { id, input }) => {
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Post not found");
      posts[index] = { ...posts[index], ...input };
      return posts[index];
    },
    deletePost: (_, { id }) => {
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Post not found");
      posts.splice(index, 1);
      return true;
    },
  },

  // Field resolvers (for relationships)
  User: {
    posts: (user) => posts.filter((p) => p.authorId === user.id),
    postCount: (user) => posts.filter((p) => p.authorId === user.id).length,
  },

  Post: {
    author: (post) => users.find((u) => u.id === post.authorId),
  },
};

// 3. Create and start server
async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
  console.log(\`GraphQL server at \${url}\`);
}

startServer();

// 4. Example queries (for GraphQL playground)
const exampleQueries = \`
# Get users with their posts
query {
  users {
    id
    name
    posts {
      title
      published
    }
    postCount
  }
}

# Create a post
mutation {
  createPost(input: {
    title: "New Post"
    content: "Content here"
    tags: ["nodejs"]
    published: true
  }) {
    id
    title
    author { name }
  }
}

# Search posts
query {
  posts(search: "graphql", published: true) {
    title
    author { name email }
    tags
  }
}
\`;`,
      exercise: `**Exercises:**
1. Build a GraphQL API with Users, Posts, and Comments — include nested queries for relationships
2. Implement mutations for CRUD operations with input validation
3. Add authentication context — protect mutations with auth middleware
4. Implement the DataLoader pattern to solve the N+1 query problem
5. Add cursor-based pagination using the Relay Connection spec
6. Compare the same feature implemented in REST vs GraphQL — measure request count and payload size`,
      commonMistakes: [
        "N+1 query problem — fetching a list of users and then querying posts for EACH user; use DataLoader for batching",
        "Not limiting query depth — malicious queries can nest deeply and DOS your server; set max depth and complexity limits",
        "Exposing sensitive fields — unlike REST where you control the response shape, GraphQL lets clients query any field; use field-level authorization",
        "Not handling errors properly — GraphQL returns 200 even for errors; use the `errors` array in the response, not HTTP status codes",
        "Building GraphQL on top of REST APIs (REST-to-GraphQL proxy) without addressing N+1 — this creates worse performance than either alone",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you choose GraphQL over REST?",
          a: "**Choose GraphQL when:** (1) **Multiple clients** need different data shapes (mobile gets fewer fields than web). (2) **Complex relationships** — nested queries replace multiple REST calls. (3) **Rapid iteration** — no API versioning needed; clients adjust queries. (4) **Bandwidth-sensitive** — eliminate over-fetching. **Choose REST when:** (1) Simple CRUD with well-defined resources. (2) File uploads (REST handles binary data better). (3) HTTP caching is important (REST leverages it natively). (4) Small team or simple requirements. **In practice:** many companies use both — REST for simple endpoints, GraphQL for complex data requirements.",
        },
        {
          type: "tricky",
          q: "What is the N+1 problem in GraphQL and how do you solve it?",
          a: "**Problem:** When resolving a list of 100 users each with posts, GraphQL calls the `User.posts` resolver 100 times (1 query for users + 100 queries for posts = 101 queries). **Solution: DataLoader** — a utility that batches and caches field-level resolvers. Instead of 100 individual queries, DataLoader collects all user IDs in one tick, then makes a single batched query: `SELECT * FROM posts WHERE authorId IN (1, 2, ..., 100)`. **Implementation:** Create a DataLoader per request in the context: `context.loaders.posts = new DataLoader(ids => Post.find({ authorId: { $in: ids } }))`. In the resolver: `User.posts: (user, _, ctx) => ctx.loaders.posts.load(user.id)`.",
        },
      ],
    },
    {
      id: "websockets-realtime",
      title: "WebSockets & Real-Time Communication",
      explanation: `**WebSockets** enable **bidirectional, full-duplex** communication between client and server over a single TCP connection. Unlike HTTP (request → response), WebSockets allow the server to **push data** to clients at any time.

**WebSocket vs HTTP:**
| Feature | HTTP | WebSocket |
|---------|------|-----------|
| Direction | Client → Server | Bidirectional |
| Connection | New for each request | Persistent |
| Overhead | Headers per request | Minimal after handshake |
| Latency | Higher (new connection) | Low (persistent) |
| Use case | REST APIs, page loads | Chat, live updates, games |

**Server-Sent Events (SSE) vs WebSockets:**
| Feature | SSE | WebSocket |
|---------|-----|-----------|
| Direction | Server → Client only | Bidirectional |
| Protocol | HTTP | Custom (ws://) |
| Reconnection | Automatic | Manual |
| Browser support | All modern browsers | All modern browsers |
| Use case | Live feeds, notifications | Chat, collaboration, games |

**Socket.IO** is the most popular WebSocket library for Node.js. It adds:
- Automatic reconnection
- Room-based broadcasting
- Binary data support
- Fallback to HTTP long-polling
- Acknowledgements (callback on message delivery)

🏠 **Real-world analogy:** HTTP is like **sending letters** — you send a request, wait for a reply. WebSockets are like a **phone call** — once connected, either party can speak at any time, and the line stays open. Socket.IO is like a **conference call app** — it handles reconnection, group calls (rooms), and ensures delivery.`,
      codeExample: `// WebSockets with Socket.IO — Real-Time Chat

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(express.static("public"));

// Track online users
const onlineUsers = new Map();

// 1. Connection handling
io.on("connection", (socket) => {
  console.log(\`User connected: \${socket.id}\`);

  // 2. User joins with username
  socket.on("user:join", (username) => {
    onlineUsers.set(socket.id, { username, joinedAt: Date.now() });
    socket.username = username;

    // Broadcast to all clients
    io.emit("user:online", {
      users: Array.from(onlineUsers.values()),
      count: onlineUsers.size,
    });

    // Notify others
    socket.broadcast.emit("system:message", {
      text: \`\${username} joined the chat\`,
      timestamp: Date.now(),
    });
  });

  // 3. Chat messages
  socket.on("chat:message", (data) => {
    const message = {
      id: Date.now().toString(),
      text: data.text,
      username: socket.username,
      timestamp: Date.now(),
    };

    // Send to everyone (including sender)
    io.emit("chat:message", message);
  });

  // 4. Rooms (channels)
  socket.on("room:join", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("system:message", {
      text: \`\${socket.username} joined #\${roomName}\`,
      room: roomName,
    });
  });

  socket.on("room:message", ({ room, text }) => {
    io.to(room).emit("chat:message", {
      id: Date.now().toString(),
      text,
      username: socket.username,
      room,
      timestamp: Date.now(),
    });
  });

  socket.on("room:leave", (roomName) => {
    socket.leave(roomName);
  });

  // 5. Typing indicator
  socket.on("user:typing", (data) => {
    socket.broadcast.emit("user:typing", {
      username: socket.username,
      isTyping: data.isTyping,
    });
  });

  // 6. Acknowledgements (delivery confirmation)
  socket.on("chat:private", (data, callback) => {
    const { to, text } = data;
    const targetSocket = [...io.sockets.sockets.values()].find(
      (s) => s.username === to
    );

    if (targetSocket) {
      targetSocket.emit("chat:private", {
        from: socket.username,
        text,
        timestamp: Date.now(),
      });
      callback({ delivered: true });
    } else {
      callback({ delivered: false, reason: "User not online" });
    }
  });

  // 7. Disconnection
  socket.on("disconnect", (reason) => {
    console.log(\`User disconnected: \${socket.username} (\${reason})\`);
    onlineUsers.delete(socket.id);

    io.emit("user:online", {
      users: Array.from(onlineUsers.values()),
      count: onlineUsers.size,
    });

    if (socket.username) {
      io.emit("system:message", {
        text: \`\${socket.username} left the chat\`,
        timestamp: Date.now(),
      });
    }
  });
});

// 8. Server-Sent Events (SSE) endpoint — simpler alternative
app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const intervalId = setInterval(() => {
    const data = JSON.stringify({ timestamp: Date.now(), message: "heartbeat" });
    res.write(\`data: \${data}\\n\\n\`);
  }, 5000);

  req.on("close", () => {
    clearInterval(intervalId);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
      exercise: `**Exercises:**
1. Build a real-time chat application with Socket.IO — support usernames, message history, and online user list
2. Implement chat rooms (channels) with join/leave and room-specific messaging
3. Add typing indicators that show when other users are typing
4. Implement private messaging with delivery acknowledgements
5. Build a real-time notification system using Server-Sent Events (SSE)
6. Scale Socket.IO horizontally across multiple servers using the Redis adapter`,
      commonMistakes: [
        "Not implementing reconnection logic — network disruptions are common; Socket.IO handles this automatically, but raw WebSocket requires manual reconnection",
        "Broadcasting to all sockets including the sender — use `socket.broadcast.emit()` (excludes sender) vs `io.emit()` (includes sender) correctly",
        "Not authenticating WebSocket connections — validate tokens in the handshake middleware, not after connection",
        "Storing WebSocket state only in memory — when scaling to multiple servers, use Redis adapter for Socket.IO to share state",
        "Using WebSockets for everything — simple one-way updates are better served by SSE (simpler, auto-reconnect); use WebSockets only when bidirectional communication is needed",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are WebSockets and how do they differ from HTTP?",
          a: "WebSockets provide **persistent, bidirectional** communication over a single TCP connection. **HTTP** is request-response: client sends a request, server responds, connection closes (or stays idle for keep-alive). **WebSockets** start with an HTTP handshake (Upgrade header), then upgrade to a persistent connection where both client and server can send messages at any time. **Key differences:** (1) WebSockets are full-duplex (both sides send simultaneously), HTTP is half-duplex. (2) WebSockets have minimal overhead per message (just 2-6 bytes header vs HTTP's 200+ bytes). (3) WebSockets maintain state (connection is persistent), HTTP is stateless.",
        },
        {
          type: "scenario",
          q: "How would you scale a WebSocket application across multiple servers?",
          a: "**Challenges:** WebSocket connections are sticky — a client connects to one server. If you need to send a message from server A to a client on server B, you need inter-server communication. **Solutions:** (1) **Socket.IO Redis adapter** — uses Redis Pub/Sub so events are broadcast across all servers. (2) **Sticky sessions** — configure load balancer (nginx) to route a client to the same server using IP hash or cookies. (3) **Message broker** — use RabbitMQ/Kafka for inter-server events. (4) **Dedicated WebSocket service** — separate the WebSocket layer from the API layer. (5) **Managed services** — use AWS API Gateway WebSocket, Pusher, or Ably for serverless WebSocket scaling.",
        },
      ],
    },
  ],
};

export default nodePhase9;
