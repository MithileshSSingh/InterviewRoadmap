import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json().catch(() => null);
  const { sessionId } = body ?? {};

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  // Nothing to do if the anon session IS the userId (already migrated)
  if (sessionId === userId) {
    return NextResponse.json({ migrated: 0 });
  }

  // Find all unclaimed anon bookmarks for this session
  const anonBookmarks = await prisma.bookmark.findMany({
    where: { sessionId, userId: null },
  });

  if (anonBookmarks.length === 0) {
    return NextResponse.json({ migrated: 0 });
  }

  // Find the user's existing bookmarks (already claimed, sessionId = userId)
  const userBookmarks = await prisma.bookmark.findMany({
    where: { sessionId: userId },
    select: { slug: true, phaseId: true, topicId: true },
  });

  const userKeys = new Set(
    userBookmarks.map((b) => `${b.slug}|${b.phaseId}|${b.topicId}`)
  );

  const toUpdate = anonBookmarks.filter(
    (b) => !userKeys.has(`${b.slug}|${b.phaseId}|${b.topicId}`)
  );
  const toDelete = anonBookmarks.filter((b) =>
    userKeys.has(`${b.slug}|${b.phaseId}|${b.topicId}`)
  );

  await prisma.$transaction(async (tx) => {
    // Delete anon duplicates that the user already owns
    if (toDelete.length > 0) {
      await tx.bookmark.deleteMany({
        where: { id: { in: toDelete.map((b) => b.id) } },
      });
    }
    // Claim the remaining anon bookmarks for this user
    if (toUpdate.length > 0) {
      await tx.bookmark.updateMany({
        where: { id: { in: toUpdate.map((b) => b.id) } },
        data: { userId, sessionId: userId },
      });
    }
  });

  return NextResponse.json({ migrated: toUpdate.length });
}
