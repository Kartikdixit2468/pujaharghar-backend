// Build with proud by Kartik Dixit!

const express = require("express");
const routes = express.Router();
const db = require("../config/db");

// Function to check all parameters and design query accordingly
const insertUser = async (userData) => {
  const { email, name, photo } = userData; // Destructure only the fields we care about

  const filteredData = { email, name, photo }; // Create a new object with only the allowed fields

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

  const query = `INSERT INTO users (${columns}) VALUES (${placeholders})`;
  // const query = "INSERT INTO users (email, name, photo) VALUES (?, ?, ?)";

  // console.log(query);
  // console.log(values);

  // Assuming you're using mysql2 or something similar
  try {
    await db.execute(query, values);
    return [true, "User Registered"];
  } catch{
    return [false,`Database Error`];
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
    if(user_exist){
      return [true,"User Exist"];
    }
    else{
      const register_user = await insertUser(user_data);
      return register_user;
    }
  };

  let response = await register(user_data) 
  console.log(response)
  res.send(response)

});

module.exports = routes;
