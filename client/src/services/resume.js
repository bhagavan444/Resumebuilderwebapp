// models/Resume.js

const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?\d{10,15}$/, "Please provide a valid phone number"],
    },
    dob: {
      type: String, // Or use Date if you want real date parsing
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address too long"],
    },

    // Professional Summary / Experience Overview
    experience: {
      type: String,
      trim: true,
      maxlength: [1000, "Experience summary too long"],
    },

    // Skills (better as array of strings)
    skills: [
      {
        type: String,
        trim: true,
        uppercase: true, // Optional: normalize
      },
    ],

    // Internships (more structured)
    internships: [
      {
        domain: { type: String, trim: true },
        period: { type: String, trim: true }, // e.g., "Jun 2024 - Aug 2024"
        company: { type: String, required: true, trim: true },
        description: { type: String, trim: true, maxlength: 500 },
      },
    ],

    // Hackathons
    hackathons: [
      {
        title: { type: String, required: true, trim: true },
        place: { type: String, trim: true }, // e.g., "1st Runner-up"
        description: { type: String, trim: true },
        time: { type: String, trim: true }, // e.g., "March 2024"
      },
    ],

    // Projects (array of objects for richer data)
    projects: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        techStack: [String], // e.g., ["React", "Node.js", "MongoDB"]
        link: { type: String, trim: true }, // GitHub/live link
      },
    ],

    // Certifications
    certifications: [
      {
        name: { type: String, required: true, trim: true },
        issuer: { type: String, trim: true }, // e.g., "Coursera", "Google"
        date: { type: String, trim: true }, // e.g., "Oct 2024"
        credentialId: { type: String, trim: true },
        link: { type: String, trim: true },
      },
    ],

    // Education (more detailed)
    education: [
      {
        qualification: { type: String, required: true, trim: true }, // e.g., "B.Tech CSE"
        university: { type: String, required: true, trim: true },
        cgpa: { type: String, trim: true }, // e.g., "8.9/10"
        percentage: { type: String, trim: true },
        startYear: { type: String },
        endYear: { type: String },
      },
    ],

    // Extra Curricular Activities
    extraCurricular: [
      {
        type: String,
        trim: true,
      },
    ],

    // Hobbies / Interests
    hobbies: [
      {
        type: String,
        trim: true,
      },
    ],

    // Optional: Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // If you have user authentication
      // required: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt & updatedAt
  }
);

// Index for faster queries (e.g., by email or user)
resumeSchema.index({ email: 1 });
resumeSchema.index({ userId: 1 });

module.exports = mongoose.model("Resume", resumeSchema);