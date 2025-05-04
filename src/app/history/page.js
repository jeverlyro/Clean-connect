"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./history.module.css";
import Link from "next/link";
// Import FontAwesome icons
import {
  FaComments,
  FaVial,
  FaSpinner,
  FaRedo,
  FaCommentDots,
  FaFileAlt,
  FaPlus,
  FaArrowLeft,
} from "react-icons/fa";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatHistory, setChatHistory] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load history data when component mounts
    const loadHistory = async () => {
      setLoading(true);
      try {
        // Fetch chat history from the database
        const chatResponse = await fetch("/api/chat/history");
        const chatData = await chatResponse.json();

        if (!chatData.success) {
          throw new Error(chatData.error || "Failed to fetch chat history");
        }

        // Group the chat messages by session
        const groupedChats = [];
        if (chatData.messages && chatData.messages.length > 0) {
          // If we have a single chat session from the API
          groupedChats.push({
            id: chatData.sessionId || `chat_${Date.now()}`,
            date: chatData.messages[0]?.timestamp || new Date().toISOString(),
            messages: chatData.messages,
          });
        }

        // Fetch image analysis history from the database
        const analysisResponse = await fetch("/api/image-analysis/history");
        let analysisData = { success: true, analyses: [] };

        try {
          analysisData = await analysisResponse.json();

          if (!analysisData.success) {
            throw new Error(
              analysisData.error || "Failed to fetch analysis history"
            );
          }
        } catch (analysisError) {
          console.error("Error fetching image analyses:", analysisError);
          // Continue with empty analyses rather than failing completely
        }

        // Format the analyses data
        const formattedAnalyses =
          analysisData.analyses?.map((analysis) => ({
            id: analysis.analysisId,
            date: analysis.results?.timestamp || analysis.createdAt,
            waterQualityScore: analysis.results?.waterQualityScore || 0,
            contaminants: analysis.results?.contaminants || [],
            analysis: analysis.results?.analysis || "No analysis available",
            recommendations: analysis.results?.recommendations || [],
            imageUrl: `/api/image-analysis/${analysis.analysisId}/image`, // Endpoint that would serve the image
          })) || [];

        setChatHistory(groupedChats);
        setAnalysisHistory(formattedAnalyses);
      } catch (error) {
        console.error("Error loading history:", error);
        setError("Failed to load history data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Format date string for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Extract partial content for preview
  const getPreviewContent = (message) => {
    if (message.content.length > 100) {
      return message.content.substring(0, 100) + "...";
    }
    return message.content;
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        <FaArrowLeft /> Back
      </Link>

      <div className={styles.header}>
        <h1>Your History</h1>
        <p>View your past chat conversations and water quality analyses</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "chat" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("chat")}
        >
          <span className={styles.tabButtonContent}>
            <FaComments /> Chat History
          </span>
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "analysis" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("analysis")}
        >
          <span className={styles.tabButtonContent}>
            <FaVial /> Image Analyses
          </span>
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading your history...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            <span className={styles.buttonContent}>
              <FaRedo /> Retry
            </span>
          </button>
        </div>
      ) : (
        <div className={styles.contentContainer}>
          {activeTab === "chat" && (
            <div className={styles.chatHistoryContainer}>
              <h2>Your Recent Conversations</h2>

              {chatHistory.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>You don&apos;t have any chat history yet.</p>
                  <Link href="/chatbot" className={styles.startButton}>
                    <span className={styles.buttonContent}>
                      <FaCommentDots /> Start a New Chat
                    </span>
                  </Link>
                </div>
              ) : (
                <div className={styles.historyList}>
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className={styles.historyItem}>
                      <div className={styles.historyItemHeader}>
                        <div className={styles.dateInfo}>
                          {formatDate(chat.date)}
                        </div>
                        <div className={styles.messageCount}>
                          {chat.messages.length} messages
                        </div>
                      </div>

                      <div className={styles.chatPreview}>
                        {chat.messages.slice(0, 2).map((message, index) => (
                          <div
                            key={index}
                            className={`${styles.messagePreview} ${
                              message.role === "user"
                                ? styles.userMessage
                                : styles.assistantMessage
                            }`}
                          >
                            <span className={styles.messageRole}>
                              {message.role === "user" ? "You" : "Assistant"}
                            </span>
                            <p>{getPreviewContent(message)}</p>
                          </div>
                        ))}
                        {chat.messages.length > 2 && (
                          <div className={styles.moreMessages}>
                            +{chat.messages.length - 2} more messages
                          </div>
                        )}
                      </div>

                      <div className={styles.historyActions}>
                        <button
                          className={styles.viewButton}
                          onClick={() => {
                            // In a real app, this would navigate to a detailed view
                            window.location.href = `/chatbot?session=${chat.id}`;
                          }}
                        >
                          <span className={styles.buttonContent}>
                            <FaFileAlt /> View Full Conversation
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "analysis" && (
            <div className={styles.analysisHistoryContainer}>
              <h2>Your Recent Water Analyses</h2>

              {analysisHistory.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>You don&apos;t have any image analysis history yet.</p>
                  <Link href="/image-analysis" className={styles.startButton}>
                    <span className={styles.buttonContent}>
                      <FaVial /> Analyze a Water Sample
                    </span>
                  </Link>
                </div>
              ) : (
                <div className={styles.analysisGrid}>
                  {analysisHistory.map((analysis) => (
                    <div key={analysis.id} className={styles.analysisCard}>
                      <div className={styles.analysisHeader}>
                        <div className={styles.dateInfo}>
                          {formatDate(analysis.date)}
                        </div>
                        <div
                          className={styles.scoreCircle}
                          style={{
                            position: `relative`,
                          }}
                        >
                          <svg
                            className={styles.scoreProgressRing}
                            width="70"
                            height="70"
                            viewBox="0 0 120 120"
                          >
                            {/* Background circle */}
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="10"
                            />
                            {/* Progress arc */}
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke={
                                analysis.waterQualityScore >= 80
                                  ? "#3B82F6" // Blue for high scores
                                  : analysis.waterQualityScore >= 50
                                  ? "#4ADE80" // Green for medium scores
                                  : "#F59E0B" // Yellow/Orange for low scores
                              }
                              strokeWidth="10"
                              strokeDasharray={`${
                                analysis.waterQualityScore * 3.39
                              } 1000`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                              transform="rotate(-90, 60, 60)"
                            />
                          </svg>
                          <div className={styles.scoreValueContainer}>
                            <div className={styles.scoreValue}>
                              {analysis.waterQualityScore}
                              <span className={styles.scorePercent}>%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.analysisSummary}>
                        <h3>Analysis Summary</h3>
                        <p>{analysis.analysis.substring(0, 150)}...</p>
                      </div>

                      <div className={styles.contaminantsPreview}>
                        <h4>Key Contaminants</h4>
                        <div className={styles.contaminantsList}>
                          {analysis.contaminants
                            .slice(0, 3)
                            .map((contaminant, index) => (
                              <div
                                key={index}
                                className={styles.contaminantItem}
                              >
                                <span className={styles.contaminantName}>
                                  {contaminant.name}:
                                </span>
                                <span
                                  className={`${styles.contaminantStatus} ${
                                    contaminant.isSafe
                                      ? styles.safe
                                      : styles.unsafe
                                  }`}
                                >
                                  {contaminant.isSafe ? "Safe" : "Warning"}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className={styles.analysisActions}>
                        <button
                          className={styles.viewButton}
                          onClick={() => {
                            window.location.href = `/report?id=${analysis.id}`;
                          }}
                        >
                          <span className={styles.buttonContent}>
                            <FaFileAlt /> View Full Report
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className={styles.actionsContainer}>
        {activeTab === "chat" ? (
          <Link href="/chatbot" className={styles.primaryButton}>
            <span className={styles.buttonContent}>
              <FaPlus /> Start New Chat
            </span>
          </Link>
        ) : (
          <Link href="/image-analysis" className={styles.primaryButton}>
            <span className={styles.buttonContent}>
              <FaPlus /> New Image Analysis
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
