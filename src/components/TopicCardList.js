"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function getSessionId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cf-session-id");
}

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const sid = getSessionId();
  if (sid) headers["x-session-id"] = sid;
  return headers;
}

export default function TopicCardList({ topics, slug, phaseId, phaseTitle, roadmapTitle, roadmapEmoji }) {
  const [bookmarked, setBookmarked] = useState(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bookmarks", { headers: buildHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        const ids = new Set(
          data
            .filter((b) => b.slug === slug && b.phaseId === phaseId)
            .map((b) => b.topicId)
        );
        setBookmarked(ids);
      } catch {
        /* non-blocking */
      }
    }
    load();
  }, [slug, phaseId]);

  async function toggleBookmark(e, topic) {
    e.preventDefault();
    e.stopPropagation();

    const isBookmarked = bookmarked.has(topic.id);
    const next = new Set(bookmarked);

    if (isBookmarked) {
      next.delete(topic.id);
      setBookmarked(next);
      await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: buildHeaders(),
        body: JSON.stringify({ slug, phaseId, topicId: topic.id }),
      }).catch(() => {});
    } else {
      next.add(topic.id);
      setBookmarked(next);
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          slug,
          phaseId,
          topicId: topic.id,
          topicTitle: topic.title,
          phaseTitle,
          roadmapTitle,
          roadmapEmoji,
        }),
      }).catch(() => {});
    }
  }

  return (
    <div className="topics-list">
      {topics.map((topic, idx) => (
        <div key={topic.id} className="topic-card-wrap">
          <Link
            href={`/roadmap/${slug}/${phaseId}/${topic.id}`}
            className="topic-card"
          >
            <span className="topic-number">{idx + 1}</span>
            <h3>{topic.title}</h3>
          </Link>
          <button
            type="button"
            className={`topic-card-bookmark ${bookmarked.has(topic.id) ? "active" : ""}`}
            onClick={(e) => toggleBookmark(e, topic)}
            aria-label={bookmarked.has(topic.id) ? "Remove bookmark" : "Bookmark topic"}
            title={bookmarked.has(topic.id) ? "Remove bookmark" : "Save for later"}
          >
            🔖
          </button>
        </div>
      ))}
    </div>
  );
}
