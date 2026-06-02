import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { callAI } from "../utils/api";
import { PROMPTS } from "../utils/prompts";

function buildRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = "en-US";
  return rec;
}

const styles = `
  @keyframes ping {
    0% { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0.6); }
    70% { transform: scale(1); box-shadow: 0 0 0 18px rgba(99,102,241,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  @keyframes pulse-red {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 18px rgba(239,68,68,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  }
  @keyframes blink {
    0%,80%,100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1.2); }
  }
  @keyframes wave {
    0% { transform: scaleY(0.4); }
    100% { transform: scaleY(1.6); }
  }
  @keyframes rotate-ring {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .mic-btn {
    width: 100px; height: 100px; border-radius: 50%; border: none;
    cursor: pointer; font-size: 38px;
    display: flex; align-items: center; justify-content: center;
    position: relative; transition: transform 0.15s ease;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 0 0 0 rgba(99,102,241,0.6), 0 8px 32px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
    animation: pulse-ring 2s infinite;
  }
  .mic-btn:hover { transform: scale(1.08); }
  .mic-btn:active { transform: scale(0.95); }
  .mic-btn.recording {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 0 0 0 rgba(239,68,68,0.7), 0 8px 32px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
    animation: pulse-red 1.2s infinite;
  }
  .mic-outer-ring {
    position: absolute; inset: -16px; border-radius: 50%;
    border: 2px solid rgba(99,102,241,0.25);
    animation: rotate-ring 4s linear infinite;
    background: conic-gradient(from 0deg, transparent 70%, rgba(99,102,241,0.5) 100%);
  }
  .mic-outer-ring.recording {
    border-color: rgba(239,68,68,0.3);
    background: conic-gradient(from 0deg, transparent 70%, rgba(239,68,68,0.6) 100%);
  }
`;

