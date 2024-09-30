import request from 'supertest';
import app from '../../src/app';
import bcrypt from 'bcrypt';
import * as actions from '../../src/services/user.services';
import { User } from '../../src/models/users';

const user = {username: 'test-user', password: '1234'};
const route : string = '/auth';

// the value returned by the mocked functions getUserByUsername and getUserById
let returnedUser: User;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  returnedUser = {id: 1, username: user.username, password: hashedPassword};
});

describe('POST /auth', () => {

  jest.spyOn(actions, 'getUserByUsername')
    .mockImplementation(() => Promise.resolve(undefined)) // default
    .mockImplementationOnce(() => Promise.resolve(returnedUser)); // first use

  test('Succesfully returns a token', async () => {


    const res = await request(app)
      .post(route)
      .send(user)
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toEqual(200);
  });
  
  test('credentials error when invalid name', async () => {
    const res = await request(app)
      .post(route)
      .send({username: 'invalid-name', password: user.password})
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toEqual(401);
  });

  test('credentials error when invalid password', async () => {
    const res = await request(app)
      .post(route)
      .send({username: user.username, password: '4321'})
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toEqual(401);
  });

  test('should send back a bad request error', async () => {
    const badUser = { username: 1234, password: 1234 } ;
    const res = await request(app)
      .post(route)
      .send(badUser)
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toEqual(400);
  });
});

