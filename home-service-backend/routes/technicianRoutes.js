const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const {
  addTechnician,
  getTechnicians,
  getTechnicianById,
  updateTechnician,
  deleteTechnician,
  toggleStatus,
} = require("../controllers/technicianController");

// All technician routes are admin-only
router.get("/", verifyAdmin, getTechnicians);
router.get("/:id", verifyAdmin, getTechnicianById);
router.post("/", verifyAdmin, addTechnician);
router.put("/:id", verifyAdmin, updateTechnician);
router.delete("/:id", verifyAdmin, deleteTechnician);
router.put("/:id/toggle-status", verifyAdmin, toggleStatus);

module.exports = router;