const express = require("express");
const { verifyToken } = require("../utils/tokenUtils");
const db = require("../config/db");
const emailVerification = require("../services/email_verification");
const userService = require("../services/userService");

const router = express.Router();

// ==================== EMAIL VERIFICATION ROUTES ====================

// POST - Send verification email
router.post("/send-verification-email", async (req, res) => {
  console.log("Send verification email request received");
  try {
    const email = req.body.email;
    const name = "PoojaOne User";

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required.",
      });
    }

    // Check if email already verified
    try {
      const [emailData] = await db.execute(
        "SELECT email, e_verified FROM users WHERE email = ?",
        [email]
      );

      if (emailData.length > 0 && emailData[0].e_verified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified.",
        });
      }
    } catch (error) {
      console.error("Database error:", error);
    }

    // Send verification email
    const result = await emailVerification.sendVerificationEmail(email, name);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Send Verification Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending verification email.",
    });
  }
});

// GET - Display verification page with token validation
router.get("/verify-email/:token", async (req, res) => {
  console.log("Email verification page request received");
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).send(
        generateErrorPage("Verification link is missing.")
      );
    }

    // Verify JWT token
    let decodedEmail;
    try {
      const decoded = verifyToken(token);
      decodedEmail = decoded.email || decoded.id || decoded.sub;
      console.log("Token verified, email:", decodedEmail);
    } catch (error) {
      console.error("Token verification error:", error.message);
      return res.status(401).send(
        generateErrorPage("Verification link has expired. Please request a new one.")
      );
    }

    // Check if email exists
    try {
      const [emailData] = await db.execute(
        "SELECT id, email, e_verified, name FROM users WHERE email = ?",
        [decodedEmail]
      );

      if (emailData.length === 0) {
        return res.status(404).send(
          generateErrorPage("Email not found. Please register first.")
        );
      }

      const user = emailData[0];

      // If already verified
      if (user.e_verified) {
        return res.status(200).send(generateSuccessPage(
          "Email Already Verified",
          `Your email ${user.email} is already verified. You can now log in to your account.`
        ));
      }

      // Show verification options
      return res.status(200).send(generateVerificationPage(user.email, token));
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).send(
        generateErrorPage("Server error. Please try again later.")
      );
    }
  } catch (error) {
    console.error("Email Verification Page Error:", error);
    res.status(500).send(
      generateErrorPage("Server error. Please try again later.")
    );
  }
});

// POST - Confirm email verification
router.post("/confirm-verification", async (req, res) => {
  console.log("Email verification confirmation request received");
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    // Verify JWT token
    let decodedEmail;
    try {
      const decoded = verifyToken(token);
      decodedEmail = decoded.email || decoded.id || decoded.sub;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Verification link has expired. Please request a new one.",
      });
    }

    // Check user profile completion status
    try {
      // Fetch user details
      const [userData] = await db.execute(
        "SELECT id, email, e_verified, profile_completed, name, phone, dob, gender FROM users WHERE email = ? AND e_verified = 0",
        [decodedEmail]
      );

      if (userData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Email could not be verified. It may already be verified.",
        });
      }

      const user = userData[0];
      let updateFields = "e_verified = 1";

      // Check if profile_completed is 0, then check if all required fields are filled
      if (user.profile_completed === 0) {
        // Check if all required fields are filled: name, phone, dob, gender
        if (user.name && user.phone && user.dob && user.gender) {
          console.log("All profile fields are filled. Marking profile as complete.");
          updateFields = "e_verified = 1, profile_completed = 1";
        } else {
          console.log("Profile incomplete. Missing fields:", {
            name: !user.name,
            phone: !user.phone,
            dob: !user.dob,
            gender: !user.gender,
          });
        }
      }

      // Update e_verified and conditionally profile_completed
      const [result] = await db.execute(
        `UPDATE users SET ${updateFields} WHERE email = ?`,
        [decodedEmail]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: "Email could not be verified. It may already be verified.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Email verified successfully! You can now log in.",
        profile_completed: updateFields.includes("profile_completed"),
      });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while verifying email.",
      });
    }
  } catch (error) {
    console.error("Email Verification Confirmation Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while confirming verification.",
    });
  }
});

// ==================== HTML RESPONSE GENERATORS ====================

