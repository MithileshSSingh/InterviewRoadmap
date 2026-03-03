"use client";
import { useState } from "react";
import TopicCard from "./TopicCard";

export default function LearningPhases({
  phases = [],
  roadmapId,
  onTopicToggle,
}) {
  const [openPhase, setOpenPhase] = useState(0); // first phase open by default

  if (!phases.length) return null;

  return (
    <section style={{ marginBottom: "1.25rem" }}>
      <h2 style={headingStyle}>📚 Learning Phases</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {phases.map((phase, idx) => {
          const completedCount =
            phase.topics?.filter((t) => t.completed).length ?? 0;
          const total = phase.topics?.length ?? 0;
          const pct =
            total > 0 ? Math.round((completedCount / total) * 100) : 0;
          const isOpen = openPhase === idx;

          return (
            <div
              key={phase.phaseNumber}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
              }}
            >
              {/* Phase header */}
              <button
                onClick={() => setOpenPhase(isOpen ? -1 : idx)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  borderBottom: isOpen ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--accent-blue)22",
                    color: "var(--accent-blue)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  {phase.phaseNumber}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {phase.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {phase.durationWeeks} weeks · {total} topics · {pct}%
                    complete
                  </div>
                </div>

                {/* Phase progress mini-bar */}
                <div
                  style={{
                    width: 60,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color:
                        pct === 100
                          ? "var(--accent-blue)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {pct}%
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: 4,
                      background: "var(--border)",
                      borderRadius: 999,
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: "var(--accent-blue)",
                        borderRadius: 999,
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                </div>

                <span
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>

              {/* Phase content */}
              {isOpen && (
                <div style={{ padding: "1rem 1.25rem" }}>
                  {phase.description && (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                        marginBottom: "1rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {phase.description}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem",
                    }}
                  >
                    {phase.topics?.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        roadmapId={roadmapId}
                        onToggle={onTopicToggle}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

const headingStyle = {
  fontSize: "1.1rem",
  fontWeight: 700,
  marginBottom: "0.75rem",
};
