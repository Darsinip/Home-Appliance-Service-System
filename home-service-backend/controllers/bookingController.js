const Booking = require("../models/Booking");
const mongoose = require("mongoose");
const Technician = require("../models/Technician");
const Service = require("../models/Service");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { autoAssignTechnician } = require("../utils/autoAssign");

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (Customer)
 */
const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, date, time, address, notes } = req.body;
  const customerId = req.user.id;

  // Validate service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return ApiResponse.notFound(res, "Service not found");
  }

  // Create booking
  const booking = await Booking.create({
    customerId,
    serviceId,
    date,
    time,
    address,
    notes,
  });

  // Try auto-assign technician
  const assignedTech = await autoAssignTechnician(booking._id, service.category);

  // Create notification for customer
  await Notification.create({
    userId: customerId,
    title: "Booking Confirmed",
    message: `Your booking for ${service.serviceName} on ${date} at ${time} has been confirmed.${
      assignedTech ? ` Technician ${assignedTech.name} has been assigned.` : ""
    }`,
    type: "booking",
    bookingId: booking._id,
  });

  // Fetch the populated booking
  const populatedBooking = await Booking.findById(booking._id)
    .populate("serviceId")
    .populate("technicianId")
    .populate("customerId", "name email phone");

  ApiResponse.created(res, populatedBooking, "Booking created successfully");
});

/**
 * @route   GET /api/bookings/my
 * @desc    Get current customer's bookings
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customerId: req.user.id })
    .populate("serviceId")
    .populate("technicianId", "name phone")
    .sort({ createdAt: -1 });

  ApiResponse.success(res, bookings);
});

/**
 * @route   GET /api/bookings/customer/:id
 * @desc    Get bookings for a specific customer (backward compatible)
 */
const getCustomerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customerId: req.params.id })
    .populate("serviceId")
    .populate("technicianId", "name phone")
    .sort({ createdAt: -1 });

  ApiResponse.success(res, bookings);
});

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (Admin)
 */
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  let query = {};
  if (status && status !== "All") {
    query.status = status;
  }

  let bookings = await Booking.find(query)
    .populate("customerId", "name email phone")
    .populate("serviceId", "serviceName price category")
    .populate("technicianId", "name phone")
    .sort({ createdAt: -1 });

  ApiResponse.success(res, bookings);
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking details
 */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("customerId", "name email phone address")
    .populate("serviceId")
    .populate("technicianId");

  if (!booking) {
    return ApiResponse.notFound(res, "Booking not found");
  }

  ApiResponse.success(res, booking);
});

/**
 * @route   PUT /api/bookings/assign/:id
 * @desc    Assign technician to booking (Admin)
 */
const assignTechnician = asyncHandler(async (req, res) => {
  const { technicianId } = req.body;

  if (!mongoose.isValidObjectId(req.params.id)) {
    return ApiResponse.badRequest(res, "Invalid booking ID");
  }
  if (!mongoose.isValidObjectId(technicianId)) {
    return ApiResponse.badRequest(res, "Please select a valid technician");
  }

  // Verify technician exists and is active
  const technician = await Technician.findById(technicianId);
  if (!technician) {
    return ApiResponse.notFound(res, "Technician not found");
  }
  if (technician.status !== "active") {
    return ApiResponse.badRequest(res, "Technician is not active");
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return ApiResponse.notFound(res, "Booking not found");
  }
  if (["Completed", "Cancelled"].includes(booking.status)) {
    return ApiResponse.badRequest(res, `Cannot assign a technician to a ${booking.status.toLowerCase()} booking`);
  }

  booking.technicianId = technicianId;
  booking.status = "Assigned";
  booking.statusHistory.push({
    status: "Assigned",
    changedAt: new Date(),
    note: `Technician ${technician.name} assigned`,
  });
  await booking.save();

  // Notify customer
  await Notification.create({
    userId: booking.customerId,
    title: "Technician Assigned",
    message: `Technician ${technician.name} has been assigned to your booking.`,
    type: "status",
    bookingId: booking._id,
  });

  const updated = await Booking.findById(booking._id)
    .populate("customerId", "name email phone")
    .populate("serviceId")
    .populate("technicianId");

  ApiResponse.success(res, updated, "Technician assigned successfully");
});

