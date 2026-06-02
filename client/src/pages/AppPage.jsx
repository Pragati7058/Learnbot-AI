import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { callAI, api } from "../utils/api";
import { TOOLS, PROMPTS, QUICK_PROMPTS } from "../utils/prompts";
import { fixSvg } from "../utils/svgFixer";
import Markdown from "../components/Markdown";
import Icon from "../components/Icon";
import Flashcards from "../components/Flashcards";
import Quiz from "../components/Quiz";
import FeatureCard from "../components/FeatureCard";
import VoicePanel from "../components/VoicePanel";
import PDFPanel from "../components/PDFPanel";
import GamificationPanel from "../components/GamificationPanel";
import RevisionPanel from "../components/RevisionPanel";
import CollabPanel from "../components/CollabPanel";
import ThemeToggle from "../ThemeToggle";
import MindMapPanel from "../components/MindMapPanel";
import CodeLabPanel from "../components/CodeLabPanel";
import AnalyticsPanel from "../components/AnalyticsPanel";
import InterviewPanel from "../components/InterviewPanel";
import { features } from "../utils/features";

function Btn({ onClick, children, variant = "ghost", style = {}, disabled = false, title = "" }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 14px", borderRadius: 10, border: "1px solid",
    fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Inter',sans-serif", transition: "all .2s",
    opacity: disabled ? .4 : 1, ...style,
  };
  const variants = {
    ghost: { background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--text-secondary)" },
    primary: { background: "linear-gradient(135deg,var(--color-accent),var(--color-accent-light))", borderColor: "transparent", color: "#fff", boxShadow: "0 3px 14px var(--color-accent-glow)" },
    green: { background: "rgba(16,185,129,.1)", borderColor: "rgba(16,185,129,.25)", color: "#34d399" },
    amber: { background: "rgba(245,158,11,.1)", borderColor: "rgba(245,158,11,.25)", color: "#fbbf24" },
    danger: { background: "rgba(239,68,68,.08)", borderColor: "rgba(239,68,68,.2)", color: "#f87171" },
    indigo: { background: "var(--color-accent-glow)", borderColor: "var(--color-accent)", color: "var(--color-accent-light)" },
  };
  return (
    <button title={title} disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
    >
      {children}
    </button>
  );
}

function Typing() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 0", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--color-accent)",
          animation: `pulse-dot 1.2s ease-in-out ${i * .18}s infinite`,
          boxShadow: `0 0 6px var(--color-accent-glow)`,
        }} />
      ))}
    </div>
  );
}

