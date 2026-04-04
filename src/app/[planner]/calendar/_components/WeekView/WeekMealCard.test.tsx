import 'temporal-polyfill/global';

import { MantineProvider } from '@mantine/core';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { WeekMealCard } from './WeekMealCard';

vi.mock('./WeekView.module.css', () => ({
	default: {
		card: 'card',
		title: 'title',
		description: 'description',
	},
}));

const day = Temporal.PlainDate.from('2024-01-15');

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

const defaultProps = {
	meal: { _id: 'meal-1', name: 'Lunch', dishes: [] },
	day,
	onMealClick: vi.fn(),
	plannerId: 'planner-1',
	savedMap: new Map(),
} as Parameters<typeof WeekMealCard>[0];

describe('WeekMealCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('renders meal name', () => {
		render(<WeekMealCard {...defaultProps} />, { wrapper });
		expect(screen.getByText('Lunch')).toBeDefined();
	});

	test('renders meal description when present', () => {
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			description: 'A light meal',
			dishes: [],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} />, { wrapper });
		expect(screen.getByText('A light meal')).toBeDefined();
	});

	test('does not render description element when absent', () => {
		render(<WeekMealCard {...defaultProps} />, { wrapper });
		expect(screen.queryByText('undefined')).toBeNull();
	});

	test('renders dish names', () => {
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Soup' }, { name: 'Bread' }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} />, { wrapper });
		expect(screen.getByText('Soup')).toBeDefined();
		expect(screen.getByText('Bread')).toBeDefined();
	});

	test('dish with url source renders as external Anchor link', () => {
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Pasta', source: { url: 'https://example.com' } }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} />, { wrapper });
		const link = screen.getByRole('link', { name: 'Pasta' });
		expect(link.getAttribute('href')).toBe('https://example.com');
		expect(link.getAttribute('target')).toBe('_blank');
	});

	test('dish with _id source renders as internal Anchor link', () => {
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Carbonara', source: { _id: 'recipe-123' } }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} />, { wrapper });
		const link = screen.getByRole('link', { name: 'Carbonara' });
		expect(link.getAttribute('href')).toBe('/planner-1/recipes/recipe-123');
	});

	test('dish with ref source renders as plain text', () => {
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Roast Chicken', source: { ref: 'The Flavor Bible' } }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} />, { wrapper });
		expect(screen.getByText('Roast Chicken')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});

	test('dish with unresolvable string source renders as plain text', () => {
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Soup', source: 'unknown-id' }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} />, { wrapper });
		expect(screen.getByText('Soup')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});

	test('dish with no source renders as plain text', () => {
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Salad' }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} />, { wrapper });
		expect(screen.getByText('Salad')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});

	test('resolves bookmark string source to external link via savedMap', () => {
		const savedMap = new Map([
			[
				'saved-1',
				{
					_id: 'saved-1',
					name: 'Tasty Recipe',
					url: 'https://tasty.co/recipe',
				},
			],
		]);
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Tasty Pasta', source: 'saved-1' }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} savedMap={savedMap} />, {
			wrapper,
		});
		const link = screen.getByRole('link', { name: 'Tasty Pasta' });
		expect(link.getAttribute('href')).toBe('https://tasty.co/recipe');
		expect(link.getAttribute('target')).toBe('_blank');
	});

	test('resolves saved recipe string source to internal link via savedMap', () => {
		const savedMap = new Map([
			['recipe-abc', { _id: 'recipe-abc', name: 'Carbonara' }],
		]);
		const meal = {
			_id: 'meal-1',
			name: 'Dinner',
			dishes: [{ name: 'Carbonara', source: 'recipe-abc' }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} savedMap={savedMap} />, {
			wrapper,
		});
		const link = screen.getByRole('link', { name: 'Carbonara' });
		expect(link.getAttribute('href')).toBe('/planner-1/recipes/recipe-abc');
	});

	test('dish with a note still renders as a link when source resolves', () => {
		const savedMap = new Map([
			[
				'saved-1',
				{ _id: 'saved-1', name: 'Some Recipe', url: 'https://example.com' },
			],
		]);
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Dish', source: 'saved-1', note: 'cook extra crispy' }],
		};
		render(<WeekMealCard {...defaultProps} meal={meal} savedMap={savedMap} />, {
			wrapper,
		});
		const link = screen.getByRole('link', { name: 'Dish' });
		expect(link.getAttribute('href')).toBe('https://example.com');
	});

	test('clicking calls onMealClick with the correct MealEvent', () => {
		const onMealClick = vi.fn();
		const meal = {
			_id: 'meal-1',
			name: 'Breakfast',
			description: 'Good morning',
			dishes: [{ name: 'Eggs' }],
		};
		render(
			<WeekMealCard {...defaultProps} meal={meal} onMealClick={onMealClick} />,
			{ wrapper },
		);
		fireEvent.click(screen.getByTestId('week-meal-card'));
		expect(onMealClick).toHaveBeenCalledOnce();
		expect(onMealClick).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'meal-1',
				title: 'Breakfast',
				description: 'Good morning',
				dishes: [{ name: 'Eggs' }],
			}),
		);
	});

	test('clicking passes resolved dishes to onMealClick', () => {
		const onMealClick = vi.fn();
		const savedMap = new Map([
			[
				'saved-1',
				{ _id: 'saved-1', name: 'Some Recipe', url: 'https://example.com' },
			],
		]);
		const meal = {
			_id: 'meal-1',
			name: 'Lunch',
			dishes: [{ name: 'Dish', source: 'saved-1' }],
		};
		render(
			<WeekMealCard
				{...defaultProps}
				meal={meal}
				savedMap={savedMap}
				onMealClick={onMealClick}
			/>,
			{ wrapper },
		);
		fireEvent.click(screen.getByTestId('week-meal-card'));
		expect(onMealClick).toHaveBeenCalledWith(
			expect.objectContaining({
				dishes: [{ name: 'Dish', source: { url: 'https://example.com' } }],
			}),
		);
	});
});
