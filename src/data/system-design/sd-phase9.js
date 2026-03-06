const sdPhase9 = {
  id: "phase-9",
  title: "Phase 9: Microservices Architecture",
  emoji: "🧩",
  description:
    "Learn microservices design principles — API gateways, service discovery, inter-service communication, circuit breakers, and when monoliths are actually better.",
  topics: [
    {
      id: "sd-monolith-vs-microservices",
      title: "Monolith vs Microservices",
      explanation: `**Monolith**: A single deployable application containing all business logic.
**Microservices**: Multiple small, independently deployable services, each owning a bounded context.

## Comparison

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Deployment** | Single unit (all or nothing) | Independent per-service deployment |
| **Scaling** | Scale the entire application | Scale individual services independently |
| **Technology** | One tech stack | Each service can use different tech |
| **Data** | Shared database | Each service owns its database |
| **Complexity** | Simple to develop and deploy | Distributed systems complexity |
| **Team structure** | One team or feature teams | Service teams with ownership |
| **Failure** | One bug can crash everything | Failure isolated to one service |
| **Testing** | Simple end-to-end tests | Complex distributed testing |

## When to Use Each

### Start with Monolith When:
- Startup / new product (unknown requirements)
- Small team (< 10 engineers)
- Simple domain with clear boundaries
- Need to move fast and iterate

### Migrate to Microservices When:
- Monolith is too large for one team to understand
- Different components need different scaling
- Deployment of one feature blocks others
- Teams can't work independently (merge conflicts, coordination)

## The Strangler Fig Pattern
Gradually migrate from monolith to microservices by extracting one service at a time, routing new traffic to the new service while the monolith handles remaining features.

> **Interview tip**: "I'd start with a well-structured monolith and extract microservices when the team or scale demands it." This shows pragmatism — interviewers appreciate engineers who don't over-engineer.`,
      codeExample: `// ============================================
// Microservices vs Monolith — Architecture Comparison
// ============================================

// ---------- Monolith Architecture ----------
class MonolithApp {
  constructor(db) { this.db = db; }

  // ALL logic in one application
  async createOrder(userId, items) {
    return await this.db.transaction(async (tx) => {
      // All in one DB transaction — ACID guaranteed
      const user = await tx.query('SELECT * FROM users WHERE id = $1', [userId]);
      const inventory = await this.checkInventory(tx, items);
      const payment = await this.chargePayment(tx, user, items);
      const order = await tx.query(
        'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
        [userId, payment.total]
      );
      await this.sendConfirmation(user.email, order);
      return order;
    });
  }

  async checkInventory(tx, items) { /* ... */ }
  async chargePayment(tx, user, items) { return { total: 99 }; }
  async sendConfirmation(email, order) { /* ... */ }
}

// ---------- Microservices Architecture ----------

// Each service is independent with its own database
class OrderService {
  constructor(eventBus) { this.eventBus = eventBus; }

  async createOrder(userId, items) {
    const order = await this.db.insert('orders', { userId, items, status: 'pending' });
    // Publish event — other services react independently
    await this.eventBus.publish('order.created', {
      orderId: order.id, userId, items, total: order.total,
    });
    return order;
  }
}

class InventoryService {
  constructor(eventBus) {
    eventBus.subscribe('order.created', (e) => this.reserveInventory(e));
    eventBus.subscribe('payment.failed', (e) => this.releaseInventory(e));
  }
  async reserveInventory(event) {
    console.log(\`[Inventory] Reserving items for order \\\${event.orderId}\`);
  }
  async releaseInventory(event) {
    console.log(\`[Inventory] Releasing items for order \\\${event.orderId}\`);
  }
}

class PaymentService {
  constructor(eventBus) {
    eventBus.subscribe('order.created', (e) => this.processPayment(e));
  }
  async processPayment(event) {
    console.log(\`[Payment] Charging for order \\\${event.orderId}\`);
  }
}

class NotificationService {
  constructor(eventBus) {
    eventBus.subscribe('payment.charged', (e) => this.sendEmail(e));
  }
  async sendEmail(event) {
    console.log(\`[Notification] Email confirmation for order \\\${event.orderId}\`);
  }
}

// ---------- API Gateway Pattern ----------
class APIGateway {
  constructor() {
    this.routes = new Map();
    this.rateLimiter = new Map();
  }

  registerRoute(path, service) {
    this.routes.set(path, service);
  }

  async handleRequest(req) {
    // 1. Authentication
    const user = await this.authenticate(req);
    if (!user) return { status: 401, body: 'Unauthorized' };

    // 2. Rate limiting
    if (this.isRateLimited(user.id)) return { status: 429, body: 'Too many requests' };

    // 3. Route to correct service
    const service = this.routes.get(req.path);
    if (!service) return { status: 404, body: 'Not found' };

    // 4. Forward request
    try {
      const response = await service.handle(req);
      return { status: 200, body: response };
    } catch (error) {
      return { status: 500, body: 'Internal error' };
    }
  }

  async authenticate(req) { return { id: 'user_123' }; }
  isRateLimited(userId) { return false; }
}

console.log("Microservices architecture patterns demonstrated.");`,
      exercise: `1. **Service Decomposition**: Take a monolithic e-commerce app (users, products, orders, payments, search, recommendations, notifications) and design the microservice boundaries. Which services should be separate? Which should stay together?

2. **API Gateway Design**: Design an API gateway that handles: routing, authentication, rate limiting, request transformation, and response aggregation for 5 microservices.

3. **Database Per Service**: Your monolith uses one PostgreSQL database with JOINs between user, order, and product tables. How do you split this into per-service databases? How do you handle cross-service queries?

4. **Strangler Fig Migration**: Design a step-by-step plan to extract the "notification" service from a monolith. Include: API routing, data migration, feature flags, and rollback strategy.`,
      commonMistakes: [
        "Adopting microservices too early — microservices add significant operational complexity (service mesh, distributed tracing, eventual consistency). For a team < 10 engineers, a monolith is usually better.",
        "Creating too-small services (nano-services) — a service that makes 5 HTTP calls to do one thing is over-decomposed. Each service should represent a bounded context with meaningful business logic.",
        "Sharing a database between microservices — this creates tight coupling and defeats the purpose. Each service should own its data and expose it via APIs or events.",
        "Synchronous communication everywhere — if Service A calls B calls C calls D synchronously, one slow service blocks everything. Use async events for non-critical paths.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When should you use microservices vs a monolith?",
          a: "**Monolith when**: Small team (< 10 engineers), new product with unclear requirements, simple domain, need to ship fast. A well-structured monolith (modular, clean boundaries) handles most startups perfectly.\n\n**Microservices when**: Large team (autonomy needed), parts have different scaling needs, deployment coupling is a problem, technology flexibility needed, organizational boundaries align with service boundaries.\n\n**Red flags for premature microservices**: Distributed transactions, tight coupling between services (frequent cross-service calls), shared databases, deployment requiring multiple services simultaneously.\n\n**My approach**: Start with a modular monolith with clear domain boundaries. When specific modules need independent scaling or deployment, extract them into services.",
        },
        {
          type: "scenario",
          q: "How would you handle a request that needs data from 3 different microservices?",
          a: "**Option 1: API Gateway aggregation**: Gateway calls all 3 services in parallel, combines responses.\n\n**Option 2: Backend-for-Frontend (BFF)**: A dedicated service for a specific frontend that aggregates and transforms data from multiple services.\n\n**Option 3: Data denormalization with events**: Each service listens to events from others and maintains a local copy of needed data. Queries are local — no cross-service calls.\n\n**My recommendation**: Options 1 or 2 for read-heavy paths. Option 3 when latency is critical and eventual consistency is acceptable.\n\nAvoid: Cascading synchronous calls (A → B → C) — they compound latency and create tight coupling.",
        },
      ],
    },
    {
      id: "sd-resilience-patterns",
      title: "Resilience Patterns",
      explanation: `In distributed systems, failures are **inevitable**. Network issues, server crashes, and service overloads are normal. Resilience patterns help your system survive these failures gracefully.

## Key Patterns

### 1. Circuit Breaker
Like an electrical circuit breaker — stops calling a failing service to prevent cascading failures.

**States**: CLOSED (normal) → OPEN (failing, stop calling) → HALF-OPEN (test with one request)

### 2. Retry with Exponential Backoff
Retry failed requests with increasing delay: 1s → 2s → 4s → 8s

### 3. Timeout
Set maximum time to wait for a response. Without timeouts, slow services can exhaust all threads/connections.

### 4. Bulkhead
Isolate failures by limiting resources per component. If the search service is slow, it shouldn't consume all connections needed by the checkout service.

### 5. Rate Limiting
Limit the number of requests a client can make. Protects against abuse and cascading overload.

### 6. Fallback
When a service fails, return a degraded but acceptable response (cached data, default values, simplified functionality).

### 7. Health Checks
Proactively detect unhealthy services and remove them from load balancing.

> **Interview tip**: When designing any distributed system, mention circuit breakers and timeouts. They show you understand real-world failure scenarios.`,
      codeExample: `// ============================================
// Resilience Patterns — Implementation
// ============================================

// ---------- Circuit Breaker ----------
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit HALF-OPEN: testing...');
      } else {
        throw new Error('Circuit OPEN: request blocked');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('Circuit CLOSED: service recovered');
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log(\`Circuit OPEN after \\\${this.failureCount} failures\`);
    }
  }
}

// ---------- Retry with Exponential Backoff ----------
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(\`Retry \\\${attempt + 1}/\\\${maxRetries} in \\\${Math.round(delay)}ms\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// ---------- Bulkhead (Thread Pool Isolation) ----------
class Bulkhead {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async execute(fn) {
    if (this.running >= this.maxConcurrent) {
      return new Promise((resolve, reject) => {
        this.queue.push({ fn, resolve, reject });
      });
    }
    return this.runTask(fn);
  }

  async runTask(fn) {
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this.runTask(next.fn).then(next.resolve).catch(next.reject);
      }
    }
  }
}

// ---------- Resilient Service Client ----------
class ResilientClient {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.circuitBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 10000 });
    this.bulkhead = new Bulkhead(10);
    this.timeout = 5000;
  }

  async call(url, options) {
    return this.bulkhead.execute(() =>
      this.circuitBreaker.call(() =>
        this.fetchWithTimeout(url, options)
      )
    );
  }

  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }
}

// Demo
const cb = new CircuitBreaker({ failureThreshold: 3 });
async function demo() {
  for (let i = 0; i < 5; i++) {
    try {
      await cb.call(async () => { throw new Error('Service down'); });
    } catch (e) {
      console.log(\`Request \\\${i + 1}: \\\${e.message}\`);
    }
  }
}
demo();`,
      exercise: `1. **Circuit Breaker Design**: Implement a circuit breaker for a payment gateway that: opens after 3 failures in 60 seconds, checks health every 30 seconds in half-open state, and logs all state transitions.

2. **Retry Strategy**: Design retry policies for: (a) Payment processing (idempotent), (b) Email sending (non-critical), (c) Database writes (transient failures), (d) Third-party API calls (rate limited).

3. **Bulkhead Architecture**: Design bulkhead isolation for a service that calls 4 downstream services. How many connections per bulkhead? What happens when one bulkhead is full?

4. **Graceful Degradation**: Design fallback strategies for when the recommendation service is down: What does the user see? How does the system behave? When does it recover?`,
      commonMistakes: [
        "Not setting timeouts — without timeouts, a hanging downstream service consumes threads/connections indefinitely, eventually crashing the caller. Always set explicit timeouts.",
        "Retrying non-idempotent operations — retrying a payment charge without idempotency keys could charge the customer twice. Ensure operations are idempotent before adding retries.",
        "Circuit breaker threshold too sensitive — if the breaker opens after 1 failure, a single network blip causes minutes of disruption. Set thresholds based on error rate, not absolute count.",
        "No fallback when circuit is open — returning a 503 error is better than cascading failure, but returning cached/default data is better than an error when possible.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the circuit breaker pattern and why is it important?",
          a: "**Circuit breaker** prevents cascading failures in distributed systems by stopping calls to a failing service.\n\n**Three states**:\n- **CLOSED** (normal): Requests go through. Count failures.\n- **OPEN** (failing): All requests immediately rejected (fail fast). No calls to downstream.\n- **HALF-OPEN** (testing): Let ONE request through. If it succeeds → CLOSED. If it fails → OPEN.\n\n**Why important**: Without it, when Service B is down, Service A keeps calling it → A's thread pool fills up → A becomes unresponsive → A's callers fail → cascading failure across the entire system.\n\n**With circuit breaker**: After N failures, A stops calling B immediately → returns fallback/error → A stays healthy → only B is affected.",
        },
        {
          type: "scenario",
          q: "Your payment service is experiencing intermittent timeouts. How do you handle it?",
          a: "**Layered resilience**:\n\n1. **Timeout**: Set 5-second timeout on payment calls (don't let slow calls hang)\n2. **Retry with idempotency**: Retry once with an idempotency key (prevents double charging)\n3. **Circuit breaker**: If failure rate > 30%, open circuit and stop attempting payments temporarily\n4. **Fallback**: Queue the order as 'pending payment' and process later; show user 'order received, payment processing'\n5. **Alert**: Notify engineering when circuit opens\n6. **Recovery**: Circuit goes half-open after 30s, tests with one request, closes if successful",
        },
      ],
    },
  ],
};

export default sdPhase9;
