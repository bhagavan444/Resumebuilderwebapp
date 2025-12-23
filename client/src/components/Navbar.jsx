import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false); // Login required popup

  const navigate = useNavigate();

  // Sync Firebase + LocalStorage user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      const storedUser = localStorage.getItem("user");
      if (firebaseUser && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    });

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    return () => unsubscribe();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      setUser(null);
      setDropdownOpen(false);
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  // Handle click on protected links when not logged in
  const handleProtectedLink = (e) => {
    if (!user) {
      e.preventDefault();
      setShowLoginAlert(true);
      setMenuOpen(false); // Close mobile menu
    }
  };

  // Navigate to login from popup
  const goToLogin = () => {
    setShowLoginAlert(false);
    navigate("/login");
  };

  // Close popup only
  const closeAlert = () => setShowLoginAlert(false);

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div
          className="navbar__logo"
          onClick={() => {
            setMenuOpen(false);
            navigate("/");
          }}
        >
          Enhance CV
        </div>

        {/* Links - Always visible */}
        <ul className={`navbar__links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          </li>

          {/* Protected Links - Show always, block if not logged in */}
          <li>
            <Link
              to="/create"
              onClick={(e) => {
                setMenuOpen(false);
                if (!user) handleProtectedLink(e);
              }}
            >
              Creation
            </Link>
          </li>
          <li>
            <Link
              to="/preview"
              onClick={(e) => {
                setMenuOpen(false);
                if (!user) handleProtectedLink(e);
              }}
            >
              Preview
            </Link>
          </li>
          <li>
            <Link
              to="/score"
              onClick={(e) => {
                setMenuOpen(false);
                if (!user) handleProtectedLink(e);
              }}
            >
              ATS Score
            </Link>
          </li>

          {/* Admin Link - Only for specific email */}
          {user?.email === "g.sivasatyasaibhagavan@gmail.com" && (
            <li>
              <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
            </li>
          )}

          {/* Public Links */}
          <li>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          </li>
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Profile Dropdown */}
          <div className="navbar__profile">
            <div
              className="navbar__profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={
                  user?.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "Guest"
                  )}&background=random&size=40`
                }
                alt="Profile"
                className="navbar__profile-photo"
              />
              <span>{user ? "Dashboard ▾" : "Account ▾"}</span>
            </div>

            {dropdownOpen && (
              <div className="dropdown__menu">
                {user ? (
                  <>
                    <div className="dropdown__user">
                      <p className="dropdown__name">👤 {user.name}</p>
                      <p className="dropdown__email">📧 {user.email}</p>
                    </div>
                    <hr />
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)}>
                      🏠 Dashboard Home
                    </Link>
                    <Link to="/ats-score" onClick={() => setDropdownOpen(false)}>
                      📊 ATS Results
                    </Link>
                    <button onClick={handleLogout} className="btn-logout">
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <p className="dropdown__guest">👋 Welcome Guest</p>
                    <button
                      className="btn-login"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/login");
                      }}
                    >
                      🔐 Login
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <div
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Login Required Popup */}
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
    </>
  );
};

export default Navbar;