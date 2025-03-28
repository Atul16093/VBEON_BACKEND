import Channel from "../models/channel.model.js";
import Message from "../models/message.model.js";

export const storeMessages = async (request , response , next)=>{
    try {
        
        const { content, senderId, channelId } = request.body;
    
        // Validate inputs
        if (!content || !senderId || !channelId) {
          return res.status(400).json({ message: "All fields are required" });
        }
    
        const newMessage = new Message({
          content,
          sender: senderId,
          channelId,
        });

        await newMessage.save();
    
        // Add message ID to the corresponding channel
        await Channel.findByIdAndUpdate(channelId, {
          $push: { messages: newMessage._id },
        });
    
        response.status(201).json({
          message: "Message sent successfully",
          data: newMessage,
        });
      } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
      }
}

export const getMessages = async (request , response , next)=>{
    try{
        const channelId = request.params.channelId;
       console.log(channelId);
       
        const messages = await Message.find({channelId}).populate("sender" , "username").sort({ createdAt: 1 });;
        
        return response.status(200).json({message : "Success", messages}); 
        
    }catch(err){
        return response.status(500).json({message : "Internal server error"});
    }
}