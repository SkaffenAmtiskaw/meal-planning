'use client';

import type { ReactNode } from 'react';

import { DishLinkingContext } from './DishLinkingContext';
import type { DishLinking } from './useDishLinking';

type Props = {
	value: DishLinking;
	children: ReactNode;
};

/**
 * Passes the meal form's linking state and actions down to the pieces inside
 * each dish row, without passing them as props through the dish list and the row.
 */
export const DishLinkingProvider = ({ value, children }: Props) => (
	<DishLinkingContext.Provider value={value}>
		{children}
	</DishLinkingContext.Provider>
);
