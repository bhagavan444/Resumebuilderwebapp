// backend/index.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

const keywords = ["JavaScript", "React", "Node.js", "MongoDB", "Python", "SQL", "Flask", "AWS", "Docker", "ML", "DS"];

app.post("/api/score", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileBuffer = fs.readFileSync(req.file.path);

  try {
    const data = await pdfParse(fileBuffer);
    const text = data.text.toLowerCase();

    let score = 0;

    keywords.forEach((keyword) => {
      if (text.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    if (text.match(/\d{10}/)) score += 5;
    if (text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) score += 5;

    if (score > 100) score = 100;

    res.json({ score }); // ✅ important
  } catch (error) {
    console.error("❌ Error parsing resume:", error);
    res.status(500).json({ error: "Failed to parse and score resume" });
  }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
