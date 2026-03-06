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

function groupBySlug(bookmarks) {
  const map = {};
  for (const b of bookmarks) {
    if (!map[b.slug]) {
      map[b.slug] = {
        slug: b.slug,
        roadmapTitle: b.roadmapTitle,
        roadmapEmoji: b.roadmapEmoji,
        items: [],
      };
    }
    map[b.slug].items.push(b);
  }
  return Object.values(map);
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bookmarks", { headers: buildHeaders() });
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data);
        }
      } catch {
        /* non-blocking */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function remove(b) {
    setBookmarks((prev) =>
      prev.filter(
        (x) => !(x.slug === b.slug && x.phaseId === b.phaseId && x.topicId === b.topicId)
      )
    );
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: buildHeaders(),
      body: JSON.stringify({ slug: b.slug, phaseId: b.phaseId, topicId: b.topicId }),
    }).catch(() => {});
  }

  function toggleCollapse(slug) {
    setCollapsed((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  const groups = groupBySlug(bookmarks);

  return (
    <div className="bookmarks-page">
      <div className="breadcrumb">
        <Link href="/">All Roadmaps</Link>
        <span>›</span>
        <span>Bookmarks</span>
      </div>

      <div className="bookmarks-header">
        <h1 className="bookmarks-title">
          🔖 Bookmarks
          {!loading && (
            <span className="bookmarks-count">{bookmarks.length}</span>
          )}
        </h1>
        <p className="bookmarks-subtitle">Topics you saved for later review.</p>
      </div>

      {loading && <p className="bookmarks-empty">Loading…</p>}

      {!loading && bookmarks.length === 0 && (
        <div className="bookmarks-empty-state">
          <span className="bookmarks-empty-icon">🔖</span>
          <p>No bookmarks yet.</p>
          <p>Browse a roadmap and save topics you want to revisit.</p>
          <Link href="/" className="bookmarks-browse-link">Browse Roadmaps →</Link>
        </div>
      )}

      {!loading && groups.length > 0 && (
        <div className="bookmarks-groups">
          {groups.map((group) => (
            <div key={group.slug} className="bookmarks-group">
              <button
                type="button"
                className="bookmarks-group-header"
                onClick={() => toggleCollapse(group.slug)}
                aria-expanded={!collapsed[group.slug]}
              >
                <span className="bookmarks-group-title">
                  {group.roadmapEmoji} {group.roadmapTitle}
                </span>
                <span className="bookmarks-group-meta">
                  <span className="bookmarks-group-count">{group.items.length}</span>
                  <span className="bookmarks-group-chevron">
                    {collapsed[group.slug] ? "▸" : "▾"}
                  </span>
                </span>
              </button>

              {!collapsed[group.slug] && (
                <ul className="bookmarks-list">
                  {group.items.map((b) => (
                    <li key={b.id} className="bookmarks-item">
                      <div className="bookmarks-item-info">
                        <Link
                          href={`/roadmap/${b.slug}/${b.phaseId}/${b.topicId}`}
                          className="bookmarks-item-title"
                        >
                          {b.topicTitle}
                        </Link>
                        <span className="bookmarks-item-phase">{b.phaseTitle}</span>
                      </div>
                      <button
                        type="button"
                        className="bookmarks-remove-btn"
                        onClick={() => remove(b)}
                        aria-label="Remove bookmark"
                        title="Remove bookmark"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
