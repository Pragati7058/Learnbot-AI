import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";
import { useAuth } from "../context/AuthContext";
import { callAI } from "../utils/api";
import { PROMPTS } from "../utils/prompts";
import Markdown from "./Markdown";
import Flashcards from "./Flashcards";
import Quiz from "./Quiz";

const css = `
  @keyframes float-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.6); }
    50% { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes progress-fill {
    from { width: 0%; }
    to { width: 100%; }
  }
  @keyframes bar-grow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  .pdf-drop-zone {
    border-radius: 20px; padding: 40px 24px; text-align: center;
    background: rgba(255,255,255,0.02);
    border: 2px dashed rgba(255,255,255,0.08);
    cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden;
  }
  .pdf-drop-zone:hover, .pdf-drop-zone.drag-over {
    background: rgba(99,102,241,0.06);
    border-color: rgba(99,102,241,0.4);
    transform: scale(1.01);
  }
  .pdf-drop-zone:hover .upload-icon {
    transform: translateY(-4px) scale(1.1);
  }
  .upload-icon { transition: transform 0.3s ease; display: block; margin: 0 auto 12px; }
  .action-btn {
    padding: 8px 16px; border-radius: 10px; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.2s ease; letter-spacing: 0.3px;
    position: relative; overflow: hidden;
  }
  .action-btn:hover { transform: translateY(-2px); filter: brightness(1.15); }
  .action-btn:active { transform: translateY(0); }
  .action-btn.active {
    transform: translateY(-1px);
    filter: brightness(1.2);
  }
  .card-animate { animation: float-in 0.35s ease forwards; }
  .result-section { animation: float-in 0.4s ease forwards; }
  .page-bar {
    transform-origin: bottom;
    animation: bar-grow 0.6s ease forwards;
  }
`;

const ACTIONS = [
  { id: "summarize", label: "Summarize", icon: "📋", desc: "Key points & overview" },
  { id: "notes", label: "Generate Notes", icon: "📝", desc: "Structured study notes" },
  { id: "flashcards", label: "Flashcards", icon: "🃏", desc: "Q&A memory cards" },
  { id: "quiz", label: "Create Quiz", icon: "🧠", desc: "Test your knowledge" },
];

function countWords(s) {
  const t = (s || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

async function extractPdfText(file, onProgress) {
  const buf = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buf });
  const pdf = await loadingTask.promise;

  const total = pdf.numPages || 1;
  let out = "";

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items || [])
      .map((it) => (typeof it.str === "string" ? it.str : ""))
      .join(" ");
    out += pageText + "\n\n";
    onProgress?.(Math.round((i / total) * 100));
  }

  return { text: out.trim(), pages: total };
}

function buildActionPrompt(actionId, extractedText, focusTopic) {
  const clipped = (extractedText || "").slice(0, 12000);
  const prefix = `Use ONLY the provided PDF text. If the text is incomplete, say so briefly.\n\nPDF TEXT:\n${clipped}${
    focusTopic ? `\n\nFOCUS TOPIC:\n${focusTopic}` : ""
  }`;

  if (actionId === "summarize") return { systemPrompt: PROMPTS.summary, user: prefix };
  if (actionId === "notes") return { systemPrompt: PROMPTS.notes, user: prefix };
  if (actionId === "flashcards") return { systemPrompt: PROMPTS.flashcards, user: prefix };
  if (actionId === "quiz") return { systemPrompt: PROMPTS.quiz, user: prefix };
  return { systemPrompt: PROMPTS.chat, user: prefix };
}

