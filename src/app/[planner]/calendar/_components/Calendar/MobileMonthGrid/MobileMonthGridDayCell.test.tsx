import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { MobileMonthGridDayCell } from './MobileMonthGridDayCell';
import type { MobileMonthGridMeal } from './types';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'@/_components',
	async () => await import('#mocks/@/_components/NumberMark'),
);

const dayProps = { tabIndex: 0 as const, onKeyDown: vi.fn(), ref: vi.fn() };

function renderCell({
	isToday = false,
	isSelected = false,
	isCurrentMonth = true,
	meals = [],
	onSelect = vi.fn(),
}: {
	isToday?: boolean;
	isSelected?: boolean;
	isCurrentMonth?: boolean;
	meals?: MobileMonthGridMeal[];
	onSelect?: () => void;
} = {}) {
	return render(
		<MobileMonthGridDayCell
			day={DateTime.local(2024, 3, 15)}
			isToday={isToday}
			isSelected={isSelected}
			isCurrentMonth={isCurrentMonth}
			meals={meals}
			dayProps={dayProps}
			onSelect={onSelect}
		/>,
	);
}

describe('MobileMonthGridDayCell', () => {
	it('rings today and marks the cell as the current date', () => {
		renderCell({ isToday: true });

		expect(screen.getByTestId('number-mark-15').getAttribute('data-ring')).toBe(
			'true',
		);
		expect(
			screen.getByTestId('mobile-day-cell').getAttribute('aria-current'),
		).toBe('date');
	});

	it('neither rings nor marks another day as the current date', () => {
		renderCell();

		expect(screen.getByTestId('number-mark-15').getAttribute('data-ring')).toBe(
			'false',
		);
		expect(
			screen.getByTestId('mobile-day-cell').getAttribute('aria-current'),
		).toBeNull();
	});

	it('fills the selected day and marks it pressed', () => {
		renderCell({ isSelected: true });

		expect(
			screen.getByTestId('number-mark-15').getAttribute('data-filled'),
		).toBe('true');
		expect(
			screen.getByTestId('mobile-day-cell').getAttribute('aria-pressed'),
		).toBe('true');
	});

	it('does not fill a day that is not selected', () => {
		renderCell();

		expect(
			screen.getByTestId('number-mark-15').getAttribute('data-filled'),
		).toBe('false');
	});

	it('mutes a day outside the month', () => {
		renderCell({ isCurrentMonth: false });

		expect(
			screen.getByTestId('number-mark-15').getAttribute('data-muted'),
		).toBe('true');
	});

	it('does not mute a day in the month', () => {
		renderCell();

		expect(
			screen.getByTestId('number-mark-15').getAttribute('data-muted'),
		).toBe('false');
	});

	it('shows up to 3 dots in their meals’ colors', () => {
		renderCell({
			meals: [
				{ id: '1', date: '2024-03-15', color: '#FF0000' },
				{ id: '2', date: '2024-03-15', color: '#00FF00' },
				{ id: '3', date: '2024-03-15', color: '#0000FF' },
				{ id: '4', date: '2024-03-15', color: '#FFFF00' },
			],
		});

		const dots = screen
			.getByTestId('mobile-day-cell')
			.querySelectorAll('[aria-hidden="true"]');

		expect(dots).toHaveLength(3);
		expect((dots[0] as HTMLElement).style.backgroundColor).toBe(
			'rgb(255, 0, 0)',
		);
		expect((dots[1] as HTMLElement).style.backgroundColor).toBe(
			'rgb(0, 255, 0)',
		);
		expect((dots[2] as HTMLElement).style.backgroundColor).toBe(
			'rgb(0, 0, 255)',
		);
	});

	it('shows no dots on a day without meals', () => {
		renderCell();

		expect(
			screen
				.getByTestId('mobile-day-cell')
				.querySelectorAll('[aria-hidden="true"]'),
		).toHaveLength(0);
	});

	it('names the cell with its date and meal count', () => {
		renderCell({ meals: [{ id: '1', date: '2024-03-15', color: '#FF0000' }] });

		expect(
			screen.getByTestId('mobile-day-cell').getAttribute('aria-label'),
		).toBe('March 15, 1 meals');
	});

	it('selects the day when tapped', () => {
		const onSelect = vi.fn();
		renderCell({ onSelect });

		fireEvent.click(screen.getByTestId('mobile-day-cell'));

		expect(onSelect).toHaveBeenCalledOnce();
	});
});
