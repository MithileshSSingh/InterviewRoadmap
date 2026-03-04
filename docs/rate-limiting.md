# Rate Limiting

This document explains the dependency-free, in-memory rate limiting added to the Next.js App Router API.

---

## Files

| File | Purpose |
|---|---|
| `src/lib/rateLimit.ts` | Core rate-limit logic (reusable factory) |
| `src/middleware.ts` | Next.js middleware that applies limits to `/api/*` |

---

## How It Works

### 1. `src/lib/rateLimit.ts` — The Rate Limiter Factory

```
rateLimit(config) → check(ip) → RateLimitResult
```

`rateLimit` is a **factory function**: call it once at module load time with your chosen config and it returns a `check` function bound to its own private `Map`.

#### Internal Store

```ts
Map<string, { count: number; resetTime: number }>
```

Each unique IP address gets one entry. The entry holds:

- **`count`** — how many requests have been made in the current window
- **`resetTime`** — the Unix timestamp (ms) at which the window expires

#### Window Logic (Fixed Window)

```
First request in a window  →  create entry, count = 1, resetTime = now + interval
Subsequent requests         →  increment count
count >= maxRequests        →  reject (success: false)
now >= resetTime            →  window expired, start a new one
```

This is a **fixed window** counter (not sliding window). It is simple and perfect for the project's scale.

#### Return Value

```ts
interface RateLimitResult {
  success: boolean;   // true = request allowed
  remaining: number;  // requests left in this window
  reset: number;      // window expiry as Unix timestamp (seconds)
}
```

#### Memory Leak Prevention

A `setInterval` runs every **60 seconds** and deletes every entry whose `resetTime` is in the past. This prevents unbounded Map growth from IPs that visited once and never returned.

```ts
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetTime) store.delete(key);
  }
}, 60000);

// Prevent Node.js from keeping the process alive just for this timer
if (cleanupInterval.unref) cleanupInterval.unref();
```

`unref()` means the cleanup timer will not block the Node.js event loop from exiting if the server shuts down.

---

### 2. `src/middleware.ts` — Next.js Middleware

Next.js middleware runs **before** the route handler for every matched request. This is the right place for rate limiting because:

- It fires on the Edge runtime (very low overhead)
- It can short-circuit with a 429 before any expensive handler code runs
- It can inject response headers transparently

#### Limiter Instances

Four separate `rateLimit` instances are created at module scope (i.e., once per process startup), each with its own `Map`:

```ts
const chatLimiter             = rateLimit({ interval: 60000, maxRequests: 30  });
const generateLimiter         = rateLimit({ interval: 60000, maxRequests: 5   });
const streamLimiter           = rateLimit({ interval: 60000, maxRequests: 10  });
const careerforgeDefaultLimiter = rateLimit({ interval: 60000, maxRequests: 60 });
```

#### Rate Limit Tiers

| Route pattern | Limit | Reason |
|---|---|---|
| `/api/chat` | 30 req / min | Moderate — LLM streaming, one window |
| `/api/careerforge/generate` | 5 req / min | Most expensive — triggers full AI pipeline |
| `/api/careerforge/[id]/stream` | 10 req / min | Expensive — SSE streaming |
| All other `/api/careerforge/*` | 60 req / min | Cheap reads (history, progress) |

#### IP Detection

```ts
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
```

`x-forwarded-for` is set by reverse proxies (Vercel, Nginx, Cloudflare). It can contain a comma-separated list of IPs (client, proxy1, proxy2…); we take only the **first** (the original client).

`x-real-ip` is a fallback used by some hosts (e.g., Nginx with `proxy_set_header X-Real-IP $remote_addr`).

#### Request Flow

```
Incoming /api/* request
        │
        ▼
getClientIp(request)   →   ip string
        │
        ▼
Select limiter by pathname
        │
        ▼
limiter(ip)  →  { success, remaining, reset }
        │
   ┌────┴────┐
  false     true
   │          │
   ▼          ▼
429 JSON    NextResponse.next()
+ headers   + X-RateLimit-* headers
```

#### 429 Response

```json
{
  "error": "Too many requests",
  "retryAfter": 42
}
```

Headers on a 429:

| Header | Value |
|---|---|
| `Retry-After` | Seconds until window resets |
| `X-RateLimit-Remaining` | `0` |
| `X-RateLimit-Reset` | Unix timestamp (seconds) of window reset |

#### Headers on Allowed Requests

Every request that passes the limit gets two headers forwarded to the actual route handler's response:

| Header | Value |
|---|---|
| `X-RateLimit-Remaining` | Requests left in current window |
| `X-RateLimit-Reset` | Unix timestamp (seconds) of window reset |

#### Matcher Config

```ts
export const config = {
  matcher: ["/api/:path*"],
};
```

This tells Next.js to run this middleware **only** on `/api/*` paths. Pages, static assets, images, and `_next/*` are completely unaffected.

---

## Limitations & Future Considerations

| Limitation | Notes |
|---|---|
| **Single-process only** | The `Map` lives in RAM on one Node.js instance. If you scale to multiple replicas (e.g., serverless), each instance has its own independent counter. For distributed rate limiting, replace the `Map` with Redis / Upstash. |
| **Fixed window** | A burst at the very end of one window + the start of the next can allow up to 2× the limit in a short period. Sliding window algorithms (e.g., token bucket) prevent this but are more complex. |
| **IP spoofing** | `x-forwarded-for` can be spoofed unless your reverse proxy strips and re-stamps it. On Vercel the header is trustworthy; on bare deployments, consider validating it. |
