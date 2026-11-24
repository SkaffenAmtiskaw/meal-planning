import type { SavedItem } from '@/_actions/library/types';

// The order the form lists saved recipes in: by name, ignoring case.
export const orderSavedItems = (savedItems: SavedItem[]): SavedItem[] =>
	savedItems.toSorted((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
	);
