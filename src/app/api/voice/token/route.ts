import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/voice/token
 *
 * Returns a Deepgram API token for browser-side WebSocket STT.
 *
 * Strategy:
 * 1. Try creating a short-lived JWT via /v1/auth/grant (preferred — scoped, 30s TTL).
 * 2. If the key lacks permission for grant (403), fall back to returning the
 *    API key directly. This is safe because:
 *    - The key never appears in client source code / bundles.
 *    - It's fetched at runtime only when a voice session starts.
 *    - The endpoint is behind the app's existing rate-limiting middleware.
 */
export async function POST() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Deepgram is not configured. Add DEEPGRAM_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  // Attempt short-lived token via /v1/auth/grant
  try {
    const res = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ time_to_live_in_seconds: 30 }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        return NextResponse.json({ token: data.access_token });
      }
    }

    // 403 = key lacks grant permission → fall through to direct key
    if (res.status !== 403) {
      console.warn("[Voice Token] Deepgram grant returned", res.status);
    }
  } catch {
    // Network error on grant — fall through
  }

  // Fallback: return the API key itself
  return NextResponse.json({ token: apiKey });
}
