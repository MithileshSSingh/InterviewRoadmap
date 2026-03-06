"use client";
import { useReducer, useCallback, useMemo } from "react";
import CodeBlock from "@/components/CodeBlock";

const initialState = {
  phase: "quiz", // "quiz" | "feedback" | "results"
  currentIndex: 0,
  selectedAnswer: null,
  answers: [], // [{ questionIndex, selected, correct, timeSpent }]
  startTime: Date.now(),
  questionStartTime: Date.now(),
};

function quizReducer(state, action) {
  switch (action.type) {
    case "SELECT_ANSWER":
      return { ...state, selectedAnswer: action.payload };
    case "SHOW_FEEDBACK":
      return {
        ...state,
        phase: "feedback",
        answers: [
          ...state.answers,
          {
            questionIndex: state.currentIndex,
            selected: state.selectedAnswer,
            correct: action.payload.correct,
            timeSpent: Date.now() - state.questionStartTime,
          },
        ],
      };
    case "NEXT_QUESTION":
      if (state.currentIndex >= action.payload.totalQuestions - 1) {
        return { ...state, phase: "results", selectedAnswer: null };
      }
      return {
        ...state,
        phase: "quiz",
        currentIndex: state.currentIndex + 1,
        selectedAnswer: null,
        questionStartTime: Date.now(),
      };
    case "RESET":
      return {
        ...initialState,
        startTime: Date.now(),
        questionStartTime: Date.now(),
      };
    default:
      return state;
  }
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function Quiz({
  questions,
  topicGrouping = null,
  onComplete,
  onRetake,
}) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const currentQuestion = questions[state.currentIndex];
  const progress = ((state.currentIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = useCallback(
    (index) => {
      if (state.phase !== "quiz") return;
      dispatch({ type: "SELECT_ANSWER", payload: index });
    },
    [state.phase],
  );

  const handleConfirm = useCallback(() => {
    if (state.selectedAnswer === null) return;
    const correct = state.selectedAnswer === currentQuestion.correctAnswer;
    dispatch({ type: "SHOW_FEEDBACK", payload: { correct } });
  }, [state.selectedAnswer, currentQuestion]);

  const handleNext = useCallback(() => {
    const isLast = state.currentIndex >= questions.length - 1;
    dispatch({
      type: "NEXT_QUESTION",
      payload: { totalQuestions: questions.length },
    });
    if (isLast) {
      const score = state.answers.filter((a) => a.correct).length + (state.answers[state.answers.length - 1]?.correct ? 0 : 0);
      // Score is computed from answers array which already includes the current answer
      const finalScore = state.answers.filter((a) => a.correct).length;
      onComplete?.(finalScore, questions.length);
    }
  }, [state.currentIndex, state.answers, questions.length, onComplete]);

  const score = useMemo(
    () => state.answers.filter((a) => a.correct).length,
    [state.answers],
  );

  const totalTime = useMemo(
    () => state.answers.reduce((sum, a) => sum + a.timeSpent, 0),
    [state.answers],
  );

  const scorePercent = useMemo(
    () => Math.round((score / questions.length) * 100),
    [score, questions.length],
  );

  // Results screen
  if (state.phase === "results") {
    return (
      <div className="quiz-container">
        <div className="quiz-results">
          <div className="quiz-score-circle">
            <span className="quiz-score-number">{score}</span>
            <span className="quiz-score-total">/ {questions.length}</span>
          </div>
          <p className="quiz-score-percent">{scorePercent}%</p>
          <p className="quiz-time">Completed in {formatTime(totalTime)}</p>

          {topicGrouping && (
            <div className="quiz-topic-breakdown">
              <h3 className="quiz-review-title">Per-Topic Breakdown</h3>
              {Object.entries(topicGrouping).map(([topicId, topicTitle]) => {
                const topicAnswers = state.answers.filter(
                  (a) => questions[a.questionIndex]?.topicId === topicId,
                );
                const topicCorrect = topicAnswers.filter(
                  (a) => a.correct,
                ).length;
                if (topicAnswers.length === 0) return null;
                return (
                  <div key={topicId} className="quiz-topic-score">
                    <span>{topicTitle}</span>
                    <span>
                      {topicCorrect}/{topicAnswers.length}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="quiz-review">
            <h3 className="quiz-review-title">Review Answers</h3>
            {questions.map((q, idx) => {
              const answer = state.answers[idx];
              return (
                <div
                  key={idx}
                  className={`quiz-review-item ${answer?.correct ? "quiz-review-correct" : "quiz-review-incorrect"}`}
                >
                  <p className="quiz-review-question">
                    Q{idx + 1}: {q.question}
                  </p>
                  <p className="quiz-review-answer">
                    Your answer: {q.options[answer?.selected]}
                    {!answer?.correct &&
                      ` | Correct: ${q.options[q.correctAnswer]}`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="quiz-actions">
            <button
              className="quiz-btn quiz-btn-primary"
              onClick={() => {
                dispatch({ type: "RESET" });
                onRetake?.();
              }}
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz / Feedback screen
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="quiz-progress-text">
          Question {state.currentIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="quiz-body">
        <p className="quiz-question-text">{currentQuestion.question}</p>

        {currentQuestion.code && (
          <div className="quiz-code-block">
            <CodeBlock code={currentQuestion.code} />
          </div>
        )}

        <div className="quiz-options">
          {currentQuestion.options.map((option, idx) => {
            let optionClass = "quiz-option";
            if (state.phase === "feedback") {
              if (idx === currentQuestion.correctAnswer)
                optionClass += " quiz-option-correct";
              else if (idx === state.selectedAnswer)
                optionClass += " quiz-option-incorrect";
            } else if (idx === state.selectedAnswer) {
              optionClass += " quiz-option-selected";
            }
            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => handleSelectAnswer(idx)}
                disabled={state.phase === "feedback"}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="quiz-option-text">{option}</span>
              </button>
            );
          })}
        </div>

        {state.phase === "quiz" && (
          <button
            className="quiz-btn quiz-btn-primary quiz-confirm-btn"
            onClick={handleConfirm}
            disabled={state.selectedAnswer === null}
          >
            Confirm Answer
          </button>
        )}

        {state.phase === "feedback" && (
          <div className="quiz-feedback">
            <div
              className={`quiz-feedback-badge ${
                state.answers[state.answers.length - 1]?.correct
                  ? "quiz-feedback-correct"
                  : "quiz-feedback-incorrect"
              }`}
            >
              {state.answers[state.answers.length - 1]?.correct
                ? "Correct!"
                : "Incorrect"}
            </div>
            <p className="quiz-feedback-explanation">
              {currentQuestion.explanation}
            </p>
            <button
              className="quiz-btn quiz-btn-primary"
              onClick={handleNext}
            >
              {state.currentIndex < questions.length - 1
                ? "Next Question"
                : "See Results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
