import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReactElement } from 'react';

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CalendarDish, CalendarMeal } from '@/_components/Calendar';
import { ListView } from '@/_components/Calendar';
import { useIsMobile } from '@/_hooks';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';
import { useCanWrite } from '@/app/[planner]/_components';

import { MealListView } from './MealListView';

import {
	type CalendarEvent,
	toCalendarEvents,
} from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealFormModalWrapper } from '../AddMealFormModalWrapper/AddMealFormModalWrapper';
import { DishLink } from '../DishLink/DishLink';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}));

vi.mock('@/_components/Calendar', async () => ({
	ListView: vi.fn(({ events, renderDish }) => (
		<div data-testid="list-view" data-events={JSON.stringify(events)}>
			{events.map((event: CalendarMeal) => (
				<div key={event.id} data-testid={`event-${event.id}`}>
					{event.dishes.map((dish) => (
						<div key={dish.name} data-testid={`dish-${event.id}-${dish.name}`}>
							{renderDish?.(dish)}
						</div>
					))}
				</div>
			))}
		</div>
	)),
}));

vi.mock('@/app/[planner]/_components', async () => ({
	useCanWrite: vi.fn(() => true),
}));

const mockRefresh = vi.fn();
vi.mock('../AddMealFormModalWrapper/AddMealFormModalWrapper', () => ({
	AddMealFormModalWrapper: vi.fn(({ plannerId, initialDate, onClose }) => (
		<div data-testid="add-meal-form-modal-wrapper">
			<span data-testid="wrapper-planner-id">{plannerId}</span>
			<span data-testid="wrapper-initial-date">{initialDate ?? 'none'}</span>
			<button
				type="button"
				data-testid="wrapper-success"
				onClick={() => {
					onClose();
					mockRefresh();
				}}
			>
				Simulate success
			</button>
			<button type="button" data-testid="wrapper-cancel" onClick={onClose}>
				Simulate cancel
			</button>
		</div>
	)),
}));

vi.mock('../DishLink/DishLink', async () => ({
	DishLink: vi.fn(() => <div data-testid="dish-link" />),
}));

vi.mock('../../_utils/toCalendarEvents', async () => ({
	toCalendarEvents: vi.fn(() => []),
}));

vi.mock('@/_theme/colors', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/_theme/colors')>();
	return {
		...actual,
		getMealColor: vi.fn(() => 'fern'),
	};
});

const mockUseCanWrite = vi.mocked(useCanWrite);
const mockListView = vi.mocked(ListView);
const mockModal = vi.mocked(Modal);
const mockAddMealFormModalWrapper = vi.mocked(AddMealFormModalWrapper);
const mockToCalendarEvents = vi.mocked(toCalendarEvents);
const mockGetMealColor = vi.mocked(getMealColor);
const mockDishLink = vi.mocked(DishLink);
const mockUseIsMobile = vi.mocked(useIsMobile);
const mockUseRouter = vi.mocked(useRouter);

const plannerId = 'planner-123';

const savedItems: SavedItem[] = [
	{ _id: 'saved-1', name: 'Saved Dish', url: 'http://example.com' },
];

const calendar: SerializedDay[] = [
	{
		date: '2024-06-15',
		meals: [
			{
				_id: 'meal-1',
				name: 'Breakfast',
				description: 'Morning meal',
				dishes: [{ name: 'Eggs' }],
			},
		],
	},
];

const calendarEvents: CalendarEvent[] = [
	{
		id: 'meal-1',
		start: '2024-06-15',
		end: '2024-06-15',
		title: 'Breakfast',
		description: 'Morning meal',
		dishes: [{ name: 'Resolved Eggs', source: { _id: 'saved-1' } }],
	},
];

function ListViewDayTrigger({
	onAddMeal,
	date,
}: {
	onAddMeal?: (date: DateTime) => void;
	date: DateTime;
}): ReactElement {
	return (
		<button
			type="button"
			data-testid="day-trigger"
			onClick={() => onAddMeal?.(date)}
		>
			Add meal
		</button>
	);
}

