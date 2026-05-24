import { and, eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { addresses } from '../../db/schema/addresses.js';
import { users } from '../../db/schema/users.js';

export const usersRepository = {
  findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async updateProfile(id: string, data: { name?: string; email?: string }) {
    await db.update(users).set(data).where(eq(users.id, id));
  },

  async updatePassword(id: string, passwordHash: string) {
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
  },

  findAddressesByUserId(userId: string) {
    return db.query.addresses.findMany({
      where: eq(addresses.userId, userId),
    });
  },

  findAddressByIdForUser(addressId: string, userId: string) {
    return db.query.addresses.findFirst({
      where: and(eq(addresses.id, addressId), eq(addresses.userId, userId)),
    });
  },

  async clearDefaultAddresses(userId: string) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  },

  async createAddress(data: {
    id: string;
    userId: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }) {
    await db.insert(addresses).values(data);
  },

  async updateAddress(
    addressId: string,
    data: {
      line1?: string;
      line2?: string | null;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      isDefault?: boolean;
    },
  ) {
    await db.update(addresses).set(data).where(eq(addresses.id, addressId));
  },

  deleteAddress(addressId: string) {
    return db.delete(addresses).where(eq(addresses.id, addressId));
  },
};
