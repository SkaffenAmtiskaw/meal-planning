import { useMemo } from 'react';

import { usePlannerContext } from '@/app/[planner]/_components';

export const usePlannerSavedItems = () => {
	const planner = usePlannerContext();

	return useMemo(
		() =>
			planner.saved.map((item) => ({
				_id: String(item._id),
				name: item.name,
				url: 'url' in item ? item.url : undefined,
			})),
		[planner.saved],
	);
};
