const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");

// ✅ Mongoose Schema for ATS Score
const scoreSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    filename: { type: String, required: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    resumeText: { type: String }, // Optional: store extracted text (can be large)
  },
  { timestamps: true }
);

const Score = mongoose.model("Score", scoreSchema);

// ✅ Multer: Use memory storage (better for small PDFs)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

// ✅ Improved ATS Scoring Logic (More Realistic)
function calculateATSScore(text) {
  let score = 50; // Base score

  const lowerText = text.toLowerCase();

  // Common ATS-friendly keywords (expand as needed)
  const keywords = [
    "python", "javascript", "react", "node", "express", "mongodb", "sql",
    "aws", "docker", "git", "html", "css", "java", "c++", "machine learning",
    "data analysis", "leadership", "team", "project", "developed", "built"
  ];

  let matches = 0;
  keywords.forEach((kw) => {
    if (lowerText.includes(kw)) matches++;
  });

  score += matches * 4; // Up to +80 from keywords

  // Bonus for structure
  const sections = ["experience", "education", "skills", "projects", "summary"];
  sections.forEach((sec) => {
    if (lowerText.includes(sec)) score += 5;
  });

  // Bonus for quantified achievements (numbers)
  const numberCount = (text.match(/\d+/g) || []).length;
  if (numberCount > 10) score += 15;
  else if (numberCount > 5) score += 8;

  // Penalize overly complex formatting indicators
  if (lowerText.includes("table") || lowerText.includes("image")) score -= 10;

  return Math.max(10, Math.min(100, Math.round(score)));
}

// ✅ POST /api/score — Upload and score resume
router.post("/score", upload.single("resume"), async (req, res) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded. Please select a PDF." });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Invalid file type. Only PDF allowed." });
    }

    // Parse PDF
    let text = "";
    try {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } catch (parseError) {
      console.error("PDF parsing failed:", parseError);
      return res.status(400).json({ message: "Could not read PDF content. Try a text-based PDF." });
    }

    if (!text.trim()) {
      return res.status(400).json({ message: "PDF is empty or unreadable (scanned/image-only?)." });
    }

    // Calculate score
    const score = calculateATSScore(text);

    // Save to MongoDB
    const savedScore = new Score({
      score,
      filename: req.file.originalname,
      email: req.body.email || null,
      phone: req.body.phone || null,
      resumeText: text.substring(0, 5000), // Optional: truncate to avoid huge docs
    });

    await savedScore.save();

    // Return only what frontend needs
    return res.status(200).json({ score });
  } catch (error) {
    console.error("Error in /api/score:", error);
    return res.status(500).json({ message: "Failed to analyze resume. Please try again." });
  }
});

// ✅ GET latest score
router.get("/score/latest", async (req, res) => {
  try {
    const latest = await Score.findOne().sort({ createdAt: -1 }).select("score createdAt");
    if (!latest) {
      return res.status(404).json({ message: "No scores recorded yet." });
    }
    res.json({ score: latest.score, date: latest.createdAt });
  } catch (error) {
    console.error("Error fetching latest score:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET all scores
router.get("/score/all", async (req, res) => {
  try {
    const scores = await Score.find().sort({ createdAt: -1 }).select("-resumeText"); // Exclude large text
    res.json(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE score by ID
router.delete("/score/:id", async (req, res) => {
  try {
    const deleted = await Score.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Score not found" });
    }
    res.json({ message: "Score deleted successfully" });
  } catch (error) {
    console.error("Error deleting score:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;