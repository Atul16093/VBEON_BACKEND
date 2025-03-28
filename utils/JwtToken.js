import jwt from "jsonwebtoken"
export default class Token{
    tokenGenerate(data){
    let token = jwt.sign({data} , "secreat");
    return token;
    }
    idToken(id){
    let token = jwt.sign({id} , "secreat");
    return token;
    }
    OTPToken(OTP){
        let token = jwt.sign({OTP} , "secreat");
        return token;
    }
}
