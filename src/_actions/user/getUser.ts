'use server';

import { headers } from 'next/headers';

import { auth } from '@/_auth';
import { users } from '@/_models/database/users';

import { NO_SESSION_MESSAGE } from './noSessionError';

export const getUser = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) throw new Error(NO_SESSION_MESSAGE);

	return users.findOne({ email: session.user.email });
};
