import type { SavedItem } from '@/_actions/library/types';
import { compareIgnoringCase } from '@/_utils/compareIgnoringCase';

// When the item was last used, in milliseconds. A never-used item counts as used at time zero, so it sorts after every used one.
const usedAt = (item: SavedItem) =>
	item.lastUsed === undefined ? 0 : Date.parse(item.lastUsed);

/**
 * The order the form lists saved recipes in: used ones first, most recently
 * used at the top, then the never-used ones. Items used at the same time, and
 * the never-used ones, go by name, ignoring case.
 */
export const orderByRecentUse = (savedItems: SavedItem[]): SavedItem[] =>
	savedItems.toSorted(
		(a, b) => usedAt(b) - usedAt(a) || compareIgnoringCase(a.name, b.name),
	);
