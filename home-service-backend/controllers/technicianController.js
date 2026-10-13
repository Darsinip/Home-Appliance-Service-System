const Technician = require("../models/Technician");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

/**
 * @route   POST /api/technicians
 * @desc    Add a new technician (Admin)
 */
const addTechnician = asyncHandler(async (req, res) => {
  const { name, email, phone, specialization, specializations } = req.body;

  const techData = { name, email, phone };

  // Support both legacy single specialization and new array
  if (specializations && specializations.length > 0) {
    techData.specializations = specializations;
  }
  if (specialization) {
    techData.specialization = specialization;
    // Also add to array if not already there
    if (!techData.specializations) {
      techData.specializations = [specialization];
    }
  }

  const technician = await Technician.create(techData);
  ApiResponse.created(res, technician, "Technician added successfully");
});

/**
 * @route   GET /api/technicians
 * @desc    Get all technicians (Admin)
 */
const getTechnicians = asyncHandler(async (req, res) => {
  const technicians = await Technician.find().sort({ createdAt: -1 });

  // Attach active job counts
  const techsWithJobs = await Promise.all(
    technicians.map(async (tech) => {
      const activeJobs = await Booking.countDocuments({
        technicianId: tech._id,
        status: { $in: ["Assigned", "In Progress"] },
      });
      return {
        ...tech.toObject(),
        activeJobs,
      };
    })
  );

  ApiResponse.success(res, techsWithJobs);
});

/**
 * @route   GET /api/technicians/:id
 * @desc    Get single technician with assigned jobs
 */
const getTechnicianById = asyncHandler(async (req, res) => {
  const technician = await Technician.findById(req.params.id);
  if (!technician) {
    return ApiResponse.notFound(res, "Technician not found");
  }

  const assignedBookings = await Booking.find({
    technicianId: technician._id,
    status: { $in: ["Assigned", "In Progress"] },
  })
    .populate("serviceId", "serviceName")
    .populate("customerId", "name phone");

  ApiResponse.success(res, {
    ...technician.toObject(),
    assignedBookings,
  });
});

/**
 * @route   PUT /api/technicians/:id
 * @desc    Update technician (Admin)
 */
const updateTechnician = asyncHandler(async (req, res) => {
  const technician = await Technician.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!technician) {
    return ApiResponse.notFound(res, "Technician not found");
  }

  ApiResponse.success(res, technician, "Technician updated successfully");
});

/**
 * @route   DELETE /api/technicians/:id
 * @desc    Delete technician (Admin)
 */
const deleteTechnician = asyncHandler(async (req, res) => {
  // Check for active assignments
  const activeBookings = await Booking.countDocuments({
    technicianId: req.params.id,
    status: { $in: ["Assigned", "In Progress"] },
  });

  if (activeBookings > 0) {
    return ApiResponse.badRequest(
      res,
      `Cannot delete technician with ${activeBookings} active booking(s). Reassign or complete them first.`
    );
  }

  const technician = await Technician.findByIdAndDelete(req.params.id);
  if (!technician) {
    return ApiResponse.notFound(res, "Technician not found");
  }

  ApiResponse.success(res, null, "Technician deleted successfully");
});

/**
 * @route   PUT /api/technicians/:id/toggle-status
 * @desc    Activate/deactivate technician (Admin)
 */
const toggleStatus = asyncHandler(async (req, res) => {
  const technician = await Technician.findById(req.params.id);
  if (!technician) {
    return ApiResponse.notFound(res, "Technician not found");
  }

  technician.status = technician.status === "active" ? "inactive" : "active";
  technician.availability = technician.status === "active";
  await technician.save();

  ApiResponse.success(
    res,
    technician,
    `Technician ${technician.status === "active" ? "activated" : "deactivated"} successfully`
  );
});

module.exports = {
  addTechnician,
  getTechnicians,
  getTechnicianById,
  updateTechnician,
  deleteTechnician,
  toggleStatus,
};