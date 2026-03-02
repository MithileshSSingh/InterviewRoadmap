import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { topicId, completed } = await request.json();

    if (!topicId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: topicId, completed" },
        { status: 400 }
      );
    }

    await prisma.topicProgress.upsert({
      where: {
        roadmapId_topicId: { roadmapId: id, topicId },
      },
      create: {
        roadmapId: id,
        topicId,
        completed,
        completedAt: completed ? new Date() : null,
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CareerForge Progress] Error:", err);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
