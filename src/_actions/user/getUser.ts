'use server';

import { headers } from 'next/headers';
import { cache } from 'react';

import { auth } from '@/_auth';
import { users } from '@/_models/database/users';

import { NO_SESSION_MESSAGE } from './noSessionError';

/**
 * Cached, so every caller during one page render shares one lookup. Kept
 * private, because every export of a 'use server' file is a server action.
 */
const findSessionUser = cache(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) throw new Error(NO_SESSION_MESSAGE);

	return users.findOne({ email: session.user.email });
});

export const getUser = async () => findSessionUser();
