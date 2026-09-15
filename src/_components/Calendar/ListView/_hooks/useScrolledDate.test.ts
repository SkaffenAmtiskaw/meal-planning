import { act, renderHook } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useScrolledDate } from './useScrolledDate';

const defaultRect: DOMRect = {
	top: 0,
	left: 0,
	bottom: 0,
	right: 0,
	width: 0,
	height: 0,
	x: 0,
	y: 0,
	toJSON: () => ({}),
};

function setBoundingClientRect(
	element: HTMLElement,
	value: Partial<DOMRect>,
): void {
	vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
		...defaultRect,
		...value,
	} as DOMRect);
}

function setRowBoundingClientRect(
	row: HTMLElement,
	container: HTMLElement,
	top: number,
): void {
	vi.spyOn(row, 'getBoundingClientRect').mockImplementation(
		() =>
			({
				...defaultRect,
				top: top - container.scrollTop,
			}) as DOMRect,
	);
}

function createContainerWithRows(
	rows: { iso: string; top: number }[],
	{
		containerTop = 0,
		scrollTop = 0,
	}: { containerTop?: number; scrollTop?: number } = {},
): HTMLElement {
	const container = document.createElement('div');
	container.scrollTop = scrollTop;
	setBoundingClientRect(container, { top: containerTop });

	for (const { iso, top } of rows) {
		const row = document.createElement('div');
		row.setAttribute('data-iso', iso);
		setRowBoundingClientRect(row, container, top);
		container.appendChild(row);
	}

	document.body.appendChild(container);
	return container;
}

function fireScroll(container: HTMLElement, scrollTop: number): void {
	container.scrollTop = scrollTop;
	act(() => {
		container.dispatchEvent(new Event('scroll', { bubbles: false }));
	});
}

function flushRaf(): void {
	act(() => {
		vi.advanceTimersByTime(16);
	});
}

function flushDebounce(): void {
	act(() => {
		vi.advanceTimersByTime(150);
	});
}

