import { closeDbConnection, db } from '../../src/db/db';
import { users } from '../../src/models/users';
import { desc, eq, and } from 'drizzle-orm';
import request from 'supertest';
import app from '../../src/app';
import {notifications} from "../../src/models/notifications";
import {insertPlannedActivity} from "../../src/services/planned_activity.services";
import {planned_activities, PlannedActivity} from "../../src/models/planned_activities";
import { describe } from 'node:test';
import { deleteExpiredNotifications } from '../../src/services/notifications.services';
import expressBasicAuth from 'express-basic-auth';

const user = {
  username: 'test-user',
  password: 'TestUser1234',
  email: 'test@test.com',
  name: 'Test',
  dateOfBirth: '2004-02-12',
};

let auth_token: string;

beforeAll(async () => {
  // Cleans DB
  await db.delete(notifications);
  await db.delete(planned_activities);
  await db.delete(users);
  // Create user
  await request(app).post('/user').send(user);

  // Get auth token
  auth_token = (await request(app).post('/auth').send(user)).body['token'];
});

afterAll(async () => {
  // Cleans DB
  await db.delete(notifications);
  await db.delete(planned_activities);
  await db.delete(users);
  return closeDbConnection();
});

// Mark as read
describe('PATCH Notifications', async () => {
  const pActivityRoute = '/plannedactivities';
  const route = '/notifications/';
  const pActivityId = '666';

  test('Should return 401: Unauthorized', async () => {
    const res = await request(app)
      .patch(route + pActivityId);
    expect(res.status).toBe(401);
  });

  test('Should return empty notification', async () => {
    const res = await request(app)
      .patch(route + pActivityId)
      .set('Authorization', 'Bearer ' + auth_token);
    expect(res.body).toMatchObject({ updatedNotification: [] });
  });

  test('Should return notification with field is_read=true', async () => {
    const pActivity = {
      type: 'Running',
      date: `2024-02-12 16:30:00`,
      duration: 3600,
      name: 'A run in the park',
      comment: 'Remember to focus on your breath the entire time!'
    };

    // Create pActivity + notification
    const responsePost = await request(app)
      .post(pActivityRoute)
      .send(pActivity)
      .set('Authorization', 'Bearer ' + auth_token);

    const tmpActivityId = responsePost.body.id

    const responsePatchNotif = await request(app)
      .patch(route + tmpActivityId)
      .set('Authorization', 'Bearer ' + auth_token);

    expect(responsePatchNotif.body).toEqual({
      updatedNotification: [expect.objectContaining({
        is_read: true
      })]
    });
  });
});

