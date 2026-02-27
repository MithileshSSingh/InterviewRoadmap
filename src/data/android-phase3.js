const androidPhase3 = {
  id: "phase-3",
  title: "Phase 3: Modern Android Architecture",
  emoji: "🏗️",
  description: "Master production-grade architecture patterns — MVVM, MVI, Clean Architecture, modularization, dependency injection, and offline-first design.",
  topics: [
    {
      id: "mvvm-mvi-clean-architecture",
      title: "MVVM vs MVI vs Clean Architecture",
      explanation: `**Architecture patterns** define how you structure your code for maintainability, testability, and scalability. At the senior level, you must understand trade-offs and choose patterns based on project needs.

**MVVM (Model-View-ViewModel):**
Google's recommended pattern. The ViewModel exposes state via StateFlow/LiveData. The View observes and renders. Data flows unidirectionally.
\`\`\`
View (Compose/XML) ← observes ← ViewModel ← Repository ← DataSource
View → events → ViewModel → Repository → DataSource
\`\`\`

**MVI (Model-View-Intent):**
Stricter unidirectional flow. All state changes go through a single state machine. State is a single immutable object.
\`\`\`
View → Intent → Reducer → State → View
              ↑                  │
              └── Side Effects ──┘
\`\`\`

**Clean Architecture (Uncle Bob):**
Separates concerns into layers with strict dependency rules. Inner layers know nothing about outer layers.
\`\`\`
┌─────────────────────────────────────┐
│  Presentation (UI, ViewModel)       │  ← depends on →
├─────────────────────────────────────┤
│  Domain (Use Cases, Models)         │  ← NO dependencies (pure Kotlin) →
├─────────────────────────────────────┤
│  Data (Repository impl, API, DB)    │  ← depends on Domain →
└─────────────────────────────────────┘
\`\`\`

**When to use what:**
- **Small apps:** MVVM is sufficient
- **Complex state management:** MVI (e.g., multi-step forms, real-time updates)
- **Large team / long-lived app:** Clean Architecture for clear boundaries
- **Google's recommendation:** MVVM with UDF (Unidirectional Data Flow)`,
      codeExample: `// MVVM — Google's recommended approach
@HiltViewModel
class TaskViewModel @Inject constructor(
    private val repository: TaskRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<TaskUiState>(TaskUiState.Loading)
    val uiState: StateFlow<TaskUiState> = _uiState.asStateFlow()
    
    init { loadTasks() }
    
    private fun loadTasks() {
        viewModelScope.launch {
            repository.getTasks()
                .catch { _uiState.value = TaskUiState.Error(it.message ?: "") }
                .collect { _uiState.value = TaskUiState.Success(it) }
        }
    }
    
    fun toggleComplete(taskId: String) {
        viewModelScope.launch { repository.toggleComplete(taskId) }
    }
}

sealed interface TaskUiState {
    data object Loading : TaskUiState
    data class Success(val tasks: List<Task>) : TaskUiState
    data class Error(val message: String) : TaskUiState
}

// MVI — Strict unidirectional flow with intent/reducer
@HiltViewModel
class TaskMviViewModel @Inject constructor(
    private val repository: TaskRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(TaskState())
    val state: StateFlow<TaskState> = _state.asStateFlow()
    
    fun onIntent(intent: TaskIntent) {
        when (intent) {
            is TaskIntent.LoadTasks -> loadTasks()
            is TaskIntent.ToggleComplete -> toggleTask(intent.taskId)
            is TaskIntent.DeleteTask -> deleteTask(intent.taskId)
        }
    }
    
    private fun loadTasks() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            try {
                val tasks = repository.getTasksOneShot()
                _state.update { it.copy(isLoading = false, tasks = tasks) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }
}

data class TaskState(
    val isLoading: Boolean = false, 
    val tasks: List<Task> = emptyList(), 
    val error: String? = null
)

sealed interface TaskIntent {
    data object LoadTasks : TaskIntent
    data class ToggleComplete(val taskId: String) : TaskIntent
    data class DeleteTask(val taskId: String) : TaskIntent
}

// Clean Architecture — Domain Layer (pure Kotlin, no Android deps)
class GetFilteredTasksUseCase @Inject constructor(
    private val repository: TaskRepository // Interface, not impl
) {
    operator fun invoke(filter: TaskFilter): Flow<List<Task>> {
        return repository.getTasks().map { tasks ->
            when (filter) {
                TaskFilter.ALL -> tasks
                TaskFilter.ACTIVE -> tasks.filter { !it.isComplete }
                TaskFilter.COMPLETED -> tasks.filter { it.isComplete }
            }
        }
    }
}`,
      exercise: `**Practice:**
1. Implement the same feature (todo list) in MVVM, MVI, and Clean Architecture — compare the code
2. When would MVI be better than MVVM? Give a concrete example.
3. Explain the Dependency Rule in Clean Architecture — why can't Data import from Presentation?
4. How does the Repository pattern fit into Clean Architecture?
5. Design the architecture for a multi-feature app with 5 modules`,
      commonMistakes: [
        "Over-engineering small apps with Clean Architecture — adds unnecessary boilerplate for simple CRUD apps",
        "Putting Android framework classes in the Domain layer — Domain should be pure Kotlin with no Android dependencies",
        "Creating single-function Use Cases that just delegate to Repository — Use Cases should contain business logic",
        "Not using sealed classes for UI state — leads to impossible states (loading=true AND error!=null)",
        "Mixing concerns in ViewModel — it should only map domain data to UI state, not contain business logic",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why does Google recommend unidirectional data flow (UDF)?",
          a: "UDF means state flows DOWN (ViewModel → UI) and events flow UP (UI → ViewModel). Benefits: (1) **Single source of truth** — state is in one place (ViewModel), not scattered across Views. (2) **Predictable** — given the same state, the UI always looks the same. (3) **Testable** — test the ViewModel without the UI. (4) **Debuggable** — you can log every state change and reproduce bugs. (5) **Thread-safe** — StateFlow handles concurrency. Without UDF, state can become inconsistent when multiple components modify the UI independently."
        },
        {
          type: "tricky",
          q: "When would you NOT use Clean Architecture?",
          a: "Clean Architecture adds significant boilerplate (interfaces, mappers, use cases). Skip it when: (1) **Small app with 1-2 developers** — MVVM with Repository is sufficient. (2) **Prototype/MVP** — speed matters more than structure. (3) **Simple CRUD** — if use cases just delegate to repository, they add no value. (4) **Short-lived project** — migration and maintenance won't be a concern. Use Clean Architecture when: large team (>5 devs), long-lived product (3+ years), complex business logic, need to swap data sources. The key is pragmatism over dogma."
        },
      ],
    },
    {
      id: "modularization-strategies",
      title: "Modularization & Multi-Module Architecture",
      explanation: `**Modularization** splits a monolithic app into independent Gradle modules. At senior level, this is essential knowledge — all large Android apps at Google use multi-module architecture.

**Why modularize:**
1. **Build speed** — Only changed modules recompile. Parallel module compilation.
2. **Team scalability** — Teams own modules independently with clear boundaries.
3. **Code isolation** — Prevents accidental coupling, enforces API boundaries via \`internal\` visibility.
4. **Dynamic delivery** — Play Feature Delivery for on-demand modules.
5. **Reusability** — Shared modules (design system, analytics) across apps.

**Module types:**
\`\`\`
:app                    → Application module (thin, just wiring)
:feature:home           → Feature module (UI + ViewModel)
:feature:profile        → Feature module
:feature:settings       → Feature module
:core:data              → Data layer (repositories, data sources)
:core:domain            → Domain layer (use cases, models)
:core:network           → Network layer (Retrofit, interceptors)
:core:database          → Database layer (Room, DAOs)
:core:ui                → Shared UI components (design system)
:core:common            → Utilities, extensions
\`\`\`

**Dependency rules:**
- \`:feature:*\` → depends on \`:core:*\`
- \`:core:data\` → depends on \`:core:domain\`, \`:core:network\`, \`:core:database\`
- \`:core:domain\` → NO dependencies (pure Kotlin)
- \`:feature:*\` → does NOT depend on other \`:feature:*\` modules
- \`:app\` → depends on all \`:feature:*\` modules

**Navigation between features:** Since features can't depend on each other, cross-feature navigation uses: Navigation component with deep links, or a shared navigation module with route definitions.`,
      codeExample: `// settings.gradle.kts — Module structure
include(
    ":app",
    ":feature:home",
    ":feature:profile",
    ":feature:settings",
    ":core:data",
    ":core:domain",
    ":core:network",
    ":core:database",
    ":core:ui",
    ":core:common"
)

// :feature:home/build.gradle.kts
plugins {
    id("com.android.library")
    id("dagger.hilt.android.plugin")
}

dependencies {
    implementation(project(":core:domain"))
    implementation(project(":core:ui"))
    implementation(project(":core:common"))
    // CANNOT depend on :feature:profile — features are isolated
}

// Cross-feature navigation via shared routes
// :core:common/src/.../Navigation.kt
object Routes {
    const val HOME = "home"
    const val PROFILE = "profile/{userId}"
    const val SETTINGS = "settings"
    
    fun profileRoute(userId: String) = "profile/\$userId"
}

// :app/src/.../NavGraph.kt
@Composable
fun AppNavGraph(navController: NavHostController) {
    NavHost(navController, startDestination = Routes.HOME) {
        // Each feature provides its own navigation subgraph
        homeNavGraph(navController)
        profileNavGraph(navController)
        settingsNavGraph(navController)
    }
}

// :feature:home — provides its nav graph as an extension function
fun NavGraphBuilder.homeNavGraph(navController: NavController) {
    composable(Routes.HOME) {
        HomeScreen(
            onProfileClick = { userId ->
                navController.navigate(Routes.profileRoute(userId))
            }
        )
    }
}

// Convention plugins for consistent module config
// build-logic/convention/src/.../AndroidFeaturePlugin.kt
class AndroidFeaturePlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply("com.android.library")
            pluginManager.apply("dagger.hilt.android.plugin")
            dependencies {
                add("implementation", project(":core:ui"))
                add("implementation", project(":core:domain"))
            }
        }
    }
}`,
      exercise: `**Practice:**
1. Refactor a monolithic app into at least 4 modules and measure build time improvement
2. Create a convention plugin that standardizes feature module configuration
3. Implement cross-feature navigation without direct module dependencies
4. Draw the dependency graph for a 10-module app and ensure no circular dependencies
5. Set up a feature module with its own Hilt component`,
      commonMistakes: [
        "Creating too many modules too early — start with 3-4 modules, split as needed",
        "Circular dependencies between feature modules — features must be isolated, communicate via shared contracts",
        "Putting all code in :core:common — it becomes a god module; split by responsibility",
        "Not using convention plugins — each module has different Gradle config, causing maintenance overhead",
        "Forgetting to use `internal` for module-private APIs — everything defaults to public in Kotlin",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "You're architecting a new Android app that will have 10+ engineers. How do you structure the modules?",
          a: "I'd use a layered + feature-based approach: **Layer modules:** :core:domain (pure Kotlin models + use cases), :core:data (repositories), :core:network (Retrofit + interceptors), :core:database (Room), :core:ui (design system). **Feature modules:** one per feature area (:feature:auth, :feature:home, :feature:settings, etc.). **App module:** thin shell that wires features. **Key decisions:** (1) Convention plugins for consistent config. (2) API modules for feature-to-feature contracts. (3) Navigation module with typed routes. (4) CI checks for dependency graph violations. **Build time:** projects with 20+ modules see 40-60% faster incremental builds."
        },
        {
          type: "conceptual",
          q: "How do features communicate without depending on each other?",
          a: "Several patterns: (1) **Deep link navigation** — features navigate via URI routes, not class references. (2) **Shared API modules** — :feature:profile-api defines interfaces and data classes, :feature:home depends on :feature:profile-api (not :feature:profile). (3) **Event bus / shared Flow** — publish events to a shared module. (4) **Dependency injection** — Hilt multibindings to register feature-specific implementations of shared interfaces. The key principle: depend on abstractions (interfaces in shared modules), not concrete implementations."
        },
      ],
    },
    {
      id: "dependency-injection-hilt",
      title: "Dependency Injection with Hilt/Dagger",
      explanation: `**Dependency Injection (DI)** is mandatory knowledge for senior Android developers. Hilt (built on Dagger) is Google's recommended DI framework for Android.

**Why DI matters:**
1. **Testability** — Replace real implementations with fakes/mocks in tests
2. **Decoupling** — Classes depend on interfaces, not concrete implementations
3. **Lifecycle management** — Hilt scopes instances to Android lifecycle (Activity, ViewModel, etc.)
4. **Code reuse** — Same interface, different implementations per build variant

**Hilt component hierarchy:**
\`\`\`
SingletonComponent (Application scope)
  ├── ActivityRetainedComponent (survives config change)
  │   ├── ViewModelComponent (ViewModel scope)
  │   └── ActivityComponent (Activity scope)
  │       ├── FragmentComponent  
  │       └── ViewComponent
  └── ServiceComponent (Service scope)
\`\`\`

**Key Hilt annotations:**
- \`@HiltAndroidApp\` — Application class, generates the root component
- \`@AndroidEntryPoint\` — Activity/Fragment/Service, enables injection
- \`@HiltViewModel\` — ViewModel, enables constructor injection
- \`@Inject\` — Marks a constructor or field for injection
- \`@Module\` / \`@Provides\` — Provides instances that can't be constructor-injected
- \`@Binds\` — Binds an interface to its implementation (more efficient than @Provides)
- \`@Singleton\` / \`@ActivityScoped\` — Scoping annotations

**Under the hood:**
Dagger generates code at compile time (no reflection). For each \`@Inject\` constructor, Dagger creates a Factory class. For each \`@Module\`, it creates a provider. The component wires everything together.`,
      codeExample: `// Application setup
@HiltAndroidApp
class MyApplication : Application()

// Module — providing dependencies
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    @Singleton
    abstract fun bindTaskRepository(impl: TaskRepositoryImpl): TaskRepository
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor())
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideTaskApi(retrofit: Retrofit): TaskApi {
        return retrofit.create(TaskApi::class.java)
    }
}

// Repository with constructor injection
class TaskRepositoryImpl @Inject constructor(
    private val taskApi: TaskApi,
    private val taskDao: TaskDao,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) : TaskRepository {
    override fun getTasks(): Flow<List<Task>> = taskDao.getAll()
}

// ViewModel with Hilt
@HiltViewModel
class TaskViewModel @Inject constructor(
    private val getTasksUseCase: GetTasksUseCase,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // savedStateHandle is provided automatically by Hilt
    private val filter = savedStateHandle.getStateFlow("filter", TaskFilter.ALL)
}

// Qualifier for multiple bindings of same type
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class MainDispatcher

@Module
@InstallIn(SingletonComponent::class)
object DispatcherModule {
    @Provides @IoDispatcher
    fun provideIoDispatcher(): CoroutineDispatcher = Dispatchers.IO
    
    @Provides @MainDispatcher
    fun provideMainDispatcher(): CoroutineDispatcher = Dispatchers.Main
}`,
      exercise: `**Practice:**
1. Set up Hilt in a new project with proper Application, Activity, and ViewModel injection
2. Create a @Module with both @Provides and @Binds — when do you use each?
3. Implement a Qualifier for test vs production API URLs
4. Explain the Hilt component hierarchy and scoping rules
5. Write a unit test that replaces a Hilt module with a test module using @TestInstallIn`,
      commonMistakes: [
        "Using @Provides when @Binds suffices — @Binds is more efficient (no method body, directly maps interface to impl)",
        "Not scoping correctly — @Singleton in a ViewModelComponent module means the instance outlives the ViewModel",
        "Injecting Activity context where Application context is needed — causes memory leaks",
        "Circular dependencies — A depends on B, B depends on A. Use @Lazy or restructure",
        "Forgetting @AndroidEntryPoint on Activities/Fragments — injection silently fails",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Hilt/Dagger DI work under the hood?",
          a: "Dagger uses **compile-time code generation** (annotation processing via KSP/KAPT). For each @Inject constructor, Dagger generates a Factory class that knows how to create instances. For each @Module, it generates provider methods. The @Component interface is implemented by a generated class that wires all factories and providers together. At runtime, there's zero reflection — just plain method calls. This makes Dagger fast but increases compile time. Hilt adds Android-specific conventions on top: auto-generated components per Android class (Activity, Fragment, ViewModel), lifecycle-aware scoping, and test support."
        },
        {
          type: "tricky",
          q: "Explain the difference between @Singleton, @ActivityScoped, and @ViewModelScoped.",
          a: "@Singleton: one instance for the entire app lifetime, in SingletonComponent. @ActivityScoped: one instance per Activity, destroyed when Activity is destroyed (including config change). @ViewModelScoped: one instance per ViewModel, survives config changes but destroyed when ViewModel is cleared. **Gotcha:** @ActivityScoped creates a NEW instance on rotation (Activity is recreated). @ViewModelScoped does NOT. For data that must survive rotation (cached data, form state), use @ViewModelScoped. For things tied to the Activity window (dialog managers), use @ActivityScoped."
        },
      ],
    },
    {
      id: "repository-pattern",
      title: "Repository Pattern & Data Layer",
      explanation: `**The Repository pattern** is the cornerstone of Android's data layer. It provides a clean API for data access, abstracting the data sources (network, database, cache) from the rest of the app.

**Responsibilities:**
1. **Single source of truth** — Decide which data source to use (usually local DB)
2. **Data synchronization** — Keep local and remote data in sync
3. **Caching** — Cache network responses in local storage
4. **Error handling** — Translate network/database errors to domain errors
5. **Data mapping** — Convert API DTOs and DB entities to domain models

**The offline-first pattern:**
\`\`\`
UI reads from: Room DB (always available, always fast)
Network call → save to Room → Room emits update → UI refreshes
\`\`\`

This ensures the app works offline and provides instant data display.

**Key design decisions:**
- **Expose Flow, not suspend functions** — Flows allow real-time updates when DB changes
- **Map at boundaries** — DTOs → Entity → Domain Model. Don't leak API shapes to the UI.
- **Error handling** — Use Result/Either types, not exceptions, for expected failures`,
      codeExample: `// Complete Repository implementation — offline-first

// Domain model (clean, no annotations)
data class Article(
    val id: String,
    val title: String,
    val content: String,
    val author: String,
    val publishedAt: Instant,
    val isBookmarked: Boolean = false
)

// Network DTO (Moshi/Gson annotations)
@JsonClass(generateAdapter = true)
data class ArticleDto(
    @Json(name = "id") val id: String,
    @Json(name = "title") val title: String,
    @Json(name = "body") val content: String, // Different field name!
    @Json(name = "author_name") val author: String,
    @Json(name = "published_at") val publishedAt: String
)

// Room Entity (database annotations)
@Entity(tableName = "articles")
data class ArticleEntity(
    @PrimaryKey val id: String,
    val title: String,
    val content: String,
    val author: String,
    val publishedAt: Long,
    val isBookmarked: Boolean = false,
    val lastFetchedAt: Long = System.currentTimeMillis()
)

// Mappers — keep at data layer boundaries
fun ArticleDto.toEntity() = ArticleEntity(
    id = id, title = title, content = content,
    author = author, publishedAt = Instant.parse(publishedAt).toEpochMilli()
)

fun ArticleEntity.toDomain() = Article(
    id = id, title = title, content = content,
    author = author, publishedAt = Instant.ofEpochMilli(publishedAt),
    isBookmarked = isBookmarked
)

// Repository — single source of truth pattern
class ArticleRepositoryImpl @Inject constructor(
    private val api: ArticleApi,
    private val dao: ArticleDao,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) : ArticleRepository {
    
    // Expose Flow from Room — UI always gets latest data
    override fun getArticles(): Flow<List<Article>> {
        return dao.getAllArticles().map { entities ->
            entities.map { it.toDomain() }
        }.onStart {
            // Trigger network refresh in background
            refreshArticles()
        }.flowOn(ioDispatcher)
    }
    
    // Network refresh — save to DB, Room Flow auto-updates UI
    private suspend fun refreshArticles() {
        try {
            val response = api.getArticles()
            val entities = response.map { it.toEntity() }
            dao.upsertAll(entities) // Room emits new data via Flow
        } catch (e: Exception) {
            // Don't throw — stale local data is better than no data
            Timber.e(e, "Failed to refresh articles")
        }
    }
    
    override suspend fun toggleBookmark(articleId: String) {
        dao.toggleBookmark(articleId)
        // Optionally sync to server
    }
}`,
      exercise: `**Practice:**
1. Implement a complete Repository with offline-first pattern and sync
2. Add cache expiration — refresh from network if data is older than 15 minutes
3. Implement error handling that distinguishes network errors from server errors
4. Create mappers for a model with 3 layers (DTO → Entity → Domain)
5. Write unit tests for the Repository using fake data sources`,
      commonMistakes: [
        "Exposing API DTOs directly to the UI layer — any API change breaks the UI",
        "Throwing exceptions from the Repository — use Result/sealed classes for expected failures",
        "Not using Flow for data that can change — suspend functions miss real-time updates",
        "Putting caching logic in the ViewModel — caching is a data layer concern",
        "Making the Repository a god class — split into smaller repos per data domain",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why does Google recommend Room as the single source of truth instead of the network?",
          a: "1) **Offline support** — Room data is always available, network is not. 2) **Performance** — local queries are instant, network calls take 100-500ms+. 3) **Consistency** — Room provides reactive queries (Flow), so all observers see the same data. 4) **Simplicity** — no need to manually notify UI of updates; Room + Flow handles it automatically. The pattern: fetch from network → save to Room → UI observes Room. Even when online, the UI reads from Room, ensuring consistent behavior."
        },
        {
          type: "scenario",
          q: "How do you handle cache invalidation in the Repository?",
          a: "Several strategies: (1) **Time-based:** Store lastFetchedAt timestamp with each entity. If older than threshold (e.g., 15 min), trigger network refresh. (2) **Event-based:** Server pushes invalidation events via WebSocket/FCM. (3) **Version-based:** Store data version, compare with server version on each request. (4) **User-triggered:** Pull-to-refresh / manual sync button. For most apps, I use time-based as default with event-based for critical data. Implementation: in the Flow's onStart, check lastFetchedAt and conditionally refresh."
        },
      ],
    },
    {
      id: "offline-first-architecture",
      title: "Offline-First Architecture",
      explanation: `**Offline-first architecture** ensures your app works fully without a network connection, syncing data when connectivity returns. This is a critical differentiator at Google interviews.

**Core principles:**
1. **Local database is the source of truth** — UI always reads from local storage
2. **Optimistic updates** — User actions apply immediately to local DB, then sync
3. **Background sync** — Use WorkManager for reliable sync when online
4. **Conflict resolution** — Handle cases where offline edits conflict with server changes

**Sync strategies:**
- **Full sync:** Download all data every time. Simple but wasteful for large datasets.
- **Delta sync:** Only sync changes since last sync timestamp/token. Efficient.
- **Event sourcing:** Store events (created, updated, deleted) instead of state. Most flexible.
- **CRDT (Conflict-free Replicated Data Types):** Data structures that automatically merge without conflicts.

**Conflict resolution approaches:**
1. **Last-write-wins (LWW):** Simplest. Whoever saved last overwrites. Data can be lost.
2. **Server-wins:** Server version always takes precedence. Client re-fetches.
3. **Client-wins:** Client version overwrites server. Risk of overwriting other users' changes.
4. **Manual merge:** Show conflict to user, let them choose. Best for critical data.
5. **Three-way merge:** Compare both versions with a common ancestor. Git-style.

**WorkManager for reliable sync:** Survives process death, respects battery constraints, exponential backoff.`,
      codeExample: `// Offline-first sync architecture

// 1. Entity with sync metadata
@Entity(tableName = "documents")
data class DocumentEntity(
    @PrimaryKey val id: String,
    val title: String,
    val content: String,
    val localVersion: Int = 1,
    val serverVersion: Int = 0,
    val syncState: String = "PENDING", // SYNCED, PENDING, CONFLICT
    val modifiedAt: Long = System.currentTimeMillis(),
    val isDeleted: Boolean = false // Soft delete for sync
)

// 2. DAO with sync-aware queries
@Dao
interface DocumentDao {
    @Query("SELECT * FROM documents WHERE isDeleted = 0 ORDER BY modifiedAt DESC")
    fun getAll(): Flow<List<DocumentEntity>>
    
    @Query("SELECT * FROM documents WHERE syncState = 'PENDING'")
    suspend fun getPendingSync(): List<DocumentEntity>
    
    @Upsert
    suspend fun upsert(doc: DocumentEntity)
    
    @Query("UPDATE documents SET isDeleted = 1, syncState = 'PENDING' WHERE id = :id")
    suspend fun softDelete(id: String) // Soft delete, sync later
}

// 3. Repository with optimistic updates
class DocumentRepository @Inject constructor(
    private val dao: DocumentDao,
    private val api: DocumentApi,
    private val workManager: WorkManager
) {
    fun getDocuments(): Flow<List<Document>> =
        dao.getAll().map { it.map(DocumentEntity::toDomain) }
    
    suspend fun saveDocument(doc: Document) {
        // Optimistic: save locally FIRST, UI updates instantly
        dao.upsert(doc.toEntity().copy(
            syncState = "PENDING",
            localVersion = doc.localVersion + 1,
            modifiedAt = System.currentTimeMillis()
        ))
        // Schedule background sync
        scheduleSyncWork()
    }
    
    private fun scheduleSyncWork() {
        val work = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build())
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()
        workManager.enqueueUniqueWork("doc_sync", ExistingWorkPolicy.REPLACE, work)
    }
}

// 4. Sync Worker with conflict handling
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val dao: DocumentDao,
    private val api: DocumentApi
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        val pending = dao.getPendingSync()
        for (doc in pending) {
            try {
                val serverDoc = api.sync(doc.toSyncRequest())
                if (serverDoc.version > doc.localVersion) {
                    // Conflict! Server has newer version
                    dao.upsert(doc.copy(syncState = "CONFLICT"))
                } else {
                    dao.upsert(doc.copy(
                        syncState = "SYNCED",
                        serverVersion = serverDoc.version
                    ))
                }
            } catch (e: Exception) {
                return if (runAttemptCount < 3) Result.retry() else Result.failure()
            }
        }
        return Result.success()
    }
}`,
      exercise: `**Practice:**
1. Implement a complete offline-first CRUD app with sync using Room + WorkManager
2. Design a conflict resolution UI that shows both versions side-by-side
3. Implement delta sync using a server-provided sync token
4. Test offline behavior: disable network, make changes, re-enable and verify sync
5. Handle the edge case: user deletes a document offline, another user edits it online`,
      commonMistakes: [
        "Treating network as the source of truth — the app breaks immediately when offline",
        "Not using soft deletes for synced entities — hard deletes can't be synced",
        "Ignoring conflict resolution — silently overwriting data leads to data loss",
        "Not using WorkManager for sync — manual sync in a Service gets killed by the OS",
        "Syncing everything instead of delta sync — wastes bandwidth and battery",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design an offline-first messaging app. How do you handle message ordering when the user comes back online?",
          a: "Use **vector clocks** or **Lamport timestamps** for ordering: (1) Each message gets a local sequence number + device ID + timestamp. (2) When online, send pending messages to server. (3) Server assigns global ordering and returns canonical timestamps. (4) Client reconciles: keep local messages in sent order, insert incoming messages by server timestamp. (5) For conflicts (simultaneous messages), use deterministic tiebreaker (lower device ID wins). Key trade-off: eventual consistency is acceptable for messaging — users expect slight reordering."
        },
        {
          type: "conceptual",
          q: "What are CRDTs and when would you use them in an Android app?",
          a: "CRDTs (Conflict-free Replicated Data Types) are data structures that can be merged without conflicts by mathematical properties. Types: **G-Counter** (grow-only counter), **PN-Counter** (positive-negative counter), **LWW-Register** (last-write-wins for values), **OR-Set** (observed-remove set). Use in Android for: collaborative editing (Google Docs-style), shopping lists (add/remove items across devices), counters (likes, views). Pros: no conflict resolution logic needed, works fully offline. Cons: increased memory (store metadata), eventual consistency only, not suitable for all data types."
        },
      ],
    },
    {
      id: "large-scale-app-structure",
      title: "Large-Scale App Structure",
      explanation: `**Structuring apps at scale** (10+ engineers, 500K+ LOC) requires deliberate architectural decisions. At Google, Android apps like Gmail, Maps, and Photos have hundreds of modules and dozens of teams.

**Key principles for large-scale apps:**
1. **Feature ownership** — Each team owns specific feature modules with clear APIs
2. **Shared libraries** — Design system, analytics, networking as shared modules
3. **Build system** — Convention plugins, Gradle build cache, CI/CD pipeline
4. **API contracts** — Feature modules communicate via interfaces, not implementations
5. **Incremental adoption** — New patterns in new code, legacy code migrated gradually

**App structure at scale:**
\`\`\`
:app (thin shell)
:feature:auth (Team A)
:feature:home (Team B)
:feature:search (Team C)
:feature:profile (Team A)
:core:design-system (Platform team)
:core:analytics (Platform team)
:core:network (Platform team)
:core:database (Platform team)
:core:testing (Platform team)
:lib:image-loader (Shared library)
:lib:crash-reporting (Shared library)
\`\`\`

**Scaling challenges and solutions:**
- **Build times:** Build cache, incremental compilation, module-level parallelism, Baseline Profiles
- **Code conflicts:** Module isolation, CODEOWNERS file, feature flags for WIP code
- **Consistency:** Convention plugins, shared lint rules, architectural fitness functions
- **Testing:** Each module has its own tests, integration tests at app level, screenshot tests for UI

**Feature flags:** Essential for large teams. Deploy code behind flags, enable gradually, rollback instantly.`,
      codeExample: `// Feature Flag system for large-scale apps
interface FeatureFlagProvider {
    fun isEnabled(flag: FeatureFlag): Boolean
    fun getVariant(flag: FeatureFlag): String?
}

enum class FeatureFlag(val key: String, val defaultValue: Boolean) {
    NEW_HOME_SCREEN("new_home_screen", false),
    DARK_MODE_V2("dark_mode_v2", false),
    OFFLINE_SYNC("offline_sync", true),
}

// Remote Config backed implementation
class RemoteFeatureFlagProvider @Inject constructor(
    private val remoteConfig: FirebaseRemoteConfig,
    private val localOverrides: DataStore<Preferences>
) : FeatureFlagProvider {
    
    override fun isEnabled(flag: FeatureFlag): Boolean {
        // Local overrides for development/testing
        val localOverride = runBlocking {
            localOverrides.data.first()[booleanPreferencesKey(flag.key)]
        }
        if (localOverride != null) return localOverride
        return remoteConfig.getBoolean(flag.key)
    }
}

// Usage in feature module
@Composable
fun HomeScreen(featureFlags: FeatureFlagProvider = hiltViewModel<HomeVM>().flags) {
    if (featureFlags.isEnabled(FeatureFlag.NEW_HOME_SCREEN)) {
        NewHomeContent()
    } else {
        LegacyHomeContent()
    }
}

// CODEOWNERS file — enforce module ownership
// .github/CODEOWNERS
// /feature/auth/      @team-a
// /feature/home/      @team-b
// /feature/search/    @team-c
// /core/design-system/ @platform-team
// /core/network/      @platform-team

// Architectural fitness function — enforce dependency rules in CI
// Custom Gradle task or ArchUnit test
class ArchitectureTest {
    @Test
    fun featureModulesShouldNotDependOnEachOther() {
        // Parse dependency graph and assert
        val featureModules = getFeatureModules()
        for (module in featureModules) {
            val deps = module.dependencies
            val featureDeps = deps.filter { it.startsWith(":feature:") }
            assert(featureDeps.isEmpty()) {
                "\${module.name} depends on features: \$featureDeps"
            }
        }
    }
}`,
      exercise: `**Practice:**
1. Design a module structure for a social media app with 5 feature teams
2. Implement a feature flag system with remote config and local overrides
3. Set up CODEOWNERS and branch protection rules for module ownership
4. Create an architectural fitness function that validates dependency rules
5. Design a shared design system module with Compose components`,
      commonMistakes: [
        "Not having a platform team for shared modules — each feature team creates their own networking/analytics code",
        "Allowing feature-to-feature dependencies — creates coupling that slows teams down",
        "Skipping feature flags — deploying directly to production without gradual rollout",
        "Not investing in CI/CD — slow builds and flaky tests compound at scale",
        "Monolithic database module — each feature should own its own tables/DAOs when possible",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "You're leading the Android architecture for a team of 15 engineers. How do you ensure code quality and architectural consistency?",
          a: "Multi-layered approach: (1) **Convention plugins** — standardize module config, dependencies, and build settings. (2) **Custom lint rules** — enforce patterns (e.g., no direct API calls from ViewModel, no View imports in domain). (3) **Architectural fitness functions** — CI tests that validate dependency graph (no circular deps, no feature-to-feature deps). (4) **Code review standards** — documented patterns in an Architecture Decision Record (ADR). (5) **CODEOWNERS** — enforce module-level code review by owning team. (6) **Architecture Council** — bi-weekly meeting to discuss cross-cutting concerns. (7) **Living documentation** — architecture diagrams auto-generated from module structure."
        },
        {
          type: "conceptual",
          q: "How do you migrate a monolithic Android app to a modular architecture?",
          a: "Incremental migration: (1) **Create :core modules first** — extract networking, database, common utilities. These are easiest and highest impact. (2) **Identify feature boundaries** — find natural seams in the codebase (distinct screens, isolated data). (3) ** Extract one feature** — start with the most isolated feature. Convert it to a module with clear APIs. (4) **Establish conventions** — before extracting more, standardize module structure and document it. (5) **Extract remaining features** — parallelize extraction across teams. (6) **Clean up :app** — reduce to a thin wiring module. Key: do NOT try to modularize everything at once. Extract, validate, iterate."
        },
      ],
    },
  ],
};

export default androidPhase3;
