// Build with Proud by Young Devs
require("dotenv").config();

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTHTOKEN;


const SendOtpToPhone = async (phone, otp) => {
  const url = `https://control.msg91.com/api/v5/otp`;

  const payload = {
    mobile: `91${phone}`, // add country code
    otp: otp,
    authkey: '447695T9MQQ9m86807c6ffP1',
    template_id: "YOUR_TEMPLATE_ID", // from MSG91 dashboard
  };

  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (err) {
    console.error("Error sending OTP:", err.response?.data || err.message);
    throw err;
  }
};

function SendOtpToEmail() {
  // Code
}

SendOtpToPhone('8595872053', '4228')

module.exports = { SendOtpToPhone, SendOtpToEmail };
