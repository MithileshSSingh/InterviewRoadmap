const pyPhase14 = {
  id: "phase-14",
  title: "Phase 14: Interview Preparation & Career Growth",
  emoji: "🎯",
  description:
    "Prepare for Python developer interviews — common patterns, system design, coding challenges, and career specialization paths.",
  topics: [
    {
      id: "py-interview-patterns",
      title: "Python Interview Patterns",
      explanation: `Mastering Python interview patterns is about recognizing **recurring problem structures** and applying the right algorithmic technique efficiently. Interviewers evaluate not just correctness but your ability to communicate, analyze complexity, and leverage Python-specific features.

**Core coding patterns every Python developer should know:**

| Pattern | When to Use | Python Advantage |
|---|---|---|
| **Two Pointers** | Sorted arrays, palindrome checks | Slicing syntax, \`reversed()\` |
| **Sliding Window** | Subarray/substring problems | \`collections.deque\`, slicing |
| **Hash Map Counting** | Frequency, anagram, two-sum | \`collections.Counter\`, \`defaultdict\` |
| **Stack/Queue** | Parentheses matching, BFS/DFS | \`list\` as stack, \`deque\` as queue |
| **Binary Search** | Sorted data, search space reduction | \`bisect\` module |
| **Dynamic Programming** | Overlapping subproblems, optimal substructure | \`functools.lru_cache\` for top-down memoization |
| **Backtracking** | Permutations, combinations, constraint satisfaction | Generators with \`yield\` |
| **Graph Traversal** | Connected components, shortest paths | \`defaultdict(list)\` adjacency lists |

**Whiteboard and live-coding strategies:**
- **Clarify first** — restate the problem, ask about edge cases, confirm input/output types
- **Brute force then optimize** — always start with a working O(n^2) solution before jumping to O(n)
- **Talk through your thought process** — interviewers want to see how you reason, not just the final code
- **Test with examples** — walk through your code with the given example and an edge case

**Python-specific tricks that impress interviewers:**
- Use \`enumerate()\` instead of manual index tracking
- Leverage \`zip()\` for parallel iteration
- Apply \`collections.Counter\` for frequency problems instead of manual dictionaries
- Use \`itertools\` for combinatorial problems (\`permutations\`, \`combinations\`, \`product\`)
- Apply \`functools.lru_cache\` to convert recursive solutions into memoized DP with one decorator
- Use tuple unpacking and multiple assignment for clean swaps: \`a, b = b, a\`

**Time and space complexity analysis** is mandatory. Always state the Big-O for both before and after optimization. Be prepared to justify why your approach is optimal or discuss trade-offs between time and space.`,
      codeExample: `# ============================================================
# Python Interview Patterns — Common Solutions
# ============================================================
from collections import Counter, defaultdict, deque
from functools import lru_cache
import bisect


# --- Pattern 1: Two Pointers ---
def two_sum_sorted(nums, target):
    """Find two numbers in a SORTED array that sum to target. O(n) time."""
    left, right = 0, len(nums) - 1
    while left < right:
        current_sum = nums[left] + nums[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return []


def is_palindrome(s):
    """Check if string is a palindrome (ignoring non-alphanumeric). O(n)."""
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]


# --- Pattern 2: Sliding Window ---
def max_sum_subarray(nums, k):
    """Maximum sum of any contiguous subarray of size k. O(n)."""
    if len(nums) < k:
        return 0
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]  # slide the window
        max_sum = max(max_sum, window_sum)
    return max_sum


def longest_unique_substring(s):
    """Length of longest substring without repeating chars. O(n)."""
    char_index = {}
    max_len = 0
    start = 0
    for end, char in enumerate(s):
        if char in char_index and char_index[char] >= start:
            start = char_index[char] + 1
        char_index[char] = end
        max_len = max(max_len, end - start + 1)
    return max_len


# --- Pattern 3: Hash Map / Counter ---
def group_anagrams(strs):
    """Group anagrams together using sorted-key hashing. O(n * k log k)."""
    groups = defaultdict(list)
    for word in strs:
        key = tuple(sorted(word))
        groups[key].append(word)
    return list(groups.values())


def top_k_frequent(nums, k):
    """Return k most frequent elements. O(n) with bucket sort."""
    count = Counter(nums)
    # Bucket sort: index = frequency, value = list of nums with that freq
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, freq in count.items():
        buckets[freq].append(num)
    result = []
    for freq in range(len(buckets) - 1, 0, -1):
        for num in buckets[freq]:
            result.append(num)
            if len(result) == k:
                return result
    return result


# --- Pattern 4: Stack ---
def valid_parentheses(s):
    """Check if parentheses are balanced. O(n) time, O(n) space."""
    stack = []
    pairs = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in "({[":
            stack.append(char)
        elif char in pairs:
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    return len(stack) == 0


# --- Pattern 5: Dynamic Programming with lru_cache ---
@lru_cache(maxsize=None)
def climb_stairs(n):
    """Number of ways to climb n stairs (1 or 2 steps). O(n) with memo."""
    if n <= 2:
        return n
    return climb_stairs(n - 1) + climb_stairs(n - 2)


@lru_cache(maxsize=None)
def longest_common_subsequence(text1, text2, i=0, j=0):
    """LCS length using top-down DP with memoization."""
    if i >= len(text1) or j >= len(text2):
        return 0
    if text1[i] == text2[j]:
        return 1 + longest_common_subsequence(text1, text2, i + 1, j + 1)
    return max(
        longest_common_subsequence(text1, text2, i + 1, j),
        longest_common_subsequence(text1, text2, i, j + 1),
    )


# --- Pattern 6: BFS / Graph Traversal ---
def num_islands(grid):
    """Count islands in a 2D grid using BFS. O(m*n)."""
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    visited = set()
    islands = 0

    def bfs(r, c):
        queue = deque([(r, c)])
        visited.add((r, c))
        while queue:
            row, col = queue.popleft()
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nr, nc = row + dr, col + dc
                if (0 <= nr < rows and 0 <= nc < cols
                        and (nr, nc) not in visited
                        and grid[nr][nc] == "1"):
                    visited.add((nr, nc))
                    queue.append((nr, nc))

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in visited:
                bfs(r, c)
                islands += 1
    return islands


# --- Pattern 7: Binary Search ---
def search_insert_position(nums, target):
    """Find insert position for target in sorted array. O(log n)."""
    return bisect.bisect_left(nums, target)


def find_first_and_last(nums, target):
    """Find first and last index of target in sorted array. O(log n)."""
    left = bisect.bisect_left(nums, target)
    right = bisect.bisect_right(nums, target) - 1
    if left <= right and left < len(nums) and nums[left] == target:
        return [left, right]
    return [-1, -1]


# --- Quick demo ---
if __name__ == "__main__":
    print(two_sum_sorted([1, 3, 5, 7, 11], 12))  # [1, 4]
    print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
    print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))  # [1, 2]
    print(valid_parentheses("({[]})"))  # True
    print(climb_stairs(10))  # 89
    print(longest_unique_substring("abcabcbb"))  # 3`,
      exercise: `**Exercises:**

1. Implement a \`three_sum(nums, target)\` function that finds all unique triplets summing to target. Use the two-pointer pattern after sorting. Ensure no duplicate triplets in the output. Analyze time complexity.

2. Solve the "minimum window substring" problem using the sliding window pattern: given strings \`s\` and \`t\`, find the smallest window in \`s\` that contains all characters of \`t\`. Use \`Counter\` for character tracking.

3. Build a \`LRU Cache\` class using \`collections.OrderedDict\` that supports \`get(key)\` and \`put(key, value)\` in O(1) time. Write at least 6 test cases covering eviction, updates, and edge cases.

4. Solve "course schedule" (topological sort): given \`n\` courses and prerequisite pairs, determine if all courses can be finished. Implement both DFS (cycle detection) and BFS (Kahn's algorithm) solutions. Compare their approaches.

5. Implement a bottom-up DP solution for the "coin change" problem: given denominations and an amount, find the minimum number of coins. Then convert it to a top-down solution using \`@lru_cache\`. Compare both approaches.

6. Create a timed coding challenge script: pick 3 problems from the patterns above, set a 45-minute timer, solve them, then review your solutions for correctness, edge cases, and complexity. Record your solve times and track improvement over sessions.`,
      commonMistakes: [
        "Jumping into coding without clarifying the problem first. Always ask about input constraints, edge cases (empty input, single element, negative numbers), and expected output format before writing a single line.",
        "Ignoring Python's standard library — writing manual frequency counters instead of using `collections.Counter`, implementing binary search from scratch instead of using `bisect`, or building permutations manually instead of using `itertools.permutations`.",
        "Forgetting to analyze and communicate time/space complexity. Interviewers expect you to state Big-O before and after optimization. Saying 'it runs fast' is not an answer — say 'O(n log n) time, O(n) space' explicitly.",
        "Using `list.index()` or `in` on lists inside loops, creating hidden O(n^2) complexity. Convert to a `set` or `dict` for O(1) lookups when checking membership repeatedly.",
        "Not testing edge cases: empty arrays, single-element inputs, all duplicates, already sorted data, and maximum constraints. Many interview failures come from off-by-one errors or unhandled boundary conditions.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When would you choose a hash map approach over sorting for a problem like two-sum? What are the trade-offs?",
          a: "**Hash map approach** (unsorted input): O(n) time, O(n) space — iterate once, storing complements in a dict. **Sorting + two pointers** (or if already sorted): O(n log n) time, O(1) space. **Trade-offs:** Hash map is faster but uses more memory. If the array is already sorted, two pointers is clearly better. If you need indices of original positions, sorting destroys them (unless you store them), making the hash map approach simpler. In interviews, start with the hash map for unsorted arrays since it's O(n), then mention the sorting alternative and discuss when each is preferable.",
        },
        {
          type: "coding",
          q: "Implement a function that finds the longest palindromic substring in a string using the expand-around-center technique.",
          a: `\`\`\`python
def longest_palindrome(s):
    if not s:
        return ""
    start, max_len = 0, 1

    def expand(left, right):
        nonlocal start, max_len
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if right - left + 1 > max_len:
                start = left
                max_len = right - left + 1
            left -= 1
            right += 1

    for i in range(len(s)):
        expand(i, i)      # odd-length palindromes
        expand(i, i + 1)  # even-length palindromes
    return s[start:start + max_len]

# Test
assert longest_palindrome("babad") in ("bab", "aba")
assert longest_palindrome("cbbd") == "bb"
assert longest_palindrome("a") == "a"
# Time: O(n^2), Space: O(1)
\`\`\``,
        },
        {
          type: "scenario",
          q: "You are given a coding challenge in an interview that you have never seen before. Walk through your problem-solving approach step by step.",
          a: "1) **Understand** — Read the problem twice. Restate it in your own words. Ask clarifying questions: input size, types, edge cases, whether input is sorted, can there be duplicates? 2) **Examples** — Work through 2-3 examples by hand, including an edge case (empty input, single element). 3) **Pattern match** — Identify which pattern applies: does it involve subarrays (sliding window)? Sorted data (binary search/two pointers)? Counting (hash map)? Optimal substructure (DP)? 4) **Brute force first** — Describe the naive O(n^2) or O(2^n) approach. State its complexity. 5) **Optimize** — Apply the identified pattern to reduce complexity. Explain the optimization verbally. 6) **Code** — Write clean Python, using descriptive variable names. Use built-in functions where appropriate. 7) **Test** — Trace through your code with the examples. Check edge cases. 8) **Complexity** — State final time and space complexity.",
        },
      ],
    },
    {
      id: "py-system-design",
      title: "System Design with Python",
      explanation: `System design interviews assess your ability to architect **scalable, reliable, and maintainable** distributed systems. Python plays a significant role in backend services, data pipelines, and microservice architectures — understanding how to design systems with Python tooling is essential for senior-level interviews.

**Key system design components and Python ecosystem:**

| Component | Python Tools | Purpose |
|---|---|---|
| **Web Framework** | FastAPI, Django, Flask | HTTP API layer |
| **Task Queue** | Celery, Dramatiq, Huey | Async background processing |
| **Message Broker** | RabbitMQ (\`pika\`), Redis (\`redis-py\`), Kafka (\`confluent-kafka\`) | Decoupling services |
| **Caching** | Redis (\`redis-py\`), \`functools.lru_cache\`, Memcached | Reduce latency and DB load |
| **Database** | SQLAlchemy, Django ORM, Tortoise ORM | Relational data access |
| **Search** | Elasticsearch (\`elasticsearch-py\`) | Full-text search |
| **Monitoring** | Prometheus (\`prometheus-client\`), Sentry, OpenTelemetry | Observability |

**Microservices architecture with Python:**
- **Service decomposition** — break monoliths into domain-bounded services (user service, order service, notification service)
- **API Gateway** — use Kong, Traefik, or a custom FastAPI gateway to route, authenticate, and rate-limit requests
- **Inter-service communication** — synchronous (HTTP/gRPC) vs asynchronous (message queues). Prefer async for non-blocking workflows
- **Service discovery** — Consul, etcd, or Kubernetes DNS for locating service instances dynamically

**Caching strategies:**
- **Cache-aside (lazy loading)** — application checks cache first, populates on miss
- **Write-through** — write to cache and DB simultaneously
- **Write-behind** — write to cache immediately, flush to DB asynchronously
- **TTL-based expiry** — set expiration to prevent stale data

**Load balancing and horizontal scaling:**
- Run multiple instances of a Python service behind Nginx or HAProxy
- Use Gunicorn with multiple workers (\`gunicorn -w 4\`) or Uvicorn for async FastAPI
- Stateless services scale horizontally — store session data in Redis, not in-process memory

**Python in distributed systems** leverages \`asyncio\` for high-concurrency I/O-bound services, Celery for distributed task processing, and gRPC (\`grpcio\`) for efficient inter-service communication with Protocol Buffers.`,
      codeExample: `# ============================================================
# System Design Components in Python
# ============================================================
import asyncio
import hashlib
import json
import time
from collections import OrderedDict
from dataclasses import dataclass, field
from typing import Any, Optional
from enum import Enum


# --- Component 1: LRU Cache with TTL (Cache-Aside Pattern) ---
class TTLCache:
    """Thread-safe LRU cache with per-key TTL expiration."""

    def __init__(self, capacity=1000, default_ttl=300):
        self.capacity = capacity
        self.default_ttl = default_ttl
        self._cache = OrderedDict()  # key -> (value, expire_at)

    def get(self, key):
        """Cache-aside read: returns value or None if miss/expired."""
        if key not in self._cache:
            return None
        value, expire_at = self._cache[key]
        if time.time() > expire_at:
            del self._cache[key]  # expired
            return None
        # Move to end (most recently used)
        self._cache.move_to_end(key)
        return value

    def set(self, key, value, ttl=None):
        """Set key with optional custom TTL."""
        ttl = ttl or self.default_ttl
        if key in self._cache:
            self._cache.move_to_end(key)
        self._cache[key] = (value, time.time() + ttl)
        if len(self._cache) > self.capacity:
            self._cache.popitem(last=False)  # evict LRU

    def invalidate(self, key):
        """Explicit cache invalidation."""
        self._cache.pop(key, None)

    def stats(self):
        """Return cache statistics."""
        now = time.time()
        active = sum(1 for _, (_, exp) in self._cache.items() if exp > now)
        return {"total_keys": len(self._cache), "active_keys": active}


# --- Component 2: Consistent Hashing (Load Balancing) ---
class ConsistentHashRing:
    """Consistent hashing for distributing keys across server nodes."""

    def __init__(self, replicas=150):
        self.replicas = replicas
        self.ring = {}       # hash -> node name
        self.sorted_keys = []

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_node(self, node):
        """Add a server node with virtual replicas."""
        for i in range(self.replicas):
            virtual_key = f"{node}:replica-{i}"
            h = self._hash(virtual_key)
            self.ring[h] = node
            self.sorted_keys.append(h)
        self.sorted_keys.sort()

    def remove_node(self, node):
        """Remove a node and all its replicas."""
        for i in range(self.replicas):
            virtual_key = f"{node}:replica-{i}"
            h = self._hash(virtual_key)
            self.ring.pop(h, None)
            if h in self.sorted_keys:
                self.sorted_keys.remove(h)

    def get_node(self, key):
        """Find which node a key maps to."""
        if not self.ring:
            return None
        h = self._hash(key)
        for ring_key in self.sorted_keys:
            if h <= ring_key:
                return self.ring[ring_key]
        return self.ring[self.sorted_keys[0]]  # wrap around


# --- Component 3: Rate Limiter (Token Bucket) ---
class TokenBucketRateLimiter:
    """Per-client rate limiting using the token bucket algorithm."""

    def __init__(self, capacity=10, refill_rate=1.0):
        self.capacity = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.buckets = {}  # client_id -> (tokens, last_refill)

    def allow_request(self, client_id):
        """Check if a request from client_id should be allowed."""
        now = time.time()
        if client_id not in self.buckets:
            self.buckets[client_id] = (self.capacity - 1, now)
            return True

        tokens, last_refill = self.buckets[client_id]
        # Refill tokens based on elapsed time
        elapsed = now - last_refill
        tokens = min(self.capacity, tokens + elapsed * self.refill_rate)

        if tokens >= 1:
            self.buckets[client_id] = (tokens - 1, now)
            return True
        else:
            self.buckets[client_id] = (tokens, now)
            return False


# --- Component 4: Simple Message Queue (Producer/Consumer) ---
class MessageQueue:
    """In-memory message queue with topic-based pub/sub."""

    def __init__(self):
        self.topics = {}      # topic -> deque of messages
        self.subscribers = {} # topic -> list of callback functions

    def create_topic(self, topic):
        if topic not in self.topics:
            self.topics[topic] = []
            self.subscribers[topic] = []

    def publish(self, topic, message):
        """Publish a message to a topic."""
        if topic not in self.topics:
            self.create_topic(topic)
        envelope = {
            "id": hashlib.sha256(
                f"{topic}-{time.time()}".encode()
            ).hexdigest()[:12],
            "topic": topic,
            "payload": message,
            "timestamp": time.time(),
        }
        self.topics[topic].append(envelope)
        # Notify subscribers
        for callback in self.subscribers[topic]:
            callback(envelope)
        return envelope["id"]

    def subscribe(self, topic, callback):
        """Register a callback for messages on a topic."""
        if topic not in self.subscribers:
            self.create_topic(topic)
        self.subscribers[topic].append(callback)

    def consume(self, topic, count=1):
        """Pull messages from a topic (destructive read)."""
        if topic not in self.topics:
            return []
        messages = self.topics[topic][:count]
        self.topics[topic] = self.topics[topic][count:]
        return messages


# --- Component 5: Circuit Breaker Pattern ---
class CircuitState(Enum):
    CLOSED = "closed"        # normal operation
    OPEN = "open"            # failing, reject requests
    HALF_OPEN = "half_open"  # testing if service recovered


class CircuitBreaker:
    """Prevent cascading failures in microservice communication."""

    def __init__(self, failure_threshold=5, recovery_timeout=30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0

    def call(self, func, *args, **kwargs):
        """Execute function through the circuit breaker."""
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN — request rejected")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e

    def _on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN


# --- Demo ---
if __name__ == "__main__":
    # Cache demo
    cache = TTLCache(capacity=3, default_ttl=10)
    cache.set("user:1", {"name": "Alice"})
    print(cache.get("user:1"))  # {'name': 'Alice'}
    print(cache.stats())

    # Consistent hashing demo
    ring = ConsistentHashRing()
    for node in ["server-a", "server-b", "server-c"]:
        ring.add_node(node)
    for key in ["user:100", "user:200", "order:500"]:
        print(f"{key} -> {ring.get_node(key)}")

    # Rate limiter demo
    limiter = TokenBucketRateLimiter(capacity=3, refill_rate=1.0)
    for i in range(5):
        print(f"Request {i+1}: {limiter.allow_request('client-1')}")`,
      exercise: `**Exercises:**

1. Design a **URL shortener** service: implement the core logic with a \`URLShortener\` class that generates short codes (base62 encoding), stores mappings in a dict (simulating Redis), handles collisions, and tracks click analytics. Include methods for \`shorten(url)\`, \`resolve(short_code)\`, and \`get_stats(short_code)\`.

2. Extend the \`TTLCache\` to support **write-through** and **write-behind** strategies. For write-through, accept a \`persist_fn\` callback that writes to a simulated database on every \`set()\`. For write-behind, batch writes and flush every N seconds using a background thread.

3. Implement a **distributed task queue** simulator: create \`TaskProducer\` and \`TaskWorker\` classes. Producers enqueue tasks with priorities. Workers pull from the queue using the \`ConsistentHashRing\` to assign tasks to specific workers. Add retry logic with exponential backoff for failed tasks.

4. Build a **rate limiter middleware** for a FastAPI application using the sliding window log algorithm. Store request timestamps per client IP in a dict. Return HTTP 429 when the limit is exceeded. Write tests that simulate burst traffic.

5. Design a **notification system**: implement \`NotificationService\` that supports email, SMS, and push channels. Use the message queue pattern with topic-based routing. Add the circuit breaker pattern for each external provider so one failing provider does not block others.`,
      commonMistakes: [
        "Designing everything as synchronous request-response. Many operations (sending emails, processing images, generating reports) should be offloaded to background task queues like Celery to keep API response times fast.",
        "Ignoring caching — hitting the database on every request for data that rarely changes. Apply cache-aside with TTL for frequently read, rarely written data like user profiles, product catalogs, or configuration.",
        "Using Python's Global Interpreter Lock (GIL) as an excuse to avoid concurrency. The GIL only affects CPU-bound threads. For I/O-bound work (HTTP calls, DB queries, file reads), `asyncio` or multi-threading provides significant speedups.",
        "Not considering failure modes in distributed systems. Every network call can fail — implement retries with exponential backoff, circuit breakers for downstream services, and timeouts on all external requests.",
        "Storing session state in application memory, which breaks horizontal scaling. Use Redis or a database for shared state so any instance can handle any request.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the differences between synchronous HTTP calls and asynchronous message queues for inter-service communication. When would you choose each?",
          a: "**Synchronous HTTP** (REST/gRPC): The caller waits for a response. Use when you need an immediate result (e.g., user authentication, fetching data for a page render). **Pros:** Simple, easy to debug, request-response is intuitive. **Cons:** Tight coupling, caller blocks if downstream is slow, cascading failures. **Asynchronous message queues** (RabbitMQ, Kafka, SQS): The producer sends a message and continues without waiting. A consumer processes it later. Use for fire-and-forget workflows (email sending, log processing, order fulfillment). **Pros:** Decoupled services, built-in buffering during traffic spikes, consumer can process at its own pace. **Cons:** Eventual consistency, harder to debug, need to handle message ordering and idempotency. **Rule of thumb:** If the user is waiting for the result, use sync. If the work can happen in the background, use async messaging.",
        },
        {
          type: "scenario",
          q: "You need to design a Python service that handles 10,000 requests per second. How would you architect it?",
          a: "1) **Framework choice:** FastAPI with Uvicorn (ASGI) for async I/O handling — significantly better throughput than Flask for I/O-bound workloads. 2) **Horizontal scaling:** Run multiple Uvicorn workers behind Nginx or a load balancer. Use Kubernetes for auto-scaling based on CPU/request metrics. 3) **Caching layer:** Redis cache for hot data — cache database queries with TTL to reduce DB load by 80-90%. 4) **Database optimization:** Connection pooling (SQLAlchemy with `pool_size=20`), read replicas for read-heavy loads, database indexing on frequently queried columns. 5) **Async processing:** Offload non-critical work to Celery with Redis broker. API returns 202 Accepted for background tasks. 6) **Rate limiting:** Token bucket per client at the API gateway level to prevent abuse. 7) **Monitoring:** Prometheus metrics + Grafana dashboards for latency percentiles (p50, p95, p99), error rates, and throughput. 8) **Connection management:** Keep-alive connections, connection pooling for downstream services, circuit breakers to prevent cascading failures.",
        },
        {
          type: "coding",
          q: "Implement a simple in-memory key-value store with expiration support, similar to a basic Redis.",
          a: `\`\`\`python
import time
import threading


class MiniRedis:
    def __init__(self):
        self._store = {}  # key -> (value, expire_at or None)
        self._lock = threading.Lock()

    def set(self, key, value, ex=None):
        """Set key with optional expiration in seconds."""
        with self._lock:
            expire_at = time.time() + ex if ex else None
            self._store[key] = (value, expire_at)

    def get(self, key):
        with self._lock:
            if key not in self._store:
                return None
            value, expire_at = self._store[key]
            if expire_at and time.time() > expire_at:
                del self._store[key]
                return None
            return value

    def delete(self, key):
        with self._lock:
            return self._store.pop(key, None) is not None

    def ttl(self, key):
        """Remaining time-to-live in seconds, -1 if no expiry."""
        with self._lock:
            if key not in self._store:
                return -2  # key does not exist
            _, expire_at = self._store[key]
            if expire_at is None:
                return -1
            remaining = expire_at - time.time()
            return max(0, int(remaining))

# Usage
store = MiniRedis()
store.set("session:abc", "user-42", ex=60)
print(store.get("session:abc"))  # "user-42"
print(store.ttl("session:abc"))  # ~60
\`\`\``,
        },
      ],
    },
    {
      id: "py-career-growth",
      title: "Career Growth & Specializations",
      explanation: `The Python ecosystem spans an extraordinary range of career paths. Choosing a **specialization** while maintaining broad fundamentals is key to career growth. Each path has distinct skill requirements, tools, and interview expectations.

**Major Python career specializations:**

| Path | Core Skills | Key Libraries/Tools | Typical Roles |
|---|---|---|---|
| **Backend Engineering** | APIs, databases, system design, DevOps | FastAPI, Django, PostgreSQL, Redis, Docker | Backend Developer, SRE, Platform Engineer |
| **Data Science** | Statistics, data wrangling, visualization, ML basics | Pandas, NumPy, Matplotlib, Jupyter, SQL | Data Analyst, Data Scientist, BI Engineer |
| **Machine Learning / AI** | Linear algebra, deep learning, MLOps | PyTorch, TensorFlow, scikit-learn, MLflow | ML Engineer, Research Scientist, AI Engineer |
| **DevOps / Infrastructure** | CI/CD, containers, IaC, monitoring | Ansible, Terraform, Docker, Kubernetes, Boto3 | DevOps Engineer, Cloud Engineer, SRE |
| **Security** | Penetration testing, cryptography, automation | Scapy, Burp extensions, Cryptography lib | Security Engineer, Pentester |

**Building a strong portfolio:**
- **GitHub presence** — maintain 3-5 polished projects with clear READMEs, tests, and CI/CD. Quality over quantity
- **Open source contributions** — start with documentation fixes, then small bug fixes, then feature PRs. Target projects you actually use
- **Technical blog** — write about problems you solved. Explaining concepts reinforces understanding and demonstrates communication skills
- **Side projects** — build something that solves a real problem. A deployed application beats 100 toy scripts

**Interview preparation by specialization:**
- **Backend:** System design (URL shortener, chat system), REST API design, database modeling, SQL optimization, concurrency
- **Data Science:** Statistics fundamentals, A/B testing, pandas manipulation challenges, SQL window functions, experiment design
- **ML Engineering:** Model training pipelines, feature engineering, evaluation metrics, MLOps (model versioning, serving, monitoring)
- **DevOps:** Infrastructure design, CI/CD pipeline setup, container orchestration, incident response, monitoring strategies

**Career progression patterns:**
- **Junior (0-2 years):** Write features, fix bugs, learn codebase, write tests. Focus on one specialization
- **Mid-level (2-5 years):** Own components, mentor juniors, make design decisions, lead small projects
- **Senior (5+ years):** Architect systems, set technical direction, cross-team impact, unblock others, evaluate trade-offs
- **Staff+ (7+ years):** Org-wide technical strategy, influence company direction, build platforms that multiply team productivity

The most important career advice: **depth in one area plus breadth across adjacent areas** creates the most valuable engineers. A backend developer who understands data pipelines, or a data scientist who can deploy their own models, is far more impactful than a narrow specialist.`,
      codeExample: `# ============================================================
# Career Growth: Portfolio-Grade Python Project Patterns
# ============================================================
# This demonstrates professional code structure, typing,
# documentation, error handling, and testing patterns that
# employers look for in a portfolio project.
# ============================================================
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Protocol
from abc import ABC, abstractmethod
import logging


# --- Professional logging setup ---
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


# --- Domain models with type hints and validation ---
class SkillLevel(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


@dataclass
class Skill:
    name: str
    level: SkillLevel
    years_experience: float

    def __post_init__(self):
        if self.years_experience < 0:
            raise ValueError("Years of experience cannot be negative")


@dataclass
class CareerProfile:
    name: str
    title: str
    specialization: str
    skills: list[Skill] = field(default_factory=list)
    goals: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

    @property
    def skill_summary(self) -> dict[str, int]:
        """Count skills by level."""
        summary = {}
        for skill in self.skills:
            level = skill.level.value
            summary[level] = summary.get(level, 0) + 1
        return summary

    def add_skill(self, name: str, level: SkillLevel, years: float):
        """Add a skill with validation."""
        if any(s.name.lower() == name.lower() for s in self.skills):
            raise ValueError(f"Skill '{name}' already exists")
        self.skills.append(Skill(name, level, years))
        logger.info(f"Added skill: {name} ({level.value})")

    def get_growth_areas(self) -> list[str]:
        """Identify skills that need improvement."""
        return [
            s.name for s in self.skills
            if s.level in (SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE)
        ]


# --- Strategy Pattern for career path recommendations ---
class CareerStrategy(Protocol):
    """Protocol (structural typing) for career strategies."""

    def recommend_skills(self, profile: CareerProfile) -> list[str]:
        ...

    def recommend_projects(self, profile: CareerProfile) -> list[str]:
        ...

    def get_interview_topics(self) -> list[str]:
        ...


class BackendStrategy:
    """Career strategy for backend engineering path."""

    def recommend_skills(self, profile: CareerProfile) -> list[str]:
        core = [
            "FastAPI / Django REST Framework",
            "PostgreSQL + query optimization",
            "Redis caching strategies",
            "Docker + Kubernetes basics",
            "System design patterns",
            "API security (OAuth2, JWT)",
        ]
        existing = {s.name.lower() for s in profile.skills}
        return [s for s in core if s.lower() not in existing]

    def recommend_projects(self, profile: CareerProfile) -> list[str]:
        return [
            "REST API with auth, rate limiting, and pagination",
            "Real-time chat service with WebSockets",
            "Task queue system with Celery and Redis",
            "Microservice with Docker Compose deployment",
        ]

    def get_interview_topics(self) -> list[str]:
        return [
            "Design a URL shortener",
            "Design a rate limiter",
            "REST vs GraphQL trade-offs",
            "Database indexing and query optimization",
            "Caching strategies (cache-aside, write-through)",
            "Horizontal vs vertical scaling",
        ]


class DataScienceStrategy:
    """Career strategy for data science path."""

    def recommend_skills(self, profile: CareerProfile) -> list[str]:
        core = [
            "Pandas + NumPy for data manipulation",
            "SQL (window functions, CTEs, joins)",
            "Statistical hypothesis testing",
            "Data visualization (Matplotlib, Seaborn)",
            "Feature engineering techniques",
            "A/B testing methodology",
        ]
        existing = {s.name.lower() for s in profile.skills}
        return [s for s in core if s.lower() not in existing]

    def recommend_projects(self, profile: CareerProfile) -> list[str]:
        return [
            "End-to-end EDA on a public dataset with insights",
            "A/B test analysis with statistical significance",
            "Interactive dashboard with Streamlit or Plotly Dash",
            "Predictive model with cross-validation and deployment",
        ]

    def get_interview_topics(self) -> list[str]:
        return [
            "Explain p-values and statistical significance",
            "SQL: window functions and complex joins",
            "Pandas: groupby, merge, pivot operations",
            "How to handle missing data and outliers",
            "Bias-variance trade-off in modeling",
            "Design an A/B test for a product feature",
        ]


class MLEngineerStrategy:
    """Career strategy for ML engineering path."""

    def recommend_skills(self, profile: CareerProfile) -> list[str]:
        core = [
            "PyTorch or TensorFlow fundamentals",
            "scikit-learn pipeline and preprocessing",
            "MLOps (MLflow, model versioning, serving)",
            "Feature stores and data pipelines",
            "Model evaluation and metrics",
            "Cloud ML services (SageMaker, Vertex AI)",
        ]
        existing = {s.name.lower() for s in profile.skills}
        return [s for s in core if s.lower() not in existing]

    def recommend_projects(self, profile: CareerProfile) -> list[str]:
        return [
            "Train and deploy a model with FastAPI serving",
            "Build an ML pipeline with feature engineering",
            "Model monitoring dashboard with drift detection",
            "Fine-tune a pre-trained model for a custom task",
        ]

    def get_interview_topics(self) -> list[str]:
        return [
            "Explain gradient descent and backpropagation",
            "Precision vs recall vs F1 — when to use each",
            "How to handle class imbalance",
            "Model serving: batch vs real-time inference",
            "Feature engineering best practices",
            "Design an ML system for recommendation",
        ]


# --- Career Advisor: uses strategy pattern ---
class CareerAdvisor:
    """Main service that generates career growth plans."""

    STRATEGIES = {
        "backend": BackendStrategy,
        "data_science": DataScienceStrategy,
        "ml_engineering": MLEngineerStrategy,
    }

    def __init__(self, profile: CareerProfile):
        self.profile = profile
        strategy_cls = self.STRATEGIES.get(profile.specialization)
        if not strategy_cls:
            valid = ", ".join(self.STRATEGIES.keys())
            raise ValueError(
                f"Unknown specialization: {profile.specialization}. "
                f"Valid options: {valid}"
            )
        self.strategy = strategy_cls()

    def generate_growth_plan(self) -> dict:
        """Generate a comprehensive career growth plan."""
        return {
            "profile": self.profile.name,
            "specialization": self.profile.specialization,
            "current_skills": self.profile.skill_summary,
            "growth_areas": self.profile.get_growth_areas(),
            "recommended_skills": self.strategy.recommend_skills(
                self.profile
            ),
            "recommended_projects": self.strategy.recommend_projects(
                self.profile
            ),
            "interview_topics": self.strategy.get_interview_topics(),
        }


# --- Demo usage ---
if __name__ == "__main__":
    profile = CareerProfile(
        name="Alex Developer",
        title="Junior Python Developer",
        specialization="backend",
    )
    profile.add_skill("Python", SkillLevel.INTERMEDIATE, 2.0)
    profile.add_skill("SQL", SkillLevel.BEGINNER, 0.5)
    profile.add_skill("Git", SkillLevel.INTERMEDIATE, 1.5)

    advisor = CareerAdvisor(profile)
    plan = advisor.generate_growth_plan()

    print(f"\\nCareer Growth Plan for {plan['profile']}")
    print(f"Specialization: {plan['specialization']}")
    print(f"\\nCurrent skill levels: {plan['current_skills']}")
    print(f"\\nGrowth areas: {plan['growth_areas']}")
    print(f"\\nRecommended skills to learn:")
    for skill in plan["recommended_skills"]:
        print(f"  - {skill}")
    print(f"\\nPortfolio projects:")
    for project in plan["recommended_projects"]:
        print(f"  - {project}")
    print(f"\\nInterview prep topics:")
    for topic in plan["interview_topics"]:
        print(f"  - {topic}")`,
      exercise: `**Exercises:**

1. Extend the \`CareerAdvisor\` with a **DevOps strategy** class. Include recommended skills (Docker, Kubernetes, Terraform, CI/CD, monitoring), portfolio projects (automated deployment pipeline, infrastructure-as-code setup), and interview topics. Follow the existing Protocol pattern.

2. Build a **skills gap analyzer**: given a job posting (as a list of required skills) and a \`CareerProfile\`, output a report showing matched skills, missing skills, and a recommended 30-60-90 day learning plan to close the gap. Include priority rankings.

3. Create a **portfolio project scorer** that evaluates GitHub repositories based on criteria: has README (10 pts), has tests (20 pts), has CI/CD config (15 pts), uses type hints (10 pts), has documentation (10 pts), has releases/tags (10 pts), recent commits within 90 days (15 pts), has open issues being addressed (10 pts). Simulate with mock data.

4. Implement a **mock interview simulator**: create a class that randomly selects interview questions from a question bank (categorized by topic and difficulty), times the response, and provides a scoring rubric. Track performance across sessions and identify weak areas.

5. Build a \`CareerTimeline\` class that models career progression: define milestones for Junior to Staff+ levels with expected timelines, required skills at each level, and typical responsibilities. Given a current profile, estimate time to next level and suggest focus areas.`,
      commonMistakes: [
        "Trying to learn everything at once instead of specializing. Spending a week on Django, then a week on PyTorch, then a week on Docker leads to shallow knowledge in everything. Pick one path and go deep for 6-12 months before broadening.",
        "Building tutorial projects as portfolio pieces. Employers can spot a to-do app tutorial clone instantly. Build something that solves a real problem you care about, even if it is smaller in scope — originality and genuine problem-solving matter more than complexity.",
        "Neglecting soft skills like communication, documentation, and code review etiquette. Senior engineers spend more time reading, reviewing, and explaining code than writing it. Practice writing clear pull request descriptions and technical documentation.",
        "Not contributing to open source because of imposter syndrome. Start with documentation improvements, then small bug fixes. Every major open source project has 'good first issue' labels specifically for newcomers. The barrier is lower than you think.",
        "Ignoring the business context of technical decisions. Understanding why a feature matters to users or revenue makes you far more valuable than being a pure technician. The best senior engineers translate business requirements into technical architecture.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How would you design a 90-day onboarding plan for yourself joining a new Python backend team? What would you prioritize in each month?",
          a: "**Month 1 (Learn):** Read the existing codebase top-to-bottom — understand the architecture, data models, and deployment pipeline. Set up the development environment from scratch and document any gaps in the setup guide. Fix 3-5 small bugs to learn the codebase through real changes. Shadow on-call rotations to understand production issues. Meet with every team member to understand their area of ownership. **Month 2 (Contribute):** Take ownership of a small feature end-to-end — design, implement, test, deploy, monitor. Start participating in code reviews (reading first, then reviewing). Identify one area of technical debt and propose a plan to address it. Write or improve documentation for the areas you have learned. **Month 3 (Impact):** Lead a medium-sized project with cross-team dependencies. Mentor a newer team member on the areas you now understand. Propose and implement one improvement to the development workflow (testing, CI/CD, monitoring). Present a technical topic to the team. By month 3, you should be fully independent and starting to influence team practices.",
        },
        {
          type: "scenario",
          q: "You are offered two roles: a Python backend developer at a well-known company using Django, and a data engineer at a startup using FastAPI and Spark. How do you evaluate which to take?",
          a: "Evaluate across multiple dimensions: **1) Learning trajectory** — which role teaches skills more aligned with your 3-5 year goals? If you want to move toward data/ML, the startup role builds relevant pipeline experience. If you want to deepen backend expertise, the established company likely has more complex systems to learn from. **2) Team and mentorship** — who will you work with? A strong senior engineer who mentors you is worth more than a brand name. Ask to meet the team during interviews. **3) Technical challenges** — what problems will you solve daily? Complex distributed systems at scale versus greenfield architecture decisions. Both are valuable but teach different skills. **4) Career brand** — the well-known company adds credibility to your resume, which is valuable early in your career. The startup gives broader responsibilities and ownership. **5) Compensation and risk** — startups offer equity upside but less stability. Evaluate total compensation including growth potential. **6) Culture fit** — work-life balance, remote flexibility, and company values matter for long-term sustainability. There is no universal right answer — it depends on your specific career goals, risk tolerance, and what you want to learn next.",
        },
        {
          type: "conceptual",
          q: "What distinguishes a senior Python developer from a mid-level one? Give concrete examples.",
          a: "**Technical depth:** A mid-level developer writes working code. A senior developer writes code that is maintainable, testable, and extensible — they think about the next developer who will read it. Concrete example: a mid-level dev implements a feature; a senior dev also adds logging, error handling, monitoring, documentation, and considers edge cases before the first code review. **System thinking:** Senior developers understand how their code fits into the broader system. They consider database load, cache invalidation, API backward compatibility, and deployment strategy. A mid-level dev implements the endpoint; a senior dev also thinks about rate limiting, pagination, and what happens when the downstream service is down. **Influence and communication:** Seniors write RFCs and design documents, lead architecture discussions, and translate business requirements into technical plans. They unblock other developers, provide meaningful code review feedback, and mentor juniors. **Decision-making:** Seniors know when NOT to build something — when to use an existing library, when to accept technical debt, and when to push back on requirements. They evaluate trade-offs explicitly: 'We could use Approach A (faster to build, harder to maintain) or Approach B (more upfront work, scales better). Given our timeline and growth expectations, I recommend B because...'",
        },
      ],
    },
  ],
};

export default pyPhase14;
