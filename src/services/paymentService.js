// src/services/payment_service.js
const Razorpay = require("razorpay");
const crypto = require("crypto")

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.createOrder = async (amountInPaise) => {
  const options = {
    amount: amountInPaise, // e.g., 5000 = ₹50.00
    currency: "INR",
    receipt: `rcptid_${Date.now()}`,
  };

  return await razorpay.orders.create(options);
};


exports.verifyPayment = (order_id, payment_id, signature) => {
  const body = order_id + "|" + payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};

