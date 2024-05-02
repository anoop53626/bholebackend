import mongoose  from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// creating playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;
    try {
        // create a platlist 
        const playlist = new Playlist({ name, description });
        // save this playlist
            await playlist.save();
            
            // return success
            return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist created successfully"));
    } catch (error) {
        //handle errors 
        console.error("Error creating  playlist:", error);
        return res
        .status(500)
        .json(new ApiResponse( 500, null, `Failed to create playlist: ${error.message}` ));        
    }
});

// getting user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    
    // checking user credentials
    if (!isValidUserId(userId)) {
       return res
       .status(404)
       .json(new ApiResponse(404, null, "Invalid user ID "))
    }      
    try {
        // query the database to get user playlists 
        const playlist = await Playlist.find({userId});

        //return success
        return res
        .status(200)
        .json(new ApiResponse(200, playlist, " User playlists found successfully"))
        
    } catch (error) {
        // handles error
        console.error("Error fetching playlist:", error);
        return res
        .status(500)
        .json(new ApiResponse(500, null, `Failed to fetch user playlists ${error.message}`))
    }
});

// getting playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    // check if playlist id is valid
    if (!isValidPlaylistId(playlistId)) {
        return res
        .status(404)
        .json(new ApiResponse(404, null, "Invalid playlist Id"))
    }      
    try {
        // query for playlist find by id
        const playlist = await Playlist.findById(playlistId);
        // check if playlist
        if (!playlist) {
            return res
            .status(404)
            .json(new ApiResponse(404, playlist, "Playlist not found"))          
        } 
        // return successs
        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Getting user playlist by its ID"))
        
    } catch (error) {
        // handle error 
        console.error("Error fetching playlist by ID:", error);
        return res
        .status(500)
        .json(new ApiResponse(500, null, `Failed to fetch playlists: ${error.message}`));        
    }
});

// adding video to the playlist 
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    try {
        // check  video id and playlist id 
        if (!isValidPlaylistId(playlistId) || (!isValidVideoId(videoId))) {
            return res
            .status(400)
            .json(new ApiResponse(400, null, "Invalid playlist ID or video ID "));            
        }   


        //retrieve playlist from database
        const playlist = await Playlist.findById(playlistId);
        // check playlist 
        if (!playlist) {
            return res
            .status(404)
            .json(new ApiResponse(404, "Playlist not found"))            
        }
        // update playlist  by adding video id
        playlist.video.push(videoId);
        // save the playlist 
        await playlist.save();

        // return success
        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist successfully"))
        
    } catch (error) {
        // handle error
        console.error("Error adding video to playlist:");
        return res
        .status(500)
        .json(new ApiResponse(500, null, `Failed to add video to playlists: ${error.message}`));        
    }
});

// removing video from playlists
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    try {
        // check if playlist and video id is valid
        if (!isValidPlaylistId(playlistId) || (!isValidVideoId(videoId))) {
            return res
            .status(404) 
            .json(new ApiResponse(404, "Invalid Playlist ID or video ID"))            
        }
        // retrieve playlist
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            return res
            .status(404)
            .json(new ApiResponse(404, "Playlist not found"))
        }
        playlist.video.pull(videoId);
        await playlist.save();// after removing we have to save the remaining playlist 

        // respond success
        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Removing video from playlist suceesfully"))
        
    } catch (error) {
        // handle error
        console.error("Errror while deleting video from playlist:", error);
        return res
        .status(500)
        .json(new ApiResponse(500, null, `Failed to remove video from playlist: ${error.message}`));        
    }
});

// deleting playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    try {
        // checks if playlist and video id is valid 
        if (!isValidPlaylistId(playlistId)) {
            return res
            .status(404)
            .json(new ApiResponse(404, "Invalid playlist ID "))            

        }
        const playlist  = await Playlist.findByIdAndDelete(playlistId);
        if(!playlist ){
            return res 
            .status (404)
            .json(new ApiResponse(404, "playlst not found "))
        }
    
        // return success 
        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist deleted successfully"));


    } catch (error) {
        // handles error 
        console.error("Error while deleting the playlist :", error);
        return res
        .status(500)
        .json(new ApiResponse(500,  null , `Failed to delete the playlist: ${error.message}`))
    }
    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;
    try {
        // checks if playlist  is valid
        if (!isValidPlaylistId(playlistId)) {
            return res
            .status(404)
            .json(new ApiResponse(404, "Invalid playlist ID"))
        } 
        const playlist = await Playlist.findByIdAndUpdate(playlistId, {name, description} ,{new: true});
        if(!playlist){
            return res
            .status(404)
            .json(new ApiResponse(404, "Playlist not found"))
        }
        /// update playlist name and description and then save 
        playlist.name = name,
        playlist.description = description;

        await playlist.save();

        // return success 
        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist updated successfully"))

    } catch (error) {
        console.error("Erroe while updating the playlist:", error)
        return res
        .status(500)
        .json(new ApiResponse(500, null, `Failed to update the playlist `))
    }
    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}