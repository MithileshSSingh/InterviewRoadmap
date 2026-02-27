const rnPhase5 = {
  id: "phase-5",
  title: "Phase 5: Performance & Scalability",
  emoji: "🚀",
  description: "Master re-render control, FlatList optimization, image strategies, startup time, bundle splitting, memory optimization, battery efficiency, and offline-first architecture for apps serving millions.",
  topics: [
    {
      id: "rerender-control",
      title: "Re-render Control & Optimization Strategies",
      explanation: `**Re-renders are NOT inherently bad** — they're how React updates the UI. The problem is **unnecessary re-renders** that trigger expensive reconciliation, bridge calls (old arch), or native view updates.

**Understanding the re-render cascade:**
\`\`\`
Parent re-renders
  → ALL children re-render (even if their props haven't changed)
  → Each child's children re-render
  → ... entire subtree re-renders
\`\`\`

This is React's DEFAULT behavior. React.memo, useMemo, and useCallback are the tools to short-circuit this cascade.

**The performance measurement hierarchy:**
1. **Renders** (cheapest) — Component function called, virtual tree produced
2. **Reconciliation** — Diffing old vs new tree
3. **Native updates** (most expensive) — Crossing JS-Native boundary, updating native views

**Optimization strategy (in order of impact):**
1. **Fix the architecture** — Move state as close to where it's used as possible (colocate state)
2. **Prevent cascading renders** — React.memo for expensive subtrees
3. **Stabilize references** — useCallback, useMemo for props passed to memoized children
4. **Reduce work per render** — useMemo for expensive computations
5. **Virtualize lists** — FlatList/FlashList for long lists
6. **Native-driven animations** — Reanimated, useNativeDriver
7. **Lazy loading** — React.lazy, dynamic import for heavy screens`,
      codeExample: `// === SYSTEMATIC RE-RENDER OPTIMIZATION ===

// 1. PROBLEM: Global state causes cascade re-renders
// ❌ Single global context — EVERY consumer re-renders on ANY change
const AppContext = React.createContext({
  user: null,
  theme: 'light',
  notifications: [],
  cart: [],
  settings: {},
});

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // When notifications update, the entire app re-renders
  // including components that only need theme!
  return (
    <AppContext.Provider value={state}>
      <Navigator />
    </AppContext.Provider>
  );
}

// ✅ FIX: Split contexts by update frequency
const UserContext = React.createContext(null);       // Rarely changes
const ThemeContext = React.createContext('light');    // Very rarely changes
const NotificationContext = React.createContext([]); // Changes frequently
const CartContext = React.createContext([]);          // Changes sometimes

// Even better: use Zustand with selectors
import { create } from 'zustand';

const useAppStore = create((set) => ({
  user: null,
  theme: 'light',
  notifications: [],
  cart: [],
  setTheme: (theme) => set({ theme }),
  addNotification: (n) => set((s) => ({ 
    notifications: [...s.notifications, n] 
  })),
}));

// Components only re-render when THEIR selected slice changes
function ThemeButton() {
  const theme = useAppStore(state => state.theme); // Only theme changes trigger re-render
  return <Button title={theme} />;
}

function NotificationBadge() {
  const count = useAppStore(state => state.notifications.length); // Only count matters
  return <Badge count={count} />;
}

// 2. PATTERN: Component composition to avoid re-renders
// ❌ Expensive child re-renders because parent state updates
function Screen() {
  const [inputValue, setInputValue] = useState('');
  
  return (
    <View>
      <TextInput value={inputValue} onChangeText={setInputValue} />
      {/* ExpensiveList re-renders on EVERY keystroke even though 
          it doesn't use inputValue! */}
      <ExpensiveList items={items} />
    </View>
  );
}

// ✅ FIX: Lift the input into its own component (state colocation)
function Screen() {
  return (
    <View>
      <SearchInput />      {/* State lives here — only this re-renders */}
      <ExpensiveList items={items} /> {/* Never re-renders from typing */}
    </View>
  );
}

function SearchInput() {
  const [inputValue, setInputValue] = useState('');
  return <TextInput value={inputValue} onChangeText={setInputValue} />;
}

// 3. PATTERN: Stable callback references for memoized children
const MemoizedItem = React.memo(function Item({ 
  item, 
  onPress, 
  onLongPress 
}) {
  return (
    <Pressable onPress={() => onPress(item.id)} onLongPress={() => onLongPress(item.id)}>
      <Text>{item.title}</Text>
    </Pressable>
  );
});

function ItemList({ items }) {
  // ✅ Stable references — MemoizedItem won't re-render unless item changes
  const onPress = useCallback((id) => {
    navigation.navigate('Detail', { id });
  }, [navigation]);
  
  const onLongPress = useCallback((id) => {
    showActionSheet(id);
  }, []);
  
  return items.map(item => (
    <MemoizedItem key={item.id} item={item} onPress={onPress} onLongPress={onLongPress} />
  ));
}`,
      exercise: `**Re-render Optimization Exercises:**
1. Add \`console.log('render', componentName)\` to 10 components and identify unnecessary re-renders during typical usage
2. Use React DevTools Profiler to visualize the render cascade when state changes
3. Refactor a global context into split contexts and measure the reduction in re-renders
4. Replace a Context-based state with Zustand selectors and compare render counts
5. Apply the "state colocation" pattern to a screen with a search input and a list
6. Create a before/after benchmark of FlatList performance with and without memoized renderItem`,
      commonMistakes: [
        "Using React.memo on every component — the comparison overhead can be more costly than the re-render for simple components",
        "Passing inline objects/functions as props — `<Child style={{ flex: 1 }} />` creates a new object every render, defeating React.memo",
        "Using a single context for all app state — every consumer re-renders on every change to any part of the state",
        "Optimizing renders before measuring — always profile first to identify actual bottlenecks, don't optimize speculatively",
        "Not understanding that useCallback/useMemo don't prevent re-renders of the component using them — they help memoized CHILDREN",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the difference between a re-render and a native view update?",
          a: "A **re-render** is when React calls your component function again and produces a new virtual tree. This is cheap — it's just JavaScript function execution. A **native view update** happens when reconciliation finds differences between old and new virtual trees, and React sends update commands across the JS-Native boundary. This is expensive — it involves serialization (old arch) or JSI calls (new arch), native view property updates, and potentially layout recalculation. The goal is to minimize native updates, not necessarily re-renders.",
        },
        {
          type: "scenario",
          q: "Your app has a chat screen that becomes slow with 500+ messages. Every new message causes the entire list to re-render. How do you fix it?",
          a: "**Multi-layered fix:** (1) Use FlatList (not ScrollView) for virtualization — only visible items + buffer are rendered. (2) React.memo on the message component with proper key (message.id). (3) Use `getItemLayout` if messages have fixed height — skips measurement. (4) `inverted` prop for bottom-anchored chat. (5) `windowSize` and `maxToRenderPerBatch` tuning. (6) Use functional setState for adding messages: `setMessages(prev => [...prev, newMsg])` — captures latest state without dependency. (7) Consider FlashList from Shopify — significantly faster than FlatList for large lists. (8) Implement pagination — only load last 100 messages, lazy-load older ones on scroll.",
        },
      ],
    },
    {
      id: "flatlist-optimization",
      title: "FlatList & Large Dataset Optimization",
      explanation: `**FlatList** is React Native's virtualized list component. It only renders items that are visible on screen (plus a configurable buffer), recycling off-screen items to save memory. However, out-of-the-box FlatList performance can be poor — you need to tune it.

**Key FlatList props for performance:**

| Prop | Purpose | Recommendation |
|------|---------|---------------|
| \`keyExtractor\` | Unique key for reconciliation | Use stable IDs, NEVER index |
| \`getItemLayout\` | Skip measurement for fixed-height items | Always provide if possible |
| \`windowSize\` | Number of viewports to render | Default 21, reduce for less memory |
| \`maxToRenderPerBatch\` | Items rendered per batch | Default 10, increase for faster scroll |
| \`initialNumToRender\` | Items rendered on first pass | Set to visible count |
| \`removeClippedSubviews\` | Detach off-screen views | true (but can cause rendering bugs) |
| \`updateCellsBatchingPeriod\` | Delay between batch renders | Increase for smoother scroll |

**FlashList (Shopify's replacement):**
FlashList is a drop-in replacement for FlatList that uses cell recycling instead of unmounting/remounting. It provides 5-10x better performance for large lists.
- Reuses native views instead of destroying and recreating them
- Requires \`estimatedItemSize\` prop
- More memory-efficient for large lists
- Significantly better scroll performance`,
      codeExample: `// === OPTIMIZED FLATLIST ===

import { FlatList, View, Text } from 'react-native';

// 1. Memoized list item
const ProductItem = React.memo(function ProductItem({ 
  item, 
  onPress 
}: {
  item: Product;
  onPress: (id: string) => void;
}) {
  return (
    <Pressable onPress={() => onPress(item.id)} style={styles.item}>
      <FastImage 
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
    </Pressable>
  );
});

// 2. Optimized FlatList configuration
const ITEM_HEIGHT = 80;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const VISIBLE_ITEMS = Math.ceil(SCREEN_HEIGHT / ITEM_HEIGHT);

function ProductList({ products }: { products: Product[] }) {
  const onPress = useCallback((id: string) => {
    navigation.navigate('ProductDetail', { id });
  }, [navigation]);
  
  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductItem item={item} onPress={onPress} />
  ), [onPress]);
  
  const keyExtractor = useCallback((item: Product) => item.id, []);
  
  // Fixed height layout — HUGE performance boost
  const getItemLayout = useCallback((
    _data: Product[] | null | undefined,
    index: number
  ) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);
  
  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      // Performance tuning
      initialNumToRender={VISIBLE_ITEMS}
      maxToRenderPerBatch={VISIBLE_ITEMS * 2}
      windowSize={5}  // Render 5 viewports (2 above, current, 2 below)
      removeClippedSubviews={true}
      // Prevent flash of empty content during fast scroll
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
    />
  );
}

// === FLASHLIST (SHOPIFY) — PREFERRED FOR LARGE LISTS ===

import { FlashList } from '@shopify/flash-list';

function OptimizedProductList({ products }: { products: Product[] }) {
  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductItem item={item} onPress={onPress} />
  ), [onPress]);
  
  return (
    <FlashList
      data={products}
      renderItem={renderItem}
      estimatedItemSize={ITEM_HEIGHT}  // Required — enables cell recycling
      // FlashList handles most optimizations automatically:
      // - Cell recycling (reuses native views)
      // - Automatic batching
      // - Optimized scroll handling
    />
  );
}

// === INFINITE SCROLL WITH PAGINATION ===

function InfiniteList() {
  const [data, setData] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const response = await api.getProducts({ page, limit: 20 });
      setData(prev => [...prev, ...response.items]);
      setHasMore(response.hasNextPage);
      setPage(p => p + 1);
    } catch (error) {
      // Don't reset data on error — keep what we have
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);
  
  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      estimatedItemSize={80}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}  // Trigger when 50% from bottom
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
    />
  );
}`,
      exercise: `**List Optimization Exercises:**
1. Generate a list of 10,000 items and compare scroll performance between ScrollView, FlatList, and FlashList
2. Implement \`getItemLayout\` for a list with variable-height items (using estimated heights)
3. Build an infinite scroll list with pull-to-refresh and pagination
4. Profile FlatList render counts with React DevTools — ensure only visible items re-render
5. Implement a SectionList with sticky headers optimized for performance
6. Create a horizontal card carousel using FlatList with snap-to-item behavior`,
      commonMistakes: [
        "Using ScrollView for long lists — renders ALL items at once, crashes with 1000+ items due to memory",
        "Not providing getItemLayout for fixed-height items — forces FlatList to measure each item, causing scroll jank",
        "Creating new function references inside renderItem — defeats React.memo on list items, causing unnecessary re-renders",
        "Setting windowSize too high — renders too many off-screen items, wasting memory and CPU",
        "Not handling the 'key' properly — using index causes incorrect state association when data changes",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does FlatList's virtualization work internally?",
          a: "FlatList maintains a 'render window' — a range of items around the current scroll position. Only items within this window are rendered as native views. As the user scrolls: (1) Items entering the window are mounted (native views created). (2) Items leaving the window are unmounted (native views destroyed). (3) The window size is controlled by `windowSize` prop (in viewports). `initialNumToRender` controls the first batch. `maxToRenderPerBatch` controls how many items are added per render cycle. This keeps memory usage roughly constant regardless of list length. FlashList improves on this by RECYCLING views instead of destroying/creating — reusing the native view with new props.",
        },
        {
          type: "scenario",
          q: "You're building a social media feed that combines text posts, images, videos, and ads. How do you optimize the list performance?",
          a: "**Architecture:** (1) Use FlashList with `estimatedItemSize` — cell recycling handles mixed content better. (2) Use `overrideItemLayout` to provide accurate sizes for different item types — prevents layout jumps. (3) Images: use FastImage with priority='low' for off-screen prefetch. (4) Videos: only play the currently visible video, pause all others. Use `viewabilityConfig` to detect visible items. (5) Ads: lazy-load ad SDKs, wrap in Error Boundary to prevent ad crashes from affecting the feed. (6) State: normalize feed data (entities + ordered IDs), use selectors for item rendering. (7) Pagination: cursor-based, load 20 items per page. (8) Pull-to-refresh: only fetch new items, prepend to list.",
        },
      ],
    },
    {
      id: "startup-bundle-optimization",
      title: "Startup Time, Bundle & Memory Optimization",
      explanation: `**App startup time** directly impacts user retention. Studies show 25% of users abandon an app if startup takes >3 seconds. For React Native, startup involves:

**Startup timeline:**
\`\`\`
App Launch
  → Native initialization (Application.onCreate / AppDelegate)
  → React Native runtime initialization (Hermes/JSC)
  → JS bundle loading and execution
  → Root component mount
  → Initial render + layout
  → First meaningful paint (FMP)
\`\`\`

**Optimizing each phase:**

1. **Native init**: Defer native module initialization (TurboModules do this automatically)
2. **Runtime init**: Use Hermes (AOT bytecode = faster than JSC's JIT compilation at startup)
3. **Bundle loading**: Reduce bundle size, enable RAM bundles (inline requires)
4. **JS execution**: Defer expensive initialization, use lazy imports
5. **Initial render**: Render a skeleton UI first, load content async
6. **FMP**: Prioritize above-the-fold content, defer below-the-fold

**Bundle size optimization:**
- Metro bundler tree-shaking is limited — be deliberate about imports
- Use \`import { specific } from 'library'\` not \`import library from 'library'\`
- Analyze bundle with \`react-native-bundle-visualizer\`
- Lazy-load heavy screens with \`React.lazy\` + navigation
- Consider separate bundles for different features (advanced)

**Memory optimization strategies:**
- Image caching with bounds (FastImage + maxDiskCache + maxMemoryCache)
- Virtualized lists (FlatList/FlashList) for all scrollable content
- Component unmounting for off-screen navigation stacks
- Ref-based data for non-rendering state (counters, timers, WebSocket connections)
- Normalized state to avoid data duplication`,
      codeExample: `// === STARTUP OPTIMIZATION ===

// 1. Measure startup time
const APP_START = global.performance?.now?.() ?? Date.now();

function App() {
  useEffect(() => {
    const startupTime = (global.performance?.now?.() ?? Date.now()) - APP_START;
    analytics.track('app_startup', { duration: startupTime });
    
    if (startupTime > 3000) {
      analytics.track('slow_startup', { duration: startupTime });
    }
  }, []);
  
  return <AppNavigator />;
}

// 2. Lazy loading screens
const HomeScreen = React.lazy(() => import('./screens/HomeScreen'));
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen'));
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen'));

// In navigation — screen bundle only loads on first navigation
function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home">
        {() => (
          <Suspense fallback={<ScreenSkeleton />}>
            <HomeScreen />
          </Suspense>
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile">
        {() => (
          <Suspense fallback={<ScreenSkeleton />}>
            <ProfileScreen />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// 3. Defer expensive initialization
import { InteractionManager } from 'react-native';

function AppBootstrap() {
  useEffect(() => {
    // Critical: initialize immediately
    initializeAuth();
    initializeNavigation();
    
    // Non-critical: defer until app is interactive
    InteractionManager.runAfterInteractions(() => {
      initializeAnalytics();
      initializeCrashReporting();
      prefetchUserData();
      warmImageCache();
    });
    
    // Low priority: defer even further
    setTimeout(() => {
      checkForUpdates();
      syncOfflineData();
      preloadNextScreens();
    }, 5000);
  }, []);
}

// 4. Bundle size: inline requires for large modules
// Instead of importing at the top (executed at bundle load):
// import { heavyChart } from 'react-native-charts';

// Require when actually needed:
function ChartScreen() {
  const [ChartComponent, setChartComponent] = useState(null);
  
  useEffect(() => {
    // Only load the chart library when this screen mounts
    const { LineChart } = require('react-native-charts');
    setChartComponent(() => LineChart);
  }, []);
  
  if (!ChartComponent) return <ScreenSkeleton />;
  return <ChartComponent data={chartData} />;
}

// 5. Memory-efficient image loading
import FastImage from 'react-native-fast-image';

// Preload critical images during startup
FastImage.preload([
  { uri: 'https://cdn.example.com/logo.png' },
  { uri: 'https://cdn.example.com/default-avatar.png' },
]);

// In components — specify priority
function FeedImage({ uri }: { uri: string }) {
  return (
    <FastImage
      source={{ 
        uri, 
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable, // Cache forever
      }}
      style={styles.feedImage}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
}

// 6. State normalization for memory efficiency
// ❌ Denormalized — duplicates data, wastes memory
const feedState = {
  posts: [
    { id: '1', text: '...', author: { id: 'u1', name: 'Alice', avatar: '...' } },
    { id: '2', text: '...', author: { id: 'u1', name: 'Alice', avatar: '...' } },
    // Alice's data duplicated 100x if she has 100 posts!
  ],
};

// ✅ Normalized — single source of truth, less memory
const normalizedState = {
  users: {
    'u1': { id: 'u1', name: 'Alice', avatar: '...' }, // Stored once
  },
  posts: {
    '1': { id: '1', text: '...', authorId: 'u1' },
    '2': { id: '2', text: '...', authorId: 'u1' },
  },
  feedOrder: ['1', '2'], // Just IDs
};`,
      exercise: `**Performance Optimization Exercises:**
1. Measure your app's startup time (native init → FMP) using the technique above
2. Use \`react-native-bundle-visualizer\` to identify the largest modules in your bundle
3. Implement lazy loading for a heavy screen and measure the startup time improvement
4. Normalize a denormalized state and compare memory usage with Hermes profiler
5. Implement a splash screen strategy that shows a skeleton while loading real data
6. Create a memory budget for your app (target: <150MB on mid-range devices) and track it`,
      commonMistakes: [
        "Importing large libraries at the top of entry files — entire library is parsed and executed at startup even if unused",
        "Not using Hermes — JSC compiles JS at runtime, adding 500ms+ to startup time",
        "Storing large image bitmaps in JS state — use native image caching (FastImage) and avoid base64 data URIs",
        "Denormalized state that duplicates data — 100 posts by the same user stores the user object 100 times",
        "Not measuring — optimizing without profiling is guessing; always measure before and after changes",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your React Native app takes 5 seconds to start. Walk me through how you'd reduce it to under 2 seconds.",
          a: "**Systematic approach:** (1) **Measure phases**: Use native markers to identify time spent in: native init, runtime init, bundle load, JS execution, first render. (2) **Bundle**: Enable Hermes (if not already — saves 30-50% startup). Analyze bundle with bundle-visualizer, remove unused libraries, inline-require heavy deps. (3) **JS execution**: Defer non-critical initialization (analytics, crash reporting) using InteractionManager. Lazy-load screens not visible on startup. (4) **Rendering**: Show a skeleton screen immediately, populate with real data async. (5) **Native**: Audit native module initialization — use TurboModules for lazy loading. Defer native SDKs (maps, camera) until needed. (6) **Verify**: Re-measure, aim for <1s native init + <1s to FMP.",
        },
        {
          type: "conceptual",
          q: "What is the 'inline requires' optimization and how does it help startup?",
          a: "By default, all `import` statements at the top of files are executed when the bundle loads — even if the imported module isn't used immediately. Inline requires (`const X = require('heavy-lib')` inside a function) defer module execution until the function is called. Metro's inline requires transform converts `import` to `require` calls placed at first usage. This reduces startup JS execution time because modules only parse and execute when actually needed. Trade-off: first access to a lazy-loaded module has a small delay. Best for: heavy libraries used only on specific screens.",
        },
      ],
    },
  ],
};

export default rnPhase5;
