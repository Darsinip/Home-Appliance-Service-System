const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  getCustomerBookings,
  getAllBookings,
  getBookingById,
  assignTechnician,
  updateStatus,
  completeService,
  generateBill,
  cancelBooking,
} = require("../controllers/bookingController");

// Customer routes (require auth)
router.post("/", verifyToken, createBooking);
router.get("/my", verifyToken, getMyBookings);
router.get("/customer/:id", verifyToken, getCustomerBookings);
router.put("/cancel/:id", verifyToken, cancelBooking);

// Admin routes
router.get("/", verifyAdmin, getAllBookings);
router.get("/:id", verifyToken, getBookingById);
router.put("/assign/:id", verifyAdmin, assignTechnician);
router.put("/status/:id", verifyAdmin, updateStatus);
router.put("/complete/:id", verifyAdmin, completeService);
router.put("/billing/:id", verifyAdmin, generateBill);

module.exports = router;