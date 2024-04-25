
import mongoose, { isValidObjectId } from "mongoose";
import {Tweet} from "../models/tweet.model.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

// creating tweet 
const createTweet = asyncHandler(async (req, res) => {
    const {content } = req.body;
    const {userId}= req.user._id;
    // check authentication
    if (!userId) {
        return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));        
    }

    try {
        // tweet of content is not empty
        if (!content || content.trim() === '' ) {
            throw new ApiError(400, "Tweeet content cannot be empty");            
        }   
        // create a new tweet record in db 
        const newTweet = new Tweet({
            content,
            userId
        });
        // save new tweet 
        await newTweet.save();
        
        // return success
        return res
        .status(201)
        .json (new ApiResponse(201, newTweet, "Tweet created successfully"));
    } catch (error) {
        console.error("Error while creating tweet:", error)
        if (error instanceof ApiError) {
            return res
            .status(error.statusCode)
            .json(new ApiResponse(error.statusCode, null, error.message))            
        } else {
            return res
            .status(500)
            .json(new ApiResponse(500, null, "Internal server error"));
            
        }        
    }  
});

// getting user tweet
const getUserTweets = asyncHandler(async (req, res) => {
    // query tweets associated with the userid 
    const userId = req.user._id;
    try {
        // query tweets associated with user id
        const userTweets = await Tweet.find({ userId }) ;
        // return success 
        return res
        .status(200)
        .json(new ApiResponse(200, userTweets, " User tweets retrieved successfully "));

    } catch (error) {
        // handles errors 
        console.error("Error fetching user tweets:", error);
        throw new ApiError(500, error?.message || "Internal server error");        
    }
});

 //  update tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

   try {
    // find the tweet by its ID
    const tweet = await Tweet.findById(tweetId);

        // check if tweet exists
        if (!tweet){
            throw new ApiError(404, "Tweet not found");
        }
        // check if the authenticated user is the owner of the tweet 
        if (tweet.userId !== req.user._id){
            throw new ApiError(403, " You arr not authorized to update this tweet");
        }
        // // update the twwet content
        if (content){
            tweet.content = content;
        }        
        await tweet.save(); // save the tweet

        // retrun success 
        return res
        .status(200)
        .json(new ApiResponse(200,  userTweet, "Tweet updated succcessfully" ));
    
   } catch (error) {
    // handles error
    console.error("Error updating tweet:", error);
    if (error instanceof ApiError) {
        return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null ,error.message));
    } else {
        return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal server error"));        
    }    
   } 
 });

 // deleting tweet 
const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    
    try {
        const tweet = await Tweet.findById(tweetId);
        // check if tweeet exists
        if (!tweet) {
            throw new ApiError(404, "Tweet not found ");            
        }        
        // check if the authenticated user is owner
        if (tweet.userId !== req.user._id) {
            throw new ApiError(403, "you are not authorized to delete this tweet ");            
        }
        // delete the tweet 
        await tweet.remove();
        // return success
        return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
    } catch (error) {
        // handle error
        console.error("Error deleting tweet:", error);
        if (error instanceof ApiError) {
            return res
            .status(error.statusCode)
            .json(new ApiResponse(error.statusCode, null, error.message ));
            
        } else {
            return res
            .status(500)
            .json(new ApiResponse(500, null, "Internal server error"))            
        }        
    }
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
