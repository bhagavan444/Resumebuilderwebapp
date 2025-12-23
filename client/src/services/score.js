// routes/score.js

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const router = express.Router();

// Multer: accept only PDF, store temporarily
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// ATS Scoring Logic
function calculateATSScore(text) {
  let score = 60;

  const lowerText = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;

  // Length
  if (wordCount < 200) score -= 20;
  else if (wordCount > 800) score -= 10;
  else score += 10;

  // Sections
  const sections = ["experience", "skills", "education", "projects", "summary", "certifications"];
  const foundSections = sections.filter(s => lowerText.includes(s)).length;
  score += foundSections * 6;

  // Keywords (common tech + soft skills)
  const keywords = ["react", "javascript", "python", "java", "node", "sql", "aws", "docker", "git", "agile", "leadership", "team", "project", "developed", "built", "designed"];
  const keywordMatches = keywords.filter(k => lowerText.includes(k)).length;
  score += keywordMatches * 3;

  // Numbers (quantified achievements)
  const numbers = (text.match(/\d+/g) || []).length;
  if (numbers > 8) score += 12;
  else if (numbers > 4) score += 6;

  // Penalize complex formatting indicators
  if (text.includes("Table") || text.includes("Image") || lowerText.includes("graphic")) score -= 15;

  // Random variation for realism
  score += Math.floor(Math.random() * 10) - 5;

  return Math.max(25, Math.min(98, Math.round(score)));
}

// POST /api/score - Upload resume and get ATS score
router.post("/score", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded. Please upload a PDF resume." });
  }

  const filePath = req.file.path;

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    const score = calculateATSScore(data.text);

    // Delete temp file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });

    // This is what your frontend expects!
    res.json({ score });
  } catch (err) {
    console.error("PDF processing error:", err);

    // Cleanup
    fs.unlink(filePath, () => {});

    res.status(500).json({ error: "Failed to analyze resume. Please try a simpler PDF." });
  }
});

module.exports = router;