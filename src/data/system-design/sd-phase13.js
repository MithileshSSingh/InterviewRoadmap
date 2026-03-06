const sdPhase13 = {
  id: "phase-13",
  title: "Phase 13: Observability, Monitoring & Reliability",
  emoji: "📊",
  description:
    "Learn how to monitor, debug, and ensure reliability of distributed systems — the three pillars of observability, SLIs/SLOs/SLAs, and incident response.",
  topics: [
    {
      id: "sd-three-pillars-observability",
      title: "Three Pillars of Observability",
      explanation: `**Observability** is the ability to understand a system's internal state by examining its outputs. The three pillars are: **Logs**, **Metrics**, and **Traces**.

## Logs
- Discrete events with timestamps and context
- **Structured logging** (JSON) > unstructured (text)
- Use log levels: DEBUG, INFO, WARN, ERROR, FATAL
- **Tools**: ELK Stack (Elasticsearch, Logstash, Kibana), Datadog, Splunk

## Metrics
- Numeric measurements over time (counters, gauges, histograms)
- Key metrics: **RED method** (Rate, Errors, Duration) for services
- **USE method** (Utilization, Saturation, Errors) for resources
- **Tools**: Prometheus + Grafana, Datadog, CloudWatch

## Traces (Distributed Tracing)
- Track a request as it flows through multiple services
- Each service adds a **span** with timing and context
- Helps identify: which service is slow, where errors originate
- **Tools**: Jaeger, Zipkin, AWS X-Ray, Datadog APM

## Key Metrics to Monitor

| Category | Metrics |
|----------|---------|
| **Latency** | p50, p95, p99 response times |
| **Traffic** | Requests per second, concurrent connections |
| **Errors** | Error rate (4xx, 5xx), exception count |
| **Saturation** | CPU usage, memory usage, queue depth |
| **Business** | Active users, revenue, conversion rate |

## SLIs, SLOs, and SLAs

- **SLI (Service Level Indicator)**: What you measure (e.g., % of requests < 200ms)
- **SLO (Service Level Objective)**: Your target (e.g., 99.9% of requests < 200ms)
- **SLA (Service Level Agreement)**: Your promise to customers (e.g., 99.9% uptime or credit)

### The Nines of Availability

| Availability | Downtime/Year | Downtime/Month |
|-------------|---------------|----------------|
| 99% (two nines) | 3.65 days | 7.3 hours |
| 99.9% (three nines) | 8.77 hours | 43.8 minutes |
| 99.99% (four nines) | 52.6 minutes | 4.38 minutes |
| 99.999% (five nines) | 5.26 minutes | 26.3 seconds |

> **Interview tip**: When you mention SLOs in a system design, it shows you think about operational excellence, not just features.`,
      codeExample: `// ============================================
// Observability — Practical Implementation
// ============================================

// ---------- Structured Logging ----------
class Logger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  log(level, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...context,
      traceId: context.traceId || 'no-trace',
    };
    console.log(JSON.stringify(entry));
  }

  info(msg, ctx) { this.log('INFO', msg, ctx); }
  warn(msg, ctx) { this.log('WARN', msg, ctx); }
  error(msg, ctx) { this.log('ERROR', msg, ctx); }
}

// Usage
const logger = new Logger('order-service');
logger.info('Order created', { orderId: 'ord_123', userId: 'user_456', total: 99.99, traceId: 'trace_abc' });
logger.error('Payment failed', { orderId: 'ord_123', error: 'Card declined', traceId: 'trace_abc' });

// ---------- Metrics Collection ----------
class MetricsCollector {
  constructor() {
    this.counters = new Map();
    this.histograms = new Map();
  }

  // Counter: things that only go up
  increment(name, labels = {}) {
    const key = this.makeKey(name, labels);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  // Histogram: distribution of values
  observe(name, value, labels = {}) {
    const key = this.makeKey(name, labels);
    if (!this.histograms.has(key)) this.histograms.set(key, []);
    this.histograms.get(key).push(value);
  }

  // Calculate percentiles
  percentile(name, p, labels = {}) {
    const key = this.makeKey(name, labels);
    const values = (this.histograms.get(key) || []).sort((a, b) => a - b);
    if (values.length === 0) return 0;
    const index = Math.ceil(values.length * (p / 100)) - 1;
    return values[index];
  }

  makeKey(name, labels) {
    return name + JSON.stringify(labels);
  }
}

// ---------- Request Monitoring Middleware ----------
function monitoringMiddleware(metrics, logger) {
  return (req, res, next) => {
    const start = Date.now();
    const traceId = req.headers['x-trace-id'] || generateTraceId();

    // Attach trace ID to request
    req.traceId = traceId;
    res.setHeader('x-trace-id', traceId);

    // On response finish, record metrics
    res.on('finish', () => {
      const duration = Date.now() - start;
      const labels = { method: req.method, path: req.route?.path || req.path, status: res.statusCode };

      metrics.increment('http_requests_total', labels);
      metrics.observe('http_request_duration_ms', duration, labels);

      if (res.statusCode >= 500) {
        metrics.increment('http_errors_total', labels);
        logger.error('Request failed', { ...labels, duration, traceId });
      } else if (duration > 1000) {
        logger.warn('Slow request', { ...labels, duration, traceId });
      }
    });

    next();
  };
}

// ---------- Health Check Endpoint ----------
class HealthChecker {
  constructor() { this.checks = []; }

  addCheck(name, checkFn) {
    this.checks.push({ name, check: checkFn });
  }

  async getHealth() {
    const results = await Promise.all(
      this.checks.map(async ({ name, check }) => {
        try {
          await check();
          return { name, status: 'healthy' };
        } catch (error) {
          return { name, status: 'unhealthy', error: error.message };
        }
      })
    );

    const healthy = results.every(r => r.status === 'healthy');
    return { status: healthy ? 'healthy' : 'unhealthy', checks: results, timestamp: new Date().toISOString() };
  }
}

function generateTraceId() { return 'trace_' + Math.random().toString(36).slice(2); }

// Demo
const metrics = new MetricsCollector();
[50, 80, 120, 200, 500, 45, 90, 150].forEach(d => metrics.observe('latency', d));
console.log('p50:', metrics.percentile('latency', 50));
console.log('p99:', metrics.percentile('latency', 99));`,
      exercise: `1. **Monitoring Dashboard**: Design a monitoring dashboard for a microservices architecture. Include: service health, latency percentiles, error rates, throughput, and business metrics.

2. **SLO Budget**: Your API has a 99.9% availability SLO. You've used 50% of your error budget in the first week of the month. Design the response plan: slow down deployments, freeze features, or investigate?

3. **Distributed Tracing**: A user reports slow checkout (10s response time). Design how you would trace the request across: API Gateway → Order Service → Payment Service → Inventory Service to find the bottleneck.

4. **Alerting Strategy**: Design the alerting strategy: What metrics trigger pages? What's the escalation path? How do you avoid alert fatigue?`,
      commonMistakes: [
        "Logging too much or too little — logging every request at DEBUG pollutes logs; logging only errors misses context. Use structured logging with appropriate levels.",
        "Not monitoring business metrics — technical metrics (CPU, latency) are necessary but insufficient. Track business KPIs (revenue, conversions, user signups) alongside.",
        "Alert fatigue — alerting on every anomaly leads to ignored alerts. Use tiered alerting: pages for SLO violations, notifications for warnings, dashboards for everything else.",
        "Not having SLOs — without measurable targets, 'reliability' is subjective. Define SLOs (99.9% availability, p99 < 500ms) and track error budgets.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How would you set up monitoring for a distributed system?",
          a: "**Three pillars**: Logs (what happened), Metrics (how much), Traces (where the time went).\n\n**Metrics**: RED for services (Rate, Errors, Duration), USE for resources (Utilization, Saturation, Errors). Track p50, p95, p99 latency.\n\n**Alerting**: Page on SLO violations (error rate > 1%, p99 > 2s). Notify on warnings (CPU > 70%). Dashboard everything else.\n\n**Distributed tracing**: Propagate trace IDs across services. Visualize the full request path to identify bottlenecks.\n\n**Tools**: Prometheus + Grafana (metrics), ELK (logs), Jaeger (tracing), PagerDuty (alerting).\n\n**SLOs**: 99.9% availability, p99 < 500ms. Track error budget consumption weekly.",
        },
      ],
    },
    {
      id: "sd-reliability-engineering",
      title: "Reliability Engineering & Disaster Recovery",
      explanation: `**Site Reliability Engineering (SRE)** focuses on building and maintaining reliable systems at scale. Key concepts include redundancy, disaster recovery, and chaos engineering.

## Redundancy Levels

| Level | Description | Protects Against |
|-------|-------------|-----------------|
| **Server** | Multiple app servers behind LB | Single server failure |
| **Zone** | Replicate across availability zones | Datacenter failure |
| **Region** | Active in multiple geographic regions | Regional disaster |

## Disaster Recovery Strategies

| Strategy | RPO | RTO | Cost |
|----------|-----|-----|------|
| **Backup & Restore** | Hours | Hours | $ |
| **Pilot Light** | Minutes | Minutes | $$ |
| **Warm Standby** | Seconds | Seconds | $$$ |
| **Active-Active** | Zero | Zero | $$$$ |

**RPO (Recovery Point Objective)**: How much data can you afford to lose?
**RTO (Recovery Time Objective)**: How long can you be down?

## Chaos Engineering
Intentionally inject failures to test system resilience:
- Kill random servers (Netflix Chaos Monkey)
- Simulate network failures between services
- Inject latency into critical paths
- Fill disk space, exhaust memory

**Philosophy**: If you're going to have failures in production (and you will), it's better to fail on your terms during business hours than at 3 AM.

## Deployment Strategies

| Strategy | Description | Risk |
|----------|-------------|------|
| **Rolling** | Replace instances gradually | Moderate (rollback possible) |
| **Blue-Green** | Switch traffic from old to new instantly | Low (instant rollback) |
| **Canary** | Route small % of traffic to new version | Very low (test with real traffic) |
| **Feature Flags** | Enable features per user/group | Lowest (toggle instantly) |

> **Interview tip**: Mentioning chaos engineering and deployment strategies shows you think about operational reliability, not just building features.`,
      codeExample: `// ============================================
// Reliability Engineering — Patterns
// ============================================

// ---------- Canary Deployment ----------
class CanaryDeployment {
  constructor(loadBalancer) {
    this.lb = loadBalancer;
    this.canaryPercentage = 5; // Start with 5%
    this.metrics = { canary: { errors: 0, requests: 0 }, stable: { errors: 0, requests: 0 } };
  }

  routeRequest(req) {
    const isCanary = Math.random() * 100 < this.canaryPercentage;
    return isCanary ? 'canary' : 'stable';
  }

  recordResult(version, success) {
    this.metrics[version].requests++;
    if (!success) this.metrics[version].errors++;

    // Auto-promote or rollback
    if (this.metrics.canary.requests >= 1000) {
      const canaryErrorRate = this.metrics.canary.errors / this.metrics.canary.requests;
      const stableErrorRate = this.metrics.stable.errors / this.metrics.stable.requests;

      if (canaryErrorRate > stableErrorRate * 2) {
        console.log('🚨 Canary error rate too high — ROLLING BACK');
        this.canaryPercentage = 0;
      } else {
        this.canaryPercentage = Math.min(100, this.canaryPercentage * 2);
        console.log(\`✅ Canary healthy — increasing to \\\${this.canaryPercentage}%\`);
      }
    }
  }
}

// ---------- Feature Flags ----------
class FeatureFlags {
  constructor() {
    this.flags = new Map();
  }

  setFlag(name, config) {
    this.flags.set(name, {
      enabled: config.enabled || false,
      percentage: config.percentage || 0,
      allowlist: config.allowlist || [],
      rules: config.rules || [],
    });
  }

  isEnabled(flagName, userId = null, context = {}) {
    const flag = this.flags.get(flagName);
    if (!flag) return false;
    if (!flag.enabled) return false;

    // Check allowlist (specific users)
    if (userId && flag.allowlist.includes(userId)) return true;

    // Check percentage rollout
    if (flag.percentage > 0 && userId) {
      const hash = this.stableHash(userId + flagName);
      return (hash % 100) < flag.percentage;
    }

    return flag.enabled;
  }

  stableHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }
}

// Demo — Feature flags
const ff = new FeatureFlags();
ff.setFlag('new_checkout', {
  enabled: true,
  percentage: 10, // 10% of users
  allowlist: ['user_internal1', 'user_beta'],
});

console.log('Internal user:', ff.isEnabled('new_checkout', 'user_internal1')); // true (allowlist)
console.log('Random user:', ff.isEnabled('new_checkout', 'user_random'));      // ~10% chance

// Canary demo
const canary = new CanaryDeployment(null);
for (let i = 0; i < 100; i++) {
  const version = canary.routeRequest({});
  canary.recordResult(version, Math.random() > 0.02);
}
console.log('Canary metrics:', canary.metrics);`,
      exercise: `1. **DR Plan**: Design a disaster recovery plan for an e-commerce platform. Define RPO and RTO for each component: user data, orders, product catalog, search index, payment records.

2. **Chaos Engineering**: Design 5 chaos experiments for a microservices application. For each: what you inject, what you expect to happen, and how the system should recover.

3. **Blue-Green Deployment**: Design a blue-green deployment pipeline for a web application with a database migration. How do you handle backward-incompatible schema changes?

4. **Post-Mortem**: Write a post-mortem template for an outage. Include: timeline, root cause, impact, detection, resolution, and action items.`,
      commonMistakes: [
        "No disaster recovery plan — hoping failures won't happen is not a strategy. Define RPO/RTO, practice failovers, and test backups regularly.",
        "Deploying everything at once — big-bang deployments are the highest risk. Use canary or rolling deployments to catch issues before they affect all users.",
        "Not testing backups — a backup that can't be restored is worthless. Regularly test restore procedures and measure actual RTO.",
        "Feature flags without cleanup — accumulated stale feature flags add complexity and bugs. Remove flags after rollout is complete.",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your primary database goes down. Walk me through your disaster recovery process.",
          a: "**Immediate response** (0-5 min):\n1. Automated monitoring detects failure, pages on-call engineer\n2. Health checks remove unhealthy primary from load balancer\n3. Automated failover promotes the most up-to-date replica to primary\n\n**Recovery** (5-30 min):\n4. Verify new primary is accepting writes correctly\n5. Redirect application connections to new primary\n6. Verify data consistency (compare with other replicas)\n\n**Post-recovery**:\n7. Provision new replica to replace old primary\n8. Investigate root cause (hardware failure, disk full, etc.)\n9. Write post-mortem with action items\n\n**Prevention**: Semi-synchronous replication (one replica always has latest data), automated failover (reduces RTO to seconds), regular failover drills (monthly).",
        },
      ],
    },
  ],
};

export default sdPhase13;
