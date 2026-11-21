import { useContext, useMemo } from 'react';

import { PlannerSavedItemsContext } from './PlannerSavedItemsContext';

import type { SavedItem } from '../../types';

export const usePlannerSavedItems = (): SavedItem[] => {
	const saved = useContext(PlannerSavedItemsContext);
	if (!saved) {
		throw new Error(
			'usePlannerSavedItems must be used inside PlannerSavedItemsProvider',
		);
	}

	return useMemo(
		() =>
			// Only a bookmark has a url, which is how toCalendarMeals tells it from a recipe.
			saved.map((item) =>
				'url' in item
					? { _id: item._id, name: item.name, url: item.url }
					: { _id: item._id, name: item.name },
			),
		[saved],
	);
};
