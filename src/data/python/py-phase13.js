const pyPhase13 = {
  id: "phase-13",
  title: "Phase 13: Performance Optimization",
  emoji: "⚡",
  description:
    "Optimize Python code — profiling, benchmarking, memory management, and techniques to overcome Python's performance limitations.",
  topics: [
    {
      id: "py-profiling-benchmarking",
      title: "Profiling & Benchmarking",
      explanation: `Profiling and benchmarking are the foundation of performance optimization. **Profiling** identifies where your code spends time and memory, while **benchmarking** measures how fast specific operations run under controlled conditions. The golden rule: **never optimize without measuring first**.

**Key profiling tools:**

| Tool | Type | Granularity | Overhead | Best For |
|------|------|-------------|----------|----------|
| **timeit** | Benchmarking | Statement/expression | Minimal | Micro-benchmarks |
| **cProfile** | Deterministic profiler | Function-level | Low-medium | Finding slow functions |
| **line_profiler** | Line profiler | Line-level | High | Pinpointing bottleneck lines |
| **memory_profiler** | Memory profiler | Line-level | High | Finding memory-hungry code |
| **scalene** | Hybrid profiler | Line-level (CPU + memory + GPU) | Low | All-in-one production profiling |
| **py-spy** | Sampling profiler | Function-level | Near-zero | Profiling running processes |

**timeit** is the standard library module for micro-benchmarks. It runs a statement many times, disables garbage collection during timing, and reports the best result. Always use \`timeit\` instead of manual \`time.time()\` calls because it handles warm-up, repetition, and GC interference automatically.

**cProfile** instruments every function call and records call count, total time, and cumulative time. Run it from the command line with \`python -m cProfile -s cumulative script.py\` or programmatically. The output reveals your program's **hot path** — the chain of functions consuming the most time.

**scalene** is the modern choice for comprehensive profiling. It profiles CPU time (separating Python vs. native code), memory allocation, memory copy overhead, and even GPU usage — all with low overhead and per-line granularity. Unlike cProfile, it uses **sampling** rather than instrumentation, so it does not slow your program significantly.

**Benchmarking strategies:**
- **Isolate** the code under test — remove I/O and database calls
- **Use representative data** — small test inputs may hide algorithmic complexity
- **Run multiple iterations** — single runs are unreliable due to OS scheduling, caching, and GC
- **Compare relative performance** — absolute numbers vary across machines; ratios are portable
- **Profile in production-like conditions** — development machines often differ from deployment environments`,
      codeExample: `# ============================================================
# 1. timeit — Micro-benchmarking
# ============================================================
import timeit


# --- Compare string concatenation strategies ---
def benchmark_string_methods():
    """Benchmark different approaches to building strings."""

    # Method 1: String concatenation with +
    concat_time = timeit.timeit(
        stmt="""
result = ""
for i in range(1000):
    result += str(i)
""",
        number=1000,
    )

    # Method 2: str.join()
    join_time = timeit.timeit(
        stmt='result = "".join(str(i) for i in range(1000))',
        number=1000,
    )

    # Method 3: io.StringIO
    stringio_time = timeit.timeit(
        stmt="""
import io
buf = io.StringIO()
for i in range(1000):
    buf.write(str(i))
result = buf.getvalue()
""",
        number=1000,
    )

    print("String building benchmarks (1000 iterations):")
    print(f"  += concatenation : {concat_time:.4f}s")
    print(f"  str.join()       : {join_time:.4f}s")
    print(f"  io.StringIO      : {stringio_time:.4f}s")


# --- timeit from the command line ---
# python -m timeit -s "data = list(range(10000))" "sorted(data)"
# python -m timeit -s "data = list(range(10000))" "data.sort()"


# ============================================================
# 2. cProfile — Function-level profiling
# ============================================================
import cProfile
import pstats
import io


def fibonacci_naive(n):
    """Deliberately unoptimized recursive Fibonacci."""
    if n <= 1:
        return n
    return fibonacci_naive(n - 1) + fibonacci_naive(n - 2)


def fibonacci_memo(n, cache={}):
    """Memoized Fibonacci for comparison."""
    if n in cache:
        return cache[n]
    if n <= 1:
        return n
    cache[n] = fibonacci_memo(n - 1, cache) + fibonacci_memo(n - 2, cache)
    return cache[n]


def profile_and_compare():
    """Profile both Fibonacci implementations and compare."""
    for label, func, arg in [
        ("Naive (n=30)", fibonacci_naive, 30),
        ("Memoized (n=100)", fibonacci_memo, 100),
    ]:
        profiler = cProfile.Profile()
        profiler.enable()
        result = func(arg)
        profiler.disable()

        stream = io.StringIO()
        stats = pstats.Stats(profiler, stream=stream)
        stats.sort_stats("cumulative")
        stats.print_stats(5)

        print(f"\\n--- {label} (result={result}) ---")
        print(stream.getvalue())


# ============================================================
# 3. Context manager profiler for targeted use
# ============================================================
from contextlib import contextmanager
import time


@contextmanager
def profile_block(label="block", top_n=5):
    """Profile a code block and print top functions by time."""
    profiler = cProfile.Profile()
    wall_start = time.perf_counter()
    profiler.enable()
    try:
        yield profiler
    finally:
        profiler.disable()
        wall_elapsed = time.perf_counter() - wall_start
        stream = io.StringIO()
        stats = pstats.Stats(profiler, stream=stream)
        stats.sort_stats("cumulative")
        stats.print_stats(top_n)
        print(f"\\n[{label}] Wall time: {wall_elapsed:.4f}s")
        print(stream.getvalue())


# ============================================================
# 4. Benchmarking with statistics (robust measurement)
# ============================================================
import statistics


def robust_benchmark(func, *args, iterations=100, warmup=10, **kwargs):
    """Run a function many times and report statistical summary."""
    # Warm-up phase: let JIT / OS caches settle
    for _ in range(warmup):
        func(*args, **kwargs)

    timings = []
    for _ in range(iterations):
        start = time.perf_counter()
        func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        timings.append(elapsed)

    return {
        "mean": statistics.mean(timings),
        "median": statistics.median(timings),
        "stdev": statistics.stdev(timings) if len(timings) > 1 else 0,
        "min": min(timings),
        "max": max(timings),
        "p95": sorted(timings)[int(len(timings) * 0.95)],
        "iterations": iterations,
    }


def print_benchmark(label, results):
    """Pretty-print benchmark results."""
    print(f"\\n{label}:")
    print(f"  Mean   : {results['mean']*1000:.3f} ms")
    print(f"  Median : {results['median']*1000:.3f} ms")
    print(f"  Stdev  : {results['stdev']*1000:.3f} ms")
    print(f"  Min    : {results['min']*1000:.3f} ms")
    print(f"  Max    : {results['max']*1000:.3f} ms")
    print(f"  P95    : {results['p95']*1000:.3f} ms")


# ============================================================
# 5. Usage — putting it all together
# ============================================================
if __name__ == "__main__":
    benchmark_string_methods()
    profile_and_compare()

    # Targeted profiling of a code block
    with profile_block("sorting benchmark"):
        import random
        data = [random.randint(0, 1_000_000) for _ in range(100_000)]
        sorted(data)

    # Robust benchmark comparison
    data = list(range(50_000))
    results_sorted = robust_benchmark(sorted, data)
    results_reversed = robust_benchmark(sorted, data, reverse=True)

    print_benchmark("sorted(ascending)", results_sorted)
    print_benchmark("sorted(descending)", results_reversed)`,
      exercise: `**Exercises:**

1. Use \`timeit\` to compare three ways of checking membership: \`in\` on a list, \`in\` on a set, and \`in\` on a dict. Test with 10, 1,000, and 100,000 elements. Plot or tabulate the results and explain the Big-O behavior you observe.

2. Profile a real function (e.g., reading a CSV and computing aggregates) with \`cProfile\`. Generate a sorted stats report, identify the top 3 hotspot functions, and propose optimizations for each.

3. Build the \`robust_benchmark\` function shown above. Add percentile calculations (p50, p90, p99) and a coefficient of variation metric. Use it to compare list comprehension vs. \`map()\` vs. a generator expression for transforming 1 million integers.

4. Install \`scalene\` (\`pip install scalene\`) and profile a script that performs both CPU-bound computation and memory allocation. Compare scalene's output to cProfile — what additional insights does scalene provide (Python vs. C time, memory allocation, copy overhead)?

5. Write a decorator \`@profile_calls\` that logs every call to a function with its arguments, return value, and execution time. Include a class-level summary that tracks total calls and cumulative time. Use it to instrument a recursive algorithm and analyze the call pattern.

6. Create a benchmarking suite that compares dict vs. OrderedDict vs. defaultdict for 10,000 insertions and 10,000 lookups. Present results in a formatted table with mean, median, and standard deviation columns.`,
      commonMistakes: [
        "Using `time.time()` instead of `time.perf_counter()` for benchmarking. `time.time()` measures wall-clock time with lower resolution and is affected by system clock adjustments (NTP sync). `perf_counter()` uses the highest-resolution monotonic clock available and is the correct choice for measuring elapsed time in benchmarks.",
        "Running a single iteration and drawing conclusions. Execution time varies due to OS scheduling, CPU frequency scaling, garbage collection, and cache effects. Always run multiple iterations and report statistical summaries (mean, median, standard deviation, percentiles).",
        "Profiling with cProfile and assuming the overhead does not affect results. cProfile instruments every function call, which can add 10-30% overhead and distort the relative cost of small functions. For micro-benchmarks, use `timeit`; for production profiling with minimal overhead, use `py-spy` or `scalene`.",
        "Benchmarking with unrealistic data sizes. An algorithm that is fast on 100 elements may be catastrophically slow on 1 million elements due to algorithmic complexity (O(n^2) vs O(n log n)). Always benchmark with production-representative data volumes.",
        "Forgetting to disable garbage collection during micro-benchmarks. `timeit` does this automatically, but manual timing loops do not. A GC pause during a timing run can produce misleading outliers. Use `gc.disable()` around critical measurement sections, or use `timeit` which handles this.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between deterministic profiling and statistical/sampling profiling? Give examples of tools for each.",
          a: "**Deterministic profiling** instruments every function call and records exact entry/exit times. It captures complete call graphs with exact call counts and timings. Examples: `cProfile` (stdlib), `line_profiler`. Advantage: 100% accuracy. Disadvantage: adds overhead to every call, which can slow the program 10-30% and skew results for frequently-called small functions. **Statistical/sampling profiling** periodically interrupts the program (e.g., every 1ms) and records the current call stack. It does not instrument individual calls, so overhead is near-zero. Examples: `py-spy`, `scalene`, `pyinstrument`. Advantage: minimal overhead, safe for production. Disadvantage: may miss very short functions and provides statistical approximations rather than exact counts. **Best practice:** use sampling profilers in production and for initial investigation, then switch to deterministic profilers for detailed analysis of specific hot spots.",
        },
        {
          type: "scenario",
          q: "A data processing pipeline takes 45 minutes to run. Walk through your profiling strategy to reduce it to under 10 minutes.",
          a: "**Step 1: Measure baseline.** Time the entire pipeline end-to-end and each major stage (file I/O, parsing, transformation, aggregation, output). Use `time.perf_counter()` around each stage. **Step 2: Identify the bottleneck.** Run `py-spy` or `scalene` on the full pipeline to find which stage and functions consume the most time. Typically 80% of time is in 20% of code. **Step 3: Analyze the hot path.** Use `line_profiler` on the top 3-5 slowest functions to find the exact bottleneck lines. **Step 4: Apply targeted optimizations.** Common wins: replace Python loops with vectorized NumPy/Pandas operations (10-100x speedup), use generators instead of building large intermediate lists, batch database queries, use `multiprocessing.Pool` for CPU-bound stages, use `asyncio` or threading for I/O-bound stages. **Step 5: Re-measure after each change.** Profile again to verify improvement and check for new bottlenecks. **Step 6: Consider algorithmic changes** — switching from O(n^2) to O(n log n) algorithms often provides the largest gains. **Step 7: If still too slow**, consider Cython for hot loops or moving critical sections to C extensions.",
        },
        {
          type: "coding",
          q: "Write a decorator that benchmarks a function over N runs and prints mean, min, max, and standard deviation of execution times.",
          a: `\\\`\\\`\\\`python
import time
import statistics
from functools import wraps


def benchmark(runs=100):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            timings = []
            result = None
            for _ in range(runs):
                start = time.perf_counter()
                result = func(*args, **kwargs)
                elapsed = time.perf_counter() - start
                timings.append(elapsed)

            mean = statistics.mean(timings)
            stdev = statistics.stdev(timings) if runs > 1 else 0
            print(f"{func.__name__} ({runs} runs):")
            print(f"  Mean : {mean*1000:.3f} ms")
            print(f"  Min  : {min(timings)*1000:.3f} ms")
            print(f"  Max  : {max(timings)*1000:.3f} ms")
            print(f"  Stdev: {stdev*1000:.3f} ms")
            return result
        return wrapper
    return decorator


# Usage:
# @benchmark(runs=50)
# def my_function(data):
#     return sorted(data)
\\\`\\\`\\\``,
        },
      ],
    },
    {
      id: "py-optimization-techniques",
      title: "Optimization Techniques",
      explanation: `Once profiling has identified bottlenecks, targeted optimization techniques can deliver dramatic speedups. The key principle is to **optimize at the right level**: algorithm first, data structure second, implementation third, and low-level tricks last.

**Algorithm & data structure optimization** provides the largest gains. Replacing an O(n^2) nested loop with an O(n) hash-based lookup can turn a 10-minute job into a 1-second job. Common patterns:

- **Use sets for membership testing** — \`x in my_set\` is O(1) vs. O(n) for lists
- **Use dicts for grouping and counting** — \`collections.Counter\`, \`defaultdict\`
- **Use heapq for top-k problems** — O(n log k) instead of O(n log n) full sort
- **Use bisect for sorted sequence operations** — O(log n) binary search

**Python-specific optimizations:**
- **List comprehensions and generator expressions** are faster than equivalent for-loops because the iteration happens in C
- **Built-in functions** (\`sum\`, \`map\`, \`filter\`, \`min\`, \`max\`, \`sorted\`) run in C and avoid Python loop overhead
- **Local variable access** is faster than global or attribute lookups — assign frequently accessed attributes to local variables in tight loops
- **String interning and \`__slots__\`** reduce memory overhead for objects created in large quantities

**NumPy vectorization** replaces Python loops with array operations executed in compiled C/Fortran. Operations that process millions of elements in a Python loop can run 10-100x faster as vectorized NumPy operations. The key is to express computation as **whole-array operations** rather than element-by-element iteration.

**Cython** compiles Python-like code to C, enabling C-level performance for computation-heavy functions while retaining Python interoperability. Adding type annotations to Cython code allows the compiler to generate optimized C code that bypasses the Python object model entirely.

**C extensions** via \`ctypes\` or \`cffi\` let you call existing C libraries directly from Python, and **pybind11** makes it straightforward to write C++ extensions with a Pythonic API. These approaches are appropriate when critical inner loops need maximum performance and the overhead of Python's interpreter is the bottleneck.

**Concurrency** is another optimization dimension: \`multiprocessing\` for CPU-bound parallelism (bypasses the GIL), \`threading\` / \`asyncio\` for I/O-bound concurrency, and \`concurrent.futures\` for a high-level interface to both.`,
      codeExample: `# ============================================================
# 1. Data structure choices — dramatic impact on performance
# ============================================================
import time
from collections import defaultdict, Counter
import heapq
import bisect


def demo_set_vs_list_lookup():
    """Demonstrate O(1) set lookup vs O(n) list lookup."""
    data_list = list(range(1_000_000))
    data_set = set(data_list)
    targets = [500_000, 999_999, 1_000_001]  # exists, exists, missing

    # List lookup — O(n) per lookup
    start = time.perf_counter()
    for target in targets:
        _ = target in data_list
    list_time = time.perf_counter() - start

    # Set lookup — O(1) per lookup
    start = time.perf_counter()
    for target in targets:
        _ = target in data_set
    set_time = time.perf_counter() - start

    print(f"List lookup: {list_time*1000:.3f} ms")
    print(f"Set lookup : {set_time*1000:.3f} ms")
    print(f"Speedup    : {list_time/set_time:.0f}x")


def demo_heapq_top_k():
    """Find top-k elements without full sort."""
    import random
    data = [random.random() for _ in range(1_000_000)]

    # Full sort approach — O(n log n)
    start = time.perf_counter()
    top_10_sort = sorted(data, reverse=True)[:10]
    sort_time = time.perf_counter() - start

    # heapq approach — O(n log k) where k=10
    start = time.perf_counter()
    top_10_heap = heapq.nlargest(10, data)
    heap_time = time.perf_counter() - start

    print(f"\\nTop-10 via sorted()      : {sort_time*1000:.3f} ms")
    print(f"Top-10 via heapq.nlargest: {heap_time*1000:.3f} ms")


# ============================================================
# 2. Loop optimization techniques
# ============================================================
def loop_optimization_demo():
    """Compare loop styles for performance."""
    data = list(range(1_000_000))

    # Slow: Python for-loop with append
    start = time.perf_counter()
    result1 = []
    for x in data:
        result1.append(x * x)
    loop_time = time.perf_counter() - start

    # Faster: List comprehension (C-level iteration)
    start = time.perf_counter()
    result2 = [x * x for x in data]
    comp_time = time.perf_counter() - start

    # Faster: map() with lambda (C-level iteration)
    start = time.perf_counter()
    result3 = list(map(lambda x: x * x, data))
    map_time = time.perf_counter() - start

    print(f"\\nFor-loop + append  : {loop_time*1000:.3f} ms")
    print(f"List comprehension : {comp_time*1000:.3f} ms")
    print(f"map() + lambda     : {map_time*1000:.3f} ms")


# ============================================================
# 3. Local variable optimization in tight loops
# ============================================================
import math


def compute_distances_slow(points):
    """Slow: global/attribute lookups on every iteration."""
    results = []
    for x, y in points:
        dist = math.sqrt(x * x + y * y)
        results.append(dist)
    return results


def compute_distances_fast(points):
    """Fast: cache lookups as local variables."""
    sqrt = math.sqrt  # Local reference to avoid repeated attribute lookup
    return [sqrt(x * x + y * y) for x, y in points]


# ============================================================
# 4. NumPy vectorization — replacing Python loops with C
# ============================================================
def numpy_vectorization_demo():
    """Demonstrate the speedup of NumPy over pure Python."""
    try:
        import numpy as np
    except ImportError:
        print("NumPy not installed — skipping vectorization demo")
        return

    size = 1_000_000

    # Pure Python: element-by-element
    py_list_a = list(range(size))
    py_list_b = list(range(size))

    start = time.perf_counter()
    py_result = [a + b for a, b in zip(py_list_a, py_list_b)]
    py_time = time.perf_counter() - start

    # NumPy: vectorized operation (runs in C)
    np_a = np.arange(size)
    np_b = np.arange(size)

    start = time.perf_counter()
    np_result = np_a + np_b
    np_time = time.perf_counter() - start

    print(f"\\nPython list addition   : {py_time*1000:.3f} ms")
    print(f"NumPy vectorized add   : {np_time*1000:.3f} ms")
    print(f"Speedup                : {py_time/np_time:.0f}x")

    # More complex: element-wise operations
    data = np.random.randn(size)

    start = time.perf_counter()
    # Vectorized: applies sqrt to all elements in C
    normalized = np.where(data > 0, np.sqrt(data), 0.0)
    vec_time = time.perf_counter() - start

    start = time.perf_counter()
    # Python loop: slow element-by-element
    normalized_py = [math.sqrt(x) if x > 0 else 0.0 for x in data]
    py_loop_time = time.perf_counter() - start

    print(f"\\nConditional sqrt (NumPy) : {vec_time*1000:.3f} ms")
    print(f"Conditional sqrt (Python): {py_loop_time*1000:.3f} ms")
    print(f"Speedup                  : {py_loop_time/vec_time:.0f}x")


# ============================================================
# 5. functools optimizations — caching and partial
# ============================================================
from functools import lru_cache


@lru_cache(maxsize=256)
def expensive_computation(n):
    """Simulates an expensive calculation with automatic caching."""
    time.sleep(0.001)  # Simulate work
    return sum(i * i for i in range(n))


def lru_cache_demo():
    """Show cache hit/miss behavior."""
    # First calls — cache misses
    start = time.perf_counter()
    for i in range(100):
        expensive_computation(i)
    cold_time = time.perf_counter() - start

    # Repeated calls — cache hits
    start = time.perf_counter()
    for i in range(100):
        expensive_computation(i)
    warm_time = time.perf_counter() - start

    info = expensive_computation.cache_info()
    print(f"\\nLRU Cache demo:")
    print(f"  Cold (misses): {cold_time*1000:.1f} ms")
    print(f"  Warm (hits)  : {warm_time*1000:.1f} ms")
    print(f"  Cache info   : {info}")


# ============================================================
# 6. Multiprocessing for CPU-bound parallelism
# ============================================================
from multiprocessing import Pool
from concurrent.futures import ProcessPoolExecutor


def cpu_bound_task(n):
    """Simulate a CPU-intensive calculation."""
    return sum(i * i for i in range(n))


def parallel_vs_sequential():
    """Compare sequential vs parallel execution."""
    tasks = [500_000] * 8  # 8 identical tasks

    # Sequential
    start = time.perf_counter()
    sequential_results = [cpu_bound_task(n) for n in tasks]
    seq_time = time.perf_counter() - start

    # Parallel with ProcessPoolExecutor
    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        parallel_results = list(executor.map(cpu_bound_task, tasks))
    par_time = time.perf_counter() - start

    print(f"\\nSequential : {seq_time*1000:.1f} ms")
    print(f"Parallel   : {par_time*1000:.1f} ms")
    print(f"Speedup    : {seq_time/par_time:.1f}x")


# ============================================================
# Usage
# ============================================================
if __name__ == "__main__":
    demo_set_vs_list_lookup()
    demo_heapq_top_k()
    loop_optimization_demo()
    numpy_vectorization_demo()
    lru_cache_demo()
    parallel_vs_sequential()`,
      exercise: `**Exercises:**

1. Write a function that finds duplicate values in a list of 1 million integers. Implement three approaches: nested loop O(n^2), sorted comparison O(n log n), and set-based O(n). Benchmark all three and verify the algorithmic complexity difference in practice.

2. Take a function that processes a list of dictionaries using a for-loop (e.g., filtering by a condition and transforming a field). Rewrite it using list comprehension, \`map\`/\`filter\`, and a generator expression. Benchmark all four approaches with 1 million records.

3. Install NumPy and rewrite a pure Python function that computes pairwise Euclidean distances between two lists of 2D points. Compare the pure Python nested-loop version with a vectorized NumPy version. Measure the speedup for 10,000 points.

4. Use \`functools.lru_cache\` to optimize a recursive function (e.g., Levenshtein edit distance or the partition function). Measure the speedup and print cache hit/miss statistics using \`cache_info()\`. Experiment with different \`maxsize\` values.

5. Implement a CPU-bound task (e.g., computing prime numbers up to N) and run it on 8 inputs sequentially vs. in parallel using \`ProcessPoolExecutor\`. Measure the speedup and explain why it does not achieve a perfect 8x improvement.

6. Profile a function that uses string concatenation in a loop (\`+=\`), then optimize it using \`str.join()\`, \`io.StringIO\`, and \`"".join(list)\`. Benchmark all four and explain why \`+=\` is O(n^2) for strings while \`join\` is O(n).`,
      commonMistakes: [
        "Optimizing before profiling. Developers often guess which code is slow and optimize the wrong thing. Always profile first with `cProfile` or `scalene` to find the actual bottleneck. The 80/20 rule applies: 80% of execution time is typically in 20% of the code.",
        "Using NumPy but still iterating element-by-element with Python loops. The entire point of NumPy is vectorized operations that execute in C. Writing `for i in range(len(arr)): arr[i] = arr[i] * 2` defeats the purpose — use `arr *= 2` instead.",
        "Choosing `multiprocessing` for I/O-bound tasks or `threading` for CPU-bound tasks. Due to the GIL, threads cannot achieve true parallelism for CPU-bound work. Use `multiprocessing` or `ProcessPoolExecutor` for CPU-bound tasks, and `asyncio` or `threading` for I/O-bound tasks.",
        "Overusing `lru_cache` without considering memory. Each cached result stays in memory until the cache is full. For functions with many unique arguments, the cache grows unboundedly (with `maxsize=None`) and can cause memory issues. Always set an appropriate `maxsize` and monitor with `cache_info()`.",
        "Premature micro-optimization of Python code when the real solution is choosing a better algorithm. Shaving 10% off an O(n^2) algorithm is meaningless if an O(n log n) alternative exists. Focus on algorithmic complexity before implementation-level tricks.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why are list comprehensions faster than equivalent for-loops in Python? What is happening under the hood?",
          a: "List comprehensions are faster for two reasons. **First**, the iteration and element appending happen in a specialized bytecode operation (`LIST_APPEND`) that runs at C level inside the interpreter, avoiding the overhead of looking up and calling the `list.append` method on every iteration. In a for-loop, each `append()` call requires a method lookup, a function call frame, and argument passing — all Python-level overhead. **Second**, comprehensions use a dedicated code object that keeps loop variables and the accumulating list in fast local slots, while the equivalent loop may involve additional name lookups. The speedup is typically 10-30% for simple operations. However, comprehensions should not be used purely for side effects (e.g., `[print(x) for x in data]`) — that is an anti-pattern because it builds a useless list of `None` values.",
        },
        {
          type: "scenario",
          q: "You have a Python ETL pipeline that processes 50GB of CSV data. Currently it takes 6 hours. How would you optimize it?",
          a: "**Phase 1 — Profile:** Run `scalene` or `py-spy` to identify bottlenecks. Common culprits: CSV parsing, string operations, row-by-row processing, memory allocation. **Phase 2 — Data loading:** Replace `csv.reader` with Polars (`polars.read_csv`) or PyArrow, which parse CSV 10-50x faster using Rust/C++ backends and columnar memory layout. Use lazy evaluation (`polars.scan_csv`) to push down filters and avoid loading unnecessary columns. **Phase 3 — Processing:** Replace Python row-by-row loops with vectorized Polars/Pandas operations. Express transformations as column operations, not row iterations. **Phase 4 — Memory:** Process data in chunks (`polars.scan_csv` handles this automatically) instead of loading all 50GB into RAM. Use appropriate dtypes (`int32` instead of `int64`, `categorical` for repeated strings). **Phase 5 — Parallelism:** Polars automatically parallelizes operations across CPU cores. For custom processing, partition the data and use `multiprocessing`. **Phase 6 — Format change:** If this pipeline runs repeatedly, convert CSV to Parquet on first load. Parquet is columnar, compressed (10x smaller), and 100x faster to read selectively. Expected result: 6 hours reduced to 5-15 minutes with Polars + Parquet.",
        },
        {
          type: "coding",
          q: "Write a function that finds the top-k most frequent words in a large text using the most efficient approach.",
          a: `\\\`\\\`\\\`python
from collections import Counter
import heapq


def top_k_words(text, k=10):
    """
    Find the top-k most frequent words.
    Time: O(n + m log k) where n=total words, m=unique words
    Space: O(m) for the counter
    """
    # Counter is implemented in C for speed
    word_counts = Counter(text.lower().split())

    # heapq.nlargest is O(m log k), faster than
    # sorting all m entries when k << m
    return heapq.nlargest(k, word_counts.items(), key=lambda x: x[1])


# For very large texts, use a streaming approach:
def top_k_words_streaming(file_path, k=10, chunk_size=8192):
    """Process a large file in chunks without loading it all."""
    counts = Counter()
    with open(file_path, "r") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            counts.update(chunk.lower().split())
    return heapq.nlargest(k, counts.items(), key=lambda x: x[1])
\\\`\\\`\\\``,
        },
        {
          type: "conceptual",
          q: "Explain the GIL (Global Interpreter Lock) and its impact on Python performance. How do you work around it?",
          a: "The **GIL** is a mutex in CPython that allows only one thread to execute Python bytecode at a time. It exists to protect CPython's reference-counting memory management from race conditions. **Impact:** CPU-bound multi-threaded code gets **no parallel speedup** — threads take turns executing, often slower than single-threaded due to context-switching overhead. I/O-bound code is unaffected because the GIL is released during I/O operations (network, file, sleep). **Workarounds:** (1) **multiprocessing** — each process has its own GIL, enabling true parallelism for CPU-bound work; (2) **C extensions** — NumPy, Pandas, and other libraries release the GIL during computation in C/Fortran; (3) **asyncio** — for I/O-bound concurrency without threads; (4) **Cython with `nogil`** — release the GIL in typed Cython code; (5) **sub-interpreters** (Python 3.12+) — experimental per-interpreter GIL; (6) **free-threaded CPython** (Python 3.13+ experimental, 3.14+ improving) — optional build without the GIL (`python --disable-gil`). For most workloads, `multiprocessing` or using GIL-releasing libraries is the practical solution.",
        },
      ],
    },
    {
      id: "py-memory-management",
      title: "Memory Management",
      explanation: `Understanding Python's memory management is essential for writing efficient programs, especially when dealing with large datasets, long-running services, or memory-constrained environments. CPython uses a combination of **reference counting** and a **cyclic garbage collector** to manage memory automatically.

**Reference counting** is the primary mechanism. Every Python object has a reference count — an integer tracking how many variables, containers, or attributes point to it. When an object's reference count drops to zero, CPython immediately deallocates it. You can inspect reference counts with \`sys.getrefcount()\` (note: calling the function itself adds a temporary reference).

**Cyclic garbage collector** handles reference cycles — situations where objects reference each other, keeping their reference counts above zero even when no external references exist. The GC uses a **generational algorithm** with three generations (0, 1, 2). New objects start in generation 0. Objects that survive a collection are promoted to the next generation. Higher generations are collected less frequently, based on the observation that long-lived objects tend to stay alive.

**\`__slots__\`** is a class-level optimization that replaces the per-instance \`__dict__\` (a hash table) with a fixed-size array of slot descriptors. This reduces memory per instance by 40-60% for classes with few attributes and also speeds up attribute access. The tradeoff: you cannot dynamically add attributes not listed in \`__slots__\`.

**weakref** provides references to objects that do not increase the reference count. When the referent is garbage-collected, the weak reference returns \`None\` (or calls a callback). This is critical for caches, observer patterns, and parent-child relationships where you want to avoid preventing garbage collection.

**Common memory leak patterns:**
- **Circular references** with \`__del__\` methods (pre-Python 3.4 could not collect these)
- **Unbounded caches** — dictionaries or lists that grow without limit
- **Global-scope accumulation** — appending to module-level lists in loops or requests
- **Closures capturing large objects** — inner functions retaining references to large enclosing-scope variables
- **C extension objects** — objects allocated by C libraries that Python's GC cannot track

**Measuring object size:** \`sys.getsizeof()\` returns the memory consumed by a single object (not counting nested objects). For deep size measurement, use \`pympler.asizeof()\` or manually walk the object graph with \`gc.get_referents()\`.`,
      codeExample: `# ============================================================
# 1. Reference counting basics
# ============================================================
import sys
import gc


def reference_counting_demo():
    """Demonstrate how reference counting works in CPython."""
    a = [1, 2, 3]  # refcount = 1 (variable 'a')
    print(f"After creation    : refcount = {sys.getrefcount(a) - 1}")
    # Note: getrefcount adds 1 for the function argument itself

    b = a           # refcount = 2 (a and b point to same list)
    print(f"After b = a       : refcount = {sys.getrefcount(a) - 1}")

    c = [a, a, a]   # refcount = 5 (a, b, and 3 slots in c)
    print(f"After c = [a,a,a] : refcount = {sys.getrefcount(a) - 1}")

    del c            # refcount = 2 (removed 3 references from c)
    print(f"After del c       : refcount = {sys.getrefcount(a) - 1}")

    del b            # refcount = 1
    print(f"After del b       : refcount = {sys.getrefcount(a) - 1}")
    # When refcount hits 0, memory is freed immediately


# ============================================================
# 2. Garbage collector — handling reference cycles
# ============================================================
def gc_demo():
    """Demonstrate cyclic garbage collection."""
    gc.collect()  # Clear any pending garbage
    gc.set_debug(gc.DEBUG_STATS)

    # Create a reference cycle
    class Node:
        def __init__(self, name):
            self.name = name
            self.ref = None

    a = Node("A")
    b = Node("B")
    a.ref = b     # A -> B
    b.ref = a     # B -> A (cycle!)

    # Remove external references
    del a
    del b
    # Refcounts are still 1 (due to the cycle), so reference
    # counting alone cannot free them

    # Force garbage collection — the cyclic GC detects and frees them
    collected = gc.collect()
    print(f"\\nGC collected {collected} objects (including the cycle)")

    # Inspect GC generations
    print(f"GC thresholds: {gc.get_threshold()}")
    print(f"GC counts    : {gc.get_count()}")

    gc.set_debug(0)  # Reset debug


# ============================================================
# 3. __slots__ — Memory-efficient classes
# ============================================================
class PointRegular:
    """Regular class — uses __dict__ for attribute storage."""
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z


class PointSlots:
    """Slotted class — fixed attribute storage, no __dict__."""
    __slots__ = ("x", "y", "z")

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z


def slots_comparison():
    """Compare memory usage of regular vs slotted classes."""
    regular = PointRegular(1.0, 2.0, 3.0)
    slotted = PointSlots(1.0, 2.0, 3.0)

    regular_size = sys.getsizeof(regular) + sys.getsizeof(regular.__dict__)
    slotted_size = sys.getsizeof(slotted)

    print(f"\\nRegular class size: {regular_size} bytes")
    print(f"Slotted class size: {slotted_size} bytes")
    print(f"Savings           : {regular_size - slotted_size} bytes "
          f"({(1 - slotted_size/regular_size)*100:.0f}%)")

    # Scale test: create 1 million instances
    import tracemalloc
    tracemalloc.start()

    regular_list = [PointRegular(i, i+1, i+2) for i in range(100_000)]
    regular_mem = tracemalloc.get_traced_memory()[0]

    tracemalloc.stop()
    tracemalloc.start()

    slotted_list = [PointSlots(i, i+1, i+2) for i in range(100_000)]
    slotted_mem = tracemalloc.get_traced_memory()[0]

    tracemalloc.stop()

    print(f"\\n100K regular instances: {regular_mem / 1024 / 1024:.1f} MB")
    print(f"100K slotted instances: {slotted_mem / 1024 / 1024:.1f} MB")

    # Clean up
    del regular_list, slotted_list


# ============================================================
# 4. weakref — Non-preventing references
# ============================================================
import weakref


class ExpensiveResource:
    """Simulates a large cached object."""
    def __init__(self, name, data_size=1_000_000):
        self.name = name
        self.data = bytearray(data_size)  # ~1MB

    def __repr__(self):
        return f"ExpensiveResource({self.name!r})"

    def __del__(self):
        print(f"  [GC] {self.name} deallocated")


def weakref_demo():
    """Demonstrate weak references for caching."""
    print("\\n--- weakref demo ---")

    # Strong reference keeps object alive
    resource = ExpensiveResource("primary")
    weak = weakref.ref(resource)

    print(f"Weak ref alive: {weak() is not None}")  # True
    print(f"Object: {weak()}")

    # Delete strong reference — object is freed
    del resource
    print(f"After del: weak ref alive: {weak() is not None}")  # False


class WeakCache:
    """Cache that does not prevent garbage collection."""

    def __init__(self):
        self._cache = weakref.WeakValueDictionary()
        self._stats = {"hits": 0, "misses": 0}

    def get_or_create(self, key, factory):
        """Retrieve from cache or create with factory function."""
        obj = self._cache.get(key)
        if obj is not None:
            self._stats["hits"] += 1
            return obj

        self._stats["misses"] += 1
        obj = factory(key)
        self._cache[key] = obj
        return obj

    @property
    def stats(self):
        return {**self._stats, "cached": len(self._cache)}


def weak_cache_demo():
    """Demonstrate WeakValueDictionary cache."""
    print("\\n--- WeakCache demo ---")
    cache = WeakCache()

    # Create and cache resources
    refs = []
    for name in ["alpha", "beta", "gamma"]:
        resource = cache.get_or_create(name, ExpensiveResource)
        refs.append(resource)

    print(f"Cache stats: {cache.stats}")

    # Access cached items (hits)
    for name in ["alpha", "beta"]:
        cache.get_or_create(name, ExpensiveResource)

    print(f"After re-access: {cache.stats}")

    # Release some strong references — objects may be GC'd
    del refs[0]  # Release "alpha"
    gc.collect()
    print(f"After releasing alpha: {cache.stats}")


# ============================================================
# 5. Memory leak detection with tracemalloc
# ============================================================
import tracemalloc


def detect_memory_leak():
    """Use tracemalloc to find memory leaks."""
    tracemalloc.start()
    snapshot1 = tracemalloc.take_snapshot()

    # Simulate a memory leak: data accumulates in a global list
    leaked_data = []
    for i in range(1000):
        leaked_data.append(" " * 10_000)  # 10KB strings

    snapshot2 = tracemalloc.take_snapshot()

    # Compare snapshots to find where memory grew
    stats = snapshot2.compare_to(snapshot1, "lineno")

    print("\\nTop 5 memory increases:")
    for stat in stats[:5]:
        print(f"  {stat}")

    current, peak = tracemalloc.get_traced_memory()
    print(f"\\nCurrent: {current / 1024 / 1024:.2f} MB")
    print(f"Peak   : {peak / 1024 / 1024:.2f} MB")

    tracemalloc.stop()


# ============================================================
# 6. Object size inspection
# ============================================================
def inspect_object_sizes():
    """Show memory consumed by different Python objects."""
    objects = {
        "int (0)": 0,
        "int (1)": 1,
        "int (2**30)": 2**30,
        "float": 3.14,
        "str (empty)": "",
        "str (10 chars)": "0123456789",
        "bytes (empty)": b"",
        "bytes (10)": b"0123456789",
        "list (empty)": [],
        "list (10 ints)": list(range(10)),
        "dict (empty)": {},
        "dict (10 items)": {i: i for i in range(10)},
        "set (empty)": set(),
        "set (10 items)": set(range(10)),
        "tuple (empty)": (),
        "tuple (10)": tuple(range(10)),
    }

    print("\\nObject sizes (sys.getsizeof):")
    print(f"  {'Type':<20} {'Size (bytes)':>12}")
    print(f"  {'-'*20} {'-'*12}")
    for label, obj in objects.items():
        size = sys.getsizeof(obj)
        print(f"  {label:<20} {size:>12}")


# ============================================================
# Usage
# ============================================================
if __name__ == "__main__":
    reference_counting_demo()
    gc_demo()
    slots_comparison()
    weakref_demo()
    weak_cache_demo()
    detect_memory_leak()
    inspect_object_sizes()`,
      exercise: `**Exercises:**

1. Create a class with and without \`__slots__\`. Instantiate 1 million objects of each and measure memory usage with \`tracemalloc\`. Calculate the per-instance memory savings. Try adding a dynamic attribute to the slotted class and observe the \`AttributeError\`.

2. Build a reference cycle detector: write a function that creates objects with circular references, then use \`gc.get_referrers()\` and \`gc.get_referents()\` to trace the cycle. Force collection with \`gc.collect()\` and verify the objects were freed.

3. Implement a \`WeakCache\` class using \`weakref.WeakValueDictionary\`. Create cached objects, hold strong references to some, delete others, and verify that the cache automatically shrinks. Add hit/miss statistics.

4. Use \`tracemalloc\` snapshot comparison to find a simulated memory leak: write a function that appends to a module-level list on each call. Take snapshots before and after 1000 calls, compare them, and identify the leaking line.

5. Write a function that measures the deep size of a nested data structure (dict of lists of dicts) by recursively walking \`gc.get_referents()\` and summing \`sys.getsizeof()\`. Compare your result with \`pympler.asizeof()\` if available.

6. Experiment with \`gc.set_threshold()\` to change garbage collection frequency. Create a program that generates many short-lived reference cycles. Measure performance with different threshold settings and explain the tradeoff between collection frequency and pause time.`,
      commonMistakes: [
        "Assuming `sys.getsizeof()` returns the total memory of a container. It only returns the shallow size of the object itself, not its contents. A list's `getsizeof` returns the size of the list structure (pointers), not the objects it contains. For deep size, recursively walk referents or use `pympler.asizeof()`.",
        "Using `__slots__` in classes that need dynamic attributes or multiple inheritance with conflicting slots. Slots prevent adding arbitrary attributes and can cause issues with complex inheritance hierarchies. Only use `__slots__` for data-heavy classes where you create many instances and the attribute set is known and fixed.",
        "Relying on `__del__` (finalizers) for resource cleanup. `__del__` has unpredictable timing, can cause issues with reference cycles (pre-3.4), and is not guaranteed to run at all during interpreter shutdown. Use context managers (`with` statement) and `try/finally` for deterministic cleanup instead.",
        "Ignoring memory leaks in long-running services. Patterns like appending to global lists, unbounded caches, circular references in callback registrations, and closures capturing request-scoped data all cause gradual memory growth. Monitor RSS over time and use `tracemalloc` snapshot comparison to find the source.",
        "Calling `gc.disable()` without understanding the consequences. Disabling the GC eliminates pause times but means reference cycles will never be freed, causing memory leaks. Only disable GC temporarily during benchmarks or latency-critical sections, and re-enable immediately after.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Python's garbage collector work? Explain both reference counting and the cyclic GC.",
          a: "CPython uses a **two-layer** memory management system. **Layer 1 — Reference counting:** Every object has a `ob_refcnt` field. When a reference is created (assignment, container insertion, function argument), the count increments. When a reference is removed (del, reassignment, scope exit), it decrements. When the count reaches zero, the object is **immediately** deallocated and its memory freed. This handles 95%+ of objects and provides deterministic, low-latency cleanup. **Layer 2 — Cyclic garbage collector:** Reference counting cannot handle cycles (A references B, B references A — both have refcount 1 even with no external references). The GC uses a **generational** algorithm with 3 generations. Generation 0 holds new objects. When generation 0 fills up (default threshold: 700 allocations), the GC runs: it finds all objects reachable from known roots, marks unreachable cycle members as garbage, and frees them. Survivors are promoted to generation 1. Generation 1 is collected less often, and generation 2 even less. This exploits the **generational hypothesis**: most objects die young, so checking young objects frequently and old objects rarely is efficient.",
        },
        {
          type: "scenario",
          q: "A Django web application's memory usage grows by 50MB per hour in production. How do you diagnose and fix the memory leak?",
          a: "**Step 1: Confirm the leak.** Monitor RSS (Resident Set Size) over time with `psutil` or container metrics. A steadily growing RSS that never decreases (even after traffic drops) confirms a leak. **Step 2: Reproduce locally.** Run the app under load testing (`locust`) and monitor memory with `tracemalloc`. Take snapshots every N requests and compare them to find which lines are allocating growing memory. **Step 3: Common Django leak patterns to check:** (a) **QuerySet caching** — iterating over large querysets without `.iterator()` caches all results in memory; (b) **Signal handlers** accumulating references; (c) **Global/module-level caches** (dicts, lists) growing unboundedly — add `maxsize` or TTL eviction; (d) **Logging handlers** with large buffers; (e) **Middleware** storing per-request data on module-level objects. **Step 4: Use `objgraph`** to visualize which object types are growing: `objgraph.show_growth()` between requests. **Step 5: Fix** by adding LRU bounds to caches, using `weakref` for observer patterns, ensuring querysets use `.iterator()` for large results, and adding periodic `gc.collect()` calls if cycles are involved. **Step 6: Add monitoring** — track `gc.get_count()` and object counts by type in production metrics.",
        },
        {
          type: "coding",
          q: "Write a class using `__slots__` that stores 3D point data. Show that it uses less memory than a regular class by creating 100,000 instances of each.",
          a: `\\\`\\\`\\\`python
import sys
import tracemalloc


class Point3DRegular:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z


class Point3DSlots:
    __slots__ = ("x", "y", "z")

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z


def compare_memory(n=100_000):
    tracemalloc.start()
    regular = [Point3DRegular(i, i+1, i+2) for i in range(n)]
    regular_mem = tracemalloc.get_traced_memory()[0]
    del regular
    tracemalloc.stop()

    tracemalloc.start()
    slotted = [Point3DSlots(i, i+1, i+2) for i in range(n)]
    slotted_mem = tracemalloc.get_traced_memory()[0]
    del slotted
    tracemalloc.stop()

    print(f"Regular: {regular_mem / 1024 / 1024:.1f} MB")
    print(f"Slotted: {slotted_mem / 1024 / 1024:.1f} MB")
    print(f"Savings: {(1 - slotted_mem / regular_mem) * 100:.0f}%")


compare_memory()
\\\`\\\`\\\``,
        },
      ],
    },
  ],
};

export default pyPhase13;
