"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const dropdownRef = useRef(null);
  const signInInFlightRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Click-outside handler (same pattern as ThemeDropdown)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignInClick() {
    if (signInInFlightRef.current) return;
    signInInFlightRef.current = true;
    setIsSigningIn(true);
    const callbackUrl = window.location.href;

    try {
      const result = await signIn(undefined, {
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

    // Fallback reset path if auth library didn't navigate.
    if (signInInFlightRef.current) {
      signInInFlightRef.current = false;
      setIsSigningIn(false);
    }
  }

  if (pathname === "/auth/signin") return null;

  if (!mounted || status === "loading") {
    return (
      <div
        className="mode-toggle"
        style={{ opacity: 0.5, cursor: "default" }}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    );
  }

  if (!session) {
    return (
      <button
        className="mode-toggle"
        onClick={handleSignInClick}
        disabled={isSigningIn}
        aria-label={isSigningIn ? "Signing in" : "Sign in"}
        aria-busy={isSigningIn}
        title={isSigningIn ? "Signing in..." : "Sign in"}
      >
        {isSigningIn ? (
          <span className="auth-spinner" aria-hidden="true" />
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <div className="auth-dropdown-container" ref={dropdownRef}>
      <button
        className="mode-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Account menu"
        title={session.user?.name || "Account"}
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            width={28}
            height={28}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
            {(session.user?.name?.[0] || "U").toUpperCase()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="auth-dropdown-menu">
          <div className="auth-dropdown-header">
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              {session.user?.name || "User"}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginTop: "0.15rem",
              }}
            >
              {session.user?.email}
            </div>
          </div>
          <div className="auth-dropdown-actions">
            <button
              className="auth-dropdown-item"
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: window.location.href });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
