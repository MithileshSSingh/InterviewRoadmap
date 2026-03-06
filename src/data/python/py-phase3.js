const pyPhase3 = {
  id: "phase-3",
  title: "Phase 3: Functions & Modules",
  emoji: "🔧",
  description:
    "Master Python functions — arguments, scope, closures, and the module system for organizing and reusing code.",
  topics: [
    {
      id: "py-functions-basics",
      title: "Functions & Arguments",
      explanation: `Functions are the fundamental building blocks of Python programs. Python functions are **first-class objects** — they can be assigned to variables, passed as arguments, returned from other functions, and stored in data structures.

**Function definition:**
\`\`\`python
def function_name(param1, param2="default"):
    """Docstring describing the function."""
    return result
\`\`\`

**Argument types:**

| Type | Syntax | Description |
|------|--------|-------------|
| Positional | \`f(a, b)\` | Matched by position |
| Keyword | \`f(a=1, b=2)\` | Matched by name |
| Default | \`def f(x=10)\` | Fallback value if not provided |
| *args | \`def f(*args)\` | Variable positional args (tuple) |
| **kwargs | \`def f(**kwargs)\` | Variable keyword args (dict) |
| Positional-only | \`def f(x, /)\` | Must be passed positionally (3.8+) |
| Keyword-only | \`def f(*, x)\` | Must be passed as keyword |

**Type hints** (PEP 484) add optional type annotations. They don't enforce types at runtime but help with documentation, IDE support, and static analysis with \`mypy\`.

**Docstrings** (PEP 257) document what a function does. Use triple quotes, describe parameters and return values. The first line should be a concise summary.

**Key principle:** Functions should do **one thing well**. If a function name needs "and" in it (e.g., \`validate_and_save\`), consider splitting it into two functions.`,
      codeExample: `# ============================================================
# Basic function definition
# ============================================================
def greet(name: str, greeting: str = "Hello") -> str:
    """Return a greeting message.

    Args:
        name: The name of the person to greet.
        greeting: The greeting word. Defaults to "Hello".

    Returns:
        A formatted greeting string.
    """
    return f"{greeting}, {name}!"

print(greet("Alice"))              # "Hello, Alice!"
print(greet("Bob", "Hey"))         # "Hey, Bob!"
print(greet(greeting="Hi", name="Charlie"))  # "Hi, Charlie!"

# ============================================================
# *args and **kwargs
# ============================================================
def log_message(level: str, *messages, **metadata):
    """Log messages with metadata."""
    combined = " ".join(str(m) for m in messages)
    meta_str = ", ".join(f"{k}={v}" for k, v in metadata.items())
    print(f"[{level}] {combined}" + (f" ({meta_str})" if meta_str else ""))

log_message("INFO", "Server started", "on port", 8080)
# [INFO] Server started on port 8080

log_message("ERROR", "Connection failed", host="db.server.com", retry=3)
# [ERROR] Connection failed (host=db.server.com, retry=3)

# ============================================================
# Positional-only and keyword-only parameters (Python 3.8+)
# ============================================================
def divide(a, b, /, *, round_to=None):
    """
    a, b: positional-only (before /)
    round_to: keyword-only (after *)
    """
    result = a / b
    if round_to is not None:
        result = round(result, round_to)
    return result

print(divide(10, 3))               # 3.3333...
print(divide(10, 3, round_to=2))   # 3.33
# divide(a=10, b=3)  # TypeError: positional-only

# ============================================================
# Functions as first-class objects
# ============================================================
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

# Assign to variable
operation = add
print(operation(5, 3))  # 8

# Store in data structures
operations = {
    "+": add,
    "-": subtract,
    "*": lambda a, b: a * b,
}
print(operations["*"](4, 5))  # 20

# Pass as argument
def apply_operation(func, a, b):
    return func(a, b)

print(apply_operation(add, 10, 5))  # 15

# Return from function
def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5))    # 10
print(triple(5))    # 15

# ============================================================
# Type hints (PEP 484)
# ============================================================
from typing import Optional, Union

def find_user(
    user_id: int,
    include_inactive: bool = False,
) -> Optional[dict]:
    """Find user by ID. Returns None if not found."""
    users = {1: {"name": "Alice", "active": True}}
    user = users.get(user_id)
    if user and (include_inactive or user.get("active")):
        return user
    return None

# Union types (Python 3.10+ can use | syntax)
def process(value: int | str) -> str:
    return str(value).upper()

# Complex type hints
from typing import Callable

def retry(func: Callable[..., str], attempts: int = 3) -> str:
    for i in range(attempts):
        try:
            return func()
        except Exception:
            if i == attempts - 1:
                raise
    return ""

# ============================================================
# Default argument pitfall (CRITICAL!)
# ============================================================
# BAD — mutable default argument is shared across calls!
def append_to_bad(item, lst=[]):
    lst.append(item)
    return lst

print(append_to_bad(1))  # [1]
print(append_to_bad(2))  # [1, 2] ← Unexpected! Same list!
print(append_to_bad(3))  # [1, 2, 3] ← Accumulating!

# GOOD — use None as sentinel
def append_to_good(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print(append_to_good(1))  # [1]
print(append_to_good(2))  # [2] ← Correct! New list each time.

# ============================================================
# Unpacking arguments
# ============================================================
def create_user(name, age, city):
    return {"name": name, "age": age, "city": city}

# Unpack list/tuple as positional args
args = ["Alice", 30, "NYC"]
user = create_user(*args)

# Unpack dict as keyword args
kwargs = {"name": "Bob", "age": 25, "city": "LA"}
user = create_user(**kwargs)

# Forwarding args (common in decorators)
def wrapper(*args, **kwargs):
    print(f"Called with args={args}, kwargs={kwargs}")
    return create_user(*args, **kwargs)`,
      exercise: `**Exercises:**

1. Write a function \`safe_divide(a, b, /, *, default=0)\` that uses positional-only and keyword-only parameters. Return \`default\` on division by zero.

2. Create a \`make_validator(min_val, max_val)\` function that returns a validator function. The returned function should check if a value is within range.

3. Implement a \`retry(func, max_attempts=3, delay=1)\` function that retries a function on exception, with exponential backoff.

4. Write a function with full type hints that accepts a list of dictionaries, filters by a key-value pair, and returns sorted results. Use \`typing\` module.

5. Demonstrate the mutable default argument bug. Then create a decorator that automatically fixes mutable defaults.

6. Build a function \`pipe(*functions)\` that takes multiple functions and returns a new function that applies them in sequence: \`pipe(f, g, h)(x)\` = \`h(g(f(x)))\`.`,
      commonMistakes: [
        "Using mutable default arguments: `def f(lst=[])` shares the same list across all calls. Always use `None` as default and create new objects inside the function.",
        "Not understanding argument order: positional → *args → keyword-only → **kwargs. The full signature order is: `def f(pos_only, /, normal, *args, kw_only, **kwargs)`.",
        "Forgetting that `return` without a value (or no return statement) returns `None`. If your function should return a value, always include an explicit `return`.",
        "Writing functions that are too long or do too many things. If you need to scroll to read the whole function, it's too long. Split into smaller, well-named functions.",
        "Not using type hints in production code. While optional, type hints catch bugs early with mypy, improve IDE autocompletion, and serve as documentation.",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What is the output? `def f(a, b=[]): b.append(a); return b` called as `f(1)`, `f(2)`, `f(3)`?",
          a: "Output: `[1]`, `[1, 2]`, `[1, 2, 3]`. This is the **mutable default argument trap**. Default arguments are evaluated **once** when the function is defined, not each time it's called. The list `[]` is created once and shared across all calls. Each call appends to the same list. Fix: use `def f(a, b=None): b = b if b is not None else []; b.append(a); return b`.",
        },
        {
          type: "conceptual",
          q: "Explain the difference between `*args` and `**kwargs`. When would you use both together?",
          a: "`*args` collects extra **positional** arguments into a **tuple**. `**kwargs` collects extra **keyword** arguments into a **dict**. Use both together when writing **wrapper functions** or **decorators** that need to accept and forward any arguments: `def wrapper(*args, **kwargs): return original(*args, **kwargs)`. Also useful for class constructors that call parent's `__init__`: `super().__init__(*args, **kwargs)`. The names `args` and `kwargs` are conventions, not keywords — `*data` and `**options` work too.",
        },
        {
          type: "coding",
          q: "Write a function `compose` that takes any number of single-argument functions and returns their composition.",
          a: '```python\nfrom functools import reduce\n\ndef compose(*funcs):\n    """compose(f, g, h)(x) == f(g(h(x)))"""\n    def composed(x):\n        result = x\n        for f in reversed(funcs):\n            result = f(result)\n        return result\n    return composed\n\n# Or using reduce:\ndef compose_v2(*funcs):\n    return reduce(lambda f, g: lambda x: f(g(x)), funcs)\n\ndouble = lambda x: x * 2\nadd_one = lambda x: x + 1\nsquare = lambda x: x ** 2\n\ntransform = compose(square, add_one, double)\nprint(transform(3))  # square(add_one(double(3))) = square(add_one(6)) = square(7) = 49\n```',
        },
      ],
    },
    {
      id: "py-scope-closures",
      title: "Scope & Closures",
      explanation: `Understanding variable scope and closures is essential for writing correct Python code. Python uses the **LEGB rule** to resolve variable names: it searches Local, Enclosing, Global, and Built-in scopes in that order.

**LEGB Rule:**

| Scope | Description | Example |
|-------|-------------|---------|
| **L**ocal | Inside the current function | Variables defined in the function body |
| **E**nclosing | Inside enclosing (outer) functions | Variables from an outer function in a nested function |
| **G**lobal | Module-level | Variables defined at the top level of a module |
| **B**uilt-in | Python's built-in names | \`print\`, \`len\`, \`range\`, \`True\` |

**Key rules:**
- Reading a variable searches LEGB from innermost to outermost
- **Assigning** to a variable makes it **local** by default
- Use \`global\` keyword to modify a global variable from a function
- Use \`nonlocal\` keyword to modify an enclosing scope variable

**Closures** occur when an inner function "remembers" variables from its enclosing scope even after the outer function has returned. This is the basis for decorators, factories, and callback patterns.

A closure has three properties:
1. It's a nested function
2. It references a variable from an enclosing scope (free variable)
3. The enclosing function has returned (the free variable outlives its scope)`,
      codeExample: `# ============================================================
# LEGB scope resolution
# ============================================================
x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        print(f"Inner: {x}")    # "local" (L)

    inner()
    print(f"Outer: {x}")        # "enclosing" (E)

outer()
print(f"Global: {x}")           # "global" (G)

# Built-in scope
print(len([1, 2, 3]))           # len is from built-in scope (B)

# ============================================================
# Assignment creates local scope (common gotcha)
# ============================================================
count = 0

def increment_bad():
    # This fails! Python sees the assignment below and treats
    # 'count' as local, but it's read before assignment
    # count = count + 1  # UnboundLocalError!
    pass

def increment_global():
    global count       # Explicitly reference global variable
    count = count + 1

increment_global()
print(count)  # 1

# ============================================================
# nonlocal keyword (modify enclosing scope)
# ============================================================
def make_counter():
    count = 0

    def increment():
        nonlocal count   # Reference enclosing scope's count
        count += 1
        return count

    def get_count():
        return count     # Reading doesn't need nonlocal

    return increment, get_count

inc, get = make_counter()
print(inc())      # 1
print(inc())      # 2
print(inc())      # 3
print(get())      # 3

# ============================================================
# Closures
# ============================================================
def make_multiplier(factor):
    """The inner function 'closes over' the 'factor' variable."""
    def multiply(x):
        return x * factor  # 'factor' is a free variable
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5))    # 10
print(triple(5))    # 15

# The closure still has access to 'factor' even though
# make_multiplier() has returned
print(double.__closure__[0].cell_contents)  # 2

# ============================================================
# Closure pitfall: late binding
# ============================================================
# BAD: All lambdas capture the same variable 'i'
functions = []
for i in range(5):
    functions.append(lambda: i)

# All return 4 (the final value of i)!
print([f() for f in functions])  # [4, 4, 4, 4, 4]

# GOOD: Use default argument to capture current value
functions = []
for i in range(5):
    functions.append(lambda i=i: i)  # Default arg captures current i

print([f() for f in functions])  # [0, 1, 2, 3, 4]

# BETTER: Use a factory function
def make_func(n):
    return lambda: n

functions = [make_func(i) for i in range(5)]
print([f() for f in functions])  # [0, 1, 2, 3, 4]

# ============================================================
# Practical closure: caching/memoization
# ============================================================
def memoize(func):
    cache = {}  # Closure over cache

    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]

    wrapper.cache = cache  # Expose cache for debugging
    return wrapper

@memoize
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(50))  # 12586269025 (instant, thanks to caching)
print(fibonacci.cache)  # Shows all cached values

# ============================================================
# Closure: configuration pattern
# ============================================================
def create_logger(prefix, level="INFO"):
    """Returns a logger function configured with prefix and level."""
    def log(message):
        print(f"[{level}] {prefix}: {message}")
    return log

db_logger = create_logger("DATABASE")
api_logger = create_logger("API", level="DEBUG")

db_logger("Connected")       # [INFO] DATABASE: Connected
api_logger("Request sent")   # [DEBUG] API: Request sent`,
      exercise: `**Exercises:**

1. Trace the LEGB resolution: create a variable named \`x\` at global, enclosing, and local scope. Print \`x\` at each level and explain the output.

2. Write a \`make_counter(start=0, step=1)\` function that returns \`increment\`, \`decrement\`, \`reset\`, and \`get_value\` functions using closures and \`nonlocal\`.

3. Demonstrate the late-binding closure bug with a loop. Show three different ways to fix it.

4. Build a \`rate_limiter(max_calls, period_seconds)\` using closures that tracks function calls and rejects excess calls within the time period.

5. Implement a closure-based \`accumulator\` that keeps a running total: each call adds to the total and returns the current sum.

6. Explain why \`x = x + 1\` inside a function (without \`global\`) causes \`UnboundLocalError\` even though \`x\` exists globally. Write code to demonstrate.`,
      commonMistakes: [
        "Getting `UnboundLocalError` when trying to modify a global variable inside a function. Python sees the assignment and creates a local variable, but then the read on the right side fails because the local hasn't been assigned yet.",
        "Overusing `global` — it makes code hard to reason about because any function can modify shared state. Pass values as parameters and return results instead.",
        "Not understanding closure late binding: lambdas in a loop all capture the SAME variable reference, not the value at the time of creation. Use default arguments or factory functions.",
        "Shadowing built-in names: `list = [1, 2, 3]` or `len = 5` — these override built-in functions. Use descriptive names like `items` or `length`.",
        "Confusing `global` and `nonlocal` — `global` references module-level variables, `nonlocal` references the nearest enclosing function's variable. Using the wrong one can modify unexpected variables.",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What is the output? `x = 10; def f(): print(x); f()` vs `x = 10; def f(): print(x); x = 20; f()`",
          a: "First version: prints `10` — reads global `x` normally. Second version: raises `UnboundLocalError` — Python's compiler sees `x = 20` in the function body and marks `x` as a **local variable** for the entire function. When `print(x)` executes, the local `x` hasn't been assigned yet, causing the error. This happens at **compile time**, not runtime — Python determines scope statically by scanning for assignments. Fix: use `global x` before the print, or don't assign to `x` in that function.",
        },
        {
          type: "conceptual",
          q: "What is a closure? How does Python implement it?",
          a: "A **closure** is a function that remembers and has access to variables from its **enclosing scope** even after that scope has finished executing. Python implements closures using **cell objects**: when a function references a free variable (from an enclosing scope), Python creates a cell object that holds a reference to that variable. The inner function's `__closure__` attribute contains these cells. You can inspect them: `func.__closure__[0].cell_contents`. Closures are used in decorators, factory functions, callbacks, and memoization patterns.",
        },
        {
          type: "scenario",
          q: "You're reviewing code that uses `global` extensively. What concerns would you raise?",
          a: "Concerns: 1) **Hidden dependencies** — functions depend on global state that isn't visible in their signatures. 2) **Thread safety** — global mutable state causes race conditions in concurrent code. 3) **Testing difficulty** — can't test functions in isolation without setting up global state. 4) **Name collisions** — global namespace pollution. 5) **Debugging difficulty** — any function can modify globals, making it hard to trace bugs. **Alternatives:** pass values as parameters, use classes for stateful behavior, use closures for encapsulated state, use dependency injection, or use module-level constants (not mutable globals).",
        },
      ],
    },
    {
      id: "py-modules-packages",
      title: "Modules & Packages",
      explanation: `Python's module system is how you organize code into reusable, maintainable units. A **module** is a single \`.py\` file. A **package** is a directory containing modules and an \`__init__.py\` file (optional since Python 3.3 for namespace packages, but recommended).

**Import types:**
\`\`\`python
import math                    # Import entire module
from math import sqrt, pi      # Import specific names
from math import *             # Import all (avoid in production!)
import numpy as np             # Alias
from os.path import join as pjoin  # Import + alias
\`\`\`

**How Python finds modules (in order):**
1. **Current directory** (or script's directory)
2. **PYTHONPATH** environment variable directories
3. **Standard library** directories
4. **site-packages** (pip-installed packages)

This search order is stored in \`sys.path\` and can be modified at runtime.

**Package structure:**
\`\`\`
mypackage/
├── __init__.py       # Makes it a package, runs on import
├── module_a.py
├── module_b.py
└── subpackage/
    ├── __init__.py
    └── module_c.py
\`\`\`

**Important files:**
- \`__init__.py\` — Executes when the package is imported. Used to expose a clean public API.
- \`__main__.py\` — Executes when the package is run with \`python -m package_name\`.
- \`__all__\` — List of names exported by \`from module import *\`.

**Best practices:**
- Use **absolute imports** (\`from mypackage.module import func\`) over relative imports
- Keep \`__init__.py\` minimal — just re-exports, not heavy logic
- Use \`if __name__ == "__main__":\` guard for executable scripts`,
      codeExample: `# ============================================================
# Module basics
# ============================================================
# File: mathutils.py
"""Math utility functions."""

PI = 3.14159265358979

def circle_area(radius):
    """Calculate the area of a circle."""
    return PI * radius ** 2

def factorial(n):
    """Calculate n factorial."""
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# This block only runs when the file is executed directly,
# NOT when it's imported as a module
if __name__ == "__main__":
    print(f"Pi: {PI}")
    print(f"Area of circle with r=5: {circle_area(5)}")
    print(f"10! = {factorial(10)}")

# ============================================================
# Import styles
# ============================================================
# In another file:
# import mathutils
# print(mathutils.circle_area(5))

# from mathutils import circle_area, PI
# print(circle_area(5))

# import mathutils as mu
# print(mu.circle_area(5))

# ============================================================
# Package structure
# ============================================================

# myapp/
# ├── __init__.py       ← Package initializer
# ├── __main__.py       ← Run with: python -m myapp
# ├── core/
# │   ├── __init__.py
# │   ├── models.py
# │   └── database.py
# ├── api/
# │   ├── __init__.py
# │   ├── routes.py
# │   └── middleware.py
# └── utils/
#     ├── __init__.py
#     ├── helpers.py
#     └── validators.py

# ============================================================
# __init__.py — package API
# ============================================================

# myapp/__init__.py
# """MyApp — A sample application."""
# __version__ = "1.0.0"
#
# # Re-export commonly used names for clean imports
# from myapp.core.models import User, Product
# from myapp.core.database import connect
#
# __all__ = ["User", "Product", "connect"]

# Users can then do:
# from myapp import User, connect
# Instead of:
# from myapp.core.models import User

# ============================================================
# __main__.py — package as script
# ============================================================

# myapp/__main__.py
# """Entry point when running: python -m myapp"""
# from myapp.core.database import connect
#
# def main():
#     db = connect()
#     print(f"Connected to {db}")
#
# if __name__ == "__main__":
#     main()

# ============================================================
# Relative imports (within a package)
# ============================================================

# In myapp/api/routes.py:
# from . import middleware          # Same package
# from ..core import models         # Parent's sibling package
# from ..utils.helpers import slugify  # Specific function

# NOTE: Relative imports only work inside packages.
# Running a file directly (python routes.py) won't work with
# relative imports. Use: python -m myapp.api.routes

# ============================================================
# sys.path and module resolution
# ============================================================
import sys

# View the search path
for path in sys.path:
    print(path)

# Add a custom path (useful for development)
# sys.path.insert(0, '/path/to/my/modules')

# Check where a module is loaded from
import json
print(json.__file__)   # Path to json module
print(json.__name__)   # 'json'
print(json.__package__)  # 'json'

# ============================================================
# Module introspection
# ============================================================
import os

# List all names in a module
print(dir(os))

# Get module docstring
print(os.__doc__[:200])

# Check if a name exists in a module
print(hasattr(os, 'getcwd'))  # True

# Dynamically import a module
import importlib
json_module = importlib.import_module('json')
print(json_module.dumps({"key": "value"}))

# ============================================================
# __all__ — controlling star imports
# ============================================================

# In mymodule.py:
# __all__ = ["public_func", "PublicClass"]
#
# def public_func():
#     pass
#
# def _private_func():
#     pass  # Not exported by star import (convention)
#
# class PublicClass:
#     pass

# from mymodule import * → only imports public_func and PublicClass

# ============================================================
# if __name__ == "__main__" pattern
# ============================================================
def main():
    """Main entry point."""
    print("Running as script")

# This guard is critical!
# Without it, the code below would run on IMPORT too
if __name__ == "__main__":
    main()

# When imported:  __name__ == "mathutils" (module name)
# When run directly: __name__ == "__main__"`,
      exercise: `**Exercises:**

1. Create a small package called \`calculator\` with modules for \`basic.py\` (add, subtract, multiply, divide), \`scientific.py\` (sqrt, power, log), and an \`__init__.py\` that re-exports the most common functions.

2. Add a \`__main__.py\` to your calculator package so it can be run with \`python -m calculator\` as an interactive calculator.

3. Explore \`sys.path\`: print all directories Python searches for modules. Add a custom directory and import a module from it.

4. Create a module with \`__all__\` defined. Demonstrate the difference between \`from module import *\` with and without \`__all__\`.

5. Write a function \`lazy_import(module_name)\` that dynamically imports a module using \`importlib\` only when first accessed. This is useful for optional dependencies.

6. Demonstrate the difference between absolute and relative imports in a package with nested subpackages.`,
      commonMistakes: [
        "Circular imports — module A imports module B which imports module A. Fix by restructuring code, using local imports (inside functions), or extracting shared code to a third module.",
        "Running a package file directly (`python mypackage/module.py`) instead of as a module (`python -m mypackage.module`). Direct execution breaks relative imports.",
        "Using `from module import *` in production code — it pollutes the namespace, makes it unclear where names come from, and can cause silent shadowing of existing names.",
        "Not understanding `if __name__ == '__main__':` — code outside this guard runs on both import AND direct execution. Tests, print statements, and initialization code should be inside the guard.",
        "Naming your module the same as a standard library module (e.g., creating `json.py` or `email.py` in your project). This shadows the built-in module and causes confusing import errors.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What happens when you `import module` in Python? Walk through the process.",
          a: "1. **Check cache:** Python checks `sys.modules` — if the module is already imported, return the cached version (modules are singletons). 2. **Find the module:** Search `sys.path` directories for the module (current dir → PYTHONPATH → stdlib → site-packages). 3. **Create module object:** Create a new `types.ModuleType` object and add it to `sys.modules` (before execution, to handle circular imports). 4. **Execute the module:** Run the module's code in the module's namespace. All top-level statements execute. 5. **Bind the name:** Bind the module name in the importing module's namespace. For `from module import name`, only the specified names are bound.",
        },
        {
          type: "tricky",
          q: "How do you handle circular imports in Python?",
          a: "**Solutions for circular imports:** 1) **Restructure** — extract shared code to a third module that both import. 2) **Local imports** — move `import` inside the function that needs it, so it only runs when called, not at module load time. 3) **Import at end** — place the problematic import at the bottom of the module. 4) **Dependency injection** — pass dependencies as function/constructor arguments instead of importing them. 5) **Lazy imports** — use `importlib.import_module()` inside functions. The root cause is usually poor architecture — circular dependencies indicate tight coupling that should be broken.",
        },
        {
          type: "scenario",
          q: "You want to make a Python library installable via pip. What files and structure do you need?",
          a: "Minimum structure:\n```\nmy-library/\n├── src/\n│   └── my_library/\n│       ├── __init__.py\n│       └── core.py\n├── tests/\n│   └── test_core.py\n├── pyproject.toml     # Build config + metadata\n├── README.md\n└── LICENSE\n```\n`pyproject.toml` needs: `[project]` section with name, version, description, dependencies, and `[build-system]` specifying the build backend (setuptools, hatchling, flit, etc.). Then: `pip install -e .` for development, `python -m build` to create distribution, `twine upload dist/*` to publish to PyPI. The `src/` layout prevents accidentally importing the local source instead of the installed package during testing.",
        },
      ],
    },
    {
      id: "py-lambda-higher-order",
      title: "Lambda & Higher-Order Functions",
      explanation: `**Lambda functions** are anonymous, single-expression functions. They're useful for short callbacks and key functions but should not replace named functions for complex logic.

\`\`\`python
lambda arguments: expression
\`\`\`

**Higher-order functions** are functions that take other functions as arguments or return functions. Python has several built-in higher-order functions:

| Function | Purpose | Example |
|----------|---------|---------|
| \`map(func, iterable)\` | Apply func to each item | \`map(str, [1,2,3])\` |
| \`filter(func, iterable)\` | Keep items where func returns True | \`filter(bool, [0,1,"",3])\` |
| \`sorted(iterable, key=func)\` | Sort using func for comparison | \`sorted(words, key=len)\` |
| \`min/max(iterable, key=func)\` | Find min/max using func | \`max(users, key=lambda u: u.age)\` |
| \`reduce(func, iterable)\` | Cumulative operation | \`reduce(add, [1,2,3,4])\` |

**Important:** \`map()\` and \`filter()\` return lazy iterators (not lists). They only compute values when iterated.

**List comprehensions vs map/filter:**
In most cases, **list comprehensions are preferred** over \`map()\` and \`filter()\` in Python because they're more readable and Pythonic. Use \`map()\`/\`filter()\` when you already have a named function to apply.

**functools module** provides powerful higher-order function utilities:
- \`functools.reduce()\` — cumulative binary operations
- \`functools.partial()\` — freeze some function arguments
- \`functools.lru_cache()\` — memoization decorator
- \`functools.singledispatch()\` — function overloading by type`,
      codeExample: `# ============================================================
# Lambda functions
# ============================================================
# Basic lambda
square = lambda x: x ** 2
print(square(5))  # 25

# Multiple arguments
add = lambda a, b: a + b
print(add(3, 4))  # 7

# With default arguments
greet = lambda name, greeting="Hello": f"{greeting}, {name}!"
print(greet("Alice"))        # "Hello, Alice!"
print(greet("Bob", "Hey"))   # "Hey, Bob!"

# Conditional expression in lambda
classify = lambda x: "positive" if x > 0 else "negative" if x < 0 else "zero"
print(classify(5))    # "positive"
print(classify(-3))   # "negative"
print(classify(0))    # "zero"

# ============================================================
# map() — apply function to every item
# ============================================================
numbers = [1, 2, 3, 4, 5]

# With lambda
doubled = list(map(lambda x: x * 2, numbers))
print(doubled)  # [2, 4, 6, 8, 10]

# With named function
def celsius_to_fahrenheit(c):
    return c * 9/5 + 32

temps_c = [0, 20, 37, 100]
temps_f = list(map(celsius_to_fahrenheit, temps_c))
print(temps_f)  # [32.0, 68.0, 98.6, 212.0]

# map with multiple iterables
a = [1, 2, 3]
b = [10, 20, 30]
sums = list(map(lambda x, y: x + y, a, b))
print(sums)  # [11, 22, 33]

# Equivalent list comprehension (preferred for simple cases)
doubled_comp = [x * 2 for x in numbers]

# ============================================================
# filter() — keep items matching a condition
# ============================================================
numbers = range(-5, 6)

# Keep positive numbers
positives = list(filter(lambda x: x > 0, numbers))
print(positives)  # [1, 2, 3, 4, 5]

# Filter with None removes falsy values
mixed = [0, 1, "", "hello", None, False, True, [], [1, 2]]
truthy = list(filter(None, mixed))
print(truthy)  # [1, 'hello', True, [1, 2]]

# Equivalent comprehension (preferred)
positives_comp = [x for x in numbers if x > 0]

# ============================================================
# sorted() with key functions
# ============================================================
words = ["banana", "apple", "cherry", "date"]

# Sort by length
by_length = sorted(words, key=len)
print(by_length)  # ['date', 'apple', 'banana', 'cherry']

# Sort by last character
by_last_char = sorted(words, key=lambda w: w[-1])
print(by_last_char)  # ['banana', 'apple', 'date', 'cherry']

# Sort complex objects
users = [
    {"name": "Charlie", "age": 35},
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
]

by_age = sorted(users, key=lambda u: u["age"])
by_name = sorted(users, key=lambda u: u["name"])
print([u["name"] for u in by_age])   # ['Bob', 'Alice', 'Charlie']

# Multi-key sorting
from operator import itemgetter
data = [("Alice", 30), ("Bob", 25), ("Alice", 25)]
sorted_data = sorted(data, key=itemgetter(0, 1))  # Sort by name, then age
print(sorted_data)  # [('Alice', 25), ('Alice', 30), ('Bob', 25)]

# ============================================================
# reduce() — cumulative operation
# ============================================================
from functools import reduce

# Sum (though sum() built-in is better for this)
total = reduce(lambda acc, x: acc + x, [1, 2, 3, 4, 5])
print(total)  # 15

# Product
product = reduce(lambda acc, x: acc * x, [1, 2, 3, 4, 5])
print(product)  # 120

# Flatten nested lists
nested = [[1, 2], [3, 4], [5, 6]]
flat = reduce(lambda acc, lst: acc + lst, nested, [])
print(flat)  # [1, 2, 3, 4, 5, 6]

# Build a dict from pairs
pairs = [("a", 1), ("b", 2), ("c", 3)]
d = reduce(lambda acc, pair: {**acc, pair[0]: pair[1]}, pairs, {})
print(d)  # {'a': 1, 'b': 2, 'c': 3}

# ============================================================
# functools.partial — freeze some arguments
# ============================================================
from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(square(5))  # 25
print(cube(3))    # 27

# Practical: configure a function
import json
pretty_json = partial(json.dumps, indent=2, sort_keys=True)
print(pretty_json({"b": 2, "a": 1}))

# ============================================================
# operator module — named versions of operators
# ============================================================
from operator import add, mul, itemgetter, attrgetter

# Use instead of lambdas for simple operations
total = reduce(add, [1, 2, 3, 4, 5])    # Better than lambda a,b: a+b
product = reduce(mul, [1, 2, 3, 4, 5])

# itemgetter for dict/tuple access
get_name = itemgetter("name")
users = [{"name": "Charlie"}, {"name": "Alice"}, {"name": "Bob"}]
sorted_users = sorted(users, key=get_name)

# attrgetter for object attribute access
from collections import namedtuple
Person = namedtuple("Person", ["name", "age"])
people = [Person("Charlie", 35), Person("Alice", 30), Person("Bob", 25)]
sorted_people = sorted(people, key=attrgetter("age"))
print([p.name for p in sorted_people])  # ['Bob', 'Alice', 'Charlie']`,
      exercise: `**Exercises:**

1. Use \`map()\`, \`filter()\`, and \`reduce()\` to: take a list of strings, filter out empty ones, convert to uppercase, and concatenate with commas.

2. Sort a list of dictionaries by multiple keys: first by "department" (ascending), then by "salary" (descending). Show both lambda and \`operator.itemgetter\` approaches.

3. Implement \`my_map(func, iterable)\` and \`my_filter(func, iterable)\` using only reduce.

4. Use \`functools.partial\` to create a family of string formatting functions: \`format_currency\`, \`format_percentage\`, \`format_date\`.

5. Compare performance: write the same operation using a for loop, list comprehension, \`map()\` with lambda, and \`map()\` with named function. Time each approach for a large list.

6. Rewrite a complex reduce operation as a simple for loop. Argue which version is more readable and why.`,
      commonMistakes: [
        "Overusing lambda for complex logic. If a lambda needs multiple operations or is hard to read, use a named `def` function instead. Lambdas are for simple, one-expression operations.",
        "Forgetting that `map()` and `filter()` return iterators, not lists. Use `list(map(...))` if you need a list. Iterators can only be consumed once.",
        "Using `map(lambda x: ..., items)` when a list comprehension `[... for x in items]` would be clearer. Prefer comprehensions for simple transformations.",
        "Not knowing about `operator.itemgetter` and `operator.attrgetter` — these are faster and more readable alternatives to lambda for accessing attributes and items.",
        "Using `reduce()` for operations that have simpler alternatives: `sum()` for addition, `math.prod()` for multiplication, `''.join()` for string concatenation, `any()`/`all()` for boolean reduction.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When should you use `map()`/`filter()` vs list comprehensions in Python?",
          a: "**List comprehensions** are preferred when: 1) You need to apply a transformation AND filter (comprehension does both in one pass). 2) The operation is simple and readable inline. 3) You want Pythonic, idiomatic code. **`map()`/`filter()`** are better when: 1) You already have a named function to apply: `map(str.upper, words)` is cleaner than `[s.upper() for s in words]`. 2) You need lazy evaluation (iterators) for memory efficiency with large datasets. 3) You're doing functional programming chains. **Performance:** For simple operations, comprehensions are slightly faster than `map` with lambda, but `map` with a C-implemented function (like `str.upper`) can be faster than a comprehension.",
        },
        {
          type: "coding",
          q: "Implement `pipe` and `compose` functions for function composition.",
          a: '```python\nfrom functools import reduce\n\ndef pipe(*funcs):\n    """Left-to-right composition: pipe(f, g, h)(x) = h(g(f(x)))"""\n    return reduce(lambda f, g: lambda *a, **kw: g(f(*a, **kw)), funcs)\n\ndef compose(*funcs):\n    """Right-to-left composition: compose(f, g, h)(x) = f(g(h(x)))"""\n    return pipe(*reversed(funcs))\n\n# Usage:\nprocess = pipe(\n    str.strip,\n    str.lower,\n    lambda s: s.replace(\' \', \'_\'),\n)\nprint(process(\'  Hello World  \'))  # \'hello_world\'\n```',
        },
        {
          type: "tricky",
          q: "What is the difference between `functools.partial` and `lambda` for fixing arguments?",
          a: "`partial` and `lambda` can both fix arguments, but they differ: 1) **`partial` preserves metadata** — `partial(func, arg).__name__`, `__doc__`, `__module__` reflect the original function. Lambda shows `<lambda>`. 2) **`partial` is faster** — no Python function call overhead, it's implemented in C. 3) **`partial` supports keyword arguments** naturally and can be further customized. 4) **Lambda is more flexible** — can compute/transform arguments, not just fix them: `lambda x: func(x*2)` isn't possible with `partial` alone. 5) **`partial` is picklable** (for multiprocessing), lambdas are not. Use `partial` for fixing arguments, `lambda` for transforming them.",
        },
      ],
    },
  ],
};

export default pyPhase3;
