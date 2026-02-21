const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getAdminDashboard = (req, res) => {
    res.json({
        message: "Welcome Admin",
        user: req.user
    });
}

exports.addProfessor = async (req, res) => {

    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "Professor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const professor = await User.create({
        email,
        password: hashedPassword,
        role: "professor"
    });

    res.json({ message: "Professor added successfully", professor });
}

// add admin 
exports.addAdmin = async (req, res) => {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

     const professor = await User.create({
        email,
        password: hashedPassword,
        role: "admin"
    });

    res.json({ message: "Admin added successfully", professor });
}

exports.getAllProfessors = async (req, res) => {
    const professors = await User.find({ role: "professor" });
    res.json(professors);
}