// Build with proud by Kartik Dixit!
const express = require("express");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;
const routes = express.Router();

const createSessionToken = (email) => {
  return (token = jwt.sign({ email: email }, SECRET_KEY, { expiresIn: "30d" }));
};

// Function to check all parameters and design query accordingly
const insertUser = async (userData) => {
  const { email, name, photo, phone , dob, gender} = userData;

  const filteredData = { email, name, photo, phone, dob, gender};

  // Filter out any undefined or null fields
  const validFields = Object.entries(filteredData).filter(
    ([_, value]) => value !== undefined && value !== null
  );

  if (validFields.length === 0) {
    throw new Error("No valid user data to insert.");
  }

  const columns = validFields.map(([key]) => key).join(", ");
  const placeholders = validFields.map(() => "?").join(", ");
  const values = validFields.map(([_, value]) => value);
  console.log(columns)
  console.log(values)
  console.log(placeholders)
  // return { success: true, messgae: "User Registered" };


  const query = `INSERT INTO users (${columns}) VALUES (${placeholders})`;
  // const query = "INSERT INTO users (email, name, photo) VALUES (?, ?, ?)";

  try {
    await db.execute(query, values);
    return { success: true, messgae: "User Registered" };
  } catch {
    return { success: false, messgae: "Database Error" };
  }
};

const fetchEmails = async () => {
  const [emails_data] = await db.execute("select email from users;");
  const user_emails = emails_data.map((obj) => {
    return obj.email;
  });
  // console.log(user_emails)
  return user_emails;
};

const checkIfUserExist = async (user_email) => {
  const emails = await fetchEmails();
  return emails.includes(user_email);
};
fetchEmails();

// Main Routes Start From here

routes.get("/", (req, res) => {
  console.log("GET request received");
  res.json({
    message: "Hello, server running successfully. and this is for Clients.",
  });
});

routes.post("/register/user", async (req, res) => {
  console.log("POST request received");
  const user_data = req.body;

  const register = async (user_data) => {
    const user_email = user_data.email;
    const user_exist = await checkIfUserExist(user_email);
    if (user_exist) {
      const token = createSessionToken(user_email);
      return { success: true, messgae: "User Exist", token: token };
    } else {
      const register_user = await insertUser(user_data);
      if (register_user.success) {
        const token = createSessionToken(user_email);
        return { ...register_user, token: token };
      } else {
        const token = null;
        return { ...register_user, token: token };
      }
    }
  };

  let response = await register(user_data);
  // console.log(response);
  res.send(response);
});

routes.post("/register/user/mannual", async (req, res) => {
  console.log("Got request!")
  const user_data = req.body;

  console.log(user_data)

  const register = async (user_data) => {
    const user_email = user_data.email;
    console.log("email: ", user_email)
      const register_user = await insertUser(user_data);
      if (register_user.success) {
        const token = createSessionToken(user_email);
        return { ...register_user, token: token };
      } else {
        const token = null;
        return { ...register_user, token: token };
      }
  };

  let response = await register(user_data);
  // console.log(response);
  res.send(response);

});

routes.post("/user/verify/securitytoken", async (req, res) => {
  console.log("POST request received for verification");
  console.log(req.body);
  const token = req.body.token;
  const decoded_data = jwt.verify(token, SECRET_KEY);
  console.log(decoded_data);
  if (checkIfUserExist(decoded_data.email)) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

module.exports = routes;
