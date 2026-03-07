"use client";

import { useState } from "react";
import { createMockInterviewStore } from "./mock-interview/mockInterviewStore";
import { useMockInterviewController } from "./mock-interview/useMockInterviewController";
import MockInterviewBotView from "./mock-interview/MockInterviewBotView";
import { getSpeechRecognitionCtor, isIOSWebKitBrowser } from "./mock-interview/mockInterviewUtils";

export default function MockInterviewBot({
  topicContent,
  topicId,
  roadmapSlug,
  phaseId,
  onOpenChange,
}) {
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

  return (
    <MockInterviewBotView
      store$={store$}
      actions={actions}
      topicContent={topicContent}
    />
  );
}
