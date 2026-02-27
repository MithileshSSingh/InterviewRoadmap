const rnPhase3 = {
  id: "phase-3",
  title: "Phase 3: React Internals (Senior Level)",
  emoji: "⚛️",
  description: "Deep dive into React's internal mechanisms — Virtual DOM, Fiber architecture, reconciliation, hooks internals, concurrent rendering, and memoization strategies for production optimization.",
  topics: [
    {
      id: "virtual-dom-reconciliation",
      title: "Virtual DOM & Reconciliation Algorithm",
      explanation: `**The Virtual DOM** is React's in-memory representation of the UI. It's a lightweight JavaScript object tree that mirrors the actual DOM (web) or native view hierarchy (React Native). When state changes, React creates a NEW virtual tree, diffs it against the previous one, and applies minimal updates.

**Why this matters for React Native:**
In RN, the "DOM" is the native view hierarchy (UIView on iOS, android.view.View on Android). Reconciliation determines which native views to create, update, or destroy — each operation crosses the JS-Native bridge, so minimizing them is critical for performance.

**Reconciliation Algorithm (Diffing):**
React uses a heuristic O(n) algorithm instead of the optimal O(n³) tree diff:

1. **Different types → full replace**: If a \`<View>\` becomes a \`<ScrollView>\`, React destroys the entire subtree and rebuilds. No attempt to match children.

2. **Same type → update props**: If a \`<Text style={A}>\` becomes \`<Text style={B}>\`, React updates only the changed props. No remount.

3. **Lists → key-based matching**: For sibling elements, React uses \`key\` to match old and new elements. Without keys, React matches by index — leading to bugs and unnecessary remounts.

**The key prop deep dive:**
- Keys must be **stable, unique, and predictable** across renders
- Using array index as key is wrong when items can be reordered, inserted, or deleted
- Keys should be domain identifiers (database IDs), NOT random values (Math.random()) which defeat the purpose
- Key changes force unmount/remount — useful for resetting component state

**What reconciliation CAN'T optimize:**
- Moving a component to a different parent still causes unmount/remount
- Changing component type (even if structure is identical) causes full teardown
- Deep tree changes propagate even if only a leaf changed — this is where memoization helps`,
      codeExample: `// === RECONCILIATION IN ACTION ===

// Scenario 1: Element type change → full teardown
// Before:
<View style={styles.container}>
  <TextInput value={text} />
</View>

// After: Changed View to ScrollView
<ScrollView style={styles.container}>
  <TextInput value={text} />  {/* TextInput is REMOUNTED — loses focus, state */}
</ScrollView>
// React destroys entire <View> subtree and creates new <ScrollView> subtree

// Scenario 2: Same type → prop update (efficient)
// Before:
<Text style={{ color: 'red' }}>Hello</Text>
// After:
<Text style={{ color: 'blue' }}>Hello</Text>
// React only updates the color prop on the existing native TextView

// Scenario 3: Key-based reconciliation
// ❌ BAD: Using index as key with reorderable list
function TaskList({ tasks }) {
  return tasks.map((task, index) => (
    <TaskItem key={index} task={task} />
    // If tasks are reordered, index stays the same but task changes
    // React sees same key → updates props instead of moving
    // Internal state (checkbox, text input) stays with the wrong item!
  ));
}

// ✅ GOOD: Using stable IDs as keys
function TaskList({ tasks }) {
  return tasks.map((task) => (
    <TaskItem key={task.id} task={task} />
    // If tasks are reordered, React matches by ID
    // Moves the native views instead of updating wrong ones
  ));
}

// Scenario 4: Key change to force remount (intentional reset)
function ProfileScreen({ userId }) {
  // When userId changes, we want to completely reset the form
  return <ProfileForm key={userId} userId={userId} />;
  // Key change → old ProfileForm unmounts, new one mounts with fresh state
}

// === UNDERSTANDING WHAT TRIGGERS RECONCILIATION ===

// Every setState/dispatch/context change triggers:
// 1. Component re-renders (function called again)
// 2. New virtual tree created for that subtree
// 3. Diffed against previous virtual tree
// 4. Minimal native view updates sent across bridge

// This is WHY re-renders themselves aren't expensive — 
// the RECONCILIATION output (bridge calls) is expensive.

// Proving it: component renders 1000 times but if output is same,
// zero native updates occur
function ExpensiveRender() {
  const [, forceRender] = useState(0);
  
  // This re-renders but produces identical virtual tree
  // React's reconciliation finds zero diffs → zero bridge calls
  useEffect(() => {
    const id = setInterval(() => forceRender(n => n + 1), 10);
    return () => clearInterval(id);
  }, []);
  
  return <Text>Static content</Text>; // Same every time
}`,
      exercise: `**Reconciliation Deep Dive:**
1. Create a list of 100 items, add an item at the beginning — measure performance with index keys vs ID keys
2. Build a component that conditionally renders \`<View>\` or \`<ScrollView>\` and observe the remount behavior using useEffect cleanup logs
3. Implement a key-change based animation by forcing remount of a component with a new key
4. Profile reconciliation using React DevTools Profiler — identify which components re-render unnecessarily
5. Create a scenario where moving a component to a different parent causes visible state loss`,
      commonMistakes: [
        "Using array index as key for dynamic lists — causes incorrect state association when items are reordered or deleted",
        "Using Math.random() or Date.now() as key — creates new key every render, forcing full remount every time",
        "Assuming re-renders are expensive — re-renders (calling the function) are cheap, it's the reconciliation OUTPUT (bridge calls) that's expensive",
        "Wrapping everything in React.memo to prevent re-renders — this adds comparison overhead that can be worse than the re-render itself for simple components",
        "Not understanding that parent re-render triggers child re-render even if child props haven't changed — this is by design, use memo strategically",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is React's diffing algorithm O(n) instead of the theoretically optimal O(n³)?",
          a: "React makes two heuristic assumptions: (1) Elements of different types produce different trees — no attempt to match children across type changes. (2) The `key` prop hints which children are stable across renders. These assumptions hold true for 99% of real-world UI updates (you rarely transform a `<div>` into a `<span>` while keeping the same children). This reduces the generic tree diff problem from O(n³) to O(n) by only comparing nodes at the same level.",
        },
        {
          type: "scenario",
          q: "Users report that form inputs lose their values when they scroll in a FlatList. What's happening?",
          a: "**Root cause: FlatList virtualizes items** — it unmounts off-screen items and remounts them when scrolled back. If form state is stored inside the list item component (local useState), it's lost on unmount. **Fixes:** (1) Lift form state to the parent using a Map<itemId, formValues>. (2) Use a state management library that persists state independently of component lifecycle. (3) If using FlatList's `initialNumToRender` and `windowSize` props, increase them to keep more items mounted. (4) For truly long forms, consider a non-virtualized ScrollView.",
        },
        {
          type: "tricky",
          q: "What happens when you change a component's key from 'A' to 'B' and back to 'A'?",
          a: "Each key change causes a full unmount → remount cycle. Changing from 'A' to 'B': the instance with key 'A' unmounts (state destroyed, cleanup effects run), a new instance with key 'B' mounts (fresh state, mount effects run). Changing back to 'A': the instance with key 'B' unmounts, a BRAND NEW instance with key 'A' mounts. React does NOT restore the previous 'A' instance — the previous state is permanently gone. This is useful for resetting components but can be a subtle source of state loss if keys aren't stable.",
        },
      ],
    },
    {
      id: "fiber-architecture",
      title: "Fiber Architecture & Rendering Pipeline",
      explanation: `**React Fiber** is the complete rewrite of React's core algorithm (React 16+). It replaced the old synchronous, recursive reconciler with an **incremental, interruptible rendering engine**.

**Why Fiber was created:**
The old reconciler (Stack) processed the entire component tree synchronously. For a tree with 10,000 nodes, rendering was a single blocking operation — the JS thread couldn't handle user input or animations until done. On mobile, this caused dropped frames and unresponsive UIs.

**Fiber's key innovation — work can be:**
1. **Paused** — Stop rendering mid-tree to handle urgent work
2. **Resumed** — Continue where it left off
3. **Abandoned** — Discard incomplete work if priorities changed
4. **Reused** — Skip unchanged subtrees

**Fiber node structure (each component becomes a Fiber):**
\`\`\`
FiberNode {
  type: ComponentType,     // Function, Class, or host ('View', 'Text')
  key: string | null,
  child: Fiber | null,     // First child
  sibling: Fiber | null,   // Next sibling
  return: Fiber | null,    // Parent
  stateNode: Instance,     // DOM node / Native view / Class instance
  memoizedState: any,      // Hooks linked list (for function components)
  memoizedProps: Props,     // Last rendered props
  pendingProps: Props,      // Incoming props (not yet committed)
  effectTag: number,       // What needs to happen (placement, update, deletion)
  alternate: Fiber | null, // Double buffering — current ↔ work-in-progress
}
\`\`\`

**Two-phase rendering:**

**Phase 1: Render (Interruptible)**
- Traverses the Fiber tree (depth-first)
- Calls component functions / render methods
- Computes diffs (what changed)
- Builds a list of "effects" (side effects to apply)
- CAN be interrupted and restarted

**Phase 2: Commit (Synchronous, Not interruptible)**
- Applies all effects to the native view hierarchy
- Runs \`useLayoutEffect\` callbacks (synchronous)
- Schedules \`useEffect\` callbacks (asynchronous)
- CANNOT be interrupted — ensures UI consistency

**Priority levels (Lanes model in React 18+):**
| Priority | Examples | Interruptibility |
|----------|---------|-----------------|
| Sync | User input, focus | Cannot be interrupted |
| Discrete | Click events | High priority |
| Continuous | Scroll, hover | Can be interrupted by discrete |
| Default | Data fetching results | Can be interrupted |
| Transition | startTransition | Lowest — can be abandoned |
| Idle | Prefetching, analytics | Only when nothing else to do |`,
      codeExample: `// === FIBER IN PRACTICE ===

// Understanding how Fiber processes this tree:
function App() {
  return (
    <View>           {/* Fiber 1: child→Fiber2, sibling→null */}
      <Header />     {/* Fiber 2: child→null, sibling→Fiber3 */}
      <Content>      {/* Fiber 3: child→Fiber4, sibling→Fiber5 */}
        <Article />  {/* Fiber 4: child→null, sibling→null */}
      </Content>
      <Footer />     {/* Fiber 5: child→null, sibling→null */}
    </View>
  );
}

// Traversal order (depth-first):
// 1. View → 2. Header → 3. Content → 4. Article → 
// (back up) 5. Footer → (back up to View, done)

// Each step is a "unit of work" that CAN be interrupted between steps

// === DOUBLE BUFFERING (current vs work-in-progress) ===

// React maintains TWO fiber trees:
// - current: what's on screen right now
// - workInProgress: what we're building for the next update

// After commit, workInProgress BECOMES current
// This enables:
// 1. Comparing old vs new (diffing)
// 2. Abandoning incomplete work without affecting displayed UI
// 3. Reusing unchanged fibers (structural sharing)

// === PRACTICAL IMPLICATIONS FOR RN PERFORMANCE ===

// 1. startTransition — mark updates as non-urgent
import { startTransition, useState } from 'react';

function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (text: string) => {
    // This is urgent — update input immediately
    setQuery(text);
    
    // This is NOT urgent — can be interrupted by typing
    startTransition(() => {
      const filtered = expensiveFilter(allItems, text);
      setResults(filtered);
    });
  };
  
  return (
    <>
      <TextInput value={query} onChangeText={handleSearch} />
      {/* Results render with lower priority — typing stays responsive */}
      <FlatList data={results} renderItem={renderItem} />
    </>
  );
}

// 2. useDeferredValue — defer costly re-renders
import { useDeferredValue } from 'react';

function SearchResults({ query }: { query: string }) {
  // deferredQuery updates with lower priority
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  
  // Expensive computation uses deferred value
  const results = useMemo(
    () => filterItems(allItems, deferredQuery),
    [deferredQuery]
  );
  
  return (
    <View style={{ opacity: isStale ? 0.7 : 1 }}>
      <FlatList data={results} renderItem={renderItem} />
    </View>
  );
}

// 3. Understanding effect timing in Fiber
function EffectTimingDemo() {
  useEffect(() => {
    // Runs AFTER commit, asynchronously
    // Safe for: data fetching, subscriptions, analytics
    console.log('useEffect — async after paint');
  });
  
  useLayoutEffect(() => {
    // Runs AFTER commit, SYNCHRONOUSLY, BEFORE browser paint
    // Use for: measuring layout, synchronous DOM updates
    // ⚠️ Blocks painting — keep it fast!
    console.log('useLayoutEffect — sync before paint');
  });
  
  // Execution order:
  // 1. Render phase: component function runs
  // 2. Commit phase: DOM/native updates applied
  // 3. useLayoutEffect fires (sync, before paint)
  // 4. Browser paints
  // 5. useEffect fires (async, after paint)
}`,
      exercise: `**Fiber Architecture Exercises:**
1. Draw the Fiber tree (child/sibling/return pointers) for a component with 3 levels of nesting
2. Use React DevTools Profiler to visualize which fibers are "committed" vs "bailed out" during a state update
3. Implement a search input that uses \`startTransition\` to keep typing responsive while filtering 10K items
4. Compare the performance of \`useEffect\` vs \`useLayoutEffect\` for measuring component dimensions
5. Create a demo showing how Fiber interrupts low-priority work when high-priority input arrives`,
      commonMistakes: [
        "Putting expensive computations in the render function — they run in the render phase which may execute multiple times in concurrent mode",
        "Using useLayoutEffect for async operations — it blocks painting and should only be used for synchronous layout measurements",
        "Not understanding that render phase is NOT the same as commit phase — side effects in render can execute multiple times or never",
        "Assuming startTransition makes things faster — it prioritizes responsiveness over throughput, the work still needs to be done",
        "Not considering that React may call your component function multiple times during concurrent rendering — side effects MUST be in effects, not in the render body",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What problem did Fiber solve that the Stack reconciler couldn't?",
          a: "The Stack reconciler processed the entire component tree **synchronously and recursively**. Once it started, it couldn't stop until the entire tree was processed. For large trees (10K+ nodes), this blocked the JS thread for 100ms+, causing dropped frames and unresponsive UI. Fiber made rendering **incremental and interruptible** — it can pause rendering to handle user input, resume later, and even abandon work if higher priority updates arrive. This is the foundation of Concurrent React.",
        },
        {
          type: "conceptual",
          q: "Explain the difference between the Render phase and Commit phase in Fiber.",
          a: "**Render phase**: React traverses fibers, calls component functions, computes diffs. This phase is **interruptible** — React can pause, abandon, or restart it. No side effects should occur here because it may run multiple times. **Commit phase**: React applies all accumulated changes to the native view hierarchy (or DOM). This phase is **synchronous and non-interruptible** to ensure UI consistency. useLayoutEffect runs sync during commit, useEffect runs async after commit.",
        },
        {
          type: "scenario",
          q: "Your React Native app drops frames when navigating to a screen with a complex component tree. How does understanding Fiber help you fix it?",
          a: "**Diagnosis**: The initial render of the complex screen is too expensive for a single frame. **Fiber-aware fixes**: (1) Use `startTransition` for non-critical parts of the screen — render the skeleton immediately, populate content with lower priority. (2) Use lazy loading with `React.lazy` and `Suspense` for heavy sub-components. (3) Move expensive computation to `useMemo` so it only runs when inputs change, not on every render. (4) Use `InteractionManager.runAfterInteractions` to defer heavy work until navigation animation completes. (5) Virtualize long lists with FlatList instead of rendering all items.",
        },
      ],
    },
    {
      id: "hooks-internals",
      title: "Hooks Internals & Advanced Patterns",
      explanation: `**Hooks are implemented as a linked list** on each Fiber node. When you call \`useState\`, \`useEffect\`, etc., React doesn't use the hook name — it uses **call order** to match hooks to their state.

**How hooks work internally:**

\`\`\`
FiberNode.memoizedState → Hook1 → Hook2 → Hook3 → null
                          (useState) (useEffect) (useMemo)
\`\`\`

Each hook is a node in a linked list:
\`\`\`
Hook {
  memoizedState: any,   // The state value (useState) or effect (useEffect)
  queue: UpdateQueue,   // Pending state updates
  next: Hook | null,    // Next hook in the list
}
\`\`\`

**This is why hooks rules exist:**
1. **Don't call hooks in conditions/loops** — the linked list position would change between renders, causing hooks to mismatch their state
2. **Only call hooks at the top level** — ensures consistent ordering every render

**useState internals:**
- First render: creates a Hook node, stores initial state
- Updates: \`setState\` enqueues an update to \`hook.queue\`
- Next render: React processes the update queue and produces new state
- Batching: Multiple setStates in the same event handler create multiple updates but trigger ONE re-render (React 18+: automatic batching everywhere)

**useEffect internals:**
- Creates an Effect object: \`{ tag, create, destroy, deps, next }\`
- After commit phase, React iterates the effect list
- Compares \`deps\` with previous \`deps\` (\`Object.is\` comparison)
- If deps changed: runs \`destroy\` (cleanup), then runs \`create\`
- Timing: \`useEffect\` fires asynchronously after paint; \`useLayoutEffect\` fires synchronously before paint

**useMemo/useCallback internals:**
- Stores \`[value, deps]\` in the hook's memoizedState
- On re-render, compares new deps with stored deps
- If same: returns stored value (no recomputation)
- If different: recomputes and stores new value + deps
- **Important**: deps comparison is shallow (\`Object.is\`) — objects/arrays are compared by reference, not value`,
      codeExample: `// === HOOKS LINKED LIST VISUALIZATION ===

function MyComponent() {
  // Hook 1: useState → memoizedState: 0
  const [count, setCount] = useState(0);
  
  // Hook 2: useState → memoizedState: ''
  const [name, setName] = useState('');
  
  // Hook 3: useMemo → memoizedState: [computedValue, [count]]
  const doubled = useMemo(() => count * 2, [count]);
  
  // Hook 4: useCallback → memoizedState: [fn, [count]]
  const increment = useCallback(() => setCount(c => c + 1), []);
  
  // Hook 5: useEffect → memoizedState: { create, destroy, deps: [count] }
  useEffect(() => {
    console.log('Count changed:', count);
    return () => console.log('Cleanup for count:', count);
  }, [count]);
  
  // Internal linked list:
  // Fiber.memoizedState → [0, setter] → ['', setter] → [0, [0]] 
  //                     → [fn, []] → {effect, [0]} → null
}

// === ADVANCED HOOK PATTERNS ===

// 1. useReducer for complex state machines
type AuthState = 
  | { status: 'idle' }
  | { status: 'authenticating' }
  | { status: 'authenticated'; user: User; token: string }
  | { status: 'error'; error: string; retryCount: number };

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User; token: string }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { status: 'authenticating' };
    case 'LOGIN_SUCCESS':
      return { status: 'authenticated', user: action.user, token: action.token };
    case 'LOGIN_FAILURE':
      return {
        status: 'error',
        error: action.error,
        retryCount: state.status === 'error' ? state.retryCount + 1 : 1,
      };
    case 'LOGOUT':
      return { status: 'idle' };
  }
}

// 2. Custom hook with cleanup and race condition prevention
function useAsyncData<T>(fetchFn: () => Promise<T>, deps: any[]) {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    loading: boolean;
  }>({ data: null, error: null, loading: true });

  useEffect(() => {
    let cancelled = false; // Race condition guard
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    fetchFn()
      .then(data => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch(error => {
        if (!cancelled) setState({ data: null, error, loading: false });
      });
    
    return () => { cancelled = true; }; // Prevent stale updates
  }, deps);

  return state;
}

// 3. useRef for mutable values that don't trigger re-renders
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  
  // Update ref to latest callback without re-creating interval
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]); // Only recreate interval when delay changes
}

// 4. Avoiding the stale closure problem with refs
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current; // Returns value from PREVIOUS render
}`,
      exercise: `**Hooks Internals Exercises:**
1. Break the rules of hooks on purpose (call useState inside a condition) and observe the error
2. Implement a \`useForceUpdate\` hook that triggers a re-render without any state change
3. Build a \`useDebounce\` hook that debounces a value with configurable delay
4. Create a \`useWhyDidYouRender\` hook that logs which props/state changed between renders
5. Implement \`usePrevious\` hook and explain WHY it works (hint: useEffect timing)
6. Build a state machine hook \`useMachine\` that enforces valid state transitions`,
      commonMistakes: [
        "Calling hooks conditionally — `if (condition) { useState() }` breaks the linked list ordering and causes hooks to mismatch",
        "Missing dependencies in useEffect — leads to stale closures where the effect uses outdated values",
        "Over-specifying dependencies — adding objects/arrays as deps that are recreated every render, causing infinite effect loops",
        "Using useCallback/useMemo everywhere 'for performance' — the memoization overhead (storing deps, comparing) can exceed the cost of just re-computing",
        "Not using the functional updater form of setState — `setCount(count + 1)` captures stale count; `setCount(c => c + 1)` always has latest",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why can't hooks be called inside conditions or loops?",
          a: "Hooks are stored as a **linked list** on the Fiber node, identified by **call order** (not name). On each render, React walks the linked list sequentially: the 1st hook call gets node 1, the 2nd gets node 2, etc. If a hook call is conditional, the list length changes between renders — hook 3 might get data from the previous hook 2's node. This causes state corruption. React enforces consistent ordering by requiring hooks at the top level of the component function.",
        },
        {
          type: "tricky",
          q: "What happens if you call `setState` with the same value as the current state?",
          a: "React **bails out** — it skips re-rendering the component and its children. Internally, React uses `Object.is` to compare the new value with the current state. If they're the same, no update is enqueued. **However**, React may still call the component function one more time (but won't commit or run effects) to verify before bailing out. For objects, `Object.is` checks reference equality — `setState({})` ALWAYS triggers a re-render because `{} !== {}`.",
        },
        {
          type: "scenario",
          q: "You have a useEffect that fetches data when a prop changes, but sometimes the response from an older request arrives after a newer one, showing stale data. How do you fix this?",
          a: "**Race condition fix with cleanup flag:** In the useEffect, declare a `let cancelled = false`. In the cleanup function, set `cancelled = true`. Before calling setState with the response, check `if (!cancelled)`. When the prop changes, React runs the cleanup (setting `cancelled = true` for the old effect) BEFORE running the new effect. So the old request's response is ignored. Alternative: use AbortController to actually cancel the HTTP request: `const controller = new AbortController(); fetch(url, { signal: controller.signal }); return () => controller.abort();`",
        },
      ],
    },
    {
      id: "memoization-error-boundaries",
      title: "Memoization Strategies & Error Boundaries",
      explanation: `**Memoization in React** is the technique of caching computation results to avoid redundant work. But it's not free — memoization has costs (memory for cached values, comparison overhead for deps). The key is knowing WHEN it helps.

**When to memoize (and when NOT to):**

| Scenario | Memoize? | Why |
|----------|----------|-----|
| Pure display component with primitive props | ❌ No | Re-render is cheaper than comparison |
| Component receiving new object props every render | ⚠️ Fix the parent | Memoizing here is a bandaid |
| Expensive computation (sorting 10K items) | ✅ useMemo | Computation cost > comparison cost |
| Callback passed to memoized child | ✅ useCallback | Prevents child re-render |
| Context consumer rendering large subtree | ✅ memo + useMemo | Context changes re-render all consumers |
| FlatList renderItem | ✅ memo | Prevents re-render of off-screen items |

**React.memo deep dive:**
- Wraps a component to skip re-render if props haven't changed
- Default: shallow comparison (Object.is on each prop)
- Custom: \`React.memo(Component, (prevProps, nextProps) => areEqual)\`
- Does NOT prevent re-render from internal state changes or context changes
- Works only for props coming from the parent

**Error Boundaries:**
Error boundaries catch JavaScript errors in their child component tree, log them, and display a fallback UI. They are CLASS components (no hook equivalent yet) that implement:
- \`static getDerivedStateFromError(error)\` — render fallback UI
- \`componentDidCatch(error, errorInfo)\` — log error (to Sentry, etc.)

**What Error Boundaries catch:**
✅ Rendering errors, lifecycle methods, constructors of child tree
❌ Event handlers, async code, errors in the boundary itself, SSR

**In React Native production apps**, error boundaries are critical. Without them, a crash in one component takes down the entire app. With them, you can isolate failures to individual features.`,
      codeExample: `// === MEMOIZATION STRATEGY GUIDE ===

// 1. React.memo — prevent unnecessary re-renders
const ExpensiveListItem = React.memo(function ListItem({ 
  item, 
  onPress 
}: { 
  item: Product; 
  onPress: (id: string) => void;
}) {
  // Only re-renders if item or onPress reference changes
  return (
    <Pressable onPress={() => onPress(item.id)}>
      <Text>{item.name}</Text>
      <Text>{formatPrice(item.price)}</Text>
    </Pressable>
  );
});

// 2. The PARENT must cooperate — stabilize the callback
function ProductList({ products }: { products: Product[] }) {
  // ❌ Without useCallback, onPress is a new function every render
  // → ExpensiveListItem.memo is useless
  // const onPress = (id: string) => navigate('Product', { id });
  
  // ✅ With useCallback, reference is stable
  const onPress = useCallback((id: string) => {
    navigate('Product', { id });
  }, [navigate]);
  
  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ExpensiveListItem item={item} onPress={onPress} />
  ), [onPress]);
  
  return <FlatList data={products} renderItem={renderItem} />;
}

// 3. useMemo for expensive computations
function AnalyticsDashboard({ transactions }: { transactions: Transaction[] }) {
  // Only recompute when transactions array reference changes
  const stats = useMemo(() => ({
    total: transactions.reduce((sum, t) => sum + t.amount, 0),
    average: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length,
    byCategory: groupBy(transactions, 'category'),
    topMerchants: getTopN(transactions, 'merchant', 10),
    // Any of these could be O(n) or O(n log n) — worth memoizing
  }), [transactions]);
  
  return <StatsView stats={stats} />;
}

// 4. Context + Memoization to prevent cascade re-renders
const ThemeContext = React.createContext<Theme>(defaultTheme);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  
  // ✅ Memoize the context value to prevent re-renders
  // when ThemeProvider re-renders for OTHER reasons
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// === ERROR BOUNDARIES ===

// 5. Production Error Boundary with crash reporting
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report to crash analytics (Sentry, Crashlytics)
    crashlytics().recordError(error, {
      componentStack: errorInfo.componentStack,
    });
    this.props.onError?.(error);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 6. Granular error boundaries — isolate feature failures
function AppLayout() {
  return (
    <View style={styles.container}>
      <ErrorBoundary fallback={<HeaderFallback />}>
        <Header />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<FeedErrorState />}>
        <MainFeed />  {/* If feed crashes, header and tabs still work */}
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<TabBarFallback />}>
        <TabBar />
      </ErrorBoundary>
    </View>
  );
}`,
      exercise: `**Memoization & Error Boundary Exercises:**
1. Profile a FlatList with 1000 items — add React.memo to renderItem and measure the difference
2. Create a component that proves useMemo prevents recomputation — log inside the memo callback
3. Build a custom error boundary that shows a "Retry" button and resets on press
4. Implement a \`useWhyDidYouRender\` hook that logs exactly which deps changed to cause a re-render
5. Create a context provider that splits frequently-changing and rarely-changing values to minimize re-renders
6. Benchmark: compare render times of a memoized vs non-memoized component with 50 props`,
      commonMistakes: [
        "Wrapping every component in React.memo — adds comparison overhead; only useful for costly re-renders or stable prop patterns",
        "Using useMemo for simple calculations — `useMemo(() => a + b, [a, b])` is SLOWER than just `a + b` due to memoization overhead",
        "Passing new object/array literals as props to a memoized child — `<Memo style={{ flex: 1 }} />` defeats memo because the style object is new every render",
        "Not realizing Error Boundaries only catch errors in the REACT TREE (render, lifecycle) — not in event handlers, async code, or setTimeout",
        "Creating a single top-level error boundary — use granular boundaries so one feature crash doesn't take down the whole app",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you use useMemo vs useCallback vs React.memo?",
          a: "**useMemo**: Memoize a computed VALUE to avoid expensive recalculation on every render. `const sorted = useMemo(() => sort(items), [items])`. **useCallback**: Memoize a FUNCTION reference to prevent child re-renders when passed as a prop. `const onClick = useCallback(() => { ... }, [deps])`. **React.memo**: Memoize a COMPONENT — skip re-rendering if props haven't changed. Wraps the component definition. They work together: React.memo on the child, useCallback on the parent's callback prop, useMemo on computed props. All three are wasted if any prop is an unstable reference.",
        },
        {
          type: "scenario",
          q: "Your React Native app has a screen with 5 context providers and every keystroke in a TextInput causes the entire screen to re-render. How do you fix it?",
          a: "**Root cause**: One of the context providers is re-creating its value on every parent re-render, causing all consumers to re-render. **Fixes:** (1) Wrap each context provider's value in `useMemo`. (2) Split contexts: separate frequently-changing data (input state) from stable data (theme, config). (3) Use component composition: lift the TextInput state to a component that's NOT a context consumer. (4) Consider using a state management library (Zustand) instead of context for frequently-updating state — Zustand only re-renders components that subscribe to changed selectors. (5) Use `React.memo` on children that don't need the changing context value.",
        },
        {
          type: "conceptual",
          q: "Why can't Error Boundaries be functional components?",
          a: "Error Boundaries require `componentDidCatch` and `getDerivedStateFromError` lifecycle methods, which have no hooks equivalents. This is a deliberate React team decision — they want error boundary semantics to be explicit and visible in the component hierarchy. The React team has discussed adding a `useErrorBoundary` hook but hasn't implemented it yet (as of React 19). Workaround: create one reusable ErrorBoundary class component and use it everywhere, or use a library like `react-error-boundary` which provides a clean API.",
        },
      ],
    },
  ],
};

export default rnPhase3;
