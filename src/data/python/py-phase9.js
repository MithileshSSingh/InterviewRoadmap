const pyPhase9 = {
  id: "phase-9",
  title: "Phase 9: Testing & Debugging",
  emoji: "🧪",
  description:
    "Master Python's testing ecosystem with unittest and pytest, learn mocking strategies for isolated tests, debug effectively with pdb and profiling tools, and enforce code quality with linters and formatters.",
  topics: [
    {
      id: "py-unittest-pytest",
      title: "unittest & pytest",
      explanation: `Python has two primary testing frameworks: the built-in **unittest** module and the third-party **pytest** library. Understanding both is essential because legacy codebases often use unittest while modern projects overwhelmingly prefer pytest for its concise syntax and powerful features.

**unittest** follows the xUnit pattern (inspired by JUnit). Tests are organized into classes that inherit from \`unittest.TestCase\`, and assertion methods like \`assertEqual\`, \`assertTrue\`, and \`assertRaises\` are provided as instance methods. Setup and teardown logic is handled through \`setUp()\`, \`tearDown()\`, \`setUpClass()\`, and \`tearDownClass()\` methods.

**pytest** takes a radically different approach — test functions are plain functions (no class required), assertions use the native \`assert\` statement with **introspection** that provides detailed failure messages automatically, and **fixtures** replace setup/teardown with a dependency injection model.

**Key pytest features:**
- **Fixtures** — reusable setup/teardown via \`@pytest.fixture\` with configurable scopes (function, class, module, session)
- **Parametrize** — run the same test with multiple inputs via \`@pytest.mark.parametrize\`
- **Marks** — tag tests with \`@pytest.mark.slow\`, \`@pytest.mark.integration\`, etc. for selective execution
- **conftest.py** — shared fixtures and hooks, automatically discovered by pytest without imports
- **Plugins** — rich ecosystem: \`pytest-cov\` (coverage), \`pytest-xdist\` (parallel), \`pytest-asyncio\` (async tests), \`pytest-mock\` (mocking)

**Test discovery:** pytest automatically finds files matching \`test_*.py\` or \`*_test.py\`, classes prefixed with \`Test\`, and functions prefixed with \`test_\`. This convention-over-configuration approach reduces boilerplate dramatically.

In production environments, pytest's fixture system is what sets it apart. Fixtures can depend on other fixtures forming a **dependency graph**, they can yield (for setup + teardown in one function), and \`conftest.py\` files at different directory levels enable hierarchical fixture sharing across test suites.`,
      codeExample: `# ============================================================
# unittest basics — test_calculator_unittest.py
# ============================================================
import unittest
from decimal import Decimal


class Calculator:
    """Production calculator with error handling."""

    def add(self, a, b):
        return a + b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

    def percentage(self, value, total):
        if total == 0:
            raise ValueError("Total cannot be zero")
        return Decimal(str(value)) / Decimal(str(total)) * 100


class TestCalculator(unittest.TestCase):
    """unittest-style tests for Calculator."""

    @classmethod
    def setUpClass(cls):
        """Run once before all tests in this class."""
        cls.calc = Calculator()
        print("\\nCalculator test suite starting...")

    def setUp(self):
        """Run before each individual test method."""
        self.test_data = [(2, 3, 5), (0, 0, 0), (-1, 1, 0)]

    def test_add_positive_numbers(self):
        self.assertEqual(self.calc.add(2, 3), 5)

    def test_add_negative_numbers(self):
        self.assertEqual(self.calc.add(-1, -2), -3)

    def test_divide_normal(self):
        self.assertAlmostEqual(self.calc.divide(10, 3), 3.3333, places=4)

    def test_divide_by_zero_raises(self):
        with self.assertRaises(ValueError) as ctx:
            self.calc.divide(10, 0)
        self.assertIn("Cannot divide by zero", str(ctx.exception))

    def test_percentage_calculation(self):
        result = self.calc.percentage(25, 200)
        self.assertEqual(result, Decimal("12.5"))

    def tearDown(self):
        """Run after each individual test method."""
        self.test_data = None

    @classmethod
    def tearDownClass(cls):
        """Run once after all tests in this class."""
        print("Calculator test suite complete.")


# ============================================================
# pytest fundamentals — test_calculator_pytest.py
# ============================================================
import pytest


# --- Fixtures: reusable setup with dependency injection ---
@pytest.fixture
def calculator():
    """Provides a fresh Calculator instance for each test."""
    return Calculator()


@pytest.fixture
def sample_data():
    """Provides test data as a fixture."""
    return {
        "positive_pairs": [(1, 2, 3), (10, 20, 30), (100, 200, 300)],
        "negative_pairs": [(-1, -2, -3), (-10, 20, 10)],
        "zero_pairs": [(0, 5, 5), (5, 0, 5)],
    }


@pytest.fixture(scope="module")
def expensive_resource():
    """
    Module-scoped fixture — created once per test module.
    Scope options: function (default), class, module, session.
    """
    print("\\n[SETUP] Creating expensive resource...")
    resource = {"connection": "db://localhost", "pool_size": 5}
    yield resource  # yield turns this into a setup + teardown fixture
    print("\\n[TEARDOWN] Releasing expensive resource...")


# --- Basic pytest tests: plain functions + assert ---
def test_add_basic(calculator):
    """Fixtures are injected by name — no inheritance needed."""
    assert calculator.add(2, 3) == 5


def test_add_with_floats(calculator):
    result = calculator.add(0.1, 0.2)
    assert result == pytest.approx(0.3)  # handles float comparison


def test_divide_by_zero(calculator):
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        calculator.divide(10, 0)


# --- Parametrize: run same test with multiple inputs ---
@pytest.mark.parametrize(
    "a, b, expected",
    [
        (2, 3, 5),
        (0, 0, 0),
        (-1, 1, 0),
        (100, -50, 50),
        (1.5, 2.5, 4.0),
    ],
    ids=["positive", "zeros", "mixed", "large", "floats"],
)
def test_add_parametrized(calculator, a, b, expected):
    assert calculator.add(a, b) == expected


@pytest.mark.parametrize(
    "value, total, expected",
    [
        (50, 200, Decimal("25")),
        (1, 3, Decimal("33.33333333333333333333333333")),
        (0, 100, Decimal("0")),
    ],
)
def test_percentage_parametrized(calculator, value, total, expected):
    result = calculator.percentage(value, total)
    assert result == expected


# --- Marks: tag and filter tests ---
@pytest.mark.slow
def test_heavy_computation(calculator):
    """Run with: pytest -m slow"""
    total = sum(calculator.add(i, i) for i in range(100_000))
    assert total == 9_999_900_000


@pytest.mark.skip(reason="Feature not yet implemented")
def test_future_feature():
    pass


@pytest.mark.skipif(
    not hasattr(Calculator, "sqrt"),
    reason="sqrt method not available",
)
def test_sqrt_method():
    pass


@pytest.mark.xfail(reason="Known float precision issue", strict=True)
def test_known_float_issue(calculator):
    assert calculator.add(0.1, 0.2) == 0.3  # fails without approx


# --- Using fixtures with yield (setup + teardown) ---
@pytest.fixture
def temp_file(tmp_path):
    """tmp_path is a built-in pytest fixture providing a temp directory."""
    file_path = tmp_path / "test_output.txt"
    file_path.write_text("initial content")
    yield file_path
    # Teardown: cleanup happens after the test
    if file_path.exists():
        file_path.unlink()


def test_file_operations(temp_file):
    assert temp_file.read_text() == "initial content"
    temp_file.write_text("modified content")
    assert temp_file.read_text() == "modified content"


# ============================================================
# conftest.py — shared fixtures across test modules
# ============================================================
# File: tests/conftest.py
# No imports needed — pytest auto-discovers conftest.py files

# @pytest.fixture(scope="session")
# def db_connection():
#     """Session-scoped: one connection for the entire test run."""
#     conn = create_connection("sqlite:///:memory:")
#     conn.execute("CREATE TABLE users (id INT, name TEXT)")
#     yield conn
#     conn.close()
#
# @pytest.fixture(autouse=True)
# def reset_db(db_connection):
#     """autouse=True means this runs for EVERY test automatically."""
#     yield
#     db_connection.execute("DELETE FROM users")


# ============================================================
# Running tests
# ============================================================
# pytest                            # run all tests
# pytest test_file.py               # run specific file
# pytest test_file.py::test_func    # run specific test
# pytest -m slow                    # run only @pytest.mark.slow
# pytest -m "not slow"              # skip slow tests
# pytest -k "add"                   # run tests matching "add"
# pytest -v                         # verbose output
# pytest -x                         # stop on first failure
# pytest --tb=short                 # shorter tracebacks
# pytest --cov=src --cov-report=html  # coverage report
# pytest -n auto                    # parallel with pytest-xdist

if __name__ == "__main__":
    unittest.main()`,
      exercise: `**Exercises:**

1. Write a \`BankAccount\` class with \`deposit\`, \`withdraw\`, and \`get_balance\` methods. Create a comprehensive test suite using pytest with at least 8 tests covering normal operations, edge cases (negative amounts, overdraft), and expected exceptions.

2. Create a \`conftest.py\` with three fixtures: a \`bank_account\` fixture (function scope), a \`funded_account\` fixture that depends on \`bank_account\` (deposits \\$1000), and a \`db_session\` fixture (module scope) with yield-based teardown.

3. Use \`@pytest.mark.parametrize\` to test a \`validate_email()\` function with at least 10 different inputs (valid and invalid emails). Include custom \`ids\` for readable test output.

4. Set up marks: create tests tagged with \`@pytest.mark.unit\`, \`@pytest.mark.integration\`, and \`@pytest.mark.slow\`. Register them in \`pytest.ini\` or \`pyproject.toml\` and demonstrate running specific groups.

5. Port a unittest.TestCase class to pytest-style functions. Compare the line count and readability of both versions. Note which patterns (like \`assertRaises\`, \`setUpClass\`) map to which pytest equivalents.

6. Configure \`pytest-cov\` to generate an HTML coverage report. Analyze uncovered lines and write tests to achieve at least 95% coverage on your \`BankAccount\` module.`,
      commonMistakes: [
        "Sharing mutable state across tests without proper fixture isolation. Each test must be independent — use function-scoped fixtures or reset state in teardown. Tests that depend on execution order are fragile and mask bugs.",
        "Using `assertEqual` or `assertTrue` in pytest instead of plain `assert`. Pytest's assertion introspection provides superior error messages with `assert`, showing actual vs expected values automatically.",
        "Putting test logic in `conftest.py` — it should only contain fixtures and hooks, never actual test functions. Pytest will silently ignore test functions defined in conftest files.",
        "Forgetting that `@pytest.fixture(autouse=True)` applies to ALL tests in scope, which can cause unexpected behavior. Use autouse sparingly and prefer explicit fixture injection.",
        "Not parameterizing tests that differ only in input data. Copy-pasted tests with different values are a maintenance burden. Use `@pytest.mark.parametrize` to express the pattern once.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain pytest fixtures vs unittest setUp/tearDown. What advantages do fixtures provide?",
          a: "unittest uses **inheritance-based** setup: `setUp()` runs before every test in a `TestCase` class, and there's a single `tearDown()`. Fixtures use **dependency injection**: test functions declare what they need as parameters, and pytest resolves the dependency graph. **Advantages:** 1) **Composability** — fixtures can depend on other fixtures, forming a DAG. 2) **Granular scope** — function, class, module, or session level vs only class-level in unittest. 3) **Explicit dependencies** — each test declares exactly what it needs instead of inheriting everything. 4) **yield-based teardown** — setup and teardown in one function, making resource lifecycle clear. 5) **conftest.py sharing** — fixtures shared across files without imports.",
        },
        {
          type: "scenario",
          q: "You have a test suite with 500 tests that takes 20 minutes to run. How would you speed it up?",
          a: "1) **Parallelize** with `pytest-xdist`: `pytest -n auto` distributes tests across CPU cores. 2) **Scope optimization**: move expensive fixtures from function to module or session scope where safe. 3) **Mark slow tests**: tag integration and slow tests with `@pytest.mark.slow`, run them separately in CI. 4) **Use `--lf` (last-failed)**: during development, only re-run failing tests. 5) **Database fixtures**: use in-memory SQLite or transaction rollback instead of full DB setup per test. 6) **Profile**: `pytest --durations=20` shows the 20 slowest tests — target those first. 7) **Avoid I/O**: mock filesystem and network calls. 8) **Split CI**: run unit tests on every push, integration tests on merge to main.",
        },
        {
          type: "coding",
          q: "Write a pytest parametrized test for a function that validates passwords (min 8 chars, 1 uppercase, 1 digit, 1 special char).",
          a: `\`\`\`python
import pytest
import re

def validate_password(password):
    if len(password) < 8:
        return False, "Too short"
    if not re.search(r"[A-Z]", password):
        return False, "Missing uppercase"
    if not re.search(r"\\d", password):
        return False, "Missing digit"
    if not re.search(r"[!@#$%^&*]", password):
        return False, "Missing special char"
    return True, "Valid"

@pytest.mark.parametrize("password, valid, msg", [
    ("Str0ng!Pass", True, "Valid"),
    ("short1!", False, "Too short"),
    ("alllowercase1!", False, "Missing uppercase"),
    ("ALLUPPERCASE!", False, "Missing digit"),
    ("NoSpecial1here", False, "Missing special char"),
], ids=["valid", "too-short", "no-upper", "no-digit", "no-special"])
def test_validate_password(password, valid, msg):
    is_valid, message = validate_password(password)
    assert is_valid == valid
    assert message == msg
\`\`\``,
        },
      ],
    },
    {
      id: "py-mocking",
      title: "Mocking & Test Doubles",
      explanation: `**Mocking** is the practice of replacing real dependencies with controlled substitutes during testing. Python's \`unittest.mock\` module (part of the standard library since Python 3.3) provides powerful tools for creating **test doubles** — objects that stand in for real components like databases, APIs, file systems, and third-party services.

**Types of test doubles:**

| Double | Purpose | Example |
|--------|---------|---------|
| **Mock** | Records calls, returns configurable values | API client substitute |
| **Stub** | Returns predetermined data | Hardcoded DB query result |
| **Spy** | Wraps real object, records interactions | Logging call verification |
| **Fake** | Simplified working implementation | In-memory database |

**Core \`unittest.mock\` tools:**
- **\`Mock()\`** — general-purpose mock object that accepts any attribute access or method call
- **\`MagicMock()\`** — Mock with default implementations of magic methods (\`__len__\`, \`__iter__\`, etc.)
- **\`patch()\`** — temporarily replaces an object at its **lookup location** (critical concept)
- **\`patch.object()\`** — patches a specific attribute on an object
- **\`side_effect\`** — configure dynamic return values, raise exceptions, or call functions
- **\`spec\` / \`autospec\`** — constrain the mock to the interface of the real object, catching typos and incorrect call signatures

**The golden rule of patching:** Always patch where the object is **looked up**, not where it is defined. If \`module_a\` imports \`requests.get\` and you want to mock it in tests for \`module_a\`, you patch \`module_a.requests.get\`, NOT \`requests.get\`.

**When to mock:**
- External services (HTTP APIs, databases, message queues)
- Time-dependent behavior (\`datetime.now()\`, \`time.sleep()\`)
- Filesystem operations (reading/writing files)
- Non-deterministic outputs (random numbers, UUIDs)

**When NOT to mock:**
- Simple data transformations (pure functions)
- The system under test itself
- So extensively that tests pass with broken production code (over-mocking)`,
      codeExample: `# ============================================================
# Mocking fundamentals with unittest.mock
# ============================================================
from unittest.mock import (
    Mock,
    MagicMock,
    patch,
    call,
    PropertyMock,
    AsyncMock,
)
import pytest
from datetime import datetime
from decimal import Decimal


# --- Production code to test ---
class PaymentGateway:
    """Third-party payment service wrapper."""

    def charge(self, amount, currency, token):
        # In production, this calls Stripe/PayPal API
        raise NotImplementedError("Must connect to payment provider")

    def refund(self, transaction_id, amount=None):
        raise NotImplementedError("Must connect to payment provider")


class OrderService:
    """Business logic that depends on PaymentGateway."""

    def __init__(self, gateway: PaymentGateway, notifier=None):
        self.gateway = gateway
        self.notifier = notifier

    def process_payment(self, order_id, amount, token):
        if amount <= 0:
            raise ValueError("Amount must be positive")

        result = self.gateway.charge(
            amount=amount, currency="USD", token=token
        )

        if result["status"] == "success":
            if self.notifier:
                self.notifier.send(
                    f"Payment of \${amount} for order {order_id} succeeded"
                )
            return {"order_id": order_id, "transaction_id": result["txn_id"]}

        raise RuntimeError(f"Payment failed: {result.get('error', 'Unknown')}")

    def process_refund(self, transaction_id, amount=None):
        return self.gateway.refund(transaction_id, amount=amount)


# ============================================================
# 1. Basic Mock usage
# ============================================================
def test_mock_gateway_charge():
    """Replace the real gateway with a Mock."""
    mock_gateway = Mock(spec=PaymentGateway)

    # Configure the mock's return value
    mock_gateway.charge.return_value = {
        "status": "success",
        "txn_id": "txn_abc123",
    }

    service = OrderService(gateway=mock_gateway)
    result = service.process_payment("order-1", 99.99, "tok_visa")

    # Verify the result
    assert result["order_id"] == "order-1"
    assert result["transaction_id"] == "txn_abc123"

    # Verify the mock was called correctly
    mock_gateway.charge.assert_called_once_with(
        amount=99.99, currency="USD", token="tok_visa"
    )


# ============================================================
# 2. MagicMock — mock with magic method support
# ============================================================
def test_magic_mock_iteration():
    """MagicMock supports __iter__, __len__, __getitem__, etc."""
    mock_db_results = MagicMock()
    mock_db_results.__iter__.return_value = iter([
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"},
    ])
    mock_db_results.__len__.return_value = 2

    # Can iterate and check length
    results = list(mock_db_results)
    assert len(mock_db_results) == 2
    assert results[0]["name"] == "Alice"


# ============================================================
# 3. side_effect — dynamic behavior
# ============================================================
def test_side_effect_exception():
    """side_effect with exception simulates failures."""
    mock_gateway = Mock(spec=PaymentGateway)
    mock_gateway.charge.side_effect = ConnectionError("Network timeout")

    service = OrderService(gateway=mock_gateway)
    with pytest.raises(ConnectionError, match="Network timeout"):
        service.process_payment("order-1", 50.00, "tok_visa")


def test_side_effect_sequence():
    """side_effect with list returns values in sequence."""
    mock_gateway = Mock(spec=PaymentGateway)
    mock_gateway.charge.side_effect = [
        {"status": "success", "txn_id": "txn_001"},  # first call
        ConnectionError("Server down"),                # second call
        {"status": "success", "txn_id": "txn_003"},   # third call
    ]

    service = OrderService(gateway=mock_gateway)

    # First call succeeds
    result = service.process_payment("o1", 10, "tok1")
    assert result["transaction_id"] == "txn_001"

    # Second call raises
    with pytest.raises(ConnectionError):
        service.process_payment("o2", 20, "tok2")

    # Third call succeeds again
    result = service.process_payment("o3", 30, "tok3")
    assert result["transaction_id"] == "txn_003"


def test_side_effect_function():
    """side_effect with callable for dynamic logic."""
    mock_gateway = Mock(spec=PaymentGateway)

    def dynamic_charge(amount, currency, token):
        if amount > 10_000:
            return {"status": "failed", "error": "Amount exceeds limit"}
        return {"status": "success", "txn_id": f"txn_{token[-4:]}"}

    mock_gateway.charge.side_effect = dynamic_charge

    service = OrderService(gateway=mock_gateway)
    result = service.process_payment("o1", 500, "tok_visa")
    assert result["transaction_id"] == "txn_visa"

    with pytest.raises(RuntimeError, match="Amount exceeds limit"):
        service.process_payment("o2", 15_000, "tok_visa")


# ============================================================
# 4. patch() — replace objects at their lookup location
# ============================================================
# Suppose order_service.py imports: from datetime import datetime

# WRONG: @patch("datetime.datetime")  <-- patches where defined
# RIGHT: @patch("__main__.datetime")  <-- patches where looked up

@patch("__main__.datetime")
def test_patch_datetime(mock_dt):
    """Patch datetime to control 'now()'."""
    mock_dt.now.return_value = datetime(2025, 1, 15, 10, 30, 0)
    mock_dt.side_effect = lambda *a, **kw: datetime(*a, **kw)

    assert datetime.now().year == 2025
    assert datetime.now().month == 1


def test_patch_as_context_manager():
    """patch() works as a context manager too."""
    with patch.object(PaymentGateway, "charge") as mock_charge:
        mock_charge.return_value = {
            "status": "success",
            "txn_id": "txn_ctx",
        }
        gateway = PaymentGateway()
        result = gateway.charge(100, "USD", "tok_test")
        assert result["txn_id"] == "txn_ctx"
        mock_charge.assert_called_once()


# ============================================================
# 5. spec and autospec — type-safe mocking
# ============================================================
def test_spec_catches_typos():
    """spec= constrains mock to the real object's interface."""
    mock_gateway = Mock(spec=PaymentGateway)

    # This works — 'charge' exists on PaymentGateway
    mock_gateway.charge.return_value = {"status": "success", "txn_id": "x"}

    # This raises AttributeError — 'chrage' is a typo!
    with pytest.raises(AttributeError):
        mock_gateway.chrage(100, "USD", "tok")


# ============================================================
# 6. Verifying call patterns
# ============================================================
def test_call_verification():
    """Rich assertion API for verifying mock interactions."""
    mock_notifier = Mock()

    mock_gateway = Mock(spec=PaymentGateway)
    mock_gateway.charge.return_value = {
        "status": "success",
        "txn_id": "txn_verify",
    }

    service = OrderService(gateway=mock_gateway, notifier=mock_notifier)
    service.process_payment("order-1", 50, "tok_1")
    service.process_payment("order-2", 75, "tok_2")

    # Verify call count
    assert mock_gateway.charge.call_count == 2

    # Verify specific calls
    mock_gateway.charge.assert_any_call(
        amount=50, currency="USD", token="tok_1"
    )

    # Verify call order
    expected_calls = [
        call(amount=50, currency="USD", token="tok_1"),
        call(amount=75, currency="USD", token="tok_2"),
    ]
    mock_gateway.charge.assert_has_calls(expected_calls, any_order=False)

    # Verify notifier was called twice
    assert mock_notifier.send.call_count == 2


# ============================================================
# 7. PropertyMock — mock properties
# ============================================================
def test_property_mock():
    """Mock a property on a class."""
    with patch.object(
        OrderService, "gateway", new_callable=PropertyMock
    ) as mock_prop:
        mock_prop.return_value = "mock_gateway_value"
        service = OrderService.__new__(OrderService)
        assert service.gateway == "mock_gateway_value"


# ============================================================
# Run: pytest test_mocking.py -v
# ============================================================`,
      exercise: `**Exercises:**

1. Create a \`WeatherService\` that calls an external API. Write tests using \`Mock\` and \`patch\` to simulate successful responses, network errors, malformed JSON, and timeout scenarios without making real HTTP calls.

2. Test a function that reads a CSV file and returns summary statistics. Mock \`builtins.open\` with \`mock_open\` to provide fake CSV content. Verify the function handles empty files and malformed rows gracefully.

3. Use \`side_effect\` with a list to simulate a retry pattern: a function calls an unreliable API that fails twice then succeeds on the third attempt. Assert the function returns the successful result after exactly 3 attempts.

4. Refactor a test suite that uses \`Mock()\` without \`spec\` to use \`Mock(spec=RealClass)\`. Identify at least two bugs that \`spec\` catches (wrong method names, wrong argument counts) that plain \`Mock\` silently ignores.

5. Write tests for an \`EmailService\` that sends emails via SMTP. Mock the SMTP client to verify: correct recipients, subject line, body content, and that \`quit()\` is always called (even when sending fails). Use \`patch\` as both a decorator and context manager.

6. Create a test that patches \`datetime.now()\` to return a fixed time and verify time-dependent business logic (e.g., a function that returns different messages for morning, afternoon, and evening).`,
      commonMistakes: [
        "Patching where the object is defined instead of where it is looked up. If `service.py` does `from requests import get`, you must patch `service.get`, not `requests.get`. The import binds the name in the importing module's namespace.",
        "Not using `spec=` or `autospec=True` on mocks. Without spec, mocks silently accept any attribute or method call, meaning typos like `mock.clse()` instead of `mock.close()` pass without error and hide real bugs.",
        "Over-mocking — replacing so many components that the test only verifies the mock wiring, not actual behavior. If your test passes even when the production code is completely broken, you are testing mocks, not code.",
        "Forgetting to assert that mocks were actually called. A mock that is never called means the code path was never exercised. Always pair mocks with `assert_called_once_with()` or equivalent verification.",
        "Using `return_value` when `side_effect` is needed. `return_value` gives the same result every call. Use `side_effect` for sequences, exceptions, or dynamic logic based on arguments.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between Mock, MagicMock, and patch? When do you use each?",
          a: "**Mock** is the base class for creating test doubles — it records calls and returns configurable values. **MagicMock** extends Mock with default implementations of Python magic methods (`__len__`, `__iter__`, `__getitem__`, etc.), so you can use it where dunder methods are expected without explicit setup. **patch** is a utility (decorator/context manager) that temporarily replaces an object at a specific import path with a Mock and restores it after the test. Use **Mock/MagicMock** when constructing test doubles manually (dependency injection). Use **patch** when the code under test creates its own dependencies internally and you need to intercept at the module level.",
        },
        {
          type: "scenario",
          q: "You are testing a function that calls `datetime.now()` internally. How do you control the returned time in tests?",
          a: "The cleanest approaches: 1) **Dependency injection** — refactor to accept a clock/time provider: `def process(clock=datetime.now)` then pass a lambda in tests. 2) **patch at lookup location**: if `my_module.py` does `from datetime import datetime`, use `@patch('my_module.datetime')` and set `mock_dt.now.return_value = datetime(2025, 6, 15)`. 3) **freezegun library** — `@freeze_time('2025-06-15')` patches all datetime calls globally. The DI approach is preferred in new code because it makes dependencies explicit and avoids patching. For legacy code, `freezegun` or `patch` are practical solutions.",
        },
        {
          type: "tricky",
          q: "Why does this test pass even though the production code has a bug? `mock = Mock(); mock.procss_order(); mock.procss_order.assert_called_once()`",
          a: "Because `Mock()` without `spec` accepts **any attribute access or method call** silently. `mock.procss_order()` (note the typo — missing 'e') creates a new mock attribute on the fly and calls it. The test passes because it verifies the typo was called, not the real method. This is the danger of mocking without `spec`. Fix: `mock = Mock(spec=RealClass)` — now `mock.procss_order()` raises `AttributeError` because `procss_order` is not a real attribute. Always use `spec` or `autospec=True` in production test suites to catch these errors.",
        },
        {
          type: "conceptual",
          q: "What is the 'patch where it is looked up' rule? Give an example where getting it wrong causes a test to silently fail.",
          a: "When you use `patch('some.path')`, Python replaces the object at that **namespace path**. If `payment_service.py` has `from stripe import charge`, the name `charge` is bound in `payment_service`'s namespace. Patching `stripe.charge` replaces it in stripe's module, but `payment_service.charge` still points to the **original** function (the import already copied the reference). You must patch `payment_service.charge`. If you patch the wrong location, the real function runs during tests, potentially making real API calls or hitting real databases — while the mock sits unused and `assert_called` checks silently pass because they were never configured to fail.",
        },
      ],
    },
    {
      id: "py-debugging",
      title: "Debugging & Profiling",
      explanation: `Effective debugging separates productive developers from those who spend hours guessing. Python provides excellent built-in debugging tools, and understanding **when and how** to use each tool is critical for diagnosing issues in production systems.

**Python's debugging toolkit:**

| Tool | Purpose | Use Case |
|------|---------|----------|
| **\`pdb\`** | Interactive debugger (stdlib) | Step through code, inspect state |
| **\`breakpoint()\`** | Built-in function (3.7+) | Drop into debugger anywhere |
| **\`pdb++\` / \`ipdb\`** | Enhanced debuggers | Syntax highlighting, better UX |
| **\`logging\`** | Structured log output | Production debugging, audit trails |
| **\`traceback\`** | Exception formatting | Custom error reporting |

**\`pdb\` commands** (the essential ones):
- \`n\` (next) — execute current line, step over function calls
- \`s\` (step) — step into function calls
- \`c\` (continue) — run until next breakpoint
- \`r\` (return) — run until current function returns
- \`l\` (list) — show source code around current position
- \`p expr\` — print expression value
- \`pp expr\` — pretty-print expression
- \`w\` (where) — show call stack
- \`b lineno\` — set breakpoint at line number
- \`cl\` (clear) — remove breakpoints

**\`breakpoint()\`** (Python 3.7+) is the modern way to invoke the debugger. It respects the \`PYTHONBREAKPOINT\` environment variable, allowing you to switch debuggers or disable breakpoints entirely without changing code:
- \`PYTHONBREAKPOINT=0\` — disable all breakpoints (production)
- \`PYTHONBREAKPOINT=ipdb.set_trace\` — use ipdb instead of pdb
- \`PYTHONBREAKPOINT=pudb.set_trace\` — use pudb (visual debugger)

**Profiling** identifies performance bottlenecks. Python offers multiple profilers:
- **\`cProfile\`** — deterministic profiler (function-level), built-in, low overhead
- **\`profile\`** — pure Python profiler (slower but extensible)
- **\`line_profiler\`** — line-by-line execution time (third-party, essential for optimization)
- **\`memory_profiler\`** — track memory allocation per line
- **\`py-spy\`** — sampling profiler that attaches to running processes without code changes

**Debugging strategy:** Start with \`logging\` for context, use \`breakpoint()\` for interactive investigation, and profile only when you have confirmed a performance issue. Premature optimization guided by intuition rather than profiling data wastes time.`,
      codeExample: `# ============================================================
# 1. pdb / breakpoint() — Interactive Debugging
# ============================================================
import sys
from pathlib import Path


def calculate_discount(items, membership_level):
    """
    Production function with a subtle bug to debug.
    Items: list of dicts with 'name', 'price', 'quantity'.
    """
    subtotal = sum(
        item["price"] * item["quantity"] for item in items
    )

    # Drop into debugger to inspect state:
    # breakpoint()  # Uncomment to debug interactively

    discount_rates = {
        "bronze": 0.05,
        "silver": 0.10,
        "gold": 0.15,
        "platinum": 0.20,
    }

    rate = discount_rates.get(membership_level, 0)
    discount = subtotal * rate
    total = subtotal - discount

    return {
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "total": round(total, 2),
        "rate": rate,
    }


# ============================================================
# 2. Conditional breakpoints and post-mortem debugging
# ============================================================
def find_anomalies(data):
    """Process data with conditional debugging."""
    results = []
    for i, value in enumerate(data):
        processed = value ** 0.5 if value >= 0 else None

        # Conditional breakpoint — only pause on suspicious values
        # if processed is not None and processed > 100:
        #     breakpoint()

        results.append({"index": i, "original": value, "processed": processed})
    return results


def debug_with_post_mortem():
    """
    Post-mortem debugging: inspect state AFTER a crash.
    Run with: python -m pdb script.py
    When it crashes, pdb drops you into the frame where the
    exception occurred.
    """
    data = [100, 200, -1, 400, 0]
    try:
        results = [1 / x for x in data]
    except ZeroDivisionError:
        import pdb
        # pdb.post_mortem()  # Uncomment to debug at crash site
        print("ZeroDivisionError caught — would enter post-mortem debugger")


# ============================================================
# 3. Structured Logging (production debugging)
# ============================================================
import logging

# Configure logging with structured format
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s:%(funcName)s:%(lineno)d — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def process_order(order_id, items):
    """Production code with proper logging levels."""
    logger.info("Processing order %s with %d items", order_id, len(items))

    for item in items:
        logger.debug(
            "Item: %s, price=%.2f, qty=%d",
            item["name"],
            item["price"],
            item["quantity"],
        )

    try:
        result = calculate_discount(items, "gold")
        logger.info(
            "Order %s total: $%.2f (discount: $%.2f)",
            order_id,
            result["total"],
            result["discount"],
        )
        return result
    except Exception as e:
        logger.exception("Failed to process order %s", order_id)
        raise


# ============================================================
# 4. Custom exception hooks and traceback formatting
# ============================================================
import traceback


def robust_processor(data_batch):
    """Collect errors without stopping the entire batch."""
    results = []
    errors = []

    for i, item in enumerate(data_batch):
        try:
            processed = 100 / item["value"]
            results.append({"index": i, "result": processed})
        except (ZeroDivisionError, KeyError, TypeError) as e:
            error_info = {
                "index": i,
                "item": item,
                "error": str(e),
                "traceback": traceback.format_exc(),
            }
            errors.append(error_info)
            logger.warning("Error at index %d: %s", i, e)

    if errors:
        logger.warning(
            "Batch completed with %d errors out of %d items",
            len(errors),
            len(data_batch),
        )

    return results, errors


# ============================================================
# 5. cProfile — Function-level profiling
# ============================================================
import cProfile
import io
import pstats


def fibonacci(n):
    """Deliberately unoptimized for profiling demonstration."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


def profile_fibonacci():
    """Profile with cProfile and display sorted results."""
    profiler = cProfile.Profile()
    profiler.enable()

    result = fibonacci(30)

    profiler.disable()

    # Capture profile output
    stream = io.StringIO()
    stats = pstats.Stats(profiler, stream=stream)
    stats.sort_stats("cumulative")
    stats.print_stats(10)  # top 10 functions
    print(stream.getvalue())
    print(f"Result: {result}")


# Alternative: profile from command line
# python -m cProfile -s cumulative my_script.py
# python -m cProfile -o profile_output.prof my_script.py


# ============================================================
# 6. Timing utilities for targeted profiling
# ============================================================
import time
from functools import wraps
from contextlib import contextmanager


def timer(func):
    """Decorator to measure function execution time."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info("%s executed in %.4f seconds", func.__name__, elapsed)
        return result
    return wrapper


@contextmanager
def timed_block(label="block"):
    """Context manager for timing arbitrary code blocks."""
    start = time.perf_counter()
    yield
    elapsed = time.perf_counter() - start
    logger.info("%s completed in %.4f seconds", label, elapsed)


@timer
def sort_large_list():
    """Example function to profile."""
    import random
    data = [random.randint(0, 1_000_000) for _ in range(500_000)]
    return sorted(data)


def demo_timed_block():
    """Demonstrate context manager timing."""
    with timed_block("list comprehension"):
        squares = [x ** 2 for x in range(1_000_000)]

    with timed_block("generator sum"):
        total = sum(x ** 2 for x in range(1_000_000))


# ============================================================
# 7. tracemalloc — Memory profiling (stdlib)
# ============================================================
import tracemalloc


def memory_profile_demo():
    """Track memory allocations to find leaks."""
    tracemalloc.start()

    # Allocate some memory
    data = [list(range(1000)) for _ in range(1000)]

    snapshot = tracemalloc.take_snapshot()
    top_stats = snapshot.statistics("lineno")

    print("\\nTop 5 memory allocations:")
    for stat in top_stats[:5]:
        print(f"  {stat}")

    current, peak = tracemalloc.get_traced_memory()
    print(f"\\nCurrent memory: {current / 1024:.1f} KB")
    print(f"Peak memory: {peak / 1024:.1f} KB")

    tracemalloc.stop()


# ============================================================
# Usage
# ============================================================
if __name__ == "__main__":
    # Debugging demo
    items = [
        {"name": "Widget", "price": 25.99, "quantity": 3},
        {"name": "Gadget", "price": 49.99, "quantity": 1},
        {"name": "Doohickey", "price": 12.50, "quantity": 5},
    ]
    process_order("ORD-001", items)

    # Profiling demo
    profile_fibonacci()

    # Timing demo
    sort_large_list()
    demo_timed_block()

    # Memory demo
    memory_profile_demo()`,
      exercise: `**Exercises:**

1. Write a function with a deliberate bug (e.g., off-by-one error in a loop). Use \`breakpoint()\` to step through execution with \`n\`, \`s\`, \`p\`, and \`l\` commands. Document each pdb command you used and what it revealed.

2. Create a \`@timer\` decorator and a \`timed_block\` context manager. Apply them to three different algorithms for the same task (e.g., three sorting approaches) and compare their performance with formatted output.

3. Use \`cProfile\` to profile a recursive Fibonacci function vs. a memoized version. Generate a sorted stats report and identify the hotspot. Then use \`functools.lru_cache\` and re-profile to show the improvement.

4. Set up structured logging with different levels (DEBUG, INFO, WARNING, ERROR) in a multi-module application. Configure separate handlers: console for INFO+, file for DEBUG+. Demonstrate how to use logging for production debugging.

5. Use \`tracemalloc\` to find a simulated memory leak: a function that appends to a module-level list on each call. Show the top memory allocations and explain how to identify and fix the leak.

6. Configure \`PYTHONBREAKPOINT\` to use \`ipdb\` (install it first), then set it to \`0\` to disable all breakpoints. Explain how this mechanism lets you leave breakpoints in code without affecting production.`,
      commonMistakes: [
        "Leaving `breakpoint()` or `pdb.set_trace()` calls in committed code. Use `PYTHONBREAKPOINT=0` in production as a safety net, and add a pre-commit hook or linter rule to catch stray debugger statements.",
        "Using `print()` statements instead of the `logging` module. Print statements are not configurable (no levels, no formatting, no routing), cannot be disabled in production, and clutter stdout. The `logging` module is designed for exactly this purpose.",
        "Profiling before confirming there is actually a performance problem. Premature optimization wastes time. First measure with wall-clock timing, then profile only the slow paths. cProfile has overhead that can skew results for micro-benchmarks.",
        "Ignoring the difference between `time.time()` and `time.perf_counter()` for benchmarking. `perf_counter()` uses the highest-resolution clock available and is not affected by system clock adjustments. Always use `perf_counter()` for measuring code execution time.",
        "Not using post-mortem debugging (`python -m pdb script.py` or `pdb.post_mortem()`) for crashes. It drops you into the exact frame where the exception occurred, with all local variables intact — far more useful than reading a traceback.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the difference between cProfile and line_profiler. When would you use each?",
          a: "**cProfile** is a built-in **deterministic profiler** that measures time spent in each **function call**. It has low overhead and is good for finding which functions are slow. Run with `python -m cProfile -s cumulative script.py`. **line_profiler** is a third-party tool (`pip install line_profiler`) that measures time spent on each **individual line** within decorated functions. It has higher overhead but pinpoints exactly which lines are slow. **Use cProfile first** to identify slow functions, then **use line_profiler** on those specific functions to find the bottleneck lines. cProfile tells you *where* to look; line_profiler tells you *what* to fix.",
        },
        {
          type: "scenario",
          q: "A production API endpoint is intermittently slow (p99 latency spikes). How do you diagnose it without affecting users?",
          a: "1) **Add structured logging** with timing for each stage (DB query, serialization, external calls) using a context manager or decorator. 2) **Use py-spy** — a sampling profiler that attaches to a running process without code changes or restarts: `py-spy record -o profile.svg --pid <PID>`. 3) **Check async bottlenecks** — if using asyncio, ensure no blocking I/O on the event loop. 4) **Database**: enable slow query logging and check for N+1 queries or missing indexes. 5) **Metrics**: add histogram metrics (e.g., Prometheus) to track latency distribution over time. 6) **Reproduce with load testing**: use `locust` or `k6` to simulate traffic patterns. The key principle: instrument first, hypothesize second, and never profile in a way that adds latency for real users.",
        },
        {
          type: "coding",
          q: "Write a context manager that profiles a code block and prints the top 5 function calls by cumulative time.",
          a: `\`\`\`python
import cProfile
import pstats
import io
from contextlib import contextmanager

@contextmanager
def profile_block(top_n=5, sort_by="cumulative"):
    profiler = cProfile.Profile()
    profiler.enable()
    try:
        yield profiler
    finally:
        profiler.disable()
        stream = io.StringIO()
        stats = pstats.Stats(profiler, stream=stream)
        stats.sort_stats(sort_by)
        stats.print_stats(top_n)
        print(stream.getvalue())

# Usage:
# with profile_block(top_n=5):
#     result = expensive_computation()
\`\`\``,
        },
      ],
    },
    {
      id: "py-code-quality",
      title: "Code Quality & Tooling",
      explanation: `Code quality tools automate the enforcement of style guides, catch bugs before they reach production, and ensure consistency across teams. In the Python ecosystem, the tooling landscape has converged around a few key categories: **linters** (find bugs and style violations), **formatters** (auto-fix style), **import sorters**, and **pre-commit hooks** (run checks before every commit).

**Linters:**

| Tool | Purpose | Speed | Notes |
|------|---------|-------|-------|
| **pylint** | Comprehensive linter, type checks, code smells | Slow | Most thorough, can be noisy |
| **flake8** | Style (PEP 8) + logical errors | Medium | Lightweight, extensible with plugins |
| **ruff** | All-in-one linter + formatter | **Extremely fast** | Written in Rust, replaces flake8/isort/pylint rules |

**Ruff** has rapidly become the standard in 2024+ because it implements 800+ lint rules (from flake8, pylint, isort, pyupgrade, and more) at 10-100x the speed of traditional Python-based tools. It is a drop-in replacement for most linting setups.

**Formatters:**
- **black** — opinionated, deterministic formatter ("any color you like, as long as it's black"). Minimal configuration, ends style debates.
- **ruff format** — Rust-based formatter compatible with Black's style. Faster alternative.
- **autopep8** — PEP 8 fixer (less opinionated than Black)
- **yapf** — Google's formatter (configurable, but less popular now)

**Import sorting:**
- **isort** — sorts imports into sections (stdlib, third-party, local) with configurable profiles
- **ruff** — includes isort-compatible import sorting (\`ruff check --select I --fix\`)

**Pre-commit hooks** run automated checks before each git commit, preventing bad code from entering the repository:
- \`pre-commit\` framework — manages hook installation and execution
- Hooks run only on staged files (fast feedback)
- CI should also run the same checks as a safety net

**Configuration:** Modern Python projects centralize tool configuration in \`pyproject.toml\`, avoiding a proliferation of dotfiles (\`.pylintrc\`, \`.flake8\`, \`setup.cfg\`). Ruff, Black, isort, pytest, and mypy all support \`pyproject.toml\` sections.

**Type checking** with **mypy** or **pyright** catches type errors statically. Combined with linting and formatting, a well-configured toolchain catches the majority of bugs before tests even run.`,
      codeExample: `# ============================================================
# 1. Ruff — Modern all-in-one linter + formatter
# ============================================================
# Install: pip install ruff  (or uv add ruff)

# pyproject.toml configuration:
# [tool.ruff]
# target-version = "py312"
# line-length = 88
# src = ["src"]
#
# [tool.ruff.lint]
# select = [
#     "E",    # pycodestyle errors
#     "W",    # pycodestyle warnings
#     "F",    # pyflakes
#     "I",    # isort
#     "N",    # pep8-naming
#     "UP",   # pyupgrade
#     "B",    # flake8-bugbear
#     "SIM",  # flake8-simplify
#     "RUF",  # ruff-specific rules
#     "S",    # flake8-bandit (security)
#     "C4",   # flake8-comprehensions
#     "DTZ",  # flake8-datetimez
#     "T20",  # flake8-print (no print in production)
#     "PT",   # flake8-pytest-style
# ]
# ignore = [
#     "E501",    # line too long (handled by formatter)
#     "S101",    # assert used (we use assert in tests)
# ]
#
# [tool.ruff.lint.per-file-ignores]
# "tests/**/*.py" = ["S101", "T20"]  # allow assert and print in tests
#
# [tool.ruff.format]
# quote-style = "double"
# indent-style = "space"

# Commands:
# ruff check .                  # lint
# ruff check --fix .            # lint with auto-fix
# ruff format .                 # format (like black)
# ruff format --check .         # check formatting without changing


# ============================================================
# 2. Black — Opinionated code formatter
# ============================================================
# Install: pip install black

# pyproject.toml:
# [tool.black]
# line-length = 88
# target-version = ["py312"]
# include = '\\.pyi?$'

# Before black:
def messy_function( x,y ,z  ):
    return {"key1":x,"key2":y   ,
        "key3"  :z}

result=messy_function(1,2,
    3 )

# After black formats it:
def messy_function(x, y, z):
    return {"key1": x, "key2": y, "key3": z}


result = messy_function(1, 2, 3)

# Commands:
# black .                       # format all files
# black --check .               # check without modifying
# black --diff .                # show what would change


# ============================================================
# 3. isort — Import sorting
# ============================================================
# Install: pip install isort

# pyproject.toml:
# [tool.isort]
# profile = "black"    # compatible with black formatting
# src_paths = ["src"]
# known_first_party = ["myproject"]
# sections = [
#     "FUTURE",
#     "STDLIB",
#     "THIRDPARTY",
#     "FIRSTPARTY",
#     "LOCALFOLDER",
# ]

# Before isort:
# import os
# from myproject.utils import helper
# import sys
# import requests
# from pathlib import Path
# from collections import defaultdict
# import json

# After isort:
import json
import os
import sys
from collections import defaultdict
from pathlib import Path

import requests

from myproject.utils import helper


# ============================================================
# 4. pylint — Comprehensive static analysis
# ============================================================
# Install: pip install pylint

# pyproject.toml:
# [tool.pylint.messages_control]
# disable = [
#     "C0114",  # missing-module-docstring
#     "C0115",  # missing-class-docstring
#     "R0903",  # too-few-public-methods
# ]
#
# [tool.pylint.format]
# max-line-length = 88

# pylint catches things other linters miss:
class DatabaseConnection:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self._connection = None

    def connect(self):
        # pylint would warn: attribute '_connection' defined outside __init__
        # if we added self._new_attr = "oops" here
        self._connection = f"connected to {self.host}:{self.port}"
        return self._connection

    def query(self, sql):
        if not self._connection:
            raise RuntimeError("Not connected")
        return f"Executing: {sql}"


# ============================================================
# 5. flake8 — Lightweight PEP 8 + logic checker
# ============================================================
# Install: pip install flake8

# .flake8 or setup.cfg (flake8 doesn't support pyproject.toml natively):
# [flake8]
# max-line-length = 88
# extend-ignore = E203, W503
# per-file-ignores =
#     tests/*.py: S101
# max-complexity = 10

# Popular flake8 plugins:
# pip install flake8-bugbear     # additional bug checks
# pip install flake8-comprehensions  # better list/dict/set comprehensions
# pip install flake8-bandit      # security checks (wraps bandit)

# Commands:
# flake8 .                      # check all files
# flake8 --statistics            # summary of violations
# flake8 --max-complexity 10     # enforce cyclomatic complexity


# ============================================================
# 6. Pre-commit hooks — Automate checks before every commit
# ============================================================
# Install: pip install pre-commit

# .pre-commit-config.yaml:
# repos:
#   - repo: https://github.com/astral-sh/ruff-pre-commit
#     rev: v0.8.0
#     hooks:
#       - id: ruff
#         args: [--fix]
#       - id: ruff-format
#
#   - repo: https://github.com/pre-commit/pre-commit-hooks
#     rev: v5.0.0
#     hooks:
#       - id: trailing-whitespace
#       - id: end-of-file-fixer
#       - id: check-yaml
#       - id: check-added-large-files
#         args: [--maxkb=500]
#       - id: check-merge-conflict
#       - id: debug-statements     # catches breakpoint() and pdb
#
#   - repo: https://github.com/pre-commit/mirrors-mypy
#     rev: v1.13.0
#     hooks:
#       - id: mypy
#         additional_dependencies: [types-requests]

# Commands:
# pre-commit install             # set up git hooks
# pre-commit run --all-files     # run on all files manually
# pre-commit autoupdate          # update hook versions
# git commit -m "feat: add X"   # hooks run automatically


# ============================================================
# 7. Complete pyproject.toml — unified configuration
# ============================================================
# [project]
# name = "my-production-app"
# version = "1.0.0"
# requires-python = ">=3.12"
# dependencies = [
#     "fastapi>=0.115.0",
#     "sqlalchemy>=2.0",
#     "pydantic>=2.0",
# ]
#
# [project.optional-dependencies]
# dev = [
#     "pytest>=8.0",
#     "pytest-cov>=6.0",
#     "pytest-asyncio>=0.24",
#     "ruff>=0.8.0",
#     "mypy>=1.13",
#     "pre-commit>=4.0",
# ]
#
# [tool.pytest.ini_options]
# testpaths = ["tests"]
# addopts = "-ra -q --strict-markers --cov=src --cov-report=term-missing"
# markers = [
#     "slow: marks tests as slow",
#     "integration: marks integration tests",
# ]
#
# [tool.ruff]
# target-version = "py312"
# line-length = 88
#
# [tool.ruff.lint]
# select = ["E", "W", "F", "I", "N", "UP", "B", "SIM", "RUF"]
#
# [tool.mypy]
# python_version = "3.12"
# strict = true
# warn_return_any = true
# warn_unused_configs = true


# ============================================================
# 8. Makefile / task runner for common commands
# ============================================================
# Makefile:
# .PHONY: lint format test check all
#
# lint:
#     ruff check .
#
# format:
#     ruff format .
#     ruff check --fix .
#
# typecheck:
#     mypy src/
#
# test:
#     pytest --cov=src --cov-report=html
#
# check: lint typecheck test
#     @echo "All checks passed!"
#
# all: format check`,
      exercise: `**Exercises:**

1. Set up a Python project from scratch with \`ruff\` configured in \`pyproject.toml\`. Enable at least 10 rule categories. Write intentionally bad code (unused imports, bare excepts, mutable default args) and run \`ruff check\` to see every violation, then fix them with \`ruff check --fix\`.

2. Install and configure \`pre-commit\` with hooks for ruff (lint + format), trailing whitespace, large file checks, and debug statement detection. Make a commit with a \`breakpoint()\` left in and observe the hook blocking the commit.

3. Take a 100+ line Python module and run it through \`pylint\`, \`flake8\`, and \`ruff\`. Compare their output: which issues does each tool uniquely catch? Document the overlap and differences.

4. Configure \`black\` and \`isort\` (with \`profile = "black"\` for compatibility). Format a messy file with both tools and explain why the \`profile\` setting matters (hint: trailing commas and import formatting conflicts).

5. Create a complete \`pyproject.toml\` that configures ruff, mypy, pytest, and isort. Add a \`Makefile\` with targets for \`lint\`, \`format\`, \`typecheck\`, \`test\`, and \`check\` (runs all). Verify each target works correctly.

6. Set up a CI pipeline configuration (GitHub Actions YAML) that runs linting, type checking, and tests on every pull request. Use caching for pip dependencies and fail fast on lint errors before running the full test suite.`,
      commonMistakes: [
        "Not configuring tools to be compatible with each other. Black and isort can conflict on import formatting — always set `profile = \"black\"` in isort config, or use ruff which handles both consistently.",
        "Disabling too many linter rules instead of fixing the underlying issues. Linter warnings exist for good reasons. Only disable rules project-wide if you have a documented rationale, and use per-file ignores for legitimate exceptions.",
        "Running formatters and linters only in CI but not locally. By the time CI catches an issue, the developer has context-switched. Pre-commit hooks provide instant feedback. IDE integration (VS Code + ruff extension) provides real-time feedback.",
        "Not pinning tool versions in CI and pre-commit config. A new ruff or black release can reformat your entire codebase, causing massive diffs. Pin exact versions and update deliberately with `pre-commit autoupdate`.",
        "Treating type checking (mypy) as optional. In production Python, `mypy --strict` catches entire categories of bugs (None handling, wrong argument types, missing returns) that tests might miss. Enable it early — retrofitting types onto a large codebase is painful.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Compare pylint, flake8, and ruff. Why has ruff gained rapid adoption?",
          a: "**pylint** is the most comprehensive — it checks style, logic errors, type inference, code complexity, and design patterns. However, it is **slow** and **noisy** (many false positives require careful configuration). **flake8** is lightweight and fast, combining pycodestyle (PEP 8), pyflakes (logic errors), and mccabe (complexity). It is extensible via plugins but requires installing each separately. **ruff** reimplements 800+ rules from flake8, pylint, isort, pyupgrade, and others in **Rust**, making it 10-100x faster. It also includes a formatter (Black-compatible). Ruff gained rapid adoption because it replaces multiple tools with one, has near-instant execution, provides auto-fix for most rules, and uses `pyproject.toml` natively. Most new Python projects in 2024+ default to ruff.",
        },
        {
          type: "scenario",
          q: "You join a team with no code quality tooling. How would you introduce linting, formatting, and pre-commit hooks without disrupting the team?",
          a: "**Phase 1 (Week 1):** Add ruff + ruff format with minimal config (only `E`, `F`, `W` rules). Run `ruff format .` once to normalize style. Make this a single large 'formatting' commit so it does not pollute `git blame` (use `git config blame.ignoreRevsFile`). **Phase 2 (Week 2):** Add `pre-commit` with ruff hooks. Have each developer run `pre-commit install`. Enable auto-fix so hooks fix issues silently. **Phase 3 (Week 3-4):** Gradually enable more rule categories (isort, bugbear, simplify). Fix violations incrementally, not all at once. **Phase 4 (Month 2):** Add mypy with basic settings, then tighten to `--strict` over time. **Key principles:** get team buy-in first, automate everything, never block on style reviews (tools handle it), and introduce changes incrementally.",
        },
        {
          type: "conceptual",
          q: "What is the purpose of pre-commit hooks? How do they differ from CI checks?",
          a: "**Pre-commit hooks** run automatically on the developer's machine **before** each commit. They provide **instant feedback** (seconds), catch issues **before** code enters the repository, and prevent commits that violate standards. **CI checks** run on a server **after** code is pushed, typically on pull requests. They provide **reliable, environment-consistent** checks but have slower feedback loops (minutes). **Both are needed:** pre-commit hooks are the first line of defense (fast feedback, developer convenience), while CI is the authoritative gate (cannot be bypassed with `--no-verify`, runs on a clean environment). Pre-commit hooks can be skipped with `git commit --no-verify`, so CI must run the same checks as a safety net.",
        },
        {
          type: "coding",
          q: "Write a pyproject.toml configuration that sets up ruff, black, isort, mypy, and pytest with production-ready settings.",
          a: `\`\`\`toml
[tool.ruff]
target-version = "py312"
line-length = 88
src = ["src"]

[tool.ruff.lint]
select = ["E", "W", "F", "I", "N", "UP", "B", "SIM", "S", "C4", "RUF"]
ignore = ["E501"]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]

[tool.black]
line-length = 88
target-version = ["py312"]

[tool.isort]
profile = "black"
src_paths = ["src"]

[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra --strict-markers --cov=src"
markers = ["slow: slow tests", "integration: integration tests"]
\`\`\`
This config ensures all tools use the same line length (88), target the same Python version, and are compatible with each other (isort profile = "black").`,
        },
      ],
    },
  ],
};

export default pyPhase9;
