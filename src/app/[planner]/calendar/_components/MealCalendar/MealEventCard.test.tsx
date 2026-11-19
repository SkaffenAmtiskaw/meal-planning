import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealEventCard } from './MealEventCard';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_theme/colors', () => ({
	getMealColor: vi.fn(() => 'tangerine'),
	TAG_COLORS: {
		tangerine: { bg: '#FDEBD6', text: '#7A3410', border: '#F5B47A' },
	},
}));

import { getMealColor } from '@/_theme/colors';

describe('MealEventCard', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('calls getMealColor with event name', () => {
		const event = { id: '1', name: 'Breakfast' };
		render(<MealEventCard event={event} />);
		expect(getMealColor).toHaveBeenCalledWith('Breakfast');
	});

	it('calls onClick when clicked', () => {
		const event = { id: '1', name: 'Breakfast' };
		const onClick = vi.fn();
		render(<MealEventCard event={event} onClick={onClick} />);
		fireEvent.click(screen.getByText('Breakfast'));
		expect(onClick).toHaveBeenCalledWith(event);
	});

	it('renders description when present and omits it when absent', () => {
		const eventWithDescription = {
			id: '1',
			name: 'Breakfast',
			description: 'Eggs and toast',
		};
		const { rerender } = render(<MealEventCard event={eventWithDescription} />);
		expect(screen.getByText('Eggs and toast')).toBeDefined();

		const eventWithoutDescription = { id: '1', name: 'Breakfast' };
		rerender(<MealEventCard event={eventWithoutDescription} />);
		expect(screen.queryByText('Eggs and toast')).toBeNull();
	});
});
