const pyPhase10 = {
  id: "phase-10",
  title: "Phase 10: Web Development",
  emoji: "\u{1F310}",
  description:
    "Build web applications with Python \u2014 compare Flask, Django, and FastAPI, create REST APIs, and work with databases using SQLAlchemy.",
  topics: [
    {
      id: "py-web-frameworks",
      title: "Web Frameworks: Flask vs Django vs FastAPI",
      explanation: `Python offers three dominant web frameworks, each with a distinct philosophy and sweet spot. Understanding their differences is critical for choosing the right tool and answering interview questions about architecture trade-offs.

**Comparison Table:**

| Feature | Flask | Django | FastAPI |
|---------|-------|--------|---------|
| **Philosophy** | Micro-framework, minimal core | Batteries-included | Modern, async-first |
| **Server Interface** | WSGI | WSGI (ASGI via Channels) | ASGI (native async) |
| **ORM** | None (use SQLAlchemy) | Built-in Django ORM | None (use SQLAlchemy) |
| **Admin Panel** | None | Built-in | None |
| **Validation** | Manual / WTForms | Django Forms / DRF serializers | Pydantic (automatic) |
| **Auto Docs** | No (add Swagger manually) | No (add via DRF) | Yes (OpenAPI + Swagger UI) |
| **Async Support** | Limited (\`async\` views in 2.0+) | Partial (views, ORM still sync) | Full native async/await |
| **Learning Curve** | Low | High | Medium |
| **Best For** | Microservices, prototypes | Full-stack apps, CMS, admin-heavy | APIs, high-concurrency services |

**WSGI vs ASGI:**
- **WSGI** (Web Server Gateway Interface) is the traditional synchronous protocol. One request per thread. Servers: Gunicorn, uWSGI.
- **ASGI** (Asynchronous Server Gateway Interface) supports async, WebSockets, and long-lived connections natively. Servers: Uvicorn, Daphne, Hypercorn.

**When to use each:**
- **Flask** \u2014 small APIs, microservices, when you want full control over every dependency. Perfect for teams that prefer explicit over implicit.
- **Django** \u2014 content-heavy sites, admin dashboards, projects needing auth, ORM, migrations, and templating out of the box. Ideal when development speed matters more than micro-optimization.
- **FastAPI** \u2014 high-performance REST/GraphQL APIs, real-time applications, ML model serving. Best when you need automatic validation, serialization, and interactive documentation.

In interviews, emphasize that the choice depends on **project requirements** \u2014 not personal preference. A monolithic Django app and a FastAPI microservice solve different problems.`,
      codeExample: `# ============================================================
# Flask \u2014 Minimal "Hello World" API
# ============================================================
# from flask import Flask, jsonify, request, abort
#
# app = Flask(__name__)
#
# # In-memory store (replaced by a database in production)
# books = [
#     {"id": 1, "title": "Clean Code", "author": "Robert Martin"},
#     {"id": 2, "title": "Pragmatic Programmer", "author": "Hunt & Thomas"},
# ]
#
#
# @app.route("/api/books", methods=["GET"])
# def get_books():
#     """GET /api/books \u2014 return all books."""
#     return jsonify(books)
#
#
# @app.route("/api/books/<int:book_id>", methods=["GET"])
# def get_book(book_id):
#     """GET /api/books/:id \u2014 return single book or 404."""
#     book = next((b for b in books if b["id"] == book_id), None)
#     if book is None:
#         abort(404, description="Book not found")
#     return jsonify(book)
#
#
# @app.route("/api/books", methods=["POST"])
# def create_book():
#     """POST /api/books \u2014 create a new book."""
#     data = request.get_json()
#     if not data or "title" not in data:
#         abort(400, description="Title is required")
#     new_book = {
#         "id": max(b["id"] for b in books) + 1 if books else 1,
#         "title": data["title"],
#         "author": data.get("author", "Unknown"),
#     }
#     books.append(new_book)
#     return jsonify(new_book), 201
#
#
# # ============================================================
# # Django \u2014 Views equivalent (views.py in a Django app)
# # ============================================================
# # BAD: Fat views with no separation of concerns
# # from django.http import JsonResponse
# # from django.views import View
# #
# # class BookView(View):
# #     def get(self, request):
# #         books = list(Book.objects.values("id", "title", "author"))
# #         return JsonResponse(books, safe=False)
# #     def post(self, request):
# #         import json
# #         data = json.loads(request.body)
# #         book = Book.objects.create(**data)  # No validation!
# #         return JsonResponse({"id": book.id}, status=201)
#
# # GOOD: Django REST Framework serializer-based views
# # from rest_framework import viewsets, serializers
# # from .models import Book
# #
# # class BookSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = Book
# #         fields = ["id", "title", "author"]
# #
# # class BookViewSet(viewsets.ModelViewSet):
# #     queryset = Book.objects.all()
# #     serializer_class = BookSerializer
# #     # Gives you GET, POST, PUT, PATCH, DELETE for free
#
#
# # ============================================================
# # FastAPI \u2014 Same API with automatic validation & docs
# # ============================================================
# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel, Field
#
# app = FastAPI(title="Book API", version="1.0.0")
#
#
# class BookCreate(BaseModel):
#     """Pydantic model = automatic validation + serialization."""
#     title: str = Field(..., min_length=1, max_length=200)
#     author: str = Field(default="Unknown", max_length=100)
#
#
# class BookResponse(BookCreate):
#     id: int
#
#
# books_db: list[BookResponse] = []
#
#
# @app.get("/api/books", response_model=list[BookResponse])
# async def get_books():
#     return books_db
#
#
# @app.get("/api/books/{book_id}", response_model=BookResponse)
# async def get_book(book_id: int):
#     book = next((b for b in books_db if b.id == book_id), None)
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")
#     return book
#
#
# @app.post("/api/books", response_model=BookResponse, status_code=201)
# async def create_book(book: BookCreate):
#     # Pydantic validates the request body automatically
#     new_id = max((b.id for b in books_db), default=0) + 1
#     new_book = BookResponse(id=new_id, **book.model_dump())
#     books_db.append(new_book)
#     return new_book
#
#
# # Run: uvicorn main:app --reload
# # Docs: http://127.0.0.1:8000/docs (Swagger UI auto-generated)`,
      exercise: `**Exercises:**

1. Build the same CRUD API (Create, Read, Update, Delete for a \\\`Task\\\` model with \\\`id\\\`, \\\`title\\\`, \\\`done\\\`, \\\`created_at\\\` fields) in all three frameworks: Flask, Django REST Framework, and FastAPI. Compare the total lines of code, validation handling, and error responses.

2. Add pagination to each framework's list endpoint. Implement \\\`?page=1&per_page=10\\\` query parameters. Compare how each framework handles query parameter parsing and validation.

3. Create a Flask Blueprint and a Django app that both serve a \\\`/health\\\` endpoint returning \\\`{"status": "ok", "uptime": <seconds>}\\\`. Demonstrate how each framework organizes modular code.

4. Write a FastAPI app with automatic OpenAPI documentation. Add custom examples to Pydantic models using \\\`model_config\\\` so that the Swagger UI shows realistic sample data.

5. Deploy your FastAPI app behind Uvicorn with Gunicorn as the process manager. Benchmark it with \\\`wrk\\\` or \\\`hey\\\` and compare throughput against the Flask equivalent running under Gunicorn with sync workers.`,
      commonMistakes: [
        "Using Flask for a project that needs auth, admin, ORM, and migrations out of the box \u2014 Django would save weeks of integration work. Choose the framework that matches your project scope, not the one you are most comfortable with.",
        "Running FastAPI with a WSGI server like Gunicorn without Uvicorn workers. FastAPI requires an ASGI server. Use `uvicorn main:app` or `gunicorn main:app -k uvicorn.workers.UvicornWorker` for production.",
        "Blocking the event loop in FastAPI async handlers by calling synchronous I/O (e.g., `time.sleep()`, synchronous DB queries). Use `await asyncio.sleep()`, async DB drivers, or declare the handler as `def` (not `async def`) so FastAPI runs it in a thread pool.",
        "Not validating request data in Flask. Unlike FastAPI (Pydantic) or Django (Forms/Serializers), Flask does zero automatic validation. Always validate `request.get_json()` manually or use a library like Marshmallow.",
        "Ignoring Django's CSRF protection when building APIs. For token-based APIs, use Django REST Framework's authentication classes and explicitly exempt views from CSRF where appropriate, rather than disabling middleware globally.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the difference between WSGI and ASGI. Why does it matter for modern web applications?",
          a: "**WSGI** (PEP 3333) is a synchronous interface: the server passes a request to the app, the app returns a response. One request occupies one thread/process for its entire lifecycle, making it unsuitable for long-lived connections. **ASGI** is the async evolution: it supports async/await, WebSockets, HTTP/2, and server-sent events natively. ASGI apps can handle thousands of concurrent connections on a single process because they yield control during I/O waits. This matters because modern apps need real-time features (chat, notifications, streaming) and high concurrency. Flask and Django traditionally use WSGI (Gunicorn/uWSGI), while FastAPI uses ASGI (Uvicorn). Django has partial ASGI support via Django Channels but its ORM remains synchronous.",
        },
        {
          type: "scenario",
          q: "Your team needs to build a new service that serves ML model predictions via API. It needs to handle 1000+ concurrent requests and validate complex input schemas. Which framework would you choose and why?",
          a: "**FastAPI** is the clear choice. 1) **Async-native**: handles high concurrency without thread overhead \u2014 critical for I/O-bound ML inference calls. 2) **Pydantic validation**: complex input schemas (feature vectors, nested objects, type constraints) are validated automatically with detailed error messages. 3) **Automatic OpenAPI docs**: data scientists and frontend teams get interactive documentation for free. 4) **Performance**: benchmarks consistently show FastAPI near Go/Node.js levels for I/O-bound workloads. 5) **Background tasks**: built-in support for fire-and-forget operations like logging predictions. Flask would require assembling many libraries; Django's overhead is unnecessary for a pure API service.",
        },
        {
          type: "tricky",
          q: "Can you use SQLAlchemy with Django? What about the Django ORM with FastAPI?",
          a: "Technically **yes to both**, but it is rarely a good idea. Django has its own ORM deeply integrated with migrations, admin, auth, and forms \u2014 replacing it with SQLAlchemy means losing most of Django's value. You would be better off using Flask or FastAPI instead. Conversely, using Django ORM outside Django requires calling `django.setup()` and configuring `DJANGO_SETTINGS_MODULE`, which adds heavy coupling to the Django framework. The practical answer: use Django ORM with Django, SQLAlchemy with Flask/FastAPI, and do not mix them unless you have a very specific reason (e.g., a legacy migration).",
        },
      ],
    },
    {
      id: "py-fastapi",
      title: "FastAPI Deep Dive",
      explanation: `**FastAPI** is a modern, high-performance Python web framework built on top of **Starlette** (ASGI toolkit) and **Pydantic** (data validation). It has rapidly become the most popular choice for building Python APIs due to its speed, developer experience, and automatic documentation.

**Core Concepts:**

**Pydantic Models** are the backbone of FastAPI. Every request body, response, and query parameter can be defined as a Pydantic model with type hints, validators, and default values. FastAPI uses these models to automatically parse, validate, serialize, and document your API.

**Dependency Injection** is FastAPI's most powerful feature. The \\\`Depends()\\\` function lets you declare dependencies that are resolved at request time. Dependencies can depend on other dependencies (forming a graph), they can be sync or async, and they handle cleanup via \\\`yield\\\`. Common uses: database sessions, authentication, rate limiting, pagination.

**Middleware** intercepts every request/response cycle. FastAPI supports both Starlette-style middleware (classes with \\\`dispatch\\\` method) and pure ASGI middleware. Use cases: CORS, request timing, logging, authentication headers, compression.

**Background Tasks** let you run functions after returning a response. FastAPI's \\\`BackgroundTasks\\\` parameter queues work to be executed after the response is sent \u2014 ideal for sending emails, logging analytics, or cleanup operations without blocking the client.

**Async Handlers** are where FastAPI shines. Handlers declared with \\\`async def\\\` run on the async event loop, enabling non-blocking I/O. Handlers declared with plain \\\`def\\\` are automatically run in a thread pool. The rule: use \\\`async def\\\` when calling \\\`await\\\`-able code (async DB drivers, httpx), use \\\`def\\\` for synchronous blocking code.

**Key architectural decisions:**
- Use \\\`APIRouter\\\` to organize endpoints into modules (like Flask Blueprints)
- Use \\\`Lifespan\\\` events for startup/shutdown logic (DB connection pools, ML model loading)
- Use response models (\\\`response_model\\\`) to control what gets serialized \u2014 never expose internal fields`,
      codeExample: `# ============================================================
# FastAPI Production Patterns
# ============================================================
# from fastapi import (
#     FastAPI, Depends, HTTPException, BackgroundTasks,
#     Query, Path, status, Request
# )
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, Field, field_validator, ConfigDict
# from contextlib import asynccontextmanager
# from typing import Annotated
# import asyncio
# import time
# import logging
#
# logger = logging.getLogger(__name__)
#
#
# # ============================================================
# # Pydantic Models \u2014 request/response validation
# # ============================================================
# class UserCreate(BaseModel):
#     """Request model with validation rules."""
#     model_config = ConfigDict(
#         json_schema_extra={
#             "examples": [{"username": "janedoe", "email": "jane@example.com"}]
#         }
#     )
#
#     username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-z0-9_]+$")
#     email: str = Field(..., max_length=255)
#     full_name: str | None = Field(default=None, max_length=100)
#
#     @field_validator("email")
#     @classmethod
#     def validate_email(cls, v):
#         if "@" not in v or "." not in v.split("@")[-1]:
#             raise ValueError("Invalid email format")
#         return v.lower()
#
#
# class UserResponse(BaseModel):
#     """Response model \u2014 controls what the client sees."""
#     id: int
#     username: str
#     email: str
#     full_name: str | None = None
#     # NOTE: password hash is NOT included in the response model
#
#
# # ============================================================
# # Dependency Injection \u2014 composable request dependencies
# # ============================================================
#
# # BAD: Hardcoded database connection in every handler
# # @app.get("/users")
# # async def get_users():
# #     db = sqlite3.connect("app.db")  # created every request!
# #     users = db.execute("SELECT * FROM users").fetchall()
# #     db.close()
# #     return users
#
# # GOOD: Dependency injection with yield (setup + teardown)
# async def get_db():
#     """Database session dependency with automatic cleanup."""
#     db = AsyncSession(engine)
#     try:
#         yield db  # value injected into handler
#     finally:
#         await db.close()  # teardown runs after response
#
#
# async def get_current_user(
#     request: Request,
#     db: AsyncSession = Depends(get_db),
# ):
#     """Auth dependency \u2014 depends on get_db (dependency chain)."""
#     token = request.headers.get("Authorization", "").replace("Bearer ", "")
#     if not token:
#         raise HTTPException(status_code=401, detail="Not authenticated")
#     user = await db.execute(select(User).where(User.token == token))
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid token")
#     return user.scalar_one()
#
#
# class PaginationParams:
#     """Reusable pagination dependency as a class."""
#     def __init__(
#         self,
#         page: int = Query(1, ge=1, description="Page number"),
#         per_page: int = Query(20, ge=1, le=100, description="Items per page"),
#     ):
#         self.offset = (page - 1) * per_page
#         self.limit = per_page
#
#
# # ============================================================
# # Lifespan \u2014 startup/shutdown events
# # ============================================================
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """Replaces deprecated @app.on_event startup/shutdown."""
#     logger.info("Starting up: initializing DB pool...")
#     # app.state.db_pool = await create_pool(...)
#     yield
#     logger.info("Shutting down: closing DB pool...")
#     # await app.state.db_pool.close()
#
#
# app = FastAPI(title="User API", version="2.0", lifespan=lifespan)
#
# # Middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["https://example.com"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
#
# # ============================================================
# # Background Tasks \u2014 fire-and-forget after response
# # ============================================================
# async def send_welcome_email(email: str, username: str):
#     """Runs AFTER the response is sent to the client."""
#     await asyncio.sleep(2)  # simulate email sending
#     logger.info(f"Welcome email sent to {email}")
#
#
# @app.post("/users", response_model=UserResponse, status_code=201)
# async def create_user(
#     user: UserCreate,
#     background_tasks: BackgroundTasks,
#     db: AsyncSession = Depends(get_db),
# ):
#     # Pydantic already validated the input
#     db_user = User(**user.model_dump())
#     db.add(db_user)
#     await db.commit()
#     await db.refresh(db_user)
#
#     # Schedule background work \u2014 does NOT block the response
#     background_tasks.add_task(send_welcome_email, user.email, user.username)
#
#     return db_user
#
#
# @app.get("/users", response_model=list[UserResponse])
# async def list_users(
#     pagination: PaginationParams = Depends(),
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     result = await db.execute(
#         select(User).offset(pagination.offset).limit(pagination.limit)
#     )
#     return result.scalars().all()`,
      exercise: `**Exercises:**

1. Build a FastAPI application with Pydantic models for a \\\`Product\\\` resource. Include \\\`field_validator\\\` rules: price must be positive, SKU must match a regex pattern, and description must be between 10 and 1000 characters. Test that invalid inputs return 422 with clear error messages.

2. Implement a dependency injection chain: \\\`get_db()\\\` yields a database session, \\\`get_current_user()\\\` depends on \\\`get_db()\\\` and extracts the user from a JWT token, and \\\`require_admin()\\\` depends on \\\`get_current_user()\\\` and checks for admin role. Apply \\\`require_admin\\\` to a DELETE endpoint.

3. Add custom middleware that logs the request method, path, status code, and response time for every request. Store the logs in a list and expose a \\\`GET /metrics\\\` endpoint that returns the last 100 entries.

4. Create a background task system: when a user signs up via \\\`POST /register\\\`, immediately return 201, then send a welcome email and generate a default avatar image in the background. Verify the tasks complete using a \\\`GET /tasks/{task_id}\\\` status endpoint.

5. Organize a FastAPI app into multiple \\\`APIRouter\\\` modules: \\\`users.py\\\`, \\\`products.py\\\`, and \\\`orders.py\\\`. Each router should have its own prefix, tags, and shared dependencies. Wire them together in \\\`main.py\\\` and verify the auto-generated docs group endpoints by tag.

6. Implement rate limiting as a FastAPI dependency. The dependency should track requests per IP using an in-memory dictionary and raise \\\`HTTPException(429)\\\` if the limit is exceeded. Add a sliding window algorithm instead of a simple counter.`,
      commonMistakes: [
        "Declaring handlers as `async def` but calling synchronous blocking code inside them (e.g., `requests.get()`, `time.sleep()`, synchronous ORM queries). This blocks the entire event loop. Either use `def` (runs in thread pool) or use async libraries (`httpx`, `asyncpg`).",
        "Not using `response_model` on endpoints, which means internal fields (password hashes, internal IDs, soft-delete flags) leak to the client. Always define a separate response model that excludes sensitive data.",
        "Creating a new database connection inside every handler instead of using `Depends()` with a yielding dependency. This wastes resources and makes testing impossible \u2014 dependencies can be overridden in tests with `app.dependency_overrides`.",
        "Putting all endpoints in a single `main.py` file instead of using `APIRouter` for modular organization. This creates a monolith that is hard to maintain and test. Split by domain: `routers/users.py`, `routers/products.py`, etc.",
        "Using `@app.on_event('startup')` and `@app.on_event('shutdown')` which are deprecated. Use the `lifespan` async context manager instead, which provides cleaner resource management and is the officially supported pattern.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "How does FastAPI's dependency injection system work? How does it compare to frameworks like Spring or NestJS?",
          a: "FastAPI's DI uses **function parameters** with `Depends()`. When a handler declares `db: Session = Depends(get_db)`, FastAPI calls `get_db()` at request time and injects the return value. Dependencies can depend on other dependencies, forming a **DAG** (directed acyclic graph) that FastAPI resolves automatically. `yield`-based dependencies provide setup+teardown (like context managers). **Comparison:** Spring uses annotation-based IoC containers with singleton beans. NestJS uses class-based providers with decorators. FastAPI is simpler \u2014 dependencies are plain functions, no container configuration. The trade-off: FastAPI dependencies are request-scoped by default (created per request), while Spring beans are typically singletons. For request-scoped behavior in Spring, you need explicit `@Scope('request')`.",
        },
        {
          type: "coding",
          q: "Write a FastAPI dependency that implements a simple API key authentication check.",
          a: `\\\`\\\`\\\`python
from fastapi import Depends, HTTPException, Header, status

API_KEYS = {"key-abc123": "admin", "key-xyz789": "reader"}

async def verify_api_key(
    x_api_key: str = Header(..., alias="X-API-Key"),
):
    if x_api_key not in API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key",
        )
    return {"key": x_api_key, "role": API_KEYS[x_api_key]}

@app.get("/protected")
async def protected_route(auth: dict = Depends(verify_api_key)):
    return {"message": f"Hello, {auth['role']} user"}
\\\`\\\`\\\``,
        },
        {
          type: "scenario",
          q: "You have a FastAPI endpoint that processes uploaded images (resize, compress, generate thumbnails). The processing takes 10-30 seconds. How would you architect this?",
          a: "Do NOT process in the request handler \u2014 return immediately with a job ID. **Architecture:** 1) `POST /upload` saves the file to object storage (S3), creates a job record in the DB with status `pending`, and enqueues a task to a background worker (Celery, ARQ, or Dramatiq). Return `202 Accepted` with the job ID. 2) The worker processes the image asynchronously, updates the job status to `completed` with result URLs. 3) `GET /jobs/{id}` lets the client poll for status. 4) Optionally, use WebSockets or SSE for real-time progress updates. FastAPI's built-in `BackgroundTasks` is only suitable for lightweight fire-and-forget work (logging, email). For CPU-intensive tasks, use a proper task queue with separate worker processes to avoid blocking the API server.",
        },
        {
          type: "tricky",
          q: "What happens if you define a FastAPI handler as `async def` but forget to `await` an async call inside it?",
          a: "You get a **coroutine object** instead of the actual result, and Python may raise a `RuntimeWarning: coroutine was never awaited`. The handler returns (or uses) the unawaited coroutine object, leading to bugs like returning `<coroutine object fetch at 0x...>` in your JSON response or passing `None`-like objects to downstream logic. FastAPI will not catch this \u2014 it is a standard Python async pitfall. The fix: always `await` async calls, or use linters like `flake8-async` or `ruff` with the `ASYNC` rules to catch unawaited coroutines at lint time.",
        },
      ],
    },
    {
      id: "py-rest-apis",
      title: "REST APIs & HTTP Clients",
      explanation: `Understanding **REST conventions** and knowing how to consume APIs with Python's HTTP client libraries is essential for both building and integrating with web services. In interviews, you will be asked about status codes, idempotency, and how to handle unreliable network calls.

**REST Conventions:**
- **GET** \u2014 Read resource(s). Must be **idempotent** and **safe** (no side effects). Cacheable.
- **POST** \u2014 Create a new resource. Not idempotent (calling twice creates two resources).
- **PUT** \u2014 Full replacement of a resource. **Idempotent** (calling twice has the same effect).
- **PATCH** \u2014 Partial update. May or may not be idempotent depending on implementation.
- **DELETE** \u2014 Remove a resource. Idempotent (deleting twice gives 404 on second call but the state is the same).

**Status Code Families:**
- **2xx** \u2014 Success: 200 OK, 201 Created, 204 No Content
- **3xx** \u2014 Redirection: 301 Moved Permanently, 304 Not Modified
- **4xx** \u2014 Client Error: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 429 Too Many Requests
- **5xx** \u2014 Server Error: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable

**Python HTTP Libraries:**
- **\\\`requests\\\`** \u2014 The classic synchronous library. Simple API, widely used, but blocks the calling thread during I/O.
- **\\\`httpx\\\`** \u2014 Modern library supporting both sync and async. Drop-in replacement for \\\`requests\\\` with an async client (\\\`httpx.AsyncClient\\\`). Supports HTTP/2.
- **\\\`aiohttp\\\`** \u2014 Async-only library, more low-level than httpx. Used heavily in older async codebases.

**Production patterns** include retry logic with exponential backoff, connection pooling via sessions/clients, timeout configuration, and proper error handling for transient failures. These patterns prevent cascading failures in microservice architectures.`,
      codeExample: `# ============================================================
# HTTP Client Patterns \u2014 requests vs httpx
# ============================================================
# import requests
# import httpx
# import asyncio
# import time
# from typing import Any
#
#
# # ============================================================
# # BAD: Naive HTTP calls without error handling or sessions
# # ============================================================
# # def get_user_bad(user_id):
# #     # Creates a new TCP connection every call (slow)
# #     response = requests.get(f"https://api.example.com/users/{user_id}")
# #     return response.json()  # Crashes on non-200 or invalid JSON
#
#
# # ============================================================
# # GOOD: Production-grade synchronous client with requests
# # ============================================================
# class APIClient:
#     """Reusable HTTP client with session pooling and retries."""
#
#     def __init__(self, base_url: str, api_key: str, timeout: int = 30):
#         self.base_url = base_url.rstrip("/")
#         self.session = requests.Session()
#
#         # Connection pooling \u2014 reuses TCP connections
#         adapter = requests.adapters.HTTPAdapter(
#             pool_connections=10,
#             pool_maxsize=20,
#             max_retries=requests.adapters.Retry(
#                 total=3,
#                 backoff_factor=1,           # 1s, 2s, 4s between retries
#                 status_forcelist=[502, 503, 504],  # retry on these status codes
#                 allowed_methods=["GET", "PUT", "DELETE"],  # only idempotent methods
#             ),
#         )
#         self.session.mount("https://", adapter)
#         self.session.mount("http://", adapter)
#
#         # Default headers for all requests
#         self.session.headers.update({
#             "Authorization": f"Bearer {api_key}",
#             "Content-Type": "application/json",
#             "Accept": "application/json",
#         })
#         self.timeout = timeout
#
#     def get(self, path: str, params: dict = None) -> dict:
#         """GET with proper error handling."""
#         url = f"{self.base_url}{path}"
#         try:
#             response = self.session.get(url, params=params, timeout=self.timeout)
#             response.raise_for_status()  # raises HTTPError for 4xx/5xx
#             return response.json()
#         except requests.exceptions.Timeout:
#             raise TimeoutError(f"Request to {url} timed out after {self.timeout}s")
#         except requests.exceptions.HTTPError as e:
#             if e.response.status_code == 404:
#                 return None
#             raise
#         except requests.exceptions.ConnectionError:
#             raise ConnectionError(f"Cannot reach {url}")
#
#     def post(self, path: str, data: dict) -> dict:
#         """POST with response validation."""
#         url = f"{self.base_url}{path}"
#         response = self.session.post(url, json=data, timeout=self.timeout)
#         response.raise_for_status()
#         return response.json()
#
#     def close(self):
#         """Always close sessions to release connections."""
#         self.session.close()
#
#     def __enter__(self):
#         return self
#
#     def __exit__(self, *args):
#         self.close()
#
#
# # Usage:
# # with APIClient("https://api.example.com", api_key="secret") as client:
# #     user = client.get("/users/42")
# #     new_user = client.post("/users", {"name": "Alice", "role": "admin"})
#
#
# # ============================================================
# # GOOD: Async client with httpx (for FastAPI/async apps)
# # ============================================================
# async def fetch_multiple_users(user_ids: list[int]) -> list[dict]:
#     """Fetch multiple users concurrently with httpx.AsyncClient."""
#     async with httpx.AsyncClient(
#         base_url="https://api.example.com",
#         headers={"Authorization": "Bearer secret"},
#         timeout=httpx.Timeout(30.0, connect=5.0),
#     ) as client:
#         # Fire all requests concurrently
#         tasks = [client.get(f"/users/{uid}") for uid in user_ids]
#         responses = await asyncio.gather(*tasks, return_exceptions=True)
#
#         results = []
#         for resp in responses:
#             if isinstance(resp, Exception):
#                 results.append({"error": str(resp)})
#             elif resp.status_code == 200:
#                 results.append(resp.json())
#             else:
#                 results.append({"error": f"HTTP {resp.status_code}"})
#         return results
#
#
# # ============================================================
# # Retry with exponential backoff (manual implementation)
# # ============================================================
# async def fetch_with_retry(
#     client: httpx.AsyncClient,
#     url: str,
#     max_retries: int = 3,
#     base_delay: float = 1.0,
# ) -> httpx.Response:
#     """Retry with exponential backoff and jitter."""
#     import random
#     for attempt in range(max_retries + 1):
#         try:
#             response = await client.get(url)
#             if response.status_code in (502, 503, 504):
#                 raise httpx.HTTPStatusError(
#                     "Server error", request=response.request, response=response
#                 )
#             response.raise_for_status()
#             return response
#         except (httpx.HTTPStatusError, httpx.ConnectTimeout) as e:
#             if attempt == max_retries:
#                 raise
#             delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
#             await asyncio.sleep(delay)`,
      exercise: `**Exercises:**

1. Build a \\\`GitHubClient\\\` class using \\\`requests.Session\\\` that wraps the GitHub API (\\\`https://api.github.com\\\`). Implement methods for \\\`get_user(username)\\\`, \\\`list_repos(username)\\\`, and \\\`get_repo_languages(owner, repo)\\\`. Handle rate limiting (403 with \\\`X-RateLimit-Remaining: 0\\\` header) by sleeping until the reset time.

2. Rewrite the \\\`GitHubClient\\\` using \\\`httpx.AsyncClient\\\`. Fetch 10 users' repositories concurrently using \\\`asyncio.gather()\\\` and compare the total time against sequential synchronous requests.

3. Implement a retry decorator: \\\`@retry(max_attempts=3, backoff_factor=2, retryable_exceptions=(ConnectionError, TimeoutError))\\\`. Apply it to an HTTP client method and write tests that mock network failures to verify the retry behavior.

4. Build a REST API testing suite: write a script that creates a resource (POST), reads it (GET), updates it (PUT and PATCH), and deletes it (DELETE). Verify correct status codes at each step (201, 200, 200, 204). Use \\\`httpx\\\` and run against a local FastAPI server.

5. Implement a simple HTTP caching layer: create a wrapper around \\\`httpx.AsyncClient\\\` that respects \\\`Cache-Control\\\` headers and stores responses in a dictionary with TTL-based expiration.`,
      commonMistakes: [
        "Not using a session or client instance for multiple requests. Creating a new `requests.get()` call each time opens a fresh TCP connection, skipping connection pooling and adding latency. Always use `requests.Session()` or `httpx.Client()` for repeated calls to the same host.",
        "Retrying POST requests on failure without understanding idempotency. POST is not idempotent \u2014 retrying may create duplicate resources. Only retry idempotent methods (GET, PUT, DELETE) automatically. For POST, use idempotency keys or check for existing resources first.",
        "Setting no timeout on HTTP requests. The default in `requests` is **no timeout** \u2014 a hanging server will block your process forever. Always set `timeout=(connect_timeout, read_timeout)`, e.g., `timeout=(5, 30)`.",
        "Calling `response.json()` without checking `response.status_code` first. A 500 error may return HTML, and `.json()` will raise a `JSONDecodeError`. Always check `response.raise_for_status()` or the status code before parsing the body.",
        "Using synchronous `requests` inside `async def` handlers in FastAPI or asyncio applications. This blocks the event loop. Use `httpx.AsyncClient` for async contexts or run the sync call in a thread pool with `asyncio.to_thread()`.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What does idempotency mean in REST APIs? Which HTTP methods are idempotent and why does it matter?",
          a: "An operation is **idempotent** if performing it multiple times produces the same result as performing it once. **GET, PUT, DELETE, HEAD, OPTIONS** are idempotent. **POST and PATCH** are generally not. **Why it matters:** Network failures happen. If a PUT request times out, the client can safely retry because sending the same PUT twice results in the same state. But retrying a POST may create duplicate records. This is why payment APIs use **idempotency keys** \u2014 the client sends a unique key with each POST, and the server deduplicates. In microservice architectures, idempotency is critical for eventual consistency: message queues may deliver the same message twice, so handlers must be idempotent.",
        },
        {
          type: "coding",
          q: "Write a Python function that fetches data from an API with exponential backoff retry logic.",
          a: `\\\`\\\`\\\`python
import httpx
import asyncio
import random

async def fetch_with_backoff(
    url: str,
    max_retries: int = 3,
    base_delay: float = 1.0,
) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        for attempt in range(max_retries + 1):
            try:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
            except (httpx.HTTPStatusError, httpx.ConnectError) as e:
                if attempt == max_retries:
                    raise
                delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
                await asyncio.sleep(delay)
\\\`\\\`\\\``,
        },
        {
          type: "scenario",
          q: "Your service calls three external APIs to assemble a response. One API is slow and unreliable. How do you handle this?",
          a: "1) **Call all three concurrently** with `asyncio.gather()` or `asyncio.wait()` instead of sequentially. 2) **Set aggressive timeouts** on the unreliable API (e.g., 5 seconds vs 30 for the others). 3) **Circuit breaker pattern**: after N consecutive failures, stop calling the unreliable API for a cooldown period and return a degraded response or cached data. 4) **Fallback/default values**: if the slow API fails, return the response with the available data and a flag indicating partial results. 5) **Retry with backoff** for transient failures but limit to 1-2 retries to avoid compounding latency. 6) **Cache responses** from the unreliable API with a reasonable TTL so you can serve stale data during outages. Libraries: `tenacity` for retries, `pybreaker` for circuit breakers.",
        },
      ],
    },
    {
      id: "py-databases",
      title: "Databases & SQLAlchemy",
      explanation: `**SQLAlchemy** is the most widely used database toolkit for Python. Version 2.0 introduced a modernized API with a cleaner, more Pythonic style that aligns with type hints and async patterns. Understanding SQLAlchemy is essential for any Python backend role.

**SQLAlchemy Architecture:**
- **Engine** \u2014 manages the connection pool and dialect (PostgreSQL, MySQL, SQLite). Created once per application.
- **Session** \u2014 a unit of work that tracks changes to objects and flushes them to the database in a transaction. Created per request.
- **Declarative Base** \u2014 base class for ORM models that maps Python classes to database tables.
- **Mapped Columns** \u2014 SQLAlchemy 2.0 uses \\\`Mapped[type]\\\` and \\\`mapped_column()\\\` for type-safe column definitions (replacing the old \\\`Column()\\\` style).

**Core ORM Concepts:**
- **Models** define your schema as Python classes. Each class maps to a table, each attribute to a column.
- **Relationships** link models together: \\\`relationship()\\\` defines the Python-side access pattern, \\\`ForeignKey\\\` defines the database constraint.
- **CRUD Operations** use the Session: \\\`session.add()\\\` for insert, query with \\\`select()\\\`, modify attributes directly, \\\`session.delete()\\\` for removal, and \\\`session.commit()\\\` to persist.

**Eager vs Lazy Loading:**
- **Lazy loading** (default) \u2014 related objects are loaded when you first access them. Causes the **N+1 query problem**: loading 100 users and accessing each user's posts triggers 101 queries.
- **Eager loading** \u2014 loads related objects in the initial query. Three strategies: \\\`joinedload()\\\` (JOIN), \\\`selectinload()\\\` (separate SELECT IN), \\\`subqueryload()\\\` (subquery).

**Alembic Migrations:**
Alembic is SQLAlchemy's migration tool (like Django's \\\`makemigrations\\\`/\\\`migrate\\\`). It generates migration scripts by comparing your models to the database state. Key commands: \\\`alembic init\\\` (setup), \\\`alembic revision --autogenerate -m "message"\\\` (create migration), \\\`alembic upgrade head\\\` (apply), \\\`alembic downgrade -1\\\` (rollback).

In interviews, focus on the **N+1 problem**, **transaction management**, and the difference between \\\`flush()\\\` (write to DB within transaction) and \\\`commit()\\\` (finalize transaction).`,
      codeExample: `# ============================================================
# SQLAlchemy 2.0 ORM \u2014 Production Patterns
# ============================================================
# from sqlalchemy import (
#     create_engine, ForeignKey, String, Text, DateTime, select, func
# )
# from sqlalchemy.orm import (
#     DeclarativeBase, Mapped, mapped_column, relationship,
#     Session, sessionmaker, joinedload, selectinload
# )
# from datetime import datetime, timezone
# from typing import Optional
#
#
# # ============================================================
# # Engine & Base Setup
# # ============================================================
# engine = create_engine(
#     "sqlite:///app.db",
#     echo=False,          # Set True for SQL logging during development
#     pool_size=5,         # Connection pool size (default 5)
#     max_overflow=10,     # Extra connections beyond pool_size
#     pool_recycle=3600,   # Recycle connections after 1 hour
# )
#
# SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
#
#
# class Base(DeclarativeBase):
#     """SQLAlchemy 2.0 declarative base."""
#     pass
#
#
# # ============================================================
# # Models \u2014 SQLAlchemy 2.0 Mapped style
# # ============================================================
# class User(Base):
#     __tablename__ = "users"
#
#     # Mapped[type] + mapped_column() = type-safe columns
#     id: Mapped[int] = mapped_column(primary_key=True)
#     username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
#     email: Mapped[str] = mapped_column(String(255), unique=True)
#     full_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True),
#         default=lambda: datetime.now(timezone.utc),
#     )
#
#     # Relationship: one-to-many (User -> Posts)
#     posts: Mapped[list["Post"]] = relationship(
#         back_populates="author",
#         cascade="all, delete-orphan",  # delete posts when user is deleted
#         lazy="selectin",               # default eager loading strategy
#     )
#
#     def __repr__(self) -> str:
#         return f"User(id={self.id}, username={self.username!r})"
#
#
# class Post(Base):
#     __tablename__ = "posts"
#
#     id: Mapped[int] = mapped_column(primary_key=True)
#     title: Mapped[str] = mapped_column(String(200))
#     body: Mapped[str] = mapped_column(Text)
#     published: Mapped[bool] = mapped_column(default=False)
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(timezone=True),
#         default=lambda: datetime.now(timezone.utc),
#     )
#
#     # Foreign key + relationship back-reference
#     author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
#     author: Mapped["User"] = relationship(back_populates="posts")
#
#     # Many-to-many through association table
#     tags: Mapped[list["Tag"]] = relationship(
#         secondary="post_tags", back_populates="posts"
#     )
#
#
# class Tag(Base):
#     __tablename__ = "tags"
#
#     id: Mapped[int] = mapped_column(primary_key=True)
#     name: Mapped[str] = mapped_column(String(50), unique=True)
#     posts: Mapped[list["Post"]] = relationship(
#         secondary="post_tags", back_populates="tags"
#     )
#
#
# # Association table for many-to-many
# from sqlalchemy import Table, Column, Integer
# post_tags = Table(
#     "post_tags",
#     Base.metadata,
#     Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
#     Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
# )
#
#
# # ============================================================
# # CRUD Operations
# # ============================================================
#
# # BAD: Not using a session context manager
# # session = SessionLocal()
# # session.add(user)
# # session.commit()  # If this fails, session is left in broken state
#
# # GOOD: Session as context manager with automatic rollback
# def create_user(username: str, email: str) -> User:
#     with SessionLocal() as session:
#         user = User(username=username, email=email)
#         session.add(user)
#         session.commit()
#         session.refresh(user)  # reload from DB to get generated ID
#         return user
#
#
# def get_user_by_id(user_id: int) -> Optional[User]:
#     with SessionLocal() as session:
#         stmt = select(User).where(User.id == user_id)
#         return session.execute(stmt).scalar_one_or_none()
#
#
# # BAD: N+1 query problem
# # def list_users_with_posts_bad():
# #     with SessionLocal() as session:
# #         users = session.execute(select(User)).scalars().all()
# #         for user in users:
# #             print(user.posts)  # Each access triggers a separate query!
#
# # GOOD: Eager loading to avoid N+1
# def list_users_with_posts() -> list[User]:
#     with SessionLocal() as session:
#         stmt = (
#             select(User)
#             .options(joinedload(User.posts))  # JOIN in single query
#             .order_by(User.created_at.desc())
#         )
#         return session.execute(stmt).unique().scalars().all()
#
#
# def update_user_email(user_id: int, new_email: str) -> Optional[User]:
#     with SessionLocal() as session:
#         user = session.get(User, user_id)
#         if user:
#             user.email = new_email  # SQLAlchemy tracks the change
#             session.commit()
#             session.refresh(user)
#         return user
#
#
# def delete_user(user_id: int) -> bool:
#     with SessionLocal() as session:
#         user = session.get(User, user_id)
#         if user:
#             session.delete(user)  # cascade deletes posts too
#             session.commit()
#             return True
#         return False
#
#
# # ============================================================
# # Advanced Queries
# # ============================================================
# def search_posts(keyword: str, limit: int = 20) -> list[Post]:
#     with SessionLocal() as session:
#         stmt = (
#             select(Post)
#             .options(joinedload(Post.author), selectinload(Post.tags))
#             .where(Post.title.ilike(f"%{keyword}%"))
#             .where(Post.published == True)
#             .order_by(Post.created_at.desc())
#             .limit(limit)
#         )
#         return session.execute(stmt).unique().scalars().all()
#
#
# def get_user_post_counts() -> list[tuple]:
#     """Aggregate query: count posts per user."""
#     with SessionLocal() as session:
#         stmt = (
#             select(User.username, func.count(Post.id).label("post_count"))
#             .join(Post, isouter=True)
#             .group_by(User.username)
#             .order_by(func.count(Post.id).desc())
#         )
#         return session.execute(stmt).all()
#
#
# # ============================================================
# # Alembic Migration Commands (run in terminal)
# # ============================================================
# # alembic init migrations              # initialize Alembic
# # alembic revision --autogenerate -m "create users and posts"
# # alembic upgrade head                 # apply all pending migrations
# # alembic downgrade -1                 # rollback last migration
# # alembic history                      # show migration history
# # alembic current                      # show current revision`,
      exercise: `**Exercises:**

1. Define SQLAlchemy 2.0 models for a blog system: \\\`User\\\`, \\\`Post\\\`, \\\`Comment\\\`, and \\\`Tag\\\` (many-to-many with Post). Use \\\`Mapped[]\\\` type annotations, \\\`mapped_column()\\\`, and proper relationships with cascade options. Create the tables with \\\`Base.metadata.create_all(engine)\\\`.

2. Write CRUD functions for the \\\`Post\\\` model: \\\`create_post()\\\`, \\\`get_post()\\\`, \\\`update_post()\\\`, \\\`delete_post()\\\`, and \\\`list_posts(page, per_page)\\\` with pagination. Use session context managers and handle the case where a post is not found.

3. Demonstrate the N+1 query problem: write a function that lists all users and their post titles using lazy loading. Enable SQL echo (\\\`echo=True\\\`) to see the query count. Then fix it using \\\`joinedload()\\\` and \\\`selectinload()\\\` and compare the query counts.

4. Set up Alembic for your project. Create an initial migration from your models, apply it, then add a \\\`bio\\\` column to the \\\`User\\\` model, generate a new migration, and apply it. Practice rolling back and re-applying migrations.

5. Write a function that performs a bulk insert of 10,000 records using \\\`session.add_all()\\\` and compare its performance to \\\`session.execute(insert(Model).values(records))\\\` using the core API. Time both approaches and explain the difference.

6. Implement a soft-delete pattern: add an \\\`is_deleted\\\` column and a \\\`deleted_at\\\` timestamp. Override the default query to exclude soft-deleted records using a custom \\\`Session\\\` class or event hooks.`,
      commonMistakes: [
        "Not closing or properly scoping database sessions. A session that is never closed leaks connections from the pool. Always use `with SessionLocal() as session:` or FastAPI's `Depends(get_db)` with yield to ensure cleanup.",
        "Ignoring the N+1 query problem. Loading 100 users and then accessing `user.posts` for each triggers 101 queries. Use `joinedload()` (single JOIN query) or `selectinload()` (two queries with IN clause) to eagerly load relationships.",
        "Confusing `session.flush()` with `session.commit()`. `flush()` sends SQL to the database but stays inside the current transaction \u2014 a subsequent rollback undoes it. `commit()` finalizes the transaction permanently. Use `flush()` when you need generated IDs before committing.",
        "Using the old SQLAlchemy 1.x `Column()` style instead of 2.0's `Mapped[]` + `mapped_column()`. The 2.0 style provides type safety, better IDE support, and aligns with Python's type hint ecosystem. Interviewers will notice if you use the legacy API.",
        "Hardcoding database URLs instead of reading from environment variables. Use `os.getenv('DATABASE_URL')` or a settings management library like `pydantic-settings`. This prevents credentials from leaking into version control and allows different configs per environment.",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Explain the N+1 query problem in ORMs. How do you detect and fix it in SQLAlchemy?",
          a: "The **N+1 problem** occurs when loading a collection of N parent objects and then accessing a lazy-loaded relationship on each, triggering N additional queries (1 for the parents + N for the children = N+1 total). **Detection:** Enable `echo=True` on the engine to log SQL, or use tools like `sqltap` or `sqlalchemy-utils` profiling. In SQLAlchemy, the default relationship loading is `lazy='select'` (lazy). **Fix options:** 1) `joinedload()` \u2014 uses a LEFT JOIN to fetch parents and children in one query. Best for one-to-one or one-to-few relationships. 2) `selectinload()` \u2014 executes a second query with `WHERE id IN (...)`. Best for one-to-many collections (avoids Cartesian product). 3) `subqueryload()` \u2014 uses a subquery. 4) Set `lazy='selectin'` on the relationship definition for a default eager strategy. The choice depends on the data shape: JOIN for small relations, SELECT IN for large collections.",
        },
        {
          type: "tricky",
          q: "What is the difference between `session.flush()` and `session.commit()`? When would you use `flush()` without `commit()`?",
          a: "`flush()` translates pending Python-side changes (adds, modifications, deletes) into SQL and sends them to the database, but **within the current transaction**. The changes are visible to subsequent queries in the same session but can be rolled back. `commit()` calls `flush()` internally and then **commits the transaction**, making changes permanent. **Use `flush()` without `commit()` when:** 1) You need a database-generated ID (auto-increment, sequence) before committing \u2014 e.g., creating a parent record and then a child record that references it in the same transaction. 2) You want to validate database constraints (unique, foreign key) before committing other work. 3) In test fixtures where you want to set up data that gets rolled back after the test via `session.rollback()`.",
        },
        {
          type: "coding",
          q: "Write a SQLAlchemy 2.0 model for an `Order` with `OrderItem` children, including a method to calculate the total price.",
          a: `\\\`\\\`\\\`python
from sqlalchemy import create_engine, ForeignKey, String, Numeric
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    relationship, Session
)
from decimal import Decimal

class Base(DeclarativeBase):
    pass

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(100))
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )

    @property
    def total(self) -> Decimal:
        return sum(item.subtotal for item in self.items)

class OrderItem(Base):
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    product_name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[int] = mapped_column(default=1)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    order: Mapped["Order"] = relationship(back_populates="items")

    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity
\\\`\\\`\\\``,
        },
        {
          type: "scenario",
          q: "You are migrating a Django project to FastAPI + SQLAlchemy. What are the key challenges and how would you approach the migration?",
          a: "**Key challenges:** 1) **ORM differences**: Django ORM uses `Model.objects.filter()` (manager pattern), SQLAlchemy uses `select(Model).where()` (explicit query construction). Every query must be rewritten. 2) **Migrations**: Django migrations are tightly coupled to the Django ORM. You need to set up Alembic and generate initial migrations from your SQLAlchemy models. Do NOT try to reuse Django migration history. 3) **Auth/Admin**: Django's built-in auth, sessions, and admin panel have no direct equivalent. Plan to implement JWT auth, build admin with a tool like SQLAdmin, or keep a minimal Django instance for admin. 4) **Approach**: Migrate incrementally \u2014 start with new endpoints in FastAPI while keeping Django running. Use the Strangler Fig pattern: route new traffic to FastAPI, gradually migrate old endpoints, share the same database. Define SQLAlchemy models that match the existing Django tables exactly. Write integration tests that verify both systems produce identical results.",
        },
      ],
    },
  ],
};

export default pyPhase10;
