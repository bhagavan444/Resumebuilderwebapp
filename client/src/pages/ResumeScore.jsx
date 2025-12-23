// src/pages/ResumeScore.jsx

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./ResumeScore.css"; // Update your CSS accordingly for new elements

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ResumeScore = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobDescription, setJobDescription] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState("#667eea");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [breakdown, setBreakdown] = useState(null);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [parsedText, setParsedText] = useState("");
  const reportRef = useRef(null);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("atsHistory")) || [];
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("atsHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
  }, [darkMode]);

  // Handle file selection (drag/drop or click)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file only.");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
    setScore(null); // Reset previous score
  };

  // Drag & Drop support
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Main Analyze Function (Real-time with JD)
  const analyzeResume = async () => {
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);
    setScore(null);
    setBreakdown(null);
    setMatchedKeywords([]);
    setMissingKeywords([]);
    setSuggestions([]);
    setParsedText("");

    const formData = new FormData();
    formData.append("resume", file);
    if (jobDescription) formData.append("jobDescription", jobDescription); // Send JD to backend if supported

    try {
      const response = await axios.post(
        "http://localhost:5000/api/score",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            }
          },
        }
      );

      // Backend returns { score: 85, breakdown: {...}, matchedKeywords: [...], missingKeywords: [...], suggestions: [...], parsedText: "..." }
      // For now, simulate advanced data if backend doesn't provide
      const data = response.data;
      const backendScore = data.score;

      // Simulate advanced features (replace with backend data when available)
      const simBreakdown = {
        skills: Math.min(100, backendScore + Math.floor(Math.random() * 10) - 5),
        formatting: Math.max(0, backendScore - Math.floor(Math.random() * 15)),
        keywords: Math.min(100, backendScore + Math.floor(Math.random() * 5)),
        experience: Math.max(0, backendScore - Math.floor(Math.random() * 10)),
      };
      const simMatched = ["React", "JavaScript", "Node.js", "MongoDB", "Express"];
      const simMissing = ["TypeScript", "Docker", "Kubernetes", "AWS"];
      const simSuggestions = [
        "Add more quantifiable achievements.",
        "Incorporate job-specific keywords.",
        "Use consistent formatting.",
        "Avoid tables and graphics in PDF.",
        "Optimize for ATS by using standard fonts.",
      ];
      const simParsed = "Extracted resume text here... (simulate from backend)";

      setScore(backendScore);
      setBreakdown(simBreakdown);
      setMatchedKeywords(simMatched);
      setMissingKeywords(simMissing);
      setSuggestions(simSuggestions);
      setParsedText(simParsed);
      setUploadProgress(100);

      // Update history
      setHistory((prev) => [
        { date: new Date().toLocaleString(), score: backendScore, fileName },
        ...prev.slice(0, 9),
      ]);

      alert(`Analysis complete! ATS Score: ${backendScore}/100`);
    } catch (err) {
      console.error("Analysis failed:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze resume. Is the backend running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Auto-reanalyze when JD changes (real-time feel)
  useEffect(() => {
    if (file && jobDescription) {
      const timer = setTimeout(analyzeResume, 1000); // Debounce
      return () => clearTimeout(timer);
    }
  }, [jobDescription]);

  // Export Report to PDF
  const exportToPDF = async () => {
    const pdf = new jsPDF();
    const content = reportRef.current;
    if (content) {
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("ATS_Resume_Report.pdf");
    }
  };

  // Clear everything
  const clearAll = () => {
    setFile(null);
    setFileName("");
    setScore(null);
    setError("");
    setUploadProgress(0);
    setJobDescription("");
    setBreakdown(null);
    setMatchedKeywords([]);
    setMissingKeywords([]);
    setSuggestions([]);
    setParsedText("");
  };

  return (
    <div className={`resume-score-root ${darkMode ? "dark" : ""}`} style={{ fontFamily: `${fontFamily}, sans-serif` }}>
      <div className="resume-score-card" ref={reportRef}>
        <div className="header-controls">
          <h1>ATS Resume Score Analyzer</h1>
          <div className="controls">
            <label>Theme:</label>
            <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
            <label>Font:</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option>Inter</option>
              <option>Arial</option>
              <option>Times New Roman</option>
            </select>
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
        <p className="lead">
          Upload your resume (PDF) and optionally add a job description for real-time tailored ATS analysis.
        </p>

        {/* Drag & Drop Zone */}
        <div
          className={`dropzone ${file ? "has-file" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("file-input").click()}
          role="button"
          tabIndex={0}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div className="dz-content">
            {fileName ? (
              <>
                <strong>📄 {fileName}</strong>
                <p>Click to change or drag a new file</p>
              </>
            ) : (
              <>
                <strong>Click here or drag & drop your resume</strong>
                <p>PDF files only</p>
              </>
            )}
          </div>
        </div>

        {/* Job Description Input */}
        <div className="jd-section">
          <label>Job Description (for tailored analysis):</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            rows={4}
          />
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%`, backgroundColor: themeColor }}
              />
            </div>
            <span>{uploadProgress}% {uploadProgress < 100 ? "Uploading..." : "Processing..."}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="button-group">
          <button
            onClick={analyzeResume}
            disabled={loading || !file}
            className="analyze-btn"
            style={{ backgroundColor: themeColor }}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
          <button onClick={clearAll} className="clear-btn" disabled={loading}>
            Clear
          </button>
          {score !== null && <button onClick={exportToPDF} className="export-btn">Export PDF</button>}
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Result */}
        {score !== null && !loading && (
          <div className="result-section">
            <h2>Your ATS Score</h2>
            <div
              className={`score-circle ${
                score >= 80 ? "high" : score >= 60 ? "medium" : "low"
              }`}
              style={{ borderColor: themeColor }}
            >
              <span className="score-number">{score}</span>
              <span className="score-total">/100</span>
            </div>
            <p className="score-feedback">
              {score >= 80
                ? "🎉 Excellent! Your resume is highly ATS-friendly."
                : score >= 60
                ? "👍 Good, but there's room for improvement."
                : "⚠️ Needs work to pass most ATS filters."}
            </p>

            {/* Breakdown Visualization */}
            {breakdown && (
              <div className="visualization">
                <h3>Score Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(breakdown).map(([key, value]) => ({ name: key, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(breakdown).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Keyword Visualization */}
            <div className="visualization">
              <h3>Keyword Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "Matched", value: matchedKeywords.length },
                    { name: "Missing", value: missingKeywords.length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={themeColor} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Keywords Lists */}
            <div className="keywords-section">
              <h3>Matched Keywords</h3>
              <ul>{matchedKeywords.map((kw, idx) => <li key={idx}>{kw}</li>)}</ul>
              <h3>Missing Keywords</h3>
              <ul>{missingKeywords.map((kw, idx) => <li key={idx}>{kw}</li>)}</ul>
            </div>

            {/* Suggestions */}
            <div className="suggestions-section">
              <h3>Improvement Suggestions</h3>
              <ul>{suggestions.map((sug, idx) => <li key={idx}>{sug}</li>)}</ul>
            </div>

            {/* Parsed Text Preview */}
            <div className="parsed-section">
              <h3>Parsed Resume Text (Preview)</h3>
              <p>{parsedText.substring(0, 500)}...</p>
            </div>

            {/* Score History */}
            <div className="history-section">
              <h3>Analysis History</h3>
              <ul>
                {history.map((entry, idx) => (
                  <li key={idx}>
                    {entry.date} - {entry.fileName} - Score: {entry.score}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScore;