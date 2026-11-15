import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zSafeString } from '@/_utils/zSafeString';

export const ACCESS_LEVELS = ['owner', 'admin', 'write', 'read'] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];
export const zAccessLevel = z.enum(ACCESS_LEVELS);

export const zPlannerMembership = z.object({
	_id: zId,
	planner: zId,
	accessLevel: zAccessLevel,
});
export type PlannerMembership = z.infer<typeof zPlannerMembership>;

export const zUserInterface = z.object({
	_id: zId,
	email: z.string(),
	name: zSafeString().default('New User'),
	planners: z.array(zPlannerMembership),
	pendingEmailChange: z
		.object({
			email: z.email(),
			token: z.string(),
			expiresAt: z.date(),
		})
		.optional(),
});

export type UserInterface = z.infer<typeof zUserInterface>;
