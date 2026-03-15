const User = require("../models/User");

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