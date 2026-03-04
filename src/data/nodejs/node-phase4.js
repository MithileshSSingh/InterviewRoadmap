const nodePhase4 = {
  id: "phase-4",
  title: "Phase 4: File System & Streams",
  emoji: "📁",
  description:
    "Master the fs module for file operations, path manipulation, and Node.js Streams for efficient data processing with minimal memory usage.",
  topics: [
    {
      id: "fs-module",
      title: "File System Operations (fs Module)",
      explanation: `The **\`fs\` module** is Node.js's interface to the operating system's file system. It provides methods to read, write, delete, rename, and watch files and directories.

**Three API styles:**
| Style | Example | Use Case |
|-------|---------|----------|
| **Callback** | \`fs.readFile(path, cb)\` | Legacy code, event-driven patterns |
| **Promise** | \`fs.promises.readFile(path)\` | Modern async/await code ✅ |
| **Synchronous** | \`fs.readFileSync(path)\` | Scripts, startup config (blocks event loop!) |

**Common operations:**

| Operation | Method |
|-----------|--------|
| Read file | \`readFile\` / \`readFileSync\` |
| Write file | \`writeFile\` (overwrites) / \`appendFile\` (appends) |
| Delete file | \`unlink\` |
| Rename/move | \`rename\` |
| Check existence | \`access\` / \`stat\` |
| Create directory | \`mkdir\` (with \`{ recursive: true }\`) |
| Delete directory | \`rm\` (with \`{ recursive: true, force: true }\`) |
| List directory | \`readdir\` |
| Watch changes | \`watch\` / \`watchFile\` |
| Copy file | \`copyFile\` |

**File descriptors and flags:**
| Flag | Meaning |
|------|---------|
| \`'r'\` | Read (error if file doesn't exist) |
| \`'w'\` | Write (creates/truncates file) |
| \`'a'\` | Append (creates file if needed) |
| \`'wx'\` | Write exclusive (error if file exists) |
| \`'r+'\` | Read and write |

**The \`path\` module — always use it:**
Never concatenate paths with string operations. Use \`path.join()\` and \`path.resolve()\` for cross-platform compatibility (Windows uses \`\\\\\`, Unix uses \`/\`).

🏠 **Real-world analogy:** The \`fs\` module is like a **filing cabinet**. You can read documents (readFile), add new ones (writeFile), throw some away (unlink), reorganize folders (rename), and even set a notification when someone changes a file (watch).`,
      codeExample: `// File System Operations — Comprehensive Guide

const fs = require("fs");
const fsp = require("fs").promises; // Promise-based API
const path = require("path");

// 1. Reading files
async function readFileExamples() {
  // Promise-based (recommended)
  const content = await fsp.readFile("data.txt", "utf-8");
  console.log("Content:", content);

  // Read as Buffer (binary files)
  const buffer = await fsp.readFile("image.png");
  console.log("File size:", buffer.length, "bytes");

  // Read JSON file
  const jsonStr = await fsp.readFile("config.json", "utf-8");
  const config = JSON.parse(jsonStr);

  // Synchronous (only for startup/scripts)
  const syncContent = fs.readFileSync("data.txt", "utf-8");
}

// 2. Writing files
async function writeFileExamples() {
  // Write (creates or overwrites)
  await fsp.writeFile("output.txt", "Hello, World!\\n", "utf-8");

  // Write JSON
  const data = { name: "Alice", age: 30 };
  await fsp.writeFile("data.json", JSON.stringify(data, null, 2));

  // Append to file
  await fsp.appendFile("logs.txt", \`[\${new Date().toISOString()}] Event occurred\\n\`);

  // Write with exclusive flag (error if exists)
  try {
    await fsp.writeFile("unique.txt", "data", { flag: "wx" });
  } catch (err) {
    if (err.code === "EEXIST") console.log("File already exists");
  }
}

// 3. Directory operations
async function directoryExamples() {
  // Create directory (recursive = create parent dirs too)
  await fsp.mkdir("output/reports/2024", { recursive: true });

  // List directory contents
  const files = await fsp.readdir("src");
  console.log("Files:", files);

  // List with file type info
  const entries = await fsp.readdir("src", { withFileTypes: true });
  entries.forEach((entry) => {
    console.log(\`\${entry.isDirectory() ? "📁" : "📄"} \${entry.name}\`);
  });

  // Remove directory (recursive)
  await fsp.rm("temp", { recursive: true, force: true });
}

// 4. File metadata
async function statExamples() {
  const stats = await fsp.stat("data.txt");
  console.log("Is file:", stats.isFile());
  console.log("Is directory:", stats.isDirectory());
  console.log("Size:", stats.size, "bytes");
  console.log("Created:", stats.birthtime);
  console.log("Modified:", stats.mtime);
  console.log("Permissions:", stats.mode.toString(8));
}

// 5. Path module — cross-platform path handling
function pathExamples() {
  // ✅ GOOD: Use path.join for cross-platform paths
  const filePath = path.join(__dirname, "data", "users.json");
  // Linux: /app/data/users.json
  // Windows: C:\\app\\data\\users.json

  // path.resolve — Always returns absolute path
  const absolute = path.resolve("data", "users.json");
  console.log("Absolute:", absolute);

  // Parse a path into components
  const parsed = path.parse("/home/user/docs/report.pdf");
  console.log(parsed);
  // { root: '/', dir: '/home/user/docs', base: 'report.pdf',
  //   ext: '.pdf', name: 'report' }

  console.log("Extension:", path.extname("app.test.js"));  // .js
  console.log("Basename:", path.basename("/foo/bar.txt"));  // bar.txt
  console.log("Directory:", path.dirname("/foo/bar.txt"));  // /foo
  console.log("Relative:", path.relative("/a/b", "/a/c")); // ../c
}

// 6. Safe file existence check
async function fileExists(filePath) {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// 7. Recursive directory walker
async function walkDir(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// Usage
// const allFiles = await walkDir("./src");
// console.log("All files:", allFiles);

// 8. File watching
function watchExample() {
  const watcher = fs.watch("./src", { recursive: true }, (eventType, filename) => {
    console.log(\`[\${eventType}] \${filename}\`);
  });

  // Clean up on exit
  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });
}

// 9. Temp files and atomic writes
async function atomicWrite(filePath, data) {
  const tempPath = \`\${filePath}.\${process.pid}.tmp\`;
  try {
    await fsp.writeFile(tempPath, data);
    await fsp.rename(tempPath, filePath); // Atomic on same filesystem
  } catch (err) {
    // Clean up temp file on failure
    await fsp.unlink(tempPath).catch(() => {});
    throw err;
  }
}

pathExamples();`,
      exercise: `**Exercises:**
1. Write a script that reads a JSON file, modifies a field, and writes it back atomically
2. Build a recursive directory listing tool that displays a tree structure with sizes
3. Create a log rotator: when \`app.log\` exceeds 10MB, rename it to \`app.log.1\` and start a new one
4. Implement a file copy function that works for both text and binary files
5. Build a file watcher that debounces changes and logs which files were modified
6. Write a \`find\` command clone that searches for files matching a glob pattern recursively`,
      commonMistakes: [
        "Using `fs.existsSync()` before reading — it's a TOCTOU race condition; instead, try the operation and handle ENOENT in the catch block",
        "Concatenating paths with `+` or template literals — `__dirname + '/data'` breaks on Windows; use `path.join(__dirname, 'data')` instead",
        "Using synchronous fs methods in a server — `readFileSync` blocks the event loop and freezes ALL concurrent connections",
        "Not handling EACCES (permission denied) and ENOENT (not found) errors separately — different errors need different responses",
        "Forgetting `{ recursive: true }` in `mkdir` — without it, creating nested directories fails if parents don't exist",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are the three API styles in the Node.js `fs` module and when should you use each?",
          a: "**Callback API** (`fs.readFile(path, cb)`) — The original API; used in legacy code and when you need maximum performance. **Promise API** (`fs.promises.readFile(path)`) — Modern, recommended API; works with async/await for clean, readable code. **Synchronous API** (`fs.readFileSync(path)`) — Blocks the event loop; use ONLY for startup scripts, CLI tools, or configuration loading. Never use sync APIs in a server handling concurrent requests.",
        },
        {
          type: "tricky",
          q: "Why is `fs.existsSync()` considered an anti-pattern before file operations?",
          a: "It creates a **TOCTOU (Time of Check to Time of Use)** race condition. Between checking existence and performing the operation, another process could create/delete the file. **Correct approach:** attempt the operation directly and handle specific error codes: `try { await fs.readFile(path) } catch(e) { if (e.code === 'ENOENT') /* file not found */ }`. This is both safer and more performant (one syscall instead of two).",
        },
      ],
    },
    {
      id: "streams-fundamentals",
      title: "Streams — Fundamentals",
      explanation: `**Streams** are one of Node.js's most powerful features — they allow you to process data **piece by piece** without loading the entire thing into memory. This is critical for large files, network data, and real-time processing.

**Why streams matter:**
Without streams, reading a 2GB file requires 2GB of RAM. With streams, you process it in ~64KB chunks, using almost no memory.

**Four types of streams:**
| Type | Description | Examples |
|------|-------------|---------|
| **Readable** | Source of data | \`fs.createReadStream\`, \`http.IncomingMessage\`, \`process.stdin\` |
| **Writable** | Destination for data | \`fs.createWriteStream\`, \`http.ServerResponse\`, \`process.stdout\` |
| **Duplex** | Both readable and writable | \`net.Socket\`, \`crypto.Cipher\` |
| **Transform** | Modify data as it passes through | \`zlib.createGzip\`, \`crypto.createHash\` |

**Readable stream events:**
| Event | Description |
|-------|-------------|
| \`data\` | A chunk of data is available |
| \`end\` | No more data to read |
| \`error\` | An error occurred |
| \`close\` | Stream and resources released |

**Writable stream events:**
| Event | Description |
|-------|-------------|
| \`drain\` | Buffer is empty, safe to write more |
| \`finish\` | All data has been flushed |
| \`error\` | An error occurred |
| \`close\` | Stream and resources released |

**Backpressure:**
When a writable stream can't keep up with the readable stream, data accumulates in an internal buffer. The \`pipe()\` method handles backpressure automatically — it pauses the readable when the writable is full and resumes when it drains.

🏠 **Real-world analogy:** Streams are like a **water pipeline**. Water (data) flows from the source (readable) through pipes (transform) to the destination (writable). You don't need a swimming pool (memory) to move water from one place to another.`,
      codeExample: `// Node.js Streams — Fundamentals

const fs = require("fs");
const path = require("path");
const { Transform, pipeline } = require("stream");
const { promisify } = require("util");
const zlib = require("zlib");

const pipelineAsync = promisify(pipeline);

// 1. Reading a large file with streams (memory efficient)
function readLargeFile(filePath) {
  const stream = fs.createReadStream(filePath, {
    encoding: "utf-8",
    highWaterMark: 64 * 1024, // 64KB chunks (default)
  });

  let lineCount = 0;
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\\n");
    buffer = lines.pop(); // Keep incomplete last line
    lineCount += lines.length;
  });

  stream.on("end", () => {
    if (buffer) lineCount++; // Count last line
    console.log(\`Total lines: \${lineCount}\`);
  });

  stream.on("error", (err) => {
    console.error("Stream error:", err.message);
  });
}

// 2. Writing with streams
function writeDataStream(filePath, data) {
  const stream = fs.createWriteStream(filePath);

  for (let i = 0; i < data.length; i++) {
    const canContinue = stream.write(JSON.stringify(data[i]) + "\\n");

    if (!canContinue) {
      // Buffer is full — wait for drain
      // In practice, use pipeline() to handle this automatically
      console.log("Backpressure detected at item", i);
    }
  }

  stream.end(); // Signal that writing is complete
  stream.on("finish", () => console.log("Write complete"));
}

// 3. pipe() — Connect readable → writable
function copyFile(src, dest) {
  const readStream = fs.createReadStream(src);
  const writeStream = fs.createWriteStream(dest);

  readStream.pipe(writeStream);

  writeStream.on("finish", () => console.log("Copy complete"));
  readStream.on("error", (err) => console.error("Read error:", err));
  writeStream.on("error", (err) => console.error("Write error:", err));
}

// 4. pipeline() — Better pipe with error handling (recommended)
async function compressFile(inputPath, outputPath) {
  try {
    await pipelineAsync(
      fs.createReadStream(inputPath),
      zlib.createGzip(),
      fs.createWriteStream(outputPath)
    );
    console.log("Compression complete");
  } catch (err) {
    console.error("Pipeline failed:", err.message);
  }
}

// 5. Custom Transform stream — CSV to JSON
class CSVToJSON extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.headers = null;
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split("\\n");
    this.buffer = lines.pop(); // Keep incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;
      const values = line.split(",").map((v) => v.trim());

      if (!this.headers) {
        this.headers = values;
        continue;
      }

      const obj = {};
      this.headers.forEach((header, i) => {
        obj[header] = values[i] || "";
      });
      this.push(JSON.stringify(obj) + "\\n");
    }
    callback();
  }

  _flush(callback) {
    // Process any remaining data
    if (this.buffer.trim() && this.headers) {
      const values = this.buffer.split(",").map((v) => v.trim());
      const obj = {};
      this.headers.forEach((header, i) => {
        obj[header] = values[i] || "";
      });
      this.push(JSON.stringify(obj) + "\\n");
    }
    callback();
  }
}

// Usage: Convert CSV file to JSON
async function convertCSVtoJSON(csvPath, jsonPath) {
  await pipelineAsync(
    fs.createReadStream(csvPath),
    new CSVToJSON(),
    fs.createWriteStream(jsonPath)
  );
  console.log("CSV → JSON conversion complete");
}

// 6. Stream-based file copy with progress
function copyWithProgress(src, dest) {
  return new Promise((resolve, reject) => {
    const stat = fs.statSync(src);
    let copied = 0;

    const readStream = fs.createReadStream(src);
    const writeStream = fs.createWriteStream(dest);

    readStream.on("data", (chunk) => {
      copied += chunk.length;
      const percent = ((copied / stat.size) * 100).toFixed(1);
      process.stdout.write(\`\\rCopying: \${percent}%\`);
    });

    readStream.pipe(writeStream);
    writeStream.on("finish", () => {
      console.log("\\nCopy complete!");
      resolve();
    });
    readStream.on("error", reject);
    writeStream.on("error", reject);
  });
}

// 7. Memory comparison: Buffer vs Stream
async function memoryComparison() {
  // ❌ Buffer approach — loads entire file into memory
  // const data = await fs.promises.readFile("huge-file.csv", "utf-8");
  // const lines = data.split("\\n"); // DOUBLE memory (original + split array)

  // ✅ Stream approach — processes line by line
  // const stream = fs.createReadStream("huge-file.csv", "utf-8");
  // Uses ~64KB regardless of file size
}`,
      exercise: `**Exercises:**
1. Create a stream-based file copy function with progress reporting (percentage complete)
2. Build a Transform stream that converts uppercase text to titled case
3. Use \`pipeline()\` to read a file, compress it with gzip, and write the compressed output
4. Create a line-counting stream that counts lines without loading the entire file into memory
5. Implement a CSV parser as a Transform stream that emits parsed row objects
6. Build a stream that filters JSON lines — only passing through objects matching a condition`,
      commonMistakes: [
        "Using `fs.readFile()` for large files — this loads the entire file into memory; use `createReadStream()` instead for files over ~50MB",
        "Ignoring backpressure — writing to a stream faster than it can drain causes memory bloat; use `pipeline()` or check `.write()` return value",
        "Using `pipe()` without error handling — errors in piped streams are not forwarded; use `pipeline()` which handles errors and cleanup automatically",
        "Forgetting to call `stream.end()` on writable streams — without `.end()`, the `'finish'` event never fires and resources aren't released",
        "Not handling the 'error' event on streams — unhandled stream errors crash the process; always listen for errors on every stream",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What are Node.js Streams and why are they important?",
          a: "Streams process data in **chunks** rather than loading it all into memory. There are 4 types: **Readable** (data source), **Writable** (data destination), **Duplex** (both), and **Transform** (modify data in flight). **Why important:** (1) **Memory efficiency** — a 10GB file can be processed with 64KB of RAM. (2) **Time efficiency** — processing starts immediately (don't wait for full load). (3) **Composability** — streams can be piped together like Unix pipes. (4) **Backpressure** — automatic flow control prevents memory overflow.",
        },
        {
          type: "tricky",
          q: "What is backpressure in Node.js streams and how do you handle it?",
          a: "Backpressure occurs when data is **produced faster than consumed**. A readable stream generates data faster than the writable stream can process it, causing data to buffer in memory. **Handling:** (1) `pipe()` handles it automatically — pauses readable when writable buffer is full, resumes on drain. (2) Manual: check `.write()` return value; if `false`, wait for the `'drain'` event. (3) **Best practice:** use `stream.pipeline()` which manages backpressure, error handling, and cleanup. Failing to handle backpressure causes OOM crashes with large data volumes.",
        },
      ],
    },
    {
      id: "stream-advanced-patterns",
      title: "Advanced Stream Patterns",
      explanation: `Beyond basic piping, streams unlock powerful data processing patterns for production applications: **chaining**, **multiplexing**, **throttling**, and **async iteration**.

**Stream chaining (pipeline):**
Chain multiple Transform streams to create data processing pipelines — like Unix pipes:
\`\`\`
readStream → decompress → decrypt → parse → filter → format → writeStream
\`\`\`

**Object mode streams:**
By default, streams work with Buffers/strings. Setting \`objectMode: true\` lets streams pass JavaScript objects — essential for data processing pipelines.

**Async iteration (for await...of):**
Since Node.js 10, readable streams are async iterables:
\`\`\`javascript
for await (const chunk of readableStream) {
  process.stdout.write(chunk);
}
\`\`\`

**Web Streams API (Node.js 16+):**
Node.js now supports the **Web Streams API** (\`ReadableStream\`, \`WritableStream\`, \`TransformStream\`) — the same API used in browsers. This enables code sharing between Node.js and browsers.

**When to use streams vs. buffers:**
| Scenario | Use |
|----------|-----|
| File < 50MB | \`readFile\` (simpler) |
| File > 50MB | \`createReadStream\` (memory efficient) |
| Real-time data | Streams (WebSocket, SSE) |
| ETL pipelines | Transform streams |
| HTTP responses | Stream directly (\`pipe\` to response) |
| Log processing | Line-by-line stream reading |

🏠 **Real-world analogy:** Advanced streams are like an **assembly line** in a factory — each station (Transform) does one job, and items move automatically from station to station. You can add, remove, or rearrange stations without redesigning the whole factory.`,
      codeExample: `// Advanced Stream Patterns

const { Readable, Writable, Transform, pipeline } = require("stream");
const { promisify } = require("util");
const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");

const pipelineAsync = promisify(pipeline);

// 1. Custom Readable stream — Generate data on demand
class NumberGenerator extends Readable {
  constructor(max) {
    super({ objectMode: true });
    this.current = 0;
    this.max = max;
  }

  _read() {
    if (this.current >= this.max) {
      this.push(null); // Signal end of stream
      return;
    }
    // Simulate async data generation
    setTimeout(() => {
      this.push({ number: this.current++, timestamp: Date.now() });
    }, 10);
  }
}

// 2. Custom Writable stream — Database batch inserter
class BatchInserter extends Writable {
  constructor(batchSize = 100) {
    super({ objectMode: true });
    this.batch = [];
    this.batchSize = batchSize;
    this.totalInserted = 0;
  }

  async _write(record, encoding, callback) {
    this.batch.push(record);

    if (this.batch.length >= this.batchSize) {
      await this.flushBatch();
    }
    callback();
  }

  async _final(callback) {
    if (this.batch.length > 0) {
      await this.flushBatch();
    }
    console.log(\`Total records inserted: \${this.totalInserted}\`);
    callback();
  }

  async flushBatch() {
    // Simulate database batch insert
    console.log(\`Inserting batch of \${this.batch.length} records...\`);
    // await db.collection("data").insertMany(this.batch);
    this.totalInserted += this.batch.length;
    this.batch = [];
  }
}

// 3. Transform pipeline — ETL (Extract, Transform, Load)
class FilterTransform extends Transform {
  constructor(predicate) {
    super({ objectMode: true });
    this.predicate = predicate;
  }

  _transform(obj, encoding, callback) {
    if (this.predicate(obj)) {
      this.push(obj);
    }
    callback();
  }
}

class MapTransform extends Transform {
  constructor(mapper) {
    super({ objectMode: true });
    this.mapper = mapper;
  }

  _transform(obj, encoding, callback) {
    this.push(this.mapper(obj));
    callback();
  }
}

// Usage: Generate → Filter → Transform → Insert
async function runETLPipeline() {
  await pipelineAsync(
    new NumberGenerator(1000),
    new FilterTransform((item) => item.number % 2 === 0), // Even numbers
    new MapTransform((item) => ({
      ...item,
      squared: item.number ** 2,
      label: \`Item #\${item.number}\`,
    })),
    new BatchInserter(50)
  );
  console.log("ETL pipeline complete");
}

// 4. Async iteration with readable streams
async function processFileByLine(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
  let lineBuffer = "";
  let lineCount = 0;

  for await (const chunk of stream) {
    lineBuffer += chunk;
    const lines = lineBuffer.split("\\n");
    lineBuffer = lines.pop();

    for (const line of lines) {
      lineCount++;
      // Process each line
      if (line.includes("ERROR")) {
        console.log(\`Line \${lineCount}: \${line}\`);
      }
    }
  }
}

// 5. Multi-step file processing pipeline
async function processLogFile(inputPath, outputPath) {
  await pipelineAsync(
    // Read compressed log file
    fs.createReadStream(inputPath),
    // Decompress
    zlib.createGunzip(),
    // Filter lines containing "ERROR"
    new Transform({
      transform(chunk, encoding, callback) {
        const lines = chunk.toString().split("\\n");
        const errorLines = lines
          .filter((line) => line.includes("ERROR"))
          .join("\\n");
        if (errorLines) this.push(errorLines + "\\n");
        callback();
      },
    }),
    // Write filtered output
    fs.createWriteStream(outputPath)
  );
  console.log("Log processing complete");
}

// 6. Readable.from() — Create streams from iterables
async function streamFromArray() {
  const data = [
    { name: "Alice", score: 95 },
    { name: "Bob", score: 87 },
    { name: "Charlie", score: 92 },
  ];

  const stream = Readable.from(data.map((d) => JSON.stringify(d) + "\\n"));

  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
}

// 7. Duplex stream — Echo server
const net = require("net");

function createEchoServer(port) {
  const server = net.createServer((socket) => {
    // socket is a Duplex stream
    console.log("Client connected");
    
    socket.on("data", (data) => {
      // Echo back what was received
      socket.write(\`Echo: \${data}\`);
    });

    socket.on("end", () => console.log("Client disconnected"));
    socket.on("error", (err) => console.error("Socket error:", err.message));
  });

  server.listen(port, () => console.log(\`Echo server on port \${port}\`));
  return server;
}

// 8. Stream performance monitoring
class MonitoredTransform extends Transform {
  constructor(name) {
    super();
    this.name = name;
    this.bytesProcessed = 0;
    this.startTime = Date.now();
  }

  _transform(chunk, encoding, callback) {
    this.bytesProcessed += chunk.length;
    this.push(chunk);
    callback();
  }

  _flush(callback) {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const mbProcessed = this.bytesProcessed / 1024 / 1024;
    console.log(
      \`[\${this.name}] Processed \${mbProcessed.toFixed(2)}MB in \${elapsed.toFixed(2)}s (\${(mbProcessed / elapsed).toFixed(2)} MB/s)\`
    );
    callback();
  }
}`,
      exercise: `**Exercises:**
1. Build an ETL pipeline with custom Readable, Transform, and Writable streams that processes a CSV and inserts into a database
2. Create a streaming JSON parser that handles newline-delimited JSON (NDJSON) files
3. Implement a rate-limiting Transform stream that limits throughput to N bytes per second
4. Build a stream multiplexer that sends a readable stream to multiple writable destinations
5. Use \`Readable.from()\` and async generators to create a stream from paginated API responses
6. Write a performance-monitoring Transform stream that logs throughput (MB/s) and chunk counts`,
      commonMistakes: [
        "Not using `objectMode: true` when passing JavaScript objects through streams — without it, streams expect Buffer/string and will throw or corrupt data",
        "Creating custom streams without implementing `_final()` — this method is called before the stream closes; use it to flush remaining buffered data",
        "Not destroying streams on error — use `stream.destroy(err)` to clean up resources; `pipeline()` does this automatically",
        "Using `readableStream.on('data')` without handling backpressure — this puts the stream in 'flowing' mode and can overwhelm downstream consumers",
        "Forgetting that `stream.pipeline()` destroys all streams on error — don't add additional logic to destroyed streams after a pipeline failure",
      ],
      interviewQuestions: [
        {
          type: "coding",
          q: "How would you implement a Transform stream that processes data line by line?",
          a: "```js\nconst { Transform } = require('stream');\n\nclass LineTransform extends Transform {\n  constructor() {\n    super({ encoding: 'utf-8' });\n    this.buffer = '';\n  }\n  \n  _transform(chunk, encoding, callback) {\n    this.buffer += chunk.toString();\n    const lines = this.buffer.split('\\n');\n    this.buffer = lines.pop(); // Keep incomplete line\n    \n    for (const line of lines) {\n      this.push(line + '\\n');\n    }\n    callback();\n  }\n  \n  _flush(callback) {\n    if (this.buffer) this.push(this.buffer + '\\n');\n    callback();\n  }\n}\n```\nThe key insight is buffering partial lines between chunks and using `_flush()` to process the final buffer.",
        },
        {
          type: "scenario",
          q: "How would you process a 10GB log file to find all error entries?",
          a: "Use a **stream pipeline**: (1) `fs.createReadStream()` for memory-efficient reading (~64KB chunks). (2) A line-splitting Transform stream to handle line boundaries across chunks. (3) A filter Transform that only passes lines containing 'ERROR'. (4) `fs.createWriteStream()` for the output. Use `stream.pipeline()` for proper error handling and backpressure management. This processes 10GB using ~64KB of memory. For even faster processing, split the file and use `worker_threads` to process chunks in parallel.",
        },
      ],
    },
    {
      id: "child-processes",
      title: "Child Processes & Worker Threads",
      explanation: `Node.js provides two mechanisms for parallel execution: **Child Processes** (separate OS processes) and **Worker Threads** (threads within the same process). Choose based on your use case.

**Child Processes (\`child_process\` module):**
Spawn separate OS processes to run system commands, scripts, or other programs.

| Method | Use Case |
|--------|----------|
| \`exec(cmd)\` | Run shell commands, get output as string (buffers stdout) |
| \`execFile(file, args)\` | Run a specific executable (faster, no shell) |
| \`spawn(cmd, args)\` | Stream-based for long-running processes |
| \`fork(modulePath)\` | Spawn a new Node.js process with IPC channel |

**Worker Threads (\`worker_threads\` module):**
Run JavaScript in parallel threads within the same process. Unlike child processes, workers **share memory** via SharedArrayBuffer.

| Feature | Child Process | Worker Thread |
|---------|--------------|---------------|
| Isolation | Full (separate process) | Partial (same process) |
| Communication | IPC (serialized messages) | MessagePort + SharedArrayBuffer |
| Memory | Separate (duplicated) | Shared possible |
| Overhead | High (new V8 instance + OS process) | Lower (new V8 isolate) |
| Best for | System commands, CPU isolation | CPU-heavy JS computations |

**When to use which:**
- **Child process:** Running shell commands, Python scripts, system tools, process isolation for security
- **Worker thread:** CPU-intensive JavaScript (image processing, crypto, data parsing)
- **Neither:** I/O-bound work (use async I/O — the event loop handles it perfectly)

🏠 **Real-world analogy:** Child processes are like **hiring a separate contractor** — they work independently with their own tools. Worker threads are like **assigning a colleague** — they share office resources but work on different tasks simultaneously.`,
      codeExample: `// Child Processes & Worker Threads

const { exec, execFile, spawn, fork } = require("child_process");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const { promisify } = require("util");
const execAsync = promisify(exec);

// === CHILD PROCESSES ===

// 1. exec — Run shell commands (output buffered)
async function runShellCommand() {
  try {
    const { stdout, stderr } = await execAsync("ls -la && echo 'Done!'");
    console.log("Output:", stdout);
    if (stderr) console.error("Stderr:", stderr);
  } catch (err) {
    console.error("Command failed:", err.message);
  }
}

// 2. spawn — Stream-based (for long-running commands)
function runLongCommand() {
  const child = spawn("find", [".", "-name", "*.js", "-type", "f"]);

  child.stdout.on("data", (data) => {
    console.log("Found:", data.toString().trim());
  });

  child.stderr.on("data", (data) => {
    console.error("Error:", data.toString());
  });

  child.on("close", (code) => {
    console.log(\`Process exited with code \${code}\`);
  });
}

// 3. fork — Spawn Node.js process with IPC
// === parent.js ===
function forkWorker() {
  const worker = fork("./heavy-computation.js");

  worker.send({ type: "start", data: { numbers: [1, 2, 3, 4, 5] } });

  worker.on("message", (result) => {
    console.log("Result from worker:", result);
  });

  worker.on("exit", (code) => {
    console.log(\`Worker exited with code \${code}\`);
  });
}

// === heavy-computation.js ===
// process.on("message", (msg) => {
//   if (msg.type === "start") {
//     const result = msg.data.numbers.reduce((a, b) => a + b, 0);
//     process.send({ type: "result", value: result });
//     process.exit(0);
//   }
// });

// === WORKER THREADS ===

// 4. Basic Worker Thread
if (isMainThread) {
  // Main thread
  function createWorker(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: data });

      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(\`Worker stopped with exit code \${code}\`));
        }
      });
    });
  }

  // Run CPU-intensive work in parallel
  async function parallelComputation() {
    const tasks = [
      { start: 0, end: 25000000 },
      { start: 25000000, end: 50000000 },
      { start: 50000000, end: 75000000 },
      { start: 75000000, end: 100000000 },
    ];

    console.time("parallel");
    const results = await Promise.all(tasks.map(createWorker));
    const total = results.reduce((a, b) => a + b, 0);
    console.timeEnd("parallel");
    console.log("Sum:", total);
  }

  // Compare with single-threaded
  async function singleThreaded() {
    console.time("single");
    let sum = 0;
    for (let i = 0; i < 100000000; i++) sum += i;
    console.timeEnd("single");
    console.log("Sum:", sum);
  }
} else {
  // Worker thread
  const { start, end } = workerData;
  let sum = 0;
  for (let i = start; i < end; i++) sum += i;
  parentPort.postMessage(sum);
}

// 5. Worker pool pattern
class WorkerPool {
  constructor(workerScript, poolSize) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    this.activeWorkers = 0;
  }

  execute(data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    while (this.queue.length > 0 && this.activeWorkers < this.poolSize) {
      const { data, resolve, reject } = this.queue.shift();
      this.activeWorkers++;

      const worker = new Worker(this.workerScript, { workerData: data });

      worker.on("message", (result) => {
        this.activeWorkers--;
        resolve(result);
        this.processQueue();
      });

      worker.on("error", (err) => {
        this.activeWorkers--;
        reject(err);
        this.processQueue();
      });
    }
  }
}

// Usage:
// const pool = new WorkerPool("./worker.js", 4); // 4 worker threads
// const results = await Promise.all([
//   pool.execute({ task: "process-image", path: "photo1.jpg" }),
//   pool.execute({ task: "process-image", path: "photo2.jpg" }),
//   pool.execute({ task: "process-image", path: "photo3.jpg" }),
// ]);`,
      exercise: `**Exercises:**
1. Use \`exec\` to run a system command and capture the output — handle both success and failure
2. Use \`spawn\` to run a long-running command and stream its output in real-time
3. Create a forked Node.js process that performs heavy computation and sends results back via IPC
4. Implement a Worker Thread that computes prime numbers in parallel across 4 threads
5. Build a Worker Pool that reuses a fixed number of threads for queued tasks
6. Compare the performance of single-threaded vs Worker Thread computation for a CPU-intensive task`,
      commonMistakes: [
        "Using `exec()` with user input without sanitization — this is a shell injection vulnerability; use `execFile()` or `spawn()` with arguments array instead",
        "Using Worker Threads for I/O-bound tasks — the event loop already handles async I/O efficiently; Workers add overhead without benefit for I/O work",
        "Not handling the 'error' event on child processes — errors in spawned processes crash silently if not caught",
        "Creating too many Worker Threads — each thread has V8 overhead (~2-5MB); creating hundreds wastes memory; use a worker pool with a fixed size",
        "Using `exec()` for commands with large output — exec buffers ALL output in memory; use `spawn()` with streaming for large outputs",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the difference between child processes and worker threads in Node.js?",
          a: "**Child processes** are separate OS processes with their own V8 instance and memory space. Communication happens via IPC (serialized messages). They're fully isolated — a crash in a child doesn't affect the parent. Use them for running shell commands, other languages, or when you need process-level isolation. **Worker threads** run in the same process but with separate V8 isolates. They can share memory (SharedArrayBuffer) and communicate via MessagePort. They have lower overhead than child processes. Use them for CPU-intensive JavaScript computation (image processing, crypto, data parsing). **Neither** should be used for I/O-bound work — Node.js's async event loop already handles that efficiently.",
        },
        {
          type: "scenario",
          q: "How would you handle CPU-intensive tasks in a Node.js web server without blocking the event loop?",
          a: "**Options by complexity:** (1) **Worker Threads** — offload computation to a worker pool. Create a pool of N workers (matching CPU cores), queue tasks, and resolve when the worker returns a result. The main thread stays responsive for HTTP requests. (2) **Child Process (fork)** — spawn a dedicated Node.js process for heavy work; communicate via IPC. Better isolation but higher overhead. (3) **Chunked processing** — break work into small chunks and use `setImmediate()` between chunks to yield to the event loop. (4) **External service** — move heavy work to a separate microservice (Python, Go, Rust). (5) **Queue system** — push tasks to Redis/BullMQ and process them asynchronously with worker instances. The worker pool pattern is most common for in-process CPU work.",
        },
      ],
    },
  ],
};

export default nodePhase4;
