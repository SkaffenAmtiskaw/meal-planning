import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/_auth';

export const { GET, POST } = toNextJsHandler(auth);
