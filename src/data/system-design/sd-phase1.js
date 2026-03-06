const sdPhase1 = {
  id: "phase-1",
  title: "Phase 1: Fundamentals & Thinking Like a System Designer",
  emoji: "🧠",
  description:
    "Build your foundation — understand client-server architecture, learn to gather requirements, estimate capacity, and reason about trade-offs before diving into any design.",
  topics: [
    {
      id: "sd-client-server-architecture",
      title: "Client-Server Architecture",
      explanation: `Understanding the **client-server model** is the first step in system design. Every modern application, from a simple website to Netflix, is built on this fundamental pattern.

## 🏠 Real-world Analogy
Think of a **restaurant**: the customer (client) places an order, the waiter (network) carries it to the kitchen (server), and the chef (backend logic) prepares the food (response). The customer never goes into the kitchen — they only interact through the waiter.

## How It Works

| Component | Role | Example |
|-----------|------|---------|
| **Client** | Sends requests, renders UI | Browser, mobile app, CLI |
| **Server** | Processes requests, manages data | Web server, API server |
| **Protocol** | Rules for communication | HTTP, WebSocket, gRPC |
| **Database** | Persistent storage | PostgreSQL, MongoDB |

## Key Concepts

- **Request-Response Cycle**: The client sends a request (e.g., GET /users), the server processes it, queries the database if needed, and returns a response (e.g., JSON with user data).
- **Stateless vs Stateful Servers**: In a **stateless** architecture, the server doesn't remember previous requests — each request contains all necessary information (e.g., JWT tokens). In a **stateful** architecture, the server maintains session state (e.g., sticky sessions). **Stateless is preferred** in modern distributed systems because it allows horizontal scaling.
- **Tiers**: Applications can be **single-tier** (everything on the client, like a desktop app), **two-tier** (client + database), **three-tier** (client + server + database), or **n-tier** (multiple layers like load balancer, application server, cache, database, CDN).

## Why This Matters in System Design Interviews
Every system design question starts with a client making requests to a server. Understanding this model helps you draw the initial architecture diagram and reason about where to add components like load balancers, caches, and message queues.

> **Pro tip**: Always start your system design interview by drawing a simple client → server → database diagram, then progressively add complexity.`,
      codeExample: `// ============================================
// Client-Server Architecture — Conceptual Demo
// ============================================

// ---------- SERVER SIDE (Node.js + Express) ----------

const express = require('express');
const app = express();

// ❌ BAD: Stateful server — stores session in memory
// This breaks when you add a second server behind a load balancer
let sessionStore = {}; // In-memory session — lost on restart!

app.post('/login-bad', (req, res) => {
  const { userId } = req.body;
  const sessionId = generateSessionId();
  sessionStore[sessionId] = { userId, loggedInAt: Date.now() };
  res.json({ sessionId });
});

app.get('/profile-bad', (req, res) => {
  const session = sessionStore[req.headers['session-id']];
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ userId: session.userId });
});

// ✅ GOOD: Stateless server — uses JWT tokens
// Works perfectly with multiple servers behind a load balancer
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.post('/login', (req, res) => {
  const { userId } = req.body;
  // Token contains all session info — server doesn't need to remember anything
  const token = jwt.sign({ userId, role: 'user' }, SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.get('/profile', authenticateToken, (req, res) => {
  // User info comes FROM the token, not from server memory
  res.json({ userId: req.user.userId, role: req.user.role });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ---------- Three-Tier Architecture Example ----------

// Tier 1: Client (browser) — sends HTTP requests
// Tier 2: Application Server — handles business logic
// Tier 3: Database — persists data

// This server IS Tier 2
app.get('/api/users', async (req, res) => {
  try {
    // Tier 2 talks to Tier 3 (database)
    const users = await database.query('SELECT id, name, email FROM users LIMIT 100');
    // Tier 2 returns response to Tier 1 (client)
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15);
}`,
      exercise: `1. **Draw the Architecture**: Sketch a three-tier architecture for an e-commerce site. Label each tier and the communication protocols between them.

2. **Stateless Refactor**: Given a server that stores user preferences in memory, refactor it to be stateless by storing preferences in a database and using tokens for authentication.

3. **Request Flow Trace**: Trace the complete request flow when a user opens "amazon.com" — from DNS resolution to the final rendered page. Include every server involved.

4. **Multi-Tier Design**: Design a 4-tier architecture for a video streaming platform (client, CDN, application server, database). Explain why each tier exists.

5. **Failure Scenario**: Your stateful server crashes and restarts. What happens to all active users? Now explain how a stateless design handles the same crash.

6. **Scaling Exercise**: You have one server handling 1,000 requests/second. Traffic grows to 10,000 req/s. Explain why stateless architecture makes scaling easier than stateful.`,
      commonMistakes: [
        "Designing stateful servers in a distributed system — this causes session loss when servers crash or when load balancers route requests to different servers. Always prefer stateless designs with external session stores.",
        "Confusing client-server with peer-to-peer — in client-server, roles are fixed; in P2P (like BitTorrent), every node is both client and server. Most interview questions assume client-server.",
        "Forgetting about the network — beginners often treat server calls as instant. In reality, network latency (50-200ms), packet loss, and timeouts must be accounted for in every design.",
        "Putting business logic on the client — this creates security vulnerabilities (users can modify client code) and makes updates harder. Keep validation and critical logic server-side.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between stateless and stateful architecture? Why is stateless preferred in distributed systems?",
          a: "A **stateful** server stores session data in memory — it 'remembers' each client between requests. A **stateless** server treats every request independently; all necessary data (like auth tokens) is sent with each request.\n\n**Why stateless is preferred:**\n1. **Horizontal scaling**: Any server can handle any request, so you can add servers freely behind a load balancer\n2. **Fault tolerance**: If a server crashes, no session data is lost\n3. **Simpler deployment**: No need for sticky sessions or session replication\n4. **Better caching**: Stateless responses are more cacheable\n\nTrade-off: Stateless requires tokens (JWT) or external stores (Redis) for session data, adding slight overhead per request.",
        },
        {
          type: "scenario",
          q: "You're designing a real-time collaborative editing tool like Google Docs. Would you use a pure client-server model? Why or why not?",
          a: "A pure request-response client-server model would be **too slow** for real-time collaboration. Instead, I'd use a **hybrid approach**:\n\n1. **WebSockets** for real-time updates — maintains a persistent bidirectional connection between clients and the server\n2. **Operational Transformation (OT)** or **CRDTs** to handle concurrent edits without conflicts\n3. The **server** acts as the central coordinator, receiving edits from all clients, resolving conflicts, and broadcasting the resolved state\n4. **REST API** for non-real-time operations (loading documents, managing permissions)\n\nThis is still fundamentally client-server (the server is the authority), but it uses persistent connections instead of request-response for the real-time parts.",
        },
        {
          type: "tricky",
          q: "If stateless servers are better, why do databases exist? Aren't databases 'stateful'?",
          a: "Great observation! The key distinction is **where** state lives:\n\n- **Application servers** should be stateless — they process requests but don't store data\n- **Databases** are intentionally stateful — they're purpose-built for reliable state management with features like ACID transactions, replication, and backup\n\nThe pattern is: **stateless compute + stateful storage**. This separates concerns — you can scale compute independently from storage, and databases provide guarantees (durability, consistency) that in-memory state on application servers cannot.",
        },
      ],
    },
    {
      id: "sd-requirements-gathering",
      title: "Requirements Gathering & Scope Definition",
      explanation: `The #1 mistake in system design interviews is **jumping into the solution before understanding the problem**. Requirements gathering is the most critical first step in any system design — both in interviews and in real-world engineering.

## Two Types of Requirements

### Functional Requirements (FR)
What the system **must do**:
- "Users can send messages to other users"
- "The system must support group chats up to 500 members"
- "Messages should be delivered in order"

### Non-Functional Requirements (NFR)
How the system **must behave**:

| NFR | Description | Example |
|-----|-------------|---------|
| **Scalability** | Handle growing load | 1M concurrent users |
| **Availability** | Uptime guarantee | 99.99% (52 min downtime/year) |
| **Latency** | Response speed | < 200ms for 99th percentile |
| **Consistency** | Data correctness | Strong consistency for payments |
| **Durability** | Data survival | No message loss, ever |

## The RESHADED Framework
A structured way to cover all NFR dimensions:

- **R**equirements (functional)
- **E**stimation (scale numbers)
- **S**torage schema
- **H**igh-level design
- **A**PI design
- **D**etailed design
- **E**valuation (trade-offs)
- **D**istinctive features (unique selling points)

## Why This Matters

In a 45-minute interview, spending **5-8 minutes** on requirements is not wasted time — it's the most valuable investment. It shows the interviewer you think before you code, you can identify ambiguity, and you design for real constraints rather than imaginary ones.

> **Interview tip**: Always ask "What's our expected scale?" and "What's more important — consistency or availability?" These two questions alone can change your entire design.`,
      codeExample: `// ============================================
// Requirements Gathering — Structured Approach
// ============================================

// Example: Design a URL Shortener (like bit.ly)
// This shows how to document requirements before designing

// ---------- Step 1: Clarifying Questions ----------
const clarifyingQuestions = [
  "How many URLs will be shortened per day?",         // → Scale
  "How long should shortened URLs be valid?",          // → Data retention
  "Should users be able to customize short URLs?",     // → Feature scope
  "Do we need click analytics?",                       // → Feature scope
  "What's the expected read:write ratio?",             // → Access pattern
  "Should links be deletable/editable?",               // → Mutability
  "Do we need user accounts or anonymous access?",     // → Auth scope
];

// ---------- Step 2: Functional Requirements ----------
const functionalRequirements = {
  core: [
    "Given a long URL, generate a unique short URL",
    "When user accesses short URL, redirect to original long URL",
    "Short URLs should expire after a configurable TTL (default: 5 years)",
  ],
  extended: [
    "Users can create custom short URLs (e.g., bit.ly/my-link)",
    "Track click analytics: count, referrer, geo-location",
    "API access for programmatic URL shortening",
  ],
  outOfScope: [
    "User registration and authentication (for MVP)",
    "URL content previews / screenshots",
    "Malware/phishing detection",
  ],
};

// ---------- Step 3: Non-Functional Requirements ----------
const nonFunctionalRequirements = {
  scale: {
    newURLsPerDay: 100_000_000,    // 100M writes/day
    urlRedirectsPerDay: 10_000_000_000, // 10B reads/day → 100:1 read:write
    totalURLsStored: "100 billion over 5 years",
  },
  performance: {
    writeLatency: "< 500ms p99",
    readLatency: "< 50ms p99",     // Redirects must be FAST
    availability: "99.99%",        // 52 minutes downtime per year
  },
  constraints: {
    urlLength: "7-8 characters",   // Short enough to share easily
    characterSet: "a-z, A-Z, 0-9", // 62 possible characters
    uniqueness: "No two long URLs should produce the same short URL",
  },
};

// ---------- Step 4: Back-of-Envelope Math ----------
const estimation = {
  storage: {
    avgURLSize: 500,               // bytes per URL record
    urlsIn5Years: 100_000_000 * 365 * 5, // ≈ 182.5 billion
    totalStorage: "182.5B * 500 bytes ≈ 91 TB",
  },
  bandwidth: {
    incomingWrite: "100M * 500 bytes / 86400 ≈ 580 KB/s",
    outgoingRead: "10B * 500 bytes / 86400 ≈ 58 MB/s",
  },
  qps: {
    writes: "100M / 86400 ≈ 1,160 writes/sec",
    reads: "10B / 86400 ≈ 115,740 reads/sec",
    peakReads: "115,740 * 3 ≈ 347,000 reads/sec (3x peak factor)",
  },
};

// ---------- Step 5: Key Decisions Document ----------
const keyDecisions = {
  consistency: "Eventual consistency is acceptable for analytics; " +
    "strong consistency needed for URL creation (no duplicate short URLs)",
  caching: "Heavy read load (100:1 ratio) → aggressive caching with Redis/Memcached",
  database: "NoSQL (Cassandra/DynamoDB) for horizontal scaling of simple key-value lookups",
  encoding: "Base62 encoding of auto-increment ID or MD5 hash truncation",
};

// This structured approach gives you a CLEAR foundation
// before drawing a single architecture diagram
console.log("Requirements documented. Ready to design!");
console.log("Estimated QPS:", estimation.qps);
console.log("Key tradeoff:", keyDecisions.consistency);`,
      exercise: `1. **Chat Application Requirements**: Write down all functional and non-functional requirements for WhatsApp. Include scale estimates (how many messages/day, users, message size limits).

2. **Ambiguity Detection**: Given just "Design Twitter," list at least 10 clarifying questions you'd ask before starting the design. Categorize them into functional scope, scale, and constraints.

3. **NFR Prioritization**: For an online banking system, rank these NFRs: latency, consistency, availability, scalability. Justify each ranking with a concrete scenario.

4. **Scope Creep Exercise**: You're asked to design a "simple file storage service." Write the MVP requirements, then list 5 features that are tempting to include but should be explicitly marked as out-of-scope for V1.

5. **Requirements to Architecture**: Given these requirements — "500K daily active users, 50ms read latency, 99.9% availability, eventual consistency acceptable" — what architectural components would you immediately select? Explain each choice.`,
      commonMistakes: [
        "Jumping into drawing architecture diagrams before understanding what the system needs to do — the #1 interview killer. Spend 5-8 minutes on requirements first.",
        "Treating all non-functional requirements as equally important — in reality, there are always trade-offs (CAP theorem). Ask the interviewer which NFR matters most.",
        "Not establishing scale numbers early — designing for 100 users vs. 100 million users leads to completely different architectures. Always ask for expected scale.",
        "Ignoring edge cases in requirements — what happens when a URL expires? What if two users create the same custom short URL simultaneously? Surface these during requirements.",
        "Making the scope too large — trying to design every feature of YouTube in 45 minutes is impossible. Explicitly define what's in scope and what's not.",
      ],
      interviewQuestions: [
        {
          type: "behavioral",
          q: "Walk me through how you would start a system design interview. What's the first thing you do?",
          a: "I follow a structured approach in the first 5-8 minutes:\n\n1. **Restate the problem** to confirm I understand it: 'So we're designing a URL shortening service like Bit.ly, correct?'\n2. **Ask clarifying questions** about scope: 'Should we support custom URLs? Analytics? User accounts?'\n3. **Establish scale**: 'How many URLs per day? What's the read:write ratio?'\n4. **Identify key NFRs**: 'Is low latency more important than strong consistency for this system?'\n5. **Do quick back-of-envelope math**: Calculate QPS, storage, and bandwidth\n6. **Define scope explicitly**: 'For this design, I'll focus on core shortening and redirect. Analytics can be V2.'\n\nThis shows the interviewer I think systematically and don't rush to solutions.",
        },
        {
          type: "scenario",
          q: "You're asked to design a system but the interviewer says 'just design it however you want.' How do you handle the lack of constraints?",
          a: "This is actually a test of whether you can **drive the conversation** and make reasonable assumptions. I would:\n\n1. **State explicit assumptions**: 'I'll assume we're designing for a mid-to-large scale — about 10M daily active users'\n2. **Choose a target audience**: 'I'll target consumer-facing with mobile and web clients'\n3. **Set NFR priorities**: 'I'll optimize for availability and low latency over strong consistency'\n4. **Document trade-offs**: 'If we needed strong consistency, the design would change in these specific ways...'\n\nThe key is to **not freeze** — make reasonable assumptions, state them clearly, and design accordingly. The interviewer wants to see your decision-making process, not that you need hand-holding.",
        },
      ],
    },
    {
      id: "sd-back-of-envelope-estimation",
      title: "Back-of-Envelope Estimation",
      explanation: `**Back-of-envelope estimation** is the skill of quickly calculating approximate system capacity requirements — and it's a critical part of system design interviews. You don't need exact numbers; you need to be **within an order of magnitude**.

## Essential Numbers to Memorize

| Metric | Value |
|--------|-------|
| Seconds in a day | ~86,400 (~100K for easy math) |
| Seconds in a month | ~2.5 million |
| 1 million seconds | ~12 days |
| 1 billion seconds | ~31 years |

### Storage & Memory

| Unit | Value |
|------|-------|
| 1 char (ASCII) | 1 byte |
| 1 char (UTF-8) | 1-4 bytes |
| Average tweet | ~300 bytes |
| Average image (compressed) | ~300 KB |
| HD video (1 minute) | ~100 MB |
| 1 million rows (avg 1KB each) | ~1 GB |

### Latency Numbers

| Operation | Time |
|-----------|------|
| L1 cache reference | 0.5 ns |
| L2 cache reference | 7 ns |
| RAM access | 100 ns |
| SSD random read | 150 μs |
| HDD random read | 10 ms |
| Network round-trip (same datacenter) | 0.5 ms |
| Network round-trip (cross-continent) | 150 ms |

### Throughput Rules of Thumb

| System | Throughput |
|--------|-----------|
| Single web server | 1K-10K req/sec |
| MySQL (single node) | 1K-5K queries/sec |
| Redis | 100K-500K ops/sec |
| Kafka (single broker) | 1M messages/sec |

## The 2-Step Estimation Process

1. **Start with daily active users (DAU)** → derive requests per second
2. **Multiply by data per request** → derive storage, bandwidth, and memory needs

## Power of 2 Table

| Power | Exact | Approx |
|-------|-------|--------|
| 2^10 | 1,024 | 1 Thousand (KB) |
| 2^20 | 1,048,576 | 1 Million (MB) |
| 2^30 | 1,073,741,824 | 1 Billion (GB) |
| 2^40 | | 1 Trillion (TB) |

> **Pro tip**: In interviews, always round aggressively. Say "about 100K QPS" not "exactly 115,740.74 QPS." Interviewers want to see your approach, not your arithmetic.`,
      codeExample: `// ============================================
// Back-of-Envelope Estimation — Practice Examples
// ============================================

// ---------- Example 1: Twitter-like Feed Service ----------

function estimateTwitterScale() {
  // Step 1: Users
  const monthlyActiveUsers = 500_000_000; // 500M MAU
  const dailyActiveUsers = monthlyActiveUsers * 0.4; // 200M DAU (40% MAU)

  // Step 2: Activity per user
  const tweetsPerUserPerDay = 2;           // Average (most users read, few tweet)
  const feedRefreshesPerUserPerDay = 20;   // Users scroll feed often
  const followsPerUser = 200;              // Average followings

  // Step 3: QPS (Queries Per Second)
  const secondsInDay = 86_400;             // Round to ~100K for quick math
  const tweetWriteQPS = (dailyActiveUsers * tweetsPerUserPerDay) / secondsInDay;
  // = (200M * 2) / 86400 ≈ 4,630 writes/sec

  const feedReadQPS = (dailyActiveUsers * feedRefreshesPerUserPerDay) / secondsInDay;
  // = (200M * 20) / 86400 ≈ 46,300 reads/sec

  const peakMultiplier = 3; // Peak hours = ~3x average
  const peakReadQPS = feedReadQPS * peakMultiplier;
  // ≈ 139,000 reads/sec at peak

  // Step 4: Storage
  const avgTweetSize = 300;    // bytes (280 chars + metadata)
  const tweetsPerDay = dailyActiveUsers * tweetsPerUserPerDay;
  // = 400M tweets/day

  const dailyStorage = tweetsPerDay * avgTweetSize;
  // = 400M * 300 bytes = 120 GB/day

  const yearlyStorage = dailyStorage * 365;
  // = 120 GB * 365 ≈ 43.8 TB/year (text only, no media)

  // Step 5: Media storage (images/videos)
  const percentWithMedia = 0.2;            // 20% of tweets have media
  const avgMediaSize = 500_000;            // 500 KB average
  const dailyMediaStorage = tweetsPerDay * percentWithMedia * avgMediaSize;
  // = 400M * 0.2 * 500KB = 40 TB/day ← THIS is why CDNs exist!

  return {
    tweetWriteQPS: Math.round(tweetWriteQPS),
    feedReadQPS: Math.round(feedReadQPS),
    peakReadQPS: Math.round(peakReadQPS),
    dailyStorageGB: Math.round(dailyStorage / 1e9),
    yearlyStorageTB: Math.round(yearlyStorage / 1e12),
    dailyMediaStorageTB: Math.round(dailyMediaStorage / 1e12),
  };
}

// ---------- Example 2: Estimating Cache Size ----------

function estimateCacheRequirements() {
  // Rule: Cache the hottest 20% of data (Pareto principle: 80/20 rule)

  const totalDailyRequests = 10_000_000_000; // 10B requests/day
  const uniqueURLs = 1_000_000_000;          // 1B unique URLs
  const avgResponseSize = 500;               // 500 bytes

  // 20% of URLs serve 80% of traffic
  const hotURLs = uniqueURLs * 0.2;          // 200M URLs to cache
  const cacheSize = hotURLs * avgResponseSize;
  // = 200M * 500 bytes = 100 GB ← fits in a single Redis cluster!

  // How many Redis nodes?
  const redisMemoryPerNode = 64 * 1e9;       // 64 GB per node
  const nodesNeeded = Math.ceil(cacheSize / redisMemoryPerNode);
  // = ceil(100GB / 64GB) = 2 nodes (with replication: 4-6 nodes)

  return {
    hotURLs,
    cacheSizeGB: Math.round(cacheSize / 1e9),
    redisNodes: nodesNeeded,
    withReplication: nodesNeeded * 3, // 3x for replication factor
  };
}

// ---------- Example 3: Bandwidth Estimation ----------

function estimateBandwidth() {
  // Video streaming service like Netflix
  const concurrentViewers = 10_000_000;      // 10M concurrent
  const avgBitrateBytes = 5_000_000;         // 5 Mbps = ~625 KB/s per stream
  const totalBandwidth = concurrentViewers * avgBitrateBytes;
  // = 10M * 5MB/s = 50 TB/s ← This is why Netflix uses CDNs globally

  // Convert to Gbps
  const bandwidthGbps = (totalBandwidth * 8) / 1e9;
  // = 400,000 Gbps = 400 Tbps

  return {
    totalBandwidthTBps: Math.round(totalBandwidth / 1e12),
    bandwidthGbps: Math.round(bandwidthGbps),
  };
}

console.log("Twitter estimates:", estimateTwitterScale());
console.log("Cache estimates:", estimateCacheRequirements());
console.log("Bandwidth estimates:", estimateBandwidth());`,
      exercise: `1. **YouTube Storage**: Estimate how much storage YouTube needs per day if 500 hours of video are uploaded every minute. Assume average quality of 720p at 2.5 Mbps.

2. **WhatsApp Message Volume**: With 2 billion users and 100 billion messages per day, calculate the QPS for message delivery. What's the peak QPS assuming a 3x peak factor?

3. **Instagram Feed Cache**: Instagram has 500M DAU who refresh their feed 10 times/day. Each feed contains 20 posts at 2KB metadata each. How much cache memory do you need for a 24-hour window?

4. **Uber Driver Matching**: If Uber has 5M active drivers sending GPS updates every 4 seconds, calculate the QPS for location updates and the daily storage if each update is 100 bytes.

5. **Email Service Scale**: Design capacity estimates for a Gmail-like service with 1.8B users, 300B emails/day, avg 50KB per email. Calculate daily storage, QPS, and how many servers you need.

6. **Practice Quick Math**: Convert these without a calculator: (a) 500M / 86400, (b) 1TB in GB, (c) 1M * 4KB in GB, (d) 50K req/sec * 1KB per request in MB/sec.`,
      commonMistakes: [
        "Getting bogged down in exact arithmetic — interviewers want to see your thought process and order-of-magnitude reasoning, not precise calculations. Round aggressively (86,400 → ~100K).",
        "Forgetting peak traffic — average QPS is meaningless without accounting for peak hours. Always multiply by 2-3x for peak traffic and design for the peak, not the average.",
        "Not considering data growth over time — if you need 10TB today, you'll need 30-50TB in 3 years. Always project 3-5 years ahead for storage and capacity planning.",
        "Ignoring media/attachments — text data is tiny compared to images and videos. A chat app's storage is 90%+ media, not messages. Always ask 'does this system handle media?'",
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "Estimate the number of servers needed to handle 1 million concurrent WebSocket connections for a chat application.",
          a: "**Key factors:**\n\n1. **Memory per connection**: Each WebSocket connection uses ~10-50KB of RAM (buffers, state)\n2. **Assume 30KB per connection** (middle estimate)\n3. **Total memory**: 1M × 30KB = 30GB RAM for connections alone\n4. **Server capacity**: A typical server has 64-128GB RAM. Reserve 50% for OS and app logic → 32-64GB available for connections\n5. **Connections per server**: 64GB / 30KB ≈ 2.1M connections per server (theoretical max)\n6. **Practical limit**: OS file descriptor limits, CPU for message processing → realistically ~500K connections per server\n7. **Servers needed**: 1M / 500K = **2 servers minimum**, but with redundancy → **4-6 servers**\n\n**Also consider**: Each message must be routed to the correct server, so you'd need a **pub/sub layer** (Redis, Kafka) for inter-server message routing.",
        },
        {
          type: "conceptual",
          q: "Why do we use powers of 2 for estimation in system design?",
          a: "Powers of 2 are fundamental because **computer memory and storage are binary**:\n\n- 1 KB = 2^10 bytes ≈ 1,000\n- 1 MB = 2^20 bytes ≈ 1 million\n- 1 GB = 2^30 bytes ≈ 1 billion\n- 1 TB = 2^40 bytes ≈ 1 trillion\n\nThis makes conversions intuitive:\n- '1 million objects × 1KB each = 1 GB'\n- '1 billion objects × 1KB each = 1 TB'\n\nIt also helps with **partitioning math**: if you need to split data across servers, powers of 2 divide evenly (2, 4, 8, 16 shards). This aligns with **consistent hashing** where the hash space is typically 2^128 or 2^160.",
        },
      ],
    },
    {
      id: "sd-tradeoffs-and-design-decisions",
      title: "Trade-offs & Design Decisions",
      explanation: `System design is fundamentally about **making trade-offs**. There is no perfect system — every design decision involves giving up something to gain something else. The best engineers don't claim their design is "the best"; they explain **why** they chose it given the constraints.

## The Big Trade-offs

### 1. Consistency vs. Availability (CAP Theorem Preview)
| Choose Consistency | Choose Availability |
|---|---|
| Banking transactions | Social media feeds |
| Inventory management | DNS resolution |
| Booking systems | Content delivery |

### 2. Latency vs. Throughput
- **Optimize for latency**: User-facing APIs (< 100ms), real-time games
- **Optimize for throughput**: Batch data processing, log aggregation, ETL pipelines

### 3. Read vs. Write Optimization
- **Read-heavy** (100:1): News feed, product catalog → Denormalize data, add caches
- **Write-heavy** (1:1 or more writes): Logging, IoT sensors → Append-only storage, write-behind caching
- **Balanced**: Chat applications → Need both optimized

### 4. Cost vs. Performance
- More replicas = better availability = higher cost
- More caching = lower latency = more memory cost
- More regions = lower global latency = much higher operational complexity

### 5. Simplicity vs. Scalability
- Monolith is simpler but harder to scale individual components
- Microservices scale independently but add complexity (network calls, service discovery, distributed debugging)

## Making Trade-off Decisions

Use this framework when facing a design decision:

1. **Identify the constraint**: What's the bottleneck or limitation?
2. **List the options**: What are the possible approaches?
3. **Evaluate each option** against your NFRs (latency, consistency, cost)
4. **Choose and justify**: Pick one and explain why it fits your requirements
5. **Acknowledge the downside**: State what you're giving up

> **Interview tip**: Saying "I chose X **because** Y, and I'm accepting the trade-off of Z" is the hallmark of a senior engineer. Interviewers love this.`,
      codeExample: `// ============================================
// Trade-offs in Action — Real Design Decisions
// ============================================

// ---------- Trade-off 1: Normalization vs Denormalization ----------

// ❌ NORMALIZED (optimized for writes, slow reads — many JOINs)
// Tables: users, posts, comments, likes
// To show a feed, you need 4+ JOIN queries

const normalizedQuery = \`
  SELECT p.id, p.content, u.name, u.avatar,
         COUNT(DISTINCT l.id) as likes,
         COUNT(DISTINCT c.id) as comments
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN likes l ON l.post_id = p.id
  LEFT JOIN comments c ON c.post_id = p.id
  WHERE p.user_id IN (SELECT followed_id FROM follows WHERE follower_id = ?)
  GROUP BY p.id
  ORDER BY p.created_at DESC
  LIMIT 20;
  -- This query is SLOW at scale (multiple JOINs, subquery)
\`;

// ✅ DENORMALIZED (optimized for reads, more work on writes)
// Pre-computed feed table: each row has everything needed to render

const denormalizedFeedEntry = {
  postId: "post_123",
  authorName: "Jane Doe",           // Copied from users table
  authorAvatar: "cdn.com/jane.jpg", // Copied from users table
  content: "Hello world!",
  likeCount: 42,                    // Pre-computed counter
  commentCount: 7,                  // Pre-computed counter
  topComments: [                    // Pre-fetched top 3 comments
    { user: "Bob", text: "Great post!" },
  ],
  createdAt: "2024-01-15T10:30:00Z",
};

// Trade-off: When Jane changes her avatar, we need to update
// every feed entry that references her — more write complexity
// but reads are now a simple single-table lookup.

// ---------- Trade-off 2: Sync vs Async Processing ----------

// ❌ SYNCHRONOUS: User waits for everything
async function handleOrderSync(order) {
  await validateOrder(order);           // 50ms
  await chargePayment(order);           // 200ms
  await updateInventory(order);         // 100ms
  await sendConfirmationEmail(order);   // 300ms
  await notifyWarehouse(order);         // 150ms
  await updateAnalytics(order);         // 100ms
  // Total: ~900ms — user waits for ALL of this!
  return { status: 'completed' };
}

// ✅ ASYNCHRONOUS: User gets immediate response, rest happens in background
async function handleOrderAsync(order) {
  // Only do what the user MUST wait for
  await validateOrder(order);           // 50ms
  const paymentResult = await chargePayment(order); // 200ms

  if (paymentResult.success) {
    // Queue everything else — user doesn't need to wait
    await messageQueue.publish('order.confirmed', {
      orderId: order.id,
      items: order.items,
    });
    // Total user-facing latency: ~250ms (4x faster!)
    return { status: 'confirmed', orderId: order.id };
  }
  return { status: 'payment_failed' };
}

// Background workers process the queued events:
// Worker 1: updateInventory
// Worker 2: sendConfirmationEmail
// Worker 3: notifyWarehouse
// Worker 4: updateAnalytics

// Trade-off: Async is faster for users but adds complexity
// (message queue, worker management, retry logic, eventual consistency)

// ---------- Trade-off 3: Strong vs Eventual Consistency ----------

// Strong consistency — for banking
async function transferMoney(fromAccount, toAccount, amount) {
  const transaction = await db.beginTransaction();
  try {
    // Both operations in ONE transaction — either both succeed or both fail
    await transaction.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?',
      [amount, fromAccount, amount]
    );
    await transaction.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toAccount]
    );
    await transaction.commit();
    // Guarantee: balances are ALWAYS consistent
    return { success: true };
  } catch (e) {
    await transaction.rollback();
    return { success: false, error: e.message };
  }
}

// Eventual consistency — for social media like counts
async function likePost(userId, postId) {
  // Write to fast local store immediately
  await redis.sadd(\`post:\\\${postId}:likes\`, userId);

  // Asynchronously update the main database
  // The count might be slightly off for a few seconds — that's OK!
  await messageQueue.publish('post.liked', { userId, postId });

  // Return immediately — user sees their like instantly
  return { liked: true };
}

// Trade-off: Bank transfers MUST be strongly consistent (can't lose money)
// Social media likes can be eventually consistent (it's fine if the count
// shows 41 instead of 42 for a few seconds)`,
      exercise: `1. **Trade-off Matrix**: For each pair, explain which you'd choose and why: (a) SQL vs NoSQL for an e-commerce catalog, (b) Push vs Pull for a notification system, (c) Monolith vs Microservices for a startup MVP.

2. **Decision Document**: You're building a ride-sharing app. Write a one-page decision document comparing synchronous vs asynchronous ride matching. Include pros, cons, and your final recommendation.

3. **Interview Role-Play**: Practice explaining this trade-off out loud: "I chose eventual consistency for the news feed because..." — record yourself and check if you clearly state what you gain and what you lose.

4. **Cost-Benefit Analysis**: Your team wants to add a Redis cache layer. The cache costs $5K/month but reduces average latency from 200ms to 20ms. Calculate the cost per millisecond saved and argue for or against it.

5. **Failure Mode Analysis**: For a payment system using strong consistency, describe what happens during a network partition. Now describe what happens with eventual consistency. Which failure mode is more acceptable for payments?`,
      commonMistakes: [
        "Saying 'this is the best design' without acknowledging trade-offs — there IS no best design, only designs that are best FOR specific constraints. Always state your trade-offs.",
        "Choosing a technology because it's popular rather than because it fits the requirements — 'We'll use Kafka' without explaining why event streaming is needed.",
        "Over-engineering early — adding microservices, caching, and message queues to a system with 100 users. Start simple, add complexity when scale demands it.",
        "Not quantifying trade-offs — saying 'this is faster' is weak; saying 'this reduces p99 latency from 500ms to 50ms at the cost of 2x storage' is strong.",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "You're designing an e-commerce checkout flow. The product team wants instant checkout confirmation, but the payment gateway takes 3-5 seconds. How do you handle this trade-off?",
          a: "I'd use an **optimistic UI + async processing** approach:\n\n1. **Validate** the order and **authorize** (not capture) the payment synchronously (~1-2s)\n2. Return **'Order Confirmed'** to the user immediately after authorization\n3. **Capture** the payment, update inventory, and send emails asynchronously via a message queue\n4. If the async capture fails, send a notification and initiate a refund flow\n\n**Trade-off**: The user gets instant feedback (better UX), but there's a small risk (~0.1%) that their order is later cancelled if capture fails. The alternative — making them wait 5s — has a much higher cart abandonment rate (~30% increase).\n\n**Mitigation**: Use a two-phase approach with authorization first. Authorization succeeds 99%+ of the time if the user has funds, so the risk of false confirmation is very low.",
        },
        {
          type: "conceptual",
          q: "When would you choose a monolithic architecture over microservices?",
          a: "I'd choose a **monolith** in these cases:\n\n1. **Early-stage startup** (< 10 engineers): Move fast, one codebase, simple deployment, no distributed system overhead\n2. **Low scale**: If you're serving < 10K requests/sec, a well-written monolith handles it fine\n3. **Tightly coupled domain**: If all features share the same data model and change together, splitting into services adds network overhead without benefit\n4. **Small team**: Microservices require investment in infrastructure (service discovery, API gateways, distributed tracing). A team of 3-5 can't support that.\n\n**When to switch**: When you have clear team boundaries (Team A owns Payments, Team B owns Catalog), when parts of the system need independent scaling, or when deployment of one feature blocks another team.\n\n**Key insight**: Many successful companies (Shopify, Stack Overflow) run on monoliths. Microservices are a scaling tool, not a requirement.",
        },
      ],
    },
  ],
};

export default sdPhase1;
