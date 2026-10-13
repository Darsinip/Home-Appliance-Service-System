const Service = require("../models/Service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

/**
 * @route   POST /api/services
 * @desc    Add a new service (Admin)
 */
const addService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  ApiResponse.created(res, service, "Service added successfully");
});

/**
 * @route   GET /api/services
 * @desc    Get all active services (with optional search/filter)
 */
const getServices = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort } = req.query;

  let query = { isActive: true };

  // Category filter
  if (category && category !== "All") {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Search by name or description
  if (search) {
    query.$or = [
      { serviceName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Sort options
  let sortOption = { createdAt: -1 };
  if (sort === "price-low") sortOption = { price: 1 };
  else if (sort === "price-high") sortOption = { price: -1 };
  else if (sort === "rating") sortOption = { rating: -1 };
  else if (sort === "name") sortOption = { serviceName: 1 };

  const services = await Service.find(query).sort(sortOption);

  ApiResponse.success(res, services);
});

/**
 * @route   GET /api/services/all
 * @desc    Get all services including inactive (Admin)
 */
const getAllServicesAdmin = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  ApiResponse.success(res, services);
});

/**
 * @route   GET /api/services/categories
 * @desc    Get all unique categories with counts
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Service.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  ApiResponse.success(res, categories);
});

/**
 * @route   GET /api/services/:id
 * @desc    Get single service by ID
 */
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return ApiResponse.notFound(res, "Service not found");
  }
  ApiResponse.success(res, service);
});

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service (Admin)
 */
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!service) {
    return ApiResponse.notFound(res, "Service not found");
  }

  ApiResponse.success(res, service, "Service updated successfully");
});

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service (Admin)
 */
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    return ApiResponse.notFound(res, "Service not found");
  }
  ApiResponse.success(res, null, "Service deleted successfully");
});

module.exports = {
  addService,
  getServices,
  getAllServicesAdmin,
  getCategories,
  getServiceById,
  updateService,
  deleteService,
};