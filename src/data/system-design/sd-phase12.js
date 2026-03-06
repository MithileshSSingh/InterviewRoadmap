const sdPhase12 = {
  id: "phase-12",
  title: "Phase 12: Advanced Topics",
  emoji: "🔬",
  description:
    "Dive into advanced system design concepts — distributed consensus, leader election, conflict-free replicated data types (CRDTs), bloom filters, and geospatial indexing.",
  topics: [
    {
      id: "sd-distributed-consensus",
      title: "Distributed Consensus & Leader Election",
      explanation: `**Distributed consensus** is how multiple nodes agree on a value even when some nodes fail or messages are lost. It's the foundation of reliable distributed systems.

## Why Consensus Is Hard
In a distributed system, you can't rely on a single coordinator — it could crash. You need multiple nodes to agree, but they communicate over unreliable networks (messages can be delayed, duplicated, or lost).

## Key Algorithms

### Raft (Most Practical)
Designed for understandability. Used by etcd, CockroachDB, TiKV.
- **Leader election**: One node is elected leader; it handles all writes
- **Log replication**: Leader replicates writes to followers; committed when majority acknowledge
- **Safety**: A new leader is elected if the current one fails (within seconds)

### Paxos (Theoretical Foundation)
The original consensus algorithm by Leslie Lamport. Proven correct but notoriously hard to implement. Most systems use Raft instead.

### ZAB (ZooKeeper Atomic Broadcast)
Used by Apache ZooKeeper. Similar to Raft but designed specifically for ZooKeeper's use case: configuration management and service discovery.

## Leader Election Use Cases
- **Database primary selection**: When the primary fails, replicas elect a new primary
- **Distributed locks**: Only the leader can perform a specific action
- **Job scheduling**: One node is the "scheduler" that assigns work
- **Config management**: ZooKeeper/etcd provide consistent configuration

## Split-Brain Problem
If network partitions a cluster into two groups, each group might elect its own leader → two leaders making conflicting decisions. Solution: **quorum** — a leader must have votes from majority (> N/2).

> **Interview tip**: You rarely implement consensus yourself. Know when to mention ZooKeeper, etcd, or Raft, and understand why they exist.`,
      codeExample: `// ============================================
// Distributed Consensus — Simplified Raft
// ============================================

class RaftNode {
  constructor(id, peers) {
    this.id = id;
    this.peers = peers;
    this.state = 'FOLLOWER'; // FOLLOWER | CANDIDATE | LEADER
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];
    this.commitIndex = 0;
    this.electionTimeout = 150 + Math.random() * 150; // 150-300ms
    this.lastHeartbeat = Date.now();
  }

  // If no heartbeat received, start election
  checkElectionTimeout() {
    if (this.state === 'LEADER') return;
    if (Date.now() - this.lastHeartbeat > this.electionTimeout) {
      this.startElection();
    }
  }

  startElection() {
    this.state = 'CANDIDATE';
    this.currentTerm++;
    this.votedFor = this.id;
    let votes = 1; // Vote for self
    console.log(\`Node \\\${this.id}: Starting election for term \\\${this.currentTerm}\`);

    for (const peer of this.peers) {
      const voteGranted = peer.requestVote(this.currentTerm, this.id, this.log.length);
      if (voteGranted) votes++;
    }

    const majority = Math.floor((this.peers.length + 1) / 2) + 1;
    if (votes >= majority) {
      this.state = 'LEADER';
      console.log(\`Node \\\${this.id}: Elected LEADER for term \\\${this.currentTerm}\`);
      this.sendHeartbeats();
    } else {
      this.state = 'FOLLOWER';
    }
  }

  requestVote(term, candidateId, lastLogIndex) {
    if (term > this.currentTerm && (this.votedFor === null || this.votedFor === candidateId)) {
      this.currentTerm = term;
      this.votedFor = candidateId;
      return true;
    }
    return false;
  }

  appendEntry(term, entry) {
    if (term >= this.currentTerm) {
      this.lastHeartbeat = Date.now();
      this.state = 'FOLLOWER';
      this.log.push(entry);
      return true;
    }
    return false;
  }

  // Leader sends heartbeats to prevent new elections
  sendHeartbeats() {
    if (this.state !== 'LEADER') return;
    for (const peer of this.peers) {
      peer.appendEntry(this.currentTerm, { type: 'heartbeat' });
    }
  }
}

// Demo
const node1 = new RaftNode('node-1', []);
const node2 = new RaftNode('node-2', []);
const node3 = new RaftNode('node-3', []);
node1.peers = [node2, node3];
node2.peers = [node1, node3];
node3.peers = [node1, node2];

// Simulate election timeout on node 1
node1.startElection();
console.log(\`Node 1: \\\${node1.state}, Node 2: \\\${node2.state}, Node 3: \\\${node3.state}\`);`,
      exercise: `1. **Raft Simulation**: Implement a full Raft simulation with 5 nodes. Test: leader election, log replication, and leader failure recovery.

2. **Split-Brain Scenario**: 5-node cluster splits into 2 groups (3 and 2). Walk through what happens with Raft consensus. Does each group elect a leader? Can both accept writes?

3. **ZooKeeper vs etcd**: Compare ZooKeeper and etcd for service discovery. When would you choose each?

4. **Leader Election with Redis**: Implement a leader election mechanism using Redis SETNX for a job scheduler where only one node should assign jobs.`,
      commonMistakes: [
        "Implementing your own consensus algorithm — consensus is extremely hard to get right. Use battle-tested implementations (etcd, ZooKeeper) instead of rolling your own.",
        "Not handling split-brain — without quorum checks, network partitions can lead to two leaders making conflicting decisions. Always require majority votes.",
        "Confusing strong consistency with consensus — consensus is how nodes agree; consistency is the guarantee users see. You can have consensus internally but expose eventual consistency to users.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is distributed consensus and why is it important?",
          a: "**Distributed consensus** ensures multiple nodes agree on a value despite failures.\n\n**Why important**: Without consensus, distributed systems can have split-brain (conflicting leaders), data inconsistency, and lost writes.\n\n**Common algorithms**: Raft (practical, used by etcd/CockroachDB), Paxos (theoretical foundation), ZAB (ZooKeeper).\n\n**How Raft works**: One leader handles writes, replicates to followers. Committed when majority acknowledge. If leader fails, new election within seconds.\n\n**When to mention**: Service discovery (etcd), config management (ZooKeeper), strongly consistent databases (CockroachDB), distributed locks.",
        },
      ],
    },
    {
      id: "sd-bloom-filters-and-data-structures",
      title: "Probabilistic Data Structures",
      explanation: `**Probabilistic data structures** trade perfect accuracy for massive efficiency. They answer questions like "have I seen this before?" using a fraction of the memory that exact data structures would need.

## Bloom Filter
"Is this element in the set?" → **Yes (probably)** or **No (definitely)**

- **False positives**: Might say "yes" when the answer is "no" (~1% error rate)
- **No false negatives**: If it says "no," the element is definitely not in the set
- **Space efficient**: 10 bytes per element (vs 100+ bytes for a hash set)

**Used by**: Chrome (malicious URL checking), Cassandra (avoiding disk reads for missing rows), Medium (article recommendation dedup)

## HyperLogLog (HLL)
"How many unique elements?" → Approximate count with ~0.81% error

- Counts **billions** of unique elements using only **12 KB** of memory
- Redis: \`PFADD visitors user123\`, \`PFCOUNT visitors\`
**Used by**: Redis unique visitor counting, database query optimization

## Count-Min Sketch
"How many times has this element appeared?" → Approximate frequency count

**Used by**: Network traffic analysis, finding heavy hitters (trending topics)

## When to Use Probabilistic Structures

| Question | Structure | Memory | Accuracy |
|----------|-----------|--------|----------|
| "Seen this before?" | Bloom Filter | Very low | No false negatives |
| "How many unique?" | HyperLogLog | 12 KB! | ~0.81% error |
| "How often?" | Count-Min Sketch | Low | Slight overcount |

> **Interview tip**: Mention bloom filters when designing systems with "have I seen this?" checks (web crawlers, recommendation dedup, spam filters). They're a great way to show depth.`,
      codeExample: `// ============================================
// Probabilistic Data Structures
// ============================================

// ---------- Bloom Filter ----------
class BloomFilter {
  constructor(size = 1024, hashCount = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Uint8Array(size);
  }

  add(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(item, i) % this.size;
      this.bitArray[index] = 1;
    }
  }

  mightContain(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(item, i) % this.size;
      if (this.bitArray[index] === 0) return false; // Definitely not in set
    }
    return true; // Probably in set (maybe false positive)
  }

  hash(item, seed) {
    let hash = seed;
    const str = String(item);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }
}

// ---------- HyperLogLog (Simplified) ----------
class HyperLogLog {
  constructor(precision = 14) {
    this.precision = precision;
    this.m = 1 << precision; // Number of registers (16384)
    this.registers = new Uint8Array(this.m);
  }

  add(item) {
    const hash = this.hash64(item);
    const index = hash >>> (32 - this.precision); // First p bits → register index
    const remaining = hash << this.precision; // Remaining bits
    const leadingZeros = this.countLeadingZeros(remaining) + 1;
    this.registers[index] = Math.max(this.registers[index], leadingZeros);
  }

  count() {
    // Harmonic mean of 2^register values
    let sum = 0;
    let zeros = 0;
    for (let i = 0; i < this.m; i++) {
      sum += Math.pow(2, -this.registers[i]);
      if (this.registers[i] === 0) zeros++;
    }
    const alpha = 0.7213 / (1 + 1.079 / this.m);
    let estimate = alpha * this.m * this.m / sum;

    // Small range correction
    if (estimate < 2.5 * this.m && zeros > 0) {
      estimate = this.m * Math.log(this.m / zeros);
    }
    return Math.round(estimate);
  }

  hash64(item) {
    let hash = 0x811c9dc5;
    const str = String(item);
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash;
  }

  countLeadingZeros(n) {
    if (n === 0) return 32;
    let count = 0;
    while ((n & 0x80000000) === 0) { n <<= 1; count++; }
    return count;
  }
}

// Demo
const bloom = new BloomFilter(10000, 5);
bloom.add('hello');
bloom.add('world');
console.log('Contains "hello":', bloom.mightContain('hello'));     // true
console.log('Contains "missing":', bloom.mightContain('missing')); // false (probably)

const hll = new HyperLogLog();
for (let i = 0; i < 100000; i++) hll.add(\`user_\\\${i}\`);
console.log('Estimated unique:', hll.count()); // ~100000 (±1%)`,
      exercise: `1. **Bloom Filter for Web Crawler**: Design a bloom filter to track 1 billion crawled URLs. Calculate: optimal bit array size and number of hash functions for < 0.1% false positive rate.

2. **Unique Visitors**: Use HyperLogLog to count unique daily visitors across 1000 pages. Each page has its own HLL. How do you count unique visitors across ALL pages?

3. **Recommendation Dedup**: Design a system that avoids recommending articles a user has already read, using bloom filters. Handle: 10M users, 100K articles, and bloom filter per user.

4. **Trending Topics**: Use a Count-Min Sketch to find the top 10 trending hashtags from a stream of 1M tweets/minute.`,
      commonMistakes: [
        "Using bloom filters when false positives are unacceptable — bloom filters are probabilistic. If a false positive causes a payment to be skipped or a security check to pass, don't use a bloom filter.",
        "Not sizing bloom filters correctly — too small = high false positive rate 2. Too large = wasted memory. Use the formula: m = -n*ln(p) / (ln(2))^2 where n = elements, p = false positive rate.",
        "Forgetting you can't remove from a bloom filter — standard bloom filters only support add and query. Use a Counting Bloom Filter if you need deletions.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is a bloom filter and when would you use it?",
          a: "**Bloom filter**: A space-efficient probabilistic data structure that tests set membership.\n\n**Answers**: 'Definitely NOT in set' or 'Probably in set' (false positives possible, false negatives impossible).\n\n**How it works**: K hash functions map each element to K positions in a bit array. To check membership, verify all K positions are set.\n\n**Use cases**:\n- **Web crawler**: Skip already-crawled URLs (1B URLs in ~1.2GB)\n- **Database**: Cassandra checks bloom filter before reading disk — if element is definitely not on disk, skip the I/O\n- **Spam filter**: Quick check if email is from known spammer\n- **CDN**: Check if content is cached before checking slower storage\n\n**Space**: ~10 bits per element for 1% false positive rate (vs ~100+ bytes for a hash set).",
        },
      ],
    },
  ],
};

export default sdPhase12;
