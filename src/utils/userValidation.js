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
  let emailExists = false;
  let phoneExists = false;

  if (user_email) {
    const emails = await fetchEmails();
    emailExists = emails.includes(user_email);
  }

  if (user_phone) {
    const phones = await fetchPhones();
    phoneExists = phones.includes(user_phone);
  }

  return emailExists || phoneExists;
};

module.exports = { fetchEmails, fetchPhones, checkIfUserExist };
