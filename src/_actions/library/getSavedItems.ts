import 'server-only';

import { getPlanner } from '@/_actions/planner/getPlanner';

import { resolveTags } from './resolveTags';
import type { SavedItem } from './types';

// getPlanner checks the user's read access, and its cache shares one read with the page.
export const getSavedItems = async (
	plannerId: string,
): Promise<SavedItem[]> => {
	const planner = await getPlanner(plannerId);

	return planner.saved.map((item): SavedItem => {
		const summary = {
			_id: item._id,
			name: item.name,
			tags: resolveTags(item.tags, planner.tags),
			...(item.lastUsed && { lastUsed: item.lastUsed.toISOString() }),
		};
		// Only a bookmark has a url, so stored items need no kind of their own.
		return 'url' in item
			? { ...summary, kind: 'bookmark', url: item.url }
			: { ...summary, kind: 'recipe' };
	});
};
