import request from 'supertest';
import app from '../../src/app';
import bcrypt from 'bcrypt';
import * as actions from '../../src/services/trainer.services';
import { beforeEach, describe } from 'node:test';
import { Trainer } from '../../src/models/trainers';

const trainer1 = { username: 'superTrainer', password: 'weak-password', email: 'trainer@hardcore.com', name: 'Mr. trainer' };
const trainer2 = { username: 'superTrainer', password: 'weird-password', email: 'weirdo@excel.com', name: 'Mr. weird' };

let returnedTrainer1: Trainer;
let returnedTrainer2: Trainer;

const basicAuthCredentials = Buffer.from(`${process.env.ADMIN_NAME ?? 'admin'}:${process.env.ADMIN_PASSWORD || 'defaultPassword'}`).toString('base64');

jest.mock('../../src/services/trainer.services');

beforeAll(async () => {
  const hashedPassword1 = await bcrypt.hash(trainer1.password, 10);
  returnedTrainer1 = { id: 1, username: trainer1.username, password: hashedPassword1, email: trainer1.email, name: trainer1.name };

  const hashedPassword2 = await bcrypt.hash(trainer2.password, 10);
  returnedTrainer2 = { id: 2, username: trainer2.username, password: hashedPassword2, email: trainer2.email, name: trainer2.name };

});


beforeEach(() => {
  // clean up before each test
  jest.restoreAllMocks();
});

describe('Trainer routes', () => {
  let numTest = 1;
  // POST /admin/trainer
  describe('POST /admin/trainer', () => {
    const route: string = '/admin/trainer';

    test(`${numTest++}: should create a new trainer`, async () => {
      jest.spyOn(actions, 'getTrainerByUsername')
        .mockImplementationOnce(() => Promise.resolve(undefined));
      jest.spyOn(actions, 'getTrainerByEmail')
        .mockImplementationOnce(() => Promise.resolve(undefined));

      const res = await request(app)
        .post(route)
        .send(trainer1)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${basicAuthCredentials}`);

      expect(res.status).toBe(201);
    });

    test(`${numTest++}: should not create a new trainer, no authorization`, async () => {
      jest.spyOn(actions, 'getTrainerByUsername')
        .mockImplementationOnce(() => Promise.resolve(undefined));
      jest.spyOn(actions, 'getTrainerByEmail')
        .mockImplementationOnce(() => Promise.resolve(undefined));
      
      const res = await request(app)
        .post(route)
        .send(trainer1)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(401);
    });

    test(`${numTest++}: should not create a new trainer, username already taken`, async () => {
      jest.restoreAllMocks();
      jest.spyOn(actions, 'getTrainerByUsername')
        .mockImplementationOnce(() => Promise.resolve(trainer1));
      jest.spyOn(actions, 'getTrainerByEmail')
        .mockImplementationOnce(() => Promise.resolve(undefined));

      actions.getTrainerByUsername('');

      const res = await request(app)
        .post(route)
        .send(trainer1)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${basicAuthCredentials}`);

      expect(res.status).toBe(409);
    });

    test(`${numTest++}: should not create a new trainer, email already in use`, async () => {
      jest.spyOn(actions, 'getTrainerByUsername')
        .mockImplementationOnce(() => Promise.resolve(undefined));
      jest.spyOn(actions, 'getTrainerByEmail')
        .mockImplementationOnce(() => Promise.resolve(trainer1));

      actions.getTrainerByEmail('');

      const res = await request(app)
        .post(route)
        .send(trainer1)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${basicAuthCredentials}`);

      expect(res.status).toBe(409);
    });

    // GET /admin/trainers
    describe('GET /admin/trainers', () => {
      const route: string = '/admin/trainers';

      test(`${numTest++}: should return all trainers`, async () => {
        jest.spyOn(actions, 'getAllTrainers')
          .mockImplementationOnce(() => Promise.resolve([trainer1, trainer2]));
        
        const res = await request(app)
          .get(route)
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(200);
      });

    });

    describe('GET /admin/trainer/{userId}', () => {
      const route: string = '/admin/trainer';

      test(`${numTest++}: should return a trainer`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .get(route + '/1')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(200);
      });

      test(`${numTest++}: should return a bad request error`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .get(route + '/asd')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(400);
      });


      test(`${numTest++}: should return an unauthorize error`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .get(route + '/1')
          .set('Content-Type', 'application/json');

        expect(res.status).toBe(401);
      });

    });

    // DELETE /admin/trainer/{userId}
    describe('DELETE /admin/trainer/{userId}', () => {
      const route: string = '/admin/trainer';

      test(`${numTest++}: should delete a trainer`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .delete(route + '/1')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(200);
      });

      test(`${numTest++}: should return a bad request error`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .delete(route + '/asd')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(400);
      });


      test(`${numTest++}: should return an unauthorize error`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .delete(route + '/1')
          .set('Content-Type', 'application/json');

        expect(res.status).toBe(401);
      });

    });

    // PUT /admin/trainer/{userId}
    describe('PUT /admin/trainer/{userId}', () => {
      const route: string = '/admin/trainer';

      test(`${numTest++}: should modify a trainer`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .delete(route + '/1')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(200);
      });

      test(`${numTest++}: should return a bad request error`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .delete(route + '/asd')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(400);
      });


      test(`${numTest++}: should return an unauthorize error`, async () => {
        jest.spyOn(actions, 'getTrainerById')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .delete(route + '/1')
          .set('Content-Type', 'application/json');

        expect(res.status).toBe(401);
      });

      test(`${numTest++}: should return a conflict error for email`, async () => {
        jest.spyOn(actions, 'getTrainerByEmail')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .patch(route + '/1')
          .send(trainer1)
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(409);
      });

      test(`${numTest++}: should return a conflict error for username`, async () => {
        jest.spyOn(actions, 'getTrainerByUsername')
          .mockImplementationOnce(() => Promise.resolve(trainer1));
        
        const res = await request(app)
          .patch(route + '/1')
          .send(trainer1)
          .set('Content-Type', 'application/json')
          .set('Authorization', `Basic ${basicAuthCredentials}`);

        expect(res.status).toBe(409);
      });

    });
  });

  describe ('GET /admin', () => {
    test(`${numTest++}: should send back authorization valid`, async () => {
      const res = await request(app)
        .get('/admin')
        .set('Authorization', `Basic ${basicAuthCredentials}`);

      expect(res.status).toBe(200);
    });

    test(`${numTest++}: should send back authorization invalid`, async () => {
      const res = await request(app)
        .get('/admin');
        
      expect(res.status).toBe(401);
    });
  });


});
