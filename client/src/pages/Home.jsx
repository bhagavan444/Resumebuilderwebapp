import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Home.css";
import {
  FaFileAlt, FaLock, FaBolt, FaPalette, FaLinkedin, FaGithub, FaTwitter,
  FaMoon, FaSun, FaBuilding, FaRobot, FaUpload, FaUsers, FaChartLine,
  FaShareAlt, FaDownload, FaUserTie, FaLayerGroup, FaCheckCircle
} from "react-icons/fa";

const messages = ["Build Your Resume", "Get Hired Faster", "Win ATS Screening"];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  /* ================= UI ================= */
  const [typingText, setTypingText] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem("rb_dark") || "false"));
  const [onlineUsers, setOnlineUsers] = useState(48);
  const [recruiterView, setRecruiterView] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false); // New: Login required popup

  /* ================= RESUME ================= */
  const [resumeScore, setResumeScore] = useState(0);
  const [resumePreviewName, setResumePreviewName] = useState("");
  const [resumeVersion, setResumeVersion] = useState("v1");
  const [targetRole, setTargetRole] = useState("");
  const [assistantTips, setAssistantTips] = useState([]);

  /* ================= JOB MATCH ================= */
  const [jobDesc, setJobDesc] = useState("");
  const [jobMatch, setJobMatch] = useState(null);
  const [jobHighlights, setJobHighlights] = useState([]);

  /* ================= CHAT ================= */
  const [showChatbot, setShowChatbot] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => localStorage.setItem("rb_dark", JSON.stringify(darkMode)), [darkMode]);

  /* ================= TYPING ================= */
  useEffect(() => {
    const t = setTimeout(() => {
      setTypingText(messages[index].substring(0, charIndex + 1));
      if (charIndex < messages[index].length - 1) setCharIndex(c => c + 1);
      else setTimeout(() => { setCharIndex(0); setIndex(i => (i + 1) % messages.length); }, 1200);
    }, 70);
    return () => clearTimeout(t);
  }, [charIndex, index]);

  /* ================= LIVE USERS ================= */
  useEffect(() => {
    const i = setInterval(() => {
      setOnlineUsers(n => Math.max(30, Math.min(300, n + Math.floor(Math.random() * 5 - 2))));
    }, 2500);
    return () => clearInterval(i);
  }, []);

  /* ================= PROTECTED ACTIONS ================= */
  const handleProtectedAction = (callback) => {
    if (user) {
      callback();
    } else {
      setShowLoginAlert(true);
    }
  };

  const handleStart = () => handleProtectedAction(() => navigate("/create"));

  const handleAnalyze = () => handleProtectedAction(() => {
    const score = Math.floor(Math.random() * 25) + 70;
    setResumeScore(score);
    setAssistantTips([
      "Add quantified achievements (numbers)",
      "Include role-specific keywords",
      "Strengthen action verbs in experience section"
    ]);
  });

  const handleJobMatch = () => {
    if (!jobDesc.trim()) return;
    handleProtectedAction(() => {
      const score = Math.floor(Math.random() * 30) + 60;
      setJobMatch(score);
      setJobHighlights(["React", "Node", "REST", "MongoDB"]);
    });
  };

  const goToLogin = () => {
    setShowLoginAlert(false);
    navigate("/login");
  };

  const closeAlert = () => setShowLoginAlert(false);

  /* ================= UI ================= */
  return (
    <div className={`home enhanced ${darkMode ? "dark" : ""} ${recruiterView ? "recruiter-view" : ""}`}>

      {/* TOP BAR */}
      <header className="topbar">
        <div className="brand">🚀 ResumeBuilder</div>
        <div className="top-actions">
          <span><FaUsers /> {onlineUsers}</span>
          <button onClick={() => setRecruiterView(v => !v)}>
            <FaUserTie /> Recruiter View
          </button>
          <button onClick={() => setDarkMode(d => !d)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>{typingText}<span>|</span></h1>
        <p className="subtitle">Enterprise ATS resumes inspired by real hiring workflows</p>

        <select value={targetRole} onChange={e => setTargetRole(e.target.value)}>
          <option value="">Select Target Role</option>
          <option>Software Engineer</option>
          <option>AI Engineer</option>
          <option>Data Analyst</option>
          <option>Product Intern</option>
        </select>

        <div className="hero-buttons">
          <button className="get-started-btn" onClick={handleStart}>Create Resume</button>
          <button onClick={handleAnalyze}><FaChartLine /> Analyze</button>
        </div>

        <div className="hero-widgets">
          <div><FaCheckCircle /> ATS Score: {resumeScore}%</div>
          <div><FaLayerGroup /> Version: {resumeVersion}</div>
        </div>
      </section>

      {/* SMART ASSISTANT */}
      <section className="assistant-panel">
        <h3>🧠 Smart Resume Assistant</h3>
        {assistantTips.length === 0
          ? <p>Analyze your resume to get AI-driven suggestions.</p>
          : <ul>{assistantTips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        }
      </section>

      {/* JOB MATCH */}
      <section className="job-match">
        <h2>Job Match Analyzer</h2>
        <textarea
          placeholder="Paste job description here..."
          value={jobDesc}
          onChange={e => setJobDesc(e.target.value)}
        />
        <button onClick={handleJobMatch}>Check Match</button>

        {jobMatch && (
          <div className="job-result">
            <strong>Match Score: {jobMatch}%</strong>
            <div>{jobHighlights.map(h => <span key={h} className="tag">{h}</span>)}</div>
          </div>
        )}
      </section>

      {/* CAREER TRACKER */}
      <section className="tracker">
        <div><strong>12</strong><span>Resumes</span></div>
        <div><strong>84%</strong><span>Avg ATS</span></div>
        <div><strong>5</strong><span>Interviews</span></div>
      </section>

      {/* TRUST */}
      <section className="trust">
        <div>🔐 GDPR Ready</div>
        <div>🔒 Encrypted Data</div>
        <div>🏢 Hiring-grade Design</div>
        <div>⚡ Fast & Secure</div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Build a Resume Recruiters Actually Read</h2>
        <button onClick={handleStart}>Get Started</button>
        <button onClick={() => setShowChatbot(true)}>
          <FaRobot /> Career Assistant
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer-mnc">
        <div className="footer-grid">
          <div>
            <h4>ResumeBuilder™</h4>
            <p>ATS-optimized resumes for modern hiring</p>
          </div>
          <div>
            <h5>Product</h5>
            <a>Resume Builder</a>
            <a>ATS Checker</a>
            <a>Templates</a>
          </div>
          <div>
            <h5>Company</h5>
            <a>About</a>
            <a>Careers</a>
            <a>Contact</a>
          </div>
          <div>
            <h5>Resources</h5>
            <a>Resume Tips</a>
            <a>Privacy</a>
            <a>Terms</a>
          </div>
        </div>

        <div className="footer-bottom">
          © 2025 ResumeBuilder™ — Built for real hiring pipelines
          <div className="social">
            <FaLinkedin /> <FaGithub /> <FaTwitter />
          </div>
        </div>
      </footer>

      {/* CHATBOT */}
      {showChatbot && (
        <div className="modal">
          <div className="modal-inner">
            <h3>Career Assistant</h3>
            <textarea placeholder="Ask about resumes, ATS, careers…" />
            <button onClick={() => setShowChatbot(false)}>Close</button>
          </div>
        </div>
      )}

      {/* LOGIN REQUIRED ALERT (Same style as Navbar) */}
      {showLoginAlert && (
        <div className="login-alert-overlay" onClick={closeAlert}>
          <div className="login-alert" onClick={(e) => e.stopPropagation()}>
            <h3>🔒 Login Required</h3>
            <p>You need to log in to access this feature.</p>
            <div className="login-alert-buttons">
              <button onClick={closeAlert} className="btn-cancel">
                Cancel
              </button>
              <button onClick={goToLogin} className="btn-login-alert">
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}