// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    feedback: {
      create: createMock,
    },
  },
}));

import { POST } from "@/app/api/feedback/route";

describe("POST /api/feedback", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("accepts a valid payload", async () => {
    createMock.mockResolvedValue({ id: "fb_123" });

    const request = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "general",
        message: "This app is very useful for interview prep.",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.feedbackId).toBe("fb_123");
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid payload", async () => {
    const request = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "invalid",
        message: "short",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid feedback payload");
    expect(createMock).not.toHaveBeenCalled();
  });
});
