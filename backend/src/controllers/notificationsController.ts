import { NextFunction, Request, Response } from 'express';
import {User, users} from '../models/users';
import { getUserById } from '../services/user.services';
import {getUpcomingNotifications, markAsRead} from "../services/notifications.services";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId as number;
  const user: User | undefined = await getUserById(userId);

  if (!user) {
    // Can only happen in very tight race condition OR if token was forged
    // Maybe it should be removed, confusing
    return res.status(404).json({ error: 'No corresponding user' });
  }

  // query upcoming notifications
  const upcomingNotifications = await getUpcomingNotifications(user.id as number);
  if (!upcomingNotifications) {
    return res.status(404).json({ message: 'Could not find upcoming notifications'});
  }

  return res.status(200).json({notifications: upcomingNotifications});
}

export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const userId = req.user?.userId as number;
    const user: User | undefined = await getUserById(userId);

    const pActivityId = Number(req.params?.pActivityId);
    const updatedNotification = await markAsRead(userId, pActivityId);

    if (!user) {
      return res.status(404).json({ error: 'No corresponding user' });
    }

    if (!updatedNotification) {
      return res.status(404).json({ error: 'No corresponding notification'})
    }

    return res.status(200).json({ updatedNotification })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
