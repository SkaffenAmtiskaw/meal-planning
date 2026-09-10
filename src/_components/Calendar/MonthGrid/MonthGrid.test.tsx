import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MonthGrid } from './MonthGrid';
import type { MonthGridEvent, MonthGridEventRenderProps } from './MonthGrid';

import { useCalendarContext } from '../CalendarContext';
import { CalendarProvider } from '../CalendarProvider';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('../_utils/getMonthGridDates', () => ({
	getMonthGridDates: vi.fn(),
}));

import { getMonthGridDates } from '../_utils/getMonthGridDates';

function NextMonthButton() {
	const { goToNext } = useCalendarContext();
	return <button onClick={goToNext}>Next</button>;
}

describe('MonthGrid', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('starts the grid on Sunday', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 2, 25),
			DateTime.local(2024, 2, 26),
			DateTime.local(2024, 2, 27),
			DateTime.local(2024, 2, 28),
			DateTime.local(2024, 2, 29),
			DateTime.local(2024, 3, 1),
			DateTime.local(2024, 3, 2),
		]);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid />
			</CalendarProvider>,
		);

		expect(getMonthGridDates).toHaveBeenCalledWith(initialDate);
		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells.length).toBeGreaterThan(0);
		expect(dayCells[0].textContent).toBe('25');
	});

	it('highlights today with an ember badge', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 2, 26),
			DateTime.local(2024, 2, 27),
			DateTime.local(2024, 2, 28),
			DateTime.local(2024, 2, 29),
			DateTime.local(2024, 3, 1),
			DateTime.local(2024, 3, 2),
			DateTime.local(2024, 3, 3),
			DateTime.local(2024, 3, 4),
			DateTime.local(2024, 3, 5),
			DateTime.local(2024, 3, 6),
			DateTime.local(2024, 3, 7),
			DateTime.local(2024, 3, 8),
			DateTime.local(2024, 3, 9),
			DateTime.local(2024, 3, 10),
			DateTime.local(2024, 3, 11),
			DateTime.local(2024, 3, 12),
			DateTime.local(2024, 3, 13),
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
		]);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		expect(getMonthGridDates).toHaveBeenCalledWith(today);
		const dayText = screen.getByText('15');
		const badge = dayText.closest('[data-testid="badge"]');
		expect(badge).not.toBeNull();
		expect(badge?.getAttribute('data-color')).toBe('ember');
	});

	it('dims overflow days from adjacent months', () => {
		vi.useFakeTimers();
		vi.setSystemTime(DateTime.local(2024, 6, 15, 12, 0, 0).toJSDate());

		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 2, 26),
			DateTime.local(2024, 2, 27),
			DateTime.local(2024, 2, 28),
			DateTime.local(2024, 2, 29),
			DateTime.local(2024, 3, 1),
			DateTime.local(2024, 3, 2),
			DateTime.local(2024, 3, 3),
		]);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');

		expect(dayCells[0].querySelector('p')?.getAttribute('data-c')).toBe(
			'gray.5',
		);
		expect(dayCells[1].querySelector('p')?.getAttribute('data-c')).toBe(
			'gray.5',
		);
		expect(dayCells[2].querySelector('p')?.getAttribute('data-c')).toBe(
			'gray.5',
		);
		expect(dayCells[3].querySelector('p')?.getAttribute('data-c')).toBe(
			'gray.5',
		);
		expect(dayCells[4].querySelector('p')?.getAttribute('data-c')).not.toBe(
			'gray.5',
		);
	});

	it('updates the grid when selectedDate changes', () => {
		vi.mocked(getMonthGridDates)
			.mockReturnValueOnce([
				DateTime.local(2024, 2, 26),
				DateTime.local(2024, 2, 27),
				DateTime.local(2024, 2, 28),
			])
			.mockReturnValueOnce([
				DateTime.local(2024, 4, 1),
				DateTime.local(2024, 4, 2),
				DateTime.local(2024, 4, 3),
			]);

		render(
			<CalendarProvider initialDate={DateTime.local(2024, 3, 15)}>
				<MonthGrid />
				<NextMonthButton />
			</CalendarProvider>,
		);

		let dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].textContent).toBe('26');
		expect(getMonthGridDates).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText('Next'));

		dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].textContent).toBe('1');
		expect(getMonthGridDates).toHaveBeenCalledTimes(2);
	});

	it('renders events in the correct day cell', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
		];

		const renderEvent = vi.fn(
			(event: MonthGridEvent, props: MonthGridEventRenderProps) => (
				<span key={event.id} tabIndex={props.tabIndex} ref={props.ref}>
					{event.title} custom
				</span>
			),
		);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid events={events} renderEvent={renderEvent} />
			</CalendarProvider>,
		);

		expect(renderEvent).toHaveBeenCalledWith(
			events[0],
			expect.objectContaining({ tabIndex: expect.any(Number) }),
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[1].textContent).toContain('Event A custom');
		expect(dayCells[0].textContent).not.toContain('Event A custom');
		expect(dayCells[2].textContent).not.toContain('Event A custom');
	});

	it('limits visible events to 2 and shows +N more', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([DateTime.local(2024, 3, 15)]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
			{ id: '3', date: '2024-03-15', title: 'Event C' },
		];

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid events={events} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].textContent).toContain('Event A');
		expect(dayCells[0].textContent).toContain('Event B');
		expect(dayCells[0].textContent).not.toContain('Event C');
		expect(dayCells[0].textContent).toContain('+1 more');
	});

	it('does not show +N more when events are 2 or fewer', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([DateTime.local(2024, 3, 15)]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid events={events} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].textContent).toContain('Event A');
		expect(dayCells[0].textContent).toContain('Event B');
		expect(dayCells[0].textContent).not.toContain('more');
	});

	it('adds aria-label with event count to day cells with events', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
		]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid events={events} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].getAttribute('aria-label')).toBeNull();
		expect(dayCells[1].getAttribute('aria-label')).toBe('March 15, 2 events');
	});

	it('does not break when events prop is undefined', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([DateTime.local(2024, 3, 15)]);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells.length).toBe(1);
		expect(dayCells[0].textContent).toBe('15');
	});
});

