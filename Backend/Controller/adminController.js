const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getAdminDashboard = (req, res) => {
    res.json({
        message: "Welcome Admin",
        user: req.user
    });
};

exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id).select("-password");

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ admin });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: "admin" }).select("-password");

        res.json({ admins });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch admins" });
    }
};

exports.addAdmin = async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "admin",
            status: status || "active"
        });

        return res.json({ message: "Admin added successfully", admin });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await User.findByIdAndDelete(id);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ message: "Admin deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const admin = await User.findById(id);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        admin.name = name || admin.name;
        admin.email = email || admin.email;

        await admin.save();

        res.json({ message: "Admin updated successfully", admin });

    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const { name, phone, department, birthdate, status } = req.body;

        admin.name = name ?? admin.name;
        admin.phone = phone ?? admin.phone;
        admin.department = department ?? admin.department;
        admin.birthdate = birthdate ?? admin.birthdate;
        admin.status = status ?? admin.status;

        await admin.save();

        res.json({
            message: "Profile updated successfully",
            admin: admin.toObject({ versionKey: false, transform: (_doc, ret) => {
                delete ret.password;
                return ret;
            }})
        });
    } catch (err) {
        res.status(500).json({ message: "Profile update failed" });
    }
};
