// express ke through


import express from "express";

import cookieParser from "cookie-parser";

import cors from "cors";


const app = express()

app.use(cors({
    // use :  used in middlewares
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
// pehle express nhi le pta tha tb wo body parser ka use krta tha

app.use(express.urlencoded({extended: true, limit:"16kb"}))

app.use(express.static("public"))
// public folder jo bnya h isliye ye name aap kuch bhi rkh skte h

app.use(cookieParser())



// routes

import userRouter  from "./routes/user.routes.js";


// routes declaration
// app.get  tb tk tha jb tk ruotes nhi tha lekin ab app.use  use krte h
app.use("/api/v1/users", userRouter) // standard pracrtice

//   https://localhost:8000/api/v1/users/register

export { app }; // This exports the app object, which is the instance of your Express application.
