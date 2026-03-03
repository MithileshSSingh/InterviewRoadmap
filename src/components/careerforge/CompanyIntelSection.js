export default function CompanyIntelSection({ companyIntel }) {
  if (!companyIntel) return null;

  return (
    <section className="cf-card" style={cardStyle}>
      <h2 style={headingStyle}>🏢 Company Intel</h2>

      {companyIntel.hiringTimeline && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={subLabel}>Hiring Timeline</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {companyIntel.hiringTimeline}
          </p>
        </div>
      )}

      {companyIntel.tips?.length > 0 && (
        <div>
          <div style={subLabel}>Tips for This Company</div>
          <ul
            style={{
              paddingLeft: "1.25rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {companyIntel.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
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

const subLabel = {
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.4rem",
};
