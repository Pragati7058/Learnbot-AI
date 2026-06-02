/**
 * Production CORS — set CLIENT_URL (comma-separated) on Render/host.
 * Example: https://learnbot-ai.vercel.app,http://localhost:5173
 */
function parseAllowedOrigins() {
  const raw =
    process.env.CLIENT_URL ||
    process.env.ALLOWED_ORIGINS ||
    "http://localhost:5173,http://127.0.0.1:5173";
  return raw
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function originAllowed(origin, allowed) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, "");
  if (allowed.includes(normalized)) return true;
  if (process.env.NODE_ENV !== "production") {
    if (/^https?:\/\/localhost(:\d+)?$/.test(normalized)) return true;
    if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized)) return true;
  }
  if (normalized.endsWith(".vercel.app")) return true;
  if (process.env.ALLOW_VERCEL_PREVIEW === "true" && normalized.includes("vercel.app")) {
    return true;
  }
  return false;
}

function buildCorsOptions() {
  const allowed = parseAllowedOrigins();

  return {
    origin(origin, callback) {
      if (originAllowed(origin, allowed)) {
        return callback(null, true);
      }
      console.warn("[CORS] Blocked origin:", origin, "| Allowed:", allowed.join(", "));
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  };
}

module.exports = { buildCorsOptions, parseAllowedOrigins };
