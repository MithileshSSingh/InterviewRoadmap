const sdPhase11b = [
  {
    id: "sd-design-chat-system",
    title: "Design a Chat System (WhatsApp/Slack)",
    explanation: `A real-time chat system is a popular interview question that tests your understanding of WebSockets, message delivery guarantees, and distributed systems.

## Requirements
**Functional**: 1-on-1 messaging, group chats (up to 500 members), online/offline status, read receipts, media sharing, message history
**Non-Functional**: 500M DAU, ~50B messages/day, < 100ms message delivery, message ordering within conversation, eventual delivery (offline queue)

## Key Architecture Decisions

### Connection Protocol
**WebSocket**: Persistent bidirectional connection. Client ↔ Server. Best for real-time messaging.
**Long polling**: Fallback for environments where WebSocket isn't available.

### Message Flow
1. Sender sends message via WebSocket → Chat Server
2. Chat Server stores message in DB (Cassandra — write-heavy)
3. Chat Server checks if recipient is **online**
4. **Online**: Push message via recipient's WebSocket connection
5. **Offline**: Store in offline message queue, deliver when they reconnect

### Message Ordering
Use **per-conversation sequence numbers**. Server assigns monotonically increasing sequence IDs per conversation. Client reorders by sequence ID.

### Group Chat Fan-Out
When a message is sent to a group of 500:
- Push message to all 500 members' connections
- For offline members, queue for later delivery
- Use message queues (Kafka) for fan-out to prevent blocking

### Data Model
- \`messages\`: {messageId, conversationId, senderId, content, type, sequenceNum, createdAt}
- \`conversations\`: {conversationId, type (1-on-1/group), memberIds}
- Partition by conversationId for data locality

> **Interview tip**: Always mention WebSockets for real-time chat. Discuss message ordering and delivery guarantees — these are where most candidates struggle.`,
    codeExample: `// ============================================
// Chat System — Core Architecture
// ============================================

class ChatServer {
  constructor(db, cache, messageQueue) {
    this.db = db;
    this.cache = cache;
    this.queue = messageQueue;
    this.connections = new Map(); // userId → WebSocket
  }

  // Handle new WebSocket connection
  onConnect(userId, ws) {
    this.connections.set(userId, ws);
    this.setOnline(userId);
    this.deliverQueuedMessages(userId);
  }

  onDisconnect(userId) {
    this.connections.delete(userId);
    this.setOffline(userId);
  }

  async sendMessage(senderId, conversationId, content) {
    // 1. Generate sequence number (per conversation)
    const seqNum = await this.cache.incr(\`seq:\\\${conversationId}\`);

    // 2. Create message
    const message = {
      id: this.generateId(),
      conversationId,
      senderId,
      content,
      sequenceNum: seqNum,
      createdAt: Date.now(),
      status: 'sent',
    };

    // 3. Persist to database
    await this.db.insert('messages', message);

    // 4. Deliver to recipients
    const members = await this.getConversationMembers(conversationId);
    for (const memberId of members) {
      if (memberId === senderId) continue;

      const ws = this.connections.get(memberId);
      if (ws) {
        // Online: push via WebSocket
        ws.send(JSON.stringify({ type: 'new_message', message }));
      } else {
        // Offline: queue for later delivery
        await this.cache.rpush(\`offline:\\\${memberId}\`, JSON.stringify(message));
      }
    }

    return message;
  }

  async deliverQueuedMessages(userId) {
    const messages = await this.cache.lrange(\`offline:\\\${userId}\`, 0, -1);
    if (messages.length > 0) {
      const ws = this.connections.get(userId);
      ws.send(JSON.stringify({ type: 'queued_messages', messages: messages.map(JSON.parse) }));
      await this.cache.del(\`offline:\\\${userId}\`);
    }
  }

  async setOnline(userId) { await this.cache.set(\`online:\\\${userId}\`, '1', 'EX', 300); }
  async setOffline(userId) { await this.cache.del(\`online:\\\${userId}\`); }

  async getConversationMembers(convId) {
    return this.db.query('SELECT member_id FROM conversation_members WHERE conversation_id = $1', [convId]);
  }

  generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
}

console.log("Chat system architecture demonstrated.");`,
    exercise: `1. **Full Chat Design**: Design WhatsApp. Include: 1-on-1 messaging, group chats, media sharing, online presence, read receipts, end-to-end encryption, and message search.

2. **Message Ordering**: How do you ensure messages appear in the correct order when: (a) two messages sent simultaneously, (b) network delays reorder packets, (c) messages sent from multiple devices?

3. **Group Scaling**: A group has 100K members. When someone sends a message, how do you fan out to 100K recipients efficiently? What's the max group size before the architecture breaks?

4. **Presence System**: Design the "online/offline/last seen" feature for 500M users. How do you track this efficiently without overloading the system with heartbeats?`,
    commonMistakes: [
      "Using HTTP polling instead of WebSockets — polling creates enormous server load and adds 3-10 second delays. WebSockets provide instant delivery with minimal overhead.",
      "Not handling message reordering — network delays can deliver messages out of order. Use sequence numbers per conversation and reorder on the client.",
      "Storing messages in a relational database — chat messages are write-heavy and time-series. Use Cassandra or a similar write-optimized store, partitioned by conversationId.",
      "Not designing for offline delivery — users go offline frequently on mobile. Queue messages and deliver all of them when the user reconnects.",
    ],
    interviewQuestions: [
      {
        type: "full-design",
        q: "Design a chat system like WhatsApp.",
        a: "**Connection**: WebSocket for real-time bidirectional messaging.\n\n**Message flow**: Client → WebSocket → Chat Server → persist to Cassandra → check recipient online? → push via WebSocket (online) or queue in Redis (offline).\n\n**Data stores**: Cassandra for messages (partition by conversationId, sorted by timestamp), Redis for presence/sessions/offline queue, PostgreSQL for user profiles.\n\n**Group messaging**: Fan-out via Kafka. Message published once → Kafka consumer pushes to each member's connection.\n\n**Read receipts**: When recipient reads, send 'read' event back via WebSocket → update message status → push status update to sender.\n\n**Scale**: Partition WebSocket servers by userId hash. ~500M connections across ~5000 servers. Each server handles ~100K connections.",
      },
    ],
  },
  {
    id: "sd-design-notification-system",
    title: "Design a Notification System",
    explanation: `A notification system delivers messages to users across multiple channels: push notifications (mobile), email, SMS, in-app notifications, and webhooks.

## Requirements
**Functional**: Multi-channel delivery (push, email, SMS, in-app), template management, user preferences (opt-in/out per channel), scheduling, priority levels
**Non-Functional**: 10B notifications/day, low latency for critical alerts, at-least-once delivery, graceful handling of third-party failures

## Architecture

### Event-Driven Design
1. Service emits event: \`order.shipped {userId, orderId, trackingUrl}\`
2. Notification service receives event
3. Looks up user preferences (channels opted in)
4. Renders notification template per channel
5. Routes to channel-specific workers (push/email/SMS)
6. Workers deliver via third-party APIs (FCM, SendGrid, Twilio)

### Priority Queues
- **Critical** (P0): Security alerts, 2FA codes → immediate delivery
- **High** (P1): Order confirmations → within seconds
- **Medium** (P2): Social notifications → batched, within minutes
- **Low** (P3): Marketing → scheduled, respect quiet hours

### Deduplication
Same notification sent twice is worse than not at all. Use idempotency keys: \`hash(userId + eventType + eventId)\` → check before sending.

> **Interview tip**: Notification systems are great for demonstrating queue architecture, fan-out, and third-party API integration. Show the multi-channel routing and priority handling.`,
    codeExample: `// ============================================
// Notification System — Architecture
// ============================================

class NotificationService {
  constructor(queue, db, templateEngine) {
    this.queue = queue;
    this.db = db;
    this.templates = templateEngine;
    this.channels = {
      push: new PushWorker(),
      email: new EmailWorker(),
      sms: new SMSWorker(),
      inApp: new InAppWorker(),
    };
  }

  async processEvent(event) {
    // 1. Get user preferences
    const prefs = await this.db.getUserNotificationPrefs(event.userId);

    // 2. Check deduplication
    const dedupKey = \`notif:\\\${event.userId}:\\\${event.type}:\\\${event.id}\`;
    const alreadySent = await this.db.cache.get(dedupKey);
    if (alreadySent) return;

    // 3. Route to enabled channels
    const enabledChannels = this.getEnabledChannels(event.type, prefs);

    for (const channel of enabledChannels) {
      // 4. Render template for each channel
      const content = this.templates.render(event.type, channel, event.data);

      // 5. Queue with priority
      await this.queue.publish(\`notifications.\\\${channel}\`, {
        userId: event.userId,
        channel,
        content,
        priority: this.getPriority(event.type),
        dedupKey,
      });
    }

    // 6. Mark as sent (dedup)
    await this.db.cache.set(dedupKey, '1', 'EX', 86400);
  }

  getEnabledChannels(eventType, prefs) {
    const defaults = {
      'security.alert': ['push', 'email', 'sms'],
      'order.shipped': ['push', 'email'],
      'social.like': ['push', 'inApp'],
      'marketing.promo': ['email'],
    };
    const defaultChannels = defaults[eventType] || ['inApp'];
    return defaultChannels.filter(ch => prefs[ch] !== false);
  }

  getPriority(eventType) {
    if (eventType.startsWith('security')) return 0;  // Critical
    if (eventType.startsWith('order')) return 1;     // High
    if (eventType.startsWith('social')) return 2;    // Medium
    return 3;                                        // Low
  }
}

class PushWorker {
  async send(notification) {
    console.log(\`[Push] → User \\\${notification.userId}: \\\${notification.content.title}\`);
    // Call FCM/APNs API
  }
}
class EmailWorker {
  async send(notification) {
    console.log(\`[Email] → User \\\${notification.userId}: \\\${notification.content.subject}\`);
  }
}
class SMSWorker {
  async send(notification) {
    console.log(\`[SMS] → User \\\${notification.userId}: \\\${notification.content.body}\`);
  }
}
class InAppWorker {
  async send(notification) {
    console.log(\`[In-App] → User \\\${notification.userId}: \\\${notification.content.message}\`);
  }
}

console.log("Notification system architecture demonstrated.");`,
    exercise: `1. **Full Notification Design**: Design a notification system for an e-commerce platform. Include: push, email, SMS, in-app. Handle: user preferences, quiet hours, rate limiting, batching.

2. **Third-Party Failure**: What happens when FCM (push) or SendGrid (email) goes down? Design retry logic, circuit breakers, and fallback channels.

3. **Notification Batching**: A user gets 50 likes in 10 minutes. Instead of 50 push notifications, send one: "50 people liked your post." Design the batching logic.

4. **Global Notification**: Send a notification to ALL 100M users (system maintenance announcement). Design the fan-out strategy.`,
    commonMistakes: [
      "Not deduplicating notifications — without idempotency checks, retries or duplicate events cause users to receive the same notification multiple times.",
      "Synchronous delivery — sending push/email/SMS synchronously blocks the main flow. Use queues for async delivery with per-channel workers.",
      "Ignoring user preferences — sending notifications on opted-out channels is a legal/UX problem. Always check preferences before sending.",
      "No rate limiting per user — a misbehaving service can trigger thousands of notifications to one user. Implement per-user rate limits.",
    ],
    interviewQuestions: [
      {
        type: "full-design",
        q: "Design a notification system handling 10 billion notifications per day.",
        a: "**Architecture**: Event-driven with priority queues.\n\n**Flow**: Service emits event → Notification Service validates + checks preferences + deduplicates → routes to channel queues (push/email/SMS/in-app) → channel workers deliver via APIs.\n\n**Priority**: P0 (security) → immediate, P1 (order) → seconds, P2 (social) → batched/minutes, P3 (marketing) → scheduled.\n\n**Scale**: 10B/day = ~115K/sec. Use Kafka with per-channel topics. Each channel has independent worker pool that auto-scales.\n\n**Reliability**: At-least-once delivery with idempotency keys. Circuit breakers for third-party APIs. DLQ for failed notifications. Retry with exponential backoff.\n\n**Data**: PostgreSQL for templates/preferences, Redis for dedup/rate limit, Cassandra for notification history.",
      },
    ],
  },
];

export default sdPhase11b;
