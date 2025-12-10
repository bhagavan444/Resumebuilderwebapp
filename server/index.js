// server/index.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const resumeRoutes = require("./routes/resume"); // ✅ Handles /api/resumes
const scoreRoutes = require("./routes/score");   // ✅ Handles /api/score and /api/score/upload
const authRoutes = require("./routes/auth");     // ✅ Handles /api/auth/send-otp, verify-otp, saveuser

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/resume-builder")
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use("/api", resumeRoutes);       // ⬅️ Example: GET /api/resumes
app.use("/api", scoreRoutes);        // ⬅️ Example: POST /api/score/upload
app.use("/api/auth", authRoutes);    // ⬅️ Example: POST /api/auth/send-otp

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("🟢 Smart Resume Builder backend is running");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
