import mongoose from "mongoose";
import { userModel } from "./user.js";

    const todoSchema = new mongoose.Schema({
        todos: {
          type: String,
          required: true,
        },
      });
export const todoModel = mongoose.model("todo",todoSchema);


