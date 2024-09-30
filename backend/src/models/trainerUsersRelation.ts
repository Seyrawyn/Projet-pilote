import { int, mysqlTable } from 'drizzle-orm/mysql-core';

export const trainerUserAssociation = mysqlTable('trainer_user_associations', {
  trainerId: int('trainerId').notNull(),
  userId: int('userId').notNull(),
});

export type TrainerUserAssociation = typeof trainerUserAssociation.$inferInsert;
