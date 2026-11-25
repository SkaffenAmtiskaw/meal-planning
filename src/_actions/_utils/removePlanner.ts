import 'server-only';

import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';

/**
 * Deletes a planner along with everything that points to it: each member's membership and its pending invites.
 * The references go first, so if a write fails, what's left is a planner nobody can reach, not a member whose
 * planner list names one that's gone. It doesn't check access, so its caller does.
 */
export const removePlanner = async (plannerId: string) => {
	await users.updateMany(
		{ 'planners.planner': plannerId },
		{ $pull: { planners: { planner: plannerId } } },
	);
	await pendingInvites.deleteMany({ planner: plannerId });
	await planners.deleteOne({ _id: plannerId });
};