function extractJsonArray(text) {
  const s = (text || "").trim();
  if (!s) return null;

  // Remove ``` fences if the model added them
  const noFences = s
    .replace(/```[a-zA-Z]*\n?/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const direct = JSON.parse(noFences);
    if (Array.isArray(direct)) return direct;
  } catch {}

  // Try to isolate the first JSON array in the string
  const m = noFences.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[0]);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

export default function PDFPanel({ color = "#6366f1" }) {
  const { apiKey } = useAuth();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeAction, setActiveAction] = useState(null);
  const [result, setResult] = useState("");
  const [resultIsMarkdown, setResultIsMarkdown] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [extracted, setExtracted] = useState({ text: "", pages: 0, words: 0 });
  const [flashcardsCards, setFlashcardsCards] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("pdf-panel-css")) {
      const s = document.createElement("style");
      s.id = "pdf-panel-css";
      s.textContent = css;
      document.head.appendChild(s);
    }
  }, []);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setProcessing(true);
    setProgress(0);
    setActiveAction(null);
    setResult("");
    setFlashcardsCards([]);
    setQuizQuestions([]);
    setResultIsMarkdown(false);
    setExtracted({ text: "", pages: 0, words: 0 });

    try {
      const { text, pages } = await extractPdfText(f, (p) => setProgress(p));
      const words = countWords(text);
      setExtracted({ text, pages, words });
    } catch (e) {
      setResult(`Failed to read PDF: ${e?.message || "unknown error"}`);
    }
    setProgress(100);
    setTimeout(() => setProcessing(false), 250);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleAction = async (id) => {
    setLoadingAction(id);
    setActiveAction(id);
    setResult("");
    setFlashcardsCards([]);
    setQuizQuestions([]);
    setResultIsMarkdown(id === "summarize" || id === "notes");

    try {
      if (!apiKey?.trim()) {
        setResult("Set your Groq API key first (top bar → Set API Key), then try again.");
        return;
      }
      if (!extracted.text?.trim()) {
        setResult("No text extracted from this PDF. Try a text-based PDF (not scanned images), or try another file.");
        return;
      }

      const { systemPrompt, user } = buildActionPrompt(id, extracted.text);
      const out = await callAI(apiKey, [{ role: "user", content: user }], systemPrompt);

      if (id === "flashcards") {
        const arr = extractJsonArray(out);
        if (!arr) {
          setResult(out);
          return;
        }
        const cards = arr
          .map((x) => ({
            front: x?.front ?? x?.question ?? x?.q ?? "",
            back: x?.back ?? x?.answer ?? x?.a ?? "",
          }))
          .filter((c) => c.front && c.back);
        setFlashcardsCards(cards);
        if (!cards.length) setResult(out);
        return;
      }

      if (id === "quiz") {
        const arr = extractJsonArray(out);
        if (!arr) {
          setResult(out);
          return;
        }
        const qs = arr
          .map((x) => ({
            q: x?.q ?? x?.question ?? x?.prompt ?? "",
            options: x?.options ?? x?.choices ?? [],
            answer: x?.answer ?? x?.correct ?? "",
            explanation: x?.explanation ?? x?.why ?? "",
          }))
          .filter((q) => q.q && Array.isArray(q.options) && q.options.length && q.answer);
        setQuizQuestions(qs);
        if (!qs.length) setResult(out);
        return;
      }

      setResult(out);
    } catch (e) {
      setResult(`Error: ${e?.message || "request failed"}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const generateFlashcardsForTopic = async (topic) => {
    const t = (topic || "").trim();
    setLoadingAction("flashcards");
    setActiveAction("flashcards");
    setResult("");

    try {
      if (!apiKey?.trim()) throw new Error("Missing Groq API key.");
      if (!extracted.text?.trim()) throw new Error("No extracted PDF text.");

      const { systemPrompt, user } = buildActionPrompt("flashcards", extracted.text, t);
      const out = await callAI(apiKey, [{ role: "user", content: user }], systemPrompt);
      const arr = extractJsonArray(out);
      const cards = (arr || []).map((x) => ({
        front: x?.front ?? x?.question ?? x?.q ?? "",
        back: x?.back ?? x?.answer ?? x?.a ?? "",
      })).filter((c) => c.front && c.back);
      setFlashcardsCards(cards);
      if (!cards.length) setResult(out);
    } catch (e) {
      setResult(`Error: ${e?.message || "request failed"}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const fileName = file?.name || "PDF.pdf";
  const fileSize = file ? (file.size / 1024 / 1024).toFixed(1) + " MB" : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Drop Zone ── */}
      {!file && !processing && (
        <div
          className={`pdf-drop-zone${dragging ? " drag-over" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {/* bg gradient blob */}
          <div style={{
            position: "absolute", inset: 0, opacity: dragging ? 0.12 : 0.05,
            background: `radial-gradient(ellipse at 50% 50%, ${color}, transparent 70%)`,
            transition: "opacity 0.3s",
          }} />

          <input
            ref={inputRef} type="file" accept=".pdf"
            style={{ display: "none" }}
            onChange={e => handleFile(e.target.files?.[0])}
          />

          {/* animated upload icon */}
          <div className="upload-icon" style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${color}25, ${color}10)`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            📄
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
            Drop your PDF here
          </div>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>
            or click to browse files
          </div>

          {/* format badges */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {["Textbooks", "Notes", "Research Papers", "Slides"].map(t => (
              <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Processing Bar ── */}
      {processing && (
        <div className="card-animate" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
            <div>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{fileName}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>Extracting & analyzing…</div>
            </div>
            <div style={{ marginLeft: "auto", width: 18, height: 18, border: `2px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
          {/* progress bar */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, height: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 8, width: `${progress}%`, transition: "width 0.15s ease",
              background: `linear-gradient(90deg, ${color}, #8b5cf6)`,
              boxShadow: `0 0 8px ${color}80`,
            }} />
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 6, textAlign: "right" }}>{Math.round(progress)}%</div>
        </div>
      )}

      {/* ── File Card ── */}
      {file && !processing && (
        <div className="card-animate" style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📘</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>
                {fileSize}{fileSize ? " · " : ""}
                {extracted.pages ? `${extracted.pages} pages` : "pages…"}
                {" · "}
                {extracted.words ? `${extracted.words.toLocaleString()} words extracted` : "extracting…"}
              </div>
              {/* mini page distribution chart */}
              <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14, marginTop: 6 }}>
                {[6, 9, 12, 8, 14, 10, 7, 11, 9, 13].map((h, i) => (
                  <div key={i} className="page-bar" style={{
                    width: 4, borderRadius: 2, height: h,
                    background: `${color}${50 + i * 5 > 99 ? 99 : 50 + i * 5}`,
                    animationDelay: `${i * 0.04}s`,
                  }} />
                ))}
                <span style={{ fontSize: 9, color: "#334155", marginLeft: 4, marginBottom: 1 }}>content density</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", animation: "pulse-dot 2s infinite" }} />
              <button onClick={() => { setFile(null); setResult(""); setActiveAction(null); }}
                style={{ fontSize: 9, padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#475569", cursor: "pointer" }}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      {file && !processing && (
        <div className="card-animate" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {ACTIONS.map(({ id, label, icon, desc }) => (
            <button
              key={id}
              className={`action-btn${activeAction === id ? " active" : ""}`}
              onClick={() => handleAction(id)}
              style={{
                background: activeAction === id ? `linear-gradient(135deg, ${color}30, ${color}18)` : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeAction === id ? color + "50" : "rgba(255,255,255,0.08)"}`,
                color: activeAction === id ? color : "#94a3b8",
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
                padding: "10px 12px", textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
                {loadingAction === id && (
                  <div style={{ marginLeft: "auto", width: 12, height: 12, border: `2px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                )}
              </div>
              <span style={{ fontSize: 9, color: "#334155", fontWeight: 400 }}>{desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Result ── */}
      {(activeAction === "flashcards" && flashcardsCards.length > 0) || (activeAction === "quiz" && quizQuestions.length > 0) ? (
        <div className="result-section" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 0, border: "1px solid rgba(255,255,255,0.07)" }}>
          {activeAction === "flashcards" && (
            <Flashcards
              cards={flashcardsCards}
              onNewTopic={(t) => generateFlashcardsForTopic(t)}
              busy={loadingAction === "flashcards"}
            />
          )}
          {activeAction === "quiz" && (
            <Quiz
              questions={quizQuestions}
              onRetry={() => handleAction("quiz")}
            />
          )}
        </div>
      ) : result ? (
        <div className="result-section" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: 1 }}>
              {ACTIONS.find(a => a.id === activeAction)?.icon} {ACTIONS.find(a => a.id === activeAction)?.label.toUpperCase()}
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(result)}
              style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: `${color}15`, border: `1px solid ${color}25`, color, cursor: "pointer", fontWeight: 600 }}
            >
              Copy
            </button>
          </div>
          {resultIsMarkdown ? (
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.8 }}>
              <Markdown text={result} />
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result}</div>
          )}
        </div>
      ) : null}

      {/* ── Empty prompt if no file ── */}
      {!file && !processing && (
        <div style={{ textAlign: "center", fontSize: 11, color: "#1e293b", padding: "4px 0" }}>
          Supports up to 50MB · Encrypted in transit
        </div>
      )}
    </div>
  );
}