// src/components/auth/GoogleLoginButton.jsx
import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import"./Authbuttons.css";

function GoogleLoginButton({ mode = "login" }) {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user info in localStorage
      localStorage.setItem("user", JSON.stringify({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      }));

      // Redirect to homepage
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="google-auth-btn"
    >
      <img src="/assets/google-logo.png" alt="Google" className="w-5 h-5 mr-2" />
      {mode === "signup" ? "Signup with Google" : "Login with Google"}
    </button>
  );
}

GoogleLoginButton.propTypes = {
  mode: PropTypes.oneOf(["login", "signup"]),
};

export default GoogleLoginButton;
