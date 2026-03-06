/**
 * Deepgram Text-to-Speech client helper.
 *
 * Fetches audio from our /api/voice/tts proxy and plays it via Web Audio API.
 * Supports queuing multiple speak() calls and cancellation.
 */

export interface DeepgramTTSCallbacks {
  /** Called when audio playback starts for a chunk. */
  onStart?: () => void;
  /** Called when all queued audio has finished playing. */
  onEnd?: () => void;
  /** Called on any error (network, decoding, etc.). */
  onError?: (message: string) => void;
}

interface DeepgramTTSInstance {
  /** Add text to the speak queue. Plays immediately if nothing is playing. */
  speak: (text: string) => void;
  /** Cancel all queued and currently-playing audio. */
  cancel: () => void;
  /** Whether audio is currently playing. */
  isPlaying: () => boolean;
  /** Clean up the AudioContext. */
  destroy: () => void;
}

export function createDeepgramTTS(callbacks: DeepgramTTSCallbacks = {}): DeepgramTTSInstance {
  let audioCtx: AudioContext | null = null;
  let currentSource: AudioBufferSourceNode | null = null;
  let queue: string[] = [];
  let processing = false;
  let playing = false;
  let destroyed = false;
  let currentAbort: AbortController | null = null;

  function getAudioContext(): AudioContext {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  }

  async function playNext() {
    if (destroyed || processing) return;

    const text = queue.shift();
    if (!text) {
      playing = false;
      callbacks.onEnd?.();
      return;
    }

    processing = true;
    playing = true;

    const controller = new AbortController();
    currentAbort = controller;

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "TTS request failed.");
      }

      const arrayBuffer = await res.arrayBuffer();
      const ctx = getAudioContext();

      // Resume context if suspended (autoplay policy)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (destroyed) return;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      currentSource = source;

      callbacks.onStart?.();

      source.onended = () => {
        currentSource = null;
        processing = false;
        playNext();
      };

      source.start(0);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Cancelled — do nothing
        processing = false;
        return;
      }
      const message = err instanceof Error ? err.message : "Audio playback failed.";
      callbacks.onError?.(message);
      processing = false;
      playing = false;
    }
  }

  function speak(text: string) {
    if (destroyed) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    queue.push(trimmed);
    if (!processing) {
      playNext();
    }
  }

  function cancel() {
    queue = [];

    if (currentAbort) {
      currentAbort.abort();
      currentAbort = null;
    }

    if (currentSource) {
      try {
        currentSource.stop();
        currentSource.disconnect();
      } catch {
        /* ignore */
      }
      currentSource = null;
    }

    processing = false;
    playing = false;
    callbacks.onEnd?.();
  }

  function isPlaying() {
    return playing;
  }

  function destroy() {
    destroyed = true;
    cancel();
    if (audioCtx && audioCtx.state !== "closed") {
      audioCtx.close().catch(() => {
        /* ignore */
      });
    }
    audioCtx = null;
  }

  return { speak, cancel, isPlaying, destroy };
}
