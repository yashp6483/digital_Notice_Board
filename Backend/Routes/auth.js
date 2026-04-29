const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendOtpEmail, isMailConfigured } = require("../utils/mailer");

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_VERIFY_ATTEMPTS = 5;
const OTP_MAX_REQUESTS_PER_WINDOW = 5;
const OTP_REQUEST_WINDOW_MS = 15 * 60 * 1000;
const OTP_BLOCK_DURATION_MS = 15 * 60 * 1000;

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const saveOtp = async (user, purpose) => {
    const otp = generateOtp();
    const now = new Date();
    user.otp = {
        codeHash: await bcrypt.hash(otp, 10),
        purpose,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        lastSentAt: now,
        verifyAttempts: 0,
        lockedUntil: undefined,
        requestCount: user.otp?.requestCount || 0,
        requestWindowStartedAt: user.otp?.requestWindowStartedAt || now,
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

const normalizeEmail = (email) => (email || "").toString().trim().toLowerCase();

const checkAndUpdateRequestThrottle = (user) => {
    const now = Date.now();
    const otpState = user.otp || {};
    const windowStart = otpState.requestWindowStartedAt ? new Date(otpState.requestWindowStartedAt).getTime() : now;
    const lastSent = otpState.lastSentAt ? new Date(otpState.lastSentAt).getTime() : 0;

    if (lastSent && now - lastSent < OTP_RESEND_COOLDOWN_MS) {
        return { ok: false, status: 429, message: "Please wait before requesting another OTP" };
    }

    const withinWindow = now - windowStart < OTP_REQUEST_WINDOW_MS;
    const requestCount = withinWindow ? (otpState.requestCount || 0) + 1 : 1;
    if (requestCount > OTP_MAX_REQUESTS_PER_WINDOW) {
        return { ok: false, status: 429, message: "Too many OTP requests. Please try again later." };
    }

    user.otp = {
        ...otpState,
        requestCount,
        requestWindowStartedAt: withinWindow ? new Date(windowStart) : new Date(now),
    };

    return { ok: true };
};

const verifyOtpOrThrow = async (user, otp, purpose) => {
    const otpState = user.otp;
    if (!otpState || otpState.purpose !== purpose) {
        return { ok: false, status: 401, message: "Invalid or expired OTP" };
    }

    const now = Date.now();
    if (otpState.lockedUntil && new Date(otpState.lockedUntil).getTime() > now) {
        return { ok: false, status: 429, message: "Too many invalid attempts. Try again later." };
    }

    if (!otpState.expiresAt || otpState.expiresAt.getTime() < now) {
        await clearOtp(user);
        return { ok: false, status: 401, message: "OTP expired" };
    }

    const isOtpValid = await bcrypt.compare(String(otp), otpState.codeHash);
    if (!isOtpValid) {
        const attempts = (otpState.verifyAttempts || 0) + 1;
        user.otp.verifyAttempts = attempts;
        if (attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
            user.otp.lockedUntil = new Date(now + OTP_BLOCK_DURATION_MS);
        }
        await user.save();
        return { ok: false, status: attempts >= OTP_MAX_VERIFY_ATTEMPTS ? 429 : 401, message: "Invalid or expired OTP" };
    }

    return { ok: true };
};

router.post("/auth/request-login-otp", async (req, res) => {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
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

        const throttleResult = checkAndUpdateRequestThrottle(user);
        if (!throttleResult.ok) {
            await user.save();
            return res.status(throttleResult.status).json({ message: throttleResult.message });
        }

        if (process.env.NODE_ENV === "production" && !isMailConfigured()) {
            return res.status(500).json({ message: "OTP service is unavailable" });
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
                if (process.env.NODE_ENV === "production") {
                    await clearOtp(user);
                    return res.status(503).json({ message: "OTP delivery failed. Please retry." });
                }
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
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;
    const role = (req.body.role || "").toString().trim().toLowerCase();

    try {
        if (!email || !otp || !role) {
            return res.status(400).json({ message: "Email, OTP and role are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        if (user.role !== role) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }

        const verification = await verifyOtpOrThrow(user, otp, "login");
        if (!verification.ok) {
            return res.status(verification.status).json({ message: verification.message });
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
    const email = normalizeEmail(req.body.email);

    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "If this account exists, an OTP has been sent" });
        }

        const throttleResult = checkAndUpdateRequestThrottle(user);
        if (!throttleResult.ok) {
            await user.save();
            return res.status(429).json({ message: "If this account exists, an OTP has been sent" });
        }

        if (process.env.NODE_ENV === "production" && !isMailConfigured()) {
            return res.status(500).json({ message: "OTP service is unavailable" });
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
                if (process.env.NODE_ENV === "production") {
                    await clearOtp(user);
                    return res.status(503).json({ message: "OTP delivery failed. Please retry." });
                }
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
    const { password, otp } = req.body;
    const email = normalizeEmail(req.body.email);

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

        const verification = await verifyOtpOrThrow(user, otp, "forgot_password");
        if (!verification.ok) {
            return res.status(verification.status).json({ message: verification.message });
        }

        if (String(password).length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
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
