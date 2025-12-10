const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  dob: String,
  address: String,
  experience: String,
  skills: String,
  internships: [
    {
      domain: String,
      period: String,
      company: String,
      description: String,
    },
  ],
  hackathons: [
    {
      title: String,
      place: String,
      description: String,
      time: String,
    },
  ],
  projects: [String],
  certifications: [String],
  education: [
    {
      sno: String,
      qualification: String,
      university: String,
      cgpa: String,
    },
  ],
  extraCurricular: [String],
  hobbies: [String],
});

module.exports = mongoose.model("Resume", resumeSchema);
