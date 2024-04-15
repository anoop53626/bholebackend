import { asyncHandler } from "../utils/asyncHandler.js";



const registerUser = asyncHandler( async( req, res) => {
   return  res.status(400).json({
        message: "bholebackend"
    })
} )


export {
     registerUser,
     };
// in sb kon hm import krte h : app.js