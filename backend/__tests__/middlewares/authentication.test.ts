import request from 'supertest';
import app from '../../src/app';
import { verifyTrainerToken, verifyUserToken } from '../../src/middlewares/authentication';
import { Request, Response } from 'express';
import { User } from '../../src/models/users';
import bcrypt from 'bcrypt';
import { Trainer } from '../../src/models/trainers';

import * as userServices from '../../src/services/user.services';
import * as trainerServices from '../../src/services/trainer.services';

const user = {username: 'test-user', password: '1234'};
const trainer = {username: 'test-trainer', password: '1234'};

// the value returned by the mocked functions getUserByUsername and getUserById
let returnedUser: User;
let returnedTrainer: Trainer;

jest.mock('../../src/services/user.services');
jest.mock('../../src/services/trainer.services');

beforeAll(async () => {
  const hashedPasswordUser = await bcrypt.hash(user.password, 10);
  const hashedPasswordTrainer = await bcrypt.hash(user.password, 10);
  returnedUser = {id: 1, username: user.username, password: hashedPasswordUser};
  returnedTrainer = {id: 1, username: trainer.username, password: hashedPasswordTrainer};
});

/***** USER *****/
describe('Tests of protected route for USER', () => {

  const route : string = '/protected-route';
  // Example of protected route for user
  app.use(route, verifyUserToken, (req: Request, res: Response) => {
    return res.json({
      msg: `Access to protected route granted. Your id is ${req.user?.userId}`});
  });

  test('Succesfully authenticate a user | Auth-Header', async () => {
    jest.spyOn(userServices, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(returnedUser));

    // Get the token
    const getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    expect(getToken.statusCode).toEqual(200);

    const { token } =  getToken.body;

    // Test protected route
    const res = await request(app)
      .get(route)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
  
  });

  test('Succesfully authenticate a user | Cookies token', async () => {
    jest.spyOn(userServices, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(returnedUser));
    // Get the token
    const getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    expect(getToken.statusCode).toEqual(200);

    const { token } =  getToken.body;

    // Test protected route
    const res = await request(app)
      .get(route)
      .set('Cookie', `token=${token}`);
    
    expect(res.statusCode).toEqual(200);
  
  });

  test('Unauthorize try to authenticate user | invalid authorization given', async () => {
    const res = await request(app)
      .get(route)
      .set('Authorization', 'Inadequate token');
    
    expect(res.statusCode).toEqual(401);
  });

  test('Unauthorize try to authenticate user | password not matching', async () => {
    jest.spyOn(userServices, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(returnedUser));
    const res = await request(app)
      .post('/auth')
      .send({username: user.username, password: 'Tentative malicieuse'})
      .set('Content-Type', 'application/json');
    
    expect(res.statusCode).toEqual(401);
  });
  
  test('Unauthorize try to authenticate user | inexistant user', async () => {
    jest.spyOn(userServices, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(undefined));
    const res = await request(app)
      .post('/auth')
      .send({username: 'Malicieux manchot', password: 'À vos Sardine'})
      .set('Content-Type', 'application/json');
    
    expect(res.statusCode).toEqual(401);
  });
  
});

/***** TRAINER *****/
describe('Tests of protected route for TRAINER', () => {
  
  const route : string = '/protected-route-trainer';
  // Example of protected route for trainer
  app.use(route, verifyTrainerToken, (req: Request, res: Response) => {
    return res.json({
      msg: `Access to protected route granted. Your id is ${req.trainer?.trainerId}`});
  });
  test('Succesfully authenticate a trainer', async () => {
    jest.spyOn(trainerServices, 'getTrainerByUsername').mockImplementationOnce(() => Promise.resolve(returnedTrainer));
    // Get the token
    const getToken = await request(app)
      .post('/auth/trainer')
      .send(trainer)
      .set('Content-Type', 'application/json');
    expect(getToken.statusCode).toEqual(200);

    const { token } =  getToken.body;

    // Test protected route
    const res = await request(app)
      .get(route)
      .set('Authorization', `Bearer ${token}`);

    // console.log(res);
    expect(res.statusCode).toEqual(200);
  
  });

  test('Succesfully authenticate a trainer | Cookies token', async () => {
    jest.spyOn(trainerServices, 'getTrainerByUsername').mockImplementationOnce(() => Promise.resolve(returnedTrainer));
    // Get the token
    const getToken = await request(app)
      .post('/auth/trainer')
      .send(trainer)
      .set('Content-Type', 'application/json');
    expect(getToken.statusCode).toEqual(200);

    const { token } =  getToken.body;

    // Test protected route
    const res = await request(app)
      .get(route)
      .set('Cookie', `token=${token}`);
    
    expect(res.statusCode).toEqual(200);
  
  });

  test('Unauthorize try to authenticate trainer | invalid authorization given', async () => {
    const res = await request(app)
      .get(route)
      .set('Authorization', 'Inadequate token');
    
    expect(res.statusCode).toEqual(401);
  });

  test('Unauthorize try to authenticate trainer | password not matching', async () => {
    jest.spyOn(trainerServices, 'getTrainerByUsername').mockImplementationOnce(() => Promise.resolve(returnedTrainer));
    const res = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: 'Tentative malicieuse'})
      .set('Content-Type', 'application/json');
    
    expect(res.statusCode).toEqual(401);
  });
  
  test('Unauthorize try to authenticate trainer | inexistant trainer', async () => {
    jest.spyOn(trainerServices, 'getTrainerByUsername').mockImplementationOnce(() => Promise.resolve(undefined));
    const res = await request(app)
      .post('/auth/trainer')
      .send({username: 'Malicieux manchot', password: 'À vos Sardine'})
      .set('Content-Type', 'application/json');
    
    expect(res.statusCode).toEqual(401);
  });
  
});

