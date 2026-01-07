import { Types } from 'mongoose';

import { catchify } from '@/_utils/catchify';

import { getUser } from '../getUser';

export const checkAuth = async (id: string) => {
	if (!Types.ObjectId.isValid(id)) return false;

	const [user, error] = await catchify(getUser);

	if (error || !user) return false;

	return user.planner.some((planner) => planner.equals(id));
};
