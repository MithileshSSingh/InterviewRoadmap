"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FEEDBACK_EVENT_NAME = "feedback:open";
const SUCCESS_CLOSE_DELAY_MS = 1200;
const CLOSE_ANIM_MS = 320;
const DEFAULT_FORM = {
  type: "general",
  category: "",
  message: "",
  email: "",
  rating: "",
  roadmapSlug: "",
  phaseId: "",
  topicId: "",
};

function buildClientMetadata() {
  if (typeof window === "undefined") return undefined;
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    themeMode: document.documentElement.getAttribute("data-mode") ?? "dark",
  };
}

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const closeTimerRef = useRef(null);
  const closeAnimRef = useRef(null);

  const closeModal = () => {
    if (isClosing) return;
    setIsClosing(true);
    if (closeAnimRef.current) window.clearTimeout(closeAnimRef.current);
    closeAnimRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setStatus({ type: "idle", message: "" });
    }, CLOSE_ANIM_MS);
  };

  const showRating = useMemo(
    () => form.type === "content" || form.type === "general",
    [form.type],
  );

  useEffect(() => {
    const onOpenFeedback = (event) => {
      const detail = event.detail ?? {};
      const prefill = detail.prefill ?? {};
      setForm((prev) => ({
        ...prev,
        ...prefill,
        rating:
          prefill.rating === undefined || prefill.rating === null
            ? prev.rating
            : String(prefill.rating),
      }));
      setStatus({ type: "idle", message: "" });
      setIsOpen(true);
    };

    window.addEventListener(FEEDBACK_EVENT_NAME, onOpenFeedback);
    return () => window.removeEventListener(FEEDBACK_EVENT_NAME, onOpenFeedback);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      if (closeAnimRef.current) window.clearTimeout(closeAnimRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (event) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, isClosing]);

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const payload = {
      type: form.type,
      category: form.category || undefined,
      message: form.message,
      email: form.email || undefined,
      rating: showRating && form.rating ? Number(form.rating) : undefined,
      roadmapSlug: form.roadmapSlug || undefined,
      phaseId: form.phaseId || undefined,
      topicId: form.topicId || undefined,
      pagePath: window.location.pathname + window.location.search,
      metadata: buildClientMetadata(),
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Feedback submission failed");
      }

      resetForm();
      setStatus({
        type: "success",
        message: "Thanks for the feedback. It has been submitted.",
      });
      setIsSubmitting(false);

      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = window.setTimeout(() => {
        closeModal();
      }, SUCCESS_CLOSE_DELAY_MS);
    } catch {
      setStatus({
        type: "error",
        message: "Could not submit feedback right now. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="feedback-widget"
        onClick={() => {
          setStatus({ type: "idle", message: "" });
          setIsOpen(true);
        }}
      >
        Feedback
      </button>

      {isOpen && (
        <div
          className={`feedback-modal-overlay ${isClosing ? "is-closing" : ""}`}
          onClick={closeModal}
          role="presentation"
        >
          <div
            className={`feedback-modal ${status.type === "success" ? "is-success" : ""} ${isClosing ? "is-closing" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Submit feedback"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="feedback-modal-header">
              <h2>Share Feedback</h2>
              <button
                type="button"
                className="feedback-close"
                onClick={closeModal}
                aria-label="Close feedback form"
              >
                ×
              </button>
            </div>

            <form className="feedback-form" onSubmit={onSubmit}>
              {status.type === "success" ? (
                <div className="feedback-success-burst" role="status">
                  <div className="feedback-success-icon" aria-hidden="true">
                    ✓
                  </div>
                  <p className="feedback-success-text">
                    Thanks for the feedback. It has been submitted.
                  </p>
                </div>
              ) : null}

              <label>
                Type
                <select value={form.type} onChange={onChange("type")} required>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="content">Content</option>
                  <option value="general">General</option>
                </select>
              </label>

              <label>
                Category (optional)
                <input
                  value={form.category}
                  onChange={onChange("category")}
                  maxLength={80}
                  placeholder="UI, roadmap quality, quiz, etc."
                />
              </label>

              {showRating && (
                <label>
                  Rating (optional)
                  <div className="feedback-chip-row">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={`feedback-chip ${String(value) === form.rating ? "active" : ""}`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            rating:
                              String(value) === prev.rating ? "" : String(value),
                          }))
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </label>
              )}

              <label>
                Message
                <textarea
                  value={form.message}
                  onChange={onChange("message")}
                  minLength={10}
                  maxLength={4000}
                  required
                  placeholder="Describe what happened or what you'd like to see improved."
                />
              </label>

              <label>
                Email (optional)
                <input
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  maxLength={160}
                  placeholder="you@example.com"
                />
              </label>

              {(form.roadmapSlug || form.phaseId || form.topicId) && (
                <div className="feedback-context">
                  Context: {form.roadmapSlug || "roadmap"}
                  {form.phaseId ? ` / ${form.phaseId}` : ""}
                  {form.topicId ? ` / ${form.topicId}` : ""}
                </div>
              )}

              {status.type !== "idle" && status.type !== "success" && (
                <p
                  className={`feedback-status ${status.type}`}
                  role={status.type === "error" ? "alert" : "status"}
                >
                  {status.message}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className="feedback-submit">
                {isSubmitting ? "Submitting..." : "Submit feedback"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export { FEEDBACK_EVENT_NAME };
