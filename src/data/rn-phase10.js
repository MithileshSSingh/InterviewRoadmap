const rnPhase10 = {
  id: "phase-10",
  title: "Phase 10: Debugging & Production Resiliency",
  emoji: "🔍",
  description: "Real-world debugging scenarios — memory leaks, race conditions, bridge overload, crash analytics, API failure cascading, and systematic debugging mindset for production issues.",
  topics: [
    {
      id: "systematic-debugging",
      title: "Systematic Debugging Mindset",
      explanation: `**Production debugging** at the senior level is systematic, not ad-hoc. You need a mental framework that works for ANY problem, not memorized solutions for specific bugs.

**The CLEAR debugging framework:**
\`\`\`
C — Collect evidence (logs, crash reports, user reports, metrics)
L — Localize the problem (which layer? JS? Native? Network? State?)
E — Establish hypotheses (ranked by likelihood)
A — Act on highest-probability hypothesis (instrument, reproduce, verify)
R — Remediate and prevent (fix, monitor, post-mortem)
\`\`\`

**Layer isolation for React Native:**
\`\`\`
Problem Symptoms → Localization Questions

UI not updating → Is state changing? (React DevTools)
                → Is reconciliation running? (Profiler)
                → Is native view updating? (Layout Inspector)

App crashes     → JS exception? (error boundary, Sentry)
                → Native crash?  (Crashlytics, Android logcat, iOS crash log)
                → OOM? (memory profiler)

Slow performance → JS thread blocked? (Hermes profiler)
                 → Bridge congestion? (MessageQueue spy)
                 → Native slow? (Android Systrace, iOS Instruments)
                 → Too many re-renders? (React Profiler)

Network issues  → Request sent? (Flipper network inspector)
                → Response received? (status code, timing)
                → Data parsed correctly? (response shape)
                → State updated? (state inspection)
\`\`\`

**Tools for RN debugging at scale:**
1. **Flipper** — Network inspector, Hermes profiler, React DevTools, Layout Inspector
2. **Sentry** — Error tracking with source maps, breadcrumbs, session replay
3. **Crashlytics** — Native crash reporting (separate from JS errors)
4. **Reactotron** — State inspection, API monitoring, custom logging
5. **Android Studio Profiler / Xcode Instruments** — Native-level profiling
6. **React DevTools Profiler** — Component render analysis`,
      codeExample: `// === REAL-WORLD DEBUGGING SCENARIOS ===

// SCENARIO 1: Memory leak investigation
// Symptom: App memory grows by 50MB over 30 minutes of normal use

// Step 1: Instrument memory tracking
class MemoryMonitor {
  private readings: { timestamp: number; jsHeap: number; nativeHeap: number }[] = [];
  
  start(intervalMs = 5000) {
    setInterval(() => {
      const jsHeap = performance?.memory?.usedJSHeapSize ?? 0;
      this.readings.push({
        timestamp: Date.now(),
        jsHeap,
        nativeHeap: 0, // Requires native module
      });
      
      // Alert if growth rate is abnormal
      if (this.readings.length >= 10) {
        const oldestRecent = this.readings[this.readings.length - 10];
        const growth = jsHeap - oldestRecent.jsHeap;
        if (growth > 10 * 1024 * 1024) { // 10MB growth in 50 seconds
          ErrorReporter.report(new Error(\`Memory leak detected: \${growth} bytes growth\`), {
            readings: this.readings.slice(-10),
          });
        }
      }
    }, intervalMs);
  }
}

// Step 2: Screen-level leak detection
function useScreenMemoryCheck(screenName: string) {
  useEffect(() => {
    const mountJsHeap = performance?.memory?.usedJSHeapSize ?? 0;
    
    return () => {
      // Schedule check for AFTER GC has a chance to run
      setTimeout(() => {
        const unmountJsHeap = performance?.memory?.usedJSHeapSize ?? 0;
        const retained = unmountJsHeap - mountJsHeap;
        
        if (retained > 5 * 1024 * 1024) { // 5MB retained after unmount
          analytics.track('potential_memory_leak', {
            screen: screenName,
            retainedBytes: retained,
          });
        }
      }, 3000); // Wait for GC
    };
  }, []);
}

// SCENARIO 2: Race condition debugging
// Symptom: Sometimes the profile screen shows the wrong user's data

// The bug:
function ProfileScreen({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<User | null>(null);
  
  useEffect(() => {
    // ❌ RACE CONDITION: If userId changes quickly,
    // the response from the first request might arrive AFTER the second
    api.getUser(userId).then(setProfile);
  }, [userId]);
  
  // User A's profile loads → userId changes to B → B's request starts
  // → A's response arrives (slow network) → shows A's data for B's screen!
}

// The fix:
function ProfileScreen({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<User | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    
    api.getUser(userId, { signal: controller.signal })
      .then(data => {
        if (!cancelled) setProfile(data);
      })
      .catch(err => {
        if (err.name !== 'AbortError' && !cancelled) {
          ErrorReporter.report(err);
        }
      });
    
    return () => {
      cancelled = true;
      controller.abort(); // Actually cancel the network request
    };
  }, [userId]);
}

// SCENARIO 3: Bridge overload (old architecture)
// Symptom: App becomes unresponsive during scroll

// Diagnostic: MessageQueue spy
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';

if (__DEV__) {
  MessageQueue.spy((msg) => {
    // Log bridge messages to find excessive traffic
    if (msg.type === 0) { // JS → Native call
      console.log(\`Bridge: JS→Native \${msg.module}.\${msg.method}\`);
    }
  });
}

// Common causes of bridge overload:
// 1. Passing large objects through bridge (images, JSON payloads)
// 2. Calling native methods in scroll handlers (onScroll → bridge call per frame)
// 3. Animated values not using useNativeDriver
// 4. Frequent state updates triggering multiple bridge round-trips

// SCENARIO 4: Crash analytics investigation
// Production crash: "TypeError: Cannot read property 'name' of undefined"

// Step 1: Check Sentry breadcrumbs
// What happened before the crash?
// Navigation: Home → Feed → Profile → CRASH
// API call: GET /user/123 → 200 OK
// State update: setUser(response.data)

// Step 2: The response.data was { user: null } (user deleted)
// Step 3: Code assumed user always exists

// Prevention: Defensive coding + runtime validation
function ProfileScreen({ route }) {
  const { data, error, isLoading } = useUser(route.params.userId);
  
  // Guard every access — never assume shape
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <NotFoundState message="User not found" />;
  
  // Now TypeScript narrows data to User (non-null)
  return <ProfileView user={data} />;
}`,
      exercise: `**Debugging Exercises:**
1. Deliberately create a memory leak (event listener in useEffect without cleanup) and use Hermes profiler to find it
2. Create a race condition in a search component (fast typing + slow API) and fix it with AbortController
3. Set up Sentry in your app with source maps and trigger an error to see the full stack trace
4. Use Flipper to inspect network requests and identify a slow API call causing UI lag
5. Profile your app's re-renders using React DevTools Profiler — find the costliest component
6. Create a crash reporting pipeline that captures: error, breadcrumbs, device info, and app state`,
      commonMistakes: [
        "Debugging by guessing instead of systematic investigation — always collect evidence first, then form hypotheses",
        "Not setting up error tracking (Sentry) before launch — you can't debug what you can't see; crashes in production are invisible without tracking",
        "Ignoring non-fatal errors — warning-level errors often indicate bugs that will become critical under different conditions",
        "Not correlating crashes with app version/device/OS — a crash might only affect Android 11 on Samsung devices due to a vendor-specific behavior",
        "Removing debug logging before understanding the issue — keep diagnostic code until the fix is verified in production",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your React Native app has a 2% crash rate. The PM wants you to reduce it to 0.5%. Walk me through your approach.",
          a: "**Systematic crash reduction:** (1) **Categorize**: Group crashes by type (JS exception, native crash, OOM, ANR). (2) **Prioritize**: Sort by frequency × impact. Fix the top 5 crashes first — they likely represent 80% of occurrences (Pareto). (3) **JS crashes**: Add error boundaries on every screen, implement global unhandled rejection handler, add runtime API response validation (Zod/yup). (4) **Native crashes**: Audit native modules, update dependencies, add null checks in bridge callbacks. (5) **OOM**: Implement memory monitoring, optimize image caching, fix leak patterns. (6) **ANR**: Profile main thread — find blocking operations, move to background. (7) **Prevent regressions**: Add crash rate monitoring in CI/CD — block releases if crash rate exceeds threshold. (8) **Measure**: Track crash-free session rate weekly, target 99.5%.",
        },
        {
          type: "scenario",
          q: "Production users report intermittent blank screens. Crashes don't show in Sentry. How do you investigate?",
          a: "**Blank screen without crash = render failure without exception.** (1) Check if error boundaries are catching errors — a boundary might show a blank fallback. Add logging to all boundary `componentDidCatch`. (2) Check for conditional rendering bugs — a state value might be null/undefined causing empty render without crashing. (3) Check network-related rendering — if a screen renders nothing while loading and the loading signal is lost. (4) Investigate race conditions in navigation — navigating before data is ready. (5) Check native view issues — on Android, views can be detached from window without JS errors. (6) Add breadcrumbs: log component mount/unmount, state transitions, navigation events. (7) Add screen-level render validation — if a screen renders successfully, log it; if mount fires but no meaningful render follows, report it.",
        },
      ],
    },
  ],
};

export default rnPhase10;
