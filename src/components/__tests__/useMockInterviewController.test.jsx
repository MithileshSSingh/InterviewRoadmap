import { act, render, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockInterviewStore } from "../mock-interview/mockInterviewStore";
import { useMockInterviewController } from "../mock-interview/useMockInterviewController";

class FakeSpeechRecognition {
  static instance = null;

  constructor() {
    FakeSpeechRecognition.instance = this;
    this.abort = vi.fn();
    this.start = vi.fn(() => {
      this.onstart?.();
    });
  }
}

function ControllerHarness({ store$, onReady }) {
  const controller = useMockInterviewController(store$, {
    topicContent: {
      title: "JavaScript Closures",
      interviewQuestions: [],
    },
    topicId: "topic-1",
    roadmapSlug: "javascript",
    phaseId: "phase-1",
  });

  useEffect(() => {
    onReady(controller.actions);
  }, [controller.actions, onReady]);

  return null;
}

describe("useMockInterviewController", () => {
  beforeEach(() => {
    FakeSpeechRecognition.instance = null;
    window.SpeechRecognition = FakeSpeechRecognition;
    delete window.webkitSpeechRecognition;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not auto-restart the mic after a network recognition error", async () => {
    const store$ = createMockInterviewStore({
      isVoiceSupported: true,
      hasSpeechRecognition: true,
      hasSpeechSynthesis: true,
    });
    let actions = null;

    act(() => {
      store$.ui.mode.set("freeform");
      store$.ui.phase.set("freeform");
    });

    render(<ControllerHarness store$={store$} onReady={(nextActions) => {
      actions = nextActions;
    }} />);

    await waitFor(() => {
      expect(FakeSpeechRecognition.instance).toBeTruthy();
      expect(actions).toBeTruthy();
    });

    vi.useFakeTimers();

    act(() => {
      actions.startListening();
    });

    expect(FakeSpeechRecognition.instance.start).toHaveBeenCalledTimes(1);
    expect(store$.voice.recognitionStatus.get()).toBe("listening");

    act(() => {
      FakeSpeechRecognition.instance.onerror({ error: "network" });
      FakeSpeechRecognition.instance.onend();
      vi.runAllTimers();
    });

    expect(store$.voice.recognitionStatus.get()).toBe("error");
    expect(store$.voice.voiceError.get()).toBe(
      "Speech recognition lost its connection. Try again.",
    );
    expect(FakeSpeechRecognition.instance.start).toHaveBeenCalledTimes(1);
  });
});
