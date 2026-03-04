import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, company, experienceLevel, sessionId } = body;

    if (!role?.trim() || !company?.trim() || !experienceLevel || !sessionId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: role, company, experienceLevel, sessionId",
        },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const roadmap = await prisma.roadmap.create({
      data: {
        sessionId,
        userId,
        role: role.trim(),
        company: company.trim(),
        experienceLevel,
        status: "pending",
      },
    });

    return NextResponse.json({ id: roadmap.id, status: roadmap.status });
  } catch (err) {
    console.error("[CareerForge Generate] Error:", err);
    return NextResponse.json(
      { error: "Failed to create roadmap. Please try again." },
      { status: 500 },
    );
  }
}
