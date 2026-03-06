const pyPhase12 = {
  id: "phase-12",
  title: "Phase 12: Design Patterns & Architecture",
  emoji: "🏛️",
  description:
    "Apply proven design patterns in Python — creational, structural, and behavioral patterns, SOLID principles, and project organization.",
  topics: [
    {
      id: "py-design-patterns",
      title: "Design Patterns in Python",
      explanation: `Design patterns are **reusable solutions to commonly occurring problems** in software design. In Python, many classic GoF (Gang of Four) patterns are simplified or even unnecessary thanks to the language's dynamic nature — first-class functions, duck typing, and built-in decorators replace verbose class hierarchies.

**Categories of design patterns:**

| Category | Purpose | Key Patterns |
|----------|---------|-------------|
| **Creational** | Object creation mechanisms | Singleton, Factory, Builder, Prototype |
| **Structural** | Object composition & relationships | Adapter, Decorator, Facade, Proxy |
| **Behavioral** | Communication between objects | Observer, Strategy, Command, Iterator |

**Pythonic pattern simplifications:**
- The **Strategy pattern** is often replaced by passing functions directly (first-class functions)
- The **Iterator pattern** is built into Python via \`__iter__\` / \`__next__\` and generators
- The **Decorator pattern** maps naturally to Python's \`@decorator\` syntax
- The **Observer pattern** can leverage \`__set_name__\` descriptors or signals libraries

**Singleton pattern** restricts a class to a single instance. In Python, you can use a module-level instance (modules are singletons by nature), a metaclass, or \`__new__\` override. However, singletons are often considered an anti-pattern — prefer **dependency injection** for testability.

**Factory pattern** delegates object creation to a factory function or class, decoupling the client from concrete implementations. Python's dynamic typing and duck typing make factories lightweight — a simple function returning different objects based on input is often sufficient.

**Observer pattern** defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified. Python implementations often use callback lists, \`weakref\` to avoid memory leaks, or third-party libraries like \`blinker\`.

**When to use patterns:** Apply patterns when you recognize the problem they solve, not preemptively. Over-engineering with patterns is as harmful as ignoring them entirely. Python's motto — "simple is better than complex" — applies.`,
      codeExample: `# ============================================================
# Design Patterns in Python — Practical Implementations
# ============================================================

from abc import ABC, abstractmethod
from typing import Any, Callable
import weakref


# --- Singleton Pattern (using __new__) ---
class DatabaseConnection:
    """Only one database connection instance exists."""
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, connection_string: str = "sqlite:///default.db"):
        if self._initialized:
            return
        self.connection_string = connection_string
        self._initialized = True
        print(f"Connected to {connection_string}")


# Both variables point to the same instance
db1 = DatabaseConnection("postgres://localhost/mydb")
db2 = DatabaseConnection("postgres://other")  # Ignored — already initialized
assert db1 is db2  # True


# --- Factory Pattern ---
class Serializer(ABC):
    @abstractmethod
    def serialize(self, data: dict) -> str: ...

class JSONSerializer(Serializer):
    def serialize(self, data: dict) -> str:
        import json
        return json.dumps(data, indent=2)

class XMLSerializer(Serializer):
    def serialize(self, data: dict) -> str:
        items = "".join(f"  <{k}>{v}</{k}>\\n" for k, v in data.items())
        return f"<root>\\n{items}</root>"

class CSVSerializer(Serializer):
    def serialize(self, data: dict) -> str:
        header = ",".join(data.keys())
        values = ",".join(str(v) for v in data.values())
        return f"{header}\\n{values}"

def create_serializer(format_type: str) -> Serializer:
    """Factory function — decouples creation from usage."""
    serializers = {
        "json": JSONSerializer,
        "xml": XMLSerializer,
        "csv": CSVSerializer,
    }
    cls = serializers.get(format_type)
    if cls is None:
        raise ValueError(f"Unknown format: {format_type}")
    return cls()

# Usage — client code doesn't know concrete classes
data = {"name": "Alice", "age": 30, "role": "Engineer"}
for fmt in ("json", "xml", "csv"):
    serializer = create_serializer(fmt)
    print(f"--- {fmt.upper()} ---")
    print(serializer.serialize(data))


# --- Observer Pattern ---
class EventEmitter:
    """Lightweight observer using weak references."""

    def __init__(self):
        self._listeners: dict[str, list] = {}

    def on(self, event: str, callback: Callable) -> None:
        self._listeners.setdefault(event, []).append(callback)

    def emit(self, event: str, *args, **kwargs) -> None:
        for callback in self._listeners.get(event, []):
            callback(*args, **kwargs)

    def off(self, event: str, callback: Callable) -> None:
        listeners = self._listeners.get(event, [])
        self._listeners[event] = [cb for cb in listeners if cb != callback]

# Usage
emitter = EventEmitter()

def on_user_created(user: dict):
    print(f"Welcome email sent to {user['email']}")

def on_user_created_log(user: dict):
    print(f"[LOG] User created: {user['name']}")

emitter.on("user_created", on_user_created)
emitter.on("user_created", on_user_created_log)
emitter.emit("user_created", {"name": "Bob", "email": "bob@example.com"})


# --- Strategy Pattern (Pythonic — just pass functions) ---
def sort_users(users: list[dict], strategy: Callable) -> list[dict]:
    """Strategy pattern via first-class functions."""
    return sorted(users, key=strategy)

users = [
    {"name": "Charlie", "age": 25},
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 22},
]

by_name = sort_users(users, strategy=lambda u: u["name"])
by_age = sort_users(users, strategy=lambda u: u["age"])
print("By name:", [u["name"] for u in by_name])
print("By age:", [u["name"] for u in by_age])


# --- Decorator Pattern (class-based, not @decorator syntax) ---
class NotificationService:
    def send(self, message: str) -> str:
        return f"Sending: {message}"

class LoggingDecorator:
    """Wraps a service, adding logging behavior."""
    def __init__(self, wrapped: NotificationService):
        self._wrapped = wrapped

    def send(self, message: str) -> str:
        print(f"[LOG] About to send: {message}")
        result = self._wrapped.send(message)
        print(f"[LOG] Sent successfully")
        return result

service = LoggingDecorator(NotificationService())
service.send("Hello, World!")`,
      exercise: `**Exercises:**

1. Implement a **Registry pattern** — create a class \`PluginRegistry\` where plugins register themselves with a decorator (\`@PluginRegistry.register\`). Write 3 sample plugins and retrieve them by name.

2. Build a **Builder pattern** for constructing an \`HTTPRequest\` object with method chaining: \`Request().method("POST").url("/api/users").header("Content-Type", "application/json").body(data).build()\`.

3. Implement the **Observer pattern** for a stock price tracker. When a stock price changes, notify all registered observers (e.g., \`EmailAlert\`, \`DashboardUpdate\`, \`LogWriter\`). Use \`weakref\` to avoid memory leaks.

4. Refactor the Strategy pattern example to support a **discount calculation** system: \`PercentageDiscount\`, \`FixedDiscount\`, \`BuyOneGetOneFree\`. Implement both a class-based and a function-based approach, then compare readability.

5. Create a **Proxy pattern** that wraps a \`DatabaseService\` class, adding caching (return cached results for repeated queries) and access control (check user permissions before executing queries).`,
      commonMistakes: [
        "Over-engineering with patterns — forcing a Strategy class hierarchy when a simple function parameter would suffice. Python's first-class functions eliminate the need for many classic patterns.",
        "Implementing Singleton with global variables instead of controlling instantiation. Module-level instances are the most Pythonic singleton approach.",
        "Using the Observer pattern without weak references, causing memory leaks when observers are deleted but still referenced by the subject.",
        "Applying GoF patterns verbatim from Java/C++ without adapting to Python idioms. Python's duck typing, decorators, and closures replace many structural patterns.",
        "Not considering testability — Singletons and global state make unit testing difficult. Prefer dependency injection over Singletons.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Python's dynamic nature simplify classic design patterns?",
          a: "Python's **first-class functions** replace Strategy and Command patterns — just pass a callable. **Duck typing** eliminates many Adapter patterns since objects don't need shared interfaces. The built-in **decorator syntax** (\`@decorator\`) natively supports the Decorator pattern. **Generators** implement the Iterator pattern implicitly. **Metaclasses** and \`__new__\` enable Singleton without the complexity of Java's synchronized blocks. The **module system** itself acts as a Singleton (modules are cached in \`sys.modules\`). Overall, Python needs fewer formal patterns because the language features cover many of the same use cases.",
        },
        {
          type: "tricky",
          q: "Why are Singletons often considered an anti-pattern? What alternatives exist in Python?",
          a: "Singletons create **hidden global state**, making code harder to test (you can't inject mocks easily), harder to reason about (any code can mutate shared state), and harder to parallelize (shared mutable state requires locking). **Alternatives:** (1) **Dependency injection** — pass the shared instance as a parameter. (2) **Module-level instances** — create the object at module scope and import it (modules are cached by default). (3) **Borg pattern** — share state across instances via a shared \`__dict__\` instead of enforcing single instance. (4) **Factory + scoping** — create instances in a factory with controlled lifetime (e.g., per-request in web apps).",
        },
        {
          type: "scenario",
          q: "You are designing a notification system that sends alerts via email, SMS, Slack, and push notifications. Which design pattern(s) would you use and why?",
          a: "Use a combination of **Strategy** and **Observer** patterns. The **Observer pattern** lets multiple notification channels subscribe to events — when an alert triggers, all subscribed channels are notified. The **Strategy pattern** (or simply first-class functions in Python) handles the different sending mechanisms — each channel implements a \`send()\` method. A **Factory** can instantiate the right notifier based on configuration. In Python, this could be as simple as: a dict mapping channel names to callables, an event emitter that iterates through subscribers, and a config file specifying which channels are active. For extensibility, new channels just register themselves — no existing code changes needed (Open/Closed Principle).",
        },
      ],
    },
    {
      id: "py-solid-principles",
      title: "SOLID Principles & Clean Code",
      explanation: `The **SOLID principles** are five design guidelines that help developers write maintainable, extensible, and testable object-oriented code. While originally formulated for statically-typed languages, they apply equally well to Python — with some Pythonic adaptations.

**The SOLID principles:**

| Principle | Name | Core Idea |
|-----------|------|-----------|
| **S** | Single Responsibility | A class should have only one reason to change |
| **O** | Open/Closed | Open for extension, closed for modification |
| **L** | Liskov Substitution | Subtypes must be substitutable for their base types |
| **I** | Interface Segregation | Many specific interfaces beat one general-purpose interface |
| **D** | Dependency Inversion | Depend on abstractions, not concrete implementations |

**Single Responsibility Principle (SRP):** Each class or function should do exactly one thing. If a class handles user authentication *and* sends emails, split it. In Python, functions are often the right unit of responsibility — not everything needs to be a class.

**Open/Closed Principle (OCP):** Extend behavior without modifying existing code. In Python, this means using **composition over inheritance**, plugin registries, or strategy functions. The \`@functools.singledispatch\` decorator is a built-in example — add new type handlers without touching the original function.

**Liskov Substitution Principle (LSP):** A subclass must honor the contract of its parent. If \`Rectangle\` has a \`set_width()\` method, a \`Square\` subclass shouldn't break callers that expect width and height to be independent. In Python, use **Protocol** classes or ABCs to define explicit contracts.

**Interface Segregation Principle (ISP):** Don't force classes to implement methods they don't need. Python uses **duck typing** and **Protocol** classes (PEP 544) instead of Java-style interfaces — define small, focused protocols.

**Dependency Inversion Principle (DIP):** High-level modules shouldn't depend on low-level modules; both should depend on abstractions. In Python, pass dependencies as constructor arguments or use **Protocol** types for type hints.

**Clean code practices:** Use descriptive names, keep functions short (under 20 lines ideally), avoid deep nesting (use early returns), write docstrings, and prefer **composition over inheritance** — Python's mixin and protocol patterns make this natural.`,
      codeExample: `# ============================================================
# SOLID Principles in Python — Practical Examples
# ============================================================

from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable
from dataclasses import dataclass


# --- S: Single Responsibility Principle ---

# BAD: One class doing everything
class UserManagerBad:
    def create_user(self, name, email):
        # Validates, saves to DB, sends email — too many responsibilities
        pass

# GOOD: Separate responsibilities
@dataclass
class User:
    name: str
    email: str

class UserValidator:
    def validate(self, user: User) -> bool:
        if not user.name or len(user.name) < 2:
            raise ValueError("Name must be at least 2 characters")
        if "@" not in user.email:
            raise ValueError("Invalid email address")
        return True

class UserRepository:
    def __init__(self):
        self._users: dict[str, User] = {}

    def save(self, user: User) -> None:
        self._users[user.email] = user

    def find_by_email(self, email: str) -> User | None:
        return self._users.get(email)

class EmailService:
    def send_welcome(self, user: User) -> None:
        print(f"Welcome email sent to {user.email}")


# --- O: Open/Closed Principle ---

# Using functools.singledispatch for extensibility
from functools import singledispatch

@dataclass
class TextReport:
    content: str

@dataclass
class HTMLReport:
    html: str

@dataclass
class PDFReport:
    binary_data: bytes

@singledispatch
def export_report(report) -> str:
    raise NotImplementedError(f"No exporter for {type(report)}")

@export_report.register(TextReport)
def _(report: TextReport) -> str:
    return report.content

@export_report.register(HTMLReport)
def _(report: HTMLReport) -> str:
    return f"<html><body>{report.html}</body></html>"

# Extend without modifying existing code — just add new registrations
@export_report.register(PDFReport)
def _(report: PDFReport) -> str:
    return f"PDF ({len(report.binary_data)} bytes)"


# --- L: Liskov Substitution Principle ---

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height

    def area(self) -> float:
        return self._width * self._height

class Circle(Shape):
    def __init__(self, radius: float):
        self._radius = radius

    def area(self) -> float:
        import math
        return math.pi * self._radius ** 2

# Any Shape can be used interchangeably
def print_total_area(shapes: list[Shape]) -> None:
    total = sum(s.area() for s in shapes)
    print(f"Total area: {total:.2f}")

print_total_area([Rectangle(3, 4), Circle(5), Rectangle(2, 6)])


# --- I: Interface Segregation with Protocols ---

@runtime_checkable
class Readable(Protocol):
    def read(self) -> str: ...

@runtime_checkable
class Writable(Protocol):
    def write(self, data: str) -> None: ...

class FileStorage:
    """Implements both Readable and Writable."""
    def __init__(self):
        self._data = ""

    def read(self) -> str:
        return self._data

    def write(self, data: str) -> None:
        self._data = data

class ReadOnlyCache:
    """Only implements Readable — not forced to implement write."""
    def __init__(self, data: str):
        self._data = data

    def read(self) -> str:
        return self._data

def display(source: Readable) -> None:
    """Depends only on what it needs — Readable."""
    print(f"Content: {source.read()}")

display(FileStorage())       # Works
display(ReadOnlyCache("hi")) # Works — no unused write() method


# --- D: Dependency Inversion Principle ---

class NotificationSender(Protocol):
    def send(self, to: str, message: str) -> None: ...

class EmailSender:
    def send(self, to: str, message: str) -> None:
        print(f"Email to {to}: {message}")

class SMSSender:
    def send(self, to: str, message: str) -> None:
        print(f"SMS to {to}: {message}")

class UserService:
    """Depends on abstraction (Protocol), not concrete sender."""
    def __init__(self, notifier: NotificationSender):
        self._notifier = notifier

    def register(self, user: User) -> None:
        # Business logic...
        self._notifier.send(user.email, f"Welcome, {user.name}!")

# Easy to swap implementations and mock in tests
user_svc = UserService(notifier=EmailSender())
user_svc.register(User("Alice", "alice@example.com"))

user_svc_sms = UserService(notifier=SMSSender())
user_svc_sms.register(User("Bob", "555-0123"))`,
      exercise: `**Exercises:**

1. Take this monolithic class and refactor it to follow SRP: a \`ReportManager\` class that fetches data from a database, applies business rules, formats the output as HTML, and sends it via email. Split it into at least 4 classes.

2. Implement an OCP-compliant **payment processing** system. Start with \`CreditCardPayment\` and \`PayPalPayment\`, then add \`CryptoPayment\` without modifying existing code. Use a registry pattern or \`singledispatch\`.

3. Demonstrate a **Liskov Substitution violation**: create a \`Bird\` base class with a \`fly()\` method, then a \`Penguin\` subclass. Show why this violates LSP and refactor using Protocols to fix it.

4. Refactor a "fat interface" into segregated protocols. Start with a single \`IDatabase\` class that has \`read()\`, \`write()\`, \`delete()\`, \`backup()\`, and \`replicate()\` methods. Split into focused protocols and show a class that only implements the ones it needs.

5. Apply Dependency Inversion to a logging system. Create a \`LogSink\` protocol with implementations for console, file, and remote HTTP logging. Build an \`Application\` class that accepts any \`LogSink\` via constructor injection.

6. Review one of your past Python projects and identify at least 3 SOLID violations. Document each violation and propose a refactored solution.`,
      commonMistakes: [
        "Creating classes for everything — in Python, functions and modules can fulfill SRP without unnecessary class wrappers. Not everything needs to be a class.",
        "Violating Liskov Substitution by having subclasses raise NotImplementedError for inherited methods. If a subclass can't support a parent's interface, the hierarchy is wrong.",
        "Confusing Dependency Inversion with Dependency Injection. DIP is the principle (depend on abstractions); DI is the technique (pass dependencies in). You can practice DI without following DIP.",
        "Over-segregating interfaces — creating one Protocol per method leads to fragmented code that's harder to understand. Group related behaviors logically.",
        "Applying SOLID rigidly to small scripts or prototypes. These principles shine in large codebases; for a 50-line script, pragmatism beats purity.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the Open/Closed Principle with a Python-specific example.",
          a: "The OCP states that software entities should be **open for extension but closed for modification**. In Python, \`functools.singledispatch\` is a perfect example: you define a base function and register new type handlers without changing the original. Another approach: define a base class or Protocol, then add new subclasses. Plugin registries (dict mapping names to callables) also follow OCP — adding a new plugin means registering it, not editing a switch statement. Python's duck typing naturally supports OCP since new classes just need to implement the expected methods without modifying any interface definition.",
        },
        {
          type: "tricky",
          q: "How do Python Protocols differ from Abstract Base Classes (ABCs), and when would you choose one over the other?",
          a: "**ABCs** use nominal subtyping — classes must explicitly inherit from the ABC (e.g., \`class MyList(Sequence)\`). They can enforce implementation at class creation time and provide default method implementations. **Protocols** (PEP 544) use structural subtyping — any class that implements the required methods satisfies the Protocol, no inheritance needed. Choose **ABCs** when you want to enforce a contract and provide shared behavior (template method pattern). Choose **Protocols** when you want duck typing with type safety — especially for third-party classes you can't modify. Protocols are more Pythonic and flexible; ABCs are more explicit and enforcing.",
        },
        {
          type: "scenario",
          q: "Your team's codebase has a 2,000-line 'god class' that handles user management, billing, notifications, and reporting. How would you refactor it using SOLID?",
          a: "Start with **SRP**: identify distinct responsibilities and extract them into separate classes — \`UserService\`, \`BillingService\`, \`NotificationService\`, \`ReportingService\`. Apply **DIP**: define Protocols for each service interface so they depend on abstractions (e.g., \`NotificationSender\` protocol). Apply **ISP**: ensure each service only exposes methods relevant to its consumers. Use **OCP**: make notification channels pluggable via a registry instead of hardcoded switch statements. Refactor incrementally — extract one responsibility at a time, add tests for each extracted class, and use the **Strangler Fig pattern** (gradually replace the god class's methods with delegations to new services until it's empty).",
        },
        {
          type: "conceptual",
          q: "Why is composition generally preferred over inheritance in Python?",
          a: 'Inheritance creates **tight coupling** — changes to the parent class ripple through all subclasses. Deep hierarchies become fragile and hard to understand (**fragile base class problem**). Composition is more flexible: you can combine behaviors at runtime, swap implementations easily, and test components in isolation. Python supports composition naturally via duck typing — an object just needs the right methods, no inheritance required. **Mixins** (multiple inheritance of small behavior classes) are Python\'s middle ground, but even these can cause complexity with MRO (Method Resolution Order). The rule of thumb: use inheritance for "is-a" relationships (a \`Dog\` is an \`Animal\`), composition for "has-a" relationships (a \`Car\` has an \`Engine\`).',
        },
      ],
    },
    {
      id: "py-project-structure",
      title: "Project Structure & Packaging",
      explanation: `A well-organized Python project structure makes code easier to navigate, test, import, and distribute. The modern Python ecosystem has converged on the **src layout** and **pyproject.toml** as the standard approach for professional projects.

**The src layout:**

\`\`\`
my-project/
\u251c\u2500\u2500 src/
\u2502   \u2514\u2500\u2500 my_package/
\u2502       \u251c\u2500\u2500 __init__.py
\u2502       \u251c\u2500\u2500 core.py
\u2502       \u2514\u2500\u2500 utils.py
\u251c\u2500\u2500 tests/
\u2502   \u251c\u2500\u2500 test_core.py
\u2502   \u2514\u2500\u2500 test_utils.py
\u251c\u2500\u2500 pyproject.toml
\u251c\u2500\u2500 README.md
\u2514\u2500\u2500 LICENSE
\`\`\`

The src layout prevents **accidental imports** from the project root — tests always import the installed version of your package, catching packaging errors early.

**pyproject.toml** (PEP 621) is the modern unified configuration file for Python projects, replacing \`setup.py\`, \`setup.cfg\`, \`MANIFEST.in\`, and scattered tool configs:

| Section | Purpose |
|---------|---------|
| \`[project]\` | Name, version, description, dependencies |
| \`[build-system]\` | Build backend (setuptools, hatchling, flit, maturin) |
| \`[tool.pytest]\` | Pytest configuration |
| \`[tool.ruff]\` | Linter/formatter settings |
| \`[tool.mypy]\` | Type checking configuration |

**Modern dependency management tools:**

| Tool | Strengths | Lock File |
|------|-----------|-----------|
| **Poetry** | Mature, deterministic builds, virtual env management | \`poetry.lock\` |
| **uv** | Extremely fast (Rust-based), pip-compatible, growing rapidly | \`uv.lock\` |
| **PDM** | PEP 582 support, flexible backends | \`pdm.lock\` |
| **pip-tools** | Minimal, compiles requirements | \`requirements.txt\` |

**Publishing to PyPI:** Build with \`python -m build\` (creates wheel + sdist), then upload with \`twine upload dist/*\`. Modern tools like Poetry (\`poetry publish\`) and uv simplify this to one command. Always use **TestPyPI** first for validation.

**Key files:** \`__init__.py\` marks directories as packages and controls the public API via \`__all__\`. \`py.typed\` marker file signals that your package ships type stubs. \`.python-version\` pins the Python version for tools like pyenv and uv.`,
      codeExample: `# ============================================================
# Modern Python Project Structure & Configuration
# ============================================================

# --- pyproject.toml (the single source of truth) ---
# File: pyproject.toml

"""
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-awesome-lib"
version = "1.0.0"
description = "A well-structured Python library"
readme = "README.md"
license = {text = "MIT"}
requires-python = ">=3.11"
authors = [
    {name = "Your Name", email = "you@example.com"},
]
dependencies = [
    "httpx>=0.27",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "ruff>=0.5",
    "mypy>=1.10",
    "pre-commit>=3.7",
]
docs = [
    "mkdocs>=1.6",
    "mkdocs-material>=9.5",
]

[project.scripts]
my-cli = "my_awesome_lib.cli:main"

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
addopts = "-v --tb=short"

[tool.ruff]
target-version = "py311"
line-length = 88
src = ["src"]

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM"]

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
"""


# --- src/my_awesome_lib/__init__.py ---
# Controls the public API of your package

"""My Awesome Library — a well-structured example."""

__version__ = "1.0.0"
__all__ = ["Client", "Config", "process_data"]

from my_awesome_lib.client import Client
from my_awesome_lib.config import Config
from my_awesome_lib.core import process_data


# --- src/my_awesome_lib/config.py ---
from dataclasses import dataclass, field
from pathlib import Path
import tomllib  # Python 3.11+ built-in TOML parser


@dataclass(frozen=True)
class Config:
    """Immutable application configuration."""
    base_url: str = "https://api.example.com"
    timeout: int = 30
    retries: int = 3
    debug: bool = False
    cache_dir: Path = field(default_factory=lambda: Path.home() / ".cache" / "mylib")

    @classmethod
    def from_toml(cls, path: Path) -> "Config":
        """Load configuration from a TOML file."""
        with open(path, "rb") as f:
            data = tomllib.load(f)
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})

    def __post_init__(self):
        self.cache_dir.mkdir(parents=True, exist_ok=True)


# --- src/my_awesome_lib/core.py ---
from typing import Any
import logging

logger = logging.getLogger(__name__)


def process_data(raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Process and validate raw data entries."""
    results = []
    for item in raw:
        if not item.get("id"):
            logger.warning("Skipping item without ID: %s", item)
            continue
        results.append({
            "id": item["id"],
            "name": str(item.get("name", "")).strip(),
            "active": bool(item.get("active", True)),
        })
    logger.info("Processed %d/%d items", len(results), len(raw))
    return results


# --- src/my_awesome_lib/client.py ---
from my_awesome_lib.config import Config


class Client:
    """HTTP client for the API."""
    def __init__(self, config: Config | None = None):
        self.config = config or Config()

    def get(self, endpoint: str) -> dict:
        """Make a GET request (simplified example)."""
        url = f"{self.config.base_url}/{endpoint.lstrip('/')}"
        print(f"GET {url} (timeout={self.config.timeout}s)")
        return {"status": "ok"}


# --- Common CLI Commands ---

# Initialize a new project with uv
# uv init my-project && cd my-project

# Add dependencies
# uv add httpx pydantic
# uv add --dev pytest ruff mypy

# Build the package
# uv build  # or: python -m build

# Publish to TestPyPI first
# uv publish --publish-url https://test.pypi.org/legacy/

# Publish to PyPI
# uv publish`,
      exercise: `**Exercises:**

1. Create a complete project from scratch using \`uv init\` (or \`poetry new\`). Add \`httpx\` and \`pydantic\` as dependencies, \`pytest\` and \`ruff\` as dev dependencies. Write a \`pyproject.toml\` with all tool configurations.

2. Convert a flat Python script into a proper src-layout package with \`__init__.py\`, separate modules for config, core logic, and CLI entry point. Add a \`[project.scripts]\` entry so it installs as a CLI command.

3. Write a comprehensive \`__init__.py\` that uses \`__all__\` to define the public API. Import key classes and functions to make them available at the package level (e.g., \`from mylib import Client\` instead of \`from mylib.client import Client\`).

4. Set up a pre-commit configuration (\`.pre-commit-config.yaml\`) that runs ruff (linting + formatting), mypy (type checking), and pytest on every commit. Test it by making a commit with a linting error.

5. Create a minimal Python package and publish it to **TestPyPI**. Verify you can install it with \`pip install --index-url https://test.pypi.org/simple/ your-package\`.`,
      commonMistakes: [
        "Using the flat layout (package at project root) instead of src layout. The flat layout allows tests to accidentally import from the source directory instead of the installed package, masking packaging bugs.",
        "Still using setup.py for new projects. pyproject.toml (PEP 621) is the modern standard — it consolidates project metadata, build configuration, and tool settings in one file.",
        "Forgetting __init__.py files in Python packages, causing import failures. Even with implicit namespace packages (PEP 420), explicit __init__.py is recommended for clarity.",
        "Not pinning dependency versions in production. Use a lock file (poetry.lock, uv.lock) for reproducible builds. Specify version ranges in pyproject.toml but always commit the lock file.",
        "Publishing to PyPI without testing on TestPyPI first. Always validate your package metadata, dependencies, and installation flow on test.pypi.org before going live.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the purpose of the src layout in Python projects, and why is it preferred over a flat layout?",
          a: "The src layout places your package inside a \`src/\` directory rather than at the project root. This prevents **accidental imports** — when you run tests, Python won't find your package in the current directory, forcing it to use the installed version. This catches packaging errors early (e.g., missing files in the distribution). With a flat layout, tests might pass locally but fail after installation because they were importing directly from source. The src layout also cleanly separates source code from project metadata, tests, and configuration files.",
        },
        {
          type: "tricky",
          q: "What is the difference between a Python package, a module, a distribution, and a wheel?",
          a: "A **module** is a single \`.py\` file that can be imported. A **package** is a directory containing \`__init__.py\` (regular package) or any directory on the import path (namespace package). A **distribution** (or distribution package) is a versioned archive of a project for installation — the unit you upload to PyPI. A **wheel** (\`.whl\`) is a built distribution format (ZIP file with a specific naming convention) that installs faster than source distributions because it doesn't require a build step. An **sdist** (source distribution) contains raw source code and requires building. Always publish both wheel and sdist to PyPI.",
        },
        {
          type: "scenario",
          q: "You are starting a new internal Python library that will be used by 5 teams. How would you set up the project for long-term maintainability?",
          a: "Use the **src layout** with \`pyproject.toml\` as the single config file. Choose **uv** or **Poetry** for dependency management with a committed lock file. Set up **CI/CD** with: ruff for linting/formatting, mypy in strict mode for type checking, pytest with coverage thresholds, and automated publishing to an internal PyPI registry. Use **semantic versioning** and a CHANGELOG. Configure **pre-commit hooks** for consistent code quality. Define the public API via \`__all__\` in \`__init__.py\`. Add \`py.typed\` marker for type stub support. Write a \`CONTRIBUTING.md\` with development setup instructions. Use **GitHub Actions** or similar for automated testing on every PR. Consider a **monorepo** approach if the teams' libraries are tightly coupled.",
        },
      ],
    },
  ],
};

export default pyPhase12;
