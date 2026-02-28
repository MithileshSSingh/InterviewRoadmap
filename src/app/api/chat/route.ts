import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

const ALLOWED_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-3-flash-preview"];
const STREAM_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
}

type StreamEvent =
  | { type: "token"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      const maybeText = (part as { text?: unknown }).text;
      return typeof maybeText === "string" ? maybeText : "";
    })
    .join("");
}

function extractChunkText(messageChunk: unknown): string {
  if (!messageChunk || typeof messageChunk !== "object") return "";
  return contentToText((messageChunk as { content?: unknown }).content);
}

function extractAssistantFromUpdate(updateChunk: unknown): string {
  if (!updateChunk || typeof updateChunk !== "object") return "";

  for (const nodeUpdate of Object.values(updateChunk as Record<string, unknown>)) {
    if (!nodeUpdate || typeof nodeUpdate !== "object") continue;

    const messages = (nodeUpdate as { messages?: unknown }).messages;
    if (!Array.isArray(messages) || messages.length === 0) continue;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage !== "object") continue;

    const content = (lastMessage as { content?: unknown }).content;
    const text = contentToText(content);
    if (text) return text;
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Please try again." },
        { status: 400 }
      );
    }

    // --- security check: prevent raw curl access ---
    // In a production app you'd use real auth, but this prevents simple abuse
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    // We expect the request to come from our own host
    const isLocalhost = host?.includes("localhost") || host?.includes("127.0.0.1") || host?.includes("192.168.");
    const expectedOrigin = isLocalhost ? `http://${host}` : `https://${host}`;

    // If both origin and referer are missing, it's likely a script/curl
    if (!origin && !referer) {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 403 }
      );
    }

    // If origin exists, it should match our host
    if (origin && origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "Unauthorized origin" },
        { status: 403 }
      );
    }
    // -----------------------------------------------

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.error("[Chat API] GOOGLE_API_KEY is not configured in .env.local");
      return NextResponse.json(
        { error: "The assistant is not configured yet. Please contact the administrator." },
        { status: 503 }
      );
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const selectedModel = ALLOWED_MODELS.includes(modelName) ? modelName : "gemini-2.0-flash";

    // Convert incoming messages to LangChain message objects
    const langchainMessages = messages.map((msg) => {
      switch (msg.role) {
        case "system":
          return new SystemMessage(msg.content);
        case "assistant":
          return new AIMessage(msg.content);
        case "user":
        default:
          return new HumanMessage(msg.content);
      }
    });

    // Create the model (LangGraph stream mode will emit tokens)
    const llm = new ChatGoogleGenerativeAI({
      model: selectedModel,
      apiKey,
    });

    // Define the callModel node for LangGraph
    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const response = await llm.invoke(state.messages);
      return { messages: [response] };
    };

    // Build the LangGraph graph: START → callModel → END
    const graph = new StateGraph(MessagesAnnotation)
      .addNode("callModel", callModel)
      .addEdge("__start__", "callModel")
      .addEdge("callModel", "__end__")
      .compile();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const pushEvent = (event: StreamEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          let streamedContent = "";
          let fallbackContentFromUpdates = "";

          const iterator = await graph.stream(
            { messages: langchainMessages },
            { streamMode: ["messages", "updates"] }
          );

          for await (const [mode, chunk] of iterator as AsyncIterable<[string, unknown]>) {
            if (mode === "messages" && Array.isArray(chunk)) {
              const [messageChunk, metadata] = chunk as [unknown, { langgraph_node?: string }];

              if (metadata?.langgraph_node && metadata.langgraph_node !== "callModel") {
                continue;
              }

              const token = extractChunkText(messageChunk);
              if (!token) continue;

              streamedContent += token;
              pushEvent({ type: "token", content: token });
            }

            if (mode === "updates") {
              const contentFromUpdate = extractAssistantFromUpdate(chunk);
              if (contentFromUpdate) fallbackContentFromUpdates = contentFromUpdate;
            }
          }

          if (!streamedContent && fallbackContentFromUpdates) {
            pushEvent({ type: "token", content: fallbackContentFromUpdates });
          }

          pushEvent({ type: "done" });
          controller.close();
        } catch (streamErr) {
          console.error("[Chat API] Stream error:", streamErr);
          pushEvent({
            type: "error",
            message: "Something went wrong while streaming the response.",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: STREAM_HEADERS,
    });
  } catch (err) {
    console.error("[Chat API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
