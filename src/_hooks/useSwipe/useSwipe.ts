'use client';

import { type RefCallback, useCallback, useRef } from 'react';

import { useDrag } from '@mantine/hooks';

export type SwipeDirection = 'left' | 'right' | 'down';

export type UseSwipeOptions = {
	// Called with the direction of each finished swipe.
	onSwipe: (direction: SwipeDirection) => void;
	// Whether swipes are reported. On by default.
	enabled?: boolean;
};

// How far a drag has to travel, in px, to count as a swipe, so taps and small
// drags don't.
const MIN_DISTANCE = 40;
// How far a touch can move, in px, and still count as a tap.
const TAP_DISTANCE = 10;

/**
 * Reports a finished left, right or down swipe on each element the returned
 * ref is attached to, by whichever way the drag went further. The click any drag ends with is swallowed, so a swipe, or a drag
 * too short to be one, never presses what it ends on.
 */
export function useSwipe<T extends HTMLElement = HTMLElement>({
	onSwipe,
	enabled,
}: UseSwipeOptions): RefCallback<T> {
	// Whether the last touch moved further than a tap, until its click is swallowed.
	const dragged = useRef(false);

	const { ref: dragRef } = useDrag<T>(
		({ last, canceled, movement: [x, y], distance: [across, vertical] }) => {
			if (!last || canceled) {
				return;
			}
			dragged.current = Math.max(across, vertical) > TAP_DISTANCE;
			if (across >= MIN_DISTANCE && across > vertical) {
				onSwipe(x < 0 ? 'left' : 'right');
			} else if (vertical >= MIN_DISTANCE && vertical > across && y > 0) {
				onSwipe('down');
			}
		},
		{ enabled },
	);

	return useCallback(
		(node: T | null) => {
			if (!node) {
				return;
			}
			const cleanupDrag = dragRef(node);
			const controller = new AbortController();
			// A drag that ends off the element fires no click, so each new touch
			// starts clear.
			node.addEventListener(
				'pointerdown',
				() => {
					dragged.current = false;
				},
				{ capture: true, signal: controller.signal },
			);
			node.addEventListener(
				'click',
				(event) => {
					if (dragged.current) {
						dragged.current = false;
						event.preventDefault();
						event.stopPropagation();
					}
				},
				{ capture: true, signal: controller.signal },
			);
			return () => {
				controller.abort();
				cleanupDrag?.();
			};
		},
		[dragRef],
	);
}
