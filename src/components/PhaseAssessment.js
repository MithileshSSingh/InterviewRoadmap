"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Quiz from "@/components/Quiz";
import { getQuizzesForPhase } from "@/data/quizzes";

export default function PhaseAssessment({ slug, phase }) {
  const [mounted, setMounted] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [bestScore, setBestScore] = useState(null);
  const [assessmentPhase, setAssessmentPhase] = useState("quiz");
  const [forceEnd, setForceEnd] = useState(false);

  const storageKey = `phase-assessment-scores-${slug}`;
  const phaseId = phase.id;

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

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (showAssessment) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAssessment]);

  useEffect(() => {
    setMounted(true);

    // Load existing scores
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[phaseId]) {
          setBestScore(parsed[phaseId]);
        }
      }
    } catch {}

    const staticQuestions = getQuizzesForPhase(slug, topicIds);
    if (staticQuestions) {
      setQuestions(staticQuestions);
      return;
    }

    // Check localStorage cache for AI-generated quizzes
    try {
      const cacheKey = `phase-assessment-cache-${slug}-${phaseId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.generatedAt < 24 * 60 * 60 * 1000) {
          setQuestions(parsed.questions);
        }
      }
    } catch {}
  }, [slug, phaseId, topicIds, storageKey]);

  const handleStartAssessment = useCallback(async () => {
    if (questions) {
      setForceEnd(false);
      setAssessmentPhase("quiz");
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
        setForceEnd(false);
        setAssessmentPhase("quiz");
        setShowAssessment(true);
        
        // Cache in localStorage
        try {
          const cacheKey = `phase-assessment-cache-${slug}-${phaseId}`;
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ questions: generated, generatedAt: Date.now() }),
          );
        } catch {}
      } else {
        setError("Failed to generate assessment. Please try again.");
      }
    } catch {
      setError("Failed to generate assessment. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [questions, phase.topics, slug, phase.id, phaseId]);

  const handleAssessmentComplete = useCallback(
    (score, total) => {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const existing = stored[phaseId] || {
          bestScore: 0,
          attempts: 0,
        };
        const pct = Math.round((score / total) * 100);
        stored[phaseId] = {
          bestScore: Math.max(existing.bestScore, pct),
          attempts: existing.attempts + 1,
          lastAttempt: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(stored));
        setBestScore(stored[phaseId]);
      } catch {}
    },
    [storageKey, phaseId]
  );

  const handleCloseDialog = useCallback(() => {
    if (assessmentPhase === "results") {
      setShowAssessment(false);
      setForceEnd(false);
    } else {
      if (
        window.confirm(
          "Are you sure you want to end the assessment early? Your progress will be graded as-is."
        )
      ) {
        setForceEnd(true);
      }
    }
  }, [assessmentPhase]);

  if (!mounted) return null;

  return (
    <section className="phase-assessment-section">
      <h2 className="section-title">
        <span className="icon">📝</span> Phase Assessment
      </h2>

      {bestScore && (
        <div className="quiz-best-score">
          Best: {bestScore.bestScore}% ({bestScore.attempts} attempt
          {bestScore.attempts !== 1 ? "s" : ""})
        </div>
      )}

      {showAssessment && questions ? (
        mounted && createPortal(
          <>
            <div className="quiz-dialog-backdrop" onClick={handleCloseDialog} />
            <div className="quiz-dialog-container" role="dialog" aria-modal="true" aria-label={`${phase.title} Assessment`}>
              <div className="quiz-dialog-header">
                <h3 className="quiz-dialog-title">
                  <span className="icon">📝</span> {phase.title} Assessment
                </h3>
                <button 
                  className="quiz-dialog-close"
                  onClick={handleCloseDialog}
                  title="Close Assessment"
                  aria-label="Close Assessment"
                >
                  ✕
                </button>
              </div>
              <div className="quiz-dialog-content">
                <Quiz
                  questions={questions}
                  topicGrouping={topicGrouping}
                  onComplete={handleAssessmentComplete}
                  onRetake={() => {
                    setForceEnd(false);
                    setAssessmentPhase("quiz");
                  }}
                  onClose={handleCloseDialog}
                  forceEnd={forceEnd}
                  onPhaseChange={setAssessmentPhase}
                />
              </div>
            </div>
          </>,
          document.body
        )
      ) : questions ? (
        <div className="quiz-generate-card">
          <p className="quiz-generate-text">
            Test your understanding of the <strong>{phase.title}</strong> phase
          </p>
          <button
            className="quiz-btn quiz-btn-primary"
            onClick={() => {
              setForceEnd(false);
              setAssessmentPhase("quiz");
              setShowAssessment(true);
            }}
          >
            Take Phase Assessment
          </button>
        </div>
      ) : (
        <div className="quiz-generate-card">
          {isGenerating ? (
            <div className="quiz-generating">
              <span className="chatbot-typing">
                <span className="chatbot-dot"></span>
                <span className="chatbot-dot"></span>
                <span className="chatbot-dot"></span>
              </span>
              <p>Preparing phase assessment...</p>
            </div>
          ) : (
            <>
              <p className="quiz-generate-text">
                No assessment available yet for the <strong>{phase.title}</strong> phase
              </p>
              <button
                className="quiz-btn quiz-btn-primary"
                onClick={handleStartAssessment}
              >
                Generate Phase Assessment with AI
              </button>
              {error && <p className="quiz-error">{error}</p>}
            </>
          )}
        </div>
      )}
    </section>
  );
}