function Welcome({ tool, onSend, busy }) {
  const tc = TOOLS.find(t => t.id === tool);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "40px 28px", textAlign: "center", animation: "fadeUp .3s ease" }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", background: tc?.color + "20", border: `1px solid ${tc?.color}38`, boxShadow: `0 0 32px ${tc?.glow}`, color: tc?.color }}>
        <Icon name={tc?.icon} size={34} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: tc?.color || "var(--color-accent)", marginBottom: 8 }}>
          {tc?.label}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, lineHeight: 1.9 }}>
          {
            tool === "chat" ? "Ask any engineering question — CS, ECE, Mechanical, Civil, or Math. Get precise, well-structured answers." :
              tool === "notes" ? "Enter any engineering topic and get comprehensive, structured study notes with formulas and real-world applications." :
                tool === "summary" ? "Name a topic or paste content and get a crisp, well-formatted engineering summary." :
                  tool === "flashcards" ? "Enter a topic and get 8 study flashcards. Tap each card to reveal the answer." :
                    tool === "diagram" ? "Describe any engineering concept and learnbot will draw a clean, labeled concept diagram." :
                      tool === "flowchart" ? "Describe any process or algorithm and get a clear, properly-spaced flowchart." :
                        tool === "code" ? "Share code to debug, explain, or optimize. Supports C, C++, Python, Java, MATLAB, Verilog and more." :
                          tool === "formula" ? "Ask about any engineering formula or equation — get a full breakdown with derivation, units, and examples." :
                            tool === "quiz" ? "Enter a topic and test your knowledge with 5 multiple-choice questions and instant feedback." : ""
          }
        </div>
      </div>
      {busy ? <Typing /> : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 540 }}>
          {(QUICK_PROMPTS[tool] || []).map((q, i) => (
            <button key={i} onClick={() => onSend(q)}
              style={{ fontSize: 13, padding: "8px 16px", borderRadius: 10, cursor: "pointer", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", transition: "all .2s", fontFamily: "inherit", fontWeight: 500 }}
              onMouseEnter={e => { e.currentTarget.style.background = tc?.color + "18"; e.currentTarget.style.borderColor = tc?.color + "40"; e.currentTarget.style.color = tc?.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--glass-bg)"; e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.transform = "none"; }}
            >{q}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function ApiKeyModal({ onClose, onSave, current }) {
  const [val, setVal] = useState(current || "");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(16px)", animation: "fadeIn .2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(440px, 92vw)", padding: "clamp(20px,5vw,32px)", borderRadius: 22, background: "var(--card-bg)", border: "1px solid var(--color-accent-glow)", boxShadow: "0 0 60px var(--color-accent-glow),0 32px 80px rgba(0,0,0,.6)", animation: "scaleIn .22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Icon name="key" size={18} style={{ color: "var(--color-accent)" }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Groq API Key</div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.8 }}>
          Get a <strong style={{ color: "var(--color-accent-light)" }}>free</strong> key at{" "}
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: "var(--color-accent)", fontWeight: 600 }}>console.groq.com/keys</a>
          {" "}— no credit card needed. Your key is stored in session memory only and never sent to our server.
        </p>
        <input type="password" placeholder="gsk_…" value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && val.trim() && onSave(val.trim())}
          autoFocus
          style={{ width: "100%", padding: "12px 14px", borderRadius: 11, background: "var(--color-accent-glow)", border: "1.5px solid var(--card-border)", color: "var(--text-primary)", fontSize: 14, outline: "none", marginBottom: 18, fontFamily: "'JetBrains Mono',monospace", letterSpacing: .5, transition: "all .2s" }}
          onFocus={e => { e.target.style.borderColor = "var(--color-accent)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--card-border)"; }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => val.trim() && onSave(val.trim())} variant="primary">
            <Icon name="key" size={14} /> Connect
          </Btn>
        </div>
      </div>
    </div>
  );
}

const PANEL_META = {
  voice: { label: "Voice Panel", tag: "Input", component: VoicePanel },
  pdf: { label: "PDF Panel", tag: "Document", component: PDFPanel },
  gamification: { label: "Gamification", tag: "Progress", component: GamificationPanel },
  revision: { label: "Revision", tag: "Memory", component: RevisionPanel },
  collab: { label: "Collab", tag: "Social", component: CollabPanel },
  theme: { label: "Theme", tag: "UI", component: ThemeToggle },
  mindmap: { label: "Mind Map", tag: "Visual", component: MindMapPanel },
  codelab: { label: "Code Lab", tag: "Code", component: CodeLabPanel },
  analytics: { label: "Analytics", tag: "Insights", component: AnalyticsPanel },
  interview: { label: "Interview Prep", tag: "Career", component: InterviewPanel },
};

const ADVANCED_FEATURES = [
  ...features.map((f) => {
    const meta = PANEL_META[f.id] || { label: f.title, tag: "Feature", component: FeatureCard };
    return {
      id: f.id,
      label: meta.label,
      desc: f.desc,
      color: f.color,
      accentBg: f.color + "18",
      tag: meta.tag,
      component: meta.component,
      icon: <span style={{ fontSize: 18 }}>{f.icon}</span>,
    };
  }),
  { id: "featurecard", label: "Feature Card", desc: "Sidebar card UI explorer", color: "#64748b", accentBg: "rgba(100,116,139,0.1)", tag: "UI", component: FeatureCard, icon: <span style={{ fontSize: 18 }}>📋</span> },
];

function QuickActionsModal({ onAction, onClose, isMobile }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.72)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(16px)", animation: "fadeIn .15s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(620px, 96vw)", maxHeight: "85vh", borderRadius: 20, background: "var(--card-bg)", border: "1px solid var(--color-accent-glow)", boxShadow: "0 0 80px var(--color-accent-glow), 0 40px 100px rgba(0,0,0,.7)", animation: "scaleIn .18s ease", overflow: "hidden" }}>
        <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-accent-light)", marginBottom: 2 }}>Quick Actions</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>All tools & features</div>
          </div>
          {!isMobile && <div style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 6, padding: "3px 8px", fontFamily: "monospace" }}>Ctrl+K</div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8, padding: 16, overflowY: "auto", maxHeight: "calc(85vh - 100px)" }}>
          {ADVANCED_FEATURES.map(f => (
            <button key={f.id} onClick={() => { onAction(f.id); onClose(); }}
              onMouseEnter={() => setHovered(f.id)} onMouseLeave={() => setHovered(null)}
              style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px", borderRadius: 12, cursor: "pointer", background: hovered === f.id ? f.accentBg : "var(--glass-bg)", border: `1px solid ${hovered === f.id ? f.color + "44" : "var(--glass-border)"}`, fontFamily: "'Inter',sans-serif", textAlign: "left", transition: "all .16s", transform: hovered === f.id ? "translateY(-1px)" : "none", boxShadow: hovered === f.id ? `0 4px 18px ${f.color}20` : "none", position: "relative" }}>
              <span style={{ position: "absolute", top: 7, right: 7, fontSize: 7, background: "var(--color-accent)", color: "#fff", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>NEW</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: f.accentBg, border: `1px solid ${f.color}30` }}>{f.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>{f.desc}</div>
                <span style={{ display: "inline-block", marginTop: 6, fontSize: 8, padding: "2px 6px", borderRadius: 6, color: f.color, background: f.color + "18", border: `0.5px solid ${f.color}33` }}>{f.tag}</span>
              </div>
            </button>
          ))}
        </div>
        <div style={{ padding: "8px 16px 14px", textAlign: "center", borderTop: "1px solid var(--card-border)" }}>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Press </span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 5, padding: "1px 6px", fontFamily: "monospace" }}>ESC</span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}> to close</span>
        </div>
      </div>
    </div>
  );
}

