import { trainerUserAssociation } from '../models/trainerUsersRelation';
import { db } from '../db/db';
import { User, users } from '../models/users';
import { eq, asc, like, getTableColumns } from 'drizzle-orm';
import { trainers } from '../models/trainers';

export const getAllUsers = async (searchString: string) => {
  const { ...fields } = getTableColumns(users);

  if (!searchString) {
    return await db.select({ ...fields, trainerId: trainerUserAssociation.trainerId })
      .from(users)
      .leftJoin(trainerUserAssociation, eq(trainerUserAssociation.userId, users.id))
      .orderBy(asc(users.username));
  }

  return await db.select({ ...fields, trainerId: trainerUserAssociation.trainerId })
    .from(users)
    .leftJoin(trainerUserAssociation, eq(trainerUserAssociation.userId, users.id))
    .orderBy(asc(users.username))
    .where(like(users.username,`%${searchString}%`) || like(users.name,`%${searchString}%`));
};

export const getUserByUsername = async ( username: string) : Promise<User | undefined> => {
  const [ user ] = await db.select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return user;
};

export const getUserById = async (id: number) : Promise<User | undefined> => {
  const [ user ] = await db.select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user;
};

export const getUserByIdWithTrainer = async (id: number) => {
  const {username, email, name, dateOfBirth, height, weight, sex, img, description} = getTableColumns(users);
  const Trainer = getTableColumns(trainers);

  const [ user ] = await db.select({
    username, email, name, dateOfBirth, height, weight, sex, img, description, 
    trainer: { username: Trainer.username, name: Trainer.name, email: Trainer.email }
  }).from(users)
    .leftJoin(trainerUserAssociation, eq(trainerUserAssociation.userId, users.id))
    .leftJoin(trainers, eq(trainers.id, trainerUserAssociation.trainerId))
    .where(eq(users.id, id))
    .limit(1);
  return user;
};

export const getUserByEmail = async (email: string) : Promise<User | undefined> => {
  const [ user ] = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
};

export const insertUser = async (user: User) => {
  return await db.insert(users).values([{...user}]);
};

export const updateUserById = async (id: number, user: Partial<User>) => {
  return await db.update(users)
    .set(user)
    .where(eq(users.id, id));
};

export const deleteUserById = async (id: number) => {
  return await db.delete(users)
    .where(eq(users.id, id));
};


/**User image**/
export const getUserImage = async (userId: number) => {
  const [ userImg ] = await db.select({img: users.img})
    .from(users)
    .where(eq(users.id, userId));
  return userImg;
};

export const updateUserImage = async (userId: number, imgName: string) => {
  return await db.update(users).set({ img: imgName }).where(eq(users.id, userId));
};

