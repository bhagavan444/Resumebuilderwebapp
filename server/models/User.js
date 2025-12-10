const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    photo: {
      type: String,
      default: "", // Optional default
    },
    phone: {
      type: String,
      default: "", // Optional, can be updated later
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
