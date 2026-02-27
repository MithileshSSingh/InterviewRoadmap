// Phase 2b: Additional Android Fundamentals topics
const androidPhase2b = [
  {
    id: "broadcast-receivers",
    title: "BroadcastReceivers & System Events",
    explanation: `**BroadcastReceivers** listen for system-wide or app-internal broadcast events. At the senior level, understand the security model, implicit broadcast restrictions, and modern alternatives.

**How BroadcastReceivers work internally:**
1. An app or the system sends a broadcast Intent via \`sendBroadcast()\`
2. The Intent goes to ActivityManagerService (AMS) via Binder
3. AMS queries PackageManagerService for all registered receivers matching the IntentFilter
4. AMS delivers the broadcast to each receiver's \`onReceive()\` method
5. For manifest-registered receivers, AMS starts the app process if needed

**Registration types:**
- **Manifest-registered (static):** Survives app death, limited to specific broadcasts since Android 8.0
- **Context-registered (dynamic):** Active only while the registering component lives, no restrictions

**Android 8.0+ implicit broadcast restrictions:**
Most implicit broadcasts can no longer wake up manifest-registered receivers. Exceptions: BOOT_COMPLETED, LOCALE_CHANGED, ACTION_TIMEZONE_CHANGED and a few others.

**Ordered vs Normal broadcasts:**
- Normal: Delivered to all receivers simultaneously (no ordering guarantee)
- Ordered: Delivered one at a time by priority. Receivers can abort propagation.

**Modern alternatives:**
- For in-app events: Kotlin Flow, LiveData, or EventBus patterns
- For scheduled work: WorkManager
- For push notifications: FCM (Firebase Cloud Messaging)`,
    codeExample: `// Dynamic registration — preferred for most use cases
class NetworkAwareActivity : AppCompatActivity() {
    private val connectivityReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val isConnected = intent.getBooleanExtra(
                ConnectivityManager.EXTRA_NO_CONNECTIVITY, false
            ).not()
            handleConnectivityChange(isConnected)
        }
    }

    override fun onStart() {
        super.onStart()
        val filter = IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION)
        registerReceiver(connectivityReceiver, filter)
    }

    override fun onStop() {
        super.onStop()
        unregisterReceiver(connectivityReceiver) // Prevent leak
    }
}

// Modern approach: Use ConnectivityManager.NetworkCallback instead
class NetworkMonitor @Inject constructor(
    private val connectivityManager: ConnectivityManager
) {
    val isConnected: StateFlow<Boolean> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) { trySend(true) }
            override fun onLost(network: Network) { trySend(false) }
        }
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        connectivityManager.registerNetworkCallback(request, callback)
        awaitClose { connectivityManager.unregisterNetworkCallback(callback) }
    }.stateIn(CoroutineScope(Dispatchers.Default), SharingStarted.Lazily, false)
}

// LocalBroadcastManager alternative — use Kotlin Flow
class EventBus {
    private val _events = MutableSharedFlow<AppEvent>(extraBufferCapacity = 64)
    val events: SharedFlow<AppEvent> = _events.asSharedFlow()
    
    suspend fun emit(event: AppEvent) { _events.emit(event) }
}`,
    exercise: `**Practice:**
1. List 5 implicit broadcasts that still work with manifest-registered receivers on Android 13+
2. Implement a BroadcastReceiver that listens for airplane mode changes
3. Why is LocalBroadcastManager deprecated? What should you use instead?
4. Explain ordered broadcasts — when would you use them?
5. Implement a network connectivity monitor using NetworkCallback and Flow`,
    commonMistakes: [
      "Not unregistering dynamic receivers — memory leak and potential crash",
      "Doing long-running work in onReceive() — it runs on the main thread and has a 10-second limit before ANR",
      "Using manifest-registered receivers for implicit broadcasts on Android 8.0+ — they won't fire",
      "Using LocalBroadcastManager (deprecated) — use Kotlin Flow or LiveData for in-app events",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "Why did Android restrict implicit broadcasts in Android 8.0?",
        a: "Performance and battery. Before Android 8.0, every app could register for ANY implicit broadcast in their manifest. When CONNECTIVITY_ACTION fired, Android had to wake up potentially hundreds of apps — each creating a new process, running onReceive(), consuming CPU and memory. This caused visible battery drain and system slowdowns. The restriction forces apps to use dynamic registration (only active while app is running) or WorkManager for background work, significantly reducing the number of processes woken for each broadcast."
      },
      {
        type: "tricky",
        q: "How would you implement a reliable event bus in a modern Android app without BroadcastReceivers?",
        a: "Use Kotlin SharedFlow: (1) Create a singleton EventBus with MutableSharedFlow. (2) Producers call emit(event). (3) Consumers collect in repeatOnLifecycle(STARTED). Advantages over BroadcastReceiver: type-safe, no serialization overhead, lifecycle-aware, supports backpressure. For cross-process events, use ContentProvider + ContentObserver or Binder-based AIDL. For truly persistent events that must survive process death, use WorkManager + Room."
      },
    ],
  },
  {
    id: "content-providers",
    title: "ContentProviders & Data Sharing",
    explanation: `**ContentProviders** are Android's standard interface for sharing structured data between apps. They abstract the underlying data storage (SQLite, files, network) behind a content:// URI scheme.

**Internal architecture:**
1. Client app calls ContentResolver.query(uri)
2. ContentResolver sends request via Binder IPC to the ContentProvider's process
3. ContentProvider processes the request and returns a Cursor
4. The Cursor data is transferred back via Binder (or shared memory for large datasets)

**Content URIs:** \`content://authority/path/id\`
- authority: unique identifier, usually package name
- path: data type (e.g., "notes", "users")
- id: specific record (optional)

**When to use ContentProviders:**
- Sharing data with other apps (contacts, media, files)
- Using SearchView suggestions
- Providing data to widgets (AppWidgetProvider)
- ContentProvider-based sync adapters
- FileProvider for secure file sharing between apps

**Modern usage:**
While ContentProviders are fundamental Android components, modern apps often use Room DAO directly for internal data access and FileProvider for file sharing. ContentProviders remain essential for system integrations (Contacts, MediaStore, Calendar).`,
    codeExample: `// FileProvider — secure file sharing between apps
// AndroidManifest.xml:
// <provider
//     android:name="androidx.core.content.FileProvider"
//     android:authorities="\${applicationId}.fileprovider"
//     android:exported="false"
//     android:grantUriPermissions="true">
//     <meta-data
//         android:name="android.support.FILE_PROVIDER_PATHS"
//         android:resource="@xml/file_paths" />
// </provider>

// Share a file securely
fun shareFile(context: Context, file: File) {
    val uri = FileProvider.getUriForFile(
        context,
        "\${context.packageName}.fileprovider",
        file
    )
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "application/pdf"
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(Intent.createChooser(shareIntent, "Share via"))
}

// Querying MediaStore (Android 10+ scoped storage)
suspend fun getImages(context: Context): List<MediaItem> {
    return withContext(Dispatchers.IO) {
        val images = mutableListOf<MediaItem>()
        val projection = arrayOf(
            MediaStore.Images.Media._ID,
            MediaStore.Images.Media.DISPLAY_NAME,
            MediaStore.Images.Media.SIZE
        )
        context.contentResolver.query(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            projection, null, null,
            "\${MediaStore.Images.Media.DATE_ADDED} DESC"
        )?.use { cursor ->
            val idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
            val nameCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME)
            while (cursor.moveToNext()) {
                val id = cursor.getLong(idCol)
                val name = cursor.getString(nameCol)
                val uri = ContentUris.withAppendedId(
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id
                )
                images.add(MediaItem(id, name, uri))
            }
        }
        images
    }
}`,
    exercise: `**Practice:**
1. Implement a FileProvider and share an image with another app
2. Query the MediaStore for all videos added in the last 7 days
3. Explain Scoped Storage (Android 10+) — how does it change ContentProvider usage?
4. When would you implement a custom ContentProvider vs using Room directly?
5. Explain the difference between exported="true" and grantUriPermissions`,
    commonMistakes: [
      "Exposing file:// URIs to other apps — causes FileUriExposedException on Android 7.0+, use FileProvider instead",
      "Not closing Cursors — memory leak. Always use .use { } or try-with-resources",
      "Querying ContentProviders on the main thread — can cause ANR, always use Dispatchers.IO",
      "Not handling Scoped Storage changes (Android 10+) — legacy file access methods fail",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "Explain Scoped Storage and why Google introduced it.",
        a: "Before Android 10, any app with storage permission could read ALL files on the device — a massive privacy issue. Scoped Storage restricts each app to: (1) Its own private directory (no permission needed). (2) MediaStore for shared media (images, videos, audio) — requires permissions. (3) Storage Access Framework for user-selected files. (4) No access to other apps' files. This improved user privacy but required apps to migrate from File-based APIs to ContentResolver/MediaStore. Apps targeting Android 11+ must use Scoped Storage (MANAGE_EXTERNAL_STORAGE is only for file managers)."
      },
    ],
  },
  {
    id: "app-startup-optimization",
    title: "App Startup Optimization",
    explanation: `**App startup time** is one of the most critical performance metrics. Google recommends cold start < 500ms. At the senior level, you need to understand the startup phases, profiling tools, and optimization techniques.

**Startup types:**
- **Cold start:** Process not running. Full initialization: Zygote fork → Application.onCreate() → Activity.onCreate() → first frame. Slowest.
- **Warm start:** Process exists but Activity is recreated. Skips process creation.
- **Hot start:** Activity is in memory, just brought to foreground. Fastest.

**Cold start phases:**
\`\`\`
1. Process creation (Zygote fork)           ~50-100ms (OS, can't optimize)
2. Application.onCreate()                   ← YOUR optimization target
3. Activity.onCreate()                      ← YOUR optimization target
4. Layout inflation & measure/layout        ← YOUR optimization target
5. First frame rendered (TTID)              ← The metric that matters
\`\`\`

**Key metrics:**
- **TTID (Time To Initial Display):** Time until the first frame is drawn. Reported in Logcat as "Displayed" time.
- **TTFD (Time To Full Display):** Time until all async data is loaded and the full UI is visible.

**Optimization strategies:**
1. **Lazy initialization:** Don't initialize everything in Application.onCreate(). Use the App Startup library for on-demand initialization.
2. **Background initialization:** Move non-critical init to background threads.
3. **Baseline Profiles:** AOT-compile critical code paths for 30-40% faster startup.
4. **Reduce layout complexity:** Fewer nested layouts = faster inflate and measure.
5. **Splash screen:** Use the SplashScreen API (Android 12+) to provide instant visual feedback.`,
    codeExample: `// BAD: Heavy initialization in Application ❌
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Each of these blocks the main thread!
        Analytics.init(this)        // 200ms
        CrashReporting.init(this)   // 100ms
        ImageLoader.init(this)      // 150ms
        Database.init(this)         // 300ms
        // Total: 750ms blocked on main thread! 
    }
}

// GOOD: Lazy + background initialization ✅
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Only critical, fast initializations on main thread
        CrashReporting.init(this) // Must be first for crash capture

        // Everything else: lazy or background
        ProcessLifecycleOwner.get().lifecycle.addObserver(
            object : DefaultLifecycleObserver {
                override fun onCreate(owner: LifecycleOwner) {
                    CoroutineScope(Dispatchers.Default).launch {
                        Analytics.init(this@MyApplication)
                        ImageLoader.init(this@MyApplication)
                    }
                }
            }
        )
    }
}

// App Startup Library — declarative lazy initialization
class AnalyticsInitializer : Initializer<Analytics> {
    override fun create(context: Context): Analytics {
        return Analytics.Builder(context).build()
    }
    override fun dependencies(): List<Class<out Initializer<*>>> {
        return listOf(CrashReportingInitializer::class.java)
    }
}

// Baseline Profiles — critical for startup optimization
// baseline-prof.txt in app/src/main/
// Tells ART to AOT-compile these methods
// HSPLcom/myapp/MainActivity;->onCreate(Landroid/os/Bundle;)V
// Generated via Macrobenchmark:
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule
    val rule = BaselineProfileRule()

    @Test
    fun generateBaselineProfile() {
        rule.collect(packageName = "com.myapp") {
            startActivityAndWait()
            // Navigate through critical user journeys
            device.findObject(By.text("Login")).click()
            device.waitForIdle()
        }
    }
}`,
    exercise: `**Practice:**
1. Profile your app's cold start time using \`adb shell am start -S -W\`
2. Implement lazy initialization using the App Startup library
3. Generate a Baseline Profile and measure the startup improvement
4. Identify 3 things in your Application.onCreate() that can be deferred
5. Explain the SplashScreen API vs a custom splash Activity
6. What is the Zygote process and how does it speed up app creation?`,
    commonMistakes: [
      "Initializing all SDKs synchronously in Application.onCreate() — this is the #1 cause of slow cold starts",
      "Using a custom splash Activity instead of the SplashScreen API — adds an extra Activity creation to the startup path",
      "Not measuring startup time properly — use Macrobenchmark, not manual timing",
      "Ignoring Baseline Profiles — they can improve startup by 30-40% with minimal effort",
    ],
    interviewQuestions: [
      {
        type: "scenario",
        q: "Your app's cold start takes 2.5 seconds. How do you diagnose and fix it?",
        a: "1) **Measure:** Run `adb shell am start -S -W com.myapp/.MainActivity` to get exact TTID. 2) **Profile:** Use Android Studio's CPU profiler during startup to see which methods take longest. 3) **Common fixes:** (a) Move SDK inits to background thread or lazy init. (b) Reduce layout complexity — use ConstraintLayout or Compose. (c) Generate Baseline Profiles for 30-40% improvement. (d) Use R8 full mode for smaller DEX. (e) Defer image loading with placeholders. 4) **Verify:** Use Macrobenchmark to get statistical startup measurements. Target: < 500ms cold start."
      },
      {
        type: "conceptual",
        q: "What are Baseline Profiles and why are they significant for startup?",
        a: "Baseline Profiles are lists of critical code paths that ART should AOT-compile at install time (via cloud profiles on Play Store or locally). Without them, ART uses JIT compilation on first run — methods are interpreted until they're compiled, causing jank. With Baseline Profiles, the critical startup path is pre-compiled to native code. Impact: 30-40% faster startup, smoother first-run experience. Google apps like Maps and Play Store use them extensively. They're generated via Macrobenchmark tests that exercise key user journeys."
      },
    ],
  },
  {
    id: "process-memory-management",
    title: "Process & Memory Management",
    explanation: `**Android's memory management** directly impacts app stability, performance, and whether the OS kills your process. Senior engineers must understand how ART's garbage collector works and how to prevent memory issues.

**Android's memory model:**
- Each app runs in its own Linux process with its own instance of ART
- Each process has a **heap limit** (typically 256-512MB depending on device)
- The system has a **Low Memory Killer (LMK)** daemon that kills processes when RAM is low
- Process priority determines kill order (foreground → visible → service → cached)

**ART Garbage Collection:**
- Uses **Concurrent Copying GC** (Android 8.0+) — moves objects while app runs
- GC roots: stack variables, static fields, JNI references, active threads
- Pause times typically < 1ms (huge improvement over Dalvik's stop-the-world GC)

**Memory types in Android:**
- **Java Heap:** Objects created in Kotlin/Java. Counted toward heap limit.
- **Native Heap:** Memory allocated via NDK (malloc). Not counted toward Java heap limit but limited by system RAM.
- **Graphics Memory:** Bitmaps, textures (GPU). Major contributor to OOM since large images can consume tens of MB.
- **Stack:** Thread stacks (typically 1MB each). More threads = more stack memory.

**Common memory issues:**
1. **Memory Leak:** Objects held beyond their useful life → steadily increasing heap
2. **OOM (OutOfMemoryError):** Heap limit exceeded, usually from large bitmaps or leaked Activities
3. **GC thrashing:** Rapid allocation and deallocation causing frequent GC pauses

**Profiling tools:**
- Android Studio Memory Profiler — live heap inspection
- LeakCanary — automatic leak detection in debug builds
- \`adb shell dumpsys meminfo <package>\` — process memory breakdown`,
    codeExample: `// Common memory leak patterns and fixes

// LEAK 1: Static reference to Activity ❌
object DataCache {
    var callback: ((String) -> Unit)? = null // Holds Activity reference!
}
class LeakyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataCache.callback = { data -> textView.text = data } // Leak!
    }
    // Fix: clear in onDestroy OR use WeakReference
}

// LEAK 2: Inner class holding outer reference ❌
class LeakyActivity2 : AppCompatActivity() {
    inner class MyTask : Runnable { // inner class holds ref to Activity
        override fun run() { /* long-running task */ }
    }
    // Fix: Use static nested class or top-level class
}

// LEAK 3: Handler message queue ❌
class LeakyActivity3 : AppCompatActivity() {
    private val handler = Handler(Looper.getMainLooper())
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handler.postDelayed({ updateUI() }, 60_000) // Holds ref for 60s
    }
    // Fix: Remove callbacks in onDestroy
    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }
}

// Proper bitmap handling to prevent OOM
suspend fun loadBitmap(context: Context, uri: Uri, reqWidth: Int, reqHeight: Int): Bitmap {
    return withContext(Dispatchers.IO) {
        // Step 1: Decode bounds only (no memory allocation)
        val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        context.contentResolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, options)
        }
        // Step 2: Calculate sample size for downscaling
        options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight)
        options.inJustDecodeBounds = false
        // Step 3: Decode with downscaled dimensions
        context.contentResolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, options)
        } ?: throw IOException("Cannot open stream")
    }
}

// LeakCanary setup (debug builds only)
// Add to build.gradle: debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.x'
// LeakCanary auto-initializes and watches Activities, Fragments, Views, ViewModels`,
    exercise: `**Practice:**
1. Set up LeakCanary and intentionally create a memory leak, then trace it
2. Use Android Studio Memory Profiler to capture a heap dump and find retained objects
3. Explain the difference between shallow size and retained size in a heap dump
4. Write a bitmap loading function that prevents OOM by downsampling
5. Explain how Glide/Coil handle bitmap memory efficiently
6. Run \`adb shell dumpsys meminfo\` for your app and explain each memory category`,
    commonMistakes: [
      "Registering callbacks without unregistering — the most common cause of Activity leaks",
      "Loading full-resolution bitmaps into memory — a 12MP camera photo = ~48MB in memory, always downsample",
      "Creating anonymous inner classes that capture Activity references — use static nested classes or lambdas with weak references",
      "Not using LeakCanary in debug builds — memory leaks are silent until they crash",
    ],
    interviewQuestions: [
      {
        type: "scenario",
        q: "Users report your app is crashing with OOM on lower-end devices. How do you investigate?",
        a: "1) **Reproduce:** Test on a device/emulator with limited heap (e.g., 128MB). 2) **Profile:** Use Memory Profiler to track heap growth during typical usage. Look for steadily increasing heap = leak. 3) **Heap dump:** Capture and analyze retained objects. Look for multiple Activity instances, large Bitmap arrays. 4) **LeakCanary:** Run debug build to auto-detect leaks with reference chains. 5) **Common culprits:** (a) Un-recycled bitmaps — use Coil/Glide with lifecycle-aware loading. (b) Fragment back stack holding views. (c) Static references to Context. (d) EventBus/RxJava subscriptions not disposed. 6) **Fix and verify:** Patch leaks, add memory regression test with Macrobenchmark."
      },
      {
        type: "conceptual",
        q: "How does Android's Low Memory Killer (LMK) work?",
        a: "LMK is a kernel-level daemon that monitors available RAM. When free memory drops below configurable thresholds (minfree levels), LMK kills processes in priority order: (1) Empty/cached processes first (no components running). (2) Service processes next. (3) Visible processes. (4) Foreground process (last resort). Each threshold maps to an oom_adj score assigned by ActivityManagerService based on the process's component state. Developers can influence this by: ensuring critical work runs in foreground services (higher priority), calling Activity.finish() when done (allows process caching), and minimizing memory footprint to stay below device limits."
      },
    ],
  },
  {
    id: "android-os-internals",
    title: "How Android OS Works Internally",
    explanation: `**Understanding Android OS internals** separates senior engineers from mid-level ones. At Google, you're expected to reason about framework-level behavior when debugging complex issues.

**Boot sequence:**
\`\`\`
1. Bootloader → Linux Kernel
2. Kernel starts init process (PID 1)
3. init starts system daemons:
   - servicemanager (Binder registry)
   - surfaceflinger (compositing)
   - zygote (app process factory)
4. Zygote preloads Android classes & resources
5. Zygote forks system_server
6. system_server starts all Android services:
   - ActivityManagerService (AMS)
   - WindowManagerService (WMS)
   - PackageManagerService (PMS)
   - InputManagerService
7. AMS starts the Launcher app
\`\`\`

**Key system services:**
- **AMS (ActivityManagerService):** Manages Activity lifecycle, processes, tasks, and back stacks
- **WMS (WindowManagerService):** Manages windows, input dispatch, screen layout
- **PMS (PackageManagerService):** Manages installed packages, permissions, IntentFilters
- **SurfaceFlinger:** Composites all window surfaces into the final display frame

**Rendering pipeline:**
\`\`\`
App Process:
  UI Thread: measure → layout → draw (record display list)
  RenderThread: execute display list → OpenGL/Vulkan commands

System Process:
  SurfaceFlinger: composite all surfaces → display
\`\`\`

16.6ms per frame (60 FPS). If UI Thread + RenderThread exceed this budget → dropped frame (jank).

**Threading model:**
- **Main/UI Thread:** All UI operations, lifecycle callbacks. Blocking = ANR after 5 seconds.
- **RenderThread:** Executes GPU commands. Introduced in Android 5.0 to offload GPU work from UI thread.
- **Binder threads:** Handle IPC calls (pool of 15-16 threads per process).
- **Worker threads:** Your coroutines, AsyncTask (deprecated), executors.`,
    codeExample: `// Understanding the rendering pipeline
// The Choreographer coordinates frame rendering at VSYNC boundaries

// Check for jank using Choreographer
class JankDetector {
    private var lastFrameTime = 0L
    
    fun start() {
        Choreographer.getInstance().postFrameCallback(object : Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                if (lastFrameTime > 0) {
                    val frameMs = (frameTimeNanos - lastFrameTime) / 1_000_000
                    if (frameMs > 16) {
                        Log.w("Jank", "Frame took \${frameMs}ms (budget: 16ms)")
                    }
                }
                lastFrameTime = frameTimeNanos
                Choreographer.getInstance().postFrameCallback(this)
            }
        })
    }
}

// StrictMode — detect main thread violations during development
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            StrictMode.setThreadPolicy(
                StrictMode.ThreadPolicy.Builder()
                    .detectDiskReads()
                    .detectDiskWrites()
                    .detectNetwork()
                    .penaltyLog()       // Log violations
                    .penaltyFlashScreen() // Flash screen on violation
                    .build()
            )
            StrictMode.setVmPolicy(
                StrictMode.VmPolicy.Builder()
                    .detectLeakedSqlLiteObjects()
                    .detectLeakedClosableObjects()
                    .detectActivityLeaks()
                    .penaltyLog()
                    .build()
            )
        }
    }
}

// Understanding Looper/Handler/MessageQueue
// Main thread runs a Looper that processes Messages from a MessageQueue
// Every lifecycle callback, touch event, and invalidate() is a Message

// How ANR happens:
// 1. System sends an input event message to your app's MessageQueue
// 2. If the current message is blocking (heavy computation, disk I/O)
// 3. The input event waits in the queue
// 4. After 5 seconds, AMS triggers ANR dialog`,
    exercise: `**Practice:**
1. Trace the Android boot sequence from bootloader to Launcher
2. Explain what happens at the OS level when you rotate your device
3. Use \`adb shell dumpsys activity activities\` to inspect the Activity stack
4. Enable StrictMode and identify main thread violations in your app
5. Explain the role of SurfaceFlinger in the rendering pipeline
6. What's the maximum number of Binder threads per process? Why does it matter?`,
    commonMistakes: [
      "Assuming the UI thread is only for drawing — it also handles lifecycle callbacks, input events, and Binder calls",
      "Not understanding that each VSYNC signal triggers a frame render — if your frame isn't ready, it's a dropped frame",
      "Ignoring Binder thread limits — if all 15-16 threads are busy with IPC calls, new IPC calls will block",
      "Thinking Android services run in separate threads — Services run on the main thread by default",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "Explain what happens at the OS level when an ANR occurs.",
        a: "1) The Input Dispatcher in system_server sends a touch/key event to your app via input channel. 2) It starts a 5-second timer. 3) If the app doesn't acknowledge the event within 5 seconds (because the main thread is blocked), InputDispatcher notifies AMS. 4) AMS checks if the app is in the foreground. 5) If yes, AMS dumps the main thread's stack trace to /data/anr/traces.txt. 6) AMS shows the ANR dialog to the user. **Common causes:** disk I/O on main thread, heavy computation, deadlocked threads, slow Binder calls. **Debug:** Check traces.txt for the blocked thread's stack trace."
      },
      {
        type: "tricky",
        q: "Why does Android use a single-threaded UI model?",
        a: "Thread safety. The View toolkit is not thread-safe — Views can be modified only from the thread that created them (the main thread). This is by design: (1) Making the toolkit thread-safe would add locking overhead to EVERY View operation (measure, layout, draw), degrading performance. (2) Concurrent modification of the View tree would create race conditions and visual artifacts. (3) A single-threaded model is simpler to reason about and debug. The trade-off: heavy work must be moved off the main thread (coroutines, executors). This is why CalledFromWrongThreadException exists."
      },
    ],
  },
];

export default androidPhase2b;
