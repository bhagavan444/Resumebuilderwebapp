const Resume = require('../models/Resume');

exports.createResume = async (req, res) => {
  try {
    const resume = new Resume(req.body);
    await resume.save();
    res.status(201).json({ message: 'Resume saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find();
    res.status(200).json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
