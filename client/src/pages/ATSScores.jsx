import React, { useState } from "react";
import axios from "axios";
import "./ATSScores.css";

const AtsScore = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    file: null,
  });
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (name === "file") {
      setScore(null);
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.file) return "Please select a PDF file.";
    if (!formData.email) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Please enter a valid email.";
    if (!formData.phone) return "Please enter your phone number.";
    if (!/^\+?\d{10,12}$/.test(formData.phone)) return "Please enter a valid phone number.";
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
      const response = await axios.post("http://localhost:5000/api/score", data);
      setScore(response.data.score);
    } catch (err) {
      setError("Failed to process resume. Please try again later.");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ats-container">
      <div className="ats-card animate-fadeIn">
        <h1>Resume ATS Score Checker</h1>
        <p className="ats-description">
          Discover how well your resume performs with Applicant Tracking Systems (ATS) in a few simple steps.
        </p>

        <form className="ats-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              aria-invalid={error.includes("email") ? "true" : "false"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
              aria-invalid={error.includes("phone") ? "true" : "false"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="resume">Resume (PDF)</label>
            <input
              type="file"
              id="resume"
              name="file"
              accept="application/pdf"
              onChange={handleInputChange}
              required
              aria-invalid={error.includes("file") ? "true" : "false"}
            />
          </div>
          <button
            type="button"
            onClick={handleUpload}
            className="submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              "Analyze Resume"
            )}
          </button>
        </form>

        {error && (
          <p className="ats-error" role="alert">
            {error}
          </p>
        )}

        {score !== null && (
          <div className="ats-score-display animate-scaleIn">
            <h2>Your ATS Compatibility Score</h2>
            <div className={`score-ring ${score >= 70 ? "high" : score >= 40 ? "moderate" : "low"}`}>
              <svg className="progress-ring" width="120" height="120">
                <circle
                  className="progress-ring-bg"
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  className="progress-ring-fill"
                  cx="60"
                  cy="60"
                  r="54"
                  stroke={score >= 70 ? "#16a34a" : score >= 40 ? "#f59e0b" : "#dc2626"}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="339.292"
                  strokeDashoffset={339.292 * (1 - score / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="score-value">{score}/100</span>
            </div>
            <p className="score-message">
              {score >= 70
                ? "Excellent! Your resume is highly optimized for ATS."
                : score >= 40
                ? "Good effort! Some tweaks can boost your ATS compatibility."
                : "Needs improvement. Optimize your resume for better ATS performance."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSScore;