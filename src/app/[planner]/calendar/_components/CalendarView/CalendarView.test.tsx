import { useMediaQuery } from '@mantine/hooks';

import { act, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CalendarHeader, useCalendarContext } from '@/_components/Calendar';

import { CalendarView } from './CalendarView';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealButton } from '../AddMealButton/AddMealButton';
import { MealCalendar } from '../MealCalendar/MealCalendar';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

vi.mock('@/_components/Calendar', async () => ({
	CalendarProvider: vi.fn(({ children }) => (
		<div data-testid="calendar-provider">{children}</div>
	)),
	CalendarHeader: vi.fn(({ rightSection }) => (
		<div data-testid="calendar-header">{rightSection}</div>
	)),
	WeekView: vi.fn(() => <div data-testid="week-view" />),
	ListView: vi.fn(() => <div data-testid="list-view" />),
	useCalendarContext: vi.fn(() => ({
		selectedDate: DateTime.now(),
		viewType: 'month',
		setSelectedDate: vi.fn(),
		setViewType: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
	})),
}));

vi.mock('../MealCalendar/MealCalendar', async () => ({
	MealCalendar: vi.fn(() => <div data-testid="meal-calendar" />),
}));

vi.mock('../AddMealButton/AddMealButton', async () => ({
	AddMealButton: vi.fn(() => <div data-testid="add-meal-button" />),
}));

vi.mock('../MealDetailModal/MealDetailModal', async () => ({
	MealDetailModal: vi.fn(() => <div data-testid="meal-detail-modal" />),
}));

const mockUseCalendarContext = vi.mocked(useCalendarContext);
const mockUseMediaQuery = vi.mocked(useMediaQuery);

const defaultProps = {
	plannerId: 'planner-1',
	calendar: [{ date: '2024-01-01', meals: [] }] as SerializedDay[],
	savedItems: [{ _id: 'item-1', name: 'Item 1' }] as SavedItem[],
};

const defaultCalendarContext: ReturnType<typeof useCalendarContext> = {
	selectedDate: DateTime.now(),
	viewType: 'month',
	setSelectedDate: vi.fn(),
	setViewType: vi.fn(),
	goToToday: vi.fn(),
	goToPrevious: vi.fn(),
	goToNext: vi.fn(),
};

describe('CalendarView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCalendarContext.mockReturnValue(defaultCalendarContext);
		mockUseMediaQuery.mockReturnValue(false);
	});

	it('renders CalendarHeader and MealCalendar by default', () => {
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('calendar-provider')).toBeDefined();
		expect(screen.getByTestId('calendar-header')).toBeDefined();
		expect(screen.getByTestId('meal-calendar')).toBeDefined();
		expect(screen.queryByTestId('week-view')).toBeNull();
		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('renders WeekView when viewType is week', () => {
		mockUseCalendarContext.mockReturnValue({
			...defaultCalendarContext,
			viewType: 'week',
		});
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('week-view')).toBeDefined();
		expect(screen.queryByTestId('meal-calendar')).toBeNull();
		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('renders ListView when viewType is list', () => {
		mockUseCalendarContext.mockReturnValue({
			...defaultCalendarContext,
			viewType: 'list',
		});
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
		expect(screen.queryByTestId('meal-calendar')).toBeNull();
		expect(screen.queryByTestId('week-view')).toBeNull();
	});

	it('passes mobile views to CalendarHeader when isMobile is true', () => {
		mockUseMediaQuery.mockReturnValue(true);
		render(<CalendarView {...defaultProps} />);

		expect(vi.mocked(CalendarHeader)).toHaveBeenCalledWith(
			expect.objectContaining({ availableViews: ['month', 'list'] }),
			undefined,
		);
	});

	it('passes desktop views to CalendarHeader when isMobile is false', () => {
		render(<CalendarView {...defaultProps} />);

		expect(vi.mocked(CalendarHeader)).toHaveBeenCalledWith(
			expect.objectContaining({ availableViews: ['month', 'week', 'list'] }),
			undefined,
		);
	});

	it('renders AddMealButton inside CalendarHeader rightSection', () => {
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('add-meal-button')).toBeDefined();
		expect(vi.mocked(AddMealButton)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId: 'planner-1',
				onMealAdded: expect.any(Function),
			}),
			undefined,
		);
	});

	it('updates calendar data when AddMealButton onMealAdded is called', () => {
		render(<CalendarView {...defaultProps} />);

		const updatedCalendar: SerializedDay[] = [
			{ date: '2024-01-02', meals: [] },
		];
		const { onMealAdded } = vi.mocked(AddMealButton).mock.calls[0][0];
		act(() => {
			onMealAdded?.(updatedCalendar);
		});

		expect(vi.mocked(MealCalendar)).toHaveBeenLastCalledWith(
			expect.objectContaining({ calendar: updatedCalendar }),
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
});
