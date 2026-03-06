const sdPhase14 = {
  id: "phase-14",
  title: "Phase 14: Interview Preparation & Career Growth",
  emoji: "🎯",
  description:
    "Master the system design interview framework — how to structure your approach, communicate clearly, handle curveballs, and practice with real interview scenarios.",
  topics: [
    {
      id: "sd-interview-framework",
      title: "System Design Interview Framework",
      explanation: `The system design interview is **45-60 minutes** of structured discussion. Here's the framework that top candidates use.

## The 4-Step Framework

### Step 1: Requirements Clarification (5-7 min)
Ask questions. Don't jump into design.

**Functional requirements**: What does the system DO?
- Core features (MVP)
- Who are the users? How many?
- What are the main use cases?

**Non-functional requirements**: What are the constraints?
- Scale: How many users/requests?
- Latency: What response time is acceptable?
- Availability: How many nines? (99.9%? 99.99%?)
- Consistency: Can data be eventually consistent?

### Step 2: Back-of-Envelope Estimation (3-5 min)
Show you can think about scale with rough math.

- **Traffic**: QPS (queries per second) for read and write
- **Storage**: How much data over 5-10 years
- **Bandwidth**: Data transfer rates
- **Memory**: Cache size estimation (80/20 rule)

### Step 3: High-Level Design (15-20 min)
Draw the architecture. Walk through the main flow.

1. **API design**: Define the key endpoints
2. **Data model**: What tables/collections, what fields
3. **Architecture diagram**: Show the main components and data flow
4. **Core algorithm**: The key logic (e.g., feed ranking, URL encoding)

### Step 4: Deep Dive (15-20 min)
The interviewer will ask you to drill into specific areas:
- "How would you handle this failure scenario?"
- "What happens at 100x the current scale?"
- "How do you ensure consistency here?"

This is where you showcase depth. Discuss trade-offs, alternatives, and why you chose your approach.

## Key Numbers to Know

| Resource | Speed |
|----------|-------|
| L1 cache reference | 0.5 ns |
| RAM access | 100 ns |
| SSD random read | 150 μs |
| HDD seek | 10 ms |
| Send 1 MB over 1 Gbps network | 10 ms |
| Read 1 MB from SSD | 1 ms |
| Read 1 MB from HDD | 20 ms |
| Round trip within datacenter | 0.5 ms |
| Round trip CA → Netherlands | 150 ms |

## Estimation Cheat Sheet

| Quantity | Approximate Value |
|----------|------------------|
| Seconds in a day | 86,400 ≈ 100,000 |
| Requests per day at 1 QPS | ~100K/day |
| 1 million requests/day | ~12 QPS |
| 1 billion requests/day | ~12K QPS |
| 1 byte | 8 bits |
| 1 KB | 1,024 bytes ≈ 1,000 |
| 1 MB | 1 million bytes |
| 1 GB | 1 billion bytes |
| 1 TB | 1 trillion bytes |

> **Pro tip**: Practice talking through your design out loud. The interview is as much about communication as technical depth. Explain your reasoning, not just your decisions.`,
      codeExample: `// ============================================
// Interview Preparation — Practice Template
// ============================================

// ---------- Back-of-Envelope Estimation Template ----------

function estimateSystem(params) {
  const {
    dau,              // Daily Active Users
    actionsPerUser,   // Actions per user per day
    avgPayloadBytes,  // Average request/response size
    readWriteRatio,   // Read:Write ratio (e.g., 10 means 10:1)
    retentionYears,   // How long to keep data
    cacheHitRatio,    // Expected cache hit rate (0.8 = 80%)
  } = params;

  const SECONDS_PER_DAY = 86400;

  // Traffic estimation
  const totalActions = dau * actionsPerUser;
  const totalQPS = Math.ceil(totalActions / SECONDS_PER_DAY);
  const writeQPS = Math.ceil(totalQPS / (1 + readWriteRatio));
  const readQPS = totalQPS - writeQPS;
  const peakQPS = totalQPS * 3; // Assume 3x peak

  // Storage estimation
  const dailyStorage = totalActions * avgPayloadBytes;
  const yearlyStorage = dailyStorage * 365;
  const totalStorage = yearlyStorage * retentionYears;

  // Bandwidth
  const incomingBandwidth = writeQPS * avgPayloadBytes;
  const outgoingBandwidth = readQPS * avgPayloadBytes;

  // Cache estimation (80/20 rule)
  const dailyUniqueRequests = totalActions * 0.2; // 20% unique
  const cacheMemory = dailyUniqueRequests * avgPayloadBytes;

  return {
    traffic: {
      totalQPS,
      readQPS,
      writeQPS,
      peakQPS,
      note: \`\\\${dau.toLocaleString()} DAU × \\\${actionsPerUser} actions = \\\${totalActions.toLocaleString()} actions/day\`,
    },
    storage: {
      daily: formatBytes(dailyStorage),
      yearly: formatBytes(yearlyStorage),
      total: formatBytes(totalStorage),
      note: \`\\\${retentionYears} years retention\`,
    },
    bandwidth: {
      incoming: formatBytes(incomingBandwidth) + '/sec',
      outgoing: formatBytes(outgoingBandwidth) + '/sec',
    },
    cache: {
      size: formatBytes(cacheMemory),
      hitRate: \`\\\${cacheHitRatio * 100}%\`,
      note: '80/20 rule — cache top 20% of requests',
    },
  };
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  let val = bytes;
  while (val >= 1000 && i < units.length - 1) { val /= 1000; i++; }
  return \`\\\${val.toFixed(1)} \\\${units[i]}\`;
}

// ---------- Example: Twitter Estimation ----------
console.log('\\n=== Twitter Estimation ===');
console.log(estimateSystem({
  dau: 300_000_000,
  actionsPerUser: 5,      // 5 actions (post, read, like)
  avgPayloadBytes: 500,   // 500 bytes per tweet
  readWriteRatio: 100,    // 100 reads per 1 write
  retentionYears: 10,
  cacheHitRatio: 0.80,
}));

// ---------- Example: URL Shortener Estimation ----------
console.log('\\n=== URL Shortener Estimation ===');
console.log(estimateSystem({
  dau: 10_000_000,
  actionsPerUser: 1,      // 1 URL shortened per day
  avgPayloadBytes: 200,   // URL + metadata
  readWriteRatio: 10,     // 10 redirects per 1 creation
  retentionYears: 10,
  cacheHitRatio: 0.90,
}));

// ---------- Interview Checklist ----------
const interviewChecklist = {
  'Step 1: Requirements (5-7 min)': [
    'Clarify functional requirements (core features)',
    'Clarify non-functional requirements (scale, latency, consistency)',
    'Identify users and use cases',
    'Agree on scope with interviewer',
  ],
  'Step 2: Estimation (3-5 min)': [
    'Calculate QPS (read and write)',
    'Calculate storage requirements',
    'Calculate bandwidth',
    'Calculate cache size',
  ],
  'Step 3: High-Level Design (15-20 min)': [
    'Define API endpoints',
    'Design data model (schema)',
    'Draw architecture diagram',
    'Walk through the main data flow',
    'Explain key design decisions',
  ],
  'Step 4: Deep Dive (15-20 min)': [
    'Address scaling challenges',
    'Discuss failure scenarios',
    'Explain consistency vs availability choices',
    'Mention monitoring and observability',
    'Discuss trade-offs of your design',
  ],
};

console.log('\\nInterview Checklist:', interviewChecklist);`,
      exercise: `1. **Timed Practice**: Set a 45-minute timer and design one of: YouTube, Uber, Dropbox, Google Docs, Instagram. Follow the 4-step framework strictly.

2. **Estimation Drills**: Practice back-of-envelope calculations for: (a) Instagram (2B users, 100M photos/day), (b) Google Maps (1B users, 1K tile requests per session), (c) Slack (20M DAU, 50 messages per user per day).

3. **Trade-off Analysis**: For each pair, explain when you'd choose each and why: (a) SQL vs NoSQL, (b) REST vs gRPC, (c) Push vs Pull feed, (d) Strong vs Eventual consistency, (e) Monolith vs Microservices.

4. **Curveball Practice**: After designing a system, practice answering: "What if traffic increases 100x overnight?", "What if your primary database goes down?", "How would you handle this in multiple regions?"

5. **Communication Practice**: Record yourself walking through a design. Review the recording for: clarity, structure, unnecessary pauses, and missed trade-off discussions.`,
      commonMistakes: [
        "Jumping into design without clarifying requirements — the interviewer wants to see that you ask the right questions. Spend 5-7 minutes clarifying scope, scale, and constraints.",
        "Not doing back-of-envelope math — estimation shows you think quantitatively. 'A lot of traffic' is vague. '50K QPS with 3x peak' is specific and impressive.",
        "Drawing a perfect architecture without explaining trade-offs — the interviewer doesn't want the 'right answer' (there isn't one). They want to see you reason about trade-offs.",
        "Not talking enough — system design interviews are collaborative discussions. The interviewer can't evaluate your thinking if you're silently drawing. Narrate your thought process.",
        "Over-engineering the first pass — start simple (single server) and scale up when the interviewer asks about scale. Don't start with Kubernetes, Kafka, and 50 microservices.",
      ],
      interviewQuestions: [
        {
          type: "meta",
          q: "What are the most commonly asked system design questions?",
          a: "**Tier 1 (Most Common)**:\n1. Design a URL Shortener (TinyURL)\n2. Design Twitter/News Feed\n3. Design a Chat System (WhatsApp)\n4. Design an Online File Storage Service (Dropbox/Google Drive)\n5. Design a Web Crawler\n\n**Tier 2 (Common)**:\n6. Design YouTube/Netflix\n7. Design Uber/Lyft\n8. Design a Search Autocomplete System\n9. Design a Rate Limiter\n10. Design a Notification System\n\n**Tier 3 (Advanced)**:\n11. Design Google Maps\n12. Design a Distributed Message Queue (Kafka)\n13. Design a Key-Value Store\n14. Design a Ticketing System (Ticketmaster)\n15. Design a Social Graph (Facebook friend recommendations)\n\n**Preparation strategy**: Master Tier 1 systems. Practice Tier 2 for thorough preparation. Review Tier 3 concepts for senior-level interviews.",
        },
      ],
    },
    {
      id: "sd-common-design-patterns-summary",
      title: "System Design Patterns — Quick Reference",
      explanation: `A summary of all major patterns you should know for system design interviews.

## Data Patterns

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Sharding** | DB too large for single server | Partition users by user_id hash |
| **Replication** | Read scalability, fault tolerance | Primary + read replicas |
| **Denormalization** | Eliminate expensive JOINs | Store author_name in posts table |
| **CQRS** | Different read/write optimizations | Write to PostgreSQL, read from Elasticsearch |
| **Event Sourcing** | Need full audit trail | Bank transactions, shopping cart |

## Communication Patterns

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Sync (REST/gRPC)** | Need immediate response | User authentication |
| **Async (Queue)** | Can process later | Email sending, analytics |
| **Pub/Sub** | One event → multiple consumers | Order created → inventory + notification |
| **WebSocket** | Real-time bidirectional | Chat, live scores, collaboration |

## Reliability Patterns

| Pattern | What It Does | When to Use |
|---------|-------------|-------------|
| **Circuit Breaker** | Stops calling failing services | Any service-to-service call |
| **Retry + Backoff** | Retries with increasing delay | Transient failures |
| **Bulkhead** | Isolates failure domains | Critical + non-critical services |
| **Rate Limiting** | Controls request rate | API protection, abuse prevention |
| **Timeout** | Limits wait time | Every external call |

## Scaling Patterns

| Pattern | How It Scales | When to Use |
|---------|--------------|-------------|
| **Load Balancing** | Distributes traffic across servers | Always for horizontal scaling |
| **CDN** | Caches content at edge locations | Static assets, global users |
| **Caching** | Stores hot data in memory | Read-heavy workloads |
| **Queue** | Buffers work for async processing | Traffic spikes, decoupling |
| **Auto-Scaling** | Adjusts instance count dynamically | Variable traffic patterns |

## The Interview Decision Matrix

When making design decisions, use this matrix:

| Question | Consider |
|----------|---------|
| "How to store data?" | SQL vs NoSQL vs Object Storage |
| "How to scale reads?" | Caching → Read replicas → CDN |
| "How to scale writes?" | Queue → Sharding → CQRS |
| "How to communicate?" | Sync (REST/gRPC) vs Async (Queue) vs Real-time (WebSocket) |
| "How to handle failures?" | Circuit breaker + Retry + Timeout + Fallback |
| "How to ensure consistency?" | Strong (ACID) vs Eventual (BASE) — per component |
| "How to generate IDs?" | Snowflake (time-sorted) vs UUID (random) |
| "How to distribute data?" | Consistent hashing vs Range-based sharding |

> **Final tip**: System design is about trade-offs, not perfection. Every decision has pros and cons. The best candidates explicitly state the trade-offs and explain why their choice is optimal for the given requirements.`,
      codeExample: `// ============================================
// System Design Patterns — Quick Reference Code
// ============================================

// This is a consolidated reference of all the key patterns
// covered throughout this roadmap.

// ---------- Pattern Decision Engine ----------
function recommendArchitecture(requirements) {
  const arch = {
    database: null,
    cache: null,
    queue: null,
    loadBalancer: null,
    communication: null,
    idGeneration: null,
  };

  // Database selection
  if (requirements.complexRelations) {
    arch.database = 'PostgreSQL (SQL, ACID, JOINs)';
  } else if (requirements.writeHeavy) {
    arch.database = 'Cassandra (write-optimized, eventual consistency)';
  } else if (requirements.flexibleSchema) {
    arch.database = 'MongoDB (document model, flexible schema)';
  } else if (requirements.graphRelations) {
    arch.database = 'Neo4j (graph traversal)';
  } else {
    arch.database = 'PostgreSQL (safe default)';
  }

  // Caching
  if (requirements.readWriteRatio > 10) {
    arch.cache = 'Redis (cache-aside with TTL)';
  }
  if (requirements.globalUsers) {
    arch.cache += ' + CDN (edge caching)';
  }

  // Message Queue
  if (requirements.asyncProcessing) {
    if (requirements.eventStreaming) {
      arch.queue = 'Kafka (event streaming, replay capability)';
    } else {
      arch.queue = 'RabbitMQ or SQS (simple task queue)';
    }
  }

  // Communication
  if (requirements.realTime) {
    arch.communication = 'WebSocket (bidirectional real-time)';
  } else if (requirements.internalService) {
    arch.communication = 'gRPC (efficient inter-service)';
  } else {
    arch.communication = 'REST over HTTPS (standard API)';
  }

  // ID Generation
  if (requirements.distributed) {
    arch.idGeneration = 'Snowflake IDs (time-sorted, globally unique)';
  } else {
    arch.idGeneration = 'Auto-increment (simple, sequential)';
  }

  // Load Balancer
  arch.loadBalancer = requirements.scale > 10000
    ? 'L7 Load Balancer (ALB) + Auto-Scaling'
    : 'Nginx (simple reverse proxy)';

  return arch;
}

// Example: Design decisions for a social media platform
console.log('\\nSocial Media Architecture:');
console.log(recommendArchitecture({
  complexRelations: true,   // Users, posts, follows
  writeHeavy: false,
  flexibleSchema: false,
  graphRelations: true,     // Social graph
  readWriteRatio: 100,      // Read-heavy
  globalUsers: true,
  asyncProcessing: true,    // Notifications, analytics
  eventStreaming: true,      // Feed fan-out
  realTime: true,           // Chat, live updates
  internalService: true,    // Microservices
  distributed: true,
  scale: 1000000,
}));

// Example: Design decisions for a banking system
console.log('\\nBanking System Architecture:');
console.log(recommendArchitecture({
  complexRelations: true,
  writeHeavy: false,
  flexibleSchema: false,
  graphRelations: false,
  readWriteRatio: 5,
  globalUsers: false,
  asyncProcessing: true,    // Statement generation
  eventStreaming: false,
  realTime: false,
  internalService: true,
  distributed: true,
  scale: 50000,
}));`,
      exercise: `1. **Pattern Matching**: For each real-world system, identify ALL patterns used: (a) Netflix, (b) Uber, (c) Amazon, (d) Slack. Create a table mapping each pattern to how it's used.

2. **Trade-off Presentation**: Pick 5 design decisions from the matrix. For each, prepare a 2-minute explanation of when to choose each option and why.

3. **Mock Interview**: Practice a full 45-minute system design interview with a friend or rubber duck. Record yourself and review for: structure, clarity, trade-off discussion, and time management.

4. **Component Deep Dive**: For each component in your favorite system design (database, cache, queue, LB), explain: (a) why this specific technology, (b) what alternatives you considered, (c) the trade-offs.`,
      commonMistakes: [
        "Memorizing architectures instead of understanding trade-offs — interviewers detect rehearsed answers. Understand WHY each component is chosen, not just WHAT to draw.",
        "Not practicing under time pressure — 45 minutes feels very short. Practice with a timer. Allocate time strictly: 5 min requirements, 5 min estimation, 15 min design, 15 min deep dive.",
        "Ignoring the interviewer's hints — if they ask 'what about consistency here?', they're guiding you toward an important discussion point. Follow their lead.",
        "Not drawing diagrams — a picture is worth a thousand words. Draw boxes, arrows, and label data flows. It makes your design concrete and easy to discuss.",
      ],
      interviewQuestions: [
        {
          type: "meta",
          q: "How should I prepare for system design interviews?",
          a: "**Study plan (4-6 weeks)**:\n\n**Weeks 1-2: Fundamentals**\n- Review all building blocks: databases, caching, queues, load balancers\n- Practice back-of-envelope estimation\n- Understand CAP theorem, consistency models\n\n**Weeks 3-4: Practice Designs**\n- Design 2 systems per week using the 4-step framework\n- Start with Tier 1 (URL shortener, Twitter, chat, file storage)\n- Time yourself (45 minutes strict)\n\n**Weeks 5-6: Mock Interviews**\n- Practice with peers or online platforms\n- Get feedback on communication, structure, and depth\n- Focus on areas where you struggle\n\n**During the interview**:\n- Ask clarifying questions (5 min)\n- Do estimation (5 min)\n- Draw and explain high-level design (15 min)\n- Deep dive into 2-3 areas (15 min)\n- Always explain trade-offs, not just decisions",
        },
      ],
    },
  ],
};

export default sdPhase14;
