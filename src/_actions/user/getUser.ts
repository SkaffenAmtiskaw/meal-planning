'use server';

import { headers } from 'next/headers';

import { auth } from '@/_auth';
import { User } from '@/_models/user';
import { NO_SESSION_MESSAGE } from '@/_utils/noSessionError';
import { serialize } from '@/_utils/serialize';

export const getUser = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) throw new Error(NO_SESSION_MESSAGE);

	const user = await User.findOne({ email: session.user.email }).lean().exec();
	if (!user) return null;
	return serialize(user);
};
