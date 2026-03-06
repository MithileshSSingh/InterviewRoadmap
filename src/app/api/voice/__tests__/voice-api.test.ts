import { describe, expect, it, vi, beforeEach } from "vitest";

// ─── Mock global fetch ────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// ─── Tests for POST /api/voice/token ──────────────────────────────────────────
describe("POST /api/voice/token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns 503 when DEEPGRAM_API_KEY is not set", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "");
    // Re-import to pick up env
    const { POST } = await import("@/app/api/voice/token/route");
    const res = await POST();
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toContain("Deepgram is not configured");
  });

  it("returns a token on successful Deepgram grant", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "test-key-123");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "dg-temp-token-abc" }),
    });

    const { POST } = await import("@/app/api/voice/token/route");
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBe("dg-temp-token-abc");

    // Verify we called Deepgram's grant endpoint
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.deepgram.com/v1/auth/grant");
    expect(opts.method).toBe("POST");
    expect(opts.headers.Authorization).toBe("Token test-key-123");
  });

  it("falls back to returning API key when Deepgram grant returns 403", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "test-key-123");
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    });

    const { POST } = await import("@/app/api/voice/token/route");
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBe("test-key-123");
  });
});

// ─── Tests for POST /api/voice/tts ────────────────────────────────────────────
describe("POST /api/voice/tts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  function makeRequest(body: unknown): Request {
    return new Request("http://localhost:3000/api/voice/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 503 when DEEPGRAM_API_KEY is not set", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "");
    const { POST } = await import("@/app/api/voice/tts/route");
    const res = await POST(makeRequest({ text: "Hello" }));
    expect(res.status).toBe(503);
  });

  it("returns 400 on missing text field", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "test-key-123");
    const { POST } = await import("@/app/api/voice/tts/route");
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("text");
  });

  it("returns 400 on empty text", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "test-key-123");
    const { POST } = await import("@/app/api/voice/tts/route");
    const res = await POST(makeRequest({ text: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 on non-JSON body", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "test-key-123");
    const { POST } = await import("@/app/api/voice/tts/route");
    const req = new Request("http://localhost:3000/api/voice/tts", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("proxies audio from Deepgram and returns audio/mpeg", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "test-key-123");
    const fakeAudioBytes = new Uint8Array([0xff, 0xfb, 0x90, 0x00]);
    const fakeStream = new ReadableStream({
      start(controller) {
        controller.enqueue(fakeAudioBytes);
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: fakeStream,
    });

    const { POST } = await import("@/app/api/voice/tts/route");
    const res = await POST(makeRequest({ text: "Hello world" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("audio/mpeg");

    // Verify Deepgram was called correctly
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("api.deepgram.com/v1/speak");
    expect(opts.headers.Authorization).toBe("Token test-key-123");
  });

  it("returns 502 when Deepgram speak fails", async () => {
    vi.stubEnv("DEEPGRAM_API_KEY", "test-key-123");
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    const { POST } = await import("@/app/api/voice/tts/route");
    const res = await POST(makeRequest({ text: "Hello" }));
    expect(res.status).toBe(502);
  });
});
