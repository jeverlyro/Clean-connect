"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./history.module.css";
// Import FontAwesome icons
import {
  FaComments,
  FaVial,
  FaSpinner,
  FaRedo,
  FaCommentDots,
  FaFileAlt,
  FaPlus,
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
        // In a real app, these would be separate API calls
        // For demo purposes, we'll create mock data

        // Mock chat history data
        const mockChatHistory = [
          {
            id: "chat_1",
            date: "2025-05-03T14:30:00Z",
            messages: [
              {
                role: "user",
                content: "What causes water to smell like chlorine?",
                timestamp: "2025-05-03T14:30:00Z",
              },
              {
                role: "assistant",
                content:
                  "The chlorine smell in water is typically due to chlorine disinfection used by water utilities to kill harmful bacteria. While the smell might be off-putting, it actually indicates that your water has been properly treated. If the smell is very strong, it could be due to higher chlorine levels or a reaction with organic matter. You can reduce the smell by letting water sit in an open container for a few hours or using a carbon filter.",
                timestamp: "2025-05-03T14:30:15Z",
              },
              {
                role: "user",
                content: "Is it safe to drink water with chlorine smell?",
                timestamp: "2025-05-03T14:31:00Z",
              },
              {
                role: "assistant",
                content:
                  "Yes, water with a mild chlorine smell is generally safe to drink. The levels of chlorine used in municipal water supplies are regulated and kept within safe limits. The EPA sets the maximum residual disinfectant level for chlorine at 4 milligrams per liter (mg/L). If you're concerned about the taste or smell, you can use a carbon filter pitcher or faucet attachment, which will effectively remove the chlorine.",
                timestamp: "2025-05-03T14:31:20Z",
              },
            ],
          },
          {
            id: "chat_2",
            date: "2025-05-02T10:15:00Z",
            messages: [
              {
                role: "user",
                content: "What is water hardness?",
                timestamp: "2025-05-02T10:15:00Z",
              },
              {
                role: "assistant",
                content:
                  "Water hardness refers to the amount of dissolved minerals, specifically calcium and magnesium, in your water. Hard water has high mineral content, while soft water has low mineral content. Hard water isn't harmful to health but can cause scale buildup in pipes and appliances, reduce soap lathering, and leave spots on dishes. Water hardness is typically measured in grains per gallon (gpg) or parts per million (ppm).",
                timestamp: "2025-05-02T10:15:20Z",
              },
            ],
          },
        ];

        // Mock image analysis history data
        const mockAnalysisHistory = [
          {
            id: "analysis_1",
            date: "2025-05-04T09:20:00Z",
            imageUrl: "/sample-water-1.jpg",
            waterQualityScore: 87,
            contaminants: [
              {
                name: "Chlorine",
                level: 2.1,
                unit: "mg/L",
                threshold: 4,
                isSafe: true,
              },
              {
                name: "pH",
                level: 7.2,
                unit: "",
                threshold: "6.5-8.5",
                isSafe: true,
              },
              {
                name: "Turbidity",
                level: 0.8,
                unit: "NTU",
                threshold: 5,
                isSafe: true,
              },
            ],
            analysis:
              "The water sample appears to be of good quality. All tested parameters are within acceptable ranges.",
            recommendations: [
              "Continue regular monitoring of water quality",
              "Maintain current water treatment methods",
            ],
          },
          {
            id: "analysis_2",
            date: "2025-05-01T16:40:00Z",
            imageUrl: "/sample-water-2.jpg",
            waterQualityScore: 64,
            contaminants: [
              {
                name: "Lead",
                level: 12.6,
                unit: "ppb",
                threshold: 15,
                isSafe: true,
              },
              {
                name: "pH",
                level: 6.4,
                unit: "",
                threshold: "6.5-8.5",
                isSafe: false,
              },
              {
                name: "Turbidity",
                level: 6.2,
                unit: "NTU",
                threshold: 5,
                isSafe: false,
              },
            ],
            analysis:
              "The water sample shows moderate quality concerns. Some parameters require attention.",
            recommendations: [
              "Consider additional filtration for turbidity",
              "Adjust pH with appropriate treatment",
              "Retest water in 1-2 weeks to monitor changes",
            ],
          },
        ];

        setChatHistory(mockChatHistory);
        setAnalysisHistory(mockAnalysisHistory);
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
          <FaComments /> Chat History
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "analysis" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("analysis")}
        >
          <FaVial /> Image Analyses
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
            <FaRedo /> Retry
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
                  <a href="/chatbot" className={styles.startButton}>
                    <FaCommentDots /> Start a New Chat
                  </a>
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
                            // or expand the conversation in place
                            alert("View full conversation");
                          }}
                        >
                          <FaFileAlt /> View Full Conversation
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
                  <a href="/image-analysis" className={styles.startButton}>
                    <FaVial /> Analyze a Water Sample
                  </a>
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
                            background: `conic-gradient(
                            ${
                              analysis.waterQualityScore >= 80
                                ? "#4CAF50"
                                : analysis.waterQualityScore >= 50
                                ? "#FFC107"
                                : "#F44336"
                            } 
                            ${analysis.waterQualityScore * 3.6}deg, 
                            #f0f0f0 0deg
                          )`,
                          }}
                        >
                          <div className={styles.scoreValue}>
                            {analysis.waterQualityScore}
                          </div>
                        </div>
                      </div>

                      <div className={styles.analysisSummary}>
                        <h3>Analysis Summary</h3>
                        <p>{analysis.analysis}</p>
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
                            // In a real app, this would navigate to a detailed view
                            alert("View full analysis report");
                          }}
                        >
                          <FaFileAlt /> View Full Report
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
          <a href="/chatbot" className={styles.primaryButton}>
            <FaPlus /> Start New Chat
          </a>
        ) : (
          <a href="/image-analysis" className={styles.primaryButton}>
            <FaPlus /> New Image Analysis
          </a>
        )}
      </div>
    </div>
  );
}
