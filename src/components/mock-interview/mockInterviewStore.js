import { observable } from "@legendapp/state";

/**
 * Factory – returns a NEW Legend State observable per call.
 * Never share a single store across multiple MockInterviewBot instances.
 *
 * @param {{ hasGuidedContent: boolean, isVoiceSupported: boolean }} init
 */
export function createMockInterviewStore({
  hasGuidedContent = false,
  isVoiceSupported = false,
  hasSpeechRecognition = false,
  hasSpeechSynthesis = false,
  isIOSWebKit = false,
} = {}) {
  return observable({
    // ── UI / phase ────────────────────────────────────────────────────────
    ui: {
      phase: "idle",       // "idle" | "mode-select" | "guided" | "freeform" | "complete"
      isOpen: false,
      mode: null,          // null | "guided" | "freeform"
      saveStatus: "idle",  // "idle" | "saving" | "saved" | "error"
    },

    // ── Guided Q&A ───────────────────────────────────────────────────────
    guided: {
      currentQuestionIndex: 0,
      userAnswer: "",
      isEvaluating: false,
      evaluationText: "",
      parsedScore: null,
      answeredQuestions: [],   // { questionIndex, question, userAnswer, score, feedback }[]
    },

    // ── Freeform / chat ──────────────────────────────────────────────────
    freeform: {
      chatMessages: [],        // { role, content }[]
      typedInput: "",
      summary: "",
      freeformFinalScore: null,
      isStreaming: false,
      interviewStatus: "ongoing",  // "ongoing" | "completing"
    },

    // ── Voice ────────────────────────────────────────────────────────────
    voice: {
      recognitionStatus: isVoiceSupported ? "idle" : "unsupported",
      interimTranscript: "",
      voiceError: "",
      isAssistantSpeaking: false,
      hasSpeechRecognition,
      hasSpeechSynthesis,
      isVoiceSupported,
      isIOSWebKit,
    },

    // ── Derived / static (set once) ──────────────────────────────────────
    hasGuidedContent,
  });
}
