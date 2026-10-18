import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  X,
  RotateCcw,
  Send,
  MessageSquare,
  FileText,
  Cpu,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { sendAssistantMessage } from "../../services/assistantService.js";
import styles from "./EvangadiAssistant.module.css";

const DEFAULT_SUGGESTIONS = [
  "What is Node.js?",
  "How does JWT login work?",
  "What is RAG?",
  "What is Evangadi Forum?",
];

export default function EvangadiAssistant() {
  const authContext = useAuth();
  const user = authContext?.user;
  const firstName = user?.firstName || user?.first_name || null;

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const getWelcomeText = (name) =>
    name
      ? `Hi ${name}! 👋 I'm the Evangadi Forum assistant. Ask me about the questions and answers in the forum, or about your own PDFs. I answer only from those, and I show you my sources.`
      : `Hi there! 👋 I'm the Evangadi Forum assistant. Ask me about the questions and answers in the forum, or log in to query your uploaded PDFs. I answer only from those, and I show you my sources.`;

  const [messages, setMessages] = useState(() => [
    {
      id: "init",
      role: "assistant",
      isWelcome: true,
      sources: [],
    },
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll when messages or thinking state updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleReset = () => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        isWelcome: true,
        sources: [],
      },
    ]);
    setInputText("");
    setIsThinking(false);
  };

  const messageIdRef = useRef(1);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    const userMessageId = `user-${messageIdRef.current++}`;
    const newUserMessage = {
      id: userMessageId,
      role: "user",
      content: query,
    };

    // Prepare history payload (excluding welcome greeting and source metadata)
    const historyPayload = messages
      .filter((m) => !m.isWelcome)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsThinking(true);

    try {
      const response = await sendAssistantMessage(query, historyPayload);

      const botMessage = {
        id: `bot-${messageIdRef.current++}`,
        role: "assistant",
        content: response.answer || "I could not find information on that topic.",
        sources: response.sources || [],
        followUps: response.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage = {
        id: `bot-err-${messageIdRef.current++}`,
        role: "assistant",
        content:
          "I'm sorry, I encountered a temporary connection issue while retrieving sources. Please try asking again in a moment.",
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const renderSourceIcon = (type) => {
    switch (type) {
      case "forum":
        return <MessageSquare size={13} style={{ color: "#ea580c" }} />;
      case "document":
        return <FileText size={13} style={{ color: "#4f46e5" }} />;
      default:
        return <Cpu size={13} style={{ color: "#059669" }} />;
    }
  };

  const renderSourceBadge = (type) => {
    switch (type) {
      case "forum":
        return <span className={`${styles.sourceBadge} ${styles.badgeForum}`}>Forum</span>;
      case "document":
        return <span className={`${styles.sourceBadge} ${styles.badgeDoc}`}>PDF Doc</span>;
      default:
        return <span className={`${styles.sourceBadge} ${styles.badgeApp}`}>App Specs</span>;
    }
  };

  return (
    <>
      {/* Floating Launcher / Close Button */}
      <button
        type="button"
        className={`${styles.launcherButton} ${isOpen ? styles.launcherButtonOpen : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close Assistant" : "Open Evangadi Assistant"}
        title={isOpen ? "Close Assistant" : "Open Evangadi Assistant"}
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <aside className={styles.chatWindow} aria-label="Evangadi Assistant Chatbot">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatar}>
                <Sparkles size={18} />
              </div>
              <div className={styles.headerTitleGroup}>
                <h3 className={styles.headerTitle}>Evangadi Assistant</h3>
                <div className={styles.headerSubtitle}>
                  <span className={styles.statusDot} />
                  <span>Online · answers from the forum and your PDFs</span>
                </div>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleReset}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={styles.messagesContainer}>
            {messages.map((msg, idx) => (
              <div key={msg.id}>
                {msg.role === "assistant" ? (
                  <div>
                    <div className={styles.botMessageRow}>
                      <div className={styles.botAvatarSmall}>
                        <Sparkles size={15} />
                      </div>
                      <div className={styles.botBubble}>
                        {msg.isWelcome ? (
                          <p>{getWelcomeText(firstName)}</p>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ href, children, ...props }) => {
                                const isInternal =
                                  href && (href.startsWith("/") || href.startsWith("#"));
                                if (isInternal) {
                                  return (
                                    <Link to={href} {...props}>
                                      {children}
                                    </Link>
                                  );
                                }
                                return (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    {...props}
                                  >
                                    {children}
                                  </a>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}

                        {/* Grounded Sources Cards */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className={styles.sourcesCard}>
                            <div className={styles.sourcesHeader}>
                              <span>Grounding Sources</span>
                            </div>
                            <div className={styles.sourcePillList}>
                              {msg.sources.map((src, sIdx) =>
                                src.link ? (
                                  <Link
                                    key={`${src.type}-${src.id || sIdx}`}
                                    to={src.link}
                                    className={styles.sourcePill}
                                    title={src.snippet || src.title}
                                  >
                                    {renderSourceIcon(src.type)}
                                    {renderSourceBadge(src.type)}
                                    <span className={styles.sourceTitle}>{src.title}</span>
                                    <ExternalLink
                                      size={11}
                                      style={{ flexShrink: 0, color: "#94a3b8" }}
                                    />
                                  </Link>
                                ) : (
                                  <div
                                    key={`${src.type}-${src.id || sIdx}`}
                                    className={styles.sourcePill}
                                    title={src.snippet || src.title}
                                  >
                                    {renderSourceIcon(src.type)}
                                    {renderSourceBadge(src.type)}
                                    <span className={styles.sourceTitle}>{src.title}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Suggestions underneath welcome message */}
                    {msg.isWelcome && (
                      <div className={styles.suggestionsWrapper}>
                        {DEFAULT_SUGGESTIONS.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            className={styles.suggestionChip}
                            onClick={() => handleSendMessage(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Dynamic Follow-up Suggestions underneath latest response */}
                    {!msg.isWelcome &&
                      idx === messages.length - 1 &&
                      !isThinking &&
                      msg.followUps &&
                      msg.followUps.length > 0 && (
                        <div className={styles.suggestionsWrapper}>
                          {msg.followUps.slice(0, 3).map((suggestion, fIdx) => (
                            <button
                              key={fIdx}
                              type="button"
                              className={styles.suggestionChip}
                              onClick={() => handleSendMessage(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className={styles.userMessageRow}>
                    <div className={styles.userBubble}>{msg.content}</div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Typing State */}
            {isThinking && (
              <div className={styles.botMessageRow}>
                <div className={styles.botAvatarSmall}>
                  <Sparkles size={15} />
                </div>
                <div className={styles.typingBubble}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className={styles.inputArea}>
            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <input
                ref={inputRef}
                type="text"
                className={styles.textInput}
                placeholder="Ask about the forum or your PDFs..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isThinking}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!inputText.trim() || isThinking}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
}

