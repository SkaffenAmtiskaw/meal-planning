import { auth } from '#auth';
import type { PlannerMembership } from '@/_models/user';
import { User } from '@/_models/user';

import { uniqueEmail } from './uniqueEmail';

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
	await User.create({ email, name, planners });

	return { id: user.id, email, name, password, planners };
};
