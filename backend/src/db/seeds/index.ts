import 'dotenv/config';

import argon2 from 'argon2';
import { sql } from 'drizzle-orm';

import { categorySeedData } from '../../../../database/seeds/categories.seed.js';
import { productSeedData } from '../../../../database/seeds/products.seed.js';
import { userSeedData } from '../../../../database/seeds/users.seed.js';
import { db, pool, withRetry } from '../client.js';
import {
  addresses,
  categories,
  productImages,
  productReviews,
  products,
  users,
} from '../schema/index.js';

async function clearTables() {
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  const tables = [
    'order_items',
    'orders',
    'cart_items',
    'carts',
    'product_reviews',
    'product_images',
    'products',
    'categories',
    'addresses',
    'refresh_tokens',
    'users',
  ];
  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE \`${table}\``));
  }
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
}

async function seed() {
  await withRetry(async () => {
    await clearTables();

    const hashedUsers = await Promise.all(
      userSeedData.map(async (user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: await argon2.hash(user.password),
      })),
    );

    await db.insert(users).values(hashedUsers);

    await db.insert(categories).values(
      categorySeedData.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
      })),
    );

    await db.insert(products).values(
      productSeedData.map((p) => ({
        id: p.id,
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        brand: p.brand,
        stock: p.stock,
        averageRating: '4.50',
        reviewCount: 0,
      })),
    );

    await db.insert(productImages).values(
      productSeedData.map((p) => ({
        id: `img-${p.id}`,
        productId: p.id,
        url: p.imageUrl,
        alt: p.name,
        sortOrder: 0,
      })),
    );

    await db.insert(addresses).values({
      id: 'addr-customer-001',
      userId: 'user-customer-001',
      line1: '123 Market Street',
      line2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      country: 'US',
      isDefault: true,
    });

    await db.insert(productReviews).values([
      {
        id: 'review-001',
        productId: 'prod-001',
        userId: 'user-customer-001',
        rating: 5,
        title: 'Excellent sound quality',
        body: 'These headphones exceeded my expectations. Premium build and great battery life.',
      },
      {
        id: 'review-002',
        productId: 'prod-006',
        userId: 'user-customer-001',
        rating: 4,
        title: 'Great fit and finish',
        body: 'The leather quality is impressive. Runs slightly slim — size up if between sizes.',
      },
    ]);

    await db.execute(sql`
      UPDATE products SET review_count = 1, average_rating = 5.00 WHERE id = 'prod-001'
    `);
    await db.execute(sql`
      UPDATE products SET review_count = 1, average_rating = 4.00 WHERE id = 'prod-006'
    `);

    console.log('Seed completed successfully.');
    console.log('Demo users:');
    console.log('  customer@helfy.dev / password123');
    console.log('  admin@helfy.dev / password123');
  });
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
