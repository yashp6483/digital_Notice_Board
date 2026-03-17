const express = require("express");
const router = express.Router();

// middlewares
const { verifyToken,authorize } = require("../middleware/authMiddleware");

//controllers 
const { getAdminDashboard,  addAdmin } = require("../Controller/adminController");


router.get("/dashboard", verifyToken, authorize("admin"), getAdminDashboard);
router.post("/addAdmin",verifyToken,authorize("admin"),addAdmin)

module.exports = router;
