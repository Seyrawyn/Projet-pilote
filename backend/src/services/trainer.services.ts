import { trainerUserAssociation } from '../models/trainerUsersRelation';
import { db } from '../db/db';
import { Trainer, trainers } from '../models/trainers';
import { users } from '../models/users';
import { eq, getTableColumns, like } from 'drizzle-orm';

export const getTrainerByUsername = async (username: string) : Promise<Trainer | undefined> => {
  const [ trainer ] = await db.select()
    .from(trainers)
    .where(eq(trainers.username, username))
    .limit(1);
  return trainer;
};

export const getTrainerByEmail = async (email: string) : Promise<Trainer | undefined> => {
  const [ trainer ] = await db.select()
    .from(trainers)
    .where(eq(trainers.email, email))
    .limit(1);
  return trainer;
};

export const getTrainerById = async (id: number) : Promise<Trainer | undefined> => {
  const [ trainer ] = await db.select()
    .from(trainers)
    .where(eq(trainers.id, id))
    .limit(1);
  return trainer;
};

export const getAllTrainers = async ():Promise<Partial<Trainer>[]>  => {
  const trainers_list: Partial<Trainer>[] = await db.select({
    id: trainers.id,
    username: trainers.username,
    name: trainers.name,
    email: trainers.email,
  }).from(trainers);

  return trainers_list;
};

export const insertTrainer = async (trainer: Trainer) => {
  return await db.insert(trainers).values([{...trainer}]);
};

export const updateTrainerById = async (id: number, trainer: Partial<Trainer>) => {
  return await db.update(trainers)
    .set(trainer)
    .where(eq(trainers.id, id));
};

export const deleteTrainerById = async (id: number) => {
  await db.transaction(
    async (tx) => {
      await tx.delete(trainers).where(eq(trainers.id, id));
      await tx.delete(trainerUserAssociation).where(eq(trainerUserAssociation.trainerId, id));
    }
  );
};

/*** Relation between trainer and id ***/

export const getTrainerUser = async (trainerId: number, userId: number) => {
  const [ relation ] = await db.select()
    .from(trainerUserAssociation)
    .where(eq(trainerUserAssociation.trainerId, trainerId) && eq(trainerUserAssociation.userId, userId));
  return relation;
};

export const createTrainerUserRelation = async (trainerId: number, userId: number) => {
  return await db.insert(trainerUserAssociation).values([{trainerId, userId}]);
};

export const deleteTrainerUserRelation = async (trainerId: number, userId: number) => {

  return await db.delete(trainerUserAssociation)
    .where(eq(trainerUserAssociation.trainerId, trainerId) && eq(trainerUserAssociation.userId, userId));
};


export const getUsersAssociatedTrainer = async (trainerId: number, searchString: string) => {
  const { ...fields } = getTableColumns(users);
  if (!searchString) {
    return await db
      .select({ ...fields })
      .from(trainerUserAssociation)
      .leftJoin(users, eq(trainerUserAssociation.userId, users.id))
      .where(eq(trainerUserAssociation.trainerId, trainerId));
  }

  return await db
    .select({ ...fields })
    .from(trainerUserAssociation)
    .leftJoin(users, eq(trainerUserAssociation.userId, users.id))
    .where(eq(trainerUserAssociation.trainerId, trainerId) &&
       (like(users.username,`%${searchString}%`) || like(users.name,`%${searchString}%`)));
};
