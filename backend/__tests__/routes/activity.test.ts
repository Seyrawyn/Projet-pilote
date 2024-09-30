import request from 'supertest';
import app from '../../src/app';
import {User, users} from '../../src/models/users';
import bcrypt from 'bcrypt';
import { verifyUserToken } from '../../src/middlewares/authentication';
import {Request, Response} from 'express';
import * as actions from '../../src/services/user.services';
import {activities} from '../../src/models/activities';
import {closeDbConnection, db} from '../../src/db/db';
import {eq} from 'drizzle-orm';

const user = {
  username: 'test-user',
  password: 'Testuser1234',
  email: 'test@test.com',
  name: 'Test',
  dateOfBirth: '2004-02-12',
};

const activity = {
  name: 'test',
  city: 'San Francisco',
  type: 'Running',
  date: '2024-02-28 15:45:00.123456',
  durationTotal: 30,
  distanceTotal: 7.5,
  comment: 'Felt good!',
};

const route : string = '/protected-route';
let getToken;

// the value returned by the mocked functions getUserByUsername and getUserById
let returnedUser: User;

// Example of protected route
app.use(route, verifyUserToken, (req: Request, res: Response) => {
  return res.json({
    msg: `Access to protected route granted. Your id is ${req.user?.userId}`});
});

jest.mock('../../src/services/user.services');

beforeAll(async () => {
  await db.delete(activities).where(eq(activities.user_id, 1));
  await db.delete(users).where(eq(users.id, 1));

  const hashedPassword = await bcrypt.hash(user.password, 10);
  returnedUser = {id: 1, username: user.username, password: hashedPassword, email: user.email, name: user.name, dateOfBirth: user.dateOfBirth};
});

afterAll(async () => {
  await db.delete(activities).where(eq(activities.user_id, 1));
  await db.delete(users).where(eq(users.id, 1));
  return closeDbConnection();
});


describe('POST activity', () => {
  jest.spyOn(actions, 'getUserByUsername').mockImplementation(() => Promise.resolve(returnedUser));
  const route_creation : string = '/activity/manual';
  const route_reception : string = '/activity/getActivity';

  test('#1 Should create a new activity', async () => {
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);

    expect(res.statusCode).toBe(201);
  });

  test('#2 Should not work because not authenticated', async () => {
    const res = await request(app)
      .post(route_creation)
      .send(activity);

    expect(res.statusCode).toBe(401);
  });

  test('#3 Should not create because of name', async () => {
    const activity = {
      name: 'this is a text of 257 characters: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget turpis eu ligula ultricies fringilla. Nullam sed varius dui. Curabitur euismod, est ac venenatis eleifend, sapien purus varius justo, eget varius velit elit.',
      city: 'San Francisco',
      type: 'Running',
      date: '2024-02-28 15:45:00.123456',
      durationTotal: 30,
      distanceTotal: 7.5,
      comment: 'Felt good!',
    };
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);
    expect(res.text).toEqual('{"message":"Name is required and must be between 3 and 256 characters"}');
    expect(res.statusCode).toBe(400);
  });

  test('#4 Should not create because of type', async () => {
    const activity = {
      name: 'test',
      city: 'San Francisco',
      type: 'Swimming',
      date: '2024-02-28 15:45:00.123456',
      durationTotal: 30,
      distanceTotal: 7.5,
      comment: 'Felt good!',
    };
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);
    expect(res.text).toEqual('{"message":"Type is required and must be one of the following: Running, Biking, Walking"}');
    expect(res.statusCode).toBe(400);
  });

  test('#5 Should not create because of date', async () => {
    const activity = {
      name: 'test',
      city: 'San Francisco',
      type: 'Running',
      date: '2024-0-28 15:45:00.123456',
      durationTotal: 30,
      distanceTotal: 7.5,
      comment: 'Felt good!',
    };
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);
    expect(res.statusCode).toBe(400);
  });

  test('#6 Should not create because of durationTotal', async () => {
    const activity = {
      name: 'test',
      city: 'San Francisco',
      type: 'Running',
      date: '2024-02-28 15:45:00.123456',
      durationTotal: -1,
      distanceTotal: 7.5,
      comment: 'Felt good!',
    };
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);
    expect(res.text).toEqual('{"message":"DurationTotal must be a non-negative and non-null number"}');
    expect(res.statusCode).toBe(400);
  });

  test('#7 Should recover all activities information in the database', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(route_reception)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.userActivities.length).toEqual(1);
  });

  test('#8 Should create a new activity', async () => {
    const activity = {
      name: 'test #2',
      city: 'San Francisco',
      type: 'Running',
      date: '2024-02-28 15:45:00.123456',
      durationTotal: 30,
      distanceTotal: 7.5,
      comment: 'Felt good!',
    };

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);

    expect(res.statusCode).toBe(201);
  });

  test('#9 Should recover all activities information in the database', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(route_reception)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.userActivities.length).toEqual(2);
  });
});

