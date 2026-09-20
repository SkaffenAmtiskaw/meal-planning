import { createElement } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRovingGridFocus } from './useRovingGridFocus';

interface TestGridProps {
	days: DateTime[];
	initialFocusIndex: number;
}

function TestGrid({ days, initialFocusIndex }: TestGridProps) {
	const { getDayProps } = useRovingGridFocus({ days, initialFocusIndex });

	return createElement(
		'div',
		{ role: 'grid' },
		days.map((day, index) => {
			const { tabIndex, onKeyDown, ref } = getDayProps(index);
			return createElement(
				'div',
				{
					key: day.toISODate(),
					'data-testid': `day-${index}`,
					tabIndex,
					onKeyDown,
					ref,
				},
				day.day,
			);
		}),
	);
}

describe('useRovingGridFocus', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	function renderGrid(days: DateTime[], initialFocusIndex: number) {
		return render(createElement(TestGrid, { days, initialFocusIndex }));
	}

	it('sets tabIndex=0 on the initially focused day and -1 on others', () => {
		const days = [
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		];

		renderGrid(days, 1);

		expect(screen.getByTestId('day-0').getAttribute('tabindex')).toBe('-1');
		expect(screen.getByTestId('day-1').getAttribute('tabindex')).toBe('0');
		expect(screen.getByTestId('day-2').getAttribute('tabindex')).toBe('-1');
	});

	it('moves focus to the next day with ArrowRight', () => {
		const days = [
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		];

		renderGrid(days, 1);

		fireEvent.keyDown(screen.getByTestId('day-1'), { key: 'ArrowRight' });

		expect(screen.getByTestId('day-1').getAttribute('tabindex')).toBe('-1');
		expect(screen.getByTestId('day-2').getAttribute('tabindex')).toBe('0');
	});

	it('moves focus to the previous day with ArrowLeft', () => {
		const days = [
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		];

		renderGrid(days, 1);

		fireEvent.keyDown(screen.getByTestId('day-1'), { key: 'ArrowLeft' });

		expect(screen.getByTestId('day-0').getAttribute('tabindex')).toBe('0');
		expect(screen.getByTestId('day-1').getAttribute('tabindex')).toBe('-1');
	});

	it('moves focus down one week with ArrowDown', () => {
		const days = Array.from({ length: 14 }, (_, i) =>
			DateTime.local(2024, 3, 1 + i),
		);

		renderGrid(days, 0);

		fireEvent.keyDown(screen.getByTestId('day-0'), { key: 'ArrowDown' });

		expect(screen.getByTestId('day-0').getAttribute('tabindex')).toBe('-1');
		expect(screen.getByTestId('day-7').getAttribute('tabindex')).toBe('0');
	});

	it('moves focus up one week with ArrowUp', () => {
		const days = Array.from({ length: 14 }, (_, i) =>
			DateTime.local(2024, 3, 1 + i),
		);

		renderGrid(days, 7);

		fireEvent.keyDown(screen.getByTestId('day-7'), { key: 'ArrowUp' });

		expect(screen.getByTestId('day-0').getAttribute('tabindex')).toBe('0');
		expect(screen.getByTestId('day-7').getAttribute('tabindex')).toBe('-1');
	});

	it('does not move focus right from the last column', () => {
		const days = Array.from({ length: 7 }, (_, i) =>
			DateTime.local(2024, 3, 1 + i),
		);

		renderGrid(days, 6);

		fireEvent.keyDown(screen.getByTestId('day-6'), { key: 'ArrowRight' });

		expect(screen.getByTestId('day-6').getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus right past the last day', () => {
		const days = [DateTime.local(2024, 3, 14), DateTime.local(2024, 3, 15)];

		renderGrid(days, 1);

		fireEvent.keyDown(screen.getByTestId('day-1'), { key: 'ArrowRight' });

		expect(screen.getByTestId('day-1').getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus left from the first column', () => {
		const days = Array.from({ length: 7 }, (_, i) =>
			DateTime.local(2024, 3, 1 + i),
		);

		renderGrid(days, 0);

		fireEvent.keyDown(screen.getByTestId('day-0'), { key: 'ArrowLeft' });

		expect(screen.getByTestId('day-0').getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus down from the last row', () => {
		const days = Array.from({ length: 14 }, (_, i) =>
			DateTime.local(2024, 3, 1 + i),
		);

		renderGrid(days, 7);

		fireEvent.keyDown(screen.getByTestId('day-7'), { key: 'ArrowDown' });

		expect(screen.getByTestId('day-7').getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus up from the first row', () => {
		const days = Array.from({ length: 14 }, (_, i) =>
			DateTime.local(2024, 3, 1 + i),
		);

		renderGrid(days, 0);

		fireEvent.keyDown(screen.getByTestId('day-0'), { key: 'ArrowUp' });

		expect(screen.getByTestId('day-0').getAttribute('tabindex')).toBe('0');
	});

	it('ignores keys other than arrow keys', () => {
		const days = [
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		];

		renderGrid(days, 1);

		fireEvent.keyDown(screen.getByTestId('day-1'), { key: 'Enter' });

		expect(screen.getByTestId('day-1').getAttribute('tabindex')).toBe('0');
	});

	it('resets focused index when days change', () => {
		const days = [
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		];

		const { rerender } = renderGrid(days, 1);

		fireEvent.keyDown(screen.getByTestId('day-1'), { key: 'ArrowRight' });
		expect(screen.getByTestId('day-2').getAttribute('tabindex')).toBe('0');

		const newDays = [DateTime.local(2024, 4, 1), DateTime.local(2024, 4, 2)];

		rerender(createElement(TestGrid, { days: newDays, initialFocusIndex: 0 }));

		expect(screen.getByTestId('day-0').getAttribute('tabindex')).toBe('0');
		expect(screen.getByTestId('day-1').getAttribute('tabindex')).toBe('-1');
	});

	it('calls preventDefault for handled arrow keys', () => {
		const days = [
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		];

		renderGrid(days, 1);

		const event = new KeyboardEvent('keydown', {
			key: 'ArrowRight',
			bubbles: true,
		});
		const preventDefault = vi.spyOn(event, 'preventDefault');
		fireEvent(screen.getByTestId('day-1'), event);

		expect(preventDefault).toHaveBeenCalled();
	});

	it('does not call preventDefault for unhandled keys', () => {
		const days = [
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		];

		renderGrid(days, 1);

		const event = new KeyboardEvent('keydown', {
			key: 'Enter',
			bubbles: true,
		});
		const preventDefault = vi.spyOn(event, 'preventDefault');
		fireEvent(screen.getByTestId('day-1'), event);

		expect(preventDefault).not.toHaveBeenCalled();
	});

	it('programmatically focuses the newly focused element after an arrow move', () => {
		const days = [
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		];

		renderGrid(days, 1);

		const day2 = screen.getByTestId('day-2');
		const focus = vi.spyOn(day2, 'focus');

		fireEvent.keyDown(screen.getByTestId('day-1'), { key: 'ArrowRight' });

		expect(focus).toHaveBeenCalled();
	});
});
