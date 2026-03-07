import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MockInterviewBotView from "../mock-interview/MockInterviewBotView";
import { createMockInterviewStore } from "../mock-interview/mockInterviewStore";

function createActions() {
  return {
    handleOpen: vi.fn(),
    handleClose: vi.fn(),
    resetState: vi.fn(),
    startGuidedMode: vi.fn(),
    startFreeformMode: vi.fn(),
    submitAnswer: vi.fn(),
    advanceGuided: vi.fn(),
    startListening: vi.fn(),
    interruptAssistantAndListen: vi.fn(),
    submitTypedMessage: vi.fn(),
    endInterview: vi.fn(),
    setUserAnswer: vi.fn(),
    setTypedInput: vi.fn(),
    saveSession: vi.fn(),
  };
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

describe("MockInterviewBotView", () => {
  it("updates the freeform handoff state after streaming finishes", async () => {
    const store$ = createMockInterviewStore({
      isVoiceSupported: true,
      hasSpeechRecognition: true,
      hasSpeechSynthesis: true,
    });

    act(() => {
      store$.ui.isOpen.set(true);
      store$.ui.mode.set("freeform");
      store$.ui.phase.set("freeform");
      store$.freeform.isStreaming.set(true);
      store$.voice.recognitionStatus.set("processing");
    });

    render(
      <MockInterviewBotView
        store$={store$}
        actions={createActions()}
        topicContent={{ title: "JavaScript Closures" }}
      />,
    );

    expect(screen.getByText("Interviewer is thinking.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Or type your answer...")).toBeDisabled();

    act(() => {
      store$.freeform.isStreaming.set(false);
      store$.voice.recognitionStatus.set("listening");
    });

    await waitFor(() => {
      expect(screen.getByText("Listening. Speak naturally.")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("Or type your answer...")).toBeEnabled();
  });
});
