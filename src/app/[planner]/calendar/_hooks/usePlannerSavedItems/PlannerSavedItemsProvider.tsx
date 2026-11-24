'use client';

import type { ReactNode } from 'react';

import type { SavedItem } from '@/_actions/library/types';

import { PlannerSavedItemsContext } from './PlannerSavedItemsContext';

type Props = {
	savedItems: SavedItem[];
	children: ReactNode;
};

/**
 * Passes the saved items the calendar page reads on the server down to the
 * client components that show or link them, several levels below
 * CalendarView, without passing them as props through every component between.
 * When the server re-renders the page with new saved items, this passes them on.
 */
export const PlannerSavedItemsProvider = ({ savedItems, children }: Props) => (
	<PlannerSavedItemsContext.Provider value={savedItems}>
		{children}
	</PlannerSavedItemsContext.Provider>
);
