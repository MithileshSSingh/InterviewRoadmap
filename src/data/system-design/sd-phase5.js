const sdPhase5 = {
  id: "phase-5",
  title: "Phase 5: Caching Strategies",
  emoji: "⚡",
  description:
    "Learn how caching dramatically reduces latency and database load — cache patterns, eviction policies, CDN caching, and the hardest problem in CS: cache invalidation.",
  topics: [
    {
      id: "sd-caching-fundamentals",
      title: "Caching Fundamentals & Patterns",
      explanation: `**Caching** stores frequently accessed data in a fast storage layer (typically in-memory) so future requests are served faster.

## Why Cache?
- Without cache: every request hits the database (50-500ms)
- With cache: hot data served from memory (1-5ms)
- Database load reduced by 80-90%

## Cache Patterns

### 1. Cache-Aside (Lazy Loading) — Most Common
Read → Check cache → Miss → Query DB → Store in cache → Return
**Pros**: Only caches requested data. **Cons**: First request slow.

### 2. Write-Through
Write → Update cache + Update DB simultaneously
**Pros**: Cache always consistent. **Cons**: Higher write latency.

### 3. Write-Behind (Write-Back)
Write → Update cache → Return → (async) Write to DB
**Pros**: Very fast writes. **Cons**: Data loss risk if cache crashes.

### 4. Read-Through
Cache sits between app and DB. On miss, cache loads from DB itself.

## Cache Eviction Policies

| Policy | Description | Best For |
|--------|-------------|----------|
| **LRU** | Evict least recently used | General purpose |
| **LFU** | Evict least frequently used | Clear hot/cold data |
| **TTL** | Evict after time period | Known staleness window |
| **FIFO** | Evict oldest | Uniform access |

> **Rule of thumb**: Use **LRU + TTL** in production — handles 95% of use cases.`,
      codeExample: `// ============================================
// Caching Patterns — Implementation
// ============================================

// ---------- Cache-Aside Pattern ----------
class CacheAsideService {
  constructor(cache, database) {
    this.cache = cache;
    this.database = database;
    this.defaultTTL = 3600;
  }

  async getUser(userId) {
    const cacheKey = \`user:\\\${userId}\`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log(\`Cache HIT for \\\${cacheKey}\`);
      return JSON.parse(cached);
    }

    console.log(\`Cache MISS for \\\${cacheKey}\`);
    const user = await this.database.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) return null;

    await this.cache.set(cacheKey, JSON.stringify(user), 'EX', this.defaultTTL);
    return user;
  }

  async updateUser(userId, data) {
    await this.database.query('UPDATE users SET name = $1 WHERE id = $2', [data.name, userId]);
    await this.cache.del(\`user:\\\${userId}\`);
  }
}

// ---------- Write-Behind (Async DB Write) ----------
class WriteBehindService {
  constructor(cache, queue) {
    this.cache = cache;
    this.queue = queue;
  }

  async incrementViewCount(postId) {
    const newCount = await this.cache.incr(\`views:\\\${postId}\`);
    if (newCount % 100 === 0) {
      await this.queue.publish('db.write', { table: 'posts', set: { view_count: newCount }, where: { id: postId } });
    }
    return newCount;
  }
}

// ---------- LRU Cache Implementation ----------
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }
}

// ---------- Multi-Layer Cache ----------
class MultiLayerCache {
  constructor() {
    this.l1 = new LRUCache(100);     // In-process (~0.001ms)
    this.l2 = null;                  // Redis (~0.5-1ms)
    this.l3 = null;                  // Database (~5-50ms)
  }

  async get(key) {
    let value = this.l1.get(key);
    if (value) return value;

    value = await this.l2.get(key);
    if (value) { this.l1.put(key, value); return JSON.parse(value); }

    value = await this.l3.query('SELECT * FROM data WHERE key = $1', [key]);
    if (value) {
      await this.l2.set(key, JSON.stringify(value), 'EX', 3600);
      this.l1.put(key, value);
    }
    return value;
  }
}

const lru = new LRUCache(3);
lru.put('a', 1); lru.put('b', 2); lru.put('c', 3);
lru.get('a'); lru.put('d', 4);
console.log('b evicted:', lru.get('b')); // null`,
      exercise: `1. **Pattern Selection**: Choose the best caching pattern for: (a) User profile page, (b) Page view counter, (c) Shopping cart, (d) Stock price ticker. Justify each.

2. **LRU Implementation**: Implement LRU cache with O(1) get/put using HashMap + Doubly Linked List.

3. **Cache Size Calculation**: 10M DAU, 20 posts/page at 2KB each, 5 pages/day. How much Redis memory using 80/20 rule?

4. **Multi-Layer Cache**: Design 3-layer caching (browser, CDN, Redis) for e-commerce. Define TTLs and invalidation per layer.

5. **Cache Warming**: Design a strategy to pre-populate cache with hot data after application restart.`,
      commonMistakes: [
        "Cache stampede — popular key expires, hundreds of requests hit DB simultaneously. Use mutex locks or stale-while-revalidate.",
        "Caching without TTL — data without expiration becomes stale indefinitely. Always set a TTL.",
        "Not monitoring cache hit rate — below 80% indicates cache is too small or access patterns aren't cache-friendly.",
        "Using cache as primary data store — if Redis crashes, data is lost. Database is the source of truth.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the Cache-Aside pattern and when you would use it.",
          a: "**Cache-Aside** (Lazy Loading):\n\n**Read**: Check cache → HIT: return → MISS: query DB, store in cache, return\n**Write**: Update DB → Delete cache key (not update — avoids race conditions)\n\n**Why delete, not update?** Two concurrent writes updating the cache could leave stale data. Deleting ensures next read gets fresh data.\n\n**Use when**: Read:write ratio > 10:1, occasional cache misses acceptable, data doesn't need real-time consistency. Examples: user profiles, product listings.",
        },
        {
          type: "tricky",
          q: "What is a cache stampede and how do you prevent it?",
          a: "**Cache stampede**: Popular key expires → hundreds of concurrent requests miss cache → all hit DB → overload.\n\n**Prevention**:\n1. **Mutex lock**: Only ONE request queries DB; others wait for cache repopulation\n2. **Stale-while-revalidate**: Serve stale data while refreshing in background\n3. **Probabilistic early expiration**: Random chance of refresh BEFORE expiry\n4. **Pre-warming**: Background job refreshes popular keys before they expire",
        },
      ],
    },
    {
      id: "sd-cache-invalidation",
      title: "Cache Invalidation Strategies",
      explanation: `> "There are only two hard things in CS: cache invalidation and naming things."

**Cache invalidation** removes or updates stale cached data. It's difficult because you're maintaining two copies (cache + DB) in sync.

## Strategies

### 1. Time-Based (TTL)
Auto-expire after set duration. Simple but may serve stale data within window.

### 2. Event-Based
Invalidate when data changes via events/hooks. Always fresh but complex.

### 3. Version-Based
Key includes version: \`user:123:v5\`. Increment version on change. Old versions expire naturally.

## Delete on Write (Best Practice)
1. Update database
2. Delete cache key (don't update — avoids race conditions)
3. Next read refetches fresh data

## Distributed Invalidation
With multiple services: publish \`data.changed\` event → all services invalidate their caches.

> **Key insight**: TTL is your safety net. Even if event-based invalidation fails, TTL eventually clears stale data. Always combine both.`,
      codeExample: `// ============================================
// Cache Invalidation — Strategies
// ============================================

// ---------- TTL + Event Invalidation (Best Practice) ----------
class HybridCacheInvalidation {
  constructor(cache, db, eventBus) {
    this.cache = cache;
    this.db = db;
    this.eventBus = eventBus;
    this.defaultTTL = 3600;

    this.eventBus.subscribe('data.changed', (event) => {
      this.cache.del(\`\\\${event.type}:\\\${event.id}\`);
    });
  }

  async getProduct(productId) {
    const key = \`product:\\\${productId}\`;
    const cached = await this.cache.get(key);
    if (cached) return JSON.parse(cached);

    const product = await this.db.findProduct(productId);
    if (product) await this.cache.set(key, JSON.stringify(product), 'EX', this.defaultTTL);
    return product;
  }

  async updateProduct(productId, updates) {
    await this.db.updateProduct(productId, updates);
    await this.cache.del(\`product:\\\${productId}\`);
    await this.eventBus.publish('data.changed', { type: 'product', id: productId });
  }
}

// ---------- Stampede Protection ----------
class StampedeProtectedCache {
  constructor(cache, db) { this.cache = cache; this.db = db; }

  async getWithProtection(key, fetchFn, ttl = 3600) {
    const cached = await this.cache.get(key);
    if (cached) return JSON.parse(cached);

    const lockKey = \`lock:\\\${key}\`;
    const acquired = await this.cache.set(lockKey, '1', 'PX', 5000, 'NX');

    if (acquired === 'OK') {
      try {
        const rechecked = await this.cache.get(key);
        if (rechecked) return JSON.parse(rechecked);
        const data = await fetchFn();
        await this.cache.set(key, JSON.stringify(data), 'EX', ttl);
        return data;
      } finally {
        await this.cache.del(lockKey);
      }
    } else {
      await new Promise(r => setTimeout(r, 100));
      return this.getWithProtection(key, fetchFn, ttl);
    }
  }
}

// ---------- Tag-Based Invalidation ----------
class TagBasedCache {
  constructor(cache) { this.cache = cache; }

  async setWithTags(key, value, tags, ttl = 3600) {
    await this.cache.set(key, JSON.stringify(value), 'EX', ttl);
    for (const tag of tags) {
      await this.cache.sadd(\`tag:\\\${tag}\`, key);
    }
  }

  async invalidateByTag(tag) {
    const keys = await this.cache.smembers(\`tag:\\\${tag}\`);
    if (keys.length > 0) {
      await this.cache.del(...keys);
      await this.cache.del(\`tag:\\\${tag}\`);
    }
  }
}

console.log("Cache invalidation patterns demonstrated.");`,
      exercise: `1. **Race Condition Analysis**: Two users simultaneously update the same product. Draw sequence diagrams for delete-on-write vs update-on-write invalidation.

2. **TTL Strategy**: Design TTLs for: (a) product prices (change 10x/day), (b) user sessions, (c) search results. Justify each.

3. **Distributed Invalidation**: 5 API servers with local + shared Redis cache. Design invalidation flow ensuring all caches are cleared.

4. **Tag-Based Purge**: Design tag-based invalidation for an e-commerce site where updating a category should invalidate all products in it.`,
      commonMistakes: [
        "Updating cache instead of invalidating on write — race conditions can leave stale data. Always delete; let next read populate fresh data.",
        "Not using TTL as safety net — event-based invalidation can fail. TTL ensures eventual freshness.",
        "Forgetting distributed cache consistency — invalidating one server's cache doesn't invalidate others. Use pub/sub or shared cache.",
        "Cache keys without namespacing — use 'service-name:user:123' to prevent cross-service conflicts.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is cache invalidation considered one of the hardest problems in CS?",
          a: "Because of **distributed state consistency**: you have DB and cache as two sources of truth. Race conditions between concurrent reads/writes, distributed systems with multiple cache copies, cascading dependencies (invalidating user also invalidates their posts/feed), and implicit caches (browser, CDN, DNS) all make it inherently complex. The fundamental tension: **stronger consistency = higher latency + lower throughput**.",
        },
        {
          type: "scenario",
          q: "Product prices update 10 times/day. How do you ensure users see the latest price?",
          a: "**Hybrid approach**: TTL of 5 minutes + event-based invalidation on price change. For **checkout flow** (stale prices unacceptable): bypass cache entirely, always read from DB. For **browsing** (5-min stale OK): serve from cache. Architecture: Price update → DB → Publish 'price.changed' → All servers invalidate → Next read gets fresh price.",
        },
      ],
    },
    {
      id: "sd-cdn-and-edge-caching",
      title: "CDN & Edge Caching",
      explanation: `A **CDN** is a globally distributed network of servers that caches content **close to users**, reducing latency from 200-500ms to 10-50ms.

## How CDNs Work
1. User requests \`cdn.example.com/image.jpg\`
2. DNS routes to nearest edge server
3. **Cache HIT**: Serve from edge (~10ms)
4. **Cache MISS**: Fetch from origin → cache → serve

## What to Cache on CDN

| Content Type | Cache? | TTL |
|-------------|--------|-----|
| Static assets (JS, CSS) | Always | 1 year (versioned) |
| Images/Videos | Always | 1 month+ |
| HTML pages (static) | Usually | 5 min - 1 hour |
| API responses | Sometimes | 10s - 5 min |
| Personalized content | Never | N/A |

## CDN Invalidation
- **TTL expiration**: Automatic
- **Cache purge**: Immediate (API call)
- **Versioned URLs**: \`bundle.abc123.js\` — new hash = new URL = instant update
- **stale-while-revalidate**: Serve stale, refresh in background

## Edge Computing
Modern CDNs run code at the edge (Cloudflare Workers, Lambda@Edge): A/B testing, auth, image optimization, geo-routing — all without hitting origin.

> **Interview tip**: Mention CDN whenever the system serves static content or has global users. Easiest latency win.`,
      codeExample: `// ============================================
// CDN & Edge Caching — Implementation
// ============================================

const express = require('express');
const app = express();

// Static assets: immutable, cache forever
app.get('/static/:hash/:file', (req, res) => {
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(\`/static/\\\${req.params.hash}/\\\${req.params.file}\`);
});

// API: CDN caches 60s, browser always revalidates
app.get('/api/products', (req, res) => {
  res.set({
    'Cache-Control': 'public, s-maxage=60, max-age=0, stale-while-revalidate=30',
    'Vary': 'Accept-Encoding',
  });
  res.json({ products: [] });
});

// Private: Never cache on CDN
app.get('/api/me/profile', (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json({ user: req.user });
});

// ---------- CDN Purge API ----------
class CDNManager {
  async purgeUrls(urls) {
    console.log(\`Purging \\\${urls.length} URLs from CDN\`);
    // Call CDN provider API (Cloudflare, CloudFront, etc.)
  }

  async purgeByTag(tags) {
    console.log(\`Purging tags: \\\${tags.join(', ')}\`);
  }
}

// ---------- Versioned Static Assets ----------
const crypto = require('crypto');
const fs = require('fs');

function getAssetUrl(filePath) {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
  const ext = filePath.split('.').pop();
  const basename = filePath.split('/').pop().replace(\`.\\\${ext}\`, '');
  return \`/static/\\\${basename}.\\\${hash}.\\\${ext}\`;
}

console.log("CDN patterns configured.");`,
      exercise: `1. **CDN Architecture**: Design CDN strategy for Netflix — video chunks, thumbnails, API responses, static assets. What gets cached? Cache policies?

2. **Cache-Control Headers**: Write exact headers for: (a) Webpack bundle with hash, (b) User avatar, (c) Blog post HTML, (d) Real-time stock API.

3. **Global Latency**: Users in India get 3s load time, US users get 500ms. Design multi-CDN strategy to bring India < 1s.

4. **CDN Invalidation at Scale**: Breaking news changes homepage. Design invalidation for browser + CDN (200+ edges) + API caches.`,
      commonMistakes: [
        "Not using versioned filenames — without content hashes, CDN purging is the only way to update assets. Slow and error-prone.",
        "Setting s-maxage too high for dynamic content — 24h CDN cache means 24h to propagate updates.",
        "Caching personalized content on CDN — all users might see one user's personal info. Use 'private' for personalized data.",
        "Not using Vary headers — CDN might serve gzipped response to client that doesn't support it.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How would you use a CDN in a system design interview?",
          a: "Mention CDN in every design with static content or global users:\n- **Static assets**: CDN with immutable cache headers + content-hash filenames\n- **Global users**: CDN edge PoPs reduce latency worldwide\n- **Read-heavy content**: Cache at edge with short TTL\n\n**Position**: User → DNS → CDN Edge → (miss) → Load Balancer → Origin\n\n**Key numbers**: Reduces latency from 200-500ms to 10-50ms. Saves 80-95% origin bandwidth. 200+ edge locations globally.",
        },
        {
          type: "tricky",
          q: "Can you cache POST requests on a CDN?",
          a: "By default no — POST isn't idempotent. But **exceptions**: GraphQL queries use POST but are reads. Solutions: (1) Some CDNs (Fastly, Cloudflare) cache POST by hashing request body, (2) Convert GraphQL queries to GET with persisted query hashes, (3) Edge workers can generate cache keys from POST body. **Best practice**: Use GET for queries (cacheable), POST for mutations (never cached).",
        },
      ],
    },
    {
      id: "sd-redis-and-memcached",
      title: "Redis & Memcached Deep Dive",
      explanation: `**Redis** and **Memcached** are the top in-memory caching systems.

## Redis vs Memcached

| Feature | Redis | Memcached |
|---------|-------|-----------|
| **Data structures** | Strings, Lists, Sets, Sorted Sets, Hashes, Streams | Strings only |
| **Persistence** | Optional (RDB/AOF) | None |
| **Replication** | Built-in primary-replica | None |
| **Pub/Sub** | Built-in | None |
| **Scripting** | Lua (atomic ops) | None |
| **Threading** | Single-threaded (I/O threads in 6.0+) | Multi-threaded |
| **Speed** | ~100K ops/sec | ~100K ops/sec |

## When to Use Each
- **Redis**: Need data structures, persistence, pub/sub, or multiple use cases
- **Memcached**: Simple key-value caching with maximum memory efficiency

## Redis Use Cases in System Design

| Use Case | Redis Feature |
|----------|---------------|
| Caching | GET/SET + TTL |
| Sessions | Hash + TTL |
| Rate limiting | Sorted Set |
| Leaderboards | Sorted Set |
| Pub/Sub | PUBLISH/SUBSCRIBE |
| Distributed locks | SETNX + TTL |
| Counters | INCR/DECR |
| Geospatial | GEOADD/GEORADIUS |

> **Pro tip**: Say "Redis" in interviews. It's the industry standard.`,
      codeExample: `// ============================================
// Redis Patterns for System Design
// ============================================

const Redis = require('ioredis');
const redis = new Redis();

// ---------- Distributed Lock ----------
class RedisLock {
  constructor(redis) { this.redis = redis; }

  async acquire(lockName, ttlMs = 10000) {
    const lockKey = \`lock:\\\${lockName}\`;
    const lockValue = \`\\\${Date.now()}:\\\${Math.random()}\`;
    const result = await this.redis.set(lockKey, lockValue, 'PX', ttlMs, 'NX');
    return result === 'OK' ? { acquired: true, value: lockValue, key: lockKey } : { acquired: false };
  }

  async release(lockKey, lockValue) {
    const lua = 'if redis.call("GET",KEYS[1])==ARGV[1] then return redis.call("DEL",KEYS[1]) else return 0 end';
    await this.redis.eval(lua, 1, lockKey, lockValue);
  }
}

// ---------- Leaderboard ----------
async function leaderboard() {
  await redis.zadd('leaderboard', 1500, 'alice', 2300, 'bob', 1800, 'carol');
  const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
  const rank = await redis.zrevrank('leaderboard', 'alice');
  await redis.zincrby('leaderboard', 100, 'alice');
  console.log('Top 10:', top10, 'Alice rank:', rank + 1);
}

// ---------- Session Store ----------
async function sessions() {
  const sid = 'sess_abc';
  await redis.hmset(\`session:\\\${sid}\`, { userId: '123', role: 'admin', loginAt: Date.now().toString() });
  await redis.expire(\`session:\\\${sid}\`, 3600);
  const role = await redis.hget(\`session:\\\${sid}\`, 'role');
  console.log('Role:', role);
}

// ---------- Geospatial (Uber-like) ----------
async function geo() {
  await redis.geoadd('drivers', -122.4194, 37.7749, 'driver_1', -122.4089, 37.7835, 'driver_2');
  const nearby = await redis.georadius('drivers', -122.4194, 37.7749, 5, 'km', 'WITHDIST', 'ASC', 'COUNT', 10);
  console.log('Nearby drivers:', nearby);
}

leaderboard(); sessions(); geo();`,
      exercise: `1. **Redis for Uber**: Design Redis architecture for 5M driver locations updated every 4 seconds. What data structures?

2. **Redis vs DB**: For each — sessions, product catalog, view counter, order history, rate limiting — choose Redis or PostgreSQL.

3. **Redis Cluster**: Need 500GB cache, nodes max 64GB. Design cluster: masters, replicas, sharding, failover.

4. **Redis Persistence**: Compare RDB snapshots vs AOF. When use each? When disable persistence?`,
      commonMistakes: [
        "Using Redis without persistence when data must survive restarts — enable RDB or AOF.",
        "Storing 5MB objects per key — wastes memory, increases latency. Break into smaller entries or use hashes.",
        "Not setting maxmemory — Redis uses all RAM and gets OOM-killed. Always set limit + eviction policy.",
        "Using Pub/Sub for reliable delivery — it's fire-and-forget; disconnected subscribers lose messages. Use Redis Streams or Kafka.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is Redis single-threaded yet handles 100K+ ops/sec?",
          a: "1. **In-memory**: RAM access ~100ns vs 10ms disk\n2. **Non-blocking I/O**: epoll/kqueue handles thousands of connections\n3. **Simple data structures**: Optimized C implementations\n4. **No context switching**: No locks, no thread sync overhead\n5. **Efficient protocol**: Lightweight RESP protocol\n\nMost operations are O(1) and complete in microseconds. Bottleneck is network I/O, not CPU. Redis 6.0+ uses I/O threads for network while keeping processing single-threaded.",
        },
        {
          type: "scenario",
          q: "Redis at 90% of 64GB memory. What do you do?",
          a: "**Immediate**: Set `maxmemory-policy allkeys-lru`, run `redis-cli --bigkeys` to find largest keys, delete/reduce TTL on non-critical data.\n\n**Short-term**: Audit with `MEMORY USAGE`, compress values (MessagePack vs JSON = 30-50% smaller), use hash ziplist encoding.\n\n**Long-term**: Redis Cluster for horizontal scaling, tiered caching (hot data in Redis, cold on SSD), review what's actually cached.\n\n**Monitor**: Alert at 70%, 80%, 90% usage. Leave headroom for fragmentation.",
        },
      ],
    },
  ],
};

export default sdPhase5;
