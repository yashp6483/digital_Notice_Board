const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const { verifyToken, authorize } = require("../middleware/authMiddleware");

const { createNotice, getNotices, deleteNotice, updateNotice, getMyNotices } = require("../Controller/noticeController");

router.get("/notices", verifyToken, authorize("admin", "professor"), getNotices);
router.post("/notice", verifyToken, authorize("admin", "professor"), upload.single("document"), createNotice);
router.delete("/notice/delete/:id", verifyToken, authorize("admin", "professor"), deleteNotice);
router.put(
    "/notice/update/:id",
    verifyToken,
    authorize("admin", "professor"),
    upload.single("document"),
    updateNotice
);
router.get("/my-notices",verifyToken,authorize("admin","professor"),getMyNotices);


module.exports = router;
