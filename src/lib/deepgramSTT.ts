/**
 * Deepgram real-time Speech-to-Text client helper.
 *
 * Uses MediaRecorder + native WebSocket to stream microphone audio
 * to Deepgram's /v1/listen endpoint for low-latency transcription.
 */

export interface DeepgramSTTCallbacks {
  /** Called for each transcript result. `isFinal` indicates end-of-utterance. */
  onTranscript: (text: string, isFinal: boolean) => void;
  /** Called when the connection or mediaRecorder encounters an error. */
  onError: (message: string) => void;
  /** Called when the session has fully closed. */
  onClose: () => void;
}

interface DeepgramSTTInstance {
  /** Begin microphone capture and streaming to Deepgram. */
  start: () => Promise<void>;
  /** Stop microphone and close the WebSocket. */
  stop: () => void;
  /** Hard cleanup — stops everything and prevents reuse. */
  destroy: () => void;
  /** Whether the instance is currently capturing + streaming. */
  isActive: () => boolean;
}

const DEEPGRAM_WS_BASE = "wss://api.deepgram.com/v1/listen";

/**
 * Fetch a short-lived Deepgram token from our backend.
 */
async function fetchToken(): Promise<string> {
  const res = await fetch("/api/voice/token", { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to fetch voice token.");
  }
  const data = await res.json();
  if (!data.token) throw new Error("No token returned from voice API.");
  return data.token as string;
}

export function createDeepgramSTT(callbacks: DeepgramSTTCallbacks): DeepgramSTTInstance {
  let ws: WebSocket | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let destroyed = false;
  let active = false;

  function cleanup() {
    active = false;

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      try {
        mediaRecorder.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRecorder = null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }

    if (ws && ws.readyState !== WebSocket.CLOSED) {
      try {
        // Send close message per Deepgram protocol
        ws.send(JSON.stringify({ type: "CloseStream" }));
        ws.close();
      } catch {
        /* ignore */
      }
    }
    ws = null;
  }

  async function start() {
    if (destroyed || active) return;

    try {
      // Guard: getUserMedia requires a secure context (HTTPS) on mobile browsers
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone access requires HTTPS. On mobile, make sure you're using a secure connection.",
        );
      }

      // 1. Get microphone stream
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Get short-lived token
      const token = await fetchToken();

      // 3. Detect best supported audio MIME type for MediaRecorder
      const MIME_CANDIDATES = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
        "",  // empty = browser default
      ];
      let selectedMime = "";
      for (const mime of MIME_CANDIDATES) {
        if (!mime || (typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(mime))) {
          selectedMime = mime;
          break;
        }
      }

      // Map MIME to Deepgram encoding hint
      let dgEncoding = "";
      if (selectedMime.includes("webm") || selectedMime.includes("ogg")) {
        dgEncoding = "&encoding=opus";
      } else if (selectedMime.includes("mp4")) {
        dgEncoding = "&encoding=aac";
      }

      // 4. Open WebSocket to Deepgram (auth via subprotocol header — Deepgram's documented browser method)
      const wsUrl = `${DEEPGRAM_WS_BASE}?model=nova-3&smart_format=true&interim_results=true&endpointing=300&utterance_end_ms=1200&vad_events=true${dgEncoding}`;
      ws = new WebSocket(wsUrl, ["token", token]);

      ws.onopen = () => {
        if (destroyed) {
          cleanup();
          return;
        }
        active = true;

        // 5. Start MediaRecorder, send audio chunks every 250ms
        const recorderOpts: MediaRecorderOptions = {};
        if (selectedMime) {
          recorderOpts.mimeType = selectedMime;
        }
        mediaRecorder = new MediaRecorder(stream!, recorderOpts);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws?.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };
        mediaRecorder.onerror = () => {
          callbacks.onError("Microphone recording failed.");
          cleanup();
        };
        mediaRecorder.start(250);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string);

          // Transcript result
          if (msg.type === "Results" && msg.channel?.alternatives?.length > 0) {
            const alt = msg.channel.alternatives[0];
            const text = (alt.transcript || "").trim();
            if (text) {
              callbacks.onTranscript(text, msg.is_final === true);
            }
          }

          // UtteranceEnd event — signal end of speech
          if (msg.type === "UtteranceEnd") {
            callbacks.onTranscript("", true);
          }
        } catch {
          /* ignore malformed messages */
        }
      };

      ws.onerror = () => {
        callbacks.onError("Voice connection error. Please try again.");
        cleanup();
      };

      ws.onclose = () => {
        active = false;
        callbacks.onClose();
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start voice capture.";
      callbacks.onError(message);
      cleanup();
    }
  }

  function stop() {
    cleanup();
  }

  function destroy() {
    destroyed = true;
    cleanup();
  }

  function isActive() {
    return active;
  }

  return { start, stop, destroy, isActive };
}
