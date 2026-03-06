import { describe, expect, it } from "vitest";
import { FeedbackInputSchema } from "@/lib/feedback/schema";

describe("FeedbackInputSchema", () => {
  it("accepts a valid payload and sanitizes string fields", () => {
    const result = FeedbackInputSchema.parse({
      type: "content",
      category: "  Topic Clarity  ",
      message: "   This topic explanation was clear and practical.   ",
      email: "  user@example.com ",
      rating: 5,
      roadmapSlug: "  javascript ",
      phaseId: " phase1 ",
      topicId: " closures ",
      pagePath: " /roadmap/javascript/phase1/closures ",
      metadata: { source: "widget" },
    });

    expect(result.category).toBe("Topic Clarity");
    expect(result.message).toBe("This topic explanation was clear and practical.");
    expect(result.email).toBe("user@example.com");
    expect(result.roadmapSlug).toBe("javascript");
    expect(result.phaseId).toBe("phase1");
    expect(result.topicId).toBe("closures");
    expect(result.pagePath).toBe("/roadmap/javascript/phase1/closures");
  });

  it("rejects invalid type and too-short message", () => {
    const result = FeedbackInputSchema.safeParse({
      type: "random-type",
      message: "too short",
    });

    expect(result.success).toBe(false);
  });
});
