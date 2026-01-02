const db = require("../config/db");
const { convertStringToDate } = require("../utils/dateUtils");

const createBooking = async (id, user_email, user_phone, booking_info) => {
  const { package_id, dateOption, date, priest_id, payment_id } = booking_info;

  try {
    // 1. Check if payment_id exists and is not consumed
    const [paymentRows] = await db.execute(
      "SELECT * FROM payments WHERE payment_id = ? AND is_consumed = 0",
      [payment_id]
    );

    if (paymentRows.length === 0) {
      return {
        success: false,
        message: "Payment ID is invalid or already used.",
      };
    }

    // 2. Determine date and is_date_assured based on dateOption
    const bookingDate =
      dateOption === "specific" ? convertStringToDate(date) : null;
    const isDateAssured = dateOption === "specific" ? 1 : 0;

    // 3. Insert into bookings table
    const [insertResult] = await db.execute(
      `INSERT INTO bookings (user_id, Email, phone, package_id, date, payment, payment_id, is_date_assured, is_confirmed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user_email,
        user_phone,
        package_id,
        bookingDate,
        50,
        payment_id,
        isDateAssured,
        1,
      ]
    );

    // 4. Update payments table: mark is_consumed = 1
    await db.execute(
      "UPDATE payments SET is_consumed = 1 WHERE payment_id = ?",
      [payment_id]
    );

    return {
      success: true,
      booking_id: insertResult.insertId,
      message: "Booking created successfully.",
    };
  } catch (error) {
    console.error("Error processing booking:", error);
    return {
      success: false,
      message: "Server error while processing booking.",
    };
  }
};

const getAllBookings = async (user_id) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
        b.booking_id, 
        b.date, 
        b.booked_on,
        b.is_date_assured, 
        b.is_confirmed, 
        b.payment,
        pj.NAME as puja_name,
        p.name as package_name, 
        p.price
       FROM bookings b
       JOIN package p ON b.package_id = p.package_id
       JOIN puja pj ON p.puja_id = pj.puja_id
       WHERE b.user_id = ?`,
      [user_id]
    );

    // Format the response to show "Puja Name (Package Name)"
    const bookings = rows.map((booking) => ({
      booking_id: booking.booking_id,
      date: booking.date,
      booked_on: booking.booked_on,
      is_date_assured: booking.is_date_assured,
      is_confirmed: booking.is_confirmed,
      payment: booking.payment,
      name: `${booking.puja_name} (${booking.package_name})`,
      price: booking.price,
    }));
    return { success: true, bookings: bookings };
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    return { success: false, message: "Server error while fetching bookings." };
  }
};

const getRecentBookings = async (user_id, limit = 3) => {
  console.log("Fetching recent bookings for user ID:", user_id);
  console.log("Limit:", limit);
  try {
    if (isNaN(limit) || limit <= 0) limit = 3;
    const [rows] = await db.execute(
      `SELECT
        b.booking_id,
        b.date,
        b.booked_on,
        b.is_date_assured,
        b.is_confirmed,
        b.payment,
        pj.NAME AS puja_name,
        p.name AS package_name,
        p.price,
        pj.img1,
        pj.img2
      FROM bookings b
      JOIN package p ON b.package_id = p.package_id
      JOIN puja pj ON p.puja_id = pj.puja_id
      WHERE b.user_id = ?
      ORDER BY b.booked_on DESC
      LIMIT ${limit}`,   // NOT TO USE AS A PLACEHOLDER
      [user_id]
    );

    const bookings = rows.map((booking) => ({
      booking_id: booking.booking_id,
      date: booking.date,
      booked_on: booking.booked_on,
      is_date_assured: booking.is_date_assured,
      is_confirmed: booking.is_confirmed,
      payment: booking.payment,
      name: `${booking.puja_name} (${booking.package_name})`,
      price: booking.price,
      images: [booking.img1, booking.img2],
    }));
    return { success: true, bookings: bookings };
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    return {
      success: false,
      message: "Server error while fetching recent bookings.",
    };
  }
};

const getBookingDetails = async (booking_id) => {
  try {
    const [rows] = await db.execute(
      `SELECT
        b.booking_id,
        b.date,
        b.booked_on,
        b.is_date_assured,
        b.is_confirmed,
        b.payment,
        pj.NAME as puja_name,
        p.name as package_name,
        p.price
      FROM bookings b
      JOIN package p ON b.package_id = p.package_id
      JOIN puja pj ON p.puja_id = pj.puja_id
      WHERE b.booking_id = ?`,
      [booking_id]
    );
    if (rows.length === 0) {
      return { success: false, message: "Booking not found." };
    }
    const booking = rows[0];
    const bookingDetails = {
      booking_id: booking.booking_id,
      date: booking.date,
      is_date_assured: booking.is_date_assured,
      booked_on: booking.booked_on,
      is_confirmed: booking.is_confirmed,
      payment: booking.payment,
      name: `${booking.puja_name} (${booking.package_name})`,
      price: booking.price,
      amount_paid: booking.payment * booking.price * 0.01,
    };
    return { success: true, booking: bookingDetails };
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return {
      success: false,
      message: "Server error while fetching booking details.",
    };
  }
};

// # for cancel booking just update the status (is_confirmed) to -1 in the database
const cancelBooking = async (booking_id) => {
  try {
    const [result] = await db.execute(
      "UPDATE bookings SET is_confirmed = -1 WHERE booking_id = ?",
      [booking_id]
    );
    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Booking not found or already cancelled.",
      };
    }
    return { success: true, message: "Booking cancelled successfully." };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      message: "Server error while cancelling booking.",
    };
  }
};

// alter the cancellation_request table by adding a new entry
// with booking_id, email and phone. Date and status will be set automatically

const requestBookingCancellation = async (
  booking_id,
  user_id,
  reason
) => {
  try {
      if (!user_id) {
        return {
          success: false,
          message: "User ID is required to request cancellation.",
        };
      }
    console.log(
      "Requesting cancellation for booking_id:",
      booking_id,
      user_id
    );
    const [result] = await db.execute(
      `INSERT INTO cancellation_request (booking_id, user_id, reason)
        VALUES (?, ?, ?)`,
      [booking_id, user_id, reason]
    );
    return {
      success: true,
      message: "Cancellation request submitted successfully.",
    };
  } catch (error) {
    console.error("Error requesting booking cancellation:", error);
    return {
      success: false,
      message: "Server error while requesting cancellation.",
    };
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingDetails,
  cancelBooking,
  requestBookingCancellation,
  getRecentBookings,
};
