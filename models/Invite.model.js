import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
    code : {
        type : String,
        unique : true,
        required : true,
    },
    serverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Server"
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    expiresAt : {
        type : Date
    }
})

const InviteLink = mongoose.model("InviteLink" , InviteSchema);
export default InviteLink;