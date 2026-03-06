import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FeedbackInputSchema } from "@/lib/feedback/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = FeedbackInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const feedback = await prisma.feedback.create({
      data: parsed.data,
      select: { id: true },
    });

    return NextResponse.json(
      { success: true, feedbackId: feedback.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("[Feedback API] Error:", err);
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again." },
      { status: 500 },
    );
  }
}
