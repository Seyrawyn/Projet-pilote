import { closeDbConnection, db } from '../../src/db/db';
import { users } from '../../src/models/users';
import { activities } from '../../src/models/activities';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import app from '../../src/app';

const user = {
  username: 'test-user',
  password: 'TestUser1234',
  email: 'test@test.com',
  name: 'Test',
  dateOfBirth: '2004-02-12',
};

const activity = {
  name: 'test',
  city: 'San Francisco',
  type: 'Running',
  date: '2024-01-01 15:45:00.123456',
  durationTotal: 30,
  distanceTotal: 7.5,
  comment: 'Felt good!',
};

let auth_token: string;

beforeAll(async () => {
  // Cleans DB
  await db.delete(activities);
  await db.delete(users);
  // Create user
  const createRes = await request(app).post('/user').send(user);
  const userRes = (await db.select().from(users).where(eq(users.username, user.username)))[0].id;

  // Get auth token
  auth_token = (await request(app).post('/auth').send(user)).body['token'];
});

afterAll(async () => {
  // Cleans DB
  await db.delete(activities);
  await db.delete(users);
  return closeDbConnection();
});

describe('GET Statistics', () => {

  const route: string = '/statistics';
  const activityRoutePOST : string = '/activity/manual';
  const date = '2024-01-01';
  const noItemsDate = '2025-01-01';

  test('Should return 401: Unauthorized', async () => {
    const res = await request(app)
      .get(route);
    expect(res.status).toBe(401);
  });

  test('Should return nothing', async () => {
    const res = await request(app)
      .get(route)
      .query({
        date: noItemsDate,
      })
      .set('Authorization', 'Bearer ' + auth_token);
    expect(res.body).toMatchObject({ activities: [] });
  });

  test('Should return 200', async () => {

    await request(app)
      .post(activityRoutePOST)
      .send(activity)
      .set('Authorization', 'Bearer ' + auth_token);

    const res = await request(app)
      .get(route)
      .query({
        date,
      })
      .set('Authorization', 'Bearer ' + auth_token);

    expect(res.statusCode).toBe(200);
  });

  test('Should return activity statistics', async () => {

    await request(app)
      .post(activityRoutePOST)
      .send(activity)
      .set('Authorization', 'Bearer ' + auth_token);

    const res = await request(app)
      .get(route)
      .query({
        date: date,
        type: 'Running'
      })
      .set('Authorization', 'Bearer ' + auth_token);

    expect(res.body).toEqual({
      activities: expect.arrayContaining([
        expect.objectContaining({
          durationTotal: 30,
          distanceTotal: 7.5,
          type: 'Running'
        })
      ])
    });
  });
  test('Should return nothing', async () => {

    await request(app)
      .post(activityRoutePOST)
      .send(activity)
      .set('Authorization', 'Bearer ' + auth_token);

    const res = await request(app)
      .get(route)
      .query({
        date: date,
        type: 'Biking'
      })
      .set('Authorization', 'Bearer ' + auth_token);


    expect(res.body).toMatchObject({ activities: [] });
  });

});
