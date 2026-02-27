"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import themes from "@/themes";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState("emerald-forest");
  const [mode, setMode] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("js-roadmap-theme");
    const savedMode = localStorage.getItem("js-roadmap-mode");
    if (savedTheme && themes[savedTheme]) setThemeId(savedTheme);
    if (savedMode === "light" || savedMode === "dark") setMode(savedMode);
    setMounted(true);
  }, []);

  const applyTheme = useCallback((id) => {
    const theme = themes[id];
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(themeId);
      localStorage.setItem("js-roadmap-theme", themeId);
    }
  }, [themeId, mounted, applyTheme]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-mode", mode);
      localStorage.setItem("js-roadmap-mode", mode);
    }
  }, [mode, mounted]);

  const changeTheme = (id) => {
    if (themes[id]) setThemeId(id);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ themeId, changeTheme, themes, mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
