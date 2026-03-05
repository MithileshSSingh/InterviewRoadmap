"use client";
import { useTheme } from "./ThemeProvider";

export default function ThemeDropdown() {
  const { themeId, changeTheme, themes } = useTheme();
  const themeIds = Object.keys(themes);
  const activeTheme = themes[themeId];
  const currentIndex = themeIds.indexOf(themeId);

  const handleThemeCycle = () => {
    if (themeIds.length === 0) return;
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % themeIds.length : 0;
    changeTheme(themeIds[nextIndex]);
  };

  return (
    <button
      className="theme-dropdown-trigger mode-toggle"
      onClick={handleThemeCycle}
      aria-label="Cycle theme"
      title={`Current theme: ${activeTheme?.name || "Theme"}`}
    >
      <span className="theme-trigger-emoji">{activeTheme?.emoji || "🎨"}</span>
    </button>
  );
}
