"use client";
import { useState } from "react";

export default function BehavioralSection({ behavioral }) {
  const [openQ, setOpenQ] = useState(null);
  if (!behavioral) return null;

  return (
    <section style={cardStyle}>
      <h2 style={headingStyle}>🎭 Behavioral Prep</h2>

      {behavioral.framework && (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Framework: <strong style={{ color: "var(--text-primary)" }}>{behavioral.framework}</strong> — Structure every answer with Situation, Task, Action, and Result.
        </p>
      )}

      {behavioral.companyValues?.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={subLabel}>Company Values</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {behavioral.companyValues.map((v) => (
              <span key={v} style={valueBadge}>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {behavioral.keyThemes?.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={subLabel}>Key Themes to Prepare</div>
          <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", lineHeight: 1.8, margin: 0 }}>
            {behavioral.keyThemes.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      {behavioral.sampleQuestions?.length > 0 && (
        <div>
          <div style={subLabel}>Sample Questions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {behavioral.sampleQuestions.map((q, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenQ(openQ === i ? null : i)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>{q}</span>
                  <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
                    {openQ === i ? "▾" : "▸"}
                  </span>
                </button>
                {openQ === i && (
                  <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Tips:</strong> Use the STAR framework. Focus on your specific contribution, measurable outcome, and what you learned.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "1.5rem",
  marginBottom: "1.25rem",
};

const headingStyle = { fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" };

const subLabel = {
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.5rem",
};

const valueBadge = {
  padding: "0.25rem 0.75rem",
  borderRadius: 999,
  fontSize: "0.8rem",
  fontWeight: 600,
  background: "var(--accent-blue)22",
  color: "var(--accent-blue)",
  border: "1px solid var(--accent-blue)44",
};
