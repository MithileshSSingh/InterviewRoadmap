import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { topicId, topicTitle, roadmapSlug, phaseId, mode, score, summary, messages, sessionId: bodySessionId } = body;

  if (!topicId || !topicTitle || !roadmapSlug || !phaseId || !mode || !messages || !bodySessionId) {
    return NextResponse.json(
      { error: "Missing required fields: topicId, topicTitle, roadmapSlug, phaseId, mode, messages, sessionId" },
      { status: 400 },
    );
  }

  if (mode !== "guided" && mode !== "freeform") {
    return NextResponse.json({ error: "mode must be 'guided' or 'freeform'" }, { status: 400 });
  }

  const numericScore = score !== undefined && score !== null ? Number(score) : null;
  if (numericScore !== null && (numericScore < 0 || numericScore > 10)) {
    return NextResponse.json({ error: "score must be between 0 and 10" }, { status: 400 });
  }

  const messagesJson = typeof messages === "string" ? messages : JSON.stringify(messages);

  const record = await prisma.interviewSession.create({
    data: {
      topicId,
      topicTitle,
      roadmapSlug,
      phaseId,
      mode,
      score: numericScore,
      summary: summary ?? null,
      messages: messagesJson,
      sessionId: bodySessionId,
      userId: userId ?? null,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ id: record.id, createdAt: record.createdAt }, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const headerSessionId = request.headers.get("x-session-id");

  const effectiveId = userId ?? headerSessionId;
  if (!effectiveId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const where = userId ? { userId } : { sessionId: effectiveId };

  const sessions = await prisma.interviewSession.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      topicId: true,
      topicTitle: true,
      roadmapSlug: true,
      phaseId: true,
      mode: true,
      score: true,
      completedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(sessions);
}
