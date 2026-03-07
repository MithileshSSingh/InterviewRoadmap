"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession, signIn } from "next-auth/react";

export default function RequireAuthDialog({
  children,
  onAction,
  featureName = "this feature",
}) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const signInInFlightRef = useRef(false);

  const handleClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (status === "loading") return;

    if (session) {
      if (onAction) onAction();
    } else {
      setIsOpen(true);
    }
  };

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleGoogleSignIn() {
    if (signInInFlightRef.current) return;
    signInInFlightRef.current = true;
    setIsSigningIn(true);

    const callbackUrl = window.location.href;

    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (result?.url) {
        window.location.assign(result.url);
        return;
      }
    } catch {
      // No-op: reset state below so user can retry.
    }

    if (signInInFlightRef.current) {
      signInInFlightRef.current = false;
      setIsSigningIn(false);
    }
  }

  const dialog = isOpen
    ? createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5, 8, 6, 0.85)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              width: "100%",
              maxWidth: 420,
              margin: "1rem",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
              animation: "slideDown 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-blue)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: "0.75rem" }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h2
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                Sign in Required
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                You need to sign in to access {featureName}.
              </p>
            </div>

            {/* Sign-in button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              aria-busy={isSigningIn}
              style={{
                width: "100%",
                padding: "0.8rem 1rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: isSigningIn ? "not-allowed" : "pointer",
                opacity: isSigningIn ? 0.8 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                transition: "all 0.15s ease",
              }}
            >
              {isSigningIn ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Redirecting to Google...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <p
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                marginTop: "1.25rem",
              }}
            >
              Anonymous usage is still fully supported. Sign in for locked/premium features.
            </p>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div onClick={handleClick} style={{ display: "inline-block" }}>
        {children}
      </div>
      {dialog}
    </>
  );
}
