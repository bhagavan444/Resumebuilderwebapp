// src/pages/AdminDashboard.jsx

import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "./AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Hardcoded Admin Credentials (Main Super Admin)
const SUPER_ADMIN_EMAIL = "bhagavan@admin";
const SUPER_ADMIN_PASSWORD = "bhagavan";

// LocalStorage key to store authorized admins
const AUTHORIZED_ADMINS_KEY = "authorizedAdmins";

const AdminDashboard = ({ apiBase = "http://localhost:5000/api" }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { email, isSuper: true/false }
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [scores, setScores] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("adminDark") === "true");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [detailModal, setDetailModal] = useState(null);
  const [info, setInfo] = useState(null);

  const socketRef = useRef(null);
  const infoTimer = useRef(null);

  // Load authorized admins from localStorage
  const getAuthorizedAdmins = () => {
    const stored = localStorage.getItem(AUTHORIZED_ADMINS_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  // Save authorized admins to localStorage
  const saveAuthorizedAdmins = (admins) => {
    localStorage.setItem(AUTHORIZED_ADMINS_KEY, JSON.stringify(admins));
  };

  // Check if user is authorized
  const isUserAuthorized = (email) => {
    if (email === SUPER_ADMIN_EMAIL) return true;
    const authorized = getAuthorizedAdmins();
    return authorized.includes(email);
  };

  // Admin Login
  const handleLogin = (e) => {
    e.preventDefault();

    // Super Admin login (with password)
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setCurrentUser({ email: SUPER_ADMIN_EMAIL, isSuper: true });
      setLoginError("");
      addNotification("success", "Welcome back, Supreme Bhagavan! 👑");
      return;
    }

    // Regular authorized admin login (no password needed after authorization)
    if (isUserAuthorized(email) && password === "") {
      setIsAuthenticated(true);
      setCurrentUser({ email, isSuper: false });
      setLoginError("");
      addNotification("success", `Welcome, Admin ${email}! ✅`);
      return;
    }

    setLoginError("Invalid credentials or not authorized.");
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    addNotification("info", "Logged out successfully.");
  };

  // Super Admin: Grant access to another person
  const grantAdminAccess = () => {
    const newEmail = prompt("Enter the email address to grant admin access:");
    if (!newEmail || !newEmail.includes("@")) {
      alert("Invalid email.");
      return;
    }

    const authorized = getAuthorizedAdmins();
    if (authorized.includes(newEmail)) {
      alert("This user already has admin access.");
      return;
    }

    if (newEmail === SUPER_ADMIN_EMAIL) {
      alert("Super admin already has full access.");
      return;
    }

    authorized.push(newEmail);
    saveAuthorizedAdmins(authorized);
    addNotification("success", `Admin access granted to ${newEmail} 🎉`);
  };

  // Super Admin: Revoke access
  const revokeAdminAccess = () => {
    const authorized = getAuthorizedAdmins();
    if (authorized.length === 0) {
      alert("No sub-admins to revoke.");
      return;
    }

    const emailToRevoke = prompt(`Enter email to revoke access:\nAvailable: ${authorized.join(", ")}`);
    if (!emailToRevoke) return;

    const updated = authorized.filter(e => e !== emailToRevoke);
    saveAuthorizedAdmins(updated);
    addNotification("warning", `Admin access revoked for ${emailToRevoke}`);
  };

  // Add notification
  const addNotification = (type, message) => {
    const notif = { id: Date.now(), type, message, time: new Date().toLocaleTimeString() };
    setNotifications(prev => [notif, ...prev.slice(0, 9)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 6000);
  };

  const showInfo = (type, message) => {
    setInfo({ type, message });
    clearTimeout(infoTimer.current);
    infoTimer.current = setTimeout(() => setInfo(null), 4000);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to Socket.IO for real-time
    socketRef.current = io("http://localhost:5000", { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("Admin connected to real-time server");
      addNotification("success", "Real-time sync active ⚡");
    });

    socketRef.current.on("new-score", (newScore) => {
      setScores(prev => [newScore, ...prev.filter(s => s._id !== newScore._id)]);
      addNotification("info", `New resume analyzed: ${newScore.filename} → Score: ${newScore.score}`);
    });

    socketRef.current.on("score-deleted", (id) => {
      setScores(prev => prev.filter(s => s._id !== id));
      addNotification("warning", "A resume analysis was deleted");
    });

    fetchAll();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isAuthenticated]);

  const fetchAll = async () => {
    try {
      const [scoreRes, userRes, tempRes] = await Promise.all([
        axios.get(`${apiBase}/score/all`),
        axios.get(`${apiBase}/users`),
        axios.get(`${apiBase}/templates`),
      ]);

      setScores(scoreRes.data || []);
      setUsers(userRes.data || []);
      setTemplates(tempRes.data || []);
    } catch (err) {
      showInfo("error", "Failed to load data");
    }
  };

  const handleDeleteScore = async (id) => {
    if (!confirm("Delete this analysis?")) return;
    setScores(prev => prev.filter(s => s._id !== id));
    try {
      await axios.delete(`${apiBase}/score/${id}`);
      showInfo("success", "Deleted");
    } catch {
      fetchAll();
      showInfo("error", "Delete failed");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>🔐 Admin Access</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={email === SUPER_ADMIN_EMAIL ? "Password (required)" : "Password (leave empty if authorized)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login as Admin</button>
          </form>
          {loginError && <p className="error">{loginError}</p>}
          <small>
            Super Admin: bhagavan@admin / bhagavan<br />
            Authorized admins: Enter email only (no password needed)
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${darkMode ? "dark" : ""}`}>
      {/* Real-time Notifications */}
      <div className="notifications">
        {notifications.map(notif => (
          <div key={notif.id} className={`notif ${notif.type}`}>
            <span>{notif.type === "success" ? "✓" : notif.type === "error" ? "✗" : "ℹ"}</span>
            {notif.message}
            <small>{notif.time}</small>
          </div>
        ))}
      </div>

      <aside className="admin-sidebar">
        <div className="admin-profile">
          <div className="avatar">👑</div>
          <h3>{currentUser?.isSuper ? "Bhagavan" : currentUser?.email.split("@")[0]}</h3>
          <p>{currentUser?.isSuper ? "Supreme Admin" : "Admin"}</p>
          {currentUser?.isSuper && <span className="super-badge">Super</span>}
        </div>
        <nav>
          <button onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}>
            📊 Dashboard
          </button>
          <button onClick={() => setActiveTab("resumes")} className={activeTab === "resumes" ? "active" : ""}>
            📁 Resumes ({scores.length})
          </button>
          <button onClick={() => setActiveTab("users")} className={activeTab === "users" ? "active" : ""}>
            👥 Users ({users.length})
          </button>
          <button onClick={() => setActiveTab("analytics")} className={activeTab === "analytics" ? "active" : ""}>
            📈 Analytics
          </button>
        </nav>

        {/* Admin Management (Only for Super Admin) */}
        {currentUser?.isSuper && (
          <div className="admin-management">
            <h4>Admin Management</h4>
            <button onClick={grantAdminAccess} className="grant-btn">
              ➕ Grant Admin Access
            </button>
            <button onClick={revokeAdminAccess} className="revoke-btn">
              ➖ Revoke Access
            </button>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Welcome back, {currentUser?.isSuper ? "Bhagavan 👑" : currentUser?.email}!</h1>
          <div className="header-controls">
            <span className="live-indicator">● Live</span>
            <button onClick={() => setDarkMode(d => {
              localStorage.setItem("adminDark", !d);
              return !d;
            })}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {info && <div className={`info-banner ${info.type}`}>{info.message}</div>}

        {/* Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="stats-grid">
            <div className="stat-card big">
              <h3>Total Resumes</h3>
              <p className="number">{scores.length}</p>
            </div>
            <div className="stat-card big">
              <h3>Active Users</h3>
              <p className="number">{users.length}</p>
            </div>
            <div className="stat-card big">
              <h3>Avg ATS Score</h3>
              <p className="number">
                {scores.length ? (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(1) : 0}
              </p>
            </div>
            <div className="stat-card big">
              <h3>Today</h3>
              <p className="number">
                {scores.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        )}

        {/* Resumes Table */}
        {activeTab === "resumes" && (
          <div className="table-section">
            <h2>Recent Resume Analyses</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scores.slice(0, 10).map(s => (
                  <tr key={s._id}>
                    <td>{s.filename}</td>
                    <td>{s.email || "Anonymous"}</td>
                    <td>
                      <span className={`score-badge ${s.score >= 80 ? "high" : s.score >= 60 ? "medium" : "low"}`}>
                        {s.score}
                      </span>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>
                      <button onClick={() => setDetailModal(s)}>View</button>
                      <button className="delete" onClick={() => handleDeleteScore(s._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Score Distribution</h3>
              <Bar data={{
                labels: ["0-40", "41-60", "61-80", "81-100"],
                datasets: [{
                  label: "Resumes",
                  data: [
                    scores.filter(s => s.score <= 40).length,
                    scores.filter(s => s.score > 40 && s.score <= 60).length,
                    scores.filter(s => s.score > 60 && s.score <= 80).length,
                    scores.filter(s => s.score > 80).length,
                  ],
                  backgroundColor: "#6366f1"
                }]
              }} />
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {detailModal && (
        <div className="modal-backdrop" onClick={() => setDetailModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{detailModal.filename}</h3>
            <p><strong>Score:</strong> {detailModal.score}/100</p>
            <p><strong>Email:</strong> {detailModal.email || "Anonymous"}</p>
            <p><strong>Date:</strong> {new Date(detailModal.createdAt).toLocaleString()}</p>
            <button onClick={() => setDetailModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;