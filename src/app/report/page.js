"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./report.module.css";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function ReportPage() {
  const [formData, setFormData] = useState({
    waterSource: "",
    issueType: "",
    location: "",
    description: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validation
    if (!formData.waterSource || !formData.issueType || !formData.description) {
      setError("Please fill all required fields");
      setSubmitting(false);
      return;
    }

    try {
      // Create a FormData object to send the form data including the image
      const apiFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "image" && formData[key]) {
          apiFormData.append("image", formData[key]);
        } else if (formData[key]) {
          apiFormData.append(key, formData[key]);
        }
      });

      // Submit the form data to the API
      const response = await fetch("/api/report", {
        method: "POST",
        body: apiFormData,
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
        setSubmitSuccess(true);
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("Failed to submit your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      waterSource: "",
      issueType: "",
      location: "",
      description: "",
      image: null,
    });
    setImagePreview("");
    setRecommendations("");
    setSubmitSuccess(false);
    setError("");
  };

  const generateMockRecommendations = (data) => {
    let recommendations = "";

    if (data.waterSource === "tap") {
      recommendations +=
        "For tap water issues, first check if the problem is present in all faucets or just one. If it's just one, the issue may be with that specific faucet or its pipe connection. ";

      if (data.issueType === "color") {
        recommendations +=
          "Discolored tap water often results from rust in pipes or sediment. Run cold water for 2-3 minutes to see if it clears. If your area has hard water, consider installing a water softener system. ";
      } else if (data.issueType === "odor") {
        recommendations +=
          "Odors in tap water can come from chlorine treatment, bacteria, or organic matter. A carbon filter can help reduce chlorine smells. If you detect a rotten egg smell, this could indicate hydrogen sulfide gas and should be addressed by a professional. ";
      } else if (data.issueType === "taste") {
        recommendations +=
          "Metallic or chemical tastes in tap water may indicate pipe corrosion or excessive minerals. Consider installing a reverse osmosis system or activated carbon filter under your sink. ";
      }
    } else if (data.waterSource === "well") {
      recommendations +=
        "For well water, regular testing is crucial as there's no municipal oversight. Aim to test your well water at least annually for bacteria, nitrates, and pH levels. ";

      if (data.issueType === "contaminants") {
        recommendations +=
          "Well contamination often comes from nearby agricultural activities, septic systems, or natural mineral deposits. Consider installing a whole-house filtration system specifically designed for the contaminants present in your water. Contact a local well specialist who can recommend targeted treatment options. ";
      }
    } else if (data.waterSource === "river" || data.waterSource === "lake") {
      recommendations +=
        "Natural water sources require thorough treatment before consumption. Never drink untreated surface water. ";
      recommendations +=
        "For recreational activities, monitor local advisories about water quality and algal blooms. Contact your local environmental agency to report significant changes in water quality. ";
    }

    if (
      data.description.toLowerCase().includes("child") ||
      data.description.toLowerCase().includes("baby")
    ) {
      recommendations +=
        "Since your concern involves children, who are more vulnerable to water contaminants, consider using filtered or bottled water for drinking and cooking until the issue is resolved. ";
    }

    if (
      data.description.toLowerCase().includes("sick") ||
      data.description.toLowerCase().includes("ill") ||
      data.description.toLowerCase().includes("health")
    ) {
      recommendations +=
        "If you're experiencing health issues you believe are related to water quality, please consult a healthcare provider immediately. Bring a water sample for potential testing. ";
    }

    recommendations += "\n\nNext steps:\n";
    recommendations +=
      "1. Contact your local water utility or health department for professional testing\n";
    recommendations +=
      "2. Consider using a certified home water test kit for preliminary results\n";
    recommendations +=
      "3. Document the issue with photos and keep records of when the problem occurs\n";

    if (data.issueType === "contaminants" || data.issueType === "health") {
      recommendations +=
        "4. Use alternative water sources for drinking and cooking until the issue is resolved\n";
      recommendations +=
        "5. Consult with a certified water treatment specialist about treatment options\n";
    }

    return recommendations;
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        <FaArrowLeft /> Back
      </Link>

      <div className={styles.header}>
        <h1>Water Quality Report Form</h1>
        <p>Submit details about water quality issues you&apos;ve encountered</p>
      </div>

      {!submitSuccess ? (
        <form className={styles.reportForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="waterSource">Water Source *</label>
            <select
              id="waterSource"
              name="waterSource"
              value={formData.waterSource}
              onChange={handleInputChange}
              required
              className={styles.select}
            >
              <option value="">Select a water source</option>
              <option value="tap">Tap Water</option>
              <option value="well">Well Water</option>
              <option value="river">River</option>
              <option value="lake">Lake</option>
              <option value="ocean">Ocean</option>
              <option value="rain">Rain Water</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="issueType">Type of Issue *</label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleInputChange}
              required
              className={styles.select}
            >
              <option value="">Select an issue type</option>
              <option value="color">Unusual Color</option>
              <option value="odor">Strange Odor</option>
              <option value="taste">Bad Taste</option>
              <option value="contaminants">Suspected Contaminants</option>
              <option value="health">Health Concerns</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location (Optional)</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, state, or specific water body"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide details about the issue, when it started, and any other relevant information"
              required
              className={styles.textarea}
              rows={5}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image">Upload an Image (Optional)</label>
            <div className={styles.imageUpload}>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <label htmlFor="image" className={styles.fileLabel}>
                {imagePreview ? "Change Image" : "Choose File"}
              </label>
              {imagePreview && (
                <div className={styles.previewContainer}>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className={styles.imagePreview}
                    width={300}
                    height={200}
                  />
                </div>
              )}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              <span className="button-content">
                {submitting ? "Submitting..." : "Submit Report"}
              </span>
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.successContainer}>
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 4L12 14.01L9 11.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>Report Submitted Successfully!</h2>
            <p>
              Thank you for your report. Our AI has analyzed your information
              and provided recommendations.
            </p>
          </div>

          <div className={styles.recommendationsContainer}>
            <h3>AI Recommendations</h3>
            <div className={styles.recommendationsContent}>
              {recommendations.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          <div className={styles.notificationInfo}>
            <div className={styles.notificationIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965C12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p>
              Your report has been sent to our administrators via WhatsApp for
              further review.
            </p>
          </div>

          <button onClick={resetForm} className={styles.newReportButton}>
            <span className="button-content">Submit Another Report</span>
          </button>
        </div>
      )}
    </div>
  );
}
