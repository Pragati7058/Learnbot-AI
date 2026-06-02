const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("lb_token");
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  forgot: (body) => request("/api/auth/forgot", { method: "POST", body: JSON.stringify(body) }),
  reset: (body) => request("/api/auth/reset", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
  saveApiKey: (apiKey) => request("/api/auth/apikey", { method: "PUT", body: JSON.stringify({ apiKey }) }),

  // History
  getHistory: (params = {}) => request("/api/history?" + new URLSearchParams(params)),
  getSession: (id) => request(`/api/history/${id}`),
  createSession: (body) => request("/api/history", { method: "POST", body: JSON.stringify(body) }),
  updateSession: (id, body) => request(`/api/history/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSession: (id) => request(`/api/history/${id}`, { method: "DELETE" }),
  clearHistory: () => request("/api/history", { method: "DELETE" }),
  starSession: (id) => request(`/api/history/${id}/star`, { method: "PATCH" }),

  // Bookmarks
  getBookmarks: () => request("/api/bookmarks"),
  createBookmark: (body) => request("/api/bookmarks", { method: "POST", body: JSON.stringify(body) }),
  deleteBookmark: (id) => request(`/api/bookmarks/${id}`, { method: "DELETE" }),
  clearBookmarks: () => request("/api/bookmarks", { method: "DELETE" }),

  // Stats
  getStats: () => request("/api/stats"),

  // Study Planner
  getStudyPlans: () => request("/api/studyplan"),
  createStudyPlan: (body) => request("/api/studyplan", { method: "POST", body: JSON.stringify(body) }),
  deleteStudyPlan: (id) => request(`/api/studyplan/${id}`, { method: "DELETE" }),
  toggleTask: (id, taskId) => request(`/api/studyplan/${id}/tasks/${taskId}`, { method: "PATCH" }),
};

// â”€â”€â”€ Groq AI call (client-side, key never hits our server) â”€â”€
export async function callAI(key, messages, systemPrompt) {
  const cleanKey = key.trim().replace(/[^\x20-\x7E]/g, "");
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", "Bearer " + cleanKey);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || "Groq API error " + res.status);
  }
  const d = await res.json();
  return d?.choices?.[0]?.message?.content || "no response";
}