describe('MonthGrid keyboard navigation', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	function createRenderEventMock() {
		return vi.fn(
			(
				event: MonthGridEvent,
				props: { tabIndex: number; ref: React.RefCallback<HTMLElement> },
			) => (
				<div
					key={event.id}
					data-testid={`event-${event.id}`}
					tabIndex={props.tabIndex}
					ref={props.ref}
				>
					{event.title}
				</div>
			),
		);
	}

	it('sets tabIndex=0 on today and -1 on other days initially', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].getAttribute('tabindex')).toBe('-1');
		expect(dayCells[1].getAttribute('tabindex')).toBe('0');
		expect(dayCells[2].getAttribute('tabindex')).toBe('-1');
	});

	it('moves focus to next day with ArrowRight', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'ArrowRight' });

		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');
		expect(dayCells[2].getAttribute('tabindex')).toBe('0');
	});

	it('calls onEventClick when Enter pressed on single-event day', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
		];

		const onEventClick = vi.fn();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid events={events} onEventClick={onEventClick} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		expect(onEventClick).toHaveBeenCalledWith(events[0]);
	});

	it('enters event mode when Enter pressed on multi-event day', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		const renderEvent = createRenderEventMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid events={events} renderEvent={renderEvent} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');
		const event1 = screen.getByTestId('event-1');
		const event2 = screen.getByTestId('event-2');
		expect(event1.getAttribute('tabindex')).toBe('0');
		expect(event2.getAttribute('tabindex')).toBe('-1');
	});

	it('navigates events with ArrowDown/ArrowUp in event mode', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		const renderEvent = createRenderEventMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid events={events} renderEvent={renderEvent} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		const event1 = screen.getByTestId('event-1');
		const event2 = screen.getByTestId('event-2');

		fireEvent.keyDown(event1, { key: 'ArrowDown' });
		expect(event1.getAttribute('tabindex')).toBe('-1');
		expect(event2.getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(event2, { key: 'ArrowUp' });
		expect(event1.getAttribute('tabindex')).toBe('0');
		expect(event2.getAttribute('tabindex')).toBe('-1');
	});

	it('event click does not exit event mode', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		const renderEvent = createRenderEventMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid events={events} renderEvent={renderEvent} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		const event1 = screen.getByTestId('event-1');
		fireEvent.click(event1);

		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');
		expect(event1.getAttribute('tabindex')).toBe('0');
		expect(screen.getByTestId('event-2').getAttribute('tabindex')).toBe('-1');
	});

	it('exits event mode and returns focus to day cell on Escape', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const events: MonthGridEvent[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		const renderEvent = createRenderEventMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid events={events} renderEvent={renderEvent} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		const event1 = screen.getByTestId('event-1');
		fireEvent.keyDown(event1, { key: 'Escape' });

		expect(dayCells[1].getAttribute('tabindex')).toBe('0');
		expect(event1.getAttribute('tabindex')).toBe('-1');
		expect(screen.getByTestId('event-2').getAttribute('tabindex')).toBe('-1');
	});
});
