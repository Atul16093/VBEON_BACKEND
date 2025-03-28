import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();
export const OTPVerify = (request , response , next)=>{
    try{
        const {OTP} = request.body;  
        let match = jwt.verify(request.cookies.OTPToken , process.env.KEY)  
        // console.log(match);
              
        //If otp will match so user can reset the password a form will show to user for password reset 
       if(match.OTP == OTP){
           return response.status(200).json({message : "Authorized user enter your new password"})
        //    next()
       }else{
        return response.status(400).json({message : "Invalid OTP"})
       }
    }catch(error){
        console.log("OTPVerify password error " , error);
        return response.status(500).json({message : "Internal server error"});
    }
}
