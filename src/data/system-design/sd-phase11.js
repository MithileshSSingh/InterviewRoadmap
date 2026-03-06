const sdPhase11 = {
  id: "phase-11",
  title: "Phase 11: Real-World System Designs (Part 1)",
  emoji: "🌍",
  description:
    "Apply everything you've learned to design real systems — URL shortener, Twitter/social feed, chat system, and notification service. Each follows a structured interview approach.",
  topics: [
    {
      id: "sd-design-url-shortener",
      title: "Design a URL Shortener (TinyURL/Bit.ly)",
      explanation: `A URL shortener converts long URLs into short, shareable links. This is a classic system design interview question that tests fundamentals.

## Requirements

**Functional**: Create short URL from long URL, redirect short URL to original, custom aliases (optional), link expiration, analytics (click count, geo)

**Non-Functional**: Very low latency for redirects (< 50ms), high availability (links must always work), 100M URLs created/month, 10:1 read:write ratio (1B redirects/month)

## Back-of-Envelope Estimation
- 100M new URLs/month ≈ 40 URLs/sec (write)
- 1B redirects/month ≈ 400 redirects/sec (read)
- Storage per URL: ~500 bytes → 100M × 500B = 50GB/month → 6TB over 10 years
- Short URL length: 62^7 = 3.5 trillion combinations (base62: a-z, A-Z, 0-9)

## High-Level Design
\`\`\`
Client → API Gateway → URL Service → Database (write)
Client → CDN/Cache → URL Service → Database (redirect)
\`\`\`

## Key Design Decisions

### ID Generation
- **Counter-based**: Sequential IDs encoded to base62. Simple but predictable.
- **Hash-based**: MD5/SHA256 of long URL, take first 7 chars. Collisions possible.
- **Pre-generated**: Generate random IDs in advance, assign from pool. Fast, no collisions.

### Storage
- **Database**: Key-value (DynamoDB) or wide-column (Cassandra) — simple access pattern (get by short_code)
- **Cache**: Redis for hot URLs (80/20 rule: 20% of URLs get 80% of traffic)

### Redirect Type
- **301 (Permanent)**: Browser caches, reduces server load but loses analytics
- **302 (Temporary)**: Every redirect hits your server — better for analytics`,
      codeExample: `// ============================================
// URL Shortener — System Design Implementation
// ============================================

class URLShortener {
  constructor(db, cache, idGenerator) {
    this.db = db;
    this.cache = cache;
    this.idGen = idGenerator;
    this.BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  }

  // Create short URL
  async createShortURL(longURL, customAlias = null, expiresAt = null) {
    // Check if URL already shortened (deduplication)
    const existing = await this.db.findByLongURL(longURL);
    if (existing && !customAlias) return existing.shortCode;

    let shortCode;
    if (customAlias) {
      // Custom alias — check availability
      const taken = await this.db.findByShortCode(customAlias);
      if (taken) throw new Error('Alias already taken');
      shortCode = customAlias;
    } else {
      // Generate unique short code
      const id = await this.idGen.nextId();
      shortCode = this.toBase62(id);
    }

    const url = {
      shortCode,
      longURL,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      clickCount: 0,
    };

    await this.db.save(url);
    await this.cache.set(\`url:\\\${shortCode}\`, longURL, 'EX', 86400);
    return shortCode;
  }

  // Redirect: shortCode → longURL
  async resolve(shortCode) {
    // Check cache first (hot path)
    let longURL = await this.cache.get(\`url:\\\${shortCode}\`);
    if (longURL) {
      this.recordClick(shortCode); // Async, don't block redirect
      return longURL;
    }

    // Cache miss — query database
    const url = await this.db.findByShortCode(shortCode);
    if (!url) return null;
    if (url.expiresAt && new Date() > url.expiresAt) return null;

    // Populate cache
    await this.cache.set(\`url:\\\${shortCode}\`, url.longURL, 'EX', 86400);
    this.recordClick(shortCode);
    return url.longURL;
  }

  toBase62(num) {
    let result = '';
    while (num > 0) {
      result = this.BASE62[num % 62] + result;
      num = Math.floor(num / 62);
    }
    return result.padStart(7, '0');
  }

  async recordClick(shortCode) {
    // Fire-and-forget to analytics queue (don't block redirect)
    this.cache.incr(\`clicks:\\\${shortCode}\`).catch(() => {});
  }
}

// Demo
const shortener = {
  toBase62(num) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    while (num > 0) { result = chars[num % 62] + result; num = Math.floor(num / 62); }
    return result.padStart(7, '0');
  }
};
console.log('Short code for ID 123456789:', shortener.toBase62(123456789));
console.log('Total possible 7-char codes:', Math.pow(62, 7).toLocaleString());`,
      exercise: `1. **Full Design**: Design a URL shortener handling 100M URLs/month. Include: API design, database schema, caching layer, ID generation strategy, and analytics pipeline.

2. **Collision Handling**: If using hash-based IDs, design a collision resolution strategy that maintains O(1) lookups.

3. **Analytics Dashboard**: Design the analytics system for tracking click counts, geographic distribution, referrer, device type, and time-series click data.

4. **Rate Limiting**: Design rate limits to prevent abuse: per-IP, per-user, and global limits for URL creation.`,
      commonMistakes: [
        "Using MD5/SHA for short codes without collision handling — hash collisions WILL happen at scale. Always check for existence before saving.",
        "Not caching hot URLs — most traffic goes to a small set of popular URLs. Cache the top 20% in Redis for sub-millisecond redirects.",
        "Using 301 redirects — 301 is permanent; browsers cache it and never hit your server again. You lose ALL analytics data. Use 302 for tracking.",
        "Not handling link expiration — without TTL cleanup, the database grows forever. Implement scheduled cleanup jobs for expired links.",
      ],
      interviewQuestions: [
        {
          type: "full-design",
          q: "Design a URL shortener like TinyURL.",
          a: "**Step 1 — Requirements**: 100M URLs/month write, 1B redirects/month read. Low latency redirects, high availability.\n\n**Step 2 — Estimation**: 40 writes/sec, 400 reads/sec. 50GB/month storage. 7-char base62 codes (3.5T combinations).\n\n**Step 3 — API**:\n- POST /api/shorten {url, customAlias?, expiresAt?} → {shortUrl}\n- GET /:shortCode → 302 redirect to long URL\n\n**Step 4 — Architecture**: Client → API Gateway → URL Service → DB + Cache\n\n**Step 5 — ID Generation**: Snowflake ID → base62 encode. Pre-generate batch of IDs for speed.\n\n**Step 6 — Database**: DynamoDB (key: shortCode, value: longURL + metadata). Cache hot URLs in Redis.\n\n**Step 7 — Scale**: CDN for static assets, Redis cache for hot redirects, DB read replicas for analytics queries.",
        },
      ],
    },
    {
      id: "sd-design-twitter-feed",
      title: "Design a Social Media Feed (Twitter/X)",
      explanation: `Designing a social media feed is one of the most asked system design questions. It tests your understanding of fan-out, caching, data models, and tradeoffs at massive scale.

## Requirements

**Functional**: Post tweets, follow/unfollow users, view home timeline (feed of followed users' tweets), search tweets

**Non-Functional**: 300M MAU, average 200 followers per user, 500M tweets/day, feed must load in < 200ms

## The Core Problem: Fan-Out

When a user tweets, how do followers see it in their feed?

### Fan-Out on Write (Push Model)
When a user tweets, **immediately push** the tweet to all followers' feeds.
- User A tweets → write to User B's feed, User C's feed, ... (all followers)
- Reading feed = just read pre-computed feed (fast read, slow write)

### Fan-Out on Read (Pull Model)
When a user views their feed, **query all followed users' tweets** in real-time.
- User B opens feed → query User A's tweets, User C's tweets, ... merge and sort
- Reading feed = expensive computation (slow read, fast write)

### Hybrid Approach (Best)
- **Regular users** (< 10K followers): Fan-out on write (push to followers' feeds)
- **Celebrities** (> 10K followers): Fan-out on read (don't push to millions of feeds; pull when followers view their timeline)

This is exactly what Twitter does.

## Data Model
- **Tweet**: {id, userId, content, mediaURLs, createdAt}
- **Follow**: {followerId, followeeId}
- **Feed**: {userId, tweetId, createdAt} — pre-computed feed per user
- **User**: {id, name, handle, followerCount, followingCount}

> **Interview tip**: Always mention the hybrid fan-out approach. It shows you understand that one-size-fits-all solutions don't work at Twitter scale.`,
      codeExample: `// ============================================
// Social Media Feed — Fan-Out Architecture
// ============================================

class FeedService {
  constructor(db, cache, queue) {
    this.db = db;
    this.cache = cache;
    this.queue = queue;
    this.CELEBRITY_THRESHOLD = 10000;
  }

  async postTweet(userId, content) {
    // Save tweet
    const tweet = await this.db.insert('tweets', {
      id: this.generateId(), userId, content, createdAt: Date.now(),
    });

    const followerCount = await this.db.getFollowerCount(userId);

    if (followerCount < this.CELEBRITY_THRESHOLD) {
      // Regular user: Fan-out on write (push to followers)
      await this.queue.publish('fanout', {
        type: 'push',
        tweetId: tweet.id,
        userId,
        content,
        createdAt: tweet.createdAt,
      });
    }
    // Celebrity: Don't fan out — their tweets are pulled on read

    return tweet;
  }

  // Fan-out worker: pushes tweet to each follower's feed
  async processFanout(event) {
    const followers = await this.db.getFollowers(event.userId);
    for (const followerId of followers) {
      // Add to follower's cached feed (Redis sorted set)
      await this.cache.zadd(
        \`feed:\\\${followerId}\`,
        event.createdAt, // Score = timestamp for sorting
        JSON.stringify({ tweetId: event.tweetId, userId: event.userId, content: event.content })
      );
      // Trim to latest 800 tweets per feed
      await this.cache.zremrangebyrank(\`feed:\\\${followerId}\`, 0, -801);
    }
  }

  // Get user's home feed
  async getFeed(userId, page = 0, pageSize = 20) {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    // Get pre-computed feed from cache
    let feedItems = await this.cache.zrevrange(
      \`feed:\\\${userId}\`, start, end
    );

    // Merge celebrity tweets (fan-out on read)
    const celebrities = await this.getCelebrityFollowees(userId);
    if (celebrities.length > 0) {
      const celebrityTweets = await Promise.all(
        celebrities.map(celeb => this.getRecentTweets(celeb, pageSize))
      );
      // Merge and sort all tweets by timestamp
      feedItems = this.mergeAndSort(
        feedItems.map(item => JSON.parse(item)),
        celebrityTweets.flat()
      ).slice(0, pageSize);
    }

    return feedItems;
  }

  async getCelebrityFollowees(userId) {
    // Get followed users with > 10K followers
    return this.db.query(
      'SELECT followee_id FROM follows WHERE follower_id = $1 AND followee_followers > $2',
      [userId, this.CELEBRITY_THRESHOLD]
    );
  }

  async getRecentTweets(userId, limit) {
    const cached = await this.cache.get(\`tweets:\\\${userId}\`);
    if (cached) return JSON.parse(cached);
    return this.db.query(
      'SELECT * FROM tweets WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
  }

  mergeAndSort(feed1, feed2) {
    return [...feed1, ...feed2].sort((a, b) => b.createdAt - a.createdAt);
  }

  generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
}

console.log("Feed system architecture demonstrated.");`,
      exercise: `1. **Full Feed Design**: Design the complete feed system for Twitter: posting, following, feed generation, search, trending topics. Include database schema, caching, and message queues.

2. **Celebrity Problem**: A user with 50M followers tweets. Design the fan-out strategy. How long until all followers see the tweet? What are the resource requirements?

3. **Feed Ranking**: Instead of chronological feed, design an algorithmic feed that ranks tweets by relevance (engagement, recency, user affinity). What signals do you use?

4. **Real-time Feed Updates**: When a user has their feed open and a new tweet arrives, how do you push it to the client in real-time? Design the WebSocket architecture.`,
      commonMistakes: [
        "Using only fan-out on write — when a celebrity with 50M followers tweets, writing to 50M feeds takes too long and wastes storage. Use hybrid approach.",
        "Not caching the feed — regenerating the feed from database on every request is too slow. Pre-compute and cache in Redis sorted sets.",
        "Ignoring the delete/edit case — when a tweet is deleted, you must remove it from millions of cached feeds. This is expensive with fan-out on write.",
      ],
      interviewQuestions: [
        {
          type: "full-design",
          q: "Design a Twitter-like social media feed system.",
          a: "**Hybrid fan-out**: Push for regular users (< 10K followers), pull for celebrities.\n\n**Post flow**: Tweet saved to DB → if regular user, fan-out worker pushes to followers' Redis feeds → if celebrity, tweet cached under their profile.\n\n**Read flow**: Get pre-computed feed from Redis + merge celebrity tweets (pulled on read) → sort by time → return paginated results.\n\n**Data stores**: PostgreSQL for users/follows, Cassandra for tweets (write-heavy), Redis sorted sets for feeds, Elasticsearch for search.\n\n**Scale**: 500M tweets/day = ~6K tweets/sec. Fan-out: average 200 followers × 6K = 1.2M feed writes/sec → Redis handles this. Celebrity handling avoids 50M× fan-out spikes.",
        },
      ],
    },
  ],
};

export default sdPhase11;
