import { useMediaQuery } from '@mantine/hooks';

import { render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	CalendarHeader,
	CalendarProvider,
	ListView,
	MonthGrid,
	useCalendarContext,
	WeekView,
} from '@/_components/Calendar';

import { CalendarView } from './CalendarView';

import { AddMealButton } from '../AddMealButton/AddMealButton';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

vi.mock('@/_components/Calendar', () => ({
	CalendarProvider: vi.fn(({ children }) => (
		<div data-testid="calendar-provider">{children}</div>
	)),
	CalendarHeader: vi.fn(({ rightSection }) => (
		<div data-testid="calendar-header">{rightSection}</div>
	)),
	MonthGrid: vi.fn(() => <div data-testid="month-grid" />),
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

vi.mock('../AddMealButton/AddMealButton', () => ({
	AddMealButton: vi.fn(() => <div data-testid="add-meal-button" />),
}));

vi.mock('../MealDetailModal/MealDetailModal', () => ({
	MealDetailModal: vi.fn(() => <div data-testid="meal-detail-modal" />),
}));

const mockUseCalendarContext = vi.mocked(useCalendarContext);
const mockUseMediaQuery = vi.mocked(useMediaQuery);

const defaultProps = { plannerId: 'planner-1' };

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

	it('renders CalendarHeader and MonthGrid by default', () => {
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('calendar-provider')).toBeDefined();
		expect(screen.getByTestId('calendar-header')).toBeDefined();
		expect(screen.getByTestId('month-grid')).toBeDefined();
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
		expect(screen.queryByTestId('month-grid')).toBeNull();
		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('renders ListView when viewType is list', () => {
		mockUseCalendarContext.mockReturnValue({
			...defaultCalendarContext,
			viewType: 'list',
		});
		render(<CalendarView {...defaultProps} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
		expect(screen.queryByTestId('month-grid')).toBeNull();
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

	it('passes a no-op onMealAdded handler to AddMealButton', () => {
		render(<CalendarView {...defaultProps} />);

		const { onMealAdded } = vi.mocked(AddMealButton).mock.calls[0][0];
		expect(() => onMealAdded?.([])).not.toThrow();
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
