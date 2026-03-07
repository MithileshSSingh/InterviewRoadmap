"use client";

import { useEffect, useState } from "react";
import { createMockInterviewStore } from "./mock-interview/mockInterviewStore";
import { useMockInterviewController } from "./mock-interview/useMockInterviewController";
import MockInterviewBotView from "./mock-interview/MockInterviewBotView";
import { getVoiceSupportState, isIOSWebKitBrowser } from "./mock-interview/mockInterviewUtils";

export default function MockInterviewBot({
  topicContent,
  topicId,
  roadmapSlug,
  phaseId,
  onOpenChange,
}) {
  const questions = topicContent?.interviewQuestions ?? [];
  const hasGuidedContent = questions.length > 0;
  const initialVoiceState = getVoiceSupportState();

  const [store$] = useState(() =>
    createMockInterviewStore({
      hasGuidedContent,
      isVoiceSupported: initialVoiceState.isVoiceSupported,
      hasSpeechRecognition: initialVoiceState.hasSpeechRecognition,
      hasSpeechSynthesis: initialVoiceState.hasSpeechSynthesis,
      isIOSWebKit: isIOSWebKitBrowser(),
    }),
  );

  useEffect(() => {
    const syncVoiceCapabilities = () => {
      const nextVoiceState = getVoiceSupportState();
      store$.voice.hasSpeechRecognition.set(nextVoiceState.hasSpeechRecognition);
      store$.voice.hasSpeechSynthesis.set(nextVoiceState.hasSpeechSynthesis);
      store$.voice.isVoiceSupported.set(nextVoiceState.isVoiceSupported);

      if (!nextVoiceState.isVoiceSupported && store$.voice.recognitionStatus.peek() !== "unsupported") {
        store$.voice.recognitionStatus.set("unsupported");
      } else if (
        nextVoiceState.isVoiceSupported &&
        store$.voice.recognitionStatus.peek() === "unsupported"
      ) {
        store$.voice.recognitionStatus.set("idle");
      }
    };

    syncVoiceCapabilities();
    window.addEventListener("focus", syncVoiceCapabilities);
    document.addEventListener("visibilitychange", syncVoiceCapabilities);

    return () => {
      window.removeEventListener("focus", syncVoiceCapabilities);
      document.removeEventListener("visibilitychange", syncVoiceCapabilities);
    };
  }, [store$]);

  const { actions } = useMockInterviewController(store$, {
    topicContent,
    topicId,
    roadmapSlug,
    phaseId,
    onOpenChange,
  });

  return (
    <MockInterviewBotView
      store$={store$}
      actions={actions}
      topicContent={topicContent}
    />
  );
}
