const cron = require("node-cron");
const Notice = require("../models/Notice");

const initNoticeCron = (io) => {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            // console.log("Checking for scheduled notices...");
            
            // Find notices that are scheduled and their publish time has passed
            const scheduledNotices = await Notice.find({
                status: "scheduled",
                publishedAt: { $lte: now },
                isDeleted: false
            }).populate("createdBy", "name");

            if (scheduledNotices.length > 0) {
                console.log(`Publishing ${scheduledNotices.length} scheduled notices.`);
                
                for (const notice of scheduledNotices) {
                    const isExpired = notice.expiresAt && notice.expiresAt <= now;
                    notice.status = isExpired ? "inactive" : "active";
                    notice.autoExpired = Boolean(isExpired);
                    await notice.save();

                    const populatedNotice = notice.toObject();

                    // 🔍 DETECT TYPE (Same logic as controller)
                    let type = "text";
                    if (populatedNotice.documentUrl) {
                        if (populatedNotice.documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                            type = "image";
                        } else {
                            type = "url";
                        }
                    }
                    populatedNotice.type = type;

                    // Broadcast to all clients
                    io.emit("update_notice", populatedNotice);
                    console.log(`Notice "${notice.title}" status updated by scheduler.`);
                }
            }

            // Auto-expire active notices
            const expiredNotices = await Notice.find({
                status: "active",
                expiresAt: { $ne: null, $lte: now },
                isDeleted: false
            }).populate("createdBy", "name");

            for (const notice of expiredNotices) {
                notice.status = "inactive";
                notice.autoExpired = true;
                await notice.save();
                io.emit("update_notice", notice.toObject());
            }

        } catch (error) {
            console.error("Error in notice scheduling cron job:", error);
        }
    });
};

module.exports = initNoticeCron;
