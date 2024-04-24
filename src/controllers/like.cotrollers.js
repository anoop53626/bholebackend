import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js";
import {Tweet} from "../models/tweet.model.js";
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//toggle the video like
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
     // aggregate pipeline to toggle video like data 
    const userId = req.user._id;

    // check user is authenticated or not
    if (!userId) {
        return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));        
    }
    
    try {
        // validate videoID
        if (isValidObjectId) {
            throw new ApiError(400, "Invalid video ID")            
        }
        //check if the video exists
        const video = await Video.findById(videoId);

        if(! video ){
            throw new ApiError(404, "Video not found");
        }  

        // check user  liked or not already
    if (isLiked) {//already liked the video
        await Video.findByIdAndUpdate( videoId, { $pull: { likes: userId } }); 
        // pull is used to unlike the videolikes for the user        
    } else {// not liked the video
        await Video.findByIdAndUpdate(videoId, {$push: {likes: userId }}); 
        //push is used to liked the video for user       
    }
    //fetching updated video 
    const updateVideo = await Video.findById(videoId);
    
    return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video likes toggled successfully" ))
          
    } catch (error) {
        if (error instanceof ApiError) {
            return res
            .status(error.statusCode)
            .json(new ApiResponse(error.statusCode, null, error.message))
        } else {
            console.error("Internal server error:", error)
            return res
            .status(500)
            .json(new ApiResponse(500, null, " Internal server error"))            
        }
    }           
    });

// toggle the video comment like
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const userId = req.user._id;
    if (!userId) {
        return res
        .status(401)
        .json(new ApiResponse(401, null, " user not authenticated"))        
    }

    try {
        // validate comment id 
        if (!isValidObjectId) {
            throw new ApiError(400, "Invalid comment ID")
        } 
         // check comment exists or not
        const comment = await Comment .findById(commentId);
        if(!comment) {
            throw new ApiError(404, "Comment not found");
        }
        // check user already liked
        const isLiked = comment.likes.includes(userId);
        
        // toggle like status based on current like status
        if(isLiked) {
            await Comment.findByIdAndUpdate( commentId, { $pull: { likes: userId }});
            // pull is used to unlike the video comment for the users
        } else {
            await Comment.findByIdAndUpdate(( commentId, { $push: { likes: userId }}));
        }  //push is used to like the video comment for the users
        
        // fetch the updated comment after toggling the like 
        const updatedComment = await Comment.findById( commentId );

        return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment like toggled successfully "));

    } catch (error) {
        //handle errror
        if (error instanceof ApiError) {
            return res
            .status(error.statusCode)
            .json(new ApiResponse(error.statusCode, null, error.message));
        } else {
            console.error("Internal server error:", error)
            return res
            .status(500)
            .json(new ApiResponse(500, null, "Internak server error"))            
        }        
    }   
});

// toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const  userId = req.user._id;
    // check if user is authenticated 
    if (!userId) {
        return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"))        
    }

    try {
        //validate tweetId
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid tweet ID")            
        }
        // check tweet exist or not
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "tweet not found");            
        }
        //check user already tweet liked 
        const isLiked = tweet.likes.includes(userId);

        //toggle like status based on current like status
        if (isLiked) {
            await Tweet.findByIdAndUpdate(tweetId,{$pull: {likes: userId }});
            // unlike the tweet          
        } else {
            await Tweet.findByIdAndUpdate(tweetId, {$push: {likes: userId}});
        }// like the tweet
        
        // retrieve updated tweet after like status toggled 
        const updatedTweet = await Tweet.findById(tweetId);
        
        // return success
        return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet like successfully"));

    } catch (error) {
        if (error instanceof ApiError) {
            return res
            .status(error.statusCode)
            .json(new ApiResponse(error.statusCode, null , error.message))
            
        } else {
            console.error("Internal server error ", error)
            return res
            .status(500)
            .json(new ApiResponse(500, null, " Internal server error"))            
        }               
    }    
});

//getting  all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    try {
        // agrregate pipeline  
        const pipeline = [
            //match user by id 
            {$match: {_id: mongoose.Types.ObjectId(userId)}},
            // loookup for fields
            {
                $lookup: {
                    from: "videos",
                    localField: "likes",
                    foreignField: "_id",
                    as: "likedVideos"
                }
            },
            // projection of likedvideos
            {$project: { _id: 0, likedVideos: 1 } }
        ];
        
        // execute aggregate pipeline
        const result = await Like.aggregate(pipeline);
        
        //check if user exists and liked videos
        if (result.length === 0 || !result[0].likedVideos) {
            throw new ApiError(404, " Liked videos not found for the user");            
        }
        // extract all liked videos
        const likedVideos = result[0].likedVideos;

        //return success 
        return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));

    } catch (error) {
        // handles error 
        console.error("Error while getting liked liked videos", error);
            return res
            .status(500)
            .json(new ApiResponse(500, null, "Internal server error"));        
    }    
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}