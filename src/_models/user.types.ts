import { z } from 'zod';

import { zSafeString } from '@/_utils/zSafeString';

import { zObjectId } from './utils/zObjectId';

export const ACCESS_LEVELS = ['owner', 'admin', 'write', 'read'] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];
export const zAccessLevel = z.enum(ACCESS_LEVELS);

export const zPlannerMembership = z.object({
	planner: zObjectId,
	accessLevel: zAccessLevel,
});
export type PlannerMembership = z.infer<typeof zPlannerMembership>;

export const zUserInterface = z.object({
	email: z.string(),
	name: zSafeString().default('New User'),
	planners: z.array(zPlannerMembership),
	pendingEmailChange: z
		.object({
			email: z.string().email(),
			token: z.string(),
			expiresAt: z.date(),
		})
		.optional(),
});

export type UserInterface = z.infer<typeof zUserInterface>;
