import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who subscribe the channel
        ref: "User"
    },

    // documentation ke through hm kitne channels  match kiye h to hmutne counts krnege
    // hm kitne channels subscribes kiye h :
    // it's not mysql it's MONGODB
    

   channel: {
        type: Schema.Types.ObjectId, // one whom to  subscribe 
        ref: "User"
    }
}, {timestamps: true})



export const Subscription = mongoose.model("Subscription",subscriptionSchema);