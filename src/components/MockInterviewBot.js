"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { streamChatResponse } from "@/lib/chatClient";
import { createDeepgramSTT } from "@/lib/deepgramSTT";
import { createDeepgramTTS } from "@/lib/deepgramTTS";

const USER_SPEECH_DEBOUNCE_MS = 1200;
const MAX_SAVED_FREEFORM_MESSAGES = 50;

/** true when the server has provider-backed voice configured */
const IS_PROVIDER_VOICE_AVAILABLE =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_DEEPGRAM_ENABLED === "true";

function renderMarkdown(text) {
  return marked.parse(text, { async: false });
}

function parseScore(text) {
  const match = text.match(/SCORE:\s*(\d+(?:\.\d+)?)\/10/i);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return Number.isNaN(val) ? null : Math.min(10, Math.max(0, val));
}

function parseFreeformScore(text) {
  const match = text.match(/OVERALL SCORE:\s*(\d+(?:\.\d+)?)\/10/i);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return Number.isNaN(val) ? null : Math.min(10, Math.max(0, val));
}

function scoreColorClass(score) {
  if (score === null) return "";
  if (score >= 7) return "interview-score-badge--green";
  if (score >= 5) return "interview-score-badge--yellow";
  return "interview-score-badge--red";
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  let sid = localStorage.getItem("cf-session-id");
  if (!sid) {
    sid = `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("cf-session-id", sid);
  }
  return sid;
}

function buildGuidedEvaluationMessages(question, userAnswer, topicTitle) {
  return [
    {
      role: "system",
      content: `You are a senior technical interviewer evaluating an interview answer.
Topic: ${topicTitle}
Question: ${question.q}
Expected answer: ${question.a}

Evaluate the candidate's answer. Respond with exactly this format:
SCORE: X/10

[2-3 sentences of specific feedback on what was correct and what was missing or incomplete]

KEY POINTS MISSED:
- [Only list if key concepts were missing; omit section if answer was complete]`,
    },
    {
      role: "user",
      content: userAnswer,
    },
  ];
}

function buildFreeformSystemPrompt(topicContent) {
  const questions = (topicContent.interviewQuestions ?? [])
    .map((q) => `- ${q.q}`)
    .join("\n");
  const explanation = (topicContent.explanation ?? "").slice(0, 500);

  return `You are a senior technical interviewer conducting a mock interview on "${topicContent.title}".

Topic background: ${explanation}

Sample questions to draw from (adapt freely, ask follow-ups):
${questions || "Ask general questions about the topic."}

Instructions:
- Speak naturally and keep each turn concise enough for a spoken conversation
- Start with a brief 1-sentence introduction, then ask your first question
- Ask one question at a time and wait for the candidate's response
- Probe deeper when answers are vague or incomplete
- After 5-7 questions, or when the candidate says they are done, conclude with a summary in this exact format:
OVERALL SCORE: X/10
[2-3 sentences on strengths and areas for improvement]`;
}

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function isIOSWebKitBrowser() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isIOSDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && maxTouchPoints > 1);

  return isIOSDevice && /WebKit/i.test(ua);
}

function cleanSpeechText(text) {
  return text
    .replace(/```[\s\S]*?```/g, " code example. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_~>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSpeechChunks(buffer, force = false) {
  const chunks = [];
  let remaining = buffer;
  const boundaryRegex = /^[\s\S]*?(?:[.!?](?=\s|$)|\n{2,})/;

  while (true) {
    const match = remaining.match(boundaryRegex);
    if (!match || !match[0]) break;
    chunks.push(match[0]);
    remaining = remaining.slice(match[0].length);
  }

  if (!force && chunks.length === 0 && remaining.length > 180) {
    const cutIndex = remaining.lastIndexOf(" ", 180);
    if (cutIndex > 80) {
      chunks.push(remaining.slice(0, cutIndex));
      remaining = remaining.slice(cutIndex);
    }
  }

  if (force && remaining.trim()) {
    chunks.push(remaining);
    remaining = "";
  }

  return { chunks, remaining };
}

function pickSpeechVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ??
    voices[0] ??
    null
  );
}

function normaliseVoiceError(error) {
  switch (error) {
    case "audio-capture":
      return "No microphone was detected. Connect a mic and try again.";
    case "network":
      return "Speech recognition lost its connection. Try again.";
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. On iPhone/iPad Safari, also make sure Siri or Dictation is enabled in Settings.";
    case "language-not-supported":
      return "Speech recognition does not support the current language.";
    default:
      return "Voice capture failed. Try again.";
  }
}

export default function MockInterviewBot({
  topicContent,
  topicId,
  roadmapSlug,
  phaseId,
}) {
  const questions = topicContent?.interviewQuestions ?? [];
  const hasGuidedContent = questions.length > 0;

  const [phase, setPhase] = useState("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationText, setEvaluationText] = useState("");
  const [parsedScore, setParsedScore] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  const [chatMessages, setChatMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);

  const [summary, setSummary] = useState("");
  const [freeformFinalScore, setFreeformFinalScore] = useState(null);

  const [saveStatus, setSaveStatus] = useState("idle");

  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);
  const shouldListenRef = useRef(false);
  const transcriptFlushTimerRef = useRef(null);
  const finalTranscriptBufferRef = useRef("");

  const speechQueueRef = useRef([]);
  const speechBufferRef = useRef("");
  const speechActiveRef = useRef(false);
  const currentUtteranceRef = useRef(null);

  const chatMessagesRef = useRef([]);
  const isStreamingRef = useRef(false);
  const phaseRef = useRef(phase);
  const modeRef = useRef(mode);
  const summaryRef = useRef(summary);
  const freeformFinalScoreRef = useRef(freeformFinalScore);
  const submitVoiceTurnRef = useRef(null);
  const interruptedForBargeInRef = useRef(false);
  const audioPermissionPrimedRef = useRef(false);
  const speechSynthesisPrimedRef = useRef(false);
  const initialRecognitionPrimedRef = useRef(false);
  const shouldAbortImmediatelyOnStartRef = useRef(false);

  const isIOSWebKit = isIOSWebKitBrowser();

  /* Provider voice available? If so, no browser speech API needed */
  const [useProviderVoice, setUseProviderVoice] = useState(IS_PROVIDER_VOICE_AVAILABLE);
  const deepgramSTTRef = useRef(null);
  const deepgramTTSRef = useRef(null);

  const isVoiceSupported =
    typeof window !== "undefined" &&
    (useProviderVoice ||
      (Boolean(getSpeechRecognitionCtor()) && "speechSynthesis" in window));

  const updateChatMessages = useCallback((updater) => {
    setChatMessages((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      chatMessagesRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

  useEffect(() => {
    freeformFinalScoreRef.current = freeformFinalScore;
  }, [freeformFinalScore]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

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
      /* Provider TTS cancel */
      if (deepgramTTSRef.current) {
        deepgramTTSRef.current.cancel();
      }
      /* Browser-native TTS cancel */
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      }
      speechQueueRef.current = [];
      currentUtteranceRef.current = null;
      speechActiveRef.current = false;
      if (clearBuffer) {
        speechBufferRef.current = "";
      }
      setIsAssistantSpeaking(false);
    },
    [],
  );

  const stopListening = useCallback(
    (nextStatus = "idle") => {
      shouldListenRef.current = false;
      clearTranscriptTimer();
      finalTranscriptBufferRef.current = "";
      setInterimTranscript("");

      /* Provider STT stop */
      if (deepgramSTTRef.current && deepgramSTTRef.current.isActive()) {
        deepgramSTTRef.current.stop();
      }

      if (recognitionActiveRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }

      setRecognitionStatus(nextStatus);
    },
    [clearTranscriptTimer],
  );

  const startListening = useCallback(() => {
    if (!isVoiceSupported) return;
    if (phaseRef.current !== "freeform" || modeRef.current !== "freeform") return;
    if (phaseRef.current === "complete") return;
    if (isStreamingRef.current || speechActiveRef.current) return;

    shouldListenRef.current = true;
    setVoiceError("");
    setRecognitionStatus("starting");

    /* ── Provider-backed STT ─────────────────────────── */
    if (useProviderVoice) {
      // Destroy any existing instance and create a fresh one
      if (deepgramSTTRef.current) {
        deepgramSTTRef.current.destroy();
      }

      deepgramSTTRef.current = createDeepgramSTT({
        onTranscript: (text, isFinal) => {
          if (!text && isFinal) {
            // UtteranceEnd with no text — flush any buffered transcript
            const buffered = finalTranscriptBufferRef.current.trim();
            if (buffered) {
              finalTranscriptBufferRef.current = "";
              setInterimTranscript("");
              setRecognitionStatus("processing");
              submitVoiceTurnRef.current?.(buffered);
            }
            return;
          }

          if (isFinal) {
            finalTranscriptBufferRef.current = `${finalTranscriptBufferRef.current} ${text}`.trim();
            setInterimTranscript("");

            // Debounce: after USER_SPEECH_DEBOUNCE_MS of silence, submit
            clearTranscriptTimer();
            transcriptFlushTimerRef.current = setTimeout(() => {
              const buffered = finalTranscriptBufferRef.current.trim();
              finalTranscriptBufferRef.current = "";
              setInterimTranscript("");
              if (buffered) {
                setRecognitionStatus("processing");
                // Stop provider STT before submitting
                if (deepgramSTTRef.current) {
                  deepgramSTTRef.current.stop();
                }
                submitVoiceTurnRef.current?.(buffered);
              }
            }, USER_SPEECH_DEBOUNCE_MS);
          } else {
            setInterimTranscript(text);
          }
        },
        onError: (msg) => {
          setRecognitionStatus("error");
          setVoiceError(msg);
          shouldListenRef.current = false;
        },
        onClose: () => {
          // If we should still be listening, the onEnd in streamAssistantTurn
          // will restart — no action needed here.
        },
      });

      deepgramSTTRef.current.start().then(() => {
        setRecognitionStatus("listening");
      }).catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to start provider voice.";
        setVoiceError(msg);
        setRecognitionStatus("error");
        shouldListenRef.current = false;
      });
      return;
    }

    /* ── Browser-native STT fallback ─────────────────── */
    if (!recognitionRef.current || recognitionActiveRef.current) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.toLowerCase().includes("already started")) {
        shouldListenRef.current = false;
        setRecognitionStatus("error");
        setVoiceError("Unable to start the microphone right now.");
      }
    }
  }, [isVoiceSupported, useProviderVoice, clearTranscriptTimer]);

  const enqueueSpeechChunk = useCallback(
    (rawText) => {
      const speakableText = cleanSpeechText(rawText);
      if (!speakableText) return;

      /* ── Provider-backed TTS ─────────────────────────── */
      if (useProviderVoice) {
        if (!deepgramTTSRef.current) {
          deepgramTTSRef.current = createDeepgramTTS({
            onStart: () => {
              speechActiveRef.current = true;
              setIsAssistantSpeaking(true);
              setRecognitionStatus("processing");
            },
            onEnd: () => {
              speechActiveRef.current = false;
              setIsAssistantSpeaking(false);
              if (shouldListenRef.current && !isStreamingRef.current) {
                startListening();
              }
            },
            onError: (msg) => {
              speechActiveRef.current = false;
              setIsAssistantSpeaking(false);
              setVoiceError(msg);
              if (shouldListenRef.current && !isStreamingRef.current) {
                startListening();
              }
            },
          });
        }
        deepgramTTSRef.current.speak(speakableText);
        return;
      }

      /* ── Browser-native TTS fallback ─────────────────── */
      speechQueueRef.current.push(speakableText);

      const speakNext = () => {
        if (speechActiveRef.current) return;
        const nextText = speechQueueRef.current.shift();
        if (!nextText) {
          setIsAssistantSpeaking(false);
          if (shouldListenRef.current && !isStreamingRef.current) {
            startListening();
          }
          return;
        }

        const utterance = new SpeechSynthesisUtterance(nextText);
        utterance.rate = 1.02;
        utterance.pitch = 1;
        utterance.lang = "en-US";
        utterance.voice = pickSpeechVoice();

        utterance.onstart = () => {
          speechActiveRef.current = true;
          currentUtteranceRef.current = utterance;
          setIsAssistantSpeaking(true);
          setRecognitionStatus("processing");
        };

        utterance.onend = () => {
          speechActiveRef.current = false;
          currentUtteranceRef.current = null;
          if (speechQueueRef.current.length > 0) {
            speakNext();
            return;
          }
          setIsAssistantSpeaking(false);
          if (shouldListenRef.current && !isStreamingRef.current) {
            startListening();
          }
        };

        utterance.onerror = () => {
          speechActiveRef.current = false;
          currentUtteranceRef.current = null;
          setIsAssistantSpeaking(false);
          if (shouldListenRef.current && !isStreamingRef.current) {
            startListening();
          }
        };

        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      };

      if (!speechActiveRef.current) {
        speakNext();
      }
    },
    [startListening, useProviderVoice],
  );

  const flushSpeechBuffer = useCallback(
    (force = false) => {
      const { chunks, remaining } = splitSpeechChunks(speechBufferRef.current, force);
      speechBufferRef.current = remaining;
      chunks.forEach((chunk) => enqueueSpeechChunk(chunk));
    },
    [enqueueSpeechChunk],
  );

  const streamAssistantTurn = useCallback(
    async ({ apiMessages, assistantIndex, resumeListeningAfter }) => {
      stopListening("processing");
      cancelAssistantSpeech();
      speechBufferRef.current = "";
      interruptedForBargeInRef.current = false;
      setIsStreaming(true);
      setVoiceError("");

      const controller = new AbortController();
      abortRef.current = controller;

      const result = await streamChatResponse({
        messages: apiMessages,
        signal: controller.signal,
        onToken: (token, fullContent) => {
          updateChatMessages((prev) => {
            const updated = [...prev];
            updated[assistantIndex] = { role: "assistant", content: fullContent };
            return updated;
          });
          speechBufferRef.current += token;
          flushSpeechBuffer(false);
        },
      });

      abortRef.current = null;
      setIsStreaming(false);

      if (result.status === "aborted") {
        flushSpeechBuffer(false);
        if (resumeListeningAfter && interruptedForBargeInRef.current) {
          startListening();
        }
        return null;
      }

      if (result.status === "error") {
        flushSpeechBuffer(true);
        setVoiceError(result.message);
        if (resumeListeningAfter) {
          shouldListenRef.current = true;
          if (!speechActiveRef.current) {
            startListening();
          }
        }
        return null;
      }

      updateChatMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = { role: "assistant", content: result.content };
        return updated;
      });

      speechBufferRef.current += "";
      flushSpeechBuffer(true);

      shouldListenRef.current = resumeListeningAfter;
      if (resumeListeningAfter && !speechActiveRef.current && speechQueueRef.current.length === 0) {
        startListening();
      }

      return result.content;
    },
    [
      cancelAssistantSpeech,
      flushSpeechBuffer,
      startListening,
      stopListening,
      updateChatMessages,
    ],
  );

  const saveSession = useCallback(
    async ({ summaryText = null, sessionMode, finalScore = null, messagesOverride = null }) => {
      if (saveStatus === "saving" || saveStatus === "saved") return;
      setSaveStatus("saving");

      const localSessionId = getOrCreateSessionId();
      const effectiveMode = sessionMode ?? modeRef.current;
      const currentAnswered = answeredQuestions;

      let avgScore = null;
      let allMessages = [];

      if (effectiveMode === "guided") {
        const scored = currentAnswered.filter((question) => question.score !== null);
        if (scored.length > 0) {
          avgScore = scored.reduce((sum, question) => sum + question.score, 0) / scored.length;
        }
        allMessages = currentAnswered.map((question) => ({
          role: "user",
          content: question.userAnswer,
          score: question.score,
          feedback: question.feedback,
          questionIndex: question.questionIndex,
        }));
      } else {
        const transcriptMessages = messagesOverride ?? chatMessagesRef.current;
        allMessages = transcriptMessages.slice(0, MAX_SAVED_FREEFORM_MESSAGES).map((message, index) => ({
          role: message.role,
          content: message.content,
          source: message.role === "user" ? "voice" : "assistant",
          turn: index + 1,
        }));
        avgScore = finalScore ?? freeformFinalScoreRef.current;
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
            summary: summaryText ?? summaryRef.current ?? null,
            messages: allMessages,
            sessionId: localSessionId,
          }),
        });

        setSaveStatus(res.ok ? "saved" : "error");
      } catch {
        setSaveStatus("error");
      }
    },
    [answeredQuestions, phaseId, roadmapSlug, saveStatus, topicContent.title, topicId],
  );

  const submitVoiceTurn = useCallback(
    async (transcript) => {
      const text = transcript.trim();
      if (!text || isStreamingRef.current || phaseRef.current !== "freeform") return;

      const userMessage = { role: "user", content: text };
      const nextMessages = [
        ...chatMessagesRef.current,
        userMessage,
        { role: "assistant", content: "" },
      ];
      const assistantIndex = nextMessages.length - 1;

      updateChatMessages(nextMessages);

      const systemMsg = buildFreeformSystemPrompt(topicContent);
      const apiMessages = [
        { role: "system", content: systemMsg },
        ...nextMessages.slice(0, assistantIndex),
      ];

      await streamAssistantTurn({
        apiMessages,
        assistantIndex,
        resumeListeningAfter: true,
      });
    },
    [streamAssistantTurn, topicContent, updateChatMessages],
  );

  useEffect(() => {
    submitVoiceTurnRef.current = submitVoiceTurn;
  }, [submitVoiceTurn]);

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
      setRecognitionStatus("listening");
      setVoiceError("");
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

      setInterimTranscript(interim.trim());
      clearTranscriptTimer();

      if (finalTranscriptBufferRef.current) {
        transcriptFlushTimerRef.current = setTimeout(() => {
          const bufferedTranscript = finalTranscriptBufferRef.current.trim();
          finalTranscriptBufferRef.current = "";
          setInterimTranscript("");
          stopListening("processing");
          submitVoiceTurnRef.current?.(bufferedTranscript);
        }, USER_SPEECH_DEBOUNCE_MS);
      }
    };

    recognition.onerror = (event) => {
      recognitionActiveRef.current = false;
      if (event.error === "aborted") return;

      setRecognitionStatus("error");
      setVoiceError(normaliseVoiceError(event.error));

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;

      if (
        shouldListenRef.current &&
        phaseRef.current === "freeform" &&
        modeRef.current === "freeform" &&
        !isStreamingRef.current &&
        !speechActiveRef.current
      ) {
        window.setTimeout(() => {
          if (
            shouldListenRef.current &&
            phaseRef.current === "freeform" &&
            modeRef.current === "freeform" &&
            !isStreamingRef.current &&
            !speechActiveRef.current
          ) {
            startListening();
          }
        }, 250);
        return;
      }

      if (phaseRef.current !== "complete") {
        setRecognitionStatus("idle");
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
  }, [clearTranscriptTimer, isIOSWebKit, isVoiceSupported, startListening, stopListening]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handler = (event) => {
      if (event.key === "Escape") {
        abortRef.current?.abort();
        stopListening("idle");
        cancelAssistantSpeech();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cancelAssistantSpeech, isOpen, stopListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (phase === "guided" && !isEvaluating && !evaluationText) {
      window.setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [evaluationText, isEvaluating, phase, currentQuestionIndex]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopListening("idle");
      cancelAssistantSpeech();
      /* Cleanup provider instances */
      if (deepgramSTTRef.current) {
        deepgramSTTRef.current.destroy();
        deepgramSTTRef.current = null;
      }
      if (deepgramTTSRef.current) {
        deepgramTTSRef.current.destroy();
        deepgramTTSRef.current = null;
      }
    };
  }, [cancelAssistantSpeech, stopListening]);

  function handleOpen() {
    setIsOpen(true);
    if (phase === "idle" || phase === "complete") {
      resetState(false);
      setPhase("mode-select");
    }
  }

  function handleClose() {
    abortRef.current?.abort();
    stopListening("idle");
    cancelAssistantSpeech();
    setIsOpen(false);
  }

  function resetState(fullReset = true) {
    abortRef.current?.abort();
    stopListening("idle");
    cancelAssistantSpeech();
    interruptedForBargeInRef.current = false;

    if (fullReset) {
      setMode(null);
      setPhase("mode-select");
    }

    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setIsEvaluating(false);
    setEvaluationText("");
    setParsedScore(null);
    setAnsweredQuestions([]);
    updateChatMessages([]);
    setIsStreaming(false);
    setRecognitionStatus(isVoiceSupported ? "idle" : "unsupported");
    setInterimTranscript("");
    setVoiceError("");
    setSummary("");
    setFreeformFinalScore(null);
    setSaveStatus("idle");
  }

  function startGuidedMode() {
    setMode("guided");
    setPhase("guided");
  }

  async function startFreeformMode() {
    if (!useProviderVoice && isIOSWebKit) {
      primeSpeechSynthesis();

      const permissionGranted = await primeAudioPermission();
      if (!permissionGranted) {
        setVoiceError(
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

    setMode("freeform");
    setPhase("freeform");
    await startFreeformInterview();
  }

  async function submitAnswer() {
    if (!userAnswer.trim() || isEvaluating) return;

    const question = questions[currentQuestionIndex];
    setIsEvaluating(true);
    setEvaluationText("");
    setParsedScore(null);

    const msgs = buildGuidedEvaluationMessages(question, userAnswer, topicContent.title);
    const controller = new AbortController();
    abortRef.current = controller;

    let finalText = "";
    const result = await streamChatResponse({
      messages: msgs,
      signal: controller.signal,
      onToken: (_token, fullContent) => {
        finalText = fullContent;
        setEvaluationText(fullContent);
        setParsedScore(parseScore(fullContent));
      },
    });

    abortRef.current = null;
    setIsEvaluating(false);

    if (result.status === "aborted") return;

    const score = parseScore(finalText);
    setAnsweredQuestions((prev) => [
      ...prev,
      {
        questionIndex: currentQuestionIndex,
        question,
        userAnswer,
        score,
        feedback: finalText,
      },
    ]);
  }

  function advanceGuided() {
    const next = currentQuestionIndex + 1;
    if (next < questions.length) {
      setCurrentQuestionIndex(next);
      setUserAnswer("");
      setEvaluationText("");
      setParsedScore(null);
    } else {
      finishGuided();
    }
  }

  function finishGuided() {
    setPhase("complete");
    saveSession({ sessionMode: "guided" });
  }

  async function startFreeformInterview() {
    updateChatMessages([{ role: "assistant", content: "" }]);

    const systemMsg = buildFreeformSystemPrompt(topicContent);
    const openingMessages = [
      { role: "system", content: systemMsg },
      {
        role: "user",
        content:
          "Please introduce yourself briefly and ask your first interview question.",
      },
    ];

    await streamAssistantTurn({
      apiMessages: openingMessages,
      assistantIndex: 0,
      resumeListeningAfter: true,
    });
  }

  function interruptAssistantAndListen() {
    interruptedForBargeInRef.current = true;
    abortRef.current?.abort();
    cancelAssistantSpeech();
    setIsStreaming(false);
    shouldListenRef.current = true;
    startListening();
  }

  async function endInterview() {
    abortRef.current?.abort();
    stopListening("processing");
    cancelAssistantSpeech();
    setSummary("");

    const filteredMessages = chatMessagesRef.current.filter(
      (message) => message.content !== "",
    );
    const nextMessages = [...filteredMessages, { role: "assistant", content: "" }];
    const assistantIndex = nextMessages.length - 1;

    updateChatMessages(nextMessages);

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
    setSummary(finalSummary);
    setFreeformFinalScore(score);
    setPhase("complete");
    stopListening("idle");

    await saveSession({
      summaryText: finalSummary,
      sessionMode: "freeform",
      finalScore: score,
      messagesOverride: chatMessagesRef.current,
    });
  }

  const guidedSubState = isEvaluating
    ? "evaluating"
    : evaluationText
      ? "evaluated"
      : "asking";

  const guidedAvgScore =
    answeredQuestions.length > 0
      ? (() => {
          const scored = answeredQuestions.filter((question) => question.score !== null);
          return scored.length > 0
            ? scored.reduce((sum, question) => sum + question.score, 0) / scored.length
            : null;
        })()
      : null;

  const voiceStatusText = (() => {
    if (!isVoiceSupported) return "Voice interview requires a browser with speech APIs or provider-backed voice.";
    if (voiceError) return voiceError;
    if (isStreaming) return "Interviewer is thinking.";
    if (isAssistantSpeaking) return "Interviewer is speaking.";
    if (recognitionStatus === "starting") return "Starting microphone.";
    if (recognitionStatus === "listening") return useProviderVoice ? "Listening (cloud voice)." : "Listening. Speak naturally.";
    if (recognitionStatus === "processing") return "Processing your answer.";
    if (!useProviderVoice && isIOSWebKit) return "Ready for your answer. Safari may require one tap to re-arm the mic.";
    return "Ready for your answer.";
  })();

  return (
    <>
      {!isOpen && (
        <button
          className="mock-interview-fab"
          onClick={handleOpen}
          aria-label="Start mock interview"
        >
          Practice Interview
        </button>
      )}

      {isOpen && (
        <>
          <div className="mock-interview-backdrop" onClick={handleClose} />
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
                    onClick={endInterview}
                    title="End Interview"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                  >
                    End
                  </button>
                )}
                <button className="chatbot-action-btn" onClick={handleClose} title="Close">
                  X
                </button>
              </div>
            </div>

            <div className="mock-interview-body">
              {phase === "mode-select" && (
                <div className="interview-mode-select">
                  <p className="interview-mode-intro">
                    Choose how to practice <strong>{topicContent?.title}</strong>
                  </p>
                  <div className="interview-mode-cards">
                    <button
                      className="interview-mode-card"
                      onClick={startGuidedMode}
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
                      onClick={startFreeformMode}
                      disabled={!isVoiceSupported}
                      title={
                        !isVoiceSupported
                          ? "Voice interview requires Chrome or Edge, or provider-backed voice."
                          : undefined
                      }
                    >
                      <span className="interview-mode-card-icon">🎙️</span>
                      <h4>Voice Interview</h4>
                      <p>
                        {useProviderVoice
                          ? "Cloud-powered voice with low-latency STT & natural TTS."
                          : "Spoken interview with auto-listening, live transcript capture, and streamed voice responses."}
                      </p>
                      {useProviderVoice && (
                        <span className="interview-voice-provider-badge">☁️ Cloud Voice</span>
                      )}
                    </button>
                  </div>
                  {!isVoiceSupported && (
                    <p className="interview-voice-support-note">
                      Voice mode needs browser speech APIs or cloud voice.
                    </p>
                  )}
                </div>
              )}

              {phase === "guided" && (
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
                    onChange={(event) => setUserAnswer(event.target.value)}
                    disabled={guidedSubState !== "asking"}
                    rows={4}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && event.ctrlKey && guidedSubState === "asking") {
                        submitAnswer();
                      }
                    }}
                  />

                  {guidedSubState === "asking" && (
                    <button
                      className="interview-submit-btn"
                      onClick={submitAnswer}
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
                    <button className="interview-nav-btn" onClick={advanceGuided}>
                      {currentQuestionIndex + 1 < questions.length
                        ? "Next Question ->"
                        : "Finish Interview"}
                    </button>
                  )}
                </div>
              )}

              {phase === "freeform" && (
                <div className="interview-freeform-panel">
                  <div className="interview-voice-panel">
                    <div className="interview-voice-status-row">
                      <span
                        className={`interview-voice-indicator interview-voice-indicator--${recognitionStatus}`}
                      >
                        {recognitionStatus === "listening"
                          ? useProviderVoice ? "☁️ Mic live" : "Mic live"
                          : useProviderVoice ? "☁️ Voice" : "Voice"}
                      </span>
                      {(isStreaming || isAssistantSpeaking) ? (
                        <button
                          className="interview-voice-action-btn"
                          onClick={interruptAssistantAndListen}
                        >
                          Interrupt &amp; Answer
                        </button>
                      ) : (
                        <button
                          className="interview-voice-action-btn"
                          onClick={startListening}
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

                  <div className="chatbot-messages interview-chat-messages">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`chatbot-bubble ${
                          message.role === "user" ? "chatbot-bubble-user" : "chatbot-bubble-assistant"
                        }`}
                      >
                        <div className="chatbot-bubble-content">
                          {message.role === "assistant" ? (
                            message.content ? (
                              <div
                                className="chatbot-markdown"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                              />
                            ) : (
                              <div className="chatbot-typing">
                                <span />
                                <span />
                                <span />
                              </div>
                            )
                          ) : (
                            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}

              {phase === "complete" && (
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
                          setSaveStatus("idle");
                          saveSession({
                            summaryText: summary,
                            sessionMode: mode,
                            finalScore: freeformFinalScore,
                            messagesOverride: chatMessagesRef.current,
                          });
                        }}
                      >
                        Retry Save
                      </button>
                    )}
                    <button className="interview-restart-btn" onClick={() => resetState(true)}>
                      Start New Interview
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
