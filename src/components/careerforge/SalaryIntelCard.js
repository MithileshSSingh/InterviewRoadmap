export default function SalaryIntelCard({ salaryIntel, userLevel }) {
  if (!salaryIntel || !salaryIntel.levels?.length) return null;

  const normalize = (str) => str?.toLowerCase() ?? "";
  const highlightLevel = normalize(userLevel);

  function isHighlighted(level) {
    return (
      normalize(level).includes(highlightLevel) ||
      highlightLevel.includes(normalize(level))
    );
  }

  return (
    <section style={cardStyle}>
      <h2 style={headingStyle}>💰 Compensation Overview</h2>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          marginBottom: "1rem",
        }}
      >
        Estimates for {salaryIntel.location} · {salaryIntel.currency} · Updated{" "}
        {salaryIntel.lastUpdated}
      </p>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              {["Level", "Base", "Total Comp", "Equity (4yr)", "Bonus"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {salaryIntel.levels.map((row, i) => {
              const highlighted = isHighlighted(row.level);
              return (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: highlighted
                      ? "var(--accent-blue)11"
                      : "transparent",
                  }}
                >
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: highlighted ? 700 : 400,
                      color: highlighted
                        ? "var(--accent-blue)"
                        : "var(--text-primary)",
                    }}
                  >
                    {row.level}
                    {highlighted && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          marginLeft: "0.4rem",
                          opacity: 0.7,
                        }}
                      >
                        ← you
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>{row.base}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {row.totalComp}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--text-secondary)" }}>
                    {row.equity4yr}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--text-secondary)" }}>
                    {row.bonus}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p
        style={{
          marginTop: "0.75rem",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          fontStyle: "italic",
        }}
      >
        * These are estimated ranges from public sources. Actual compensation
        varies significantly based on negotiation, location, and team.
      </p>

      {salaryIntel.sources?.length > 0 && (
        <div
          style={{
            marginTop: "0.4rem",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
          }}
        >
          Sources: {salaryIntel.sources.join(", ")}
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
  marginBottom: "0.5rem",
};

const tdStyle = {
  padding: "0.6rem 0.75rem",
  color: "var(--text-primary)",
  whiteSpace: "nowrap",
};
