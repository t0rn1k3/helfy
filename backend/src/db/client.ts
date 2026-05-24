import 'dotenv/config';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

import * as schema from './schema/index.js';

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'mysql://helfy:helfy_dev_password@localhost:3306/helfy_ecommerce';

export const pool = mysql.createPool({
  uri: DATABASE_URL,
  connectionLimit: 10,
  waitForConnections: true,
});

export const db = drizzle(pool, { schema, mode: 'default' });

export async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 2000): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ECONNREFUSED' && code !== 'ENOTFOUND') {
        throw error;
      }
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}
