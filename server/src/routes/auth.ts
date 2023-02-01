import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const mapErros = (erros : object[]) =>{
    return erros.reduce((prev: any, err: any)=>{
        prev[err.property] = Object.entries(err.constraints)[0][1]
        return prev;
    },{})

}

const me = async (_: Request, res:Response) =>{

    // console.log("me");
    
    return res.json(res.locals.user)
} 



const register = async (req: Request, res:Response) =>{

    const {email, password, username} = req.body;
    // console.log("email", email);

    try {
        let erros : any  = {};

        const emailUser = await User.findOneBy({email})
        const usernameUser = await  User.findOneBy({username})

        // console.log("1-" , {username});
        

        if(emailUser) erros.email = "이미 사용중인 이메일 입니다."
        if(usernameUser) erros.username = "이미 사용중인 사용자 이름입니다."

        if(Object.keys(erros).length >0){
            return res.status(400).json(erros)
        }

        const user = new User();
        user.email = email;
        user.username = username;
        user.password = password; 

        erros = await validate(user);

        if(erros.length>0) return res.status(400).json(mapErros(erros));

        await user.save()
        return res.json(user)
        
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }


}


const login =async (req: Request , res: Response) => {
    const {username, password} = req.body;
    // console.log("0", username);
    
    try {
        let erros : any = {};
        if(isEmpty(username)) erros.username = "사용자 이름을 입력하세요."
        if(isEmpty(password)) erros.password = "비밀번호를 입력하세요."
        if(Object.keys(erros).length > 0) {
            return res.status(400).json(erros)
        }

        const user = await User.findOneBy({username})
        
        if(!user) return res.status(404).json({username : "존재하지 않는 사용자 이름입니다."})

        const passwordMatches = await bcrypt.compare(password, user.password);

        if(!passwordMatches){
            return res.status(401).json({password : "비밀번호가 일치하지 않습니다."})
        }

        const token = jwt.sign({username}, process.env.JWT_SECRET)

        res.set("Set-Cookie", cookie.serialize("token", token, {
            httpOnly : true,
            maxAge : 60*60*24*7,
            path: "/"
        }));
        
        return res.json({user, token})
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
}

const router = Router();
router.get('/me', userMiddleware, authMiddleware, me)
router.post('/register', register);
router.post('/login', login);

export default router