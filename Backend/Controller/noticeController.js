const Notice = require("../models/Notice");

const parseBoolean = (value, fallback = false) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        if (value.toLowerCase() === "true") return true;
        if (value.toLowerCase() === "false") return false;
    }
    return fallback;
};

exports.createNotice = async (req, res) => {
    try {
        const now = new Date();
        const isProfessor = req.user?.role === "professor";
        const publishedAt = req.body.publishedAt ? new Date(req.body.publishedAt) : now;
        const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
        let status = req.body.status || "active";
        let autoExpired = false;
        const requiresApproval = isProfessor
            ? parseBoolean(req.body.requiresApproval, true)
            : false;
        const approvalStatus = requiresApproval ? "pending" : "approved";

        // If publishedAt is in the future, set status to scheduled
        if (status === "active" && publishedAt > now) {
            status = "scheduled";
        }
        if (status === "active" && expiresAt && expiresAt <= now) {
            status = "inactive";
            autoExpired = true;
        }

        const notice = new Notice({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            status,
            approvalStatus,
            requiresApproval,
            publishedAt,
            expiresAt,
            autoExpired,
            documentUrl: req.file?.secure_url || req.file?.path || null,
            createdBy: req.user._id || req.user.id
        });

        await notice.save();

        const populatedNotice = await Notice.findById(notice._id)
            .populate("createdBy", "name role")
            .lean();

        // 🔍 DETECT TYPE
        let type = "text";

        if (populatedNotice.documentUrl) {
            if (
                populatedNotice.documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            ) {
                type = "image";
            } else {
                type = "url";
            }
        }

        populatedNotice.type = type;

        // Only emit if the notice is active and approved
        if (status === "active" && approvalStatus === "approved") {
            req.io.emit("new_notice", populatedNotice);
        }

        res.status(201).json({
            success: true,
            message: requiresApproval
                ? "Notice submitted for approval"
                : status === "scheduled"
                    ? "Notice scheduled successfully"
                    : "Notice created successfully",
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
            .populate("createdBy", "name role")
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

        req.io.emit("delete_notice", id);

        res.status(200).json({
            message: "Notice deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Delete failed",
            error
        });
    }
};

exports.updateNotice = async (req, res) => {
    try {
        const now = new Date();
        const isProfessor = req.user?.role === "professor";
        const { id } = req.params;

        const publishedAt = req.body.publishedAt ? new Date(req.body.publishedAt) : now;
        const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
        let status = req.body.status || "active";
        let autoExpired = false;
        const requiresApproval = isProfessor
            ? parseBoolean(req.body.requiresApproval, true)
            : false;
        const approvalStatus = requiresApproval ? "pending" : "approved";

        if (status === "active" && publishedAt > now) {
            status = "scheduled";
        }
        if (status === "active" && expiresAt && expiresAt <= now) {
            status = "inactive";
            autoExpired = true;
        }
        if (status === "inactive") {
            autoExpired = false;
        }

        const updateData = {
            title: req.body.title,
            category: req.body.category,
            publishedAt,
            expiresAt,
            status,
            autoExpired,
            approvalStatus,
            requiresApproval,
            description: req.body.description
        };

        if (req.file) {
            updateData.documentUrl =
                req.file?.secure_url || req.file?.path || null;
        }

        const notice = await Notice.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("createdBy", "name role"); 

        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        // Only emit if the notice is active and approved
        if (notice.status === "active" && notice.approvalStatus === "approved") {
            req.io.emit("update_notice", notice);
        }

        res.json({
            message: requiresApproval
                ? "Notice updated and submitted for approval"
                : status === "scheduled"
                    ? "Notice updated and scheduled"
                    : "Notice updated successfully",
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
        }).populate("createdBy", "name email role");;

        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicNotice = async (req, res) => {
    try {
        const notices = await Notice.find({
            status: "active",
            approvalStatus: "approved",
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .populate("createdBy", "name role")
            .lean();

        const formattedNotices = notices.map((notice) => {
            let type = "text";

            if (notice.documentUrl) {
                if (notice.documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    type = "image";
                } else if (notice.documentUrl.includes("http")) {
                    type = "url";
                }
            }

            return {
                ...notice,
                type
            };
        });

        res.json({ notices: formattedNotices });

    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notices" });
    }
};

exports.approveNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await Notice.findById(id).populate("createdBy", "name role");
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }
        if (!notice.requiresApproval || notice.createdBy?.role !== "professor") {
            return res.status(400).json({
                message: "Only professor notices marked for approval can be approved"
            });
        }

        notice.approvalStatus = "approved";
        notice.requiresApproval = true;
        if (
            notice.publishedAt <= new Date() &&
            (!notice.expiresAt || notice.expiresAt > new Date()) &&
            notice.status !== "inactive"
        ) {
            notice.status = "active";
            notice.autoExpired = false;
        }
        await notice.save();

        if (notice.status === "active") {
            req.io.emit("new_notice", notice);
        }

        res.status(200).json({
            success: true,
            message: "Notice approved successfully",
            notice
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rejectNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const existingNotice = await Notice.findById(id).populate("createdBy", "name role");
        if (!existingNotice) {
            return res.status(404).json({ message: "Notice not found" });
        }
        if (!existingNotice.requiresApproval || existingNotice.createdBy?.role !== "professor") {
            return res.status(400).json({
                message: "Only professor notices marked for approval can be rejected"
            });
        }

        const notice = await Notice.findByIdAndUpdate(
            id,
            { approvalStatus: "rejected", requiresApproval: true },
            { new: true, runValidators: true }
        ).populate("createdBy", "name role");

        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        res.status(200).json({
            success: true,
            message: "Notice rejected successfully",
            notice
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
