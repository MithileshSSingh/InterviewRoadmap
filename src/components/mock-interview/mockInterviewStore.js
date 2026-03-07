import { observable } from "@legendapp/state";

/**
 * Factory – returns a NEW Legend State observable per call.
 * Never share a single store across multiple MockInterviewBot instances.
 *
 * @param {{ isVoiceSupported: boolean }} init
 */
export function createMockInterviewStore({
  isVoiceSupported = false,
  hasSpeechRecognition = false,
  hasSpeechSynthesis = false,
  isIOSWebKit = false,
} = {}) {
  return observable({
    // ── UI / phase ────────────────────────────────────────────────────────
    ui: {
      phase: "idle",       // "idle" | "freeform" | "complete"
      isOpen: false,
      mode: null,          // null | "freeform"
      saveStatus: "idle",  // "idle" | "saving" | "saved" | "error"
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
  });
}
