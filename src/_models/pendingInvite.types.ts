import { z } from 'zod';

import { zAccessLevel } from './user.types';

import { zObjectId } from './utils/zObjectId';

export const zPendingInvite = z.object({
	email: z.string().email(),
	planner: zObjectId,
	invitedBy: zObjectId,
	accessLevel: zAccessLevel,
	token: z.string(),
	expiresAt: z.date(),
	createdAt: z.date().default(() => new Date()),
});

export type PendingInviteInterface = z.infer<typeof zPendingInvite>;
