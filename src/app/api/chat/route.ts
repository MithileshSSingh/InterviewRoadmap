import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

const ALLOWED_MODELS = ["google/gemini-2.0-flash-001", "google/gemini-2.0-flash-lite-preview-02-05", "google/gemini-3-flash-preview"];
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
    const rawBody = await request.text();
    let body: ChatRequestBody;
    try {
      const decodedStr = Buffer.from(rawBody, "base64").toString("utf8");
      body = JSON.parse(decodedStr);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid payload format. Expected Base64." },
        { status: 400 }
      );
    }
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Please try again." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Chat API] OPENROUTER_API_KEY or GEMINI_API_KEY is not configured in .env.local");
      return NextResponse.json(
        { error: "The assistant is not configured yet. Please contact the administrator." },
        { status: 503 }
      );
    }

    const modelName = process.env.GEMINI_MODEL || "google/gemini-2.0-flash-001";
    // Check if user has explicitly asked for a model that contains google/, if not allow custom openrouter model string
    const selectedModel = modelName.includes("/") ? modelName : `google/${modelName}`;

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

    // Create the model pointing to OpenRouter
    const llm = new ChatOpenAI({
      model: selectedModel,
      apiKey: apiKey,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
        },
      },
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
          const eventStr = JSON.stringify(event);
          const b64Event = Buffer.from(eventStr, "utf8").toString("base64");
          controller.enqueue(encoder.encode(`data: ${b64Event}\n\n`));
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

