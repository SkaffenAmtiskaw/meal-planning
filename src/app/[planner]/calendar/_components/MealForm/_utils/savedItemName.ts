import type { SavedItem } from '@/_actions/library/types';

/**
 * The name of the saved recipe or bookmark a dish links to. A meal can still
 * link one the planner has since deleted, which gets a plain label.
 */
export const savedItemName = (savedItems: SavedItem[], savedId: string) =>
	savedItems.find((item) => item._id === savedId)?.name ?? 'Saved recipe';
