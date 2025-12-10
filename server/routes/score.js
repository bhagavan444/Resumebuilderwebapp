const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");

// ✅ Mongoose schema for ATS Score
const scoreSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true },
    filename: { type: String },
    email: { type: String },
    phone: { type: String },
    resumeText: { type: String },
  },
  { timestamps: true }
);

const Score = mongoose.model("Score", scoreSchema);

// ✅ Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ POST /api/score — Upload resume and calculate ATS score
router.post("/score", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "❌ Please upload a valid PDF file." });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text.toLowerCase();

    const keywords = ["python", "react", "mongodb", "node", "express", "git"];
    let score = 0;

    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        score += 15;
      }
    });

    score = Math.min(score, 100);

    const savedScore = new Score({
      score,
      filename: req.file.originalname,
      email: req.body.email || "",
      phone: req.body.phone || "",
      resumeText: text,
    });

    await savedScore.save();

    return res.status(200).json({ score });
  } catch (error) {
    console.error("❌ Error during scoring:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ GET latest score
router.get("/score/latest", async (req, res) => {
  try {
    const latestScore = await Score.findOne().sort({ createdAt: -1 });
    if (!latestScore) {
      return res.status(404).json({ message: "❌ No scores found" });
    }
    return res.status(200).json({ score: latestScore.score });
  } catch (error) {
    console.error("❌ Error fetching latest score:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ GET all scores
router.get("/score/all", async (req, res) => {
  try {
    const allScores = await Score.find().sort({ createdAt: -1 });
    return res.status(200).json(allScores);
  } catch (error) {
    console.error("❌ Error fetching all scores:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE score by ID
router.delete("/score/:id", async (req, res) => {
  try {
    const deleted = await Score.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "❌ Score not found" });
    }
    return res.status(200).json({ message: "✅ Score deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting score:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Export router
module.exports = router;
