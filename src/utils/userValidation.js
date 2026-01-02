const db = require("../config/db");

const fetchEmails = async () => {
  const [emails_data] = await db.execute("select email from users;");
  const user_emails = emails_data.map((obj) => obj.email);
  return user_emails;
};

const fetchPhones = async () => {
  const [phones_data] = await db.execute("select phone from users;");
  const user_phones = phones_data.map((obj) => obj.phone);
  return user_phones;
};

const checkIfUserExist = async (user_email, user_phone, user_id=null) => {
  // First check if phone exists
  user_email = user_email || null;
  user_phone = user_phone || null;

  console.log("Checking existence for user with email:", user_email, "phone:", user_phone, "user_id:", user_id);

  if(user_id) {
    console.log("Checking existence for user ID inside the checkifexist function:", user_id);
    try {
      console.log("User ID provided, checking by ID:", user_id);
      const [idData] = await db.execute(
        "SELECT id FROM users WHERE id = ?",
        [user_id]
      );
      if (idData.length > 0) {
        console.log("User ID exists in database at the core function:", user_id);
        return { exists: true, user_id: idData[0].id, message: "User ID exists" };
      }
    } catch (error) {
      console.error("Database error checking user ID:", error);
      throw error;
    }
  }
  
  else if (user_phone) {
    try {
      const [phoneData] = await db.execute(
        "SELECT id FROM users WHERE phone = ?",
        [user_phone]
      );
      if (phoneData.length > 0) {
        return { exists: true, user_id: phoneData[0].id, message: "Phone already exists" };
      }
    } catch (error) {
      console.error("Database error checking phone:", error);
      throw error;
    }
  }

  // If phone doesn't exist, check email and e_verified from database
  else if (user_email) {
    try {
      const [emailData] = await db.execute(
        "SELECT id, email, e_verified FROM users WHERE email = ?",
        [user_email]
      );

      if (emailData.length > 0) {
        const user = emailData[0];
        // Check if email exists and e_verified is true
        if (user.e_verified) {
          return { exists: true, user_id: user.id, message: "Email already exists" };
        }
      }
    } catch (error) {
      console.error("Database error checking email:", error);
      throw error;
    }
  }

  return { exists: false, message: "User does not exist" };
};

module.exports = { fetchEmails, fetchPhones, checkIfUserExist };
