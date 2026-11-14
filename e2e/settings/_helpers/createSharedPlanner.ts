import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

// Creates "Family Meals" with an owner and a `write` member. The member also owns "Solo Lunches", so Settings
// still loads for them if they leave, since it sends a user with no planners to `/`.
export const createSharedPlanner = async () => {
	const planner = await createPlanner({ name: 'Family Meals' });
	const memberPlanner = await createPlanner({ name: 'Solo Lunches' });
	const owner = await createUser({
		name: 'Olivia Owner',
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	const member = await createUser({
		name: 'Max Member',
		planners: [
			{ planner: memberPlanner._id, accessLevel: 'owner' },
			{ planner: planner._id, accessLevel: 'write' },
		],
	});

	return { planner, memberPlanner, owner, member };
};
