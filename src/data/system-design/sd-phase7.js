const sdPhase7 = {
  id: "phase-7",
  title: "Phase 7: Scalability Patterns",
  emoji: "📈",
  description:
    "Learn how to scale systems from thousands to millions of users — horizontal vs vertical scaling, load balancing algorithms, auto-scaling, and data partitioning strategies.",
  topics: [
    {
      id: "sd-horizontal-vertical-scaling",
      title: "Horizontal vs Vertical Scaling",
      explanation: `**Scaling** is the ability to handle increased load. There are two fundamental approaches:

## Vertical Scaling (Scale Up)
Add more resources to a **single machine**: more CPU, RAM, or faster SSDs.

| Pros | Cons |
|------|------|
| Simple — no code changes | Hardware limits (max ~128 cores, 4TB RAM) |
| No distributed system complexity | Single point of failure |
| Works for any application | Expensive at high end |
| ACID transactions remain simple | Downtime during upgrade |

## Horizontal Scaling (Scale Out)
Add **more machines** and distribute the load across them.

| Pros | Cons |
|------|------|
| Virtually unlimited scale | Application must be designed for distribution |
| Better fault tolerance (no SPOF) | Data consistency challenges |
| Commodity hardware (cheaper) | Network latency between nodes |
| Can scale independently per component | Operational complexity |

## When to Use Each

| Scenario | Strategy |
|----------|----------|
| Database at 80% CPU | **Vertical** first (cheaper, simpler) |
| 100K concurrent WebSocket users | **Horizontal** (memory-bound, need many servers) |
| Startup with < 10K users | **Vertical** (simplicity wins) |
| Global service with millions of users | **Horizontal** (must distribute geographically) |

## The Scaling Path
Most companies follow this progression:
1. **Single server** (web + DB on one machine)
2. **Separate DB** (web server + dedicated database server)
3. **Read replicas** (one primary, multiple replicas for reads)
4. **Caching layer** (Redis between app and DB)
5. **Load balancer + multiple app servers** (horizontal scaling)
6. **Database sharding** (horizontal DB scaling)
7. **Microservices** (scale different components independently)
8. **Multi-region** (globally distributed)

> **Interview tip**: Always mention "I'd start simple and scale as needed" rather than immediately jumping to a complex distributed architecture for a new system.`,
      codeExample: `// ============================================
// Scaling Patterns — Practical Approaches
// ============================================

// ---------- Scaling Path Demonstration ----------

// Stage 1: Single Server
const stage1 = {
  architecture: 'Monolith on single server',
  capacity: '~1K req/sec, ~10K users',
  components: ['Web Server', 'App Logic', 'Database'],
  cost: '$50/month',
};

// Stage 2: Separate Web and DB servers
const stage2 = {
  architecture: 'Web server + dedicated DB',
  capacity: '~5K req/sec, ~50K users',
  components: ['Web Server (4 CPU, 16GB)', 'DB Server (8 CPU, 32GB)'],
  improvement: 'DB can be scaled independently, backups easier',
};

// Stage 3: Add caching and read replicas
const stage3 = {
  architecture: 'Web + Cache + DB Primary + Read Replicas',
  capacity: '~20K req/sec, ~200K users',
  components: ['Web Server', 'Redis Cache', 'DB Primary', '2x DB Replicas'],
  improvement: 'Cache absorbs 80% of reads, replicas handle the rest',
};

// Stage 4: Horizontal scaling with load balancer
const stage4 = {
  architecture: 'Load Balancer + N Web Servers + Cache + DB',
  capacity: '~100K req/sec, ~1M users',
  components: ['Load Balancer (Nginx/ALB)', '4x Web Servers', 'Redis Cluster', 'DB Primary + 3 Replicas'],
  improvement: 'Add/remove web servers based on traffic',
};

// Stage 5: Full distributed system
const stage5 = {
  architecture: 'Multi-region with CDN, sharded DB, microservices',
  capacity: '~1M+ req/sec, ~100M users',
  components: ['CDN', 'API Gateway', 'Microservices', 'Sharded DB', 'Kafka', 'Redis Cluster'],
};

// ---------- Stateless Application Server (Required for Horizontal Scaling) ----------

// ❌ BAD: Stateful server — can't scale horizontally
class StatefulServer {
  constructor() {
    this.sessions = {};  // In-memory state!
  }
  handleRequest(req) {
    // If load balancer routes to a DIFFERENT server, session is lost
    return this.sessions[req.sessionId];
  }
}

// ✅ GOOD: Stateless server — scales to any number of instances
class StatelessServer {
  constructor(redisClient) {
    this.redis = redisClient;  // External state store
  }
  async handleRequest(req) {
    // Any server can handle any request
    const session = await this.redis.get(\`session:\\\${req.sessionId}\`);
    return JSON.parse(session);
  }
}

// ---------- Connection Pooling (Critical for Scaling) ----------
const { Pool } = require('pg');

// ❌ BAD: New connection per request
async function badHandler(req) {
  const client = await new Pool().connect(); // 200ms overhead each time!
  const result = await client.query('SELECT 1');
  client.release();
  return result;
}

// ✅ GOOD: Shared connection pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function goodHandler(req) {
  const result = await pool.query('SELECT 1');  // Reuses existing connection
  return result;
}

console.log("Scaling stages:", [stage1, stage2, stage3, stage4, stage5].map(s => s.architecture));`,
      exercise: `1. **Scaling Plan**: Your app has 1K DAU and is growing 10x yearly. Design a 3-year scaling plan with specific milestones (10K, 100K, 1M users). What changes at each stage?

2. **Cost Analysis**: Compare the cost of vertically scaling one server to 128 cores / 512GB RAM vs horizontally scaling to 16 x 8-core / 32GB RAM servers. Include operational costs.

3. **Stateless Refactor**: Given a Node.js app storing user sessions and file uploads in memory, refactor it to be stateless so it can run on multiple servers behind a load balancer.

4. **Bottleneck Identification**: Your system handles 50K req/sec but response times spike during peak hours. Database CPU is at 90%, app servers at 30%. Identify the bottleneck and design the scaling strategy.`,
      commonMistakes: [
        "Scaling the wrong component — if the database is the bottleneck, adding more app servers won't help. Always identify the bottleneck first (CPU, memory, I/O, network).",
        "Premature horizontal scaling — adding distributed system complexity before it's needed. A single well-optimized server handles more than most startups need.",
        "Not making servers stateless before scaling horizontally — if servers store session data in memory, load balancers must use sticky sessions, which defeats the purpose of horizontal scaling.",
        "Ignoring database scaling — app servers scale easily horizontally, but the database is usually the bottleneck. Plan for read replicas, caching, and eventually sharding.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the difference between horizontal and vertical scaling?",
          a: "**Vertical (Scale Up)**: Bigger machine — more CPU, RAM, SSD. Simple, no code changes, but has hardware limits and is a single point of failure.\n\n**Horizontal (Scale Out)**: More machines — distribute load. Virtually unlimited scale, better fault tolerance, but requires stateless design, load balancing, and distributed data management.\n\n**Decision framework**: Start vertical (simpler, cheaper). Switch to horizontal when: (1) you've hit hardware limits, (2) you need fault tolerance (no SPOF), (3) you need geographic distribution, or (4) different components need independent scaling.",
        },
        {
          type: "scenario",
          q: "Your single-server API handles 5K req/sec. You expect 50K req/sec next month due to a viral launch. What's your plan?",
          a: "**Week 1 (immediate improvements)**:\n1. Add **CDN** for static assets (reduce origin load by 60-80%)\n2. Add **Redis cache** for database query results (reduce DB load by 80%)\n3. **Optimize queries** — add missing indexes, fix N+1 queries\n\n**Week 2 (horizontal scaling)**:\n4. Make app servers **stateless** (sessions in Redis, not memory)\n5. Put **load balancer** (ALB/Nginx) in front of 4-8 app servers\n6. Add **read replicas** for the database (2-3 replicas)\n\n**Week 3 (resilience)**:\n7. Set up **auto-scaling** with CloudWatch/metrics triggers\n8. Add **rate limiting** to protect against traffic spikes\n9. Set up **monitoring and alerting** (response time, error rate, CPU)\n\nExpected capacity: 50K+ req/sec with room to grow.",
        },
      ],
    },
    {
      id: "sd-load-balancing",
      title: "Load Balancing",
      explanation: `A **load balancer** distributes incoming traffic across multiple backend servers to improve availability, throughput, and fault tolerance.

## Load Balancing Algorithms

| Algorithm | How It Works | Best For |
|-----------|-------------|----------|
| **Round Robin** | Distribute sequentially (1→2→3→1→2→3) | Equal-capacity servers |
| **Weighted Round Robin** | Higher-capacity servers get more traffic | Mixed server sizes |
| **Least Connections** | Route to server with fewest active connections | Variable request duration |
| **Least Response Time** | Route to fastest responding server | Heterogeneous backends |
| **IP Hash** | Hash client IP to determine server | Session affinity (sticky sessions) |
| **Random** | Pick a random server | Simple, surprisingly effective |

## Types of Load Balancers

### Layer 4 (Transport Layer)
Routes based on IP address and port. Very fast — doesn't inspect content.
**Examples**: AWS NLB, HAProxy (TCP mode)

### Layer 7 (Application Layer)
Routes based on HTTP content (URL path, headers, cookies). More flexible.
**Examples**: AWS ALB, Nginx, HAProxy (HTTP mode), Envoy

## Health Checks
Load balancers continuously check backend health:
- **Active**: LB sends periodic requests to \`/health\` endpoint
- **Passive**: LB monitors response codes from real traffic
- **Unhealthy server**: Removed from pool, traffic redirected to healthy servers
- **Recovery**: After passing N consecutive health checks, server re-added

## Load Balancing at Scale

| Level | What's Balanced | Technology |
|-------|----------------|------------|
| **DNS** | Geographic regions / datacenters | Route53, Cloudflare DNS |
| **L4** | TCP connections to server pools | NLB, F5, MetalLB |
| **L7** | HTTP requests to app instances | ALB, Nginx, Envoy |
| **Service Mesh** | Microservice-to-microservice | Istio, Linkerd |

> **Interview tip**: In every system design, add a load balancer between the client and your app servers. It's expected in every design at scale.`,
      codeExample: `// ============================================
// Load Balancing — Algorithm Implementations
// ============================================

// ---------- Round Robin ----------
class RoundRobinBalancer {
  constructor(servers) {
    this.servers = servers;
    this.currentIndex = 0;
  }

  getServer() {
    const server = this.servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.servers.length;
    return server;
  }
}

// ---------- Weighted Round Robin ----------
class WeightedRoundRobin {
  constructor(servers) {
    this.servers = servers; // [{host, weight}]
    this.currentIndex = 0;
    this.currentWeight = 0;
    this.maxWeight = Math.max(...servers.map(s => s.weight));
    this.gcd = this.calculateGCD();
  }

  getServer() {
    while (true) {
      this.currentIndex = (this.currentIndex + 1) % this.servers.length;
      if (this.currentIndex === 0) {
        this.currentWeight -= this.gcd;
        if (this.currentWeight <= 0) this.currentWeight = this.maxWeight;
      }
      if (this.servers[this.currentIndex].weight >= this.currentWeight) {
        return this.servers[this.currentIndex];
      }
    }
  }

  calculateGCD() {
    const weights = this.servers.map(s => s.weight);
    return weights.reduce((a, b) => {
      while (b) { [a, b] = [b, a % b]; }
      return a;
    });
  }
}

// ---------- Least Connections ----------
class LeastConnectionsBalancer {
  constructor(servers) {
    this.servers = servers.map(s => ({ ...s, connections: 0 }));
  }

  getServer() {
    const server = this.servers.reduce((min, s) =>
      s.connections < min.connections ? s : min
    );
    server.connections++;
    return server;
  }

  releaseConnection(server) {
    server.connections = Math.max(0, server.connections - 1);
  }
}

// ---------- Health-Checked Load Balancer ----------
class HealthCheckedLB {
  constructor(servers, healthCheckInterval = 5000) {
    this.servers = servers.map(s => ({ ...s, healthy: true, failCount: 0 }));
    this.balancer = new RoundRobinBalancer(this.getHealthyServers());
    setInterval(() => this.runHealthChecks(), healthCheckInterval);
  }

  getHealthyServers() {
    return this.servers.filter(s => s.healthy);
  }

  async runHealthChecks() {
    for (const server of this.servers) {
      try {
        const res = await fetch(\`http://\\\${server.host}/health\`, { timeout: 2000 });
        if (res.ok) {
          server.failCount = 0;
          if (!server.healthy) {
            server.healthy = true;
            console.log(\`✅ \\\${server.host} is back HEALTHY\`);
          }
        } else { throw new Error('Unhealthy'); }
      } catch (e) {
        server.failCount++;
        if (server.failCount >= 3 && server.healthy) {
          server.healthy = false;
          console.log(\`❌ \\\${server.host} marked UNHEALTHY\`);
        }
      }
    }
    this.balancer = new RoundRobinBalancer(this.getHealthyServers());
  }

  route() { return this.balancer.getServer(); }
}

// Demo
const rr = new RoundRobinBalancer(['server-1', 'server-2', 'server-3']);
console.log([1,2,3,4,5,6].map(() => rr.getServer()));

const wrr = new WeightedRoundRobin([
  { host: 'big-server', weight: 5 },
  { host: 'small-server', weight: 1 },
]);
const counts = {};
for (let i = 0; i < 60; i++) {
  const s = wrr.getServer().host;
  counts[s] = (counts[s] || 0) + 1;
}
console.log('Weighted distribution:', counts);`,
      exercise: `1. **Algorithm Selection**: For each scenario, choose the best load balancing algorithm: (a) 4 identical servers, (b) 2 powerful + 4 small servers, (c) WebSocket connections, (d) API with variable response times.

2. **Health Check Design**: Design a health check system that distinguishes between: (a) server completely down, (b) server overloaded but alive, (c) server healthy but with degraded DB connection.

3. **Multi-Layer LB**: Design the load balancing architecture for a global e-commerce site: DNS-level (geo-routing), L4 (TCP), and L7 (HTTP routing).

4. **Sticky Sessions**: When are sticky sessions necessary? Design an alternative using external session storage that avoids sticky sessions entirely.`,
      commonMistakes: [
        "Using sticky sessions when services should be stateless — sticky sessions reduce the effectiveness of load balancing and create failure scenarios. Store sessions externally (Redis).",
        "Not implementing health checks — without health checks, the load balancer routes traffic to dead servers, causing errors for users.",
        "Single load balancer as SPOF — the load balancer itself needs redundancy. Use multiple LBs with failover (e.g., AWS ALB automatically distributed).",
        "Using round robin with heterogeneous servers — if one server has 2x the capacity, round robin wastes half its potential. Use weighted round robin.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What load balancing algorithm would you choose for a microservices architecture?",
          a: "**Least connections** or **least response time** because:\n\n1. Microservice requests have **variable duration** (some queries are fast, some slow)\n2. **Round robin** would overload servers handling slow requests\n3. **Least connections** naturally accounts for this — busy servers get fewer new requests\n4. **Least response time** is even better — it considers both load AND server performance\n\nFor **service meshes** (Istio, Linkerd): Use **P2C (Power of Two Choices)** — randomly pick 2 servers, route to the one with fewer connections. It's O(1) and nearly optimal.",
        },
        {
          type: "scenario",
          q: "Your load balancer is distributing traffic evenly, but one server always has higher response times. What could be wrong?",
          a: "**Possible causes**:\n1. **Noisy neighbor**: Shared infrastructure — another VM on the same host is consuming resources\n2. **Cold cache**: That server was recently restarted, so its local cache is empty\n3. **Background processes**: Cron jobs, log rotation, or GC running on that server\n4. **Hardware issue**: Failing disk, thermal throttling\n5. **Data skew**: If using IP-hash routing, that server may handle more heavy users\n\n**Fix**: Switch to **least response time** algorithm — it automatically routes away from slow servers. Add monitoring to detect the root cause. If hardware: replace. If cache: implement cache warming on startup.",
        },
      ],
    },
    {
      id: "sd-auto-scaling",
      title: "Auto-Scaling & Capacity Planning",
      explanation: `**Auto-scaling** automatically adjusts the number of server instances based on real-time demand. It's essential for handling traffic that varies throughout the day, week, or during special events.

## Scaling Triggers

| Metric | Scale Up When | Scale Down When |
|--------|---------------|-----------------|
| **CPU** | > 70% average across instances | < 30% average |
| **Memory** | > 80% utilization | < 40% utilization |
| **Request count** | > 1000 req/sec per instance | < 200 req/sec |
| **Queue depth** | > 1000 pending messages | < 100 pending |
| **Custom metric** | p99 latency > 500ms | p99 latency < 100ms |

## Scaling Policies

### Reactive Scaling
Scale based on current metrics. Simple but always slightly behind.

### Predictive Scaling
Use historical patterns to scale BEFORE traffic arrives. E.g., scale up at 8 AM every weekday because traffic increases predictably.

### Scheduled Scaling
Pre-configured scaling for known events: Black Friday, product launches, marketing campaigns.

## Capacity Planning Formula

\`\`\`
Required instances = Peak QPS / QPS per instance × (1 + safety margin)
\`\`\`

Example: Peak 100K QPS, each server handles 5K → 100K/5K × 1.3 = **26 instances**

## Key Concepts

- **Cooldown period**: After scaling, wait N minutes before scaling again (prevent thrashing)
- **Min/Max instances**: Set floor (minimum for availability) and ceiling (cost control)
- **Warm-up time**: New instances take time to start JVM, load caches, establish connections
- **Graceful shutdown**: Drain connections before terminating instances

> **Interview tip**: Mention auto-scaling in any design where traffic is variable. It shows you understand operational efficiency and cost optimization.`,
      codeExample: `// ============================================
// Auto-Scaling — Policy Implementation
// ============================================

class AutoScaler {
  constructor(config) {
    this.minInstances = config.min || 2;
    this.maxInstances = config.max || 20;
    this.currentInstances = this.minInstances;
    this.cooldownMs = config.cooldownMs || 300000; // 5 minutes
    this.lastScaleTime = 0;
    this.metrics = [];
  }

  evaluate(currentMetrics) {
    const now = Date.now();
    if (now - this.lastScaleTime < this.cooldownMs) {
      console.log('⏳ In cooldown period, skipping evaluation');
      return;
    }

    const avgCPU = currentMetrics.avgCPU;
    const avgLatency = currentMetrics.p99Latency;
    const qps = currentMetrics.requestsPerSecond;

    // Scale UP conditions
    if (avgCPU > 70 || avgLatency > 500 || qps > 5000 * this.currentInstances) {
      const newCount = Math.min(
        this.maxInstances,
        Math.ceil(this.currentInstances * 1.5) // Scale 50% at a time
      );
      if (newCount > this.currentInstances) {
        this.scaleUp(newCount);
      }
    }

    // Scale DOWN conditions
    if (avgCPU < 30 && avgLatency < 100 && qps < 2000 * this.currentInstances) {
      const newCount = Math.max(
        this.minInstances,
        Math.floor(this.currentInstances * 0.75) // Scale down 25% at a time
      );
      if (newCount < this.currentInstances) {
        this.scaleDown(newCount);
      }
    }
  }

  scaleUp(targetCount) {
    const toAdd = targetCount - this.currentInstances;
    console.log(\`📈 Scaling UP: \\\${this.currentInstances} → \\\${targetCount} (+\\\${toAdd})\`);
    this.currentInstances = targetCount;
    this.lastScaleTime = Date.now();
  }

  scaleDown(targetCount) {
    const toRemove = this.currentInstances - targetCount;
    console.log(\`📉 Scaling DOWN: \\\${this.currentInstances} → \\\${targetCount} (-\\\${toRemove})\`);
    // Drain connections before removing instances
    console.log(\`   Draining \\\${toRemove} instances (30s grace period)\`);
    this.currentInstances = targetCount;
    this.lastScaleTime = Date.now();
  }
}

// ---------- Capacity Planning Calculator ----------
function calculateCapacity(requirements) {
  const { peakQPS, qpsPerInstance, safetyMargin = 0.3 } = requirements;
  const baseInstances = Math.ceil(peakQPS / qpsPerInstance);
  const withSafety = Math.ceil(baseInstances * (1 + safetyMargin));

  return {
    baseInstances,
    withSafetyMargin: withSafety,
    totalCost: withSafety * requirements.instanceCostPerHour,
    note: \`\\\${peakQPS} QPS / \\\${qpsPerInstance} per instance × \\\${1 + safetyMargin} safety = \\\${withSafety}\`,
  };
}

// Demo
const scaler = new AutoScaler({ min: 2, max: 20 });
scaler.evaluate({ avgCPU: 80, p99Latency: 600, requestsPerSecond: 15000 });
scaler.lastScaleTime = 0; // Reset cooldown for demo
scaler.evaluate({ avgCPU: 20, p99Latency: 50, requestsPerSecond: 3000 });

console.log('Capacity plan:', calculateCapacity({
  peakQPS: 100000,
  qpsPerInstance: 5000,
  safetyMargin: 0.3,
  instanceCostPerHour: 0.10,
}));`,
      exercise: `1. **Auto-Scaling Policy**: Design auto-scaling policies for: (a) an API server (CPU-based), (b) a Kafka consumer (queue-depth-based), (c) a WebSocket server (connection-count-based).

2. **Capacity Planning**: Your service handles 10K req/sec normally and 50K during peak (3 hours/day). Each instance handles 2K req/sec and costs $0.10/hour. Calculate: minimum instances, peak instances, and daily cost with auto-scaling vs fixed capacity.

3. **Predictive Scaling**: Design a predictive scaling system that learns from the last 4 weeks of traffic patterns and pre-scales before predicted peaks.

4. **Thundering Herd**: After a deployment, all instances restart simultaneously with cold caches. Design a rolling deployment strategy that prevents this.`,
      commonMistakes: [
        "Not setting a cooldown period — without cooldown, the auto-scaler can thrash between scaling up and down every minute, wasting resources on instance startup/shutdown.",
        "Scaling based on a single metric — CPU might be low but latency high (due to I/O wait). Use multiple metrics and scale on the first one that triggers.",
        "Not accounting for startup time — new instances need 30-120 seconds to start, warm caches, and become ready. Scale proactively, not reactively.",
        "Setting max instances too low — during a viral event, traffic might be 10x normal. If your max is 5x, the system crashes. Set generous maximums with cost alerts.",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "How would you handle a 10x traffic spike from a viral social media post?",
          a: "**Immediate survival** (0-5 min):\n1. CDN absorbs static content requests\n2. Rate limiting protects backend from overload\n3. Auto-scaling triggers on high CPU/latency, adds instances\n4. Queue non-critical work (analytics, email) for later processing\n\n**Short-term stability** (5-30 min):\n5. Monitor database load — if bottleneck, enable aggressive caching\n6. Scale read replicas if needed\n7. Enable feature flags to disable heavy features (recommendations)\n\n**Key design**: The system should **gracefully degrade** rather than crash. Serve cached/stale content, queue work, shed load via rate limiting. A slow site is better than a dead site.",
        },
      ],
    },
  ],
};

export default sdPhase7;
