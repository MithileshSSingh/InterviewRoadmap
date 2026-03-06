const nodePhase8 = {
  id: "phase-8",
  title: "Phase 8: Authentication & Security",
  emoji: "🔐",
  description:
    "Implement secure authentication with JWT, bcrypt, sessions, OAuth 2.0, and protect your Node.js apps against common security vulnerabilities.",
  topics: [
    {
      id: "jwt-authentication",
      title: "JWT Authentication",
      explanation: `**JSON Web Tokens (JWT)** are the most popular authentication mechanism for Node.js APIs. A JWT is a self-contained, signed token that carries user identity and claims.

**JWT structure:**
\`\`\`
Header.Payload.Signature
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.signature
\`\`\`

1. **Header** — Algorithm and token type (\`{"alg": "HS256", "typ": "JWT"}\`)
2. **Payload** — Claims (user data, expiration, issued at)
3. **Signature** — HMAC or RSA signature to verify integrity

**Authentication flow:**
\`\`\`
1. Client sends credentials (email/password) → POST /api/auth/login
2. Server verifies credentials against database
3. Server creates JWT with user ID + role → signs with secret key
4. Server returns JWT to client
5. Client stores JWT (localStorage, httpOnly cookie)
6. Client sends JWT in Authorization header → Bearer <token>
7. Server middleware verifies JWT signature → extracts user → req.user
\`\`\`

**Access tokens vs. Refresh tokens:**
| Feature | Access Token | Refresh Token |
|---------|-------------|---------------|
| Purpose | Authorize API requests | Get new access tokens |
| Lifetime | Short (15min–1hr) | Long (7–30 days) |
| Storage | Memory / httpOnly cookie | httpOnly cookie only |
| Revocation | Difficult (stateless) | Easy (database-backed) |

🏠 **Real-world analogy:** A JWT is like a **concert wristband**. The entry guard (server) issues the wristband (token) after checking your ticket (credentials). Inside the venue, you just flash your wristband (send token). The wristband is hard to fake (signed) and expires at the end of the concert (TTL).`,
      codeExample: `// JWT Authentication — Complete Implementation

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = "15m"; // Access token: 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // Refresh token: 7 days

// Mock user database
const users = [];
const refreshTokens = new Set(); // In production, use Redis/DB

// 1. Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: "Invalid email or password (min 8 chars)" });
  }

  // Check duplicate
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = { id: users.length + 1, name, email, password: hashedPassword, role: "user" };
  users.push(user);

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  refreshTokens.add(refreshToken);

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

// 2. Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const { accessToken, refreshToken } = generateTokens(user);
  refreshTokens.add(refreshToken);

  res.json({ accessToken, refreshToken });
});

// 3. Refresh token
app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.userId);

    // Rotate refresh token
    refreshTokens.delete(refreshToken);
    const tokens = generateTokens(user);
    refreshTokens.add(tokens.refreshToken);

    res.json(tokens);
  } catch {
    refreshTokens.delete(refreshToken);
    res.status(401).json({ error: "Expired refresh token" });
  }
});

// 4. Logout
app.post("/api/auth/logout", authenticate, (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens.delete(refreshToken);
  res.status(204).end();
});

// Helper: Generate token pair
function generateTokens(user) {
  const payload = { userId: user.id, role: user.role };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

  return { accessToken, refreshToken };
}

// 5. Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    res.status(401).json({ error: "Invalid token" });
  }
}

// 6. Authorization middleware
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// 7. Protected routes
app.get("/api/profile", authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.user.userId);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.get("/api/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Admin access granted", users: users.length });
});

app.listen(3000, () => console.log("Auth server on http://localhost:3000"));`,
      exercise: `**Exercises:**
1. Implement a complete auth system with register, login, refresh, and logout endpoints
2. Add role-based authorization middleware that checks user roles from the JWT payload
3. Implement refresh token rotation — issue a new refresh token on every refresh and invalidate the old one
4. Store refresh tokens in Redis with TTL instead of an in-memory Set
5. Add password reset functionality with time-limited, single-use tokens
6. Implement rate limiting on auth endpoints (max 5 login attempts per minute per IP)`,
      commonMistakes: [
        "Storing JWTs in localStorage — vulnerable to XSS attacks; use httpOnly cookies for web apps or keep in memory with refresh token flow",
        "Using a weak or short JWT secret — secrets should be 256+ bit random strings; never hardcode 'secret' as the key",
        "Not setting expiration on access tokens — tokens that never expire are permanent credentials if stolen; use short TTLs (15min–1hr)",
        "Putting sensitive data in JWT payload — JWTs are base64-encoded (NOT encrypted!); anyone can decode the payload; only include user ID and role",
        "Not validating the token algorithm — accepting 'none' algorithm is a known JWT vulnerability; always specify the expected algorithm",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does JWT authentication work and what are its trade-offs?",
          a: "**Flow:** Server signs a token with a secret key containing user identity. Client sends this token with every request. Server verifies the signature to authenticate. **Pros:** (1) Stateless — no server-side session storage. (2) Scalable — works across multiple servers without shared state. (3) Self-contained — carries claims (user ID, role, expiration). **Cons:** (1) Can't revoke individual tokens (stateless = no blacklist). (2) Token size is larger than a session ID. (3) Sensitive to token theft (especially with long TTLs). **Mitigation:** Use short-lived access tokens (15min) with refresh tokens stored server-side for revocation capability.",
        },
        {
          type: "tricky",
          q: "How do you handle JWT revocation?",
          a: 'JWTs are stateless — once issued, they can\'t be "recalled." **Strategies:** (1) **Short-lived access tokens** (15min) — limits exposure time. (2) **Refresh token rotation** — store refresh tokens in database/Redis; delete on logout; issue new pair on refresh. (3) **Token blacklist** — store revoked token IDs in Redis (check on every request); defeats the stateless benefit. (4) **Version field** — store a `tokenVersion` on the user; increment on logout/password change; verify version in token matches database. (5) **Sliding sessions** — re-issue tokens on activity; pair with short TTLs.',
        },
      ],
    },
    {
      id: "security-best-practices",
      title: "Security Best Practices",
      explanation: `Security is not a feature — it's a requirement. Node.js applications face specific security threats that must be addressed at every layer.

**OWASP Top 10 relevant to Node.js:**
1. **Injection** — SQL/NoSQL injection, command injection
2. **Broken Authentication** — Weak passwords, session hijacking
3. **Sensitive Data Exposure** — Unencrypted data, exposed secrets
4. **XML/JSON External Entities** — Malicious payloads
5. **Broken Access Control** — Missing authorization checks
6. **Security Misconfiguration** — Default settings, verbose errors
7. **Cross-Site Scripting (XSS)** — Unescaped user input in HTML
8. **Insecure Deserialization** — Untrusted data in \`JSON.parse()\`
9. **Using Components with Known Vulnerabilities** — Outdated npm packages
10. **Insufficient Logging & Monitoring** — Can't detect breaches

**Essential security packages:**
| Package | Purpose |
|---------|---------|
| \`helmet\` | Sets security HTTP headers (CSP, HSTS, etc.) |
| \`cors\` | Configures Cross-Origin Resource Sharing |
| \`express-rate-limit\` | Rate limiting per IP |
| \`hpp\` | Prevents HTTP Parameter Pollution |
| \`express-mongo-sanitize\` | Prevents NoSQL injection |
| \`xss-clean\` | Sanitizes user input against XSS |
| \`bcryptjs\` | Password hashing |

**Environment variable security:**
- Never commit \`.env\` files — add to \`.gitignore\`
- Use different secrets per environment
- Rotate secrets regularly
- Use a secrets manager (AWS Secrets Manager, Vault) in production

🏠 **Real-world analogy:** Securing a Node.js app is like **securing a building**. You need locks (authentication), key cards per floor (authorization), security cameras (logging), fire doors (input validation), and regular inspections (vulnerability scanning). One weak point compromises everything.`,
      codeExample: `// Security Best Practices — Production Hardening

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// 1. Helmet — Sets 15+ security headers
app.use(helmet());
// Includes: CSP, X-Content-Type-Options, X-Frame-Options, HSTS, etc.

// 2. CORS — Restrict origins
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // Preflight cache (24 hours)
  })
);

// 3. Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});
app.use("/api/", apiLimiter);

// Aggressive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 login attempts per 15 minutes
  message: { error: "Too many login attempts" },
});
app.use("/api/auth/login", authLimiter);

// 4. Body size limit (prevent DoS)
app.use(express.json({ limit: "10kb" }));

// 5. NoSQL injection prevention
function sanitizeInput(req, res, next) {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        // Remove MongoDB operators
        obj[key] = obj[key].replace(/\\$|\\./g, "");
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
}
app.use(sanitizeInput);

// 6. SQL injection prevention (use parameterized queries)
// ❌ VULNERABLE:
// db.query(\`SELECT * FROM users WHERE email = '\${req.body.email}'\`);
// ✅ SAFE:
// db.query("SELECT * FROM users WHERE email = $1", [req.body.email]);

// 7. Password hashing with bcrypt
const bcrypt = require("bcryptjs");

async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12); // Cost factor 12
  return bcrypt.hash(plainPassword, salt);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// 8. HTTP-only cookies for tokens
function setTokenCookie(res, token) {
  res.cookie("accessToken", token, {
    httpOnly: true,    // Can't be accessed by JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // No cross-site requests
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });
}

// 9. Input validation with express-validator
// const { body, validationResult } = require("express-validator");
// app.post("/api/users",
//   body("email").isEmail().normalizeEmail(),
//   body("name").trim().isLength({ min: 2, max: 50 }),
//   body("password").isStrongPassword(),
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     // ... create user
//   }
// );

// 10. Security headers for API responses
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By"); // Don't reveal Express
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cache-Control", "no-store"); // Prevent caching sensitive data
  next();
});

// 11. Graceful error handling (never leak stack traces)
app.use((err, req, res, next) => {
  console.error("Error:", err); // Log full error internally

  // Never send stack traces to clients in production
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

app.listen(3000);`,
      exercise: `**Exercises:**
1. Set up Helmet and configure Content-Security-Policy for your application
2. Implement CORS with a whitelist of allowed origins from environment variables
3. Add rate limiting with different limits for public routes vs auth routes
4. Sanitize all user input against NoSQL injection and XSS attacks
5. Implement secure cookie-based JWT authentication with httpOnly and secure flags
6. Run \`npm audit\` and fix all vulnerabilities — then set up automated vulnerability scanning in CI`,
      commonMistakes: [
        "Trusting client-side validation — always validate on the server; client validation is for UX, server validation is for security",
        "Storing passwords in plain text or with weak hashing (MD5, SHA-1) — use bcrypt with cost factor 10-12",
        "Exposing detailed error messages in production — stack traces and internal errors help attackers; log internally, show generic messages to clients",
        "Not keeping dependencies updated — `npm audit` shows known vulnerabilities; old packages are the #1 attack vector",
        "Using `eval()`, `new Function()`, or `child_process.exec()` with user input — these enable code injection attacks",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the most common security vulnerabilities in Node.js applications?",
          a: "**Top vulnerabilities:** (1) **Injection** — NoSQL injection (`{$gt: ''}` in MongoDB queries), SQL injection, command injection via `exec()`. **Fix:** parameterized queries, input sanitization. (2) **Broken authentication** — weak JWTs, no rate limiting on login. **Fix:** bcrypt, short-lived tokens, rate limiting. (3) **XSS** — unescaped user input in HTML responses. **Fix:** escape output, CSP headers, `helmet`. (4) **Sensitive data exposure** — secrets in code, error stack traces. **Fix:** env vars, secrets manager, generic error messages. (5) **Dependency vulnerabilities** — outdated npm packages. **Fix:** `npm audit`, Snyk, Dependabot.",
        },
        {
          type: "scenario",
          q: "How would you secure a Node.js REST API for production?",
          a: "**Layered security:** (1) **Transport** — HTTPS everywhere, HSTS header. (2) **Headers** — `helmet` for CSP, X-Frame-Options, X-Content-Type-Options. (3) **Authentication** — JWT with short TTL + refresh tokens; bcrypt for passwords. (4) **Authorization** — role-based middleware, principle of least privilege. (5) **Input** — validate with express-validator, sanitize against injection, limit body size. (6) **Rate limiting** — express-rate-limit per IP, aggressive on auth endpoints. (7) **CORS** — whitelist specific origins. (8) **Dependencies** — `npm audit` in CI, Snyk/Dependabot alerts. (9) **Logging** — structured logs with request context (no sensitive data). (10) **Secrets** — env vars or secrets manager, never in code.",
        },
      ],
    },
    {
      id: "oauth-sessions",
      title: "OAuth 2.0 & Session Management",
      explanation: `**OAuth 2.0** enables "Login with Google/GitHub/Facebook" — allowing users to authenticate with third-party providers without sharing passwords. **Sessions** are the traditional alternative to JWTs for maintaining login state.

**OAuth 2.0 Authorization Code Flow (most secure):**
\`\`\`
1. User clicks "Login with Google" → redirect to Google
2. User authorizes your app on Google
3. Google redirects back with an authorization CODE
4. Your server exchanges the CODE for an ACCESS TOKEN (server-to-server)
5. Your server uses the access token to fetch user profile from Google
6. Create/update user in your database
7. Issue your own session/JWT to the user
\`\`\`

**Sessions vs. JWTs:**
| Feature | Sessions | JWT |
|---------|----------|-----|
| State | Server-side (Redis/DB) | Client-side (token) |
| Scalability | Needs shared storage | Stateless |
| Revocation | Easy (delete session) | Hard (blacklist needed) |
| Token size | Small (session ID) | Large (up to 4KB) |
| Best for | SSR web apps | SPAs, APIs, microservices |

**Passport.js** is the most popular authentication middleware for Node.js. It supports 500+ strategies: Local, Google, GitHub, Facebook, Twitter, SAML, OIDC, and more.

🏠 **Real-world analogy:** OAuth is like a **valet parking ticket**. You give the valet (Google) your car (account access), they give your friend (the app) a limited-access ticket (token) that only works for parking (specific permissions), not driving (full account access).`,
      codeExample: `// OAuth 2.0 with Passport.js + Session Management

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: LocalStrategy } = require("passport-local");
// const RedisStore = require("connect-redis").default;
// const redis = require("redis");

const app = express();

// 1. Session configuration
// const redisClient = redis.createClient({ url: process.env.REDIS_URL });
// redisClient.connect();

app.use(
  session({
    // store: new RedisStore({ client: redisClient }), // Production: use Redis
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 2. Serialize/deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id); // Store only ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    // const user = await User.findById(id);
    const user = { id, name: "Alice", email: "alice@example.com" }; // Mock
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// 3. Local strategy (email/password)
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        // const user = await User.findByEmail(email);
        const user = { id: 1, name: "Alice", email, password: "hashed" }; // Mock

        if (!user) return done(null, false, { message: "Invalid credentials" });

        // const isMatch = await bcrypt.compare(password, user.password);
        const isMatch = true; // Mock
        if (!isMatch) return done(null, false, { message: "Invalid credentials" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// 4. Google OAuth 2.0 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "your-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-client-secret",
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        // let user = await User.findOne({ googleId: profile.id });
        // if (!user) {
        //   user = await User.create({
        //     googleId: profile.id,
        //     name: profile.displayName,
        //     email: profile.emails[0].value,
        //     avatar: profile.photos[0].value,
        //   });
        // }
        const user = {
          id: 1,
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
        };
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// 5. Auth routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Local login
app.post("/auth/login", passport.authenticate("local"), (req, res) => {
  res.json({ user: req.user });
});

// Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Logout
app.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// 6. Auth check middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}

// 7. Protected route
app.get("/api/profile", isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000, () => console.log("OAuth server on http://localhost:3000"));`,
      exercise: `**Exercises:**
1. Set up Passport.js with a Local strategy for email/password authentication
2. Add Google OAuth 2.0 login — register an app on Google Cloud Console and implement the flow
3. Configure sessions with Redis as the backing store for multi-server environments
4. Implement "Remember Me" functionality with extended session duration
5. Add CSRF protection for session-based auth using the \`csurf\` or \`csrf-csrf\` package
6. Build a multi-provider login: support Local, Google, and GitHub authentication with linked accounts`,
      commonMistakes: [
        "Storing sessions in memory — this leaks memory and doesn't work with multiple server instances; use Redis or a database",
        "Not setting `httpOnly` and `secure` flags on session cookies — without httpOnly, JavaScript can steal cookies; without secure, cookies can be intercepted",
        "Confusing OAuth access tokens with your own auth tokens — use the OAuth token only to fetch user info, then issue your own JWT/session",
        "Not implementing CSRF protection with sessions — session cookies are sent automatically by browsers, making CSRF attacks possible",
        "Storing the entire user object in the session — only store the user ID; fetch the full user from the database on each request",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the OAuth 2.0 Authorization Code flow and why is it the most secure?",
          a: "**Flow:** (1) App redirects user to provider (Google). (2) User authenticates and grants permission. (3) Provider redirects back with a **one-time authorization code**. (4) App's **backend** exchanges the code for tokens (server-to-server, using client secret). (5) App uses the access token to fetch user profile. **Why most secure:** The authorization code is one-time and short-lived. The access token is never exposed to the browser (exchanged server-side). The client secret never leaves the server. Compare to **Implicit flow** (deprecated) where the token is in the URL fragment, visible in browser history.",
        },
        {
          type: "tricky",
          q: "When would you choose sessions over JWTs and vice versa?",
          a: "**Choose sessions when:** (1) Traditional web app with SSR. (2) Need easy revocation (logout = delete session). (3) Want small cookie size. (4) Have shared session storage (Redis). **Choose JWTs when:** (1) Building a REST API consumed by SPAs or mobile apps. (2) Microservice architecture where services need to verify auth independently. (3) Stateless architecture without shared storage. (4) Short-lived tokens are acceptable. **Hybrid approach:** Use JWTs as access tokens (15min TTL) + server-stored refresh tokens (revocable). This combines the scalability of JWTs with the revocation capability of sessions.",
        },
      ],
    },
  ],
};

export default nodePhase8;
