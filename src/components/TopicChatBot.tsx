"use client";

import { useState, useRef, useEffect, useCallback, useMemo, FormEvent, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { marked } from "marked";
import { ChatApiMessage, streamChatResponse } from "@/lib/chatClient";

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
  const [selectionBtn, setSelectionBtn] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectionTooltip, setSelectionTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    content: string;
    isLoading: boolean;
    error: string | null;
  } | null>(null);
  const [selectionTooltipPosition, setSelectionTooltipPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [topControlSlot, setTopControlSlot] = useState<HTMLElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const selectionAbortRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const selectionTooltipRef = useRef<HTMLDivElement>(null);

  const closeSelectionTooltip = useCallback(() => {
    selectionAbortRef.current?.abort();
    selectionAbortRef.current = null;
    setSelectionTooltip(null);
    setSelectionTooltipPosition(null);
  }, []);

  const handleContinueInChat = useCallback(() => {
    if (!selectionTooltip) return;

    const selectedText = selectionTooltip.text;
    const quickAnswer = selectionTooltip.content.trim();
    const initialQuestion = `Can you explain this part?\n\n"${selectedText}"`;
    const seeded: ChatMessage[] = [{ role: "user", content: initialQuestion }];
    if (quickAnswer) {
      seeded.push({ role: "assistant", content: quickAnswer });
    }

    closeSelectionTooltip();
    setIsOpen(true);
    setMessages(seeded);

    setInput("");
    setTimeout(() => inputRef.current?.focus(), 250);
  }, [closeSelectionTooltip, selectionTooltip]);

  const computeSelectionTooltipPosition = useCallback(
    (anchorX: number, anchorYInDocument: number) => {
      const viewportPadding = 12;
      const anchorOffset = 14;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = Math.min(420, viewportWidth - 32);
      const tooltipHeight = Math.min(360, viewportHeight - viewportPadding * 2);
      const anchorY = anchorYInDocument - window.scrollY;

      const availableAbove = anchorY - viewportPadding - anchorOffset;
      const availableBelow =
        viewportHeight - anchorY - viewportPadding - anchorOffset;
      const minPreferredSpace = Math.min(220, tooltipHeight);
      const placeAbove =
        availableAbove >= minPreferredSpace || availableAbove >= availableBelow;

      let top = placeAbove
        ? anchorY - anchorOffset - tooltipHeight
        : anchorY + anchorOffset;
      top = Math.max(
        viewportPadding,
        Math.min(top, viewportHeight - tooltipHeight - viewportPadding)
      );

      let left = anchorX - tooltipWidth / 2;
      left = Math.max(
        viewportPadding,
        Math.min(left, viewportWidth - tooltipWidth - viewportPadding)
      );

      return { left, top };
    },
    []
  );

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens, clear input when it closes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setInput("");
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      selectionAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setTopControlSlot(document.getElementById("top-chatbot-slot"));
  }, []);

  // Close chat when clicking outside the dialog
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        isOpen &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        const toggleBtn = document.getElementById("chatbot-toggle");
        if (toggleBtn && toggleBtn.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
        setIsFullscreen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Lock body scroll on fullscreen, and disable zoom on mobile when chat is open
  useEffect(() => {
    const isMobile = window.innerWidth <= 520;

    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
      // Disable pinch-to-zoom on mobile when chat is open
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        );
      }
    } else if (isFullscreen && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      // Restore zoom capability
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1"
        );
      }
    };
  }, [isFullscreen, isOpen]);

  // Handle global text selection to show the "Ask AI" helper
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length === 0) {
        setSelectionBtn(null);
        return;
      }

      // Ignore if the selection is inside the chat drawer itself
      if (
        chatContainerRef.current &&
        selection.anchorNode &&
        chatContainerRef.current.contains(selection.anchorNode)
      ) {
        setSelectionBtn(null);
        return;
      }

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelectionBtn({
          text,
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY - 10,
        });
      }
    };
    const handleSelectionChange = () => {
      if (!window.getSelection()?.toString().trim()) {
        setSelectionBtn(null);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    document.addEventListener("keyup", handleSelection);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
      document.removeEventListener("keyup", handleSelection);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

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

  const handleSelectionAction = useCallback(async () => {
    if (!selectionBtn) return;

    const selected = selectionBtn;

    setSelectionBtn(null);
    window.getSelection()?.removeAllRanges();
    setSelectionTooltipPosition(
      computeSelectionTooltipPosition(selected.x, selected.y)
    );
    setSelectionTooltip({
      text: selected.text,
      x: selected.x,
      y: selected.y,
      content: "",
      isLoading: true,
      error: null,
    });

    const apiMessages: ChatApiMessage[] = [
      { role: "system", content: buildSystemMessage() },
      {
        role: "user",
        content: `Explain this selected text in the context of the current topic. Keep it concise and practical.

Selected text:
"${selected.text}"`,
      },
    ];

    selectionAbortRef.current?.abort();
    const controller = new AbortController();
    selectionAbortRef.current = controller;

    try {
      const result = await streamChatResponse({
        messages: apiMessages,
        signal: controller.signal,
        onToken: (_token, fullContent) => {
          setSelectionTooltip((prev) =>
            prev
              ? {
                  ...prev,
                  content: fullContent,
                }
              : prev
          );
        },
      });

      if (result.status === "aborted") {
        return;
      }

      if (result.status === "error") {
        setSelectionTooltip((prev) =>
          prev
            ? {
                ...prev,
                error: result.message,
              }
            : prev
        );
      }
    } finally {
      if (selectionAbortRef.current === controller) {
        selectionAbortRef.current = null;
        setSelectionTooltip((prev) =>
          prev
            ? {
                ...prev,
                isLoading: false,
              }
            : prev
        );
      }
    }
  }, [buildSystemMessage, computeSelectionTooltipPosition, selectionBtn]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!selectionTooltip) return;

      const target = event.target as Node;
      if (selectionTooltipRef.current?.contains(target)) return;

      const selectionActionBtn = document.getElementById("chatbot-selection-action");
      if (selectionActionBtn?.contains(target)) return;

      closeSelectionTooltip();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [closeSelectionTooltip, selectionTooltip]);

  const selectionTooltipAnchorX = selectionTooltip?.x;
  const selectionTooltipAnchorY = selectionTooltip?.y;

  useLayoutEffect(() => {
    if (selectionTooltipAnchorX == null || selectionTooltipAnchorY == null) {
      return;
    }

    const updateTooltipPosition = () => {
      const { left, top } = computeSelectionTooltipPosition(
        selectionTooltipAnchorX,
        selectionTooltipAnchorY
      );
      setSelectionTooltipPosition((prev) => {
        if (prev && Math.abs(prev.left - left) < 1 && Math.abs(prev.top - top) < 1) {
          return prev;
        }
        return { left, top };
      });
    };

    updateTooltipPosition();
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, { passive: true });

    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition);
    };
  }, [
    computeSelectionTooltipPosition,
    selectionTooltipAnchorX,
    selectionTooltipAnchorY,
  ]);

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
    const apiMessages: ChatApiMessage[] = [];
    apiMessages.push({ role: "system", content: buildSystemMessage() });

    // Add all previous messages
    messages.forEach((msg) => {
      apiMessages.push({ role: msg.role, content: msg.content });
    });

    // Add the new user message
    apiMessages.push({ role: "user", content: trimmed });

    // Add a placeholder assistant message
    const assistantIndex = messages.length + 1; // +1 because we added user message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const setAssistantContent = (content: string) => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = { role: "assistant", content };
        return updated;
      });
    };

    // Abort previous request if any
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await streamChatResponse({
        messages: apiMessages,
        signal: controller.signal,
        onToken: (_token, fullContent) => {
          setAssistantContent(fullContent);
        },
      });

      if (result.status === "aborted") {
        return;
      }

      if (result.status === "error") {
        setAssistantContent(`😔 ${result.message}`);
      } else if (!result.content.trim()) {
        setAssistantContent("😔 No response received. Please try again.");
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsStreaming(false);
      }
    }
  };

  const handleClearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
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
      {topControlSlot &&
        createPortal(
          <button
            id="chatbot-toggle"
            className="mode-toggle chatbot-top-toggle"
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
            title="Open chat"
            type="button"
          >
            <span className="chatbot-top-toggle-icon">🤖</span>
          </button>,
          topControlSlot
        )}

      {/* Floating Text Selection Helper */}
      {selectionBtn && !isOpen && (
        <button
          id="chatbot-selection-action"
          className="chatbot-selection-btn"
          style={{
            left: selectionBtn.x,
            top: selectionBtn.y,
          }}
          onPointerDown={(e) => {
            e.preventDefault(); // Prevent selection from clearing before action fires
            handleSelectionAction();
          }}
        >
          ✨ Ask AI
        </button>
      )}

      {selectionTooltip && !isOpen && (
        <div
          ref={selectionTooltipRef}
          className="chatbot-selection-tooltip"
          style={{
            left: selectionTooltipPosition?.left ?? -9999,
            top: selectionTooltipPosition?.top ?? -9999,
            visibility: selectionTooltipPosition ? "visible" : "hidden",
          }}
          role="status"
          aria-live="polite"
        >
          <div className="chatbot-selection-tooltip-header">
            <p className="chatbot-selection-tooltip-title">AI Quick View</p>
            <button
              type="button"
              className="chatbot-selection-tooltip-close"
              onClick={closeSelectionTooltip}
              aria-label="Close quick AI view"
            >
              ✕
            </button>
          </div>
          <p className="chatbot-selection-tooltip-label">Selected text</p>
          <p className="chatbot-selection-tooltip-selected">{selectionTooltip.text}</p>
          <div className="chatbot-selection-tooltip-body">
            {selectionTooltip.content ? (
              <div
                className="chatbot-markdown"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(selectionTooltip.content),
                }}
              />
            ) : selectionTooltip.error ? (
              <p className="chatbot-selection-tooltip-error">{selectionTooltip.error}</p>
            ) : (
              <span className="chatbot-typing">
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
              </span>
            )}
          </div>
          {!selectionTooltip.isLoading && (
            <div className="chatbot-selection-tooltip-actions">
              <button
                type="button"
                className="chatbot-selection-tooltip-chat-btn"
                onClick={handleContinueInChat}
              >
                Continue in Chat
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen backdrop */}
      {isOpen && isFullscreen && (
        <div className="chatbot-backdrop" />
      )}

      {/* Chat drawer */}
      {isOpen && (
        <div ref={chatContainerRef} className={drawerClass} role="dialog" aria-label="Topic chatbot">
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
