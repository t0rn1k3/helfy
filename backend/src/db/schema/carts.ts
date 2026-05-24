import { mysqlTable, varchar, timestamp, index } from 'drizzle-orm/mysql-core';

import { users } from './users.js';

export const carts = mysqlTable(
  'carts',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).references(() => users.id, { onDelete: 'cascade' }),
    sessionId: varchar('session_id', { length: 36 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('carts_user_id_idx').on(table.userId),
    index('carts_session_id_idx').on(table.sessionId),
  ],
);

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
