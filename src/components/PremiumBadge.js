"use client";

import { useSession } from "next-auth/react";

export default function PremiumBadge({ className = "", style = {} }) {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = !!session;

  if (authStatus === "loading") {
    return null;
  }

  return (
    <span
      className={className}
      style={{
        marginLeft: "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        fontSize: "0.7rem",
        fontWeight: 600,
        color: "var(--accent-yellow)",
        background: "rgba(251, 191, 36, 0.1)",
        border: "1px solid rgba(251, 191, 36, 0.25)",
        borderRadius: "999px",
        padding: "0.2rem 0.6rem",
        ...style,
      }}
    >
      {isAuthenticated ? <span>Premium</span> : <span>🔒 Premium</span>}
    </span>
  );
}
