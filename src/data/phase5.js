const phase5 = {
  id: "phase-5",
  title: "Phase 5: Projects & Real-World Application",
  emoji: "🟣",
  description: "Put everything together by building real-world projects that combine multiple concepts from previous phases.",
  topics: [
    {
      id: "project-quiz-app",
      title: "Project 1: Interactive Quiz App",
      explanation: `Build an interactive quiz application that tests JavaScript knowledge. This project practices **DOM manipulation**, **event handling**, **state management**, and **conditional logic**.

**Features:**
- Multiple-choice questions with dynamic rendering
- Score tracking and progress bar
- Timer for each question
- Results summary with correct/wrong breakdown
- Ability to restart

**Concepts practiced:** DOM manipulation, Event listeners, Template literals, Arrays, Objects, Conditionals, setTimeout, CSS transitions`,
      codeExample: `// Quiz App — Core Architecture

class QuizApp {
  constructor(questions, container) {
    this.questions = this.shuffle(questions);
    this.container = container;
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.timePerQuestion = 30; // seconds
    this.timer = null;
  }

  start() {
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length * 100);

    this.container.innerHTML = \`
      <div class="quiz-header">
        <div class="progress-bar">
          <div class="progress-fill" style="width: \${progress}%"></div>
        </div>
        <span class="question-count">
          Question \${this.currentIndex + 1} of \${this.questions.length}
        </span>
        <span class="timer" id="timer">\${this.timePerQuestion}s</span>
      </div>
      <div class="question">
        <h2>\${q.question}</h2>
        <div class="options">
          \${q.options.map((opt, i) => \`
            <button class="option-btn" data-index="\${i}">
              \${opt}
            </button>
          \`).join("")}
        </div>
      </div>
    \`;

    // Event delegation for options
    this.container.querySelector(".options")
      .addEventListener("click", (e) => {
        if (e.target.matches(".option-btn")) {
          this.handleAnswer(parseInt(e.target.dataset.index));
        }
      });

    this.startTimer();
  }

  handleAnswer(selectedIndex) {
    clearInterval(this.timer);
    const q = this.questions[this.currentIndex];
    const correct = selectedIndex === q.correctIndex;
    if (correct) this.score++;

    this.answers.push({
      question: q.question,
      selected: q.options[selectedIndex],
      correct: q.options[q.correctIndex],
      isCorrect: correct
    });

    // Visual feedback
    const buttons = this.container.querySelectorAll(".option-btn");
    buttons[q.correctIndex].classList.add("correct");
    if (!correct) buttons[selectedIndex].classList.add("wrong");
    buttons.forEach(btn => btn.disabled = true);

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex < this.questions.length) {
        this.renderQuestion();
      } else {
        this.showResults();
      }
    }, 1500);
  }

  startTimer() {
    let timeLeft = this.timePerQuestion;
    const timerEl = this.container.querySelector("#timer");
    this.timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = \`\${timeLeft}s\`;
      if (timeLeft <= 0) {
        clearInterval(this.timer);
        this.handleAnswer(-1); // Time's up
      }
    }, 1000);
  }

  showResults() {
    const percentage = Math.round((this.score / this.questions.length) * 100);
    this.container.innerHTML = \`
      <div class="results">
        <h2>Quiz Complete!</h2>
        <div class="score-circle">
          <span>\${percentage}%</span>
        </div>
        <p>\${this.score} / \${this.questions.length} correct</p>
        <button onclick="quiz.start()">Try Again</button>
      </div>
    \`;
  }

  shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }
}

// Sample questions
const questions = [
  {
    question: "What does typeof null return?",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctIndex: 2
  },
  {
    question: "Which is NOT a falsy value?",
    options: ['0', '""', '"false"', 'undefined'],
    correctIndex: 2
  }
];`,
      exercise: `**Build It Yourself:**
1. Create the HTML structure with a container div
2. Style with CSS (dark theme, animations for correct/wrong answers)
3. Add a question bank with at least 20 JavaScript questions
4. Implement the timer with visual countdown
5. Add local storage to save high scores
6. **Bonus:** Add difficulty levels and categories`,
      commonMistakes: [
        "Not clearing the timer when an answer is selected — causes unexpected behavior",
        "Modifying the original questions array (mutation) — always work with a copy",
        "Not removing old event listeners when re-rendering — causes duplicate handlers",
        "Hardcoding the correct answer index — makes it easy to cheat via DevTools",
        "Not handling the edge case when time runs out"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "How would you structure the state management for a quiz app?", a: "Keep state in a single object: `{ currentIndex, score, answers[], timeLeft, isActive }`. Update state through defined methods only. Re-render UI from state (state → UI pattern). Store results in localStorage. This mirrors how frameworks like React manage state." },
        { type: "coding", q: "Write a function to shuffle an array (Fisher-Yates algorithm).", a: "```js\nfunction shuffle(arr) {\n  const copy = [...arr];\n  for (let i = copy.length - 1; i > 0; i--) {\n    const j = Math.floor(Math.random() * (i + 1));\n    [copy[i], copy[j]] = [copy[j], copy[i]];\n  }\n  return copy;\n}\n```" },
        { type: "scenario", q: "How would you prevent cheating in a client-side quiz app?", a: "You can't fully prevent it client-side. Mitigations: 1) Shuffle options. 2) Don't include correct answers in HTML (fetch after selection). 3) Server-side validation. 4) Time limits. 5) Anti-devtools detection (not reliable). For serious quizzes, ALL validation must be server-side." },
        { type: "conceptual", q: "What DOM manipulation techniques are used in this project?", a: "1) `innerHTML` for templating (careful with user input). 2) `querySelector/All` for selection. 3) `classList.add` for visual feedback. 4) `addEventListener` with delegation for options. 5) `dataset` attributes for storing option indices. 6) Dynamic element creation." },
        { type: "coding", q: "Write a timer function that counts down and calls a callback at zero.", a: "```js\nfunction countdown(seconds, onTick, onComplete) {\n  let remaining = seconds;\n  const timer = setInterval(() => {\n    remaining--;\n    onTick(remaining);\n    if (remaining <= 0) {\n      clearInterval(timer);\n      onComplete();\n    }\n  }, 1000);\n  return () => clearInterval(timer);\n}\n```" }
      ]
    },
    {
      id: "project-weather-app",
      title: "Project 2: Weather App",
      explanation: `Build a weather application using the Fetch API and async/await. This project practices **API integration**, **async programming**, **error handling**, and **dynamic UI updates**.

**Features:**
- Search by city name or use geolocation
- Display current weather (temperature, humidity, wind, conditions)
- 5-day forecast
- Weather icons and background changes
- Recent searches history

**API:** OpenWeatherMap free tier (or similar)
**Concepts practiced:** fetch, async/await, try/catch, JSON parsing, Geolocation API, localStorage, template literals`,
      codeExample: `// Weather App — API Integration

class WeatherApp {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = "https://api.openweathermap.org/data/2.5";
    this.recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );
  }

  async getWeather(city) {
    try {
      const response = await fetch(
        \`\${this.baseURL}/weather?q=\${encodeURIComponent(city)}&appid=\${this.apiKey}&units=metric\`
      );
      if (!response.ok) {
        if (response.status === 404) throw new Error("City not found");
        throw new Error(\`HTTP \${response.status}\`);
      }
      const data = await response.json();
      this.saveSearch(city);
      return this.formatWeather(data);
    } catch (error) {
      console.error("Weather fetch failed:", error);
      throw error;
    }
  }

  async getForecast(city) {
    const response = await fetch(
      \`\${this.baseURL}/forecast?q=\${encodeURIComponent(city)}&appid=\${this.apiKey}&units=metric\`
    );
    if (!response.ok) throw new Error("Forecast unavailable");
    const data = await response.json();
    return this.formatForecast(data);
  }

  async getByLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          const response = await fetch(
            \`\${this.baseURL}/weather?lat=\${lat}&lon=\${lon}&appid=\${this.apiKey}&units=metric\`
          );
          resolve(this.formatWeather(await response.json()));
        },
        reject,
        { timeout: 10000 }
      );
    });
  }

  formatWeather(data) {
    return {
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      iconURL: \`https://openweathermap.org/img/wn/\${data.weather[0].icon}@2x.png\`
    };
  }

  formatForecast(data) {
    // Group by day, take noon readings
    const daily = data.list
      .filter(item => item.dt_txt.includes("12:00"))
      .slice(0, 5)
      .map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString("en", {
          weekday: "short"
        }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description
      }));
    return daily;
  }

  saveSearch(city) {
    this.recentSearches = [
      city,
      ...this.recentSearches.filter(c => c !== city)
    ].slice(0, 5);
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(this.recentSearches)
    );
  }
}

// Usage
const app = new WeatherApp("YOUR_API_KEY");

async function handleSearch(city) {
  const loadingEl = document.querySelector("#loading");
  const errorEl = document.querySelector("#error");
  const weatherEl = document.querySelector("#weather");

  loadingEl.style.display = "block";
  errorEl.style.display = "none";

  try {
    const [weather, forecast] = await Promise.all([
      app.getWeather(city),
      app.getForecast(city)
    ]);
    renderWeather(weather);
    renderForecast(forecast);
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = "block";
  } finally {
    loadingEl.style.display = "none";
  }
}`,
      exercise: `**Build It Yourself:**
1. Get a free API key from OpenWeatherMap
2. Build the search UI with autocomplete for city names
3. Display current weather with themed backgrounds/icons
4. Add 5-day forecast with horizontal scrollable cards
5. Implement geolocation-based weather detection
6. Save recent searches to localStorage
7. **Bonus:** Add unit toggle (Celsius/Fahrenheit)`,
      commonMistakes: [
        "Exposing API keys in client-side code — use environment variables or a proxy server",
        "Not handling the case when geolocation permission is denied",
        "Not URL-encoding the city name — spaces and special characters break the URL",
        "Forgetting to show loading state while fetching — app feels unresponsive",
        "Not debouncing search input — too many API calls on every keystroke"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "How would you handle API key security in a frontend app?", a: "Never expose API keys client-side. Options: 1) Create a backend proxy that holds the key. 2) Use serverless functions (Vercel/Netlify). 3) Restrict key by domain/IP in the API dashboard. 4) Use OAuth tokens instead of API keys. 5) Environment variables for build-time substitution." },
        { type: "coding", q: "Write a fetch wrapper with retry, timeout, and loading state.", a: "```js\nasync function fetchWithRetry(url, { retries = 3, timeout = 5000 } = {}) {\n  for (let i = 0; i <= retries; i++) {\n    const controller = new AbortController();\n    const timer = setTimeout(() => controller.abort(), timeout);\n    try {\n      const res = await fetch(url, { signal: controller.signal });\n      clearTimeout(timer);\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      return res.json();\n    } catch (err) {\n      clearTimeout(timer);\n      if (i === retries) throw err;\n      await new Promise(r => setTimeout(r, 1000 * 2 ** i));\n    }\n  }\n}\n```" },
        { type: "scenario", q: "The weather API has a rate limit of 60 calls/minute. How do you handle this?", a: "1) Cache responses in localStorage with TTL (e.g., 10 min). 2) Debounce search input (300ms). 3) Show cached data while re-fetching. 4) Queue requests and process at intervals. 5) Show a friendly message if rate limited (429 status)." },
        { type: "conceptual", q: "Why use `Promise.all` for fetching current weather and forecast?", a: "Both requests are independent — they don't depend on each other. `Promise.all` runs them in parallel, finishing in the time of the slowest request (~1x). Sequential await would take ~2x. If one fails and the other is optional, use `Promise.allSettled` instead." },
        { type: "coding", q: "Write a cache function for API responses with TTL.", a: "```js\nconst apiCache = new Map();\nasync function cachedFetch(url, ttl = 600000) {\n  const cached = apiCache.get(url);\n  if (cached && Date.now() - cached.time < ttl) return cached.data;\n  const data = await fetch(url).then(r => r.json());\n  apiCache.set(url, { data, time: Date.now() });\n  return data;\n}\n```" }
      ]
    },
    {
      id: "project-task-manager",
      title: "Project 3: Task Manager with LocalStorage",
      explanation: `Build a full CRUD (Create, Read, Update, Delete) task manager that persists data using localStorage. This project practices **state management**, **CRUD operations**, **localStorage**, **DOM manipulation**, and **event handling**.

**Features:**
- Add, edit, and delete tasks
- Mark tasks as complete/incomplete
- Filter by status (all, active, completed)
- Sort by date, priority, or name
- Drag and drop to reorder
- Data persistence with localStorage
- Categories/tags for organization

**Concepts practiced:** CRUD, localStorage, DOM events, Event delegation, Array methods, Destructuring, Template literals`,
      codeExample: `// Task Manager — CRUD with localStorage

class TaskManager {
  constructor(storageKey = "tasks") {
    this.storageKey = storageKey;
    this.tasks = this.load();
    this.filter = "all"; // all, active, completed
    this.sortBy = "date"; // date, priority, name
  }

  // CREATE
  addTask(title, { priority = "medium", category = "general" } = {}) {
    const task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.unshift(task);
    this.save();
    return task;
  }

  // READ
  getTasks() {
    let filtered = this.tasks;
    if (this.filter === "active")
      filtered = filtered.filter(t => !t.completed);
    if (this.filter === "completed")
      filtered = filtered.filter(t => t.completed);

    return this.sortTasks(filtered);
  }

  getStats() {
    return {
      total: this.tasks.length,
      active: this.tasks.filter(t => !t.completed).length,
      completed: this.tasks.filter(t => t.completed).length
    };
  }

  // UPDATE
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  editTask(id, updates) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates, {
        updatedAt: new Date().toISOString()
      });
      this.save();
    }
  }

  // DELETE
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }

  clearCompleted() {
    this.tasks = this.tasks.filter(t => !t.completed);
    this.save();
  }

  // Sorting
  sortTasks(tasks) {
    const sorters = {
      date: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      priority: (a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      },
      name: (a, b) => a.title.localeCompare(b.title)
    };
    return [...tasks].sort(sorters[this.sortBy] || sorters.date);
  }

  // Persistence
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch {
      return [];
    }
  }
}

// Rendering
function renderTasks(manager, container) {
  const tasks = manager.getTasks();
  const stats = manager.getStats();

  container.innerHTML = \`
    <div class="stats">
      <span>\${stats.total} total</span>
      <span>\${stats.active} active</span>
      <span>\${stats.completed} done</span>
    </div>
    <ul class="task-list">
      \${tasks.map(task => \`
        <li class="task \${task.completed ? 'completed' : ''}"
            data-id="\${task.id}" draggable="true">
          <input type="checkbox" \${task.completed ? 'checked' : ''}>
          <span class="title">\${task.title}</span>
          <span class="priority priority-\${task.priority}">
            \${task.priority}
          </span>
          <button class="delete-btn">×</button>
        </li>
      \`).join("")}
    </ul>
  \`;
}`,
      exercise: `**Build It Yourself:**
1. Create the HTML with form for adding tasks, filters, and task list
2. Style with CSS (animations for add/delete, strikethrough for complete)
3. Implement all CRUD operations with localStorage
4. Add filter buttons (All, Active, Completed)
5. Add sort options (Date, Priority, Name)
6. Implement drag-and-drop reordering
7. **Bonus:** Add categories, due dates, and search functionality`,
      commonMistakes: [
        "Not validating input — empty titles, missing fields",
        "Mutating the task array directly instead of using methods — breaks reactivity",
        "Not debouncing localStorage writes — saving on every keystroke is expensive",
        "Forgetting to re-render after state changes",
        "Not handling the case when localStorage is full (5MB limit)"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is the CRUD pattern and how does it map to HTTP methods?", a: "**C**reate = POST, **R**ead = GET, **U**pdate = PUT/PATCH, **D**elete = DELETE. In the task manager: addTask (Create), getTasks (Read), editTask/toggleTask (Update), deleteTask (Delete). CRUD is the foundation of most data-driven applications." },
        { type: "coding", q: "Implement a simple state management system with subscribers.", a: "```js\nfunction createStore(initial) {\n  let state = initial;\n  const listeners = new Set();\n  return {\n    getState: () => state,\n    setState: (update) => {\n      state = typeof update === 'function'\n        ? update(state) : { ...state, ...update };\n      listeners.forEach(fn => fn(state));\n    },\n    subscribe: (fn) => {\n      listeners.add(fn);\n      return () => listeners.delete(fn);\n    }\n  };\n}\n```" },
        { type: "scenario", q: "How would you handle data migration if you change the task schema?", a: "1) Add version to stored data: `{ version: 1, tasks: [...] }`. 2) On load, check version. 3) If outdated, run migration function that transforms old format to new. 4) Write migration for each version bump. 5) Save updated data with new version. This is similar to database migrations." },
        { type: "conceptual", q: "Why use `crypto.randomUUID()` instead of array indices as IDs?", a: "Array indices change when items are deleted or reordered. UUIDs are globally unique and stable — they never change regardless of array position. This prevents bugs with: stale references, event delegation, and reconciliation (similar to React's `key` prop)." },
        { type: "coding", q: "Write a function to export tasks as JSON and import from JSON.", a: "```js\nfunction exportTasks() {\n  const data = localStorage.getItem('tasks');\n  const blob = new Blob([data], { type: 'application/json' });\n  const url = URL.createObjectURL(blob);\n  const a = document.createElement('a');\n  a.href = url;\n  a.download = 'tasks.json';\n  a.click();\n  URL.revokeObjectURL(url);\n}\nfunction importTasks(file) {\n  const reader = new FileReader();\n  reader.onload = (e) => {\n    const tasks = JSON.parse(e.target.result);\n    localStorage.setItem('tasks', JSON.stringify(tasks));\n  };\n  reader.readAsText(file);\n}\n```" }
      ]
    },
    {
      id: "project-chat-app",
      title: "Project 4: Real-Time Chat App",
      explanation: `Build a real-time chat application using WebSockets. This project practices **WebSocket communication**, **real-time data handling**, **event-driven architecture**, and **state synchronization**.

**Features:**
- Real-time messaging between users
- Typing indicators
- Online/offline status
- Message timestamps
- Chat rooms/channels
- Message history

**Tech:** Browser's WebSocket API + Node.js ws library (or Socket.io)
**Concepts practiced:** WebSockets, Events, JSON, DOM, async patterns, State management`,
      codeExample: `// Chat Client — WebSocket Integration

class ChatClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;
  }

  connect(username) {
    this.username = username;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("Connected!");
      this.reconnectAttempts = 0;
      this.send("join", { username });
      this.emit("connected");
    };

    this.ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      this.emit(type, payload);
    };

    this.ws.onclose = () => {
      this.emit("disconnected");
      this.tryReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  send(type, payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  sendMessage(text, room = "general") {
    this.send("message", {
      text,
      room,
      sender: this.username,
      timestamp: new Date().toISOString()
    });
  }

  sendTyping(room) {
    this.send("typing", { user: this.username, room });
  }

  // Event system
  on(event, callback) {
    (this.listeners[event] ||= []).push(callback);
  }

  emit(event, data) {
    this.listeners[event]?.forEach(cb => cb(data));
  }

  tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnects) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    setTimeout(() => this.connect(this.username), delay);
  }

  disconnect() {
    this.ws?.close();
  }
}

// Usage
const chat = new ChatClient("wss://chat.example.com");

// Listen for events
chat.on("message", ({ sender, text, timestamp }) => {
  appendMessage(sender, text, timestamp);
});

chat.on("typing", ({ user }) => {
  showTypingIndicator(user);
});

chat.on("userList", ({ users }) => {
  updateOnlineUsers(users);
});

// Connect and send
chat.connect("Alice");

// Send message on form submit
document.querySelector("#chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.querySelector("#messageInput");
  if (input.value.trim()) {
    chat.sendMessage(input.value.trim());
    input.value = "";
  }
});

// Typing indicator (debounced)
const debouncedTyping = debounce(() => chat.sendTyping("general"), 500);
document.querySelector("#messageInput").addEventListener("input", debouncedTyping);`,
      exercise: `**Build It Yourself:**
1. Set up a Node.js WebSocket server with the \`ws\` library
2. Create the chat UI with message list, input, and online users
3. Implement real-time message sending/receiving
4. Add typing indicators (debounced)
5. Implement chat rooms/channels
6. Add reconnection logic with exponential backoff
7. **Bonus:** Add emoji support, file sharing, and message reactions`,
      commonMistakes: [
        "Not handling WebSocket disconnections — always implement reconnection logic",
        "Sending messages without checking `readyState` — causes errors if connection is closed",
        "Not debouncing typing indicators — floods the server with typing events",
        "Not sanitizing messages before rendering — XSS vulnerability through chat messages",
        "Storing all chat history in memory — paginate and load history from server"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "How do WebSockets differ from HTTP requests?", a: "HTTP is request/response — client initiates, server responds, connection closes. WebSockets are full-duplex — both client and server can send messages anytime over a persistent connection. WebSockets have lower latency (no request overhead) and are ideal for real-time features." },
        { type: "coding", q: "Write a WebSocket reconnection handler with exponential backoff.", a: "```js\nfunction createReconnector(url, maxRetries = 5) {\n  let attempts = 0;\n  function connect() {\n    const ws = new WebSocket(url);\n    ws.onopen = () => { attempts = 0; };\n    ws.onclose = () => {\n      if (attempts < maxRetries) {\n        const delay = Math.min(1000 * 2 ** attempts++, 30000);\n        setTimeout(connect, delay);\n      }\n    };\n    return ws;\n  }\n  return connect();\n}\n```" },
        { type: "scenario", q: "How would you scale a WebSocket-based chat app to millions of users?", a: "1) Horizontal scaling with sticky sessions or a pub/sub broker (Redis). 2) Message queues for delivery guarantees. 3) Room-based partitioning. 4) Connection pools per server. 5) Rate limiting per user. 6) Message compression. 7) Lazy-load chat history from database." },
        { type: "conceptual", q: "What is the WebSocket handshake process?", a: "1) Client sends an HTTP GET request with `Upgrade: websocket` and `Connection: Upgrade` headers. 2) Server responds with 101 Switching Protocols. 3) Connection upgrades from HTTP to WebSocket. 4) Both sides can now send messages freely. The handshake uses HTTP, then 'upgrades' the protocol." },
        { type: "coding", q: "Implement a simple message queue for offline messages.", a: "```js\nclass MessageQueue {\n  #queue = [];\n  enqueue(msg) { this.#queue.push(msg); }\n  flush(sendFn) {\n    while (this.#queue.length > 0) {\n      sendFn(this.#queue.shift());\n    }\n  }\n  get size() { return this.#queue.length; }\n}\n// Usage: queue messages when offline, flush on reconnect\n```" }
      ]
    },
    {
      id: "project-fullstack",
      title: "Project 5: Full-Stack App with Node.js & Express",
      explanation: `Build a complete full-stack application with a Node.js/Express backend and a JavaScript frontend. This capstone project combines everything you've learned.

**Architecture:**
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB/PostgreSQL (or JSON file for simplicity)
- **Frontend:** Vanilla JavaScript SPA
- **Auth:** JWT-based authentication

**Features:**
- User registration and login (JWT auth)
- CRUD operations for a resource (posts, products, etc.)
- Input validation and error handling
- Pagination, search, and filtering
- File upload capability

**Concepts practiced:** Node.js, Express, REST API design, JWT, middleware, fetch, async/await, MVC pattern, error handling, security`,
      codeExample: `// ===== Express Backend =====

// server.js
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

// In-memory store (use a database in production)
let users = [];
let posts = [];
const JWT_SECRET = "your-secret-key";

// Auth middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Auth routes
app.post("/api/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "Email already exists" });
  }
  const user = { id: Date.now().toString(), email, name };
  users.push({ ...user, password }); // Hash in production!
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ user, token });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const { password: _, ...safeUser } = user;
  const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "7d" });
  res.json({ user: safeUser, token });
});

// CRUD routes (protected)
app.get("/api/posts", authenticate, (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  let filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  res.json({ posts: paginated, total, page: +page, totalPages: Math.ceil(total / limit) });
});

app.post("/api/posts", authenticate, (req, res) => {
  const post = {
    id: Date.now().toString(),
    ...req.body,
    author: req.user.id,
    createdAt: new Date().toISOString()
  };
  posts.unshift(post);
  res.status(201).json(post);
});

app.put("/api/posts/:id", authenticate, (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Not found" });
  if (posts[index].author !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  posts[index] = { ...posts[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(posts[index]);
});

app.delete("/api/posts/:id", authenticate, (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  res.status(204).end();
});

app.listen(3000, () => console.log("Server running on port 3000"));

// ===== Frontend API Client =====
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("token");
  }

  async request(endpoint, options = {}) {
    const res = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: \`Bearer \${this.token}\` }),
        ...options.headers
      }
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || \`HTTP \${res.status}\`);
    }
    return res.status === 204 ? null : res.json();
  }

  // Auth
  async login(email, password) {
    const { user, token } = await this.request("/api/login", {
      method: "POST", body: JSON.stringify({ email, password })
    });
    this.token = token;
    localStorage.setItem("token", token);
    return user;
  }

  // CRUD
  getPosts(params) { return this.request(\`/api/posts?\${new URLSearchParams(params)}\`); }
  createPost(data) { return this.request("/api/posts", { method: "POST", body: JSON.stringify(data) }); }
  updatePost(id, data) { return this.request(\`/api/posts/\${id}\`, { method: "PUT", body: JSON.stringify(data) }); }
  deletePost(id) { return this.request(\`/api/posts/\${id}\`, { method: "DELETE" }); }
}`,
      exercise: `**Build It Yourself:**
1. Set up Express server with the routes above
2. Add password hashing with bcrypt
3. Create a frontend SPA with login, registration, and CRUD UI
4. Implement pagination and search on the frontend
5. Add form validation on both client and server
6. Implement proper error handling and toast notifications
7. **Bonus:** Add file uploads, comments, and user profiles`,
      commonMistakes: [
        "Storing passwords in plain text — always use bcrypt or argon2",
        "Not validating input on the server — client-side validation can be bypassed",
        "Storing JWT in localStorage (XSS risk) — use HttpOnly cookies for production",
        "Not handling token expiration — redirect to login when 401 is received",
        "CORS issues — configure CORS middleware properly for your frontend origin"
      ],
      interviewQuestions: [
        { type: "conceptual", q: "What is REST and what are its principles?", a: "REST (Representational State Transfer) principles: 1) Client-server separation. 2) Stateless — each request contains all info needed. 3) Uniform interface (consistent URL patterns). 4) Resource-based (nouns, not verbs): `/users/123` not `/getUser?id=123`. 5) HTTP methods map to actions (GET, POST, PUT, DELETE). 6) Cacheable responses." },
        { type: "coding", q: "Write Express middleware for request logging and error handling.", a: "```js\n// Logger\napp.use((req, res, next) => {\n  console.log(`${req.method} ${req.url}`);\n  next();\n});\n// Error handler (must have 4 params)\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(err.statusCode || 500).json({\n    error: err.message || 'Internal Server Error'\n  });\n});\n```" },
        { type: "conceptual", q: "How does JWT authentication work?", a: "1) User sends credentials. 2) Server verifies, creates a JWT (header.payload.signature). 3) Client stores JWT and sends it in `Authorization: Bearer <token>` header. 4) Server verifies signature on each request. JWTs are stateless — the server doesn't store sessions. Tradeoff: can't easily revoke individual tokens." },
        { type: "scenario", q: "How would you structure a full-stack project for scalability?", a: "1) Separate API and frontend codebases. 2) MVC/Service pattern for backend. 3) Environment-based config. 4) Database migrations. 5) API versioning (`/api/v1/`). 6) Rate limiting and caching. 7) Dockerize for consistent environments. 8) CI/CD pipeline. 9) Monitoring and logging." },
        { type: "coding", q: "Write a middleware that validates request body against a schema.", a: "```js\nfunction validate(schema) {\n  return (req, res, next) => {\n    const errors = [];\n    for (const [key, rules] of Object.entries(schema)) {\n      const value = req.body[key];\n      if (rules.required && !value)\n        errors.push(`${key} is required`);\n      if (rules.type && typeof value !== rules.type)\n        errors.push(`${key} must be ${rules.type}`);\n      if (rules.minLength && value?.length < rules.minLength)\n        errors.push(`${key} must be at least ${rules.minLength} chars`);\n    }\n    if (errors.length) return res.status(400).json({ errors });\n    next();\n  };\n}\n// Usage: app.post('/api/posts', validate({ title: { required: true, type: 'string' } }), handler);\n```" }
      ]
    }
  ]
};

export default phase5;
