import type { Types } from 'mongoose';

import { getUser } from '@/_actions';
import { catchify } from '@/_utils/catchify';

type AuthResult =
	| { type: 'authorized' }
	| { type: 'unauthenticated' }
	| { type: 'unauthorized' }
	| { type: 'error'; error: Error };

export const checkAuth = async (id: Types.ObjectId): Promise<AuthResult> => {
	const [user, error] = await catchify(getUser);

	if (error) {
		if (error.message === 'No Valid Session')
			return { type: 'unauthenticated' };
		return { type: 'error', error };
	}

	if (!user) return { type: 'unauthenticated' };

	if (!user.planners.some((planner) => planner.equals(id))) {
		return { type: 'unauthorized' };
	}

	return { type: 'authorized' };
};
