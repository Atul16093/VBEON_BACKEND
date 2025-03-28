import User from "../models/user.model.js";
//This must be imported for creating a connection  with the database
import bcrypt from "bcryptjs";
//importing helper class
import Helper from "../Helper/Helper.js";
//importing templete class for send OTP with some already written text
import Templete from "../utils/templete.js";
//importing a JWT token class
import JwtToken from "../utils/JwtToken.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import EmailTemplate from "../utils/EmailTemplate.js";
import { validationResult } from "express-validator";

//signup controller
export const register = async (request, response, next) => {
  try {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
      return response.status(400).json({message : "Bad Request" , errors : errors.array()})
    }
    let { username, email, password, dob, status , bio } = request.body;
    // console.log(username , email, password);
    let currentDate = new Date();
    let birthDate = new Date(dob);

    //User must be greater than 13 year
    let difference = currentDate.getFullYear() - birthDate.getFullYear();
    if (difference < 13) {
      return response.status(400).json({ "Message ": "User must be 13+" });
    }
    if (!status) {
      status = "online";
    }
    if(!bio){
      bio = "";
    }

    let emailStatus = await User.findOne({ email });
    if (emailStatus) {
      return response.status(409).json({ message: "User alredy exist" });
    }
    //Ecrypting the password
    let saltKey = bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password, saltKey);

    const helper = new Helper();
    const OTP = helper.generateOtp(4);

    // Creating a collection by using create command
    let registeredDetail = await User.create({ username, email, password, dob, bio , status, OTP });

    // carring email inside the token
    let token = new JwtToken();
    let emailToken = token.tokenGenerate(email);
    response.cookie("emailVerifyToken", emailToken);
    let data = {
      OTP: OTP,
      year: new Date().getFullYear(),
      appName: "VBEON",
      name: username,
      email: email,
      subject: "Email Verification",
    };
    // console.log(data);

    const templateData = new EmailTemplate().getEmailVerificationTemplate(data);
    helper.sendMail(data, templateData);

    //After the registration, a form will open to verify the email of the user by using get route

    response
      .status(201)
      .json({
        message:
          "User registered successfully , please verify your email by OTP!",
          user : {id : registeredDetail._id , username : registeredDetail.username , email : registeredDetail.email , dob : registeredDetail.dob , status : registeredDetail.status, emailVerifyToken : emailToken}
      });
  } catch (error) {
    console.log("error in register controller", error);
    response.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (request, response, next) => {
  try {
    let { email, password } = request.body;
    // console.log(email , password);

    let emailStatus = await User.findOne({ email }).populate({
      path: "servers",
      populate: [
        { path: "owner", select: "username email" }, // Populating owner details
        { path: "members.user", select: "username email status" }, // Populating members
        { path: "channels", select: "name" }, // Populating channels
        { path: "inviteLinks", select: "code expiresAt" } // Populating invite links
      ]
    });
    //User authecation
    if (emailStatus && emailStatus.OTP == null) {
      let encrypted = emailStatus.password;
      let status = bcrypt.compareSync(password, encrypted);
      if (status) {
        let token = new JwtToken();
        let email = emailStatus.email;
        let data = token.tokenGenerate(email);
        // console.log(data);
        response.cookie("token", data);
        let id = emailStatus._id;
        let info = token.idToken(id);
        response.cookie("id", info);
        return response.status(200).json({ message: "Login successfully " , user : {id : emailStatus._id, username : emailStatus.username, email : emailStatus.email ,servers : emailStatus.servers, status : emailStatus.status ,profilePic : emailStatus.profilePic, mailToken : data , userId : info}});
      } else {
        return response
          .status(401)
          .json({ message: "Invalid Password" });
      }
    } else {
      return response.status(404).json({ message: "Email not exist..." });
    }
  } catch (error) {
    console.log("error in login controller", error);

    return response.status(500).json({ message: "Internal server error" });
  }
};

//Verification route  ON the time of registration, is the email valid or not ?

export const verify = async (request, response, next) => {
  try {
    let { OTP } = request.body;
    let email = jwt.verify(request.cookies.emailVerifyToken, process.env.KEY);
    let mail = email.data;

    //check is email and OTP both are same or not, here we carry mail data by the help of token
    let status = await User.findOne({ OTP, email: mail });
    if (status) {
      //Updating the status value null
      await User.updateOne({ email: status.email }, { $set: { OTP: null } });
      return response.status(200).json({
        message: "Email verified successfully,, Now you can login"
      });
    } else {
      return response
        .status(401)
        .json({ message: "Incorrect OTP Register Again" });
    }
  } catch (error) {
    console.log("Error in verfiy controller", error);

    return response.status(500).json({ message: "Internal server error" });
  }
};

//Forget password router whenever user click on forget password this api request will trigger
export const forget = async (request, response, next) => {
  try {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
      return response.status(400).json({error : errors.array()});
    }
    const { email } = request.body;
    let status = await User.findOne({ email });
    if (status) {
      const helper = new Helper();
      const OTP = helper.generateOtp(6);
      let token = new JwtToken();
      //Stroing otp inside the token for matching
      let OTPCookie = token.OTPToken(OTP);

      //I want this email cookie for updating a password of particular user
      let emailCookie = token.tokenGenerate(status.email);
      // console.log(emailCookie);
      response.cookie("emailToken", emailCookie);
      // console.log(OTPCookie);
      response.cookie("OTPToken", OTPCookie);
      let data = {
        OTP: OTP,
        year: new Date().getFullYear(),
        appName: "VBEON",
        name: status.username,
        email: status.email,
        subject: "OTP FOR PASSWORD RESET",
      };
      const templateData = new Templete().getOtpTemplete(data);
      helper.sendMail(data, templateData);
      return response.status(200).json({ message: "OTP sent successfully" });
    }else{
      return response.status(404).json({message : "Email not exist..."})
    }
  } catch (error) {
    console.log("Error in forget controller", error);
    return response.status(500).json({ message: "Internal server error  " });
  }
};

