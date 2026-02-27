const rnPhase11 = {
  id: "phase-11",
  title: "Phase 11: Testing & Release Excellence",
  emoji: "🧪",
  description: "Comprehensive testing strategy — unit, integration, component, E2E (Detox), mocking native modules, CI/CD pipelines, code review standards, release management, and observability.",
  topics: [
    {
      id: "testing-strategy",
      title: "Testing Pyramid for React Native",
      explanation: `**The testing pyramid** adapted for React Native has unique considerations because you're testing across two runtimes (JS and Native) and need to mock platform APIs.

**Testing levels (bottom to top):**
\`\`\`
                ▲
               / \\
              / E2E \\          Few, slow, brittle, high confidence
             / (Detox) \\
            /───────────\\
           / Integration  \\    Some, moderate speed
          /  (Component +  \\
         /   State + Navigation)
        /─────────────────────\\
       /     Unit Tests         \\  Many, fast, isolated
      / (Hooks, Utils, Logic)    \\
     /──────────────────────────── \\
    /        Static Analysis         \\  Always, instant
   / (TypeScript, ESLint, Prettier)   \\
  /─────────────────────────────────────\\
\`\`\`

**Recommended ratios:**
- Unit tests: 60-70% of test suite
- Integration tests: 20-30%
- E2E tests: 5-10% (critical user journeys only)

**What to test at each level:**

| Level | What to Test | Tools |
|-------|-------------|-------|
| Static | Type errors, style, patterns | TypeScript, ESLint |
| Unit | Hooks, utils, reducers, selectors, services | Jest, React Testing Library |
| Integration | Component + hook interaction, screen rendering, navigation flows | React Testing Library, MSW |
| E2E | Critical user journeys: login → feed → action → verify | Detox, Maestro |

**Key principle: Test behavior, not implementation.** Users don't care that you used useState vs useReducer. They care that tapping "Add to Cart" adds an item and shows the correct count.`,
      codeExample: `// === UNIT TESTING: Custom Hooks ===

// hooks/useDebounce.ts
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// hooks/__tests__/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react-hooks';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });
  
  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );
    
    // Update value
    rerender({ value: 'world', delay: 500 });
    
    // Value hasn't changed yet
    expect(result.current).toBe('hello');
    
    // Fast-forward timer
    act(() => jest.advanceTimersByTime(500));
    
    // Now it's updated
    expect(result.current).toBe('world');
  });
  
  it('cancels previous timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } }
    );
    
    rerender({ value: 'ab' });
    act(() => jest.advanceTimersByTime(200));
    
    rerender({ value: 'abc' }); // Resets the timer
    act(() => jest.advanceTimersByTime(200));
    
    expect(result.current).toBe('a'); // Still initial
    
    act(() => jest.advanceTimersByTime(300)); // 500ms since 'abc'
    expect(result.current).toBe('abc');
  });
});

// === INTEGRATION TESTING: Component with API ===

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', name: 'Widget', price: 9.99 },
      { id: '2', name: 'Gadget', price: 19.99 },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProductList', () => {
  it('renders products from API', async () => {
    render(<ProductList />);
    
    // Shows loading state
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    
    // Shows products after loading
    await waitFor(() => {
      expect(screen.getByText('Widget')).toBeTruthy();
      expect(screen.getByText('Gadget')).toBeTruthy();
    });
  });
  
  it('shows error state on API failure', async () => {
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeTruthy();
      expect(screen.getByText(/retry/i)).toBeTruthy();
    });
  });
  
  it('navigates to product detail on tap', async () => {
    const mockNavigate = jest.fn();
    
    render(
      <NavigationContext.Provider value={{ navigate: mockNavigate }}>
        <ProductList />
      </NavigationContext.Provider>
    );
    
    await waitFor(() => screen.getByText('Widget'));
    
    fireEvent.press(screen.getByText('Widget'));
    
    expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', { id: '1' });
  });
});

// === E2E TESTING WITH DETOX ===

// e2e/login.spec.ts
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  it('should login with valid credentials', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
      
    await expect(element(by.text('Welcome back'))).toBeVisible();
  });
  
  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@email.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    await waitFor(element(by.text('Invalid credentials')))
      .toBeVisible()
      .withTimeout(3000);
  });
});`,
      exercise: `**Testing Exercises:**
1. Write unit tests for a custom \`useAsync\` hook covering loading, success, error, and cancellation states
2. Write integration tests for a login form — mock the API, test success and failure flows
3. Set up MSW (Mock Service Worker) for API mocking in tests
4. Write a Detox E2E test for a critical user journey (signup → onboarding → first action)
5. Mock a native module (e.g., react-native-camera) in Jest tests
6. Set up a CI pipeline that runs unit tests on every PR and E2E tests on merge to main`,
      commonMistakes: [
        "Testing implementation details instead of behavior — checking setState was called instead of verifying the UI changed",
        "Not mocking native modules — tests crash with 'NativeModule.X is undefined'; set up jest.setup.js with mocks",
        "Writing too many E2E tests — they're slow and brittle; focus on 5-10 critical user journeys only",
        "Not using MSW for API mocking — manually mocking fetch is fragile and doesn't validate request shapes",
        "Skipping the testing of error states — most bugs in production are in error handling code, which goes untested",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How do you structure a testing strategy for a React Native app with 50 screens?",
          a: "**Layered approach:** (1) **Static analysis everywhere**: TypeScript strict mode, ESLint with RN rules, Prettier. Catches 30-40% of bugs at zero runtime cost. (2) **Unit tests for logic**: Custom hooks, utils, state management (reducers, selectors), API transformations. Target 80% coverage on business logic. (3) **Integration tests for critical screens**: Login, checkout, feed loading. Test complete screen behavior with mocked APIs (MSW). 15-20 key screens. (4) **E2E for critical journeys**: 5-10 flows: signup, login, purchase, search, navigation. Use Detox/Maestro. Run on CI for every release. (5) **Visual regression**: Screenshot testing for design system components. Catch unintended UI changes.",
        },
        {
          type: "scenario",
          q: "How do you mock native modules in React Native tests?",
          a: "**Three levels:** (1) **jest.setup.js**: Global mocks for common modules (`@react-native-async-storage/async-storage`, `react-native-reanimated`). RN provides `jest/setup.js` for core mocks. (2) **Per-test mocks**: `jest.mock('@react-native-firebase/messaging', () => ({ ... }))` for specific module behavior in one test. (3) **Module-level __mocks__**: Create `__mocks__/react-native-camera.js` that exports a mock component. Jest automatically uses it. Key: mock at the right level — don't over-mock (lose confidence) or under-mock (tests crash on native calls).",
        },
      ],
    },
    {
      id: "cicd-release-management",
      title: "CI/CD & Release Management Strategy",
      explanation: `**CI/CD for React Native** is more complex than web because you're building for two platforms (iOS + Android), managing native dependencies, and dealing with app store review processes.

**CI Pipeline stages:**
\`\`\`
PR Created
  → Lint (TypeScript, ESLint, Prettier check)
  → Unit Tests (Jest, ~2 min)
  → Integration Tests (RNTL + MSW, ~5 min)
  → Build Check (Metro bundling, ~3 min)
  → [Optional] E2E Tests on PR (Detox, ~15 min)

Merge to main
  → All above
  → E2E Tests (full suite, ~30 min)
  → Build iOS (Xcode, ~15 min)
  → Build Android (Gradle, ~15 min)
  → Upload to TestFlight / Firebase App Distribution

Release Branch
  → Full test suite
  → Code signing
  → Store submission (App Store Connect, Google Play Console)
  → [OTA] CodePush for JS-only changes
\`\`\`

**Release strategies:**
1. **Full store release**: Native + JS changes. 1-7 days review time. Staged rollout (1% → 10% → 100%).
2. **OTA update (CodePush)**: JS-only changes. Instant delivery. No store review. Use for bug fixes, content changes.
3. **Feature flags**: Ship code behind flags. Enable/disable without any release. Gradual rollout.

**Monitoring & observability post-release:**
- Crash-free rate (Sentry, Crashlytics) — target >99.5%
- ANR rate (Android vitals) — target <0.5%
- App startup time — monitor p50, p95, p99
- Bundle size tracking — alert on >5% increase
- API error rates — dashboard per endpoint
- User-reported issues — in-app feedback, support tickets`,
      codeExample: `// === CI/CD CONFIGURATION ===

// .github/workflows/ci.yml (GitHub Actions)
const ciConfig = {
  name: 'CI',
  on: {
    pull_request: { branches: ['main', 'develop'] },
    push: { branches: ['main'] },
  },
  jobs: {
    lint_and_test: {
      'runs-on': 'ubuntu-latest',
      steps: [
        { uses: 'actions/checkout@v4' },
        { uses: 'actions/setup-node@v4', with: { 'node-version': '20' } },
        { run: 'npm ci' },
        { run: 'npm run lint', name: 'ESLint' },
        { run: 'npm run typecheck', name: 'TypeScript' },
        { run: 'npm test -- --coverage', name: 'Unit Tests' },
        {
          name: 'Coverage Gate',
          run: 'npx coverage-threshold --statements 80 --branches 70',
        },
      ],
    },
    build_android: {
      'runs-on': 'ubuntu-latest',
      needs: 'lint_and_test',
      if: "github.event_name == 'push'",
      steps: [
        // Setup Java, NDK, build, upload to Firebase App Distribution
      ],
    },
    build_ios: {
      'runs-on': 'macos-latest',
      needs: 'lint_and_test',
      if: "github.event_name == 'push'",
      steps: [
        // Setup Xcode, fastlane, build, upload to TestFlight
      ],
    },
  },
};

// === RELEASE MANAGEMENT ===

// Version management strategy
// package.json version = marketing version (1.2.3)
// Build number auto-incremented by CI

// Release checklist (automated where possible)
const releaseChecklist = {
  preRelease: [
    'All tests passing on release branch',
    'No P0/P1 bugs open',
    'Release notes written',
    'Staging build tested by QA',
    'Performance benchmarks within thresholds',
    'Bundle size within budget',
    'Crash-free rate on staging > 99.5%',
  ],
  release: [
    'Tag release in git (v1.2.3)',
    'Build signed APK/IPA',
    'Submit to App Store Connect',
    'Submit to Google Play Console',
    'Staged rollout: 1% for 24h',
    'Monitor crash rates, ANR rates, support tickets',
    'If metrics ok: 10% for 24h → 50% → 100%',
  ],
  postRelease: [
    'Verify analytics events flowing',
    'Monitor error rates for 48h',
    'Close release-related tickets',
    'Update internal documentation',
    'Start next release branch',
  ],
};

// OTA updates with CodePush
import codePush from 'react-native-code-push';

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESTART,
  // Don't force immediate install — user might be mid-action
};

// Wrap root component
const App = codePush(codePushOptions)(AppRoot);

// For critical fixes — install immediately
async function deployHotfix() {
  const update = await codePush.checkForUpdate();
  if (update && update.isMandatory) {
    await update.download();
    update.install(codePush.InstallMode.IMMEDIATE);
    // Shows update dialog and restarts app
  }
}`,
      exercise: `**CI/CD & Release Exercises:**
1. Set up a GitHub Actions CI pipeline that runs lint, typecheck, and tests on every PR
2. Configure Fastlane for automated iOS TestFlight deployment
3. Set up CodePush and deploy a JS-only update to a staging environment
4. Create a release checklist that includes bundle size comparison with the previous release
5. Implement a staged rollout strategy with automated rollback on crash rate increase
6. Set up monitoring dashboards for crash rate, startup time, and API error rates`,
      commonMistakes: [
        "Not caching node_modules and native dependencies in CI — builds take 20+ minutes instead of 5",
        "Using CodePush for changes that include native code — native changes require a full store release",
        "Not testing on real devices in CI — simulators miss device-specific bugs (camera, GPS, Bluetooth)",
        "Skipping staged rollout — deploying to 100% immediately means a bug affects all users instantly",
        "Not tracking bundle size over time — gradual increases go unnoticed until the app exceeds size limits",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your team releases every two weeks. How do you structure the release process?",
          a: "**Release train model:** (1) **Day 1-10**: Feature development on feature branches, merging to `develop`. (2) **Day 10**: Cut release branch from `develop`. Feature freeze — only bug fixes merged. (3) **Day 10-12**: QA testing on release branch. Fix critical bugs. (4) **Day 12**: Submit to stores. (5) **Day 13-14**: Staged rollout (1% → 10% → 100%). Monitor crash rates. (6) **Day 14**: Full rollout + tag release. Hotfix path: critical bugs get CodePush for JS-only fixes or expedited store review for native fixes.",
        },
        {
          type: "conceptual",
          q: "When should you use OTA updates (CodePush) vs full store releases?",
          a: "**CodePush**: JS-only changes — bug fixes, copy changes, feature flag adjustments, minor UI updates. Advantages: instant delivery (no store review), no user action needed. Limitations: can't change native code, large bundle updates are slow. **Store release**: Any change touching native code, new native dependencies, React Native version upgrades, significant feature launches. Both Apple and Google have policies against using OTA updates to bypass App Store review for significant feature changes — use OTA for fixes, not feature launches.",
        },
      ],
    },
  ],
};

export default rnPhase11;
