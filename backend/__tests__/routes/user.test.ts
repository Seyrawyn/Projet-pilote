import request from 'supertest';
import app from '../../src/app';
import bcrypt from 'bcrypt';
import * as actions from '../../src/services/user.services';
import { beforeEach, describe } from 'node:test';
import { User } from '../../src/models/users';
import { NextFunction, Request, Response } from 'express';
import { Readable } from 'stream';
import fs from 'fs';

// Base user should always work
const user = {
  username: 'test-user', 
  password: 'Testuser1234', 
  email: 'testing@gmail.com',
  name: 'Test User',
  dateOfBirth: '1990-01-01',
  sex: 'Homme',
  height: 180.5,
  weight: 75.5,
  description: 'Empereur incontesté de l\'uqam'
};

// this user as the same name
const user1 = {username: 'test-user', password: 'Testuser1234', email: 'usertesting@gmail.com', name: 'Test User the 2nd', dateOfBirth: '1990-01-11'};

// this user has the same email
const user2 = {username: 'testing user', password: 'Testuser1234',email: 'testing@gmail.com', name: 'Test User the 3nd', dateOfBirth: '1990-01-22'};

let returnedUser: User;
// let returnedUser1: User;
// let returnedUser2: User;

jest.mock('../../src/services/user.services');

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  returnedUser = {id: 1, username: user.username, password: hashedPassword, dateOfBirth: user.dateOfBirth};

  // const hashedPassword1 = await bcrypt.hash(user1.password, 10);
  // returnedUser1 = {id: 2, username: user1.username, password: hashedPassword1, email: user1.email, name: user1.name};

  // const hashedPassword2 = await bcrypt.hash(user2.password, 10);
  // returnedUser2 = {id: 3, username: user2.username, password: hashedPassword2, email: user2.email, name: user2.name};
});


beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('User routes', () => {
  describe('POST /user', () => {
    const route : string = '/user';

    test('#1: should create a new user', async () => {
      jest.spyOn(actions, 'getUserByUsername')
        .mockImplementationOnce(() => Promise.resolve(undefined));

      const res = await request(app)
        .post(route)
        .send(user)
        .set('Content-Type', 'application/json');
        
      expect(res.status).toBe(201);
    });



    // Conflict errors : Sharing same unique ressource (email and name) 
    test('#2: should send back a conflict error', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(returnedUser));

      const res = await request(app)
        .post(route)
        .send(user)
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toEqual(409);
    });


    // Conflict errors : Sharing same unique ressource (name) 
    test('#3: should send back a conflict error', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(returnedUser));

      const res = await request(app)
        .post(route)
        .send(user1)
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toEqual(409);
    });


    // Conflict errors : Sharing same unique ressource (email) 
    test('#4: should send back a conflict error', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(returnedUser));

      const res = await request(app)
        .post(route)
        .send(user2)
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toEqual(409);
    });



    test('#5: should send back a bad request error', async () => {
      const badUser = { username: 1234, password: 1234 } ;
      const res = await request(app)
        .post(route)
        .send(badUser)
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toEqual(400);
    });


  });





  describe('GET /user', () => {

    test('#4: should obtain informations successfully', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserByIdWithTrainer').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .get('/user')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
    });

    // Techniquement pas sensé être possible, mais je garde de côté au cas où j'ai pas penser à une scénario
    // test('#5: should not be able to find a corresponding user', async () => {

    //   // Example the user has been deleted and you still possess a existing token 
    //   jest.spyOn(actions, 'getUserByUsername')
    //     .mockImplementationOnce(() => Promise.resolve(returnedUser))
    //     .mockImplementationOnce(() => Promise.resolve(undefined));
    //   jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(undefined));

    //   const getToken = await request(app)
    //     .post('/auth')
    //     .send(user)
    //     .set('Content-Type', 'application/json');

    //   const { token } = getToken.body;
    //   const invalidToken = `Bearer ${token}`;
    //   // Token does have an id but no user have the id.
    //   // const invalidToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMzLCJpYXQiOjE3MDkwNTA5OTB9.06MlfRValeODxFKUrNKNXiYaZMtlZD1I5nry4O8Lh-Y';

    //   const res = await request(app)
    //     .get('/user')
    //     .set('Authorization', invalidToken);
    //   console.log(res.error);
    //   expect(res.statusCode).toEqual(404);
    // });

    test('#5: should not have the permissions to access data', async () => {

      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(undefined));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(undefined));

      const invalidToken = 'Bearer invalid';

      const res = await request(app)
        .get('/user')
        .set('Authorization', invalidToken);
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('DELETE /user', () => {
    test('#6: should delete user successfully', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));

      // No clue why I need to call these before in order to work.
      actions.getUserByUsername('string');
      actions.getUserById(1);

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .delete('/user')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
    });
  });


  describe('PUT /userId', () => {
    test('#7: should update user successfully', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));

      const getToken = await request(app)
        .post('/auth')
        .send({username: user.name, password: user.password})
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .put('/user')
        .send(user)
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
    });

    test('#8: should not be able to update user | invalid token', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(undefined));
      // jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(undefined));

      const invalidToken = 'Bearer invalid';

      const res = await request(app)
        .put('/user')
        .send(user)
        .set('Authorization', invalidToken);
      expect(res.statusCode).toEqual(401);
    });

    test('#9: should not be able to update user | not every field were send', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .put('/user')
        .send({ username: 'new-username' })
        .set('Authorization', validToken);
      expect(res.statusCode).toEqual(400);
    });
  });



  describe('PUT /picture', () => {
    test('#10: should return no corresponding user found', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));

      jest.mock('multer', () => {
        return {
          single: jest.fn().mockImplementation((fieldname: string) => {
            return (req: Request, res: Response, next: NextFunction) => {
              const buffer = Buffer.from('fake file content', 'utf-8');
              const stream = new Readable();
              stream.push(buffer); // Add the buffer content to the stream
              stream.push(null); // Indicate the end of the stream
      
              req.file = {
                fieldname: 'picture',
                originalname: 'testImage.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: 'uploads/',
                filename: 'mockedFileName.jpg',
                path: 'uploads/mockedFileName.jpg',
                size: buffer.length,
                stream,
                buffer,
              };
              next();
            };
          }),
        };
      });

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;


      const res = await request(app)
        .put('/user/picture')
        .attach('picture', Buffer.from('fake image data'), 'testImage.jpg')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(404);
    });
    
    test('#11: should return bad request because no picture given', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      // actions.getUserById(0);

      jest.mock('multer', () => {
        return {
          single: jest.fn().mockImplementation((fieldname: string) => {
            return jest.fn();
          }),
        };
      });

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .put('/user/picture')
        .set('Authorization', validToken);
        
      expect(res.statusCode).toEqual(400);
    });


    test('#12: should return bad request', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));

      jest.mock('multer', () => {
        return {
          single: jest.fn().mockImplementation((fieldname: string) => {
            return (req: Request, res: Response, next: NextFunction) => {
              const buffer = Buffer.from('fake file content', 'utf-8');
              const stream = new Readable();
              stream.push(buffer); // Add the buffer content to the stream
              stream.push(null); // Indicate the end of the stream
      
              req.file = {
                fieldname: 'picture',
                originalname: 'dummy.pdf',
                encoding: '7bit',
                mimetype: 'lol/pdf',
                destination: 'uploads/',
                filename: 'mockedFileName.pdf',
                path: 'uploads/mockedFileName.pdf',
                size: buffer.length,
                stream,
                buffer,
              };
              next();
            };
          }),
        };
      });

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .put('/user/picture')
        .attach('picture', Buffer.from('fake image data'), 'testImage.pdf')
        .set('Authorization', validToken);
      expect(res.statusCode).toEqual(400);
    });
  });

  test('#13: should return upload image successfully', async () => {
    jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
    jest.spyOn(actions, 'getUserImage').mockImplementationOnce(() => Promise.resolve({img: null}));

    jest.doMock('multer', () => {
      return {
        single: jest.fn().mockImplementation((fieldname: string) => {
          return (req: Request, res: Response, next: NextFunction) => {
            const buffer = Buffer.from('fake file content', 'utf-8');
            const stream = new Readable();
            stream.push(buffer); // Add the buffer content to the stream
            stream.push(null); // Indicate the end of the stream
      
            req.file = {
              fieldname: 'picture',
              originalname: 'dummy.jpg',
              encoding: '7bit',
              mimetype: 'image/jpg',
              destination: 'uploads/',
              filename: 'mockedFileName.jpg',
              path: 'uploads/mockedFileName.jpg',
              size: buffer.length,
              stream,
              buffer,
            };
            next();
          };
        }),
      };
    });

    const getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const res = await request(app)
      .put('/user/picture')
      .attach('picture', Buffer.from('fake image data'), 'testImage.jpg')
      .set('Authorization', validToken);
    expect(res.statusCode).toEqual(200);
  });


  describe('GET /user/picture', () => {
    test('#16: should return no corresponding user', async () => {

      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(undefined));

      actions.getUserById(0);
      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .get('/user/picture')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(404);
    });

    test('#17: should return no corresponding picture', async () => {

      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserImage').mockImplementationOnce(() => Promise.resolve({img: null}));

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .get('/user/picture')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(404);
    });

    test('#18: should return no corresponding picture', async () => {

      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserImage').mockImplementationOnce(() => Promise.resolve({img: 'image.png'}));
      actions.getUserImage(0);

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .get('/user/picture')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
    });
  });



  describe('DELETE /user/picture', () => {


    test('#19: should return no corresponding user', async () => {
      
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(null))));
      
      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;
      const res = await request(app)
        .delete('/user/picture')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(404);
    });


    test('#20: should return no corresponding picture to delete', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserImage').mockImplementationOnce(() => Promise.resolve({ img: null }));

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;      

      const res = await request(app)
        .delete('/user/picture')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(405);
    });



    test('#21: should successfully delete user picture', async () => {
      jest.spyOn(actions, 'getUserByUsername').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(JSON.parse(JSON.stringify(returnedUser))));
      jest.spyOn(actions, 'getUserImage').mockImplementationOnce(() => Promise.resolve({ img: 'image.png' }));
      jest.spyOn(fs.promises, 'unlink').mockImplementationOnce(() => Promise.resolve());

      const getToken = await request(app)
        .post('/auth')
        .send(user)
        .set('Content-Type', 'application/json');

      const { token } = getToken.body;
      const validToken = `Bearer ${token}`;

      const res = await request(app)
        .delete('/user/picture')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
    });


  });

});



