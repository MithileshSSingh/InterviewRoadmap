const androidPhase5 = {
  id: "phase-5",
  title: "Phase 5: Performance & Optimization",
  emoji: "⚡",
  description: "Master performance profiling and optimization — memory leaks, ANR debugging, UI jank, battery optimization, and caching strategies.",
  topics: [
    {
      id: "memory-leak-detection",
      title: "Memory Leak Detection & Prevention",
      explanation: `**Memory leaks** occur when objects that are no longer needed are still referenced, preventing garbage collection. In Android, Activity and Fragment leaks are the most common and dangerous.

**How to detect leaks:**
1. **LeakCanary** — Automatic detection in debug builds. Watches Activities, Fragments, Views, ViewModels. Shows reference chain.
2. **Android Studio Memory Profiler** — Live heap inspection, allocation tracking, heap dump analysis.
3. **\`adb shell dumpsys meminfo\`** — Quick memory overview per process.

**Most common leak patterns in Android:**
1. **Static reference to Activity/Context** — Singleton holding Activity context
2. **Inner class reference** — Non-static inner class holds implicit reference to outer class
3. **Thread/Handler leaks** — Long-running operations holding Activity reference
4. **Unregistered callbacks** — Listeners, receivers, observers not removed on destroy
5. **View binding not cleared** — Fragment's view binding kept after onDestroyView

**Leak investigation workflow:**
\`\`\`
1. Run app with LeakCanary enabled
2. Exercise the suspected flow (navigate in/out of screens)
3. LeakCanary shows toast if leak detected
4. Examine the reference chain (GC root → leak)
5. Identify the retaining reference
6. Fix and verify
\`\`\`

**Prevention checklist:**
- Use \`applicationContext\` instead of Activity context for singletons
- Clear listeners/callbacks in onStop/onDestroy
- Null out view binding in Fragment.onDestroyView
- Use WeakReference for optional callbacks
- Use lifecycle-aware components (LiveData, Flow with repeatOnLifecycle)`,
      codeExample: `// Common leak patterns and their fixes

// LEAK: ViewModel holding View reference
class BadViewModel : ViewModel() {
    var textView: TextView? = null // ❌ ViewModel outlives Activity!
}
// FIX: ViewModel exposes StateFlow, View observes it
class GoodViewModel : ViewModel() {
    private val _text = MutableStateFlow("")
    val text: StateFlow<String> = _text.asStateFlow()
}

// LEAK: Coroutine in Activity without proper scope
class LeakyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        CoroutineScope(Dispatchers.IO).launch { // ❌ Unmanaged scope!
            delay(60_000)
            updateUI() // Activity may be destroyed
        }
    }
}
// FIX: Use lifecycleScope
class SafeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycleScope.launch { // ✅ Auto-cancelled on destroy
            delay(60_000)
            updateUI()
        }
    }
}

// LEAK: Singleton holding Activity context
object ImageCache {
    private lateinit var context: Context
    fun init(context: Context) {
        this.context = context // ❌ If Activity context, leaked!
    }
}
// FIX: Use application context
object ImageCache {
    private lateinit var context: Context
    fun init(context: Context) {
        this.context = context.applicationContext // ✅ Application lives forever
    }
}

// LeakCanary custom watchers
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Watch custom objects for leaks
        val watcher = AppWatcher.objectWatcher
        // When you expect an object to be GC'd, watch it:
        // watcher.expectWeaklyReachable(myObject, "reason")
    }
}`,
      exercise: `**Practice:**
1. Set up LeakCanary and intentionally create 3 different types of leaks
2. Use Memory Profiler to capture a heap dump and identify retained objects
3. Fix a memory leak caused by a Handler posting delayed messages
4. Implement a lifecycle-aware callback registration pattern
5. Profile your app's memory usage across 10 screen transitions — check for growth`,
      commonMistakes: [
        "Only testing on high-end devices — leaks cause OOM crashes on low-memory devices first",
        "Using Activity context in singletons — always use applicationContext for long-lived objects",
        "Not testing with LeakCanary in CI — add a leak detection step to your test pipeline",
        "Assuming Kotlin's lifecycle features prevent all leaks — coroutine scope leaks are still common",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your production app has increasing crash reports for OOM. How do you investigate?",
          a: "1) **Analyze crashes:** Group OOM crashes by screen/flow in Crashlytics. Identify the most common paths. 2) **Reproduce locally:** Navigate through the top crash paths with Memory Profiler running. Watch for heap growth that doesn't recover. 3) **LeakCanary:** Run debug build through the crash paths. Check for Activity/Fragment leaks. 4) **Heap dump analysis:** Capture heap dump, sort by retained size. Look for unexpected large objects (bitmaps, long lists) and multiple instances of Activities. 5) **Fix patterns:** (a) Use Coil/Glide for image lifecycle management. (b) Clear view bindings in Fragment.onDestroyView(). (c) Switch to lifecycleScope/viewModelScope. 6) **Regression test:** Add memory benchmark tests."
        },
      ],
    },
    {
      id: "anr-debugging",
      title: "ANR Debugging & Prevention",
      explanation: `**ANR (Application Not Responding)** occurs when the main thread is blocked for too long:
- **Input event:** 5 seconds without response
- **BroadcastReceiver.onReceive():** 10 seconds
- **Service.onCreate()/onStartCommand():** 20 seconds (foreground), 200 seconds (background)

**Common causes:**
1. **Disk I/O on main thread** — SharedPreferences.commit(), file reads, database queries
2. **Network on main thread** — synchronous HTTP calls (rare now but still happens)
3. **Heavy computation** — JSON parsing, image processing, complex algorithms
4. **Deadlocks** — Two threads waiting for each other's locks
5. **Slow ContentProvider queries** — Unindexed database queries
6. **Binder calls** — Synchronous IPC to a slow system service

**Debugging ANRs:**
1. **Logcat:** Look for "ANR in" messages with the process and reason
2. **traces.txt:** \`adb pull /data/anr/traces.txt\` — Shows stack trace of ALL threads at ANR time
3. **StrictMode:** Enable disk/network detection in debug builds
4. **Android Vitals (Play Console):** Shows ANR rate and stack traces from production
5. **Perfetto:** System-wide tracing for complex threading issues

**Google's guideline:** ANR rate should be below 0.47% (less than 1 ANR per 200 user sessions).`,
      codeExample: `// Common ANR causes and fixes

// ANR: SharedPreferences.commit() on main thread ❌
fun saveUserPreference(key: String, value: String) {
    prefs.edit().putString(key, value).commit() // Blocks main thread!
}
// FIX: Use apply() or DataStore
fun saveUserPreference(key: String, value: String) {
    prefs.edit().putString(key, value).apply() // ✅ Async write
}

// Even better: Use DataStore
class PreferencesRepository @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    suspend fun savePreference(key: String, value: String) {
        dataStore.edit { prefs -> prefs[stringPreferencesKey(key)] = value }
    }
    
    fun getPreference(key: String): Flow<String?> {
        return dataStore.data.map { it[stringPreferencesKey(key)] }
    }
}

// ANR: Database query on main thread ❌
fun getUser(id: String): User {
    return database.userDao().getById(id) // Blocks if DB is slow!
}
// FIX: Use suspend + Dispatchers.IO
suspend fun getUser(id: String): User = withContext(Dispatchers.IO) {
    database.userDao().getById(id)
}

// ANR: Deadlock detection
// Thread A holds lock1, waits for lock2
// Thread B holds lock2, waits for lock1
// Both threads blocked forever — ANR if main thread is involved

// Prevention: Always acquire locks in the same order
class SafeLocking {
    private val lock1 = ReentrantLock()
    private val lock2 = ReentrantLock()
    
    // Always acquire lock1 before lock2 — prevents deadlock
    fun operation() {
        lock1.withLock {
            lock2.withLock {
                // Safe — consistent lock ordering
            }
        }
    }
}

// StrictMode for development-time detection
if (BuildConfig.DEBUG) {
    StrictMode.setThreadPolicy(
        StrictMode.ThreadPolicy.Builder()
            .detectDiskReads()
            .detectDiskWrites()
            .detectNetwork()
            .detectCustomSlowCalls()
            .penaltyLog()
            .penaltyDeath() // Crash on violation in debug
            .build()
    )
}`,
      exercise: `**Practice:**
1. Enable StrictMode and find all main-thread disk/network violations in your app
2. Analyze an ANR traces.txt file — identify the blocked thread and root cause
3. Replace all SharedPreferences.commit() calls with apply() or DataStore
4. Implement a custom ANR watchdog that detects main thread blocking
5. Check your app's ANR rate on Google Play Console`,
      commonMistakes: [
        "Using SharedPreferences.commit() instead of apply() — commit() writes synchronously to disk on the calling thread",
        "Querying ContentProviders without a background thread — some providers (Contacts, MediaStore) can be slow",
        "Not monitoring ANR rates in production — by the time users complain, your ANR rate may be critical",
        "Running Room database operations without specifying a background dispatcher",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your app's ANR rate is 2% on Play Console. How do you bring it below 0.47%?",
          a: "1) **Analyze:** Download ANR clusters from Play Console. Group by stack trace — usually 3-5 root causes cover 80% of ANRs. 2) **Top causes:** (a) SharedPreferences.commit() → switch to apply() or DataStore. (b) Database queries on main thread → Room with Dispatchers.IO. (c) Heavy layout inflation → simplify layouts or use ViewStub for deferred inflation. (d) Lock contention → reduce synchronized blocks, use concurrent data structures. 3) **Prevention:** Enable StrictMode in debug, add lint rules for main-thread violations, CI check for ANR patterns. 4) **Monitor:** Set up alerting for ANR rate increase in Play Console. Target: below 0.47% for good Android Vitals."
        },
      ],
    },
    {
      id: "ui-jank-elimination",
      title: "UI Jank Elimination & 60fps Rendering",
      explanation: `**UI jank** is visible stutter or frame drops caused by frames taking longer than 16.6ms (60fps) or 8.3ms (120fps). Users perceive jank immediately — it makes apps feel sluggish.

**Frame budget:**
- 60fps display: 16.6ms per frame
- 90fps display: 11.1ms per frame  
- 120fps display: 8.3ms per frame
- Frame rendering: UI Thread work + RenderThread work must fit in budget

**Common jank causes:**
1. **Overdraw** — Drawing the same pixel multiple times (stacked backgrounds)
2. **Layout complexity** — Deeply nested ViewGroups trigger multiple measure passes
3. **Inflate on demand** — Inflating complex layouts during scroll
4. **Large images** — Loading full-resolution images without downsampling
5. **GC pressure** — Allocating objects in onDraw/onBindViewHolder causing GC pauses
6. **Main thread work** — Any computation during scroll

**Profiling tools:**
- **GPU Profiler (on device)** — Shows frame rendering time as bars
- **Layout Inspector** — View hierarchy depth and overdraw
- **Systrace / Perfetto** — System-wide trace showing exactly where time is spent
- **Jetpack Benchmark** — Micro and macro benchmarks for measuring performance

**Compose-specific jank prevention:**
- Mark classes as @Stable or @Immutable for recomposition skipping
- Use derivedStateOf for computed values that shouldn't trigger recomposition
- Defer reads to the Layout/Drawing phase with Modifier.drawWithContent
- Use key() to help Compose identify items in lazy lists`,
      codeExample: `// RecyclerView optimization for smooth scrolling
class OptimizedAdapter(
    private val differ: AsyncListDiffer<Item> = AsyncListDiffer(this, DIFF_CALLBACK)
) : RecyclerView.Adapter<ViewHolder>() {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        // Use ViewBinding — faster than findViewById
        val binding = ItemViewBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = differ.currentList[position]
        holder.bind(item)
        // ❌ DON'T: allocate objects here (called during scroll)
        // ❌ DON'T: load images without caching
        // ✅ DO: use Coil/Glide with placeholder
    }
    
    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<Item>() {
            override fun areItemsTheSame(old: Item, new: Item) = old.id == new.id
            override fun areContentsTheSame(old: Item, new: Item) = old == new
        }
    }
}

// Compose LazyList optimization
@Composable
fun OptimizedList(items: List<Item>) {
    LazyColumn {
        items(
            items = items,
            key = { it.id } // Stable keys prevent unnecessary recomposition
        ) { item ->
            // Use remember to avoid recomputation
            val formattedDate = remember(item.date) {
                dateFormatter.format(item.date)
            }
            ItemRow(item, formattedDate)
        }
    }
}

// Stable types for Compose recomposition skipping
@Immutable // Tells Compose this class never changes after creation
data class UiItem(
    val id: String,
    val title: String,
    val imageUrl: String
)

// derivedStateOf — only recomposes when the derived value changes
@Composable
fun FilteredList(items: List<Item>, query: String) {
    // Without derivedStateOf: recomposes on EVERY items/query change
    // With derivedStateOf: only recomposes when filtered result changes
    val filteredItems by remember(items, query) {
        derivedStateOf {
            if (query.isEmpty()) items
            else items.filter { it.title.contains(query, ignoreCase = true) }
        }
    }
    LazyColumn {
        items(filteredItems, key = { it.id }) { ItemRow(it) }
    }
}`,
      exercise: `**Practice:**
1. Enable GPU overdraw visualization and reduce overdraw in one of your layouts
2. Profile a LazyColumn with 1000 items using Compose Compiler metrics
3. Implement DiffUtil for a RecyclerView and measure the rendering improvement
4. Use Perfetto to capture a frame trace and identify the jank cause
5. Add @Stable annotations to your Compose data models and verify recomposition skipping`,
      commonMistakes: [
        "Allocating objects inside onDraw() or Compose drawing — triggers GC during rendering",
        "Not using DiffUtil/keys in lists — causes full rebind on list updates",
        "Ignoring overdraw — multiple overlapping backgrounds waste GPU cycles",
        "Loading full-resolution images in a list — use thumbnails with Coil/Glide downsampling",
        "Not testing on low-end devices — jank may be invisible on flagship devices but severe on budget phones",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Users report your app's list scrolling is choppy. How do you diagnose and fix it?",
          a: "1) **Profile:** Record a Perfetto trace during scroll. Look for frames exceeding 16ms. 2) **Common fixes:** (a) Ensure images use Coil/Glide with proper sizing and caching. (b) Add stable keys to LazyColumn items. (c) Reduce layout depth — flatten nested layouts. (d) Check for object allocation in bind/composable functions. (e) Use AsyncListDiffer/keys for efficient updates. 3) **Compose-specific:** Check Compiler metrics for skippable/restartable functions. Add @Stable/@Immutable annotations. Use derivedStateOf for filtered lists. 4) **Verify:** Run Macrobenchmark to measure frame timing statistically."
        },
      ],
    },
    {
      id: "battery-network-optimization",
      title: "Battery & Network Optimization",
      explanation: `**Battery optimization** is critical for user retention. Android's battery management has become increasingly aggressive with each version. Senior engineers must design apps that work within these constraints.

**Battery-draining operations:**
1. **Wake locks** — Keeping CPU/screen active. Use sparingly with proper timeouts.
2. **GPS polling** — Location updates drain battery significantly. Use fused location provider with appropriate intervals.
3. **Network polling** — Frequent network requests keep the radio active. Batch requests.
4. **Background services** — Long-running services consume CPU. Use WorkManager.
5. **Alarms** — Exact alarms prevent the device from entering Doze. Use inexact when possible.

**Android power management features:**
- **Doze mode (6.0+):** When device is stationary and screen off, network/wake locks/alarms are deferred to maintenance windows.
- **App Standby Buckets (9.0+):** Apps are ranked by usage frequency. Infrequently used apps get fewer resources.
- **Background execution limits (8.0+):** Background services limited to ~10 minutes. Use Foreground Service or WorkManager.

**Network optimization:**
- **OkHttp connection pooling** — Reuse TCP connections. Default: 5 connections, 5 min keepalive.
- **HTTP caching** — Cache responses using Cache-Control headers. OkHttp supports this natively.
- **Compression** — Use gzip for request/response bodies.
- **Batching** — Combine multiple small requests into one batch request.
- **Prefetching** — Load data before the user needs it, but intelligently (on WiFi, charged).`,
      codeExample: `// Network optimization with OkHttp
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttpClient(@ApplicationContext context: Context): OkHttpClient {
        val cacheDir = File(context.cacheDir, "http_cache")
        val cache = Cache(cacheDir, 50L * 1024 * 1024) // 50MB cache
        
        return OkHttpClient.Builder()
            .cache(cache) // Enable HTTP caching
            .addInterceptor(CacheInterceptor()) // Custom cache policy
            .addNetworkInterceptor(HttpLoggingInterceptor())
            .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))
            .build()
    }
}

// Cache interceptor — serve stale cache when offline
class CacheInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()
        // If offline, use cache (up to 7 days old)
        if (!isNetworkAvailable()) {
            request = request.newBuilder()
                .cacheControl(CacheControl.Builder()
                    .maxStale(7, TimeUnit.DAYS)
                    .build())
                .build()
        }
        return chain.proceed(request)
    }
}

// Battery-aware sync scheduling
fun scheduleSync(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.UNMETERED) // WiFi only
        .setRequiresBatteryNotLow(true) // Don't sync on low battery
        .setRequiresCharging(false) // But don't require charging
        .build()
    
    val syncWork = PeriodicWorkRequestBuilder<SyncWorker>(
        1, TimeUnit.HOURS, // Repeat hourly
        15, TimeUnit.MINUTES // Flex window
    )
        .setConstraints(constraints)
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.MINUTES)
        .build()
    
    WorkManager.getInstance(context)
        .enqueueUniquePeriodicWork("sync", ExistingPeriodicWorkPolicy.KEEP, syncWork)
}

// Location optimization
class LocationTracker @Inject constructor(
    private val fusedClient: FusedLocationProviderClient
) {
    fun startTracking(priority: Priority): Flow<Location> = callbackFlow {
        val request = LocationRequest.Builder(
            if (priority == Priority.HIGH) Priority.PRIORITY_HIGH_ACCURACY
            else Priority.PRIORITY_BALANCED_POWER_ACCURACY,
            if (priority == Priority.HIGH) 5_000L else 30_000L // Interval ms
        ).setMinUpdateDistanceMeters(
            if (priority == Priority.HIGH) 10f else 100f
        ).build()
        
        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { trySend(it) }
            }
        }
        fusedClient.requestLocationUpdates(request, callback, Looper.getMainLooper())
        awaitClose { fusedClient.removeLocationUpdates(callback) }
    }
    
    enum class Priority { HIGH, LOW }
}`,
      exercise: `**Practice:**
1. Implement HTTP caching with OkHttp and verify cached responses with stale-if-error
2. Set up battery-aware WorkManager sync with appropriate constraints
3. Profile your app's battery impact using Battery Historian
4. Implement a smart prefetching strategy that loads data on WiFi only
5. Measure your app's network traffic using Network Profiler and identify redundant calls`,
      commonMistakes: [
        "Not using OkHttp's built-in cache — re-fetching data that hasn't changed wastes bandwidth and battery",
        "Using exact alarms for non-time-critical work — exact alarms prevent Doze, use WorkManager instead",
        "Polling with high frequency for location — use geofencing or significant motion triggers when possible",
        "Not batching network requests — each request activates the radio, keeping it awake for 20-30 seconds",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Users report your app drains battery. How do you investigate and fix?",
          a: "1) **Profile:** Use Battery Historian to analyze wake locks, alarms, network activity attributed to your app. 2) **Common culprits:** (a) Wake locks without timeouts — add 10-minute max timeout. (b) High-frequency location polling — reduce to significant motion or geofence-based. (c) Background sync too frequent — use WorkManager with battery constraints. (d) Network polling — switch to push notifications (FCM) for real-time updates. 3) **Quick wins:** Use WorkManager exclusively for background work, enable OkHttp caching, batch network requests. 4) **Monitor:** Track battery stats in Android Vitals on Play Console."
        },
      ],
    },
    {
      id: "caching-strategies",
      title: "Caching Strategies for Android",
      explanation: `**Caching** is one of the most impactful optimizations in mobile apps. A well-designed cache strategy reduces network calls, improves perceived performance, and enables offline functionality.

**Caching layers in a typical Android app:**
\`\`\`
1. In-memory cache (fastest, volatile)
   └── LruCache, HashMap, Compose remember
2. Disk cache (persistent, slower)
   └── Room database, DataStore, OkHttp cache, DiskLruCache
3. Network cache (HTTP caching)
   └── Cache-Control headers, ETag, Last-Modified
\`\`\`

**Cache invalidation strategies:**
1. **Time-based (TTL):** Data expires after a fixed duration. Simple but may serve stale data.
2. **Event-based:** Server pushes invalidation events. Real-time but requires infrastructure.
3. **Version-based (ETag):** Server returns ETag, client sends If-None-Match. 304 = use cache.
4. **Write-through:** Write to cache AND source simultaneously. Always consistent.
5. **Write-behind:** Write to cache first, batch-sync to source later. Fast writes but risk data loss.

**The "stale-while-revalidate" pattern:**
1. Return cached data immediately (fast UX)
2. Fetch fresh data from network in background
3. Update cache and notify observers (Flow/LiveData emits new data)
4. UI updates seamlessly

This is the most common pattern in production Android apps.`,
      codeExample: `// Multi-layer caching implementation

// In-memory LRU cache
class InMemoryCache<K, V>(maxSize: Int) {
    private val cache = object : LruCache<K, V>(maxSize) {
        override fun sizeOf(key: K, value: V): Int = 1
    }
    
    fun get(key: K): V? = cache.get(key)
    fun put(key: K, value: V) = cache.put(key, value)
    fun evict(key: K) = cache.remove(key)
    fun clear() = cache.evictAll()
}

// Repository with stale-while-revalidate pattern
class ArticleRepository @Inject constructor(
    private val api: ArticleApi,
    private val dao: ArticleDao,
    private val memoryCache: InMemoryCache<String, List<Article>>
) {
    fun getArticles(): Flow<List<Article>> = flow {
        // Layer 1: Memory cache (instant)
        memoryCache.get("articles")?.let { emit(it) }
        
        // Layer 2: Database (fast, persistent)
        val dbArticles = dao.getAll().first().map { it.toDomain() }
        if (dbArticles.isNotEmpty()) {
            emit(dbArticles)
            memoryCache.put("articles", dbArticles)
        }
        
        // Layer 3: Network (fresh data)
        try {
            val networkArticles = api.getArticles()
            val entities = networkArticles.map { it.toEntity() }
            dao.upsertAll(entities)
            val domainArticles = entities.map { it.toDomain() }
            memoryCache.put("articles", domainArticles)
            emit(domainArticles)
        } catch (e: Exception) {
            if (dbArticles.isEmpty()) throw e
            // Stale data is better than no data
        }
    }.distinctUntilChanged()
    
    // Cache-aware single item fetch
    suspend fun getArticle(id: String): Article {
        // Check memory cache first
        memoryCache.get("article_\$id")?.let { return it.first() }
        
        // Then database
        val entity = dao.getById(id)
        if (entity != null && !entity.isStale()) {
            return entity.toDomain()
        }
        
        // Finally network
        val article = api.getArticle(id)
        dao.upsert(article.toEntity())
        return article.toDomain()
    }
}

// Image caching with Coil (built-in multi-layer cache)
@Composable
fun CachedImage(url: String, modifier: Modifier = Modifier) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(url)
            .memoryCacheKey(url) // In-memory LRU
            .diskCacheKey(url)   // Disk LRU
            .crossfade(true)
            .placeholder(R.drawable.placeholder)
            .error(R.drawable.error)
            .build(),
        contentDescription = null,
        modifier = modifier
    )
}`,
      exercise: `**Practice:**
1. Implement a 3-layer cache (memory → disk → network) for an API endpoint
2. Add TTL-based cache invalidation to your Room entities
3. Configure OkHttp HTTP caching with Cache-Control headers
4. Implement the stale-while-revalidate pattern with Flow
5. Design a cache strategy for an image gallery that handles 10,000+ images`,
      commonMistakes: [
        "Not caching at all — every screen load hits the network, wasting bandwidth and battery",
        "Caching without a size limit — unbounded caches consume all available memory/disk",
        "Serving infinitely stale data — cache must have expiration, either time-based or event-based",
        "Using in-memory cache without a disk fallback — data lost on process death",
        "Not cache-busting on user-triggered refresh — pull-to-refresh should bypass cache",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Design a caching strategy for a social media feed with high-frequency updates.",
          a: "Multi-layer approach: (1) **In-memory:** LruCache for current session's viewed posts. Instant access, limited to ~100 posts. (2) **Room DB:** Persistent cache of the last 500 posts. Source of truth for the UI via Flow. (3) **Network:** Pull-to-refresh or automatic refresh every 2 minutes when app is foregrounded. (4) **Invalidation:** Server push via FCM for new posts (incremental), user pull-to-refresh for full refresh. (5) **Stale data policy:** Show cached data immediately, fetch updates in background. New posts appear with a 'new posts available' banner. (6) **Pagination:** Cache first 3 pages, fetch remaining on demand."
        },
      ],
    },
  ],
};

export default androidPhase5;
