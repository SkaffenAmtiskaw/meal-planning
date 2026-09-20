import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCalendarContext } from '@/_components/Calendar';

import { MobileMonthGrid, type MobileMonthGridEvent } from './MobileMonthGrid';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@/_components/Calendar', async () => ({
	useCalendarContext: vi.fn(),
}));

interface RenderOptions {
	selectedDate?: DateTime;
	events?: MobileMonthGridEvent[];
	setSelectedDate?: (date: DateTime) => void;
}

function renderGrid({
	selectedDate = DateTime.local(2024, 3, 15),
	events = [],
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

	return render(<MobileMonthGrid events={events} />);
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

	it('highlights today with an ember filled circle', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		renderGrid({ selectedDate: today });

		const badge = screen.getByText('15').closest('[data-testid="badge"]');

		expect(badge).not.toBeNull();
		expect(badge?.getAttribute('data-color')).toBe('ember');
	});

	it('highlights the selected day with a tinted background', () => {
		const today = DateTime.local(2024, 3, 15);
		const selectedDate = DateTime.local(2024, 3, 10);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		const { rerender } = renderGrid({ selectedDate });
		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[14].getAttribute('bg')).toBe('chalk.0');

		vi.mocked(useCalendarContext).mockReturnValue({
			selectedDate: today,
			viewType: 'month',
			rangeAnchor: today,
			setSelectedDate: vi.fn(),
			setViewType: vi.fn(),
			navigateToDate: vi.fn(),
			goToToday: vi.fn(),
			goToPrevious: vi.fn(),
			goToNext: vi.fn(),
		} as ReturnType<typeof useCalendarContext>);
		rerender(<MobileMonthGrid />);

		const cellsAfterRerender = screen.getAllByTestId('mobile-day-cell');

		expect(cellsAfterRerender[19].getAttribute('bg')).toBe('ember.0');
	});

	it('renders out-of-month day numbers muted', () => {
		renderGrid({ selectedDate: DateTime.local(2024, 3, 15) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[0].querySelector('p')?.getAttribute('data-c')).toBe('navy.2');
		expect(cells[5].querySelector('p')?.getAttribute('data-c')).not.toBe(
			'navy.2',
		);
	});

	it('renders up to 3 colored dots for days that have meals', () => {
		const events: MobileMonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', color: '#FF0000' },
			{ id: '2', date: '2024-03-15', color: '#00FF00' },
			{ id: '3', date: '2024-03-15', color: '#0000FF' },
			{ id: '4', date: '2024-03-15', color: '#FFFF00' },
		];

		renderGrid({ selectedDate: DateTime.local(2024, 3, 15), events });

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
		const events: MobileMonthGridEvent[] = [
			{ id: '1', date: '2024-03-10', color: '#FF0000' },
		];

		renderGrid({ selectedDate: DateTime.local(2024, 3, 15), events });

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
		renderGrid({ selectedDate: DateTime.local(2024, 4, 30) });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[30].getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(cells[30], { key: 'ArrowDown' });

		expect(cells[30].getAttribute('tabindex')).toBe('0');
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
		const events: MobileMonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', color: '#FF0000' },
		];

		renderGrid({ selectedDate: DateTime.local(2024, 3, 15), events });

		const cells = screen.getAllByTestId('mobile-day-cell');

		expect(cells[19].getAttribute('aria-label')).toBe('March 15, 1 meals');
		expect(cells[18].getAttribute('aria-label')).toBe('March 14, 0 meals');
	});
});
