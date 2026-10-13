/**
 * Database Seed Script
 * Creates admin user and sample data for demo/development.
 *
 * Usage: node utils/seed.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");
const Service = require("../models/Service");
const Technician = require("../models/Technician");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Drop existing data for a clean seed
    const isFresh = process.argv.includes("--fresh");
    if (isFresh) {
      await Service.deleteMany({});
      await Technician.deleteMany({});
      await User.deleteMany({ role: "admin" });
      console.log("🗑️  Cleared existing data (fresh seed)");
    }

    // ─── Create Admin User ───
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || "admin@homeservice.com" });
    if (!existingAdmin) {
      await User.create({
        name: "Admin",
        email: process.env.ADMIN_EMAIL || "admin@homeservice.com",
        phone: "9999999999",
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        role: "admin",
      });
      console.log("✅ Admin user created (admin@homeservice.com / Admin@123)");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // ─── Create Sample Services ───
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany([
        {
          serviceName: "AC Installation",
          description: "Professional split & window AC installation with copper piping and gas charging.",
          category: "AC",
          price: 1499,
          duration: "2-3 hours",
          rating: 4.8,
          reviewCount: 234,
        },
        {
          serviceName: "AC Repair & Gas Refill",
          description: "Complete AC diagnosis, gas refilling, and repair for all brands.",
          category: "AC",
          price: 799,
          duration: "1-2 hours",
          rating: 4.7,
          reviewCount: 189,
        },
        {
          serviceName: "AC Deep Cleaning",
          description: "Thorough cleaning of indoor & outdoor units with foam jet technology.",
          category: "AC",
          price: 499,
          duration: "1 hour",
          rating: 4.9,
          reviewCount: 412,
        },
        {
          serviceName: "Washing Machine Repair",
          description: "Fix motor, drum, drainage and electrical issues for front & top load machines.",
          category: "Washing Machine",
          price: 399,
          duration: "1-2 hours",
          rating: 4.6,
          reviewCount: 156,
        },
        {
          serviceName: "Washing Machine Installation",
          description: "Complete installation with inlet/outlet connection and demo run.",
          category: "Washing Machine",
          price: 599,
          duration: "1-2 hours",
          rating: 4.5,
          reviewCount: 98,
        },
        {
          serviceName: "Refrigerator Repair",
          description: "Cooling issue, gas filling, thermostat repair for all refrigerator types.",
          category: "Refrigerator",
          price: 449,
          duration: "1-2 hours",
          rating: 4.7,
          reviewCount: 203,
        },
        {
          serviceName: "Microwave Repair",
          description: "Magnetron replacement, turntable motor fix, and display panel repair.",
          category: "Microwave",
          price: 349,
          duration: "1 hour",
          rating: 4.4,
          reviewCount: 87,
        },
        {
          serviceName: "TV Wall Mounting",
          description: "Professional TV mounting with concealed wiring for LED/OLED/QLED TVs.",
          category: "TV",
          price: 599,
          duration: "1-2 hours",
          rating: 4.8,
          reviewCount: 167,
        },
        {
          serviceName: "Water Purifier Service",
          description: "Complete RO service including filter replacement, membrane cleaning, and sanitization.",
          category: "Water Purifier",
          price: 649,
          duration: "1 hour",
          rating: 4.6,
          reviewCount: 142,
        },
        {
          serviceName: "Geyser Repair & Installation",
          description: "Electric and gas geyser installation, thermostat fix, and element replacement.",
          category: "Geyser",
          price: 499,
          duration: "1-2 hours",
          rating: 4.5,
          reviewCount: 93,
        },
        {
          serviceName: "Kitchen Chimney Service",
          description: "Deep cleaning, motor repair, and auto-clean chimney servicing.",
          category: "Chimney",
          price: 549,
          duration: "1-2 hours",
          rating: 4.4,
          reviewCount: 76,
        },
        {
          serviceName: "Electrical Wiring & Repair",
          description: "Switch board installation, wiring repair, MCB/fuse replacement.",
          category: "Electrical",
          price: 299,
          duration: "1-3 hours",
          rating: 4.6,
          reviewCount: 267,
        },
      ]);
      console.log("✅ 12 sample services created");
    } else {
      console.log(`ℹ️  ${serviceCount} services already exist`);
    }

    // ─── Create Sample Technicians ───
    const techCount = await Technician.countDocuments();
    if (techCount === 0) {
      await Technician.insertMany([
        {
          name: "Rajesh Kumar",
          email: "rajesh@homeservice.com",
          phone: "9876543001",
          specialization: "AC",
          specializations: ["AC", "Refrigerator"],
          status: "active",
          availability: true,
          rating: 4.8,
          completedJobs: 156,
        },
        {
          name: "Suresh Patel",
          email: "suresh@homeservice.com",
          phone: "9876543002",
          specialization: "Washing Machine",
          specializations: ["Washing Machine", "Geyser"],
          status: "active",
          availability: true,
          rating: 4.7,
          completedJobs: 132,
        },
        {
          name: "Amit Singh",
          email: "amit@homeservice.com",
          phone: "9876543003",
          specialization: "Electrical",
          specializations: ["Electrical", "TV", "Microwave"],
          status: "active",
          availability: true,
          rating: 4.9,
          completedJobs: 201,
        },
        {
          name: "Vijay Sharma",
          email: "vijay@homeservice.com",
          phone: "9876543004",
          specialization: "Refrigerator",
          specializations: ["Refrigerator", "Water Purifier"],
          status: "active",
          availability: true,
          rating: 4.6,
          completedJobs: 98,
        },
        {
          name: "Manoj Verma",
          email: "manoj@homeservice.com",
          phone: "9876543005",
          specialization: "Plumbing",
          specializations: ["Plumbing", "Geyser", "Chimney"],
          status: "active",
          availability: true,
          rating: 4.5,
          completedJobs: 87,
        },
      ]);
      console.log("✅ 5 sample technicians created");
    } else {
      console.log(`ℹ️  ${techCount} technicians already exist`);
    }

    console.log("\n🎉 Seed complete!\n");
    console.log("Admin Login Credentials:");
    console.log("  Email:    admin@homeservice.com");
    console.log("  Password: Admin@123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedData();