function generateVerificationPage(email, token) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Ritual Gurus</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                max-width: 500px;
                width: 100%;
                padding: 40px;
                text-align: center;
            }
            .header {
                margin-bottom: 30px;
            }
            .header h1 {
                color: #667eea;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .header p {
                color: #666;
                font-size: 14px;
            }
            .email-display {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                color: #333;
                font-weight: 500;
                word-break: break-all;
            }
            .button-group {
                display: flex;
                gap: 15px;
                margin-top: 30px;
            }
            button {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
            }
            .btn-verify {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .btn-verify:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            }
            .btn-decline {
                background: #e0e0e0;
                color: #333;
            }
            .btn-decline:hover {
                background: #d0d0d0;
            }
            .footer {
                margin-top: 30px;
                color: #999;
                font-size: 12px;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
            .loader {
                display: none;
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 20px auto;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ Verify Your Email</h1>
                <p>Complete your registration</p>
            </div>
            
            <p style="color: #555; margin-bottom: 15px;">
                We're about to verify your email address:
            </p>
            
            <div class="email-display">${email}</div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                Click the button below to verify your email and complete your registration.
            </p>
            
            <div class="loader" id="loader"></div>
            
            <div class="button-group" id="buttonGroup">
                <button class="btn-verify" onclick="verifyEmail('${token}')">
                    Verify Email
                </button>
                <button class="btn-decline" onclick="declineVerification()">
                    Decline
                </button>
            </div>
            
            <div class="footer">
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
            </div>
        </div>

        <script>
            function verifyEmail(token) {
                const loader = document.getElementById('loader');
                const buttonGroup = document.getElementById('buttonGroup');
                
                loader.style.display = 'block';
                buttonGroup.style.display = 'none';
                
                fetch('/api/verify-email/confirm-verification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: token })
                })
                .then(response => response.json())
                .then(data => {
                    loader.style.display = 'none';
                    if (data.success) {
                        document.body.innerHTML = \`
                            <div class="container">
                                <div class="header">
                                    <h1>✓ Email Verified!</h1>
                                    <p>Your email has been successfully verified</p>
                                </div>
                                <p style="color: #666; margin: 30px 0;">
                                    Your email address is now verified. You can proceed to log in to your account.
                                </p>
                                <Button style="
                                    display: inline-block;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 12px 30px;
                                    text-decoration: none;
                                    border-radius: 8px;
                                    font-weight: 600;
                                    margin-top: 20px;
                                ">You may close this page</Button>
                            </div>
                        \`;
                    } else {
                        alert('Error: ' + data.message);
                        buttonGroup.style.display = 'flex';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                    loader.style.display = 'none';
                    buttonGroup.style.display = 'flex';
                });
            }
            
            function declineVerification() {
                if (confirm('Are you sure you want to decline email verification?')) {
                    document.body.innerHTML = \`
                        <div class="container">
                            <div class="header">
                                <h1>✗ Verification Declined</h1>
                                <p>Your email was not verified</p>
                            </div>
                            <p style="color: #666; margin: 30px 0;">
                                You can verify your email later from your account settings.
                            </p>
                            <a href="/" style="
                                display: inline-block;
                                background: #667eea;
                                color: white;
                                padding: 12px 30px;
                                text-decoration: none;
                                border-radius: 8px;
                                font-weight: 600;
                                margin-top: 20px;
                            ">You may close this page</a>
                        </div>
                    \`;
                }
            }
        </script>
    </body>
    </html>
  `;
}

function generateErrorPage(message) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Error - Ritual Gurus</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                max-width: 500px;
                width: 100%;
                padding: 40px;
                text-align: center;
            }
            .header h1 {
                color: #e74c3c;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .header p {
                color: #666;
                font-size: 14px;
            }
            .message {
                background: #ffe6e6;
                padding: 15px;
                border-radius: 8px;
                color: #c0392b;
                margin: 20px 0;
                border-left: 4px solid #e74c3c;
            }
            a {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✗ Verification Failed</h1>
                <p>Unable to verify your email</p>
            </div>
            <div class="message">${message}</div>
            <a >You may close this page</a>
        </div>
    </body>
    </html>
  `;
}

function generateSuccessPage(title, message) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Ritual Gurus</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                max-width: 500px;
                width: 100%;
                padding: 40px;
                text-align: center;
            }
            .header h1 {
                color: #27ae60;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .header p {
                color: #666;
                font-size: 14px;
            }
            .message {
                background: #e8f8f5;
                padding: 15px;
                border-radius: 8px;
                color: #27ae60;
                margin: 20px 0;
                border-left: 4px solid #27ae60;
            }
            a {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ ${title}</h1>
            </div>
            <div class="message">${message}</div>
            <a >You may close this page</a>
        </div>
    </body>
    </html>
  `;
}

module.exports = router;
