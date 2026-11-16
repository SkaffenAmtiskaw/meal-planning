'use server';

import { headers } from 'next/headers';

import { auth } from '@/_auth';
import { users } from '@/_models/database/users';
import { NO_SESSION_MESSAGE } from '@/_utils/noSessionError';
import { serialize } from '@/_utils/serialize';

export const getUser = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) throw new Error(NO_SESSION_MESSAGE);

	const user = await users.findOne({ email: session.user.email });
	if (!user) return null;
	return serialize(user);
};
