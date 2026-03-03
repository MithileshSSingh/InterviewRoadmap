import ResourceList from "./ResourceList";

export default function SystemDesignSection({ systemDesign }) {
  if (!systemDesign) return null;

  return (
    <section style={cardStyle}>
      <h2 style={headingStyle}>🏗️ System Design</h2>

      {systemDesign.topics?.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={subLabel}>Practice Designs</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {systemDesign.topics.map((t) => (
              <span key={t} style={tagStyle}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {systemDesign.keyConcepts?.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={subLabel}>Key Concepts</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {systemDesign.keyConcepts.map((c) => (
              <span
                key={c}
                style={{
                  ...tagStyle,
                  background: "var(--accent-blue)22",
                  color: "var(--accent-blue)",
                  border: "1px solid var(--accent-blue)44",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {systemDesign.resources?.length > 0 && (
        <div>
          <div style={subLabel}>Resources</div>
          <ResourceList resources={systemDesign.resources} />
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

const subLabel = {
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.5rem",
};

const tagStyle = {
  padding: "0.25rem 0.65rem",
  borderRadius: 999,
  fontSize: "0.8rem",
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};
