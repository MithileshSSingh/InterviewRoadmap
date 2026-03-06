import { describe, expect, it } from "vitest";
import { FeedbackSchema } from "@/lib/feedback/schema";

const validPayload = {
  type: "bug",
  message: "The code example is incorrect for closures topic.",
  email: "test@example.com",
  rating: 4,
  roadmapSlug: "javascript",
  phaseId: "phase1",
  topicId: "closures",
  pagePath: "/roadmap/javascript/phase1/closures",
  metadata: { userAgent: "Mozilla/5.0", timestamp: "2026-03-06T10:00:00Z" },
};

describe("FeedbackSchema", () => {
  it("accepts a valid payload with all fields", () => {
    const result = FeedbackSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a minimal payload (only required fields)", () => {
    const result = FeedbackSchema.safeParse({
      type: "general",
      message: "Great platform, keep it up!",
    });
    expect(result.success).toBe(true);
  });

  it("trims message and enforces minimum length", () => {
    const result = FeedbackSchema.safeParse({
      type: "general",
      message: "   short   ", // 5 chars after trim
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.message).toBeDefined();
  });

  it("rejects empty message", () => {
    const result = FeedbackSchema.safeParse({
      type: "bug",
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = FeedbackSchema.safeParse({
      type: "complaint",
      message: "This should fail type validation",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.type).toBeDefined();
  });

  it("rejects rating outside 1-5 range", () => {
    const tooLow = FeedbackSchema.safeParse({
      ...validPayload,
      rating: 0,
    });
    expect(tooLow.success).toBe(false);

    const tooHigh = FeedbackSchema.safeParse({
      ...validPayload,
      rating: 6,
    });
    expect(tooHigh.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = FeedbackSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("allows empty string email (treated as no email)", () => {
    const result = FeedbackSchema.safeParse({
      ...validPayload,
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows null/undefined for all optional fields", () => {
    const result = FeedbackSchema.safeParse({
      type: "feature",
      message: "Add dark mode toggle on mobile nav.",
      email: null,
      rating: null,
      roadmapSlug: null,
      phaseId: null,
      topicId: null,
      pagePath: null,
      metadata: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects message exceeding max length", () => {
    const result = FeedbackSchema.safeParse({
      type: "general",
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