export default function AppPage({ onShowBookmarks, onShowStats, onShowPlanner }) {
  const { user, logout, apiKey, setApiKey } = useAuth();
  const [tool, setTool] = useState("chat");
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [cards, setCards] = useState([]);
  const [svg, setSvg] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => { api.getHistory({ limit: 40 }).then(d => setHistory(d.sessions || [])).catch(() => { }); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => {
    if (taRef.current) { taRef.current.style.height = "24px"; taRef.current.style.height = Math.min(taRef.current.scrollHeight, 130) + "px"; }
  }, [inp]);
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowQuickActions(s => !s); }
      if (e.key === "Escape" && activePanel) setActivePanel(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activePanel]);

  const switchTool = useCallback((t) => {
    setTool(t); setMsgs([]); setCards([]); setSvg(""); setQuizData(null); setInp(""); setSessionId(null);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleQuickAction = (action) => {
    if (ADVANCED_FEATURES.some(f => f.id === action)) { setActivePanel(action); return; }
    if (action === "bookmarks") onShowBookmarks();
    if (action === "stats") onShowStats();
    if (action === "planner") onShowPlanner();
  };
  const refreshHistory = () => { api.getHistory({ limit: 40 }).then(d => setHistory(d.sessions || [])).catch(() => { }); };
  const downloadChat = () => {
    const text = msgs.map(m => `[${m.r === "ai" ? "learnbot" : user?.name || "You"}]\n${m.t}\n`).join("\n---\n\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); a.download = `learnbot-${tool}-${Date.now()}.txt`; a.click();
  };
  const downloadSvg = () => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); a.download = `learnbot-${tool}-${Date.now()}.svg`; a.click();
  };
  const saveSession = async (title, messages, extra = {}) => {
    try { const d = await api.createSession({ tool, title, messages, ...extra }); setSessionId(d.session._id); refreshHistory(); } catch { }
  };

  const send = useCallback(async (prompt = inp) => {
    const q = (typeof prompt === "string" ? prompt : inp).trim();
    if (!q) return;
    if (!apiKey) { setShowKeyModal(true); return; }
    setInp("");
    if (tool === "flashcards") {
      setBusy(true);
      try {
        const raw = await callAI(apiKey, [{ role: "user", content: `Generate 8 engineering flashcards about: ${q}` }], PROMPTS.flashcards);
        const clean = raw.replace(/```json|```/gi, "").trim();
        let arr = []; try { arr = JSON.parse(clean); } catch { const m = clean.match(/\[[\s\S]*\]/); if (m) arr = JSON.parse(m[0]); }
        if (Array.isArray(arr) && arr.length > 0) { setCards(arr); saveSession(q, [], { flashcards: arr }); }
        else setMsgs(p => [...p, { r: "ai", t: "Couldn't parse flashcards — please try rephrasing the topic." }]);
      } catch (e) { setMsgs(p => [...p, { r: "ai", t: `Error: ${e.message}` }]); }
      setBusy(false); return;
    }
    if (tool === "diagram" || tool === "flowchart") {
      setBusy(true); setSvg("");
      try {
        const raw = await callAI(apiKey, [{ role: "user", content: `Create a ${tool} for: ${q}` }], PROMPTS[tool]);
        const m = raw.match(/<svg[\s\S]*?<\/svg>/i);
        if (m) { const fixed = fixSvg(m[0], tool); setSvg(fixed); saveSession(q, [], { svgData: fixed }); }
        else setMsgs(p => [...p, { r: "ai", t: "Could not render the SVG. Please try a more specific or simpler topic." }]);
      } catch (e) { setMsgs(p => [...p, { r: "ai", t: `Error: ${e.message}` }]); }
      setBusy(false); return;
    }
    if (tool === "quiz") {
      setBusy(true); setQuizData(null);
      try {
        const raw = await callAI(apiKey, [{ role: "user", content: `Generate 5 quiz questions about: ${q}` }], PROMPTS.quiz);
        const clean = raw.replace(/```json|```/gi, "").trim();
        let arr = []; try { arr = JSON.parse(clean); } catch { const m = clean.match(/\[[\s\S]*\]/); if (m) arr = JSON.parse(m[0]); }
        if (Array.isArray(arr) && arr.length > 0) { setQuizData(arr); saveSession(q, [], { quizData: arr }); }
        else setMsgs(p => [...p, { r: "ai", t: "Couldn't generate quiz. Please try again." }]);
      } catch (e) { setMsgs(p => [...p, { r: "ai", t: `Error: ${e.message}` }]); }
      setBusy(false); return;
    }
    setMsgs(p => [...p, { r: "u", t: q }]); setBusy(true);
    try {
      const histMsgs = msgs.slice(-12).map(m => ({ role: m.r === "ai" ? "assistant" : "user", content: m.t }));
      const res = await callAI(apiKey, [...histMsgs, { role: "user", content: q }], PROMPTS[tool] || PROMPTS.chat);
      setMsgs(p => {
        const next = [...p, { r: "ai", t: res }];
        const allMsgs = next.map(m => ({ role: m.r === "ai" ? "assistant" : "user", content: m.t }));
        if (!sessionId) api.createSession({ tool, title: q.slice(0, 80), messages: allMsgs }).then(d => { setSessionId(d.session._id); refreshHistory(); }).catch(() => { });
        else api.updateSession(sessionId, { messages: allMsgs }).catch(() => { });
        return next;
      });
    } catch (e) { setMsgs(p => [...p, { r: "ai", t: `Error: ${e.message}` }]); }
    setBusy(false);
  }, [inp, tool, apiKey, msgs, sessionId]);

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";
  const tc = TOOLS.find(t => t.id === tool);
  const isChatLike = ["chat", "notes", "summary", "code", "formula"].includes(tool);

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "256px 1fr", gridTemplateRows: "62px 1fr", height: "100vh", background: "var(--app-bg)" }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: "var(--card-bg)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--card-border)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Hamburger — mobile only */}
          {isMobile && (
            <button onClick={() => setSidebarOpen(s => !s)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,var(--color-accent),var(--color-accent-light))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px var(--color-accent-glow)", flexShrink: 0 }}>
            <Icon name="logo" size={20} />
          </div>
          <div>
            <div style={{ fontSize: isMobile ? 16 : 19, fontWeight: 800, background: "linear-gradient(135deg,var(--color-accent-light),#c4b5fd,#f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.15 }}>learnbot</div>
            {!isMobile && <div style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: 1 }}>for engineers</div>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8 }}>
          {/* Desktop-only header buttons */}
          {!isMobile && isChatLike && msgs.length > 0 && <Btn onClick={downloadChat}><Icon name="download" size={13} /> Download</Btn>}
          {!isMobile && <Btn onClick={onShowBookmarks} variant="ghost"><Icon name="star" size={13} /> Bookmarks</Btn>}
          {!isMobile && <Btn onClick={onShowStats} variant="ghost">📊 Stats</Btn>}
          {!isMobile && <Btn onClick={onShowPlanner} variant="ghost">📚 Planner</Btn>}
          {!isMobile && <Btn onClick={() => setShowHistory(s => !s)} variant={showHistory ? "indigo" : "ghost"}><Icon name="history" size={13} /> History</Btn>}

          {/* API key btn — compact on mobile */}
          <Btn onClick={() => setShowKeyModal(true)} variant={apiKey ? "green" : "amber"} style={isMobile ? { padding: "6px 10px" } : {}}>
            <Icon name="key" size={13} /> {isMobile ? (apiKey ? "✓" : "Key") : (apiKey ? "Groq Live" : "Set API Key")}
          </Btn>

          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--color-accent),#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", cursor: "default", boxShadow: "0 0 14px var(--color-accent-glow)", userSelect: "none", flexShrink: 0 }} title={user?.name}>{initials}</div>

          {/* Logout — icon only on mobile */}
          {!isMobile
            ? <Btn onClick={logout}><Icon name="logout" size={13} /> Logout</Btn>
            : <button onClick={logout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 6, display: "flex", alignItems: "center", borderRadius: 8 }}><Icon name="logout" size={16} /></button>
          }
        </div>
      </header>

      {/* ── SIDEBAR ────────────────────────────────────────────── */}
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 40, backdropFilter: "blur(4px)" }} />
      )}
      <aside style={{
        ...(isMobile ? {
          position: "fixed", top: 62, left: 0, bottom: 0,
          width: 260, zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .25s ease",
        } : {}),
        background: "var(--card-bg)", backdropFilter: "blur(20px)",
        borderRight: "1px solid var(--card-border)", padding: "16px 10px",
        display: "flex", flexDirection: "column", gap: 2, overflowY: "auto",
      }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--color-accent)", padding: "10px 10px 6px", opacity: .6 }}>Tools</div>

        {/* Quick Actions button */}
        <button onClick={() => { setShowQuickActions(true); if (isMobile) setSidebarOpen(false); }} title="Quick Actions (Ctrl+K)"
          style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 12, cursor: "pointer", border: "1px dashed var(--color-accent-glow)", color: "var(--color-accent)", background: "var(--color-accent-glow)", width: "100%", textAlign: "left", transition: "all .18s", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}
          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-accent-glow)", border: "1px solid var(--color-accent)", fontSize: 22, lineHeight: 1, color: "var(--color-accent)", fontWeight: 300, flexShrink: 0 }}>+</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent)" }}>Quick Actions</div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>{isMobile ? "All features" : "Ctrl+K"}</div>
          </div>
        </button>

        {/* Mobile-only extra nav */}
        {isMobile && (
          <div style={{ display: "flex", gap: 6, padding: "4px 2px 8px", flexWrap: "wrap" }}>
            <button onClick={() => { onShowBookmarks(); setSidebarOpen(false); }} style={{ flex: 1, padding: "8px 6px", borderRadius: 9, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>⭐ Bookmarks</button>
            <button onClick={() => { onShowStats(); setSidebarOpen(false); }} style={{ flex: 1, padding: "8px 6px", borderRadius: 9, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>📊 Stats</button>
            <button onClick={() => { onShowPlanner(); setSidebarOpen(false); }} style={{ flex: 1, padding: "8px 6px", borderRadius: 9, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>📚 Plan</button>
            <button onClick={() => { setShowHistory(s => !s); }} style={{ flex: 1, padding: "8px 6px", borderRadius: 9, background: showHistory ? "var(--color-accent-glow)" : "var(--glass-bg)", border: `1px solid ${showHistory ? "var(--color-accent)" : "var(--glass-border)"}`, color: showHistory ? "var(--color-accent)" : "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>🕐 History</button>
          </div>
        )}

        {TOOLS.map(t => {
          const on = tool === t.id;
          return (
            <button key={t.id} onClick={() => switchTool(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 12, cursor: "pointer", border: `1px solid ${on ? t.color + "48" : "transparent"}`, color: on ? t.color : "var(--text-secondary)", background: on ? t.color + "16" : "transparent", width: "100%", textAlign: "left", transition: "all .18s", fontFamily: "'Inter',sans-serif", boxShadow: on ? `0 0 18px ${t.glow}` : "none" }}
              onMouseEnter={e => { if (!on) { e.currentTarget.style.background = "var(--glass-bg)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
              onMouseLeave={e => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: on ? t.color + "28" : "var(--glass-bg)", border: `1px solid ${on ? t.color + "38" : "var(--glass-border)"}`, transition: "all .2s", color: on ? t.color : "var(--text-secondary)" }}>
                <Icon name={t.icon} size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{t.desc}</div>
              </div>
            </button>
          );
        })}

        {showHistory && (
          <>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--color-accent)", padding: "14px 10px 6px", marginTop: 6, borderTop: "1px solid var(--card-border)", opacity: .6 }}>History</div>
            {history.length === 0 && <div style={{ fontSize: 12, color: "var(--text-secondary)", padding: "6px 10px" }}>No history yet</div>}
            {history.map((h, i) => (
              <div key={h._id || i}
                style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11.5, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "all .18s", border: "1px solid transparent", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent-glow)"; e.currentTarget.style.color = "var(--color-accent)"; e.currentTarget.style.borderColor = "var(--color-accent-glow)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "transparent"; }}
                onClick={() => { const t = TOOLS.find(t => t.id === h.tool); if (t) switchTool(h.tool); setShowHistory(false); }}
                title={h.title}
              >
                <span style={{ fontSize: 11 }}>•</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</span>
              </div>
            ))}
            {history.length > 0 && (
              <Btn onClick={async () => { await api.clearHistory(); setHistory([]); }} variant="danger" style={{ margin: "6px 10px", width: "calc(100% - 20px)" }}>
                <Icon name="trash" size={12} /> Clear All
              </Btn>
            )}
          </>
        )}
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tool header bar */}
        <div style={{ padding: isMobile ? "10px 14px" : "12px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "var(--card-bg)", backdropFilter: "blur(16px)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: tc?.color + "22", border: `1px solid ${tc?.color}38`, boxShadow: `0 0 18px ${tc?.glow}`, color: tc?.color, flexShrink: 0 }}>
            <Icon name={tc?.icon} size={19} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{tc?.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tc?.desc}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {tool === "flashcards" && cards.length > 0 && <Btn variant="amber">{cards.length} cards</Btn>}
            {(tool === "diagram" || tool === "flowchart") && svg && <Btn onClick={downloadSvg} variant="indigo"><Icon name="download" size={12} />{!isMobile && " SVG"}</Btn>}
            {busy && <Btn variant="ghost" disabled>Generating…</Btn>}
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        {tool === "flashcards" && cards.length > 0 ? (
          <Flashcards cards={cards} onNewTopic={(t) => send(t)} busy={busy} />
        ) : (tool === "diagram" || tool === "flowchart") ? (
          <>
            {svg ? (
              <div style={{ flex: 1, padding: isMobile ? "12px" : "16px 20px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
                <div style={{ background: "var(--glass-bg)", backdropFilter: "blur(16px)", border: "1px solid var(--card-border)", borderRadius: 16, overflow: "hidden", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
                  <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: svg.replace(/<svg/, '<svg style="width:100%;height:100%;display:block;" preserveAspectRatio="xMidYMid meet"') }} />
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <Btn onClick={() => { setSvg(""); setMsgs([]); }} variant="indigo">↺ Regenerate</Btn>
                  <Btn onClick={downloadSvg} variant="ghost"><Icon name="download" size={12} /> Download SVG</Btn>
                </div>
              </div>
            ) : <Welcome tool={tool} onSend={send} busy={busy} />}
            <div style={{ padding: isMobile ? "10px 12px 14px" : "12px 24px 18px", borderTop: "1px solid var(--card-border)", background: "var(--card-bg)", backdropFilter: "blur(16px)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: "10px 14px" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--color-accent)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--glass-border)"}
              >
                <textarea ref={taRef} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14, fontFamily: "'Inter',sans-serif", resize: "none", lineHeight: 1.7, minHeight: 24, maxHeight: 130 }}
                  rows={1} placeholder="Describe concept to visualize…" value={inp}
                  onChange={e => setInp(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
                <button onClick={send} disabled={busy || !inp.trim()}
                  style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-accent)", border: "none", cursor: "pointer", color: "#fff", flexShrink: 0, opacity: busy || !inp.trim() ? .3 : 1, transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 16px var(--color-accent-glow)" }}>
                  <Icon name="send" size={15} />
                </button>
              </div>
            </div>
          </>
        ) : tool === "quiz" && quizData ? (
          <Quiz questions={quizData} onRetry={() => { setQuizData(null); setMsgs([]); }} />
        ) : (
          <>
            {msgs.length === 0 && !busy ? <Welcome tool={tool} onSend={send} busy={busy} /> : (
              <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "22px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: m.r === "u" ? "row-reverse" : "row", animation: "fadeUp .22s ease" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, background: m.r === "ai" ? "linear-gradient(135deg,var(--color-accent),#8b5cf6)" : "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontSize: m.r === "ai" ? 0 : 12 }}>
                      {m.r === "ai" ? <Icon name="logo" size={17} /> : initials}
                    </div>
                    {m.r === "ai" ? (
                      <div style={{ maxWidth: isMobile ? "88%" : "82%", background: "var(--glass-bg)", backdropFilter: "blur(20px)", border: "1px solid var(--card-border)", borderRadius: 18, borderBottomLeftRadius: 4, padding: isMobile ? "12px 14px" : "16px 20px" }}>
                        <Markdown text={m.t} />
                      </div>
                    ) : (
                      <div style={{ maxWidth: isMobile ? "80%" : "72%", background: "var(--glass-bg)", backdropFilter: "blur(16px)", border: "1px solid var(--card-border)", borderRadius: 18, borderBottomRightRadius: 4, padding: "12px 17px", color: "var(--text-primary)", fontSize: 14, lineHeight: 1.8 }}>
                        {m.t}
                      </div>
                    )}
                  </div>
                ))}
                {busy && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--color-accent),#8b5cf6)" }}>
                      <Icon name="logo" size={17} />
                    </div>
                    <div style={{ background: "var(--glass-bg)", backdropFilter: "blur(16px)", border: "1px solid var(--card-border)", borderRadius: 18, borderBottomLeftRadius: 4, padding: "14px 18px" }}>
                      <Typing />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
            <div style={{ padding: isMobile ? "10px 12px 16px" : "12px 28px 20px", borderTop: "1px solid var(--card-border)", background: "var(--card-bg)", backdropFilter: "blur(20px)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 16, padding: "11px 15px", transition: "border-color .2s, box-shadow .2s" }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.boxShadow = "0 0 0 4px var(--color-accent-glow)"; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <textarea ref={taRef}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14, fontFamily: "'Inter',sans-serif", resize: "none", lineHeight: 1.75, minHeight: 24, maxHeight: 130 }}
                  rows={1}
                  placeholder={tool === "chat" ? "Ask any engineering question…" : tool === "code" ? "Paste code or describe the problem…" : tool === "quiz" ? "Enter a topic to quiz yourself on…" : tool === "formula" ? "Ask about any formula or equation…" : `Enter topic for ${tc?.label?.toLowerCase()}…`}
                  value={inp} onChange={e => setInp(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {msgs.length > 0 && (
                    <button onClick={() => { setMsgs([]); setSessionId(null); }} title="Clear chat"
                      style={{ width: 36, height: 36, borderRadius: 10, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.1)"; e.currentTarget.style.color = "#f87171"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--glass-bg)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                    ><Icon name="trash" size={14} /></button>
                  )}
                  <button onClick={send} disabled={busy || !inp.trim()}
                    style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-accent)", border: "none", cursor: "pointer", color: "#fff", flexShrink: 0, opacity: busy || !inp.trim() ? .3 : 1, transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 16px var(--color-accent-glow)" }}
                    onMouseEnter={e => { if (!busy && inp.trim()) { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.filter = "brightness(1.15)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "none"; }}
                  ><Icon name="send" size={15} /></button>
                </div>
              </div>
              {!isMobile && (
                <div style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", marginTop: 8, opacity: .5 }}>
                  Shift+Enter for new line · Enter to send
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showKeyModal && <ApiKeyModal current={apiKey} onClose={() => setShowKeyModal(false)} onSave={(k) => { setApiKey(k); setShowKeyModal(false); }} />}
      {showQuickActions && <QuickActionsModal onAction={handleQuickAction} onClose={() => setShowQuickActions(false)} isMobile={isMobile} />}

      {activePanel && (() => {
        const feat = ADVANCED_FEATURES.find(f => f.id === activePanel);
        if (!feat) return null;
        const PanelComponent = feat.component;
        return (
          <div onClick={() => setActivePanel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.78)", zIndex: 400, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", backdropFilter: "blur(20px)", animation: "fadeIn .18s ease" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: isMobile ? "100%" : "min(860px, 94vw)", maxHeight: isMobile ? "90vh" : "88vh", overflowY: "auto", borderRadius: isMobile ? "20px 20px 0 0" : 20, background: "var(--card-bg)", border: `1px solid ${feat.color}33`, boxShadow: `0 0 80px ${feat.color}18, 0 40px 100px rgba(0,0,0,.7)`, animation: "scaleIn .2s ease", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px 14px", borderBottom: "1px solid var(--card-border)", flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: feat.accentBg, border: `1px solid ${feat.color}30` }}>{feat.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{feat.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{feat.desc}</div>
                </div>
                <button onClick={() => setActivePanel(null)}
                  style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 8, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.1)"; e.currentTarget.style.color = "#f87171"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--glass-bg)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >✕</button>
              </div>
              <div style={{ flex: 1, overflow: "auto" }}>
                <PanelComponent onClose={() => setActivePanel(null)} />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}