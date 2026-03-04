const nodePhase11 = {
  id: "phase-11",
  title: "Phase 11: Performance & Scaling",
  emoji: "🚀",
  description:
    "Optimize Node.js application performance — profiling, memory management, clustering, load balancing, and caching strategies.",
  topics: [
    {
      id: "performance-profiling",
      title: "Performance Profiling & Optimization",
      explanation: `Performance optimization starts with **measurement**, not guesswork. Node.js provides built-in tools and third-party solutions for identifying bottlenecks.

**Key performance metrics:**
| Metric | Target | Tool |
|--------|--------|------|
| Response time (p95) | < 200ms | APM, custom middleware |
| Throughput (req/s) | Depends on workload | Load testing (autocannon) |
| Memory usage | < 500MB RSS | \`process.memoryUsage()\` |
| Event loop lag | < 10ms | \`perf_hooks\`, Clinic.js |
| CPU usage | < 70% | \`os.cpus()\`, top/htop |

**Profiling tools:**
1. **\`node --prof\`** — V8 CPU profiler (generates tick files)
2. **\`node --inspect\`** — Chrome DevTools profiler (Memory, CPU, Performance)
3. **Clinic.js** — Automated performance diagnosis (Doctor, Flame, Bubbleprof)
4. **autocannon** — HTTP load testing (like Apache Bench but better)
5. **\`perf_hooks\`** — Precise performance measurement API

**Common performance bottlenecks:**
1. **Synchronous operations** — \`readFileSync\`, \`JSON.parse\` on large data
2. **Memory leaks** — global arrays, event listeners, closures
3. **N+1 queries** — fetching related data in loops
4. **Missing indexes** — database queries doing full table scans
5. **Large payloads** — sending unnecessary data in API responses
6. **No caching** — re-computing or re-fetching unchanged data

🏠 **Real-world analogy:** Performance profiling is like a **doctor's checkup**. You measure vital signs (metrics), run diagnostics (profiling), identify the problem (bottleneck), and prescribe treatment (optimization). Guessing without measuring is like taking random medicine.`,
      codeExample: `// Performance Profiling & Optimization

const { performance, PerformanceObserver } = require("perf_hooks");

// 1. Measure function performance
function measureExecution(label, fn) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  console.log(\`[\${label}] \${duration.toFixed(2)}ms\`);
  return result;
}

// Async version
async function measureAsync(label, fn) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(\`[\${label}] \${duration.toFixed(2)}ms\`);
  return result;
}

// 2. Memory monitoring
function logMemory(label = "") {
  const usage = process.memoryUsage();
  console.log(\`Memory \${label}:\`, {
    rss: \`\${(usage.rss / 1024 / 1024).toFixed(1)}MB\`,        // Total allocated
    heapUsed: \`\${(usage.heapUsed / 1024 / 1024).toFixed(1)}MB\`, // JS objects
    heapTotal: \`\${(usage.heapTotal / 1024 / 1024).toFixed(1)}MB\`,
    external: \`\${(usage.external / 1024 / 1024).toFixed(1)}MB\`, // C++ objects
  });
}

// 3. Event loop monitoring
function monitorEventLoop() {
  let lastCheck = Date.now();

  setInterval(() => {
    const now = Date.now();
    const lag = now - lastCheck - 1000; // Expected 1000ms interval
    lastCheck = now;

    if (lag > 50) {
      console.warn(\`Event loop lag: \${lag}ms\`);
    }
  }, 1000);
}

// 4. Response time middleware
function responseTimeMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6; // Convert to ms
    res.setHeader("X-Response-Time", \`\${duration.toFixed(2)}ms\`);

    // Alert on slow responses
    if (duration > 1000) {
      console.warn(\`Slow response: \${req.method} \${req.originalUrl} - \${duration.toFixed(0)}ms\`);
    }
  });

  next();
}

// 5. Optimization patterns

// ❌ SLOW: Creating new RegExp in every call
function validateEmailSlow(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

// ✅ FAST: Compile regex once
const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
function validateEmailFast(email) {
  return EMAIL_REGEX.test(email);
}

// ❌ SLOW: String concatenation in loops
function buildStringSlow(items) {
  let result = "";
  for (const item of items) {
    result += \`Item: \${item}\\n\`; // Creates new string each iteration
  }
  return result;
}

// ✅ FAST: Array join
function buildStringFast(items) {
  return items.map((item) => \`Item: \${item}\`).join("\\n");
}

// ❌ SLOW: JSON.parse/stringify for deep cloning
function deepCloneSlow(obj) {
  return JSON.parse(JSON.stringify(obj)); // Expensive!
}

// ✅ FAST: structuredClone (Node.js 17+)
function deepCloneFast(obj) {
  return structuredClone(obj);
}

// 6. Load testing with autocannon
// npm install -g autocannon
// autocannon -c 100 -d 10 http://localhost:3000/api/users
// -c 100: 100 concurrent connections
// -d 10: run for 10 seconds

module.exports = { measureAsync, logMemory, monitorEventLoop, responseTimeMiddleware };`,
      exercise: `**Exercises:**
1. Add response time headers and logging to an Express API — alert on responses > 500ms
2. Profile memory usage during a load test — identify and fix any memory leaks
3. Use Clinic.js Doctor to diagnose performance issues in a sample application
4. Run autocannon against your API and optimize until you achieve 1000+ req/s
5. Compare JSON.parse vs streaming JSON parsing for a 100MB file
6. Implement event loop lag monitoring and alerting`,
      commonMistakes: [
        "Optimizing without measuring first — always profile before optimizing; premature optimization wastes time on non-bottlenecks",
        "Using synchronous operations in request handlers — `readFileSync`, `crypto.pbkdf2Sync` block the entire event loop; use async versions",
        "Accumulating data in memory (arrays, maps, caches) without limits — set maximum sizes and eviction policies",
        "Not using database connection pooling — creating a new connection per request is extremely expensive; reuse connections",
        "Sending entire database records in API responses — select only needed fields; reduce payload size",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you identify and fix performance bottlenecks in a Node.js application?",
          a: "**Systematic approach:** (1) **Measure** — add response time logging, monitor event loop lag, track memory usage. (2) **Load test** — use autocannon/k6 to simulate traffic and identify breaking points. (3) **Profile CPU** — `node --inspect` with Chrome DevTools CPU profiler, or Clinic.js Flame. (4) **Profile Memory** — heap snapshots to find leaks, `process.memoryUsage()` over time. (5) **Identify bottleneck type:** CPU-bound (offload to Worker Threads), I/O-bound (check for sync calls, N+1 queries), memory-bound (check for leaks). (6) **Fix** — add caching, optimize queries with indexes, use streams for large data, cluster for CPU utilization.",
        },
        {
          type: "scenario",
          q: "How would you handle a memory leak in a production Node.js application?",
          a: "**Detection:** (1) RSS memory grows continuously over hours/days. (2) Set up monitoring alerts when memory exceeds thresholds. **Diagnosis:** (1) Take **heap snapshots** at intervals using Chrome DevTools or `heapdump` module. (2) Compare snapshots to find retained objects. (3) Look for common causes: growing arrays/maps, unremoved event listeners, closures capturing large scopes, uncleared timers. **Immediate mitigation:** (1) **Restart** the process (PM2 auto-restart on max memory). (2) Increase `--max-old-space-size` temporarily. **Long-term fix:** (1) Add `WeakRef`/`WeakMap` for caches. (2) Clean up listeners with `removeListener`/`once`. (3) Use `setMaxListeners` to detect listener accumulation.",
        },
      ],
    },
    {
      id: "clustering-scaling",
      title: "Clustering & Horizontal Scaling",
      explanation: `Node.js runs on a **single thread** by default, utilizing only one CPU core. The **cluster module** enables running multiple Node.js processes to leverage all CPU cores.

**Scaling strategies:**
| Strategy | How | Use Case |
|----------|-----|----------|
| **Vertical** | Bigger server (more CPU/RAM) | Quick fix, limited ceiling |
| **Node.js Cluster** | Fork worker processes | Multi-core utilization |
| **PM2** | Process manager with cluster mode | Production deployment |
| **Docker + K8s** | Container orchestration | Microservices, cloud-native |
| **Load Balancer** | nginx / HAProxy / ALB | Multiple servers |

**cluster module:**
- **Master process** — manages workers, doesn't handle requests
- **Worker processes** — handle actual HTTP requests
- Workers share the same port (OS distributes connections)
- Workers are independent processes (crash isolation)

**PM2 — Production Process Manager:**
\`\`\`bash
pm2 start app.js -i max         # Cluster mode (all cores)
pm2 start app.js -i 4           # 4 worker processes
pm2 reload app.js               # Zero-downtime reload
pm2 monit                       # Real-time monitoring
pm2 logs                        # View logs from all workers
pm2 save && pm2 startup         # Auto-start on server reboot
\`\`\`

**When to scale:**
1. Single Node.js process → PM2 cluster mode (same machine)
2. PM2 cluster hits limits → multiple machines + load balancer
3. Multiple machines → Docker + Kubernetes
4. Global scale → CDN + edge computing + auto-scaling groups

🏠 **Real-world analogy:** Clustering is like a **restaurant with multiple kitchens**. Instead of one chef (single thread) handling all orders, you have multiple chefs (worker processes) in separate kitchens (processes), with a host (master/load balancer) assigning customers to the least busy kitchen.`,
      codeExample: `// Clustering & Horizontal Scaling

const cluster = require("cluster");
const os = require("os");
const express = require("express");

// 1. Built-in cluster module
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(\`Primary \${process.pid} starting \${numCPUs} workers...\`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker crashes
  cluster.on("exit", (worker, code, signal) => {
    console.error(\`Worker \${worker.process.pid} died (code: \${code}). Restarting...\`);
    cluster.fork(); // Auto-restart
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("Primary received SIGTERM. Shutting down workers...");
    for (const worker of Object.values(cluster.workers)) {
      worker.process.kill("SIGTERM");
    }
  });
} else {
  // Worker process — each runs its own Express server
  const app = express();

  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      pid: process.pid,
      worker: cluster.worker.id,
      uptime: process.uptime(),
    });
  });

  app.get("/api/heavy", (req, res) => {
    // CPU-intensive work (only blocks THIS worker)
    let result = 0;
    for (let i = 0; i < 1e7; i++) result += Math.sqrt(i);
    res.json({ result, pid: process.pid });
  });

  app.listen(3000, () => {
    console.log(\`Worker \${process.pid} listening on port 3000\`);
  });
}

// 2. PM2 ecosystem file (ecosystem.config.js)
const pm2Config = {
  apps: [
    {
      name: "my-api",
      script: "src/server.js",
      instances: "max",        // Use all CPU cores
      exec_mode: "cluster",    // Cluster mode
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      // Logging
      log_file: "./logs/combined.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      // Auto-restart
      watch: false,
      max_restarts: 10,
      restart_delay: 4000,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};

// 3. nginx load balancer configuration (reference)
const nginxConfig = \`
# /etc/nginx/sites-available/my-api
upstream nodejs_cluster {
    least_conn;                    # Least connections algorithm
    server 127.0.0.1:3001;        # Node instance 1
    server 127.0.0.1:3002;        # Node instance 2
    server 127.0.0.1:3003;        # Node instance 3
    server 127.0.0.1:3004;        # Node instance 4
    keepalive 64;                  # Connection pooling
}

server {
    listen 80;
    listen 443 ssl;
    server_name api.example.com;

    # SSL
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    # Proxy to Node.js cluster
    location / {
        proxy_pass http://nodejs_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve static files directly (bypass Node.js)
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
}
\`;

module.exports = pm2Config;`,
      exercise: `**Exercises:**
1. Implement clustering using the \`cluster\` module — fork workers for each CPU core with auto-restart
2. Set up PM2 with an ecosystem file — configure cluster mode, log files, and memory restart limits
3. Configure nginx as a reverse proxy / load balancer for multiple Node.js instances
4. Implement zero-downtime deployment using PM2's \`reload\` command
5. Load test a single-instance server vs. clustered server — compare throughput and response times
6. Build health check endpoints that report per-worker statistics`,
      commonMistakes: [
        "Storing session state in process memory with clustering — each worker has its own memory; use Redis or a database for shared state",
        "Not implementing graceful shutdown — when restarting workers, allow in-flight requests to complete before killing the process",
        "Using `cluster.fork()` without auto-restart — if a worker crashes without restart logic, your capacity degrades over time",
        "Running more workers than CPU cores — this causes context switching overhead; match workers to cores (or use PM2's `max` setting)",
        "Not putting nginx in front of Node.js in production — nginx handles SSL termination, static files, gzip, rate limiting, and DDoS protection more efficiently",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does the Node.js cluster module work?",
          a: "The cluster module creates **multiple worker processes** (child processes) that share the same server port. The **primary process** forks workers and manages them; it doesn't handle requests directly. Each **worker** runs its own event loop and V8 instance. The OS kernel distributes incoming connections to workers (round-robin on Linux, randomized on other OS). Workers are isolated — a crash in one doesn't affect others. Communication between primary and workers uses IPC messages. **Best practice:** Fork `os.cpus().length` workers and implement auto-restart on worker crashes.",
        },
        {
          type: "scenario",
          q: "How would you deploy and scale a Node.js application for high traffic?",
          a: "**Progressive scaling:** (1) **Single server** — PM2 cluster mode (use all CPU cores). (2) **Multiple servers** — nginx load balancer + sticky sessions (if needed for WebSockets). (3) **Containerized** — Docker + Kubernetes with HPA (Horizontal Pod Autoscaler). (4) **Cloud-native** — AWS ECS/EKS or GCP Cloud Run with auto-scaling groups. **Architecture:** Redis for sessions/cache (shared state), PostgreSQL with read replicas (database scaling), CDN for static assets (CloudFront, Fastly), message queue for async work (BullMQ, SQS). **Best practices:** blue-green deployments for zero downtime, health checks for load balancer routing, circuit breakers for dependency failures.",
        },
      ],
    },
  ],
};

export default nodePhase11;
