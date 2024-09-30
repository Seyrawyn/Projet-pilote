import { NextFunction, Request, Response } from 'express';
import { planned_activities, PlannedActivity } from '../models/planned_activities';
import { User } from '../models/users';
import { getUserById } from '../services/user.services';
import { getActivityById } from '../services/activity.services'
import { eq, gte, lte } from 'drizzle-orm';
import {
  deletePlannedActivityById,
  selectPlannedActivityById,
  updatePlannedActivityById,
  insertPlannedActivity,
  getPlannedActivitiesFromConditions,
  setActivityId,
} from '../services/planned_activity.services';

export const getPlannedActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const user: User | undefined = await getUserById(userId);

    if (!user) {
      // Can only happen in very tight race condition OR if token was forged
      // Maybe it should be removed, confusing
      return res.status(404).json({ error: 'No corresponding user' });
    }

    // check for from in query param and validate
    let fromDate: Date | null = null;
    if (req.query.from) {
      fromDate = new Date(req.query.from.toString());
      if (isNaN(fromDate.getTime()))
        return res.status(400).json({ error: 'Invalid from date format. Please use YYYY-MM-DD.' });
    }else{
      return res.status(400).json({ error: 'Query parameter from is required.' });
    }

    // check for activity type in query param and validate
    let activityType: 'Running' | 'Walking' | 'Biking' | null = null;
    if (req.query.type) {
      const possibleTypes: string[] = ['Running', 'Walking', 'Biking'];
      if (!possibleTypes.includes(req.query.type as string))
        return res.status(400).json({ error: 'Invalid activity type. Please use a type that is either Running, Walking or Biking' });
      activityType = req.query.type as 'Running' | 'Walking' | 'Biking';
    }

    // conditions will be added in the where clause in the sql query
    const conditions = [eq(planned_activities.user_id, <number>user.id)];

    // only query for a 7-day period [fromDate, fromDate + 7 days]
    const endDate = new Date(fromDate);
    endDate.setDate(endDate.getDate() + 7);
    conditions.push(gte(planned_activities.date, fromDate));
    conditions.push(lte(planned_activities.date, endDate));

    // add activity type filter if present
    if (activityType) {
      conditions.push(eq(planned_activities.type, activityType));
    }

    const plannedActivities = await getPlannedActivitiesFromConditions(conditions);

    return res.status(200).json({ plannedActivities });

  } catch (error) {
    next(error);
  }
};

export const modifyPlannedActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const pActivityId = Number(req.params?.pActivityId);

    const user: User | undefined = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'No corresponding user' });
    }

    const activitiesToDelete = await selectPlannedActivityById(pActivityId, userId);
    if (activitiesToDelete.length !== 1) {
      return res.status(404).json({ error: "No corresponding activity" });
    }

    let { type, date, duration, name, comment } = req.body;
    const updatedPlannedActivity: Partial<PlannedActivity> = {};


    const validTypes = ['Running', 'Biking', 'Walking'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ message: `Type must be one of the following: ${validTypes.join(', ')}` });
    }

    // Name dafault value
    if (!name || name.length == 0) {
      name = type.toString();
    }

    // Comment default value
    if (!comment) {
      comment = '';
    }

    updatedPlannedActivity.type = type;
    updatedPlannedActivity.date = new Date(date);
    updatedPlannedActivity.duration = duration;
    updatedPlannedActivity.name = name;
    updatedPlannedActivity.comment = comment;

    await updatePlannedActivityById(userId, pActivityId, updatedPlannedActivity);

    // Returns updated activity
    const plannedActivity = (await selectPlannedActivityById(pActivityId,userId))[0];

    return res.status(201).json({ plannedActivity });

  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Used only to set activity_id
export const setActivityIdInPlannedActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const pActivityId = Number(req.params?.pActivityId);
    const activityId = Number(req.body.activity_id);

    // Check for valid user
    const user: User | undefined = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Invalid user' });
    }

    // Check for valid planned_activity id
    const pActivity = await selectPlannedActivityById(pActivityId, userId);
    if (pActivity.length !== 1) {
      return res.status(404).json({ error: 'Invalid planned activity id' });
    }

    // Check for valid activity id
    const activity = await getActivityById(activityId, userId);
    if (activity.length !== 1) {
      return res.status(404).json({ error: 'Invalid activity id' });
    }

    
    const updatedPActivity = await setActivityId(userId, pActivityId, activityId);
    return res.status(201).json({ message: "Activity id updated successfully" });

  } catch (error) {
    next(error);
  }
};

export const getPlannedActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const user: User | undefined = await getUserById(userId);
    const pActivityId = Number(req.params?.pActivityId);

    const [plannedActivity] = await selectPlannedActivityById(pActivityId,userId);

    if (!plannedActivity) {
      return res.status(404).json({ message: 'No corresponding planned activity found' });
    }

    return res.status(200).json({ plannedActivity });

  } catch (error) {
    next(error);
  }
};

export const createPlannedActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { type, date, duration, name, comment } = req.body;

    // Type validation
    const validTypes = ['Running', 'Biking', 'Walking'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ message: `Type must be one of the following: ${validTypes.join(', ')}` });
    }

    // Name dafault value
    if (!name || name.length == 0) {
      name = type.toString();
    }

    // Comment default value
    if (!comment) {
      comment = '';
    }

    date = new Date(date);

    const userId = req.user?.userId as number;
    const insertedId = await insertPlannedActivity({
      user_id: userId,
      type,
      date,
      duration,
      name,
      comment,
    });

    if (!insertedId) {
      // handle the error or throw an error
      throw new Error('Database insertion failed.');
    }

    return res.status(201).json({
      message: 'Planned Activity added successfully',
      id: insertedId
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deletePlannedActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const activityId = parseInt(req.params.activityId);

    // check if the activityId is a number
    if (!activityId || isNaN(activityId)) {
      return res.status(400).json({ error: "Invalid activityId" });
    }
    const activitiesToDelete = await selectPlannedActivityById(activityId, userId);

    if (activitiesToDelete.length !== 1) {
      return res.status(404).json({ error: "No corresponding activity" });
    }

    await deletePlannedActivityById(activityId, userId);
    res.status(200).json({ message: "Activity deleted successfully" });

  } catch (error) {
    next(error);
  }
};

