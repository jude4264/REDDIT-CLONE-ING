import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";


export default async (req: Request , res: Response, next : NextFunction) => {

    try {

        // console.log("authMiddleware");
        

        const user : User | undefined =  res.locals.user
        // console.log("user",user);
    
        if(!user) throw new Error("unauthenticated")

        return next()
       
        
    } catch (error) {
        // console.log(error);
        return res.status(401).json({error : "unauthenticated"})
        
    }


    
}