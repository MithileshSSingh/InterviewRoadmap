"use client";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { themeId, changeTheme, themes } = useTheme();

  return (
    <div>
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Customize the look and feel of your learning experience.</p>
      </div>

      <section className="section">
        <h2 className="section-title"><span className="icon">🎨</span> Theme</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          Choose a color theme that suits your style. Your preference is saved automatically.
        </p>
        <div className="themes-grid">
          {Object.entries(themes).map(([id, theme]) => (
            <button
              key={id}
              className={`theme-card ${themeId === id ? "active" : ""}`}
              onClick={() => changeTheme(id)}
            >
              {themeId === id && <span className="theme-active-badge">✓ Active</span>}
              <div className="theme-preview">
                {theme.preview.map((color, i) => (
                  <div
                    key={i}
                    className="theme-swatch"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <div className="theme-info">
                <span className="theme-emoji">{theme.emoji}</span>
                <h3>{theme.name}</h3>
                <p>{theme.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
