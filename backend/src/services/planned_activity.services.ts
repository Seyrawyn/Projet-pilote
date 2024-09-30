import { planned_activities, PlannedActivity } from '../models/planned_activities';
import { db } from '../db/db';
import {eq, and, SQL} from 'drizzle-orm';
import {Notification, notifications} from "../models/notifications";

export const deletePlannedActivityById = async (activityId: number, userId: number) => {
  return await db.delete(planned_activities)
    .where(
      and(
        eq(planned_activities.id, activityId),
        eq(planned_activities.user_id, userId)
      )
    );
};

export const selectPlannedActivityById = async (activityId: number, userId: number) => {
  return await db.select()
    .from(planned_activities)
    .where(
      and(
        eq(planned_activities.id, activityId),
        eq(planned_activities.user_id, userId)
      )
    )
    .limit(1);
};

export const getPlannedActivitiesById = async ( userId: number) => {
  return await db.select()
    .from(planned_activities)
    .where(eq(planned_activities.user_id, userId));
};

export const updatePlannedActivityById = async (userId: number, pActivityId: number, plannedActivity: Partial<PlannedActivity>) => {
  return await db.update(planned_activities)
    .set(plannedActivity)
    .where(and(
      eq(planned_activities.user_id, userId),
      eq(planned_activities.id, pActivityId)
    ));
};

export const setActivityId = async (userId: number, pActivityId: number, ActivityId: number) => {
  return await db.update(planned_activities)
    .set({ activity_id: ActivityId })
    .where(and(
      eq(planned_activities.user_id, userId),
      eq(planned_activities.id, pActivityId)
    ));
};

export const insertPlannedActivity = async (plannedActivity: PlannedActivity) => {
  // transaction for an atomic operation
  return db.transaction(async (tx)=>{
    // insert new activity in planned_activities
    const insertResult = await db.insert(planned_activities).values([{...plannedActivity}]);
    if(!insertResult){
      tx.rollback();
      return;
    }

    // create an associated notification
    const newActivityId = insertResult[0].insertId;
    await db.insert(notifications).values([{
      user_id: plannedActivity.user_id,
      planned_activity_id: newActivityId,
      is_read: false,
    }]);
    return newActivityId;
  })
};

export const getPlannedActivitiesFromConditions = async (conditions:  SQL<unknown>[]) => {
  return await db.select()
    .from(planned_activities)
    .where(and(...conditions));
};
