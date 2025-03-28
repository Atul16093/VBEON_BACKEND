import express from "express";
import { storeMessages, getMessages } from "../controller/messages.controller.js";
const router = express.Router();

router.post("/send" , storeMessages);

router.get("/:channelId" , getMessages)

export default router;