import {Request, Response, Router} from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import userMiddleware from "../middlewares/user"
import authMiddleware from "../middlewares/auth"
import { isEmpty } from 'class-validator';
import { AppDataSource } from '../data-source';
import Sub from '../entities/Sub';
import Post from '../entities/Post';
import { NextFunction } from 'express-serve-static-core';
import multer, { FileFilterCallback } from 'multer';
import { makeId } from '../utils/helpers';
import path from 'path';
import { unlinkSync } from 'fs';


const createSub = async (req: Request, res: Response, next) => {

    const { name, title, description } = req.body

    try {

        let error: any = {}

        if (isEmpty(name)) error.name = "이름은 비워둘 수 없습니다."
        if (isEmpty(title)) error.name = "제목은 비워둘 수 없습니다."

        const sub = await AppDataSource
            .getRepository(Sub)
            .createQueryBuilder("sub")
            .where("lower(sub.name) = :name", { name: name.toLowerCase() })
            .getOne();

        if (sub) error.name = "서브가 이미 존재합니다."

        if (Object.keys(error).length > 0) {
            // console.log("subs.ts" , error);
            return res.status(400).json(error);
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error : "서버에서 문제 발생."})
        
    }

    try {
        const user : User = res.locals.user
        const sub = new Sub()
        sub.name =  name
        sub.title = title;
        sub.description = description;
        sub.user = user;

        await sub.save()
        return res.json(sub);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error : "서버 문제 발생."})
    }

}

const topSubs = async (req: Request, res: Response)  => {

    try {
        const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/'||s."imageUrn", 
        'https://www.gravatar.com/avatar?d=mp&f=y')`;
        const subs = await AppDataSource.createQueryBuilder()
        .select(
            `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
        )
        .from(Sub, "s")
        .leftJoin(Post, "p", `s.name = p.subName`)
        .groupBy('s.title, s.name, "imageUrl"')
        .orderBy(`"postCount"`, "DESC")
        .limit(5)
        .execute()

        return res.json(subs)
    } catch (error) {

        console.log(error);
        return res.status(500).json({error: "문제가 발생했습니다."})
        
        
    }

}

const getSub = async (req: Request, res: Response) =>{

    const name = req.params.name;
    console.log("name",name);
    

    try {
        const sub = await Sub.findOneByOrFail({ name });

        console.log(sub);

        //포스트를 생성한 후에 해당 sub에 속한 포스트들 불러오기 
        const post =  await Post.find({
            where : {subName : sub.name},
            order : {createdAt : "DESC"},
            relations :  ["comments" , "votes"]

        })

        sub.posts = post;

        if(res.locals.user){
            sub.posts.forEach((p)=>{
                p.setUserVote(res.locals.user)
            })
        }

        console.log("sub" , sub);
        
        

        return res.json(sub);
    } catch (error) {
        return res.status(404).json({error: "서브를 찾을 수 없음."})
    }

}

const ownSub =async (req:Request, res: Response, next : NextFunction) => {

    const user : User =  res.locals.user
    
    try {
        
        const sub = await Sub.findOneOrFail({where : {name: req.params.name}});

        if(sub.username !== user.username){
            return res.status(403).json({ error : "이 커뮤니티를 소유하고 있지 않습니다."})
        }

        res.locals.sub = sub

        return next()
        
    } catch (error) {

        console.log(error);
        return res.status(500).json({ error : "문제가 발생했습니다."})
        
    }
    
}

const upload = multer({
    storage: multer.diskStorage({
        destination: "public/images",
        filename: (_, file, callback) => {
            const name = makeId(10);
            callback(null, name + path.extname(file.originalname))
        },
    }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => {

        if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' ||  file.mimetype ==='image/jpeg') {
            callback(null, true);
        } else {
            callback(new Error('이미지 형식이 아닙니다. (jpg/png만 허용)'));
        }
    }

}) 

const uploadSubImage = async (req: Request, res: Response) => {

    const sub: Sub = res.locals.sub;
    try {
        const type = req.body.type;
        if (type !== "banner" && type !== "image") {
            if (!req.file?.path) {
                return res.status(404).json({ error: "유효하지 않은 파일입니다." })
            }

            unlinkSync(req.file.path)
            return res.status(400).json({ error: "잘못된 유형입니다." })

        }

        let oldImageUrn : string = "";

        if(type === "image"){

            oldImageUrn = sub.imageUrn || "";
            sub.imageUrn = req.file?.filename || ""

        }else if(type==="banner"){
            oldImageUrn = sub.bannerUrn || "";
            sub.imageUrn = req.file?.filename || ""
        }

        await sub.save()

        if(oldImageUrn!==""){
            const fullFileName = path.resolve(
                process.cwd(),
                "public",
                "images",
                oldImageUrn
            )

            unlinkSync(fullFileName)
        }

        return res.json(sub)

    } catch (error) {
        console.log(error);
        return res.status(500).json({error : "문제가 발생했습니다."})
    }
    
}



const router = Router()

router.get("/:name" , userMiddleware, getSub);
router.post("/" , userMiddleware, authMiddleware, createSub)
router.get("/sub/topSubs" , topSubs)
router.post("/:name/upload" , userMiddleware, authMiddleware, ownSub, upload.single("file"), uploadSubImage)

export default router