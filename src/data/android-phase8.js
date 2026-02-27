const androidPhase8 = {
  id: "phase-8",
  title: "Phase 8: Testing & Quality",
  emoji: "🧪",
  description: "Master testing strategies for production Android apps — unit testing, UI testing, TDD, CI/CD, and code quality enforcement.",
  topics: [
    {
      id: "unit-testing-android",
      title: "Unit Testing in Android",
      explanation: `**Unit testing** validates individual functions and classes in isolation. At the senior level, you should write testable code by design, not as an afterthought.

**What to test:**
- **ViewModel logic:** State transitions, error handling, data mapping
- **Repository methods:** Data source selection, caching, error transformation
- **Use Cases:** Business rules, filtering, validation
- **Mappers/Utilities:** Data transformation, formatting

**What NOT to unit test:**
- Android framework classes directly (Activity, Fragment) — use UI tests
- Third-party library internals (Room, Retrofit) — trust the library
- Trivial getters/setters — no logic = no value

**Testing coroutines:**
Use \`kotlinx-coroutines-test\` with \`runTest\` and \`StandardTestDispatcher\` or \`UnconfinedTestDispatcher\`.

**Testing Flow:**
Use \`.first()\` for single emission, \`Turbine\` library for multi-emission testing.

**Test doubles:**
- **Fake:** Working implementation with simplified logic (FakeRepository)
- **Mock:** Configured to return specific values (Mockk/Mockito)
- **Stub:** Returns hardcoded values
- **Spy:** Wraps real implementation, records calls

**Google's preference:** Fakes over Mocks. Fakes are real implementations that test behavior, not implementation details.`,
      codeExample: `// ViewModel test with coroutines
class TaskViewModelTest {
    // Replace main dispatcher for testing
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()
    
    private lateinit var viewModel: TaskViewModel
    private val fakeRepository = FakeTaskRepository()
    
    @Before
    fun setup() {
        viewModel = TaskViewModel(fakeRepository)
    }
    
    @Test
    fun \`loadTasks emits success state with tasks\`() = runTest {
        // Given
        val tasks = listOf(Task("1", "Test", false))
        fakeRepository.setTasks(tasks)
        
        // When — ViewModel loads on init
        
        // Then — use Turbine to test Flow emissions
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state is TaskUiState.Success)
            assertEquals(tasks, (state as TaskUiState.Success).tasks)
        }
    }
    
    @Test
    fun \`toggleComplete updates task state\`() = runTest {
        fakeRepository.setTasks(listOf(Task("1", "Test", false)))
        
        viewModel.toggleComplete("1")
        advanceUntilIdle() // Process all coroutines
        
        viewModel.uiState.test {
            val state = awaitItem() as TaskUiState.Success
            assertTrue(state.tasks.first().isComplete)
        }
    }
    
    @Test
    fun \`loadTasks emits error on repository failure\`() = runTest {
        fakeRepository.setShouldFail(true)
        viewModel = TaskViewModel(fakeRepository) // Re-create to trigger load
        
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state is TaskUiState.Error)
        }
    }
}

// Fake repository — preferred over mocks
class FakeTaskRepository : TaskRepository {
    private val tasks = MutableStateFlow<List<Task>>(emptyList())
    private var shouldFail = false
    
    fun setTasks(newTasks: List<Task>) { tasks.value = newTasks }
    fun setShouldFail(fail: Boolean) { shouldFail = fail }
    
    override fun getTasks(): Flow<List<Task>> {
        if (shouldFail) return flow { throw IOException("Network error") }
        return tasks
    }
    
    override suspend fun toggleComplete(id: String) {
        if (shouldFail) throw IOException("Network error")
        tasks.update { list ->
            list.map { if (it.id == id) it.copy(isComplete = !it.isComplete) else it }
        }
    }
}

// MainDispatcherRule — replaces Main dispatcher in tests
class MainDispatcherRule(
    private val dispatcher: TestDispatcher = UnconfinedTestDispatcher()
) : TestWatcher() {
    override fun starting(description: Description) {
        Dispatchers.setMain(dispatcher)
    }
    override fun finished(description: Description) {
        Dispatchers.resetMain()
    }
}`,
      exercise: `**Practice:**
1. Write unit tests for a ViewModel with 3 state transitions (Loading → Success → Error)
2. Create a Fake repository and compare it to a Mock-based test
3. Test a coroutine with delay() using runTest and advanceTimeBy()
4. Test a Flow with multiple emissions using Turbine
5. Achieve 80% code coverage for a Repository class`,
      commonMistakes: [
        "Not replacing Dispatchers.Main in tests — causes 'Module with the Main dispatcher is missing' error",
        "Using Mockito for everything — fakes test behavior, mocks test implementation details",
        "Testing implementation instead of behavior — don't verify internal method call order",
        "Not testing error paths — happy path works, but how does the app handle failures?",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why does Google prefer fakes over mocks for testing?",
          a: "Fakes test **behavior** — they're real implementations with simplified internals. Mocks test **implementation** — they verify which methods were called with which arguments. Problems with mocks: (1) Tests break when you refactor internal details (even if behavior is unchanged). (2) Mocks can't catch bugs in interactions between components. (3) Mock setups are verbose and hard to maintain. Fakes are: (1) Reusable across many tests. (2) Implementation-agnostic. (3) Self-validating. Example: FakeRepository uses an in-memory list instead of Room — tests real data flow without a database."
        },
      ],
    },
    {
      id: "ui-testing-android",
      title: "UI Testing & Integration Testing",
      explanation: `**UI testing** validates the app's behavior from the user's perspective. At the senior level, you should design a testing strategy that balances speed and coverage.

**The testing pyramid:**
\`\`\`
      /  E2E Tests  \\      Few, slow, high confidence
     / UI Tests      \\     Moderate count
    / Integration     \\    Moderate count
   /  Unit Tests       \\   Many, fast, low cost
\`\`\`

**UI testing frameworks:**
- **Compose Testing:** Built-in test rules for Compose UIs. Find by semantics, perform actions, assert state.
- **Espresso:** For View-based UIs. Find by ID/text, perform actions, check assertions.
- **UI Automator:** Tests across apps (system UI, notifications, permissions).
- **Robolectric:** Run Android tests on JVM without emulator. Very fast.

**Screenshot testing:**
Compare rendered UI against reference screenshots. Catches visual regressions. Libraries: Paparazzi, Roborazzi, Compose Preview Screenshot Testing.

**Integration testing:** Tests multiple components working together (ViewModel + Repository + FakeDataSource). Runs on device/emulator. Uses Hilt's \`@TestInstallIn\` to replace production modules.`,
      codeExample: `// Compose UI test
class TaskListScreenTest {
    @get:Rule
    val composeRule = createComposeRule()
    
    @Test
    fun displaysTasks_whenLoaded() {
        val tasks = listOf(
            Task("1", "Buy groceries", false),
            Task("2", "Write tests", true)
        )
        
        composeRule.setContent {
            TaskListScreen(
                state = TaskUiState.Success(tasks),
                onToggle = {},
                onDelete = {}
            )
        }
        
        // Assert tasks are displayed
        composeRule.onNodeWithText("Buy groceries").assertIsDisplayed()
        composeRule.onNodeWithText("Write tests").assertIsDisplayed()
        
        // Assert completed task has different visual
        composeRule.onNodeWithText("Write tests")
            .assertHasClickAction()
    }
    
    @Test
    fun showsLoadingIndicator_whenLoading() {
        composeRule.setContent {
            TaskListScreen(
                state = TaskUiState.Loading,
                onToggle = {},
                onDelete = {}
            )
        }
        
        composeRule.onNodeWithContentDescription("Loading")
            .assertIsDisplayed()
    }
    
    @Test
    fun callsOnToggle_whenTaskClicked() {
        var toggledId: String? = null
        
        composeRule.setContent {
            TaskListScreen(
                state = TaskUiState.Success(listOf(Task("1", "Test", false))),
                onToggle = { toggledId = it },
                onDelete = {}
            )
        }
        
        composeRule.onNodeWithText("Test").performClick()
        assertEquals("1", toggledId)
    }
}

// Integration test with Hilt
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class TaskFeatureTest {
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeRule = createAndroidComposeRule<MainActivity>()
    
    @BindValue // Replace real repository with fake
    val repository: TaskRepository = FakeTaskRepository()
    
    @Before
    fun setup() {
        hiltRule.inject()
    }
    
    @Test
    fun createAndCompleteTask_endToEnd() {
        // Add a task
        composeRule.onNodeWithContentDescription("Add Task").performClick()
        composeRule.onNodeWithTag("task_input").performTextInput("New task")
        composeRule.onNodeWithText("Save").performClick()
        
        // Verify it appears
        composeRule.onNodeWithText("New task").assertIsDisplayed()
        
        // Toggle complete
        composeRule.onNodeWithText("New task").performClick()
        
        // Verify completion state
        composeRule.onNodeWithText("New task")
            .assertExists() // Still visible but marked complete
    }
}`,
      exercise: `**Practice:**
1. Write Compose UI tests for a login screen (email validation, button state, error display)
2. Create a screenshot test using Paparazzi for a card component
3. Write an integration test that uses Hilt's @BindValue to inject fakes
4. Test navigation between two screens using the Navigation test artifact
5. Set up Robolectric for fast JVM-based UI tests`,
      commonMistakes: [
        "Testing UI implementation details (view IDs) instead of user-visible behavior (text, content descriptions)",
        "Not adding testTags/semantics to Compose components — makes testing impossible without them",
        "Running all tests as instrumented tests — use Robolectric for fast feedback loop",
        "Not testing error states — only testing the happy path misses the most common UX issues",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Describe your ideal testing strategy for a production Android app.",
          a: "**Testing pyramid:** (1) **70% Unit tests** — ViewModels, Repositories, Use Cases, Mappers. Fast, run on JVM. Use fakes for dependencies. (2) **20% Integration tests** — Feature-level tests with Hilt test modules and fake data sources. Verify components work together. Run on Robolectric or emulator. (3) **10% E2E tests** — Critical user journeys (onboarding, payment). Run on emulator in CI. Slow but high confidence. **Plus:** Screenshot tests for UI regressions (Paparazzi). **CI:** Unit tests on every PR. Integration + screenshot on merge. E2E nightly."
        },
      ],
    },
    {
      id: "cicd-strategies",
      title: "CI/CD Strategies for Android",
      explanation: `**CI/CD (Continuous Integration / Continuous Delivery)** automates building, testing, and deploying Android apps. At the senior level, you're expected to design and maintain CI/CD pipelines.

**CI pipeline stages:**
\`\`\`
1. Lint & Static Analysis  (2 min)
2. Unit Tests              (3 min)
3. Build Debug APK         (5 min)
4. Instrumented Tests      (10 min)
5. Screenshot Tests        (5 min)
6. Build Release Bundle    (5 min)
7. Deploy to Internal      (2 min)
Total: ~30 min for full pipeline
\`\`\`

**Key CI/CD practices:**
- **PR checks:** Lint + unit tests on every PR (fast feedback)
- **Merge checks:** Full test suite + build on merge to main
- **Nightly:** E2E tests, performance benchmarks
- **Release:** Staged rollout (1% → 10% → 50% → 100%)

**Tools:**
- **GitHub Actions / GitLab CI** — Pipeline definition
- **Firebase App Distribution** — Internal test builds
- **Play Console Internal Testing** — Staged releases
- **Danger / Detekt** — Automated code review comments
- **Gradle Build Cache** — Speed up CI builds with remote caching`,
      codeExample: `# GitHub Actions CI workflow for Android
# .github/workflows/android-ci.yml

name: Android CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Cache Gradle
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: gradle-\${{ hashFiles('**/*.gradle*') }}
      
      - name: Run Detekt (static analysis)
        run: ./gradlew detekt
      
      - name: Run Unit Tests
        run: ./gradlew testDebugUnitTest
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: '**/build/reports/tests/'

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '17', distribution: 'temurin' }
      
      - name: Build Release Bundle
        run: ./gradlew bundleRelease
      
      - name: Upload Bundle
        uses: actions/upload-artifact@v4
        with:
          name: release-bundle
          path: app/build/outputs/bundle/release/

# Detekt config for code quality
# detekt.yml
complexity:
  LongMethod:
    threshold: 30
  LargeClass:
    threshold: 300
  ComplexCondition:
    threshold: 4

naming:
  FunctionNaming:
    functionPattern: '[a-z][a-zA-Z0-9]*'

style:
  MaxLineLength:
    maxLineLength: 120`,
      exercise: `**Practice:**
1. Set up a GitHub Actions CI pipeline with lint, test, and build stages
2. Configure Detekt for static analysis with custom rules
3. Add screenshot test comparison to your CI pipeline
4. Implement staged rollout using Play Console API
5. Set up Gradle remote build cache for CI builds`,
      commonMistakes: [
        "Not caching Gradle dependencies in CI — builds take 2-3x longer without cache",
        "Running instrumented tests on every PR — too slow, run on merge or nightly",
        "Not using build cache — incremental builds are much faster with remote cache",
        "Manual release process — automate signing, bundle creation, and upload to Play Console",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a CI/CD pipeline for an Android team of 10 engineers.",
          a: "**PR checks (fast, < 5 min):** Lint (ktlint + Detekt), unit tests, build check. Run on every PR. **Merge to main (< 15 min):** Full unit tests, integration tests, screenshot tests, debug build. **Nightly (< 60 min):** Instrumented tests on emulator, E2E tests, performance benchmarks, release build. **Release:** Weekly canary to internal testers (Firebase App Dist), bi-weekly staged rollout (1% → 10% → 50% → 100%) via Play Console API. **Monitoring:** Crash rate alerts via Crashlytics, ANR rate via Play Console, performance dashboards. **Key infrastructure:** GitHub Actions with macOS runners for instrumented tests, Gradle remote build cache for speed."
        },
      ],
    },
  ],
};

export default androidPhase8;
