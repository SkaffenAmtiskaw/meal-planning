import { mergeTests } from '@playwright/test';

import { test as clientIp } from './clientIp';
import { test as databaseConnections } from './databaseConnections';

// The test specs import: each test gets its own client IP, and each worker its database connections.
export const test = mergeTests(databaseConnections, clientIp);
