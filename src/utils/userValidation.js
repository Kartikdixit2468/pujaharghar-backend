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

const checkIfUserExist = async (user_email, user_phone) => {
  // First check if phone exists
  console.log("Checking if user exists with email:", user_email, "or phone:", user_phone);

  if (user_phone) {
    const phones = await fetchPhones();
    if (phones.includes(user_phone)) {
      return { exists: true, message: "Phone already exists" };
    }
  }

  // If phone doesn't exist, check email and e_verified from database
  if (user_email) {
    try {
      const [emailData] = await db.execute(
        "SELECT email, e_verified FROM users WHERE email = ?",
        [user_email]
      );

      if (emailData.length > 0) {
        const user = emailData[0];
        // Check if email exists and e_verified is true
        if (user.e_verified) {
          return { exists: true, message: "Email already exists" };
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
