import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.models.js";

import {uploadOnCloudinary} from "../utils/cloudinary.js";

import {ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async( req, res) => {
     // get user details from frontend
     // validation -not empty
     // check if user already exits:note from username and email
     // check for images,check for avatar
     // upload them to cloudinary, avatar
     // create user object - create entry in db 
     // remove password and efresh token field from response
     // check for user creation 
     // return response
 
     const { fullname, username, email, password } = req.body
     console.log("email: ", email);

if(
     [fullname, email, username, password].some((field) =>
field?.trim() ==="")
){
     throw new ApiError(400, "All fields are required ") // for validation

}

  const existedUser  =  User.findOne({
         $or:[{ username }, { email }]
     }) // agr user h to error bej do

     if (existedUser) {
          throw new ApiError(409, "User with email or username already exists")
     } // if username or email exists: console log krke dekho upr wala bhi


    const avatarLocalPath = req.files?.avatar[0]?.path;
      const coverImageLocalPath = req.files?.coverImage[0]?.path;

     if (!avatarLocalPath) {
          throw new ApiEroor(400, "Avatar file is required" ) // check for images,check for avatar
     }

      const avatar = await uploadOnCloudinary (avatarLocalPath)
      const coverImage = await uploadOnCloudinary (coverImageLocalPath)  
      
      if(!avatar){
          throw new ApiEroor(400, "Avatar file is required" )

      }

     const user = await User.create({
          fullname,
          avatar: avatar.url,
          coverImage: coverImage?.url || "" , 
          email,
          password,
          username: username.toLowerCase()
      }) // user created and entry in db

       const createdUser= await User.findById(user._id).select(
          "-password -refreshToken"
       ) //user created or not  and do field nhi naayegi : '-'  lga do wo field nhi ayegi

       if (!createdUser) {
          throw new ApiEroor(500, "Something went wrong while registering the user" )
       }

// postman yhi expect krta h ki response alg jgh hi bho
       return res.status(201).json(
          new ApiResponse(200, createdUser, "User registered successfully")
       ) // return response
      


/*     if (fullname === ""){
          throw new ApiError(400, "fullname is required")
     } // if u r beginner then you check ifels statement 
     // line by line but if u r professional then use


     return  res.status(200).json({
        message: "bholebackend"
    }) */
} )


export {
     registerUser,
     };
// in sb ko hm import krte h : app.js