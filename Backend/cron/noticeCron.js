const cron = require("node-cron");
const Notice = require("../models/Notice");

const initNoticeCron = (io) => {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            // console.log("Checking for scheduled notices...");
            
            // Find notices that are scheduled and their publish time has passed
            const scheduledNotices = await Notice.find({
                status: "scheduled",
                publishedAt: { $lte: new Date() },
                isDeleted: false
            }).populate("createdBy", "name");

            if (scheduledNotices.length > 0) {
                console.log(`Publishing ${scheduledNotices.length} scheduled notices.`);
                
                for (const notice of scheduledNotices) {
                    notice.status = "active";
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
                    io.emit("new_notice", populatedNotice);
                    console.log(`Notice "${notice.title}" is now active and broadcasted.`);
                }
            }
        } catch (error) {
            console.error("Error in notice scheduling cron job:", error);
        }
    });
};

module.exports = initNoticeCron;