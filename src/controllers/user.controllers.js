import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt from "jsonwebtoken";

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


})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,

};
