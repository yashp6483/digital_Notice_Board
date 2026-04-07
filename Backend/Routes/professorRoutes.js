const express = require("express");
const router = express.Router();

// middlewares
const { verifyToken } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authMiddleware");

//controllers
const {
    professorDashboard,
    getProfessorProfile,
    updateProfessorProfile,
    addProfessor,
    getAllProfessors,
    deleteProfessor,
    updateProfessor
} = require("../Controller/professorController");
const { verify } = require("jsonwebtoken");

//routes 
router.get("/", verifyToken, authorize("professor"), professorDashboard);
router.get("/professor/profile", verifyToken, authorize("professor"), getProfessorProfile);
router.put("/professor/profile", verifyToken, authorize("professor"), updateProfessorProfile);
router.get("/professors", verifyToken, authorize("admin"), getAllProfessors);
router.post("/professor", verifyToken, authorize("admin"), addProfessor);
router.delete("/professor/delete/:id", verifyToken,authorize("admin"),deleteProfessor);
router.put("/professor/update/:id", verifyToken, authorize("admin"),updateProfessor);

module.exports = router;
