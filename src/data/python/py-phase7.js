const pyPhase7 = {
  id: "phase-7",
  title: "Phase 7: Functional Programming",
  emoji: "\u{1F517}",
  description:
    "Master Python's functional programming toolkit \u2014 pure functions, immutability, currying, itertools recipes, functools power tools, and the collections module for writing concise, composable, and production-hardened code.",
  topics: [
    {
      id: "py-fp-concepts",
      title: "Functional Programming Concepts",
      explanation: `Functional programming (FP) in Python is not about abandoning OOP \u2014 it is about **leveraging functions as the primary unit of abstraction** to write code that is easier to test, reason about, and compose. Python is a multi-paradigm language, and its FP support is pragmatic rather than pure, giving you the best of both worlds.

**Pure functions** are the cornerstone of FP. A pure function: (1) always returns the same output for the same input (referential transparency), and (2) produces no side effects (no mutation of external state, no I/O). Pure functions are trivially testable \u2014 you only need to assert inputs against outputs, with no mocking or setup.

**Immutability** means once a value is created, it cannot be changed. Python offers immutable built-ins (\`tuple\`, \`frozenset\`, \`str\`, \`bytes\`) and tools like \`@dataclass(frozen=True)\` and \`NamedTuple\` for custom immutable objects. Immutability eliminates entire classes of bugs caused by shared mutable state, especially in concurrent programs.

**First-class functions** mean functions are objects \u2014 you can assign them to variables, pass them as arguments, return them from other functions, and store them in data structures. This enables higher-order functions like \`map\`, \`filter\`, \`sorted\`, and custom combinators.

| Concept | Description | Python Example |
|---|---|---|
| **Pure function** | No side effects, deterministic | \`def add(a, b): return a + b\` |
| **Higher-order function** | Takes/returns functions | \`map(str.upper, words)\` |
| **Currying** | Transform f(a, b) into f(a)(b) | Manual closures or \`functools.partial\` |
| **Partial application** | Fix some arguments, return new function | \`partial(pow, 2)\` gives \`2**n\` |
| **Composition** | Combine functions: \`(f . g)(x) = f(g(x))\` | \`compose(f, g)(x)\` |
| **Closure** | Inner function captures outer scope | \`def make_adder(n): return lambda x: x + n\` |

**Currying** transforms a function that takes multiple arguments into a chain of functions each taking a single argument: \`f(a, b, c)\` becomes \`f(a)(b)(c)\`. **Partial application** fixes some arguments and returns a new function that takes the remaining ones. Python's \`functools.partial\` is the standard tool for partial application, while currying is typically done with manual closures or third-party libraries.

**Function composition** chains functions together so the output of one feeds into the input of the next. While Python lacks a built-in composition operator, you can build one with \`functools.reduce\` or a simple helper. Composition is the FP equivalent of Unix pipes \u2014 small, focused functions chained to solve complex problems.`,
      codeExample: `# ============================================================
# Pure functions vs impure functions
# ============================================================
from typing import Sequence

# IMPURE: modifies external state, non-deterministic
total = 0

def impure_add(x: int) -> int:
    global total
    total += x       # Side effect: mutates global state
    return total


# PURE: same input always gives same output, no side effects
def pure_add(a: int, b: int) -> int:
    return a + b


# PURE: returns new data instead of mutating
def add_item(items: tuple, new_item: str) -> tuple:
    """Return a new tuple with the item appended (immutable)."""
    return items + (new_item,)


cart = ("apple", "bread")
new_cart = add_item(cart, "milk")
print(cart)       # ("apple", "bread")  — original unchanged
print(new_cart)   # ("apple", "bread", "milk")


# ============================================================
# Immutability with frozen dataclasses and NamedTuple
# ============================================================
from dataclasses import dataclass, replace
from typing import NamedTuple


@dataclass(frozen=True)
class Money:
    amount: int      # cents to avoid float issues
    currency: str

    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError(f"Cannot add {self.currency} and {other.currency}")
        return Money(self.amount + other.amount, self.currency)

    def multiply(self, factor: int) -> "Money":
        return Money(self.amount * factor, self.currency)


price = Money(1999, "USD")  # $19.99
tax = Money(160, "USD")     # $1.60
total_price = price.add(tax)
print(total_price)           # Money(amount=2159, currency='USD')

# price.amount = 0          # FrozenInstanceError!
updated = replace(price, amount=2499)  # Create modified copy
print(updated)               # Money(amount=2499, currency='USD')


class Point(NamedTuple):
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5


p1 = Point(3.0, 4.0)
p2 = Point(0.0, 0.0)
print(p1.distance_to(p2))   # 5.0
# p1.x = 10.0               # AttributeError: can't set attribute


# ============================================================
# First-class functions and higher-order functions
# ============================================================
from typing import Callable


def apply_discount(
    prices: Sequence[float],
    strategy: Callable[[float], float],
) -> list[float]:
    """Apply a discount strategy to all prices."""
    return [strategy(p) for p in prices]


def flat_discount(amount: float) -> Callable[[float], float]:
    """Create a flat discount function."""
    def discount(price: float) -> float:
        return max(0.0, price - amount)
    return discount


def percentage_discount(pct: float) -> Callable[[float], float]:
    """Create a percentage discount function."""
    def discount(price: float) -> float:
        return price * (1 - pct / 100)
    return discount


prices = [100.0, 250.0, 50.0, 175.0]
print(apply_discount(prices, flat_discount(20)))
# [80.0, 230.0, 30.0, 155.0]
print(apply_discount(prices, percentage_discount(15)))
# [85.0, 212.5, 42.5, 148.75]


# ============================================================
# Currying and partial application
# ============================================================
import functools


# Manual currying via closures
def curry_multiply(a: float):
    def inner(b: float):
        return a * b
    return inner


double = curry_multiply(2)
triple = curry_multiply(3)
print(double(5))   # 10
print(triple(5))   # 15


# functools.partial — the Pythonic way
def power(base: int, exponent: int) -> int:
    return base ** exponent


square = functools.partial(power, exponent=2)
cube = functools.partial(power, exponent=3)
print(square(5))   # 25
print(cube(5))     # 125

# Partial with keyword arguments for configuration
import logging

debug_log = functools.partial(logging.log, logging.DEBUG)
error_log = functools.partial(logging.log, logging.ERROR)


# ============================================================
# Function composition
# ============================================================
def compose(*funcs: Callable) -> Callable:
    """Compose functions right-to-left: compose(f, g, h)(x) = f(g(h(x)))."""
    def composed(x):
        result = x
        for fn in reversed(funcs):
            result = fn(result)
        return result
    return composed


def pipe(*funcs: Callable) -> Callable:
    """Compose functions left-to-right: pipe(f, g, h)(x) = h(g(f(x)))."""
    def piped(x):
        result = x
        for fn in funcs:
            result = fn(result)
        return result
    return piped


# Build a text processing pipeline
normalize = pipe(
    str.strip,
    str.lower,
    lambda s: s.replace("  ", " "),
)

print(normalize("  Hello   World  "))  # "hello world"


# Compose validators
def validate_non_empty(s: str) -> str:
    if not s:
        raise ValueError("String must not be empty")
    return s


def validate_max_length(max_len: int) -> Callable[[str], str]:
    def validator(s: str) -> str:
        if len(s) > max_len:
            raise ValueError(f"String exceeds {max_len} chars")
        return s
    return validator


def validate_alphanumeric(s: str) -> str:
    if not s.replace(" ", "").isalnum():
        raise ValueError("String must be alphanumeric")
    return s


validate_username = pipe(
    validate_non_empty,
    validate_max_length(32),
    validate_alphanumeric,
    str.lower,
)

print(validate_username("JohnDoe42"))  # "johndoe42"


# ============================================================
# Practical: immutable configuration with chaining
# ============================================================
@dataclass(frozen=True)
class QueryBuilder:
    table: str
    conditions: tuple = ()
    order_by: str | None = None
    limit_val: int | None = None

    def where(self, condition: str) -> "QueryBuilder":
        return replace(self, conditions=self.conditions + (condition,))

    def order(self, column: str) -> "QueryBuilder":
        return replace(self, order_by=column)

    def limit(self, n: int) -> "QueryBuilder":
        return replace(self, limit_val=n)

    def build(self) -> str:
        sql = f"SELECT * FROM {self.table}"
        if self.conditions:
            sql += " WHERE " + " AND ".join(self.conditions)
        if self.order_by:
            sql += f" ORDER BY {self.order_by}"
        if self.limit_val is not None:
            sql += f" LIMIT {self.limit_val}"
        return sql


query = (
    QueryBuilder("users")
    .where("active = 1")
    .where("age > 18")
    .order("created_at DESC")
    .limit(50)
)
print(query.build())
# SELECT * FROM users WHERE active = 1 AND age > 18 ORDER BY created_at DESC LIMIT 50`,
      exercise: `**Exercises:**

1. Write a pure function \`transform_records(records: tuple[dict, ...], transformations: tuple[Callable, ...]) -> tuple[dict, ...]\` that applies a pipeline of transformation functions to each record without mutating any input. Each transformation takes a dict and returns a new dict.

2. Implement a \`curry(func)\` decorator that automatically curries any function of arbitrary arity. \`curry(lambda a, b, c: a + b + c)(1)(2)(3)\` should return \`6\`, and \`curry(lambda a, b, c: a + b + c)(1, 2)(3)\` should also return \`6\`.

3. Build a \`@dataclass(frozen=True)\` based immutable \`Config\` class with nested frozen dataclasses. Implement a \`Config.merge(other)\` method that deep-merges two configs, returning a new Config. Test that the original objects remain unchanged.

4. Create a \`compose_async(*funcs)\` function that composes async functions in the same way \`compose\` works for sync functions. Test it with three async transformations on a string.

5. Implement a functional \`Either\` type (like Rust's \`Result\`) with \`Success\` and \`Failure\` variants. Add \`.map(fn)\`, \`.flat_map(fn)\`, and \`.get_or_else(default)\` methods. Use it to build a validation pipeline that collects errors instead of raising exceptions.

6. Rewrite a class-based strategy pattern (e.g., shipping cost calculator with different strategies) using pure functions and \`functools.partial\`. Compare the two approaches for testability and conciseness.`,
      commonMistakes: [
        "Using mutable default arguments in 'pure' functions. `def process(items, cache={})` shares the same dict across all calls. Use `None` as default and create inside the function: `cache = cache if cache is not None else {}`.",
        "Confusing currying with partial application. Currying transforms `f(a, b, c)` into `f(a)(b)(c)` \u2014 each call takes exactly one argument. Partial application fixes some arguments and returns a function taking the rest: `partial(f, a)` returns `g(b, c)`. Python's `functools.partial` does partial application, not currying.",
        "Over-using `lambda` for complex logic. Lambdas are limited to a single expression and cannot contain statements. Use named functions for anything non-trivial \u2014 they are easier to debug (stack traces show the name), test, and document.",
        "Assuming Python enforces immutability deeply. `frozen=True` on a dataclass prevents reassignment of attributes, but if an attribute is a mutable object (like a list), the list itself can still be mutated. Use tuples and frozensets for truly immutable nested data.",
        "Creating deeply nested closures that are hard to debug. While closures are powerful, more than two levels of nesting makes code difficult to follow. Extract inner functions into named, testable units.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What makes a function 'pure' in Python, and what are the practical benefits of pure functions in production systems?",
          a: "A pure function has two properties: **referential transparency** (same inputs always produce the same output) and **no side effects** (no mutation of external state, no I/O, no database writes). Practical benefits: 1) **Testability** \u2014 test with simple assertions, no mocking needed. 2) **Cacheability** \u2014 results can be memoized safely since output depends only on input. 3) **Parallelizability** \u2014 pure functions can run on multiple threads/processes without locks since they don't share mutable state. 4) **Reasoning** \u2014 you can understand a pure function in isolation without tracing global state. In production, pure functions form the core business logic, while impure functions (I/O, logging) live at the boundaries of the system.",
        },
        {
          type: "tricky",
          q: "Python tuples are called 'immutable', but `t = ([1, 2], [3, 4]); t[0].append(5)` works. Explain this and how you would enforce deep immutability.",
          a: "Tuples are **shallow-immutable**: you cannot reassign `t[0] = something_else`, but if an element is a mutable object, its internal state can change. `t[0].append(5)` mutates the list object that `t[0]` references, not the tuple itself. To enforce deep immutability: 1) Use only immutable types inside tuples: `tuple`, `frozenset`, `str`, `int`, `float`, `bytes`. 2) For custom objects, use `@dataclass(frozen=True)` with all fields being immutable types. 3) For nested structures, recursively convert: lists to tuples, sets to frozensets, dicts to `types.MappingProxyType` or frozen dataclasses. 4) Third-party libraries like `pyrsistent` provide persistent (immutable) data structures (`PVector`, `PMap`) with efficient structural sharing.",
        },
        {
          type: "scenario",
          q: "You are building a data transformation pipeline that processes financial transactions. The pipeline has 8 stages. How would you design it using functional programming principles?",
          a: "Design each stage as a **pure function** taking an immutable transaction record and returning a new one: 1) `validate_schema` \u2014 checks required fields. 2) `normalize_currency` \u2014 converts amounts to base currency. 3) `apply_fees` \u2014 computes and adds fee fields. 4) `check_compliance` \u2014 flags suspicious patterns. 5) `calculate_tax` \u2014 adds tax fields. 6) `enrich_metadata` \u2014 adds timestamps and audit info. 7) `format_output` \u2014 transforms to target schema. 8) `validate_output` \u2014 final validation. Compose them with `pipe(stage1, stage2, ..., stage8)`. Use frozen dataclasses for transaction records to prevent accidental mutation. Each stage is independently testable. For error handling, use an `Either`/`Result` type so failures propagate through the pipeline without exceptions. The I/O boundary (reading from Kafka, writing to DB) stays outside the pipeline.",
        },
      ],
    },
    {
      id: "py-itertools-functools",
      title: "itertools & functools",
      explanation: `The \`itertools\` and \`functools\` modules are Python's **standard library power tools for functional programming**. They provide battle-tested, C-optimized implementations of common patterns that would otherwise require verbose, error-prone manual code. Mastering these modules is the difference between writing Python and writing *Pythonic* Python.

**\`itertools\`** provides functions that create **memory-efficient iterators** for looping. Every function in \`itertools\` returns an iterator, meaning it produces values lazily \u2014 only computing the next value when asked. This makes them suitable for processing datasets that don't fit in memory.

| Category | Functions | Purpose |
|---|---|---|
| **Infinite** | \`count\`, \`cycle\`, \`repeat\` | Unbounded sequences |
| **Terminating** | \`chain\`, \`islice\`, \`takewhile\`, \`dropwhile\`, \`filterfalse\`, \`compress\`, \`starmap\`, \`zip_longest\` | Finite transformations |
| **Combinatoric** | \`product\`, \`permutations\`, \`combinations\`, \`combinations_with_replacement\` | Mathematical combinations |
| **Grouping** | \`groupby\`, \`pairwise\` (3.10+), \`batched\` (3.12+) | Structuring sequences |

**\`functools\`** provides higher-order functions and operations on callable objects. While \`itertools\` operates on data sequences, \`functools\` operates on functions themselves.

| Function | Purpose |
|---|---|
| \`lru_cache\` / \`cache\` | Memoize function results with LRU eviction |
| \`partial\` | Fix some arguments of a function |
| \`reduce\` | Left fold over an iterable |
| \`singledispatch\` | Single-argument polymorphic dispatch |
| \`total_ordering\` | Auto-generate comparison methods from \`__eq__\` and one of \`__lt__\`/\`__gt__\` |
| \`wraps\` | Preserve wrapped function metadata |
| \`cached_property\` | One-time computed property (memoized on instance) |

**\`lru_cache\`** is particularly important in production. It memoizes function results with a **Least Recently Used** eviction policy. With \`maxsize=None\`, it becomes an unbounded cache (equivalent to \`@cache\` in 3.9+). It stores results in a dict keyed by the function arguments, so arguments must be **hashable**. The cache is thread-safe for reads but not for the initial computation \u2014 two threads may compute the same value simultaneously.

**\`singledispatch\`** turns a function into a generic function with dispatch based on the type of the first argument. It's Python's answer to method overloading and is cleaner than long \`if isinstance(...)\` chains.`,
      codeExample: `# ============================================================
# itertools: infinite iterators with practical boundaries
# ============================================================
import itertools
import functools
import operator
from typing import Any, Callable, Iterable, Iterator, TypeVar

T = TypeVar("T")


# count: generate sequential IDs
def id_generator(prefix: str = "item") -> Iterator[str]:
    """Generate unique IDs like item_001, item_002, ..."""
    for n in itertools.count(1):
        yield f"{prefix}_{n:03d}"


gen = id_generator("order")
print([next(gen) for _ in range(3)])  # ['order_001', 'order_002', 'order_003']


# cycle: round-robin load balancing
def round_robin_balancer(servers: list[str]) -> Iterator[str]:
    """Cycle through servers endlessly for load balancing."""
    return itertools.cycle(servers)


balancer = round_robin_balancer(["server-a", "server-b", "server-c"])
assignments = [next(balancer) for _ in range(7)]
print(assignments)
# ['server-a', 'server-b', 'server-c', 'server-a', 'server-b', 'server-c', 'server-a']


# ============================================================
# itertools: terminating iterators for data pipelines
# ============================================================

# chain.from_iterable: flatten one level of nesting
nested_results = [[1, 2, 3], [4, 5], [6, 7, 8, 9]]
flat = list(itertools.chain.from_iterable(nested_results))
print(flat)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]


# takewhile / dropwhile: process until/after a condition
log_levels = ["DEBUG", "DEBUG", "INFO", "WARNING", "ERROR", "INFO"]
before_warning = list(itertools.takewhile(lambda x: x != "WARNING", log_levels))
from_warning = list(itertools.dropwhile(lambda x: x != "WARNING", log_levels))
print(before_warning)  # ['DEBUG', 'DEBUG', 'INFO']
print(from_warning)    # ['WARNING', 'ERROR', 'INFO']


# compress: filter with a selector mask
data = ["alpha", "beta", "gamma", "delta", "epsilon"]
mask = [True, False, True, False, True]
selected = list(itertools.compress(data, mask))
print(selected)  # ['alpha', 'gamma', 'epsilon']


# starmap: unpack arguments from tuples
coordinates = [(2, 5), (3, 2), (10, 3)]
powers = list(itertools.starmap(pow, coordinates))
print(powers)  # [32, 9, 1000]


# zip_longest: zip with fill value for unequal lengths
names = ["Alice", "Bob", "Charlie"]
scores = [95, 87]
paired = list(itertools.zip_longest(names, scores, fillvalue=0))
print(paired)  # [('Alice', 95), ('Bob', 87), ('Charlie', 0)]


# ============================================================
# itertools: combinatoric generators
# ============================================================

# product: cartesian product (replaces nested loops)
sizes = ["S", "M", "L"]
colors = ["red", "blue"]
variants = list(itertools.product(sizes, colors))
print(variants)
# [('S','red'), ('S','blue'), ('M','red'), ('M','blue'), ('L','red'), ('L','blue')]

# combinations: unique pairs from a team
team = ["Alice", "Bob", "Charlie", "Diana"]
pairs = list(itertools.combinations(team, 2))
print(pairs)
# [('Alice','Bob'), ('Alice','Charlie'), ('Alice','Diana'),
#  ('Bob','Charlie'), ('Bob','Diana'), ('Charlie','Diana')]


# ============================================================
# itertools recipes: groupby, batched, pairwise
# ============================================================

# groupby: group sorted data by key
transactions = [
    {"date": "2025-01-15", "amount": 100},
    {"date": "2025-01-15", "amount": 200},
    {"date": "2025-01-16", "amount": 150},
    {"date": "2025-01-16", "amount": 75},
    {"date": "2025-01-17", "amount": 300},
]

for date, group in itertools.groupby(transactions, key=lambda t: t["date"]):
    daily_total = sum(t["amount"] for t in group)
    print(f"{date}: ${daily_total}")
# 2025-01-15: $300
# 2025-01-16: $225
# 2025-01-17: $300


# batched (Python 3.12+) — process in chunks
# For older Python, use the recipe:
def batched(iterable: Iterable[T], n: int) -> Iterator[tuple[T, ...]]:
    """Batch data into tuples of length n. Last batch may be shorter."""
    it = iter(iterable)
    while batch := tuple(itertools.islice(it, n)):
        yield batch


records = list(range(10))
for batch in batched(records, 3):
    print(f"Processing batch: {batch}")
# Processing batch: (0, 1, 2)
# Processing batch: (3, 4, 5)
# Processing batch: (6, 7, 8)
# Processing batch: (9,)


# pairwise (Python 3.10+) — sliding window of size 2
def pairwise(iterable):
    """Return successive overlapping pairs."""
    a, b = itertools.tee(iterable)
    next(b, None)
    return zip(a, b)


temps = [68, 72, 65, 70, 74, 69]
changes = [(b - a) for a, b in pairwise(temps)]
print(changes)  # [4, -7, 5, 4, -5]


# ============================================================
# functools.lru_cache: production memoization
# ============================================================

@functools.lru_cache(maxsize=256)
def expensive_query(user_id: int, include_deleted: bool = False) -> dict:
    """Simulate an expensive database query with caching."""
    print(f"  [CACHE MISS] Querying user {user_id}")
    return {"id": user_id, "name": f"User_{user_id}", "deleted": include_deleted}


# First call: cache miss
result1 = expensive_query(42)
# Second call: cache hit (no print)
result2 = expensive_query(42)
print(result1 is result2)  # True (same cached object)

# Inspect cache performance
info = expensive_query.cache_info()
print(f"Hits: {info.hits}, Misses: {info.misses}, Size: {info.currsize}")

# Clear cache when data changes
expensive_query.cache_clear()


# lru_cache with unhashable arguments workaround
def make_hashable(obj: Any) -> Any:
    """Convert unhashable types to hashable equivalents."""
    if isinstance(obj, dict):
        return tuple(sorted((k, make_hashable(v)) for k, v in obj.items()))
    if isinstance(obj, (list, tuple)):
        return tuple(make_hashable(item) for item in obj)
    if isinstance(obj, set):
        return frozenset(make_hashable(item) for item in obj)
    return obj


def hashable_cache(func):
    """Cache decorator that handles unhashable arguments."""
    @functools.lru_cache(maxsize=128)
    def cached(*args):
        return func(*args)

    @functools.wraps(func)
    def wrapper(*args):
        hashable_args = tuple(make_hashable(a) for a in args)
        return cached(*hashable_args)

    wrapper.cache_info = cached.cache_info
    wrapper.cache_clear = cached.cache_clear
    return wrapper


# ============================================================
# functools.singledispatch: type-based polymorphism
# ============================================================

@functools.singledispatch
def serialize(obj) -> str:
    """Serialize an object to a string representation."""
    raise TypeError(f"Cannot serialize {type(obj).__name__}")


@serialize.register(int)
@serialize.register(float)
def _(obj) -> str:
    return str(obj)


@serialize.register(str)
def _(obj) -> str:
    return f'"{obj}"'


@serialize.register(list)
def _(obj) -> str:
    items = ", ".join(serialize(item) for item in obj)
    return f"[{items}]"


@serialize.register(dict)
def _(obj) -> str:
    pairs = ", ".join(f"{serialize(k)}: {serialize(v)}" for k, v in obj.items())
    return "{" + pairs + "}"


print(serialize(42))                    # "42"
print(serialize("hello"))              # '"hello"'
print(serialize([1, "two", 3.0]))      # '[1, "two", 3.0]'
print(serialize({"a": 1, "b": [2]}))   # '{"a": 1, "b": [2]}'


# ============================================================
# functools.total_ordering: auto-generate comparison methods
# ============================================================

@functools.total_ordering
class Version:
    """Semantic version with auto-generated comparison operators."""

    def __init__(self, major: int, minor: int, patch: int):
        self.major = major
        self.minor = minor
        self.patch = patch

    def __eq__(self, other):
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) == (
            other.major, other.minor, other.patch
        )

    def __lt__(self, other):
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) < (
            other.major, other.minor, other.patch
        )

    def __repr__(self):
        return f"Version({self.major}.{self.minor}.{self.patch})"


v1 = Version(2, 1, 0)
v2 = Version(2, 3, 1)
v3 = Version(2, 1, 0)

print(v1 < v2)    # True   (from __lt__)
print(v1 <= v3)   # True   (auto-generated)
print(v2 > v1)    # True   (auto-generated)
print(v2 >= v1)   # True   (auto-generated)
print(sorted([v2, v1, Version(1, 0, 0)]))
# [Version(1.0.0), Version(2.1.0), Version(2.3.1)]


# ============================================================
# functools.reduce: fold operations
# ============================================================

# Summing nested values with reduce
data = [{"value": 10}, {"value": 25}, {"value": 15}]
total = functools.reduce(lambda acc, d: acc + d["value"], data, 0)
print(total)  # 50

# Building a nested dict path accessor
def get_nested(data: dict, path: str, default=None):
    """Access nested dict values with dot notation: 'a.b.c'."""
    try:
        return functools.reduce(operator.getitem, path.split("."), data)
    except (KeyError, TypeError):
        return default


config = {"db": {"host": "localhost", "port": 5432, "pool": {"min": 2, "max": 10}}}
print(get_nested(config, "db.host"))         # "localhost"
print(get_nested(config, "db.pool.max"))     # 10
print(get_nested(config, "db.missing", 0))   # 0`,
      exercise: `**Exercises:**

1. Using only \`itertools\` functions, write a \`sliding_window(iterable, n)\` generator that yields overlapping windows of size \`n\`. For example, \`sliding_window([1,2,3,4,5], 3)\` yields \`(1,2,3), (2,3,4), (3,4,5)\`. Compare your implementation with \`itertools.pairwise\` and Python 3.12's \`itertools.batched\`.

2. Implement a \`@memoize_with_ttl(seconds)\` decorator using \`functools.wraps\` that caches results like \`lru_cache\` but expires entries after the given TTL. Store timestamps alongside cached values. Add \`.cache_info()\` and \`.cache_clear()\` methods.

3. Use \`functools.singledispatch\` to build a \`to_html(obj)\` function that renders Python objects as HTML: \`str\` to \`<p>\`, \`list\` to \`<ul><li>...</li></ul>\`, \`dict\` to an HTML \`<table>\`, and custom dataclasses to a \`<div>\` with labeled fields.

4. Write a function \`parallel_map(func, iterables, chunk_size)\` that uses \`itertools.batched\` (or your own implementation) to split work into chunks, applies \`func\` to each chunk using \`concurrent.futures.ProcessPoolExecutor\`, and yields results in order.

5. Build a CLI-style pipeline processor using \`itertools.chain\`, \`filterfalse\`, \`takewhile\`, and \`groupby\`: read a simulated log stream, filter out DEBUG lines, group by timestamp hour, and compute per-hour error counts.

6. Implement \`@functools.total_ordering\` on a \`Priority\` class with a name and numeric priority. Then use it with \`heapq\` to build a working priority queue. Demonstrate that all six comparison operators work correctly.`,
      commonMistakes: [
        "Passing unhashable arguments (lists, dicts, sets) to `@lru_cache`-decorated functions. Since the cache uses a dict internally, all arguments must be hashable. Convert lists to tuples and dicts to `frozenset(d.items())` before caching, or use a custom wrapper.",
        "Using `itertools.groupby` on unsorted data. `groupby` only groups **consecutive** elements with the same key. If your data is `[A, B, A, B]`, groupby yields four groups, not two. Always `sorted(data, key=keyfunc)` first, or use `collections.defaultdict` for non-consecutive grouping.",
        "Forgetting that `functools.reduce` with no initial value raises `TypeError` on an empty iterable. Always provide an initial value (third argument) in production code: `reduce(fn, iterable, initial)`.",
        "Using `@lru_cache` on methods without understanding that `self` is part of the cache key. Each instance creates separate cache entries, and instances are kept alive by the cache (memory leak). Use `@functools.cached_property` for per-instance caching of properties, or use a WeakRef-based approach for methods.",
        "Consuming an `itertools` iterator by accidentally converting it to a list during debugging (e.g., `print(list(iterator))`) and then trying to use the exhausted iterator downstream. Use `itertools.tee` to duplicate, or restructure so the iterator is consumed only once.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain how `functools.lru_cache` works internally. What data structures does it use, and what are its thread-safety guarantees?",
          a: "Internally, `lru_cache` uses a **hash map (dict)** for O(1) lookups keyed by the function arguments, and a **doubly-linked list** to track access order for LRU eviction. When a cached value is accessed, its node moves to the front of the linked list. When the cache is full and a new entry arrives, the least recently used entry (tail of the list) is evicted. **Thread safety**: In CPython, the GIL makes dict operations atomic, so cache lookups and updates are safe. However, the decorated function itself may be called simultaneously by multiple threads for the same arguments (cache miss race). The cache will store the result from whichever thread finishes first, and the other computation is wasted. For true thread-safe single-computation guarantees, combine with `threading.Lock`.",
        },
        {
          type: "tricky",
          q: "What is the difference between `functools.singledispatch` and method overloading in languages like Java? What are its limitations?",
          a: "`singledispatch` dispatches on the **type of the first positional argument only**, unlike Java which overloads based on the full method signature (all argument types, resolved at compile time). Limitations: 1) **Single argument dispatch** \u2014 cannot dispatch on multiple argument types (use `functools.singledispatchmethod` for methods, but it still dispatches on one argument). 2) **Runtime dispatch** \u2014 resolved at call time, not compile time, so no static type checking of dispatch correctness. 3) **No support for Union types** prior to Python 3.11. 4) **First argument only** \u2014 cannot dispatch on keyword arguments. For multi-dispatch, use third-party libraries like `multipledispatch` or `plum`. Despite limitations, singledispatch is cleaner than `isinstance` chains and integrates well with type annotations.",
        },
        {
          type: "scenario",
          q: "You need to process 10 million records from a database, apply 5 transformation steps, filter results, and write to a file. How would you use itertools and functools to make this memory-efficient?",
          a: "Build a **lazy pipeline** using itertools: 1) **Fetch in batches** using a generator that queries the DB with LIMIT/OFFSET or cursor-based pagination, yielding rows. 2) **Chain transformations** \u2014 each step is a generator: `map(transform_1, rows)` piped through `map(transform_2, ...)` etc. Use `itertools.starmap` if transformations need unpacking. 3) **Filter** with `itertools.filterfalse` (for exclusion) or generator expressions. 4) **Batch for writing** using `itertools.islice` or `batched(pipeline, 1000)` to write in chunks. 5) **Memoize expensive lookups** within transformations using `@functools.lru_cache` (e.g., caching currency conversion rates). The entire pipeline holds only one batch in memory at any time. Use `itertools.tee` only if you need to branch the pipeline (but beware memory \u2014 `tee` stores elements until all copies consume them).",
        },
        {
          type: "conceptual",
          q: "When would you use `functools.cached_property` vs `functools.lru_cache` on a method?",
          a: "`cached_property` computes a value **once per instance** and stores it directly on the instance dict, replacing the descriptor. It requires no arguments (property-style access). `lru_cache` on a method caches results keyed by `(self, *args)` in a **global** dict attached to the method, meaning: 1) instances are kept alive by the cache (memory leak), 2) the cache is shared across all instances. Use `cached_property` for expensive per-instance computations with no arguments (e.g., `self.computed_hash`). Use `lru_cache` for methods with varying arguments where you want cross-call caching. For per-instance method caching, consider storing a `lru_cache`-wrapped function in `__init__` or using a WeakRef pattern to avoid leaking instances.",
        },
      ],
    },
    {
      id: "py-collections-module",
      title: "collections Module",
      explanation: `The \`collections\` module provides **specialized container datatypes** that extend Python's built-in \`dict\`, \`list\`, \`set\`, and \`tuple\` with additional functionality. These are not exotic data structures \u2014 they are production workhorses that solve common problems more efficiently and expressively than rolling your own.

**\`namedtuple\`** creates lightweight, immutable, tuple subclasses with named fields. They use the same memory as regular tuples (no per-instance \`__dict__\`), support indexing and unpacking, and are perfect for representing records, coordinates, database rows, or any fixed-structure data. For new code, \`typing.NamedTuple\` provides the same functionality with type annotations.

**\`deque\`** (double-ended queue) is a **thread-safe**, O(1) append/pop from both ends. Lists are O(n) for \`insert(0, x)\` and \`pop(0)\` because they shift all elements. Deque with \`maxlen\` automatically evicts the oldest element when full \u2014 perfect for sliding windows, bounded buffers, and recent-history tracking.

**\`defaultdict\`** eliminates the "check if key exists, initialize if not" pattern. You provide a factory function (\`int\`, \`list\`, \`set\`, or a custom callable) that creates default values for missing keys. Nested defaultdicts enable auto-vivifying tree structures.

**\`OrderedDict\`** was essential before Python 3.7 when dicts were unordered. Since 3.7, regular dicts maintain insertion order, but \`OrderedDict\` still offers unique features: \`move_to_end(key)\`, equality that considers order, and \`popitem(last=True/False)\` for FIFO/LIFO behavior. It's the backbone of LRU cache implementations.

**\`ChainMap\`** groups multiple dicts into a single view. Lookups search each dict in order. It's ideal for layered configuration (defaults < config file < environment < CLI args), template variable scoping, and any scenario where you need to overlay multiple namespaces without copying.

| Container | When to Use | Key Advantage |
|---|---|---|
| \`namedtuple\` | Fixed-structure records | Memory-efficient, immutable |
| \`deque\` | FIFO queues, sliding windows | O(1) both-end operations |
| \`defaultdict\` | Grouping, counting, accumulating | Auto-initialization |
| \`OrderedDict\` | Order-sensitive equality, LRU caches | \`move_to_end\`, ordered equality |
| \`ChainMap\` | Layered lookups, scoped configs | No-copy dict overlay |
| \`Counter\` | Frequency counting, multisets | Arithmetic on counts |`,
      codeExample: `# ============================================================
# namedtuple: lightweight immutable records
# ============================================================
from collections import namedtuple, deque, defaultdict, OrderedDict, ChainMap, Counter
from typing import NamedTuple, Optional
import time
import json


# Classic namedtuple
HttpResponse = namedtuple("HttpResponse", ["status", "headers", "body"])

resp = HttpResponse(status=200, headers={"Content-Type": "application/json"}, body='{}')
print(resp.status)       # 200
print(resp[0])           # 200  (tuple indexing still works)
status, headers, body = resp  # Unpacking works

# Convert to dict for serialization
print(resp._asdict())    # {'status': 200, 'headers': {...}, 'body': '{}'}

# Create modified copy (namedtuples are immutable)
error_resp = resp._replace(status=404, body='{"error": "not found"}')
print(error_resp.status) # 404
print(resp.status)       # 200  (original unchanged)


# typing.NamedTuple — modern approach with type hints and defaults
class DatabaseConfig(NamedTuple):
    host: str
    port: int = 5432
    database: str = "myapp"
    pool_min: int = 2
    pool_max: int = 10

    @property
    def connection_string(self) -> str:
        return f"postgresql://{self.host}:{self.port}/{self.database}"


config = DatabaseConfig(host="prod-db-1", pool_max=20)
print(config.connection_string)  # postgresql://prod-db-1:5432/myapp
print(config.pool_max)           # 20


# ============================================================
# deque: high-performance double-ended queue
# ============================================================

# Bounded deque as a sliding window / recent history
class RecentActivityTracker:
    """Track the N most recent user actions."""

    def __init__(self, max_size: int = 100):
        self._actions: deque = deque(maxlen=max_size)

    def record(self, action: str) -> None:
        self._actions.append({"action": action, "timestamp": time.time()})

    def recent(self, n: int = 10) -> list[dict]:
        """Get n most recent actions (newest first)."""
        return list(reversed(self._actions))[:n]

    @property
    def count(self) -> int:
        return len(self._actions)


tracker = RecentActivityTracker(max_size=5)
for action in ["login", "view_page", "edit_profile", "upload", "logout", "login"]:
    tracker.record(action)
print(tracker.count)  # 5 (oldest "login" was evicted)


# Deque as efficient FIFO queue
task_queue: deque = deque()
task_queue.append("task_1")     # Add to right (enqueue)
task_queue.append("task_2")
task_queue.append("task_3")
next_task = task_queue.popleft() # Remove from left (dequeue) — O(1)!
print(next_task)                 # "task_1"

# Rotate elements
d = deque([1, 2, 3, 4, 5])
d.rotate(2)     # Rotate right by 2
print(list(d))  # [4, 5, 1, 2, 3]
d.rotate(-2)    # Rotate left by 2
print(list(d))  # [1, 2, 3, 4, 5]


# ============================================================
# defaultdict: automatic initialization patterns
# ============================================================

# Group items by category
products = [
    ("electronics", "laptop"),
    ("clothing", "shirt"),
    ("electronics", "phone"),
    ("clothing", "jacket"),
    ("electronics", "tablet"),
    ("food", "apple"),
]

by_category = defaultdict(list)
for category, product in products:
    by_category[category].append(product)

print(dict(by_category))
# {'electronics': ['laptop', 'phone', 'tablet'],
#  'clothing': ['shirt', 'jacket'],
#  'food': ['apple']}


# Count occurrences
word_counts = defaultdict(int)
words = "the cat sat on the mat the cat".split()
for word in words:
    word_counts[word] += 1
print(dict(word_counts))  # {'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1}


# Nested defaultdict: auto-vivifying tree
def tree():
    """Create an auto-vivifying tree (infinite nesting)."""
    return defaultdict(tree)


config_tree = tree()
config_tree["database"]["primary"]["host"] = "db-1.prod"
config_tree["database"]["primary"]["port"] = 5432
config_tree["database"]["replica"]["host"] = "db-2.prod"
config_tree["cache"]["redis"]["host"] = "redis.prod"

# Convert to regular dict for serialization
def tree_to_dict(t):
    if isinstance(t, defaultdict):
        return {k: tree_to_dict(v) for k, v in t.items()}
    return t

print(json.dumps(tree_to_dict(config_tree), indent=2))


# defaultdict with set for unique value tracking
user_logins = defaultdict(set)
login_events = [
    ("alice", "192.168.1.1"),
    ("bob", "10.0.0.1"),
    ("alice", "192.168.1.2"),
    ("alice", "192.168.1.1"),  # Duplicate IP for alice
    ("bob", "10.0.0.1"),      # Duplicate IP for bob
]

for user, ip in login_events:
    user_logins[user].add(ip)

print(dict(user_logins))
# {'alice': {'192.168.1.1', '192.168.1.2'}, 'bob': {'10.0.0.1'}}


# ============================================================
# Counter: frequency analysis and multiset operations
# ============================================================

# Word frequency analysis
text = "to be or not to be that is the question"
word_freq = Counter(text.split())
print(word_freq.most_common(3))  # [('to', 2), ('be', 2), ('or', 1)]

# Arithmetic on Counters (multiset operations)
inventory_a = Counter(apples=5, oranges=3, bananas=2)
inventory_b = Counter(apples=2, oranges=5, grapes=4)

combined = inventory_a + inventory_b
print(combined)  # Counter({'oranges': 8, 'apples': 7, 'grapes': 4, 'bananas': 2})

difference = inventory_a - inventory_b  # Only positive counts kept
print(difference)  # Counter({'bananas': 2, 'apples': 3})

# Intersection (minimum) and union (maximum)
common = inventory_a & inventory_b
print(common)  # Counter({'oranges': 3, 'apples': 2})

total = inventory_a | inventory_b
print(total)   # Counter({'oranges': 5, 'apples': 5, 'grapes': 4, 'bananas': 2})


# ============================================================
# OrderedDict: order-aware dictionary operations
# ============================================================

class LRUCache:
    """Simple LRU cache using OrderedDict."""

    def __init__(self, capacity: int):
        self._cache: OrderedDict = OrderedDict()
        self._capacity = capacity

    def get(self, key: str) -> Optional[str]:
        if key not in self._cache:
            return None
        self._cache.move_to_end(key)  # Mark as recently used
        return self._cache[key]

    def put(self, key: str, value: str) -> None:
        if key in self._cache:
            self._cache.move_to_end(key)
        self._cache[key] = value
        if len(self._cache) > self._capacity:
            self._cache.popitem(last=False)  # Remove oldest (FIFO end)

    def __repr__(self) -> str:
        items = ", ".join(f"{k}={v}" for k, v in self._cache.items())
        return f"LRUCache([{items}])"


cache = LRUCache(capacity=3)
cache.put("a", "1")
cache.put("b", "2")
cache.put("c", "3")
print(cache)          # LRUCache([a=1, b=2, c=3])

cache.get("a")        # Access "a" — moves to end
cache.put("d", "4")   # Evicts "b" (least recently used)
print(cache)          # LRUCache([c=3, a=1, d=4])


# OrderedDict equality considers order
od1 = OrderedDict([("a", 1), ("b", 2)])
od2 = OrderedDict([("b", 2), ("a", 1)])
print(od1 == od2)  # False (different order)

d1 = {"a": 1, "b": 2}
d2 = {"b": 2, "a": 1}
print(d1 == d2)    # True (regular dicts ignore order in equality)


# ============================================================
# ChainMap: layered configuration
# ============================================================

# Layered configuration: CLI > env > config file > defaults
defaults = {"debug": False, "log_level": "INFO", "port": 8080, "host": "0.0.0.0"}
config_file = {"log_level": "WARNING", "port": 9090}
env_vars = {"debug": True}
cli_args = {"port": 3000}

# Highest priority first
settings = ChainMap(cli_args, env_vars, config_file, defaults)

print(settings["port"])       # 3000  (from cli_args)
print(settings["debug"])      # True  (from env_vars)
print(settings["log_level"])  # WARNING  (from config_file)
print(settings["host"])       # 0.0.0.0  (from defaults)

# Mutations only affect the first mapping
settings["new_key"] = "value"
print(cli_args)  # {'port': 3000, 'new_key': 'value'}

# Create a child scope (useful for template engines, variable scoping)
local_scope = settings.new_child({"port": 5000, "local_var": True})
print(local_scope["port"])       # 5000  (local override)
print(local_scope["debug"])      # True  (inherited from parent chain)
print(local_scope["local_var"])  # True


# ============================================================
# Practical: combining collections for a metrics aggregator
# ============================================================

class MetricsAggregator:
    """Aggregate application metrics using collections."""

    def __init__(self, window_size: int = 1000):
        self._recent_latencies: deque = deque(maxlen=window_size)
        self._error_counts: Counter = Counter()
        self._endpoint_hits: defaultdict = defaultdict(int)
        self._status_by_endpoint: defaultdict = defaultdict(Counter)

    def record(self, endpoint: str, status: int, latency_ms: float) -> None:
        self._recent_latencies.append(latency_ms)
        self._endpoint_hits[endpoint] += 1
        self._status_by_endpoint[endpoint][status] += 1
        if status >= 400:
            self._error_counts[f"{endpoint}:{status}"] += 1

    def avg_latency(self) -> float:
        if not self._recent_latencies:
            return 0.0
        return sum(self._recent_latencies) / len(self._recent_latencies)

    def top_errors(self, n: int = 5) -> list:
        return self._error_counts.most_common(n)

    def summary(self) -> dict:
        return {
            "avg_latency_ms": round(self.avg_latency(), 2),
            "total_requests": sum(self._endpoint_hits.values()),
            "top_errors": self.top_errors(),
        }


metrics = MetricsAggregator(window_size=100)
metrics.record("/api/users", 200, 45.2)
metrics.record("/api/users", 200, 52.1)
metrics.record("/api/orders", 500, 1200.5)
metrics.record("/api/orders", 500, 980.3)
metrics.record("/api/auth", 401, 12.0)
print(metrics.summary())`,
      exercise: `**Exercises:**

1. Build a \`namedtuple\`-based \`LogEntry\` with fields \`timestamp\`, \`level\`, \`service\`, \`message\`. Write a parser that reads log lines into \`LogEntry\` instances, then use \`Counter\` to find the top 5 most common error messages and \`defaultdict\` to group entries by service.

2. Implement a **bounded task queue** using \`deque(maxlen=N)\` that supports \`enqueue\`, \`dequeue\`, \`peek\`, and \`is_full\`. When the queue is full and a new item is enqueued, the oldest item should be silently dropped (not raise an error). Add a \`drain()\` method that yields all items.

3. Create a \`ChainMap\`-based **template variable resolver** that supports nested scopes. Implement \`enter_scope(vars)\` (pushes a new scope), \`exit_scope()\` (pops the current scope), and \`resolve(name)\` (looks up a variable through all scopes). Test with three levels of nesting.

4. Use \`defaultdict(lambda: defaultdict(list))\` to build an **inverted index**: given a list of documents (strings), create a mapping from each word to the list of (doc_id, position) pairs where it appears. Then implement a \`search(word)\` function that returns matching documents with highlighted positions.

5. Implement a complete **LRU cache** using \`OrderedDict\` that supports \`get\`, \`put\`, \`delete\`, \`resize\` (change capacity), and \`stats\` (hits, misses, evictions). Write unit tests that verify eviction order and hit/miss counts.

6. Build a \`Counter\`-based **shopping cart** that supports adding items, removing items, merging two carts (\`+\`), finding common items between carts (\`&\`), and computing total price given a price lookup dict. Demonstrate all multiset operations.`,
      commonMistakes: [
        "Using `defaultdict` when a regular dict with `.setdefault()` or `.get(default)` would suffice. `defaultdict` creates the default value on *any* missing key access, including accidental reads, which can silently populate the dict with unintended keys. Use `dict.get(key, default)` when you only want to read without side effects.",
        "Forgetting that `deque.maxlen` silently discards elements from the opposite end when the deque is full. If you append to the right on a full deque, the leftmost element is dropped without warning. This is by design for sliding windows but can cause data loss if you expect an error.",
        "Assuming `OrderedDict` is needed in Python 3.7+. Regular dicts maintain insertion order since 3.7. Only use `OrderedDict` when you need order-sensitive equality (`OrderedDict([('a',1),('b',2)]) != OrderedDict([('b',2),('a',1)])`), `move_to_end()`, or `popitem(last=False)` for FIFO behavior.",
        "Mutating a `namedtuple` field directly. Namedtuples are immutable — `point.x = 10` raises `AttributeError`. Use `point._replace(x=10)` to create a modified copy. If you need mutability, use a `dataclass` instead.",
        "Not converting `defaultdict` back to a regular `dict` before serialization. `json.dumps(defaultdict(...))` works, but the output type info is lost. More importantly, passing a `defaultdict` to code that doesn't expect auto-vivification can cause subtle bugs. Always `dict(my_defaultdict)` at boundaries.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Compare `namedtuple`, `dataclass`, and `TypedDict`. When would you choose each?",
          a: "**`namedtuple`**: Immutable, tuple-based, minimal memory (no `__dict__`), supports indexing and unpacking. Choose for lightweight, immutable records like coordinates, DB rows, or function return values. **`dataclass`**: Mutable by default (or `frozen=True` for immutable), supports default values, `__post_init__`, inheritance, and `field()` for complex defaults. Choose for domain models, entities, and anything needing methods or mutability. **`TypedDict`**: Not a runtime class \u2014 it's a type hint for dicts with specific keys. No runtime enforcement. Choose for typing JSON payloads, API responses, or any dict-shaped data where you want static type checking but don't want to create a class. Key trade-off: `namedtuple` for performance and immutability, `dataclass` for full-featured classes, `TypedDict` for typing existing dict patterns.",
        },
        {
          type: "tricky",
          q: "Why is `deque` thread-safe for `append` and `popleft` but `list` is not safe for `insert(0, x)` and `pop(0)`?",
          a: "In CPython, `deque.append()` and `deque.popleft()` are **single C-level operations** protected by the GIL \u2014 they complete atomically without releasing the GIL mid-operation. `list.insert(0, x)` must shift all elements right (O(n) memory moves), and `list.pop(0)` must shift all elements left. These multi-step operations can be interrupted by a thread switch between element moves, potentially corrupting the list. Deque's doubly-linked-list structure means append/pop only modify pointers at the ends \u2014 a single, atomic pointer update. Note: this thread safety is a CPython implementation detail, not a language guarantee. For portable thread safety, always use `queue.Queue` (which uses `deque` internally with proper locking).",
        },
        {
          type: "scenario",
          q: "Design a configuration system for a web application that supports defaults, environment-specific overrides, environment variables, and command-line arguments with proper precedence. Which collections would you use?",
          a: "Use **`ChainMap`** for layered precedence: `ChainMap(cli_args, env_vars, env_config, defaults)`. Lookups search left-to-right, so CLI args override everything. Implementation: 1) `defaults` \u2014 hardcoded `dict` with sensible defaults. 2) `env_config` \u2014 loaded from YAML/JSON file based on `APP_ENV` (e.g., `config.production.yml`). 3) `env_vars` \u2014 `dict` filtered from `os.environ` with a prefix (e.g., `APP_PORT`). 4) `cli_args` \u2014 parsed from `argparse`. Wrap in a **`namedtuple`** or **frozen `dataclass`** for typed access after resolution: `AppConfig = resolve_config(chain_map)`. Use `ChainMap.new_child()` for request-scoped overrides (e.g., feature flags per request). For nested config, use `defaultdict(dict)` during building, then freeze into the final immutable structure.",
        },
        {
          type: "conceptual",
          q: "How does `Counter` support multiset (bag) algebra? Give a practical example.",
          a: "`Counter` implements multiset operations via arithmetic operators: `+` (union/sum), `-` (difference, drops non-positive), `&` (intersection/minimum), `|` (union/maximum). Practical example \u2014 inventory management: `warehouse_a = Counter(widget=50, gadget=30)`, `warehouse_b = Counter(widget=20, gadget=45, doohickey=10)`. `warehouse_a + warehouse_b` gives total inventory. `warehouse_a & warehouse_b` gives the minimum available across both (for guaranteed fulfillment). `warehouse_a - warehouse_b` shows where A has surplus. `most_common(n)` finds the top-stocked items. `Counter` also supports unary `+` (strip non-positive) and `-` (negate counts), and `total()` (Python 3.10+) for the sum of all counts. This makes it ideal for frequency analysis, bag-of-words models, and voting/tallying systems.",
        },
      ],
    },
  ],
};

export default pyPhase7;
