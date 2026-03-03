const pyPhase2b = [
  {
    id: "py-dictionaries-sets",
    title: "Dictionaries & Sets",
    explanation: `**Dictionaries** (\`dict\`) are Python's built-in hash map — key-value pairs with O(1) average lookup, insertion, and deletion. They are the backbone of Python programming, used everywhere from function kwargs to JSON data to object attributes.

**Sets** are unordered collections of unique elements, backed by hash tables. They provide O(1) membership testing and support mathematical set operations (union, intersection, difference).

**Dictionary key requirements:**
Keys must be **hashable** (immutable): strings, numbers, tuples (of hashable elements), frozensets. Lists, dicts, and sets **cannot** be dictionary keys.

**Dictionary ordering:**
Since Python 3.7, dictionaries maintain **insertion order** (this was an implementation detail in CPython 3.6, made part of the language spec in 3.7).

**Dict comprehensions:**
\`\`\`python
{key_expr: value_expr for item in iterable if condition}
\`\`\`

**Useful dict methods:**
- \`.get(key, default)\` — return default if key missing (instead of KeyError)
- \`.setdefault(key, default)\` — set and return default if key missing
- \`.update(other)\` — merge another dict (or key-value pairs)
- \`.pop(key, default)\` — remove and return value
- \`|=\` merge operator (Python 3.9+) — \`dict1 |= dict2\`

**Set operations:**

| Operation | Method | Operator | Result |
|-----------|--------|----------|--------|
| Union | \`a.union(b)\` | \`a \\| b\` | All elements from both |
| Intersection | \`a.intersection(b)\` | \`a & b\` | Common elements |
| Difference | \`a.difference(b)\` | \`a - b\` | Elements in a but not b |
| Symmetric diff | \`a.symmetric_difference(b)\` | \`a ^ b\` | Elements in either, not both |`,
    codeExample: `# ============================================================
# Dictionary creation
# ============================================================
# Literal syntax
user = {"name": "Alice", "age": 30, "city": "NYC"}

# From pairs
pairs = [("a", 1), ("b", 2), ("c", 3)]
d = dict(pairs)

# From kwargs
d = dict(name="Alice", age=30)

# Dict comprehension
squares = {x: x**2 for x in range(6)}
print(squares)  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# From keys with default value
keys = ["a", "b", "c"]
d = dict.fromkeys(keys, 0)  # {'a': 0, 'b': 0, 'c': 0}

# ============================================================
# Accessing and modifying
# ============================================================
user = {"name": "Alice", "age": 30}

# Access
print(user["name"])           # "Alice"
# print(user["email"])        # KeyError!
print(user.get("email"))      # None (no error)
print(user.get("email", "N/A"))  # "N/A" (custom default)

# Modify
user["age"] = 31              # Update existing
user["email"] = "a@b.com"     # Add new key

# Remove
del user["email"]             # Remove key (KeyError if missing)
age = user.pop("age")         # Remove and return value
last = user.popitem()         # Remove and return last inserted pair

# setdefault: get or set
cache = {}
cache.setdefault("key", []).append(1)
cache.setdefault("key", []).append(2)
print(cache)  # {'key': [1, 2]}

# ============================================================
# Merging dictionaries
# ============================================================
defaults = {"theme": "dark", "lang": "en", "font_size": 14}
user_prefs = {"theme": "light", "font_size": 16}

# Method 1: unpacking (Python 3.5+)
config = {**defaults, **user_prefs}
print(config)  # {'theme': 'light', 'lang': 'en', 'font_size': 16}

# Method 2: merge operator (Python 3.9+)
config = defaults | user_prefs  # Returns new dict
defaults |= user_prefs          # In-place merge

# ============================================================
# Iterating dictionaries
# ============================================================
scores = {"Alice": 95, "Bob": 87, "Charlie": 92, "Diana": 88}

# Keys, values, items
for key in scores:                    # Iterate keys
    print(key)
for value in scores.values():         # Iterate values
    print(value)
for name, score in scores.items():    # Iterate pairs
    print(f"{name}: {score}")

# Sort by value
for name, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
    print(f"{name}: {score}")

# ============================================================
# defaultdict — auto-initialize missing keys
# ============================================================
from collections import defaultdict

# Group items by category
items = [("fruit", "apple"), ("veggie", "carrot"),
         ("fruit", "banana"), ("veggie", "pea")]

grouped = defaultdict(list)
for category, item in items:
    grouped[category].append(item)  # No KeyError, auto-creates list

print(dict(grouped))
# {'fruit': ['apple', 'banana'], 'veggie': ['carrot', 'pea']}

# Count occurrences
word_count = defaultdict(int)
for word in "the cat sat on the mat".split():
    word_count[word] += 1  # Auto-initializes to 0

print(dict(word_count))
# {'the': 2, 'cat': 1, 'sat': 1, 'on': 1, 'mat': 1}

# ============================================================
# Counter — specialized dict for counting
# ============================================================
from collections import Counter

words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counts = Counter(words)
print(counts)                  # Counter({'apple': 3, 'banana': 2, 'cherry': 1})
print(counts.most_common(2))   # [('apple', 3), ('banana', 2)]
print(counts["apple"])         # 3
print(counts["grape"])         # 0 (no KeyError!)

# Counter arithmetic
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(c1 + c2)  # Counter({'a': 4, 'b': 3})
print(c1 - c2)  # Counter({'a': 2})  (drops zero/negative)

# ============================================================
# Sets
# ============================================================
# Creation
s = {1, 2, 3, 4, 5}
empty_set = set()       # NOT {} — that's an empty dict!
from_list = set([1, 2, 2, 3, 3, 3])  # {1, 2, 3} — duplicates removed

# Operations
a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}

print(a | b)    # {1, 2, 3, 4, 5, 6, 7, 8} — union
print(a & b)    # {4, 5} — intersection
print(a - b)    # {1, 2, 3} — difference
print(a ^ b)    # {1, 2, 3, 6, 7, 8} — symmetric difference

# Membership (O(1) — very fast!)
print(3 in a)   # True

# Subset/superset
print({1, 2} <= a)     # True — is subset
print(a >= {1, 2})     # True — is superset

# Set methods
a.add(6)               # Add element
a.discard(10)          # Remove if present (no error)
a.remove(6)            # Remove (KeyError if not present)

# Practical: remove duplicates while preserving order
items = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
unique = list(dict.fromkeys(items))  # [3, 1, 4, 5, 9, 2, 6]

# frozenset — immutable set (can be dict key or set member)
fs = frozenset([1, 2, 3])
d = {fs: "immutable set as key"}`,
    exercise: `**Exercises:**

1. Write a function that counts word frequencies in a text and returns the top N most common words. Use both \`Counter\` and a manual \`defaultdict\` approach.

2. Given two lists of student IDs, find: students in both lists, students in only the first list, students in either list but not both. Use set operations.

3. Implement a function \`deep_merge(dict1, dict2)\` that recursively merges nested dictionaries (unlike \`|=\` which overwrites nested dicts).

4. Create an inverted index: given a dict of \`{document_id: [words]}\`, produce \`{word: [document_ids]}\` using \`defaultdict\`.

5. Write a \`group_by(items, key_func)\` function that groups a list of items by the result of \`key_func\`, returning a dict of lists. Use \`defaultdict\`.

6. Implement LRU (Least Recently Used) behavior using an \`OrderedDict\`: access moves an item to the end, insertion at the end, eviction from the front when capacity is exceeded.`,
    commonMistakes: [
      "Creating an empty set with `{}` — this creates an empty **dict**, not a set. Use `set()` for an empty set.",
      "Accessing dict keys with `d[key]` without checking existence. Use `d.get(key, default)` or `key in d` check to avoid `KeyError`.",
      "Assuming dict order before Python 3.7. In Python 3.7+ dicts maintain insertion order, but if you need guaranteed ordering in older code, use `collections.OrderedDict`.",
      "Using mutable objects (lists, dicts) as dictionary keys. Keys must be hashable. Use tuples instead of lists, frozensets instead of sets.",
      "Using `dict.fromkeys(keys, [])` to create a dict with empty list values — all values reference the SAME list. Use `{k: [] for k in keys}` instead.",
    ],
    interviewQuestions: [
      {
        type: "conceptual",
        q: "What is the time complexity of dict operations? How does Python implement dictionaries?",
        a: "Python dicts use a **hash table**: 1) `d[key]` lookup: **O(1)** average, O(n) worst case (hash collisions). 2) `d[key] = value` insertion: **O(1)** average. 3) `del d[key]` deletion: **O(1)** average. 4) `key in d` membership: **O(1)** average. Internally, Python computes `hash(key)` to find the slot index, handles collisions with open addressing (probing). Since Python 3.6, dicts use a compact representation that also maintains insertion order. The hash table resizes (doubles) when it reaches ~2/3 capacity, which is an O(n) operation but amortized to O(1).",
      },
      {
        type: "coding",
        q: "Write a function that finds the first non-repeating character in a string using a dictionary.",
        a: "```python\ndef first_unique_char(s):\n    counts = {}\n    for char in s:\n        counts[char] = counts.get(char, 0) + 1\n    for char in s:\n        if counts[char] == 1:\n            return char\n    return None\n\n# Or using Counter:\nfrom collections import Counter\ndef first_unique_char_v2(s):\n    counts = Counter(s)\n    return next((c for c in s if counts[c] == 1), None)\n\nprint(first_unique_char('aabccbdee'))  # 'd'\n```\nBoth approaches are O(n) time and O(k) space where k is the alphabet size.",
      },
      {
        type: "tricky",
        q: "What happens when you modify a dict while iterating over it?",
        a: "It raises `RuntimeError: dictionary changed size during iteration`. This applies to adding or deleting keys during iteration over `dict.keys()`, `dict.values()`, or `dict.items()`. **Solutions:** 1) Iterate over a copy: `for k in list(d.keys()): ...` 2) Collect keys to modify, then modify after the loop. 3) Use dict comprehension to create a new dict. Note: modifying existing values (not adding/removing keys) during iteration is safe: `for k in d: d[k] += 1` works fine.",
      },
    ],
  },
  {
    id: "py-strings-formatting",
    title: "Strings & Text Processing",
    explanation: `Strings in Python are **immutable sequences** of Unicode characters. Python 3 uses **UTF-8** by default, meaning strings can contain characters from any language. Understanding string methods, formatting, and encoding is essential for data processing, web development, and file I/O.

**String creation:**
- Single quotes: \`'hello'\`
- Double quotes: \`"hello"\` (identical to single)
- Triple quotes: \`'''multi-line'''\` or \`"""docstring"""\`
- Raw strings: \`r"no \\n escaping"\`
- Byte strings: \`b"binary data"\`
- f-strings: \`f"Hello, {name}!"\` (Python 3.6+)

**f-strings** (formatted string literals) are the modern, preferred way to format strings. They're faster than \`.format()\` and \`%\` formatting, more readable, and support arbitrary expressions.

**Common string patterns:**
- **Validation:** \`.isdigit()\`, \`.isalpha()\`, \`.isalnum()\`, \`.isspace()\`
- **Transformation:** \`.upper()\`, \`.lower()\`, \`.title()\`, \`.strip()\`, \`.replace()\`
- **Searching:** \`.find()\`, \`.index()\`, \`.startswith()\`, \`.endswith()\`, \`in\`
- **Splitting/Joining:** \`.split()\`, \`.join()\`, \`.partition()\`

**Regular expressions** (\`re\` module) provide powerful pattern matching for complex text processing tasks.`,
    codeExample: `# ============================================================
# String methods
# ============================================================
s = "  Hello, World!  "

# Whitespace handling
print(s.strip())       # "Hello, World!" — remove leading/trailing whitespace
print(s.lstrip())      # "Hello, World!  " — left strip only
print(s.rstrip())      # "  Hello, World!" — right strip only

# Case transformation
print("hello".upper())         # "HELLO"
print("HELLO".lower())         # "hello"
print("hello world".title())   # "Hello World"
print("hello world".capitalize())  # "Hello world"
print("Hello".swapcase())      # "hELLO"

# Searching
text = "Python is awesome and Python is fun"
print(text.find("Python"))       # 0 (first occurrence index)
print(text.find("Python", 1))    # 26 (find after index 1)
print(text.find("Java"))         # -1 (not found)
print(text.count("Python"))      # 2

print(text.startswith("Python"))  # True
print(text.endswith("fun"))       # True

# Replacing
print(text.replace("Python", "JavaScript"))
# "JavaScript is awesome and JavaScript is fun"

print(text.replace("Python", "JS", 1))  # Replace only first occurrence
# "JS is awesome and Python is fun"

# Splitting and joining
csv_line = "Alice,30,NYC,Engineer"
parts = csv_line.split(",")    # ['Alice', '30', 'NYC', 'Engineer']
print(parts)

words = "  hello   world  foo  ".split()  # Split on any whitespace
print(words)  # ['hello', 'world', 'foo']

# Join — the opposite of split
print(", ".join(["Alice", "Bob", "Charlie"]))  # "Alice, Bob, Charlie"
print("\\n".join(["line1", "line2", "line3"]))  # Multi-line string

# partition — split into 3 parts at first occurrence
email = "user@example.com"
user, at, domain = email.partition("@")
print(f"User: {user}, Domain: {domain}")

# ============================================================
# f-strings (Python 3.6+) — the modern way
# ============================================================
name = "Alice"
age = 30
balance = 1234567.891

# Basic interpolation
print(f"Name: {name}, Age: {age}")

# Expressions
print(f"Next year: {age + 1}")
print(f"Name length: {len(name)}")
print(f"Uppercase: {name.upper()}")

# Format specifiers
print(f"Currency: ${balance:,.2f}")      # $1,234,567.89
print(f"Percentage: {0.856:.1%}")        # 85.6%
print(f"Padded: {42:08d}")              # 00000042
print(f"Binary: {255:08b}")             # 11111111
print(f"Hex: {255:#06x}")               # 0x00ff
print(f"Scientific: {12345.6789:.2e}")   # 1.23e+04

# Alignment
print(f"{'left':<20}|")     # "left                |"
print(f"{'right':>20}|")    # "               right|"
print(f"{'center':^20}|")   # "       center       |"
print(f"{'padded':*^20}")   # "*******padded*******"

# Debugging with = (Python 3.8+)
x = 42
print(f"{x = }")          # "x = 42"
print(f"{x * 2 = }")      # "x * 2 = 84"
print(f"{name = !r}")     # "name = 'Alice'" (with repr)

# Multi-line f-strings
report = (
    f"User Report\\n"
    f"{'='*40}\\n"
    f"Name:    {name}\\n"
    f"Age:     {age}\\n"
    f"Balance: ${balance:,.2f}"
)
print(report)

# ============================================================
# Regular expressions basics
# ============================================================
import re

text = "Contact: alice@email.com or bob@company.org"

# Find all email addresses
emails = re.findall(r'[\\w.]+@[\\w.]+\\.\\w+', text)
print(emails)  # ['alice@email.com', 'bob@company.org']

# Search (first match)
match = re.search(r'(\\w+)@(\\w+)\\.\\w+', text)
if match:
    print(f"Full match: {match.group()}")    # alice@email.com
    print(f"Username: {match.group(1)}")     # alice
    print(f"Domain: {match.group(2)}")       # email

# Substitution
cleaned = re.sub(r'\\d{3}-\\d{4}', 'XXX-XXXX', "Call 555-1234 or 555-5678")
print(cleaned)  # "Call XXX-XXXX or XXX-XXXX"

# Compiled patterns (faster for repeated use)
email_pattern = re.compile(r'[\\w.]+@[\\w.]+\\.\\w+')
all_emails = email_pattern.findall(text)

# Common patterns
phone = re.compile(r'\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b')
url = re.compile(r'https?://[\\w./\\-?=&]+')
ip = re.compile(r'\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b')

# ============================================================
# String encoding
# ============================================================
# str → bytes (encode)
text = "Hello, 世界! 🌍"
encoded = text.encode('utf-8')
print(encoded)  # b'Hello, \\xe4\\xb8\\x96\\xe7\\x95\\x8c! \\xf0\\x9f\\x8c\\x8d'

# bytes → str (decode)
decoded = encoded.decode('utf-8')
print(decoded)  # "Hello, 世界! 🌍"

# Length difference: str counts characters, bytes counts bytes
print(len(text))     # 12 characters
print(len(encoded))  # 18 bytes (CJK chars = 3 bytes, emoji = 4 bytes)`,
    exercise: `**Exercises:**

1. Write a function \`is_palindrome(s)\` that checks if a string is a palindrome, ignoring case, spaces, and punctuation. Example: "A man, a plan, a canal: Panama" → True.

2. Implement a Caesar cipher: write \`encrypt(text, shift)\` and \`decrypt(text, shift)\` functions. Handle uppercase, lowercase, and non-alpha characters.

3. Parse a log file line like \`"2024-01-15 14:30:22 [ERROR] Database connection timeout"\` and extract the date, time, level, and message using both \`.split()\` and regex.

4. Create a \`format_table(headers, rows)\` function that displays data in a formatted ASCII table with column alignment. Use f-string formatting.

5. Write a function that converts between cases: \`snake_case\` → \`camelCase\` → \`PascalCase\` → \`kebab-case\`. Handle edge cases.

6. Use regex to validate: email addresses, phone numbers (various formats), and URLs. Write comprehensive test cases for each.`,
    commonMistakes: [
      "Using `+` for string concatenation in loops — it creates new string objects each time (O(n^2)). Use `''.join(list)` or f-strings instead.",
      "Forgetting that strings are immutable — `s.upper()` returns a NEW string, it doesn't modify `s`. You must assign: `s = s.upper()`.",
      "Using `.format()` or `%` formatting when f-strings are available (Python 3.6+). f-strings are faster, more readable, and more powerful.",
      "Not using raw strings for regex patterns — `re.search('\\d+', text)` should be `re.search(r'\\d+', text)`. Without `r`, `\\d` is interpreted as an escape sequence.",
      "Confusing `str.find()` (returns -1 if not found) with `str.index()` (raises ValueError if not found). Use `find()` when absence is expected, `index()` when absence is an error.",
    ],
    interviewQuestions: [
      {
        type: "coding",
        q: "Reverse the words in a string: 'Hello World Python' → 'Python World Hello'. Do it without using `split()` and `join()`.",
        a: "```python\ndef reverse_words(s):\n    # Method 1: Using split/join (simple)\n    return ' '.join(s.split()[::-1])\n\n# Method 2: Without split/join\ndef reverse_words_manual(s):\n    result = []\n    word = []\n    for char in s:\n        if char == ' ':\n            if word:\n                result.append(''.join(word))\n                word = []\n        else:\n            word.append(char)\n    if word:\n        result.append(''.join(word))\n    result.reverse()\n    return ' '.join(result)\n\nprint(reverse_words('Hello World Python'))  # 'Python World Hello'\n```",
      },
      {
        type: "tricky",
        q: "Why is string concatenation with `+` in a loop O(n^2)? What's the alternative?",
        a: "Strings are **immutable** in Python. Each `s += 'x'` creates a **new string object**, copies the old string content plus the new character. For n concatenations: 1st copy = 1 char, 2nd = 2 chars, ..., nth = n chars. Total work: 1 + 2 + ... + n = **O(n^2)**. **Alternative:** Collect strings in a list and `join()` at the end:\n```python\n# BAD: O(n^2)\nresult = ''\nfor s in strings:\n    result += s\n\n# GOOD: O(n)\nresult = ''.join(strings)\n```\n`join()` pre-calculates the total length, allocates one string, and copies each piece once — O(n) total.",
      },
      {
        type: "conceptual",
        q: "Explain the difference between `str`, `bytes`, and `bytearray` in Python 3.",
        a: "**`str`** — immutable sequence of **Unicode code points** (text). `'Hello'` is str. **`bytes`** — immutable sequence of **integers 0-255** (binary data). `b'Hello'` is bytes. Used for file I/O, network data, encoding. **`bytearray`** — mutable version of bytes. Can be modified in-place. Use for binary data that needs to be modified (buffers, protocols). **Conversions:** `str.encode('utf-8')` → `bytes`, `bytes.decode('utf-8')` → `str`. In Python 3, text and binary data are strictly separated — you can't mix str and bytes operations without explicit encoding/decoding.",
      },
    ],
  },
];

export default pyPhase2b;
