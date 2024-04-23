
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { getJsPageSizeInKb } from "next/dist/build/utils.js"
import { pages } from "next/dist/build/templates/app-page.js"


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
        throw new ApiError(500, error?.message || "Internal server error")
        
    }

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}