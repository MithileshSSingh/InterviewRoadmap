# Authentication — End-to-End Guide

This document explains how authentication works in this application, from the moment a user clicks "Sign in" to how the backend uses their identity to protect data. Read top-to-bottom for a complete mental model.

---

## Overview

Authentication is **optional**. Anonymous users can generate and view roadmaps using a browser-local UUID (`cf-session-id`). Signed-in users get the same experience plus cross-device persistence and ownership-based access control.

**Provider:** Google OAuth via NextAuth.js v5 (Auth.js)
**Session type:** Database sessions (not JWT — the session token is stored in the `sessions` table, not inside a cookie)
**Library:** `next-auth@^5.0.0-beta` + custom Prisma adapter

---

## Key Files

| File | Role |
|------|------|
| `src/lib/auth.ts` | NextAuth config — providers, session strategy, callbacks |
| `src/lib/authAdapter.ts` | Custom Prisma adapter (bridges Auth.js ↔ Prisma 7) |
| `src/lib/db.ts` | Prisma client singleton |
| `src/app/api/auth/[...nextauth]/route.ts` | Catch-all route that handles all `/api/auth/*` requests |
| `src/components/Providers.js` | `SessionProvider` wrapper — makes session available to client components |
| `src/components/AuthButton.js` | Sign-in button / avatar dropdown in the top bar |
| `src/app/auth/signin/page.js` | Custom sign-in page |
| `src/middleware.ts` | Skips rate limiting for `/api/auth/*` paths |
| `prisma/schema.prisma` | Database models for users, accounts, sessions |

---

## Database Models

Auth.js requires four tables. They live in `prisma/schema.prisma`:

```
User              — one row per human (id, email, name, image)
Account           — one row per OAuth connection (Google account linked to a User)
Session           — one active browser session per login, keyed by sessionToken cookie
VerificationToken — used for magic-link / email flows (not currently active)
```

The application's `Roadmap` model has an optional `userId` column:

```prisma
model Roadmap {
  userId  String?
  user    User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
  ...
}
```

`userId` is `null` for anonymous roadmaps. When a user signs in, their roadmaps can be migrated to their account (see [Session Migration](#session-migration)).

---

## Part 1 — Frontend: Rendering the Auth State

### 1.1 SessionProvider (`src/components/Providers.js`)

The root layout (`src/app/layout.js`) wraps the entire app in `<Providers>`:

```
<Providers>           ← "use client" — mounts SessionProvider
  <ThemeProvider>
    ...app...
    <AuthButton />    ← reads session via useSession()
  </ThemeProvider>
</Providers>
```

`SessionProvider` from `next-auth/react` keeps the session in React context and exposes a `useSession()` hook. On first load it fetches `/api/auth/session` to hydrate the session state.

### 1.2 AuthButton (`src/components/AuthButton.js`)

Located in the top-right corner. Uses `useSession()` which returns:

- `status: "loading"` — show a faded placeholder (prevents hydration mismatch)
- `status: "unauthenticated"` — show a person icon button → clicking calls `signIn()`
- `status: "authenticated"` — show avatar/initial → clicking opens a dropdown with name, email, and "Sign out"

**Hydration guard:** A `mounted` state ensures nothing is rendered server-side (avoids SSR/client mismatch for cookie-dependent state).

---

## Part 2 — The Sign-In Flow (Frontend → Google → Backend → Frontend)

```
User clicks "Sign in"
       │
       ▼
signIn(undefined, { callbackUrl: window.location.href })
       │  (from next-auth/react)
       ▼
Redirect to /auth/signin      ← custom sign-in page
       │
       ▼
User clicks "Continue with Google"
       │
signIn("google", { callbackUrl })
       │
       ▼
Redirect to Google OAuth consent screen
       │
       ▼  (user approves)
Google redirects to /api/auth/callback/google
       │
       ▼
NextAuth callback handler (src/app/api/auth/[...nextauth]/route.ts)
       │
       ├─ calls adapter.getUserByAccount()  → look up existing account in DB
       │
       ├─ [first time] calls adapter.createUser() → insert into `users` table
       │           then adapter.linkAccount()  → insert into `accounts` table
       │
       ├─ [returning]  skips user creation, proceeds to session creation
       │
       ├─ calls adapter.createSession()  → insert row into `sessions` table
       │           session = { sessionToken: <uuid>, userId, expires: +30 days }
       │
       ├─ sets cookie: next-auth.session-token=<sessionToken>  (httpOnly, Secure)
       │
       └─ redirects to callbackUrl (the original page the user was on)
```

### 2.1 Auth API Route (`src/app/api/auth/[...nextauth]/route.ts`)

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

This single file makes Next.js route every `/api/auth/*` request through NextAuth. Covered paths include:

| Path | What it does |
|------|-------------|
| `GET /api/auth/session` | Returns the current session JSON to the client |
| `GET /api/auth/providers` | Lists configured providers |
| `GET /api/auth/csrf` | Returns CSRF token |
| `GET /api/auth/signin` | Redirects to custom sign-in page |
| `GET /api/auth/callback/google` | Handles Google OAuth callback |
| `POST /api/auth/signout` | Invalidates the session and clears the cookie |

### 2.2 Auth Config (`src/lib/auth.ts`)

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: CustomPrismaAdapter(),
  session: { strategy: "database" },
  providers: [Google({ clientId, clientSecret })],
  pages: { signIn: "/auth/signin" },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;   // attach DB user id to the session object
      return session;
    },
  },
});
```

**`session.strategy: "database"`** means the cookie only contains an opaque token. The actual session data (userId, expiry) is fetched from the `sessions` table on every request. This is safer than JWT because:
- Sessions can be invalidated server-side immediately
- No user data is stored in the cookie itself

**`callbacks.session`** runs every time a session is read. It copies `user.id` from the database record into the session object so API routes and client code can access it via `session.user.id`.

### 2.3 Custom Prisma Adapter (`src/lib/authAdapter.ts`)

Auth.js needs a database adapter to store users, accounts, and sessions. The official `@auth/prisma-adapter` has compatibility issues with Prisma 7's ESM-only generated client, so a custom adapter is used instead.

The adapter implements the `Adapter` interface from `next-auth/adapters`:

```ts
function db(): any {
  return require("@/lib/db").prisma;  // lazy — avoids import ordering issues
}

