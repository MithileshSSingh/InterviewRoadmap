const pyPhase6b = [
  {
    id: "py-metaclasses",
    title: "Metaclasses",
    explanation: `In Python, **everything is an object** \u2014 including classes themselves. A metaclass is the "class of a class." Just as a class defines how instances behave, a metaclass defines how classes behave. By default, all classes are instances of \`type\`.

**The relationship:**
\`\`\`python
class Foo:
    pass

type(Foo)       # <class 'type'>  \u2014 Foo is an instance of type
type(type)      # <class 'type'>  \u2014 type is its own metaclass
isinstance(Foo, type)  # True
\`\`\`

**\`type()\` as a class factory:**
\`type(name, bases, namespace)\` dynamically creates classes at runtime:
\`\`\`python
# These are equivalent:
class Dog:
    sound = "woof"
Dog = type("Dog", (), {"sound": "woof"})
\`\`\`

**\`__new__\` vs \`__init__\` in metaclasses:**

| Method | Called when | Receives | Purpose |
|---|---|---|---|
| \`__new__(mcs, name, bases, namespace)\` | Class is **created** | Class name, base classes, namespace dict | Control class creation, modify namespace |
| \`__init__(cls, name, bases, namespace)\` | Class is **initialized** | Same args, but class already exists | Post-creation setup |
| \`__call__(cls, *args, **kwargs)\` | Class is **instantiated** | Instance creation args | Control instance creation |

**When to use metaclasses:**
- Registering classes automatically (plugin systems, ORMs)
- Enforcing coding contracts (all subclasses must define certain methods)
- Modifying or wrapping methods at class creation time
- Implementing the descriptor protocol for frameworks

**\`ABCMeta\`** from the \`abc\` module is Python's built-in metaclass for abstract base classes. It tracks \`@abstractmethod\` decorators and prevents instantiation of classes that don't implement all abstract methods. You can combine custom metaclass logic with \`ABCMeta\` by inheriting from it.

**The metaclass search order:** Python checks for \`metaclass=\` in the class definition, then checks the first base class's metaclass, then defaults to \`type\`. If conflicting metaclasses are found, the most derived one must be a subclass of all others, or \`TypeError\` is raised.

Most Python developers rarely need custom metaclasses \u2014 class decorators, \`__init_subclass__\`, and descriptors cover most use cases with less complexity. Use metaclasses only when you need to intervene in class **creation** itself.`,
    codeExample: `# ============================================================
# Understanding type() as a class factory
# ============================================================
# Creating a class dynamically with type()
def greet(self):
    return f"Hello, I'm {self.name}"

Person = type("Person", (), {
    "species": "Homo sapiens",
    "__init__": lambda self, name: setattr(self, "name", name),
    "greet": greet,
    "__repr__": lambda self: f"Person({self.name!r})",
})

p = Person("Alice")
print(p.greet())      # Hello, I'm Alice
print(type(Person))   # <class 'type'>


# ============================================================
# Basic metaclass with __new__
# ============================================================
class RegistryMeta(type):
    """Metaclass that auto-registers all classes in a registry."""

    _registry: dict[str, type] = {}

    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        # Don't register the base class itself
        if bases:
            mcs._registry[name] = cls
        return cls

    @classmethod
    def get_registry(mcs) -> dict[str, type]:
        return dict(mcs._registry)


class Plugin(metaclass=RegistryMeta):
    """Base class for all plugins."""
    def execute(self):
        raise NotImplementedError


class AuthPlugin(Plugin):
    def execute(self):
        return "Authenticating..."


class CachePlugin(Plugin):
    def execute(self):
        return "Caching..."


class LogPlugin(Plugin):
    def execute(self):
        return "Logging..."


# All subclasses are automatically registered
print(RegistryMeta.get_registry())
# {'AuthPlugin': <class 'AuthPlugin'>, 'CachePlugin': ..., 'LogPlugin': ...}

# Instantiate by name (useful for config-driven architectures)
plugin_name = "AuthPlugin"
plugin_cls = RegistryMeta.get_registry()[plugin_name]
plugin = plugin_cls()
print(plugin.execute())  # "Authenticating..."


# ============================================================
# Metaclass with __init__ for validation
# ============================================================
class ValidatedMeta(type):
    """Metaclass that enforces coding contracts on classes."""

    def __init__(cls, name, bases, namespace):
        super().__init__(name, bases, namespace)

        # Skip validation for the base class
        if not bases:
            return

        # Enforce: all concrete classes must have a docstring
        if not cls.__doc__:
            raise TypeError(f"Class {name} must have a docstring")

        # Enforce: all concrete classes must define 'validate' method
        if "validate" not in namespace and not any(
            hasattr(base, "validate") for base in bases
        ):
            raise TypeError(f"Class {name} must implement validate()")


class Model(metaclass=ValidatedMeta):
    """Base model class."""
    def validate(self):
        pass


class UserModel(Model):
    """User data model with validation."""

    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

    def validate(self):
        if not self.name:
            raise ValueError("Name is required")
        if "@" not in self.email:
            raise ValueError("Invalid email")
        return True


# This would raise TypeError:
# class BadModel(Model):
#     pass  # No docstring! -> TypeError


# ============================================================
# Metaclass __call__ — controlling instance creation
# ============================================================
class SingletonMeta(type):
    """Metaclass that makes classes singletons."""

    _instances: dict[type, object] = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            # Create the instance using type.__call__
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class AppConfig(metaclass=SingletonMeta):
    def __init__(self, env: str = "production"):
        self.env = env
        self.settings = {}

    def set(self, key: str, value) -> None:
        self.settings[key] = value

    def get(self, key: str, default=None):
        return self.settings.get(key, default)


config1 = AppConfig("production")
config2 = AppConfig("staging")  # Ignored! Returns existing instance
print(config1 is config2)        # True
print(config2.env)               # "production" (not "staging")


# ============================================================
# __init_subclass__ — the simpler alternative to metaclasses
# ============================================================
class Serializable:
    """Base class that tracks all serializable subclasses."""

    _serializers: dict[str, type] = {}

    def __init_subclass__(cls, format_name: str = None, **kwargs):
        super().__init_subclass__(**kwargs)
        if format_name:
            cls._format = format_name
            Serializable._serializers[format_name] = cls

    @classmethod
    def get_serializer(cls, format_name: str):
        return cls._serializers.get(format_name)


class JSONSerializer(Serializable, format_name="json"):
    def serialize(self, data) -> str:
        import json
        return json.dumps(data)


class CSVSerializer(Serializable, format_name="csv"):
    def serialize(self, data) -> str:
        return ",".join(str(v) for v in data)


print(Serializable._serializers)
# {'json': <class 'JSONSerializer'>, 'csv': <class 'CSVSerializer'>}

serializer = Serializable.get_serializer("json")()
print(serializer.serialize({"key": "value"}))  # '{"key": "value"}'


# ============================================================
# ABCMeta — abstract base classes
# ============================================================
from abc import ABCMeta, abstractmethod, ABC


class Repository(ABC):
    """Abstract repository interface."""

    @abstractmethod
    def find_by_id(self, id: str):
        """Retrieve an entity by ID."""
        ...

    @abstractmethod
    def save(self, entity) -> None:
        """Persist an entity."""
        ...

    @abstractmethod
    def delete(self, id: str) -> bool:
        """Delete an entity by ID."""
        ...

    def find_all(self) -> list:
        """Default implementation — subclasses may override."""
        return []


class InMemoryUserRepo(Repository):
    """Concrete implementation using in-memory storage."""

    def __init__(self):
        self._store: dict[str, dict] = {}

    def find_by_id(self, id: str):
        return self._store.get(id)

    def save(self, entity) -> None:
        self._store[entity["id"]] = entity

    def delete(self, id: str) -> bool:
        return self._store.pop(id, None) is not None


# Repository()  # TypeError: Can't instantiate abstract class
repo = InMemoryUserRepo()
repo.save({"id": "1", "name": "Alice"})
print(repo.find_by_id("1"))  # {'id': '1', 'name': 'Alice'}


# ============================================================
# Combining metaclass features with __prepare__
# ============================================================
from collections import OrderedDict


class OrderedMeta(type):
    """Metaclass that preserves attribute definition order."""

    @classmethod
    def __prepare__(mcs, name, bases):
        # Return an OrderedDict so attribute order is tracked
        return OrderedDict()

    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, dict(namespace))
        cls._field_order = [
            key for key in namespace
            if not key.startswith("_") and not callable(namespace[key])
        ]
        return cls


class FormFields(metaclass=OrderedMeta):
    username = "text"
    email = "email"
    password = "password"
    confirm = "password"

print(FormFields._field_order)
# ['username', 'email', 'password', 'confirm']`,
    exercise: `**Exercises:**

1. Create a \`RegistryMeta\` metaclass that maintains a dictionary of all classes created with it. Add a class method \`create(name, **kwargs)\` to the base class that looks up the registry and instantiates the correct subclass by name.

2. Build a \`ValidatedModelMeta\` metaclass that inspects type annotations in class bodies and automatically generates \`__init__\` and \`validate\` methods. For example, \`name: str\` should ensure \`name\` is a string in \`validate()\`.

3. Implement the Singleton pattern using: (a) a metaclass, (b) a class decorator, and (c) \`__new__\`. Compare the three approaches in terms of inheritance behavior, thread safety, and debuggability.

4. Rewrite the \`RegistryMeta\` example using \`__init_subclass__\` instead of a metaclass. Discuss when \`__init_subclass__\` is sufficient and when you genuinely need a metaclass.

5. Create an abstract base class \`Shape\` with \`ABCMeta\` that requires \`area()\` and \`perimeter()\` methods. Add a concrete method \`description()\` that uses both. Implement \`Circle\`, \`Rectangle\`, and \`Triangle\` subclasses and verify that incomplete implementations raise \`TypeError\`.

6. Write a metaclass that automatically wraps all methods of a class with a timing decorator, but skips dunder methods. Test it with a class that has 5+ methods.`,
    commonMistakes: [
      "Using metaclasses when simpler alternatives exist. `__init_subclass__`, class decorators, and descriptors solve most class-customization problems without metaclass complexity. Reach for metaclasses only when you need to control the class creation process itself (e.g., modifying `__prepare__`, intercepting `__new__` before the class object exists).",
      "Confusing `__new__` and `__init__` in metaclasses. In a metaclass, `__new__` creates the **class object** (not an instance), and `__init__` initializes it after creation. In regular classes, `__new__` creates the **instance**. The `mcs`/`cls` parameter naming reflects this: `mcs` = metaclass, `cls` = the class being created.",
      "Metaclass conflicts when using multiple inheritance. If `Parent1` uses `MetaA` and `Parent2` uses `MetaB`, `class Child(Parent1, Parent2)` raises `TypeError` unless one meta is a subclass of the other. Fix by creating a combined metaclass: `class CombinedMeta(MetaA, MetaB): pass`.",
      "Forgetting that `__init_subclass__` runs at class creation time, not at instantiation time. Side effects in `__init_subclass__` (like registering plugins, modifying class attributes) happen when Python reads the class definition, which can cause issues with import order and circular dependencies.",
      "Not calling `super().__new__()` or `super().__init__()` in metaclass methods. Skipping the super call means `type`'s default behavior is bypassed, potentially creating malformed class objects that fail in subtle ways.",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is a metaclass in Python? How does `type` relate to classes and instances?",
        a: "A metaclass is the class of a class \u2014 it controls how classes are created and behave. In Python, `type` is the default metaclass. The relationship forms a chain: `instance` is an instance of `MyClass`, `MyClass` is an instance of `type` (its metaclass), and `type` is an instance of itself. When you write `class Foo: pass`, Python calls `type('Foo', (), {...})` to create the class object. A custom metaclass (inheriting from `type`) lets you intercept this creation to validate, modify, or register classes. The key methods are `__new__` (creates the class object), `__init__` (initializes it), `__call__` (controls instantiation of the class), and `__prepare__` (provides the namespace dict for the class body).",
      },
      {
        type: "tricky",
        q: "What is the difference between `__new__` and `__init__` in a metaclass vs. in a regular class?",
        a: "In a **regular class**: `__new__(cls)` creates and returns a new **instance** of the class (rarely overridden unless you're subclassing immutable types or implementing singletons). `__init__(self)` initializes the already-created instance. In a **metaclass**: `__new__(mcs, name, bases, namespace)` creates and returns a new **class object**. `__init__(cls, name, bases, namespace)` initializes the class after creation. The critical difference is **what** is being created: regular class `__new__` creates instances, metaclass `__new__` creates classes. The `__call__` method in a metaclass controls what happens when the class itself is called (i.e., when you do `MyClass()`) \u2014 by default it calls the class's `__new__` and `__init__`.",
      },
      {
        type: "scenario",
        q: "You're building an ORM framework. How would metaclasses help you map Python classes to database tables?",
        a: "The metaclass would: 1) **Inspect annotations** \u2014 `__new__` reads class attributes like `name: str`, `age: int` and creates `Column` descriptor objects for each. 2) **Generate table name** \u2014 derive from class name (e.g., `UserModel` -> `user_model` table). 3) **Register models** \u2014 maintain a global registry mapping table names to model classes. 4) **Create SQL schema** \u2014 generate `CREATE TABLE` statements from column definitions. 5) **Add CRUD methods** \u2014 inject `save()`, `delete()`, `find()` methods. 6) **Validate constraints** \u2014 ensure required fields have defaults or are marked nullable. `__prepare__` could return an `OrderedDict` to preserve column order. Django's ORM uses exactly this pattern \u2014 `ModelBase` metaclass processes `Field` objects defined in model classes. SQLAlchemy's declarative base similarly uses a metaclass (`DeclarativeMeta`) to map class attributes to table columns.",
      },
    ],
  },
  {
    id: "py-type-hints-advanced",
    title: "Advanced Type Hints",
    explanation: `Python's type system has evolved dramatically since PEP 484 introduced type hints in Python 3.5. Modern Python (3.10+) offers a rich, expressive type system that catches bugs at development time through static analysis tools like **mypy**, **pyright**, and **Pytype** \u2014 without any runtime performance cost.

**Core advanced typing constructs:**

| Construct | Purpose | Example |
|---|---|---|
| \`TypeVar\` | Generic type parameter | \`T = TypeVar("T")\` |
| \`Generic[T]\` | Base for generic classes | \`class Box(Generic[T])\` |
| \`Protocol\` | Structural subtyping (duck typing) | \`class Drawable(Protocol)\` |
| \`TypeAlias\` | Explicit type alias | \`Vector: TypeAlias = list[float]\` |
| \`Literal\` | Restrict to specific values | \`Literal["read", "write"]\` |
| \`TypeGuard\` | Custom type narrowing | \`def is_str(x) -> TypeGuard[str]\` |
| \`overload\` | Multiple signatures | Different return types per input |
| \`ParamSpec\` | Preserve callable signatures | Decorator typing |

**\`Protocol\` vs \`ABC\`:**
- \`ABC\` uses **nominal subtyping** \u2014 classes must explicitly inherit from the ABC
- \`Protocol\` uses **structural subtyping** \u2014 any class with matching methods is compatible, no inheritance required (true duck typing for the type checker)

**\`TypeVar\` constraints and bounds:**
- \`T = TypeVar("T")\` \u2014 unconstrained, any type
- \`T = TypeVar("T", int, str)\` \u2014 constrained to exactly \`int\` or \`str\`
- \`T = TypeVar("T", bound=Comparable)\` \u2014 bounded, must be subtype of \`Comparable\`

**Runtime type checking** is possible with libraries like \`beartype\`, \`typeguard\`, and \`pydantic\`. While Python's type hints are ignored at runtime by default (\`def f(x: int)\` accepts any type), these libraries add runtime validation using \`__annotations__\` and function introspection.

**\`mypy\`** is the reference static type checker. Key flags: \`--strict\` (all checks), \`--disallow-untyped-defs\`, \`--no-implicit-optional\`. Configuration via \`mypy.ini\` or \`pyproject.toml\`.`,
    codeExample: `# ============================================================
# TypeVar — generic functions
# ============================================================
from typing import (
    TypeVar, Generic, Protocol, TypeAlias, Literal,
    TypeGuard, overload, ParamSpec, Callable, Iterator,
    runtime_checkable, ClassVar, Final, Annotated
)
from collections.abc import Sequence, Mapping

T = TypeVar("T")
K = TypeVar("K")
V = TypeVar("V")


def first(items: Sequence[T]) -> T | None:
    """Return the first item of any sequence, preserving type."""
    return items[0] if items else None

# mypy infers: first([1, 2, 3]) -> int | None
# mypy infers: first(["a", "b"]) -> str | None


def merge_dicts(d1: dict[K, V], d2: dict[K, V]) -> dict[K, V]:
    """Merge two dicts with matching key/value types."""
    return {**d1, **d2}


# Constrained TypeVar — only int or float
Number = TypeVar("Number", int, float)

def add(a: Number, b: Number) -> Number:
    return a + b

# add(1, 2) -> int
# add(1.0, 2.0) -> float
# add("a", "b") -> mypy error!


# Bounded TypeVar
from typing import SupportsLt

Sortable = TypeVar("Sortable", bound=SupportsLt)

def min_value(items: list[Sortable]) -> Sortable:
    """Find minimum value in a list of comparable items."""
    result = items[0]
    for item in items[1:]:
        if item < result:
            result = item
    return result


# ============================================================
# Generic classes
# ============================================================
class Stack(Generic[T]):
    """Type-safe stack implementation."""

    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        if not self._items:
            raise IndexError("Stack is empty")
        return self._items.pop()

    def peek(self) -> T:
        if not self._items:
            raise IndexError("Stack is empty")
        return self._items[-1]

    def __len__(self) -> int:
        return len(self._items)

    def __iter__(self) -> Iterator[T]:
        return reversed(self._items)


# Type-safe usage
int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
# int_stack.push("oops")  # mypy error: str is not int

str_stack: Stack[str] = Stack()
str_stack.push("hello")
value: str = str_stack.pop()  # mypy knows this is str


# Multiple type parameters
class Result(Generic[T, K]):
    """Rust-inspired Result type for error handling."""

    def __init__(self, value: T | None = None, error: K | None = None):
        self._value = value
        self._error = error

    @classmethod
    def ok(cls, value: T) -> "Result[T, K]":
        return cls(value=value)

    @classmethod
    def err(cls, error: K) -> "Result[T, K]":
        return cls(error=error)

    def is_ok(self) -> bool:
        return self._error is None

    def unwrap(self) -> T:
        if self._error is not None:
            raise ValueError(f"Called unwrap on error: {self._error}")
        return self._value  # type: ignore


# ============================================================
# Protocol — structural subtyping (duck typing)
# ============================================================
@runtime_checkable
class Drawable(Protocol):
    """Any object with a draw() method is Drawable."""

    def draw(self, canvas: "Canvas") -> None:
        ...

    @property
    def bounds(self) -> tuple[int, int, int, int]:
        ...


class Canvas:
    def render(self, shape: Drawable) -> str:
        """Accepts ANY object with draw() and bounds — no inheritance!"""
        x, y, w, h = shape.bounds
        shape.draw(self)
        return f"Rendered at ({x},{y}) size {w}x{h}"


class Circle:  # Does NOT inherit from Drawable
    def __init__(self, x: int, y: int, radius: int):
        self.x, self.y, self.radius = x, y, radius

    def draw(self, canvas: Canvas) -> None:
        print(f"Drawing circle at ({self.x},{self.y}) r={self.radius}")

    @property
    def bounds(self) -> tuple[int, int, int, int]:
        return (self.x - self.radius, self.y - self.radius,
                self.radius * 2, self.radius * 2)


# This works! Circle matches the Drawable protocol structurally
canvas = Canvas()
circle = Circle(100, 100, 50)
canvas.render(circle)  # mypy: OK, Circle matches Drawable
print(isinstance(circle, Drawable))  # True (runtime_checkable)


# ============================================================
# TypeAlias and Literal
# ============================================================
# Explicit type aliases (Python 3.10+)
JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None
Headers: TypeAlias = dict[str, str]
Callback: TypeAlias = Callable[[str, int], bool]


# Literal types — restrict to specific values
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
HttpMethod = Literal["GET", "POST", "PUT", "DELETE", "PATCH"]


def log(message: str, level: LogLevel = "INFO") -> None:
    print(f"[{level}] {message}")

log("Server started", "INFO")    # OK
# log("Error", "VERBOSE")        # mypy error: not a valid Literal


def make_request(url: str, method: HttpMethod = "GET") -> dict:
    return {"url": url, "method": method}


# ============================================================
# @overload — multiple signatures
# ============================================================
@overload
def process(data: str) -> list[str]: ...
@overload
def process(data: list[int]) -> int: ...
@overload
def process(data: dict[str, int]) -> list[tuple[str, int]]: ...

def process(data):
    """Process different data types with type-specific return types."""
    if isinstance(data, str):
        return data.split()
    elif isinstance(data, list):
        return sum(data)
    elif isinstance(data, dict):
        return list(data.items())
    raise TypeError(f"Unsupported type: {type(data)}")


# mypy infers the correct return type for each call:
words: list[str] = process("hello world")
total: int = process([1, 2, 3])
pairs: list[tuple[str, int]] = process({"a": 1, "b": 2})


# ============================================================
# TypeGuard — custom type narrowing
# ============================================================
def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    """Check if all elements in a list are strings."""
    return all(isinstance(item, str) for item in val)


def process_items(items: list[object]) -> str:
    if is_string_list(items):
        # mypy now knows items is list[str]
        return ", ".join(items)  # No error!
    return str(items)


# ============================================================
# ParamSpec — preserving callable signatures in decorators
# ============================================================
P = ParamSpec("P")
R = TypeVar("R")


def with_logging(func: Callable[P, R]) -> Callable[P, R]:
    """Decorator that preserves the original function's type signature."""
    import functools

    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result!r}")
        return result
    return wrapper


@with_logging
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"


# mypy sees: greet(name: str, greeting: str = "Hello") -> str
# The decorator preserves the EXACT signature
result = greet("Alice")  # OK
# greet(123)             # mypy error: int is not str


# ============================================================
# Final, ClassVar, and Annotated
# ============================================================
class AppSettings:
    MAX_RETRIES: Final = 3             # Cannot be reassigned or overridden
    VERSION: ClassVar[str] = "1.0.0"   # Class-level only, not on instances

    # Annotated: attach metadata to types (used by Pydantic, FastAPI, etc.)
    port: Annotated[int, "Must be between 1 and 65535"]
    host: Annotated[str, "Hostname or IP address"]

    def __init__(self, host: str = "localhost", port: int = 8080):
        self.host = host
        self.port = port`,
    exercise: `**Exercises:**

1. Create a generic \`Repository[T]\` class with methods \`add(item: T)\`, \`get(id: str) -> T | None\`, \`list_all() -> list[T]\`, and \`delete(id: str) -> bool\`. Instantiate it as \`Repository[User]\` and \`Repository[Product]\` and verify type safety with mypy.

2. Define a \`Comparable\` Protocol with \`__lt__\` and \`__eq__\` methods. Write a generic \`binary_search(items: list[T], target: T) -> int | None\` function bounded by \`Comparable\`. Verify it works with both \`int\` and custom classes without inheritance.

3. Use \`@overload\` to type a \`serialize()\` function that returns \`str\` when given \`format="json"\`, \`bytes\` when given \`format="binary"\`, and \`dict\` when given \`format="dict"\`. Verify each overload with mypy.

4. Write a decorator using \`ParamSpec\` and \`TypeVar\` that adds retry logic to any function while preserving its exact type signature. Verify that mypy correctly reports errors when the decorated function is called with wrong argument types.

5. Create a type-safe event system: \`EventBus\` with \`subscribe(event_type: type[T], handler: Callable[[T], None])\` and \`publish(event: T)\`. Use \`Generic\` and \`Protocol\` to ensure handlers receive the correct event type.

6. Run mypy with \`--strict\` on a 50-line program that uses generics, protocols, and overloads. Fix all reported type errors. Document three categories of errors mypy caught that would have been runtime bugs.`,
    commonMistakes: [
      "Confusing `TypeVar` constraints with bounds. `T = TypeVar('T', int, str)` means T is EXACTLY `int` or `str`. `T = TypeVar('T', bound=Number)` means T is any SUBTYPE of `Number`. Constraints create a union; bounds create a hierarchy.",
      "Using `Protocol` without `@runtime_checkable` and then attempting `isinstance()` checks. By default, Protocols are for static checking only. Add `@runtime_checkable` to enable `isinstance()`, but note it only checks method existence, not signatures.",
      "Forgetting that type hints are NOT enforced at runtime by default. `def f(x: int) -> str: return x` runs without error. Type hints are metadata for tools like mypy. Use `beartype` or `typeguard` for runtime enforcement.",
      "Using mutable default arguments in typed signatures. `def f(items: list[int] = [])` has the classic mutable default bug AND a typing issue. Use `None` as default: `def f(items: list[int] | None = None)` and create the list inside the function.",
      "Mixing up `type[X]` and `X` in annotations. `def f(cls: type[Animal])` accepts the Animal class itself (or subclasses); `def f(obj: Animal)` accepts instances. Using the wrong one causes subtle type errors that mypy catches but are easy to miss.",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is the difference between `Protocol` and `ABC` in Python's type system? When would you use each?",
        a: "**`ABC` (Abstract Base Class)** uses **nominal subtyping** \u2014 a class must explicitly inherit from the ABC (`class Dog(Animal)`) to be considered compatible. It enforces contracts at instantiation time (can't create instances of classes missing abstract methods). **`Protocol`** uses **structural subtyping** \u2014 any class that has the right methods/attributes is compatible, even without inheritance. This is true duck typing for the type checker. Use `ABC` when you want explicit inheritance hierarchies and runtime enforcement. Use `Protocol` when you want flexibility (third-party classes can match without modification) or when defining interfaces for callback patterns. Protocols are preferred in modern Python for loose coupling \u2014 they don't force implementation inheritance.",
      },
      {
        type: "tricky",
        q: "Explain `ParamSpec` and why it's needed for typing decorators correctly.",
        a: "`ParamSpec` (PEP 612) captures the **entire parameter specification** of a callable \u2014 positional args, keyword args, defaults, and their types. Before `ParamSpec`, decorators typed as `Callable[..., R]` lost all parameter type information, so mypy couldn't check if decorated functions were called correctly. With `ParamSpec`: `P = ParamSpec('P'); def decorator(f: Callable[P, R]) -> Callable[P, R]` \u2014 the wrapper preserves the exact signature. `P.args` and `P.kwargs` are used in the wrapper's `*args`/`**kwargs` to maintain the connection. Without it, `@with_logging` on `def greet(name: str)` would make mypy think `greet` accepts `*args, **kwargs` (any arguments), defeating the purpose of type checking.",
      },
      {
        type: "scenario",
        q: "You're designing a plugin system where third-party developers write plugins. How would you use `Protocol` and `Generic` to create a type-safe plugin API?",
        a: "Define Protocols for the plugin interface: `class Plugin(Protocol[ConfigT]): def initialize(self, config: ConfigT) -> None: ...; def execute(self, input: InputData) -> OutputData: ...`. The `Generic[ConfigT]` lets each plugin declare its config type. Create a `PluginManager` that's also generic: `class PluginManager(Generic[T]): def register(self, plugin: T) -> None` where `T` is bound to the `Plugin` protocol. Third-party developers don't need to import or inherit from your base classes \u2014 they just implement the right methods. The type checker validates compatibility structurally. Add `@runtime_checkable` to `Plugin` for runtime validation during dynamic loading. Use `TypeVar` with bounds for the config: `ConfigT = TypeVar('ConfigT', bound=BaseConfig)` to ensure all configs share a minimum interface. This gives you compile-time safety and runtime flexibility.",
      },
      {
        type: "conceptual",
        q: "How does mypy's `--strict` mode differ from default mode? What categories of errors does it catch?",
        a: "`--strict` enables all optional strictness flags: `--disallow-untyped-defs` (every function must have type annotations), `--disallow-any-generics` (no bare `list`, must use `list[int]`), `--no-implicit-optional` (`Optional` must be explicit), `--warn-return-any`, `--warn-unused-ignores`, and more. Categories it catches: 1) **Missing annotations** \u2014 forces you to type every function, preventing `Any` from silently propagating. 2) **Unsafe operations** \u2014 accessing attributes on `Any` types, calling untyped functions. 3) **Generic misuse** \u2014 bare `dict` instead of `dict[str, int]`, losing type information. 4) **Optional unsafety** \u2014 using a possibly-`None` value without checking. In practice, `--strict` catches 30-50% more issues than default mode, especially in larger codebases where `Any` types propagate across module boundaries.",
      },
    ],
  },
];

export default pyPhase6b;
