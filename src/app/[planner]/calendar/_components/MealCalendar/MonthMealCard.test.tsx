import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MonthMealCard } from './MonthMealCard';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_theme/colors', () => ({
	getMealColor: vi.fn(() => 'tangerine'),
	TAG_COLORS: {
		tangerine: { bg: '#FDEBD6', text: '#7A3410', border: '#F5B47A' },
	},
}));

import { getMealColor } from '@/_theme/colors';

describe('MonthMealCard', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('calls getMealColor with meal name', () => {
		const meal = { id: '1', date: '2024-01-15', name: 'Breakfast' };
		render(<MonthMealCard meal={meal} />);
		expect(getMealColor).toHaveBeenCalledWith('Breakfast');
	});

	it('calls onClick when clicked', () => {
		const meal = { id: '1', date: '2024-01-15', name: 'Breakfast' };
		const onClick = vi.fn();
		render(<MonthMealCard meal={meal} onClick={onClick} />);
		fireEvent.click(screen.getByText('Breakfast'));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('renders description when present and omits it when absent', () => {
		const mealWithDescription = {
			id: '1',
			date: '2024-01-15',
			name: 'Breakfast',
			description: 'Eggs and toast',
		};
		const { rerender } = render(<MonthMealCard meal={mealWithDescription} />);
		expect(screen.getByText('Eggs and toast')).toBeDefined();

		const mealWithoutDescription = {
			id: '1',
			date: '2024-01-15',
			name: 'Breakfast',
		};
		rerender(<MonthMealCard meal={mealWithoutDescription} />);
		expect(screen.queryByText('Eggs and toast')).toBeNull();
	});
});
