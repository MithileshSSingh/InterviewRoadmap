import { prisma } from "@/lib/db";
import type { AgentRun } from "@/generated/prisma/client";
import type { CareerForgeSSEEvent } from "@/lib/careerforge/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5-minute timeout for long-running pipeline

const STREAM_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

const AGENT_ORDER = [
  "orchestrator",
  "jobIntel",
  "salaryIntel",
  "linkedinIntel",
  "skillsMapper",
  "resourceFinder",
  "roadmapBuilder",
  "formatter",
] as const;

const AGENT_LABELS: Record<string, string> = {
  orchestrator: "Orchestrator",
  jobIntel: "Job Intel",
  salaryIntel: "Salary Intel",
  linkedinIntel: "LinkedIn Intel",
  skillsMapper: "Skills Mapper",
  resourceFinder: "Resource Finder",
  roadmapBuilder: "Roadmap Builder",
  formatter: "Formatter",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAgentSortTime(run: AgentRun): number {
  return (
    run.completedAt?.getTime() ?? run.startedAt?.getTime() ?? run.createdAt.getTime()
  );
}

function getLatestRuns(agentRuns: AgentRun[]) {
  const latest = new Map<string, AgentRun>();
  for (const run of agentRuns) {
    const prev = latest.get(run.agentName);
    if (!prev || getAgentSortTime(run) >= getAgentSortTime(prev)) {
      latest.set(run.agentName, run);
    }
  }
  return latest;
}

function buildProgressPercent(roadmapStatus: string, agentRuns: AgentRun[]) {
  if (roadmapStatus === "complete") return 100;
  if (roadmapStatus === "pending" && agentRuns.length === 0) return 0;

  const latestRuns = getLatestRuns(agentRuns);
  let completeCount = 0;
  let runningCount = 0;

  for (const agentName of AGENT_ORDER) {
    const run = latestRuns.get(agentName);
    if (!run) continue;
    if (run.status === "complete" || run.status === "error") completeCount += 1;
    if (run.status === "running") runningCount += 1;
  }

  const finishedWeight = completeCount / AGENT_ORDER.length;
  const runningWeight = runningCount / AGENT_ORDER.length;
  const percent = Math.round((finishedWeight + runningWeight * 0.4) * 100);
  return Math.max(5, Math.min(95, percent));
}

function toStatusMessage(agentName: string, status: string, errorMessage?: string | null) {
  const label = AGENT_LABELS[agentName] ?? agentName;
  if (status === "running") return `${label} running...`;
  if (status === "complete") return `${label} complete`;
  if (status === "error") {
    return errorMessage ? `${label} failed: ${errorMessage}` : `${label} failed`;
  }
  return `${label} pending`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const encoder = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      const pushEvent = (event: CareerForgeSSEEvent) => {
        if (cancelled) return;
        try {
          const eventStr = JSON.stringify(event);
          const b64Event = Buffer.from(eventStr, "utf8").toString("base64");
          controller.enqueue(encoder.encode(`data: ${b64Event}\n\n`));
        } catch {
          cancelled = true;
        }
      };

      const closeStream = () => {
        if (cancelled) return;
        try {
          controller.close();
        } catch {
          // stream may already be closed by runtime
        }
      };

      const watchExistingRun = async () => {
        const emittedStatuses = new Map<string, string>();
        let lastProgress = -1;

        while (!cancelled) {
          const current = await prisma.roadmap.findUnique({
            where: { id },
            include: { agentRuns: true },
          });

          if (!current) {
            pushEvent({ type: "error", message: "Roadmap not found" });
            return;
          }

          const latestRuns = getLatestRuns(current.agentRuns);
          for (const agentName of AGENT_ORDER) {
            const run = latestRuns.get(agentName);
            if (!run) continue;
            const msg = toStatusMessage(agentName, run.status, run.errorMessage);
            if (emittedStatuses.get(agentName) !== msg) {
              emittedStatuses.set(agentName, msg);
              pushEvent({ type: "status", agent: agentName, message: msg });
            }
          }

          const progress = buildProgressPercent(current.status, current.agentRuns);
          if (progress !== lastProgress) {
            lastProgress = progress;
            pushEvent({ type: "progress", agent: "orchestrator", percent: progress });
          }

          if (current.status === "complete") {
            pushEvent({ type: "complete", roadmapId: id });
            return;
          }

          if (current.status === "error") {
            pushEvent({
              type: "error",
              message: current.errorMessage ?? "Pipeline failed",
            });
            return;
          }

          await sleep(1500);
        }
      };

      try {
        const roadmap = await prisma.roadmap.findUnique({
          where: { id },
          include: { agentRuns: true },
        });

        if (!roadmap) {
          pushEvent({ type: "error", message: "Roadmap not found" });
          closeStream();
          return;
        }

        // Guard: already complete — return immediately
        if (roadmap.status === "complete") {
          pushEvent({ type: "complete", roadmapId: id });
          closeStream();
          return;
        }

        // Guard: errored previously
        if (roadmap.status === "error") {
          pushEvent({
            type: "error",
            message: roadmap.errorMessage ?? "Pipeline failed",
          });
          closeStream();
          return;
        }

        // Atomically claim execution right: only one request can move pending -> running.
        const claim = await prisma.roadmap.updateMany({
          where: { id, status: "pending" },
          data: { status: "running" },
        });

        if (claim.count === 1) {
          // We own execution for this roadmap.
          const { runCareerForgePipeline } = await import("@/lib/careerforge/pipeline");

          await runCareerForgePipeline({
            roadmapId: id,
            role: roadmap.role,
            company: roadmap.company,
            experienceLevel: roadmap.experienceLevel,
            sessionId: roadmap.sessionId,
            emitter: pushEvent,
          });
        } else {
          // Another request is already executing this roadmap; attach and watch.
          pushEvent({
            type: "status",
            agent: "orchestrator",
            message: "Reconnected to active generation...",
          });
          await watchExistingRun();
        }

        closeStream();
      } catch (err) {
        console.error("[CareerForge Stream] Unexpected error:", err);
        try {
          pushEvent({
            type: "error",
            message: "Pipeline failed unexpectedly. Please try again.",
          });
          await prisma.roadmap.update({
            where: { id },
            data: { status: "error", errorMessage: String(err) },
          });
        } catch {
          // best effort
        }
        closeStream();
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, { status: 200, headers: STREAM_HEADERS });
}
