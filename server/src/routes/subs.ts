import {Request, Response, Router} from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import userMiddleware from "../middlewares/user"
import authMiddleware from "../middlewares/auth"
import { isEmpty } from 'class-validator';
import { AppDataSource } from '../data-source';
import Sub from '../entities/Sub';


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

const router = Router()

router.post("/" , userMiddleware, authMiddleware, createSub)

export default router