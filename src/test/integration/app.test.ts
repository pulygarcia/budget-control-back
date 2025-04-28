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
    const fakeToken = 'mocked_token2122212'

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

//budgets
let token:string
async function authenticateUser(){

  const response = await request(server)
                      .post('/api/auth/login')
                      .send({
                        email: 'puleigarcia@email.com',
                        password: 'Password121'
                      })
    /*console.log(response.body);*/ //real token
    token = response.body.token; //put token into a global variable in order to avoid login again to get it in next it's
}

describe('GET: /api/budgets', () => {
  beforeAll(() => {
    jest.restoreAllMocks() //restore all previous mocks to avoid use a mocked token from other tests.
  })

  //Start session before the tests in order to get the real token, not a mocked one
  beforeAll(async() => {
    await authenticateUser();
  }) 

  it('should display error trying to get access without authentication (jwt)', async () => {
    const response = await request(server)
      .get('/api/budgets')
      .send({});

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ msg: 'Invalid token' });
  });

  it('should return user budgets', async () => {
    const response = await request(server)
      .get('/api/budgets')
      .auth(token, {type: "bearer"}) // Send token via headers

    //console.log(response.body);
    expect(response.statusCode).not.toBe(403);
    expect(response.body).not.toEqual({ msg: 'Invalid token' });
    expect(response.body).toHaveLength(0);
  });

  it('should display internal server error: token exist but is not valid', async () => {
    const response = await request(server)
      .get('/api/budgets')
      .auth('invalid_token_here', {type: "bearer"}) // Send token via headers

    //console.log(response.body);
    expect(response.body).toEqual({ message: 'Internal server error' })
    expect(response.statusCode).toBe(500);
  });
});

describe('POST: /api/budgets', () => {
  beforeAll(() => {
    jest.restoreAllMocks() //restore all previous mocks to avoid use a mocked token from other tests.
  })

  //Start session before the tests in order to get the real token, not a mocked one
  beforeAll(async () => {
    await authenticateUser();
  }) 

  it('should reject unauthenticated user without jwt to post budgets', async () => {
    const response = await request(server)
      .post('/api/budgets')
      .send({
        name: 'example',
        amount: '9000'
      })

    //console.log(response.body);
    expect(response.body).toEqual({ msg: 'Invalid token' })
    expect(response.statusCode).toBe(403);
  });

  it('should display errors: empty form creating budget', async () => {
    const response = await request(server)
      .post('/api/budgets')
      .send({
        name: '',
        amount: ''
      })
      .auth(token, {type: 'bearer'})

    //console.log(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(4);
  });

  it('should create a budget', async () => {
    const response = await request(server)
      .post('/api/budgets')
      .send({
        name: 'test',
        amount: 500
      })
      .auth(token, {type: 'bearer'})

    console.log(response.body);
  });
});

describe('GET: /api/budgets/:id', () => {
  beforeAll(async() => {
    await authenticateUser();
  }) 

  it('should display error trying to get access to budget by id without authentication (jwt)', async () => {
    const response = await request(server)
      .get('/api/budgets/1')

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ msg: 'Invalid token' });
  });

  it('should display error trying to send budgetId as a string into url', async () => {
    const response = await request(server)
      .get('/api/budgets/stringid')
      .auth(token,{type:'bearer'})

    //console.log(response.body);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.statusCode).toBe(400);
  });

  it('should display error: not found budget with id 900', async () => {
    const response = await request(server)
      .get('/api/budgets/900')
      .auth(token, {type: 'bearer'})

    //console.log(response.body);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toEqual({ error: 'Budget with id 900 not found' });
  });

  it('should get a budget with id 1', async () => {
    const response = await request(server)
      .get('/api/budgets/1')
      .send({budget: {
        id:1
      }})
      .auth(token, {type: 'bearer'})

    //console.log(response.body);
    expect(response.statusCode).toBe(201);
    expect(response.statusCode).not.toBe(404);
    expect(response.statusCode).not.toBe(400);
    expect(response.statusCode).not.toBe(500);
  });
});

describe('PATCH: /api/budgets/:id', () => {
  it('should display error trying to update budget without authentication (jwt)', async () => {
    const response = await request(server)
      .patch('/api/budgets/1')

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ msg: 'Invalid token' });
  });

  it('should display error: not found budget', async () => {
    const response = await request(server)
      .patch('/api/budgets/900')
      .auth(token, {type: 'bearer'})

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: 'Budget with id 900 not found' });
  });

  it('should update a budget correctly', async () => {
    const response = await request(server)
      .patch('/api/budgets/1')
      .send({
        name: 'testing',
        amount: 600
      })
      .auth(token, {type: 'bearer'})

    //console.log(response.body);
    expect(response.body).toEqual({ msg: 'Budget has been updated' })
    expect(response.statusCode).toBe(201)
    expect(response.statusCode).not.toBe(500)
    expect(response.statusCode).not.toBe(400)
    expect(response.statusCode).not.toBe(404)
  });
});

describe('DELETE: /api/budgets/:id', () => {
  it('should display error trying to delete budget without authentication (jwt)', async () => {
    const response = await request(server)
      .delete('/api/budgets/1')

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ msg: 'Invalid token' });
  });

  it('should display error: 404 not found', async () => {
    const response = await request(server)
      .delete('/api/budgets/900')
      .auth(token, {type: 'bearer'})
      
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: 'Budget with id 900 not found' });
  });

  it('should delete budget with id 1', async () => {
    const response = await request(server)
      .delete('/api/budgets/1')
      .auth(token, {type: 'bearer'})

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ msg: 'Budget has been deleted' });
  });
});