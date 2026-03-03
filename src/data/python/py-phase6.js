const pyPhase6 = {
  id: "phase-6",
  title: "Phase 6: Advanced Python Features",
  emoji: "\u{1F680}",
  description:
    "Master advanced Python features \u2014 decorators, generators, iterators, context managers, metaclasses, and production-grade type hinting.",
  topics: [
    {
      id: "py-decorators",
      title: "Decorators",
      explanation: `Decorators are one of Python's most powerful metaprogramming tools. A decorator is a **callable that takes a function (or class) and returns a modified version** of it. They enable clean separation of cross-cutting concerns like logging, authentication, caching, and validation without polluting business logic.

**How decorators work under the hood:**
\`\`\`python
@my_decorator
def func():
    pass
# is syntactic sugar for:
func = my_decorator(func)
\`\`\`

**Key concepts:**

| Concept | Description |
|---|---|
| **Function decorator** | Takes a function, returns a wrapped function |
| **Class decorator** | Takes a class, returns a modified class |
| **\`@functools.wraps\`** | Preserves the original function's \`__name__\`, \`__doc__\`, and \`__module__\` |
| **Parameterized decorator** | A decorator factory that accepts arguments and returns the actual decorator |
| **Stacking** | Multiple decorators applied bottom-up: the closest to \`def\` runs first |

**Decorator execution order with stacking:**
\`\`\`python
@decorator_a    # Applied SECOND (outermost)
@decorator_b    # Applied FIRST (innermost)
def func():
    pass
# Equivalent to: func = decorator_a(decorator_b(func))
\`\`\`

**Why \`@functools.wraps\` matters:** Without it, the decorated function loses its identity \u2014 \`func.__name__\` returns the wrapper's name, \`help(func)\` shows the wrapper's docstring, and debugging tools report incorrect names. Always use \`@wraps\` in production decorators.

**Class decorators** modify or replace an entire class. Common uses include adding methods, registering classes in a plugin system, or wrapping all methods with instrumentation. Unlike metaclasses, class decorators are simpler and more explicit.`,
      codeExample: `# ============================================================
# Basic function decorator with @wraps
# ============================================================
import functools
import time
import logging
from typing import Any, Callable, TypeVar

logger = logging.getLogger(__name__)

F = TypeVar("F", bound=Callable[..., Any])


def timer(func: F) -> F:
    """Measure and log execution time of a function."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper


@timer
def slow_computation(n: int) -> int:
    """Compute the sum of squares up to n."""
    return sum(i * i for i in range(n))


result = slow_computation(1_000_000)
print(slow_computation.__name__)  # "slow_computation" (preserved by @wraps)


# ============================================================
# Parameterized decorator (decorator factory)
# ============================================================
def retry(max_attempts: int = 3, delay: float = 1.0, exceptions=(Exception,)):
    """Retry a function on failure with configurable attempts and delay."""
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    logger.warning(
                        f"{func.__name__} attempt {attempt}/{max_attempts} "
                        f"failed: {e}"
                    )
                    if attempt < max_attempts:
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator


@retry(max_attempts=3, delay=0.5, exceptions=(ConnectionError, TimeoutError))
def fetch_data(url: str) -> dict:
    """Fetch data from an external API."""
    import random
    if random.random() < 0.7:
        raise ConnectionError("Server unavailable")
    return {"status": "ok", "url": url}


# ============================================================
# Stacking decorators
# ============================================================
def validate_positive(func):
    """Ensure all numeric arguments are positive."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        for arg in args:
            if isinstance(arg, (int, float)) and arg < 0:
                raise ValueError(f"Negative argument: {arg}")
        for key, val in kwargs.items():
            if isinstance(val, (int, float)) and val < 0:
                raise ValueError(f"Negative keyword argument {key}={val}")
        return func(*args, **kwargs)
    return wrapper


@timer              # Outer: measures total time including validation
@validate_positive  # Inner: validates first, then runs function
def calculate_price(base: float, tax_rate: float) -> float:
    """Calculate total price with tax."""
    return base * (1 + tax_rate)


price = calculate_price(100.0, 0.08)  # $108.00


# ============================================================
# Class decorator
# ============================================================
def singleton(cls):
    """Ensure only one instance of a class exists."""
    instances = {}

    @functools.wraps(cls, updated=[])
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance


@singleton
class DatabaseConnection:
    def __init__(self, host: str = "localhost", port: int = 5432):
        self.host = host
        self.port = port
        print(f"Connecting to {host}:{port}")

    def query(self, sql: str) -> str:
        return f"Executed: {sql}"


db1 = DatabaseConnection("prod-db", 5432)  # prints "Connecting to prod-db:5432"
db2 = DatabaseConnection("other-host", 3306)  # No print! Returns same instance
print(db1 is db2)  # True


# ============================================================
# Decorator that works with or without arguments
# ============================================================
def cache(func=None, *, maxsize=128):
    """LRU cache decorator that works with or without parentheses.

    Usage:
        @cache          # No arguments
        @cache()        # Empty arguments
        @cache(maxsize=256)  # With arguments
    """
    def decorator(fn):
        return functools.lru_cache(maxsize=maxsize)(fn)

    if func is not None:
        # Called without arguments: @cache
        return decorator(func)
    # Called with arguments: @cache(maxsize=256)
    return decorator


@cache
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


@cache(maxsize=256)
def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)


# ============================================================
# Method decorator with descriptor protocol awareness
# ============================================================
def audit_method(func):
    """Log method calls with class name and arguments."""
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        cls_name = self.__class__.__name__
        logger.info(f"{cls_name}.{func.__name__} called with args={args}")
        result = func(self, *args, **kwargs)
        logger.info(f"{cls_name}.{func.__name__} returned {result!r}")
        return result
    return wrapper


class OrderService:
    @audit_method
    def place_order(self, item: str, quantity: int) -> dict:
        return {"item": item, "quantity": quantity, "status": "placed"}

    @audit_method
    def cancel_order(self, order_id: str) -> dict:
        return {"order_id": order_id, "status": "cancelled"}`,
      exercise: `**Exercises:**

1. Write a \`@debug\` decorator that prints the function name, all arguments (positional and keyword), and the return value every time the function is called. Use \`@functools.wraps\` to preserve metadata.

2. Create a parameterized \`@rate_limit(calls=5, period=60)\` decorator that raises \`RuntimeError\` if the decorated function is called more than \`calls\` times within \`period\` seconds. Track call timestamps in a list.

3. Build a \`@validate_types\` decorator that reads function annotations and raises \`TypeError\` if any argument's type doesn't match its annotation. Handle \`*args\` and \`**kwargs\` gracefully.

4. Implement a \`@memoize\` decorator from scratch (no \`functools.lru_cache\`) that caches results in a dictionary. Add a \`.cache_clear()\` method to the wrapper function and a \`.cache_info()\` method that returns hits and misses.

5. Write a class decorator \`@auto_repr\` that automatically generates a \`__repr__\` method based on \`__init__\` parameters using \`inspect.signature\`. The generated repr should look like \`ClassName(param1=value1, param2=value2)\`.

6. Stack three decorators on one function: \`@timer\`, \`@retry(max_attempts=3)\`, and \`@validate_positive\`. Predict and verify the order of execution.`,
      commonMistakes: [
        "Forgetting `@functools.wraps(func)` on the inner wrapper. Without it, `func.__name__`, `__doc__`, and `__module__` are replaced by the wrapper's metadata, breaking debugging, logging, and documentation tools.",
        "Confusing a decorator with a decorator factory. `@retry` (no parentheses) passes the function as the first argument; `@retry()` (with parentheses) calls the factory first, then passes the function to the returned decorator. Mixing these up causes `TypeError`.",
        "Mutating shared mutable state in decorator closures without understanding scope. For example, using a plain list for caching works per-function, but if the decorator is applied to multiple functions, each gets its own closure \u2014 unless you accidentally reference a shared object.",
        "Decorating methods without accounting for `self`. A generic decorator using `*args, **kwargs` works fine, but if you explicitly name parameters, forgetting `self` for instance methods causes `TypeError: missing 1 required positional argument`.",
        "Applying decorators in the wrong order when stacking. The decorator closest to the function definition runs first (innermost). `@auth` above `@timer` means timing includes auth overhead; reversing them means auth wraps the already-timed function.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain how Python decorators work under the hood. What is the relationship between `@decorator` syntax and higher-order functions?",
          a: "A decorator is a **higher-order function** that takes a callable and returns a callable. The `@decorator` syntax is syntactic sugar: `@dec def f(): pass` is identical to `f = dec(f)`. When Python encounters `@decorator`, it: 1) defines the function normally, 2) passes it to the decorator, 3) rebinds the name to the decorator's return value. The decorator typically returns a **closure** (inner function) that wraps the original, adding behavior before/after the call. `@functools.wraps` copies `__name__`, `__doc__`, `__dict__`, and `__module__` from the original to the wrapper so introspection still works.",
        },
        {
          type: "tricky",
          q: "What is the difference between `@decorator` and `@decorator()`? When would each form cause an error?",
          a: "`@decorator` passes the decorated function **directly** to `decorator` as the first argument. `@decorator()` **calls** `decorator()` first (with no arguments), and the return value is then used as the decorator. If `decorator` expects to receive the function directly, using `@decorator()` will fail because `decorator()` receives no arguments. Conversely, if `decorator` is a factory that returns the real decorator, using `@decorator` without parentheses will pass the function where the factory expects configuration arguments. To support both forms, use a pattern like: `def dec(func=None, *, option=default): ...` that detects whether `func` is provided.",
        },
        {
          type: "scenario",
          q: "You need to add logging, authentication, and rate-limiting to 50 API endpoints. How would you design a decorator-based solution?",
          a: "Create three independent, composable decorators: 1) `@log_request` \u2014 logs method, path, user, and timing. 2) `@require_auth(roles=['admin'])` \u2014 parameterized decorator that checks credentials and roles, returning 401/403 on failure. 3) `@rate_limit(calls=100, period=60)` \u2014 tracks calls per user with a sliding window (using Redis in production). Stack them in order: `@log_request` (outermost, logs everything including auth failures) > `@require_auth` > `@rate_limit` (innermost). Each uses `@functools.wraps` for debuggability. For DRY application across 50 endpoints, create a combined `@api_endpoint(auth_roles, rate)` factory that applies all three, or use a class-based decorator that composes them.",
        },
      ],
    },
    {
      id: "py-generators-iterators",
      title: "Generators & Iterators",
      explanation: `Generators and iterators are at the heart of Python's approach to working with sequences of data. They enable **lazy evaluation** \u2014 producing values one at a time, on demand, rather than computing and storing an entire sequence in memory.

**The Iterator Protocol:**
Any object that implements \`__iter__()\` (returns the iterator) and \`__next__()\` (returns the next value or raises \`StopIteration\`) is an iterator. Every \`for\` loop in Python uses this protocol internally.

\`\`\`python
# What a for loop actually does:
iterator = iter(collection)    # calls collection.__iter__()
while True:
    try:
        item = next(iterator)  # calls iterator.__next__()
    except StopIteration:
        break
\`\`\`

**Generators** are the easy way to create iterators. A function with \`yield\` becomes a generator function \u2014 calling it returns a **generator object** that implements the iterator protocol automatically.

| Feature | List | Generator |
|---|---|---|
| Memory | Stores all items | Stores one item at a time |
| Access | Random access (\`lst[i]\`) | Sequential only |
| Reusability | Iterate multiple times | Single-pass (exhausted after one iteration) |
| Creation | \`[x for x in range(n)]\` | \`(x for x in range(n))\` |

**\`yield\` vs \`return\`:**
- \`return\` terminates the function and sends a value back
- \`yield\` **suspends** the function, saves its state, and produces a value. The function resumes from where it left off on the next \`next()\` call

**Generator expressions** are the generator equivalent of list comprehensions \u2014 use parentheses instead of brackets: \`(x*x for x in range(10))\`. They're ideal for feeding into functions that consume iterables: \`sum(x*x for x in range(10))\`.

**\`itertools\`** is Python's standard library module for composing efficient iterators. Key functions: \`chain\`, \`islice\`, \`groupby\`, \`product\`, \`combinations\`, \`count\`, \`cycle\`, \`repeat\`, and \`tee\`.`,
      codeExample: `# ============================================================
# Basic generator function
# ============================================================
def countdown(n: int):
    """Yield numbers from n down to 1."""
    print(f"Starting countdown from {n}")
    while n > 0:
        yield n    # Suspend here, resume on next()
        n -= 1
    print("Countdown complete!")  # Runs after final next()

# Generator returns a generator object (NOT a value)
gen = countdown(5)
print(type(gen))   # <class 'generator'>

print(next(gen))   # "Starting countdown from 5" then 5
print(next(gen))   # 4  (resumes after the yield)
print(next(gen))   # 3

# Exhaust the rest with a for loop
for val in gen:
    print(val)     # 2, 1, then "Countdown complete!"


# ============================================================
# Generator for memory-efficient data processing
# ============================================================
def read_large_file(file_path: str, chunk_size: int = 8192):
    """Read a large file in chunks without loading it all into memory."""
    with open(file_path, "r") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk


def grep_lines(lines, pattern: str):
    """Filter lines matching a pattern (generator pipeline)."""
    for line in lines:
        if pattern in line:
            yield line


def line_reader(file_path: str):
    """Yield individual lines from a file."""
    with open(file_path, "r") as f:
        for line in f:
            yield line.rstrip("\\n")


# Pipeline: read -> filter -> process (all lazy, constant memory)
# matching = grep_lines(line_reader("server.log"), "ERROR")
# for line in matching:
#     process(line)


# ============================================================
# Generator expressions vs list comprehensions
# ============================================================
# List comprehension: builds the ENTIRE list in memory
squares_list = [x * x for x in range(1_000_000)]  # ~8MB in memory

# Generator expression: produces values one at a time
squares_gen = (x * x for x in range(1_000_000))    # ~120 bytes!

# Use generators when you only need to iterate once
total = sum(x * x for x in range(1_000_000))  # No extra memory


# ============================================================
# Custom iterator class
# ============================================================
class FibonacciIterator:
    """Infinite Fibonacci sequence iterator."""

    def __init__(self):
        self._a = 0
        self._b = 1

    def __iter__(self):
        return self  # Iterator returns itself

    def __next__(self):
        value = self._a
        self._a, self._b = self._b, self._a + self._b
        return value


# Take first 10 Fibonacci numbers
from itertools import islice

fib = FibonacciIterator()
first_10 = list(islice(fib, 10))
print(first_10)  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]


# ============================================================
# yield from (delegation to sub-generators)
# ============================================================
def flatten(nested):
    """Recursively flatten nested iterables."""
    for item in nested:
        if hasattr(item, "__iter__") and not isinstance(item, (str, bytes)):
            yield from flatten(item)  # Delegate to sub-generator
        else:
            yield item

data = [1, [2, 3], [4, [5, 6]], [[7, 8], 9]]
print(list(flatten(data)))  # [1, 2, 3, 4, 5, 6, 7, 8, 9]


# ============================================================
# Two-way communication with send()
# ============================================================
def accumulator():
    """Generator that accumulates sent values."""
    total = 0
    while True:
        value = yield total  # Receive value via send(), yield current total
        if value is None:
            break
        total += value

acc = accumulator()
next(acc)           # Prime the generator (advance to first yield)
print(acc.send(10)) # 10
print(acc.send(20)) # 30
print(acc.send(5))  # 35


# ============================================================
# Practical itertools usage
# ============================================================
import itertools

# chain: concatenate iterables
combined = list(itertools.chain([1, 2], [3, 4], [5]))
print(combined)  # [1, 2, 3, 4, 5]

# groupby: group consecutive elements by key
data = [
    {"dept": "eng", "name": "Alice"},
    {"dept": "eng", "name": "Bob"},
    {"dept": "sales", "name": "Charlie"},
    {"dept": "sales", "name": "Diana"},
]
# Data MUST be sorted by the key first!
for dept, members in itertools.groupby(data, key=lambda x: x["dept"]):
    print(f"{dept}: {[m['name'] for m in members]}")
# eng: ['Alice', 'Bob']
# sales: ['Charlie', 'Diana']

# product: cartesian product
sizes = ["S", "M", "L"]
colors = ["red", "blue"]
variants = list(itertools.product(sizes, colors))
# [('S','red'), ('S','blue'), ('M','red'), ('M','blue'), ('L','red'), ('L','blue')]

# islice: slice an infinite iterator
evens = (x for x in itertools.count(0, 2))  # 0, 2, 4, 6, ...
first_five_evens = list(itertools.islice(evens, 5))
print(first_five_evens)  # [0, 2, 4, 6, 8]

# tee: duplicate an iterator
original = iter(range(5))
copy1, copy2 = itertools.tee(original, 2)
print(list(copy1))  # [0, 1, 2, 3, 4]
print(list(copy2))  # [0, 1, 2, 3, 4]`,
      exercise: `**Exercises:**

1. Write a generator \`chunked(iterable, size)\` that yields successive chunks (as lists) of \`size\` elements from any iterable. The last chunk may be shorter. Test it with both lists and other generators.

2. Implement a custom \`Range\` class (not using built-in \`range\`) that supports \`__iter__\`, \`__next__\`, \`__len__\`, \`__contains__\`, and \`__reversed__\`. It should handle start, stop, step (including negative step).

3. Build a generator pipeline for log analysis: \`read_logs(path)\` -> \`parse_entries(lines)\` (yield dicts) -> \`filter_errors(entries)\` -> \`aggregate_by_hour(errors)\`. Each stage should be a separate generator that feeds into the next.

4. Create a generator \`interleave(*iterables)\` that yields one element from each iterable in round-robin fashion, stopping when all are exhausted. Handle iterables of different lengths gracefully.

5. Implement a \`@coroutine\` decorator that automatically primes a generator (calls \`next()\` on it). Then write a generator-based coroutine that receives strings via \`send()\`, accumulates them, and yields the running concatenation.

6. Use \`itertools\` to solve: given a list of numbers, find all unique pairs that sum to a target value. Compare the generator approach vs. a set-based approach in terms of memory and time complexity.`,
      commonMistakes: [
        "Trying to iterate over a generator twice. Generators are single-pass \u2014 once exhausted, calling `next()` raises `StopIteration` forever. To iterate multiple times, either recreate the generator or use `itertools.tee()` (but be aware `tee` stores elements in memory).",
        "Using `return value` in a generator function and expecting it as output. In generators, `return value` raises `StopIteration(value)` \u2014 the value is stored in the exception's `.value` attribute, not yielded. Use `yield value` to produce output.",
        "Forgetting to prime a generator-based coroutine before calling `send()`. The first call must be `next(gen)` or `gen.send(None)` to advance to the first `yield`. Sending a non-None value to a just-started generator raises `TypeError`.",
        "Using `itertools.groupby()` on unsorted data and expecting it to group all matching elements. `groupby` only groups **consecutive** elements with the same key. Sort the data by the key first, or use `collections.defaultdict` for non-consecutive grouping.",
        "Consuming an iterator inside a function that's supposed to pass it along. Operations like `list()`, `len()` (if supported), or even `if iterator` exhaust the iterator. Use `itertools.tee()` if you need to inspect and pass along.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between an iterable, an iterator, and a generator in Python?",
          a: "An **iterable** is any object with an `__iter__()` method that returns an iterator (lists, dicts, strings, files). An **iterator** is an object with both `__iter__()` (returns self) and `__next__()` (returns next value or raises `StopIteration`). It's stateful and single-pass. A **generator** is a special type of iterator created by a function containing `yield`. It automatically implements `__iter__` and `__next__`. Key distinction: all generators are iterators, all iterators are iterables, but not all iterables are iterators (a list is iterable but not an iterator \u2014 `next([1,2,3])` raises `TypeError`).",
        },
        {
          type: "tricky",
          q: "What happens when you use `yield` inside a `try/finally` block? What about `generator.close()`?",
          a: "When a generator has `yield` inside a `try/finally`, the `finally` block is **guaranteed to execute** when the generator is closed or garbage collected. `generator.close()` throws `GeneratorExit` at the `yield` point, which triggers the `finally` block for cleanup. If the `finally` block itself tries to `yield`, Python raises `RuntimeError`. This is how generators can be used as context managers \u2014 the `finally` block acts as the cleanup code. Example: a generator that opens a file, yields lines, and closes the file in `finally` will properly close the file even if iteration stops early.",
        },
        {
          type: "scenario",
          q: "You need to process a 50GB CSV file on a machine with 4GB of RAM. How would you use generators to solve this?",
          a: "Build a **generator pipeline**: 1) `read_chunks(path)` \u2014 generator that reads the file in fixed-size byte chunks. 2) `parse_rows(chunks)` \u2014 generator that splits chunks into rows, handling rows split across chunk boundaries. 3) `transform(rows)` \u2014 generator applying business logic (filtering, mapping). 4) `batch_write(records, batch_size)` \u2014 generator that accumulates records and writes in batches. Each stage holds only one item in memory. The pipeline is: `batch_write(transform(parse_rows(read_chunks('data.csv'))))`. Alternatively, use `csv.reader` with the file object directly (files are iterators in Python), combined with `itertools.islice` for batching. Memory stays constant regardless of file size.",
        },
        {
          type: "conceptual",
          q: "Explain `yield from` and how it differs from a `for` loop with `yield`.",
          a: "`yield from iterable` delegates to a sub-iterator, forwarding all values, `send()` calls, and exceptions transparently. While `for item in iterable: yield item` seems equivalent, `yield from` also: 1) **Propagates `send()`** \u2014 values sent to the outer generator reach the inner one. 2) **Propagates `throw()`** \u2014 exceptions thrown into the outer generator are thrown into the inner one. 3) **Captures the return value** \u2014 `result = yield from sub_gen` captures the sub-generator's `return` value (stored in `StopIteration.value`). A plain `for/yield` loop doesn't handle any of these. `yield from` is essential for coroutine delegation and recursive generators like tree traversals.",
        },
      ],
    },
    {
      id: "py-context-managers",
      title: "Context Managers",
      explanation: `Context managers ensure that resources are properly **acquired and released**, regardless of whether an operation succeeds or fails. The \`with\` statement guarantees cleanup code runs, even if exceptions occur \u2014 no more forgotten \`file.close()\` calls or unreleased locks.

**The context manager protocol:**
\`\`\`python
with expression as variable:
    # __enter__() is called, return value bound to variable
    body
# __exit__() is ALWAYS called (even on exception)
\`\`\`

**Two ways to create context managers:**

| Approach | Best for | Complexity |
|---|---|---|
| **Class-based** (\`__enter__\`/\`__exit__\`) | Complex state, reusable managers | More boilerplate |
| **\`@contextmanager\`** (generator-based) | Simple setup/teardown, quick one-offs | Less code |

**\`__exit__\` parameters:** When an exception occurs inside the \`with\` block, \`__exit__\` receives the exception type, value, and traceback. Returning \`True\` from \`__exit__\` suppresses the exception; returning \`False\` (or \`None\`) lets it propagate.

**Nested context managers** can be combined with \`contextlib.ExitStack\` for dynamic or variable-length resource management:
\`\`\`python
with ExitStack() as stack:
    files = [stack.enter_context(open(f)) for f in file_list]
\`\`\`

**Async context managers** use \`__aenter__\`/\`__aexit__\` and are entered with \`async with\`. The \`@asynccontextmanager\` decorator from \`contextlib\` simplifies creation. They're essential for managing async resources like database connections, HTTP sessions, and network sockets in \`asyncio\` code.`,
      codeExample: `# ============================================================
# Class-based context manager
# ============================================================
import time
import contextlib
import logging
import os
import tempfile
from typing import Optional

logger = logging.getLogger(__name__)


class Timer:
    """Context manager that measures execution time."""

    def __init__(self, label: str = "Block"):
        self.label = label
        self.elapsed: Optional[float] = None

    def __enter__(self):
        self._start = time.perf_counter()
        return self  # Bound to 'as' variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self._start
        logger.info(f"{self.label} took {self.elapsed:.4f}s")
        return False  # Don't suppress exceptions


with Timer("Data processing") as t:
    total = sum(range(1_000_000))
print(f"Elapsed: {t.elapsed:.4f}s")


# ============================================================
# Context manager with exception handling
# ============================================================
class DatabaseTransaction:
    """Manage database transactions with automatic commit/rollback."""

    def __init__(self, connection):
        self.connection = connection

    def __enter__(self):
        self.connection.begin()
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            # Exception occurred — rollback
            self.connection.rollback()
            logger.error(f"Transaction rolled back: {exc_val}")
            return False  # Re-raise the exception
        else:
            # No exception — commit
            self.connection.commit()
            return False


# Usage:
# with DatabaseTransaction(conn) as db:
#     db.execute("INSERT INTO users (name) VALUES (?)", ("Alice",))
#     db.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
# Automatically commits on success, rolls back on exception


# ============================================================
# @contextmanager — generator-based (simpler)
# ============================================================
@contextlib.contextmanager
def temporary_directory(prefix: str = "tmp_"):
    """Create a temp directory, yield it, then clean up."""
    path = tempfile.mkdtemp(prefix=prefix)
    logger.info(f"Created temp dir: {path}")
    try:
        yield path  # Everything before yield = __enter__
    finally:
        # Everything after yield = __exit__ (always runs)
        import shutil
        shutil.rmtree(path, ignore_errors=True)
        logger.info(f"Cleaned up temp dir: {path}")


with temporary_directory("myapp_") as tmpdir:
    # Work with temporary directory
    filepath = os.path.join(tmpdir, "data.txt")
    with open(filepath, "w") as f:
        f.write("temporary data")
# Directory is automatically deleted here


# ============================================================
# @contextmanager with exception handling
# ============================================================
@contextlib.contextmanager
def managed_resource(name: str):
    """Acquire and release a named resource."""
    print(f"Acquiring {name}")
    resource = {"name": name, "active": True}
    try:
        yield resource
    except Exception as e:
        print(f"Error in {name}: {e}")
        resource["error"] = str(e)
        raise  # Re-raise after logging
    finally:
        resource["active"] = False
        print(f"Released {name}")


# ============================================================
# ExitStack for dynamic context management
# ============================================================
def process_multiple_files(file_paths: list[str]):
    """Open and process a variable number of files."""
    with contextlib.ExitStack() as stack:
        # Dynamically enter multiple context managers
        files = [
            stack.enter_context(open(path, "r"))
            for path in file_paths
        ]
        # All files are open here; ALL will be closed on exit
        for f in files:
            print(f.readline())


# ============================================================
# Suppressing specific exceptions
# ============================================================
# Instead of try/except/pass:
with contextlib.suppress(FileNotFoundError):
    os.remove("nonexistent_file.txt")
    # No error even though file doesn't exist


# ============================================================
# Reentrant and reusable context managers
# ============================================================
@contextlib.contextmanager
def indent_logger(level: int = 1):
    """Context manager that indents log output."""
    prefix = "  " * level
    original_factory = logging.getLogRecordFactory()

    def indented_factory(*args, **kwargs):
        record = original_factory(*args, **kwargs)
        record.msg = f"{prefix}{record.msg}"
        return record

    logging.setLogRecordFactory(indented_factory)
    try:
        yield
    finally:
        logging.setLogRecordFactory(original_factory)


# ============================================================
# Async context manager
# ============================================================
import asyncio


class AsyncDatabasePool:
    """Async context manager for database connection pools."""

    def __init__(self, dsn: str, min_size: int = 2, max_size: int = 10):
        self.dsn = dsn
        self.min_size = min_size
        self.max_size = max_size
        self.pool = None

    async def __aenter__(self):
        # Simulate async pool creation
        print(f"Creating pool for {self.dsn}")
        await asyncio.sleep(0.1)  # Simulate connection time
        self.pool = {"dsn": self.dsn, "connections": self.min_size}
        return self.pool

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print(f"Closing pool for {self.dsn}")
        await asyncio.sleep(0.05)  # Simulate graceful shutdown
        self.pool = None
        return False


@contextlib.asynccontextmanager
async def async_http_session(base_url: str):
    """Async context manager for HTTP session lifecycle."""
    session = {"base_url": base_url, "active": True}
    print(f"Opening session to {base_url}")
    try:
        yield session
    finally:
        session["active"] = False
        print(f"Closed session to {base_url}")


# Usage:
# async def main():
#     async with AsyncDatabasePool("postgresql://...") as pool:
#         async with async_http_session("https://api.example.com") as http:
#             # Both resources managed
#             pass`,
      exercise: `**Exercises:**

1. Write a class-based context manager \`FileBackup\` that copies a file to a \`.bak\` before entering the block, and restores it from backup if an exception occurs during the block. Delete the backup on successful exit.

2. Implement \`@contextmanager\`-based \`change_directory(path)\` that changes the working directory on entry and restores the original directory on exit, even if an exception occurs.

3. Build an \`ExitStack\`-based function that opens N database connections, N file handles, and N network sockets (simulated), processes data from all of them, and ensures all resources are released on exit.

4. Create a context manager \`timeout(seconds)\` using \`signal.alarm\` (Unix) that raises \`TimeoutError\` if the block takes too long. Handle the cleanup properly in \`__exit__\`.

5. Write an async context manager \`rate_limiter(max_concurrent)\` using \`asyncio.Semaphore\` that limits how many coroutines can execute the body concurrently. Test it with 20 simulated API calls limited to 5 concurrent.`,
      commonMistakes: [
        "Forgetting to return `False` (or not returning at all) from `__exit__` and accidentally suppressing exceptions. Only return `True` if you intentionally want to swallow the exception. Returning `None` (implicit) correctly propagates exceptions.",
        "Using `@contextmanager` but forgetting the `try/finally` around `yield`. Without `finally`, the cleanup code after `yield` won't run if an exception occurs inside the `with` block \u2014 defeating the entire purpose of the context manager.",
        "Yielding more than once in a `@contextmanager` generator. The generator must yield exactly once \u2014 the yield separates setup from teardown. Multiple yields cause `RuntimeError`.",
        "Not understanding that `__exit__` is called even when `__enter__` assigns to a variable that's never used. The `as` clause is optional; the context manager's lifecycle (enter/exit) runs regardless.",
        "Creating context managers that hold resources indefinitely. If a context manager acquires a database connection in `__enter__`, holding the `with` block open for a long time (e.g., waiting for user input) starves the connection pool. Keep `with` blocks short.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does the `with` statement work internally? What methods must a context manager implement?",
          a: "The `with` statement calls `__enter__()` on the context manager object at the start, binding the return value to the `as` variable (if present). When the block exits (normally or via exception), it calls `__exit__(exc_type, exc_val, exc_tb)`. If no exception occurred, all three arguments are `None`. If an exception occurred, they contain the exception details. `__exit__` returning `True` suppresses the exception; `False`/`None` propagates it. The `with` statement is roughly equivalent to: `mgr = expr; val = mgr.__enter__(); try: body; except: if not mgr.__exit__(*sys.exc_info()): raise; else: mgr.__exit__(None, None, None)`.",
        },
        {
          type: "tricky",
          q: "Can a context manager's `__exit__` method suppress some exceptions but not others? How?",
          a: "Yes. `__exit__` receives the exception type, value, and traceback. It can inspect `exc_type` and decide: return `True` to suppress (swallow) the exception, or `False`/`None` to let it propagate. Example: suppress `ValueError` but propagate `TypeError`: `def __exit__(self, exc_type, exc_val, exc_tb): return exc_type is ValueError`. This is useful for context managers that handle expected errors (like 'key not found') while letting unexpected errors bubble up. The `contextlib.suppress(*exceptions)` utility does exactly this for specified exception types.",
        },
        {
          type: "scenario",
          q: "Design a context manager for managing distributed locks in a microservices architecture. What edge cases must you handle?",
          a: "The context manager needs: **`__enter__`**: 1) Acquire a distributed lock (e.g., Redis `SET NX EX`) with a TTL. 2) Retry with backoff if the lock is held. 3) Store a unique token (UUID) to ensure only the holder can release. 4) Start a background thread to extend the TTL (watchdog) in case the operation takes longer. **`__exit__`**: 1) Stop the watchdog thread. 2) Release the lock only if we still hold it (compare token). 3) Handle the case where the lock expired (another process may hold it). **Edge cases**: network partition during release (lock stays held until TTL), process crash (TTL auto-expires), clock skew between nodes, and reentrant locking (same process acquiring the same lock). Use `contextlib.ExitStack` if you need to acquire multiple locks atomically.",
        },
      ],
    },
  ],
};

export default pyPhase6;
