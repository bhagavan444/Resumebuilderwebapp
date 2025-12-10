const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');

// POST: Save resume data
router.post('/create', async (req, res) => {
  try {
    const resume = new Resume(req.body);
    await resume.save();
    res.status(201).json({ message: '✅ Resume saved successfully!' });
  } catch (err) {
    console.error('❌ Error saving resume:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET: Fetch all resumes
router.get('/all', async (req, res) => {
  try {
    const resumes = await Resume.find();
    res.json(resumes);
  } catch (err) {
    console.error('❌ Error fetching resumes:', err);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

module.exports = router;
