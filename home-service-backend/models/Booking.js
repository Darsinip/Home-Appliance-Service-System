const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service is required"],
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      default: null,
    },
    date: {
      type: String,
      required: [true, "Preferred date is required"],
    },
    time: {
      type: String,
      required: [true, "Preferred time is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    billing: {
      serviceCharge: { type: Number, default: 0 },
      spareParts: { type: Number, default: 0 },
      additionalCharges: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    // Legacy field - kept for backward compatibility
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ technicianId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

// Pre-save: initialize status history on create
bookingSchema.pre("save", function () {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: "Pending",
      changedAt: new Date(),
      note: "Booking created",
    });
  }
});

module.exports = mongoose.model("Booking", bookingSchema);