import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// getting  comments on video
const getVideoComments = asyncHandler(async (req, res) => {
    // get all comments for a video
    // parse video id
    const {videoId} = req.params; 
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
        
    }
    // pagination for page and limit
    // const {page = 1, limit = 10} = req.query :we can write this code with optimized version
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // aggregate pipeline to retriecve data 
    try {
        const pipeline = [
            // Match comments for the given video ID
            {  $match: { video: mongoose.Types.ObjectId(videoId) } }, // filter documents
                    // convert videoId string into a mongoDb objectId
            // Sort comments by createdAt field in descending order
            {  $sort: {createdAt:-1} },
             // Skip comments for pagination
            {  $skip: (page - 1)*limit },
            // Limit the number of comments
              {$limit: limit },

            {
                $lookup: {
                    from: "users",  // Assuming the user collection is named "users"
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }     
            },
            { $unwind: "$user"},  // Unwind the user array created by the lookup 
            { $project: {"user.password": 0}} // Exclude password field from user object       
        ];

    // aggregation pipeline executes
        const comments = await Comment.aggregate( pipeline);
    // return success if comment are found
        return res
        .status(200)
        .json(
            new ApiResponse(200, comments, "Video comments retrieved successfully ")
        );

    } catch (error) {
         // Handle errors

        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        } else {
            console.error("Error while getting video comments:", error);
            return res
            .status(500)
            .json(new ApiResponse(500, null, "Error while getting video comments"));
        }
    }    
});


 // adding comment to a video
const addComment = asyncHandler(async (req, res) => {
    try {
        //extract necesssary data
        // find a videoId and  userID are valid 
       
        const {videoId, userId, content} = req.body;
        
        // check user id and video id are valid
        if (isValidObjectId(videoId) || isValidObjectId(userId)) {
            throw new ApiError(400,"Invalid video ID or USer ID")            
        }
        
       // create an new comment 
        const newComment = new Comment({
            video: videoId,
            user: userId,
            content: content
        });

        // save the comment in db
        await newComment.save();
        
        // retrun success
        return res
        .status(201)
        .json(new ApiResponse(201, newComment, "New comment added successfully"))

    } catch (error) {
        // Handle errors
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        } else {
            console.error("Error while adding video comments:", error);
            return res
            .status(500)
            .json(new ApiResponse(500, null, "Error while adding video comments"));
        }  
    }
});

// updating a comment
const updateComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const {content} = req.body;
        
        const comment = await Comment.findById(commentId);
        // comment not found case
        if(!comment){
            throw new ApiError(404, "Comments not found");
        }
        // update content
        comment.content = content;
        await comment.save();// wait until comment saved in db
        
        //  return success
        return res
        .status(200)
        .json(new ApiResponse(200, comment, "comment updated successfully"));

    } catch (error) {
        // Handle errors
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        } else {
            console.error("Error while updating video comments:", error);
            return res
            .status(500)
            .json(new ApiResponse(500, null, "Error while updating video comments"));
        }
    }
});

// deleting a comment
const deleteComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        
        const comment = await Comment.findById( commentId );
        //comment not found
        if(!comment) {
            throw new ApiError(404, "comments not found");
        }
        // delete comment
        comment.content = content;
        await comment.remove();
        // return success
        return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comments deleted successfully"));

    } catch (error) {
 // Handle errors
 console.error("Error while deleting video comment:", error);
 return res
 .status(500)
 .json(new ApiResponse(500, null, "Error while deleting video comment"));    }
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }