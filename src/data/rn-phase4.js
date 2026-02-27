const rnPhase4 = {
  id: "phase-4",
  title: "Phase 4: React Native Internals (Critical)",
  emoji: "📱",
  description: "Deep internals of React Native — old vs new architecture, Bridge vs JSI, TurboModules, Fabric renderer, Hermes engine, native module creation, and the Yoga layout engine.",
  topics: [
    {
      id: "old-vs-new-architecture",
      title: "Old Architecture vs New Architecture",
      explanation: `**React Native's architecture underwent a complete overhaul** starting with the New Architecture (released stable in RN 0.76). Understanding both is critical because most production apps still use the old architecture or are mid-migration.

**Old Architecture (Bridge-based):**
\`\`\`
JS Thread ←→ [Bridge (JSON serialization)] ←→ Native Thread(s)
\`\`\`

- **3 threads**: JS Thread, Main/UI Thread, Shadow Thread (layout)
- **Bridge**: All communication between JS and Native goes through an asynchronous bridge
- **Serialization**: Every message is serialized to JSON, sent across the bridge, deserialized on the other side
- **Batching**: Messages are batched (typically every 5ms) to reduce overhead
- **Asynchronous**: All bridge communication is async — you can't call a native method and get a synchronous return value

**Problems with the Old Architecture:**
1. **Serialization overhead**: Every object crossing the bridge is JSON.stringify'd → sent → JSON.parse'd
2. **Asynchronous only**: Can't do synchronous native calls (needed for gestures, layout measurements)
3. **Single-threaded bridge**: Bottleneck when many messages are in flight
4. **Startup cost**: All native modules are initialized at startup, even unused ones
5. **No type safety**: Bridge messages are untyped JSON — runtime crashes instead of compile errors

**New Architecture:**
\`\`\`
JS Thread ←→ [JSI (C++ direct binding)] ←→ Native Thread(s)
                                              ↓
                                    [Fabric Renderer]
                                    [TurboModules]
\`\`\`

- **JSI (JavaScript Interface)**: C++ API that lets JS directly call native methods — no serialization, no bridge
- **TurboModules**: Lazy-loaded native modules with type-safe interfaces (codegen from TypeScript specs)
- **Fabric**: New rendering system that enables synchronous layout, concurrent rendering, and direct C++ manipulation of the view tree
- **Codegen**: TypeScript specs auto-generate native interfaces — type safety across JS ↔ Native boundary

**Key improvements:**
| Aspect | Old Architecture | New Architecture |
|--------|-----------------|-----------------|
| Communication | Async bridge (JSON) | Direct JSI (C++ refs) |
| Module loading | All at startup | Lazy (on first use) |
| Type safety | None (JSON) | Codegen from TS specs |
| Synchronous calls | Impossible | Supported |
| Rendering | Async only | Sync + async |
| Layout | Shadow thread | Can run on any thread |
| Startup time | Slow (all modules init) | Fast (lazy modules) |`,
      codeExample: `// === OLD ARCHITECTURE: Bridge Communication ===

// How a native module call works in the OLD architecture:
// 1. JS calls NativeModules.MyModule.getData()
// 2. This creates a JSON message: {"module":"MyModule","method":"getData","args":[]}
// 3. Message is queued in the bridge buffer
// 4. Bridge flushes (every ~5ms or 100 messages)
// 5. Native receives JSON, deserializes, finds module, calls method
// 6. Result serialized to JSON, sent back through bridge
// 7. JS receives, deserializes, resolves the Promise

// Total overhead per call:
// 2x JSON serialization + 2x bridge crossing + async scheduling
// For a 1KB object: ~0.5-2ms per call
// For 100 calls/frame: 50-200ms → DROPPED FRAMES

// === NEW ARCHITECTURE: JSI Direct Binding ===

// How JSI works:
// JS objects hold direct C++ references (HostObjects)
// No serialization, no bridge, no async overhead

// TurboModule spec (TypeScript → generates native interfaces)
// specs/NativeDeviceInfo.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Codegen generates native implementations from these signatures
  getDeviceName(): string;           // Synchronous! (impossible in old arch)
  getBatteryLevel(): Promise<number>; // Async when needed
  getConstants(): {
    platform: string;
    version: string;
    isTablet: boolean;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('DeviceInfo');

// Usage — looks the same to the developer:
import DeviceInfo from './specs/NativeDeviceInfo';

const name = DeviceInfo.getDeviceName();        // SYNCHRONOUS call via JSI
const battery = await DeviceInfo.getBatteryLevel(); // Async when appropriate

// === FABRIC RENDERER ===

// Old architecture rendering:
// JS creates React tree → Shadow tree (layout on shadow thread) 
// → bridge message → UI thread creates native views
// All async, all through bridge

// New architecture (Fabric):
// JS creates React tree → Fabric creates shadow tree in C++
// → Yoga computes layout (can run on ANY thread)
// → Directly mutates native view tree (no bridge)
// → Enables synchronous measurements and concurrent rendering

// Fabric component spec:
// specs/NativeCustomView.ts
import type { ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

interface NativeProps extends ViewProps {
  color: string;
  borderRadius?: number;
  onCustomEvent?: (event: { value: string }) => void;
}

export default codegenNativeComponent<NativeProps>('CustomView');

// Why synchronous matters for performance:
// Gesture handling: touch → measure → transform → draw
// Old arch: touch → bridge → measure → bridge → transform → bridge → draw
//           (3 async round-trips = visible lag)
// New arch: touch → measure → transform → draw (all synchronous via JSI)`,
      exercise: `**Architecture Deep Dive:**
1. Enable the New Architecture in a React Native 0.76+ project and compare startup times
2. Create a TurboModule spec and observe the auto-generated native code
3. Profile bridge traffic in the old architecture using MessageQueue spy
4. Measure the performance difference between a bridge-based native module call and a JSI-based one
5. Create a Fabric component with codegen and compare it to the old createNativeComponent approach
6. Document the migration steps needed to move your app from old to new architecture`,
      commonMistakes: [
        "Assuming the new architecture is automatically faster — it enables faster patterns but you still need to use them correctly",
        "Not testing third-party libraries for new architecture compatibility — many libraries still rely on the bridge",
        "Enabling new architecture without updating native modules — old modules work via an interop layer but with degraded performance",
        "Not understanding that JSI doesn't mean everything is synchronous — you should still use async for expensive operations to avoid blocking the JS thread",
        "Ignoring codegen type specs — writing native modules without specs loses the type safety benefit of the new architecture",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the key differences between the Bridge and JSI.",
          a: "**Bridge**: Asynchronous, JSON-serialized message passing between JS and Native. Every call involves serialization overhead, batching delay, and cannot return synchronous values. **JSI (JavaScript Interface)**: C++ API that allows JS to hold direct references to C++ objects (HostObjects). No serialization — JS can call C++ methods directly with native types. Enables synchronous calls, zero-copy data sharing, and eliminates the bridge bottleneck. JSI is the foundation for TurboModules (lazy native modules) and Fabric (synchronous rendering).",
        },
        {
          type: "scenario",
          q: "Your team is deciding whether to migrate to the new architecture. What factors do you consider?",
          a: "**For migration:** (1) Performance-critical features (gestures, animations) benefit from synchronous JSI calls. (2) Startup time improvement from lazy TurboModules. (3) Type safety from codegen reduces runtime crashes. (4) Future-proofing — new RN features will target new arch only. **Against/risks:** (1) Third-party library compatibility — audit all dependencies. (2) Custom native modules need rewriting. (3) Testing effort — behavioral changes in rendering. (4) Team expertise. **Recommendation:** Start with new arch for new modules, use interop layer for existing, migrate incrementally. Gate behind a feature flag and compare crash rates.",
        },
        {
          type: "conceptual",
          q: "What are TurboModules and how do they differ from the old NativeModules?",
          a: "**Old NativeModules**: All registered native modules are initialized at app startup, whether used or not. Communication through the async bridge with JSON serialization. No type safety — runtime errors for mismatched arguments. **TurboModules**: Lazy-loaded on first access via JSI. TypeScript specs define the interface, and codegen generates native code — type safety across the JS/Native boundary. Supports synchronous return values. Modules only initialize when accessed — faster startup. TurboModules can also share C++ code across platforms.",
        },
      ],
    },
    {
      id: "threading-model",
      title: "Threading Model & Data Flow",
      explanation: `**React Native runs on multiple threads**, and understanding the threading model is essential for debugging performance issues, race conditions, and ANR (Application Not Responding) errors.

**Thread overview:**

1. **JS Thread** — Runs the JavaScript engine (Hermes/JSC). Executes your React components, business logic, state management, API calls. **Single-threaded** — only one JS operation at a time.

2. **Main/UI Thread** — The native platform's main thread. Handles native UI rendering, touch events, native animations. On Android, blocking this thread for >5s triggers an ANR dialog.

3. **Shadow Thread** (Old Architecture) — Runs Yoga layout calculations in the background. Computes flexbox layout and sends results to the UI thread. In the new architecture, layout can run on any thread.

4. **Native Modules Thread(s)** — Custom background threads for native module work (file I/O, image processing, etc.)

**Data flow in the old architecture:**
\`\`\`
User taps button (UI Thread)
  → Touch event serialized to JSON
  → Bridge → JS Thread
  → React processes event, updates state
  → New render tree created
  → Diff computed (reconciliation)
  → Bridge → Shadow Thread
  → Yoga computes layout
  → Bridge → UI Thread
  → Native views updated
\`\`\`

**Data flow in the new architecture (Fabric):**
\`\`\`
User taps button (UI Thread)
  → JSI → JS Thread (synchronous via JSI)
  → React processes event
  → Fabric creates shadow tree in C++
  → Yoga computes layout (can be on any thread)
  → Fabric directly updates native views
\`\`\`

**Where bottlenecks happen:**
1. **JS Thread overload** — Heavy computation (JSON parsing, data transformation, complex rendering) blocks event processing
2. **Bridge congestion** — Too many messages/frame causes queue buildup and delayed responses (old arch)
3. **UI Thread blocking** — Heavy native operations (image decoding, custom drawing) cause frames to drop
4. **Thread coordination** — Race conditions between JS and native state updates`,
      codeExample: `// === THREAD AWARENESS IN PRACTICE ===

// 1. Detecting JS Thread blocking
// If the JS thread is blocked, ALL of these stop working:
// - setTimeout/setInterval callbacks
// - Promise resolutions
// - React state updates
// - Touch event processing (events queue up)

// Diagnostic: JS thread block detector
let lastTick = Date.now();
setInterval(() => {
  const now = Date.now();
  const elapsed = now - lastTick;
  if (elapsed > 100) {  // Expected: ~16ms
    console.warn(\`JS Thread blocked for \${elapsed}ms\`);
    // In production: report to analytics
  }
  lastTick = now;
}, 16);

// 2. Moving work OFF the JS thread

// ❌ Blocking the JS thread with heavy computation
function processLargeDataset(data: any[]) {
  // This runs on the JS thread — blocks UI for 500ms+
  return data
    .filter(item => complexPredicate(item))
    .map(item => heavyTransformation(item))
    .sort((a, b) => a.score - b.score);
}

// ✅ Use InteractionManager to defer
import { InteractionManager } from 'react-native';

async function processLargeDatasetAsync(data: any[]) {
  // Wait for animations/transitions to complete
  await InteractionManager.runAfterInteractions();
  
  // Process in chunks to keep JS thread responsive
  const CHUNK_SIZE = 100;
  const results = [];
  
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    const processed = chunk
      .filter(item => complexPredicate(item))
      .map(item => heavyTransformation(item));
    results.push(...processed);
    
    // Yield to event loop between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results.sort((a, b) => a.score - b.score);
}

// 3. Native-driven animations bypass JS thread
import Animated from 'react-native-reanimated';

// Reanimated runs animations on the UI thread via worklets
// JS thread can be completely blocked and animations still run smooth
const animatedStyle = useAnimatedStyle(() => {
  'worklet'; // This code runs on the UI thread, not JS thread
  return {
    transform: [{ translateX: withSpring(offset.value) }],
    opacity: interpolate(offset.value, [0, 100], [1, 0]),
  };
});

// 4. Thread-safe communication patterns
// Using shared values (Reanimated) for cross-thread data
const scrollOffset = useSharedValue(0);

// UI thread (gesture handler worklet)
const gestureHandler = useAnimatedGestureHandler({
  onActive: (event) => {
    'worklet';
    scrollOffset.value = event.translationY; // UI thread
  },
  onEnd: () => {
    'worklet';
    // Trigger JS thread callback for state update
    runOnJS(updateState)(scrollOffset.value); // Cross-thread safely
  },
});`,
      exercise: `**Threading Exercises:**
1. Add the JS thread block detector above to your app — identify what operations cause >50ms blocks
2. Profile your app using Flipper's Performance plugin — identify which thread is the bottleneck
3. Move a heavy computation to a web worker or native module and compare JS thread responsiveness
4. Create a Reanimated worklet animation that runs while the JS thread is deliberately blocked with a heavy loop
5. Implement chunked data processing that yields to the event loop between chunks
6. Measure the difference in touch responsiveness with and without a heavy JS computation running`,
      commonMistakes: [
        "Blocking the JS thread with synchronous operations — JSON.parse of large payloads, complex sorting, heavy regex operations",
        "Assuming React Native animations run on the JS thread — Animated with useNativeDriver and Reanimated run on the UI thread",
        "Not using InteractionManager.runAfterInteractions — expensive work during navigation transitions causes janky animations",
        "Running heavy native operations on the main thread — image processing, file I/O should use background threads",
        "Not understanding that setInterval in JS doesn't guarantee timing — if the JS thread is busy, intervals are delayed, not dropped",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain React Native's threading model and why it matters for performance.",
          a: "RN uses multiple threads: **JS Thread** (single-threaded, runs React + business logic), **UI Thread** (native rendering, touch events), **Shadow Thread** (layout via Yoga). Performance problems arise when: (1) JS thread is blocked — UI events queue up, touches feel laggy. (2) Bridge is congested — too many JS↔Native messages per frame. (3) UI thread is blocked — frames drop, ANR on Android. The key insight: animations should run on the UI thread (useNativeDriver/Reanimated), expensive JS work should be chunked or deferred, and native operations should use background threads.",
        },
        {
          type: "scenario",
          q: "Users report that scrolling becomes janky when the app receives push notifications in the background. What's happening?",
          a: "**Diagnosis:** Push notification handling triggers heavy JS work (parsing payload, updating state, re-rendering notification badge) that blocks the JS thread during scroll. Even though scrolling is native, JS thread blocking delays `onScroll` callbacks and any JS-based scroll effects. **Fixes:** (1) Defer notification processing: `InteractionManager.runAfterInteractions(() => processNotification(payload))`. (2) Use native-driven scroll animations (useNativeDriver) so scroll itself doesn't need JS thread. (3) Minimize JS work in the notification handler — just update a counter, defer full processing. (4) Consider handling notifications entirely in native code and syncing state when the user pauses scrolling.",
        },
      ],
    },
    {
      id: "hermes-engine",
      title: "Hermes Engine & Yoga Layout",
      explanation: `**Hermes** is Meta's JavaScript engine optimized specifically for React Native. It replaced JavaScriptCore (JSC) as the default engine and provides significant improvements in startup time, memory usage, and runtime performance.

**Hermes key features:**
1. **Ahead-of-Time (AOT) bytecode compilation**: JS is compiled to bytecode at BUILD time, not at runtime. The app ships bytecode instead of JS text files.
2. **Reduced startup time**: No parsing/compiling JS at launch — bytecode loads directly. Typical improvement: 30-50% faster start.
3. **Lower memory footprint**: Optimized garbage collector, smaller runtime, no JIT compiler (intentionally — JIT uses more memory).
4. **Incremental GC**: Short pauses instead of long stop-the-world GC cycles. Critical for 60fps rendering.
5. **ES6+ support**: Proxies, async/await, Intl, WeakRef, FinalizationRegistry — most modern JS features.

**Hermes limitations to know:**
- No JIT compilation — pure interpreter + AOT bytecode. Computation-heavy loops are slower than V8/JSC with JIT.
- \`eval()\` is limited — dynamic code evaluation doesn't benefit from AOT.
- Some Intl features are behind flags or limited.
- Debugging uses Chrome DevTools Protocol (different from Safari for JSC).

**Yoga Layout Engine:**
Yoga is Meta's cross-platform layout engine that implements a subset of CSS Flexbox. Every React Native component's layout is computed by Yoga.

**Yoga key behaviors:**
- Default \`flexDirection\` is \`column\` (not \`row\` like web CSS)
- Default \`alignItems\` is \`stretch\` 
- All dimensions are unitless (density-independent pixels)
- Percentage values are relative to the parent's equivalent dimension
- Yoga runs on the Shadow thread (old arch) or any thread (new arch)
- Absolute positioning uses \`position: 'absolute'\` with \`top/left/right/bottom\`

**Layout performance considerations:**
- Deep view hierarchies slow down Yoga calculations — flatten where possible
- Frequent layout recalculations (dynamic content, keyboard) trigger Yoga repeatedly
- \`onLayout\` callbacks fire on the JS thread after Yoga completes — can cause additional re-renders`,
      codeExample: `// === HERMES OPTIMIZATION TECHNIQUES ===

// 1. Check if Hermes is running
const isHermes = () => !!global.HermesInternal;
console.log('Using Hermes:', isHermes());

// 2. Hermes bytecode compilation
// In metro.config.js, Hermes automatically compiles your JS:
// source.js → compiled.hbc (Hermes Bytecode)
// The .hbc file is what ships in the APK/IPA

// 3. Profile-Guided Optimization
// Hermes supports basic profile-guided compilation
// Record hot functions → optimize their bytecode
// This is configured in the build system, not in code

// 4. Memory optimization with Hermes GC
// Hermes uses a moving GC — objects can be relocated in memory
// This means: DO NOT hold native pointers to JS objects
// Use the new architecture (JSI) for proper C++ ↔ JS references

// === YOGA LAYOUT DEEP DIVE ===

// 5. Flexbox differences from web CSS
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // RN default: flexDirection: 'column' (web default: 'row')
  container: {
    flex: 1,
    // These are RN-specific defaults different from web:
    // flexDirection: 'column'  (web: 'row')
    // alignItems: 'stretch'    (web: 'stretch' — same)
    // flexShrink: 0            (web: 1)
  },
  
  // Absolute positioning — same concept, simpler API
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    // No z-index needed usually — later in source = higher
  },
  
  // Percentage sizes
  halfWidth: {
    width: '50%',   // 50% of parent's width
    height: '100%', // 100% of parent's height
  },
});

// 6. Layout performance: FLAT vs NESTED
// ❌ Deep nesting — Yoga must calculate more nodes
const DeepNested = () => (
  <View style={styles.wrapper}>
    <View style={styles.outer}>
      <View style={styles.middle}>
        <View style={styles.inner}>
          <Text>Content</Text>
        </View>
      </View>
    </View>
  </View>
);

// ✅ Flattened — fewer Yoga calculations
const Flattened = () => (
  <View style={styles.container}>
    <Text style={styles.content}>Content</Text>
  </View>
);

// 7. Avoiding layout thrashing
// ❌ Reading layout then immediately causing re-layout
const BadPattern = () => {
  const [height, setHeight] = useState(0);
  
  return (
    <View 
      onLayout={(e) => {
        // This fires → sets state → re-render → new layout → repeat
        setHeight(e.nativeEvent.layout.height);
      }}
      style={{ minHeight: height + 50 }} // Depends on height — layout loop!
    >
      <Text>Content</Text>
    </View>
  );
};

// ✅ Use onLayout for reading, not for creating dependency loops
const GoodPattern = () => {
  const [height, setHeight] = useState(0);
  
  return (
    <>
      <View onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        <Text>Measured Content</Text>
      </View>
      {/* Height used by DIFFERENT component — no loop */}
      <View style={{ height: height + 50 }}>
        <Text>Sized based on above</Text>
      </View>
    </>
  );
};`,
      exercise: `**Hermes & Yoga Exercises:**
1. Profile your app's startup time with and without Hermes (if you can test both engines)
2. Use \`global.HermesInternal?.getRuntimeProperties()\` to inspect Hermes runtime details
3. Create a deep view hierarchy (10+ levels) and measure layout time using the Performance monitor
4. Flatten a complex nested layout and compare Yoga computation time
5. Implement a responsive layout using Yoga's percentage and flex properties that adapts to different screen sizes
6. Create a layout that triggers a layout loop (onLayout → setState → re-render) and then fix it`,
      commonMistakes: [
        "Assuming Hermes has JIT like V8 — Hermes intentionally omits JIT to save memory and startup time; heavy math loops will be slower",
        "Using eval() or dynamic code loading with Hermes — bytecode is compiled at build time, dynamic code can't benefit from AOT",
        "Not knowing that RN's flexDirection defaults to 'column' — coming from web CSS where default is 'row' causes layout confusion",
        "Creating deeply nested view hierarchies — each nested View adds a Yoga node that must be calculated; flatten when possible",
        "Using onLayout to create circular layout dependencies — measuring → setting state → re-layout → measuring again = infinite loop",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the advantages and trade-offs of Hermes over JavaScriptCore?",
          a: "**Advantages**: (1) AOT bytecode compilation → 30-50% faster startup (no parse/compile at runtime). (2) Lower memory usage — no JIT compiler overhead, optimized GC. (3) Incremental GC — shorter pauses, better for 60fps. (4) Smaller engine binary size. **Trade-offs**: (1) No JIT → pure computation (tight loops, heavy math) is slower than V8/JSC with JIT. (2) Limited eval() support. (3) Some ES features may ship later. (4) Different debugging tools (Chrome DevTools Protocol vs Safari). For React Native, the trade-offs are overwhelmingly positive — startup and memory matter more than raw compute speed for mobile apps.",
        },
        {
          type: "conceptual",
          q: "How does Yoga's flexbox differ from web CSS flexbox?",
          a: "Key differences: (1) Default `flexDirection: 'column'` (web: 'row'). (2) Default `flexShrink: 0` (web: 1) — items don't shrink by default in RN. (3) No `display: inline`, `float`, `grid` — only flexbox. (4) Units are always density-independent pixels (no px, em, rem). (5) Percentage values work but are limited — some percentage-based web patterns don't work. (6) `aspectRatio` is supported natively (not standard in web CSS flex). (7) All text must be inside `<Text>` components.",
        },
        {
          type: "scenario",
          q: "Your React Native app uses 300MB of memory and crashes on low-end devices. How do you investigate and reduce memory usage?",
          a: "**Investigation:** (1) Use Hermes heap profiler (Flipper) to take heap snapshots and identify largest object graphs. (2) Check image memory — RN images are decoded into full bitmaps in memory. (3) Monitor native memory separately — JS heap is only part of the picture. **Reduction strategies:** (1) Image optimization: use resizeMode, reduce resolution, implement LRU cache with size limits (react-native-fast-image). (2) List virtualization: ensure FlatList's windowSize and maxToRenderPerBatch are tuned. (3) Component unmounting: screens not in the navigation stack should be fully unmounted. (4) Reduce JS heap: normalize state, avoid duplicated data, use refs instead of state for non-rendering data. (5) Native memory: release native resources (video players, maps) when screens unmount.",
        },
      ],
    },
  ],
};

export default rnPhase4;
