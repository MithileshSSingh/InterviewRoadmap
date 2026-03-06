const sdPhase8 = {
  id: "phase-8",
  title: "Phase 8: Consistency, Availability & CAP Theorem",
  emoji: "⚖️",
  description:
    "Understand the fundamental trade-offs in distributed systems — CAP theorem, ACID vs BASE, consistency models, and how to choose the right consistency level for each component.",
  topics: [
    {
      id: "sd-cap-theorem",
      title: "CAP Theorem",
      explanation: `The **CAP Theorem** states that a distributed system can provide at most **two out of three** guarantees simultaneously:

- **C (Consistency)**: Every read receives the most recent write
- **A (Availability)**: Every request receives a response (even if stale)
- **P (Partition Tolerance)**: System continues operating despite network failures between nodes

## Why Can't You Have All Three?

Network partitions **will happen** in distributed systems. When they do, you must choose:
- **CP**: Favor consistency — reject requests that can't guarantee fresh data (system becomes unavailable during partition)
- **AP**: Favor availability — serve requests with potentially stale data (system stays available but may be inconsistent)

## Real-World Database Classification

| Database | Category | Behavior During Partition |
|----------|----------|--------------------------|
| **PostgreSQL** | CP | Rejects writes to disconnected replicas |
| **MongoDB** | CP (default) | Primary handles writes, disconnected nodes are unavailable |
| **Cassandra** | AP | All nodes accept writes, reconcile later |
| **DynamoDB** | AP | Eventually consistent reads by default |
| **Redis** | CP | Primary only accepts writes |
| **CockroachDB** | CP | Strongly consistent, Raft consensus |

## PACELC Extension

CAP only describes behavior **during a partition**. PACELC extends this:

When there IS a **Partition**: choose **Availability** or **Consistency**
**Else** (normal operation): choose **Latency** or **Consistency**

| System | P: A/C | E: L/C |
|--------|--------|--------|
| Cassandra | A | L (fast, eventual consistency) |
| PostgreSQL | C | C (consistent, higher latency) |
| DynamoDB | A | L (fast by default, optional consistency) |
| MongoDB | C | C (consistent reads from primary) |

> **Pro tip**: In interviews, never say "I choose consistency" or "I choose availability" globally. Different parts of the system need different trade-offs. User accounts need CP; a social media feed can be AP.`,
      codeExample: `// ============================================
// CAP Theorem — Practical Demonstration
// ============================================

// ---------- CP System (Consistency over Availability) ----------
class CPDatabase {
  constructor(nodes) {
    this.nodes = nodes;
    this.quorum = Math.floor(nodes.length / 2) + 1;
  }

  async write(key, value) {
    let acks = 0;
    for (const node of this.nodes) {
      try {
        await node.write(key, value);
        acks++;
      } catch (e) {
        console.log(\`Node \\\${node.id} unreachable\`);
      }
    }

    if (acks >= this.quorum) {
      return { success: true, acks };
    }
    // CP: Reject write if quorum not met
    throw new Error(\`Write failed: only \\\${acks}/\\\${this.quorum} acks (UNAVAILABLE)\`);
  }

  async read(key) {
    let responses = [];
    for (const node of this.nodes) {
      try {
        const value = await node.read(key);
        responses.push(value);
      } catch (e) { /* Node unreachable */ }
    }

    if (responses.length >= this.quorum) {
      // Return the most recent value
      return responses.sort((a, b) => b.version - a.version)[0];
    }
    throw new Error('Read failed: quorum not met (UNAVAILABLE)');
  }
}

// ---------- AP System (Availability over Consistency) ----------
class APDatabase {
  constructor(nodes) {
    this.nodes = nodes;
  }

  async write(key, value) {
    // AP: Write to ANY available node, even during partition
    for (const node of this.nodes) {
      try {
        await node.write(key, value);
        // Background: async replicate to other nodes
        this.asyncReplicate(node, key, value);
        return { success: true, node: node.id };
      } catch (e) { continue; }
    }
    throw new Error('All nodes down');
  }

  async read(key) {
    // AP: Read from ANY available node (might be stale!)
    for (const node of this.nodes) {
      try {
        return await node.read(key);
      } catch (e) { continue; }
    }
    throw new Error('All nodes down');
  }

  async asyncReplicate(sourceNode, key, value) {
    for (const node of this.nodes) {
      if (node.id !== sourceNode.id) {
        try { await node.write(key, value); } catch (e) { /* Retry later */ }
      }
    }
  }
}

// ---------- Per-Component Consistency Decisions ----------
const systemDesignDecisions = {
  'User Authentication': {
    consistency: 'CP (Strong)',
    reason: 'Cannot serve stale auth data — security risk',
    database: 'PostgreSQL with synchronous replication',
  },
  'Social Feed': {
    consistency: 'AP (Eventual)',
    reason: 'Stale feed for a few seconds is acceptable',
    database: 'Cassandra with async replication',
  },
  'Shopping Cart': {
    consistency: 'AP with conflict resolution',
    reason: 'Must be available during sales events, merge conflicts later',
    database: 'DynamoDB with last-writer-wins',
  },
  'Inventory Count': {
    consistency: 'CP for checkout, AP for display',
    reason: 'Display can be stale, but checkout must prevent overselling',
    database: 'PostgreSQL for checkout, Redis cache for display',
  },
  'Chat Messages': {
    consistency: 'AP with causal ordering',
    reason: 'Messages must be available even during partial outages',
    database: 'Cassandra with client-side ordering',
  },
};

console.log('System design consistency decisions:');
Object.entries(systemDesignDecisions).forEach(([component, config]) => {
  console.log(\`\\n\\\${component}: \\\${config.consistency}\`);
  console.log(\`  Reason: \\\${config.reason}\`);
});`,
      exercise: `1. **CAP Classification**: For each database, classify as CP or AP and explain with a partition scenario: PostgreSQL, Cassandra, MongoDB (default config), Redis Cluster, DynamoDB.

2. **Per-Component Consistency**: For an e-commerce platform, decide CP or AP for each: user accounts, product catalog, search results, order processing, inventory, reviews, recommendations.

3. **Partition Scenario**: Two datacenters lose network connectivity. Users in DC-A update their profile while users in DC-B read the same profile. Walk through what happens for both a CP and AP system.

4. **Consistency vs Business**: A bank allows "available balance" (AP) to differ slightly from "actual balance" (CP). When does each display? Why is this acceptable?`,
      commonMistakes: [
        "Treating CAP as a permanent, system-wide choice — you don't pick CP or AP for the entire system. Different data has different consistency needs. Choose per component.",
        "Forgetting that partitions WILL happen — in a distributed system, network issues are inevitable. Don't design as if all nodes are always reachable.",
        "Confusing consistency models — CAP 'Consistency' means linearizability (every read sees the latest write). This is different from ACID 'Consistency' (database invariants are maintained).",
        "Thinking AP means 'no consistency at all' — AP systems are eventually consistent. Writes propagate, just not instantly. Most data becomes consistent within seconds.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the CAP theorem and how it applies to system design.",
          a: "**CAP Theorem**: In a distributed system, during a network partition, you must choose between Consistency (all nodes see the same data) and Availability (all requests get a response).\n\n**Key insight**: Partition tolerance isn't optional — partitions WILL happen. So the real choice is **CP vs AP**.\n\n**How I apply it**: I don't choose one for the entire system. I choose per component:\n- **User auth/payments**: CP — stale data is a security/financial risk\n- **Feed/search/recommendations**: AP — stale data is acceptable for better availability\n- **Inventory**: CP for checkout (prevent overselling), AP for catalog display (stale count OK)\n\nThis approach gives each component the right trade-off.",
        },
        {
          type: "tricky",
          q: "Can you achieve strong consistency in a distributed system? What's the cost?",
          a: "**Yes**, using consensus protocols (Raft, Paxos) or synchronous replication. Examples: CockroachDB, Google Spanner.\n\n**The cost**:\n1. **Higher latency**: Every write must be acknowledged by a majority of nodes. Cross-region writes take 100-300ms.\n2. **Lower throughput**: Consensus limits write capacity (all writes serialized through leader)\n3. **Reduced availability**: If majority of nodes are down, writes are rejected\n\n**Google Spanner's approach**: Uses TrueTime (atomic clocks + GPS) to achieve strong consistency with lower latency. But this requires custom hardware — not available for most companies.\n\n**Practical compromise**: Use strong consistency only where needed (financial transactions) and eventual consistency everywhere else.",
        },
      ],
    },
    {
      id: "sd-consistency-models",
      title: "Consistency Models & ACID vs BASE",
      explanation: `Understanding different consistency models is crucial for making informed design decisions.

## Consistency Spectrum

From strongest to weakest:

| Model | Guarantee | Latency | Example |
|-------|-----------|---------|---------|
| **Linearizability** | Reads see the latest write globally | Highest | Single-leader DB, ZooKeeper |
| **Sequential** | All clients see operations in same order | High | Replicated state machines |
| **Causal** | Operations that are causally related are seen in order | Medium | Social media comments |
| **Eventual** | All replicas converge to same state eventually | Lowest | DNS, Cassandra |

## ACID vs BASE

### ACID (Traditional SQL)
- **Atomicity**: Transaction is all-or-nothing
- **Consistency**: Data satisfies all constraints
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed data survives crashes

### BASE (Distributed NoSQL)
- **Basically Available**: System guarantees availability
- **Soft state**: State may change without input (due to replication)
- **Eventually consistent**: System becomes consistent over time

| Aspect | ACID | BASE |
|--------|------|------|
| Focus | Correctness | Availability |
| Scale | Vertical primarily | Horizontal |
| Use case | Banking, inventory | Social media, caching |
| Trade-off | Lower throughput | Possible stale reads |

## Eventual Consistency Patterns

### Read-Your-Own-Writes
After writing, the same user always sees their own write (others may see stale data temporarily).

### Monotonic Reads
A user never sees older data after seeing newer data (prevents "time travel").

### Causal Consistency
If operation B was caused by operation A, everyone sees A before B.

> **Key insight**: Most applications don't need linearizability everywhere. Use strong consistency for critical operations (payments) and eventual consistency for everything else. This gives you the best of both worlds.`,
      codeExample: `// ============================================
// Consistency Models — Practical Examples
// ============================================

// ---------- Eventual Consistency with Conflict Resolution ----------

class EventuallyConsistentStore {
  constructor() {
    this.replicas = [new Map(), new Map(), new Map()];
    this.vectorClocks = new Map();
  }

  // Write to one replica, async replicate
  async write(key, value) {
    const version = this.incrementVersion(key);
    const entry = { value, version, timestamp: Date.now() };

    // Write to first available replica
    this.replicas[0].set(key, entry);
    console.log(\`Written \\\${key} = \\\${value} (version: \\\${version})\`);

    // Async replication (may be delayed)
    setTimeout(() => {
      this.replicas[1].set(key, entry);
      this.replicas[2].set(key, entry);
      console.log(\`Replicated \\\${key} to all replicas\`);
    }, Math.random() * 2000);
  }

  // Read from any replica (may be stale!)
  async read(key, replicaIndex = Math.floor(Math.random() * 3)) {
    const entry = this.replicas[replicaIndex].get(key);
    if (!entry) return null;
    console.log(\`Read \\\${key} from replica \\\${replicaIndex}: \\\${entry.value}\`);
    return entry.value;
  }

  // Last-Writer-Wins (LWW) conflict resolution
  resolveConflict(entry1, entry2) {
    return entry1.timestamp > entry2.timestamp ? entry1 : entry2;
  }

  incrementVersion(key) {
    const current = this.vectorClocks.get(key) || 0;
    this.vectorClocks.set(key, current + 1);
    return current + 1;
  }
}

// ---------- Read-Your-Own-Writes Consistency ----------
class ReadYourOwnWritesRouter {
  constructor(primary, replicas) {
    this.primary = primary;
    this.replicas = replicas;
    this.recentWrites = new Map();
  }

  async write(userId, key, value) {
    await this.primary.write(key, value);
    this.recentWrites.set(\`\\\${userId}:\\\${key}\`, Date.now());
  }

  async read(userId, key) {
    const recentWrite = this.recentWrites.get(\`\\\${userId}:\\\${key}\`);

    if (recentWrite && Date.now() - recentWrite < 5000) {
      // User wrote recently — read from primary (guaranteed fresh)
      return await this.primary.read(key);
    }

    // No recent write — safe to read from replica (faster)
    const replicaIndex = Math.floor(Math.random() * this.replicas.length);
    return await this.replicas[replicaIndex].read(key);
  }
}

// ---------- Causal Consistency with Version Vectors ----------
class CausalStore {
  constructor(nodeId) {
    this.nodeId = nodeId;
    this.data = new Map();
    this.vectorClock = {};
  }

  write(key, value, dependsOn = null) {
    // Increment our node's clock
    this.vectorClock[this.nodeId] = (this.vectorClock[this.nodeId] || 0) + 1;

    this.data.set(key, {
      value,
      vectorClock: { ...this.vectorClock },
      dependsOn,
    });

    return { ...this.vectorClock };
  }

  read(key) {
    return this.data.get(key);
  }

  // Check if operation A happened before operation B
  happenedBefore(clockA, clockB) {
    return Object.keys(clockA).every(
      node => (clockA[node] || 0) <= (clockB[node] || 0)
    ) && Object.keys(clockA).some(
      node => (clockA[node] || 0) < (clockB[node] || 0)
    );
  }
}

// Demo
const store = new EventuallyConsistentStore();
store.write('user:123', 'Alice');
store.read('user:123', 0); // Replica 0: "Alice"
store.read('user:123', 1); // Replica 1: might be null (not yet replicated!)

const causal = new CausalStore('node-1');
const v1 = causal.write('post', 'Hello World');
causal.write('comment', 'Nice post!', v1); // Depends on the post
console.log('Causal order preserved via vector clock');`,
      exercise: `1. **Consistency Level Selection**: For each feature of a social media app, choose the appropriate consistency model (linearizable, causal, eventual) and justify: (a) posting a tweet, (b) viewing a timeline, (c) following a user, (d) sending a direct message, (e) counting likes.

2. **Conflict Resolution**: Two users simultaneously update the same document (Google Docs scenario). Design three conflict resolution strategies: last-writer-wins, merge, and operational transform.

3. **Vector Clocks**: Implement vector clocks for a 3-node system. Demonstrate how they detect concurrent writes vs causal writes.

4. **ACID Transaction Design**: Design the database transactions for an e-commerce checkout: reserve inventory → charge payment → create order. What isolation level do you need? How do you handle partial failures?`,
      commonMistakes: [
        "Assuming 'eventual' means 'soon' — eventual consistency could mean milliseconds or minutes, depending on the system. Always understand the expected convergence time for your system.",
        "Not specifying which consistency model when designing — saying 'the system is consistent' is meaningless. Specify: linearizable, causal, or eventual, and explain why.",
        "Using strong consistency everywhere 'to be safe' — strong consistency at scale requires consensus protocols, which add significant latency and reduce throughput. Most data doesn't need it.",
        "Ignoring conflict resolution — in AP systems with eventual consistency, concurrent writes WILL conflict. You need a strategy: last-writer-wins, merge, or application-level resolution.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the different consistency models and when do you use each?",
          a: "**Linearizable (strongest)**: Every read sees the absolute latest write. Use for: bank balances, inventory during checkout, user auth.\n\n**Causal**: Causally related operations are ordered (post before its comments). Use for: messaging, social media feeds, collaborative editing.\n\n**Eventual (weakest)**: All replicas converge eventually. Use for: view counters, search indexes, recommendations, caches.\n\n**Rule of thumb**: Start with eventual consistency (cheapest, fastest). Add stronger guarantees only where business logic requires it. Most systems need strong consistency for < 10% of their data.",
        },
        {
          type: "scenario",
          q: "A user adds an item to their shopping cart, but when they view the cart, the item isn't there. Diagnose and fix.",
          a: "**Diagnosis**: Classic **read-your-own-write** inconsistency.\n1. User writes 'add item' → goes to primary DB\n2. User views cart → read goes to replica\n3. Replica hasn't received the write yet → shows empty cart\n\n**Fixes** (in order of preference):\n1. **Session-based routing**: After a write, route that user's reads to the primary for 5 seconds\n2. **Optimistic UI**: Update the UI immediately on write, before server confirmation\n3. **Version checking**: Include a version number in write response; on read, if replica version is older, redirect to primary\n4. **Sticky sessions**: Route a user to the same replica always (but reduces LB effectiveness)\n\n**For shopping cart specifically**: Use DynamoDB with strong consistency reads for cart operations, or store the cart in Redis for single-node consistency.",
        },
      ],
    },
  ],
};

export default sdPhase8;
