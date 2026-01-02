const db = require("../config/db");
const { convertStringToDate } = require("../utils/dateUtils");
const { fetchPhones, checkIfUserExist } = require("../utils/userValidation");
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
  const user_email = userData.email;
  const user_phone = userData.phone || null;
  const user_exist = await checkIfUserExist(user_email, user_phone);
  console.log("User Existence Check Result main:", user_exist);

  if (user_exist.exists) {
    console.log("User already exists:", userData.email);
    const token = createSessionToken(user_exist.user_id);
    return { success: true, message: "User Exist", token: token };
  } else {
    const register_user = await insertUser(userData);
    console.log("User Registration Result:", register_user);
    if (register_user.success) {
      console.log("User registered successfully:", user_email);
      const token = createSessionToken(register_user.user_id);
      return { ...register_user, token: token };
    } else {
      return { ...register_user, token: null };
    }
  }
};

const loginUser = async (email, phone) => {
  const ifExist = await checkIfUserExist(email, phone);

  if (ifExist.exists) {
    console.log("User found for login:", email, phone);
    console.log("User Existence Check Result login:", ifExist);
    const token = createSessionToken(ifExist.user_id);
    return { success: true, token: token };
  } else {
    return { success: false, token: null };
  }
};

const getUserDetails = async (user_id) => {
  const query = "SELECT * FROM users WHERE id = ?";
  try {
    const [rows] = await db.execute(query, [user_id]);
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

const updateUserDetails = async (user_id, updateData) => {
  let setClause = [];
  let values = [];

  console.log("Update Data Received:", updateData);

  for (let key in updateData) {
    // Convert date if the field is 'dob'
    if (key === "dob" && updateData[key]) {
      values.push(convertStringToDate(updateData[key]));
    } else {
      values.push(updateData[key]);
    }
    setClause.push(`${key} = ?`);
  }

  // values.push(email);
  values.push(updateData.id); // Assuming 'id' is passed in updateData for identification
  // const query = `UPDATE users SET ${setClause.join(
  //   ", "
  // )} WHERE (email = ? AND e_verified=1) OR id = ?`;
  const query = `UPDATE users SET ${setClause.join(
    ", "
  )} WHERE id = ?`;

  try {
    const [result] = await db.execute(query, values);
    console.log("User details updated:", result);
    return { success: true, message: "User details updated" };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Database Error" };
  }
};

const checkUserExists = async (email, phone, user_id) => {
  return await checkIfUserExist(email, phone, user_id);
};

const updatePhoneNumber = async (user_id, new_phone) => {
  try {
    if (!new_phone || new_phone.trim() === "") {
      return {
        success: false,
        message: "Phone number is required.",
      };
    }

    // Check if the new phone number already exists for another user
    const [existingPhone] = await db.execute(
      "SELECT id FROM users WHERE phone = ? AND id != ?",
      [new_phone, user_id]
    );

    if (existingPhone.length > 0) {
      return {
        success: false,
        message: "Phone number already in use by another user.",
      };
    }

    // Update the phone number
    const [result] = await db.execute(
      "UPDATE users SET phone = ? WHERE id = ?",
      [new_phone, user_id]
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    return {
      success: true,
      message: "Phone number updated successfully.",
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Database Error",
    };
  }
};

const checkProfilecompleteness = async (user_id) => {
  // const [user] = await getUserDetails(email, phone);
  const [user] = await getUserDetails(user_id);
  if (user) {
    const profile_completed = user.profile_completed;
    return profile_completed === 1;
  }
  return false;
};

const checkMannualAuthentication = async (user_email, user_phone) => {
  user_email = user_email || null;
  user_phone = user_phone || null;
  let emailExists = false;
  let phoneExists = false;

  if (user_email) {
    try {
      const [emailData] = await db.execute(
        "SELECT email, e_verified FROM users WHERE email = ?",
        [user_email]
      );

      if (emailData.length > 0) {
          // return { exists: true, message: "Email already exists" };
          emailExists = true;
      }
    } catch (error) {
      console.error("Database error checking email:", error);
      throw error;
    }
  }

  if (user_phone) {
    const phones = await fetchPhones();
    if (phones.includes(user_phone)) {
      phoneExists = true;
    }
  }

  if (user_email && user_phone) {
    console.log("Both email and phone provided");
    if (!emailExists && !phoneExists) {
      //Register new user
      return {
        success: true,
        registerUser: true,
        loginUser: false,
        message: "Neither email nor phone exist",
      };
    }
    else if (emailExists && phoneExists) {
      //Found both
      console.log("Both email and phone exist");
      return {
        success: true,
        registerUser: false,
        loginUser: true,
        message: "Both email and phone already exist, Proceed login",
      };
    }
    else if (emailExists && !phoneExists) {
      //Found email
      console.log("Email exists, phone does not");
      return {
        success: false,
        registerUser: false,
        loginUser: false,
        message: "Email already exists",
      };
    }
    else if (phoneExists && !emailExists) {
      //Found phone
      console.log("Phone exists, email does not");
      return {
        success: false,
        registerUser: false,
        loginUser: false,
        message: "Phone already exists",
      };
    }
  }

  return { success: false, message: "Invalid input" };
};

module.exports = {
  insertUser,
  registerUser,
  loginUser,
  checkUserExists,
  getUserDetails,
  updateUserDetails,
  updatePhoneNumber,
  checkProfilecompleteness,
  checkMannualAuthentication,
};
