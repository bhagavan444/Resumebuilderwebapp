// server/server.js - Main backend entry point

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Vite frontend
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for future uploads if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes - Make sure these files exist at these exact paths!
app.use("/api/auth", require("./routes/auth"));
app.use("/api/resume", require("./routes/resume"));
app.use("/api/resumeRoutes", require("./routes/resumeRoutes")); // remove if file doesn't exist
app.use("/api/score", require("./routes/score")); // ← CRITICAL: This must exist!

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Resume Builder API is running! 🚀",
    endpoints: {
      score: "/api/score (POST - upload PDF to get ATS score)",
      health: "/"
    }
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    tip: "Check if your route file exists and is exported correctly."
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  if (err.code === "MODULE_NOT_FOUND") {
    return res.status(500).json({ 
      error: "Route file not found",
      details: err.message 
    });
  }
  res.status(500).json({ error: "Internal server error" });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resume-builder")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1); // Stop server if DB fails
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Test it: Open http://localhost:${PORT} in browser`);
});