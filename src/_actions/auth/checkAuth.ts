import { Types } from 'mongoose';

import { headers } from 'next/headers';
import { User } from '@/_models';
import { auth } from '@/auth';

export const checkAuth = async (id: string) => {
	if (!Types.ObjectId.isValid(id)) return false;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) return false;

	const user = await User.findOne({ email: session.user.email }).exec();

	if (!user) return false;

	return user.planner.some((planner) => planner.equals(id));
};