describe('GET Notifications', () => {
  const route = '/notifications';

  test('Should return 401: Unauthorized', async () => {
    const res = await request(app)
      .get(route);
    expect(res.status).toBe(401);
  });

  test('Should return nothing', async () => {
    const res = await request(app)
      .get(route)
      .set('Authorization', 'Bearer ' + auth_token);
    expect(res.body).toMatchObject({ notifications: [] });
  });

  test('Should return notifications', async () => {
    const userid = (await db.select().from(users).where(eq(users.username, user.username)))[0].id;

    // create base data not relevant to this test
    const baseData: Pick<PlannedActivity, "type" | "duration" | "name" | "comment"> = {
      type: "Running",
      duration: 10,
      name: "runny",
      comment: "",
    };

    // insert a plannedActivity 10 seconds from now (should be included in result)
    const tenSecondsFromNow = Date.now() + 10 * 1000;
    const tenSecondsFromNowID = await insertPlannedActivity({
      ...baseData,
      name: "tenSecondsFromNow",
      user_id: userid,
      date: new Date(tenSecondsFromNow),
    });

    // insert a plannedActivity 10 seconds ago (should not be included in result)
    const tenSecondsAgo = Date.now() - 10 * 1000;
    await insertPlannedActivity({
      ...baseData,
      user_id: userid,
      date: new Date(tenSecondsAgo),
    });

    // insert a plannedActivity 24H + 60 seconds from now (should be included in result)
    const moreThenADayFromNow = Date.now() + 24 * 60 * 60 * 1000 + 60 * 1000;
    const moreThenADayFromNowID = await insertPlannedActivity({
      ...baseData,
      name: "moreThenADayFromNow",
      user_id: userid,
      date: new Date(moreThenADayFromNow),
    });

    // insert a plannedActivity 48h hours from now (should not be included in result)
    const twoDaysFromNow = Date.now() + 48 * 60 * 60 * 1000;
    await insertPlannedActivity({
      ...baseData,
      user_id: userid,
      date: new Date(twoDaysFromNow),
    });

    // send request
    const res = await request(app)
      .get(route)
      .set('Authorization', 'Bearer ' + auth_token);
    expect(res.statusCode).toBe(200);

    // make sure only 2 notifications are returned
    const notifications: {plannedActivityID: number, name: string | null, date: Date, isRead: boolean}[] = res.body.notifications;
    expect(notifications.length).toBe(2);

    // validate notification 10 sec from now
    const tenSecondsFromNowNotif = notifications.find((notification)=> notification.plannedActivityID === tenSecondsFromNowID);
    expect(tenSecondsFromNowNotif).toBeTruthy();
    expect(tenSecondsFromNowNotif?.plannedActivityID).toBe(tenSecondsFromNowID);
    expect(tenSecondsFromNowNotif?.name).toBe("tenSecondsFromNow");

    // validate notification 24h + 60 sec from now
    const moreThenADayFromNowNotif = notifications.find((notification)=> notification.plannedActivityID === moreThenADayFromNowID);
    expect(moreThenADayFromNowNotif).toBeTruthy();
    expect(moreThenADayFromNowNotif?.plannedActivityID).toBe(moreThenADayFromNowID);
    expect(moreThenADayFromNowNotif?.name).toBe("moreThenADayFromNow");
  });
});

describe('Delete expired notifications', async () => {
  const pActivityRoute = '/plannedactivities';

  test('Should delete notifications where pActivity date is expired', async () => {
    const pActivity = {
      type: 'Running',
      date: `2024-02-12 16:30:00`, // Expired date
      duration: 3600,
      name: 'A run in the park',
      comment: 'Remember to focus on your breath the entire time!'
    };

    const today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));

    // Create pActivity + notification
    const responsePost = await request(app)
      .post(pActivityRoute)
      .send(pActivity)
      .set('Authorization', 'Bearer ' + auth_token);

    const tmpActivityId = responsePost.body.id;
    const activity = await request(app)
      .get("/plannedactivities/" + tmpActivityId)
      .set('Authorization', 'Bearer ' + auth_token);

    const userId = activity.body.plannedActivity.user_id;

    await deleteExpiredNotifications(yesterday);

    const notification = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.planned_activity_id, tmpActivityId),
        eq(notifications.user_id, userId)
      ));

    expect(notification).toEqual([]);
  });

  test('Shoud NOT delete current days notifications', async () => {
    const pActivity = {
      type: 'Running',
      date: `2024-04-12 16:30:00`, // NOT expired date
      duration: 3600,
      name: 'A run in the park',
      comment: 'Bla-bla-bla'
    };

    const today = new Date(2024, 3, 12); // 0 indexed donc 3 => 4
    const yesterday = new Date(today.setDate(today.getDate() - 1)); // Day before pActivity

    // Create pActivity + notification
    const responsePost = await request(app)
      .post(pActivityRoute)
      .send(pActivity)
      .set('Authorization', 'Bearer ' + auth_token);

    const tmpActivityId = responsePost.body.id;
    const activity = await request(app)
      .get("/plannedactivities/" + tmpActivityId)
      .set('Authorization', 'Bearer ' + auth_token);

    const userId = activity.body.plannedActivity.user_id;

    const notification = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.planned_activity_id, tmpActivityId),
        eq(notifications.user_id, userId)
      ));

    await deleteExpiredNotifications(yesterday);

    expect(notification).toEqual(
      [{ 
        user_id: userId,
        planned_activity_id: tmpActivityId,
        is_read: false
      }]
    );
  })
});
