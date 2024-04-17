import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

import jwt from "jsonwebtoken";

import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req, res, next) =>{ // is trh wale mai next bhi use krte h
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
    if(!token) {
 
     throw new ApiError (401, "Unautorized Request");
  }
 
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
  const user = await  User.findById(decodedToken?._id).select ("-password -refreshToken")// agr user nhi h
 
  if(!user) {
     //  next time:  discuss about frontend 
     throw new ApiError(401, "Invalid Access TOken")
  }
 
  req.user = user;
  next()
   } catch (error) {
    throw new ApiError(401, error?.message || " Invalid Access token" )
    
   }


})

