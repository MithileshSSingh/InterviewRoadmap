"use client";

import { useRef, useEffect, useCallback } from "react";
import { streamChatResponse } from "@/lib/chatClient";
import {
  USER_SPEECH_DEBOUNCE_MS,
  MAX_SAVED_FREEFORM_MESSAGES,
  parseScore,
  parseFreeformScore,
  getOrCreateSessionId,
  buildGuidedEvaluationMessages,
  buildFreeformSystemPrompt,
  getSpeechRecognitionCtor,
  cleanSpeechText,
  splitSpeechChunks,
  pickSpeechVoice,
  normaliseVoiceError,
  keepUtteranceAlive,
  clearUtterance,
  clearAllUtterances,
} from "./mockInterviewUtils";

/**
 * Controller hook – owns all imperative / async logic for MockInterviewBot.
 *
 * @param {import("@legendapp/state").Observable} store$  – scoped Legend State observable
 * @param {object} props
 * @param {object} props.topicContent
 * @param {string} props.topicId
 * @param {string} props.roadmapSlug
 * @param {string} props.phaseId
 * @param {function} [props.onOpenChange]
 */
export function useMockInterviewController(store$, { topicContent, topicId, roadmapSlug, phaseId, onOpenChange }) {
  const questions = topicContent?.interviewQuestions ?? [];

  // ── Refs (non-serializable, imperative) ──────────────────────────────────
  const abortRef = useRef(null);

  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);
  const shouldListenRef = useRef(false);
  const transcriptFlushTimerRef = useRef(null);
  const finalTranscriptBufferRef = useRef("");

  const speechQueueRef = useRef([]);
  const speechBufferRef = useRef("");
  const speechActiveRef = useRef(false);
  const currentUtteranceRef = useRef(null);

  const submitVoiceTurnRef = useRef(null);
  const interruptedForBargeInRef = useRef(false);
  const audioPermissionPrimedRef = useRef(false);
  const speechSynthesisPrimedRef = useRef(false);
  const initialRecognitionPrimedRef = useRef(false);
  const shouldAbortImmediatelyOnStartRef = useRef(false);

  // ── Shorthand getters ────────────────────────────────────────────────────
  const isVoiceSupported = store$.voice.isVoiceSupported.peek();
  const isIOSWebKit = store$.voice.isIOSWebKit.peek();

  // ── Internal helpers ─────────────────────────────────────────────────────
  const clearTranscriptTimer = useCallback(() => {
    if (transcriptFlushTimerRef.current) {
      clearTimeout(transcriptFlushTimerRef.current);
      transcriptFlushTimerRef.current = null;
    }
  }, []);

  const primeSpeechSynthesis = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis || speechSynthesisPrimedRef.current) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(" ");
      utterance.volume = 0;
      utterance.lang = "en-US";
      speechSynthesisPrimedRef.current = true;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* ignore */
    }
  }, []);

  const primeAudioPermission = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      audioPermissionPrimedRef.current
    ) {
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      audioPermissionPrimedRef.current = true;
      return true;
    } catch {
      return false;
    }
  }, []);

  const cancelAssistantSpeech = useCallback(
    ({ clearBuffer = true } = {}) => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      }
      clearAllUtterances();
      speechQueueRef.current = [];
      currentUtteranceRef.current = null;
      speechActiveRef.current = false;
      if (clearBuffer) {
        speechBufferRef.current = "";
      }
      store$.voice.isAssistantSpeaking.set(false);
    },
    [store$],
  );

  const stopListening = useCallback(
    (nextStatus = "idle") => {
      shouldListenRef.current = false;
      clearTranscriptTimer();
      finalTranscriptBufferRef.current = "";
      store$.voice.interimTranscript.set("");

      if (recognitionActiveRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }

      store$.voice.recognitionStatus.set(nextStatus);
    },
    [clearTranscriptTimer, store$],
  );

  const startListening = useCallback(() => {
    if (!isVoiceSupported) return;
    if (store$.ui.phase.peek() !== "freeform" || store$.ui.mode.peek() !== "freeform") return;
    if (store$.ui.phase.peek() === "complete") return;
    if (store$.freeform.isStreaming.peek() || speechActiveRef.current) return;
    if (!recognitionRef.current || recognitionActiveRef.current) return;

    shouldListenRef.current = true;
    store$.voice.voiceError.set("");
    store$.voice.recognitionStatus.set("starting");

    try {
      recognitionRef.current.start();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.toLowerCase().includes("already started")) {
        shouldListenRef.current = false;
        store$.voice.recognitionStatus.set("error");
        store$.voice.voiceError.set("Unable to start the microphone right now.");
      }
    }
  }, [isVoiceSupported, store$]);

  const enqueueSpeechChunk = useCallback(
    (rawText) => {
      const speakableText = cleanSpeechText(rawText);
      if (!speakableText) return;

      speechQueueRef.current.push(speakableText);

      const speakNext = () => {
        if (speechActiveRef.current) return;
        const nextText = speechQueueRef.current.shift();
        if (!nextText) {
          store$.voice.isAssistantSpeaking.set(false);
          if (shouldListenRef.current && !store$.freeform.isStreaming.peek()) {
            startListening();
          }
          return;
        }

        const {voice, lang} = pickSpeechVoice();
        const utterance = new SpeechSynthesisUtterance(nextText);
        utterance.rate = 1.02;
        utterance.pitch = 1;
        utterance.lang = lang;
        utterance.voice = voice;
        let hasFinished = false;

        const resumeListeningAfterSpeech = () => {
          if (!shouldListenRef.current || store$.freeform.isStreaming.peek()) return;

          if (isIOSWebKit) {
            window.setTimeout(() => {
              if (!speechActiveRef.current) {
                startListening();
              }
            }, 250);
            return;
          }

          startListening();
        };

        utterance.onstart = () => {
          keepUtteranceAlive(utterance);
          store$.voice.isAssistantSpeaking.set(true);
          store$.voice.recognitionStatus.set("processing");

          // Chrome can occasionally strand utterances without an end event.
          // Avoid this watchdog on iOS WebKit where it can fire early and re-arm the mic too soon.
          if (!isIOSWebKit) {
            if (utterance.watchdog) clearInterval(utterance.watchdog);
            utterance.watchdog = setInterval(() => {
              if (
                !window.speechSynthesis.speaking &&
                speechActiveRef.current &&
                currentUtteranceRef.current === utterance
              ) {
                clearInterval(utterance.watchdog);
                utterance.onend();
              } else if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                window.speechSynthesis.resume();
              }
            }, 1000);
          }
        };

        const cleanupUtterance = () => {
          if (utterance.watchdog) {
            clearInterval(utterance.watchdog);
            utterance.watchdog = null;
          }
          clearUtterance(utterance);
        };

        const finalizeUtterance = () => {
          if (hasFinished) return;
          hasFinished = true;
          cleanupUtterance();
          speechActiveRef.current = false;
          currentUtteranceRef.current = null;
          if (speechQueueRef.current.length > 0) {
            speakNext();
            return;
          }
          store$.voice.isAssistantSpeaking.set(false);
          resumeListeningAfterSpeech();
        };

        utterance.onend = finalizeUtterance;
        utterance.onerror = finalizeUtterance;

        speechActiveRef.current = true;
        currentUtteranceRef.current = utterance;
        window.speechSynthesis.resume();
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          finalizeUtterance();
        }
      };

      if (!speechActiveRef.current) {
        speakNext();
      }
    },
    [isIOSWebKit, startListening, store$],
  );

  const flushSpeechBuffer = useCallback(
    (force = false) => {
      const { chunks, remaining } = splitSpeechChunks(speechBufferRef.current, force);
      speechBufferRef.current = remaining;
      chunks.forEach((chunk) => enqueueSpeechChunk(chunk));
    },
    [enqueueSpeechChunk],
  );

  // ── Stream orchestration ─────────────────────────────────────────────────
  const streamAssistantTurn = useCallback(
    async ({ apiMessages, assistantIndex, resumeListeningAfter, onContent = null }) => {
      stopListening("processing");
      cancelAssistantSpeech();
      speechBufferRef.current = "";
      interruptedForBargeInRef.current = false;
      store$.freeform.isStreaming.set(true);
      store$.voice.voiceError.set("");

      const controller = new AbortController();
      abortRef.current = controller;

      const result = await streamChatResponse({
        messages: apiMessages,
        signal: controller.signal,
        onToken: (token, fullContent) => {
          store$.freeform.chatMessages[assistantIndex].content.set(fullContent);
          speechBufferRef.current += token;
          flushSpeechBuffer(false);
          onContent?.(fullContent);
        },
      });

      abortRef.current = null;
      store$.freeform.isStreaming.set(false);

      if (result.status === "aborted") {
        flushSpeechBuffer(false);
        if (resumeListeningAfter && interruptedForBargeInRef.current) {
          startListening();
        }
        return null;
      }

      if (result.status === "error") {
        flushSpeechBuffer(true);
        store$.voice.voiceError.set(result.message);
        if (resumeListeningAfter) {
          shouldListenRef.current = true;
          if (!speechActiveRef.current) {
            startListening();
          }
        }
        return null;
      }

      store$.freeform.chatMessages[assistantIndex].content.set(result.content);

      speechBufferRef.current += "";
      flushSpeechBuffer(true);

      shouldListenRef.current = resumeListeningAfter;
      if (resumeListeningAfter && !speechActiveRef.current && speechQueueRef.current.length === 0) {
        startListening();
      }

      return result.content;
    },
    [cancelAssistantSpeech, flushSpeechBuffer, startListening, stopListening, store$],
  );

  // ── Persistence ──────────────────────────────────────────────────────────
  const saveSession = useCallback(
    async ({ summaryText = null, sessionMode, finalScore = null, messagesOverride = null }) => {
      const currentSaveStatus = store$.ui.saveStatus.peek();
      if (currentSaveStatus === "saving" || currentSaveStatus === "saved") return;
      store$.ui.saveStatus.set("saving");

      const localSessionId = getOrCreateSessionId();
      const effectiveMode = sessionMode ?? store$.ui.mode.peek();
      const currentAnswered = store$.guided.answeredQuestions.peek();

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
        const transcriptMessages = messagesOverride ?? store$.freeform.chatMessages.peek();
        allMessages = transcriptMessages.slice(0, MAX_SAVED_FREEFORM_MESSAGES).map((msg, i) => ({
          role: msg.role,
          content: msg.content,
          source: msg.role === "user" ? "voice" : "assistant",
          turn: i + 1,
        }));
        avgScore = finalScore ?? store$.freeform.freeformFinalScore.peek();
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
            summary: summaryText ?? store$.freeform.summary.peek() ?? null,
            messages: allMessages,
            sessionId: localSessionId,
          }),
        });

        store$.ui.saveStatus.set(res.ok ? "saved" : "error");
      } catch {
        store$.ui.saveStatus.set("error");
      }
    },
    [phaseId, roadmapSlug, store$, topicContent.title, topicId],
  );

  // ── Voice turn submission ────────────────────────────────────────────────
  const submitVoiceTurn = useCallback(
    async (transcript) => {
      const text = transcript.trim();
      if (!text || store$.freeform.isStreaming.peek() || store$.ui.phase.peek() !== "freeform") return;

      const userMessage = { role: "user", content: text };
      const currentMessages = store$.freeform.chatMessages.peek();
      const nextMessages = [...currentMessages, userMessage, { role: "assistant", content: "" }];
      const assistantIndex = nextMessages.length - 1;

      store$.freeform.chatMessages.set(nextMessages);

      const systemMsg = buildFreeformSystemPrompt(topicContent);
      const apiMessages = [
        { role: "system", content: systemMsg },
        ...nextMessages.slice(0, assistantIndex),
      ];

      const content = await streamAssistantTurn({
        apiMessages,
        assistantIndex,
        resumeListeningAfter: true,
        onContent: (fullContent) => {
          if (
            store$.freeform.interviewStatus.peek() === "ongoing" &&
            parseFreeformScore(fullContent) !== null
          ) {
            store$.freeform.interviewStatus.set("completing");
          }
        },
      });

      if (store$.freeform.interviewStatus.peek() === "completing") {
        stopListening("idle");
        store$.freeform.summary.set(content);
        store$.freeform.freeformFinalScore.set(parseFreeformScore(content));
        store$.freeform.interviewStatus.set("ongoing");
        store$.ui.phase.set("complete");
        await saveSession({
          summaryText: content,
          sessionMode: "freeform",
          finalScore: parseFreeformScore(content),
          messagesOverride: store$.freeform.chatMessages.peek(),
        });
      }
    },
    [streamAssistantTurn, topicContent, store$, stopListening, saveSession],
  );

  const submitTypedMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || store$.freeform.isStreaming.peek() || store$.ui.phase.peek() !== "freeform") return;

      const userMessage = { role: "user", content: trimmed };
      const currentMessages = store$.freeform.chatMessages.peek();
      const nextMessages = [...currentMessages, userMessage, { role: "assistant", content: "" }];
      const assistantIndex = nextMessages.length - 1;

      store$.freeform.chatMessages.set(nextMessages);

      const systemMsg = buildFreeformSystemPrompt(topicContent);
      const apiMessages = [
        { role: "system", content: systemMsg },
        ...nextMessages.slice(0, assistantIndex),
      ];

      const content = await streamAssistantTurn({
        apiMessages,
        assistantIndex,
        resumeListeningAfter: isVoiceSupported,
        onContent: (fullContent) => {
          if (
            store$.freeform.interviewStatus.peek() === "ongoing" &&
            parseFreeformScore(fullContent) !== null
          ) {
            store$.freeform.interviewStatus.set("completing");
          }
        },
      });

      if (store$.freeform.interviewStatus.peek() === "completing") {
        stopListening("idle");
        store$.freeform.summary.set(content);
        store$.freeform.freeformFinalScore.set(parseFreeformScore(content));
        store$.freeform.interviewStatus.set("ongoing");
        store$.ui.phase.set("complete");
        await saveSession({
          summaryText: content,
          sessionMode: "freeform",
          finalScore: parseFreeformScore(content),
          messagesOverride: store$.freeform.chatMessages.peek(),
        });
      }
    },
    [isVoiceSupported, streamAssistantTurn, topicContent, store$, stopListening, saveSession],
  );

  // ── Ref to keep submitVoiceTurn current ──────────────────────────────────
  useEffect(() => {
    submitVoiceTurnRef.current = submitVoiceTurn;
  }, [submitVoiceTurn]);

  // ── Speech recognition setup / teardown ──────────────────────────────────
  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();

    if (!isVoiceSupported || !SpeechRecognitionCtor) {
      return undefined;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = !isIOSWebKit;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (shouldAbortImmediatelyOnStartRef.current) {
        shouldAbortImmediatelyOnStartRef.current = false;
        initialRecognitionPrimedRef.current = true;
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
        return;
      }

      recognitionActiveRef.current = true;
      store$.voice.recognitionStatus.set("listening");
      store$.voice.voiceError.set("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i]?.[0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalChunk += `${transcript} `;
        } else {
          interim += transcript;
        }
      }

      if (finalChunk.trim()) {
        finalTranscriptBufferRef.current = `${finalTranscriptBufferRef.current} ${finalChunk}`.trim();
      }

      store$.voice.interimTranscript.set(interim.trim());
      clearTranscriptTimer();

      if (finalTranscriptBufferRef.current) {
        transcriptFlushTimerRef.current = setTimeout(() => {
          const bufferedTranscript = finalTranscriptBufferRef.current.trim();
          finalTranscriptBufferRef.current = "";
          store$.voice.interimTranscript.set("");
          stopListening("processing");
          submitVoiceTurnRef.current?.(bufferedTranscript);
        }, USER_SPEECH_DEBOUNCE_MS);
      }
    };

    recognition.onerror = (event) => {
      recognitionActiveRef.current = false;
      if (event.error === "aborted") return;

      store$.voice.recognitionStatus.set("error");
      store$.voice.voiceError.set(normaliseVoiceError(event.error));

      if (
        event.error === "audio-capture" ||
        event.error === "network" ||
        event.error === "not-allowed" ||
        event.error === "service-not-allowed" ||
        event.error === "language-not-supported"
      ) {
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;

      if (
        shouldListenRef.current &&
        store$.ui.phase.peek() === "freeform" &&
        store$.ui.mode.peek() === "freeform" &&
        !store$.freeform.isStreaming.peek() &&
        !speechActiveRef.current
      ) {
        window.setTimeout(() => {
          if (
            shouldListenRef.current &&
            store$.ui.phase.peek() === "freeform" &&
            store$.ui.mode.peek() === "freeform" &&
            !store$.freeform.isStreaming.peek() &&
            !speechActiveRef.current
          ) {
            startListening();
          }
        }, 250);
        return;
      }

      if (
        store$.ui.phase.peek() !== "complete" &&
        store$.voice.recognitionStatus.peek() !== "error"
      ) {
        store$.voice.recognitionStatus.set("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearTranscriptTimer();
      recognitionRef.current = null;
      recognitionActiveRef.current = false;
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    };
  }, [clearTranscriptTimer, isIOSWebKit, isVoiceSupported, startListening, stopListening, store$]);

  // ── Escape-to-close ──────────────────────────────────────────────────────
  // Use .get() so React re-runs this effect when isOpen changes
  const isOpen = store$.ui.isOpen.get();
  useEffect(() => {
    if (!isOpen) return undefined;

    const handler = (event) => {
      if (event.key === "Escape") {
        abortRef.current?.abort();
        stopListening("idle");
        cancelAssistantSpeech();
        store$.ui.isOpen.set(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cancelAssistantSpeech, isOpen, stopListening, store$]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopListening("idle");
      cancelAssistantSpeech();
    };
  }, [cancelAssistantSpeech, stopListening]);

  // ── Notify parent on open-state change ───────────────────────────────────
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // ── Public actions ───────────────────────────────────────────────────────
  function handleOpen() {
    store$.ui.isOpen.set(true);
    const currentPhase = store$.ui.phase.peek();
    if (currentPhase === "idle" || currentPhase === "complete") {
      resetState(false);
      store$.ui.phase.set("mode-select");
    }
  }

  function handleClose() {
    abortRef.current?.abort();
    stopListening("idle");
    cancelAssistantSpeech();
    store$.ui.isOpen.set(false);
  }

  function resetState(fullReset = true) {
    abortRef.current?.abort();
    stopListening("idle");
    cancelAssistantSpeech();
    interruptedForBargeInRef.current = false;

    if (fullReset) {
      store$.ui.mode.set(null);
      store$.ui.phase.set("mode-select");
    }

    store$.guided.currentQuestionIndex.set(0);
    store$.guided.userAnswer.set("");
    store$.guided.isEvaluating.set(false);
    store$.guided.evaluationText.set("");
    store$.guided.parsedScore.set(null);
    store$.guided.answeredQuestions.set([]);
    store$.freeform.chatMessages.set([]);
    store$.freeform.isStreaming.set(false);
    store$.voice.recognitionStatus.set(isVoiceSupported ? "idle" : "unsupported");
    store$.voice.interimTranscript.set("");
    store$.voice.voiceError.set("");
    store$.freeform.summary.set("");
    store$.freeform.freeformFinalScore.set(null);
    store$.freeform.interviewStatus.set("ongoing");
    store$.ui.saveStatus.set("idle");
  }

  function startGuidedMode() {
    store$.ui.mode.set("guided");
    store$.ui.phase.set("guided");
  }

  async function startFreeformMode() {
    if (isVoiceSupported && isIOSWebKit) {
      primeSpeechSynthesis();

      const permissionGranted = await primeAudioPermission();
      if (!permissionGranted) {
        store$.voice.voiceError.set(
          "Microphone access is required in Safari. Also ensure Siri or Dictation is enabled in iOS Settings.",
        );
      }

      if (recognitionRef.current && !initialRecognitionPrimedRef.current) {
        shouldAbortImmediatelyOnStartRef.current = true;
        try {
          recognitionRef.current.start();
        } catch {
          shouldAbortImmediatelyOnStartRef.current = false;
        }
      }
    }

    store$.ui.mode.set("freeform");
    store$.ui.phase.set("freeform");
    await startFreeformInterview();
  }

  async function submitAnswer() {
    const userAnswer = store$.guided.userAnswer.peek();
    if (!userAnswer.trim() || store$.guided.isEvaluating.peek()) return;

    const question = questions[store$.guided.currentQuestionIndex.peek()];
    store$.guided.isEvaluating.set(true);
    store$.guided.evaluationText.set("");
    store$.guided.parsedScore.set(null);

    const msgs = buildGuidedEvaluationMessages(question, userAnswer, topicContent.title);
    const controller = new AbortController();
    abortRef.current = controller;

    let finalText = "";
    const result = await streamChatResponse({
      messages: msgs,
      signal: controller.signal,
      onToken: (_token, fullContent) => {
        finalText = fullContent;
        store$.guided.evaluationText.set(fullContent);
        store$.guided.parsedScore.set(parseScore(fullContent));
      },
    });

    abortRef.current = null;
    store$.guided.isEvaluating.set(false);

    if (result.status === "aborted") return;

    const score = parseScore(finalText);
    store$.guided.answeredQuestions.set((prev) => [
      ...prev,
      {
        questionIndex: store$.guided.currentQuestionIndex.peek(),
        question,
        userAnswer,
        score,
        feedback: finalText,
      },
    ]);
  }

  function advanceGuided() {
    const next = store$.guided.currentQuestionIndex.peek() + 1;
    if (next < questions.length) {
      store$.guided.currentQuestionIndex.set(next);
      store$.guided.userAnswer.set("");
      store$.guided.evaluationText.set("");
      store$.guided.parsedScore.set(null);
    } else {
      finishGuided();
    }
  }

  function finishGuided() {
    store$.ui.phase.set("complete");
    saveSession({ sessionMode: "guided" });
  }

  async function startFreeformInterview() {
    store$.freeform.chatMessages.set([{ role: "assistant", content: "" }]);

    const systemMsg = buildFreeformSystemPrompt(topicContent);
    const openingMessages = [
      { role: "system", content: systemMsg },
      {
        role: "user",
        content: "Please introduce yourself briefly and ask your first interview question.",
      },
    ];

    await streamAssistantTurn({
      apiMessages: openingMessages,
      assistantIndex: 0,
      resumeListeningAfter: isVoiceSupported,
    });
  }

  function interruptAssistantAndListen() {
    interruptedForBargeInRef.current = true;
    abortRef.current?.abort();
    cancelAssistantSpeech();
    store$.freeform.isStreaming.set(false);
    shouldListenRef.current = true;
    startListening();
  }

  async function endInterview() {
    abortRef.current?.abort();
    stopListening("processing");
    cancelAssistantSpeech();
    store$.freeform.summary.set("");

    const filteredMessages = store$.freeform.chatMessages
      .peek()
      .filter((msg) => msg.content !== "");
    const nextMessages = [...filteredMessages, { role: "assistant", content: "" }];
    const assistantIndex = nextMessages.length - 1;

    store$.freeform.chatMessages.set(nextMessages);

    const systemMsg = buildFreeformSystemPrompt(topicContent);
    const summaryMessages = [
      { role: "system", content: systemMsg },
      ...filteredMessages,
      {
        role: "user",
        content:
          "The interview is now over. Please provide your final assessment and overall score using the format: OVERALL SCORE: X/10",
      },
    ];

    const finalSummary = await streamAssistantTurn({
      apiMessages: summaryMessages,
      assistantIndex,
      resumeListeningAfter: false,
    });

    if (!finalSummary) return;

    const score = parseFreeformScore(finalSummary);
    store$.freeform.summary.set(finalSummary);
    store$.freeform.freeformFinalScore.set(score);
    store$.ui.phase.set("complete");
    stopListening("idle");

    await saveSession({
      summaryText: finalSummary,
      sessionMode: "freeform",
      finalScore: score,
      messagesOverride: store$.freeform.chatMessages.peek(),
    });
  }

  // ── Return public surface ────────────────────────────────────────────────
  return {
    actions: {
      handleOpen,
      handleClose,
      resetState,
      startGuidedMode,
      startFreeformMode,
      submitAnswer,
      advanceGuided,
      startListening,
      interruptAssistantAndListen,
      submitTypedMessage,
      endInterview,
      setUserAnswer: (val) => store$.guided.userAnswer.set(val),
      setTypedInput: (val) => store$.freeform.typedInput.set(val),
      saveSession,
    },
  };
}
