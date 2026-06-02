import { useState, useEffect } from "react";
import { api } from "../utils/api";

const TOOL_COLORS = {
  chat: "#ffffff", notes: "#e5e5e5", summary: "#d4d4d4",
  flashcards: "#a3a3a3", diagram: "#fafafa", flowchart: "#c4c4c4",
  code: "#bdbdbd", formula: "#9ca3af", quiz: "#f0f0f0",
};

function StatCard({ label, value, sub, color = "#ffffff" }) {
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--panel-border)", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ label, count, max, color }) {
  const pct = max ? Math.round((count / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{count}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--panel-border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color || "#6366f1", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function ActivityDots({ data }) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const entry = data.find(x => x._id === key);
    days.push({ key, count: entry?.count || 0, label: d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }) });
  }
  const max = Math.max(...days.map(d => d.count), 1);
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Last 14 Days</div>
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 40 }}>
        {days.map(d => (
          <div key={d.key} title={`${d.label}: ${d.count} sessions`} style={{ flex: 1, borderRadius: 3, background: d.count > 0 ? `rgba(255,255,255,${0.2 + 0.8 * (d.count / max)})` : "var(--card-bg)", height: d.count > 0 ? `${20 + 80 * (d.count / max)}%` : "15%", minHeight: 4, cursor: "default" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 9, color: "var(--text-muted)" }}>14d ago</span>
        <span style={{ fontSize: 9, color: "var(--text-muted)" }}>today</span>
      </div>
    </div>
  );
}

export default function StatsPanel({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(d => setStats(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const maxTool = stats ? Math.max(...(stats.toolBreakdown?.map(t => t.count) || [1])) : 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 380, height: "100vh", background: "var(--panel-bg)", borderLeft: "1px solid var(--panel-border)", display: "flex", flexDirection: "column", animation: "slideInRight 0.25s ease", overflowY: "auto" }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--panel-border)", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, background: "var(--panel-bg)", zIndex: 2 }}>
          <span style={{ fontSize: 16 }}>📊</span>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Your Stats</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: "var(--card-bg)", border: "1px solid var(--panel-border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 15 }}>✕</button>
        </div>
        {loading && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading stats…</div>}
        {!loading && !stats && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Failed to load stats</div>}
        {stats && (
          <div style={{ padding: "16px 16px 30px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StatCard label="Total Sessions" value={stats.totalSessions} color="#ffffff" />
              <StatCard label="Bookmarks" value={stats.totalBookmarks} color="#e5e5e5" />
              <StatCard label="Starred" value={stats.starredSessions} color="#d4d4d4" />
              <StatCard label="Study Plans" value={stats.totalPlans} color="#a3a3a3" />
            </div>
            {stats.quizTotal > 0 && (
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--panel-border)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Quiz Performance</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#e5e5e5" }}>{stats.quizAvgScore}%</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>avg over {stats.quizTotal} quiz{stats.quizTotal !== 1 ? "zes" : ""}</div>
                </div>
              </div>
            )}
            {stats.dailyActivity && (
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--panel-border)", borderRadius: 12, padding: "14px 16px" }}>
                <ActivityDots data={stats.dailyActivity} />
              </div>
            )}
            {stats.toolBreakdown?.length > 0 && (
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--panel-border)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Sessions by Tool</div>
                {stats.toolBreakdown.map(t => <MiniBar key={t._id} label={t._id} count={t.count} max={maxTool} color={TOOL_COLORS[t._id]} />)}
              </div>
            )}
            {stats.taskStats?.total > 0 && (
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--panel-border)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Study Plan Progress</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#e5e5e5" }}>{stats.taskStats.done}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/ {stats.taskStats.total} tasks completed</div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--panel-border)" }}>
                  <div style={{ height: "100%", width: `${Math.round(stats.taskStats.done / stats.taskStats.total * 100)}%`, borderRadius: 3, background: "linear-gradient(90deg,#e5e5e5,#a3a3a3)", transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>{Math.round(stats.taskStats.done / stats.taskStats.total * 100)}% complete</div>
              </div>
            )}
            {stats.topTool && stats.totalSessions > 0 && (
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Favourite Tool</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#e5e5e5", textTransform: "capitalize" }}>{stats.topTool}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}