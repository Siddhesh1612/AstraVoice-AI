import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎤 Speech Recognition (Mic Input)
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN"; 
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.start();
  };

  // 🔊 Speak AI Response (STRICT Indian Accent Control)
  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(text);

    const loadVoicesAndSpeak = () => {
      const voices = synth.getVoices();

      if (!voices || voices.length === 0) {
        console.warn("No voices available.");
        return;
      }

      // STRICTLY pick Indian voices only
      const indianEnglishVoice = voices.find(
        (v) => v.lang === "en-IN"
      );

      const hindiVoice = voices.find(
        (v) => v.lang === "hi-IN"
      );

      const isHindi = /[\u0900-\u097F]/.test(text);

      if (isHindi && hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = "hi-IN";
        console.log("Using Hindi voice:", hindiVoice.name);
      } else if (indianEnglishVoice) {
        utterance.voice = indianEnglishVoice;
        utterance.lang = "en-IN";
        console.log("Using Indian English voice:", indianEnglishVoice.name);
      } else {
        console.warn("Indian voice not found. Using default.");
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      synth.cancel();
      synth.speak(utterance);
    };

    // Handle async voice loading properly
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = loadVoicesAndSpeak;
    } else {
      loadVoicesAndSpeak();
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          failed_attempts: 0
        })
      });

      const data = await res.json();

      setResponse(data.response);
      speak(data.response);

    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🎙 AstraVoice AI Assistant</h1>

      <textarea
        placeholder="Speak or type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="button-group">
        <button onClick={startListening}>🎤 Speak</button>

        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>

        <button
          onClick={() => response && speak(response)}
          disabled={!response}
        >
          🔊 Replay
        </button>
      </div>

      {response && (
        <div className="response-box">
          <strong>AI Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;