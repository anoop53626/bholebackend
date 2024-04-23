import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// getting  comments on video
const getVideoComments = asyncHandler(async (req, res) => {
    // get all comments for a video
    // parse video id
    const {videoId} = req.params; 
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
        // handle errors
        throw new ApiError(500, error?.message || "Error while getting video comments");
    }     
   
   
});


 // adding comment to a video
const addComment = asyncHandler(async (req, res) => {
    try {
        // find a video and create an new comment 
        const {videoId, userId, content} = req.body;

        const newComment = new Comment({
            video: videoId,
            user: userId,
            content: content
        });
        // save the comment in db
        await newComment.save();
        // retrun success
        return res
        .status(200)
        .json(new ApiResponse(200, newComment, "New comment added successfully"))

    } catch (error) {
        throw new ApiError(500, error?.message || "Error while adding video comments");   
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
        throw new ApiError(500, error?.message || "Error while updating video comments");   
        
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
        throw new ApiError(500, error?.message || "Error while deleting video comments");           
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }