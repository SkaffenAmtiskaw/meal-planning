import { z } from 'zod';

import { zId } from '@/_utils/zId';

import { zAccessLevel } from '../user/user.types';

export const zPendingInvite = z.object({
	email: z.email(),
	planner: zId,
	invitedBy: zId,
	accessLevel: zAccessLevel,
	token: z.string(),
	expiresAt: z.date(),
	createdAt: z.date().default(() => new Date()),
});

export type PendingInviteInterface = z.infer<typeof zPendingInvite>;
