// src/components/auth/GitHubLoginButton.jsx
import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, githubProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "Authbuttons.css"; // Assuming you have a CSS file for styling

function GitHubLoginButton({ mode = "login" }) {
  const navigate = useNavigate();

  const handleGitHubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;

      // Save user info
      localStorage.setItem("user", JSON.stringify({
        name: user.displayName || "GitHub User",
        email: user.email,
        photo: user.photoURL
      }));

      navigate("/");
    } catch (error) {
      console.error("GitHub login error:", error.message);
    }
  };

  return (
    <button onClick={handleGitHubLogin} className="github-auth-btn">
      <img src="/assets/github-logo.png" alt="GitHub" className="w-5 h-5 mr-2" />
      {mode === "signup" ? "Signup with GitHub" : "Login with GitHub"}
    </button>
  );
}

GitHubLoginButton.propTypes = {
  mode: PropTypes.oneOf(["login", "signup"]),
};

export default GitHubLoginButton;
