import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import html2pdf from "html2pdf.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [atsScore, setAtsScore] = useState("Fetching...");
  const [scoreHistory, setScoreHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedResumes = JSON.parse(localStorage.getItem("resumes")) || [];
    setUser(storedUser);
    setResumes(storedResumes);

    axios.get("http://localhost:5000/api/score/latest").then((res) => {
      if (res.data?.score !== undefined) {
        setAtsScore(`${res.data.score}/100`);
      } else {
        setAtsScore("Not Available");
      }
    });

    axios.get("http://localhost:5000/api/score/all").then((res) => {
      const formatted = res.data.map((item) => ({
        name: new Date(item.createdAt).toLocaleDateString(),
        score: item.score,
      }));
      setScoreHistory(formatted.slice(-7));
    });

    // Fake notifications
    setNotifications([
      { id: 1, text: "New template released!", type: "info" },
      { id: 2, text: "Your last resume scored 85%.", type: "success" },
    ]);
  }, []);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [darkMode]);

  const viewResume = (resume) => {
    setSelectedResume(resume);
    setShowModal(true);
  };

  const downloadResume = (resume) => {
    const resumeContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${resume.title || "Resume"}</h2>
        <p><strong>Email:</strong> ${resume.email}</p>
        <p><strong>Phone:</strong> ${resume.phone || "N/A"}</p>
        <p><strong>Skills:</strong> ${resume.skills || "Not Provided"}</p>
      </div>
    `;
    html2pdf().from(resumeContent).save(`${resume.title || "resume"}.pdf`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👤 Welcome, {user?.name || "User"}</h1>
        <button onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* === Notifications === */}
      <div className="notifications">
        {notifications.map((note) => (
          <div key={note.id} className={`note ${note.type}`}>
            {note.text}
          </div>
        ))}
      </div>

      {/* === Stats Cards === */}
      <div className="dashboard-grid">
        <div className="card"><h3>📄 Resumes</h3><p>{resumes.length}</p></div>
        <div className="card"><h3>⭐ Best Score</h3><p>92%</p></div>
        <div className="card"><h3>📊 Latest Score</h3><p>{atsScore}</p></div>
        <div className="card"><h3>⬇ Downloads</h3><p>15</p></div>
      </div>

      {/* === ATS Score Trend === */}
      <div className="card chart-card">
        <h3>📈 Score Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#4f46e5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === Resume Management === */}
      <div className="card">
        <h3>📁 My Resumes</h3>
        {resumes.length === 0 ? (
          <p>No resumes yet.</p>
        ) : (
          <div className="resume-grid">
            {resumes.map((resume, i) => (
              <div key={i} className="resume-card">
                <h4>{resume.title || `Resume ${i + 1}`}</h4>
                <p>Email: {resume.email}</p>
                <p>Phone: {resume.phone}</p>
                <div className="resume-actions">
                  <button onClick={() => viewResume(resume)}>View</button>
                  <button onClick={() => downloadResume(resume)}>Download</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === Template Gallery === */}
      <div className="card">
        <h3>🎨 Resume Templates</h3>
        <div className="template-gallery">
          <div className="template">Classic</div>
          <div className="template">Modern</div>
          <div className="template">Creative</div>
        </div>
      </div>

      {/* === Career Suggestions === */}
      <div className="card">
        <h3>🎯 Career Suggestions</h3>
        <ul>
          <li>Missing keyword: ReactJS</li>
          <li>Add certification: AWS Practitioner</li>
          <li>Highlight leadership in projects</li>
        </ul>
      </div>

      {/* === Activity Timeline === */}
      <div className="card">
        <h3>📅 Activity Timeline</h3>
        <ul>
          <li>Uploaded Resume #2 – Yesterday</li>
          <li>Scored 85% – 2 days ago</li>
          <li>Signed up – 1 week ago</li>
        </ul>
      </div>

      {/* === Settings === */}
      <div className="card">
        <h3>⚙️ Settings</h3>
        <button>Update Profile</button>
        <button>Change Password</button>
        <button>Backup to Cloud</button>
      </div>

      {/* === MODAL === */}
      {showModal && selectedResume && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedResume.title || "Resume"}</h2>
            <p>Email: {selectedResume.email}</p>
            <p>Phone: {selectedResume.phone}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;