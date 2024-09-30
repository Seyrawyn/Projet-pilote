import {int, mysqlTable, boolean, primaryKey} from 'drizzle-orm/mysql-core';
import { users } from './users';
import { planned_activities } from './planned_activities';

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - user_id
 *         - planned_activity_id
 *         - is_read
 *       properties:
 *         user_id:
 *           type: integer
 *           description: ID of the user associated with the notification
 *         planned_activity_id:
 *           type: integer
 *           description: ID of the planned activity associated with the notification
 *         is_read:
 *           type: boolean
 *           description: Indicates whether the notification has been read
 */

export const notifications = mysqlTable('notifications', {
  user_id: int('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
  planned_activity_id: int('planned_activity_id').notNull().references(() => planned_activities.id, {onDelete: 'cascade'}),
  is_read: boolean('is_read').notNull(),
}, (table)=> {
  return {
    pk: primaryKey({ columns: [table.user_id, table.planned_activity_id] }), // composite primary key
  }
});

export type Notification = typeof notifications.$inferInsert;
