import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TTSRequestBody {
  text: string;
}

function isValidTTSBody(body: unknown): body is TTSRequestBody {
  if (!body || typeof body !== "object") return false;
  const text = (body as { text?: unknown }).text;
  return typeof text === "string" && text.trim().length > 0;
}

/**
 * POST /api/voice/tts
 *
 * Server-side proxy for Deepgram TTS.
 * The browser sends { text }, the server calls Deepgram /v1/speak and
 * streams the audio bytes back as audio/mpeg.
 */
export async function POST(request: Request) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Deepgram is not configured. Add DEEPGRAM_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidTTSBody(body)) {
    return NextResponse.json(
      { error: "Missing or empty 'text' field." },
      { status: 400 },
    );
  }

  const { text } = body;

  // Cap text length to prevent abuse (approx. 5000 chars ~ a long paragraph)
  const trimmedText = text.slice(0, 5000);

  try {
    const deepgramRes = await fetch(
      "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=mp3",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmedText }),
      },
    );

    if (!deepgramRes.ok) {
      const errText = await deepgramRes.text();
      console.error("[Voice TTS] Deepgram speak failed:", deepgramRes.status, errText);
      return NextResponse.json(
        { error: "Text-to-speech generation failed." },
        { status: 502 },
      );
    }

    // Stream the audio response directly back to the browser
    const audioBody = deepgramRes.body;
    if (!audioBody) {
      return NextResponse.json(
        { error: "No audio received from TTS service." },
        { status: 502 },
      );
    }

    return new Response(audioBody, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache, no-store",
      },
    });
  } catch (err) {
    console.error("[Voice TTS] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
