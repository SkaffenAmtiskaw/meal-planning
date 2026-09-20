import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCalendarContext } from '@/_components/Calendar';
import type {
	CalendarDish,
	CalendarMeal,
} from '@/_components/Calendar/_types/CalendarMeal.types';
import { MealCard } from '@/_components/Calendar/MealCard/MealCard';

import { MobileAgenda } from './MobileAgenda';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@/_components/Calendar', async () => ({
	useCalendarContext: vi.fn(),
}));
vi.mock('@/_components/Calendar/MealCard/MealCard', () => ({
	MealCard: vi.fn(() => <div data-testid="meal-card" />),
}));
vi.mock('./MobileAgenda.module.css', () => ({
	default: {
		emptyCard: 'emptyCard',
		stack: 'stack',
	},
}));

interface RenderOptions {
	selectedDate?: DateTime;
	events?: CalendarMeal[];
	renderDish?: (dish: CalendarDish) => ReactNode;
}

function renderAgenda({
	selectedDate = DateTime.local(2024, 3, 15),
	events = [],
	renderDish,
}: RenderOptions = {}) {
	vi.mocked(useCalendarContext).mockReturnValue({
		selectedDate,
		viewType: 'month',
		rangeAnchor: selectedDate,
		setSelectedDate: vi.fn(),
		setViewType: vi.fn(),
		navigateToDate: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
	} as ReturnType<typeof useCalendarContext>);

	return render(<MobileAgenda events={events} renderDish={renderDish} />);
}

describe('MobileAgenda', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders the long-form date in the header', () => {
		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15) });

		expect(screen.getByText('Friday, March 15')).toBeDefined();
	});

	it('prefixes the header with "Today · " when the selected date is today', () => {
		const today = DateTime.local(2024, 3, 15);

		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());
		renderAgenda({ selectedDate: today });

		expect(screen.getByText('Today · Friday, March 15')).toBeDefined();

		vi.useRealTimers();
	});

	it('does not prefix the header when the selected date is not today', () => {
		const today = DateTime.local(2024, 3, 15);
		const selectedDate = DateTime.local(2024, 3, 16);

		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());
		renderAgenda({ selectedDate });

		expect(screen.queryByText('Today · Saturday, March 16')).toBeNull();
		expect(screen.getByText('Saturday, March 16')).toBeDefined();

		vi.useRealTimers();
	});

	it('renders the singular meal count', () => {
		const events: CalendarMeal[] = [
			{
				id: '1',
				date: '2024-03-15',
				name: 'Meal 1',
				borderColor: '#000000',
				dishes: [],
			},
		];

		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15), events });

		expect(screen.getByText('1 MEAL')).toBeDefined();
	});

	it('renders the plural meal count', () => {
		const events: CalendarMeal[] = [
			{
				id: '1',
				date: '2024-03-15',
				name: 'Meal 1',
				borderColor: '#000000',
				dishes: [],
			},
			{
				id: '2',
				date: '2024-03-15',
				name: 'Meal 2',
				borderColor: '#000000',
				dishes: [],
			},
		];

		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15), events });

		expect(screen.getByText('2 MEALS')).toBeDefined();
	});

	it('renders a MealCard for each meal on the selected date', () => {
		const events: CalendarMeal[] = [
			{
				id: '1',
				date: '2024-03-15',
				name: 'Meal 1',
				borderColor: '#000000',
				dishes: [],
			},
			{
				id: '2',
				date: '2024-03-15',
				name: 'Meal 2',
				borderColor: '#000000',
				dishes: [],
			},
		];

		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15), events });

		expect(screen.getAllByTestId('meal-card')).toHaveLength(2);
	});

	it('passes renderDish to each MealCard', () => {
		const events: CalendarMeal[] = [
			{
				id: '1',
				date: '2024-03-15',
				name: 'Meal 1',
				borderColor: '#000000',
				dishes: [],
			},
			{
				id: '2',
				date: '2024-03-15',
				name: 'Meal 2',
				borderColor: '#000000',
				dishes: [],
			},
		];
		const renderDish = vi.fn(() => <span>Custom dish</span>);

		renderAgenda({
			selectedDate: DateTime.local(2024, 3, 15),
			events,
			renderDish,
		});

		expect(vi.mocked(MealCard)).toHaveBeenCalledTimes(2);
		expect(vi.mocked(MealCard)).toHaveBeenCalledWith(
			expect.objectContaining({ event: events[0], renderDish }),
			undefined,
		);
		expect(vi.mocked(MealCard)).toHaveBeenCalledWith(
			expect.objectContaining({ event: events[1], renderDish }),
			undefined,
		);
	});

	it('does not render meals from other dates', () => {
		const events: CalendarMeal[] = [
			{
				id: '1',
				date: '2024-03-14',
				name: 'Meal 1',
				borderColor: '#000000',
				dishes: [],
			},
			{
				id: '2',
				date: '2024-03-16',
				name: 'Meal 2',
				borderColor: '#000000',
				dishes: [],
			},
		];

		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15), events });

		expect(screen.queryByTestId('meal-card')).toBeNull();
	});

	it('renders the empty placeholder when the selected day has no meals', () => {
		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15) });

		expect(screen.getByText('Nothing planned yet')).toBeDefined();
	});

	it('adds aria-live="polite" to the header date', () => {
		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15) });

		const dateText = screen.getByText('Friday, March 15');

		expect(dateText.getAttribute('aria-live')).toBe('polite');
	});

	it('resets scroll to top when the selected date changes', () => {
		const scrollTo = vi.fn();
		const originalScrollTo = Element.prototype.scrollTo;

		try {
			Element.prototype.scrollTo = scrollTo;

			const { rerender } = renderAgenda({
				selectedDate: DateTime.local(2024, 3, 15),
			});

			scrollTo.mockClear();

			vi.mocked(useCalendarContext).mockReturnValue({
				selectedDate: DateTime.local(2024, 3, 16),
				viewType: 'month',
				rangeAnchor: DateTime.local(2024, 3, 16),
				setSelectedDate: vi.fn(),
				setViewType: vi.fn(),
				navigateToDate: vi.fn(),
				goToToday: vi.fn(),
				goToPrevious: vi.fn(),
				goToNext: vi.fn(),
			} as ReturnType<typeof useCalendarContext>);

			rerender(<MobileAgenda events={[]} />);

			expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
		} finally {
			Element.prototype.scrollTo = originalScrollTo;
		}
	});
});
