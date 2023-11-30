import express from "express";
import passport from "./outh/auth.js";
import session from "express-session";
import mongoose from "mongoose";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
import {userModel} from './schemas/user.js';
import { todoModel } from "./schemas/todo.js";
import { auth } from "./routes/rout.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const app = express();
app.use("/dist",express.static("dist"));

mongoose.connect(process.env.DB_URI)
.then(()=>{
    console.log("Connected to database");
})
.catch((Err)=>{console.log("failed to connext",Err)});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
// app.use(json());
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
        client:mongoose.connection.getClient(),
        collectionName:"sessions",
        stringify:true
      })
}));
app.use(passport.initialize());
app.use(passport.session())
passport.use(userModel.createStrategy());
passport.serializeUser((userModel,done)=>{
    done(null,userModel.id)
});

passport.deserializeUser((id,done)=>{
    user.findById(id,(err,userModel)=>{
        done(err,userModel)
    });
});

app.use(auth)

app.get("/",(req,res)=>{
    if(req.isAuthenticated()){
        res.redirect("/home");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/home",(req,res)=>{
    if(req.isAuthenticated()){
        res.sendFile('home.html', { root: __dirname });
    }
    else{
        res.redirect("/login");
    }
});
app.get("/signup",(req,res)=>{
    res.sendFile('signup.html', { root: __dirname });
    
});
app.get("/login",(req,res)=>{
    res.sendFile('main.html', { root: __dirname });
})

app.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));

app.get("/auth/google/callback", passport.authenticate("google",{failureRedirect: "/auth/failure"}),(req,res)=>{
    res.redirect("/home");

});


app.get("/auth/failure",(req,res)=>{
    console.log("There is something wrong");
})

// todolist

app.post("/add/todo", async (req, res) => {
    const {todos} = req.body;
    const newTodo = new todoModel({todos})
     newTodo.save()
    .then(()=>{
      console.log("Todo saved");
      res.redirect("/");
    })
    .catch((err)=>{
      console.log("failed to save",err);
    })
  });

    app.get("/show",async(req,res)=>{
    const allTodo = await todoModel.find({});
        res.json(allTodo);
    })
    app.put("/edit/:id", async (req, res) => {
        const { todos } = req.body;
        const { id } = req.params;
        const updatedTodo = await todoModel.findByIdAndUpdate(id, { todos }, { new: true });
    
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
    
        res.json(updatedTodo);
    });
    

    app.delete("/delete/:id",async(req,res)=>{
        const id = req.params.id;
        const deleteElement = await todoModel.deleteOne({_id: id});
        try{
            if(deleteElement.deletedCount > 0){
                res.status(200).json(await todoModel.find({}));
            }
            else{
                res.status(404).send("ELEMENT NOT FOUND");
            }
        }catch(error){
            res.status(500).send("INTERNAL SERVER ERROR");
        }
    });


app.listen(3000,()=>{
    console.log("Server is running successfully");
});