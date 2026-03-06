const sdPhase2 = {
  id: "phase-2",
  title: "Phase 2: Networking Essentials",
  emoji: "🌐",
  description:
    "Understand how data moves across the internet — DNS, TCP/UDP, HTTP, WebSockets, and CDNs form the networking backbone of every distributed system.",
  topics: [
    {
      id: "sd-dns-and-domain-resolution",
      title: "DNS & Domain Resolution",
      explanation: `**DNS (Domain Name System)** is the internet's phonebook — it translates human-readable domain names (like \`google.com\`) into IP addresses (like \`142.250.80.46\`). Understanding DNS is critical for system design because it's involved in **every single request** your users make.

## How DNS Resolution Works

When a user types \`www.example.com\` in their browser, here's what happens:

1. **Browser cache** → checks if the domain was recently resolved
2. **OS cache** → checks the local DNS resolver cache
3. **Recursive resolver** (ISP's DNS server) → checks its cache
4. **Root nameserver** → directs to the TLD nameserver for \`.com\`
5. **TLD nameserver** → directs to the authoritative nameserver for \`example.com\`
6. **Authoritative nameserver** → returns the actual IP address
7. Result is cached at every level with a **TTL (Time To Live)**

## DNS Record Types

| Record | Purpose | Example |
|--------|---------|---------|
| **A** | Maps domain to IPv4 address | \`example.com → 93.184.216.34\` |
| **AAAA** | Maps domain to IPv6 address | \`example.com → 2606:2800:220:1::248\` |
| **CNAME** | Alias to another domain | \`www.example.com → example.com\` |
| **MX** | Mail server for the domain | \`example.com → mail.example.com\` |
| **NS** | Authoritative nameservers | \`example.com → ns1.example.com\` |
| **TXT** | Verification, SPF records | \`v=spf1 include:_spf.google.com\` |
| **SRV** | Service discovery (host + port) | \`_sip._tcp.example.com\` |

## DNS in System Design

DNS is not just for name resolution — it's a **load balancing** and **traffic routing** tool:

- **Round-robin DNS**: Return multiple A records; clients pick one randomly → basic load distribution
- **Geo-DNS**: Return different IPs based on the client's geographic location → route users to the nearest datacenter
- **Weighted DNS**: Return IPs with different weights → gradual traffic shifting (canary deployments)
- **Failover DNS**: Health-check endpoints; if a server goes down, remove its IP from DNS responses

> **Key insight**: DNS has a TTL cache, so changes don't propagate instantly. This means DNS failover can take minutes (based on TTL), making it unsuitable as the only failover mechanism. Always combine with health-check-based load balancers.`,
      codeExample: `// ============================================
// DNS Concepts — Practical Demonstrations
// ============================================

// ---------- DNS Lookup Simulation ----------

// Simulating the DNS resolution hierarchy
class DNSResolver {
  constructor() {
    // Each cache level has different TTLs
    this.browserCache = new Map();    // TTL: ~1 minute
    this.osCache = new Map();         // TTL: ~5 minutes
    this.recursiveCache = new Map();  // TTL: varies (30s to 24h)

    // Authoritative records (the "truth")
    this.authoritativeRecords = {
      'example.com': {
        A: ['93.184.216.34'],
        AAAA: ['2606:2800:220:1:248:1893:25c8:1946'],
        MX: ['mail.example.com'],
        NS: ['ns1.example.com', 'ns2.example.com'],
        TTL: 3600, // 1 hour
      },
      'api.example.com': {
        // Round-robin: multiple A records for load distribution
        A: ['10.0.1.1', '10.0.1.2', '10.0.1.3', '10.0.1.4'],
        TTL: 60, // Short TTL for faster failover
      },
    };
  }

  resolve(domain, recordType = 'A') {
    const cacheKey = \`\\\${domain}:\\\${recordType}\`;

    // Level 1: Browser cache
    if (this.browserCache.has(cacheKey)) {
      console.log(\`  ✅ Browser cache HIT for \\\${domain}\`);
      return this.browserCache.get(cacheKey);
    }

    // Level 2: OS cache
    if (this.osCache.has(cacheKey)) {
      console.log(\`  ✅ OS cache HIT for \\\${domain}\`);
      const result = this.osCache.get(cacheKey);
      this.browserCache.set(cacheKey, result);
      return result;
    }

    // Level 3: Recursive resolver cache
    if (this.recursiveCache.has(cacheKey)) {
      console.log(\`  ✅ Recursive resolver cache HIT for \\\${domain}\`);
      const result = this.recursiveCache.get(cacheKey);
      this.osCache.set(cacheKey, result);
      this.browserCache.set(cacheKey, result);
      return result;
    }

    // Cache MISS — full resolution needed
    console.log(\`  ❌ Cache MISS — querying authoritative servers for \\\${domain}\`);
    const record = this.authoritativeRecords[domain];
    if (!record || !record[recordType]) {
      throw new Error(\`NXDOMAIN: \\\${domain} not found\`);
    }

    const result = record[recordType];
    // Cache at all levels
    this.recursiveCache.set(cacheKey, result);
    this.osCache.set(cacheKey, result);
    this.browserCache.set(cacheKey, result);
    return result;
  }
}

// ---------- Geo-DNS Load Balancing ----------

class GeoDNS {
  constructor() {
    this.regionMap = {
      'us-east': { ip: '10.1.1.1', datacenter: 'Virginia' },
      'us-west': { ip: '10.2.1.1', datacenter: 'Oregon' },
      'eu-west': { ip: '10.3.1.1', datacenter: 'Ireland' },
      'ap-south': { ip: '10.4.1.1', datacenter: 'Mumbai' },
    };
  }

  resolve(domain, clientRegion) {
    const target = this.regionMap[clientRegion];
    if (!target) {
      // Fallback to nearest region
      return this.regionMap['us-east'];
    }
    console.log(
      \`Routing \\\${domain} from \\\${clientRegion} → \\\${target.datacenter} (\\\${target.ip})\`
    );
    return target;
  }
}

// ---------- DNS-based Health Check & Failover ----------

class HealthCheckDNS {
  constructor(endpoints) {
    this.endpoints = endpoints; // [{ ip, healthy }]
    this.checkInterval = 30000; // Check every 30 seconds
  }

  getHealthyEndpoints() {
    return this.endpoints.filter(ep => ep.healthy).map(ep => ep.ip);
  }

  resolve(domain) {
    const healthy = this.getHealthyEndpoints();
    if (healthy.length === 0) {
      console.error('🚨 ALL endpoints are DOWN!');
      return this.endpoints[0].ip; // Return first as last resort
    }
    // Return only healthy IPs
    console.log(\`Healthy servers for \\\${domain}: \\\${healthy.join(', ')}\`);
    return healthy;
  }

  // Simulate a server going down
  markUnhealthy(ip) {
    const endpoint = this.endpoints.find(ep => ep.ip === ip);
    if (endpoint) {
      endpoint.healthy = false;
      console.log(\`🔴 Server \\\${ip} marked UNHEALTHY\`);
    }
  }
}

// ---------- Demo Usage ----------
const resolver = new DNSResolver();
console.log('First lookup (cache miss):');
console.log('IP:', resolver.resolve('example.com'));
console.log('\\nSecond lookup (cache hit):');
console.log('IP:', resolver.resolve('example.com'));

const geoDns = new GeoDNS();
geoDns.resolve('api.example.com', 'eu-west');
geoDns.resolve('api.example.com', 'ap-south');`,
      exercise: `1. **Trace the Resolution**: Diagram the complete DNS resolution path for \`mail.google.com\`. Label each server (root, TLD, authoritative) and the record type queried at each step.

2. **TTL Impact Analysis**: If \`api.example.com\` has a TTL of 300 seconds and you need to migrate to a new IP, what's the maximum time before all users hit the new server? How would you minimize downtime during migration?

3. **Geo-DNS Design**: Design a Geo-DNS strategy for a service with datacenters in US-East, EU-West, and AP-Southeast. How do you handle users in Africa or South America where you don't have datacenters?

4. **DNS Failover Limitations**: Explain why DNS alone isn't enough for instant failover. What would you combine it with for sub-second failover?

5. **Record Configuration**: You're setting up DNS for a new SaaS product. Configure the following: (a) main website, (b) API subdomain, (c) email delivery via Google Workspace, (d) SSL certificate verification.`,
      commonMistakes: [
        "Relying solely on DNS for failover — DNS has TTL-based caching, so even after you update records, clients may still use the old IP for minutes. Combine DNS with health-check-based load balancers for fast failover.",
        "Setting TTLs too high — a 24-hour TTL means you can't redirect traffic for up to 24 hours during an incident. Use lower TTLs (60-300s) for services that need quick failover, at the cost of more DNS queries.",
        "Forgetting that DNS responses can be cached by intermediate resolvers you don't control — even if you update your authoritative nameserver, ISP resolvers may serve stale data until their cache expires.",
        "Not understanding that CNAME records can't coexist with other records at the zone apex — you can't have a CNAME for 'example.com' alongside an MX record. Use ALIAS or ANAME records instead.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does DNS work in the context of a system design interview? Why should you mention it?",
          a: "DNS is the **first step in every user request**, so it sets up your architecture:\n\n1. **Client types URL** → browser queries DNS\n2. **DNS returns IP** → this IP could be a load balancer, CDN edge, or direct server\n3. In your design, DNS determines **traffic routing**:\n   - **Geo-DNS** routes users to nearest datacenter\n   - **Round-robin DNS** distributes across multiple load balancers\n   - **Weighted DNS** enables canary deployments (send 5% traffic to new version)\n\nMention DNS when discussing:\n- Global traffic distribution\n- Failover strategy\n- CDN integration (CDNs like CloudFront use DNS to route to nearest edge)\n- Service discovery in microservices",
        },
        {
          type: "tricky",
          q: "If DNS is so critical, isn't it a single point of failure?",
          a: "DNS is designed to be **extremely resilient** against single points of failure:\n\n1. **Multiple root servers**: 13 root server clusters, each with hundreds of instances globally via anycast\n2. **Multiple authoritative servers**: Every domain has at least 2 NS records\n3. **Aggressive caching**: DNS responses are cached at every level, so even if authoritative servers go down, cached responses serve users\n4. **Anycast routing**: Root and TLD servers use anycast, meaning the same IP is served from hundreds of physical locations\n\nHowever, DNS **can** be attacked:\n- **DDoS on DNS providers** (Dyn attack in 2016 took down Twitter, Netflix, etc.)\n- Mitigation: Use multiple DNS providers (multi-provider DNS) and keep TTLs reasonable",
        },
      ],
    },
    {
      id: "sd-tcp-udp-protocols",
      title: "TCP vs UDP & Transport Protocols",
      explanation: `At the **transport layer**, two protocols dominate: **TCP** (Transmission Control Protocol) and **UDP** (User Datagram Protocol). Understanding when to use each is crucial for system design, especially for real-time systems, streaming, and gaming.

## TCP vs UDP Comparison

| Feature | TCP | UDP |
|---------|-----|-----|
| **Connection** | Connection-oriented (3-way handshake) | Connectionless |
| **Reliability** | Guaranteed delivery, ordering | No guarantee — packets can be lost |
| **Ordering** | In-order delivery | No ordering |
| **Speed** | Slower (overhead for reliability) | Faster (minimal overhead) |
| **Flow control** | Yes (sliding window) | No |
| **Congestion control** | Yes (slow start, AIMD) | No |
| **Use cases** | Web, Email, File transfer, APIs | Video streaming, Gaming, DNS, VoIP |
| **Header size** | 20-60 bytes | 8 bytes |

## The TCP 3-Way Handshake

Every TCP connection starts with:
1. **SYN**: Client sends "I want to connect" (sequence number X)
2. **SYN-ACK**: Server responds "OK, I acknowledge X+1, my number is Y"
3. **ACK**: Client confirms "I acknowledge Y+1"

This adds **1 round-trip** of latency before any data is sent (called connection establishment overhead).

## When to Use Each

### Use TCP When:
- **Data integrity matters** — file transfers, database queries, API calls
- **Ordering matters** — financial transactions, message delivery
- **You need reliability** — email (SMTP), web pages (HTTP)

### Use UDP When:
- **Speed > reliability** — live video streaming, online gaming
- **Some packet loss is acceptable** — VoIP (a dropped audio frame is better than lag)
- **You need multicast/broadcast** — service discovery, DHCP
- **Small, quick messages** — DNS queries (single packet, no handshake needed)

## Modern Protocols

- **QUIC** (used by HTTP/3): Built on **UDP** but adds TCP-like reliability with lower latency. It eliminates head-of-line blocking and supports connection migration (switching from WiFi to cellular without reconnecting).
- **WebRTC**: Uses UDP for real-time audio/video with custom reliability layers on top.

> **Pro tip**: In interviews, if you're designing a real-time system (chat, gaming, video), mention UDP + application-level reliability. For everything else, TCP (via HTTP) is the default.`,
      codeExample: `// ============================================
// TCP vs UDP — Conceptual Comparison
// ============================================

// ---------- TCP-like Communication (Reliable) ----------

class TCPConnection {
  constructor(destination) {
    this.destination = destination;
    this.sequenceNumber = 0;
    this.ackBuffer = new Map(); // Track sent packets awaiting acknowledgment
    this.receiveBuffer = [];    // Buffer for in-order delivery
    this.connected = false;
    this.retryTimeout = 1000;   // 1 second
    this.maxRetries = 3;
  }

  // 3-way handshake
  async connect() {
    console.log(\`[TCP] Step 1: Sending SYN to \\\${this.destination}\`);
    const synAck = await this.sendAndWait({ type: 'SYN', seq: this.sequenceNumber });

    console.log(\`[TCP] Step 2: Received SYN-ACK (ack=\\\${synAck.ack})\`);
    await this.send({ type: 'ACK', ack: synAck.seq + 1 });

    console.log('[TCP] Step 3: Connection ESTABLISHED');
    this.connected = true;
    this.sequenceNumber = synAck.ack;
  }

  // Reliable send with acknowledgment and retry
  async sendReliable(data) {
    if (!this.connected) throw new Error('Not connected');

    const packet = {
      seq: this.sequenceNumber++,
      data,
      timestamp: Date.now(),
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      console.log(\`[TCP] Sending packet seq=\\\${packet.seq} (attempt \\\${attempt})\`);

      try {
        const ack = await this.sendAndWait(packet);
        console.log(\`[TCP] ✅ Packet seq=\\\${packet.seq} acknowledged\`);
        return ack;
      } catch (e) {
        console.log(\`[TCP] ⏳ Timeout for seq=\\\${packet.seq}, retrying...\`);
        // Exponential backoff
        await this.sleep(this.retryTimeout * attempt);
      }
    }
    throw new Error(\`[TCP] ❌ Failed after \\\${this.maxRetries} retries\`);
  }

  async sendAndWait(packet) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate network — 90% success rate
        if (Math.random() < 0.9) {
          resolve({ ack: packet.seq + 1, seq: Math.floor(Math.random() * 1000) });
        } else {
          reject(new Error('Timeout'));
        }
      }, 100);
    });
  }

  async send(packet) {
    return new Promise(resolve => setTimeout(resolve, 50));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ---------- UDP-like Communication (Fast, Unreliable) ----------

class UDPSocket {
  constructor(destination) {
    this.destination = destination;
    this.packetsSent = 0;
    this.packetsDropped = 0;
  }

  // Fire-and-forget — no handshake, no acknowledgment
  send(data) {
    this.packetsSent++;

    // Simulate 5% packet loss (normal for UDP)
    if (Math.random() < 0.05) {
      this.packetsDropped++;
      console.log(\`[UDP] 📦 Packet #\\\${this.packetsSent} DROPPED (lost in transit)\`);
      return false; // Packet lost — caller doesn't know unless they check
    }

    console.log(\`[UDP] 📦 Packet #\\\${this.packetsSent} delivered to \\\${this.destination}\`);
    return true; // No guarantee the receiver actually got it
  }

  getStats() {
    return {
      sent: this.packetsSent,
      dropped: this.packetsDropped,
      deliveryRate: ((this.packetsSent - this.packetsDropped) / this.packetsSent * 100).toFixed(1) + '%',
    };
  }
}

// ---------- When to Use Which ----------

// ❌ BAD: Using UDP for file transfer (data corruption)
function badFileTransferUDP(file) {
  const udp = new UDPSocket('storage-server');
  for (const chunk of file.chunks) {
    udp.send(chunk); // Some chunks WILL be lost!
  }
  // File arrives corrupted — missing chunks
}

// ✅ GOOD: Using TCP for file transfer (guaranteed delivery)
async function goodFileTransferTCP(file) {
  const tcp = new TCPConnection('storage-server');
  await tcp.connect();
  for (const chunk of file.chunks) {
    await tcp.sendReliable(chunk); // Every chunk verified
  }
  // File arrives complete and in order
}

// ✅ GOOD: Using UDP for live video streaming
function liveVideoStreamUDP(videoFrames) {
  const udp = new UDPSocket('viewer-client');
  for (const frame of videoFrames) {
    udp.send(frame);
    // If a frame is dropped, just show the next one
    // Re-requesting the old frame would cause visible lag
  }
}

// Demo
console.log('--- UDP Streaming Demo ---');
const udp = new UDPSocket('viewer');
for (let i = 0; i < 20; i++) {
  udp.send(\`frame_\\\${i}\`);
}
console.log('Stats:', udp.getStats());`,
      exercise: `1. **Handshake Trace**: Draw the complete TCP 3-way handshake with sequence numbers (SYN seq=100, SYN-ACK, ACK). Then draw a 4-step connection teardown (FIN/ACK).

2. **Protocol Selection**: For each scenario, choose TCP or UDP and explain why: (a) Real-time multiplayer game, (b) Email sending, (c) Live sports scoreboard, (d) File backup to cloud, (e) IoT sensor heartbeat.

3. **Latency Calculation**: A client in London connects to a server in New York (RTT = 80ms). Calculate the minimum time to establish a TCP connection and send the first data byte. Compare with UDP.

4. **QUIC Research**: Research the QUIC protocol (HTTP/3). Explain how it achieves TCP-like reliability over UDP and why it's faster for web browsing.

5. **Head-of-Line Blocking**: Explain the head-of-line blocking problem in TCP and how HTTP/2 multiplexing partially solves it. Why does HTTP/3 (QUIC) solve it completely?`,
      commonMistakes: [
        "Assuming UDP is always faster — UDP is faster for small, independent messages. For large data transfers, TCP's flow control and congestion avoidance can actually be more efficient than naive UDP with application-level retry logic.",
        "Forgetting the TCP handshake latency cost — every new TCP connection adds 1 RTT (round-trip time). For mobile users on high-latency networks (200ms RTT), this means 200ms before any data flows. Use connection pooling or HTTP/2 keep-alive to amortize this cost.",
        "Using TCP for real-time audio/video — a single lost packet in TCP blocks ALL subsequent data (head-of-line blocking). For real-time media, UDP with application-level loss concealment is always better.",
        "Not considering middle devices — firewalls, NATs, and proxies often block or interfere with non-standard UDP traffic. This is why WebRTC has complex ICE/STUN/TURN mechanisms to work around network restrictions.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When designing a real-time chat application, would you use TCP or UDP? Why?",
          a: "For a **text chat** application, I'd use **TCP** (specifically WebSocket over TCP):\n\n1. **Every message must be delivered** — unlike video, you can't skip a chat message\n2. **Messages must arrive in order** — conversation flow depends on ordering\n3. **Message sizes are small** — TCP overhead is negligible for text\n4. **WebSocket** provides persistent bidirectional TCP connections, ideal for real-time chat\n\nHowever, for **voice/video calling** within the same app (like WhatsApp), I'd switch to **UDP** (via WebRTC) because:\n- Dropped audio frames should be skipped, not retransmitted (causes echo/lag)\n- Low latency matters more than perfect delivery for voice\n\n**Hybrid approach**: TCP for text, presence, and control signals; UDP for media streams.",
        },
        {
          type: "tricky",
          q: "HTTP/3 uses QUIC which runs on UDP. Does that mean HTTP/3 is unreliable?",
          a: "No! **QUIC provides TCP-like reliability on top of UDP**. Here's the key:\n\n- **UDP is the transport** — provides the raw packet delivery without handshake overhead\n- **QUIC adds reliability** at the application layer — retransmission, ordering, flow control\n- But unlike TCP, QUIC handles **each stream independently** — if packet 5 of stream A is lost, stream B isn't blocked\n\n**Why not just use TCP?** Two reasons:\n1. **No head-of-line blocking**: TCP blocks ALL data if any packet is lost; QUIC only blocks the affected stream\n2. **Faster connection**: QUIC combines the TLS handshake with the transport handshake → 0-RTT for repeat connections vs 2-3 RTT for TCP + TLS\n\nHTTP/3 is actually **more reliable** than HTTP/2 in practice because it handles packet loss more gracefully.",
        },
      ],
    },
    {
      id: "sd-http-and-https",
      title: "HTTP/HTTPS & Web Communication",
      explanation: `**HTTP (HyperText Transfer Protocol)** is the foundation of web communication. Every API call, webpage load, and REST request uses HTTP. Understanding its versions, methods, status codes, and headers is essential for system design.

## HTTP Versions

| Version | Year | Key Feature | Connection Model |
|---------|------|-------------|-----------------|
| **HTTP/1.0** | 1996 | Basic request-response | New connection per request |
| **HTTP/1.1** | 1997 | Keep-alive, pipelining | Persistent connections |
| **HTTP/2** | 2015 | Multiplexing, server push, header compression | Single connection, multiple streams |
| **HTTP/3** | 2022 | QUIC (UDP-based), 0-RTT | No head-of-line blocking |

## HTTP Methods

| Method | Purpose | Idempotent? | Safe? |
|--------|---------|-------------|-------|
| **GET** | Read a resource | ✅ Yes | ✅ Yes |
| **POST** | Create a resource | ❌ No | ❌ No |
| **PUT** | Replace a resource entirely | ✅ Yes | ❌ No |
| **PATCH** | Partially update a resource | ❌ No | ❌ No |
| **DELETE** | Remove a resource | ✅ Yes | ❌ No |

**Idempotent** means making the same request multiple times produces the same result. This matters for **retries** — you can safely retry a GET or PUT, but retrying a POST might create duplicates.

## Important Status Codes

| Code | Meaning | System Design Context |
|------|---------|----------------------|
| **200** | OK | Successful read/update |
| **201** | Created | Successful resource creation |
| **301** | Moved Permanently | URL redirection (cached by browsers) |
| **302** | Found (Temporary Redirect) | URL shortener redirects |
| **304** | Not Modified | Client cache is still valid |
| **400** | Bad Request | Malformed client input |
| **401** | Unauthorized | Missing/invalid authentication |
| **403** | Forbidden | Valid auth but no permission |
| **404** | Not Found | Resource doesn't exist |
| **429** | Too Many Requests | Rate limiting triggered |
| **500** | Internal Server Error | Server-side bug |
| **502** | Bad Gateway | Upstream server unreachable |
| **503** | Service Unavailable | Server overloaded or in maintenance |
| **504** | Gateway Timeout | Upstream server took too long |

## HTTPS & TLS

**HTTPS = HTTP + TLS encryption**. The TLS handshake:
1. Client sends supported cipher suites
2. Server responds with chosen cipher + SSL certificate
3. Client verifies certificate with Certificate Authority (CA)
4. Both sides derive session keys
5. All subsequent data is encrypted

> **System design impact**: TLS adds 1-2 RTT to connection establishment. Use TLS 1.3 (1 RTT) or session resumption (0 RTT) to minimize latency. **Always use HTTPS** — there's no valid reason not to in production.`,
      codeExample: `// ============================================
// HTTP Communication — Essential Patterns
// ============================================

// ---------- HTTP Methods & Idempotency ----------

// ❌ BAD: Using POST for everything (not idempotent, can't cache)
app.post('/get-users', (req, res) => { /* wrong method for reads */ });
app.post('/delete-user', (req, res) => { /* should use DELETE */ });

// ✅ GOOD: RESTful HTTP methods
app.get('/api/users', async (req, res) => {
  // GET is idempotent and cacheable
  const users = await db.query('SELECT * FROM users LIMIT 100');
  res.set('Cache-Control', 'public, max-age=60');  // Cache for 60 seconds
  res.json({ users });
});

app.post('/api/users', async (req, res) => {
  // POST creates a new resource — NOT idempotent
  const user = await db.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [req.body.name, req.body.email]
  );
  res.status(201).json({ user });  // 201 = Created
});

app.put('/api/users/:id', async (req, res) => {
  // PUT replaces the entire resource — IS idempotent
  // Calling PUT twice with the same data = same result
  await db.query(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [req.body.name, req.body.email, req.params.id]
  );
  res.json({ updated: true });
});

app.delete('/api/users/:id', async (req, res) => {
  // DELETE is idempotent — deleting twice = same state (resource gone)
  await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.status(204).end();  // 204 = No Content
});

// ---------- HTTP Status Codes in Practice ----------

// Rate limiting with 429
const rateLimit = new Map();

function rateLimitMiddleware(req, res, next) {
  const clientIP = req.ip;
  const now = Date.now();

  if (!rateLimit.has(clientIP)) {
    rateLimit.set(clientIP, { count: 1, windowStart: now });
    return next();
  }

  const entry = rateLimit.get(clientIP);
  const windowMs = 60000; // 1-minute window
  const maxRequests = 100;

  if (now - entry.windowStart > windowMs) {
    // Window expired, reset
    rateLimit.set(clientIP, { count: 1, windowStart: now });
    return next();
  }

  if (entry.count >= maxRequests) {
    // ✅ Use 429 with Retry-After header
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    res.set('Retry-After', retryAfter.toString());
    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', '0');
    return res.status(429).json({
      error: 'Too Many Requests',
      retryAfter,
    });
  }

  entry.count++;
  next();
}

// ---------- HTTP/2 Multiplexing Concept ----------

// HTTP/1.1: Browser opens 6 parallel connections to same domain
// Each connection handles ONE request at a time
// └── Connection 1: GET /style.css ──────────────> response
// └── Connection 2: GET /app.js ────────────────> response
// └── Connection 3: GET /image1.jpg ────────────> response
// └── Connection 4: GET /image2.jpg ────────────> response
// └── Connection 5: waiting... (only 6 allowed!)
// └── Connection 6: waiting...

// HTTP/2: Browser opens ONE connection
// Multiple requests/responses interleaved on the same connection
// └── Single Connection:
//     Stream 1: GET /style.css ──> response (interleaved)
//     Stream 2: GET /app.js ────> response (interleaved)
//     Stream 3: GET /image1.jpg > response (interleaved)
//     Stream 4: GET /image2.jpg > response (interleaved)
//     Stream 5: GET /api/data ──> response (interleaved)
//     ... unlimited streams!

// ---------- Caching Headers ----------

function serveCacheableResource(req, res) {
  // ✅ Proper cache headers for static assets
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
    'ETag': 'W/"abc123"',                                    // Weak ETag
    'Last-Modified': 'Tue, 15 Jan 2024 10:30:00 GMT',
    'Vary': 'Accept-Encoding',                               // Cache varies by compression
  });
  res.sendFile('/static/bundle.hash123.js');
}

function serveAPIResponse(req, res) {
  // ✅ API responses: short cache, must revalidate
  res.set({
    'Cache-Control': 'private, max-age=0, must-revalidate',
    'ETag': \`W/"\\\${computeHash(data)}"\`,
  });
  res.json(data);
}

console.log("HTTP examples configured correctly!");`,
      exercise: `1. **Status Code Quiz**: For each scenario, provide the correct HTTP status code: (a) User not logged in, (b) User logged in but doesn't own the resource, (c) Request body is missing required fields, (d) Server is overloaded, (e) API version has been removed.

2. **Caching Strategy**: Design the cache-control headers for: (a) a static JS bundle with a hash in the filename, (b) a user profile API response, (c) a public blog post page, (d) an admin dashboard.

3. **HTTP/2 Benefits**: List 5 specific ways HTTP/2 improves performance over HTTP/1.1. For each, explain the underlying mechanism.

4. **Retry Logic**: Design a retry strategy for an API client that handles: (a) 429 with Retry-After header, (b) 500 errors, (c) 503 errors, (d) network timeouts. Include exponential backoff with jitter.

5. **HTTPS Overhead**: Calculate the additional latency of HTTPS over HTTP for a client with 100ms RTT to the server, comparing TLS 1.2 (2 RTT handshake) vs TLS 1.3 (1 RTT handshake). How much does session resumption save?`,
      commonMistakes: [
        "Using POST for read operations — POST requests can't be cached by browsers or CDNs, and aren't idempotent. Use GET for reads to take advantage of HTTP caching.",
        "Returning 200 with an error body instead of proper status codes — '{ status: 200, error: true, message: \"Not Found\" }' prevents clients, load balancers, and monitoring tools from understanding the response correctly.",
        "Not setting proper Cache-Control headers — without cache headers, browsers and CDNs use heuristic caching which can serve stale data unexpectedly. Always set explicit cache directives.",
        "Ignoring idempotency in retry logic — retrying a failed POST /charge-payment could charge the user twice. Use idempotency keys (unique request IDs) to make non-idempotent operations safe to retry.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What's the difference between HTTP/1.1, HTTP/2, and HTTP/3? Why does it matter for system design?",
          a: "**HTTP/1.1**: One request at a time per connection. Browsers open 6 parallel connections per domain. Head-of-line blocking — slow response blocks the connection.\n\n**HTTP/2**: Multiplexing over a single TCP connection — multiple requests and responses interleaved. Plus header compression (HPACK) and server push. But still has TCP-level head-of-line blocking (one lost packet blocks all streams).\n\n**HTTP/3**: Uses QUIC (over UDP) — eliminates TCP head-of-line blocking because each stream is independent. 0-RTT connection re-establishment. Connection migration (switch networks without disconnecting).\n\n**System design impact**: For latency-sensitive global services, HTTP/3 provides measurably better user experience. For internal service-to-service calls (low latency, reliable network), HTTP/2 or gRPC is usually sufficient.",
        },
        {
          type: "scenario",
          q: "Your API receives duplicate POST requests due to client retries. How do you prevent processing the same request twice?",
          a: "Use **idempotency keys**:\n\n1. Client generates a unique ID (UUID) for each logical request\n2. Client sends it as a header: `Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000`\n3. Server checks if this key was already processed:\n   - **If yes**: Return the cached response without re-processing\n   - **If no**: Process the request and store the result keyed by the idempotency key\n4. Store idempotency records with a TTL (e.g., 24 hours)\n\n**Implementation**: Use Redis with `SET key value NX EX 86400` (set if not exists, expire in 24h). The value stores the response.\n\nStripe uses this exact pattern for payment APIs — every charge request requires an idempotency key.",
        },
      ],
    },
    {
      id: "sd-websockets-and-realtime",
      title: "WebSockets & Real-Time Communication",
      explanation: `**WebSockets** provide **full-duplex, persistent communication** between a client and server over a single TCP connection. Unlike HTTP's request-response model, WebSockets allow either side to send messages at any time — making them essential for real-time applications.

## HTTP vs WebSocket

| Feature | HTTP | WebSocket |
|---------|------|-----------|
| **Communication** | Request → Response (client-initiated) | Bidirectional (either side) |
| **Connection** | New connection per request (or keep-alive) | Persistent, long-lived |
| **Overhead** | Headers on every request (~800 bytes) | 2-14 bytes per frame after handshake |
| **Use case** | REST APIs, page loads | Chat, gaming, live updates |
| **Scaling** | Stateless, easy to scale | Stateful connections, harder to scale |

## The WebSocket Handshake

WebSocket starts as an HTTP request that **upgrades** to a WebSocket:

1. Client sends HTTP request with \`Upgrade: websocket\` header
2. Server responds with \`101 Switching Protocols\`
3. Connection upgrades from HTTP to WebSocket
4. Both sides can now send messages freely

## Real-Time Alternatives

| Technique | Direction | Latency | Complexity | Best For |
|-----------|-----------|---------|------------|----------|
| **Polling** | Client → Server (repeated) | High (interval-based) | Low | Simple dashboards |
| **Long Polling** | Client → Server (held open) | Medium | Medium | Notifications |
| **SSE** (Server-Sent Events) | Server → Client only | Low | Low | Live feeds, stock prices |
| **WebSocket** | Bidirectional | Very Low | High | Chat, gaming, collaboration |

## Scaling WebSocket Connections

The biggest challenge with WebSockets is **scaling**. Since connections are persistent and stateful:

- Each server can hold ~50K-500K concurrent WebSocket connections (limited by memory and file descriptors)
- You need a **pub/sub layer** (Redis, Kafka) so that if User A is connected to Server 1 and User B is connected to Server 2, messages between them are routed correctly
- **Sticky sessions** or a connection registry is needed so clients reconnect to the right server
- **Connection draining** is needed during deployments — gracefully close old connections and let clients reconnect

> **Pro tip**: If you only need server-to-client updates (one-way), use **Server-Sent Events (SSE)** instead of WebSockets — they're simpler, work over standard HTTP, and auto-reconnect.`,
      codeExample: `// ============================================
// WebSocket & Real-Time Communication Patterns
// ============================================

// ---------- Pattern 1: Simple WebSocket Server ----------

const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Track all connected clients
const clients = new Map(); // userId → WebSocket connection

wss.on('connection', (ws, req) => {
  const userId = req.url.split('?userId=')[1];
  clients.set(userId, ws);
  console.log(\`User \\\${userId} connected. Total: \\\${clients.size}\`);

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    handleMessage(userId, message);
  });

  ws.on('close', () => {
    clients.delete(userId);
    console.log(\`User \\\${userId} disconnected. Total: \\\${clients.size}\`);
  });

  // Send heartbeat every 30 seconds to detect dead connections
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
});

function handleMessage(senderId, message) {
  switch (message.type) {
    case 'direct_message':
      // Send to specific user
      const recipientWs = clients.get(message.recipientId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({
          type: 'new_message',
          from: senderId,
          content: message.content,
          timestamp: Date.now(),
        }));
      }
      break;

    case 'broadcast':
      // Send to all connected users
      clients.forEach((ws, id) => {
        if (id !== senderId && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'broadcast',
            from: senderId,
            content: message.content,
          }));
        }
      });
      break;
  }
}

// ---------- Pattern 2: Scaling with Pub/Sub (Redis) ----------

// ❌ BAD: Single-server WebSocket — doesn't scale
// When you have 2+ servers behind a load balancer,
// User A on Server 1 can't send to User B on Server 2

// ✅ GOOD: Redis Pub/Sub for cross-server messaging
const Redis = require('ioredis');
const pub = new Redis();  // Publisher
const sub = new Redis();  // Subscriber

// Each server subscribes to a channel
sub.subscribe('chat-messages');

sub.on('message', (channel, data) => {
  const message = JSON.parse(data);
  // Deliver to local clients connected to THIS server
  const recipientWs = clients.get(message.recipientId);
  if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
    recipientWs.send(JSON.stringify(message));
  }
});

// When a user sends a message, publish to Redis (all servers receive it)
function handleMessageScalable(senderId, message) {
  pub.publish('chat-messages', JSON.stringify({
    type: 'new_message',
    from: senderId,
    recipientId: message.recipientId,
    content: message.content,
    timestamp: Date.now(),
    sourceServer: process.env.SERVER_ID, // Track which server sent it
  }));
}

// ---------- Pattern 3: Server-Sent Events (SSE) — Simpler Alternative ----------

// SSE is one-way (server → client), uses standard HTTP, auto-reconnects
const express = require('express');
const sseApp = express();

sseApp.get('/api/events', (req, res) => {
  // Set SSE headers
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send a comment to prevent proxy timeout
  res.write(':keep-alive\\n\\n');

  // Send events as they happen
  const sendEvent = (eventType, data) => {
    res.write(\`event: \\\${eventType}\\n\`);
    res.write(\`data: \\\${JSON.stringify(data)}\\n\\n\`);
  };

  // Example: Send stock price updates every second
  const interval = setInterval(() => {
    sendEvent('price-update', {
      symbol: 'AAPL',
      price: (150 + Math.random() * 10).toFixed(2),
      timestamp: Date.now(),
    });
  }, 1000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(interval);
    console.log('SSE client disconnected');
  });
});

// Client-side SSE (in browser):
// const eventSource = new EventSource('/api/events');
// eventSource.addEventListener('price-update', (event) => {
//   const data = JSON.parse(event.data);
//   updateUI(data);
// });

server.listen(8080, () => console.log('WebSocket server on port 8080'));`,
      exercise: `1. **Choose the Right Tool**: For each scenario, decide between polling, long polling, SSE, or WebSocket. Justify your choice: (a) Stock ticker dashboard, (b) Multiplayer game, (c) Email inbox notifications, (d) Collaborative document editing, (e) Social media live comment stream.

2. **Scale WebSockets**: Design a system where 1 million users can simultaneously participate in a live chat during a sports event. How many WebSocket servers do you need? How do messages route between servers?

3. **Heartbeat Design**: Implement a WebSocket heartbeat mechanism where: (a) server pings every 30s, (b) client must respond within 5s, (c) 3 missed pongs = connection considered dead, (d) client auto-reconnects with exponential backoff.

4. **SSE vs WebSocket Trade-off**: You're building a live sports score app. Write a pros/cons comparison for SSE vs WebSocket. Which would you choose and why?

5. **Connection Recovery**: Design a reconnection strategy for a chat application where the user loses WiFi for 30 seconds. How do you ensure no messages are lost? What about message ordering?`,
      commonMistakes: [
        "Using WebSockets when SSE or polling would suffice — WebSockets add significant complexity (connection management, scaling, heartbeats). If you only need server → client updates, use SSE. If updates are infrequent, use polling.",
        "Not implementing heartbeats — without heartbeats, half-open connections (where the client has disconnected but the server doesn't know) accumulate and waste server resources. Always ping/pong.",
        "Forgetting about reconnection logic — networks are unreliable. Clients MUST implement auto-reconnect with exponential backoff. Without it, a brief network blip permanently disconnects users.",
        "Trying to scale WebSockets without a pub/sub layer — with multiple servers behind a load balancer, messages between users on different servers will be lost unless you add Redis Pub/Sub or a similar message routing layer.",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "You're designing a notification system for a social media app with 100M users. Would you use WebSockets, SSE, or push notifications?",
          a: "I'd use a **hybrid approach**:\n\n1. **Mobile**: **Push notifications** (APNs for iOS, FCM for Android) — they work even when the app is closed, are battery-efficient, and are the standard for mobile\n2. **Web (active tab)**: **SSE** — notifications are server-to-client only, SSE auto-reconnects, works over standard HTTP (easier to scale behind CDNs)\n3. **Web (background tab)**: **Web Push API** — sends notifications even when the tab isn't active\n\n**Why not WebSockets?**\n- Notifications are **one-way** (server → client) — WebSocket's bidirectional capability is unnecessary\n- SSE requires less infrastructure (no WebSocket server, works with standard HTTP load balancers)\n- Push notifications work when the app is closed — WebSockets require an active connection\n\n**Architecture**: Application servers publish events to Kafka → Notification service consumes and routes to the appropriate channel (push, SSE, email) based on user preferences and device state.",
        },
        {
          type: "tricky",
          q: "What happens to WebSocket connections during a server deployment (rolling update)?",
          a: "This is a real operational challenge:\n\n1. **Without handling**: All connections on the updating server are killed instantly → users experience disconnection and potential message loss\n\n2. **Proper approach — Connection Draining**:\n   - Mark the server as 'draining' — stop accepting new connections\n   - Send a 'reconnect' message to all connected clients\n   - Wait for clients to gracefully disconnect (with a timeout, e.g., 30s)\n   - Kill remaining connections and shut down the server\n   - Client reconnects to a new server via the load balancer\n\n3. **Client-side requirements**:\n   - Auto-reconnect with exponential backoff\n   - Message queue: buffer outgoing messages during reconnection\n   - Request missed messages after reconnect (using a 'since' timestamp or sequence number)\n\n4. **Infrastructure**: Use a connection registry (Redis) so the load balancer knows which servers have capacity for new connections.",
        },
      ],
    },
  ],
};

export default sdPhase2;
