const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    category : {
        type : String,
        enum : ["Exam", "Emergency", "Academic", "Event", "General"],
        required : true
    },
    documentUrl : {
        type : String,
    },
    status : {
        type : String,
        enum : ["active", "inactive"],
        default : "active"
    },
    approvalStatus : {
        type : String,
        enum : ["pending", "approved", "rejected"],
        default : "pending"
    },
    publishedAt : {
        type : Date,
        default : Date.now
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    editedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"    
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
}, { timestamps : true});

module.exports = mongoose.model("Notice",noticeSchema);