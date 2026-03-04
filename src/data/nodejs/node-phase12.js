const nodePhase12 = {
  id: "phase-12",
  title: "Phase 12: DevOps, Deployment & Production",
  emoji: "🐳",
  description:
    "Deploy Node.js applications with Docker, CI/CD pipelines, environment management, monitoring, and production best practices.",
  topics: [
    {
      id: "docker-containerization",
      title: "Docker & Containerization",
      explanation: `**Docker** packages your Node.js application and all its dependencies into a portable **container** — ensuring it runs identically everywhere (development, staging, production).

**Why Docker for Node.js?**
- **Consistency** — "Works on my machine" problem eliminated
- **Isolation** — Each app gets its own environment
- **Scalability** — Containers start in seconds, scale horizontally
- **CI/CD** — Build once, deploy everywhere

**Dockerfile best practices for Node.js:**
1. Use specific Node.js version tags (\`node:20-alpine\`, not \`node:latest\`)
2. Use multi-stage builds to reduce image size
3. Copy \`package*.json\` first, then \`npm ci\`, then copy source (layer caching)
4. Run as non-root user (\`USER node\`)
5. Use \`.dockerignore\` to exclude \`node_modules\`, \`.git\`, etc.
6. Use \`npm ci\` instead of \`npm install\` for deterministic installs
7. Set \`NODE_ENV=production\` to skip dev dependencies

**Alpine vs. Debian images:**
| Image | Size | Use Case |
|-------|------|----------|
| \`node:20-alpine\` | ~180MB | Production (smallest) |
| \`node:20-slim\` | ~240MB | When Alpine causes issues |
| \`node:20\` | ~1GB | Development, debugging |

🏠 **Real-world analogy:** Docker is like a **shipping container**. Your application (cargo) is packed with everything it needs (dependencies). The container fits on any ship (server) regardless of what other containers are onboard. The container specification (Dockerfile) ensures identical packing every time.`,
      codeExample: `// Docker Configuration for Node.js

// === Dockerfile (production-ready, multi-stage) ===
const dockerfile = \`
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production && \\
    cp -R node_modules /tmp/prod_modules && \\
    npm ci  # Install all deps for build stage

# Stage 2: Build (if you have a build step)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build  # TypeScript compile, etc.

# Stage 3: Production (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 appuser

# Copy only production dependencies
COPY --from=deps /tmp/prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \\
  CMD wget -q --spider http://localhost:3000/health || exit 1

USER appuser
EXPOSE 3000

CMD ["node", "dist/server.js"]
\`;

// === .dockerignore ===
const dockerignore = \`
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
coverage
tests
docs
*.md
.vscode
.idea
Dockerfile
docker-compose*.yml
\`;

// === docker-compose.yml ===
const dockerCompose = \`
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
\`;

module.exports = { dockerfile, dockerignore, dockerCompose };`,
      exercise: `**Exercises:**
1. Write a production Dockerfile with multi-stage build — compare image sizes: full vs alpine vs multi-stage
2. Create a docker-compose.yml with Node.js API, PostgreSQL, and Redis
3. Optimize Docker layer caching — ensure \`npm ci\` layer is cached when only source code changes
4. Implement Docker health checks that test the \`/health\` endpoint
5. Set up volume mounts for local development with hot-reloading inside Docker
6. Compare \`docker build\` times with and without \`.dockerignore\` optimization`,
      commonMistakes: [
        "Using `node:latest` — version can change unexpectedly; always pin a specific version like `node:20-alpine`",
        "Copying `node_modules` into the image instead of running `npm ci` — host modules may not match the container's OS or architecture",
        "Not using `.dockerignore` — without it, `node_modules`, `.git`, and test files are copied, making the image huge and builds slow",
        "Running containers as root — if the app is compromised, the attacker has root access; use `USER node` or create a dedicated user",
        "Not using multi-stage builds — the final image includes build tools, devDependencies, and source code; multi-stage reduces image size by 50-80%",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the best practices for Dockerizing a Node.js application?",
          a: "**Key practices:** (1) **Pin Node.js version** — `node:20-alpine` for production. (2) **Multi-stage builds** — separate dependency, build, and runtime stages; final image has only production essentials. (3) **Layer caching** — copy `package*.json` and run `npm ci` before copying source; source changes don't re-install deps. (4) **Non-root user** — `USER node` for security. (5) **`.dockerignore`** — exclude `node_modules`, `.git`, tests. (6) **Health checks** — `HEALTHCHECK` instruction for container orchestration. (7) **`npm ci`** over `npm install` — deterministic, faster, uses lockfile exactly. (8) **`NODE_ENV=production`** — skips devDeps, enables optimizations.",
        },
        {
          type: "tricky",
          q: "Why should you use `npm ci` instead of `npm install` in Docker?",
          a: "`npm ci` is designed for automated environments: (1) It **deletes `node_modules`** and installs fresh from `package-lock.json` exactly. (2) It **fails** if `package-lock.json` is out of sync with `package.json`. (3) It's **faster** because it skips the dependency resolution step. (4) It produces **deterministic** builds — same lockfile = same `node_modules` every time. `npm install` may update `package-lock.json` and install different versions depending on timing. In Docker, reproducibility is critical.",
        },
      ],
    },
    {
      id: "cicd-deployment",
      title: "CI/CD & Deployment Strategies",
      explanation: `**CI/CD (Continuous Integration / Continuous Deployment)** automates the process of testing, building, and deploying your Node.js application every time code is pushed.

**CI/CD pipeline stages:**
\`\`\`
Code Push → Lint → Test → Build → Deploy → Monitor
    │         │       │       │        │         │
    Git     ESLint   Jest   Docker   Production  Datadog
\`\`\`

**Popular CI/CD platforms:**
| Platform | Pros |
|----------|------|
| **GitHub Actions** | Free for public repos, tight GitHub integration |
| **GitLab CI** | Built into GitLab, powerful pipelines |
| **Jenkins** | Self-hosted, highly customizable |
| **CircleCI** | Fast, Docker-first |
| **AWS CodePipeline** | Native AWS integration |

**Deployment strategies:**
| Strategy | Description | Risk |
|----------|-------------|------|
| **Rolling** | Replace instances one by one | Low (gradual) |
| **Blue-Green** | Switch traffic between two identical environments | Very low (instant rollback) |
| **Canary** | Route small % of traffic to new version | Lowest (test in production) |
| **Recreate** | Stop old, start new | High (downtime) |

**Environment management:**
\`\`\`
Development → Staging → Production
    │            │           │
  .env.dev   .env.staging  Cloud secrets
  Local DB    Test DB       Production DB
\`\`\`

🏠 **Real-world analogy:** CI/CD is like a **car assembly line with quality checks**. Each station (stage) inspects the car (code) for defects (bugs). Only cars that pass every station (lint, test, build) reach the showroom (production). Blue-green deployment is like having two showroom floors — customers are seamlessly redirected to the floor with newer models.`,
      codeExample: `// CI/CD Configuration Examples

// === .github/workflows/ci.yml (GitHub Actions) ===
const githubActionsCI = \`
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  # Stage 1: Lint & Type Check
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check  # If using TypeScript

  # Stage 2: Test
  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      - uses: codecov/codecov-action@v3  # Upload coverage

  # Stage 3: Build & Push Docker Image
  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: |
            \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:latest
            \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}

  # Stage 4: Deploy
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Examples:
          # SSH: ssh deploy@server "docker pull image && docker-compose up -d"
          # AWS ECS: aws ecs update-service --cluster prod --service api --force-new-deployment
          # Kubernetes: kubectl set image deployment/api api=image:tag
\`;

// === Deployment health check script ===
async function healthCheck(url, maxRetries = 10, delayMs = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(\`\${url}/health\`);
      if (response.ok) {
        const data = await response.json();
        console.log("Health check passed:", data);
        return true;
      }
    } catch (err) {
      console.log(\`Attempt \${i + 1}/\${maxRetries} failed. Retrying in \${delayMs}ms...\`);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("Health check failed after maximum retries");
}

module.exports = { githubActionsCI };`,
      exercise: `**Exercises:**
1. Set up a GitHub Actions CI pipeline: lint → test → build for a Node.js project
2. Add a test stage with PostgreSQL and Redis as service containers
3. Implement Docker image building and pushing to a container registry in CI
4. Set up automatic deployment on merge to \`main\` branch
5. Implement blue-green deployment with health checks before traffic switching
6. Add code coverage reporting and enforce minimum coverage thresholds in CI`,
      commonMistakes: [
        "Not running tests in CI that match the production environment — use the same database type (PostgreSQL, not SQLite) and Node.js version",
        "Deploying without health checks — always verify the new deployment is healthy before routing traffic",
        "Not using lockfiles in CI — `npm install` without `package-lock.json` can install different versions than development",
        "Storing secrets in code or CI config files — use encrypted secrets (GitHub Secrets, AWS Secrets Manager)",
        "Not having a rollback plan — every deployment should be reversible within minutes; use blue-green or keep the previous Docker image",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Describe a CI/CD pipeline for a Node.js application.",
          a: "**Pipeline stages:** (1) **Trigger** — push to main/PR opens. (2) **Install** — `npm ci` with cached `node_modules`. (3) **Lint** — ESLint/Prettier check code quality. (4) **Test** — Jest unit + integration tests with coverage report. Use service containers for databases. (5) **Build** — Docker multi-stage build, tag with git SHA. (6) **Push** — Push image to container registry (ECR, GHCR). (7) **Deploy** — Update deployment (ECS, K8s, etc.) with new image. (8) **Verify** — Health check the new deployment. (9) **Rollback** — Automatic rollback if health check fails. **Best practices:** Run tests in parallel, cache dependencies, use matrix strategy for Node.js versions.",
        },
        {
          type: "scenario",
          q: "How would you implement zero-downtime deployments?",
          a: "**Blue-Green:** (1) Run two identical environments (blue = current, green = new). (2) Deploy new version to green. (3) Run health checks on green. (4) Switch load balancer from blue to green. (5) Keep blue as rollback. **Rolling update (K8s):** Update pods one at a time; each new pod must pass readiness checks before the next is updated. **Canary:** Route 5% traffic to new version; monitor error rates; gradually increase to 100%. **In Node.js:** PM2's `pm2 reload` does zero-downtime restarts — it starts new workers, waits for them to be ready, then gracefully shuts down old workers.",
        },
      ],
    },
    {
      id: "monitoring-observability",
      title: "Monitoring & Observability",
      explanation: `**Monitoring** tells you WHEN something is wrong. **Observability** tells you WHY. Together, they ensure your production Node.js application is reliable and performant.

**Three pillars of observability:**
1. **Logs** — Timestamped records of events (Winston, Pino)
2. **Metrics** — Numerical measurements over time (response times, error rates)
3. **Traces** — Request flow across services (OpenTelemetry)

**Key metrics to monitor:**
| Category | Metrics |
|----------|---------|
| **Application** | Response time (p50, p95, p99), error rate, request rate |
| **System** | CPU usage, memory (RSS, heap), event loop lag |
| **Database** | Query time, connection pool utilization, slow queries |
| **Business** | Signups, orders, payments — depends on your domain |

**Monitoring stack options:**
| Component | Options |
|-----------|---------|
| Metrics collection | Prometheus, StatsD, Datadog Agent |
| Metrics visualization | Grafana, Datadog, New Relic |
| Log aggregation | ELK Stack, Loki + Grafana, Datadog Logs |
| Error tracking | Sentry, Bugsnag, Rollbar |
| APM (traces) | Datadog APM, New Relic, Elastic APM |
| Uptime monitoring | Pingdom, UptimeRobot, Better Uptime |

**Alerting best practices:**
- Alert on **symptoms** (high error rate), not causes (high CPU)
- Use **severity levels** — critical (pager), warning (Slack), info (dashboard)
- Prevent **alert fatigue** — too many alerts = they all get ignored

🏠 **Real-world analogy:** Monitoring is like a **car dashboard** — it shows speed (throughput), fuel level (memory), engine temperature (CPU). Observability is like a **mechanic's diagnostic tool** — it tells you exactly which sensor, cable, or component is failing and why.`,
      codeExample: `// Monitoring & Observability Setup

const express = require("express");
const client = require("prom-client"); // Prometheus client

const app = express();

// 1. Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // CPU, memory, event loop

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});
register.registerMetric(httpRequestTotal);

const activeConnections = new client.Gauge({
  name: "active_connections",
  help: "Number of active connections",
});
register.registerMetric(activeConnections);

// 2. Metrics middleware
app.use((req, res, next) => {
  activeConnections.inc();
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const route = req.route?.path || req.path;
    const labels = { method: req.method, route, status_code: res.statusCode };
    end(labels);
    httpRequestTotal.inc(labels);
    activeConnections.dec();
  });

  next();
});

// 3. Metrics endpoint (Prometheus scrapes this)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// 4. Health check endpoint
app.get("/health", async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: Date.now(),
  };

  // Check database
  try {
    // await db.query("SELECT 1");
    checks.database = "healthy";
  } catch (err) {
    checks.database = "unhealthy";
  }

  // Check Redis
  try {
    // await redis.ping();
    checks.cache = "healthy";
  } catch (err) {
    checks.cache = "unhealthy";
  }

  const isHealthy = checks.database === "healthy";
  res.status(isHealthy ? 200 : 503).json(checks);
});

// 5. Readiness vs Liveness probes (Kubernetes)
app.get("/ready", (req, res) => {
  // Ready to accept traffic?
  // Check: DB connected, cache connected, migrations applied
  res.status(200).json({ ready: true });
});

app.get("/live", (req, res) => {
  // Is the process alive?
  // Simple: if this responds, the process is alive
  res.status(200).json({ alive: true });
});

// 6. Error tracking (Sentry example)
// const Sentry = require("@sentry/node");
// Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });
// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.errorHandler());

app.listen(3000, () => console.log("Monitored server on port 3000"));`,
      exercise: `**Exercises:**
1. Set up Prometheus metrics collection with custom histograms and counters for HTTP requests
2. Create Grafana dashboards for request rate, error rate, response time (p95), and memory usage
3. Implement health check, readiness, and liveness probe endpoints
4. Integrate Sentry for automatic error tracking with source maps
5. Set up alerting rules: alert when error rate > 5% or p95 response time > 2s
6. Implement distributed tracing with OpenTelemetry across two microservices`,
      commonMistakes: [
        "Not monitoring at all — you find out about outages from customers, not your monitoring system",
        "Monitoring only server metrics (CPU, memory) without application metrics — you need request rates, error rates, and response times",
        "Not distinguishing health/ready/live endpoints — Kubernetes uses them differently: liveness = should restart?, readiness = should receive traffic?",
        "Creating too many alerts — alert fatigue means real alerts get ignored; alert only on actionable, customer-impacting issues",
        "Not correlating logs, metrics, and traces — without correlation IDs linking all three, debugging distributed issues is nearly impossible",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between monitoring and observability?",
          a: "**Monitoring** is collecting and alerting on predefined metrics — it tells you WHEN something is wrong (e.g., error rate spike, high response time). **Observability** is the ability to understand internal system state from external outputs — it tells you WHY something is wrong. Observability has three pillars: (1) **Logs** — detailed event records for debugging. (2) **Metrics** — aggregated numerical data for dashboarding and alerting. (3) **Traces** — request flow across services for identifying bottlenecks. Monitoring is a subset of observability. You can monitor without being observable, but observable systems are always monitorable.",
        },
        {
          type: "scenario",
          q: "How would you set up monitoring for a production Node.js microservice?",
          a: "**Full observability stack:** (1) **Metrics** — Prometheus client (`prom-client`) to export HTTP request duration, error counts, active connections, event loop lag. Scrape with Prometheus, visualize in Grafana. (2) **Logging** — Pino/Winston with JSON format, correlation IDs. Ship to ELK Stack or Loki. (3) **Tracing** — OpenTelemetry SDK to trace requests across services. Visualize in Jaeger. (4) **Error tracking** — Sentry for automatic error capture with context. (5) **Health checks** — `/health` (overall), `/ready` (can receive traffic), `/live` (process alive). (6) **Alerts** — PagerDuty for critical (error rate > 5%), Slack for warnings.",
        },
      ],
    },
  ],
};

export default nodePhase12;
