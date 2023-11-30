import mongoose from "mongoose";
import p from "passport-local-mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required : true,
    }
});
userSchema.plugin(p);

export const userModel = mongoose.model("user",userSchema);
