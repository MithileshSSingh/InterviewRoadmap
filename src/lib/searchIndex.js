import { getAllRoadmaps } from "@/data/roadmaps";
import { getRoadmapPhases } from "@/data";

// Build index once at module init (static data never changes)
const INDEX = [];

for (const roadmap of getAllRoadmaps()) {
  INDEX.push({
    type: "roadmap",
    slug: roadmap.slug,
    title: roadmap.title,
    emoji: roadmap.emoji,
    description: roadmap.description,
    url: `/roadmap/${roadmap.slug}`,
  });

  const phases = getRoadmapPhases(roadmap.slug) ?? [];
  for (const phase of phases) {
    for (const topic of phase.topics ?? []) {
      INDEX.push({
        type: "topic",
        roadmapSlug: roadmap.slug,
        roadmapTitle: roadmap.title,
        roadmapEmoji: roadmap.emoji,
        phaseId: phase.id,
        phaseName: phase.title,
        topicId: topic.id,
        topicTitle: topic.title,
        snippet: (topic.explanation ?? "").slice(0, 200),
        url: `/roadmap/${roadmap.slug}/${phase.id}/${topic.id}`,
      });
    }
  }
}

export function searchIndex(query, limit = 20) {
  if (!query?.trim()) return [];
  const words = query.toLowerCase().trim().split(/\s+/);

  const scored = INDEX.map((entry) => {
    const titleField = (entry.topicTitle ?? entry.title ?? "").toLowerCase();
    const bodyField = (entry.snippet ?? entry.description ?? "").toLowerCase();
    let score = 0;
    for (const w of words) {
      if (titleField.includes(w)) score += 3;
      if (bodyField.includes(w)) score += 1;
    }
    return { entry, score };
  }).filter(({ score }) => score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ entry }) => entry);
}
