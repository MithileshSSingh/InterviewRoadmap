export type ChatApiMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatStreamEvent =
  | { type: "token"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

export type StreamChatResult =
  | { status: "ok"; content: string }
  | { status: "aborted"; content: string }
  | { status: "error"; content: string; message: string };

interface StreamChatOptions {
  messages: ChatApiMessage[];
  signal?: AbortSignal;
  onToken?: (token: string, fullContent: string) => void;
}

function b64EncodeUnicode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function b64DecodeUnicode(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function parseSSEEvent(rawEvent: string): ChatStreamEvent | null {
  const data = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("");

  if (!data) return null;

  try {
    const jsonStr = b64DecodeUnicode(data);
    return JSON.parse(jsonStr) as ChatStreamEvent;
  } catch {
    return null;
  }
}

export async function streamChatResponse({
  messages,
  signal,
  onToken,
}: StreamChatOptions): Promise<StreamChatResult> {
  const payloadObj = { messages };
  const isProduction = process.env.NODE_ENV === "production";
  const requestBody = isProduction
    ? b64EncodeUnicode(JSON.stringify(payloadObj))
    : JSON.stringify(payloadObj);
  const contentType = isProduction ? "text/plain" : "application/json";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: requestBody,
      signal,
    });

    if (!response.ok) {
      return {
        status: "error",
        content: "",
        message: "Sorry, I couldn't process your request right now. Please try again.",
      };
    }

    if (!response.body) {
      return {
        status: "error",
        content: "",
        message: "No response received. Please try again.",
      };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamedContent = "";
    let streamErrorMessage = "";

    const processEvent = (event: ChatStreamEvent | null) => {
      if (!event) return;

      if (event.type === "token") {
        const token = event.content || "";
        streamedContent += token;
        onToken?.(token, streamedContent);
        return;
      }

      if (event.type === "error") {
        streamErrorMessage = event.message || "Something went wrong. Please try again.";
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const rawEvents = buffer.split("\n\n");
      buffer = rawEvents.pop() || "";

      rawEvents.forEach((rawEvent) => {
        processEvent(parseSSEEvent(rawEvent));
      });
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      processEvent(parseSSEEvent(buffer));
    }

    if (streamErrorMessage) {
      return {
        status: "error",
        content: streamedContent,
        message: streamErrorMessage,
      };
    }

    if (!streamedContent.trim()) {
      return {
        status: "error",
        content: streamedContent,
        message: "No response received. Please try again.",
      };
    }

    return { status: "ok", content: streamedContent };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return { status: "aborted", content: "" };
    }

    return {
      status: "error",
      content: "",
      message: "Something went wrong. Please try again.",
    };
  }
}
