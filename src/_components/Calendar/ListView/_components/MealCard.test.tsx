import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealCard } from './MealCard';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./MealCard.module.css', () => ({
	default: {
		mealCard: 'mealCard',
		dragHandle: 'dragHandle',
		dragHandleGrid: 'dragHandleGrid',
		dragHandleDot: 'dragHandleDot',
	},
}));

describe('MealCard', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const baseEvent = {
		id: 'event-1',
		date: '2024-06-15',
		name: 'Grilled Salmon',
		borderColor: '#F5B47A',
		dishes: [],
	};

	it('renders the description when provided', () => {
		const event = { ...baseEvent, description: 'With lemon and herbs' };

		render(<MealCard event={event} />);

		expect(screen.getByText('With lemon and herbs')).toBeDefined();
	});

	it('does not render a description when omitted', () => {
		render(<MealCard event={baseEvent} />);

		expect(screen.queryByText('With lemon and herbs')).toBeNull();
	});

	it('applies the correct left rail border color from the event', () => {
		render(<MealCard event={baseEvent} />);

		const card = screen.getByTestId('meal-card');

		expect((card as HTMLElement).style.borderLeftWidth).toBe('4px');
		expect((card as HTMLElement).style.borderLeftStyle).toBe('solid');
		expect((card as HTMLElement).style.borderLeftColor).toBe(
			'rgb(245, 180, 122)',
		);
	});
});
