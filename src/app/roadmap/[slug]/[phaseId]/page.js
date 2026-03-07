import Link from "next/link";
import { getRoadmapPhases } from "@/data";
import { getRoadmapMeta } from "@/data/roadmaps";
import { notFound } from "next/navigation";
import PhaseAssessment from "@/components/PhaseAssessment";
import TopicCardList from "@/components/TopicCardList";
import MockInterviewBot from "@/components/MockInterviewBot";

export default async function PhasePage({ params }) {
  const { slug, phaseId } = await params;
  const meta = getRoadmapMeta(slug);
  const phases = getRoadmapPhases(slug);
  if (!meta || !phases) notFound();

  const phase = phases.find((p) => p.id === phaseId);
  if (!phase) notFound();

  function getExplanation(phase) {
    return `Assess my comprehensive knowledge of the ${phase.title} phase. Topics covered include: ${phase.topics.map((t) => t.title).join(", ")}.`;
  } 

  function getInterviewQuestions(phase) {
    return phase.topics.flatMap((t) => t.interviewQuestions || []);
  }

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

      <MockInterviewBot
        interviewConfig={{
          title: phase.title,
          explanation: getExplanation(phase),
          interviewQuestions: getInterviewQuestions(phase),
          type: "phase"
        }}
        metadata={{
          roadmapSlug: slug,
          phaseId: phase.id
        }}
      />
    </div>
  );
}
