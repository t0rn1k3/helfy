import './config/env.js';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, apiPrefix: env.API_PREFIX }, 'Backend server started');
});
