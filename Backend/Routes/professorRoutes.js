const express = require("express");
const router = express.Router();

// middlewares
const { verifyToken } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authMiddleware");

//controllers
const { professorDashboard, addProfessor, getAllProfessors, deleteProfessor } = require("../Controller/professorController");

//routes 
router.post("/professor", verifyToken, authorize("admin"), addProfessor);
router.get("/", verifyToken, authorize("professor"), professorDashboard);
router.get("/professors", verifyToken, authorize("admin"), getAllProfessors);
router.delete("/professor/delete/:id", verifyToken,authorize("admin"),deleteProfessor);

module.exports = router;
