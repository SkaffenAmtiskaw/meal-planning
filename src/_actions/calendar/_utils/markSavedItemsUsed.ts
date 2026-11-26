import 'server-only';

import { planners } from '@/_models/database/planners';

/**
 * Stamps a planner's saved recipes and bookmarks as used at `usedAt`, in one write. An id with no saved item
 * matches nothing. Throws if the write fails, so the caller decides whether to report it.
 */
export const markSavedItemsUsed = async (
	plannerId: string,
	savedIds: string[],
	usedAt: Date,
): Promise<void> => {
	if (savedIds.length === 0) return;
	await planners.updateOne(
		{ _id: plannerId },
		{ $set: { 'saved.$[item].lastUsed': usedAt } },
		{ arrayFilters: [{ 'item._id': { $in: savedIds } }] },
	);
};
