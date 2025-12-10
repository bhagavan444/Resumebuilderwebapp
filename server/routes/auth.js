const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

let generatedOtp = {};

// ✅ 1. Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email.endsWith("@gmail.com")) {
    return res.status(400).json({ message: "Only Gmail addresses are allowed" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  generatedOtp[email] = otp;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // ✅ Your Gmail address
      pass: process.env.EMAIL_PASS, // ✅ App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code - Enhance CV",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP", error });
  }
});

// ✅ 2. Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (generatedOtp[email] && generatedOtp[email] == otp) {
    delete generatedOtp[email]; // One-time use
    console.log(`✅ OTP verified for ${email}`);
    res.status(200).json({ message: "OTP verified" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});

// ✅ 3. Save user to MongoDB
router.post("/saveuser", async (req, res) => {
  const { name, email, uid, photo } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ message: "Missing required fields: email or uid" });
  }

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        name: name || "Anonymous",
        email,
        uid,
        photo: photo || "",
      });
      await user.save();
      console.log("✅ New user created:", user.email);
    } else {
      console.log("ℹ️ Existing user logged in:", user.email);
    }

    res.status(200).json({ message: "User processed successfully", user });
  } catch (err) {
    console.error("❌ Error in /saveuser:", err.message);
    res.status(500).json({ message: "Server error while saving user", error: err.message });
  }

  const {
  sendOtp,
  verifyOtp,
  saveUser,
} = require("../controllers/authController");

// ✅ Define routes using controllers
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/saveuser", saveUser);
});

module.exports = router;
