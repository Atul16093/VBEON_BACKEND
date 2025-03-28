import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique : true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    maxlength: 200,
    default: "",
  },
  dob: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["online", "offline", "dnd", "idle"],
    default: "online",
  },
  friends: {
    type: [String],
  },
  servers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server"
      },
  ],
  OTP: {
    type: Number,
  },
  profilePic : {
    type : String,
    default: "/uploads/default-profile.png"
  },
  token : {
    type : String,
    default : null
  }
});

const User = mongoose.model("User", userSchema);

export default User;
