"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Quiz from "@/components/Quiz";
import { getQuizzesForPhase } from "@/data/quizzes";

export default function PhaseAssessment({ slug, phase }) {
  const [mounted, setMounted] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const topicIds = useMemo(
    () => phase.topics.map((t) => t.id),
    [phase.topics],
  );

  const topicGrouping = useMemo(() => {
    const map = {};
    phase.topics.forEach((t) => {
      map[t.id] = t.title;
    });
    return map;
  }, [phase.topics]);

  useEffect(() => {
    setMounted(true);
    const staticQuestions = getQuizzesForPhase(slug, topicIds);
    if (staticQuestions) {
      setQuestions(staticQuestions);
    }
  }, [slug, topicIds]);

  const handleStartAssessment = useCallback(async () => {
    if (questions) {
      setShowAssessment(true);
      return;
    }

    // Generate quizzes for topics without static data
    setIsGenerating(true);
    setError(null);
    try {
      const generated = [];
      for (const topic of phase.topics) {
        const res = await fetch("/api/quiz/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            phaseId: phase.id,
            topicId: topic.id,
            difficulty: "intermediate",
            count: 3,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          generated.push(
            ...data.questions.map((q) => ({ ...q, topicId: topic.id })),
          );
        }
      }
      if (generated.length > 0) {
        setQuestions(generated);
        setShowAssessment(true);
      } else {
        setError("Failed to generate assessment. Please try again.");
      }
    } catch {
      setError("Failed to generate assessment. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [questions, phase.topics]);

  if (!mounted) return null;

  if (showAssessment && questions) {
    return (
      <div className="phase-assessment-container">
        <Quiz
          questions={questions}
          topicGrouping={topicGrouping}
          onRetake={() => setShowAssessment(false)}
        />
      </div>
    );
  }

  return (
    <div className="phase-assessment-trigger">
      {isGenerating ? (
        <div className="quiz-generate-card">
          <div className="quiz-generating">
            <span className="chatbot-typing">
              <span className="chatbot-dot"></span>
              <span className="chatbot-dot"></span>
              <span className="chatbot-dot"></span>
            </span>
            <p>Preparing phase assessment...</p>
          </div>
        </div>
      ) : (
        <>
          <button
            className="quiz-btn quiz-btn-primary quiz-btn-large"
            onClick={handleStartAssessment}
          >
            Take Phase Assessment
          </button>
          {error && <p className="quiz-error">{error}</p>}
        </>
      )}
    </div>
  );
}
