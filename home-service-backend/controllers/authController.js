const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.badRequest(res, "User with this email already exists");
  }

  // Create user (password hashing handled by pre-save hook)
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: "customer",
  });

  const token = generateToken(user);

  ApiResponse.created(res, {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  }, "Registration successful");
});

/**
 * @route   POST /api/auth/login
 * @desc    Login a customer
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field included
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return ApiResponse.badRequest(res, "Invalid email or password");
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return ApiResponse.badRequest(res, "Invalid email or password");
  }

  const token = generateToken(user);

  ApiResponse.success(res, {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
    },
  }, "Login successful");
});

/**
 * @route   POST /api/auth/admin-login
 * @desc    Login as admin
 */
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: "admin" }).select("+password");

  if (!admin) {
    return ApiResponse.badRequest(res, "Invalid admin credentials");
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return ApiResponse.badRequest(res, "Invalid admin credentials");
  }

  const token = generateToken(admin);

  ApiResponse.success(res, {
    token,
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  }, "Admin login successful");
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return ApiResponse.notFound(res, "User not found");
  }
  ApiResponse.success(res, user);
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, address },
    { new: true, runValidators: true }
  );

  if (!user) {
    return ApiResponse.notFound(res, "User not found");
  }

  ApiResponse.success(res, user, "Profile updated successfully");
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return ApiResponse.notFound(res, "User not found");
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return ApiResponse.badRequest(res, "Current password is incorrect");
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, null, "Password changed successfully");
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (stub - generates token)
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists
    return ApiResponse.success(res, null, "If that email exists, a reset link has been sent");
  }

  // Generate reset token
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save({ validateBeforeSave: false });

  // In production, send email with reset link
  // For now, return the token (development only)
  const responseData = process.env.NODE_ENV === "development" ? { resetToken } : null;

  ApiResponse.success(res, responseData, "If that email exists, a reset link has been sent");
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 */
const resetPassword = asyncHandler(async (req, res) => {
  const crypto = require("crypto");
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return ApiResponse.badRequest(res, "Invalid or expired reset token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  ApiResponse.success(res, null, "Password reset successful");
});

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};