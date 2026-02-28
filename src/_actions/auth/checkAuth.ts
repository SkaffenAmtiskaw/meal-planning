import type { Types } from 'mongoose';

import { catchify } from '@/_utils/catchify';

import { getUser } from '../getUser';

export const checkAuth = async (id: Types.ObjectId) => {
	const [user, error] = await catchify(getUser);

	if (error || !user) return false;

	return user.planners.some((planner) => planner.equals(id));
};
