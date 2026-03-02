"use client";

const AGENT_DEFS = [
  { key: "orchestrator", label: "Orchestrator", icon: "🎯", desc: "Coordinating agents" },
  { key: "jobIntel", label: "Job Intel", icon: "📋", desc: "Interview process + job description" },
  { key: "salaryIntel", label: "Salary Intel", icon: "💰", desc: "Compensation data" },
  { key: "linkedinIntel", label: "LinkedIn Intel", icon: "🔗", desc: "Networking strategy" },
  { key: "skillsMapper", label: "Skills Mapper", icon: "🗺️", desc: "Skill tree generation" },
  { key: "resourceFinder", label: "Resource Finder", icon: "📚", desc: "Learning resources" },
  { key: "roadmapBuilder", label: "Roadmap Builder", icon: "🏗️", desc: "Assembling final roadmap" },
  { key: "formatter", label: "Formatter", icon: "✅", desc: "Validating and saving" },
];

function AgentStatusBadge({ status }) {
  const configs = {
    done: { bg: "var(--accent-blue)22", color: "var(--accent-blue)", label: "Done" },
    running: { bg: "#f59e0b22", color: "#f59e0b", label: "Running" },
    failed: { bg: "#ef444422", color: "#ef4444", label: "Failed" },
    pending: { bg: "var(--border)", color: "var(--text-secondary)", label: "Pending" },
  };
  const cfg = configs[status] ?? configs.pending;
  return (
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.15rem 0.5rem",
        borderRadius: 999,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {cfg.label}
    </span>
  );
}

export default function StreamingProgress({ agentStatuses = {}, progress = 0 }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🧠</div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Building Your Roadmap
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          7 AI agents are analyzing your target role. This takes 60–90 seconds.
        </p>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 6,
          background: "var(--bg-secondary)",
          borderRadius: 999,
          marginBottom: "2rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--accent-blue)",
            borderRadius: 999,
            width: `${Math.max(progress, 3)}%`,
            transition: "width 0.6s ease",
          }}
        />
      </div>

      {/* Agent cards */}
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {AGENT_DEFS.map((agent) => {
          const statusMsg = agentStatuses[agent.key];
          const status = statusMsg
            ? statusMsg.includes("fail") || statusMsg.includes("error")
              ? "failed"
              : statusMsg.includes("LLM fallback") || statusMsg.includes("estimated")
              ? "done"
              : statusMsg.includes("...")
              ? "running"
              : "done"
            : "pending";

          return (
            <div
              key={agent.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.85rem 1.25rem",
                background: "var(--bg-card)",
                border: "1px solid",
                borderColor: status === "running" ? "var(--accent-blue)" : "var(--border)",
                borderRadius: "var(--radius)",
                transition: "border-color 0.3s",
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{agent.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.2rem",
                  }}
                >
                  {agent.label}
                  <AgentStatusBadge status={status} />
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {statusMsg ?? agent.desc}
                </div>
              </div>
              {status === "running" && (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid transparent",
                    borderTopColor: "var(--accent-blue)",
                    borderRadius: "50%",
                    animation: "cf-spin 0.8s linear infinite",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes cf-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
