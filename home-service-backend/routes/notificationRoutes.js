const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAllRead,
  markRead,
} = require("../controllers/notificationController");

router.get("/", verifyToken, getNotifications);
router.put("/read-all", verifyToken, markAllRead);
router.put("/:id/read", verifyToken, markRead);

module.exports = router;
