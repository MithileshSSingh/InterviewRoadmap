"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StreamingProgress from "@/components/careerforge/StreamingProgress";
import RoadmapView from "@/components/careerforge/RoadmapView";
import { streamCareerForge } from "@/lib/careerforge/client";

export default function RoadmapPage() {
  const { id } = useParams();
  const router = useRouter();

  const [viewState, setViewState] = useState("checking"); // checking | streaming | complete | error
  const [roadmap, setRoadmap] = useState(null);
  const [agentStatuses, setAgentStatuses] = useState({});
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const abortRef = useRef(null);

  const startStreaming = useCallback(async () => {
    abortRef.current?.abort();
    setViewState("streaming");
    const controller = new AbortController();
    abortRef.current = controller;

    const result = await streamCareerForge({
      roadmapId: id,
      signal: controller.signal,
      onEvent: (event) => {
        if (event.type === "status") {
          setAgentStatuses((prev) => ({
            ...prev,
            [event.agent]: event.message,
          }));
        }
        if (event.type === "progress") {
          setProgress((prev) => Math.max(prev, event.percent));
        }
        if (event.type === "complete") {
          // Fetch final data
          fetch(`/api/careerforge/${id}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.roadmap?.result) {
                setRoadmap(data.roadmap.result);
                setViewState("complete");
              } else {
                setViewState("error");
                setErrorMessage(
                  "Roadmap was generated but could not be loaded.",
                );
              }
            })
            .catch(() => {
              setViewState("error");
              setErrorMessage("Failed to load completed roadmap.");
            });
        }
        if (event.type === "error") {
          setViewState("error");
          setErrorMessage(event.message ?? "Generation failed.");
        }
      },
    });

    if (result === "aborted") {
      // User navigated away — fine
    } else if (result === "error") {
      setViewState("error");
      setErrorMessage("Connection lost. Please try refreshing.");
    }
  }, [id]);

  const checkAndLoad = useCallback(async () => {
    try {
      const res = await fetch(`/api/careerforge/${id}`);
      if (!res.ok) {
        setViewState("error");
        setErrorMessage("Roadmap not found.");
        return;
      }
      const data = await res.json();
      const rm = data.roadmap;

      if (rm?.generation) {
        if (rm.generation.agentStatuses) {
          setAgentStatuses(rm.generation.agentStatuses);
        }
        if (typeof rm.generation.progress === "number") {
          setProgress((prev) => Math.max(prev, rm.generation.progress));
        }
      }

      if (rm.status === "complete" && rm.result) {
        setRoadmap(rm.result);
        setViewState("complete");
      } else if (rm.status === "error") {
        setViewState("error");
        setErrorMessage(
          rm.errorMessage ?? "Generation failed. Please try again.",
        );
      } else {
        // pending or running — connect to SSE
        startStreaming();
      }
    } catch {
      setViewState("error");
      setErrorMessage("Failed to load roadmap.");
    }
  }, [id, startStreaming]);

  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      void checkAndLoad();
    }, 0);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [id, checkAndLoad]);

  if (viewState === "checking") {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "4rem auto",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--border)",
            borderTopColor: "var(--accent-blue)",
            borderRadius: "50%",
            animation: "cf-spin 0.8s linear infinite",
            margin: "0 auto 1rem",
          }}
        />
        <p style={{ color: "var(--text-secondary)" }}>
          Loading your roadmap...
        </p>
        <style>{`@keyframes cf-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (viewState === "error") {
    return (
      <div
        style={{
          maxWidth: 560,
          margin: "4rem auto",
          textAlign: "center",
          padding: "2rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚠️</div>
        <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
          Generation Failed
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {errorMessage ?? "Something went wrong. Please try again."}
        </p>
        <div
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}
        >
          <button
            onClick={() => {
              setViewState("checking");
              setAgentStatuses({});
              setProgress(0);
              setErrorMessage(null);
              checkAndLoad();
            }}
            style={{
              padding: "0.6rem 1.25rem",
              background: "var(--accent-blue)",
              color: "var(--bg-primary)",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/careerforge")}
            style={{
              padding: "0.6rem 1.25rem",
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            New Roadmap
          </button>
        </div>
      </div>
    );
  }

  if (viewState === "streaming") {
    return (
      <StreamingProgress agentStatuses={agentStatuses} progress={progress} />
    );
  }

  // complete
  return <RoadmapView roadmap={roadmap} roadmapId={id} />;
}
