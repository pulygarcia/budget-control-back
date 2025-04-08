import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

declare global {
    namespace Express {
      interface Request {
        user?: any;
      }
    }
}

type TokenPayload = {
    id: number;
    iat: number;
    exp: number;
};

export const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    if(!req.headers.authorization){
        res.status(403).json({msg: 'Invalid token'});
        return;
    }

    const token = req.headers.authorization.split(' ')[1]; //extract pure token from bearer array
    const privateKey = process.env.PRIVATE_KEY_JWT;

    try {
        const decoded = jwt.verify(token, privateKey) as TokenPayload;
        //console.log(decoded);
    
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password', 'token', 'verified', 'createdAt', 'updatedAt'] }
        });

        if (!user) {
            const error = new Error(`Invalid token`)
            res.status(403).json({msg: error.message});
            return;
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Has been an error", error);
        res.status(500).json({ message: "Internal server error" });
    }
}