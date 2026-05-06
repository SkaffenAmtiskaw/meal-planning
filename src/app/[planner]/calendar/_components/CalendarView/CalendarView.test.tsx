import { useNextCalendarApp } from '@schedule-x/react';

import { act, render, screen } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { usePlannerContext } from '@/app/[planner]/_components';
import { usePlannerSavedItems } from '@/app/[planner]/calendar/_hooks/usePlannerSavedItems';

import { CalendarView } from './CalendarView';

import { MealDetailModal } from '../MealDetailModal/MealDetailModal';
import { WeekView } from '../WeekView/WeekView';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

vi.mock('@schedule-x/calendar', () => ({
	createViewList: vi.fn(),
	createViewMonthAgenda: vi.fn(),
	createViewMonthGrid: vi.fn(),
}));

vi.mock('@schedule-x/events-service', () => ({
	createEventsServicePlugin: vi.fn(() => ({ set: vi.fn() })),
}));

vi.mock('@schedule-x/react', () => ({
	useNextCalendarApp: vi.fn(() => ({
		$app: {
			calendarState: { setView: vi.fn() },
			datePickerState: { selectedDate: { value: '2024-01-01' } },
		},
	})),
	ScheduleXCalendar: vi.fn((props) => {
		const HeaderComponent = props.customComponents?.headerContentRightPrepend;
		return (
			<div data-testid="schedule-x-calendar">
				{HeaderComponent && <HeaderComponent />}
			</div>
		);
	}),
}));

vi.mock('temporal-polyfill/global', () => ({}));

vi.mock('@/app/[planner]/_components', () => ({
	usePlannerContext: vi.fn(),
}));

vi.mock('@/app/[planner]/calendar/_hooks/usePlannerSavedItems', () => ({
	usePlannerSavedItems: vi.fn(() => []),
}));

const { useCalendarEventsMock, useViewTypeMock, useWeekNavigationMock } =
	vi.hoisted(() => ({
		useCalendarEventsMock: vi.fn(),
		useViewTypeMock: vi.fn(),
		useWeekNavigationMock: vi.fn(),
	}));

vi.mock('../../_hooks/useCalendarEvents', () => ({
	useCalendarEvents: useCalendarEventsMock,
}));

vi.mock('../../_hooks/useViewType', () => ({
	useViewType: useViewTypeMock,
}));

vi.mock('../../_hooks/useWeekNavigation', () => ({
	useWeekNavigation: useWeekNavigationMock,
}));

vi.mock('../../_hooks/useScheduleXSync', () => ({
	useScheduleXSync: vi.fn(),
}));

vi.mock('../CalendarHeader/CalendarHeader', () => ({
	CalendarHeader: vi.fn(() => <div data-testid="calendar-header" />),
}));

vi.mock('../MonthGridEvent/MonthGridEvent', () => ({
	MonthGridEvent: vi.fn(() => null),
}));

vi.mock('../WeekView/WeekView', () => ({
	WeekView: vi.fn(() => <div data-testid="week-view" />),
}));

vi.mock('../WeekViewHeader/WeekViewHeader', () => ({
	WeekViewHeader: vi.fn(() => <div data-testid="week-view-header" />),
}));

vi.mock('../MealDetailModal/MealDetailModal', () => ({
	MealDetailModal: vi.fn(() => null),
}));

const usePlannerContextMock = vi.mocked(usePlannerContext);
const usePlannerSavedItemsMock = vi.mocked(usePlannerSavedItems);
const mockHandleMealAdded = vi.fn();
const mockSetViewType = vi.fn();
const mockWeekStart = { _tag: 'week-start' };
const mockHandlePrevWeek = vi.fn();
const mockHandleNextWeek = vi.fn();
const mockHandleToday = vi.fn();

const defaultProps = { plannerId: 'planner-1' };

describe('CalendarView', () => {
	beforeEach(() => {
		usePlannerContextMock.mockReturnValue({
			calendar: [],
			saved: [],
			tags: [],
			accessLevel: 'write',
		} as never);
		usePlannerSavedItemsMock.mockReturnValue([]);
		useCalendarEventsMock.mockReturnValue({
			eventsService: { set: vi.fn() },
			initialEvents: [],
			handleMealAdded: mockHandleMealAdded,
		});
		useViewTypeMock.mockReturnValue({
			viewType: 'month',
			setViewType: mockSetViewType,
		});
		useWeekNavigationMock.mockReturnValue({
			currentWeekStart: mockWeekStart,
			handlePrevWeek: mockHandlePrevWeek,
			handleNextWeek: mockHandleNextWeek,
			handleToday: mockHandleToday,
		});
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders ScheduleXCalendar when viewType is month', () => {
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByTestId('schedule-x-calendar')).toBeDefined();
		expect(screen.queryByTestId('week-view')).toBeNull();
	});

	test('renders WeekViewHeader and WeekView when viewType is week', () => {
		useViewTypeMock.mockReturnValue({
			viewType: 'week',
			setViewType: mockSetViewType,
		});
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByTestId('week-view')).toBeDefined();
		expect(screen.getByTestId('week-view-header')).toBeDefined();
		expect(screen.queryByTestId('schedule-x-calendar')).toBeNull();
	});

	test('renders CalendarHeader inside the schedule-x header slot', () => {
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByTestId('calendar-header')).toBeDefined();
	});

	test('renders MealDetailModal with null event and plannerId initially', () => {
		render(<CalendarView {...defaultProps} />);
		expect(vi.mocked(MealDetailModal)).toHaveBeenCalledWith(
			expect.objectContaining({ event: null, plannerId: 'planner-1' }),
			undefined,
		);
	});

	test('opens MealDetailModal when an event is clicked in month view', () => {
		render(<CalendarView {...defaultProps} />);
		const { onEventClick } =
			vi.mocked(useNextCalendarApp).mock.calls[0][0].callbacks ?? {};
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => onEventClick?.(mockEvent as never, new MouseEvent('click')));
		expect(vi.mocked(MealDetailModal)).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: mockEvent }),
			undefined,
		);
	});

	test('closes MealDetailModal when onClose is called', () => {
		render(<CalendarView {...defaultProps} />);
		const { onEventClick } =
			vi.mocked(useNextCalendarApp).mock.calls[0][0].callbacks ?? {};
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => onEventClick?.(mockEvent as never, new MouseEvent('click')));
		const { onClose } = vi.mocked(MealDetailModal).mock.lastCall?.[0] || {};
		act(() => onClose?.());
		expect(vi.mocked(MealDetailModal)).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: null }),
			undefined,
		);
	});

	test('opens MealDetailModal when a meal is clicked in week view', () => {
		useViewTypeMock.mockReturnValue({
			viewType: 'week',
			setViewType: mockSetViewType,
		});
		render(<CalendarView {...defaultProps} />);
		const onMealClick = vi.mocked(WeekView).mock.calls[0][0].onMealClick;
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => onMealClick?.(mockEvent as never));
		expect(vi.mocked(MealDetailModal)).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: mockEvent }),
			undefined,
		);
	});
});
