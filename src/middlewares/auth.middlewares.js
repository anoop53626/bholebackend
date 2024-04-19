import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";

import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req, res, next) =>{ // is trh wale mai next bhi use krte h
   try {
              // Check if the token is provided in cookies or headers
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
    if(!token) {
 
     throw new ApiError (401, "Unautorized Request");
  }
 
  
        // Verify and decode the JWT token
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
    // Retrieve user based on decoded token's _id
  const user = await  User.findById(decodedToken?._id).select ("-password -refreshToken")// agr user nhi h
 
  if(!user) {
   //   discuss about frontend 
   


     throw new ApiError(401, "Unauthorized Request: User not found")
  }
 
  // Attach user object to the request for subsequent middleware or route handlers
  req.user = user;
  next();
   } catch (error) {
       // Handle JWT verification errors
       if (error instanceof jwt.JsonWebTokenError) {
         throw new ApiError(401, "Unauthorized Request: Invalid Access Token");
     }
     // Handle token expiration errors
     if (error instanceof jwt.TokenExpiredError) {
         throw new ApiError(401, "Unauthorized Request: Access Token expired");
     }

       // Handle other errors
    throw new ApiError(401, error?.message ||  "Invalid Access token" )
    
   }


});





       
     