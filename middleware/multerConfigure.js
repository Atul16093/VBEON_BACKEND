import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// In es module __dirname doesn't work, we need to set __dirname by the help of fileURL 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__filename );

//Configure the storage 
const storage = multer.diskStorage(
    {
        destination : (req , file , cb)=>{
            //Here null will represent an error, It means if an error comes so that will come on null place 
            //Here We move backward one directory for accessing the public folder
            cb(null , path.join(__dirname,".." , "public/uploads"))
        },
        filename : (req , file , cb)=>{
            //For avoiding the overriding of the file  I write like this 
            cb(null , Date.now() + path.extname(file.originalname));
            
        }
    }
)

const upload = multer({storage});
export default upload;