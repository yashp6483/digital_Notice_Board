const User = require("../models/User");
const bcrypt = require("bcryptjs");
exports. professorDashboard = (req, res) => {
  res.json({
    message: "Welcome Professor",
    user: req.user
  });
}

exports.addProfessor = async (req, res) => {

    try {
        const { name, department, email, phone, birthdate, password, status } = req.body;

        const existing = await User.findOne({ email });

        if (existing) {
            return res.status(400).json({
                message: "Professor already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const professor = await User.create({
            name,
            department,
            email,
            phone,
            birthdate,
            password: hashedPassword,
            status,
            role: "professor"
        });

        res.status(201).json({
            message: "Professor added successfully",
            professor
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Problem in adding professor"
        });

    }

};

exports.getAllProfessors = async (req, res) => {
    try {
        const professors = await User.find({ role: "professor"});
         
        res.status(200).json({
            success: true,
            professors
        });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

exports.deleteProfessor = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProfessor = await User.findByIdAndDelete(id);

        if (!deletedProfessor) {
            return res.status(404).json({ message: "Professor not found" });
        }

        res.status(200).json({
            message: "Professor deleted successfully",
        })
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error });
    }
}

exports.updateProfessor = async (req, res) => {
    try {
        const { id } = req.params;

        const updateData = {
            name: req.body.name,
            department: req.body.department,
            birthdate: req.body.birthdate,
            phone : req.body.phone,
            status: req.body.status,
        };

        const professor = await User.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: "after" }
        );

        if (!professor) {
            return res.status(404).json({ message: "Professor not found" });
        }

        res.json({
            message: "Professor updated successfully",
            professor
        });

    } catch (err) {
        res.status(500).json({
            message: "Professor Update failed",
            err: err.message
        });
    }
};
