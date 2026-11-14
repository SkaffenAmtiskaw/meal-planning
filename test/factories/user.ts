import { auth } from '#auth';
import type { PlannerMembership } from '@/_models/user';
import { User } from '@/_models/user';

import { uniqueEmail } from './uniqueEmail';

// Re-exported for E2E code, which can't import @/_models.
export type { AccessLevel } from '@/_models/user';

interface CreateUserOptions {
	planners: PlannerMembership[];
	email?: string;
	password?: string;
	name?: string;
	emailVerified?: boolean;
}

// Creates the better-auth user and the app's User doc together, with the same email.
export const createUser = async ({
	planners,
	email = uniqueEmail(),
	password,
	name = 'New User',
	emailVerified = true,
}: CreateUserOptions) => {
	const { user } = await auth.api.createUser({
		body: { email, password, name, data: { emailVerified } },
	});
	const userDoc = await User.create({ email, name, planners });

	// `id` is the better-auth user's; `_id` is the app's User doc's, which refs such as an invite's `invitedBy` point to.
	return { id: user.id, _id: userDoc._id, email, name, password, planners };
};
