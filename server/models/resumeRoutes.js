// server/routes/resumeRoutes.js

const express = require("express");
const router = express.Router();

// This is the POST route to save the resume data
router.post("/resumes", (req, res) => {
  const resumeData = req.body;  // data sent from frontend
  console.log("📥 Resume data received:", resumeData);

  // Just respond with success for now
  res.status(201).json({ message: "Resume saved!", data: resumeData });
});

module.exports = router;
