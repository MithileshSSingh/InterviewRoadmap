const pyPhase2 = {
  id: "phase-2",
  title: "Phase 2: Control Flow & Data Structures",
  emoji: "🔀",
  description:
    "Master conditionals, loops, and Python's powerful built-in data structures — lists, tuples, dictionaries, sets, and strings.",
  topics: [
    {
      id: "py-conditionals",
      title: "Conditionals & Pattern Matching",
      explanation: `Python's conditional statements are straightforward but have some unique features compared to other languages. Python uses **indentation** (not braces) to define blocks, and supports **structural pattern matching** (match-case) since Python 3.10.

**Basic if/elif/else:**
Python uses \`elif\` instead of \`else if\`. There's no switch statement in Python before 3.10 — use \`if/elif\` chains or dictionary dispatch instead.

**Ternary (conditional) expression:**
\`\`\`python
result = value_if_true if condition else value_if_false
\`\`\`
This is Python's version of \`condition ? a : b\` from C/JavaScript.

**Structural Pattern Matching (Python 3.10+):**
The \`match\`/\`case\` statement is NOT just a switch — it's a powerful pattern matching system that can destructure data, match types, apply guards, and bind variables. It's similar to pattern matching in Rust or Scala.

**Key patterns:**
- **Literal patterns:** match exact values (\`case 200:\`)
- **Capture patterns:** bind to a variable (\`case x:\`)
- **Wildcard pattern:** match anything (\`case _:\`)
- **Sequence patterns:** destructure lists/tuples (\`case [x, y]:\`)
- **Mapping patterns:** destructure dicts (\`case {"key": value}:\`)
- **Class patterns:** match object attributes (\`case Point(x=0, y=y):\`)
- **OR patterns:** match alternatives (\`case 200 | 201:\`)
- **Guard clauses:** add conditions (\`case x if x > 0:\`)`,
      codeExample: `# ============================================================
# Basic conditionals
# ============================================================
age = 25

if age < 13:
    category = "child"
elif age < 18:
    category = "teenager"
elif age < 65:
    category = "adult"
else:
    category = "senior"

print(f"{age} years old → {category}")

# ============================================================
# Ternary expression
# ============================================================
x = 10
result = "even" if x % 2 == 0 else "odd"
print(f"{x} is {result}")

# Nested ternary (avoid in production — hard to read)
grade = 85
letter = "A" if grade >= 90 else "B" if grade >= 80 else "C" if grade >= 70 else "F"
print(f"Grade: {letter}")

# ============================================================
# Truthiness in conditionals
# ============================================================
# Python evaluates these as False:
#   False, None, 0, 0.0, "", [], {}, set(), ()

items = []
if not items:
    print("List is empty")  # Pythonic way to check emptiness

# BAD:  if len(items) == 0:
# GOOD: if not items:

name = ""
display = name or "Anonymous"  # Short-circuit default

# ============================================================
# Structural Pattern Matching (Python 3.10+)
# ============================================================

# Basic value matching
def http_status(status):
    match status:
        case 200:
            return "OK"
        case 301:
            return "Moved Permanently"
        case 404:
            return "Not Found"
        case 500:
            return "Internal Server Error"
        case _:
            return f"Unknown status: {status}"

print(http_status(200))  # "OK"
print(http_status(418))  # "Unknown status: 418"

# OR patterns
def classify_status(status):
    match status:
        case 200 | 201 | 202:
            return "Success"
        case 301 | 302 | 307:
            return "Redirect"
        case 400 | 401 | 403 | 404:
            return "Client Error"
        case 500 | 502 | 503:
            return "Server Error"
        case _:
            return "Unknown"

# Sequence patterns (destructuring)
def process_command(command):
    match command.split():
        case ["quit"]:
            return "Quitting..."
        case ["go", direction]:
            return f"Going {direction}"
        case ["get", item, "from", location]:
            return f"Getting {item} from {location}"
        case ["drop", *items]:
            return f"Dropping: {', '.join(items)}"
        case _:
            return f"Unknown command: {command}"

print(process_command("go north"))           # Going north
print(process_command("get sword from chest"))  # Getting sword from chest
print(process_command("drop apple banana"))  # Dropping: apple, banana

# Mapping patterns (dict destructuring)
def process_event(event):
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"Click at ({x}, {y})"
        case {"type": "keypress", "key": key}:
            return f"Key pressed: {key}"
        case {"type": "scroll", "direction": "up" | "down" as dir}:
            return f"Scrolling {dir}"
        case _:
            return "Unknown event"

print(process_event({"type": "click", "x": 100, "y": 200}))
print(process_event({"type": "keypress", "key": "Enter"}))

# Guard clauses (if conditions on patterns)
def classify_point(point):
    match point:
        case (0, 0):
            return "Origin"
        case (x, 0):
            return f"X-axis at {x}"
        case (0, y):
            return f"Y-axis at {y}"
        case (x, y) if x == y:
            return f"On diagonal at ({x}, {y})"
        case (x, y) if x > 0 and y > 0:
            return f"Quadrant I: ({x}, {y})"
        case (x, y):
            return f"Point at ({x}, {y})"

print(classify_point((0, 0)))     # Origin
print(classify_point((5, 5)))     # On diagonal at (5, 5)
print(classify_point((3, 4)))     # Quadrant I: (3, 4)

# ============================================================
# Dictionary dispatch pattern (alternative to if/elif chains)
# ============================================================
def add(a, b): return a + b
def sub(a, b): return a - b
def mul(a, b): return a * b
def div(a, b): return a / b if b != 0 else "Error: division by zero"

operations = {
    "+": add,
    "-": sub,
    "*": mul,
    "/": div,
}

op = "+"
result = operations.get(op, lambda a, b: "Unknown op")(10, 3)
print(f"10 {op} 3 = {result}")  # 10 + 3 = 13`,
      exercise: `**Exercises:**

1. Write a function \`classify_bmi(bmi)\` that returns "underweight", "normal", "overweight", or "obese" based on BMI ranges. Use both if/elif and match-case versions.

2. Implement a simple command parser using match-case that handles: "help", "quit", "say <message>", "move <direction> <steps>", and unknown commands.

3. Create a \`describe_type(value)\` function that uses match-case with type patterns to describe any Python value (e.g., "integer: 42", "empty list", "dict with 3 keys").

4. Implement a dictionary dispatch calculator that supports +, -, *, /, **, and %. Handle division by zero gracefully.

5. Write a function that takes a nested dict representing a JSON API response and uses match-case with mapping patterns to extract different fields based on the response type.

6. Rewrite complex if/elif chains in your own code using match-case. Compare readability.`,
      commonMistakes: [
        "Using `if x == True:` instead of `if x:`. The latter is more Pythonic and works with any truthy value. Only use `is True` when you specifically need to distinguish `True` from other truthy values.",
        "Forgetting that Python has no switch fallthrough — each `case` block is independent. There's no need for `break` statements like in C/Java.",
        "Using match-case as a simple switch when if/elif would be clearer for 2-3 conditions. Match-case shines with destructuring, not simple value comparisons.",
        "Not understanding that `case x:` in match-case is a capture pattern (binds any value to x), not a comparison to a variable `x`. To compare to a variable, use a guard: `case val if val == x:`.",
        "Writing empty `if` blocks. Use `pass` as a placeholder if you intentionally want to do nothing: `if condition: pass`.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does Python's match-case differ from switch-case in Java or C?",
          a: "Python's match-case is **structural pattern matching**, far more powerful than switch-case: 1) **No fallthrough** — each case is independent, no `break` needed. 2) **Destructuring** — can unpack sequences, dicts, and objects. 3) **Guards** — `case x if x > 0:` adds conditions. 4) **Capture variables** — `case [first, *rest]:` binds values. 5) **Type matching** — `case int(x):` matches by type. Switch-case only matches literal values. Python's match-case is closer to Rust's `match` or Scala's pattern matching.",
        },
        {
          type: "tricky",
          q: "What is the output? `x = 5; match x: case 5: print('five')` — Does this work?",
          a: "**No**, this raises a `SyntaxError`. Match-case requires proper indentation — the `case` must be indented under `match`, and the body under `case`:\n```python\nmatch x:\n    case 5:\n        print('five')\n```\nPython is indentation-sensitive, and match-case follows the same block rules as if/else. Also note that `match` and `case` are **soft keywords** — they're only special in match-case context and can be used as variable names elsewhere.",
        },
        {
          type: "scenario",
          q: "You need to handle 20+ different message types in a chat application. How would you structure the dispatch?",
          a: "For 20+ types, I'd use a **dictionary dispatch pattern** or a **registry pattern** rather than a long if/elif chain or match-case: \n```python\nhandlers = {\n    'text': handle_text,\n    'image': handle_image,\n    'video': handle_video,\n    # ... 20+ handlers\n}\n\ndef dispatch(message):\n    handler = handlers.get(message['type'])\n    if handler:\n        return handler(message)\n    return handle_unknown(message)\n```\nBenefits: O(1) lookup, easy to extend (add handlers without modifying dispatch logic), testable (each handler is independent), and handlers can be registered dynamically. For complex destructuring of message payloads, combine dict dispatch with match-case inside individual handlers.",
        },
      ],
    },
    {
      id: "py-loops",
      title: "Loops & Iteration",
      explanation: `Python's loop constructs are designed for **clarity** and **expressiveness**. The \`for\` loop iterates over any iterable (lists, strings, dicts, files, generators), while \`while\` loops run until a condition is false. Python has unique features like \`else\` clauses on loops and powerful iteration tools.

**for loop:** Iterates over any iterable — NOT a traditional C-style counter loop:
\`\`\`python
for item in iterable:
    process(item)
\`\`\`

**while loop:** Repeats while a condition is true:
\`\`\`python
while condition:
    do_something()
\`\`\`

**Loop control:**
- \`break\` — exit the loop immediately
- \`continue\` — skip to the next iteration
- \`else\` on loops — executes when the loop completes **without** \`break\`

**Essential iteration tools:**
- \`range(start, stop, step)\` — generates a sequence of numbers
- \`enumerate(iterable, start=0)\` — yields (index, item) pairs
- \`zip(iter1, iter2, ...)\` — pairs up elements from multiple iterables
- \`reversed(sequence)\` — iterates in reverse
- \`sorted(iterable, key=...)\` — returns sorted list

The \`else\` clause on loops is a Python-unique feature that many developers find confusing. It runs when the loop exits **normally** (not via \`break\`). Think of it as "no-break" — if the loop completes without breaking, the \`else\` block executes.`,
      codeExample: `# ============================================================
# for loops — iterating over sequences
# ============================================================
fruits = ["apple", "banana", "cherry"]

# Basic iteration
for fruit in fruits:
    print(fruit)

# With index — use enumerate (NOT range(len(...)))
# BAD:
for i in range(len(fruits)):
    print(f"{i}: {fruits[i]}")

# GOOD:
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# Start counting from 1
for i, fruit in enumerate(fruits, start=1):
    print(f"#{i}: {fruit}")

# ============================================================
# range() — generating number sequences
# ============================================================
# range(stop) — 0 to stop-1
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# range(start, stop) — start to stop-1
for i in range(2, 7):
    print(i)  # 2, 3, 4, 5, 6

# range(start, stop, step)
for i in range(0, 20, 3):
    print(i)  # 0, 3, 6, 9, 12, 15, 18

# Counting down
for i in range(10, 0, -1):
    print(i)  # 10, 9, 8, ..., 1

# ============================================================
# zip() — parallel iteration
# ============================================================
names = ["Alice", "Bob", "Charlie"]
ages = [30, 25, 35]
cities = ["NYC", "LA", "Chicago"]

# Iterate multiple sequences together
for name, age, city in zip(names, ages, cities):
    print(f"{name}, {age}, {city}")

# zip stops at the shortest iterable
short = [1, 2]
long = [10, 20, 30, 40]
print(list(zip(short, long)))  # [(1, 10), (2, 20)]

# Use zip_longest to pad with defaults
from itertools import zip_longest
print(list(zip_longest(short, long, fillvalue=0)))
# [(1, 10), (2, 20), (0, 30), (0, 40)]

# Unzipping with zip
pairs = [("a", 1), ("b", 2), ("c", 3)]
letters, numbers = zip(*pairs)  # Transpose
print(letters)  # ('a', 'b', 'c')
print(numbers)  # (1, 2, 3)

# ============================================================
# while loops
# ============================================================
# Basic countdown
count = 5
while count > 0:
    print(count)
    count -= 1
print("Liftoff!")

# Input validation loop
# while True:
#     value = input("Enter a positive number: ")
#     if value.isdigit() and int(value) > 0:
#         break
#     print("Invalid input, try again")

# ============================================================
# Loop else clause (runs when loop completes WITHOUT break)
# ============================================================
# Use case: searching for an item
def find_prime_factor(n):
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            print(f"Found factor: {i}")
            break
    else:
        # No factor found — n is prime
        print(f"{n} is prime!")

find_prime_factor(17)   # "17 is prime!"
find_prime_factor(15)   # "Found factor: 3"

# Practical: search with fallback
def find_user(users, target_id):
    for user in users:
        if user["id"] == target_id:
            print(f"Found: {user['name']}")
            break
    else:
        print(f"User {target_id} not found")

users = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
find_user(users, 2)  # "Found: Bob"
find_user(users, 5)  # "User 5 not found"

# ============================================================
# break and continue
# ============================================================
# Skip even numbers, stop at 8
for i in range(1, 20):
    if i % 2 == 0:
        continue    # Skip this iteration
    if i > 8:
        break       # Exit the loop
    print(i)        # 1, 3, 5, 7

# ============================================================
# Iterating over dictionaries
# ============================================================
scores = {"Alice": 95, "Bob": 87, "Charlie": 92}

# Keys (default)
for name in scores:
    print(name)

# Values
for score in scores.values():
    print(score)

# Both keys and values
for name, score in scores.items():
    print(f"{name}: {score}")

# ============================================================
# Nested loops with product()
# ============================================================
from itertools import product

# Instead of nested for loops:
# for x in range(3):
#     for y in range(3):
#         print(f"({x}, {y})")

# Use itertools.product:
for x, y in product(range(3), range(3)):
    print(f"({x}, {y})")`,
      exercise: `**Exercises:**

1. Write a FizzBuzz implementation using a for loop: print numbers 1-100, but print "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for multiples of both.

2. Use \`enumerate\` and \`zip\` to merge two lists into a dictionary with index-based keys: given \`["a", "b", "c"]\` and \`[1, 2, 3]\`, produce \`{0: ("a", 1), 1: ("b", 2), 2: ("c", 3)}\`.

3. Write a function that uses a \`for...else\` loop to check if a number is prime. The \`else\` block should handle the "is prime" case.

4. Implement a simple number guessing game using a \`while\` loop: generate a random number 1-100, give hints ("too high"/"too low"), count attempts.

5. Use \`itertools.product\` to generate all possible combinations of sizes (S, M, L, XL) and colors (red, blue, green) as a list of tuples.

6. Write a nested loop that prints a multiplication table (1-12). Format the output in a clean grid using f-string alignment.`,
      commonMistakes: [
        "Using `range(len(list))` to iterate with index instead of `enumerate()`. The Pythonic way is `for i, item in enumerate(items):`.",
        "Modifying a list while iterating over it — this causes skipped items or errors. Create a copy: `for item in items[:]` or use list comprehension to filter.",
        "Misunderstanding the `else` clause on loops — it does NOT run when the loop body encounters a falsy value. It runs when the loop completes **without `break`**.",
        "Using `while True` without a clear exit condition (break). Always ensure infinite loops have a reachable `break` to avoid hanging programs.",
        "Not using `zip()` for parallel iteration. Instead of `for i in range(len(a)): print(a[i], b[i])`, use `for x, y in zip(a, b): print(x, y)`.",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What does the `else` clause on a `for` loop do? When does it execute?",
          a: "The `else` clause on a `for` or `while` loop executes when the loop completes **normally** — i.e., it was NOT terminated by a `break` statement. If the loop body calls `break`, the `else` block is skipped. If the iterable is empty (the loop body never executes), the `else` block still runs. Think of it as 'no-break' rather than 'else'. Common use case: search loops where `break` signals 'found' and `else` handles 'not found'.",
        },
        {
          type: "coding",
          q: "Flatten a nested list `[[1, 2], [3, [4, 5]], 6]` into `[1, 2, 3, 4, 5, 6]` without using any libraries.",
          a: "```python\ndef flatten(nested):\n    result = []\n    for item in nested:\n        if isinstance(item, list):\n            result.extend(flatten(item))  # Recursive\n        else:\n            result.append(item)\n    return result\n\nprint(flatten([[1, 2], [3, [4, 5]], 6]))\n# [1, 2, 3, 4, 5, 6]\n```\nThis uses recursion to handle arbitrary nesting depth. For single-level flattening, use `[item for sublist in nested for item in sublist]` or `itertools.chain.from_iterable(nested)`.",
        },
        {
          type: "conceptual",
          q: "What is the difference between `range()` in Python 2 and Python 3?",
          a: "In **Python 2**, `range()` returns a **list** (materializes all values in memory) and `xrange()` returns a lazy iterator. In **Python 3**, `range()` returns a **range object** — a lazy, memory-efficient sequence that generates values on demand. It supports `len()`, indexing (`range(10)[5]`), membership testing (`5 in range(10)`), and slicing. `xrange()` was removed. This means `range(1_000_000_000)` uses almost no memory in Python 3, while in Python 2 it would try to create a billion-element list.",
        },
      ],
    },
    {
      id: "py-lists-tuples",
      title: "Lists & Tuples",
      explanation: `**Lists** and **tuples** are Python's primary ordered sequence types. Lists are **mutable** (can be modified after creation), while tuples are **immutable** (cannot be changed). This distinction has important implications for performance, safety, and usage patterns.

**When to use each:**

| Use Case | List | Tuple |
|----------|------|-------|
| Collection of similar items | Yes | Possible but less common |
| Record of different fields | Possible but less common | Yes |
| Dictionary key | No (unhashable) | Yes (hashable) |
| Function return value (multiple) | Possible | Yes (idiomatic) |
| Needs modification | Yes | No (create new tuple) |
| Memory efficiency | Less | More |
| Thread safety | No (needs locking) | Yes (immutable) |

**List comprehensions** are a Pythonic way to create lists from existing iterables. They're more readable and often faster than equivalent \`for\` loops with \`.append()\`.

\`\`\`python
# Syntax: [expression for item in iterable if condition]
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
\`\`\`

**Slicing** is Python's powerful way to extract subsequences: \`sequence[start:stop:step]\`. It works on lists, tuples, strings, and any sequence type.

**Unpacking** lets you assign sequence elements to multiple variables in one line: \`a, b, c = [1, 2, 3]\`. The \`*\` operator captures remaining elements.`,
      codeExample: `# ============================================================
# List creation and operations
# ============================================================
# Creating lists
empty = []
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True, None]  # Any types
nested = [[1, 2], [3, 4], [5, 6]]

# List from other iterables
from_range = list(range(5))       # [0, 1, 2, 3, 4]
from_string = list("hello")       # ['h', 'e', 'l', 'l', 'o']
from_generator = list(x**2 for x in range(5))  # [0, 1, 4, 9, 16]

# ============================================================
# List methods (modify in-place)
# ============================================================
fruits = ["apple", "banana"]

fruits.append("cherry")        # Add to end → ['apple', 'banana', 'cherry']
fruits.insert(1, "blueberry")  # Insert at index → ['apple', 'blueberry', 'banana', 'cherry']
fruits.extend(["date", "fig"]) # Add multiple items

fruits.remove("banana")        # Remove by value (first occurrence)
popped = fruits.pop()          # Remove and return last item
popped_at = fruits.pop(0)      # Remove and return at index

fruits.sort()                  # Sort in-place (returns None!)
fruits.sort(reverse=True)      # Sort descending
fruits.reverse()               # Reverse in-place

idx = fruits.index("cherry")   # Find index of value
count = fruits.count("cherry") # Count occurrences

# IMPORTANT: sort() returns None, not the sorted list!
# BAD:  sorted_list = my_list.sort()  # sorted_list is None!
# GOOD: sorted_list = sorted(my_list)  # Returns new sorted list

# ============================================================
# Slicing [start:stop:step]
# ============================================================
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

print(nums[2:5])      # [2, 3, 4] — index 2 to 4 (stop is exclusive)
print(nums[:3])        # [0, 1, 2] — first 3 elements
print(nums[7:])        # [7, 8, 9] — from index 7 to end
print(nums[-3:])       # [7, 8, 9] — last 3 elements
print(nums[::2])       # [0, 2, 4, 6, 8] — every 2nd element
print(nums[::-1])      # [9, 8, 7, ..., 0] — reversed
print(nums[1:8:2])     # [1, 3, 5, 7] — every 2nd from index 1 to 7

# Slice assignment (lists only — tuples are immutable)
nums[2:5] = [20, 30, 40]  # Replace slice
print(nums)  # [0, 1, 20, 30, 40, 5, 6, 7, 8, 9]

# Delete slice
del nums[2:5]
print(nums)  # [0, 1, 5, 6, 7, 8, 9]

# ============================================================
# List comprehensions
# ============================================================
# Basic comprehension
squares = [x**2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition (filter)
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print(even_squares)  # [0, 4, 16, 36, 64]

# With if-else (transform, not filter)
labels = ["even" if x % 2 == 0 else "odd" for x in range(5)]
print(labels)  # ['even', 'odd', 'even', 'odd', 'even']

# Nested comprehension (flattening)
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
print(flat)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Matrix transpose with nested comprehension
transposed = [[row[i] for row in matrix] for i in range(3)]
print(transposed)  # [[1, 4, 7], [2, 5, 8], [3, 6, 9]]

# ============================================================
# Unpacking
# ============================================================
# Basic unpacking
a, b, c = [1, 2, 3]
print(a, b, c)  # 1 2 3

# Star unpacking (Python 3)
first, *middle, last = [1, 2, 3, 4, 5]
print(first)    # 1
print(middle)   # [2, 3, 4]
print(last)     # 5

head, *tail = [1, 2, 3, 4, 5]
print(head)  # 1
print(tail)  # [2, 3, 4, 5]

# Swap variables
x, y = 10, 20
x, y = y, x  # Swap without temp variable!

# Ignore values with _
_, second, _, fourth, _ = [10, 20, 30, 40, 50]
print(second, fourth)  # 20 40

# ============================================================
# Tuples — immutable sequences
# ============================================================
point = (3, 4)
rgb = (255, 128, 0)
single = (42,)    # Note the comma! (42) is just 42 in parentheses

# Tuple unpacking in functions
def get_user():
    return "Alice", 30, "NYC"  # Returns a tuple (parens optional)

name, age, city = get_user()

# Named tuples — tuples with field names
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)
print(p.x, p.y)      # 3 4 (access by name)
print(p[0], p[1])     # 3 4 (access by index)

# Tuples as dictionary keys (lists can't be keys)
locations = {
    (40.7128, -74.0060): "New York",
    (51.5074, -0.1278): "London",
}
print(locations[(40.7128, -74.0060)])  # "New York"

# ============================================================
# Copying: shallow vs deep
# ============================================================
import copy

original = [[1, 2], [3, 4]]
shallow = original.copy()        # or list(original) or original[:]
deep = copy.deepcopy(original)

original[0][0] = 99

print(shallow)  # [[99, 2], [3, 4]] — inner lists are shared!
print(deep)     # [[1, 2], [3, 4]] — completely independent`,
      exercise: `**Exercises:**

1. Use list comprehension to generate a list of all Pythagorean triples (a, b, c) where a, b, c <= 30 and a^2 + b^2 = c^2.

2. Implement a function \`rotate_list(lst, k)\` that rotates a list by k positions to the right. \`[1,2,3,4,5]\` rotated by 2 → \`[4,5,1,2,3]\`. Use slicing.

3. Write a function that takes a list of strings and returns only the palindromes, sorted by length. Use list comprehension.

4. Demonstrate the difference between shallow copy and deep copy with a nested list. Modify the inner list and show which copy is affected.

5. Use unpacking to swap two variables, extract the first and last elements of a list, and split a list into head and tail.

6. Create a 5x5 identity matrix using nested list comprehensions. Then transpose it.

7. Implement a simple stack (LIFO) and queue (FIFO) using only list operations (\`append\`, \`pop\`).`,
      commonMistakes: [
        "Confusing `sort()` (in-place, returns None) with `sorted()` (returns new list). Writing `result = my_list.sort()` gives `result = None`.",
        "Modifying a list while iterating: `for item in lst: if condition: lst.remove(item)` skips items. Use list comprehension or iterate over a copy.",
        "Creating a list of lists with `[[]] * 5` — this creates 5 references to the SAME list. Use `[[] for _ in range(5)]` for independent inner lists.",
        "Forgetting the comma in single-element tuples: `t = (42)` is just `int(42)`, not a tuple. Use `t = (42,)` or `t = 42,`.",
        "Using `.append()` when you mean `.extend()`: `[1,2].append([3,4])` gives `[1, 2, [3, 4]]`, not `[1, 2, 3, 4]`. Use `.extend()` or `+` to concatenate.",
      ],
      interviewQuestions: [
        {
          type: "tricky",
          q: "What is the output of `a = [[]] * 3; a[0].append(1); print(a)`?",
          a: "Output: `[[1], [1], [1]]`. The `*` operator creates three references to the **same inner list**, not three independent lists. Modifying one affects all three because they're the same object. Fix: `a = [[] for _ in range(3)]` creates independent lists. You can verify with `a[0] is a[1]` — it returns `True` for the `*` version.",
        },
        {
          type: "conceptual",
          q: "When should you use a tuple instead of a list?",
          a: "Use **tuples** when: 1) Data is a **fixed record** (e.g., `(name, age, city)`) — semantically different fields. 2) You need **hashability** — tuples can be dict keys and set members, lists cannot. 3) **Immutability is desired** — prevents accidental modification, signals intent. 4) **Returning multiple values** from functions. 5) **Memory efficiency** — tuples are smaller than lists. Use **lists** when: data is a **homogeneous collection** that may grow/shrink, you need to sort/modify in-place. Rule of thumb: if elements have different meanings (like coordinates), use tuple. If elements are interchangeable (like a list of scores), use list.",
        },
        {
          type: "coding",
          q: "Write a function that groups consecutive duplicate elements: `[1,1,2,3,3,3,2,2]` → `[[1,1],[2],[3,3,3],[2,2]]`.",
          a: "```python\ndef group_consecutive(lst):\n    if not lst:\n        return []\n    result = [[lst[0]]]\n    for item in lst[1:]:\n        if item == result[-1][-1]:\n            result[-1].append(item)\n        else:\n            result.append([item])\n    return result\n\n# Or using itertools.groupby:\nfrom itertools import groupby\ndef group_consecutive_v2(lst):\n    return [list(group) for _, group in groupby(lst)]\n```",
        },
      ],
    },
  ],
};

export default pyPhase2;
