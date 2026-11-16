import { auth } from '#auth';
import { newId } from '@/_models/database/newId';
import { users } from '@/_models/database/users';
import type { PlannerMembership } from '@/_models/user';

import { uniqueEmail } from './uniqueEmail';

// Re-exported for E2E code, which can't import @/_models.
export type { AccessLevel } from '@/_models/user';

interface CreateUserOptions {
	// The factory creates each membership, so it gives each one its `_id`.
	planners: Omit<PlannerMembership, '_id'>[];
	email?: string;
	password?: string;
	name?: string;
	emailVerified?: boolean;
}

// Creates the better-auth user and the app's User doc together, with the same email.
export const createUser = async ({
	planners: plannerAccess,
	email = uniqueEmail(),
	password,
	name = 'New User',
	emailVerified = true,
}: CreateUserOptions) => {
	const { user } = await auth.api.createUser({
		body: { email, password, name, data: { emailVerified } },
	});
	const planners: PlannerMembership[] = plannerAccess.map((membership) => ({
		_id: newId(),
		...membership,
	}));
	const _id = newId();
	await users.insertOne({ _id, email, name, planners });

	// `id` is the better-auth user's; `_id` is the app's User doc's, which refs such as an invite's `invitedBy` point to.
	return { id: user.id, _id, email, name, password, planners };
};
