"use client";
import { useState } from "react";
import { marked } from 'marked';

export default function Accordion({ items, type = "interview" }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const typeLabels = {
    conceptual: { label: "Conceptual", color: "#60a5fa" },
    tricky: { label: "Tricky Output", color: "#f59e0b" },
    coding: { label: "Coding", color: "#34d399" },
    scenario: { label: "Scenario", color: "#a78bfa" },
  };

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const badge = typeLabels[item.type] || typeLabels.conceptual;
        return (
          <div key={index} className={`accordion-item ${openIndex === index ? "open" : ""}`}>
            <button className="accordion-header" onClick={() => toggle(index)}>
              <div className="accordion-title">
                <span className="q-badge" style={{ background: badge.color + "22", color: badge.color }}>
                  {badge.label}
                </span>
                <span className="q-label">Q{index + 1}:</span>
                <span>{item.q.split("\n")[0]}</span>
              </div>
              <span className="accordion-icon">{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && (
              <div className="accordion-body">
                {item.q.includes("```") && (
                  <div className="q-full markdown-body" dangerouslySetInnerHTML={{ __html: marked.parse(item.q.replace(/\\n/g, '\n')) }} />
                )}
                <div className="answer">
                  <strong>Answer:</strong>
                  <div className="answer-text" dangerouslySetInnerHTML={{ __html: marked.parse(item.a.replace(/\\n/g, '\n')) }} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
