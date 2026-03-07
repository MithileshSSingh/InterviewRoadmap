"use client";

import { useRef, useEffect } from "react";
import { observer, For } from "@legendapp/state/react";
import { renderMarkdown, scoreColorClass } from "./mockInterviewUtils";

// ── Sub-views ─────────────────────────────────────────────────────────────────

const ModeSelectView = observer(function ModeSelectView({ store$, actions, topicContent }) {
  const hasGuidedContent = store$.hasGuidedContent.get();
  const isVoiceSupported = store$.voice.isVoiceSupported.get();
  const questions = topicContent?.interviewQuestions ?? [];

  return (
    <div className="interview-mode-select">
      <p className="interview-mode-intro">
        Choose how to practice <strong>{topicContent?.title}</strong>
      </p>
      <div className="interview-mode-cards">
        <button
          className="interview-mode-card"
          onClick={actions.startGuidedMode}
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
        <button
          className="interview-mode-card"
          onClick={actions.startFreeformMode}
        >
          <span className="interview-mode-card-icon">{isVoiceSupported ? "🎙️" : "💬"}</span>
          <h4>{isVoiceSupported ? "Voice Interview" : "Live Interview"}</h4>
          <p>
            {isVoiceSupported
              ? "Spoken interview with auto-listening, live transcript, and streamed voice."
              : "Interactive interview with AI — type your answers in a live conversation."}
          </p>
        </button>
      </div>
    </div>
  );
});

