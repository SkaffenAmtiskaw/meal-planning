import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { useIsMobile } from '@/_hooks';
import type { DayInterface } from '@/_models/types';

import { CalendarView } from './CalendarView';

import { useCalendarContext } from '../Calendar';
import { CalendarModalProvider } from '../CalendarModal';
import type { SavedItem } from '../../types';
import { MealCalendar } from '../MealCalendar/MealCalendar';
import { MealListView } from '../MealListView/MealListView';
import { MealMonthAgenda } from '../MealMonthAgenda/MealMonthAgenda';
import { MealWeekView } from '../MealWeekView/MealWeekView';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../Calendar', async () => ({
	CalendarProvider: vi.fn(({ children }) => (
		<div data-testid="calendar-provider">{children}</div>
	)),
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

vi.mock(
	'../CalendarModal',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_components/CalendarModal'),
);

const mockUseCalendarContext = vi.mocked(useCalendarContext);
const mockUseIsMobile = vi.mocked(useIsMobile);
const mockMealMonthAgenda = vi.mocked(MealMonthAgenda);

const defaultProps = {
	plannerId: 'planner-1',
	calendar: [{ date: '2024-01-01', meals: [] }] as DayInterface[],
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

	it('renders CalendarModalProvider with plannerId', () => {
		render(<CalendarView {...defaultProps} />);

		expect(vi.mocked(CalendarModalProvider)).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId: 'planner-1' }),
			undefined,
		);
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

	it('passes calendar, savedItems and plannerId to MealWeekView', () => {
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

	it('passes calendar and savedItems to MealCalendar', () => {
		render(<CalendarView {...defaultProps} />);

		expect(vi.mocked(MealCalendar)).toHaveBeenCalledWith(
			expect.objectContaining({
				calendar: defaultProps.calendar,
				savedItems: defaultProps.savedItems,
			}),
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
