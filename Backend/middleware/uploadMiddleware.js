const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: "notices",
            resource_type: "raw",   // ✅ REQUIRED for PDF preview
            public_id: `${Date.now()}-${file.originalname}`,
        };
    },
});
        
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB
});

module.exports = upload;
