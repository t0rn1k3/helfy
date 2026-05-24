import type { User } from './user.js';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'name'>;
}
