const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const { verifyToken, authorize } = require("../middleware/authMiddleware");

const { createNotice, getNotices, deleteNotice, updateNotice } = require("../Controller/noticeController");

router.get("/notices", verifyToken, authorize("admin"), getNotices);
router.post("/notice", verifyToken, authorize("admin"), upload.single("document"), createNotice);
router.delete("/notice/delete/:id", verifyToken, authorize("admin"), deleteNotice);
router.put(
    "/notice/update/:id",
    verifyToken,
    authorize("admin"),
    upload.single("document"),
    updateNotice
);


module.exports = router;
