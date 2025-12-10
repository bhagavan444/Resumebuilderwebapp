import React, { useState, useEffect } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun,
  FaGoogle,
  FaGithub,
} from "react-icons/fa";
import "../components/Login.css";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(""); // strength state
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && storedUser) {
        localStorage.removeItem("user");
      } else if (user && storedUser) {
        setIsAlreadyLoggedIn(true);
        navigate("/create"); // redirect to create resume page
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const isValidGmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return "weak";
    if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password) &&
      !/[@#$%^&+=!]/.test(password)
    )
      return "medium";
    if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(password)
    )
      return "strong";
    return "weak";
  };

  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(password);

  const sendOtp = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("📨 OTP sent to your email.");
        setShowOtpInput(true);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Error sending OTP");
    }
  };

  const verifyOtpAndSave = async (formattedUser) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(formattedUser));
        await saveUserToBackend(formattedUser);
        navigate("/create");
      } else {
        setError("Invalid OTP");
      }
    } catch {
      setError("OTP verification failed");
    }
  };

  const saveUserToBackend = async (user) => {
    try {
      await fetch("http://localhost:5000/api/auth/saveuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
    } catch (err) {
      console.error("Backend error:", err.message);
    }
  };

  const handleEmailSignup = async () => {
    if (!isValidGmail(email)) return setError("Use a valid Gmail address");
    if (!isStrongPassword(password))
      return setError(
        "Password must be 8+ chars, with upper, lower, digit, and special char"
      );

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await sendOtp();
    } catch (error) {
      setError("Signup failed: " + error.message);
    }
  };

  const handleEmailLogin = async () => {
    if (!isValidGmail(email)) return setError("Use a valid Gmail");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const formattedUser = {
        name: user.email.split("@")[0],
        email: user.email,
        uid: user.uid,
        photo: null,
      };

      await sendOtp();
      setShowOtpInput(true);
    } catch (error) {
      setError("Login error: " + error.message);
    }
  };

  const handleOtpSubmit = async () => {
    const formattedUser = {
      name: email.split("@")[0],
      email,
      uid: Date.now(),
      photo: null,
    };
    await verifyOtpAndSave(formattedUser);
  };

  const handleSocialLogin = async (provider) => {
    if (loading) return;
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const formattedUser = {
        name: user.displayName || user.email?.split("@")[0],
        email: user.email,
        uid: user.uid,
        photo: user.photoURL,
      };
      localStorage.setItem("user", JSON.stringify(formattedUser));
      await saveUserToBackend(formattedUser);
      navigate("/create");
    } catch (error) {
      setError("Social login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadyLoggedIn) return null;

  return (
    <div className={`login-wrapper ${darkMode ? "dark" : ""}`}>
      <div className="login-card glass">
        <div className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </div>

        <h2 className="brand">🔐 Enhance CV</h2>

        <div className="mode-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setShowOtpInput(false);
            }}
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setShowOtpInput(false);
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <input
          type="email"
          placeholder="Enter your Gmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password (8+ chars)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordStrength(checkPasswordStrength(e.target.value));
            }}
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Password Strength Meter */}
        {password && (
          <div className={`password-strength ${passwordStrength}`}>
            {passwordStrength === "weak" && "Weak 🔴"}
            {passwordStrength === "medium" && "Medium 🟠"}
            {passwordStrength === "strong" && "Strong 🟢"}
          </div>
        )}

        {showOtpInput ? (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className="primary-btn" onClick={handleOtpSubmit}>
              {loading ? "Verifying..." : "✅ Verify OTP"}
            </button>
          </>
        ) : mode === "signup" ? (
          <button
            className="primary-btn"
            onClick={handleEmailSignup}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up with Email"}
          </button>
        ) : (
          <button
            className="primary-btn"
            onClick={handleEmailLogin}
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login with Email"}
          </button>
        )}

        <div className="divider">or continue with</div>

        <button
          className="social-btn google"
          onClick={() => handleSocialLogin(googleProvider)}
          disabled={loading}
        >
          <FaGoogle /> {mode === "signup" ? " Sign Up" : " Login"} with Google
        </button>

        <button
          className="social-btn github"
          onClick={() => handleSocialLogin(githubProvider)}
          disabled={loading}
        >
          <FaGithub /> {mode === "signup" ? " Sign Up" : " Login"} with GitHub
        </button>
      </div>
    </div>
  );
};

export default Login;
