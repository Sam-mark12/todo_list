import {Router} from "express"
import { userModel } from "../schemas/user.js";
import passport from "passport";
import { todoModel } from "../schemas/todo.js";
export const auth = Router();


auth.post("/signup", async(req,res) => {
    if (!req.body.username) {
        console.log("Username not found in request body");
        res.sendStatus(400);
        return;
    }
    const { username, password } = req.body;
    const newUser = new userModel({ username });
    userModel.register(
      newUser,
      password,
      (err,acc)=>{
          if (err) {
              console.log(err);
              res.sendStatus(500)
          }else{
              passport.authenticate("local")(req,res,()=>{
                  res.redirect("/home")
              })
          }
      }
     );
});

  auth.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) { 
        res.status(400).send("Username and password are missing"); 
    } else {
        const currentUser = new userModel({
            username: username,
            password: password,
        });
        req.login(currentUser, (err) => {
            if (err) {
                res.send(err); 
            }else{
                passport.authenticate("local")(req,res,()=>{
                    res.redirect("/home");

                });
            }
        });
    }
});

auth.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { 
        console.log(err);
        return next(err); 
      }
      console.log('Logout successful');
      res.redirect('/login');
    });
});






 







auth.delete("/:id",async(req,res)=>{
    const id = req.params.id;
    const deleteElement = await studentModel.deleteOne({_id: id});
    try{
        if(deleteElement.deletedCount > 0){
            res.status(200).json(await studentModel.find({}));
        }
        else{
            res.status(404).send("ELEMENT NOT FOUND");
        }
    }catch(error){
        res.status(500).send("INTERNAL SERVER ERROR");
    }
})