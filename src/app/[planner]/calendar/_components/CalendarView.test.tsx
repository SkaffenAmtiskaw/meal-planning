import { MantineProvider } from '@mantine/core';
import { useNextCalendarApp } from '@schedule-x/react';
import { act, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { CalendarView } from './CalendarView';
import { MonthGridEvent } from './MonthGridEvent';

vi.mock('@schedule-x/calendar', () => ({
	createViewList: vi.fn(),
	createViewMonthAgenda: vi.fn(),
	createViewMonthGrid: vi.fn(),
	createViewWeek: vi.fn(),
}));

const mockSet = vi.fn();

vi.mock('@schedule-x/events-service', () => ({
	createEventsServicePlugin: vi.fn(() => ({
		set: mockSet,
	})),
}));

const mockScheduleXCalendar = vi.fn();
vi.mock('@schedule-x/react', () => ({
	useNextCalendarApp: vi.fn((config) => {
		config?.callbacks?.onRender?.();
		return null;
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

vi.mock('@schedule-x/theme-default/dist/index.css', () => ({}));
vi.mock('temporal-polyfill/global', () => ({}));

const mockAddMealButton = vi.fn();
vi.mock('./AddMealButton', () => ({
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

vi.mock('./CalendarView.module.css', () => ({ default: {} }));
vi.mock('./MonthGridEvent', () => ({ MonthGridEvent: vi.fn(() => null) }));

const mockMealDetailModal = vi.fn();
vi.mock('./MealDetailModal', () => ({
	MealDetailModal: (props: {
		event: unknown;
		plannerId: string;
		onClose: () => void;
	}) => {
		mockMealDetailModal(props);
		return null;
	},
}));

const mockToScheduleXEvents = vi.fn();
vi.mock('../_utils/toScheduleXEvents', () => ({
	toScheduleXEvents: (...args: unknown[]) => mockToScheduleXEvents(...args),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

const savedItems = [{ _id: '1', name: 'Pasta' }];

describe('CalendarView', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders the calendar', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(screen.getByTestId('schedule-x-calendar')).toBeDefined();
	});

	test('renders AddMealButton in header via customComponents', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(screen.getByTestId('add-meal-button')).toBeDefined();
	});

	test('passes plannerId to AddMealButton', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(
			screen.getByTestId('add-meal-button').getAttribute('data-planner-id'),
		).toBe('planner-1');
	});

	test('passes savedItems to AddMealButton', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView
				plannerId="planner-1"
				savedItems={savedItems}
				calendar={[]}
			/>,
			{ wrapper },
		);
		expect(
			screen.getByTestId('add-meal-button').getAttribute('data-saved-count'),
		).toBe('1');
	});

	test('passes calendar and savedItems to toScheduleXEvents', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
			},
		];
		const savedItems = [
			{ _id: 'saved-1', name: 'Pasta', url: 'https://example.com' },
		];
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView
				plannerId="planner-1"
				savedItems={savedItems}
				calendar={calendar}
			/>,
			{ wrapper },
		);
		expect(mockToScheduleXEvents).toHaveBeenCalledWith(calendar, savedItems);
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
		const calendar = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
			},
		];
		render(
			<CalendarView
				plannerId="planner-1"
				savedItems={[]}
				calendar={calendar}
			/>,
			{ wrapper },
		);
		expect(vi.mocked(useNextCalendarApp)).toHaveBeenCalledWith(
			expect.objectContaining({ events: mockEvents }),
		);
	});

	test('initializes with empty events when toScheduleXEvents returns empty array', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(vi.mocked(useNextCalendarApp)).toHaveBeenCalledWith(
			expect.objectContaining({ events: [] }),
		);
	});

	test('passes MonthGridEvent as monthGridEvent custom component', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(mockScheduleXCalendar).toHaveBeenCalledWith(
			expect.objectContaining({
				customComponents: expect.objectContaining({
					monthGridEvent: MonthGridEvent,
				}),
			}),
		);
	});

	test('passes onMealAdded to AddMealButton', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(mockAddMealButton).toHaveBeenCalledWith(
			expect.objectContaining({ onMealAdded: expect.any(Function) }),
		);
	});

	test('renders MealDetailModal with null event initially', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(mockMealDetailModal).toHaveBeenCalledWith(
			expect.objectContaining({ event: null }),
		);
	});

	test('passes plannerId to MealDetailModal', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(mockMealDetailModal).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId: 'planner-1' }),
		);
	});

	test('registers onEventClick in calendar callbacks', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		expect(vi.mocked(useNextCalendarApp)).toHaveBeenCalledWith(
			expect.objectContaining({
				callbacks: expect.objectContaining({
					onEventClick: expect.any(Function),
				}),
			}),
		);
	});

	test('onEventClick opens MealDetailModal with the clicked event', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		const { onEventClick } =
			vi.mocked(useNextCalendarApp).mock.calls[0][0].callbacks ?? {};
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => onEventClick?.(mockEvent as never, new MouseEvent('click')));
		expect(mockMealDetailModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: mockEvent }),
		);
	});

	test('MealDetailModal onClose resets the clicked event to null', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]);
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);
		const { onEventClick } =
			vi.mocked(useNextCalendarApp).mock.calls[0][0].callbacks ?? {};
		const mockEvent = { id: 'meal-1', title: 'Breakfast', dishes: [] };
		act(() => onEventClick?.(mockEvent as never, new MouseEvent('click')));
		const { onClose } = mockMealDetailModal.mock.lastCall![0];
		act(() => onClose());
		expect(mockMealDetailModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ event: null }),
		);
	});

	test('onMealAdded replaces all events via eventsService.set', () => {
		mockToScheduleXEvents.mockReturnValueOnce([]); // initial render
		render(
			<CalendarView plannerId="planner-1" savedItems={[]} calendar={[]} />,
			{ wrapper },
		);

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
