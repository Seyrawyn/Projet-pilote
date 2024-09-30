import request from 'supertest';
import app from '../../src/app';
import { trainers } from '../../src/models/trainers';
import { closeDbConnection, db } from '../../src/db/db';
import { eq } from 'drizzle-orm';
import { users } from '../../src/models/users';
import { trainerUserAssociation } from '../../src/models/trainerUsersRelation';
import { getUserByUsername, insertUser } from '../../src/services/user.services';
import { createTrainerUserRelation, getTrainerUser } from '../../src/services/trainer.services';
import { insertPlannedActivity } from '../../src/services/planned_activity.services';
import { planned_activities } from '../../src/models/planned_activities';

const user = {username: 'test-user', password: 'superTrainer', email: 'test.user@gmail.com', name: 'test user', dateOfBirth: '2004-02-12' };
const user1 = {id: 1, username: 'test-user1 ', password: 'superTrainer', email: 'test.user1@gmail.com', name: 'Jean' };
const user2 = {id: 2, username: 'test-user2', password: 'superTrainer', email: 'test.user2@gmail.com', name: 'Pierre' };
const user3 = {id: 3, username: 'test-user3', password: 'superTrainer', email: 'test.user3@gmail.com', name: 'Paul' };

const trainer = {id: 1, username: 'superTrainer', password: 'weak-password', email: 'trainer@hardcore.com', name: 'Mr. trainer' };

const basicAuthCredentials = Buffer.from(`${process.env.ADMIN_NAME ?? 'admin'}:${process.env.ADMIN_PASSWORD || 'defaultPassword'}`).toString('base64');

beforeAll(async () => {
  await db.delete(trainers).where(eq(trainers.username, trainer.username));
  await db.delete(users).where(eq(users.username, user.username));
  await db.delete(trainerUserAssociation);
});

afterAll(async () => {
  await db.delete(trainers).where(eq(trainers.username, trainer.username));
  await db.delete(users).where(eq(users.username, user.username));
  await db.delete(trainerUserAssociation);
  return closeDbConnection();
});

describe('Tests route POST /trainer/user/{userId}', () => {
  const route = '/trainer/user/';

  test('Should return 401 | Unauthorized', async () => {
    const res = await request(app)
      .get(route + 1);
    expect(res.status).toBe(401);
  });

  test('Should return 404 | User not found', async () => {
    // CREATE TRAINER
    await request(app)
      .post('/admin/trainer')
      .send(trainer)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${basicAuthCredentials}`);

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');
    
    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const res = await request(app)
      .post(route + 0)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
    expect(res.text).toBe('{"error":"User not found"}');
  });

  test('Should return 404 | Trainer not found', async () => {
    // CREATE User
    await request(app)
      .post('/user')
      .send(user)
      .set('Content-Type', 'application/json');

      
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');
      
    await db.delete(trainers).where(eq(trainers.username, trainer.username));
      
    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;
      
    const createdUser = await getUserByUsername(user.username);
    const res = await request(app)
      .post(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
    expect(res.text).toBe('{"error":"Trainer not found"}');
  });

  test('Should create association between user and trainer successfully', async () => {
    // Bring back deleted trainer
    await request(app)
      .post('/admin/trainer')
      .send(trainer)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${basicAuthCredentials}`);

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');
    
    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);

    const res = await request(app)
      .post(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
  });

  test('Should return a conflict relation already exist', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');
    
    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);

    const res = await request(app)
      .post(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(409);
  });
});

