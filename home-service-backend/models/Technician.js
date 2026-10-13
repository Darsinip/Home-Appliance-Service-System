const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Technician name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    specializations: [
      {
        type: String,
        enum: [
          "AC",
          "Washing Machine",
          "Refrigerator",
          "Microwave",
          "TV",
          "Water Purifier",
          "Geyser",
          "Chimney",
          "Electrical",
          "Plumbing",
          "Other",
        ],
      },
    ],
    // Keep legacy field for backward compatibility
    specialization: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    availability: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
technicianSchema.index({ status: 1, availability: 1 });
technicianSchema.index({ specializations: 1 });

module.exports = mongoose.model("Technician", technicianSchema);