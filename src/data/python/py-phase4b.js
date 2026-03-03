const pyPhase4b = [
  {
    id: "py-properties-descriptors",
    title: "Properties & Descriptors",
    explanation: `**Properties** provide a Pythonic way to add getters, setters, and deleters to attributes while maintaining the simple attribute access syntax. Instead of writing \`get_name()\` and \`set_name()\` methods (Java style), Python uses \`@property\` to make method calls look like attribute access.

**The \`@property\` decorator:**
\`\`\`python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):           # Getter
        return self._radius

    @radius.setter
    def radius(self, value):    # Setter
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value
\`\`\`

**When to use properties:**
- **Validation** — enforce constraints when setting values
- **Computed attributes** — calculate values on access (\`area\` from \`radius\`)
- **Lazy loading** — defer expensive computation until first access
- **Backward compatibility** — convert a public attribute to a property without changing the API

**Descriptors** are the mechanism behind properties, methods, classmethods, and staticmethods. A descriptor is any object that defines \`__get__\`, \`__set__\`, or \`__delete__\` methods.

**Descriptor protocol:**
- \`__get__(self, obj, type)\` — called on attribute access
- \`__set__(self, obj, value)\` — called on attribute assignment
- \`__delete__(self, obj)\` — called on attribute deletion

**Data descriptors** (define \`__set__\` or \`__delete__\`) take precedence over instance dictionaries. **Non-data descriptors** (only \`__get__\`) can be overridden by instance attributes.`,
    codeExample: `# ============================================================
# @property basics
# ============================================================
class Circle:
    def __init__(self, radius):
        self.radius = radius  # Calls the setter!

    @property
    def radius(self):
        """The radius of the circle."""
        return self._radius

    @radius.setter
    def radius(self, value):
        if not isinstance(value, (int, float)):
            raise TypeError("Radius must be a number")
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        """Computed property — calculated on access."""
        import math
        return math.pi * self._radius ** 2

    @property
    def diameter(self):
        return self._radius * 2

    @diameter.setter
    def diameter(self, value):
        self.radius = value / 2  # Calls radius setter (validates!)

c = Circle(5)
print(c.radius)        # 5
print(c.area)          # 78.539... (computed, not stored)
print(c.diameter)      # 10

c.diameter = 20        # Sets radius to 10 via setter
print(c.radius)        # 10

# c.radius = -1        # ValueError: Radius cannot be negative
# c.area = 100         # AttributeError: can't set (no setter)

# ============================================================
# Practical: validated model
# ============================================================
class User:
    def __init__(self, name, email, age):
        self.name = name    # Each calls its setter
        self.email = email
        self.age = age

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not value or not value.strip():
            raise ValueError("Name cannot be empty")
        self._name = value.strip()

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, value):
        if "@" not in value:
            raise ValueError(f"Invalid email: {value}")
        self._email = value.lower()

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if not isinstance(value, int) or value < 0 or value > 150:
            raise ValueError(f"Invalid age: {value}")
        self._age = value

user = User("  Alice  ", "Alice@Email.COM", 30)
print(user.name)    # "Alice" (stripped)
print(user.email)   # "alice@email.com" (lowered)

# ============================================================
# Lazy property (cached computation)
# ============================================================
class DataAnalyzer:
    def __init__(self, data):
        self._data = data
        self._stats = None  # Lazy: not computed until needed

    @property
    def stats(self):
        if self._stats is None:
            print("Computing stats...")  # Only runs once
            self._stats = {
                "mean": sum(self._data) / len(self._data),
                "min": min(self._data),
                "max": max(self._data),
                "count": len(self._data),
            }
        return self._stats

analyzer = DataAnalyzer([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
print(analyzer.stats)  # "Computing stats..." then the dict
print(analyzer.stats)  # No message — cached!

# Python 3.8+ has functools.cached_property for this:
from functools import cached_property

class DataAnalyzerV2:
    def __init__(self, data):
        self._data = data

    @cached_property
    def stats(self):
        """Computed once, then cached as an instance attribute."""
        return {
            "mean": sum(self._data) / len(self._data),
            "min": min(self._data),
            "max": max(self._data),
        }

# ============================================================
# Descriptors — the mechanism behind @property
# ============================================================
class Validated:
    """A descriptor that validates values on assignment."""

    def __init__(self, validator, error_msg):
        self.validator = validator
        self.error_msg = error_msg

    def __set_name__(self, owner, name):
        """Called when the descriptor is assigned to a class attribute."""
        self.public_name = name
        self.private_name = f"_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self  # Access from class, not instance
        return getattr(obj, self.private_name, None)

    def __set__(self, obj, value):
        if not self.validator(value):
            raise ValueError(f"{self.public_name}: {self.error_msg}")
        setattr(obj, self.private_name, value)

# Reusable validators
class PositiveNumber(Validated):
    def __init__(self):
        super().__init__(
            lambda x: isinstance(x, (int, float)) and x > 0,
            "must be a positive number"
        )

class NonEmptyString(Validated):
    def __init__(self):
        super().__init__(
            lambda x: isinstance(x, str) and len(x.strip()) > 0,
            "must be a non-empty string"
        )

class Product:
    name = NonEmptyString()
    price = PositiveNumber()
    quantity = PositiveNumber()

    def __init__(self, name, price, quantity):
        self.name = name
        self.price = price
        self.quantity = quantity

    @property
    def total(self):
        return self.price * self.quantity

p = Product("Widget", 9.99, 100)
print(f"{p.name}: ${p.price} x {p.quantity} = ${p.total}")
# p.price = -5  # ValueError: price: must be a positive number`,
    exercise: `**Exercises:**

1. Create a \`Temperature\` class with a \`celsius\` property and computed \`fahrenheit\` and \`kelvin\` properties. Setting any of the three should update the underlying value.

2. Build a \`ValidatedList\` class that uses a property to enforce that all items match a given type. \`vl = ValidatedList(int); vl.items = [1, 2, 3]\` works, but \`vl.items = [1, "two"]\` fails.

3. Implement a \`cached_property\` decorator from scratch (without using \`functools.cached_property\`).

4. Create a reusable \`TypeChecked\` descriptor that enforces type on assignment. Use it in a \`Person\` class: \`name: str\`, \`age: int\`, \`email: str\`.

5. Build a \`ReadOnly\` descriptor that allows setting a value in \`__init__\` but raises \`AttributeError\` on subsequent modifications.

6. Compare three approaches for the same validation: manual getters/setters, @property, and descriptors. Discuss when each is appropriate.`,
    commonMistakes: [
      "Storing the value in `self.name` instead of `self._name` inside a property setter — this causes infinite recursion because the setter calls itself.",
      "Making every attribute a property 'just in case'. Start with plain attributes and convert to properties only when you need validation, computation, or side effects. Properties have overhead.",
      "Forgetting that `@cached_property` only works on instances. It replaces itself with the computed value in the instance dict. It doesn't work with `__slots__`.",
      "Using properties for expensive computations without caching — every access recomputes the value. Use `@cached_property` or manual caching for expensive operations.",
      "Not defining `__set_name__` in custom descriptors. Without it, the descriptor doesn't know its attribute name, making error messages unhelpful.",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "How do descriptors work in Python? What is the descriptor protocol?",
        a: "A **descriptor** is any object that defines `__get__`, `__set__`, or `__delete__`. When a descriptor is a class attribute, Python's attribute lookup invokes the descriptor methods instead of returning the descriptor object itself. **Data descriptors** (define `__set__` or `__delete__`) have priority over instance `__dict__`. **Non-data descriptors** (only `__get__`) can be overridden by instance attributes. **Lookup order:** 1) Data descriptors from the class. 2) Instance `__dict__`. 3) Non-data descriptors from the class. Properties, methods, classmethods, and staticmethods are all implemented as descriptors.",
      },
      {
        type: "tricky",
        q: "Why does this cause infinite recursion? `class Foo: @property\\n def x(self): return self.x`",
        a: "The property `x` is defined as a getter that returns `self.x`. But `self.x` triggers the property getter again (it's the same property!), causing infinite recursion. The fix is to store the actual value in a different attribute, conventionally with a leading underscore: `self._x`. The property getter should return `self._x`, not `self.x`. Similarly, in a setter: `self.x = value` inside `x.setter` would recurse — use `self._x = value` instead.",
      },
      {
        type: "scenario",
        q: "You have a class with 10 attributes that all need the same validation (positive numbers). How would you avoid repeating the property boilerplate?",
        a: "Use a **custom descriptor**: create a `PositiveNumber` descriptor class with `__get__`, `__set__`, and `__set_name__` methods. Then use it as a class attribute for each field:\n```python\nclass PositiveNumber:\n    def __set_name__(self, owner, name):\n        self.name = f'_{name}'\n    def __get__(self, obj, type=None):\n        return getattr(obj, self.name, None) if obj else self\n    def __set__(self, obj, value):\n        if value <= 0: raise ValueError(f'Must be positive')\n        setattr(obj, self.name, value)\n\nclass Product:\n    width = PositiveNumber()\n    height = PositiveNumber()\n    depth = PositiveNumber()\n    weight = PositiveNumber()\n    # ... 10 attributes, no repetition\n```\nThis is exactly what libraries like `attrs` and `pydantic` do under the hood — they generate descriptors from type annotations.",
      },
    ],
  },
  {
    id: "py-dataclasses-slots",
    title: "Dataclasses & NamedTuples",
    explanation: `**Dataclasses** (Python 3.7+) reduce boilerplate for classes that mainly store data. The \`@dataclass\` decorator auto-generates \`__init__\`, \`__repr__\`, \`__eq__\`, and optionally \`__hash__\`, \`__lt__\`, etc.

\`\`\`python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
\`\`\`
This auto-generates \`__init__(self, x, y)\`, \`__repr__\`, and \`__eq__\`.

**Dataclass options:**

| Option | Default | Effect |
|--------|---------|--------|
| \`frozen=True\` | False | Immutable (like a tuple) |
| \`order=True\` | False | Generate \`<\`, \`>\`, \`<=\`, \`>=\` |
| \`slots=True\` | False | Use \`__slots__\` for memory efficiency (3.10+) |
| \`kw_only=True\` | False | All fields keyword-only (3.10+) |

**\`field()\`** customizes individual fields:
- \`default\` / \`default_factory\` — default values
- \`repr=False\` — exclude from repr
- \`compare=False\` — exclude from comparison
- \`init=False\` — exclude from constructor

**NamedTuple** (from \`typing\` module) creates lightweight, immutable record types. They're tuples with named fields — great for function return values and simple data records.

**\`__slots__\`** restricts an object to a fixed set of attributes, reducing memory usage by 40-50% for classes with many instances. Instances don't have a \`__dict__\`, so you can't add arbitrary attributes.

**Choosing between options:**

| Need | Use |
|------|-----|
| Simple mutable data class | \`@dataclass\` |
| Immutable record | \`@dataclass(frozen=True)\` or \`NamedTuple\` |
| Dict key / set member | \`@dataclass(frozen=True)\` or \`NamedTuple\` |
| Memory-efficient | \`@dataclass(slots=True)\` or \`__slots__\` |
| Tuple compatibility | \`NamedTuple\` |`,
    codeExample: `# ============================================================
# Basic dataclass
# ============================================================
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    email: str
    age: int
    active: bool = True  # Default value

# Auto-generated __init__, __repr__, __eq__
user = User("Alice", "alice@email.com", 30)
print(user)        # User(name='Alice', email='alice@email.com', age=30, active=True)
print(user == User("Alice", "alice@email.com", 30))  # True

# ============================================================
# field() for customization
# ============================================================
@dataclass
class Order:
    order_id: str
    items: list = field(default_factory=list)  # Mutable default!
    total: float = 0.0
    _internal_state: str = field(default="pending", repr=False, compare=False)

    def add_item(self, item, price):
        self.items.append(item)
        self.total += price

order = Order("ORD-001")
order.add_item("Widget", 9.99)
order.add_item("Gadget", 19.99)
print(order)
# Order(order_id='ORD-001', items=['Widget', 'Gadget'], total=29.98)

# Each instance gets its own list (unlike the mutable default bug)
order2 = Order("ORD-002")
print(order2.items)  # [] — independent!

# ============================================================
# Frozen dataclass (immutable)
# ============================================================
@dataclass(frozen=True)
class Point:
    x: float
    y: float

    @property
    def distance_from_origin(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

p = Point(3, 4)
print(p.distance_from_origin)  # 5.0
# p.x = 10  # FrozenInstanceError: cannot assign to field 'x'

# Frozen dataclasses are hashable → can be dict keys and set members
points = {Point(0, 0): "origin", Point(1, 0): "unit x"}

# ============================================================
# Ordered dataclass
# ============================================================
@dataclass(order=True)
class Version:
    major: int
    minor: int
    patch: int

    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

versions = [Version(2, 1, 0), Version(1, 9, 5), Version(2, 0, 1)]
print(sorted(versions))  # [1.9.5, 2.0.1, 2.1.0]

# ============================================================
# Post-init processing
# ============================================================
@dataclass
class Rectangle:
    width: float
    height: float
    area: float = field(init=False)  # Computed, not passed to __init__

    def __post_init__(self):
        """Called after __init__. Use for validation and computed fields."""
        if self.width <= 0 or self.height <= 0:
            raise ValueError("Dimensions must be positive")
        self.area = self.width * self.height

r = Rectangle(4, 5)
print(r)  # Rectangle(width=4, height=5, area=20)

# ============================================================
# Dataclass with slots (Python 3.10+)
# ============================================================
@dataclass(slots=True)
class Particle:
    x: float
    y: float
    mass: float = 1.0

p = Particle(0, 0)
# p.color = "red"  # AttributeError: no __dict__, can't add attributes
# Uses ~40% less memory than regular dataclass

# ============================================================
# NamedTuple — immutable record type
# ============================================================
from typing import NamedTuple

class Coordinate(NamedTuple):
    latitude: float
    longitude: float
    altitude: float = 0.0

loc = Coordinate(40.7128, -74.0060)
print(loc)                 # Coordinate(latitude=40.7128, longitude=-74.006, altitude=0.0)
print(loc.latitude)        # 40.7128
print(loc[0])              # 40.7128 (tuple indexing)

# Unpacking
lat, lng, alt = loc
print(f"{lat}, {lng}")

# Immutable
# loc.latitude = 0  # AttributeError

# Can be dict key (hashable)
locations = {loc: "New York City"}

# ============================================================
# Comparison: dataclass vs NamedTuple vs dict
# ============================================================
import sys

@dataclass
class DataPoint:
    x: float
    y: float

@dataclass(slots=True)
class DataPointSlots:
    x: float
    y: float

class DataPointNT(NamedTuple):
    x: float
    y: float

# Memory comparison
dc = DataPoint(1.0, 2.0)
dcs = DataPointSlots(1.0, 2.0)
nt = DataPointNT(1.0, 2.0)
d = {"x": 1.0, "y": 2.0}

print(f"dataclass:       {sys.getsizeof(dc)} bytes")
print(f"dataclass+slots: {sys.getsizeof(dcs)} bytes")
print(f"namedtuple:      {sys.getsizeof(nt)} bytes")
print(f"dict:            {sys.getsizeof(d)} bytes")`,
    exercise: `**Exercises:**

1. Create a \`@dataclass\` for \`Employee\` with name, department, salary, and hire_date. Add a computed \`years_of_service\` property and implement ordering by salary.

2. Build an immutable \`Color\` dataclass (frozen) with r, g, b fields (0-255). Add validation in \`__post_init__\`, a \`hex\` property, and a \`@classmethod\` factory \`from_hex("#FF0000")\`.

3. Compare memory usage: create 100,000 instances of the same data using a regular class, \`@dataclass\`, \`@dataclass(slots=True)\`, \`NamedTuple\`, and \`dict\`. Measure with \`sys.getsizeof\`.

4. Create a \`Config\` NamedTuple with sensible defaults. Show how to create modified copies with \`_replace()\`.

5. Build a dataclass inheritance hierarchy: \`Shape\` → \`Rectangle\` → \`Square\`. Handle the field ordering issue (fields with defaults must come after fields without).

6. Implement a simple \`@dataclass\`-like decorator from scratch that auto-generates \`__init__\` and \`__repr__\` from class annotations.`,
    commonMistakes: [
      "Using mutable defaults in dataclass fields: `items: list = []`. Use `field(default_factory=list)` instead. The dataclass decorator catches this and raises a TypeError.",
      "Forgetting that `@dataclass(frozen=True)` prevents ALL attribute changes, not just on constructor fields. You can't add new attributes or modify computed ones. Use `object.__setattr__(self, 'attr', value)` in `__post_init__` if needed.",
      "Inheriting from a dataclass with defaults when the child has fields without defaults — this causes a TypeError. Fields without defaults must come before fields with defaults in MRO order.",
      "Using NamedTuple when you need mutability. NamedTuples are immutable (tuple subclass). Use `@dataclass` for mutable records.",
      "Not knowing about `asdict()` and `astuple()` from dataclasses module — they convert dataclass instances to dicts/tuples, which is useful for serialization.",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "When would you use a dataclass vs a NamedTuple vs a regular class?",
        a: "**`@dataclass`** — for mutable data containers where you want auto-generated `__init__`, `__repr__`, `__eq__`. Most common choice for DTOs, models, and configuration objects. **`NamedTuple`** — for immutable records, especially when you need tuple compatibility (indexing, unpacking, as dict keys). Better memory efficiency than regular dataclasses. Good for function return values. **Regular class** — when you need custom `__init__` logic, complex methods, don't want auto-generated methods, or when the class is more about behavior than data. Rule of thumb: start with `@dataclass`, use NamedTuple for immutability, use regular class when you need full control.",
      },
      {
        type: "tricky",
        q: "What are `__slots__` and how do they affect memory and attribute access?",
        a: "`__slots__` is a class variable that declares a fixed set of instance attributes. Instead of a `__dict__` (hash table), slots use a compact array of references. **Benefits:** 1) **40-50% less memory** per instance (no `__dict__`). 2) **Slightly faster** attribute access. 3) **Prevents typos** — can't add undeclared attributes. **Drawbacks:** 1) Can't add new attributes at runtime. 2) Can't use `__dict__`-based features (like `vars(obj)`). 3) Inheritance complications — each class must declare its own slots, and multiple inheritance with slots is tricky. 4) Can't use `__weakref__` unless explicitly included in slots. Use for classes with many instances (data records, points in a simulation).",
      },
      {
        type: "coding",
        q: "Create an immutable, hashable dataclass that can be used as a dict key.",
        a: "```python\nfrom dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass CacheKey:\n    endpoint: str\n    params: tuple  # Use tuple, not list (must be hashable)\n    method: str = 'GET'\n\n# Frozen dataclasses auto-generate __hash__ based on all fields\nkey1 = CacheKey('/api/users', (('page', 1),))\nkey2 = CacheKey('/api/users', (('page', 1),))\n\nprint(key1 == key2)   # True\nprint(hash(key1) == hash(key2))  # True\n\ncache = {key1: {'users': [...]}}\nprint(cache[key2])  # Works! Same hash and equality\n```\nNote: All fields must be hashable types. Use `tuple` instead of `list`, `frozenset` instead of `set`.",
      },
    ],
  },
];

export default pyPhase4b;
