import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { MobileMonthGrid } from './MobileMonthGrid';
import type { MobileMonthGridMeal } from './types';

import { useCalendarContext } from '../CalendarContext';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('./MobileMonthGridDayCell', () => ({
	MobileMonthGridDayCell: ({
		day,
		isToday,
		isSelected,
		isCurrentMonth,
		meals,
		dayProps,
		onSelect,
	}: {
		day: DateTime;
		isToday: boolean;
		isSelected: boolean;
		isCurrentMonth: boolean;
		meals: MobileMonthGridMeal[];
		dayProps: Record<string, unknown>;
		onSelect: () => void;
	}) => (
		<button
			type="button"
			data-testid="mobile-day-cell"
			data-day={day.day}
			data-today={String(isToday)}
			data-selected={String(isSelected)}
			data-current-month={String(isCurrentMonth)}
			data-meal-ids={meals.map((meal) => meal.id).join(',')}
			{...dayProps}
			onClick={onSelect}
		/>
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
	});

	it('renders the current month plus leading and trailing days', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells).toHaveLength(42);
		expect(cells[0].getAttribute('data-day')).toBe('25');
		expect(cells[cells.length - 1].getAttribute('data-day')).toBe('6');
	});

	it('tells only today’s cell that it is today', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		renderGrid({ selectedDate: DateTime.local(2024, 3, 10) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('data-today')).toBe('true');
		expect(cells[18].getAttribute('data-today')).toBe('false');
	});

	it('tells no cell that it is today while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(
			makeUnknownDay(DateTime.local(2024, 3, 15)),
		);

		renderGrid({ selectedDate: DateTime.local(2024, 3, 10) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(
			cells.filter((cell) => cell.getAttribute('data-today') === 'true'),
		).toHaveLength(0);
	});

	it('tells only the selected day’s cell that it is selected', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 10) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[14].getAttribute('data-selected')).toBe('true');
		expect(cells[19].getAttribute('data-selected')).toBe('false');
	});

	it('tells each cell whether it is in the selected month', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[0].getAttribute('data-current-month')).toBe('false');
		expect(cells[5].getAttribute('data-current-month')).toBe('true');
	});

	it('gives each cell only its own day’s meals', () => {
		const meals: MobileMonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', color: '#FF0000' },
			{ id: '2', date: '2024-03-10', color: '#00FF00' },
			{ id: '3', date: '2024-03-15', color: '#0000FF' },
		];

		renderGrid({ selectedDate: DateTime.local(2024, 3, 15), meals });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('data-meal-ids')).toBe('1,3');
		expect(cells[14].getAttribute('data-meal-ids')).toBe('2');
		expect(cells[20].getAttribute('data-meal-ids')).toBe('');
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
});
