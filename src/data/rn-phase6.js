const rnPhase6 = {
  id: "phase-6",
  title: "Phase 6: Architecture & Large-Scale Design",
  emoji: "🏗️",
  description:
    "Architect scalable React Native apps — feature-based architecture, clean architecture, monorepos, API abstraction layers, error handling, dependency injection, and tech debt strategy.",
  topics: [
    {
      id: "feature-based-architecture",
      title: "Feature-Based & Clean Architecture",
      explanation: `**Feature-based architecture** organizes code by business domain rather than technical concern. Instead of grouping all components together, all hooks together, all services together — you group everything related to a feature in one directory.

**Why this matters at scale:**
- 15 engineers working on the same \`/components\` folder = merge conflicts, unclear ownership
- Feature folders = clear ownership boundaries, independent deployment, easier testing
- New engineers find related code in ONE place instead of hunting across 10 directories

**Traditional (Technical grouping) — breaks at scale:**
\`\`\`
src/
  components/     ← 200+ files, no clear ownership
  hooks/           ← 80+ hooks from every feature mixed
  services/        ← network, auth, storage, analytics all mixed
  screens/         ← flat list of 50+ screens
  redux/
    actions/       ← all actions mixed
    reducers/      ← all reducers mixed
\`\`\`

**Feature-based — scales with team:**
\`\`\`
src/
  features/
    auth/
      screens/
      components/
      hooks/
      api/
      store/
      __tests__/
      index.ts        ← Public API (what other features can import)
    checkout/
      screens/
      components/
      hooks/
      api/
      store/
      __tests__/
      index.ts
    feed/
      ...
  shared/             ← Cross-feature utilities
    components/       ← Design system components
    hooks/            ← Generic reusable hooks
    utils/            ← Formatters, validators
    api/              ← Base API client
  platform/           ← App-level infrastructure
    navigation/
    analytics/
    errorHandling/
    storage/
\`\`\`

**Clean Architecture principles applied to React Native:**
\`\`\`
┌─────────────────────────────────┐
│         UI Layer (Screens)       │ ← Knows about: Presentation, Domain
│  React Components, Navigation    │
├─────────────────────────────────┤
│     Presentation Layer           │ ← Knows about: Domain only
│  ViewModels, Presenters, Hooks   │
├─────────────────────────────────┤
│       Domain Layer               │ ← Knows about: NOTHING (pure business logic)
│  Entities, Use Cases, Interfaces │
├─────────────────────────────────┤
│       Data Layer                 │ ← Implements: Domain interfaces
│  API clients, Storage, Cache     │
└─────────────────────────────────┘
\`\`\`

**The dependency rule:** Dependencies point INWARD. The Domain layer has ZERO dependencies on React, React Native, or any framework. This makes business logic testable without mocking the entire framework.`,
      codeExample: `// === FEATURE-BASED ARCHITECTURE IN PRACTICE ===

// features/checkout/index.ts — Public API
// Only export what other features need
export { CheckoutScreen } from './screens/CheckoutScreen';
export { useCartTotal } from './hooks/useCartTotal';
export type { CartItem, CheckoutResult } from './types';
// Everything else is PRIVATE to this feature

// features/checkout/domain/entities.ts — Pure domain
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutResult {
  orderId: string;
  status: 'success' | 'failed' | 'pending';
  total: number;
}

// features/checkout/domain/useCases.ts — Business logic (NO React)
interface CartRepository {
  getItems(): Promise<CartItem[]>;
  addItem(item: CartItem): Promise<void>;
  removeItem(id: string): Promise<void>;
}

interface PaymentService {
  processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult>;
}

class CheckoutUseCase {
  constructor(
    private cartRepo: CartRepository,
    private paymentService: PaymentService,
    private analyticsService: AnalyticsService,
  ) {}
  
  async execute(paymentMethod: PaymentMethod): Promise<CheckoutResult> {
    const items = await this.cartRepo.getItems();
    
    if (items.length === 0) {
      throw new CheckoutError('Cart is empty', 'EMPTY_CART');
    }
    
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const paymentResult = await this.paymentService.processPayment(total, paymentMethod);
    
    if (paymentResult.status === 'success') {
      await this.cartRepo.clear();
      this.analyticsService.trackPurchase(total, items.length);
    }
    
    return {
      orderId: paymentResult.orderId,
      status: paymentResult.status,
      total,
    };
  }
}

// features/checkout/data/CartRepositoryImpl.ts — Data layer
class CartRepositoryImpl implements CartRepository {
  constructor(
    private api: APIClient,
    private localStorage: StorageService,
  ) {}
  
  async getItems(): Promise<CartItem[]> {
    try {
      // Try API first
      const items = await this.api.get('/cart');
      await this.localStorage.set('cart', items); // Cache locally
      return items;
    } catch (error) {
      // Fallback to local cache when offline
      return this.localStorage.get('cart') ?? [];
    }
  }
}

// features/checkout/hooks/useCheckout.ts — Presentation layer
function useCheckout() {
  const [state, setState] = useState<CheckoutState>({ status: 'idle' });
  
  // Dependencies injected (not imported directly)
  const checkoutUseCase = useInjection(CheckoutUseCase);
  
  const execute = useCallback(async (paymentMethod: PaymentMethod) => {
    setState({ status: 'processing' });
    try {
      const result = await checkoutUseCase.execute(paymentMethod);
      setState({ status: 'success', result });
    } catch (error) {
      setState({ status: 'error', error: error as CheckoutError });
    }
  }, [checkoutUseCase]);
  
  return { state, execute };
}

// features/checkout/screens/CheckoutScreen.tsx — UI layer
function CheckoutScreen() {
  const { state, execute } = useCheckout();
  // UI only — delegates all logic to the hook/use case
  // ...
}`,
      exercise: `**Architecture Exercises:**
1. Refactor a flat-structured React Native project into feature-based architecture — document the before/after
2. Create a feature module with public API (index.ts) and verify that other features can't import private internals (use ESLint import restrictions)
3. Implement a use case class with dependency injection that has ZERO React imports — test it with plain Jest
4. Draw the dependency diagram for a 5-feature app showing which features depend on what
5. Set up a monorepo with shared packages (ui-kit, api-client, analytics) and feature apps
6. Write architectural documentation for your app that a new engineer can understand in 30 minutes`,
      commonMistakes: [
        "Over-engineering small apps with clean architecture — for apps with <10 screens, feature folders + hooks is sufficient",
        "Leaking implementation details through feature exports — index.ts should only export what other features genuinely need",
        "Creating circular dependencies between features — Feature A imports from Feature B which imports from Feature A",
        "Not enforcing architectural boundaries — without lint rules or CI checks, developers drift back to dumping code in shared folders",
        "Making the domain layer depend on React or RN — defeats the purpose of clean architecture; domain should be pure TypeScript",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "You're building a React Native app that will grow from 5 screens to 50+ screens with 10 engineers. How do you structure it?",
          a: "**Feature-based architecture with shared platform layer.** Structure: (1) `features/` — each feature is self-contained with its own screens, components, hooks, state, API, and tests. Public API via `index.ts`. (2) `shared/` — design system components, generic hooks (useDebounce, useAsync), utility functions. (3) `platform/` — navigation, analytics, error handling, storage abstractions. **Enforcement:** ESLint import rules prevent cross-feature internal imports. Each feature has a CODEOWNERS file. CI validates no circular dependencies. **Scaling strategy:** Each feature is owned by a team, can have its own PR review policy, and is independently testable.",
        },
        {
          type: "conceptual",
          q: "What is the Dependency Inversion Principle and how does it apply to React Native?",
          a: "DIP states: High-level modules should not depend on low-level modules; both should depend on abstractions. In RN: your checkout use case shouldn't import `fetch` directly. Instead, define a `PaymentService` interface in the domain layer, implement it in the data layer (`StripePaymentService`), and inject it. Benefits: (1) Test checkout logic without network calls. (2) Swap payment providers without changing business logic. (3) Use different implementations per platform. In React, this is done via Context (poor man's DI) or libraries like `tsyringe`/`inversify`.",
        },
      ],
    },
    {
      id: "monorepo-code-ownership",
      title: "Monorepo Setup & Code Ownership",
      explanation: `**Monorepos** allow you to manage multiple packages (shared UI kit, API client, analytics, feature modules) in a single repository with shared tooling and atomic commits.

**When to use a monorepo for React Native:**
- You have a shared component library used across multiple apps
- You want to share code between RN mobile and React web
- You have independent teams that need clear package boundaries
- You want atomic changes across multiple packages (update an API + consumers in one PR)

**Popular monorepo tools:**
- **Turborepo** — Incremental builds, remote caching, simple config
- **Nx** — More features, plugin ecosystem, affected-based testing
- **Yarn/npm workspaces** — Basic workspace management, dependency hoisting

**Code ownership strategy:**
Code ownership defines WHO is responsible for WHAT code. At scale, this prevents:
- "Tragedy of the commons" — nobody owns shared code, quality degrades
- Bottleneck reviews — one person reviews all PRs
- Unreviewed changes to critical infrastructure

**CODEOWNERS file pattern:**
\`\`\`
# .github/CODEOWNERS
# Platform team owns core infrastructure
/packages/platform/**        @platform-team
/packages/design-system/**   @design-system-team

# Feature teams own their features
/apps/mobile/src/features/checkout/**   @payments-team
/apps/mobile/src/features/feed/**       @feed-team
/apps/mobile/src/features/auth/**       @auth-team

# Shared packages need platform team review
/packages/api-client/**      @platform-team
/packages/analytics/**       @platform-team @data-team
\`\`\``,
      codeExample: `// === MONOREPO STRUCTURE ===

/*
my-app/
├── apps/
│   ├── mobile/              ← React Native app
│   │   ├── src/
│   │   ├── android/
│   │   ├── ios/
│   │   └── package.json
│   └── web/                 ← React web app (optional)
│       ├── src/
│       └── package.json
├── packages/
│   ├── ui-kit/              ← Shared components
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api-client/          ← Shared API layer
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── types.ts
│   │   └── package.json
│   ├── shared-types/        ← Shared TypeScript types
│   │   ├── src/
│   │   └── package.json
│   └── analytics/           ← Shared analytics
│       ├── src/
│       └── package.json
├── turbo.json               ← Turborepo config
├── package.json             ← Root workspace config
└── tsconfig.base.json       ← Shared TS config
*/

// turbo.json — Build pipeline
const turboConfig = {
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
};

// packages/api-client/src/client.ts — Shared across mobile + web
import type { APIResponse, RequestConfig } from '@myapp/shared-types';

export class APIClient {
  constructor(
    private baseURL: string,
    private getToken: () => Promise<string | null>,
  ) {}
  
  async request<T>(config: RequestConfig): Promise<APIResponse<T>> {
    const token = await this.getToken();
    
    const response = await fetch(\`\${this.baseURL}\${config.endpoint}\`, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    
    return response.json();
  }
}

// apps/mobile/src/config/api.ts — Mobile-specific setup
import { APIClient } from '@myapp/api-client';
import { getAuthToken } from '../features/auth';

export const apiClient = new APIClient(
  'https://api.example.com/v1',
  getAuthToken,
);`,
      exercise: `**Monorepo & Ownership Exercises:**
1. Set up a Turborepo monorepo with a React Native app and a shared UI package
2. Create a shared TypeScript types package used by both mobile app and API client
3. Set up a CODEOWNERS file for a 3-team organization
4. Configure ESLint import restrictions to enforce package boundaries
5. Implement a shared analytics package with platform-specific adapters (mobile/web)
6. Set up CI that only runs tests for packages affected by a PR (using Turborepo or Nx affected)`,
      commonMistakes: [
        "Not configuring Metro bundler correctly for monorepo — Metro needs explicit watchFolders for packages outside the app directory",
        "Circular dependencies between packages — shared-types imports from api-client which imports from shared-types",
        "Not defining clear package boundaries — teams start importing internal files from other packages instead of the public API",
        "Making everything a shared package — only share when 2+ consumers exist; premature abstraction adds complexity",
        "Not setting up consistent tooling (ESLint, TypeScript, Jest configs) at the root level — each package evolves its own config",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your company has 3 React Native apps sharing some UI components and API logic. How do you structure this?",
          a: "**Monorepo with shared packages.** Structure: `apps/app1`, `apps/app2`, `apps/app3` for each app. `packages/ui-kit` for shared components, `packages/api-client` for shared API, `packages/shared-types` for TypeScript types. Use Turborepo for build orchestration. Each package has its own `package.json` and publishes to an internal registry (or uses workspace links). Benefits: atomic changes (update API types + all consumers), shared CI, consistent tooling. CODEOWNERS ensures each package has a responsible team.",
        },
        {
          type: "conceptual",
          q: "How do you enforce architectural boundaries in a large React Native codebase?",
          a: "**Multi-layered enforcement:** (1) **ESLint import restrictions** — `eslint-plugin-import` with `no-restricted-imports` prevents importing internal files from other features. (2) **CODEOWNERS** — required reviews from owning team for changes to critical packages. (3) **TypeScript project references** — each package has its own tsconfig with explicit references, preventing accidental imports. (4) **CI checks** — detect circular dependencies using `madge`, enforce import boundaries using `eslint-plugin-boundaries`. (5) **ADRs** — document WHY boundaries exist so developers understand the intent, not just the rule.",
        },
      ],
    },
    {
      id: "error-handling-architecture",
      title: "Error Handling & API Abstraction Architecture",
      explanation: `**Error handling architecture** in React Native must cover multiple failure domains:

1. **Network errors** — No connectivity, timeouts, 5xx errors
2. **API errors** — 4xx responses, validation errors, auth failures
3. **Runtime errors** — JS exceptions, native crashes, unhandled rejections
4. **State errors** — Corrupted state, impossible state transitions
5. **Navigation errors** — Invalid routes, deep link failures

**Principles of production error handling:**
- **Errors are data, not exceptions** — Model errors as part of your state (discriminated unions)
- **Fail gracefully, not silently** — Always inform the user AND log for debugging
- **Centralize error reporting** — One error reporting pipeline (Sentry, Crashlytics)
- **Isolate failures** — Error boundary per feature so one crash doesn't take down the app
- **Retry with backoff** — Network failures should auto-retry with exponential backoff

**API abstraction layer:**
Don't scatter \`fetch()\` calls throughout your components. Build a centralized API client that handles:
- Authentication (token injection, refresh)
- Error normalization (different APIs return errors differently)
- Request/response interceptors (logging, analytics)
- Retry logic (with backoff)
- Offline queuing
- Response caching
- Request deduplication`,
      codeExample: `// === PRODUCTION ERROR HANDLING ARCHITECTURE ===

// 1. Error type hierarchy
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'critical' | 'error' | 'warning' | 'info',
    public userMessage?: string,
    public metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class NetworkError extends AppError {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = true,
  ) {
    super(message, 'NETWORK_ERROR', statusCode && statusCode >= 500 ? 'critical' : 'error');
  }
}

class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 'error', 'Please sign in again');
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: Record<string, string[]>,
  ) {
    super(message, 'VALIDATION_ERROR', 'warning');
  }
}

// 2. Central error reporter
class ErrorReporter {
  private static instance: ErrorReporter;
  
  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }
  
  report(error: Error, context?: Record<string, any>) {
    // Always log locally
    console.error('[ErrorReporter]', error.message, context);
    
    if (error instanceof AppError) {
      // Structured error — send with metadata
      Sentry.captureException(error, {
        tags: { errorCode: error.code, severity: error.severity },
        extra: { ...error.metadata, ...context },
      });
      
      // Critical errors alert on-call
      if (error.severity === 'critical') {
        this.alertOnCall(error);
      }
    } else {
      // Unexpected error — always critical
      Sentry.captureException(error, { extra: context });
    }
  }
  
  private alertOnCall(error: AppError) {
    // PagerDuty, Opsgenie, etc.
  }
}

// 3. API Client with interceptors and retry
class APIClient {
  private interceptors: RequestInterceptor[] = [];
  
  constructor(
    private config: APIConfig,
    private errorReporter: ErrorReporter,
  ) {
    // Default interceptors
    this.addInterceptor(new AuthInterceptor());
    this.addInterceptor(new LoggingInterceptor());
  }
  
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;
    
    // Apply interceptors
    let config = { url: \`\${this.config.baseURL}\${endpoint}\`, ...fetchOptions };
    for (const interceptor of this.interceptors) {
      config = await interceptor.onRequest(config);
    }
    
    // Retry with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(config.url, config);
        
        if (response.status === 401) {
          throw new AuthError('Token expired');
        }
        
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new NetworkError(
            body.message || \`HTTP \${response.status}\`,
            response.status,
            response.status >= 500, // 5xx = retryable
          );
        }
        
        return response.json();
      } catch (error) {
        if (error instanceof AuthError) {
          // Try token refresh once
          const refreshed = await this.refreshToken();
          if (refreshed) continue; // Retry with new token
          throw error; // Refresh failed
        }
        
        if (error instanceof NetworkError && error.retryable && attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s
          await this.delay(retryDelay * Math.pow(2, attempt));
          continue;
        }
        
        this.errorReporter.report(error as Error, { endpoint, attempt });
        throw error;
      }
    }
    
    throw new NetworkError('Max retries exceeded', undefined, false);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}`,
      exercise: `**Error Handling Exercises:**
1. Implement an API client with retry logic and exponential backoff
2. Create a global error boundary that catches rendering errors and reports to Sentry
3. Build a network status monitor that shows an offline banner and queues failed requests
4. Implement token refresh logic that transparently retries the failed request
5. Create error types for all failure modes in your app and map them to user-facing messages
6. Build a debug screen that shows recent errors, network requests, and state snapshots`,
      commonMistakes: [
        "Catching errors silently — `catch (e) {}` hides bugs; always log or report errors even if you handle them gracefully",
        "Showing raw error messages to users — 'TypeError: Cannot read property x of undefined' is not a user message",
        "Not implementing retry logic for transient network failures — user gets an error on a flaky connection instead of automatic recovery",
        "Not isolating failures with error boundaries — one component's render error crashes the entire app",
        "Inconsistent error handling — some API calls have try/catch, others don't; some show alerts, others show inline errors",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Your app's API returns errors in 3 different formats depending on the endpoint. How do you normalize this?",
          a: "**API client response interceptor.** Create a response interceptor in the API client that normalizes ALL API error responses into a consistent `AppError` structure: `{ code: string, message: string, details?: Record }`. Map vendor-specific formats: REST errors (`{ error: { message, code } }`), GraphQL errors (`{ errors: [{ message, extensions }] }`), legacy errors (`{ success: false, msg: string }`). Each format gets a normalizer function. The rest of the app only deals with `AppError` objects. This also makes error handling testable — you can test normalization logic in isolation.",
        },
        {
          type: "conceptual",
          q: "How do you design an offline-capable error handling strategy?",
          a: "**Offline error strategy:** (1) Network requests that fail due to connectivity are queued (not errored) — use NetInfo to detect offline state. (2) Queued requests retry automatically when connectivity returns (WorkManager on Android, BGTaskScheduler on iOS). (3) Users see 'Offline — changes will sync when online' instead of error messages. (4) Conflicts from offline changes use a resolution strategy (last-write-wins, merge, or user-prompted). (5) Critical actions (payments) show a clear warning that they require connectivity. (6) Cached data is served from local storage with a 'last updated' indicator.",
        },
      ],
    },
  ],
};

export default rnPhase6;
