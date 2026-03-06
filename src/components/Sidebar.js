"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRoadmapPhases } from "@/data";
import { getAllRoadmaps, getRoadmapMeta } from "@/data/roadmaps";

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect if we're inside a roadmap route or careerforge
  const pathParts = pathname.split("/").filter(Boolean);
  const isInRoadmap = pathParts[0] === "roadmap" && pathParts[1];
  const isInCareerForge = pathParts[0] === "careerforge";
  const currentSlug = isInRoadmap ? pathParts[1] : null;
  const roadmapMeta = currentSlug ? getRoadmapMeta(currentSlug) : null;
  const phases = currentSlug ? getRoadmapPhases(currentSlug) : null;
  const allRoadmaps = getAllRoadmaps();

  const togglePhase = (phaseId) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <Link
          href="/"
          className="sidebar-logo"
          onClick={() => setMobileOpen(false)}
        >
          <span className="logo-icon">📚</span>
          <span className="logo-text">Interview Roadmaps</span>
        </Link>

        <nav className="sidebar-nav">
          {isInRoadmap && roadmapMeta && phases ? (
            <>
              {/* Back to all roadmaps */}
              <Link
                href="/"
                className="sidebar-back"
                onClick={() => setMobileOpen(false)}
              >
                ← All Roadmaps
              </Link>

              {/* Current roadmap title */}
              <Link
                href={`/roadmap/${currentSlug}`}
                className="sidebar-roadmap-title"
                onClick={() => setMobileOpen(false)}
              >
                {roadmapMeta.emoji} {roadmapMeta.title}
              </Link>

              {/* Phase navigation */}
              {phases.map((phase) => (
                <div key={phase.id} className="nav-phase">
                  <button
                    className={`nav-phase-btn ${expandedPhase === phase.id ? "expanded" : ""}`}
                    onClick={() => togglePhase(phase.id)}
                  >
                    <span>
                      {phase.emoji} {phase.title}
                    </span>
                    <span className="expand-icon">
                      {expandedPhase === phase.id ? "▾" : "▸"}
                    </span>
                  </button>
                  {expandedPhase === phase.id && (
                    <ul className="nav-topics">
                      {phase.topics.map((topic) => {
                        const href = `/roadmap/${currentSlug}/${phase.id}/${topic.id}`;
                        const isActive = pathname === href;
                        return (
                          <li key={topic.id}>
                            <Link
                              href={href}
                              className={`nav-topic-link ${isActive ? "active" : ""}`}
                              onClick={() => setMobileOpen(false)}
                            >
                              {topic.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </>
          ) : isInCareerForge ? (
            /* CareerForge context */
            <>
              <Link
                href="/careerforge"
                className="sidebar-back"
                onClick={() => setMobileOpen(false)}
              >
                ← Roadmap AI
              </Link>
              <div className="sidebar-roadmap-title">🤖 Roadmap AI</div>
              <p
                style={{
                  padding: "0 0.75rem",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                AI-powered career roadmaps with interview intel, salary data,
                and a phased study plan.
              </p>
            </>
          ) : (
            /* Roadmap list on landing page */
            <div className="sidebar-roadmap-list">
              <div className="sidebar-section-label">AI Tools</div>
              <Link
                href="/careerforge"
                className={`sidebar-roadmap-link ${pathname.startsWith("/careerforge") ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <span>🤖 Roadmap AI</span>
                <span
                  className="sidebar-soon"
                  style={{
                    background: "var(--accent-blue)",
                    color: "var(--bg-primary)",
                  }}
                >
                  Beta
                </span>
              </Link>
              <div
                className="sidebar-section-label"
                style={{ marginTop: "0.75rem" }}
              >
                Roadmaps
              </div>
              {allRoadmaps.map((rm) => (
                <Link
                  key={rm.slug}
                  href={rm.comingSoon ? "#" : `/roadmap/${rm.slug}`}
                  className={`sidebar-roadmap-link ${rm.comingSoon ? "disabled" : ""} ${pathname.startsWith(`/roadmap/${rm.slug}`) ? "active" : ""}`}
                  onClick={(e) => {
                    if (rm.comingSoon) e.preventDefault();
                    else setMobileOpen(false);
                  }}
                >
                  <span>
                    {rm.emoji} {rm.title}
                  </span>
                  {rm.comingSoon && <span className="sidebar-soon">Soon</span>}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <Link
          href="/bookmarks"
          className={`sidebar-settings ${pathname === "/bookmarks" ? "active" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          🔖 Bookmarks
        </Link>
        <Link
          href="/settings"
          className={`sidebar-settings ${pathname === "/settings" ? "active" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          ⚙️ Settings
        </Link>
      </aside>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
