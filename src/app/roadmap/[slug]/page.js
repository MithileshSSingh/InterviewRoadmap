import Link from "next/link";
import { getRoadmapPhases } from "@/data";
import { getRoadmapMeta } from "@/data/roadmaps";
import { notFound } from "next/navigation";

export default async function RoadmapPage({ params }) {
  const { slug } = await params;
  const meta = getRoadmapMeta(slug);
  const phases = getRoadmapPhases(slug);
  if (!meta || !phases) notFound();

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/">All Roadmaps</Link>
        <span>›</span>
        <span>{meta.emoji} {meta.title}</span>
      </div>

      <div className="hero">
        <h1>{meta.emoji} {meta.title} Roadmap</h1>
        <p>{meta.description}</p>
      </div>

      <div className="phases-grid">
        {phases.map((phase) => (
          <Link key={phase.id} href={`/roadmap/${slug}/${phase.id}`} className="phase-card">
            <div className="phase-card-emoji">{phase.emoji}</div>
            <h3>{phase.title}</h3>
            <p>{phase.description}</p>
            <span className="phase-card-count">{phase.topics.length} topics →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
