import express from "express";
import {body} from "express-validator";
import { register , login  , verify , forget , updatePassword , getDetailById , getDetailByName , uploadProfile , logout ,view , getProfile} from "../controller/user.controller.js";
import { OTPVerify } from "../middleware/otpVerification.js";
import {auth} from "../middleware/auth.js"
import upload from "../middleware/multerConfigure.js";
const router = express.Router();

//signin route
router.post("/login" ,  login)

//signup route
//Whenever we use multiple validation so we need to put all the validation inside an array otherwise only last will work
router.post("/register",[
    body("username", "Username is required").notEmpty(),
    body("email","Invalid Email ID").isEmail(),
    body("password" , "Password is Required").notEmpty(),
    body("password" , "password length should be between 8 to 16 character").isLength({min : 8 , max : 16}),
    body("dob" , "Date of birth is required").notEmpty()],
    register);

//Forget password 
router.post("/forget-password" ,
     body("email", "Invalid Email ID").isEmail(),
     forget);

//OTP verification 
router.post("/email-verification", verify );

//Verify user for updating Password
router.post("/otp-update-pass" , OTPVerify);

//update password /set new password
router.post("/reset-password" ,
    body("newPassword" , "password length should be between 8 to 16").isLength({min : 8 , max : 16}),
     updatePassword);

//Upload profile pic  
router.post("/upload-avatar/:userId" , upload.single("avatar") , uploadProfile);

//Get user profile 

router.get("/profile-pic" , getProfile);

//this route made for testing of multer
router.get("/view-page" , view)
//Logout 
router.get("/log-out" , logout);

//getuserdetail by the help of id 
router.get("/byid/:id" ,auth, getDetailById)

router.get("/byname/:username" ,auth, getDetailByName)


export default router;