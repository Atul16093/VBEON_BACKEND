import express from "express";
import {auth} from "../middleware/auth.js"
import { 
     createServer,
     joinServer,
     leave,
     deleteServer,
     updateServerName,
     getServerDetail,
     allServer,
    } from "../controller/server.controller.js";
import { createInvite } from "../controller/Invite.controller.js";
import { body } from "express-validator";
const router = express.Router();

//Creating a server 
router.post("/create-server" ,
     body("servername" , "Server name is required").notEmpty(),
     auth , createServer);

//Generate Invite link and enterd that invite link into the database for authentication purpose
router.post("/:serverId/invite" ,auth , createInvite);

//InviteCode get from user provided link
router.post("/join/:inviteCode" ,auth, joinServer);

//Leave server
router.delete("/:serverId/leave" ,auth , leave)

//Delete Server 
router.delete("/delete/:serverId" ,auth , deleteServer);

//Update server name 
router.put("/:serverId/usn" ,auth , updateServerName);

//Member detail
router.get("/search-server/:serverId" ,auth , getServerDetail);

router.get("/all-server/:ownerId" ,auth , allServer);

export default router;