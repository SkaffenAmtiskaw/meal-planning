import { z } from 'zod';

import { zSafeString } from '@/_utils/zSafeString';

import { zObjectId } from './utils/zObjectId';

export const zUserInterface = z.object({
	email: z.string(),
	name: zSafeString().default('New User'),
	planners: z.array(zObjectId),
	pendingEmailChange: z
		.object({
			email: z.string().email(),
			token: z.string(),
			expiresAt: z.date(),
		})
		.optional(),
});

export type UserInterface = z.infer<typeof zUserInterface>;
