"use client";
import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";

function BookmarkMigrator() {
  const { data: session } = useSession();

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const sessionId =
      typeof window !== "undefined"
        ? localStorage.getItem("cf-session-id")
        : null;
    if (!sessionId) return;

    // Only run once per user per device
    const migrationKey = `bm-migrated-${userId}`;
    if (localStorage.getItem(migrationKey)) return;

    fetch("/api/bookmarks/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(migrationKey, "true");
      })
      .catch(() => {});
  }, [session?.user?.id]);

  return null;
}

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <BookmarkMigrator />
      {children}
    </SessionProvider>
  );
}
