import { useMediaQuery } from '@mantine/hooks';

import { useNextCalendarApp } from '@schedule-x/react';

import { act, render, screen } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { usePlannerContext } from '@/app/[planner]/_components';

import { CalendarView } from './CalendarView';

import { MonthGridEvent } from '../MonthGridEvent/MonthGridEvent';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@mantine/hooks', () => ({
	useMediaQuery: vi.fn(() => false),
}));

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

vi.mock('@/app/[planner]/_components', () => ({
	usePlannerContext: vi.fn(),
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
	CalendarHeader: (props: {
		plannerId?: string;
		onMealAdded?: (cal: unknown[]) => void;
		viewType?: string;
		isMobile?: boolean;
		onViewChange?: (v: string) => void;
	}) => {
		mockCalendarHeader(props);
		return <div data-testid="calendar-header" />;
	},
}));

vi.mock('../MonthGridEvent/MonthGridEvent', () => ({
	MonthGridEvent: vi.fn(() => null),
}));

vi.mock('../WeekView/WeekView', () => ({
	WeekView: (props: {
		calendar: unknown[];
		currentWeekStart: unknown;
		onMealClick?: (event: unknown) => void;
		plannerId?: string;
		savedItems?: unknown[];
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

vi.mock('../WeekViewHeader/WeekViewHeader', () => ({
	WeekViewHeader: (props: {
		onPrev?: () => void;
		onNext?: () => void;
		onToday?: () => void;
		viewType?: string;
		isMobile?: boolean;
		onViewChange?: (v: string) => void;
	}) => {
		mockWeekViewHeader(props);
		return <div data-testid="week-view-header" />;
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
const mockScheduleXCalendar = vi.fn();
const mockCalendarHeader = vi.fn();
const mockWeekView = vi.fn();
const mockWeekViewHeader = vi.fn();
const mockMealDetailModal = vi.fn();
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
		});
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

	test('renders the schedule-x calendar when viewType is not week', () => {
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByTestId('schedule-x-calendar')).toBeDefined();
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

	test('renders CalendarHeader inside the schedule-x header slot', () => {
		render(<CalendarView {...defaultProps} />);
		expect(screen.getByTestId('calendar-header')).toBeDefined();
	});

	test('passes correct props to CalendarHeader', () => {
		render(<CalendarView {...defaultProps} />);
		expect(mockCalendarHeader).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId: 'planner-1',
				onMealAdded: mockHandleMealAdded,
				viewType: 'month',
				isMobile: false,
				onViewChange: mockSetViewType,
			}),
		);
	});

	test('passes correct props to WeekView', () => {
		const calendar = [{ date: '2024-01-14', meals: [] }];
		usePlannerContextMock.mockReturnValue({ calendar, saved: [], tags: [] });
		useViewTypeMock.mockReturnValue({
			viewType: 'week',
			setViewType: mockSetViewType,
		});
		render(<CalendarView {...defaultProps} />);
		expect(mockWeekView).toHaveBeenCalledWith(
			expect.objectContaining({
				calendar,
				currentWeekStart: mockWeekStart,
				plannerId: 'planner-1',
			}),
		);
	});

	test('passes correct props to WeekViewHeader', () => {
		useViewTypeMock.mockReturnValue({
			viewType: 'week',
			setViewType: mockSetViewType,
		});
		render(<CalendarView {...defaultProps} />);
		expect(mockWeekViewHeader).toHaveBeenCalledWith(
			expect.objectContaining({
				onPrev: mockHandlePrevWeek,
				onNext: mockHandleNextWeek,
				onToday: mockHandleToday,
				viewType: 'week',
				onViewChange: mockSetViewType,
			}),
		);
	});

	test('renders MealDetailModal with null event and plannerId initially', () => {
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

	test('MealDetailModal onClose resets the clicked event to null', () => {
		render(<CalendarView {...defaultProps} />);
		const { onEventClick } =
			vi.mocked(useNextCalendarApp).mock.calls[0][0].callbacks ?? {};
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => onEventClick?.(mockEvent as never, new MouseEvent('click')));
		const { onClose } = mockMealDetailModal.mock.lastCall?.[0] || {};
		act(() => onClose());
		expect(mockMealDetailModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: null }),
		);
	});

	test('onMealClick from WeekView opens MealDetailModal with the meal event', () => {
		useViewTypeMock.mockReturnValue({
			viewType: 'week',
			setViewType: mockSetViewType,
		});
		render(<CalendarView {...defaultProps} />);
		act(() => {
			screen.getByTestId('week-meal-card').click();
		});
		expect(mockMealDetailModal).toHaveBeenLastCalledWith(
			expect.objectContaining({
				event: { id: 'meal-1', title: 'Breakfast', dishes: [] },
			}),
		);
	});

	test('passes isMobile from useMediaQuery to hooks and components', () => {
		vi.mocked(useMediaQuery).mockReturnValue(true);
		render(<CalendarView {...defaultProps} />);
		expect(mockCalendarHeader).toHaveBeenCalledWith(
			expect.objectContaining({ isMobile: true }),
		);
	});
});
