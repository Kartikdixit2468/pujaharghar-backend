const db = require("../config/db");
const { convertStringToDate } = require("../utils/dateUtils");
const { checkIfUserExist } = require("../utils/userValidation");
const { createSessionToken } = require("../utils/tokenUtils");

const insertUser = async (userData) => {
  const { email, name, photo, phone, dob, gender, e_verified } = userData;
  console.log("Registering User with Data:", userData);

  const filteredData = { email, name, photo, phone, dob, gender, e_verified };
  console.log("Filtered User Data:", filteredData);

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

  const columns_arr = columns.split(", ");
  if (columns_arr.includes("dob")) {
    const index = columns_arr.indexOf("dob");
    values[index] = convertStringToDate(values[index]);
  }

  const query = `INSERT INTO users (${columns}) VALUES (${placeholders})`;
  try {
    await db.execute(query, values);
    return { success: true, message: "User Registered" };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Database Error" };
  }
};

const registerUser = async (userData) => {
  console.log("Register User Service Called with Data:", userData);
  const user_email = userData.email
  const user_exist = await checkIfUserExist(user_email, userData.phone);
  console.log("User Existence Check Result main:", user_exist);
  
  if (user_exist.exists) {
    console.log("User already exists:", userData.email);
    const token = createSessionToken(user_email);
    return { success: true, message: "User Exist", token: token };
  } else {
    const register_user = await insertUser(userData);
    console.log("User Registration Result:", register_user);
    if (register_user.success) {
      console.log("User registered successfully:", user_email);
      const token = createSessionToken(user_email);
      return { ...register_user, token: token };
    } else {
      return { ...register_user, token: null };
    }
  }
};

const loginUser = async (email, phone) => {
  const ifExist = await checkIfUserExist(email, phone);
  
  if (ifExist) {
    const token = createSessionToken(email);
    return { success: true, token: token };
  } else {
    return { success: false, token: null };
  }
};

const getUserDetails = async (email, phone) => { 
  const query = "SELECT * FROM users WHERE email = ? OR phone = ?";
  try {
    const [rows] = await db.execute(query, [email, phone]);
    if (rows.length > 0) {
      return { success: true, data: rows[0] };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Database Error" };
  }
};

const updateUserDetails = async (email, phone, updateData) => {
  let setClause = [];
  let values = [];  
  
  for (let key in updateData) {
    // Convert date if the field is 'dob'
    if (key === 'dob' && updateData[key]) {
      values.push(convertStringToDate(updateData[key]));
    } else {
      values.push(updateData[key]);
    }
    setClause.push(`${key} = ?`);
  } 
  
  values.push(email);
  values.push(phone);
  const query = `UPDATE users SET ${setClause.join(", ")} WHERE (email = ? AND e_verified=1) OR phone = ?`;

  try {
    const [result] = await db.execute(query, values); 
    console.log("User details updated:", result);
    return { success: true, message: "User details updated" };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Database Error" };
  }
};

const checkUserExists = async (email, phone) => {
  return await checkIfUserExist(email, phone);
};

module.exports = { insertUser, registerUser, loginUser, checkUserExists, getUserDetails, updateUserDetails };
