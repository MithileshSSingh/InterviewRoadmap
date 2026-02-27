const androidPhase4 = {
  id: "phase-4",
  title: "Phase 4: Kotlin Mastery (Senior Level)",
  emoji: "🟣",
  description: "Master Kotlin's advanced features — coroutines internals, Flow, structured concurrency, DSL building, and advanced type system patterns.",
  topics: [
    {
      id: "coroutines-internals",
      title: "Coroutines Internals & CPS Transformation",
      explanation: `**Kotlin Coroutines** are the foundation of async programming in modern Android. At the senior level, you need to understand how they work under the hood — not just how to use them.

**How coroutines work internally:**
The Kotlin compiler transforms \`suspend\` functions using **Continuation-Passing Style (CPS)**. Each suspend function receives a hidden \`Continuation\` parameter and is compiled into a state machine.

**CPS Transformation:**
\`\`\`
// What you write:
suspend fun fetchUser(): User {
    val token = getToken()       // suspension point 1
    val user = getUser(token)    // suspension point 2
    return user
}

// What the compiler generates (simplified):
fun fetchUser(continuation: Continuation<User>): Any? {
    val sm = continuation as? FetchUserSM ?: FetchUserSM(continuation)
    when (sm.label) {
        0 -> {
            sm.label = 1
            val result = getToken(sm) // may return COROUTINE_SUSPENDED
            if (result == COROUTINE_SUSPENDED) return COROUTINE_SUSPENDED
            sm.tokenResult = result
        }
        1 -> {
            sm.label = 2
            val result = getUser(sm.tokenResult, sm)
            if (result == COROUTINE_SUSPENDED) return COROUTINE_SUSPENDED
            sm.userResult = result
        }
        2 -> return sm.userResult
    }
}
\`\`\`

**Key concepts:**
- **Continuation:** A callback that knows how to resume the coroutine. Contains the state machine and label.
- **COROUTINE_SUSPENDED:** A sentinel value. If a suspend call returns this, the coroutine is suspended.
- **CoroutineDispatcher:** Determines which thread the coroutine runs on (Main, IO, Default).
- **Job:** A handle to the coroutine's lifecycle. Can be cancelled.
- **CoroutineScope:** Defines the lifecycle for coroutines. Cancelling the scope cancels all its coroutines.`,
      codeExample: `// Coroutine basics — what's happening under the hood
import kotlinx.coroutines.*

// suspend function — compiler generates a state machine
suspend fun fetchData(): String {
    delay(1000) // Suspension point: releases thread, resumes after 1s
    return "data"
}

// CoroutineScope defines the lifecycle
class MyViewModel : ViewModel() {
    fun loadData() {
        // viewModelScope auto-cancels when ViewModel is cleared
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val data = fetchData()
                withContext(Dispatchers.Main) {
                    _uiState.value = UiState.Success(data)
                }
            } catch (e: CancellationException) {
                throw e // NEVER catch CancellationException!
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "")
            }
        }
    }
}

// Dispatchers explained
// Dispatchers.Main    → Main/UI thread (single thread)
// Dispatchers.IO      → Thread pool for IO (64 threads default)
// Dispatchers.Default → Thread pool for CPU (cores count)
// Dispatchers.Unconfined → Runs in caller's thread until first suspension

// Coroutine context elements
val context = Job() +                    // Lifecycle
    Dispatchers.IO +                     // Thread
    CoroutineName("fetchData") +         // Debug name
    CoroutineExceptionHandler { _, e ->  // Error handler
        Log.e("Coroutine", "Failed", e)
    }

// Structured concurrency — parent-child relationship
suspend fun fetchUserAndPosts(userId: String): UserWithPosts {
    return coroutineScope {
        // Both run in parallel, if one fails both are cancelled
        val userDeferred = async { api.getUser(userId) }
        val postsDeferred = async { api.getPosts(userId) }
        UserWithPosts(userDeferred.await(), postsDeferred.await())
    }
}`,
      exercise: `**Practice:**
1. Explain CPS transformation — how does the compiler convert a suspend function into a state machine?
2. What is COROUTINE_SUSPENDED and when is it returned?
3. Explain the difference between launch and async
4. Why is Dispatchers.IO limited to 64 threads? What happens if all are busy?
5. Write a coroutine that fetches data from 3 APIs in parallel with a 5-second timeout`,
      commonMistakes: [
        "Catching CancellationException — this breaks structured concurrency. Always rethrow it.",
        "Using GlobalScope — no lifecycle awareness, coroutines run forever. Use viewModelScope or lifecycleScope.",
        "Blocking the main thread with runBlocking — defeats the purpose of coroutines, causes ANR.",
        "Not using withContext(Dispatchers.IO) for IO operations — running network/disk on Default dispatcher starves CPU work.",
        "Creating a new CoroutineScope without managing its lifecycle — leads to leaked coroutines.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do Kotlin coroutines work under the hood?",
          a: "The Kotlin compiler transforms suspend functions using **CPS (Continuation-Passing Style)**. Each suspend function is compiled into a state machine where each suspension point is a label/state. A hidden Continuation parameter is added to the function signature. When a suspend call actually suspends (returns COROUTINE_SUSPENDED), the continuation is stored, and the current thread is released. When the async operation completes, the continuation's resumeWith() is called, which re-enters the state machine at the saved label. The dispatcher determines which thread the continuation resumes on."
        },
        {
          type: "tricky",
          q: "What's the difference between coroutineScope and supervisorScope?",
          a: "**coroutineScope:** If any child fails, ALL siblings are cancelled, and the failure propagates to the parent. Use for operations where partial results are useless (fetch user + permissions together). **supervisorScope:** If one child fails, other children continue running. The failure does NOT propagate to siblings. Use for independent parallel operations (loading feed items where one failure shouldn't stop others). Key: in supervisorScope, you must handle errors in each child individually using try-catch or CoroutineExceptionHandler."
        },
      ],
    },
    {
      id: "structured-concurrency",
      title: "Structured Concurrency",
      explanation: `**Structured concurrency** is the principle that a coroutine's lifetime is bounded by its scope. When a scope is cancelled, all its child coroutines are cancelled. When a child fails, the parent is notified.

**Why it matters:**
Without structured concurrency (like raw threads), you get:
- Leaked threads that run after the component is destroyed
- No automatic cleanup on errors
- Manual lifecycle management for every async operation

**The job hierarchy:**
\`\`\`
viewModelScope.launch (parent Job)
  ├── async { fetchUser() }      (child Job 1)
  ├── async { fetchPosts() }     (child Job 2)
  └── launch { logAnalytics() }  (child Job 3)
\`\`\`

If viewModelScope is cancelled → all three children are cancelled.
If child Job 1 fails → siblings 2 and 3 are cancelled (in regular scope), parent is cancelled.

**Cancellation propagation rules:**
1. Parent cancellation → All children cancelled
2. Child failure → Parent cancelled → All siblings cancelled (coroutineScope)
3. Child failure → Only failed child cancelled, others continue (supervisorScope)

**Cooperative cancellation:** Coroutines must cooperate by checking \`isActive\` or using cancellable functions. \`delay()\`, \`yield()\`, and all \`kotlinx.coroutines\` functions check for cancellation automatically. CPU-bound loops must check manually with \`ensureActive()\`.`,
      codeExample: `// Structured concurrency in action
class DataSyncManager(
    private val scope: CoroutineScope // Injected scope with lifecycle
) {
    private var syncJob: Job? = null
    
    fun startSync() {
        syncJob?.cancel() // Cancel previous sync
        syncJob = scope.launch {
            // All children are bounded by this scope
            
            // Parallel but dependent — if one fails, cancel all
            coroutineScope {
                launch { syncUsers() }
                launch { syncPosts() }
                launch { syncComments() }
            }
            // Only reaches here if ALL three succeed
            markSyncComplete()
        }
    }
    
    fun stopSync() {
        syncJob?.cancel() // Cancels everything cleanly
    }
}

// Cooperative cancellation — CPU-bound work
suspend fun processLargeList(items: List<Item>) {
    for (item in items) {
        ensureActive() // Check if cancelled before each iteration
        processItem(item) // If scope cancelled, throws CancellationException
    }
}

// NonCancellable — for cleanup that must complete
suspend fun saveAndCleanup(data: Data) {
    try {
        saveToNetwork(data)
    } finally {
        // Even if cancelled, cleanup must run
        withContext(NonCancellable) {
            saveToLocalDb(data) // Won't be cancelled
            closeConnections()
        }
    }
}

// Timeout with structured concurrency
suspend fun fetchWithTimeout(): Result<Data> {
    return try {
        withTimeout(5000) { // Cancels after 5 seconds
            val data = api.fetch()
            Result.success(data)
        }
    } catch (e: TimeoutCancellationException) {
        Result.failure(e) // Timeout is a specific CancellationException
    }
}

// SupervisorScope — independent children
suspend fun loadDashboard(): Dashboard {
    return supervisorScope {
        val weather = async { 
            try { api.getWeather() } catch (e: Exception) { null }
        }
        val news = async { 
            try { api.getNews() } catch (e: Exception) { emptyList() }
        }
        val stocks = async { 
            try { api.getStocks() } catch (e: Exception) { emptyList() }
        }
        // Each can fail independently — others continue
        Dashboard(weather.await(), news.await(), stocks.await())
    }
}`,
      exercise: `**Practice:**
1. Explain the job hierarchy and how cancellation propagates through it
2. Write a coroutine that processes a large list with cooperative cancellation
3. Implement a retry mechanism using structured concurrency (max 3 retries, exponential backoff)
4. Explain when to use NonCancellable and why it's important in finally blocks
5. Design a data sync system that uses supervisorScope for independent sync operations`,
      commonMistakes: [
        "Not checking for cancellation in CPU-bound loops — the coroutine keeps running even after the scope is cancelled",
        "Using try-catch in finally without NonCancellable — suspend functions in finally block are cancelled immediately",
        "Creating unstructured coroutines with GlobalScope in ViewModel — they outlive the ViewModel",
        "Not understanding that delay() checks for cancellation — it throws CancellationException if the coroutine is cancelled",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is structured concurrency and why is it important?",
          a: "Structured concurrency guarantees that: (1) A coroutine's lifetime is bounded by its scope — no leaked coroutines. (2) When a scope is cancelled, all children are cancelled automatically. (3) A parent waits for all children to complete before completing itself. (4) Failures propagate to the parent for centralized error handling. This eliminates the class of bugs from unmanaged threads: leaked operations, orphaned callbacks, resource cleanup failures. In Android, viewModelScope and lifecycleScope provide structured concurrency tied to component lifecycles."
        },
        {
          type: "coding",
          q: "Implement a retry mechanism with exponential backoff using structured concurrency.",
          a: "```kotlin\nsuspend fun <T> retry(\n    times: Int = 3,\n    initialDelay: Long = 1000,\n    factor: Double = 2.0,\n    block: suspend () -> T\n): T {\n    var currentDelay = initialDelay\n    repeat(times - 1) {\n        try {\n            return block()\n        } catch (e: Exception) {\n            if (e is CancellationException) throw e\n            delay(currentDelay)\n            currentDelay = (currentDelay * factor).toLong()\n        }\n    }\n    return block() // Last attempt — let exception propagate\n}\n// Usage: val data = retry { api.fetchData() }\n```"
        },
      ],
    },
    {
      id: "flow-cold-hot",
      title: "Flow: Cold vs Hot Streams",
      explanation: `**Kotlin Flow** is the reactive streams API for Kotlin coroutines. Understanding the difference between cold and hot flows is essential at the senior level.

**Cold Flow (Flow<T>):**
- Created with \`flow { }\` builder
- Code inside runs ONLY when a collector starts collecting
- Each collector gets its own independent emission
- Like a function — executes per call

**Hot Flow (SharedFlow / StateFlow):**
- Active regardless of collectors
- All collectors receive the same emissions
- Like a broadcast — anyone can tune in
- SharedFlow: no initial value, configurable replay
- StateFlow: always has a current value (like LiveData), replay of 1

**StateFlow vs SharedFlow:**
| Feature | StateFlow | SharedFlow |
|---------|-----------|------------|
| Initial value | Required | Not required |
| Replay | Always 1 | Configurable (0 to N) |
| Equality check | Skips duplicate values | Emits all values |
| Use case | UI state | Events, one-time triggers |

**StateFlow vs LiveData:**
StateFlow requires an initial value, works with coroutines natively, supports operators (map, filter), and doesn't depend on Android lifecycle awareness (use \`repeatOnLifecycle\` instead).`,
      codeExample: `// Cold Flow — executes per collector
fun getNumbers(): Flow<Int> = flow {
    println("Flow started") // Runs when collect() is called
    for (i in 1..5) {
        delay(100)
        emit(i) // Suspends until collector processes the value
    }
}

// Each collect() runs the flow independently
launch { getNumbers().collect { println("A: \$it") } } // Flow started, 1,2,3,4,5
launch { getNumbers().collect { println("B: \$it") } } // Flow started, 1,2,3,4,5

// Hot Flow — StateFlow for UI state
@HiltViewModel
class SearchViewModel @Inject constructor(
    private val repository: SearchRepository
) : ViewModel() {
    
    private val _query = MutableStateFlow("")
    
    val searchResults: StateFlow<SearchUiState> = _query
        .debounce(300) // Wait 300ms after last keystroke
        .distinctUntilChanged() // Skip if same query
        .flatMapLatest { query -> // Cancel previous search
            if (query.isEmpty()) flowOf(SearchUiState.Empty)
            else repository.search(query)
                .map { SearchUiState.Results(it) as SearchUiState }
                .onStart { emit(SearchUiState.Loading) }
                .catch { emit(SearchUiState.Error(it.message ?: "")) }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = SearchUiState.Empty
        )
    
    fun onQueryChanged(query: String) { _query.value = query }
}

// SharedFlow — for one-time events (navigation, snackbar)
class EventViewModel : ViewModel() {
    private val _events = MutableSharedFlow<UiEvent>()
    val events: SharedFlow<UiEvent> = _events.asSharedFlow()
    
    fun onSaveClicked() {
        viewModelScope.launch {
            try {
                repository.save()
                _events.emit(UiEvent.ShowSnackbar("Saved!"))
                _events.emit(UiEvent.NavigateBack)
            } catch (e: Exception) {
                _events.emit(UiEvent.ShowSnackbar("Error: \${e.message}"))
            }
        }
    }
}

// Collecting in Compose — lifecycle-aware
@Composable
fun SearchScreen(viewModel: SearchViewModel = hiltViewModel()) {
    val state by viewModel.searchResults.collectAsStateWithLifecycle()
    // collectAsStateWithLifecycle automatically handles lifecycle
}

// Collecting in Activity/Fragment
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.searchResults.collect { state -> updateUI(state) }
    }
}`,
      exercise: `**Practice:**
1. Implement a search feature with debounce using StateFlow and flatMapLatest
2. Create a SharedFlow-based event system for one-time UI events
3. Convert a callback-based API to a Flow using callbackFlow
4. Explain when to use SharingStarted.WhileSubscribed vs SharingStarted.Eagerly
5. Implement a Flow that combines data from two sources using combine()`,
      commonMistakes: [
        "Using StateFlow for one-time events (navigation, snackbar) — StateFlow replays the last value on new collectors, causing duplicate events",
        "Not using collectAsStateWithLifecycle in Compose — collect() doesn't respect lifecycle, wastes resources when app is backgrounded",
        "Using SharedFlow with replay=1 when StateFlow is better — StateFlow has built-in conflation and equality checks",
        "Not handling backpressure in hot flows — fast emitter + slow collector can cause memory issues",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the difference between cold and hot flows with a real-world analogy.",
          a: "**Cold Flow** is like a Netflix movie — each viewer (collector) gets their own independent playback from the beginning. The movie doesn't play until someone hits play. **Hot Flow** is like a live TV broadcast — it's always on. Viewers (collectors) see whatever is currently airing. StateFlow is like a news ticker that always shows the latest headline. SharedFlow is like a radio station — listeners hear the same signal. In Android: database queries are cold flows (each observer gets fresh data), UI state is a StateFlow (always has current value), one-time events (navigation) use SharedFlow."
        },
        {
          type: "tricky",
          q: "Why does SharingStarted.WhileSubscribed(5000) use a 5-second delay?",
          a: "The 5-second stopTimeout handles configuration changes gracefully. During rotation: (1) Activity is destroyed — all collectors stop. (2) Without the timeout, the upstream Flow would be cancelled immediately. (3) Activity recreates and re-subscribes within ~1 second. (4) With 5-second delay, the upstream keeps running, so the new Activity gets cached data instantly — no re-fetch. If the user actually leaves (home button), the upstream cancels after 5 seconds, saving resources. This is specifically designed for Android's lifecycle: survive config changes, but clean up when truly backgrounded."
        },
      ],
    },
    {
      id: "coroutine-exception-handling",
      title: "Exception & Cancellation Handling in Coroutines",
      explanation: `**Exception handling in coroutines** is one of the most misunderstood topics. The rules are different from regular try-catch, and getting them wrong leads to silent failures or crashes.

**Key rules:**
1. Exceptions in \`launch\` propagate to the parent — crash if unhandled
2. Exceptions in \`async\` are stored and rethrown on \`.await()\`
3. \`CancellationException\` is NEVER propagated — it's used for normal cancellation
4. \`CoroutineExceptionHandler\` catches exceptions from \`launch\` only (not \`async\`)
5. In \`supervisorScope\`, child failures don't propagate to siblings

**Exception propagation:**
\`\`\`
launch {                    // Exception propagates UP immediately
    throw RuntimeException() // → parent Job cancelled → ALL siblings cancelled
}

async {
    throw RuntimeException() // Exception stored until await() is called
}
\`\`\`

**The CancellationException trap:**
CancellationException is a special exception used for coroutine cancellation. If you catch it, you break structured concurrency — the coroutine won't cancel properly. ALWAYS rethrow it.

**CoroutineExceptionHandler:**
Only works on top-level coroutines (root coroutines started with \`launch\`). Does NOT work with \`async\` or nested coroutines.`,
      codeExample: `// Exception handling patterns

// Pattern 1: try-catch in the coroutine body
viewModelScope.launch {
    try {
        val data = repository.fetchData() // throws IOException
        _state.value = UiState.Success(data)
    } catch (e: CancellationException) {
        throw e // ALWAYS rethrow!
    } catch (e: Exception) {
        _state.value = UiState.Error(e.message ?: "Unknown error")
    }
}

// Pattern 2: CoroutineExceptionHandler for top-level launch
val handler = CoroutineExceptionHandler { _, exception ->
    Log.e("Coroutine", "Unhandled: \${exception.message}")
    _state.value = UiState.Error(exception.message ?: "")
}
viewModelScope.launch(handler) {
    repository.fetchData() // If this throws, handler catches it
}

// Pattern 3: Result type for clean error handling
sealed interface DataResult<out T> {
    data class Success<T>(val data: T) : DataResult<T>
    data class Error(val exception: Throwable) : DataResult<Nothing>
}

suspend fun <T> safeApiCall(block: suspend () -> T): DataResult<T> {
    return try {
        DataResult.Success(block())
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        DataResult.Error(e)
    }
}

// Usage
viewModelScope.launch {
    when (val result = safeApiCall { api.getUser(id) }) {
        is DataResult.Success -> _state.value = UiState.Loaded(result.data)
        is DataResult.Error -> _state.value = UiState.Failed(result.exception.message)
    }
}

// SupervisorScope for independent operations
viewModelScope.launch {
    supervisorScope {
        // Each child handles its own errors
        val feed = async {
            try { api.getFeed() } catch (e: Exception) { emptyList() }
        }
        val profile = async {
            try { api.getProfile() } catch (e: Exception) { null }
        }
        _state.value = HomeState(feed.await(), profile.await())
    }
}`,
      exercise: `**Practice:**
1. Explain why catching CancellationException breaks structured concurrency
2. Implement a safeApiCall wrapper that handles all exceptions properly
3. What happens if an exception is thrown inside an async block but await() is never called?
4. Design an error handling strategy for a ViewModel with 5 concurrent API calls
5. Explain the difference between try-catch and CoroutineExceptionHandler`,
      commonMistakes: [
        "Catching all exceptions including CancellationException — breaks cancellation. Use catch(e: Exception) and rethrow CancellationException.",
        "Using CoroutineExceptionHandler with async — it doesn't work, exceptions are only rethrown on await()",
        "Not handling exceptions in supervisorScope children — they fail silently without try-catch",
        "Assuming try-catch around launch catches exceptions — it doesn't, the exception propagates to the parent Job",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What happens if you wrap a launch in try-catch? Does the catch block execute?",
          a: "**No.** `launch` returns immediately with a Job. The exception happens inside the coroutine, which propagates UP through the Job hierarchy to the parent scope. The try-catch around `launch` is useless for coroutine exceptions. The correct approaches: (1) Put try-catch INSIDE the launch block. (2) Use CoroutineExceptionHandler in the launch context. (3) Use supervisorScope if you want to prevent propagation. The exception with `async`: it IS caught by try-catch around `.await()` — because await() rethrows the stored exception synchronously."
        },
        {
          type: "conceptual",
          q: "Design an error handling strategy for a production Android app using coroutines.",
          a: "Layered approach: (1) **Repository layer:** Use Result<T> or sealed class to wrap API/DB errors. Never throw from repository methods. (2) **ViewModel layer:** Map Result to UiState (Success/Error). Use safeApiCall wrapper. (3) **Global handler:** CoroutineExceptionHandler on viewModelScope for unexpected errors → log to crash reporting. (4) **Cancellation:** Always rethrow CancellationException. Use ensureActive() in loops. (5) **Retry:** Implement retry with backoff at the repository level. (6) **Timeout:** Use withTimeout for network calls. This ensures: no silent failures, clean UI error states, proper cancellation, and crash reporting for unexpected errors."
        },
      ],
    },
    {
      id: "kotlin-advanced-features",
      title: "Advanced Kotlin: Inline, Reified, DSLs & Sealed Types",
      explanation: `**Advanced Kotlin features** are what separate a senior Kotlin developer from someone who just writes "Java in Kotlin." These features enable type-safe DSLs, zero-overhead abstractions, and exhaustive state modeling.

**Inline Functions:**
The compiler copies the function body to the call site, eliminating the overhead of function calls and lambda object creation. Critical for high-order functions used in hot paths.

**Reified Type Parameters:**
Only available in inline functions. The type parameter is available at runtime (unlike regular generics which are erased). Enables \`is T\` checks, \`T::class\` references, and inline function-specific APIs.

**DSL Building:**
Kotlin's extension functions + lambda with receiver + @DslMarker create type-safe domain-specific languages. Used in Compose, Gradle build scripts, Ktor routing, and more.

**Sealed Classes/Interfaces:**
Model restricted class hierarchies. The compiler knows all subtypes, enabling exhaustive \`when\` expressions. Essential for modeling UI state, results, and navigation events.

**Value Classes (inline classes):**
Wrapper types with zero runtime overhead. The compiler removes the wrapper at runtime. Use for type-safe wrappers around primitive types.`,
      codeExample: `// Inline function — eliminates lambda allocation overhead
inline fun <T> measureTime(block: () -> T): Pair<T, Long> {
    val start = System.nanoTime()
    val result = block() // Inlined at call site, no lambda object created
    val duration = (System.nanoTime() - start) / 1_000_000
    return result to duration
}

// Reified — type parameter available at runtime
inline fun <reified T> Intent.getParcelableExtraCompat(key: String): T? {
    return if (Build.VERSION.SDK_INT >= 33) {
        getParcelableExtra(key, T::class.java)
    } else {
        @Suppress("DEPRECATION")
        getParcelableExtra(key) as? T
    }
}

// Usage: val user = intent.getParcelableExtraCompat<User>("user")
// Without reified, you'd need to pass Class<T> explicitly

// DSL Building — type-safe builders
@DslMarker
annotation class NetworkDsl

@NetworkDsl
class RequestBuilder {
    var url: String = ""
    var method: String = "GET"
    private val headers = mutableMapOf<String, String>()
    private var body: String? = null
    
    fun headers(block: HeaderBuilder.() -> Unit) {
        HeaderBuilder(headers).apply(block)
    }
    fun body(content: String) { body = content }
    fun build() = Request(url, method, headers, body)
}

@NetworkDsl
class HeaderBuilder(private val headers: MutableMap<String, String>) {
    infix fun String.to(value: String) { headers[this] = value }
}

fun request(block: RequestBuilder.() -> Unit): Request {
    return RequestBuilder().apply(block).build()
}

// Usage — reads like natural language
val req = request {
    url = "https://api.example.com/users"
    method = "POST"
    headers {
        "Authorization" to "Bearer token123"
        "Content-Type" to "application/json"
    }
    body("""{"name": "Alice"}""")
}

// Sealed interface — exhaustive state modeling
sealed interface NetworkState<out T> {
    data object Idle : NetworkState<Nothing>
    data object Loading : NetworkState<Nothing>
    data class Success<T>(val data: T) : NetworkState<T>
    sealed interface Error : NetworkState<Nothing> {
        data class Network(val message: String) : Error
        data class Server(val code: Int, val message: String) : Error
        data class Auth(val reason: String) : Error
    }
}

// Exhaustive when — compiler ensures all cases handled
fun <T> handleState(state: NetworkState<T>) = when (state) {
    is NetworkState.Idle -> showIdle()
    is NetworkState.Loading -> showSpinner()
    is NetworkState.Success -> showData(state.data)
    is NetworkState.Error.Network -> showRetry(state.message)
    is NetworkState.Error.Server -> showServerError(state.code)
    is NetworkState.Error.Auth -> navigateToLogin()
    // No 'else' needed — compiler verifies exhaustiveness
}

// Value class — zero overhead type safety
@JvmInline
value class UserId(val value: String)

@JvmInline
value class Email(val value: String) {
    init { require(value.contains("@")) { "Invalid email" } }
}

fun getUser(id: UserId): User { /* ... */ }
// getUser(UserId("123"))  ← clear intent
// getUser("123")           ← compile error! Type safety without runtime cost`,
      exercise: `**Practice:**
1. Create an inline function with a reified type parameter for safe JSON parsing
2. Build a type-safe DSL for constructing SQL queries
3. Model a complete e-commerce order state machine using sealed interfaces
4. Create value classes for all your domain identifiers (UserId, OrderId, ProductId)
5. Explain what @DslMarker does and why it's important for nested DSLs`,
      commonMistakes: [
        "Overusing inline — only inline functions that take lambdas as parameters or use reified types. Inlining large functions increases bytecode size.",
        "Not using sealed classes for state — using enums or strings for states loses type safety and exhaustive checks",
        "Forgetting that reified only works with inline functions — the type must be known at the call site",
        "Using data class for value semantics when value class suffices — value classes have zero runtime overhead",
        "Not using @DslMarker — without it, nested DSL blocks can access parent scope's methods, creating confusing code",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between inline and regular functions? When should you use inline?",
          a: "Inline functions are expanded at the call site by the compiler — no function call overhead, no lambda object allocation. Use when: (1) The function takes lambda parameters — eliminates lambda object creation (significant in tight loops). (2) You need reified type parameters. (3) You need non-local returns from lambdas. **Don't use when:** the function body is large (increases bytecode), or there are no lambdas/reified types (no benefit). The `crossinline` modifier prevents non-local returns, `noinline` prevents inlining specific lambda parameters."
        },
        {
          type: "coding",
          q: "How would you model a payment state machine using sealed types?",
          a: "```kotlin\nsealed interface PaymentState {\n    data object Idle : PaymentState\n    data class Processing(val transactionId: String) : PaymentState\n    sealed interface Completed : PaymentState {\n        data class Success(val receiptId: String, val amount: Double) : Completed\n        data class Failed(val errorCode: Int, val message: String) : Completed\n        data class Refunded(val refundId: String) : Completed\n    }\n    data class RequiresAction(val actionType: String, val url: String) : PaymentState\n}\n// Nested sealed interfaces allow partial matching:\n// when (state) { is Completed -> ... } handles all completion states\n```"
        },
      ],
    },
  ],
};

export default androidPhase4;
