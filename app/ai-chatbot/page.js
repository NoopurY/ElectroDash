"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Search, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AIChatbotPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi, I'm your Component Buddy! 🤖 Need help with hardware components, sensors, boards, or anything electronics? Just ask me below!",
    },
  ]);
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/user/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    // Add user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    try {
      const res = await fetch("/api/ai-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setResult(data.result);
      setMessages((prev) => [...prev, { sender: "ai", text: data.result }]);
    } catch (err) {
      setResult("Error fetching response");
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error fetching response" },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center font-sans pb-10">
      {/* ---------- HEADER (User Navbar) ---------- */}
      <header className="w-full bg-[#5A8DEE] text-white px-5 py-4 rounded-b-3xl shadow-md flex flex-col items-center">
        <div className="flex justify-between items-center w-full max-w-xl mx-auto">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <img src="/ElectroDash.png" alt="ElectroDash" className="w-6 h-6" />
              ElectroDash
            </h1>
            <p className="text-sm opacity-90">AI Chatbot</p>
            <p className="text-xs opacity-80">Ask about hardware components</p>
          </div>
          <div
            className="bg-white/20 p-2 rounded-full cursor-pointer"
            onClick={handleProfileClick}
          >
            <User size={22} />
          </div>
        </div>
        {/* ---------- SEARCH BAR ---------- */}
        <div className="mt-4 w-full max-w-xl mx-auto">
          <div className="flex items-center bg-white text-gray-700 rounded-xl px-4 py-2 shadow-md">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder='Search "resistor"'
              className="w-full ml-3 outline-none text-sm bg-transparent"
              disabled
            />
          </div>
        </div>
      </header>

      {/* ---------- Chatbot Card ---------- */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8 relative mt-8 flex flex-col items-center">
        {/* Fun hardware icons header */}
        <div className="flex justify-center gap-4 mb-4 animate-bounce-slow">
          <span title="Microcontroller" className="text-3xl">
            🔌
          </span>
          <span title="Sensor" className="text-3xl">
            🧭
          </span>
          <span title="LED" className="text-3xl">
            💡
          </span>
          <span title="Motor" className="text-3xl">
            ⚙️
          </span>
          <span title="Battery" className="text-3xl">
            🔋
          </span>
        </div>
        {/* Scrollable chat area with messages */}
        <div className="mt-4 w-full max-h-96 overflow-y-auto bg-[#EAF2FF] p-4 rounded text-sm flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "ai" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 shadow-md max-w-[80%] ${
                  msg.sender === "ai"
                    ? "bg-[#D9F3F0] text-[#212121] border border-[#40E0D0]"
                    : "bg-[#5A8DEE] text-white border border-[#DADADA]"
                } animate-fade-in`}
              >
                <ReactMarkdown
                  components={{
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 mb-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="text-[#5A8DEE]" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-lg font-bold mt-4 mb-2 text-[#5A8DEE]"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-base font-semibold mt-2 mb-1 text-[#40E0D0]"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-2" {...props} />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about hardware components..."
            className="flex-1 px-4 py-2 rounded border shadow focus:ring-2"
            style={{ borderColor: "#DADADA", color: "#212121" }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded font-medium text-white shadow-md hover:scale-105"
            style={{ backgroundColor: "#40E0D0" }}
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </form>
        {/* Decorative hardware footer icons */}
        <div className="absolute left-2 bottom-2 flex gap-2 opacity-30">
          <span className="text-2xl">🔧</span>
          <span className="text-2xl">🔩</span>
          <span className="text-2xl">🛠️</span>
        </div>
      </div>
      {/* Add some fun background animation */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.5s; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }
      `}</style>
    </div>
  );
}
