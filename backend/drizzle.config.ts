import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/models/*.ts',
  out: './src/db/migrations',
  driver: 'mysql2', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    uri: process.env.DB_URL as string, // NOTE maybe garder ceci
  },
  verbose: true,
  // strict: true
} satisfies Config;