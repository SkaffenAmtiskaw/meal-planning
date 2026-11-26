'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

import type { ListHighlightHandlers } from './types';

type Options = {
	// How many items the list has now.
	count: number;
	// The highlight goes back to the first item whenever this changes, such as when the list is filtered.
	resetKey: string;
};

/**
 * One highlighted item in a list, moved by keys or set directly, while focus
 * stays where it is, such as in a search field. Follows useEditMode's shape.
 * The first item starts highlighted, and is highlighted again whenever the
 * reset key changes. A move stops at either end rather than wrapping. With no
 * items, nothing is highlighted. After a move or a reset, the highlighted item
 * scrolls into view.
 */
export const useListHighlight = ({
	count,
	resetKey,
}: Options): [number | null, ListHighlightHandlers] => {
	// `scrolls` counts the moves and resets, so each one scrolls once.
	const [state, setState] = useState({ index: 0, scrolls: 0 });

	// Set while rendering, as React's docs advise for state that follows a change, so the old item is never shown highlighted.
	const [prevResetKey, setPrevResetKey] = useState(resetKey);
	if (resetKey !== prevResetKey) {
		setPrevResetKey(resetKey);
		setState((current) => ({ index: 0, scrolls: current.scrolls + 1 }));
	}

	// Kept within the list when it shrinks without the reset key changing.
	const index = count === 0 ? null : Math.min(state.index, count - 1);

	const items = useRef(new Map<number, HTMLElement>());
	const scrollToHighlight = useEffectEvent(() => {
		if (index !== null) {
			items.current.get(index)?.scrollIntoView({ block: 'nearest' });
		}
	});
	useEffect(() => {
		if (state.scrolls > 0) {
			scrollToHighlight();
		}
	}, [state.scrolls]);

	// A move that stays put leaves the state as it is, so nothing re-renders, as ↓ on the last item does.
	const moveTo = (next: number) => {
		if (next !== index) {
			setState((current) => ({ index: next, scrolls: current.scrolls + 1 }));
		}
	};

	const moveNext = () => {
		if (index !== null) {
			moveTo(Math.min(index + 1, count - 1));
		}
	};
	const movePrevious = () => {
		if (index !== null) {
			moveTo(Math.max(index - 1, 0));
		}
	};
	// Hover calls this on every mouse move, so the same index leaves the state as it is.
	const highlight = (next: number) =>
		setState((current) =>
			current.index === next ? current : { ...current, index: next },
		);
	const itemRef = (itemIndex: number) => (element: HTMLElement | null) => {
		if (element) {
			items.current.set(itemIndex, element);
		} else {
			items.current.delete(itemIndex);
		}
	};

	return [index, { moveNext, movePrevious, highlight, itemRef }];
};
