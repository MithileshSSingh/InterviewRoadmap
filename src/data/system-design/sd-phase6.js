const sdPhase6 = {
  id: "phase-6",
  title: "Phase 6: Message Queues & Async Processing",
  emoji: "📨",
  description:
    "Decouple services with message queues — learn Kafka, RabbitMQ, event-driven architecture, pub/sub patterns, and how async processing enables massive scale.",
  topics: [
    {
      id: "sd-message-queue-fundamentals",
      title: "Message Queue Fundamentals",
      explanation: `A **message queue** is a middleware that enables **asynchronous communication** between services. Instead of Service A calling Service B directly (synchronous), Service A puts a message on the queue, and Service B processes it when ready.

## Why Message Queues?

| Problem | How Queues Solve It |
|---------|-------------------|
| **Tight coupling** | Services communicate via messages, not direct calls |
| **Overwhelming downstream** | Queue acts as buffer, consumer processes at its own pace |
| **Retry complexity** | Queue retries failed messages automatically |
| **Availability dependency** | Producer works even if consumer is down |
| **Traffic spikes** | Queue absorbs bursts, consumer processes steadily |

## Core Concepts

- **Producer**: Creates and sends messages to the queue
- **Consumer**: Reads and processes messages from the queue
- **Queue/Topic**: The channel that holds messages
- **Broker**: The server managing queues (RabbitMQ, Kafka, SQS)
- **Dead Letter Queue (DLQ)**: Where failed messages go after max retries

## Delivery Guarantees

| Guarantee | Description | Example |
|-----------|-------------|---------|
| **At-most-once** | Message may be lost, never duplicated | Logging, metrics |
| **At-least-once** | Message delivered 1+ times, may have duplicates | Order processing (with idempotency) |
| **Exactly-once** | Message delivered exactly once | Payment processing (hardest to achieve) |

## Queue vs Topic (Pub/Sub)

| Pattern | Queue (Point-to-Point) | Topic (Pub/Sub) |
|---------|----------------------|-----------------|
| **Consumers** | One consumer gets each message | All subscribers get every message |
| **Use case** | Task distribution, work queues | Event broadcasting, notifications |
| **Example** | Email sending queue | "Order created" event to inventory, shipping, and analytics |

> **Pro tip**: In interviews, use message queues whenever you see "process this later," "notify multiple services," or "handle traffic spikes."`,
      codeExample: `// ============================================
// Message Queue Patterns
// ============================================

// ---------- Basic Queue Pattern ----------
class MessageQueue {
  constructor() {
    this.queues = new Map();
    this.deadLetterQueue = [];
  }

  publish(queueName, message) {
    if (!this.queues.has(queueName)) this.queues.set(queueName, []);
    this.queues.get(queueName).push({
      id: Math.random().toString(36).slice(2),
      data: message,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
    });
  }

  async consume(queueName, handler) {
    const queue = this.queues.get(queueName) || [];
    while (queue.length > 0) {
      const message = queue.shift();
      try {
        await handler(message.data);
        console.log(\`✅ Processed: \\\${message.id}\`);
      } catch (error) {
        message.retries++;
        if (message.retries < message.maxRetries) {
          queue.push(message); // Retry
          console.log(\`⏳ Retry \\\${message.retries}/\\\${message.maxRetries}: \\\${message.id}\`);
        } else {
          this.deadLetterQueue.push(message); // Move to DLQ
          console.log(\`❌ DLQ: \\\${message.id} after \\\${message.maxRetries} retries\`);
        }
      }
    }
  }
}

// ---------- Async Order Processing ----------

// ❌ BAD: Synchronous — user waits for everything
async function processOrderSync(order) {
  await validateOrder(order);           // 50ms
  await chargePayment(order);           // 200ms
  await updateInventory(order);         // 100ms
  await sendConfirmationEmail(order);   // 300ms
  await notifyWarehouse(order);         // 150ms
  await updateAnalytics(order);         // 100ms
  return { status: 'completed' };       // 900ms total!
}

// ✅ GOOD: Async — user gets fast response
async function processOrderAsync(order, queue) {
  await validateOrder(order);                    // 50ms
  const payment = await chargePayment(order);    // 200ms

  if (payment.success) {
    // Queue remaining tasks
    await queue.publish('order.confirmed', {
      orderId: order.id, items: order.items, userId: order.userId,
    });
    return { status: 'confirmed' };              // 250ms total!
  }
  return { status: 'payment_failed' };
}

// Background workers process events independently:
// Worker 1: order.confirmed → updateInventory
// Worker 2: order.confirmed → sendConfirmationEmail
// Worker 3: order.confirmed → notifyWarehouse
// Worker 4: order.confirmed → updateAnalytics

// ---------- Fan-out Pattern (One event → Multiple consumers) ----------
class EventBus {
  constructor() { this.subscribers = new Map(); }

  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) this.subscribers.set(eventType, []);
    this.subscribers.get(eventType).push(handler);
  }

  async publish(eventType, data) {
    const handlers = this.subscribers.get(eventType) || [];
    await Promise.all(handlers.map(h => h(data)));
  }
}

// Usage
const bus = new EventBus();
bus.subscribe('user.registered', async (data) => { console.log('Send welcome email:', data.email); });
bus.subscribe('user.registered', async (data) => { console.log('Create default settings:', data.userId); });
bus.subscribe('user.registered', async (data) => { console.log('Track analytics:', data.userId); });
bus.publish('user.registered', { userId: '123', email: 'user@test.com' });

async function validateOrder(o) {}
async function chargePayment(o) { return { success: true }; }
async function updateInventory(o) {}
async function sendConfirmationEmail(o) {}
async function notifyWarehouse(o) {}
async function updateAnalytics(o) {}`,
      exercise: `1. **Async Refactor**: Refactor a synchronous user registration flow (validate → create user → send email → create settings → log analytics) into async using message queues.

2. **Dead Letter Queue**: Design a DLQ handler for a payment processing queue. What happens to failed payments? How do you retry? Alert? Manually resolve?

3. **Delivery Guarantees**: For each scenario, choose at-most-once, at-least-once, or exactly-once: (a) logging, (b) payment, (c) email notification, (d) inventory update.

4. **Queue vs Direct Call**: When should you use a message queue vs direct HTTP call between services? Give 3 examples of each.`,
      commonMistakes: [
        "Using queues for everything — synchronous calls are simpler when both services must be available and response time matters. Don't add a queue between your API and its database.",
        "Not handling message failures — without retry logic and dead letter queues, failed messages are silently lost. Always configure retries with exponential backoff and DLQs.",
        "Ignoring message ordering — most queues don't guarantee order across partitions. If order matters, use a single partition or sequence numbers with consumer-side reordering.",
        "Not making consumers idempotent — with at-least-once delivery, consumers may process the same message twice. Use idempotency keys to prevent duplicate side effects.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When should you use a message queue in a system design?",
          a: "Use message queues when:\n1. **Decoupling**: Services shouldn't depend on each other's availability\n2. **Async processing**: Work can be done later (email, analytics, notifications)\n3. **Load leveling**: Traffic spikes shouldn't overwhelm downstream services\n4. **Fan-out**: One event needs to trigger multiple downstream actions\n5. **Retry/resilience**: Failed operations should be retried automatically\n\n**Don't use** when: Immediate response is needed, latency is critical, or simple request-response suffices.",
        },
        {
          type: "scenario",
          q: "How would you handle a message that fails after 3 retries?",
          a: "Send to **Dead Letter Queue (DLQ)**:\n1. After max retries, move message to DLQ with failure metadata (error, attempt count, timestamps)\n2. **Alert ops team** — DLQ messages indicate a systemic issue\n3. **DLQ consumer**: Logs the failure, creates a support ticket or triggers manual review\n4. After fixing the issue, **replay** DLQ messages back to the original queue\n5. **Monitor DLQ depth** — growing DLQ means something is consistently broken",
        },
      ],
    },
    {
      id: "sd-kafka-deep-dive",
      title: "Apache Kafka & Event Streaming",
      explanation: `**Apache Kafka** is a distributed **event streaming platform** designed for high-throughput, fault-tolerant, and real-time data pipelines. It's not just a message queue — it's a distributed commit log.

## Kafka vs Traditional Message Queues

| Feature | Kafka | RabbitMQ/SQS |
|---------|-------|-------------|
| **Model** | Distributed log | Message queue |
| **Retention** | Configurable (days/forever) | Until consumed |
| **Replay** | Can replay from any offset | Messages deleted after consumption |
| **Throughput** | Millions of messages/sec | Thousands/sec |
| **Consumer groups** | Multiple groups read independently | Each message consumed once |
| **Ordering** | Guaranteed within partition | Not guaranteed (mostly) |

## Core Concepts

- **Topic**: A named stream of events (like a database table for events)
- **Partition**: Topics are split into partitions for parallelism
- **Offset**: Sequential ID for each message within a partition
- **Producer**: Writes events to topics
- **Consumer Group**: A group of consumers that share the work of reading a topic
- **Broker**: A Kafka server; cluster has multiple brokers for fault tolerance
- **Replication Factor**: How many copies of each partition exist

## When to Use Kafka

- **Event sourcing**: Store every event as the source of truth
- **Real-time analytics**: Stream processing (counts, aggregations)
- **Log aggregation**: Centralize logs from hundreds of services
- **Change Data Capture (CDC)**: Replicate database changes to other systems
- **Microservice communication**: Decouple services with events

> **Key insight**: Kafka retains messages. Even after consumption, messages stay for the configured retention period. This means you can **replay** events, add new consumers that read historical data, and debug production issues by re-processing events.`,
      codeExample: `// ============================================
// Kafka Concepts — Simplified Demonstration
// ============================================

// ---------- Kafka-like Event Log ----------
class EventLog {
  constructor(partitionCount = 3) {
    this.partitions = Array.from({ length: partitionCount }, () => []);
    this.consumerGroups = new Map();
  }

  // Produce: write to a partition (determined by key hash)
  produce(topic, key, value) {
    const partitionIndex = this.getPartition(key);
    const offset = this.partitions[partitionIndex].length;
    const event = { offset, key, value, timestamp: Date.now(), topic };
    this.partitions[partitionIndex].push(event);
    console.log(\`Produced to partition \\\${partitionIndex}, offset \\\${offset}\`);
    return { partition: partitionIndex, offset };
  }

  // Consumer group: each partition assigned to one consumer in group
  consume(groupId, handler) {
    if (!this.consumerGroups.has(groupId)) {
      this.consumerGroups.set(groupId, new Map()); // partition → offset
    }
    const offsets = this.consumerGroups.get(groupId);

    for (let p = 0; p < this.partitions.length; p++) {
      const startOffset = offsets.get(p) || 0;
      const partition = this.partitions[p];

      for (let i = startOffset; i < partition.length; i++) {
        handler(partition[i]);
        offsets.set(p, i + 1); // Commit offset
      }
    }
  }

  // Same key always goes to same partition (ordering guarantee)
  getPartition(key) {
    let hash = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.partitions.length;
    }
    return Math.abs(hash);
  }
}

// ---------- Event-Driven Architecture with Kafka ----------
class OrderService {
  constructor(kafka) { this.kafka = kafka; }

  async createOrder(order) {
    // Write to DB, then publish event
    const savedOrder = await this.saveToDb(order);
    this.kafka.produce('orders', order.userId, {
      type: 'ORDER_CREATED',
      orderId: savedOrder.id,
      items: order.items,
      total: order.total,
      userId: order.userId,
    });
    return savedOrder;
  }
  async saveToDb(order) { return { ...order, id: 'ord_' + Date.now() }; }
}

// Each service consumes independently
class InventoryService {
  constructor(kafka) {
    kafka.consume('inventory-service', (event) => {
      if (event.value.type === 'ORDER_CREATED') {
        console.log(\`[Inventory] Reserving items for \\\${event.value.orderId}\`);
      }
    });
  }
}

class NotificationService {
  constructor(kafka) {
    kafka.consume('notification-service', (event) => {
      if (event.value.type === 'ORDER_CREATED') {
        console.log(\`[Notification] Sending email for \\\${event.value.orderId}\`);
      }
    });
  }
}

// Demo
const kafka = new EventLog(3);
const orderSvc = new OrderService(kafka);
orderSvc.createOrder({ userId: 'user_1', items: ['item_a'], total: 99.99 });
orderSvc.createOrder({ userId: 'user_1', items: ['item_b'], total: 49.99 });
new InventoryService(kafka);
new NotificationService(kafka);`,
      exercise: `1. **Kafka Architecture**: Design a Kafka cluster for an e-commerce platform handling 500K orders/day. How many brokers, partitions per topic, and replication factor?

2. **Event-Driven System**: Convert a monolithic order processing system into event-driven using Kafka. Identify all events, topics, producers, and consumer groups.

3. **Kafka vs RabbitMQ**: For each scenario, choose Kafka or RabbitMQ: (a) Order processing queue, (b) Real-time clickstream analytics, (c) Email sending, (d) Database change replication.

4. **Partition Strategy**: A chat application uses Kafka for messages. What partition key ensures messages within a conversation are ordered? What about messages for a user across all conversations?`,
      commonMistakes: [
        "Using Kafka for simple task queues — Kafka's overhead (ZooKeeper, brokers, partitions) is overkill for simple job queues. Use RabbitMQ or SQS for basic task distribution.",
        "Too few partitions — partitions determine consumer parallelism. With 3 partitions, max 3 consumers per group. Plan for future scale: start with 10-50 partitions per topic.",
        "Not thinking about partition keys — random partitioning loses message ordering. Use meaningful keys (userId, orderId) to keep related events in the same partition.",
        "Treating Kafka as a database — Kafka retains messages but isn't optimized for random access queries. Use it as an event log, not a primary data store.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What makes Kafka different from a traditional message queue?",
          a: "Key differences:\n1. **Distributed log vs queue**: Kafka stores messages in an append-only log. Messages aren't deleted after consumption — they're retained for a configurable period.\n2. **Consumer groups**: Multiple consumer groups can read the same topic independently, each at their own pace. Traditional queues deliver each message to one consumer.\n3. **Replay**: You can re-read messages from any point in time. Essential for rebuilding state, debugging, or adding new consumers.\n4. **High throughput**: Designed for millions of messages/sec through sequential disk I/O, zero-copy, and batching.\n5. **Ordering**: Guaranteed within a partition (not across partitions).",
        },
        {
          type: "scenario",
          q: "How would you ensure exactly-once processing with Kafka?",
          a: "**Exactly-once is extremely hard.** Practical approaches:\n\n1. **Idempotent consumers** (most common): Make consumers handle duplicates gracefully. When processing a payment, check if orderId was already processed before charging.\n\n2. **Kafka transactions** (producer side): Kafka 0.11+ supports idempotent producers and transactions — ensures a message is written exactly once to the log.\n\n3. **Transactional outbox pattern**: Write the event to an outbox table in the same DB transaction as the business logic. A separate process reads the outbox and publishes to Kafka.\n\nIn practice, most systems use **at-least-once delivery + idempotent consumers**, which is simpler and achieves the same effect as exactly-once.",
        },
      ],
    },
    {
      id: "sd-event-driven-architecture",
      title: "Event-Driven Architecture",
      explanation: `**Event-driven architecture (EDA)** is a design pattern where services communicate by producing and consuming **events** rather than making direct API calls. It's the foundation of scalable, loosely coupled microservices.

## Key Patterns

### 1. Event Notification
Service publishes an event, but the event only contains an identifier. Consumers must fetch details themselves.
- Event: \`{ type: "order.created", orderId: "123" }\`
- Consumer: Calls Order Service API to get full order details

### 2. Event-Carried State Transfer
Event contains ALL the data consumers need. No callbacks required.
- Event: \`{ type: "order.created", orderId: "123", items: [...], total: 99.99, userId: "456" }\`
- Consumer: Has everything it needs in the event

### 3. Event Sourcing
Store events as the source of truth. Current state is derived by replaying events.
- Events: Deposited $100 → Withdrew $30 → Deposited $50 → Balance = $120

### 4. CQRS + Events
Separate read/write models. Events sync the read model with the write model.

## Saga Pattern (Distributed Transactions)
When a business process spans multiple services, use **sagas** — a sequence of local transactions coordinated by events.

### Choreography Saga (Event-based)
Each service publishes events that trigger the next step:
\`\`\`
OrderService → OrderCreated
PaymentService (hears OrderCreated) → PaymentCharged
InventoryService (hears PaymentCharged) → ItemsReserved
ShippingService (hears ItemsReserved) → ShipmentCreated
\`\`\`

### Orchestration Saga (Coordinator-based)
A central orchestrator tells each service what to do:
\`\`\`
Orchestrator → Tell PaymentService to charge
Orchestrator → Tell InventoryService to reserve
Orchestrator → Tell ShippingService to ship
\`\`\`

> **Choreography** is more decoupled but harder to debug. **Orchestration** is easier to understand but creates a single point of coordination.`,
      codeExample: `// ============================================
// Event-Driven Architecture Patterns
// ============================================

// ---------- Saga Pattern: Choreography ----------
class ChoreographySaga {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.setupHandlers();
  }

  setupHandlers() {
    // Each service listens and reacts
    this.eventBus.subscribe('order.created', async (event) => {
      console.log('[PaymentService] Charging payment...');
      try {
        await this.chargePayment(event);
        this.eventBus.publish('payment.charged', { orderId: event.orderId, amount: event.total });
      } catch (err) {
        this.eventBus.publish('payment.failed', { orderId: event.orderId, reason: err.message });
      }
    });

    this.eventBus.subscribe('payment.charged', async (event) => {
      console.log('[InventoryService] Reserving items...');
      try {
        await this.reserveInventory(event);
        this.eventBus.publish('inventory.reserved', { orderId: event.orderId });
      } catch (err) {
        this.eventBus.publish('inventory.failed', { orderId: event.orderId });
        // COMPENSATE: Refund payment
        this.eventBus.publish('payment.refund', { orderId: event.orderId, amount: event.amount });
      }
    });

    // Compensation handlers
    this.eventBus.subscribe('payment.failed', async (event) => {
      console.log(\`[OrderService] Cancelling order \\\${event.orderId}\`);
    });

    this.eventBus.subscribe('payment.refund', async (event) => {
      console.log(\`[PaymentService] Refunding \\\${event.amount} for \\\${event.orderId}\`);
    });
  }

  async chargePayment(event) { return { success: true }; }
  async reserveInventory(event) { return { success: true }; }
}

// ---------- Saga Pattern: Orchestration ----------
class OrderOrchestrator {
  constructor(paymentService, inventoryService, shippingService) {
    this.payment = paymentService;
    this.inventory = inventoryService;
    this.shipping = shippingService;
  }

  async executeOrder(order) {
    const steps = [];
    try {
      // Step 1: Charge payment
      const payment = await this.payment.charge(order);
      steps.push({ service: 'payment', action: 'charge', result: payment });

      // Step 2: Reserve inventory
      const reservation = await this.inventory.reserve(order);
      steps.push({ service: 'inventory', action: 'reserve', result: reservation });

      // Step 3: Create shipment
      const shipment = await this.shipping.create(order);
      steps.push({ service: 'shipping', action: 'create', result: shipment });

      return { status: 'completed', steps };
    } catch (error) {
      console.log('Saga failed, compensating...');
      await this.compensate(steps);
      return { status: 'failed', error: error.message };
    }
  }

  async compensate(completedSteps) {
    // Reverse completed steps (compensating transactions)
    for (const step of completedSteps.reverse()) {
      switch (step.service) {
        case 'payment': await this.payment.refund(step.result); break;
        case 'inventory': await this.inventory.release(step.result); break;
        case 'shipping': await this.shipping.cancel(step.result); break;
      }
    }
  }
}

// ---------- Transactional Outbox Pattern ----------
class OutboxPublisher {
  constructor(db, kafka) {
    this.db = db;
    this.kafka = kafka;
  }

  async createOrderWithEvent(orderData) {
    // Single DB transaction ensures both order AND event are saved
    await this.db.transaction(async (tx) => {
      const order = await tx.insert('orders', orderData);
      // Write event to outbox table (same transaction!)
      await tx.insert('outbox', {
        event_type: 'order.created',
        payload: JSON.stringify({ orderId: order.id, ...orderData }),
        published: false,
      });
    });
    // Separate process polls outbox and publishes to Kafka
  }

  // Background poller (runs continuously)
  async pollOutbox() {
    const events = await this.db.query(
      'SELECT * FROM outbox WHERE published = false ORDER BY id LIMIT 100'
    );
    for (const event of events) {
      await this.kafka.produce(event.event_type, event.payload);
      await this.db.query('UPDATE outbox SET published = true WHERE id = $1', [event.id]);
    }
  }
}

const bus = { subscribe: (e, h) => {}, publish: (e, d) => {} };
new ChoreographySaga(bus);`,
      exercise: `1. **Saga Design**: Design a saga for a travel booking that reserves a flight + hotel + car rental. Include compensation (rollback) logic for each step.

2. **Choreography vs Orchestration**: For a food delivery app (order → restaurant → driver → delivery), design both choreography and orchestration sagas. Compare complexity and debuggability.

3. **Outbox Pattern**: Implement the transactional outbox pattern to ensure an event is published if and only if the database transaction succeeds.

4. **Event Schema Evolution**: Your "order.created" event needs a new field. How do you add it without breaking existing consumers? Design a schema evolution strategy.`,
      commonMistakes: [
        "Not handling saga compensation — if step 3 of 5 fails, steps 1 and 2 must be rolled back. Without compensation handlers, you get inconsistent state across services.",
        "Publishing events outside the DB transaction — if the DB write succeeds but event publishing fails (or vice versa), your system is inconsistent. Use the transactional outbox pattern.",
        "Over-engineering with event-driven architecture for simple CRUD — not every service interaction needs events. Direct API calls are simpler and faster when immediate response is needed.",
        "Not versioning events — changing event schemas without versioning breaks consumers. Always include a schema version and support backward compatibility.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the Saga pattern and why is it needed?",
          a: "**Saga** is a pattern for managing **distributed transactions** across multiple microservices.\n\n**Why needed**: In a monolith, you'd use a single database transaction. In microservices, each service has its own database — no single transaction spans all of them.\n\n**How it works**: A saga is a sequence of local transactions. If one step fails, **compensating transactions** undo the previous steps.\n\n**Two approaches**:\n- **Choreography**: Services react to events (decoupled but harder to track)\n- **Orchestration**: Central coordinator manages the flow (easier to debug but introduces coupling)\n\n**Example**: Order saga: Reserve inventory → Charge payment → Create shipment. If payment fails: Release inventory (compensating transaction).",
        },
        {
          type: "scenario",
          q: "How do you ensure an event is published only when the database transaction succeeds?",
          a: "Use the **Transactional Outbox Pattern**:\n\n1. In the SAME database transaction: write business data AND an event to an 'outbox' table\n2. A separate process (CDC or poller) reads unpublished events from the outbox table\n3. Publishes them to Kafka/message queue\n4. Marks events as published in the outbox\n\n**Why this works**: If the transaction rolls back, the outbox entry is also rolled back — no orphan events. If the publisher crashes after publishing but before marking, it will re-publish (consumers must be idempotent).\n\n**Alternative**: Change Data Capture (Debezium) reads the DB transaction log and automatically publishes changes to Kafka.",
        },
      ],
    },
  ],
};

export default sdPhase6;
