const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  dob: String,
  address: String,
  experience: String,
  skills: String,
  internships: Array,
  hackathons: Array,
  projects: Array,
  certifications: Array,
  education: Array,
  extraCurricular: Array,
  hobbies: Array,
}, { timestamps: true });

module.exports = mongoose.model("Resume", ResumeSchema);
