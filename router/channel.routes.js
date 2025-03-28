import express from "express";
import {createChannel,
        deleteChannel,
        updateChannelName,
        getChannel,
        updateRole,
        addMembersToChannel
       } from "../controller/channel.controller.js"
import { auth } from "../middleware/auth.js";
const router = express.Router();
//Creating an channel
router.post("/:serverId/create" ,auth , createChannel )
//members who can access a particular channel 

router.post("/:channelId/add-members" , auth , addMembersToChannel);

//Delete channel 
router.delete("/:channelId/delete" ,auth , deleteChannel )

//Update channel name 
router.put("/:channelId/ucn" ,auth, updateChannelName)

router.put("/:channelId/updaterole" , auth , updateRole);
//Get channel
// router.get("/:serverId" ,auth, getChannel)
router.get("/:serverId" ,auth, getChannel)
export default router;