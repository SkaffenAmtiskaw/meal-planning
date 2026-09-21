import { act, renderHook } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useScrollToDate } from './useScrollToDate';

function setBoundingClientRect(
	element: HTMLElement,
	value: Partial<DOMRect>,
): void {
	Object.defineProperty(element, 'getBoundingClientRect', {
		value: vi.fn(() => ({ ...defaultRect, ...value })),
		configurable: true,
	});
}

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

function createContainerWithRow(
	isoDate: string,
	rowTop: number,
	containerTop = 0,
	scrollTop = 0,
) {
	const container = document.createElement('div');
	container.scrollTo = vi.fn();
	container.scrollTop = scrollTop;
	setBoundingClientRect(container, { top: containerTop });

	const row = document.createElement('div');
	row.setAttribute('data-iso', isoDate);
	setBoundingClientRect(row, { top: rowTop });
	container.appendChild(row);

	return { container, row };
}

describe('useScrollToDate', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns a scroll function', () => {
		const { result } = renderHook(() => useScrollToDate({ current: null }));

		expect(typeof result.current).toBe('function');
	});

	it('scrolls the container to the row top relative to the container minus 12', () => {
		const { container } = createContainerWithRow('2024-06-15', 100);
		const { result } = renderHook(() =>
			useScrollToDate({ current: container }),
		);

		act(() => {
			result.current(DateTime.fromISO('2024-06-15'));
		});

		expect(container.scrollTo).toHaveBeenCalledWith({
			top: 88,
			behavior: 'smooth',
		});
	});

	it('accounts for container offset and existing scroll position', () => {
		const { container } = createContainerWithRow('2024-06-15', 200, 50, 30);
		const { result } = renderHook(() =>
			useScrollToDate({ current: container }),
		);

		act(() => {
			result.current(DateTime.fromISO('2024-06-15'));
		});

		expect(container.scrollTo).toHaveBeenCalledWith({
			top: 168,
			behavior: 'smooth',
		});
	});

	it('adds the current scrollTop when the container is already scrolled', () => {
		const { container } = createContainerWithRow('2024-06-15', 100, 0, 42);
		const { result } = renderHook(() =>
			useScrollToDate({ current: container }),
		);

		act(() => {
			result.current(DateTime.fromISO('2024-06-15'));
		});

		expect(container.scrollTo).toHaveBeenCalledWith({
			top: 130,
			behavior: 'smooth',
		});
	});

	it('uses the provided scroll behavior', () => {
		const { container } = createContainerWithRow('2024-06-15', 100);
		const { result } = renderHook(() =>
			useScrollToDate({ current: container }),
		);

		act(() => {
			result.current(DateTime.fromISO('2024-06-15'), 'auto');
		});

		expect(container.scrollTo).toHaveBeenCalledWith({
			top: 88,
			behavior: 'auto',
		});
	});

	it('does nothing when the container ref is null', () => {
		const { result } = renderHook(() => useScrollToDate({ current: null }));

		expect(() => {
			act(() => {
				result.current(DateTime.fromISO('2024-06-15'));
			});
		}).not.toThrow();
	});

	it('does nothing when the target row is not found', () => {
		const container = document.createElement('div');
		container.scrollTo = vi.fn();
		setBoundingClientRect(container, { top: 0 });
		const { result } = renderHook(() =>
			useScrollToDate({ current: container }),
		);

		expect(() => {
			act(() => {
				result.current(DateTime.fromISO('2024-06-15'));
			});
		}).not.toThrow();

		expect(container.scrollTo).not.toHaveBeenCalled();
	});

	it('does nothing when the date has no ISO value', () => {
		const { container } = createContainerWithRow('2024-06-15', 100);
		const { result } = renderHook(() =>
			useScrollToDate({ current: container }),
		);

		expect(() => {
			act(() => {
				result.current(DateTime.invalid('invalid'));
			});
		}).not.toThrow();

		expect(container.scrollTo).not.toHaveBeenCalled();
	});
});
