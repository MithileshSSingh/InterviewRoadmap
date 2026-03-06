"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { getRoadmapPhases } from "@/data";
import { getRoadmapMeta } from "@/data/roadmaps";
import CodeBlock from "@/components/CodeBlock";
import Accordion from "@/components/Accordion";
import TopicChatBot from "@/components/TopicChatBot";
import TopicQuizSection from "@/components/TopicQuizSection";
import { useFeedback } from "@/components/FeedbackWidget";

import { marked } from "marked";

const CodePlayground = dynamic(() => import("@/components/CodePlayground"), {
  ssr: false,
});

function renderMarkdown(text) {
  if (!text) return null;
  // Some legacy data might still have literal string "\\n" instead of actual newlines
  const processed = text.replace(/\\n/g, "\n");
  return marked.parse(processed);
}

function normalizeLanguage(language) {
  if (!language) return "javascript";
  const lower = language.toLowerCase();
  if (lower === "js" || lower === "jsx" || lower === "javascript") {
    return "javascript";
  }
  if (lower === "ts" || lower === "tsx" || lower === "typescript") {
    return "typescript";
  }
  if (lower === "py" || lower === "python") {
    return "python";
  }
  return lower;
}

function parseCodeExample(rawCode) {
  const source = (rawCode || "").trim();
  if (!source) return { code: "", language: "javascript" };

  const fenced = source.match(/^```([a-zA-Z0-9+#-]*)\n?([\s\S]*?)```$/);
  if (fenced) {
    return {
      code: fenced[2].trim(),
      language: normalizeLanguage(fenced[1] || "javascript"),
    };
  }

  return { code: source, language: "javascript" };
}

function createExerciseStarter(topicTitle, exercise, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const cleanedExercise = (exercise || "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\\n/g, "\n")
    .slice(0, 220);

  if (normalizedLanguage === "python") {
    return `# ${topicTitle} - Practice
# Instructions:
# ${cleanedExercise || "Solve the exercise requirements below."}

def solution():
    # TODO: implement
    pass

if __name__ == "__main__":
    solution()
`;
  }

  if (normalizedLanguage === "typescript") {
    return `/**
 * ${topicTitle} - Practice
 * ${cleanedExercise || "Solve the exercise requirements below."}
 */

function solution(): void {
  // TODO: implement
}

solution();
`;
  }

  return `/**
 * ${topicTitle} - Practice
 * ${cleanedExercise || "Solve the exercise requirements below."}
 */

function solution() {
  // TODO: implement
}

solution();
`;
}

function TopicFeedback({ slug, phaseId, topicId }) {
  const feedback = useFeedback();
  const [voted, setVoted] = useState(null); // "up" | "down" | null

  async function handleThumbsUp() {
    setVoted("up");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "content",
          message: "Topic was helpful (thumbs up)",
          rating: 5,
          roadmapSlug: slug,
          phaseId,
          topicId,
          pagePath: window.location.pathname,
        }),
      });
    } catch {
      /* non-blocking */
    }
  }

  function handleThumbsDown() {
    setVoted("down");
    if (feedback) {
      feedback.openFeedback({
        type: "content",
        roadmapSlug: slug,
        phaseId,
        topicId,
      });
    }
  }

  function handleReport() {
    if (feedback) {
      feedback.openFeedback({
        type: "content",
        roadmapSlug: slug,
        phaseId,
        topicId,
      });
    }
  }

  return (
    <section className="feedback-contextual">
      <div className="feedback-contextual-inner">
        <span className="feedback-contextual-label">Was this topic helpful?</span>
        <div className="feedback-thumbs">
          <button
            type="button"
            className={`feedback-thumb ${voted === "up" ? "active" : ""}`}
            onClick={handleThumbsUp}
            disabled={voted !== null}
            aria-label="Helpful"
          >
            👍
          </button>
          <button
            type="button"
            className={`feedback-thumb ${voted === "down" ? "active" : ""}`}
            onClick={handleThumbsDown}
            disabled={voted !== null}
            aria-label="Not helpful"
          >
            👎
          </button>
        </div>
        {voted === "up" && (
          <span className="feedback-thanks">Thanks for your feedback!</span>
        )}
      </div>
      <button type="button" className="feedback-report-link" onClick={handleReport}>
        ⚑ Report an issue
      </button>
    </section>
  );
}

