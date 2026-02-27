import Link from "next/link";
import { getAllRoadmaps } from "@/data/roadmaps";
import { getRoadmapPhases } from "@/data";

export default function HomePage() {
  const roadmaps = getAllRoadmaps();

  return (
    <div>
      <div className="hero">
        <h1>Learning Roadmaps</h1>
        <p>
          Choose a roadmap and master any technology — with code examples,
          exercises, and interview questions at every step.
        </p>
      </div>

      <div className="roadmaps-grid">
        {roadmaps.map((roadmap) => {
          const phases = getRoadmapPhases(roadmap.slug);
          const topicCount = phases
            ? phases.reduce((sum, p) => sum + p.topics.length, 0)
            : 0;

          return (
            <div key={roadmap.slug} className={`roadmap-card ${roadmap.comingSoon ? "coming-soon" : ""}`}>
              {roadmap.comingSoon ? (
                <div className="roadmap-card-inner">
                  <div className="roadmap-card-accent" style={{ background: roadmap.color }} />
                  <span className="coming-soon-badge">Coming Soon</span>
                  <div className="roadmap-emoji">{roadmap.emoji}</div>
                  <h3>{roadmap.title}</h3>
                  <p>{roadmap.description}</p>
                  <div className="roadmap-tags">
                    {roadmap.tags.map((tag) => (
                      <span key={tag} className="roadmap-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <Link href={`/roadmap/${roadmap.slug}`} className="roadmap-card-inner">
                  <div className="roadmap-card-accent" style={{ background: roadmap.color }} />
                  <div className="roadmap-emoji">{roadmap.emoji}</div>
                  <h3>{roadmap.title}</h3>
                  <p>{roadmap.description}</p>
                  <div className="roadmap-tags">
                    {roadmap.tags.map((tag) => (
                      <span key={tag} className="roadmap-tag">{tag}</span>
                    ))}
                  </div>
                  <span className="roadmap-count">{topicCount} topics · {phases.length} phases →</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
