const express = require("express");
const router = express.Router();

// middlewares
const { verifyToken,authorize } = require("../middleware/authMiddleware");

//controllers 
const { getAdminDashboard, addProfessor, getAllProfessors, addAdmin } = require("../Controller/adminController");


router.get("/dashboard", verifyToken, authorize("admin"), getAdminDashboard);
router.post("/addAdmin",verifyToken,authorize("admin"),addAdmin)
router.post("/add-professor", verifyToken, authorize("admin"), addProfessor);
router.get("/professors", verifyToken, authorize("admin"), getAllProfessors);

module.exports = router;
