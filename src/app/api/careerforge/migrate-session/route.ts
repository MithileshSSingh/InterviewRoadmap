import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 },
      );
    }

    // Migrate unclaimed roadmaps from this anonymous sessionId to the authenticated user
    const result = await prisma.roadmap.updateMany({
      where: {
        sessionId,
        userId: null,
      },
      data: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      migrated: result.count,
    });
  } catch (err) {
    console.error("[CareerForge Migrate] Error:", err);
    return NextResponse.json(
      { error: "Failed to migrate session data" },
      { status: 500 },
    );
  }
}
