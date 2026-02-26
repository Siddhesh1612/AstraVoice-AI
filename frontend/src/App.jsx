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
    recognition.lang = "en-IN"; // can change dynamically later
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript); // THIS writes what you speak
    };

    recognition.start();
  };

  // 🔊 Speak AI Response
  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = synth.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes("hi"));
    const englishVoice = voices.find(v => v.lang.includes("en"));

    const hindiRegex = /[\u0900-\u097F]/;

    if (hindiRegex.test(text) && hindiVoice) {
      utterance.voice = hindiVoice;
    } else if (englishVoice) {
      utterance.voice = englishVoice;
    }

    synth.cancel();
    synth.speak(utterance);
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