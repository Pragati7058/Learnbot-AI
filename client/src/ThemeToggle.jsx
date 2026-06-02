import { createContext, useContext, useEffect, useState } from "react";

const ACCENTS = [
  { name: "Indigo", color: "#6366f1", light: "#e0e7ff", text: "#3730a3" },
  { name: "Violet", color: "#8b5cf6", light: "#ede9fe", text: "#5b21b6" },
  { name: "Pink", color: "#ec4899", light: "#fce7f3", text: "#9d174d" },
  { name: "Cyan", color: "#06b6d4", light: "#cffafe", text: "#0e7490" },
  { name: "Emerald", color: "#10b981", light: "#d1fae5", text: "#065f46" },
  { name: "Amber", color: "#f59e0b", light: "#fef3c7", text: "#92400e" },
];

const FONT_SIZES = [
  { label: "Small", size: 12 },
  { label: "Medium", size: 14 },
  { label: "Large", size: 17 },
];

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
}

export function applyGlobalVars(acc, dark, fontSize) {
  const r = document.documentElement.style;
  r.setProperty("--color-accent", acc.color);
  r.setProperty("--color-accent-light", acc.light);
  r.setProperty("--color-accent-text", acc.text);
  r.setProperty("--color-accent-glow", acc.color + "55");
  r.setProperty("--font-size-base", fontSize + "px");
  r.setProperty("--app-bg", dark ? "#07090f" : "#f8fafc");
  r.setProperty("--card-bg", dark ? "#0f172a" : "#ffffff");
  r.setProperty("--card-border", dark ? "#1e293b" : "#e2e8f0");
  r.setProperty("--text-primary", dark ? "#f1f5f9" : "#0f172a");
  r.setProperty("--text-secondary", dark ? "#64748b" : "#94a3b8");
  r.setProperty("--panel-bg", dark ? "rgba(7,9,15,0.97)" : "rgba(255,255,255,0.97)");
  r.setProperty("--panel-border", dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)");
  r.setProperty("--card-bg-deep", dark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.06)");
  r.setProperty("--input-bg", dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)");
  r.setProperty("--text-muted", dark ? "#475569" : "#64748b");
  r.setProperty("--glass-bg", dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)");
  r.setProperty("--glass-border", dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)");
  r.setProperty("--color-scheme", dark ? "dark" : "light");
}

const ThemeCtx = createContext(null);
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => load("theme-dark", true));
  const [acc, setAcc] = useState(() => {
    const saved = load("theme-accent", null);
    return ACCENTS.find(a => a.name === saved?.name) || ACCENTS[0];
  });
  const [fontSize, setFontSize] = useState(() => load("theme-fontSize", 14));

  useEffect(() => {
    applyGlobalVars(acc, dark, fontSize);
    save("theme-dark", dark);
    save("theme-accent", acc);
    save("theme-fontSize", fontSize);
  }, [acc, dark, fontSize]);

  return (
    <ThemeCtx.Provider value={{
      acc, dark, fontSize,
      setAccent: setAcc,
      toggleDark: () => setDark(d => !d),
      setFontSize,
      ACCENTS,
      FONT_SIZES,
    }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export default function ThemeToggle() {
  const { acc, dark, fontSize, setAccent, toggleDark, setFontSize, ACCENTS, FONT_SIZES } = useTheme();

  const panel = {
    background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    borderRadius: 14,
    padding: "14px 18px",
    transition: "background .3s, border-color .3s",
  };

  const labelSm = {
    fontSize: 11,
    color: dark ? "#475569" : "#94a3b8",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 10,
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>

      <div style={{ background: dark ? "#0f172a" : "#ffffff", border: `1px solid ${dark ? "#1e293b" : "#e2e8f0"}`, borderRadius: 16, padding: 20, transition: "background .3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: acc.light, color: acc.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600 }}>MR</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: dark ? "#f1f5f9" : "#0f172a" }}>Maya Rodriguez</div>
            <div style={{ fontSize: 12, color: dark ? "#64748b" : "#94a3b8", marginTop: 2 }}>Design System Lead</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: acc.light, color: acc.text }}>● Active</div>
          </div>
        </div>
        <button style={{ marginTop: 14, padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", background: acc.color, boxShadow: `0 4px 20px ${acc.color}55` }}>View Profile</button>
      </div>

      <div style={{ ...panel, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f1f5f9" : "#0f172a" }}>{dark ? "Dark mode" : "Light mode"}</div>
          <div style={{ fontSize: 11, color: dark ? "#64748b" : "#94a3b8", marginTop: 2 }}>{dark ? "Switch to light" : "Switch to dark"}</div>
        </div>
        <button onClick={toggleDark} style={{ width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer", position: "relative", background: dark ? acc.color : "rgba(148,163,184,0.3)", transition: "background .25s" }}>
          <div style={{ position: "absolute", top: 3, left: dark ? 26 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .25s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, pointerEvents: "none" }}>
            {dark ? "🌙" : "☀️"}
          </div>
        </button>
      </div>

      <div style={panel}>
        <div style={labelSm}>Accent Color</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ACCENTS.map((a) => (
            <button key={a.name} onClick={() => setAccent(a)} title={a.name}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", background: a.color, outline: acc.name === a.name ? `3px solid ${a.color}` : "none", outlineOffset: 2, transform: acc.name === a.name ? "scale(1.15)" : "scale(1)", transition: "transform .2s" }} />
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: dark ? "#64748b" : "#94a3b8" }}>
          Selected: <span style={{ color: acc.color, fontWeight: 700 }}>{acc.name}</span>
        </div>
      </div>

      <div style={panel}>
        <div style={labelSm}>Font Size</div>
        <div style={{ display: "flex", gap: 8 }}>
          {FONT_SIZES.map(({ label, size }) => {
            const active = fontSize === size;
            return (
              <button key={label} onClick={() => setFontSize(size)}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 8, cursor: "pointer", fontSize: 11 + (size - 12) / 2.5, fontWeight: 600,
                  border: `1px solid ${active ? acc.color : dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                  background: active ? acc.light : "transparent",
                  color: active ? acc.text : dark ? "#64748b" : "#94a3b8",
                  transition: "all .2s"
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
