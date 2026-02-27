"use client";
import { useTheme } from "./ThemeProvider";

export default function ModeToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <button
      className="mode-toggle"
      onClick={toggleMode}
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
    >
      <span className={`mode-icon ${mode === "dark" ? "show" : ""}`}>🌙</span>
      <span className={`mode-icon ${mode === "light" ? "show" : ""}`}>☀️</span>
    </button>
  );
}
