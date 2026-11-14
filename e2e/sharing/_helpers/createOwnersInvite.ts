import { createPendingInvite } from '#factories/invite';
import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

type InviteOptions = Omit<
	Parameters<typeof createPendingInvite>[0],
	'planner' | 'invitedBy'
>;

// Creates "Family Meals" and its owner, and writes a pending invite from the owner to the planner, made from the options.
export const createOwnersInvite = async (options: InviteOptions = {}) => {
	const planner = await createPlanner({ name: 'Family Meals' });
	const owner = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	const invite = await createPendingInvite({
		...options,
		planner: planner._id,
		invitedBy: owner._id,
	});

	return { invite, planner };
};
