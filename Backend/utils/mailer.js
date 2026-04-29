const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const sendOtpEmail = async ({ to, otp, purpose }) => {
    const subject = purpose === "login" ? "Your Login OTP" : "Your Password Reset OTP";
    const message = `Your OTP is ${otp}. It is valid for 10 minutes.`;

    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject,
        text: message,
    });
};

const isMailConfigured = () => Boolean(process.env.MAIL_USER && process.env.MAIL_PASS);

module.exports = {
    sendOtpEmail,
    isMailConfigured,
};
