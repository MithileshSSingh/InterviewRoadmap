const rnPhase9 = {
  id: "phase-9",
  title: "Phase 9: System Design for Mobile (Staff Level)",
  emoji: "🏛️",
  description: "Staff-level mobile system design — real-time chat, offline-first sync, notification systems, large-scale e-commerce, feature flagging, and analytics pipelines with full trade-off analysis.",
  topics: [
    {
      id: "realtime-chat-design",
      title: "Design: Real-Time Chat Application",
      explanation: `**System Design: Real-Time Chat App for React Native**

**Requirement Clarification:**
- 1:1 and group messaging (up to 500 members)
- Real-time message delivery (<100ms for online users)
- Offline support (read/compose while offline, sync when online)
- Media attachments (images, videos, files)
- Read receipts and typing indicators
- Push notifications for offline users
- End-to-end encryption (optional, for premium users)
- Scale: 10M DAU, 1B messages/day

**High-Level Architecture:**
\`\`\`
React Native Client
  ├── UI Layer (Screens, Components)
  ├── Chat Engine
  │   ├── Message Queue (outgoing)
  │   ├── WebSocket Manager (real-time)
  │   ├── Sync Engine (offline reconciliation)
  │   └── Encryption Layer (E2E optional)
  ├── Local Storage (SQLite/WatermelonDB)
  └── Media Manager (upload/download/cache)

Backend
  ├── WebSocket Gateway (connection mgmt)
  ├── Message Service (routing, storage)
  ├── Presence Service (online/offline/typing)
  ├── Push Notification Service
  ├── Media Service (upload, CDN)
  └── Storage (Cassandra for messages, Redis for presence)
\`\`\`

**Key Design Decisions:**

1. **Message Delivery: WebSocket + Fallback**
   - Primary: Persistent WebSocket for real-time delivery
   - Fallback: Long-polling when WebSocket isn't available
   - Offline: Queue messages locally, push on reconnect

2. **Data Model — Chat Messages:**
   - Messages stored locally in SQLite (WatermelonDB for RN)
   - Server stores in append-only log (Cassandra)
   - Each message has: id, chatId, senderId, content, type, status, timestamp, localId
   - Message status: sending → sent → delivered → read

3. **Offline Strategy:**
   - Local-first: all reads from local DB
   - Writes queued with exponential retry
   - On reconnect: pull missed messages via cursor-based sync
   - Conflict resolution: server timestamp = source of truth

4. **Trade-offs:**
   - WebSocket vs HTTP polling: WS = real-time but complex reconnection; polling = simpler but higher latency
   - SQLite vs AsyncStorage: SQLite = better query, indexing; AsyncStorage = simpler for small data
   - E2E encryption: adds complexity (key management, no server-side search) but critical for privacy`,
      codeExample: `// === CHAT SYSTEM DESIGN — KEY COMPONENTS ===

// 1. WebSocket Manager with auto-reconnect
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private messageQueue: QueuedMessage[] = [];
  
  connect(url: string, token: string) {
    this.ws = new WebSocket(\`\${url}?token=\${token}\`);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.flushQueue(); // Send queued messages
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleServerMessage(message);
    };
    
    this.ws.onclose = (event) => {
      if (!event.wasClean) {
        this.scheduleReconnect();
      }
    };
  }
  
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts), // Exponential backoff
      30000 // Max 30 seconds
    );
    
    this.reconnectAttempts++;
    setTimeout(() => this.connect(this.url, this.token), delay);
  }
  
  send(message: OutgoingMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push({ ...message, queuedAt: Date.now() });
    }
  }
  
  private handleServerMessage(message: ServerMessage) {
    switch (message.type) {
      case 'MESSAGE':
        chatStore.receiveMessage(message.payload);
        break;
      case 'TYPING':
        chatStore.setTyping(message.payload.chatId, message.payload.userId);
        break;
      case 'READ_RECEIPT':
        chatStore.markRead(message.payload.chatId, message.payload.messageId);
        break;
      case 'PRESENCE':
        presenceStore.update(message.payload);
        break;
    }
  }
}

// 2. Message sync engine
class SyncEngine {
  async syncChat(chatId: string) {
    const lastSynced = await localDB.getLastSyncCursor(chatId);
    
    const serverMessages = await api.getMessages({
      chatId,
      after: lastSynced,
      limit: 100,
    });
    
    // Upsert server messages into local DB
    await localDB.upsertMessages(chatId, serverMessages.messages);
    await localDB.setSyncCursor(chatId, serverMessages.cursor);
    
    // Push pending local messages
    const pending = await localDB.getPendingMessages(chatId);
    for (const msg of pending) {
      try {
        const serverMsg = await api.sendMessage(msg);
        await localDB.updateMessageStatus(msg.localId, 'sent', serverMsg.id);
      } catch (error) {
        if (error.status === 409) {
          // Duplicate — already sent, just update local
          await localDB.updateMessageStatus(msg.localId, 'sent');
        }
        // Other errors — keep in pending queue for next sync
      }
    }
  }
}

// 3. Optimistic message sending
function useSendMessage(chatId: string) {
  return useCallback(async (content: string) => {
    const localId = generateUUID();
    const optimisticMessage = {
      localId,
      chatId,
      content,
      senderId: currentUserId,
      status: 'sending',
      timestamp: Date.now(),
    };
    
    // Show immediately in UI
    chatStore.addOptimisticMessage(optimisticMessage);
    
    try {
      // Send via WebSocket for speed
      wsManager.send({ type: 'MESSAGE', payload: optimisticMessage });
      
      // Also hit REST API for reliability
      const serverMsg = await api.sendMessage(optimisticMessage);
      chatStore.confirmMessage(localId, serverMsg.id);
    } catch (error) {
      chatStore.failMessage(localId, error.message);
    }
  }, [chatId]);
}`,
      exercise: `**System Design Exercises:**
1. Design the complete data model for a chat app — messages, chats, participants, read cursors
2. Implement a WebSocket manager with auto-reconnect and message queuing
3. Design the offline sync strategy — handle network partitions lasting hours
4. Design the media upload pipeline — chunked upload, progress, resume on failure
5. Draw the full architecture diagram including client, backend, and infrastructure
6. Discuss: how would you add E2E encryption? What changes in the architecture?`,
      commonMistakes: [
        "Using REST for real-time messaging — too slow for chat; WebSocket is essential",
        "Not implementing message deduplication — retried messages can appear twice if server doesn't deduplicate by localId",
        "Storing all messages as a flat array — use a proper local database (SQLite/WatermelonDB) with indexes for performance",
        "Not handling WebSocket reconnection — users lose real-time updates and don't know it",
        "Sending read receipts immediately — batch them to avoid flooding the server (debounce per chat)",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "How would you handle the scenario where a user sends a message while offline, goes online briefly, then goes offline again before confirmation?",
          a: "**Robust message pipeline:** (1) Message is created with a unique localId and stored in local DB with status 'pending'. (2) When online: send via WebSocket AND REST API as backup. (3) If confirmed: update status to 'sent', store server-assigned ID. (4) If goes offline before confirmation: message stays 'pending' in local DB. (5) Next online cycle: SyncEngine checks for pending messages and retries. (6) Server deduplicates by localId — same message isn't stored twice even if sent twice. (7) UI shows 'sending' indicator on the message until confirmed. This ensures zero message loss regardless of connectivity patterns.",
        },
      ],
    },
    {
      id: "offline-first-sync-design",
      title: "Design: Offline-First Sync Engine",
      explanation: `**System Design: Offline-First Data Sync Engine**

This is one of the hardest mobile system design problems and a frequent Staff-level interview topic.

**Requirement Clarification:**
- Users can read and write data with NO internet connection
- When connectivity returns, changes sync bidirectionally
- Conflicts must be resolved without data loss
- Support for shared/collaborative data (multiple users editing)
- Sync must be efficient (delta-based, not full copies)
- Scale: 5M users, each with 10-100MB of local data

**Architecture:**
\`\`\`
Client
  ├── Local Database (SQLite / WatermelonDB)
  │   ├── Data tables (entities)
  │   ├── Change log (operations journal)
  │   └── Sync metadata (cursors, versions)
  ├── Sync Engine
  │   ├── Change Tracker (detect local changes)
  │   ├── Push Manager (upload changes)
  │   ├── Pull Manager (download changes)
  │   ├── Conflict Resolver
  │   └── Queue Manager (background sync)
  └── Network Monitor (connectivity status)

Server
  ├── Sync API (cursor-based, delta responses)
  ├── Conflict Resolution Service
  ├── Change Log (event sourcing)
  └── Storage (PostgreSQL + Redis cache)
\`\`\`

**Conflict Resolution Strategies:**

| Strategy | How it works | Best for |
|----------|-------------|---------|
| Last-Write-Wins (LWW) | Highest timestamp wins | Simple data, settings |
| Merge | Combine non-conflicting changes | Structured documents |
| CRDT | Mathematically conflict-free | Collaborative editing |
| User-prompted | Show both versions, user decides | Critical data |

**Key Design Decisions:**
1. **Operation-based sync** (send operations, not full documents) — more efficient, enables merge
2. **Vector clocks** for ordering events across devices — more reliable than wall clock
3. **Cursor-based pagination** for pull sync — efficient for large datasets
4. **Background sync with WorkManager** — reliable even if app is killed`,
      codeExample: `// === OFFLINE-FIRST SYNC ENGINE ===

// 1. Change tracking with operation log
interface SyncOperation {
  id: string;
  entityType: string;     // 'note', 'task', 'contact'
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  changes: Record<string, any>;  // Field-level changes
  timestamp: number;
  deviceId: string;
  synced: boolean;
}

class ChangeTracker {
  async trackChange(
    entityType: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    changes: Record<string, any>
  ) {
    const op: SyncOperation = {
      id: generateUUID(),
      entityType,
      entityId,
      operation,
      changes,
      timestamp: Date.now(),
      deviceId: getDeviceId(),
      synced: false,
    };
    
    await localDB.insertOperation(op);
    
    // Try immediate sync if online
    if (networkMonitor.isConnected) {
      syncEngine.schedulePush();
    }
  }
}

// 2. Sync engine with conflict resolution
class SyncEngine {
  private isSyncing = false;
  
  async fullSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    
    try {
      // Push first (reduces conflict window)
      await this.push();
      // Then pull
      await this.pull();
    } finally {
      this.isSyncing = false;
    }
  }
  
  private async push() {
    const pendingOps = await localDB.getUnsyncedOperations();
    
    if (pendingOps.length === 0) return;
    
    const response = await api.pushChanges({
      deviceId: getDeviceId(),
      operations: pendingOps,
      lastSyncCursor: await localDB.getSyncCursor(),
    });
    
    // Handle conflicts returned by server
    for (const conflict of response.conflicts) {
      await this.resolveConflict(conflict);
    }
    
    // Mark synced operations
    await localDB.markOperationsSynced(
      pendingOps.map(op => op.id)
    );
  }
  
  private async pull() {
    let cursor = await localDB.getSyncCursor();
    let hasMore = true;
    
    while (hasMore) {
      const response = await api.pullChanges({
        cursor,
        limit: 100,
        deviceId: getDeviceId(), // Exclude own changes
      });
      
      for (const change of response.changes) {
        await this.applyRemoteChange(change);
      }
      
      cursor = response.nextCursor;
      hasMore = response.hasMore;
      
      await localDB.setSyncCursor(cursor);
    }
  }
  
  private async resolveConflict(conflict: ConflictInfo) {
    const local = await localDB.getEntity(conflict.entityType, conflict.entityId);
    const remote = conflict.serverValue;
    
    switch (conflict.entityType) {
      case 'settings':
        // Last-write-wins for settings
        if (remote.updatedAt > local.updatedAt) {
          await localDB.upsertEntity(conflict.entityType, remote);
        }
        break;
        
      case 'note':
        // Field-level merge for notes
        const merged = this.fieldLevelMerge(local, remote, conflict.baseValue);
        await localDB.upsertEntity(conflict.entityType, merged);
        break;
        
      case 'transaction':
        // Never auto-resolve financial data — queue for user review
        await localDB.markConflict(conflict.entityType, conflict.entityId, {
          local,
          remote,
        });
        break;
    }
  }
  
  private fieldLevelMerge(local: any, remote: any, base: any): any {
    const merged = { ...base };
    
    for (const key of Object.keys(merged)) {
      const localChanged = local[key] !== base[key];
      const remoteChanged = remote[key] !== base[key];
      
      if (localChanged && !remoteChanged) {
        merged[key] = local[key]; // Only local changed
      } else if (!localChanged && remoteChanged) {
        merged[key] = remote[key]; // Only remote changed
      } else if (localChanged && remoteChanged) {
        // Both changed — LWW for this field
        merged[key] = local.updatedAt > remote.updatedAt 
          ? local[key] 
          : remote[key];
      }
      // Neither changed — keep base value
    }
    
    return merged;
  }
}

// 3. Background sync with WorkManager (via native module)
// Schedule periodic sync when app is backgrounded
import BackgroundFetch from 'react-native-background-fetch';

BackgroundFetch.configure({
  minimumFetchInterval: 15, // minutes
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true,
}, async (taskId) => {
  await syncEngine.fullSync();
  BackgroundFetch.finish(taskId);
}, (taskId) => {
  BackgroundFetch.finish(taskId);
});`,
      exercise: `**Offline-First Design Exercises:**
1. Design the complete database schema for a note-taking app with sync support
2. Implement a field-level merge algorithm that handles concurrent edits to different fields
3. Build a sync status indicator that shows: synced, syncing, pending changes, conflict
4. Design a conflict resolution UI that shows both versions and lets the user merge
5. Implement cursor-based delta sync that handles pagination efficiently
6. Discuss: how would you handle schema migrations when the app is offline and the server has evolved?`,
      commonMistakes: [
        "Using wall clock time for conflict resolution — device clocks can be wrong; use logical clocks or server-assigned timestamps",
        "Syncing full documents instead of deltas — wastes bandwidth and increases conflict surface area",
        "Not handling schema evolution — if the server adds a field while the client is offline, sync breaks",
        "Not implementing retry with backoff — failed syncs should retry with exponential backoff, not flood the server",
        "Assuming sync is instant — design for multi-second sync on large datasets; show progress to the user",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Two users edit the same note offline, then both sync. User A changed the title, User B changed the body. How do you handle this?",
          a: "**Field-level merge with three-way diff.** Store the 'base version' (before either edit) alongside local and remote versions. Compare each field: title — only A changed → use A's title. Body — only B changed → use B's body. Result: merged note with A's title and B's body. If both changed the SAME field: options are LWW (use most recent), user-prompted (show both versions), or operational transform (character-level merge for text). The key is maintaining the base version for three-way comparison.",
        },
        {
          type: "conceptual",
          q: "What are CRDTs and when would you use them for mobile sync?",
          a: "**CRDTs (Conflict-Free Replicated Data Types)** are data structures designed to be merged without conflicts by mathematical design. Examples: G-Counter (grow-only counter), LWW-Register (last-writer-wins register), OR-Set (observed-remove set). Each device can independently modify the CRDT, and merging any two copies always produces the correct result — no conflict resolution needed. Use for: collaborative editing (text, drawings), shared counters (likes, inventory), eventually-consistent sets (tags, labels). Don't use for: data with complex invariants (financial transactions), data requiring strict ordering, or when simplicity is more important than consistency.",
        },
      ],
    },
    {
      id: "ecommerce-feature-flag-design",
      title: "Design: E-Commerce App & Feature Flagging",
      explanation: `**System Design: Large-Scale E-Commerce App**

**Key Screens & Data Flows:**
- Product catalog with search, filters, and sorting
- Product detail with variants, reviews, availability
- Shopping cart with real-time price updates
- Checkout with payment processing
- Order tracking with real-time status
- User profile with order history

**Architecture Decisions:**

1. **Product catalog**: Server-driven UI with local caching. Products cached for offline browsing. Search uses Algolia/ElasticSearch on server. Client caches search results by query.

2. **Shopping cart**: Hybrid local + server cart. Anonymous users: local only. Authenticated: synced. Cart merge on login.

3. **Checkout**: Cannot be offline — payment requires network. Implement optimistic state with server validation. Handle payment failures gracefully.

4. **Real-time inventory**: Subscribe to inventory changes for carted items. Alert user if item goes out of stock during checkout.

---

**Feature Flagging System:**

Feature flags are essential for large apps. They enable:
- Gradual rollouts (1% → 10% → 50% → 100%)
- A/B testing
- Kill switches for broken features
- Platform-specific features (iOS only, Android only)
- User-segment targeting (beta users, premium, region)

**Architecture:**
\`\`\`
Feature Flag Service (LaunchDarkly, Firebase Remote Config, custom)
  → SDK fetches flags on app start + periodic refresh
  → Flags cached locally for offline access
  → Components conditionally render based on flags
  → Analytics tied to flag variants for measurement
\`\`\``,
      codeExample: `// === FEATURE FLAG SYSTEM ===

interface FeatureFlag {
  key: string;
  enabled: boolean;
  variant?: string;  // For A/B tests
  payload?: any;     // Custom config per flag
}

interface FeatureFlagUser {
  id: string;
  email?: string;
  plan?: 'free' | 'premium' | 'enterprise';
  platform: 'ios' | 'android';
  appVersion: string;
  country?: string;
}

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private user: FeatureFlagUser;
  private refreshInterval: ReturnType<typeof setInterval>;
  
  async initialize(user: FeatureFlagUser) {
    this.user = user;
    
    // Load cached flags immediately (for instant startup)
    const cached = await AsyncStorage.getItem('feature_flags');
    if (cached) {
      this.flags = new Map(JSON.parse(cached));
    }
    
    // Fetch fresh flags in background
    await this.refresh();
    
    // Periodic refresh every 5 minutes
    this.refreshInterval = setInterval(() => this.refresh(), 5 * 60 * 1000);
  }
  
  private async refresh() {
    try {
      const response = await api.getFeatureFlags({
        userId: this.user.id,
        platform: this.user.platform,
        appVersion: this.user.appVersion,
      });
      
      this.flags = new Map(response.flags.map(f => [f.key, f]));
      
      // Cache for offline
      await AsyncStorage.setItem(
        'feature_flags',
        JSON.stringify([...this.flags])
      );
    } catch (error) {
      // Fail silently — use cached flags
      console.warn('Failed to refresh feature flags:', error);
    }
  }
  
  isEnabled(key: string, defaultValue = false): boolean {
    return this.flags.get(key)?.enabled ?? defaultValue;
  }
  
  getVariant(key: string): string | undefined {
    return this.flags.get(key)?.variant;
  }
  
  getPayload<T>(key: string): T | undefined {
    return this.flags.get(key)?.payload as T;
  }
}

// React hook for feature flags
function useFeatureFlag(key: string, defaultValue = false): boolean {
  const flagService = useContext(FeatureFlagContext);
  return flagService.isEnabled(key, defaultValue);
}

// Usage in components
function CheckoutScreen() {
  const showNewPaymentUI = useFeatureFlag('new_payment_ui');
  const showApplePay = useFeatureFlag('apple_pay_enabled');
  
  return (
    <View>
      {showNewPaymentUI ? <NewPaymentForm /> : <LegacyPaymentForm />}
      {showApplePay && Platform.OS === 'ios' && <ApplePayButton />}
    </View>
  );
}

// === E-COMMERCE: Cart Sync Architecture ===

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  addedAt: number;
  price: number; // Snapshot at add time
}

class CartService {
  // Merge anonymous local cart with server cart on login
  async mergeCartsOnLogin(localCart: CartItem[], serverCart: CartItem[]) {
    const merged = new Map<string, CartItem>();
    
    // Server cart is base
    for (const item of serverCart) {
      merged.set(item.variantId, item);
    }
    
    // Local cart additions
    for (const item of localCart) {
      if (merged.has(item.variantId)) {
        // Same item in both — take higher quantity
        const existing = merged.get(item.variantId)!;
        merged.set(item.variantId, {
          ...existing,
          quantity: Math.max(existing.quantity, item.quantity),
        });
      } else {
        merged.set(item.variantId, item);
      }
    }
    
    // Validate prices (may have changed)
    const validatedCart = await this.validatePrices([...merged.values()]);
    
    // Sync merged cart to server
    await api.updateCart(validatedCart);
    
    return validatedCart;
  }
}`,
      exercise: `**System Design Exercises:**
1. Design the product catalog with offline browsing, search, and filtering
2. Implement a feature flag hook with A/B test variant tracking
3. Design the cart sync logic for a multi-device e-commerce app
4. Build a checkout flow that handles payment failures, retries, and 3D Secure
5. Design the notification delivery system for order status updates
6. Create an analytics pipeline that tracks user journeys through the purchase funnel`,
      commonMistakes: [
        "Making the checkout flow depend on local state only — cart validation and price verification must happen server-side before payment",
        "Not caching feature flags locally — app shouldn't require network to decide what to show; cache on every successful fetch",
        "Allowing feature flag evaluation to be async — flag checks should be synchronous from cache; async fetching happens in background",
        "Not considering cart abandonment — design for interrupted checkouts, save state, and send recovery notifications",
        "Hardcoding feature toggles as if/else — use a proper flag service that supports gradual rollout and instant kill switches",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "How would you design a feature flagging system that supports gradual rollout from 1% to 100% of users?",
          a: "**Deterministic hash-based rollout.** (1) For each user, compute `hash(userId + flagKey) % 100`. If the hash value < rollout percentage, the flag is enabled. This is deterministic — same user always gets the same result. (2) Flag configuration: `{ key: 'new_checkout', rolloutPercentage: 10, targetSegments: ['premium'], excludeSegments: ['qa_issues'] }`. (3) Rollout process: 1% (canary) → 10% (early adopters) → 50% → 100%. Monitor crash rates, conversion rates, and error rates at each stage. (4) Kill switch: set rollout to 0% and it takes effect on next flag refresh (< 5 minutes). (5) Sticky bucketing: once a user is in a variant, they stay there even if rollout percentage changes.",
        },
        {
          type: "conceptual",
          q: "What's the difference between feature flags and configuration?",
          a: "**Feature flags** control whether a feature is visible/accessible. They're typically boolean (or multi-variant for A/B tests), targeted per user/segment, and temporary (removed after full rollout). **Configuration** controls HOW a feature behaves — timeouts, thresholds, display options. Configuration is typically global (same for all users), long-lived, and non-boolean. Example: 'show_new_checkout' is a flag. 'checkout_timeout_seconds: 30' is configuration. Keep them separate — flags in a flag service (LaunchDarkly), config in a config service (Firebase Remote Config).",
        },
      ],
    },
  ],
};

export default rnPhase9;
