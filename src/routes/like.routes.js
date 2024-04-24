import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();
// Apply verifyJWT middleware to all routes in this file
router.use(async (req, res, next) => {
    try {
        await verifyJWT(req, res, next);        
    } catch (error) {
        console.error("Error in verifyJWT middlewares:", error);
        return res
        .status(500)
        .json({message: "Internal server error"});     
    }
}) ;

// route for toggling like in a video
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// route for toggling like on a comment 
router.route("/toggle/c/:commentId").post(toggleCommentLike);

//  route for toggglilng like in tweert
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

// route for getting all liked video
router.route("/videos").get(getLikedVideos);

export default router