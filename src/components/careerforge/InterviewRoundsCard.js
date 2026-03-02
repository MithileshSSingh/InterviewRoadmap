const TYPE_COLORS = {
  "Phone Screen": "#6366f1",
  "Technical": "var(--accent-blue)",
  "System Design": "#8b5cf6",
  "Behavioral": "#f59e0b",
  "HR": "#10b981",
  "Onsite": "#ec4899",
  "Hiring Manager": "#06b6d4",
};

function getColor(type) {
  for (const [key, color] of Object.entries(TYPE_COLORS)) {
    if (type?.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "var(--text-secondary)";
}

export default function InterviewRoundsCard({ interviewProcess }) {
  if (!interviewProcess) return null;

  return (
    <section style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>🎯 Interview Process</h2>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          {interviewProcess.totalRounds} rounds · {interviewProcess.timeline}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingBottom: "0.5rem" }}>
        {/* Connecting line */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 19,
            right: 0,
            height: 2,
            background: "var(--border)",
            zIndex: 0,
          }}
        />

        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", position: "relative", zIndex: 1 }}>
          {interviewProcess.rounds?.map((round) => {
            const color = getColor(round.type);
            return (
              <div
                key={round.round}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 120,
                  flex: "0 0 auto",
                }}
              >
                {/* Circle node */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: color + "22",
                    border: `2px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: color,
                    marginBottom: "0.75rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {round.round}
                </div>
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "calc(var(--radius) - 2px)",
                    padding: "0.65rem 0.75rem",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: color,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {round.type}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                    {round.duration}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
                    {round.focus}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {interviewProcess.sources?.length > 0 && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          Sources: {interviewProcess.sources.join(", ")}
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
