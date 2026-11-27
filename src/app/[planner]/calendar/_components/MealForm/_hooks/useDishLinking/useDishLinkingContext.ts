import { useContext } from 'react';

import { DishLinkingContext } from './DishLinkingContext';
import type { DishLinking } from './useDishLinking';

// The meal form's linking state and actions, for a piece inside a dish row.
export const useDishLinkingContext = (): DishLinking => {
	const linking = useContext(DishLinkingContext);
	if (!linking) {
		throw new Error(
			'useDishLinkingContext must be used inside DishLinkingProvider',
		);
	}
	return linking;
};
