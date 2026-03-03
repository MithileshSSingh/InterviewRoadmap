"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { exportRoadmap } from "@/lib/careerforge/export";
import { ExportDropdown } from "@/components/careerforge/RoadmapView";

const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior", "Staff", "Principal"];

const ROLE_SUGGESTIONS = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Machine Learning Engineer",
  "Data Engineer",
  "DevOps Engineer",
  "Product Manager",
  "Engineering Manager",
];

const COMPANY_SUGGESTIONS = [
  "Google",
  "Meta",
  "Amazon",
  "Apple",
  "Microsoft",
  "Netflix",
  "Stripe",
  "Airbnb",
  "Uber",
  "Spotify",
];

function getOrCreateSessionId() {
  let id = localStorage.getItem("cf-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cf-session-id", id);
  }
  return id;
}

export default function CareerForgePage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [exportOpenId, setExportOpenId] = useState(null); // id of card whose dropdown is open
  const [exportLoadingId, setExportLoadingId] = useState(null); // id of card currently fetching

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    fetchHistory(sid);
  }, []);

  async function fetchHistory(sid) {
    try {
      const res = await fetch(`/api/careerforge/history?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.roadmaps ?? []);
      }
    } catch {
      // silently fail
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!role.trim() || !company.trim()) {
      setError("Please enter both a role and a company.");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/careerforge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role.trim(),
          company: company.trim(),
          experienceLevel,
          sessionId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to start generation");
      }

      const { id } = await res.json();
      router.push(`/careerforge/${id}`);
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  }

  async function handleCardExport(id, format, e) {
    e.preventDefault();
    e.stopPropagation();
    setExportOpenId(null);
    setExportLoadingId(id);
    try {
      const res = await fetch(`/api/careerforge/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const roadmap = data.roadmap?.result;
      if (roadmap) exportRoadmap(roadmap, format);
    } catch {
      // silently fail
    } finally {
      setExportLoadingId(null);
    }
  }

  async function handleDelete(id, e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`/api/careerforge/${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // silently fail
    }
  }

  const statusColor = (status) => {
    if (status === "complete") return "var(--accent-blue)";
    if (status === "error") return "#ef4444";
    return "var(--text-secondary)";
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Hero */}
      <div
        className="hero"
        style={{ textAlign: "center", marginBottom: "2.5rem" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🤖</div>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>
          Roadmap AI
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Enter a role and company to generate a personalized AI career roadmap
          — interview process, salary data, LinkedIn referral strategy, and a
          phased study plan.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {/* Role input */}
          <div>
            <label
              htmlFor="role"
              style={{
                display: "block",
                marginBottom: "0.4rem",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Job Role
            </label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              list="role-suggestions"
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <datalist id="role-suggestions">
              {ROLE_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          {/* Company input */}
          <div>
            <label
              htmlFor="company"
              style={{
                display: "block",
                marginBottom: "0.4rem",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Company
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              list="company-suggestions"
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <datalist id="company-suggestions">
              {COMPANY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Experience Level */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Experience Level
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setExperienceLevel(level)}
                  disabled={isGenerating}
                  style={{
                    padding: "0.45rem 1rem",
                    borderRadius: "var(--radius)",
                    border: "1px solid",
                    borderColor:
                      experienceLevel === level
                        ? "var(--accent-blue)"
                        : "var(--border)",
                    background:
                      experienceLevel === level
                        ? "var(--accent-blue)"
                        : "var(--bg-secondary)",
                    color:
                      experienceLevel === level
                        ? "var(--bg-primary)"
                        : "var(--text-primary)",
                    cursor: "pointer",
                    fontWeight: experienceLevel === level ? 700 : 400,
                    fontSize: "0.9rem",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p
            style={{ color: "#ef4444", marginTop: "1rem", fontSize: "0.9rem" }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          style={{
            marginTop: "1.5rem",
            width: "100%",
            padding: "0.85rem",
            background: "var(--accent-blue)",
            color: "var(--bg-primary)",
            border: "none",
            borderRadius: "var(--radius)",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: isGenerating ? "not-allowed" : "pointer",
            opacity: isGenerating ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {isGenerating ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  border: "2px solid transparent",
                  borderTopColor: "var(--bg-primary)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Generating...
            </>
          ) : (
            "Generate My Roadmap →"
          )}
        </button>
      </form>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "var(--text-secondary)",
            }}
          >
            Recent Roadmaps
          </h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <Link
                  href={`/careerforge/${item.id}`}
                  style={{ flex: 1, textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    {item.role} at {item.company}
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        fontSize: "0.75rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: statusColor(item.status) + "22",
                        color: statusColor(item.status),
                        fontWeight: 600,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.experienceLevel} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </Link>
                {/* Export button — only for completed roadmaps */}
                {item.status === "complete" && (
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExportOpenId(
                          exportOpenId === item.id ? null : item.id,
                        );
                      }}
                      title="Export"
                      style={{
                        background: "none",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        color:
                          exportLoadingId === item.id
                            ? "var(--text-muted)"
                            : "var(--text-secondary)",
                        cursor:
                          exportLoadingId === item.id
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        padding: "0.25rem 0.6rem",
                        whiteSpace: "nowrap",
                      }}
                      disabled={exportLoadingId === item.id}
                    >
                      {exportLoadingId === item.id ? "..." : "↓ Export"}
                    </button>

                    {exportOpenId === item.id && (
                      <>
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExportOpenId(null);
                          }}
                          style={{ position: "fixed", inset: 0, zIndex: 9 }}
                        />
                        <ExportDropdown
                          options={[
                            { label: "📄 Export as JSON", format: "json" },
                            {
                              label: "📝 Export as Markdown",
                              format: "markdown",
                            },
                            { label: "🖨️ Export as PDF", format: "pdf" },
                            { label: "📃 Export as Word .doc", format: "doc" },
                          ]}
                          onSelect={(format) =>
                            handleCardExport(item.id, format, {
                              preventDefault: () => {},
                              stopPropagation: () => {},
                            })
                          }
                        />
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  title="Delete"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    padding: "0.25rem",
                    opacity: 0.6,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: var(--accent-blue) !important; }
      `}</style>
    </div>
  );
}
