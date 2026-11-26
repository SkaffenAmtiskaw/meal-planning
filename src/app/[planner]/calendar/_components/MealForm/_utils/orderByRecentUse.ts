import type { SavedItem } from '@/_actions/library/types';
import { compareIgnoringCaseAndAccents } from '@/_utils/compareIgnoringCaseAndAccents';

import { hasBeenUsed } from './hasBeenUsed';

// When the item was last used, in milliseconds. A never-used item counts as used at time zero, so it sorts after every used one.
const usedAt = (item: SavedItem) =>
	hasBeenUsed(item) ? Date.parse(item.lastUsedAt) : 0;

/**
 * The order the form lists saved recipes in: used ones first, most recently
 * used at the top, then the never-used ones. Items used at the same time, and
 * the never-used ones, go by name, ignoring case and accents.
 */
export const orderByRecentUse = (savedItems: SavedItem[]): SavedItem[] =>
	savedItems.toSorted(
		(a, b) =>
			usedAt(b) - usedAt(a) || compareIgnoringCaseAndAccents(a.name, b.name),
	);
