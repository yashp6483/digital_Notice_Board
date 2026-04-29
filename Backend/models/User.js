const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        enum: ["Computer Engineering", "Mechenical Engineering", "Civil Engineering", "Electical Engineering", "Electronics and comunication"],
        default: "Computer Engineering"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    birthdate: {    
        type: Date
    },
    role: {
        type: String,
        enum: ["admin", "professor"],
        required: true
    },
    otp: {
        codeHash: {
            type: String
        },
        purpose: {
            type: String,
            enum: ["login", "forgot_password"]
        },
        expiresAt: {
            type: Date
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
