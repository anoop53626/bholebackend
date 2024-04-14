import multer from "multer";
// we use diskstorage but not memorystorage

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },

    // cb: callback
    filename: function (req, file, cb) {
    //    bad mai rkh lenge  :const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

      cb(null, file.originalname)
    }
  })
  
   export const upload = multer({
     storage,
     })
