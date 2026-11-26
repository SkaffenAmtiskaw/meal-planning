import type { SavedItem } from '@/_actions/library/types';

// Whether a saved meal has ever linked the item. The phone list's rows and title both ask this, so they agree.
export const hasBeenUsed = (item: SavedItem): boolean =>
	item.lastUsed !== undefined;
