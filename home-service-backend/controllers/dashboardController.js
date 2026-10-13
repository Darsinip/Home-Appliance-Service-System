const User = require("../models/User");
const Service = require("../models/Service");
const Technician = require("../models/Technician");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

/**
 * @route   GET /api/dashboard
 * @desc    Get admin dashboard statistics
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Count queries in parallel
  const [
    customers,
    services,
    technicians,
    totalBookings,
    pendingBookings,
    assignedBookings,
    inProgressBookings,
    completedBookings,
    cancelledBookings,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Service.countDocuments({ isActive: true }),
    Technician.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "Pending" }),
    Booking.countDocuments({ status: "Assigned" }),
    Booking.countDocuments({ status: "In Progress" }),
    Booking.countDocuments({ status: "Completed" }),
    Booking.countDocuments({ status: "Cancelled" }),
  ]);

  // Revenue aggregation
  const revenueResult = await Booking.aggregate([
    { $match: { status: "Completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Monthly revenue (current month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyRevenueResult = await Booking.aggregate([
    {
      $match: {
        status: "Completed",
        createdAt: { $gte: startOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const monthlyRevenue =
    monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

  // Weekly revenue (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyRevenueResult = await Booking.aggregate([
    {
      $match: {
        status: "Completed",
        createdAt: { $gte: weekAgo },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const weeklyRevenue =
    weeklyRevenueResult.length > 0 ? weeklyRevenueResult[0].total : 0;

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate("customerId", "name email")
    .populate("serviceId", "serviceName price")
    .populate("technicianId", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  // Monthly booking trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrend = await Booking.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Category distribution
  const categoryDistribution = await Booking.aggregate([
    {
      $lookup: {
        from: "services",
        localField: "serviceId",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: "$service" },
    {
      $group: {
        _id: "$service.category",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  ApiResponse.success(res, {
    customers,
    services,
    technicians,
    bookings: totalBookings,
    pendingBookings,
    assignedBookings,
    inProgressBookings,
    completedBookings,
    cancelledBookings,
    revenue: totalRevenue,
    monthlyRevenue,
    weeklyRevenue,
    recentBookings,
    monthlyTrend,
    categoryDistribution,
  });
});

module.exports = {
  getDashboardStats,
};
