// Build with proud by Kartik Dixit!
const express = require("express");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middlewares/validateAuthToken");

require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;
const routes = express.Router();

const createSessionToken = (email) => {
  return (token = jwt.sign({ email: email }, SECRET_KEY, { expiresIn: "30d" }));
};

function str_to_date(dateStr) {
  // Expects input like '4/12/2000'
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split("/"); // ['4', '12', '2000']
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;

  // Zero-pad month and day
  const mm = month.padStart(2, "0");
  const dd = day.padStart(2, "0");

  return `${year}-${dd}-${mm}`; // Returns '2000-04-12'
}

// Function to check all parameters and design query accordingly
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
    values[4] = str_to_date(values[4], "%m/%d/%Y");
  } else {
    console.log("Not found");
  }
  console.log(columns_arr);
  console.log(values);

  const query = `INSERT INTO users (${columns}) VALUES (${placeholders})`;
  // console.log(query)
  try {
    await db.execute(query, values);
    return { success: true, messgae: "User Registered" };
  } catch (error) {
    console.log("you got it");
    console.log(error);
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

const fetchPhones = async () => {
  const [phones_data] = await db.execute("select phone from users;");
  const user_phones = phones_data.map((obj) => {
    return obj.phone;
  });
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
  console.log(user_data);

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
  console.log("Got request!");
  const user_data = req.body;

  console.log(user_data);

  const register = async (user_data) => {
    const user_email = user_data.email;
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

routes.post("/user/existing/check", async (req, res) => {
  console.log("Checking if user exist");
  const email = req.body.email;
  const phone = req.body.phone;
  const ifExist = await checkIfUserExist(email, phone);
  console.log(ifExist);
  res.json({ exist: ifExist });
});

routes.post("/user/login", async (req, res) => {
  console.log("login req!");
  const user = req.body.email;
  console.log(user)
  const ifExist = await checkIfUserExist(user);
  console.log(ifExist)
  if (ifExist) {
    console.log("ifExist")
    const token = createSessionToken(user);
    res.status(200).json({ success: true, token: token });
  } else {
    res.json({ success: false, token: null });
  }
});

routes.post("/user/verify/securitytoken", async (req, res) => {
  console.log("POST request received for verification");
  const token = req.body.token;
  const decoded_data = jwt.verify(token, SECRET_KEY);
  if (checkIfUserExist(decoded_data.email)) {
    res.status(200).json({ success: true });
  } else {
    res.json({ success: false });
  }
});

routes.post("/trending/pujas", authenticateToken, async (req, res) => {
  console.log("Got req");
  const ifExist = await checkIfUserExist(req.user.email);
  if (ifExist) {
    const [puja_data] = await db.execute("select puja_id from trending_pujas");
    const IDs = puja_data.map((obj) => {
      return obj.puja_id;
    });
    if (IDs.length > 0) {
      const placeholders = IDs.map(() => "?").join(", ");
      const [data] = await db.execute(
        `SELECT * FROM puja WHERE puja_id IN (${placeholders})`,
        IDs
      );
      console.log(data)
      res.status(200).json({ success: true, data: data });
    } else {
      res.json({ success: false, error: "Dataset Empty", data: {} });
    }
  } else {
    res.status(403).json({ success: false, error: "Invalid token" });
  }
});

routes.get("/pujas/Category", authenticateToken, async (req, res) => {
  console.log("got at category");
  const ifExist = await checkIfUserExist(req.user.email);
  if (ifExist) {
    try {
      const [categories] = await db.execute("select * from categories");
      // console.log(categories);
      if (categories.length > 0) {
        res.status(200).json({ success: true, data: categories });
      } else {
        res.json({ success: false, error: "Dataset Empty", data: {} });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(403).json({ success: false, error: "Invalid token" });
  }
});

routes.get(
  "/fetch/puja/details/:puja_id",
  authenticateToken,
  async (req, res) => {
    console.log("puja fetch req!");
    const ifExist = await checkIfUserExist(req.user.email);
    if (ifExist) {
       console.log("Here you go!")
      try {
        const { puja_id } = req.params;
        console.log(req.params)
        console.log(puja_id)
        const [puja_details] = await db.execute(
          `select * from puja where puja_id=${puja_id}`
        );
        console.log(puja_details);

        if (puja_details.length > 0) {
          const data = puja_details[0];
          console.log("You're inside puja details")
          console.log(data)
          res.status(200).json({ success: true, data: data });
        } else {
          res.json({ success: false, error: "Dataset Empty", data: {} });
        }
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    } else {
      res.status(403).json({ success: false, error: "Invalid token" });
    }
  }
);

routes.get("/puja/packages/:puja_id", authenticateToken, async (req, res) => {
  console.log("packages fetch req!");
  const ifExist = await checkIfUserExist(req.user.email);
  if (ifExist) {
    try {
      const { puja_id } = req.params;
      console.log("got id => ", puja_id);

      const [packages_details] = await db.execute(
        `select * from package where puja_id=${puja_id}`
      );

      const data = packages_details.map((package) => {
        const desc = package.description;
        const features = desc.split("|").map((item) => item.trim());
        return {
          id: package.package_id,
          name: package.name + " Package",
          features: features,
          price: package.price,
        };
      });

      console.log(data);

      if (data.length > 0) {
        res.status(200).json({ success: true, data: data });
      } else {
        res.json({ success: false, error: "Dataset Empty", data: {} });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(403).json({ success: false, error: "Invalid token" });
  }
});

routes.get("/fetch/priest/", authenticateToken, async (req, res) => {
  console.log("packages fetch req!");
  const ifExist = await checkIfUserExist(req.user.email);
  if (ifExist) {
    try {
      const [priest_list] = await db.execute(
        `select * from pandit where booking_status=0`
      );

      // console.log(priest_list)

      const data = priest_list.map((priest) => {
        return {
          id: priest.pandit_id,
          name: priest.name,
          gender: priest.gender,
          exp: priest.experience,
          img: priest.photo,
        };
      });

      if (data.length > 0) {
        // console.log(data);
        res.status(200).json({ success: true, data: data });
      } else {
        res.json({ success: false, error: "Dataset Empty", data: {} });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(403).json({ success: false, error: "Invalid token" });
  }
});

routes.get(
  "/fetch/checkout/:package_id",
  authenticateToken,
  async (req, res) => {
    console.log("checkout page package fetch req!");
    const ifExist = await checkIfUserExist(req.user.email);
    if (ifExist) {
      const { package_id } = req.params;

      try {
        const [package_info] = await db.execute(
          `select * from package where package_id=${package_id}`
        );

        console.log(package_info)

        if (package_info.length > 0) {
          const puja_id = package_info[0].puja_id;
          const [puja_info] = await db.execute(
            `select * from puja where puja_id=${puja_id}`
          );

          if (puja_info.length > 0) {
            const [package_data] = package_info;
            const [puja_data] = puja_info;
            const desc = package_data.description;
            const features = desc.split("|").map((item) => item.trim());

            const data = {
              package_id: package_data.package_id,
              package_name: package_data.name,
              package_price: package_data.price,
              features: features,
              puja_id: puja_data.puja_id,
              puja_name: puja_data.NAME,
              puja_desc: puja_data.description,
              travel_cost: 500,
            };
            res.status(200).json({ success: true, data: data });
          } else {
            res.json({ success: false, error: "Dataset Empty", data: {} });
          }
        } else {
          res.json({ success: false, error: "Dataset Empty", data: {} });
        }
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    } else {
      res.status(403).json({ success: false, error: "Invalid token" });
    }
  }
);

routes.post("/create-order/booking/", authenticateToken, async (req, res) => {
  console.log(" Creating an Order")
  
  const user = req.user.email
  const booking_info = req.body
  
  console.log(user)
  console.log(booking_info)


  const { package_id, dateOption, date, priest_id, payment_id } = req.body;
  const user_email = req.user.email;

  try {
    // 1. Check if payment_id exists and is not consumed
    const [paymentRows] = await db.execute(
      'SELECT * FROM payments WHERE payment_id = ? AND is_consumed = 0',
      [payment_id]
    );

    if (paymentRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Payment ID is invalid or already used.' });
    }

    // 2. Determine date and is_date_assured based on dateOption
    const bookingDate = dateOption === 'specific' ? str_to_date(date) : null;
    const isDateAssured = dateOption === 'specific' ? 1 : 0;

    // 3. Insert into bookings table
    console.log(date)
    const [insertResult] = await db.execute(
      `INSERT INTO bookings (Email, package_id, date, payment, is_date_assured, is_confirmed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_email, package_id, bookingDate, 50, isDateAssured, 1]
    );

    // 4. Update payments table: mark is_consumed = 1
    await db.execute(
      'UPDATE payments SET is_consumed = 1 WHERE payment_id = ?',
      [payment_id]
    );

    res.json({ success: true, booking_id: insertResult.insertId,  message: 'Booking created successfully.', booking_id: insertResult.insertId });
  } catch (error) {
    console.error('Error processing booking:', error);
    res.status(500).json({ success: false, message: 'Server error while processing booking.' });
  }


}
);

module.exports = routes;
