// Build with proud by Kartik Dixit!
const express = require("express");
const authenticateToken = require("../middlewares/validateAuthToken");
const { authLimiter } = require("../middlewares/rateLimiter");

// Import services
const userService = require("../services/userService");
const pujaService = require("../services/pujaService");
const packageService = require("../services/packageService");
const priestService = require("../services/priestService");
const bookingService = require("../services/bookingService");
const otpService = require("../services/otpService");

const routes = express.Router();

// ==================== USER ROUTES ====================

routes.get("/", (req, res) => {
  console.log("GET request received");
  res.json({
    message: "Hello, server running successfully. and this is for Clients.",
  });
});

routes.post("/register/user", async (req, res) => {
  console.log("POST request received - User Registration");
  try {
    const user_data = req.body;
    const response = await userService.registerUser(user_data);
    res.json(response);
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

routes.post("/check/register/user/manual", async (req, res) => {
  console.log("POST request received - Manual User Registration check*");

  const user_email = req.body.email || null;
  const user_phone = req.body.phone || null;

  const checkifRegistrationAllowed =
    await userService.checkMannualAuthentication(user_email, user_phone);

  if (!checkifRegistrationAllowed.success) {
    console.log(
      "Manual registration not allowed for user:",
      user_email,
      user_phone
    );
    console.log("Reason:", checkifRegistrationAllowed.message);
    return res
      .status(403)
      .json({ success: false, message: checkifRegistrationAllowed.message });
  }

  else if (checkifRegistrationAllowed.registerUser) {
    return res
      .status(200)
      .json({ success: true, registerUser: true, loginUser: false, message: checkifRegistrationAllowed.message });
  }
  else if (checkifRegistrationAllowed.loginUser) {
    // try {
      // const response = await userService.loginUser(user_email, user_phone);
      // res.status(response.success ? 200 : 401).json(response);
      return res
      .status(200)
      .json({ success: true, registerUser: false, loginUser: true, message: checkifRegistrationAllowed.message });
  }
    // } 
    // catch (error) {
    //   console.error("Login Error:", error);
    //   res.status(500).json({ success: false, message: "Login failed" });
    // }
});

routes.post("/register/user/manual",authLimiter, async (req, res) => {
  console.log("POST request received - Manual User Registration");

  const user_email = req.body.email || null;
  const user_phone = req.body.phone || null;


  if (user_email && user_phone) {
    try {
      const user_data = req.body;
      const response = await userService.registerUser(user_data);
      res.json(response);
    } 
    catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  }
  else {
    console.log(
      "Manual registration requires both email and phone:",
      user_email,
      user_phone
    );
    return res
      .status(400)
      .json({ success: false, message: "Email and Phone are required" });
  
  }
});

routes.post("/user/existing/check", async (req, res) => {
  console.log("Checking if user exist");
  try {
    const email = req.body.email;
    const phone = req.body.phone;
    const ifExist = await userService.checkUserExists(email, phone);
    console.log("User exists:", ifExist);
    res.json(ifExist);
  } catch (error) {
    console.error("Check User Error:", error);
    res.status(500).json({ success: false, message: "Check failed" });
  }
});

routes.post("/user/login",authLimiter ,async (req, res) => {
  console.log("Login request received");
  try {
    const email = req.body.email;
    const phone = req.body.phone;
    const response = await userService.loginUser(email, phone);
    res.status(response.success ? 200 : 401).json(response);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

routes.post("/user/verify/securitytoken", async (req, res) => {
  console.log("Token verification request received");
  try {
    const token = req.body.token;
    const tokenUtils = require("../utils/tokenUtils");
    const decoded_data = tokenUtils.verifyToken(token);
    const ifExist = await userService.checkUserExists(decoded_data.email, null);
    console.log("User existence for token:", ifExist);

    if (ifExist.exists) {
      console.log("Token valid for user:", decoded_data.email);
      res.status(200).json({ success: true });
    } else {
      console.log("Token invalid - user does not exist");
      res.json({ success: false });
    }
  } catch (error) {
    console.log("Token Verification Error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

routes.get("/user/details/fetch", authenticateToken, async (req, res) => {
  console.log("User details fetch request received");
  // console.log("Authenticated user ID:", req.user.id);
  try {
    const id = req.user.id;
    // const phone = req.body.phone || null;
    // const email = req.body.email || null;
    // const checkExist = await userService.checkUserExists(email, phone);
    const checkExist = await userService.checkUserExists(null, null, id);
    console.log("User existence check result at core function of /details/fetch:", checkExist);

    if (!checkExist.exists) {
      console.log("Invalid user or token for ID at core function of /details/fetch:", id);
      return res
        .status(403)
        .json({ success: false, error: "Invalid User or Token" });
    }
    const response = await userService.getUserDetails(id);
    console.log("User details fetched:", response);
    res
      .status(response.success ? 200 : 204)
      .json({ success: true, data: response.data });
  } catch (error) {
    console.error("User Details Fetch Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user details" });
  }
});

routes.post("/user/details/update", authenticateToken, async (req, res) => {
  console.log("User details update request received");
  try {
    const id = req.user.id;
    // const user_email = req.body.email;
    // const user_phone = req.body.phone || null;
    const checkExist = await userService.checkUserExists(
      null,
      null,
      id
    );
    if (!checkExist.exists) {
      return res
        .status(403)
        .json({ success: false, error: "Invalid User or Token" });
    }
    const updated_data = req.body;
    console.log("Updated Data Received at Route:", updated_data);
    const response = await userService.updateUserDetails(
      id,
      updated_data
    );
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("User Details Update Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user details" });
  }
});

routes.get(
  "/user/profile/completeness/check",
  authenticateToken,
  async (req, res) => {
    console.log("User profile completeness check request received");
    try {
      const id = req.user.id;
      // const user_email = req.body.email;
      // const user_phone = req.body.phone || null;
      const checkExist = await userService.checkUserExists(
        id
      );
      if (!checkExist.exists) {
        return res
          .status(403)
          .json({ success: false, error: "Invalid User or Token" });
      }
      const isComplete = await userService.checkProfilecompleteness(
        id
      );
      const userDetails = await userService.getUserDetails(
        id
      );

      res
        .status(200)
        .json({
          success: true,
          profile_completed: isComplete,
          data: isComplete ? userDetails : {},
        });
    } catch (error) {
      console.error("Profile Completeness Check Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to check profile completeness",
        });
    }
  }
);

// ==================== PUJA ROUTES ====================

routes.get("/pujas/all", authenticateToken, async (req, res) => {
  console.log("All pujas request received");
  const id = req.user.id;
  // const user_phone = req.body.phone || null;
  try {
    const ifExist = await userService.checkUserExists(null, null, id);
    if (ifExist.exists) {
      const response = await pujaService.getAllPujas();
      res.status(response.success ? 200 : 404).json(response);
    } else {
      res.status(403).json({ success: false, error: "Invalid token" });
    }
  } catch (error) {
    console.error("All Pujas Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.get("/trending/pujas", authenticateToken, async (req, res) => {
  console.log("Trending pujas request received");
  try {
    const ifExist = await userService.checkUserExists(null, null, req.user.id);

    if (ifExist.exists) {
      const response = await pujaService.getTrendingPujas();
      res.status(response.success ? 200 : 404).json(response);
    } else {
      res.status(403).json({ success: false, error: "Invalid token" });
    }
  } catch (error) {
    console.error("Trending Pujas Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.get("/pujas/Category", authenticateToken, async (req, res) => {
  console.log("Categories request received");
  try {
    const ifExist = await userService.checkUserExists(null, null, req.user.id);
    if (ifExist.exists) {
      const response = await pujaService.getCategories();
      res.status(response.success ? 200 : 404).json(response);
    } else {
      res.status(403).json({ success: false, error: "Invalid token" });
    }
  } catch (error) {
    console.error("Categories Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.get(
  "/pujas/bycategory/:category_id",
  authenticateToken,
  async (req, res) => {
    console.log("Pujas by category request received");
    try {
      const ifExist = await userService.checkUserExists(null, null, req.user.id);

      if (ifExist.exists) {
        const { category_id } = req.params;
        const response = await pujaService.getPujaByCategory(category_id);
        res.status(response.success ? 200 : 404).json(response);
      } else {
        res.status(403).json({ success: false, error: "Invalid token" });
      }
    } catch (error) {
      console.error("Pujas by Category Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

routes.get(
  "/fetch/puja/details/:puja_id",
  authenticateToken,
  async (req, res) => {
    console.log("Puja details request received");
    try {
      const ifExist = await userService.checkUserExists(null, null, req.user.id);

      if (ifExist.exists) {
        const { puja_id } = req.params;
        const response = await pujaService.getPujaDetails(puja_id);
        res.status(response.success ? 200 : 404).json(response);
      } else {
        res.status(403).json({ success: false, error: "Invalid token" });
      }
    } catch (error) {
      console.error("Puja Details Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ==================== PACKAGE ROUTES ====================

routes.get("/puja/packages/:puja_id", authenticateToken, async (req, res) => {
  console.log("Packages request received");
  try {
    const ifExist = await userService.checkUserExists(null, null, req.user.id);

    if (ifExist.exists) {
      const { puja_id } = req.params;
      const response = await packageService.getPackagesByPujaId(puja_id);
      res.status(response.success ? 200 : 404).json(response);
    } else {
      res.status(403).json({ success: false, error: "Invalid token" });
    }
  } catch (error) {
    console.error("Packages Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

routes.get(
  "/fetch/checkout/:package_id",
  authenticateToken,
  async (req, res) => {
    console.log("Checkout details request received");
    try {
      const ifExist = await userService.checkUserExists(null, null, req.user.id);

      if (ifExist.exists) {
        const { package_id } = req.params;
        const response = await packageService.getPackageCheckoutDetails(
          package_id
        );
        console.log("Checkout Response:");
        console.log(response);
        res.status(response.success ? 200 : 404).json(response);
      } else {
        res.status(403).json({ success: false, error: "Invalid token" });
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ==================== PRIEST ROUTES ====================

routes.get("/fetch/priest/", authenticateToken, async (req, res) => {
  console.log("Priests list request received");
  try {
    const ifExist = await userService.checkUserExists(null, null, req.user.id);

    if (ifExist.exists) {
      const response = await priestService.getAvailablePriests();
      res.status(response.success ? 200 : 404).json(response);
    } else {
      res.status(403).json({ success: false, error: "Invalid token" });
    }
  } catch (error) {
    console.error("Priests List Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BOOKING ROUTES ====================

routes.post("/create-order/booking/", authenticateToken, async (req, res) => {
  console.log("Creating an Order");
  try {
    const id = req.user.id;
    const user_email = req.body.user_email;
    const user_phone = req.body.phone;
    const booking_info = req.body;

    const response = await bookingService.createBooking(
      id,
      user_email,
      user_phone,
      booking_info
    );
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Booking Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while processing booking.",
      });
  }
});

routes.get("/bookings/getall/", authenticateToken, async (req, res) => {
  console.log("Fetching all bookings");
  try {
    const id = req.user.id;
    // const user_email = req.body.email;
    // const user_phone = req.body.phone || null;
    const checkExist = await userService.checkUserExists(
      null,
      null,
      id
    );
    if (!checkExist.exists) {
      return res
        .status(403)
        .json({ success: false, error: "Invalid User or Token" });
    }
    const response = await bookingService.getAllBookings(id);
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching bookings.",
      });
  }
});

routes.post("/bookings/recents/", authenticateToken, async (req, res) => {
  console.log("Fetching recent bookings");
  console.log("Request Body:", req.body);
  try {
    const id = req.user.id;
    // const user_email = req.body.email;
    // const user_phone = req.body.phone || null;
    const checkExist = await userService.checkUserExists(
      null,
      null,
      id
    );
    if (!checkExist.exists) {
      return res
        .status(403)
        .json({ success: false, error: "Invalid User or Token" });
    }
    const response = await bookingService.getRecentBookings(id, req.body.limit);
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get Recent Bookings Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching recent bookings.",
      });
  }
});

routes.post("/booking/details/", authenticateToken, async (req, res) => {
  console.log("Fetching booking details");
  try {
    const id = req.user.id;
    // const user_email = req.body.email;
    // const user_phone = req.body.phone || null;
    const booking_id = req.body.booking_id;
    const checkExist = await userService.checkUserExists(
      null,
      null,
      id
    );
    if (!checkExist.exists) {
      return res
        .status(403)
        .json({ success: false, error: "Invalid User or Token" });
    }
    const response = await bookingService.getBookingDetails(booking_id);
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get Booking Details Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching booking details.",
      });
  }
});

routes.post(
  "/booking/direct-cancellation/",
  authenticateToken,
  async (req, res) => {
    console.log("Cancelling booking");
    try {
      const id = req.user.id;
      // const user_email = req.body.email;
      // const user_phone = req.body.phone || null;
      const booking_id = req.body.booking_id;
      const checkExist = await userService.checkUserExists(
        null,
        null,
        id
      );
      if (!checkExist.exists) {
        return res
          .status(403)
          .json({ success: false, error: "Invalid User or Token" });
      }
      const response = await bookingService.cancelBooking(booking_id);
      res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
      console.error("Cancel Booking Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error while cancelling booking.",
        });
    }
  }
);

routes.post("/update/phone", authenticateToken, async (req, res) => {
  console.log("User phone number update request received");
  try {
    const user_id = req.user.id;
    const otp = req.body.otp;
    const new_phone = req.body.phone;
    const session_token = req.body.session_token;

    console.log("New phone number:", new_phone);
    console.log("Session token:", session_token);

    // Validate inputs
    if (!new_phone || !session_token) {
      return res.status(400).json({
        success: false,
        message: "Phone number and session token are required."
      });
    }

    // Verify OTP token with 2Factor service
    const otpVerification = await otpService.verifyOTP(otp, session_token);
    console.log("OTP Verification Result:", otpVerification);
    // const otpVerification = { success: true }; // Dummy success response for now
    
    if (!otpVerification.success) {
      return res.status(401).json({
        success: false,
        message: "OTP verification failed. Please verify your phone number again."
      });
    }

    // Validate user exists
    const checkExist = await userService.checkUserExists(null, null, user_id);
    if (!checkExist.exists) {
      return res.status(403).json({
        success: false,
        error: "Invalid User or Token"
      });
    }

    // Update phone number
    const response = await userService.updatePhoneNumber(user_id, new_phone);
    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error("User Phone Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update phone number"
    });
  }
});

routes.post(
  "/booking/request-cancellation/",
  authenticateToken,
  async (req, res) => {
    console.log("Requesting booking cancellation");
    try {
      console.log("Request Booking Cancellation Body:", req.body);
      const user_id = req.user.id;
      const booking_id = req.body.booking_id;
      const reason = req.body.reason || "";
      const checkExist = await userService.checkUserExists(
        null,
        null,
        id
      );
      if (!checkExist.exists) {
        return res
          .status(403)
          .json({ success: false, error: "Invalid User or Token" });
      }
      const response = await bookingService.requestBookingCancellation(
        booking_id,
        user_id,
        reason
      );
      res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
      console.error("Request Booking Cancellation Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error while requesting booking cancellation.",
        });
    }
  }
);

module.exports = routes;
