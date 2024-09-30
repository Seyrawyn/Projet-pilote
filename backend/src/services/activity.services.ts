import { db } from '../db/db';
import {and, eq} from 'drizzle-orm';
import {activities, Activity} from '../models/activities';


export const getActivityById = async (activityId: number, userId: number) => {
  return await db.select()
    .from(activities)
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.user_id, userId)
      )
    )
    .limit(1);
};

export const getUserActivities = async (userId: number) => {
  return await db.select()
    .from(activities)
    .where(eq(activities.user_id, userId));
};

export const updateActivityById = async  (activityId: number, userId: number, activity: Partial<Activity>) => {
  return await db.update(activities)
    .set(activity)
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.user_id, userId)
      )
    );
};

export const deleteActivityById = async (activityId: number, userId: number) => {
  return await db.delete(activities)
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.user_id, userId)
      )
    );
};

export const updateSegmentsById = async  (activityId: number, userId: number, updatedSegments : any[]) => {
  return db.update(activities)
    .set({segments: [{ trkpt : updatedSegments}]})
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.user_id, userId)
      )
    );
};


/*
export const getWeeklyActivities = async (date: Date, userId: number) => {

  return await db.delete(activities)
    .where(
      and(
        eq(activities.user_id, userId),
        eq(activities.)
      )
    );
}
*/
