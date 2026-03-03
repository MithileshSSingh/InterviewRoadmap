import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: { topicProgress: true },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    let result = roadmap.result ? JSON.parse(roadmap.result) : null;

    // Merge topic completion state from DB into the phases
    if (result && roadmap.topicProgress.length > 0) {
      const completedIds = new Set(
        roadmap.topicProgress.filter((t) => t.completed).map((t) => t.topicId),
      );
      if (result.phases) {
        result.phases = result.phases.map(
          (phase: { topics: { id: string }[] }) => ({
            ...phase,
            topics: phase.topics.map((topic: { id: string }) => ({
              ...topic,
              completed: completedIds.has(topic.id),
            })),
          }),
        );
      }
    }

    return NextResponse.json({
      roadmap: {
        id: roadmap.id,
        status: roadmap.status,
        role: roadmap.role,
        company: roadmap.company,
        experienceLevel: roadmap.experienceLevel,
        createdAt: roadmap.createdAt,
        errorMessage: roadmap.errorMessage,
        result,
      },
    });
  } catch (err) {
    console.error("[CareerForge GET] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch roadmap" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.roadmap.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CareerForge DELETE] Error:", err);
    return NextResponse.json(
      { error: "Failed to delete roadmap" },
      { status: 500 },
    );
  }
}
