"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import styles from "./image-analysis.module.css";
import Link from "next/link";
// Import FontAwesome icons
import {
  FaUpload,
  FaSync,
  FaMicroscope,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";

export default function ImageAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Reset states
    setError("");
    setAnalysisResults(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, JPG, or PNG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError("");

    try {
      // Create form data to send the image
      const formData = new FormData();
      formData.append("image", selectedImage);

      // Send the image to our API for analysis
      const response = await fetch("/api/image-analysis", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResults(data.results);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Image analysis error:", error);
      setError("Failed to analyze the image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setAnalysisResults(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveAnalysis = async () => {
    try {
      // In a real app with authentication, you would associate this with a user
      // For now, we just display a success message
      alert("Analysis saved to your history!");

      // You could also update the saved flag in the database here
      // await fetch('/api/image-analysis/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ analysisId: analysisResults.analysisId })
      // });
    } catch (error) {
      console.error("Failed to save analysis:", error);
    }
  };

  // Format analysis text for better readability and shorter responses
  const formatAnalysisText = (text) => {
    if (!text) return "";

    // Remove any markdown formatting symbols
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markers
      .replace(/__(.*?)__/g, "$1") // Remove underscore emphasis
      .replace(/\*([^*]+)\*/g, "$1") // Remove single asterisk emphasis
      .replace(/^>+\s?/gm, "") // Remove quote marks
      .replace(/#+\s/gm, "") // Remove heading markers
      .replace(/\n+/g, " ") // Replace multiple newlines with space
      .replace(/\s{2,}/g, " "); // Replace multiple spaces with single space

    // Shorten to reasonable length (150-200 words)
    if (formattedText.length > 300) {
      formattedText = formattedText.substring(0, 300) + "...";
    }

    return formattedText;
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        <FaArrowLeft /> Back
      </Link>

      <div className={styles.header}>
        <h1>Water Quality Image Analysis</h1>
        <p>Upload an image of your water sample for quality analysis</p>
      </div>

      <div className={styles.content}>
        <div className={styles.uploadSection}>
          <div
            className={`${styles.dropzone} ${
              selectedImage ? styles.hasImage : ""
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Water sample preview"
                width={300}
                height={300}
                className={styles.preview}
              />
            ) : (
              <>
                <div className={styles.uploadIcon}>
                  <FaUpload size={40} />
                </div>
                <p>Click to upload an image or drag and drop</p>
                <p className={styles.fileTypes}>JPEG, JPG, or PNG (max 5MB)</p>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleImageChange}
              ref={fileInputRef}
              className={styles.fileInput}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.buttons}>
            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className={`${styles.button} ${styles.analyzeButton}`}
            >
              <span className="button-content">
                <FaMicroscope />{" "}
                {isAnalyzing ? "Analyzing..." : "Analyze Water Sample"}
              </span>
            </button>
            <button
              onClick={resetAnalysis}
              className={`${styles.button} ${styles.resetButton}`}
            >
              <span className="button-content">
                <FaSync /> Reset
              </span>
            </button>
          </div>
        </div>

        {analysisResults && (
          <div className={styles.resultsSection}>
            <h2>Analysis Results</h2>

            <div className={styles.scoreContainer}>
              <div
                className={styles.scoreCircle}
                style={{
                  position: `relative`,
                }}
              >
                <svg
                  className={styles.scoreProgressRing}
                  width="150"
                  height="150"
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
                      analysisResults.waterQualityScore >= 80
                        ? "#3B82F6" // Blue for high scores
                        : analysisResults.waterQualityScore >= 50
                        ? "#4ADE80" // Green for medium scores
                        : "#F59E0B" // Yellow/Orange for low scores
                    }
                    strokeWidth="10"
                    strokeDasharray={`${
                      analysisResults.waterQualityScore * 3.39
                    } 1000`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90, 60, 60)"
                  />
                </svg>
                <div className={styles.scoreValueContainer}>
                  <div className={styles.scoreValue}>
                    {analysisResults.waterQualityScore}
                    <span className={styles.scorePercent}>%</span>
                  </div>
                </div>
              </div>
              <p className={styles.scoreLabel}>Water Quality Score</p>
            </div>

            <div className={styles.contaminantsTable}>
              <h3>Detected Contaminants</h3>
              <div className={styles.tableHeader}>
                <div>Parameter</div>
                <div>Level</div>
                <div>Safe Level</div>
                <div>Status</div>
              </div>
              {analysisResults.contaminants.map((contaminant, index) => (
                <div key={index} className={styles.tableRow}>
                  <div>{contaminant.name}</div>
                  <div>
                    {contaminant.level} {contaminant.unit}
                  </div>
                  <div>
                    {contaminant.threshold} {contaminant.unit}
                  </div>
                  <div
                    className={`${styles.status} ${
                      contaminant.isSafe ? styles.safe : styles.unsafe
                    }`}
                  >
                    {contaminant.isSafe ? "Safe" : "Warning"}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.analysisText}>
              <h3>Analysis</h3>
              <div>{formatAnalysisText(analysisResults.analysis)}</div>
            </div>

            <div className={styles.recommendations}>
              <h3>Recommendations</h3>
              <ul>
                {analysisResults.recommendations.map(
                  (recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  )
                )}
              </ul>
            </div>

            <button
              className={`${styles.button} ${styles.saveButton}`}
              onClick={saveAnalysis}
            >
              <span className="button-content">
                <FaSave /> Save Analysis
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
