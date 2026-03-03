const pyPhase8 = {
  id: "phase-8",
  title: "Phase 8: Concurrency & Parallelism",
  emoji: "\u26A1",
  description:
    "Master Python's concurrency and parallelism primitives \u2014 threading with GIL awareness, multiprocessing for CPU-bound work, asyncio for high-throughput I/O, and concurrent.futures for unified executor patterns.",
  topics: [
    {
      id: "py-threading",
      title: "Threading & the GIL",
      explanation: `Python's \`threading\` module provides OS-level threads for concurrent execution, but understanding the **Global Interpreter Lock (GIL)** is essential before writing any threaded Python code.

**The GIL explained:**
The GIL is a mutex in CPython that allows only **one thread to execute Python bytecode at a time**. It exists because CPython's memory management (reference counting) is not thread-safe. The GIL is released during I/O operations (file reads, network calls, \`time.sleep\`), which is why threading is still effective for **I/O-bound** workloads. For **CPU-bound** tasks, threads in CPython cannot achieve true parallelism \u2014 use \`multiprocessing\` or \`concurrent.futures.ProcessPoolExecutor\` instead.

| Scenario | Threading effective? | Why |
|---|---|---|
| HTTP requests | Yes | GIL released during socket I/O |
| File I/O | Yes | GIL released during OS read/write |
| CPU computation | No | GIL prevents parallel bytecode execution |
| C extensions (NumPy) | Yes | Well-written C extensions release the GIL |

**Key synchronization primitives:**

- **\`Lock\`** \u2014 Mutual exclusion. Only one thread can \`acquire()\` at a time. Always use \`with lock:\` to guarantee release.
- **\`RLock\`** (Reentrant Lock) \u2014 Same thread can \`acquire()\` multiple times without deadlocking. Must \`release()\` the same number of times.
- **\`Semaphore\`** \u2014 Allows up to N threads to enter a section concurrently. Useful for rate-limiting or connection pooling.
- **\`Event\`** \u2014 One thread signals, others wait. \`set()\` / \`clear()\` / \`wait()\`.
- **\`Condition\`** \u2014 Threads wait for a condition to become true. Supports \`notify()\` / \`notify_all()\` / \`wait()\`. Used in producer-consumer patterns.
- **\`Barrier\`** \u2014 N threads block until all N arrive, then all proceed together.

**Thread safety rule:** Any mutable shared state accessed by multiple threads must be protected by a lock. Even simple operations like \`counter += 1\` are **not atomic** in Python \u2014 they compile to LOAD, ADD, STORE bytecodes, and a context switch can happen between them.`,
      codeExample: `# ============================================================
# Basic threading with Lock for shared state
# ============================================================
import threading
import time
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO, format="%(threadName)s: %(message)s")
logger = logging.getLogger(__name__)


class ThreadSafeCounter:
    """A counter safe for concurrent access from multiple threads."""

    def __init__(self) -> None:
        self._value = 0
        self._lock = threading.Lock()

    def increment(self, amount: int = 1) -> None:
        with self._lock:  # Acquire and release automatically
            self._value += amount

    def decrement(self, amount: int = 1) -> None:
        with self._lock:
            self._value -= amount

    @property
    def value(self) -> int:
        with self._lock:
            return self._value


counter = ThreadSafeCounter()


def worker(n: int) -> None:
    """Each worker increments the counter n times."""
    for _ in range(n):
        counter.increment()


threads = [threading.Thread(target=worker, args=(100_000,)) for _ in range(10)]

start = time.perf_counter()
for t in threads:
    t.start()
for t in threads:
    t.join()
elapsed = time.perf_counter() - start

print(f"Counter value: {counter.value}")  # Always 1_000_000
print(f"Elapsed: {elapsed:.3f}s")


# ============================================================
# RLock for reentrant (nested) locking
# ============================================================
class CachedRepository:
    """Repository that uses RLock so public methods can call each other."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._cache: dict[str, str] = {}

    def get(self, key: str) -> Optional[str]:
        with self._lock:
            return self._cache.get(key)

    def set(self, key: str, value: str) -> None:
        with self._lock:
            self._cache[key] = value

    def get_or_set(self, key: str, default: str) -> str:
        """Calls get() and set() internally -- RLock prevents deadlock."""
        with self._lock:
            existing = self.get(key)   # Acquires _lock again (RLock OK)
            if existing is None:
                self.set(key, default)  # Acquires _lock again (RLock OK)
                return default
            return existing


# ============================================================
# Semaphore for connection pool / rate limiting
# ============================================================
import random

MAX_CONCURRENT_CONNECTIONS = 3
pool_semaphore = threading.Semaphore(MAX_CONCURRENT_CONNECTIONS)


def fetch_url(url: str) -> str:
    """Simulate fetching a URL with limited concurrency."""
    with pool_semaphore:  # At most 3 threads here concurrently
        logger.info(f"Fetching {url}")
        time.sleep(random.uniform(0.1, 0.5))  # Simulate network I/O
        logger.info(f"Done fetching {url}")
        return f"Response from {url}"


urls = [f"https://api.example.com/item/{i}" for i in range(10)]
threads = [threading.Thread(target=fetch_url, args=(url,)) for url in urls]
for t in threads:
    t.start()
for t in threads:
    t.join()


# ============================================================
# Event for signaling between threads
# ============================================================
data_ready = threading.Event()
shared_data: dict = {}


def producer() -> None:
    """Produce data and signal consumers."""
    logger.info("Producing data...")
    time.sleep(1)  # Simulate work
    shared_data["result"] = [1, 2, 3, 4, 5]
    data_ready.set()  # Signal consumers
    logger.info("Data is ready")


def consumer(name: str) -> None:
    """Wait for data, then consume it."""
    logger.info(f"{name} waiting for data...")
    data_ready.wait()  # Blocks until set()
    logger.info(f"{name} got data: {shared_data['result']}")


prod = threading.Thread(target=producer)
cons1 = threading.Thread(target=consumer, args=("Consumer-1",))
cons2 = threading.Thread(target=consumer, args=("Consumer-2",))

for t in [cons1, cons2, prod]:
    t.start()
for t in [prod, cons1, cons2]:
    t.join()


# ============================================================
# Condition variable for producer-consumer queue
# ============================================================
class BoundedBuffer:
    """Thread-safe bounded buffer using Condition variables."""

    def __init__(self, capacity: int = 10) -> None:
        self._buffer: list = []
        self._capacity = capacity
        self._condition = threading.Condition()

    def put(self, item) -> None:
        with self._condition:
            while len(self._buffer) >= self._capacity:
                self._condition.wait()  # Wait until space available
            self._buffer.append(item)
            self._condition.notify()  # Notify waiting consumers

    def get(self):
        with self._condition:
            while len(self._buffer) == 0:
                self._condition.wait()  # Wait until item available
            item = self._buffer.pop(0)
            self._condition.notify()  # Notify waiting producers
            return item


buffer = BoundedBuffer(capacity=5)


def buffer_producer(n: int) -> None:
    for i in range(n):
        buffer.put(i)
        logger.info(f"Produced {i}")
        time.sleep(0.05)


def buffer_consumer(n: int) -> None:
    for _ in range(n):
        item = buffer.get()
        logger.info(f"Consumed {item}")
        time.sleep(0.1)


p = threading.Thread(target=buffer_producer, args=(20,))
c = threading.Thread(target=buffer_consumer, args=(20,))
p.start()
c.start()
p.join()
c.join()


# ============================================================
# Daemon threads and graceful shutdown
# ============================================================
shutdown_event = threading.Event()


def background_monitor(interval: float = 2.0) -> None:
    """Background daemon that runs until shutdown is signaled."""
    while not shutdown_event.is_set():
        logger.info("Monitor heartbeat")
        shutdown_event.wait(timeout=interval)  # Sleep but wake on shutdown
    logger.info("Monitor shutting down")


monitor = threading.Thread(target=background_monitor, daemon=True)
monitor.start()

# ... do work ...

shutdown_event.set()  # Signal graceful shutdown
monitor.join(timeout=5)`,
      exercise: `**Exercises:**

1. Write a program that spawns 5 threads, each incrementing a shared counter 1,000,000 times. First run it **without** a lock and observe the race condition. Then add a \`Lock\` and confirm the final value is always 5,000,000.

2. Implement a thread-safe \`LRUCache\` class using \`threading.Lock\` that supports \`get(key)\` and \`put(key, value)\` with a configurable max size. Write a stress test with 10 threads doing random reads/writes.

3. Build a producer-consumer pipeline using \`threading.Condition\`: 3 producer threads generate random numbers, 2 consumer threads compute their squares. Use a bounded buffer of size 10. Print the throughput (items/sec) at the end.

4. Create a \`ConnectionPool\` class using \`Semaphore(max_size)\`. Threads call \`pool.acquire()\` to get a connection and \`pool.release(conn)\` to return it. Add a \`timeout\` parameter that raises \`TimeoutError\` if no connection is available within the limit.

5. Write a benchmark that compares threading vs sequential execution for (a) downloading 20 web pages (I/O-bound) and (b) computing SHA-256 hashes of 20 large strings (CPU-bound). Measure and explain the results in terms of the GIL.

6. Implement a \`ReadWriteLock\` from scratch that allows unlimited concurrent readers but exclusive writer access. Test it with 10 reader threads and 2 writer threads accessing a shared dictionary.`,
      commonMistakes: [
        "Using threading for CPU-bound work and expecting a speedup. The GIL prevents parallel bytecode execution in CPython, so CPU-bound threads actually run slower than sequential code due to lock contention and context-switch overhead. Use `multiprocessing` for CPU parallelism.",
        "Forgetting to call `thread.join()` and letting the main thread exit. If non-daemon threads are still running, the process hangs. If daemon threads are running, they are killed abruptly without cleanup. Always `join()` threads you care about.",
        "Assuming simple operations like `list.append()` or `dict[key] = value` are thread-safe because they are 'atomic.' While CPython's GIL makes some bytecode operations accidentally safe, this is an implementation detail, not a language guarantee. Always use explicit locks for shared mutable state.",
        "Acquiring multiple locks in inconsistent order across threads, causing deadlocks. Thread A holds Lock1 and waits for Lock2, while Thread B holds Lock2 and waits for Lock1. Always acquire locks in a globally consistent order, or use `threading.RLock` for self-reentrant cases.",
        "Not using `with lock:` context-manager syntax and forgetting to release the lock in an exception path. Manual `lock.acquire()` / `lock.release()` without try/finally will leak locks if the critical section raises.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the GIL, why does CPython have it, and how does it affect multithreaded programs? When is threading still beneficial despite the GIL?",
          a: "The **Global Interpreter Lock** is a mutex that allows only one thread to execute Python bytecode at a time in CPython. It exists because CPython's memory management relies on **reference counting**, which is not thread-safe \u2014 without the GIL, concurrent threads could corrupt reference counts, leading to memory leaks or double-frees. The GIL is **released during I/O operations** (file, network, sleep) and by well-written C extensions (NumPy, database drivers). Therefore, threading is highly effective for **I/O-bound** workloads (web scraping, API calls, file processing) where threads spend most time waiting. For **CPU-bound** work, the GIL serializes execution, making threads slower than single-threaded code due to context-switch overhead. Use `multiprocessing` for CPU parallelism. Note: PyPy has a GIL too, but Jython and IronPython do not. CPython 3.13+ has experimental free-threaded builds (PEP 703) that remove the GIL.",
        },
        {
          type: "tricky",
          q: "Is `counter += 1` thread-safe in Python? Explain at the bytecode level.",
          a: "No. `counter += 1` compiles to multiple bytecodes: `LOAD_GLOBAL counter`, `LOAD_CONST 1`, `BINARY_ADD`, `STORE_GLOBAL counter`. The GIL can release between any of these instructions (it checks every N bytecodes or on I/O). If Thread A loads counter=5, then Thread B loads counter=5, both add 1 and store 6 \u2014 one increment is lost. This is a classic **read-modify-write race condition**. Even though the GIL prevents truly simultaneous execution, the interleaving of bytecodes from different threads still causes data races. The fix is to protect the operation with a `threading.Lock`, or use `queue.Queue` for thread-safe communication, or use atomic operations from third-party libraries.",
        },
        {
          type: "scenario",
          q: "You need to download 10,000 images concurrently from a CDN. Design a solution using threading. What are the key design decisions?",
          a: "Use a **thread pool** (not 10,000 threads). Create a `concurrent.futures.ThreadPoolExecutor(max_workers=50)` or a manual pool with `threading.Semaphore(50)` to limit concurrency. Key decisions: 1) **Pool size**: match it to the CDN's rate limit and available bandwidth \u2014 too many threads overwhelm the server or trigger throttling. 2) **Queue-based architecture**: put URLs in a `queue.Queue`, have worker threads dequeue and download. 3) **Error handling**: retry transient failures (HTTP 429, 503) with exponential backoff. 4) **Timeout**: set socket timeouts to prevent threads from hanging indefinitely. 5) **Progress tracking**: use a shared `ThreadSafeCounter` or `threading.Event` per batch. 6) **Graceful shutdown**: use a `threading.Event` to signal workers to stop. 7) **Memory**: stream to disk rather than buffering in memory. Threading is ideal here because downloading is I/O-bound \u2014 the GIL is released during network I/O.",
        },
        {
          type: "conceptual",
          q: "Compare `Lock`, `RLock`, `Semaphore`, and `Condition` in Python threading. When would you use each?",
          a: "**`Lock`** \u2014 Binary mutex. Use when only one thread should access a critical section at a time. Non-reentrant: the same thread calling `acquire()` twice deadlocks. **`RLock`** \u2014 Reentrant lock. Same thread can acquire multiple times (must release the same number of times). Use when methods guarded by a lock call other methods that also need the lock. **`Semaphore`** \u2014 Counter-based lock allowing N concurrent threads. Use for connection pools, rate limiting, or bounding concurrency. `BoundedSemaphore` raises if you `release()` more times than you `acquire()`. **`Condition`** \u2014 Combines a lock with a wait/notify mechanism. Threads call `wait()` to block until another calls `notify()`. Use for producer-consumer patterns, event-driven coordination, or waiting for complex predicates (always check the condition in a `while` loop to handle spurious wakeups).",
        },
      ],
    },
    {
      id: "py-multiprocessing",
      title: "Multiprocessing",
      explanation: `The \`multiprocessing\` module spawns **separate OS processes**, each with its own Python interpreter and GIL. This is Python's primary mechanism for achieving true **CPU parallelism** on multi-core machines.

**Why multiprocessing over threading for CPU work:**
Since each process has its own GIL, multiple processes can execute Python bytecode **truly in parallel** across CPU cores. The trade-off is higher overhead: process creation is slower than thread creation, and inter-process communication requires serialization (pickling).

**Key components:**

| Component | Purpose |
|---|---|
| \`Process\` | Spawn a single child process |
| \`Pool\` | Manage a pool of worker processes |
| \`Queue\` | Thread/process-safe FIFO queue for IPC |
| \`Pipe\` | Two-way communication channel between two processes |
| \`Value\` / \`Array\` | Shared memory for simple types (ctypes-backed) |
| \`Manager\` | Proxy-based shared objects (dict, list, Namespace) across processes |
| \`Lock\` / \`Semaphore\` | Process-level synchronization primitives |

**Process start methods:**
- \`fork\` (default on Unix) \u2014 Fast, copies parent's memory via copy-on-write. Unsafe with threads in parent.
- \`spawn\` (default on Windows/macOS since 3.8) \u2014 Starts a fresh interpreter, imports the module. Slower but safer. Requires \`if __name__ == "__main__":\` guard.
- \`forkserver\` \u2014 Hybrid: a server process forks workers. Safer than \`fork\` with threads.

**When to use multiprocessing vs threading:**
- **CPU-bound** (math, image processing, ML inference, compression): multiprocessing
- **I/O-bound** (network, disk, database): threading or asyncio
- **Mixed**: use a process pool for CPU work, with threading or asyncio within each process for I/O

**Shared memory (Python 3.8+):** \`multiprocessing.shared_memory.SharedMemory\` provides a block of memory accessible by all processes without pickling. Ideal for large arrays, NumPy buffers, or any scenario where serialization overhead is prohibitive.`,
      codeExample: `# ============================================================
# Basic Process creation
# ============================================================
import multiprocessing as mp
import os
import time
import math
from typing import Any


def cpu_intensive_task(n: int) -> float:
    """Simulate CPU-bound work: compute sum of square roots."""
    return sum(math.sqrt(i) for i in range(n))


def worker(task_id: int, n: int, result_queue: mp.Queue) -> None:
    """Worker that puts its result on a queue."""
    pid = os.getpid()
    print(f"Worker {task_id} started (PID={pid})")
    result = cpu_intensive_task(n)
    result_queue.put((task_id, result))
    print(f"Worker {task_id} finished (PID={pid})")


if __name__ == "__main__":
    # Required guard for 'spawn' start method (default on macOS/Windows)

    result_queue = mp.Queue()
    processes = []

    start = time.perf_counter()
    for i in range(4):
        p = mp.Process(target=worker, args=(i, 5_000_000, result_queue))
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

    results = [result_queue.get() for _ in range(4)]
    elapsed = time.perf_counter() - start

    for task_id, result in sorted(results):
        print(f"Task {task_id}: {result:.2f}")
    print(f"Total time: {elapsed:.2f}s (4 processes)")


# ============================================================
# Pool for parallel map/starmap
# ============================================================
def process_chunk(data: list[int]) -> list[int]:
    """CPU-bound processing of a data chunk."""
    return [x * x + math.isqrt(x) for x in data]


if __name__ == "__main__":
    data = list(range(10_000_000))
    chunk_size = len(data) // mp.cpu_count()
    chunks = [
        data[i : i + chunk_size]
        for i in range(0, len(data), chunk_size)
    ]

    # Pool.map distributes chunks across worker processes
    start = time.perf_counter()
    with mp.Pool(processes=mp.cpu_count()) as pool:
        results = pool.map(process_chunk, chunks)
    elapsed = time.perf_counter() - start

    total_items = sum(len(r) for r in results)
    print(f"Processed {total_items:,} items in {elapsed:.2f}s")
    print(f"Using {mp.cpu_count()} cores")


# ============================================================
# Pool with imap_unordered for streaming results
# ============================================================
def analyze_file(filepath: str) -> dict[str, Any]:
    """Analyze a single file (CPU-bound)."""
    # Simulated file analysis
    time.sleep(0.1)
    return {
        "file": filepath,
        "size": len(filepath) * 100,
        "checksum": hash(filepath) % 10**8,
    }


if __name__ == "__main__":
    filepaths = [f"/data/file_{i:04d}.csv" for i in range(50)]

    with mp.Pool(processes=8) as pool:
        # imap_unordered yields results as they complete (not in order)
        for result in pool.imap_unordered(analyze_file, filepaths, chunksize=5):
            print(f"Completed: {result['file']} ({result['size']} bytes)")


# ============================================================
# Shared memory with Value and Array
# ============================================================
def counter_worker(
    shared_counter: mp.Value,
    lock: mp.Lock,
    increments: int,
) -> None:
    """Increment a shared counter safely."""
    for _ in range(increments):
        with lock:
            shared_counter.value += 1


if __name__ == "__main__":
    counter = mp.Value("i", 0)  # 'i' = signed int, initial value 0
    lock = mp.Lock()

    procs = [
        mp.Process(target=counter_worker, args=(counter, lock, 100_000))
        for _ in range(4)
    ]
    for p in procs:
        p.start()
    for p in procs:
        p.join()

    print(f"Shared counter: {counter.value}")  # Always 400_000


# ============================================================
# SharedMemory for large data (Python 3.8+)
# ============================================================
from multiprocessing import shared_memory
import struct


def create_shared_buffer(name: str, data: list[float]) -> None:
    """Create a shared memory block with float data."""
    fmt = f"{len(data)}d"  # 'd' = double (float64)
    size = struct.calcsize(fmt)

    shm = shared_memory.SharedMemory(name=name, create=True, size=size)
    struct.pack_into(fmt, shm.buf, 0, *data)
    print(f"Created shared memory '{name}' ({size} bytes)")
    shm.close()  # Close local handle (memory persists)


def read_shared_buffer(name: str, count: int) -> list[float]:
    """Read float data from existing shared memory."""
    shm = shared_memory.SharedMemory(name=name, create=False)
    fmt = f"{count}d"
    data = list(struct.unpack_from(fmt, shm.buf, 0))
    shm.close()
    return data


if __name__ == "__main__":
    BUFFER_NAME = "my_shared_data"
    sample = [1.1, 2.2, 3.3, 4.4, 5.5]

    create_shared_buffer(BUFFER_NAME, sample)

    result = read_shared_buffer(BUFFER_NAME, len(sample))
    print(f"Read from shared memory: {result}")

    # Cleanup: unlink removes the shared memory block
    shm = shared_memory.SharedMemory(name=BUFFER_NAME, create=False)
    shm.close()
    shm.unlink()


# ============================================================
# Pipe for two-way communication
# ============================================================
def pipe_worker(conn: mp.connection.Connection) -> None:
    """Worker process that communicates via Pipe."""
    while True:
        msg = conn.recv()
        if msg == "STOP":
            conn.send("GOODBYE")
            break
        conn.send(f"Processed: {msg.upper()}")
    conn.close()


if __name__ == "__main__":
    parent_conn, child_conn = mp.Pipe()

    p = mp.Process(target=pipe_worker, args=(child_conn,))
    p.start()

    for word in ["hello", "world", "python"]:
        parent_conn.send(word)
        print(parent_conn.recv())

    parent_conn.send("STOP")
    print(parent_conn.recv())  # "GOODBYE"
    p.join()`,
      exercise: `**Exercises:**

1. Write a script that computes the sum of prime numbers up to 10,000,000 using \`multiprocessing.Pool\`. Split the range into chunks (one per CPU core), compute primes in each chunk in parallel, and combine results. Compare the speedup against a single-process version.

2. Implement a parallel file hasher: given a list of 100 file paths, compute their SHA-256 hashes using a \`Pool\` with \`imap_unordered\`. Display a progress bar (using a counter and total). Handle \`FileNotFoundError\` gracefully per file without crashing the pool.

3. Build a multi-process pipeline using \`Queue\`: Process A reads lines from a large CSV, Process B parses and transforms rows, Process C writes results to a new file. Use sentinel values to signal completion. Measure throughput.

4. Create a shared NumPy array using \`multiprocessing.shared_memory\` and have 4 worker processes each write to their own slice. Verify the combined result in the parent process without any pickling overhead.

5. Write a benchmark comparing \`fork\` vs \`spawn\` start methods. Measure process creation time, memory usage, and total execution time for a pool of 8 workers. Explain the results.

6. Implement a parallel web scraper: a main process puts URLs into a \`Queue\`, 4 worker processes fetch and parse pages (using \`requests\` + \`BeautifulSoup\`), and put parsed results into an output \`Queue\`. The main process collects and saves results. Add graceful shutdown with a poison-pill pattern.`,
      commonMistakes: [
        "Forgetting the `if __name__ == '__main__':` guard. On `spawn` start method (default on macOS/Windows), the child process re-imports the module. Without the guard, it tries to create new processes recursively, causing `RuntimeError` or infinite process spawning.",
        "Passing unpicklable objects (lambdas, open file handles, database connections, sockets) to worker processes. Everything sent via `Queue`, `Pipe`, or `Pool` must be picklable. Use module-level functions instead of lambdas, and create resources inside the worker.",
        "Creating too many processes. Spawning 1,000 processes on an 8-core machine wastes memory and causes excessive context switching. Match the pool size to `os.cpu_count()` for CPU-bound work, or slightly above for mixed workloads.",
        "Using `multiprocessing` for I/O-bound tasks. The process creation and IPC overhead far exceeds any benefit. Use `threading` or `asyncio` for I/O-bound work \u2014 reserve multiprocessing for CPU-bound computation.",
        "Not properly cleaning up shared memory. `SharedMemory` blocks persist after the process exits. Failing to call `shm.unlink()` leaves orphaned memory blocks in the OS. Always unlink from exactly one process (typically the creator) using try/finally.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When should you use multiprocessing over threading in Python? Explain the trade-offs.",
          a: "Use **multiprocessing for CPU-bound** work (number crunching, image processing, ML inference) because each process has its own GIL, achieving true parallelism. Use **threading for I/O-bound** work (network requests, file I/O, database queries) because the GIL is released during I/O, and threads have lower overhead than processes. Trade-offs: processes have higher **creation cost** (~100ms vs ~1ms for threads), higher **memory usage** (each gets its own interpreter), and require **serialization** (pickling) for inter-process communication. Threads share memory directly (faster but requires locking). For mixed workloads, combine both: a process pool for CPU work, with threads or asyncio within each process for I/O.",
        },
        {
          type: "tricky",
          q: "What is the difference between `fork` and `spawn` start methods, and what bugs can `fork` cause?",
          a: "`fork` clones the parent process using the OS `fork()` syscall. The child gets a **copy-on-write** copy of the parent's entire memory space, including all global state, imported modules, and open file descriptors. It's fast but dangerous: if the parent has **threads** running, the child inherits the memory but only the forking thread \u2014 any locks held by other threads are permanently stuck, causing **deadlocks**. This is common with apps using logging, database pools, or GUI frameworks. `spawn` starts a **fresh** Python interpreter and imports the module from scratch. It's slower but safe \u2014 no inherited state or lock issues. `forkserver` is a compromise: a clean server process (spawned early) forks workers on demand. Since Python 3.8, `spawn` is the default on macOS (and always on Windows) because macOS deprecated `fork` with threads.",
        },
        {
          type: "scenario",
          q: "You need to process 1 million images (resize + apply filter). Each takes ~100ms. Design a multiprocessing solution.",
          a: "1) **Architecture**: Use `multiprocessing.Pool(processes=cpu_count())` with `imap_unordered` for maximum throughput. 2) **Chunking**: Don't pass raw image data between processes \u2014 pass **file paths**. Workers load images inside their process to avoid pickling large buffers. 3) **Pool sizing**: Set `processes=cpu_count()` since this is CPU-bound. 4) **Chunksize tuning**: Use `chunksize=50-100` with `imap_unordered` to amortize IPC overhead. 5) **Memory management**: Workers should process and save one image at a time, not accumulate results. 6) **Error handling**: Wrap each image processing in try/except inside the worker; return success/failure status rather than crashing the pool. 7) **Progress**: Use a `mp.Value` counter or a callback with `apply_async` to track progress. 8) **Estimated time**: 1M images / 8 cores / 10 per second per core = ~3.5 hours. With the Pool pattern, you get near-linear scaling across cores.",
        },
      ],
    },
    {
      id: "py-asyncio",
      title: "Asyncio (async/await)",
      explanation: `\`asyncio\` is Python's built-in framework for writing **concurrent I/O-bound code** using a single-threaded **event loop**. It uses \`async\`/\`await\` syntax to write asynchronous code that reads like synchronous code while handling thousands of concurrent operations efficiently.

**Core concepts:**

- **Coroutine** \u2014 A function defined with \`async def\`. Calling it returns a coroutine object (not a result). Must be awaited or scheduled.
- **Event loop** \u2014 The central scheduler that runs coroutines, handles I/O callbacks, and manages timers. Only one loop per thread.
- **\`await\`** \u2014 Suspends the current coroutine and yields control back to the event loop until the awaited operation completes.
- **Task** \u2014 A wrapper around a coroutine that schedules it for concurrent execution. Created with \`asyncio.create_task()\`.
- **\`asyncio.gather()\`** \u2014 Run multiple coroutines concurrently and collect all results.
- **\`asyncio.TaskGroup\`** (3.11+) \u2014 Structured concurrency: a context manager that runs tasks and cancels all on first failure.

**How it works (simplified):**
\`\`\`
1. Event loop picks a ready coroutine
2. Coroutine runs until it hits 'await' (I/O, sleep, etc.)
3. Coroutine is suspended, control returns to event loop
4. Event loop picks the next ready coroutine
5. When I/O completes, the suspended coroutine becomes ready again
\`\`\`

**asyncio vs threading:**

| Feature | asyncio | threading |
|---|---|---|
| Concurrency model | Cooperative (explicit \`await\`) | Preemptive (OS switches) |
| Context switches | At \`await\` points (predictable) | Anytime (unpredictable) |
| Shared state safety | Safe (single-threaded) | Requires locks |
| Overhead per task | Very low (~KB) | Higher (~MB per thread) |
| Best for | Many concurrent I/O ops (10K+) | Moderate I/O concurrency, CPU-bound in C extensions |

**When to use asyncio:** High-concurrency I/O scenarios \u2014 web servers, API gateways, chat servers, web scrapers, microservice communication. When you need to handle thousands of simultaneous connections with minimal resources.

**Key libraries:** \`aiohttp\` (HTTP client/server), \`asyncpg\` (PostgreSQL), \`aioredis\` (Redis), \`aiomysql\` (MySQL), \`websockets\`, \`httpx\` (async HTTP).`,
      codeExample: `# ============================================================
# Basics: coroutines, await, and asyncio.run()
# ============================================================
import asyncio
import time
from typing import Any


async def fetch_data(url: str, delay: float) -> dict[str, Any]:
    """Simulate an async HTTP request."""
    print(f"Fetching {url}...")
    await asyncio.sleep(delay)  # Non-blocking sleep (simulates I/O)
    return {"url": url, "status": 200, "data": f"Response from {url}"}


async def main_sequential() -> None:
    """Sequential execution: each await blocks before the next starts."""
    start = time.perf_counter()

    r1 = await fetch_data("https://api.example.com/users", 1.0)
    r2 = await fetch_data("https://api.example.com/posts", 1.5)
    r3 = await fetch_data("https://api.example.com/comments", 0.8)

    elapsed = time.perf_counter() - start
    print(f"Sequential: {elapsed:.2f}s")  # ~3.3s (sum of delays)


async def main_concurrent() -> None:
    """Concurrent execution: all requests run simultaneously."""
    start = time.perf_counter()

    results = await asyncio.gather(
        fetch_data("https://api.example.com/users", 1.0),
        fetch_data("https://api.example.com/posts", 1.5),
        fetch_data("https://api.example.com/comments", 0.8),
    )

    elapsed = time.perf_counter() - start
    print(f"Concurrent: {elapsed:.2f}s")  # ~1.5s (max of delays)
    for r in results:
        print(f"  {r['url']}: {r['status']}")


asyncio.run(main_sequential())
asyncio.run(main_concurrent())


# ============================================================
# Tasks: create_task for fire-and-forget concurrency
# ============================================================
async def download_file(name: str, size_mb: float) -> str:
    """Simulate downloading a file."""
    chunks = int(size_mb * 10)
    for i in range(chunks):
        await asyncio.sleep(0.05)  # Simulate chunk download
    return f"{name} ({size_mb}MB)"


async def main_tasks() -> None:
    """Create tasks for concurrent execution."""
    # create_task schedules coroutines immediately
    task1 = asyncio.create_task(download_file("report.pdf", 2.0))
    task2 = asyncio.create_task(download_file("data.csv", 1.5))
    task3 = asyncio.create_task(download_file("image.png", 0.5))

    # Do other work while downloads proceed
    print("Downloads started, doing other work...")
    await asyncio.sleep(0.1)

    # Await results when needed
    results = await asyncio.gather(task1, task2, task3)
    for r in results:
        print(f"  Downloaded: {r}")


asyncio.run(main_tasks())


# ============================================================
# TaskGroup for structured concurrency (Python 3.11+)
# ============================================================
async def process_item(item_id: int) -> dict:
    """Process a single item asynchronously."""
    await asyncio.sleep(0.1 * (item_id % 5))
    if item_id == 7:
        raise ValueError(f"Item {item_id} is invalid")
    return {"id": item_id, "processed": True}


async def main_taskgroup() -> None:
    """TaskGroup cancels all tasks if any one fails."""
    try:
        async with asyncio.TaskGroup() as tg:
            tasks = [
                tg.create_task(process_item(i))
                for i in range(10)
            ]
        # If we get here, all tasks succeeded
        results = [t.result() for t in tasks]
        print(f"All {len(results)} items processed")
    except* ValueError as eg:
        # ExceptionGroup from TaskGroup (3.11+)
        for exc in eg.exceptions:
            print(f"Failed: {exc}")


# asyncio.run(main_taskgroup())


# ============================================================
# Semaphore for limiting concurrency
# ============================================================
async def rate_limited_fetch(
    sem: asyncio.Semaphore,
    url: str,
    session_id: int,
) -> dict:
    """Fetch with concurrency limit via semaphore."""
    async with sem:  # At most N concurrent fetches
        print(f"[{session_id}] Fetching {url}")
        await asyncio.sleep(0.5)  # Simulate request
        return {"url": url, "session": session_id, "status": 200}


async def main_rate_limited() -> None:
    """Fetch 20 URLs with at most 5 concurrent requests."""
    sem = asyncio.Semaphore(5)
    urls = [f"https://api.example.com/item/{i}" for i in range(20)]

    tasks = [
        rate_limited_fetch(sem, url, i) for i, url in enumerate(urls)
    ]

    start = time.perf_counter()
    results = await asyncio.gather(*tasks)
    elapsed = time.perf_counter() - start

    print(f"Fetched {len(results)} URLs in {elapsed:.2f}s")
    # 20 URLs, 5 at a time, 0.5s each = ~2.0s


asyncio.run(main_rate_limited())


# ============================================================
# Async generators and async iteration
# ============================================================
async def async_range(start: int, stop: int, delay: float = 0.1):
    """Async generator that yields numbers with a delay."""
    for i in range(start, stop):
        await asyncio.sleep(delay)
        yield i


async def main_async_iter() -> None:
    """Consume async generators with 'async for'."""
    total = 0
    async for num in async_range(1, 11, delay=0.05):
        total += num
        print(f"  Received: {num}")
    print(f"Total: {total}")


asyncio.run(main_async_iter())


# ============================================================
# Producer-consumer with asyncio.Queue
# ============================================================
async def producer(queue: asyncio.Queue, name: str, count: int) -> None:
    """Produce items and put them on the queue."""
    for i in range(count):
        item = f"{name}-item-{i}"
        await queue.put(item)
        print(f"Produced: {item}")
        await asyncio.sleep(0.05)
    await queue.put(None)  # Sentinel


async def consumer(queue: asyncio.Queue, name: str) -> list[str]:
    """Consume items from the queue until sentinel."""
    processed = []
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        print(f"{name} consumed: {item}")
        await asyncio.sleep(0.1)  # Simulate processing
        processed.append(item)
        queue.task_done()
    return processed


async def main_queue() -> None:
    """Async producer-consumer pipeline."""
    queue: asyncio.Queue[str | None] = asyncio.Queue(maxsize=10)

    prod_task = asyncio.create_task(producer(queue, "P1", 8))
    cons_task = asyncio.create_task(consumer(queue, "C1"))

    await prod_task
    results = await cons_task
    print(f"Consumed {len(results)} items")


asyncio.run(main_queue())


# ============================================================
# Timeouts and cancellation
# ============================================================
async def slow_operation() -> str:
    """Operation that takes too long."""
    await asyncio.sleep(10)
    return "done"


async def main_timeout() -> None:
    """Demonstrate timeout handling."""
    # Using asyncio.wait_for
    try:
        result = await asyncio.wait_for(slow_operation(), timeout=2.0)
    except asyncio.TimeoutError:
        print("Operation timed out after 2s")

    # Using asyncio.timeout (Python 3.11+)
    try:
        async with asyncio.timeout(1.5):
            await slow_operation()
    except TimeoutError:
        print("Timeout context manager triggered after 1.5s")


asyncio.run(main_timeout())


# ============================================================
# Running blocking code in executor
# ============================================================
import hashlib


def cpu_bound_hash(data: bytes) -> str:
    """CPU-bound: compute many hash rounds (blocking)."""
    result = data
    for _ in range(100):
        result = hashlib.sha256(result).digest()
    return result.hex()


async def main_executor() -> None:
    """Run blocking code without freezing the event loop."""
    loop = asyncio.get_running_loop()

    # Run in thread pool (default executor)
    result = await loop.run_in_executor(
        None,  # Use default ThreadPoolExecutor
        cpu_bound_hash,
        b"secret data",
    )
    print(f"Hash: {result[:32]}...")


asyncio.run(main_executor())`,
      exercise: `**Exercises:**

1. Write an async function that fetches 50 URLs concurrently using \`asyncio.gather()\`, but limits concurrency to 10 at a time using \`asyncio.Semaphore\`. Return the results in the original order. Compare total time vs sequential execution.

2. Implement an async producer-consumer system with 3 producers and 2 consumers sharing an \`asyncio.Queue(maxsize=20)\`. Producers generate random data, consumers process it. Use sentinel values for graceful shutdown. Track total throughput.

3. Build an async retry decorator: \`@async_retry(max_attempts=3, backoff=1.0, exceptions=(ConnectionError,))\` that retries an \`async def\` function with exponential backoff. Test it with a function that fails randomly.

4. Create an async web crawler that starts from a seed URL, follows links up to depth 3, and collects page titles. Use \`asyncio.Semaphore\` to limit concurrent requests to 5. Use \`asyncio.TaskGroup\` for structured concurrency. Detect and skip already-visited URLs.

5. Write an async context manager \`async_timer\` that measures the wall-clock time of an \`async with\` block. Use it to benchmark \`gather()\` vs sequential awaits for 20 simulated API calls with random latencies.

6. Implement a simple async event bus: \`subscribe(event_name, callback)\`, \`publish(event_name, data)\`. Callbacks are async functions. Publishing should run all subscribers concurrently and collect results. Add timeout handling per subscriber.`,
      commonMistakes: [
        "Calling a coroutine function without `await` and wondering why nothing happens. `fetch_data()` returns a coroutine object, not a result. You must `await fetch_data()` or schedule it with `create_task()`. Python will emit 'coroutine was never awaited' warning.",
        "Using `time.sleep()` instead of `await asyncio.sleep()` inside async code. `time.sleep()` blocks the entire event loop, freezing ALL coroutines. Always use async equivalents: `aiohttp` instead of `requests`, `asyncpg` instead of `psycopg2`, etc.",
        "Creating tasks with `asyncio.create_task()` but never awaiting or storing the reference. Unawaited tasks can be garbage-collected before completion, silently dropping their work and any exceptions they raise.",
        "Trying to call `asyncio.run()` from inside an already-running event loop (e.g., in Jupyter or some web frameworks). Use `await` directly or `loop.create_task()` instead. In Jupyter, use `await main()` directly since the notebook already runs an event loop.",
        "Not handling `asyncio.CancelledError` properly. When a task is cancelled (e.g., via timeout), `CancelledError` is raised at the `await` point. If you catch `Exception` broadly, you accidentally swallow cancellation. Always re-raise `CancelledError` or use `except Exception` with care (in Python 3.9+, `CancelledError` inherits from `BaseException`, not `Exception`).",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the difference between concurrency and parallelism. How does asyncio achieve concurrency without threads?",
          a: "**Concurrency** means multiple tasks make progress over the same time period (interleaved execution). **Parallelism** means multiple tasks execute at the exact same instant (simultaneous execution on multiple cores). asyncio achieves concurrency with a **single-threaded event loop**: when a coroutine hits `await` (I/O, sleep, etc.), it suspends and yields control to the event loop, which picks another ready coroutine. No two coroutines run at the same instant \u2014 but while one waits for I/O, others execute. This cooperative multitasking avoids thread overhead (no context switches, no locks) and scales to thousands of concurrent connections. The trade-off: a CPU-bound coroutine that never awaits will starve all others \u2014 use `loop.run_in_executor()` to offload blocking work to a thread/process pool.",
        },
        {
          type: "tricky",
          q: "What happens when you `await asyncio.gather(*tasks, return_exceptions=True)` vs `return_exceptions=False`? How does `TaskGroup` differ?",
          a: "With `return_exceptions=False` (default), `gather()` cancels remaining tasks and raises the **first** exception immediately. With `return_exceptions=True`, exceptions are returned as values in the results list \u2014 no exception is raised, and all tasks run to completion. This is useful for best-effort batch operations. **`TaskGroup`** (3.11+) provides **structured concurrency**: if any task raises, ALL other tasks in the group are cancelled, and an `ExceptionGroup` is raised containing all exceptions. You cannot ignore failures \u2014 they propagate. `TaskGroup` is safer because it prevents orphaned tasks (tasks that keep running after their result is no longer needed). Use `gather(return_exceptions=True)` for best-effort, `TaskGroup` for all-or-nothing.",
        },
        {
          type: "scenario",
          q: "You're building an API gateway that receives a request and must call 5 downstream microservices, aggregate results, and respond within 500ms. Design the async solution.",
          a: "1) Use `asyncio.gather()` with all 5 service calls to run them concurrently. 2) Wrap the entire gather in `asyncio.wait_for(gather(...), timeout=0.45)` (leaving 50ms for aggregation + response). 3) For resilience, use `return_exceptions=True` so one failed service doesn't crash the whole request \u2014 return partial results with degraded data for failed services. 4) Implement per-service timeouts with `asyncio.wait_for()` inside each coroutine (e.g., 400ms). 5) Add connection pooling via `aiohttp.ClientSession` \u2014 create the session once at startup, reuse across requests. 6) Use `asyncio.Semaphore` to cap outbound connections per service. 7) Cache responses with TTL for frequently-requested data. 8) Circuit breaker pattern: if a service fails repeatedly, skip calling it for a backoff period. Total expected latency: max of the 5 service call times (~200-400ms) + aggregation overhead.",
        },
        {
          type: "conceptual",
          q: "When should you use `create_task()` vs directly `await`ing a coroutine?",
          a: "`await coroutine()` runs the coroutine **sequentially** \u2014 the calling coroutine suspends until it completes. `create_task(coroutine())` schedules the coroutine for **concurrent** execution on the event loop and returns a `Task` object immediately. Use `await` for sequential dependencies (need result A before calling B). Use `create_task()` when operations are independent and can run concurrently. Important: always keep a reference to created tasks and eventually await them (or use `gather()`/`TaskGroup`). Unawaited tasks may be garbage-collected, and their exceptions silently swallowed. `create_task()` also gives you a handle for cancellation via `task.cancel()`.",
        },
      ],
    },
    {
      id: "py-concurrent-futures",
      title: "concurrent.futures",
      explanation: `The \`concurrent.futures\` module provides a **high-level, unified interface** for executing callables asynchronously using either threads or processes. It abstracts away the complexity of managing threads/processes directly and provides a clean \`Executor\` / \`Future\` API.

**Why use concurrent.futures:**
- **Simpler than raw threading/multiprocessing** \u2014 no manual thread creation, joining, or queue management
- **Unified API** \u2014 swap between \`ThreadPoolExecutor\` and \`ProcessPoolExecutor\` by changing one line
- **Future objects** \u2014 represent pending results, support callbacks, cancellation, and exception retrieval
- **Context manager** \u2014 executors are context managers that handle shutdown automatically

**Key components:**

| Component | Purpose |
|---|---|
| \`ThreadPoolExecutor\` | Pool of threads for I/O-bound work |
| \`ProcessPoolExecutor\` | Pool of processes for CPU-bound work |
| \`Future\` | Represents a pending computation result |
| \`submit(fn, *args)\` | Submit a single callable, returns a \`Future\` |
| \`map(fn, *iterables)\` | Apply function to iterables in parallel (like built-in \`map\`) |
| \`as_completed(futures)\` | Iterator yielding futures as they complete (not in submission order) |
| \`wait(futures)\` | Block until futures complete, with options for first-completed or all-completed |

**\`submit()\` vs \`map()\`:**
- \`submit()\` returns a \`Future\` for each call \u2014 gives you fine-grained control (callbacks, cancellation, exception handling per task)
- \`map()\` returns an iterator of results in **input order** \u2014 simpler API but less control. Raises the first exception encountered.

**\`as_completed()\`** is one of the most useful patterns: it yields futures in the order they **finish**, not the order they were submitted. This is ideal for processing results as soon as they're available, showing progress, or implementing timeouts.

**\`Future\` lifecycle:**
\`PENDING\` \u2192 \`RUNNING\` \u2192 \`FINISHED\` (result or exception) or \`CANCELLED\`

The module integrates seamlessly with \`asyncio\` via \`loop.run_in_executor()\`, which wraps a concurrent.futures executor for use in async code. This is the standard pattern for running blocking or CPU-bound code inside an asyncio application.`,
      codeExample: `# ============================================================
# ThreadPoolExecutor for I/O-bound work
# ============================================================
from concurrent.futures import (
    ThreadPoolExecutor,
    ProcessPoolExecutor,
    as_completed,
    wait,
    Future,
    FIRST_COMPLETED,
    ALL_COMPLETED,
)
import time
import hashlib
import math
import logging
from typing import Any
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fetch_url(url: str) -> dict[str, Any]:
    """Simulate fetching a URL (I/O-bound)."""
    time.sleep(0.3 + len(url) % 5 * 0.1)  # Variable latency
    return {"url": url, "status": 200, "size": len(url) * 100}


# --- Using submit() with as_completed() ---
def fetch_all_urls(urls: list[str], max_workers: int = 10) -> list[dict]:
    """Fetch URLs concurrently, processing results as they arrive."""
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks and map futures to their URLs
        future_to_url = {
            executor.submit(fetch_url, url): url for url in urls
        }

        # Process results as they complete (NOT in submission order)
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                result = future.result()  # Get the return value
                results.append(result)
                logger.info(f"Completed: {url} ({result['size']} bytes)")
            except Exception as exc:
                logger.error(f"Failed: {url} - {exc}")

    return results


urls = [f"https://api.example.com/page/{i}" for i in range(15)]
start = time.perf_counter()
results = fetch_all_urls(urls, max_workers=5)
elapsed = time.perf_counter() - start
print(f"Fetched {len(results)} URLs in {elapsed:.2f}s")


# --- Using map() for simpler parallel mapping ---
def process_record(record: dict) -> dict:
    """Transform a data record (I/O-bound simulation)."""
    time.sleep(0.1)
    return {**record, "processed": True, "hash": hashlib.md5(
        str(record).encode()
    ).hexdigest()[:8]}


records = [{"id": i, "value": i * 10} for i in range(20)]

with ThreadPoolExecutor(max_workers=8) as executor:
    # map() returns results in INPUT order (unlike as_completed)
    start = time.perf_counter()
    processed = list(executor.map(process_record, records))
    elapsed = time.perf_counter() - start

print(f"Processed {len(processed)} records in {elapsed:.2f}s")


# ============================================================
# ProcessPoolExecutor for CPU-bound work
# ============================================================
def compute_primes(start: int, end: int) -> list[int]:
    """Find all primes in range [start, end) -- CPU-bound."""
    primes = []
    for n in range(max(2, start), end):
        if all(n % d != 0 for d in range(2, int(math.sqrt(n)) + 1)):
            primes.append(n)
    return primes


def parallel_prime_count(limit: int, num_workers: int = 4) -> int:
    """Count primes up to limit using multiple processes."""
    chunk_size = limit // num_workers
    ranges = [
        (i * chunk_size, (i + 1) * chunk_size)
        for i in range(num_workers)
    ]
    # Ensure we cover the full range
    ranges[-1] = (ranges[-1][0], limit)

    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        futures = [
            executor.submit(compute_primes, start, end)
            for start, end in ranges
        ]

        total_primes = []
        for future in as_completed(futures):
            chunk_primes = future.result()
            total_primes.extend(chunk_primes)
            print(f"Chunk done: found {len(chunk_primes)} primes")

    return len(total_primes)


if __name__ == "__main__":
    start = time.perf_counter()
    count = parallel_prime_count(500_000, num_workers=4)
    elapsed = time.perf_counter() - start
    print(f"Found {count} primes in {elapsed:.2f}s")


# ============================================================
# Future callbacks and exception handling
# ============================================================
def risky_operation(task_id: int) -> str:
    """Operation that may fail."""
    time.sleep(0.2)
    if task_id % 3 == 0:
        raise ValueError(f"Task {task_id} failed: bad input")
    return f"Task {task_id} succeeded"


def on_complete(future: Future) -> None:
    """Callback invoked when a future completes."""
    if future.exception():
        logger.error(f"Callback: error - {future.exception()}")
    else:
        logger.info(f"Callback: {future.result()}")


with ThreadPoolExecutor(max_workers=4) as executor:
    futures = []
    for i in range(10):
        future = executor.submit(risky_operation, i)
        future.add_done_callback(on_complete)  # Non-blocking notification
        futures.append(future)

    # Wait for all to complete and handle exceptions
    for future in as_completed(futures):
        try:
            result = future.result(timeout=5.0)
        except ValueError as e:
            print(f"Handled error: {e}")
        except TimeoutError:
            print("Task timed out")


# ============================================================
# wait() for first-completed pattern
# ============================================================
def search_engine(query: str, engine: str) -> dict:
    """Simulate searching different engines with varying speeds."""
    delays = {"google": 0.3, "bing": 0.5, "duckduckgo": 0.8}
    time.sleep(delays.get(engine, 1.0))
    return {"engine": engine, "query": query, "results": 42}


def search_first_result(query: str) -> dict:
    """Return result from whichever search engine responds first."""
    engines = ["google", "bing", "duckduckgo"]

    with ThreadPoolExecutor(max_workers=len(engines)) as executor:
        futures = {
            executor.submit(search_engine, query, eng): eng
            for eng in engines
        }

        # Wait for FIRST completed future
        done, not_done = wait(futures, return_when=FIRST_COMPLETED)

        # Get the first result
        first_future = done.pop()
        result = first_future.result()
        engine = futures[first_future]
        print(f"First result from {engine}")

        # Cancel remaining futures (best effort)
        for f in not_done:
            f.cancel()

        return result


if __name__ == "__main__":
    result = search_first_result("python concurrency")
    print(f"Result: {result}")


# ============================================================
# Switching between Thread and Process executors
# ============================================================
def get_executor(task_type: str, max_workers: int = 4):
    """Factory: choose executor based on workload type."""
    if task_type == "io":
        return ThreadPoolExecutor(max_workers=max_workers)
    elif task_type == "cpu":
        return ProcessPoolExecutor(max_workers=max_workers)
    else:
        raise ValueError(f"Unknown task type: {task_type}")


def generic_parallel_map(func, items, task_type="io", max_workers=4):
    """Run func over items in parallel, choosing executor by task type."""
    with get_executor(task_type, max_workers) as executor:
        results = list(executor.map(func, items))
    return results


# ============================================================
# Integration with asyncio
# ============================================================
import asyncio


def blocking_io_operation(filepath: str) -> str:
    """Blocking file read (cannot be made async natively)."""
    time.sleep(0.1)  # Simulate slow I/O
    return f"Contents of {filepath}"


async def async_main() -> None:
    """Use run_in_executor to call blocking code from async."""
    loop = asyncio.get_running_loop()

    # Run blocking functions concurrently in thread pool
    with ThreadPoolExecutor(max_workers=4) as pool:
        tasks = [
            loop.run_in_executor(pool, blocking_io_operation, f"file_{i}.txt")
            for i in range(10)
        ]
        results = await asyncio.gather(*tasks)

    for r in results:
        print(f"  {r}")


if __name__ == "__main__":
    asyncio.run(async_main())`,
      exercise: `**Exercises:**

1. Write a parallel file downloader using \`ThreadPoolExecutor\`. Given a list of 30 URLs, download them with \`max_workers=8\`. Use \`as_completed()\` to print a progress bar (\`[=====>    ] 15/30\`). Handle individual download failures without crashing other downloads.

2. Implement a parallel image processor using \`ProcessPoolExecutor\`: given 20 image file paths, apply a CPU-bound transformation (e.g., convert to grayscale by averaging RGB values). Use \`map()\` and compare execution time vs single-process. Plot speedup vs number of workers.

3. Build a "fastest mirror" selector: submit the same download request to 5 mirror URLs concurrently using \`submit()\`. Use \`wait(return_when=FIRST_COMPLETED)\` to get the fastest response. Cancel remaining tasks. Add retry logic if the first result is an error.

4. Create a generic \`parallel_batch_processor(items, func, batch_size, max_workers, executor_type)\` that splits items into batches, processes each batch in parallel, collects results with \`as_completed()\`, and supports both thread and process executors. Add timeout per batch.

5. Write an \`async def process_files(paths)\` that uses \`loop.run_in_executor()\` with a \`ThreadPoolExecutor\` to read files concurrently inside an asyncio application. Compare performance against purely synchronous file reading for 100 small files and 10 large files.

6. Implement a task scheduler that accepts jobs with priorities. Use \`ThreadPoolExecutor.submit()\` and \`Future\` callbacks to chain dependent tasks (task B runs only after task A succeeds). Add cancellation support: cancelling a parent task cancels all dependent children.`,
      commonMistakes: [
        "Not handling exceptions from `Future.result()`. If the submitted function raises, calling `future.result()` re-raises the exception. Without try/except, one failed task crashes the consumer loop. Always wrap `result()` calls in exception handling.",
        "Using `ProcessPoolExecutor` for I/O-bound work. Process creation and IPC overhead makes it much slower than `ThreadPoolExecutor` for network or file I/O. Reserve process pools for CPU-bound computation.",
        "Calling `future.result()` immediately after `submit()`, which blocks the caller until that specific task completes. This defeats the purpose of concurrency. Use `as_completed()` to process results as they arrive, or `gather()` in async code.",
        "Creating a new executor for every function call instead of reusing one. Executor creation has overhead (spawning threads/processes). Create one executor and reuse it, or use it as a context manager at the appropriate scope.",
        "Forgetting that `executor.map()` raises the first exception and silently abandons remaining items. If you need all results (including partial failures), use `submit()` + `as_completed()` with per-future exception handling instead.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between `submit()` and `map()` in concurrent.futures? When would you choose one over the other?",
          a: "`submit(fn, *args)` schedules a single call and returns a `Future` object, giving you fine-grained control: callbacks via `add_done_callback()`, per-task exception handling, cancellation via `cancel()`, and timeout via `result(timeout=...)`. `map(fn, *iterables)` is a parallel version of built-in `map()` \u2014 it returns an iterator of results in **input order** (not completion order). It's simpler but less flexible: you cannot attach callbacks, cancel individual tasks, or handle exceptions per item (the first exception stops iteration). **Use `submit()` when** you need error handling per task, callbacks, cancellation, or to process results as they complete (`as_completed()`). **Use `map()` when** you have a simple apply-function-to-list pattern and want ordered results with minimal code.",
        },
        {
          type: "tricky",
          q: "What does `as_completed()` do, and how does it differ from iterating over a list of futures directly?",
          a: "`as_completed(futures)` returns an iterator that yields futures in the order they **finish**, not the order they were submitted. Iterating over a list of futures directly (`for f in futures: f.result()`) processes them in **submission order**, which means you block on the first future even if later ones finished earlier. With `as_completed()`, you process results as soon as they're available \u2014 crucial for displaying progress, implementing timeouts, or short-circuiting. Example: if you submit tasks taking [5s, 1s, 2s], `as_completed()` yields them in [1s, 2s, 5s] order, while direct iteration blocks for 5s on the first one. You can also pass a `timeout` to `as_completed()` to raise `TimeoutError` if not all futures complete within the limit.",
        },
        {
          type: "scenario",
          q: "You need to migrate 10 million database records. Each record requires a slow validation API call (~200ms) and a CPU-heavy transformation (~50ms). Design a pipeline using concurrent.futures.",
          a: "Use a **two-stage pipeline**: 1) **Stage 1 (I/O-bound)**: `ThreadPoolExecutor(max_workers=50)` for API validation calls. With 50 threads and 200ms per call, throughput is ~250 records/sec. 2) **Stage 2 (CPU-bound)**: `ProcessPoolExecutor(max_workers=cpu_count())` for transformations. At 50ms per record on 8 cores, throughput is ~160 records/sec. 3) **Pipeline connection**: Stage 1 submits validated records to Stage 2 via `submit()`. Use `as_completed()` on Stage 1 futures; for each completed validation, submit the transform to Stage 2. 4) **Batch processing**: Process in batches of 10,000 to manage memory. 5) **Error handling**: collect failed record IDs per batch, retry failed batches. 6) **Backpressure**: if Stage 2 falls behind, throttle Stage 1 submissions using a `threading.Semaphore`. 7) **Progress**: track completed count with a thread-safe counter. Total estimated time: 10M / 160 records/sec = ~17 hours. To speed up, increase Stage 1 workers (limited by API rate) or Stage 2 cores.",
        },
      ],
    },
  ],
};

export default pyPhase8;
