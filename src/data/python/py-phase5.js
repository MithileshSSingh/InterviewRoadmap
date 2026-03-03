const pyPhase5 = {
  id: "phase-5",
  title: "Phase 5: Error Handling & File I/O",
  emoji: "⚠️",
  description:
    "Master Python's exception hierarchy, defensive error handling patterns, file operations with context managers, data serialization formats, and production logging strategies.",
  topics: [
    {
      id: "py-exceptions",
      title: "Exceptions: try/except/else/finally & Custom Exceptions",
      explanation: `Python uses an **exception-based** error handling model rather than error codes. Every exception is an instance of a class that inherits from \`BaseException\`, with most user-facing exceptions inheriting from \`Exception\`. Understanding the full \`try/except/else/finally\` control flow and knowing how to write custom exception hierarchies is critical for building robust, maintainable systems.

**The full try block anatomy:**
\`\`\`python
try:
    result = risky_operation()    # Code that might raise
except SpecificError as e:       # Catch specific exception
    handle_error(e)
except (TypeError, ValueError):  # Catch multiple types
    handle_multiple()
else:                            # Runs ONLY if no exception was raised
    process(result)
finally:                         # ALWAYS runs — cleanup code
    release_resources()
\`\`\`

**Key principles:**
- **Catch specific exceptions** — never use bare \`except:\` or \`except Exception:\` unless you re-raise. Bare excepts swallow \`KeyboardInterrupt\` and \`SystemExit\`.
- **EAFP over LBYL** — "Easier to Ask Forgiveness than Permission" is Pythonic. Use \`try/except\` rather than checking conditions first (\`if key in dict\` vs \`try: dict[key]\`).
- **Exception chaining** — Python 3 automatically chains exceptions (\`__cause__\` via \`raise X from Y\`, \`__context__\` for implicit chaining). This preserves the full error trail.
- **\`ExceptionGroup\` (3.11+)** — allows raising and catching multiple unrelated exceptions simultaneously using \`except*\` syntax, essential for concurrent/async error handling.

| Pattern | Use Case |
|---------|----------|
| \`raise ValueError("msg")\` | Signal invalid input |
| \`raise from original\` | Explicit chaining — set \`__cause__\` |
| \`raise from None\` | Suppress chaining — hide original traceback |
| \`except* TypeError\` | Catch one type from an ExceptionGroup |

Custom exceptions should form a hierarchy rooted at a **module-level base exception**, letting callers catch broad or narrow categories as needed.`,
      codeExample: `# ============================================================
# Full try/except/else/finally control flow
# ============================================================
def divide(a, b):
    """Demonstrate every clause of try/except/else/finally."""
    try:
        result = a / b
    except ZeroDivisionError:
        print("Cannot divide by zero")
        return None
    except TypeError as e:
        print(f"Type error: {e}")
        return None
    else:
        # Runs ONLY when no exception was raised
        # Put success-path logic here, NOT in the try block
        print(f"Division successful: {a} / {b} = {result}")
        return result
    finally:
        # ALWAYS runs — even if return/break/continue was hit above
        # Use for cleanup: closing files, releasing locks, etc.
        print("Division operation completed (finally block)")

divide(10, 3)    # Success path → else → finally
divide(10, 0)    # ZeroDivisionError → except → finally
divide("a", 2)   # TypeError → except → finally


# ============================================================
# BAD: Common anti-patterns
# ============================================================
# BAD — bare except swallows KeyboardInterrupt, SystemExit
# try:
#     do_something()
# except:          # NEVER do this
#     pass

# BAD — too broad, hides bugs
# try:
#     user = get_user(user_id)
#     send_email(user.email)
# except Exception:
#     print("Something went wrong")  # Which line failed? We'll never know

# BAD — using exceptions for normal control flow
# try:
#     value = my_list[999]
# except IndexError:
#     value = "default"  # Use: value = my_list[999] if len(my_list) > 999 else "default"


# ============================================================
# GOOD: Specific, informative exception handling
# ============================================================
import json
from pathlib import Path

def load_config(filepath: str) -> dict:
    """Load and validate a JSON configuration file."""
    path = Path(filepath)

    try:
        raw_text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Config file not found: {path.resolve()}. "
            f"Create it from config.example.json"
        )
    except PermissionError:
        raise PermissionError(
            f"Cannot read config file: {path.resolve()}. "
            f"Check file permissions (current: {oct(path.stat().st_mode)})"
        )

    try:
        config = json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Invalid JSON in {filepath} at line {e.lineno}, "
            f"column {e.colno}: {e.msg}"
        ) from e  # Chain to preserve original error

    # Validate required keys
    required = {"database_url", "secret_key", "debug"}
    missing = required - config.keys()
    if missing:
        raise KeyError(f"Missing required config keys: {missing}")

    return config


# ============================================================
# Custom exception hierarchy — production pattern
# ============================================================
class AppError(Exception):
    """Base exception for the entire application.
    All custom exceptions inherit from this, so callers can
    catch AppError to handle any app-specific error."""

    def __init__(self, message: str, code: str = "UNKNOWN", details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}

    def to_dict(self) -> dict:
        """Serialize for API error responses."""
        return {
            "error": self.code,
            "message": str(self),
            "details": self.details,
        }


class ValidationError(AppError):
    """Invalid input data."""

    def __init__(self, field: str, message: str, value=None):
        super().__init__(
            message=f"Validation failed for '{field}': {message}",
            code="VALIDATION_ERROR",
            details={"field": field, "rejected_value": repr(value)},
        )
        self.field = field


class NotFoundError(AppError):
    """Resource not found."""

    def __init__(self, resource: str, identifier):
        super().__init__(
            message=f"{resource} with id '{identifier}' not found",
            code="NOT_FOUND",
            details={"resource": resource, "id": identifier},
        )


class AuthenticationError(AppError):
    """Authentication failure."""

    def __init__(self, reason: str = "Invalid credentials"):
        super().__init__(message=reason, code="AUTH_ERROR")


# Usage in an API handler
def get_user(user_id: int) -> dict:
    """Simulate fetching a user with proper error handling."""
    if not isinstance(user_id, int) or user_id < 1:
        raise ValidationError("user_id", "Must be a positive integer", user_id)

    users_db = {1: {"name": "Alice"}, 2: {"name": "Bob"}}

    if user_id not in users_db:
        raise NotFoundError("User", user_id)

    return users_db[user_id]


# Caller can catch specific or broad
try:
    user = get_user(999)
except NotFoundError as e:
    print(e.to_dict())
    # {'error': 'NOT_FOUND', 'message': "User with id '999' not found", ...}
except AppError as e:
    # Catches ANY app-level error
    print(f"App error [{e.code}]: {e}")


# ============================================================
# Exception chaining: raise ... from ...
# ============================================================
class DatabaseError(AppError):
    def __init__(self, message, original=None):
        super().__init__(message, code="DB_ERROR")
        self.original = original

def fetch_from_db(query: str):
    """Wrap low-level DB errors in application-level exceptions."""
    try:
        # Simulate a database operation that fails
        raise ConnectionError("Connection refused: localhost:5432")
    except ConnectionError as e:
        # Explicit chaining — preserves the cause in tracebacks
        raise DatabaseError(
            f"Failed to execute query: {query}"
        ) from e  # e is stored as __cause__

# raise ... from None  — suppresses the chain
def parse_user_input(raw: str) -> int:
    try:
        return int(raw)
    except ValueError:
        # Hide the internal ValueError from the user
        raise ValidationError(
            "age", "Must be a whole number", raw
        ) from None  # __cause__ = None, __suppress_context__ = True


# ============================================================
# ExceptionGroup (Python 3.11+) — multiple simultaneous errors
# ============================================================
def validate_form(data: dict) -> None:
    """Collect ALL validation errors, not just the first one."""
    errors = []

    if not data.get("name"):
        errors.append(ValidationError("name", "Required"))
    if not data.get("email") or "@" not in data.get("email", ""):
        errors.append(ValidationError("email", "Invalid email format"))
    if not isinstance(data.get("age"), int) or data["age"] < 0:
        errors.append(ValidationError("age", "Must be non-negative integer"))

    if errors:
        raise ExceptionGroup("Form validation failed", errors)

# Catching with except* (Python 3.11+)
try:
    validate_form({"name": "", "email": "bad", "age": -5})
except* ValidationError as eg:
    # eg is an ExceptionGroup containing only ValidationError instances
    for exc in eg.exceptions:
        print(f"  - {exc.field}: {exc}")
    # Unmatched exceptions propagate automatically`,
      exercise: `**Exercises:**

1. Write a function \`safe_divide(a, b)\` that handles \`ZeroDivisionError\` and \`TypeError\`, uses \`else\` for logging success, and \`finally\` for cleanup. Return \`None\` on failure.

2. Create a custom exception hierarchy for an e-commerce system: \`ShopError\` (base) → \`PaymentError\`, \`InventoryError\`, \`ShippingError\`. Each should carry structured data (order_id, item_sku, etc.) and have a \`to_dict()\` method for API responses.

3. Write a \`validate_user_registration(data)\` function that collects ALL validation errors (name, email, password strength, age) and raises them as an \`ExceptionGroup\` (Python 3.11+). Then catch and display each error using \`except*\`.

4. Implement a retry decorator \`@retry(max_attempts=3, backoff=1.0, exceptions=(ConnectionError,))\` that catches specified exceptions, waits with exponential backoff, and raises the last exception after all attempts fail. Use \`raise ... from\` to chain the original error.

5. Demonstrate the difference between \`raise X from Y\` (explicit chaining), implicit chaining (exception during except block), and \`raise X from None\` (suppressed chaining) with three separate examples.`,
      commonMistakes: [
        "Using bare `except:` or `except Exception:` without re-raising. This swallows `KeyboardInterrupt` and `SystemExit`, making your program impossible to kill gracefully. Always catch specific exceptions or re-raise with `raise`.",
        "Putting too much code in the `try` block. Only wrap the specific line(s) that can raise — everything else goes in `else` (success path) or after the try/except. Large try blocks hide which operation actually failed.",
        "Catching an exception just to log and re-raise without `raise` (no arguments). Writing `except ValueError as e: log(e); raise ValueError(str(e))` creates a new exception and loses the original traceback. Use bare `raise` to re-raise the original.",
        "Ignoring exception chaining — not using `raise NewError(...) from original_error`. Without `from`, Python still sets `__context__` implicitly, but `from` makes the relationship explicit and clearer in tracebacks.",
        "Creating flat custom exceptions instead of a hierarchy. Without a base `AppError`, callers cannot catch broad categories of errors. Always define a module-level base exception that all custom exceptions inherit from.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the difference between `else` and `finally` in a try block. When does each execute?",
          a: "`else` runs **only** when the `try` block completes **without** raising an exception. It is skipped if any exception occurs (caught or not). `finally` runs **always** — whether the `try` succeeded, an exception was caught, an exception was not caught (propagating), or even if `return`/`break`/`continue` was executed inside `try` or `except`. Use `else` for success-only logic (processing results, logging success). Use `finally` for guaranteed cleanup (closing files, releasing locks, resetting state). A common pattern: `try` acquires a resource, `else` uses it, `finally` releases it.",
        },
        {
          type: "tricky",
          q: "What is the difference between `raise X from Y`, `raise X from None`, and implicit exception chaining?",
          a: "**`raise X from Y`** — explicit chaining. Sets `X.__cause__ = Y` and `X.__suppress_context__ = False`. The traceback shows both exceptions connected by 'The above exception was the direct cause of...'. **Implicit chaining** — when an exception is raised inside an `except` block, Python automatically sets `X.__context__` to the caught exception. Traceback shows 'During handling of the above exception, another exception occurred...'. **`raise X from None`** — suppresses chaining. Sets `X.__cause__ = None` and `X.__suppress_context__ = True`. Only the new exception appears in the traceback. Use this when the original error is an implementation detail that would confuse users (e.g., hiding an internal `KeyError` behind a clean `ValidationError`).",
        },
        {
          type: "coding",
          q: "Write a context manager that suppresses specific exceptions and logs them, similar to `contextlib.suppress` but with logging.",
          a: "\`\`\`python\nimport logging\n\nclass SuppressAndLog:\n    def __init__(self, *exceptions, logger=None):\n        self.exceptions = exceptions\n        self.logger = logger or logging.getLogger(__name__)\n        self.suppressed = []\n\n    def __enter__(self):\n        return self\n\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        if exc_type is not None and issubclass(exc_type, self.exceptions):\n            self.logger.warning(\n                f'Suppressed {exc_type.__name__}: {exc_val}'\n            )\n            self.suppressed.append(exc_val)\n            return True  # Suppress the exception\n        return False  # Let other exceptions propagate\n\nwith SuppressAndLog(FileNotFoundError, ValueError) as s:\n    int('not_a_number')\n\nprint(s.suppressed)  # [ValueError(\"invalid literal...\")]\n\`\`\`",
        },
        {
          type: "scenario",
          q: "You have a function that calls three external services sequentially. If one fails, you want to still attempt the others and report all failures at the end. How would you implement this in Python 3.11+?",
          a: "Use `ExceptionGroup` to aggregate errors from all three calls:\n\`\`\`python\ndef call_all_services(data):\n    errors = []\n    results = {}\n    for name, func in [('auth', auth_svc), ('payment', pay_svc), ('notify', notify_svc)]:\n        try:\n            results[name] = func(data)\n        except Exception as e:\n            errors.append(e)\n    if errors:\n        raise ExceptionGroup(f'{len(errors)} service(s) failed', errors)\n    return results\n\ntry:\n    call_all_services(payload)\nexcept* ConnectionError as eg:\n    for e in eg.exceptions:\n        retry_later(e)\nexcept* TimeoutError as eg:\n    alert_ops_team(eg)\n\`\`\`\n`except*` lets callers handle different exception types from the group independently. Unmatched exceptions propagate automatically in a new ExceptionGroup.",
        },
      ],
    },
    {
      id: "py-file-operations",
      title: "File Operations & Context Managers",
      explanation: `Python provides powerful, cross-platform file I/O through the built-in \`open()\` function and the \`pathlib\` module. The **context manager protocol** (\`with\` statement) ensures files are always properly closed, even if exceptions occur — a pattern so fundamental it's used throughout the standard library for any resource that needs deterministic cleanup.

**\`open()\` modes:**

| Mode | Description | Creates? | Truncates? |
|------|-------------|----------|------------|
| \`"r"\` | Read text (default) | No | No |
| \`"w"\` | Write text | Yes | **Yes** |
| \`"a"\` | Append text | Yes | No |
| \`"x"\` | Exclusive create | **Yes (fail if exists)** | No |
| \`"rb"\` / \`"wb"\` | Read/write binary | — | — |
| \`"r+"\` / \`"w+"\` | Read+write | No/Yes | No/**Yes** |

**\`pathlib.Path\`** is the modern, object-oriented approach to filesystem paths. It replaces \`os.path\` with chainable methods, operator overloading (\`/\`), and built-in read/write helpers. Always prefer \`pathlib\` over \`os.path\` in new code.

**Context managers** implement the \`__enter__\`/\`__exit__\` protocol. The \`with\` statement guarantees \`__exit__\` runs, providing deterministic resource cleanup. You can write custom context managers as classes or with \`@contextmanager\` from \`contextlib\`.

**Encoding matters:** Always specify \`encoding="utf-8"\` explicitly. The default encoding is platform-dependent (\`locale.getpreferredencoding()\`), which causes cross-platform bugs. Python 3.15 will make UTF-8 the default, but be explicit until then.`,
      codeExample: `# ============================================================
# Basic file operations with context managers
# ============================================================
# GOOD — always use 'with' for automatic cleanup
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Line 1\\n")
    f.write("Line 2\\n")
    # File is automatically closed when exiting the 'with' block
    # Even if an exception occurs inside

# BAD — manual close is error-prone
# f = open("output.txt", "w")
# f.write("data")
# f.close()  # What if write() raises? File stays open!

# Reading entire file
with open("output.txt", "r", encoding="utf-8") as f:
    content = f.read()           # Entire file as one string

# Reading line by line (memory efficient for large files)
with open("output.txt", "r", encoding="utf-8") as f:
    for line in f:               # File object is iterable
        print(line.rstrip())     # rstrip() removes trailing newline

# Reading all lines into a list
with open("output.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()        # List of strings (includes \\n)

# Exclusive create — fail if file already exists
# Prevents accidentally overwriting important files
try:
    with open("new_file.txt", "x", encoding="utf-8") as f:
        f.write("Created safely")
except FileExistsError:
    print("File already exists — won't overwrite")


# ============================================================
# pathlib — the modern way to handle paths
# ============================================================
from pathlib import Path

# Creating paths — use / operator for joining
project_root = Path("/home/user/project")
config_path = project_root / "config" / "settings.json"
print(config_path)  # /home/user/project/config/settings.json

# Path properties
p = Path("/home/user/project/data/report.csv.gz")
print(p.name)       # "report.csv.gz"
print(p.stem)       # "report.csv"     (name without LAST suffix)
print(p.suffix)     # ".gz"
print(p.suffixes)   # [".csv", ".gz"]
print(p.parent)     # /home/user/project/data
print(p.parts)      # ('/', 'home', 'user', 'project', 'data', 'report.csv.gz')

# Current directory and home
cwd = Path.cwd()
home = Path.home()

# Check existence and type
p = Path("some_path")
p.exists()           # True/False
p.is_file()          # True if it's a regular file
p.is_dir()           # True if it's a directory
p.is_symlink()       # True if it's a symbolic link

# Read/write helpers (open + read/write + close in one call)
config_path = Path("config.txt")
config_path.write_text("key=value\\n", encoding="utf-8")
content = config_path.read_text(encoding="utf-8")

# Binary read/write
data_path = Path("data.bin")
data_path.write_bytes(b"\\x00\\x01\\x02\\x03")
raw = data_path.read_bytes()

# Directory operations
output_dir = Path("output/reports/2024")
output_dir.mkdir(parents=True, exist_ok=True)  # Like mkdir -p

# Glob — find files matching patterns
project = Path(".")
py_files = list(project.glob("*.py"))           # Current dir only
all_py = list(project.rglob("*.py"))            # Recursive
csvs = list(project.glob("data/**/*.csv"))      # Specific subdir

# Iterating directory contents
for item in Path(".").iterdir():
    if item.is_file():
        print(f"  File: {item.name} ({item.stat().st_size} bytes)")


# ============================================================
# Production pattern: safe file writing with atomic replace
# ============================================================
import tempfile
import os

def atomic_write(filepath: str, content: str, encoding="utf-8"):
    """Write to a file atomically — prevents partial writes on crash.

    Writes to a temp file first, then renames (which is atomic on POSIX).
    If the process crashes mid-write, the original file is untouched.
    """
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)

    # Write to temp file in the same directory (same filesystem for rename)
    fd, tmp_path = tempfile.mkstemp(
        dir=path.parent, suffix=".tmp", prefix=f".{path.name}."
    )
    try:
        with os.fdopen(fd, "w", encoding=encoding) as tmp_file:
            tmp_file.write(content)
            tmp_file.flush()
            os.fsync(tmp_file.fileno())  # Force write to disk
        os.replace(tmp_path, filepath)   # Atomic rename
    except BaseException:
        os.unlink(tmp_path)              # Clean up temp file on failure
        raise

atomic_write("important_data.json", '{"status": "saved"}')


# ============================================================
# Custom context managers — class-based
# ============================================================
class ManagedFile:
    """Context manager for file operations with logging."""

    def __init__(self, filename, mode="r", encoding="utf-8"):
        self.filename = filename
        self.mode = mode
        self.encoding = encoding
        self.file = None

    def __enter__(self):
        print(f"Opening {self.filename} in mode '{self.mode}'")
        self.file = open(self.filename, self.mode, encoding=self.encoding)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
            print(f"Closed {self.filename}")
        if exc_type is not None:
            print(f"Exception occurred: {exc_type.__name__}: {exc_val}")
        return False  # Don't suppress exceptions


# ============================================================
# Custom context managers — generator-based (simpler)
# ============================================================
from contextlib import contextmanager

@contextmanager
def temp_directory():
    """Create a temporary directory, clean up when done."""
    import tempfile
    import shutil

    tmpdir = tempfile.mkdtemp()
    try:
        yield Path(tmpdir)          # Value given to 'as' variable
    finally:
        shutil.rmtree(tmpdir)       # Cleanup always runs

with temp_directory() as tmpdir:
    data_file = tmpdir / "data.txt"
    data_file.write_text("temporary data", encoding="utf-8")
    print(f"Working in: {tmpdir}")
# tmpdir is deleted here


# ============================================================
# Processing large files efficiently
# ============================================================
def count_lines_in_large_file(filepath: str) -> int:
    """Count lines without loading entire file into memory."""
    count = 0
    with open(filepath, "r", encoding="utf-8") as f:
        for _ in f:  # Iterating line-by-line uses minimal memory
            count += 1
    return count

def process_in_chunks(filepath: str, chunk_size: int = 8192):
    """Read binary file in fixed-size chunks for processing."""
    with open(filepath, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            # Process chunk (e.g., compute hash, upload, etc.)
            yield chunk`,
      exercise: `**Exercises:**

1. Write a function that reads a text file, counts word frequencies, and writes the results to a new file sorted by frequency (descending). Use \`pathlib\` for all path operations and handle \`FileNotFoundError\` and \`PermissionError\` gracefully.

2. Implement an \`atomic_write\` context manager that writes to a temp file and atomically renames on success. If an exception occurs inside the \`with\` block, delete the temp file and leave the original untouched.

3. Create a \`@contextmanager\` function called \`locked_file(path)\` that acquires a file lock (using \`fcntl.flock\` on Unix) before writing and releases it in \`finally\`. Test with two concurrent writers.

4. Write a script that recursively finds all \`.log\` files in a directory tree using \`Path.rglob()\`, reads each one, extracts lines containing "ERROR", and writes them to a consolidated \`errors.txt\` with the source filename prepended to each line.

5. Build a \`FileWatcher\` class that monitors a file for changes by polling \`stat().st_mtime\`. Use it as a context manager that starts/stops the polling. Demonstrate it detecting an external file modification.

6. Process a 1GB+ CSV file line-by-line (without loading it all into memory). Count rows matching a condition and report progress every 100,000 rows.`,
      commonMistakes: [
        "Not specifying `encoding='utf-8'` when opening text files. The default is platform-dependent (`locale.getpreferredencoding()`), causing `UnicodeDecodeError` or silent data corruption when code runs on different OS. Always pass encoding explicitly.",
        "Using `'w'` mode when you meant `'a'` (append). `'w'` truncates the file to zero length before writing. If you need to add to an existing file, use `'a'`. If you want to fail on existing files, use `'x'` (exclusive create).",
        "Building paths with string concatenation (`dir + '/' + filename`) instead of `pathlib.Path` or `os.path.join()`. String concatenation breaks on Windows (which uses backslashes) and mishandles edge cases like double slashes.",
        "Reading entire large files into memory with `.read()` or `.readlines()`. For files larger than available RAM, iterate line-by-line (`for line in f:`) or use chunked reading (`f.read(chunk_size)`).",
        "Forgetting that `__exit__` must return `True` to suppress an exception. Returning `None` or `False` (the default) lets the exception propagate. Only return `True` when you intentionally want to swallow the exception — which is rarely correct.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the context manager protocol and why is it preferred over manual resource management?",
          a: "The context manager protocol consists of two magic methods: `__enter__()` (called when entering the `with` block, return value is bound to the `as` variable) and `__exit__(exc_type, exc_val, exc_tb)` (called when exiting, receives exception info or `None` for all three). It's preferred because: 1) **Guaranteed cleanup** — `__exit__` runs even if exceptions occur, preventing resource leaks. 2) **Exception safety** — no manual `try/finally` boilerplate. 3) **Readability** — the `with` statement clearly scopes the resource's lifetime. 4) **Composability** — `contextlib.ExitStack` can manage multiple context managers dynamically. Without `with`, a crash between `open()` and `close()` leaks the file descriptor.",
        },
        {
          type: "tricky",
          q: "What happens if an exception is raised inside a `with` block? Can the context manager suppress it?",
          a: "When an exception occurs inside a `with` block, Python calls `__exit__(exc_type, exc_val, exc_tb)` with the exception info. The context manager can: 1) **Suppress the exception** by returning `True` from `__exit__` — execution continues after the `with` block as if nothing happened. 2) **Let it propagate** by returning `False`/`None` — the exception continues up the call stack after `__exit__` completes. 3) **Raise a different exception** inside `__exit__` — replaces the original (the original is set as `__context__`). Note: `__exit__` always runs for cleanup regardless of whether it suppresses. `contextlib.suppress(ExceptionType)` is a built-in context manager that does exactly this for specified exception types.",
        },
        {
          type: "coding",
          q: "Write a function that safely swaps the contents of two files atomically.",
          a: "\`\`\`python\nimport tempfile\nimport os\nfrom pathlib import Path\n\ndef swap_files(path_a: str, path_b: str) -> None:\n    a, b = Path(path_a), Path(path_b)\n    # Create temp copy of A in the same directory\n    fd, tmp = tempfile.mkstemp(dir=a.parent)\n    try:\n        os.close(fd)\n        # A -> tmp, B -> A, tmp -> B\n        os.replace(str(a), tmp)        # atomic\n        os.replace(str(b), str(a))     # atomic\n        os.replace(tmp, str(b))        # atomic\n    except BaseException:\n        # Best-effort recovery: if tmp still has A's data, restore it\n        if Path(tmp).exists() and not a.exists():\n            os.replace(tmp, str(a))\n        elif Path(tmp).exists():\n            os.unlink(tmp)\n        raise\n\`\`\`\nNote: true atomic swap of two files isn't possible on most filesystems. This is a three-step rename approach that minimizes the window of inconsistency.",
        },
      ],
    },
    {
      id: "py-serialization",
      title: "Serialization: JSON, CSV, Pickle, YAML & TOML",
      explanation: `**Serialization** is converting Python objects to a storable/transmittable format, and **deserialization** is the reverse. Python ships with robust support for JSON, CSV, and pickle in the standard library, with TOML reading added in Python 3.11. YAML requires the third-party \`PyYAML\` package.

**Format comparison:**

| Format | Human Readable | Types | Security | Use Case |
|--------|---------------|-------|----------|----------|
| **JSON** | Yes | Strings, numbers, bools, null, arrays, objects | Safe | APIs, configs, data exchange |
| **CSV** | Yes | Strings only (everything is text) | Safe | Tabular data, spreadsheets |
| **pickle** | No (binary) | **Any** Python object | **DANGEROUS** | Internal caching, ML models |
| **TOML** | Yes | Strings, ints, floats, bools, datetimes, arrays, tables | Safe | Config files (pyproject.toml) |
| **YAML** | Yes | Rich types including dates, nulls | **Risky** (\`safe_load\` only) | Config files, Kubernetes, CI/CD |

**Critical security warnings:**
- **Never unpickle untrusted data.** \`pickle.loads()\` can execute arbitrary code — it's a remote code execution vulnerability. Only use pickle for data you created yourself.
- **Always use \`yaml.safe_load()\`**, never \`yaml.load()\` without \`Loader=SafeLoader\`. The default loader can construct arbitrary Python objects from YAML.

**JSON tips:** Python's \`json\` module only handles basic types. For \`datetime\`, \`Decimal\`, \`UUID\`, etc., provide a custom encoder via \`default=\` parameter or subclass \`JSONEncoder\`. The \`orjson\` and \`ujson\` third-party libraries are 5-10x faster for large payloads.

**CSV tips:** Always use the \`csv\` module rather than splitting on commas — it handles quoting, escaping, and multi-line fields correctly. \`DictReader\`/\`DictWriter\` provide column-name access.`,
      codeExample: `# ============================================================
# JSON — the universal data interchange format
# ============================================================
import json
from datetime import datetime, date
from decimal import Decimal
from pathlib import Path
from uuid import UUID, uuid4

# Basic usage
data = {"name": "Alice", "scores": [95, 87, 92], "active": True}
json_str = json.dumps(data, indent=2)       # Python → JSON string
parsed = json.loads(json_str)               # JSON string → Python

# Write/read JSON files
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)  # Pretty-print, allow unicode

with open("data.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)

# Custom encoder for types JSON doesn't support natively
class AppJSONEncoder(json.JSONEncoder):
    """Handle datetime, Decimal, UUID, set, bytes, Path."""

    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return str(obj)  # Preserve precision (float would lose it)
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, set):
            return sorted(list(obj))  # Sets aren't ordered
        if isinstance(obj, bytes):
            import base64
            return base64.b64encode(obj).decode("ascii")
        if isinstance(obj, Path):
            return str(obj)
        return super().default(obj)  # Raise TypeError for unknown types

# Usage
record = {
    "id": uuid4(),
    "created": datetime.now(),
    "price": Decimal("19.99"),
    "tags": {"python", "coding"},
}
print(json.dumps(record, cls=AppJSONEncoder, indent=2))

# Alternative: use the default= parameter (simpler for one-offs)
json.dumps(record, default=str)  # Converts anything unknown to string


# ============================================================
# CSV — tabular data
# ============================================================
import csv

# Writing CSV
employees = [
    {"name": "Alice", "dept": "Engineering", "salary": 120000},
    {"name": "Bob", "dept": "Marketing", "salary": 95000},
    {"name": 'Charlie "Chuck"', "dept": "Sales", "salary": 88000},
]

with open("employees.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "dept", "salary"])
    writer.writeheader()
    writer.writerows(employees)

# Reading CSV
with open("employees.csv", "r", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        # All values are strings — cast as needed
        name = row["name"]
        salary = int(row["salary"])
        print(f"{name}: salary={salary:,}")

# BAD — never split on comma manually
# line.split(",")  # Breaks on: 'Charlie "Chuck"', fields with commas, etc.

# GOOD — csv module handles quoting, escaping, multi-line fields
# Also handles different dialects (excel, unix, custom)


# ============================================================
# pickle — Python-specific binary serialization
# ============================================================
import pickle

# WARNING: Never unpickle data from untrusted sources!
# pickle.loads() can execute arbitrary code.

class TrainedModel:
    """Simulate an ML model with fitted parameters."""
    def __init__(self, weights, accuracy):
        self.weights = weights
        self.accuracy = accuracy

    def predict(self, x):
        return sum(w * xi for w, xi in zip(self.weights, x))

model = TrainedModel(weights=[0.5, 0.3, 0.2], accuracy=0.95)

# Serialize to bytes
pickled = pickle.dumps(model, protocol=pickle.HIGHEST_PROTOCOL)

# Serialize to file
with open("model.pkl", "wb") as f:
    pickle.dump(model, f, protocol=pickle.HIGHEST_PROTOCOL)

# Deserialize (ONLY from trusted sources!)
with open("model.pkl", "rb") as f:
    loaded_model = pickle.load(f)
    print(loaded_model.predict([1, 2, 3]))  # 0.5*1 + 0.3*2 + 0.2*3 = 1.7

# Customize pickling with __getstate__ / __setstate__
class DatabaseConnection:
    """Connections can't be pickled — customize the behavior."""

    def __init__(self, host, port):
        self.host = host
        self.port = port
        self._connection = self._connect()  # Not serializable

    def _connect(self):
        return f"<Connection to {self.host}:{self.port}>"

    def __getstate__(self):
        """Called during pickling — return what to serialize."""
        state = self.__dict__.copy()
        del state["_connection"]  # Remove non-serializable attribute
        return state

    def __setstate__(self, state):
        """Called during unpickling — restore the object."""
        self.__dict__.update(state)
        self._connection = self._connect()  # Reconnect


# ============================================================
# TOML — Python 3.11+ built-in reader (pyproject.toml, configs)
# ============================================================
import tomllib  # Python 3.11+ (read-only)

toml_str = """
[project]
name = "my-package"
version = "1.0.0"
requires-python = ">=3.11"

[project.dependencies]
requests = ">=2.28"
pydantic = ">=2.0"

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"

[[project.authors]]
name = "Alice"
email = "alice@example.com"
"""

config = tomllib.loads(toml_str)
print(config["project"]["name"])       # "my-package"
print(config["tool"]["pytest"]["ini_options"]["addopts"])

# Read from file (must open in binary mode for tomllib)
# with open("pyproject.toml", "rb") as f:
#     config = tomllib.load(f)

# For WRITING TOML, use the third-party 'tomli-w' package:
# import tomli_w
# with open("config.toml", "wb") as f:
#     tomli_w.dump(config, f)


# ============================================================
# YAML — human-friendly config format (requires PyYAML)
# ============================================================
# pip install pyyaml
import yaml

yaml_str = """
database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret123

services:
  - name: api
    replicas: 3
    ports:
      - 8080
      - 8443
  - name: worker
    replicas: 5
"""

# ALWAYS use safe_load — never yaml.load() without SafeLoader
# yaml.load() can execute arbitrary Python code from YAML!
config = yaml.safe_load(yaml_str)
print(config["database"]["host"])             # "localhost"
print(config["services"][0]["name"])           # "api"

# Write YAML
output = yaml.dump(
    config,
    default_flow_style=False,  # Block style (readable)
    sort_keys=False,           # Preserve insertion order
    allow_unicode=True,
)
print(output)

# Safe dump — only outputs standard YAML types
yaml.safe_dump(config, stream=open("config.yaml", "w", encoding="utf-8"))`,
      exercise: `**Exercises:**

1. Write a \`JSONSerializer\` class with a custom encoder that handles \`datetime\`, \`Decimal\`, \`UUID\`, \`set\`, \`Path\`, \`dataclass\`, and \`Enum\` types. Add a corresponding \`object_hook\` decoder that round-trips datetimes and UUIDs back to their original types.

2. Build a CSV processing pipeline: read a CSV file of sales records, filter rows by date range, compute aggregates (total revenue, average order value per category), and write the results to a new CSV. Handle malformed rows gracefully with error logging.

3. Create a config file loader that auto-detects the format from the file extension (\`.json\`, \`.yaml\`, \`.toml\`) and returns a unified dictionary. Support environment variable interpolation (e.g., \`\$\\{DATABASE_URL}\` in values gets replaced with the actual env var).

4. Demonstrate the security risk of pickle: write a malicious pickle payload that executes \`os.system("echo HACKED")\` when loaded. Then implement a \`RestrictedUnpickler\` (subclass \`pickle.Unpickler\`) that only allows specific safe classes.

5. Build a simple document store: a class that saves/loads Python dicts as JSON files in a directory, with \`get(id)\`, \`put(id, data)\`, \`delete(id)\`, and \`list_all()\` methods. Use atomic writes to prevent corruption.`,
      commonMistakes: [
        "Using `pickle` for data exchange between systems or persisting user-supplied data. Pickle is insecure (arbitrary code execution), Python-version-specific, and not human-readable. Use JSON for interchange and structured formats for configs.",
        "Calling `yaml.load(data)` without specifying `Loader=yaml.SafeLoader`. The default loader can instantiate arbitrary Python objects from YAML tags like `!!python/object/apply:os.system [rm -rf /]`. Always use `yaml.safe_load()`.",
        "Not passing `newline=''` when opening CSV files. The `csv` module handles line endings internally. Without `newline=''`, you get extra blank rows on Windows because Python's universal newline translation doubles the `\\r\\n`.",
        "Assuming CSV values are typed. Everything from `csv.reader` and `csv.DictReader` is a string. You must explicitly cast: `int(row['age'])`, `float(row['price'])`, `datetime.fromisoformat(row['date'])`. Missing casts cause subtle bugs in comparisons and arithmetic.",
        "Using `json.dumps(obj, default=str)` as a universal fix. While convenient, it silently converts unknown objects to their `str()` representation, which often can't be deserialized back. Write a proper custom encoder that handles each type explicitly.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is pickle considered dangerous, and when is it appropriate to use?",
          a: "**Danger:** `pickle.loads()` can execute **arbitrary Python code** during deserialization. A crafted pickle payload can run `os.system('rm -rf /')` or open a reverse shell. This is because pickle reconstructs objects by calling constructors and methods — an attacker controls which functions are called and with what arguments. **Never unpickle data from untrusted sources** (user input, network, shared storage). **Appropriate uses:** 1) Internal caching (Redis/memcached between your own services). 2) Serializing ML models (scikit-learn, PyTorch) for deployment within your infrastructure. 3) `multiprocessing` module's IPC (automatic, within one machine). 4) Short-lived temp files on a secure machine. For data exchange, use JSON, Protocol Buffers, or MessagePack.",
        },
        {
          type: "tricky",
          q: "What are the edge cases and pitfalls when working with JSON in Python?",
          a: "1) **No datetime/date support** — must serialize as ISO strings and parse back manually. 2) **Float precision** — `json.dumps(0.1 + 0.2)` gives `0.30000000000000004`. Use `Decimal` with string serialization for money. 3) **Key types** — JSON keys must be strings; `json.dumps({1: 'a'})` converts `1` to `'1'`, but `json.loads` won't convert back. 4) **NaN/Infinity** — `json.dumps(float('nan'))` produces `NaN` (invalid JSON spec). Use `allow_nan=False` to catch this. 5) **Encoding** — `ensure_ascii=True` (default) escapes non-ASCII; set `False` for readable unicode. 6) **No comments** — JSON doesn't support comments; use TOML or YAML for config files that need them. 7) **No trailing commas** — common error when editing JSON by hand.",
        },
        {
          type: "coding",
          q: "Write a function that deep-merges two dictionaries (as you would merge YAML/TOML config files, with overrides).",
          a: "\`\`\`python\ndef deep_merge(base: dict, override: dict) -> dict:\n    result = base.copy()\n    for key, value in override.items():\n        if (\n            key in result\n            and isinstance(result[key], dict)\n            and isinstance(value, dict)\n        ):\n            result[key] = deep_merge(result[key], value)\n        else:\n            result[key] = value\n    return result\n\nbase = {'db': {'host': 'localhost', 'port': 5432}, 'debug': False}\noverride = {'db': {'port': 3306, 'name': 'prod'}, 'debug': True}\nprint(deep_merge(base, override))\n# {'db': {'host': 'localhost', 'port': 3306, 'name': 'prod'}, 'debug': True}\n\`\`\`\nThe key insight: when both values are dicts, recurse. Otherwise, the override wins. This is the pattern used by tools like Helm, Ansible, and config loaders.",
        },
        {
          type: "scenario",
          q: "You need to process a 50GB CSV file on a machine with 8GB RAM. How would you approach this?",
          a: "1) **Stream line-by-line** — use `csv.reader` with file iteration (not `.readlines()`). Each line is discarded after processing, keeping memory constant. 2) **Use `csv.DictReader`** for named access but be aware it creates a dict per row — still O(1) memory since only one row is in memory at a time. 3) **For aggregations**, accumulate results in running totals/counters rather than collecting all rows. 4) **Chunk processing** — read N rows at a time for batch operations (e.g., bulk DB inserts). 5) **For complex analysis**, use **pandas with `chunksize`**: `for chunk in pd.read_csv('big.csv', chunksize=100_000)`. 6) **Consider `polars`** — a Rust-based DataFrame library with lazy evaluation and streaming that handles larger-than-RAM files natively. 7) **Memory-map** with `mmap` for random access patterns. Key principle: never call `.read()` or `.readlines()` on a file whose size exceeds available RAM.",
        },
      ],
    },
    {
      id: "py-logging",
      title: "Logging: Levels, Handlers, Formatters & Structured Logging",
      explanation: `Python's \`logging\` module is a production-grade, highly configurable logging framework built into the standard library. It supports hierarchical loggers, multiple output destinations (handlers), customizable message formatting, and filtering — all without third-party dependencies.

**Why not \`print()\`?**
- No log levels (can't filter debug vs error)
- No timestamps, source file, or line numbers
- No way to route to files, syslog, or external services
- Can't disable without removing code
- Not thread-safe for concurrent writes

**Log levels (in order of severity):**

| Level | Value | Use Case |
|-------|-------|----------|
| \`DEBUG\` | 10 | Detailed diagnostic info (variable values, flow tracing) |
| \`INFO\` | 20 | Confirmation that things are working (startup, shutdown, milestones) |
| \`WARNING\` | 30 | Something unexpected but not broken (deprecated API, retry, fallback) |
| \`ERROR\` | 40 | Something failed but the app continues (failed request, missing resource) |
| \`CRITICAL\` | 50 | The app cannot continue (out of memory, database down, corrupted state) |

**Architecture:** The logging system has four key components:
1. **Loggers** — the API you call (\`logger.info("msg")\`). Organized in a dot-separated hierarchy (\`app.db.queries\`).
2. **Handlers** — where logs go (\`StreamHandler\`, \`FileHandler\`, \`RotatingFileHandler\`, \`SysLogHandler\`, etc.).
3. **Formatters** — how log messages look (timestamp format, included fields).
4. **Filters** — fine-grained control over which records are emitted.

**Best practice:** Always use \`logging.getLogger(__name__)\` to create module-level loggers. This creates a logger hierarchy matching your package structure, allowing fine-grained configuration. Never use the root logger (\`logging.info()\`) in library code.`,
      codeExample: `# ============================================================
# Basic logging setup — the minimum viable configuration
# ============================================================
import logging

# BAD — using print for diagnostics
# print(f"Processing user {user_id}")  # No level, no timestamp, no filtering

# BAD — using root logger in a module/library
# logging.info("...")  # Pollutes the root logger, hard to configure

# GOOD — module-level logger with __name__
logger = logging.getLogger(__name__)

# Quick setup for scripts (NOT for libraries)
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Using different levels
logger.debug("Connecting to database at %s:%d", "localhost", 5432)
logger.info("Application started successfully")
logger.warning("Cache miss for key %r, falling back to DB", "user:123")
logger.error("Failed to process payment for order %s", "ORD-456")
logger.critical("Database connection pool exhausted — shutting down")


# ============================================================
# Production logging configuration — programmatic setup
# ============================================================
import logging
import logging.handlers
import sys
from pathlib import Path


def setup_logging(
    log_dir: str = "logs",
    level: str = "INFO",
    max_bytes: int = 10 * 1024 * 1024,  # 10 MB
    backup_count: int = 5,
):
    """Configure production-grade logging with console + rotating file."""
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)

    # Create root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))

    # Clear existing handlers (prevents duplicate logs on re-init)
    root_logger.handlers.clear()

    # --- Console handler (human-readable) ---
    console_handler = logging.StreamHandler(sys.stderr)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
        datefmt="%H:%M:%S",
    )
    console_handler.setFormatter(console_formatter)

    # --- Rotating file handler (detailed, for debugging) ---
    file_handler = logging.handlers.RotatingFileHandler(
        filename=log_path / "app.log",
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    file_handler.setFormatter(file_formatter)

    # --- Error-only file handler (for alerts/monitoring) ---
    error_handler = logging.handlers.RotatingFileHandler(
        filename=log_path / "errors.log",
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)

    # Attach all handlers
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)

    # Silence noisy third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    root_logger.info("Logging initialized (level=%s, dir=%s)", level, log_dir)


# Initialize once at application startup
# setup_logging(level="DEBUG")


# ============================================================
# Logging with structured context — the extra parameter
# ============================================================
logger = logging.getLogger("app.orders")

def process_order(order_id: str, user_id: str, amount: float):
    """Use structured logging with extra context."""
    log = logging.LoggerAdapter(logger, {"order_id": order_id, "user_id": user_id})

    log.info("Processing order for $%.2f", amount)

    try:
        # Simulate payment
        if amount > 10000:
            raise ValueError("Amount exceeds single transaction limit")
        log.info("Payment processed successfully")
    except ValueError as e:
        # exc_info=True includes the full traceback in the log
        log.error("Payment failed: %s", e, exc_info=True)
        raise


# ============================================================
# JSON structured logging — for log aggregation systems
# ============================================================
import json
import traceback

class JSONFormatter(logging.Formatter):
    """Format log records as JSON for ELK/Datadog/CloudWatch."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "process": record.process,
            "thread": record.thread,
        }

        # Include exception info if present
        if record.exc_info and record.exc_info[0] is not None:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": traceback.format_exception(*record.exc_info),
            }

        # Include any extra fields from LoggerAdapter or extra={}
        for key in ("order_id", "user_id", "request_id", "duration_ms"):
            if hasattr(record, key):
                log_data[key] = getattr(record, key)

        return json.dumps(log_data, default=str)


# Apply JSON formatter for production
def setup_json_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)


# ============================================================
# Custom filter — add request context to all log messages
# ============================================================
import threading

# Thread-local storage for request context
_request_context = threading.local()

class RequestContextFilter(logging.Filter):
    """Inject request_id into every log record automatically."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = getattr(_request_context, "request_id", "N/A")
        record.client_ip = getattr(_request_context, "client_ip", "N/A")
        return True  # Always pass — we're adding data, not filtering

# Usage in a web framework middleware
def handle_request(request):
    """Simulate middleware that sets request context."""
    import uuid
    _request_context.request_id = str(uuid.uuid4())[:8]
    _request_context.client_ip = "192.168.1.100"

    logger = logging.getLogger("app.api")
    logger.addFilter(RequestContextFilter())
    logger.info("Handling request to /api/users")
    # Log output includes: request_id=a1b2c3d4, client_ip=192.168.1.100


# ============================================================
# Dictionary-based configuration (logging.config.dictConfig)
# ============================================================
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
        "json": {
            "()": "__main__.JSONFormatter",  # Use custom formatter class
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "stream": "ext://sys.stderr",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "standard",
            "filename": "logs/app.log",
            "maxBytes": 10485760,
            "backupCount": 5,
        },
    },
    "loggers": {
        "app": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "app.db": {
            "handlers": ["file"],
            "level": "WARNING",
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}

# Apply configuration once at startup
# logging.config.dictConfig(LOGGING_CONFIG)


# ============================================================
# Performance: lazy formatting and guards
# ============================================================
logger = logging.getLogger("app.perf")

# GOOD — lazy formatting (string only built if level is enabled)
logger.debug("Processing %d items: %r", len(items := [1, 2, 3]), items)

# BAD — eager formatting (string always built, even if DEBUG is off)
# logger.debug(f"Processing {len(items)} items: {items}")

# Guard expensive operations
if logger.isEnabledFor(logging.DEBUG):
    # Only compute expensive_debug_info if DEBUG is enabled
    debug_data = json.dumps(large_object, indent=2)
    logger.debug("Full state dump:\\n%s", debug_data)`,
      exercise: `**Exercises:**

1. Set up a production logging configuration for a web application with three handlers: console (INFO+, colored), rotating file (DEBUG+, 10MB max, 5 backups), and a separate error file (ERROR+ only). Use \`dictConfig\`.

2. Create a \`JSONFormatter\` class that outputs structured JSON log lines with fields: timestamp, level, logger name, message, and any extra context fields. Test it with a \`LoggerAdapter\` that adds \`request_id\` and \`user_id\`.

3. Implement a custom logging \`Filter\` that: (a) redacts sensitive fields like passwords and tokens from log messages, (b) adds the current thread name, and (c) drops log records from a specific noisy logger.

4. Build a \`@log_call\` decorator that logs function entry (with arguments), exit (with return value and duration), and exceptions (with traceback). Use \`functools.wraps\` and handle both sync and async functions.

5. Write a performance benchmark comparing: (a) \`logger.debug("msg %s", val)\` (lazy), (b) \`logger.debug(f"msg {val}")\` (eager), and (c) guarded \`if logger.isEnabledFor(DEBUG)\` for an expensive computation. Measure with \`timeit\` at both DEBUG and WARNING levels.

6. Create a logging setup that sends ERROR+ logs to an external service (simulate with an HTTP POST to a local endpoint) using a \`QueueHandler\` + \`QueueListener\` pattern so logging never blocks the main application thread.`,
      commonMistakes: [
        "Using f-strings in log calls: `logger.info(f'User {user_id} logged in')`. This eagerly formats the string even if the log level is disabled. Use `%`-style: `logger.info('User %s logged in', user_id)` — formatting is deferred until the message is actually emitted.",
        "Calling `logging.basicConfig()` in library code. `basicConfig` configures the ROOT logger and should only be called once in the application's entry point. Libraries should only create loggers with `getLogger(__name__)` and let the application configure handlers.",
        "Not setting `propagate = False` when adding handlers to child loggers. By default, log records propagate up to parent loggers. If both the child and root logger have handlers, you get duplicate log lines. Set `propagate = False` on loggers that have their own handlers.",
        "Silencing exceptions with `logger.error(str(e))` instead of `logger.error('Message', exc_info=True)`. The former loses the traceback entirely. `exc_info=True` includes the full stack trace in the log, which is essential for debugging production issues.",
        "Configuring logging after importing other modules. Python's logging configuration should happen as early as possible in the application startup. Modules imported before `basicConfig`/`dictConfig` may already have cached logger references with default (WARNING) configuration.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the Python logging hierarchy. What happens when you call `logger.info()` on a child logger?",
          a: "Python loggers form a **dot-separated hierarchy**: `app` is the parent of `app.db`, which is the parent of `app.db.queries`. The root logger is the ancestor of all loggers. When `logger.info()` is called: 1) The logger checks its **effective level** (own level, or nearest ancestor's level if not set). 2) If the level passes, a `LogRecord` is created. 3) The record is passed to the logger's **handlers**. 4) If `propagate=True` (default), the record is passed up to the **parent logger's handlers**, and so on to the root. This propagation is why you get duplicate logs — both the child's handler and the root's handler emit the same record. Set `propagate=False` on loggers that have their own handlers, or only attach handlers to the root logger.",
        },
        {
          type: "tricky",
          q: "Why should you use `logger.debug('msg %s', value)` instead of `logger.debug(f'msg {value}')`?",
          a: "**Performance:** With `%`-style formatting, the string is **only formatted if the log level is enabled**. If the logger's effective level is `INFO`, the `DEBUG` message is discarded before `%s` substitution happens — zero formatting cost. With f-strings, the string is **always formatted** (Python evaluates f-strings eagerly at call time), even if the message will be immediately discarded. For hot code paths with complex objects (e.g., `f'{large_dict}'`), this can be a significant performance difference. **Additionally:** `%`-style is the standard for the logging module, and log aggregation tools like Sentry can group messages by their unformatted template (`'msg %s'`), treating all variations as the same event. F-strings produce unique strings that can't be grouped.",
        },
        {
          type: "coding",
          q: "Write a decorator `@log_call` that logs function entry with arguments, exit with return value and duration, and any exceptions with traceback.",
          a: "\`\`\`python\nimport functools\nimport logging\nimport time\n\ndef log_call(logger=None, level=logging.DEBUG):\n    def decorator(func):\n        nonlocal logger\n        if logger is None:\n            logger = logging.getLogger(func.__module__)\n\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            func_name = func.__qualname__\n            logger.log(level, 'Calling %s(args=%r, kwargs=%r)',\n                       func_name, args, kwargs)\n            start = time.perf_counter()\n            try:\n                result = func(*args, **kwargs)\n                elapsed = (time.perf_counter() - start) * 1000\n                logger.log(level, '%s returned %r (%.2fms)',\n                           func_name, result, elapsed)\n                return result\n            except Exception:\n                elapsed = (time.perf_counter() - start) * 1000\n                logger.exception('%s raised after %.2fms',\n                                 func_name, elapsed)\n                raise\n        return wrapper\n    return decorator\n\n@log_call(level=logging.INFO)\ndef divide(a, b):\n    return a / b\n\`\`\`\nKey details: `functools.wraps` preserves the original function's metadata. `logger.exception` automatically includes `exc_info=True`. `time.perf_counter()` is the highest-resolution timer.",
        },
        {
          type: "scenario",
          q: "Your application logs are causing I/O bottlenecks under high load. How would you optimize logging without losing messages?",
          a: "1) **`QueueHandler` + `QueueListener`** — the recommended solution. `QueueHandler` puts log records into a `queue.Queue` (non-blocking). A background `QueueListener` thread drains the queue and dispatches to actual handlers (file, network). This decouples the application thread from I/O. 2) **Increase log level** in production — `INFO` instead of `DEBUG` to reduce volume. 3) **Use `isEnabledFor()` guards** around expensive debug computations. 4) **Async handlers** — for network-based handlers (Datadog, ELK), use async I/O or batch multiple records into single HTTP requests. 5) **Sampling** — for extremely high-throughput services, log only a percentage of records (e.g., every 100th request at DEBUG). 6) **`MemoryHandler`** — buffers records and flushes in batches to the target handler, reducing I/O syscalls. 7) **Use `%`-style formatting** (not f-strings) to avoid unnecessary string allocation.",
        },
      ],
    },
  ],
};

export default pyPhase5;
