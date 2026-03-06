// @vitest-environment node

import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("feedback rate limiting middleware", () => {
  it("returns 429 after 10 requests per minute for the same IP", () => {
    let lastStatus = 200;

    for (let i = 0; i < 11; i += 1) {
      const request = new NextRequest("http://localhost/api/feedback", {
        method: "POST",
        headers: {
          "x-forwarded-for": "203.0.113.9",
        },
      });
      const response = middleware(request);
      lastStatus = response.status;
    }

    expect(lastStatus).toBe(429);
  });
});
