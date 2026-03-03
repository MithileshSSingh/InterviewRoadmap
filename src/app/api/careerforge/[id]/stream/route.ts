import { prisma } from "@/lib/db";
import type { CareerForgeSSEEvent } from "@/lib/careerforge/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5-minute timeout for long-running pipeline

const STREAM_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const pushEvent = (event: CareerForgeSSEEvent) => {
        const eventStr = JSON.stringify(event);
        const b64Event = Buffer.from(eventStr, "utf8").toString("base64");
        controller.enqueue(encoder.encode(`data: ${b64Event}\n\n`));
      };

      try {
        const roadmap = await prisma.roadmap.findUnique({ where: { id } });

        if (!roadmap) {
          pushEvent({ type: "error", message: "Roadmap not found" });
          controller.close();
          return;
        }

        // Guard: already complete — return immediately
        if (roadmap.status === "complete") {
          pushEvent({ type: "complete", roadmapId: id });
          controller.close();
          return;
        }

        // Guard: errored previously
        if (roadmap.status === "error") {
          pushEvent({
            type: "error",
            message: roadmap.errorMessage ?? "Pipeline failed",
          });
          controller.close();
          return;
        }

        // Dynamically import to avoid loading pipeline at module level
        const { runCareerForgePipeline } =
          await import("@/lib/careerforge/pipeline");

        await runCareerForgePipeline({
          roadmapId: id,
          role: roadmap.role,
          company: roadmap.company,
          experienceLevel: roadmap.experienceLevel,
          sessionId: roadmap.sessionId,
          emitter: pushEvent,
        });

        controller.close();
      } catch (err) {
        console.error("[CareerForge Stream] Unexpected error:", err);
        try {
          const eventStr = JSON.stringify({
            type: "error",
            message: "Pipeline failed unexpectedly. Please try again.",
          } as CareerForgeSSEEvent);
          controller.enqueue(
            encoder.encode(
              `data: ${Buffer.from(eventStr, "utf8").toString("base64")}\n\n`,
            ),
          );
          await prisma.roadmap.update({
            where: { id },
            data: { status: "error", errorMessage: String(err) },
          });
        } catch {
          // best effort
        }
        controller.close();
      }
    },
  });

  return new Response(stream, { status: 200, headers: STREAM_HEADERS });
}
