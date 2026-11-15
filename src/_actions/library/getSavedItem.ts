'use server';

import { getPlanner } from '@/_actions/planner';
import { matchesId } from '@/_utils/matchesId';

export const getSavedItem = async (plannerId: string, itemId: string) => {
	const planner = await getPlanner(plannerId);

	const item = planner.saved.find(matchesId(itemId));

	if (!item) {
		throw new Error(`Item ${itemId} not found in planner ${plannerId}`);
	}

	return item;
};
