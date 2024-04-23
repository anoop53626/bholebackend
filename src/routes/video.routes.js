import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// getting alll videos
router.get("/", getAllVideos);

// publishing all videos
router.post("/",
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

    // getting specific videos

router.get("/:videoId", getVideoById);
    
router.delete("/:videoId", deleteVideo);

router.patch("/:videoId", upload.single("thumbnail"), updateVideo);

router.patch("/toggle/publish/:videoId", togglePublishStatus);

export default router;