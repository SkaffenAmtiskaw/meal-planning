import { useMediaQuery } from '@mantine/hooks';

import { useNextCalendarApp } from '@schedule-x/react';

import { act, fireEvent, render, screen } from '@testing-library/react';

import type { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { usePlannerContext } from '@/app/[planner]/_components';

import { CalendarView } from './CalendarView';

import { getWeekStart } from '../../_utils/getWeekStart';
import { MonthGridEvent } from '../MonthGridEvent/MonthGridEvent';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@mantine/hooks', () => ({
	useMediaQuery: vi.fn(() => false),
}));

vi.mock('@/app/[planner]/_components', () => ({
	usePlannerContext: vi.fn(),
}));

vi.mock('@schedule-x/calendar', () => ({
	createViewList: vi.fn(),
	createViewMonthAgenda: vi.fn(),
	createViewMonthGrid: vi.fn(),
}));

vi.mock('@schedule-x/events-service', () => ({
	createEventsServicePlugin: vi.fn(() => ({
		set: mockSet,
	})),
}));

vi.mock('@schedule-x/react', () => ({
	useNextCalendarApp: vi.fn((config) => {
		config?.callbacks?.onRender?.();
		return {
			$app: {
				calendarState: { setView: mockSetCurrentView },
				datePickerState: { selectedDate: { value: '2024-01-01' } },
			},
		};
	}),
	ScheduleXCalendar: vi.fn((props) => {
		mockScheduleXCalendar(props);
		const HeaderComponent = props.customComponents?.headerContentRightPrepend;
		return (
			<div data-testid="schedule-x-calendar">
				{HeaderComponent && <HeaderComponent />}
			</div>
		);
	}),
}));

vi.mock('temporal-polyfill/global', () => ({}));

vi.mock('../AddMealButton/AddMealButton', () => ({
	AddMealButton: (props: {
		plannerId?: string;
		savedItems?: unknown[];
		onMealAdded?: (cal: unknown[]) => void;
	}) => {
		mockAddMealButton(props);
		return (
			<div
				data-testid="add-meal-button"
				data-planner-id={props.plannerId}
				data-saved-count={props.savedItems?.length}
			/>
		);
	},
}));

vi.mock('../MonthGridEvent/MonthGridEvent', () => ({
	MonthGridEvent: vi.fn(() => null),
}));

vi.mock('../../_utils/getWeekStart', () => ({
	getWeekStart: vi.fn(() => mockWeekStart),
}));

vi.mock('../../_utils/toScheduleXEvents', () => ({
	toScheduleXEvents: (...args: unknown[]) => mockToScheduleXEvents(...args),
}));

vi.mock('../WeekView/WeekView', () => ({
	WeekView: (props: {
		calendar: unknown[];
		currentWeekStart: unknown;
		onMealClick?: (event: unknown) => void;
	}) => {
		mockWeekView(props);
		return (
			<div data-testid="week-view">
				<button
					data-testid="week-meal-card"
					type="button"
					onClick={() =>
						props.onMealClick?.({
							id: 'meal-1',
							title: 'Breakfast',
							dishes: [],
						})
					}
				/>
			</div>
		);
	},
}));

vi.mock('../MealDetailModal/MealDetailModal', () => ({
	MealDetailModal: (props: {
		event: unknown;
		plannerId: string;
		onClose: () => void;
	}) => {
		mockMealDetailModal(props);
		return null;
	},
}));

// usePlannerSavedItems is not mocked — it calls through to usePlannerContext,
// which is mocked below, so its output is fully controlled via usePlannerContextMock.
const usePlannerContextMock = vi.mocked(usePlannerContext);
const mockSet = vi.fn();
const mockScheduleXCalendar = vi.fn();
const mockSetCurrentView = vi.fn();
const mockAddMealButton = vi.fn();
const mockWeekView = vi.fn();
const mockMealDetailModal = vi.fn();
const mockToScheduleXEvents = vi.fn();

const mockPrevWeekStart = { _tag: 'prev-week' };
const mockNextWeekStart = { _tag: 'next-week' };
const mockWeekStart = {
	_tag: 'week-start',
	subtract: () => mockPrevWeekStart,
	add: () => mockNextWeekStart,
};

const defaultProps = { plannerId: 'planner-1' };

