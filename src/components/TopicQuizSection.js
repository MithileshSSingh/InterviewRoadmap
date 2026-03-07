"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Quiz from "@/components/Quiz";
import { getQuizForTopic } from "@/data/quizzes";

export default function TopicQuizSection({ slug, phaseId, topicId, topicTitle }) {
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [bestScore, setBestScore] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPhase, setQuizPhase] = useState("quiz");
  const [forceEnd, setForceEnd] = useState(false);

  const storageKey = `quiz-scores-${slug}`;

  // Lock body scroll when quiz dialog is open
  useEffect(() => {
    if (showQuiz) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showQuiz]);

  useEffect(() => {
    setMounted(true);

    // Load existing scores
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[topicId]) {
          setBestScore(parsed[topicId]);
        }
      }
    } catch {}

    // Check for static quiz data
    const staticQuiz = getQuizForTopic(slug, topicId);
    if (staticQuiz) {
      setQuestions(staticQuiz.questions);
      return;
    }

    // Check localStorage cache for AI-generated quizzes
    try {
      const cacheKey = `quiz-cache-${slug}-${topicId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.generatedAt < 24 * 60 * 60 * 1000) {
          setQuestions(parsed.questions);
        }
      }
    } catch {}
  }, [slug, topicId, storageKey]);

  const handleGenerateQuiz = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, phaseId, topicId, difficulty: "intermediate", count: 5 }),
      });
      if (!res.ok) throw new Error("Failed to generate quiz");
      const data = await res.json();
      setQuestions(data.questions);
      setForceEnd(false);
      setQuizPhase("quiz");
      setShowQuiz(true);

      // Cache in localStorage
      try {
        const cacheKey = `quiz-cache-${slug}-${topicId}`;
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ questions: data.questions, generatedAt: Date.now() }),
        );
      } catch {}
    } catch {
      setError("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [slug, phaseId, topicId]);

  const handleQuizComplete = useCallback(
    (score, total) => {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const existing = stored[topicId] || {
          bestScore: 0,
          attempts: 0,
        };
        const pct = Math.round((score / total) * 100);
        stored[topicId] = {
          bestScore: Math.max(existing.bestScore, pct),
          attempts: existing.attempts + 1,
          lastAttempt: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(stored));
        setBestScore(stored[topicId]);
      } catch {}
    },
    [storageKey, topicId],
  );

  const handleCloseDialog = useCallback(() => {
    if (quizPhase === "results") {
      setShowQuiz(false);
      setForceEnd(false);
    } else {
      if (
        window.confirm(
          "Are you sure you want to end the quiz early? Your progress will be graded as-is."
        )
      ) {
        setForceEnd(true);
      }
    }
  }, [quizPhase]);

  if (!mounted) return null;

  return (
    <section className="section">
      <h2 className="section-title">
        <span className="icon">📝</span> Quiz
      </h2>

      {bestScore && (
        <div className="quiz-best-score">
          Best: {bestScore.bestScore}% ({bestScore.attempts} attempt
          {bestScore.attempts !== 1 ? "s" : ""})
        </div>
      )}

      {showQuiz && questions ? (
        mounted && createPortal(
          <>
            <div className="quiz-dialog-backdrop" onClick={handleCloseDialog} />
            <div className="quiz-dialog-container" role="dialog" aria-modal="true" aria-label={`${topicTitle} Quiz`}>
              <div className="quiz-dialog-header">
                <h3 className="quiz-dialog-title">
                  <span className="icon">📝</span> {topicTitle} Quiz
                </h3>
                <button 
                  className="quiz-dialog-close"
                  onClick={handleCloseDialog}
                  title="Close Quiz"
                  aria-label="Close Quiz"
                >
                  ✕
                </button>
              </div>
              <div className="quiz-dialog-content">
                <Quiz
                  questions={questions}
                  onComplete={handleQuizComplete}
                  onRetake={() => {
                    setForceEnd(false);
                    setQuizPhase("quiz");
                  }}
                  onClose={handleCloseDialog}
                  forceEnd={forceEnd}
                  onPhaseChange={setQuizPhase}
                />
              </div>
            </div>
          </>,
          document.body
        )
      ) : questions ? (
        <div className="quiz-generate-card">
          <p className="quiz-generate-text">
            Test your understanding of {topicTitle}
          </p>
          <button
            className="quiz-btn quiz-btn-primary"
            onClick={() => {
              setForceEnd(false);
              setQuizPhase("quiz");
              setShowQuiz(true);
            }}
          >
            Test Your Knowledge
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
              <p>Generating quiz questions...</p>
            </div>
          ) : (
            <>
              <p className="quiz-generate-text">
                No quiz available yet for {topicTitle}
              </p>
              <button
                className="quiz-btn quiz-btn-primary"
                onClick={handleGenerateQuiz}
              >
                Generate Quiz with AI
              </button>
              {error && <p className="quiz-error">{error}</p>}
            </>
          )}
        </div>
      )}
    </section>
  );
}
