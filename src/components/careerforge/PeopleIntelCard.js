"use client";
import { useState } from "react";

export default function PeopleIntelCard({ peopleIntel }) {
  const [copied, setCopied] = useState(null);
  if (!peopleIntel) return null;

  function copyUrl(url, idx) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <section className="cf-card" style={cardStyle}>
      <h2 style={headingStyle}>🔗 Networking & Referrals</h2>

      {peopleIntel.strategy && (
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "1.25rem",
            lineHeight: 1.65,
          }}
        >
          {peopleIntel.strategy}
        </p>
      )}

      {/* LinkedIn search cards */}
      {peopleIntel.referralSearches?.length > 0 && (
        <div
          style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}
        >
          {peopleIntel.referralSearches.map((search, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                  {search.label}
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {search.description}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => copyUrl(search.url, idx)}
                  style={secondaryBtnStyle}
                >
                  {copied === idx ? "✓ Copied" : "Copy URL"}
                </button>
                <a
                  href={search.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={primaryBtnStyle}
                >
                  Open Search →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {peopleIntel.tips?.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.75rem",
            }}
          >
            Outreach Tips
          </div>
          <ol
            style={{
              paddingLeft: "1.25rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}
          >
            {peopleIntel.tips.map((tip, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>
                {tip}
              </li>
            ))}
          </ol>
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

const headingStyle = {
  fontSize: "1.1rem",
  fontWeight: 700,
  marginBottom: "0.75rem",
};

const primaryBtnStyle = {
  padding: "0.4rem 0.85rem",
  background: "var(--accent-blue)",
  color: "var(--bg-primary)",
  border: "none",
  borderRadius: "var(--radius)",
  fontWeight: 600,
  fontSize: "0.82rem",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const secondaryBtnStyle = {
  padding: "0.4rem 0.75rem",
  background: "transparent",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontWeight: 500,
  fontSize: "0.82rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
