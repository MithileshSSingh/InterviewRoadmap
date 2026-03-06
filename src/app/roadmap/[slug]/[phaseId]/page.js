import Link from "next/link";
import { getRoadmapPhases } from "@/data";
import { getRoadmapMeta } from "@/data/roadmaps";
import { notFound } from "next/navigation";
import PhaseAssessment from "@/components/PhaseAssessment";
import TopicCardList from "@/components/TopicCardList";

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
        <Link href={`/roadmap/${slug}`}>
          {meta.emoji} {meta.title}
        </Link>
        <span>›</span>
        <span>
          {phase.emoji} {phase.title}
        </span>
      </div>

      <div className="phase-header">
        <h1>
          {phase.emoji} {phase.title}
        </h1>
        <p>{phase.description}</p>
      </div>

      <TopicCardList
        topics={phase.topics}
        slug={slug}
        phaseId={phase.id}
        phaseTitle={phase.title}
        roadmapTitle={meta.title}
        roadmapEmoji={meta.emoji}
      />

      <PhaseAssessment slug={slug} phase={phase} />
    </div>
  );
}
