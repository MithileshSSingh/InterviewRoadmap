const androidPhase6 = {
  id: "phase-6",
  title: "Phase 6: System Design for Mobile",
  emoji: "🏛️",
  description: "Design large-scale mobile systems — offline-first sync, chat apps, real-time updates, notification systems, and crash resiliency strategies.",
  topics: [
    {
      id: "designing-offline-sync",
      title: "Designing Offline-First Sync Systems",
      explanation: `**Offline-first sync** is the most asked mobile system design topic at Google. The core challenge: how do you keep local data consistent with the server when the device goes offline?

**Architecture overview:**
\`\`\`
┌────────────────────────────────────────────┐
│  UI Layer (Compose/XML)                    │
│    ↕ observes                              │
│  ViewModel (StateFlow)                     │
│    ↕                                       │
│  Repository (Single Source of Truth)       │
│    ↕           ↕                           │
│  Room DB     Sync Engine                   │
│  (local)       ↕                           │
│              Network API                   │
│              (remote)                      │
└────────────────────────────────────────────┘
\`\`\`

**Sync engine responsibilities:**
1. Track local changes (insertion, update, deletion)
2. Queue pending changes for upload
3. Push changes when connectivity available
4. Pull remote changes and merge
5. Resolve conflicts
6. Handle partial sync failures

**Delta sync protocol:**
- Client sends: last sync token + pending local changes
- Server responds: new sync token + remote changes since last token
- Client merges: apply remote changes to local DB, update sync token
- Much more efficient than full sync for large datasets

**Conflict resolution strategies:**
- **LWW (Last Write Wins):** Timestamp-based. Simple but can lose data.
- **Field-level merge:** Merge at the field level — if different fields changed, merge both.
- **CRDT:** Conflict-free data types that merge automatically (counters, sets).
- **User-prompted:** Show both versions, let user choose.`,
      codeExample: `// Complete delta sync implementation skeleton

// Sync metadata stored alongside data
@Entity(tableName = "sync_metadata")
data class SyncMetadata(
    @PrimaryKey val tableName: String,
    val lastSyncToken: String = "",
    val lastSyncTimestamp: Long = 0
)

// Change tracking for outgoing sync
@Entity(tableName = "pending_changes")
data class PendingChange(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val entityType: String,
    val entityId: String,
    val changeType: String, // INSERT, UPDATE, DELETE
    val payload: String, // JSON serialized entity
    val createdAt: Long = System.currentTimeMillis()
)

// Sync engine implementation
class SyncEngine @Inject constructor(
    private val api: SyncApi,
    private val db: AppDatabase,
    private val changeDao: PendingChangeDao,
    private val metadataDao: SyncMetadataDao
) {
    suspend fun performSync(): SyncResult {
        return try {
            // Phase 1: Push local changes
            val pendingChanges = changeDao.getAll()
            if (pendingChanges.isNotEmpty()) {
                val pushResult = api.pushChanges(
                    changes = pendingChanges.map { it.toApiModel() }
                )
                if (pushResult.isSuccessful) {
                    changeDao.deleteAll(pendingChanges.map { it.id })
                }
            }
            
            // Phase 2: Pull remote changes
            val metadata = metadataDao.get("main") ?: SyncMetadata("main")
            val pullResult = api.pullChanges(metadata.lastSyncToken)
            
            // Phase 3: Apply remote changes in a transaction
            db.withTransaction {
                for (change in pullResult.changes) {
                    applyRemoteChange(change)
                }
                metadataDao.upsert(metadata.copy(
                    lastSyncToken = pullResult.newSyncToken,
                    lastSyncTimestamp = System.currentTimeMillis()
                ))
            }
            
            SyncResult.Success(
                pushed = pendingChanges.size,
                pulled = pullResult.changes.size
            )
        } catch (e: Exception) {
            SyncResult.Error(e)
        }
    }
    
    private suspend fun applyRemoteChange(change: RemoteChange) {
        val localEntity = db.noteDao().getById(change.entityId)
        val localPending = changeDao.getByEntityId(change.entityId)
        
        if (localPending != null) {
            // Conflict: local has pending changes for this entity
            resolveConflict(localEntity, change, localPending)
        } else {
            // No conflict: apply remote change directly
            when (change.type) {
                "INSERT", "UPDATE" -> db.noteDao().upsert(change.toEntity())
                "DELETE" -> db.noteDao().delete(change.entityId)
            }
        }
    }
}`,
      exercise: `**Practice:**
1. Design a delta sync protocol with sync tokens and implement it
2. Implement field-level conflict resolution for a note-taking app
3. Handle the edge case: user creates entity offline, another user creates entity with same name
4. Design a sync system that handles network interruption mid-sync
5. Implement exponential backoff retry with WorkManager for sync failures`,
      commonMistakes: [
        "Using full sync instead of delta sync — wastes bandwidth for large datasets",
        "Not handling mid-sync failures — if sync crashes halfway, data is in inconsistent state. Use DB transactions.",
        "Ignoring clock skew — device time may be wrong. Use server-assigned timestamps.",
        "Hard-deleting instead of soft-deleting — can't sync deletions without a record of what was deleted",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design the sync system for Google Keep. How do you handle conflicts when a user edits the same note on two devices offline?",
          a: "**Strategy: Field-level merge with fallback to LWW.** (1) Each change tracks which fields were modified (title, content, color, checklist items). (2) If Device A changed the title and Device B changed the content, merge both — no conflict. (3) If both changed the same field, use LWW with server timestamp. (4) For checklist items, use a CRDT-like approach: each item has a unique ID, additions and deletions are tracked independently. (5) For text content conflicts: save both versions, let user pick (similar to Git merge conflicts). (6) **Sync flow:** Push local changes → server detects field-level conflicts → server merges or marks as conflict → client applies merged result."
        },
      ],
    },
    {
      id: "designing-chat-messaging",
      title: "Designing Chat & Messaging Apps",
      explanation: `**Designing a chat system** is one of the most common mobile system design questions. It tests your knowledge of real-time communication, message ordering, delivery guarantees, and offline handling.

**Key components:**
1. **Message delivery pipeline:** Client → Server → Recipient (via push or WebSocket)
2. **Message states:** Sent → Delivered → Read (WhatsApp-style ticks)
3. **Persistence:** Local SQLite/Room for message history
4. **Real-time:** WebSocket for active sessions, FCM for background delivery
5. **Media:** Separate upload pipeline for images/videos

**Architecture:**
\`\`\`
┌──────────────────────────────────┐
│  Chat UI (LazyColumn)           │
│     ↕                           │
│  ChatViewModel                  │
│     ↕                           │
│  MessageRepository              │
│     ↕           ↕               │
│  Room DB      ConnectionManager │
│  (history)      ↕       ↕       │
│              WebSocket   FCM    │
│              (online)  (offline)│
└──────────────────────────────────┘
\`\`\`

**Message ordering challenges:**
- Network delays can cause messages to arrive out of order
- Solution: Server-assigned sequential IDs + client-side sorting
- Optimistic: show sent messages immediately with local timestamp, reconcile with server order later

**Delivery guarantees:**
- **At-most-once:** Fire and forget. Messages may be lost.
- **At-least-once:** Retry until acknowledged. May deliver duplicates.
- **Exactly-once:** Deduplicate using message IDs. Most complex but required for chat.`,
      codeExample: `// Chat system architecture — key components

// Message entity with delivery state
@Entity(tableName = "messages")
data class MessageEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val conversationId: String,
    val senderId: String,
    val content: String,
    val type: String = "TEXT", // TEXT, IMAGE, VIDEO
    val localTimestamp: Long = System.currentTimeMillis(),
    val serverTimestamp: Long? = null,
    val deliveryState: String = "SENDING", // SENDING, SENT, DELIVERED, READ, FAILED
    val mediaUrl: String? = null,
    val localMediaPath: String? = null
)

// WebSocket connection manager
class ChatConnectionManager @Inject constructor(
    private val okHttpClient: OkHttpClient,
    private val messageDao: MessageDao
) {
    private var webSocket: WebSocket? = null
    private val _incomingMessages = MutableSharedFlow<MessageEntity>()
    val incomingMessages: SharedFlow<MessageEntity> = _incomingMessages
    
    fun connect(authToken: String) {
        val request = Request.Builder()
            .url("wss://chat.example.com/ws")
            .addHeader("Authorization", "Bearer \$authToken")
            .build()
        
        webSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(ws: WebSocket, text: String) {
                val message = Json.decodeFromString<MessageEntity>(text)
                CoroutineScope(Dispatchers.IO).launch {
                    messageDao.upsert(message)
                    _incomingMessages.emit(message)
                }
            }
            
            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                // Reconnect with exponential backoff
                scheduleReconnect()
            }
        })
    }
    
    fun sendMessage(message: MessageEntity) {
        val json = Json.encodeToString(message)
        val sent = webSocket?.send(json) ?: false
        if (!sent) {
            // Queue for retry when connection restored
            CoroutineScope(Dispatchers.IO).launch {
                messageDao.upsert(message.copy(deliveryState = "FAILED"))
            }
        }
    }
}

// Chat Repository — offline-first messaging
class ChatRepository @Inject constructor(
    private val messageDao: MessageDao,
    private val connectionManager: ChatConnectionManager,
    private val mediaUploader: MediaUploader
) {
    fun getMessages(conversationId: String): Flow<List<MessageEntity>> =
        messageDao.getByConversation(conversationId)
    
    suspend fun sendTextMessage(conversationId: String, content: String) {
        val message = MessageEntity(
            conversationId = conversationId,
            senderId = currentUserId,
            content = content,
            deliveryState = "SENDING"
        )
        // Optimistic: save locally first (appears in chat immediately)
        messageDao.upsert(message)
        // Then send via WebSocket
        connectionManager.sendMessage(message)
    }
}`,
      exercise: `**Practice:**
1. Design the message delivery pipeline with SENT/DELIVERED/READ states
2. Implement WebSocket reconnection with exponential backoff
3. Handle message ordering when messages arrive out of order
4. Design the media upload pipeline for images in chat
5. How would you implement end-to-end encryption for messages?`,
      commonMistakes: [
        "Not handling WebSocket disconnection — mobile connections are unreliable, always implement reconnection",
        "Using only WebSocket without FCM fallback — background apps can't maintain WebSocket connections",
        "Not deduplicating messages — at-least-once delivery requires idempotent message handling",
        "Displaying messages by local timestamp instead of server timestamp — causes ordering issues",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design the Android architecture for a WhatsApp-like messaging app.",
          a: "**Key components:** (1) **Connection layer:** WebSocket for real-time when active, FCM for background notifications. Reconnection with exponential backoff. (2) **Data layer:** Room DB per conversation (or single DB with conversation_id index). Message entity with id, timestamp, content, delivery_state, media_url. (3) **Sync:** On app open, fetch messages since last server timestamp. Background: FCM triggers WorkManager sync. (4) **Media:** Separate upload pipeline — upload image → get URL → send message with URL. Show placeholder during upload. (5) **Ordering:** Server assigns monotonically increasing sequence numbers per conversation. Client sorts by sequence number. (6) **Delivery receipts:** Separate lightweight messages (DELIVERED/READ) sent via same WebSocket. (7) **Offline:** All messages saved locally first. Sent queue processed when online."
        },
      ],
    },
    {
      id: "designing-realtime-updates",
      title: "Designing Real-Time Update Systems",
      explanation: `**Real-time updates** in mobile apps require careful architectural decisions about when to use WebSockets, Server-Sent Events (SSE), long polling, or push notifications.

**Communication protocols comparison:**
| Protocol | Direction | Latency | Battery | Use Case |
|----------|-----------|---------|---------|----------|
| HTTP Polling | Client→Server | High (interval) | Bad | Legacy, simple |
| Long Polling | Client↔Server | Medium | Medium | Moderate real-time |
| SSE | Server→Client | Low | Good | Live feeds, notifications |
| WebSocket | Bidirectional | Very low | Medium | Chat, collaboration |
| FCM/Push | Server→Client | Variable | Best | Background notifications |

**When to use what:**
- **WebSocket:** Bidirectional real-time (chat, multiplayer games, live collaboration)
- **SSE:** Server-to-client streaming (live scores, stock tickers, feed updates)
- **FCM:** Background-safe notifications (email alerts, social notifications)
- **Polling:** When WebSocket/SSE infrastructure isn't available

**Architecture patterns for real-time Android apps:**
1. **Foreground:** WebSocket/SSE for active screens
2. **Background:** FCM to trigger data sync via WorkManager
3. **Fallback:** Polling with adaptive interval (more frequent when active, less when idle)

**Handling connection lifecycle:**
- Connect WebSocket when app is foregrounded
- Disconnect when backgrounded (save battery)
- FCM handles background delivery
- On foreground resume, fetch missed messages via REST API`,
      codeExample: `// Real-time update architecture using SSE + FCM fallback

// SSE client for live feed updates
class LiveFeedConnection @Inject constructor(
    private val okHttpClient: OkHttpClient
) {
    fun connect(feedId: String): Flow<FeedUpdate> = callbackFlow {
        val request = Request.Builder()
            .url("https://api.example.com/feed/\$feedId/stream")
            .header("Accept", "text/event-stream")
            .build()

        val call = okHttpClient.newCall(request)
        val response = call.execute()
        val source = response.body?.source() ?: throw IOException("Empty body")

        launch(Dispatchers.IO) {
            try {
                while (!source.exhausted()) {
                    val line = source.readUtf8Line() ?: continue
                    if (line.startsWith("data:")) {
                        val json = line.removePrefix("data:").trim()
                        val update = Json.decodeFromString<FeedUpdate>(json)
                        trySend(update)
                    }
                }
            } catch (e: IOException) {
                if (!isClosedForSend) close(e)
            }
        }

        awaitClose { 
            call.cancel()
            response.close()
        }
    }
}

// Lifecycle-aware real-time connection
class RealTimeManager @Inject constructor(
    private val sseConnection: LiveFeedConnection,
    private val feedDao: FeedDao,
    private val processLifecycle: ProcessLifecycleOwner
) {
    private var connectionJob: Job? = null
    
    fun observeFeed(feedId: String): Flow<List<FeedItem>> {
        // Always return from local DB (source of truth)
        return feedDao.getItems(feedId)
    }
    
    fun startListening(feedId: String, scope: CoroutineScope) {
        connectionJob?.cancel()
        connectionJob = scope.launch {
            // Reconnect with backoff on failure
            var delay = 1000L
            while (isActive) {
                try {
                    sseConnection.connect(feedId).collect { update ->
                        delay = 1000L // Reset backoff on success
                        feedDao.upsert(update.toEntity())
                    }
                } catch (e: Exception) {
                    if (e is CancellationException) throw e
                    delay(delay)
                    delay = (delay * 2).coerceAtMost(30_000L) // Max 30s backoff
                }
            }
        }
    }
    
    fun stopListening() {
        connectionJob?.cancel()
    }
}`,
      exercise: `**Practice:**
1. Implement an SSE client that reconnects automatically with exponential backoff
2. Design a live score update system using WebSocket + FCM fallback
3. Compare battery impact of polling every 5s vs SSE vs WebSocket
4. Implement adaptive polling — faster when user interacts, slower when idle
5. Design a real-time presence system (show who's online in a chat app)`,
      commonMistakes: [
        "Keeping WebSocket connections open in background — drains battery, gets killed by OS",
        "Using polling when SSE would work — SSE is more efficient for server-to-client streaming",
        "Not implementing reconnection logic — mobile networks are unreliable, always reconnect",
        "Fetching full data on reconnect instead of delta — wastes bandwidth after brief disconnections",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a live sports score update system for an Android app with 1M DAU.",
          a: "**Architecture:** (1) **Foreground:** SSE connection to stream score updates. Low latency, efficient for one-directional data. (2) **Background:** FCM for important events (goals, game end). (3) **Data:** Room DB stores current scores + game state. UI observes via Flow. (4) **Scale:** CDN + edge servers for SSE distribution. Client connects to nearest edge. (5) **Battery:** Connect SSE only on active game screens. Disconnect on background. FCM handles rest. (6) **Offline:** Show last cached scores with 'last updated' timestamp. (7) **Reliability:** Client-side deduplication via event IDs. Reconnect fetches missed events from REST endpoint using last_event_id."
        },
      ],
    },
    {
      id: "designing-notification-systems",
      title: "Designing Notification Systems",
      explanation: `**Notification systems** on Android are complex due to channels, priority levels, permissions (Android 13+), and battery restrictions. A well-designed notification system drives engagement without annoying users.

**Android notification architecture:**
\`\`\`
Server → FCM → Device → App Process → NotificationManager → System UI
                                    → WorkManager (data sync)
\`\`\`

**Notification channels (Android 8.0+):**
- Each app must create notification channels for different types
- Users can individually control each channel's importance, sound, vibration
- Cannot modify channel importance after creation (must delete and recreate)

**FCM message types:**
1. **Data messages:** Handled by your app's FirebaseMessagingService. App controls notification display. Works in foreground and background.
2. **Notification messages:** Displayed automatically by the system when app is in background. Handled by your app only when in foreground.
3. **Data + Notification:** Combined. System shows notification in background; your app handles in foreground.

**Best practice: Always use data-only messages** — they give you full control over notification display and allow you to sync data before showing the notification.

**Notification permission (Android 13+):**
Must request POST_NOTIFICATIONS runtime permission. Without it, notifications are silently suppressed.`,
      codeExample: `// Complete notification system implementation

// 1. Create notification channels at app startup
class NotificationChannelManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        
        val channels = listOf(
            NotificationChannel(
                "messages", "Messages",
                NotificationManager.IMPORTANCE_HIGH
            ).apply { description = "New message notifications" },
            
            NotificationChannel(
                "updates", "App Updates",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply { description = "Feature updates and news" },
            
            NotificationChannel(
                "sync", "Background Sync",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Data synchronization"
                setShowBadge(false)
            }
        )
        
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannels(channels)
    }
}

// 2. FCM Service — handle data messages
class MyFirebaseService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        when (data["type"]) {
            "new_message" -> handleNewMessage(data)
            "sync_trigger" -> scheduleSyncWork()
            "silent_update" -> handleSilentUpdate(data)
        }
    }
    
    private fun handleNewMessage(data: Map<String, String>) {
        val notification = NotificationCompat.Builder(this, "messages")
            .setSmallIcon(R.drawable.ic_message)
            .setContentTitle(data["sender_name"])
            .setContentText(data["preview"])
            .setAutoCancel(true)
            .setContentIntent(createPendingIntent(data["conversation_id"]))
            .setStyle(NotificationCompat.MessagingStyle(selfPerson)
                .addMessage(data["preview"], System.currentTimeMillis(), senderPerson))
            .addAction(R.drawable.ic_reply, "Reply", createReplyPendingIntent())
            .build()
        
        NotificationManagerCompat.from(this).notify(
            data["conversation_id"].hashCode(),
            notification
        )
    }
    
    override fun onNewToken(token: String) {
        // Send new token to your server
        CoroutineScope(Dispatchers.IO).launch {
            api.updateFcmToken(token)
        }
    }
}

// 3. Request notification permission (Android 13+)
@Composable
fun NotificationPermissionRequest() {
    val permissionState = rememberPermissionState(
        Manifest.permission.POST_NOTIFICATIONS
    )
    
    LaunchedEffect(Unit) {
        if (!permissionState.status.isGranted) {
            permissionState.launchPermissionRequest()
        }
    }
}`,
      exercise: `**Practice:**
1. Implement notification channels for 3 different notification types
2. Handle FCM data messages and display rich notifications with actions
3. Implement notification grouping for multiple messages from the same sender
4. Set up FCM token refresh and server registration
5. Handle the Android 13 POST_NOTIFICATIONS permission gracefully`,
      commonMistakes: [
        "Using notification messages instead of data messages — you lose control over notification content and behavior in background",
        "Not creating notification channels on Android 8.0+ — notifications silently fail",
        "Sending FCM token only once — tokens can refresh, always handle onNewToken",
        "Not requesting POST_NOTIFICATIONS permission on Android 13+ — notifications are suppressed",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a notification system for a social media app. How do you handle grouping, priority, and user preferences?",
          a: "**Channels:** messages (HIGH), likes (DEFAULT), follows (DEFAULT), system (LOW). **Grouping:** Group notifications by type — multiple likes become '5 people liked your post'. Use NotificationCompat.InboxStyle or MessagingStyle. **Priority:** Messages = heads-up, likes = silent, follows = default sound. **User prefs:** Expose channel settings via Intent to system notification settings. Server-side: don't send notifications for muted conversations. **Smart delivery:** Batch non-urgent notifications (likes, follows) into periodic digests. Send messages immediately. **Rate limiting:** Max 10 notifications per minute per user to avoid spam perception."
        },
      ],
    },
    {
      id: "crash-resiliency",
      title: "Crash Resiliency & Graceful Degradation",
      explanation: `**Crash resiliency** means designing your app to recover gracefully from errors, handle unexpected states, and provide degraded functionality instead of crashing.

**Crash prevention strategies:**
1. **Defensive programming** — Null checks, bounds checks, input validation
2. **Sealed types for state** — Impossible states become compile errors
3. **Global exception handler** — Catch unhandled exceptions for logging before crash
4. **Process death handling** — Restore state from SavedStateHandle/Room
5. **Network error handling** — Show cached data, retry mechanism, user feedback

**Process death handling:**
Android can kill your app process at any time when in the background. When the user returns, the system recreates the Activity stack but your in-memory data is gone.
\`\`\`
Survives process death:           Does NOT survive:
- SavedStateHandle (ViewModel)    - ViewModel state (without SavedState)
- onSaveInstanceState Bundle      - Singletons
- Room database                   - In-memory caches
- DataStore/SharedPreferences     - Static variables
- Files                           - Retrofit/OkHttp state
\`\`\`

**Graceful degradation tiers:**
1. **Full functionality** — All features work normally
2. **Degraded** — Some features unavailable, core works (offline mode)
3. **Minimal** — Show cached data with "offline" banner
4. **Error state** — Clear error message with retry option
5. **Crash** — Last resort, never silent. Log to Crashlytics.`,
      codeExample: `// Global exception handler — log before crash
class CrashResilience {
    
    companion object {
        fun install(application: Application) {
            val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
            
            Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
                try {
                    // Log crash details for investigation
                    CrashReporting.logFatal(throwable)
                    // Save critical state to disk
                    saveCriticalState(application)
                } finally {
                    // Let the default handler show crash dialog
                    defaultHandler?.uncaughtException(thread, throwable)
                }
            }
        }
    }
}

// Process death-safe ViewModel
@HiltViewModel
class FormViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // These survive process death via SavedStateHandle
    val name = savedStateHandle.getStateFlow("name", "")
    val email = savedStateHandle.getStateFlow("email", "")
    val step = savedStateHandle.getStateFlow("step", 0)
    
    fun updateName(value: String) { savedStateHandle["name"] = value }
    fun updateEmail(value: String) { savedStateHandle["email"] = value }
    fun nextStep() { savedStateHandle["step"] = (step.value + 1) }
}

// Graceful degradation in Repository
class ProductRepository @Inject constructor(
    private val api: ProductApi,
    private val dao: ProductDao,
    private val connectivity: NetworkMonitor
) {
    fun getProducts(): Flow<Resource<List<Product>>> = flow {
        // Always emit cached data first
        val cached = dao.getAll().first().map { it.toDomain() }
        if (cached.isNotEmpty()) {
            emit(Resource.Success(cached, isStale = true))
        } else {
            emit(Resource.Loading)
        }
        
        // Try to refresh from network
        if (connectivity.isConnected.value) {
            try {
                val fresh = api.getProducts()
                dao.upsertAll(fresh.map { it.toEntity() })
                emit(Resource.Success(fresh.map { it.toDomain() }, isStale = false))
            } catch (e: Exception) {
                if (cached.isEmpty()) {
                    emit(Resource.Error(e.message ?: "Failed to load", null))
                }
                // If we have cached data, just log the error
            }
        } else if (cached.isEmpty()) {
            emit(Resource.Error("No internet connection", null))
        }
    }
}

sealed interface Resource<out T> {
    data object Loading : Resource<Nothing>
    data class Success<T>(val data: T, val isStale: Boolean = false) : Resource<T>
    data class Error<T>(val message: String, val data: T?) : Resource<T>
}`,
      exercise: `**Practice:**
1. Test process death handling: enable "Don't keep activities" in Developer Options and navigate your app
2. Implement SavedStateHandle for a multi-step form that survives process death
3. Design a graceful degradation strategy with 3 fallback tiers for your app
4. Set up a global exception handler that logs to Crashlytics before crashing
5. Implement a Resource<T> wrapper that handles loading/success/error/stale states`,
      commonMistakes: [
        "Not testing for process death — use 'Don't keep activities' developer option or adb kill command",
        "Relying on ViewModel state surviving process death — ViewModel is recreated, use SavedStateHandle",
        "Catching Exception globally and swallowing errors — always log, never suppress silently",
        "Not providing offline fallback — if the network is down, show cached data instead of an error screen",
        "Showing a generic error message — 'Something went wrong' is not helpful. Be specific and offer actions.",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your app has a 1% crash rate on Play Console. How do you reduce it to below 0.1%?",
          a: "1) **Analyze:** Prioritize crashes by impact (frequency × affected users) in Crashlytics. Top 5 crashes usually account for 80%. 2) **Common fixes:** (a) NullPointerException → Adopt Kotlin nullability, add null checks for Java interop. (b) IllegalStateException from Fragment transactions → Use Navigation Component. (c) OutOfMemoryError → Proper image loading with Coil/Glide, fix leaks. (d) NetworkOnMainThreadException → Move to Dispatchers.IO. 3) **Prevention:** (a) Add global exception handler for context before crash. (b) Use sealed types for state management — eliminate impossible states. (c) Process death testing in CI. (d) Canary releases to catch regressions early. 4) **Monitor:** Set up alerts for crash rate threshold."
        },
      ],
    },
  ],
};

export default androidPhase6;
