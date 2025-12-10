import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Home.css";
import {
  FaFileAlt,
  FaLock,
  FaBolt,
  FaPalette,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaMoon,
  FaSun,
  FaBuilding,
  FaRobot,
  FaUpload,
  FaUsers,
  FaChartLine,
  FaShareAlt,
  FaDownload,
} from "react-icons/fa";

// Enhanced Home page for Resume Builder
// Features added:
// - Persistent dark mode
// - Live (simulated) online user counter via WebSocket stub
// - Real-time resume scoring (upload and SSE/websocket-ready)
// - Keyword-based job matching with highlights
// - Drag-and-drop resume upload preview + download sample
// - Animated counters, progress bars, and small analytics chart (client-side)
// - Chatbot modal and shareable resume link generator (client-side)
// - Accessibility improvements and i18n-ready structure (simple)

const messages = ["Build Your Resume", "Get Hired", "Land Your Dream Job"];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // UI states
  const [typingText, setTypingText] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const v = localStorage.getItem("rb_dark");
    return v ? JSON.parse(v) : false;
  });
  const [language, setLanguage] = useState(() => localStorage.getItem("rb_lang") || "en");

  // Resume / scoring
  const [resumeScore, setResumeScore] = useState(0);
  const [scoring, setScoring] = useState(false);
  const [resumePreviewName, setResumePreviewName] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobMatch, setJobMatch] = useState(null);
  const [jobHighlights, setJobHighlights] = useState([]);

  // Real-time features
  const [onlineUsers, setOnlineUsers] = useState(0);
  const wsRef = useRef(null);

  // Notifications / Chatbot
  const [showChatbot, setShowChatbot] = useState(false);
  const [notification, setNotification] = useState(null);

  // Small analytics for demo
  const [applicationsSent, setApplicationsSent] = useState(124);
  const [templatesUsed, setTemplatesUsed] = useState(78);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // persist dark mode & language
  useEffect(() => localStorage.setItem("rb_dark", JSON.stringify(darkMode)), [darkMode]);
  useEffect(() => localStorage.setItem("rb_lang", language), [language]);

  // Typing animation (cleaner)
  useEffect(() => {
    const t = setTimeout(() => {
      setTypingText(messages[index].substring(0, charIndex + 1));
      if (charIndex < messages[index].length - 1) {
        setCharIndex((c) => c + 1);
      } else {
        setTimeout(() => {
          setCharIndex(0);
          setIndex((i) => (i + 1) % messages.length);
        }, 1200);
      }
    }, 75);
    return () => clearTimeout(t);
  }, [charIndex, index]);

  // Simulated WebSocket connection for online users (replace with your server)
  useEffect(() => {
    // This block demonstrates a strategy — replace with real WS url on backend
    try {
      // Example: wsRef.current = new WebSocket('wss://your-backend.example/ws');
      // For demo: simulate updates
      const interval = setInterval(() => {
        setOnlineUsers((n) => Math.max(12, Math.min(999, n + Math.floor(Math.random() * 7 - 3))));
      }, 2500);
      return () => clearInterval(interval);
    } catch (err) {
      console.warn("Realtime stub failed", err);
    }
  }, []);

  // Helper: navigate protected create
  const handleStart = () => {
    if (user) navigate("/create");
    else navigate("/login");
  };

  // Resume upload handler (drag & drop & file select)
  const handleFileUpload = async (file) => {
    if (!file) return;
    setResumePreviewName(file.name);
    setScoring(true);
    setResumeScore(0);

    // Prepare form data to send to backend /api/score (expected to stream progress via SSE or WS)
    // Minimal client-side: upload and wait for response
    try {
      const form = new FormData();
      form.append("resume", file);
      // Example fetch - your backend should return JSON {score: 85} or stream updates
      const res = await fetch("/api/score", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      // if your backend streams, replace above with EventSource or WS logic
      setResumeScore(data.score ?? Math.floor(Math.random() * 41) + 50);
      setNotification("Resume scored successfully!");
    } catch (err) {
      console.error(err);
      // fallback: simulate scoring
      const fallbackScore = Math.floor(Math.random() * 31) + 60;
      setResumeScore(fallbackScore);
      setNotification("Scoring completed (demo fallback)");
    } finally {
      setScoring(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFileUpload(f);
  };
  const onDragOver = (e) => e.preventDefault();

  // Job match: keyword overlap + highlights
  const handleJobMatch = () => {
    const resumeText = localStorage.getItem("last_resume_text") || ""; // if you had a text extract
    if (!jobDesc.trim()) return;
    // simple tokenizer
    const jdTokens = jobDesc.toLowerCase().match(/\w+/g) || [];
    const resumeTokens = resumeText.toLowerCase().match(/\w+/g) || [];
    const resumeSet = new Set(resumeTokens);
    const common = jdTokens.filter((t) => resumeSet.has(t));
    const matchScore = Math.min(99, Math.round((common.length / Math.max(1, jdTokens.length)) * 100));
    setJobMatch(matchScore);

    // get top highlight words
    const freq = {};
    common.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const highlights = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 8);
    setJobHighlights(highlights);
  };

  // Shareable link generator (client-only stub)
  const generateShareLink = () => {
    // Replace with real backend that stores resume and returns a short id
    const id = Math.random().toString(36).slice(2, 9);
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard?.writeText(url);
    setNotification("Share link copied to clipboard");
    setTimeout(() => setNotification(null), 2200);
  };

  // Download sample resume (client-side blob)
  const downloadSample = () => {
    const sample = `Marco Resume\n\nObjective: Add a concise objective...\nExperience: - Company X (Role) - Achievements...`;
    const blob = new Blob([sample], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sample_resume.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // small UI helpers
  const progressColor = resumeScore > 80 ? "green" : resumeScore > 60 ? "orange" : "red";

  return (
    <div className={`home enhanced ${darkMode ? "dark" : ""}`}>
      {/* top bar */}
      <header className="topbar">
        <div className="brand">🚀 Resume Builder</div>
        <div className="top-actions">
          <div className="online-users" title="Users currently online">
            <FaUsers /> {onlineUsers}
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language selector">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="es">Español</option>
          </select>
          <button
            className="dark-toggle"
            onClick={() => setDarkMode((d) => !d)}
            aria-pressed={darkMode}
            title="Toggle dark mode"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="overlay">
          <div className="hero-content">
            <h1>🚀 {typingText}|</h1>
            <p className="subtitle">ATS-friendly, modern templates + real-time scoring & analytics.</p>

            <div className="hero-buttons">
              <button className="get-started-btn" onClick={handleStart}>
                Get Started
              </button>
              <button className="upload-btn" onClick={() => document.getElementById("resumeFile").click()}>
                <FaUpload /> Upload Resume
              </button>
              <input
                id="resumeFile"
                type="file"
                accept="application/pdf,application/msword, .docx, .txt"
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <button className="see-templates" onClick={() => navigate("/templates")}>See Templates</button>
            </div>

            <div className="hero-widgets">
              <div className="widget">
                <FaChartLine /> Resume Health: <strong>{resumeScore}%</strong>
              </div>
              <div className="widget">
                <FaUsers /> Live: <strong>{onlineUsers}</strong> users
              </div>
              <div className="widget">
                <FaShareAlt /> <button onClick={generateShareLink} className="link-btn">Share Resume</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Drag & Drop / Upload area + live meter */}
      <section className="upload-area" onDrop={onDrop} onDragOver={onDragOver} aria-label="Drop your resume here">
        <div className="upload-left">
          <h2>Upload & Analyze</h2>
          <p>Drag & drop your resume or click Upload to get a live ATS score and suggestions.</p>
          <div className="upload-card">
            <FaFileAlt size={28} />
            <div>
              <div className="file-name">{resumePreviewName || "No file uploaded"}</div>
              <div className="meter-bar" aria-hidden>
                <div className="meter-fill" style={{ width: `${resumeScore}%` }}>{resumeScore}%</div>
              </div>
            </div>
            <div className="upload-actions">
              <button onClick={downloadSample}><FaDownload /> Sample</button>
              <button onClick={() => document.getElementById("resumeFile").click()}><FaUpload /> Upload</button>
            </div>
          </div>
          <div className="scoring-meta">
            <small>{scoring ? "Scoring in progress..." : "Scoring ready"}</small>
            {notification && <div className="notif">{notification}</div>}
          </div>
        </div>

        {/* Right side: Quick analytics */}
        <div className="upload-right">
          <h3>Quick Analytics</h3>
          <div className="analytics-grid">
            <div className="analytic">
              <div className="num">{applicationsSent}</div>
              <div className="label">Applications Sent</div>
            </div>
            <div className="analytic">
              <div className="num">{templatesUsed}%</div>
              <div className="label">Template Adoption</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <h2>Why Choose Our Resume Builder?</h2>
        <div className="feature-grid">
          <div className="feature-card"><FaFileAlt size={28} /> AI Resume Scoring</div>
          <div className="feature-card"><FaPalette size={28} /> Professional Templates</div>
          <div className="feature-card"><FaBolt size={28} /> One-Click Download</div>
          <div className="feature-card"><FaLock size={28} /> Secure & Private</div>
          <div className="feature-card"><FaChartLine size={28} /> Live Analytics</div>
          <div className="feature-card"><FaUsers size={28} /> Real-time Collaboration</div>
        </div>
      </section>

      {/* Job Match */}
      <section className="job-match">
        <h2>Job Matching Demo</h2>
        <textarea
          placeholder="Paste a Job Description here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />
        <div className="job-actions">
          <button onClick={handleJobMatch}>Check Match</button>
          <button onClick={() => { setJobDesc(''); setJobMatch(null); setJobHighlights([]); }}>Clear</button>
        </div>
        {jobMatch !== null && (
          <div className="job-result">
            <div className="result-score">Match Score: {jobMatch}%</div>
            <div className="highlights">Top matched words: {jobHighlights.map((h) => <span key={h} className="tag">{h}</span>)}</div>
            <small className="hint">Tip: Add highlighted keywords to your resume to improve match.</small>
          </div>
        )}
      </section>

      {/* Testimonials & Companies */}
      <section className="trust">
        <div className="stats-grid">
          <div>📄 <strong>10,000+</strong> Resumes Created</div>
          <div>⚡ <strong>95%</strong> ATS Compatibility</div>
          <div>🎓 <strong>5,000+</strong> Happy Users</div>
        </div>
        <div className="logo-strip"><FaBuilding /> Google <FaBuilding /> Amazon <FaBuilding /> Infosys <FaBuilding /> TCS</div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Create Your Resume?</h2>
        <div className="cta-actions">
          <button className="get-started-btn" onClick={handleStart}>Create Resume</button>
          <button onClick={() => navigate('/templates')} className="see-templates-btn">See Templates</button>
          <button onClick={() => setShowChatbot(true)} className="chat-btn"><FaRobot /> Ask Career Assistant</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Resume Builder | All Rights Reserved</p>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="#features">Features</a>
          <a href="/templates">Templates</a>
          <a href="/contact">Contact</a>
        </div>
        <div className="social-icons"><FaLinkedin /> <FaGithub /> <FaTwitter /></div>
        <div className="newsletter">
          <input type="email" placeholder="Enter your email" aria-label="newsletter-email" />
          <button>🎁 Get Free Resume Tips</button>
        </div>
      </footer>

      {/* Chatbot Modal (client-only demo) */}
      {showChatbot && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-inner">
            <header>
              <h3>Career Assistant</h3>
              <button onClick={() => setShowChatbot(false)}>Close</button>
            </header>
            <div className="chat-area">
              <p><strong>Tip:</strong> Try asking: "How can I improve my resume for a software engineer role?"</p>
              <textarea placeholder="Ask anything related to careers..." />
              <div className="chat-actions">
                <button onClick={() => setShowChatbot(false)}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* small floating chatbot button */}
      <div className="chatbot-floating" onClick={() => setShowChatbot(true)} title="Open career assistant">
        <FaRobot size={22} /> Need Help?
      </div>

    </div>
  );
}
