import React, { useState } from "react";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setScore(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://localhost:5000/api/score", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unknown error");
      }

      if (data.score !== undefined) {
        setScore(data.score);
      } else {
        setError("Score not found in API response.");
      }
    } catch (err) {
      setError("Upload failed: " + err.message);
      console.error("Upload Error:", err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h2>Upload Resume for ATS Score</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginTop: "10px" }}>
        Upload & Get Score
      </button>

      {score !== null && <p style={{ marginTop: "15px" }}>🎯 Your Resume Score: <strong>{score}</strong></p>}
      {error && <p style={{ color: "red", marginTop: "15px" }}>⚠️ {error}</p>}
    </div>
  );
}

export default ResumeUpload;