describe('Tests route DELETE /trainer/user/{userId}', () => {
  const route = '/trainer/user/';

  test('Should return 401 | Unauthorized', async () => {

    const res = await request(app)
      .delete(route + 0);
    expect(res.status).toBe(401);
  });

  test('Should delete relation successfully', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');
    
    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);

    const res = await request(app)
      .delete(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
  });

  test('Should return 404 | Relation not found', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');
    
    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);

    const res = await request(app)
      .delete(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
    expect(res.text).toBe('{"error":"No association to delete found"}');
  });

  test('Should return 404 | Trainer not found', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');
    
    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    await db.delete(trainers).where(eq(trainers.username, trainer.username));
    const createdUser = await getUserByUsername(user.username);

    const res = await request(app)
      .delete(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
    expect(res.text).toBe('{"error":"Trainer not found"}');
  });

  test('Should return 404 | User not found', async () => {
    // CREATE TRAINER
    await request(app)
      .post('/admin/trainer')
      .send(trainer)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${basicAuthCredentials}`);

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');
    
    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);
    await db.delete(users).where(eq(users.username, users.username));

    const res = await request(app)
      .delete(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
    expect(res.text).toBe('{"error":"User not found"}');
  });

});





// Search tests
describe('Tests route GET /trainer/users', () => {
  const route = '/trainer/users';

  test('Should return 200 and user data', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const res = await request(app)
      .get(route)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBeTruthy();
    expect(res.body.users.length).toBe(0);

  });

  test('Should return 200 and user data', async () => {

    await insertUser(user1);
    await createTrainerUserRelation(trainer.id, user1.id);

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const searchString = '';

    const res = await request(app)
      .get(`${route}?searchString=${searchString}`)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBeTruthy();
    expect(res.body.users.length).toBe(0);    // A fix

  });


  test('Should return 405 | No corresponding trainer found', async () => {
    const invalidToken = 'Bearer invalid_token';

    const res = await request(app)
      .get(route)
      .set('Authorization', invalidToken);

    expect(res.status).toBe(401);
  });

  test('Should return 401 | Unauthorized', async () => {
    const res = await request(app)
      .get(route);
    expect(res.status).toBe(401);
  });

});




describe('Tests route GET /trainer/search/users', () => {
  const route = '/trainer/search/users';


  test('Should return 200 and user data for search string', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const searchString = 'Test string';

    const res = await request(app)
      .get(`${route}?searchString=${searchString}`)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBeTruthy();
    expect(res.body.users.length).toBe(0);
  });


  // we search by name
  test('Should return 200 and user data for search string', async () => {

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const searchString = 'test-user1';

    const res = await request(app)
      .get(`${route}?searchString=${searchString}`)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBeTruthy();
    expect(res.body.users.length).toBe(1);
  });


  test('Should return 200 and user data for search string', async () => {
    
    await insertUser(user2);
    await createTrainerUserRelation(trainer.id, user2.id);

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const searchString = 'test-user2';

    const res = await request(app)
      .get(`${route}?searchString=${searchString}`)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBeTruthy();
    expect(res.body.users.length).toBe(1);
  });

  test('Should return 200 and user data for search string', async () => {

    await insertUser(user3);
    await createTrainerUserRelation(trainer.id, user3.id);

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const searchString = 'test-user3';

    const res = await request(app)
      .get(`${route}?searchString=${searchString}`)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBeTruthy();
    expect(res.body.users.length).toBe(1);
  });

  test('Should return 405 | No corresponding trainer found', async () => {
    const invalidToken = 'Bearer invalid_token';

    const res = await request(app)
      .get(route)
      .set('Authorization', invalidToken);

    expect(res.status).toBe(401);
  });

  test('Should return 401 | Unauthorized', async () => {
    const res = await request(app)
      .get(route);
    expect(res.status).toBe(401);
  });

});


describe('Tests route POST /trainer/plannedActivity/{userId}', () => {

  const route = '/trainer/plannedActivity/';
  test('Should return 400 bad request, invalid body', async () => {
    // CREATE User
    await request(app)
      .post('/user')
      .send(user)
      .set('Content-Type', 'application/json');

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);
    const res = await request(app)
      .post(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(400);
  });

  test('Should return 404 not corresponding user', async () => {

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const res = await request(app)
      .post(route + 0) // BAD USER ID
      .send({
        type: 'Running',
        date: '2024-02-26T16:30:00',
        duration: 1823,
        name: 'A run in the park',
        comment: 'Remember to focus on your breath the entire time!'
      })
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
  });


  test('Should return 200 activity successfully added', async () => {

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);

    await request(app)
      .post('/trainer/user/' + createdUser?.id)
      .set('Authorization', validToken);

    const res = await request(app)
      .post(route + createdUser?.id)
      .send({
        type: 'Running',
        date: '2024-02-26T16:30:00',
        duration: 1823,
        name: 'A run in the park',
        comment: 'Remember to focus on your breath the entire time!'
      })
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
  });
});

describe('Tests route GET /trainer/plannedActivity/{userId}', () => {

  const route = '/trainer/plannedActivity/';
  test('Should return 400 bad request, invalid param', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const res = await request(app)
      .get(route + 'badId')
      .set('Authorization', validToken);

    expect(res.status).toBe(400);
  });

  test('Should return 404 no corresponding user', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const res = await request(app)
      .get(route + 0)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
  });

  test('Should return 404 no planned activities found', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    await db.delete(planned_activities);

    const createdUser = await getUserByUsername(user.username);
    const res = await request(app)
      .get(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
  });

  test('Should return 200 activities successfully obtained', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({username: trainer.username, password: trainer.password})
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);

    await request(app)
      .post('/trainer/plannedActivity/' + createdUser?.id)
      .send({
        type: 'Running',
        date: '2024-02-26T16:30:00',
        duration: 1823,
        name: 'A run in the park',
        comment: 'Remember to focus on your breath the entire time!'
      })
      .set('Authorization', validToken);

    const res = await request(app)
      .get(route + createdUser?.id)
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
  });

});

describe('Tests route DELETE /trainer/plannedActivity/{userId}/{plannifiedId}', () => {
  const route = '/trainer/plannedActivity/';

  test('Should return 401 | Unauthorized', async () => {
    // CREATE User
    await request(app)
      .post('/user')
      .send(user)
      .set('Content-Type', 'application/json');

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({ username: trainer.username, password: trainer.password })
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);
    const res = await request(app)
      .delete(`${route}${createdUser?.id}/0`);

    expect(res.status).toBe(401);
  });

  test('Should return 404 | No corresponding user', async () => {

    const getToken = await request(app)
      .post('/auth/trainer')
      .send({ username: trainer.username, password: trainer.password })
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const res = await request(app)
      .delete(`${route}${-1}/${1}`)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
  });

  test('Should return 404 | No corresponding planned activity', async () => {
    
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({ username: trainer.username, password: trainer.password })
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);

    const res = await request(app)
      .delete(`${route}${createdUser?.id}/0`)
      .set('Authorization', validToken);

    expect(res.status).toBe(404);
  });

  test('Should return 200 | Planned activity deleted successfully', async () => {
    const getToken = await request(app)
      .post('/auth/trainer')
      .send({ username: trainer.username, password: trainer.password })
      .set('Content-Type', 'application/json');

    const { token } = getToken.body;
    const validToken = `Bearer ${token}`;

    const createdUser = await getUserByUsername(user.username);
    const userId = createdUser?.id;

    await request(app)
      .post('/trainer/user/' + createdUser?.id)
      .set('Authorization', validToken);

    const res = await request(app)
      .post(route + createdUser?.id)
      .send({
        type: 'Running',
        date: '2024-02-26T16:30:00',
        duration: 1823,
        name: 'A run in the park',
        comment: 'Remember to focus on your breath the entire time!'
      })
      .set('Authorization', validToken);

    expect(res.status).toBe(200);
    const plannedActivityId = res.body.activityId;

    const res2 = await request(app)
      .delete(`${route}${userId}/${plannedActivityId}`)
      .set('Authorization', validToken);

    expect(res2.status).toBe(200);

  });
});
