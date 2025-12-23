// src/App.jsx
import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Pages & Components (same as before)
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import CreateResume from "./pages/CreateResume";
import ResumeScore from "./pages/ResumeScore";
import ResumePreview from "./pages/ResumePreview";
import ViewResume from "./pages/ViewResume";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import LatestResume from "./pages/LatestResume";
import ResumeList from "./pages/ResumeList";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRedirected = useRef(false); // ← Prevents repeated redirects

  const hideNavbar = ["/dashboard", "/login", "/signup"].includes(location.pathname);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storedUser = {
          name: user.displayName || user.email?.split("@")[0],
          email: user.email,
          uid: user.uid,
          photo: user.photoURL,
        };
        localStorage.setItem("user", JSON.stringify(storedUser));

        // Only redirect to /create ONCE after login, not every time visiting "/"
        if (location.pathname === "/" && !hasRedirected.current) {
          hasRedirected.current = true;
          navigate("/create", { replace: true });
        }
      } else {
        localStorage.removeItem("user");
        hasRedirected.current = false; // Reset when logged out
      }
    });

    return () => unsubscribe();
  }, [location.pathname, navigate]); // ← Better: only pathname, not full location

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/create" element={<CreateResume />} />
          <Route path="/create-resume" element={<CreateResume />} />
          <Route path="/score" element={<ResumeScore />} />
          <Route path="/ats-score" element={<ResumeScore />} />
          <Route path="/preview" element={<ResumePreview />} />
          <Route path="/view-resume" element={<ViewResume />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/latest-resume" element={<LatestResume />} />
          <Route path="/resumes" element={<ResumeList />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;