import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { KeyboardEvent } from 'react';

import { useDatePickerKeys } from './useDayKeys';

// A grid holding a day button for each date, as the picker's day props tag them.
function gridOf(dates: string[]): HTMLDivElement {
	const grid = document.createElement('div');
	for (const date of dates) {
		const button = document.createElement('button');
		button.dataset.date = date;
		grid.append(button);
	}
	document.body.replaceChildren(grid);
	return grid;
}

function dayButton(date: string): HTMLElement | null {
	return document.querySelector(`[data-date="${date}"]`);
}

function press(key: string): KeyboardEvent<HTMLButtonElement> {
	return {
		key,
		preventDefault: vi.fn(),
	} as unknown as KeyboardEvent<HTMLButtonElement>;
}

describe('useDatePickerKeys', () => {
	const onShownMonthChange = vi.fn();

	function renderKeys(shownMonth: string) {
		return renderHook(
			({ month }) =>
				useDatePickerKeys({ shownMonth: month, onShownMonthChange }),
			{ initialProps: { month: shownMonth } },
		);
	}

	beforeEach(() => {
		onShownMonthChange.mockReset();
	});

	it("tags each day's button with its date", () => {
		const { result } = renderKeys('2024-06-01');

		expect(result.current.getDayKeyProps('2024-06-12')['data-date']).toBe(
			'2024-06-12',
		);
	});

	it('focuses the target day when it is in the month on screen', () => {
		const { result } = renderKeys('2024-06-01');
		result.current.ref.current = gridOf(['2024-06-09', '2024-06-12']);

		act(() =>
			result.current.getDayKeyProps('2024-06-12').onKeyDown(press('Home')),
		);

		expect(document.activeElement).toBe(dayButton('2024-06-09'));
		expect(onShownMonthChange).not.toHaveBeenCalled();
	});

	it("shows the target's month when it is in another month", () => {
		const { result } = renderKeys('2024-06-01');
		result.current.ref.current = gridOf(['2024-06-15']);

		act(() =>
			result.current.getDayKeyProps('2024-06-15').onKeyDown(press('PageDown')),
		);

		expect(onShownMonthChange).toHaveBeenCalledWith('2024-07-01');
	});

	it('focuses the target day once its month is on screen', () => {
		const { result, rerender } = renderKeys('2024-06-01');
		result.current.ref.current = gridOf(['2024-06-15']);

		act(() =>
			result.current.getDayKeyProps('2024-06-15').onKeyDown(press('PageDown')),
		);
		result.current.ref.current = gridOf(['2024-07-15']);
		rerender({ month: '2024-07-01' });

		expect(document.activeElement).toBe(dayButton('2024-07-15'));
	});

	it('focuses the target only once', () => {
		const { result, rerender } = renderKeys('2024-06-01');
		result.current.ref.current = gridOf(['2024-06-15']);

		act(() =>
			result.current.getDayKeyProps('2024-06-15').onKeyDown(press('PageDown')),
		);
		result.current.ref.current = gridOf(['2024-07-15', '2024-07-16']);
		rerender({ month: '2024-07-01' });
		dayButton('2024-07-16')?.focus();
		rerender({ month: '2024-07-01' });

		expect(document.activeElement).toBe(dayButton('2024-07-16'));
	});

	it('stops the page scrolling on its keys', () => {
		const { result } = renderKeys('2024-06-01');
		result.current.ref.current = gridOf(['2024-06-15']);
		const event = press('End');

		act(() => result.current.getDayKeyProps('2024-06-12').onKeyDown(event));

		expect(event.preventDefault).toHaveBeenCalled();
	});

	it('leaves other keys to Mantine', () => {
		const { result } = renderKeys('2024-06-01');
		const event = press('ArrowDown');

		act(() => result.current.getDayKeyProps('2024-06-12').onKeyDown(event));

		expect(event.preventDefault).not.toHaveBeenCalled();
		expect(onShownMonthChange).not.toHaveBeenCalled();
	});
});
