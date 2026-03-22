import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from '@/db/schema/index';

// Conexión a la base de datos SQLite usando libsql
const dbUrl = process.env.DB_FILE_NAME || 'file:./sqlite.db';

export const db = drizzle(dbUrl, {
  schema,
});

// Función para obtener instancia de la base de datos
export const getDb = () => {
  return drizzle(dbUrl, {
    schema,
  });
};

export * from 'drizzle-orm';
export * from './schema';
