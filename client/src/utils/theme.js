/** Monochrome palette — black, white, grays only; glow uses white alpha */

export const MONO = {
  black: "#000000",
  bg: "#070707",
  bgCard: "#0a0a0a",
  bgElevated: "#141414",
  border: "#262626",
  borderLight: "#404040",
  text: "#f5f5f5",
  textSecondary: "#a3a3a3",
  textMuted: "#737373",
  accent: "#ffffff",
  accentSoft: "#e5e5e5",
  accentDim: "#525252",
  glow: "rgba(255,255,255,0.45)",
  glowSoft: "rgba(255,255,255,0.22)",
  glowStrong: "rgba(255,255,255,0.65)",
  error: "#d4d4d4",
  errorBg: "rgba(255,255,255,0.06)",
  success: "#e5e5e5",
  successBg: "rgba(255,255,255,0.08)",
};

/** Distinct tool/feature shades (still grayscale) with glow preserved */
export const SHADES = [
  { color: "#ffffff", glow: "rgba(255,255,255,0.42)" },
  { color: "#e5e5e5", glow: "rgba(255,255,255,0.38)" },
  { color: "#d4d4d4", glow: "rgba(255,255,255,0.34)" },
  { color: "#a3a3a3", glow: "rgba(255,255,255,0.30)" },
  { color: "#fafafa", glow: "rgba(255,255,255,0.36)" },
  { color: "#c4c4c4", glow: "rgba(255,255,255,0.32)" },
  { color: "#bdbdbd", glow: "rgba(255,255,255,0.28)" },
  { color: "#9ca3af", glow: "rgba(255,255,255,0.26)" },
  { color: "#f0f0f0", glow: "rgba(255,255,255,0.40)" },
];

export function shade(i) {
  return SHADES[i % SHADES.length];
}

export const ACCENT_THEME = {
  name: "Monochrome",
  color: MONO.accent,
  light: "#e5e5e5",
  text: "#0a0a0a",
};
