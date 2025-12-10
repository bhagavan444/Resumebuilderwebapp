import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // ✅ Sync Firebase + LocalStorage user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      const storedUser = localStorage.getItem("user");
      if (firebaseUser && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    });

    // ✅ Also check localStorage on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return () => unsubscribe();
  }, []);

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      setUser(null);
      setDropdownOpen(false);
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error.message);
    }
  };

  return (
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

      {/* Links */}
      <ul className={`navbar__links ${menuOpen ? "open" : ""}`}>
        <li>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
        </li>
        {user && (
          <>
            <li>
              <Link to="/create" onClick={() => setMenuOpen(false)}>
                Creation
              </Link>
            </li>
            <li>
              <Link to="/preview" onClick={() => setMenuOpen(false)}>
                Preview
              </Link>
            </li>
            <li>
              <Link to="/score" onClick={() => setMenuOpen(false)}>
                ATS Score
              </Link>
            </li>
          </>
        )}
        {user?.email === "g.sivasatyasaibhagavan@gmail.com" && (
          <li>
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          </li>
        )}
        <li>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>
        </li>
        <li>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
        </li>
      </ul>

      {/* Actions */}
      <div className="navbar__actions">
        {/* Dark mode */}
        

        {/* Auth */}
        {user ? (
          <div className="navbar__profile">
            <div
              className="navbar__profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={
                  user.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || "User"
                  )}&background=random&size=40`
                }
                alt="Profile"
                className="navbar__profile-photo"
              />
              <span>Dashboard ▾</span>
            </div>

            {dropdownOpen && (
              <div className="dropdown__menu">
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
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button className="btn-login">Login</button>
          </Link>
        )}

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
  );
};

export default Navbar;
