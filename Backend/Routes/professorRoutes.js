const express = require("express");
const router = express.Router();

// middlewares
const { verifyToken } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authMiddleware");

//controllers
const { professorDashboard } = require("../Controller/professorController");

router.get("/", verifyToken, authorize("professor"), professorDashboard);

module.exports = router;
