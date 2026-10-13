# Home Appliance Service Management System - Backend

## Overview

The Home Appliance Service Management System Backend provides RESTful APIs for managing customers, administrators, technicians, services, bookings, payments, and AI chatbot integrations.

The backend is built using Node.js, Express.js, MongoDB, and JWT Authentication, following a scalable MVC architecture.

---

## Features

### Authentication & Authorization

- Customer Registration
- Customer Login
- Admin Login
- JWT Authentication
- Password Encryption using bcrypt
- Protected Routes
- Role-Based Access Control

---

### Service Management

- Add Service
- Update Service
- Delete Service
- View Services
- Service Categories
- Service Pricing

---

### Technician Management

- Add Technician
- Update Technician
- Delete Technician
- Assign Technicians to Bookings
- Technician Availability Tracking

---

### Booking Management

- Create Booking
- View Bookings
- Update Booking Status
- Cancel Booking
- Complete Booking

Booking Status Flow:

Pending → Assigned → In Progress → Completed

---

### Billing & Payments

- Service Charges
- Additional Charges
- Total Cost Calculation
- Invoice Generation Architecture

---

### AI Chatbot Support

- Gemini API Integration
- Customer Support Assistant
- FAQ Assistance
- Service Recommendations

---

### Automation Features

- Technician Auto Assignment
- Booking Notifications
- Scheduled Reports
- Revenue Reports

---

## Tech Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose ODM

### Authentication

- JWT
- bcryptjs

### Security

- Helmet
- Express Rate Limit
- CORS

### Logging

- Morgan

### AI

- Gemini API

---

## Folder Structure

home-service-backend/

├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── serviceController.js
│   ├── technicianController.js
│   ├── chatbotController.js
│   ├── dashboardController.js
│   └── notificationController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── validate.js
│
├── models/
│   ├── User.js
│   ├── Service.js
│   ├── Technician.js
│   ├── Booking.js
│   └── Notification.js
│
├── routes/
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── serviceRoutes.js
│   ├── technicianRoutes.js
│   ├── chatbotRoutes.js
│   ├── dashboardRoutes.js
│   └── notificationRoutes.js
│
├── utils/
│
├── .env
├── package.json
├── requirements.txt
├── README.md
└── server.js



---

## Environment Variables

Create a .env file

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/homeappliance

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key