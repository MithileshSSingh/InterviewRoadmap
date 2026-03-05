"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { searchIndex } from "@/lib/searchIndex";

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        close();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setResults(searchIndex(query));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function handleResultClick(url) {
    router.push(url);
    close();
  }

  // Group topic results by roadmap; roadmap entries go first
  function groupResults(items) {
    const roadmaps = items.filter((r) => r.type === "roadmap");
    const topics = items.filter((r) => r.type === "topic");

    const groups = new Map();
    for (const t of topics) {
      if (!groups.has(t.roadmapSlug)) {
        groups.set(t.roadmapSlug, { label: `${t.roadmapEmoji} ${t.roadmapTitle}`, items: [] });
      }
      groups.get(t.roadmapSlug).items.push(t);
    }

    return { roadmaps, groups };
  }

  const { roadmaps, groups } = groupResults(results);

  const modal = isOpen ? (
    <>
      <div className="search-overlay" onClick={close} />
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search">
        <div className="search-input-container">
          <span className="search-icon-prefix" aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search topics, phases, roadmaps…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>

        {(results.length > 0 || query.trim()) && (
          <div className="search-results">
            {results.length === 0 && query.trim() && (
              <div className="search-empty">No results for &ldquo;{query}&rdquo;</div>
            )}

            {roadmaps.length > 0 && (
              <div className="search-result-group">
                <div className="search-result-group-label">Roadmaps</div>
                {roadmaps.map((r) => (
                  <button
                    key={r.slug}
                    className="search-result-item"
                    onClick={() => handleResultClick(r.url)}
                  >
                    <span className="search-result-emoji">{r.emoji}</span>
                    <div className="search-result-body">
                      <div className="search-result-title">{r.title}</div>
                      {r.description && (
                        <div className="search-result-snippet">{r.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {[...groups.entries()].map(([slug, group]) => (
              <div className="search-result-group" key={slug}>
                <div className="search-result-group-label">{group.label}</div>
                {group.items.map((t) => (
                  <button
                    key={t.url}
                    className="search-result-item"
                    onClick={() => handleResultClick(t.url)}
                  >
                    <span className="search-result-emoji">{t.roadmapEmoji}</span>
                    <div className="search-result-body">
                      <div className="search-result-title">{t.topicTitle}</div>
                      <div className="search-result-meta">{t.phaseName}</div>
                      {t.snippet && (
                        <div className="search-result-snippet">{t.snippet}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        className="mode-toggle search-btn"
        onClick={open}
        aria-label="Search (Cmd+K)"
        title="Search (⌘K)"
      >
        🔍
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
