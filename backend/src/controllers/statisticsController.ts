import { NextFunction, Request, Response } from 'express';
import { User } from '../models/users';
import { getUserById } from '../services/user.services';
import { getActivitiesByMonth } from '../services/statistics.services';

export const getMonthlyActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId as number;
      const user: User | undefined = await getUserById(userId);

      if (!user) {
        // Can only happen in very tight race condition OR if token was forged
        return res.status(404).json({ error: 'No corresponding user' });
      }

      let fromDate: Date | null = null;
      if (req.query.date) {
        fromDate = new Date(req.query.date.toString());
        if (isNaN(fromDate.getTime())) 
          return res.status(400).json({ error: 'Invalid from date format. Please use YYYY-MM-DD.' });
      } 
      else {
        return res.status(400).json({ error: 'Query parameter from is required.' });
      }

      // check if activity type is present in query param and validate
      let activityType: 'Running' | 'Walking' | 'Biking' | null = null;
      if (req.query.type) {
        const possibleTypes = ['Running', 'Walking', 'Biking'];
        if (!possibleTypes.includes(req.query.type as string))
          return res.status(400).json({ error: 'Invalid activity type. Please use a type that is either Running, Walking or Biking' });
        activityType = req.query.type as 'Running' | 'Walking' | 'Biking';
      }

      const result = await getActivitiesByMonth(fromDate, userId, activityType);
      // const result = await getActivitiesByMonth(fromDate, userId);     

      return res.status(200).json({ activities: result });


    } catch (error) {
      next(error);
    }
  };