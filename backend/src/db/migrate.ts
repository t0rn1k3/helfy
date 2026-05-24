import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/mysql2/migrator';

import { db, pool, withRetry } from './client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, '../../../database/migrations');

async function runMigrations() {
  await withRetry(async () => {
    await migrate(db, { migrationsFolder });
  });
  console.log('Migrations applied successfully.');
}

runMigrations()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
