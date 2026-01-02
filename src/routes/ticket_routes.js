// Ticket Support Routes
const express = require("express");
const authenticateToken = require("../middlewares/validateAuthToken");

// Import service
const ticketService = require("../services/ticketService");
const userService = require("../services/userService");

const routes = express.Router();

// ==================== TICKET ROUTES ====================

// GET - Health check
routes.get("/", (req, res) => {
  console.log("GET request received - Ticket Routes");
  res.json({
    message: "Ticket Support API is running successfully.",
  });
});

// POST - Create a new support ticket
routes.post("/create", authenticateToken, async (req, res) => {
  console.log("POST request received - Create Ticket");
  try {
    const user_id = req.user.id;
    // const user_email = req.body.email;
    // const user_phone = req.body.phone || null;
    const { subject, category, message, booking_id } = req.body;

    // Validate user exists
    const checkExist = await userService.checkUserExists(null, null, user_id);
    if (!checkExist) {
      return res.status(403).json({ success: false, error: "Invalid User or Token" });
    }

    // Validate required fields
    if (!subject || !category || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject, category, and message are required.",
      });
    }

    const ticketData = {
      subject,
      category,
      message,
      booking_id: booking_id || null,
    };

    const response = await ticketService.createTicket(user_id, ticketData);
    res.status(response.success ? 201 : 400).json(response);
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating ticket." });
  }
});

// POST - Get all tickets for the authenticated user
routes.post("/user/all", authenticateToken, async (req, res) => {
  console.log("POST request received - Get User Tickets");
  try {
    const user_id = req.user.id;
    // const user_email = req.body.email;
    // const user_phone = req.body.phone || null;

    // Validate user exists
    const checkExist = await userService.checkUserExists(null, null, user_id);
    if (!checkExist) {
      return res.status(403).json({ success: false, error: "Invalid User or Token" });
    }

    const response = await ticketService.getUserTickets(user_id);
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get User Tickets Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching tickets." });
  }
});

// GET - Get ticket details by ID
routes.post("/details/:ticket_id", authenticateToken, async (req, res) => {
  console.log("GET request received - Get Ticket Details");
  try {
    const user_id = req.user.id;
    // const user_email = req.body.email;
    // const user_phone = req.body.phone || null;
    const { ticket_id } = req.params;

    // Validate user exists
    const checkExist = await userService.checkUserExists(null, null, user_id);
    if (!checkExist) {
      return res.status(403).json({ success: false, error: "Invalid User or Token" });
    }

    const response = await ticketService.getTicketDetails(ticket_id);
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get Ticket Details Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching ticket details." });
  }
});

// GET - Get all tickets for support team/admin (without authentication check for internal use)
routes.get("/admin/all", async (req, res) => {
  console.log("GET request received - Get All Tickets (Admin)");
  try {
    const response = await ticketService.getAllTickets();
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get All Tickets Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching tickets." });
  }
});

// GET - Get tickets by status
routes.get("/admin/status/:status", async (req, res) => {
  console.log("GET request received - Get Tickets by Status");
  try {
    const { status } = req.params;

    // Validate status parameter
    if (![0, 1].includes(parseInt(status))) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Status must be 0 (open) or 1 (closed).",
      });
    }

    const response = await ticketService.getTicketsByStatus(parseInt(status));
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get Tickets by Status Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching tickets." });
  }
});

// GET - Get tickets by category
routes.get("/admin/category/:category", async (req, res) => {
  console.log("GET request received - Get Tickets by Category");
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    const response = await ticketService.getTicketsByCategory(category);
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get Tickets by Category Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching tickets." });
  }
});

// PUT - Update ticket status (for support team/admin)
routes.put("/admin/update-status/:ticket_id", async (req, res) => {
  console.log("PUT request received - Update Ticket Status");
  try {
    const { ticket_id } = req.params;
    const { status } = req.body;

    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const response = await ticketService.updateTicketStatus(ticket_id, parseInt(status));
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update Ticket Status Error:", error);
    res.status(500).json({ success: false, message: "Server error while updating ticket status." });
  }
});

module.exports = routes;
