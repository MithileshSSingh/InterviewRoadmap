import type { CareerForgeSSEEvent } from "./types";

// Mirror the b64DecodeUnicode from chatClient.ts
function b64DecodeUnicode(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function parseSSEEvent(rawEvent: string): CareerForgeSSEEvent | null {
  const data = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("");

  if (!data) return null;

  try {
    const jsonStr = b64DecodeUnicode(data);
    return JSON.parse(jsonStr) as CareerForgeSSEEvent;
  } catch {
    return null;
  }
}

interface StreamOptions {
  roadmapId: string;
  signal?: AbortSignal;
  onEvent: (event: CareerForgeSSEEvent) => void;
}

export async function streamCareerForge({
  roadmapId,
  signal,
  onEvent,
}: StreamOptions): Promise<"complete" | "error" | "aborted"> {
  try {
    const response = await fetch(`/api/careerforge/${roadmapId}/stream`, { signal });

    if (!response.ok || !response.body) return "error";

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const rawEvents = buffer.split("\n\n");
      buffer = rawEvents.pop() ?? "";

      for (const rawEvent of rawEvents) {
        const event = parseSSEEvent(rawEvent);
        if (!event) continue;
        onEvent(event);
        if (event.type === "complete") return "complete";
        if (event.type === "error") return "error";
      }
    }

    // Flush remaining buffer
    buffer += decoder.decode();
    if (buffer.trim()) {
      const event = parseSSEEvent(buffer);
      if (event) onEvent(event);
    }

    return "complete";
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") return "aborted";
    return "error";
  }
}