describe('CalendarView', () => {
	beforeEach(() => {
		usePlannerContextMock.mockReturnValue({
			calendar: [],
			saved: [],
			tags: [],
		});
		mockToScheduleXEvents.mockReturnValue([]);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders the schedule-x calendar by default', () => {
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByTestId('schedule-x-calendar')).toBeDefined();
	});

	test('renders view switcher inside schedule-x header on month view', () => {
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByTestId('view-switcher')).toBeDefined();
	});

	test('shows Month/Week/List options on desktop', () => {
		vi.mocked(useMediaQuery).mockReturnValue(false);
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByText('Month')).toBeDefined();
		expect(screen.getByText('Week')).toBeDefined();
		expect(screen.getByText('List')).toBeDefined();
	});

	test('shows Month/List options on mobile', () => {
		vi.mocked(useMediaQuery).mockReturnValue(true);
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByText('Month')).toBeDefined();
		expect(screen.queryByText('Week')).toBeNull();
		expect(screen.getByText('List')).toBeDefined();
	});

	test('shows week view when Week is selected', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		expect(screen.getByTestId('week-view')).toBeDefined();
		expect(screen.getByTestId('week-view-header')).toBeDefined();
		expect(screen.queryByTestId('schedule-x-calendar')).toBeNull();
	});

	test('passes calendar to WeekView', () => {
		const calendar = [{ date: '2024-01-14', meals: [] }];
		usePlannerContextMock.mockReturnValue({
			calendar,
			saved: [],
			tags: [],
		});

		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		expect(mockWeekView).toHaveBeenCalledWith(
			expect.objectContaining({ calendar }),
		);
	});

	test('passes currentWeekStart to WeekView', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		expect(mockWeekView).toHaveBeenCalledWith(
			expect.objectContaining({ currentWeekStart: mockWeekStart }),
		);
	});

	test('derives currentWeekStart from schedule-x selected date', () => {
		render(<CalendarView {...defaultProps} />);
		// calendarApp mock returns datePickerState.selectedDate.value = '2024-01-01'
		expect(vi.mocked(getWeekStart)).toHaveBeenCalledWith('2024-01-01');
	});

	test('view switcher is accessible in week view header', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		expect(screen.getByTestId('view-switcher')).toBeDefined();
	});

	test('shows schedule-x calendar when switching back from week to month', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		fireEvent.click(screen.getByText('Month'));
		expect(screen.queryByTestId('week-view')).toBeNull();
		expect(screen.getByTestId('schedule-x-calendar')).toBeDefined();
	});

	test('handles missing calendarState gracefully', () => {
		vi.mocked(useNextCalendarApp).mockReturnValueOnce({
			$app: {},
		} as unknown as ReturnType<typeof useNextCalendarApp>);
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByTestId('schedule-x-calendar')).toBeDefined();
	});

	test('calls schedule-x setView when switching from month to list', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('List'));
		expect(mockSetCurrentView).toHaveBeenCalledWith('list', '2024-01-01');
	});

	test('calls schedule-x setView with month-agenda on mobile', () => {
		vi.mocked(useMediaQuery).mockReturnValue(true);
		render(<CalendarView {...defaultProps} />);
		expect(mockSetCurrentView).toHaveBeenCalledWith(
			'month-agenda',
			'2024-01-01',
		);
	});

	test('falls back to list when switching to mobile while on week view', () => {
		vi.mocked(useMediaQuery).mockReturnValue(false);
		const { rerender } = render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		expect(screen.getByTestId('week-view')).toBeDefined();

		vi.mocked(useMediaQuery).mockReturnValue(true);
		rerender(<CalendarView {...defaultProps} />);
		expect(screen.queryByTestId('week-view')).toBeNull();
		expect(screen.getByTestId('schedule-x-calendar')).toBeDefined();
	});

	test('passes plannerId to AddMealButton', () => {
		render(<CalendarView {...defaultProps} />);
		expect(
			screen.getByTestId('add-meal-button').getAttribute('data-planner-id'),
		).toBe('planner-1');
	});

	test('passes calendar and savedItems to toScheduleXEvents', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
			},
		];
		const saved = [
			{
				_id: 'saved-1' as unknown as Types.ObjectId,
				name: 'Pasta',
				url: 'https://example.com',
				tags: [],
			},
		];

		usePlannerContextMock.mockReturnValue({
			calendar,
			saved,
			tags: [],
		});
		render(<CalendarView {...defaultProps} />);
		expect(mockToScheduleXEvents).toHaveBeenCalledWith(calendar, [
			{ _id: 'saved-1', name: 'Pasta', url: 'https://example.com' },
		]);
	});

	test('initializes calendar with events returned by toScheduleXEvents', () => {
		const mockEvents = [
			{
				id: 'meal-1',
				start: 'mock',
				end: 'mock',
				title: 'Breakfast',
				dishes: [],
			},
		];
		mockToScheduleXEvents.mockReturnValueOnce(mockEvents);
		render(<CalendarView {...defaultProps} />);
		expect(vi.mocked(useNextCalendarApp)).toHaveBeenCalledWith(
			expect.objectContaining({ events: mockEvents }),
		);
	});

	test('initializes with empty events when toScheduleXEvents returns empty array', () => {
		render(<CalendarView {...defaultProps} />);
		expect(vi.mocked(useNextCalendarApp)).toHaveBeenCalledWith(
			expect.objectContaining({ events: [] }),
		);
	});

	test('passes MonthGridEvent as monthGridEvent custom component', () => {
		render(<CalendarView {...defaultProps} />);
		expect(mockScheduleXCalendar).toHaveBeenCalledWith(
			expect.objectContaining({
				customComponents: expect.objectContaining({
					monthGridEvent: MonthGridEvent,
				}),
			}),
		);
	});

	test('passes onMealAdded to AddMealButton', () => {
		render(<CalendarView {...defaultProps} />);
		expect(mockAddMealButton).toHaveBeenCalledWith(
			expect.objectContaining({ onMealAdded: expect.any(Function) }),
		);
	});

	test('renders MealDetailModal with initial props', () => {
		render(<CalendarView {...defaultProps} />);
		expect(mockMealDetailModal).toHaveBeenCalledWith(
			expect.objectContaining({ event: null, plannerId: 'planner-1' }),
		);
	});

	test('onEventClick opens MealDetailModal with the clicked event', () => {
		render(<CalendarView {...defaultProps} />);
		const { onEventClick } =
			vi.mocked(useNextCalendarApp).mock.calls[0][0].callbacks ?? {};
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => onEventClick?.(mockEvent as never, new MouseEvent('click')));
		expect(mockMealDetailModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: mockEvent }),
		);
	});

	test('passes onMealClick to WeekView', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		expect(mockWeekView).toHaveBeenCalledWith(
			expect.objectContaining({ onMealClick: expect.any(Function) }),
		);
	});

	test('onMealClick from WeekView opens MealDetailModal with the meal event', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => {
			fireEvent.click(screen.getByTestId('week-meal-card'));
		});
		expect(mockMealDetailModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: mockEvent }),
		);
	});

	test('MealDetailModal onClose resets the clicked event to null', () => {
		render(<CalendarView {...defaultProps} />);
		const { onEventClick } =
			vi.mocked(useNextCalendarApp).mock.calls[0][0].callbacks ?? {};
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => onEventClick?.(mockEvent as never, new MouseEvent('click')));
		const { onClose } = mockMealDetailModal.mock.lastCall?.[0] || (() => {});
		act(() => onClose());
		expect(mockMealDetailModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: null }),
		);
	});

	test('renders prev, today, and next navigation buttons in week view header', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		expect(screen.getByTestId('week-prev')).toBeDefined();
		expect(screen.getByTestId('week-today')).toBeDefined();
		expect(screen.getByTestId('week-next')).toBeDefined();
	});

	test('clicking prev shifts currentWeekStart back 7 days', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		act(() => {
			fireEvent.click(screen.getByTestId('week-prev'));
		});
		expect(mockWeekView).toHaveBeenLastCalledWith(
			expect.objectContaining({ currentWeekStart: mockPrevWeekStart }),
		);
	});

	test('clicking next shifts currentWeekStart forward 7 days', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		act(() => {
			fireEvent.click(screen.getByTestId('week-next'));
		});
		expect(mockWeekView).toHaveBeenLastCalledWith(
			expect.objectContaining({ currentWeekStart: mockNextWeekStart }),
		);
	});

	test('clicking today resets currentWeekStart to current week', () => {
		render(<CalendarView {...defaultProps} />);
		fireEvent.click(screen.getByText('Week'));
		// Navigate away first
		act(() => {
			fireEvent.click(screen.getByTestId('week-next'));
		});
		expect(mockWeekView).toHaveBeenLastCalledWith(
			expect.objectContaining({ currentWeekStart: mockNextWeekStart }),
		);
		// Reset to today
		act(() => {
			fireEvent.click(screen.getByTestId('week-today'));
		});
		expect(mockWeekView).toHaveBeenLastCalledWith(
			expect.objectContaining({ currentWeekStart: mockWeekStart }),
		);
	});

	test('onMealAdded replaces all events via eventsService.set', () => {
		render(<CalendarView {...defaultProps} />);

		const updatedEvents = [
			{
				id: 'meal-1',
				start: 'mock',
				end: 'mock',
				title: 'Breakfast',
				dishes: [],
			},
			{ id: 'meal-2', start: 'mock', end: 'mock', title: 'Dinner', dishes: [] },
		];
		const newCalendar = [{ date: '2024-01-16', meals: [] }];
		mockToScheduleXEvents.mockReturnValueOnce(updatedEvents);

		const { onMealAdded } = mockAddMealButton.mock.calls[0][0];
		act(() => onMealAdded(newCalendar));

		expect(mockToScheduleXEvents).toHaveBeenCalledWith(newCalendar, []);
		expect(mockSet).toHaveBeenCalledWith(updatedEvents);
	});
});
