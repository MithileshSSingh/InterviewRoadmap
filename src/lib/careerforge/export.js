// Shared export utilities for CareerForge roadmaps
// All functions are pure — accept roadmap data, return nothing / trigger download.

export function buildSlug(roadmap) {
  return `${roadmap.meta.company}-${roadmap.meta.role}`
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildMarkdown(roadmap) {
  const rm = roadmap;
  const lines = [];

  lines.push(`# ${rm.meta.role} at ${rm.meta.company} — Career Roadmap`);
  lines.push(
    `**Experience:** ${rm.meta.experienceLevel} | **Prep Time:** ${rm.meta.totalWeeks} weeks | **Generated:** ${new Date(rm.meta.generatedAt).toLocaleDateString()}\n`,
  );

  // Role Intel
  lines.push(`## Role Intel`);
  if (rm.roleIntel.description) lines.push(`${rm.roleIntel.description}\n`);
  if (rm.roleIntel.requiredSkills?.length)
    lines.push(
      `**Required Skills:** ${rm.roleIntel.requiredSkills.join(", ")}`,
    );
  if (rm.roleIntel.keyResponsibilities?.length) {
    lines.push(`\n**Key Responsibilities:**`);
    rm.roleIntel.keyResponsibilities.forEach((r) => lines.push(`- ${r}`));
  }
  if (rm.roleIntel.niceToHave?.length)
    lines.push(`\n**Nice to Have:** ${rm.roleIntel.niceToHave.join(", ")}`);
  lines.push("");

  // Interview Process
  lines.push(
    `## Interview Process (${rm.interviewProcess.totalRounds} rounds — ${rm.interviewProcess.timeline})`,
  );
  if (rm.interviewProcess.rounds?.length) {
    lines.push(`| Round | Type | Duration | Focus |`);
    lines.push(`|-------|------|----------|-------|`);
    rm.interviewProcess.rounds.forEach((r) =>
      lines.push(`| ${r.round} | ${r.type} | ${r.duration} | ${r.focus} |`),
    );
  }
  lines.push("");

  // Salary
  lines.push(`## Salary Intelligence (${rm.salaryIntel.location})`);
  if (rm.salaryIntel.levels?.length) {
    lines.push(`| Level | Base | Total Comp | Equity (4yr) | Bonus |`);
    lines.push(`|-------|------|-----------|--------------|-------|`);
    rm.salaryIntel.levels.forEach((l) =>
      lines.push(
        `| ${l.level} | ${l.base} | ${l.totalComp} | ${l.equity4yr} | ${l.bonus} |`,
      ),
    );
  }
  const salSources = rm.salaryIntel.sources?.join(", ") || "LLM estimate";
  lines.push(`*Sources: ${salSources} — ${rm.salaryIntel.lastUpdated}*\n`);

  // Study Plan
  lines.push(`## Study Plan`);
  (rm.phases ?? []).forEach((phase) => {
    lines.push(
      `\n### Phase ${phase.phaseNumber}: ${phase.title} (${phase.durationWeeks} weeks)`,
    );
    if (phase.description) lines.push(phase.description);
    phase.topics.forEach((topic) => {
      const check = topic.completed ? "x" : " ";
      lines.push(
        `\n- [${check}] **${topic.name}** | ${topic.difficulty} | ~${topic.estimatedHours}h`,
      );
      if (topic.subtopics?.length)
        lines.push(`  - Subtopics: ${topic.subtopics.join(", ")}`);
      if (topic.resources?.length) {
        lines.push(`  - Resources:`);
        topic.resources.forEach((r) =>
          lines.push(
            `    - [${r.title}](${r.url}) (${r.free ? "free" : "paid"})`,
          ),
        );
      }
    });
  });
  lines.push("");

  // System Design
  lines.push(`## System Design`);
  if (rm.systemDesign.topics?.length)
    lines.push(`**Topics:** ${rm.systemDesign.topics.join(", ")}`);
  if (rm.systemDesign.keyConcepts?.length)
    lines.push(`**Key Concepts:** ${rm.systemDesign.keyConcepts.join(", ")}`);
  if (rm.systemDesign.resources?.length) {
    lines.push(`**Resources:**`);
    rm.systemDesign.resources.forEach((r) =>
      lines.push(`- [${r.title}](${r.url})`),
    );
  }
  lines.push("");

  // Behavioral
  lines.push(`## Behavioral Prep (${rm.behavioral.framework} Framework)`);
  if (rm.behavioral.companyValues?.length)
    lines.push(`**Company Values:** ${rm.behavioral.companyValues.join(", ")}`);
  if (rm.behavioral.keyThemes?.length)
    lines.push(`**Key Themes:** ${rm.behavioral.keyThemes.join(", ")}`);
  if (rm.behavioral.sampleQuestions?.length) {
    lines.push(`\n**Sample Questions:**`);
    rm.behavioral.sampleQuestions.forEach((q) => lines.push(`- ${q}`));
  }
  lines.push("");

  // Networking
  lines.push(`## Networking Strategy`);
  if (rm.peopleIntel.strategy) lines.push(rm.peopleIntel.strategy);
  if (rm.peopleIntel.referralSearches?.length) {
    lines.push(`\n**LinkedIn Searches:**`);
    rm.peopleIntel.referralSearches.forEach((s) =>
      lines.push(`- [${s.label}](${s.url}) — ${s.description}`),
    );
  }
  if (rm.peopleIntel.tips?.length) {
    lines.push(`\n**Outreach Tips:**`);
    rm.peopleIntel.tips.forEach((t) => lines.push(`- ${t}`));
  }
  lines.push("");

  // Company Intel
  lines.push(`## Company Intel`);
  lines.push(`**Hiring Timeline:** ${rm.companyIntel.hiringTimeline}`);
  if (rm.companyIntel.tips?.length) {
    lines.push(`**Tips:**`);
    rm.companyIntel.tips.forEach((t) => lines.push(`- ${t}`));
  }

  return lines.join("\n");
}

function buildHtmlBody(roadmap) {
  const rm = roadmap;
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const roundRows = (rm.interviewProcess.rounds ?? [])
    .map(
      (r) =>
        `<tr><td>${esc(r.round)}</td><td>${esc(r.type)}</td><td>${esc(r.duration)}</td><td>${esc(r.focus)}</td></tr>`,
    )
    .join("");

  const salRows = (rm.salaryIntel.levels ?? [])
    .map(
      (l) =>
        `<tr><td>${esc(l.level)}</td><td>${esc(l.base)}</td><td>${esc(l.totalComp)}</td><td>${esc(l.equity4yr)}</td><td>${esc(l.bonus)}</td></tr>`,
    )
    .join("");

  const phasesHtml = (rm.phases ?? [])
    .map((phase) => {
      const topicsHtml = phase.topics
        .map((topic) => {
          const check = topic.completed ? "&#10003;" : "&#9633;";
          const resourcesHtml = topic.resources?.length
            ? `<ul style="margin:0.2rem 0 0 1.2rem">${topic.resources
                .map(
                  (r) =>
                    `<li><a href="${esc(r.url)}">${esc(r.title)}</a> (${r.free ? "free" : "paid"})</li>`,
                )
                .join("")}</ul>`
            : "";
          const subtopicsHtml = topic.subtopics?.length
            ? `<div style="color:#555;font-size:0.85rem">Subtopics: ${topic.subtopics.map(esc).join(", ")}</div>`
            : "";
          return `<li style="margin:0.5rem 0"><strong>${check} ${esc(topic.name)}</strong> &nbsp;<span style="color:#666">${esc(topic.difficulty)} · ~${esc(topic.estimatedHours)}h</span>${subtopicsHtml}${resourcesHtml}</li>`;
        })
        .join("");
      return `<h3>${esc(phase.title)} <span style="font-weight:400;color:#666">(Phase ${esc(phase.phaseNumber)} · ${esc(phase.durationWeeks)} weeks)</span></h3><p style="color:#555">${esc(phase.description)}</p><ul>${topicsHtml}</ul>`;
    })
    .join("");

  const sdResourcesHtml = (rm.systemDesign.resources ?? [])
    .map((r) => `<li><a href="${esc(r.url)}">${esc(r.title)}</a></li>`)
    .join("");

  const linkedInHtml = (rm.peopleIntel.referralSearches ?? [])
    .map(
      (s) =>
        `<li><a href="${esc(s.url)}">${esc(s.label)}</a> — ${esc(s.description)}</li>`,
    )
    .join("");

  return `
    <h1 style="font-size:2rem;margin-bottom:0.25rem">${esc(rm.meta.role)} at ${esc(rm.meta.company)}</h1>
    <p style="color:#555;margin-bottom:2rem"><strong>${esc(rm.meta.experienceLevel)}</strong> · ${esc(rm.meta.totalWeeks)} weeks prep · Generated ${new Date(rm.meta.generatedAt).toLocaleDateString()}</p>

    <h2>Role Intel</h2>
    <p>${esc(rm.roleIntel.description)}</p>
    <p><strong>Required Skills:</strong> ${(rm.roleIntel.requiredSkills ?? []).map(esc).join(", ")}</p>
    ${rm.roleIntel.keyResponsibilities?.length ? `<p><strong>Key Responsibilities:</strong></p><ul>${rm.roleIntel.keyResponsibilities.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
    ${rm.roleIntel.niceToHave?.length ? `<p><strong>Nice to Have:</strong> ${rm.roleIntel.niceToHave.map(esc).join(", ")}</p>` : ""}

    <h2>Interview Process <span style="font-weight:400;font-size:1rem;color:#555">(${esc(rm.interviewProcess.totalRounds)} rounds · ${esc(rm.interviewProcess.timeline)})</span></h2>
    ${roundRows ? `<table><thead><tr><th>Round</th><th>Type</th><th>Duration</th><th>Focus</th></tr></thead><tbody>${roundRows}</tbody></table>` : ""}

    <h2>Salary Intelligence <span style="font-weight:400;font-size:1rem;color:#555">(${esc(rm.salaryIntel.location)})</span></h2>
    ${salRows ? `<table><thead><tr><th>Level</th><th>Base</th><th>Total Comp</th><th>Equity (4yr)</th><th>Bonus</th></tr></thead><tbody>${salRows}</tbody></table>` : ""}
    <p style="color:#777;font-size:0.85rem">Sources: ${(rm.salaryIntel.sources ?? []).join(", ") || "LLM estimate"} · ${esc(rm.salaryIntel.lastUpdated)}</p>

    <h2>Study Plan</h2>
    ${phasesHtml}

    <h2>System Design</h2>
    ${rm.systemDesign.topics?.length ? `<p><strong>Topics:</strong> ${rm.systemDesign.topics.map(esc).join(", ")}</p>` : ""}
    ${rm.systemDesign.keyConcepts?.length ? `<p><strong>Key Concepts:</strong> ${rm.systemDesign.keyConcepts.map(esc).join(", ")}</p>` : ""}
    ${sdResourcesHtml ? `<p><strong>Resources:</strong></p><ul>${sdResourcesHtml}</ul>` : ""}

    <h2>Behavioral Prep <span style="font-weight:400;font-size:1rem;color:#555">(${esc(rm.behavioral.framework)})</span></h2>
    ${rm.behavioral.companyValues?.length ? `<p><strong>Company Values:</strong> ${rm.behavioral.companyValues.map(esc).join(", ")}</p>` : ""}
    ${rm.behavioral.keyThemes?.length ? `<p><strong>Key Themes:</strong> ${rm.behavioral.keyThemes.map(esc).join(", ")}</p>` : ""}
    ${rm.behavioral.sampleQuestions?.length ? `<p><strong>Sample Questions:</strong></p><ul>${rm.behavioral.sampleQuestions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>` : ""}

    <h2>Networking Strategy</h2>
    <p>${esc(rm.peopleIntel.strategy)}</p>
    ${linkedInHtml ? `<p><strong>LinkedIn Searches:</strong></p><ul>${linkedInHtml}</ul>` : ""}
    ${rm.peopleIntel.tips?.length ? `<p><strong>Outreach Tips:</strong></p><ul>${rm.peopleIntel.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}

    <h2>Company Intel</h2>
    <p><strong>Hiring Timeline:</strong> ${esc(rm.companyIntel.hiringTimeline)}</p>
    ${rm.companyIntel.tips?.length ? `<ul>${rm.companyIntel.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
  `;
}

export function buildPrintHtml(roadmap) {
  const body = buildHtmlBody(roadmap);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${roadmap.meta.role} at ${roadmap.meta.company} — Career Roadmap</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; padding: 2.5rem; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.8rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1.2rem; margin: 2rem 0 0.6rem; padding-bottom: 0.3rem; border-bottom: 2px solid #e5e7eb; page-break-after: avoid; }
  h3 { font-size: 1rem; margin: 1.2rem 0 0.3rem; page-break-after: avoid; }
  p { margin: 0.4rem 0; }
  ul { margin: 0.4rem 0 0.4rem 1.5rem; }
  li { margin: 0.25rem 0; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.875rem; }
  th { background: #f3f4f6; padding: 0.5rem 0.75rem; text-align: left; border: 1px solid #d1d5db; }
  td { padding: 0.45rem 0.75rem; border: 1px solid #d1d5db; }
  tr:nth-child(even) td { background: #f9fafb; }
  @media print {
    @page { margin: 1.5cm; }
    body { padding: 0; }
    a { color: #2563eb; text-decoration: none; }
  }
</style>
</head>
<body>${body}</body>
</html>`;
}

export function buildWordHtml(roadmap) {
  const body = buildHtmlBody(roadmap);
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40"
      lang="en">
<head>
<meta charset="UTF-8" />
<title>${roadmap.meta.role} at ${roadmap.meta.company} — Career Roadmap</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; margin: 2cm; }
  h1 { font-size: 20pt; }
  h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 4pt; margin-top: 18pt; }
  h3 { font-size: 12pt; margin-top: 12pt; }
  p { margin: 4pt 0; }
  ul { margin: 4pt 0 4pt 18pt; }
  li { margin: 2pt 0; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; font-size: 10pt; }
  th { background: #f3f4f6; padding: 4pt 6pt; border: 1px solid #ccc; text-align: left; }
  td { padding: 4pt 6pt; border: 1px solid #ccc; }
</style>
</head>
<body>${body}</body>
</html>`;
}

/**
 * Trigger export for a given roadmap + format.
 * format: "json" | "markdown" | "pdf" | "doc"
 */
export function exportRoadmap(roadmap, format) {
  const slug = buildSlug(roadmap);

  if (format === "json") {
    downloadFile(
      JSON.stringify(roadmap, null, 2),
      `${slug}-roadmap.json`,
      "application/json",
    );
  } else if (format === "markdown") {
    downloadFile(buildMarkdown(roadmap), `${slug}-roadmap.md`, "text/markdown");
  } else if (format === "pdf") {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(buildPrintHtml(roadmap));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  } else if (format === "doc") {
    downloadFile(
      buildWordHtml(roadmap),
      `${slug}-roadmap.doc`,
      "application/msword",
    );
  }
}
