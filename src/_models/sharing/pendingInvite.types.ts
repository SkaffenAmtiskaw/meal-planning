import { z } from 'zod';

import { zObjectId } from '@/_utils/zObjectId';

import { zAccessLevel } from '../user/user.types';

export const zPendingInvite = z.object({
	email: z.email(),
	planner: zObjectId,
	invitedBy: zObjectId,
	accessLevel: zAccessLevel,
	token: z.string(),
	expiresAt: z.date(),
	createdAt: z.date().default(() => new Date()),
});

export type PendingInviteInterface = z.infer<typeof zPendingInvite>;
