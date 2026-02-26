import { useState, useRef, useEffect } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

// ── Universe particle canvas ────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    // Star/nebula color palette
    const COLORS = [
      [200, 220, 255],  // white-blue star
      [180, 140, 255],  // violet nebula
      [100, 200, 255],  // cyan star
      [255, 180, 100],  // warm orange giant
      [140, 255, 200],  // teal nebula
      [255, 255, 255],  // pure white
    ];

    const N = 260;
    const pts = Array.from({ length: N }, () => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        r: Math.random() * 1.8 + 0.3,
        cr: c[0], cg: c[1], cb: c[2],
        phase: Math.random() * Math.PI * 2,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const t = Date.now() * 0.001;

      for (const p of pts) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 220 && d > 0) {
          p.vx += (dx / d) * 0.07;
          p.vy += (dy / d) * 0.07;
        }

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 4.0) { p.vx = (p.vx / spd) * 4.0; p.vy = (p.vy / spd) * 4.0; }

        p.vx *= 0.972;
        p.vy *= 0.972;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // twinkle
        const alpha = 0.55 + 0.45 * Math.sin(t * 1.8 + p.phase);

        ctx.save();
        ctx.globalAlpha = alpha;

        // glow halo for bigger stars
        if (p.r > 1.2) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
          g.addColorStop(0, `rgba(${p.cr},${p.cg},${p.cb},0.25)`);
          g.addColorStop(1, `rgba(${p.cr},${p.cg},${p.cb},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},1)`;
        ctx.fill();
        ctx.restore();
      }

      // Constellation lines between nearby stars
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 95) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(160,190,255,${0.11 * (1 - d / 95)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-canvas" />;
}

// ── Score badge ─────────────────────────────────────────────────────────────
function ScoreBadge({ value }) {
  if (value === undefined || value === null || value === "-")
    return <span className="meta-dash">—</span>;
  const pct = Math.min(Math.round(value), 100);
  const color = pct > 66 ? "#f87171" : pct > 33 ? "#fbbf24" : "#4ade80";
  return (
    <span className="score-badge">
      <span className="score-track">
        <span className="score-fill" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="score-num" style={{ color }}>{pct}</span>
    </span>
  );
}

// ── Sentiment pill ──────────────────────────────────────────────────────────
function SentimentPill({ label }) {
  if (!label || label === "-") return <span className="meta-dash">—</span>;
  const styles = {
    angry:    { color: "#f87171", bg: "rgba(248,113,113,0.13)", border: "rgba(248,113,113,0.3)" },
    positive: { color: "#4ade80", bg: "rgba(74,222,128,0.13)",  border: "rgba(74,222,128,0.3)" },
    neutral:  { color: "#94a3b8", bg: "rgba(148,163,184,0.13)", border: "rgba(148,163,184,0.25)" },
  };
  const s = styles[label] || styles.neutral;
  return (
    <span className="sentiment-pill" style={{ color: s.color, background: s.bg, borderColor: s.border }}>
      {label}
    </span>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [listening, setListening] = useState(false);
  const [history, setHistory]     = useState([]);
  const [meta, setMeta] = useState({
    sentiment: "-", escalation_score: "-", fraud_score: "-", language: "-",
  });

  const bottomRef      = useRef(null);
  const recognitionRef = useRef(null);
  const lastReplyRef   = useRef("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    fetch(`${API}/history`)
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => {});
  }, []);

  const refreshHistory = () =>
    fetch(`${API}/history`)
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => {});

  // ── POST /chat ─────────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), failed_attempts: 0 }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
      lastReplyRef.current = data.response;
      setMeta({
        sentiment:        data.sentiment        ?? "-",
        escalation_score: data.escalation_score ?? "-",
        fraud_score:      data.fraud_score      ?? "-",
        language:         data.language         ?? "-",
      });
      refreshHistory();

      // TTS
      const utt = new SpeechSynthesisUtterance(data.response);
      utt.lang = data.language || "en-IN";
      utt.rate = 0.95;
      const voices = speechSynthesis.getVoices();
      const match = voices.find(v => v.lang === (data.language || "en-IN"))
                 || voices.find(v => v.lang.startsWith("en"));
      if (match) utt.voice = match;
      speechSynthesis.speak(utt);

    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Could not reach the backend." }]);
    } finally {
      setLoading(false);
    }
  };

  const replay = () => {
    if (!lastReplyRef.current) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(lastReplyRef.current);
    utt.lang = meta.language || "en-IN";
    utt.rate = 0.95;
    speechSynthesis.speak(utt);
  };

  const toggleListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = e => sendMessage(e.results[0][0].transcript);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const clearChats = async () => {
    await fetch(`${API}/history`, { method: "DELETE" });
    setMessages([]);
    setHistory([]);
    setMeta({ sentiment: "-", escalation_score: "-", fraud_score: "-", language: "-" });
    lastReplyRef.current = "";
  };

  // ── Delete single chat ────────────────────────────────────────────────────
  const deleteChat = async (e, id) => {
    e.stopPropagation();
    await fetch(`${API}/history/${id}`, { method: "DELETE" });
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  // ── Load history item ─────────────────────────────────────────────────────
  const loadHistory = (item) => {
    setMessages([
      { role: "user",      text: item.message  },
      { role: "assistant", text: item.response },
    ]);
    lastReplyRef.current = item.response;
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="root">
      <ParticleCanvas />

      {/* ── Left panel: AI stats ── */}
      <aside className="left-panel">
        <div className="panel-title">Analysis</div>

        <div className="stat-block">
          <span className="stat-label">📊 Sentiment</span>
          <SentimentPill label={meta.sentiment} />
        </div>

        <div className="stat-block">
          <span className="stat-label">⚠️ Escalation</span>
          <ScoreBadge value={meta.escalation_score} />
        </div>

        <div className="stat-block">
          <span className="stat-label">🔒 Fraud</span>
          <ScoreBadge value={meta.fraud_score} />
        </div>

        <div className="stat-block">
          <span className="stat-label">🌐 Language</span>
          <span className="lang-val">{meta.language !== "-" ? meta.language : "—"}</span>
        </div>
      </aside>

      {/* ── Centre: chat window ── */}
      <div className="chat-shell">
        <div className="chat-header">
          <span className="chat-title">🎙️ AstraVoice AI Assistant</span>
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <p className="empty-hint">Speak or type your message…</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <span className="bubble">{m.text}</span>
            </div>
          ))}
          {loading && (
            <div className="msg assistant">
              <span className="bubble thinking">
                <span /><span /><span />
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <textarea
            className="main-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Speak or type your message..."
            rows={3}
            disabled={loading || listening}
          />
          <div className="btn-row">
            <button
              className={`action-btn speak-btn${listening ? " active" : ""}`}
              onClick={toggleListen}
            >
              🎤 {listening ? "Stop" : "Speak"}
            </button>
            <button
              className="action-btn send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              Send
            </button>
            <button
              className="action-btn replay-btn"
              onClick={replay}
              disabled={!lastReplyRef.current}
            >
              🔊 Replay
            </button>
          </div>
        </div>
      </div>

      {/* ── Right panel: history ── */}
      <aside className="right-panel">
        <div className="panel-title">History</div>

        <button className="clear-btn" onClick={clearChats}>
          🗑 Clear All
        </button>

        <div className="history-list">
          {history.length === 0 && (
            <p className="history-empty">No chats yet</p>
          )}
          {history.map(h => (
            <div key={h.id} className="history-row">
              <button className="history-item" onClick={() => loadHistory(h)}>
                {h.message.length > 26 ? h.message.slice(0, 26) + "…" : h.message}
              </button>
              <button
                className="history-del"
                onClick={e => deleteChat(e, h.id)}
                title="Delete this chat"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}