const rnPhase7 = {
  id: "phase-7",
  title: "Phase 7: State Management at Scale",
  emoji: "🗄️",
  description: "Master state management architectures — Redux Toolkit, middleware patterns, Sagas vs Thunks, Zustand, Context limitations, state normalization, optimistic UI, cache invalidation, and offline queues.",
  topics: [
    {
      id: "state-architecture-patterns",
      title: "State Architecture Patterns & Trade-offs",
      explanation: `**State management is the #1 architectural decision** that affects long-term maintainability. At scale (50+ screens, 10+ engineers), the wrong choice compounds into tech debt that takes quarters to fix.

**State categories (critical mental model):**

| Type | Examples | Persistence | Reactivity | Tool |
|------|---------|-------------|-----------|------|
| Server state | API data, user profile | Cache + API sync | Subscribe to changes | React Query / SWR |
| Client state | Form inputs, UI toggles | Session or none | Local re-render | useState / Zustand |
| Global state | Auth, theme, feature flags | Persistent | All consumers | Zustand / Redux |
| Navigation state | Current route, params | In-memory | Navigation events | React Navigation |
| Derived state | Filtered list, totals | Never (computed) | Re-compute on change | useMemo / selectors |

**The mistake 90% of teams make:** Putting EVERYTHING in one global store (Redux). Server state (API data) has completely different lifecycle characteristics than UI state. Mixing them creates:
- Stale data (no automatic refetch)
- Manual cache invalidation (error-prone)
- Bloated reducers with loading/error/data for every API call
- Unnecessary re-renders (updating one API cache triggers all consumers)

**Modern state architecture:**
\`\`\`
Server State → React Query / TanStack Query
  ├── Automatic caching, refetching, invalidation
  ├── Stale-while-revalidate pattern
  └── Optimistic updates with rollback

Client State → Zustand (or useState for local)
  ├── Minimal boilerplate
  ├── Selector-based re-renders
  └── Middleware (persist, devtools, immer)

Global Config → Context (for infrequently-changing data)
  ├── Theme, locale, feature flags
  └── Memoized provider values
\`\`\``,
      codeExample: `// === MODERN STATE ARCHITECTURE ===

// 1. Server State with React Query (TanStack Query)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys as constants — prevents typos and enables invalidation
const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  posts: (filters?: PostFilters) => ['posts', filters] as const,
  post: (id: string) => ['posts', id] as const,
};

// Custom hook for user data
function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => api.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 min — don't refetch if fresh
    gcTime: 30 * 60 * 1000,   // 30 min — keep in cache
    retry: 3,                   // Auto-retry on failure
  });
}

// Mutation with optimistic update
function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileDTO) => api.updateProfile(data),
    
    // Optimistic update — show change immediately, rollback on error
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user('me') });
      
      const previousUser = queryClient.getQueryData(queryKeys.user('me'));
      
      queryClient.setQueryData(queryKeys.user('me'), (old: User) => ({
        ...old,
        ...newData,
      }));
      
      return { previousUser }; // Context for rollback
    },
    
    onError: (_err, _newData, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.user('me'), context?.previousUser);
    },
    
    onSettled: () => {
      // Refetch in background to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.user('me') });
    },
  });
}

// 2. Client State with Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  // UI State
  isDarkMode: boolean;
  selectedTab: 'home' | 'search' | 'profile';
  
  // Session State
  isOnboarded: boolean;
  lastViewedProductId: string | null;
  
  // Actions
  toggleDarkMode: () => void;
  setTab: (tab: AppState['selectedTab']) => void;
  markOnboarded: () => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      selectedTab: 'home',
      isOnboarded: false,
      lastViewedProductId: null,
      
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setTab: (tab) => set({ selectedTab: tab }),
      markOnboarded: () => set({ isOnboarded: true }),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        isDarkMode: state.isDarkMode,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);

// Selector-based subscriptions — only re-renders when selected value changes
function ThemeToggle() {
  const isDarkMode = useAppStore(s => s.isDarkMode);
  const toggle = useAppStore(s => s.toggleDarkMode);
  // This component ONLY re-renders when isDarkMode changes
  // Not when selectedTab or anything else changes
  return <Switch value={isDarkMode} onValueChange={toggle} />;
}`,
      exercise: `**State Architecture Exercises:**
1. Audit your current app's state — categorize every piece of state into server/client/global/navigation/derived
2. Migrate one API-fetching Redux slice to React Query and compare the code reduction
3. Implement a Zustand store with persistence (AsyncStorage/MMKV) and selective persistence
4. Build an optimistic update flow: edit a todo → show change immediately → rollback on API error
5. Create a selector-based Zustand store and verify that only subscribed components re-render
6. Implement a cache invalidation strategy for interrelated resources (e.g., updating a post should invalidate the feed)`,
      commonMistakes: [
        "Storing server state in Redux with manual loading/error tracking — React Query handles this automatically with better caching and invalidation",
        "Not distinguishing between state categories — leads to a monolithic store that's hard to reason about and causes unnecessary re-renders",
        "Using Context for frequently-changing state — Context re-renders ALL consumers on any change, even with useMemo on the value",
        "Not normalizing state — storing nested/duplicated data wastes memory and makes updates error-prone",
        "Over-centralizing — putting form state in a global store when it should be local to the component",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you use Redux vs Zustand vs React Query vs Context?",
          a: "**Redux**: Complex client state with middleware needs (logging, undo/redo, time-travel debugging). Justified for apps with complex state machines or when the Redux ecosystem is a strong team competency. **Zustand**: Lightweight global client state — theme, auth status, UI preferences. 1KB bundle, no boilerplate, selector-based re-renders. **React Query**: All server state — API data fetching, caching, invalidation, optimistic updates. Replaces the 'API data in Redux' anti-pattern. **Context**: Infrequently-changing global config — theme, locale, feature flags. Avoid for anything that changes more than once per interaction session.",
        },
        {
          type: "scenario",
          q: "You're leading a team that has 50 Redux slices, each with their own async thunks for API calls. Engineering velocity is declining. What do you propose?",
          a: "**Phased migration strategy:** (1) **Identify categories**: Audit all 50 slices — likely 30+ are 'API data in Redux' (server state) and 15-20 are actual client state. (2) **Introduce React Query**: For new features, use React Query for server state. Create a `useApi` hook pattern that wraps React Query. (3) **Migrate incrementally**: Take the most-changed slices first, migrate their API logic to React Query, delete the Redux slice. (4) **Slim down Redux**: Keep Redux only for complex client state (cart, multi-step forms, undo/redo). (5) **Measure**: Track lines of state management code, re-render counts, and developer velocity (PRs/week). Expected outcome: 60%+ reduction in state management code, fewer stale data bugs.",
        },
      ],
    },
    {
      id: "redux-patterns-middleware",
      title: "Redux Toolkit & Middleware Patterns",
      explanation: `**Redux Toolkit (RTK)** is the standard way to use Redux. It reduces boilerplate with \`createSlice\`, \`createAsyncThunk\`, and integrates Immer for immutable updates. But at scale, the patterns you use with RTK matter more than using RTK itself.

**Sagas vs Thunks — when to use each:**

| Criteria | Thunks (createAsyncThunk) | Sagas (redux-saga) |
|----------|--------------------------|-------------------|
| Complexity | Simple async/await | Generators, effects, channels |
| Learning curve | Low | High |
| Testing | Mock API, assert state | Generator step-through |
| Cancellation | AbortController (manual) | Built-in with takeLatest/takeEvery |
| Complex flows | Difficult (nested thunks) | Natural (fork, race, all) |
| Debouncing | Manual implementation | Built-in with debounce effect |
| Use when | Simple CRUD, fetch → set state | Complex flows: polling, WebSocket management, event coordination |

**At scale, the key patterns are:**
1. **State normalization** with \`createEntityAdapter\`
2. **RTK Query** for API data (replaces manual thunks for CRUD)
3. **Middleware** for cross-cutting concerns (logging, analytics, error tracking)
4. **Selector composition** with \`createSelector\` (Reselect) for derived state`,
      codeExample: `// === REDUX TOOLKIT AT SCALE ===

// 1. Normalized state with createEntityAdapter
import { 
  createSlice, 
  createEntityAdapter, 
  createAsyncThunk,
  createSelector 
} from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  inStock: boolean;
}

const productsAdapter = createEntityAdapter<Product>({
  selectId: (product) => product.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const productsSlice = createSlice({
  name: 'products',
  initialState: productsAdapter.getInitialState({
    status: 'idle' as 'idle' | 'loading' | 'failed',
    filters: { category: null as string | null, inStockOnly: false },
  }),
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'idle';
        productsAdapter.upsertMany(state, action.payload);
      })
      .addCase(fetchProducts.rejected, (state) => { state.status = 'failed'; });
  },
});

// 2. Memoized selectors with createSelector
const { selectAll, selectById } = productsAdapter.getSelectors(
  (state: RootState) => state.products
);

const selectFilteredProducts = createSelector(
  [selectAll, (state: RootState) => state.products.filters],
  (products, filters) => {
    let result = products;
    if (filters.category) {
      result = result.filter(p => p.categoryId === filters.category);
    }
    if (filters.inStockOnly) {
      result = result.filter(p => p.inStock);
    }
    return result;
  }
  // Only recomputes when products or filters actually change
);

// 3. Custom middleware for cross-cutting concerns
const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Track specific actions
  if (action.type === 'cart/addItem') {
    analytics.track('item_added_to_cart', {
      productId: action.payload.productId,
      cartSize: store.getState().cart.items.length,
    });
  }
  
  // Track all errors
  if (action.type.endsWith('/rejected')) {
    analytics.track('async_error', {
      action: action.type,
      error: action.error?.message,
    });
  }
  
  return result;
};

// 4. Saga for complex async flow (WebSocket management)
import { eventChannel, END } from 'redux-saga';
import { take, put, call, fork, cancel, cancelled } from 'redux-saga/effects';

function createWebSocketChannel(url: string) {
  return eventChannel((emit) => {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => emit(JSON.parse(event.data));
    ws.onclose = () => emit(END);
    ws.onerror = () => emit(END);
    return () => ws.close();
  });
}

function* watchWebSocket() {
  const channel = yield call(createWebSocketChannel, 'wss://api.example.com/ws');
  
  try {
    while (true) {
      const message = yield take(channel);
      
      switch (message.type) {
        case 'NEW_MESSAGE':
          yield put(chatActions.messageReceived(message.payload));
          break;
        case 'USER_TYPING':
          yield put(chatActions.userTyping(message.payload));
          break;
        case 'PRESENCE_UPDATE':
          yield put(presenceActions.update(message.payload));
          break;
      }
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}`,
      exercise: `**Redux & Middleware Exercises:**
1. Implement a Redux slice with createEntityAdapter and write selectors that filter by multiple criteria
2. Build a custom analytics middleware that tracks all dispatched actions with timing data
3. Implement a saga that manages WebSocket connections with automatic reconnection and exponential backoff
4. Compare the code complexity of implementing a polling mechanism with thunks vs sagas
5. Create an undo/redo middleware using the Command pattern
6. Set up RTK Query for a REST API with automatic cache invalidation and optimistic updates`,
      commonMistakes: [
        "Not using createEntityAdapter for lists — manually managing arrays with push/filter is error-prone and non-performant",
        "Creating selectors inside components — they're recreated every render, defeating memoization; define selectors outside components",
        "Using sagas for simple CRUD — createAsyncThunk is simpler and sufficient for fetch → set state flows",
        "Not normalizing nested API responses — storing `post.author` as a nested object duplicates user data across posts",
        "Dispatching many sequential actions instead of one action with the full payload — each dispatch triggers a re-render cycle",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you choose Redux Sagas over Thunks?",
          a: "**Sagas when you need:** (1) Complex async orchestration — coordinating multiple API calls with dependencies. (2) Cancellation — takeLatest/takeEvery automatically cancel previous calls. (3) Background tasks — polling, WebSocket management, long-running processes. (4) Event channels — mapping external events (push notifications, deep links) to Redux actions. (5) Testing complex flows — generators are testable step-by-step. **Thunks when:** Simple async → dispatch pattern, no complex flow control needed, team isn't experienced with generators.",
        },
        {
          type: "scenario",
          q: "Your Redux store has 50 slices and the app re-renders excessively. How do you optimize?",
          a: "**Diagnosis:** (1) Use Redux DevTools to identify which actions trigger the most re-renders. (2) Use `useSelector` with specific selectors instead of selecting entire slices. (3) Check if selectors are memoized (createSelector) — unmemoized selectors return new references every time. **Optimizations:** (1) Replace `useSelector(s => s.products)` with `useSelector(selectFilteredProducts)` — specific, memoized selectors. (2) Split large slices into smaller ones with independent update frequencies. (3) Normalize state with createEntityAdapter — updates to one entity don't re-create the entire array. (4) Use `shallowEqual` as the second argument to `useSelector` for object selections. (5) Consider migrating high-frequency state to Zustand with selectors.",
        },
      ],
    },
  ],
};

export default rnPhase7;
