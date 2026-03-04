const nodePhase5 = {
  id: "phase-5",
  title: "Phase 5: HTTP & Web Servers",
  emoji: "🌐",
  description:
    "Build HTTP servers from scratch using Node.js's built-in http module — understand request/response lifecycle, routing, headers, and status codes.",
  topics: [
    {
      id: "http-module-basics",
      title: "The http Module & Creating Servers",
      explanation: `The **\`http\` module** is Node.js's built-in module for creating HTTP servers and making HTTP requests. Every web framework (Express, Koa, Fastify) is built on top of it.

**Creating a basic server:**
\`\`\`javascript
const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello, World!');
});
server.listen(3000);
\`\`\`

**The request/response lifecycle:**
1. Client sends an HTTP request (method, URL, headers, body)
2. Node.js's \`http.Server\` emits a \`'request'\` event
3. Your callback receives \`req\` (IncomingMessage) and \`res\` (ServerResponse)
4. You read from \`req\` (request data) and write to \`res\` (response data)
5. Call \`res.end()\` to finish the response

**\`req\` (IncomingMessage) — what the client sent:**
- \`req.method\` — GET, POST, PUT, DELETE, PATCH
- \`req.url\` — The request URL path (\`/users?page=2\`)
- \`req.headers\` — Request headers (lowercase keys)
- \`req\` is a Readable stream — body data arrives in chunks

**\`res\` (ServerResponse) — what you send back:**
- \`res.statusCode = 200\` — Set HTTP status code
- \`res.setHeader(name, value)\` — Set response headers
- \`res.writeHead(statusCode, headers)\` — Set status + headers at once
- \`res.write(data)\` — Send response body (can call multiple times)
- \`res.end(data)\` — End the response (required!)

**HTTP status codes to know:**
| Code | Meaning | When to use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 301 | Moved Permanently | URL changed permanently |
| 400 | Bad Request | Invalid client request |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Authenticated but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side bug |

🏠 **Real-world analogy:** An HTTP server is like a **restaurant**. The customer (client) sends an order (request) to the kitchen (server). The kitchen reads the order (req), prepares the food (processing), and delivers the plate (res). \`res.end()\` is putting the plate on the table — the order is complete.`,
      codeExample: `// HTTP Server — Built from scratch

const http = require("http");
const url = require("url");

// 1. Basic HTTP server
const server = http.createServer((req, res) => {
  // Parse URL and query parameters
  const parsedUrl = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = parsedUrl.pathname;
  const query = Object.fromEntries(parsedUrl.searchParams);

  // Log request
  console.log(\`[\${req.method}] \${pathname}\`, query);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Simple router
  if (pathname === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Welcome to the API", version: "1.0" }));
  } else if (pathname === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", uptime: process.uptime() }));
  } else if (pathname === "/users" && req.method === "GET") {
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    // Support pagination via query params
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: users, page, limit }));
  } else if (pathname === "/users" && req.method === "POST") {
    // Read request body (it's a stream!)
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Prevent large payloads (DoS protection)
      if (body.length > 1e6) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const user = JSON.parse(body);
        // Validate
        if (!user.name) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Name is required" }));
          return;
        }
        // Create user (mock)
        const newUser = { id: Date.now(), ...user };
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newUser));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    // 404 Not Found
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

// 2. Error handling
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(\`Port \${err.port} is already in use\`);
  } else {
    console.error("Server error:", err);
  }
});

// 3. Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});

// 4. Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});`,
      exercise: `**Exercises:**
1. Build a complete HTTP server with GET, POST, PUT, DELETE routes for a "todos" resource
2. Add query parameter parsing for pagination (\`?page=2&limit=10\`)
3. Implement request body parsing for JSON and URL-encoded form data
4. Add request logging middleware that logs method, URL, status code, and response time
5. Serve static files (HTML, CSS, JS) from a \`public/\` directory with proper MIME types
6. Implement rate limiting — max 100 requests per minute per IP address`,
      commonMistakes: [
        "Forgetting to call `res.end()` — the client hangs forever waiting for a response, eventually timing out",
        "Setting headers after `res.write()` or `res.end()` — headers must be set before sending body; Node.js throws 'ERR_HTTP_HEADERS_SENT'",
        "Not handling the request body as a stream — `req.body` doesn't exist by default; you must listen for `data` and `end` events to collect the body",
        "Not setting `Content-Type` headers — browsers and API clients may misinterpret the response without proper content type",
        "Using `http.createServer()` for production without a reverse proxy — always put nginx or a load balancer in front for SSL, compression, and safety",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Node.js handle HTTP requests internally?",
          a: "When `http.createServer()` is called, Node.js creates a TCP server using libuv. For each incoming TCP connection, the HTTP parser (`llhttp`, written in C) parses the raw bytes into structured HTTP data (method, URL, headers). Once headers are parsed, a `'request'` event is emitted with `req` (IncomingMessage, a Readable stream) and `res` (ServerResponse, a Writable stream). The request body arrives as chunks via `req`'s `'data'` events. You write the response with `res.write()`/`res.end()`, which serializes the HTTP response and writes to the TCP socket. The event loop handles all of this non-blockingly, so a single Node.js process can handle thousands of concurrent connections.",
        },
        {
          type: "tricky",
          q: "Why doesn't `req.body` exist in vanilla Node.js HTTP servers?",
          a: "Because the request body is a **stream**, not a pre-parsed object. HTTP request bodies can be any size (a JSON string, a 2GB file upload, a continuous WebSocket stream). Node.js can't know the content type, character encoding, or maximum size in advance. Buffering the entire body would defeat Node.js's streaming architecture. You must manually listen for `'data'` events to collect chunks and `'end'` to know when the body is complete, then parse based on `Content-Type`. Frameworks like Express add `req.body` via middleware (`express.json()`) that does this parsing automatically.",
        },
      ],
    },
    {
      id: "http-client-requests",
      title: "Making HTTP Requests (Client-Side)",
      explanation: `Node.js can act as both an HTTP **server** and **client**. Making outbound HTTP requests is essential for calling APIs, microservice communication, and web scraping.

**Built-in options:**
| Method | Node.js Version | Style |
|--------|----------------|-------|
| \`http.request()\` / \`https.request()\` | All | Callback + streams |
| \`fetch()\` | 18+ (stable in 21+) | Promise-based (Web standard) |

**Third-party libraries:**
| Library | Pros | Use Case |
|---------|------|----------|
| \`axios\` | Feature-rich, interceptors, auto-transform | Most popular choice |
| \`node-fetch\` | Lightweight fetch polyfill | Minimal projects |
| \`got\` | Retry, pagination, hooks | Advanced use cases |
| \`undici\` | Fastest, powers Node.js fetch | Performance-critical |

**\`fetch()\` in Node.js 18+:**
Node.js now includes the standard \`fetch()\` API, powered by the \`undici\` HTTP client. It works exactly like browser fetch — this is the recommended approach for new projects.

**Best practices for HTTP clients:**
1. **Set timeouts** — Never make a request without a timeout
2. **Handle errors** — Network errors, timeouts, non-2xx responses
3. **Retry with backoff** — For transient failures (5xx, network errors)
4. **Use AbortController** — Cancel requests that are no longer needed
5. **Connection pooling** — Reuse TCP connections for repeated calls to the same host

🏠 **Real-world analogy:** If your HTTP server is a restaurant kitchen, the HTTP client is like a **delivery driver** — it goes out to other restaurants (APIs) to pick up ingredients (data) and bring them back.`,
      codeExample: `// HTTP Client — Making Requests from Node.js

// 1. Built-in fetch (Node.js 18+)
async function fetchExample() {
  // GET request
  const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
  
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }
  
  const user = await response.json();
  console.log("User:", user.name);

  // POST request
  const newPost = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "My Post",
      body: "Hello from Node.js",
      userId: 1,
    }),
  });
  
  const created = await newPost.json();
  console.log("Created post:", created);
}

// 2. Fetch with timeout using AbortController
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(\`Request to \${url} timed out after \${timeoutMs}ms\`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// 3. Retry with exponential backoff
async function fetchWithRetry(url, options = {}) {
  const { maxRetries = 3, baseDelay = 1000, ...fetchOptions } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (response.status >= 500) {
        throw new Error(\`Server error: \${response.status}\`);
      }
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }

      return await response.json();
    } catch (err) {
      if (attempt === maxRetries) throw err;

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(\`Attempt \${attempt} failed, retrying in \${delay}ms...\`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// 4. Parallel API calls
async function fetchDashboardData() {
  const [users, posts, comments] = await Promise.all([
    fetch("https://jsonplaceholder.typicode.com/users").then((r) => r.json()),
    fetch("https://jsonplaceholder.typicode.com/posts").then((r) => r.json()),
    fetch("https://jsonplaceholder.typicode.com/comments").then((r) => r.json()),
  ]);

  return {
    totalUsers: users.length,
    totalPosts: posts.length,
    totalComments: comments.length,
  };
}

// 5. Built-in http module (lower level)
const https = require("https");

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    }).on("error", reject);
  });
}

// 6. API client wrapper with base URL and auth
class APIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    this.timeout = options.timeout || 10000;
  }

  async request(method, path, body = null) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(\`\${this.baseURL}\${path}\`, {
        method,
        headers: this.defaultHeaders,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(\`\${method} \${path} failed: \${response.status} - \${error}\`);
      }

      return response.status === 204 ? null : await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  get(path) { return this.request("GET", path); }
  post(path, body) { return this.request("POST", path, body); }
  put(path, body) { return this.request("PUT", path, body); }
  delete(path) { return this.request("DELETE", path); }
}

// Usage
// const api = new APIClient("https://api.example.com", {
//   headers: { Authorization: "Bearer token123" },
//   timeout: 5000,
// });
// const users = await api.get("/users");
// const newUser = await api.post("/users", { name: "Alice" });`,
      exercise: `**Exercises:**
1. Build an API client wrapper with base URL, default headers, and timeout support
2. Implement \`fetchWithRetry()\` with exponential backoff and configurable max retries
3. Use \`Promise.all()\` to call 3 APIs in parallel and merge the results
4. Create a simple web scraper that fetches a URL and extracts all links from the HTML
5. Implement request caching — cache GET responses for 5 minutes, bypass for POST/PUT
6. Build a proxy server that forwards requests to an upstream API and adds authentication headers`,
      commonMistakes: [
        "Not setting timeouts on outbound requests — a hanging upstream service can exhaust your connection pool and freeze your entire application",
        "Not checking `response.ok` after fetch — fetch resolves for 4xx and 5xx responses; only network failures reject the Promise",
        "Making sequential API calls when they could run in parallel — use `Promise.all()` for independent requests",
        "Hardcoding API URLs — use environment variables for base URLs so they can change between development, staging, and production",
        "Not handling AbortController cleanup — always clear the timeout in a `finally` block to prevent memory leaks",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does the built-in `fetch()` in Node.js 18+ differ from browser fetch?",
          a: "Node.js's `fetch()` is powered by the **undici** HTTP client (written in C/C++) and follows the same WHATWG Fetch Standard as browsers. **Differences:** (1) No CORS restrictions — Node.js doesn't enforce same-origin policy. (2) No cookie jar by default — cookies aren't automatically sent/stored. (3) HTTP/1.1 by default (undici supports HTTP/2 separately). (4) No referrer/referrer-policy. (5) `AbortController` works identically. **Advantages over `http.request()`:** cleaner Promise-based API, automatic response decompression, simpler body handling with `.json()`, `.text()`, `.arrayBuffer()`.",
        },
        {
          type: "scenario",
          q: "How would you implement resilient HTTP calls in a microservice architecture?",
          a: "**Defense-in-depth strategy:** (1) **Timeouts** — set aggressive timeouts (2-5s for user-facing, 30s for background jobs). (2) **Retries with backoff** — retry on 5xx and network errors with exponential backoff (1s, 2s, 4s). (3) **Circuit breaker** — after N consecutive failures, stop calling the service for a cooldown period; return cached data or a fallback. (4) **Bulkhead** — limit concurrent outbound requests per service to prevent connection pool exhaustion. (5) **Fallbacks** — return cached data, default values, or degraded responses when upstream is down. (6) **Health checks** — actively probe dependent services and route around unhealthy ones.",
        },
      ],
    },
    {
      id: "serving-static-files",
      title: "Serving Static Files & HTTPS",
      explanation: `Serving static files (HTML, CSS, JS, images) and enabling HTTPS are fundamental skills for building production web servers.

**Static file serving:**
The raw \`http\` module doesn't have built-in static file serving — you must implement it manually by reading files and setting appropriate MIME types.

**MIME types matter:**
Browsers use the \`Content-Type\` header to determine how to handle a response. Sending an HTML file with \`text/plain\` renders it as text, not a page.

| Extension | MIME Type |
|-----------|-----------|
| \`.html\` | \`text/html\` |
| \`.css\` | \`text/css\` |
| \`.js\` | \`application/javascript\` |
| \`.json\` | \`application/json\` |
| \`.png\` | \`image/png\` |
| \`.jpg\` | \`image/jpeg\` |
| \`.svg\` | \`image/svg+xml\` |
| \`.pdf\` | \`application/pdf\` |
| \`.woff2\` | \`font/woff2\` |

**HTTPS:**
Production servers require HTTPS. Node.js provides the \`https\` module which works identically to \`http\` but requires an SSL/TLS certificate.

**Security headers:**
Every production server should include security headers:
- \`Content-Security-Policy\` — Prevent XSS attacks
- \`X-Content-Type-Options: nosniff\` — Prevent MIME-type sniffing
- \`X-Frame-Options: DENY\` — Prevent clickjacking
- \`Strict-Transport-Security\` — Enforce HTTPS

🏠 **Real-world analogy:** Serving static files is like a **library** (the building). Books (files) are organized on shelves (directories), and each book has a classification (MIME type). HTTPS is like having a **locked door** and **security guard** — visitors can still read the books, but the communication is private.`,
      codeExample: `// Static File Server & HTTPS

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// 1. MIME type mapping
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
  ".webp": "image/webp",
};

// 2. Static file server with security
function createStaticServer(publicDir) {
  return http.createServer(async (req, res) => {
    // Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Only serve GET/HEAD requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end("Method Not Allowed");
      return;
    }

    // Parse URL and prevent directory traversal
    let filePath = path.join(publicDir, decodeURIComponent(req.url));
    
    // ✅ Security: Prevent path traversal attacks
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      const stats = await fs.promises.stat(filePath);

      // Serve index.html for directories
      if (stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      // Get MIME type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      // Caching headers
      const isAsset = [".css", ".js", ".png", ".jpg", ".woff2"].includes(ext);
      if (isAsset) {
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
      } else {
        res.setHeader("Cache-Control", "no-cache");
      }

      // Stream the file (memory efficient for large files)
      res.writeHead(200, { "Content-Type": contentType });
      
      if (req.method === "HEAD") {
        res.end();
        return;
      }

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on("error", () => {
        res.writeHead(500);
        res.end("Internal Server Error");
      });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 — Not Found</h1>");
      } else {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    }
  });
}

// 3. HTTPS server
function createHTTPSServer() {
  const options = {
    key: fs.readFileSync("certs/private-key.pem"),
    cert: fs.readFileSync("certs/certificate.pem"),
    // For production, also include CA chain:
    // ca: fs.readFileSync("certs/ca-chain.pem"),
  };

  const server = https.createServer(options, (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Secure connection established!");
  });

  server.listen(443, () => {
    console.log("HTTPS server running on port 443");
  });
}

// 4. HTTP → HTTPS redirect
function createRedirectServer() {
  http
    .createServer((req, res) => {
      res.writeHead(301, {
        Location: \`https://\${req.headers.host}\${req.url}\`,
      });
      res.end();
    })
    .listen(80, () => {
      console.log("HTTP redirect server on port 80");
    });
}

// 5. Start static server
const PUBLIC_DIR = path.resolve(__dirname, "public");
const server = createStaticServer(PUBLIC_DIR);
server.listen(3000, () => {
  console.log(\`Static server: http://localhost:3000 (serving \${PUBLIC_DIR})\`);
});`,
      exercise: `**Exercises:**
1. Build a static file server that serves files from a \`public/\` directory with proper MIME types
2. Add path traversal protection — ensure requests can't escape the public directory
3. Implement ETag-based caching for static assets
4. Create self-signed SSL certificates and start an HTTPS server
5. Build an HTTP → HTTPS redirect server
6. Add gzip compression for text-based responses (HTML, CSS, JS, JSON)`,
      commonMistakes: [
        "Not preventing path traversal attacks — `../../etc/passwd` in the URL can expose system files; always validate that the resolved path is within the public directory",
        "Using wrong or missing MIME types — serving JavaScript with `text/plain` causes browsers to reject it; always map file extensions to correct content types",
        "Loading entire files into memory before sending — use `createReadStream().pipe(res)` for efficient streaming, especially for large files",
        "Not implementing HTTPS in production — all modern applications require HTTPS; use Let's Encrypt for free certificates",
        "Serving user-uploaded files from the same origin — this enables XSS attacks; use a separate domain or CDN for user content",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "How would you build a production-ready static file server in Node.js?",
          a: "**Key components:** (1) **Path resolution** with directory traversal protection — `path.resolve()` and verify the result stays within the public directory. (2) **MIME type detection** — map extensions to content types. (3) **Streaming** — use `createReadStream().pipe(res)` for memory efficiency. (4) **Caching** — set `Cache-Control` headers (long TTL for hashed assets, no-cache for HTML). (5) **Compression** — gzip/brotli for text responses. (6) **Security headers** — CSP, X-Frame-Options, HSTS. (7) **HTTPS** — required for production. (8) **In practice:** use nginx or a CDN for static files in production — Node.js should focus on dynamic content.",
        },
        {
          type: "tricky",
          q: "What is a path traversal attack and how do you prevent it?",
          a: "A path traversal attack uses `../` sequences in URLs (e.g., `GET /../../etc/passwd`) to access files outside the intended directory. **Prevention:** (1) Resolve the full path with `path.resolve(publicDir, requestedPath)`. (2) Check that the resolved path **starts with** the public directory: `if (!resolvedPath.startsWith(publicDir)) return 403`. (3) Decode URL-encoded characters first (`%2e%2e%2f` = `../`). (4) Never use `req.url` directly in file paths without validation.",
        },
      ],
    },
  ],
};

export default nodePhase5;
