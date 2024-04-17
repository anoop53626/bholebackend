import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";

import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req, _, next) =>{ // is trh wale mai next bhi use krte h
   try {
              // Check if the token is provided in cookies or headers
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
    if(!token) {
 
     throw new ApiError (401, "Unautorized Request");
  }
 
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
  const user = await  User.findById(decodedToken?._id).select ("-password -refreshToken")// agr user nhi h
 
  if(!user) {
   //   discuss about frontend 
   


     throw new ApiError(401, "Invalid Access TOken")
  }
 
  req.user = user;
  next()
   } catch (error) {
    throw new ApiError(401, error?.message || " Invalid Access token" )
    
   }


})

