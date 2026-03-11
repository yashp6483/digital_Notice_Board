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
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    birthDate: {
        type: Date
    },
    role: {
        type: String,
        enum: ["admin", "professor"],
        required: true
    }
})

module.exports = mongoose.model("User", userSchema);