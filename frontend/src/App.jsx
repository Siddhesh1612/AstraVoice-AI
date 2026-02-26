import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [sentiment, setSentiment] = useState("-");
  const [escalation, setEscalation] = useState("-");
  const [fraud, setFraud] = useState("-");
  const [language, setLanguage] = useState("-");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/history");
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported");
      return;
    }

    window.speechSynthesis.cancel();

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      sendMessageWithText(transcript);
    };

    recognition.start();
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();

    const indianEnglish = voices.find(v => v.lang === "en-IN");
    const hindiVoice = voices.find(v => v.lang === "hi-IN");

    const isHindi = /[\u0900-\u097F]/.test(text);

    if (isHindi && hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = "hi-IN";
    } else if (indianEnglish) {
      utterance.voice = indianEnglish;
      utterance.lang = "en-IN";
    }

    synth.cancel();
    synth.speak(utterance);
  };

  const sendMessageWithText = async (text) => {
    if (!text.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          failed_attempts: 0
        })
      });

      const data = await res.json();

      setResponse(data.response);
      setSentiment(data.sentiment || "-");
      setEscalation(data.escalation_score || "-");
      setFraud(data.fraud_score || "-");
      setLanguage(data.language || "-");

      speak(data.response);
      fetchHistory();

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const sendMessage = () => {
    sendMessageWithText(message);
  };

  const deleteChat = async (id) => {
    await fetch(`http://127.0.0.1:8000/history/${id}`, {
      method: "DELETE"
    });
    fetchHistory();
  };

  const clearAllChats = async () => {
    await fetch("http://127.0.0.1:8000/history", {
      method: "DELETE"
    });
    fetchHistory();
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <div style={{
        width: "280px",
        background: "#111827",
        color: "white",
        padding: "20px",
        overflowY: "auto"
      }}>
        <h2>AstraVoice</h2>
        <hr />

        <h4>📊 Sentiment</h4>
        <p>{sentiment}</p>

        <h4>⚠ Escalation</h4>
        <p>{escalation}</p>

        <h4>🔐 Fraud</h4>
        <p>{fraud}</p>

        <h4>🌐 Language</h4>
        <p>{language}</p>

        <hr />
        <button
          style={{
            background: "#dc2626",
            color: "white",
            padding: "6px",
            border: "none",
            borderRadius: "4px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
          onClick={clearAllChats}
        >
          Clear All Chats
        </button>

        <h4>🕘 Recent Chats</h4>

        {history.map(item => (
          <div
            key={item.id}
            style={{
              background: "#1f2937",
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <small
              style={{ cursor: "pointer", flex: 1 }}
              onClick={() => {
                setMessage(item.message);
                setResponse(item.response);
              }}
            >
              {item.message.substring(0, 30)}...
            </small>

            <button
              style={{
                marginLeft: "8px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
              onClick={() => deleteChat(item.id)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "40px" }}>
        <h1>🎙 AstraVoice AI Assistant</h1>

        <textarea
          placeholder="Speak or type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "100%", height: "120px" }}
        />

        <div style={{ marginTop: "20px" }}>
          <button onClick={startListening}>🎤 Speak</button>

          <button
            onClick={sendMessage}
            disabled={loading}
            style={{ marginLeft: "10px" }}
          >
            {loading ? "Thinking..." : "Send"}
          </button>

          <button
            onClick={() => response && speak(response)}
            disabled={!response}
            style={{ marginLeft: "10px" }}
          >
            🔊 Replay
          </button>
        </div>

        {response && (
          <div style={{ marginTop: "30px" }}>
            <strong>AI Response:</strong>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;