describe('get all activities', () => {
  const route_reception : string = '/activity/getActivity';

  test('should recover all activities information in the database', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(route_reception)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.userActivities.length).toEqual(2);
  });
});

describe('get specified activities', () => {
  const route_creation : string = '/activity/manual';
  const route_reception_unique : string = '/activity/getSpecifiedActivities';

  test('#1 Should recover searched activities', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(0);
  });

  test('#2 Should create a new activity', async () => {
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);

    expect(res.statusCode).toBe(201);
  });

  test('#3 Should create a new activity', async () => {
    const activity = {
      name: 'Morning',
      city: 'San Francisco',
      type: 'Running',
      date: '2022-04-13T13:00:00Z',
      durationTotal: 30,
      distanceTotal: 7.5,
      comment: 'Felt good!',
    };

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);

    expect(res.statusCode).toBe(201);
  });

  test('#4 Should recover searched activities by name', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#X Should recover searched activities by date', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?specificDate=2022-04-13T13:00:00Z`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#5 Should recover searched activities by distance', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?specificDistance=7.5`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(4);
  });


  test('#6 Should recover searched activities by duration', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?specificDuration=30`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(4);
  });

  test('#7 Should recover searched activities by name and distance', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning&specificDistance=7.5`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#8 Should recover searched activities by name and duration', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning&specificDuration=30`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#9 Should recover searched activities by name, distance and duration', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning&specificDuration=30&specificDistance=7.5`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#X Should recover searched activities by date range', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?startDate=2022-03-13T13:00:00Z&endDate=2022-05-13T13:00:00Z`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#10 Should recover searched activities by name and distance range', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning&startDistance=5&endDistance=8`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#11 Should recover searched activities by name and duration range', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning&startDuration=20&endDuration=40`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#12 Should recover searched activities by name, duration range and distance range', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning&startDistance=5&endDistance=8&startDuration=20&endDuration=40`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#X Should recover searched activities by name, date range, duration range and distance range', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?search=Morning&startDistance=5&endDistance=8
          &startDuration=20&endDuration=40&startDate=2022-03-13T13:00:00Z&endDate=2022-05-13T13:00:00Z`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.activities.length).toEqual(1);
  });

  test('#13 Should not recover searched activities with a bad date', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?specificDate=2028`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#14 Should not recover searched activities with a bad distance', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?specificDistance=-1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#15 Should not recover searched activities with a bad duration', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?specificDuration=-1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#16 Should not recover searched activities with a bad distances intervals', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?startDistance=bad distance&endDistance=23`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#X Should not recover searched activities with a bad dates intervals', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?startDate=bad date&endDate=2022-05-13T13:00:00Z`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#17 Should not recover searched activities with a bad distances intervals', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?startDistance=8&endDistance=b`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#18 Should not recover searched activities with a bad durations intervals', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?startDuration=a&endDuration=21`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#19 Should not recover searched activities with both distances intervals not filled', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?startDistance=5`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#X Should not recover searched activities with both date intervals not filled', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?endDate=2022-05-13T13:00:00Z`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  test('#X Should not recover searched activities with both duration intervals not filled', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(`${route_reception_unique}?endDuration=23`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

});

describe('GPX file related test', () => {
  test('Right GPX', async () => {
    const gpxFile = gpxFileWorking;
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');

    const { token } =  getToken.body;

    const res = await request(app)
      .post('/activity/gpxForm')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Nom de l\'activiter').field('type', 'Running').field('comment', 'Activity from unity test')
      .attach('file', Buffer.from(gpxFile), 'activity.gpx');

    expect(res.statusCode).toBe(200);
  });

  test('Wrong GPX', async () => {
    const gpxFile = gpxFileWrong;

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');

    const { token } =  getToken.body;

    const res = await request(app)
      .post('/activity/gpxForm')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Nom de l\'activiter').field('type', 'Running').field('comment', 'Activity from unity test')
      .attach('file', Buffer.from(gpxFile), 'activity.gpx');

    expect(res.statusCode).toBe(400);
  });
});

