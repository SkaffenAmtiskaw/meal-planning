import type { Types } from 'mongoose';

import { getUser } from '@/_actions';
import type { AccessLevel } from '@/_models/user';
import { catchify } from '@/_utils/catchify';

type AuthResult =
	| { type: 'authorized'; accessLevel: AccessLevel }
	| { type: 'unauthenticated' }
	| { type: 'unauthorized' }
	| { type: 'error'; error: Error };

const ACCESS_LEVEL_ORDER: Record<AccessLevel, number> = {
	read: 0,
	write: 1,
	admin: 2,
	owner: 3,
};

export const checkAuth = async (
	id: Types.ObjectId,
	required: AccessLevel,
): Promise<AuthResult> => {
	const [user, error] = await catchify(getUser);

	if (error) {
		if (error.message === 'No Valid Session')
			return { type: 'unauthenticated' };
		return { type: 'error', error };
	}

	if (!user) return { type: 'unauthenticated' };

	const membership = user.planners.find(
		(p) => (p.planner as unknown as string) === id.toString(),
	);
	if (!membership) return { type: 'unauthorized' };

	if (
		ACCESS_LEVEL_ORDER[membership.accessLevel] < ACCESS_LEVEL_ORDER[required]
	) {
		return { type: 'unauthorized' };
	}

	return { type: 'authorized', accessLevel: membership.accessLevel };
};
