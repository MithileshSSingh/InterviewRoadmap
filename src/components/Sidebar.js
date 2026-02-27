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

  // Detect if we're inside a roadmap route
  const pathParts = pathname.split("/").filter(Boolean);
  const isInRoadmap = pathParts[0] === "roadmap" && pathParts[1];
  const currentSlug = isInRoadmap ? pathParts[1] : null;
  const roadmapMeta = currentSlug ? getRoadmapMeta(currentSlug) : null;
  const phases = currentSlug ? getRoadmapPhases(currentSlug) : null;
  const allRoadmaps = getAllRoadmaps();

  const togglePhase = (phaseId) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? "✕" : "☰"}
      </button>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <Link href="/" className="sidebar-logo" onClick={() => setMobileOpen(false)}>
          <span className="logo-icon">📚</span>
          <span className="logo-text">Learning Hub</span>
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
                    <span>{phase.emoji} {phase.title}</span>
                    <span className="expand-icon">{expandedPhase === phase.id ? "▾" : "▸"}</span>
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
          ) : (
            /* Roadmap list on landing page */
            <div className="sidebar-roadmap-list">
              <div className="sidebar-section-label">Roadmaps</div>
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
                  <span>{rm.emoji} {rm.title}</span>
                  {rm.comingSoon && <span className="sidebar-soon">Soon</span>}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <Link
          href="/settings"
          className={`sidebar-settings ${pathname === "/settings" ? "active" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          ⚙️ Settings
        </Link>
      </aside>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