export default function TopicPage() {
  const params = useParams();
  const { slug, phaseId, topicId } = params;
  const [codeViewMode, setCodeViewMode] = useState("view");
  const [isExercisePlaygroundOpen, setIsExercisePlaygroundOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCodeViewMode("view");
        setIsExercisePlaygroundOpen(false);
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

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
  const nextTopic =
    topicIndex < phase.topics.length - 1 ? phase.topics[topicIndex + 1] : null;

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

  const parsedExample = parseCodeExample(topic.codeExample);
  const exerciseStarter = createExerciseStarter(
    topic.title,
    topic.exercise,
    parsedExample.language || "javascript",
  );

  return (
    <div className="topic-page">
      <div className="breadcrumb">
        <Link href="/">All Roadmaps</Link>
        <span>›</span>
        <Link href={`/roadmap/${slug}`}>
          {meta.emoji} {meta.title}
        </Link>
        <span>›</span>
        <Link href={`/roadmap/${slug}/${phase.id}`}>
          {phase.title.split(":")[0]}
        </Link>
        <span>›</span>
        <span>{topic.title}</span>
      </div>

      <h1>{topic.title}</h1>

      {/* Explanation */}
      <section className="section">
        <h2 className="section-title">
          <span className="icon">📖</span> Concept
        </h2>
        <div
          className="explanation"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(topic.explanation),
          }}
        />
      </section>

      {/* Code Example */}
      <section className="section">
        <h2 className="section-title">
          <span className="icon">💻</span> Code Example
        </h2>
        {!isMobile && (
          <div className="code-view-toggle" role="tablist" aria-label="Code view mode">
            <button
              type="button"
              role="tab"
              className={`code-view-toggle-btn ${codeViewMode === "view" ? "active" : ""}`}
              aria-selected={codeViewMode === "view"}
              onClick={() => setCodeViewMode("view")}
            >
              View
            </button>
            <button
              type="button"
              role="tab"
              className={`code-view-toggle-btn ${codeViewMode === "playground" ? "active" : ""}`}
              aria-selected={codeViewMode === "playground"}
              onClick={() => setCodeViewMode("playground")}
            >
              Playground
            </button>
          </div>
        )}
        {isMobile || codeViewMode === "view" ? (
          <CodeBlock code={parsedExample.code} language={parsedExample.language} />
        ) : (
          <Suspense fallback={<div className="playground-loading">Loading editor...</div>}>
            <CodePlayground
              key={`topic-example-${topic.id}-${parsedExample.language}`}
              code={parsedExample.code}
              language={parsedExample.language}
              height="460px"
            />
          </Suspense>
        )}
      </section>

      {/* Exercise */}
      <section className="section">
        <h2 className="section-title">
          <span className="icon">🏋️</span> Practice Exercise
        </h2>
        <div className="exercise-card">
          <div
            className="exercise-text"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.exercise) }}
          />
          {!isMobile && (
            <button
              type="button"
              className="exercise-try-btn"
              onClick={() => setIsExercisePlaygroundOpen((prev) => !prev)}
            >
              {isExercisePlaygroundOpen ? "Hide" : "Try it"}
            </button>
          )}
        </div>
        {!isMobile && isExercisePlaygroundOpen && (
          <div className="exercise-playground-wrap">
            <h3 className="exercise-playground-title">Exercise Playground</h3>
            <div
              className="exercise-playground-instructions"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.exercise) }}
            />
            <Suspense fallback={<div className="playground-loading">Loading editor...</div>}>
              <CodePlayground
                key={`exercise-${topic.id}-${parsedExample.language}`}
                code={exerciseStarter}
                language={parsedExample.language}
                height="480px"
              />
            </Suspense>
          </div>
        )}
      </section>

      {/* Common Mistakes */}
      <section className="section">
        <h2 className="section-title">
          <span className="icon">⚠️</span> Common Mistakes
        </h2>
        <ul className="mistakes-list">
          {topic.commonMistakes.map((mistake, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(mistake) }}
            />
          ))}
        </ul>
      </section>

      {/* Interview Questions */}
      <section className="section">
        <h2 className="section-title">
          <span className="icon">💼</span> Interview Questions
        </h2>
        <Accordion items={topic.interviewQuestions} />
      </section>

      {/* Quiz */}
      <TopicQuizSection
        slug={slug}
        phaseId={phaseId}
        topicId={topicId}
        topicTitle={topic.title}
      />

      {/* Topic Feedback */}
      <TopicFeedback slug={slug} phaseId={phaseId} topicId={topicId} />

      {/* Navigation */}
      <div className="topic-nav">
        {prevLink ? (
          <Link
            href={`/roadmap/${slug}/${prevLink.phase}/${prevLink.topic.id}`}
          >
            <span className="nav-label">← Previous</span>
            <span className="nav-title">{prevLink.topic.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {nextLink ? (
          <Link
            href={`/roadmap/${slug}/${nextLink.phase}/${nextLink.topic.id}`}
            style={{ textAlign: "right", marginLeft: "auto" }}
          >
            <span className="nav-label">Next →</span>
            <span className="nav-title">{nextLink.topic.title}</span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Topic Chatbot */}
      <TopicChatBot topicContent={topic} />
    </div>
  );
}
