const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");

// ✅ POST /api/resumes — Save a new resume to MongoDB
router.post("/resumes", async (req, res) => {
  try {
    const resume = new Resume(req.body);
    const savedResume = await resume.save();
    res.status(201).json({ message: "Resume saved successfully", resume: savedResume });
  } catch (error) {
    console.error("❌ Error saving resume:", error);
    res.status(500).json({ message: "Failed to save resume", error: error.message });
  }
});

// ✅ GET /api/resumes/latest — Get the most recently saved resume
router.get("/resumes/latest", async (req, res) => {
  try {
    const latestResume = await Resume.findOne().sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found" });
    }
    res.json(latestResume);
  } catch (error) {
    console.error("❌ Error fetching latest resume:", error);
    res.status(500).json({ message: "Error fetching resume", error: error.message });
  }
});

// ✅ NEW: GET /api/resumes — Return all resumes (for Dashboard)
router.get("/resumes", async (req, res) => {
  try {
    const allResumes = await Resume.find().sort({ createdAt: -1 });
    res.status(200).json(allResumes);
  } catch (error) {
    console.error("❌ Error fetching all resumes:", error);
    res.status(500).json({ message: "Error fetching resumes", error: error.message });
  }
});

module.exports = router;
