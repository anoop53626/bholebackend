

import dotenv from "dotenv";

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";



import  connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path: './.env'
})




connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, () => {
         console.log(`Server is running at port : ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log("Mongodb connection FAILED !!! ",err );
})



/*
import exprees from "express";
const app = express()

// function connectDB(){}
;(async() => {
try {
    await  mongoose.connect(`${process.env.MONGODB_RI}`)
    app.on("error", (error) => {
// listner
        console.log("ERROR: ", error);
        throw error
   })

   app.listen(process.env.PORT, () => {
       console.log(`App is listnenig on port $
       {process.env.PORT }`);
   })



    } catch(error){
    console.error('ERROR', error)
    throw err
}

})()
//  effi hmse semilkolon se start hota h 

*/