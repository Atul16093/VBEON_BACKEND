import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import User from "../models/user.model.js";
dotenv.config();

export const auth = async (request , response , next)=>{
    try{        
    let tokenData = jwt.verify(request.cookies.token , process.env.KEY)
    if(tokenData){        
     let userStatus = await User.findOne({email : tokenData.data})
     console.log('User status ',userStatus);
     
     if(!userStatus){
        return response.status(404).json({message : "User not found "});
     }
     console.log("It's a user status token ",userStatus.token);
     console.log("It's a token o request cookies token" , request.cookies.token);
     
     
     if(userStatus.token != request.cookies.token){
        next();
    }else{
        return response.status(401).json({message : "Unathorized user "});
    }

    }else{
        return response.status(401).json({message : "login first "});
    }
    }catch(error){
        console.log("error in auth controller" ,error);
        return response.status(401).json({message : "Unathorized user"});
        
    }
}