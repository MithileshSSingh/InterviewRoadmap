"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { streamChatResponse } from "@/lib/chatClient";

function renderMarkdown(text) {
  return marked.parse(text, { async: false });
}

function parseScore(text) {
  const match = text.match(/SCORE:\s*(\d+(?:\.\d+)?)\/10/i);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return isNaN(val) ? null : Math.min(10, Math.max(0, val));
}

function parseFreeformScore(text) {
  const match = text.match(/OVERALL SCORE:\s*(\d+(?:\.\d+)?)\/10/i);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return isNaN(val) ? null : Math.min(10, Math.max(0, val));
}

function scoreColorClass(score) {
  if (score === null) return "";
  if (score >= 7) return "interview-score-badge--green";
  if (score >= 5) return "interview-score-badge--yellow";
  return "interview-score-badge--red";
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  let sid = localStorage.getItem("cf-session-id");
  if (!sid) {
    sid = `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("cf-session-id", sid);
  }
  return sid;
}

function buildGuidedEvaluationMessages(question, userAnswer, topicTitle) {
  return [
    {
      role: "system",
      content: `You are a senior technical interviewer evaluating an interview answer.
Topic: ${topicTitle}
Question: ${question.q}
Expected answer: ${question.a}

Evaluate the candidate's answer. Respond with exactly this format:
SCORE: X/10

[2-3 sentences of specific feedback on what was correct and what was missing or incomplete]

KEY POINTS MISSED:
- [Only list if key concepts were missing; omit section if answer was complete]`,
    },
    {
      role: "user",
      content: userAnswer,
    },
  ];
}

function buildFreeformSystemPrompt(topicContent) {
  const questions = (topicContent.interviewQuestions ?? [])
    .map((q) => `- ${q.q}`)
    .join("\n");
  const explanation = (topicContent.explanation ?? "").slice(0, 500);

  return `You are a senior technical interviewer conducting a mock interview on "${topicContent.title}".

Topic background: ${explanation}

Sample questions to draw from (adapt freely, ask follow-ups):
${questions || "Ask general questions about the topic."}

Instructions:
- Start with a brief 1-sentence introduction, then ask your first question
- Ask one question at a time and wait for the candidate's response
- Probe deeper when answers are vague or incomplete
- After 5–7 questions, or when the candidate says they are done, conclude with a summary in this exact format:
OVERALL SCORE: X/10
[2-3 sentences on strengths and areas for improvement]`;
}

export default function MockInterviewBot({ topicContent, topicId, roadmapSlug, phaseId }) {
  const questions = topicContent?.interviewQuestions ?? [];
  const hasGuidedContent = questions.length > 0;

  // ── UI state machine ──
  const [phase, setPhase] = useState("idle"); // idle | mode-select | guided | freeform | complete
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null); // "guided" | "freeform"

  // ── Guided state ──
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationText, setEvaluationText] = useState("");
  const [parsedScore, setParsedScore] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  // ── Freeform state ──
  const [chatMessages, setChatMessages] = useState([]);
  const [freeformInput, setFreeformInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // ── Complete state ──
  const [summary, setSummary] = useState("");
  const [freeformFinalScore, setFreeformFinalScore] = useState(null);

  // ── Save state ──
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error

  // ── Refs ──
  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ── Keyboard close ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // ── Auto-scroll freeform chat ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Focus textarea in guided mode ──
  useEffect(() => {
    if (phase === "guided" && !isEvaluating && !evaluationText) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [phase, currentQuestionIndex, isEvaluating, evaluationText]);

  function handleOpen() {
    setIsOpen(true);
    if (phase === "idle" || phase === "complete") {
      resetState(false);
      setPhase("mode-select");
    }
  }

  function handleClose() {
    abortRef.current?.abort();
    setIsOpen(false);
  }

  function resetState(fullReset = true) {
    if (fullReset) {
      abortRef.current?.abort();
      setMode(null);
      setPhase("mode-select");
    }
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setIsEvaluating(false);
    setEvaluationText("");
    setParsedScore(null);
    setAnsweredQuestions([]);
    setChatMessages([]);
    setFreeformInput("");
    setIsStreaming(false);
    setSummary("");
    setFreeformFinalScore(null);
    setSaveStatus("idle");
  }

  // ── Mode selection ──
  function startGuidedMode() {
    setMode("guided");
    setPhase("guided");
  }

  function startFreeformMode() {
    setMode("freeform");
    setPhase("freeform");
    startFreeformInterview();
  }

  // ── Guided mode: submit answer ──
  async function submitAnswer() {
    if (!userAnswer.trim() || isEvaluating) return;

    const question = questions[currentQuestionIndex];
    setIsEvaluating(true);
    setEvaluationText("");
    setParsedScore(null);

    const msgs = buildGuidedEvaluationMessages(question, userAnswer, topicContent.title);
    const controller = new AbortController();
    abortRef.current = controller;

    let finalText = "";
    const result = await streamChatResponse({
      messages: msgs,
      signal: controller.signal,
      onToken: (_token, fullContent) => {
        finalText = fullContent;
        setEvaluationText(fullContent);
        setParsedScore(parseScore(fullContent));
      },
    });

    abortRef.current = null;
    setIsEvaluating(false);

    if (result.status === "aborted") return;

    const score = parseScore(finalText);
    setAnsweredQuestions((prev) => [
      ...prev,
      {
        questionIndex: currentQuestionIndex,
        question,
        userAnswer,
        score,
        feedback: finalText,
      },
    ]);
  }

  // ── Guided mode: advance to next question or finish ──
  function advanceGuided() {
    const next = currentQuestionIndex + 1;
    if (next < questions.length) {
      setCurrentQuestionIndex(next);
      setUserAnswer("");
      setEvaluationText("");
      setParsedScore(null);
    } else {
      finishGuided();
    }
  }

  function finishGuided() {
    setPhase("complete");
    saveSession(null, "guided");
  }

  // ── Freeform mode: start interview ──
  async function startFreeformInterview() {
    setIsStreaming(true);
    const systemMsg = buildFreeformSystemPrompt(topicContent);
    const openingMessages = [
      { role: "system", content: systemMsg },
      { role: "user", content: "Please introduce yourself briefly and ask your first interview question." },
    ];

    setChatMessages([{ role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    const result = await streamChatResponse({
      messages: openingMessages,
      signal: controller.signal,
      onToken: (_token, fullContent) => {
        setChatMessages([{ role: "assistant", content: fullContent }]);
      },
    });

    abortRef.current = null;
    setIsStreaming(false);

    if (result.status === "aborted") return;
    setChatMessages([{ role: "assistant", content: result.content }]);
  }

  // ── Freeform mode: send message ──
  async function sendFreeformMessage() {
    const text = freeformInput.trim();
    if (!text || isStreaming) return;

    const newUserMsg = { role: "user", content: text };
    const updatedHistory = [...chatMessages, newUserMsg];
    const assistantIndex = updatedHistory.length;
    setChatMessages([...updatedHistory, { role: "assistant", content: "" }]);
    setFreeformInput("");
    setIsStreaming(true);

    const systemMsg = buildFreeformSystemPrompt(topicContent);
    const apiMessages = [
      { role: "system", content: systemMsg },
      ...updatedHistory,
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    const result = await streamChatResponse({
      messages: apiMessages,
      signal: controller.signal,
      onToken: (_token, fullContent) => {
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = { role: "assistant", content: fullContent };
          return updated;
        });
      },
    });

    abortRef.current = null;
    setIsStreaming(false);
    if (result.status === "aborted") return;

    setChatMessages((prev) => {
      const updated = [...prev];
      updated[assistantIndex] = { role: "assistant", content: result.content };
      return updated;
    });
  }

  // ── Freeform mode: end interview → generate summary ──
  async function endInterview() {
    // Abort any in-progress stream first
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(true);
    setSummary("");
    // Show a transition message in chat so the user sees something happening
    setChatMessages((prev) => [
      ...prev.filter((m) => m.content !== ""),
      { role: "assistant", content: "" },
    ]);

    const systemMsg = buildFreeformSystemPrompt(topicContent);
    const summaryMessages = [
      { role: "system", content: systemMsg },
      ...chatMessages,
      {
        role: "user",
        content:
          "The interview is now over. Please provide your final assessment and overall score using the format: OVERALL SCORE: X/10",
      },
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    const result = await streamChatResponse({
      messages: summaryMessages,
      signal: controller.signal,
      onToken: (_token, fullContent) => {
        setSummary(fullContent);
        // Stream summary into the last chat bubble so user sees it live
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: fullContent };
          return updated;
        });
      },
    });

    abortRef.current = null;
    setIsStreaming(false);
    if (result.status === "aborted") return;

    setSummary(result.content);
    const score = parseFreeformScore(result.content);
    setFreeformFinalScore(score);
    setPhase("complete");
    saveSession(result.content, "freeform");
  }

  // ── Save session to DB ──
  const saveSession = useCallback(
    async (summaryText, sessionMode) => {
      if (saveStatus === "saving" || saveStatus === "saved") return;
      setSaveStatus("saving");

      const localSessionId = getOrCreateSessionId();
      const effectiveMode = sessionMode ?? mode;
      const currentAnswered = answeredQuestions;

      let avgScore = null;
      let allMessages = [];

      if (effectiveMode === "guided") {
        const scored = currentAnswered.filter((q) => q.score !== null);
        if (scored.length > 0) {
          avgScore = scored.reduce((sum, q) => sum + q.score, 0) / scored.length;
        }
        allMessages = currentAnswered.map((q) => ({
          role: "user",
          content: q.userAnswer,
          score: q.score,
          feedback: q.feedback,
          questionIndex: q.questionIndex,
        }));
      } else {
        allMessages = chatMessages.map((m) => ({ role: m.role, content: m.content })).slice(0, 50);
        avgScore = freeformFinalScore;
      }

      try {
        const res = await fetch("/api/interview/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicId,
            topicTitle: topicContent.title,
            roadmapSlug,
            phaseId,
            mode: effectiveMode,
            score: avgScore,
            summary: summaryText ?? summary ?? null,
            messages: allMessages,
            sessionId: localSessionId,
          }),
        });

        setSaveStatus(res.ok ? "saved" : "error");
      } catch {
        setSaveStatus("error");
      }
    },
    [saveStatus, mode, answeredQuestions, chatMessages, freeformFinalScore, summary, topicId, topicContent?.title, roadmapSlug, phaseId],
  );

  // ── Derived guided sub-state ──
  const guidedSubState = isEvaluating ? "evaluating" : evaluationText ? "evaluated" : "asking";

  const guidedAvgScore =
    answeredQuestions.length > 0
      ? (() => {
          const scored = answeredQuestions.filter((q) => q.score !== null);
          return scored.length > 0
            ? scored.reduce((sum, q) => sum + q.score, 0) / scored.length
            : null;
        })()
      : null;

  // ── Render ──
  return (
    <>
      {/* Floating action button */}
      {!isOpen && (
        <button className="mock-interview-fab" onClick={handleOpen} aria-label="Start mock interview">
          Practice Interview
        </button>
      )}

      {/* Drawer */}
      {isOpen && (
        <>
          <div className="mock-interview-backdrop" onClick={handleClose} />
          <div className="mock-interview-drawer" role="dialog" aria-label="Mock Interview" aria-modal="true">
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <span className="chatbot-header-icon">🎤</span>
                <div>
                  <h3 className="chatbot-title">Mock Interview</h3>
                  <p className="chatbot-subtitle">{topicContent?.title}</p>
                </div>
              </div>
              <div className="chatbot-header-actions">
                {phase === "freeform" && (
                  <button
                    className="chatbot-action-btn"
                    onClick={endInterview}
                    title="End Interview"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                  >
                    End
                  </button>
                )}
                <button className="chatbot-action-btn" onClick={handleClose} title="Close">
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="mock-interview-body">
              {phase === "mode-select" && (
                <div className="interview-mode-select">
                  <p className="interview-mode-intro">
                    Choose how to practice <strong>{topicContent?.title}</strong>
                  </p>
                  <div className="interview-mode-cards">
                    <button
                      className="interview-mode-card"
                      onClick={startGuidedMode}
                      disabled={!hasGuidedContent}
                      title={!hasGuidedContent ? "No practice questions available for this topic" : undefined}
                    >
                      <span className="interview-mode-card-icon">📋</span>
                      <h4>Guided Q&amp;A</h4>
                      <p>
                        {hasGuidedContent
                          ? `Answer ${questions.length} questions step-by-step. Each answer is scored.`
                          : "No practice questions available for this topic."}
                      </p>
                    </button>
                    <button className="interview-mode-card" onClick={startFreeformMode}>
                      <span className="interview-mode-card-icon">💬</span>
                      <h4>Free-form Interview</h4>
                      <p>Conversational interview with an AI interviewer. Open-ended probing questions.</p>
                    </button>
                  </div>
                </div>
              )}

              {phase === "guided" && (
                <div className="interview-guided-panel">
                  {/* Progress */}
                  <div className="interview-progress-bar-wrap">
                    <span className="interview-progress-label">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <div className="interview-progress-bar">
                      <div
                        className="interview-progress-fill"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Type badge */}
                  {questions[currentQuestionIndex]?.type && (
                    <span
                      className={`interview-type-badge interview-type-badge--${questions[currentQuestionIndex].type}`}
                    >
                      {questions[currentQuestionIndex].type}
                    </span>
                  )}

                  {/* Question */}
                  <div className="interview-question-card">{questions[currentQuestionIndex]?.q}</div>

                  {/* Answer textarea */}
                  <textarea
                    ref={textareaRef}
                    className="interview-answer-textarea"
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={guidedSubState !== "asking"}
                    rows={4}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey && guidedSubState === "asking") submitAnswer();
                    }}
                  />

                  {/* Submit button */}
                  {guidedSubState === "asking" && (
                    <button
                      className="interview-submit-btn"
                      onClick={submitAnswer}
                      disabled={!userAnswer.trim()}
                    >
                      Submit Answer
                    </button>
                  )}

                  {/* Evaluation */}
                  {(isEvaluating || evaluationText) && (
                    <div className="interview-evaluation-box">
                      {parsedScore !== null && (
                        <div className="interview-evaluation-header">
                          <span className={`interview-score-badge ${scoreColorClass(parsedScore)}`}>
                            {parsedScore}/10
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {parsedScore >= 7 ? "Great answer!" : parsedScore >= 5 ? "Good attempt" : "Needs improvement"}
                          </span>
                        </div>
                      )}
                      {isEvaluating && !evaluationText && (
                        <div className="chatbot-typing">
                          <span /><span /><span />
                        </div>
                      )}
                      {evaluationText && (
                        <div
                          className="chatbot-markdown interview-feedback-text"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(evaluationText) }}
                        />
                      )}
                    </div>
                  )}

                  {/* Next / Finish */}
                  {guidedSubState === "evaluated" && (
                    <button className="interview-nav-btn" onClick={advanceGuided}>
                      {currentQuestionIndex + 1 < questions.length ? "Next Question →" : "Finish Interview"}
                    </button>
                  )}
                </div>
              )}

              {phase === "freeform" && (
                <div className="interview-freeform-panel">
                  {/* Chat messages */}
                  <div className="chatbot-messages interview-chat-messages">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`chatbot-bubble ${msg.role === "user" ? "chatbot-bubble-user" : "chatbot-bubble-assistant"}`}>
                        <div className="chatbot-bubble-content">
                          {msg.role === "assistant" ? (
                            msg.content ? (
                              <div
                                className="chatbot-markdown"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                              />
                            ) : (
                              <div className="chatbot-typing">
                                <span /><span /><span />
                              </div>
                            )
                          ) : (
                            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="chatbot-input-area">
                    <input
                      className="chatbot-input"
                      type="text"
                      placeholder="Type your answer..."
                      value={freeformInput}
                      onChange={(e) => setFreeformInput(e.target.value)}
                      disabled={isStreaming}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendFreeformMessage();
                        }
                      }}
                    />
                    <button
                      className="chatbot-send-btn"
                      onClick={sendFreeformMessage}
                      disabled={isStreaming || !freeformInput.trim()}
                      aria-label="Send"
                    >
                      ↑
                    </button>
                  </div>
                </div>
              )}

              {phase === "complete" && (
                <div className="interview-complete">
                  {/* Score header */}
                  <div className="interview-complete-header">
                    {mode === "guided" && guidedAvgScore !== null && (
                      <span className={`interview-score-badge interview-score-badge--lg ${scoreColorClass(guidedAvgScore)}`}>
                        {guidedAvgScore.toFixed(1)}/10
                      </span>
                    )}
                    {mode === "freeform" && freeformFinalScore !== null && (
                      <span className={`interview-score-badge interview-score-badge--lg ${scoreColorClass(freeformFinalScore)}`}>
                        {freeformFinalScore}/10
                      </span>
                    )}
                    <h4>{mode === "guided" ? "Interview Complete" : "Interview Summary"}</h4>
                  </div>

                  {/* Freeform summary */}
                  {mode === "freeform" && summary && (
                    <div
                      className="chatbot-markdown interview-summary-text"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
                    />
                  )}

                  {/* Guided question review */}
                  {mode === "guided" && answeredQuestions.length > 0 && (
                    <div className="interview-answers-review">
                      {answeredQuestions.map((q, i) => (
                        <div key={i} className="interview-answer-review-item">
                          <p className="interview-question-mini">{q.question?.q}</p>
                          <span className={`interview-score-badge ${scoreColorClass(q.score)}`}>
                            {q.score !== null ? `${q.score}/10` : "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="interview-complete-actions">
                    {saveStatus === "saved" && (
                      <p className="interview-save-toast">Session saved!</p>
                    )}
                    {saveStatus === "saving" && (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Saving...</p>
                    )}
                    {saveStatus === "error" && (
                      <button
                        className="interview-retry-save"
                        onClick={() => {
                          setSaveStatus("idle");
                          saveSession(summary, mode);
                        }}
                      >
                        Retry Save
                      </button>
                    )}
                    <button className="interview-restart-btn" onClick={() => resetState(true)}>
                      Start New Interview
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
