// server/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Make sure User model has phone field

// Save user from frontend
router.post("/saveuser", async (req, res) => {
  const { name, email, uid, photo, phone } = req.body; // ✅ include phone

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        name,
        email,
        uid,
        photo,
        phone, // ✅ save phone number
      });
      await user.save();
    }

    res.status(200).json({ message: "User saved", user });
  } catch (err) {
    res.status(500).json({ message: "Error saving user", error: err.message });
  }
});

module.exports = router; // ✅ fixed typo here
