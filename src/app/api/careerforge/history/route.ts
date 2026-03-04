import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Build OR condition: match by userId OR sessionId
    const whereConditions: Record<string, string>[] = [];
    if (userId) {
      whereConditions.push({ userId });
    }
    if (sessionId) {
      whereConditions.push({ sessionId });
    }

    if (whereConditions.length === 0) {
      return NextResponse.json({ roadmaps: [] });
    }

    const roadmaps = await prisma.roadmap.findMany({
      where:
        whereConditions.length === 1
          ? whereConditions[0]
          : { OR: whereConditions },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        company: true,
        experienceLevel: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        errorMessage: true,
      },
      take: 20,
    });

    return NextResponse.json({ roadmaps });
  } catch (err) {
    console.error("[CareerForge History] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
