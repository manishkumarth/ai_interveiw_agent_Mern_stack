import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getCurrentUser } from "../controllers/user.controller.js"


const userRouter = express.Router()

userRouter.get("/current-user",isAuth,getCurrentUser)
userRouter.get("/",async(req,res)=>{
    res.send({
        message:"api working fine"
    })
})

export default userRouter