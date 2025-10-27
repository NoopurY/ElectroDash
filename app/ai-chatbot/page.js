"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Search,
  User,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Zap,
  MessageSquare,
  ArrowLeft,
  Mic,
  MicOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AIChatbotPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 **Hi there! I'm ElectroDash AI Assistant!** 🤖\n\nI'm here to help you with:\n- 🔌 Component recommendations\n- 📊 Technical specifications\n- 🔧 Circuit design tips\n- 💡 Project ideas\n- 🛠️ Troubleshooting help\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  // Quick suggestions
  const suggestions = [
    "What's the difference between Arduino and Raspberry Pi?",
    "Best sensors for home automation",
    "How to choose the right resistor?",
    "Explain PWM in simple terms",
  ];

  // Scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProfileClick = () => {
    router.push("/user/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    // Add user message to chat
    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");

    try {
      const res = await fetch("/api/ai-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.result, timestamp: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Oops! I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    }
    setLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: "ai",
        text: "👋 **Chat cleared!** How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  const toggleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser. Please try Chrome.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      // Stop recognition logic would go here
    } else {
      setIsListening(true);
      // Start recognition logic would go here
      alert("Voice input feature coming soon!");
      setIsListening(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ---------- HEADER ---------- */}
      <header className="bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/user")}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <Image
                  src="/ElectroDash.png"
                  alt="ElectroDash"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles size={20} />
                    AI Assistant
                  </h1>
                  <p className="text-white/80 text-sm">
                    Powered by ElectroDash
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearChat}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                title="Clear chat"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline text-sm">Clear</span>
              </button>
              <button
                onClick={() => router.push("/user/dashboard")}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
              >
                <User size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- MAIN CHAT AREA ---------- */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-4 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "ai" ? "justify-start" : "justify-end"
                } animate-fade-in`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 shadow-md max-w-[85%] lg:max-w-[70%] relative group ${
                    msg.sender === "ai"
                      ? "bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-800 border-2 border-blue-100"
                      : "bg-gradient-to-br from-[#5A8DEE] to-[#40E0D0] text-white"
                  }`}
                >
                  {/* AI Icon */}
                  {msg.sender === "ai" && (
                    <div className="absolute -left-3 top-0 w-8 h-8 bg-gradient-to-br from-[#5A8DEE] to-[#40E0D0] rounded-full flex items-center justify-center text-white shadow-lg">
                      <Sparkles size={16} />
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc pl-5 mb-2 space-y-1"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="mb-1" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className={
                              msg.sender === "ai"
                                ? "text-[#5A8DEE]"
                                : "text-white font-bold"
                            }
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-lg font-bold mt-3 mb-2"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-base font-semibold mt-2 mb-1"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 leading-relaxed" {...props} />
                        ),
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code
                              className="bg-gray-200 px-1.5 py-0.5 rounded text-sm"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-gray-800 text-white p-3 rounded-lg text-sm overflow-x-auto"
                              {...props}
                            />
                          ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* Timestamp & Copy Button */}
                  <div
                    className={`flex items-center justify-between mt-2 pt-2 border-t ${
                      msg.sender === "ai"
                        ? "border-blue-200"
                        : "border-white/30"
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        msg.sender === "ai" ? "text-gray-500" : "text-white/70"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.sender === "ai" && (
                      <button
                        onClick={() => handleCopy(msg.text, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded"
                        title="Copy message"
                      >
                        {copiedIndex === idx ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="rounded-2xl px-4 py-3 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-[#5A8DEE] rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#5A8DEE] rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#5A8DEE] rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              💡 Quick suggestions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left px-4 py-3 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-[#5A8DEE] rounded-xl transition text-sm shadow-sm group"
                >
                  <Zap
                    size={14}
                    className="inline mr-2 text-[#40E0D0] group-hover:text-[#5A8DEE]"
                  />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about electronics..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#5A8DEE] focus:outline-none transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition ${
                  isListening
                    ? "text-red-500 bg-red-50"
                    : "text-gray-400 hover:text-[#5A8DEE] hover:bg-blue-50"
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>

          {/* Message Count */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MessageSquare size={14} />
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
            <span>Powered by AI ✨</span>
          </div>
        </div>
      </main>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
