import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlerwares.js";

 const router = Router()

 router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
          name: "coverImage",
          maxCount: 1  
        }

    ]),
    
    registerUser
)
//  router.route("/login").post(login) :keval smjhane le liye 


 export default router;
