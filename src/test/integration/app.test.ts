import request from 'supertest'
import server from '../../server'
import { AuthController } from '../../controllers/auth.controller'
import User from '../../models/user.model';
import * as utilsToken from '../../utils/token';
import * as passwordUtils from '../../utils/comparePassword'

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
});

describe('Auth - verify account with token', () => {
  it('should return error if token is not valid', async () => {
    const response = await request(server)
      .post('/api/auth/verify')
      .send({
        token: 'invalid_token'
      });
  
    //console.log(response.body);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveLength(1);
    expect(response.statusCode).toBe(400);
  });

  it('should return 401 error if token does not exist in DB', async () => {
    const response = await request(server)
      .post('/api/auth/verify')
      .send({
        token: '444556'
      });
  
    //console.log(response.body);
    expect(response.body).toEqual({ msg: 'Unauthorized, invalid token' });
    expect(response.statusCode).toBe(401);
  });

  it('should verify user correctly', async () => {
    const response = await request(server)
      .post('/api/auth/verify')
      .send({
        token: globalThis.testToken //this comes from contoller when register in order to get real valid token
      });
  
    //console.log(response.body);
    expect(response.body).toEqual({ msg: 'Your account has been verified' });
    expect(response.statusCode).toBe(201);
    expect(response.statusCode).toBe(201);
  });
});

describe('Auth - login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 error: empty form', async () => {
    const loginMock = jest.spyOn(AuthController, 'login');

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: '',
        password: ''
      });
  
    //console.log(response.body);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveLength(2);
    expect(response.statusCode).toBe(400);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('should return 400 error: invalid email provided', async () => {
    const loginMock = jest.spyOn(AuthController, 'login');

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'jorgito.com',
        password: 'Quieto1234'
      });
  
    //console.log(response.body);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveLength(1);
    expect(response.statusCode).toBe(400);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('should return 404 error: email not found in DB', async () => {
    const loginMock = jest.spyOn(AuthController, 'login');

    const testEmail = 'jorgito@gmail.com';

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'Pepito1234'
      });
  
    //console.log(response.body);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ msg: `User with email ${testEmail} not found` });
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('should return 403 error: user not verified', async () => {
    const testEmail = 'jorgito@gmail.com';

    jest.spyOn(User, 'findOne').mockResolvedValue({
      id: 1,
      email: testEmail,
      password: 'HashedPassword123',
      verified: false
    } as any);


    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'Pepito1234'
      });
  
    //console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ msg: `Please verify your account` });
  });

  it('should return 200 and token if login is successful', async () => {
    const testEmail = 'jorgito@gmail.com';
    const fakeToken = 'Ej1213JJSb2adadokffh23445000334LDNV'

    jest.spyOn(User, 'findOne').mockResolvedValue({
      id: 1,
      email: testEmail,
      password: 'hashed_password',
      verified: true
    } as any);

     // Mock bcrypt
     const checkPassword = jest.spyOn(passwordUtils, 'comparePasswords').mockResolvedValue(true);

     // Mock token
     const generateToken = jest.spyOn(utilsToken, 'createJWT').mockReturnValue(fakeToken);

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'Pepito1234'
      });
  
    //console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ token: `${fakeToken}` });

    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);

    expect(checkPassword).toHaveBeenCalled();
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledWith('Pepito1234', 'hashed_password');

    expect(generateToken).toHaveBeenCalled();
    expect(generateToken).toHaveBeenCalledTimes(1);
    expect(generateToken).toHaveBeenCalledWith(1); //id for the jwt

  });
});