"use client";
import { useState, useEffect, useCallback } from "react";

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

export function useBookmark({ slug, phaseId, topicId, topicTitle, phaseTitle, roadmapTitle, roadmapEmoji }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // "saved" | "removed" | null

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/bookmarks", { headers: buildHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setBookmarked(
            data.some(
              (b) => b.slug === slug && b.phaseId === phaseId && b.topicId === topicId
            )
          );
        }
      } catch {
        /* non-blocking */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [slug, phaseId, topicId]);

  const toggle = useCallback(async () => {
    const next = !bookmarked;
    setBookmarked(next);
    setToast(null);

    try {
      if (next) {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: buildHeaders(),
          body: JSON.stringify({ slug, phaseId, topicId, topicTitle, phaseTitle, roadmapTitle, roadmapEmoji }),
        });
        setToast("saved");
      } else {
        await fetch("/api/bookmarks", {
          method: "DELETE",
          headers: buildHeaders(),
          body: JSON.stringify({ slug, phaseId, topicId }),
        });
        setToast("removed");
      }
    } catch {
      setBookmarked(!next); // revert on error
    } finally {
      setTimeout(() => setToast(null), 1800);
    }
  }, [bookmarked, slug, phaseId, topicId, topicTitle, phaseTitle, roadmapTitle, roadmapEmoji]);

  return { bookmarked, loading, toast, toggle };
}

export default function BookmarkButton({ bookmarked, loading, toast, onToggle }) {
  if (loading) return null;

  return (
    <div className="bookmark-btn-wrap">
      <button
        type="button"
        className={`bookmark-btn ${bookmarked ? "active" : ""}`}
        onClick={onToggle}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this topic"}
        title={bookmarked ? "Remove bookmark" : "Save for later"}
      >
        {bookmarked ? "✅" : "🔖"}
        <span className="bookmark-btn-label">{bookmarked ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}
