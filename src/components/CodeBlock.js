"use client";
import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";

export default function CodeBlock({ code, language = "javascript" }) {
  const [copied, setCopied] = useState(false);
  const trimmedCode = code.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(trimmedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{language}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <Highlight theme={themes.nightOwl} code={trimmedCode} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={{ ...style, margin: 0, padding: "1rem", overflow: "auto", borderRadius: "0 0 0.75rem 0.75rem", fontSize: "0.875rem", lineHeight: 1.7 }}>
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
    </div>
  );
}
