"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useSelector } from "@legendapp/state/react";
import { createMockInterviewStore } from "./mock-interview/mockInterviewStore";
import { useMockInterviewController } from "./mock-interview/useMockInterviewController";
import MockInterviewBotView from "./mock-interview/MockInterviewBotView";
import { getSpeechRecognitionCtor, isIOSWebKitBrowser } from "./mock-interview/mockInterviewUtils";
import RequireAuthDialog from "./RequireAuthDialog";
import PremiumBadge from "./PremiumBadge";

export default function MockInterviewBot({
  topicContent,
  topicId,
  roadmapSlug,
  phaseId,
  onOpenChange,
}) {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = !!session;

  const hasSpeechRecognition = typeof window !== "undefined" && Boolean(getSpeechRecognitionCtor());
  const hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;
  const isVoiceSupported = hasSpeechRecognition && hasSpeechSynthesis;

  const [store$] = useState(() =>
    createMockInterviewStore({
      isVoiceSupported,
      hasSpeechRecognition,
      hasSpeechSynthesis,
      isIOSWebKit: isIOSWebKitBrowser(),
    }),
  );

  const { actions } = useMockInterviewController(store$, {
    topicContent,
    topicId,
    roadmapSlug,
    phaseId,
    onOpenChange,
  });
  const isOpen = useSelector(() => store$.ui.isOpen.get());

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <section className="section">
        <h2 className="section-title">
          <span className="icon">🎤</span> Mock Interview
          <PremiumBadge />
        </h2>

        {isAuthenticated ? (
          /* ── Unlocked state ── */
          <div className="quiz-generate-card mock-interview-entry-card">
            <p className="quiz-generate-text">
              Practice a live interview for <strong>{topicContent?.title}</strong>
            </p>
            <button
              className="quiz-btn quiz-btn-primary"
              onClick={() => void actions.handleOpen()}
            >
              Start Interview
            </button>
          </div>
        ) : (
          /* ── Locked state ── */
          <div
            className="quiz-generate-card mock-interview-entry-card"
            style={{
              position: "relative",
              opacity: 0.75,
            }}
          >
            <p
              className="quiz-generate-text"
              style={{ color: "var(--text-muted)" }}
            >
              Mock interview is powered by AI for <strong> {topicContent?.title}</strong>. Sign in to unlock this feature.
            </p>
            <RequireAuthDialog
              featureName="Mock Interviews"
              onAction={() => void actions.handleOpen()}
            >
              <button
                className="quiz-btn"
                style={{
                  background: "rgba(251, 191, 36, 0.12)",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  color: "var(--accent-yellow)",
                }}
              >
                🔒 Sign in to Unlock
              </button>
            </RequireAuthDialog>
          </div>
        )}
      </section>

      {isOpen
        ? createPortal(
            <MockInterviewBotView
              store$={store$}
              actions={actions}
              topicContent={topicContent}
            />,
            document.body,
          )
        : null}
    </>
  );
}
