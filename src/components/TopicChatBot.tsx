"use client";

import { useState, useRef, useEffect, useCallback, useMemo, FormEvent } from "react";
import { marked } from "marked";

interface TopicContent {
  title: string;
  explanation: string;
  codeExample: string;
  exercise: string;
  commonMistakes: string[];
  interviewQuestions: { q: string; a: string; type?: string }[];
}

interface TopicChatBotProps {
  topicContent: TopicContent;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function renderMarkdown(text: string): string {
  if (!text) return "";
  return marked.parse(text, { async: false }) as string;
}

export default function TopicChatBot({ topicContent }: TopicChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen, isOpen]);

  const buildSystemMessage = useCallback(() => {
    const mistakes = topicContent.commonMistakes?.join("\n- ") || "";
    const questions =
      topicContent.interviewQuestions
        ?.map((q) => `Q: ${q.q}\nA: ${q.a}`)
        .join("\n\n") || "";

    return `You are an expert interview preparation assistant.
The user is currently studying the following topic:

Title: ${topicContent.title}
Explanation: ${topicContent.explanation}
Code Examples: ${topicContent.codeExample}
Exercise: ${topicContent.exercise}
Common Mistakes:
- ${mistakes}
Interview Questions:
${questions}

Answer all questions in the context of this topic only. Be EXTREMELY concise. Keep your responses short, practical, and to the point. 
- Use brief bullet points instead of long paragraphs.
- Provide only the bare minimum code needed to explain the concept.
- Do not over-explain or write essays. Get straight to the answer.
- Format your responses in markdown.

IMPORTANT: If the user asks a question that is not related to the topic above, politely respond with "I'm sorry, but I can't assist with that. Please ask a question related to the topic above.".`;
  }, [topicContent]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    // Add user message to UI
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Build messages payload for API
    const apiMessages: { role: string; content: string }[] = [];

    if (isFirstMessage) {
      apiMessages.push({ role: "system", content: buildSystemMessage() });
      setIsFirstMessage(false);
    }

    // Add all previous messages
    messages.forEach((msg) => {
      apiMessages.push({ role: msg.role, content: msg.content });
    });

    // Add the new user message
    apiMessages.push({ role: "user", content: trimmed });

    // Add a placeholder assistant message
    const assistantIndex = messages.length + 1; // +1 because we added user message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    // Abort previous request if any
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = {
            role: "assistant",
            content: "😔 Sorry, I couldn't process your request right now. Please try again.",
          };
          return updated;
        });
        setIsStreaming(false);
        return;
      }

      const data = await response.json();
      const content = data.content || "😔 No response received. Please try again.";

      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: "assistant",
          content,
        };
        return updated;
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: "assistant",
          content: "😔 Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setIsFirstMessage(true);
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const drawerClass = useMemo(() => {
    const classes = ["chatbot-drawer"];
    if (isFullscreen) classes.push("chatbot-fullscreen");
    return classes.join(" ");
  }, [isFullscreen]);

  return (
    <>
      {/* Fullscreen backdrop */}
      {isOpen && isFullscreen && (
        <div className="chatbot-backdrop" onClick={() => setIsFullscreen(false)} />
      )}

      {/* Floating toggle button */}
      <button
        id="chatbot-toggle"
        className={`chatbot-fab ${isOpen ? "chatbot-fab-hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <span className="chatbot-fab-icon">🤖</span>
      </button>

      {/* Chat drawer */}
      {isOpen && (
        <div className={drawerClass} role="dialog" aria-label="Topic chatbot">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-header-icon">🤖</span>
              <div>
                <h3 className="chatbot-title">Topic Assistant</h3>
                <p className="chatbot-subtitle">
                  Ask about {topicContent.title}
                </p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                id="chatbot-fullscreen-toggle"
                className="chatbot-action-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Minimize" : "Fullscreen"}
              >
                {isFullscreen ? "⊙" : "⛶"}
              </button>
              <button
                id="chatbot-clear"
                className="chatbot-action-btn"
                onClick={handleClearChat}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                id="chatbot-close"
                className="chatbot-action-btn"
                onClick={() => {
                  setIsOpen(false);
                  setIsFullscreen(false);
                }}
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-empty">
                <span className="chatbot-empty-icon">💬</span>
                <p>Ask anything about <strong>{topicContent.title}</strong></p>
                <div className="chatbot-suggestions">
                  <button
                    className="chatbot-suggestion"
                    onClick={() => {
                      setInput("Explain this topic in simple terms");
                    }}
                  >
                    Explain simply
                  </button>
                  <button
                    className="chatbot-suggestion"
                    onClick={() => {
                      setInput("Give me a real-world example");
                    }}
                  >
                    Real-world example
                  </button>
                  <button
                    className="chatbot-suggestion"
                    onClick={() => {
                      setInput("What are the most common interview questions?");
                    }}
                  >
                    Interview prep
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-bubble chatbot-bubble-${msg.role}`}
              >
                {msg.role === "assistant" && (
                  <span className="chatbot-bubble-avatar">🤖</span>
                )}
                <div className="chatbot-bubble-content">
                  {msg.content ? (
                    msg.role === "assistant" ? (
                      <div
                        className="chatbot-markdown"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(msg.content),
                        }}
                      />
                    ) : (
                      msg.content
                    )
                  ) : (
                    <span className="chatbot-typing">
                      <span className="chatbot-dot" />
                      <span className="chatbot-dot" />
                      <span className="chatbot-dot" />
                    </span>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isStreaming ? "Waiting for response..." : "Ask a question..."
              }
              disabled={isStreaming}
              autoComplete="off"
            />
            <button
              id="chatbot-send"
              type="submit"
              className="chatbot-send-btn"
              disabled={isStreaming || !input.trim()}
              aria-label="Send message"
            >
              {isStreaming ? (
                <span className="chatbot-typing-sm">
                  <span className="chatbot-dot" />
                  <span className="chatbot-dot" />
                  <span className="chatbot-dot" />
                </span>
              ) : (
                "➤"
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
