import { int, mysqlTable, uniqueIndex, varchar } from 'drizzle-orm/mysql-core';

/**
 * @swagger
 * components:
 *   schemas:
 *     Trainer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: the id of a user
 *           example: 1
 *         username:
 *           type: string
 *           description: The username of a trainer
 *           example: trainer-john
 *         password:
 *           type: string
 *           description: The password of a trainer
 *           example: mysecurepassword
 *         email:
 *           type: string
 *           description: The email of a trainer
 *           example: trainer@email.com
 *         name:
 *           type: string
 *           description: The name of a trainer
 *           example: John Doe
 */
export const trainers = mysqlTable('trainers', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 256 }),
  password: varchar('password', { length: 72 }),
  email: varchar('email', { length: 256 }),
  name: varchar('name', { length: 256 }),
}, (trainers) => ({
  nameIndex: uniqueIndex('username_idx').on(trainers.username),
  emailIndex: uniqueIndex('email_idx').on(trainers.email),
}));

export type Trainer = typeof trainers.$inferInsert;
