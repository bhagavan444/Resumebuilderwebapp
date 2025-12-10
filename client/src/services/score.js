const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const router = express.Router();
import'./score.css';

const upload = multer({ dest: "uploads/" });

router.post("/score", upload.single("resume"), async (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const payload = {
      DocumentAsBase64String: fileBuffer.toString("base64"),
      RevisionDate: new Date().toISOString().split("T")[0],
    };

    const sovrenUrl = "https://your-sovren-endpoint/v9/parser/resume";
    const headers = {
      "Content-Type": "application/json",
      "Sovren-AccountId": process.env.SOVREN_ACCOUNT_ID,
      "Sovren-ServiceKey": process.env.SOVREN_SERVICE_KEY,
    };

    const response = await axios.post(sovrenUrl, payload, { headers });
    const parsed = response.data;

    // Extract key info for frontend
    const candidate = parsed.Deliverables.ParsedCandidate;
    const score = parsed.Metadata.ConfidenceScore || null;

    res.json({
      score,
      name: candidate.Name?.FormattedName,
      emails: candidate.ContactInfo?.Emails,
      phone: candidate.ContactInfo?.Phones,
    });
  } catch (err) {
    console.error("❌ Sovren parsing error:", err);
    res.status(500).json({ error: "Failed to parse resume" });
  }
});

module.exports = router;
