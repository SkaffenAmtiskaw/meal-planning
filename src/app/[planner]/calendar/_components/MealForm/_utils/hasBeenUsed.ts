import type { SavedItem } from '@/_actions/library/types';

// Whether a saved meal has ever linked the item. The order and the phone list's opening rows and title all ask this.
export const hasBeenUsed = (
	item: SavedItem,
): item is SavedItem & { lastUsedAt: string } => item.lastUsedAt !== undefined;
