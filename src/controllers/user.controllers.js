import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";

// when we use this new refresh and access token are generated
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken(); // These are methods
        const refreshToken = user.generateRefreshToken(); // Methods
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }; // These methods are in the user model
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
};

// miidlewares to handle user registration
const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    // Validation - not empty
    // Check if user already exists: note from username and email
    // Check for images, check for avatar
    // Upload them to Cloudinary, avatar
    // Create user object - create entry in db 
    // Remove password and refresh token field from response
    // Check for user creation 
    // Return response

    const { fullname, username, email, password } = req.body;

    if (![fullname, email, username, password].some((field) => !!field.trim())) {
        throw new ApiError(400, "All fields are required"); // For validation
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Check if avatar is provided
    const avatarLocalPath = req.files?.avatar[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // Create user object and save it to the database
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        password,
        username: username.toLowerCase()
    });

    // Check if user creation was successful
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Return response
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// Middleware to handle user login 
const loginUser = asyncHandler(async (req, res) => {
    // Validate request body fields
    const { username, email, password } = req.body;

    if (!(username && email)) {
        throw new ApiError(400, "Username or email is required");
    }

    // Find user by username or email
    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    // Check if password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Middleware to handle user login
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = { httpOnly: true, secure: true }; // Only modify from server if both http and secure are true 

    // Return success response with cookies set
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

// Middleware to handle user logout
const logoutUser = asyncHandler(async (req, res) => {
    // Logout logic
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// checking refresh and access token
const refreshAccessToken = asyncHandler (async(req, res) =>{
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

     if(!incomingRefreshToken) {
          throw new ApiError(401, "Unauthorized request")
     }

   try {
       const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
       )
  
       const user = await User.findById(decodedToken?._id)
  
       if(!user) {
            throw new ApiError(401,"Invalid refresh token")
       }
  
       if (incomingRefreshToken !== user?.refershToken) {
            throw new ApiError(401,"Refersh tokrn is expired or used")
  
       }
  
       const options = {
            httpOnly: true,
            secure: true
       }
  
      const {accessToken, newRefreshToken} = await  generateAccessAndRefershTokens(user._id)
  
      return res
      .status(200)
      .cokkie("accessToken",accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
       new ApiResponse(
            200,
            {
                 accessToken, refrershToken: newrefreshToken
            }, "Access token refreshed"
       )
      )
   } catch (error) {
     throw new ApiError(401, error?.message ||
     "Invalid refresh token")
     
   }


});

// check old password and new password if changes
const changeCurrentPassword = asyncHandler (async(req, res) =>{
    const {oldPassword, newPassword} = req.body;//ek field aur add krte h confirmNewPassword ka agr aap cautious ho

    const user = await User.findById (req.user?._id)

   const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

   if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
   }

   user.password = newPassword;
   await user.save({validateBeforeSave: false}); // Saves the user object to the database without performing validation before saving

   return res
   .status(200)
   .json(
    new ApiResponse(200, {}, "Password changed successfully")
)
});

//get current user details:read operations h and discuss about middlewares
const getCurrentUser = asyncHandler(async(req, res) =>{
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current User Fetched Successfully")
    )
});

//update user account details
const updateAccountDetails = asyncHandler(async(req, res) =>{
    const { fullname, email,} = req.body;

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname, //fullname: fullname bhi likh ste h
                email,
            }
        },
        {new: true}
    ).select("-password ")

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Account datils updated successfully")
    )
});

// update user avatar
const updateUserAvatar = asyncHandler(async(req, res) =>{
    const avatarLocalPath  = req.file?.path//multer middlewares ke through mila h 

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }
    //  todo delete old image avatar: agr aap krna chahte ho tb ek utils add krke kr lo
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError (400,"Error while uploading  on avatar")
    }
     const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200, "Cover Image updated successfully")
    )
});

// update user coverimage
const updateUserCoverImage = asyncHandler(async(req, res) =>{
    const coverImageLocalPath  = req.file?.path//multer middlewares ke through mila h 

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError (400,"Error while uploading  on avatar")
    }
     const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
               coverImage: coverImage.url
            }
        },
        { new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Cover image updated successfully")
    )

});

// channel and subcriptions details abou users and user:
//  isse hm params mai  se le rhe h
// we write this using aggregate pipeline
const getUserChannelProfile = asyncHandler(async(req, rs) =>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing");
    }


    // User.find({username})
   const channel =  await User.aggregate([
    { // match users
        $match: {
            username: username?.toLowerCase()
        }
    },
    { //how many subscribers user have
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"   
        } // ye hmko mil gya ki kitne subscribers hme subscribe kiye hue h
    },
    { // how many user subscribed
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo" // hmne kitne channels subscribe kiye h 
        }
    },
    { //some fields added 
        $addFields: {
            subscribersCount: {
                $size: "$subscribers"
            },
            channelsSubscribedToCount: {
                $size: "$subscribedTo"                
            },
            isSubscribed :{
                $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]},   
                    // user present h ya nhi h isse hme ye pta chlta h 
                    then: true,
                    else: false
                }
            }
        }
    },
    { // add projects and provide selected fields
        $projects:{
            fullname: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1 
        }
    }
   ])

       //channel not found 
if(!channel?.length) {
    throw new ApiError(404, "channels does not exits")
}

return res
.status(200)
.json(
    new ApiResponse(200, channel[0], "User channel fetched successfully")
)
}); // make sure to do console.log channel

// watch history
const getWatchHistory = asyncHandler(async(req,res) =>{
const user = await User.aggregate(
    [
        {
            $match: {        
                _id: new mongoose.Types.OjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    { // ab hm videos ke andar h
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [ // subpipeline h ye
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1 
                                    }
                                }
                            ]
                        }
                    },
                    { // ek aur pipeline de dete h apko
                        $addFields:{
                            owner: {
                                $first: "$owner" //isse usko sidhe owner object mil jata h jisse unko asani hogi
                            }
                        }
                    }                    
                ]
            } // hme further ek subpipeline lgni pdegi wrna hme owner ka kuch nhi milega        
        }
    ]
)

return res
.status(200)
.json(
    new ApiResponse(
        200,
        user[0].watchHistory,
        " Watch history fetched successfullly "
    )
)
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};
