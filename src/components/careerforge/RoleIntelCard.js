"use client";
import { useState } from "react";

export default function RoleIntelCard({ roleIntel }) {
  const [expanded, setExpanded] = useState(false);
  if (!roleIntel) return null;

  return (
    <section className="cf-card" style={cardStyle}>
      <h2 style={headingStyle}>📋 Role Overview</h2>
      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "1.25rem",
          lineHeight: 1.65,
        }}
      >
        {roleIntel.description ||
          `${roleIntel.title} — ${roleIntel.experienceRequired} experience required.`}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <div style={subHeadingStyle}>Required Skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {roleIntel.requiredSkills?.map((s) => (
              <span key={s} style={badgeStyle("var(--accent-blue)")}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div style={subHeadingStyle}>Nice to Have</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {roleIntel.niceToHave?.map((s) => (
              <span key={s} style={badgeStyle("var(--text-secondary)")}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {roleIntel.keyResponsibilities?.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-blue)",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              padding: 0,
            }}
          >
            {expanded ? "▾ Hide" : "▸ Show"} Key Responsibilities (
            {roleIntel.keyResponsibilities.length})
          </button>
          {expanded && (
            <ul
              style={{
                marginTop: "0.75rem",
                paddingLeft: "1.25rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              {roleIntel.keyResponsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
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
  marginBottom: "1rem",
};

const subHeadingStyle = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.5rem",
};

function badgeStyle(color) {
  return {
    padding: "0.2rem 0.65rem",
    borderRadius: 999,
    fontSize: "0.78rem",
    fontWeight: 600,
    background: color + "22",
    color: color,
    border: `1px solid ${color}44`,
  };
}
