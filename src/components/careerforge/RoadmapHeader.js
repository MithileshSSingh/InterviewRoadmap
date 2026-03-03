export default function RoadmapHeader({ meta }) {
  if (!meta) return null;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "2rem",
        marginBottom: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg, var(--accent-blue), var(--accent-green, var(--accent-blue)))",
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "0.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Career Roadmap
          </div>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              marginBottom: "0.4rem",
            }}
          >
            {meta.role}
          </h1>
          <div
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            at {meta.company}
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Stat label="Experience" value={meta.experienceLevel} />
          <Stat label="Prep Time" value={`${meta.totalWeeks} weeks`} />
          <Stat
            label="Generated"
            value={new Date(meta.generatedAt).toLocaleDateString()}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius)",
        padding: "0.6rem 1rem",
        textAlign: "center",
        minWidth: 90,
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          color: "var(--text-secondary)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{value}</div>
    </div>
  );
}
