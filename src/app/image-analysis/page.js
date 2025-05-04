"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import styles from "./image-analysis.module.css";
// Import FontAwesome icons
import { FaUpload, FaSync, FaMicroscope, FaSave } from "react-icons/fa";

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

    try {
      // Create form data to send the image
      const formData = new FormData();
      formData.append("image", selectedImage);

      // In a real application, this would call an actual API endpoint
      // For demo purposes, we'll simulate the analysis with a timeout
      setTimeout(() => {
        // Simulate analysis results based on random data
        const mockResults = generateMockAnalysisResults();
        setAnalysisResults(mockResults);
        setIsAnalyzing(false);

        // In a real app, you would save the analysis results to MongoDB here
      }, 2000);

      // Real API call would look like this:
      /*
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysisResults(data.results);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
      */
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

  // Helper function to generate mock analysis results
  const generateMockAnalysisResults = () => {
    const waterQualityScore = Math.floor(Math.random() * 100);

    const contaminants = [
      {
        name: "Chlorine",
        level: +(Math.random() * 4).toFixed(2),
        unit: "mg/L",
        threshold: 4,
        isSafe: true,
      },
      {
        name: "Lead",
        level: +(Math.random() * 20).toFixed(2),
        unit: "ppb",
        threshold: 15,
        isSafe: Math.random() > 0.3,
      },
      {
        name: "Turbidity",
        level: +(Math.random() * 10).toFixed(2),
        unit: "NTU",
        threshold: 5,
        isSafe: Math.random() > 0.4,
      },
      {
        name: "pH",
        level: +(6 + Math.random() * 3).toFixed(1),
        unit: "",
        threshold: "6.5-8.5",
        isSafe: Math.random() > 0.2,
      },
    ];

    const unsafeContaminants = contaminants.filter((c) => !c.isSafe);

    let analysis = "";
    let recommendations = [];

    if (waterQualityScore >= 80) {
      analysis =
        "The water sample appears to be of good quality. Most parameters are within acceptable ranges.";
      recommendations = [
        "Continue regular monitoring of water quality",
        "Maintain current water treatment methods",
      ];
    } else if (waterQualityScore >= 50) {
      analysis =
        "The water sample shows moderate quality concerns. Some parameters require attention.";
      recommendations = [
        "Consider additional filtration for specific contaminants",
        "Retest water in 1-2 weeks to monitor changes",
      ];

      if (unsafeContaminants.length > 0) {
        unsafeContaminants.forEach((c) => {
          recommendations.push(
            `Address elevated ${c.name} levels with appropriate treatment`
          );
        });
      }
    } else {
      analysis =
        "The water sample indicates significant quality issues. Multiple parameters exceed recommended levels.";
      recommendations = [
        "Consult with water quality specialists immediately",
        "Consider alternative water sources until issues are resolved",
        "Install comprehensive water treatment system",
      ];

      if (unsafeContaminants.length > 0) {
        unsafeContaminants.forEach((c) => {
          recommendations.push(
            `Urgent treatment needed for ${c.name} contamination`
          );
        });
      }
    }

    return {
      waterQualityScore,
      contaminants,
      analysis,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  };

  return (
    <div className={styles.container}>
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
              <FaMicroscope />{" "}
              {isAnalyzing ? "Analyzing..." : "Analyze Water Sample"}
            </button>
            <button
              onClick={resetAnalysis}
              className={`${styles.button} ${styles.resetButton}`}
            >
              <FaSync /> Reset
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
                  background: `conic-gradient(
                  ${
                    analysisResults.waterQualityScore >= 80
                      ? "#4CAF50"
                      : analysisResults.waterQualityScore >= 50
                      ? "#FFC107"
                      : "#F44336"
                  } 
                  ${analysisResults.waterQualityScore * 3.6}deg, 
                  #f0f0f0 0deg
                )`,
                }}
              >
                <div className={styles.scoreValue}>
                  <span>{analysisResults.waterQualityScore}</span>
                  <small>/100</small>
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
              <p>{analysisResults.analysis}</p>
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
              onClick={() => {
                // In a real app, would save to recent analyses
                alert("Analysis saved to your history!");
              }}
            >
              <FaSave /> Save Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
