const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");

// POST /api/resumes
router.post("/resumes", async (req, res) => {
  try {
    const resume = new Resume(req.body);
    const saved = await resume.save();
    res.status(201).json({ message: "Resume saved", resume: saved });
  } catch (error) {
    console.error("❌ Error saving resume:", error);
    res.status(500).json({ message: "Error saving resume", error });
  }
});

// Optional: GET latest resume
router.get("/resumes/latest", async (req, res) => {
  try {
    const latestResume = await Resume.findOne().sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found" });
    }
    res.json(latestResume);
  } catch (error) {
    console.error("❌ Error fetching latest resume:", error);
    res.status(500).json({ message: "Error fetching resume" });
  }
});

module.exports = router;
