import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalRateLimiter } from './middleware/rateLimit.middleware.js';
import { authRoutes } from './modules/auth/routes.js';
import { cartRoutes } from './modules/cart/routes.js';
import { categoriesRoutes } from './modules/categories/routes.js';
import { ordersRoutes } from './modules/orders/routes.js';
import { productsRoutes } from './modules/products/routes.js';
import { usersRoutes } from './modules/users/routes.js';
import { ok } from './utils/response.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(pinoHttp({ logger }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(generalRateLimiter);

  const apiRouter = express.Router();

  apiRouter.get('/health', (_req, res) => ok(res, { status: 'ok' }));
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/categories', categoriesRoutes);
  apiRouter.use('/products', productsRoutes);
  apiRouter.use('/cart', cartRoutes);
  apiRouter.use('/orders', ordersRoutes);
  apiRouter.use(usersRoutes);

  app.use(env.API_PREFIX, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
