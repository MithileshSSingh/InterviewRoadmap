"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

export default function ThemeDropdown() {
  const { themeId, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTheme = themes[themeId];

  return (
    <div className="theme-dropdown-container" ref={dropdownRef}>
      <button
        className="theme-dropdown-trigger mode-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select theme"
        title="Select theme"
      >
        <span className="theme-trigger-emoji">{activeTheme?.emoji || "🎨"}</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu">
          <div className="theme-dropdown-header">
            <h4>Select Theme</h4>
          </div>
          <div className="theme-dropdown-list">
            {Object.entries(themes).map(([id, theme]) => (
              <button
                key={id}
                className={`theme-dropdown-item ${themeId === id ? "active" : ""}`}
                onClick={() => {
                  changeTheme(id);
                  setIsOpen(false);
                }}
              >
                <span className="theme-item-emoji">{theme.emoji}</span>
                <div className="theme-item-info">
                  <span className="theme-item-name">{theme.name}</span>
                  <div className="theme-item-preview">
                    {theme.preview.map((color, i) => (
                      <div key={i} className="theme-item-swatch" style={{ background: color }} />
                    ))}
                  </div>
                </div>
                {themeId === id && <span className="theme-item-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
