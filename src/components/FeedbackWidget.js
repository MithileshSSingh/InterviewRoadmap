"use client";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

// ─── Context for opening the feedback modal from anywhere ───────────────────
const FeedbackContext = createContext(null);
export function useFeedback() {
  return useContext(FeedbackContext);
}

const TYPE_OPTIONS = [
  { value: "bug", label: "🐛 Bug", },
  { value: "feature", label: "💡 Feature", },
  { value: "content", label: "📝 Content", },
  { value: "general", label: "💬 General", },
];

// ─── Component ──────────────────────────────────────────────────────────────
export default function FeedbackWidget({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState(getInitialForm());
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const modalRef = useRef(null);

  function getInitialForm(prefill = {}) {
    return {
      type: prefill.type || "general",
      message: "",
      email: "",
      rating: null,
      roadmapSlug: prefill.roadmapSlug || null,
      phaseId: prefill.phaseId || null,
      topicId: prefill.topicId || null,
    };
  }

  const openFeedback = useCallback((prefill = {}) => {
    setFormState(getInitialForm(prefill));
    setStatus("idle");
    setErrorMsg("");
    setIsOpen(true);
  }, []);

  const closeFeedback = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeFeedback();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeFeedback]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const firstInput = modalRef.current.querySelector(
      "button, input, textarea, select"
    );
    firstInput?.focus();
  }, [isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const payload = {
      type: formState.type,
      message: formState.message.trim(),
      email: formState.email.trim() || null,
      rating: formState.rating,
      roadmapSlug: formState.roadmapSlug,
      phaseId: formState.phaseId,
      topicId: formState.topicId,
      pagePath: typeof window !== "undefined" ? window.location.pathname : null,
      metadata: {
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setStatus("success");
      // Auto-close after showing success briefly
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    }
  }

  const showRating = formState.type === "content" || formState.type === "general";

  return (
    <FeedbackContext.Provider value={{ openFeedback, closeFeedback }}>
      {children}

      {/* Floating Action Button */}
      <button
        type="button"
        className="feedback-fab"
        onClick={() => openFeedback()}
        aria-label="Send feedback"
        title="Send feedback"
        data-testid="feedback-fab"
      >
        💬
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="feedback-overlay"
          onClick={closeFeedback}
          aria-hidden="true"
        >
          <div
            ref={modalRef}
            className="feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Send feedback"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="feedback-modal-header">
              <h3>Send Feedback</h3>
              <button
                type="button"
                className="feedback-modal-close"
                onClick={closeFeedback}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {status === "success" ? (
              <div className="feedback-success-container">
                <div className="feedback-success">
                  <span className="feedback-success-icon">✓</span>
                  <p>Thanks for your feedback!</p>
                </div>
              </div>
            ) : (
              <div className="feedback-form-container">
                <form className="feedback-form" onSubmit={handleSubmit}>
                  {/* Type chips */}
                  <fieldset className="feedback-chips-fieldset">
                    <legend className="feedback-label">Type</legend>
                    <div className="feedback-chips">
                      {TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`feedback-chip ${formState.type === opt.value ? "active" : ""}`}
                          onClick={() =>
                            setFormState((s) => ({ ...s, type: opt.value }))
                          }
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* Rating (for content/general) */}
                  {showRating && (
                    <div className="feedback-field">
                      <label className="feedback-label">Rating (optional)</label>
                      <div className="feedback-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`feedback-star ${formState.rating >= star ? "active" : ""}`}
                            onClick={() =>
                              setFormState((s) => ({
                                ...s,
                                rating: s.rating === star ? null : star,
                              }))
                            }
                            aria-label={`${star} star`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className="feedback-field">
                    <label className="feedback-label" htmlFor="feedback-message">
                      Message <span className="feedback-required">*</span>
                    </label>
                    <textarea
                      id="feedback-message"
                      className="feedback-textarea"
                      placeholder="Describe your feedback… (min 10 characters)"
                      value={formState.message}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, message: e.target.value }))
                      }
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                    />
                  </div>

                  {/* Email */}
                  <div className="feedback-field">
                    <label className="feedback-label" htmlFor="feedback-email">
                      Email (optional)
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      className="feedback-input"
                      placeholder="your@email.com"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, email: e.target.value }))
                      }
                    />
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <p className="feedback-error">{errorMsg}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="feedback-submit"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Sending…" : "Send Feedback"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
