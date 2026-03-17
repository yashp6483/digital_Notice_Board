const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// 🔐 FORGOT PASSWORD (Direct Reset)
router.post("/forgot-password", async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ Validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 🔍 Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 🔒 Check if same password (optional but good)
        const isSame = await bcrypt.compare(password, user.password);
        if (isSame) {
            return res.status(400).json({
                message: "New password cannot be same as old password"
            });
        }

        // 🔐 Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔁 Replace old password
        user.password = hashedPassword;

        // 💾 Save
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
