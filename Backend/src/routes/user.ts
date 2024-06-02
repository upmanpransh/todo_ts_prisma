const zod=require('zod');
import { PrismaClient } from "@prisma/client";
const jwt=require("jsonwebtoken");
import { title } from "process";
const {JWT_SECRET}=require("../config");
const prisma = new PrismaClient();

const signupBody=zod.object({
    username:zod.string().email(),
    firstName:zod.string(),
    lastName:zod.string(),
    password:zod.string()
})

router.post("/signup",async(req:any,res:any)=>{
    const{success}=signupBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            message:"Email already taken/incorrect inputs"
        })
    }
    const existingUser=await prisma.user.findFirst({
        where:{username:req.body.username}
    })
    if(existingUser){
        return res.status(411).json({
            message:"Email already taken/Incorrect inputs"
        })
    }
    const user = await prisma.user.create({
        data:{
            username:req.body.username,
            password:req.body.password,
            firstName:req.body.firstName,
            lastName:req.body.lastName
        }
    })
    res.json({
        message:"User created Successfully"
    })
    const userID=user.id;
    const token=jwt.sign({userID},JWT_SECRET);
    localStorage.setItem('userToken',token);

})

const signinBody=zod.object({
    username:zod.string().email(),
    password:zod.string()
})
router.post("/signin",async(req:any,res:any)=>{
    const {success}=signinBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message:"Incorrect Inputs"
        })
    }
    const user=await prisma.user.findFirst({
        where:{username:req.body.username,
        password:req.body.password}
    });
    if(user){
        res.json({
            message:"successfully login"
        })
    }
        res.status(411).json({
            message:"Error while logging in"
        })
})

router.get("/data",async(req:any,res:any)=>{
    const value=localStorage.getItem('userToken');
    const userID=jwt.verify(value,JWT_SECRET);
    const todos=await prisma.todo.findMany({
        where:{
            OR:[
                {
                    done:false
                },
                {
                    user_id:{
                        equals:userID,
                    },
                },
            ]
        }
    })
    res.json({
        todo:todos.map(todo=>({
            title:todo.title,
            description:todo.description,
            done:todo.done
        }))
    })
})

module.exports=router