import 'server-only';

import { getPlanner } from '@/_actions/planner/getPlanner';

export const getSavedItem = async (plannerId: string, itemId: string) => {
	const planner = await getPlanner(plannerId);

	const item = planner.saved.find((saved) => saved._id === itemId);

	if (!item) {
		throw new Error(`Item ${itemId} not found in planner ${plannerId}`);
	}

	return item;
};
