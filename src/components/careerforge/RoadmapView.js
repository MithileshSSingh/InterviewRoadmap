"use client";
import { useState } from "react";
import RoadmapHeader from "./RoadmapHeader";
import RoleIntelCard from "./RoleIntelCard";
import InterviewRoundsCard from "./InterviewRoundsCard";
import SalaryIntelCard from "./SalaryIntelCard";
import PeopleIntelCard from "./PeopleIntelCard";
import LearningPhases from "./LearningPhases";
import SystemDesignSection from "./SystemDesignSection";
import BehavioralSection from "./BehavioralSection";
import CompanyIntelSection from "./CompanyIntelSection";
import { exportRoadmap } from "@/lib/careerforge/export";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "learning", label: "Study Plan" },
  { key: "interview", label: "Interview" },
  { key: "networking", label: "Networking" },
];

const EXPORT_OPTIONS = [
  { label: "📄 Export as JSON", format: "json" },
  { label: "📝 Export as Markdown", format: "markdown" },
  { label: "🖨️ Export as PDF", format: "pdf" },
  { label: "📃 Export as Word .doc", format: "doc" },
];

export default function RoadmapView({ roadmap, roadmapId }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [phases, setPhases] = useState(roadmap?.phases ?? []);
  const [exportOpen, setExportOpen] = useState(false);

  if (!roadmap) return null;

  function handleTopicToggle(topicId, completed) {
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        topics: phase.topics.map((t) =>
          t.id === topicId ? { ...t, completed } : t,
        ),
      })),
    );
  }

  function handleExport(format) {
    exportRoadmap({ ...roadmap, phases }, format);
    setExportOpen(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <RoadmapHeader meta={roadmap.meta} />

      {/* Export button + tab row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Tabs */}
        <div className="cf-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setExportOpen(false);
              }}
              style={{
                flex: "1 0 auto",
                padding: "0.5rem 1rem",
                borderRadius: "calc(var(--radius) - 2px)",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                background:
                  activeTab === tab.key ? "var(--bg-card)" : "transparent",
                color:
                  activeTab === tab.key
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Export dropdown */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setExportOpen((o) => !o)}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: exportOpen ? "var(--bg-card)" : "transparent",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            ↓ Export
          </button>

          {exportOpen && (
            <>
              <div
                onClick={() => setExportOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 9 }}
              />
              <ExportDropdown
                options={EXPORT_OPTIONS}
                onSelect={handleExport}
              />
            </>
          )}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div>
          <RoleIntelCard roleIntel={roadmap.roleIntel} />
          <SalaryIntelCard
            salaryIntel={roadmap.salaryIntel}
            userLevel={roadmap.meta?.experienceLevel}
          />
          <CompanyIntelSection companyIntel={roadmap.companyIntel} />
        </div>
      )}

      {activeTab === "learning" && (
        <div>
          <LearningPhases
            phases={phases}
            roadmapId={roadmapId}
            onTopicToggle={handleTopicToggle}
          />
        </div>
      )}

      {activeTab === "interview" && (
        <div>
          <InterviewRoundsCard interviewProcess={roadmap.interviewProcess} />
          <SystemDesignSection systemDesign={roadmap.systemDesign} />
          <BehavioralSection behavioral={roadmap.behavioral} />
        </div>
      )}

      {activeTab === "networking" && (
        <div>
          <PeopleIntelCard peopleIntel={roadmap.peopleIntel} />
        </div>
      )}
    </div>
  );
}

// Reusable dropdown menu — used both here and in history cards
export function ExportDropdown({ options, onSelect }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        right: 0,
        zIndex: 10,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "0.3rem",
        minWidth: 210,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      }}
    >
      {options.map(({ label, format }) => (
        <button
          key={format}
          onClick={() => onSelect(format)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "0.55rem 0.85rem",
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            borderRadius: "calc(var(--radius) - 2px)",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-secondary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
