"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Trash2, Copy, Check, Sparkles, Zap } from "lucide-react";
import { AppHeader, Spinner } from "@/components/ui";
import { useRouter } from "next/navigation";

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
  const inputRef = useRef(null);
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
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
    inputRef.current?.focus();
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

  const md = (isAi) => ({
    ul: ({ node, ...props }) => <ul className="mb-2 list-disc space-y-1 pl-5" {...props} />,
    ol: ({ node, ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...props} />,
    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
    strong: ({ node, ...props }) => (
      <strong className={isAi ? "font-semibold text-ink" : "font-semibold text-white"} {...props} />
    ),
    h1: ({ node, ...props }) => <h2 className="mb-2 mt-3 text-base font-bold first:mt-0" {...props} />,
    h2: ({ node, ...props }) => <h2 className="mb-2 mt-3 text-base font-bold first:mt-0" {...props} />,
    h3: ({ node, ...props }) => <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0" {...props} />,
    p: ({ node, ...props }) => <p className="mb-2 leading-relaxed last:mb-0" {...props} />,
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px]" {...props} />
      ) : (
        <code className="my-2 block overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-[13px] text-slate-100" {...props} />
      ),
  });

  const fresh = messages.length === 1;

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <AppHeader role="user" />

      <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col px-4 sm:px-6">
        {/* Title row */}
        <div className="flex items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-card">
              <Sparkles size={20} />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-ink">AI parts assistant</h1>
              <p className="text-xs text-muted">Specs, alternatives, circuits and project ideas</p>
            </div>
          </div>
          {!fresh && (
            <button onClick={handleClearChat} className="btn btn-ghost btn-sm" title="Start a new chat">
              <Trash2 size={15} /> <span className="hidden sm:inline">New chat</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="scrollbar-none -mx-4 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-5">
            {messages.map((msg, idx) => {
              const isAi = msg.sender === "ai";
              return (
                <div key={idx} className={`group flex animate-fade-up gap-3 ${isAi ? "" : "flex-row-reverse"}`}>
                  {isAi && (
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                      <Sparkles size={15} />
                    </span>
                  )}
                  <div className={`min-w-0 max-w-[85%] ${isAi ? "" : "items-end"} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-[15px] ${
                        isAi
                          ? "rounded-tl-md border border-line bg-white text-ink-soft shadow-card"
                          : "rounded-tr-md bg-brand-600 text-white"
                      }`}
                    >
                      <ReactMarkdown components={md(isAi)}>{msg.text}</ReactMarkdown>
                    </div>
                    <div className={`mt-1 flex items-center gap-2 px-1 text-[11px] text-muted ${isAi ? "" : "justify-end"}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isAi && idx > 0 && (
                        <button
                          onClick={() => handleCopy(msg.text, idx)}
                          className="inline-flex items-center gap-1 rounded px-1 opacity-0 transition hover:text-ink group-hover:opacity-100 focus:opacity-100"
                          aria-label="Copy answer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={12} className="text-green-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex animate-fade-up gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                  <Sparkles size={15} />
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5 shadow-card">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-2 w-2 animate-bounce rounded-full bg-brand-400"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                  <span className="ml-1.5 text-sm text-muted">Thinking…</span>
                </div>
              </div>
            )}

            {fresh && (
              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="card card-hover flex items-start gap-2.5 p-3.5 text-left text-sm text-ink-soft"
                  >
                    <Zap size={16} className="mt-0.5 shrink-0 text-accent-600" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="pb-4 pt-1 sm:pb-6">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-lift focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any component or circuit…"
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-slate-400"
              disabled={loading}
              aria-label="Your question"
              maxLength={2000}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary btn-icon shrink-0" aria-label="Send">
              {loading ? <Spinner size={16} /> : <Send size={17} />}
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted">AI answers can be wrong. Double-check ratings before you build.</p>
        </div>
      </div>
    </div>
  );
}
