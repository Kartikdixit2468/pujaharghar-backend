const db = require("../config/db");
const { convertStringToDate } = require("../utils/dateUtils");

const createBooking = async (user_email, booking_info) => {
  const { package_id, dateOption, date, priest_id, payment_id } = booking_info;

  try {
    // 1. Check if payment_id exists and is not consumed
    const [paymentRows] = await db.execute(
      'SELECT * FROM payments WHERE payment_id = ? AND is_consumed = 0',
      [payment_id]
    );

    if (paymentRows.length === 0) {
      return { 
        success: false, 
        message: 'Payment ID is invalid or already used.' 
      };
    }

    // 2. Determine date and is_date_assured based on dateOption
    const bookingDate = dateOption === 'specific' ? convertStringToDate(date) : null;
    const isDateAssured = dateOption === 'specific' ? 1 : 0;

    // 3. Insert into bookings table
    const [insertResult] = await db.execute(
      `INSERT INTO bookings (Email, package_id, date, payment, is_date_assured, is_confirmed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_email, package_id, bookingDate, 50, isDateAssured, 1]
    );

    // 4. Update payments table: mark is_consumed = 1
    await db.execute(
      'UPDATE payments SET is_consumed = 1 WHERE payment_id = ?',
      [payment_id]
    );

    return { 
      success: true, 
      booking_id: insertResult.insertId,
      message: 'Booking created successfully.' 
    };
  } catch (error) {
    console.error('Error processing booking:', error);
    return { 
      success: false, 
      message: 'Server error while processing booking.' 
    };
  }
};

module.exports = { createBooking };
