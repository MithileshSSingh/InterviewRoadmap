import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function getSessionId(request: Request, userId: string | undefined): string | null {
  if (userId) return userId;
  return request.headers.get("x-session-id");
}

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = getSessionId(request, userId);

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = getSessionId(request, userId);

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, phaseId, topicId, topicTitle, phaseTitle, roadmapTitle, roadmapEmoji } = body;
  if (!slug || !phaseId || !topicId || !topicTitle || !phaseTitle || !roadmapTitle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const bookmark = await prisma.bookmark.upsert({
    where: { sessionId_slug_phaseId_topicId: { sessionId, slug, phaseId, topicId } },
    update: {},
    create: {
      sessionId,
      userId: userId ?? null,
      slug,
      phaseId,
      topicId,
      topicTitle,
      phaseTitle,
      roadmapTitle,
      roadmapEmoji: roadmapEmoji ?? null,
    },
  });

  return NextResponse.json(bookmark, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = getSessionId(request, userId);

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, phaseId, topicId } = body;
  if (!slug || !phaseId || !topicId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await prisma.bookmark.deleteMany({
    where: { sessionId, slug, phaseId, topicId },
  });

  return NextResponse.json({ success: true });
}
