import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const poolConnection : mysql.Pool = mysql.createPool(process.env.DB_URL as string);

export const db = drizzle(poolConnection);

export const closeDbConnection = async () => {
  await poolConnection.end();
};
