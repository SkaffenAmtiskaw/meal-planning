import { act, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCalendarContext } from '@/_components/Calendar';
import { useIsMobile } from '@/_hooks';

import { CalendarView } from './CalendarView';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { MealCalendar } from '../MealCalendar/MealCalendar';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';
import { MealListView } from '../MealListView/MealListView';
import { MealMonthAgenda } from '../MealMonthAgenda/MealMonthAgenda';
import { MealWeekView } from '../MealWeekView/MealWeekView';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));
vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock('@/_components/Calendar', async () => ({
	CalendarProvider: vi.fn(({ children }) => (
		<div data-testid="calendar-provider">{children}</div>
	)),
	CalendarTodayButton: vi.fn(({ size }) => (
		<button data-testid="today-button" data-size={size} aria-label="Today">
			Today
		</button>
	)),
	CalendarPreviousButton: vi.fn(({ size }) => (
		<button
			data-testid="previous-button"
			data-size={size}
			aria-label="Previous"
		>
			Previous
		</button>
	)),
	CalendarNextButton: vi.fn(({ size }) => (
		<button data-testid="next-button" data-size={size} aria-label="Next">
			Next
		</button>
	)),
	DEFAULT_VIEWS: ['month', 'week', 'list'],
	VIEW_LABELS: { month: 'Month', week: 'Week', list: 'List' },
	LABEL_FORMATTERS: {
		month: () => 'Month',
		week: () => 'Week',
		list: () => 'Month',
	},
	useCalendarContext: vi.fn(() => ({
		selectedDate: DateTime.now(),
		viewType: 'month',
		rangeAnchor: DateTime.now(),
		setSelectedDate: vi.fn(),
		setViewType: vi.fn(),
		navigateToDate: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
	})),
}));

vi.mock('../CalendarHeader/CalendarHeader', async () => ({
	CalendarHeaderDesktop: vi.fn(({ children }) => (
		<div data-testid="calendar-header-desktop">{children}</div>
	)),
	CalendarHeaderMobile: vi.fn(() => (
		<div data-testid="calendar-header-mobile" />
	)),
}));

vi.mock('../MealCalendar/MealCalendar', async () => ({
	MealCalendar: vi.fn(() => <div data-testid="meal-calendar" />),
}));

vi.mock('../MealMonthAgenda/MealMonthAgenda', async () => ({
	MealMonthAgenda: vi.fn(() => <div data-testid="meal-month-agenda" />),
}));

vi.mock('../MealWeekView/MealWeekView', async () => ({
	MealWeekView: vi.fn(() => <div data-testid="meal-week-view" />),
}));

vi.mock('../MealListView/MealListView', async () => ({
	MealListView: vi.fn(() => <div data-testid="meal-list-view" />),
}));

vi.mock('../MealDetailModal/MealDetailModal', async () => ({
	MealDetailModal: vi.fn(() => <div data-testid="meal-detail-modal" />),
}));

const mockUseCalendarContext = vi.mocked(useCalendarContext);
const mockUseIsMobile = vi.mocked(useIsMobile);
const mockMealMonthAgenda = vi.mocked(MealMonthAgenda);

const defaultProps = {
	plannerId: 'planner-1',
	calendar: [{ date: '2024-01-01', meals: [] }] as SerializedDay[],
	savedItems: [{ _id: 'item-1', name: 'Item 1' }] as SavedItem[],
};

const defaultCalendarContext: ReturnType<typeof useCalendarContext> = {
	selectedDate: DateTime.now(),
	viewType: 'month',
	rangeAnchor: DateTime.now(),
	setSelectedDate: vi.fn(),
	setViewType: vi.fn(),
	navigateToDate: vi.fn(),
	goToToday: vi.fn(),
	goToPrevious: vi.fn(),
	goToNext: vi.fn(),
};

