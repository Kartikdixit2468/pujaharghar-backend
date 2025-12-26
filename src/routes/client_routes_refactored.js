// Build with proud by Kartik Dixit!
const express = require("express");
const authenticateToken = require("../middlewares/validateAuthToken");

// Import services
const userService = require("../services/userService");
const pujaService = require("../services/pujaService");
const packageService = require("../services/packageService");
const priestService = require("../services/priestService");
const bookingService = require("../services/bookingService");

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

routes.post("/register/user/mannual", async (req, res) => {
  console.log("POST request received - Manual User Registration");
  try {
    const user_data = req.body;
    const response = await userService.registerUser(user_data);
    res.json(response);
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
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

routes.post("/user/login", async (req, res) => {
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

    
    if (ifExist) {
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

routes.post("/user/details/fetch", authenticateToken, async (req, res) => {
  console.log("User details fetch request received");
  try {
    const phone = req.body.phone || null;
    const email = req.user.email || null;
    const checkExist = await userService.checkUserExists(email, phone);
    
    if (!checkExist) {
      return res.status(403).json({ success: false, error: "Invalid User or Token" });
    }
    const response = await userService.getUserDetails(email, phone);
    res.status(response.success ? 200 : 204).json(response);
  } catch (error) {
    console.error("User Details Fetch Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user details" });
  }
});


routes.post("/user/details/update", authenticateToken, async (req, res) => {
  console.log("User details update request received");
  try {
    const user_email = req.user.email;
    const user_phone = req.body.phone || null;
    const checkExist = await userService.checkUserExists(user_email, user_phone);
    if (!checkExist) {
      return res.status(403).json({ success: false, error: "Invalid User or Token" });
    } 
    const updated_data = req.body;
    const response = await userService.updateUserDetails(user_email, user_phone, updated_data);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("User Details Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update user details" });
  }
});


// ==================== PUJA ROUTES ====================

routes.post("/trending/pujas", authenticateToken, async (req, res) => {
  console.log("Trending pujas request received");
  try {
    const ifExist = await userService.checkUserExists(req.user.email, null);
    
    if (ifExist) {
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
    const ifExist = await userService.checkUserExists(req.user.email, null);
    
    if (ifExist) {
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

routes.get("/fetch/puja/details/:puja_id", authenticateToken, async (req, res) => {
  console.log("Puja details request received");
  try {
    const ifExist = await userService.checkUserExists(req.user.email, null);
    
    if (ifExist) {
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
});

// ==================== PACKAGE ROUTES ====================

routes.get("/puja/packages/:puja_id", authenticateToken, async (req, res) => {
  console.log("Packages request received");
  try {
    const ifExist = await userService.checkUserExists(req.user.email, null);
    
    if (ifExist) {
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

routes.get("/fetch/checkout/:package_id", authenticateToken, async (req, res) => {
  console.log("Checkout details request received");
  try {
    const ifExist = await userService.checkUserExists(req.user.email, null);
    
    if (ifExist) {
      const { package_id } = req.params;
      const response = await packageService.getPackageCheckoutDetails(package_id);
      res.status(response.success ? 200 : 404).json(response);
    } else {
      res.status(403).json({ success: false, error: "Invalid token" });
    }
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PRIEST ROUTES ====================

routes.get("/fetch/priest/", authenticateToken, async (req, res) => {
  console.log("Priests list request received");
  try {
    const ifExist = await userService.checkUserExists(req.user.email, null);
    
    if (ifExist) {
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
    const user_email = req.user.email;
    const user_phone = req.body.phone;
    const booking_info = req.body;
    
    const response = await bookingService.createBooking(user_email, user_phone, booking_info);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: "Server error while processing booking." });
  }
});

routes.post("/bookings/getall/", authenticateToken, async (req, res) => {
  console.log("Fetching all bookings");
  try {
    const user_email = req.user.email;
    const user_phone = req.body.phone || null;
    const checkExist = await userService.checkUserExists(user_email, user_phone);
    if (!checkExist) {
      return res.status(403).json({ success: false, error: "Invalid User or Token" });
    }
    const response = await bookingService.getAllBookings(user_email, user_phone);
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching bookings." });
  }
});

routes.post("/booking/details/", authenticateToken, async (req, res) => {
  console.log("Fetching booking details");
  try {
    const user_email = req.user.email;
    const user_phone = req.body.phone || null;
    const booking_id = req.body.booking_id;
    const checkExist = await userService.checkUserExists(user_email, user_phone);
    if (!checkExist) {
      return res.status(403).json({ success: false, error: "Invalid User or Token" });
    } 
    const response = await bookingService.getBookingDetails(booking_id);
    res.status(response.success ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get Booking Details Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching booking details." });
  }
});


routes.post("/booking/cancel/", authenticateToken, async (req, res) => {
  console.log("Cancelling booking");
  try {
    const user_email = req.user.email;
    const user_phone = req.body.phone || null;
    const booking_id = req.body.booking_id;
    const checkExist = await userService.checkUserExists(user_email, user_phone);
    if (!checkExist) {
      return res.status(403).json({ success: false, error: "Invalid User or Token" });
    } 
    const response = await bookingService.cancelBooking(booking_id);
    res.status(response.success ? 200 : 400).json(response);
  }
  catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ success: false, message: "Server error while cancelling booking." });
  }
});

module.exports = routes;
