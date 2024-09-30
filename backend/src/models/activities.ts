import {int, varchar, double, datetime, text, json, mysqlTable, mysqlEnum} from 'drizzle-orm/mysql-core';
import {users} from './users';
import {relations} from 'drizzle-orm';

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       required:
 *         - id
 *         - user_id
 *         - name
 *         - type
 *         - date
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the activity.
 *         user_id:
 *           type: integer
 *           description: The id of the user who completed the activity.
 *         name:
 *           type: string
 *           description: The name of the activity.
 *         city:
 *           type: string
 *           description: The city where the activity took place.
 *         type:
 *           type: string
 *           enum: [Running, Biking, Walking]
 *           description: The type of the activity.
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date when the activity happened.
 *         durationTotal:
 *           type: number
 *           description: The total duration of the activity.
 *         distanceTotal:
 *           type: number
 *           description: The total distance of the activity.
 *         comment:
 *           type: string
 *           description: Additional comments about the activity.
 *         segments:
 *           type: object
 *           description: Segments of the activity (JSON).
 *       example:
 *         id: 1
 *         user_id: 1
 *         name: Morning Run
 *         city: San Francisco
 *         type: Running
 *         date: 2022-04-13T13:00:00Z
 *         durationTotal: 30.0
 *         distanceTotal: 7.5
 *         comment: Felt good!
 *         segments: "{}"
 */
export const activities = mysqlTable('activities', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  city: varchar('city', { length: 100 }).default(''),
  type: mysqlEnum('type', ['Running', 'Biking', 'Walking']).notNull(),
  date: datetime('date').notNull().default(new Date()),
  durationTotal: double('durationTotal').default(0),
  distanceTotal: double('distanceTotal').default(0),
  comment: text('comment').default(''),
  segments: json('segments').default({})
});

export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
}));

export const planActRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.user_id],
    references: [users.id],
  }),
}));

export type Activity = typeof activities.$inferInsert;
