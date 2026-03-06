const sdPhase10 = {
  id: "phase-10",
  title: "Phase 10: System Design Building Blocks",
  emoji: "🏗️",
  description:
    "Master the essential components that appear in every system design — consistent hashing, bloom filters, rate limiters, unique ID generators, and URL shorteners.",
  topics: [
    {
      id: "sd-consistent-hashing",
      title: "Consistent Hashing",
      explanation: `**Consistent hashing** solves the resharding problem in distributed systems. When you add or remove servers, only a small fraction of keys need to be remapped — unlike traditional hashing where adding one server reshuffles almost everything.

## The Problem with Simple Hashing
\`server = hash(key) % num_servers\`
When num_servers changes from 4 to 5, approximately 80% of keys map to different servers.

## How Consistent Hashing Works
1. Arrange servers on a virtual **hash ring** (0 to 2^32)
2. Hash each server name to find its position on the ring
3. Hash each key to find its position on the ring
4. Walk **clockwise** from the key's position to find the first server — that's where the key is stored

## Adding/Removing Servers
- **Add server**: Only keys between the new server and its predecessor need to move (~1/N keys)
- **Remove server**: Only keys on the removed server move to the next server clockwise

## Virtual Nodes
Problem: With few servers, distribution is uneven. Solution: Each physical server gets multiple positions (virtual nodes) on the ring, ensuring even distribution.

**Used by**: Cassandra, DynamoDB, Memcached, Nginx, CDN edge routing

> **Interview tip**: Mention consistent hashing whenever you discuss distributed caching, database sharding, or any system where data is distributed across multiple nodes.`,
      codeExample: `// ============================================
// Consistent Hashing — Implementation
// ============================================

class ConsistentHash {
  constructor(virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
    this.ring = new Map();       // hash position → node
    this.sortedKeys = [];        // sorted hash positions
    this.nodes = new Set();
  }

  addNode(node) {
    this.nodes.add(node);
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(\`\\\${node}:vn\\\${i}\`);
      this.ring.set(hash, node);
      this.sortedKeys.push(hash);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  removeNode(node) {
    this.nodes.delete(node);
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(\`\\\${node}:vn\\\${i}\`);
      this.ring.delete(hash);
      this.sortedKeys = this.sortedKeys.filter(k => k !== hash);
    }
  }

  getNode(key) {
    if (this.sortedKeys.length === 0) return null;
    const hash = this.hash(key);
    // Find first position on ring >= hash (clockwise)
    for (const pos of this.sortedKeys) {
      if (pos >= hash) return this.ring.get(pos);
    }
    return this.ring.get(this.sortedKeys[0]); // Wrap around
  }

  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
}

// Demo: Add/remove node only affects ~1/N keys
const ch = new ConsistentHash(100);
ch.addNode('server-1');
ch.addNode('server-2');
ch.addNode('server-3');

const keys = Array.from({length: 100}, (_, i) => \`key_\\\${i}\`);
const before = keys.map(k => ({ key: k, node: ch.getNode(k) }));

ch.addNode('server-4');
const after = keys.map(k => ({ key: k, node: ch.getNode(k) }));

const moved = keys.filter((k, i) => before[i].node !== after[i].node);
console.log(\`Keys moved after adding server-4: \\\${moved.length}/\\\${keys.length}\`);
// ~25% moved (1/4), not 75% like with mod hashing!`,
      exercise: `1. **Consistent Hash Ring**: Implement a consistent hash ring with virtual nodes. Test that adding a server only moves ~1/N keys.

2. **Replication**: Extend consistent hashing to replicate each key to the next N clockwise servers for fault tolerance.

3. **Hot Spot Handling**: A celebrity user has 1000x more traffic. How do you handle this with consistent hashing? Design a "hot key" detection and redistribution mechanism.

4. **Comparison**: Compare consistent hashing, range-based sharding, and directory-based sharding for a distributed cache with 100 servers.`,
      commonMistakes: [
        "Too few virtual nodes — with 1 virtual node per server, distribution is extremely uneven. Use 100-200 virtual nodes per server for good distribution.",
        "Not replicating across the ring — storing data on just one node means a node failure loses data. Replicate to the next 2-3 clockwise nodes.",
        "Using consistent hashing when simple modulo works — if your number of servers never changes, consistent hashing adds unnecessary complexity.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is consistent hashing and where is it used?",
          a: "**Consistent hashing** maps both keys and servers to positions on a hash ring. Each key is stored on the first server clockwise from its position.\n\n**Key benefit**: When adding/removing servers, only ~1/N keys need to move (vs ~(N-1)/N with modulo hashing).\n\n**Virtual nodes**: Each server gets multiple positions on the ring for even distribution.\n\n**Used in**: Cassandra (partition routing), CDNs (edge server selection), distributed caches (Memcached), load balancers (consistent client routing).\n\n**Complexity**: O(log N) lookup using binary search on sorted ring positions.",
        },
      ],
    },
    {
      id: "sd-unique-id-generation",
      title: "Unique ID Generation at Scale",
      explanation: `Generating unique IDs in a distributed system is surprisingly challenging. Auto-increment IDs don't work when you have multiple databases. You need IDs that are globally unique, sortable, and generated without coordination.

## Approaches

| Approach | Format | Sortable | Size | Coordination |
|----------|--------|----------|------|-------------|
| **UUID v4** | Random 128-bit | ❌ No | 36 chars | None |
| **ULID** | Timestamp + random | ✅ Yes | 26 chars | None |
| **Snowflake** | Timestamp + machine + seq | ✅ Yes | 64-bit int | Machine ID assignment |
| **Nano ID** | Random (configurable) | ❌ No | Custom | None |
| **DB sequence** | Auto-increment | ✅ Yes | Varies | DB coordination |

## Twitter Snowflake (Most Popular for System Design)

64-bit ID composed of:
- **1 bit**: Reserved (sign bit)
- **41 bits**: Timestamp (milliseconds since epoch → 69 years)
- **10 bits**: Machine/datacenter ID (1024 machines)
- **12 bits**: Sequence number (4096 IDs per millisecond per machine)

**Result**: Each machine generates up to 4096 unique, time-sorted IDs per millisecond. No coordination between machines. Total: ~4 million IDs/sec across 1024 machines.

> **Interview tip**: When asked about ID generation, mention Snowflake IDs. They're time-sorted (great for database indexes), unique without coordination, and encode useful metadata.`,
      codeExample: `// ============================================
// Unique ID Generation — Snowflake Implementation
// ============================================

class SnowflakeGenerator {
  constructor(machineId, datacenterId = 0) {
    this.machineId = machineId & 0x1F;     // 5 bits: 0-31
    this.datacenterId = datacenterId & 0x1F; // 5 bits: 0-31
    this.sequence = 0;
    this.lastTimestamp = -1;
    this.epoch = 1704067200000; // Jan 1, 2024
  }

  generate() {
    let timestamp = Date.now() - this.epoch;

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & 0xFFF; // 12 bits: 0-4095
      if (this.sequence === 0) {
        // Wait for next millisecond
        while (Date.now() - this.epoch <= this.lastTimestamp) {}
        timestamp = Date.now() - this.epoch;
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    // Compose 64-bit ID (using BigInt for 64-bit precision)
    const id = (BigInt(timestamp) << 22n)
             | (BigInt(this.datacenterId) << 17n)
             | (BigInt(this.machineId) << 12n)
             | BigInt(this.sequence);

    return id.toString();
  }

  // Extract components from ID
  static parse(id) {
    const n = BigInt(id);
    const epoch = 1704067200000;
    return {
      timestamp: new Date(Number(n >> 22n) + epoch),
      datacenterId: Number((n >> 17n) & 0x1Fn),
      machineId: Number((n >> 12n) & 0x1Fn),
      sequence: Number(n & 0xFFFn),
    };
  }
}

// Demo
const gen = new SnowflakeGenerator(1, 0);
const ids = Array.from({length: 5}, () => gen.generate());
console.log('Generated IDs:', ids);
console.log('Parsed:', SnowflakeGenerator.parse(ids[0]));

// ---------- ULID (Universally Unique Lexicographically Sortable ID) ----------
function generateULID() {
  const timestamp = Date.now();
  const timeChars = encodeBase32(timestamp, 10);
  const randomChars = encodeBase32(Math.floor(Math.random() * 2**40), 8)
                    + encodeBase32(Math.floor(Math.random() * 2**40), 8);
  return timeChars + randomChars;
}

function encodeBase32(value, length) {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result = chars[value & 0x1F] + result;
    value = Math.floor(value / 32);
  }
  return result;
}

console.log('ULID:', generateULID());`,
      exercise: `1. **Snowflake Implementation**: Implement a Snowflake ID generator that handles: clock skew (system clock goes backward), sequence overflow (>4096 IDs/ms), and multi-datacenter deployment.

2. **UUID vs Snowflake**: Compare UUID v4 and Snowflake IDs for B-Tree index performance. Why are random UUIDs terrible for database indexes?

3. **URL Shortener IDs**: Design the ID generation for a URL shortener (like bit.ly) that generates 7-character alphanumeric short codes. How many unique URLs can it support?

4. **Distributed Counter**: Design a counter service that creates sequential IDs across 10 servers without a single point of failure.`,
      commonMistakes: [
        "Using UUID v4 as database primary key — random UUIDs cause B-Tree index fragmentation because inserts are scattered across the entire index. Use time-sorted IDs (Snowflake, ULID) for sequential inserts.",
        "Clock synchronization dependency — Snowflake IDs rely on timestamps. If the system clock goes backward (NTP adjustment), you could generate duplicate IDs. Implement clock skew detection.",
        "Not considering ID size — 128-bit UUIDs use 2x the space of 64-bit Snowflake IDs. In tables with billions of rows, this significantly impacts index size and join performance.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How would you generate unique IDs in a distributed system?",
          a: "I'd use **Snowflake IDs** (64-bit):\n- **41 bits**: Millisecond timestamp (time-sorted, great for indexes)\n- **10 bits**: Machine/datacenter ID (1024 machines)\n- **12 bits**: Sequence (4096 IDs/ms per machine)\n\n**Benefits**: Time-sorted (sequential B-Tree inserts), unique without coordination, embeds timestamp (useful for debugging), compact (8 bytes vs UUID's 16).\n\n**Alternatives**: ULID if you prefer string IDs, UUID v7 (draft RFC — time-ordered UUIDs). Avoid UUID v4 for database PKs due to index fragmentation.",
        },
      ],
    },
    {
      id: "sd-rate-limiter-design",
      title: "Rate Limiter Design",
      explanation: `A **rate limiter** controls the number of requests a client can make within a time window. It protects services from abuse, prevents cascading failures, and ensures fair resource allocation.

## Common Algorithms

| Algorithm | Description | Pros | Cons |
|-----------|-------------|------|------|
| **Token Bucket** | Tokens added at fixed rate; request consumes a token | Allows bursts, smooth rate | Slightly complex state |
| **Leaky Bucket** | Requests processed at fixed rate; overflow rejected | Smooth output rate | No burst handling |
| **Fixed Window** | Count requests in fixed time windows | Simple to implement | Boundary spike problem |
| **Sliding Window Log** | Track timestamp of each request | Precise rate limiting | High memory usage |
| **Sliding Window Counter** | Combine fixed windows with weighted overlap | Good accuracy, low memory | Approximation |

## Where to Rate Limit

| Location | What It Protects | Example |
|----------|-----------------|---------|
| **API Gateway** | Backend services from overload | 1000 req/min per API key |
| **Application** | Specific endpoints | 5 login attempts per hour |
| **Database** | DB from excessive queries | Connection pool limits |
| **Third-party** | Your quota with external APIs | 100 Stripe API calls/sec |

> **Interview tip**: Rate limiting is a common system design interview question. Be prepared to implement a sliding window or token bucket algorithm and discuss distributed rate limiting with Redis.`,
      codeExample: `// ============================================
// Rate Limiter — Algorithm Implementations
// ============================================

// ---------- Token Bucket ----------
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  allowRequest(tokensNeeded = 1) {
    this.refill();
    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      return true;
    }
    return false;
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

// ---------- Sliding Window Counter ----------
class SlidingWindowCounter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.windows = new Map(); // userId → { prevCount, currCount, currWindowStart }
  }

  allowRequest(userId) {
    const now = Date.now();
    const currentWindow = Math.floor(now / this.windowMs);
    let record = this.windows.get(userId);

    if (!record || record.currWindow !== currentWindow) {
      record = {
        prevCount: record?.currWindow === currentWindow - 1 ? record.currCount : 0,
        currCount: 0,
        currWindow: currentWindow,
      };
    }

    // Weighted count: overlap of previous window
    const elapsed = (now % this.windowMs) / this.windowMs;
    const estimatedCount = record.prevCount * (1 - elapsed) + record.currCount;

    if (estimatedCount < this.maxRequests) {
      record.currCount++;
      this.windows.set(userId, record);
      return { allowed: true, remaining: Math.floor(this.maxRequests - estimatedCount - 1) };
    }

    return { allowed: false, retryAfter: this.windowMs - (now % this.windowMs) };
  }
}

// ---------- Distributed Rate Limiter (Redis) ----------
class DistributedRateLimiter {
  constructor(redis, config) {
    this.redis = redis;
    this.windowMs = config.windowMs || 60000;
    this.maxRequests = config.maxRequests || 100;
  }

  async allowRequest(clientId) {
    const key = \`ratelimit:\\\${clientId}\`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Lua script for atomic operation
    const lua = \`
      redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
      local count = redis.call('ZCARD', KEYS[1])
      if count < tonumber(ARGV[3]) then
        redis.call('ZADD', KEYS[1], ARGV[2], ARGV[2])
        redis.call('PEXPIRE', KEYS[1], ARGV[4])
        return 1
      end
      return 0
    \`;

    const allowed = await this.redis.eval(
      lua, 1, key,
      windowStart.toString(), now.toString(),
      this.maxRequests.toString(), this.windowMs.toString()
    );

    return { allowed: allowed === 1 };
  }
}

// Demo
const bucket = new TokenBucket(10, 2); // 10 capacity, refill 2/sec
console.log('Request 1:', bucket.allowRequest()); // true
for (let i = 0; i < 10; i++) bucket.allowRequest();
console.log('Request 12:', bucket.allowRequest()); // false (bucket empty)

const slider = new SlidingWindowCounter(60000, 100);
console.log('Sliding window:', slider.allowRequest('user_1'));`,
      exercise: `1. **Algorithm Comparison**: Implement token bucket, sliding window log, and sliding window counter. Compare memory usage, accuracy, and burst handling with 1000 simulated requests.

2. **Distributed Rate Limiter**: Design a rate limiter using Redis that works across 10 API servers, limiting each user to 100 requests per minute.

3. **Tiered Rate Limiting**: Design rate limits for a SaaS API: Free tier (100 req/day), Pro (10K req/day), Enterprise (unlimited). Include per-endpoint limits (e.g., search is more expensive).

4. **Rate Limit Headers**: Implement standard rate limit response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After.`,
      commonMistakes: [
        "Fixed window boundary spikes — a user can make 100 requests at 11:59 and 100 at 12:00, effectively 200 in 1 minute. Use sliding window to prevent this.",
        "Rate limiting only at the API gateway — internal services also need rate limiting to prevent cascading failures between microservices.",
        "Not returning rate limit headers — clients need to know their current limits to implement proper backoff. Always return X-RateLimit-Remaining and Retry-After headers.",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a rate limiter for a large-scale API serving 10 million users.",
          a: "**Algorithm**: Sliding window counter (good accuracy, low memory).\n\n**Architecture**:\n1. **Redis cluster** stores rate limit counters (key: `ratelimit:{userId}:{endpoint}`)\n2. Rate check via **Lua script** (atomic increment + check in one round-trip)\n3. **API Gateway** performs rate check before routing to backend\n\n**Storage**:\n- 10M users × ~50 bytes per key = ~500MB Redis memory\n- Use Redis Cluster for horizontal scaling\n\n**Multi-tier limits**:\n- Global: 1000 req/min per user\n- Per-endpoint: /search = 50/min, /write = 200/min\n- IP-based: 5000 req/min per IP (catch unauthenticated abuse)\n\n**Response**: Return 429 with headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`\n\n**Graceful handling**: For critical endpoints (checkout), allow burst + queue excess rather than hard reject.",
        },
      ],
    },
  ],
};

export default sdPhase10;
