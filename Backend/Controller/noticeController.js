const Notice = require("../models/Notice");

exports.createNotice = async (req, res) => {
    try {
        const notice = new Notice({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            status: req.body.status,
            publishedAt: req.body.publishedAt,
            documentUrl: req.file?.secure_url || req.file?.path || null,
            createdBy: req.user._id || req.user.id
        });

        await notice.save();

        const populatedNotice = await Notice.findById(notice._id)
            .populate("createdBy", "name")
            .lean();

        res.status(201).json({
            success: true,
            message: "Notice created successfully",
            notice: populatedNotice
        });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .populate("createdBy", "name")
            .lean();

        res.status(200).json({
            success: true,
            notices
        });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedNotice = await Notice.findByIdAndDelete(id);

        if (!deletedNotice) {
            return res.status(404).json({ message: "NO NOTICE FOUND" });
        }

        res.status(200).json({
            message: "Notice deleted successfully",
        })
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error });
    }
}

exports.updateNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const updateData = {
            title: req.body.title,
            category: req.body.category,
            publishedAt: req.body.publishedAt,
            status: req.body.status,
            description: req.body.description
        };

        if (req.file) {
            updateData.documentUrl = req.file?.secure_url || req.file?.path || null;
        }

        const notice = await Notice.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        res.json({
            message: "Notice updated successfully",
            notice
        });

    } catch (err) {
        res.status(500).json({
            message: "Update failed",
            err: err.message
        });
    }
};

exports.getMyNotices = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const notices = await Notice.find({
            createdBy: userId,
            isDeleted: false
        }).populate("createdBy", "name email");;

        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


