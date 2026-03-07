import { marked } from "marked";

// ── Constants ─────────────────────────────────────────────────────────────────
export const USER_SPEECH_DEBOUNCE_MS = 1200;
export const MAX_SAVED_FREEFORM_MESSAGES = 50;
export const VOICE_TO_RESPOND = ["Google US English", "Samantha"];

// ── Markdown / score helpers ──────────────────────────────────────────────────
export function renderMarkdown(text) {
  return marked.parse(text, { async: false });
}

export function parseScore(text) {
  const match = text.match(/SCORE:\s*(\d+(?:\.\d+)?)\/10/i);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return Number.isNaN(val) ? null : Math.min(10, Math.max(0, val));
}

export function parseFreeformScore(text) {
  const match = text.match(/OVERALL SCORE:\s*(\d+(?:\.\d+)?)\/10/i);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return Number.isNaN(val) ? null : Math.min(10, Math.max(0, val));
}

export function scoreColorClass(score) {
  if (score === null) return "";
  if (score >= 7) return "interview-score-badge--green";
  if (score >= 5) return "interview-score-badge--yellow";
  return "interview-score-badge--red";
}

// ── Session ID ────────────────────────────────────────────────────────────────
export function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  let sid = localStorage.getItem("cf-session-id");
  if (!sid) {
    sid = `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("cf-session-id", sid);
  }
  return sid;
}

// ── Prompt builders ───────────────────────────────────────────────────────────
export function buildGuidedEvaluationMessages(question, userAnswer, topicTitle) {
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

const COMMON_INTERVIEW_RULES = `
INTERVIEW BEHAVIOR RULES

1. Communication Style
- Speak naturally as if in a real spoken interview.
- Keep responses concise and conversational.
- Do not produce long explanations unless giving the final summary.

2. Interview Flow
Follow this structure strictly:

Step 1 — Opening
- Start with a **one sentence introduction**.
- Immediately ask the **first interview question**.

Step 2 — Question Loop
For each turn:
- Ask **ONLY ONE question at a time**.
- Wait for the candidate's response before continuing.
- If the answer is:
  - **Vague → ask a clarifying follow-up**
  - **Partially correct → ask a deeper question**
  - **Strong → move to the next topic**

3. Follow-up Strategy
Use probing questions such as:
- "Can you explain that in more detail?"
- "Why does that work?"
- "What are the trade-offs?"
- "How would this behave in a real production system?"

4. Interview Termination Conditions
End the interview when **ANY ONE** of the following occurs:

Case 1:
You have asked **5-7 questions total**

Case 2:
The candidate says they are **done with the interview**

Case 3:
The candidate **asks to stop the interview**

5. Final Output (MANDATORY FORMAT)

When the interview ends, respond ONLY with the summary below:

OVERALL SCORE: X/10

Strengths:
- <1-2 key strengths>

Areas for Improvement:
- <1-2 specific improvements>

Short Feedback:
<2-3 concise sentences summarizing performance>

6. Important Constraints
- Never ask more questions **after the summary**
- Never ask **multiple questions in one turn**
- Keep the conversation **interview-like and interactive**
- in OVERALL SCORE: X/10 X should be strickly integer ... should not give NA`;

function createTopicPrompt(config) {
  const questions = (config.interviewQuestions || [])
    .map((q) => `- ${q.q}`)
    .join("\n");
  const explanation = (config.explanation || "").slice(0, 500);

  return `You are a **Senior Technical Interviewer** conducting a **mock technical interview** on a specific topic.

INTERVIEW TOPIC
Title: ${config.title}

BACKGROUND CONTEXT
${explanation}

QUESTION POOL (Use as inspiration. You may modify, extend, or ask follow-up questions.)
${questions || "Ask general questions related to the topic."}

${COMMON_INTERVIEW_RULES}`;
}

function createPhasePrompt(config) {
  const questions = (config.interviewQuestions || [])
    .map((q) => `- ${q.q}`)
    .join("\n");
  const explanation = (config.explanation || "").slice(0, 500);

  return `You are a **Senior Technical Interviewer** conducting a **phase-level mock technical interview**.
Your goal is to assess the candidate's broad understanding across multiple topics within this phase.

PHASE
Title: ${config.title}

BACKGROUND CONTEXT
${explanation || "Assess the candidate's comprehensive understanding of this learning phase."}

QUESTION POOL (Use as inspiration. You may modify, extend, or ask follow-up questions.)
${questions || "Ask comprehensive questions covering various sub-topics in this phase."}

${COMMON_INTERVIEW_RULES}`;
}

function createGeneralPrompt(config) {
  return `You are a **Senior Technical Interviewer** conducting a **general software engineering mock interview**.

INTERVIEW FOCUS
Title: ${config.title || "General Interview"}

BACKGROUND CONTEXT
${(config.explanation || "Evaluate the candidate's overall technical problem-solving and software design skills.").slice(0, 500)}

${COMMON_INTERVIEW_RULES}`;
}

export function getSystemPromptForConfig(config) {
  const type = config?.type || "topic";
  
  switch (type) {
    case "topic":
      return createTopicPrompt(config);
    case "phase":
      return createPhasePrompt(config);
    case "general":
    default:
      return createGeneralPrompt(config);
  }
}

// ── Browser / speech detection ────────────────────────────────────────────────
export function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isIOSWebKitBrowser() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isIOSDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && maxTouchPoints > 1);

  return isIOSDevice && /WebKit/i.test(ua);
}

// ── Speech text helpers ───────────────────────────────────────────────────────
export function cleanSpeechText(text) {
  return text
    .replace(/```[\s\S]*?```/g, " code example. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_~>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitSpeechChunks(buffer, force = false) {
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

export function pickSpeechVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  let voice = null;
  for (const preferredName of VOICE_TO_RESPOND) {
    voice = voices.find((v) => v.name === preferredName);
    if (voice) break;
  }
  voice = voice ?? voices[0] ?? null;
  return { voice, lang: voice?.lang ?? "en-US" };
}

// Chrome has a long-standing bug where SpeechSynthesisUtterance instances are garbage collected
// mid-speech if not referenced globally, which causes the `onend` event to never fire.
// We must keep a strong reference to them in the global scope until they finish.
export function keepUtteranceAlive(utterance) {
  if (typeof window === "undefined") return;
  window.__speechUtterances = window.__speechUtterances || [];
  window.__speechUtterances.push(utterance);
}

export function clearUtterance(utterance) {
  if (typeof window === "undefined" || !window.__speechUtterances) return;
  window.__speechUtterances = window.__speechUtterances.filter((u) => u !== utterance);
}

export function clearAllUtterances() {
  if (typeof window !== "undefined") {
    window.__speechUtterances = [];
  }
}

export function normaliseVoiceError(error) {
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
