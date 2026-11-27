import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RefCallback } from 'react';

import { useScrollItems } from './useScrollItems';

const REGION_TOP = 100;

/**
 * A scroll region whose items sit at the given offsets from the top of its
 * content. Like a browser, it rounds a scroll position down to a whole pixel.
 */
function createRegion(): HTMLDivElement {
	const region = document.createElement('div');
	vi.spyOn(region, 'getBoundingClientRect').mockReturnValue({
		top: REGION_TOP,
	} as DOMRect);
	region.scrollTo = vi.fn((options?: ScrollToOptions | number) => {
		region.scrollTop = Math.floor((options as ScrollToOptions).top ?? 0);
	}) as typeof region.scrollTo;
	return region;
}

function createItem(region: HTMLElement, offset: number): HTMLElement {
	const item = document.createElement('div');
	vi.spyOn(item, 'getBoundingClientRect').mockImplementation(
		() => ({ top: REGION_TOP + offset - region.scrollTop }) as DOMRect,
	);
	return item;
}

function scrollRegion(region: HTMLElement, scrollTop: number): void {
	region.scrollTop = scrollTop;
	act(() => {
		region.dispatchEvent(new Event('scroll'));
	});
}

function waitForPause(): void {
	act(() => {
		vi.advanceTimersByTime(150);
	});
}

function setUp(
	offsets: Record<string, number>,
	options: { offset?: number } = {},
) {
	const region = createRegion();
	const onTopmostChange = vi.fn();
	const hook = renderHook(() =>
		useScrollItems<string>(
			{ current: region },
			{ ...options, onTopmostChange },
		),
	);
	const cleanups = new Map<string, unknown>();
	for (const [key, offset] of Object.entries(offsets)) {
		const ref = hook.result.current.itemRef(key) as RefCallback<HTMLElement>;
		cleanups.set(key, ref(createItem(region, offset)));
	}
	return { region, onTopmostChange, hook, cleanups };
}

describe('useScrollItems', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('scrollTo', () => {
		it('scrolls the item to the offset below the top of the region', () => {
			const { region, hook } = setUp({ a: 0, b: 300 }, { offset: 12 });

			const found = hook.result.current.scrollTo('b', 'smooth');

			expect(found).toBe(true);
			expect(region.scrollTo).toHaveBeenCalledWith({
				top: 288,
				behavior: 'smooth',
			});
		});

		it('allows for how far the region has already scrolled', () => {
			const { region, hook } = setUp({ a: 0, b: 300 });
			region.scrollTop = 500;

			hook.result.current.scrollTo('b');

			expect(region.scrollTo).toHaveBeenCalledWith({
				top: 300,
				behavior: undefined,
			});
		});

		it('reports that an item that was never attached is missing, and stays put', () => {
			const { region, hook } = setUp({ a: 0 });

			const found = hook.result.current.scrollTo('z', 'smooth');

			expect(found).toBe(false);
			expect(region.scrollTo).not.toHaveBeenCalled();
		});

		it('forgets an item once it is detached', () => {
			const { region, hook, cleanups } = setUp({ a: 0, b: 300 });

			(cleanups.get('b') as () => void)();

			expect(hook.result.current.scrollTo('b')).toBe(false);
			expect(region.scrollTo).not.toHaveBeenCalled();
		});
	});

	it('ignores a ref called with no element', () => {
		const { region, hook } = setUp({});

		(hook.result.current.itemRef('a') as RefCallback<HTMLElement>)(null);

		expect(hook.result.current.scrollTo('a')).toBe(false);
		expect(region.scrollTo).not.toHaveBeenCalled();
	});

	it('gives the same ref for a key on every render', () => {
		const { hook } = setUp({});
		const first = hook.result.current.itemRef('a');

		hook.rerender();

		expect(hook.result.current.itemRef('a')).toBe(first);
	});

	describe('the topmost item', () => {
		it('is reported once scrolling pauses', () => {
			const { region, onTopmostChange } = setUp({ a: 0, b: 300, c: 600 });

			scrollRegion(region, 350);
			act(() => {
				vi.advanceTimersByTime(149);
			});
			expect(onTopmostChange).not.toHaveBeenCalled();
			waitForPause();

			expect(onTopmostChange).toHaveBeenCalledExactlyOnceWith('b');
		});

		it('is reported once for a scroll that keeps going', () => {
			const { region, onTopmostChange } = setUp({ a: 0, b: 300, c: 600 });

			scrollRegion(region, 100);
			act(() => {
				vi.advanceTimersByTime(100);
			});
			scrollRegion(region, 650);
			waitForPause();

			expect(onTopmostChange).toHaveBeenCalledExactlyOnceWith('c');
		});

		it('counts an item scrolled to the offset as the topmost', () => {
			const { region, onTopmostChange } = setUp(
				{ a: 0, b: 300 },
				{ offset: 12 },
			);

			scrollRegion(region, 288);
			waitForPause();

			expect(onTopmostChange).toHaveBeenCalledWith('b');
		});

		it('counts an item whose offset is not a whole pixel, after scrollTo puts it at the top', () => {
			const { region, hook, onTopmostChange } = setUp(
				{ a: 1255.016, b: 1555.016 },
				{ offset: 12 },
			);

			act(() => {
				hook.result.current.scrollTo('b');
			});
			act(() => {
				region.dispatchEvent(new Event('scroll'));
			});
			waitForPause();

			expect(region.scrollTop).toBe(1543);
			expect(onTopmostChange).toHaveBeenCalledWith('b');
		});

		it('goes by where items sit, not the order they were attached in', () => {
			const { region, onTopmostChange } = setUp({ c: 600, b: 300, a: 0 });

			scrollRegion(region, 350);
			waitForPause();

			expect(onTopmostChange).toHaveBeenCalledWith('b');
		});

		it('is the first item when every item is below the offset', () => {
			const { region, onTopmostChange } = setUp(
				{ a: 8, b: 300 },
				{ offset: 0 },
			);

			scrollRegion(region, 0);
			waitForPause();

			expect(onTopmostChange).toHaveBeenCalledWith('a');
		});

		it('is not reported again while it stays the same', () => {
			const { region, onTopmostChange } = setUp({ a: 0, b: 300 });

			scrollRegion(region, 320);
			waitForPause();
			scrollRegion(region, 340);
			waitForPause();

			expect(onTopmostChange).toHaveBeenCalledOnce();
		});

		it('is not reported when no item is attached', () => {
			const { region, onTopmostChange } = setUp({});

			scrollRegion(region, 100);
			waitForPause();

			expect(onTopmostChange).not.toHaveBeenCalled();
		});

		it('is not reported after unmount', () => {
			const { region, hook, onTopmostChange } = setUp({ a: 0, b: 300 });

			scrollRegion(region, 320);
			hook.unmount();
			waitForPause();
			scrollRegion(region, 0);
			waitForPause();

			expect(onTopmostChange).not.toHaveBeenCalled();
		});
	});

	it('does nothing when the region is not attached', () => {
		const { result } = renderHook(() =>
			useScrollItems<string>({ current: null }),
		);
		(result.current.itemRef('a') as RefCallback<HTMLElement>)(
			document.createElement('div'),
		);

		expect(result.current.scrollTo('a')).toBe(false);
	});
});
