const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail, isMailConfigured } = require("../utils/mailer");

const OTP_TTL_MS = 10 * 60 * 1000;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const saveOtp = async (user, purpose) => {
    const otp = generateOtp();
    user.otp = {
        codeHash: await bcrypt.hash(otp, 10),
        purpose,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
    };
    await user.save();
    return otp;
};

const clearOtp = async (user) => {
    user.otp = undefined;
    await user.save();
};

const getOtpResponsePayload = (otp) => {
    if (process.env.NODE_ENV === "production") {
        return {};
    }

    return { devOtp: otp };
};

router.post("/auth/request-login-otp", async (req, res) => {
    const { email, password } = req.body;
    const role = (req.body.role || "").toString().trim().toLowerCase();

    try {
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Email, password and role are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch || user.role !== role) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const otp = await saveOtp(user, "login");
        let mailSent = false;
        let mailError = null;
        if (isMailConfigured()) {
            try {
                await sendOtpEmail({ to: user.email, otp, purpose: "login" });
                mailSent = true;
            } catch (error) {
                mailError = error?.message || "Unable to send OTP email";
                console.error("Login OTP mail send error:", mailError);
            }
        }

        return res.status(200).json({
            message: "OTP sent successfully",
            mailSent,
            mailError: process.env.NODE_ENV === "production" ? undefined : mailError,
            ...getOtpResponsePayload(otp),
        });
    } catch (error) {
        console.error("Request Login OTP Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/auth/verify-login-otp", async (req, res) => {
    const { email, otp } = req.body;
    const role = (req.body.role || "").toString().trim().toLowerCase();

    try {
        if (!email || !otp || !role) {
            return res.status(400).json({ message: "Email, OTP and role are required" });
        }

        const user = await User.findOne({ email });
        if (!user || !user.otp || user.otp.purpose !== "login") {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        if (!user.otp.expiresAt || user.otp.expiresAt.getTime() < Date.now()) {
            await clearOtp(user);
            return res.status(401).json({ message: "OTP expired" });
        }

        const isOtpValid = await bcrypt.compare(String(otp), user.otp.codeHash);
        if (!isOtpValid || user.role !== role) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        await clearOtp(user);

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({ token, name: user.name, role: user.role });
    } catch (error) {
        console.error("Verify Login OTP Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/auth/request-forgot-otp", async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "If this account exists, an OTP has been sent" });
        }

        const otp = await saveOtp(user, "forgot_password");
        let mailSent = false;
        let mailError = null;
        if (isMailConfigured()) {
            try {
                await sendOtpEmail({ to: user.email, otp, purpose: "forgot_password" });
                mailSent = true;
            } catch (error) {
                mailError = error?.message || "Unable to send OTP email";
                console.error("Forgot password OTP mail send error:", mailError);
            }
        }

        return res.status(200).json({
            message: "If this account exists, an OTP has been sent",
            mailSent,
            mailError: process.env.NODE_ENV === "production" ? undefined : mailError,
            ...getOtpResponsePayload(otp),
        });
    } catch (error) {
        console.error("Request Forgot OTP Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/forgot-password", async (req, res) => {
    const { email, password, otp } = req.body;

    try {
        if (!email || !password || !otp) {
            return res.status(400).json({
                message: "Email, OTP and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid request"
            });
        }

        if (!user.otp || user.otp.purpose !== "forgot_password") {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        if (!user.otp.expiresAt || user.otp.expiresAt.getTime() < Date.now()) {
            await clearOtp(user);
            return res.status(401).json({ message: "OTP expired" });
        }

        const isOtpValid = await bcrypt.compare(String(otp), user.otp.codeHash);
        if (!isOtpValid) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        const isSame = await bcrypt.compare(password, user.password);
        if (isSame) {
            return res.status(400).json({
                message: "New password cannot be same as old password"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.otp = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
