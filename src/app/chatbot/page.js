"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./chatbot.module.css";
// Import FontAwesome icons
import { FaPaperPlane, FaTrash, FaHistory, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your water quality assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate a unique session ID when the component mounts
    setSessionId(
      `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    );

    // Load previous chat from local storage or indexedDB
    const loadPreviousChat = async () => {
      try {
        const response = await fetch("/api/chat/history");
        const data = await response.json();

        if (data.success && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadPreviousChat();
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      const response = await fetch("/api/chat/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([
          {
            role: "assistant",
            content: "Chat history has been cleared. How can I help you today?",
          },
        ]);

        // Generate a new session ID
        setSessionId(
          `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        );
      }
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };

  // Format message content to handle formatting while removing special symbols
  const formatMessageContent = (content) => {
    if (!content) return "";

    // Process bold text (** or __ syntax), but remove the symbols
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold with **
      .replace(/__(.*?)__/g, "<strong>$1</strong>"); // Bold with __

    // Process bullet points, removing symbol but preserving structure
    formattedContent = formattedContent.replace(
      /^\s*[-*•]\s+(.+)$/gm,
      '<div class="bulletPoint">$1</div>'
    );

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        <FaArrowLeft /> Back
      </Link>

      <div className={styles.header}>
        <h1>Water Quality Chatbot</h1>
        <p>Ask me anything about water quality issues and solutions</p>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.role === "user" ? styles.userMessage : styles.botMessage
              }`}
            >
              <div className={styles.messageContent}>
                {message.role === "assistant"
                  ? formatMessageContent(message.content)
                  : message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.botMessage}`}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question about water quality..."
            disabled={isLoading}
            className={styles.input}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={styles.sendButton}
          >
            <span className="button-content">
              <FaPaperPlane />
            </span>
          </button>
        </form>
      </div>

      <div className={styles.actions}>
        <button onClick={clearChat} className={styles.clearButton}>
          <span className="button-content">
            <FaTrash /> Clear Chat
          </span>
        </button>
        <Link href="/history" className={styles.historyLink}>
          <span className="button-content">
            <FaHistory /> View Chat History
          </span>
        </Link>
      </div>
    </div>
  );
}
