const sdPhase4b = [
  {
    id: "sd-data-modeling-patterns",
    title: "Data Modeling Patterns",
    explanation: `**Data modeling** is the art of structuring your data to match your application's access patterns. A well-designed data model makes queries fast and simple; a poorly designed one leads to complex queries, slow performance, and scaling headaches.

## Normalization vs Denormalization

### Normalization (Eliminating Redundancy)
Goal: Each piece of data is stored in **one place only**. Related data is connected through foreign keys and JOINs.

**Normal Forms** (simplified):
- **1NF**: No repeating groups, atomic values
- **2NF**: 1NF + no partial dependencies
- **3NF**: 2NF + no transitive dependencies

### Denormalization (Strategic Redundancy)
Goal: Duplicate data to avoid expensive JOINs at read time.

| Pattern | Normalized | Denormalized |
|---------|-----------|-------------|
| **User's post count** | \`SELECT COUNT(*) FROM posts WHERE user_id = ?\` | \`users.post_count\` (pre-computed column) |
| **Post with author** | JOIN posts + users | Store \`author_name\` directly in posts table |
| **Order total** | SUM across order_items | Store \`total\` in orders table |

## Common Data Modeling Patterns

### 1. Star Schema (Analytics)
Central **fact table** (events, transactions) surrounded by **dimension tables** (users, products, time). Optimized for OLAP (analytical queries).

### 2. Adjacency List (Hierarchies)
Each row has a \`parent_id\` pointing to its parent. Simple but recursive queries are slow.

### 3. Materialized Path (Hierarchies)
Store the full path: \`/root/parent/child\`. Fast reads but updating a node's position requires updating all descendants.

### 4. Event Sourcing
Instead of storing current state, store a **log of all events**. Current state is computed by replaying events. Used in financial systems and CQRS architectures.

### 5. CQRS (Command Query Responsibility Segregation)
Separate the **write model** (optimized for commands/updates) from the **read model** (optimized for queries). Different databases can serve each model.

> **Pro tip**: In interviews, explain your data model choices — "I denormalized the post author name because our read:write ratio is 100:1 and this eliminates a JOIN on every feed query."`,
    codeExample: `// ============================================
// Data Modeling Patterns — Practical Examples
// ============================================

// ---------- Pattern 1: Denormalization for Performance ----------

// ❌ NORMALIZED: Post with author info (requires JOIN every read)
const normalizedSchema = \`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    avatar VARCHAR(255)
  );

  CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT,
    created_at TIMESTAMP
  );

  -- Every feed query needs a JOIN:
  SELECT p.*, u.name, u.avatar
  FROM posts p
  JOIN users u ON u.id = p.user_id
  ORDER BY p.created_at DESC LIMIT 20;
\`;

// ✅ DENORMALIZED: Author info embedded in posts table
const denormalizedSchema = \`
  CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    author_name VARCHAR(100),    -- Denormalized from users
    author_avatar VARCHAR(255),  -- Denormalized from users
    content TEXT,
    like_count INTEGER DEFAULT 0, -- Pre-computed counter
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP
  );

  -- Feed query: NO JOIN needed!
  SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;
\`;

// The cost: when a user changes their name/avatar, you must
// update ALL their posts. Acceptable if updates are rare
// and reads are frequent (social media: 100:1 read:write)

// ---------- Pattern 2: CQRS (Separate Read/Write Models) ----------

class CQRSExample {
  constructor() {
    this.writeDB = null;  // PostgreSQL (normalized, ACID)
    this.readDB = null;   // Elasticsearch or Redis (denormalized, fast)
  }

  // WRITE path: Normalized, ACID, consistent
  async createOrder(orderData) {
    const order = await this.writeDB.transaction(async (tx) => {
      const order = await tx.insert('orders', {
        user_id: orderData.userId,
        status: 'pending',
        total: orderData.total,
      });

      for (const item of orderData.items) {
        await tx.insert('order_items', {
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        });

        // Update inventory
        await tx.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
          [item.quantity, item.productId]
        );
      }

      return order;
    });

    // Publish event for read model to update itself
    await this.publishEvent('order.created', {
      orderId: order.id,
      userId: orderData.userId,
      items: orderData.items,
      total: orderData.total,
    });

    return order;
  }

  // READ path: Denormalized, fast, eventual consistency
  async searchOrders(filters) {
    // Query the read-optimized store (Elasticsearch)
    return await this.readDB.search({
      index: 'orders',
      body: {
        query: {
          bool: {
            must: [
              { match: { user_id: filters.userId } },
              { range: { created_at: { gte: filters.startDate } } },
            ],
          },
        },
        sort: [{ created_at: 'desc' }],
      },
    });
  }

  async publishEvent(type, data) {
    // In production: Kafka, RabbitMQ, or AWS SNS
    console.log(\`Published event: \\\${type}\`, data);
  }
}

// ---------- Pattern 3: Event Sourcing ----------

class EventSourcedAccount {
  constructor(accountId) {
    this.accountId = accountId;
    this.events = []; // Event log
    this.balance = 0; // Current state (derived from events)
  }

  // Instead of updating state, we APPEND events
  deposit(amount) {
    const event = {
      type: 'DEPOSITED',
      accountId: this.accountId,
      amount,
      timestamp: Date.now(),
    };
    this.events.push(event);
    this.applyEvent(event);
    return event;
  }

  withdraw(amount) {
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }
    const event = {
      type: 'WITHDRAWN',
      accountId: this.accountId,
      amount,
      timestamp: Date.now(),
    };
    this.events.push(event);
    this.applyEvent(event);
    return event;
  }

  // Apply a single event to update state
  applyEvent(event) {
    switch (event.type) {
      case 'DEPOSITED':
        this.balance += event.amount;
        break;
      case 'WITHDRAWN':
        this.balance -= event.amount;
        break;
    }
  }

  // Rebuild state from event history
  static fromEvents(accountId, events) {
    const account = new EventSourcedAccount(accountId);
    for (const event of events) {
      account.applyEvent(event);
      account.events.push(event);
    }
    return account;
  }

  // Get state at any point in time!
  getBalanceAt(timestamp) {
    let balance = 0;
    for (const event of this.events) {
      if (event.timestamp > timestamp) break;
      if (event.type === 'DEPOSITED') balance += event.amount;
      if (event.type === 'WITHDRAWN') balance -= event.amount;
    }
    return balance;
  }
}

// Demo
const account = new EventSourcedAccount('acc_123');
account.deposit(1000);
account.withdraw(250);
account.deposit(500);
console.log('Current balance:', account.balance); // 1250
console.log('Event history:', account.events.length); // 3 events
console.log('Full audit trail:', account.events);`,
    exercise: `1. **Normalize vs Denormalize**: Given an e-commerce database, design both a normalized (3NF) and denormalized schema for the product listing page. Compare query complexity and performance for "Get product with category, reviews summary, and seller info."

2. **CQRS Implementation**: Design a CQRS architecture for a social media platform. Define the write model (PostgreSQL), read model (Elasticsearch), and the event pipeline that keeps them in sync.

3. **Event Sourcing Design**: Design an event-sourced shopping cart. Define all event types (ItemAdded, ItemRemoved, QuantityChanged, CartCleared, CartCheckedOut). Implement the state reconstruction logic.

4. **Schema Evolution**: Your users table needs a new \`preferences\` field with complex nested data (notification settings, theme, language). Compare: (a) adding a JSONB column, (b) creating a separate preferences table, (c) using a key-value pattern. Which would you choose?

5. **Time-Series Model**: Design the data model for a real-time analytics dashboard tracking page views, clicks, and conversions. Include: raw events table, pre-aggregated summary tables, and the aggregation pipeline.`,
    commonMistakes: [
      "Over-normalizing in a read-heavy system — forcing JOINs on every read when data could be safely denormalized. If data rarely changes but is read constantly, denormalize it.",
      "Denormalizing without a sync strategy — if you duplicate data (user name in posts table), you MUST have a mechanism to update all copies when the source changes. Without it, data becomes permanently inconsistent.",
      "Using event sourcing for simple CRUD — event sourcing adds significant complexity (event replay, snapshotting, eventual consistency). Use it only when you need an audit trail, time-travel queries, or complex domain logic.",
      "Ignoring the write amplification of denormalization — if a celebrity updates their profile picture and has 10M posts, you now have a massive batch update to run. Design around this with lazy updates or background jobs.",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is CQRS and when would you use it?",
        a: "**CQRS (Command Query Responsibility Segregation)** separates the write model from the read model:\n\n**Write model**: Normalized, ACID, optimized for data integrity (PostgreSQL)\n**Read model**: Denormalized, optimized for fast queries (Elasticsearch, Redis, materialized views)\n**Sync**: Events or change data capture keep the read model updated\n\n**When to use**:\n1. **Different read/write patterns**: Writes are simple but reads are complex (dashboards, search)\n2. **Read:write ratio is extreme** (1000:1)\n3. **Different scaling needs**: Reads need horizontal scaling, writes need ACID\n4. **Multiple read representations**: Different UIs need different data shapes\n\n**When NOT to use**:\n- Simple CRUD applications\n- Strong consistency is required on reads\n- Small scale where a single database handles both fine\n\n**Trade-off**: CQRS adds eventual consistency between write and read models. The read model may be seconds (sometimes minutes) behind the write model.",
      },
      {
        type: "scenario",
        q: "You're designing a banking system. Should you use event sourcing? Why or why not?",
        a: "**Yes, banking is one of the strongest use cases for event sourcing**:\n\n**Why it fits perfectly**:\n1. **Audit trail**: Banks are legally required to maintain complete transaction history. Event sourcing provides this by default — no additional logging needed.\n2. **Time-travel queries**: 'What was the balance on March 15?' — trivially answered by replaying events up to that date\n3. **Reconciliation**: Can detect discrepancies by replaying events and comparing with current state\n4. **Immutability**: Financial records should never be modified — event sourcing stores immutable events\n\n**Implementation**:\n- Events: AccountOpened, MoneyDeposited, MoneyWithdrawn, TransferInitiated, TransferCompleted\n- Snapshots every 1000 events to speed up state reconstruction\n- CQRS read model for account balances and transaction history\n\n**Challenges**: Event replay can be slow for accounts with millions of transactions → use periodic snapshots. Schema evolution for events requires careful versioning.",
      },
    ],
  },
  {
    id: "sd-object-storage-and-blob",
    title: "Object Storage & Blob Storage",
    explanation: `Not all data belongs in a database. **Large binary data** — images, videos, documents, backups, logs — should be stored in **object storage**, a specialized system designed for massive files and high throughput.

## Object Storage vs File System vs Block Storage

| Feature | Object Storage | File System | Block Storage |
|---------|---------------|-------------|---------------|
| **Structure** | Flat namespace with keys | Hierarchical (directories) | Raw disk blocks |
| **Access pattern** | HTTP API (PUT/GET/DELETE) | OS-level file operations | Low-level I/O |
| **Metadata** | Rich, custom metadata per object | Limited (permissions, timestamps) | None |
| **Scale** | Virtually unlimited | Limited by disk/NFS | Limited by disk |
| **Durability** | 99.999999999% (11 nines) | Depends on RAID | Depends on RAID |
| **Cost** | Very low (~$0.023/GB/month) | Medium | High |
| **Examples** | S3, GCS, Azure Blob | NFS, EFS | EBS, SAN |

## How Object Storage Works

Objects are stored with three components:
1. **Key** (path): \`/users/123/profile/avatar.jpg\`
2. **Data** (the actual bytes): The image/video/document
3. **Metadata**: Content-type, upload date, custom tags, ACL

Access is via simple HTTP:
- \`PUT /bucket/key\` → upload
- \`GET /bucket/key\` → download
- \`DELETE /bucket/key\` → remove
- \`HEAD /bucket/key\` → get metadata only

## When to Use Object Storage

| Use Case | Why Object Storage? |
|----------|-------------------|
| **User uploads** (images, avatars) | Cheap, durable, serves via CDN |
| **Video content** | Handles massive files, integrates with transcoding |
| **Data lake** | Store raw data for analytics pipelines |
| **Backups** | Ultra-cheap archival ($0.004/GB/month for S3 Glacier) |
| **Static website assets** | Serve directly or through CDN |
| **Log storage** | Append-only, rarely read, huge volume |

## Common Architecture Pattern

\`\`\`
User uploads image → API Server → Store metadata in DB → Upload file to S3
User views image  → CDN (cache) → S3 (origin) → Return image
\`\`\`

The database stores **metadata** (filename, user_id, size, URL), and the actual file lives in **object storage** (S3, GCS).

## Pre-signed URLs

Instead of routing every upload/download through your API server, use **pre-signed URLs** — temporary, authenticated URLs that allow direct upload/download to object storage.

This is critical for performance because:
- Large files don't flow through your API servers (saves bandwidth)
- Upload goes directly from client to S3 (lower latency)
- Download goes through CDN → S3 (optimal path)

> **Interview tip**: When designing any system that handles media (images, videos, documents), always mention object storage + CDN. Don't say "store images in the database" — that's a major red flag.`,
    codeExample: `// ============================================
// Object Storage — Production Patterns
// ============================================

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// ---------- Pre-signed URL Upload Flow ----------

// ✅ GOOD: Client uploads directly to S3 via pre-signed URL
// Server never handles the large file!

async function getUploadUrl(req, res) {
  const { fileName, fileType } = req.body;
  const key = \`uploads/\\\${req.user.id}/\\\${Date.now()}-\\\${fileName}\`;

  // Generate a URL that allows direct upload to S3
  const presignedUrl = await s3.getSignedUrlPromise('putObject', {
    Bucket: 'my-app-uploads',
    Key: key,
    ContentType: fileType,
    Expires: 300, // URL valid for 5 minutes
    Conditions: [
      ['content-length-range', 0, 10 * 1024 * 1024], // Max 10MB
    ],
  });

  // Save metadata to database
  await db.insert('files', {
    userId: req.user.id,
    s3Key: key,
    fileName,
    fileType,
    status: 'pending_upload',
  });

  res.json({
    uploadUrl: presignedUrl,
    key,
    expiresIn: 300,
  });
}

// Client-side upload (browser):
// const response = await fetch(uploadUrl, {
//   method: 'PUT',
//   body: file,
//   headers: { 'Content-Type': file.type }
// });

// ---------- Pre-signed URL Download Flow ----------

async function getDownloadUrl(req, res) {
  const { fileId } = req.params;
  const file = await db.findFile(fileId);

  if (!file) return res.status(404).json({ error: 'File not found' });

  // Check access permissions
  if (file.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const downloadUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket: 'my-app-uploads',
    Key: file.s3Key,
    Expires: 3600, // URL valid for 1 hour
    ResponseContentDisposition:
      \`attachment; filename="\\\${file.fileName}"\`,
  });

  res.json({ downloadUrl, expiresIn: 3600 });
}

// ---------- Image Upload with Processing Pipeline ----------

// ❌ BAD: Process images synchronously in the API handler
async function badImageUpload(req, res) {
  const image = req.file;
  const thumbnail = await sharp(image.buffer).resize(150, 150).toBuffer();
  const medium = await sharp(image.buffer).resize(600, 600).toBuffer();
  const large = await sharp(image.buffer).resize(1200, 1200).toBuffer();

  await Promise.all([
    s3Upload('thumbnails/', thumbnail),
    s3Upload('medium/', medium),
    s3Upload('large/', large),
    s3Upload('original/', image.buffer),
  ]);
  // User waits for ALL processing + 4 uploads = 5-15 seconds!
  res.json({ success: true });
}

// ✅ GOOD: Upload original, process asynchronously
async function goodImageUpload(req, res) {
  const key = \`originals/\\\${req.user.id}/\\\${Date.now()}.jpg\`;

  // Upload original only
  await s3.putObject({
    Bucket: 'my-app-images',
    Key: key,
    Body: req.file.buffer,
    ContentType: 'image/jpeg',
  }).promise();

  // Trigger async processing (S3 event → Lambda/SQS)
  // Lambda will generate thumbnails and multiple sizes
  await db.insert('images', {
    userId: req.user.id,
    originalKey: key,
    status: 'processing', // Will become 'ready' after Lambda runs
  });

  // User gets immediate response
  res.status(202).json({
    message: 'Image uploaded, processing in background',
    imageId: 'img_123',
  });
}

// Lambda function triggered by S3 upload event:
async function processImageLambda(event) {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  const original = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  const sharp = require('sharp');

  const sizes = [
    { name: 'thumbnail', width: 150, height: 150 },
    { name: 'medium', width: 600, height: 600 },
    { name: 'large', width: 1200, height: 1200 },
  ];

  for (const size of sizes) {
    const resized = await sharp(original.Body)
      .resize(size.width, size.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    await s3.putObject({
      Bucket: bucket,
      Key: key.replace('originals/', \`\\\${size.name}/\`),
      Body: resized,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
    }).promise();
  }

  // Update database status
  await db.update('images', { originalKey: key }, { status: 'ready' });
}

// ---------- Storage Class Selection ----------

const storageClasses = {
  'S3 Standard': {
    cost: '$0.023/GB/month',
    useCase: 'Frequently accessed data (user profiles, active content)',
    retrieval: 'Instant',
  },
  'S3 Intelligent-Tiering': {
    cost: '$0.023/GB/month (auto-optimized)',
    useCase: 'Unknown access patterns',
    retrieval: 'Instant',
  },
  'S3 Infrequent Access': {
    cost: '$0.0125/GB/month',
    useCase: 'Accessed less than once a month (old data)',
    retrieval: 'Instant (per-request fee)',
  },
  'S3 Glacier': {
    cost: '$0.004/GB/month',
    useCase: 'Archival (compliance, backups)',
    retrieval: 'Minutes to hours',
  },
  'S3 Glacier Deep Archive': {
    cost: '$0.00099/GB/month',
    useCase: 'Long-term archival (7+ years retention)',
    retrieval: '12-48 hours',
  },
};

async function s3Upload(prefix, buffer) {
  // helper stub
}

console.log('Storage classes:', storageClasses);`,
    exercise: `1. **Upload Architecture**: Design a complete image upload system for a social media app. Include: client upload flow (pre-signed URLs), image processing pipeline (thumbnails, watermarks), CDN delivery, and cost estimation for 1M images/day.

2. **Video Streaming**: Design the storage architecture for a video platform like YouTube. How do you handle: multiple resolutions, chunked uploads (resume on failure), transcoding pipeline, and storage costs for 500 hours of video uploaded per minute?

3. **Data Lake Design**: Design a data lake architecture on S3 for an e-commerce company. Include: raw event ingestion, data transformation pipeline (ETL), partitioning strategy, and query layer (Athena/Spark).

4. **Cost Optimization**: You're storing 500TB of user data on S3 Standard ($11,500/month). Analytics show 70% hasn't been accessed in 90 days. Design a lifecycle policy to reduce costs using storage tiering.

5. **Pre-signed URL Security**: Identify and fix the security issues in this pre-signed URL generation: (a) URLs that never expire, (b) no file size limits, (c) no file type validation, (d) no user authentication check.`,
    commonMistakes: [
      "Storing large files (images, videos) in the database — databases are optimized for structured queries, not blob storage. Large files in a database slow down backups, replication, and queries. Use object storage (S3).",
      "Not using pre-signed URLs — routing uploads and downloads through your API server wastes server bandwidth and CPU. Let clients talk directly to object storage using pre-signed URLs.",
      "Forgetting about storage costs at scale — storing 1 million images at 2MB each = 2TB = ~$46/month on S3 Standard. But with 4 sizes per image + CDN egress, costs multiply quickly. Plan storage tiers and lifecycle policies.",
      "Processing uploads synchronously — generating thumbnails, transcoding video, or scanning for viruses should happen asynchronously. Use event-driven processing (S3 events → Lambda/SQS) to keep upload latency low.",
    ],
    interviewQuestions: [
      {
        type: "scenario",
        q: "You're designing an image hosting service like Imgur. How do you handle image uploads, storage, and delivery?",
        a: "**Upload flow**:\n1. Client requests pre-signed URL from API → server returns S3 pre-signed URL\n2. Client uploads directly to S3 (bypasses API server)\n3. S3 triggers event → Lambda processes the image (generate thumbnails, extract metadata)\n4. Lambda updates database with image metadata and CDN URLs\n\n**Storage**:\n- **S3 Standard** for recent images (< 30 days)\n- **S3 IA** for older images (30-180 days)\n- **S3 Glacier** for archived images (> 180 days)\n- Lifecycle policies auto-transition between tiers\n\n**Delivery**:\n- **CloudFront CDN** in front of S3\n- Cache headers: `Cache-Control: public, max-age=31536000, immutable`\n- Content-addressed keys (hash-based names) so URLs are cacheable forever\n\n**Scale**: For 10M images/day:\n- Storage: ~20TB/day raw, ~5TB/day after compression\n- CDN handles read traffic (100:1 read:write)\n- S3 handles unlimited write throughput natively",
      },
      {
        type: "conceptual",
        q: "Why does Amazon S3 offer 11 nines (99.999999999%) of durability? How is that even possible?",
        a: "S3 achieves extreme durability through multiple mechanisms:\n\n1. **Replication**: Each object is automatically replicated across **at least 3 Availability Zones** (physically separate data centers)\n2. **Erasure coding**: Data is split and encoded so it can be reconstructed from a subset of fragments (even if some fragments are lost)\n3. **Data integrity checks**: MD5 checksums on every read/write; continuous background verification\n4. **Automatic repair**: If a copy is lost (disk failure), S3 automatically re-replicates from healthy copies before more failures can occur\n5. **Massive scale**: Spread across thousands of drives — no single drive, server, or datacenter failure threatens data\n\n**What 11 nines means**: If you store 10 million objects, you can expect to lose 1 object every 10,000 years. For comparison, 99.99% durability would lose 1,000 objects.\n\n**Caveat**: Durability ≠ availability. S3 has 99.99% availability (52 minutes downtime/year). Your data is safe but temporarily unreachable during an outage.",
      },
    ],
  },
];

export default sdPhase4b;