describe('MealListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCanWrite.mockReturnValue(true);
		mockUseIsMobile.mockReturnValue(false);
		mockUseRouter.mockReturnValue({
			refresh: mockRefresh,
		} as unknown as ReturnType<typeof useRouter>);
		vi.mocked(useDisclosure).mockImplementation((initialState = false) => {
			const [opened, setOpened] = useState(initialState);
			return [
				opened,
				{
					open: () => setOpened(true),
					close: () => setOpened(false),
					toggle: () => setOpened((current) => !current),
					set: (value: boolean) => setOpened(value),
				},
			];
		});
	});

	it('renders ListView', () => {
		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
	});

	it('renders MobileListViewPlaceholder on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.getByText('Coming soon')).toBeDefined();
		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('renders ListView on desktop', () => {
		mockUseIsMobile.mockReturnValue(false);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
		expect(screen.queryByText('Coming soon')).toBeNull();
	});

	it('does not render ListView on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('does not render MobileListViewPlaceholder on desktop', () => {
		mockUseIsMobile.mockReturnValue(false);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.queryByText('Coming soon')).toBeNull();
	});

	it('passes a renderDish function that uses DishLink with size sm', () => {
		const dish: CalendarDish = {
			name: 'Rendered Dish',
			source: { _id: 'recipe-1' },
		};
		mockToCalendarEvents.mockReturnValue([
			{
				id: 'meal-1',
				start: '2024-06-15',
				end: '2024-06-15',
				title: 'Breakfast',
				dishes: [dish],
			},
		]);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={calendar}
				savedItems={savedItems}
			/>,
		);

		expect(screen.getByTestId('dish-link')).toBeDefined();
		expect(mockDishLink).toHaveBeenCalledWith(
			expect.objectContaining({
				dish,
				plannerId,
				size: 'sm',
			}),
			undefined,
		);
	});

	it('passes calendar-derived events to ListView', () => {
		mockToCalendarEvents.mockReturnValue(calendarEvents);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={calendar}
				savedItems={savedItems}
			/>,
		);

		expect(mockToCalendarEvents).toHaveBeenCalledWith(calendar, savedItems);

		const listView = screen.getByTestId('list-view');
		const events = JSON.parse(listView.getAttribute('data-events') ?? '[]');

		expect(events).toEqual([
			{
				id: 'meal-1',
				date: '2024-06-15',
				name: 'Breakfast',
				description: 'Morning meal',
				borderColor: TAG_COLORS.fern.border,
				dishes: [{ name: 'Resolved Eggs', source: { _id: 'saved-1' } }],
			},
		]);
	});

	it('computes the correct border color for each meal from TAG_COLORS', () => {
		mockGetMealColor.mockImplementation((title) =>
			title === 'Breakfast' ? 'fern' : 'seafoam',
		);
		mockToCalendarEvents.mockReturnValue([
			{
				id: 'meal-1',
				start: '2024-06-15',
				end: '2024-06-15',
				title: 'Breakfast',
				dishes: [],
			},
			{
				id: 'meal-2',
				start: '2024-06-15',
				end: '2024-06-15',
				title: 'Dinner',
				dishes: [],
			},
		]);

		render(<MealListView plannerId={plannerId} calendar={calendar} />);

		const events = JSON.parse(
			screen.getByTestId('list-view').getAttribute('data-events') ?? '[]',
		);

		expect(events[0].borderColor).toBe(TAG_COLORS.fern.border);
		expect(events[1].borderColor).toBe(TAG_COLORS.seafoam.border);
	});

	it('resolves dish sources using savedItems before passing events', () => {
		mockToCalendarEvents.mockReturnValue(calendarEvents);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={calendar}
				savedItems={savedItems}
			/>,
		);

		expect(mockToCalendarEvents).toHaveBeenCalledWith(calendar, savedItems);

		const events = JSON.parse(
			screen.getByTestId('list-view').getAttribute('data-events') ?? '[]',
		);

		expect(events[0].dishes).toEqual(calendarEvents[0].dishes);
	});

	it('passes onAddMeal to ListView when user has write access', () => {
		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(mockListView).toHaveBeenCalledTimes(1);
		expect(mockListView).toHaveBeenCalledWith(
			expect.objectContaining({ onAddMeal: expect.any(Function) }),
			undefined,
		);
	});

	it('does not pass onAddMeal to ListView when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(mockListView).toHaveBeenCalledTimes(1);
		expect(mockListView).toHaveBeenCalledWith(
			expect.objectContaining({ onAddMeal: undefined }),
			undefined,
		);
	});

	it('opens the modal with the correct initialDate when a day trigger is clicked', () => {
		const date = DateTime.local(2024, 6, 15);

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={date} />
		));

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(screen.getByRole('dialog')).toBeDefined();
		expect(mockModal).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Add Meal',
				size: 'lg',
				opened: true,
			}),
			undefined,
		);
		expect(mockAddMealFormModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				initialDate: date.toISODate(),
				onClose: expect.any(Function),
			}),
			undefined,
		);
	});

	it('falls back to undefined initialDate when the date is invalid', () => {
		const invalidDate = DateTime.invalid('invalid');

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={invalidDate} />
		));

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(mockAddMealFormModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({
				initialDate: undefined,
			}),
			undefined,
		);
	});

	it('closes the modal and refreshes the route when the wrapper reports success', () => {
		const date = DateTime.local(2024, 6, 15);

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={date} />
		));

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(screen.getByRole('dialog')).toBeDefined();

		act(() => {
			fireEvent.click(screen.getByTestId('wrapper-success'));
		});

		expect(screen.queryByRole('dialog')).toBeNull();
		expect(mockRefresh).toHaveBeenCalled();
	});
});
