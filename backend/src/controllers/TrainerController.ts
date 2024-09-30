import { NextFunction, Request, Response } from 'express';
import { Trainer} from '../models/trainers';
import { deleteTrainerById, getTrainerById, getTrainerByUsername, getTrainerByEmail, insertTrainer, updateTrainerById, getAllTrainers, getTrainerUser, createTrainerUserRelation, deleteTrainerUserRelation, getUsersAssociatedTrainer } from '../services/trainer.services';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getAllUsers, getUserById } from '../services/user.services';
import { insertPlannedActivity, getPlannedActivitiesById, deletePlannedActivityById, selectPlannedActivityById } from '../services/planned_activity.services';

export const createTrainer = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { username, password, email, name } = req.body;

    const TrainerExist: Trainer | undefined = await getTrainerByUsername(username);
    const emailExist: Trainer | undefined = await getTrainerByEmail(email);

    if (TrainerExist) {
      return res.status(409).json({ error: 'A Trainer already has that name' });
    }

    if (emailExist) {
      return res.status(409).json({ error: 'A Trainer already has that email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await insertTrainer({ username, password: hashedPassword, email, name });

    return res.status(201).json({ message: 'Trainer added succesfully' });
  } catch (error) {
    next(error);
  }
};

export const authenticateTrainer = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { username, password } = req.body;
    const trainer: Trainer | undefined = await getTrainerByUsername(username);

    if (!trainer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, trainer.password as string);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { trainerId: trainer.id };
    const secret: jwt.Secret = process.env.SECRET as string || 'petit_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    res.setHeader('Set-Cookie', `token=${token}; Max-Age=${60 * 60}; Path=/; HttpOnly; SameSite=Strict`);

    return res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

export const getTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId  = Number(req.params?.trainerId);
    const trainer: Trainer | undefined = await getTrainerById(trainerId);

    if (!trainer) {
      return res.status(404).json({ error: 'No corresponding trainer' });
    }

    delete trainer.password;
    delete trainer.id;

    return res.status(200).json(trainer);

  } catch (error) {
    next(error);
  }
};

export const getTrainers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainer: Trainer[] | undefined = await getAllTrainers();

    if (!trainer) {
      return res.status(404).json({ error: 'No corresponding trainer' });
    }

    return res.status(200).json(trainer);

  } catch (error) {
    next(error);
  }
};



export const updateTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId  = Number(req.params?.trainerId);
    const trainer: Trainer | undefined = await getTrainerById(trainerId);

    if (!trainer) {
      return res.status(404).json({ error: 'No corresponding trainer' });
    }

    const { username, password, name, email } = req.body;

    const emailInUse = await getTrainerByEmail(email);
    const usernameInUse = await getTrainerByUsername(username);

    if (usernameInUse) return res.status(409).json({ error: 'A trainer already has that name' });
    if (emailInUse) return res.status(409).json({error: 'A trainer already has that email'});

    const updateData: Partial<Trainer> = {};

    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await updateTrainerById(trainerId, updateData);

    return res.status(200).json({ message: 'Trainer successfully updated' });

  } catch (error) {
    next(error);
  }
};


export const deleteTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId  = Number(req.params?.trainerId);
    const trainer: Trainer | undefined = await getTrainerById(trainerId);

    if (!trainer) {
      return res.status(404).json({ error: 'Nothing to delete' });
    }

    await deleteTrainerById(trainerId);

    return res.status(200).json({ message: 'Trainer successfully deleted' });

  } catch (error) {
    next(error);
  }
};


export const addUserToTrainer = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const trainerId = req.trainer?.trainerId as number;

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const trainer = await getTrainerById(trainerId);
  if (!trainer) {
    return res.status(404).json({ error: 'Trainer not found' });
  }

  const relationExist = await getTrainerUser(trainerId, userId);
  if (relationExist) return res.status(409).json({ error: 'Relation already exists' });

  await createTrainerUserRelation(trainerId, userId);

  res.status(200).json({ message: 'User added to trainer' });
};



export const removeUserFromTrainer = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const trainerId = req.trainer?.trainerId as number;

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const trainer = await getTrainerById(trainerId);
  if (!trainer) {
    return res.status(404).json({ error: 'Trainer not found' });
  }

  const relationExist = await getTrainerUser(trainerId, userId);
  if (!relationExist) return res.status(404).json({ error: 'No association to delete found' });

  await deleteTrainerUserRelation(trainerId, userId);

  res.status(200).json({ message: 'User removed from trainer' });
};


export const getUsersOfTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.trainer?.trainerId as number;
    const searchString = req.query.searchString as string;

    if (!trainerId) return res.status(405).json({error: 'Trainer not found'});

    const users = await getUsersAssociatedTrainer(trainerId, searchString);

    return res.status(200).json({message: 'User successfully fetched', users});
  } catch (error) {
    next(error);
  }
};


export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.trainer?.trainerId as number;
    const searchString = req.query.searchString as string;

    if (!trainerId) return res.status(405).json({error: 'trainer not found' });

    const users = await getAllUsers(searchString);

    if (!users) return res.status(405).json({error: 'error while fetching' });

    return res.status(200).json({message: 'User successfully fetched', users});

  } catch (error) {
    next(error);
  }
};


/** Trainer manages user activites **/
export const createPlannedActivityFromTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.trainer?.trainerId as number;
    const userId = parseInt(req.params.userId); 
    const { type, date, duration, name, comment } = req.body;

    const relationExist = await getTrainerUser(trainerId, userId);
    if (!relationExist) return res.status(404).json({ error: 'Not corresponding client for the trainer found' });

    const dateObject = new Date(date);

    const activityId = await insertPlannedActivity({
      user_id: userId, 
      type,
      date: dateObject,
      duration,
      name,
      comment,
    });

    return res.status(200).json({message: 'Activity successfully added to user', activityId});
  } catch (error) {
    next(error);
  }
};


export const getPlannedActivitiesFromTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId); 
    const trainerId = req.trainer?.trainerId as number;

    const relationExist = await getTrainerUser(trainerId, userId);
    if (!relationExist) return res.status(404).json({ error: 'Not corresponding client for the trainer found' });

    const activities = await getPlannedActivitiesById(userId);
    if (!activities || activities.length === 0) {
      return res.status(404).json({ error: 'No planned activities found for this user' });
    }

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

export const deletePlannedActivityFromTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plannedActivityId = parseInt(req.params.plannedActivityId);
    const userId = parseInt(req.params.userId);
    const trainerId = req.trainer?.trainerId as number;

    const relationExist = await getTrainerUser(trainerId, userId);
    if (!relationExist) return res.status(404).json({ error: 'Not corresponding client for the trainer found' });

    const activity = await selectPlannedActivityById(plannedActivityId, userId);
    const activityId = activity[0]?.id;
    if (!activityId) return res.status(404).json({ error: 'No activity found' });

    await deletePlannedActivityById(plannedActivityId, userId);

    res.status(200).json({ message: 'Planned activity successfully deleted' });
  } catch (error) {
    next(error);
  }
};
