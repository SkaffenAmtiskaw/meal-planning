'use server';

import { headers } from 'next/headers';

import { User } from '@/_models';
import { auth } from '@/auth';

export const getUser = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) throw new Error('No Valid Session');

	return await User.findOne({ email: session.user.email }).exec();
};
