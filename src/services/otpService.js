require("dotenv").config();

const sendOTP = async (phone_number) => {
    console.log("Sending OTP to phone number:", phone_number);
    // We're no more using MSG91, now we're using 2factor.in for OTPs
    // return { success: true, message: "OTP sent successfully (dummy response)" };
    if (!phone_number || phone_number.trim() === "") {
        return {
            success: false,
            message: "Phone number is required to send OTP.",
        };
    }
    console.log("Initiating OTP send via 2factor.in for number:", phone_number);
    console.log("using link: ", `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/+91${phone_number}/AUTOGEN3/${process.env.OTP_TEMPLATE_NAME}`)

    try {
        const response = await fetch(
            `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/+91${phone_number}/AUTOGEN3/${process.env.OTP_TEMPLATE_NAME}`
        , {
            method: "GET",
        });
        console.log("2factor.in Send OTP Raw Response:", response);
        const result = await response.json();
        console.log("2factor.in Send OTP Response:", result);
        if (result.Status !== "Success") {
            return {
                success: false,
                message: "Failed to send OTP.",
                response: result,
            };
        }
        return {
            success: true,
            message: "OTP sent successfully.",
            token: result.Details, // This is the session token to be used for verification
        };
    }
    catch (error) {
        console.error("2factor.in Send OTP Error:", error);
        return {
            success: false,
            message: "Error occurred while sending OTP.",
            error: error.message,
        };
    }
}

const verifyOTP = async (otp, session_token) => {   
    console.log("Verifying OTP:", otp, "with session token:", session_token);
    if (!otp || otp.trim() === "" || !session_token || session_token.trim() === "") {
        return {
            success: false,
            message: "OTP and session token are required for verification.",
        };
    }
    try {
        const response = await fetch(
            `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/VERIFY/${session_token}/${otp}`
        , {
            method: "GET",
        });
        const result = await response.json();
        console.log("2factor.in Verify OTP Response:", result);
        if (result.Status !== "Success") {  
            return {
                success: false,
                message: "OTP verification failed.",
                response: result,
            };
        }  
        return {
            success: true,
            message: "OTP verified successfully.",
        };
    } catch (error) {
        console.error("2factor.in OTP Verification Error:", error);
        return {    
            success: false,
            message: "Failed to verify OTP.",
            error: error.message,
        };
    }
};

const sendVerificationMail = async (email) => {
    // Implement email sending logic here if needed
    return { success: true, message: "Verification email sent (dummy response)" };
};


module.exports = {
    sendOTP,
    verifyOTP,
    // Use same send OTP function for retry OTP
};

