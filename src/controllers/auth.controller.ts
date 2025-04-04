import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/user.model';
import {generateToken} from '../utils/token'
import { EmailService } from '../emails/verifyAccountEmail';

export class AuthController {
    static register = async (req: Request, res: Response) => {
        try {
            const {email, password, name} = req.body;

            const user = new User(req.body);

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                res.status(400).json({ message: "Email is already in use" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            user.password = hashedPassword;
            //add 6 digits token code to verify
            const token = generateToken();
            user.token = token;
            
            EmailService.sendVerificationEmail(name, email, token);

            await user.save();

            res.status(201).json(user);
        } catch (error) {
            console.error("Has been an error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // static verify = async (req: Request, res: Response) => {
    //     try {
            
    //     } catch (error) {
    //         console.error("Has been an error", error);
    //         res.status(500).json({ message: "Internal server error" });
    //     }
    // }
}