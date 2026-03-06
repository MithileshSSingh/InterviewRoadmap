const pyPhase1 = {
  id: "phase-1",
  title: "Phase 1: Python Fundamentals & Setup",
  emoji: "🐍",
  description:
    "Get started with Python — understand the ecosystem, set up your environment, and master variables, data types, and operators.",
  topics: [
    {
      id: "py-intro-ecosystem",
      title: "Python Ecosystem & Philosophy",
      explanation: `Python is one of the most versatile and widely-used programming languages in the world. Created by **Guido van Rossum** and first released in 1991, Python emphasizes **readability** and **simplicity** — its design philosophy is captured in "The Zen of Python" (\`import this\`).

**Why Python matters:**
- **#1 language** on TIOBE and Stack Overflow surveys for general-purpose programming
- Powers backends at **Instagram, Spotify, Netflix, Dropbox, Reddit**
- Dominates **data science, machine learning, and AI** (NumPy, pandas, TensorFlow, PyTorch)
- Strong in **DevOps & automation** (Ansible, SaltStack, scripting)
- Used in **web development** (Django, Flask, FastAPI)

**Python implementations:**

| Implementation | Description | Use Case |
|---------------|-------------|----------|
| **CPython** | Reference implementation in C | Default, most libraries target this |
| **PyPy** | JIT-compiled Python | 4-10x faster for long-running programs |
| **Jython** | Python on JVM | Java interop |
| **MicroPython** | Python for microcontrollers | IoT, embedded systems |

**Python 2 vs Python 3:** Python 2 reached end-of-life on January 1, 2020. **Always use Python 3** (3.10+ recommended for modern features like structural pattern matching).

**The Zen of Python (key principles):**
- Beautiful is better than ugly
- Explicit is better than implicit
- Simple is better than complex
- Readability counts
- There should be one — and preferably only one — obvious way to do it

These principles guide everything from variable naming to architecture. Python's "batteries included" standard library means you often don't need third-party packages for common tasks.`,
      codeExample: `# The Zen of Python — run this in any Python interpreter
import this

# Python version check
import sys
print(f"Python version: {sys.version}")
print(f"Version info: {sys.version_info}")

# Platform information
import platform
print(f"Platform: {platform.platform()}")
print(f"Implementation: {platform.python_implementation()}")

# ============================================================
# Python's "batteries included" standard library
# ============================================================

# Working with dates — no pip install needed
from datetime import datetime, timedelta
now = datetime.now()
print(f"Current time: {now}")
print(f"Tomorrow: {now + timedelta(days=1)}")

# Working with JSON — built-in
import json
data = {"name": "Alice", "age": 30, "skills": ["Python", "SQL"]}
json_string = json.dumps(data, indent=2)
print(json_string)

# Working with paths — modern pathlib
from pathlib import Path
home = Path.home()
print(f"Home directory: {home}")
print(f"Current directory files: {list(Path('.').glob('*.py'))}")

# Working with collections — enhanced data structures
from collections import Counter, defaultdict
words = ["python", "java", "python", "go", "python", "java"]
word_counts = Counter(words)
print(f"Word counts: {word_counts}")
print(f"Most common: {word_counts.most_common(2)}")

# Working with HTTP — built-in
from urllib.request import urlopen
# response = urlopen("https://api.github.com")  # uncomment to test

# ============================================================
# Python Enhancement Proposals (PEPs)
# ============================================================
# PEP 8   — Style Guide (the law of Python formatting)
# PEP 20  — The Zen of Python
# PEP 257  — Docstring Conventions
# PEP 484  — Type Hints
# PEP 3107 — Function Annotations

# ============================================================
# Python's dynamic typing in action
# ============================================================
x = 42          # int
print(type(x))  # <class 'int'>

x = "hello"     # now it's a str — no error!
print(type(x))  # <class 'str'>

x = [1, 2, 3]   # now it's a list
print(type(x))  # <class 'list'>

# Everything in Python is an object
print(isinstance(42, object))       # True
print(isinstance("hello", object))  # True
print(isinstance(None, object))     # True`,
      exercise: `**Exercises:**

1. Run \`import this\` in a Python REPL and read through all 19 aphorisms. Pick your top 3 and explain why they matter.

2. Write a script that prints your Python version, implementation, and platform information using the \`sys\` and \`platform\` modules.

3. Explore the standard library: use \`collections.Counter\` to count character frequencies in a sentence, then display the top 5 most common characters.

4. Use \`pathlib.Path\` to list all files in your home directory that were modified in the last 24 hours.

5. Research and compare CPython vs PyPy. Write a simple loop that sums numbers from 1 to 10,000,000 and time it using \`time.perf_counter()\`. Which implementation would be faster and why?

6. Read PEP 8 (https://peps.python.org/pep-0008/) and list 5 naming conventions that differ from other languages you know.`,
      commonMistakes: [
        "Using Python 2 syntax (print statements without parentheses, integer division with `/`). Always use Python 3.10+.",
        "Not understanding that Python is dynamically typed but strongly typed — `'3' + 4` raises TypeError, unlike JavaScript which would concatenate.",
        "Assuming Python is slow for everything. Python is slow for CPU-bound loops, but most real-world apps are I/O-bound where Python's speed is irrelevant. Use NumPy/C extensions for compute-heavy work.",
        "Not using the standard library before reaching for pip packages. Check `collections`, `itertools`, `functools`, `pathlib`, `json`, `csv`, `datetime` first.",
        "Ignoring The Zen of Python's principles — writing overly clever one-liners when readable code is preferred.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between CPython and Python? Is Python interpreted or compiled?",
          a: "**CPython** is the reference implementation of Python, written in C. 'Python' is the language specification. CPython is technically both compiled and interpreted: source code is first **compiled to bytecode** (.pyc files), then the bytecode is **interpreted** by the CPython virtual machine. PyPy uses JIT compilation for better performance. Other implementations like Jython compile to JVM bytecode.",
        },
        {
          type: "conceptual",
          q: "What does 'dynamically typed but strongly typed' mean in Python?",
          a: "**Dynamically typed** means variables don't have fixed types — `x = 5` then `x = 'hello'` is valid. Type checking happens at **runtime**, not compile time. **Strongly typed** means Python doesn't implicitly convert between unrelated types — `'3' + 4` raises `TypeError` (unlike JavaScript where it would give `'34'`). You must explicitly convert: `int('3') + 4` or `'3' + str(4)`.",
        },
        {
          type: "tricky",
          q: "What happens when you run a Python script? Walk through the execution process.",
          a: "1. The **lexer** tokenizes the source code. 2. The **parser** builds an Abstract Syntax Tree (AST). 3. The **compiler** compiles the AST to **bytecode** (stored in `__pycache__/` as `.pyc` files). 4. The **Python Virtual Machine (PVM)** executes the bytecode instruction by instruction. For imported modules, Python checks if a cached `.pyc` exists and is up-to-date before recompiling. You can inspect bytecode with `dis.dis(function)`.",
        },
        {
          type: "scenario",
          q: "Your team is starting a new project and debating between Python and Go. What factors would you consider?",
          a: "**Choose Python when:** rapid prototyping matters, data science/ML is involved, team expertise is in Python, I/O-bound workload, rich ecosystem needed (web frameworks, data tools). **Choose Go when:** high-concurrency microservices, CPU-bound performance is critical, deployment simplicity matters (single binary), strong typing is required from day one. **Key tradeoff:** Python offers faster development speed and richer libraries; Go offers better runtime performance and built-in concurrency. Many companies use both — Python for data pipelines and Go for high-throughput services.",
        },
      ],
    },
    {
      id: "py-installation-setup",
      title: "Installation & Environment Setup",
      explanation: `Setting up Python correctly is crucial for avoiding dependency conflicts and ensuring reproducible environments. The most common pain point for beginners is **dependency management** — different projects need different package versions.

**Installing Python:**

| Method | Platform | Notes |
|--------|----------|-------|
| python.org installer | All | Official, simple |
| **pyenv** | macOS/Linux | Manage multiple Python versions |
| Homebrew | macOS | \`brew install python\` |
| Microsoft Store | Windows | Convenient but limited |
| deadsnakes PPA | Ubuntu | Latest Python versions |

**Virtual Environments** are isolated Python installations that prevent package conflicts between projects. Think of them as separate "sandboxes" for each project.

**Tools for virtual environments:**

| Tool | Command | Best For |
|------|---------|----------|
| **venv** | \`python -m venv .venv\` | Built-in, simple projects |
| **virtualenv** | \`virtualenv .venv\` | More features than venv |
| **conda** | \`conda create -n myenv\` | Data science, non-Python deps |
| **Poetry** | \`poetry init\` | Modern dependency management |
| **uv** | \`uv venv\` | Fast Rust-based tool (2024+) |

**Package management:**
- **pip** — default package installer (\`pip install package\`)
- **pip-tools** — pin exact versions (\`pip-compile requirements.in\`)
- **Poetry** — dependency resolution + packaging (\`poetry add package\`)
- **uv** — drop-in pip replacement, 10-100x faster

**IDE recommendations:**
- **VS Code** with Python extension — most popular, free, great debugging
- **PyCharm** — full-featured Python IDE, excellent refactoring
- **Jupyter Notebook/Lab** — interactive computing, data science`,
      codeExample: `# ============================================================
# Setting up Python with pyenv (macOS/Linux)
# ============================================================

# Install pyenv
# macOS: brew install pyenv
# Linux: curl https://pyenv.run | bash

# List available Python versions
# pyenv install --list | grep "3.12"

# Install a specific version
# pyenv install 3.12.1

# Set global default
# pyenv global 3.12.1

# Set local version for a project
# pyenv local 3.11.7

# ============================================================
# Virtual Environments with venv (built-in)
# ============================================================

# Create a virtual environment
# python -m venv .venv

# Activate it
# macOS/Linux:  source .venv/bin/activate
# Windows:      .venv\\Scripts\\activate

# Your prompt changes to show the active env:
# (.venv) $ python --version

# Install packages in the virtual environment
# pip install requests flask

# Save dependencies
# pip freeze > requirements.txt

# Install from requirements file
# pip install -r requirements.txt

# Deactivate when done
# deactivate

# ============================================================
# Modern setup with uv (recommended for 2024+)
# ============================================================

# Install uv
# curl -LsSf https://astral.sh/uv/install.sh | sh

# Create project with uv
# uv init my-project
# cd my-project

# Add dependencies
# uv add requests flask sqlalchemy

# Run scripts
# uv run python main.py

# ============================================================
# Project structure best practice
# ============================================================

# my-project/
# ├── .venv/                 # Virtual environment (git-ignored)
# ├── src/
# │   └── my_project/
# │       ├── __init__.py
# │       ├── main.py
# │       └── utils.py
# ├── tests/
# │   ├── __init__.py
# │   └── test_main.py
# ├── pyproject.toml          # Project metadata & dependencies
# ├── requirements.txt        # Pinned dependencies (if using pip)
# ├── .gitignore
# └── README.md

# ============================================================
# pyproject.toml example (modern Python packaging)
# ============================================================

# [project]
# name = "my-project"
# version = "0.1.0"
# description = "My awesome Python project"
# requires-python = ">=3.10"
# dependencies = [
#     "requests>=2.31.0",
#     "flask>=3.0.0",
# ]
#
# [project.optional-dependencies]
# dev = [
#     "pytest>=7.0",
#     "ruff>=0.1.0",
#     "mypy>=1.0",
# ]

# ============================================================
# .gitignore essentials for Python
# ============================================================
# .venv/
# __pycache__/
# *.pyc
# .env
# *.egg-info/
# dist/
# build/
# .mypy_cache/
# .pytest_cache/`,
      exercise: `**Exercises:**

1. Install Python 3.12+ using pyenv (or your platform's preferred method). Verify with \`python --version\`.

2. Create a new project directory with a virtual environment using \`python -m venv .venv\`. Activate it, install \`requests\` and \`rich\`, then freeze dependencies to \`requirements.txt\`.

3. Write a \`pyproject.toml\` for a sample project with at least 3 dependencies and separate dev dependencies.

4. Try \`uv\`: install it, create a new project with \`uv init\`, add a dependency, and run a simple script.

5. Set up VS Code for Python: install the Python extension, configure the interpreter to your venv, and verify that linting and IntelliSense work.

6. Create a proper \`.gitignore\` for a Python project. Explain why each entry is important.`,
      commonMistakes: [
        "Installing packages globally with `pip install` instead of using a virtual environment. This leads to version conflicts between projects.",
        "Forgetting to activate the virtual environment before installing packages — packages end up in the global Python instead of the project's `.venv`.",
        "Committing `.venv/` or `__pycache__/` to git. These should always be in `.gitignore`.",
        "Using `pip freeze > requirements.txt` without a virtual environment — it dumps ALL globally installed packages, not just project dependencies.",
        "Not pinning dependency versions. `requests` today might be 2.31, but `requests` tomorrow might break your code. Use `==` or `>=,<` version specifiers.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is a virtual environment and why is it important?",
          a: "A virtual environment is an **isolated Python installation** with its own packages, independent of the system Python and other projects. It's important because: 1) **Prevents dependency conflicts** — Project A needs `requests==2.28` while Project B needs `requests==2.31`. 2) **Reproducibility** — `requirements.txt` or `pyproject.toml` captures exact versions. 3) **Clean system** — no pollution of the global Python installation. Under the hood, it creates a directory with its own `bin/python` and `lib/site-packages`, and modifies `PATH` so that `python` and `pip` point to the venv copies.",
        },
        {
          type: "scenario",
          q: "A teammate clones your repository and says 'pip install -r requirements.txt fails'. What would you check?",
          a: "1. **Python version mismatch** — check `python --version` matches what the project requires (specified in `pyproject.toml`). 2. **Virtual environment not activated** — they may be installing into the system Python which may lack permissions. 3. **OS-specific packages** — some packages have different names on Linux vs macOS vs Windows. 4. **Missing system dependencies** — packages like `psycopg2` need `libpq-dev`, `Pillow` needs image libraries. 5. **Outdated pip** — `pip install --upgrade pip` before installing requirements. 6. **requirements.txt has platform-specific pins** — consider using `pyproject.toml` with flexible version ranges instead.",
        },
        {
          type: "conceptual",
          q: "Compare pip, Poetry, and uv. When would you use each?",
          a: "**pip** — built-in, simple, works everywhere. Use for small projects or when simplicity matters. Downside: no dependency resolution, manual `requirements.txt` management. **Poetry** — full dependency management with lock files, virtual env management, packaging, and publishing. Use for libraries and complex projects. Downside: slower resolution, heavier tooling. **uv** — Rust-based pip replacement (2024+), 10-100x faster than pip, compatible with `requirements.txt` and `pyproject.toml`. Use when speed matters (CI/CD, large dependency trees). It's becoming the modern standard for Python package management.",
        },
      ],
    },
    {
      id: "py-variables-data-types",
      title: "Variables & Data Types",
      explanation: `In Python, **everything is an object**. Variables are simply **names that reference objects** in memory — they don't "contain" values like boxes; they're more like **labels** or **sticky notes** pointing to objects.

**Variable assignment:**
\`\`\`python
x = 42        # x points to an int object with value 42
y = x         # y points to the SAME object (not a copy)
x = "hello"   # x now points to a new str object; y still points to 42
\`\`\`

**Naming conventions (PEP 8):**

| Style | Used For | Example |
|-------|----------|---------|
| \`snake_case\` | Variables, functions, methods | \`user_name\`, \`get_total()\` |
| \`PascalCase\` | Classes | \`UserProfile\`, \`HttpClient\` |
| \`UPPER_SNAKE\` | Constants | \`MAX_RETRIES\`, \`API_KEY\` |
| \`_leading_underscore\` | Internal/private | \`_helper()\`, \`_cache\` |
| \`__dunder__\` | Magic methods | \`__init__\`, \`__str__\` |

**Built-in data types:**

| Type | Category | Example | Mutable? |
|------|----------|---------|----------|
| \`int\` | Numeric | \`42\`, \`0xFF\`, \`1_000_000\` | No |
| \`float\` | Numeric | \`3.14\`, \`1e-5\`, \`float('inf')\` | No |
| \`complex\` | Numeric | \`3+4j\` | No |
| \`bool\` | Boolean | \`True\`, \`False\` | No |
| \`str\` | Text | \`"hello"\`, \`'world'\` | No |
| \`NoneType\` | Null | \`None\` | No |
| \`list\` | Sequence | \`[1, 2, 3]\` | **Yes** |
| \`tuple\` | Sequence | \`(1, 2, 3)\` | No |
| \`dict\` | Mapping | \`{"a": 1}\` | **Yes** |
| \`set\` | Set | \`{1, 2, 3}\` | **Yes** |

**Mutability** is a critical concept: immutable objects (int, str, tuple) cannot be changed after creation. Mutable objects (list, dict, set) can be modified in-place.`,
      codeExample: `# ============================================================
# Variables are references (labels), not boxes
# ============================================================
a = [1, 2, 3]
b = a           # b points to the SAME list object
b.append(4)
print(a)        # [1, 2, 3, 4] — a is also modified!
print(a is b)   # True — same object in memory
print(id(a), id(b))  # Same memory address

# To make a copy:
c = a.copy()    # Shallow copy — new list, same elements
c.append(5)
print(a)        # [1, 2, 3, 4] — a is NOT affected
print(a is c)   # False — different objects

# ============================================================
# Numeric types
# ============================================================
# Integers have unlimited precision in Python!
big_num = 10 ** 100  # No overflow!
print(big_num)       # A googol

# Readable large numbers with underscores
population = 7_900_000_000
budget = 1_500_000.50

# Different bases
hex_val = 0xFF      # 255 in hexadecimal
oct_val = 0o77      # 63 in octal
bin_val = 0b1010    # 10 in binary

# Float precision gotcha
print(0.1 + 0.2)           # 0.30000000000000004
print(0.1 + 0.2 == 0.3)    # False!

# Use decimal for financial calculations
from decimal import Decimal
print(Decimal('0.1') + Decimal('0.2'))  # 0.3 (exact)
print(Decimal('0.1') + Decimal('0.2') == Decimal('0.3'))  # True

# ============================================================
# Boolean values and truthiness
# ============================================================
# False values (falsy):
print(bool(0))          # False
print(bool(0.0))        # False
print(bool(""))         # False
print(bool([]))         # False
print(bool({}))         # False
print(bool(None))       # False

# Everything else is truthy:
print(bool(1))          # True
print(bool(-1))         # True — any non-zero number
print(bool("hello"))    # True — any non-empty string
print(bool([0]))        # True — non-empty list (even if contains falsy)

# ============================================================
# String types
# ============================================================
single = 'hello'
double = "hello"
triple = """Multi-line
string that preserves
line breaks"""

# f-strings (Python 3.6+) — the preferred way to format strings
name = "Alice"
age = 30
print(f"Name: {name}, Age: {age}")
print(f"Next year: {age + 1}")          # Expressions in f-strings
print(f"Name uppercase: {name.upper()}")  # Method calls
print(f"{42:08b}")                        # Format spec: binary with padding

# Raw strings — no escape processing
path = r"C:\\Users\\alice\\docs"  # Backslashes are literal
print(path)  # C:\\Users\\alice\\docs

# ============================================================
# None — Python's null
# ============================================================
result = None
print(result is None)       # True — always use 'is' for None checks
print(result is not None)   # False
print(type(result))         # <class 'NoneType'>

# BAD: if result == None  (works but not Pythonic)
# GOOD: if result is None (identity check, faster and correct)

# ============================================================
# Type checking and conversion
# ============================================================
x = "42"
print(type(x))          # <class 'str'>
print(isinstance(x, str))  # True

# Type conversion
num = int("42")          # str -> int
flt = float("3.14")     # str -> float
s = str(42)              # int -> str
b = bool(1)              # int -> bool

# Multiple assignment
a, b, c = 1, 2, 3
x = y = z = 0            # All point to same object

# Swap variables (Pythonic way)
a, b = b, a              # No temp variable needed!`,
      exercise: `**Exercises:**

1. Create variables of every built-in type (int, float, complex, bool, str, None, list, tuple, dict, set). Print each with \`type()\` and \`id()\`.

2. Demonstrate the difference between mutable and immutable types: create a list and a tuple, try to modify both, and explain the behavior.

3. Write code that shows the "variable as label" concept: assign a list to two variables, modify through one, and show the effect on the other. Then show how to properly copy.

4. Explore float precision: demonstrate why \`0.1 + 0.2 != 0.3\` and show two different ways to handle this (using \`decimal.Decimal\` and \`math.isclose\`).

5. Write a function \`describe_value(x)\` that prints the type, truthiness (\`bool(x)\`), and whether it's mutable or immutable for any given value.

6. Practice f-string formatting: display a number as currency (\`$1,234.56\`), as a percentage (\`85.5%\`), in scientific notation, and right-aligned in a 20-character field.`,
      commonMistakes: [
        "Using `==` instead of `is` to check for `None`. Always use `x is None` or `x is not None` — it's faster and semantically correct (identity vs equality).",
        "Forgetting that `0.1 + 0.2 != 0.3` due to floating-point representation. Use `decimal.Decimal` for financial calculations or `math.isclose()` for comparisons.",
        "Thinking `a = b` copies the value for mutable types. It creates another reference to the same object. Use `.copy()`, `list()`, or `copy.deepcopy()` for actual copies.",
        "Using mutable default arguments in functions: `def f(x=[])` — the default list is shared across all calls. Use `def f(x=None): x = x or []` instead.",
        "Not knowing about Python's integer caching: `a = 256; b = 256; a is b` is True (cached), but `a = 257; b = 257; a is b` may be False (not cached). Always use `==` for value comparison.",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What is the output? `a = [1, 2, 3]; b = a; b += [4]; print(a)` vs `a = (1, 2, 3); b = a; b += (4,); print(a)`",
          a: "For the **list**: `a` prints `[1, 2, 3, 4]` because `b += [4]` calls `list.__iadd__` which modifies the list **in-place**, and `b` references the same object as `a`. For the **tuple**: `a` prints `(1, 2, 3)` because tuples are immutable — `b += (4,)` creates a **new tuple** and rebinds `b` to it, leaving `a` unchanged. This is a key difference between mutable (`+=` modifies in-place) and immutable (`+=` creates new object) types.",
        },
        {
          type: "conceptual",
          q: "Explain Python's memory model. What are `id()`, `is`, and `==`?",
          a: "`id(obj)` returns the **memory address** (identity) of an object. `is` checks **identity** — whether two variables point to the same object (`id(a) == id(b)`). `==` checks **equality** — whether two objects have the same value (calls `__eq__`). Example: `a = [1, 2]; b = [1, 2]; a == b` is `True` (same value) but `a is b` is `False` (different objects). CPython caches small integers (-5 to 256) and interned strings, so `a = 5; b = 5; a is b` is `True` because they reference the same cached object.",
        },
        {
          type: "coding",
          q: "Write a function that determines if a value is mutable or immutable without modifying it.",
          a: '```python\ndef is_mutable(obj):\n    """Check if an object is mutable by checking its type."""\n    immutable_types = (int, float, complex, bool, str, bytes, tuple, frozenset, type(None))\n    return not isinstance(obj, immutable_types)\n\n# Alternative: check if it has __hash__ (most immutable types are hashable)\ndef is_mutable_v2(obj):\n    try:\n        hash(obj)\n        return False  # Hashable objects are typically immutable\n    except TypeError:\n        return True   # Unhashable objects are typically mutable\n```\nNote: The hash-based approach isn\'t perfect (user-defined classes are hashable but mutable by default), but it works for built-in types.',
        },
      ],
    },
    {
      id: "py-operators-expressions",
      title: "Operators & Expressions",
      explanation: `Python provides a rich set of operators that work intuitively with its data types. Understanding operators deeply — especially **truthiness**, **short-circuit evaluation**, and **operator overloading** — is essential for writing Pythonic code.

**Arithmetic operators:**

| Operator | Description | Example | Result |
|----------|-------------|---------|--------|
| \`+\` | Addition | \`7 + 3\` | \`10\` |
| \`-\` | Subtraction | \`7 - 3\` | \`4\` |
| \`*\` | Multiplication | \`7 * 3\` | \`21\` |
| \`/\` | True division | \`7 / 3\` | \`2.333...\` |
| \`//\` | Floor division | \`7 // 3\` | \`2\` |
| \`%\` | Modulus | \`7 % 3\` | \`1\` |
| \`**\` | Exponentiation | \`2 ** 10\` | \`1024\` |

**Comparison operators** return \`bool\` and support **chaining**:
\`\`\`python
# Chained comparisons — unique to Python!
0 < x < 100        # Same as: 0 < x and x < 100
a == b == c         # All three are equal
1 <= grade <= 5     # Range check in one expression
\`\`\`

**Logical operators** use English words, not symbols:
- \`and\` — returns first falsy value, or last value if all truthy
- \`or\` — returns first truthy value, or last value if all falsy
- \`not\` — boolean negation

**The walrus operator \`:=\`** (Python 3.8+) assigns and returns a value in one expression — useful in while loops and comprehensions.

**Identity vs equality:**
- \`is\` / \`is not\` — checks if two references point to the **same object**
- \`==\` / \`!=\` — checks if two objects have the **same value**

**Membership operators:**
- \`in\` / \`not in\` — checks if a value exists in a sequence or collection`,
      codeExample: `# ============================================================
# Arithmetic operators
# ============================================================
print(7 / 3)    # 2.3333... (true division — always returns float)
print(7 // 3)   # 2 (floor division — rounds toward negative infinity)
print(-7 // 3)  # -3 (NOT -2! Rounds toward negative infinity)
print(7 % 3)    # 1 (modulus)
print(-7 % 3)   # 2 (Python's modulus always returns non-negative for positive divisor)

# Exponentiation
print(2 ** 10)       # 1024
print(16 ** 0.5)     # 4.0 (square root)
print(pow(2, 10))    # 1024 (built-in function)
print(pow(2, 10, 1000))  # 24 (modular exponentiation: 2^10 % 1000)

# ============================================================
# Comparison chaining (Pythonic!)
# ============================================================
age = 25

# BAD (other languages style):
if age >= 18 and age <= 65:
    print("Working age")

# GOOD (Pythonic):
if 18 <= age <= 65:
    print("Working age")

# Multiple chaining
x = 5
print(1 < x < 10)        # True
print(1 < x < 10 < 100)  # True (all comparisons must be true)

# ============================================================
# Logical operators: and, or, not
# ============================================================
# 'and' returns first falsy value, or last value if all truthy
print(1 and 2 and 3)    # 3 (all truthy, returns last)
print(1 and 0 and 3)    # 0 (first falsy value)
print(1 and "" and 3)   # "" (first falsy value)

# 'or' returns first truthy value, or last value if all falsy
print(0 or "" or 3)     # 3 (first truthy value)
print(0 or "" or [])    # [] (all falsy, returns last)

# Practical use: default values
name = ""
display_name = name or "Anonymous"  # "Anonymous"
print(display_name)

# Short-circuit evaluation
# 'and' stops at first falsy — right side not evaluated
x = 0
result = x != 0 and 10 / x  # 10/x never executes (no ZeroDivisionError)
print(result)  # False

# ============================================================
# Walrus operator := (Python 3.8+)
# ============================================================
# Without walrus — compute twice or use temp variable
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# BAD: compute len() twice
# if len(data) > 5:
#     print(f"List has {len(data)} items")

# GOOD: compute once with walrus
if (n := len(data)) > 5:
    print(f"List has {n} items")

# In while loops — read and check in one line
import io
buffer = io.StringIO("line1\\nline2\\nline3\\n")
while (line := buffer.readline()):
    print(f"Read: {line.strip()}")

# In list comprehensions — filter and transform
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
results = [y for x in numbers if (y := x ** 2) > 20]
print(results)  # [25, 36, 49, 64, 81, 100]

# ============================================================
# Membership and identity operators
# ============================================================
fruits = ["apple", "banana", "cherry"]
print("banana" in fruits)       # True
print("grape" not in fruits)    # True

# 'in' works with strings too
print("hell" in "hello world")  # True

# 'in' with dictionaries checks keys (not values)
user = {"name": "Alice", "age": 30}
print("name" in user)    # True (checks keys)
print("Alice" in user)   # False (not a key)

# Identity checks
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)     # True (same value)
print(a is b)     # False (different objects)

c = a
print(a is c)     # True (same object)

# ============================================================
# Bitwise operators
# ============================================================
a, b = 0b1010, 0b1100  # 10, 12

print(f"a & b  = {a & b:04b}")   # 1000 (AND)
print(f"a | b  = {a | b:04b}")   # 1110 (OR)
print(f"a ^ b  = {a ^ b:04b}")   # 0110 (XOR)
print(f"~a     = {~a}")           # -11 (NOT — two's complement)
print(f"a << 2 = {a << 2}")       # 40 (left shift)
print(f"a >> 1 = {a >> 1}")       # 5 (right shift)

# Practical: using sets with bitwise operators
set_a = {1, 2, 3, 4}
set_b = {3, 4, 5, 6}
print(set_a & set_b)    # {3, 4} — intersection
print(set_a | set_b)    # {1, 2, 3, 4, 5, 6} — union
print(set_a ^ set_b)    # {1, 2, 5, 6} — symmetric difference
print(set_a - set_b)    # {1, 2} — difference`,
      exercise: `**Exercises:**

1. Predict the output without running: \`print(3 or 5)\`, \`print(0 and 5)\`, \`print("" or "hello" or "world")\`, \`print(1 and 2 and 3 and 0 and 5)\`. Then verify.

2. Rewrite these conditions using comparison chaining:
   - \`if x >= 0 and x <= 100\`
   - \`if a > b and b > c and c > d\`
   - \`if grade >= 90 and grade <= 100\`

3. Use the walrus operator to simplify: read lines from a string using \`io.StringIO\`, process only lines longer than 5 characters, and collect the processed results.

4. Write a function that takes a dictionary and a key, and returns the value if it exists and is not empty, otherwise returns a default. Use short-circuit evaluation with \`or\`.

5. Demonstrate all set operations using bitwise operators (\`&\`, \`|\`, \`^\`, \`-\`). Create two sets and show intersection, union, symmetric difference, and difference.

6. Explain the difference between \`/\` and \`//\` with negative numbers. What is \`-7 // 2\` and why?`,
      commonMistakes: [
        "Confusing `/` (true division, returns float) with `//` (floor division). In Python 3, `7 / 2` is `3.5`, not `3`. Floor division `//` rounds toward negative infinity, so `-7 // 2` is `-4`, not `-3`.",
        "Using `or` for default values without understanding falsy values: `count = user_count or 10` will replace `0` with `10`, which may not be intended. Use `count = user_count if user_count is not None else 10` for None-only checks.",
        "Not understanding short-circuit evaluation — `x and expensive_function()` won't call the function if `x` is falsy. This is a feature, not a bug, and is commonly used for guard clauses.",
        "Using `is` instead of `==` for value comparison. `a is b` checks identity (same object), not equality. Only use `is` for `None`, `True`, `False`, and sentinel objects.",
        "Overusing the walrus operator — it can reduce readability when used in complex expressions. Use it for simple cases like `while (line := f.readline())` and `if (m := re.match(...)):`. Don't nest walrus operators.",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What does `print(1 or 2 and 3)` output? Explain operator precedence.",
          a: "`and` has **higher precedence** than `or`, so the expression is parsed as `1 or (2 and 3)`. `2 and 3` evaluates to `3` (both truthy, returns last). Then `1 or 3` evaluates to `1` (first truthy value). So the output is `1`. Precedence order: `not` > `and` > `or`. This is why parentheses are recommended for complex boolean expressions.",
        },
        {
          type: "tricky",
          q: "What is the difference between `a = a + b` and `a += b` for lists?",
          a: "`a = a + b` creates a **new list** and rebinds `a` to it. The original list is unchanged if other variables reference it. `a += b` calls `list.__iadd__` which **modifies the list in-place** and returns self. If another variable `c` references the same list as `a`, `a += b` will affect `c` too, but `a = a + b` will not. For immutable types like tuples and strings, both create new objects since in-place modification isn't possible.",
        },
        {
          type: "coding",
          q: "Write a one-liner that assigns the first non-empty string from a list, or 'default' if all are empty.",
          a: "```python\nvalues = ['', '', 'hello', 'world']\nresult = next((v for v in values if v), 'default')\nprint(result)  # 'hello'\n```\nThis uses a **generator expression** with `next()` and a default value. The generator lazily iterates and `if v` filters out empty strings (falsy). `next()` returns the first match or 'default' if the generator is exhausted. This is more efficient than `[v for v in values if v][0]` because it stops at the first match.",
        },
        {
          type: "conceptual",
          q: "Explain the walrus operator and give a practical use case.",
          a: "The **walrus operator** (`:=`, formally 'assignment expression', PEP 572, Python 3.8+) assigns a value to a variable **as part of an expression**. Unlike `=`, it can be used inside `if`, `while`, comprehensions, and function arguments. **Practical use case — avoid redundant computation:**\n```python\n# Without walrus: compute len() twice\nif len(data) > 10:\n    print(f'Too many: {len(data)}')\n\n# With walrus: compute once\nif (n := len(data)) > 10:\n    print(f'Too many: {n}')\n```\nIt's especially useful in `while` loops: `while (chunk := file.read(8192)):` reads and checks in one line.",
        },
      ],
    },
  ],
};

export default pyPhase1;
