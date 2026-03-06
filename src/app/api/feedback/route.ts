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

    const { metadata, email, ...rest } = result.data;

    const feedback = await prisma.feedback.create({
      data: {
        ...rest,
        // Store empty string email as null
        email: email || null,
        // Serialize metadata object to JSON string for SQLite
        metadata: metadata ? JSON.stringify(metadata) : null,
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
