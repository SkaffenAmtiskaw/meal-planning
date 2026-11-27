'use client';

import {
	type RefCallback,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
} from 'react';

import type { ScrollItems, UseScrollItemsOptions } from './types';

// How long scrolling has to stop, in ms, before the topmost item is reported.
const PAUSE_MS = 150;
/**
 * Browsers round a scroll position to a whole pixel, so an item scrolled to the
 * top can sit up to a pixel below the offset and still be the one at the top.
 */
const ROUNDING_PX = 1;

/**
 * Keeps track of keyed items in a scroll region: scrolls one to the top, and
 * reports which item is at the top once scrolling pauses.
 */
export function useScrollItems<K>(
	regionRef: RefObject<HTMLElement | null>,
	{ offset = 0, onTopmostChange }: UseScrollItemsOptions<K> = {},
): ScrollItems<K> {
	const items = useRef(new Map<K, HTMLElement>());
	const refs = useRef(new Map<K, RefCallback<HTMLElement>>());
	const onTopmostChangeRef = useRef(onTopmostChange);
	onTopmostChangeRef.current = onTopmostChange;

	const itemRef = useCallback((key: K): RefCallback<HTMLElement> => {
		const cached = refs.current.get(key);
		if (cached) return cached;
		const ref: RefCallback<HTMLElement> = (node) => {
			if (!node) return;
			items.current.set(key, node);
			/**
			 * Lets go of the item and its ref, so neither outlives the item. Each
			 * check skips a newer element or ref the key has gained since.
			 */
			return () => {
				if (items.current.get(key) === node) items.current.delete(key);
				if (refs.current.get(key) === ref) refs.current.delete(key);
			};
		};
		refs.current.set(key, ref);
		return ref;
	}, []);

	// An item's distance from the region's top edge, less the offset.
	const distanceFromTop = useCallback(
		(item: HTMLElement, region: HTMLElement): number =>
			item.getBoundingClientRect().top -
			region.getBoundingClientRect().top -
			offset,
		[offset],
	);

	const scrollTo = useCallback(
		(key: K, behavior?: ScrollBehavior): boolean => {
			const item = items.current.get(key);
			const region = regionRef.current;
			if (!item || !region) return false;
			region.scrollTo({
				top: region.scrollTop + distanceFromTop(item, region),
				behavior,
			});
			return true;
		},
		[distanceFromTop, regionRef],
	);

	useEffect(() => {
		const region = regionRef.current;
		if (!region) return;
		let reported: K | undefined;
		let timer: ReturnType<typeof setTimeout> | undefined;

		/**
		 * The last item at or above the top, or the item nearest the top when
		 * every item is below it.
		 */
		const findTopmost = (): K | undefined => {
			let lastAtTop: { key: K; distance: number } | undefined;
			let nearestBelow: { key: K; distance: number } | undefined;
			for (const [key, item] of items.current) {
				const distance = distanceFromTop(item, region);
				if (distance < ROUNDING_PX) {
					if (!lastAtTop || distance > lastAtTop.distance) {
						lastAtTop = { key, distance };
					}
				} else if (!nearestBelow || distance < nearestBelow.distance) {
					nearestBelow = { key, distance };
				}
			}
			return (lastAtTop ?? nearestBelow)?.key;
		};

		const handleScroll = () => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				const topmost = findTopmost();
				if (topmost === undefined || topmost === reported) return;
				reported = topmost;
				onTopmostChangeRef.current?.(topmost);
			}, PAUSE_MS);
		};

		region.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			region.removeEventListener('scroll', handleScroll);
			clearTimeout(timer);
		};
	}, [distanceFromTop, regionRef]);

	return { itemRef, scrollTo };
}
