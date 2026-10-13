const Service = require("../models/Service");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { generateGeminiReply } = require("../services/geminiService");
const { buildSystemInstruction } = require("../services/chatbotPrompt");

const conversations = new Map();
const MAX_HISTORY_MESSAGES = 12;

const getConversationKey = (req, sessionId) =>
  req.user?.id ? `user:${req.user.id}` : `guest:${sessionId}`;

const getBusinessContext = async (userId) => {
  const services = await Service.find({ isActive: true })
    .select("serviceName category price duration description")
    .lean();
  const bookings = userId
    ? await Booking.find({ customerId: userId })
        .populate("serviceId", "serviceName")
        .populate("technicianId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    : [];

  return {
    services: services.map((service) => `${service.serviceName} (${service.category}): ₹${service.price}; ${service.duration}`).join(" | "),
    bookings: bookings.length
      ? bookings.map((booking) => `${booking.serviceId?.serviceName || "Service"} on ${booking.date} at ${booking.time}: ${booking.status}${booking.technicianId?.name ? `, technician ${booking.technicianId.name}` : ""}`).join(" | ")
      : "None available.",
  };
};

const getBookingStatusReply = async (userId) => {
  if (!userId) {
    return "Please sign in to view your booking status. Once signed in, open My Bookings to see the complete timeline and bill.";
  }

  const bookings = await Booking.find({ customerId: userId, status: { $ne: "Cancelled" } })
    .populate("serviceId", "serviceName")
    .populate("technicianId", "name")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  if (!bookings.length) return "You do not have an active booking right now. You can browse Services to create one.";

  const details = bookings.map((booking, index) => {
    const technician = booking.technicianId?.name || "Awaiting technician assignment";
    return `${index + 1}. ${booking.serviceId?.serviceName || "Service"}\nStatus: ${booking.status}\nSchedule: ${booking.date} at ${booking.time}\nTechnician: ${technician}`;
  });

  return `Here ${bookings.length === 1 ? "is your active booking" : "are your active bookings"}:\n\n${details.join("\n\n")}\n\nOpen My Bookings for the full timeline and billing details.`;
};

/**
 * Rule-based chatbot engine.
 * Provides context-aware responses about services, pricing, bookings, and FAQs.
 * 
 * Architecture: Pluggable LLM adapter pattern.
 * To integrate an LLM, implement the `llmHandler` function and set LLM_PROVIDER in .env.
 */

// FAQ knowledge base
const faqData = [
  {
    keywords: ["price", "cost", "charge", "rate", "how much", "pricing", "fee"],
    response:
      "Our service prices vary depending on the type. AC services start from ₹499, Washing Machine repairs from ₹399, and Refrigerator services from ₹449. Visit our Services page for detailed pricing!",
  },
  {
    keywords: ["book", "booking", "schedule", "appointment", "how to book"],
    response:
      "To book a service: 1️⃣ Browse our Services page, 2️⃣ Select a service, 3️⃣ Choose your preferred date and time, 4️⃣ Enter your address and any notes, 5️⃣ Confirm your booking. It's that simple!",
  },
  {
    keywords: ["status", "track", "where", "update", "progress"],
    response:
      "You can track your booking status on the 'My Bookings' page. Your booking goes through: Pending → Technician Assigned → In Progress → Completed. You'll receive notifications at each step!",
  },
  {
    keywords: ["cancel", "cancellation", "refund"],
    response:
      "You can cancel a booking from the 'My Bookings' page as long as it's in 'Pending' or 'Assigned' status. Once work is in progress, cancellation is not available.",
  },
  {
    keywords: ["payment", "pay", "bill", "invoice"],
    response:
      "Payment is calculated after service completion. It includes service charge, spare parts cost (if any), and applicable taxes. You can view your detailed bill on the 'My Bookings' page.",
  },
  {
    keywords: ["technician", "who", "expert", "qualified"],
    response:
      "All our technicians are verified professionals with expertise in their respective fields. They are automatically assigned based on specialization and availability to ensure the best service quality.",
  },
  {
    keywords: ["time", "duration", "how long", "hours"],
    response:
      "Most services take 1-2 hours. Complex repairs might take longer. Your technician will give you a time estimate once they assess the appliance.",
  },
  {
    keywords: ["warranty", "guarantee"],
    response:
      "We provide a 30-day service warranty on all repairs. If the same issue recurs, we'll fix it free of charge!",
  },
  {
    keywords: ["contact", "support", "help", "call", "phone", "email"],
    response:
      "You can reach us at support@homeservice.com or call us at +91-9876543210. Our support team is available Mon-Sat, 9 AM to 6 PM.",
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"],
    response:
      "Hello! 👋 Welcome to Home Appliance Service! How can I help you today? You can ask me about our services, pricing, booking process, or anything else!",
  },
  {
    keywords: ["thank", "thanks", "bye", "goodbye"],
    response:
      "Thank you for choosing Home Appliance Service! 🙏 If you need anything else, feel free to ask. Have a great day!",
  },
];

/**
 * Find the best matching FAQ response for a message.
 */
const findBestMatch = (message) => {
  const lowerMessage = message.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const faq of faqData) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (lowerMessage.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestMatch;
};

/**
 * @route   POST /api/chatbot
 * @desc    Handle chatbot message
 */
const handleMessage = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || message.trim() === "") {
    return ApiResponse.badRequest(res, "Message is required");
  }

  if (!sessionId || typeof sessionId !== "string" || sessionId.length > 100) {
    return ApiResponse.badRequest(res, "A valid chat session is required");
  }

  const provider = process.env.LLM_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "rule-based");
  const conversationKey = getConversationKey(req, sessionId);
  const history = conversations.get(conversationKey) || [];
  const isStatusQuestion = /\b(booking|service)\b.*\b(status|track|update)\b|\b(status|track|update)\b.*\b(booking|service)\b/i.test(message);

  let response;
  let responseProvider = "rule-based";

  if (isStatusQuestion) {
    response = await getBookingStatusReply(req.user?.id);
  } else if (provider === "gemini") {
    try {
      const context = await getBusinessContext(req.user?.id);
      response = await generateGeminiReply({
        systemInstruction: buildSystemInstruction(context),
        history: [...history, { role: "user", text: message.trim() }],
      });
      responseProvider = "gemini";
    } catch (error) {
      console.error("Gemini chatbot error:", error.message);
    }
  }

  if (!response) {
    // Rule-based engine
    const match = findBestMatch(message);

    if (match) {
      response = match.response;
    } else {
      // Check if asking about specific services
      const lowerMsg = message.toLowerCase();
      const services = await Service.find({ isActive: true });
      const serviceMatch = services.find(
        (s) =>
          lowerMsg.includes(s.serviceName.toLowerCase()) ||
          lowerMsg.includes(s.category.toLowerCase())
      );

      if (serviceMatch) {
        response = `**${serviceMatch.serviceName}** — ${serviceMatch.description || "Professional service."} Price: ₹${serviceMatch.price}. Duration: ${serviceMatch.duration}. Would you like to book this service?`;
      } else {
        response =
          "I'm not sure about that, but I'm here to help! You can ask me about:\n\n• **Services** — What services we offer\n• **Pricing** — How much services cost\n• **Booking** — How to book a service\n• **Status** — Track your booking\n• **Payment** — Billing and invoices\n• **Contact** — Reach our support team\n\nOr visit our Services page to browse all available services!";
      }
    }
  }

  conversations.set(conversationKey, [
    ...history,
    { role: "user", text: message.trim() },
    { role: "assistant", text: response },
  ].slice(-MAX_HISTORY_MESSAGES));

  ApiResponse.success(res, {
    message: response,
    provider: responseProvider,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/chatbot/suggestions
 * @desc    Get chat suggestion prompts
 */
const getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = [
    "What services do you offer?",
    "How much does AC repair cost?",
    "How do I book a service?",
    "How can I track my booking?",
    "What is your cancellation policy?",
    "Do you offer warranty?",
  ];

  ApiResponse.success(res, suggestions);
});

module.exports = {
  handleMessage,
  getSuggestions,
};
