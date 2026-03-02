import Link from "next/link";
import { getAllRoadmaps } from "@/data/roadmaps";
import { getRoadmapPhases } from "@/data";

export default function HomePage() {
  const roadmaps = getAllRoadmaps();

  return (
    <div>
      <div className="hero">
        <h1>Interview Roadmaps</h1>
        <p>
          Choose a roadmap and master any technology — with code examples,
          exercises, and interview questions at every step.
        </p>
      </div>

      {/* Roadmap AI Feature Card */}
      <Link href="/careerforge" className="roadmap-card" style={{ display: "block", marginBottom: "2rem", textDecoration: "none" }}>
        <div className="roadmap-card-inner">
          <div className="roadmap-card-accent" style={{ background: "var(--gradient-hero)" }} />
          <div className="roadmap-emoji">🤖</div>
          <h3>Roadmap AI <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 999, background: "color-mix(in srgb, var(--accent-blue) 15%, transparent)", color: "var(--accent-blue)", verticalAlign: "middle", marginLeft: "0.4rem" }}>Beta</span></h3>
          <p>Get a personalized AI-generated career roadmap — interview intel, salary data, LinkedIn referral strategy, and a phased study plan for any role at any company.</p>
          <div className="roadmap-tags">
            {["AI-Powered", "Multi-Agent", "Real-Time", "Personalized"].map((tag) => (
              <span key={tag} className="roadmap-tag">{tag}</span>
            ))}
          </div>
          <span className="roadmap-count">Generate my roadmap →</span>
        </div>
      </Link>

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
