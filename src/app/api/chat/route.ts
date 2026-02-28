import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

const ALLOWED_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-3-flash-preview"];

interface ChatRequestBody {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
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

    // Create the model (no streaming)
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

    // Invoke the graph (single call, no streaming)
    const result = await graph.invoke({ messages: langchainMessages });

    // Extract the assistant's response (last message in the result)
    const lastMessage = result.messages[result.messages.length - 1];
    const content = typeof lastMessage.content === "string"
      ? lastMessage.content
      : "";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[Chat API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
