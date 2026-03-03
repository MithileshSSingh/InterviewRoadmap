"use client";
import { useState } from "react";
import ResourceList from "./ResourceList";

const DIFFICULTY_COLORS = {
  easy: "#10b981",
  medium: "#f59e0b",
  hard: "#ef4444",
};

const CATEGORY_LABELS = {
  dsa: "DS&A",
  system_design: "System Design",
  behavioral: "Behavioral",
  domain_specific: "Domain",
};

export default function TopicCard({ topic, roadmapId, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);

  const diffColor =
    DIFFICULTY_COLORS[topic.difficulty?.toLowerCase()] ?? "#6366f1";
  const catLabel = CATEGORY_LABELS[topic.category] ?? topic.category;

  async function handleCheck(e) {
    const checked = e.target.checked;
    setCompleting(true);
    try {
      await fetch(`/api/careerforge/${roadmapId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, completed: checked }),
      });
      onToggle?.(topic.id, checked);
    } catch {
      // revert
      e.target.checked = !checked;
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid",
        borderColor: topic.completed ? "var(--accent-blue)55" : "var(--border)",
        borderRadius: "var(--radius)",
        padding: "1rem",
        opacity: topic.completed ? 0.75 : 1,
        transition: "opacity 0.2s, border-color 0.2s",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
      >
        {/* Completion checkbox */}
        <input
          type="checkbox"
          checked={topic.completed}
          onChange={handleCheck}
          disabled={completing}
          style={{
            width: 17,
            height: 17,
            marginTop: 3,
            cursor: "pointer",
            accentColor: "var(--accent-blue)",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1 }}>
          {/* Topic name + badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "0.4rem",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: topic.completed ? "line-through" : "none",
                color: topic.completed
                  ? "var(--text-secondary)"
                  : "var(--text-primary)",
              }}
            >
              {topic.name}
            </span>
            <span style={badgeStyle(diffColor)}>{topic.difficulty}</span>
            <span style={badgeStyle("var(--text-secondary)")}>{catLabel}</span>
            <span
              style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}
            >
              ~{topic.estimatedHours}h
            </span>
          </div>

          {/* Subtopics */}
          {topic.subtopics?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.3rem",
                marginBottom: "0.5rem",
              }}
            >
              {topic.subtopics.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.15rem 0.5rem",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    color: "var(--text-secondary)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Resources toggle */}
          {topic.resources?.length > 0 && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-blue)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                {expanded ? "▾ Hide" : "▸ Show"} {topic.resources.length}{" "}
                resource{topic.resources.length !== 1 ? "s" : ""}
              </button>
              {expanded && (
                <div style={{ marginTop: "0.5rem" }}>
                  <ResourceList resources={topic.resources} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function badgeStyle(color) {
  return {
    fontSize: "0.68rem",
    fontWeight: 700,
    padding: "0.1rem 0.45rem",
    borderRadius: 999,
    background: color + "22",
    color: color,
    textTransform: "capitalize",
  };
}
