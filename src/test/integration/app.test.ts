import request from 'supertest'
import server from '../../server'
import { AuthController } from '../../controllers/auth.controller'

describe('Auth - register/create account', () => {
    it('should display validation errors when form is empty', async () => {
        const response = await request(server).
            post('/api/auth/register')
            .send({});
        
        const registerSpy = jest.spyOn(AuthController, 'register');

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveLength(7);
        expect(response.statusCode).not.toBe(201);

        //do not call controller
        expect(registerSpy).not.toHaveBeenCalled();
    });

    it('should return error for invalid email format', async () => {
        const registerSpy = jest.spyOn(AuthController, 'register');
      
        const response = await request(server)
          .post('/api/auth/register')
          .send({
            username: 'puleiuser',
            email: 'invalid_email',
            password: 'Password1123'
            }); 
      
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(registerSpy).not.toHaveBeenCalled();
    });
      
    it('should return error if password is too short or lacks number/letter', async () => {
        const registerSpy = jest.spyOn(AuthController, 'register');
      
        const response = await request(server)
          .post('/api/auth/register')
          .send({
            username: 'example',
            email: 'example@email.com',
            password: 'short' // not pass validation
          });
      
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveLength(2);
        expect(registerSpy).not.toHaveBeenCalled();
    });

    it('should return error if username is too short', async () => {
        const registerSpy = jest.spyOn(AuthController, 'register');
      
        const response = await request(server)
          .post('/api/auth/register')
          .send({
            username: 'jo',
            email: 'example@email.com',
            password: 'Password132'
          });
      
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(registerSpy).not.toHaveBeenCalled();
    });

    it('should call the controller when data is valid', async () => {
        const userData = {
            "username": "userexample",
            "email": "puleigarcia@email.com",
            "password": "Password121"
        }

        const response = await request(server)
          .post('/api/auth/register')
          .send(userData);
      
        expect(response.statusCode).toBe(201);
        expect(response.body.msg).toBe('Registered correctly');
    });

    it('should return 409 error: user already registered', async () => {
        const userData = {
            "username": "userexample",
            "email": "puleigarcia@email.com",
            "password": "Password121"
        }

        const response = await request(server)
          .post('/api/auth/register')
          .send(userData);
      
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("Email is already in use");
        expect(response.statusCode).not.toBe(400);
        expect(response.statusCode).not.toBe(201);
    });
})