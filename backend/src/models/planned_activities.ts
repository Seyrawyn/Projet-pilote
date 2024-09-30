import { int, varchar, datetime, text, mysqlTable, mysqlEnum } from 'drizzle-orm/mysql-core';
import {relations } from 'drizzle-orm';
import { users } from './users';
import { activities } from './activities';

/**
 * @swagger
 * components:
 *   schemas:
 *     Planned_activity:
 *       type: object
 *       required:
 *         - id
 *         - user_id
 *         - type
 *         - date
 *         - duration
 *      
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the activity
 *         user_id:
 *           type: integer
 *           description: The id of the user who proposed the activity
 *         type:
 *           type: string
 *           description: The type of the activity
 *           example: Running
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the activity
 *           example: 2024-02-26 16:30:00
 *         duration:
 *           type: integer
 *           description: The total duration of the activity in seconds
 *           example: 1823
 *         name:
 *           type: string
 *           description: The name of the activity
 *           example: A run in the park
 *         comment:
 *           type: string
 *           description: The comment of the activity
 *           example: Remember to focus on your breath the entire time!
 *         activity_id:
 *           type: integer
 *           description: The id of the actual activity once it has been registered
 * 
 */
export const planned_activities = mysqlTable('planned_activities', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull(),  
  type: mysqlEnum('type', ['Running', 'Biking', 'Walking']).notNull(),
  date: datetime('date').notNull(),
  duration: int('duration').notNull(),
  name: varchar('name', { length: 256 }),
  comment: text('comment'),
  activity_id: int('activity_id').references(() => activities.id) // Make relation instead
});

export const usersRelations = relations(users, ({ many }) => ({
  planned_activities: many(planned_activities),
}));

export const planActRelations = relations(planned_activities, ({ one }) => ({
  user: one(users, {
    fields: [planned_activities.user_id],
    references: [users.id],
  }),
}));

export type PlannedActivity = typeof planned_activities.$inferInsert;
