// src/routes/payment_routes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../middlewares/validateAuthToken");
const paymentService = require("../sevices/payment_service");

// Function to check all parameters and design query accordingly
const AddPaymentEntry = async (Payment_info) => {
  const [order_id, payment_id, payment_signature, user] = Payment_info;

  try {
    const query = `
      INSERT INTO payments (order_id, payment_id, payment_signature, user_id, is_consumed)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [order_id, payment_id, payment_signature, user, false];

    const [result] = await db.execute(query, values); // or db.query based on your driver

    console.log("Payment entry added:", result);
    return {
      success: true,
      message: "Payment entry inserted",
      insertId: result.insertId,
    };
  } catch (err) {
    console.error("Error inserting payment entry:", err);
    return { success: false, message: "Failed to insert payment entry" };
  }
};

// Create Razorpay Order
router.post("/create-order", authenticateToken, async (req, res) => {
  const { amount } = req.body;
  console.log(req.body);
  console.log("Got req for (in paise): ", amount);

  try {
    console.log("order created!");
    const order = await paymentService.createOrder(amount);
    console.log(order);
    res.json({ success: true, data: order });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// Verify Razorpay Payment
router.post("/verify-payment", authenticateToken, async (req, res) => {
  console.log("Got req for Payment Verification): ");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const user = req.user;

  console.log(user);
  console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  const isValid = paymentService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (isValid) {
    // Mark payment successful in DB
    const info = [
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user.email,
    ];
    const is_registered = await AddPaymentEntry(info);
    if (is_registered.success) {
      console.log("Balle Balle!");
      res.status(200).json({ success: true, payment_registered: true });
    } else {
      res.json({ success: true, payment_registered: false });
    }
  } else {
    res.status(400).json({ success: false, error: "Invalid signature" });
  }
});

module.exports = router;
