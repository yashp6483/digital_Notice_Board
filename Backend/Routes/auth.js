const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const normalizeEmail = (email) => (email || "").toString().trim().toLowerCase();

const loginHandler = async (req, res) => {
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

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            token,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

router.post("/auth/login", loginHandler);

router.post("/forgot-password", async (req, res) => {
    const { password } = req.body;
    const currentPassword = req.body.currentPassword;
    const email = normalizeEmail(req.body.email);

    try {
        if (!email || !password || !currentPassword) {
            return res.status(400).json({
                message: "Email, currentPassword and new password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid request"
            });
        }

        const isCurrentMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
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
