const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const {
  addService,
  getServices,
  getAllServicesAdmin,
  getCategories,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

// Public routes
router.get("/", getServices);
router.get("/categories", getCategories);
router.get("/admin/all", verifyAdmin, getAllServicesAdmin);

// Admin-only routes
router.post("/", verifyAdmin, addService);
router.put("/:id", verifyAdmin, updateService);
router.delete("/:id", verifyAdmin, deleteService);

router.get("/:id", getServiceById);

module.exports = router;
