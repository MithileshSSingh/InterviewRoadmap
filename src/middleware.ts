import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// ---------------------------------------------------------------------------
// Rate limiter instances (one per limit tier)
// ---------------------------------------------------------------------------

// /api/chat — 30 req/min
const chatLimiter = rateLimit({ interval: 60000, maxRequests: 30 });

// /api/careerforge/generate — 5 req/min (expensive full pipeline)
const generateLimiter = rateLimit({ interval: 60000, maxRequests: 5 });

// /api/careerforge/[id]/stream — 10 req/min
const streamLimiter = rateLimit({ interval: 60000, maxRequests: 10 });

// All other /api/careerforge/* routes — 60 req/min
const careerforgeDefaultLimiter = rateLimit({
  interval: 60000,
  maxRequests: 60,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; take the first entry
    return forwarded.split(",")[0].trim();
  }
  // Fallback: Next.js exposes the remote address via this header on some hosts
  return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimitedResponse(
  reset: number,
): NextResponse {
  const retryAfter = Math.max(0, reset - Math.floor(Date.now() / 1000));
  return NextResponse.json(
    { error: "Too many requests", retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(reset),
      },
    },
  );
}

function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  reset: number,
): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(reset));
  return response;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  let result: ReturnType<ReturnType<typeof rateLimit>>;

  if (pathname.startsWith("/api/chat")) {
    result = chatLimiter(ip);
  } else if (pathname.startsWith("/api/careerforge/generate")) {
    result = generateLimiter(ip);
  } else if (pathname.includes("/stream")) {
    // Matches /api/careerforge/[id]/stream
    result = streamLimiter(ip);
  } else {
    // All other /api/careerforge/* routes
    result = careerforgeDefaultLimiter(ip);
  }

  if (!result.success) {
    return rateLimitedResponse(result.reset);
  }

  // Allow the request and annotate with rate-limit headers.
  // We continue to the actual route handler; the headers are applied by
  // mutating the response returned from NextResponse.next().
  const response = NextResponse.next();
  return addRateLimitHeaders(response, result.remaining, result.reset);
}

// ---------------------------------------------------------------------------
// Matcher - only run on /api/* paths
// ---------------------------------------------------------------------------

export const config = {
  matcher: ["/api/:path*"],
};
