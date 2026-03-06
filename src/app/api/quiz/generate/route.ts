import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TopicContent {
  title: string;
  explanation: string;
  codeExample?: string;
  commonMistakes?: string[];
  interviewQuestions?: { q: string; a: string }[];
}

interface GenerateQuizRequest {
  topicContent: TopicContent;
  difficulty?: "beginner" | "intermediate" | "advanced";
  count?: number;
}

interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "code-output";
  question: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function POST(request: Request) {
  try {
    const body: GenerateQuizRequest = await request.json();
    const { topicContent, difficulty = "intermediate", count = 5 } = body;

    if (!topicContent?.title || !topicContent?.explanation) {
      return NextResponse.json(
        { error: "Missing required topicContent fields" },
        { status: 400 },
      );
    }

    const clampedCount = Math.min(Math.max(count, 3), 10);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API not configured" },
        { status: 503 },
      );
    }

    const modelName = process.env.FREE_MODEL ?? "google/gemini-2.0-flash-001";
    const selectedModel = modelName.includes("/")
      ? modelName
      : `google/${modelName}`;

    const llm = new ChatOpenAI({
      model: selectedModel,
      apiKey,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {},
      },
    });

    const systemPrompt = `You are a technical interview quiz generator. Generate exactly ${clampedCount} quiz questions at ${difficulty} difficulty level.

TOPIC CONTEXT:
Title: ${topicContent.title}
Explanation: ${topicContent.explanation}
${topicContent.codeExample ? `Code Examples: ${topicContent.codeExample}` : ""}
${topicContent.commonMistakes ? `Common Mistakes: ${topicContent.commonMistakes.join("; ")}` : ""}

RULES:
- Mix question types: "multiple-choice", "true-false", "code-output"
- For "code-output" questions, include a "code" field with a code snippet
- For "true-false", options must be exactly ["True", "False"]
- For "multiple-choice", provide exactly 4 options
- correctAnswer is the 0-based index of the correct option
- Each explanation should be 1-2 sentences referencing the topic
- Each question id should be a short unique slug (e.g., "q1", "q2")
- Ensure only ONE answer is correct per question

Respond with ONLY a valid JSON array of objects. No markdown, no explanation, no code fences. Example format:
[{"id":"q1","type":"multiple-choice","question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(
        `Generate ${clampedCount} ${difficulty}-level quiz questions for the topic: "${topicContent.title}"`,
      ),
    ]);

    const content =
      typeof response.content === "string" ? response.content : "";

    // Extract JSON from response (handle potential markdown fences)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const questions: QuizQuestion[] = JSON.parse(jsonStr);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid quiz format returned");
    }

    for (const q of questions) {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        typeof q.correctAnswer !== "number"
      ) {
        throw new Error("Malformed question in response");
      }
    }

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("[Quiz Generate] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 },
    );
  }
}