export default function VoicePanel({ color = "#6366f1" }) {
  const { apiKey } = useAuth();
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Click the mic or type a question below.");
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const finalRef = useRef("");
  const askRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("vp-styles")) {
      const s = document.createElement("style");
      s.id = "vp-styles";
      s.textContent = styles;
      document.head.appendChild(s);
    }
  }, []);

  const initRecognition = () => {
    const rec = buildRecognition();
    if (!rec) return;
    rec.onstart = () => setRecording(true);
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalRef.current += t;
        else interim += t;
      }
      setTranscript(finalRef.current + interim);
    };
    rec.onend = () => {
      setRecording(false);
      if (finalRef.current.trim()) askRef.current?.(finalRef.current.trim());
    };
    rec.onerror = () => {
      setRecording(false);
      setTimeout(() => initRecognition(), 300);
    };
    recognitionRef.current = rec;
  };

  useEffect(() => { initRecognition(); }, []);

  const toggleMic = () => {
    if (recording) {
      recognitionRef.current?.stop();
      return;
    }
    finalRef.current = "";
    setTranscript("");
    try {
      if (!recognitionRef.current) initRecognition();
      recognitionRef.current?.start();
    } catch (_) {
      initRecognition();
      setTimeout(() => { try { recognitionRef.current?.start(); } catch (_) { } }, 100);
    }
  };

  const askQuestion = async (question) => {
    const q = question || transcript.trim();
    if (!q) return;

    if (!apiKey?.trim()) {
      setResponse("Set your Groq API key first — click “Set API Key” in the top bar, then try again.");
      return;
    }

    setLoading(true);
    try {
      const text = await callAI(
        apiKey,
        [{ role: "user", content: q }],
        PROMPTS.chat
      );
      setResponse(text);
    } catch (e) {
      const msg = e.message || "Request failed";
      if (/expired|invalid|unauthorized|401|403/i.test(msg)) {
        setResponse(
          "Your Groq API key is invalid or expired. Get a new free key at console.groq.com/keys, then update it with “Set API Key” in the header."
        );
      } else {
        setResponse(`Error: ${msg}`);
      }
    }
    setLoading(false);
  };

  askRef.current = askQuestion;

  const handleSpeak = () => {
    if (speaking) { synthRef.current.cancel(); setSpeaking(false); return; }
    if (!response || response.startsWith("Set your Groq") || response.startsWith("Your Groq API")) return;
    const utt = new SpeechSynthesisUtterance(response);
    utt.rate = 0.95;
    utt.onend = () => setSpeaking(false);
    setSpeaking(true);
    synthRef.current.speak(utt);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {!apiKey?.trim() && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, fontSize: 12, lineHeight: 1.6,
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24",
        }}>
          Voice needs a Groq API key. Use <strong>Set API Key</strong> in the header (same key as chat).
        </div>
      )}

      <div style={{ textAlign: "center", padding: "36px 0 24px" }}>
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <div className={`mic-outer-ring${recording ? " recording" : ""}`} />
          {recording && [1, 2].map(i => (
            <div key={i} style={{
              position: "absolute", inset: -(i * 20), borderRadius: "50%",
              background: "rgba(239,68,68,0.08)",
              animation: `ping ${0.9 + i * 0.4}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
          {!recording && (
            <div style={{
              position: "absolute", inset: -8, borderRadius: "50%",
              background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
            }} />
          )}
          <button className={`mic-btn${recording ? " recording" : ""}`} onClick={toggleMic}>
            {recording ? "⏹" : "🎤"}
          </button>
        </div>
        <div style={{
          marginTop: 24, fontSize: 13, fontWeight: 500, letterSpacing: 0.3,
          color: recording ? "#f87171" : "#94a3b8",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {recording ? (
            <>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "blink 1s infinite" }} />
              Listening… speak now
            </>
          ) : "Tap mic to speak"}
        </div>
        {recording && (
          <div style={{ display: "flex", gap: 3, justifyContent: "center", alignItems: "flex-end", height: 24, marginTop: 12 }}>
            {[5, 12, 18, 24, 16, 10, 20, 14, 8].map((h, i) => (
              <div key={i} style={{
                width: 4, borderRadius: 3,
                background: "linear-gradient(to top, #ef4444, #f87171)",
                height: h,
                animation: `wave ${0.4 + (i % 4) * 0.15}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.07}s`,
              }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>TRANSCRIBED</div>
        <div style={{ fontSize: 13, color: transcript ? "#e2e8f0" : "#475569", fontStyle: transcript ? "normal" : "italic", minHeight: 20 }}>
          {transcript || "Your speech will appear here…"}
        </div>
        {transcript && (
          <button onClick={() => { setTranscript(""); finalRef.current = ""; }}
            style={{ marginTop: 8, fontSize: 10, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#475569", cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      <div style={{ background: `${color}0d`, borderRadius: 12, padding: "12px 14px", border: `1px solid ${color}25` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color, fontWeight: 600, letterSpacing: 1 }}>AI RESPONSE</div>
          <button onClick={handleSpeak} disabled={!response || loading}
            style={{ padding: "4px 10px", borderRadius: 6, background: speaking ? `${color}30` : "transparent", border: `1px solid ${color}40`, color, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            {speaking ? "⏸ Pause" : "▶ Read Aloud"}
          </button>
        </div>
        {loading ? (
          <div style={{ display: "flex", gap: 4, alignItems: "center", color, fontSize: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: color, animation: `blink 1s ${i * 0.2}s infinite` }} />
            ))}
            <span style={{ marginLeft: 4 }}>Thinking…</span>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7, minHeight: 20, whiteSpace: "pre-wrap" }}>{response}</div>
        )}
        {speaking && (
          <div style={{ display: "flex", gap: 3, marginTop: 10, alignItems: "flex-end", height: 20 }}>
            {[4, 8, 12, 16, 10, 6, 14, 8, 12].map((h, i) => (
              <div key={i} style={{ width: 3, borderRadius: 2, background: color, height: h, animation: `wave ${0.5 + (i % 3) * 0.2}s ease-in-out infinite alternate` }} />
            ))}
            <div style={{ fontSize: 10, color, marginLeft: 8, marginBottom: 2 }}>Speaking…</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Or type your question here and press Enter…"
          value={transcript}
          onChange={e => { setTranscript(e.target.value); finalRef.current = e.target.value; }}
          onKeyDown={e => e.key === "Enter" && askQuestion()}
          style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`, borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, outline: "none" }}
        />
        <button
          onClick={() => askQuestion()}
          disabled={loading}
          style={{ padding: "8px 16px", borderRadius: 8, background: `linear-gradient(135deg,${color},${color}cc)`, border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
