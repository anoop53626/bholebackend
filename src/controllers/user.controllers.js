import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.models.js";

import {uploadOnCloudinary} from "../utils/cloudinary.js";

import {ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => {
     try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()  //these are methods
        const refreshToken = user.generateRefreshToken()  //methods h 
        
        user.refreshToken = refreshToken
        await user.save( { validateBeforeSave: false } )

        return {accessToken, refreshToken}//ye methods mai hua h
           
     } catch (error) {
          throw new ApiError(500, "Something went wrong while genrating acess and refresh token");
          
     }
}

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
 
     const { fullname, username, email, password } = req.body;
     // console.log("email: ", email);

if(
     [fullname, email, username, password].some((field) =>
!field?.trim() ==="")
){
     throw new ApiError(400, "All fields are required "); // for validation

}

  // Check if user already exists
  const existingUser  = await User.findOne({
         $or:[{ username }, { email }]
     }); // agr user h to error bej do
     if (existingUser) {
          throw new ApiError(409, "User with email or username already exists")
     }
     
     
     // console.log(req.files);

//  check if avatar and coverimage are provided
const avatarLocalPath = req.files?.avatar[0].path;    

//     const coverImageLocalPath = req.files?.coverImage[0]?.path;

if (!avatarLocalPath) {
     throw new ApiError(400, "Avatar file is required" ); // check for images,check for avatar
}



let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
     coverImageLocalPath = req.files.coverImage[0].path;
    
}


 // Upload avatar and cover image to Cloudinary
 const avatar = await uploadOnCloudinary(avatarLocalPath); 
 if (!avatar) {
     throw new ApiError(400, "Avatar upload failed");
 }
    
   const coverImage = await uploadOnCloudinary (coverImageLocalPath) ;  
      

      // Create user object and save it to the database
     const user = await User.create({
          fullname,
          avatar: avatar.url,
          coverImage: coverImage?.url || "" , 
          email,
          password,
          username: username.toLowerCase()
      }); 


   // Check if user creation was successful
       const createdUser= await User.findById(user._id).select(
          "-password -refreshToken"
       ); //do field nhi naayegi : '-'  lga do wo field nhi ayegi

       if (!createdUser) {
          throw new ApiError(500, "Something went wrong while registering the user" );
       }

// postman yhi expect krta h ki response alg jgh hi ho
       return res.status(201).json(
          new ApiResponse(200, createdUser, "User registered successfully")
       ); // return response
      


/*     if (fullname === ""){
          throw new ApiError(400, "fullname is required")
     } // if u r beginner then you check ifels statement 
     // line by line but if u r professional then use


     return  res.status(200).json({
        message: "bholebackend"
    }) */
} );

// Function to log in a user
const loginUser = asyncHandler(async (req, res) =>{
     // req bode se data
     // username or email
     // find the user
     // password check
     // accessa and refresh token
     // send secure cookies




  // Validate request body fields
     const {username, email, password } = req.body;
     if(!username || !email) {
          throw new ApiError(400, "Username or email is required");
     }

       // Find user by username or email
      const user = await User.findOne({
          $or: [{username}, {email}]
      })

      if(!user) {
          throw new ApiError(400, "user does not exist");
      }

        // Check if password is correct
     const isPasswordValid = await user.isPasswordCorrect(password) //not used User bcz its in mongodb but user is in our db instance

     if(!isPasswordValid) {
          throw new ApiError(401, "Invalid user credentials");
     }

     const {acessToken, refreshToken} =  await generateAccessAndRefreshTokens(user._id)

     const  loggedInUser = await User.findById(user._id).select("-password -refreshToken")
     
     const options = {
          httpOnly: true,
          seccure: true // only modify from server if both http and secure are true 
     }

     return res.status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
          new ApiResponse(
               200,
               {
                    user: loggedInUser, accessToken, refreshToken // ho skta h user khud store kr rha ho 
               }, //data h ye 
               "User logged in Successfully"
          )
     )
});


// logout session:using middlewares
const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(req.user._id{
     $set: {
          refreshToken: undefined //yha hm aur field pass kr skte h
     }

    },
{
     new: true

}
)

const options = {
     httpOnly: true,
     seccure: true 
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User Logged Out")) 

});

export {
     registerUser,
     loginUser,
     logoutUser
     };
// in sb ko hm import krte h : app.js