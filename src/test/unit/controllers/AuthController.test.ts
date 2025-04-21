import {createRequest, createResponse} from 'node-mocks-http'
import bcrypt from 'bcrypt'
import { AuthController } from '../../../controllers/auth.controller';
import User from '../../../models/user.model';
import { EmailService } from '../../../emails/emailServices';
import { createJWT, generateToken } from '../../../utils/token';

jest.mock('../../../models/user.model')
jest.mock('../../../models/user.model');
jest.mock('bcrypt');
jest.mock('../../../emails/emailServices');
jest.mock('../../../utils/token', () => ({
  generateToken: jest.fn(),
  createJWT: jest.fn()
}));
    

describe('AuthController.register', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should register a user successfully', async () => {
        const reqBody = { email: 'test@example.com', password: 'Example123', name: 'Pulei' };

        const mockUser = {
            ...reqBody,
            save: jest.fn(),
        };

        (User.findOne as jest.Mock).mockResolvedValue(null); // email not in use
        (User.create as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass123');
        (generateToken as jest.Mock).mockReturnValue('123456'); //mockReturnValue for sync operations, mockResolvedValue for async operations
        (EmailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);
        
        const request = createRequest({
            method: 'POST',
            url: '/api/auth/register',
            body: reqBody
        });
    
        const response = createResponse();
    
        await AuthController.register(request, response);
    
        const data = response._getJSONData();

        expect(response.statusCode).toBe(201);
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: reqBody.email } });
        expect(User.create).toHaveBeenCalled();
        expect(User.create).toHaveBeenCalledWith(reqBody);
        expect(bcrypt.hash).toHaveBeenCalled();
        expect(bcrypt.hash).toHaveBeenCalledWith(reqBody.password, 10);
        expect(EmailService.sendVerificationEmail).toHaveBeenCalledWith('Pulei', 'test@example.com', '123456');
    })

    it('should return 409 if email is already in use', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(true); // already exists
    
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/register',
            body: 
            { 
                email: 'taken@example.com', 
                password: 'Example123', 
                name: 'Juan' 
            } 
        });

        const res = createResponse();
    
        await AuthController.register(req, res);
    
        expect(res.statusCode).toBe(409);
        expect(res._getJSONData()).toEqual({ message: "Email is already in use" });
      });
    
      it('should handle internal server errors', async () => {
        (User.create as jest.Mock).mockRejectedValue(new Error('DB Error'));
    
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/register',
            body: 
            { 
                email: 'taken@example.com', 
                password: 'Example123', 
                name: 'Juan' 
            } 
        });

        const res = createResponse();
    
        await AuthController.register(req, res);
    
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ message: "Internal server error" });
      });
});

describe('AuthController.login', () => {
    const email = 'test@example.com';
    const password = 'Test1234121';
  
    it('should return 404 if user is not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
  
      const req = createRequest({
        method: 'POST',
        body: { email, password }
      });
      const res = createResponse();
  
      await AuthController.login(req, res);
  
      expect(res.statusCode).toBe(404);
      const data = res._getJSONData();
      expect(data.msg).toBe(`User with email ${email} not found`);
    });
  
    it('should return 403 if user is not verified', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email,
        password: 'hashed-password',
        verified: false
      });
  
      const req = createRequest({
        method: 'POST',
        body: { email, password }
      });
      const res = createResponse();
  
      await AuthController.login(req, res);
  
      expect(res.statusCode).toBe(403);
      expect(res._getJSONData().msg).toBe('Please verify your account');
    });
  
    it('should return 401 if password is incorrect', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email,
        password: 'hashed-password',
        verified: true
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); //force incorrect password
  
      const req = createRequest({
        method: 'POST',
        body: { email, password }
      });
      const res = createResponse();
  
      await AuthController.login(req, res);
  
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData().msg).toBe('Incorrect password');
    });
  
    it('should return token if login is successful', async () => {
      const mockUser = {
        id: 1,
        email,
        password: 'hashed-password',
        verified: true
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (createJWT as jest.Mock).mockReturnValue('mock-jwt-token');
  
      const req = createRequest({
        method: 'POST',
        body: { email, password }
      });
      const res = createResponse();
  
      await AuthController.login(req, res);
  
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ token: 'mock-jwt-token' });
    });
  
    it('should handle internal server error', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('DB fail'));
  
      const req = createRequest({
        method: 'POST',
        body: { email, password }
      });
      const res = createResponse();
  
      await AuthController.login(req, res);
  
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Internal server error' });
    });
  });