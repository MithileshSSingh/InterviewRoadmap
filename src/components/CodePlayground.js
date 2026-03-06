"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lazy, Suspense } from "react";
import { useTheme } from "@/components/ThemeProvider";

const MonacoEditor = lazy(() =>
  import("@monaco-editor/react").then((mod) => ({ default: mod.default })),
);

const LANGUAGE_MAP = {
  js: "javascript",
  jsx: "javascript",
  javascript: "javascript",
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  py: "python",
  python: "python",
};

function normalizeLanguage(language) {
  if (!language) return "javascript";
  return LANGUAGE_MAP[language.toLowerCase()] || "javascript";
}

function formatValue(value) {
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function CodePlayground({
  code,
  language = "javascript",
  height = "420px",
}) {
  const { mode } = useTheme();
  const initialCode = code || "";
  const monacoLanguage = useMemo(
    () => normalizeLanguage(language),
    [language],
  );
  const isRunnable = monacoLanguage === "javascript";

  const [editorCode, setEditorCode] = useState(initialCode);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [splitPercent, setSplitPercent] = useState(62);
  const [isMobile, setIsMobile] = useState(false);

  const wrapperRef = useRef(null);
  const dragActiveRef = useRef(false);
  const cleanupRunRef = useRef(null);
  const pointerMoveHandlerRef = useRef(null);
  const pointerUpHandlerRef = useRef(null);

  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const stopRun = useCallback(() => {
    if (cleanupRunRef.current) {
      cleanupRunRef.current();
      cleanupRunRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => stopRun, [stopRun]);

  const runCode = () => {
    if (!isRunnable) return;

    stopRun();
    setOutput([]);
    setIsRunning(true);

    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";

    const safeCode = JSON.stringify(editorCode).replace(
      /<\/script/gi,
      "<\\/script",
    );
    const srcdoc = `<!doctype html><html><body><script>
      (function () {
        var runId = ${JSON.stringify(runId)};
        function send(kind, payload) {
          parent.postMessage({ source: "code-playground", runId: runId, kind: kind, payload: payload }, "*");
        }
        var originalLog = console.log;
        var originalError = console.error;

        console.log = function () {
          var args = Array.prototype.slice.call(arguments).map(function (item) {
            if (item && item.stack) return item.stack;
            if (typeof item === "string") return item;
            try { return JSON.stringify(item); } catch (_err) { return String(item); }
          });
          send("log", args.join(" "));
          originalLog.apply(console, arguments);
        };

        console.error = function () {
          var args = Array.prototype.slice.call(arguments).map(function (item) {
            if (item && item.stack) return item.stack;
            if (typeof item === "string") return item;
            try { return JSON.stringify(item); } catch (_err) { return String(item); }
          });
          send("error", args.join(" "));
          originalError.apply(console, arguments);
        };

        window.onerror = function (_message, _source, _line, _col, error) {
          send("error", error && error.stack ? error.stack : String(_message));
          return true;
        };

        window.onunhandledrejection = function (event) {
          var reason = event && event.reason ? event.reason : "Unhandled promise rejection";
          send("error", reason && reason.stack ? reason.stack : String(reason));
        };

        (async function () {
          try {
            var userCode = ${safeCode};
            var result = eval(userCode);
            if (result && typeof result.then === "function") {
              result = await result;
            }
            if (typeof result !== "undefined") {
              send("log", String(result));
            }
            send("done", "ok");
          } catch (error) {
            send("error", error && error.stack ? error.stack : String(error));
            send("done", "error");
          }
        })();
      })();
    </script></body></html>`;

    const onMessage = (event) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "code-playground" || data.runId !== runId)
        return;

      if (data.kind === "log") {
        setOutput((prev) => [...prev, { type: "log", text: formatValue(data.payload) }]);
      } else if (data.kind === "error") {
        setOutput((prev) => [
          ...prev,
          { type: "error", text: formatValue(data.payload) },
        ]);
      } else if (data.kind === "done") {
        stopRun();
      }
    };

    const timeoutId = window.setTimeout(() => {
      setOutput((prev) => [
        ...prev,
        { type: "error", text: "Execution stopped after 5 seconds (timeout)." },
      ]);
      stopRun();
    }, 5000);

    cleanupRunRef.current = () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timeoutId);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };

    window.addEventListener("message", onMessage);
    iframe.srcdoc = srcdoc;
    document.body.appendChild(iframe);
  };

  const resetCode = () => {
    stopRun();
    setEditorCode(initialCode);
    setOutput([]);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(editorCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const onPointerMove = useCallback(
    (event) => {
      if (!dragActiveRef.current || !wrapperRef.current || isMobile) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const percent = ((event.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(85, Math.max(30, percent)));
    },
    [isMobile],
  );

  const startDragging = () => {
    if (isMobile) return;
    dragActiveRef.current = true;
    pointerMoveHandlerRef.current = (event) => onPointerMove(event);
    pointerUpHandlerRef.current = () => {
      dragActiveRef.current = false;
      if (pointerMoveHandlerRef.current) {
        window.removeEventListener("pointermove", pointerMoveHandlerRef.current);
        pointerMoveHandlerRef.current = null;
      }
      if (pointerUpHandlerRef.current) {
        window.removeEventListener("pointerup", pointerUpHandlerRef.current);
        pointerUpHandlerRef.current = null;
      }
    };

    window.addEventListener("pointermove", pointerMoveHandlerRef.current);
    window.addEventListener("pointerup", pointerUpHandlerRef.current);
  };

  useEffect(() => {
    return () => {
      if (pointerMoveHandlerRef.current) {
        window.removeEventListener("pointermove", pointerMoveHandlerRef.current);
      }
      if (pointerUpHandlerRef.current) {
        window.removeEventListener("pointerup", pointerUpHandlerRef.current);
      }
    };
  }, []);

  const layoutStyle = isMobile
    ? {
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr auto 220px",
      }
    : {
        gridTemplateColumns: `${splitPercent}% 8px ${100 - splitPercent}%`,
        gridTemplateRows: "1fr",
      };

  return (
    <div className="code-playground" style={{ height }}>
      <div className="code-playground-toolbar">
        <span className="code-lang">{monacoLanguage}</span>
        <div className="code-playground-actions">
          <button
            className="copy-btn"
            onClick={runCode}
            disabled={!isRunnable || isRunning}
            title={!isRunnable ? "JavaScript execution only" : "Run code"}
          >
            {isRunning ? "Running..." : "▶ Run"}
          </button>
          <button className="copy-btn" onClick={resetCode}>
            Reset
          </button>
          <button className="copy-btn" onClick={copyCode}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="code-playground-grid" ref={wrapperRef} style={layoutStyle}>
        <div className="code-playground-editor">
          <Suspense fallback={<div className="playground-loading">Loading Monaco...</div>}>
            <MonacoEditor
              height="100%"
              language={monacoLanguage}
              value={editorCode}
              theme={mode === "light" ? "vs-light" : "vs-dark"}
              onChange={(value) => setEditorCode(value ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </Suspense>
        </div>

        <div
          className={`code-playground-splitter ${isMobile ? "vertical" : ""}`}
          onPointerDown={startDragging}
          role="separator"
          aria-orientation={isMobile ? "horizontal" : "vertical"}
          aria-label="Resize editor and console"
        />

        <div className="code-playground-console">
          {output.length === 0 ? (
            <p className="console-placeholder">Output will appear here...</p>
          ) : (
            output.map((entry, index) => (
              <pre
                key={`${entry.type}-${index}`}
                className={`console-line ${entry.type === "error" ? "error" : "log"}`}
              >
                {entry.type === "error" ? "✖ " : "› "}
                {entry.text}
              </pre>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
