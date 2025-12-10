const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true },
    filename: { type: String },
    email: { type: String },         // ✅ Added to store user's email
    phone: { type: String },         // ✅ Added to store user's phone
    resumeText: { type: String },    // ✅ Optional: parsed text from PDF
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", scoreSchema);
