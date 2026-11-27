import { render } from '@testing-library/react';
import { beforeEach, describe, it, vi } from 'vitest';

import { MealCardWithDragHandle } from './MealCardWithDragHandle';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('../../Calendar/MealCard/MealCard', () => ({
	MealCard: vi.fn(() => <div data-testid="meal-card" />),
}));

describe('MealCardWithDragHandle', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders (coverage only, no logic)', () => {
		render(
			<MealCardWithDragHandle
				meal={{
					id: 'meal-1',
					date: '2024-06-15',
					name: 'Grilled Salmon',
					borderColor: '#F5B47A',
					dishes: [],
				}}
				plannerId="planner-1"
			/>,
		);
	});
});