describe('CalendarView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCalendarContext.mockReturnValue(defaultCalendarContext);
		mockUseIsMobile.mockReturnValue(false);
	});

	it('renders CalendarHeaderDesktop and MealCalendar by default', () => {
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('calendar-provider')).toBeDefined();
		expect(screen.getByTestId('calendar-header-desktop')).toBeDefined();
		expect(screen.getByTestId('meal-calendar')).toBeDefined();
		expect(screen.queryByTestId('meal-week-view')).toBeNull();
		expect(screen.queryByTestId('meal-list-view')).toBeNull();
	});

	it('renders MealWeekView when viewType is week', () => {
		mockUseCalendarContext.mockReturnValue({
			...defaultCalendarContext,
			viewType: 'week',
		});
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('meal-week-view')).toBeDefined();
		expect(screen.queryByTestId('meal-calendar')).toBeNull();
		expect(screen.queryByTestId('meal-list-view')).toBeNull();
	});

	it('passes calendar, savedItems, plannerId, and onEventClick to MealWeekView', () => {
		mockUseCalendarContext.mockReturnValue({
			...defaultCalendarContext,
			viewType: 'week',
		});
		render(<CalendarView {...defaultProps} />);

		expect(vi.mocked(MealWeekView)).toHaveBeenCalledWith(
			expect.objectContaining({
				calendar: defaultProps.calendar,
				savedItems: defaultProps.savedItems,
				plannerId: 'planner-1',
				onEventClick: expect.any(Function),
			}),
			undefined,
		);
	});

	it('renders MealListView when viewType is list', () => {
		mockUseCalendarContext.mockReturnValue({
			...defaultCalendarContext,
			viewType: 'list',
		});
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('meal-list-view')).toBeDefined();
		expect(screen.queryByTestId('meal-calendar')).toBeNull();
		expect(screen.queryByTestId('meal-week-view')).toBeNull();
	});

	it('passes calendar, savedItems, and plannerId to MealListView without onMealAdded', () => {
		mockUseCalendarContext.mockReturnValue({
			...defaultCalendarContext,
			viewType: 'list',
		});
		render(<CalendarView {...defaultProps} />);

		expect(vi.mocked(MealListView)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId: 'planner-1',
				calendar: defaultProps.calendar,
				savedItems: defaultProps.savedItems,
			}),
			undefined,
		);
		expect(vi.mocked(MealListView).mock.calls[0][0]).not.toHaveProperty(
			'onMealAdded',
		);
	});

	it('renders CalendarHeaderMobile on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('calendar-header-mobile')).toBeDefined();
		expect(screen.queryByTestId('calendar-header-desktop')).toBeNull();
	});

	it('does not render CalendarHeaderMobile on desktop', () => {
		render(<CalendarView {...defaultProps} />);

		expect(screen.queryByTestId('calendar-header-mobile')).toBeNull();
		expect(screen.getByTestId('calendar-header-desktop')).toBeDefined();
	});

	it('uses the calendar prop directly without local state mutation', () => {
		render(<CalendarView {...defaultProps} />);

		expect(vi.mocked(MealCalendar)).toHaveBeenCalledWith(
			expect.objectContaining({
				calendar: defaultProps.calendar,
			}),
			undefined,
		);
	});

	it('passes calendar, savedItems, and onEventClick to MealCalendar', () => {
		render(<CalendarView {...defaultProps} />);

		expect(vi.mocked(MealCalendar)).toHaveBeenCalledWith(
			expect.objectContaining({
				calendar: defaultProps.calendar,
				savedItems: defaultProps.savedItems,
				onEventClick: expect.any(Function),
			}),
			undefined,
		);
	});

	it('opens MealDetailModal when MealCalendar onEventClick is triggered', () => {
		render(<CalendarView {...defaultProps} />);

		const fakeEvent: CalendarEvent = {
			id: 'event-1',
			start: '2024-01-01',
			end: '2024-01-01',
			title: 'Test Event',
			dishes: [],
		};
		const { onEventClick } = vi.mocked(MealCalendar).mock.calls[0][0];
		act(() => {
			onEventClick?.(fakeEvent);
		});

		expect(vi.mocked(MealDetailModal)).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: fakeEvent }),
			undefined,
		);
	});

	it('opens MealDetailModal when MealWeekView onEventClick is triggered', () => {
		mockUseCalendarContext.mockReturnValue({
			...defaultCalendarContext,
			viewType: 'week',
		});
		render(<CalendarView {...defaultProps} />);

		const fakeEvent: CalendarEvent = {
			id: 'event-1',
			start: '2024-01-01',
			end: '2024-01-01',
			title: 'Test Event',
			dishes: [],
		};
		const { onEventClick } = vi.mocked(MealWeekView).mock.calls[0][0];
		act(() => {
			onEventClick?.(fakeEvent);
		});

		expect(vi.mocked(MealDetailModal)).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: fakeEvent }),
			undefined,
		);
	});

	it('renders MealDetailModal with null event initially', () => {
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('meal-detail-modal')).toBeDefined();
		expect(vi.mocked(MealDetailModal)).toHaveBeenCalledWith(
			expect.objectContaining({ event: null, plannerId: 'planner-1' }),
			undefined,
		);
	});

	it('clears clickedEvent when MealDetailModal onClose is called', () => {
		render(<CalendarView {...defaultProps} />);

		const { onClose } = vi.mocked(MealDetailModal).mock.calls[0][0];
		onClose?.();

		expect(vi.mocked(MealDetailModal)).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: null }),
			undefined,
		);
	});

	describe('mobile month view', () => {
		it('renders MealMonthAgenda on mobile when viewType is month', () => {
			mockUseIsMobile.mockReturnValue(true);
			render(<CalendarView {...defaultProps} />);

			expect(screen.getByTestId('meal-month-agenda')).toBeDefined();
		});

		it('does not render MealCalendar on mobile when viewType is month', () => {
			mockUseIsMobile.mockReturnValue(true);
			render(<CalendarView {...defaultProps} />);

			expect(screen.queryByTestId('meal-calendar')).toBeNull();
		});

		it('passes plannerId, calendar, and savedItems to MealMonthAgenda without onMealAdded', () => {
			mockUseIsMobile.mockReturnValue(true);
			render(<CalendarView {...defaultProps} />);

			expect(mockMealMonthAgenda).toHaveBeenCalledWith(
				expect.objectContaining({
					plannerId: 'planner-1',
					calendar: defaultProps.calendar,
					savedItems: defaultProps.savedItems,
				}),
				undefined,
			);
			expect(vi.mocked(MealMonthAgenda).mock.calls[0][0]).not.toHaveProperty(
				'onMealAdded',
			);
		});
	});

	describe('desktop month view', () => {
		it('renders MealCalendar on desktop when viewType is month', () => {
			render(<CalendarView {...defaultProps} />);

			expect(screen.getByTestId('meal-calendar')).toBeDefined();
		});

		it('does not render MealMonthAgenda on desktop when viewType is month', () => {
			render(<CalendarView {...defaultProps} />);

			expect(screen.queryByTestId('meal-month-agenda')).toBeNull();
		});
	});
});
