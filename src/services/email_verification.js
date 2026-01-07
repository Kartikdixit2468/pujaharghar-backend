require("dotenv").config();
const nodemailer = require("nodemailer");
const { createSessionToken } = require("../utils/tokenUtils");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendVerificationEmail(to, userName) {
    try {
        // Create JWT token for email verification (expires in 24 hours)
        const verificationToken = createSessionToken(to);
        
        // Create verification link
        const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/verify-email/verify-email/${verificationToken}`;
        
        const mailOptions = {
            from: `"PoojaOne" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: "Verify Your Email - PoojaOne",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">PoojaOne</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="color: #333; font-size: 16px;">Hello ${userName},</p>
                        <p style="color: #555; line-height: 1.6;">
                            Thank you for registering with <strong>PoojaOne</strong>. To complete your registration, please verify your email address by clicking the button below.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      font-weight: bold;
                                      display: inline-block;">
                                Verify Email Address
                            </a>
                        </div>
                        <p style="color: #999; font-size: 12px;">
                            This link will expire in 24 hours. If you didn't create this account, please ignore this email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            If the button doesn't work, copy and paste this link in your browser:<br>
                            <a href="${verificationLink}" style="color: #667eea;">${verificationLink}</a>
                        </p>
                    </div>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully:", result);
        return { success: true, message: "Verification email sent successfully." };
    } catch (error) {
        console.error("Error sending verification email:", error);
        return { success: false, message: "Failed to send verification email.", error: error.message };
    }
}

async function sendMail(to, otp) {
    try {
        return await transporter.sendMail({
            from: `"PoojaOne" <${process.env.EMAIL_USER || "kartikdixit2107@gmail.com"}>`,
            to: to,
            subject: "Your verification code",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">PoojaOne</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="color: #333; font-size: 16px;">Your OTP is:</p>
                    <h1 style="color: #667eea; text-align: center; font-size: 48px; letter-spacing: 5px;">${otp}</h1>
                    <p style="color: #999; text-align: center;">Valid for 10 minutes.</p>
                    <p style="color: #999; font-size: 12px;">
                        If you didn't request this OTP, please ignore this email.
                    </p>
                </div>
            </div>
            `,
        });
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
}

module.exports = { sendVerificationEmail, sendMail };
