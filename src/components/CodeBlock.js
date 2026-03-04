"use client";
import { useEffect, useState } from "react";
import { Highlight, themes } from "prism-react-renderer";

export default function CodeBlock({ code, language = "javascript" }) {
  const [copied, setCopied] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const trimmedCode = code.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(trimmedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!isFullscreenOpen) {
      return undefined;
    }

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsFullscreenOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [isFullscreenOpen]);

  const renderCode = ({ isFullscreen = false } = {}) => (
    <Highlight theme={themes.nightOwl} code={trimmedCode} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} ${isFullscreen ? "code-block-fullscreen-pre" : ""}`}
          style={{
            ...style,
            margin: 0,
            padding: "1rem",
            overflow: "auto",
            borderRadius: isFullscreen ? 0 : "0 0 0.75rem 0.75rem",
            fontSize: isFullscreen ? "0.95rem" : "0.875rem",
            lineHeight: 1.7,
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="line-number">{i + 1}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

  const handleBlockKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsFullscreenOpen(true);
    }
  };

  return (
    <>
      <div
        className="code-block-wrapper code-block-clickable"
        role="button"
        tabIndex={0}
        aria-label="Open code in full screen"
        onClick={() => setIsFullscreenOpen(true)}
        onKeyDown={handleBlockKeyDown}
      >
        <div className="code-block-header">
          <span className="code-lang">{language}</span>
          <div className="code-block-actions">
            <button
              className="copy-btn"
              onClick={async (event) => {
                event.stopPropagation();
                await handleCopy();
              }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <span className="expand-code-hint">Tap to expand ⛶</span>
          </div>
        </div>
        {renderCode()}
      </div>

      {isFullscreenOpen && (
        <div
          className="code-dialog-backdrop"
          onClick={() => setIsFullscreenOpen(false)}
        >
          <div
            className="code-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Full screen code viewer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="code-dialog-header">
              <span className="code-lang">{language}</span>
              <div className="code-dialog-actions">
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
                <button
                  className="copy-btn"
                  onClick={() => setIsFullscreenOpen(false)}
                  aria-label="Close full screen code viewer"
                >
                  Close ✕
                </button>
              </div>
            </div>
            <div className="code-dialog-content">
              {renderCode({ isFullscreen: true })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
