import type { RefCallback } from 'react';

export type UseScrollItemsOptions<K> = {
	// The gap, in px, left above an item scrolled to the top. 0 by default.
	offset?: number;
	// Called with the topmost item's key each time scrolling pauses on a new one.
	onTopmostChange?: (key: K) => void;
};

export type ScrollItems<K> = {
	// The ref to attach to the item with this key. The same ref for a key on every render.
	itemRef: (key: K) => RefCallback<HTMLElement>;
	// Scrolls the item to the top, less the offset. False if no item has that key, and nothing scrolls.
	scrollTo: (key: K, behavior?: ScrollBehavior) => boolean;
};
