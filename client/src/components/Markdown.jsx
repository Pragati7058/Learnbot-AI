import { useState } from "react";

function InlineFormat({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} style={{
              background: "var(--card-bg-deep)",
              border: "1px solid var(--card-border)",
              padding: "1px 6px",
              borderRadius: 5,
              fontSize: "0.88em",
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--text-primary)",
            }}>{p.slice(1, -1)}</code>
          );
        return p;
      })}
    </>
  );
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{
      background: "rgba(0,0,0,.55)",
      border: "1px solid rgba(99,102,241,.2)",
      borderRadius: 12,
      overflow: "hidden",
      margin: "12px 0",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "7px 14px",
        background: "rgba(99,102,241,.1)",
        borderBottom: "1px solid rgba(99,102,241,.15)",
      }}>
        <span style={{ fontSize: 11, color: "#818cf8", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
          {lang || "code"}
        </span>
        <button
          onClick={copy}
          style={{
            fontSize: 11,
            color: copied ? "#34d399" : "#64748b",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono',monospace",
            transition: "color .2s",
          }}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{
        padding: "14px 16px",
        overflowX: "auto",
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 13,
        lineHeight: 1.75,
        color: "#a5f3fc",
        margin: 0,
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Markdown({ text }) {
  const lines  = (text || "").split("\n");
  const output = [];
  let inCode = false, codeLang = "", codeLines = [];
  let inList = false, listItems = [], listKey = 0;

  const flushList = (key) => {
    if (!listItems.length) return null;
    const items = [...listItems];
    listItems = [];
    inList = false;
    return (
      <ul key={`list-${key}`} style={{ paddingLeft: 20, margin: "8px 0" }}>
        {items.map((item, i) => (
          <li key={i} style={{ color: "var(--text-secondary)", margin: "4px 0", lineHeight: 1.75 }}>
            <InlineFormat text={item} />
          </li>
        ))}
      </ul>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    // Code fence
    if (ln.startsWith("```")) {
      if (!inCode) {
        if (inList) { output.push(flushList(listKey++)); }
        inCode = true; codeLang = ln.slice(3).trim(); codeLines = [];
      } else {
        output.push(<CodeBlock key={i} lang={codeLang} code={codeLines.join("\n")} />);
        inCode = false; codeLines = [];
      }
      continue;
    }
    if (inCode) { codeLines.push(ln); continue; }

    // List items
    if (/^[-*] /.test(ln) || /^\d+\. /.test(ln)) {
      inList = true;
      listItems.push(ln.replace(/^[-*] /, "").replace(/^\d+\. /, ""));
      continue;
    }

    // Flush pending list before non-list content
    if (inList) { output.push(flushList(listKey++)); }

    // Headings
    if (ln.startsWith("# ")) {
      output.push(
        <h1 key={i} style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)", margin: "16px 0 8px", paddingBottom: 8, borderBottom: "1px solid var(--card-border)", lineHeight: 1.4 }}>
          {ln.slice(2)}
        </h1>
      );
    } else if (ln.startsWith("## ")) {
      output.push(
        <h2 key={i} style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)", margin: "14px 0 6px", lineHeight: 1.4 }}>
          {ln.slice(3)}
        </h2>
      );
    } else if (ln.startsWith("### ")) {
      output.push(
        <h3 key={i} style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "11px 0 5px", lineHeight: 1.4 }}>
          {ln.slice(4)}
        </h3>
      );
    } else if (!ln.trim()) {
      output.push(<div key={i} style={{ height: 6 }} />);
    } else {
      output.push(
        <p key={i} style={{
          margin: "5px 0",
          color: "var(--text-primary)",
          lineHeight: 1.85,
          fontSize: 14,
          textAlign: "justify",
          hyphens: "auto",
        }}>
          <InlineFormat text={ln} />
        </p>
      );
    }
  }

  // Flush any trailing list
  if (inList) output.push(flushList(listKey++));

  return <div style={{ fontFamily: "'Inter',sans-serif" }}>{output}</div>;
}
