"use client";

import { useRef, useEffect } from "react";
import { observer, For } from "@legendapp/state/react";
import { renderMarkdown, scoreColorClass } from "./mockInterviewUtils";

// ── Sub-views ─────────────────────────────────────────────────────────────────

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
  const saveStatus = store$.ui.saveStatus.get();
  const summary = store$.freeform.summary.get();
  const freeformFinalScore = store$.freeform.freeformFinalScore.get();

  return (
    <div className="interview-complete">
      <div className="interview-complete-header">
        {freeformFinalScore !== null && (
          <span
            className={`interview-score-badge interview-score-badge--lg ${scoreColorClass(freeformFinalScore)}`}
          >
            {freeformFinalScore}/10
          </span>
        )}
        <h4>Interview Summary</h4>
      </div>

      {summary && (
        <div
          className="chatbot-markdown interview-summary-text"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
        />
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
        <button className="interview-restart-btn" onClick={actions.restartInterview}>
          Start New Interview
        </button>
      </div>
    </div>
  );
});

// ── Main View ─────────────────────────────────────────────────────────────────

function MockInterviewBotView({ store$, actions, interviewConfig }) {
  const isOpen = store$.ui.isOpen.get();
  const phase = store$.ui.phase.get();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="quiz-dialog-backdrop" onClick={actions.handleClose} />
      <div
        className="mock-interview-dialog-container"
        role="dialog"
        aria-label="Mock Interview"
        aria-modal="true"
      >
        <div className="chatbot-header mock-interview-dialog-header">
          <div className="chatbot-header-info">
            <span className="chatbot-header-icon">🎤</span>
            <div>
              <h3 className="chatbot-title">Mock Interview</h3>
              <p className="chatbot-subtitle">{interviewConfig?.title}</p>
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
          {phase === "freeform" && (
            <FreeformInterviewView store$={store$} actions={actions} />
          )}

          {phase === "complete" && (
            <InterviewCompleteView store$={store$} actions={actions} />
          )}
        </div>
      </div>
    </>
  );
}

export default observer(MockInterviewBotView);