/**
 * @route   PUT /api/bookings/status/:id
 * @desc    Update booking status (Admin)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const validStatuses = ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return ApiResponse.badRequest(res, "Invalid status");
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return ApiResponse.notFound(res, "Booking not found");
  }

  booking.status = status;
  booking.statusHistory.push({
    status,
    changedAt: new Date(),
    note: note || `Status changed to ${status}`,
  });

  // If completed, increment technician's completed jobs
  if (status === "Completed" && booking.technicianId) {
    await Technician.findByIdAndUpdate(booking.technicianId, {
      $inc: { completedJobs: 1 },
    });
  }

  await booking.save();

  // Notify customer
  const statusMessages = {
    "In Progress": "Your service is now in progress.",
    Completed: "Your service has been completed.",
    Cancelled: "Your booking has been cancelled.",
  };

  if (statusMessages[status]) {
    await Notification.create({
      userId: booking.customerId,
      title: `Booking ${status}`,
      message: statusMessages[status],
      type: "status",
      bookingId: booking._id,
    });
  }

  const updated = await Booking.findById(booking._id)
    .populate("customerId", "name email phone")
    .populate("serviceId")
    .populate("technicianId");

  ApiResponse.success(res, updated, "Status updated successfully");
});

/**
 * @route   PUT /api/bookings/complete/:id
 * @desc    Complete service and add payment (Admin) - Legacy route
 */
const completeService = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return ApiResponse.notFound(res, "Booking not found");
  }

  booking.status = "Completed";
  booking.amount = amount || 0;
  booking.statusHistory.push({
    status: "Completed",
    changedAt: new Date(),
    note: "Service completed",
  });

  if (booking.technicianId) {
    await Technician.findByIdAndUpdate(booking.technicianId, {
      $inc: { completedJobs: 1 },
    });
  }

  await booking.save();

  await Notification.create({
    userId: booking.customerId,
    title: "Service Completed",
    message: `Your service has been completed. Total amount: ₹${amount || 0}`,
    type: "billing",
    bookingId: booking._id,
  });

  ApiResponse.success(res, booking, "Service completed and payment updated");
});

/**
 * @route   PUT /api/bookings/billing/:id
 * @desc    Generate/update billing for a booking (Admin)
 */
const generateBill = asyncHandler(async (req, res) => {
  const { serviceCharge, spareParts, additionalCharges } = req.body;

  const booking = await Booking.findById(req.params.id).populate("serviceId");
  if (!booking) {
    return ApiResponse.notFound(res, "Booking not found");
  }

  const charge = serviceCharge || booking.serviceId?.price || 0;
  const parts = spareParts || 0;
  const additional = additionalCharges || 0;
  const subtotal = charge + parts + additional;
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const total = Math.round((subtotal + tax) * 100) / 100;

  booking.billing = {
    serviceCharge: charge,
    spareParts: parts,
    additionalCharges: additional,
    tax,
    total,
  };
  booking.amount = total;

  await booking.save();

  // Notify customer
  await Notification.create({
    userId: booking.customerId,
    title: "Bill Generated",
    message: `Your service bill of ₹${total} has been generated.`,
    type: "billing",
    bookingId: booking._id,
  });

  const updated = await Booking.findById(booking._id)
    .populate("customerId", "name email phone")
    .populate("serviceId")
    .populate("technicianId");

  ApiResponse.success(res, updated, "Bill generated successfully");
});

/**
 * @route   PUT /api/bookings/cancel/:id
 * @desc    Cancel a booking (Customer)
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return ApiResponse.notFound(res, "Booking not found");
  }

  // Only allow cancellation of Pending or Assigned bookings
  if (!["Pending", "Assigned"].includes(booking.status)) {
    return ApiResponse.badRequest(
      res,
      "Cannot cancel a booking that is already in progress or completed"
    );
  }

  // Verify the booking belongs to the requesting user
  if (booking.customerId.toString() !== req.user.id && req.user.role !== "admin") {
    return ApiResponse.forbidden(res, "You can only cancel your own bookings");
  }

  booking.status = "Cancelled";
  booking.statusHistory.push({
    status: "Cancelled",
    changedAt: new Date(),
    note: req.body.reason || "Cancelled by user",
  });
  await booking.save();

  ApiResponse.success(res, booking, "Booking cancelled successfully");
});

module.exports = {
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
};
