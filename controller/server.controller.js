import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Server from "../models/server.model.js";
import Invite from "../models/Invite.model.js";
import Channel from "../models/channel.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { validationResult } from "express-validator";
import { request, response } from "express";
export const createServer = async (request , response , next)=>{
        try{
            let errors = validationResult(request);
            if(!errors.isEmpty()){
                return response.status(400).json({error : errors.array()});
            }
            let {servername} = request.body;
             //Find the user who's creating a server
             let getUserId = jwt.verify(request.cookies.id , process.env.KEY);
            //  console.log(getUserId.id);
            let serverStatus = await Server.findOne({servername});
            if(serverStatus){
                return response.status(409).json({message : "Server name already exist"});
            }
            //First verify the user by there id,
            const user = await User.findById(getUserId.id);
            if(user){
               let serverStatus =  await Server.create({servername , owner : getUserId.id });
               await Server.updateOne({_id : serverStatus._id} , {$push : {members : {user : getUserId.id , role : "admin"}}});
               //Updating the servers key in the user collection , 
                await User.updateOne({_id : getUserId.id},{$push : {servers : serverStatus._id}});
                return response.status(201).json({message : "Server created successfully"});
            }else{
                return response.status(401).json({message : "Invalid server name"});
            }
        }catch(error){
            // console.log(error);
            return response.status(400).json({message : error.message});
        }
}
export const joinServer = async (request , response , next)=>{
    try{
        const {inviteCode} = request.params;
        
        let getUserId = jwt.verify(request.cookies.id , process.env.KEY);
        let userId = getUserId.id;
        
        let inviteStatus = await Invite.findOne({code : inviteCode});    
        
        if(!inviteStatus){
            return response.status(400).json({message : "Invalid Invite Code...!"})
        }

        //get the server id 
        const serverId = inviteStatus.serverId;
        let serverStatus = await Server.findById({_id : serverId});

        if(!serverStatus){
            return response.status(400).json({message : "Server not found "});
        }
       // Convert userId (string) to ObjectId before comparing, as MongoDB stores IDs as ObjectId 
        if (serverStatus.members.some(member => member.user.equals(new mongoose.Types.ObjectId(getUserId)))){
            return response.status(409).json({ message: "You are already a member of this server" });
        }
        
        await Server.updateOne({_id : serverId} , {$push: {members : {user : userId , role : "member"}}});
        await User.updateOne({_id : userId} , {$push : {servers : serverId}});
        return response.status(200).json({message : "Server joined successfully"});
    }catch(error){        
        return response.status(400).json({message : error.message});
    }
}
//For leaving the server 
export const leave = async (request, response , next)=>{
    try{
        let {serverId} = request.params;
        let tokenObj = jwt.verify(request.cookies.id , process.env.KEY);
        let getUserId = tokenObj.id;
        
        //Checking the server existence
        let serverStatus = await Server.findOne({_id : serverId}); 
        // let role = serverStatus.members[0].role;

        if(!serverStatus){
            return response.status(400).json({message : "Invalid server access"})
        }
        
        if(!serverStatus.members.some(member => member.user.equals(new mongoose.Types.ObjectId(getUserId)))){
            return response.status(400).json({message : "User not exist "});
        }

        //Get the role of the user it's exist inside an array object so we need to iterate that.
        let roleStatus = serverStatus.members.find(member =>{return member.user.equals(new mongoose.Types.ObjectId(getUserId))});
        let role = roleStatus ? roleStatus.role : "";
        
         let result = await Server.updateOne({_id : serverId} , {$pull : {members :{user : new mongoose.Types.ObjectId(getUserId) , role : role}}});
         console.log(result);
         
         await User.updateOne({_id : getUserId} , {$pull : {servers : serverId}});
        return response.status(200).json({message : "You left"})
        
    }catch(error){
        return response.status(400).json({message : error.message});
    }
}

//Delete Server 
export const deleteServer = async (request , response , next)=>{
    try{
    let {serverId} = request.params;    
    let serverStatus = await Server.findOne({_id : serverId});
    let tokenObj = jwt.verify(request.cookies.id , process.env.KEY);
    let getUserId = tokenObj.id;
    if(!serverStatus){
        return response.status(400).json({message : "Invalid server access"});
    }
    //is the server admin want to delete the server
    if (serverStatus.owner.toString() !== getUserId) {
        return response.status(403).json({ message: "You're not the owner of this server, cann't delete it" });
    }
    await Channel.deleteMany({serverId : serverId});
    await User.updateMany({servers : serverId} , {$pull : {servers : serverId}} )
    let res = await Server.deleteOne({_id : serverId} );
    console.log(res);
    
    return response.status(200).json({message : "Server and all associated channels deleted successfully" , res});
    }catch(error){
        return response.status(500).json({message : error.message});
    }
    
}

export const updateServerName = async (request , response , next)=>{
    try{
        let {serverId} = request.params;
        let {updatedname} = request.body;
        //checking the status of the channel 
        let adminId = jwt.verify(request.cookies.id , process.env.KEY);

        let serverStatus = await Server.findOne({_id : serverId});

        if(!serverStatus){
            return response.status(404).json({message : "server not exist"})
        }
        
        let serverName = await Server.findOne({$and : [{_id : serverId} , {servername : updatedname}]});

        if(serverName){
            return response.status(409).json({message : "Server name already exist"});
        }

        if(serverStatus.owner.toString() !== adminId.id){
            return response.status(403).json({ message: "You're not the owner of this server, cann't update the name" });
        }


        await Server.updateOne({_id : serverId} , {$set : {servername : updatedname}});
        return response.status(201).json({message : "server name updated successfully"});

    }catch(error){
        return response.status(500).json({message : error.message});
    }
}

//get Member details
export const getServerDetail = async(request , response , next)=>{
    try{
        let {serverId} = request.params;
        // console.log(serverId);
        
        let serverInfo = await Server.findOne({_id : serverId}).populate("members.user" , "username , _id , status, profilePic");
        if(!serverInfo){
            return response.status(400).json({message : "Server not found"});
        }
        return response.status(200).json({message : "Success" , serverInfo} );
    }catch(err){
        console.log("Error in members controller " , err);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const allServer = async (request , response , next)=>{
    try{
        const {ownerId} = request.params;
        const detail = await User.findOne({_id : ownerId}).populate("servers")
        if(!detail){
            return response.status(404).json({message : "Detail not found"});
        }
        return response.status(200).json({message : "Successfully fetch all the detail", detail})
    }catch(err){
        console.log("Error in allServer",err);
        return response.status(500).json({message : "Internal server error"});
    }
}
