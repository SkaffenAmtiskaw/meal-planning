import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useListHighlight } from './useListHighlight';
import type { ListHighlightHandlers } from './types';

const renderHighlight = (count: number, resetKey = '') =>
	renderHook(({ count, resetKey }) => useListHighlight({ count, resetKey }), {
		initialProps: { count, resetKey },
	});

// An element for each item, whose scrolls the test can see.
const attachItems = (
	result: { current: ReturnType<typeof useListHighlight> },
	count: number,
) =>
	Array.from({ length: count }, (_, index) => {
		const element = document.createElement('div');
		element.scrollIntoView = vi.fn();
		result.current[1].itemRef(index)(element);
		return element;
	});

describe('useListHighlight', () => {
	it('highlights the first item to start with', () => {
		const { result } = renderHighlight(3);

		expect(result.current[0]).toBe(0);
	});

	it('highlights nothing with no items', () => {
		const { result } = renderHighlight(0);

		expect(result.current[0]).toBeNull();
	});

	it('moves to the next and previous items', () => {
		const { result } = renderHighlight(3);

		act(() => result.current[1].moveNext());
		act(() => result.current[1].moveNext());
		expect(result.current[0]).toBe(2);

		act(() => result.current[1].movePrevious());
		expect(result.current[0]).toBe(1);
	});

	it('stays on the last item at the end and the first at the start, rather than wrapping', () => {
		const { result } = renderHighlight(2);

		act(() => result.current[1].movePrevious());
		expect(result.current[0]).toBe(0);

		act(() => result.current[1].moveNext());
		act(() => result.current[1].moveNext());
		expect(result.current[0]).toBe(1);
	});

	it('does nothing on a move with no items', () => {
		const { result } = renderHighlight(0);

		act(() => result.current[1].moveNext());
		act(() => result.current[1].movePrevious());

		expect(result.current[0]).toBeNull();
	});

	it('highlights an item set directly', () => {
		const { result } = renderHighlight(3);

		act(() => result.current[1].highlight(2));

		expect(result.current[0]).toBe(2);
	});

	it('goes back to the first item when the reset key changes', () => {
		const { result, rerender } = renderHighlight(3, 'a');
		act(() => result.current[1].highlight(2));

		rerender({ count: 3, resetKey: 'b' });

		expect(result.current[0]).toBe(0);
	});

	it('keeps its place when the list rerenders with the same reset key', () => {
		const { result, rerender } = renderHighlight(3, 'a');
		act(() => result.current[1].highlight(2));

		rerender({ count: 3, resetKey: 'a' });

		expect(result.current[0]).toBe(2);
	});

	it('moves to the last item when the list shrinks past the highlight', () => {
		const { result, rerender } = renderHighlight(3);
		act(() => result.current[1].highlight(2));

		rerender({ count: 2, resetKey: '' });
		expect(result.current[0]).toBe(1);

		act(() => result.current[1].movePrevious());
		expect(result.current[0]).toBe(0);
	});

	it('scrolls the highlighted item into view after a move', () => {
		const { result } = renderHighlight(3);
		const items = attachItems(result, 3);

		act(() => result.current[1].moveNext());

		expect(items[1].scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
	});

	it('scrolls the first item into view after a reset', () => {
		const { result, rerender } = renderHighlight(3, 'a');
		const items = attachItems(result, 3);
		act(() => result.current[1].highlight(2));

		rerender({ count: 3, resetKey: 'b' });

		expect(items[0].scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
	});

	// The pointer is already on the item, and scrolling would move the list under it.
	it('scrolls nothing when an item is set directly, or on the first render', () => {
		const { result } = renderHighlight(3);
		const items = attachItems(result, 3);

		act(() => result.current[1].highlight(2));

		for (const item of items) {
			expect(item.scrollIntoView).not.toHaveBeenCalled();
		}
	});

	it('highlights nothing after a reset with no items, then the first item once there are some', () => {
		const { result, rerender } = renderHighlight(0, 'a');

		rerender({ count: 0, resetKey: 'b' });
		expect(result.current[0]).toBeNull();

		rerender({ count: 2, resetKey: 'b' });
		expect(result.current[0]).toBe(0);
	});

	// Hover reports every mouse move, so a highlight that stays put mustn't re-render the list each time. React may render once more before it sees nothing changed, so the test repeats each call.
	it.each<[string, (handlers: ListHighlightHandlers) => void]>([
		['hovering the highlighted item', (handlers) => handlers.highlight(1)],
		['a move past the end', (handlers) => handlers.moveNext()],
	])('renders at most once more for repeated %s', (_, call) => {
		let renders = 0;
		const { result } = renderHook(() => {
			renders += 1;
			return useListHighlight({ count: 2, resetKey: '' });
		});
		act(() => result.current[1].highlight(1));
		const rendersBefore = renders;

		for (let repeat = 0; repeat < 3; repeat += 1) {
			act(() => call(result.current[1]));
		}

		expect(renders - rendersBefore).toBeLessThanOrEqual(1);
		expect(result.current[0]).toBe(1);
	});

	it('forgets an item once its element is gone', () => {
		const { result } = renderHighlight(2);
		const items = attachItems(result, 2);
		result.current[1].itemRef(1)(null);

		act(() => result.current[1].moveNext());

		expect(items[1].scrollIntoView).not.toHaveBeenCalled();
	});
});
