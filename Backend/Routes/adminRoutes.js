const express = require("express");
const router = express.Router();

// middlewares
const { verifyToken,authorize } = require("../middleware/authMiddleware");

//controllers 
const {
    getAdminDashboard,
    getAdminProfile,
    updateAdminProfile,
    addAdmin,
    getAdmins,
    deleteAdmin,
    updateAdmin
} = require("../Controller/adminController");


router.get("/", verifyToken, authorize("admin"), getAdminDashboard);
router.get("/profile", verifyToken, authorize("admin"), getAdminProfile);
router.put("/profile", verifyToken, authorize("admin"), updateAdminProfile);
router.get("/admins",verifyToken,authorize("admin"),getAdmins);
router.post("/addAdmin",verifyToken,authorize("admin"),addAdmin);
router.delete("/delete/:id",verifyToken,authorize("admin"),deleteAdmin);
router.put("/update/:id",verifyToken,authorize("admin"),updateAdmin);

module.exports = router;
