import { db } from '../db/db';
import {and, eq, gte, lte, sql} from 'drizzle-orm';
import {planned_activities, PlannedActivity} from "../models/planned_activities";
import {notifications} from "../models/notifications";

// return a list of upcoming notifications for the remaining of the current day and the next day
export const getUpcomingNotifications = async (userId: number) => {
  // start time is current time
  const start = new Date();

  // end time is the end of tomorrow
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 2);

  // create and array of all conditions
  const conditions = [
    eq(planned_activities.user_id, userId),
    gte(planned_activities.date, start),
    lte(planned_activities.date, end),
  ]

  // join plannedActivities of user with the notification table
  return db.select({
    plannedActivityID: planned_activities.id,
    name: planned_activities.name,
    date: planned_activities.date,
    isRead: notifications.is_read,
  }).from(planned_activities).where(and(...conditions))
    .innerJoin(notifications, eq(notifications.planned_activity_id, planned_activities.id));
};

export const markAsRead = async (userId: number, pActivityId: number) => {
  await db.update(notifications)
    .set({ is_read: true})
    .where(and(
      eq(notifications.user_id, userId),
      eq(notifications.planned_activity_id, pActivityId)
    ))

  return await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.planned_activity_id, pActivityId)))
}

export const deleteExpiredNotifications = async (yesterday: Date) => {
  const expiredPlannedActivities = await db.select()
    .from(planned_activities)
    .where(
      lte(planned_activities.date, yesterday)
    )

  for(const expiredPlannedActivity of expiredPlannedActivities) {
    await db.delete(notifications)
      .where(and(
        eq(notifications.user_id, expiredPlannedActivity.user_id),
        eq(notifications.planned_activity_id, expiredPlannedActivity.id)
      ))
  }
};
