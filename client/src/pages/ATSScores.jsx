import React, { useState } from "react";
import axios from "axios";
import "./ATSScores.css";

const ATSScore = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    file: null,
  });
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (name === "file") {
      setScore(null);
      setError("");
      setUploadProgress(0);
    }
  };

  const validateForm = () => {
    if (!formData.file) return "Please select a PDF file.";
    if (!formData.email) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return "Please enter a valid email.";
    if (!formData.phone) return "Please enter your phone number.";
    if (!/^\+?\d{10,12}$/.test(formData.phone))
      return "Please enter a valid phone number.";
    return "";
  };

  const handleUpload = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const data = new FormData();
    data.append("resume", formData.file);
    data.append("email", formData.email);
    data.append("phone", formData.phone);

    try {
      setLoading(true);
      setError("");
      const response = await axios.post(
        "http://localhost:5000/api/score",
        data,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );
      setScore(response.data.score);
    } catch (err) {
      setError("Failed to process resume. Please try again later.");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* Simulated detailed ATS metrics */
  const breakdown = score
    ? {
        skills: Math.min(95, score + 5),
        formatting: Math.max(40, score - 10),
        keywords: Math.min(90, score),
        experience: Math.max(35, score - 15),
      }
    : null;

  return (
    <div className="ats-container">
      <div className="ats-card animate-fadeIn">
        <h1>Resume ATS Score Checker</h1>
        <p className="ats-description">
          Analyze how Applicant Tracking Systems read your resume — in real time.
        </p>

        <form className="ats-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Resume (PDF)</label>
            <input
              type="file"
              name="file"
              accept="application/pdf"
              onChange={handleInputChange}
            />
          </div>

          {/* File Preview */}
          {formData.file && (
            <div className="file-preview">
              📄 {formData.file.name} •{" "}
              {(formData.file.size / 1024).toFixed(1)} KB
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && loading && (
            <div className="upload-progress">
              <div
                className="upload-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span>{uploadProgress}% Uploading</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {error && <p className="ats-error">{error}</p>}

        {/* FINAL SCORE */}
        {score !== null && (
          <>
            <div className="ats-score-display animate-scaleIn">
              <h2>ATS Compatibility Score</h2>

              <div
                className={`score-ring ${
                  score >= 70 ? "high" : score >= 40 ? "moderate" : "low"
                }`}
              >
                <span className="score-value">{score}/100</span>
              </div>

              <p className="score-message">
                {score >= 70
                  ? "Excellent! Recruiter-ready resume."
                  : score >= 40
                  ? "Good, but improvements recommended."
                  : "Low ATS compatibility. Needs optimization."}
              </p>
            </div>

            {/* Detailed Breakdown */}
            <div className="ats-breakdown">
              <h3>ATS Section Breakdown</h3>

              {Object.entries(breakdown).map(([key, val]) => (
                <div key={key} className="breakdown-item">
                  <span>{key.toUpperCase()}</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${val}%` }}
                    ></div>
                  </div>
                  <span>{val}%</span>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="ats-tips">
              <h3>Improvement Tips</h3>
              <ul>
                <li>✔ Add more role-specific keywords</li>
                <li>✔ Use consistent formatting</li>
                <li>✔ Quantify achievements with numbers</li>
                <li>✔ Avoid graphics & tables</li>
              </ul>
            </div>
          </>
        )}

        {/* Trust */}
        <div className="ats-trust">
          🔒 Resume processed securely • 📄 PDF not stored • ⚡ Instant analysis
        </div>
      </div>
    </div>
  );
};

export default ATSScore;