//password updating router
export const updatePassword = async (request, response, next) => {
  try {
    let errors = validationResult(request);   
    if(!errors.isEmpty()){
      return response.status.json({error : errors.array()});
    }
    //Now here a passoword updation window will open
    const { newPassword } = request.body;
    console.log("It's a new password " , newPassword);
    
    let email = jwt.verify(request.cookies.emailToken, process.env.KEY);
    let status = await User.findOne({ email: email.data });
    if (status) {
      let salt = bcrypt.genSaltSync(10);
      let encrypted = bcrypt.hashSync(newPassword, salt);
      await User.updateOne(
        { _id: status._id },
        { $set: { password: encrypted } }
      );
      return response
        .status(201)
        .json({ message: "Password updated succesfully " });
    } else {
      return response.status(400).json({ message: "error" });
    }
  } catch (error) {
    console.log("Error in reset password ", error);
    return response.status(500).json({ message: "Internal server error" });
  }
};

export const getDetailById = async (request, response, next) => {
  try {
    let { id } = request.params;
    let detail = await User.findOne({ _id: id });

    if (!detail) {
      return response.status(400).json({ message: "User not found" });
    }
    return response.status(200).json({ message: "Successfull", userInfo : {id : detail._id ,username : detail.username , email : detail.email , bio : detail.bio , status : detail.status} });
  } catch (error) {
    console.log("error in getDetailById controller", error);
    return response.status(500).json({ message: "Internal server error" });
  }
};
export const getDetailByName = async (request, response, next) => {
  try {
    let { username } = request.params;
    let detail = await User.findOne({ username });

    if (!detail) {
      return response.status(400).json({ message: "User not found" });
    }
    return response.status(200).json({ message: "Successfull", userInfo : {id : detail._id ,username : detail.username , email : detail.email , bio : detail.bio , status : detail.status} });
  } catch (error) {
    console.log("error in getDetailByName controller", error);
    return response.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (request , response  ,next)=>{
    try{
        let token = request.cookies.token;
        let decodeToken = jwt.verify(request.cookies.token , process.env.KEY);
        let currentStatus = await User.findOne({email : decodeToken.data});

        if(!currentStatus){
          return response.status(404).json({message : "Unexcpected error occur "});
        }
        console.log(decodeToken.data);
        
        await User.updateOne({email : decodeToken.data} , {token});
        response.clearCookie("token")
        return response.status(200).json({message : "Logout successfully "});
      }catch(error){
          console.log("Error in logout controller" , error);
          return response.status(500).json({message : "Internal server error"})
        }

}

export const uploadProfile = async(request , response ,next)=>{
  try{
      const {userId} = request.params;
      if(!request.file){
        response.status(404).json({message : "no such file found "});
      }
      const filePath = `/uploads/${request.file.filename}`;
      console.log(filePath);
      
      // const userId = jwt.verify(request.cookies.id , process.env.KEY);
      //Here currently we pass id direclty cause our front end is not ready and I want to check is the image path stored successfully or not 
      const userStatus = await User.findOne({_id : userId});
      if(!userStatus){
        return response.status(401).json({message : "Unathorized user"})
      }
      await User.updateOne({profilePic : filePath })
  }catch(err){
        console.log("Error in uploadProfile Controller",err);  
        response.status(500).json({message : "Internal server error"});
  }
}
//Currently I hardcode the userId for some reason but I'll make this dynamic 
export const getProfile = async (request , response , next)=>{
  try{
       const userStatus = await User.findOne({_id : "67d14fbcff16bc927b713390"});
       if(!userStatus){
        return response.status(401).json({message : "Unathorized user"})
      }
      const url = userStatus.profilePic;
      return response.status(200).json({message : "profile url " , url})
       
  }catch(error){
    console.log("Error in getProfile controller", error);
    response.status(500).json({message : "Internal server error"});
    
  }
}
//For testing 
export const view = (request, response , next)=>{
  response.render("form.ejs")
}

// -----------------------------------------------------------------------------------------

