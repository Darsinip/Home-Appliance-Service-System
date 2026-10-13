const Booking = require("../models/Booking");
const Technician = require("../models/Technician");

/**
 * Auto-assign the best available technician to a booking.
 * 
 * Selection criteria (priority order):
 * 1. Specialization match with the service category
 * 2. Active status and available
 * 3. Least current active jobs (workload balancing)
 * 
 * @param {string} bookingId - The booking ID to assign
 * @param {string} serviceCategory - The service category for specialization matching
 * @returns {Object|null} The assigned technician, or null if none available
 */
const autoAssignTechnician = async (bookingId, serviceCategory) => {
  try {
    // Find all active, available technicians
    const technicians = await Technician.find({
      status: "active",
      availability: true,
    });

    if (technicians.length === 0) return null;

    // Calculate workload for each technician
    const techsWithWorkload = await Promise.all(
      technicians.map(async (tech) => {
        const activeJobs = await Booking.countDocuments({
          technicianId: tech._id,
          status: { $in: ["Assigned", "In Progress"] },
        });

        // Score: higher is better
        // Specialization match gives +10 points
        // Lower workload gives more points
        let score = 100 - activeJobs * 10;

        if (
          serviceCategory &&
          (tech.specializations.includes(serviceCategory) ||
            tech.specialization === serviceCategory)
        ) {
          score += 10;
        }

        return { technician: tech, activeJobs, score };
      })
    );

    // Sort by score (highest first)
    techsWithWorkload.sort((a, b) => b.score - a.score);

    const bestMatch = techsWithWorkload[0];

    // Don't auto-assign if workload is too high (more than 5 active jobs)
    if (bestMatch.activeJobs >= 5) return null;

    // Assign the technician
    const booking = await Booking.findById(bookingId);
    if (!booking) return null;

    booking.technicianId = bestMatch.technician._id;
    booking.status = "Assigned";
    booking.statusHistory.push({
      status: "Assigned",
      changedAt: new Date(),
      note: `Auto-assigned to ${bestMatch.technician.name}`,
    });
    await booking.save();

    return bestMatch.technician;
  } catch (error) {
    console.error("Auto-assign error:", error.message);
    return null;
  }
};

module.exports = { autoAssignTechnician };
