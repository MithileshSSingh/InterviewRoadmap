const pyPhase11 = {
  id: "phase-11",
  title: "Phase 11: Data Science & Scientific Computing",
  emoji: "📊",
  description:
    "Explore Python's data science ecosystem — NumPy for numerical computing, pandas for data analysis, and Matplotlib/Seaborn for visualization.",
  topics: [
    {
      id: "py-numpy",
      title: "NumPy: Numerical Computing",
      explanation: `NumPy (Numerical Python) is the **foundation** of nearly every data science and scientific computing library in the Python ecosystem. It provides the \`ndarray\` — a powerful, memory-efficient, multi-dimensional array object that enables vectorized operations orders of magnitude faster than native Python lists.

**Why NumPy over Python lists?**

| Feature | Python List | NumPy ndarray |
|---|---|---|
| Storage | Objects scattered in memory | Contiguous typed memory block |
| Speed | Slow (interpreted loops) | Fast (compiled C/Fortran kernels) |
| Operations | Element-by-element manually | Vectorized (whole-array ops) |
| Memory | ~28 bytes per int object | ~8 bytes per int64 element |
| Broadcasting | Not supported | Automatic shape alignment |

**Core concepts:**

- **ndarray creation** — \`np.array()\`, \`np.zeros()\`, \`np.ones()\`, \`np.arange()\`, \`np.linspace()\`, \`np.random\` module
- **Indexing & slicing** — advanced indexing with boolean masks, fancy indexing with integer arrays, and slice objects that return views (not copies)
- **Broadcasting** — NumPy's mechanism for performing arithmetic on arrays of different shapes. A \`(3, 1)\` array can be added to a \`(1, 4)\` array, producing a \`(3, 4)\` result. Rules: dimensions are compared right-to-left; they must either match or one must be 1
- **Vectorization** — replacing explicit Python loops with array-level operations. \`np.sum(arr)\` is 50-100x faster than \`sum(list)\` because the loop runs in compiled C code
- **Linear algebra** — \`np.dot()\`, \`np.linalg.inv()\`, \`np.linalg.eig()\`, \`@\` operator for matrix multiplication
- **Random number generation** — the modern \`np.random.default_rng()\` API provides reproducible, thread-safe random streams

**Performance tip:** Always prefer vectorized operations over Python loops. When you find yourself writing \`for i in range(len(arr))\`, there is almost certainly a NumPy function that does it faster. Use \`np.where()\` instead of if/else loops, \`np.vectorize()\` as a last resort (it is syntactic sugar, not a true vectorizer).`,
      codeExample: `# ============================================================
# NumPy: Numerical Computing Fundamentals
# ============================================================
import numpy as np

# --- Array Creation ---
# From Python list
arr_1d = np.array([1, 2, 3, 4, 5])
arr_2d = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# Built-in constructors
zeros = np.zeros((3, 4))                  # 3x4 matrix of zeros
ones = np.ones((2, 3), dtype=np.float32)  # specify data type
identity = np.eye(4)                       # 4x4 identity matrix
seq = np.arange(0, 10, 0.5)               # like range(), but for floats
linspace = np.linspace(0, 1, 50)           # 50 evenly spaced points

# Array properties
print(f"Shape: {arr_2d.shape}")       # (3, 3)
print(f"Dtype: {arr_2d.dtype}")       # int64
print(f"Dimensions: {arr_2d.ndim}")   # 2
print(f"Size: {arr_2d.size}")         # 9
print(f"Bytes: {arr_2d.nbytes}")      # 72

# --- Indexing & Slicing ---
matrix = np.arange(20).reshape(4, 5)

# Basic slicing (returns VIEWS, not copies)
row_slice = matrix[1:3, :]          # rows 1–2, all columns
col_slice = matrix[:, 2]            # all rows, column 2
submatrix = matrix[1:3, 2:4]       # rows 1–2, columns 2–3

# Boolean masking — extremely powerful for filtering
data = np.array([15, 22, 8, 31, 45, 12, 27])
mask = data > 20
filtered = data[mask]               # array([22, 31, 45, 27])
data[mask] = 0                      # set values > 20 to zero in-place

# Fancy indexing (returns COPIES, not views)
indices = np.array([0, 3, 4])
selected = data[indices]            # pick specific elements

# --- Broadcasting ---
# Rule: dimensions are compared right-to-left;
#       they must match or one must be 1
a = np.array([[1], [2], [3]])       # shape (3, 1)
b = np.array([10, 20, 30, 40])     # shape (4,) -> broadcast to (1, 4)
result = a + b                      # shape (3, 4) — automatic expansion
# [[11, 21, 31, 41],
#  [12, 22, 32, 42],
#  [13, 23, 33, 43]]

# Practical: normalize columns to zero mean
data_matrix = np.random.default_rng(42).standard_normal((100, 5))
col_means = data_matrix.mean(axis=0)       # shape (5,)
col_stds = data_matrix.std(axis=0)         # shape (5,)
normalized = (data_matrix - col_means) / col_stds  # broadcasting!

# --- Vectorized Operations ---
x = np.linspace(0, 2 * np.pi, 1000)
y = np.sin(x) * np.exp(-x / 5)     # element-wise, no loops

# Conditional logic without loops
scores = np.array([85, 42, 91, 67, 73, 55, 88])
grades = np.where(scores >= 70, "Pass", "Fail")

# Aggregations along axes
matrix = np.random.default_rng(0).integers(1, 100, size=(4, 5))
print(f"Column sums:  {matrix.sum(axis=0)}")    # sum down rows
print(f"Row means:    {matrix.mean(axis=1)}")    # mean across columns
print(f"Global max:   {matrix.max()}")
print(f"Argmax col 0: {matrix[:, 0].argmax()}")  # index of max

# --- Linear Algebra ---
A = np.array([[2, 1], [5, 3]])
B = np.array([[4, 2], [1, 6]])

product = A @ B                     # matrix multiplication
determinant = np.linalg.det(A)      # determinant
inverse = np.linalg.inv(A)          # inverse
eigenvalues, eigenvectors = np.linalg.eig(A)

# Solve linear system: Ax = b
b_vec = np.array([8, 13])
x_solution = np.linalg.solve(A, b_vec)
print(f"Solution: {x_solution}")     # [1. 6.] meaning 2*1+1*6=8, 5*1+3*6=23... verify!

# --- Random Number Generation (modern API) ---
rng = np.random.default_rng(seed=42)
uniform_samples = rng.uniform(0, 1, size=1000)
normal_samples = rng.standard_normal(size=(100, 3))
integers = rng.integers(1, 7, size=20)     # dice rolls
choice = rng.choice(["red", "green", "blue"], size=10, p=[0.5, 0.3, 0.2])

# Shuffle and permutation
arr = np.arange(10)
rng.shuffle(arr)                    # in-place shuffle
permuted = rng.permutation(10)      # returns new shuffled array

# --- Performance Comparison ---
import time

size = 1_000_000
py_list = list(range(size))
np_arr = np.arange(size)

start = time.perf_counter()
py_result = [x ** 2 for x in py_list]
py_time = time.perf_counter() - start

start = time.perf_counter()
np_result = np_arr ** 2
np_time = time.perf_counter() - start

print(f"Python list: {py_time:.4f}s")
print(f"NumPy array: {np_time:.4f}s")
print(f"Speedup: {py_time / np_time:.0f}x")`,
      exercise: `1. Create a 10x10 matrix of random integers between 1 and 100. Compute the mean, median, and standard deviation of each row and each column. Find the row with the highest mean and the column with the lowest variance.

2. Implement a function that normalizes a 2D array using min-max scaling (scale each column to [0, 1]) using only NumPy operations — no loops allowed. Verify that each column's min is 0 and max is 1.

3. Use boolean masking and fancy indexing to extract all elements from a 5x5 random matrix that are greater than the matrix's overall mean. Replace those values with the column mean of their respective column.

4. Implement matrix operations from scratch: write functions for matrix transpose, matrix multiplication, and computing the trace — then verify your results against NumPy's built-in \`np.transpose()\`, \`@\`, and \`np.trace()\`.

5. Generate 10,000 samples from a normal distribution with mean=50 and std=15. Use NumPy to compute the 25th, 50th, and 75th percentiles. Count how many values fall within 1, 2, and 3 standard deviations of the mean and compare to the empirical rule (68-95-99.7).`,
      commonMistakes: [
        "Using Python loops instead of vectorized NumPy operations — this can be 50-100x slower and defeats the purpose of NumPy.",
        "Confusing views and copies: slicing returns a view (modifications affect the original), while fancy indexing returns a copy. Use `.copy()` explicitly when you need independence.",
        "Ignoring broadcasting rules and getting unexpected shapes — always check `.shape` after operations and understand that broadcasting aligns dimensions right-to-left.",
        "Using the legacy `np.random.seed()` API instead of the modern `np.random.default_rng()` generator, which is thread-safe and provides better statistical properties.",
        "Forgetting that NumPy integer overflow wraps silently (e.g., `np.int8(127) + np.int8(1)` gives `-128`). Always choose appropriate dtypes for your data range.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain NumPy broadcasting rules. How does NumPy handle operations between arrays of shapes (3, 1) and (1, 4)?",
          a: "Broadcasting compares dimensions right-to-left. Dimensions must either be equal or one must be 1. For (3,1) and (1,4): rightmost dims are 1 and 4 — compatible because one is 1, expanded to 4. Next dims are 3 and 1 — compatible, expanded to 3. Result shape is (3,4). NumPy virtually replicates the smaller array along the size-1 dimension without actually copying memory, making it very efficient.",
        },
        {
          type: "scenario",
          q: "You have a dataset of 10 million rows and need to compute a rolling average. A colleague wrote it with a Python for-loop and it takes 45 seconds. How would you optimize it?",
          a: "Replace the loop with vectorized NumPy operations. Use `np.convolve()` with a uniform kernel for simple rolling averages, or `np.cumsum()` to compute the cumulative sum and then take differences: `(cumsum[window:] - cumsum[:-window]) / window`. For more complex rolling operations, consider `np.lib.stride_tricks.sliding_window_view()`. This typically achieves 50-100x speedup. If the dataset is even larger, consider using pandas rolling or Numba JIT compilation.",
        },
        {
          type: "conceptual",
          q: "What is the difference between a NumPy view and a copy? Why does it matter for performance and correctness?",
          a: "A view shares memory with the original array — modifying the view modifies the original. Basic slicing (e.g., `arr[1:5]`) creates views. A copy allocates new memory — modifications are independent. Fancy indexing (integer array indexing) and boolean indexing create copies. Views matter for performance because they avoid memory allocation and copying. They matter for correctness because unintended mutation through a view is a common bug. Use `arr.base` to check if an array is a view, and `.copy()` to force a copy when needed.",
        },
      ],
    },
    {
      id: "py-pandas",
      title: "pandas: Data Analysis",
      explanation: `**pandas** is Python's premier data manipulation library, providing the \`DataFrame\` and \`Series\` data structures that make working with tabular data intuitive, expressive, and fast. Built on top of NumPy, pandas adds labeled axes, flexible indexing, rich I/O capabilities, and a comprehensive API for data cleaning, transformation, and analysis.

**Core data structures:**

- **Series** — a one-dimensional labeled array. Think of it as a column in a spreadsheet: it has an index (labels) and values (a NumPy array underneath). Supports vectorized operations, alignment by label, and mixed-type handling via \`object\` dtype
- **DataFrame** — a two-dimensional labeled structure with columns of potentially different types. It is the workhorse of pandas — conceptually a dict of Series sharing the same index

**Essential operations for data analysis:**

- **I/O** — \`pd.read_csv()\`, \`pd.read_excel()\`, \`pd.read_sql()\`, \`pd.read_parquet()\`, and their \`.to_*()\` counterparts
- **Selection** — \`.loc[]\` (label-based), \`.iloc[]\` (position-based), boolean indexing, \`.query()\` for SQL-like filtering
- **Transformation** — \`.apply()\`, \`.map()\`, \`.assign()\`, \`.pipe()\` for method chaining
- **Aggregation** — \`.groupby()\` with \`.agg()\`, \`.transform()\`, \`.filter()\`; pivot tables via \`.pivot_table()\`
- **Merging** — \`pd.merge()\` (SQL-style joins), \`pd.concat()\` (stacking), \`.join()\` (index-based)
- **Missing data** — \`.isna()\`, \`.fillna()\`, \`.dropna()\`, \`.interpolate()\`

**Method chaining** is the idiomatic way to write pandas code. Instead of creating intermediate variables, chain operations: \`df.query("age > 25").groupby("city").agg(mean_salary=("salary", "mean")).sort_values("mean_salary", ascending=False)\`. This produces readable, pipeline-style transformations.

**Performance tips:**

- Use \`category\` dtype for low-cardinality string columns — reduces memory by 90%+
- Prefer \`.query()\` over boolean indexing for readability and sometimes speed
- Avoid row-wise \`.apply()\` — it is essentially a Python loop. Use vectorized operations or \`.transform()\` instead
- Load only needed columns with \`usecols\` parameter in \`read_csv()\`
- For datasets > 1GB, consider \`read_parquet()\` (columnar, compressed, faster I/O)`,
      codeExample: `# ============================================================
# pandas: Data Analysis Fundamentals
# ============================================================
import pandas as pd
import numpy as np

# --- Creating DataFrames ---
# From dictionary
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "age": [28, 34, 22, 45, 31],
    "city": ["NYC", "LA", "NYC", "Chicago", "LA"],
    "salary": [85000, 92000, 65000, 120000, 78000],
    "department": ["Engineering", "Marketing", "Engineering",
                   "Management", "Marketing"],
})

# From CSV (common real-world usage)
# df = pd.read_csv("employees.csv", parse_dates=["hire_date"],
#                   usecols=["name", "age", "salary", "department"])

# Basic inspection
print(df.shape)           # (5, 5)
print(df.dtypes)          # column data types
print(df.describe())      # statistical summary
print(df.info())          # memory usage + null counts

# --- Selection & Filtering ---
# Label-based selection with .loc[]
engineers = df.loc[df["department"] == "Engineering", ["name", "salary"]]

# Position-based selection with .iloc[]
first_three = df.iloc[:3, :3]        # first 3 rows, first 3 columns

# Boolean indexing
high_earners = df[df["salary"] > 80000]

# .query() — cleaner syntax for complex filters
result = df.query("age > 25 and city == 'NYC'")

# Multiple conditions
filtered = df[(df["salary"] > 70000) & (df["department"] == "Engineering")]

# --- Transformation & New Columns ---
# Vectorized operations (preferred)
df["salary_k"] = df["salary"] / 1000
df["age_group"] = pd.cut(df["age"], bins=[0, 25, 35, 50, 100],
                          labels=["Junior", "Mid", "Senior", "Executive"])

# .assign() for method chaining (returns new DataFrame)
df_enhanced = df.assign(
    tax=lambda x: x["salary"] * 0.25,
    net_salary=lambda x: x["salary"] * 0.75,
    name_upper=lambda x: x["name"].str.upper(),
)

# --- GroupBy Aggregation ---
# Single aggregation
dept_means = df.groupby("department")["salary"].mean()

# Multiple aggregations with named output
dept_stats = (
    df.groupby("department")
    .agg(
        avg_salary=("salary", "mean"),
        max_salary=("salary", "max"),
        headcount=("name", "count"),
        avg_age=("age", "mean"),
    )
    .sort_values("avg_salary", ascending=False)
)
print(dept_stats)

# .transform() — returns same-shape result (useful for normalization)
df["salary_zscore"] = (
    df.groupby("department")["salary"]
    .transform(lambda x: (x - x.mean()) / x.std())
)

# --- Merging & Joining ---
departments = pd.DataFrame({
    "department": ["Engineering", "Marketing", "Management", "Sales"],
    "budget": [500000, 300000, 200000, 400000],
    "floor": [3, 2, 5, 1],
})

# SQL-style merge (inner join by default)
merged = pd.merge(df, departments, on="department", how="left")

# Concatenate DataFrames vertically
new_employees = pd.DataFrame({
    "name": ["Frank", "Grace"],
    "age": [29, 38],
    "city": ["NYC", "Chicago"],
    "salary": [71000, 95000],
    "department": ["Sales", "Engineering"],
})
all_employees = pd.concat([df, new_employees], ignore_index=True)

# --- Pivot Tables ---
pivot = df.pivot_table(
    values="salary",
    index="department",
    columns="city",
    aggfunc="mean",
    fill_value=0,
)
print(pivot)

# --- Handling Missing Data ---
df_with_nulls = df.copy()
df_with_nulls.loc[1, "salary"] = np.nan
df_with_nulls.loc[3, "city"] = np.nan

print(df_with_nulls.isna().sum())            # count nulls per column
df_filled = df_with_nulls.fillna({
    "salary": df_with_nulls["salary"].median(),
    "city": "Unknown",
})
df_dropped = df_with_nulls.dropna(subset=["salary"])  # drop rows missing salary

# --- Method Chaining (idiomatic pandas) ---
report = (
    df
    .query("salary > 60000")
    .assign(bonus=lambda x: x["salary"] * 0.1)
    .groupby("department")
    .agg(
        avg_total_comp=("salary", lambda x: (x + x * 0.1).mean()),
        team_size=("name", "count"),
    )
    .sort_values("avg_total_comp", ascending=False)
    .reset_index()
)
print(report)

# --- Performance: Category dtype ---
# Before: string column uses ~8x more memory
df["department"] = df["department"].astype("category")
print(df["department"].cat.categories)   # unique categories
print(df.memory_usage(deep=True))        # compare memory usage`,
      exercise: `1. Load a CSV file (or create a DataFrame with at least 100 rows of synthetic data) containing columns: name, age, department, salary, hire_date, and city. Perform exploratory analysis: find the top 5 highest-paid employees, the average salary per department, and the department with the highest employee count.

2. Write a method-chained pipeline that filters employees hired after 2020, groups by department, computes the mean and median salary, adds a column indicating whether the department average is above the company-wide average, and sorts by mean salary descending.

3. Given two DataFrames — one with employee info and another with department budgets — perform a left merge, then use \`.groupby()\` and \`.transform()\` to add a column showing each employee's salary as a percentage of their department's total budget.

4. Create a DataFrame with deliberately missing values in multiple columns. Demonstrate three different imputation strategies: fill with column mean, forward-fill (for time-series data), and fill categoricals with mode. Compare the resulting distributions.

5. Use \`pd.pivot_table()\` to create a summary showing average salary by department and city, with row and column margins. Then use \`.style\` to highlight the highest value in each column.

6. Profile the memory usage of a large DataFrame (1M+ rows). Optimize it by converting object columns to category dtype, downcasting numeric types with \`pd.to_numeric(downcast="integer")\`, and using \`read_csv()\` with \`dtype\` parameter. Measure the memory reduction.`,
      commonMistakes: [
        "Using `.apply()` with a Python function row-by-row when a vectorized pandas operation exists — this is orders of magnitude slower and negates pandas' performance advantages.",
        "Chaining indexing like `df[condition]['column'] = value` which triggers SettingWithCopyWarning. Always use `.loc[]` for assignment: `df.loc[condition, 'column'] = value`.",
        "Ignoring the `inplace` trap — most pandas methods return new DataFrames. Relying on `inplace=True` is discouraged (it is being deprecated) and breaks method chaining.",
        "Not specifying `dtype` or `parse_dates` when reading CSV files, leading to incorrect type inference (e.g., IDs read as integers instead of strings, dates as plain strings).",
        "Loading an entire huge CSV into memory when you only need a few columns. Use `usecols` parameter or switch to Parquet format for large datasets.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the difference between `.apply()`, `.map()`, and `.transform()` in pandas. When should you use each?",
          a: "`.map()` works on Series only — maps each value through a function or dictionary. `.apply()` works on both Series and DataFrame — for DataFrames it applies a function along an axis (row or column). `.transform()` is like apply but must return a result with the same shape as the input — it is commonly used after groupby to broadcast group-level results back to individual rows. Prefer `.map()` for simple element-wise operations, `.transform()` for group-level computations that need to maintain shape, and `.apply()` as a last resort when vectorized alternatives are not available.",
        },
        {
          type: "scenario",
          q: "You have a 5GB CSV file that does not fit in memory. How do you process it with pandas?",
          a: "Several approaches: (1) Use `chunksize` parameter in `pd.read_csv()` to process in chunks — iterate over chunks and accumulate results. (2) Use `usecols` to load only needed columns. (3) Specify `dtype` to reduce memory per column (e.g., `category` for strings, `float32` instead of `float64`). (4) Convert to Parquet format (columnar, compressed) and use `read_parquet()` with `columns` parameter for column pruning. (5) Use Dask or Polars for out-of-core computation. (6) Filter rows while reading with `nrows` or `skiprows`. For production workloads on data this size, migrating to Parquet + Polars/Dask is the recommended long-term solution.",
        },
        {
          type: "conceptual",
          q: "What is the difference between `pd.merge()`, `pd.concat()`, and `DataFrame.join()`? Provide use cases for each.",
          a: "`pd.merge()` performs SQL-style joins on column values — use it when combining tables on shared key columns (inner, left, right, outer joins). `pd.concat()` stacks DataFrames vertically (axis=0) or horizontally (axis=1) — use it to combine datasets with the same schema (e.g., monthly reports). `DataFrame.join()` merges on index by default — it is a convenience wrapper around merge that is faster for index-based joins. In practice: merge for relational joins, concat for appending/stacking, join for index-aligned combinations.",
        },
        {
          type: "scenario",
          q: "A data pipeline produces duplicate rows due to upstream bugs. How do you detect and handle duplicates in pandas?",
          a: "Detection: `df.duplicated()` returns a boolean Series; `df.duplicated(subset=['key_col'])` checks specific columns; `df.duplicated().sum()` counts duplicates. Handling: `df.drop_duplicates()` removes exact duplicates; `df.drop_duplicates(subset=['key_col'], keep='last')` keeps the most recent. For investigation: `df[df.duplicated(subset=['key_col'], keep=False)]` shows ALL duplicate rows (not just the extras). For production pipelines, add validation: assert `df['id'].is_unique` after loading, log duplicate counts, and decide on keep strategy based on business rules (first, last, or aggregate).",
        },
      ],
    },
    {
      id: "py-visualization",
      title: "Data Visualization",
      explanation: `Data visualization transforms raw numbers into insight. Python's visualization ecosystem is built on three major libraries: **Matplotlib** (the foundational layer), **Seaborn** (statistical visualization built on Matplotlib), and **Plotly** (interactive, web-based charts). Understanding when and how to use each is essential for effective data communication.

**Matplotlib** is Python's original plotting library and remains the most flexible. It uses a hierarchical object model: \`Figure\` (the canvas) contains one or more \`Axes\` (individual plots), which contain plot elements (lines, bars, text). There are two APIs:

- **pyplot API** (\`plt.plot()\`, \`plt.bar()\`) — stateful, MATLAB-like, convenient for quick plots
- **Object-oriented API** (\`fig, ax = plt.subplots()\`) — explicit, preferred for production code and multi-panel figures

**Seaborn** provides high-level functions for statistical visualization. Built on Matplotlib, it offers beautiful defaults, automatic statistical aggregation, and tight integration with pandas DataFrames. Key function categories:

- **Relational** — \`scatterplot()\`, \`lineplot()\` for continuous relationships
- **Categorical** — \`boxplot()\`, \`violinplot()\`, \`barplot()\`, \`stripplot()\` for category comparisons
- **Distribution** — \`histplot()\`, \`kdeplot()\`, \`ecdfplot()\` for understanding data spread
- **Matrix** — \`heatmap()\`, \`clustermap()\` for correlation and similarity matrices

**Plotly** enables interactive charts that users can hover, zoom, and filter. Plotly Express provides a concise API similar to Seaborn, while the graph_objects module offers fine-grained control. Ideal for dashboards, web applications, and exploratory analysis in Jupyter notebooks.

**Choosing the right chart type:**

| Goal | Chart Types |
|---|---|
| Distribution | Histogram, KDE, Box plot, Violin |
| Comparison | Bar chart, Grouped bar, Dot plot |
| Relationship | Scatter plot, Bubble chart, Heatmap |
| Composition | Pie chart (sparingly), Stacked bar, Treemap |
| Trend over time | Line chart, Area chart |

**Best practices:** Always label axes and provide a title. Use colorblind-friendly palettes. Keep chart-to-data ratio high (minimize chartjunk). Choose chart types based on the story you want to tell, not visual appeal.`,
      codeExample: `# ============================================================
# Data Visualization: Matplotlib, Seaborn, and Plotly
# ============================================================
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import seaborn as sns
import numpy as np
import pandas as pd

# --- Sample Data ---
np.random.seed(42)
n = 200
df = pd.DataFrame({
    "age": np.random.normal(35, 10, n).astype(int).clip(18, 65),
    "salary": np.random.normal(75000, 20000, n).clip(30000, 150000),
    "experience": np.random.normal(8, 4, n).clip(0, 30),
    "department": np.random.choice(
        ["Engineering", "Marketing", "Sales", "HR"], n,
        p=[0.4, 0.25, 0.2, 0.15]
    ),
    "satisfaction": np.random.uniform(1, 10, n).round(1),
})
df["salary"] = df["salary"] + df["experience"] * 2000  # add correlation


# ============================================================
# 1. Matplotlib — Object-Oriented API (production style)
# ============================================================
fig, axes = plt.subplots(2, 2, figsize=(12, 10))
fig.suptitle("Employee Dashboard", fontsize=16, fontweight="bold")

# Panel 1: Histogram with KDE overlay
ax = axes[0, 0]
ax.hist(df["salary"], bins=30, edgecolor="white", alpha=0.7,
        color="#2196F3", density=True, label="Histogram")
# Overlay KDE using numpy
from scipy.stats import gaussian_kde
kde = gaussian_kde(df["salary"])
x_range = np.linspace(df["salary"].min(), df["salary"].max(), 200)
ax.plot(x_range, kde(x_range), color="#FF5722", linewidth=2, label="KDE")
ax.set_xlabel("Salary ($)")
ax.set_ylabel("Density")
ax.set_title("Salary Distribution")
ax.xaxis.set_major_formatter(ticker.FuncFormatter(
    lambda x, _: f"\${x/1000:.0f}K"
))
ax.legend()

# Panel 2: Scatter plot with regression line
ax = axes[0, 1]
colors = {"Engineering": "#2196F3", "Marketing": "#4CAF50",
          "Sales": "#FF9800", "HR": "#9C27B0"}
for dept, group in df.groupby("department"):
    ax.scatter(group["experience"], group["salary"],
               alpha=0.6, label=dept, color=colors[dept], s=30)
# Add trendline
z = np.polyfit(df["experience"], df["salary"], 1)
p = np.poly1d(z)
ax.plot(sorted(df["experience"]), p(sorted(df["experience"])),
        "r--", linewidth=2, label=f"Trend (slope={z[0]:,.0f})")
ax.set_xlabel("Years of Experience")
ax.set_ylabel("Salary ($)")
ax.set_title("Experience vs Salary")
ax.legend(fontsize=8)

# Panel 3: Box plot by department
ax = axes[1, 0]
dept_order = df.groupby("department")["salary"].median().sort_values().index
bp = ax.boxplot(
    [df[df["department"] == d]["salary"] for d in dept_order],
    labels=dept_order, patch_artist=True, notch=True,
)
for patch, dept in zip(bp["boxes"], dept_order):
    patch.set_facecolor(colors[dept])
    patch.set_alpha(0.7)
ax.set_ylabel("Salary ($)")
ax.set_title("Salary by Department")
ax.tick_params(axis="x", rotation=15)

# Panel 4: Bar chart of average satisfaction
ax = axes[1, 1]
dept_satisfaction = (
    df.groupby("department")["satisfaction"]
    .agg(["mean", "std"])
    .sort_values("mean", ascending=True)
)
bars = ax.barh(dept_satisfaction.index, dept_satisfaction["mean"],
               xerr=dept_satisfaction["std"], capsize=5,
               color=[colors[d] for d in dept_satisfaction.index],
               alpha=0.8, edgecolor="white")
ax.set_xlabel("Satisfaction Score (1-10)")
ax.set_title("Average Satisfaction by Department")
ax.set_xlim(0, 10)
for bar, val in zip(bars, dept_satisfaction["mean"]):
    ax.text(val + 0.3, bar.get_y() + bar.get_height() / 2,
            f"{val:.1f}", va="center", fontweight="bold")

plt.tight_layout()
plt.savefig("employee_dashboard.png", dpi=150, bbox_inches="tight")
plt.show()


# ============================================================
# 2. Seaborn — Statistical Visualization
# ============================================================
sns.set_theme(style="whitegrid", palette="husl", font_scale=1.1)

# FacetGrid: distribution per department
g = sns.FacetGrid(df, col="department", col_wrap=2,
                  height=4, aspect=1.2)
g.map_dataframe(sns.histplot, x="salary", kde=True, bins=20)
g.set_titles("{col_name}")
g.set_axis_labels("Salary ($)", "Count")
plt.tight_layout()
plt.show()

# Pair plot: multi-variable relationships
sns.pairplot(df[["age", "salary", "experience", "satisfaction",
                 "department"]],
             hue="department", diag_kind="kde",
             plot_kws={"alpha": 0.5, "s": 20})
plt.suptitle("Pairwise Relationships", y=1.02)
plt.show()

# Heatmap: correlation matrix
fig, ax = plt.subplots(figsize=(8, 6))
numeric_cols = df.select_dtypes(include=[np.number])
corr = numeric_cols.corr()
mask = np.triu(np.ones_like(corr, dtype=bool))  # upper triangle mask
sns.heatmap(corr, mask=mask, annot=True, fmt=".2f", cmap="coolwarm",
            center=0, square=True, linewidths=0.5, ax=ax,
            cbar_kws={"shrink": 0.8})
ax.set_title("Correlation Matrix")
plt.tight_layout()
plt.show()

# Violin + strip plot combo
fig, ax = plt.subplots(figsize=(10, 6))
sns.violinplot(data=df, x="department", y="salary", inner=None,
               alpha=0.3, ax=ax)
sns.stripplot(data=df, x="department", y="salary", size=3,
              alpha=0.6, jitter=True, ax=ax)
ax.set_title("Salary Distribution by Department (Violin + Strip)")
plt.tight_layout()
plt.show()


# ============================================================
# 3. Plotly Express — Interactive Charts
# ============================================================
# NOTE: Plotly outputs render in Jupyter notebooks or as HTML files.
# Uncomment the lines below to generate interactive charts.

# import plotly.express as px
#
# # Interactive scatter with hover data
# fig = px.scatter(
#     df, x="experience", y="salary", color="department",
#     size="satisfaction", hover_data=["age"],
#     title="Interactive: Experience vs Salary",
#     labels={"experience": "Years of Experience",
#             "salary": "Annual Salary ($)"},
#     template="plotly_white",
# )
# fig.update_traces(marker=dict(opacity=0.7, line=dict(width=0.5)))
# fig.show()   # opens in browser or renders in notebook
#
# # Animated scatter over age groups
# df["age_bin"] = pd.cut(df["age"], bins=5).astype(str)
# fig = px.scatter(
#     df, x="experience", y="salary", color="department",
#     animation_frame="age_bin", size="satisfaction",
#     range_y=[20000, 180000], range_x=[0, 35],
#     title="Salary by Experience (Animated by Age Group)",
# )
# fig.show()


# ============================================================
# 4. Styling & Best Practices
# ============================================================
# Custom style context manager
with plt.style.context("seaborn-v0_8-paper"):
    fig, ax = plt.subplots(figsize=(8, 5))
    dept_counts = df["department"].value_counts()
    colors_list = [colors.get(d, "#999") for d in dept_counts.index]
    bars = ax.bar(dept_counts.index, dept_counts.values,
                  color=colors_list, edgecolor="white", linewidth=1.5)

    # Annotate bars with values
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2., height + 1,
                f"{int(height)}", ha="center", va="bottom",
                fontweight="bold", fontsize=12)

    ax.set_ylabel("Number of Employees")
    ax.set_title("Headcount by Department",
                 fontsize=14, fontweight="bold")
    ax.spines[["top", "right"]].set_visible(False)  # remove chartjunk
    plt.tight_layout()
    plt.savefig("headcount.png", dpi=150, bbox_inches="tight",
                facecolor="white")
    plt.show()`,
      exercise: `1. Create a 2x2 subplot dashboard using Matplotlib's object-oriented API showing: (a) a histogram of a numeric column, (b) a scatter plot with a trendline, (c) a horizontal bar chart with error bars, and (d) a pie chart with percentage labels. Apply consistent styling across all panels.

2. Use Seaborn to create a pair plot of at least 4 numeric variables colored by a categorical variable. Then create a heatmap of the correlation matrix with annotations. Interpret which variables are most strongly correlated and why.

3. Build a Seaborn FacetGrid that shows the distribution of salaries across departments, with each panel representing a different experience level bin (0-5, 5-10, 10-15, 15+ years). Add KDE overlays and consistent axis limits.

4. Create a publication-quality figure with Matplotlib that includes: a custom color palette, removed top/right spines, formatted tick labels (e.g., "$50K" instead of 50000), a legend outside the plot area, and export it as both PNG (150 dpi) and SVG.

5. (Bonus) Use Plotly Express to create an interactive scatter plot with hover tooltips showing all data fields, color by category, size by a numeric variable, and add dropdown filters. Export it as a self-contained HTML file.`,
      commonMistakes: [
        "Using the pyplot stateful API (`plt.plot()`) for complex multi-panel figures — always use the object-oriented API (`fig, ax = plt.subplots()`) for anything beyond quick exploratory plots.",
        "Forgetting `plt.tight_layout()` or `bbox_inches='tight'` when saving, resulting in cut-off labels and overlapping titles.",
        "Choosing chart types for visual appeal rather than data appropriateness — pie charts for more than 5 categories, 3D bar charts when 2D suffices, or line charts for non-sequential categorical data.",
        "Not considering colorblind accessibility — avoid red/green-only palettes. Use Seaborn's colorblind-friendly palettes like 'colorblind', 'deep', or viridis/plasma from Matplotlib.",
        "Creating overly complex visualizations that obscure the message. Effective charts have a high data-to-ink ratio — remove gridlines, borders, and decorations that do not aid interpretation.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the difference between Matplotlib's pyplot API and its object-oriented API. When would you use each?",
          a: "The pyplot API (`plt.plot()`, `plt.xlabel()`) is stateful — it operates on the 'current' figure and axes implicitly, similar to MATLAB. It is convenient for quick, single-panel exploratory plots. The object-oriented API (`fig, ax = plt.subplots()`) is explicit — you create Figure and Axes objects and call methods on them directly. Use OO for production code, multi-panel layouts, and when you need fine control. The OO API is more Pythonic, avoids ambiguity about which axes you are modifying, and is easier to integrate into functions and classes.",
        },
        {
          type: "scenario",
          q: "You need to present data showing how employee satisfaction varies across 4 departments and 3 experience levels. What visualization would you choose and why?",
          a: "A grouped or faceted visualization works best here. Options: (1) Seaborn's `catplot()` with `kind='box'` or `kind='violin'`, using `hue` for experience level and `x` for department — shows distribution, outliers, and comparison. (2) A FacetGrid with one panel per experience level, each showing department satisfaction distributions. (3) A heatmap of mean satisfaction with department on one axis and experience level on the other, annotated with values. The choice depends on emphasis: box/violin for distribution detail, heatmap for quick pattern recognition. Avoid bar charts here — they hide distribution and only show means.",
        },
        {
          type: "conceptual",
          q: "What are the key differences between Matplotlib/Seaborn and Plotly? When would you choose one over the other?",
          a: "Matplotlib/Seaborn produce static images — ideal for publications, reports, and presentations where you control the output format. They have deep customization and are the standard in scientific computing. Plotly produces interactive HTML/JavaScript charts — ideal for dashboards, web apps, Jupyter exploration, and when users need to hover, zoom, or filter. Plotly charts are larger in file size and require a browser. Choose Matplotlib/Seaborn for printed reports, academic papers, and static documentation. Choose Plotly for internal dashboards, stakeholder presentations with drill-down, and web applications. Many teams use both: Seaborn for EDA and publications, Plotly for stakeholder-facing dashboards.",
        },
      ],
    },
  ],
};

export default pyPhase11;
