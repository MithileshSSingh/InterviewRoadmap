import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ roadmaps: [] });
    }

    const roadmaps = await prisma.roadmap.findMany({
      where: { sessionId },
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
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
