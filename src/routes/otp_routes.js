const express = require('express');
const otpService = require("../services/otpService");
import { OTPLimiter } from '../middlewares/rateLimiter.js';
// const authenticateToken = require("../middlewares/validateAuthToken");


const router = express.Router();

// ------------------- OTP ROUTES -------------------

// POST - Send OTP
router.post('/send-otp',OTPLimiter, async (req, res) => {
    console.log("OTP send request received");
    try {
        const { phone } = req.body;
        const sendResult = await otpService.sendOTP(phone);
        if (sendResult.success) {
            res.status(200).json(sendResult);
        }
        else {
            res.status(400).json(sendResult);
        }
    } catch (error) {

        console.error("OTP Send Error:", error);
        res.status(500).json({ success: false, message: "Server error during OTP sending." });
    }
});

//  POST - Verify OTP
router.post('/verify-otp', async (req, res) => {
  console.log("OTP verification request received");
  try {
    const { otp, session_token } = req.body;

    const verificationResult = await otpService.verifyOTP(otp, session_token);
    if (verificationResult.success) {
      res.status(200).json(verificationResult);
    }
    else {
      res.status(400).json(verificationResult);
    }
    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({ success: false, message: "Server error during OTP verification." });
    }
});

module.exports = router;