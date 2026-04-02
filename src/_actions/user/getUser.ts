'use server';

import { headers } from 'next/headers';

import { auth } from '@/_auth';
import { User } from '@/_models';

export const getUser = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) throw new Error('No Valid Session');

	return await User.findOne({ email: session.user.email }).exec();
};
