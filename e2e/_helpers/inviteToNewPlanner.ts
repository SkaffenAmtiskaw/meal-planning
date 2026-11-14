import { createPendingInvite } from '#factories/invite';
import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

type InviteOptions = Omit<
	Parameters<typeof createPendingInvite>[0],
	'planner' | 'invitedBy'
>;

// Creates "Family Meals" with an owner, and a pending invite from the owner made from the options.
// getUserInvites matches the email exactly, so to invite an existing user, pass the email as createUser returned it.
export const inviteToNewPlanner = async (options: InviteOptions = {}) => {
	const planner = await createPlanner({ name: 'Family Meals' });
	const owner = await createUser({
		name: 'Olivia Owner',
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	const invite = await createPendingInvite({
		...options,
		planner: planner._id,
		invitedBy: owner._id,
	});

	return { planner, owner, invite };
};
