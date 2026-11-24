import { useContext } from 'react';

import type { SavedItem } from '@/_actions/library/types';

import { PlannerSavedItemsContext } from './PlannerSavedItemsContext';

export const usePlannerSavedItems = (): SavedItem[] => {
	const saved = useContext(PlannerSavedItemsContext);
	if (!saved) {
		throw new Error(
			'usePlannerSavedItems must be used inside PlannerSavedItemsProvider',
		);
	}
	return saved;
};
