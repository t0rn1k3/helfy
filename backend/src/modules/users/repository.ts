import { eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { users } from '../../db/schema/users.js';

export const usersRepository = {
  findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },
};
