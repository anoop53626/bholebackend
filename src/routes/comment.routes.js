import { Router } from 'express';

import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();// its creates new express routes 


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:videoId").get(verifyJWT, getVideoComments)
//retrieve comments for specific video 

router.route("/adding-comments").post(verifyJWT, addComment);
// add a new comments to a video

router.route("/c/:commentId").delete(verifyJWT, deleteComment)
//delete comment 

router.route("/update-comments").patch(verifyJWT, updateComment);
//update an existing comment

export default router;