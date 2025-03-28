import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export default class Helper{
    async sendMail(data, template){
        try{
    // create reusable transporter object using the default SMTP transport
       const sender = nodemailer.createTransport({
        port : 465,
        host : "smtp.gmail.com",
        auth : {
            user : "atulgamingyt1693@gmail.com",
            pass : "tulk oxtz wabj tfpu"
        }, 
        secure : true
    });
    
        const mailData = {
            from : "atulgamingyt1693@gmail.com",
            to  : data.email,
            subject : data.subject,
            html : template
        }
        sender.sendMail(mailData , function (err , info){
            if(err){
                console.log(err);  
            }
            else {
                console.log(info);
            }
        });
    }catch(err){
        console.log(err);     
    }
    }
    generateOtp(limit) {
        let characters = "0123456789";
        let otp = "";
        for (let i = 0; i < limit; i++) {
            otp += characters[Math.floor(Math.random() * characters.length)];
        }
        return otp;
    }
}
// // export const forget = async (request , response , next)=>{
//     try{
//         let {email} = request.body;
//         console.log(email);
        
//         let emailStatus = await User.findOne({email});
//         console.log(emailStatus);

//         if(emailStatus){
//             let sendTo = emailStatus.email;

//             const recevier = {
//                 from : "atulrag3@gmail.com",
//                 to  : sendTo,
//                 subject : "Password Reset Email",
//                 text : "Your code ",
//                 html : "<b>Hey there ! </b>"
//             }
            
//             await sender.sendMail(recevier);

//             return response.status(200).json({ message: "Email sent successfully" });
//         }
//     }catch(error){
//         return response.status(400).json({message : error.message});
//     }
// }
