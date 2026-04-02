import { z } from 'zod';

import { zObjectId } from './utils/zObjectId';

export const zUserInterface = z.object({
	email: z.string(),
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