const GuidedInterviewView = observer(function GuidedInterviewView({ store$, actions, topicContent }) {
  const questions = topicContent?.interviewQuestions ?? [];
  const currentQuestionIndex = store$.guided.currentQuestionIndex.get();
  const userAnswer = store$.guided.userAnswer.get();
  const isEvaluating = store$.guided.isEvaluating.get();
  const evaluationText = store$.guided.evaluationText.get();
  const parsedScore = store$.guided.parsedScore.get();

  const textareaRef = useRef(null);

  const guidedSubState = isEvaluating
    ? "evaluating"
    : evaluationText
      ? "evaluated"
      : "asking";

  // Auto-focus textarea when ready for input
  useEffect(() => {
    if (!isEvaluating && !evaluationText) {
      window.setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [evaluationText, isEvaluating, currentQuestionIndex]);

  return (
    <div className="interview-guided-panel">
      <div className="interview-progress-bar-wrap">
        <span className="interview-progress-label">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <div className="interview-progress-bar">
          <div
            className="interview-progress-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {questions[currentQuestionIndex]?.type && (
        <span
          className={`interview-type-badge interview-type-badge--${questions[currentQuestionIndex].type}`}
        >
          {questions[currentQuestionIndex].type}
        </span>
      )}

      <div className="interview-question-card">{questions[currentQuestionIndex]?.q}</div>

      <textarea
        ref={textareaRef}
        className="interview-answer-textarea"
        placeholder="Type your answer here..."
        value={userAnswer}
        onChange={(event) => actions.setUserAnswer(event.target.value)}
        disabled={guidedSubState !== "asking"}
        rows={4}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.ctrlKey && guidedSubState === "asking") {
            actions.submitAnswer();
          }
        }}
      />

      {guidedSubState === "asking" && (
        <button
          className="interview-submit-btn"
          onClick={actions.submitAnswer}
          disabled={!userAnswer.trim()}
        >
          Submit Answer
        </button>
      )}

      {(isEvaluating || evaluationText) && (
        <div className="interview-evaluation-box">
          {parsedScore !== null && (
            <div className="interview-evaluation-header">
              <span className={`interview-score-badge ${scoreColorClass(parsedScore)}`}>
                {parsedScore}/10
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {parsedScore >= 7
                  ? "Great answer!"
                  : parsedScore >= 5
                    ? "Good attempt"
                    : "Needs improvement"}
              </span>
            </div>
          )}
          {isEvaluating && !evaluationText && (
            <div className="chatbot-typing">
              <span />
              <span />
              <span />
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

      {guidedSubState === "evaluated" && (
        <button className="interview-nav-btn" onClick={actions.advanceGuided}>
          {currentQuestionIndex + 1 < questions.length
            ? "Next Question ->"
            : "Finish Interview"}
        </button>
      )}
    </div>
  );
});

const ChatBubble = observer(function ChatBubble({ message$ }) {
  const role = message$.role.get();
  const content = message$.content.get();

  return (
    <div
      className={`chatbot-bubble ${
        role === "user" ? "chatbot-bubble-user" : "chatbot-bubble-assistant"
      }`}
    >
      <div className="chatbot-bubble-content">
        {role === "assistant" ? (
          content ? (
            <div
              className="chatbot-markdown"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <div className="chatbot-typing">
              <span />
              <span />
              <span />
            </div>
          )
        ) : (
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{content}</p>
        )}
      </div>
    </div>
  );
});

const FreeformInterviewView = observer(function FreeformInterviewView({ store$, actions }) {
  const isVoiceSupported = store$.voice.isVoiceSupported.get();
  const isIOSWebKit = store$.voice.isIOSWebKit.get();
  const recognitionStatus = store$.voice.recognitionStatus.get();
  const isAssistantSpeaking = store$.voice.isAssistantSpeaking.get();
  const voiceError = store$.voice.voiceError.get();
  const interimTranscript = store$.voice.interimTranscript.get();
  const chatMessages = store$.freeform.chatMessages.get();
  const isStreaming = store$.freeform.isStreaming.get();
  const typedInput = store$.freeform.typedInput.get();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const voiceStatusText = (() => {
    if (!isVoiceSupported) return "Voice interview requires a browser with native speech APIs.";
    if (voiceError) return voiceError;
    if (isStreaming) return "Interviewer is thinking.";
    if (isAssistantSpeaking) return "Interviewer is speaking.";
    if (recognitionStatus === "starting") return "Starting microphone.";
    if (recognitionStatus === "listening") return "Listening. Speak naturally.";
    if (recognitionStatus === "processing") return "Processing your answer.";
    if (isIOSWebKit) return "Ready for your answer. Safari may require one tap to re-arm the mic.";
    return "Ready for your answer.";
  })();

  return (
    <div className="interview-freeform-panel">
      {isVoiceSupported && (
        <div className="interview-voice-panel">
          <div className="interview-voice-status-row">
            <span
              className={`interview-voice-indicator interview-voice-indicator--${recognitionStatus}`}
            >
              {recognitionStatus === "listening" ? "Mic live" : "Voice"}
            </span>
            {(isStreaming || isAssistantSpeaking) ? (
              <button
                className="interview-voice-action-btn"
                onClick={actions.interruptAssistantAndListen}
              >
                Interrupt &amp; Answer
              </button>
            ) : (
              <button
                className="interview-voice-action-btn"
                onClick={actions.startListening}
                disabled={!isVoiceSupported || recognitionStatus === "listening"}
              >
                Resume Mic
              </button>
            )}
          </div>
          <p className="interview-voice-status-text">{voiceStatusText}</p>
          <p className="interview-voice-hint">
            Your answer is captured automatically after you stop speaking.
          </p>
          {interimTranscript && (
            <div className="interview-voice-transcript">
              <span className="interview-voice-transcript-label">Live transcript</span>
              <p>{interimTranscript}</p>
            </div>
          )}
        </div>
      )}

      <div className="chatbot-messages interview-chat-messages">
        <For each={store$.freeform.chatMessages} optimized>
          {(message$) => (
            <ChatBubble message$={message$} />
          )}
        </For>
        <div ref={messagesEndRef} />
      </div>

      <div className="interview-text-input-bar">
        <input
          type="text"
          className="interview-text-input"
          placeholder={isVoiceSupported ? "Or type your answer..." : "Type your answer..."}
          value={typedInput}
          onChange={(e) => actions.setTypedInput(e.target.value)}
          disabled={isStreaming}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && typedInput.trim()) {
              e.preventDefault();
              actions.submitTypedMessage(typedInput);
              actions.setTypedInput("");
            }
          }}
        />
        <button
          className="interview-text-send-btn"
          disabled={isStreaming || !typedInput.trim()}
          onClick={() => {
            actions.submitTypedMessage(typedInput);
            actions.setTypedInput("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
});

const InterviewCompleteView = observer(function InterviewCompleteView({ store$, actions }) {
  const mode = store$.ui.mode.get();
  const saveStatus = store$.ui.saveStatus.get();
  const summary = store$.freeform.summary.get();
  const freeformFinalScore = store$.freeform.freeformFinalScore.get();
  const answeredQuestions = store$.guided.answeredQuestions.get();

  const guidedAvgScore =
    answeredQuestions.length > 0
      ? (() => {
          const scored = answeredQuestions.filter((q) => q.score !== null);
          return scored.length > 0
            ? scored.reduce((sum, q) => sum + q.score, 0) / scored.length
            : null;
        })()
      : null;

  return (
    <div className="interview-complete">
      <div className="interview-complete-header">
        {mode === "guided" && guidedAvgScore !== null && (
          <span
            className={`interview-score-badge interview-score-badge--lg ${scoreColorClass(guidedAvgScore)}`}
          >
            {guidedAvgScore.toFixed(1)}/10
          </span>
        )}
        {mode === "freeform" && freeformFinalScore !== null && (
          <span
            className={`interview-score-badge interview-score-badge--lg ${scoreColorClass(freeformFinalScore)}`}
          >
            {freeformFinalScore}/10
          </span>
        )}
        <h4>{mode === "guided" ? "Interview Complete" : "Interview Summary"}</h4>
      </div>

      {mode === "freeform" && summary && (
        <div
          className="chatbot-markdown interview-summary-text"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
        />
      )}

      {mode === "guided" && answeredQuestions.length > 0 && (
        <div className="interview-answers-review">
          {answeredQuestions.map((question, index) => (
            <div key={index} className="interview-answer-review-item">
              <p className="interview-question-mini">{question.question?.q}</p>
              <span className={`interview-score-badge ${scoreColorClass(question.score)}`}>
                {question.score !== null ? `${question.score}/10` : "N/A"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="interview-complete-actions">
        {saveStatus === "saved" && <p className="interview-save-toast">Session saved!</p>}
        {saveStatus === "saving" && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Saving...</p>
        )}
        {saveStatus === "error" && (
          <button
            className="interview-retry-save"
            onClick={() => {
              store$.ui.saveStatus.set("idle");
              actions.saveSession({
                summaryText: store$.freeform.summary.peek(),
                sessionMode: store$.ui.mode.peek(),
                finalScore: store$.freeform.freeformFinalScore.peek(),
                messagesOverride: store$.freeform.chatMessages.peek(),
              });
            }}
          >
            Retry Save
          </button>
        )}
        <button className="interview-restart-btn" onClick={() => actions.resetState(true)}>
          Start New Interview
        </button>
      </div>
    </div>
  );
});

// ── Main View ─────────────────────────────────────────────────────────────────

function MockInterviewBotView({ store$, actions, topicContent }) {
  const isOpen = store$.ui.isOpen.get();
  const phase = store$.ui.phase.get();

  return (
    <>
      {!isOpen && (
        <button
          className="mock-interview-fab"
          onClick={actions.handleOpen}
          aria-label="Start mock interview"
        >
          Practice Interview
        </button>
      )}

      {isOpen && (
        <>
          <div className="mock-interview-backdrop" onClick={actions.handleClose} />
          <div
            className="mock-interview-drawer"
            role="dialog"
            aria-label="Mock Interview"
            aria-modal="true"
          >
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
                    onClick={actions.endInterview}
                    title="End Interview"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                  >
                    End
                  </button>
                )}
                <button className="chatbot-action-btn" onClick={actions.handleClose} title="Close">
                  X
                </button>
              </div>
            </div>

            <div className="mock-interview-body">
              {phase === "mode-select" && (
                <ModeSelectView store$={store$} actions={actions} topicContent={topicContent} />
              )}

              {phase === "guided" && (
                <GuidedInterviewView store$={store$} actions={actions} topicContent={topicContent} />
              )}

              {phase === "freeform" && (
                <FreeformInterviewView store$={store$} actions={actions} />
              )}

              {phase === "complete" && (
                <InterviewCompleteView store$={store$} actions={actions} />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default observer(MockInterviewBotView);
