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
  FaInfoCircle,
} from "react-icons/fa";
import "../components/Login.css";

const Login = () => {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState(localStorage.getItem("remember_email") || "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLock, setCapsLock] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in via Firebase
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          // Already have user data → redirect
          navigate("/create");
        } else {
          // Save minimal user data and redirect
          const formattedUser = {
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            photo: firebaseUser.photoURL || null,
          };
          localStorage.setItem("user", JSON.stringify(formattedUser));
          navigate("/create");
        }
      }
      // If no firebaseUser → stay on login page (no redirect)
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ================= HELPERS ================= */
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

  /* ================= OTP FLOW ================= */
  const sendOtp = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setShowOtpInput(true);
        setError("");
      } else {
        setError("Failed to send OTP");
      }
    } catch {
      setError("OTP service unavailable");
    }
  };

  const verifyOtpAndSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        const formattedUser = {
          name: email.split("@")[0],
          email,
          uid: Date.now().toString(),
          photo: null,
        };
        localStorage.setItem("user", JSON.stringify(formattedUser));
        navigate("/create");
      } else {
        setError("Invalid OTP");
      }
    } catch {
      setError("OTP verification failed");
    }
  };

  /* ================= EMAIL AUTH ================= */
  const handleEmailSignup = async () => {
    setError("");
    if (!acceptedTerms) return setError("Accept Terms & Privacy to continue");
    if (!isValidGmail(email)) return setError("Only Gmail addresses allowed");
    if (!isStrongPassword(password)) return setError("Password must be strong (8+ chars, upper, lower, number, special)");

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }

      await sendOtp(); // Proceed to OTP step
    } catch (err) {
      setError(err.message.includes("email-already-in-use")
        ? "Email already registered. Try logging in."
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setError("");
    if (!isValidGmail(email)) return setError("Only Gmail addresses allowed");

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }

      await sendOtp(); // Proceed to OTP step
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setLoading(true);
    await verifyOtpAndSave();
    setLoading(false);
  };

  /* ================= SOCIAL LOGIN ================= */
  const handleSocialLogin = async (provider) => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const formattedUser = {
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        uid: user.uid,
        photo: user.photoURL || null,
      };

      localStorage.setItem("user", JSON.stringify(formattedUser));
      navigate("/create");
    } catch (err) {
      setError("Social login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className={`login-wrapper ${darkMode ? "dark" : ""}`}>
      <div className="login-card glass">
        {/* Dark Mode Toggle */}
        <div className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </div>

        <h2 className="brand">🔐 Enhance CV</h2>

        {/* Mode Switch */}
        <div className="mode-toggle">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="error-msg">{error}</p>}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Gmail address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        {/* Password Input (only if not in OTP step) */}
        {!showOtpInput && (
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordStrength(checkPasswordStrength(e.target.value));
              }}
              onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
              disabled={loading}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        )}

        {/* Caps Lock Warning */}
        {capsLock && !showOtpInput && <p className="caps-warning">⚠️ Caps Lock is ON</p>}

        {/* Password Strength Indicator */}
        {password && !showOtpInput && (
          <div className={`password-strength ${passwordStrength}`}>
            {passwordStrength === "weak" && "Weak 🔴"}
            {passwordStrength === "medium" && "Medium 🟠"}
            {passwordStrength === "strong" && "Strong 🟢"}
            <span className="tooltip">
              <FaInfoCircle />
              <small>
                8+ chars • Uppercase • Lowercase • Number • Special char
              </small>
            </span>
          </div>
        )}

        {/* Remember Me */}
        {!showOtpInput && (
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              disabled={loading}
            />
            Remember me
          </label>
        )}

        {/* Terms (Signup only) */}
        {mode === "signup" && !showOtpInput && (
          <label className="terms">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading}
            />
            I agree to Terms & Privacy Policy
          </label>
        )}

        {/* Action Button */}
        {showOtpInput ? (
          <>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength="6"
              disabled={loading}
            />
            <button className="primary-btn" onClick={handleOtpSubmit} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        ) : mode === "signup" ? (
          <button className="primary-btn" onClick={handleEmailSignup} disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        ) : (
          <button className="primary-btn" onClick={handleEmailLogin} disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </button>
        )}

        {/* Divider */}
        <div className="divider">or continue with</div>

        {/* Social Buttons */}
        <button
          className="social-btn google"
          onClick={() => handleSocialLogin(googleProvider)}
          disabled={loading}
        >
          <FaGoogle /> Google
        </button>

        <button
          className="social-btn github"
          onClick={() => handleSocialLogin(githubProvider)}
          disabled={loading}
        >
          <FaGithub /> GitHub
        </button>

        {/* Security Note */}
        <p className="security-note">
          🔒 Protected with OTP verification & encrypted authentication
        </p>
      </div>
    </div>
  );
};

export default Login;