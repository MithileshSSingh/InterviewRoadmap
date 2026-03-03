const pyPhase4 = {
  id: "phase-4",
  title: "Phase 4: Object-Oriented Programming",
  emoji: "🏗️",
  description:
    "Master OOP in Python — classes, inheritance, magic methods, properties, descriptors, and dataclasses.",
  topics: [
    {
      id: "py-classes-objects",
      title: "Classes & Objects",
      explanation: `Everything in Python is an object — integers, strings, functions, even classes themselves. Python's OOP model is flexible and pragmatic, emphasizing "we're all consenting adults" rather than strict access control.

**Class basics:**
\`\`\`python
class MyClass:
    class_attribute = "shared"    # Shared by all instances

    def __init__(self, value):    # Constructor (initializer)
        self.instance_attr = value  # Unique to each instance

    def method(self):             # Instance method
        return self.instance_attr
\`\`\`

**Key concepts:**
- **\`self\`** — explicit reference to the current instance (like \`this\` in JS/Java, but always explicit in Python)
- **\`__init__\`** — initializer method (NOT a constructor; \`__new__\` is the actual constructor)
- **Instance attributes** — belong to a specific object, set via \`self.attr = value\`
- **Class attributes** — shared by all instances, defined in the class body
- **Instance methods** — take \`self\` as first parameter
- **Class methods** — take \`cls\` as first parameter, decorated with \`@classmethod\`
- **Static methods** — no implicit first parameter, decorated with \`@staticmethod\`

**Naming conventions for access control:**
- \`public\` — accessible everywhere
- \`_private\` — internal use (convention, not enforced)
- \`__mangled\` — name mangling: \`obj.__attr\` becomes \`obj._ClassName__attr\`

Python doesn't have true private attributes — the single underscore \`_\` is a convention that says "please don't use this from outside," and the double underscore \`__\` triggers name mangling to prevent accidental access in subclasses.`,
      codeExample: `# ============================================================
# Basic class definition
# ============================================================
class BankAccount:
    """A simple bank account with deposit and withdrawal."""

    # Class attribute — shared by all instances
    bank_name = "Python National Bank"
    _total_accounts = 0

    def __init__(self, owner: str, balance: float = 0.0):
        """Initialize a new account."""
        self.owner = owner            # Public instance attribute
        self._balance = balance       # "Private" by convention
        self.__id = id(self)          # Name-mangled (harder to access)
        BankAccount._total_accounts += 1

    def deposit(self, amount: float) -> float:
        """Deposit money into the account."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._balance += amount
        return self._balance

    def withdraw(self, amount: float) -> float:
        """Withdraw money from the account."""
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        return self._balance

    def get_balance(self) -> float:
        """Return current balance."""
        return self._balance

    def __str__(self) -> str:
        """Human-readable string representation."""
        return f"Account({self.owner}: ${self._balance:,.2f})"

    def __repr__(self) -> str:
        """Developer-friendly representation."""
        return f"BankAccount(owner={self.owner!r}, balance={self._balance})"

    @classmethod
    def get_total_accounts(cls) -> int:
        """Return total number of accounts created."""
        return cls._total_accounts

    @classmethod
    def from_dict(cls, data: dict) -> "BankAccount":
        """Alternative constructor from dictionary."""
        return cls(owner=data["owner"], balance=data.get("balance", 0))

    @staticmethod
    def validate_amount(amount: float) -> bool:
        """Validate that an amount is a positive number."""
        return isinstance(amount, (int, float)) and amount > 0


# ============================================================
# Using the class
# ============================================================
# Create instances
alice = BankAccount("Alice", 1000)
bob = BankAccount("Bob")

# Instance methods
alice.deposit(500)
print(alice)  # Account(Alice: $1,500.00)
print(repr(alice))  # BankAccount(owner='Alice', balance=1500)

# Class method
print(BankAccount.get_total_accounts())  # 2

# Alternative constructor
data = {"owner": "Charlie", "balance": 750}
charlie = BankAccount.from_dict(data)

# Static method
print(BankAccount.validate_amount(100))   # True
print(BankAccount.validate_amount(-50))   # False

# ============================================================
# Class vs Instance attributes
# ============================================================
class Dog:
    species = "Canis familiaris"  # Class attribute

    def __init__(self, name, breed):
        self.name = name    # Instance attribute
        self.breed = breed  # Instance attribute

fido = Dog("Fido", "Labrador")
buddy = Dog("Buddy", "Poodle")

# Both share the class attribute
print(fido.species)   # "Canis familiaris"
print(buddy.species)  # "Canis familiaris"

# Modifying class attribute affects all instances
Dog.species = "Canis lupus familiaris"
print(fido.species)   # "Canis lupus familiaris"

# But assigning to instance creates a new instance attribute!
fido.species = "Custom"     # Creates instance attribute
print(fido.species)         # "Custom" (instance attribute)
print(buddy.species)        # "Canis lupus familiaris" (still class attribute)
print(Dog.species)          # "Canis lupus familiaris" (class attribute unchanged)

# ============================================================
# Name mangling (__double_underscore)
# ============================================================
class Secret:
    def __init__(self):
        self.__hidden = "secret value"

s = Secret()
# print(s.__hidden)          # AttributeError!
print(s._Secret__hidden)     # "secret value" (mangled name)

# Name mangling prevents accidental override in subclasses
class Parent:
    def __init__(self):
        self.__value = "parent"

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__value = "child"  # This is _Child__value, NOT _Parent__value

c = Child()
print(c._Parent__value)  # "parent"
print(c._Child__value)   # "child"

# ============================================================
# @classmethod vs @staticmethod
# ============================================================
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, date_string):
        """Parse 'YYYY-MM-DD' string. Uses cls so subclasses work."""
        year, month, day = map(int, date_string.split("-"))
        return cls(year, month, day)  # cls, not Date!

    @classmethod
    def today(cls):
        """Create a Date for today."""
        import datetime
        t = datetime.date.today()
        return cls(t.year, t.month, t.day)

    @staticmethod
    def is_valid(year, month, day):
        """Check if date is valid. No class/instance access needed."""
        return 1 <= month <= 12 and 1 <= day <= 31

    def __str__(self):
        return f"{self.year:04d}-{self.month:02d}-{self.day:02d}"

d = Date.from_string("2024-06-15")
print(d)  # 2024-06-15
print(Date.is_valid(2024, 13, 1))  # False`,
      exercise: `**Exercises:**

1. Create a \`Rectangle\` class with width and height. Add methods for area, perimeter, and \`is_square()\`. Include \`__str__\`, \`__repr__\`, and an \`@classmethod\` factory method \`from_square(side)\`.

2. Build a \`LinkedList\` class with \`Node\` inner class. Implement \`append\`, \`prepend\`, \`delete\`, \`find\`, and \`__str__\` (to print the list).

3. Create a \`Student\` class that tracks all created students (class attribute). Add class methods to get average grade, find top students, and count students.

4. Demonstrate the difference between class attributes and instance attributes: create a class where modifying a class-level mutable attribute (list) from one instance affects all instances.

5. Build a \`Config\` class that reads configuration from a dictionary, with \`@classmethod\` factories for loading from JSON file, environment variables, and defaults.

6. Explain name mangling with a Parent/Child class example where both define \`self.__data\`.`,
      commonMistakes: [
        "Forgetting `self` as the first parameter of instance methods. `def method(self):` — without `self`, you'll get 'takes 0 positional arguments but 1 was given'.",
        "Using a mutable class attribute (like a list) that gets shared across instances: `class Foo: items = []` — all instances share the SAME list. Define mutable attributes in `__init__` instead.",
        "Confusing `__init__` with a constructor. `__init__` is the initializer — the object already exists when `__init__` runs. `__new__` is the actual constructor that creates the object.",
        "Using `@staticmethod` when `@classmethod` is more appropriate. If the method needs to create instances (factory method) or access class attributes, use `@classmethod` so subclasses work correctly.",
        "Thinking double underscore `__attr` makes it truly private. It only triggers name mangling (`_ClassName__attr`). Python has no true private attributes — everything is accessible.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between `__init__` and `__new__` in Python?",
          a: "`__new__` is the **constructor** — it creates and returns a new instance of the class. It's a static method that takes `cls` as its first argument. `__init__` is the **initializer** — it sets up the instance after it's been created. It takes `self` (the already-created instance) as its first argument and returns `None`. Call order: `__new__(cls)` → creates object → `__init__(self)` → initializes it. You rarely override `__new__` unless implementing singletons, immutable types (can't modify in `__init__`), or metaclasses.",
        },
        {
          type: "tricky",
          q: "What happens when you set `obj.class_attr = value` vs `ClassName.class_attr = value`?",
          a: "`ClassName.class_attr = value` modifies the **class attribute** — all instances that haven't overridden it will see the new value. `obj.class_attr = value` creates a **new instance attribute** on `obj` that **shadows** the class attribute. Other instances still see the original class attribute. This is because Python's attribute lookup first checks the instance dict, then the class dict. This is a common source of bugs with mutable class attributes — `obj.my_list.append(x)` modifies the shared class list (no new attribute created), but `obj.my_list = [x]` creates a new instance attribute.",
        },
        {
          type: "scenario",
          q: "When would you use @classmethod vs @staticmethod? Give examples.",
          a: "**`@classmethod`** — when the method needs access to the class itself (`cls`): 1) **Factory methods** — alternative constructors: `Date.from_string('2024-01-01')`. Using `cls` ensures subclasses create instances of the correct type. 2) **Class-level operations** — counting instances, accessing class attributes. **`@staticmethod`** — when the method doesn't need access to class or instance: 1) **Utility functions** — `Date.is_valid(2024, 13, 1)` — pure logic related to the class but not needing its state. 2) **Namespace organization** — grouping related functions under a class. **Rule of thumb:** If in doubt, use `@classmethod`. If the method could be a standalone function and you're just putting it in the class for organization, use `@staticmethod`.",
        },
      ],
    },
    {
      id: "py-inheritance-polymorphism",
      title: "Inheritance & Polymorphism",
      explanation: `Python supports **single inheritance**, **multiple inheritance**, and **abstract base classes**. The Method Resolution Order (MRO) determines which method gets called in a class hierarchy.

**Inheritance types:**
- **Single inheritance:** \`class Child(Parent)\` — one parent class
- **Multiple inheritance:** \`class Child(Parent1, Parent2)\` — multiple parents
- **Multilevel inheritance:** \`class C(B)\`, \`class B(A)\` — chain of parents

**The \`super()\` function:**
\`super()\` calls methods from the parent class following the MRO. It's essential for cooperative multiple inheritance — each class calls \`super()\` to ensure all parents' methods run.

**Method Resolution Order (MRO):**
Python uses the **C3 linearization** algorithm to determine the order in which classes are searched for methods. You can inspect it with \`ClassName.__mro__\` or \`ClassName.mro()\`.

**Abstract Base Classes (ABCs):**
ABCs define interfaces — they declare methods that subclasses MUST implement. Use the \`abc\` module:
\`\`\`python
from abc import ABC, abstractmethod
class Shape(ABC):
    @abstractmethod
    def area(self): pass
\`\`\`
You cannot instantiate an ABC directly — subclasses must implement all abstract methods.

**Duck typing** is Python's preferred polymorphism style: "If it walks like a duck and quacks like a duck, it's a duck." Instead of checking types, check for capabilities (methods/attributes).`,
      codeExample: `# ============================================================
# Single inheritance
# ============================================================
class Animal:
    def __init__(self, name: str, sound: str):
        self.name = name
        self.sound = sound

    def speak(self) -> str:
        return f"{self.name} says {self.sound}!"

    def __str__(self) -> str:
        return f"{self.__class__.__name__}({self.name})"

class Dog(Animal):
    def __init__(self, name: str, breed: str):
        super().__init__(name, "Woof")  # Call parent's __init__
        self.breed = breed

    def fetch(self, item: str) -> str:
        return f"{self.name} fetches the {item}!"

class Cat(Animal):
    def __init__(self, name: str):
        super().__init__(name, "Meow")

    def speak(self) -> str:
        # Override parent method
        return f"{self.name} purrs softly... then says {self.sound}!"

# Polymorphism — same interface, different behavior
animals = [Dog("Rex", "German Shepherd"), Cat("Whiskers")]
for animal in animals:
    print(animal.speak())
    # Rex says Woof!
    # Whiskers purrs softly... then says Meow!

# isinstance and issubclass
print(isinstance(animals[0], Dog))     # True
print(isinstance(animals[0], Animal))  # True (inheritance chain)
print(issubclass(Dog, Animal))         # True

# ============================================================
# Multiple inheritance and MRO
# ============================================================
class Flyable:
    def fly(self):
        return f"{self.name} is flying!"

class Swimmable:
    def swim(self):
        return f"{self.name} is swimming!"

class Duck(Animal, Flyable, Swimmable):
    def __init__(self, name):
        super().__init__(name, "Quack")

donald = Duck("Donald")
print(donald.speak())   # Donald says Quack!
print(donald.fly())     # Donald is flying!
print(donald.swim())    # Donald is swimming!

# Inspect MRO
print(Duck.__mro__)
# (Duck, Animal, Flyable, Swimmable, object)

# ============================================================
# The diamond problem and super()
# ============================================================
class Base:
    def __init__(self):
        print("Base.__init__")

class Left(Base):
    def __init__(self):
        print("Left.__init__")
        super().__init__()  # Calls Right.__init__ (not Base!)

class Right(Base):
    def __init__(self):
        print("Right.__init__")
        super().__init__()  # Calls Base.__init__

class Diamond(Left, Right):
    def __init__(self):
        print("Diamond.__init__")
        super().__init__()  # Calls Left.__init__

# d = Diamond()
# Output:
# Diamond.__init__
# Left.__init__
# Right.__init__    ← super() in Left calls Right, not Base!
# Base.__init__     ← Base is called only ONCE

# MRO: Diamond → Left → Right → Base → object

# ============================================================
# Abstract Base Classes
# ============================================================
from abc import ABC, abstractmethod

class Shape(ABC):
    """Abstract base class for shapes."""

    @abstractmethod
    def area(self) -> float:
        """Calculate the area."""
        pass

    @abstractmethod
    def perimeter(self) -> float:
        """Calculate the perimeter."""
        pass

    def describe(self) -> str:
        """Concrete method using abstract methods."""
        return f"{self.__class__.__name__}: area={self.area():.2f}, perimeter={self.perimeter():.2f}"

# shape = Shape()  # TypeError: Can't instantiate abstract class

class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        import math
        return math.pi * self.radius ** 2

    def perimeter(self) -> float:
        import math
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height

    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

# Polymorphism with abstract base class
shapes = [Circle(5), Rectangle(4, 6)]
for shape in shapes:
    print(shape.describe())
    # Circle: area=78.54, perimeter=31.42
    # Rectangle: area=24.00, perimeter=20.00

# ============================================================
# Duck typing — Pythonic polymorphism
# ============================================================
class FileWriter:
    def write(self, data):
        with open("output.txt", "a") as f:
            f.write(data)

class ConsoleWriter:
    def write(self, data):
        print(data)

class NetworkWriter:
    def write(self, data):
        # Simulate sending data over network
        print(f"Sending: {data}")

def save_report(writer, data):
    """Works with ANY object that has a write() method."""
    writer.write(data)  # Duck typing — no type check needed

# All three work without a shared base class
save_report(ConsoleWriter(), "Hello")
save_report(NetworkWriter(), "Hello")

# Check capabilities instead of types
def safe_write(writer, data):
    if hasattr(writer, 'write') and callable(writer.write):
        writer.write(data)
    else:
        raise TypeError(f"{type(writer).__name__} doesn't support write()")`,
      exercise: `**Exercises:**

1. Create a class hierarchy: \`Vehicle\` (base) → \`Car\`, \`Motorcycle\`, \`Truck\`. Each has \`fuel_efficiency()\` and \`__str__\`. Write a function that calculates total fuel cost for a fleet using polymorphism.

2. Implement the diamond problem: create classes A, B(A), C(A), D(B, C) with a method \`greet()\` in each. Trace the MRO and explain the output when \`D().greet()\` is called with \`super()\`.

3. Create an ABC \`Database\` with abstract methods \`connect()\`, \`query()\`, \`close()\`. Implement \`SQLiteDB\`, \`PostgresDB\`, and \`MockDB\` subclasses.

4. Demonstrate duck typing: create three unrelated classes that all have a \`serialize()\` method. Write a generic \`export(items)\` function that calls \`serialize()\` on each.

5. Implement a \`Mixin\` pattern: create \`JSONSerializableMixin\`, \`LoggableMixin\`, and \`ValidatableMixin\`. Show how a class can use multiple mixins without deep inheritance.

6. Create a \`Plugin\` system using ABCs: define a \`PluginBase\` ABC, implement several plugins, and write a loader that discovers and instantiates all plugins.`,
      commonMistakes: [
        "Forgetting to call `super().__init__()` in subclass constructors — parent attributes won't be initialized, causing AttributeError later.",
        "Using deep inheritance hierarchies (more than 3-4 levels). Prefer composition over inheritance: `class Car: engine = Engine()` instead of `class Car(Engine)`.",
        "Not understanding MRO in multiple inheritance — `super()` doesn't always call the immediate parent. It follows the MRO, which can be surprising in diamond inheritance.",
        "Checking types with `type(obj) == SomeClass` instead of `isinstance(obj, SomeClass)`. The former doesn't work with inheritance; the latter checks the entire hierarchy.",
        "Using abstract base classes when duck typing would suffice. Python's philosophy is 'ask for forgiveness, not permission' — try the operation, handle the exception if it fails (EAFP).",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the MRO (Method Resolution Order) and C3 linearization in Python.",
          a: "**MRO** is the order Python searches for methods in a class hierarchy. Python uses **C3 linearization** to compute the MRO, which ensures: 1) **Children come before parents.** 2) **If class X inherits from A then B, A is checked before B.** 3) **No class appears more than once.** 4) **Consistent ordering** — if A comes before B in one class, A comes before B everywhere. You can inspect with `cls.__mro__` or `cls.mro()`. C3 linearization resolves the **diamond problem** — each class appears exactly once, so `Base.__init__` runs only once even with multiple inheritance paths.",
        },
        {
          type: "conceptual",
          q: "What is the difference between composition and inheritance? When to use each?",
          a: "**Inheritance** = 'is-a' relationship: `class Dog(Animal)` — a Dog IS an Animal. Use when there's a genuine type hierarchy and you want polymorphism. **Composition** = 'has-a' relationship: `class Car: def __init__(self): self.engine = Engine()` — a Car HAS an Engine. Use when you want to reuse behavior without being locked into a hierarchy. **Prefer composition when:** behavior can change at runtime, you need to combine multiple behaviors (avoid multiple inheritance complexity), or the relationship isn't truly 'is-a'. **The Liskov Substitution Principle** is the test: if a subclass can't fully substitute for its parent everywhere, use composition instead.",
        },
        {
          type: "coding",
          q: "Implement a simple observer pattern using inheritance and polymorphism.",
          a: "```python\nfrom abc import ABC, abstractmethod\n\nclass Observer(ABC):\n    @abstractmethod\n    def update(self, event, data):\n        pass\n\nclass EventEmitter:\n    def __init__(self):\n        self._observers = {}\n\n    def on(self, event, observer):\n        self._observers.setdefault(event, []).append(observer)\n\n    def emit(self, event, data=None):\n        for observer in self._observers.get(event, []):\n            observer.update(event, data)\n\nclass Logger(Observer):\n    def update(self, event, data):\n        print(f'[LOG] {event}: {data}')\n\nclass EmailNotifier(Observer):\n    def update(self, event, data):\n        print(f'[EMAIL] Notification for {event}')\n\nemitter = EventEmitter()\nemitter.on('user_created', Logger())\nemitter.on('user_created', EmailNotifier())\nemitter.emit('user_created', {'name': 'Alice'})\n```",
        },
      ],
    },
    {
      id: "py-magic-methods",
      title: "Magic Methods (Dunder Methods)",
      explanation: `**Magic methods** (also called dunder methods for "double underscore") are special methods that Python calls implicitly to perform operations. They let you customize how objects behave with operators, built-in functions, and language constructs.

**Categories of magic methods:**

| Category | Methods | Triggered By |
|----------|---------|-------------|
| **Construction** | \`__new__\`, \`__init__\`, \`__del__\` | Object creation/destruction |
| **String** | \`__str__\`, \`__repr__\`, \`__format__\` | \`str()\`, \`repr()\`, \`f"{}"\` |
| **Comparison** | \`__eq__\`, \`__lt__\`, \`__le__\`, etc. | \`==\`, \`<\`, \`<=\` |
| **Arithmetic** | \`__add__\`, \`__sub__\`, \`__mul__\`, etc. | \`+\`, \`-\`, \`*\` |
| **Container** | \`__len__\`, \`__getitem__\`, \`__contains__\` | \`len()\`, \`[]\`, \`in\` |
| **Callable** | \`__call__\` | \`obj()\` |
| **Context** | \`__enter__\`, \`__exit__\` | \`with\` statement |
| **Attribute** | \`__getattr__\`, \`__setattr__\` | \`.\` access |
| **Hashing** | \`__hash__\` | \`hash()\`, dict keys |

**Essential rules:**
- \`__str__\` is for end-users (readable), \`__repr__\` is for developers (unambiguous). If only one is defined, define \`__repr__\`.
- If you define \`__eq__\`, you should usually define \`__hash__\` too (or set it to \`None\` to make the object unhashable).
- Arithmetic methods have "reflected" versions (\`__radd__\`, \`__rsub__\`) for when the left operand doesn't support the operation.
- Use \`@functools.total_ordering\` to auto-generate comparison methods from just \`__eq__\` and \`__lt__\`.`,
      codeExample: `# ============================================================
# String representation: __str__ and __repr__
# ============================================================
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        """Unambiguous representation (for developers)."""
        return f"Vector({self.x}, {self.y})"

    def __str__(self):
        """Readable representation (for users)."""
        return f"({self.x}, {self.y})"

    def __format__(self, spec):
        """Custom formatting: f'{v:.2f}'"""
        if spec:
            return f"({self.x:{spec}}, {self.y:{spec}})"
        return str(self)

v = Vector(3.14159, 2.71828)
print(repr(v))        # Vector(3.14159, 2.71828)
print(str(v))         # (3.14159, 2.71828)
print(f"{v:.2f}")     # (3.14, 2.72)

# ============================================================
# Arithmetic operators
# ============================================================
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        return NotImplemented

    def __sub__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x - other.x, self.y - other.y)
        return NotImplemented

    def __mul__(self, scalar):
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        return NotImplemented

    def __rmul__(self, scalar):
        """Reflected multiply: allows 3 * vector."""
        return self.__mul__(scalar)

    def __abs__(self):
        """Magnitude: abs(vector)."""
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __neg__(self):
        return Vector(-self.x, -self.y)

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)

print(v1 + v2)     # Vector(4, 6)
print(v1 - v2)     # Vector(-2, -2)
print(v1 * 3)      # Vector(3, 6)
print(3 * v1)      # Vector(3, 6) — works because of __rmul__
print(abs(v2))      # 5.0
print(-v1)          # Vector(-1, -2)

# ============================================================
# Comparison operators with total_ordering
# ============================================================
from functools import total_ordering

@total_ordering
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    def __eq__(self, other):
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius == other.celsius

    def __lt__(self, other):
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius < other.celsius

    def __hash__(self):
        return hash(self.celsius)

    def __repr__(self):
        return f"Temperature({self.celsius}°C)"

t1 = Temperature(20)
t2 = Temperature(30)
t3 = Temperature(20)

print(t1 < t2)     # True
print(t1 >= t3)     # True (auto-generated by total_ordering)
print(t1 == t3)     # True
print(sorted([t2, t1, Temperature(25)]))  # [20°C, 25°C, 30°C]

# Can use as dict key because __hash__ is defined
temps = {t1: "comfortable", t2: "hot"}

# ============================================================
# Container protocol: __len__, __getitem__, __contains__
# ============================================================
class Deck:
    """A deck of playing cards."""
    suits = ["Hearts", "Diamonds", "Clubs", "Spades"]
    ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10",
             "Jack", "Queen", "King", "Ace"]

    def __init__(self):
        self.cards = [
            f"{rank} of {suit}"
            for suit in self.suits
            for rank in self.ranks
        ]

    def __len__(self):
        return len(self.cards)

    def __getitem__(self, index):
        return self.cards[index]

    def __contains__(self, card):
        return card in self.cards

    def __iter__(self):
        return iter(self.cards)

deck = Deck()
print(len(deck))                     # 52
print(deck[0])                       # "2 of Hearts"
print(deck[-1])                      # "Ace of Spades"
print(deck[10:13])                   # Slicing works!
print("Ace of Spades" in deck)       # True

# Iteration works because of __iter__
for card in deck:
    if "Ace" in card:
        print(card)

# ============================================================
# __call__ — making objects callable
# ============================================================
class Validator:
    def __init__(self, min_val, max_val):
        self.min_val = min_val
        self.max_val = max_val

    def __call__(self, value):
        """Makes the object callable like a function."""
        if not self.min_val <= value <= self.max_val:
            raise ValueError(
                f"{value} not in range [{self.min_val}, {self.max_val}]"
            )
        return True

# Use like a function
validate_age = Validator(0, 150)
validate_score = Validator(0, 100)

print(validate_age(25))     # True
print(validate_score(85))   # True
# validate_age(200)         # ValueError

# Callable check
print(callable(validate_age))  # True`,
      exercise: `**Exercises:**

1. Create a \`Money\` class with currency and amount. Implement \`+\`, \`-\`, \`*\`, comparison operators, and \`__format__\` for currency display. Raise errors for different currencies.

2. Build a \`Matrix\` class that supports \`+\`, \`*\` (matrix multiplication), \`len()\`, \`[row][col]\` indexing, and \`__repr__\`.

3. Implement a \`Range\`-like class with \`__len__\`, \`__getitem__\`, \`__contains__\`, and \`__iter__\`. Support slicing via \`__getitem__\`.

4. Create a \`Throttle\` class using \`__call__\` that limits how many times a function can be called per second.

5. Implement \`__enter__\` and \`__exit__\` to create a \`Timer\` context manager: \`with Timer() as t: ...\` prints elapsed time.

6. Build a class that supports attribute access via dot notation AND dictionary syntax by implementing \`__getattr__\` and \`__getitem__\`.`,
      commonMistakes: [
        "Only implementing `__str__` without `__repr__`. `__repr__` is used in more contexts (debugger, containers, fallback for `str()`). Always implement `__repr__`; optionally add `__str__`.",
        "Returning something other than `NotImplemented` when an operation isn't supported. Return `NotImplemented` (not raise `NotImplementedError`) to let Python try the reflected method on the other operand.",
        "Defining `__eq__` without `__hash__`. In Python 3, if you define `__eq__`, `__hash__` is set to `None` (making instances unhashable). Define `__hash__` if objects need to be dict keys or set members.",
        "Using magic methods directly: `obj.__len__()` instead of `len(obj)`. The built-in functions have additional checks and optimizations. Always use the built-in functions.",
        "Implementing too many magic methods. Only implement those that make sense for your class. A `User` object probably shouldn't support `+` or `*` operators.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between `__str__` and `__repr__`? When is each called?",
          a: "`__repr__` is the **official** string representation — it should be unambiguous and ideally valid Python that could recreate the object: `Vector(3, 4)`. Called by `repr()`, in the interactive interpreter, and as a fallback for `str()`. `__str__` is the **informal** representation — it should be readable and user-friendly: `(3, 4)`. Called by `str()`, `print()`, and `f'{obj}'`. **Rule:** Always implement `__repr__`. Add `__str__` only if you want a different, more readable format. If `__str__` is not defined, `str()` falls back to `__repr__`.",
        },
        {
          type: "tricky",
          q: "What does `NotImplemented` mean vs `NotImplementedError`?",
          a: "`NotImplemented` is a **special singleton value** returned from magic methods to signal 'I don't know how to do this operation with this type'. Python then tries the **reflected method** on the other operand. Example: `a + b` → calls `a.__add__(b)`, if it returns `NotImplemented`, Python tries `b.__radd__(a)`. `NotImplementedError` is an **exception** raised to indicate an abstract method that subclasses must override. Returning `NotImplementedError` from `__add__` is a bug — it should be `return NotImplemented` (no Error). They serve completely different purposes.",
        },
        {
          type: "coding",
          q: "Implement a `__getattr__` that provides dot-access to dictionary keys (like JavaScript objects).",
          a: "```python\nclass DotDict:\n    def __init__(self, data=None):\n        # Use object.__setattr__ to avoid recursion\n        object.__setattr__(self, '_data', data or {})\n\n    def __getattr__(self, key):\n        try:\n            value = self._data[key]\n            if isinstance(value, dict):\n                return DotDict(value)  # Recursive for nested dicts\n            return value\n        except KeyError:\n            raise AttributeError(f\"No attribute '{key}'\")\n\n    def __setattr__(self, key, value):\n        self._data[key] = value\n\n    def __repr__(self):\n        return f\"DotDict({self._data})\"\n\nconfig = DotDict({'db': {'host': 'localhost', 'port': 5432}})\nprint(config.db.host)  # 'localhost'\nprint(config.db.port)  # 5432\n```",
        },
      ],
    },
  ],
};

export default pyPhase4;