export function CustomPrismaAdapter(): Adapter {
  return {
    createUser(data)                         → prisma.user.create(...)
    getUser(id)                              → prisma.user.findUnique(...)
    getUserByEmail(email)                    → prisma.user.findUnique(...)
    getUserByAccount({ provider, ... })      → prisma.account.findUnique(... include: user)
    updateUser(data)                         → prisma.user.update(...)
    deleteUser(userId)                       → prisma.user.delete(...)
    linkAccount(data)                        → prisma.account.create(...)
    unlinkAccount({ provider, ... })         → prisma.account.delete(...)
    createSession(data)                      → prisma.session.create(...)
    getSessionAndUser(sessionToken)          → prisma.session.findUnique(... include: user)
    updateSession(data)                      → prisma.session.update(...)
    deleteSession(sessionToken)              → prisma.session.delete(...)
    createVerificationToken(data)            → prisma.verificationToken.create(...)
    useVerificationToken({ identifier, token }) → prisma.verificationToken.delete(...)
  };
}
```

**Why lazy `require()` in `db()`?** The Prisma 7 generated client (`src/generated/prisma/client.ts`) is ESM and uses `import.meta.url`. When accessed via a top-level `import`, module initialization order can cause the model accessors (`prisma.account`, `prisma.user`, etc.) to be undefined. The lazy `require()` call defers the import until the first adapter method is actually called, by which time the Prisma singleton is fully initialized.

### 2.4 Prisma Client (`src/lib/db.ts`)

```ts
import { PrismaClient } from "@/generated/prisma/client";  // ESM import — required for Prisma 7

const globalForPrisma = globalThis as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**`globalThis` singleton pattern** prevents creating a new database connection on every hot-reload in development. In production, the module is only initialized once anyway.

---

## Part 3 — Backend: How API Routes Check Auth

Any server-side code (API route or Server Component) can call `auth()` from `@/lib/auth`:

```ts
import { auth } from "@/lib/auth";

const session = await auth();
const userId = session?.user?.id ?? null;
```

`auth()` reads the `next-auth.session-token` cookie from the incoming request, looks up the matching row in the `sessions` table, joins with the `users` table, and returns the session object (or `null` if the cookie is missing or expired).

### 3.1 Generate Roadmap (`POST /api/careerforge/generate`)

```
Client sends: { role, company, experienceLevel, sessionId }
                                                  └── anonymous browser UUID
Server does:
  session = await auth()
  userId  = session?.user?.id ?? null   ← null for anonymous users

  prisma.roadmap.create({ sessionId, userId, ... })
```

Both `sessionId` and `userId` are stored. This makes roadmaps findable by either identifier.

### 3.2 Fetch History (`GET /api/careerforge/history?sessionId=...`)

```
Server does:
  session = await auth()
  userId  = session?.user?.id ?? null

  // Build OR query — show roadmaps owned by EITHER identity
  where = userId && sessionId
    ? { OR: [{ userId }, { sessionId }] }
    : userId   ? { userId }
    : sessionId ? { sessionId }
    : return []
```

Authenticated users see roadmaps from both their account AND their current anonymous session. Anonymous users see only their session's roadmaps.

### 3.3 Delete Roadmap (`DELETE /api/careerforge/[id]`)

```
Server does:
  session = await auth()
  userId  = session?.user?.id ?? null
  requestSessionId = request.headers.get("x-session-id")

  roadmap = prisma.roadmap.findUnique({ id })

  canDelete =
    (userId && roadmap.userId === userId)         ← authenticated owner
    || (requestSessionId && roadmap.sessionId === requestSessionId)  ← anonymous owner

  if (!canDelete) return 403 Unauthorized
  prisma.roadmap.delete({ id })
```

User A cannot delete User B's roadmap. Anonymous users can only delete roadmaps created in their session.