describe('Delete activity', () => {
  const route_deletion : string = '/activity/suppression/';
  const route_reception : string = '/activity/getActivity';
  const route_creation : string = '/activity/manual';

  test('#1 Should create a new activity', async () => {
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);

    expect(res.statusCode).toBe(201);
  });

  test('#2 Should recover all activities information in the database', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(route_reception)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.userActivities.length).toBeGreaterThan(0);
  });

  test('#3 Should delete every activity of the test user', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res_request = await request(app)
      .get(route_reception)
      .set('Authorization', `Bearer ${token}`);


    for (let i = 0; i < res_request.body.userActivities.length - 1; i++) {
      await request(app)
        .delete(route_deletion + res_request.body.userActivities[i].id)
        .set('Authorization', `Bearer ${token}`);
    }

    const res = await request(app)
      .delete(route_deletion + res_request.body.userActivities[res_request.body.userActivities.length - 1].id)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
  });

  test('#4 Should recover all activities information in the database', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .get(route_reception)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.userActivities.length).toEqual(0);
  });

});


describe('Modify activity', () => {
  const routeModification = '/activity/updateActivity';
  const route_reception : string = '/activity/getActivity';
  const route_creation : string = '/activity/manual';

  test('#1 Should create a new activity', async () => {
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;

    const res = await request(app)
      .post(route_creation)
      .set('Authorization', `Bearer ${token}`)
      .send(activity);

    expect(res.statusCode).toBe(201);
  });

  test('#2 Should return 400 or 404 for invalid activityId on modification', async () => {
    getToken = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } =  getToken.body;
  
    const invalidActivityId = 'nonExistentId'; 
    const updateResponse = await request(app)
      .put(`/updateActivity/${invalidActivityId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        name: 'Updated Activity',
        city: 'New City',
        type: 'running',
        date: '2022-12-31',
        durationTotal: 120,
        distanceTotal: 15,
        comment: 'Felt even better!'
      });

    expect([400, 404]).toContain(updateResponse.statusCode);
  });
  
  test('#3 Should successfully create and then modify an activity', async () => {
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));

    const getTokenResponse = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } = getTokenResponse.body;
    const resRequest = await request(app)
      .get(route_reception)
      .set('Authorization', `Bearer ${token}`);
    const updateData = {
      name: 'Updated Activity Name',
      city: 'New City',
      type: 'cycling',
      date: '2023-01-01',
      durationTotal: 120,
      distanceTotal: 30,
      comment: 'This is an updated comment for the activity.'
    };
    for (let i = 0; i < resRequest.body.userActivities.length; i++) {
      const updateResponse = await request(app)
        .put(`${routeModification}/${resRequest.body.userActivities[i].id}`)
        .send(updateData) 
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json'); 
      expect(updateResponse.statusCode).toEqual(200);
    }
  });
  
  test('#4 Should return 404 when trying to modify a non-existent activity', async () => {
    const nonExistentActivityId = '99999'; 
    const updateData = {
      name: 'Updated Activity Name',
      city: 'New City',
      type: 'cycling',
      date: '2023-01-01',
      durationTotal: 120,
      distanceTotal: 30,
      comment: 'This is an updated comment for the activity.'
    };
    jest.spyOn(actions, 'getUserById').mockImplementationOnce(() => Promise.resolve(returnedUser));
  
    const getTokenResponse = await request(app)
      .post('/auth')
      .send(user)
      .set('Content-Type', 'application/json');
    const { token } = getTokenResponse.body;
  
    const resRequest = await request(app)
      .get(route_reception)
      .set('Authorization', `Bearer ${token}`);
  
    const updateResponse = await request(app)
      .put(`${routeModification}/${nonExistentActivityId}`)
      .send(updateData) 
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    expect(updateResponse.statusCode).toBe(404);
    expect(updateResponse.body.error).toBe('Activity not found');
  });
});



export const gpxFileWorking = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="AI Assistant">
  <metadata>
    <name>Example GPX</name>
    <desc>This is an example GPX file</desc>
  </metadata>
  <trk>
    <name>Example track</name>
    <trkseg>
      <trkpt lat="47.644548" lon="-122.326897">
        <ele>4.46</ele>
        <time>2009-10-17T18:36:26Z</time>
      </trkpt>
      <trkpt lat="47.644548" lon="-122.326897">
        <ele>4.94</ele>
        <time>2009-10-17T18:37:26Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

export const gpxFileWrong = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="AI Assistant">
  <metadata>
    <name>Example GPX</name>
    <desc>This is an example GPX file</desc>
  </metadata>
  <trk>
    <name>Example track</name>
    <trkseg>
      <trkpt lat="47.644548" lon="-122.326897">
        <ele>4.46</ele>
        <time>2009-10-17T18:36:26Z</time>
      </trkpt>
      <trkpt lat="47.644548" lon="-122.326897">
        <ele>4.94</ele>
        <time>2009-10-17T18:37:26Z</time>
      </trkpt>
    </trkseg>
  </trk>`;
