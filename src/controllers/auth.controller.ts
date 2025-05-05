import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/user.model';
import {createJWT, generateToken} from '../utils/token'
import { EmailService } from '../emails/emailServices';
import { comparePasswords } from '../utils/comparePassword';

type TokenPayload = {
    id: number;
    iat: number;
    exp: number;
};

export class AuthController {
    static register = async (req: Request, res: Response) => {
        try {
            const {email, password, name} = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                const error = new Error(`Email ${email} is already in use`)
                res.status(409).json({ error: error.message });
                return;
            }

            const user = await User.create(req.body);

            const hashedPassword = await bcrypt.hash(password, 10);

            user.password = hashedPassword;
            //add 6 digits token code to verify
            const token = generateToken();
            user.token = token;

            //create global variable with the valid token for integration test (verify account test) to check if really exists. If the enviorment is not production
            if (process.env.NODE_ENV !== 'production') {
                globalThis.testToken = user.token;
            }
            
            EmailService.sendVerificationEmail(name, email, token);

            await user.save();

            res.status(201).json({msg: 'Registered correctly'});
        } catch (error) {
            console.error("Has been an error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static verify = async (req: Request, res: Response) => {
        try {
            const {token} = req.body;

            const user = await User.findOne({ where: { token} });
            if (!user) {
                const error = new Error('Unauthorized, invalid token')
                res.status(401).json({msg: error.message});
                return;
            }
            //change verified status
            user.token = '';
            user.verified = true;

            await user.save();
            const {username, email} = user;
            EmailService.sendConfirmedAccountEmail(username, email);
            
            res.status(201).json({msg: 'Your account has been verified'});
        } catch (error) {
            console.error("Has been an error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body;

            const user = await User.findOne({ where: { email} });
            if (!user) {
                const error = new Error(`User with email ${email} not found`)
                res.status(404).json({msg: error.message});
                return;
            }

            if (!user.verified) {
                const error = new Error(`Please verify your account`)
                res.status(403).json({msg: error.message});
                return;
            }

            const isPasswordValid = await comparePasswords(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ msg: 'Incorrect password' });
                return
            }

            const token = createJWT(user.id);
            res.json({token});

        } catch (error) {
            console.error("Has been an error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const {email} = req.body;
            const user = await User.findOne({ where: { email} });
            if (!user) {
                const error = new Error(`The account with email: ${email} does not exist`)
                res.status(404).json({msg: error.message});
                return;
            }
            user.token = generateToken(); //save 6 digits code in user data
            user.save();

            EmailService.sendForgotPasswordEmail(email, user.token);

            res.json({msg: 'Please check your email'});

        } catch (error) {
            console.error("Has been an error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const {token} = req.body;
            const tokenExist = await User.findOne({ where: { token} });
            if (!tokenExist) {
                const error = new Error(`Invalid token`)
                res.status(403).json({msg: error.message});
                return;
            }

            res.json({msg: 'Token is valid'});

        } catch (error) {
            console.error("Has been an error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        try {
            const {token} = req.params;
            const {newPassword} = req.body;

            const user = await User.findOne({ where: { token} });
            if (!user) {
                const error = new Error(`Invalid token`)
                res.status(403).json({msg: error.message});
                return;
            }
            //hash the new one
            const newHashedPassword = await bcrypt.hash(newPassword, 10);

            user.password = newHashedPassword;
            user.token = ''; //disable token
            await user.save();

            res.json({msg: 'Password modified correctly'});

        } catch (error) {
            console.error("Has been an error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user);
    }

    static validPassword = async (req: Request, res: Response) => {
        try {
            const user = await User.findOne({where: {email: req.user.email}}); //we exlude pwd in req.user (middleware), have to get user by its email

            if(!await bcrypt.compare(req.body.password, user.password)){
                const error = new Error(`Unauthorized, incorrect password`)
                res.status(401).json({msg: error.message});
                return;
            }

            res.json({msg: 'Password is correct'});

        } catch (error) {
            console.error("Has been an error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}