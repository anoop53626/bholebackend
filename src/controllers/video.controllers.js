
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { getJsPageSizeInKb } from "next/dist/build/utils.js"
import { pages } from "next/dist/build/templates/app-page.js"

// getting all videos 
const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // parsing  query 
     const pageNumber   = parseInt(page);
    const pageSize = parseInt(limit); 

    //create filter object 
    const filter = {};//empty filter object to be used for querying videos
    if (userId){
        filter.userId  =userId;
    }
    if (query){
        filter.$or = [// when query is provided $or condition to be search for videos based on title and dexcription
            {title: { $regex: query, $options: 'i'}},
            { description: { $regex: query, $options: 'i'}}
        ];
    }
    // build sort object based on sortBy and sortType
    const sort = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType === 'asc'? 1: -1;
        
    }
    try {
        // query video with pagination ,sort, and filter 
        const videos = await Video.find(filter)
        .sort(sort)
        .skip((pageNumber -1 )*pageSize)
        .limit(pageSize) // pagination is achieve dusing skip and limit 
        
        //counting  total videos{without pagination}
        const totalVideos = await Video.countDocuments(filter);

        ///return success 
        return res
        .status(200)
        .json(
            new ApiResponse(200, 
                {
                    data: videos,                        
                    pagination: {                        
                        totalPages: Math.ceil(totalVideos / pageSize),
                        totalItems: totalVideos,
                        itemsPerPage: pageSize
            },
            message: "Videos fetched successfully"
        }));
        
        
     
    } catch (error) {
        throw new ApiError(404, error?.message || "videos are not available ")
        
    }

})

// getting video, upload to cloudinary, creating video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    const {video} = req.files;
try {
    // checking video files exist 
    if(!video){
        throw new ApiError(400,"Video file required");
    }
    //upload video on cloudinary 
    const cloudinaryRseponse = await uploadOnCloudinary(video);
// creating video record in database
    const newVideo  = new Video({
        title,
        description,
        videoUrl: cloudinaryRseponse.secure_url
    });
    await newVideo.save();

    // return Success
    return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"))
    
} catch (error) {
    throw new ApiError(404, error?.message || "Videos publisher  not found ")
}
});

// getting video by id 
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        //query db to find  video by its id 
        const video = await Video.findById(videoId);
        if (!video){
            throw new ApiError(404,"video not found")
        }
        // return success
        return res
        .status(200) // 200: success
        .json(new ApiResponse(200, video, "Video retrived successfully"));

    } catch (error) {
        throw new ApiError(404, "Vodeos are not available " )// 404: not found
        
    }
  
})

 //update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const {title, description, thumbnail } = req.body;

    try {
        let video = await video.findById(videoId);

        if (!video) {
            throw new ApiError(404, null, "video not found")            
        }
        //update video details 
        video.title = title || video.title;
        video.description = description || video.description;
        video.thumbnail = thumbnail || video.thumbnail;

        await video.save();
        // return success
        return res
        .status(200)
        .json(new ApiResponse(200, video, "video updated successfully")) 

       
    } catch (error) {
        throw new ApiError(404, "updating video dateils failed")
        
    } 
});

// deleting video 
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    try {
        let video = await video.findById(videoId);

        if (!video) {
            throw new ApiError(404, null, "video not found")            
        }
        
        await video.remove();
        // return success
        return res
        .status(200)
        .json(new ApiResponse(200, video, "video deleted successfully")) 

       
    } catch (error) {
        console.error('Error deleting video:', error);
        throw new ApiError(500, "Internal server error ")        
    } 
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    try {
        const video = await Video.findById(videoId);
        
        if (!video) {
            throw new ApiError(404, null, "Video not found");            
        }
        // toggle publish  video i.e if publish make them not publishe d and vice versa.
        video.published = !video.published;
        await video.save();
        
        // return success
        return res
        .status(200)
        .json(new ApiResponse(200, video, `Video publish  toggled successfully. New status: ${video.published}`))
    } catch (error) {
        console.error('Error toggling publish status:', error);
        throw new ApiError(500, null, "Internal server error");        
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}