import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FeedbackSchema } from "@/lib/feedback/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const result = FeedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { data } = result;

    const feedback = await prisma.feedback.create({
      data: {
        type: data.type,
        message: data.message,
        category: data.category || null,
        email: data.email || null,
        rating: data.rating || null,
        roadmapSlug: data.roadmapSlug || null,
        phaseId: data.phaseId || null,
        topicId: data.topicId || null,
        pagePath: data.pagePath || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    return NextResponse.json(
      { success: true, feedbackId: feedback.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("[Feedback API] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
