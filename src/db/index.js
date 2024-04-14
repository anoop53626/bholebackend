import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// DB is in another continent

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST:$
        {connectionInstance}`)
        // is connectioinstance ko console log krke dekho ek brr
    
    } catch (error) {
        console.log("MONGODB connection Failed ", error);
        process.exit(1);
        // nodejs ke andar h aur ye refernce h
    
    }
}

export default connectDB;