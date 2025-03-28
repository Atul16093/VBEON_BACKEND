import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
    servername: {
        type: String,
        unique : true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Must match the User model name
    },
    members: [
        {
           user :{ 
                   type: mongoose.Schema.Types.ObjectId,
                   ref: "User"
           },
           role : {
                   type : String,
                   enum : ["admin" , "moderator", "member"],
                   default : "member"
           }
        },
    ],
    channels: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Channel",
        }
    ],
    inviteLinks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InviteLink"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Server = mongoose.model("Server" , serverSchema);
export default Server;

