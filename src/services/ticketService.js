const db = require("../config/db");

// Create a new support ticket
const createTicket = async (user_id, ticketData) => {
  const { subject, category, message, booking_id } = ticketData;

  try {
    // Validate required fields
    if (!subject || !category || !message) {
      return {
        success: false,
        message: "Subject, category, and message are required.",
      };
    }

    // Insert ticket into database
    const [insertResult] = await db.execute(
      `INSERT INTO tickets (user_id, subject, category, message, booking_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, subject, category, message, booking_id || null, 0]
    );

    return {
      success: true,
      ticket_id: insertResult.insertId,
      message: "Support ticket created successfully.",
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return {
      success: false,
      message: "Server error while creating ticket.",
    };
  }
};

// Get all tickets for a user
const getUserTickets = async (user_id) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM tickets 
       WHERE user_id = ? 
       ORDER BY id DESC`,
      [user_id]
    );

    return {
      success: true,
      tickets: rows,
    };
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return {
      success: false,
      message: "Server error while fetching tickets.",
    };
  }
};

// Get ticket details by ID
const getTicketDetails = async (ticket_id) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM tickets WHERE id = ?`,
      [ticket_id]
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: "Ticket not found.",
      };
    }

    return {
      success: true,
      ticket: rows[0],
    };
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    return {
      success: false,
      message: "Server error while fetching ticket details.",
    };
  }
};

// Update ticket status
const updateTicketStatus = async (ticket_id, status) => {
  try {
    // Validate status (0 = open, 1 = closed/resolved)
    if (![0, 1].includes(status)) {
      return {
        success: false,
        message: "Invalid status. Status must be 0 (open) or 1 (closed).",
      };
    }

    const [updateResult] = await db.execute(
      `UPDATE tickets SET status = ? WHERE id = ?`,
      [status, ticket_id]
    );

    if (updateResult.affectedRows === 0) {
      return {
        success: false,
        message: "Ticket not found.",
      };
    }

    return {
      success: true,
      message: "Ticket status updated successfully.",
    };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return {
      success: false,
      message: "Server error while updating ticket status.",
    };
  }
};

// Get all tickets (for admin/support team)
const getAllTickets = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM tickets ORDER BY status ASC, id DESC`
    );

    return {
      success: true,
      tickets: rows,
    };
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    return {
      success: false,
      message: "Server error while fetching tickets.",
    };
  }
};

// Get tickets by status
const getTicketsByStatus = async (status) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM tickets WHERE status = ? ORDER BY id DESC`,
      [status]
    );

    return {
      success: true,
      tickets: rows,
    };
  } catch (error) {
    console.error("Error fetching tickets by status:", error);
    return {
      success: false,
      message: "Server error while fetching tickets.",
    };
  }
};

// Get tickets by category
const getTicketsByCategory = async (category) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM tickets WHERE category = ? ORDER BY id DESC`,
      [category]
    );

    return {
      success: true,
      tickets: rows,
    };
  } catch (error) {
    console.error("Error fetching tickets by category:", error);
    return {
      success: false,
      message: "Server error while fetching tickets.",
    };
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicketDetails,
  updateTicketStatus,
  getAllTickets,
  getTicketsByStatus,
  getTicketsByCategory,
};
