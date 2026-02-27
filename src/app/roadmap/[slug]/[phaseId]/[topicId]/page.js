"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRoadmapPhases } from "@/data";
import { getRoadmapMeta } from "@/data/roadmaps";
import CodeBlock from "@/components/CodeBlock";
import Accordion from "@/components/Accordion";

function renderMarkdown(text) {
  if (!text) return null;
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\\n/g, '\n');
}

export default function TopicPage() {
  const params = useParams();
  const { slug, phaseId, topicId } = params;

  const meta = getRoadmapMeta(slug);
  const phases = getRoadmapPhases(slug);
  if (!meta || !phases) return <div>Roadmap not found</div>;

  const phase = phases.find((p) => p.id === phaseId);
  if (!phase) return <div>Phase not found</div>;

  const topicIndex = phase.topics.findIndex((t) => t.id === topicId);
  const topic = phase.topics[topicIndex];
  if (!topic) return <div>Topic not found</div>;

  // Prev/next within phase
  const prevTopic = topicIndex > 0 ? phase.topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < phase.topics.length - 1 ? phase.topics[topicIndex + 1] : null;

  let prevLink = prevTopic ? { phase: phase.id, topic: prevTopic } : null;
  let nextLink = nextTopic ? { phase: phase.id, topic: nextTopic } : null;

  // Cross-phase navigation
  if (!prevTopic) {
    const phaseIdx = phases.findIndex((p) => p.id === phase.id);
    if (phaseIdx > 0) {
      const prevPhase = phases[phaseIdx - 1];
      const lastTopic = prevPhase.topics[prevPhase.topics.length - 1];
      prevLink = { phase: prevPhase.id, topic: lastTopic };
    }
  }
  if (!nextTopic) {
    const phaseIdx = phases.findIndex((p) => p.id === phase.id);
    if (phaseIdx < phases.length - 1) {
      const nextPhase = phases[phaseIdx + 1];
      const firstTopic = nextPhase.topics[0];
      nextLink = { phase: nextPhase.id, topic: firstTopic };
    }
  }

  return (
    <div className="topic-page">
      <div className="breadcrumb">
        <Link href="/">All Roadmaps</Link>
        <span>›</span>
        <Link href={`/roadmap/${slug}`}>{meta.emoji} {meta.title}</Link>
        <span>›</span>
        <Link href={`/roadmap/${slug}/${phase.id}`}>{phase.title.split(":")[0]}</Link>
        <span>›</span>
        <span>{topic.title}</span>
      </div>

      <h1>{topic.title}</h1>

      {/* Explanation */}
      <section className="section">
        <h2 className="section-title"><span className="icon">📖</span> Concept</h2>
        <div className="explanation" dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.explanation) }} />
      </section>

      {/* Code Example */}
      <section className="section">
        <h2 className="section-title"><span className="icon">💻</span> Code Example</h2>
        <CodeBlock code={topic.codeExample} />
      </section>

      {/* Exercise */}
      <section className="section">
        <h2 className="section-title"><span className="icon">🏋️</span> Practice Exercise</h2>
        <div className="exercise-card">
          <div className="exercise-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.exercise) }} />
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="section">
        <h2 className="section-title"><span className="icon">⚠️</span> Common Mistakes</h2>
        <ul className="mistakes-list">
          {topic.commonMistakes.map((mistake, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: renderMarkdown(mistake) }} />
          ))}
        </ul>
      </section>

      {/* Interview Questions */}
      <section className="section">
        <h2 className="section-title"><span className="icon">💼</span> Interview Questions</h2>
        <Accordion items={topic.interviewQuestions} />
      </section>

      {/* Navigation */}
      <div className="topic-nav">
        {prevLink ? (
          <Link href={`/roadmap/${slug}/${prevLink.phase}/${prevLink.topic.id}`}>
            <span className="nav-label">← Previous</span>
            <span className="nav-title">{prevLink.topic.title}</span>
          </Link>
        ) : <div />}
        {nextLink ? (
          <Link href={`/roadmap/${slug}/${nextLink.phase}/${nextLink.topic.id}`} style={{ textAlign: "right", marginLeft: "auto" }}>
            <span className="nav-label">Next →</span>
            <span className="nav-title">{nextLink.topic.title}</span>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
