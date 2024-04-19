import { Router } from "express";
import {
     loginUser,
     logoutUser, 
     registerUser, 
     refreshAccessToken, 
     changeCurrentPassword, 
     getCurrentUser, 
     updateAccountDetails, 
     updateUserAvatar, 
     
     updateCoverImage, 
     getUserChannelProfile, 
     getWatchHistory
     } from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

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

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT,/*anotherMid,*/ logoutUser) // aap jitne jaho middlewares add kr skte ho if we need

router.route("/refresh-token").post(refreshAccessToken) // changes everythings

router.route("/change-password").post(verifyJWT, changeCurrentPassword) // changes everythings 

router.route("/current -user").get(verifyJWT, getCurrentUser ) // use only data indformation

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails) //patch use: if u use post then all users details update

router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) // make sure use proper naming syntax

router.route("/update-user-coverImage").patch(verifyJWT, upload.single("coverImage")/* multer se ayya h */,updateCoverImage) // make sure use prper namiiing syntax

//params ke wjh se aise syntax aaya h : get (url se data le rhe h issi wjh se)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/wacth-history").get(verifyJWT, getWatchHistory )

 export default router;
