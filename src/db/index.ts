import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
// import { dbSchema } from '@/db/schema/index';

// Database file path - use absolute path for better reliability
import { resolve } from 'path';
const dbPath = resolve(process.cwd(), process.env.DB_FILE_NAME || './sqlite.db');

const sqlite = new Database(dbPath);
export const db = drizzle({
  client: sqlite,
  // schema: dbSchema,
});

// Función para obtener instancia de la base de datos
export const getDb = async () => {
  return drizzle({
    client: sqlite,
  });
};

export * from 'drizzle-orm';
export * from './schema';
