import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { MobileMonthGrid } from './MobileMonthGrid';
import type { MobileMonthGridMeal } from './types';

import { useCalendarContext } from '../CalendarContext';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_components', () => ({
	NumberMark: ({
		children,
		ring = false,
		filled = false,
		muted = false,
		...ariaProps
	}: {
		children: React.ReactNode;
		ring?: boolean;
		filled?: boolean;
		muted?: boolean;
	}) => (
		<span
			data-testid={`number-mark-${children}`}
			data-ring={String(ring)}
			data-filled={String(filled)}
			data-muted={String(muted)}
			{...ariaProps}
		>
			{children}
		</span>
	),
}));
vi.mock('../CalendarContext', async () => ({
	useCalendarContext: vi.fn(),
}));

interface RenderOptions {
	selectedDate?: DateTime;
	meals?: MobileMonthGridMeal[];
	setSelectedDate?: (date: DateTime) => void;
}

function renderGrid({
	selectedDate = DateTime.local(2024, 3, 15),
	meals = [],
	setSelectedDate = vi.fn(),
}: RenderOptions = {}) {
	vi.mocked(useCalendarContext).mockReturnValue({
		selectedDate,
		viewType: 'month',
		rangeAnchor: selectedDate,
		setSelectedDate,
		setViewType: vi.fn(),
		navigateToDate: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
	} as ReturnType<typeof useCalendarContext>);

	return render(<MobileMonthGrid meals={meals} />);
}

describe('MobileMonthGrid', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders a 7-column weekday header with single-letter labels', () => {
		renderGrid();

		const headers = screen.getAllByText(/^[A-Z]$/);

		expect(headers).toHaveLength(7);
		expect(headers.map((header) => header.textContent)).toEqual([
			'S',
			'M',
			'T',
			'W',
			'T',
			'F',
			'S',
		]);
		headers.forEach((header) => {
			expect(header.getAttribute('data-c')).toBe('navy.4');
		});
	});

	it('renders the current month plus leading and trailing days', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells).toHaveLength(42);
		expect(cells[0].textContent).toContain('25');
		expect(cells[cells.length - 1].textContent).toContain('6');
	});

	it('rings today and marks it as the current date', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		renderGrid({ selectedDate: DateTime.local(2024, 3, 10) });

		const todayMark = screen.getByTestId('number-mark-15');
		const otherMark = screen.getByTestId('number-mark-14');

		expect(todayMark.getAttribute('data-ring')).toBe('true');
		expect(todayMark.getAttribute('aria-current')).toBe('date');
		expect(otherMark.getAttribute('data-ring')).toBe('false');
		expect(otherMark.getAttribute('aria-current')).toBeNull();
	});

	it('fills the selected day only', () => {
		vi.useFakeTimers();
		vi.setSystemTime(DateTime.local(2024, 3, 15).toJSDate());

		renderGrid({ selectedDate: DateTime.local(2024, 3, 10) });

		expect(
			screen.getByTestId('number-mark-10').getAttribute('data-filled'),
		).toBe('true');
		expect(
			screen.getByTestId('number-mark-15').getAttribute('data-filled'),
		).toBe('false');
	});

	it('fills and rings today when it is selected', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		renderGrid({ selectedDate: today });

		const todayMark = screen.getByTestId('number-mark-15');

		expect(todayMark.getAttribute('data-filled')).toBe('true');
		expect(todayMark.getAttribute('data-ring')).toBe('true');
	});

	it('mutes out-of-month day numbers', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(
			cells[0].querySelector('[data-muted]')?.getAttribute('data-muted'),
		).toBe('true');
		expect(
			cells[5].querySelector('[data-muted]')?.getAttribute('data-muted'),
		).toBe('false');
	});

	it('renders up to 3 colored dots for days that have meals', () => {
		const meals: MobileMonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', color: '#FF0000' },
			{ id: '2', date: '2024-03-15', color: '#00FF00' },
			{ id: '3', date: '2024-03-15', color: '#0000FF' },
			{ id: '4', date: '2024-03-15', color: '#FFFF00' },
		];

		renderGrid({ selectedDate: DateTime.local(2024, 3, 15), meals });

		const cells = screen.getAllByTestId('mobile-day-cell');
		const dots = cells[19].querySelectorAll('[aria-hidden="true"]');

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

	it('does not render dots for days without meals', () => {
		const meals: MobileMonthGridMeal[] = [
			{ id: '1', date: '2024-03-10', color: '#FF0000' },
		];

		renderGrid({ selectedDate: DateTime.local(2024, 3, 15), meals });

		const cells = screen.getAllByTestId('mobile-day-cell');
		const dots = cells[19].querySelectorAll('[aria-hidden="true"]');

		expect(dots).toHaveLength(0);
	});

	it('selects a day when tapped', () => {
		const setSelectedDate = vi.fn();

		renderGrid({
			selectedDate: DateTime.local(2024, 3, 15),
			setSelectedDate,
		});

		const cells = screen.getAllByTestId('mobile-day-cell');

		fireEvent.click(cells[20]);

		expect(setSelectedDate).toHaveBeenCalledWith(DateTime.local(2024, 3, 16));
	});

	it('moves focus between cells with arrow keys', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[19], { key: 'ArrowRight' });

		expect(cells[19].getAttribute('tabindex')).toBe('-1');
		expect(cells[20].getAttribute('tabindex')).toBe('0');
	});

	it('moves focus to the previous day with ArrowLeft', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[19], { key: 'ArrowLeft' });

		expect(cells[19].getAttribute('tabindex')).toBe('-1');
		expect(cells[18].getAttribute('tabindex')).toBe('0');
	});

	it('moves focus to the day one week later with ArrowDown', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[19], { key: 'ArrowDown' });

		expect(cells[19].getAttribute('tabindex')).toBe('-1');
		expect(cells[26].getAttribute('tabindex')).toBe('0');
	});

	it('moves focus to the day one week earlier with ArrowUp', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[19], { key: 'ArrowUp' });

		expect(cells[19].getAttribute('tabindex')).toBe('-1');
		expect(cells[12].getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus right from the last column', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 16) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[20].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[20], { key: 'ArrowRight' });

		expect(cells[20].getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus left from the first column', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 10) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[14].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[14], { key: 'ArrowLeft' });

		expect(cells[14].getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus down from the last row', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 31) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[35].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[35], { key: 'ArrowDown' });

		expect(cells[35].getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus up from the first row', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 1) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[5].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[5], { key: 'ArrowUp' });

		expect(cells[5].getAttribute('tabindex')).toBe('0');
	});

	it('ignores non-arrow keys', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[19], { key: 'Enter' });

		expect(cells[19].getAttribute('tabindex')).toBe('0');
	});

	it('exposes an accessible name with the meal count', () => {
		const meals: MobileMonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', color: '#FF0000' },
		];

		renderGrid({ selectedDate: DateTime.local(2024, 3, 15), meals });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('aria-label')).toBe('March 15, 1 meals');
		expect(cells[18].getAttribute('aria-label')).toBe('March 14, 0 meals');
	});
});
