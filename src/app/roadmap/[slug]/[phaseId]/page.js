import Link from "next/link";
import { getRoadmapPhases } from "@/data";
import { getRoadmapMeta } from "@/data/roadmaps";
import { notFound } from "next/navigation";

export default async function PhasePage({ params }) {
  const { slug, phaseId } = await params;
  const meta = getRoadmapMeta(slug);
  const phases = getRoadmapPhases(slug);
  if (!meta || !phases) notFound();

  const phase = phases.find((p) => p.id === phaseId);
  if (!phase) notFound();

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/">All Roadmaps</Link>
        <span>›</span>
        <Link href={`/roadmap/${slug}`}>{meta.emoji} {meta.title}</Link>
        <span>›</span>
        <span>{phase.emoji} {phase.title}</span>
      </div>

      <div className="phase-header">
        <h1>{phase.emoji} {phase.title}</h1>
        <p>{phase.description}</p>
      </div>

      <div className="topics-list">
        {phase.topics.map((topic, idx) => (
          <Link key={topic.id} href={`/roadmap/${slug}/${phase.id}/${topic.id}`} className="topic-card">
            <span className="topic-number">{idx + 1}</span>
            <h3>{topic.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
