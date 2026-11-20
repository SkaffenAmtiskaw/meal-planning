import { useContext, useMemo } from 'react';

import { PlannerSavedItemsContext } from './PlannerSavedItemsContext';

export const usePlannerSavedItems = () => {
	const saved = useContext(PlannerSavedItemsContext);
	if (!saved) {
		throw new Error(
			'usePlannerSavedItems must be used inside PlannerSavedItemsProvider',
		);
	}

	return useMemo(
		() =>
			saved.map((item) => ({
				_id: item._id,
				name: item.name,
				url: 'url' in item ? item.url : undefined,
			})),
		[saved],
	);
};
