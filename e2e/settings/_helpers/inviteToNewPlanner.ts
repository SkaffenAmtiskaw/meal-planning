import { createPendingInvite } from '#factories/invite';
import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

// Creates "Family Meals" with an owner, and a pending invite from the owner to the email.
// getUserInvites matches the email exactly, so pass it as createUser returned it.
export const inviteToNewPlanner = async (email: string) => {
	const planner = await createPlanner({ name: 'Family Meals' });
	const owner = await createUser({
		name: 'Olivia Owner',
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	const invite = await createPendingInvite({
		planner: planner._id,
		invitedBy: owner._id,
		email,
	});

	return { planner, owner, invite };
};
