import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/feedback/route";

// ─── Mock Prisma ─────────────────────────────────────────────────────────────
vi.mock("@/lib/db", () => ({
  prisma: {
    feedback: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";

const mockedCreate = vi.mocked(prisma.feedback.create);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 with feedbackId on valid payload", async () => {
    mockedCreate.mockResolvedValue({
      id: "test_id_123",
      type: "bug",
      message: "Test feedback message here",
      category: null,
      email: null,
      rating: null,
      roadmapSlug: null,
      phaseId: null,
      topicId: null,
      pagePath: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(
      makeRequest({
        type: "bug",
        message: "Test feedback message here",
      }),
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.feedbackId).toBe("test_id_123");
    expect(mockedCreate).toHaveBeenCalledOnce();
  });

  it("returns 400 on invalid body (missing message)", async () => {
    const res = await POST(
      makeRequest({
        type: "bug",
        message: "",
      }),
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid type", async () => {
    const res = await POST(
      makeRequest({
        type: "unknown",
        message: "A valid length message here.",
      }),
    );

    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 on non-JSON body", async () => {
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "not json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on database error", async () => {
    mockedCreate.mockRejectedValue(new Error("DB connection refused"));

    const res = await POST(
      makeRequest({
        type: "general",
        message: "This should trigger a server error.",
      }),
    );

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("Something went wrong");
  });

  it("stringifies metadata object before saving", async () => {
    mockedCreate.mockResolvedValue({
      id: "test_meta_id",
      type: "general",
      message: "With metadata test",
      category: null,
      email: null,
      rating: null,
      roadmapSlug: null,
      phaseId: null,
      topicId: null,
      pagePath: null,
      metadata: '{"browser":"Chrome"}',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(
      makeRequest({
        type: "general",
        message: "With metadata test",
        metadata: { browser: "Chrome" },
      }),
    );

    expect(res.status).toBe(201);

    const createArg = mockedCreate.mock.calls[0][0];
    expect(createArg.data.metadata).toBe('{"browser":"Chrome"}');
  });
});
