import { v2 as BHOLE} from "cloudinary";
import { fs } from "fs";
// file system : many function && unlink path is most important
  
          
          
cloudinary.config({ 
  cloud_name: 'process.env.CLOUDNARY_CLOUD_NAME', 
  api_key: 'process.env.CLOUDNINARY_API_KEY  ', 
  api_secret: ' process.env.CLOUDINAREY_API_SECRET' 
});

// thoda pechida h file system bhi database ki trh

const uploarOnCloudinary = async (localFilePath) => {
    try {
        if ( !localFilePath ) return null
         // upload the file on cloudinary
         cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
         })

//  file has been uploaded successfully
         console.log("file is uploaded on cloudinary ", response.url);
         return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove the locally save dfile as the upload operation got failed  
        return null;
    }
}

// we use this temporarily
// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });


export { uploadOnCloudinary };