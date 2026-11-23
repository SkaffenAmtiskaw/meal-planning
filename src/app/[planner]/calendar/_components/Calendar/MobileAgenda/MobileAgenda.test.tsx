import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { DateTime } from 'luxon';

import { useToday } from '@/_hooks';

import { MobileAgenda } from './MobileAgenda';

import { useCalendarContext } from '../CalendarContext';
import type { CalendarDish, CalendarMeal } from '../types';
import { MealCard } from '../MealCard/MealCard';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('../CalendarContext', async () => ({
	useCalendarContext: vi.fn(),
}));
vi.mock('../MealCard/MealCard', () => ({
	MealCard: vi.fn(() => <div data-testid="meal-card" />),
}));
interface RenderOptions {
	selectedDate?: DateTime;
	meals?: CalendarMeal[];
	renderDish?: (dish: CalendarDish) => ReactNode;
}

function renderAgenda({
	selectedDate = DateTime.local(2024, 3, 15),
	meals = [],
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

	return render(<MobileAgenda meals={meals} renderDish={renderDish} />);
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

		vi.mocked(useToday).mockReturnValue(today);
		renderAgenda({ selectedDate: today });

		expect(screen.getByText('Today · Friday, March 15')).toBeDefined();
	});

	it('does not prefix the header when the selected date is not today', () => {
		const today = DateTime.local(2024, 3, 15);
		const selectedDate = DateTime.local(2024, 3, 16);

		vi.mocked(useToday).mockReturnValue(today);
		renderAgenda({ selectedDate });

		expect(screen.queryByText('Today · Saturday, March 16')).toBeNull();
		expect(screen.getByText('Saturday, March 16')).toBeDefined();
	});

	it('renders the singular meal count', () => {
		const meals: CalendarMeal[] = [
			{
				id: '1',
				date: '2024-03-15',
				name: 'Meal 1',
				borderColor: '#000000',
				dishes: [],
			},
		];

		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15), meals });

		expect(screen.getByText('1 MEAL')).toBeDefined();
	});

	it('renders the plural meal count', () => {
		const meals: CalendarMeal[] = [
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

		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15), meals });

		expect(screen.getByText('2 MEALS')).toBeDefined();
	});

	it('renders a MealCard for each meal on the selected date', () => {
		const meals: CalendarMeal[] = [
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

		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15), meals });

		expect(screen.getAllByTestId('meal-card')).toHaveLength(2);
	});

	it('passes renderDish to each MealCard', () => {
		const meals: CalendarMeal[] = [
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
			meals,
			renderDish,
		});

		expect(vi.mocked(MealCard)).toHaveBeenCalledTimes(2);
		expect(vi.mocked(MealCard)).toHaveBeenCalledWith(
			expect.objectContaining({ meal: meals[0], renderDish }),
			undefined,
		);
		expect(vi.mocked(MealCard)).toHaveBeenCalledWith(
			expect.objectContaining({ meal: meals[1], renderDish }),
			undefined,
		);
	});

	it('does not render meals from other dates', () => {
		const meals: CalendarMeal[] = [
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

		renderAgenda({ selectedDate: DateTime.local(2024, 3, 15), meals });

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

			rerender(<MobileAgenda meals={[]} />);

			expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
		} finally {
			Element.prototype.scrollTo = originalScrollTo;
		}
	});
});
