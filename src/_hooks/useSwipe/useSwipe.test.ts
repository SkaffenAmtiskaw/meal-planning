import { act, fireEvent, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type UseDragState, useDrag } from '@mantine/hooks';

import { useSwipe } from './useSwipe';

vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));

// Ends the drag useSwipe handed to useDrag, having moved by x and y.
function endDrag(x: number, y = 0, state: Partial<UseDragState> = {}): void {
	const handler = vi.mocked(useDrag).mock.lastCall?.[0] as (
		state: UseDragState,
	) => void;
	act(() =>
		handler({
			last: true,
			canceled: false,
			movement: [x, y],
			distance: [Math.abs(x), Math.abs(y)],
			...state,
		} as UseDragState),
	);
}

// Attaches the swipe to an element holding a button, and returns the button
// with a spy on its clicks.
function attach(ref: (node: HTMLElement | null) => unknown): {
	button: HTMLButtonElement;
	onClick: ReturnType<typeof vi.fn>;
	cleanup: unknown;
} {
	const element = document.createElement('div');
	const button = document.createElement('button');
	const onClick = vi.fn();
	button.addEventListener('click', onClick);
	element.append(button);
	return { button, onClick, cleanup: ref(element) };
}

describe('useSwipe', () => {
	const onSwipe = vi.fn();

	beforeEach(() => {
		onSwipe.mockReset();
	});

	it('reports a left swipe', () => {
		renderHook(() => useSwipe({ onSwipe }));

		endDrag(-60);

		expect(onSwipe).toHaveBeenCalledWith('left');
	});

	it('reports a right swipe', () => {
		renderHook(() => useSwipe({ onSwipe }));

		endDrag(60);

		expect(onSwipe).toHaveBeenCalledWith('right');
	});

	it('ignores a drag too short to count', () => {
		renderHook(() => useSwipe({ onSwipe }));

		endDrag(-20);

		expect(onSwipe).not.toHaveBeenCalled();
	});

	it('ignores a drag that goes more down than across', () => {
		renderHook(() => useSwipe({ onSwipe }));

		endDrag(-60, 80);

		expect(onSwipe).not.toHaveBeenCalled();
	});

	it('waits for the drag to end', () => {
		renderHook(() => useSwipe({ onSwipe }));

		endDrag(-60, 0, { last: false });

		expect(onSwipe).not.toHaveBeenCalled();
	});

	it('ignores a drag the browser canceled', () => {
		renderHook(() => useSwipe({ onSwipe }));

		endDrag(-60, 0, { canceled: true });

		expect(onSwipe).not.toHaveBeenCalled();
	});

	it('swallows the click that ends a swipe', () => {
		const { result } = renderHook(() => useSwipe({ onSwipe }));
		const { button, onClick } = attach(result.current);

		endDrag(-60);
		fireEvent.click(button);

		expect(onClick).not.toHaveBeenCalled();
	});

	it('swallows only the one click', () => {
		const { result } = renderHook(() => useSwipe({ onSwipe }));
		const { button, onClick } = attach(result.current);

		endDrag(-60);
		fireEvent.click(button);
		fireEvent.click(button);

		expect(onClick).toHaveBeenCalledOnce();
	});

	it('swallows the click that ends a drag too short to be a swipe', () => {
		const { result } = renderHook(() => useSwipe({ onSwipe }));
		const { button, onClick } = attach(result.current);

		endDrag(-20);
		fireEvent.click(button);

		expect(onClick).not.toHaveBeenCalled();
	});

	it("lets a tap's click through", () => {
		const { result } = renderHook(() => useSwipe({ onSwipe }));
		const { button, onClick } = attach(result.current);

		endDrag(-2);
		fireEvent.click(button);

		expect(onClick).toHaveBeenCalledOnce();
	});

	it('lets the next touch click after a swipe whose click never came', () => {
		const { result } = renderHook(() => useSwipe({ onSwipe }));
		const { button, onClick } = attach(result.current);

		endDrag(-60);
		fireEvent.pointerDown(button);
		fireEvent.click(button);

		expect(onClick).toHaveBeenCalledOnce();
	});

	it('stops swallowing clicks once detached', () => {
		const { result } = renderHook(() => useSwipe({ onSwipe }));
		const { button, onClick, cleanup } = attach(result.current);

		(cleanup as () => void)();
		endDrag(-60);
		fireEvent.click(button);

		expect(onClick).toHaveBeenCalledOnce();
	});

	it("detaches the drag's listeners too", () => {
		const dragCleanup = vi.fn();
		vi.mocked(useDrag).mockReturnValueOnce({
			ref: vi.fn(() => dragCleanup),
			active: false,
		});
		const { result } = renderHook(() => useSwipe({ onSwipe }));
		const { cleanup } = attach(result.current);

		(cleanup as () => void)();

		expect(dragCleanup).toHaveBeenCalled();
	});

	it('attaches nothing when given no element', () => {
		const { result } = renderHook(() => useSwipe({ onSwipe }));

		expect(result.current(null)).toBeUndefined();
	});
});
