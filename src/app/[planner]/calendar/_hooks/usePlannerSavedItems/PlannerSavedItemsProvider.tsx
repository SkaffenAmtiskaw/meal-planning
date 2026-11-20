'use client';

import type { ReactNode } from 'react';

import { PlannerSavedItemsContext } from './PlannerSavedItemsContext';

import type { SavedItem } from '../../types';

type Props = {
	savedItems: SavedItem[];
	children: ReactNode;
};

/**
 * Passes the saved items the calendar page renders on the server down to Add
 * Meal's saved-item dropdown, a client component several levels below
 * CalendarView, without passing them as props through every component between.
 * When the server re-renders the page with new saved items, this passes them on.
 */
export const PlannerSavedItemsProvider = ({ savedItems, children }: Props) => (
	<PlannerSavedItemsContext.Provider value={savedItems}>
		{children}
	</PlannerSavedItemsContext.Provider>
);
