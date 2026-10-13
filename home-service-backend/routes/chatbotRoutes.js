const express = require("express");
const router = express.Router();
const {
  handleMessage,
  getSuggestions,
} = require("../controllers/chatbotController");
const { optionalAuth } = require("../middleware/authMiddleware");

// Chatbot routes are public (no auth required)
router.post("/", optionalAuth, handleMessage);
router.get("/suggestions", getSuggestions);

module.exports = router;