The client (`src/app/careerforge/page.js`) always sends `x-session-id: <sessionId>` on delete requests so that anonymous deletes work even when the user is not signed in.

---

## Part 4 — Session Migration

When a user signs in for the first time, they may have anonymous roadmaps created before signing in. The migration flow claims those roadmaps:

```
User signs in → session.user.id becomes available in the client
       │
       ▼ (useEffect in src/app/careerforge/page.js)
       │
       ├─ Check localStorage: "cf-migrated-{userId}" already set? → skip
       │
       └─ POST /api/careerforge/migrate-session  { sessionId }
              │
              ▼
        Server checks: session = await auth() → must be authenticated
        prisma.roadmap.updateMany({
          where: { sessionId, userId: null },  ← only unclaimed roadmaps
          data:  { userId: session.user.id }
        })
              │
              ▼
        Returns { migrated: N }
              │
              ▼
        Client sets localStorage["cf-migrated-{userId}"] = true  ← one-time flag
        Client refreshes history list
```

The `userId: null` guard ensures that roadmaps already claimed by another user are never overwritten. The localStorage flag ensures migration only runs once per user per browser.

---

## Part 5 — Middleware (`src/middleware.ts`)

The middleware runs on every `/api/*` request and applies rate limiting. Auth routes are explicitly exempted:

```ts
if (pathname.startsWith("/api/auth")) {
  return NextResponse.next();   // skip — NextAuth has its own CSRF protection
}
```

This is necessary because NextAuth's internal requests (session polling, OAuth callbacks, CSRF token fetches) would otherwise be rate-limited and break the auth flow.

---

## Environment Variables

```
AUTH_SECRET=<openssl rand -base64 32>    # Required — signs session cookies
AUTH_GOOGLE_ID=<OAuth 2.0 client ID>    # From Google Cloud Console
AUTH_GOOGLE_SECRET=<OAuth 2.0 secret>   # From Google Cloud Console
AUTH_TRUST_HOST=true                    # Required in non-Vercel deployments
```

> **Note:** These are NextAuth v5 names. The old v4 names (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`) are no longer used.

---

## Sign-In Page (`src/app/auth/signin/page.js`)

The custom sign-in page at `/auth/signin` is configured in `src/lib/auth.ts` via `pages.signIn`. NextAuth redirects here instead of its built-in sign-in page.

The page uses a `<Suspense>` boundary wrapping the inner component because it calls `useSearchParams()`, which requires Suspense in Next.js 16 App Router to avoid a build error.

Query params handled:
- `?callbackUrl=` — where to redirect after successful sign-in
- `?error=OAuthAccountNotLinked` — shown when the email is already linked to a different provider

---

## Complete Request Flow Diagram

```
Browser                    Next.js Server              Google OAuth         Database
  │                              │                           │                  │
  │── GET /  ──────────────────► │                           │                  │
  │◄── HTML (app shell) ─────── │                           │                  │
  │                              │                           │                  │
  │── GET /api/auth/session ───► │ (Providers.js polls this) │                  │
  │                              │── SELECT sessions WHERE   │                  │
  │                              │   token=<cookie> ────────────────────────►  │
  │                              │◄── session row ──────────────────────────── │
  │◄── { user: null } ────────── │   (null = not signed in)  │                  │
  │                              │                           │                  │
  │── click Sign In ──────────── │                           │                  │
  │◄── redirect /auth/signin ─── │                           │                  │
  │── click Continue w/ Google ► │                           │                  │
  │◄── redirect to Google ─────  │                           │                  │
  │                              │                           │                  │
  │── Google consent ──────────────────────────────────────► │                  │
  │◄── redirect /api/auth/callback/google?code=... ───────── │                  │
  │                              │                           │                  │
  │── GET /api/auth/callback/... ► │                         │                  │
  │                              │── exchange code for tokens ──────────────►  │
  │                              │◄── { id_token, profile } ────────────────── │
  │                              │── getUserByAccount() ────────────────────►  │
  │                              │◄── null (first time) ─────────────────────  │
  │                              │── createUser() ─────────────────────────►   │
  │                              │── linkAccount() ────────────────────────►   │
  │                              │── createSession() ──────────────────────►   │
  │                              │◄── session row ─────────────────────────    │
  │◄── Set-Cookie: session-token │                           │                  │
  │◄── redirect /careerforge ─── │                           │                  │
  │                              │                           │                  │
  │── POST /api/careerforge/generate ──────────────────────► │                  │
  │   (with session cookie)      │── auth() reads cookie     │                  │
  │                              │── SELECT sessions ──────────────────────►   │
  │                              │◄── { userId: "xyz" } ───────────────────    │
  │                              │── roadmap.create({ userId: "xyz", ... }) ►  │
  │◄── { id: "roadmap-id" } ──── │                           │                  │
```

---

## Adding a New Protected Route

To require authentication on a new API route:

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // session.user.id is the User.id from the database
  const userId = session.user.id;
  // ... do work
}
```

To make it optional (anonymous users allowed but enhanced for signed-in):

```ts
const session = await auth();
const userId = session?.user?.id ?? null;  // null = anonymous
```
