import express from "express"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
// import session from "express-session";
import { Server } from "socket.io";
import {createServer} from "http";
import userRouter from "./router/user.routes.js";
import serverRouter from "./router/server.routes.js";
import channelRouter from "./router/channel.routes.js"
import messagesRouter from "./router/messages.routes.js"
import mongoose from "mongoose";
import cors from "cors";
import Message from "./models/message.model.js";
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server , {
    cors : {
        origin : "http://localhost:5173"
    }
});
// app.use(session({secret:"BeliveOnYou" ,saveUninitialized : true , resave : true}));
app.set("view engine" , "ejs");
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database connected");
    app.use(express.urlencoded({extended : true}))
    app.use(express.json());
    const corsOptions = {
        origin: "http://localhost:5173", 
        credentials: true,               
      };
    app.use(cors(corsOptions));
    //Must need to use this built in middleware, if you want to read the cookies data.
    app.use(cookieParser());
    app.use(express.static("./public"))
    app.use("/user" , userRouter)
    app.use("/server" , serverRouter);
    app.use("/channel" , channelRouter);
    app.use("/messages" , messagesRouter);
    
    const users = {};
    const userChannels = {};
    io.on("connection" , (socket)=>{
       console.log("A user connected " , socket.id);

    // Store user with their socket ID
    socket.on("UserConnected" , (userId)=>{
        users[userId] = socket.id;
    });
    socket.on("sendMessage", async ({ sender, content, channelId }) => {
        const message =await Message.create({ sender, content, channelId });
        console.log("Let's see " , message );
                
        io.to(channelId).emit("receiveMessage", message);
    });

    socket.on("joinChannel", ({channelId , userId}) => {
        console.log("Channel joined successfully");
        socket.join(channelId); // Join the channel room
        users[userId] = socket.id;
        userChannels[userId] = channelId;
    });
});
    server.listen(process.env.PORT||3000 , ()=>{
        console.log(`Server started http://localhost:${process.env.PORT}`);
    })
}).catch(err=>{
    console.log("Database connection failed", err);
    
})