import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

type AgentRunLike = {
  agentName: string;
  status: string;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};

function getAgentSortTime(run: AgentRunLike): number {
  return (
    run.completedAt?.getTime() ?? run.startedAt?.getTime() ?? run.createdAt.getTime()
  );
}

function getLatestAgentRuns(agentRuns: AgentRunLike[]) {
  const latest = new Map<string, AgentRunLike>();
  for (const run of agentRuns) {
    const prev = latest.get(run.agentName);
    if (!prev || getAgentSortTime(run) >= getAgentSortTime(prev)) {
      latest.set(run.agentName, run);
    }
  }
  return latest;
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

function buildProgressPercent(roadmapStatus: string, agentRuns: AgentRunLike[]) {
  if (roadmapStatus === "complete") return 100;
  if (roadmapStatus === "pending" && agentRuns.length === 0) return 0;

  const latestRuns = getLatestAgentRuns(agentRuns);
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: { topicProgress: true, agentRuns: true },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    let result = roadmap.result ? JSON.parse(roadmap.result) : null;

    // Merge topic completion state from DB into the phases
    if (result && roadmap.topicProgress.length > 0) {
      const completedIds = new Set(
        roadmap.topicProgress.filter((t) => t.completed).map((t) => t.topicId),
      );
      if (result.phases) {
        result.phases = result.phases.map(
          (phase: { topics: { id: string }[] }) => ({
            ...phase,
            topics: phase.topics.map((topic: { id: string }) => ({
              ...topic,
              completed: completedIds.has(topic.id),
            })),
          }),
        );
      }
    }

    const latestRuns = getLatestAgentRuns(roadmap.agentRuns);
    const generationAgentStatuses: Record<string, string> = {};
    for (const agentName of AGENT_ORDER) {
      const run = latestRuns.get(agentName);
      if (!run) continue;
      generationAgentStatuses[agentName] = toStatusMessage(
        agentName,
        run.status,
        run.errorMessage,
      );
    }

    return NextResponse.json({
      roadmap: {
        id: roadmap.id,
        status: roadmap.status,
        role: roadmap.role,
        company: roadmap.company,
        experienceLevel: roadmap.experienceLevel,
        createdAt: roadmap.createdAt,
        errorMessage: roadmap.errorMessage,
        result,
        generation: {
          progress: buildProgressPercent(roadmap.status, roadmap.agentRuns),
          agentStatuses: generationAgentStatuses,
          agentRuns: roadmap.agentRuns.map((run) => ({
            agentName: run.agentName,
            status: run.status,
            errorMessage: run.errorMessage,
            startedAt: run.startedAt,
            completedAt: run.completedAt,
            createdAt: run.createdAt,
          })),
        },
      },
    });
  } catch (err) {
    console.error("[CareerForge GET] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch roadmap" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      select: { userId: true, sessionId: true },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    // Allow delete if authenticated user owns it, or sessionId matches
    const requestSessionId = request.headers.get("x-session-id");
    const canDelete =
      (userId && roadmap.userId === userId) ||
      (requestSessionId && roadmap.sessionId === requestSessionId);

    if (!canDelete) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.roadmap.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CareerForge DELETE] Error:", err);
    return NextResponse.json(
      { error: "Failed to delete roadmap" },
      { status: 500 },
    );
  }
}
