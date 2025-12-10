const express = require('express');
const router = express.Router();

// Dummy route to test
router.get('/test-auth', (req, res) => {
  res.json({ message: "✅ Auth route is working!" });
});

module.exports = router;
