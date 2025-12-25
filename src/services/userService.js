const db = require("../config/db");
const { convertStringToDate } = require("../utils/dateUtils");
const { checkIfUserExist } = require("../utils/userValidation");
const { createSessionToken } = require("../utils/tokenUtils");

const insertUser = async (userData) => {
  const { email, name, photo, phone, dob, gender } = userData;

  const filteredData = { email, name, photo, phone, dob, gender };

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
  const user_email = userData.email;
  const user_exist = await checkIfUserExist(user_email, userData.phone);
  
  if (user_exist) {
    const token = createSessionToken(user_email);
    return { success: true, message: "User Exist", token: token };
  } else {
    const register_user = await insertUser(userData);
    if (register_user.success) {
      const token = createSessionToken(user_email);
      return { ...register_user, token: token };
    } else {
      return { ...register_user, token: null };
    }
  }
};

const loginUser = async (email) => {
  const ifExist = await checkIfUserExist(email, null);
  
  if (ifExist) {
    const token = createSessionToken(email);
    return { success: true, token: token };
  } else {
    return { success: false, token: null };
  }
};

const checkUserExists = async (email, phone) => {
  return await checkIfUserExist(email, phone);
};

module.exports = { insertUser, registerUser, loginUser, checkUserExists };
