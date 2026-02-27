const androidPhase2 = {
  id: "phase-2",
  title: "Phase 2: Android Fundamentals Deep Dive",
  emoji: "📱",
  description: "Master Android internals — architecture evolution, lifecycle, View system vs Compose, services, content providers, and OS-level memory management.",
  topics: [
    {
      id: "android-architecture-evolution",
      title: "Android Architecture Evolution",
      explanation: `**Android's architecture has evolved dramatically** from the early MVC-like spaghetti to today's recommended architecture with Jetpack libraries.

**Evolution timeline:**
1. **2008-2013: "God Activity" era** — All logic in Activities. No separation of concerns. Rotation = data loss.
2. **2014-2016: MVP (Model-View-Presenter)** — Separated UI logic from business logic. But Presenters held View references → memory leaks on config changes.
3. **2017-2019: MVVM + Architecture Components** — Google released ViewModel, LiveData, Room, Navigation. Lifecycle-aware components eliminated most config-change bugs.
4. **2020-present: Modern Architecture** — Jetpack Compose, Kotlin Coroutines/Flow, Hilt DI, unidirectional data flow (UDF). Single-Activity architecture is the standard.

**The Android OS Architecture Stack:**
\`\`\`
┌─────────────────────────────────────┐
│         Applications (Your App)     │
├─────────────────────────────────────┤
│    Android Framework (Java/Kotlin)  │
│  ActivityManager, WindowManager,    │
│  PackageManager, ContentProviders   │
├─────────────────────────────────────┤
│   Native Libraries    │ Android RT  │
│   (OpenGL, SQLite,    │ (ART, DEX)  │
│    WebKit, libc)      │             │
├─────────────────────────────────────┤
│    Hardware Abstraction Layer (HAL) │
├─────────────────────────────────────┤
│         Linux Kernel                │
│   (Drivers, Binder IPC, Memory)    │
└─────────────────────────────────────┘
\`\`\`

**Key internal components:**
- **ART (Android Runtime):** Replaced Dalvik in Android 5.0. Uses AOT + JIT compilation. Manages garbage collection with concurrent copying GC.
- **Binder IPC:** Android's inter-process communication mechanism. All system service calls (ActivityManager, WindowManager) go through Binder.
- **Zygote:** A warm process that forks to create new app processes. Pre-loads common classes and resources for fast app startup.

**Why this matters at senior level:** Understanding the stack helps you debug framework-level issues, optimize startup time, and make informed architecture decisions.`,
      codeExample: `// Modern Android Architecture — The Recommended Stack

// 1. UI Layer (Compose)
@Composable
fun NoteListScreen(viewModel: NoteViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    when (val state = uiState) {
        is UiState.Loading -> CircularProgressIndicator()
        is UiState.Success -> NoteList(
            notes = state.notes,
            onDelete = viewModel::deleteNote
        )
        is UiState.Error -> ErrorMessage(state.message)
    }
}

// 2. ViewModel Layer — Holds UI state, survives config changes
@HiltViewModel
class NoteViewModel @Inject constructor(
    private val repository: NoteRepository
) : ViewModel() {
    
    val uiState: StateFlow<UiState> = repository.getNotes()
        .map { UiState.Success(it) as UiState }
        .catch { emit(UiState.Error(it.message ?: "Unknown error")) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UiState.Loading)
    
    fun deleteNote(id: String) {
        viewModelScope.launch { repository.delete(id) }
    }
}

sealed interface UiState {
    data object Loading : UiState
    data class Success(val notes: List<Note>) : UiState
    data class Error(val message: String) : UiState
}

// 3. Data Layer — Repository as single source of truth
class NoteRepository @Inject constructor(
    private val localDao: NoteDao,
    private val remoteApi: NoteApi
) {
    fun getNotes(): Flow<List<Note>> = localDao.getAll()
    
    suspend fun delete(id: String) {
        localDao.delete(id)
        try { remoteApi.delete(id) } catch (_: Exception) { /* queue for sync */ }
    }
}`,
      exercise: `**Practice:**
1. Draw the Android OS architecture stack from memory and label each layer
2. Explain how ART differs from Dalvik — why did Google switch?
3. Describe how Binder IPC works when you call startActivity()
4. Explain what happens from the moment you tap an app icon to when the first frame renders
5. Compare MVP, MVVM, and MVI — when would you choose each?
6. Implement a simple MVVM screen with ViewModel + StateFlow + Compose
7. Explain Zygote's role in app startup and how it impacts cold start time`,
      commonMistakes: [
        "Putting business logic in Activities/Fragments — this died in 2017, use ViewModels",
        "Not understanding Binder IPC — every system service call crosses process boundaries via Binder, and this has performance implications",
        "Ignoring the architecture evolution context — knowing WHY patterns changed helps you make better decisions",
        "Thinking Jetpack Compose replaces the entire architecture — Compose is just the UI layer, you still need ViewModel, Repository, etc.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Walk me through what happens internally when a user taps your app icon.",
          a: "1) Launcher sends an Intent via Binder IPC to ActivityManagerService (AMS). 2) AMS checks if the app process exists. If not, it tells Zygote to fork a new process. 3) Zygote forks, creating a new process with pre-loaded classes. 4) The new process creates an ActivityThread (the main thread). 5) AMS tells the process to create the Application object and call onCreate(). 6) AMS instructs the process to launch the target Activity. 7) Activity.onCreate() runs, the View hierarchy (or Compose tree) is built. 8) The first frame is rendered by the RenderThread and sent to SurfaceFlinger. Total cold start should be under 500ms for a well-optimized app."
        },
        {
          type: "tricky",
          q: "Why does Android use Binder IPC instead of standard Linux IPC (pipes, sockets)?",
          a: "Binder is specifically designed for Android's needs: (1) **Security** — Binder includes the caller's UID/PID, enabling permission checks. Standard IPC doesn't identify callers. (2) **Performance** — Binder uses shared memory for data transfer, requiring only one copy (vs two for pipes). (3) **Object references** — Binder supports remote object references (like RPC), not just byte streams. (4) **Thread management** — Binder has a built-in thread pool for handling concurrent requests. (5) **Death notifications** — Binder can notify when a remote process dies (linkToDeath)."
        },
      ],
    },
    {
      id: "activity-fragment-lifecycle",
      title: "Activity & Fragment Lifecycle (Internals)",
      explanation: `**The Activity lifecycle** is the most fundamental concept in Android development. At the senior level, you need to understand not just the callbacks, but the **internal state machine** that drives them.

**Activity Lifecycle States & Transitions:**
\`\`\`
[DOES NOT EXIST]
     ↓ onCreate()
[CREATED] ──── onStart() ────→ [STARTED]
                                    ↓ onResume()
                               [RESUMED] (foreground, interactive)
                                    ↓ onPause()
                               [STARTED] (visible but not interactive)
                                    ↓ onStop()
                               [CREATED] (not visible)
                                    ↓ onDestroy()
                            [DOES NOT EXIST]
\`\`\`

**Internal working:**
- ActivityManagerService (AMS) in system_server process manages lifecycle transitions via Binder IPC
- The **TransactionExecutor** in the app process receives lifecycle transactions and executes them in order
- Each state transition is a **ClientTransaction** containing **ActivityLifecycleItem** callbacks
- Config changes (rotation) trigger: onPause → onStop → onDestroy → onCreate → onStart → onResume

**Fragment Lifecycle (additional complexity):**
- Fragments have their own lifecycle PLUS a **view lifecycle** (getViewLifecycleOwner)
- Fragment lifecycle is managed by FragmentManager's state machine
- Fragment view can be destroyed while Fragment instance lives (e.g., back stack)

**Critical edge cases that cause production bugs:**
1. **onSaveInstanceState timing** — Called between onPause and onStop (pre-API 28) or after onStop (API 28+)
2. **Fragment transaction after onSaveInstanceState** — IllegalStateException crash
3. **Activity recreation** — ViewModel survives, but Activity/Fragment instances don't
4. **Multi-window mode** — Both Activities can be in STARTED state, but only one is RESUMED`,
      codeExample: `// Lifecycle-aware component that handles edge cases

// BAD: Leaks and crashes ❌
class LeakyActivity : AppCompatActivity() {
    private var networkCallback: NetworkCallback? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // This callback outlives the Activity on config change!
        networkCallback = object : NetworkCallback() {
            override fun onDataReceived(data: String) {
                textView.text = data // Crash: textView may be null after destroy
            }
        }
        NetworkManager.register(networkCallback!!)
    }
    // Missing: unregister in onDestroy → memory leak + crash
}

// GOOD: Lifecycle-aware, no leaks ✅
class SafeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onStart(owner: LifecycleOwner) {
                NetworkManager.register(callback)
            }
            override fun onStop(owner: LifecycleOwner) {
                NetworkManager.unregister(callback)
            }
        })
    }
}

// Fragment View Lifecycle — common source of bugs
class MyFragment : Fragment(R.layout.my_fragment) {
    private var _binding: MyFragmentBinding? = null
    private val binding get() = _binding!!
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = MyFragmentBinding.bind(view)
        
        // Use viewLifecycleOwner for UI observations, NOT this (fragment)
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state -> binding.update(state) }
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null // Prevent memory leak — view is destroyed but fragment lives
    }
}`,
      exercise: `**Practice:**
1. Draw the complete Activity lifecycle with all callbacks from memory
2. What's the difference between onStop and onDestroy? When is onDestroy NOT called?
3. Explain the Fragment view lifecycle vs Fragment lifecycle — why are they different?
4. What happens to the lifecycle when a Dialog appears over your Activity?
5. Write a lifecycle-aware component using DefaultLifecycleObserver
6. Explain what happens during a configuration change — which objects survive?
7. What is the difference between finish(), moveTaskToBack(), and System.exit()?`,
      commonMistakes: [
        "Observing LiveData/Flow with Fragment's lifecycle instead of viewLifecycleOwner — causes duplicate observers after back stack navigation",
        "Not nullifying view binding in onDestroyView — Fragment instance outlives its view on the back stack, causing memory leak",
        "Committing FragmentTransactions after onSaveInstanceState — causes IllegalStateException, use commitAllowingStateLoss only as last resort",
        "Assuming onDestroy is always called — it's NOT called when the system kills the process",
        "Doing heavy work in onCreate — blocks the main thread, causes ANR if > 5 seconds",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What's the difference between Fragment's lifecycle and view lifecycle?",
          a: "Fragment instances can outlive their views. When a Fragment is added to the back stack and replaced, onDestroyView() is called (view destroyed) but onDestroy() is NOT (fragment lives). When the user presses back, onCreateView() is called again on the same Fragment instance. This is why: (1) You must null out view binding in onDestroyView(). (2) You must use viewLifecycleOwner (not 'this') when observing UI data. Using 'this' as lifecycle owner means the observer isn't removed when the view is destroyed, leading to duplicate observers when the fragment's view is recreated."
        },
        {
          type: "scenario",
          q: "Your app crashes with 'Can not perform this action after onSaveInstanceState'. How do you debug and fix this?",
          a: "This means a FragmentTransaction.commit() was called after the Activity saved its state. The framework prevents this because the transaction would be lost on process death. **Debug:** Check stack traces for where commit() is called — usually in an async callback (network response, coroutine) that returns after the Activity is stopped. **Fix:** (1) Use commitAllowingStateLoss() if the transaction is non-critical. (2) Better: check lifecycle state before committing: `if (lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED))`. (3) Best: use Navigation Component which handles this internally. (4) For coroutines: use `repeatOnLifecycle(STARTED)` to auto-cancel when stopped."
        },
      ],
    },
    {
      id: "view-system-vs-compose",
      title: "View System vs Jetpack Compose (Deep Comparison)",
      explanation: `**The View system** (XML + View classes) has been Android's UI framework since day one. **Jetpack Compose** is the modern, declarative UI toolkit released in 2021. At the senior level, you must understand both deeply and when to choose each.

**View System (Imperative):**
- UI defined in XML, inflated into View objects at runtime
- Three-phase rendering: **Measure → Layout → Draw** (traversal of the View tree)
- Each View is a Java/Kotlin object with mutable state
- Updates are imperative: \`textView.text = "Hello"\`

**Jetpack Compose (Declarative):**
- UI defined as Kotlin functions annotated with @Composable
- Uses a **Slot Table** (gap buffer) to store the composition tree
- **Recomposition**: when state changes, only affected composables re-execute
- **Positional memoization**: Compose identifies composables by their call site position

**Internal comparison:**
| Aspect | View System | Jetpack Compose |
|--------|------------|-----------------|
| Rendering | Measure/Layout/Draw on View tree | Composition → Layout → Drawing on Compose nodes |
| State | Mutable View objects | Immutable state, recomposition |
| Memory | Each View = Java object (~200+ bytes) | Slot table entries (~50-80 bytes per node) |
| Updates | Imperative (set properties) | Declarative (re-run function) |
| Deep nesting | Can cause perf issues (measure passes) | Intrinsic measurements solve this |

**When to use which:**
- **New projects:** Compose (Google's recommended approach)
- **Existing large apps:** Incremental adoption via ComposeView in XML layouts
- **Custom drawing:** Both work, but Compose's Canvas API is simpler
- **Complex animations:** Compose's animation APIs are significantly easier`,
      codeExample: `// VIEW SYSTEM — How measure/layout/draw works internally
// Each View goes through 3 phases per frame:

// 1. Measure: determine size
// parent calls child.measure(widthMeasureSpec, heightMeasureSpec)
// child sets measuredWidth/measuredHeight via setMeasuredDimension()

// 2. Layout: determine position  
// parent calls child.layout(left, top, right, bottom)

// 3. Draw: render pixels
// canvas operations in onDraw(canvas)

// Custom View example (View system)
class ProgressRing(context: Context, attrs: AttributeSet?) : View(context, attrs) {
    private var progress = 0f
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 12f
        color = Color.BLUE
    }

    override fun onDraw(canvas: Canvas) {
        val rect = RectF(12f, 12f, width - 12f, height - 12f)
        canvas.drawArc(rect, -90f, 360f * progress, false, paint)
    }

    fun setProgress(value: Float) {
        progress = value.coerceIn(0f, 1f)
        invalidate() // Trigger redraw
    }
}

// JETPACK COMPOSE — Same component, declarative
@Composable
fun ProgressRing(progress: Float, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier.size(48.dp)) {
        drawArc(
            color = Color.Blue,
            startAngle = -90f,
            sweepAngle = 360f * progress,
            useCenter = false,
            style = Stroke(width = 4.dp.toPx())
        )
    }
    // No invalidate() needed — recomposes automatically when progress changes
}

// Compose recomposition — how it works
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    // When count changes, ONLY this composable re-executes
    // Compose's snapshot system detects the read of 'count' during composition
    // and schedules recomposition of this scope when 'count' is written to
    
    Column {
        Text("Count: \$count")  // Re-composed when count changes
        Button(onClick = { count++ }) {
            Text("Increment")   // NOT re-composed (count not read here)
        }
    }
}`,
      exercise: `**Practice:**
1. Implement the same UI in both XML+Views and Compose — compare the code
2. Explain how Compose's recomposition skipping works with stable types
3. What is the Slot Table and how does Compose use it internally?
4. Create a custom layout in Compose using the Layout composable
5. Explain what \`remember\` and \`rememberSaveable\` do — how do they differ?
6. What are the performance implications of using unstable lambdas in Compose?
7. How does Compose interop work — ComposeView in XML and AndroidView in Compose?`,
      commonMistakes: [
        "Deeply nesting Views (XML) without considering measure pass performance — each nested ViewGroup can trigger multiple measure passes",
        "Not understanding recomposition in Compose — putting side effects or heavy computation directly in composable functions",
        "Using mutableStateOf for objects that are not stable — causes unnecessary recompositions",
        "Not using remember for expensive computations in Compose — recalculated on every recomposition",
        "Mixing View system patterns with Compose — e.g., trying to hold a reference to a Compose element and mutate it",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Compose's recomposition work internally?",
          a: "Compose uses a **snapshot state system**. When you read a State object during composition, Compose records that this composable scope depends on that state. When the state value changes, Compose marks all dependent scopes as 'invalid' and schedules recomposition. During recomposition, Compose re-executes only invalid scopes, comparing new outputs with the Slot Table. If a composable's inputs haven't changed and it's 'skippable' (all params are stable/immutable), Compose skips it entirely. The Slot Table is a gap buffer that stores the composition tree efficiently — similar to how text editors handle insertions."
        },
        {
          type: "tricky",
          q: "When would you NOT use Jetpack Compose in a production app?",
          a: "Situations where Compose might not be ideal: (1) Existing large app with 500K+ lines of XML — migration cost may outweigh benefits. (2) Heavy custom Canvas rendering (games, drawing apps) — View's onDraw is still very performant. (3) Wear OS and TV apps where Compose support is still maturing. (4) Team skill gap — if the team isn't trained on Compose, shipping quality may drop. (5) Libraries that only support View system (MapView, some ad SDKs). In practice, even for existing apps, Google recommends incremental Compose adoption for new screens via ComposeView."
        },
      ],
    },
    {
      id: "intent-system",
      title: "Intent System & Inter-Component Communication",
      explanation: `**Intents** are the messaging system that connects Android components. At the senior level, you need to understand how Intents work at the framework and Binder IPC level.

**Types of Intents:**
- **Explicit Intent** — Target a specific component by class name. Used within your app.
- **Implicit Intent** — Describe an action + data, let the system find a matching component. Used for cross-app communication.

**How Intent resolution works internally:**
1. App calls \`startActivity(intent)\` which goes through Instrumentation
2. Instrumentation sends the Intent to ActivityManagerService (AMS) via Binder
3. AMS queries PackageManagerService (PMS) to resolve the Intent
4. PMS checks all registered IntentFilters from AndroidManifest files
5. If multiple matches → chooser dialog. If one match → direct launch.
6. AMS creates/reuses an ActivityRecord and starts the target Activity

**Intent Flags (critical for interview):**
- \`FLAG_ACTIVITY_NEW_TASK\` — Start Activity in a new task
- \`FLAG_ACTIVITY_CLEAR_TOP\` — Clear Activities above the target in the stack
- \`FLAG_ACTIVITY_SINGLE_TOP\` — Reuse the existing instance if it's on top (calls onNewIntent)
- \`FLAG_ACTIVITY_NO_HISTORY\` — Activity won't stay in the back stack

**PendingIntent** — A token that grants another app permission to execute an Intent on your behalf. Used in notifications, alarms, widgets. Security-critical: use FLAG_IMMUTABLE (API 31+).

**Deep Links & App Links:**
- Deep links: custom scheme (myapp://path) — any app can register
- App Links: verified HTTPS links — only your app can handle (requires Digital Asset Links verification)`,
      codeExample: `// Explicit Intent — within your app
val intent = Intent(this, DetailActivity::class.java).apply {
    putExtra("NOTE_ID", noteId)
    putExtra("EDIT_MODE", true)
}
startActivity(intent)

// Implicit Intent — cross-app communication
val shareIntent = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "Check out this note!")
}
startActivity(Intent.createChooser(shareIntent, "Share via"))

// PendingIntent for notifications (API 31+ requires FLAG_IMMUTABLE)
val pendingIntent = PendingIntent.getActivity(
    context,
    requestCode,
    Intent(context, DetailActivity::class.java).apply {
        putExtra("NOTE_ID", noteId)
    },
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)

// Deep Link handling in Activity
class DeepLinkActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleDeepLink(intent)
    }
    
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent) // Called when singleTop and already running
    }
    
    private fun handleDeepLink(intent: Intent) {
        val uri = intent.data ?: return
        when {
            uri.pathSegments.contains("note") -> {
                val noteId = uri.lastPathSegment
                navigateToNote(noteId)
            }
            uri.pathSegments.contains("share") -> {
                val token = uri.getQueryParameter("token")
                handleShareToken(token)
            }
        }
    }
}

// Navigation Component deep link (modern approach)
// In nav_graph.xml:
// <deepLink app:uri="myapp://note/{noteId}" />
// Handles argument extraction automatically`,
      exercise: `**Practice:**
1. Explain the difference between explicit and implicit intents with use cases
2. What happens internally when startActivity() is called? Trace through Binder IPC
3. Implement a custom implicit intent with an IntentFilter in the manifest
4. Explain PendingIntent flags — FLAG_UPDATE_CURRENT vs FLAG_CANCEL_CURRENT
5. Set up App Links with Digital Asset Links verification
6. What are the security implications of exported Activities?`,
      commonMistakes: [
        "Not using FLAG_IMMUTABLE for PendingIntents on API 31+ — causes a crash",
        "Passing large data through Intent extras — Bundle has a ~500KB limit via Binder. Use content URIs or a shared database instead",
        "Not handling onNewIntent for singleTop/singleTask launch modes — deep links won't update the UI",
        "Exporting Activities unintentionally — any app can launch your exported Activity, which is a security risk",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the Binder transaction limit and how does it affect Intents?",
          a: "Binder has a per-process transaction buffer of ~1MB (shared across all concurrent transactions). Each Intent goes through Binder, so the Bundle data must fit within this limit. In practice, the effective limit per Intent is ~500KB. Exceeding it throws TransactionTooLargeException. This is why you should never pass large bitmaps or data arrays through Intents. Instead, use: (1) Content URIs for files. (2) ViewModel/shared repository for in-app data. (3) Persistent storage (Room, DataStore) for cross-component data."
        },
        {
          type: "tricky",
          q: "Explain the difference between App Links and Deep Links. Why do App Links require web server verification?",
          a: "**Deep Links** use custom schemes (myapp://...) — any app can register the same scheme, so the user sees a disambiguation dialog. **App Links** use HTTPS URLs verified via a Digital Asset Links JSON file hosted at your domain (/.well-known/assetlinks.json). Since you own the domain, only your app can claim those URLs — no dialog, instant opening. The verification happens at install time: Android downloads the assetlinks.json and checks your app's signing certificate matches. This prevents malicious apps from intercepting your links."
        },
      ],
    },
    {
      id: "services-foreground-background",
      title: "Services (Foreground & Background)",
      explanation: `**Services** are components that run operations without a UI. At the senior level, understanding the OS restrictions, process priority, and WorkManager alternatives is critical.

**Types of Services:**
1. **Foreground Service** — Visible to user (notification required). Higher process priority. Examples: music playback, navigation, file download.
2. **Background Service** — No user-visible notification. Heavily restricted since Android 8.0 (Oreo). Killed aggressively by the OS.
3. **Bound Service** — Provides a client-server interface. Lives only while clients are bound to it.

**Background execution restrictions timeline:**
- **Android 6.0 (Doze):** Background work paused when device idle
- **Android 8.0:** Cannot start background services from background. Must use startForegroundService() + show notification within 5 seconds.
- **Android 12:** Foreground service launch restrictions from background. Cannot start FGS from background except in specific cases.
- **Android 14:** Must declare foreground service type in manifest (camera, location, mediaPlayback, etc.)

**Modern recommendation:** Use **WorkManager** for deferrable background work. Use foreground services only for user-initiated, ongoing tasks.

**Process priority (highest to lowest):**
1. Foreground process (Activity in RESUMED state)
2. Visible process (Activity in STARTED, bound service from visible)
3. Service process (foreground service running)
4. Cached process (backgrounded, eligible for killing)

The OS kills processes from lowest to highest priority when memory is low. Understanding this hierarchy is essential for designing reliable background operations.`,
      codeExample: `// Foreground Service with Android 14+ requirements
class MusicPlayerService : Service() {
    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildNotification()
        // Android 14+ requires foreground service type
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIFICATION_ID, notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        startPlayback()
        return START_NOT_STICKY // Don't restart if killed
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onDestroy() {
        stopPlayback()
        super.onDestroy()
    }
}

// Starting from Android 8.0+
// From foreground (Activity visible):
ContextCompat.startForegroundService(context, 
    Intent(context, MusicPlayerService::class.java))

// WorkManager for deferrable background work (preferred)
class SyncWorker(context: Context, params: WorkerParameters) 
    : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            val repository = EntryPoints.get(applicationContext, 
                SyncEntryPoint::class.java).repository()
            repository.sync()
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }
}

// Enqueue periodic sync
val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
    15, TimeUnit.MINUTES
).setConstraints(
    Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .setRequiresBatteryNotLow(true)
        .build()
).setBackoffCriteria(
    BackoffPolicy.EXPONENTIAL, 1, TimeUnit.MINUTES
).build()

WorkManager.getInstance(context)
    .enqueueUniquePeriodicWork("sync", ExistingPeriodicWorkPolicy.KEEP, syncRequest)`,
      exercise: `**Practice:**
1. Implement a foreground service for file download with progress notification
2. Explain the difference between START_STICKY, START_NOT_STICKY, and START_REDELIVER_INTENT
3. Why can't you start a background service from Android 8.0+? What alternatives exist?
4. Implement a WorkManager chain: download file → process → upload result
5. Explain how bound services work and when you'd use them over other IPC mechanisms`,
      commonMistakes: [
        "Not showing a notification within 5 seconds of startForegroundService() — causes ForegroundServiceDidNotStartInTimeException crash",
        "Using background services for work that should use WorkManager — services are killed aggressively, WorkManager guarantees execution",
        "Not declaring foreground service types in AndroidManifest on Android 14+ — runtime crash",
        "Leaking bound service connections — always unbind in the appropriate lifecycle callback",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When should you use a Foreground Service vs WorkManager vs AlarmManager?",
          a: "**Foreground Service:** User-initiated, ongoing tasks that need continuous execution and user awareness — music playback, navigation, active file download. **WorkManager:** Deferrable, guaranteed background work — syncing data, uploading logs, periodic cleanup. Survives process death, respects battery constraints. **AlarmManager:** Exact-time triggers — reminders, scheduled notifications. Don't use for background work (WorkManager is better). Rule of thumb: if the user expects to see it happening NOW → Foreground Service. If it can happen later → WorkManager. If it must happen at an exact time → AlarmManager."
        },
        {
          type: "tricky",
          q: "Your foreground service is being killed on some OEM devices (Xiaomi, Samsung). How do you debug and fix?",
          a: "OEM-specific battery optimization is unique to Android. These manufacturers add aggressive battery killers that ignore standard Android service priorities. Debugging: (1) Check device-specific settings (Battery Optimization, Auto-start permissions). (2) Use 'adb shell dumpsys activity services' to see service state. **Fixes:** (1) Guide users to whitelist your app from battery optimization (RequestIgnoreBatteryOptimizations). (2) Use WorkManager with setExpedited() for critical work — it uses FGS internally. (3) Implement a heartbeat mechanism to detect and recover from kills. (4) Use dontkillmyapp.com for device-specific documentation. (5) Consider using Firebase Cloud Messaging for push-triggered work instead of long-running services."
        },
      ],
    },
  ],
};

export default androidPhase2;
