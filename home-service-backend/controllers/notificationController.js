const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false,
  });

  ApiResponse.success(res, { notifications, unreadCount });
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 */
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );
  ApiResponse.success(res, null, "All notifications marked as read");
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a single notification as read
 */
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return ApiResponse.notFound(res, "Notification not found");
  }

  ApiResponse.success(res, notification);
});

module.exports = {
  getNotifications,
  markAllRead,
  markRead,
};