describe('useScrolledDate', () => {
	const createdContainers: HTMLElement[] = [];

	beforeEach(() => {
		vi.resetAllMocks();
		vi.useFakeTimers({
			toFake: [
				'setTimeout',
				'clearTimeout',
				'requestAnimationFrame',
				'cancelAnimationFrame',
			],
		});
	});

	afterEach(() => {
		createdContainers.forEach((container) => {
			container.remove();
		});
		createdContainers.length = 0;
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	function trackContainer(container: HTMLElement): HTMLElement {
		createdContainers.push(container);
		return container;
	}

	it('calls onScrolledDate with the last row whose offsetTop is <= scrollTop + LIST_VIEW_TOP_PADDING', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: '2024-06-13', top: 0 },
					{ iso: '2024-06-14', top: 100 },
					{ iso: '2024-06-15', top: 200 },
				],
				{ scrollTop: 88 },
			),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 88);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).toHaveBeenCalledTimes(1);
		expect(onScrolledDate).toHaveBeenCalledWith(DateTime.fromISO('2024-06-14'));
	});

	it('selects the previous day when scrollTop is just above the boundary', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: '2024-06-13', top: 0 },
					{ iso: '2024-06-14', top: 100 },
				],
				{ scrollTop: 87 },
			),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 87);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).toHaveBeenCalledTimes(1);
		expect(onScrolledDate).toHaveBeenCalledWith(DateTime.fromISO('2024-06-13'));
	});

	it('selects the next day when scrollTop passes the boundary', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: '2024-06-13', top: 0 },
					{ iso: '2024-06-14', top: 100 },
				],
				{ scrollTop: 88 },
			),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 88);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).toHaveBeenCalledTimes(1);
		expect(onScrolledDate).toHaveBeenCalledWith(DateTime.fromISO('2024-06-14'));
	});

	it('falls back to the first row when no row is within the threshold', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: '2024-06-13', top: 100 },
					{ iso: '2024-06-14', top: 200 },
				],
				{ scrollTop: 0 },
			),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).toHaveBeenCalledTimes(1);
		expect(onScrolledDate).toHaveBeenCalledWith(DateTime.fromISO('2024-06-13'));
	});

	it('throttles detection with requestAnimationFrame', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: '2024-06-13', top: 0 },
					{ iso: '2024-06-14', top: 100 },
				],
				{ scrollTop: 0 },
			),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 87);
		fireScroll(container, 88);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).toHaveBeenCalledTimes(1);
		expect(onScrolledDate).toHaveBeenCalledWith(DateTime.fromISO('2024-06-14'));
	});

	it('does not call onScrolledDate before the RAF callback runs', () => {
		const container = trackContainer(
			createContainerWithRows([{ iso: '2024-06-14', top: 0 }], {
				scrollTop: 0,
			}),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		act(() => {
			vi.advanceTimersByTime(149);
		});

		expect(onScrolledDate).not.toHaveBeenCalled();

		flushRaf();
		flushDebounce();

		expect(onScrolledDate).toHaveBeenCalledTimes(1);
		expect(onScrolledDate).toHaveBeenCalledWith(DateTime.fromISO('2024-06-14'));
	});

	it('debounces onScrolledDate by 150ms and resets the timer on continued scrolling', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: '2024-06-13', top: 0 },
					{ iso: '2024-06-14', top: 100 },
				],
				{ scrollTop: 0 },
			),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 87);
		flushRaf();
		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(onScrolledDate).not.toHaveBeenCalled();

		fireScroll(container, 88);
		flushRaf();
		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(onScrolledDate).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(50);
		});
		expect(onScrolledDate).toHaveBeenCalledTimes(1);
		expect(onScrolledDate).toHaveBeenCalledWith(DateTime.fromISO('2024-06-14'));
	});

	it('calls onScrolledDate after the debounce expires', () => {
		const container = trackContainer(
			createContainerWithRows([{ iso: '2024-06-15', top: 0 }], {
				scrollTop: 0,
			}),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		flushRaf();

		expect(onScrolledDate).not.toHaveBeenCalled();

		flushDebounce();

		expect(onScrolledDate).toHaveBeenCalledTimes(1);
		expect(onScrolledDate).toHaveBeenCalledWith(DateTime.fromISO('2024-06-15'));
	});

	it('cleans up the listener, pending RAF, and pending timer on unmount', () => {
		const container = trackContainer(
			createContainerWithRows([{ iso: '2024-06-15', top: 0 }], {
				scrollTop: 0,
			}),
		);
		const onScrolledDate = vi.fn();

		const { unmount } = renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		flushRaf();
		unmount();

		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();

		fireScroll(container, 0);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();
	});

	it('cancels a pending animation frame on unmount', () => {
		const container = trackContainer(
			createContainerWithRows([{ iso: '2024-06-15', top: 0 }], {
				scrollTop: 0,
			}),
		);
		const onScrolledDate = vi.fn();

		const { unmount } = renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		unmount();

		flushRaf();
		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();
	});

	it('does nothing when the container ref is null', () => {
		const onScrolledDate = vi.fn();

		expect(() => {
			renderHook(() =>
				useScrolledDate(
					{ current: null },
					'key-1',
					DateTime.local(2024, 1, 1),
					onScrolledDate,
				),
			);
		}).not.toThrow();

		flushRaf();
		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();
	});

	it('does nothing when there are no day rows', () => {
		const container = trackContainer(document.createElement('div'));
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();
	});

	it('re-initializes when rangeAnchorKey changes', () => {
		const container = trackContainer(
			createContainerWithRows([{ iso: '2024-06-15', top: 0 }], {
				scrollTop: 0,
			}),
		);
		const addListenerSpy = vi.spyOn(container, 'addEventListener');
		const removeListenerSpy = vi.spyOn(container, 'removeEventListener');

		const { rerender } = renderHook(
			({ rangeAnchorKey }: { rangeAnchorKey: string }) =>
				useScrolledDate(
					{ current: container },
					rangeAnchorKey,
					DateTime.local(2024, 1, 1),
					vi.fn(),
				),
			{ initialProps: { rangeAnchorKey: 'key-1' } },
		);

		expect(addListenerSpy).toHaveBeenCalledWith(
			'scroll',
			expect.any(Function),
			{ passive: true },
		);

		rerender({ rangeAnchorKey: 'key-2' });

		expect(removeListenerSpy).toHaveBeenCalledWith(
			'scroll',
			expect.any(Function),
		);
		expect(addListenerSpy).toHaveBeenCalledTimes(2);
	});

	it('does not call onScrolledDate when the detected date equals the provided selectedDate', () => {
		const container = trackContainer(
			createContainerWithRows([{ iso: '2024-06-14', top: 0 }], {
				scrollTop: 0,
			}),
		);
		const onScrolledDate = vi.fn();
		const selectedDate = DateTime.fromISO('2024-06-14');

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				selectedDate,
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();
	});

	it('cancels a pending debounce when the detected date returns to the selectedDate', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: '2024-06-14', top: 0 },
					{ iso: '2024-06-15', top: 100 },
				],
				{ scrollTop: 0 },
			),
		);
		const onScrolledDate = vi.fn();
		const selectedDate = DateTime.fromISO('2024-06-14');

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				selectedDate,
				onScrolledDate,
			),
		);

		fireScroll(container, 88);
		flushRaf();

		fireScroll(container, 0);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();
	});

	it('does not call onScrolledDate when the selected row has an invalid ISO date', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: 'not-a-date', top: 0 },
					{ iso: '2024-06-15', top: 100 },
				],
				{ scrollTop: 0 },
			),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();
	});

	it('does not call onScrolledDate when the selected row has a missing ISO date', () => {
		const container = trackContainer(
			createContainerWithRows(
				[
					{ iso: '', top: 0 },
					{ iso: '2024-06-15', top: 100 },
				],
				{ scrollTop: 0 },
			),
		);
		const onScrolledDate = vi.fn();

		renderHook(() =>
			useScrolledDate(
				{ current: container },
				'key-1',
				DateTime.local(2024, 1, 1),
				onScrolledDate,
			),
		);

		fireScroll(container, 0);
		flushRaf();
		flushDebounce();

		expect(onScrolledDate).not.toHaveBeenCalled();
	});
});
