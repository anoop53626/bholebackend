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
//retrieving comments for specific video 

router.route("/adding-comments").post(verifyJWT, addComment);
// adding new comments to a video

router.route("/c/:commentId").delete(verifyJWT, deleteComment)
//deleting  comment 

router.route("/update-comments").patch(verifyJWT, updateComment);
//updating  an existing comment

export default router;